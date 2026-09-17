import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import vm from 'node:vm'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'douyin-tests-'))
const config = JSON.parse(await fs.readFile('douyin/config/release.json', 'utf8'))
const memory = () => {
  const map = new Map()
  return { map, get: key => map.get(key), set: (key, value) => map.set(key, value) }
}
const canvas = () => {
  const ctx = new Proxy({ measureText: s => ({ width: [...s].length * 15 }), createLinearGradient: () => ({ addColorStop() {} }) }, { get: (target, key) => target[key] || (() => {}) })
  return { width: 0, height: 0, getContext: () => ctx }
}
try {
  await build({ stdin: { contents: `export {storyBeats,beatIndex,moveBeat} from './src/data/story-performance';export {townPlaces,townAvailable,townResult,chooseTown} from './src/data/town';export {AutoOrientation,gravityDirection} from './douyin/src/orientation';export {Session,DEMO_SAVE_KEY} from './douyin/src/session';export {Movie} from './douyin/src/movie';export {GameApp} from './douyin/src/app';export {nativePlatform} from './douyin/src/native'`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'esm', outfile: path.join(temp, 'game.mjs') })
  const { storyBeats,beatIndex,moveBeat,townPlaces,townAvailable,townResult,chooseTown, AutoOrientation, gravityDirection, Session, DEMO_SAVE_KEY, Movie, GameApp, nativePlatform } = await import(pathToFileURL(path.join(temp, 'game.mjs')))
  const store = memory()
  let session = new Session(store, config)
  assert.equal(session.state.hasSave, false)
  assert.equal(session.switchSkin(), false)
  session.save()
  assert.equal(new Session(store, config).state.hasSave, false, 'preferences cannot create a story save')

  function complete(s,ending=0){s.engine.startNewGame();for(let i=0;i<45&&s.engine.getNode().type!=='ENDING';i++){const n=s.engine.getNode();if(n.choices)s.engine.applyChoice(n.choices[n.id==='EP35'?ending:0].id);else s.engine.advance()}assert.equal(s.state.currentEndingId,'END0'+(ending+1))}
  complete(session);complete(session,2);assert.deepEqual(session.state.unlockedEndings,['END01','END03'])
  session=new Session(store,config);assert.equal(session.state.currentNodeId,'END03');assert.equal(session.skin,'dark');assert.ok(session.switchSkin());assert.equal(new Session(store,config).skin,'light')
  assert.ok(store.map.has(DEMO_SAVE_KEY));assert.equal(store.map.has('wanjie_douyin_demo_v1'),false)
  store.set(DEMO_SAVE_KEY,'{damaged');const recovered=new Session(store,config);assert.ok(recovered.state.hasSave);recovered.save();assert.equal(store.get(DEMO_SAVE_KEY+':recovery'),'{damaged')
  const blockedStorage=new Session({get:()=>null,set:()=>{throw Error('quota')}},config);blockedStorage.engine.startNewGame();assert.match(blockedStorage.saveError,/保存失败/);assert.equal(blockedStorage.state.currentNodeId,'V_M01')
  assert.equal(new Session(memory(),{...config,videos:{V_M01:'http://insecure/movie.mp4'}}).videoUrl('V_M01'),'')
  console.log('PASS · complete first volume, epilogues, persistent skin, isolated saves, corruption recovery and write failure')

  const townStore=memory(), townSession=new Session(townStore,config)
  townSession.engine.startNewGame()
  assert.equal(chooseTown(townSession.state,'visitor',0,()=>townSession.save()),false,'locked NPC cannot grant rewards')
  townSession.engine.enter('EP13')
  const mainNode=townSession.state.currentNodeId, beforeCare=townSession.state.stats.care
  assert.equal(chooseTown(townSession.state,'visitor',0,()=>townSession.save()),true)
  assert.equal(townSession.state.stats.care,beforeCare+3)
  assert.equal(townSession.state.currentNodeId,mainNode,'conversation must not advance main story')
  assert.equal(chooseTown(townSession.state,'visitor',1,()=>townSession.save()),false,'repeat clicks cannot change choice or farm rewards')
  const restoredTown=new Session(townStore,config)
  assert.equal(townResult(restoredTown.state,townPlaces[0]).text,townPlaces[0].choices[0].text)
  assert.equal(townAvailable(restoredTown.state,townPlaces.find(p=>p.id==='market')),false,'do not spoil market before arrival')
  restoredTown.engine.enter('EP30');restoredTown.state.stats.cooperation=99
  assert.equal(chooseTown(restoredTown.state,'market',0,()=>restoredTown.save()),true)
  assert.equal(restoredTown.state.stats.cooperation,100)
  assert.equal(restoredTown.state.flags.contractSigned,undefined,'town negotiation must not sign the main-story contract')
  assert.equal(chooseTown(restoredTown.state,'market',99,()=>restoredTown.save()),false)
  restoredTown.engine.startNewGame();assert.equal(townResult(restoredTown.state,townPlaces[0]),undefined,'new run resets its town decisions')
  console.log('PASS · town unlock gates, dialogue persistence, once-per-run rewards, unchanged main story, resource cap and new-run reset')

  const performanceStore=memory(),performanceSession=new Session(performanceStore,config)
  performanceSession.engine.enter('EP15')
  const pn=performanceSession.engine.getNode(),baselineStats=JSON.stringify(performanceSession.state.stats)
  assert.equal(storyBeats(pn).length,3)
  assert.ok(moveBeat(performanceSession.state,pn,1,()=>performanceSession.save()))
  assert.equal(beatIndex(new Session(performanceStore,config).state,pn),1)
  assert.equal(performanceSession.state.currentNodeId,'EP15')
  assert.equal(JSON.stringify(performanceSession.state.stats),baselineStats)
  assert.ok(moveBeat(performanceSession.state,pn,1,()=>performanceSession.save()))
  assert.equal(moveBeat(performanceSession.state,pn,1,()=>performanceSession.save()),false)
  assert.ok(moveBeat(performanceSession.state,pn,-1,()=>performanceSession.save()))
  performanceSession.engine.startNewGame();assert.equal(beatIndex(performanceSession.state,pn),0)
  console.log('PASS · dialogue cursor save/reload, previous line, end boundary, unchanged story/resources and new-run reset')

  let callbacks = [], destroyed = 0, plays = 0, ended = 0, pauses = 0
  const movie = new Movie({ video: (_src, _muted, events) => {
    callbacks.push(events)
    return { play: () => plays++, pause: () => pauses++, destroy: () => destroyed++, paint() {} }
  } }, () => ended++)
  movie.open('', true, false); assert.equal(movie.status, 'demo')
  movie.open('', false, false); assert.equal(movie.status, 'error')
  movie.open('https://cdn.test/a.mp4', true, false)
  const stale = callbacks.at(-1)
  movie.open('https://cdn.test/b.mp4', true, false)
  stale.ended(); stale.error('late'); assert.equal(ended, 0); assert.equal(movie.status, 'loading')
  const current = callbacks.at(-1); current.ready(); assert.equal(movie.status, 'playing')
  movie.background(true); movie.tick(60000); assert.equal(movie.status, 'playing', 'background time is not a timeout')
  movie.background(false); movie.toggle(); assert.equal(movie.status, 'paused')
  const priorPlays = plays
  movie.background(true); movie.background(false); assert.equal(plays, priorPlays, 'manual pause survives lifecycle')
  movie.toggle(); current.ended(); current.ended(); assert.equal(ended, 1)
  movie.open('https://cdn.test/c.mp4', false, false); movie.tick(15000); assert.equal(movie.status, 'error')
  callbacks.at(-1).ended(); assert.equal(ended, 1, 'failed media cannot advance the story')
  movie.close(); assert.ok(destroyed >= 3); assert.ok(pauses >= 2)
  let paintEvents
  const badPaint = new Movie({ video: (_src, _muted, events) => { paintEvents = events; return { play() {}, pause() {}, destroy() {}, paint() { throw Error('native renderer') } } } }, () => assert.fail('paint failure cannot finish a movie'))
  badPaint.open('https://cdn.test/broken.mp4', false, false); paintEvents.ready(); badPaint.paint({ x: 0, y: 0, w: 100, h: 100 }, 1)
  assert.equal(badPaint.status, 'error')
  console.log('PASS · decoder teardown, stale callbacks, pause/resume, background timeout and no silent skipping on media failure')

  let nativeEvents = {}, nativePlays = 0, nativeDestroyed = 0, dimensions, scene, sidebarCalled = 0
  const video = { width: 0, height: 0, play() { nativePlays++ }, pause() {}, destroy() { nativeDestroyed++ }, paintTo(...args) { dimensions = args },
    onCanplay: cb => nativeEvents.canplay = cb, onCandraw: cb => nativeEvents.candraw = cb, onEnded: cb => nativeEvents.ended = cb,
    onError: cb => nativeEvents.error = cb, onTimeUpdate: cb => nativeEvents.progress = cb }
  const native = nativePlatform({ createCanvas: canvas, createOffscreenVideo: () => video, getSystemInfoSync: () => ({ windowWidth: 390, windowHeight: 844, pixelRatio: 3, safeArea: { top: 47, bottom: 810 } }),
    getMenuButtonBoundingClientRect: () => ({ bottom: 80 }), getStorageSync: () => null, setStorageSync() {}, showToast() {},
    checkScene: opts => scene = opts, navigateToScene: () => sidebarCalled++,
  })
  assert.deepEqual(native.viewport(), { width: 390, height: 844, dpr: 3, top: 90, bottom: 34 })
  const vp = native.video('https://cdn.test/a.mp4', false, { ready() {}, ended() {}, error() {}, progress() {} })
  vp.play(); vp.pause(); nativeEvents.canplay(16 / 9); assert.equal(nativePlays, 0)
  vp.play(); nativeEvents.candraw(16 / 9); vp.paint({ x: 18, y: 100, w: 354, h: 230 }, 2)
  assert.equal(dimensions[1], 36); assert.equal(video.width, 708); assert.ok(video.height < 460)
  vp.destroy(); vp.destroy(); assert.equal(nativeDestroyed, 1)
  native.sidebar(); scene.success({ isExist: false }); assert.equal(sidebarCalled, 0)
  native.sidebar(); scene.success({ isExist: true }); assert.equal(sidebarCalled, 1)

  function platform(width, height) {
    return { canvas: canvas(), viewport: () => ({ width, height, dpr: 3, top: 48, bottom: 24 }), storage: memory(),
      loadImage: () => new Promise(() => {}), toast() {}, confirm: async () => false, video: () => { throw new Error('not expected in demo') } }
  }
  for (const [width, height] of [[320, 568], [375, 667], [390, 600], [390, 844], [430, 932]]) {
    const app = new GameApp(platform(width, height), config); app.render()
    for (const target of app.targets) {
      assert.ok(target.y >= 0 && (target.y + target.h) * width / 390 <= height, `${width}x${height}: ${target.id} outside screen`)
      assert.ok(target.h >= 44, `${target.id}: minimum touch area`)
    }
    app.targets.find(t => t.id === 'start').action(); app.render()
    assert.equal(app.page,'play');app.scrollBy(10000);app.render();assert.ok(app.targets.some(t=>t.id==='advance'))
    for(let line=0;line<8&&app.node.id==='V_M01';line++){app.targets.find(t=>t.id==='advance').action();app.render();app.scrollBy(10000);app.render()}assert.equal(app.node.id,'EP02');app.scrollBy(10000);app.render()
    const first=app.targets.find(t=>t.id==='EP02_B');assert.ok(first);app.activate(first.id);app.activate(first.id);assert.equal(app.session.state.choiceHistory.length,1)
  }
  for(const [width,height] of [[320,568],[390,844],[844,390]]){
    const app=new GameApp(platform(width,height),config)
    app.session.engine.enter('EP13');app.page='town';app.render()
    const click=id=>{let t=app.targets.find(t=>t.id===id);for(let i=0;!t&&i<50;i++){app.scrollBy(40);app.render();t=app.targets.find(t=>t.id===id)}assert.ok(t,`town ${width}x${height} missing ${id}`);t.action();app.render()}
    click('place-visitor');click('town-reply');click('town-choice-0')
    assert.equal(app.session.state.flags['town:visitor'],0)
    assert.equal(app.node.id,'EP13')
    click('town-done');click('place-visitor')
    assert.equal(app.targets.some(t=>t.id==='town-reply'),false)
    click('town-done');click('place-market')
    assert.equal(app.targets.some(t=>t.id==='town-reply'),false)
    click('town-close');click('town-main');assert.equal(app.page,'play');assert.equal(app.node.id,'EP13')
  }
  console.log('PASS · town hotspot → NPC → choice → persisted result → map → unchanged main story on portrait and landscape')
  for(const [width,height] of [[320,568],[390,844],[844,390]]){
    const app=new GameApp(platform(width,height),config);app.session.engine.enter('EP15');app.page='play';app.render()
    const click=id=>{let t=app.targets.find(t=>t.id===id);for(let i=0;!t&&i<80;i++){app.scrollBy(30);app.render();t=app.targets.find(t=>t.id===id)}assert.ok(t,`dialogue ${width}x${height} missing ${id}`);t.action();app.render()}
    assert.equal(app.targets.some(t=>t.id==='EP15_A'),false)
    click('advance');click('advance');assert.equal(app.node.id,'EP15')
    click('advance');click('EP15_A');assert.equal(app.node.id,'EP16')
    assert.equal(app.session.state.choiceHistory.length,1)
  }
  console.log('PASS · dialogue must finish before choices, choice advances exactly once, portrait and landscape')
  const now=Date.now()
  // Resize the same running session: rotation must never advance/reload the story.
  for(const [pw,ph] of [[320,568],[390,844],[430,932]]){
    let viewport={width:pw,height:ph,dpr:2,top:20,bottom:16}
    const app=new GameApp({...platform(pw,ph),viewport:()=>viewport},config)
    app.render();app.targets.find(t=>t.id==='start').action();app.session.engine.enter('EP15');app.render()
    const before=JSON.stringify(app.session.state)
    app.touch('start',pw/2,ph/2)
    viewport={...viewport,width:ph,height:pw};app.resize();app.touch('end',pw/2,ph/2);app.render()
    assert.equal(JSON.stringify(app.session.state),before,'rotation cancels stale touches and preserves state')
    for(const page of ['home','play','town','journal','endings','settings']){
      app.page=page;app.render()
      for(const t of app.targets){assert.ok(t.x>=0&&t.y>=0&&t.x+t.w<=ph+.1&&t.y+t.h<=pw+.1,`${ph}x${pw} ${page} ${t.id} bounds`)}
      app.scrollBy(100000);app.render();assert.ok(app.targets.length>0)
    }
    app.page='play';viewport={...viewport,width:pw,height:ph};app.resize();app.render();assert.equal(JSON.stringify(app.session.state),before)
  }
  assert.equal(gravityDirection({x:1,y:0,z:0}),'landscape')
  assert.equal(gravityDirection({x:0,y:-1,z:0}),'portrait')
  assert.equal(gravityDirection({x:0,y:0,z:1}),undefined)
  assert.equal(gravityDirection({x:.7,y:.7,z:0}),undefined)
  let clock=0,gravity,request,resizes=0,stops=0,windowSize={windowWidth:390,windowHeight:844}
  const sensor={canIUse:()=>true,getSystemInfoSync:()=>windowSize,onAccelerometerChange:cb=>gravity=cb,offAccelerometerChange:()=>{},startAccelerometer:opts=>opts.success(),stopAccelerometer:()=>stops++,setDeviceOrientation:opts=>request=opts}
  const rotation=new AutoOrientation(sensor,()=>resizes++,()=>clock)
  rotation.resume();gravity({x:1,y:0,z:0});clock=200;gravity({x:1,y:0,z:0});assert.equal(request,undefined)
  clock=650;gravity({x:1,y:0,z:0});assert.equal(request.value,'landscape');assert.equal(resizes,0)
  windowSize={windowWidth:844,windowHeight:390};request.success();assert.equal(resizes,1)
  clock=2000;gravity({x:0,y:1,z:0});clock=2700;gravity({x:0,y:1,z:0});assert.equal(request.value,'portrait')
  request.fail();assert.equal(stops,1);const failed=request;clock=5000;gravity({x:0,y:1,z:0});assert.equal(request,failed)
  rotation.resume();rotation.pause();assert.equal(stops,2)
  new AutoOrientation({canIUse:()=>false},()=>assert.fail()).resume()
  console.log('PASS · portrait-landscape-portrait on 3 screen sizes, all pages, no state changes, cancelled stale touch, gravity debounce, async completion and host rejection')
  let paints = 0
  const staticPage = new GameApp({ ...platform(390, 844), targets() { paints++ } }, config)
  staticPage.render(); staticPage.targets.find(t => t.id === 'start').action()
  staticPage.notify('Temporary notice'); staticPage.frame(now + 20)
  const toastPaints = paints
  staticPage.frame(Date.now() + 4000)
  assert.ok(paints > toastPaints, 'an expired toast redraws even on a static page')
  console.log('PASS · native video adapter and safe area, sidebar capability, five portrait sizes, double tap guard and static toast refresh')

  const code = await fs.readFile('dist/douyin/game.js', 'utf8')
  const events = {}, order = []
  const tt = {
    createCanvas() { order.push('canvas'); return canvas() }, createImage: () => ({ width: 100, height: 100 }),
    getSystemInfoSync: () => ({ windowWidth: 390, windowHeight: 844, pixelRatio: 2 }),
    getStorageSync: () => null, setStorageSync() {}, showToast() {},
    onShow(cb) { order.push('show'); events.show = cb }, onHide: cb => events.hide = cb,
    onTouchStart: cb => events.start = cb, onTouchMove: cb => events.move = cb, onTouchEnd: cb => events.end = cb, onTouchCancel: cb => events.cancel = cb,
  }
  let raf
  const context = { tt, console, requestAnimationFrame: cb => { raf = cb; return 1 }, cancelAnimationFrame() {} }
  vm.runInNewContext(code, context, { timeout: 3000 })
  assert.equal(order[0], 'show', 'lifecycle must register before initialization')
  raf(); events.hide(); events.show({ launch_from: 'homepage', location: 'sidebar_card' }); raf()
  assert.equal('document' in context, false); assert.equal('window' in context, false)
  console.log('PASS · built game.js starts and renders in a VM with tt only (no window, document, Vue or uni)')
} finally { await fs.rm(temp, { recursive: true, force: true }) }
