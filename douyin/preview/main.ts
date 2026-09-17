import { GameApp } from '../src/app'
import release from '../config/release.json'
import type { Platform, HitTarget } from '../src/platform'

const canvas = document.querySelector('canvas')!
const device = document.querySelector<HTMLElement>('#device')!
const controls = document.querySelector<HTMLElement>('#controls')!
const live = document.querySelector<HTMLElement>('#live')!
let app: GameApp
let targetSignature = ''
const platform: Platform = {
  canvas,
  viewport: () => ({ width: device.clientWidth, height: device.clientHeight, dpr: devicePixelRatio, top: device.clientWidth > device.clientHeight ? 10 : 48, bottom: 24 }),
  storage: { get: key => localStorage.getItem(key), set: (key, value) => localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)) },
  loadImage: src => new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = reject; im.src = '/' + src }),
  video(src, muted, events) {
    const video = document.createElement('video')
    video.playsInline = true; video.muted = muted; video.preload = 'auto'; video.crossOrigin = 'anonymous'
    let destroyed = false
    video.addEventListener('loadeddata', () => { if (!destroyed) events.ready() })
    video.addEventListener('ended', () => { if (!destroyed) events.ended() })
    video.addEventListener('error', () => { if (!destroyed) events.error('视频加载失败') })
    video.addEventListener('timeupdate', () => { if (!destroyed) events.progress(video.currentTime, video.duration) })
    video.src = src
    return {
      play() { if (!destroyed) void video.play().catch(() => { if (!destroyed) events.error('浏览器阻止了视频播放') }) },
      pause() { video.pause() },
      destroy() { destroyed = true; video.pause(); video.removeAttribute('src'); video.load() },
      paint(r) {
        if (video.readyState < 2 || destroyed) return
        const ratio = video.videoWidth / video.videoHeight, w = Math.min(r.w, r.h * ratio), h = w / ratio
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#101718'; ctx.fillRect(r.x, r.y, r.w, r.h)
        ctx.drawImage(video, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h)
      },
    }
  },
  toast: message => { live.textContent = message },
  confirm: (title, content) => new Promise(resolve => {
    const dialog = document.querySelector('dialog')!
    dialog.querySelector('h2')!.textContent = title; dialog.querySelector('p')!.textContent = content
    const finish = (accepted: boolean) => { dialog.close(); dialog.oncancel = null; resolve(accepted) }
    dialog.querySelectorAll('button').forEach(button => { button.onclick = () => finish(button.value === 'confirm') })
    dialog.oncancel = () => finish(false); dialog.showModal()
  }),
  targets(targets: HitTarget[]) {
    canvas.setAttribute('aria-label', app?.page === 'home' ? '万界景区 · 剧情试玩首页' : `${app?.page === 'play' ? app.node.title : '万界景区 · ' + app?.page}`)
    const signature = JSON.stringify(targets.map(({ id, label, x, y, w, h, disabled }) => ({ id, label, x, y, w, h, disabled })))
    if (signature === targetSignature) return
    targetSignature = signature
    controls.replaceChildren(...targets.map(t => {
      const button = document.createElement('button')
      button.textContent = t.label; button.dataset.action = t.id; button.disabled = !!t.disabled
      Object.assign(button.style, { left: t.x + 'px', top: t.y + 'px', width: t.w + 'px', height: t.h + 'px' })
      button.addEventListener('click', () => app.activate(t.id))
      return button
    }))
  },
}
app = new GameApp(platform, release)
const point = (event: PointerEvent) => { const bounds = device.getBoundingClientRect(); return [event.clientX - bounds.left, event.clientY - bounds.top] as const }
device.addEventListener('pointerdown', event => { device.setPointerCapture(event.pointerId); app.touch('start', ...point(event)) })
device.addEventListener('pointermove', event => app.touch('move', ...point(event)))
device.addEventListener('pointerup', event => app.touch('end', ...point(event)))
device.addEventListener('pointercancel', event => app.touch('cancel', ...point(event)))
device.addEventListener('wheel', event => { event.preventDefault(); app.scrollBy(event.deltaY) }, { passive: false })
device.addEventListener('keydown', event => {
  if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); app.scrollBy(event.key.includes('Down') ? 100 : -100) }
})
new ResizeObserver(() => app.resize()).observe(device)
document.addEventListener('visibilitychange', () => app.background(document.hidden))
window.addEventListener('pagehide', () => app.background(true))
const loop = () => { app.frame(Date.now()); requestAnimationFrame(loop) }
requestAnimationFrame(loop)
