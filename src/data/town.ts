import type {GameState} from '../types/state'
import {story} from './story'
export interface TownChoice {text:string;reply:string;add:Record<string,number>}
export interface TownPlace {id:string;name:string;role:string;npc:string;episode:number;x:number;y:number;sprite:string;intro:string;choices:TownChoice[]}
export const townSprites:Record<string,{sheet:string;size:[number,number];box:[number,number,number,number]}>= {
 board:{sheet:'props',size:[1448,1086],box:[566,780,266,290]},
 pump:{sheet:'props',size:[1448,1086],box:[320,835,240,235]},
 kitchen:{sheet:'buildings',size:[1448,1086],box:[1080,514,360,177]},
 clinic:{sheet:'props',size:[1448,1086],box:[0,836,310,235]},
 gate:{sheet:'buildings',size:[1448,1086],box:[1090,0,358,315]},
 tree:{sheet:'props',size:[1448,1086],box:[0,483,380,350]},
 cable:{sheet:'props',size:[1448,1086],box:[1160,245,145,245]},
 portrait:{sheet:'xuzhiwei',size:[1122,1402],box:[846,75,276,535]},
 walker:{sheet:'xuzhiwei',size:[1122,1402],box:[0,1020,233,382]},
}
export const townPlaces:TownPlace[]=[
{id:'visitor',name:'游客中心',role:'主线 · CR-07',npc:'CR-07',episode:13,x:47,y:37,sprite:'board',intro:'可用信息仅来自已抵达区域。供水、住宿与道路情况，需要你们逐一核实。今天先把记录做起来。',choices:[{text:'登记每户需求，先照顾急需的人',reply:'许知微把名单分成饮水、住宿、医疗三栏。游客中心有了第一份需求台账。',add:{care:3}},{text:'画出已知设施，不标注猜测区域',reply:'地图上只留下实地确认的点位。未知的地方，暂时留白。',add:{ecology:3}}]},
{id:'pump',name:'泵房',role:'基建 · 巡查',npc:'赵建国',episode:15,x:22,y:30,sprite:'pump',intro:'水能不能用，不是看着清就行。接管之前先巡一遍，漏点和取水位置都得记下来。',choices:[{text:'一起标出漏点，登记维修顺序',reply:'你和赵建国把漏点写进巡查簿。后续修理终于有据可查。',add:{water:3}},{text:'先划出取水队列，减少拥堵',reply:'你用绳子分开进出路线，老人和孩子有了优先取水的位置。',add:{order:3}}]},
{id:'kitchen',name:'公共食堂',role:'生活 · 家常',npc:'值班居民',episode:16,x:28,y:68,sprite:'kitchen',intro:'大家都饿，可库存有限。厨房外还有不认识的小兽，剩菜不能随便扔。',choices:[{text:'把余量记清楚，按人数分餐',reply:'锅边贴上了分餐记录。今天的饭不丰盛，但每个人都能知道自己何时领到。',add:{supply:3}},{text:'收好厨余，提醒大家不要投喂',reply:'厨余桶盖好了。你在记录上补了一句：不了解的生物，先保持距离。',add:{ecology:3}}]},
{id:'clinic',name:'医务点',role:'安置 · 问候',npc:'周芸',episode:16,x:69,y:65,sprite:'clinic',intro:'药品要登记，休息也得排班。来帮忙的人不能一直撑着，倒下了就更没人照顾病人。',choices:[{text:'帮忙整理物资和交接簿',reply:'你逐项写清物资去向，把交接簿留在显眼的位置。',add:{supply:3}},{text:'为值班人员安排轮休',reply:'周芸终于坐下喝了一口水。新的轮班名单贴到了医务点门口。',add:{care:3}}]},
{id:'north',name:'北门湿林',role:'探索 · 边界',npc:'巡查居民',episode:14,x:70,y:25,sprite:'tree',intro:'原来的后路变成了湿林。那只似鹿又似蜥蜴的动物已经离开，我们还不能判断这里是否安全。',choices:[{text:'立警戒标记，不追赶动物',reply:'新的边界标记立在旧路尽头。你把保持距离写进巡查交接。',add:{order:3}},{text:'记录脚印与水位，等待专业判断',reply:'观察簿多了一页记录，没有人贸然进入湿林。',add:{ecology:3}}]},
{id:'market',name:'百鬼街',role:'街坊 · 协商',npc:'摊娘',episode:30,x:48,y:82,sprite:'gate',intro:'暂借三天可以。可你们写的检查，到底查什么？不能一句话就把所有铺子的东西都翻一遍。',choices:[{text:'先问担心什么，再说明检查范围',reply:'你记下摊娘对私人物品的顾虑，说明消防与危险物的登记范围。协商有了一个开头，正式街契仍需继续主线。',add:{cooperation:3}},{text:'先公开消防底线，约定共同巡查',reply:'双方把明火、通道和封存物写在同一张纸上。这是协商记录，还不是正式街契。',add:{order:3}}]},
{id:'cable',name:'索道站',role:'未开放',npc:'许知微',episode:99,x:87,y:45,sprite:'cable',intro:'索道尚未完成安全检查，暂不开放。',choices:[]},
]
export function townEpisode(s:GameState){return Math.max(0,...s.visitedNodes.map(id=>story[id]?.episode||0))}
export function townUnlocked(s:GameState){return townEpisode(s)>=13}
export function townAvailable(s:GameState,p:TownPlace){return townEpisode(s)>=p.episode}
export function townResult(s:GameState,p:TownPlace){const i=s.flags['town:'+p.id];return typeof i==='number'?p.choices[i]:undefined}
export function chooseTown(s:GameState,placeId:string,index:number,save:()=>void){
 const p=townPlaces.find(p=>p.id===placeId),c=p?.choices[index]
 if(!p||!c||!townAvailable(s,p)||townResult(s,p))return false
 s.flags['town:'+p.id]=index
 for(const [key,value]of Object.entries(c.add))s.stats[key]=Math.min(100,Math.max(0,(s.stats[key]||0)+value))
 save();return true
}
