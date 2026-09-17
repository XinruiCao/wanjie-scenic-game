import { reactive } from 'vue'
import { StoryEngine } from '../engine/StoryEngine'
import { SAVE_KEY, initialState, migrateSave, SaveEngine } from '../engine/SaveEngine'
import { story, type StoryNode, type ChoiceItem } from '../data/story'
import { syncSkinProgress } from '../engine/SkinProgress'
const state=reactive(initialState())
Object.defineProperties(state,{
 currentNode:{get:()=>state.currentNodeId,set:(v:string)=>state.currentNodeId=v,enumerable:true,configurable:true},
 loop:{get:()=>state.playthrough,set:(v:number)=>state.playthrough=v,enumerable:true,configurable:true},
 clues:{get:()=>state.evidenceIds,set:(v:string[])=>state.evidenceIds=v,enumerable:true,configurable:true},
 endings:{get:()=>state.unlockedEndings,set:(v:string[])=>state.unlockedEndings=v,enumerable:true,configurable:true}
})
function persist(){const unlocked=syncSkinProgress(state);if(unlocked)uni.showToast({title:'章节通关 · 余烬鎏金皮肤已开启',icon:'none',duration:3000});state.progress=Math.round(state.visitedNodes.filter(id=>story[id]?.episode).length/35*100);try{uni.setStorageSync(SAVE_KEY,JSON.stringify(state))}catch{uni.showToast({title:'存档失败，请检查存储空间',icon:'none'})}}
export const storyEngine=new StoryEngine(state,persist)
function hydrate(){try{const raw=uni.getStorageSync(SAVE_KEY);if(raw){const data=migrateSave(typeof raw==='string'?JSON.parse(raw):raw); const {currentNode,loop,clues,endings,...canonical}=data;Object.assign(state,canonical);if(storyEngine.getNode(state.currentNodeId).id!==state.currentNodeId)state.currentNodeId='V_M01'}}catch{} if(syncSkinProgress(state))persist();state.developerMode=import.meta.env.DEV}
function clearSave(){Object.assign(state,initialState());state.developerMode=import.meta.env.DEV;uni.removeStorageSync(SAVE_KEY)}
export const gameStore={state,hydrate,persist,getNode:(id?:string)=>storyEngine.getNode(id),setNode:(id:string)=>storyEngine.enter(id),availableChoices:(n:StoryNode)=>storyEngine.getVisibleChoices(n.id),choose:(c:ChoiceItem)=>storyEngine.applyChoice(c.id),addClue:(id:string)=>storyEngine.addEvidence(id),unlockEnding:(id:string)=>storyEngine.endingEngine.unlockEnding(id),reset:()=>storyEngine.startNewGame(),startNewGame:()=>storyEngine.startNewGame(),createCheckpoint:()=>{SaveEngine.createCheckpoint(state);persist()},restoreCheckpoint:(chapter=false)=>storyEngine.restoreCheckpoint(chapter),clearSave}
