# 高一上主軸遷移起手式

這份文件是把 `高一上全重點_易讀版.docx` 當成高一上正式主軸時，實際開工要照的順序。

## 目標

- 以 Word 版的 `單元 -> 主題 -> 重點整理` 作為高一上的正式主題骨架。
- 原本網站裡已存在的舊 root topic 不直接刪除。
- 舊資料優先改成：
  - 掛到新主軸主題底下的分支
  - 或保留成預備主題 / 備份主題
  - 或把內容吸收進章節大綱

## 正式資料源

- 主題樹主檔：`program-db/database/formula-db.json`
- 章節大綱主檔：`program-db/database/chapter-overview-db.json`
- 前端主題橋接：`data/formula-content.js`
- 前端章節大綱橋接：`chapter-overviews.js`

## 開工原則

1. Word 的「主題」先當頂層主題。
2. 每章只保留一套清楚的主軸，不再讓兩個 root topic 並列搶主角。
3. `高中第一冊-最重要的幾句話.md` 優先當章節大綱的 `可修改版` 文案來源。
4. Word 裡較完整的段落內容，優先拆進主題卡的：
   - `usage`
   - `examples`
   - `tips`
   - `notes`
   - `mistakes`
5. 先做樣板章，再批次往下推。

## 建議起手三章

先做這三章，因為剛好能驗證三種最常見情況。

1. `s1-1-1 實數`
   - 驗證「一章多主題」主軸拆法
   - 驗證舊 root topic 改成預備主題或章節摘要
2. `s1-2-1 直線方程式`
   - 驗證幾何章的多主題拆法
   - 驗證大量舊分支重掛
3. `s1-3-1 多項式函數`
   - 驗證原本主題太少、需要從 Word 補出主軸的情況

## 高一上主軸對照

### s1-1-1 實數

- Word 主軸主題：
  - 有理數的定義與性質
  - 無理數
  - 實數與數線
  - 距離與分點公式
- 現有 root：
  - `senior-real-number-overview`：單元 1 實數
  - `s1-1-1-real-number-core`：實數分類與基本性質
- 建議處理：
  - 保留 `senior-real-number-overview` 當主角 root
  - 把 `s1-1-1-real-number-core` 改成「預備主題」或吸收到章節大綱
  - 其餘舊分支依語意掛回四個 Word 主題

### s1-1-2 絕對值

- Word 主軸主題：
  - 絕對值
- 現有 root：
  - `s1-1-2-absolute-value-core`
- 建議處理：
  - 這章相對單純，可直接以現有 core 當正式主軸
  - Word 內容主要補強章節大綱與欄位文案

### s1-1-3 式的運算

- Word 主軸主題：
  - 乘法公式、分式與根式的運算
  - 算幾不等式
- 現有 root：
  - `senior-expression-operations`：式的運算總覽
  - `s1-1-3-algebraic-operations`：式的運算與乘法公式
- 建議處理：
  - 保留 `senior-expression-operations` 當主角 root
  - `s1-1-3-algebraic-operations` 改成主角底下的重點分支，或保留成預備主題
  - 算幾不等式獨立成正式分支，不再只當附帶內容

### s1-1-4 指數

- Word 主軸主題：
  - 指數律
- 現有 root：
  - `s1-1-4-exponent-rules`
- 建議處理：
  - 直接沿用現有 core
  - 把 Word 的條件提醒、常見陷阱補進文案

### s1-1-5 對數

- Word 主軸主題：
  - 常用對數
  - 科學記號
- 現有 root：
  - `senior-logarithm-main-s322`：對數
  - `s1-1-5-logarithm-core`：對數定義與運算律
- 建議處理：
  - 保留 `senior-logarithm-main-s322` 當主角 root
  - `s1-1-5-logarithm-core` 改成預備主題或底下核心分支
  - 科學記號保留為正式主題，不要只埋在 notes

### s1-2-1 直線方程式

- Word 主軸主題：
  - 坐標系
  - 直線斜率
  - 直線方程式
  - 二元一次不等式
- 現有 root：
  - `senior-line-equation`：直線方程式
  - `s1-2-1-line-equations-core`：直線方程式與斜率
- 建議處理：
  - 保留 `senior-line-equation` 當主角 root
  - `s1-2-1-line-equations-core` 改成「先讀這章」或主角底下的導覽節點
  - 把 Word 的四個主題升成正式主題層

### s1-2-2 圓的方程式

- Word 主軸主題：
  - 圓的方程式
