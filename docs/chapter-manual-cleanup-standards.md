# 題庫整章人工整理標準

這份文件用來固定「整章人工整理模式」的行為標準，避免每一章越做越漂，或又回到靠前端猜公式的做法。

適用範圍：
- `program-db/imports/packs/<chapter-code>/questions.json`
- `program-db/database/question-db.json`
- `data/question-content.js`

不適用範圍：
- `formula-db.json`
- 主題／分支／公式頁資料

## 1. 核心原則

1. 題目資料本身就要寫清楚。
2. 數學內容必須在資料端明確標成 TeX，不依賴前端判斷。
3. 每章用人工逐題整理，不用整章自動重寫。
4. 圖片標記保留原狀，不把 `[圖:...]` 捲進數學模式。
5. 修改題目時，一定同步 pack、question-db、question-content。

## 1.1 單一權威來源

題目資料在目前專案結構下，單一權威來源應固定為：
- `program-db/database/question-db.json`

其餘兩份都視為衍生檔：
- `data/question-content.js`：由 `question-db.json` 同步出的前端橋接檔
- `program-db/imports/packs/<chapter-code>/questions.json`：新增題目時可用的匯入來源／歷史備份

因此：
- 既有題目的正式修改，直接改 `question-db.json`
- `question-content.js` 只負責同步前端，不手改
- pack 不再作為既有題目的日常主編輯來源
- 匯入僅負責新增新題，不可覆蓋 db 內既有題目

一句話原則：
- 題目正式內容以 db 為準；pack 只作新增來源，不作覆蓋來源

## 2. 必做動作

每一章都要逐題檢查這四個欄位：
- `title`
- `question_text`
- `answer_text`
- `explanation_text`

### `title` 標準

- 必須真的看題目內容後命名。
- 可以保留 `範例X：...`、`隨堂練習：...` 這種形式。
- 標題要是短題名，不是直接截題幹前幾個字。

好例子：
- `範例5：等差數列求一般項`
- `隨堂練習：正五邊形黑點數`
- `範例3：由$S_n$求$a_n$`

壞例子：
- 直接拿整段題幹當 `title`
- 只取前 12 個字形成半句
- 不看題意就用機械摘要生成標題

### 數學內容標準

明顯是數學的內容，都要改成明確 TeX：
- 下標：`$a_n$`、`$S_n$`
- 上標／次方：`$2^n$`、`$(-1)^{n-1}$`
- 分數：`$\frac{1}{2}$`
- 根號：`$\sqrt{5}$`
- 數列記號：`$\langle a_n \rangle$`
- 代數式：`$a_n=a_1+(n-1)d$`
- 不等式：`$0<a_1<2$`
- 函數、變數、參數：`$f(x)$`、`$x$`、`$k$`、`$r$`

原則：
- 整串是數學，就整串包成 `$...$`
- 不要只包其中一小段，留下半數學半純文字

好例子：
- `$a_n=a_1+(n-1)d$`
- `$a_{n+1}=\frac{1}{2}a_n+3$`
- `已知等差數列$\langle a_n\rangle$中$a_2=30$，$a_6=14$`

壞例子：
- `a_n=a_1+(n-1)d`
- `$a_n$=$a_1$+$(n-1)d$`
- `a_1=2，a_{n+1}=\frac{1}{1-a_n}` 這種只包一部分

## 3. 圖片標記標準

圖片標記一律保留原樣：
- `[圖:program-db/.../image.png]`

不可做的事：
- 變成 `[$圖$:...]`
- 把圖片標記包進 `$...$`
- 把圖片路徑切碎混進數學式

如果同一行同時有文字、數學、圖片：
- 只改文字中的數學內容
- 圖片標記前後維持正常分隔

好例子：
- `(1) [圖:...image1.png] (2) 求$a_5$。`
- `已知$a_1=5$。[圖:...image2.png] 求$a_n$。`

壞例子：
- `$(1)[圖:...](2)$`
- `[$圖$:...image.png]`

## 4. 答案欄標準

`answer_text` 要盡量是結果型答案，不要塞整段解析。

好例子：
- `$a_{22}=-50$，$a_n=38-4n$`
- `$(1)$a_2=\frac13$，$a_3=\frac14$；$(2)$a_n=\frac{1}{n+1}$；$(3)$見詳解`
- `見詳解`
- `(1)(2)(3)(4)(5)`（只限選擇題）

壞例子：
- 把推導過程整段貼進答案欄
- 只留 `(1)`，但題目其實不是選擇題
- 用錯題詳解尾句直接塞入答案

## 5. 詳解欄標準

`explanation_text` 要做到：
- 公式顯示正確
- 敘述仍保留中文可讀性
- 不把每個中文字都包進數學模式

好例子：
- `【解析】由$a_n+2a_{n-1}=0$可得$a_n=-2a_{n-1}$，因此此數列是等比數列。`
- `【解析】由$S_n=n^2+3$可得$a_1=S_1=4$。`

壞例子：
- 全段都包在 `$...$`
- 圖片標記混進公式
- 自動轉換後出現 `r^n-1`、`2^n+1-1` 這類被黏壞的式子

## 6. 明確禁止的做法

以下都屬於壞動作：

1. 整章自動重寫 `question_text` / `answer_text` / `explanation_text`
2. 用規則把所有英文一口氣全包成 TeX，不逐題確認
3. 用題幹前半段直接當 `title`
4. 把 `[圖:...]` 改壞
5. 只修改 pack，不同步 `question-db.json`
6. 改完 `question-db.json` 後忘記同步 `data/question-content.js`
7. 用會破壞中文編碼的管線或臨時輸入方式大量改檔

## 7. 每章標準流程

1. 盤點該章目前狀態
2. 逐題閱讀內容，修 `title`
3. 逐題修 `question_text`
4. 逐題修 `answer_text`
5. 逐題修 `explanation_text`
6. 確認圖片標記沒壞
7. 寫回 `program-db/imports/packs/<chapter-code>/questions.json`
8. 同步匯入到 `program-db/database/question-db.json`
9. 同步更新 `data/question-content.js`
10. 驗證 pack / db / question-content 一致

## 8. 驗證清單

每章完成後至少檢查：
- pack 與 `question-db.json` 題號一致
- `title` 一致
- `question_text` 一致
- `answer_text` 一致
- `explanation_text` 一致
- 沒有壞掉的 `[圖:...]`
- 沒有明顯錯誤的 `$...$`
- 沒有 `�`、`???`、`���`

## 9. 執行口令

之後如果要沿用這份標準，可以直接使用這句：

`下一章照整章人工整理模式處理：逐題看內容修 title，題幹 / 答案 / 詳解的數學全部改成明確 TeX，圖片不動，最後同步 pack、question-db.json、question-content.js。`
