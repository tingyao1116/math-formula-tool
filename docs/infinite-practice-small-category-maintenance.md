# 無限練習小類維護手冊

這份文件是給後續維護 `j1 / j2 / ...` 等無限練習小類時使用的操作手冊。

重點不是抽象架構，而是直接回答這幾件事：

1. 新增一個小類時，到底要改哪些檔案
2. 刪除一個小類時，到底要改哪些檔案
3. 排序是由哪一層決定
4. 哪些檔案是來源，哪些檔案只是同步結果
5. 最容易犯的錯是什麼

---

## 1. 先分清楚四個層次

目前無限練習不是只看單一檔案，而是至少有四層：

1. 題目主資料庫  
   [program-db/database/practice-db.json](C:/codex資料夾/數學公式使用工具/program-db/database/practice-db.json)

2. generator 實作層  
   例如：
   - [data/practice-generators/j1.js](C:/codex資料夾/數學公式使用工具/data/practice-generators/j1.js)
   - 其他章節對應的 `data/practice-generators/*.js`

3. 同步後的橋接檔  
   [data/formula-practice-assignments.js](C:/codex資料夾/數學公式使用工具/data/formula-practice-assignments.js)

4. 前端顯示層  
   - [practice-bank.html](C:/codex資料夾/數學公式使用工具/practice-bank.html)
   - [practice-mobile.html](C:/codex資料夾/數學公式使用工具/practice-mobile.html)
   - [ability-practice.html](C:/codex資料夾/數學公式使用工具/ability-practice.html)
   - [sw.js](C:/codex資料夾/數學公式使用工具/sw.js)

另外還有一個很重要但不要亂刪的主控層：

- [data/formula-practice.js](C:/codex資料夾/數學公式使用工具/data/formula-practice.js)

它現在不是單純舊資料倉庫，而是 runtime 的主控與包裝層。
不要因為 generator 已分拆到 `data/practice-generators/*.js`，就以為可以把它移除或改名。

---

## 2. 哪些檔案是「來源」，哪些只是「同步結果」

### 真正來源

平常新增、刪除、排序，真正要先改的是：

1. `practice-db.json`
2. 對應章節的 generator 檔，例如 `j1.js`

### 同步結果，不要直接手改

下面這個檔案原則上不是手改來源，而是同步產物：

- `data/formula-practice-assignments.js`

如果直接手改這個檔，之後一跑同步就會被覆蓋。

---

## 3. 新增一個小類時，要改哪些地方

## 3-1. 最常見情況：新增一個普通小類

例如你要在 `j1-1-2` 新增一個新的無限練習小類。

通常要改三件事：

1. 在 `data/practice-generators/j1.js` 新增 generator 設定與出題函數
2. 在 `practice-db.json` 的 `practices` 新增這個小類的資料定義
3. 在 `practice-db.json` 的 `bindings` 把這個小類掛到對應章節

最後再做：

4. 跑同步腳本，更新 `data/formula-practice-assignments.js`

---

## 3-2. `j1.js` 要新增什麼

通常至少要有：

1. `generatorKey`
2. `title`
3. `questionCount`
4. `generate()` 或對應 builder
5. 如果是「四小題、五小題」這種集合類，還要有 subtype 集合定義

注意：

- generator 裡原本寫的 `10`、`8`、`6` 這類數字，不一定是最後前端顯示題數
- 目前實際輸出數量，主要還是受外層 `questionCount` 控制
- 現在多數已經往 5 題基準收斂

所以新增時不要只看 generator 內部數字，就以為那是最後出題量。

---

## 3-3. `practice-db.json` 的 `practices` 要新增什麼

每一個可顯示的小類，都要有一筆 practice 定義。

至少會包含這些欄位：

- `id`
- `enabled`
- `mode`
- `title`
- `generatorKey`
- `difficulty`
- `questionCount`
- `subtypeCount`
- `chapterCode`
- `stage`
- `grade`
- `term`
- `chapter`
- `domain`
- `tags`

這一層回答的是：

「這個小類是什麼？」

---

## 3-4. `practice-db.json` 的 `bindings` 要新增什麼

這一層最重要，因為它決定：

1. 小類掛在哪一章
2. 要不要顯示
3. 顯示排序

常見欄位是：

- `practiceId`
- `targetType`
- `targetId`
- `enabled`
- `order`

例如：

```json
{
  "practiceId": "practice-j1-1-2-substitution-five-subtypes",
  "targetType": "chapter",
  "targetId": "j1-1-2",
  "enabled": true,
  "order": 6
}
```

這代表：

- 這個小類會出現在 `j1-1-2`
- 前端可見
- 排在第 6 個

---

## 3-5. 新增後要跑的同步指令

新增完來源資料後，要跑：

```powershell
python .\program-db\scripts\sync_practice_bridge.py
```

這會更新：

- `data/formula-practice-assignments.js`

如果不跑這一步，前端通常讀不到新的小類。

---

## 3-6. 什麼情況需要再改前端版本號

如果你改完資料後，網頁還是像沒更新，通常是快取問題。

這時要一起檢查：

- `practice-bank.html`
- `practice-mobile.html`
- `ability-practice.html`
- `sw.js`

常見作法：

1. 更新 script version query
2. 更新 `sw.js` 的 `CACHE_NAME`

