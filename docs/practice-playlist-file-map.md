# 無限練習清單與日程檔案分工

## 頁面入口

- `practice-playlist-builder.html`：老師用的編輯頁。
- `practice-playlist-player.html`：學生用的播放頁。

## 資料檔

- `data/practice-playlists.js`：任務型清單資料，來源是老師在編輯頁勾選題型後儲存。
- `data/practice-task-playlists.js`：預設任務型播放清單，用來疊加常用主題，例如正負數、絕對值、因式分解、一元二次方程式。
- `data/practice-schedules.js`：日程型安排資料，來源是段考時段、週次、前半段無限練習與後半段題庫練習。

## 編輯頁腳本

- `practice-playlist/practice-playlist-builder.js`：任務型編輯器，負責列出所有無限練習題型、勾選、排序、儲存任務清單。
- `practice-playlist/practice-schedule-builder.js`：日程型編輯/預覽器，負責顯示日程、日期區段、模式、章節與題型數。
- `practice-playlist/practice-mode-toggle.js`：共用切換器，讓編輯頁與播放頁都能在任務型/日程型之間切換。

## 播放頁腳本

- `practice-playlist/practice-playlist-player.js`：任務型播放器，讀取 `practicePlaylistStore` 與 `data/practice-playlists.js`。
- `practice-playlist/practice-schedule-player.js`：日程型播放器，讀取 `window.practiceScheduleData` 與 `data/practice-schedules.js`；日程型年級下拉只顯示實際有日程的年級，不顯示「全部」。
- `practice-playlist/practice-progress-store.js`：完成進度儲存，任務型與日程型都可以共用。

## 共用 store

- `practice-playlist/practice-playlist-store.js`：任務型清單的讀取、儲存、匯入、匯出。

## 目前不應再使用

- `practice-playlist/practice-schedule-player-v2.js`：臨時修正版檔名，內容已收斂回 `practice-schedule-player.js`；頁面與 `sw.js` 不再載入它。

## 判斷原則

播放頁不應載入 builder 檔案；builder 檔案只負責編輯或預覽。

編輯頁可以同時載入任務型 builder 與日程型 builder，但必須用 `practice-mode-toggle.js` 切換顯示，避免兩種流程混在同一個畫面。
