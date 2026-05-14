# Codex 固定作業規則（唯一準則）

本文件是本專案的固定規則欄。  
之後所有資料調整、排序、匯出、同步檢查，都以本文件為準。

## 1) 單一資料來源原則

1. 內容主資料：`data/formula-content.js`
2. 結構/章節代碼/parent 關係：`formula-data.js`
3. 管理頁與結構頁的編輯結果：寫入同一個 localStorage key  
`math-formula-tool-managed-data-v2`
4. 任何分析或匯出，不可只讀單一檔案，必須走完整載入鏈：
`formulas.js -> data/chapter-code-config.js -> data/formula-content.js -> formula-data.js`

## 2) 任務流程規則（什麼時候看什麼）

### A. 開始做任何修改前（必做）

1. 先讀本文件
2. 先確認資料筆數基準（目前為 670）
3. 先跑健康檢查：
`node .\scripts\build-data-health-report.mjs`

### B. 做「章節/排序/結構」修改時

1. 先看：`formula-data.js`
2. 若牽涉結構頁顯示，再看：`structure-view.html`
3. 修改後重跑：
`node .\scripts\build-data-health-report.mjs`

### C. 做「主題內容」修改時

1. 先看：`data/formula-content.js`
2. 不得把內容邏輯塞回 `formula-data.js`
3. 修改後重跑健康檢查

### D. 需要給你人工檢查清單時

1. 產出：
`node .\scripts\export-all-topics-list.mjs`
2. 使用：
`exports/all-topics-branches-670.html`

## 3) 禁止事項（避免反覆壞掉）

1. 禁止只載入 `formula-data.js` 就判斷資料總數
2. 禁止用臨時匯出檔當資料真相來源
3. 禁止同一個規則分散改在多個地方且無文件記錄
4. 禁止改完不跑健康檢查就回報完成

## 4) 交付前必過檢查

1. `exports/data-health-check.json` 必須滿足：
- `totals.all = 670`（若你要求變更筆數，需在回報中明講）
- `duplicateIds = 0`
- `missingChapterCode = 0`
- `badParent = 0`
- `cycleIds = 0`
2. 若改了排序邏輯：
- 主頁、管理頁、結構頁排序規則需一致
3. 若改了可視頁面：
- 更新 `sw.js` cache version，避免讀到舊快取

## 5) 回報格式規則（我對你）

每次完成時，固定回報：

1. 改了哪些檔案
2. 跑了哪些檢查
3. 檢查結果數字
4. 是否有殘留風險

---

若本文件與其他舊文件衝突，以本文件優先。
