import fs from 'node:fs/promises'
import path from 'node:path'
import { build } from 'esbuild'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const out = path.join(root, 'dist/douyin')
const config = JSON.parse(await fs.readFile(path.join(root, 'douyin/config/release.json'), 'utf8'))
if (!['demo', 'production'].includes(config.mode)) throw new Error('release.mode must be demo or production')
// Production requires a separate platform integration pass; the current output is a reviewable demo.
if (config.mode !== 'demo') throw new Error('当前客户端是试玩接入包。完成账号、实名防沉迷及正式内容接入后再启用 production。')
await fs.mkdir(path.join(out, 'assets'), { recursive: true })
const metadata = JSON.parse(await fs.readFile(path.join(root, 'src/config/generated-scenic-assets.json'), 'utf8'))
const assets = []
for (const [key, item] of Object.entries(metadata)) {
  const [left, top, width, height] = item.box
  const maxWidth = key.includes('title') ? 1050 : key.includes('button') ? 720 : key.includes('panel') ? 600 : key === 'grain' ? 256 : key === 'gold-flare' ? 720 : 144
  const file = path.join(out, 'assets', key + '.png')
  await sharp(path.join(root, 'src', item.src)).extract({ left, top, width, height })
    .resize({ width: Math.min(width, maxWidth), withoutEnlargement: true })
    .png({ palette: true, quality: 90, effort: 9 }).toFile(file)
  const info = await sharp(file).metadata()
  if (!info.hasAlpha) throw new Error(key + ': transparency was lost')
  assets.push({ file: 'assets/' + key + '.png', bytes: (await fs.stat(file)).size, width: info.width, height: info.height, alpha: info.hasAlpha })
}
for (const [key, source, width] of [
  ['hero', 'scenic/hero.png', 1280],
  ['engagement', 'backgrounds/engagement.png', 800],
  ['hospital7', 'backgrounds/hospital7.png', 800],
  ['true-ending', 'backgrounds/true-ending.png', 800],
]) {
  const file = path.join(out, 'assets', key + '.jpg')
  await sharp(path.join(root, 'src/static', source)).resize({ width, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(file)
  assets.push({ file: 'assets/' + key + '.jpg', bytes: (await fs.stat(file)).size })
}
const bundled = await build({
  absWorkingDir: root, entryPoints: ['douyin/src/main.ts'], outfile: path.join(out, 'game.js'),
  bundle: true, format: 'iife', platform: 'neutral', target: ['es2019'], minify: true,
  legalComments: 'none', metafile: true,
})
const forbidden = Object.keys(bundled.metafile.inputs).filter(p => /node_modules\/(vue|@dcloudio)|douyin\/preview/.test(p))
if (forbidden.length) throw new Error('Browser-only dependencies entered the game bundle: ' + forbidden.join(', '))
await fs.writeFile(path.join(out, 'game.json'), JSON.stringify({ deviceOrientation: 'portrait' }, null, 2) + '\n')
await fs.writeFile(path.join(out, 'project.config.json'), JSON.stringify({
  appid: config.appid, projectname: config.projectName,
  description: '万界景区 · Canvas 竖屏剧情试玩。正式内容与平台发布能力待接入。',
  setting: { es6: false },
}, null, 2) + '\n')
const nodes = JSON.parse(await fs.readFile(path.join(root, 'src/data/story.runtime.json'), 'utf8'))
const media = Object.values(nodes).filter(n => n.type === 'VIDEO').map(n => ({
  id: n.id, title: n.title, source: n.video,
  url: config.videos[n.id] || (config.videoBaseUrl ? config.videoBaseUrl.replace(/\/$/, '') + n.video : ''),
}))
await fs.writeFile(path.join(root, 'docs/douyin-media-manifest.json'), JSON.stringify(media, null, 2) + '\n')
async function files(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const all = await Promise.all(entries.map(e => e.isDirectory() ? files(path.join(dir, e.name)) : path.join(dir, e.name)))
  return all.flat()
}
const packageFiles = await files(out)
const size = (await Promise.all(packageFiles.map(async file => (await fs.stat(file)).size))).reduce((a, b) => a + b, 0)
if (size > 4 * 1024 * 1024) throw new Error(`Package exceeds our 4 MiB startup budget: ${size} bytes`)
const report = { mode: config.mode, packageBytes: size, packageFiles: packageFiles.length, startupBudgetBytes: 4 * 1024 * 1024, videoNodes: media.length, configuredVideos: media.filter(v => v.url).length, assets }
await fs.writeFile(path.join(root, 'docs/douyin-build-report.json'), JSON.stringify(report, null, 2) + '\n')
console.log(`抖音小游戏试玩包: dist/douyin · ${(size / 1024 / 1024).toFixed(2)} MiB · ${packageFiles.length} files`)
console.log(`视频映射: ${report.configuredVideos}/${media.length}；未接入视频以明确标注的剧情演示呈现。`)
console.log(config.appid ? '已写入 AppID，请在抖音开发者工具中验证。' : '未配置 AppID。导入时请选择开发者工具提供的测试号，仅用于预览调试。')
