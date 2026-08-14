ST-Commands-cat v1.6

修正策略：
- 貓頭使用 onclick、ontouchend、addEventListener(click)、addEventListener(touchend) 四重觸發。
- 再加 document capture fallback，避免 SillyTavern / iOS Chrome 攔截事件。
- 浮動按鈕與面板強制最高 z-index。
- 貓頭只負責開面板；🐾 只負責拖動。

若 v1.6 仍完全無法打開，代表問題不是點擊事件，而是 panel() 建立階段本身報錯。這時需要查看瀏覽器 Console。
