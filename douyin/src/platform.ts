export interface Rect { x: number; y: number; w: number; h: number }
export interface Viewport { width: number; height: number; dpr: number; top: number; bottom: number }
export interface StoragePort { get(key: string): unknown; set(key: string, value: unknown): void }
export interface VideoPort {
  play(): void
  pause(): void
  destroy(): void
  paint(rect: Rect, scale: number): void
}
export interface VideoEvents {
  ready(): void
  ended(): void
  error(message: string): void
  progress(time: number, duration: number): void
}
export interface HitTarget extends Rect { id: string; label: string; disabled?: boolean; action(): void }
export interface Platform {
  canvas: HTMLCanvasElement
  viewport(): Viewport
  storage: StoragePort
  loadImage(src: string): Promise<HTMLImageElement>
  video(src: string, muted: boolean, events: VideoEvents): VideoPort
  toast(message: string): void
  confirm(title: string, message: string): Promise<boolean>
  sidebar?: () => void
  share?: () => void
  targets?(targets: HitTarget[]): void
}
export interface ReleaseConfig {
  appid: string
  projectName: string
  mode: string
  videoBaseUrl: string
  videos: Record<string, string>
  contentReady: boolean
}
