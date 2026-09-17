import {story} from './story'
export interface StoryVisual {characterId?:string;theme?:string}
export const storyVisuals:Record<string,StoryVisual>=Object.fromEntries(Object.values(story).map(n=>[n.id,{characterId:'xuzhiwei',theme:n.chapterId}]))
