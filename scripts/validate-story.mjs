import {build} from 'esbuild'
import {pathToFileURL} from 'node:url'
import {mkdtemp,rm,readFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import {validate,compile} from './build-studio-story.mjs'
const dir=await mkdtemp(path.join(tmpdir(),'qingya-check-'))
try{
 await build({stdin:{contents:`export {story} from './src/data/story';export {StoryEngine} from './src/engine/StoryEngine';export {initialState,migrateSave,SAVE_KEY} from './src/engine/SaveEngine';export {syncSkinProgress} from './src/engine/SkinProgress'`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:path.join(dir,'engine.mjs')})
 const {story,StoryEngine,initialState,migrateSave,SAVE_KEY,syncSkinProgress}=await import(pathToFileURL(path.join(dir,'engine.mjs')))
 const project=JSON.parse(await readFile('story-project/story.project.json','utf8'));assert.deepEqual(validate(project).errors,[]);assert.deepEqual(compile(project),story)
 assert.equal(Object.values(story).filter(n=>n.episode).length,35)
 assert.notEqual(SAVE_KEY,'shen_zhiyi_game_state_v1')
 for(let ending=0;ending<3;ending++){
  for(let variant=0;variant<2;variant++){
   const s=initialState(),e=new StoryEngine(s,()=>syncSkinProgress(s));e.startNewGame();assert.equal(s.evidenceIds.length,1)
   for(let i=0;i<50&&e.getNode().type!=='ENDING';i++){
    const n=e.getNode();if(n.episode<=12&& !s.choiceHistory.some(h=>h.node==='EP12'))assert.ok(!s.metaFlags.darkSkinUnlocked)
    if(n.episode>=13)assert.equal(s.metaFlags.darkSkinUnlocked,true)
    const before=JSON.stringify(s.stats);e.enter(n.id);assert.equal(JSON.stringify(s.stats),before,'revisiting must not duplicate effects')
    if(n.choices){const choice=n.choices[n.id==='EP35'?ending:Math.min(variant,n.choices.length-1)];const stats=JSON.stringify(s.stats);e.applyChoice(choice.id);assert.ok(e.restoreCheckpoint());assert.equal(JSON.stringify(s.stats),stats,'checkpoint restores resources');e.applyChoice(choice.id)}else e.advance()
    for(const value of Object.values(s.stats))assert.ok(value>=0&&value<=100)
   }
   assert.equal(s.currentEndingId,'END0'+(ending+1));assert.equal(s.flags.shops,47);assert.equal(s.flags.partners,1);assert.equal(s.evidenceIds.length,12)
   assert.ok(s.flags.waterReady&&s.flags.bedsReady&&s.flags.powerReady&&s.flags.fireZones&&s.flags.contractSigned)
   const restored=new StoryEngine(migrateSave(JSON.parse(JSON.stringify(s))));assert.equal(restored.continueGame().id,s.currentEndingId)
   restored.startNewGame();assert.equal(restored.state.archives.length,1);assert.ok(restored.state.metaFlags.darkSkinUnlocked);assert.equal(restored.state.flags.contractSigned,undefined)
  }
 }
 const s=initialState(),e=new StoryEngine(s);assert.throws(()=>e.enter('END01'));assert.throws(()=>e.applyChoice('invalid'))
 console.log('PASS: 35 episodes; all 3 epilogues × 2 resource strategies; 12 observed records; chapter unlock; replay-safe effects; checkpoint; resource bounds; studio parity; isolated saves.')
}finally{await rm(dir,{recursive:true,force:true})}
