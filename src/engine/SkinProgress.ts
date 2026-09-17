import type { GameState, RunState } from '../types/state'
import { SKIN_UNLOCK_NODE } from '../config/themes'
import { story } from '../data/story'
export function hasCompletedChapter(run: Pick<RunState, 'choiceHistory' | 'history'>): boolean {
 return run.choiceHistory.some(h => h.node === SKIN_UNLOCK_NODE && story[SKIN_UNLOCK_NODE]?.choices?.some(c => c.id === h.choice)) ||
 run.history.some((h, i, history) => {
  const previous = i > 0 ? story[history[i - 1].node] : undefined
  const current = story[h.node]
  if (!previous || !current || previous.id === current.id || current.type === 'ROUTE_CLOSED') return false
  const linked = previous.next === current.id || previous.choices?.some(c => c.next === current.id)
  return !!linked && !!previous.chapter && !!current.chapter && previous.chapter !== current.chapter
 })
}
export function syncSkinProgress(state: GameState): boolean {
 if (state.metaFlags.darkSkinUnlocked) return false
 if (!hasCompletedChapter(state) && !state.archives.some(a => hasCompletedChapter(a.run))) return false
 state.metaFlags.darkSkinUnlocked = true
 state.metaFlags.scenicSkin = 'dark'
 return true
}
