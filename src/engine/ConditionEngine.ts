import type { Condition, ConditionState } from '../types/condition'
export class ConditionEngine {
 static evaluate(c: Condition | undefined, s: ConditionState): boolean {
  if (!c) return true
  if ('all' in c) return c.all.every(x=>this.evaluate(x,s))
  if ('any' in c) return c.any.some(x=>this.evaluate(x,s))
  if ('flag' in c) return c.exists !== undefined ? (Object.prototype.hasOwnProperty.call(s.flags,c.flag) === c.exists) : s.flags[c.flag] === (c.equals ?? true)
  if ('stat' in c) return (c.gte === undefined || (s.stats[c.stat]||0)>=c.gte) && (c.lte === undefined || (s.stats[c.stat]||0)<=c.lte)
  if ('ending' in c) return s.unlockedEndings.includes(c.ending) === (c.unlocked ?? true)
  return s.playthrough >= c.playthrough
 }
}