這不是每次新增小類都一定要改。
但如果前端已經吃到舊快取，這一步很重要。

---

## 4. 刪除一個小類時，要改哪些地方

刪除要先分成兩種情況。

## 4-1. 只是不想顯示在章節裡

這是最安全的做法。

通常只要改：

- `practice-db.json` 的 `bindings`

做法有兩種：

1. 把那筆 binding 設成 `enabled: false`
2. 直接刪掉那筆 binding

這樣前端章節不會顯示它，但 generator 還在，之後要恢復比較容易。

適合：

- 暫時下架
- 重新整理分類
- 不確定之後是否還要用

---

## 4-2. 要真正徹底刪掉

如果是要完全移除，就要一起改三層：

1. `practice-db.json` 的 `practices`
2. `practice-db.json` 的 `bindings`
3. 對應章節的 generator 檔，例如 `j1.js`

最後再跑同步：

```powershell
python .\program-db\scripts\sync_practice_bridge.py
```

如果刪掉的是某個集合中的 subtype，還要檢查：

- 這個 subtype 有沒有被其他 mixed 類引用
- 這個 generatorKey 有沒有被其他 practice 共用

---

## 5. 排序是怎麼決定的

章節內小類的排序，不是看 `j1.js` 內的先後，也不是看 `practices` 出現的順序。

真正決定順序的是：

- `practice-db.json` 中 `bindings.order`

也就是說：

- `practices` 決定「這個小類是什麼」
- `bindings` 決定「它顯不顯示、掛在哪、排第幾」

前端最後會依這個順序顯示到 `byChapter`。

---

## 6. 新增時最容易犯的錯

## 6-1. 把「附加」做成「取代」

這是最危險也最常出事的錯。

如果原本章節已有：

- A
- B
- C

你要新增：

- D
- E

正確作法應該是：

- A
- B
- C
- D
- E

不是把章節綁定整個重寫成只剩：

- D
- E

也就是說，新增小類時要先保留原有 enabled bindings，再把新項目附加在後面。

---

## 6-2. 只改 generator，不改 bindings

這樣 generator 雖然存在，但章節頁面可能完全不顯示。

因為前端要不要顯示，主要看 chapter binding，不是只看 generator 有沒有寫。

---

## 6-3. 只改 `formula-practice-assignments.js`

這樣很容易被下次同步蓋掉。

正確來源仍然是：

- `practice-db.json`

---

## 6-4. 以為 generator 內的 `10` 就是最後題數

不是。

目前真正影響最後輸出題數的，主要還是 practice 設定裡的 `questionCount` 與外層裁切邏輯。

所以不要把 generator 內舊的 `buildXxx(10)` 直接當成最終題數依據。

---

## 6-5. 忘了快取

如果資料明明改好了，但前端看起來像沒變，先懷疑：

- script version 沒更新
- `sw.js` 快取沒更新
- 瀏覽器還在吃舊資源

---

## 7. 新增小類的標準流程

建議每次都照這個順序：

1. 先判斷這題是否真的適合做成無限練習  
   要能換參數後仍是同一計算方法，不只是換順序

2. 在對應 generator 檔新增出題邏輯  
   例如 `data/practice-generators/j1.js`

3. 在 `practice-db.json` 的 `practices` 新增小類資料

4. 在 `practice-db.json` 的 `bindings` 掛到章節  
   注意是附加，不是覆蓋

5. 跑同步腳本

6. 必要時更新前端版本號與 `sw.js`

7. 實際檢查 `practice-bank` 與 `practice-mobile`

---

## 8. 刪除小類的標準流程

## 8-1. 暫時下架

1. 把 binding 設成 `enabled: false`
2. 跑同步腳本
3. 檢查前端是否已隱藏

## 8-2. 徹底刪除

1. 刪 `practice-db.json` 的 practice 定義
2. 刪 `practice-db.json` 的 binding
3. 刪對應 generator 與引用
4. 跑同步腳本
5. 檢查前端與 console 是否正常

---

## 9. 實務判斷：哪些題目不適合做成小類

下面這些情況通常不適合直接做成一個新的無限練習小類：

1. 只有大方向敘述，沒有穩定題型
2. 換句話說後其實解法分歧很大
3. 題目只靠重新排序，沒有真正參數變化
4. 只能出很少變化，重複率過高
5. 實際上只是已有小類的同型題

這種情況比較適合：

1. 合併進既有小類
2. 當成同一小類的另一個 subtype
3. 直接不做

---

## 10. 快速檢查清單

### 新增前

- 這題是否真的能做成無限練習
- 是否與既有小類重複
- 是否應該合併進既有小類

### 新增後

- generator 有沒有寫
- practice 定義有沒有寫
- binding 有沒有掛到正確章節
- `enabled` 是否為 `true`
- `order` 是否正確
- 是否有跑同步
- 前端是否已讀到新資料

### 刪除後

- 是隱藏還是徹底刪除
- 是否連集合引用一起清掉
- 是否有跑同步
- 前端章節顯示是否正常

---

## 11. 一句話記住這套規則

可以把目前架構記成這一句：

> `j1.js` 決定怎麼出題，`practice-db.json` 決定這個小類是什麼、掛在哪裡、排第幾，`formula-practice-assignments.js` 只是同步後給前端讀的橋接結果。

