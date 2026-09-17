import { endingDefinitions } from '../data/endings'
import { ConditionEngine } from './ConditionEngine'
import type { GameState } from '../types/state'
export class EndingEngine {
 constructor(private state:GameState,private save:()=>void=()=>{}){}
 canUnlockEnding(id:string){ const e=endingDefinitions.find(e=>e.id===id); return !!e && ConditionEngine.evaluate(e.requirements,this.state) }
 checkAvailableEndings(){return endingDefinitions.filter(e=>this.canUnlockEnding(e.id))}
 unlockEnding(id:string){if(!this.canUnlockEnding(id)) return false; if(!this.state.unlockedEndings.includes(id)) this.state.unlockedEndings.push(id); this.state.endingUnlockedAt[id] ||= Date.now(); this.state.currentEndingId=id; this.save(); return true}
 getUnlockedEndings(){return endingDefinitions.filter(e=>this.state.unlockedEndings.includes(e.id))}
 isTrueEndingAvailable(){return this.canUnlockEnding('END06')}
}
