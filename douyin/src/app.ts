import { story } from '../../src/data/story'
import { endingDefinitions } from '../../src/data/endings'
import { themes } from '../../src/config/themes'
import { framePolygon, type FrameShape } from '../../src/config/scenic-frame-shapes'
import { art } from './art'
import { Session } from './session'
import { Movie } from './movie'
import type { Platform, Rect, HitTarget, ReleaseConfig } from './platform'

type Page = 'home' | 'play' | 'journal' | 'endings' | 'settings'
const W = 390
const serif = '"Songti SC", "STSong", serif'
const sans = 'sans-serif'
const palettes = {
  light: { bg: '#f1eee5', ink: '#253b40', muted: '#67767a', accent: '#427f8c', line: '#b6c4bd', card: '#faf7ef', fill: '#dae6e4' },
  dark: { bg: '#171d1e', ink: '#efe1c9', muted: '#b3ab98', accent: '#d5b171', line: '#64583e', card: '#212728', fill: '#35362e' },
}
export class GameApp {
  readonly session: Session
  readonly movie: Movie
  page: Page = 'home'
  targets: HitTarget[] = []
  private ctx: CanvasRenderingContext2D
  private images: Record<string, HTMLImageElement> = {}
  private height = 844
  private scale = 1
  private pixelScale = 1
  private top = 56
  private bottom = 24
  private scroll = 0
  private maxScroll = 0
  private scrollArea?: Rect
  private scrollBounds?: Rect
  private down?: { x: number; y: number; lastY: number; moved: boolean; scrollable: boolean }
  private lastAction = 0
  private foreground = true
  private lastFrame = 0
  private lastPaint = 0
  private dirty = true
  private remaining = 0
  private assetErrors = 0
  private toastUntil = 0
  private toastText = ''
  private toastVisible = false
  private movieStatus = ''
  constructor(readonly platform: Platform, config: ReleaseConfig) {
    const ctx = platform.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D is required')
    this.ctx = ctx
    this.session = new Session(platform.storage, config)
    this.movie = new Movie(platform, () => {
      if (this.page === 'play' && this.node.type === 'VIDEO') this.transition(() => this.session.engine.advance())
    })
    this.resize()
    for (const [key, src] of Object.entries(art)) {
      platform.loadImage(src).then(image => { this.images[key] = image; this.dirty = true }).catch(() => { this.assetErrors++; this.dirty = true })
    }
  }
  get node() { return this.session.engine.getNode() }
  get colors() { return palettes[this.session.skin] }
  resize() {
    const v = this.platform.viewport()
    this.scale = v.width / W
    this.height = v.height / this.scale
    this.top = Math.max(48, v.top / this.scale)
    this.bottom = Math.max(16, v.bottom / this.scale)
    this.pixelScale = this.scale * Math.min(2, v.dpr || 1)
    this.platform.canvas.width = Math.round(W * this.pixelScale)
    this.platform.canvas.height = Math.round(this.height * this.pixelScale)
    this.dirty = true
  }
  frame(now: number) {
    if (!this.foreground) { this.lastFrame = 0; return }
    const dt = this.lastFrame ? Math.min(200, now - this.lastFrame) : 0
    this.lastFrame = now
    this.movie.tick(dt)
    if (this.movieStatus !== this.movie.status) { this.movieStatus = this.movie.status; this.dirty = true }
    const showingToast = now < this.toastUntil
    if (showingToast !== this.toastVisible) { this.toastVisible = showingToast; this.dirty = true }
    if (this.page === 'play' && this.remaining > 0) {
      this.remaining = Math.max(0, this.remaining - dt / 1000)
      if (!this.remaining) {
        const choices = this.session.engine.getVisibleChoices()
        const choice = choices.find(c => c.defaultChoice && !c.disabled) || choices.find(c => !c.disabled)
        if (choice) this.transition(() => this.session.engine.applyChoice(choice.id))
      }
      this.dirty = true
    }
    const animate = (this.page === 'home' && !this.session.reducedMotion) || ['loading', 'playing'].includes(this.movie.status) || now < this.toastUntil
    if ((this.dirty || animate) && now - this.lastPaint >= 32) { this.render(now); this.lastPaint = now; this.dirty = false }
  }
  background(hidden: boolean) {
    this.foreground = !hidden
    this.movie.background(hidden)
    if (hidden) this.session.save()
    else { this.lastFrame = 0; this.dirty = true }
  }
  notify(message: string) {
    this.toastText = message; this.toastUntil = Date.now() + 3500; this.dirty = true
    this.platform.toast(message)
  }
  private show(page: Page) {
    this.movie.close(); this.page = page; this.scroll = 0; this.dirty = true
    if (page === 'play') this.enterNode()
  }
  private enterNode() {
    this.scroll = 0
    this.remaining = this.node.choices?.length ? this.node.countdown || 0 : 0
    if (this.node.type === 'VIDEO') this.movie.open(this.session.videoUrl(this.node.id), this.session.config.mode === 'demo', this.session.muted)
    else this.movie.close()
    this.dirty = true
  }
  private transition(action: () => unknown) {
    try {
      action(); this.enterNode()
      if (this.session.unlockNotice) { this.session.unlockNotice = false; this.notify('序章已通关 · 余烬鎏金皮肤已解锁') }
    } catch (error) { this.notify(error instanceof Error ? error.message : '暂时无法前往这段剧情') }
  }
  private start() {
    if (this.session.state.hasSave) this.session.engine.continueGame()
    else this.session.engine.startNewGame()
    this.show('play')
  }
  private async restart() {
    if (this.session.state.hasSave && !await this.platform.confirm('开启新的旅程？', '本周目会留在历程中。已解锁的结局和皮肤会保留。')) return
    this.session.engine.startNewGame(); this.show('play')
  }
  touch(kind: 'start' | 'move' | 'end' | 'cancel', screenX: number, screenY: number) {
    const x = screenX / this.scale, y = screenY / this.scale
    if (kind === 'start') this.down = { x, y, lastY: y, moved: false, scrollable: !!this.scrollBounds && this.inside(this.scrollBounds, x, y) }
    if (kind === 'cancel') this.down = undefined
    if (kind === 'move' && this.down) {
      if (Math.hypot(x - this.down.x, y - this.down.y) > 8) this.down.moved = true
      if (this.down.moved && this.down.scrollable) this.scrollBy(this.down.lastY - y)
      this.down.lastY = y
    }
    if (kind === 'end' && this.down) {
      const tap = !this.down.moved && Math.hypot(x - this.down.x, y - this.down.y) <= 8
      this.down = undefined
      if (tap) {
        const target = [...this.targets].reverse().find(t => !t.disabled && this.inside(t, x, y))
        if (target) this.activate(target.id)
      }
    }
  }
  activate(id: string) {
    const now = Date.now()
    if (now - this.lastAction < 280) return
    const target = this.targets.find(t => t.id === id && !t.disabled)
    if (target) { this.lastAction = now; target.action(); this.render(now); this.dirty = true }
  }
  scrollBy(delta: number) { this.scroll = Math.min(this.maxScroll, Math.max(0, this.scroll + delta)); this.dirty = true }
  private inside(r: Rect, x: number, y: number) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h }
  private text(text: string, x: number, y: number, size = 14, color = this.colors.ink, font = sans, align: CanvasTextAlign = 'left') {
    this.ctx.font = `${size}px ${font}`; this.ctx.fillStyle = color; this.ctx.textAlign = align; this.ctx.textBaseline = 'top'
    this.ctx.fillText(text, x, y)
  }
  private lines(text: string, width: number, size = 16, font = sans) {
    this.ctx.font = `${size}px ${font}`
    const lines: string[] = []; let line = ''
    for (const char of text) {
      if (char === '\n') { lines.push(line); line = ''; continue }
      if (line && this.ctx.measureText(line + char).width > width) { lines.push(line); line = char }
      else line += char
    }
    if (line) lines.push(line)
    return lines
  }
  private paragraph(text: string, x: number, y: number, width: number, size = 15, color = this.colors.ink, lineHeight = 26, font = sans) {
    const lines = this.lines(text, width, size, font)
    lines.forEach((line, i) => this.text(line, x, y + i * lineHeight, size, color, font))
    return lines.length * lineHeight
  }
  private rect(x: number, y: number, w: number, h: number, fill: string, stroke?: string) {
    this.ctx.fillStyle = fill; this.ctx.fillRect(x, y, w, h)
    if (stroke) { this.ctx.strokeStyle = stroke; this.ctx.lineWidth = 1; this.ctx.strokeRect(x + .5, y + .5, w - 1, h - 1) }
  }
  private image(key: string, r: Rect, fit: 'cover' | 'contain' = 'contain', focus = .5, alpha = 1) {
    const im = this.images[key]; if (!im) return
    const iw = im.width, ih = im.height
    this.ctx.save(); this.ctx.globalAlpha = alpha
    if (fit === 'cover') {
      const s = Math.max(r.w / iw, r.h / ih), sw = r.w / s, sh = r.h / s
      this.ctx.drawImage(im, (iw - sw) * focus, (ih - sh) * .4, sw, sh, r.x, r.y, r.w, r.h)
    } else {
      const s = Math.min(r.w / iw, r.h / ih)
      this.ctx.drawImage(im, r.x + (r.w - iw * s) / 2, r.y + (r.h - ih * s) / 2, iw * s, ih * s)
    }
    this.ctx.restore()
  }
  private frameArt(key: string, r: Rect, edge = 22) {
    const im = this.images[key]; if (!im) return
    const sx = Math.round(im.width * .17), sy = Math.round(im.height * .27)
    const xs = [0, sx, im.width - sx, im.width], ys = [0, sy, im.height - sy, im.height]
    const dx = [r.x, r.x + edge, r.x + r.w - edge, r.x + r.w], dy = [r.y, r.y + edge, r.y + r.h - edge, r.y + r.h]
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) {
      if (x === 1 && y === 1) continue
      this.ctx.drawImage(im, xs[x], ys[y], xs[x + 1] - xs[x], ys[y + 1] - ys[y], dx[x], dy[y], dx[x + 1] - dx[x], dy[y + 1] - dy[y])
    }
  }
  private frameInterior(kind: 'button' | 'panel', r: Rect, edge: number, draw: () => void) {
    const key: FrameShape = `${this.session.skin}-${kind}`
    const im = this.images[key]
    const points = framePolygon(key, r.w, r.h, {
      x: im ? Math.round(im.width * .17) / im.width : .17,
      y: im ? Math.round(im.height * .27) / im.height : .27,
      edgeX: edge, edgeY: edge,
    })
    this.ctx.save(); this.ctx.beginPath()
    points.forEach(([x, y], i) => i ? this.ctx.lineTo(r.x + x, r.y + y) : this.ctx.moveTo(r.x + x, r.y + y))
    this.ctx.closePath(); this.ctx.clip()
    try { draw() } finally { this.ctx.restore() }
  }
  private target(id: string, label: string, r: Rect, action: () => void, disabled = false) {
    let visible = r
    if (this.scrollArea) {
      const y = Math.max(r.y, this.scrollArea.y), bottom = Math.min(r.y + r.h, this.scrollArea.y + this.scrollArea.h)
      if (bottom <= y) return
      visible = { ...r, y, h: bottom - y }
    }
    this.targets.push({ ...visible, id, label, disabled, action })
  }
  private button(id: string, label: string, r: Rect, action: () => void, primary = false, disabled = false, letter = '') {
    const c = this.colors
    this.ctx.save(); this.ctx.globalAlpha = disabled ? .4 : 1
    this.frameInterior('button', r, 22, () => this.rect(r.x, r.y, r.w, r.h, primary ? (this.session.skin === 'dark' ? '#643633' : '#326878') : c.card))
    this.frameArt(`${this.session.skin}-button`, r, 22)
    const lines = this.lines(label, r.w - (letter ? 75 : 48), 16, serif)
    const y = r.y + (r.h - lines.length * 23) / 2
    if (letter) this.text(letter, r.x + 19, r.y + (r.h - 25) / 2, 25, c.accent, serif)
    lines.forEach((line, i) => this.text(line, letter ? r.x + 55 : r.x + r.w / 2, y + i * 23, 16, primary ? '#fbf2df' : c.ink, serif, letter ? 'left' : 'center'))
    this.ctx.restore()
    this.target(id, label, r, action, disabled)
  }
  private link(id: string, label: string, x: number, y: number, w: number, action: () => void, color = this.colors.muted) {
    this.text(label, x + w / 2, y + 15, 12, color, sans, 'center')
    const hitHeight = Math.max(44, 44 / this.scale)
    this.target(id, label, { x, y: y - (hitHeight - 44) / 2, w, h: hitHeight }, action)
  }
  private beginScroll(y: number, bottom: number) {
    this.scrollArea = { x: 18, y, w: W - 36, h: Math.max(40, bottom - y) }
    this.scrollBounds = this.scrollArea
    this.ctx.save(); this.ctx.beginPath(); this.ctx.rect(0, y, W, this.scrollArea.h); this.ctx.clip()
    return y - this.scroll
  }
  private endScroll(contentBottom: number) {
    const r = this.scrollArea!
    this.maxScroll = Math.max(0, contentBottom + this.scroll - r.y - r.h)
    this.scroll = Math.min(this.scroll, this.maxScroll)
    this.ctx.restore()
    if (this.maxScroll > 0) {
      this.rect(W - 8, r.y, 2, r.h, this.colors.line)
      this.rect(W - 8, r.y + this.scroll / this.maxScroll * (r.h - 32), 2, 32, this.colors.accent)
    }
    this.scrollArea = undefined
  }
  private header(title: string, kicker: string) {
    this.link('home', '‹ 返回', 12, this.top, 66, () => this.show('home'))
    this.text(kicker, 94, this.top + 4, 9, this.colors.muted)
    this.text(title, 94, this.top + 21, 19, this.colors.ink, serif)
    this.rect(24, this.top + 57, W - 48, 1, this.colors.line)
  }
  render(now = Date.now()) {
    const ctx = this.ctx
    ctx.setTransform(this.pixelScale, 0, 0, this.pixelScale, 0, 0)
    this.targets = []; this.scrollArea = undefined; this.scrollBounds = undefined; this.maxScroll = 0
    this.rect(0, 0, W, this.height, this.colors.bg)
    this.image('grain', { x: 0, y: 0, w: W, h: this.height }, 'cover', .5, .2)
    if (this.page === 'home') this.home(now)
    else if (this.page === 'play') this.play()
    else if (this.page === 'journal') this.journal()
    else if (this.page === 'endings') this.endings()
    else this.settings()
    if (this.session.saveError) {
      this.rect(12, this.height - this.bottom - 38, W - 24, 34, '#763c2e')
      this.text('保存提示 · 点此重试', W / 2, this.height - this.bottom - 28, 12, '#fff3de', sans, 'center')
      this.target('retry-save', this.session.saveError, { x: 12, y: this.height - this.bottom - 42, w: W - 24, h: 44 }, () => { this.session.save(); this.notify(this.session.saveError || '进度已保存') })
    }
    if (Date.now() < this.toastUntil) {
      this.rect(18, this.top + 60, W - 36, 48, '#203d3f')
      this.paragraph(this.toastText, 32, this.top + 69, W - 64, 12, '#fff4dc', 19)
    }
    this.platform.targets?.(this.targets.map(t => ({ ...t, x: t.x * this.scale, y: t.y * this.scale, w: t.w * this.scale, h: t.h * this.scale })))
  }
  private home(now: number) {
    const H = this.height, c = this.colors, dark = this.session.skin === 'dark'
    const heroH = Math.max(this.top + 134, H - this.bottom - 362)
    this.image('hero', { x: 0, y: 0, w: W, h: heroH + 90 }, 'cover', .76)
    const shade = this.ctx.createLinearGradient(0, 0, 0, heroH + 90)
    shade.addColorStop(0, dark ? '#11171785' : '#d6e4e02e'); shade.addColorStop(.5, '#17292c00'); shade.addColorStop(1, c.bg)
    this.ctx.fillStyle = shade; this.ctx.fillRect(0, 0, W, heroH + 90)
    this.text('青 崖 山  /  Q I N G Y A', 25, this.top + 2, 10, dark ? '#ecd5ad' : '#263f41')
    this.text('一 张 通 往 新 世 界 的 入 场 券', 25, this.top + 22, 9, dark ? '#ddd0b8' : '#334a4c')
    this.image('seal', { x: W - 73, y: this.top + 5, w: 48, h: 48 }, 'contain', .5, .7)
    this.image(`${this.session.skin}-title`, { x: 21, y: heroH - 69, w: W - 42, h: 120 })
    this.image('gold-flare', { x: 42, y: heroH + 40, w: W - 84, h: 24 }, 'contain', .5, .65)
    this.text('废墟之上，重建人间值得的风景。', W / 2, heroH + 67, 13, c.ink, serif, 'center')
    const mainY = heroH + 103
    this.button('start', this.session.state.hasSave ? '继续旅程  ›' : '开启旅程  ›', { x: 42, y: mainY, w: W - 84, h: 58 }, () => this.start(), true)
    const saveLabel = this.session.state.hasSave ? `已保存 · ${this.node.title || '当前剧情'}` : '轻触开始 · 每一次选择，都通往不同的未来'
    const label = this.lines(saveLabel, W - 48, 11)[0]
    this.text(label, W / 2, mainY + 66, 11, c.muted, sans, 'center')
    const navY = mainY + 102
    ;[['icon-routes', '旅程回顾', 'journal'], ['icon-gallery', '结局收藏', 'endings'], ['icon-archive', '旅程设置', 'settings']].forEach(([icon, label, page], i) => {
      const x = 37 + i * 109
      this.rect(x, navY, 98, 80, c.card, c.line)
      this.image(icon, { x: x + 31, y: navY + 9, w: 36, h: 36 })
      this.text(label, x + 49, navY + 55, 12, c.ink, serif, 'center')
      this.target(page, label, { x, y: navY, w: 98, h: 80 }, () => this.show(page as Page))
    })
    const footerY = navY + 91
    this.link('skin', this.session.state.metaFlags.darkSkinUnlocked ? `${themes[this.session.skin].name} · 切换外观` : '余烬鎏金 · 序章通关后解锁', 35, footerY, W - 70, () => {
      if (!this.session.switchSkin()) this.notify('完成序章「命运裂缝」的选择后解锁黑金皮肤')
    })
    this.text(this.session.config.mode === 'demo' ? '剧情流程试玩  /  正式影像待接入' : 'STILL BEAUTIFUL · 青崖山景区', W / 2, H - this.bottom - 10, 9, c.muted, sans, 'center')
    if (!this.session.reducedMotion) {
      this.ctx.save(); this.ctx.fillStyle = dark ? '#f9dca8' : '#fff8e7'
      for (let i = 0; i < 14; i++) {
        const x = (i * 79 + Math.sin(now / 4200 + i) * 12) % W
        const y = 110 + ((i * 47 - now / (130 + i * 10)) % Math.max(120, heroH - 120) + Math.max(120, heroH - 120)) % Math.max(120, heroH - 120)
        this.ctx.globalAlpha = .18 + (Math.sin(now / 1100 + i) + 1) * .15
        this.ctx.beginPath(); this.ctx.arc(x, y, i % 3 === 0 ? 1.6 : .9, 0, Math.PI * 2); this.ctx.fill()
      }
      this.ctx.restore()
    }
  }
  private play() {
    const n = this.node, c = this.colors
    this.header(n.type === 'ENDING' ? '旅程落款' : n.type === 'ROUTE_CLOSED' ? '未完的岔路' : '你的故事', `${this.session.state.currentChapterId}  /  第 ${this.session.state.playthrough} 次旅程`)
    if (n.type === 'ENDING' || n.type === 'ROUTE_CLOSED') { this.result(); return }
    const videoY = this.top + 73, videoH = Math.min(230, this.height * .28)
    const r = { x: 18, y: videoY, w: W - 36, h: videoH }
    const poster = n.id.includes('TRUE') ? 'ending' : n.id.startsWith('V_D') ? 'hospital' : 'engagement'
    this.frameInterior('panel', r, 18, () => {
      this.image(poster, r, 'cover')
      this.movie.paint(r, this.pixelScale)
    })
    this.frameArt(`${this.session.skin}-panel`, r, 18)
    this.rect(27, videoY + 11, 151, 23, '#152d31d9')
    this.text(this.session.config.mode === 'demo' ? '剧 情 流 程 演 示' : 'WORLDS UNLOCKED', 39, videoY + 17, 10, '#efe6d4')
    if (this.movie.status === 'loading') {
      this.rect(75, videoY + videoH / 2 - 20, W - 150, 40, '#172c30e8')
      this.text('正在载入这段故事…', W / 2, videoY + videoH / 2 - 7, 13, '#f7eedc', sans, 'center')
    }
    const contentY = videoY + videoH + 18
    let y = this.beginScroll(contentY, this.height - this.bottom - 60)
    if (n.choices?.length) {
      this.text(this.remaining > 0 ? `做出选择  ·  ${Math.ceil(this.remaining)} 秒` : '这一刻，由你决定', 26, y, 11, c.accent)
      y += 25
      y += this.paragraph(n.title || '你会怎么选？', 26, y, W - 52, 23, c.ink, 32, serif) + 20
      this.session.engine.getVisibleChoices().forEach((choice, i) => {
        const h = Math.max(58, this.lines(choice.text, W - 125, 16, serif).length * 23 + 26)
        this.button(choice.id, choice.text, { x: 22, y, w: W - 44, h }, () => this.transition(() => this.session.engine.applyChoice(choice.id)), false, choice.disabled, String.fromCharCode(65 + i))
        y += h + 10
      })
      this.text('选择将自动保存，稍后也能继续。', 26, y + 5, 11, c.muted); y += 36
    } else {
      this.text(n.type === 'PAGE' ? (n.page === 'evidence' ? '发现线索' : n.page === 'phone' ? '收到来信' : '故事手记') : '正在发生', 26, y, 11, c.accent); y += 26
      y += this.paragraph(n.title || '', 26, y, W - 52, 24, c.ink, 35, serif) + 18
      if (n.description) y += this.paragraph(n.description, 26, y, W - 52, 16, c.muted, 29) + 20
      if (n.type === 'VIDEO') {
        if (this.movie.status === 'demo') {
          this.text('影像待接入，可先体验剧情与分支。', 26, y, 12, c.muted); y += 37
          this.button('advance', '继续剧情  ›', { x: 24, y, w: W - 48, h: 58 }, () => this.transition(() => this.session.engine.advance()), true); y += 74
        } else if (this.movie.status === 'error') {
          y += this.paragraph(this.movie.message, 26, y, W - 52, 14, c.muted, 25) + 15
          this.button('retry-video', '重新加载影像', { x: 24, y, w: W - 48, h: 58 }, () => this.enterNode()); y += 74
        } else {
          this.button('pause', this.movie.status === 'paused' ? '继续播放' : '暂停播放', { x: 24, y, w: W - 48, h: 58 }, () => this.movie.toggle(), false, this.movie.status === 'loading'); y += 75
          const time = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`
          this.text(`${time(this.movie.time)}  /  ${time(this.movie.duration)}`, W / 2, y, 12, c.muted, sans, 'center'); y += 28
        }
      } else {
        this.button('advance', n.payloadId ? '保存线索并继续' : '继续剧情  ›', { x: 24, y, w: W - 48, h: 58 }, () => this.transition(() => this.session.engine.advance()), true); y += 76
      }
    }
    this.endScroll(y)
    this.footer()
  }
  private footer() {
    const y = this.height - this.bottom - 44
    this.rect(24, y - 4, W - 48, 1, this.colors.line)
    this.link('journal', '查看历程', 18, y, 112, () => this.show('journal'))
    this.text(this.session.saveError ? '保存待重试' : '本机自动保存', W / 2, y + 16, 10, this.colors.muted, sans, 'center')
    this.link('settings', '旅程设置', W - 130, y, 112, () => this.show('settings'))
  }
  private result() {
    const n = this.node, c = this.colors, ending = endingDefinitions.find(e => e.id === n.id)
    let y = this.beginScroll(this.top + 78, this.height - this.bottom - 60)
    const resultArt = { x: 24, y, w: W - 48, h: 170 }
    this.frameInterior('panel', resultArt, 22, () => this.image('hero', resultArt, 'cover', .5))
    this.frameArt(`${this.session.skin}-panel`, resultArt); y += 198
    this.text(ending ? `旅程结局  /  ${this.session.state.unlockedEndings.length} · 6` : '这段路暂时停在了这里', 26, y, 11, c.accent); y += 27
    y += this.paragraph(n.title || '', 26, y, W - 52, 28, c.ink, 37, serif) + 20
    y += this.paragraph(ending?.description || n.reason || n.description || '', 26, y, W - 52, 16, c.muted, 29) + 24
    if (!ending && this.session.state.checkpoint) {
      this.button('checkpoint', '回到上次选择', { x: 24, y, w: W - 48, h: 58 }, () => this.transition(() => this.session.engine.restoreCheckpoint()), true); y += 72
    }
    this.button('restart', '开启新的旅程', { x: 24, y, w: W - 48, h: 58 }, () => { void this.restart() }, !!ending); y += 72
    if (this.platform.share) { this.button('share', '分享这段旅程', { x: 24, y, w: W - 48, h: 58 }, () => this.platform.share?.()); y += 72 }
    this.endScroll(y); this.footer()
  }
  private journal() {
    const s = this.session.state, c = this.colors
    this.header('旅程回顾', 'MEMORIES  /  每一步都有回声')
    let y = this.beginScroll(this.top + 77, this.height - this.bottom - 90)
    this.text(`第 ${s.playthrough} 次旅程 · ${s.choiceHistory.length} 次选择 · ${s.evidenceIds.length} 条线索`, 26, y, 12, c.accent); y += 34
    if (!s.hasSave) { y += this.paragraph('你的第一段故事，正等待开启。', 26, y + 16, W - 52, 22, c.ink, 34, serif) + 50 }
    for (const entry of [...s.history].filter(h => !!h.choice || story[h.node]?.type === 'VIDEO' || story[h.node]?.type === 'ENDING').slice(-40).reverse()) {
      const label = entry.choice ? '你的决定' : story[entry.node]?.type === 'ENDING' ? '抵达结局' : '经历的片段'
      const title = entry.text || story[entry.node]?.title || entry.node
      const h = 46 + this.lines(title, W - 90, 16, serif).length * 25
      this.rect(24, y, W - 48, h, c.card, c.line)
      this.text(label, 40, y + 12, 10, c.accent)
      this.paragraph(title, 40, y + 34, W - 80, 16, c.ink, 25, serif); y += h + 12
    }
    if (s.archives.length) {
      this.text(`已保留 ${s.archives.length} 段往期旅程`, 26, y + 8, 12, c.muted); y += 44
      for (const a of [...s.archives].reverse()) {
        y += this.paragraph(`第 ${a.playthrough} 次 · ${a.run.choiceHistory.length} 次选择 · ${story[a.run.currentNodeId]?.title || '未完的故事'}`, 26, y, W - 52, 13, c.muted, 24) + 16
      }
    }
    this.endScroll(y)
    this.button('resume', s.hasSave ? '继续旅程  ›' : '开启旅程  ›', { x: 30, y: this.height - this.bottom - 68, w: W - 60, h: 58 }, () => this.start(), true)
  }
  private endings() {
    const s = this.session.state, c = this.colors
    this.header('结局收藏', `ENDINGS  /  已收集 ${s.unlockedEndings.length} / ${endingDefinitions.length}`)
    let y = this.beginScroll(this.top + 77, this.height - this.bottom - 30)
    for (const [i, e] of endingDefinitions.entries()) {
      const open = s.unlockedEndings.includes(e.id)
      const h = open ? 154 : 102
      const card = { x: 22, y, w: W - 44, h }
      this.frameInterior('panel', card, 22, () => this.rect(card.x, card.y, card.w, card.h, c.card))
      this.frameArt(`${this.session.skin}-panel`, card)
      this.text(String(i + 1).padStart(2, '0'), 44, y + 23, 29, c.accent, serif)
      this.text(open ? e.title : '尚未抵达的未来', 97, y + 22, 19, c.ink, serif)
      if (open) this.paragraph(e.description, 97, y + 53, W - 146, 13, c.muted, 24)
      else this.text(i === 5 ? '在新的周目中，寻找完整的真相。' : '继续故事，让选择留下不同的回声。', 44, y + 65, 11, c.muted)
      y += h + 15
    }
    this.endScroll(y)
  }
  private settings() {
    const c = this.colors
    this.header('旅程设置', 'SETTINGS  /  按自己的节奏出发')
    let y = this.beginScroll(this.top + 78, this.height - this.bottom - 30)
    this.text('世界的另一面', 26, y, 23, c.ink, serif); y += 42
    const preview = { x: 24, y, w: W - 48, h: 110 }
    this.frameInterior('panel', preview, 22, () => this.image('hero', preview, 'cover', .6))
    this.frameArt(`${this.session.skin}-panel`, preview); y += 131
    this.button('skin', this.session.state.metaFlags.darkSkinUnlocked ? `${themes[this.session.skin].name} · 切换皮肤` : '余烬鎏金 · 通关序章解锁', { x: 24, y, w: W - 48, h: 60 }, () => {
      if (!this.session.switchSkin()) this.notify('完成序章「命运裂缝」的选择后解锁黑金皮肤')
    }); y += 76
    this.button('mute', this.session.muted ? '声音：已关闭' : '声音：已开启', { x: 24, y, w: W - 48, h: 58 }, () => { this.session.state.metaFlags.miniMuted = !this.session.muted; this.session.save() }); y += 71
    this.button('motion', this.session.reducedMotion ? '光尘特效：已关闭' : '光尘特效：已开启', { x: 24, y, w: W - 48, h: 58 }, () => { this.session.state.metaFlags.miniReducedMotion = !this.session.reducedMotion; this.session.save() }); y += 71
    if (this.platform.sidebar) {
      this.button('sidebar', '从抖音侧边栏再相遇', { x: 24, y, w: W - 48, h: 58 }, () => this.platform.sidebar?.()); y += 71
    }
    if (this.session.state.hasSave) {
      this.button('resume', '继续当前旅程', { x: 24, y, w: W - 48, h: 58 }, () => this.start(), true); y += 71
      this.link('restart', '重新开启 · 保留已解锁收藏', 24, y, W - 48, () => { void this.restart() }); y += 60
    }
    y += this.paragraph('进度保存在当前设备。卸载或清理应用缓存可能导致进度丢失。', 28, y + 8, W - 56, 12, c.muted, 23) + 26
    if (this.session.config.mode === 'demo') y += this.paragraph('试玩说明：沿用项目现有剧情测试分支与存档。末日景区正式剧本和视频将另行接入。', 28, y, W - 56, 12, c.muted, 23) + 20
    if (this.assetErrors) y += this.paragraph('部分界面素材未加载，请重新打开试玩。', 28, y, W - 56, 12, c.muted, 23) + 20
    this.endScroll(y)
  }
}
