# 随手机转动切换横竖屏

网页依赖浏览器窗口变化自动重排；App 全局 pageOrientation 为 auto，manifest 保留竖屏及两个横屏方向。不要在进入剧情时锁定方向。

抖音 game.json 的 portrait 仅指定启动方向，不使用不受支持的 auto 值。运行时在 canIUse 确认转屏能力后，开始加速度监听；稳定 600ms 后调用 setDeviceOrientation。平放、摇动、对角姿态不切换，成功后冷却 1200ms；在 success 或窗口变化事件后读取实际尺寸并重绘。后台停止监听；宿主拒绝时停止自动请求，返回前台后再尝试。未提供 AppID，传感器轴向与具体机型仍需真机验收。

Canvas 横屏有独立首页与左右分栏剧情布局，竖屏使用原上下布局。旋转仅更新尺寸、取消旧触摸，不重建游戏会话、不推进剧情、不重新加载媒体。其他页面随可用宽度重排并保留滚动。

已验证 320×568、390×844、430×932 对应的双向旋转，所有页面点击区域不越界；覆盖存档不变、旧触摸取消、传感器防抖、异步成功和宿主失败。浏览器实测 390×844 与 844×390 的网页及 Canvas 布局。

## 平台边界

手机浏览器在系统锁定屏幕方向时不会提供旋转后的窗口。游戏不能绕过系统锁。

抖音基础库 3.66.0 起提供转屏，直播、分屏、直玩、Pad 和折叠屏等场景存在限制。当前实现覆盖项目已有网页、App 配置和抖音客户端，不能承诺所有未接入平台都具备相同能力。

官方依据：
- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/javascript-api/device/orientation/tt-set-device-orientation
- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/javascript-api/device/jerkmeter/tt-on-accelerometer-change
- https://uniapp.dcloud.net.cn/collocation/pages
- https://uniapp.dcloud.net.cn/collocation/manifest
