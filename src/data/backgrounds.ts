import {story} from './story'
import type {GameState} from '../types/state'
export const sceneArt=(key:string)=>'/static/scenic/worlds/'+key+'.jpg'
export const backgrounds={home:sceneArt('qingya'),engagement:sceneArt('exam'),school:sceneArt('exam'),shenGroup:sceneArt('qingya'),hospital7:sceneArt('refugees'),paintedSkin:sceneArt('market'),ascension:sceneArt('exam'),lotus:sceneArt('wetland'),harbor:sceneArt('market'),highDimension:sceneArt('titan'),ending01:sceneArt('market'),ending02:sceneArt('market'),ending03:sceneArt('wetland'),ending04:sceneArt('qingya'),ending05:sceneArt('qingya'),ending06:sceneArt('titan')} as const
export function nodeBackground(id:string){return story[id]?.poster||backgrounds.home}
export function getHomeBackground(_state:Pick<GameState,'currentNodeId'|'currentChapterId'|'flags'|'visitedNodes'>){return backgrounds.home}
