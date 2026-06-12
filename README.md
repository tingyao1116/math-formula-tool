# 數學公式使用工具

這是一個可擴充的靜態網頁工具，用來整理國中、高中常用數學公式。

## 目前功能

- 可用「年級章節」或「領域」切換分類
- 可用關鍵字搜尋公式、範例、技巧、注意事項、常見錯誤
- 可用年級、領域、章節、難度篩選
- 部分公式提供直接輸入數值的計算器
- 每個概念都附有「無限練習」功能，可反覆出新題並顯示答案
- 可開啟單一公式的分享頁：`formula.html?id=公式id`
- 計算結果會優先顯示精確值，例如分數、`√`、`π`
- 公式與範例會自動美化顯示，例如上標、下標、簡單分數
- 已加入 PWA 設定，可安裝到手機主畫面
- 已加入統整管理頁，可直接新增、刪除、排序、修改重點

## 統整管理頁

管理頁位置：

- `manage.html`

可做的事：

- 新增重點
- 刪除重點
- 調整順序
- 修改標題、公式、章節、領域、難度與內容欄位
- 匯出 JSON 備份
- 匯入 JSON 備份
- 還原成內建版本

### 管理頁的儲存方式

- 管理頁會把你修改後的資料存到瀏覽器的 `localStorage`
- 儲存後，首頁與單一公式頁都會優先讀取你的版本
- 也就是說，你之後在同一台裝置、同一個瀏覽器打開時，會先看到你改過的內容

### 之後我幫你增修時怎麼配合

你剛剛要求的是：之後增加修改前，要先讀取你修改過的部分再去修正。

目前系統設計是：

- 網站本身會先讀取你在管理頁儲存的版本
- 如果你之後要我再幫你改內容，最穩的做法是先從管理頁匯出一份 JSON 備份
- 然後把那份備份檔放在專案資料夾內，再告訴我檔名
- 我就可以先讀那份你修改過的資料，再接著幫你修正

原因是：管理頁存在瀏覽器 `localStorage` 的內容，我在終端機裡不能直接可靠地讀到；但 JSON 備份檔我可以直接讀。

## 手機使用方式

### iPhone / iPad

目前已可作為「加入主畫面的 Web App」使用：

先決條件：建議先部署到可用的網址（通常需要 `https`）。

1. 用 Safari 開啟網站
2. 點分享按鈕
3. 選「加入主畫面」
4. 安裝後會像 App 一樣從主畫面開啟

### Android

多數情況下可直接在 Chrome 使用「安裝 App」或「加入主畫面」。

## 重要說明

- 目前這是可安裝的 Web App（PWA）
- 不是已經打包完成的原生 iOS App（`.ipa`）
- 若只是在電腦裡直接雙擊 `index.html`，手機端不一定能完整使用安裝與離線功能
- 如果你之後要上架或做真正的 iPhone 原生 App，通常還需要：
  - macOS
  - Xcode
  - Apple Developer 帳號

## 新增的七年級概念

- 質數判斷
- 3、9、11 倍數判斷法
- 去絕對值公式與使用
- 座標平移與縮放
- 小於或等於某數的非負整數個數
- 由 `|x| < a` 的正整數解個數反推 `a`

## 檔案結構

- `index.html`：總覽頁
- `formula.html`：單一公式分享頁
- `manage.html`：統整管理頁
- `styles.css`：版面與樣式
- `formulas.js`：保留的基底入口，目前只放 `window.baseFormulas = []`
- `data/formula-content.js`：主題內容資料
- `data/formula-calculators.js`：計算器設定；只放互動欄位與計算邏輯
- `data/formula-practice.js`：無限練習設定；只放出題邏輯與答案生成
- `data/formula-practice-assignments.js`：無限練習橋接檔；由資料庫自動產生
- `formula-data.js`：章節結構、章碼、管理頁儲存與資料覆寫邏輯
- `formula-core.js`：共用渲染、計算、練習邏輯
- `app.js`：總覽頁互動邏輯
- `formula-detail.js`：單一公式頁邏輯
- `manage.js`：統整管理頁邏輯
- `chapter-overviews.js`：章節重點大綱（原稿版 / 可修改版）
- `docs/current-architecture.md`：目前資料分層與修改原則
- `docs/codex-operating-rules.md`：Codex 固定作業規則（每次修改前必讀）
- `manifest.webmanifest`：PWA 安裝設定
- `sw.js`：離線快取

## 備份與恢復

- 主題內容和章節結構現在已分開
- 主題內容放在 `data/formula-content.js`
- 章節結構與章碼放在 `formula-data.js`
- 章節大綱放在 `chapter-overviews.js`
- 每次大量修改前，建議先執行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\create-project-backup.ps1
```

- 會在 `backups\時間戳\` 建立專案快照
- 詳細規則請看：
  - `docs/recovery-and-backup.md`
- `pwa.js`：PWA 註冊邏輯
- `icons/`：App 圖示

## 結構頁自動落地存檔（寫入資料夾）

若你希望在 `structure-view.html` 移動/刪除後就自動寫入專案資料夾，請先啟動本機橋接服務：

```powershell
node .\scripts\local-structure-bridge.js
```

預設服務位址：`http://127.0.0.1:4310`

啟動後，在結構頁按「本機存檔：未連線」並確認網址，就會變成「本機存檔：已連線」。

之後每次操作都會自動寫入：

- `data/managed-structure.auto.json`
- `logs/structure-operation-log.auto.json`
- `logs/structure-operation-events.ndjson`

## 如何分享單一公式

每個公式都可以開啟自己的頁面，例如：

```text
formula.html?id=linear-equation
formula.html?id=prime-number-check
formula.html?id=divisibility-rules
```

