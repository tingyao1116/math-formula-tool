(() => {
  const store = window.formulaPracticeStore;
  if (!store || typeof store.registerConfigs !== 'function') {
    console.warn('formulaPracticeStore.registerConfigs is required before loading e4 practice generators');
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

  function createResult(entries, intro = '') {
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
      summary: String(summaryAnswers[index] || '').replace(/^簡答：/, ''),
      detail: String(answers[index] || '').replace(/^詳解：/, ''),
    }));
  }

  function trailingZeroCount(value) {
    const match = String(Math.abs(value)).match(/0+$/);
    return match ? match[0].length : 0;
  }

  function formatDivisionSummary(quotient, remainder) {
    return remainder ? `商 ${quotient}，餘 ${remainder}` : `${quotient}`;
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
    return createResult(entries, '三、四位數乘以三位數：注意每一層部分積要和正確位值對齊。');
  }

  function buildMultiplyZeroEndingSet(count = 3) {
    const entries = [];
    const multipliers = [20, 30, 40, 50, 60, 70, 80, 90, 200, 300, 400, 500, 600, 700, 800, 900];
    while (entries.length < count) {
      const a = pick([randInt(12, 98) * 100, randInt(100, 980) * 10, randInt(2, 9) * 1000]);
      const b = pick(multipliers);
      const aCore = Number(String(a).replace(/0+$/, ''));
      const bCore = Number(String(b).replace(/0+$/, ''));
      const zeroCount = (String(a).match(/0+$/)?.[0].length || 0) + (String(b).match(/0+$/)?.[0].length || 0);
      const coreProduct = aCore * bCore;
      const product = a * b;
      entries.push({
        question: `先用末位 0 之前的數字相乘，再補 0：${a} × ${b} = （　）。`,
        summary: `${product}`,
        detail: `先算 ${aCore} × ${bCore} = ${coreProduct}，兩個乘數末尾共有 ${zeroCount} 個 0，所以在 ${coreProduct} 後面補 ${zeroCount} 個 0，得到 ${product}。`,
      });
    }
    return createResult(entries, '末幾位為 0 的乘法：先忽略末尾的 0 計算，再補回相同個數的 0。');
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
        detail: `先估商 ${quotient}，${divisor} × ${quotient} = ${divisor * quotient}。${dividend} - ${divisor * quotient} = ${remainder}，${remainder < divisor ? '餘數小於除數，答案正確' : '餘數還要再調整'}，所以商是 ${quotient}${remainder ? `，餘數是 ${remainder}` : ''}。`,
      });
    }
    return createResult(entries, '三、四位數除以三位數：估商後要檢查「除數 × 商 + 餘數」是否等於被除數。');
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
        detail: `被除數和除數末尾都有 2 個 0，可先同時刪掉 2 個 0，變成 ${simplifiedDividend} ÷ ${simplifiedDivisor}。商是 ${quotient}${remainder ? `，簡化後餘 ${remainder / 100}，要補回 2 個 0，所以原式餘 ${remainder}` : ''}。`,
      });
    }
    return createResult(entries, '末幾位為 0 的除法：被除數與除數可同時刪掉相同個數的 0，但有餘數時要補回刪掉的 0。');
  }

  function buildWordProblemSet(count = 3) {
    const factories = [
      () => {
        const item = pick(['鳳梨酥', '筆記本', '運動水壺', '故事書']);
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
        const item = pick(['紅茶', '牛奶', '礦泉水', '果汁']);
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
        const item = pick(['彈珠', '積木', '糖果', '貼紙']);
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
        const item = pick(['鉛筆盒', '玩具車', '模型', '餐盒']);
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
    return createResult(
      Array.from({ length: count }, () => pick(factories)()),
      '生活應用：先判斷要用乘法求總量，還是用除法求可分成幾組與剩多少。'
    );
  }

  function buildMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '綜合練習：每題都會換數字，請先判斷是乘法、除法，或需要處理末尾 0。');
  }

  const E411_SMALL_UNITS = ['', '十', '百', '千'];
  const E411_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const E411_PLACE_UNITS = [
    { label: '個', value: 1 },
    { label: '十', value: 10 },
    { label: '百', value: 100 },
    { label: '千', value: 1000 },
    { label: '萬', value: 10000 },
    { label: '十萬', value: 100000 },
    { label: '百萬', value: 1000000 },
    { label: '千萬', value: 10000000 },
  ];

  function e411ToChineseBelow10000(value) {
    if (value === 0) return '';
    let text = '';
    const digits = String(value).padStart(4, '0').split('').map(Number);
    digits.forEach((digit, index) => {
      const place = 3 - index;
      if (digit === 0) {
        if (text && !text.endsWith('零') && digits.slice(index + 1).some((next) => next !== 0)) {
          text += '零';
        }
        return;
      }
      if (!(digit === 1 && place === 1 && !text)) {
        text += E411_DIGITS[digit];
      }
      text += E411_SMALL_UNITS[place];
    });
    return text.replace(/零+$/u, '');
  }

  function e411ToChinese(value) {
    if (value === 0) return '零';
    const high = Math.floor(value / 10000);
    const low = value % 10000;
    let text = '';
    if (high > 0) {
      text += `${e411ToChineseBelow10000(high)}萬`;
      if (low > 0 && low < 1000) {
        text += '零';
      }
    }
    if (low > 0) {
      text += e411ToChineseBelow10000(low);
    }
    return text;
  }

  function buildE411ArabicChineseConversionSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const value = randInt(10001, 99999999);
      const chinese = e411ToChinese(value);
      if (!chinese || !/[萬]/u.test(chinese)) continue;
      if (Math.random() < 0.5) {
        entries.push({
          question: `把阿拉伯數字 ${formatNumber(value)} 寫成中文讀法。`,
          summary: `${chinese}`,
          detail: `${formatNumber(value)} 依位值分成「萬」和個位群，寫成 ${chinese}。`,
        });
      } else {
        entries.push({
          question: `把中文讀法「${chinese}」寫成阿拉伯數字。`,
          summary: `${formatNumber(value)}`,
          detail: `先判斷「萬」前後各是多少，再合成阿拉伯數字，所以是 ${formatNumber(value)}。`,
        });
      }
    }
    return createResult(entries, '先分清楚萬位前後兩群，再處理零要不要補。');
  }

  function buildE411ZeroReadingWritingSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const high = randInt(1, 9999);
      const low = pick([randInt(1, 999), randInt(1000, 9999)]);
      const value = high * 10000 + low;
      if (!String(value).includes('0')) continue;
      const chinese = e411ToChinese(value);
      entries.push({
        question: `請寫出 ${formatNumber(value)} 的中文讀法，並注意零怎麼讀。`,
        summary: `${chinese}`,
        detail: `${formatNumber(value)} 中間缺位時，要用一個「零」把位值接起來，所以讀作 ${chinese}。`,
      });
    }
    return createResult(entries, '零不是看到幾個就念幾次，而是用來接前後位值。');
  }

  function buildE411PlaceValueDecompositionSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const mode = randInt(0, 2);
      if (mode === 0) {
        const value = randInt(10000, 99999999);
        const digits = String(value);
        const index = randInt(0, digits.length - 1);
        const digit = Number(digits[index]);
        if (digit === 0) continue;
        const placeValue = 10 ** (digits.length - 1 - index);
        const unitLabel = E411_PLACE_UNITS.find((unit) => unit.value === placeValue)?.label || '';
        entries.push({
          question: `在 ${formatNumber(value)} 中，數字 ${digit} 在什麼位？表示多少？`,
          summary: `${unitLabel}位，表示 ${formatNumber(digit * placeValue)}`,
          detail: `${digit} 在${unitLabel}位，所以代表 ${digit} × ${formatNumber(placeValue)} = ${formatNumber(digit * placeValue)}。`,
        });
      } else if (mode === 1) {
        const bigUnit = pick(E411_PLACE_UNITS.slice(4));
        const smallUnit = pick(E411_PLACE_UNITS.slice(0, 4));
        const bigCount = randInt(2, 9);
        const smallCount = randInt(1, 9);
        const value = bigCount * bigUnit.value + smallCount * smallUnit.value;
        entries.push({
          question: `${bigCount} 個${bigUnit.label}和 ${smallCount} 個${smallUnit.label}合起來是多少？`,
          summary: `${formatNumber(value)}`,
          detail: `${bigCount} 個${bigUnit.label}是 ${formatNumber(bigCount * bigUnit.value)}，${smallCount} 個${smallUnit.label}是 ${formatNumber(smallCount * smallUnit.value)}，合起來是 ${formatNumber(value)}。`,
        });
      } else {
        const value = randInt(10000, 99999999);
        const tenThousands = Math.floor(value / 10000);
        const remainder = value % 10000;
        entries.push({
          question: `${formatNumber(value)} 可以看成幾個萬和多少？`,
          summary: `${tenThousands} 個萬，餘 ${formatNumber(remainder)}`,
          detail: `${formatNumber(value)} = ${tenThousands} × 10000 + ${formatNumber(remainder)}，所以是 ${tenThousands} 個萬，餘 ${formatNumber(remainder)}。`,
        });
      }
    }
    return createResult(entries, '位值題先看數字站在哪一位，再決定它代表多少。');
  }

  function buildE411UnitConversionSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      if (Math.random() < 0.5) {
        const unitIndex = randInt(4, 7);
        const bigUnit = E411_PLACE_UNITS[unitIndex];
        const smallUnit = E411_PLACE_UNITS[unitIndex - 1];
        const amount = randInt(2, 9);
        const converted = (amount * bigUnit.value) / smallUnit.value;
        entries.push({
          question: `${amount} 個${bigUnit.label}合起來是多少個${smallUnit.label}？`,
          summary: `${formatNumber(converted)} 個${smallUnit.label}`,
          detail: `1 個${bigUnit.label} = ${bigUnit.value / smallUnit.value} 個${smallUnit.label}，所以 ${amount} 個${bigUnit.label}共有 ${formatNumber(converted)} 個${smallUnit.label}。`,
        });
      } else {
        const high = randInt(1, 99);
        const low = randInt(1, 9999);
        const value = high * 10000 + low;
        entries.push({
          question: `${formatNumber(value)} = （　）萬（　）`,
          summary: `${high} 萬 ${formatNumber(low)}`,
          detail: `${formatNumber(value)} = ${high} × 10000 + ${formatNumber(low)}，所以可以寫成 ${high} 萬 ${formatNumber(low)}。`,
        });
      }
    }
    return createResult(entries, '看到化聚時，先抓 10 個下一級會進成 1 個上一級。');
  }

  function buildE411SequencePatternSet(count = 3) {
    const entries = [];
    const steps = [10, 100, 1000, 10000];
    while (entries.length < count) {
      const start = randInt(1, 80) * pick([10, 100, 1000]);
      const step = pick(steps);
      const values = Array.from({ length: 5 }, (_, index) => start + step * index);
      const blankIndex = randInt(1, 3);
      const answer = values[blankIndex];
      const display = values.map((value, index) => (index === blankIndex ? '（　）' : formatNumber(value)));
      entries.push({
        question: `找出規律並填空：${display.join('、')}`,
        summary: `${formatNumber(answer)}`,
        detail: `前後都相差 ${formatNumber(step)}，所以空格應填 ${formatNumber(answer)}。`,
      });
    }
    return createResult(entries, '先看每次是加十、加百、加千還是加萬。');
  }

  function buildE411NumberComparisonSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const a = randInt(10000, 99999999);
      const b = randInt(10000, 99999999);
      if (a === b) continue;
      const symbol = a > b ? '>' : '<';
      entries.push({
        question: `比較大小：${formatNumber(a)} □ ${formatNumber(b)}`,
        summary: `${symbol}`,
        detail: `由最高位開始比，先出現較大數字的那個數就比較大，所以應填 ${symbol}。`,
      });
    }
    return createResult(entries, '比較大數時，要由左到右逐位比較。');
  }

  function buildE411InequalityDigitSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const totalDigits = pick([6, 7, 8]);
      const template = Array.from({ length: totalDigits }, (_, index) =>
        String(index === 0 ? randInt(1, 9) : randInt(0, 9))
      );
      const blankIndex = randInt(1, totalDigits - 2);
      template[blankIndex] = '□';
      const candidates = [];
      for (let digit = 0; digit <= 9; digit += 1) {
        const current = template.slice();
        current[blankIndex] = String(digit);
        candidates.push({
          digit,
          value: Number(current.join('')),
        });
      }
      const sorted = candidates.slice().sort((a, b) => a.value - b.value);
      const pivot = randInt(1, sorted.length - 2);
      const comparator = Math.random() < 0.5 ? '>' : '<';
      const threshold = sorted[pivot].value;
      const digits = candidates
        .filter((item) => (comparator === '>' ? item.value > threshold : item.value < threshold))
        .map((item) => item.digit);
      if (!digits.length || digits.length === 10) continue;
      const questionText = template.join('');
      entries.push({
        question: `${questionText} ${comparator} ${formatNumber(threshold)}，□ 裡可以填哪些數字？`,
        summary: `${digits.join('、')}`,
        detail: `把 0 到 9 代入空格後，和 ${formatNumber(threshold)} 比較，符合 ${comparator} 條件的數字是 ${digits.join('、')}。`,
      });
    }
    return createResult(entries, '不等式填數題先看決勝位，再找哪些數字會跨過門檻。');
  }

  function buildE411DigitAdjustmentSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const cards = shuffle(['0', '3', '4', '6', '7', '8']);
      const maxValue = Number(
        cards
          .slice()
          .sort((a, b) => Number(b) - Number(a))
          .join('')
      );
      const minDigits = cards.slice().sort((a, b) => Number(a) - Number(b));
      const firstNonZero = minDigits.findIndex((digit) => digit !== '0');
      [minDigits[0], minDigits[firstNonZero]] = [minDigits[firstNonZero], minDigits[0]];
      const minValue = Number(minDigits.join(''));
      entries.push({
        question: `用數字卡 ${cards.join('、')} 各用一次，排出最大的六位數和最小的六位數。`,
        summary: `最大 ${formatNumber(maxValue)}，最小 ${formatNumber(minValue)}`,
        detail: `最大數把大數字放左邊；最小數把小數字放左邊，但首位不能是 0，所以是最大 ${formatNumber(maxValue)}、最小 ${formatNumber(minValue)}。`,
      });
    }
    return createResult(entries, '排最小數時，最小的非 0 數字要先站到首位。');
  }

  function buildE411LargeAddSubtractSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const a = randInt(100000, 9999999);
      const b = randInt(10000, 999999);
      if (Math.random() < 0.5) {
        entries.push({
          question: `計算：${formatNumber(a)} + ${formatNumber(b)} = （　）`,
          summary: `${formatNumber(a + b)}`,
          detail: `依位值對齊後相加，可得 ${formatNumber(a + b)}。`,
        });
      } else {
        if (a <= b) continue;
        entries.push({
          question: `計算：${formatNumber(a)} - ${formatNumber(b)} = （　）`,
          summary: `${formatNumber(a - b)}`,
          detail: `依位值對齊後相減，必要時借位，得到 ${formatNumber(a - b)}。`,
        });
      }
    }
    return createResult(entries, '大數直式先位值對齊，再處理進位或退位。');
  }

  function buildE411MixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '一億以內的數綜合練習：先判斷是讀寫、位值、化聚、比較，還是大數加減。');
  }

  function buildE413ProtractorReadingSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const useInner = Math.random() < 0.5;
      const start = pick([0, 20, 30, 40, 50, 90, 120]);
      const end = pick([25, 35, 48, 60, 75, 85, 95, 115, 135, 160, 175]);
      const angle = Math.abs(end - start);
      if (angle <= 0 || angle > 180) continue;
      entries.push({
        question: `量角器${useInner ? '內圈' : '外圈'}從 ${start}° 讀到 ${end}°，這個角是幾度？`,
        summary: `${angle}°`,
        detail: `同一圈刻度要用同一套讀法，角度是終點 ${end}° 減起點 ${start}°，所以是 ${angle}°。`,
      });
    }
    return createResult(entries, '量角器題先看內圈或外圈，再做終點減起點。');
  }

  function buildE413AngleClassificationSet(count = 3) {
    const entries = [];
    const bank = [
      { angle: pick([25, 40, 48, 75, 89]), name: '銳角', reason: '小於 90°' },
      { angle: 90, name: '直角', reason: '等於 90°' },
      { angle: pick([100, 115, 135, 160, 175]), name: '鈍角', reason: '大於 90° 且小於 180°' },
      { angle: 180, name: '平角', reason: '等於 180°' },
      { angle: 360, name: '周角', reason: '等於 360°' },
    ];
    while (entries.length < count) {
      const item = pick(bank);
      entries.push({
        question: `${item.angle}° 是什麼角？`,
        summary: `${item.name}`,
        detail: `${item.angle}° ${item.reason}，所以是${item.name}。`,
      });
    }
    return createResult(entries, '角度分類先抓 90°、180°、360° 這三個分界。');
  }

  function buildE413AngleCompositionSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const mode = randInt(0, 2);
      if (mode === 0) {
        const a = pick([15, 24, 31, 45, 51, 55, 72]);
        const b = pick([18, 26, 34, 40, 75]);
        entries.push({
          question: `兩個角分別是 ${a}° 和 ${b}°，合起來是幾度？`,
          summary: `${a + b}°`,
          detail: `${a}° + ${b}° = ${a + b}°。`,
        });
      } else if (mode === 1) {
        const part = pick([24, 28, 34, 41, 56]);
        entries.push({
          question: `一個直角是 90°，其中一個角是 ${part}°，另一個角是幾度？`,
          summary: `${90 - part}°`,
          detail: `直角是 90°，所以另一個角 = 90° - ${part}° = ${90 - part}°。`,
        });
      } else {
        const part = pick([45, 62, 80, 95, 125]);
        entries.push({
          question: `一個平角是 180°，其中一個角是 ${part}°，另一個角是幾度？`,
          summary: `${180 - part}°`,
          detail: `平角是 180°，所以另一個角 = 180° - ${part}° = ${180 - part}°。`,
        });
      }
    }
    return createResult(entries, '看到直角就想到 90°，看到平角就想到 180°。');
  }

  function buildE413RotationSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const start = pick([0, 15, 30, 45, 60, 90, 120, 150]);
      const first = pick([20, 35, 45, 60, 75, 90, 120]);
      const second = pick([15, 25, 40, 55, 65, 80]);
      const clockwise = Math.random() < 0.5;
      const middle = modPositive(start + first, 360);
      const finalAngle = modPositive(middle + (clockwise ? -second : second), 360);
      entries.push({
        question: `從 ${start}° 開始，先逆時針轉 ${first}°，再${clockwise ? '順時針' : '逆時針'}轉 ${second}°，最後停在幾度？`,
        summary: `${finalAngle}°`,
        detail: `先轉到 ${middle}°，再${clockwise ? '減掉' : '加上'} ${second}°，得到 ${finalAngle}°。`,
      });
    }
    return createResult(entries, '旋轉題先分清楚順時針是減、逆時針是加。');
  }

  function buildE413ClockAngleSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const start = randInt(1, 12);
      let end = randInt(1, 12);
      if (end === start) end = (end % 12) + 1;
      const clockwise = Math.random() < 0.5;
      const steps = clockwise ? modPositive(end - start, 12) : modPositive(start - end, 12);
      const angle = steps * 30;
      entries.push({
        question: `時鐘指針從數字 ${start} ${clockwise ? '順時針' : '逆時針'}轉到數字 ${end}，轉了幾度？`,
        summary: `${angle}°`,
        detail: `時鐘相鄰兩數字相差 30°，共跨 ${steps} 格，所以是 ${steps} × 30° = ${angle}°。`,
      });
    }
    return createResult(entries, '時鐘題先數跨了幾格，再乘上每格 30°。');
  }

  function buildE413MixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '角度綜合練習：先判斷是報讀、分類、合成分解、旋轉，還是鐘面角度。');
  }

  const estimatePlaces = [
    { label: '十位', unit: 10 },
    { label: '百位', unit: 100 },
    { label: '千位', unit: 1000 },
    { label: '萬位', unit: 10000 },
  ];

  function formatNumber(value) {
    return Number(value).toLocaleString('zh-Hant');
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
        summary: askApprox ? '概數' : '精確數',
        detail: askApprox
          ? `句子中使用「大約、約」描述接近的數量，不要求完全正確，所以是概數。`
          : `句子描述可以直接計數或實際記錄的數量，所以是精確數。`,
      });
    }
    return createResult(entries, '概數常用於估計與描述大約數量；精確數用於需要確定數量的情境。');
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
          question: `一件商品 ${formatNumber(price)} 元，若只用${unit === 100 ? '百元' : '千元'}鈔票付款，至少要付幾張？`,
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
    return createResult(entries, '無條件進入法：只要剩下的量仍需要一個完整單位，就要往上取概數。');
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
          question: `一件商品原價 ${formatNumber(price)} 元，特價只算到${unit === 100 ? '百元' : '千元'}，應付多少元？`,
          summary: `${formatNumber(sale)} 元`,
          detail: `特價「只算到${unit === 100 ? '百元' : '千元'}」表示不足 ${unit} 元的部分捨去，${formatNumber(price)} 取到${unit === 100 ? '百位' : '千位'}為 ${formatNumber(sale)}。`,
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
    return createResult(entries, '無條件捨去法：只計算完整單位，剩下不足一個單位的部分不列入答案。');
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
        const place = pick([
          { label: '百位', unit: 100 },
          { label: '千位', unit: 1000 },
        ]);
        const target = randInt(10, 95) * place.unit;
        const range = getIntegerRangeForNearest(target, place.unit);
        const candidates = shuffle([
          randInt(range.min, range.max),
          range.min - randInt(1, Math.floor(place.unit / 3)),
          range.max + randInt(1, Math.floor(place.unit / 3)),
        ]);
        return {
          question: `下列哪些數用四捨五入法取概數到${place.label}會得到 ${formatNumber(target)}？（${candidates.map(formatNumber).join('、')}）`,
          summary: candidates
            .filter((value) => value >= range.min && value <= range.max)
            .map(formatNumber)
            .join('、'),
          detail: `能取成 ${formatNumber(target)} 的原數範圍是 ${formatNumber(range.min)}～${formatNumber(range.max)}，所以只選落在這個範圍內的數。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '四捨五入法：先看指定位數的下一位；反推時要找能取成同一個概數的整段範圍。');
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
          question: `先取概數到${unit === 1000 ? '千位' : '萬位'}，估算 ${formatNumber(a)} 比 ${formatNumber(b)} 大約多多少？`,
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
          question: `把 ${formatNumber(total)} 先取概數到${unit === 10000 ? '萬位' : '千位'}，再估算平均分成 ${divisor} 份，每份大約是多少？`,
          summary: `約 ${formatNumber(estimate)}`,
          detail: `${formatNumber(total)} 約 ${formatNumber(roundNearestTo(total, unit))}，再用 ${formatNumber(roundNearestTo(total, unit))} ÷ ${divisor} 估算，每份約 ${formatNumber(estimate)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '估算應用：先依題意選擇合適的取概數方法與位值，再進行加、減、乘、除。');
  }

  function buildEstimateMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '概數綜合練習：先判斷情境需要精確數、進入、捨去、四捨五入或估算。');
  }

  function formatDecimalByScale(value, scale) {
    const fixed = (value / scale).toFixed(scale === 100 ? 2 : 1);
    return fixed.replace(/\.0$/, '').replace(/(\.\d)0$/, '$1');
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

  function formatHundredths(raw) {
    return formatDecimalByScale(raw, 100);
  }

  function formatHundredthsFixed(raw) {
    return (raw / 100).toFixed(2);
  }

  function formatTenths(raw) {
    return formatDecimalByScale(raw, 10);
  }

  function randomHundredths(minRaw = 10, maxRaw = 9999) {
    return randInt(minRaw, maxRaw);
  }

  function randomOneDecimal(minRaw = 1, maxRaw = 999) {
    return randInt(minRaw, maxRaw);
  }

  function buildE417DecimalMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '小數加減要先看位值，再決定是直接對齊計算、先補 0，還是先整理題意後再算。');
  }

  function buildE417DecimalAddSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const left = randomHundredths(35, 3200);
      const right = randomHundredths(25, 3200);
      const sum = left + right;
      const carryTenths = Math.floor((left % 100) / 10) + Math.floor((right % 100) / 10) >= 10;
      const carryHundredths = (left % 10) + (right % 10) >= 10;
      if (!carryTenths && !carryHundredths) continue;
      entries.push({
        question: `用直式計算：${formatHundredths(left)} + ${formatHundredths(right)} = （ ）`,
        summary: `${formatHundredths(sum)}`,
        detail: `先把小數點對齊，再從最右邊開始相加。${formatHundredths(left)} + ${formatHundredths(right)} = ${formatHundredths(sum)}。`,
      });
    }
    return createResult(entries, '二位小數加法要把小數點對齊，從百分位往左加，遇到滿 10 就要進位。');
  }

  function buildE417DecimalAddMissingPlaceSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const leftRaw = randInt(100, 2599);
      const rightDigits = Math.random() < 0.5 ? 1 : 2;
      const rightRaw = rightDigits === 1 ? randInt(11, 199) * 10 : randInt(25, 899);
      const sum = leftRaw + rightRaw;
      entries.push({
        question: `先對齊位值再計算：${formatHundredths(leftRaw)} + ${formatHundredths(rightRaw)} = （ ）`,
        summary: `${formatHundredths(sum)}`,
        detail: `先把小數點對齊，不夠的位數要補 0。例如可把 ${formatHundredths(rightRaw)} 看成 ${formatHundredthsFixed(rightRaw)} 再對齊。算得 ${formatHundredths(leftRaw)} + ${formatHundredths(rightRaw)} = ${formatHundredths(sum)}。`,
      });
    }
    return createResult(entries, '缺位的小數加法，關鍵不是補在右邊還是左邊亂補，而是先對齊小數點，不夠的位數再補 0。');
  }

  function buildE417DecimalSubtractSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const right = randomHundredths(15, 3600);
      const diff = randomHundredths(10, 2800);
      const left = right + diff;
      if (left > 9999) continue;
      const borrowTenths = Math.floor((left % 100) / 10) < Math.floor((right % 100) / 10);
      const borrowHundredths = left % 10 < right % 10;
      if (!borrowTenths && !borrowHundredths) continue;
      entries.push({
        question: `用直式計算：${formatHundredths(left)} − ${formatHundredths(right)} = （ ）`,
        summary: `${formatHundredths(diff)}`,
        detail: `先把小數點對齊，再從最右邊開始減；不夠減時要向左借 1。${formatHundredths(left)} − ${formatHundredths(right)} = ${formatHundredths(diff)}。`,
      });
    }
    return createResult(entries, '二位小數減法要先對齊小數點，遇到某一位不夠減時，要向左一位借 1。');
  }

  function buildE417IntegerDecimalSubtractSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const integer = pick([4, 5, 6, 8, 10, 12, 14, 16, 20, 100]);
        const rightRaw = randInt(15, integer * 100 - 1);
        const leftRaw = integer * 100;
        const diff = leftRaw - rightRaw;
        return {
          question: `先補 0 再計算：${integer} − ${formatHundredths(rightRaw)} = （ ）`,
          summary: `${formatHundredths(diff)}`,
          detail: `先把整數 ${integer} 看成 ${integer}.00，再和 ${formatHundredthsFixed(rightRaw)} 對齊計算。${integer}.00 − ${formatHundredthsFixed(rightRaw)} = ${formatHundredths(diff)}。`,
        };
      },
      () => {
        const leftRaw = randInt(40, 250) * 10;
        const rightRaw = randInt(105, leftRaw - 5);
        const diff = leftRaw - rightRaw;
        return {
          question: `先對齊位值再計算：${formatHundredths(leftRaw)} − ${formatHundredths(rightRaw)} = （ ）`,
          summary: `${formatHundredths(diff)}`,
          detail: `${formatHundredths(leftRaw)} 可以看成 ${formatHundredthsFixed(leftRaw)}，和 ${formatHundredthsFixed(rightRaw)} 對齊後再減。答案是 ${formatHundredths(diff)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '整數或缺位小數做減法時，可以先改寫成位數一致的形式，例如把 16 看成 16.00。');
  }

  function buildE417DecimalSumWordSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const left = randInt(80, 450);
        const right = randInt(80, 450);
        const sum = left + right;
        return {
          question: `水果重量：一盒草莓重 ${formatHundredths(left)} 公斤，一盒櫻桃重 ${formatHundredths(right)} 公斤，各買一盒共重幾公斤？`,
          summary: `${formatHundredths(sum)} 公斤`,
          detail: `總重量就是兩盒重量相加：${formatHundredths(left)} + ${formatHundredths(right)} = ${formatHundredths(sum)} 公斤。`,
        };
      },
      () => {
        const left = randInt(20, 180);
        const right = randInt(120, 480);
        const sum = left + right;
        return {
          question: `飲料混合：把 ${formatHundredths(left)} 公升的果汁和 ${formatHundredths(right)} 公升的茶混合，共有幾公升？`,
          summary: `${formatHundredths(sum)} 公升`,
          detail: `總容量用加法：${formatHundredths(left)} + ${formatHundredths(right)} = ${formatHundredths(sum)} 公升。`,
        };
      },
      () => {
        const left = randInt(150, 1200);
        const right = randInt(50, 420);
        const sum = left + right;
        return {
          question: `彩帶總長：藍色彩帶長 ${formatHundredths(left)} 公尺，紅色彩帶比藍色長 ${formatHundredths(right)} 公尺，紅色彩帶長幾公尺？`,
          summary: `${formatHundredths(sum)} 公尺`,
          detail: `已知比藍色長 ${formatHundredths(right)} 公尺，所以紅色彩帶長 ${formatHundredths(left)} + ${formatHundredths(right)} = ${formatHundredths(sum)} 公尺。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '看到「共多少、合起來多少、比原來多多少」這一類小數應用題，通常先想加法。');
  }

  function buildE417DecimalDifferenceWordSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const left = randInt(200, 500);
        const right = randInt(50, left - 10);
        const diff = left - right;
        return {
          question: `剩下多少：一包綠豆重 ${formatHundredths(left)} 公斤，用掉 ${formatHundredths(right)} 公斤後，還剩幾公斤？`,
          summary: `${formatHundredths(diff)} 公斤`,
          detail: `剩下的量用減法：${formatHundredths(left)} − ${formatHundredths(right)} = ${formatHundredths(diff)} 公斤。`,
        };
      },
      () => {
        const left = randInt(120, 260);
        const right = randInt(20, left - 5);
        const diff = left - right;
        return {
          question: `相差多少：甲瓶有 ${formatHundredths(left)} 公升，乙瓶比甲瓶少 ${formatHundredths(right)} 公升，乙瓶有幾公升？`,
          summary: `${formatHundredths(diff)} 公升`,
          detail: `乙瓶比甲瓶少 ${formatHundredths(right)} 公升，所以用減法：${formatHundredths(left)} − ${formatHundredths(right)} = ${formatHundredths(diff)} 公升。`,
        };
      },
      () => {
        const total = randInt(100, 200);
        const used = randInt(10, total - 10);
        const diff = total - used;
        return {
          question: `找回金額：原有 ${formatHundredths(total)} 公升的油漆，用掉 ${formatHundredths(used)} 公升後，還剩幾公升？`,
          summary: `${formatHundredths(diff)} 公升`,
          detail: `剩餘量就是總量減用掉的量：${formatHundredths(total)} − ${formatHundredths(used)} = ${formatHundredths(diff)} 公升。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '看到「還剩多少、少多少、相差多少」時，要先判斷誰比較多，再用小數減法。');
  }

  function buildE417DecimalCompareApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const light = randInt(800, 2500);
        const diff = randInt(50, 600);
        const heavy = light + diff;
        return {
          question: `較輕的重量：小華重 ${formatHundredths(heavy)} 公斤，弟弟比他輕 ${formatHundredths(diff)} 公斤，弟弟重幾公斤？`,
          summary: `${formatHundredths(light)} 公斤`,
          detail: `已知較重的量和相差量，要求較輕的量，要用減法：${formatHundredths(heavy)} − ${formatHundredths(diff)} = ${formatHundredths(light)} 公斤。`,
        };
      },
      () => {
        const short = randInt(600, 1800);
        const diff = randInt(20, 320);
        const long = short + diff;
        return {
          question: `較短的長度：紅色彩帶長 ${formatHundredths(long)} 公尺，比藍色彩帶長 ${formatHundredths(diff)} 公尺，藍色彩帶長幾公尺？`,
          summary: `${formatHundredths(short)} 公尺`,
          detail: `藍色彩帶比紅色短 ${formatHundredths(diff)} 公尺，所以要用 ${formatHundredths(long)} − ${formatHundredths(diff)} = ${formatHundredths(short)} 公尺。`,
        };
      },
      () => {
        const need = randInt(100, 300);
        const bought = randInt(10, need - 5);
        const remain = need - bought;
        return {
          question: `還需要多少：姐姐想買 1 公斤糖果，已經買了 ${formatHundredths(bought)} 公斤，還需要幾公斤？`,
          summary: `${formatHundredths(remain)} 公斤`,
          detail: `1 公斤就是 1.00 公斤，所以還需要 1.00 − ${formatHundredths(bought)} = ${formatHundredths(remain)} 公斤。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '已知一個量和相差量，要先判斷未知量是較大還是較小，再決定用加法還是減法。');
  }

  function buildE417DecimalTwoStepWordSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const first = randInt(120, 450);
        const second = randInt(120, 450);
        const join = randInt(5, 80);
        const total = first + second + join;
        return {
          question: `彩帶接合：長 ${formatHundredths(first)} 公尺和 ${formatHundredths(second)} 公尺的彩帶接在一起，接縫處重疊 ${formatHundredths(join)} 公尺，接好後全長幾公尺？`,
          summary: `${formatHundredths(first + second - join)} 公尺`,
          detail: `先算兩條彩帶總長：${formatHundredths(first)} + ${formatHundredths(second)} = ${formatHundredths(first + second)}。接縫重疊 ${formatHundredths(join)} 公尺，所以實際全長是 ${formatHundredths(first + second)} − ${formatHundredths(join)} = ${formatHundredths(first + second - join)} 公尺。`,
        };
      },
      () => {
        const start = randInt(80, 220);
        const used = randInt(10, start - 5);
        const bought = randInt(120, 450);
        const total = start - used + bought;
        return {
          question: `先減後加：原本有 ${formatHundredths(start)} 公尺白緞帶，用掉 ${formatHundredths(used)} 公尺後，又買了 ${formatHundredths(bought)} 公尺，現在共有幾公尺？`,
          summary: `${formatHundredths(total)} 公尺`,
          detail: `先算用掉後剩多少：${formatHundredths(start)} − ${formatHundredths(used)} = ${formatHundredths(start - used)}。再加上新買的：${formatHundredths(start - used)} + ${formatHundredths(bought)} = ${formatHundredths(total)} 公尺。`,
        };
      },
      () => {
        const a = randInt(90, 220);
        const b = randInt(90, 220);
        const c = randInt(90, 220);
        const total = a + b + c;
        return {
          question: `多項總和：媽媽買了牛肉 ${formatHundredths(a)} 公斤、豬肉 ${formatHundredths(b)} 公斤和雞肉 ${formatHundredths(c)} 公斤，共重幾公斤？`,
          summary: `${formatHundredths(total)} 公斤`,
          detail: `把三個重量相加：${formatHundredths(a)} + ${formatHundredths(b)} + ${formatHundredths(c)} = ${formatHundredths(total)} 公斤。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '兩步驟小數應用題要先判斷是先加後減、先減後加，還是先把多個量合起來。');
  }

  function buildE417DecimalUnitConversionSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const cm = pick([128, 156, 178, 198, 235, 304, 378, 815]);
        const meterRaw = randInt(101, 320);
        const diff = cm - meterRaw;
        return {
          question: `單位換算後比較：${cm} 公分和 ${formatHundredths(meterRaw)} 公尺相差幾公尺？`,
          summary: `${formatHundredths(Math.abs(diff))} 公尺`,
          detail: `先把 ${cm} 公分換成公尺，是 ${formatHundredths(cm)} 公尺。再算 ${formatHundredths(Math.max(cm, meterRaw))} − ${formatHundredths(Math.min(cm, meterRaw))} = ${formatHundredths(Math.abs(diff))} 公尺。`,
        };
      },
      () => {
        const meterRaw = randInt(101, 280);
        const usedCm = pick([25, 40, 56, 75, 90]);
        const total = meterRaw + usedCm;
        return {
          question: `公尺換公分：一段繩子長 ${formatHundredths(meterRaw)} 公尺，再接上 ${usedCm} 公分後，共長幾公尺？`,
          summary: `${formatHundredths(total)} 公尺`,
          detail: `${usedCm} 公分 = ${formatHundredths(usedCm)} 公尺，所以總長是 ${formatHundredths(meterRaw)} + ${formatHundredths(usedCm)} = ${formatHundredths(total)} 公尺。`,
        };
      },
      () => {
        const meter = randInt(1, 9);
        const cm = pick([3, 7, 9, 12, 25, 45]);
        return {
          question: `填成小數：${meter} 公尺 ${cm} 公分，用小數表示是幾公尺？`,
          summary: `${formatHundredths(meter * 100 + cm)} 公尺`,
          detail: `${cm} 公分 = ${formatHundredths(cm)} 公尺，所以 ${meter} 公尺 ${cm} 公分 = ${meter} + ${formatHundredths(cm)} = ${formatHundredths(meter * 100 + cm)} 公尺。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '公尺和公分混合時，要先換成同一單位再做小數加減，最常見是把公分換成公尺。');
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
    return createResult(entries, '小數乘整數：先照整數乘法計算，再依被乘數的小數位數點上小數點。');
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
    return createResult(entries, '末位 0 的整數乘法：可利用 10 倍、100 倍的位值變化，也要注意最後的小數點位置。');
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
    return createResult(entries, '小數乘法生活題：先找出單位量，再乘上數量求總量。');
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
    return createResult(entries, '兩步驟應用題：常見順序是先乘再加、先乘再減，先把每一步代表的意思寫清楚。');
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
          detail: `分母是 ${denominator}，表示把 ${numerator} 個 ${denominator === 10 ? '十分之一' : '百分之一'} 合起來，所以是 ${formatDecimalByScale(numerator, scale)}。`,
        };
      },
      () => {
        const leftRaw = randInt(1, 250);
        const rightRaw = randInt(1, 250);
        const left = formatDecimalByScale(leftRaw, 100);
        const right = formatDecimalByScale(rightRaw, 100);
        const sign = leftRaw > rightRaw ? '>' : leftRaw < rightRaw ? '<' : '=';
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
          question: `小點從 ${start.text} 的位置往${goRight ? '右' : '左'}移動 ${move.text}，會到什麼位置？`,
          summary: `${formatDecimalByScale(resultRaw, 10)}`,
          detail: `數線上往右是加，往左是減，所以 ${start.text} ${goRight ? '+' : '-'} ${move.text} = ${formatDecimalByScale(resultRaw, 10)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(
      entries,
      '小數概念輔助：數線、分數換小數與大小比較，都能幫助學生檢查小數乘法的小數點位置是否合理。'
    );
  }

  function buildDecimalMultiplyMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '小數乘法綜合練習：先判斷小數位數，再決定是單步乘法、兩步驟應用或小數概念題。');
  }

  function buildPatternSequenceSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const pattern = pick([
          ['灰色', '白色', '白色'],
          ['圓形', '方形', '圓形', '三角形'],
          ['星星', '月亮', '太陽'],
          ['紅色', '藍色', '綠色', '藍色'],
        ]);
        const n = randInt(9, 60);
        const answer = pattern[(n - 1) % pattern.length];
        return {
          question: `一排圖案依照「${pattern.join('、')}」重複排列，第 ${n} 個圖案是什麼？`,
          summary: answer,
          detail: `每 ${pattern.length} 個圖案為一組。${n} ÷ ${pattern.length} 的餘數是 ${n % pattern.length}，餘數 0 代表一組的最後一個；所以第 ${n} 個是「${answer}」。`,
        };
      },
      () => {
        const row = randInt(4, 12);
        const col = randInt(4, 12);
        const options = pick([
          ['淺色', '深色'],
          ['圓形', '方形'],
          ['紅色', '黃色'],
        ]);
        const answer = options[(row + col) % 2];
        return {
          question: `棋盤式鋪排中，若第 1 列第 1 格是「${options[0]}」，相鄰上下左右都交替成另一種圖案，則第 ${row} 列第 ${col} 格是什麼？`,
          summary: answer,
          detail: `同一格往右或往下移動 1 格都會換一次圖案。第 ${row} 列第 ${col} 格相當於移動 ${row - 1 + (col - 1)} 次，${row - 1 + (col - 1)} 是 ${(row - 1 + (col - 1)) % 2 === 0 ? '偶數' : '奇數'}，所以答案是「${answer}」。`,
        };
      },
      () => {
        const directions = ['上', '右', '下', '左'];
        const start = randInt(0, 3);
        const n = randInt(8, 40);
        const answer = directions[(start + n - 1) % 4];
        return {
          question: `一張箭頭圖卡從「${directions[start]}」開始，每次順時針旋轉 90 度後再排下一張，第 ${n} 張箭頭朝哪個方向？`,
          summary: answer,
          detail: `方向每 4 張循環一次，順序是「上、右、下、左」。從「${directions[start]}」開始數第 ${n} 張，位置為 ${((start + n - 1) % 4) + 1}，所以箭頭朝「${answer}」。`,
        };
      },
      () => {
        const pattern = pick([
          ['A', 'B', 'C'],
          ['紅', '藍', '藍', '黃'],
          ['○', '□', '△', '□'],
        ]);
        const target = pick(pattern);
        const total = randInt(24, 72);
        const fullGroups = Math.floor(total / pattern.length);
        const remainder = total % pattern.length;
        const perGroup = pattern.filter((item) => item === target).length;
        const extra = pattern.slice(0, remainder).filter((item) => item === target).length;
        const answer = fullGroups * perGroup + extra;
        return {
          question: `圖案依照「${pattern.join('、')}」重複排列，前 ${total} 個圖案中共有幾個「${target}」？`,
          summary: `${answer} 個`,
          detail: `每 ${pattern.length} 個為一組，每組有 ${perGroup} 個「${target}」。${total} ÷ ${pattern.length} = ${fullGroups} 餘 ${remainder}，前 ${remainder} 個中另有 ${extra} 個「${target}」，所以共有 ${fullGroups} × ${perGroup} + ${extra} = ${answer} 個。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '圖形週期與鋪排預測：把圖案轉成一組固定循環，再用餘數判斷位置或數量。');
  }

  function buildNumberTablePatternSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const moves = [
          { name: '正下方', delta: 10 },
          { name: '正上方', delta: -10 },
          { name: '右邊一格', delta: 1 },
          { name: '左邊一格', delta: -1 },
          { name: '右下方斜角', delta: 11 },
          { name: '左下方斜角', delta: 9 },
        ];
        const move = pick(moves);
        const n = randInt(22, 78);
        const answer = n + move.delta;
        return {
          question: `在百數表中，已知某格是 ${n}，它的${move.name}是幾？`,
          summary: `${answer}`,
          detail: `百數表往右加 1，往下加 10。${move.name}的變化量是 ${move.delta > 0 ? `+${move.delta}` : move.delta}，所以 ${n} ${move.delta > 0 ? '+' : '-'} ${Math.abs(move.delta)} = ${answer}。`,
        };
      },
      () => {
        const start = randInt(2, 6) * 10 + randInt(1, 6);
        const blanks = [
          { label: '右下角', delta: 11 },
          { label: '左下角', delta: 9 },
          { label: '下方第二格', delta: 20 },
          { label: '右邊第三格', delta: 3 },
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
          question: `一列數字是 ${numbers.join('、')}。觀察規律，這一列的數除以 ${divisor} 時，餘數都是幾？`,
          summary: `${remainder}`,
          detail: `相鄰兩數都相差 ${divisor}，所以除以 ${divisor} 的餘數相同。以 ${numbers[0]} 來看，${numbers[0]} ÷ ${divisor} 的餘數是 ${remainder}，因此整列餘數都是 ${remainder}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '數字表格與百數表規律：掌握左右差 1、上下差 10、斜角差 9 或 11。');
  }

  function buildCalendarPatternSet(count = 3) {
    const entries = [];
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
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
    return createResult(entries, '月曆日期規律：同一星期幾相差 7 天，跨日期推算時要用餘數思考。');
  }

  function buildParityDigitSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const operations = [
          { symbol: '+', rule: (a, b) => (a + b) % 2 },
          { symbol: '-', rule: (a, b) => modPositive(a - b, 2) },
          { symbol: '×', rule: (a, b) => (a * b) % 2 },
        ];
        const op = pick(operations);
        const a = randInt(1000, 9999);
        const b = randInt(100, 9999);
        const parity = op.rule(a, b) === 0 ? '偶數' : '奇數';
        return {
          question: `不用精算，判斷 ${a} ${op.symbol} ${b} 的結果是奇數還是偶數？`,
          summary: parity,
          detail: `${a} 是${a % 2 === 0 ? '偶數' : '奇數'}，${b} 是${b % 2 === 0 ? '偶數' : '奇數'}。依奇偶運算規律，結果是${parity}。`,
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
        const answer = Number([...front, last].join(''));
        return {
          question: `用數字卡 ${digits.join('、')} 各一次，排出最大的五位${wantOdd ? '奇數' : '偶數'}是多少？`,
          summary: `${answer}`,
          detail: `${wantOdd ? '奇數' : '偶數'}的個位數必須是${wantOdd ? '奇數' : '偶數'}。為了讓數最大，前面位數盡量由大到小排列，個位放符合條件且盡量小的 ${last}，所以最大數是 ${answer}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '奇偶運算與數字卡：先看個位數判斷奇偶，再用位值大小安排數字卡。');
  }

  function buildSeatNumberPatternSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const n = randInt(12, 80);
        const pattern = ['靠窗', '走道', '走道', '靠窗'];
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
        const side = number % 2 === 1 ? '左邊' : '右邊';
        return {
          question: `某條路的門牌規律是左邊單號、右邊雙號，${number} 號在馬路的哪一邊？`,
          summary: side,
          detail: `${number} 是${number % 2 === 1 ? '單數' : '雙數'}，單號在左邊、雙號在右邊，所以 ${number} 號在${side}。`,
        };
      },
      () => {
        const start = pick([1, 2, 3, 4]);
        const step = pick([3, 4, 5]);
        const number = start + step * randInt(6, 25);
        const isInPattern = Math.random() < 0.65;
        const query = isInPattern ? number : number + randInt(1, step - 1);
        const answer = (query - start) % step === 0 ? '是' : '不是';
        return {
          question: `遊覽車座位編號 ${start}、${start + step}、${start + step * 2}、${start + step * 3}、…… 都是靠窗座位，${query} 號是靠窗座位嗎？`,
          summary: answer,
          detail: `靠窗座位每次增加 ${step}。檢查 ${query} - ${start} = ${query - start}，${query - start} ${answer === '是' ? '可以' : '不可以'}被 ${step} 整除，所以答案是「${answer}」。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '座位門牌與週期編號：先找出循環長度或單雙號規律，再判斷指定編號的位置。');
  }

  function buildQuantityPatternMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '數量規律綜合練習：把題目轉成週期、餘數、加減規律或奇偶規律來判斷。');
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
    return `$\\frac{${numerator}}{${denominator}}$`;
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
    return whole > 0
      ? `${whole} ${fractionText(simpleNumerator, simpleDenominator)}`
      : fractionText(simpleNumerator, simpleDenominator);
  }

  function decimalText(value) {
    return Number(value.toFixed(2)).toString();
  }

  function compareSymbol(leftNumerator, leftDenominator, rightNumerator, rightDenominator) {
    const left = leftNumerator * rightDenominator;
    const right = rightNumerator * leftDenominator;
    return left > right ? '>' : left < right ? '<' : '=';
  }

  function improperToWholeRemainder(numerator, denominator) {
    return {
      whole: Math.floor(numerator / denominator),
      remainder: numerator % denominator,
    };
  }

  function mixedToImproper(whole, numerator, denominator) {
    return whole * denominator + numerator;
  }

  function fractionOrMixedText(numerator, denominator) {
    const [simpleNumerator, simpleDenominator] = simplifyFraction(numerator, denominator);
    return mixedFractionText(simpleNumerator, simpleDenominator);
  }

  function buildE419FractionMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(
      entries,
      '分數題要先看題目在考哪一件事：換算、比較、同分母加減、分數乘整數，或把情境翻成分數。'
    );
  }

  function buildE419ImproperMixedSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = randInt(2, 12);
        const whole = randInt(2, 8);
        const remainder = randInt(1, denominator - 1);
        const numerator = whole * denominator + remainder;
        return {
          question: `將假分數 ${fractionText(numerator, denominator)} 化成帶分數或整數。`,
          summary: `${mixedFractionText(numerator, denominator)}`,
          detail: `${numerator} ÷ ${denominator} = ${whole} 餘 ${remainder}，所以 ${fractionText(numerator, denominator)} = ${mixedFractionText(numerator, denominator)}。`,
        };
      },
      () => {
        const denominator = randInt(2, 10);
        const whole = randInt(2, 9);
        const numerator = whole * denominator;
        return {
          question: `將假分數 ${fractionText(numerator, denominator)} 化成帶分數或整數。`,
          summary: `${whole}`,
          detail: `${numerator} ÷ ${denominator} = ${whole}，所以 ${fractionText(numerator, denominator)} = ${whole}。`,
        };
      },
      () => {
        const denominator = randInt(2, 12);
        const whole = randInt(1, 6);
        const remainder = randInt(1, denominator - 1);
        const numerator = mixedToImproper(whole, remainder, denominator);
        return {
          question: `將帶分數 ${whole} ${fractionText(remainder, denominator)} 化成假分數。`,
          summary: `${fractionText(numerator, denominator)}`,
          detail: `${whole} = ${fractionText(whole * denominator, denominator)}，再加上 ${fractionText(remainder, denominator)}，得到 ${fractionText(numerator, denominator)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(
      entries,
      '假分數和帶分數互換時，可以先用除法找整數部分與餘數，或先把帶分數的整數部分改寫成同分母分數。'
    );
  }

  function buildE419SameDenominatorCompareSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = randInt(3, 12);
        const leftNumerator = randInt(1, denominator * 3);
        let rightNumerator = randInt(1, denominator * 3);
        while (rightNumerator === leftNumerator) rightNumerator = randInt(1, denominator * 3);
        const leftText = fractionOrMixedText(leftNumerator, denominator);
        const rightText = fractionOrMixedText(rightNumerator, denominator);
        const symbol = leftNumerator > rightNumerator ? '>' : '<';
        return {
          question: `填入 >、< 或 =：${leftText} □ ${rightText}。`,
          summary: `${symbol}`,
          detail: `同分母分數比較大小，只要比大小分子。因為 ${leftNumerator} ${symbol} ${rightNumerator}，所以應填「${symbol}」。`,
        };
      },
      () => {
        const denominator = randInt(4, 10);
        const a = randInt(1, denominator * 3);
        const b = randInt(1, denominator * 3);
        const c = randInt(1, denominator * 3);
        const items = shuffle([
          { text: fractionOrMixedText(a, denominator), value: a },
          { text: fractionOrMixedText(b, denominator), value: b },
          { text: fractionOrMixedText(c, denominator), value: c },
        ]);
        const ordered = items.slice().sort((x, y) => y.value - x.value);
        return {
          question: `將 ${items.map((item) => item.text).join('、')} 由大到小排列。`,
          summary: ordered.map((item) => item.text).join(' > '),
          detail: `同分母分數先統一成同分母形式，再比較分子大小，依序是 ${ordered.map((item) => `${item.text}（分子 ${item.value}）`).join('、')}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '同分母分數比大小時，先把整數、假分數、帶分數都看成同分母分數，再直接比較分子。');
  }

  function buildE419SameDenominatorAddSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = randInt(3, 12);
        const left = randInt(1, denominator - 1);
        const right = randInt(1, denominator - 1);
        const total = left + right;
        return {
          question: `計算：${fractionText(left, denominator)} + ${fractionText(right, denominator)} = （ ）`,
          summary: `${fractionOrMixedText(total, denominator)}`,
          detail: `同分母分數相加，分母不變，只加分子：${left} + ${right} = ${total}，所以答案是 ${fractionOrMixedText(total, denominator)}。`,
        };
      },
      () => {
        const denominator = randInt(4, 10);
        const whole = randInt(1, 4);
        const left = randInt(1, denominator - 1);
        const right = randInt(1, denominator - 1);
        const totalNumerator = mixedToImproper(whole, left, denominator) + right;
        return {
          question: `計算：${whole} ${fractionText(left, denominator)} + ${fractionText(right, denominator)} = （ ）`,
          summary: `${fractionOrMixedText(totalNumerator, denominator)}`,
          detail: `先把整數部分保留，看分數部分：${fractionText(left, denominator)} + ${fractionText(right, denominator)} = ${fractionText(left + right, denominator)}。再整理成 ${fractionOrMixedText(totalNumerator, denominator)}。`,
        };
      },
      () => {
        const denominator = randInt(4, 10);
        const wholeA = randInt(1, 4);
        const wholeB = randInt(1, 4);
        const left = randInt(1, denominator - 1);
        const right = randInt(1, denominator - 1);
        const totalNumerator = mixedToImproper(wholeA, left, denominator) + mixedToImproper(wholeB, right, denominator);
        return {
          question: `計算：${wholeA} ${fractionText(left, denominator)} + ${wholeB} ${fractionText(right, denominator)} = （ ）`,
          summary: `${fractionOrMixedText(totalNumerator, denominator)}`,
          detail: `整數部分和分數部分分開看：${wholeA} + ${wholeB} = ${wholeA + wholeB}，${fractionText(left, denominator)} + ${fractionText(right, denominator)} = ${fractionText(left + right, denominator)}，整理後得 ${fractionOrMixedText(totalNumerator, denominator)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '同分母分數加法的關鍵是分母不變、只加分子；如果超過 1，要再整理成帶分數或整數。');
  }

  function buildE419SameDenominatorSubtractSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = randInt(3, 12);
        const whole = randInt(2, 8);
        const right = randInt(1, denominator - 1);
        const leftImproper = whole * denominator;
        const diff = leftImproper - right;
        return {
          question: `計算：${whole} − ${fractionText(right, denominator)} = （ ）`,
          summary: `${fractionOrMixedText(diff, denominator)}`,
          detail: `先把 ${whole} 看成 ${fractionText(leftImproper, denominator)}，再減去 ${fractionText(right, denominator)}，得到 ${fractionOrMixedText(diff, denominator)}。`,
        };
      },
      () => {
        const denominator = randInt(4, 10);
        const whole = randInt(2, 6);
        const left = randInt(1, denominator - 1);
        const right = randInt(1, denominator - 1);
        const leftImproper = mixedToImproper(whole, left, denominator);
        const rightImproper = mixedToImproper(randInt(0, 1), right, denominator);
        if (leftImproper <= rightImproper) return factories[0]();
        const diff = leftImproper - rightImproper;
        const rightText =
          rightImproper >= denominator
            ? fractionOrMixedText(rightImproper, denominator)
            : fractionText(right, denominator);
        return {
          question: `計算：${whole} ${fractionText(left, denominator)} − ${rightText} = （ ）`,
          summary: `${fractionOrMixedText(diff, denominator)}`,
          detail: `先把兩個數改寫成同分母分數，再做減法。算得 ${fractionOrMixedText(diff, denominator)}。`,
        };
      },
      () => {
        const denominator = randInt(4, 10);
        const wholeA = randInt(3, 7);
        const wholeB = randInt(1, wholeA - 1);
        const left = randInt(1, denominator - 1);
        const right = randInt(1, denominator - 1);
        const leftImproper = mixedToImproper(wholeA, left, denominator);
        const rightImproper = mixedToImproper(wholeB, right, denominator);
        if (leftImproper <= rightImproper) return factories[0]();
        const diff = leftImproper - rightImproper;
        return {
          question: `計算：${wholeA} ${fractionText(left, denominator)} − ${wholeB} ${fractionText(right, denominator)} = （ ）`,
          summary: `${fractionOrMixedText(diff, denominator)}`,
          detail: `如果分數部分不夠減，可以先向整數借 1，再用同分母分數相減，整理後得到 ${fractionOrMixedText(diff, denominator)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(
      entries,
      '同分母分數減法要先判斷分數部分夠不夠減；不夠減時，要向整數借 1，再改成同分母分數處理。'
    );
  }

  function buildE419FractionTimesIntegerSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = randInt(2, 10);
        const numerator = randInt(1, denominator - 1);
        const integer = randInt(2, 9);
        const product = numerator * integer;
        return {
          question: `計算：${fractionText(numerator, denominator)} × ${integer} = （ ）`,
          summary: `${fractionOrMixedText(product, denominator)}`,
          detail: `分母不變，分子和整數相乘：${numerator} × ${integer} = ${product}，所以答案是 ${fractionOrMixedText(product, denominator)}。`,
        };
      },
      () => {
        const denominator = randInt(3, 10);
        const whole = randInt(1, 4);
        const numerator = randInt(1, denominator - 1);
        const integer = randInt(2, 9);
        const product = mixedToImproper(whole, numerator, denominator) * integer;
        return {
          question: `計算：${whole} ${fractionText(numerator, denominator)} × ${integer} = （ ）`,
          summary: `${fractionOrMixedText(product, denominator)}`,
          detail: `先把帶分數改成假分數：${whole} ${fractionText(numerator, denominator)} = ${fractionText(mixedToImproper(whole, numerator, denominator), denominator)}，再乘 ${integer}，得到 ${fractionOrMixedText(product, denominator)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '分數乘整數時，分母不變，分子乘整數；如果原式是帶分數，先化成假分數再乘。');
  }

  function buildE419FractionCompareApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = randInt(4, 10);
        const leftWhole = randInt(1, 4);
        const rightWhole = randInt(1, 4);
        const leftNum = randInt(1, denominator - 1);
        const rightNum = randInt(1, denominator - 1);
        const leftImproper = mixedToImproper(leftWhole, leftNum, denominator);
        const rightImproper = mixedToImproper(rightWhole, rightNum, denominator);
        if (leftImproper === rightImproper) return factories[0]();
        const better = leftImproper > rightImproper ? '第一個較多' : '第二個較多';
        return {
          question: `比較誰比較多：甲有 ${leftWhole} ${fractionText(leftNum, denominator)} 盒，乙有 ${rightWhole} ${fractionText(rightNum, denominator)} 盒，誰比較多？`,
          summary: `${better}`,
          detail: `先看成同分母分數：甲是 ${fractionText(leftImproper, denominator)}，乙是 ${fractionText(rightImproper, denominator)}。因為 ${leftImproper > rightImproper ? `${leftImproper} > ${rightImproper}` : `${rightImproper} > ${leftImproper}`}，所以${better}。`,
        };
      },
      () => {
        const denominator = randInt(4, 10);
        const leftNum = randInt(denominator + 1, denominator * 4);
        const rightNum = randInt(denominator + 1, denominator * 4);
        if (leftNum === rightNum) return factories[0]();
        const better = leftNum > rightNum ? '甲較長' : '乙較長';
        return {
          question: `比較長度：甲長 ${fractionOrMixedText(leftNum, denominator)} 公尺，乙長 ${fractionOrMixedText(rightNum, denominator)} 公尺，誰比較長？`,
          summary: `${better}`,
          detail: `兩個長度同分母，直接比較分子大小即可。因為 ${leftNum > rightNum ? `${leftNum} > ${rightNum}` : `${rightNum} > ${leftNum}`}，所以${better}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '分數比較應用題要先統一形式，再比較大小，不要只看整數部分或只看分數部分。');
  }

  function buildE419FractionAddApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = randInt(4, 10);
        const left = randInt(1, denominator - 1);
        const right = randInt(1, denominator - 1);
        const total = left + right;
        return {
          question: `把一根棍子插入水中，露出水面部分長 ${fractionText(left, denominator)} 公尺，插入水中部分長 ${fractionText(right, denominator)} 公尺，棍子全長多少公尺？`,
          summary: `${fractionOrMixedText(total, denominator)} 公尺`,
          detail: `全長就是兩部分相加：${fractionText(left, denominator)} + ${fractionText(right, denominator)} = ${fractionOrMixedText(total, denominator)} 公尺。`,
        };
      },
      () => {
        const denominator = randInt(4, 10);
        const whole = randInt(1, 4);
        const left = randInt(1, denominator - 1);
        const right = randInt(1, denominator - 1);
        const total = mixedToImproper(whole, left, denominator) + right;
        return {
          question: `小吃店上午賣了 ${whole} ${fractionText(left, denominator)} 籃肉包，下午比上午多賣了 ${fractionText(right, denominator)} 籃，下午賣了幾籃肉包？`,
          summary: `${fractionOrMixedText(total, denominator)} 籃`,
          detail: `下午比上午多 ${fractionText(right, denominator)} 籃，所以用加法：${whole} ${fractionText(left, denominator)} + ${fractionText(right, denominator)} = ${fractionOrMixedText(total, denominator)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '求總和或原來有多少的分數應用題，通常要把同分母分數直接相加，再整理答案。');
  }

  function buildE419FractionSubtractApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = randInt(4, 10);
        const whole = randInt(2, 6);
        const left = randInt(1, denominator - 1);
        const right = randInt(1, denominator - 1);
        const diff = mixedToImproper(whole, left, denominator) - right;
        if (diff <= 0) return factories[0]();
        return {
          question: `一條紅膠帶長 ${whole} ${fractionText(left, denominator)} 公尺，綠膠帶比紅膠帶短 ${fractionText(right, denominator)} 公尺，綠膠帶長幾公尺？`,
          summary: `${fractionOrMixedText(diff, denominator)} 公尺`,
          detail: `綠膠帶比較短，所以用減法：${whole} ${fractionText(left, denominator)} − ${fractionText(right, denominator)} = ${fractionOrMixedText(diff, denominator)}。`,
        };
      },
      () => {
        const denominator = randInt(4, 10);
        const whole = randInt(2, 6);
        const left = randInt(1, denominator - 1);
        const right = randInt(1, denominator - 1);
        const diff = mixedToImproper(whole, left, denominator) - right;
        if (diff <= 0) return factories[0]();
        return {
          question: `一個飲料桶原有 ${whole} ${fractionText(left, denominator)} 公升，倒出 ${fractionText(right, denominator)} 公升後，還剩下多少公升？`,
          summary: `${fractionOrMixedText(diff, denominator)} 公升`,
          detail: `剩餘量用減法：${whole} ${fractionText(left, denominator)} − ${fractionText(right, denominator)} = ${fractionOrMixedText(diff, denominator)} 公升。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '求相差、求剩餘量的分數應用題，先判斷誰多誰少，再做同分母減法。');
  }

  function buildE419FractionTimesIntegerApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const denominator = randInt(4, 10);
        const numerator = randInt(1, denominator - 1);
        const bottles = randInt(3, 8);
        const total = numerator * bottles;
        return {
          question: `每瓶果汁有 ${fractionText(numerator, denominator)} 公升，買了 ${bottles} 瓶，一共有多少公升？`,
          summary: `${fractionOrMixedText(total, denominator)} 公升`,
          detail: `每瓶都是 ${fractionText(numerator, denominator)} 公升，${bottles} 瓶就是 ${fractionText(numerator, denominator)} × ${bottles} = ${fractionOrMixedText(total, denominator)} 公升。`,
        };
      },
      () => {
        const denominator = randInt(4, 10);
        const whole = randInt(1, 4);
        const numerator = randInt(1, denominator - 1);
        const times = randInt(2, 6);
        const total = mixedToImproper(whole, numerator, denominator) * times;
        return {
          question: `一條緞帶長 ${whole} ${fractionText(numerator, denominator)} 公尺，剪下 ${times} 條，一共用了多少公尺？`,
          summary: `${fractionOrMixedText(total, denominator)} 公尺`,
          detail: `先把帶分數化成假分數，再乘整數：${whole} ${fractionText(numerator, denominator)} × ${times} = ${fractionOrMixedText(total, denominator)} 公尺。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '分數乘整數的應用題，通常代表同一份量重複好多次，可以看成重複加法再整理。');
  }

  function buildE419UnitFractionRepresentationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const total = pick([6, 8, 10, 12]);
        const filled = randInt(total + 1, total * 3 - 1);
        return {
          question: `一盒雞蛋有 ${total} 顆，現在有 ${filled} 顆雞蛋，用帶分數表示是幾盒？`,
          summary: `${fractionOrMixedText(filled, total)} 盒`,
          detail: `把 ${filled} 顆每 ${total} 顆看成 1 盒，所以是 ${fractionText(filled, total)} 盒，也就是 ${fractionOrMixedText(filled, total)} 盒。`,
        };
      },
      () => {
        const denominator = pick([8, 10, 12]);
        const first = randInt(1, denominator - 1);
        const second = randInt(1, denominator - 1);
        const total = first + second;
        return {
          question: `一個披薩平均切成 ${denominator} 片，現在有 ${first} 片和 ${second} 片，合起來是幾個披薩？用假分數表示。`,
          summary: `${fractionText(total, denominator)}`,
          detail: `每 ${denominator} 片是 1 個披薩，所以 ${first} 片加 ${second} 片共 ${total} 片，表示成分數是 ${fractionText(total, denominator)}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(
      entries,
      '把具體數量轉成分數表示時，要先看『一個完整單位』是多少，再把現有數量寫成幾分之幾個單位。'
    );
  }

  function buildE418OrderMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(
      entries,
      '整數四則計算要先分清楚規則：同級運算由左而右，遇到括號先算，有乘除和加減混合時先乘除後加減。'
    );
  }

  function buildE418AddSubtractLeftToRightSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const a = randInt(20, 90);
        const b = randInt(10, 80);
        const c = randInt(10, 80);
        const total = a + b + c;
        return {
          question: `計算：${a} + ${b} + ${c} = （ ）`,
          summary: `${total}`,
          detail: `這一題只有加法，照由左而右計算：${a} + ${b} = ${a + b}，${a + b} + ${c} = ${total}。`,
        };
      },
      () => {
        const c = randInt(10, 40);
        const b = randInt(10, 50);
        const a = randInt(b + c + 20, b + c + 120);
        const total = a - b - c;
        return {
          question: `計算：${a} − ${b} − ${c} = （ ）`,
          summary: `${total}`,
          detail: `這一題只有減法，照由左而右計算：${a} − ${b} = ${a - b}，${a - b} − ${c} = ${total}。`,
        };
      },
      () => {
        const a = randInt(30, 120);
        const b = randInt(10, 60);
        const c = randInt(10, 60);
        const total = a + b - c;
        return {
          question: `計算：${a} + ${b} − ${c} = （ ）`,
          summary: `${total}`,
          detail: `加減是同級運算，要由左而右：${a} + ${b} = ${a + b}，${a + b} − ${c} = ${total}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '只有加減時，不用再分優先順序，從左邊開始一步一步往右算。');
  }

  function buildE418MulDivLeftToRightSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const divisor = randInt(2, 9);
        const quotient = randInt(4, 30);
        const multiplier = randInt(2, 9);
        const dividend = divisor * quotient;
        const total = quotient * multiplier;
        return {
          question: `計算：${dividend} ÷ ${divisor} × ${multiplier} = （ ）`,
          summary: `${total}`,
          detail: `乘除是同級運算，要由左而右：${dividend} ÷ ${divisor} = ${quotient}，${quotient} × ${multiplier} = ${total}。`,
        };
      },
      () => {
        const left = randInt(4, 20);
        const middle = randInt(2, 9);
        const right = randInt(2, 9);
        const product = left * middle;
        if (product % right !== 0) return factories[0]();
        const total = product / right;
        return {
          question: `計算：${left} × ${middle} ÷ ${right} = （ ）`,
          summary: `${total}`,
          detail: `乘除同級，先算左邊：${left} × ${middle} = ${product}，${product} ÷ ${right} = ${total}。`,
        };
      },
      () => {
        const last = randInt(2, 9);
        const middle = randInt(2, 9);
        const first = randInt(2, 18) * middle * last;
        const afterFirst = first / middle;
        const total = afterFirst / last;
        return {
          question: `計算：${first} ÷ ${middle} ÷ ${last} = （ ）`,
          summary: `${total}`,
          detail: `連續除法也要由左而右：${first} ÷ ${middle} = ${afterFirst}，${afterFirst} ÷ ${last} = ${total}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '只有乘除時，和加減一樣屬於同級運算，也要從左到右依序計算。');
  }

  function buildE418MixedNoBracketSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const a = randInt(20, 120);
        const b = randInt(10, 60);
        const c = randInt(2, 9);
        const total = a + b * c;
        return {
          question: `計算：${a} + ${b} × ${c} = （ ）`,
          summary: `${total}`,
          detail: `先算乘法：${b} × ${c} = ${b * c}，再算加法：${a} + ${b * c} = ${total}。`,
        };
      },
      () => {
        const a = randInt(150, 500);
        const b = randInt(20, 80);
        const c = randInt(2, 9);
        const total = a - b * c;
        return {
          question: `計算：${a} − ${b} × ${c} = （ ）`,
          summary: `${total}`,
          detail: `先算乘法：${b} × ${c} = ${b * c}，再算減法：${a} − ${b * c} = ${total}。`,
        };
      },
      () => {
        const divisor = randInt(2, 9);
        const quotient = randInt(6, 40);
        const add = randInt(10, 80);
        const dividend = divisor * quotient;
        const total = add + quotient;
        return {
          question: `計算：${add} + ${dividend} ÷ ${divisor} = （ ）`,
          summary: `${total}`,
          detail: `先算除法：${dividend} ÷ ${divisor} = ${quotient}，再算加法：${add} + ${quotient} = ${total}。`,
        };
      },
      () => {
        const divisor = randInt(2, 9);
        const quotient = randInt(4, 30);
        const a = randInt(120, 400);
        const dividend = divisor * quotient;
        const total = a - quotient;
        return {
          question: `計算：${a} − ${dividend} ÷ ${divisor} = （ ）`,
          summary: `${total}`,
          detail: `先算除法：${dividend} ÷ ${divisor} = ${quotient}，再算減法：${a} − ${quotient} = ${total}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '沒有括號時，只要同時出現乘除和加減，就先做乘除，再做加減。');
  }

  function buildE418BracketOrderSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const a = randInt(20, 80);
        const b = randInt(10, 60);
        const c = randInt(2, 9);
        const inside = a + b;
        const total = inside * c;
        return {
          question: `計算：(${a} + ${b}) × ${c} = （ ）`,
          summary: `${total}`,
          detail: `先算括號：${a} + ${b} = ${inside}，再算 ${inside} × ${c} = ${total}。`,
        };
      },
      () => {
        const b = randInt(10, 50);
        const a = randInt(b + 20, b + 120);
        const c = randInt(2, 9);
        const inside = a - b;
        const total = inside * c;
        return {
          question: `計算：(${a} − ${b}) × ${c} = （ ）`,
          summary: `${total}`,
          detail: `先算括號：${a} − ${b} = ${inside}，再算 ${inside} × ${c} = ${total}。`,
        };
      },
      () => {
        const a = randInt(2, 9);
        const b = randInt(2, 9);
        const quotient = randInt(4, 20);
        const dividend = a * b * quotient;
        const inside = a * b;
        return {
          question: `計算：${dividend} ÷ (${a} × ${b}) = （ ）`,
          summary: `${quotient}`,
          detail: `先算括號：${a} × ${b} = ${inside}，再算 ${dividend} ÷ ${inside} = ${quotient}。`,
        };
      },
      () => {
        const a = randInt(10, 60);
        const b = randInt(10, 60);
        const divisor = randInt(2, 9);
        const inside = a + b;
        const dividend = inside * divisor;
        return {
          question: `計算：${dividend} ÷ (${a} + ${b}) = （ ）`,
          summary: `${divisor}`,
          detail: `先算括號：${a} + ${b} = ${inside}，再算 ${dividend} ÷ ${inside} = ${divisor}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '括號會改變運算順序，所以一定先把括號內算完，再處理括號外。');
  }

  function buildE418OrderJudgeSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const a = randInt(100, 300);
        const b = randInt(20, 80);
        const c = randInt(10, 60);
        return {
          question: `判斷下面兩個算式答案是否相同：${a} − ${b} − ${c} 和 (${a} − ${b}) − ${c}。`,
          summary: `相同`,
          detail: `原式只有減法，要由左而右計算，所以 ${a} − ${b} − ${c} 本來就等於 (${a} − ${b}) − ${c}，答案相同。`,
        };
      },
      () => {
        const divisor = randInt(2, 9);
        const middle = randInt(2, 9);
        const quotient = randInt(4, 18);
        const left = divisor * middle * quotient;
        return {
          question: `判斷下面兩個算式答案是否相同：${left} ÷ ${divisor} × ${middle} 和 ${left} ÷ (${divisor} × ${middle})。`,
          summary: `不同`,
          detail: `左式要由左而右先算 ${left} ÷ ${divisor}，右式則要先算括號 ${divisor} × ${middle}，運算順序不同，所以答案通常不同。`,
        };
      },
      () => {
        const a = randInt(40, 120);
        const b = randInt(6, 20);
        const c = randInt(2, 9);
        return {
          question: `判斷下面兩個算式答案是否相同：${a} − ${b} × ${c} 和 ${a} − (${b} × ${c})。`,
          summary: `相同`,
          detail: `左式本來就要先算乘法 ${b} × ${c}，加上括號後順序沒有改變，所以答案相同。`,
        };
      },
      () => {
        const a = randInt(10, 40);
        const b = randInt(10, 40);
        const c = randInt(2, 9);
        return {
          question: `判斷下面兩個算式答案是否相同：${a} + ${b} × ${c} 和 (${a} + ${b}) × ${c}。`,
          summary: `不同`,
          detail: `左式先算乘法，右式先算括號，括號改變了原本的順序，所以答案不同。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '概念辨析題不是只比數字，而是要先判斷括號或運算順序有沒有改變原本的算法。');
  }

  function buildE418ApplicationExpressionSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const itemA = randInt(20, 90);
        const itemB = randInt(20, 90);
        const groups = randInt(2, 8);
        const total = (itemA + itemB) * groups;
        return {
          question: `一組點心有餅乾 ${itemA} 元和果汁 ${itemB} 元，各買 ${groups} 組，一共要多少元？`,
          summary: `${total} 元`,
          detail: `先求一組多少元：${itemA} + ${itemB} = ${itemA + itemB}，再乘組數：(${itemA} + ${itemB}) × ${groups} = ${total}。`,
        };
      },
      () => {
        const totalItems = randInt(120, 260);
        const damaged = randInt(5, 20);
        const perBox = pick([4, 5, 6, 8]);
        const usable = totalItems - damaged;
        const boxes = usable / perBox;
        if (!Number.isInteger(boxes)) return factories[1]();
        return {
          question: `一箱彈珠有 ${totalItems} 顆，破掉 ${damaged} 顆，剩下的每 ${perBox} 顆裝一盒，共裝幾盒？`,
          summary: `${boxes} 盒`,
          detail: `先算剩下幾顆：${totalItems} − ${damaged} = ${usable}，再平均分盒：(${totalItems} − ${damaged}) ÷ ${perBox} = ${boxes}。`,
        };
      },
      () => {
        const countCups = randInt(4, 9);
        const unitPrice = randInt(18, 70);
        const paid = unitPrice * countCups + randInt(100, 300);
        const change = paid - unitPrice * countCups;
        return {
          question: `買了 ${countCups} 個杯子，付 ${paid} 元，找回 ${change} 元，一個杯子多少元？`,
          summary: `${unitPrice} 元`,
          detail: `先算實際花了多少元：${paid} − ${change} = ${paid - change}，再除以杯子數：(${paid} − ${change}) ÷ ${countCups} = ${unitPrice}。`,
        };
      },
      () => {
        const totalLength = randInt(400, 900);
        const each = randInt(40, 180);
        const countFlowers = randInt(2, 5);
        const used = each * countFlowers;
        if (used >= totalLength) return factories[0]();
        const left = totalLength - used;
        return {
          question: `一條緞帶長 ${totalLength} 公分，做了 ${countFlowers} 朵花，每朵用 ${each} 公分，還剩幾公分？`,
          summary: `${left} 公分`,
          detail: `先算共用掉多少：${each} × ${countFlowers} = ${used}，再算剩下多少：${totalLength} − ${used} = ${left}。`,
        };
      },
      () => {
        const classA = randInt(20, 35);
        const classB = randInt(20, 35);
        const perStudent = randInt(3, 9);
        const total = (classA + classB) * perStudent;
        return {
          question: `甲班有 ${classA} 人，乙班有 ${classB} 人，每人發 ${perStudent} 張色紙，兩班共要發幾張？`,
          summary: `${total} 張`,
          detail: `先算總人數：${classA} + ${classB} = ${classA + classB}，再乘每人張數：(${classA} + ${classB}) × ${perStudent} = ${total}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '生活應用題先整理成併式，再依照括號、乘除、加減的順序計算。');
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
    return createResult(entries, '與整數相等的等值分數：分子是分母的幾倍，就等於幾個 1。');
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
          question: `填入空格：${fractionText(numerator, denominator)} = ${fractionText(numerator * multiplier, '（　）')}。`,
          summary: `${denominator * multiplier}`,
          detail: `分子從 ${numerator} 變成 ${numerator * multiplier}，是乘以 ${multiplier}，分母也要乘以 ${multiplier}：${denominator} × ${multiplier} = ${denominator * multiplier}。`,
        };
      },
      () => {
        const denominator = randInt(4, 12);
        const numerator = randInt(1, denominator - 1);
        const multipliers = shuffle([2, 3, 4, 5, 6])
          .slice(0, 3)
          .sort((a, b) => a - b);
        const expanded = multipliers.map((multiplier) =>
          fractionText(numerator * multiplier, denominator * multiplier)
        );
        return {
          question: `寫出 ${fractionText(numerator, denominator)} 的 3 個等值分數。`,
          summary: expanded.join('、'),
          detail: `分子和分母同乘相同整數，分數值不變。例如同乘 ${multipliers.join('、')}，可得 ${expanded.join('、')}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '分數擴分：分子與分母同乘一個不為 0 的整數，分數值不變。');
  }

  function buildDiscreteEquivalentFractionSet(count = 3) {
    const entries = [];
    const items = [
      { name: '月餅', unit: '個' },
      { name: '蛋塔', unit: '個' },
      { name: '巧克力', unit: '顆' },
      { name: '貼紙', unit: '張' },
      { name: '積木', unit: '塊' },
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
        const numeratorB = Math.max(
          1,
          Math.min(denominatorB - 1, numeratorA * (denominatorB / denominatorA) + pick([-1, 0, 1]))
        );
        const amountA = (total * numeratorA) / denominatorA;
        const amountB = (total * numeratorB) / denominatorB;
        if (!Number.isInteger(amountA) || !Number.isInteger(amountB) || amountA === amountB) {
          return factories[0]();
        }
        const more =
          amountA > amountB ? fractionText(numeratorA, denominatorA) : fractionText(numeratorB, denominatorB);
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
    return createResult(entries, '離散量中的等值分數：先把一盒或一組平均分，再比較各分數代表的實際數量。');
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
          detail: `${denominator === 10 ? '一位小數' : '二位小數'}可寫成分母為 ${denominator} 的分數，所以答案是 ${fractionText(numerator, denominator)}。`,
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
    return createResult(entries, '分數與小數互換：先把分母轉成 10 或 100，再依位值寫成小數。');
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
          question: `將 ${candidates.map((item) => fractionText(item.n, item.d)).join('、')} 由小到大排列。`,
          summary: ordered.map((item) => fractionText(item.n, item.d)).join(' < '),
          detail: `可先化成小數或通分比較，依序為 ${ordered.map((item) => `${fractionText(item.n, item.d)} = ${decimalText(item.n / item.d)}`).join('，')}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '分數、小數與異分母比較：把不同表示法化成同一種形式，再比較大小。');
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
          question: `甲蟲在數線上 ${mixedFractionText(startNumerator, parts)} 的位置，向${goRight ? '右' : '左'}走 ${fractionText(move, parts)}，停在什麼位置？`,
          summary: `${mixedFractionText(resultNumerator, parts)}`,
          detail: `向${goRight ? '右' : '左'}就是${goRight ? '加' : '減'}：${mixedFractionText(startNumerator, parts)} ${goRight ? '+' : '-'} ${fractionText(move, parts)} = ${mixedFractionText(resultNumerator, parts)}。`,
        };
      },
      () => {
        const parts = pick([4, 5, 10]);
        const numeratorA = randInt(1, parts * 3);
        let numeratorB = randInt(1, parts * 3);
        while (numeratorB === numeratorA) {
          numeratorB = randInt(1, parts * 3);
        }
        const closer = numeratorA < numeratorB ? 'A 點在左邊' : 'B 點在左邊';
        return {
          question: `數線上 A 點是 ${mixedFractionText(numeratorA, parts)}，B 點是 ${mixedFractionText(numeratorB, parts)}，哪一點在左邊？`,
          summary: `${closer}`,
          detail: `數線上數值越小越靠左。因為 ${mixedFractionText(numeratorA, parts)} ${numeratorA < numeratorB ? '<' : '>'} ${mixedFractionText(numeratorB, parts)}，所以${closer}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '分數數線：先看每一小格代表的分數，再用往右增加、往左減少來判斷位置。');
  }

  function buildEquivalentFractionMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '等值分數綜合練習：用擴分、分裝、數線與小數互換理解同一個量的不同表示。');
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
    return createResult(entries, '連加時先找能湊成整百或整千的兩個加數，先加會比較快。');
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
    return createResult(entries, '連減時可以先觀察哪一個減數先減最容易，調整順序後再算。');
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
    return createResult(entries, '如果兩個減數加起來剛好是整百或整千，可先把它們合成一個數再減。');
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
    return createResult(entries, '加減混合時，可以先把減法和某個數配成整百或整千，再做剩下的加法。');
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
    return createResult(entries, '加減法生活題也能簡算：先列出算式，再找能先湊整或先合併的部分。');
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
    return createResult(entries, '連乘時若先找到能湊成整十或整百的因數，後面乘起來會更快。');
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
    return createResult(entries, '熟記 25×4=100、125×8=1000、2×5=10 這些組合，可以大幅加快連乘計算。');
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
    return createResult(entries, '乘除混合時，若前面的數可以先被後面的除數整除，就先除再乘。');
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
    return createResult(entries, '乘法生活題先把總數量或好算的因數配好，再乘單價或單位量。');
  }

  function buildMulDivApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const price = 255;
        const boxCount = 4;
        const people = 5;
        const result = (price * boxCount) / people;
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
        const result = (total * bagCount) / people;
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
        const result = (total * boxCount) / people;
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
        const result = (total * boxCount) / people;
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
    return createResult(entries, '乘除法生活題若能先除再乘，數字會變小，平均分配也會更好算。');
  }

  function buildSimplifyCalculationMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '簡化計算綜合練習：先觀察數字關係，再決定要湊整、換順序，還是先除再乘。');
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
    return createResult(entries, '先算前面的非 0 部分，再看原數末尾有幾個 0，幫助學生連結位值與乘法。');
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
    return createResult(entries, '整十乘整十要先看前面的數字相乘，再補上兩個 0。');
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
    return createResult(entries, '三位數乘整十可先乘前面的個數，再補上一個 0，避免位值對齊出錯。');
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
    return createResult(entries, '四位數乘一位數要穩定處理進位，也要注意中間有 0 時不能跳位。');
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
    return createResult(entries, '先用不進位的二位數乘法建立直式格式感，再進入需要進位的題目。');
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
    return createResult(entries, '這類題要練熟個位進位、十位進位與第二層部分積的位值對齊。');
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
    return createResult(entries, '三位數乘二位數是整數乘法的主力題型，核心是分層相乘再相加。');
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
    return createResult(entries, '被乘數中間或末尾有 0 時，學生最常錯在漏位，這一類要特別練位值保留。');
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
    return createResult(entries, '四位數乘二位數的積通常較大，除了進位，也要提醒學生用位數估算檢查答案。');
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
    return createResult(entries, '末尾有 0 的乘法要先乘前面的數，再把兩邊的 0 一起補回去。');
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
        detail: `${target === b + 1 ? '因為多 1 個' : '因為少 1 個'} ${a}，所以在 ${known} 的基礎上${delta === 1 ? `加上 ${a}` : `減去 ${a}`}，得到 ${product}。`,
      });
    }
    return createResult(entries, '利用前後項關係做數感推理，重點不是重算，而是看出只差一個被乘數。');
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
        detail: `把 ${target} 看成 ${base}${target > base ? ' + 1' : ' - 1'}。先算 ${a} × ${base} = ${baseProduct}，再${target > base ? `加上 ${a}` : `減去 ${a}`}，得到 ${product}。`,
      });
    }
    return createResult(entries, '像 99、101、999 這類題，可改想成接近整十、整百、整千，再做一次加減調整。');
  }

  function buildE412BasicPlaceValueMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '這組先練位值規律，包含整十、整百、整千與乘整十，建立整數乘法的底層感覺。');
  }

  function buildE412ColumnBasicMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '這組集中練直式乘法的基本功：位值對齊、部分積位置與進位處理。');
  }

  function buildE412LargeMultiplicationMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '這組聚焦在三位數、四位數乘二位數，提醒學生先分層，再用估算檢查答案合理性。');
  }

  function buildE412ZeroHandlingMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '這組專練與 0 有關的乘法，包含末尾有 0 的簡化乘法，以及含 0 數字的位值保留。');
  }

  function buildE412ReasoningMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '這組用已知乘法往前後推，訓練學生從規律出發，不必每次都從頭重算。');
  }

  function buildE414DivisionMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '整數除法要先判斷用哪一種策略：直式計算、估商調整、末尾 0 簡化，或先整理題意再除。');
  }

  function buildE414FourDigitDivideOneDigitSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const divisor = randInt(2, 9);
      const quotient = randInt(120, 999);
      const remainder = Math.random() < 0.45 ? randInt(1, divisor - 1) : 0;
      const dividend = divisor * quotient + remainder;
      if (dividend < 1000 || dividend > 9999) continue;
      entries.push({
        question: `用直式計算：${dividend} ÷ ${divisor} = （ ）`,
        summary: formatDivisionSummary(quotient, remainder),
        detail: `從高位開始依序試商，算得商是 ${quotient}${remainder ? `，餘數是 ${remainder}` : ''}。檢算：${divisor} × ${quotient}${remainder ? ` + ${remainder}` : ''} = ${dividend}。`,
      });
    }
    return createResult(entries, '四位數除以一位數要從高位開始分，遇到不夠分時商要補 0，最後再檢查餘數是否小於除數。');
  }

  function buildE414EstimateDivisionSet(count = 3) {
    const entries = [];
    const specialDivisors = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300];
    while (entries.length < count) {
      if (Math.random() < 0.2) {
        const divisor = Math.random() < 0.5 ? pick(specialDivisors) : randInt(21, 99);
        const dividend = randInt(10, divisor - 1);
        entries.push({
          question: `先判斷再計算：${dividend} ÷ ${divisor} = （ ）`,
          summary: `商 0，餘 ${dividend}`,
          detail: `因為被除數 ${dividend} 比除數 ${divisor} 小，所以一個也分不到，商是 0，餘數就是 ${dividend}。`,
        });
        continue;
      }

      const divisor = Math.random() < 0.45 ? pick(specialDivisors) : randInt(11, 39);
      const quotientUpper = divisor >= 100 ? 9 : divisor >= 40 ? 18 : 26;
      const quotient = randInt(1, quotientUpper);
      const remainder = randInt(0, divisor - 1);
      const dividend = divisor * quotient + remainder;
      if (dividend < 40 || dividend > 999) continue;
      entries.push({
        question: `先估商再計算：${dividend} ÷ ${divisor} = （ ）`,
        summary: formatDivisionSummary(quotient, remainder),
        detail: `先找接近 ${dividend} 的 ${divisor} 倍數。因為 ${divisor} × ${quotient} = ${divisor * quotient}，所以商是 ${quotient}${remainder ? `，餘數是 ${remainder}` : ''}。`,
      });
    }
    return createResult(
      entries,
      '二、三位數除以二位數，或除數是整十、整百時，要先找接近的倍數估商，再看餘數是否合理。'
    );
  }

  function buildE414FourDigitDivideTwoDigitSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const divisor = randInt(12, 89);
      const quotient = randInt(12, 98);
      const remainder = randInt(0, divisor - 1);
      const dividend = divisor * quotient + remainder;
      if (dividend < 1000 || dividend > 9999) continue;
      entries.push({
        question: `用直式計算：${dividend} ÷ ${divisor} = （ ）`,
        summary: formatDivisionSummary(quotient, remainder),
        detail: `先估商，再逐位檢查是否過大或過小。算得商是 ${quotient}${remainder ? `，餘數是 ${remainder}` : ''}。檢算：${divisor} × ${quotient}${remainder ? ` + ${remainder}` : ''} = ${dividend}。`,
      });
    }
    return createResult(
      entries,
      '四位數除以二位數時，重點是估商要合理、商的位置要對齊，並用「除數 × 商 + 餘數 = 被除數」做檢查。'
    );
  }

  function buildE414TrailingZeroDivisionSet(count = 3) {
    const entries = [];
    const reducedDivisors = [2, 3, 4, 5, 6, 7, 8, 9, 12, 15];
    while (entries.length < count) {
      const zeroCount = pick([1, 1, 2]);
      const divisorCore = pick(reducedDivisors);
      const quotient = zeroCount === 2 ? randInt(2, 15) : randInt(2, 80);
      const remainderCore = Math.random() < 0.35 ? randInt(1, divisorCore - 1) : 0;
      const scale = 10 ** zeroCount;
      const divisor = divisorCore * scale;
      const dividend = (divisorCore * quotient + remainderCore) * scale;
      if (dividend < 100 || dividend > 9999) continue;
      const remainder = remainderCore * scale;
      const simplifiedDividend = dividend / scale;
      const simplifiedDivisor = divisor / scale;
      entries.push({
        question: `利用末尾 0 的規律計算：${dividend} ÷ ${divisor} = （ ）`,
        summary: formatDivisionSummary(quotient, remainder),
        detail: `被除數和除數末尾同時都有 ${zeroCount} 個 0，可以同時去掉，變成 ${simplifiedDividend} ÷ ${simplifiedDivisor} = ${quotient}${remainderCore ? `……${remainderCore}` : ''}。${remainderCore ? `原來的餘數要補回 ${zeroCount} 個 0，所以餘數是 ${remainder}。` : `所以原式的商就是 ${quotient}。`}`,
      });
    }
    return createResult(
      entries,
      '被除數和除數末尾有相同個數的 0，可以先同時去掉，再做除法；如果有餘數，最後要補回原來的位值。'
    );
  }

  function buildE414CeilingDivisionWordSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const people = randInt(280, 980);
        const capacity = pick([24, 28, 30, 36, 42, 45]);
        const buses = Math.ceil(people / capacity);
        return {
          question: `共有 ${people} 人要參加活動，每輛遊覽車可坐 ${capacity} 人，最少要幾輛遊覽車才坐得下？`,
          summary: `${buses} 輛`,
          detail: `${people} ÷ ${capacity} = ${Math.floor(people / capacity)} 餘 ${people % capacity}。因為還有人沒坐到，所以要再多 1 輛，共 ${buses} 輛。`,
        };
      },
      () => {
        const cakes = randInt(180, 520);
        const perTray = pick([18, 20, 22, 24, 25]);
        const trays = Math.ceil(cakes / perTray);
        return {
          question: `麵包店要烤 ${cakes} 個蛋糕，一個烤盤可放 ${perTray} 個，想要一次烤完，最少要幾個烤盤？`,
          summary: `${trays} 個`,
          detail: `${cakes} ÷ ${perTray} = ${Math.floor(cakes / perTray)} 餘 ${cakes % perTray}。最後不足一盤也要再準備 1 個烤盤，所以最少要 ${trays} 個。`,
        };
      },
      () => {
        const boxes = randInt(320, 780);
        const perCart = pick([18, 20, 24, 25, 30]);
        const carts = Math.ceil(boxes / perCart);
        return {
          question: `倉庫要搬運 ${boxes} 箱貨物，每輛推車一次能搬 ${perCart} 箱，最少要搬幾趟才能搬完？`,
          summary: `${carts} 趟`,
          detail: `${boxes} ÷ ${perCart} = ${Math.floor(boxes / perCart)} 餘 ${boxes % perCart}。因為剩下的也要再搬 1 趟，所以最少要 ${carts} 趟。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(
      entries,
      '題目問「最少要幾個、幾輛、幾趟」時，要先算除法，再判斷有沒有剩；只要有剩，就要商加 1。'
    );
  }

  function buildE414RemainderApplicationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const money = randInt(2400, 9800);
        const people = randInt(4, 9);
        const each = Math.floor(money / people);
        const left = money % people;
        return {
          question: `有 ${money} 元要平均分給 ${people} 個小朋友，每人分到幾元？還剩幾元？`,
          summary: `每人 ${each} 元，剩 ${left} 元`,
          detail: `${money} ÷ ${people} = ${each} 餘 ${left}，所以每人分到 ${each} 元，還剩 ${left} 元。`,
        };
      },
      () => {
        const apples = randInt(120, 360);
        const perTray = pick([12, 15, 18, 20, 24]);
        const full = Math.floor(apples / perTray);
        const left = apples % perTray;
        return {
          question: `有 ${apples} 顆水果，每盤放 ${perTray} 顆，可以裝滿幾盤？還剩幾顆？`,
          summary: `裝滿 ${full} 盤，剩 ${left} 顆`,
          detail: `${apples} ÷ ${perTray} = ${full} 餘 ${left}，所以可以裝滿 ${full} 盤，還剩 ${left} 顆。`,
        };
      },
      () => {
        const totalLength = pick([1680, 2160, 3240, 4480, 7280]);
        const eachLength = pick([6, 8, 12, 14, 16]);
        const countPieces = Math.floor(totalLength / eachLength);
        const left = totalLength % eachLength;
        return {
          question: `一條繩子長 ${totalLength} 公分，平均分成每段 ${eachLength} 公分，可以分成幾段？還剩幾公分？`,
          summary: `分成 ${countPieces} 段，剩 ${left} 公分`,
          detail: `${totalLength} ÷ ${eachLength} = ${countPieces} 餘 ${left}，所以可以分成 ${countPieces} 段，還剩 ${left} 公分。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '這類題先看是在問「每份多少」還是「可以分成幾份」，再用商和餘數完整回答。');
  }

  function buildE414TwoStepWordSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const total = pick([720, 840, 960, 1080]);
        const broken = pick([48, 60, 72, 84]);
        const perBag = pick([8, 10, 12, 15]);
        const bags = (total - broken) / perBag;
        if (!Number.isInteger(bags) || bags <= 1) return null;
        return {
          question: `一箱有 ${total} 顆橘子，先挑掉 ${broken} 顆壞掉的，剩下的每 ${perBag} 顆裝一袋，共可裝幾袋？`,
          summary: `${bags} 袋`,
          detail: `先算剩下多少顆：${total} - ${broken} = ${total - broken}。再算 ${total - broken} ÷ ${perBag} = ${bags}，所以共可裝 ${bags} 袋。`,
        };
      },
      () => {
        const snack = pick([216, 288, 324, 360]);
        const drink = pick([144, 180, 216, 252]);
        const people = pick([12, 18, 24, 27]);
        const each = (snack + drink) / people;
        if (!Number.isInteger(each)) return null;
        return {
          question: `同樂會買點心 ${snack} 元、飲料 ${drink} 元，費用由 ${people} 個小朋友平均分攤，每人要付幾元？`,
          summary: `${each} 元`,
          detail: `先算總費用：${snack} + ${drink} = ${snack + drink}。再算 ${snack + drink} ÷ ${people} = ${each}，所以每人要付 ${each} 元。`,
        };
      },
      () => {
        const paid = pick([500, 1000, 1200]);
        const change = pick([140, 220, 280, 320]);
        const countItems = pick([4, 5, 8, 10]);
        const each = (paid - change) / countItems;
        if (!Number.isInteger(each)) return null;
        return {
          question: `買了 ${countItems} 個杯子，付 ${paid} 元找回 ${change} 元，平均一個杯子多少元？`,
          summary: `${each} 元`,
          detail: `先算實際花了多少元：${paid} - ${change} = ${paid - change}。再算 ${paid - change} ÷ ${countItems} = ${each}，所以平均一個杯子 ${each} 元。`,
        };
      },
    ];
    while (entries.length < count) {
      const entry = pick(factories)();
      if (entry) entries.push(entry);
    }
    return createResult(entries, '兩步驟除法應用題要先整理題意：先求總量或剩餘量，再決定最後要除給誰。');
  }

  function buildE414ExpressionDivisionSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const divisor = pick([4, 5, 6, 8, 10]);
        const quotient = randInt(12, 40);
        const total = divisor * quotient;
        const first = randInt(120, total - 120);
        const second = total - first;
        return {
          question: `先算括號，再計算：(${first} + ${second}) ÷ ${divisor} = （ ）`,
          summary: `${quotient}`,
          detail: `先算括號：${first} + ${second} = ${total}。再算 ${total} ÷ ${divisor} = ${quotient}。`,
        };
      },
      () => {
        const divisor = pick([5, 6, 8, 10, 12]);
        const quotient = randInt(10, 36);
        const remainValue = randInt(120, 360);
        const total = divisor * quotient + remainValue;
        return {
          question: `依照運算順序計算：${total} - ${remainValue} ÷ ${divisor} = （ ）`,
          summary: `${total - remainValue / divisor}`,
          detail: `先算除法：${remainValue} ÷ ${divisor} = ${remainValue / divisor}。再算 ${total} - ${remainValue / divisor} = ${total - remainValue / divisor}。`,
        };
      },
      () => {
        const a = pick([4, 5, 6, 8]);
        const b = pick([3, 4, 5, 6]);
        const quotient = randInt(10, 40);
        const dividend = a * b * quotient;
        return {
          question: `先算括號，再計算：${dividend} ÷ (${a} × ${b}) = （ ）`,
          summary: `${quotient}`,
          detail: `先算括號：${a} × ${b} = ${a * b}。再算 ${dividend} ÷ ${a * b} = ${quotient}。`,
        };
      },
      () => {
        const divisor = pick([3, 4, 5, 6, 8]);
        const quotient = randInt(12, 30);
        const multiplier = pick([2, 3, 4, 5]);
        const dividend = divisor * quotient;
        return {
          question: `依照運算順序計算：${dividend} ÷ ${divisor} × ${multiplier} = （ ）`,
          summary: `${quotient * multiplier}`,
          detail: `先算除法：${dividend} ÷ ${divisor} = ${quotient}。再算 ${quotient} × ${multiplier} = ${quotient * multiplier}。`,
        };
      },
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '看到括號或乘除混合時，要先看運算順序：先括號、再乘除、最後加減。');
  }

  function buildE414UnitRateCompareSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const juiceBottleCount = pick([24, 30, 36, 48]);
        const milkBottleCount = pick([18, 24, 30, 36]);
        const juiceUnitPrice = pick([18, 19, 20, 21]);
        const milkUnitPrice = pick([22, 23, 24, 25]);
        const juiceTotal = juiceBottleCount * juiceUnitPrice;
        const milkTotal = milkBottleCount * milkUnitPrice;
        return {
          question: `柳橙汁 ${juiceTotal} 元，共 ${juiceBottleCount} 瓶；鮮奶 ${milkTotal} 元，共 ${milkBottleCount} 瓶，哪一種每瓶比較便宜？`,
          summary: '柳橙汁比較便宜',
          detail: `柳橙汁每瓶 ${juiceTotal} ÷ ${juiceBottleCount} = ${juiceUnitPrice} 元；鮮奶每瓶 ${milkTotal} ÷ ${milkBottleCount} = ${milkUnitPrice} 元。因為 ${juiceUnitPrice} < ${milkUnitPrice}，所以柳橙汁比較便宜。`,
        };
      },
      () => {
        const wageA = pick([3600, 4200, 4800, 5400]);
        const hourA = pick([20, 24, 30, 36]);
        const wageB = pick([4200, 4800, 5400, 6000]);
        const hourB = pick([21, 24, 27, 30]);
        const rateA = wageA / hourA;
        const rateB = wageB / hourB;
        if (!Number.isInteger(rateA) || !Number.isInteger(rateB) || rateA === rateB) return null;
        const better = rateA > rateB ? '甲的時薪較高' : '乙的時薪較高';
        return {
          question: `甲工作 ${hourA} 小時賺 ${wageA} 元；乙工作 ${hourB} 小時賺 ${wageB} 元，誰的時薪比較高？`,
          summary: better,
          detail: `甲的時薪是 ${wageA} ÷ ${hourA} = ${rateA} 元；乙的時薪是 ${wageB} ÷ ${hourB} = ${rateB} 元。因為 ${rateA > rateB ? `${rateA} > ${rateB}` : `${rateB} > ${rateA}`}，所以${better}。`,
        };
      },
      () => {
        const largeCount = pick([6, 8, 10, 12]);
        const smallCount = pick([12, 15, 18, 20]);
        const unitLarge = pick([14, 15, 16, 18]);
        const unitSmall = pick([8, 9, 10, 11]);
        const totalLarge = largeCount * unitLarge;
        const totalSmall = smallCount * unitSmall;
        const better = unitLarge > unitSmall ? '小包比較划算' : '大包比較划算';
        return {
          question: `買 ${largeCount} 個大包共 ${totalLarge} 元，買 ${smallCount} 個小包共 ${totalSmall} 元，哪一種每個平均比較便宜？`,
          summary: better,
          detail: `大包每個 ${totalLarge} ÷ ${largeCount} = ${unitLarge} 元；小包每個 ${totalSmall} ÷ ${smallCount} = ${unitSmall} 元。平均單價較小的比較划算，所以${better}。`,
        };
      },
    ];
    while (entries.length < count) {
      const entry = pick(factories)();
      if (entry) entries.push(entry);
    }
    return createResult(entries, '比較哪一種比較便宜、誰的時薪比較高，都要先把總價或總工資除成單位量，再來比較。');
  }

  function pad2(value) {
    return String(value).padStart(2, '0');
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
    return left === right ? '=' : left > right ? '>' : '<';
  }

  function formatAmPmTime(hour24, minute, second = null) {
    const period = hour24 < 12 ? '上午' : '下午';
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
    return createResult(entries, '複名數換成單名數時，要先把大單位全部換成小單位，再加上剩下的部分。');
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
    return createResult(entries, '單名數換成複名數時，用 ÷24 或 ÷60，商是大單位，餘數是小單位。');
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
    return createResult(entries, '比較時間長短時，先把兩邊換成同一種單位，再判斷大小。');
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
    return createResult(entries, '跨兩層單位換算時，要分兩步：先換第一層，再換第二層。');
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
          summary: mark === '<' ? '自己比較快' : mark === '>' ? '另一位選手比較快' : '兩人一樣快',
          detail: `把 ${minutes} 分鐘 ${seconds} 秒換成秒：${minutes} × 60 + ${seconds} = ${total} 秒。時間較短者較快，和 ${other} 秒相比，可知${mark === '<' ? '自己比較快' : mark === '>' ? '另一位選手比較快' : '兩人一樣快'}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '時間換算放進生活情境後，先判斷要換成哪個單位，再開始算。');
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
    return createResult(entries, '日與時相加時，若小時滿 24，要換成 1 日再進位。');
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
    return createResult(entries, '日與時相減時，若小時不夠減，要向日借 1 日，也就是借 24 小時。');
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
    return createResult(entries, '時與分相加時，分鐘滿 60 要換成 1 小時再進位。');
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
    return createResult(entries, '時與分相減時，若分鐘不夠減，要向小時借 60 分鐘。');
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
    return createResult(entries, '分與秒的加減都要注意 60 進位或 60 借位。');
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
        detail: `同在${periodStart === 0 ? '上午' : '下午'}，可直接用結束時刻減開始時刻：${formatAmPmTime(endHour, endMinute)} - ${formatAmPmTime(startHour, startMinute)} = ${formatTimeDuration(duration)}。`,
      });
    }
    return createResult(entries, '沒有跨中午或跨日的時刻題，可直接用結束時刻減開始時刻。');
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
    return createResult(entries, '跨中午的時刻題，先把下午時刻換成 24 時制，再做減法比較穩。');
  }

  function buildElapsedCrossDaySet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const startBase = randomMonthDay();
      const startDate = new Date(
        2026,
        startBase.month - 1,
        startBase.day,
        randInt(13, 22),
        pick([0, 8, 12, 15, 20, 24, 30, 32, 40, 45, 50]),
        0
      );
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
    return createResult(entries, '跨日的經過時間題，可用「當天剩下的時間 + 隔天的時間」或直接用 24 小時基準來算。');
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
    return createResult(entries, '題目含秒時，退位仍然照 60 進位系統來處理。');
  }

  function buildScheduleElapsedSet(count = 3) {
    const entries = [];
    const templates = [
      { item: '402 次火車', origin: '臺北', dest: '花蓮' },
      { item: '知本客運', origin: '臺東', dest: '恆春' },
      { item: '高鐵列車', origin: '新竹', dest: '臺南' },
      { item: '爸爸的白木材', origin: '加工站', dest: '家裡' },
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
    return createResult(entries, '讀時刻表時，先找出發與到達時刻，再用減法求經過時間。');
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
    return createResult(entries, '求結束時刻時，用開始時刻加上經過時間，注意分鐘滿 60 要進位。');
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
    return createResult(entries, '求開始時刻時，用結束時刻減去經過時間，注意退位。');
  }

  function buildCrossDayEndTimeSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const startBase = randomMonthDay();
      const startDate = new Date(
        2026,
        startBase.month - 1,
        startBase.day,
        randInt(7, 20),
        pick([0, 10, 20, 30, 40, 50]),
        0
      );
      const durationHours = randInt(24, 72);
      const durationMinutes = pick([0, 10, 20, 30, 40, 50]);
      const endDate = new Date(startDate.getTime() + (durationHours * 60 + durationMinutes) * 60000);
      entries.push({
        question: `從${formatMonthDayTime(startDate)}開始，連續進行${formatHourMinute(durationHours, durationMinutes)}，會在什麼時候結束？`,
        summary: formatMonthDayTime(endDate),
        detail: `先把 ${formatHourMinute(durationHours, durationMinutes)} 拆成幾日幾小時，再從開始時刻一路往後推；最後會在 ${formatMonthDayTime(endDate)} 結束。`,
      });
    }
    return createResult(entries, '往後推算跨日時刻時，若小時超過 24，要換成隔日再繼續加。');
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
    return createResult(entries, '往前推算跨日時刻時，不只要退時間，也要同步退日期。');
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
          summary:
            mark === '>' ? `${totalHours} 小時比較長` : mark === '<' ? `${days} 日 ${hours} 小時比較長` : '一樣長',
          detail: `把 ${days} 日 ${hours} 小時換成總小時：${days} × 24 + ${hours} = ${otherHours} 小時。比較 ${totalHours} 和 ${otherHours}，可知${mark === '>' ? `${totalHours} 小時比較長` : mark === '<' ? `${days} 日 ${hours} 小時比較長` : '一樣長'}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '幾日幾小時和總小時之間可互換，這是處理跨日時間的重要基礎。');
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
    return createResult(entries, '綜合應用題要先判斷是在做換算、求經過時間，還是往前往後推時刻。');
  }

  function buildTimeUnitMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '時間換算綜合：先判斷是換成單名數、複名數，還是先統一單位再比較。');
  }

  function buildTimeArithmeticMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '時間量加減綜合：注意 24 進位與 60 進位，先處理小單位。');
  }

  function buildElapsedTimeMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '經過時間綜合：先看有沒有跨中午、跨日或含秒，再決定算法。');
  }

  function buildTimePointMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '時刻推算綜合：開始時刻、結束時刻與經過時間三者之間要會互推。');
  }

  function buildCrossDayTimeMixedSet(generators, count = 5) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, '跨日時間綜合：把日期與時間一起看，必要時先換成總小時再比較。');
  }

  function squareAreaUnit(lengthUnit) {
    return lengthUnit === '公尺' ? '平方公尺' : '平方公分';
  }

  function findNonSquareFactorPairs(area, squareSide) {
    const pairs = [];
    for (let a = 1; a * a <= area; a += 1) {
      if (area % a !== 0) continue;
      const b = area / a;
      if (a !== b && a !== squareSide && b !== squareSide) {
        pairs.push([a, b]);
      }
    }
    return pairs;
  }

  function buildE426PerimeterDirectSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const unit = pick(['公分', '公尺']);
        const length = randInt(8, 36);
        const width = randInt(4, length - 2);
        const perimeter = (length + width) * 2;
        return {
          question: `一個長方形的長是 ${length} ${unit}，寬是 ${width} ${unit}，周長是多少 ${unit}？`,
          summary: `${perimeter} ${unit}`,
          detail: `長方形周長 =（長 + 寬）× 2 =（${length} + ${width}）× 2 = ${perimeter}，所以周長是 ${perimeter} ${unit}。`,
        };
      },
      () => {
        const unit = pick(['公分', '公尺']);
        const side = randInt(6, 28);
        const perimeter = side * 4;
        return {
          question: `正方形的邊長是 ${side} ${unit}，周長是多少 ${unit}？`,
          summary: `${perimeter} ${unit}`,
          detail: `正方形周長 = 邊長 × 4 = ${side} × 4 = ${perimeter}，所以周長是 ${perimeter} ${unit}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '先分清楚是長方形還是正方形，再用對應公式直接計算周長。');
  }

  function buildE426AreaDirectSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const unit = pick(['公分', '公尺']);
        const length = randInt(6, 30);
        const width = randInt(4, 24);
        const area = length * width;
        const areaUnit = squareAreaUnit(unit);
        return {
          question: `一個長方形的長是 ${length} ${unit}，寬是 ${width} ${unit}，面積是多少 ${areaUnit}？`,
          summary: `${area} ${areaUnit}`,
          detail: `長方形面積 = 長 × 寬 = ${length} × ${width} = ${area}，所以面積是 ${area} ${areaUnit}。`,
        };
      },
      () => {
        const unit = pick(['公分', '公尺']);
        const side = randInt(5, 24);
        const area = side * side;
        const areaUnit = squareAreaUnit(unit);
        return {
          question: `正方形的邊長是 ${side} ${unit}，面積是多少 ${areaUnit}？`,
          summary: `${area} ${areaUnit}`,
          detail: `正方形面積 = 邊長 × 邊長 = ${side} × ${side} = ${area}，所以面積是 ${area} ${areaUnit}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '面積題先確認兩個邊的單位相同，再代入長方形或正方形公式。');
  }

  function buildE426AreaUnitConversionSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const areaM2 = randInt(2, 30);
        const areaCm2 = areaM2 * 10000;
        return {
          question: `${areaM2} 平方公尺是多少平方公分？`,
          summary: `${formatNumber(areaCm2)} 平方公分`,
          detail: `1 平方公尺 = 10000 平方公分，所以 ${areaM2} 平方公尺 = ${areaM2} × 10000 = ${formatNumber(areaCm2)} 平方公分。`,
        };
      },
      () => {
        const areaM2 = randInt(3, 45);
        const areaCm2 = areaM2 * 10000;
        return {
          question: `${formatNumber(areaCm2)} 平方公分是多少平方公尺？`,
          summary: `${areaM2} 平方公尺`,
          detail: `10000 平方公分 = 1 平方公尺，所以 ${formatNumber(areaCm2)} 平方公分 = ${formatNumber(areaCm2)} ÷ 10000 = ${areaM2} 平方公尺。`,
        };
      },
      () => {
        const leftM2 = randInt(2, 18);
        const offset = pick([-20000, -10000, 0, 10000, 20000]);
        const rightCm2 = leftM2 * 10000 + offset;
        const symbol = leftM2 * 10000 === rightCm2 ? '=' : leftM2 * 10000 > rightCm2 ? '>' : '<';
        return {
          question: `比較 ${leftM2} 平方公尺和 ${formatNumber(rightCm2)} 平方公分的大小，填入 >、< 或 =。`,
          summary: symbol,
          detail: `把 ${leftM2} 平方公尺換成平方公分：${leftM2} × 10000 = ${formatNumber(leftM2 * 10000)} 平方公分，再和 ${formatNumber(rightCm2)} 平方公分比較，所以答案是 ${symbol}。`,
        };
      },
      () => {
        const length = randInt(6, 20);
        const width = randInt(4, 15);
        const areaM2 = length * width;
        const areaCm2 = areaM2 * 10000;
        return {
          question: `一塊長方形空地長 ${length} 公尺、寬 ${width} 公尺，面積是多少平方公分？`,
          summary: `${formatNumber(areaCm2)} 平方公分`,
          detail: `先算面積：${length} × ${width} = ${areaM2} 平方公尺。再換算成平方公分：${areaM2} × 10000 = ${formatNumber(areaCm2)} 平方公分。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '面積換算要記得是平方單位：1 平方公尺 = 10000 平方公分。');
  }

  function buildE426ReverseInferenceSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const side = randInt(6, 24);
        const perimeter = side * 4;
        const area = side * side;
        return {
          question: `正方形的周長是 ${perimeter} 公分，面積是多少平方公分？`,
          summary: `${area} 平方公分`,
          detail: `先求邊長：${perimeter} ÷ 4 = ${side}。再求面積：${side} × ${side} = ${area}，所以面積是 ${area} 平方公分。`,
        };
      },
      () => {
        const length = randInt(8, 30);
        const width = randInt(4, length - 2);
        const perimeter = (length + width) * 2;
        return {
          question: `一個長方形的周長是 ${perimeter} 公分，已知長是 ${length} 公分，寬是多少公分？`,
          summary: `${width} 公分`,
          detail: `長方形周長 ÷ 2 = 長 + 寬，所以 ${perimeter} ÷ 2 = ${length + width}。再用 ${length + width} - ${length} = ${width}，所以寬是 ${width} 公分。`,
        };
      },
      () => {
        const length = randInt(8, 24);
        const width = randInt(4, 18);
        const area = length * width;
        const perimeter = (length + width) * 2;
        return {
          question: `一張長方形卡片面積是 ${area} 平方公分，已知一邊長 ${length} 公分，周長是多少公分？`,
          summary: `${perimeter} 公分`,
          detail: `先求另一邊：${area} ÷ ${length} = ${width}。再求周長：(${length} + ${width}) × 2 = ${perimeter}，所以周長是 ${perimeter} 公分。`,
        };
      },
      () => {
        const side = randInt(5, 20);
        const area = side * side;
        const perimeter = side * 4;
        return {
          question: `正方形的面積是 ${area} 平方公分，它的周長是多少公分？`,
          summary: `${perimeter} 公分`,
          detail: `因為 ${area} = ${side} × ${side}，所以邊長是 ${side} 公分。周長 = ${side} × 4 = ${perimeter} 公分。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '逆向題先決定要先找邊長、寬或面積，再用公式一步一步倒推。');
  }

  function buildE426PerimeterAreaRelationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const squareSide = pick([8, 10, 12, 14, 16, 18]);
        const extra = pick([1, 2, 3, 4]);
        const rectLength = squareSide + extra;
        const rectWidth = squareSide - extra;
        const squareArea = squareSide * squareSide;
        const rectArea = rectLength * rectWidth;
        const larger = squareArea > rectArea ? '正方形' : '長方形';
        return {
          question: `長方形（長 ${rectLength}、寬 ${rectWidth}）與正方形（邊長 ${squareSide}）的周長都相同，哪一個面積比較大？`,
          summary: larger,
          detail: `兩者周長都等於 ${squareSide * 4}。長方形面積是 ${rectLength} × ${rectWidth} = ${rectArea}，正方形面積是 ${squareSide} × ${squareSide} = ${squareArea}，所以面積較大的是${larger}。`,
        };
      },
      () => {
        const squareSide = pick([6, 8, 9, 10, 12, 14, 15, 16]);
        const area = squareSide * squareSide;
        const pairs = findNonSquareFactorPairs(area, squareSide);
        const [rectLength, rectWidth] = pick(pairs);
        const squarePerimeter = squareSide * 4;
        const rectPerimeter = (rectLength + rectWidth) * 2;
        const larger = squarePerimeter > rectPerimeter ? '正方形' : '長方形';
        return {
          question: `正方形（邊長 ${squareSide}）和長方形（長 ${rectLength}、寬 ${rectWidth}）的面積相同，哪一個周長比較大？`,
          summary: larger,
          detail: `兩者面積都等於 ${area}。正方形周長是 ${squarePerimeter}，長方形周長是 (${rectLength} + ${rectWidth}) × 2 = ${rectPerimeter}，所以周長較大的是${larger}。`,
        };
      },
      () => {
        const side = randInt(3, 8);
        const countSquares = pick([6, 8, 10]);
        const rowA = countSquares;
        const colA = 1;
        const factorPairs = [];
        for (let a = 2; a < countSquares; a += 1) {
          if (countSquares % a === 0) {
            factorPairs.push([a, countSquares / a]);
          }
        }
        const [rowB, colB] = pick(factorPairs);
        const perimeterA = (rowA + colA) * 2 * side;
        const perimeterB = (rowB + colB) * 2 * side;
        const longer = perimeterA > perimeterB ? `${rowA} × ${colA}` : `${rowB} × ${colB}`;
        return {
          question: `用 ${countSquares} 個邊長 ${side} 公分的正方形紙片排成 ${rowA} × ${colA} 和 ${rowB} × ${colB} 兩種長方形，哪一種周長比較長？`,
          summary: longer,
          detail: `${rowA} × ${colA} 的周長是 (${rowA * side} + ${colA * side}) × 2 = ${perimeterA} 公分；${rowB} × ${colB} 的周長是 (${rowB * side} + ${colB * side}) × 2 = ${perimeterB} 公分，所以周長較長的是 ${longer}。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '這類題的重點不是只算公式，而是觀察周長相同與面積相同時，圖形之間不一定一起相同。');
  }

  function buildE426CompositeShapeSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const outerLength = randInt(14, 28);
        const outerWidth = randInt(10, 20);
        const innerLength = randInt(4, outerLength - 4);
        const innerWidth = randInt(3, outerWidth - 3);
        const remainArea = outerLength * outerWidth - innerLength * innerWidth;
        return {
          question: `一個大長方形長 ${outerLength} 公分、寬 ${outerWidth} 公分，中間挖掉一個長 ${innerLength} 公分、寬 ${innerWidth} 公分的小長方形，剩下面積是多少平方公分？`,
          summary: `${remainArea} 平方公分`,
          detail: `先算大長方形面積：${outerLength} × ${outerWidth} = ${outerLength * outerWidth}。再算挖掉的小長方形面積：${innerLength} × ${innerWidth} = ${innerLength * innerWidth}。剩下面積是 ${outerLength * outerWidth} - ${innerLength * innerWidth} = ${remainArea} 平方公分。`,
        };
      },
      () => {
        const length = randInt(12, 24);
        const width = randInt(8, 18);
        const stripWidth = randInt(1, Math.min(4, width - 2));
        const remainArea = length * width - length * stripWidth;
        return {
          question: `一塊長方形菜園長 ${length} 公尺、寬 ${width} 公尺，中間開了一條寬 ${stripWidth} 公尺、長和菜園一樣長的小路，剩下的面積是多少平方公尺？`,
          summary: `${remainArea} 平方公尺`,
          detail: `原面積是 ${length} × ${width} = ${length * width}。小路面積是 ${length} × ${stripWidth} = ${length * stripWidth}。剩下面積是 ${length * width} - ${length * stripWidth} = ${remainArea} 平方公尺。`,
        };
      },
      () => {
        const length = randInt(12, 22);
        const width = randInt(6, 12);
        const overlap = randInt(1, Math.min(5, length - 3));
        const combinedLength = length * 2 - overlap;
        const perimeter = (combinedLength + width) * 2;
        return {
          question: `兩個長 ${length} 公分、寬 ${width} 公分的長方形沿著長邊方向重疊 ${overlap} 公分拼在一起，拼好後外框周長是多少公分？`,
          summary: `${perimeter} 公分`,
          detail: `重疊後整體可看成長 ${combinedLength} 公分、寬 ${width} 公分的長方形，所以周長 = (${combinedLength} + ${width}) × 2 = ${perimeter} 公分。`,
        };
      },
      () => {
        const side = randInt(5, 14);
        const perimeter = (side * 2 + side) * 2;
        return {
          question: `把 2 個邊長 ${side} 公分的正方形並排拼成一個長方形，拼好後周長是多少公分？`,
          summary: `${perimeter} 公分`,
          detail: `拼好後是長 ${side * 2} 公分、寬 ${side} 公分的長方形，所以周長 = (${side * 2} + ${side}) × 2 = ${perimeter} 公分。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '複合圖形先想成幾個長方形或正方形的加減，周長題則先看拼接後外框變成什麼形狀。');
  }

  function buildE426MixedSet(
    generators,
    count = 5,
    intro = '周長與面積綜合題要先判斷是在考公式、換算、逆推，還是圖形之間的關係。'
  ) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, intro);
  }

  function buildE4210DirectCountSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const cubes = randInt(4, 24);
        return {
          question: `形體用了 ${cubes} 個 1 立方公分的白色積木，體積是多少立方公分？`,
          summary: `${cubes} 立方公分`,
          detail: `1 個白色積木就是 1 立方公分，所以用了 ${cubes} 個積木，體積就是 ${cubes} 立方公分。`,
        };
      },
      () => {
        const rows = randInt(2, 6);
        const cols = randInt(2, 6);
        const volume = rows * cols;
        return {
          question: `一個平面排成 ${rows} × ${cols} 的 1 層積木造型，體積是多少立方公分？`,
          summary: `${volume} 立方公分`,
          detail: `只有 1 層，所以只要數出一層有幾個積木。${rows} × ${cols} = ${volume}，體積是 ${volume} 立方公分。`,
        };
      },
      () => {
        const height = randInt(3, 12);
        return {
          question: `一個直排的積木柱高 ${height} 個小積木，全部都是 1 立方公分積木，體積是多少立方公分？`,
          summary: `${height} 立方公分`,
          detail: `每一塊積木都是 1 立方公分，共有 ${height} 塊，所以體積是 ${height} 立方公分。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '先建立 1 個白色積木 = 1 立方公分，再把看見的積木數量直接轉成體積。');
  }

  function buildE4210LayeredCountSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const top = randInt(1, 4);
        const middle = top + randInt(2, 5);
        const bottom = middle + randInt(2, 5);
        const total = top + middle + bottom;
        return {
          question: `一個立體分成上層 ${top} 個、中層 ${middle} 個、下層 ${bottom} 個積木，共有幾個積木？體積是多少立方公分？`,
          summary: `${total} 個，${total} 立方公分`,
          detail: `分層點數時先算每一層，再全部相加：${top} + ${middle} + ${bottom} = ${total}。因為 1 個積木是 1 立方公分，所以體積也是 ${total} 立方公分。`,
        };
      },
      () => {
        const first = randInt(3, 6);
        const second = first + randInt(2, 4);
        const total = first + second;
        return {
          question: `某個積木形體分成兩層，第 1 層有 ${first} 個，第 2 層有 ${second} 個，合起來體積是多少立方公分？`,
          summary: `${total} 立方公分`,
          detail: `兩層合起來共有 ${first} + ${second} = ${total} 個積木，所以體積是 ${total} 立方公分。`,
        };
      },
      () => {
        const layer1 = randInt(2, 5);
        const layer2 = layer1 + randInt(2, 4);
        const layer3 = layer2 + randInt(1, 3);
        const total = layer1 + layer2 + layer3;
        return {
          question: `某個不規則積木形體第 1 層有 ${layer1} 個、第 2 層有 ${layer2} 個、第 3 層有 ${layer3} 個，總體積是多少立方公分？`,
          summary: `${total} 立方公分`,
          detail: `不規則形體最穩的方法是分層點數：${layer1} + ${layer2} + ${layer3} = ${total}，所以體積是 ${total} 立方公分。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '看不出全部積木時，先分層數出每一層有幾個，再相加求體積。');
  }

  function buildE4210StructuredCountSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const perLayer = randInt(6, 25);
        const layers = randInt(2, 6);
        const volume = perLayer * layers;
        return {
          question: `一個積木長方體每一層有 ${perLayer} 個積木，共有 ${layers} 層，體積是多少立方公分？`,
          summary: `${volume} 立方公分`,
          detail: `結構化計數可用「一層有幾個 × 有幾層」：${perLayer} × ${layers} = ${volume}，所以體積是 ${volume} 立方公分。`,
        };
      },
      () => {
        const rows = randInt(2, 6);
        const cols = randInt(2, 6);
        const layers = randInt(2, 5);
        const perLayer = rows * cols;
        const volume = perLayer * layers;
        return {
          question: `某個長方體底面每排 ${cols} 個、共有 ${rows} 排，往上堆了 ${layers} 層，體積是多少立方公分？`,
          summary: `${volume} 立方公分`,
          detail: `先算一層有幾個：${rows} × ${cols} = ${perLayer}；再算 ${perLayer} × ${layers} = ${volume}，所以體積是 ${volume} 立方公分。`,
        };
      },
      () => {
        const front = randInt(2, 5);
        const side = randInt(2, 4);
        const height = randInt(2, 5);
        const volume = front * side * height;
        return {
          question: `一個積木長方體前面每排 ${front} 個、側面有 ${side} 排，共堆了 ${height} 層，體積是多少立方公分？`,
          summary: `${volume} 立方公分`,
          detail: `可先算底面有 ${front} × ${side} = ${front * side} 個，再乘上 ${height} 層，得到 ${front * side} × ${height} = ${volume}，所以體積是 ${volume} 立方公分。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '規則形體先抓住「一層有幾個 × 有幾層」的結構，再快速求體積。');
  }

  function buildE4210CompareOrderSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const a = randInt(8, 24);
        const b = randInt(8, 24);
        const c = randInt(8, 24);
        const pairs = [
          ['甲', a],
          ['乙', b],
          ['丙', c],
        ];
        const sorted = pairs
          .slice()
          .sort((x, y) => y[1] - x[1])
          .map(([name]) => name)
          .join('＞');
        return {
          question: `形體甲用了 ${a} 個積木，乙用了 ${b} 個積木，丙用了 ${c} 個積木，請由大到小排序體積。`,
          summary: sorted,
          detail: `每個積木都是 1 立方公分，所以比較體積就是比較積木個數。由大到小排列為 ${sorted}。`,
        };
      },
      () => {
        const a = randInt(20, 72);
        const b = randInt(10, a - 4);
        const diff = a - b;
        const larger = a > b ? '甲' : '乙';
        return {
          question: `形體甲的體積是 ${a} 立方公分，形體乙的體積是 ${b} 立方公分，哪一個比較大？相差多少立方公分？`,
          summary: `${larger}較大，相差 ${diff} 立方公分`,
          detail: `直接比較 ${a} 和 ${b}，因為 ${a} > ${b}，所以甲較大；相差 ${a} - ${b} = ${diff} 立方公分。`,
        };
      },
      () => {
        const values = shuffle([randInt(6, 15), randInt(16, 25), randInt(26, 35)]);
        const smallest = Math.min(...values);
        return {
          question: `有三個形體分別用了 ${values[0]} 個、${values[1]} 個、${values[2]} 個積木，哪一個體積最小？`,
          summary: `${smallest} 個積木的那一個`,
          detail: `因為 1 個積木就是 1 立方公分，所以體積最小就是積木數量最少的那一個，也就是 ${smallest} 個積木。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '比較體積時先回到同一個單位：白色積木個數越多，體積就越大。');
  }

  function buildE4210VolumeConservationSet(count = 3) {
    const entries = [];
    const factories = [
      () => {
        const cubes = randInt(4, 18);
        return {
          question: `用 ${cubes} 個白色積木可以拼成不同造型。只要都用了同樣多的積木，這些造型的體積一樣嗎？`,
          summary: `一樣，都是 ${cubes} 立方公分`,
          detail: `雖然外形不同，但只要積木數量一樣，體積就一樣。用了 ${cubes} 個 1 立方公分積木，所以每個造型都是 ${cubes} 立方公分。`,
        };
      },
      () => {
        const cubes = randInt(6, 20);
        return {
          question: `把 ${cubes} 個白色積木拆開後重新排成另一個形體，體積會改變嗎？`,
          summary: `不會改變，仍是 ${cubes} 立方公分`,
          detail: `重新排列只改變外形，不改變積木總數。因為還是 ${cubes} 個 1 立方公分積木，所以體積不變，仍是 ${cubes} 立方公分。`,
        };
      },
      () => {
        const cubes = randInt(5, 16);
        return {
          question: `形體甲和形體乙外形不同，但都用了 ${cubes} 個白色積木，哪一個體積比較大？`,
          summary: `一樣大，都是 ${cubes} 立方公分`,
          detail: `比較體積時看的是積木總數，不是外形。兩個形體都用了 ${cubes} 個積木，所以體積一樣大，都是 ${cubes} 立方公分。`,
        };
      },
    ];
    while (entries.length < count) {
      entries.push(pick(factories)());
    }
    return createResult(entries, '這類題的核心是體積守恆：外形改變，不代表體積改變；只要積木總數相同，體積就相同。');
  }

  function buildE4210MixedSet(
    generators,
    count = 5,
    intro = '立方公分綜合練習：先判斷是直接點數、分層點數、乘法結構、比較排序，還是體積守恆。'
  ) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, intro);
  }

  function buildE422QuadrilateralClassifySet(count = 3) {
    const entries = [];
    const factories = [
      () => ({
        question: '只有一組對邊互相平行的四邊形，稱為什麼圖形？',
        summary: '梯形',
        detail: '只有一組對邊平行，符合梯形的定義，所以是梯形。',
      }),
      () => ({
        question: '四條邊一樣長，且四個角都不是直角的四邊形，稱為什麼圖形？',
        summary: '菱形',
        detail: '四邊一樣長是菱形的重要特徵；題目又說四角都不是直角，所以不是正方形，而是菱形。',
      }),
      () => ({
        question: '有兩雙對邊分別互相平行，且兩雙對邊分別等長的四邊形，稱為什麼圖形？',
        summary: '平行四邊形',
        detail: '兩雙對邊互相平行且對邊等長，符合平行四邊形的特徵。',
      }),
      () => ({
        question: '四個角都是直角，且兩雙對邊分別等長的四邊形，稱為什麼圖形？',
        summary: '長方形',
        detail: '四個角都是直角，對邊分別等長，這是長方形的定義。',
      }),
      () => ({
        question: '四條邊一樣長，而且四個角都是直角的四邊形，稱為什麼圖形？',
        summary: '正方形',
        detail: '同時符合四邊等長和四角直角，所以是正方形。',
      }),
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '判斷四邊形名稱時，先看平行，再看直角，最後看邊長是否相等。');
  }

  function buildE422ParallelPerpendicularSet(count = 3) {
    const entries = [];
    const factories = [
      () => ({
        question: '在同一平面上，若直線 A 垂直 B，直線 B 垂直 C，則 A 和 C 的關係是什麼？',
        summary: '平行',
        detail: '兩條直線如果都垂直同一條直線，彼此就互相平行，所以 A 和 C 平行。',
      }),
      () => ({
        question: '在一個長方形中，相鄰的兩條邊是互相平行還是互相垂直？',
        summary: '互相垂直',
        detail: '長方形的四個角都是直角，所以相鄰兩邊互相垂直。',
      }),
      () => ({
        question: '兩條平行線之間的垂直線段長度，稱為什麼？',
        summary: '距離',
        detail: '兩條平行線之間最短的垂直線段，就是它們之間的距離。',
      }),
      () => ({
        question: '兩條直線相交後形成直角，這兩條直線互相是什麼關係？',
        summary: '垂直',
        detail: '形成 90° 直角的兩條直線，稱為互相垂直。',
      }),
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '平行與垂直題要先抓住兩個基本句型：都垂直同一線就平行，形成直角就垂直。');
  }

  function buildE422StructureRelationsSet(count = 3) {
    const entries = [];
    const labels = ['ABCD', 'JKLM', 'PQRS'];
    while (entries.length < count) {
      const name = pick(labels);
      const [a, b, c, d] = name.split('');
      const mode = randInt(1, 4);
      if (mode === 1) {
        entries.push({
          question: `在四邊形 ${name} 中，邊 ${a}${b} 的對邊是哪一條？`,
          summary: `${c}${d}`,
          detail: `依頂點順序看，和邊 ${a}${b} 相對的是邊 ${c}${d}。`,
        });
      } else if (mode === 2) {
        entries.push({
          question: `在四邊形 ${name} 中，邊 ${a}${d} 的兩條鄰邊分別是哪兩條？`,
          summary: `${a}${b} 和 ${c}${d}`,
          detail: `和邊 ${a}${d} 共用端點的邊就是鄰邊，所以是 ${a}${b} 和 ${c}${d}。`,
        });
      } else if (mode === 3) {
        entries.push({
          question: `連接四邊形 ${name} 相對頂點的線段，稱為什麼？`,
          summary: '對角線',
          detail: '連接相對頂點的線段叫做對角線。',
        });
      } else {
        entries.push({
          question: `一個四邊形共有幾個頂點、幾條邊和幾個角？`,
          summary: '4 個頂點、4 條邊、4 個角',
          detail: '四邊形顧名思義有 4 條邊，因此也有 4 個頂點和 4 個角。',
        });
      }
    }
    return createResult(entries, '四邊形構成要素題先把頂點順序排好，再找對邊、鄰邊與對角線。');
  }

  function buildE422DiagonalCongruenceSet(count = 3) {
    const entries = [];
    const factories = [
      () => ({
        question: '沿著長方形的一條對角線剪開，可以得到兩個全等的什麼三角形？',
        summary: '直角三角形',
        detail: '長方形有四個直角，沿對角線剪開後會得到兩個全等的直角三角形。',
      }),
      () => ({
        question: '平行四邊形沿對角線剪開後，形成的兩個三角形是否全等？',
        summary: '是',
        detail: '平行四邊形的對邊分別相等，沿一條對角線切開後，兩個三角形可以對應全等。',
      }),
      () => ({
        question: '梯形沿對角線剪開後，一定可以剪成兩個全等三角形嗎？',
        summary: '不一定',
        detail: '梯形不一定具有讓兩個三角形全等的邊角條件，所以不能直接說一定全等。',
      }),
      () => ({
        question: '菱形沿著一條對角線剪開，形成的兩個三角形是否全等？',
        summary: '是',
        detail: '菱形四邊都一樣長，沿對角線分開後兩個三角形的對應邊可以互相對上，所以全等。',
      }),
    ];
    while (entries.length < count) entries.push(pick(factories)());
    return createResult(entries, '對角線分割題的重點是看剪開後兩邊的邊長和角度能不能一一對應。');
  }

  function buildE422PerimeterDirectSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const mode = randInt(1, 4);
      if (mode === 1) {
        const side = randInt(4, 18);
        entries.push({
          question: `一個正方形的邊長是 ${side} 公分，周長是多少公分？`,
          summary: `${side * 4} 公分`,
          detail: `正方形四邊一樣長，所以周長 = ${side} × 4 = ${side * 4} 公分。`,
        });
      } else if (mode === 2) {
        const length = randInt(6, 20);
        const width = randInt(4, length - 1);
        entries.push({
          question: `一個長方形的長是 ${length} 公分、寬是 ${width} 公分，周長是多少公分？`,
          summary: `${(length + width) * 2} 公分`,
          detail: `長方形周長 = （長 + 寬）× 2 = （${length} + ${width}）× 2 = ${(length + width) * 2} 公分。`,
        });
      } else if (mode === 3) {
        const side = randInt(5, 16);
        entries.push({
          question: `一個菱形的一條邊長是 ${side} 公分，周長是多少公分？`,
          summary: `${side * 4} 公分`,
          detail: `菱形四邊都一樣長，所以周長 = ${side} × 4 = ${side * 4} 公分。`,
        });
      } else {
        const a = randInt(5, 14);
        const b = randInt(4, 12);
        entries.push({
          question: `平行四邊形相鄰兩邊分別是 ${a} 公分和 ${b} 公分，周長是多少公分？`,
          summary: `${(a + b) * 2} 公分`,
          detail: `平行四邊形對邊相等，所以周長 = （${a} + ${b}）× 2 = ${(a + b) * 2} 公分。`,
        });
      }
    }
    return createResult(entries, '周長題先認出圖形的邊長特性，再決定是四邊相加還是用成對邊的公式。');
  }

  function buildE422PerimeterReverseSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const mode = randInt(1, 3);
      if (mode === 1) {
        const side = randInt(4, 18);
        const perimeter = side * 4;
        entries.push({
          question: `一個正方形的周長是 ${perimeter} 公分，它的邊長是多少公分？`,
          summary: `${side} 公分`,
          detail: `正方形四邊一樣長，所以邊長 = ${perimeter} ÷ 4 = ${side} 公分。`,
        });
      } else if (mode === 2) {
        const length = randInt(6, 20);
        const width = randInt(4, length - 1);
        const perimeter = (length + width) * 2;
        entries.push({
          question: `一個長方形的周長是 ${perimeter} 公分，已知長是 ${length} 公分，寬是多少公分？`,
          summary: `${width} 公分`,
          detail: `先算一組長加寬：${perimeter} ÷ 2 = ${length + width}。再用 ${length + width} - ${length} = ${width}，所以寬是 ${width} 公分。`,
        });
      } else {
        const side = randInt(5, 16);
        const perimeter = side * 4;
        entries.push({
          question: `一個菱形的周長是 ${perimeter} 公分，一條邊長是多少公分？`,
          summary: `${side} 公分`,
          detail: `菱形四邊都一樣長，所以邊長 = ${perimeter} ÷ 4 = ${side} 公分。`,
        });
      }
    }
    return createResult(entries, '逆推周長題時，先用圖形特性把周長拆成等分或一組一組來回推。');
  }

  function buildE422MixedSet(
    generators,
    count = 5,
    intro = '四邊形綜合題先判斷是在看性質、構成關係、對角線，還是周長。'
  ) {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, intro);
  }

  function buildE415BasicConversionSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      if (Math.random() < 0.5) {
        const km = randInt(2, 180);
        const meters = km * 1000;
        entries.push({
          question: `${km} 公里 = （　）公尺`,
          summary: `${formatNumber(meters)}`,
          detail: `1 公里 = 1000 公尺，所以 ${km} 公里 = ${km} × 1000 = ${formatNumber(meters)} 公尺。`,
        });
      } else {
        const km = randInt(2, 180);
        const meters = km * 1000;
        entries.push({
          question: `${formatNumber(meters)} 公尺 = （　）公里`,
          summary: `${km}`,
          detail: `1000 公尺 = 1 公里，所以 ${formatNumber(meters)} 公尺 ÷ 1000 = ${km} 公里。`,
        });
      }
    }
    return createResult(entries, '先記住 1 公里 = 1000 公尺，再判斷是乘 1000 還是除 1000。');
  }

  function buildE415CompoundConversionSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      if (Math.random() < 0.5) {
        const km = randInt(1, 12);
        const meters = randInt(1, 999);
        const total = km * 1000 + meters;
        entries.push({
          question: `${km} 公里 ${meters} 公尺 = （　）公尺`,
          summary: `${formatNumber(total)}`,
          detail: `${km} 公里 = ${formatNumber(km * 1000)} 公尺，再加上 ${meters} 公尺，所以共 ${formatNumber(total)} 公尺。`,
        });
      } else {
        const km = randInt(1, 12);
        const meters = randInt(1, 999);
        const total = km * 1000 + meters;
        entries.push({
          question: `${formatNumber(total)} 公尺 = （　）公里（　）公尺`,
          summary: `${km} 公里 ${meters} 公尺`,
          detail: `${formatNumber(total)} 公尺 ÷ 1000 = ${km} 公里，餘 ${meters} 公尺，所以是 ${km} 公里 ${meters} 公尺。`,
        });
      }
    }
    return createResult(entries, '複名數換算時，先把公里換成公尺；反過來時再用 1000 公尺一組去分。');
  }

  function buildE415ThreeUnitConversionSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const mode = randInt(1, 3);
      if (mode === 1) {
        const km = randInt(1, 25);
        const cm = km * 100000;
        entries.push({
          question: `${km} 公里 = （　）公分`,
          summary: `${formatNumber(cm)}`,
          detail: `1 公里 = 1000 公尺，1 公尺 = 100 公分，所以 1 公里 = 100000 公分。${km} 公里 = ${formatNumber(cm)} 公分。`,
        });
      } else if (mode === 2) {
        const km = randInt(1, 18);
        const m = randInt(0, 999);
        const cm = km * 100000 + m * 100;
        entries.push({
          question: `${formatNumber(cm)} 公分 = （　）公里（　）公尺`,
          summary: `${km} 公里 ${m} 公尺`,
          detail: `先把 ${formatNumber(cm)} 公分換成公尺：${formatNumber(cm)} ÷ 100 = ${formatNumber(km * 1000 + m)} 公尺，再拆成 ${km} 公里 ${m} 公尺。`,
        });
      } else {
        const meters = randInt(20, 980);
        const cm = meters * 100;
        entries.push({
          question: `${meters} 公尺 = （　）公分`,
          summary: `${formatNumber(cm)}`,
          detail: `1 公尺 = 100 公分，所以 ${meters} 公尺 = ${meters} × 100 = ${formatNumber(cm)} 公分。`,
        });
      }
    }
    return createResult(entries, '跨到公分時要注意是 100 倍關係；公里到公分則是 100000 倍。');
  }

  function buildE415CompareSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const mode = randInt(1, 3);
      if (mode === 1) {
        const km = randInt(1, 9);
        const meters = randInt(100, 9800);
        const left = km * 1000;
        const symbol = left > meters ? '>' : left < meters ? '<' : '=';
        entries.push({
          question: `${km} 公里 □ ${formatNumber(meters)} 公尺`,
          summary: symbol,
          detail: `${km} 公里 = ${formatNumber(left)} 公尺，和 ${formatNumber(meters)} 公尺比較，可得應填 ${symbol}。`,
        });
      } else if (mode === 2) {
        const km = randInt(1, 5);
        const m = randInt(0, 999);
        const cm = randInt(10000, 599999);
        const left = km * 100000 + m * 100;
        const symbol = left > cm ? '>' : left < cm ? '<' : '=';
        entries.push({
          question: `${km} 公里 ${m} 公尺 □ ${formatNumber(cm)} 公分`,
          summary: symbol,
          detail: `${km} 公里 ${m} 公尺 = ${formatNumber(left)} 公分，再與 ${formatNumber(cm)} 公分比較，所以填 ${symbol}。`,
        });
      } else {
        const a = randInt(2, 8) * 1000 + randInt(0, 999);
        const b = randInt(2, 8) * 1000 + randInt(0, 999);
        if (a === b) continue;
        entries.push({
          question: `把 ${formatNumber(a)} 公尺和 ${formatNumber(b)} 公尺由大到小排列。`,
          summary: `${formatNumber(Math.max(a, b))} 公尺、${formatNumber(Math.min(a, b))} 公尺`,
          detail: `兩個量本來就同單位，直接比較數字大小即可，所以由大到小是 ${formatNumber(Math.max(a, b))} 公尺、${formatNumber(Math.min(a, b))} 公尺。`,
        });
      }
    }
    return createResult(entries, '比較前先把不同單位換成同單位，再由數字大小判斷。');
  }

  function buildE415AddSubtractSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const useAdd = Math.random() < 0.5;
      const aKm = randInt(1, 9);
      const aM = randInt(0, 999);
      const bKm = randInt(1, 9);
      const bM = randInt(0, 999);
      const totalA = aKm * 1000 + aM;
      const totalB = bKm * 1000 + bM;
      if (!useAdd && totalA <= totalB) continue;
      const result = useAdd ? totalA + totalB : totalA - totalB;
      const rKm = Math.floor(result / 1000);
      const rM = result % 1000;
      entries.push({
        question: `${aKm} 公里 ${aM} 公尺 ${useAdd ? '+' : '-'} ${bKm} 公里 ${bM} 公尺 = （　）`,
        summary: `${rKm} 公里 ${rM} 公尺`,
        detail: `先都換成公尺：${aKm} 公里 ${aM} 公尺 = ${formatNumber(totalA)} 公尺，${bKm} 公里 ${bM} 公尺 = ${formatNumber(totalB)} 公尺。${useAdd ? '相加' : '相減'}後得 ${formatNumber(result)} 公尺，再換回 ${rKm} 公里 ${rM} 公尺。`,
      });
    }
    return createResult(entries, '加減複名數時，先換成公尺最穩，再視需要換回幾公里幾公尺。');
  }

  function buildE415MixedSet(generators, count = 5, intro = '公里綜合題先判斷是在做換算、比較，還是加減。') {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, intro);
  }

  function buildE416AngleClassifySet(count = 3) {
    const entries = [];
    const types = [
      {
        name: '銳角三角形',
        make() {
          const a = randInt(35, 75);
          const b = randInt(35, 70);
          const c = 180 - a - b;
          return c > 0 && c < 90 ? [a, b, c] : null;
        },
      },
      {
        name: '直角三角形',
        make() {
          const a = 90;
          const b = randInt(25, 65);
          return [a, b, 90 - b];
        },
      },
      {
        name: '鈍角三角形',
        make() {
          const a = randInt(95, 130);
          const b = randInt(20, 40);
          const c = 180 - a - b;
          return c > 0 ? [a, b, c] : null;
        },
      },
    ];
    while (entries.length < count) {
      const target = pick(types);
      const angles = target.make();
      if (!angles) continue;
      const shuffled = shuffle(angles);
      entries.push({
        question: `三個角分別是 ${shuffled[0]}°、${shuffled[1]}°、${shuffled[2]}°，是什麼三角形？`,
        summary: target.name,
        detail: `看最大的角就能判斷。這三個角中最大角符合 ${target.name} 的特徵，所以是 ${target.name}。`,
      });
    }
    return createResult(entries, '依角分類時，先看三個角中最大的那一個最有效率。');
  }

  function buildE416SideClassifySet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const mode = randInt(1, 3);
      if (mode === 1) {
        const side = randInt(4, 12);
        entries.push({
          question: `三角形的三邊長分別是 ${side} 公分、${side} 公分、${side} 公分，它是什麼三角形？`,
          summary: '正三角形',
          detail: `三邊都一樣長，所以是正三角形。`,
        });
      } else if (mode === 2) {
        const equal = randInt(5, 14);
        const base = randInt(3, equal * 2 - 1);
        if (base === equal) continue;
        entries.push({
          question: `三角形的三邊長分別是 ${equal} 公分、${equal} 公分、${base} 公分，它是什麼三角形？`,
          summary: '等腰三角形',
          detail: `有兩邊一樣長，所以是等腰三角形。`,
        });
      } else {
        let a = randInt(4, 12);
        let b = randInt(5, 13);
        let c = randInt(6, 14);
        if (a === b || b === c || a === c || a + b <= c || a + c <= b || b + c <= a) continue;
        entries.push({
          question: `三角形的三邊長分別是 ${a} 公分、${b} 公分、${c} 公分，它是什麼三角形？`,
          summary: '一般三角形',
          detail: `三邊都不一樣長，所以是一般三角形。`,
        });
      }
    }
    return createResult(entries, '依邊分類時，先看是不是三邊相等，再看是不是只有兩邊相等。');
  }

  function buildE416SideAngleCombinedSet(count = 3) {
    const entries = [];
    const factories = [
      () => ({
        question: '一個三角形有兩個邊一樣長，且最大角是 90°，它依角和邊分類各是什麼？',
        summary: '直角三角形、等腰三角形',
        detail: '最大角是 90°，所以依角分類是直角三角形；有兩邊一樣長，所以依邊分類是等腰三角形。',
      }),
      () => ({
        question: '一個三角形三邊都一樣長，它的三個角各是幾度？依角分類是什麼三角形？',
        summary: '60°、60°、60°，銳角三角形',
        detail: '正三角形三邊相等，三個角都一樣大，180° 平分成 3 份就是 60°，所以依角分類是銳角三角形。',
      }),
      () => {
        const base = randInt(20, 70);
        const top = 180 - base * 2;
        if (top <= 0) return null;
        const angleType = top === 90 ? '直角三角形' : top > 90 ? '鈍角三角形' : '銳角三角形';
        return {
          question: `一個等腰三角形的底角都是 ${base}°，它的頂角是幾度？依角分類是什麼三角形？`,
          summary: `${top}°，${angleType}`,
          detail: `三角形內角和是 180°，頂角 = 180° - ${base}° - ${base}° = ${top}°。再看最大角 ${top}°，所以依角分類是 ${angleType}。`,
        };
      },
    ];
    while (entries.length < count) {
      const item = pick(factories)();
      if (!item) continue;
      entries.push(item);
    }
    return createResult(entries, '同時依角和依邊分類時，要把兩種條件分開判斷。');
  }

  function buildE416SpecialAngleSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const mode = randInt(1, 3);
      if (mode === 1) {
        const top = randInt(30, 120);
        const base = (180 - top) / 2;
        if (!Number.isInteger(base)) continue;
        entries.push({
          question: `一個等腰三角形的頂角是 ${top}°，一個底角是幾度？`,
          summary: `${base}°`,
          detail: `兩個底角一樣大，所以先算 180° - ${top}° = ${180 - top}°，再平分成 2 份，得到 ${base}°。`,
        });
      } else if (mode === 2) {
        const base = randInt(25, 75);
        const top = 180 - base * 2;
        if (top <= 0) continue;
        entries.push({
          question: `一個等腰三角形的一個底角是 ${base}°，它的頂角是幾度？`,
          summary: `${top}°`,
          detail: `等腰三角形兩個底角一樣大，所以頂角 = 180° - ${base}° - ${base}° = ${top}°。`,
        });
      } else {
        const acute = randInt(20, 70);
        const other = 90 - acute;
        entries.push({
          question: `在直角三角形中，已知一個銳角是 ${acute}°，另一個銳角是幾度？`,
          summary: `${other}°`,
          detail: `直角三角形的兩個銳角和是 90°，所以另一個銳角是 90° - ${acute}° = ${other}°。`,
        });
      }
    }
    return createResult(entries, '特殊角度題常用到兩個關鍵：內角和 180°，以及等腰三角形兩底角相等。');
  }

  function buildE416PerimeterDirectSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const mode = randInt(1, 2);
      if (mode === 1) {
        const side = randInt(4, 16);
        entries.push({
          question: `一個正三角形的邊長是 ${side} 公分，周長是多少公分？`,
          summary: `${side * 3} 公分`,
          detail: `正三角形三邊一樣長，所以周長 = ${side} × 3 = ${side * 3} 公分。`,
        });
      } else {
        const equal = randInt(5, 16);
        const base = randInt(3, equal * 2 - 1);
        entries.push({
          question: `一個等腰三角形的腰長都是 ${equal} 公分，底邊長 ${base} 公分，周長是多少公分？`,
          summary: `${equal * 2 + base} 公分`,
          detail: `等腰三角形有兩條腰一樣長，所以周長 = ${equal} + ${equal} + ${base} = ${equal * 2 + base} 公分。`,
        });
      }
    }
    return createResult(entries, '周長題先分清楚是哪一種三角形，再用它的邊長特性相加。');
  }

  function buildE416PerimeterReverseSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const mode = randInt(1, 2);
      if (mode === 1) {
        const side = randInt(4, 16);
        const perimeter = side * 3;
        entries.push({
          question: `一個正三角形的周長是 ${perimeter} 公分，每一邊長是多少公分？`,
          summary: `${side} 公分`,
          detail: `正三角形三邊一樣長，所以每邊長 = ${perimeter} ÷ 3 = ${side} 公分。`,
        });
      } else {
        const equal = randInt(5, 16);
        const base = randInt(3, equal * 2 - 1);
        const perimeter = equal * 2 + base;
        entries.push({
          question: `一個等腰三角形的周長是 ${perimeter} 公分，底邊長 ${base} 公分，一條腰長是多少公分？`,
          summary: `${equal} 公分`,
          detail: `先扣掉底邊：${perimeter} - ${base} = ${equal * 2}，剩下的是兩條腰，再除以 2，得到 ${equal} 公分。`,
        });
      }
    }
    return createResult(entries, '逆推邊長時，先看哪幾條邊相等，再把相等的部分一起處理。');
  }

  function buildE416CongruentAngleSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const angle = randInt(35, 125);
      const left = pick(['∠A', '∠B', '∠C']);
      const right = pick(['∠D', '∠E', '∠F']);
      entries.push({
        question: `甲、乙兩個三角形全等，已知 ${left} = ${angle}°，則它的對應角 ${right} 是幾度？`,
        summary: `${angle}°`,
        detail: `全等三角形的對應角一樣大，所以 ${right} = ${angle}°。`,
      });
    }
    return createResult(entries, '全等三角形題先抓住一句話：對應角一樣大。');
  }

  function buildE416CongruentSideSet(count = 3) {
    const entries = [];
    while (entries.length < count) {
      const side = randInt(4, 20);
      const left = pick(['AB', 'BC', 'CA']);
      const right = pick(['DE', 'EF', 'FD']);
      entries.push({
        question: `甲、乙兩個三角形全等，已知甲的 ${left} 邊長是 ${side} 公分，則乙的對應邊 ${right} 長是多少公分？`,
        summary: `${side} 公分`,
        detail: `全等三角形的對應邊一樣長，所以乙的 ${right} 也是 ${side} 公分。`,
      });
    }
    return createResult(entries, '全等三角形的邊長判斷要先找對應邊，再直接搬過去。');
  }

  function buildE416MixedSet(generators, count = 5, intro = '三角形綜合題先判斷是在分類、角度、周長，還是全等對應。') {
    const entries = shuffle(generators.flatMap((generator) => takeGenerated(generator, count))).slice(0, count);
    return createResult(entries, intro);
  }

  store.registerConfigs({
    'e4-2-1-multiply-standard-drill': {
      type: 'drill',
      title: '三、四位數乘以三位數',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildMultiplyStandardSet(3);
      },
    },
    'e4-2-1-multiply-zero-ending-drill': {
      type: 'drill',
      title: '末幾位為 0 的乘法',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildMultiplyZeroEndingSet(3);
      },
    },
    'e4-2-1-divide-standard-drill': {
      type: 'drill',
      title: '三、四位數除以三位數',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildDivideStandardSet(3);
      },
    },
    'e4-2-1-divide-zero-ending-drill': {
      type: 'drill',
      title: '末幾位為 0 的除法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildDivideZeroEndingSet(3);
      },
    },
    'e4-2-1-word-problem-drill': {
      type: 'drill',
      title: '乘除法生活應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildWordProblemSet(3);
      },
    },
    'e4-2-1-multiply-standard-mixed': {
      type: 'drill',
      title: '三、四位數乘以三位數綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildMixedSet([buildMultiplyStandardSet], 5);
      },
    },
    'e4-2-1-multiply-zero-ending-mixed': {
      type: 'drill',
      title: '末幾位為 0 的乘法綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildMixedSet([buildMultiplyZeroEndingSet], 5);
      },
    },
    'e4-2-1-divide-standard-mixed': {
      type: 'drill',
      title: '三、四位數除以三位數綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildMixedSet([buildDivideStandardSet], 5);
      },
    },
    'e4-2-1-divide-zero-ending-mixed': {
      type: 'drill',
      title: '末幾位為 0 的除法綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildMixedSet([buildDivideZeroEndingSet], 5);
      },
    },
    'e4-2-1-word-problem-mixed': {
      type: 'drill',
      title: '多位數乘除生活應用綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildMixedSet([buildWordProblemSet], 5);
      },
    },
    'e4-2-2-quadrilateral-classify-drill': {
      type: 'drill',
      title: '四邊形性質與名稱辨識',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE422QuadrilateralClassifySet(3);
      },
    },
    'e4-2-2-parallel-perpendicular-drill': {
      type: 'drill',
      title: '平行與垂直判定',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE422ParallelPerpendicularSet(3);
      },
    },
    'e4-2-2-structure-relations-drill': {
      type: 'drill',
      title: '構成要素與邊角關係',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE422StructureRelationsSet(3);
      },
    },
    'e4-2-2-diagonal-congruence-drill': {
      type: 'drill',
      title: '對角線分割與全等判別',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE422DiagonalCongruenceSet(3);
      },
    },
    'e4-2-2-perimeter-direct-drill': {
      type: 'drill',
      title: '四邊形周長直接計算',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE422PerimeterDirectSet(3);
      },
    },
    'e4-2-2-perimeter-reverse-drill': {
      type: 'drill',
      title: '四邊形周長逆向求邊',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE422PerimeterReverseSet(3);
      },
    },
    'e4-2-2-property-basic-mixed': {
      type: 'drill',
      title: '性質判斷基礎綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE422MixedSet(
          [buildE422QuadrilateralClassifySet, buildE422ParallelPerpendicularSet],
          5,
          '這組先分辨四邊形名稱，再判斷平行和垂直關係。'
        );
      },
    },
    'e4-2-2-structure-diagonal-mixed': {
      type: 'drill',
      title: '構成要素與對角線綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE422MixedSet(
          [buildE422StructureRelationsSet, buildE422DiagonalCongruenceSet],
          5,
          '先認清對邊、鄰邊、對角線，再判斷剪開後的三角形關係。'
        );
      },
    },
    'e4-2-2-perimeter-mixed': {
      type: 'drill',
      title: '周長計算綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE422MixedSet(
          [buildE422PerimeterDirectSet, buildE422PerimeterReverseSet],
          5,
          '周長題先認圖形特性，再決定是直接套公式還是逆向回推。'
        );
      },
    },
    'e4-2-2-quadrilateral-overview-mixed': {
      type: 'drill',
      title: '四邊形章節綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE422MixedSet(
          [buildE422QuadrilateralClassifySet, buildE422StructureRelationsSet, buildE422PerimeterDirectSet],
          5,
          '四邊形章節綜合題會交錯考名稱辨識、構成關係與周長。'
        );
      },
    },
    'e4-2-3-exact-approx-judge-drill': {
      type: 'drill',
      title: '概數與精確數判斷',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildExactApproxJudgeSet(3);
      },
    },
    'e4-2-3-ceil-estimate-drill': {
      type: 'drill',
      title: '無條件進入法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildCeilEstimateSet(3);
      },
    },
    'e4-2-3-floor-estimate-drill': {
      type: 'drill',
      title: '無條件捨去法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildFloorEstimateSet(3);
      },
    },
    'e4-2-3-round-nearest-reverse-drill': {
      type: 'drill',
      title: '四捨五入與反推範圍',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildRoundNearestReverseSet(3);
      },
    },
    'e4-2-3-estimate-application-drill': {
      type: 'drill',
      title: '概數估算應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildEstimateApplicationSet(3);
      },
    },
    'e4-2-3-exact-approx-judge-mixed': {
      type: 'drill',
      title: '概數與精確數判斷綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildEstimateMixedSet([buildExactApproxJudgeSet], 5);
      },
    },
    'e4-2-3-ceil-estimate-mixed': {
      type: 'drill',
      title: '無條件進入法綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildEstimateMixedSet([buildCeilEstimateSet], 5);
      },
    },
    'e4-2-3-floor-estimate-mixed': {
      type: 'drill',
      title: '無條件捨去法綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildEstimateMixedSet([buildFloorEstimateSet], 5);
      },
    },
    'e4-2-3-round-nearest-reverse-mixed': {
      type: 'drill',
      title: '四捨五入與反推範圍綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildEstimateMixedSet([buildRoundNearestReverseSet], 5);
      },
    },
    'e4-2-3-estimate-application-mixed': {
      type: 'drill',
      title: '概數估算應用綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildEstimateMixedSet([buildEstimateApplicationSet], 5);
      },
    },
    'e4-2-4-pattern-sequence-drill': {
      type: 'drill',
      title: '圖形週期與鋪排預測',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildPatternSequenceSet(3);
      },
    },
    'e4-2-4-number-table-drill': {
      type: 'drill',
      title: '數字表格與百數表規律',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildNumberTablePatternSet(3);
      },
    },
    'e4-2-4-calendar-pattern-drill': {
      type: 'drill',
      title: '月曆日期規律',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildCalendarPatternSet(3);
      },
    },
    'e4-2-4-parity-digit-drill': {
      type: 'drill',
      title: '奇偶運算與數字卡',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildParityDigitSet(3);
      },
    },
    'e4-2-4-seat-number-drill': {
      type: 'drill',
      title: '座位門牌與週期編號',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildSeatNumberPatternSet(3);
      },
    },
    'e4-2-4-pattern-sequence-mixed': {
      type: 'drill',
      title: '圖形週期與鋪排預測綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildQuantityPatternMixedSet([buildPatternSequenceSet], 5);
      },
    },
    'e4-2-4-number-table-mixed': {
      type: 'drill',
      title: '數字表格與百數表規律綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildQuantityPatternMixedSet([buildNumberTablePatternSet], 5);
      },
    },
    'e4-2-4-calendar-pattern-mixed': {
      type: 'drill',
      title: '月曆日期規律綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildQuantityPatternMixedSet([buildCalendarPatternSet], 5);
      },
    },
    'e4-2-4-parity-digit-mixed': {
      type: 'drill',
      title: '奇偶運算與數字卡綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildQuantityPatternMixedSet([buildParityDigitSet], 5);
      },
    },
    'e4-2-4-seat-number-mixed': {
      type: 'drill',
      title: '座位門牌與週期編號綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildQuantityPatternMixedSet([buildSeatNumberPatternSet], 5);
      },
    },
    'e4-1-7-decimal-add-drill': {
      type: 'drill',
      title: '二位小數的加法',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE417DecimalAddSet(3);
      },
    },
    'e4-1-7-decimal-add-missing-place-drill': {
      type: 'drill',
      title: '缺位小數加法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE417DecimalAddMissingPlaceSet(3);
      },
    },
    'e4-1-7-decimal-subtract-drill': {
      type: 'drill',
      title: '二位小數的減法',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE417DecimalSubtractSet(3);
      },
    },
    'e4-1-7-integer-decimal-subtract-drill': {
      type: 'drill',
      title: '整數或缺位小數的減法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE417IntegerDecimalSubtractSet(3);
      },
    },
    'e4-1-7-decimal-sum-word-drill': {
      type: 'drill',
      title: '小數加法應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE417DecimalSumWordSet(3);
      },
    },
    'e4-1-7-decimal-difference-word-drill': {
      type: 'drill',
      title: '小數減法應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE417DecimalDifferenceWordSet(3);
      },
    },
    'e4-1-7-decimal-compare-application-drill': {
      type: 'drill',
      title: '已知差量求另一量',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE417DecimalCompareApplicationSet(3);
      },
    },
    'e4-1-7-decimal-two-step-word-drill': {
      type: 'drill',
      title: '兩步驟小數應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE417DecimalTwoStepWordSet(3);
      },
    },
    'e4-1-7-decimal-unit-conversion-drill': {
      type: 'drill',
      title: '公尺公分換算應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE417DecimalUnitConversionSet(3);
      },
    },
    'e4-1-7-basic-calculation-mixed': {
      type: 'drill',
      title: '基礎直式混合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE417DecimalMixedSet([buildE417DecimalAddSet, buildE417DecimalSubtractSet], 5);
      },
    },
    'e4-1-7-place-value-alignment-mixed': {
      type: 'drill',
      title: '位值補 0 混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE417DecimalMixedSet([buildE417DecimalAddMissingPlaceSet, buildE417IntegerDecimalSubtractSet], 5);
      },
    },
    'e4-1-7-sum-difference-application-mixed': {
      type: 'drill',
      title: '加減生活應用混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE417DecimalMixedSet([buildE417DecimalSumWordSet, buildE417DecimalDifferenceWordSet], 5);
      },
    },
    'e4-1-7-two-step-application-mixed': {
      type: 'drill',
      title: '兩步驟綜合混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE417DecimalMixedSet([buildE417DecimalCompareApplicationSet, buildE417DecimalTwoStepWordSet], 5);
      },
    },
    'e4-1-7-unit-conversion-mixed': {
      type: 'drill',
      title: '單位換算混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE417DecimalMixedSet([buildE417DecimalUnitConversionSet], 5);
      },
    },
    'e4-1-8-add-sub-left-to-right-drill': {
      type: 'drill',
      title: '同級加減由左而右',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE418AddSubtractLeftToRightSet(3);
      },
    },
    'e4-1-8-mul-div-left-to-right-drill': {
      type: 'drill',
      title: '同級乘除由左而右',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE418MulDivLeftToRightSet(3);
      },
    },
    'e4-1-8-mixed-no-bracket-drill': {
      type: 'drill',
      title: '先乘除後加減',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE418MixedNoBracketSet(3);
      },
    },
    'e4-1-8-bracket-order-drill': {
      type: 'drill',
      title: '含括號的運算順序',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE418BracketOrderSet(3);
      },
    },
    'e4-1-8-order-judge-drill': {
      type: 'drill',
      title: '運算順序概念辨析',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE418OrderJudgeSet(3);
      },
    },
    'e4-1-8-application-expression-drill': {
      type: 'drill',
      title: '多步驟應用列式',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE418ApplicationExpressionSet(3);
      },
    },
    'e4-1-8-same-level-order-mixed': {
      type: 'drill',
      title: '同級運算順序混合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE418OrderMixedSet([buildE418AddSubtractLeftToRightSet, buildE418MulDivLeftToRightSet], 5);
      },
    },
    'e4-1-8-bracket-order-mixed': {
      type: 'drill',
      title: '括號改變順序混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE418OrderMixedSet([buildE418BracketOrderSet], 5);
      },
    },
    'e4-1-8-precedence-mixed': {
      type: 'drill',
      title: '先乘除後加減混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE418OrderMixedSet([buildE418MixedNoBracketSet], 5);
      },
    },
    'e4-1-8-order-judge-mixed': {
      type: 'drill',
      title: '順序概念辨析混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE418OrderMixedSet([buildE418OrderJudgeSet], 5);
      },
    },
    'e4-1-8-application-mixed': {
      type: 'drill',
      title: '多步驟應用列式混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE418OrderMixedSet([buildE418ApplicationExpressionSet], 5);
      },
    },
    'e4-1-9-improper-mixed-drill': {
      type: 'drill',
      title: '假分數與帶分數互換',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE419ImproperMixedSet(3);
      },
    },
    'e4-1-9-same-denominator-compare-drill': {
      type: 'drill',
      title: '同分母分數大小比較',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE419SameDenominatorCompareSet(3);
      },
    },
    'e4-1-9-same-denominator-add-drill': {
      type: 'drill',
      title: '同分母分數加法',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE419SameDenominatorAddSet(3);
      },
    },
    'e4-1-9-same-denominator-subtract-drill': {
      type: 'drill',
      title: '同分母分數減法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE419SameDenominatorSubtractSet(3);
      },
    },
    'e4-1-9-fraction-times-integer-drill': {
      type: 'drill',
      title: '分數乘整數',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE419FractionTimesIntegerSet(3);
      },
    },
    'e4-1-9-compare-application-drill': {
      type: 'drill',
      title: '分數大小比較應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE419FractionCompareApplicationSet(3);
      },
    },
    'e4-1-9-add-application-drill': {
      type: 'drill',
      title: '同分母分數加法應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE419FractionAddApplicationSet(3);
      },
    },
    'e4-1-9-subtract-application-drill': {
      type: 'drill',
      title: '同分母分數減法應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE419FractionSubtractApplicationSet(3);
      },
    },
    'e4-1-9-times-integer-application-drill': {
      type: 'drill',
      title: '分數乘整數應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE419FractionTimesIntegerApplicationSet(3);
      },
    },
    'e4-1-9-unit-representation-drill': {
      type: 'drill',
      title: '單位量與分數表示',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE419UnitFractionRepresentationSet(3);
      },
    },
    'e4-1-9-conversion-compare-mixed': {
      type: 'drill',
      title: '換算與比較混合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE419FractionMixedSet([buildE419ImproperMixedSet, buildE419SameDenominatorCompareSet], 5);
      },
    },
    'e4-1-9-same-denominator-add-mixed': {
      type: 'drill',
      title: '同分母加法混合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE419FractionMixedSet([buildE419SameDenominatorAddSet, buildE419FractionAddApplicationSet], 5);
      },
    },
    'e4-1-9-same-denominator-subtract-mixed': {
      type: 'drill',
      title: '同分母減法混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE419FractionMixedSet(
          [buildE419SameDenominatorSubtractSet, buildE419FractionSubtractApplicationSet],
          5
        );
      },
    },
    'e4-1-9-fraction-times-integer-mixed': {
      type: 'drill',
      title: '分數乘整數混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE419FractionMixedSet(
          [buildE419FractionTimesIntegerSet, buildE419FractionTimesIntegerApplicationSet],
          5
        );
      },
    },
    'e4-1-9-application-representation-mixed': {
      type: 'drill',
      title: '應用與分數表示混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE419FractionMixedSet(
          [buildE419FractionCompareApplicationSet, buildE419UnitFractionRepresentationSet],
          5
        );
      },
    },
    'e4-2-5-decimal-multiply-basic-drill': {
      type: 'drill',
      title: '小數乘整數直式',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildDecimalMultiplyBasicSet(3);
      },
    },
    'e4-2-5-decimal-zero-ending-drill': {
      type: 'drill',
      title: '末位 0 與整十整百乘法',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildDecimalZeroEndingSet(3);
      },
    },
    'e4-2-5-decimal-single-step-word-drill': {
      type: 'drill',
      title: '小數乘法生活單步題',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildDecimalSingleStepWordSet(3);
      },
    },
    'e4-2-5-decimal-two-step-word-drill': {
      type: 'drill',
      title: '兩步驟小數乘法應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildDecimalTwoStepWordSet(3);
      },
    },
    'e4-2-5-decimal-concept-drill': {
      type: 'drill',
      title: '小數數線與分數換算',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildDecimalConceptSet(3);
      },
    },
    'e4-2-5-decimal-multiply-basic-mixed': {
      type: 'drill',
      title: '小數乘整數直式綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildDecimalMultiplyMixedSet([buildDecimalMultiplyBasicSet], 5);
      },
    },
    'e4-2-5-decimal-zero-ending-mixed': {
      type: 'drill',
      title: '末位 0 與整十整百乘法綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildDecimalMultiplyMixedSet([buildDecimalZeroEndingSet], 5);
      },
    },
    'e4-2-5-decimal-single-step-word-mixed': {
      type: 'drill',
      title: '小數乘法生活單步題綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildDecimalMultiplyMixedSet([buildDecimalSingleStepWordSet], 5);
      },
    },
    'e4-2-5-decimal-two-step-word-mixed': {
      type: 'drill',
      title: '兩步驟小數乘法應用綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildDecimalMultiplyMixedSet([buildDecimalTwoStepWordSet], 5);
      },
    },
    'e4-2-5-decimal-concept-mixed': {
      type: 'drill',
      title: '小數數線與分數換算綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildDecimalMultiplyMixedSet([buildDecimalConceptSet], 5);
      },
    },
    'e4-2-6-perimeter-direct-drill': {
      type: 'drill',
      title: '長方形與正方形的周長計算',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE426PerimeterDirectSet(3);
      },
    },
    'e4-2-6-area-direct-drill': {
      type: 'drill',
      title: '長方形與正方形的面積計算',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE426AreaDirectSet(3);
      },
    },
    'e4-2-6-area-unit-conversion-drill': {
      type: 'drill',
      title: '面積單位換算與比較',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE426AreaUnitConversionSet(3);
      },
    },
    'e4-2-6-reverse-inference-drill': {
      type: 'drill',
      title: '由周長或面積回推未知量',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE426ReverseInferenceSet(3);
      },
    },
    'e4-2-6-perimeter-area-relation-drill': {
      type: 'drill',
      title: '周長與面積的關係判斷',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE426PerimeterAreaRelationSet(3);
      },
    },
    'e4-2-6-composite-shape-drill': {
      type: 'drill',
      title: '複合圖形的切割與拼接',
      difficulty: 'hard',
      questionCount: 3,
      generate() {
        return buildE426CompositeShapeSet(3);
      },
    },
    'e4-2-6-basic-formula-mixed': {
      type: 'drill',
      title: '周長面積公式綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE426MixedSet(
          [buildE426PerimeterDirectSet, buildE426AreaDirectSet],
          5,
          '先分辨題目是在求周長還是求面積，再選對公式。'
        );
      },
    },
    'e4-2-6-unit-reverse-mixed': {
      type: 'drill',
      title: '換算與逆推綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE426MixedSet(
          [buildE426AreaUnitConversionSet, buildE426ReverseInferenceSet],
          5,
          '遇到平方單位先換算，遇到未知邊長先倒推。'
        );
      },
    },
    'e4-2-6-relation-composite-mixed': {
      type: 'drill',
      title: '關係判斷與複合圖形綜合',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildE426MixedSet(
          [buildE426PerimeterAreaRelationSet, buildE426CompositeShapeSet],
          5,
          '這組題目要同時用到公式、比較觀念和圖形拆補。'
        );
      },
    },
    'e4-2-6-perimeter-area-overview-mixed': {
      type: 'drill',
      title: '周長與面積章節綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE426MixedSet(
          [
            buildE426PerimeterDirectSet,
            buildE426AreaDirectSet,
            buildE426ReverseInferenceSet,
            buildE426PerimeterAreaRelationSet,
          ],
          5
        );
      },
    },
    'e4-2-7-equivalent-integer-drill': {
      type: 'drill',
      title: '與整數相等的等值分數',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildEquivalentIntegerFractionSet(3);
      },
    },
    'e4-2-7-expand-equivalent-drill': {
      type: 'drill',
      title: '分數擴分填空',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildEquivalentFractionExpandSet(3);
      },
    },
    'e4-2-7-discrete-context-drill': {
      type: 'drill',
      title: '離散量情境的等值分數',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildDiscreteEquivalentFractionSet(3);
      },
    },
    'e4-2-7-decimal-conversion-drill': {
      type: 'drill',
      title: '分數與小數互換',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildFractionDecimalConversionSet(3);
      },
    },
    'e4-2-7-fraction-decimal-compare-drill': {
      type: 'drill',
      title: '分數、小數與異分母比較',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildFractionDecimalCompareSet(3);
      },
    },
    'e4-2-7-number-line-drill': {
      type: 'drill',
      title: '分數數線讀取與位移',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildFractionNumberLineSet(3);
      },
    },
    'e4-2-7-equivalent-basic-mixed': {
      type: 'drill',
      title: '等值分數基本概念綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildEquivalentFractionMixedSet(
          [buildEquivalentIntegerFractionSet, buildEquivalentFractionExpandSet],
          5
        );
      },
    },
    'e4-2-7-discrete-context-mixed': {
      type: 'drill',
      title: '離散量等值分數綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildEquivalentFractionMixedSet([buildDiscreteEquivalentFractionSet], 5);
      },
    },
    'e4-2-7-decimal-conversion-mixed': {
      type: 'drill',
      title: '分數小數互換綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildEquivalentFractionMixedSet([buildFractionDecimalConversionSet], 5);
      },
    },
    'e4-2-7-fraction-decimal-compare-mixed': {
      type: 'drill',
      title: '分數小數比較綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildEquivalentFractionMixedSet([buildFractionDecimalCompareSet], 5);
      },
    },
    'e4-2-7-number-line-mixed': {
      type: 'drill',
      title: '分數數線綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildEquivalentFractionMixedSet([buildFractionNumberLineSet], 5);
      },
    },
    'e4-1-1-arabic-chinese-conversion-drill': {
      type: 'drill',
      title: '阿拉伯數字與中文讀法互換',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE411ArabicChineseConversionSet(3);
      },
    },
    'e4-1-1-zero-reading-writing-drill': {
      type: 'drill',
      title: '零的報讀與寫法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE411ZeroReadingWritingSet(3);
      },
    },
    'e4-1-1-place-value-decomposition-drill': {
      type: 'drill',
      title: '位值表徵與數的化聚',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE411PlaceValueDecompositionSet(3);
      },
    },
    'e4-1-1-unit-conversion-drill': {
      type: 'drill',
      title: '單位間的進位與化聚',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE411UnitConversionSet(3);
      },
    },
    'e4-1-1-sequence-pattern-drill': {
      type: 'drill',
      title: '數詞序列規律填空',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE411SequencePatternSet(3);
      },
    },
    'e4-1-1-number-comparison-drill': {
      type: 'drill',
      title: '數的大與小比較',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE411NumberComparisonSet(3);
      },
    },
    'e4-1-1-inequality-digit-drill': {
      type: 'drill',
      title: '滿足不等式的數字填空',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE411InequalityDigitSet(3);
      },
    },
    'e4-1-1-digit-adjustment-drill': {
      type: 'drill',
      title: '數字變換與最大最小數',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE411DigitAdjustmentSet(3);
      },
    },
    'e4-1-1-large-add-subtract-drill': {
      type: 'drill',
      title: '大數的直式加減計算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE411LargeAddSubtractSet(3);
      },
    },
    'e4-1-1-reading-place-value-mixed': {
      type: 'drill',
      title: '讀寫與位值綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE411MixedSet(
          [buildE411ArabicChineseConversionSet, buildE411ZeroReadingWritingSet, buildE411PlaceValueDecompositionSet],
          5
        );
      },
    },
    'e4-1-1-unit-sequence-mixed': {
      type: 'drill',
      title: '單位化聚與數列綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE411MixedSet([buildE411UnitConversionSet, buildE411SequencePatternSet], 5);
      },
    },
    'e4-1-1-comparison-adjustment-mixed': {
      type: 'drill',
      title: '比較與數字調整綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE411MixedSet(
          [buildE411NumberComparisonSet, buildE411InequalityDigitSet, buildE411DigitAdjustmentSet],
          5
        );
      },
    },
    'e4-1-1-large-number-overview-mixed': {
      type: 'drill',
      title: '一億以內的數綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE411MixedSet(
          [
            buildE411ArabicChineseConversionSet,
            buildE411PlaceValueDecompositionSet,
            buildE411NumberComparisonSet,
            buildE411LargeAddSubtractSet,
          ],
          5
        );
      },
    },
    'e4-1-3-protractor-reading-drill': {
      type: 'drill',
      title: '量角器報讀練習',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE413ProtractorReadingSet(3);
      },
    },
    'e4-1-3-angle-classification-drill': {
      type: 'drill',
      title: '角度分類辨識',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE413AngleClassificationSet(3);
      },
    },
    'e4-1-3-angle-composition-drill': {
      type: 'drill',
      title: '角度合成與分解',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE413AngleCompositionSet(3);
      },
    },
    'e4-1-3-rotation-angle-drill': {
      type: 'drill',
      title: '旋轉角的運算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE413RotationSet(3);
      },
    },
    'e4-1-3-clock-angle-drill': {
      type: 'drill',
      title: '鐘面上的角度報讀',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE413ClockAngleSet(3);
      },
    },
    'e4-1-3-basic-angle-mixed': {
      type: 'drill',
      title: '角度判讀基礎綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE413MixedSet([buildE413ProtractorReadingSet, buildE413AngleClassificationSet], 5);
      },
    },
    'e4-1-3-angle-operation-mixed': {
      type: 'drill',
      title: '角度運算綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE413MixedSet([buildE413AngleCompositionSet, buildE413RotationSet], 5);
      },
    },
    'e4-1-3-angle-overview-mixed': {
      type: 'drill',
      title: '角度綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE413MixedSet(
          [
            buildE413ProtractorReadingSet,
            buildE413AngleClassificationSet,
            buildE413AngleCompositionSet,
            buildE413RotationSet,
            buildE413ClockAngleSet,
          ],
          5
        );
      },
    },
    'e4-1-2-place-value-by-one-digit-drill': {
      type: 'drill',
      title: '整十整百整千乘一位數',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE412PlaceValueByOneDigitSet(3);
      },
    },
    'e4-1-2-tens-times-tens-drill': {
      type: 'drill',
      title: '整十乘整十',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE412TensTimesTensSet(3);
      },
    },
    'e4-1-2-three-digit-times-tens-drill': {
      type: 'drill',
      title: '三位數乘整十',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE412ThreeDigitTimesTensSet(3);
      },
    },
    'e4-1-2-four-digit-times-one-digit-drill': {
      type: 'drill',
      title: '四位數乘一位數',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE412FourDigitTimesOneDigitSet(3);
      },
    },
    'e4-1-2-two-digit-times-two-digit-no-carry-drill': {
      type: 'drill',
      title: '二位數乘二位數不進位',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE412TwoDigitTimesTwoDigitNoCarrySet(3);
      },
    },
    'e4-1-2-two-digit-times-two-digit-carry-drill': {
      type: 'drill',
      title: '二位數乘二位數進位',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE412TwoDigitTimesTwoDigitCarrySet(3);
      },
    },
    'e4-1-2-three-digit-times-two-digit-drill': {
      type: 'drill',
      title: '三位數乘二位數',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE412ThreeDigitTimesTwoDigitSet(3);
      },
    },
    'e4-1-2-zero-containing-drill': {
      type: 'drill',
      title: '含 0 的整數乘法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE412ZeroContainingSet(3);
      },
    },
    'e4-1-2-four-digit-times-two-digit-drill': {
      type: 'drill',
      title: '四位數乘二位數',
      difficulty: 'hard',
      questionCount: 3,
      generate() {
        return buildE412FourDigitTimesTwoDigitSet(3);
      },
    },
    'e4-1-2-trailing-zero-product-drill': {
      type: 'drill',
      title: '末尾有 0 的整數乘法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE412TrailingZeroProductSet(3);
      },
    },
    'e4-1-2-near-known-product-drill': {
      type: 'drill',
      title: '已知乘積的前後項推理',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE412NearKnownProductSet(3);
      },
    },
    'e4-1-2-round-number-adjustment-drill': {
      type: 'drill',
      title: '接近整十整百整千的調整乘法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE412RoundNumberAdjustmentSet(3);
      },
    },
    'e4-1-2-basic-place-value-mixed': {
      type: 'drill',
      title: '基礎位值乘法混合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE412BasicPlaceValueMixedSet(
          [buildE412PlaceValueByOneDigitSet, buildE412TensTimesTensSet, buildE412ThreeDigitTimesTensSet],
          5
        );
      },
    },
    'e4-1-2-column-basic-mixed': {
      type: 'drill',
      title: '直式乘法基礎混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE412ColumnBasicMixedSet(
          [
            buildE412FourDigitTimesOneDigitSet,
            buildE412TwoDigitTimesTwoDigitNoCarrySet,
            buildE412TwoDigitTimesTwoDigitCarrySet,
          ],
          5
        );
      },
    },
    'e4-1-2-large-multiplication-mixed': {
      type: 'drill',
      title: '多位數乘法混合',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildE412LargeMultiplicationMixedSet(
          [buildE412ThreeDigitTimesTwoDigitSet, buildE412ZeroContainingSet, buildE412FourDigitTimesTwoDigitSet],
          5
        );
      },
    },
    'e4-1-2-zero-handling-mixed': {
      type: 'drill',
      title: '含 0 乘法混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE412ZeroHandlingMixedSet([buildE412ZeroContainingSet, buildE412TrailingZeroProductSet], 5);
      },
    },
    'e4-1-2-reasoning-mixed': {
      type: 'drill',
      title: '乘法數感推理混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE412ReasoningMixedSet([buildE412NearKnownProductSet, buildE412RoundNumberAdjustmentSet], 5);
      },
    },
    'e4-1-4-four-digit-divide-one-digit-drill': {
      type: 'drill',
      title: '四位數除以一位數',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE414FourDigitDivideOneDigitSet(3);
      },
    },
    'e4-1-4-estimate-division-drill': {
      type: 'drill',
      title: '估商與調整',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE414EstimateDivisionSet(3);
      },
    },
    'e4-1-4-four-digit-divide-two-digit-drill': {
      type: 'drill',
      title: '四位數除以二位數',
      difficulty: 'hard',
      questionCount: 3,
      generate() {
        return buildE414FourDigitDivideTwoDigitSet(3);
      },
    },
    'e4-1-4-trailing-zero-division-drill': {
      type: 'drill',
      title: '末尾 0 的簡化除法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE414TrailingZeroDivisionSet(3);
      },
    },
    'e4-1-4-ceiling-division-word-drill': {
      type: 'drill',
      title: '至少要幾個的除法應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE414CeilingDivisionWordSet(3);
      },
    },
    'e4-1-4-remainder-application-drill': {
      type: 'drill',
      title: '平分與餘數應用',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE414RemainderApplicationSet(3);
      },
    },
    'e4-1-4-two-step-word-drill': {
      type: 'drill',
      title: '先整理再除的兩步驟題',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE414TwoStepWordSet(3);
      },
    },
    'e4-1-4-expression-division-drill': {
      type: 'drill',
      title: '括號與混合運算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE414ExpressionDivisionSet(3);
      },
    },
    'e4-1-4-unit-rate-compare-drill': {
      type: 'drill',
      title: '單位量比較',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE414UnitRateCompareSet(3);
      },
    },
    'e4-1-4-basic-column-mixed': {
      type: 'drill',
      title: '基礎直式混合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE414DivisionMixedSet([buildE414FourDigitDivideOneDigitSet, buildE414TrailingZeroDivisionSet], 5);
      },
    },
    'e4-1-4-estimate-adjustment-mixed': {
      type: 'drill',
      title: '估商調整混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE414DivisionMixedSet([buildE414EstimateDivisionSet], 5);
      },
    },
    'e4-1-4-advanced-division-mixed': {
      type: 'drill',
      title: '進階直式混合',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildE414DivisionMixedSet([buildE414EstimateDivisionSet, buildE414FourDigitDivideTwoDigitSet], 5);
      },
    },
    'e4-1-4-share-round-up-mixed': {
      type: 'drill',
      title: '平分與進位應用混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE414DivisionMixedSet([buildE414CeilingDivisionWordSet, buildE414RemainderApplicationSet], 5);
      },
    },
    'e4-1-4-applied-division-mixed': {
      type: 'drill',
      title: '應用綜合混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE414DivisionMixedSet(
          [buildE414TwoStepWordSet, buildE414ExpressionDivisionSet, buildE414UnitRateCompareSet],
          5
        );
      },
    },
    'e4-1-5-km-m-basic-conversion-drill': {
      type: 'drill',
      title: '公里與公尺的基礎化聚',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE415BasicConversionSet(3);
      },
    },
    'e4-1-5-km-m-compound-conversion-drill': {
      type: 'drill',
      title: '公里與公尺的複名數化聚',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE415CompoundConversionSet(3);
      },
    },
    'e4-1-5-km-m-cm-conversion-drill': {
      type: 'drill',
      title: '公里、公尺與公分的三階換算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE415ThreeUnitConversionSet(3);
      },
    },
    'e4-1-5-length-compare-drill': {
      type: 'drill',
      title: '長度大小比較',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE415CompareSet(3);
      },
    },
    'e4-1-5-km-m-add-subtract-drill': {
      type: 'drill',
      title: '公里與公尺的加減直式',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE415AddSubtractSet(3);
      },
    },
    'e4-1-5-basic-conversion-mixed': {
      type: 'drill',
      title: '基礎換算綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE415MixedSet(
          [buildE415BasicConversionSet, buildE415CompoundConversionSet],
          5,
          '先練 1 公里 = 1000 公尺，再練幾公里幾公尺和公尺之間的互換。'
        );
      },
    },
    'e4-1-5-multi-unit-conversion-mixed': {
      type: 'drill',
      title: '多階換算綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE415MixedSet(
          [buildE415CompoundConversionSet, buildE415ThreeUnitConversionSet],
          5,
          '這組要分清楚 1000 倍和 100 倍兩種換算關係。'
        );
      },
    },
    'e4-1-5-compare-calculate-mixed': {
      type: 'drill',
      title: '比較與計算綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE415MixedSet(
          [buildE415CompareSet, buildE415AddSubtractSet],
          5,
          '比較前先統一單位；加減時先全部換成公尺最穩。'
        );
      },
    },
    'e4-1-5-kilometer-mixed': {
      type: 'drill',
      title: '公里章節綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE415MixedSet(
          [buildE415BasicConversionSet, buildE415ThreeUnitConversionSet, buildE415AddSubtractSet],
          5,
          '公里章節綜合題先判斷是基礎化聚、跨單位換算，還是長度計算。'
        );
      },
    },
    'e4-1-6-angle-classify-drill': {
      type: 'drill',
      title: '以角分類三角形',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE416AngleClassifySet(3);
      },
    },
    'e4-1-6-side-classify-drill': {
      type: 'drill',
      title: '以邊分類三角形',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE416SideClassifySet(3);
      },
    },
    'e4-1-6-side-angle-combined-classify-drill': {
      type: 'drill',
      title: '邊角性質綜合辨識',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE416SideAngleCombinedSet(3);
      },
    },
    'e4-1-6-special-angle-drill': {
      type: 'drill',
      title: '特殊三角形的角度計算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE416SpecialAngleSet(3);
      },
    },
    'e4-1-6-perimeter-direct-drill': {
      type: 'drill',
      title: '三角形周長直接計算',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE416PerimeterDirectSet(3);
      },
    },
    'e4-1-6-perimeter-reverse-drill': {
      type: 'drill',
      title: '三角形周長逆向推邊長',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE416PerimeterReverseSet(3);
      },
    },
    'e4-1-6-congruent-angle-drill': {
      type: 'drill',
      title: '全等三角形的對應角',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE416CongruentAngleSet(3);
      },
    },
    'e4-1-6-congruent-side-drill': {
      type: 'drill',
      title: '全等三角形的對應邊',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE416CongruentSideSet(3);
      },
    },
    'e4-1-6-classification-mixed': {
      type: 'drill',
      title: '分類判斷綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE416MixedSet(
          [buildE416AngleClassifySet, buildE416SideClassifySet, buildE416SideAngleCombinedSet],
          5,
          '這組先把依角分類、依邊分類，以及兩者一起判斷分清楚。'
        );
      },
    },
    'e4-1-6-special-angle-perimeter-mixed': {
      type: 'drill',
      title: '特殊角度與周長綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE416MixedSet(
          [buildE416SpecialAngleSet, buildE416PerimeterDirectSet, buildE416PerimeterReverseSet],
          5,
          '這組同時練角度關係和邊長關係，先判斷題目是在求角還是求邊。'
        );
      },
    },
    'e4-1-6-congruent-correspondence-mixed': {
      type: 'drill',
      title: '全等對應綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE416MixedSet(
          [buildE416CongruentAngleSet, buildE416CongruentSideSet],
          5,
          '全等題的核心只有一件事：先找對應，再搬數值。'
        );
      },
    },
    'e4-1-6-properties-mixed': {
      type: 'drill',
      title: '三角形性質綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE416MixedSet(
          [buildE416SideAngleCombinedSet, buildE416SpecialAngleSet, buildE416PerimeterReverseSet],
          5,
          '三角形性質綜合題要把角度、邊長和分類規則一起用上。'
        );
      },
    },
    'e4-2-8-consecutive-addition-drill': {
      type: 'drill',
      title: '連加的簡化',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildConsecutiveAdditionSet(3);
      },
    },
    'e4-2-8-subtraction-reorder-drill': {
      type: 'drill',
      title: '連減的簡化：先減好減的數',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildSubtractionReorderSet(3);
      },
    },
    'e4-2-8-subtraction-group-drill': {
      type: 'drill',
      title: '連減的簡化：減去兩數之和',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildSubtractionGroupSet(3);
      },
    },
    'e4-2-8-add-sub-mixed-drill': {
      type: 'drill',
      title: '加減混合的簡化',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildAddSubMixedSet(3);
      },
    },
    'e4-2-8-add-sub-application-drill': {
      type: 'drill',
      title: '加減法的生活應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildAddSubApplicationSet(3);
      },
    },
    'e4-2-8-multiply-round-drill': {
      type: 'drill',
      title: '連乘的簡化：湊整十整百',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildMultiplyRoundSet(3);
      },
    },
    'e4-2-8-multiply-special-drill': {
      type: 'drill',
      title: '特殊組合的應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildMultiplySpecialSet(3);
      },
    },
    'e4-2-8-mul-div-first-divide-drill': {
      type: 'drill',
      title: '乘除混合的簡化：先除再乘',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildMulDivFirstDivideSet(3);
      },
    },
    'e4-2-8-multiply-application-drill': {
      type: 'drill',
      title: '連乘的生活應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildMultiplyApplicationSet(3);
      },
    },
    'e4-2-8-mul-div-application-drill': {
      type: 'drill',
      title: '乘除法的生活應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildMulDivApplicationSet(3);
      },
    },
    'e4-2-8-consecutive-addition-mixed': {
      type: 'drill',
      title: '連加的簡化綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildSimplifyCalculationMixedSet([buildConsecutiveAdditionSet], 5);
      },
    },
    'e4-2-8-subtraction-shortcut-mixed': {
      type: 'drill',
      title: '連減的簡化綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildSimplifyCalculationMixedSet([buildSubtractionReorderSet, buildSubtractionGroupSet], 5);
      },
    },
    'e4-2-8-add-sub-shortcut-mixed': {
      type: 'drill',
      title: '加減混合與生活應用綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildSimplifyCalculationMixedSet([buildAddSubMixedSet, buildAddSubApplicationSet], 5);
      },
    },
    'e4-2-8-multiply-shortcut-mixed': {
      type: 'drill',
      title: '連乘與特殊組合綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildSimplifyCalculationMixedSet([buildMultiplyRoundSet, buildMultiplySpecialSet], 5);
      },
    },
    'e4-2-8-mul-div-application-mixed': {
      type: 'drill',
      title: '乘除混合與生活應用綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildSimplifyCalculationMixedSet(
          [buildMulDivFirstDivideSet, buildMultiplyApplicationSet, buildMulDivApplicationSet],
          5
        );
      },
    },
    'e4-2-9-compound-to-single-drill': {
      type: 'drill',
      title: '複名數換單名數',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildTimeCompoundToSingleSet(3);
      },
    },
    'e4-2-9-single-to-compound-drill': {
      type: 'drill',
      title: '單名數換複名數',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildTimeSingleToCompoundSet(3);
      },
    },
    'e4-2-9-compare-drill': {
      type: 'drill',
      title: '時間長短比較',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildTimeCompareSet(3);
      },
    },
    'e4-2-9-cross-unit-drill': {
      type: 'drill',
      title: '跨階單位換算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildTimeCrossUnitSet(3);
      },
    },
    'e4-2-9-conversion-application-drill': {
      type: 'drill',
      title: '時間換算生活應用',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildTimeConversionApplicationSet(3);
      },
    },
    'e4-2-9-day-hour-add-drill': {
      type: 'drill',
      title: '日與時的加法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildDayHourAddSet(3);
      },
    },
    'e4-2-9-day-hour-subtract-drill': {
      type: 'drill',
      title: '日與時的減法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildDayHourSubtractSet(3);
      },
    },
    'e4-2-9-hour-minute-add-drill': {
      type: 'drill',
      title: '時與分的加法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildHourMinuteAddSet(3);
      },
    },
    'e4-2-9-hour-minute-subtract-drill': {
      type: 'drill',
      title: '時與分的減法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildHourMinuteSubtractSet(3);
      },
    },
    'e4-2-9-minute-second-arithmetic-drill': {
      type: 'drill',
      title: '分與秒的綜合加減法',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildMinuteSecondArithmeticSet(3);
      },
    },
    'e4-2-9-elapsed-same-period-drill': {
      type: 'drill',
      title: '同在上午或下午的時刻計算',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildElapsedSamePeriodSet(3);
      },
    },
    'e4-2-9-elapsed-cross-noon-drill': {
      type: 'drill',
      title: '跨越中午的時刻計算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildElapsedCrossNoonSet(3);
      },
    },
    'e4-2-9-elapsed-cross-day-drill': {
      type: 'drill',
      title: '跨越凌晨的時刻計算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildElapsedCrossDaySet(3);
      },
    },
    'e4-2-9-elapsed-second-drill': {
      type: 'drill',
      title: '包含秒的精確時間計算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildElapsedSecondSet(3);
      },
    },
    'e4-2-9-schedule-elapsed-drill': {
      type: 'drill',
      title: '時刻表讀取與經過時間',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildScheduleElapsedSet(3);
      },
    },
    'e4-2-9-end-time-drill': {
      type: 'drill',
      title: '計算結束時刻',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildEndTimeSet(3);
      },
    },
    'e4-2-9-start-time-drill': {
      type: 'drill',
      title: '計算開始時刻',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildStartTimeSet(3);
      },
    },
    'e4-2-9-cross-day-end-time-drill': {
      type: 'drill',
      title: '跨日計算結束時刻',
      difficulty: 'hard',
      questionCount: 3,
      generate() {
        return buildCrossDayEndTimeSet(3);
      },
    },
    'e4-2-9-cross-day-start-time-drill': {
      type: 'drill',
      title: '跨日計算開始時刻',
      difficulty: 'hard',
      questionCount: 3,
      generate() {
        return buildCrossDayStartTimeSet(3);
      },
    },
    'e4-2-9-day-hour-compare-drill': {
      type: 'drill',
      title: '跨日時間量互換與比較',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildDayHourCompareSet(3);
      },
    },
    'e4-2-9-cross-day-comprehensive-drill': {
      type: 'drill',
      title: '跨日綜合生活應用',
      difficulty: 'hard',
      questionCount: 3,
      generate() {
        return buildCrossDayComprehensiveSet(3);
      },
    },
    'e4-2-9-unit-conversion-mixed': {
      type: 'drill',
      title: '時間換算綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildTimeUnitMixedSet(
          [
            buildTimeCompoundToSingleSet,
            buildTimeSingleToCompoundSet,
            buildTimeCompareSet,
            buildTimeCrossUnitSet,
            buildTimeConversionApplicationSet,
          ],
          5
        );
      },
    },
    'e4-2-9-time-quantity-arithmetic-mixed': {
      type: 'drill',
      title: '時間量加減綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildTimeArithmeticMixedSet(
          [
            buildDayHourAddSet,
            buildDayHourSubtractSet,
            buildHourMinuteAddSet,
            buildHourMinuteSubtractSet,
            buildMinuteSecondArithmeticSet,
          ],
          5
        );
      },
    },
    'e4-2-9-elapsed-time-mixed': {
      type: 'drill',
      title: '經過時間綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildElapsedTimeMixedSet(
          [
            buildElapsedSamePeriodSet,
            buildElapsedCrossNoonSet,
            buildElapsedCrossDaySet,
            buildElapsedSecondSet,
            buildScheduleElapsedSet,
          ],
          5
        );
      },
    },
    'e4-2-9-time-point-inference-mixed': {
      type: 'drill',
      title: '時刻推算綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildTimePointMixedSet([buildEndTimeSet, buildStartTimeSet], 5);
      },
    },
    'e4-2-9-cross-day-advanced-mixed': {
      type: 'drill',
      title: '跨日時間與綜合應用',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildCrossDayTimeMixedSet(
          [buildCrossDayEndTimeSet, buildCrossDayStartTimeSet, buildDayHourCompareSet, buildCrossDayComprehensiveSet],
          5
        );
      },
    },
    'e4-2-10-direct-count-drill': {
      type: 'drill',
      title: '基礎點數與單位判讀',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE4210DirectCountSet(3);
      },
    },
    'e4-2-10-layered-count-drill': {
      type: 'drill',
      title: '分層點數',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildE4210LayeredCountSet(3);
      },
    },
    'e4-2-10-structured-count-drill': {
      type: 'drill',
      title: '結構化計數',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE4210StructuredCountSet(3);
      },
    },
    'e4-2-10-compare-order-drill': {
      type: 'drill',
      title: '體積比較與排序',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE4210CompareOrderSet(3);
      },
    },
    'e4-2-10-volume-conservation-drill': {
      type: 'drill',
      title: '等積異形與體積守恆',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildE4210VolumeConservationSet(3);
      },
    },
    'e4-2-10-counting-basic-mixed': {
      type: 'drill',
      title: '點數入門綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE4210MixedSet(
          [buildE4210DirectCountSet, buildE4210LayeredCountSet],
          5,
          '這組先練 1 個積木就是 1 立方公分，再練分層點數。'
        );
      },
    },
    'e4-2-10-structure-compare-mixed': {
      type: 'drill',
      title: '結構計數與比較綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE4210MixedSet(
          [buildE4210StructuredCountSet, buildE4210CompareOrderSet],
          5,
          '這組要先抓出規則形體的結構，再比較不同形體的體積大小。'
        );
      },
    },
    'e4-2-10-conservation-concept-mixed': {
      type: 'drill',
      title: '守恆觀念綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE4210MixedSet(
          [buildE4210CompareOrderSet, buildE4210VolumeConservationSet],
          5,
          '比較題先統一成積木個數；守恆題則要分清楚外形改變和體積改變不是同一件事。'
        );
      },
    },
    'e4-2-10-cubic-centimeter-overview-mixed': {
      type: 'drill',
      title: '立方公分章節綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE4210MixedSet(
          [
            buildE4210DirectCountSet,
            buildE4210LayeredCountSet,
            buildE4210StructuredCountSet,
            buildE4210CompareOrderSet,
            buildE4210VolumeConservationSet,
          ],
          5
        );
      },
    },
  });
})();
