# 视觉素材工作流

- 所有原始 PNG、JPG 和 ZIP 保留原位。ZIP 内 24 张参考图复制到 docs/ui-reference，不整张作为运行页面。
- scripts/ui-asset-manifest.json 记录语义 key、原文件、矩形裁切坐标、白底清理、相框内窗透明化和目标文件。
- npm run assets:extract 根据 manifest 重建 77 张 PNG 和 src/config/ui-assets.ts。
- 提取器优先使用本地 sharp；也支持 ASSET_SHARP_PATH，以及本机已安装的 Codex 依赖运行时。其他机器可安装 sharp 后运行。
- npm run assets:audit（别名 npm run audit:assets）检查文件存在、PNG 尺寸、registry、页面可达引用、硬编码路径和未分类文件；更新 docs/asset-inventory.md 与 docs/asset-audit.json。
- src/data/backgrounds.ts 管理 16 个背景用途键；src/data/gallery.ts 管理 25 个图库条目。
- AssetImage 负责读取 registry key / registry 路径、fallback、fit、lazy-load 与开发错误提示；AssetButton / AssetPanel / SceneBackdrop 复用素材，不写另一套按钮底板。
- 参考图纯画面裁片分辨率偏低。人物暂无完整高清立绘；暂配头像的身份与清晰度已在 inventory 和页面注明。
- 章节页的卡片是场景预览，不会跳过剧情或重写选择；未接入剧情的辅助路由仅替换视觉外壳，不新增故事。