- 現有 root：
  - `senior-circle-equation`
  - `s1-2-2-circle-equation-core`
- 建議處理：
  - 保留 `senior-circle-equation` 當主角 root
  - `s1-2-2-circle-equation-core` 改成預備主題或導覽節點

### s1-2-3 圓與直線的關係

- Word 主軸主題：
  - 圓與點之關係
  - 圓與直線的關係
  - 圓之切線
  - 圓系
- 現有 root：
  - `senior-circle-line-relation`
  - `s1-2-3-line-circle-relation-core`
- 建議處理：
  - 保留 `senior-circle-line-relation` 當主角 root
  - `s1-2-3-line-circle-relation-core` 降成導覽節點或典型題型分支

### s1-3-1 多項式函數

- Word 主軸主題：
  - 多項式基本概念
  - 多項式四則運算
  - 餘式定理與因式定理
- 現有 root：
  - `s1-3-1-polynomial-function-core`
- 建議處理：
  - 這章目前骨架太薄，要直接依 Word 補成三個正式主題
  - 原有 core 可改成章節導覽節點

### s1-3-2 簡單多項式函數及其圖形

- Word 主軸主題：
  - 線型函數
  - 二次函數
  - 單項函數
  - 多項式函數的圖形
- 現有 root：
  - `senior-polynomial-function-graphs-basic`
  - `s1-3-2-polynomial-graph-core`
- 建議處理：
  - 保留 `senior-polynomial-function-graphs-basic` 當主角 root
  - `s1-3-2-polynomial-graph-core` 改成導覽節點或核心摘要

### s1-3-3 多項式不等式

- Word 主軸主題：
  - 一元一次不等式的解法
  - 二次不等式的解法
  - 高次不等式的解法
- 現有 root：
  - `senior-polynomial-inequality-main`
  - `s1-3-3-polynomial-inequality-core`
- 建議處理：
  - 保留 `senior-polynomial-inequality-main` 當主角 root
  - `s1-3-3-polynomial-inequality-core` 改成方法總覽或導覽節點

### s1-x 高一上補充

- Word 主軸主題：
  - 沒有獨立補充主題，偏整冊總整理
- 現有 root：
  - `s1-x-integrated-checklist`
- 建議處理：
  - 暫時保留
  - 等前 11 章定型後，再決定哪些真的該留在補充章

## 第一輪實作順序

### 第 1 步：先備份

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\create-project-backup.ps1
```

### 第 2 步：先改章節大綱，不先動大量主題

先把下列資料整理好：

- `s1-1-1`
- `s1-2-1`
- `s1-3-1`

每章先補兩種內容：

- `可修改版`
  - 來源：`高中第一冊-最重要的幾句話.md`
- `原稿版`
  - 來源：Word / PDF 的原始整理

這一步先改：

- `program-db/database/chapter-overview-db.json`

再同步：

- `chapter-overviews.js`

### 第 3 步：整理主題 root

每章只先做一件事：

- 確定哪一個 root 是正式主角
- 其他 root 改成：
  - 預備主題
  - 導覽節點
  - 或主角底下分支

這一步只改：

- `program-db/database/formula-db.json`

### 第 4 步：補 Word 主題層

如果目前章節缺少 Word 裡的正式主題，就新增主題。

新增後確認：

- `chapterCode`
- `parentId`
- `chapterRole`
- `usage/examples/tips/notes/mistakes`

### 第 5 步：同步前端橋接

主題同步：

```powershell
python .\program-db\scripts\sync_web_data.py
```

章節大綱同步：

如果是直接改 DB，需額外跑會產出 `chapter-overviews.js` 的同步流程。

### 第 6 步：驗證

至少檢查：

- `node .\scripts\build-data-health-report.mjs`
- `chapter.html?code=s1-1-1`
- `chapter.html?code=s1-2-1`
- `chapter.html?code=s1-3-1`
- 管理頁和首頁是否還能正常顯示

## 這次不要先做的事

- 不先全冊一起改
- 不先大批重命名所有 topic id
- 不先把所有舊 root 刪掉
- 不先做每個主題雙版本資料結構升級

## 下一步建議

真正開始時，先只做這三件事：

1. 把 `s1-1-1 / s1-2-1 / s1-3-1` 的章節大綱改成 Word 主軸版本
2. 決定每章正式 root 只留哪一個
3. 列出這三章哪些舊 topic 要掛到哪個 Word 主題底下

做完這三章後，再把同樣模板往整冊複製。
