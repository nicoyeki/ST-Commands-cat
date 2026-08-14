ST-Commands-cat v1.4

操作：
- 輕按貓貓：直接開／關快捷指令面板。
- 長按約 0.32 秒再拖：移動貓貓位置。
- 普通手指微小晃動不會誤判成拖動。

修正：
- 不再依賴 touchend 判斷輕按。
- 面板開啟同時使用 class 與 inline display fallback，排除 CSS 顯示問題。
- 保留 #A9C4F4、白色貓頭及原有 localStorage 指令。
