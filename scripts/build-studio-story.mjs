import {readFile,writeFile,rename,access} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const keys='id type title chapter video poster next loop loopAtEnd choices page payloadId quote description reason returnNodeId chapterStartNodeId condition countdown'.split(' ')
const choiceKeys='id text next set add condition disabled defaultChoice locked evidenceIds require'.split(' ')
const pick=(o,ks)=>Object.fromEntries(ks.filter(k=>o[k]!==undefined).map(k=>[k,o[k]]))
export function validate(project){
 const errors=[],warnings=[],nodes=project?.nodes
 if(!nodes||typeof nodes!=='object'||Array.isArray(nodes))return {errors:['剧情 nodes 格式错误'],warnings}
 if(!nodes.V_M01)errors.push('必须保留游戏入口 V_M01')
 const exits=n=>[n.next,...(Array.isArray(n.choices)?n.choices:[]).map(c=>c.next)].filter(Boolean)
 for(const [id,n] of Object.entries(nodes)){
 if(!n||n.id!==id||!['VIDEO','PAGE','CHOICE','ENDING','ROUTE_CLOSED'].includes(n.type)){errors.push(`${id}：节点格式错误`);continue}
 if(n.choices!==undefined&&!Array.isArray(n.choices)){errors.push(`${id}：选项格式错误`);continue}
 if(n.type==='ENDING'&&!/^END0[1-6]$/.test(id))errors.push(`${id}：新结局需先配置 EndingEngine 的结局定义`)
 if(!['ENDING','ROUTE_CLOSED'].includes(n.type)&&!exits(n).length)errors.push(`${id}：未连接后续`)
 if(n.choices?.length&&n.next)errors.push(`${id}：选项与自动跳转不能同时存在`)
 const ids=new Set();for(const c of n.choices||[]){if(!c.id||ids.has(c.id)||typeof c.text!=='string'||!c.next)errors.push(`${id}：选项缺少文字、目标或 ID 重复`);ids.add(c.id)}
 for(const target of [...exits(n),n.returnNodeId,n.chapterStartNodeId].filter(Boolean))if(!nodes[target])errors.push(`${id}：目标 ${target} 不存在`)
 if(n.type==='VIDEO'&&!n.video)warnings.push(`${id}：尚未上传视频`)
 }
 if(errors.length)return {errors,warnings}
 const seen=new Set(),queue=['V_M01'];while(queue.length){const id=queue.pop();if(seen.has(id)||!nodes[id])continue;seen.add(id);queue.push(...exits(nodes[id]))}
 for(const id of Object.keys(nodes))if(!seen.has(id))errors.push(`${id}：从入口无法到达`)
 const finish=new Set(Object.values(nodes).filter(n=>['ENDING','ROUTE_CLOSED'].includes(n.type)).map(n=>n.id));let changed=true
 while(changed){changed=false;for(const n of Object.values(nodes))if(!finish.has(n.id)&&exits(n).some(id=>finish.has(id))){finish.add(n.id);changed=true}}
 for(const id of seen)if(!finish.has(id))errors.push(`${id}：路线无法到达结局或结束页`)
 return {errors,warnings}
}
export async function check(project){const result=validate(project);for(const n of Object.values(project.nodes||{})){for(const field of ['video','poster'])if(n?.[field]?.startsWith('/static/')){try{await access(path.join(root,'src',n[field]))}catch{result.warnings.push(`${n.id}：${field==='video'?'视频':'封面'}文件不存在`)}}}return result}
export function compile(project){return Object.fromEntries(Object.entries(project.nodes).map(([id,n])=>{const clean=pick(n,keys);if(n.choices)clean.choices=n.choices.map(c=>pick(c,choiceKeys));return [id,clean]}))}
export async function publish(project){const result=await check(project);if(result.errors.length)return result;const runtime=compile(project);const dest=path.join(root,'src/data/story.runtime.json');await writeFile(dest+'.tmp',JSON.stringify(runtime,null,2)+'\n');await rename(dest+'.tmp',dest);return result}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const p=JSON.parse(await readFile(path.join(root,'story-project/story.project.json'),'utf8'));const result=process.argv.includes('--check')?await check(p):await publish(p);console.log(JSON.stringify(result,null,2));if(result.errors.length)process.exitCode=1}
