import {backgrounds} from './backgrounds'
import type { Condition } from '../types/condition'
export interface EndingDefinition { id:string; title:string; subtitle:string; poster:string; video:string; description:string; requirements:Condition; trueEnding:boolean; nextActions:string[] }
const routes=['teacher','truth','control','career','shen_group','high_dimension']
export const endingDefinitions: EndingDefinition[] = ['沈老师','真相大白','梁砚的王国','第一个亿','新任掌舵者','完整的沈知意'].map((title,i)=>({
 id:`END0${i+1}`,title,subtitle:'你的选择，留下了回声',poster:backgrounds[('ending0'+(i+1)) as keyof typeof backgrounds],video:`/static/videos/endings/END0${i+1}.mp4`,description:['你回到课堂，把选择人生的勇气教给学生。','证据与真相走到阳光下。','你接受了梁砚的庇护，也接受了他的规则。','从第一份订单开始，你建立了自己的事业。','你回到沈氏，并承担自己的责任。','你带着所有记忆，成为完整的自己。'][i],
 requirements:{all:[{flag:'route',equals:routes[i]},...(i===1?[{stat:'truth',gte:2} as Condition]:[]),...(i===5?[{playthrough:2},{flag:'proved_pattern'},{flag:'checked_phone'},{flag:'evidence_ring_tracker'},{flag:'high_dimension'},{flag:'route_locked',exists:false}] as Condition[]:[])]},trueEnding:i===5,nextActions:['destiny','newGame','home']
}))

export const endingCatalog = endingDefinitions