在總覽頁的每張公式卡底部，都有「開啟個別公式頁」按鈕。

## 如何使用無限練習

每張公式卡都有兩個按鈕：

- `出一題`：隨機產生新的題目
- `顯示答案`：打開目前這一題的答案

再次按 `出一題`，就會換成另一題。

## 無限練習現在怎麼管理

現在無限練習分成兩層：

- `data/formula-practice.js`：真正的出題程式邏輯，負責 `generate()`
- `program-db/database/practice-db.json`：管理哪些主題要掛哪一個練習、是否啟用、是否改成固定範例題

前端實際讀到的是自動產生的橋接檔：

- `data/formula-practice-assignments.js`

同步方式：

```powershell
python .\program-db\scripts\sync_practice_bridge.py
```

目前 Python GUI 也已新增「無限練習」模式，可直接管理 `practice-db.json`。

## 目前的資料分層

現在專案不是把所有資訊都塞在同一筆公式資料裡，而是分成四層：

- 內容主體：`data/formula-content.js`
- 計算器：`data/formula-calculators.js`
- 無限練習：`data/formula-practice.js`
- 無限練習掛載資料庫：`program-db/database/practice-db.json`
- 章節結構 / 顯示名稱 / parent 對應：`formula-data.js`

實際顯示時：

- 公式卡本體先讀 `data/formula-content.js`
- 如果同一個 `id` 在 `data/formula-calculators.js` 有設定，就顯示計算器
- 如果同一個 `id` 在 `practice-db.json` 或 `data/formula-practice.js` 有設定，就顯示無限練習
- 分支關係與課綱位置則由 `formula-data.js` 負責

更完整說明請看：

- `docs/current-architecture.md`

## 如何修改單一公式

有兩種方式：

### 方法 A：用管理頁

直接到 `manage.html` 修改，最方便。

### 方法 B：改程式資料

若是改主題內容，請到 `data/formula-content.js` 找對應 `id`。

若是改互動功能：

- 計算器在 `data/formula-calculators.js`
- 無限練習在 `data/formula-practice.js`
- 無限練習掛載與覆寫在 `program-db/database/practice-db.json`
- parent 與顯示名稱在 `formula-data.js`

## 題庫正規化

`question-db.json` 目前可以正常被 Python 讀取，但仍建議定期做正規化，原因通常不是「整份檔案壞掉」，而是：

- 匯入來源很多，欄位順序、空字串、重複值、舊格式容易混在一起
- 不同工具對 JSON、BOM、換行與欄位品質的容忍度不同
- 之後若要接 GUI、查詢、匯出或 SQLite，同一份資料越一致越安全

安全做法：

```powershell
python .\program-db\scripts\normalize_question_db.py --dry-run
python .\program-db\scripts\normalize_question_db.py
```

正式寫回時，腳本現在預設會先建立備份，再同步 `data/question-content.js`。

## 如何調整難度

目前難度使用三種：

- `基礎`
- `進階`
- `挑戰`

如果透過管理頁修改，直接改該筆資料的 `difficulty` 即可。

若改程式內建資料，目前難度對應也集中寫在 `formula-core.js` 的 `difficultyMap`。

## 公式排版怎麼寫會比較漂亮

目前會自動處理下列常見格式：

- 上標：`x^2` 會顯示成上標版面
- 下標：`a1`、`x2` 會顯示成下標版面
- 分數：像 `1/2`、`3/4`、`√3/2` 會盡量顯示成上下分數
- 箭頭：`=>` 會顯示成 `⇒`

建議寫法：

```js
formula: "x = (-b ± √(b^2 - 4ac)) / (2a)"
formula: "sin30° = 1/2，cos30° = √3/2"
formula: "a1 + (n - 1)d"
```

## 如何新增公式

現在主要是到 `data/formula-content.js` 新增一筆物件，格式如下：

```js
{
  id: "unique-id",
  title: "公式名稱",
  formula: "公式內容",
  stage: "國中或高中",
  grade: "七年級 / 八年級 / 國三 / 高一 / 高二 / 高三",
  chapter: "章節名稱",
  domain: "領域名稱",
  difficulty: "基礎",
  tags: ["標籤1", "標籤2"],
  usage: ["何時使用 1", "何時使用 2"],
  examples: ["範例 1", "範例 2"],
  tips: ["技巧 1", "技巧 2"],
  notes: ["注意事項 1", "注意事項 2"],
  mistakes: ["常見錯誤 1", "常見錯誤 2"]
}
```

新增後還要再補：

- `formula-data.js`
  - parent 關係
  - 課綱對應
  - 顯示名稱
- `data/formula-calculators.js`
  - 若這題需要計算器
- `data/formula-practice.js`
  - 若這題需要無限練習

## 目前已支援的計算器類型

- `linearEquation`
- `slope`
- `pythagorean`
- `circle`
- `quadratic`
- `distance2D`
- `arithmeticNth`
- `arithmeticSum`
- `geometricNth`
- `geometricSum`
- `simpleInterest`
- `average`

## 精確值說明

目前計算器會優先顯示：

- 分數，例如 `3/4`
- 根號，例如 `√13`
- 圓周率，例如 `9π`

如果某些新公式也希望用精確值顯示，可以繼續擴充 `formula-core.js` 裡的對應計算器。

## 建議下一步

- 把這個 PWA 部署到可從手機直接開啟的網址
- 繼續補七年級、八年級、高一等各冊章節內容
- 把練習題再細分成基礎題、進階題、挑戰題
- 若你之後固定會在管理頁改內容，可以建立一份固定的 JSON 備份檔給我讀
