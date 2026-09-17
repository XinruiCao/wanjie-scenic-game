import {uiAssets} from '../config/ui-assets'
import {storyVisuals} from './story-visuals'
import type {GameState} from '../types/state'
export const backgrounds = {
 home:uiAssets.scenes.engagement,engagement:uiAssets.scenes.engagement,school:uiAssets.scenes.school,
 shenGroup:uiAssets.scenes.engagement,hospital7:uiAssets.scenes.hospital7,paintedSkin:uiAssets.scenes.paintedSkin,
 ascension:uiAssets.scenes.ascension,lotus:uiAssets.scenes.lotus,harbor:uiAssets.scenes.harbor,highDimension:uiAssets.scenes.highDimension,
 ending01:uiAssets.scenes.school,ending02:uiAssets.scenes.engagement,ending03:uiAssets.scenes.paintedSkin,
 ending04:uiAssets.scenes.harbor,ending05:uiAssets.scenes.engagement,ending06:uiAssets.scenes.trueEnding
} as const
export function nodeBackground(id:string){if(id==='P028')return backgrounds.paintedSkin;if(id.includes('TRUE'))return backgrounds.ending06;if(id.startsWith('V_D')||id.startsWith('R_'))return backgrounds.hospital7;return backgrounds.engagement}

const homeThemes:Record<string,string>={prologue:backgrounds.engagement,engagement:backgrounds.engagement,'序章':backgrounds.engagement,school:backgrounds.school,hospital:backgrounds.hospital7,hospital7:backgrounds.hospital7,'painted-skin':backgrounds.paintedSkin,paintedSkin:backgrounds.paintedSkin,ascension:backgrounds.ascension,lotus:backgrounds.lotus,harbor:backgrounds.harbor,'high-dimension':backgrounds.highDimension,high_dimension:backgrounds.highDimension,highDimension:backgrounds.highDimension}
export function getHomeBackground(state:Pick<GameState,'currentNodeId'|'currentChapterId'|'flags'|'visitedNodes'>){
 const explicit=storyVisuals[state.currentNodeId]?.theme
 if(explicit)return homeThemes[explicit]||backgrounds.engagement
 if(state.flags.high_dimension)return backgrounds.highDimension
 const recent=[...state.visitedNodes].reverse().map(id=>storyVisuals[id]?.theme).find(Boolean)
 return homeThemes[recent||state.currentChapterId]||backgrounds.engagement
}
