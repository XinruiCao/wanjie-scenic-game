import type { Platform, VideoEvents, Viewport } from './platform'

interface NativeVideo {
  src: string; muted: boolean; autoplay: boolean; loop: boolean; width: number; height: number
  play(): void; pause(): void; destroy(): void
  paintTo(canvas: HTMLCanvasElement, dx: number, dy: number, sx: number, sy: number, sw: number, sh: number): void
  onCanplay(cb: (ratio: number) => void): void
  onCandraw(cb: (ratio: number) => void): void
  onEnded(cb: () => void): void
  onError(cb: (message: string) => void): void
  onTimeUpdate(cb: (value: { position: number; duration: number }) => void): void
}
export interface LaunchOptions { launch_from?: string; location?: string; scene?: string }
interface TouchEvent { touches: Array<{ clientX: number; clientY: number }>; changedTouches: Array<{ clientX: number; clientY: number }> }
export interface DouyinAPI {
  canIUse?: (feature:string)=>boolean
  setDeviceOrientation?: (options:{value:'portrait'|'landscape';success:()=>void;fail:()=>void})=>void
  onDeviceOrientationChange?: (callback:()=>void)=>void
  startAccelerometer?: (options:{success:()=>void;fail:()=>void})=>void
  stopAccelerometer?: (options:Record<string,never>)=>void
  onAccelerometerChange?: (callback:(sample:{x:number;y:number;z:number})=>void)=>void
  offAccelerometerChange?: (callback:(sample:{x:number;y:number;z:number})=>void)=>void
  createCanvas(): HTMLCanvasElement
  createImage(): HTMLImageElement
  createOffscreenVideo?: () => NativeVideo
  getSystemInfoSync(): { windowWidth: number; windowHeight: number; pixelRatio: number; safeArea?: { top: number; bottom: number } }
  getMenuButtonBoundingClientRect?: () => { bottom: number }
  getStorageSync(key: string): unknown
  setStorageSync(key: string, value: unknown): void
  showToast(options: { title: string; icon: 'none' }): void
  showModal(options: { title: string; content: string; confirmText: string; cancelText: string; success: (res: { confirm: boolean }) => void; fail: () => void }): void
  checkScene?: (options: { scene: 'sidebar'; success: (res: { isExist?: boolean }) => void; fail: () => void }) => void
  navigateToScene?: (options: { scene: 'sidebar'; fail: () => void }) => void
  shareAppMessage?: (options: { title: string; query: string; fail: () => void }) => void
  onShow(cb: (options: LaunchOptions) => void): void
  onHide(cb: () => void): void
  onTouchStart(cb: (e: TouchEvent) => void): void
  onTouchMove(cb: (e: TouchEvent) => void): void
  onTouchEnd(cb: (e: TouchEvent) => void): void
  onTouchCancel(cb: (e: TouchEvent) => void): void
  onWindowResize?: (cb: () => void) => void
}

export function nativePlatform(tt: DouyinAPI): Platform {
  const canvas = tt.createCanvas()
  const toast = (message: string) => tt.showToast({ title: message, icon: 'none' })
  return {
    canvas,
    viewport(): Viewport {
      const info = tt.getSystemInfoSync()
      let menuBottom = 0
      try { menuBottom = tt.getMenuButtonBoundingClientRect?.().bottom || 0 } catch { /* older hosts */ }
      return {
        width: info.windowWidth, height: info.windowHeight, dpr: info.pixelRatio,
        top: Math.max(info.safeArea?.top || 24, menuBottom) + 10,
        bottom: Math.max(0, info.windowHeight - (info.safeArea?.bottom || info.windowHeight)),
      }
    },
    storage: { get: key => tt.getStorageSync(key), set: (key, value) => tt.setStorageSync(key, value) },
    loadImage: src => new Promise((resolve, reject) => {
      const image = tt.createImage(); image.onload = () => resolve(image); image.onerror = reject; image.src = src
    }),
    video(src: string, muted: boolean, events: VideoEvents) {
      if (!tt.createOffscreenVideo) throw new Error('This host does not support video')
      const video = tt.createOffscreenVideo()
      let ratio = 16 / 9, canPlay = false, canDraw = false, wantsPlay = false, destroyed = false
      video.muted = muted; video.autoplay = false; video.loop = false
      video.onCanplay(scale => {
        if (destroyed) return
        if (scale > 0) ratio = scale
        canPlay = true
        if (wantsPlay) video.play()
      })
      video.onCandraw(scale => {
        if (destroyed) return
        if (scale > 0) ratio = scale
        canDraw = true; events.ready()
      })
      video.onEnded(() => { if (!destroyed) events.ended() })
      video.onError(message => { if (!destroyed) events.error(message) })
      video.onTimeUpdate(({ position, duration }) => { if (!destroyed) events.progress(position, duration) })
      video.src = src
      return {
        play() { wantsPlay = true; if (canPlay && !destroyed) video.play() },
        pause() { wantsPlay = false; if (!destroyed) video.pause() },
        destroy() { if (destroyed) return; destroyed = true; wantsPlay = false; video.destroy() },
        paint(rect, scale) {
          if (destroyed || !canDraw) return
          // Contain the entire film frame; the choice controls stay below the video.
          const width = Math.min(rect.w, rect.h * ratio) * scale, height = width / ratio
          video.width = width; video.height = height
          const ctx = canvas.getContext('2d')!
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0)
          ctx.fillStyle = '#101718'; ctx.fillRect(rect.x * scale, rect.y * scale, rect.w * scale, rect.h * scale)
          try {
            video.paintTo(canvas, (rect.x + rect.w / 2) * scale - width / 2, (rect.y + rect.h / 2) * scale - height / 2, 0, 0, width, height)
          } finally { ctx.restore() }
        },
      }
    },
    toast,
    confirm: (title, content) => new Promise(resolve => {
      tt.showModal({ title, content, confirmText: '开启旅程', cancelText: '继续当前', success: result => resolve(result.confirm), fail: () => resolve(false) })
    }),
    sidebar: tt.navigateToScene ? () => {
      const navigate = () => tt.navigateToScene?.({ scene: 'sidebar', fail: () => toast('暂时无法打开侧边栏，请稍后再试') })
      if (tt.checkScene) tt.checkScene({ scene: 'sidebar', success: result => result.isExist === true ? navigate() : toast('当前宿主暂不支持侧边栏'), fail: () => toast('侧边栏暂不可用') })
      else toast('请升级抖音后使用侧边栏')
    } : undefined,
    share: tt.shareAppMessage ? () => tt.shareAppMessage?.({ title: '每一次选择，都通往不同的未来。来万界景区开启你的旅程。', query: 'from=journey', fail: () => toast('分享未完成，你的进度已经保存') }) : undefined,
  }
}
