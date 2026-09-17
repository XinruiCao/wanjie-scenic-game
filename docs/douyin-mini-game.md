# 抖音小游戏试玩包

当前交付是独立的 **Canvas + tt API 原生小游戏客户端**，复用原项目的剧情引擎、条件判断、三个卷末方向和皮肤解锁规则。它还没有上传抖音，也不是已通过平台审核的发行版。

## 查看与导入

环境：Node.js 22 或更高版本；先运行 `npm install`（有锁文件时可用 `npm ci`）。

```sh
npm run dev:douyin
```

浏览器打开 `http://127.0.0.1:5174/`，运行与小游戏相同的界面和剧情代码。浏览器适配层替代绘图、缓存及视频 API；预览不能代替抖音真机验证。

```sh
npm run build:douyin
```

输出目录 `dist/douyin/` 包含 `game.js`、`game.json`、`project.config.json` 和 `assets/`。交付压缩包在 `dist/wanjie-douyin-demo.zip`。解压后，在**抖音小游戏开发者工具**选择「小游戏 → 导入」，指向包含 `game.js` 的目录。

没有 AppID 时，在导入界面选择工具提供的**测试号**。[开发者工具说明](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/dev-tools/mini-app-developer-instrument)指出，测试号用于预览调试，不能上传。获得正式 AppID 后填入 `douyin/config/release.json` 的 `appid`，重新构建项目配置。

## 已完成

- 横竖自适应首页、剧情片段、条件选择、线索页面、回顾、结局收藏和设置。
- 纸白「山河新生」与黑金「余烬鎏金」；完成 EP12 并进入 EP13 后解锁黑金，解锁跨周目保留。
- 使用先前独立生成的透明 PNG 花字、边框、纹理、印章和图标；运行包没有参考图拼贴。
- 触摸滚动、长文本换行、44 逻辑像素起的按钮触摸区、短屏布局、安全区和顶部平台胶囊避让。
- 本机自动存档、有效存档备份、异常数据恢复副本、写入失败重试；独立缓存键 `wanjie_qingya_demo_v1`，不覆盖 H5 存档。
- 已解锁结局收藏、往期周目概览、失败路线回到上次选择。
- 可关闭光尘；绘图最大约 30 帧/秒，静态页面按变化刷新，画布像素倍率封顶 2，视频使用单一解码器。
- `tt.onShow` 在入口同步注册，切后台暂停视频和选择倒计时；原生端侧边栏做能力检测，分享由玩家主动点击。

代码在 `douyin/src/`，浏览器适配层在 `douyin/preview/`。原 Vue/H5 页面保留独立构建方式。

## 视频与内容接入

当前为《青崖山开门》第一卷 35 段图文剧情，不依赖视频。正式影片尚未接入；以后添加 VIDEO 节点时再配置媒体映射。设计与素材来源见 [青崖山设计说明](qingya-art-and-design.md)。

`docs/douyin-media-manifest.json` 列出全部片段。拿到有权使用的视频后，在 `douyin/config/release.json` 配置：

```json
{
  "videos": {
    "V_M01": "https://你的实际域名/序章/V_M01.mp4"
  }
}
```

也可以设 `videoBaseUrl`，客户端会追加节点的 `/static/videos/...` 路径。节点映射优先于统一前缀。只接受 HTTPS；证书、域名配置和可播放性要在实际 AppID 下验证。不要把 AppSecret 或用户令牌写进配置。

建议以 720p H.264/AAC MP4 做第一轮手机实测，按片段切分，校验首帧时间、清晰度、字幕尺寸、画面完整性及弱网表现，再定最终转码参数。真人素材要保证授权与角色、剧本一致。

原生端使用[离屏视频](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/javascript-api/media/video/tt-create-offscreen-video)和 [`Video.paintTo`](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/javascript-api/media/video/video) 绘制上方影片，收到首帧事件后再呈现。画面按比例完整适配；下方选择保持独立。配置了影片但播放失败时给出重试，不自动跳过。

## 构建与验收

```sh
npm run typecheck:douyin
npm run build:douyin
npm run test:douyin
npm run test:skins
npm run validate:story
```

自动化覆盖三个卷末方向、隐藏条件、线索奖励、断路回退、跨周目皮肤、存档损坏恢复、空间不足、旧视频回调隔离、前后台暂停、侧边栏检测、双击保护、倒计时及多个竖屏尺寸。也在不提供 `window/document/uni` 的 VM 中启动并绘制构建产物，验证入口没有浏览器依赖。

已在浏览器检查小屏排版并手动点击剧情。**尚未在抖音开发者工具、iOS 或 Android 真机运行**。原生视频渲染、平台回调和机型性能仍需实测。

大小及每个素材的压缩尺寸见 `docs/douyin-build-report.json`，目前首包约 1.43 MiB。原透明素材文件保留，构建时生成轻量副本。内部启动包预算为 4 MiB，这是一项主动性能约束；平台限制以[官方开发指南](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/guide/dev-guide/bytedance-mini-game)和开发者工具校验为准。

## 正式发行前的缺口

`npm run check:douyin` 列出未就绪项并以非零状态退出。这是**正式发布检查**，不影响试玩包构建成功。

1. 正式小游戏 AppID、开发者主体和平台后台资料。
2. 完成正式发行内容与素材授权核对；若采用影游形式，补齐对应视频。当前图文主线与分支已通过可达性验证。
3. 在正式 AppID 下完成所需登录、实名防沉迷、隐私等平台接入。目前没有伪造登录，也不收集真实身份数据；这些能力尚未实现。
4. HTTPS 媒体域名、真机首帧、断网重试、暂停恢复及安全区验收。
5. [侧边栏复访能力](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/guide/open-ability/Introduction-for-tech)及平台必接能力检测通过，再按[开发与发布流程](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/develop)上传测试版本、提审和发布。

构建脚本目前只允许 `mode: "demo"`，避免误将缺少平台接入的客户端当作发行版。`contentReady` 只是本地内容准备记录，不是审核结果；改布尔值不能获得发布资格。

## 真机验收记录（待 AppID）

| 项目 | 操作 | 预期 |
| --- | --- | --- |
| 初次启动 | 测试号或 AppID 导入后预览 | 纸白首页，没有白屏和缺图 |
| 选择与恢复 | 选择后退出重进 | 正确恢复节点和线索 |
| 皮肤 | 完成 EP12 并进入 EP13 后回首页 | 黑金开启，可切回纸白 |
| 安全区 | 刘海屏、小屏、不同宿主 | 操作不被系统遮挡 |
| 前后台 | 倒计时或影片期间切出 | 不扣倒计时，手动暂停不被解除 |
| 视频 | 接入影片、断网再重试 | 有首帧、完整画面、不误跳节点 |
| 侧边栏 | 从侧边栏卡片重入 | 识别返回场景，保留进度 |
| 新周目 | 完成结局后开始新旅程 | 结局和皮肤解锁保留 |

本包没有广告、支付和云存档，试玩不依赖这些能力。
