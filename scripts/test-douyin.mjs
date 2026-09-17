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
  await build({ stdin: { contents: `export {Session,DEMO_SAVE_KEY} from './douyin/src/session';export {Movie} from './douyin/src/movie';export {GameApp} from './douyin/src/app';export {nativePlatform} from './douyin/src/native'`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'esm', outfile: path.join(temp, 'game.mjs') })
  const { Session, DEMO_SAVE_KEY, Movie, GameApp, nativePlatform } = await import(pathToFileURL(path.join(temp, 'game.mjs')))
  const store = memory()
  let session = new Session(store, config)
  assert.equal(session.state.hasSave, false)
  assert.equal(session.switchSkin(), false)
  session.save()
  assert.equal(new Session(store, config).state.hasSave, false, 'preferences cannot create a story save')

  function until(s, node) {
    for (let i = 0; i < 50 && s.state.currentNodeId !== node; i++) {
      assert.ok(!s.engine.getNode().choices, `unexpected choice at ${s.state.currentNodeId}`)
      assert.ok(s.engine.getNode().next, `dead end before ${node}`)
      s.engine.advance()
    }
    assert.equal(s.state.currentNodeId, node)
  }
  function prologue(s, route, father = false) {
    s.engine.startNewGame()
    until(s, 'C_M01'); s.engine.applyChoice('C_M01_C')
    until(s, 'C_M03'); s.engine.applyChoice(father ? 'C_M03_C' : 'C_M03_B')
    until(s, 'P_TEST_EVIDENCE')
    assert.ok(s.state.evidenceIds.includes('ring_tracker'), 'page rewards are saved')
    s.engine.applyChoice('PROOF'); until(s, 'P028')
    if (!s.state.archives.length) assert.equal(s.skin, 'light', 'arriving at the decision alone does not unlock')
    s.engine.applyChoice(route)
    assert.equal(s.skin, 'dark')
  }
  for (const [route, ending, father] of [['A', 'END01'], ['B', 'END02'], ['C', 'END03'], ['E', 'END04'], ['F', 'END05', true]]) {
    const s = new Session(memory(), config)
    prologue(s, 'C_P028_' + route, father)
    until(s, ending)
    assert.ok(s.state.unlockedEndings.includes(ending))
  }
  prologue(session, 'C_P028_A'); until(session, 'END01')
  prologue(session, 'C_P028_D'); until(session, 'P_D02'); session.engine.applyChoice('D_TRUE'); until(session, 'END06')
  assert.deepEqual(session.state.unlockedEndings, ['END01', 'END06'])
  session = new Session(store, config)
  assert.equal(session.state.currentNodeId, 'END06'); assert.equal(session.skin, 'dark')
  assert.ok(session.switchSkin()); assert.equal(new Session(store, config).skin, 'light')
  session.engine.startNewGame(); assert.equal(session.state.metaFlags.darkSkinUnlocked, true)
  until(session, 'C_M01'); session.engine.applyChoice('C_M01_A')
  until(session, 'C_M03'); session.engine.applyChoice('C_M03_A')
  until(session, 'P_TEST_EVIDENCE'); session.engine.applyChoice('ARGUE'); until(session, 'R_NO_EVIDENCE')
  assert.ok(session.engine.restoreCheckpoint()); assert.equal(session.state.currentNodeId, 'P_TEST_EVIDENCE')
  assert.equal(session.state.metaFlags.darkSkinUnlocked, true)
  assert.ok(store.map.has(DEMO_SAVE_KEY)); assert.equal(store.map.has('shen_zhiyi_game_state_v1'), false)

  store.set(DEMO_SAVE_KEY, '{damaged')
  const recovered = new Session(store, config)
  assert.ok(recovered.state.hasSave, 'fallback loads last good checkpoint')
  recovered.save(); assert.equal(store.get(DEMO_SAVE_KEY + ':recovery'), '{damaged')
  const blockedStorage = new Session({ get: () => null, set: () => { throw Error('quota') } }, config)
  blockedStorage.engine.startNewGame()
  assert.match(blockedStorage.saveError, /保存失败/)
  assert.equal(blockedStorage.state.currentNodeId, 'V_M01', 'storage errors do not lose in-memory progress')
  assert.equal(new Session(memory(), { ...config, videos: { V_M01: 'http://insecure/movie.mp4' } }).videoUrl('V_M01'), '')
  assert.equal(new Session(memory(), { ...config, videoBaseUrl: 'https://cdn.example.com/game/' }).videoUrl('V_M01'), 'https://cdn.example.com/game/static/videos/prologue/V_M01.mp4')
  console.log('PASS · all six endings, conditional choices, evidence, checkpoint, persistent skins, isolated save, corruption recovery and write failure')

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
    assert.equal(app.page, 'play'); assert.ok(app.targets.some(t => t.id === 'advance'))
    app.targets.find(t => t.id === 'advance').action(); app.render()
    assert.equal(app.node.id, 'C_M01')
    const first = app.targets.find(t => t.id === 'C_M01_A'); assert.ok(first)
    app.activate(first.id); app.activate(first.id); assert.equal(app.session.state.choiceHistory.length, 1)
  }
  const countdown = new GameApp(platform(390, 844), config)
  countdown.session.engine.enter('C_M03'); countdown.render(); countdown.targets.find(t => t.id === 'start').action()
  const now = Date.now(); countdown.frame(now); countdown.background(true); countdown.frame(now + 60000)
  assert.equal(countdown.node.id, 'C_M03'); countdown.background(false)
  for (let i = 0; i <= 151; i++) countdown.frame(now + 60000 + i * 200)
  assert.equal(countdown.node.id, 'V_TRUST', 'countdown applies only a valid default choice')
  let paints = 0
  const staticPage = new GameApp({ ...platform(390, 844), targets() { paints++ } }, config)
  staticPage.render(); staticPage.targets.find(t => t.id === 'start').action()
  staticPage.notify('Temporary notice'); staticPage.frame(now + 20)
  const toastPaints = paints
  staticPage.frame(Date.now() + 4000)
  assert.ok(paints > toastPaints, 'an expired toast redraws even on a static page')
  console.log('PASS · native video adapter and safe area, sidebar capability, five portrait sizes, double tap guard and paused countdown')

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
