import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const root=path.resolve(import.meta.dirname,'..')
const read=p=>fs.readFile(path.join(root,p),'utf8')
const manifest=JSON.parse(await read('scripts/ui-asset-manifest.json'))
const sources=JSON.parse(await read('scripts/asset-sources.json'))
async function files(dir){const out=[];for(const e of await fs.readdir(path.join(root,dir),{withFileTypes:true})){if(['node_modules','dist','.git'].includes(e.name))continue;const p=path.posix.join(dir,e.name);out.push(...(e.isDirectory()?await files(p):[p]))}return out}
const all=await files(''),codeFiles=all.filter(f=>/^src\//.test(f)&&/\.(vue|ts|scss|sass)$/.test(f)&&f!=='src/config/ui-assets.ts')
const code=Object.fromEntries(await Promise.all(codeFiles.map(async f=>[f,await read(f)])))
const pages=JSON.parse(await read('src/pages.json')).pages.map(p=>'src/'+p.path+'.vue')
// Trace local imports from registered pages, rather than treating mere registry declarations as use.
const importedBy={};for(const [file,text] of Object.entries(code)){for(const match of text.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){const spec=match[1];if(!spec.startsWith('.'))continue;const base=path.posix.normalize(path.posix.join(path.posix.dirname(file),spec));const dep=[base,base+'.vue',base+'.ts',base+'/index.ts'].find(v=>code[v]!==undefined);if(dep)(importedBy[dep]||=[]).push(file)}}
function consumers(file,seen=new Set()){if(seen.has(file))return [];seen.add(file);if(pages.includes(file))return [file];return [...new Set((importedBy[file]||[]).flatMap(p=>consumers(p,new Set(seen))))]}
const registry=await read('src/config/ui-assets.ts'),runtime=[];const errors=[]
for(const a of manifest){
 const [group,key]=a.key.split('.'),usage=Object.entries(code).filter(([f,t])=>t.includes(`uiAssets.${group}.${key}`)||t.includes(`uiAssets.${group}[`)||t.includes(`asset="${a.key}"`)).map(([f])=>f).filter(f=>consumers(f).length)
 const pagesUsing=[...new Set(usage.flatMap(f=>consumers(f)))];let size=[]
 try{const buf=await fs.readFile(path.join(root,a.target));assert.equal(buf.toString('hex',0,8),'89504e470d0a1a0a');size=[buf.readUInt32BE(16),buf.readUInt32BE(20)]}catch{errors.push(`Missing/invalid PNG: ${a.target}`)}
 if(!registry.includes(a.target.replace(/^src/,'')))errors.push(`Not registered: ${a.key}`)
 if(!usage.length)errors.push(`Unused registry entry: ${a.key}`)
 runtime.push({...a,size,status:usage.length?'runtime':'unused',usage,pagesUsing})
}
// No page may hard-code static visual files or use complete reference/source sheets.
for(const [f,t] of Object.entries(code).filter(([f])=>f.endsWith('.vue')||f.endsWith('.scss'))){if(/['"(]\/static\/[^'"\s)]+\.(png|jpe?g|webp)/i.test(t))errors.push(`Hard-coded image path: ${f}`);if(/docs\/ui-reference|scripts\/[a-f0-9-]{20,}\.png/.test(t))errors.push(`Reference/sheet in runtime UI: ${f}`)}
const known=new Set([...sources.map(s=>s.path),...manifest.map(a=>a.target)])
const unknown=all.filter(f=>/\.(png|jpg|jpeg|webp)$/i.test(f)&&!known.has(f));errors.push(...unknown.map(f=>'Unclassified image: '+f))
const counts={inputImages:sources.length,runtimeAssets:runtime.length,reference:sources.filter(s=>s.status==='reference').length,sourceSheets:sources.filter(s=>s.status==='source-sheet').length,originalRuntimeSources:sources.filter(s=>s.status==='runtime').length,totalImageFiles:all.filter(f=>/\.(png|jpg|jpeg|webp)$/i.test(f)).length,unused:runtime.filter(a=>a.status==='unused').length+unknown.length}
const inventory=['# 视觉资产清单','',`原始输入 ${counts.inputImages} 张（含原项目输入、ZIP 拆图与后续导入素材）；运行资产 ${counts.runtimeAssets} 张；参考 ${counts.reference} 张；source-sheet ${counts.sourceSheets} 张；unused ${counts.unused}。`,`当前物理图片文件 ${counts.totalImageFiles} 张，包含保留原件与裁切/复制结果。原始电影图 3 张和其语义副本不重复计入运行资产数。`,'','所有原图保留。小尺寸参考裁片用于现有资产接入；不是高清原画。未标注身份的头像仅暂配，详见备注。','','## 原始输入','','| 原文件 / 来源目录 | 尺寸 | 状态 / 用途判断 | 新语义文件 / 目标目录 | 实际使用页面 / 组件 |','|---|---|---|---|---|']
for(const s of sources){const derived=runtime.filter(a=>a.source===s.path);inventory.push(`| ${s.origin} | ${s.size.join(' × ')} | ${s.status}：${s.note} | ${derived.map(a=>a.target).join('<br>') || '保留在 '+path.posix.dirname(s.path)} | ${[...new Set(derived.flatMap(a=>a.usage))].join('<br>') || '仅参考，不直接用于运行'} |`)}
inventory.push('','## 运行资产：重命名、裁切与实际引用','','| 资产 key | 原文件 | 裁切坐标 x1,y1,x2,y2 | 尺寸 | 新语义文件 / 目录 | 状态 | 组件 / 页面使用链 | 备注 |','|---|---|---|---|---|---|---|')
for(const a of runtime)inventory.push(`| ${a.key} | ${a.source} | ${a.box?.join(', ') || '整张原始电影帧复制'} | ${a.size.join(' × ')} | ${a.target} | ${a.status} | ${a.usage.join('<br>')} → ${a.pagesUsing.join('<br>')} | ${a.note || '独立无文字 UI/场景资产'} |`)
await fs.writeFile(path.join(root,'docs/asset-inventory.md'),inventory.join('\n')+'\n')
await fs.writeFile(path.join(root,'docs/asset-audit.json'),JSON.stringify({counts,errors,runtime},null,2))
console.log(JSON.stringify(counts,null,2));if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log('PASS: all runtime assets exist, have reachable page consumers, and use the registry; no reference sheet is used as a whole-page UI.')
