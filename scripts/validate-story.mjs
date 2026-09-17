import {build} from 'esbuild'
import {pathToFileURL} from 'node:url'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
const dir=await mkdtemp(path.join(tmpdir(),'story-check-'))
try{
 await build({stdin:{contents:`export {story,endings} from './src/data/story';export {StoryEngine} from './src/engine/StoryEngine';export {initialState,migrateSave} from './src/engine/SaveEngine';export {ConditionEngine} from './src/engine/ConditionEngine'`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:path.join(dir,'engine.mjs')})
 const {story,endings,StoryEngine,initialState,migrateSave,ConditionEngine}=await import(pathToFileURL(path.join(dir,'engine.mjs')))
 const targets=n=>[n.next,...(n.choices||[]).map(c=>c.next)].filter(Boolean)
 for(const n of Object.values(story)){for(const t of targets(n))assert.ok(story[t],`${n.id}: missing ${t}`);if(n.type==='ENDING')assert.ok(endings.includes(n.id));else if(n.type!=='ROUTE_CLOSED')assert.ok(targets(n).length,`${n.id}: no exit`)}
 const seen=new Set(),walk=id=>{if(seen.has(id))return;seen.add(id);targets(story[id]).forEach(walk)};walk('V_M01');assert.equal(seen.size,Object.keys(story).length,'unreachable nodes')
 const terminal=new Set(Object.values(story).filter(n=>['ENDING','ROUTE_CLOSED'].includes(n.type)).map(n=>n.id));let changed=true;while(changed){changed=false;for(const n of Object.values(story))if(!terminal.has(n.id)&&targets(n).some(t=>terminal.has(t))){terminal.add(n.id);changed=true}}assert.equal(terminal.size,seen.size,'dead component')
 function engine(){return new StoryEngine(initialState())}
 function untilChoice(e){for(let i=0;i<100;i++){const n=e.getNode();if(n.choices||['ENDING','ROUTE_CLOSED'].includes(n.type))return n;e.advance()}throw Error('loop')}
 function pick(e,id){untilChoice(e);e.applyChoice(id)}
 function route(first,second,proof,major,secondRun=false){const e=engine();e.startNewGame();if(secondRun)e.startNewGame();pick(e,first);pick(e,second);pick(e,proof);pick(e,major);return e}
 const normal=route('C_M01_A','C_M03_A','LEAVE','C_P028_A');assert.equal(untilChoice(normal).id,'END01');assert.ok(normal.state.unlockedEndings.includes('END01'))
 const closed=engine();closed.startNewGame();pick(closed,'C_M01_A');pick(closed,'C_M03_B');untilChoice(closed);const before=JSON.stringify({flags:closed.state.flags,stats:closed.state.stats,choices:closed.state.choiceHistory});assert.ok(!closed.getVisibleChoices().some(c=>c.id==='PROOF'));closed.applyChoice('ARGUE');assert.equal(untilChoice(closed).id,'R_NO_EVIDENCE');closed.restoreCheckpoint();assert.equal(JSON.stringify({flags:closed.state.flags,stats:closed.state.stats,choices:closed.state.choiceHistory}),before);assert.equal(closed.state.currentNodeId,'P_TEST_EVIDENCE');closed.restoreCheckpoint(true);assert.deepEqual(closed.state.flags,{});assert.equal(closed.state.currentNodeId,'V_M01')
 const found=new Set(['END01']);for(const [first,second,proof,major,end] of [['C_M01_C','C_M03_B','PROOF','C_P028_B','END02'],['C_M01_A','C_M03_A','LEAVE','C_P028_C','END03'],['C_M01_B','C_M03_B','LEAVE','C_P028_E','END04'],['C_M01_C','C_M03_C','PROOF','C_P028_F','END05']]){const e=route(first,second,proof,major);assert.equal(untilChoice(e).id,end);found.add(end)}
 const trueRun=route('C_M01_C','C_M03_B','PROOF','C_P028_D',true);pick(trueRun,'D_TRUE');assert.equal(untilChoice(trueRun).id,'END06');found.add('END06');assert.equal(found.size,6)
 const firstRun=route('C_M01_C','C_M03_B','PROOF','C_P028_D');untilChoice(firstRun);assert.ok(!firstRun.getVisibleChoices().some(c=>c.id==='D_TRUE'));pick(firstRun,'D_TRUTH');assert.equal(untilChoice(firstRun).id,'END02')
 const save=migrateSave(JSON.parse(JSON.stringify(trueRun.state)));const resume=new StoryEngine(save);assert.equal(resume.continueGame().id,'END06');resume.startNewGame();assert.equal(save.playthrough,3);assert.deepEqual(save.flags,{});assert.equal(save.choiceHistory.length,0);assert.ok(save.unlockedEndings.includes('END06'));assert.equal(save.archives.length,2)
 const legacy=migrateSave({currentNode:'P_M01',loop:2,flags:{familyAgreementSaved:true},endings:['END01'],stats:{},history:[]});assert.equal(legacy.currentNodeId,'C_M01');assert.ok(legacy.flags.evidence_marriage_plan)
 const s=initialState();s.stats.truth=2;assert.ok(ConditionEngine.evaluate({all:[{stat:'truth',gte:2,lte:2},{any:[{flag:'missing',exists:false},{ending:'END01'}]},{playthrough:1}]},s));assert.ok(!ConditionEngine.evaluate({stat:'truth',lte:1},s))
 const txn=engine();txn.startNewGame();txn.enter('C_M01');const original=story.C_M01.choices;story.C_M01.choices=[{id:'TXN',text:'test',next:'END01',set:{route:'teacher'}}];try{txn.applyChoice('TXN');assert.equal(txn.state.currentEndingId,'END01');assert.throws(()=>txn.applyChoice('TXN'));assert.equal(txn.state.choiceHistory.length,1)}finally{story.C_M01.choices=original}
 const bad=engine();bad.enter('missing');assert.equal(bad.state.currentNodeId,'V_M01');assert.throws(()=>bad.applyChoice('invalid'));assert.throws(()=>bad.enter('END06'))
 console.log(`PASS: ${seen.size} nodes; graph references/reachability/exits; all six endings; hidden choices; route closed; exact checkpoint restoration; chapter restart; save/legacy migration; new playthrough; conditions; invalid inputs.`)
}finally{await rm(dir,{recursive:true,force:true})}
