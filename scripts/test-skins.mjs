import { build } from 'esbuild'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
const dir=await mkdtemp(path.join(tmpdir(),'scenic-skins-'))
try {
 await build({stdin:{contents:`export {initialState,freshRun,migrateSave,SaveEngine} from './src/engine/SaveEngine';export {syncSkinProgress} from './src/engine/SkinProgress';export {StoryEngine} from './src/engine/StoryEngine';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:path.join(dir,'test.mjs')})
 const {initialState,freshRun,migrateSave,SaveEngine,syncSkinProgress,StoryEngine}=await import(pathToFileURL(path.join(dir,'test.mjs')))
 const s=initialState();assert.equal(syncSkinProgress(s),false)
 const engine=new StoryEngine(s,()=>syncSkinProgress(s))
 engine.enter('P028');assert.equal(s.metaFlags.darkSkinUnlocked,undefined,'visiting decision must not unlock')
 engine.applyChoice('C_P028_A');assert.equal(s.metaFlags.darkSkinUnlocked,true);assert.equal(s.metaFlags.scenicSkin,'dark')
 assert.equal(SaveEngine.restoreCheckpoint(s),true);assert.equal(s.metaFlags.darkSkinUnlocked,true,'checkpoint cannot remove unlock')
 s.metaFlags.scenicSkin='light';assert.equal(syncSkinProgress(s),false);assert.equal(s.metaFlags.scenicSkin,'light','no forced reactivation')
 engine.startNewGame();assert.equal(s.metaFlags.darkSkinUnlocked,true);assert.equal(s.metaFlags.scenicSkin,'light')
 const loaded=migrateSave(JSON.parse(JSON.stringify(s)));assert.equal(loaded.metaFlags.scenicSkin,'light')
 const old=initialState();old.archives.push({playthrough:1,run:{...freshRun(),choiceHistory:[{node:'P028',choice:'C_P028_B',at:1}]}});assert.equal(syncSkinProgress(old),true)
 const jump=initialState();jump.visitedNodes=['P028','V_A01'];assert.equal(syncSkinProgress(jump),false,'debug jumps are not completion')
 const invalid=initialState();invalid.choiceHistory.push({node:'P028',choice:'invalid',at:1});assert.equal(syncSkinProgress(invalid),false)
 const preferenceOnly=initialState();preferenceOnly.metaFlags.scenicSkin='light';assert.equal(migrateSave(preferenceOnly).hasSave,false,'preference alone must not create a playthrough')
 console.log('PASS: fresh save, completion, checkpoint, manual switch, new run, reload, legacy archive, invalid/jump history, preference-only save')
} finally {await rm(dir,{recursive:true,force:true})}
