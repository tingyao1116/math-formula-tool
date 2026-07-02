# 目前工作文件

這份文件是目前專案的主文件。

如果只想先看一份，再決定要去哪裡修資料、修頁面、修題庫，先看這一份。

## 1. 專案現在怎麼看

目前這個專案可以先分成四層：

1. 網站入口頁
2. 頁面專用資源
3. 共用前端資料
4. 正式資料庫 / 匯入資料

### 網站入口頁

根目錄的 `*.html` 是正式入口，例如：

- `index.html`
- `formula.html`
- `chapter.html`
- `manage.html`
- `question-bank.html`
- `practice-bank.html`
- `practice-mobile.html`
- `ability-practice.html`
- `skill-tree-practice.html`
- `chapter-highlights.html`
- `quest-practice.html`
- `junior-high-bridge.html`
- `structure-view.html`

### 頁面專用資源

如果某一頁有自己的 JS，就放在同名資料夾裡。例如：

- `practice-bank.html` -> `practice-bank/practice-bank.js`
- `practice-mobile.html` -> `practice-mobile/practice-mobile.js`
- `question-bank.html` -> `question-bank/question-bank.js`
- `manage.html` -> `manage/manage.js`
- `formula.html` -> `formula/formula-detail.js`
- `chapter.html` -> `chapter/chapter-detail.js`

原則是：

- 根目錄放入口
- 同名資料夾放那一頁專用的資源
- 共用資源不要重複塞進各頁資料夾

## 2. 目前資料邊界

現在實際上有用的資料邊界，以 `docs/current-architecture.md` 為準，可以先記這個版本：

### 內容資料

- `data/formula-content.js`

放主題內容本身，例如：

- 標題
- 公式
- 使用情境
- 例子
- 提示
- 注意事項
- 常見錯誤

### 計算器資料

- `data/formula-calculators.js`

只放 calculator 設定，不要把 calculator 邏輯混進內容資料。

### 練習指派資料

- `program-db/database/practice-db.json`

決定某個主題有沒有練習、對應哪個 practice 設定。

### 練習生成資料

- `data/formula-practice.js`：主控／包裝層，定義 `window.formulaPracticeStore`，負責把 `practice-db.json`（經 bridge）給的指派資料，跟真正的 generator 設定合併起來。它自己不太放個別題型的出題邏輯，但不能改名或移除，否則整條生成流程會壞掉。
- `data/practice-generators/*.js`（例如 `e5.js`、`e6.js`、`j1.js` 到 `j6.js`、`s1.js` 到 `s4.js` 等）：真正放各章節出題邏輯（`generate()`）的地方，依章碼字首拆檔。這些檔案會呼叫 `formulaPracticeStore.registerConfigs(...)` 把自己註冊進去。
- `data/practice-generator-bundles.js` + `data/practice-generator-loader.js`：決定哪個章碼字首要載入哪個 generator 檔（依需要才載入，不是全部一次載完）。

### 結構與排序資料

- `formula-data.js`

決定：

- 課程順序
- 章節代碼
- parent-child 關係
- 顯示標籤
- 合併邏輯

## 3. 目前實際修改原則

### 要改主題內容

改：

- `data/formula-content.js`

### 要改章節歸屬、排序、父子層級

改：

- `formula-data.js`

### 要改計算器

改：

- `data/formula-calculators.js`

### 要改 practice 指派

改：

- `program-db/database/practice-db.json`

### 要改 practice 生成規則

改：

- `data/practice-generators/*.js`（先找對應章碼字首的檔案，例如 `j3-...` 的題型改 `j3.js`）

不要直接改 `data/formula-practice.js`——它現在是主控與包裝層，不是題型出題邏輯本體。

## 4. 練習系統目前的理解

目前 infinite practice 相關資料，實際上不是只看單一檔案，至少要一起看四層：

1. `program-db/database/practice-db.json`：老師/GUI 實際編輯的來源，決定哪個主題要掛哪個練習、是否啟用。
2. `data/formula-practice-assignments.js`：自動產生的橋接檔，不要手動改；跑 `sync_practice_bridge.py` 才會更新。
3. `data/formula-practice.js`：主控與包裝層，負責合併「指派資料」與「已註冊的 generator 設定」，回傳最終要渲染的練習設定。目前還不能直接刪或改名，否則整個生成流程會壞掉。
4. `data/practice-generators/*.js`：真正的出題函式所在。已經拆出去不少，像 `e5.js`、`e6.js`、`j1.js` 到 `j6.js`、`s1.js` 到 `s4.js`，這些新的 generator 檔已經接上無限練習網頁（`practice-bank.html`、`practice-mobile.html`），由 `data/practice-generator-loader.js` 依 `data/practice-generator-bundles.js` 的章碼字首設定按需載入。

不要只改其中一層就以為整套會自動同步。

如果是 bridge 更新，現在實際存在的同步腳本是：

```powershell
python .\program-db\scripts\sync_practice_bridge.py
```

## 5. 文件怎麼看

### 先看這些

- `docs/README.md`
- `docs/current-workspace-guide.md`
- `docs/current-architecture.md`

### 再依任務補看

如果是章節整理：

- `docs/chapter-main-theme-workflow.md`
- `docs/chapter-manual-cleanup-standards.md`

如果是格式問題：

- `docs/math-display-rules.md`
- `docs/math-formatter-usage.md`
- `docs/utf8-tex-safe-workflow.md`

如果是 Word / 題庫 / 匯入：

- `docs/word-import-workflow.md`
- `docs/new-thread-import-rules.md`

## 6. 哪些文件不再當現況規則

下列類型不再當正式主文件：

- handoff
- reminders
- dated snapshots
- migration plan
- 尚未落地的 proposal

這些歷史資料現在統一往：

- `docs/history/`
- `archive/transitional/`

去找，不要再把它們當成現行規則。

## 7. 現在要維持的乾淨結構

目標很簡單：

- `docs/` 只放目前有用的正式文件
- `docs/history/` 放已退役的歷史文件
- `archive/` 放過渡盤點、審核報告、整理過程記錄

這樣之後你在判斷一份文件要不要信時，先看它放在哪裡，就能先判斷八成。
