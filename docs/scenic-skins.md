# 景区双皮肤

- 山河新生（默认）：墨青花字、银蓝细框与山形朱印。
- 余烬鎏金（通关解锁）：金色花字、古金雕花细框与光芒。
- 首页、章节、设置提供皮肤切换；面板、按钮、剧情选择与章节卡共享主题素材。

## 当前素材：13 张独立透明 PNG

素材目录：`src/static/scenic/generated/`。本轮使用内置 `image_gen` 重新生成，没有从 UI1–UI4 直接裁图。

两张花字、两张按钮框、两张面板框、四张导航图标，以及光效、印章、细纹理各一张。按钮悬停/选中通过同一张透明框与前端光效表现；浅色图标通过显示滤镜调色。

所有文件保留生成时的 RGBA 像素。`ScenicSprite` 只在显示时略去图片外围的空白透明边距；可伸缩边框保留角部并拉伸直线部分。没有白底/黑底矩形，也不使用 screen/multiply 混合模式或柔边遮罩伪装透明。

- `docs/transparent-assets-prompts.json`：内置工具生成提示词。
- `docs/transparent-assets-audit.json`：逐文件 Alpha 审核结果。
- `scripts/prepare-transparent-assets.mjs`：读取 Alpha、验证中央透明区域、原样复制 PNG 并更新尺寸索引。
- `src/config/generated-scenic-assets.json`：独立 PNG 路径、原始尺寸和可见像素边界。
- `src/config/scenic-assets.ts`：组件语义别名。

原始 UI1–UI4 仅保留在 `docs/reference-ui/` 用于参考，已移出运行时静态目录。主视觉 `src/static/scenic/hero.png` 是场景背景，保留正常不透明图片。

## 通关判定

当前运行时剧情仍是原项目剧情，未改写为参考图中的景区故事。其章节字段大多标为序章，现阶段以 `P028` 有效选择完成序章，配置在 `src/config/themes.ts`。`SkinProgress.ts` 同时支持带章节字段的真实相邻章节连接；预览、单纯跳转或失败节点不视为通关。

解锁及选择保存在 `metaFlags.darkSkinUnlocked` / `metaFlags.scenicSkin`。首次完成自动切深色，之后尊重手动选择。新周目、回档保留；清空全部存档会重置。旧存档根据当前及归档选择记录补齐解锁。

## 验证

- `npm run test:skins`：解锁、回档、新周目、迁移及偏好存档边界。
- `npx tsc --noEmit`：TypeScript 检查。
- `npm run build:h5`：H5 构建。
- 生成 PNG 的 Alpha 通道与边框中央透明区域单独验证；浏览器检查浅色/深色及手机布局。
