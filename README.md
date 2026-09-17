# 万界开了，我在末日景区搞基建

基础试玩版 v1.0.0 ·《青崖山开门》第一卷。

35 段图文剧情、五幕、3 个卷末发展方向、12 项生态观察和 6 个建设里程碑。玩家选择影响供水、后勤、安置、秩序、观察与合作，并记录在建设手记中。

## 开始运行

安装 Node.js 22+，在项目目录执行 `npm ci`。

| 客户端 | 预览命令 | 构建命令与输出 |
| --- | --- | --- |
| 网页 H5 | `npm run dev:h5`（默认 5173） | `npm run build:h5` → `dist/build/h5/` |
| 抖音 Canvas 试玩 | `npm run dev:douyin`（默认 5174） | `npm run build:douyin` → `dist/douyin/` |

两端均支持横竖屏：竖屏上下排列，横屏左右分栏。旋转保持当前故事与选择；系统方向锁和宿主限制仍然有效，见 [横竖屏说明](docs/rotation.md)。

默认纸白皮肤，完成 EP12 并进入 EP13 后解锁黑金，可自行切换。新周目保留已解锁外观。使用透明 PNG 装饰和边框，填色沿边框内缘裁切。

存档保存在当前设备，H5 与抖音分别保存，不跨平台同步。旧版本存档保留，新卷使用独立存档键。

## 基础版验收

```sh
npm run verify:base
```

检查剧情与编辑器数据、皮肤进度、类型、两端构建、存档恢复、触摸与横竖屏切换、视频生命周期及无浏览器环境的小游戏启动。GitHub Actions 自动运行相同命令，成功后提供 H5 和抖音构建产物下载。

本版是可玩图文试玩，未接入正式影片。抖音未配置 AppID，未完成平台账号接入和真机验收；上传 GitHub 不代表已在抖音上线。正式发布缺口见 [抖音小游戏说明](docs/douyin-mini-game.md)。

## 项目目录

- `src/`：Vue 3 / uni-app 网页与 App 前端、共享剧情引擎及素材。
- `src/data/story.runtime.json`：当前运行剧情。
- `douyin/`：Canvas / tt API 小游戏及浏览器预览适配层。
- `story-studio/`：本地剧情编辑器，不进入玩家构建包。
- `scripts/`：构建和验证工具。
- `docs/`：设计、素材来源及平台接入记录。

运行 `npm run story:studio` 启动本地故事树编辑器，以终端给出的地址为准。操作见 [Story Studio 说明](story-studio/README.md)。

## 交付记录

- [基础版 v1.0.0](docs/base-v1.0.0.md)
- [青崖山剧情与美术设计](docs/qingya-art-and-design.md)
- [抖音小游戏导入](docs/douyin-mini-game.md)
- [横竖屏实现与边界](docs/rotation.md)
