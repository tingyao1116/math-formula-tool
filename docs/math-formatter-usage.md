# 共用 Formatter 使用方式

本文件是 `docs/math-display-rules.md` 的實作補充，示範在題型函式中如何使用共用 formatter。

## 位置（修正：不是集中在 formula-practice.js）
- 實際位置：各自複製在 `data/practice-generators/*.js` 每個檔案內部（不是集中共用的單一檔案，`data/formula-practice.js` 現在是主控／包裝層，不含這些函式）。
- 已知有這些函式副本的檔案（不是每個檔案都全部具備，詳見 `docs/math-display-rules.md` 第 9 節）：
  - `gcdInt(a, b)`：`e4.js`、`e5.js`、`j1.js`–`j5.js`、`s1.js`–`s4.js`
  - `reduceFraction(numerator, denominator)` / `formatFraction(numerator, denominator)`：`e5.js`、`j1.js`–`j5.js`、`s1.js`–`s4.js`
  - `simplifyRadical(n)` / `formatRadical(n)`：`j3.js`、`j4.js`、`s1.js`–`s3.js`
  - `formatCoeffTerm(coeff, variable, power)`：`j2.js`、`j3.js`
  - `formatSubtraction(left, right)`：`j3.js`
- `e6.js`、`j6.js`、`s5.js` 目前沒有這些函式，若在這些檔案新增題型需要用到，先從對應章節（例如 `j3.js`）複製一份進來。

## 實作原則
1. 題型函式只負責「數學邏輯」。
2. 顯示字串一律交給 formatter。
3. 不在題型內重複寫 `gcd`、分數約分、根式化簡。

## 範例 1：分數最簡
```js
const sumText = formatFraction(-b, a);
const prodText = formatFraction(c, a);
answers.push(`\\(\\alpha+\\beta=${sumText}\\)，\\(\\alpha\\beta=${prodText}\\)。`);
```

## 範例 2：根式最簡
```js
const value = b * b - a * a;
answers.push(`\\(${formatRadical(value)}\\)`);
```

## 範例 3：避免 `x--y`
```js
const expr = formatSubtraction("x", -3); // x-(-3)
```

## 範例 4：係數 1 省略
```js
formatCoeffTerm(1, "x", 1);   // x
formatCoeffTerm(-1, "x", 2);  // -x^2
formatCoeffTerm(3, "x", 2);   // 3x^2
```

## 第二輪套用紀錄（目前）
- 已套用：
  - `buildJ323TripleExpandSet`（根式最簡）
  - `buildJ341FactorFormulaSolveSet`（分數最簡）
  - `buildJ342CompleteSquareTermSet`（共用分數 formatter）
  - `buildJ342CompletingSquareSolveSet`（根式最簡）
  - `buildJ342RootsSumProductDirectSet`（分數最簡）
  - `buildJ342ExpressionBySumProductSet`（分數最簡）

- 待續手動套用：
  - `j3-4-2` 其他根式/分數輸出
  - `j3-3-3`、`j3-3-1` 相關題型的符號一致性
