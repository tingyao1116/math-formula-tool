# 無限練習 Playlist 系統規劃

## 1. 目標

這一套功能要解決的不是「再做一套題庫」，而是讓老師能從現有的無限練習題型中，挑出一批題型，組成某個學生、某一班、某一段課程要走的練習流程。

核心用途：

1. 老師看到全部可用的無限練習題型。
2. 老師可勾選要附掛的題型。
3. 老師可先看生成題範例，再決定是否納入。
4. 勾選結果可儲存、讀取、修改。
5. 學生頁只顯示這份清單中指定的題型。

## 2. 為什麼要和原本頁面分開

結論：要分開，而且建議整塊獨立。

原因：

1. `practice-bank`、`practice-mobile`、`ability-practice`、`skill-tree-practice`、`quest-practice` 目前已經各自有不同目的。
2. playlist 系統的本質是「老師挑題與指派流程」，不是一般學生自由練習入口。
3. 如果把 playlist 編輯邏輯混進原本頁面，之後會很難分清楚：
   - 哪些是題型母資料
   - 哪些是能力標記
   - 哪些是學生頁流程
   - 哪些只是某次課程的臨時清單

所以這一套建議獨立成新的頁面與資料夾：

- `practice-playlist-builder.html`
- `practice-playlist-player.html`
- `practice-playlist/`

## 3. 資料分層原則

### 3.1 不動的母資料

來源：

- `program-db/database/practice-db.json`
- bridge：`data/formula-practice-assignments.js`

用途：

- 題型 id
- title
- difficulty
- chapterCode
- enabled
- generatorKey
- questionCount

這一層是題型真相，不拿來記錄某位學生今天要做什麼。

### 3.2 新增的 playlist 層

這一層記錄老師挑出來的練習清單。

第一版先採：

- 瀏覽器 `localStorage`
- 匯入 / 匯出 JSON

之後若要正式進資料庫，再新增：

- `program-db/database/practice-playlists.json`
- 或 GUI 讀寫功能

### 3.3 頁面層

分成兩頁：

1. Builder 頁：
   - 顯示題型清單
   - 勾選 / 取消勾選
   - 看生成範例
   - 儲存清單
   - 載入清單
   - 匯出 / 匯入 JSON

2. Player 頁：
   - 讀 playlist
   - 只顯示 playlist 內的題型
   - 提供學生練習流程

## 4. 檔案結構

建議使用以下結構：

```text
practice-playlist-builder.html
practice-playlist-player.html
practice-playlist/
  practice-playlist-builder.js
  practice-playlist-player.js
  practice-playlist-store.js
```

說明：

- `practice-playlist-store.js`
  - playlist 存取
  - localStorage key
  - JSON 匯入 / 匯出

- `practice-playlist-builder.js`
  - 題型清單頁
  - 勾選 / 篩選 / 預覽

- `practice-playlist-player.js`
  - 學生播放頁
  - 只讀 playlist 題型

## 5. Playlist 資料格式

第一版建議格式：

```json
{
  "id": "j3-review-student-a-01",
  "title": "小安 國三複習第一輪",
  "description": "乘法公式、因式分解、公式解",
  "practiceIds": [
    "practice-j3-1-1-formula-mixed-variable-drill",
    "practice-j3-3-1-core-factoring-mixed",
    "practice-j3-4-2-formula-direct-solve"
  ],
  "questionCount": 5,
  "shufflePractices": false,
  "enabled": true,
  "updatedAt": "2026-06-27T00:00:00+08:00"
}
```

後續可再擴充：

- `studentName`
- `teacherNote`
- `sections`
- `mainlinePracticeIds`
- `sidePracticeIds`
- `masteryTarget`

## 6. 第一版功能範圍

### 6.1 Builder 頁

第一版先做到：

1. 顯示所有可用 practice 題型。
2. 每列包含：
   - 勾選框
   - 標題
   - 章節
   - 難度
   - 生成範例
3. 可用關鍵字、章節、難度篩選。
4. 可建立 playlist。
5. 可儲存到瀏覽器。
6. 可讀取已存 playlist。
7. 可匯出 JSON。
8. 可匯入 JSON 後再修改。

### 6.2 Player 頁

第一版先做到：

1. 選擇一份 playlist。
2. 顯示 playlist 基本資訊。
3. 只從該 playlist 的 practiceIds 出題。
4. 可以逐題切換。
5. 可沿用現有 infinite practice 生成邏輯。

## 7. 為什麼第一版先不用 GUI

原因：

1. 你現在最需要的是「快速挑題、快速看範例」。
2. 這種操作網頁比 GUI 更直覺。
3. 如果第一版就做 GUI 存檔，會先卡在資料編輯流程，而不是先完成教學使用情境。

所以第一版先做：

- 網頁操作
- localStorage
- JSON 匯入 / 匯出

等流程定型後，再決定是否補：

- GUI 寫回 `practice-playlists.json`
- GUI playlist 管理清單

## 8. 第二階段可擴充方向

之後可以再補：

1. 主線 / 支線分組。
2. 題型排序拖拉。
3. 每個題型自訂題數。
4. 每個題型加老師備註。
5. 學生專屬清單。
6. 練習完成紀錄。
7. 匯出分享碼 / 連結。
8. 與 quest / ability 頁做對接，但資料層仍保持分開。

## 9. 本次實作原則

1. 不改動 `practice-db.json` 的資料結構。
2. 不把 playlist 混進能力地圖或 quest 任務資料。
3. 不把老師指派流程寫死在單一頁面 js。
4. 先用獨立檔案、獨立頁面、獨立 storage key。
5. 先完成最小可用，再考慮 GUI 正式化。
