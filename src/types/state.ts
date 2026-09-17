export type GameFlags = Record<string,boolean|string|number>
export type GameStats = Record<string,number>
export interface HistoryEntry { node:string; choice?:string; at:number; text?:string }
export interface RunState { currentNodeId:string; currentChapterId:string; flags:GameFlags; stats:GameStats; choiceHistory:HistoryEntry[]; visitedNodes:string[]; evidenceIds:string[]; currentEndingId:string; history:HistoryEntry[] }
export interface GameState extends RunState { playthrough:number; unlockedEndings:string[]; endingUnlockedAt:Record<string,number>; galleryUnlocks:string[]; metaFlags:GameFlags; developerMode:boolean; hasSave:boolean; checkpoint:RunState|null; chapterCheckpoint:RunState|null; archives:Array<{playthrough:number; run:RunState}>; currentNode:string; chapter:number; loop:number; progress:number; clues:string[]; endings:string[] }
