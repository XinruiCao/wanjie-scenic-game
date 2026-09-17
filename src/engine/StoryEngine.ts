import { story, type ChoiceItem } from '../data/story'
import type { GameState } from '../types/state'
import { ConditionEngine } from './ConditionEngine'
import { EndingEngine } from './EndingEngine'
import { SaveEngine, freshRun, snapshot, clone } from './SaveEngine'
export class StoryEngine {
 readonly endingEngine:EndingEngine
 constructor(public state:GameState,private save:()=>void=()=>{}) {this.endingEngine=new EndingEngine(state,save)}
 getNode(id=this.state.currentNodeId){return story[id] || story.V_M01}
 canEnter(id:string,state=this.state){return !!story[id] && ConditionEngine.evaluate(story[id].condition,state) && (story[id].type!=='ENDING'||new EndingEngine(state).canUnlockEnding(id))}
 getVisibleChoices(id=this.state.currentNodeId,state=this.state):ChoiceItem[]{return (story[id]?.choices||[]).flatMap(c=>{
 const ok=ConditionEngine.evaluate(c.condition,state) && Object.entries(c.require||{}).every(([k,v])=>state.flags[k]===v||state.stats[k]===v)
 return ok?[c]:state.playthrough>=2?[{...c,text:'未明的命运 · 尚未满足条件',disabled:true,locked:true}]:[]
 })}
 resolveNext(id:string,choiceId?:string){return choiceId?story[id]?.choices?.find(c=>c.id===choiceId)?.next:story[id]?.next}
 enter(id:string){
 if(!story[id]) id='V_M01'
 if(!this.canEnter(id)) throw new Error('尚未满足节点进入条件：'+id)
 const s=this.state,n=story[id]; s.currentNodeId=id;s.currentChapterId=n.chapter||s.currentChapterId;s.hasSave=true
 if(!s.visitedNodes.includes(id))s.visitedNodes.push(id)
 s.history.push({node:id,at:Date.now()})
 if(n.choices?.length)SaveEngine.createCheckpoint(s)
 if(n.type==='ENDING') this.endingEngine.unlockEnding(id)
 this.save();return n
 }
 applyChoice(choiceId:string){const c=this.getVisibleChoices().find(c=>c.id===choiceId);if(!c||c.disabled)throw new Error('选项不可用');const proposed=clone(this.state);Object.assign(proposed.flags,c.set||{});for(const [k,v] of Object.entries(c.add||{}))proposed.stats[k]=(proposed.stats[k]||0)+v;
 if(!this.canEnter(c.next,proposed))throw new Error('目标不可用');SaveEngine.createCheckpoint(this.state)
 this.state.flags=proposed.flags;this.state.stats=proposed.stats
 for(const id of c.evidenceIds||[])this.addEvidence(id)
 const h={node:this.state.currentNodeId,choice:c.id,text:c.text,at:Date.now()};this.state.choiceHistory.push(h);this.state.history.push(h);return this.enter(c.next)
 }
 advance(){const n=this.getNode();if(n.choices?.length)return n;if(n.payloadId)this.addEvidence(n.payloadId);return n.next?this.enter(n.next):n}
 addEvidence(id:string){if(!this.state.evidenceIds.includes(id))this.state.evidenceIds.push(id);if(id==='ring_tracker')this.state.flags.evidence_ring_tracker=true;this.save()}
 startNewGame(){const s=this.state;if(s.hasSave){s.archives.push({playthrough:s.playthrough,run:snapshot(s)});s.playthrough+=1}Object.assign(s,freshRun());s.checkpoint=null;s.chapterCheckpoint=snapshot(s);return this.enter('V_M01')}
 continueGame(){const n=this.getNode();if(n.type==='ENDING' && this.state.unlockedEndings.includes(n.id)){this.state.currentEndingId=n.id;this.save();return n}return this.enter(this.canEnter(n.id)?n.id:'V_M01')}
 restoreCheckpoint(chapter=false){if(!SaveEngine.restoreCheckpoint(this.state,chapter))return false;this.save();return true}
}
