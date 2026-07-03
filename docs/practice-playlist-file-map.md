# 無限練習清單與日程檔案分工

## 頁面入口

- `practice-playlist-builder.html`：老師用的編輯頁。
- `practice-playlist-player.html`：學生用的播放頁。

## 資料檔

- `data/practice-playlists.js`：任務型清單資料，來源是老師在編輯頁勾選題型後儲存。
- `data/practice-task-playlists.js`：預設任務型播放清單（只剩 12 份 task-* 主題練習）。複習必做（review-*）已於 2026-07-02 遷入 practice-custom-theme-db.json。
- `data/practice-chapter-playlists.js`：已清空為空操作檔。章節重點（chapter-focus-*，36 份）已遷入 practice-custom-theme-db.json，由 GUI 管理並經 bridge 自動生成。
- `data/practice-schedules.js`：日程型安排資料，來源是段考時段、週次、前半段無限練習與後半段題庫練習。
- `program-db/database/practice-theme-db.json`：章節主題串「主資料庫」。每個小章節（chapterCode）一個主題串，共 164 串；程式資料庫 GUI 的「主題串PDF」直接讀寫這個檔。
- **主題串只存排序，不存資料本體**（2026-07-02 起）：GUI 與網頁讀主題串時都會即時合併練習本體（practice-db）——排序中仍存在的題型照排序在前，practice-db 新增的題型自動附加在該章最後（GUI 標〔新〕），已刪除/停用的自動消失；在 GUI 按「儲存順序」後新題型才正式併入排序。自訂主題串的「整章（大類）」展開也走同一套合併。
- `program-db/database/practice-custom-theme-db.json`：自訂主題串資料庫。GUI「自訂主題串」按鈕讀寫；每串的 `items` 可混放小類（`{"type":"practice","id":題型id}`）與大類（`{"type":"chapter","id":chapterCode}`，匯出時整章展開，順序照章節主題串）。每串另有 `category`（自訂／複習必做／章節重點）與 `grade` 欄位：複習必做（review-*，10 份）與章節重點（chapter-focus-*，36 份）已全部遷入此資料庫，保留原 id 所以學生完成進度不受影響；播放頁的清單分類篩選依 `category` 對應 `playlistCategory`。
- `data/practice-custom-theme-chains.js`：自訂主題串網頁 bridge（AUTO-GENERATED，勿手動編輯）。GUI「自訂主題串」儲存時自動同步，含展開後的 `practiceIds`。**單向：GUI 為主、網頁唯讀**——編輯頁主題串下拉會出現【自訂】串（可載入、可列印，「存回主題串」會擋下）；編輯頁「已存清單」與學生播放頁會以【自訂】開頭的任務型清單出現，可直接播放；「寫入資料檔」不會把自訂串落地進 practice-playlists.js。
- `data/practice-theme-chains.js`：主題串網頁 bridge（AUTO-GENERATED，勿手動編輯）。由 theme-db 同步產生；GUI 儲存順序時會自動同步，或手動跑 `node scripts/build-practice-theme-chains.mjs`。除了主題串頁面，`practice-bank.html` 與 `practice-mobile.html` 的題型排序也吃這個檔：章節內順序＝主題串順序（不在主題串裡的題型排到該章最後，依標題排）。在 GUI「主題串PDF」調整順序並儲存後，這兩頁重新整理就會跟著變。

## 編輯頁腳本

- `practice-playlist/practice-playlist-builder.js`：任務型編輯器，負責列出所有無限練習題型、勾選、排序、儲存任務清單。
- `practice-playlist/practice-schedule-builder.js`：日程型編輯/預覽器，負責顯示日程、日期區段、模式、章節與題型數。
- `practice-playlist/practice-mode-toggle.js`：共用切換器，讓編輯頁與播放頁都能在任務型/日程型之間切換（主題串面板屬於任務型，切到日程型會一併隱藏）。
- `practice-playlist/practice-theme-builder.js`：主題串編輯器（任務型模式的延伸）。列出主題串資料庫、載入到「已選題型順序」重排、易→難排序、存回主題串、匯出整串 PDF（題目在前、答案附後，走 `window.print()`）、寫入主題串資料檔。透過 `window.practicePlaylistBuilderApi`（定義在 `practice-playlist-builder.js` 尾端）借用既有編輯區。

## 播放頁腳本

- `practice-playlist/practice-playlist-player.js`：任務型播放器，讀取 `practicePlaylistStore` 與 `data/practice-playlists.js`。
- `practice-playlist/practice-schedule-player.js`：日程型播放器，讀取 `window.practiceScheduleData` 與 `data/practice-schedules.js`；日程型年級下拉只顯示實際有日程的年級，不顯示「全部」。
- `practice-playlist/practice-progress-store.js`：完成進度儲存，任務型與日程型都可以共用。

