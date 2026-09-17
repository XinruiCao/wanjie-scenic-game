import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {readFile,writeFile,rename,mkdir,readdir} from 'node:fs/promises'
import path from 'node:path'
import {randomUUID} from 'node:crypto'
import {mediaServer} from './media-server.mjs'
import {root,check,publish} from '../scripts/build-studio-story.mjs'
const projectFile=path.join(root,'story-project/story.project.json')
const token=randomUUID()
async function body(req,limit){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>limit)throw Error('文件过大');chunks.push(chunk)}return Buffer.concat(chunks)}
async function scan(dir,prefix='/static'){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.isSymbolicLink())continue;const url=prefix+'/'+entry.name;if(entry.isDirectory())out.push(...await scan(path.join(dir,entry.name),url));else if(/\.(mp4|webm|mov)$/i.test(entry.name))out.push({name:entry.name,url})}return out}
export default defineConfig({root:path.join(root,'story-studio'),publicDir:false,plugins:[vue(),{name:'local-story-api',configureServer(server){
 server.middlewares.use('/static',mediaServer(path.join(root,'src/static')))
 server.middlewares.use('/api',async(req,res,next)=>{try{
 const host=req.headers.host;if(!/^(localhost|127\.0\.0\.1):\d+$/.test(host||''))throw Error('仅支持本机访问')
 if(req.headers.origin&&req.headers.origin!==`http://${host}`)throw Error('拒绝跨站请求')
 if(req.method!=='GET'&&req.headers['x-studio-token']!==token)throw Error('请求凭证无效')
 const url=new URL(req.url,'http://localhost');let result
 if(req.method==='GET'&&url.pathname==='/project')result={project:JSON.parse(await readFile(projectFile,'utf8')),token}
 else if(req.method==='GET'&&url.pathname==='/assets')result=await scan(path.join(root,'src/static'))
 else if(req.method==='POST'&&['/save','/check','/publish'].includes(url.pathname)){
 const p=JSON.parse((await body(req,8*1024*1024)).toString());if(!p.nodes||!p.layout||!Array.isArray(p.trash))throw Error('无效工程')
 if(url.pathname==='/save'){await writeFile(projectFile+'.tmp',JSON.stringify(p,null,2)+'\n');await rename(projectFile+'.tmp',projectFile);result={ok:true}}
 else result=await(url.pathname==='/check'?check(p):publish(p))
 }else if(req.method==='POST'&&url.pathname==='/upload'){
 const ext=path.extname(url.searchParams.get('name')||'').toLowerCase();if(!['.mp4','.webm','.mov','.jpg','.jpeg','.png','.webp'].includes(ext))throw Error('不支持此素材格式')
 const bytes=await body(req,512*1024*1024),name=randomUUID()+ext;await mkdir(path.join(root,'src/static/videos/studio'),{recursive:true});await writeFile(path.join(root,'src/static/videos/studio',name),bytes);result={url:'/static/videos/studio/'+name}
 }else{res.statusCode=404;res.end();return}
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result))
 }catch(e){res.statusCode=400;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:e.message}))}})
 }}],server:{host:'127.0.0.1',port:5174,strictPort:true,fs:{allow:[root]}},build:{outDir:path.join(root,'dist-story-studio'),emptyOutDir:true,copyPublicDir:false}})
