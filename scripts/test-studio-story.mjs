import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {validate,compile} from './build-studio-story.mjs'
const base=JSON.parse(await readFile(new URL('../story-project/story.project.json',import.meta.url),'utf8'))
const copy=()=>structuredClone(base)
assert.deepEqual(validate(base).errors,[])
let p=copy();p.nodes.V_M01.next='MISSING';assert.ok(validate(p).errors.some(s=>s.includes('MISSING')))
p=copy();p.nodes.EP02.choices[0].next='';assert.ok(validate(p).errors.length)
p=copy();p.nodes.V_M01.next='V_M01';assert.ok(validate(p).errors.some(s=>s.includes('无法到达')))
p=copy();p.nodes.EP34.choices[0].next='EP34';assert.ok(validate(p).errors.some(s=>s.includes('无法到达结局')))
p=copy();delete p.nodes.V_M01;assert.ok(validate(p).errors.some(s=>s.includes('入口')))
p=copy();p.nodes.EP02.choices.push({...p.nodes.EP02.choices[0]});assert.ok(validate(p).errors.some(s=>s.includes('ID 重复')))
p=copy();p.nodes.EXTRA={id:'EXTRA',type:'VIDEO',next:'END01'};assert.ok(validate(p).errors.some(s=>s.includes('EXTRA')))
p=copy();p.nodes.V_M01.notes='private draft';p.layout.V_M01={x:123,y:456};assert.deepEqual(validate(p).errors,[])
console.log('PASS: baseline, dangling targets, incomplete choices, entry, unreachable nodes, dead cycles, duplicate choices and editor metadata')

p=copy();p.nodes.V_M01.notes='PRIVATE_EDITOR_NOTE';p.nodes.EP02.choices[0].notes='PRIVATE_CHOICE_NOTE';p.layout.V_M01={x:123,y:456};p.trash.push({notes:'PRIVATE_TRASH'});const runtime=compile(p);assert.ok(!JSON.stringify(runtime).includes('PRIVATE_'));assert.deepEqual(runtime,JSON.parse(await readFile(new URL('../src/data/story.runtime.json',import.meta.url),'utf8')));console.log('PASS: runtime matches existing game; notes, layout and trash excluded; conditions and effects preserved')
