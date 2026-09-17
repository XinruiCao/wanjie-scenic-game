# UI 资产接入诊断报告

诊断日期：2026-09-12。项目：`/Users/jc/Desktop/uniapp_interactive_movie`。

本轮仅诊断并新增本报告，不修改页面、素材、剧情、倒计时或存档。依据是当前源代码、素材 manifest、已有审计数据以及用户本次提供的五张图；没有把粘贴分析中的“大概率”当作已验证结论，也没有进行全页面运行时视觉验收。

## 结论与判定口径

当前不是播放器、Choice、命运地图素材大面积未接入。77 条 runtime manifest 对应的文件均存在；Choice 三态、计时环、顶部图标、节点、连线已经有组件引用。用户图 5 也直接证明 Choice 图片已经显示。主要差距是文字安全区、首页素材风格/构图、部分组件使用通用替代素材，以及独立高清素材不足。

- CONNECTED：对应图片或图片组合已注册并被目标页面的组件链引用；不保证此刻可见、视觉完全复刻或交互效果验收通过。
- GENERATED_NOT_CONNECTED：已有素材可用于此功能，但目标页面尚未引用；外部新增附件会特别注明尚未导入。
- REFERENCE_ONLY：只有整页构图/参考，没有为该用途拆出独立运行时组件素材。
- MISSING：扫描范围内既无对应素材，也无可确认参考。低清、错位、条件隐藏不会自动归入此类。

`ui-assets key` 省略统一前缀 `uiAssets.`。路径相对项目根目录。图例用节点图片与 Vue 文字组合，不能因没有 legend.png 判为缺失。

## 功能逐项核对

前 29 行为指定清单，最后 3 行补充本次图片暴露的差距。

