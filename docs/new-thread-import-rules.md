# 新對話作業規則

這份文件是之後開新對話時，處理題庫、匯入檔、公式資料時要優先遵守的固定規則。

這些規則不只適用於「題目」。
只要內容包含中文，包含：
- 題幹
- 解析
- 標題
- 主題頁文字
- 分支說明
- 公式說明
- `tips`
- `notes`
- `mistakes`
- `examples`

都必須適用同一套安全規則。

## 0. 硬性原則

中文資料不可承受高風險寫入。

原因很簡單：
- 一次寫壞，常常不是壞一題，而是壞整批
- 一次重做，可能要付出數天到數週的整理成本

所以之後處理中文資料時，原則不是「盡量小心」，
而是：

- 不允許使用已知高風險方法
- 不允許未驗證就同步
- 不允許先大批修改再回頭檢查

只要有疑慮，就先停，不擴大修改範圍。

## 1. 單一資料源

### 題目資料
- 正式匯入來源：`program-db/imports/packs/<chapter-code>/questions.json`
- 目前題庫資料庫：`program-db/database/question-db.json`
- 前端橋接檔：`data/question-content.js`

題目資料在目前架構下的權威順序固定為：
1. pack：`program-db/imports/packs/<chapter-code>/questions.json`
2. db：`program-db/database/question-db.json`
3. bridge：`data/question-content.js`

也就是說：
- pack 是正式來源
- db 是匯入後的彙總結果
- bridge 是前端用的衍生檔

目前正式規則改為：
- 匯入只做「新增」
- 若題號已存在於 `question-db.json`，就直接跳過
- 匯入不可覆蓋既有題目，也不可因同章而先刪除舊題

因此：
- GUI 內的匯入功能仍可保留
- 但匯入只負責補新題，不再拿來更新既有題目
- 既有題目的正式修改，應直接改 `question-db.json`

### 公式主題資料
- 主資料庫：`program-db/database/formula-db.json`
- 前端橋接檔：`data/formula-content.js`

### 主題 / 分支 / 公式說明
凡是網站主題頁中會顯示的文字，都視為高價值中文資料，包含：
- 主題標題
- 分支標題
- 核心說明
- 常用公式
- 使用範例
- 使用技巧
- 注意事項

這些資料和題目一樣，不可用高風險方式批次覆寫。

## 2. 修改題目時的固定規則

只要是改「題目內容」，必須同時修改：
- `program-db/imports/packs/<chapter-code>/questions.json`
- `program-db/database/question-db.json`

必要時再更新：
- `data/question-content.js`

### 什麼情況需要改 `preview.json`
- 題目標題 `title` 變更
- 類別 `question_category` 變更
- 難度 `difficulty` 變更

如果只是改：
- `question_text`
- `answer_text`
- `explanation_text`

則通常不需要改 `preview.json`。

## 3. 修改公式主題時的固定規則

只要是改「主題頁內容」或「公式資料」，只修改：
- `program-db/database/formula-db.json`

之後再同步：
- `data/formula-content.js`

不要把公式主題修改寫進題目匯入 pack。

### 補充
如果修改的是：
- 主題標題
- 分支標題
- 中文說明
- 公式說明的中文 label

也一律視為高風險中文修改，必須走安全流程。

## 4. 中文內容修改的安全規則

### 允許的方法
- 用 `apply_patch` 直接修改檔案
- 用實體 `.py` 腳本讀寫 UTF-8 檔案
- JSON 讀寫時明確使用 `encoding="utf-8"`

### 禁止的方法
- 不要用 `PowerShell here-string` 夾中文，再 pipe 給 `python -`
- 不要用 `python -` 直接吃大量中文題目內容
- 不要在 shell 內嵌腳本裡直接做大量中文內容替換
- 不要在還沒驗證資料是否正常前，就先同步 `question-content.js` 或 `formula-content.js`

