# 青崖山开门 · 第一卷设计更新

第一卷以用户提供的剧本文档为剧情依据，35 段可阅读的图文故事，五幕推进。保留官方救援、CR-07 的认知边界、基础设施建设和百鬼街的 72 小时安置—分区—服务抵租—街契流程。三个卷末落款是玩家选择的后续发展方向，共享 47 家商户、1 个合作主体的剧情事实，不冒充三条不同的原作结局。

## 可玩内容

- 供水、后勤、安置、秩序、观察、合作六项 0–100 指数；数值是试玩抽象状态，不是物资数量。
- 决策显示变化预告，执行后保存结果与回声；重建手记保留本周目决定。
- 6 个建设里程碑随剧情完成；12 项生态档案仅在实际抵达节点后解锁。
- EP12 转移至 EP13 青崖山时解锁余烬鎏金，之后可自行切换。新周目保留已解锁外观。
- 横版 H5 与原生 Canvas 竖屏小游戏使用同一故事和引擎。旧恋爱试玩存档不删除，新卷使用独立键。

## 美术

运行时场景位于 `src/static/scenic/worlds/`。market、refugees、wetland、titan 为用户四张参考图的优化 JPEG。qingya 与 exam 由内置 imagegen 生成，分别补齐重建营地和考场开端。保留原始透明按钮、纹理与装饰的 alpha；沿边框内缘裁切填色。

这些图是世界观场景示意，部分剧情段落共用概念场景，不是 35 集逐镜头成片。人物档案使用场景示意，尚未单独制作全角色立绘。

### 内置 imagegen 提示词：qingya.jpg

Use case: stylized-concept. Asset type: full-screen cinematic landscape game background, 16:9, no UI. Create one extremely detailed photoreal cinematic frame for Chinese speculative game “万界开了，我在末日景区搞基建”. The look is tactile realism, warm backlit golden hour and jade green ecology, fine air haze, credible modern China blended with the fantastic, natural faces, not anime or painterly. Subject: 23-year-old Chinese woman Xu Zhiwei, dark slightly messy shoulder-length hair, simple off-white shirt and olive utility vest, canvas shoulder bag and folded paper ledger, three-quarter profile on right side of foreground, thoughtfully watching rebuilding work. Scene: a disused modern mountain visitor center in Qingya Mountain, terraced concrete paths, old cableway tower, lush green cliff and real reservoir in distance. Ordinary evacuees cooperate with a gray-haired repairman on a water pump and blue water pipe, a medic organizes supplies under an awning, a kitchen steams, folding cots are being unloaded. Modern infrastructure, fire hydrant, utility boxes and repair tools remain visible. Small white translucent plants invade a shallow gutter near edge of path: subtle unfamiliar ecology, not magical UI. Background beyond mountain ridge has a very distant upside-down city suspended among clouds, subtle and plausible scale. Composition: wide cinematic establishing shot, woman on right third, left and middle open to meaningful environmental storytelling and suitable dark green shaded areas for white UI title overlay; no legible written text, no text, no logos, no frames or watermarks. Hopeful, grounded, people creating a home after a disaster. No castle, no swords, no superhero combat, no gothic horror, no glamor fashion.

### 内置 imagegen 提示词：exam.jpg

Use case: stylized-concept. Asset type: 16:9 cinematic photoreal game establishing scene with no text or UI. Present-day Chinese city, just outside a public civil-service examination school in warm late afternoon. A 23-year-old Chinese woman with shoulder-length slightly messy black hair, ordinary white shirt, olive green utility vest and canvas bag holds a transparent sleeve containing a blank exam permit, stands at right foreground looking with quiet shock across the road. She must look like a grounded ordinary young adult, not a glamorous model. The mundane modern apartment blocks, pharmacies with indistinct signs, bicycles, school fencing and people leaving exams are hyperreal and tactile. A narrow piece of the asphalt road has been spatially replaced by a jade-green reed-lined lake between two modern buildings; water level is physically below pavement, a small silver translucent amphibious fish leaps, unfamiliar tiny four-winged insects among white water lilies. A child and his mother stand safe on sidewalk with a security guard; no one in water. Nature has entered the modern city without a glowing portal. Far clouds reflect a barely visible upside-down architectural silhouette, no giant planet. Cinematic naturalistic golden backlight, rich emerald foliage, weathered stone and water reflections, fine airborne moisture. Wide lens, delicate depth, believable scale and anatomy. Calm awe and human empathy, no combat, no anime, no titles, no lettering, no interface, no collage. Left half offers scenic detail and enough dark foliage/road shadows for game dialogue overlay.

## 验证与发布边界

脚本验证 35 段可达性、3 个落款各两种资源策略、12 项观察、检查点恢复、存档往返、重复进入不重复加资源、皮肤解锁与编辑器发布一致性。Canvas 验证五种手机尺寸、视频适配器生命周期和无 DOM 的 tt 环境启动。

目前为图文试玩包。未提供 AppID，未完成抖音正式发布账号、实名防沉迷和真机审核；不能将浏览器预览等同于已上线抖音。
