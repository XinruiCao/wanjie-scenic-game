// Copies imagegen PNGs unchanged; reads alpha bounds for layout and verifies real transparency.
import fs from 'node:fs/promises'
import {createRequire} from 'node:module'
import path from 'node:path'
import os from 'node:os'
const require=createRequire(import.meta.url)
let sharp
for(const candidate of ['sharp',process.env.ASSET_SHARP_PATH,path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')].filter(Boolean)){try{sharp=require(candidate);break}catch{}}
if(!sharp)throw Error('sharp is needed for read-only alpha validation')
const sources=JSON.parse(await fs.readFile('scripts/transparent-assets-sources.json','utf8'))
const target='src/static/scenic/generated'
await fs.mkdir(target,{recursive:true})
const entries={},report=[]
for(const {key,path:source} of sources){
 const original=await sharp(source).metadata()
 if(!original.hasAlpha)throw Error(key+' has no alpha channel')
 const {data,info:{width:w,height:h}}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true})
 let x0=w,y0=h,x1=0,y1=0,zero=0,partial=0
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const alpha=data[(y*w+x)*4+3]
  if(alpha===0)zero++;else if(alpha<255)partial++
  if(alpha>12){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
 }
 if(zero/(w*h)<.2)throw Error(key+' is insufficiently transparent')
 if(key.endsWith('button')||key.endsWith('panel')){
  let centerAlpha=0,pixels=0
  for(let y=Math.floor(h*.4);y<h*.6;y++)for(let x=Math.floor(w*.4);x<w*.6;x++){centerAlpha+=data[(y*w+x)*4+3];pixels++}
  if(centerAlpha/pixels>1)throw Error(key+' center is not clear')
 }
 const file=key+'.png';await fs.copyFile(source,path.join(target,file))
 entries[key]={src:'/static/scenic/generated/'+file,size:[w,h],box:[x0,y0,x1-x0+1,y1-y0+1]}
 report.push({key,size:[w,h],transparentPercent:Math.round(zero/(w*h)*100),partialAlphaPercent:Math.round(partial/(w*h)*100),hasAlpha:true})
}
await fs.writeFile('src/config/generated-scenic-assets.json',JSON.stringify(entries,null,2)+'\n')
await fs.writeFile('docs/transparent-assets-audit.json',JSON.stringify(report,null,2)+'\n')
console.log('Verified and copied '+sources.length+' independent RGBA PNGs without modifying pixels.')
