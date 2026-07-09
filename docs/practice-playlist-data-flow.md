# 無限練習清單與自訂主題串資料流

這份文件整理三個操作入口的讀寫邊界：

- 學生播放頁：`practice-playlist-player.html`
- 老師編輯頁：`practice-playlist-builder.html`
- Python GUI：`program-db/scripts/gui_app.py`

重點先分清楚兩種儲存：

- **正式資料檔**：放在 repo 裡，例如 `data/*.js`、`program-db/database/*.json`。會影響重新整理後的網頁，也能跟著 Git / 部署走。
- **瀏覽器本機儲存**：`localStorage` 或 IndexedDB 裡的暫存。只影響目前這台電腦、這個瀏覽器；同 id 會覆蓋正式資料檔的顯示，但沒有真的改 repo 檔案。

## 1. 學生播放頁

入口：

- `practice-playlist-player.html`

主要腳本：

- `practice-playlist/practice-playlist-store.js`
- `practice-playlist/practice-playlist-player.js`
- `practice-playlist/practice-schedule-player.js`
- `practice-playlist/practice-progress-store.js`
- `practice-playlist/practice-mode-toggle.js`

### 讀取哪些資料

播放頁會讀取練習題型本體：

- `data/formula-practice-assignments.js`
- `data/formula-practice.js`
- `data/practice-generator-bundles.js`
- `data/practice-generator-loader.js`
- `data/practice-generators/*.js`
- `formula-data.js`
- `formula-core.js`

播放頁會讀取清單與日程資料：

- `data/practice-playlists.js`
- `data/practice-task-playlists.js`
- `data/practice-chapter-playlists.js`
- `data/practice-schedules.js`
- `data/practice-theme-chains.js`
- `data/practice-custom-theme-chains.js`

播放頁也會讀瀏覽器本機資料：

- `localStorage["math-formula-tool-practice-playlists-v2"]`
- `localStorage["math-formula-tool-practice-progress-v1"]`

`practice-playlist-store.js` 會把 `data/practice-playlists.js` 和 GUI 自訂主題串轉成任務型清單，再用 `localStorage` 裡同 id 的清單覆蓋它。

### 可以儲存什麼

播放頁本身不會改正式資料檔。

它可以做兩種本機儲存：

- 「匯入 JSON（自動儲存）」：寫入 `localStorage["math-formula-tool-practice-playlists-v2"]`
- 日程練習標記完成：寫入 `localStorage["math-formula-tool-practice-progress-v1"]`

影響範圍：

- 只影響目前瀏覽器。
- 不會改 `data/practice-playlists.js`。
- 不會改 `program-db/database/*.json`。
- 若同 id 清單存在於正式資料檔，本機版會暫時覆蓋正式版；刪除本機版後，正式版會重新出現。

## 2. 老師編輯頁

入口：

- `practice-playlist-builder.html`

主要腳本：

- `practice-playlist/practice-playlist-store.js`
- `practice-playlist/practice-playlist-builder.js`
- `practice-playlist/practice-theme-store.js`
- `practice-playlist/practice-theme-builder.js`
- `practice-playlist/practice-schedule-builder.js`
- `practice-playlist/practice-mode-toggle.js`

### 讀取哪些資料

編輯頁讀取的題型本體和播放頁相同，另外多讀：

- `data/main-topic-overviews.js`
- `data/formula-calculators.js`

編輯頁讀取的清單與主題串資料：

- `data/practice-playlists.js`
- `data/practice-task-playlists.js`
- `data/practice-chapter-playlists.js`
- `data/practice-schedules.js`
- `data/practice-theme-chains.js`
- `data/practice-custom-theme-chains.js`

編輯頁讀取的瀏覽器本機資料：

- `localStorage["math-formula-tool-practice-playlists-v2"]`
- `localStorage["math-formula-tool-practice-theme-chains-v1"]`

### 可以儲存什麼

任務型清單區：

- 「儲存清單」：寫入 `localStorage["math-formula-tool-practice-playlists-v2"]`
- 「匯入 JSON（自動儲存）」：寫入同一個 localStorage key
- 「匯出 JSON」：下載單份 playlist JSON，不改 repo
- 「寫入資料檔」：透過 File System Access API 直接寫入或下載 `practice-playlists.js`

