import { StoryEngine } from '../../src/engine/StoryEngine'
import { initialState, migrateSave } from '../../src/engine/SaveEngine'
import { syncSkinProgress } from '../../src/engine/SkinProgress'
import { story } from '../../src/data/story'
import type { GameState } from '../../src/types/state'
import type { StoragePort, ReleaseConfig } from './platform'

export const DEMO_SAVE_KEY = 'wanjie_douyin_demo_v1'
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
function decode(raw: unknown): GameState | undefined {
  if (!raw) return
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!isRecord(value) || value.version !== 1 || !isRecord(value.state)) return
    const s = value.state
    if (!story[String(s.currentNodeId)] || !['flags', 'stats', 'metaFlags', 'endingUnlockedAt'].every(k => isRecord(s[k]))) return
    if (!['choiceHistory', 'history', 'visitedNodes', 'evidenceIds', 'unlockedEndings', 'archives', 'galleryUnlocks'].every(k => Array.isArray(s[k]))) return
    for (const key of ['history', 'choiceHistory']) {
      if (!(s[key] as unknown[]).every(h => isRecord(h) && typeof h.node === 'string')) return
    }
    if (!(s.archives as unknown[]).every(a => isRecord(a) && isRecord(a.run) && Array.isArray(a.run.history) && Array.isArray(a.run.choiceHistory))) return
    return migrateSave(s)
  } catch { return }
}

export class Session {
  readonly state: GameState
  readonly engine: StoryEngine
  readonly key: string
  saveError = ''
  unlockNotice = false
  private lastGood: unknown
  private damaged: unknown
  constructor(private storage: StoragePort, readonly config: ReleaseConfig) {
    this.key = config.mode === 'demo' ? DEMO_SAVE_KEY : 'wanjie_douyin_v1'
    let raw: unknown
    try { raw = storage.get(this.key) } catch { this.saveError = '暂时无法读取本机进度' }
    let loaded = decode(raw)
    if (raw && !loaded) {
      this.damaged = raw
      try { loaded = decode(storage.get(this.key + ':backup')) } catch { /* keep the original untouched */ }
      this.saveError = loaded ? '已从备份恢复上一次进度' : '旧存档异常，原数据将保留在恢复副本中'
    }
    this.state = loaded || initialState()
    this.state.developerMode = false
    this.lastGood = loaded ? JSON.stringify({ version: 1, state: loaded }) : undefined
    syncSkinProgress(this.state)
    this.engine = new StoryEngine(this.state, () => this.save())
  }
  get skin(): 'light' | 'dark' {
    return this.state.metaFlags.darkSkinUnlocked && this.state.metaFlags.scenicSkin === 'dark' ? 'dark' : 'light'
  }
  get muted() { return this.state.metaFlags.miniMuted === true }
  get reducedMotion() { return this.state.metaFlags.miniReducedMotion === true }
  save() {
    if (syncSkinProgress(this.state)) this.unlockNotice = true
    try {
      if (this.damaged) {
        this.storage.set(this.key + ':recovery', this.damaged)
        this.damaged = undefined
      }
      const next = JSON.stringify({ version: 1, state: this.state })
      if (this.lastGood) this.storage.set(this.key + ':backup', this.lastGood)
      this.storage.set(this.key, next)
      this.lastGood = next
      this.saveError = ''
    } catch { this.saveError = '自动保存失败，请留在游戏内重试' }
  }
  switchSkin(): boolean {
    if (!this.state.metaFlags.darkSkinUnlocked) return false
    this.state.metaFlags.scenicSkin = this.skin === 'light' ? 'dark' : 'light'
    this.save()
    return true
  }
  videoUrl(nodeId: string): string {
    const explicit = this.config.videos[nodeId]
    if (explicit) return /^https:\/\//.test(explicit) ? explicit : ''
    const base = this.config.videoBaseUrl.replace(/\/$/, '')
    const path = story[nodeId]?.video
    return /^https:\/\//.test(base) && path ? base + '/' + path.replace(/^\//, '') : ''
  }
}
