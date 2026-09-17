# 玩家端视觉精修完成报告

## 1. 修改文件

已修改原项目 `/Users/jc/Desktop/uniapp_interactive_movie`，原服务 `http://localhost:5173` 已显示新版首页。修改前创建 Git 基线提交 `bcb5ad6`（before full frontend visual polish）。本轮代码、素材和清单涉及 72 个文件，详细列表附后；本报告单独新增。

核心文件包括 ChoiceItem/ChoiceOverlay、MoviePlayer、CharacterPortraitFrame、DestinyNode/DestinyEdge、EndingPoster、AssetImage/AssetPanel/AssetButton，十个玩家页面，全局四个样式文件及素材配置。新增 `story-visuals.ts` 仅承载展示元数据。

## 2. 每页优化内容

| 页面 | 实际修改 |
|---|---|
| P002 首页 | 普通菜单退为薄线和小菱形，碎镜波光用于选中态；文字标题下移，人物脸保持可见；进度面板降低装饰强度；按剧情阶段换背景。 |
| P004/P005 播放器 | 真人帧为底，顶部自动/字幕/设置，底部暂停/时间/进度/声音/全屏；无操作 3 秒收起控制。Choice 保留上一段电影层，右侧渐变保持文字可读。 |
| P008/P009 手机 | 手机实体、状态栏、应用入口、带头像/时间/未读点的消息列表、联系人聊天、私人草稿、照片查看。聊天气泡无金框。 |
| P015 线索 | 分类、主证据、推论、缩略图分区；主图只留 5px 安全边，薄框；缩略图切换和放大可用。 |
| P016 人物 | 独立头像圆环、选中态、人物展示区、基本信息/关系事件/隐藏内容标签；正式模式不显示状态数字。 |
| P028 重大选择 | 独立戏院背景、中心人物、左右碎镜区域、局部高亮与其他分支弱化；首周目隐藏不可选项，二周目显示模糊轮廓。 |
| P033 命运地图 | 中心人物、非规则分布、节点避让、六类配色、真实历史连线、轻流动点、重要人物头像、悬停说明与点击详情。 |
| ROUTE_CLOSED | 文案和三个操作移向画面中左/左下，缩小面板覆盖，保留完整电影背景及精确回退。 |
| ENDING | 统一 EndingPoster；结局编号、标题、短句、真实本周目选择与探索信息；END06 使用明亮高维原图与玉绿文字。 |
| P034 章节 | 横向电影卡片；窄屏双列；探索度来自现有节点访问记录，未展开章节不伪造完成度，未阅画面降饱和。 |
| P036 图库 | 从 gallery.ts 读取 31 条图像记录，包含六个人物展示图；新增 CG 分类；全屏、前后切换、滑动、缩放、Esc 关闭。 |
| P038 设置 | 画面/声音/游戏/语言/关于五个标签；字幕和静音实际作用于播放器，其余说明清晰显示。 |

## 3. Choice 安全区

正文左边距使用 `--choice-safe-left: clamp(76px,18%,118px)`，右边距使用 `clamp(24px,8%,40px)`。按钮图片用 border-image 切片保留左右装饰尺寸，不再把整条图片随意拉伸；文字可以自然换行。

开发编号独立定位，普通 Choice 在右上沿，P028 在镜片内上沿，不参与正文排版。选中态仅增加边缘波光并缩至 .985，不整块变白。禁用默认白底已移除。

H5 的 uni-button 已补上 role/tabindex；方向键使用实际 DOM 焦点，Enter/Space 激活当前项，Esc 暂停。实测长文本在 844×390 中仍位于安全区，普通与重大选择最小高度均不低于 44px。

## 4. 首页怎么改

以当前订婚原始场景为序章主体，避免铺入带菜单和数字的整页设计图。菜单约 21vw、标题约 42vw、右侧信息约 15vw；窄横屏按高度收紧，竖屏使用上部人物、下部双列菜单与进度布局。

`getHomeBackground(gameState)` 根据当前/最近展示主题及章节映射八类阶段背景。没有为了背景更换修改 flag、剧情 target 或章节结果。

## 5. 新接入哪些既有素材

本轮没有生成 AI 图片。新增导入 12 份用户既有原文件：碎镜波光条、七份人物设定源图、四张完整场景图。原件均保留。

