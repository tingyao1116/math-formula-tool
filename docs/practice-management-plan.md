# Practice Management Plan

## Current Reality

- `data/formula-practice.js` 是目前無限練習的真正 runtime 來源。
- `program-db/database/practice-db.json` 現在只是一層 assignment / override 資料庫。
- Python GUI 已經能管理 assignment，但還不能安全地直接管理 generator 程式碼。
- 目前這一批 generator 在現況下都是 `legacy-direct`：主題 `id` 直接對到 `formula-practice.js` 的 config key。

## Best Long-Term Structure

建議把無限練習拆成三層，而不是讓 GUI 直接寫整份 `formula-practice.js`：

1. `practice-db.json`
- 管主題掛載。
- 欄位：`id`、`enabled`、`mode`、`practiceKey`、`title`、`difficulty`、`questionCount`、`prompt`、`answer`。

2. `practice-generator-db.json`
- 管 generator metadata 與可模板化參數。
- 欄位建議：
  - `id`
  - `builderType`
  - `title`
  - `difficulty`
  - `questionCount`
  - `params`
  - `status`
  - `notes`

3. `formula-practice-builders.js`
- 放真正的 JS builder 函數，例如 `buildMidpointSet()`、`buildCoordinateOriginUnitChangeSet()`。
- 這層保留程式邏輯，不給 GUI 直接亂改 raw JS。

4. `formula-practice.generated.js`
- 由 `practice-generator-db.json` 自動產生 config map。
- 內容只做：
  - `type`
  - `title`
  - `difficulty`
  - `questionCount`
  - `generate() { return builderRegistry[builderType](params); }`

## Why This Is Safer

- GUI 管資料，不直接管任意 JS 字串，壞掉機率低很多。
- 可以先驗證欄位，再決定要不要生成 JS。
- Builder 邏輯與主題掛載分開後，維護責任清楚。
- 即使生成失敗，也只會壞在 generated 檔，不會把手寫 builder 一起污染。

## Migration Order

### Phase 1

- 保留現有 `data/formula-practice.js` 繼續運作。
- 把所有 legacy direct 項目補成 `practice-db.json` assignment。
- 這一步完成後，GUI 看到的不再只是 overlay，而是正式 DB 記錄。

### Phase 2

- 新增 `practice-generator-db.json`。
- 先搬最適合模板化的 generator family：
  - `buildBinomialQuestions`
  - `buildPureConjugateQuestions`
  - `buildPureSquareDifferenceQuestions`
  - `buildModuloRemainderSet`
  - `buildModuloUnknownMultipleSet`
  - `buildModuloUnknownRemainderSet`

這些 family 的特徵是：
- 同一個 builder 被多個主題共用
- 差異主要只在參數
- 很適合做成 GUI 可編輯模板

### Phase 3

- 保留單一主題專用 builder 在 `formula-practice-builders.js`。
- GUI 只管理 metadata 與 assignment，不直接改 JS 邏輯。
- 如果之後某個 builder family 開始大量重複，再把它抽進 `practice-generator-db.json`。

## What Not To Do

不建議讓 GUI 直接存這種內容：

```js
generate() {
  return buildCoordinateOriginUnitChangeSet(10);
}
```

原因：

- 一個逗號、引號、括號錯掉就會整份 JS 壞掉。
- 很難做欄位驗證。
- 未來 diff、備份、版本控制都會變得很難讀。

## Recommended Next Step

最穩的下一步不是直接改 GUI 寫 JS，而是：

1. 先把 88 筆 legacy direct 項目補進 `practice-db.json`
2. 再新增 `practice-generator-db.json`
3. 先只把可模板化的 generator family 資料庫化
4. 最後才考慮 GUI 是否要提供「進階程式碼模式」

這樣做的好處是，我們可以一邊維持網站正常出題，一邊把管理層慢慢轉正，不會一次動到最容易壞的 runtime 邏輯。
