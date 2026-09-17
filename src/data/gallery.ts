import {sceneArt} from './backgrounds'
export const galleryCategories=['全部','生态','重建','文明']
export interface GalleryItem{id:string;title:string;src:string;categories:string[];note?:string}
export const gallery:GalleryItem[]=[['exam','考场外的第一场异象','生态'],['wetland','城市湿地 · 生命越界','生态'],['refugees','河岸来客 · 先接住一个家','生态'],['qingya','青崖山 · 从水与灯开始','重建'],['market','百鬼街 · 万种生活同一盏灯','文明'],['titan','下一卷 · 驮岳兽的来路','文明']].map(([id,title,category])=>({id,title,src:sceneArt(id),categories:[category],note:'世界观场景概念图'}))