### 這條規則同時適用於
- 題目資料
- 主題資料
- 分支資料
- 公式說明文字
- GUI 要顯示的中文內容

## 5. 這次已確認的高風險錯誤

以下流程會把中文轉成 `?`，屬於禁止再用的做法：

1. 在 PowerShell here-string 裡寫中文
2. 用 `| python -` 把內容送進 Python
3. 讓 Windows shell / stdin / code page 中途轉碼
4. 再把壞掉的內容寫回 JSON
5. 最後同步到前端橋接檔

這不是題庫原本壞掉，而是寫入方式本身有風險。

## 6. 每次修改後的強制驗證

### 題目修改後
至少檢查：
- pack 裡對應題號是否正確
- `question-db.json` 裡同題號是否一致
- `question_text` / `answer_text` / `explanation_text` 是否出現 `?`
- 圖片標記是否仍可讀

### 匯入驗證
跑匯入後至少確認：
- `questions_added` 是否符合預期
- `questions_skipped_existing` 是否大於 0（代表舊題確實被跳過，而不是被覆蓋）
- `questions_total` 沒有因匯入而異常減少

### 公式主題修改後
至少檢查：
- `formula-db.json` 目標主題是否正常
- 是否有 `?`、`???`、`���`
- 同步後 `data/formula-content.js` 是否正常

### 同步前的硬性要求
只要這次修改有碰到中文，就必須先完成上面的驗證，再允許同步。

如果驗證還沒做，或驗證失敗：
- 不同步 `question-content.js`
- 不同步 `formula-content.js`
- 不繼續做下一批修改

## 7. 批次修改規則

### 可以保守批次處理的內容
- `\ne`
- `\le`
- `\ge`
- 明確一致的圖片路徑替換

### 不可以直接全庫硬改的內容
- 小題換行
- 選項換行
- 題目標題優化
- 題幹重新潤句

這些只能：
1. 先挑少量樣本
2. 驗證畫面結果
3. 再分章處理

如果牽涉中文語句重寫，預設當成高風險，不直接批次掃全庫。

## 8. GUI 手改後的流程

如果先在 GUI 裡手改題庫資料：

1. 先改 `question-db.json` 對應內容
2. 記下題目 id
3. 再同步回對應章節 pack 的 `questions.json`
4. 同步前端橋接檔

### 重要
在 GUI 手改完、但還沒同步回正式 pack 前：
- 不可以重跑整批匯入

否則正式 pack 會把 GUI 手改蓋掉。

## 9. 本專案之後的建議操作順序

### 單題或少量題目修改
1. 改 pack 的 `questions.json`
2. 改 `question-db.json`
3. 檢查題號與文字
4. 同步 `data/question-content.js`

### 主題資料修改
1. 改 `formula-db.json`
2. 檢查目標主題
3. 同步 `data/formula-content.js`

### 中文主題/分支文字修改
1. 先只改少量目標
2. 先驗證 `formula-db.json` 內實際內容
3. 確認沒有 `?` / `???` / `���`
4. 再同步 `data/formula-content.js`
5. 若需要，再檢查前端畫面

### 整批匯入
1. 先確認正式 pack 已同步到最新內容
2. 再跑整批匯入
3. 再同步前端橋接檔

## 10. 失誤防呆原則

之後如果要做任何批次修改，必須先滿足：
- 先明確列出改哪些題號或哪些章節
- 先做小樣本驗證
- 沒驗證通過前，不擴大到整章或整庫

如果只是局部文字修正，優先用最小範圍修改，不要為了方便改用高風險方法。

## 11. 不可再重犯的錯誤

以下情況視為重大流程錯誤：
- 把中文改成 `?`
- 把主題頁中文說明改成亂碼
- 未驗證就同步橋接檔
- 用高風險 shell 管線批次改中文資料

一旦發生，必須先停止新增修改，先完成：
1. 盤點本次改過的所有題號 / 主題 id
2. 全部逐一驗證
3. 全部修回正常
4. 才能繼續下一批工作
