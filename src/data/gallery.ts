import {uiAssets} from '../config/ui-assets'
import {characters} from './characters'
import {chapters} from './chapters'
import {backgrounds} from './backgrounds'
export const galleryCategories=['全部','剧情','CG','角色','异常','画皮','医院','莲池','万界','结局']
export interface GalleryItem {id:string;title:string;src:string;categories:string[];note?:string}
const tags:Record<string,string[]>={engagement:['剧情'],school:['剧情'],hospital7:['剧情','异常','医院'],paintedSkin:['剧情','画皮'],ascension:['剧情','异常','CG'],lotus:['莲池','CG'],harbor:['万界','CG'],highDimension:['万界','异常','CG']}
export const gallery:GalleryItem[] = [
 ...chapters.map(c=>({id:c.id,title:c.title,src:c.image,categories:tags[c.id]})),
 ...characters.map(c=>({id:c.id,title:c.name,src:c.portrait,categories:['角色'],note:c.quality})),
 ...characters.flatMap(c=>'hero' in c&&c.hero?[{id:c.id+'-hero',title:c.name+' · 人物',src:c.hero,categories:['角色','CG'],note:c.quality}]:[]),
 {id:'ring',title:'订婚戒指 · 结构',src:uiAssets.evidence.ring,categories:['剧情','异常']},
 {id:'ring-detail',title:'戒托 · 放大',src:uiAssets.evidence.detail,categories:['异常']},
 {id:'ring-back',title:'戒指 · 背面',src:uiAssets.evidence.back,categories:['异常']},
 ...['沈老师','真相大白','梁砚的王国','第一个亿','新任掌舵者','完整的沈知意'].map((title,i)=>({id:'END0'+(i+1),title,src:backgrounds[('ending0'+(i+1)) as keyof typeof backgrounds],categories:['结局'],note:'终幕场景'}))
]
