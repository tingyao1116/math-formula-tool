# 無限練習交接文件（2026-06-03）

本文件給新對話接手使用。請先讀完再動 `data/formula-practice.js`、`data/formula-practice-assignments.js`、`program-db/database/practice-db.json`。

## 專案位置

- 專案根目錄：`C:\codex資料夾\數學公式使用工具`
- 主要生成器：`data/formula-practice.js`
- 主頁/章節掛載：`data/formula-practice-assignments.js`
- 題庫資料庫：`program-db/database/practice-db.json`

## 使用者固定標準

### 出題標準

- 不出無效題：係數 0、同項可直接合併、題意矛盾、無整數解卻要求整數。
- 不出低資訊題：已標記「太簡單」或只是固定答案的模板要禁用。
- 參數要先過濾再出題，不要先生成爛題再補救。
- 無限練習不是打亂順序，而是同一計算方法下可變參數、可持續產生新題。
- 不要出「承上題」；若原素材有承上題，要改成同一題內完整問完。
- 缺圖才看得懂的題目要改成文字完整描述，或不要做。

### 顯示標準

- `1x` 要顯示成 `x`，`1x^2` 要顯示成 `x^2`。
- `-1(...)` 要顯示成 `-(...)`。
- 禁止出現 `--8`、`+-` 這類字串。
- 分數一律最簡分數；比例一律最簡整數比。
- 根式一律最簡根式；分母需有理化；不出 `\sqrt{9}` 這類完全平方根號題。
- 數學符號要直接由生成函數輸出正確文字/TeX，不用前端遮掩式修正。
- 中文必須是 UTF-8 正常繁體中文，不能出現 `???` 或 mojibake。

### 答案標準

- 每題都要有「簡答」。
- 若該類題型有指定過程，同題必附完整「過程」，不能只寫提示句。
- 禁止長小數；能用分數、根式或精確值就用精確值。

### 資料層標準

- 先改 `data/formula-practice.js` 生成邏輯。
- 再同步 `practice-db.json` 與 `formula-practice-assignments.js`。
- 不做前端遮掩式修正。
- 新增題型要用新增方式，不要覆蓋或刪除既有重要資料。
- 若判斷舊題型錯誤或重複，先說明再調整掛載。

### 交付前檢查

- 語法檢查：
  - `node --check data/formula-practice.js`
  - `node --check data/formula-practice-assignments.js`
  - `node -e "JSON.parse(require('fs').readFileSync('program-db/database/practice-db.json','utf8')); console.log('practice-db ok')"`
- 抽樣檢查：每個新類型至少看 5 題，核對「題幹 / 簡答 / 過程 / 格式」一致。
- 搜尋 `???`，尤其新增章節標題、題型標題、說明文字。

## 寫檔注意事項

Windows PowerShell 的 `Set-Content -Encoding UTF8` 可能產生 BOM，先前曾造成資料讀取或顯示異常。若用腳本寫檔，建議使用無 BOM UTF-8：

```powershell
$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $path), $text, $enc)
```

手動小改優先用 `apply_patch`。

## 已知反覆問題

- 部分章節標題或題型標題曾出現 `???`，多半是資料層中文字串寫壞，不是 MathJax 或前端渲染問題。
- 部分新增題型曾只是固定題目輪流出，這不符合無限練習標準；要重做成參數化模板。
- `s2-2-1` 到 `s2-2-4`、`s2-3-1` 到 `s2-3-2`、以及後續部分高三章節，使用者已明確懷疑重複性太高；後續修正要優先檢查參數是否真的變化。
- `s3-2-4` 曾有主題標題顯示 `???`，使用者要求先修正標題。
- `s3-3-1` 目前分類方向要重做，不應混入座標向量與具體座標計算。

## 最近使用者要重整的章節

### `s3-3-1`：幾何向量

使用者明確重新定義：

- `s3-3-1` 是「幾何向量」。
- 題目應以三角形、四邊形、其他幾何圖形表示向量。
- 題目較抽象、較少座標。
- 不應放大量直角座標計算、向量座標加減、力學座標分量等題型。

目前使用者指出 `s3-3-1` 已經亂掉，截圖中錯誤例子包含：

- 題型混入座標向量，例如 `u=((1,4)), v=(-3,1)`。
- 題型混入座標平面區域、力的座標、向量方程式。
- 題型標題如「向量代數與線性關係五小類」、「幾何分點、區域與應用五小類」分類不準。

建議重做方向：

