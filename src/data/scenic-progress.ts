import {story} from './story'
import type {GameState} from '../types/state'
export const resources=[{id:'water',name:'供水'},{id:'supply',name:'后勤'},{id:'care',name:'安置'},{id:'order',name:'秩序'},{id:'ecology',name:'观察'},{id:'cooperation',name:'合作'}]
export const facilities=[{flag:'waterReady',name:'供水管线',episode:15},{flag:'bedsReady',name:'临时生活区',episode:16},{flag:'powerReady',name:'分时供电',episode:17},{flag:'marketShelter',name:'72 小时安置',episode:30},{flag:'fireZones',name:'消防三分区',episode:31},{flag:'contractSigned',name:'百鬼街街契',episode:34}]
export function latestOutcome(s:GameState){const h=s.choiceHistory[s.choiceHistory.length-1];return h?story[h.node]?.choices?.find(c=>c.id===h.choice)?.outcome||'':''}
export function episodeProgress(s:GameState){return Math.round(s.visitedNodes.filter(id=>story[id]?.episode).length/35*100)}
export const observations=[
 ['E01','四翼小虫','exam','腹部似种子，四翼，曾停留于路牌。未触碰，危险程度无法确认。'],
 ['E02','新增水域中的银鱼','wetland','随新水域出现，前肢有抓握状结构。未采样，不能据外形判断食用或接触安全。'],
 ['E03','倒悬建筑群','exam','云层被实体建筑推开，疑似存在居住者。尚未接触，不能扫描内部。'],
 ['E04','岩甲迁徙群','titan','成年个体引导偏离队列的幼体。保持警戒距离，迁徙目的及危险程度未知。'],
 ['E05','雪原白色动物','refugees','长腿，柔软触须试探冰面。与人群隔线观察，未接触。'],
 ['E06','河岸的水生难民','refugees','母体保护幼体，同行者受伤。官方医疗和警戒已接手；河中大型影子的身份未知。'],
 ['E07','青崖山基础设施','qingya','扫描范围仅为已抵达的游客中心、泵房、仓库、厨房和已知管线。'],
 ['E08','后路湿林','wetland','道路被湿林替代，似鹿似蜥蜴的食草个体受惊离开。边界需要重新标记。'],
 ['E09','厨房外六足小兽','wetland','连续夜间取走白菜。不能据取食行为判断可驯养；停止投喂。'],
 ['E10','N-17 百鬼街','market','十九点出现，原有道路与完整商业街对齐。确认智慧生命活动，不推定共同文化。'],
 ['E11','镇纸的重构','market','可见铜销、竹骨、纸层和红绳关节。形态由可见机械结构支撑，其余特性尚待观察。'],
 ['E12','百鬼街商品分区','market','普通商品、明火石坪、危险品封存。未知物保持封存，禁止寿数、魂魄、姓名、永久影契交易。']
].map(([id,title,scene,description])=>({id,title,scene,description}))
