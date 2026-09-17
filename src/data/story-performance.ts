import type {StoryNode} from './story'
import type {GameState} from '../types/state'
export type Mood='calm'|'worried'|'resolve'
export interface StoryBeat {speaker:string;text:string;mood:Mood;effect:'none'|'signal'|'water'|'warm'}
const directed:Record<string,Mood>={V_M01:'worried',EP03:'calm',EP04:'resolve',EP06:'worried',EP08:'resolve',EP10:'calm',EP13:'resolve',EP15:'resolve',EP17:'resolve',EP30:'calm',EP34:'calm'}
export const moodNames:Record<Mood,string>={calm:'平静',worried:'担忧',resolve:'坚定'}
export const moodSprites:Record<Mood,string>={calm:'actor-calm',worried:'portrait',resolve:'actor-resolve'}
export function storyBeats(n:StoryNode):StoryBeat[]{
 if(!directed[n.id]||n.type!=='PAGE')return []
 const mood=directed[n.id]
 const text=(n.description||'').split('\n').filter(Boolean)
 const beats:StoryBeat[]=text.map((text,i)=>({speaker:'旁白',text,mood:i===0?'calm':mood,effect:'none'}))
 if(n.id==='EP03')beats[0]={speaker:'CR-07',text:'文明灾后重建辅助单元 CR-07，连接完成。',mood:'worried',effect:'signal'}
 if(n.id==='EP15'&&beats[1])beats[1].effect='water'
 if(n.id==='EP34'&&beats[1])beats[1].effect='warm'
 if(n.quote)beats.push({speaker:'许知微',text:n.quote,mood,effect:n.id==='EP04'||n.id==='EP08'?'signal':n.id==='EP10'?'warm':'none'})
 return beats
}
export function beatIndex(s:GameState,n:StoryNode){const max=storyBeats(n).length-1,v=s.flags['beat:'+n.id];return Math.max(0,Math.min(max,typeof v==='number'&&Number.isFinite(v)?Math.floor(v):0))}
export function moveBeat(s:GameState,n:StoryNode,delta:number,save:()=>void){const beats=storyBeats(n),i=beatIndex(s,n),next=Math.max(0,Math.min(beats.length-1,i+delta));if(!beats.length||next===i)return false;s.flags['beat:'+n.id]=next;save();return true}
