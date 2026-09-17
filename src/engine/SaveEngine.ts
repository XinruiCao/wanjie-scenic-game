import type { GameState, RunState } from '../types/state'
export const SAVE_KEY='shen_zhiyi_game_state_v1'
export const clone = <T>(value:T):T => JSON.parse(JSON.stringify(value))
export const freshRun = ():RunState => ({currentNodeId:'V_M01',currentChapterId:'序章',flags:{},stats:{independence:0,truth:0,career:0,family:0,control:0,anomaly:0},choiceHistory:[],visitedNodes:[],evidenceIds:[],currentEndingId:'',history:[]})
export function snapshot(s:GameState):RunState { return clone(Object.fromEntries(Object.keys(freshRun()).map(k=>[k,s[k as keyof GameState]])) as unknown as RunState) }
export function initialState():GameState { return {...freshRun(),playthrough:1,unlockedEndings:[],endingUnlockedAt:{},galleryUnlocks:[],metaFlags:{},developerMode:false,hasSave:false,checkpoint:null,chapterCheckpoint:null,archives:[],currentNode:'V_M01',chapter:1,loop:1,progress:0,clues:[],endings:[]} }
export function migrateSave(raw:unknown):GameState {
 const base=initialState(); if(!raw || typeof raw!=='object') return base
 const o=raw as Partial<GameState>; const s={...base,...o,stats:{...base.stats,...o.stats},hasSave:o.hasSave ?? true}
 s.currentNodeId=o.currentNodeId || o.currentNode || 'V_M01'; if(s.currentNodeId==='P_M01') s.currentNodeId='C_M01'
 s.playthrough=o.playthrough || o.loop || 1; s.unlockedEndings=o.unlockedEndings || o.endings || []; s.evidenceIds=o.evidenceIds || o.clues || []
 s.choiceHistory=o.choiceHistory || (o.history||[]).filter(h=>h.choice); s.visitedNodes=o.visitedNodes || [...new Set((o.history||[]).map(h=>h.node))]
 if(s.flags.familyAgreementSaved) s.flags.evidence_marriage_plan=true
 return s
}
export class SaveEngine {
 static createCheckpoint(s:GameState){s.checkpoint=snapshot(s)}
 static restoreCheckpoint(s:GameState,chapter=false){ const cp=chapter?s.chapterCheckpoint:s.checkpoint; if(!cp)return false; Object.assign(s,clone(cp)); if(chapter)s.checkpoint=null; return true }
}
