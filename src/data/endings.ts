import {story} from './story'
import type { Condition } from '../types/condition'
export interface EndingDefinition {id:string;title:string;subtitle:string;poster:string;video:string;description:string;requirements:Condition;trueEnding:boolean;nextActions:string[]}
export const endingDefinitions:EndingDefinition[]=Object.values(story).filter(n=>n.type==='ENDING').map(n=>({id:n.id,title:n.title!,subtitle:'第一卷 · 青崖山开门',poster:n.poster!,video:'',description:n.description!,requirements:n.condition!,trueEnding:false,nextActions:['destiny','newGame','home']}))
export const endingCatalog=endingDefinitions
