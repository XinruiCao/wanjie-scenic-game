import {backgrounds} from './backgrounds'
export interface ChapterMeta {id:string;title:string;order:number;image:string}
export const chapters:ChapterMeta[] = [
 {id:'engagement',title:'订婚',order:1,image:backgrounds.engagement},{id:'school',title:'学校',order:2,image:backgrounds.school},
 {id:'hospital7',title:'医院七楼',order:3,image:backgrounds.hospital7},{id:'paintedSkin',title:'画皮',order:4,image:backgrounds.paintedSkin},
 {id:'ascension',title:'全球升维',order:5,image:backgrounds.ascension},{id:'lotus',title:'莲池',order:6,image:backgrounds.lotus},
 {id:'harbor',title:'万界码头',order:7,image:backgrounds.harbor},{id:'highDimension',title:'高维巨城',order:8,image:backgrounds.highDimension}
]
