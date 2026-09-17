# 万界开了，我在末日景区搞基建

当前主线为《青崖山开门》第一卷：35 段图文剧情、五幕、12 项生态观察、建设手记与通关解锁双皮肤。横版运行 `npm run dev:h5`，抖音竖屏预览运行 `npm run dev:douyin`。

本次设计、素材来源和验证见 [青崖山设计说明](docs/qingya-art-and-design.md)。正式抖音发布尚需 AppID、平台接入与真机验证。

---

# 万界景区 · 互动剧情项目

已新增抖音小游戏竖屏试玩客户端：`npm run dev:douyin` 启动预览，`npm run build:douyin` 生成 `dist/douyin/`。使用独立 Canvas / tt API，复用剧情引擎与双皮肤解锁；不会覆盖 H5 的存档。

横版 Vue/H5 保留在 `src/`，竖屏抖音客户端在 `douyin/`，两端都提供纸白与黑金皮肤。

| 版本 | 本地预览 | 发布构建 |
| --- | --- | --- |
| 横版 Web/H5 | `npm run dev:h5` → `http://localhost:5173/` | `npm run build:h5` → `dist/build/h5/` |
| 竖屏抖音试玩 | `npm run dev:douyin` → `http://localhost:5174/` | `npm run build:douyin` → `dist/douyin/` |

先安装 Node.js 22+，再运行 `npm ci`。两端边框使用共同的内沿轮廓定义，底色和纹理会随九宫格边框缩放裁切。

**当前是试玩包：正式视频与景区剧本尚未接入，运行剧情仍为原「沈知意」故事。** 导入、媒体配置、验证结果及发行缺口见 [抖音小游戏说明](docs/douyin-mini-game.md)。

## 原项目框架

uni-app + Vue3 + TypeScript 互动电影前端。目标端：Web/H5、iOS、Android，并预留桌面封装能力。

## 核心约定

- 剧情配置驱动：`V`(Video) / `P`(Page) / `C`(Choice) / `I`(Image) / `T`(Text) / `R`(Route Closed) / `END`
- 前端页面不硬编码大量分支；分支写在 `src/story/`
- 现有原型数据仍在 `src/data/story.ts`；`src/story/index.ts` 做兼容桥接
- `src/store/game.ts` 暂保留，后续拆到 player / story / evidence / character / settings

## 目录结构

```text
uniapp_interactive_movie/
├─ src/
│  ├─ pages/           # 交互页（P 节点壳）
│  ├─ components/      # 按域拆分的 UI（common/video/choice/phone/...）
│  ├─ story/           # 节点、选择、结局、条件配置
│  ├─ data/            # 静态目录数据（含旧 story.ts）
│  ├─ store/           # 运行时状态
│  ├─ engine/          # 剧情引擎占位（下一步实现）
│  ├─ types/           # 共享类型
│  ├─ composables/     # 组合式函数
│  ├─ services/        # 存储 / 媒体 / 埋点 / API
│  ├─ utils/           # 工具函数
│  ├─ styles/          # 主题与响应式
│  ├─ static/          # 视频、海报、人物、证据、音频等资产
│  └─ config/          # 应用 / 路由 / 剧情 / 主题配置
├─ docs/               # 架构与规范文档
└─ scripts/            # 剧情与资产校验脚本
```

## 推荐运行方式

1. 使用 HBuilderX 新建 **uni-app Vue3 + TypeScript** 项目，用本仓库 `src/` 覆盖。
2. 或在支持 uni-app 的 Vite CLI 环境安装依赖后运行：

```bash
npm install
npm run dev:h5
```

## 数据流

`VIDEO → CHOICE_OVERLAY → CHOICE → STATE/FLAG → VIDEO/PAGE/ENDING/ROUTE_CLOSED`

## 静态资源

仓库不含真人视频素材。请放入 `src/static/videos/` 对应章节子目录，并在剧情配置中填写路径。命名规范见 `docs/media-naming.md`。

## 文档

- `docs/architecture.md` — 架构分层
- `docs/story-node-spec.md` — 节点规范
- `docs/media-naming.md` — 媒体命名
- `docs/ending-rules.md` — 结局规则
- `docs/asset-guide.md` — 资产生成指南

## 本机故事树后台

运行 `npm run story:studio`，打开 http://127.0.0.1:5174 ，用视频缩略图、拖拽连线和右键菜单编辑剧情。后台是同仓库独立子项目，不在玩家页面与安装包中。详细操作见 [Story Studio 使用说明](story-studio/README.md)。
