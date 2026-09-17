import { AutoOrientation } from './orientation'
import { GameApp } from './app'
import { nativePlatform, type DouyinAPI, type LaunchOptions } from './native'
import release from '../config/release.json'

declare const tt: DouyinAPI
let app: GameApp | undefined
let orientation: AutoOrientation | undefined
let launch: LaunchOptions = {}
let frame = 0
let visible = true
const loop = () => {
  if (!visible) return
  app?.frame(Date.now())
  frame = requestAnimationFrame(loop)
}
// Register synchronously in the entry file, before assets, so sidebar launches are not missed.
tt.onShow(options => {
  launch = options
  visible = true
  if (!app) return
  app.resize(); app.background(false); orientation?.resume()
  if (options.launch_from === 'homepage' && options.location === 'sidebar_card') app.notify('欢迎回来，旅程已为你保留')
  cancelAnimationFrame(frame); frame = requestAnimationFrame(loop)
})
tt.onHide(() => { visible = false; orientation?.pause(); app?.background(true); cancelAnimationFrame(frame) })

app = new GameApp(nativePlatform(tt), release)
if (launch.launch_from === 'homepage' && launch.location === 'sidebar_card') app.notify('欢迎回来，旅程已为你保留')
tt.onTouchStart(e => { const t = e.touches[0]; if (t) app?.touch('start', t.clientX, t.clientY) })
tt.onTouchMove(e => { const t = e.touches[0]; if (t) app?.touch('move', t.clientX, t.clientY) })
tt.onTouchEnd(e => { const t = e.changedTouches[0]; if (t) app?.touch('end', t.clientX, t.clientY) })
tt.onTouchCancel(() => app?.touch('cancel', 0, 0))
tt.onWindowResize?.(() => app?.resize())
tt.onDeviceOrientationChange?.(() => app?.resize())
orientation = new AutoOrientation(tt, () => app?.resize())
orientation.resume()
frame = requestAnimationFrame(loop)
