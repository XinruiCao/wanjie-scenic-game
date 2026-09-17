import fs from 'node:fs/promises'
import path from 'node:path'
const root = path.resolve(import.meta.dirname, '..')
const config = JSON.parse(await fs.readFile(path.join(root, 'douyin/config/release.json'), 'utf8'))
const nodes = JSON.parse(await fs.readFile(path.join(root, 'src/data/story.runtime.json'), 'utf8'))
const issues = []
for (const file of ['game.js', 'game.json', 'project.config.json']) {
  try { await fs.access(path.join(root, 'dist/douyin', file)) } catch { issues.push('缺少构建输出 ' + file + '，请运行 npm run build:douyin') }
}
if (!/^tt[a-zA-Z0-9]{8,}$/.test(config.appid)) issues.push('尚未填入真实小游戏 AppID')
if (config.mode !== 'production') issues.push('当前为 demo 试玩模式，不能作为正式成品提审')
const missing = Object.values(nodes).filter(n => n.type === 'VIDEO' && !/^https:\/\//.test(config.videos[n.id] || (config.videoBaseUrl ? config.videoBaseUrl.replace(/\/$/, '') + n.video : '')))
if (missing.length) issues.push(`${missing.length} 个视频节点缺少 HTTPS 资源映射，见 docs/douyin-media-manifest.json`)
if (!config.contentReady) issues.push('景区正式剧本、影像、授权与实际游戏名称尚未完成一致性检查')
// This is intentionally not bypassed by a boolean in release.json.
issues.push('账号相关平台接入与审核尚未实施：正式 AppID 下验证登录、实名防沉迷及隐私要求')
issues.push('尚未完成抖音开发者工具和 iOS / Android 真机验收、侧边栏复访检测')
console.log('正式发布就绪检查（不是试玩包构建检查）')
issues.forEach((issue, index) => console.log(`${index + 1}. ${issue}`))
process.exitCode = issues.length ? 1 : 0