- `menu.activeWave`：用户图 2，裁白边并透明化，实际用于首页选中态。
- 六个人物的 portrait 更新为相应源图裁片；新增六个 `hero.*` 独立人物区域。
- 万界码头、高维、莲池、END06 改用独立完整场景原图，升维阶段复用高维原图。
- 沈知意人物区域去掉绿色板背景；圆环内窗透明化。

外部原图来自 `/Users/jc/Desktop/影游/第一个剧本`。本轮发现的这些文件超出上一轮只核查项目和指定附件的范围，因此此前“只有小裁片”的结论不能用于整个桌面素材库。

## 6. Character 头像框怎么接

`CharacterPortraitFrame.vue` 组合 portrait 与 `uiAssets.destiny.ring`。修正圆环内部不透明白色区域后，头像显示在透明内窗里；组件用于人物列表、档案头像和重要命运节点。当前人物加强细光，其余头像弱化。

## 7. Destiny 头像节点怎么接

`story-visuals.ts` 为现有重要节点提供 characterId，P033 根据该字段查找角色 portrait 并传入 DestinyNode。普通节点继续使用六类符号；连线仍由真实访问记录、choiceHistory 和原始 target 得到。布局加入节点间距调整，宽屏整体居中，小屏容器内可滚动查看。

## 8. EndingPoster 怎么实现

由 SceneBackdrop、局部 crack、divider、薄面板和 Vue 文本构成，没有整页截图充当界面。结局档案读取当前/归档周目的选择历史，END06 使用象牙白、淡金与玉绿。

目前没有完整结局 MP4，因此“观看完整结局”明确禁用并提示影片尚未提供；没有用静态图假装视频。命运地图、开始下一周目和返回首页均可操作。

## 9. 响应式处理

检查尺寸：1920×1080、1024×768、844×390、390×844。使用 clamp、视口尺寸、安全区、局部滚动和真实重排，没有对整页 transform scale。

剧情视频/Choice 在竖屏显示旋转提示，同时暂停展示层计时，避免用户旋转前自动失去选择；手机与档案等页面允许竖屏浏览。动画尊重 prefers-reduced-motion。全局 z-index token 区分电影、选择、手机、模态和调试层。

## 10. H5 测试

64 个页面/状态与尺寸组合：页面级横向溢出 0、MISSING ASSET 0、HTTP 素材错误 0、运行时/阻塞性控制台错误 0。最后调整的页面单独复测并更新结果。

10 项实际交互回归全部通过：Choice 方向键与 Enter 原目标跳转、长文安全区、两周目隐藏规则、手机联系人/聊天/草稿/照片、证据切图、人物标签、图库切换/缩放/Esc、设置标签与字幕开关、断路精确回退、结局进入命运图。

测试使用独立临时 Chrome 与 5175 端口，存档由原 StoryEngine 生成，不改用户 5173 存档。验收截图含开发模式编号；生产构建会隐藏开发界面。真实 MP4 不存在，播放中的解码、音画同步和循环视频画面未实测。

`validate:story` 通过：45 节点、六结局、隐藏选择、回退快照、迁移与新周目等。Git 对比确认 `src/engine`、`src/data/story.ts`、`src/data/endings.ts`、`src/store/game.ts`、`src/types/state.ts` 没有修改。

## 11. Build 结果

原项目 `npm run dev:h5`、`npm run build:h5` 通过。Vue 模板与 TS 全量类型检查通过（vue-tsc 3.3.11 + TypeScript 5.9.3，临时检查工具，未改项目依赖）。构建仅保留 Sass legacy-js-api 弃用提示，不阻塞编译。

## 12. Assets audit 结果

`npm run assets:audit` 通过：43 个输入、84 个 runtime 素材、25 个参考、10 份 source sheet、8 个原始 runtime 输入；项目物理图片 127，unused 0。所有运行素材已登记并存在可达页面引用。源码页面不直接引用 scripts UUID 图，也没有整页 reference 铺底。

## 13. 仍存在的视觉问题

- 无字多人首页大图仍未找到，首页继续采用订婚原图，未冒用带烘焙 UI 的群像参考。
- 学校场景、部分证据仍是低清裁片；林小满和许哲仍是暂配头像，人物素材与电影帧的造型一致性还需统一。
- 部分人物是设定表裁切及去背景结果，边缘和全身构图仍不等同于专门制作的透明立绘；P028 使用现有人物正面构图，没有专属背影原图。
- 剧情及完整结局 MP4 尚未提供，当前仍由真实场景海报承接可玩流程。