| UI功能 | reference中是否存在 | 项目里是否有对应图片 | runtime目录 | ui-assets key | 当前页面是否引用 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| home background | 有：01-home / 图 3、4 | 有 | src/static/backgrounds | scenes.engagement | P002 home → backgrounds.home；已接订婚场景，非参考中的多人构图 | CONNECTED |
| menu active | 有：15 / 图 1、4 | 有 | src/static/ui/menu | menu.active | P002 home，active===i | CONNECTED |
| menu idle | 有：01 / 图 1、4 | 有 | src/static/ui/menu | menu.idle | P002 home，非选中项 | CONNECTED |
| choice normal | 有：02、16 / 图 4、5 | 有 | src/static/ui/choice | choice.normal | P004/P005、P028 → ChoiceOverlay；按交互状态显示 | CONNECTED |
| choice hover | 有：02、16 / 图 4、5 | 有 | src/static/ui/choice | choice.hover | P004/P005、P028 → ChoiceOverlay；按交互状态显示 | CONNECTED |
| choice selected | 有：02、16 / 图 4、5 | 有 | src/static/ui/choice | choice.selected | P004/P005、P028 → ChoiceOverlay；按交互状态显示 | CONNECTED |
| countdown ring | 有：18 / 图 4 | 有 | src/static/ui/icons | icons.countdown | ChoiceOverlay，seconds>0 才显示；C_M03 配置 30 秒 | CONNECTED |
| pause icon | 有：22 / 图 4 | 有 | src/static/ui/icons | icons.pause | play 播放控制；暂停图标按播放状态切换 | CONNECTED |
| subtitle icon | 有：22 / 图 4 | 有 | src/static/ui/icons | icons.subtitles | play 播放控制；暂停图标按播放状态切换 | CONNECTED |
| settings icon | 有：22 / 图 4 | 有 | src/static/ui/icons | icons.settings | play 播放控制；暂停图标按播放状态切换 | CONNECTED |
| progress decoration | 有：02 / 图 4 | 有 | src/static/ui/decorations | decorations.line | play 底部进度装饰 | CONNECTED |
| glass panel | 有：07、05 / 图 4 | 有 | src/static/ui/panel | panel.large | P028 ChoiceOverlay mirror-panel；多个页面经 AssetPanel 使用；为现有替代样式 | CONNECTED |
| crack overlay | 有：07、09 / 图 4 | 有 | src/static/ui/decorations | decorations.crack | P028、SceneBackdrop、ROUTE_CLOSED；透明叠加 | CONNECTED |
| gold divider | 有：多个参考页 | 有 | src/static/ui/decorations | decorations.divider | 首页以外多个页面的 visual-divider | CONNECTED |
| character sidebar item | 有：17 / 图 4 | 有 | src/static/ui/character | character.active、character.idle | P016 character 侧栏；EvidenceScene 分类条也复用 | CONNECTED |
| character portrait frame | 有：06、19 的人物/头像构图 | 有可复用圆环；无人物档案专属 key | src/static/ui/destiny | destiny.ring | P016 未引用圆环；profile-avatar 仅圆形裁切。现有圆环只用于命运地图中心，可供后续复用 | GENERATED_NOT_CONNECTED |
| evidence card | 有：05、23 / 图 4 | 有 | src/static/ui/frames | frames.photo | P015 → EvidenceScene 主图框；内窗透明 | CONNECTED |
| evidence thumbnail frame | 有：23 / 图 4 | 有 | src/static/ui/frames | frames.card | P015 → EvidenceScene 缩略图框 | CONNECTED |
| destiny video node | 有：08、19 / 图 4 | 有 | src/static/ui/destiny | destiny.node | P033 → DestinyNode 按节点类型映射；当前为符号节点，非参考完全复刻 | CONNECTED |
| destiny page node | 有：08、19 / 图 4 | 有 | src/static/ui/destiny | destiny.moon | P033 → DestinyNode 按节点类型映射；当前为符号节点，非参考完全复刻 | CONNECTED |
| destiny choice node | 有：08、19 / 图 4 | 有 | src/static/ui/destiny | destiny.eye | P033 → DestinyNode 按节点类型映射；当前为符号节点，非参考完全复刻 | CONNECTED |
| destiny route closed node | 有：08、19 / 图 4 | 有 | src/static/ui/destiny | destiny.closed | P033 → DestinyNode 按节点类型映射；当前为符号节点，非参考完全复刻 | CONNECTED |
| destiny ending node | 有：08、19 / 图 4 | 有 | src/static/ui/destiny | destiny.lotus | P033 → DestinyNode 按节点类型映射；当前为符号节点，非参考完全复刻 | CONNECTED |
| destiny true route node | 有：08、19 / 图 4 | 有 | src/static/ui/destiny | destiny.true | P033 → DestinyNode 按节点类型映射；当前为符号节点，非参考完全复刻 | CONNECTED |
| destiny connector | 有：08 / 图 4 | 有 | src/static/ui/decorations | decorations.line、decorations.crack | P033 → DestinyEdge；普通线/断裂线 | CONNECTED |
| destiny legend | 有：21 / 图 4 | 有：六类节点组件拼装 | src/static/ui/destiny | destiny.node、destiny.moon、destiny.eye、destiny.closed、destiny.lotus、destiny.true | P033 legend 循环 DestinyNode + Vue 标签；不需要一张整块图例 PNG | CONNECTED |
| route closed frame | 有：09 / 图 4 | 有 | src/static/ui/panel | panel.large | route-closed → AssetPanel；复用通用框 | CONNECTED |
| ending button | 有：20 / 图 4 | 有 | src/static/ui/buttons | buttons.active、buttons.idle、buttons.light | ending → AssetButton；END06 使用 light | CONNECTED |
| ending poster frame | 有：10 的结局页构图；独立海报框未确认 | 只有整页结局参考；通用相框不能算已接到结局页 | — | — | ending 当前为背景 + 文案 + 详情面板；没有独立海报框组件或 key | REFERENCE_ONLY |
| 本次图 2：碎镜波光菜单条 | 有：用户提供独立图片 | 项目内无；用户指定外部路径有原图 | — | — | 未进入项目、未注册、home 未引用；白底源图需处理后才适合作运行时覆盖层 | GENERATED_NOT_CONNECTED |
| 本次图 3/4：多人豪华首页构图 | 有：整页参考 | 有整页设计；未找到对应无字高清背景 | — | — | 现用订婚场景；图 3 含烘焙菜单、标题、固定统计，不能当作无字背景直接铺入 | REFERENCE_ONLY |
| 命运地图逐节点人物头像 | 有：08 / 图 4 | 有头像和圆环；部分头像为低分辨率裁切 | src/static/characters/shenzhiyi；src/static/characters/zhouxuchuan；src/static/ui/destiny | portraits.shenzhiyi、portraits.zhouxuchuan、destiny.ring | DestinyNode 支持 portrait，但 P033 visited 循环未传；仅中心人物已连接 | GENERATED_NOT_CONNECTED |

## 统计

按上表全部 32 个功能项统计（不是图片张数）：

- CONNECTED = 27
- GENERATED_NOT_CONNECTED = 3
- REFERENCE_ONLY = 2
- MISSING = 0

其中指定的 29 项：CONNECTED = 27，GENERATED_NOT_CONNECTED = 1，REFERENCE_ONLY = 1，MISSING = 0。