## 共用 store

- `practice-playlist/practice-playlist-store.js`：任務型清單的讀取、儲存、匯入、匯出。
- `practice-playlist/practice-theme-store.js`：主題串資料庫存取層。`data/practice-theme-chains.js` 為基底、localStorage 同 id 覆蓋，提供易→難排序與 `generateDataFileContent()` 全部落地。

## 主題串工具腳本與 GUI

- `scripts/build-practice-theme-chains.mjs`：預設從 theme-db 同步網頁 bridge；加 `--seed` 才會從 `practice-db.json` 重建 theme-db（會覆蓋手動調整過的順序，重跑前先確認）。
- `program-db/scripts/gui_app.py` 的「主題串PDF」按鈕：下拉選主題串 → 上移/下移、依難度排序（易→難）→「儲存順序」寫回 theme-db 並同步網頁 bridge →「匯出 PDF/MD」走既有 pandoc + XeLaTeX 排版管線（`_run_practice_records_export`，與練習本體「匯出PDF」共用）。正式的紙本 PDF 建議從 GUI 匯出；網頁端的「匯出 PDF（列印）」只是快速列印用。
- `gui_app.py` 的「自訂主題串」按鈕：左邊選章節直接列出該章分類（勾選加入小類，或整章加入為大類）、右邊排順序，「儲存」寫入 practice-custom-theme-db.json，「匯出 PDF/MD」同上走共用管線。

## 大類/小類＝資料夾/檔案（2026-07-02）

- 定義：practice-db 中 `relatedPracticeIds` 非空的題型是「大類」（資料夾）；被引用的題型是「小類」（檔案）。**規則：一個小類只屬於一個大類。**
- 歸屬清理（2026-07-02，共 77 項變更，報告見 `exports/practice-composite-cleanup-report.html`）：完全重複的大類留一個、包含型留較大資料夾（較小的解散為獨立題型）、部分重疊的共用小類留在較專門（較小）的資料夾。清理後大類 485 個、小類 1569 個、多重歸屬 0；題型總數 2847 不變（解散的大類仍是獨立題型，內容未刪）。
- 呈現：GUI「主題串PDF」清單為資料夾式樹狀——大類顯示 📂（含 N 小類），小類縮排「└」跟在所屬資料夾下；上移/下移/依難度排序都以「整個資料夾」為單位，小類跟著資料夾走（小類在資料夾內的順序＝`relatedPracticeIds` 順序）。網頁編輯頁已選清單中，小類若其資料夾也在清單內會以「└」縮排。
- 只呈現不編輯：要改資料夾歸屬，在「練習本體」編輯該大類的 `relatedPracticeIds`。
- 單小類資料夾清除（2026-07-02）：76 個「只含 1 個小類」的大類已停用（enabled=false，可復原；報告見 `exports/practice-single-child-folder-report.html`），唯一小類保留為獨立題型。啟用題型 2847→2771、資料夾 485→409。主題串排序、自訂主題串 items 及靜態清單中的引用已同步剔除/改指小類。

## 舊式直連已移除（2026-07-02）

- GUI 的「舊式直連」唯讀模式與 `_legacy_practice_rows` 已移除；狀態列不再顯示 legacy 計數。`data/formula-practice.js` 本體與 `_legacy_practice_catalog()`（統計用）保留不動。

## 章節綁定已移除（2026-07-02）

- 移除範圍：GUI 的「章節綁定」模式、「批次掛載 practice」對話框與「只看未掛載」篩選；`practice-db.json` 的 `bindings` 已清空（移除前 1433 筆，備份在 `practice-db.backup-*.json`）；`data/formula-practice-assignments.js` 已重新同步（bindings: []）；practice-bank 頁的「掛載項目數」按鈕已移除。
- 原因：practice 以 `chapterCode` 直接歸屬章節即可，「某章只綁部分分類」的需求改由主題串/自訂主題串處理。
- 殘留：`gui_app.py` 內部 `_practice_bindings()` 等少數防禦性 helper 與 practice-bank.js 的 null-guarded 舊分支保留（無 UI 入口，不影響行為）。

## 目前不應再使用

- `practice-playlist/practice-schedule-player-v2.js`：臨時修正版檔名，內容已收斂回 `practice-schedule-player.js`；頁面與 `sw.js` 不再載入它。

## 判斷原則

播放頁不應載入 builder 檔案；builder 檔案只負責編輯或預覽。

編輯頁可以同時載入任務型 builder 與日程型 builder，但必須用 `practice-mode-toggle.js` 切換顯示，避免兩種流程混在同一個畫面。
