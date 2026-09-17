import type { Platform, Rect, VideoPort } from './platform'

// Each node owns one decoder. Late callbacks from destroyed videos cannot advance a new node.
export class Movie {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error' | 'demo' = 'idle'
  message = ''
  time = 0
  duration = 0
  private port?: VideoPort
  private generation = 0
  private stalledMs = 0
  private suspended = false
  private userPaused = false
  constructor(private platform: Pick<Platform, 'video'>, private ended: () => void) {}
  open(src: string, demo: boolean, muted: boolean) {
    this.close()
    if (!src) {
      this.status = demo ? 'demo' : 'error'
      this.message = demo ? '剧情演示 · 影像待接入' : '本段影像尚未配置'
      return
    }
    const token = this.generation
    this.status = 'loading'
    const current = () => token === this.generation
    try {
      this.port = this.platform.video(src, muted, {
        ready: () => {
          if (!current()) return
          this.stalledMs = 0
          this.status = this.suspended || this.userPaused ? 'paused' : 'playing'
          if (this.status === 'paused') this.port?.pause()
        },
        progress: (time, duration) => {
          if (!current()) return
          if (time !== this.time) this.stalledMs = 0
          this.time = time; this.duration = duration
        },
        ended: () => {
          if (!current() || this.status === 'ended' || this.status === 'error') return
          this.status = 'ended'
          this.ended()
        },
        error: () => { if (current()) this.fail('影像暂时无法播放，请检查网络后重试') },
      })
      this.port.play()
    } catch { this.fail('当前环境无法播放这段影像') }
  }
  tick(ms: number) {
    if (this.suspended || this.userPaused || !['loading', 'playing'].includes(this.status)) return
    this.stalledMs += ms
    if (this.stalledMs >= 15000) this.fail('加载时间较长，请检查网络后重试')
  }
  private fail(message: string) {
    this.generation++
    this.port?.destroy(); this.port = undefined
    this.status = 'error'; this.message = message
  }
  toggle() {
    if (!['playing', 'paused'].includes(this.status)) return
    this.userPaused = !this.userPaused
    if (this.userPaused) { this.port?.pause(); this.status = 'paused' }
    else if (!this.suspended) { this.port?.play(); this.status = 'playing' }
  }
  background(hidden: boolean) {
    this.suspended = hidden
    if (!this.port || !['playing', 'paused', 'loading'].includes(this.status)) return
    if (hidden) this.port.pause()
    else if (!this.userPaused) this.port.play()
  }
  paint(rect: Rect, scale: number) {
    if (['playing', 'paused', 'ended'].includes(this.status)) {
      try { this.port?.paint(rect, scale) } catch { this.fail('影像暂时无法绘制，请重试') }
    }
  }
  close() {
    this.generation++
    this.port?.destroy(); this.port = undefined
    this.status = 'idle'; this.time = 0; this.duration = 0; this.stalledMs = 0; this.userPaused = false
  }
}