## 实际页面截图与验收数据

![玩家端实际页面总览](/Users/jc/Documents/Codex/2026-09-12/files-mentioned-by-the-user-uniapp/outputs/玩家端视觉精修-实际页面总览.jpg)

[64 项页面检查 JSON](/Users/jc/Documents/Codex/2026-09-12/files-mentioned-by-the-user-uniapp/outputs/visual-qa-results.json) · [10 项交互检查 JSON](/Users/jc/Documents/Codex/2026-09-12/files-mentioned-by-the-user-uniapp/outputs/interaction-qa-results.json)

## 修改文件完整清单

以下路径均相对项目根目录，包含新增/修改素材，不包含本报告本身。

- `docs/asset-audit.json`
- `docs/asset-inventory.md`
- `index.html`
- `scripts/asset-sources.json`
- `scripts/audit-ui-assets.mjs`
- `scripts/extract-ui-assets.mjs`
- `scripts/ui-asset-manifest.json`
- `src/App.vue`
- `src/components/choice/ChoiceItem.vue`
- `src/components/choice/ChoiceOverlay.vue`
- `src/components/common/AssetButton.vue`
- `src/components/common/AssetImage.vue`
- `src/components/common/AssetPanel.vue`
- `src/components/destiny/DestinyEdge.vue`
- `src/components/destiny/DestinyNode.vue`
- `src/components/ending/EndingPoster.vue`
- `src/components/evidence/EvidenceScene.vue`
- `src/components/phone/PhoneScene.vue`
- `src/components/video/MoviePlayer.vue`
- `src/config/ui-assets.ts`
- `src/data/backgrounds.ts`
- `src/data/characters.ts`
- `src/data/gallery.ts`
- `src/pages/chapters/index.vue`
- `src/pages/character/index.vue`
- `src/pages/destiny/index.vue`
- `src/pages/ending/index.vue`
- `src/pages/gallery/index.vue`
- `src/pages/home/index.vue`
- `src/pages/play/index.vue`
- `src/pages/route-closed/index.vue`
- `src/pages/settings/index.vue`
- `src/static/backgrounds/ascension.png`
- `src/static/backgrounds/harbor.png`
- `src/static/backgrounds/highDimension.png`
- `src/static/backgrounds/lotus.png`
- `src/static/backgrounds/true-ending.png`
- `src/static/characters/gulinchuan/portrait.png`
- `src/static/characters/liangyan/portrait.png`
- `src/static/characters/shentingshan/portrait.png`
- `src/static/characters/shenzhiyi/portrait.png`
- `src/static/characters/wuxuanzhen/portrait.png`
- `src/static/characters/zhouxuchuan/portrait.png`
- `src/static/ui/destiny/ring.png`
- `src/store/settings.ts`
- `src/styles/animations.scss`
- `src/styles/responsive.scss`
- `src/styles/theme.scss`
- `src/styles/variables.scss`
- `src/utils/preload.ts`
- `scripts/home-menu-wave-source.png`
- `scripts/visual-sources/gulinchuan-sheet.png`
- `scripts/visual-sources/high-dimension.png`
- `scripts/visual-sources/liangyan-sheet.png`
- `scripts/visual-sources/lotus-landscape.png`
- `scripts/visual-sources/shentingshan-sheet.png`
- `scripts/visual-sources/shenzhiyi-outfit.png`
- `scripts/visual-sources/shenzhiyi-sheet.png`
- `scripts/visual-sources/true-ending-shore.png`
- `scripts/visual-sources/wanjie-harbor.png`
- `scripts/visual-sources/wuxuanzhen-sheet.png`
- `scripts/visual-sources/zhouxuchuan-sheet.png`
- `src/components/character/CharacterPortraitFrame.vue`
- `src/data/story-visuals.ts`
- `src/static/characters/gulinchuan/hero.png`
- `src/static/characters/liangyan/hero.png`
- `src/static/characters/shentingshan/hero.png`
- `src/static/characters/shenzhiyi/hero.png`
- `src/static/characters/wuxuanzhen/hero.png`
- `src/static/characters/zhouxuchuan/hero.png`
- `src/static/ui/menu/menu-active-wave.png`
- `src/utils/keyboard.ts`
