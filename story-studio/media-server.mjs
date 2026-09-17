import {createReadStream} from 'node:fs'
import {realpath,stat} from 'node:fs/promises'
import path from 'node:path'
const mime={'.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'}
export function mediaServer(directory){return async(req,res)=>{
 try{
 if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.end();return}
 const base=await realpath(directory),relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=await realpath(path.resolve(base,'.'+relative))
 if(!file.startsWith(base+path.sep))throw Error('Invalid path')
 const info=await stat(file);if(!info.isFile())throw Error('Not a file')
 let start=0,end=info.size-1
 if(req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!match||(!match[1]&&!match[2])){res.statusCode=416;res.end();return}
 if(!match[1])start=Math.max(0,info.size-Number(match[2]));else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]))}
 if(start>end||start>=info.size){res.statusCode=416;res.setHeader('Content-Range',`bytes */${info.size}`);res.end();return}
 res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${info.size}`)
 }
 res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Type',mime[path.extname(file).toLowerCase()]||'application/octet-stream');res.setHeader('Content-Length',Math.max(0,end-start+1));res.setHeader('Cache-Control','no-cache')
 if(req.method==='HEAD'||!info.size){res.end();return}
 const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res)
 }catch{res.statusCode=404;res.end('素材不存在')}
}}
