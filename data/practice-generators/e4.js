(() => {
  const store = window.formulaPracticeStore;
  if (!store || typeof store.registerConfigs !== "function") {
    console.warn("formulaPracticeStore.registerConfigs is required before loading e4 practice generators");
    return;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(list) {
    return list[randInt(0, list.length - 1)];
  }

  function shuffle(list) {
    const output = list.slice();
    for (let i = output.length - 1; i > 0; i -= 1) {
      const j = randInt(0, i);
      [output[i], output[j]] = [output[j], output[i]];
    }
    return output;
  }

  function modPositive(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function createResult(entries, intro = "") {
    return {
      intro,
      questions: entries.map((entry) => entry.question),
      summaryAnswers: entries.map((entry) => `簡答：${entry.summary}`),
      answers: entries.map((entry) => `詳解：${entry.detail}`),
    };
  }

  function takeGenerated(generator, count) {
    const result = generator(count);
    const questions = Array.isArray(result.questions) ? result.questions : [];
    const summaryAnswers = Array.isArray(result.summaryAnswers) ? result.summaryAnswers : [];
    const answers = Array.isArray(result.answers) ? result.answers : [];
    return questions.map((question, index) => ({
      question,
      summary: String(summaryAnswers[index] || "").replace(/^簡答：/, ""),
      detail: String(answers[index] || "").replace(/^詳解：/, ""),
    }));
  }

  function buildMultiplyStandardSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const multiplicand = randInt(0, 1) ? randInt(215, 998) : randInt(1200, 4980);
      const multiplier = randInt(123, 896);
      const hundreds = Math.floor(multiplier / 100);
      const tens = Math.floor((multiplier % 100) / 10);
      const ones = multiplier % 10;
      const product = multiplicand * multiplier;
      entries.push({
        question: `用直式計算：${multiplicand} × ${multiplier} = （　）。`,
        summary: `${product}`,
        detail: `${multiplier} = ${hundreds} × 100 + ${tens} × 10 + ${ones}。${multiplicand} × ${ones} = ${multiplicand * ones}，${multiplicand} × ${tens * 10} = ${multiplicand * tens * 10}，${multiplicand} × ${hundreds * 100} = ${multiplicand * hundreds * 100}，相加得 ${product}。`,
      });
    }
    return createResult(entries, "三、四位數乘以三位數：注意每一層部分積要和正確位值對齊。");
  }

  function buildMultiplyZeroEndingSet(count = 3) {
    const entries = [];
    const multipliers = [20, 30, 40, 50, 60, 70, 80, 90, 200, 300, 400, 500, 600, 700, 800, 900];
    while (entries.length < count) {
      const a = pick([randInt(12, 98) * 100, randInt(100, 980) * 10, randInt(2, 9) * 1000]);
      const b = pick(multipliers);
      const aCore = Number(String(a).replace(/0+$/, ""));
      const bCore = Number(String(b).replace(/0+$/, ""));
      const zeroCount = (String(a).match(/0+$/)?.[0].length || 0) + (String(b).match(/0+$/)?.[0].length || 0);
      const coreProduct = aCore * bCore;
      const product = a * b;
      entries.push({
        question: `先用末位 0 之前的數字相乘，再補 0：${a} × ${b} = （　）。`,
        summary: `${product}`,
        detail: `先算 ${aCore} × ${bCore} = ${coreProduct}，兩個乘數末尾共有 ${zeroCount} 個 0，所以在 ${coreProduct} 後面補 ${zeroCount} 個 0，得到 ${product}。`,
      });
    }
    return createResult(entries, "末幾位為 0 的乘法：先忽略末尾的 0 計算，再補回相同個數的 0。");
  }

  function buildDivideStandardSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const divisor = randInt(112, 485);
      const quotient = randInt(2, 35);
      const hasRemainder = Math.random() < 0.55;
      const remainder = hasRemainder ? randInt(1, divisor - 1) : 0;
      const dividend = divisor * quotient + remainder;
      entries.push({
        question: `用直式計算：${dividend} ÷ ${divisor} = （　）。`,
        summary: remainder ? `${quotient} 餘 ${remainder}` : `${quotient}`,
        detail: `先估商 ${quotient}，${divisor} × ${quotient} = ${divisor * quotient}。${dividend} - ${divisor * quotient} = ${remainder}，${remainder < divisor ? "餘數小於除數，答案正確" : "餘數還要再調整"}，所以商是 ${quotient}${remainder ? `，餘數是 ${remainder}` : ""}。`,
      });
    }
    return createResult(entries, "三、四位數除以三位數：估商後要檢查「除數 × 商 + 餘數」是否等於被除數。");
  }

  function buildDivideZeroEndingSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const divisor = pick([200, 300, 400, 500, 600, 700, 800, 900]);
      const quotient = randInt(2, 160);
      const remainder = Math.random() < 0.45 ? randInt(1, divisor / 100 - 1) * 100 : 0;
      const dividend = divisor * quotient + remainder;
      const simplifiedDividend = dividend / 100;
      const simplifiedDivisor = divisor / 100;
      entries.push({
        question: `用簡便方法計算：${dividend} ÷ ${divisor} = （　）。`,
        summary: remainder ? `${quotient} 餘 ${remainder}` : `${quotient}`,
        detail: `被除數和除數末尾都有 2 個 0，可先同時刪掉 2 個 0，變成 ${simplifiedDividend} ÷ ${simplifiedDivisor}。商是 ${quotient}${remainder ? `，簡化後餘 ${remainder / 100}，要補回 2 個 0，所以原式餘 ${remainder}` : ""}。`,
      });
    }
    return createResult(entries, "末幾位為 0 的除法：被除數與除數可同時刪掉相同個數的 0，但有餘數時要補回刪掉的 0。");
  }

  function buildWordProblemSet(count = 3) {
    const factories = [
      () => {
        const item = pick(["鳳梨酥", "筆記本", "運動水壺", "故事書"]);
        const price = randInt(18, 95) * 10;
        const quantity = randInt(120, 980);
        const total = price * quantity;
        return {
          question: `一個${item}售價 ${price} 元，共賣出 ${quantity} 個，共收入幾元？`,
          summary: `${total} 元`,
          detail: `單價 × 數量 = 總收入，${price} × ${quantity} = ${total}，所以共收入 ${total} 元。`,
        };
      },
      () => {
        const item = pick(["紅茶", "牛奶", "礦泉水", "果汁"]);
        const perDay = randInt(125, 980);
        const days = pick([30, 50, 80, 120, 180, 365]);
        const total = perDay * days;
        return {
          question: `店裡每天準備 ${perDay} 杯${item}，連續 ${days} 天共準備多少杯？`,
          summary: `${total} 杯`,
          detail: `每天數量固定，用乘法計算：${perDay} × ${days} = ${total}，所以共準備 ${total} 杯。`,
        };
      },
      () => {
        const item = pick(["彈珠", "積木", "糖果", "貼紙"]);
        const perBox = randInt(2, 9) * 100;
        const boxes = randInt(5, 80);
        const leftover = randInt(0, perBox - 1);
        const total = perBox * boxes + leftover;
        return {
          question: `有 ${total} 個${item}，每 ${perBox} 個裝一盒，最多可以裝幾盒？還剩幾個？`,
          summary: `${boxes} 盒，剩 ${leftover} 個`,
          detail: `${total} ÷ ${perBox} = ${boxes} 餘 ${leftover}，所以最多可裝 ${boxes} 盒，還剩 ${leftover} 個。`,
        };
      },
      () => {
        const item = pick(["鉛筆盒", "玩具車", "模型", "餐盒"]);
        const price = randInt(12, 98) * 10;
        const budget = price * randInt(3, 25) + randInt(0, price - 1);
        const count = Math.floor(budget / price);
        const left = budget % price;
        return {
          question: `一個${item} ${price} 元，帶了 ${budget} 元，最多可買幾個？剩幾元？`,
          summary: `${count} 個，剩 ${left} 元`,
          detail: `${budget} ÷ ${price} = ${count} 餘 ${left}，所以最多可買 ${count} 個，剩 ${left} 元。`,
        };
      },
      () => {
        const total = randInt(60, 260) * 100;
        const people = randInt(25, 95);
        const each = Math.floor(total / people);
        const left = total % people;
        return {
          question: `學校有 ${total} 張圖畫紙，要平均分給 ${people} 位學生，每人分到幾張？還剩幾張？`,
          summary: `${each} 張，剩 ${left} 張`,
          detail: `${total} ÷ ${people} = ${each} 餘 ${left}，所以每人分到 ${each} 張，還剩 ${left} 張。`,
        };
      },
    ];
    return createResult(Array.from({ length: count }, () => pick(factories)()), "生活應用：先判斷要用乘法求總量，還是用除法求可分成幾組與剩多少。");
  }

  function buildMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "綜合練習：每題都會換數字，請先判斷是乘法、除法，或需要處理末尾 0。");
  }

  const estimatePlaces = [
    { label: "十位", unit: 10 },
    { label: "百位", unit: 100 },
    { label: "千位", unit: 1000 },
    { label: "萬位", unit: 10000 },
  ];

  function formatNumber(value) {
    return Number(value).toLocaleString("zh-Hant");
  }

  function roundUpTo(value, unit) {
    return Math.ceil(value / unit) * unit;
  }

  function roundDownTo(value, unit) {
    return Math.floor(value / unit) * unit;
  }

  function roundNearestTo(value, unit) {
    return Math.floor((value + unit / 2) / unit) * unit;
  }

  function getIntegerRangeForNearest(target, unit) {
    return {
      min: target - unit / 2,
      max: target + unit / 2 - 1,
    };
  }

  function buildExactApproxJudgeSet(count = 3) {
    const exactTemplates = [
      () => `小英班上有 ${randInt(18, 35)} 位學生。`,
      () => `媽媽這個月的電費是 ${randInt(800, 3600)} 元。`,
      () => `一盒鉛筆有 ${randInt(8, 24)} 枝。`,
      () => `這場電影長 ${randInt(90, 150)} 分鐘。`,
    ];
    const approxTemplates = [
      () => `全世界人口大約有 ${randInt(70, 90)} 億人。`,
      () => `玉山高度大約是 ${randInt(3900, 4000)} 公尺。`,
      () => `昨天到遊樂園的人數大約有 ${randInt(12, 45)} 萬人。`,
      () => `這座橋長約 ${randInt(1200, 8800)} 公尺。`,
    ];
    const entries = [];
    while (entries.length < count) {
      const askApprox = randInt(0, 1) === 0;
      const sentence = pick(askApprox ? approxTemplates : exactTemplates)();
      entries.push({
        question: `判斷下面這句話使用的是「概數」還是「精確數」：${sentence}`,
        summary: askApprox ? "概數" : "精確數",
        detail: askApprox
          ? `句子中使用「大約、約」描述接近的數量，不要求完全正確，所以是概數。`
          : `句子描述可以直接計數或實際記錄的數量，所以是精確數。`,
      });
    }
    return createResult(entries, "概數常用於估計與描述大約數量；精確數用於需要確定數量的情境。");
  }

  function buildCeilEstimateSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const capacity = pick([50, 100, 200, 500]);
        const amount = randInt(12, 980) * 10 + randInt(1, capacity - 1);
        const needed = Math.ceil(amount / capacity);
        return {
          question: `一桶有 ${formatNumber(amount)} 毫升飲料，分裝到每個容量 ${capacity} 毫升的杯子，至少需要幾個杯子才裝得完？`,
          summary: `${needed} 個`,
          detail: `${formatNumber(amount)} ÷ ${capacity} = ${Math.floor(amount / capacity)} 餘 ${amount % capacity}，剩下的飲料也需要 1 個杯子，所以至少需要 ${needed} 個。這是無條件進入法。`,
        };
      },
      () => {
        const price = randInt(1200, 98000);
        const unit = pick([100, 1000]);
        const bills = Math.ceil(price / unit);
        return {
          question: `一件商品 ${formatNumber(price)} 元，若只用${unit === 100 ? "百元" : "千元"}鈔票付款，至少要付幾張？`,
          summary: `${bills} 張`,
          detail: `${formatNumber(price)} 元不是 ${unit} 的整數倍，必須準備到下一個 ${unit} 元，因此 ${formatNumber(price)} ÷ ${unit} 要無條件進入，至少 ${bills} 張。`,
        };
      },
      () => {
        const total = randInt(63, 999);
        const perPack = pick([10, 12, 20, 25, 50, 100]);
        const packs = Math.ceil(total / perPack);
        return {
          question: `有 ${formatNumber(total)} 張卡片，每 ${perPack} 張裝一袋，至少需要幾袋才裝得完？`,
          summary: `${packs} 袋`,
          detail: `${formatNumber(total)} ÷ ${perPack} = ${Math.floor(total / perPack)} 餘 ${total % perPack}，有餘數表示還要多 1 袋，所以至少 ${packs} 袋。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, "無條件進入法：只要剩下的量仍需要一個完整單位，就要往上取概數。");
  }

  function buildFloorEstimateSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const total = randInt(120, 980) * 100 + randInt(1, 99);
        const perBox = pick([100, 200, 500, 1000]);
        const boxes = Math.floor(total / perBox);
        return {
          question: `倉庫有 ${formatNumber(total)} 個零件，每 ${perBox} 個裝一箱，最多可以裝滿幾箱？`,
          summary: `${boxes} 箱`,
          detail: `${formatNumber(total)} ÷ ${perBox} = ${boxes} 餘 ${total % perBox}，題目問「裝滿」幾箱，剩下不足一箱的不算，所以最多 ${boxes} 箱。這是無條件捨去法。`,
        };
      },
      () => {
        const price = randInt(1200, 9900);
        const unit = pick([100, 1000]);
        const sale = Math.floor(price / unit) * unit;
        return {
          question: `一件商品原價 ${formatNumber(price)} 元，特價只算到${unit === 100 ? "百元" : "千元"}，應付多少元？`,
          summary: `${formatNumber(sale)} 元`,
          detail: `特價「只算到${unit === 100 ? "百元" : "千元"}」表示不足 ${unit} 元的部分捨去，${formatNumber(price)} 取到${unit === 100 ? "百位" : "千位"}為 ${formatNumber(sale)}。`,
        };
      },
      () => {
        const ribbon = randInt(1200, 9000);
        const each = pick([100, 200, 300, 500]);
        const count = Math.floor(ribbon / each);
        return {
          question: `一條緞帶長 ${formatNumber(ribbon)} 公分，每 ${each} 公分剪成一段，最多可以剪成幾段完整緞帶？`,
          summary: `${count} 段`,
          detail: `${formatNumber(ribbon)} ÷ ${each} = ${count} 餘 ${ribbon % each}，題目要完整段數，剩下不足一段要捨去，所以最多 ${count} 段。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, "無條件捨去法：只計算完整單位，剩下不足一個單位的部分不列入答案。");
  }

  function buildRoundNearestReverseSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const place = pick(estimatePlaces);
        const value = randInt(place.unit * 2, place.unit * 98) + randInt(0, place.unit - 1);
        const rounded = roundNearestTo(value, place.unit);
        return {
          question: `用四捨五入法將 ${formatNumber(value)} 取概數到${place.label}，結果是多少？`,
          summary: `${formatNumber(rounded)}`,
          detail: `看${place.label}的下一位，若是 0～4 就捨去，5～9 就進 1。${formatNumber(value)} 取到${place.label}為 ${formatNumber(rounded)}。`,
        };
      },
      () => {
        const place = pick(estimatePlaces.slice(1));
        const target = randInt(2, 90) * place.unit;
        const range = getIntegerRangeForNearest(target, place.unit);
        return {
          question: `某數用四捨五入法取概數到${place.label}是 ${formatNumber(target)}，原數可能從幾到幾？`,
          summary: `${formatNumber(range.min)}～${formatNumber(range.max)}`,
          detail: `取到${place.label}時，最小值是 ${formatNumber(target)} - ${formatNumber(place.unit / 2)} = ${formatNumber(range.min)}；最大值是下一段進位前的 ${formatNumber(range.max)}。`,
        };
      },
      () => {
        const place = pick([{ label: "百位", unit: 100 }, { label: "千位", unit: 1000 }]);
        const target = randInt(10, 95) * place.unit;
        const range = getIntegerRangeForNearest(target, place.unit);
        const candidates = shuffle([
          randInt(range.min, range.max),
          range.min - randInt(1, Math.floor(place.unit / 3)),
          range.max + randInt(1, Math.floor(place.unit / 3)),
        ]);
        return {
          question: `下列哪些數用四捨五入法取概數到${place.label}會得到 ${formatNumber(target)}？（${candidates.map(formatNumber).join("、")}）`,
          summary: candidates.filter((value) => value >= range.min && value <= range.max).map(formatNumber).join("、"),
          detail: `能取成 ${formatNumber(target)} 的原數範圍是 ${formatNumber(range.min)}～${formatNumber(range.max)}，所以只選落在這個範圍內的數。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, "四捨五入法：先看指定位數的下一位；反推時要找能取成同一個概數的整段範圍。");
  }

  function buildEstimateApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const a = randInt(1000, 98000);
        const b = randInt(1000, 98000);
        const unit = pick([100, 1000, 10000]);
        const result = roundNearestTo(a, unit) + roundNearestTo(b, unit);
        return {
          question: `先將 ${formatNumber(a)} 和 ${formatNumber(b)} 四捨五入到${pick(estimatePlaces.filter((p) => p.unit === unit)).label}，再估算總和約是多少？`,
          summary: `約 ${formatNumber(result)}`,
          detail: `${formatNumber(a)} 約 ${formatNumber(roundNearestTo(a, unit))}，${formatNumber(b)} 約 ${formatNumber(roundNearestTo(b, unit))}，相加約 ${formatNumber(result)}。`,
        };
      },
      () => {
        const a = randInt(20000, 980000);
        const b = randInt(10000, a - 1000);
        const unit = pick([1000, 10000]);
        const result = roundNearestTo(a, unit) - roundNearestTo(b, unit);
        return {
          question: `先取概數到${unit === 1000 ? "千位" : "萬位"}，估算 ${formatNumber(a)} 比 ${formatNumber(b)} 大約多多少？`,
          summary: `約 ${formatNumber(result)}`,
          detail: `${formatNumber(a)} 約 ${formatNumber(roundNearestTo(a, unit))}，${formatNumber(b)} 約 ${formatNumber(roundNearestTo(b, unit))}，相減約 ${formatNumber(result)}。`,
        };
      },
      () => {
        const price = randInt(120, 9800);
        const countItems = randInt(3, 80);
        const unit = price >= 1000 ? 1000 : 100;
        const result = roundNearestTo(price, unit) * countItems;
        return {
          question: `每個商品 ${formatNumber(price)} 元，買 ${countItems} 個，先把單價取概數再估算約要多少元？`,
          summary: `約 ${formatNumber(result)} 元`,
          detail: `${formatNumber(price)} 元約 ${formatNumber(roundNearestTo(price, unit))} 元，${formatNumber(roundNearestTo(price, unit))} × ${countItems} = ${formatNumber(result)}，所以約 ${formatNumber(result)} 元。`,
        };
      },
      () => {
        const total = randInt(1200, 98000);
        const divisor = randInt(3, 80);
        const unit = total >= 10000 ? 10000 : 1000;
        const estimate = Math.round(roundNearestTo(total, unit) / divisor);
        return {
          question: `把 ${formatNumber(total)} 先取概數到${unit === 10000 ? "萬位" : "千位"}，再估算平均分成 ${divisor} 份，每份大約是多少？`,
          summary: `約 ${formatNumber(estimate)}`,
          detail: `${formatNumber(total)} 約 ${formatNumber(roundNearestTo(total, unit))}，再用 ${formatNumber(roundNearestTo(total, unit))} ÷ ${divisor} 估算，每份約 ${formatNumber(estimate)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, "估算應用：先依題意選擇合適的取概數方法與位值，再進行加、減、乘、除。");
  }

  function buildEstimateMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "概數綜合練習：先判斷情境需要精確數、進入、捨去、四捨五入或估算。");
  }

  function formatDecimalByScale(value, scale) {
    const fixed = (value / scale).toFixed(scale === 100 ? 2 : 1);
    return fixed.replace(/\.0$/, "").replace(/(\.\d)0$/, "$1");
  }

  function decimalFactor(digits = 1, min = 1, max = 99) {
    const scale = digits === 2 ? 100 : 10;
    const raw = randInt(min, max);
    return {
      raw,
      scale,
      text: formatDecimalByScale(raw, scale),
      digits,
    };
  }

  function decimalProductText(rawDecimal, scale, integer) {
    return formatDecimalByScale(rawDecimal * integer, scale);
  }

  function decimalAddText(leftRaw, rightRaw, scale) {
    return formatDecimalByScale(leftRaw + rightRaw, scale);
  }

  function decimalSubText(leftRaw, rightRaw, scale) {
    return formatDecimalByScale(leftRaw - rightRaw, scale);
  }

  function buildDecimalMultiplyBasicSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const digits = randInt(0, 1) === 0 ? 1 : 2;
      const decimal = decimalFactor(digits, digits === 1 ? 2 : 4, digits === 1 ? 150 : 2500);
      const multiplier = randInt(2, 45);
      const product = decimalProductText(decimal.raw, decimal.scale, multiplier);
      entries.push({
        question: `用直式計算：${decimal.text} × ${multiplier} = （　）。`,
        summary: `${product}`,
        detail: `先暫時不看小數點，算 ${decimal.raw} × ${multiplier} = ${decimal.raw * multiplier}。原來的被乘數有 ${decimal.digits} 位小數，所以積也從右邊數 ${decimal.digits} 位點上小數點，得到 ${product}。`,
      });
    }
    return createResult(entries, "小數乘整數：先照整數乘法計算，再依被乘數的小數位數點上小數點。");
  }

  function buildDecimalZeroEndingSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const decimal = decimalFactor(randInt(0, 1) === 0 ? 1 : 2, 1, 999);
      const multiplier = pick([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300]);
      const product = decimalProductText(decimal.raw, decimal.scale, multiplier);
      entries.push({
        question: `觀察 10 倍、100 倍的關係，計算：${decimal.text} × ${multiplier} = （　）。`,
        summary: `${product}`,
        detail: `${multiplier} = ${multiplier / 10} × 10。小數乘以 10，數值變成 10 倍；若再乘 ${multiplier / 10}，可得到 ${product}。也可以先算整數 ${decimal.raw} × ${multiplier}，再點回 ${decimal.digits} 位小數。`,
      });
    }
    return createResult(entries, "末位 0 的整數乘法：可利用 10 倍、100 倍的位值變化，也要注意最後的小數點位置。");
  }

  function buildDecimalSingleStepWordSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const length = decimalFactor(2, 35, 250);
        const countItems = randInt(3, 36);
        return {
          question: `每張書桌長 ${length.text} 公尺，把 ${countItems} 張書桌接排成一列，共長幾公尺？`,
          summary: `${decimalProductText(length.raw, length.scale, countItems)} 公尺`,
          detail: `單位量 × 數量 = 總量，${length.text} × ${countItems} = ${decimalProductText(length.raw, length.scale, countItems)}，所以共長 ${decimalProductText(length.raw, length.scale, countItems)} 公尺。`,
        };
      },
      () => {
        const weight = decimalFactor(2, 5, 250);
        const countItems = randInt(4, 80);
        return {
          question: `一個物品重 ${weight.text} 公斤，${countItems} 個共重幾公斤？`,
          summary: `${decimalProductText(weight.raw, weight.scale, countItems)} 公斤`,
          detail: `${weight.text} × ${countItems} = ${decimalProductText(weight.raw, weight.scale, countItems)}，所以共重 ${decimalProductText(weight.raw, weight.scale, countItems)} 公斤。`,
        };
      },
      () => {
        const price = decimalFactor(2, 25, 999);
        const countItems = randInt(3, 120);
        return {
          question: `影印 1 份文件要 ${price.text} 元，影印 ${countItems} 份共要幾元？`,
          summary: `${decimalProductText(price.raw, price.scale, countItems)} 元`,
          detail: `單價 × 數量 = 總價，${price.text} × ${countItems} = ${decimalProductText(price.raw, price.scale, countItems)}，所以共要 ${decimalProductText(price.raw, price.scale, countItems)} 元。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, "小數乘法生活題：先找出單位量，再乘上數量求總量。");
  }

  function buildDecimalTwoStepWordSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const used = decimalFactor(2, 200, 2500);
        const weeks = randInt(2, 8);
        const left = decimalFactor(2, 20, 300);
        const totalRaw = used.raw * weeks + left.raw;
        return {
          question: `餐廳一週用掉 ${used.text} 公斤米，用了 ${weeks} 週後還剩 ${left.text} 公斤，原本有幾公斤？`,
          summary: `${formatDecimalByScale(totalRaw, 100)} 公斤`,
          detail: `先算用掉的量：${used.text} × ${weeks} = ${formatDecimalByScale(used.raw * weeks, 100)}。再加上剩下的 ${left.text}，原本有 ${formatDecimalByScale(totalRaw, 100)} 公斤。`,
        };
      },
      () => {
        const cost = decimalFactor(2, 200, 3000);
        const price = cost.raw + randInt(10, 800);
        const countItems = randInt(5, 80);
        const profit = (price - cost.raw) * countItems;
        return {
          question: `一本作業簿成本 ${cost.text} 元，以 ${formatDecimalByScale(price, 100)} 元賣出，賣 ${countItems} 本可賺幾元？`,
          summary: `${formatDecimalByScale(profit, 100)} 元`,
          detail: `每本賺 ${formatDecimalByScale(price, 100)} - ${cost.text} = ${formatDecimalByScale(price - cost.raw, 100)} 元。賣 ${countItems} 本可賺 ${formatDecimalByScale(price - cost.raw, 100)} × ${countItems} = ${formatDecimalByScale(profit, 100)} 元。`,
        };
      },
      () => {
        const price = decimalFactor(1, 50, 990);
        const countItems = randInt(6, 40);
        const paid = Math.ceil((price.raw * countItems) / 100) * 100;
        const changeRaw = paid * 10 - price.raw * countItems;
        return {
          question: `汽油 1 公升 ${price.text} 元，加 ${countItems} 公升後付 ${paid} 元，找回幾元？`,
          summary: `${formatDecimalByScale(changeRaw, 10)} 元`,
          detail: `油錢是 ${price.text} × ${countItems} = ${formatDecimalByScale(price.raw * countItems, 10)} 元。${paid} - ${formatDecimalByScale(price.raw * countItems, 10)} = ${formatDecimalByScale(changeRaw, 10)}，所以找回 ${formatDecimalByScale(changeRaw, 10)} 元。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, "兩步驟應用題：常見順序是先乘再加、先乘再減，先把每一步代表的意思寫清楚。");
  }

  function buildDecimalConceptSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const start = randInt(0, 9);
        const tenths = randInt(1, 9);
        const value = start * 10 + tenths;
        return {
          question: `在數線上，${start} 和 ${start + 1} 之間平均分成 10 小格，從 ${start} 往右第 ${tenths} 小格表示多少？`,
          summary: `${formatDecimalByScale(value, 10)}`,
          detail: `每一小格是 0.1，從 ${start} 往右 ${tenths} 小格就是 ${start} + ${formatDecimalByScale(tenths, 10)} = ${formatDecimalByScale(value, 10)}。`,
        };
      },
      () => {
        const denominator = pick([10, 100]);
        const numerator = randInt(1, denominator * 3);
        const scale = denominator;
        return {
          question: `${numerator}/${denominator} 用小數表示是多少？`,
          summary: `${formatDecimalByScale(numerator, scale)}`,
          detail: `分母是 ${denominator}，表示把 ${numerator} 個 ${denominator === 10 ? "十分之一" : "百分之一"} 合起來，所以是 ${formatDecimalByScale(numerator, scale)}。`,
        };
      },
      () => {
        const leftRaw = randInt(1, 250);
        const rightRaw = randInt(1, 250);
        const left = formatDecimalByScale(leftRaw, 100);
        const right = formatDecimalByScale(rightRaw, 100);
        const sign = leftRaw > rightRaw ? ">" : leftRaw < rightRaw ? "<" : "=";
        return {
          question: `比較大小：${left} □ ${right}，□ 中應填入 >、< 或 =？`,
          summary: `${sign}`,
          detail: `把兩個數都看成百分位比較：${leftRaw} 個 0.01 和 ${rightRaw} 個 0.01 比較，所以 ${left} ${sign} ${right}。`,
        };
      },
      () => {
        const start = decimalFactor(1, 10, 90);
        const move = decimalFactor(1, 1, 40);
        const goRight = randInt(0, 1) === 0;
        const resultRaw = goRight ? start.raw + move.raw : Math.max(0, start.raw - move.raw);
        return {
          question: `小點從 ${start.text} 的位置往${goRight ? "右" : "左"}移動 ${move.text}，會到什麼位置？`,
          summary: `${formatDecimalByScale(resultRaw, 10)}`,
          detail: `數線上往右是加，往左是減，所以 ${start.text} ${goRight ? "+" : "-"} ${move.text} = ${formatDecimalByScale(resultRaw, 10)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, "小數概念輔助：數線、分數換小數與大小比較，都能幫助學生檢查小數乘法的小數點位置是否合理。");
  }

  function buildDecimalMultiplyMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "小數乘法綜合練習：先判斷小數位數，再決定是單步乘法、兩步驟應用或小數概念題。");
  }

  function buildPatternSequenceSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const pattern = pick([
          ["灰色", "白色", "白色"],
          ["圓形", "方形", "圓形", "三角形"],
          ["星星", "月亮", "太陽"],
          ["紅色", "藍色", "綠色", "藍色"],
        ]);
        const n = randInt(9, 60);
        const answer = pattern[(n - 1) % pattern.length];
        return {
          question: `一排圖案依照「${pattern.join("、")}」重複排列，第 ${n} 個圖案是什麼？`,
          summary: answer,
          detail: `每 ${pattern.length} 個圖案為一組。${n} ÷ ${pattern.length} 的餘數是 ${n % pattern.length}，餘數 0 代表一組的最後一個；所以第 ${n} 個是「${answer}」。`,
        };
      },
      () => {
        const row = randInt(4, 12);
        const col = randInt(4, 12);
        const options = pick([
          ["淺色", "深色"],
          ["圓形", "方形"],
          ["紅色", "黃色"],
        ]);
        const answer = options[(row + col) % 2];
        return {
          question: `棋盤式鋪排中，若第 1 列第 1 格是「${options[0]}」，相鄰上下左右都交替成另一種圖案，則第 ${row} 列第 ${col} 格是什麼？`,
          summary: answer,
          detail: `同一格往右或往下移動 1 格都會換一次圖案。第 ${row} 列第 ${col} 格相當於移動 ${(row - 1) + (col - 1)} 次，${(row - 1) + (col - 1)} 是 ${((row - 1) + (col - 1)) % 2 === 0 ? "偶數" : "奇數"}，所以答案是「${answer}」。`,
        };
      },
      () => {
        const directions = ["上", "右", "下", "左"];
        const start = randInt(0, 3);
        const n = randInt(8, 40);
        const answer = directions[(start + n - 1) % 4];
        return {
          question: `一張箭頭圖卡從「${directions[start]}」開始，每次順時針旋轉 90 度後再排下一張，第 ${n} 張箭頭朝哪個方向？`,
          summary: answer,
          detail: `方向每 4 張循環一次，順序是「上、右、下、左」。從「${directions[start]}」開始數第 ${n} 張，位置為 ${(start + n - 1) % 4 + 1}，所以箭頭朝「${answer}」。`,
        };
      },
      () => {
        const pattern = pick([
          ["A", "B", "C"],
          ["紅", "藍", "藍", "黃"],
          ["○", "□", "△", "□"],
        ]);
        const target = pick(pattern);
        const total = randInt(24, 72);
        const fullGroups = Math.floor(total / pattern.length);
        const remainder = total % pattern.length;
        const perGroup = pattern.filter((item) => item === target).length;
        const extra = pattern.slice(0, remainder).filter((item) => item === target).length;
        const answer = fullGroups * perGroup + extra;
        return {
          question: `圖案依照「${pattern.join("、")}」重複排列，前 ${total} 個圖案中共有幾個「${target}」？`,
          summary: `${answer} 個`,
          detail: `每 ${pattern.length} 個為一組，每組有 ${perGroup} 個「${target}」。${total} ÷ ${pattern.length} = ${fullGroups} 餘 ${remainder}，前 ${remainder} 個中另有 ${extra} 個「${target}」，所以共有 ${fullGroups} × ${perGroup} + ${extra} = ${answer} 個。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "圖形週期與鋪排預測：把圖案轉成一組固定循環，再用餘數判斷位置或數量。");
  }

  function buildNumberTablePatternSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const moves = [
          { name: "正下方", delta: 10 },
          { name: "正上方", delta: -10 },
          { name: "右邊一格", delta: 1 },
          { name: "左邊一格", delta: -1 },
          { name: "右下方斜角", delta: 11 },
          { name: "左下方斜角", delta: 9 },
        ];
        const move = pick(moves);
        const n = randInt(22, 78);
        const answer = n + move.delta;
        return {
          question: `在百數表中，已知某格是 ${n}，它的${move.name}是幾？`,
          summary: `${answer}`,
          detail: `百數表往右加 1，往下加 10。${move.name}的變化量是 ${move.delta > 0 ? `+${move.delta}` : move.delta}，所以 ${n} ${move.delta > 0 ? "+" : "-"} ${Math.abs(move.delta)} = ${answer}。`,
        };
      },
      () => {
        const start = randInt(2, 6) * 10 + randInt(1, 6);
        const blanks = [
          { label: "右下角", delta: 11 },
          { label: "左下角", delta: 9 },
          { label: "下方第二格", delta: 20 },
          { label: "右邊第三格", delta: 3 },
        ];
        const blank = pick(blanks);
        const answer = start + blank.delta;
        return {
          question: `百數表片段中，左上角的數是 ${start}，若每往右一格加 1、每往下一格加 10，則${blank.label}的數是幾？`,
          summary: `${answer}`,
          detail: `${blank.label}相對於左上角增加 ${blank.delta}，所以 ${start} + ${blank.delta} = ${answer}。`,
        };
      },
      () => {
        const divisor = pick([3, 4, 5, 6]);
        const remainder = randInt(0, divisor - 1);
        const first = randInt(2, 8) * divisor + remainder;
        const numbers = Array.from({ length: 5 }, (_, index) => first + divisor * index);
        return {
          question: `一列數字是 ${numbers.join("、")}。觀察規律，這一列的數除以 ${divisor} 時，餘數都是幾？`,
          summary: `${remainder}`,
          detail: `相鄰兩數都相差 ${divisor}，所以除以 ${divisor} 的餘數相同。以 ${numbers[0]} 來看，${numbers[0]} ÷ ${divisor} 的餘數是 ${remainder}，因此整列餘數都是 ${remainder}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "數字表格與百數表規律：掌握左右差 1、上下差 10、斜角差 9 或 11。");
  }

  function buildCalendarPatternSet(count = 3) {
    const entries = [];
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const factories = [
      () => {
        const startDay = randInt(0, 6);
        const date = randInt(1, 20);
        const later = date + randInt(1, 12);
        const answer = weekdays[(startDay + later - date) % 7];
        return {
          question: `若本月 ${date} 日是${weekdays[startDay]}，則本月 ${later} 日是星期幾？`,
          summary: answer,
          detail: `${later} 日比 ${date} 日晚 ${later - date} 天。星期每 7 天循環，${startDay} + ${later - date} 對 7 取餘數後是 ${weekdays.indexOf(answer)}，所以是${answer}。`,
        };
      },
      () => {
        const date = randInt(1, 21);
        const weeks = randInt(1, 4);
        const answer = date + weeks * 7;
        return {
          question: `某月 ${date} 日是星期四，往後第 ${weeks} 個星期四是幾日？`,
          summary: `${answer} 日`,
          detail: `同一個星期幾每隔 7 天出現一次。往後 ${weeks} 個星期四就是加 ${weeks} × 7 = ${weeks * 7} 天，所以是 ${date} + ${weeks * 7} = ${answer} 日。`,
        };
      },
      () => {
        const topLeft = randInt(1, 20);
        const sum = topLeft + (topLeft + 1) + (topLeft + 7) + (topLeft + 8);
        return {
          question: `月曆中圈出一個 2 × 2 的方框，左上角日期是 ${topLeft}，這四個日期的和是多少？`,
          summary: `${sum}`,
          detail: `2 × 2 方框的四格是 ${topLeft}、${topLeft + 1}、${topLeft + 7}、${topLeft + 8}，相加得到 ${sum}。`,
        };
      },
      () => {
        const firstDay = randInt(0, 6);
        const monthDays = pick([28, 29, 30, 31]);
        let lastSunday = monthDays;
        while ((firstDay + lastSunday - 1) % 7 !== 0) {
          lastSunday -= 1;
        }
        return {
          question: `某月有 ${monthDays} 天，且 1 日是${weekdays[firstDay]}，這個月最後一個星期日是幾日？`,
          summary: `${lastSunday} 日`,
          detail: `日期每增加 1 天，星期也往後 1 格。從月底 ${monthDays} 日往前找，第一個符合星期日的日期是 ${lastSunday} 日。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "月曆日期規律：同一星期幾相差 7 天，跨日期推算時要用餘數思考。");
  }

  function buildParityDigitSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const operations = [
          { symbol: "+", rule: (a, b) => (a + b) % 2 },
          { symbol: "-", rule: (a, b) => modPositive(a - b, 2) },
          { symbol: "×", rule: (a, b) => (a * b) % 2 },
        ];
        const op = pick(operations);
        const a = randInt(1000, 9999);
        const b = randInt(100, 9999);
        const parity = op.rule(a, b) === 0 ? "偶數" : "奇數";
        return {
          question: `不用精算，判斷 ${a} ${op.symbol} ${b} 的結果是奇數還是偶數？`,
          summary: parity,
          detail: `${a} 是${a % 2 === 0 ? "偶數" : "奇數"}，${b} 是${b % 2 === 0 ? "偶數" : "奇數"}。依奇偶運算規律，結果是${parity}。`,
        };
      },
      () => {
        const digits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 5);
        const wantOdd = Math.random() < 0.5;
        const allowedLast = digits.filter((digit) => (wantOdd ? digit % 2 === 1 : digit % 2 === 0));
        if (allowedLast.length === 0) {
          return factories[0]();
        }
        const last = Math.min(...allowedLast);
        const front = digits.filter((digit) => digit !== last).sort((a, b) => b - a);
        if (front[0] === 0) {
          return factories[0]();
        }
        const answer = Number([...front, last].join(""));
        return {
          question: `用數字卡 ${digits.join("、")} 各一次，排出最大的五位${wantOdd ? "奇數" : "偶數"}是多少？`,
          summary: `${answer}`,
          detail: `${wantOdd ? "奇數" : "偶數"}的個位數必須是${wantOdd ? "奇數" : "偶數"}。為了讓數最大，前面位數盡量由大到小排列，個位放符合條件且盡量小的 ${last}，所以最大數是 ${answer}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "奇偶運算與數字卡：先看個位數判斷奇偶，再用位值大小安排數字卡。");
  }

  function buildSeatNumberPatternSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const n = randInt(12, 80);
        const pattern = ["靠窗", "走道", "走道", "靠窗"];
        const answer = pattern[(n - 1) % 4];
        return {
          question: `火車座位依「1 號靠窗、2 號走道、3 號走道、4 號靠窗」循環，${n} 號座位是靠窗還是走道？`,
          summary: answer,
          detail: `每 4 個座位循環一次。${n} ÷ 4 的餘數是 ${n % 4}，對應到「${answer}」，所以 ${n} 號是${answer}。`,
        };
      },
      () => {
        const seatsPerRow = pick([5, 6, 7, 8]);
        const seat = randInt(seatsPerRow * 3 + 1, seatsPerRow * 12);
        const row = Math.ceil(seat / seatsPerRow);
        const position = modPositive(seat - 1, seatsPerRow) + 1;
        return {
          question: `電影院每排有 ${seatsPerRow} 個座位，座位從第 1 排第 1 號依序編號，${seat} 號在第幾排第幾個座位？`,
          summary: `第 ${row} 排第 ${position} 個`,
          detail: `${seat} ÷ ${seatsPerRow} = ${Math.floor((seat - 1) / seatsPerRow)} 餘 ${position}，所以在第 ${row} 排第 ${position} 個座位。`,
        };
      },
      () => {
        const number = randInt(15, 260);
        const side = number % 2 === 1 ? "左邊" : "右邊";
        return {
          question: `某條路的門牌規律是左邊單號、右邊雙號，${number} 號在馬路的哪一邊？`,
          summary: side,
          detail: `${number} 是${number % 2 === 1 ? "單數" : "雙數"}，單號在左邊、雙號在右邊，所以 ${number} 號在${side}。`,
        };
      },
      () => {
        const start = pick([1, 2, 3, 4]);
        const step = pick([3, 4, 5]);
        const number = start + step * randInt(6, 25);
        const isInPattern = Math.random() < 0.65;
        const query = isInPattern ? number : number + randInt(1, step - 1);
        const answer = (query - start) % step === 0 ? "是" : "不是";
        return {
          question: `遊覽車座位編號 ${start}、${start + step}、${start + step * 2}、${start + step * 3}、…… 都是靠窗座位，${query} 號是靠窗座位嗎？`,
          summary: answer,
          detail: `靠窗座位每次增加 ${step}。檢查 ${query} - ${start} = ${query - start}，${query - start} ${answer === "是" ? "可以" : "不可以"}被 ${step} 整除，所以答案是「${answer}」。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "座位門牌與週期編號：先找出循環長度或單雙號規律，再判斷指定編號的位置。");
  }

  function buildQuantityPatternMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "數量規律綜合練習：把題目轉成週期、餘數、加減規律或奇偶規律來判斷。");
  }

  function gcdInt(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      [x, y] = [y, x % y];
    }
    return x || 1;
  }

  function fractionText(numerator, denominator) {
    return `\\frac{${numerator}}{${denominator}}`;
  }

  function simplifyFraction(numerator, denominator) {
    const divisor = gcdInt(numerator, denominator);
    return [numerator / divisor, denominator / divisor];
  }

  function mixedFractionText(numerator, denominator) {
    const whole = Math.floor(numerator / denominator);
    const remainder = numerator % denominator;
    if (remainder === 0) {
      return `${whole}`;
    }
    const [simpleNumerator, simpleDenominator] = simplifyFraction(remainder, denominator);
    return whole > 0 ? `${whole} ${fractionText(simpleNumerator, simpleDenominator)}` : fractionText(simpleNumerator, simpleDenominator);
  }

  function decimalText(value) {
    return Number(value.toFixed(2)).toString();
  }

  function compareSymbol(leftNumerator, leftDenominator, rightNumerator, rightDenominator) {
    const left = leftNumerator * rightDenominator;
    const right = rightNumerator * leftDenominator;
    return left > right ? ">" : left < right ? "<" : "=";
  }

  function buildEquivalentIntegerFractionSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const whole = randInt(1, 5);
        const denominator = randInt(2, 12);
        const numerator = whole * denominator;
        return {
          question: `填入空格：${whole} = （　）/${denominator}，空格是多少？`,
          summary: `${numerator}`,
          detail: `整數 ${whole} 表示 ${whole} 個 1。把每個 1 分成 ${denominator} 等分，共有 ${whole} × ${denominator} = ${numerator} 等分，所以 ${whole} = ${fractionText(numerator, denominator)}。`,
        };
      },
      () => {
        const whole = randInt(1, 5);
        const denominator = randInt(2, 10);
        const numerator = whole * denominator;
        return {
          question: `${fractionText(numerator, denominator)} 等於哪一個整數？`,
          summary: `${whole}`,
          detail: `${numerator} ÷ ${denominator} = ${whole}，所以 ${fractionText(numerator, denominator)} = ${whole}。`,
        };
      },
      () => {
        const denominator = randInt(2, 12);
        return {
          question: `如果 1 個正方形平分成 ${denominator} 份，要塗滿 1 個正方形，需要塗幾份？也就是 1 = （　）/${denominator}。`,
          summary: `${denominator} 份`,
          detail: `整個正方形被分成 ${denominator} 份，全部塗滿就是 ${denominator} 份，所以 1 = ${fractionText(denominator, denominator)}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "與整數相等的等值分數：分子是分母的幾倍，就等於幾個 1。");
  }

  function buildEquivalentFractionExpandSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = randInt(3, 12);
        const numerator = randInt(1, denominator - 1);
        const multiplier = randInt(2, 9);
        return {
          question: `填入空格：${fractionText(numerator, denominator)} = （　）/${denominator * multiplier}。`,
          summary: `${numerator * multiplier}`,
          detail: `分母從 ${denominator} 變成 ${denominator * multiplier}，是乘以 ${multiplier}，分子也要乘以 ${multiplier}：${numerator} × ${multiplier} = ${numerator * multiplier}。`,
        };
      },
      () => {
        const denominator = randInt(3, 12);
        const numerator = randInt(1, denominator - 1);
        const multiplier = randInt(2, 9);
        return {
          question: `填入空格：${fractionText(numerator, denominator)} = ${fractionText(numerator * multiplier, "（　）")}。`,
          summary: `${denominator * multiplier}`,
          detail: `分子從 ${numerator} 變成 ${numerator * multiplier}，是乘以 ${multiplier}，分母也要乘以 ${multiplier}：${denominator} × ${multiplier} = ${denominator * multiplier}。`,
        };
      },
      () => {
        const denominator = randInt(4, 12);
        const numerator = randInt(1, denominator - 1);
        const multipliers = shuffle([2, 3, 4, 5, 6]).slice(0, 3).sort((a, b) => a - b);
        const expanded = multipliers.map((multiplier) => fractionText(numerator * multiplier, denominator * multiplier));
        return {
          question: `寫出 ${fractionText(numerator, denominator)} 的 3 個等值分數。`,
          summary: expanded.join("、"),
          detail: `分子和分母同乘相同整數，分數值不變。例如同乘 ${multipliers.join("、")}，可得 ${expanded.join("、")}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "分數擴分：分子與分母同乘一個不為 0 的整數，分數值不變。");
  }

  function buildDiscreteEquivalentFractionSet(count = 3) {
    const entries = [];
    const items = [
      { name: "月餅", unit: "個" },
      { name: "蛋塔", unit: "個" },
      { name: "巧克力", unit: "顆" },
      { name: "貼紙", unit: "張" },
      { name: "積木", unit: "塊" },
    ];
    const factories = [
      () => {
        const item = pick(items);
        const denominator = pick([2, 3, 4, 5, 6, 8]);
        const multiplier = pick([2, 3, 4]);
        const numerator = randInt(1, denominator - 1);
        const total = denominator * multiplier * randInt(2, 5);
        const expandedNumerator = numerator * multiplier;
        const expandedDenominator = denominator * multiplier;
        const amount = (total / denominator) * numerator;
        return {
          question: `一盒${item.name}有 ${total} ${item.unit}，${fractionText(numerator, denominator)} 盒是幾${item.unit}？${fractionText(expandedNumerator, expandedDenominator)} 盒是幾${item.unit}？兩者是否一樣？`,
          summary: `${amount} ${item.unit}、${amount} ${item.unit}，一樣`,
          detail: `${fractionText(numerator, denominator)} = ${fractionText(expandedNumerator, expandedDenominator)}，所以代表同一盒中的相同數量。${total} ÷ ${denominator} × ${numerator} = ${amount}，兩者都是 ${amount} ${item.unit}。`,
        };
      },
      () => {
        const item = pick(items);
        const total = pick([12, 16, 18, 20, 24, 30, 36, 40]);
        const denominatorA = pick([2, 3, 4, 5, 6, 8, 10]);
        const numeratorA = randInt(1, denominatorA - 1);
        const denominatorB = denominatorA * pick([2, 3]);
        const numeratorB = Math.max(1, Math.min(denominatorB - 1, numeratorA * (denominatorB / denominatorA) + pick([-1, 0, 1])));
        const amountA = total * numeratorA / denominatorA;
        const amountB = total * numeratorB / denominatorB;
        if (!Number.isInteger(amountA) || !Number.isInteger(amountB) || amountA === amountB) {
          return factories[0]();
        }
        const more = amountA > amountB ? fractionText(numeratorA, denominatorA) : fractionText(numeratorB, denominatorB);
        return {
          question: `一盒${item.name}有 ${total} ${item.unit}，${fractionText(numeratorA, denominatorA)} 盒和 ${fractionText(numeratorB, denominatorB)} 盒哪一個比較多？`,
          summary: `${more} 較多`,
          detail: `${fractionText(numeratorA, denominatorA)} 盒有 ${amountA} ${item.unit}，${fractionText(numeratorB, denominatorB)} 盒有 ${amountB} ${item.unit}，所以 ${more} 較多。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "離散量中的等值分數：先把一盒或一組平均分，再比較各分數代表的實際數量。");
  }

  function buildFractionDecimalConversionSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = pick([10, 100]);
        const numerator = randInt(1, denominator - 1);
        return {
          question: `${fractionText(numerator, denominator)} 用小數表示是多少？`,
          summary: `${decimalText(numerator / denominator)}`,
          detail: `分母是 ${denominator}，可直接看小數位。${fractionText(numerator, denominator)} = ${decimalText(numerator / denominator)}。`,
        };
      },
      () => {
        const denominator = pick([10, 100]);
        const numerator = randInt(1, denominator - 1);
        return {
          question: `${decimalText(numerator / denominator)} 用分數表示是多少？`,
          summary: `${fractionText(numerator, denominator)}`,
          detail: `${denominator === 10 ? "一位小數" : "二位小數"}可寫成分母為 ${denominator} 的分數，所以答案是 ${fractionText(numerator, denominator)}。`,
        };
      },
      () => {
        const denominator = pick([2, 5, 20, 25, 50]);
        const numerator = randInt(1, denominator - 1);
        const targetDenominator = 100 % denominator === 0 ? 100 : 10;
        const multiplier = targetDenominator / denominator;
        if (!Number.isInteger(multiplier)) {
          return factories[0]();
        }
        return {
          question: `${fractionText(numerator, denominator)} 先化成分母為 ${targetDenominator} 的等值分數，再寫成小數是多少？`,
          summary: `${decimalText(numerator / denominator)}`,
          detail: `${fractionText(numerator, denominator)} = ${fractionText(numerator * multiplier, targetDenominator)}，所以小數是 ${decimalText(numerator / denominator)}。`,
        };
      },
      () => {
        const whole = randInt(1, 5);
        const denominator = pick([10, 100]);
        const numerator = randInt(1, denominator - 1);
        const decimal = decimalText(whole + numerator / denominator);
        return {
          question: `${whole} ${fractionText(numerator, denominator)} 用小數表示是多少？`,
          summary: `${decimal}`,
          detail: `${fractionText(numerator, denominator)} = ${decimalText(numerator / denominator)}，所以 ${whole} ${fractionText(numerator, denominator)} = ${decimal}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "分數與小數互換：先把分母轉成 10 或 100，再依位值寫成小數。");
  }

  function buildFractionDecimalCompareSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = pick([2, 4, 5, 10, 20, 25, 50, 100]);
        const numerator = randInt(1, denominator - 1);
        const decimalDenominator = pick([10, 100]);
        const decimalNumerator = randInt(1, decimalDenominator - 1);
        const symbol = compareSymbol(numerator, denominator, decimalNumerator, decimalDenominator);
        return {
          question: `填入 >、< 或 =：${fractionText(numerator, denominator)} □ ${decimalText(decimalNumerator / decimalDenominator)}。`,
          summary: `${symbol}`,
          detail: `${fractionText(numerator, denominator)} = ${decimalText(numerator / denominator)}，右邊是 ${decimalText(decimalNumerator / decimalDenominator)}，所以應填「${symbol}」。`,
        };
      },
      () => {
        const baseDenominator = pick([3, 4, 5, 6, 8, 10]);
        const multiplier = pick([2, 3, 4]);
        const numeratorA = randInt(1, baseDenominator - 1);
        const numeratorB = randInt(1, baseDenominator * multiplier - 1);
        const symbol = compareSymbol(numeratorA, baseDenominator, numeratorB, baseDenominator * multiplier);
        return {
          question: `比較大小：${fractionText(numeratorA, baseDenominator)} □ ${fractionText(numeratorB, baseDenominator * multiplier)}。`,
          summary: `${symbol}`,
          detail: `把 ${fractionText(numeratorA, baseDenominator)} 擴分成 ${fractionText(numeratorA * multiplier, baseDenominator * multiplier)}，再和 ${fractionText(numeratorB, baseDenominator * multiplier)} 比較，所以填「${symbol}」。`,
        };
      },
      () => {
        const candidates = shuffle([
          { n: 1, d: 2 },
          { n: 2, d: 5 },
          { n: 3, d: 10 },
          { n: 4, d: 5 },
          { n: 7, d: 10 },
          { n: 9, d: 20 },
        ]).slice(0, 3);
        const ordered = candidates.slice().sort((a, b) => a.n * b.d - b.n * a.d);
        return {
          question: `將 ${candidates.map((item) => fractionText(item.n, item.d)).join("、")} 由小到大排列。`,
          summary: ordered.map((item) => fractionText(item.n, item.d)).join(" < "),
          detail: `可先化成小數或通分比較，依序為 ${ordered.map((item) => `${fractionText(item.n, item.d)} = ${decimalText(item.n / item.d)}`).join("，")}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "分數、小數與異分母比較：把不同表示法化成同一種形式，再比較大小。");
  }

  function buildFractionNumberLineSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const start = randInt(0, 3);
        const parts = pick([4, 5, 6, 8, 10]);
        return {
          question: `在數線上，從 ${start} 到 ${start + 1} 平分成 ${parts} 等分，每一小格是多少？`,
          summary: `${fractionText(1, parts)}`,
          detail: `相鄰兩個整數相差 1，平均分成 ${parts} 等分，每一小格就是 ${fractionText(1, parts)}。`,
        };
      },
      () => {
        const start = randInt(0, 3);
        const parts = pick([4, 5, 6, 8, 10]);
        const tick = randInt(1, parts - 1);
        const numerator = start * parts + tick;
        return {
          question: `在數線上，從 ${start} 往右數 ${tick} 個 ${fractionText(1, parts)}，這個點表示多少？`,
          summary: `${mixedFractionText(numerator, parts)}`,
          detail: `從 ${start} 開始往右 ${tick} 小格，是 ${start} + ${fractionText(tick, parts)} = ${mixedFractionText(numerator, parts)}。`,
        };
      },
      () => {
        const parts = pick([4, 5, 6, 8, 10]);
        const startNumerator = randInt(parts + 1, parts * 4);
        const move = randInt(1, Math.min(parts, startNumerator - 1));
        const goRight = Math.random() < 0.5;
        const resultNumerator = goRight ? startNumerator + move : startNumerator - move;
        return {
          question: `甲蟲在數線上 ${mixedFractionText(startNumerator, parts)} 的位置，向${goRight ? "右" : "左"}走 ${fractionText(move, parts)}，停在什麼位置？`,
          summary: `${mixedFractionText(resultNumerator, parts)}`,
          detail: `向${goRight ? "右" : "左"}就是${goRight ? "加" : "減"}：${mixedFractionText(startNumerator, parts)} ${goRight ? "+" : "-"} ${fractionText(move, parts)} = ${mixedFractionText(resultNumerator, parts)}。`,
        };
      },
      () => {
        const parts = pick([4, 5, 10]);
        const numeratorA = randInt(1, parts * 3);
        let numeratorB = randInt(1, parts * 3);
        while (numeratorB === numeratorA) {
          numeratorB = randInt(1, parts * 3);
        }
        const closer = numeratorA < numeratorB ? "A 點在左邊" : "B 點在左邊";
        return {
          question: `數線上 A 點是 ${mixedFractionText(numeratorA, parts)}，B 點是 ${mixedFractionText(numeratorB, parts)}，哪一點在左邊？`,
          summary: `${closer}`,
          detail: `數線上數值越小越靠左。因為 ${mixedFractionText(numeratorA, parts)} ${numeratorA < numeratorB ? "<" : ">"} ${mixedFractionText(numeratorB, parts)}，所以${closer}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "分數數線：先看每一小格代表的分數，再用往右增加、往左減少來判斷位置。");
  }

  function buildEquivalentFractionMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "等值分數綜合練習：用擴分、分裝、數線與小數互換理解同一個量的不同表示。");
  }

  function buildConsecutiveAdditionSet(count = 3) {
    const entries = [];
    const roundValues = [500, 800, 900, 1000, 1200, 1500, 2000];
    while (entries.length < count) {
      const round = pick(roundValues);
      const first = randInt(90, round - 90);
      const second = round - first;
      const third = randInt(120, 1500);
      const ordered = shuffle([first, second, third]);
      const result = round + third;
      entries.push({
        question: `請用簡便方法計算：${ordered[0]} + ${ordered[1]} + ${ordered[2]} = （　）。`,
        summary: `${result}`,
        detail: `先找可以湊成整百或整千的兩個數：${first} + ${second} = ${round}，再算 ${round} + ${third} = ${result}。`,
      });
    }
    return createResult(entries, "連加時先找能湊成整百或整千的兩個加數，先加會比較快。");
  }

  function buildSubtractionReorderSet(count = 3) {
    const entries = [];
    const neatValues = [400, 500, 600, 800, 900, 1000, 1200, 1600, 2000];
    while (entries.length < count) {
      const neat = pick(neatValues);
      const third = randInt(120, 1200);
      const first = neat + third;
      const second = randInt(80, Math.max(160, neat - 120));
      const result = neat - second;
      entries.push({
        question: `請用簡便方法計算：${first} - ${second} - ${third} = （　）。`,
        summary: `${result}`,
        detail: `先減比較好減的數：${first} - ${third} = ${neat}，再算 ${neat} - ${second} = ${result}。`,
      });
    }
    return createResult(entries, "連減時可以先觀察哪一個減數先減最容易，調整順序後再算。");
  }

  function buildSubtractionGroupSet(count = 3) {
    const entries = [];
    const groupValues = [300, 400, 700, 800, 900, 1000, 2000, 3000];
    while (entries.length < count) {
      const group = pick(groupValues);
      const firstSub = randInt(Math.max(100, Math.floor(group / 5)), group - Math.max(100, Math.floor(group / 5)));
      const secondSub = group - firstSub;
      const remain = randInt(120, 2600);
      const first = group + remain;
      entries.push({
        question: `請用簡便方法計算：${first} - ${firstSub} - ${secondSub} = （　）。`,
        summary: `${remain}`,
        detail: `先把兩個減數合起來：${firstSub} + ${secondSub} = ${group}，所以 ${first} - ${firstSub} - ${secondSub} = ${first} - (${firstSub} + ${secondSub}) = ${first} - ${group} = ${remain}。`,
      });
    }
    return createResult(entries, "如果兩個減數加起來剛好是整百或整千，可先把它們合成一個數再減。");
  }

  function buildAddSubMixedSet(count = 3) {
    const entries = [];
    const neatValues = [400, 500, 600, 700, 800, 900, 1000, 1200];
    while (entries.length < count) {
      const neat = pick(neatValues);
      const minusValue = randInt(60, 900);
      const first = neat + minusValue;
      const addValue = randInt(80, 980);
      const result = neat + addValue;
      entries.push({
        question: `請用簡便方法計算：${first} + ${addValue} - ${minusValue} = （　）。`,
        summary: `${result}`,
        detail: `先算比較好減的部分：${first} - ${minusValue} = ${neat}，再算 ${neat} + ${addValue} = ${result}。`,
      });
    }
    return createResult(entries, "加減混合時，可以先把減法和某個數配成整百或整千，再做剩下的加法。");
  }

  function buildAddSubApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const first = randInt(220, 680);
        const second = randInt(180, 520);
        const third = randInt(120, 420);
        const total = first + second + third;
        return {
          question: `水果攤今天賣出柳丁 ${first} 公斤、橘子 ${second} 公斤和蘋果 ${third} 公斤，一共賣出多少公斤水果？`,
          summary: `${total} 公斤`,
          detail: `先把比較容易湊整的兩個數先加，再和剩下的數相加，可得 ${first} + ${second} + ${third} = ${total}，所以一共賣出 ${total} 公斤。`,
        };
      },
      () => {
        const totalMoney = pick([1500, 1800, 2000, 2400, 3000]);
        const firstSpend = randInt(220, totalMoney - 300);
        const secondSpend = randInt(80, totalMoney - firstSpend - 20);
        const remain = totalMoney - firstSpend - secondSpend;
        return {
          question: `姐姐有 ${formatNumber(totalMoney)} 元，先買衣服花了 ${formatNumber(firstSpend)} 元，又買文具花了 ${formatNumber(secondSpend)} 元，還剩多少元？`,
          summary: `${formatNumber(remain)} 元`,
          detail: `可先把兩筆花費合起來：${formatNumber(firstSpend)} + ${formatNumber(secondSpend)} = ${formatNumber(firstSpend + secondSpend)}，再算 ${formatNumber(totalMoney)} - ${formatNumber(firstSpend + secondSpend)} = ${formatNumber(remain)}，所以還剩 ${formatNumber(remain)} 元。`,
        };
      },
      () => {
        const totalBooks = randInt(1100, 2600);
        const borrowed = randInt(120, 480);
        const sold = randInt(120, 480);
        const remain = totalBooks - borrowed - sold;
        return {
          question: `圖書館原有 ${formatNumber(totalBooks)} 本書，歸還了 ${formatNumber(borrowed)} 本，又借出 ${formatNumber(sold)} 本，現在有多少本？`,
          summary: `${formatNumber(remain)} 本`,
          detail: `先算比較好減的部分，再處理剩下的加減，可得 ${formatNumber(totalBooks)} + ${formatNumber(borrowed)} - ${formatNumber(sold)} = ${formatNumber(remain)}，所以現在有 ${formatNumber(remain)} 本。`,
        };
      },
      () => {
        const bagPrice = randInt(220, 480);
        const hookPrice = randInt(60, 180);
        const discount = randInt(20, 60);
        const total = bagPrice + hookPrice - discount;
        return {
          question: `媽媽買拖把 ${bagPrice} 元和掛勾 ${hookPrice} 元，結帳時用了折價券折抵 ${discount} 元，要付多少元？`,
          summary: `${total} 元`,
          detail: `先算原價總和：${bagPrice} + ${hookPrice} = ${bagPrice + hookPrice}，再減去折價 ${discount} 元，得到 ${total} 元，所以要付 ${total} 元。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "加減法生活題也能簡算：先列出算式，再找能先湊整或先合併的部分。");
  }

  function buildMultiplyRoundSet(count = 3) {
    const entries = [];
    const templates = [
      { pair: [4, 5], target: 20, extraMin: 12, extraMax: 180 },
      { pair: [5, 6], target: 30, extraMin: 12, extraMax: 150 },
      { pair: [8, 5], target: 40, extraMin: 12, extraMax: 99 },
    ];
    while (entries.length < count) {
      const template = pick(templates);
      const extra = randInt(template.extraMin, template.extraMax);
      const factors = shuffle([template.pair[0], template.pair[1], extra]);
      const result = template.target * extra;
      entries.push({
        question: `請用簡便方法計算：${factors[0]} × ${factors[1]} × ${factors[2]} = （　）。`,
        summary: `${result}`,
        detail: `先算 ${template.pair[0]} × ${template.pair[1]} = ${template.target}，再算 ${template.target} × ${extra} = ${result}。`,
      });
    }
    return createResult(entries, "連乘時若先找到能湊成整十或整百的因數，後面乘起來會更快。");
  }

  function buildMultiplySpecialSet(count = 3) {
    const entries = [];
    const templates = [
      { pair: [25, 4], target: 100, extraMin: 12, extraMax: 120 },
      { pair: [125, 8], target: 1000, extraMin: 2, extraMax: 9 },
      { pair: [20, 50], target: 1000, extraMin: 12, extraMax: 48 },
      { pair: [2, 5], target: 10, extraMin: 120, extraMax: 980 },
    ];
    while (entries.length < count) {
      const template = pick(templates);
      const extra = randInt(template.extraMin, template.extraMax);
      const factors = shuffle([template.pair[0], template.pair[1], extra]);
      const result = template.target * extra;
      entries.push({
        question: `請用簡便方法計算：${factors[0]} × ${factors[1]} × ${factors[2]} = （　）。`,
        summary: `${result}`,
        detail: `先用特別好算的組合：${template.pair[0]} × ${template.pair[1]} = ${template.target}，再算 ${template.target} × ${extra} = ${result}。`,
      });
    }
    return createResult(entries, "熟記 25×4=100、125×8=1000、2×5=10 這些組合，可以大幅加快連乘計算。");
  }

  function buildMulDivFirstDivideSet(count = 3) {
    const entries = [];
    const divisors = [3, 4, 5, 6, 8, 9, 12, 24];
    const multipliers = [4, 5, 7, 8, 9, 14, 21];
    while (entries.length < count) {
      const divisor = pick(divisors);
      const reduced = randInt(6, 120);
      const first = divisor * reduced;
      const second = pick(multipliers);
      const result = reduced * second;
      entries.push({
        question: `請用簡便方法計算：${first} × ${second} ÷ ${divisor} = （　）。`,
        summary: `${result}`,
        detail: `因為 ${first} 可以先被 ${divisor} 整除，所以先算 ${first} ÷ ${divisor} = ${reduced}，再算 ${reduced} × ${second} = ${result}。`,
      });
    }
    return createResult(entries, "乘除混合時，若前面的數可以先被後面的除數整除，就先除再乘。");
  }

  function buildMultiplyApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const price = 42;
        const bottlesPerBox = 6;
        const boxCount = 5;
        const total = price * bottlesPerBox * boxCount;
        return {
          question: `一瓶果汁 ${price} 元，一盒有 ${bottlesPerBox} 瓶，買 ${boxCount} 盒共幾元？`,
          summary: `${total} 元`,
          detail: `先算一共買幾瓶：${bottlesPerBox} × ${boxCount} = ${bottlesPerBox * boxCount}，再算 ${price} × ${bottlesPerBox * boxCount} = ${total}，所以共 ${total} 元。`,
        };
      },
      () => {
        const price = 75;
        const packs = 4;
        const itemsPerPack = 6;
        const total = price * packs * itemsPerPack;
        return {
          question: `一組飲料 ${price} 元，一箱有 ${packs} 組，買 ${itemsPerPack} 箱共幾元？`,
          summary: `${total} 元`,
          detail: `先算箱數和每箱組數：${packs} × ${itemsPerPack} = ${packs * itemsPerPack}，再算 ${price} × ${packs * itemsPerPack} = ${total}，所以共 ${total} 元。`,
        };
      },
      () => {
        const price = 17;
        const itemsPerBox = 25;
        const boxCount = 4;
        const total = price * itemsPerBox * boxCount;
        return {
          question: `一本筆記本 ${price} 元，一箱有 ${itemsPerBox} 本，買 ${boxCount} 箱共幾元？`,
          summary: `${total} 元`,
          detail: `先算 ${itemsPerBox} × ${boxCount} = ${itemsPerBox * boxCount}，再算 ${price} × ${itemsPerBox * boxCount} = ${total}，所以共 ${total} 元。`,
        };
      },
      () => {
        const price = 25;
        const itemsPerBox = 9;
        const boxCount = 2;
        const total = price * itemsPerBox * boxCount;
        return {
          question: `一包泡芙 ${price} 元，一盒有 ${itemsPerBox} 包，買 ${boxCount} 盒共幾元？`,
          summary: `${total} 元`,
          detail: `先算 ${price} × ${boxCount} = ${price * boxCount}，再算 ${price * boxCount} × ${itemsPerBox} = ${total}，所以共 ${total} 元。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "乘法生活題先把總數量或好算的因數配好，再乘單價或單位量。");
  }

  function buildMulDivApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const price = 255;
        const boxCount = 4;
        const people = 5;
        const result = price * boxCount / people;
        return {
          question: `一盒蜂蜜蛋糕 ${price} 元，${people} 個人合買 ${boxCount} 盒，平均一人付幾元？`,
          summary: `${result} 元`,
          detail: `先算 ${price} ÷ ${people} = ${price / people}，再算 ${price / people} × ${boxCount} = ${result}，所以平均一人付 ${result} 元。`,
        };
      },
      () => {
        const total = 45;
        const people = 5;
        const bagCount = 3;
        const result = total * bagCount / people;
        return {
          question: `一包果凍 ${total} 顆，${people} 人合買 ${bagCount} 包，每人分到幾顆？`,
          summary: `${result} 顆`,
          detail: `先算 ${total} ÷ ${people} = ${total / people}，再算 ${total / people} × ${bagCount} = ${result}，所以每人分到 ${result} 顆。`,
        };
      },
      () => {
        const total = 660;
        const boxCount = 8;
        const people = 6;
        const result = total * boxCount / people;
        return {
          question: `一盒櫻桃 ${formatNumber(total)} 公克，買了 ${boxCount} 盒平分給 ${people} 個朋友，每人分幾公克？`,
          summary: `${formatNumber(result)} 公克`,
          detail: `先算 ${formatNumber(total)} ÷ ${people} = ${formatNumber(total / people)}，再算 ${formatNumber(total / people)} × ${boxCount} = ${formatNumber(result)}，所以每人分到 ${formatNumber(result)} 公克。`,
        };
      },
      () => {
        const total = 624;
        const boxCount = 5;
        const people = 6;
        const result = total * boxCount / people;
        return {
          question: `球具卡賣 ${formatNumber(total)} 元，計畫買 ${boxCount} 組，${people} 個人平均分攤，每人要付幾元？`,
          summary: `${formatNumber(result)} 元`,
          detail: `先算 ${formatNumber(total)} ÷ ${people} = ${formatNumber(total / people)}，再算 ${formatNumber(total / people)} × ${boxCount} = ${formatNumber(result)}，所以每人要付 ${formatNumber(result)} 元。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "乘除法生活題若能先除再乘，數字會變小，平均分配也會更好算。");
  }

  function buildSimplifyCalculationMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "簡化計算綜合練習：先觀察數字關係，再決定要湊整、換順序，還是先除再乘。");
  }

  function countTrailingZeros(value) {
    const match = String(value).match(/0+$/);
    return match ? match[0].length : 0;
  }

  function buildE412PlaceValueByOneDigitSet(count = 3) {
    const entries = [];
    const units = [10, 100, 1000];
    while (entries.length < count) {
      const core = randInt(2, 9);
      const unit = pick(units);
      const multiplicand = core * unit;
      const multiplier = randInt(2, 9);
      const product = multiplicand * multiplier;
      entries.push({
        question: `計算：${multiplicand} × ${multiplier} = ?`,
        summary: `${product}`,
        detail: `${core} × ${multiplier} = ${core * multiplier}，再補上 ${countTrailingZeros(multiplicand)} 個 0，所以 ${multiplicand} × ${multiplier} = ${product}。`,
      });
    }
    return createResult(entries, "先算前面的非 0 部分，再看原數末尾有幾個 0，幫助學生連結位值與乘法。");
  }

  function buildE412TensTimesTensSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const a = randInt(2, 9) * 10;
      const b = randInt(2, 9) * 10;
      const product = a * b;
      entries.push({
        question: `計算：${a} × ${b} = ?`,
        summary: `${product}`,
        detail: `先算 ${a / 10} × ${b / 10} = ${(a / 10) * (b / 10)}，再補上 2 個 0，所以 ${a} × ${b} = ${product}。`,
      });
    }
    return createResult(entries, "整十乘整十要先看前面的數字相乘，再補上兩個 0。");
  }

  function buildE412ThreeDigitTimesTensSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const multiplicand = randInt(120, 987);
      const multiplier = randInt(2, 9) * 10;
      const product = multiplicand * multiplier;
      entries.push({
        question: `計算：${multiplicand} × ${multiplier} = ?`,
        summary: `${product}`,
        detail: `把 ${multiplier} 看成 ${multiplier / 10} 個十，先算 ${multiplicand} × ${multiplier / 10} = ${multiplicand * (multiplier / 10)}，再乘 10 得 ${product}。`,
      });
    }
    return createResult(entries, "三位數乘整十可先乘前面的個數，再補上一個 0，避免位值對齊出錯。");
  }

  function buildE412FourDigitTimesOneDigitSet(count = 3) {
    const entries = [];
    const candidates = [
      () => randInt(11, 99) * 100 + randInt(2, 9),
      () => randInt(10, 98) * 100 + randInt(10, 98),
      () => randInt(1, 9) * 1000 + randInt(1, 9) * 100 + randInt(1, 9) * 10 + randInt(1, 9),
    ];
    while (entries.length < count) {
      const multiplicand = pick(candidates)();
      const multiplier = randInt(2, 9);
      const product = multiplicand * multiplier;
      entries.push({
        question: `計算：${multiplicand} × ${multiplier} = ?`,
        summary: `${product}`,
        detail: `可用直式從個位開始乘。注意每一位都要乘到，若中間有 0，該位仍要保留位值，所以 ${multiplicand} × ${multiplier} = ${product}。`,
      });
    }
    return createResult(entries, "四位數乘一位數要穩定處理進位，也要注意中間有 0 時不能跳位。");
  }

  function buildE412TwoDigitTimesTwoDigitNoCarrySet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const aTens = randInt(1, 4);
      const aOnes = randInt(1, 4);
      const bTens = randInt(1, 4);
      const bOnes = randInt(1, 4);
      if (aOnes * bOnes >= 10 || aTens * bOnes + aOnes * bTens >= 10) {
        continue;
      }
      const multiplicand = aTens * 10 + aOnes;
      const multiplier = bTens * 10 + bOnes;
      const product = multiplicand * multiplier;
      entries.push({
        question: `計算：${multiplicand} × ${multiplier} = ?`,
        summary: `${product}`,
        detail: `把 ${multiplier} 拆成 ${bOnes} 和 ${bTens * 10}。先算 ${multiplicand} × ${bOnes}，再算 ${multiplicand} × ${bTens * 10}，最後相加得 ${product}。這題各層都不需要進位。`,
      });
    }
    return createResult(entries, "先用不進位的二位數乘法建立直式格式感，再進入需要進位的題目。");
  }

  function buildE412TwoDigitTimesTwoDigitCarrySet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const multiplicand = randInt(15, 98);
      const multiplier = randInt(12, 98);
      const aTens = Math.floor(multiplicand / 10);
      const aOnes = multiplicand % 10;
      const bTens = Math.floor(multiplier / 10);
      const bOnes = multiplier % 10;
      if (aOnes * bOnes < 10 && aTens * bOnes + aOnes * bTens < 10) {
        continue;
      }
      const product = multiplicand * multiplier;
      entries.push({
        question: `計算：${multiplicand} × ${multiplier} = ?`,
        summary: `${product}`,
        detail: `先算個位乘積，再算十位乘積並注意進位與位值對齊。把 ${multiplier} 拆成 ${bOnes} 和 ${bTens * 10} 來看，最後合起來得到 ${product}。`,
      });
    }
    return createResult(entries, "這類題要練熟個位進位、十位進位與第二層部分積的位值對齊。");
  }

  function buildE412ThreeDigitTimesTwoDigitSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const multiplicand = randInt(123, 987);
      const multiplier = randInt(12, 98);
      const tens = Math.floor(multiplier / 10);
      const ones = multiplier % 10;
      const product = multiplicand * multiplier;
      entries.push({
        question: `計算：${multiplicand} × ${multiplier} = ?`,
        summary: `${product}`,
        detail: `把 ${multiplier} 拆成 ${tens * 10} 和 ${ones}，先算 ${multiplicand} × ${ones}，再算 ${multiplicand} × ${tens * 10}，最後相加得 ${product}。`,
      });
    }
    return createResult(entries, "三位數乘二位數是整數乘法的主力題型，核心是分層相乘再相加。");
  }

  function buildE412ZeroContainingSet(count = 3) {
    const entries = [];
    const factories = [
      () => randInt(1, 9) * 100 + randInt(1, 9),
      () => randInt(12, 98) * 10,
      () => randInt(1, 9) * 1000 + randInt(1, 9) * 100 + randInt(0, 9) * 10,
      () => randInt(1, 9) * 1000 + randInt(1, 9) * 10 + randInt(1, 9),
    ];
    while (entries.length < count) {
      const multiplicand = pick(factories)();
      const multiplier = randInt(12, 98);
      const product = multiplicand * multiplier;
      entries.push({
        question: `計算：${multiplicand} × ${multiplier} = ?`,
        summary: `${product}`,
        detail: `這題的重點是保留 0 的位值。直式中即使某一位乘出 0，也不能省略該位的位置，所以 ${multiplicand} × ${multiplier} = ${product}。`,
      });
    }
    return createResult(entries, "被乘數中間或末尾有 0 時，學生最常錯在漏位，這一類要特別練位值保留。");
  }

  function buildE412FourDigitTimesTwoDigitSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const multiplicand = randInt(1200, 9876);
      const multiplier = randInt(12, 98);
      const tens = Math.floor(multiplier / 10);
      const ones = multiplier % 10;
      const product = multiplicand * multiplier;
      entries.push({
        question: `計算：${multiplicand} × ${multiplier} = ?`,
        summary: `${product}`,
        detail: `四位數乘二位數可先算 ${multiplicand} × ${ones}，再算 ${multiplicand} × ${tens * 10}，第二層要向左錯開一位，最後相加得 ${product}。`,
      });
    }
    return createResult(entries, "四位數乘二位數的積通常較大，除了進位，也要提醒學生用位數估算檢查答案。");
  }

  function buildE412TrailingZeroProductSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const coreA = randInt(2, 98);
      const coreB = randInt(2, 98);
      const zeroA = pick([1, 1, 2, 2, 3]);
      const zeroB = pick([1, 1, 2, 2]);
      const a = coreA * 10 ** zeroA;
      const b = coreB * 10 ** zeroB;
      const product = a * b;
      entries.push({
        question: `計算：${a} × ${b} = ?`,
        summary: `${product}`,
        detail: `先算非 0 部分：${coreA} × ${coreB} = ${coreA * coreB}。再把兩個因數末尾的 0 一起補回去，共 ${zeroA + zeroB} 個 0，所以答案是 ${product}。`,
      });
    }
    return createResult(entries, "末尾有 0 的乘法要先乘前面的數，再把兩邊的 0 一起補回去。");
  }

  function buildE412NearKnownProductSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const a = randInt(12, 98);
      const b = randInt(12, 89);
      const delta = pick([-1, 1]);
      const known = a * b;
      const target = b + delta;
      const product = a * target;
      entries.push({
        question: `已知 ${a} × ${b} = ${known}，求 ${a} × ${target} = ?`,
        summary: `${product}`,
        detail: `${target === b + 1 ? "因為多 1 個" : "因為少 1 個"} ${a}，所以在 ${known} 的基礎上${delta === 1 ? `加上 ${a}` : `減去 ${a}`}，得到 ${product}。`,
      });
    }
    return createResult(entries, "利用前後項關係做數感推理，重點不是重算，而是看出只差一個被乘數。");
  }

  function buildE412RoundNumberAdjustmentSet(count = 3) {
    const entries = [];
    const bases = [10, 100, 1000];
    while (entries.length < count) {
      const a = randInt(12, 300);
      const base = pick(bases);
      const target = pick([base - 1, base + 1]);
      const baseProduct = a * base;
      const product = a * target;
      entries.push({
        question: `計算：${a} × ${target} = ?`,
        summary: `${product}`,
        detail: `把 ${target} 看成 ${base}${target > base ? " + 1" : " - 1"}。先算 ${a} × ${base} = ${baseProduct}，再${target > base ? `加上 ${a}` : `減去 ${a}`}，得到 ${product}。`,
      });
    }
    return createResult(entries, "像 99、101、999 這類題，可改想成接近整十、整百、整千，再做一次加減調整。");
  }

  function buildE412BasicPlaceValueMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "這組先練位值規律，包含整十、整百、整千與乘整十，建立整數乘法的底層感覺。");
  }

  function buildE412ColumnBasicMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "這組集中練直式乘法的基本功：位值對齊、部分積位置與進位處理。");
  }

  function buildE412LargeMultiplicationMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "這組聚焦在三位數、四位數乘二位數，提醒學生先分層，再用估算檢查答案合理性。");
  }

  function buildE412ZeroHandlingMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "這組專練與 0 有關的乘法，包含末尾有 0 的簡化乘法，以及含 0 數字的位值保留。");
  }

  function buildE412ReasoningMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "這組用已知乘法往前後推，訓練學生從規律出發，不必每次都從頭重算。");
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function durationDaysHours(totalHours) {
    return {
      days: Math.floor(totalHours / 24),
      hours: totalHours % 24,
    };
  }

  function durationHoursMinutes(totalMinutes) {
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
    };
  }

  function durationMinutesSeconds(totalSeconds) {
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60,
    };
  }

  function formatDayHour(days, hours) {
    return `${days} 日 ${hours} 小時`;
  }

  function formatHourMinute(hours, minutes) {
    return `${hours} 小時 ${minutes} 分鐘`;
  }

  function formatMinuteSecond(minutes, seconds) {
    return `${minutes} 分鐘 ${seconds} 秒`;
  }

  function formatTimeDuration(totalMinutes) {
    const parts = durationHoursMinutes(totalMinutes);
    return formatHourMinute(parts.hours, parts.minutes);
  }

  function formatSecondDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const remain = totalSeconds % 3600;
    const minutes = Math.floor(remain / 60);
    const seconds = remain % 60;
    if (hours > 0) {
      return `${hours} 小時 ${minutes} 分鐘 ${seconds} 秒`;
    }
    return `${minutes} 分鐘 ${seconds} 秒`;
  }

  function compareMark(left, right) {
    return left === right ? "=" : left > right ? ">" : "<";
  }

  function formatAmPmTime(hour24, minute, second = null) {
    const period = hour24 < 12 ? "上午" : "下午";
    let hour12 = hour24 % 12;
    if (hour12 === 0) {
      hour12 = 12;
    }
    let text = `${period} ${hour12} 時 ${minute} 分`;
    if (second !== null) {
      text += ` ${second} 秒`;
    }
    return text;
  }

  function formatClock24(hour, minute) {
    return `${pad2(hour)}:${pad2(minute)}`;
  }

  function daysInMonth(month) {
    return new Date(2026, month, 0).getDate();
  }

  function randomMonthDay() {
    const month = randInt(1, 12);
    const day = randInt(1, daysInMonth(month));
    return { month, day };
  }

  function formatMonthDay(date) {
    return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  }

  function formatMonthDayTime(date, includeSecond = false) {
    return `${formatMonthDay(date)}${formatAmPmTime(date.getHours(), date.getMinutes(), includeSecond ? date.getSeconds() : null)}`;
  }

  function buildTimeCompoundToSingleSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const days = randInt(1, 8);
        const hours = randInt(1, 23);
        const total = days * 24 + hours;
        return {
          question: `${days} 日 ${hours} 小時 = （　）小時`,
          summary: `${total} 小時`,
          detail: `${days} 日 = ${days} × 24 = ${days * 24} 小時，再加上 ${hours} 小時，共 ${total} 小時。`,
        };
      },
      () => {
        const hours = randInt(1, 9);
        const minutes = randInt(1, 59);
        const total = hours * 60 + minutes;
        return {
          question: `${hours} 小時 ${minutes} 分鐘 = （　）分鐘`,
          summary: `${total} 分鐘`,
          detail: `${hours} 小時 = ${hours} × 60 = ${hours * 60} 分鐘，再加上 ${minutes} 分鐘，共 ${total} 分鐘。`,
        };
      },
      () => {
        const minutes = randInt(1, 20);
        const seconds = randInt(1, 59);
        const total = minutes * 60 + seconds;
        return {
          question: `${minutes} 分鐘 ${seconds} 秒 = （　）秒`,
          summary: `${total} 秒`,
          detail: `${minutes} 分鐘 = ${minutes} × 60 = ${minutes * 60} 秒，再加上 ${seconds} 秒，共 ${total} 秒。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "複名數換成單名數時，要先把大單位全部換成小單位，再加上剩下的部分。");
  }

  function buildTimeSingleToCompoundSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const days = randInt(1, 9);
        const hours = randInt(1, 23);
        const total = days * 24 + hours;
        return {
          question: `${total} 小時 = （　）日（　）小時`,
          summary: formatDayHour(days, hours),
          detail: `${total} ÷ 24 = ${days} 餘 ${hours}，所以是 ${days} 日 ${hours} 小時。`,
        };
      },
      () => {
        const hours = randInt(1, 9);
        const minutes = randInt(1, 59);
        const total = hours * 60 + minutes;
        return {
          question: `${total} 分鐘 = （　）小時（　）分鐘`,
          summary: formatHourMinute(hours, minutes),
          detail: `${total} ÷ 60 = ${hours} 餘 ${minutes}，所以是 ${hours} 小時 ${minutes} 分鐘。`,
        };
      },
      () => {
        const minutes = randInt(1, 9);
        const seconds = randInt(1, 59);
        const total = minutes * 60 + seconds;
        return {
          question: `${total} 秒 = （　）分鐘（　）秒`,
          summary: formatMinuteSecond(minutes, seconds),
          detail: `${total} ÷ 60 = ${minutes} 餘 ${seconds}，所以是 ${minutes} 分鐘 ${seconds} 秒。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "單名數換成複名數時，用 ÷24 或 ÷60，商是大單位，餘數是小單位。");
  }

  function buildTimeCompareSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const leftMinutes = randInt(20, 180);
        const rightSeconds = leftMinutes * 60 + pick([-120, -60, 0, 60, 120]);
        const mark = compareMark(leftMinutes * 60, rightSeconds);
        return {
          question: `${leftMinutes} 分鐘 □ ${rightSeconds} 秒`,
          summary: `${mark}`,
          detail: `把 ${leftMinutes} 分鐘換成秒：${leftMinutes} × 60 = ${leftMinutes * 60} 秒，和 ${rightSeconds} 秒比較，所以填 ${mark}。`,
        };
      },
      () => {
        const days = randInt(1, 8);
        const totalHours = days * 24 + pick([-8, -3, 0, 4, 11]);
        const mark = compareMark(days * 24, totalHours);
        return {
          question: `${days} 日 □ ${totalHours} 小時`,
          summary: `${mark}`,
          detail: `把 ${days} 日換成小時：${days} × 24 = ${days * 24} 小時，和 ${totalHours} 小時比較，所以填 ${mark}。`,
        };
      },
      () => {
        const hours = randInt(1, 8);
        const minutes = randInt(1, 59);
        const totalMinutes = hours * 60 + minutes + pick([-25, -5, 0, 8, 23]);
        const mark = compareMark(hours * 60 + minutes, totalMinutes);
        return {
          question: `${hours} 小時 ${minutes} 分鐘 □ ${totalMinutes} 分鐘`,
          summary: `${mark}`,
          detail: `把 ${hours} 小時 ${minutes} 分鐘換成分鐘：${hours * 60} + ${minutes} = ${hours * 60 + minutes} 分鐘，再和 ${totalMinutes} 分鐘比較，所以填 ${mark}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "比較時間長短時，先把兩邊換成同一種單位，再判斷大小。");
  }

  function buildTimeCrossUnitSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const days = randInt(1, 4);
        const hours = randInt(1, 8);
        const totalMinutes = (days * 24 + hours) * 60;
        return {
          question: `${days} 日 ${hours} 小時 = （　）分鐘`,
          summary: `${totalMinutes} 分鐘`,
          detail: `先把 ${days} 日 ${hours} 小時換成小時：${days} × 24 + ${hours} = ${days * 24 + hours} 小時，再乘 60，得到 ${totalMinutes} 分鐘。`,
        };
      },
      () => {
        const days = randInt(1, 5);
        const totalMinutes = days * 24 * 60;
        return {
          question: `${days} 日 = （　）分鐘`,
          summary: `${totalMinutes} 分鐘`,
          detail: `1 日 = 24 小時，1 小時 = 60 分鐘，所以 ${days} 日 = ${days} × 24 × 60 = ${totalMinutes} 分鐘。`,
        };
      },
      () => {
        const hours = randInt(1, 9);
        const totalSeconds = hours * 60 * 60;
        return {
          question: `${hours} 小時 = （　）秒`,
          summary: `${totalSeconds} 秒`,
          detail: `1 小時 = 60 分鐘，1 分鐘 = 60 秒，所以 ${hours} 小時 = ${hours} × 60 × 60 = ${totalSeconds} 秒。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "跨兩層單位換算時，要分兩步：先換第一層，再換第二層。");
  }

  function buildTimeConversionApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const hours = pick([48, 56, 72, 80, 96]);
        const parts = durationDaysHours(hours);
        return {
          question: `手機充滿電後可待機 ${hours} 小時，也可以說是幾日幾小時？`,
          summary: formatDayHour(parts.days, parts.hours),
          detail: `${hours} ÷ 24 = ${parts.days} 餘 ${parts.hours}，所以是 ${parts.days} 日 ${parts.hours} 小時。`,
        };
      },
      () => {
        const seconds = randInt(200, 900);
        const parts = durationMinutesSeconds(seconds);
        return {
          question: `活動影片播放了 ${seconds} 秒，也可以說是幾分鐘幾秒？`,
          summary: formatMinuteSecond(parts.minutes, parts.seconds),
          detail: `${seconds} ÷ 60 = ${parts.minutes} 餘 ${parts.seconds}，所以是 ${parts.minutes} 分鐘 ${parts.seconds} 秒。`,
        };
      },
      () => {
        const minutes = randInt(2, 8);
        const seconds = randInt(10, 59);
        const total = minutes * 60 + seconds;
        const other = total + pick([-25, -8, 8, 25]);
        const mark = compareMark(total, other);
        return {
          question: `跑步成績是 ${minutes} 分鐘 ${seconds} 秒，另一位選手用了 ${other} 秒，誰比較快？`,
          summary: mark === "<" ? "自己比較快" : mark === ">" ? "另一位選手比較快" : "兩人一樣快",
          detail: `把 ${minutes} 分鐘 ${seconds} 秒換成秒：${minutes} × 60 + ${seconds} = ${total} 秒。時間較短者較快，和 ${other} 秒相比，可知${mark === "<" ? "自己比較快" : mark === ">" ? "另一位選手比較快" : "兩人一樣快"}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "時間換算放進生活情境後，先判斷要換成哪個單位，再開始算。");
  }

  function buildDayHourAddSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const dayA = randInt(1, 12);
      const hourA = randInt(13, 23);
      const dayB = randInt(1, 12);
      const hourB = randInt(2, 18);
      const totalHours = hourA + hourB;
      const carryDay = Math.floor(totalHours / 24);
      const totalDay = dayA + dayB + carryDay;
      const remainHour = totalHours % 24;
      entries.push({
        question: `${dayA} 日 ${hourA} 小時 + ${dayB} 日 ${hourB} 小時 = （　）日（　）小時`,
        summary: formatDayHour(totalDay, remainHour),
        detail: `先加小時：${hourA} + ${hourB} = ${totalHours} 小時，滿 24 小時要進 1 日，所以變成 ${carryDay} 日 ${remainHour} 小時。再加日期：${dayA} + ${dayB} + ${carryDay} = ${totalDay} 日，所以答案是 ${totalDay} 日 ${remainHour} 小時。`,
      });
    }
    return createResult(entries, "日與時相加時，若小時滿 24，要換成 1 日再進位。");
  }

  function buildDayHourSubtractSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const dayB = randInt(1, 8);
      const hourB = randInt(8, 22);
      const remainDay = randInt(1, 10);
      const remainHour = randInt(1, 20);
      const totalHours = hourB + remainHour;
      const borrowDay = totalHours >= 24 ? 1 : 0;
      const hourA = totalHours - 24 * borrowDay;
      const dayA = dayB + remainDay + borrowDay;
      entries.push({
        question: `${dayA} 日 ${hourA} 小時 - ${dayB} 日 ${hourB} 小時 = （　）日（　）小時`,
        summary: formatDayHour(remainDay, remainHour),
        detail: `因為 ${hourA} 小時不夠減 ${hourB} 小時，向日借 1 日化成 24 小時後再算。小時部分得到 ${remainHour} 小時，日期部分得到 ${remainDay} 日，所以答案是 ${remainDay} 日 ${remainHour} 小時。`,
      });
    }
    return createResult(entries, "日與時相減時，若小時不夠減，要向日借 1 日，也就是借 24 小時。");
  }

  function buildHourMinuteAddSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const hourA = randInt(1, 8);
      const minuteA = randInt(15, 59);
      const hourB = randInt(1, 8);
      const minuteB = randInt(10, 59);
      const totalMinutes = minuteA + minuteB;
      const carry = Math.floor(totalMinutes / 60);
      const totalHours = hourA + hourB + carry;
      const remainMinutes = totalMinutes % 60;
      entries.push({
        question: `${hourA} 小時 ${minuteA} 分鐘 + ${hourB} 小時 ${minuteB} 分鐘 = （　）小時（　）分鐘`,
        summary: formatHourMinute(totalHours, remainMinutes),
        detail: `先加分鐘：${minuteA} + ${minuteB} = ${totalMinutes} 分鐘，滿 60 分鐘換成 ${carry} 小時 ${remainMinutes} 分鐘。再把小時相加：${hourA} + ${hourB} + ${carry} = ${totalHours} 小時，所以答案是 ${totalHours} 小時 ${remainMinutes} 分鐘。`,
      });
    }
    return createResult(entries, "時與分相加時，分鐘滿 60 要換成 1 小時再進位。");
  }

  function buildHourMinuteSubtractSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const hourB = randInt(1, 7);
      const minuteB = randInt(20, 59);
      const remainHour = randInt(1, 6);
      const remainMinute = randInt(5, 55);
      const minuteA = minuteB + remainMinute >= 60 ? minuteB + remainMinute - 60 : minuteB + remainMinute;
      const borrow = minuteB + remainMinute >= 60 ? 1 : 0;
      const hourA = hourB + remainHour + borrow;
      entries.push({
        question: `${hourA} 小時 ${minuteA} 分鐘 - ${hourB} 小時 ${minuteB} 分鐘 = （　）小時（　）分鐘`,
        summary: formatHourMinute(remainHour, remainMinute),
        detail: `因為 ${minuteA} 分鐘不夠減 ${minuteB} 分鐘，向小時借 1 小時化成 60 分鐘後再減。最後得到 ${remainHour} 小時 ${remainMinute} 分鐘。`,
      });
    }
    return createResult(entries, "時與分相減時，若分鐘不夠減，要向小時借 60 分鐘。");
  }

  function buildMinuteSecondArithmeticSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      if (Math.random() < 0.5) {
        const minuteA = randInt(10, 40);
        const secondA = randInt(15, 59);
        const minuteB = randInt(5, 35);
        const secondB = randInt(10, 59);
        const totalSeconds = secondA + secondB;
        const carry = Math.floor(totalSeconds / 60);
        const resultMinute = minuteA + minuteB + carry;
        const resultSecond = totalSeconds % 60;
        entries.push({
          question: `${minuteA} 分 ${secondA} 秒 + ${minuteB} 分 ${secondB} 秒 = （　）分（　）秒`,
          summary: `${resultMinute} 分 ${resultSecond} 秒`,
          detail: `先加秒：${secondA} + ${secondB} = ${totalSeconds} 秒，滿 60 秒進 1 分。再把分鐘一起加，得到 ${resultMinute} 分 ${resultSecond} 秒。`,
        });
      } else {
        const minuteB = randInt(5, 28);
        const secondB = randInt(20, 59);
        const remainMinute = randInt(1, 18);
        const remainSecond = randInt(5, 45);
        const secondA = secondB + remainSecond >= 60 ? secondB + remainSecond - 60 : secondB + remainSecond;
        const borrow = secondB + remainSecond >= 60 ? 1 : 0;
        const minuteA = minuteB + remainMinute + borrow;
        entries.push({
          question: `${minuteA} 分 ${secondA} 秒 - ${minuteB} 分 ${secondB} 秒 = （　）分（　）秒`,
          summary: `${remainMinute} 分 ${remainSecond} 秒`,
          detail: `因為 ${secondA} 秒不夠減 ${secondB} 秒，向分鐘借 60 秒後再算，得到 ${remainMinute} 分 ${remainSecond} 秒。`,
        });
      }
    }
    return createResult(entries, "分與秒的加減都要注意 60 進位或 60 借位。");
  }

  function buildElapsedSamePeriodSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const periodStart = pick([0, 12]);
      const startHour = periodStart + randInt(1, 9);
      const startMinute = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
      const duration = randInt(35, 170);
      const endTotal = startHour * 60 + startMinute + duration;
      if (Math.floor(endTotal / 60) >= periodStart + 12) {
        continue;
      }
      const endHour = Math.floor(endTotal / 60);
      const endMinute = endTotal % 60;
      entries.push({
        question: `從${formatAmPmTime(startHour, startMinute)}開始，到${formatAmPmTime(endHour, endMinute)}結束，共經過多久？`,
        summary: formatTimeDuration(duration),
        detail: `同在${periodStart === 0 ? "上午" : "下午"}，可直接用結束時刻減開始時刻：${formatAmPmTime(endHour, endMinute)} - ${formatAmPmTime(startHour, startMinute)} = ${formatTimeDuration(duration)}。`,
      });
    }
    return createResult(entries, "沒有跨中午或跨日的時刻題，可直接用結束時刻減開始時刻。");
  }

  function buildElapsedCrossNoonSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const startHour = randInt(7, 11);
      const startMinute = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
      const endHour = randInt(13, 17);
      const endMinute = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;
      const duration = endTotal - startTotal;
      entries.push({
        question: `從${formatAmPmTime(startHour, startMinute)}到${formatAmPmTime(endHour, endMinute)}，共經過多久？`,
        summary: formatTimeDuration(duration),
        detail: `先把下午時刻改成 24 時制較好算：${formatAmPmTime(endHour, endMinute)}就是 ${endHour} 時 ${endMinute} 分。再算 ${endHour} 時 ${endMinute} 分 - ${startHour} 時 ${startMinute} 分 = ${formatTimeDuration(duration)}。`,
      });
    }
    return createResult(entries, "跨中午的時刻題，先把下午時刻換成 24 時制，再做減法比較穩。");
  }

  function buildElapsedCrossDaySet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const startBase = randomMonthDay();
      const startDate = new Date(2026, startBase.month - 1, startBase.day, randInt(13, 22), pick([0, 8, 12, 15, 20, 24, 30, 32, 40, 45, 50]), 0);
      const durationHours = randInt(10, 46);
      const durationMinutes = pick([0, 12, 18, 24, 30, 36, 42, 48]);
      const endDate = new Date(startDate.getTime() + (durationHours * 60 + durationMinutes) * 60000);
      const durationText = formatHourMinute(durationHours, durationMinutes);
      entries.push({
        question: `從${formatMonthDayTime(startDate)}開始，到${formatMonthDayTime(endDate)}結束，共經過多久？`,
        summary: durationText,
        detail: `這是跨日題，可先算第一天剩下的時間，再加上隔天的時間；也可以直接用 24 小時作基準計算。最後共經過 ${durationText}。`,
      });
    }
    return createResult(entries, "跨日的經過時間題，可用「當天剩下的時間 + 隔天的時間」或直接用 24 小時基準來算。");
  }

  function buildElapsedSecondSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const hour = randInt(7, 20);
      const startMinute = randInt(0, 55);
      const startSecond = randInt(10, 55);
      const duration = randInt(40, 360);
      const startTotal = hour * 3600 + startMinute * 60 + startSecond;
      const endTotal = startTotal + duration;
      const endHour = Math.floor(endTotal / 3600);
      const endMinute = Math.floor((endTotal % 3600) / 60);
      const endSecond = endTotal % 60;
      entries.push({
        question: `從${formatAmPmTime(hour, startMinute, startSecond)}到${formatAmPmTime(endHour, endMinute, endSecond)}，共經過多久？`,
        summary: formatSecondDuration(duration),
        detail: `秒數不夠減時要向分鐘借 60 秒，分鐘不夠減時再向小時借 60 分鐘。算完共經過 ${formatSecondDuration(duration)}。`,
      });
    }
    return createResult(entries, "題目含秒時，退位仍然照 60 進位系統來處理。");
  }

  function buildScheduleElapsedSet(count = 3) {
    const entries = [];
    const templates = [
      { item: "402 次火車", origin: "臺北", dest: "花蓮" },
      { item: "知本客運", origin: "臺東", dest: "恆春" },
      { item: "高鐵列車", origin: "新竹", dest: "臺南" },
      { item: "爸爸的白木材", origin: "加工站", dest: "家裡" },
    ];
    while (entries.length < count) {
      const template = pick(templates);
      const startHour = randInt(6, 18);
      const startMinute = pick([0, 6, 12, 18, 24, 30, 36, 42, 48, 54]);
      const duration = randInt(35, 195);
      const endTotal = startHour * 60 + startMinute + duration;
      const endHour = Math.floor(endTotal / 60);
      const endMinute = endTotal % 60;
      entries.push({
        question: `${template.item}${formatClock24(startHour, startMinute)} 從${template.origin}出發，${formatClock24(endHour, endMinute)} 抵達${template.dest}，行駛時間多久？`,
        summary: formatTimeDuration(duration),
        detail: `用時刻表上的結束時刻減開始時刻：${formatClock24(endHour, endMinute)} - ${formatClock24(startHour, startMinute)} = ${formatTimeDuration(duration)}。`,
      });
    }
    return createResult(entries, "讀時刻表時，先找出發與到達時刻，再用減法求經過時間。");
  }

  function buildEndTimeSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const startHour = randInt(7, 17);
      const startMinute = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
      const duration = randInt(25, 220);
      const endTotal = startHour * 60 + startMinute + duration;
      if (Math.floor(endTotal / 60) >= 24) {
        continue;
      }
      const endHour = Math.floor(endTotal / 60);
      const endMinute = endTotal % 60;
      entries.push({
        question: `${formatAmPmTime(startHour, startMinute)}開始活動，經過${formatTimeDuration(duration)}後，結束時是幾時幾分？`,
        summary: formatAmPmTime(endHour, endMinute),
        detail: `開始時刻加上經過時間：${formatAmPmTime(startHour, startMinute)} + ${formatTimeDuration(duration)} = ${formatAmPmTime(endHour, endMinute)}。`,
      });
    }
    return createResult(entries, "求結束時刻時，用開始時刻加上經過時間，注意分鐘滿 60 要進位。");
  }

  function buildStartTimeSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const endHour = randInt(9, 20);
      const endMinute = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
      const duration = randInt(25, 220);
      const endTotal = endHour * 60 + endMinute;
      const startTotal = endTotal - duration;
      if (startTotal <= 0) {
        continue;
      }
      const startHour = Math.floor(startTotal / 60);
      const startMinute = startTotal % 60;
      entries.push({
        question: `活動在${formatAmPmTime(endHour, endMinute)}結束，活動共進行${formatTimeDuration(duration)}，開始時是幾時幾分？`,
        summary: formatAmPmTime(startHour, startMinute),
        detail: `開始時刻 = 結束時刻 - 經過時間，所以 ${formatAmPmTime(endHour, endMinute)} - ${formatTimeDuration(duration)} = ${formatAmPmTime(startHour, startMinute)}。`,
      });
    }
    return createResult(entries, "求開始時刻時，用結束時刻減去經過時間，注意退位。");
  }

  function buildCrossDayEndTimeSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const startBase = randomMonthDay();
      const startDate = new Date(2026, startBase.month - 1, startBase.day, randInt(7, 20), pick([0, 10, 20, 30, 40, 50]), 0);
      const durationHours = randInt(24, 72);
      const durationMinutes = pick([0, 10, 20, 30, 40, 50]);
      const endDate = new Date(startDate.getTime() + (durationHours * 60 + durationMinutes) * 60000);
      entries.push({
        question: `從${formatMonthDayTime(startDate)}開始，連續進行${formatHourMinute(durationHours, durationMinutes)}，會在什麼時候結束？`,
        summary: formatMonthDayTime(endDate),
        detail: `先把 ${formatHourMinute(durationHours, durationMinutes)} 拆成幾日幾小時，再從開始時刻一路往後推；最後會在 ${formatMonthDayTime(endDate)} 結束。`,
      });
    }
    return createResult(entries, "往後推算跨日時刻時，若小時超過 24，要換成隔日再繼續加。");
  }

  function buildCrossDayStartTimeSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const endBase = randomMonthDay();
      const endDate = new Date(2026, endBase.month - 1, endBase.day, randInt(7, 20), pick([0, 10, 20, 30, 40, 50]), 0);
      const durationHours = randInt(24, 72);
      const durationMinutes = pick([0, 10, 20, 30, 40, 50]);
      const startDate = new Date(endDate.getTime() - (durationHours * 60 + durationMinutes) * 60000);
      entries.push({
        question: `活動在${formatMonthDayTime(endDate)}結束，總共進行${formatHourMinute(durationHours, durationMinutes)}，是從什麼時候開始的？`,
        summary: formatMonthDayTime(startDate),
        detail: `這是往前推題：開始時刻 = 結束時刻 - 經過時間。跨日往前退時，要注意日期也要一起往前推，所以開始於 ${formatMonthDayTime(startDate)}。`,
      });
    }
    return createResult(entries, "往前推算跨日時刻時，不只要退時間，也要同步退日期。");
  }

  function buildDayHourCompareSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const hours = pick([48, 72, 80, 96, 120, 168, 220]);
        const parts = durationDaysHours(hours);
        return {
          question: `${hours} 小時，也可以說是幾日幾小時？`,
          summary: formatDayHour(parts.days, parts.hours),
          detail: `${hours} ÷ 24 = ${parts.days} 餘 ${parts.hours}，所以是 ${parts.days} 日 ${parts.hours} 小時。`,
        };
      },
      () => {
        const totalHours = pick([49, 60, 75, 108, 180]);
        const days = randInt(1, 6);
        const hours = randInt(0, 20);
        const otherHours = days * 24 + hours;
        const mark = compareMark(totalHours, otherHours);
        return {
          question: `${totalHours} 小時 和 ${days} 日 ${hours} 小時，哪一個時間比較長？`,
          summary: mark === ">" ? `${totalHours} 小時比較長` : mark === "<" ? `${days} 日 ${hours} 小時比較長` : "一樣長",
          detail: `把 ${days} 日 ${hours} 小時換成總小時：${days} × 24 + ${hours} = ${otherHours} 小時。比較 ${totalHours} 和 ${otherHours}，可知${mark === ">" ? `${totalHours} 小時比較長` : mark === "<" ? `${days} 日 ${hours} 小時比較長` : "一樣長"}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "幾日幾小時和總小時之間可互換，這是處理跨日時間的重要基礎。");
  }

  function buildCrossDayComprehensiveSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const start = new Date(2026, 4, 7, 7, 0, 0);
        const end = new Date(2026, 4, 11, 15, 0, 0);
        const durationHours = Math.floor((end - start) / 3600000);
        const parts = durationDaysHours(durationHours);
        return {
          question: `宜平參加環島旅行，5 月 7 日上午 7 時出發，5 月 11 日下午 3 時回到家，共出去了多久？`,
          summary: formatDayHour(parts.days, parts.hours),
          detail: `可先算 5 月 7 日上午 7 時到 5 月 11 日上午 7 時是 4 日，再加上上午 7 時到下午 3 時的 8 小時，所以共 ${formatDayHour(parts.days, parts.hours)}。`,
        };
      },
      () => {
        const start = new Date(2026, 8, 10, 9, 0, 0);
        const durationHours = 42;
        const end = new Date(start.getTime() + durationHours * 3600000);
        return {
          question: `製作醬油需發酵 42 小時，9 月 10 日上午 9 時開始，何時發酵完成？`,
          summary: formatMonthDayTime(end),
          detail: `42 小時 = 1 日 18 小時。從 9 月 10 日上午 9 時往後推 1 日到 9 月 11 日上午 9 時，再推 18 小時到 ${formatMonthDayTime(end)}。`,
        };
      },
      () => {
        const leaveTime = new Date(2026, 8, 20, 21, 0, 0);
        const durationHours = 26;
        const landTime = new Date(leaveTime.getTime() - durationHours * 3600000);
        return {
          question: `颱風滯留臺灣 26 小時，於 9 月 20 日下午 9 時離開，颱風何時登陸？`,
          summary: formatMonthDayTime(landTime),
          detail: `這是往前推題：登陸時刻 = 離開時刻 - 滯留時間。從 9 月 20 日下午 9 時往前回推 26 小時，可得登陸時間是 ${formatMonthDayTime(landTime)}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, "綜合應用題要先判斷是在做換算、求經過時間，還是往前往後推時刻。");
  }

  function buildTimeUnitMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "時間換算綜合：先判斷是換成單名數、複名數，還是先統一單位再比較。");
  }

  function buildTimeArithmeticMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "時間量加減綜合：注意 24 進位與 60 進位，先處理小單位。");
  }

  function buildElapsedTimeMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "經過時間綜合：先看有沒有跨中午、跨日或含秒，再決定算法。");
  }

  function buildTimePointMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "時刻推算綜合：開始時刻、結束時刻與經過時間三者之間要會互推。");
  }

  function buildCrossDayTimeMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, "跨日時間綜合：把日期與時間一起看，必要時先換成總小時再比較。");
  }

  store.registerConfigs({
    "e4-2-1-multiply-standard-drill": {
      type: "drill",
      title: "三、四位數乘以三位數",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildMultiplyStandardSet(3);
      },
    },
    "e4-2-1-multiply-zero-ending-drill": {
      type: "drill",
      title: "末幾位為 0 的乘法",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildMultiplyZeroEndingSet(3);
      },
    },
    "e4-2-1-divide-standard-drill": {
      type: "drill",
      title: "三、四位數除以三位數",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildDivideStandardSet(3);
      },
    },
    "e4-2-1-divide-zero-ending-drill": {
      type: "drill",
      title: "末幾位為 0 的除法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildDivideZeroEndingSet(3);
      },
    },
    "e4-2-1-word-problem-drill": {
      type: "drill",
      title: "乘除法生活應用",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildWordProblemSet(3);
      },
    },
    "e4-2-1-multiply-standard-mixed": {
      type: "drill",
      title: "三、四位數乘以三位數綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildMixedSet([buildMultiplyStandardSet], 5);
      },
    },
    "e4-2-1-multiply-zero-ending-mixed": {
      type: "drill",
      title: "末幾位為 0 的乘法綜合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildMixedSet([buildMultiplyZeroEndingSet], 5);
      },
    },
    "e4-2-1-divide-standard-mixed": {
      type: "drill",
      title: "三、四位數除以三位數綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildMixedSet([buildDivideStandardSet], 5);
      },
    },
    "e4-2-1-divide-zero-ending-mixed": {
      type: "drill",
      title: "末幾位為 0 的除法綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildMixedSet([buildDivideZeroEndingSet], 5);
      },
    },
    "e4-2-1-word-problem-mixed": {
      type: "drill",
      title: "多位數乘除生活應用綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildMixedSet([buildWordProblemSet], 5);
      },
    },
    "e4-2-3-exact-approx-judge-drill": {
      type: "drill",
      title: "概數與精確數判斷",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildExactApproxJudgeSet(3);
      },
    },
    "e4-2-3-ceil-estimate-drill": {
      type: "drill",
      title: "無條件進入法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildCeilEstimateSet(3);
      },
    },
    "e4-2-3-floor-estimate-drill": {
      type: "drill",
      title: "無條件捨去法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildFloorEstimateSet(3);
      },
    },
    "e4-2-3-round-nearest-reverse-drill": {
      type: "drill",
      title: "四捨五入與反推範圍",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildRoundNearestReverseSet(3);
      },
    },
    "e4-2-3-estimate-application-drill": {
      type: "drill",
      title: "概數估算應用",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildEstimateApplicationSet(3);
      },
    },
    "e4-2-3-exact-approx-judge-mixed": {
      type: "drill",
      title: "概數與精確數判斷綜合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildEstimateMixedSet([buildExactApproxJudgeSet], 5);
      },
    },
    "e4-2-3-ceil-estimate-mixed": {
      type: "drill",
      title: "無條件進入法綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildEstimateMixedSet([buildCeilEstimateSet], 5);
      },
    },
    "e4-2-3-floor-estimate-mixed": {
      type: "drill",
      title: "無條件捨去法綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildEstimateMixedSet([buildFloorEstimateSet], 5);
      },
    },
    "e4-2-3-round-nearest-reverse-mixed": {
      type: "drill",
      title: "四捨五入與反推範圍綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildEstimateMixedSet([buildRoundNearestReverseSet], 5);
      },
    },
    "e4-2-3-estimate-application-mixed": {
      type: "drill",
      title: "概數估算應用綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildEstimateMixedSet([buildEstimateApplicationSet], 5);
      },
    },
    "e4-2-4-pattern-sequence-drill": {
      type: "drill",
      title: "圖形週期與鋪排預測",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildPatternSequenceSet(3);
      },
    },
    "e4-2-4-number-table-drill": {
      type: "drill",
      title: "數字表格與百數表規律",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildNumberTablePatternSet(3);
      },
    },
    "e4-2-4-calendar-pattern-drill": {
      type: "drill",
      title: "月曆日期規律",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildCalendarPatternSet(3);
      },
    },
    "e4-2-4-parity-digit-drill": {
      type: "drill",
      title: "奇偶運算與數字卡",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildParityDigitSet(3);
      },
    },
    "e4-2-4-seat-number-drill": {
      type: "drill",
      title: "座位門牌與週期編號",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildSeatNumberPatternSet(3);
      },
    },
    "e4-2-4-pattern-sequence-mixed": {
      type: "drill",
      title: "圖形週期與鋪排預測綜合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildQuantityPatternMixedSet([buildPatternSequenceSet], 5);
      },
    },
    "e4-2-4-number-table-mixed": {
      type: "drill",
      title: "數字表格與百數表規律綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildQuantityPatternMixedSet([buildNumberTablePatternSet], 5);
      },
    },
    "e4-2-4-calendar-pattern-mixed": {
      type: "drill",
      title: "月曆日期規律綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildQuantityPatternMixedSet([buildCalendarPatternSet], 5);
      },
    },
    "e4-2-4-parity-digit-mixed": {
      type: "drill",
      title: "奇偶運算與數字卡綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildQuantityPatternMixedSet([buildParityDigitSet], 5);
      },
    },
    "e4-2-4-seat-number-mixed": {
      type: "drill",
      title: "座位門牌與週期編號綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildQuantityPatternMixedSet([buildSeatNumberPatternSet], 5);
      },
    },
    "e4-2-5-decimal-multiply-basic-drill": {
      type: "drill",
      title: "小數乘整數直式",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildDecimalMultiplyBasicSet(3);
      },
    },
    "e4-2-5-decimal-zero-ending-drill": {
      type: "drill",
      title: "末位 0 與整十整百乘法",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildDecimalZeroEndingSet(3);
      },
    },
    "e4-2-5-decimal-single-step-word-drill": {
      type: "drill",
      title: "小數乘法生活單步題",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildDecimalSingleStepWordSet(3);
      },
    },
    "e4-2-5-decimal-two-step-word-drill": {
      type: "drill",
      title: "兩步驟小數乘法應用",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildDecimalTwoStepWordSet(3);
      },
    },
    "e4-2-5-decimal-concept-drill": {
      type: "drill",
      title: "小數數線與分數換算",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildDecimalConceptSet(3);
      },
    },
    "e4-2-5-decimal-multiply-basic-mixed": {
      type: "drill",
      title: "小數乘整數直式綜合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildDecimalMultiplyMixedSet([buildDecimalMultiplyBasicSet], 5);
      },
    },
    "e4-2-5-decimal-zero-ending-mixed": {
      type: "drill",
      title: "末位 0 與整十整百乘法綜合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildDecimalMultiplyMixedSet([buildDecimalZeroEndingSet], 5);
      },
    },
    "e4-2-5-decimal-single-step-word-mixed": {
      type: "drill",
      title: "小數乘法生活單步題綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildDecimalMultiplyMixedSet([buildDecimalSingleStepWordSet], 5);
      },
    },
    "e4-2-5-decimal-two-step-word-mixed": {
      type: "drill",
      title: "兩步驟小數乘法應用綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildDecimalMultiplyMixedSet([buildDecimalTwoStepWordSet], 5);
      },
    },
    "e4-2-5-decimal-concept-mixed": {
      type: "drill",
      title: "小數數線與分數換算綜合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildDecimalMultiplyMixedSet([buildDecimalConceptSet], 5);
      },
    },
    "e4-2-7-equivalent-integer-drill": {
      type: "drill",
      title: "與整數相等的等值分數",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildEquivalentIntegerFractionSet(3);
      },
    },
    "e4-2-7-expand-equivalent-drill": {
      type: "drill",
      title: "分數擴分填空",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildEquivalentFractionExpandSet(3);
      },
    },
    "e4-2-7-discrete-context-drill": {
      type: "drill",
      title: "離散量情境的等值分數",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildDiscreteEquivalentFractionSet(3);
      },
    },
    "e4-2-7-decimal-conversion-drill": {
      type: "drill",
      title: "分數與小數互換",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildFractionDecimalConversionSet(3);
      },
    },
    "e4-2-7-fraction-decimal-compare-drill": {
      type: "drill",
      title: "分數、小數與異分母比較",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildFractionDecimalCompareSet(3);
      },
    },
    "e4-2-7-number-line-drill": {
      type: "drill",
      title: "分數數線讀取與位移",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildFractionNumberLineSet(3);
      },
    },
    "e4-2-7-equivalent-basic-mixed": {
      type: "drill",
      title: "等值分數基本概念綜合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildEquivalentFractionMixedSet([buildEquivalentIntegerFractionSet, buildEquivalentFractionExpandSet], 5);
      },
    },
    "e4-2-7-discrete-context-mixed": {
      type: "drill",
      title: "離散量等值分數綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildEquivalentFractionMixedSet([buildDiscreteEquivalentFractionSet], 5);
      },
    },
    "e4-2-7-decimal-conversion-mixed": {
      type: "drill",
      title: "分數小數互換綜合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildEquivalentFractionMixedSet([buildFractionDecimalConversionSet], 5);
      },
    },
    "e4-2-7-fraction-decimal-compare-mixed": {
      type: "drill",
      title: "分數小數比較綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildEquivalentFractionMixedSet([buildFractionDecimalCompareSet], 5);
      },
    },
    "e4-2-7-number-line-mixed": {
      type: "drill",
      title: "分數數線綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildEquivalentFractionMixedSet([buildFractionNumberLineSet], 5);
      },
    },
    "e4-1-2-place-value-by-one-digit-drill": {
      type: "drill",
      title: "整十整百整千乘一位數",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildE412PlaceValueByOneDigitSet(3);
      },
    },
    "e4-1-2-tens-times-tens-drill": {
      type: "drill",
      title: "整十乘整十",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildE412TensTimesTensSet(3);
      },
    },
    "e4-1-2-three-digit-times-tens-drill": {
      type: "drill",
      title: "三位數乘整十",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildE412ThreeDigitTimesTensSet(3);
      },
    },
    "e4-1-2-four-digit-times-one-digit-drill": {
      type: "drill",
      title: "四位數乘一位數",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildE412FourDigitTimesOneDigitSet(3);
      },
    },
    "e4-1-2-two-digit-times-two-digit-no-carry-drill": {
      type: "drill",
      title: "二位數乘二位數不進位",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildE412TwoDigitTimesTwoDigitNoCarrySet(3);
      },
    },
    "e4-1-2-two-digit-times-two-digit-carry-drill": {
      type: "drill",
      title: "二位數乘二位數進位",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildE412TwoDigitTimesTwoDigitCarrySet(3);
      },
    },
    "e4-1-2-three-digit-times-two-digit-drill": {
      type: "drill",
      title: "三位數乘二位數",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildE412ThreeDigitTimesTwoDigitSet(3);
      },
    },
    "e4-1-2-zero-containing-drill": {
      type: "drill",
      title: "含 0 的整數乘法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildE412ZeroContainingSet(3);
      },
    },
    "e4-1-2-four-digit-times-two-digit-drill": {
      type: "drill",
      title: "四位數乘二位數",
      difficulty: "hard",
      questionCount: 3,
      generate() {
        return buildE412FourDigitTimesTwoDigitSet(3);
      },
    },
    "e4-1-2-trailing-zero-product-drill": {
      type: "drill",
      title: "末尾有 0 的整數乘法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildE412TrailingZeroProductSet(3);
      },
    },
    "e4-1-2-near-known-product-drill": {
      type: "drill",
      title: "已知乘積的前後項推理",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildE412NearKnownProductSet(3);
      },
    },
    "e4-1-2-round-number-adjustment-drill": {
      type: "drill",
      title: "接近整十整百整千的調整乘法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildE412RoundNumberAdjustmentSet(3);
      },
    },
    "e4-1-2-basic-place-value-mixed": {
      type: "drill",
      title: "基礎位值乘法混合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildE412BasicPlaceValueMixedSet([
          buildE412PlaceValueByOneDigitSet,
          buildE412TensTimesTensSet,
          buildE412ThreeDigitTimesTensSet,
        ], 5);
      },
    },
    "e4-1-2-column-basic-mixed": {
      type: "drill",
      title: "直式乘法基礎混合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildE412ColumnBasicMixedSet([
          buildE412FourDigitTimesOneDigitSet,
          buildE412TwoDigitTimesTwoDigitNoCarrySet,
          buildE412TwoDigitTimesTwoDigitCarrySet,
        ], 5);
      },
    },
    "e4-1-2-large-multiplication-mixed": {
      type: "drill",
      title: "多位數乘法混合",
      difficulty: "hard",
      questionCount: 5,
      generate() {
        return buildE412LargeMultiplicationMixedSet([
          buildE412ThreeDigitTimesTwoDigitSet,
          buildE412ZeroContainingSet,
          buildE412FourDigitTimesTwoDigitSet,
        ], 5);
      },
    },
    "e4-1-2-zero-handling-mixed": {
      type: "drill",
      title: "含 0 乘法混合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildE412ZeroHandlingMixedSet([
          buildE412ZeroContainingSet,
          buildE412TrailingZeroProductSet,
        ], 5);
      },
    },
    "e4-1-2-reasoning-mixed": {
      type: "drill",
      title: "乘法數感推理混合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildE412ReasoningMixedSet([
          buildE412NearKnownProductSet,
          buildE412RoundNumberAdjustmentSet,
        ], 5);
      },
    },
    "e4-2-8-consecutive-addition-drill": {
      type: "drill",
      title: "連加的簡化",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildConsecutiveAdditionSet(3);
      },
    },
    "e4-2-8-subtraction-reorder-drill": {
      type: "drill",
      title: "連減的簡化：先減好減的數",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildSubtractionReorderSet(3);
      },
    },
    "e4-2-8-subtraction-group-drill": {
      type: "drill",
      title: "連減的簡化：減去兩數之和",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildSubtractionGroupSet(3);
      },
    },
    "e4-2-8-add-sub-mixed-drill": {
      type: "drill",
      title: "加減混合的簡化",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildAddSubMixedSet(3);
      },
    },
    "e4-2-8-add-sub-application-drill": {
      type: "drill",
      title: "加減法的生活應用",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildAddSubApplicationSet(3);
      },
    },
    "e4-2-8-multiply-round-drill": {
      type: "drill",
      title: "連乘的簡化：湊整十整百",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildMultiplyRoundSet(3);
      },
    },
    "e4-2-8-multiply-special-drill": {
      type: "drill",
      title: "特殊組合的應用",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildMultiplySpecialSet(3);
      },
    },
    "e4-2-8-mul-div-first-divide-drill": {
      type: "drill",
      title: "乘除混合的簡化：先除再乘",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildMulDivFirstDivideSet(3);
      },
    },
    "e4-2-8-multiply-application-drill": {
      type: "drill",
      title: "連乘的生活應用",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildMultiplyApplicationSet(3);
      },
    },
    "e4-2-8-mul-div-application-drill": {
      type: "drill",
      title: "乘除法的生活應用",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildMulDivApplicationSet(3);
      },
    },
    "e4-2-8-consecutive-addition-mixed": {
      type: "drill",
      title: "連加的簡化綜合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildSimplifyCalculationMixedSet([buildConsecutiveAdditionSet], 5);
      },
    },
    "e4-2-8-subtraction-shortcut-mixed": {
      type: "drill",
      title: "連減的簡化綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildSimplifyCalculationMixedSet([buildSubtractionReorderSet, buildSubtractionGroupSet], 5);
      },
    },
    "e4-2-8-add-sub-shortcut-mixed": {
      type: "drill",
      title: "加減混合與生活應用綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildSimplifyCalculationMixedSet([buildAddSubMixedSet, buildAddSubApplicationSet], 5);
      },
    },
    "e4-2-8-multiply-shortcut-mixed": {
      type: "drill",
      title: "連乘與特殊組合綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildSimplifyCalculationMixedSet([buildMultiplyRoundSet, buildMultiplySpecialSet], 5);
      },
    },
    "e4-2-8-mul-div-application-mixed": {
      type: "drill",
      title: "乘除混合與生活應用綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildSimplifyCalculationMixedSet([buildMulDivFirstDivideSet, buildMultiplyApplicationSet, buildMulDivApplicationSet], 5);
      },
    },
    "e4-2-9-compound-to-single-drill": {
      type: "drill",
      title: "複名數換單名數",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildTimeCompoundToSingleSet(3);
      },
    },
    "e4-2-9-single-to-compound-drill": {
      type: "drill",
      title: "單名數換複名數",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildTimeSingleToCompoundSet(3);
      },
    },
    "e4-2-9-compare-drill": {
      type: "drill",
      title: "時間長短比較",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildTimeCompareSet(3);
      },
    },
    "e4-2-9-cross-unit-drill": {
      type: "drill",
      title: "跨階單位換算",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildTimeCrossUnitSet(3);
      },
    },
    "e4-2-9-conversion-application-drill": {
      type: "drill",
      title: "時間換算生活應用",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildTimeConversionApplicationSet(3);
      },
    },
    "e4-2-9-day-hour-add-drill": {
      type: "drill",
      title: "日與時的加法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildDayHourAddSet(3);
      },
    },
    "e4-2-9-day-hour-subtract-drill": {
      type: "drill",
      title: "日與時的減法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildDayHourSubtractSet(3);
      },
    },
    "e4-2-9-hour-minute-add-drill": {
      type: "drill",
      title: "時與分的加法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildHourMinuteAddSet(3);
      },
    },
    "e4-2-9-hour-minute-subtract-drill": {
      type: "drill",
      title: "時與分的減法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildHourMinuteSubtractSet(3);
      },
    },
    "e4-2-9-minute-second-arithmetic-drill": {
      type: "drill",
      title: "分與秒的綜合加減法",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildMinuteSecondArithmeticSet(3);
      },
    },
    "e4-2-9-elapsed-same-period-drill": {
      type: "drill",
      title: "同在上午或下午的時刻計算",
      difficulty: "easy",
      questionCount: 3,
      generate() {
        return buildElapsedSamePeriodSet(3);
      },
    },
    "e4-2-9-elapsed-cross-noon-drill": {
      type: "drill",
      title: "跨越中午的時刻計算",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildElapsedCrossNoonSet(3);
      },
    },
    "e4-2-9-elapsed-cross-day-drill": {
      type: "drill",
      title: "跨越凌晨的時刻計算",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildElapsedCrossDaySet(3);
      },
    },
    "e4-2-9-elapsed-second-drill": {
      type: "drill",
      title: "包含秒的精確時間計算",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildElapsedSecondSet(3);
      },
    },
    "e4-2-9-schedule-elapsed-drill": {
      type: "drill",
      title: "時刻表讀取與經過時間",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildScheduleElapsedSet(3);
      },
    },
    "e4-2-9-end-time-drill": {
      type: "drill",
      title: "計算結束時刻",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildEndTimeSet(3);
      },
    },
    "e4-2-9-start-time-drill": {
      type: "drill",
      title: "計算開始時刻",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildStartTimeSet(3);
      },
    },
    "e4-2-9-cross-day-end-time-drill": {
      type: "drill",
      title: "跨日計算結束時刻",
      difficulty: "hard",
      questionCount: 3,
      generate() {
        return buildCrossDayEndTimeSet(3);
      },
    },
    "e4-2-9-cross-day-start-time-drill": {
      type: "drill",
      title: "跨日計算開始時刻",
      difficulty: "hard",
      questionCount: 3,
      generate() {
        return buildCrossDayStartTimeSet(3);
      },
    },
    "e4-2-9-day-hour-compare-drill": {
      type: "drill",
      title: "跨日時間量互換與比較",
      difficulty: "medium",
      questionCount: 3,
      generate() {
        return buildDayHourCompareSet(3);
      },
    },
    "e4-2-9-cross-day-comprehensive-drill": {
      type: "drill",
      title: "跨日綜合生活應用",
      difficulty: "hard",
      questionCount: 3,
      generate() {
        return buildCrossDayComprehensiveSet(3);
      },
    },
    "e4-2-9-unit-conversion-mixed": {
      type: "drill",
      title: "時間換算綜合",
      difficulty: "easy",
      questionCount: 5,
      generate() {
        return buildTimeUnitMixedSet([buildTimeCompoundToSingleSet, buildTimeSingleToCompoundSet, buildTimeCompareSet, buildTimeCrossUnitSet, buildTimeConversionApplicationSet], 5);
      },
    },
    "e4-2-9-time-quantity-arithmetic-mixed": {
      type: "drill",
      title: "時間量加減綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildTimeArithmeticMixedSet([buildDayHourAddSet, buildDayHourSubtractSet, buildHourMinuteAddSet, buildHourMinuteSubtractSet, buildMinuteSecondArithmeticSet], 5);
      },
    },
    "e4-2-9-elapsed-time-mixed": {
      type: "drill",
      title: "經過時間綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildElapsedTimeMixedSet([buildElapsedSamePeriodSet, buildElapsedCrossNoonSet, buildElapsedCrossDaySet, buildElapsedSecondSet, buildScheduleElapsedSet], 5);
      },
    },
    "e4-2-9-time-point-inference-mixed": {
      type: "drill",
      title: "時刻推算綜合",
      difficulty: "medium",
      questionCount: 5,
      generate() {
        return buildTimePointMixedSet([buildEndTimeSet, buildStartTimeSet], 5);
      },
    },
    "e4-2-9-cross-day-advanced-mixed": {
      type: "drill",
      title: "跨日時間與綜合應用",
      difficulty: "hard",
      questionCount: 5,
      generate() {
        return buildCrossDayTimeMixedSet([buildCrossDayEndTimeSet, buildCrossDayStartTimeSet, buildDayHourCompareSet, buildCrossDayComprehensiveSet], 5);
      },
    },
  });
})();