MISSING = 0 不表示所有高清原图齐全；有整页参考而缺独立素材的项目归为 REFERENCE_ONLY。也不代表需要生成图片的比例为零，后续应先确认原始高清源文件是否另存他处。

## 两处截图问题的定位

### 图 5：Choice 文字越过左侧圆饰

`src/components/choice/ChoiceOverlay.vue` 的 `.choice-skin` 绝对定位铺满按钮并以 fill 拉伸；正文却固定 `padding:13px 30px 13px 65px`。左圆饰随按钮尺寸缩放，文字安全区不会同比变化。图中开发者编号也显示在 `.choice-content`，进一步占用高度。普通窄屏样式调整字体和最小高度，却没有同步调整左边安全区；P028 又有独立的 55px / 32px 左边距。

因此应先按素材实际圆饰和边缘定义正文安全区，再验证窄屏、长选项、开发模式以及 P028；编号应与正文分别布局。不能通过继续生成同类按钮图片来修复。本轮未改 CSS。

### 首页：图片接通了，但样式与参考不一致

`src/pages/home/index.vue` 正在使用 `menu.active/idle`，两者从已有面板 sheet 裁出，均有明显花饰边框。图 4 首页是较轻的普通菜单分隔线与突出的选中态，构图也不同。因此“已引用 PNG”和“符合参考”是两件事。

本次图 2 是新的碎镜波光条，位于用户提供的外部 UI 路径，尚未被当前 manifest/registry 使用。图 3 是整页设计，包含文字和固定数字，不能整体作为可交互首页背景。后续应优先查找无字多人背景原图，将图 2 去白底、裁边、语义化登记后接入，并分别设计选中与普通状态；本轮未执行这些修改。

## 页面覆盖与条件显示

- P002：home → SceneBackdrop / 菜单图片 / AssetPanel，背景映射为 `backgrounds.home = uiAssets.scenes.engagement`。
- P004/P005：play → ChoiceOverlay，播放控制直接引用 icons；计时环受 `seconds > 0` 控制。剧情当前 `C_M03.countdown = 30`，不能拿参考的“5”认定环未接入，也不能为显示图标修改剧情计时。
- P015：EvidenceScene 已使用主图框、缩略图框和证据图片。
- P016：侧栏图片、头像、状态图标已用；圆形头像裁切不等于装饰头像框已接入。
- P028：复用 ChoiceOverlay 的 major 模式，含玻璃面板、裂纹、中央人物；布局与参考仍有差距。
- P033：DestinyNode 六类符号、DestinyEdge、组合图例、中心头像均有引用；逐节点人物头像没有传入。
- ROUTE_CLOSED：通用面板、裂纹、分隔和图片按钮已用。
- ENDING：背景、图片按钮及详情面板已用；没有独立结局海报框。

## 扫描依据与边界

核查 `scripts` 的 PNG/JPG 与素材清单、`docs/ui-reference`、`src/static/ui`、`src/static/backgrounds`、`src/static/posters`、`src/static/characters`，以及 `src/config/ui-assets.ts`、`src/data/backgrounds.ts`、`src/data/gallery.ts` 和上列页面/组件。ZIP 已有拆分参考文件供核查；本轮没有重新提取或修改它。

现有 `docs/asset-audit.json` 记录 31 个输入图、77 个运行时素材、25 个参考输入、3 个 source sheet、3 个原始场景源图、108 个项目图片文件，unused 为 0；本轮另外核实 manifest 的 77 个目标文件都存在。旧审计的动态 group 引用会扩展到多个页面，不能证明每个 variant 在每页都实际渲染，所以本报告针对关键功能检查实际模板绑定，而不直接照抄旧审计的页面集合。

原始素材表：`scripts/ui-asset-manifest.json`；注册表：`src/config/ui-assets.ts`；背景映射：`src/data/backgrounds.ts`。背景和图库有复用及参考裁片，不能把数量理解为同等数量的独立高清场景或角色立绘。当前证据不支持“全套高清人物立绘已经齐全”的判断。

本次额外核对的外部原图：

- ` /Users/jc/Desktop/影游/第一个剧本/UI/310bbcb4-1a39-46e3-a485-90171a9af7e0 (1).png`（图 2）。
- ` /Users/jc/Desktop/影游/第一个剧本/UI/36dd7005-55ca-4fd5-bb91-a3f204ae7563.png`（图 3）。

未穷举用户整个桌面素材库；不能把“项目内没有”推断为“磁盘上完全没有”。下一步优先修复 Choice 安全区和首页素材匹配，再处理头像框、逐节点头像、结局海报组件；只有确认源图不存在后再决定是否补图。