主題串資料庫區：

- 「存回主題串」：寫入 `localStorage["math-formula-tool-practice-theme-chains-v1"]`
- 「還原內建」：移除該 id 的 localStorage 覆蓋版
- 「寫入主題串資料檔」：透過 File System Access API 直接寫入或下載 `practice-theme-chains.js`
- 「匯出 PDF（列印）」：只走瀏覽器列印，不改資料

自訂主題串在網頁編輯頁是唯讀來源：

- 來源是 `data/practice-custom-theme-chains.js`
- 可以載入和列印
- 不能在網頁端存回；要修改請用 Python GUI 的「自訂主題串」

## 3. Python GUI

入口：

- `run-gui.ps1`
- `program-db/scripts/gui_app.py`

GUI 開啟時現在會預設最大化。

### 主題串PDF

GUI 按鈕：

- `主題串PDF`

讀取：

- `program-db/database/practice-theme-db.json`
- `program-db/database/practice-db.json`

儲存：

- `program-db/database/practice-theme-db.json`
- `data/practice-theme-chains.js`

影響：

- 老師編輯頁的「主題串資料庫」會讀到新順序。
- `practice-bank.html`、`practice-mobile.html` 若使用主題串排序，重新整理後也會跟著改。
- 主題串只存排序；題型本體仍以 `practice-db.json` 為準。

### 自訂主題串

GUI 按鈕：

- `自訂主題串`

讀取：

- `program-db/database/practice-custom-theme-db.json`
- `program-db/database/practice-db.json`
- `program-db/database/practice-theme-db.json`

儲存：

- `program-db/database/practice-custom-theme-db.json`
- `data/practice-custom-theme-chains.js`

影響：

- 學生播放頁會把自訂主題串轉成任務型清單。
- 老師編輯頁的主題串資料庫會顯示這些自訂串，但只允許載入與列印，不允許網頁端存回。
- 分類欄位會同步到 `category`，播放頁會用它做清單分類篩選。
- 目前常用分類是 `自訂`、`複習必做`、`章節重點`；GUI 現在可直接輸入新分類，儲存後會一起寫入資料庫與 bridge。

自訂主題串的內容項目：

- 小類：`{"type": "practice", "id": "題型 id"}`
- 整章大類：`{"type": "chapter", "id": "chapterCode"}`

整章大類不直接複製當下全部題型；它會依章節主題串排序即時展開，所以新增題型後會自動跟上。

## 4. 分類篩選規則

播放頁清單分類：

- `全部`
- `複習必做`
- `章節重點`
- `其他 / 自訂`

來源：

- playlist 的 `playlistCategory`
- GUI 自訂主題串的 `category`
- 若沒有明確分類，會用 id/title 推估：`chapter-focus-*` 視為章節重點，`review-*` 視為複習必做，其餘歸其他。

GUI 自訂主題串左側章節來源分類：

- `全部分類`
- `國小`
- `國中複習`
- `高中複習`
- `小四`、`小五`、`小六`
- `國一`、`國二`、`國三`
- `高一`、`高二`、`高三`
- `其他`

用途是先縮小章節下拉範圍，再選章節加入小類或整章。

GUI 自訂主題串上方清單篩選：

- 主題串下拉選單左側有「篩分類」與「篩年級」，只用來縮小目前可選的自訂主題串。
- 名稱後面的「分類」與「年級」是文字輸入欄，儲存時會寫入目前主題串的 `category` 與 `grade`。

## 5. 教學使用時的判斷口訣

- 要讓學生頁立刻在同一台電腦看到：網頁儲存到 localStorage 就可以。
- 要讓其他電腦、部署版、Git 也看到：要寫回 `data/*.js` 或 GUI 的 `program-db/database/*.json`。
- 要改自訂、複習必做、章節重點這些老師整理好的主題串：用 GUI「自訂主題串」。
- 要改每個小章節的標準主題串排序：用 GUI「主題串PDF」或網頁主題串資料庫，再落地 `data/practice-theme-chains.js`。
- 要改題型本體、難度、章節歸屬：回到 `program-db/database/practice-db.json` 與同步流程，不要只改 playlist。