1. `s3-3-1` 主頁只掛幾何向量大類。
2. 座標計算型題目應移到或保留給 `s3-3-2`「座標向量」。
3. 幾何向量可分成這幾個大類：
   - 三角形分點、面積比與心點向量
   - 多邊形向量鏈與相異向量計數
   - 四邊形、網格與幾何分解向量
4. 物理力學、方向角、速度分量若要保留，較適合 `s3-3-2` 或後續應用章節，不要掛在 `s3-3-1` 幾何向量主題。

### `s3-3-2`：座標向量

使用者重新定義：

- `s3-3-2` 是「座標向量」。
- 題目可用直角座標表示向量。
- 可包含向量座標運算、平行垂直、線性組合、方向角、單位向量、力或速度分量等較具體計算。

若整理 `s3-3-1` 時發現原本掛錯的座標題型，應考慮移到 `s3-3-2`，但不要未檢查就大量搬移。

## `s3-3-1` 建議小類素材整理

適合放在 `s3-3-1` 的題型：

- 三角形分點：
  - `D` 在 `BC` 上，已知 `BD:DC=m:n`，求 `\overrightarrow{AD}=x\overrightarrow{AB}+y\overrightarrow{AC}`。
  - 參數要變化 `m,n`，答案為 `x=n/(m+n), y=m/(m+n)`。
- 重心：
  - `G` 為 `\triangle ABC` 重心，求 `\overrightarrow{AG}` 或證明 `\overrightarrow{GA}+\overrightarrow{GB}+\overrightarrow{GC}=\vec 0`。
- 面積比與向量係數：
  - 若 `p\overrightarrow{PA}+q\overrightarrow{PB}+r\overrightarrow{PC}=\vec 0`，求 `\triangle PBC:\triangle PCA:\triangle PAB=p:q:r`。
  - 參數 `p,q,r` 要正整數且最簡比。
- 四邊形分點：
  - 平行四邊形 `ABCD` 中，`E` 在 `CD` 上且 `CE:ED=m:n`，求 `\overrightarrow{AE}` 用 `\overrightarrow{AB},\overrightarrow{AD}` 表示。
- 向量鏈化簡：
  - `\overrightarrow{AB}+\overrightarrow{BC}+\overrightarrow{CD}=\overrightarrow{AD}`。
  - `\overrightarrow{AC}-\overrightarrow{BC}=\overrightarrow{AB}`。
  - 題目要完整，不要依賴圖。
- 多邊形頂點決定的向量計數：
  - 正 `n` 邊形、正方形含中心、正六邊形等。
  - 要明確說「非零向量」、「有向線段」、「自由向量」或「相異向量」，避免語意不清。
- 幾何圖形中的線性組合：
  - 菱形網格、平行四邊形網格、正六邊形網格可以做，但必須用文字完整定義基底向量與點的位置。

不適合直接放在 `s3-3-1` 的題型：

- 直接給 `u=(a,b), v=(c,d)` 的座標運算。
- 求向量座標、單位向量、方向角、力的平衡座標。
- 需要截圖或圖形才知道點在哪裡的題目。

## 建議新對話第一句

可直接貼：

> 請先讀 `infinite-practice-handoff-2026-06-03.md`。接著從 `s3-3-1` 開始重做：`s3-3-1` 是幾何向量，不能混入座標向量；請檢查目前 `data/formula-practice.js`、`data/formula-practice-assignments.js`、`program-db/database/practice-db.json` 的掛載，將幾何向量題型用新增/修正方式做成參數化無限練習，並把座標向量題型保留或移到 `s3-3-2`。完成後做語法檢查與每小類抽樣。

## 建議工作流程

1. 先用 `rg` 搜尋：

```powershell
rg -n "s3-3-1|s3-3-2|向量|平面向量" data/formula-practice.js data/formula-practice-assignments.js program-db/database/practice-db.json
```

2. 讀出目前 `s3-3-1`、`s3-3-2` 的 generator id 與掛載 id。
3. 判斷哪些舊題型是幾何向量，哪些是座標向量。
4. 對 `s3-3-1`：
   - 保留或新增幾何向量大類。
   - 拿掉主頁上錯掛的座標題型。
   - 每小類做真正參數化生成函數。
5. 同步更新：
   - `data/formula-practice.js`
   - `data/formula-practice-assignments.js`
   - `program-db/database/practice-db.json`
6. 檢查：
   - 語法
   - JSON
   - `???`
   - 每小類至少 5 題抽樣。

## 最後提醒

使用者最在意的是「不要亂蓋掉舊資料」與「題型要真的能無限生成」。如果某一類題型只能靠固定題目或缺圖才能成立，應該先改成參數完整的文字題，否則不要掛上主頁。
