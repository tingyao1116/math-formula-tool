(() => {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickNonZero(min, max) {
    let value = 0;
    while (value === 0) value = randInt(min, max);
    return value;
  }

  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function wrapIfNegative(value) {
    return value < 0 ? `(${value})` : `${value}`;
  }

  // Shared math display formatter helpers
  function gcdInt(a, b) {
    let x = Math.abs(Math.trunc(a || 0));
    let y = Math.abs(Math.trunc(b || 0));
    while (y !== 0) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function reduceFraction(numerator, denominator) {
    if (denominator === 0) return { numerator, denominator: 0 };
    if (numerator === 0) return { numerator: 0, denominator: 1 };
    const sign = numerator * denominator < 0 ? -1 : 1;
    const n = Math.abs(numerator);
    const d = Math.abs(denominator);
    const g = gcdInt(n, d);
    return { numerator: sign * (n / g), denominator: d / g };
  }

  function formatFraction(numerator, denominator) {
    const reduced = reduceFraction(numerator, denominator);
    if (reduced.denominator === 0) return '\\text{undefined}';
    if (reduced.denominator === 1) return `${reduced.numerator}`;
    const sign = reduced.numerator < 0 ? '-' : '';
    return `${sign}\\frac{${Math.abs(reduced.numerator)}}{${reduced.denominator}}`;
  }

  function simplifyRadical(n) {
    if (n <= 0) return { outside: 0, inside: n };
    let outside = 1;
    let inside = n;
    for (let k = 2; k * k <= inside; k += 1) {
      while (inside % (k * k) === 0) {
        outside *= k;
        inside /= (k * k);
      }
    }
    return { outside, inside };
  }

  function formatRadical(n) {
    const r = simplifyRadical(n);
    if (r.inside === 1) return `${r.outside}`;
    if (r.outside === 1) return `\\sqrt{${r.inside}}`;
    return `${r.outside}\\sqrt{${r.inside}}`;
  }

  function formatCoeffTerm(coeff, variable = 'x', power = 1) {
    if (!Number.isFinite(coeff) || coeff === 0) return '0';
    const sign = coeff < 0 ? '-' : '';
    const abs = Math.abs(coeff);
    const coeffText = abs === 1 ? '' : `${abs}`;
    const powerText = power === 1 ? variable : `${variable}^${power}`;
    return `${sign}${coeffText}${powerText}`;
  }

  function formatSubtraction(left, right) {
    return right < 0 ? `${left}-(${right})` : `${left}-${right}`;
  }

  function buildMidpointSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-30, 30);
      const b = randInt(-30, 30);
      questions.push(`求 ${a} 與 ${b} 的中點。`);
      const sum = a + b;
      const sumExpr = `${a}${b < 0 ? `+(${b})` : `+${b}`}`;
      if (sum % 2 === 0) {
        answers.push(`中點 = $\\frac{${sumExpr}}{2}$ = ${sum / 2}`);
      } else {
        answers.push(`中點 = $\\frac{${sumExpr}}{2}=\\frac{${sum}}{2}$`);
      }
    }
    return { questions, answers };
  }

  function buildDistanceSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-30, 30);
      const b = randInt(-30, 30);
      questions.push(`求 ${a} 與 ${b} 的距離。`);
      answers.push(`距離 = |${a}-${b}| = ${Math.abs(a - b)}`);
    }
    return { questions, answers };
  }

  function buildFourTermIntegerSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const nums = Array.from({ length: 4 }, () => randInt(-30, 30));
      const ops = Array.from({ length: 3 }, () => (randInt(0, 1) ? '+' : '-'));
      let total = nums[0];
      for (let j = 0; j < 3; j += 1) {
        total = ops[j] === '+' ? total + nums[j + 1] : total - nums[j + 1];
      }
      const terms = nums.map((n) => wrapIfNegative(n));
      questions.push(`計算：${terms[0]} ${ops[0]} ${terms[1]} ${ops[1]} ${terms[2]} ${ops[2]} ${terms[3]}`);
      answers.push(`${terms[0]} ${ops[0]} ${terms[1]} ${ops[1]} ${terms[2]} ${ops[2]} ${terms[3]} = ${total}`);
    }
    return { questions, answers };
  }

  function buildThreeProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const triples = Array.from({ length: 3 }, () => [pickNonZero(-9, 9), pickNonZero(-9, 9)]);
      const ops = shuffle(['+', '-']);
      const products = triples.map(([a, b]) => a * b);
      const q = `${wrapIfNegative(triples[0][0])}\\times${wrapIfNegative(triples[0][1])} ${ops[0]} ${wrapIfNegative(triples[1][0])}\\times${wrapIfNegative(triples[1][1])} ${ops[1]} ${wrapIfNegative(triples[2][0])}\\times${wrapIfNegative(triples[2][1])}`;
      let total = products[0];
      total = ops[0] === '+' ? total + products[1] : total - products[1];
      total = ops[1] === '+' ? total + products[2] : total - products[2];
      questions.push(`計算：$${q}$`);
      answers.push(
        `$${wrapIfNegative(products[0])} ${ops[0]} ${wrapIfNegative(products[1])} ${ops[1]} ${wrapIfNegative(products[2])} = ${total}$`
      );
    }
    return { questions, answers };
  }

  function formatClockLabel(hour24) {
    const h = ((hour24 % 24) + 24) % 24;
    if (h === 12) return '中午12時';
    if (h === 0) return '上午12時';
    if (h < 12) return `上午${h}時`;
    return `下午${h - 12}時`;
  }

  function buildTimeBaselineBasicSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const rate = pickNonZero(-12, 12);
      let knownHour = randInt(6, 22);
      while (knownHour === 12) knownHour = randInt(6, 22);
      let askHour = randInt(5, 22);
      while (askHour === 12 || askHour === knownHour) askHour = randInt(5, 22);

      const knownValue = (knownHour - 12) * rate;
      const askValue = (askHour - 12) * rate;
      const knownText = formatClockLabel(knownHour);
      const askText = formatClockLabel(askHour);
      const knownValueText = knownValue > 0 ? `+${knownValue}` : `${knownValue}`;

      questions.push(`中午12時為基準，${knownText}記為${knownValueText}，則${askText}記作____。`);
      answers.push(`${askValue}`);
    }
    return { questions, answers };
  }

  function buildTimeBaselineAdvancedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const rate = pickNonZero(-18, 18);
      const bias = randInt(-120, 120);
      let h1 = randInt(1, 23);
      let h2 = randInt(1, 23);
      let h3 = randInt(1, 23);
      while (h2 === h1) h2 = randInt(1, 23);
      while (h3 === h1 || h3 === h2) h3 = randInt(1, 23);

      const v1 = rate * h1 + bias;
      const v2 = rate * h2 + bias;
      const v3 = rate * h3 + bias;
      const t1 = formatClockLabel(h1);
      const t2 = formatClockLabel(h2);
      const t3 = formatClockLabel(h3);

      questions.push(`若${t1}記為${v1}，${t2}記為${v2}，則${t3}記為應記為何？`);
      answers.push(`${v3}`);
    }
    return { questions, answers };
  }

  function formatSignedOffset(value) {
    if (value > 0) return `+${value}`;
    if (value < 0) return `${value}`;
    return '0';
  }

  function buildBalancedOffsets(length, maxOffset) {
    while (true) {
      const offsets = [];
      let sum = 0;
      for (let i = 0; i < length - 1; i += 1) {
        const offset = randInt(-maxOffset, maxOffset);
        offsets.push(offset);
        sum += offset;
      }
      const last = -sum;
      if (Math.abs(last) > maxOffset) continue;
      offsets.push(last);
      if (offsets.every((value) => value === 0)) continue;
      return shuffle(offsets);
    }
  }

  function buildNearbyAverageBaselineSet(count) {
    const questions = [];
    const answers = [];
    const baselines = [60, 70, 80, 90];

    for (let i = 0; i < count; i += 1) {
      const baseline = baselines[randInt(0, baselines.length - 1)];
      const offsets = buildBalancedOffsets(5, 9);
      const numbers = offsets.map((offset) => baseline + offset);
      const mode = randInt(0, 1);

      if (mode === 0) {
        const numberText = numbers.join('、');
        const offsetText = offsets.map((offset) => formatSignedOffset(offset)).join('、');
        questions.push(`以 ${baseline} 為基準值，五個整數 ${numberText} 的平均數是多少？`);
        answers.push(
          `以 ${baseline} 為基準值，五個數和基準值的差分別是 ${offsetText}，差的總和是 0，所以平均數就是 ${baseline}。`
        );
        continue;
      }

      const missingIndex = randInt(0, numbers.length - 1);
      const xValue = numbers[missingIndex];
      const visibleNumbers = numbers.map((value, index) => (index === missingIndex ? 'x' : String(value)));
      const knownOffsets = offsets
        .map((offset, index) => (index === missingIndex ? null : formatSignedOffset(offset)))
        .filter((value) => value !== null);
      const missingOffset = offsets[missingIndex];
      questions.push(`以 ${baseline} 為基準值，五個整數 ${visibleNumbers.join('、')} 的平均數是 ${baseline}，求 x。`);
      answers.push(
        `已知另外四個數相對 ${baseline} 的差是 ${knownOffsets.join('、')}，合計是 ${formatSignedOffset(-missingOffset)} 的相反數，所以 x 相對 ${baseline} 的差要是 ${formatSignedOffset(missingOffset)}，因此 x = ${xValue}。`
      );
    }

    return { questions, answers };
  }

  function formatPowerBase(base) {
    return base < 0 ? `(${base})` : `${base}`;
  }

  function formatPowerExpr(base, exponent) {
    return `${formatPowerBase(base)}^{${exponent}}`;
  }

  function formatDecimalValue(value) {
    if (Number.isInteger(value)) return `${value}`;
    return `${Number(value.toFixed(6))}`;
  }

  function buildExponentSignBracketSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const base = randInt(2, 6);
        const exponent = randInt(2, 6);
        const left = Math.pow(-base, exponent);
        const right = -Math.pow(base, exponent);
        const relation = left > right ? '>' : left < right ? '<' : '=';
        questions.push(`比較：$(-${base})^{${exponent}}$ 與 $-${base}^{${exponent}}$。`);
        answers.push(
          exponent % 2 === 0
            ? `$(-${base})^{${exponent}}=${left}$，因為偶數次方會把負號一起平方成正；而 $-${base}^{${exponent}}=${right}$ 是先算 ${base}^{${exponent}} 再補前面的負號，所以關係是 $${left} ${relation} ${right}$。`
            : `$(-${base})^{${exponent}}=${left}$，$-${base}^{${exponent}}=${right}$。這一題雖然結果同為負數，但前者是整個 $(-${base})$ 連乘，後者是 ${base}^{${exponent}} 前面再補負號，所以兩者關係是 $${left}=${right}$。`
        );
        continue;
      }

      if (mode === 1) {
        const exponent = randInt(2, 9);
        const value = Math.pow(-1, exponent);
        const signText = value > 0 ? '正數' : '負數';
        questions.push(`判斷：$(-1)^{${exponent}}$ 是正數還是負數？`);
        answers.push(
          `因為 ${exponent} 是${exponent % 2 === 0 ? '偶數' : '奇數'}，所以 $(-1)^{${exponent}}=${value}$，是${signText}。`
        );
        continue;
      }

      const base = randInt(2, 6);
      const exponent = randInt(2, 5);
      const inner = Math.pow(-base, exponent);
      const total = -inner;
      questions.push(`計算：$-(-${base})^{${exponent}}$。`);
      answers.push(
        `先算括號裡的次方：$(-${base})^{${exponent}}=${inner}$，再補最前面的負號，所以 $-(-${base})^{${exponent}}=${total}$。`
      );
    }

    return { questions, answers };
  }

  function buildExponentLawSingleRuleSet(count) {
    const questions = [];
    const answers = [];
    const bases = [2, 3, 4, 5, 6, 7];

    for (let i = 0; i < count; i += 1) {
      const base = bases[randInt(0, bases.length - 1)];
      const mode = i % 3;

      if (mode === 0) {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        questions.push(`計算：$${base}^{${a}}\\times ${base}^{${b}}$。`);
        answers.push(`同底數相乘，指數相加，所以 $${base}^{${a}}\\times ${base}^{${b}}=${base}^{${a + b}}$。`);
        continue;
      }

      if (mode === 1) {
        const a = randInt(5, 10);
        const b = randInt(2, a - 1);
        questions.push(`計算：$${base}^{${a}}\\div ${base}^{${b}}$。`);
        answers.push(`同底數相除，指數相減，所以 $${base}^{${a}}\\div ${base}^{${b}}=${base}^{${a - b}}$。`);
        continue;
      }

      const a = randInt(2, 5);
      const b = randInt(2, 4);
      questions.push(`計算：$(${base}^{${a}})^{${b}}$。`);
      answers.push(`乘方的乘方，指數相乘，所以 $(${base}^{${a}})^{${b}}=${base}^{${a * b}}$。`);
    }

    return { questions, answers };
  }

  function buildExponentLawMixedSet(count) {
    const questions = [];
    const answers = [];
    const bases = [2, 3, 4, 5, 6, 7];

    for (let i = 0; i < count; i += 1) {
      const base = bases[randInt(0, bases.length - 1)];
      const mode = i % 5;

      if (mode === 0) {
        const a = randInt(2, 5);
        const b = randInt(2, 4);
        const c = randInt(2, 5);
        const totalExponentBase = a + b * c;
        const d = randInt(1, Math.max(1, totalExponentBase - 1));
        const totalExponent = totalExponentBase - d;
        questions.push(`計算：$${base}^{${a}}\\times (${base}^{${b}})^{${c}}\\div ${base}^{${d}}$。`);
        answers.push(
          `先做乘方的乘方：$(${base}^{${b}})^{${c}}=${base}^{${b * c}}$；再同底數相乘相除，把指數整理成 $${a}+${b * c}-${d}=${totalExponent}$，所以結果是 $${base}^{${totalExponent}}$。`
        );
        continue;
      }

      if (mode === 1) {
        const a = randInt(2, 5);
        const b = randInt(2, 4);
        const c = randInt(2, 4);
        const d = randInt(2, 4);
        const totalExponent = a * b + c * d;
        questions.push(`計算：$(${base}^{${a}})^{${b}}\\times (${base}^{${c}})^{${d}}$。`);
        answers.push(
          `先把兩個乘方的乘方展開：$(${base}^{${a}})^{${b}}=${base}^{${a * b}}$，$(${base}^{${c}})^{${d}}=${base}^{${c * d}}$；再同底數相乘，指數相加得 $${a * b}+${c * d}=${totalExponent}$，所以結果是 $${base}^{${totalExponent}}$。`
        );
        continue;
      }

      if (mode === 2) {
        const a = randInt(2, 5);
        const b = randInt(2, 4);
        const c = randInt(2, 5);
        const d = randInt(2, 4);
        const totalLeft = a * b;
        const totalRight = c * d;
        const totalExponent = totalLeft - totalRight;
        questions.push(`計算：$(${base}^{${a}})^{${b}}\\div (${base}^{${c}})^{${d}}$。`);
        answers.push(
          `先做乘方的乘方：$(${base}^{${a}})^{${b}}=${base}^{${totalLeft}}$，$(${base}^{${c}})^{${d}}=${base}^{${totalRight}}$；再同底數相除，指數相減得 $${totalLeft}-${totalRight}=${totalExponent}$，所以結果是 $${base}^{${totalExponent}}$。`
        );
        continue;
      }

      if (mode === 3) {
        const a = randInt(2, 5);
        const b = randInt(2, 4);
        const c = randInt(2, 5);
        const d = randInt(1, 4);
        const totalExponent = (a + b) * c - d;
        questions.push(`計算：$(${base}^{${a}}\\times ${base}^{${b}})^{${c}}\\div ${base}^{${d}}$。`);
        answers.push(
          `先把括號內同底數相乘整理成 $${base}^{${a + b}}$；再做乘方的乘方，得到 $(${base}^{${a + b}})^{${c}}=${base}^{${(a + b) * c}}$；最後再除以 ${base}^{${d}}，指數相減得 $${(a + b) * c}-${d}=${totalExponent}$，所以結果是 $${base}^{${totalExponent}}$。`
        );
        continue;
      }

      const a = randInt(2, 5);
      const b = randInt(2, 4);
      const c = randInt(2, 5);
      const d = randInt(2, 4);
      const e = randInt(1, 4);
      const totalExponent = a + b * c - d * e;
      questions.push(`計算：$${base}^{${a}}\\times (${base}^{${b}})^{${c}}\\div (${base}^{${d}})^{${e}}$。`);
      answers.push(
        `先把乘方的乘方整理成 $(${base}^{${b}})^{${c}}=${base}^{${b * c}}$，$(${base}^{${d}})^{${e}}=${base}^{${d * e}}$；再同底數相乘相除，把指數整理成 $${a}+${b * c}-${d * e}=${totalExponent}$，所以結果是 $${base}^{${totalExponent}}$。`
      );
    }

    return { questions, answers };
  }

  function buildExponentMixedOperationsSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;

      if (mode === 0) {
        const a = randInt(2, 5);
        const b = randInt(2, 4);
        const c = randInt(2, 4);
        const value = -Math.pow(a, 2) + Math.pow(-b, 3) - Math.pow(-1, c);
        questions.push(`計算：$-${a}^{2}+(-${b}^{3})-(-1)^{${c}}$。`);
        answers.push(
          `先算次方：$-${a}^{2}=-${a * a}$，$(-${b}^{3})=-${Math.pow(b, 3)}$，$(-1)^{${c}}=${Math.pow(-1, c)}$，所以結果是 ${value}。`
        );
        continue;
      }

      if (mode === 1) {
        const a = randInt(2, 6);
        const b = randInt(1, 3);
        const c = randInt(2, 4);
        const left = Math.pow(-a, 0);
        const middle = b * Math.pow(10, -2);
        const right = Math.pow(-1, c * 2);
        const value = left + middle + right;
        questions.push(`計算：$(-${a})^{0}+${b}\\times 10^{-2}+(-1)^{${c * 2}}$。`);
        answers.push(
          `零次方等於 1，$10^{-2}=0.01$，偶數次方的 $(-1)$ 等於 1，所以結果是 $1+${formatDecimalValue(middle)}+1=${formatDecimalValue(value)}$。`
        );
        continue;
      }

      if (mode === 2) {
        const a = randInt(2, 4);
        const b = randInt(2, 3);
        const left = Math.pow(2, -a);
        const right = Math.pow(10, -b);
        const value = left + right;
        questions.push(`計算：$2^{-${a}}+10^{-${b}}$。`);
        answers.push(
          `負次方先改成倒數：$2^{-${a}}=\\frac{1}{2^{${a}}}=${formatDecimalValue(left)}$，$10^{-${b}}=\\frac{1}{10^{${b}}}=${formatDecimalValue(right)}$，所以結果是 ${formatDecimalValue(value)}。`
        );
        continue;
      }

      const a = randInt(2, 4);
      const b = randInt(2, 4);
      const c = randInt(2, 3);
      const d = randInt(2, 4);
      const value = (Math.pow(-a, 2) * -Math.pow(b, 2) * Math.pow(5, c)) / Math.pow(5, d);
      questions.push(`計算：$(-${a})^{2}\\times (-${b}^{2})\\times 5^{${c}}\\div 5^{${d}}$。`);
      answers.push(
        `先算次方：$(-${a})^{2}=${Math.pow(-a, 2)}$，$-${b}^{2}=-${Math.pow(b, 2)}$；再整理同底數：$5^{${c}}\\div 5^{${d}}=5^{${c - d}}$，合起來結果是 ${formatDecimalValue(value)}。`
      );
    }

    return { questions, answers };
  }

  function buildExponentWordProblemSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;

      if (mode === 0) {
        const start = randInt(1, 9);
        const interval = [3, 4, 6][randInt(0, 2)];
        const times = randInt(3, 6);
        const hours = interval * times;
        const value = start * Math.pow(2, times);
        questions.push(
          `某種細菌每 ${interval} 小時數量會變成原來的 2 倍，原本有 ${start} 個，經過 ${hours} 小時後共有多少個？`
        );
        answers.push(
          `每 ${interval} 小時乘上 2 倍，${hours} 小時共經過 ${times} 次變化，所以數量是 $${start}\\times 2^{${times}}=${value}$。`
        );
        continue;
      }

      if (mode === 1) {
        const step = randInt(4, 7);
        const value = Math.pow(4, step);
        questions.push(`把一張紙先分成 4 張，每一張再各分成 4 張，依此規律分到第 ${step} 步，這時共有多少張？`);
        answers.push(`每一步都乘上 4，所以第 ${step} 步共有 $4^{${step}}=${value}$ 張。`);
        continue;
      }

      const start = randInt(2, 8);
      const interval = [2, 3, 5][randInt(0, 2)];
      const times = randInt(3, 5);
      const minutes = interval * times;
      const value = start * Math.pow(3, times);
      questions.push(
        `某種遊戲道具每 ${interval} 分鐘會變成原來的 3 倍，原本有 ${start} 個，經過 ${minutes} 分鐘後共有多少個？`
      );
      answers.push(
        `每 ${interval} 分鐘乘上 3，${minutes} 分鐘共經過 ${times} 次變化，所以數量是 $${start}\\times 3^{${times}}=${value}$。`
      );
    }

    return { questions, answers };
  }

  function trimDecimalString(text) {
    const source = String(text || '').trim();
    if (!source.includes('.')) return source;
    return source.replace(/0+$/g, '').replace(/\.$/g, '');
  }

  function normalizePlainNumberString(text) {
    const source = String(text || '').trim();
    if (!source) return '0';
    const negative = source.startsWith('-');
    const body = negative ? source.slice(1) : source;
    if (body.includes('.')) {
      const [rawInt, rawFrac] = body.split('.');
      const intPart = rawInt.replace(/^0+(?=\d)/, '') || '0';
      const fracPart = rawFrac.replace(/0+$/g, '');
      const normalized = fracPart ? `${intPart}.${fracPart}` : intPart;
      return negative ? `-${normalized}` : normalized;
    }
    const normalized = body.replace(/^0+(?=\d)/, '') || '0';
    return negative ? `-${normalized}` : normalized;
  }

  function scientificToPlainString(coefficientText, exponent) {
    const source = trimDecimalString(String(coefficientText || '').trim());
    if (!source) return '0';
    const negative = source.startsWith('-');
    const body = negative ? source.slice(1) : source;
    const parts = body.split('.');
    const intPart = parts[0] || '0';
    const fracPart = parts[1] || '';
    const digits = `${intPart}${fracPart}`.replace(/^0+(?=\d)/, '') || '0';
    const shift = Number(exponent) - fracPart.length;
    let plain = '';
    if (shift >= 0) {
      plain = digits + '0'.repeat(shift);
    } else {
      const pointIndex = digits.length + shift;
      if (pointIndex > 0) {
        plain = `${digits.slice(0, pointIndex)}.${digits.slice(pointIndex)}`;
      } else {
        plain = `0.${'0'.repeat(-pointIndex)}${digits}`;
      }
    }
    const normalized = normalizePlainNumberString(plain);
    return negative ? `-${normalized}` : normalized;
  }

  function plainToScientificParts(numberText) {
    const source = normalizePlainNumberString(numberText);
    const negative = source.startsWith('-');
    const body = negative ? source.slice(1) : source;
    if (!body || body === '0') {
      return { coefficient: '0', exponent: 0, text: '0' };
    }
    const [rawInt, rawFrac = ''] = body.split('.');
    const intPart = rawInt.replace(/^0+/g, '');
    let exponent = 0;
    let digitStream = '';

    if (intPart) {
      exponent = intPart.length - 1;
      digitStream = `${intPart}${rawFrac}`;
    } else {
      const firstNonZero = rawFrac.search(/[1-9]/);
      exponent = -(firstNonZero + 1);
      digitStream = rawFrac.slice(firstNonZero);
    }

    const coefficient = trimDecimalString(
      `${digitStream[0]}${digitStream.length > 1 ? `.${digitStream.slice(1)}` : ''}`
    );
    const signedCoefficient = negative ? `-${coefficient}` : coefficient;
    return {
      coefficient: signedCoefficient,
      exponent,
      text: `${signedCoefficient} \\times 10^{${exponent}}`,
    };
  }

  function buildScientificNotationConvertSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const coeff = `${randInt(1, 9)}`;
        const exponent = randInt(4, 8);
        const plain = scientificToPlainString(coeff, exponent);
        questions.push(`將 ${plain} 寫成科學記號。`);
        answers.push(`${plain} = $${coeff} \\times 10^{${exponent}}$。`);
        continue;
      }

      if (mode === 1) {
        const coeff = `${randInt(1, 9)}.${randInt(1, 9)}${randInt(0, 9)}`;
        const exponent = -randInt(4, 8);
        const plain = scientificToPlainString(coeff, exponent);
        questions.push(`將 ${plain} 寫成科學記號。`);
        answers.push(`${plain} = $${coeff} \\times 10^{${exponent}}$。`);
        continue;
      }

      const coeff = `${randInt(1, 9)}.${randInt(1, 9)}${randInt(0, 9)}`;
      const exponent = randInt(3, 7);
      const plain = scientificToPlainString(coeff, exponent);
      questions.push(`將 $${coeff} \\times 10^{${exponent}}$ 展開成一般數值。`);
      answers.push(`把小數點向右移 ${exponent} 位，所以結果是 ${plain}。`);
    }

    return { questions, answers };
  }

  function buildScientificDigitReadingSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const coeff = `${randInt(1, 9)}.${randInt(1, 9)}${randInt(0, 9)}${randInt(0, 9)}`;
        const exponent = randInt(5, 8);
        const digitCount = exponent + 1;
        questions.push(`$${coeff} \\times 10^{${exponent}}$ 乘開後是一個幾位數？`);
        answers.push(
          `因為 $${coeff}$ 介於 1 和 10 之間，所以乘上 $10^{${exponent}}$ 後，整數共有 ${exponent}+1=${digitCount} 位。`
        );
      } else {
        const coeff = `${randInt(1, 9)}.${randInt(1, 9)}`;
        const exponent = randInt(3, 8);
        questions.push(`$${coeff} \\times 10^{-${exponent}}$ 乘開後，小數點後第幾位開始出現不為 0 的數字？`);
        answers.push(
          `因為係數介於 1 和 10 之間，乘上 $10^{-${exponent}}$ 代表小數點向左移 ${exponent} 位，所以小數點後第 ${exponent} 位開始出現不為 0 的數字。`
        );
      }
    }

    return { questions, answers };
  }

  function buildScientificCompareSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      let expA = randInt(-6, 8);
      let expB = randInt(-6, 8);
      const coeffA = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      let coeffB = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      if (i % 2 === 1) expB = expA;
      while (expA === expB && coeffA === coeffB) {
        coeffB = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      }
      const left = coeffA * Math.pow(10, expA);
      const right = coeffB * Math.pow(10, expB);
      const relation = left > right ? '>' : '<';
      const coeffAText = trimDecimalString(`${coeffA}`);
      const coeffBText = trimDecimalString(`${coeffB}`);
      questions.push(`比較 $${coeffAText} \\times 10^{${expA}}$ 與 $${coeffBText} \\times 10^{${expB}}$ 的大小。`);
      if (expA !== expB) {
        answers.push(
          `先看指數，因為 ${expA} ${relation} ${expB}，所以 $${coeffAText} \\times 10^{${expA}} ${relation} ${coeffBText} \\times 10^{${expB}}$。`
        );
      } else {
        answers.push(
          `兩個指數相同，都乘上 $10^{${expA}}$，只要比較係數即可；因為 ${coeffAText} ${relation} ${coeffBText}，所以 $${coeffAText} \\times 10^{${expA}} ${relation} ${coeffBText} \\times 10^{${expB}}$。`
        );
      }
    }

    return { questions, answers };
  }

  function buildScientificMulDivSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const coeffA = Number(`${randInt(1, 9)}.${randInt(0, 9)}`);
      const coeffB = Number(`${randInt(1, 9)}.${randInt(0, 9)}`);
      const expA = randInt(-4, 8);
      const expB = randInt(-4, 8);
      const coeffAText = trimDecimalString(`${coeffA}`);
      const coeffBText = trimDecimalString(`${coeffB}`);

      if (i % 2 === 0) {
        const rawCoeff = coeffA * coeffB;
        const rawExp = expA + expB;
        const normalized = plainToScientificParts(scientificToPlainString(trimDecimalString(`${rawCoeff}`), rawExp));
        questions.push(`計算：$(${coeffAText} \\times 10^{${expA}}) \\times (${coeffBText} \\times 10^{${expB}})$。`);
        answers.push(
          `先把係數相乘、指數相加：$${coeffAText}\\times${coeffBText}=${trimDecimalString(`${rawCoeff}`)}$，指數是 ${expA}+${expB}=${rawExp}，再整理成標準科學記號，結果是 $${normalized.text}$。`
        );
      } else {
        const rawCoeff = coeffA / coeffB;
        const rawExp = expA - expB;
        const normalized = plainToScientificParts(scientificToPlainString(trimDecimalString(`${rawCoeff}`), rawExp));
        questions.push(`計算：$(${coeffAText} \\times 10^{${expA}}) \\div (${coeffBText} \\times 10^{${expB}})$。`);
        answers.push(
          `先把係數相除、指數相減：$${coeffAText}\\div${coeffBText}=${trimDecimalString(`${Number(rawCoeff.toFixed(6))}`)}$，指數是 ${expA}-${expB}=${rawExp}，再整理成標準科學記號，結果是 $${normalized.text}$。`
        );
      }
    }

    return { questions, answers };
  }

  function buildScientificAddSubSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const commonExp = randInt(-8, 8);
      const coeffA = Number(`${randInt(1, 9)}.${randInt(0, 9)}`);
      const coeffB = Number(`${randInt(1, 9)}.${randInt(0, 9)}`);
      const shift = randInt(0, 1);
      const expA = commonExp;
      const expB = commonExp - shift;
      const isAdd = i % 2 === 0;
      const coeffAText = trimDecimalString(`${coeffA}`);
      const coeffBText = trimDecimalString(`${coeffB}`);

      const alignedB = shift === 0 ? coeffB : coeffB / 10;
      const alignedExpText = commonExp;
      const resultCoeff = isAdd ? coeffA + alignedB : coeffA - alignedB;
      const normalized = plainToScientificParts(
        scientificToPlainString(trimDecimalString(`${Number(resultCoeff.toFixed(6))}`), commonExp)
      );
      questions.push(
        `計算：$${coeffAText} \\times 10^{${expA}} ${isAdd ? '+' : '-'} ${coeffBText} \\times 10^{${expB}}$。`
      );
      answers.push(
        shift === 0
          ? `兩個指數已相同，直接合併係數：${coeffAText} ${isAdd ? '+' : '-'} ${coeffBText} = ${trimDecimalString(`${Number(resultCoeff.toFixed(6))}`)}，所以結果是 $${normalized.text}$。`
          : `先把 $${coeffBText} \\times 10^{${expB}}$ 改寫成 $${trimDecimalString(`${Number(alignedB.toFixed(6))}`)} \\times 10^{${alignedExpText}}$，再合併係數，最後整理成標準科學記號，結果是 $${normalized.text}$。`
      );
    }

    return { questions, answers };
  }

  function buildScientificUnitConversionSet(count) {
    const questions = [];
    const answers = [];
    const modes = [
      { from: '奈米', to: '公尺', factorText: '10^{-9}', factorExp: -9 },
      { from: '微米', to: '公尺', factorText: '10^{-6}', factorExp: -6 },
      { from: '公里', to: '公分', factorText: '10^{5}', factorExp: 5 },
      { from: '毫克', to: '公斤', factorText: '10^{-6}', factorExp: -6 },
      { from: '公斤', to: '毫克', factorText: '10^{6}', factorExp: 6 },
    ];

    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const plain = randInt(1, 99999);
      const scientific = plainToScientificParts(scientificToPlainString(`${plain}`, mode.factorExp));
      questions.push(`將 ${plain} ${mode.from} 換成 ${mode.to}，並用科學記號表示。`);
      answers.push(
        `因為 1 ${mode.from} = $${mode.factorText}$ ${mode.to}，所以 ${plain} ${mode.from} = $${plain} \\times ${mode.factorText} = ${scientific.text}$ ${mode.to}。`
      );
    }

    return { questions, answers };
  }

  function buildScientificNormalizeSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      let coefficient = '';
      let exponent = 0;
      if (i % 2 === 0) {
        coefficient = `${randInt(10, 9999)}.${randInt(0, 9)}`;
        exponent = -randInt(1, 5);
      } else {
        coefficient = `0.00${randInt(1, 9)}${randInt(0, 9)}${randInt(0, 9)}`;
        exponent = randInt(-7, 5);
      }
      const normalized = plainToScientificParts(scientificToPlainString(coefficient, exponent));
      questions.push(`把 $${trimDecimalString(coefficient)} \\times 10^{${exponent}}$ 改寫成標準科學記號。`);
      answers.push(`先把數值看成一般數，再把係數調整到介於 1 和 10 之間，所以標準科學記號是 $${normalized.text}$。`);
    }

    return { questions, answers };
  }

  function buildOppositeNumberSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const c = pickNonZero(-15, 15);
      const x = randInt(-20, 20);
      const exprValue = x + c;
      const opposite = -exprValue;
      const exprText = c >= 0 ? `x+${c}` : `x${c}`;
      questions.push(`${exprText}的相反數是${opposite}，求x=`);
      answers.push(`${x}`);
    }
    return { questions, answers };
  }

  function buildMidpointDistanceCombinedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      let b = randInt(-20, 20);
      while (b === a) b = randInt(-20, 20);
      const midpoint = (a + b) / 2;
      const distance = Math.abs(a - b);
      questions.push(`數線上有A(${a})和B(${b})兩點，求A、B兩點的中點座標和距離？`);
      answers.push(`中點=${midpoint}，距離=${distance}`);
    }
    return { questions, answers };
  }

  function buildSameShiftOppositeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-20, 20);
      const b = pickNonZero(-20, 20);
      const usePlus = randInt(0, 1) === 1;
      const x = usePlus ? -(a + b) / 2 : (a + b) / 2;
      const opText = usePlus ? '加' : '減';
      questions.push(`${a}和${b}兩數，同時${opText}x後成相反數，求x=?`);
      answers.push(`${x}`);
    }
    return { questions, answers };
  }

  function buildMidpointReverseSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      const c = randInt(-20, 20);
      if (a === c) {
        i -= 1;
        continue;
      }
      const b = (a + c) / 2;
      if (i === 0) {
        questions.push(`數線上有A(${a})、B(${b})和C(c)三點，且B為A、C中點，求c=?`);
      } else {
        questions.push(`A(${a})、B(${b})和C(c)，求c=?`);
      }
      answers.push(`${c}`);
    }
    return { questions, answers };
  }

  function buildMidpointPlusDistanceSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      let b = randInt(-20, 20);
      let c = randInt(-20, 20);
      while (b === a) b = randInt(-20, 20);
      while (c === a && c === b) c = randInt(-20, 20);
      const d = (a + b) / 2;
      const dist = Math.abs(c - d);
      if (i === 0) {
        questions.push(`A(${a})、B(${b})、C(${c})為數線上三點，若D為AB中點，則CD距離多少？`);
      } else {
        questions.push(`A(${a})、B(${b})、C(${c})，若D為AB中點，求CD。`);
      }
      answers.push(`${dist}`);
    }
    return { questions, answers };
  }

  function buildThreePointQuickDistanceSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      let b = randInt(-20, 20);
      let c = randInt(-20, 20);
      while (b === a) b = randInt(-20, 20);
      while (c === a || c === b) c = randInt(-20, 20);
      const ab = Math.abs(a - b);
      const bc = Math.abs(b - c);
      const ca = Math.abs(c - a);
      if (i === 0) {
        questions.push(`A(${a})、B(${b})、C(${c})為數線上三點，求AB、BC、CA？`);
      } else {
        questions.push(`A(${a})、B(${b})、C(${c})，求AB、BC、CA？`);
      }
      answers.push(`AB=${ab}，BC=${bc}，CA=${ca}`);
    }
    return { questions, answers };
  }

  function buildCoordinateOriginUnitChangeSet(count) {
    const questions = [];
    const answers = [];
    const scales = [2, 4, 0.5, 0.25];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      let b = randInt(-20, 20);
      let c = randInt(-20, 20);
      while (b === a) b = randInt(-20, 20);
      while (c === b) c = randInt(-20, 20);
      const s = scales[randInt(0, scales.length - 1)];
      const aNew = (a - b) / s;
      const cNew = (c - b) / s;
      const scaleText = s >= 1 ? `放大${s}倍` : `縮小為${s === 0.5 ? '2分之1' : '4分之1'}`;
      if (i === 0) {
        questions.push(`A(${a})、B(${b})、C(${c})，B當新原點，單位長${scaleText}，求A、C新的坐標。`);
      } else {
        questions.push(`A(${a})、B(${b})、C(${c})，單位長${scaleText}，求A、C新坐標。`);
      }
      answers.push(`A'=${aNew}，C'=${cNew}`);
    }
    return { questions, answers };
  }

  function fmtFraction(n, d) {
    return String.raw`\frac{${n}}{${d}}`;
  }

  function formatTerm(coef, variable = 'x') {
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${coef}${variable}`;
  }

  function trimFixed(value, digits = 2) {
    return Number(value)
      .toFixed(digits)
      .replace(/\.?0+$/, '');
  }

  function formatLinearExpr(a, b) {
    if (a === 0) return `${b}`;
    const xPart = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    if (b === 0) return xPart;
    return `${xPart}${b > 0 ? '+' : ''}${b}`;
  }

  function formatPolynomialFromCoeffs(coeffs, variable = 'x') {
    const degree = coeffs.length - 1;
    const parts = [];
    coeffs.forEach((coef, index) => {
      if (coef === 0) return;
      const power = degree - index;
      const absCoef = Math.abs(coef);
      let term = '';
      if (power === 0) {
        term = `${absCoef}`;
      } else if (power === 1) {
        term = absCoef === 1 ? variable : `${absCoef}${variable}`;
      } else {
        term = absCoef === 1 ? `${variable}^${power}` : `${absCoef}${variable}^${power}`;
      }

      if (!parts.length) {
        parts.push(coef < 0 ? `-${term}` : term);
      } else {
        parts.push(coef < 0 ? `- ${term}` : `+ ${term}`);
      }
    });
    return parts.join(' ') || '0';
  }

  function buildCubicDivideLinearSet(count) {
    const questions = [];
    const answers = [];

    while (questions.length < count) {
      const a = pickNonZero(-3, 3);
      const b = pickNonZero(-6, 6);
      const q2 = pickNonZero(-4, 4);
      const q1 = pickNonZero(-6, 6);
      const q0 = pickNonZero(-8, 8);

      const c3 = a * q2;
      const c2 = a * q1 + b * q2;
      const c1 = a * q0 + b * q1;
      const c0 = b * q0;
      if ([c3, c2, c1, c0].some((v) => v === 0)) continue;

      const dividend = formatPolynomialFromCoeffs([c3, c2, c1, c0]);
      const divisor = formatPolynomialFromCoeffs([a, b]);
      const quotient = formatPolynomialFromCoeffs([q2, q1, q0]);

      questions.push(`計算：\\((${dividend})\\div(${divisor})\\)`);
      answers.push(`\\((${dividend})\\div(${divisor})=${quotient}\\)`);
    }

    return { questions, answers };
  }

  function buildCubicDivideQuadraticSet(count) {
    const questions = [];
    const answers = [];

    while (questions.length < count) {
      const a = pickNonZero(-3, 3);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-8, 8);
      const p = pickNonZero(-4, 4);
      const q = pickNonZero(-6, 6);

      const c3 = a * p;
      const c2 = a * q + b * p;
      const c1 = b * q + c * p;
      const c0 = c * q;
      if ([c3, c2, c1, c0].some((v) => v === 0)) continue;

      const dividend = formatPolynomialFromCoeffs([c3, c2, c1, c0]);
      const divisor = formatPolynomialFromCoeffs([a, b, c]);
      const quotient = formatPolynomialFromCoeffs([p, q]);

      questions.push(`計算：\\((${dividend})\\div(${divisor})\\)`);
      answers.push(`\\((${dividend})\\div(${divisor})=${quotient}\\)`);
    }

    return { questions, answers };
  }

  function buildJ321SqrtEstimateMixedSet(count) {
    function pickFrom(list) {
      return list[randInt(0, list.length - 1)];
    }
    function simplifySquareRoot(value) {
      let outside = 1;
      let inside = value;
      for (let k = 2; k * k <= inside; k += 1) {
        while (inside % (k * k) === 0) {
          outside *= k;
          inside /= (k * k);
        }
      }
      return { outside, inside };
    }
    function buildEquivalentSqrtExprFromValue(value) {
      const simple = simplifySquareRoot(value);
      if (simple.outside === 1) return `\\sqrt{${value}}`;
      const useSimplified = randInt(0, 1) === 1;
      if (useSimplified) return `${simple.outside}\\sqrt{${simple.inside}}`;
      return `\\sqrt{${value}}`;
    }
    function buildIntervalTargetExpr(minRoot, maxRoot) {
      const n = randInt(minRoot, maxRoot);
      const delta = randInt(1, 2 * n);
      const value = n * n + delta;
      return {
        n,
        value,
        expr: buildEquivalentSqrtExprFromValue(value),
      };
    }

    const questions = [];
    const answers = [];
    const templates = [
      "nearest-integer",
      "between-two-integers",
      "integer-part",
      "count-n-in-interval",
      "find-a-from-interval",
      "two-radicals-integer-part",
    ];

    for (let i = 0; i < count; i += 1) {
      const type = templates[i % templates.length];

      if (type === "nearest-integer") {
        const { n, value, expr } = buildIntervalTargetExpr(8, 35);
        const x = value;
        const delta = x - n * n;
        const nearest = delta <= n ? n : n + 1;
        const wording = pickFrom([
          `哪一個整數最接近 \\(${expr}\\)？`,
          `在整數中，與 \\(${expr}\\) 距離最近的是哪一個？`,
          `估計 \\(${expr}\\) 最接近的整數。`,
        ]);
        questions.push(wording);
        answers.push(`\\(${nearest}\\)`);
        continue;
      }

      if (type === "between-two-integers") {
        const { n, value, expr } = buildIntervalTargetExpr(8, 26);
        const wording = pickFrom([
          `\\(${expr}\\) 介於哪兩個連續整數之間？`,
          `判斷：\\(${expr}\\) 落在哪一段 \\(k<${expr}<k+1\\)（寫出兩個整數）。`,
          `請寫出滿足 \\(a<${expr}<b\\) 的連續整數 \\(a,b\\)。`,
        ]);
        questions.push(wording);
        answers.push(`\\(${n}\\) 和 \\(${n + 1}\\)`);
        continue;
      }

      if (type === "integer-part") {
        const { n, value, expr } = buildIntervalTargetExpr(10, 30);
        const useVarStyle = randInt(0, 1) === 1;
        if (useVarStyle) {
          const varName = pickFrom(["a", "b", "k"]);
          const wordingVar = pickFrom([
            `設 \\(${varName}\\) 為 \\(${expr}\\) 的整數部分，求 \\(${varName}\\)。`,
            `令 \\(${varName}=\\lfloor ${expr} \\rfloor\\)，求 \\(${varName}\\)。`,
          ]);
          questions.push(wordingVar);
          answers.push(`\\(${n}\\)`);
          continue;
        }
        const wording = pickFrom([
          `求 \\(${expr}\\) 的整數部分。`,
          `\\(${expr}\\) 的整數部分是多少？`,
          `若 \\(a<${expr}<a+1\\)，求 \\(a\\)。`,
        ]);
        questions.push(wording);
        answers.push(`\\(${n}\\)`);
        continue;
      }

      if (type === "count-n-in-interval") {
        const a = randInt(6, 20);
        const b = randInt(a + 2, a + 7);
        const countN = b * b - a * a - 1;
        questions.push(`若 \\(${a}<\\sqrt{n}<${b}\\)，且 \\(n\\) 為正整數，符合條件的 \\(n\\) 有幾個？`);
        answers.push(`\\(${countN}\\)`);
        continue;
      }

      if (type === "find-a-from-interval") {
        const { n, value, expr } = buildIntervalTargetExpr(7, 28);
        const a = n;
        const useVarStyle = randInt(0, 1) === 1;
        if (useVarStyle) {
          const varName = pickFrom(["a", "m", "t"]);
          const wordingVar = pickFrom([
            `設 \\(${varName}\\) 為 \\(${expr}\\) 的整數部分，求 \\(${varName}\\)。`,
            `若 \\(${varName}<${expr}<${varName}+1\\)，且 \\(${varName}\\) 為整數，求 \\(${varName}\\)。`,
          ]);
          questions.push(wordingVar);
          answers.push(`\\(${a}\\)`);
          continue;
        }
        const wording = pickFrom([
          `若 \\(a<${expr}<a+1\\)，且 \\(a\\) 為正整數，求 \\(a\\)。`,
          `已知 \\(${expr}\\) 介於兩個連續整數之間，寫出較小的那個整數 \\(a\\)。`,
        ]);
        questions.push(wording);
        answers.push(`\\(${a}\\)`);
        continue;
      }

      if (type === "two-radicals-integer-part") {
        const left = buildIntervalTargetExpr(6, 16);
        const right = buildIntervalTargetExpr(7, 18);
        const leftVar = pickFrom(["a", "m"]);
        const rightVar = leftVar === "a" ? "b" : "n";
        const rootValue = left.n + right.n + 1;
        const question = pickFrom([
          `設 \\(${leftVar}\\) 為 \\(${left.expr}\\) 的整數部分，\\(${rightVar}\\) 為 \\(${right.expr}\\) 的整數部分，求 \\(\\sqrt{${leftVar}+${rightVar}+1}\\)。`,
          `若 \\(${leftVar}=\\lfloor ${left.expr} \\rfloor\\)、\\(${rightVar}=\\lfloor ${right.expr} \\rfloor\\)，求 \\(\\sqrt{${leftVar}+${rightVar}+1}\\)。`,
        ]);
        questions.push(question);
        answers.push(`\\(${Math.sqrt(rootValue)}\\)`);
        continue;
      }

    }
    return { questions, answers };
  }

  function buildRadicalMulDivSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 12);
      const b = randInt(2, 12);
      if (i % 2 === 0) {
        questions.push(`計算：\\(\\sqrt{${a}}\\cdot\\sqrt{${b}}\\)。`);
        answers.push(`\\(\\sqrt{${a}}\\cdot\\sqrt{${b}}=${formatRadical(a * b)}\\)。`);
      } else {
        const m = randInt(2, 12);
        const n = randInt(2, 12);
        questions.push(`計算：\\(\\frac{\\sqrt{${m * n}}}{\\sqrt{${n}}}\\)。`);
        answers.push(`\\(\\frac{\\sqrt{${m * n}}}{\\sqrt{${n}}}=${formatRadical(m)}\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildRadicalAddLikeTermsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const k = randInt(2, 15);
      const c1 = pickNonZero(-8, 8);
      const c2 = pickNonZero(-8, 8);
      questions.push(`化簡：\\(${c1}\\sqrt{${k}} ${c2 >= 0 ? '+' : '-'} ${Math.abs(c2)}\\sqrt{${k}}\\)。`);
      answers.push(
        `\\(${c1}\\sqrt{${k}} ${c2 >= 0 ? '+' : '-'} ${Math.abs(c2)}\\sqrt{${k}}=(${c1 + c2})\\sqrt{${k}}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildSimplestRadicalSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const out = randInt(2, 9);
      const inside = randInt(2, 12);
      const n = out * out * inside;
      questions.push(`化為最簡根式：\\(\\sqrt{${n}}\\)。`);
      answers.push(`\\(\\sqrt{${n}}=${out}\\sqrt{${inside}}\\)。`);
    }
    return { questions, answers };
  }

  function buildRationalizeMonomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 18);
      questions.push(`有理化分母：\\(\\frac{1}{\\sqrt{${a}}}\\)。`);
      answers.push(`\\(\\frac{1}{\\sqrt{${a}}}=\\frac{\\sqrt{${a}}}{${a}}\\)。`);
    }
    return { questions, answers };
  }

  function buildRationalizeBinomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 9);
      const b = randInt(2, 20);
      questions.push(`有理化分母：\\(\\frac{1}{${a}+\\sqrt{${b}}}\\)。`);
      answers.push(
        `\\(\\frac{1}{${a}+\\sqrt{${b}}}=\\frac{${a}-\\sqrt{${b}}}{(${a}+\\sqrt{${b}})(${a}-\\sqrt{${b}})}=\\frac{${a}-\\sqrt{${b}}}{${a * a - b}}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildAbsFourTermsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      const b = randInt(-20, 20);
      const c = randInt(-20, 20);
      const d = randInt(-20, 20);
      questions.push(
        `計算：\\(|${a}| ${b >= 0 ? '+' : '-'} ${Math.abs(b)} ${c >= 0 ? '+' : '-'} |${c}| ${d >= 0 ? '+' : '-'} ${Math.abs(d)}\\)`
      );
      const value = Math.abs(a) + b + (c >= 0 ? Math.abs(c) : -Math.abs(c)) + d;
      answers.push(
        `\\(|${a}| ${b >= 0 ? '+' : '-'} ${Math.abs(b)} ${c >= 0 ? '+' : '-'} |${c}| ${d >= 0 ? '+' : '-'} ${Math.abs(d)}=${value}\\)`
      );
    }
    return { questions, answers };
  }

  function buildAbsTwoGroupsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-12, 12),
        b = randInt(-12, 12);
      const c = randInt(-12, 12),
        d = randInt(-12, 12);
      const op = i % 2 === 0 ? '+' : '-';
      const left = Math.abs(a + b);
      const right = Math.abs(c + d);
      const result = op === '+' ? left + right : left - right;
      questions.push(`計算：\\(|(${a})+(${b})| ${op} |(${c})+(${d})|\\)`);
      answers.push(`\\(|(${a})+(${b})| ${op} |(${c})+(${d})|=${left} ${op} ${right}=${result}\\)`);
    }
    return { questions, answers };
  }

  function buildAbsRemoveAndCalcSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-3000, 3000);
      const b = randInt(-3000, 3000);
      const shift = randInt(-900, 900);
      const delta = [200, 400, 600, 800, 1000, 2000, 4000][randInt(0, 6)] * (randInt(0, 1) ? 1 : -1);

      // 第二組由第一組推導，形成「四個數字分兩組有關聯」
      const c = a + shift;
      const d = b + delta - shift;

      const op = randInt(0, 1) ? '+' : '-';
      const v1 = Math.abs(a + b);
      const v2 = Math.abs(c + d);
      const result = op === '+' ? v1 + v2 : v1 - v2;

      questions.push(`計算：\\(|(${a})+(${b})| ${op} |(${c})+(${d})|\\)`);
      answers.push(`\\(|(${a})+(${b})| ${op} |(${c})+(${d})|=${v1} ${op} ${v2}=${result}\\)`);
    }
    return { questions, answers };
  }

  function countIntegersInRange(minValue, maxValue, category) {
    let total = 0;
    for (let x = Math.ceil(minValue); x <= Math.floor(maxValue); x += 1) {
      if (category === '整數') {
        total += 1;
      } else if (category === '正整數') {
        if (x > 0) total += 1;
      } else if (category === '非負整數') {
        if (x >= 0) total += 1;
      } else if (category === '非正整數') {
        if (x <= 0) total += 1;
      } else if (category === '負整數') {
        if (x < 0) total += 1;
      }
    }
    return total;
  }

  function buildAbsCountBasicSet(count) {
    const questions = [];
    const answers = [];
    const categories = ['整數', '正整數', '非負整數', '非正整數', '負整數'];

    for (let i = 0; i < count; i += 1) {
      const n = randInt(4, 15);
      const category = categories[randInt(0, categories.length - 1)];
      const mode = randInt(0, 1); // 0: <=, 1: <
      let question = '';
      let result = 0;

      if (mode === 0) {
        result = countIntegersInRange(-n, n, category);
        question = `絕對值小於或等於${n}的${category}共有幾個？`;
      } else {
        result = countIntegersInRange(-n + 1, n - 1, category);
        question = `絕對值小於${n}的${category}共有幾個？`;
      }

      questions.push(question);
      answers.push(`${result}`);
    }
    return { questions, answers };
  }

  function buildAbsCountTwoSidedSet(count) {
    const questions = [];
    const answers = [];
    const categories = ['整數', '正整數', '非負整數'];

    for (let i = 0; i < count; i += 1) {
      const lower = randInt(3, 10);
      const upper = randInt(lower + 6, lower + 24);
      const category = categories[randInt(0, categories.length - 1)];
      const includeUpper = randInt(0, 1) === 1;
      const rightRangeMax = includeUpper ? upper : upper - 1;
      const leftRangeMin = includeUpper ? -upper : -upper + 1;
      const countRight = countIntegersInRange(lower, rightRangeMax, category);
      const countLeft = countIntegersInRange(leftRangeMin, -lower, category);
      const result = countLeft + countRight;
      const rightSymbol = includeUpper ? '\\le' : '<';

      questions.push(`符合\\(${lower}\\le |甲| ${rightSymbol} ${upper}\\)的${category}甲共有幾個？`);
      answers.push(`${result}`);
    }
    return { questions, answers };
  }

  function buildAbsCountReverseSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      { category: '整數', strict: false, minA: 4, maxA: 16 },
      { category: '整數', strict: true, minA: 5, maxA: 18 },
      { category: '正整數', strict: false, minA: 3, maxA: 15 },
      { category: '正整數', strict: true, minA: 4, maxA: 16 },
      { category: '非負整數', strict: false, minA: 3, maxA: 15 },
      { category: '非負整數', strict: true, minA: 4, maxA: 16 },
    ];

    for (let i = 0; i < count; i += 1) {
      const t = templates[randInt(0, templates.length - 1)];
      const a = randInt(t.minA, t.maxA);
      const lower = t.strict ? -a + 1 : -a;
      const upper = t.strict ? a - 1 : a;
      const result = countIntegersInRange(lower, upper, t.category);
      const signText = t.strict ? '<' : '\\le';
      questions.push(`a為整數，且滿足\\(|x| ${signText} a\\)的${t.category}有${result}個，則a=?`);
      answers.push(`${a}`);
    }
    return { questions, answers };
  }

  function buildAbsEquationLeadingOneSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const s = pickNonZero(-25, 25);
      const rhs = randInt(0, 18);
      const base = `求滿足 |x${s >= 0 ? '+' : ''}${s}|=${rhs} 的 x=?`;
      questions.push(base);
      if (rhs < 0) {
        answers.push('無解');
      } else if (rhs === 0) {
        answers.push(`x=${-s}`);
      } else {
        const left = formatSolvedX(-s + rhs, 1);
        const right = formatSolvedX(-s - rhs, 1);
        answers.push(`x=${left} 或 ${right}`);
      }
    }
    return { questions, answers };
  }

  function buildAbsEquationLeadingNotOneSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-10, 10);
      if (Math.abs(a) === 1) {
        i -= 1;
        continue;
      }
      const b = pickNonZero(-24, 24);
      const rhs = randInt(0, 20);
      questions.push(`求滿足 |${a}x${b >= 0 ? '+' : ''}${b}|=${rhs} 的 x=?`);
      if (rhs === 0) {
        answers.push(`x=$${formatSolvedX(-b, a)}$`);
      } else {
        answers.push(`x=$${formatSolvedX(rhs - b, a)}$ 或 $${formatSolvedX(-rhs - b, a)}$`);
      }
    }
    return { questions, answers };
  }

  function buildNonnegativeSumZeroSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-12, 12);
      const b = pickNonZero(-12, 12);
      const c = pickNonZero(-12, 12);
      questions.push(
        `已知 |x${a >= 0 ? '-' : '+'}${Math.abs(a)}|+|y${b >= 0 ? '-' : '+'}${Math.abs(b)}|+|z${c >= 0 ? '-' : '+'}${Math.abs(c)}|=0，且 x,y,z 為整數，則 x,y,z 為多少？`
      );
      answers.push(`${a}, ${b}, ${c}`);
    }
    return { questions, answers };
  }

  function buildNonnegativeSumFixedOneSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-10, 10);
      const b = pickNonZero(-10, 10);
      const c = pickNonZero(-10, 10);
      const dx = randInt(0, 3);
      const dy = randInt(0, 3);
      const dz = randInt(0, 3);
      const rhs = dx + dy + dz;
      const x = a + (randInt(0, 1) ? dx : -dx);
      const y = b + (randInt(0, 1) ? dy : -dy);
      const z = c + (randInt(0, 1) ? dz : -dz);
      questions.push(
        `已知 |x${a >= 0 ? '-' : '+'}${Math.abs(a)}|+|y${b >= 0 ? '-' : '+'}${Math.abs(b)}|+|z${c >= 0 ? '-' : '+'}${Math.abs(c)}|=${rhs}，且 x,y,z 為整數，則求一組 x,y,z。`
      );
      answers.push(`${x}, ${y}, ${z}`);
    }
    return { questions, answers };
  }

  function canRepresentByTwoWeights(value, p, q) {
    for (let u = 0; u * p <= value; u += 1) {
      const rem = value - u * p;
      if (rem % q === 0) return true;
    }
    return false;
  }

  function buildNonnegativeSumFixedMultiXSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-10, 10);
      const b = pickNonZero(-10, 10);
      const c = pickNonZero(-10, 10);
      const p = [1, 2, 3, 4][randInt(0, 3)];
      const q = [1, 2, 3, 5][randInt(0, 3)];
      const rhs = randInt(4, 14);
      const possibleX = [];
      for (let x = a - rhs; x <= a + rhs; x += 1) {
        const left = Math.abs(x - a);
        const rem = rhs - left;
        if (rem >= 0 && canRepresentByTwoWeights(rem, p, q)) {
          possibleX.push(x);
        }
      }
      if (possibleX.length < 2) {
        i -= 1;
        continue;
      }
      questions.push(
        `已知 |x${a >= 0 ? '-' : '+'}${Math.abs(a)}|+${p}|y${b >= 0 ? '-' : '+'}${Math.abs(b)}|+${q}|z${c >= 0 ? '-' : '+'}${Math.abs(c)}|=${rhs}，且 x,y,z 為整數，則 x 可能為多少？`
      );
      answers.push(possibleX.join('、'));
    }
    return { questions, answers };
  }

  function buildAbsoluteBothSidesAdvancedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-10, 10);
      const b = pickNonZero(-20, 20);
      const c = pickNonZero(-10, 10);
      const d = pickNonZero(-20, 20);
      const p = a - c;
      const qv = d - b;
      const r = a + c;
      const sv = -(b + d);
      const sols = [];
      if (p !== 0) sols.push(formatSolvedX(qv, p));
      if (r !== 0) sols.push(formatSolvedX(sv, r));
      const uniq = Array.from(new Set(sols));
      questions.push(`求滿足 |${a}x${b >= 0 ? '+' : ''}${b}|=|${c}x${d >= 0 ? '+' : ''}${d}| 的 x=?`);
      answers.push(uniq.length ? uniq.map((value) => `$${value}$`).join(' 或 ') : '無解');
    }
    return { questions, answers };
  }

  function calcStringRemainder(numString, mod) {
    let remainder = 0;
    for (let i = 0; i < numString.length; i += 1) {
      const digit = Number(numString[i]);
      remainder = (remainder * 10 + digit) % mod;
    }
    return remainder;
  }

  function replaceAt(source, index, value) {
    return `${source.slice(0, index)}${value}${source.slice(index + 1)}`;
  }

  function solveUnknownDigit(template, mod, targetRemainder) {
    const idx = template.indexOf('□');
    const result = [];
    if (idx < 0) return result;
    for (let d = 0; d <= 9; d += 1) {
      const candidate = replaceAt(template, idx, String(d));
      if (calcStringRemainder(candidate, mod) === targetRemainder) {
        result.push(d);
      }
    }
    return result;
  }

  function buildLargeNumberString(length, firstDigitMin = 1) {
    let out = String(randInt(firstDigitMin, 9));
    for (let i = 1; i < length; i += 1) {
      out += String(randInt(0, 9));
    }
    return out;
  }

  function buildModuloRemainderSet(mod, count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const n = buildLargeNumberString(randInt(8, 11));
      const r = calcStringRemainder(n, mod);
      questions.push(`求${n}除以${mod}的餘數？`);
      answers.push(`${r}`);
    }
    return { questions, answers };
  }

  function buildModuloUnknownMultipleSet(mod, count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const n = buildLargeNumberString(randInt(7, 10));
      const holeIndex = randInt(1, n.length - 1);
      const template = replaceAt(n, holeIndex, '□');
      const validDigits = solveUnknownDigit(template, mod, 0);
      questions.push(`${template}為${mod}的倍數，求□=?`);
      answers.push(validDigits.length ? validDigits.join(' 或 ') : '無解');
    }
    return { questions, answers };
  }

  function buildModuloUnknownRemainderSet(mod, count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const n = buildLargeNumberString(randInt(7, 10));
      const holeIndex = randInt(1, n.length - 1);
      let target = 0;
      let tries = 0;
      while (target === 0 && tries < 30) {
        const answerDigit = randInt(0, 9);
        const full = replaceAt(n, holeIndex, String(answerDigit));
        target = calcStringRemainder(full, mod);
        tries += 1;
      }
      if (target === 0) target = randInt(1, mod - 1);
      const template = replaceAt(n, holeIndex, '□');
      const validDigits = solveUnknownDigit(template, mod, target);
      questions.push(`${template}除以${mod}餘${target}，求□=?`);
      answers.push(validDigits.length ? validDigits.join(' 或 ') : '無解');
    }
    return { questions, answers };
  }

  function buildPrimeFactorList(max = 180) {
    return [
      12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 54, 56, 60, 72, 75, 84, 90, 96, 108, 120, 126, 140, 150, 168, 180,
    ].filter((value) => value <= max);
  }

  function primeFactorize(n) {
    const factors = [];
    let value = Math.abs(Number(n) || 0);
    for (let p = 2; p * p <= value; p += p === 2 ? 1 : 2) {
      if (value % p !== 0) continue;
      let exp = 0;
      while (value % p === 0) {
        value /= p;
        exp += 1;
      }
      factors.push({ prime: p, exp });
    }
    if (value > 1) {
      factors.push({ prime: value, exp: 1 });
    }
    return factors;
  }

  function formatPrimeFactorization(factors) {
    return factors.map(({ prime, exp }) => (exp === 1 ? `${prime}` : `${prime}^{${exp}}`)).join(' \\times ');
  }

  function divisorCountFromFactors(factors) {
    return factors.reduce((product, { exp }) => product * (exp + 1), 1);
  }

  function divisorSumFromFactors(factors) {
    return factors.reduce((product, { prime, exp }) => {
      return product * ((prime ** (exp + 1) - 1) / (prime - 1));
    }, 1);
  }

  function factorPairsOf(n) {
    const pairs = [];
    for (let d = 1; d * d <= n; d += 1) {
      if (n % d === 0) {
        const q = n / d;
        pairs.push([q, d]);
      }
    }
    return pairs;
  }

  function buildPrimeFactorNotationSet(count) {
    const questions = [];
    const answers = [];
    const candidates = buildPrimeFactorList(200).filter((value) => value >= 30);
    const pairFactors = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18];

    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const n = candidates[randInt(0, candidates.length - 1)];
        const factors = primeFactorize(n);
        const factorText = formatPrimeFactorization(factors);
        questions.push(`把 ${n} 寫成標準分解式。`);
        answers.push(`${n} = $${factorText}$。`);
      } else {
        const a = pairFactors[randInt(0, pairFactors.length - 1)];
        const b = pairFactors[randInt(0, pairFactors.length - 1)];
        const product = a * b;
        const factorTextA = formatPrimeFactorization(primeFactorize(a));
        const factorTextB = formatPrimeFactorization(primeFactorize(b));
        const factorText = formatPrimeFactorization(primeFactorize(product));
        questions.push(`將 $${a} \\times ${b}$ 重新做質因數分解，並整理成標準分解式。`);
        answers.push(
          `$${a}=${factorTextA}$，$${b}=${factorTextB}$，所以 $${a} \\times ${b}=${factorTextA} \\times ${factorTextB}=${factorText}$。`
        );
      }
    }

    return { questions, answers };
  }

  function buildDivisorCountSumMixedSet(count) {
    const questions = [];
    const answers = [];
    const candidates = buildPrimeFactorList(120);

    for (let i = 0; i < count; i += 1) {
      const n = candidates[randInt(0, candidates.length - 1)];
      const factors = primeFactorize(n);
      const factorText = formatPrimeFactorization(factors);
      const divisorCount = divisorCountFromFactors(factors);
      const divisorSum = divisorSumFromFactors(factors);
      const sumPieces = factors.map(
        ({ prime, exp }) => `(1+${Array.from({ length: exp }, (_, k) => `${prime}^{${k + 1}}`).join('+')})`
      );
      questions.push(`已知 ${n} 的標準分解式為 $${factorText}$，求 ${n} 的所有正因數共有幾個？正因數總和又是多少？`);
      answers.push(
        `因數個數由指數加 1 連乘可得：$${factors.map(({ exp }) => `(${exp}+1)`).join(' \\times ')} = ${divisorCount}$，所以共有 ${divisorCount} 個；正因數總和可用各質因數級數相乘：$${sumPieces.join(' \\times ')}=${divisorSum}$，所以總和是 ${divisorSum}。`
      );
    }

    return { questions, answers };
  }

  function buildRectangleFactorPairsSet(count) {
    const questions = [];
    const answers = [];
    const candidates = [24, 30, 36, 40, 42, 48, 54, 56, 60, 72, 84, 90];

    for (let i = 0; i < count; i += 1) {
      const n = candidates[randInt(0, candidates.length - 1)];
      const pairs = factorPairsOf(n).filter(([length, width]) => length >= width);
      const listText = pairs.map(([length, width]) => `$${length} \\times ${width}$`).join('、');
      if (i % 2 === 0) {
        questions.push(
          `用 ${n} 個邊長為 1 的小正方形拼成長方形，若長與寬皆為整數且長大於等於寬，請寫出所有可能的長寬組合。`
        );
        answers.push(
          `因為 ${n} 的因數配對為 ${listText}，所以所有可能的長寬組合是：${pairs.map(([length, width]) => `(${length},${width})`).join('、')}。`
        );
      } else {
        questions.push(`一個長方形面積是 ${n}，若長與寬皆為整數且長大於等於寬，最多有幾種不同的長寬組合？`);
        answers.push(`先找 ${n} 的因數配對：${listText}，共有 ${pairs.length} 種。`);
      }
    }

    return { questions, answers };
  }

  function lcmAll(values) {
    return values.reduce((acc, value) => lcm(acc, value));
  }

  function divisorsOf(n) {
    const result = [];
    for (let d = 1; d * d <= n; d += 1) {
      if (n % d !== 0) continue;
      result.push(d);
      if (d * d !== n) result.push(n / d);
    }
    return result.sort((a, b) => a - b);
  }

  function buildGcdLcmCalculationSet(count) {
    const questions = [];
    const answers = [];
    const pairCandidates = [24, 30, 36, 40, 42, 48, 54, 60, 72, 84, 90, 96, 108, 120];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;

      if (mode === 0) {
        const a = pairCandidates[randInt(0, pairCandidates.length - 1)];
        const b = pairCandidates[randInt(0, pairCandidates.length - 1)];
        const g = gcd(a, b);
        const l = lcm(a, b);
        questions.push(`求 ${a} 與 ${b} 的最大公因數與最小公倍數。`);
        answers.push(
          `先分解：$${a}=${formatPrimeFactorization(primeFactorize(a))}$，$${b}=${formatPrimeFactorization(primeFactorize(b))}$。共同質因數取較小次方，所以最大公因數是 ${g}；全部質因數取較大次方，所以最小公倍數是 ${l}。`
        );
        continue;
      }

      if (mode === 1) {
        const gBase = [2, 3, 4, 6][randInt(0, 3)];
        const a = gBase * [6, 8, 9, 10][randInt(0, 3)];
        const b = gBase * [9, 10, 12, 14][randInt(0, 3)];
        const c = gBase * [12, 15, 16, 18][randInt(0, 3)];
        const g = gcd(gcd(a, b), c);
        const l = lcmAll([a, b, c]);
        questions.push(`求 ${a}、${b}、${c} 的最大公因數與最小公倍數。`);
        answers.push(`三數的最大公因數為 ${g}；三數的最小公倍數為 ${l}。`);
        continue;
      }

      const a = pairCandidates[randInt(0, pairCandidates.length - 1)];
      const b = pairCandidates[randInt(0, pairCandidates.length - 1)];
      const g = gcd(a, b);
      const l = lcm(a, b);
      const factorA = formatPrimeFactorization(primeFactorize(a));
      const factorB = formatPrimeFactorization(primeFactorize(b));
      questions.push(`已知 $a=${factorA}$，$b=${factorB}$，求 $(a,b)$ 與 $[a,b]$。`);
      answers.push(`共同質因數取較小次方，得 $(a,b)=${g}$；全部質因數取較大次方，得 $[a,b]=${l}$。`);
    }

    return { questions, answers };
  }

  function buildGcdLcmProductRelationSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      const g = [2, 3, 4, 5, 6][randInt(0, 4)];
      let x = randInt(2, 8);
      let y = randInt(2, 8);
      while (gcd(x, y) !== 1) {
        x = randInt(2, 8);
        y = randInt(2, 8);
      }
      const a = g * x;
      const b = g * y;
      const l = g * x * y;
      const product = a * b;

      if (mode === 0) {
        questions.push(`已知兩正整數的最大公因數為 ${g}，最小公倍數為 ${l}，其中一數為 ${a}，求另一數。`);
        answers.push(`利用 $(a,b)\\times[a,b]=a\\times b$，可得另一數 $=\\dfrac{${g}\\times ${l}}{${a}}=${b}$。`);
        continue;
      }

      if (mode === 1) {
        questions.push(`已知兩正整數的乘積為 ${product}，最大公因數為 ${g}，求這兩數的最小公倍數。`);
        answers.push(`由 $(a,b)\\times[a,b]=a\\times b$，得最小公倍數 $=\\dfrac{${product}}{${g}}=${l}$。`);
        continue;
      }

      questions.push(`已知兩正整數的乘積為 ${product}，最小公倍數為 ${l}，求這兩數的最大公因數。`);
      answers.push(`由 $(a,b)\\times[a,b]=a\\times b$，得最大公因數 $=\\dfrac{${product}}{${l}}=${g}$。`);
    }

    return { questions, answers };
  }

  function buildRemainderShortageMixedSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;

      if (mode === 0) {
        const mods = [
          [8, 11, 15],
          [6, 9, 14],
          [7, 10, 13],
        ][randInt(0, 2)];
        const shortage = randInt(1, 3);
        const period = lcmAll(mods);
        const smallest = period - shortage;
        questions.push(
          `求一個最小正整數，用 ${mods[0]} 除不足 ${shortage}，用 ${mods[1]} 除不足 ${shortage}，用 ${mods[2]} 除也不足 ${shortage}。`
        );
        answers.push(
          `因為都「不足 ${shortage}」，所以這個數比 ${mods[0]}、${mods[1]}、${mods[2]} 的公倍數少 ${shortage}。最小公倍數是 ${period}，所以最小正整數是 ${smallest}。`
        );
        continue;
      }

      if (mode === 1) {
        const mods = [
          [6, 8, 9],
          [4, 6, 10],
          [5, 6, 8],
        ][randInt(0, 2)];
        const remainder = randInt(1, Math.min(...mods) - 1);
        const period = lcmAll(mods);
        const start = period + remainder;
        const end = start + period * 2;
        const values = [];
        for (let x = start; x <= end; x += 1) {
          if (mods.every((mod) => x % mod === remainder)) values.push(x);
        }
        questions.push(
          `在 ${start} 到 ${end} 之間，除以 ${mods[0]}、${mods[1]}、${mods[2]} 都餘 ${remainder} 的數有哪些？`
        );
        answers.push(
          `因為都餘 ${remainder}，所以先看 ${xToText(mods)} 的最小公倍數為 ${period}，再加上 ${remainder}。因此在範圍內的數有 ${values.join('、')}。`
        );
        continue;
      }

      let common = [12, 18, 24, 30, 36][randInt(0, 4)];
      let remainderA = randInt(1, 4);
      let shortageB = randInt(1, 4);
      let candidates = [];
      let left = 0;
      let right = 0;
      while (candidates.length < 2) {
        common = [12, 18, 24, 30, 36][randInt(0, 4)];
        remainderA = randInt(1, 4);
        shortageB = randInt(1, 4);
        left = common * randInt(4, 9) + remainderA;
        right = common * randInt(10, 18) - shortageB;
        candidates = divisorsOf(common).filter((d) => d > Math.max(remainderA, shortageB));
      }
      questions.push(`有一正整數除 ${left} 餘 ${remainderA}，除 ${right} 不足 ${shortageB}，求此數的最大值與最小值。`);
      answers.push(
        `此數必須同時整除 $${left}-${remainderA}=${left - remainderA}$ 與 $${right}+${shortageB}=${right + shortageB}$。因此可行的因數來自它們的公因數，最大值是 ${candidates[candidates.length - 1]}，最小值是 ${candidates[0]}。`
      );
    }

    return { questions, answers };
  }

  function xToText(mods) {
    return mods.join('、');
  }

  function solveCongruenceSystem(congruences, limit) {
    for (let x = 1; x <= limit; x += 1) {
      if (congruences.every(({ mod, rem }) => x % mod === rem)) return x;
    }
    return null;
  }

  function buildHanXinAdvancedSet(count) {
    const questions = [];
    const answers = [];
    const modSets = [
      [3, 5, 7],
      [4, 5, 7],
      [5, 7, 8],
    ];
    const rangeLow = 600;
    const rangeHigh = 800;

    for (let i = 0; i < count; i += 1) {
      let mods = [];
      let congruences = [];
      let period = 0;
      let base = 0;
      let values = [];
      let tries = 0;

      while (tries < 100) {
        mods = modSets[randInt(0, modSets.length - 1)];
        congruences = mods.map((mod) => ({ mod, rem: randInt(1, mod - 1) }));
        period = lcmAll(mods);
        base = solveCongruenceSystem(congruences, period);
        if (!base) {
          tries += 1;
          continue;
        }
        if (i % 2 === 0) break;
        values = [];
        for (let x = rangeLow; x <= rangeHigh; x += 1) {
          if (congruences.every(({ mod, rem }) => x % mod === rem)) values.push(x);
        }
        if (values.length > 0) break;
        tries += 1;
      }
      if (!base) continue;

      if (i % 2 === 0) {
        questions.push(
          `某隊伍點兵時，${mods[0]} 人一數餘 ${congruences[0].rem}，${mods[1]} 人一數餘 ${congruences[1].rem}，${mods[2]} 人一數餘 ${congruences[2].rem}，求最小的可能人數。`
        );
        answers.push(`這是一題韓信點兵型問題。因為要同時滿足三個餘數條件，最小正整數是 ${base}。`);
      } else {
        questions.push(
          `某隊伍點兵時，${mods[0]} 人一數餘 ${congruences[0].rem}，${mods[1]} 人一數餘 ${congruences[1].rem}，${mods[2]} 人一數餘 ${congruences[2].rem}。若總人數在 ${rangeLow} 到 ${rangeHigh} 之間，求所有可能的人數。`
        );
        answers.push(`這組條件每隔 ${period} 人會重複一次，因此在範圍內的可能人數有 ${values.join('、')}。`);
      }
    }

    return { questions, answers };
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function buildSeparateGroupingSet(count) {
    const questions = [];
    const answers = [];
    const stem = '男生女生分別分組，每組人數相同，最少可以分成幾組，每組多少人？';
    for (let i = 0; i < count; i += 1) {
      const unit = randInt(8, 24);
      const boysGroups = randInt(8, 20);
      const girlsGroups = randInt(8, 20);
      const boys = unit * boysGroups;
      const girls = unit * girlsGroups;
      const eachGroup = gcd(boys, girls);
      const minGroupCount = boys / eachGroup + girls / eachGroup;
      questions.push(`男生有${boys}人，女生有${girls}人。`);
      answers.push(`${minGroupCount}組，每組${eachGroup}人`);
    }
    return { intro: stem, questions, answers };
  }

  function buildMixedGroupingSet(count) {
    const questions = [];
    const answers = [];
    const stem = '男生女生合併分組，各組男生人數和女生人數都要相同，最多可分為多少組，男女分別為多少人？';
    for (let i = 0; i < count; i += 1) {
      const groups = randInt(8, 20);
      const boysEach = randInt(6, 28);
      const girlsEach = randInt(6, 28);
      const boys = groups * boysEach;
      const girls = groups * girlsEach;
      const maxGroups = gcd(boys, girls);
      questions.push(`男生有${boys}人，女生有${girls}人。`);
      answers.push(`${maxGroups}組，男生每組${boys / maxGroups}人，女生每組${girls / maxGroups}人`);
    }
    return { intro: stem, questions, answers };
  }

  function buildCircularTrackSet(count) {
    const questions = [];
    const answers = [];
    const trackLength = 1200;
    const stem = `三人同時由起點同方向出發，繞周長為${trackLength}公尺的環狀步道，則至少在幾分鐘後三人會同時回到出發點？`;
    for (let i = 0; i < count; i += 1) {
      const t1 = [20, 24, 25, 30, 40, 48, 50, 60][randInt(0, 7)];
      const t2 = [12, 15, 20, 24, 30, 40, 50, 60][randInt(0, 7)];
      const t3 = [10, 12, 15, 20, 24, 30, 40, 60][randInt(0, 7)];
      const v1 = trackLength / t1;
      const v2 = trackLength / t2;
      const v3 = trackLength / t3;
      const meetMinutes = lcm(lcm(t1, t2), t3);
      questions.push(`三人分速分別為${v1}公尺、${v2}公尺、${v3}公尺。`);
      answers.push(`${meetMinutes}`);
    }
    return { intro: stem, questions, answers };
  }

  function buildRoadTreeCountSet(count) {
    const questions = [];
    const answers = [];
    const stem = '道路種樹，相鄰樹與樹距離相等，最少要種幾棵？';
    for (let i = 0; i < count; i += 1) {
      const spacing = randInt(10, 20);
      const intervals = randInt(12, 32);
      const length = spacing * intervals;
      const mode = randInt(0, 2); // 0: 頭尾不種 1: 一端種 2: 頭尾都種
      let desc = '';
      let trees = 0;
      if (mode === 0) {
        desc = '頭尾都不種';
        trees = intervals - 1;
      } else if (mode === 1) {
        desc = '頭種尾不種';
        trees = intervals;
      } else {
        desc = '頭尾都要種';
        trees = intervals + 1;
      }
      questions.push(
        i === 0
          ? `${stem}<br>道路長${length}公尺，每${spacing}公尺種一棵樹，${desc}。`
          : `道路長${length}公尺，每${spacing}公尺種一棵樹，${desc}。`
      );
      answers.push(`${trees}`);
    }
    return { questions, answers };
  }

  function computeSingleSideRoadTrees(length, spacing, mode) {
    const intervals = Math.floor(length / spacing);
    if (mode === 'both') return intervals + 1;
    if (mode === 'none') return intervals - 1;
    if (mode === 'one-end') return intervals;
    return intervals; // loop
  }

  function buildRoadPlantingSingleSet(count) {
    const questions = [];
    const answers = [];
    const stem = '道路種樹（單側），相鄰樹距固定，求最少樹數。';
    for (let i = 0; i < count; i += 1) {
      const spacing = randInt(10, 20);
      const intervals = randInt(12, 30);
      const length = spacing * intervals;
      const modePick = randInt(0, 3);
      const mode = ['both', 'none', 'one-end', 'loop'][modePick];
      let desc = '';
      if (mode === 'both') desc = '頭尾都種';
      if (mode === 'none') desc = '頭尾都不種';
      if (mode === 'one-end') desc = '頭種尾不種';
      if (mode === 'loop') desc = '環狀種樹';
      const trees = computeSingleSideRoadTrees(length, spacing, mode);
      questions.push(`道路長${length}公尺，每${spacing}公尺種一棵，${desc}。`);
      answers.push(`${trees}`);
    }
    return { intro: stem, questions, answers };
  }

  function buildRoadPlantingDoubleSet(count) {
    const questions = [];
    const answers = [];
    const stem = '道路種樹（兩側），相鄰樹距固定，求最少樹數。';
    for (let i = 0; i < count; i += 1) {
      const spacing = randInt(10, 20);
      const intervals = randInt(12, 30);
      const length = spacing * intervals;
      const modePick = randInt(0, 2);
      const mode = ['both', 'none', 'one-end'][modePick];
      let desc = '';
      if (mode === 'both') desc = '頭尾都種';
      if (mode === 'none') desc = '頭尾都不種';
      if (mode === 'one-end') desc = '頭種尾不種';
      const oneSide = computeSingleSideRoadTrees(length, spacing, mode);
      const trees = oneSide * 2;
      questions.push(`道路長${length}公尺，每${spacing}公尺種一棵，${desc}。`);
      answers.push(`${trees}`);
    }
    return { intro: stem, questions, answers };
  }

  function buildTriangleParkTreeSet(count) {
    const questions = [];
    const answers = [];
    const stem = '三角公園周圍種樹，相鄰樹與樹距離相等，最少要種幾棵？';
    for (let i = 0; i < count; i += 1) {
      const g = [8, 10, 12, 14, 16][randInt(0, 4)];
      const a = g * randInt(10, 20);
      const b = g * randInt(10, 22);
      const c = g * randInt(10, 24);
      const d = gcd(gcd(a, b), c);
      const perimeterUnits = (a + b + c) / d;
      const withVertices = randInt(0, 1) === 1;
      const trees = withVertices ? perimeterUnits : perimeterUnits - 3;
      const vertexText = withVertices ? '三個頂點也要種樹' : '三個頂點不種樹';
      questions.push(
        i === 0
          ? `${stem}<br>三邊長分別是${a}公尺、${b}公尺、${c}公尺，${vertexText}。`
          : `三邊長分別是${a}公尺、${b}公尺、${c}公尺，${vertexText}。`
      );
      answers.push(`${trees}`);
    }
    return { questions, answers };
  }

  function buildRoadReplantKeepSet(count) {
    const questions = [];
    const answers = [];
    const stem = '長道路改變植樹間距，不需移動有幾棵？';
    for (let i = 0; i < count; i += 1) {
      const oldGap = [10, 20, 30, 40, 50][randInt(0, 4)];
      const newGap = [15, 25, 30, 45, 50, 55][randInt(0, 5)];
      const base = lcm(oldGap, newGap);
      const k = randInt(8, 22);
      const length = base * k;
      const bothSides = randInt(0, 1) === 1;
      const oneSideCount = length / base + 1;
      const keepCount = bothSides ? oneSideCount * 2 : oneSideCount;
      const sideText = bothSides ? '道路兩側種樹' : '道路一側種樹';
      questions.push(`長${length}公尺${sideText}，原本每${oldGap}公尺種一棵，改為每${newGap}公尺種一棵。`);
      answers.push(`${keepCount}`);
    }
    return { intro: stem, questions, answers };
  }

  function buildRectangleMaxSquarePiecesSet(count) {
    const questions = [];
    const answers = [];
    const stem = '長方形裁成大小相同正方形，當正方形邊長最大時，最少可裁幾塊？';
    for (let i = 0; i < count; i += 1) {
      const g = [7, 8, 9, 10, 11, 12][randInt(0, 5)];
      const lMul = randInt(6, 14);
      const wMul = randInt(4, lMul - 1);
      const length = g * lMul;
      const width = g * wMul;
      const pieces = (length / g) * (width / g);
      questions.push(`長方形長${length}公分、寬${width}公分。`);
      answers.push(`${pieces}`);
    }
    return { intro: stem, questions, answers };
  }

  function euclideanSquareCount(a, b) {
    let x = Math.max(a, b);
    let y = Math.min(a, b);
    let total = 0;
    while (y > 0) {
      total += Math.floor(x / y);
      const r = x % y;
      x = y;
      y = r;
    }
    return total;
  }

  function buildRectangleMinSquarePiecesSet(count) {
    const questions = [];
    const answers = [];
    const stem = '長方形裁成一些正方形，最少可裁幾塊？';
    for (let i = 0; i < count; i += 1) {
      const length = randInt(40, 180);
      let width = randInt(24, length - 1);
      while (width === length) width = randInt(24, length - 1);
      const pieces = euclideanSquareCount(length, width);
      questions.push(`長方形長${length}公分、寬${width}公分。`);
      answers.push(`${pieces}`);
    }
    return { intro: stem, questions, answers };
  }

  function buildLinearRemoveParenthesesSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const op = randInt(0, 1) ? '+' : '-';

      const left = formatLinearExpr(a1, b1);
      const right = formatLinearExpr(a2, b2);
      const coef = -a1 + (op === '+' ? a2 : -a2);
      const constant = -b1 + (op === '+' ? b2 : -b2);

      questions.push(`化簡：\\(-(${left})${op}(${right})\\)`);
      answers.push(`\\(-(${left})${op}(${right})=${formatLinearExpr(coef, constant)}\\)`);
    }
    return { questions, answers };
  }

  function buildLinearMultiplyParenthesesSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(2, 12);
      const q = pickNonZero(2, 12);
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const op = randInt(0, 1) ? '+' : '-';

      const left = formatLinearExpr(a1, b1);
      const right = formatLinearExpr(a2, b2);
      const coef = p * a1 + (op === '+' ? q * a2 : -q * a2);
      const constant = p * b1 + (op === '+' ? q * b2 : -q * b2);

      questions.push(`化簡：\\(${p}(${left})${op}${q}(${right})\\)`);
      answers.push(`\\(${p}(${left})${op}${q}(${right})=${formatLinearExpr(coef, constant)}\\)`);
    }
    return { questions, answers };
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function simplifyFraction(num, den) {
    if (den < 0) return simplifyFraction(-num, -den);
    const g = gcd(num, den);
    return { num: num / g, den: den / g };
  }

  function makeFraction(num, den = 1) {
    const simplified = simplifyFraction(num, den);
    return { num: simplified.num, den: simplified.den };
  }

  function addFraction(a, b) {
    return makeFraction(a.num * b.den + b.num * a.den, a.den * b.den);
  }

  function subFraction(a, b) {
    return makeFraction(a.num * b.den - b.num * a.den, a.den * b.den);
  }

  function mulFraction(a, b) {
    return makeFraction(a.num * b.num, a.den * b.den);
  }

  function divFraction(a, b) {
    return makeFraction(a.num * b.den, a.den * b.num);
  }

  function negateFraction(a) {
    return { num: -a.num, den: a.den };
  }

  function absFraction(a) {
    return { num: Math.abs(a.num), den: a.den };
  }

  function fractionToLatex(frac, mixed = false) {
    const value = makeFraction(frac.num, frac.den);
    if (value.den === 1) return `${value.num}`;
    if (!mixed) return `\\frac{${value.num}}{${value.den}}`;
    const negative = value.num < 0;
    const absNum = Math.abs(value.num);
    const whole = Math.floor(absNum / value.den);
    const rem = absNum % value.den;
    if (rem === 0) return `${value.num / value.den}`;
    if (whole === 0) return `${negative ? '-' : ''}\\frac{${rem}}{${value.den}}`;
    return `${negative ? '-' : ''}${whole}\\frac{${rem}}{${value.den}}`;
  }

  function fractionToText(frac, mixed = false) {
    return fractionToLatex(frac, mixed);
  }

  function integerOrFractionLatex(frac, mixed = true) {
    return fractionToLatex(frac, mixed);
  }

  function joinSignedFractionTerms(fracs, mixed = true) {
    return fracs
      .map((frac, index) => {
        const value = makeFraction(frac.num, frac.den);
        const absValue = makeFraction(Math.abs(value.num), value.den);
        const body = fractionToLatex(absValue, mixed);
        if (index === 0) {
          return value.num < 0 ? `-${body}` : body;
        }
        return `${value.num < 0 ? '-' : '+'}${body}`;
      })
      .join('');
  }

  function randomProperFraction(denChoices = [2, 3, 4, 5, 6, 7, 8, 9]) {
    const den = denChoices[randInt(0, denChoices.length - 1)];
    const num = randInt(1, den - 1);
    return makeFraction(num, den);
  }

  function randomMixedFraction(
    wholeMin = 1,
    wholeMax = 4,
    denChoices = [2, 3, 4, 5, 6, 7, 8, 9],
    allowNegative = true
  ) {
    const whole = randInt(wholeMin, wholeMax);
    const frac = randomProperFraction(denChoices);
    const signedWhole = allowNegative && randInt(0, 1) === 1 ? -whole : whole;
    const num = Math.abs(signedWhole) * frac.den + frac.num;
    return makeFraction(signedWhole < 0 ? -num : num, frac.den);
  }

  function makeMixedFraction(whole, fracNum, den, negative = false) {
    const absWhole = Math.abs(whole);
    const num = absWhole * den + fracNum;
    return makeFraction(negative ? -num : num, den);
  }

  function wholePlusSignedFractionLatex(whole, frac) {
    const value = makeFraction(frac.num, frac.den);
    const absValue = makeFraction(Math.abs(value.num), value.den);
    return `${whole}${value.num < 0 ? '-' : '+'}${fractionToLatex(absValue)}`;
  }

  function buildMixedNumberSumFactor(targetWhole) {
    const den = [2, 3, 4, 5, 6, 7, 8, 10][randInt(0, 7)];
    const fracA = randInt(1, den - 1);
    const fracB = den - fracA;
    const wholeA = randInt(Math.max(10, Math.floor(targetWhole * 0.25)), Math.max(10, Math.floor(targetWhole * 0.75)));
    const wholeB = targetWhole - 1 - wholeA;
    const left = makeMixedFraction(wholeA, fracA, den, false);
    const right = makeMixedFraction(wholeB, fracB, den, false);
    return {
      left,
      right,
      operator: '+',
      value: makeFraction(targetWhole, 1),
      latex: `\\left(${integerOrFractionLatex(left)}+${integerOrFractionLatex(right)}\\right)`,
      explain: `${integerOrFractionLatex(left)}+${integerOrFractionLatex(right)}`,
    };
  }

  function buildMixedNumberDiffFactor(targetWhole) {
    const den = [2, 3, 4, 5, 6, 7, 8, 10][randInt(0, 7)];
    const frac = randInt(1, den - 1);
    const offset = randInt(2, 99);
    const left = makeMixedFraction(targetWhole + offset, frac, den, false);
    const right = makeMixedFraction(offset, frac, den, false);
    return {
      left,
      right,
      operator: '-',
      value: makeFraction(targetWhole, 1),
      latex: `\\left(${integerOrFractionLatex(left)}-${integerOrFractionLatex(right)}\\right)`,
      explain: `${integerOrFractionLatex(left)}-${integerOrFractionLatex(right)}`,
    };
  }

  function buildMixedNumberStructuredFactor(targetWhole, forceMode = '') {
    const mode = forceMode || (randInt(0, 1) === 0 ? 'sum' : 'diff');
    return mode === 'diff' ? buildMixedNumberDiffFactor(targetWhole) : buildMixedNumberSumFactor(targetWhole);
  }

  function buildFractionAddSubBracketSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const denMain = [5, 6, 8, 10][randInt(0, 3)];
      const denCancel = [3, 4, 7, 9][randInt(0, 3)];
      const fracA = randInt(1, denMain - 1);
      const fracB = randInt(1, denMain - 1);
      const fracD = randInt(1, denMain - 1);
      const fracCancel = randInt(1, denCancel - 1);
      const a = makeMixedFraction(randInt(2, 6), fracA, denMain, false);
      const b = makeMixedFraction(randInt(2, 6), fracB, denMain, false);
      const c = makeMixedFraction(randInt(3, 8), fracCancel, denCancel, false);
      const d = makeMixedFraction(randInt(2, 6), fracD, denMain, false);
      const e = makeMixedFraction(randInt(2, 7), fracCancel, denCancel, false);
      const result = subFraction(subFraction(a, addFraction(b, c)), subFraction(d, e));
      questions.push(
        `計算：$${integerOrFractionLatex(a)}-\\left(${integerOrFractionLatex(b)}+${integerOrFractionLatex(c)}\\right)-\\left(${integerOrFractionLatex(d)}-${integerOrFractionLatex(e)}\\right)$。`
      );
      answers.push(
        `先去括號：$${joinSignedFractionTerms([a, negateFraction(b), negateFraction(c), negateFraction(d), e], true)}$。觀察可知 $${fractionToLatex(makeFraction(fracCancel, denCancel))}$ 與 $-${fractionToLatex(makeFraction(fracCancel, denCancel))}$ 互相抵消，剩下的只要處理分母都是 $${denMain}$ 的分數部分，整理後得 $${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, answers };
  }

  function buildFractionAddSubNegativeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randomMixedFraction(1, 3, [2, 3, 4, 5, 6], false);
      const b = randomProperFraction([2, 3, 4, 5, 6, 8, 9]);
      const c = randomProperFraction([2, 3, 4, 5, 6, 8, 9]);
      const d = randomMixedFraction(1, 3, [2, 3, 4, 5, 6], true);
      const result = addFraction(addFraction(addFraction(a, b), c), d);
      questions.push(
        `計算：$${integerOrFractionLatex(a)}-\\left(-${integerOrFractionLatex(b)}\\right)+${integerOrFractionLatex(c)}-\\left(${integerOrFractionLatex(negateFraction(d))}\\right)$。`
      );
      answers.push(
        `把減去負數改成加：$${joinSignedFractionTerms([a, b, c, d], true)}$，結果是 $${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, answers };
  }

  function buildFractionAbsoluteSymmetrySet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(2, 4);
      const a = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const b = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const c = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const d = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const useAddition = randInt(0, 1) === 1;
      const leftInner = addFraction(subFraction(addFraction(makeFraction(base, 1), a), b), subFraction(c, d));
      const rightInner = addFraction(
        subFraction(subFraction(makeFraction(base, 1), a), b),
        subFraction(negateFraction(c), d)
      );
      const result = useAddition
        ? addFraction(absFraction(leftInner), absFraction(rightInner))
        : subFraction(absFraction(leftInner), absFraction(rightInner));
      const leftExpr = `${base}+${fractionToLatex(a)}-${fractionToLatex(b)}+${fractionToLatex(c)}-${fractionToLatex(d)}`;
      const rightExpr = `${base}-${fractionToLatex(a)}-${fractionToLatex(b)}-${fractionToLatex(c)}-${fractionToLatex(d)}`;
      questions.push(`計算：$\\left|${leftExpr}\\right|${useAddition ? '+' : '-'}\\left|${rightExpr}\\right|$。`);
      answers.push(
        `先各自算兩個絕對值內部，再取絕對值：$\\left|${leftExpr}\\right|=${fractionToLatex(absFraction(leftInner), true)}$、$\\left|${rightExpr}\\right|=${fractionToLatex(absFraction(rightInner), true)}$。最後依題目的 ${useAddition ? '加法' : '減法'} 合併，得 $${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, answers };
  }

  function buildFractionMulDivMixedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randomMixedFraction(2, 4, [2, 3, 4, 5, 6], true);
      let b = randomProperFraction([2, 3, 4, 5, 6, 7]);
      if (randInt(0, 1) === 1) b = negateFraction(b);
      let c = randomProperFraction([2, 3, 4, 5, 6, 7]);
      if (randInt(0, 1) === 1) c = negateFraction(c);
      const result = divFraction(divFraction(a, b), c);
      questions.push(
        `計算：$\\left(${integerOrFractionLatex(a)}\\right)\\div\\left(${fractionToLatex(b)}\\right)\\div\\left(${fractionToLatex(c)}\\right)$。`
      );
      answers.push(
        `先把除法改成乘倒數：$${integerOrFractionLatex(a)}\\times\\frac{${b.den}}{${b.num}}\\times\\frac{${c.den}}{${c.num}}$，約分整理後得 $${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, answers };
  }

  function buildFractionDistributiveCommonFactorSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const common = [makeFraction(-25, 1), makeFraction(-125, 1), makeFraction(-250, 1)][randInt(0, 2)];
      const target = [300, 400, 500, 600, 800, 900, 1000, 1200][randInt(0, 7)];
      const den = [2, 4, 5, 8][randInt(0, 3)];
      const fracNum = randInt(1, den - 1);
      const wholeA = randInt(50, target - 51);
      const wholeB = target - wholeA - 1;
      const a = makeMixedFraction(wholeA, fracNum, den, false);
      const b = makeMixedFraction(wholeB, den - fracNum, den, false);
      const sum = addFraction(a, b);
      const result = mulFraction(sum, common);
      questions.push(
        `利用分配律計算：$${integerOrFractionLatex(a)}\\times\\left(${fractionToLatex(common)}\\right)+${integerOrFractionLatex(b)}\\times\\left(${fractionToLatex(common)}\\right)$。`
      );
      answers.push(
        `提出公因數 $${fractionToLatex(common)}$：$\\left(${integerOrFractionLatex(a)}+${integerOrFractionLatex(b)}\\right)\\times\\left(${fractionToLatex(common)}\\right)=${integerOrFractionLatex(sum)}\\times\\left(${fractionToLatex(common)}\\right)=${fractionToLatex(result, true)}$。先把括號內兩項合併成完整的數，再做整數乘法會更快。`
      );
    }
    return { questions, answers };
  }

  function buildFractionDistributiveRegroupSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const leftTarget = [1200, 1700, 2400, 3200, 4500, 5600][randInt(0, 5)];
      const rightTarget = [120, 160, 240, 320, 400, 500, 600, 800, 1700][randInt(0, 8)];
      const modePattern = [
        ['sum', 'sum'],
        ['sum', 'diff'],
        ['diff', 'sum'],
        ['diff', 'diff'],
      ][randInt(0, 3)];
      const leftFactor = buildMixedNumberStructuredFactor(leftTarget, modePattern[0]);
      const rightFactor = buildMixedNumberStructuredFactor(rightTarget, modePattern[1]);
      const result = mulFraction(leftFactor.value, rightFactor.value);
      const leftSign = leftFactor.operator === '+' ? 1 : -1;
      const rightSign = rightFactor.operator === '+' ? 1 : -1;
      const productTerms = [
        {
          sign: 1,
          latex: `\\left(${integerOrFractionLatex(leftFactor.left)}\\right)\\times\\left(${integerOrFractionLatex(rightFactor.left)}\\right)`,
        },
        {
          sign: rightSign,
          latex: `\\left(${integerOrFractionLatex(leftFactor.left)}\\right)\\times\\left(${integerOrFractionLatex(rightFactor.right)}\\right)`,
        },
        {
          sign: leftSign,
          latex: `\\left(${integerOrFractionLatex(leftFactor.right)}\\right)\\times\\left(${integerOrFractionLatex(rightFactor.left)}\\right)`,
        },
        {
          sign: leftSign * rightSign,
          latex: `\\left(${integerOrFractionLatex(leftFactor.right)}\\right)\\times\\left(${integerOrFractionLatex(rightFactor.right)}\\right)`,
        },
      ];
      const questionLatex = productTerms
        .map((term, index) => {
          if (index === 0) return term.latex;
          return `${term.sign < 0 ? '-' : '+'}${term.latex}`;
        })
        .join('');

      const regroupLatex = [
        `\\left(${integerOrFractionLatex(leftFactor.left)}\\right)\\times${rightFactor.latex}`,
        `${leftSign < 0 ? '-' : '+'}\\left(${integerOrFractionLatex(leftFactor.right)}\\right)\\times${rightFactor.latex}`,
      ].join('');

      questions.push(`利用分配律簡算：$${questionLatex}$。`);
      answers.push(
        `先把前兩項與後兩項分組，可寫成 $${regroupLatex}$。再提出共同的 $${rightFactor.latex}$，得到 $${leftFactor.latex}${rightFactor.latex}$。接著整理括號：$${leftFactor.explain}=${leftTarget}$，$${rightFactor.explain}=${rightTarget}$，所以原式 $=${leftTarget}\\times ${rightTarget}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, answers };
  }

  function buildTelescopingGapFourSumSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const gap = [2, 3, 4, 5, 6][randInt(0, 4)];
      const start = randInt(2, 9);
      const terms = randInt(5, 8);
      const seq = Array.from({ length: terms + 1 }, (_, idx) => start + idx * gap);
      const first = `\\frac{1}{${seq[0]}\\times ${seq[1]}}`;
      const second = `\\frac{1}{${seq[1]}\\times ${seq[2]}}`;
      const penultimate = `\\frac{1}{${seq[terms - 1]}\\times ${seq[terms]}}`;
      const last = `\\frac{1}{${seq[terms - 2]}\\times ${seq[terms - 1]}}`;
      const telescoped = mulFraction(
        makeFraction(1, gap),
        subFraction(makeFraction(1, seq[0]), makeFraction(1, seq[terms]))
      );
      questions.push(`計算：$${first}+${second}+\\cdots+${last}+${penultimate}$。`);
      answers.push(
        `因為 $\\frac{1}{k(k+${gap})}=\\frac{1}{${gap}}\\left(\\frac{1}{k}-\\frac{1}{k+${gap}}\\right)$，所以中間項會對消，結果是 $${fractionToLatex(telescoped)}$。`
      );
    }
    return { questions, answers };
  }

  function buildTelescopingAdjacentSumSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const start = randInt(1, 6);
      const terms = randInt(5, 8);
      const numerator = randInt(1, 5);
      const first = `\\frac{${numerator}}{${start}\\times ${start + 1}}`;
      const second = `\\frac{${numerator}}{${start + 1}\\times ${start + 2}}`;
      const lastLeft = start + terms - 2;
      const last = `\\frac{${numerator}}{${lastLeft}\\times ${lastLeft + 1}}`;
      const penultimate = `\\frac{${numerator}}{${lastLeft + 1}\\times ${lastLeft + 2}}`;
      const result = mulFraction(
        makeFraction(numerator, 1),
        subFraction(makeFraction(1, start), makeFraction(1, start + terms))
      );
      questions.push(`計算：$${first}+${second}+\\cdots+${last}+${penultimate}$。`);
      answers.push(
        `因為 $\\frac{${numerator}}{k(k+1)}=${numerator}\\left(\\frac{1}{k}-\\frac{1}{k+1}\\right)$，所以分項對消後得到 $${numerator}\\left(\\frac{1}{${start}}-\\frac{1}{${start + terms}}\\right)=${fractionToLatex(result)}$。`
      );
    }
    return { questions, answers };
  }

  function buildTelescopingProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const numerator = randInt(1, 2);
      const start = numerator === 1 ? randInt(3, 7) : randInt(4, 8);
      const terms = randInt(5, 8);
      const denoms = Array.from({ length: terms }, (_, idx) => start + idx);
      const first = `\\left(1-\\frac{${numerator}}{${denoms[0]}}\\right)`;
      const second = `\\left(1-\\frac{${numerator}}{${denoms[1]}}\\right)`;
      const last = `\\left(1-\\frac{${numerator}}{${denoms[terms - 2]}}\\right)`;
      const penultimate = `\\left(1-\\frac{${numerator}}{${denoms[terms - 1]}}\\right)`;
      const remainingNum = numerator === 1 ? [start - 1] : [start - 2, start - 1];
      const remainingDen = numerator === 1 ? [denoms[terms - 1]] : [denoms[terms - 2], denoms[terms - 1]];
      const result = makeFraction(
        remainingNum.reduce((acc, value) => acc * value, 1),
        remainingDen.reduce((acc, value) => acc * value, 1)
      );
      const expandedFirst = numerator === 1 ? `\\frac{${start - 1}}{${start}}` : `\\frac{${start - 2}}{${start}}`;
      const expandedSecond = numerator === 1 ? `\\frac{${start}}{${start + 1}}` : `\\frac{${start - 1}}{${start + 1}}`;
      const expandedLast =
        numerator === 1
          ? `\\frac{${denoms[terms - 2] - 1}}{${denoms[terms - 2]}}`
          : `\\frac{${denoms[terms - 2] - 2}}{${denoms[terms - 2]}}`;
      const expandedPenultimate =
        numerator === 1
          ? `\\frac{${denoms[terms - 1] - 1}}{${denoms[terms - 1]}}`
          : `\\frac{${denoms[terms - 1] - 2}}{${denoms[terms - 1]}}`;
      questions.push(`計算：$${first}\\times${second}\\times\\cdots\\times${last}\\times${penultimate}$。`);
      answers.push(
        numerator === 1
          ? `把每一項改寫成分數，可得 $${expandedFirst}\\times${expandedSecond}\\times\\cdots\\times${expandedLast}\\times${expandedPenultimate}$。前後對消後，分子只剩 1 項、分母也只剩 1 項，所以結果是 $${fractionToLatex(result)}$。`
          : `把每一項改寫成分數，可得 $${expandedFirst}\\times${expandedSecond}\\times\\cdots\\times${expandedLast}\\times${expandedPenultimate}$。前後對消後，分子剩下 $${remainingNum[0]}\\times ${remainingNum[1]}$，分母剩下 $${remainingDen[0]}\\times ${remainingDen[1]}$，所以結果是 $${fractionToLatex(result)}$。`
      );
    }
    return { questions, answers };
  }

  function buildLinearFractionParenthesesSet(count) {
    const questions = [];
    const answers = [];
    const denChoices = [2, 3, 4, 5, 6, 7, 8, 9];

    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-12, 12),
        b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12),
        b2 = pickNonZero(-12, 12);
      const d1 = denChoices[randInt(0, denChoices.length - 1)];
      const d2 = denChoices[randInt(0, denChoices.length - 1)];
      const op = randInt(0, 1) ? '+' : '-';

      const coefNum = op === '+' ? a1 * d2 + a2 * d1 : a1 * d2 - a2 * d1;
      const constNum = op === '+' ? b1 * d2 + b2 * d1 : b1 * d2 - b2 * d1;
      const commonDen = d1 * d2;
      const sCoef = simplifyFraction(coefNum, commonDen);
      const sConst = simplifyFraction(constNum, commonDen);

      const frac1 = String.raw`\frac{${a1}x${b1 >= 0 ? '+' : ''}${b1}}{${d1}}`;
      const frac2 = String.raw`\frac{${a2}x${b2 >= 0 ? '+' : ''}${b2}}{${d2}}`;
      const coefText = sCoef.den === 1 ? `${sCoef.num}x` : String.raw`\frac{${sCoef.num}}{${sCoef.den}}x`;
      const constText =
        sConst.num === 0
          ? ''
          : sConst.den === 1
            ? `${sConst.num > 0 ? '+' : ''}${sConst.num}`
            : `${sConst.num > 0 ? '+' : '-'}${String.raw`\frac{${Math.abs(sConst.num)}}{${sConst.den}}`}`;

      questions.push(`化簡：\\(${frac1} ${op} ${frac2}\\)`);
      answers.push(`\\(${frac1} ${op} ${frac2}=${coefText}${constText}\\)`);
    }
    return { questions, answers };
  }

  function formatSolvedX(num, den) {
    const f = simplifyFraction(num, den);
    if (f.den === 1) return `${f.num}`;
    return String.raw`\frac{${f.num}}{${f.den}}`;
  }

  function buildLinearMoveTermsSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-12, 12);
      let c = pickNonZero(-12, 12);
      while (c === a) c = pickNonZero(-12, 12);
      const b = pickNonZero(-18, 18);
      const d = pickNonZero(-18, 18);
      const left = formatLinearExpr(a, b);
      const right = formatLinearExpr(c, d);
      const coef = a - c;
      const constant = d - b;
      questions.push(`解：\\(${left}=${right}\\)`);
      answers.push(`\\(${coef}x=${constant}\\Rightarrow x=${formatSolvedX(constant, coef)}\\)`);
    }
    return { questions, answers };
  }

  function buildLinearExpandMoveSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(-10, 10);
      const q = pickNonZero(-10, 10);
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const coef = p * a1 - q * a2;
      if (coef === 0) {
        i -= 1;
        continue;
      }
      const constant = q * b2 - p * b1;
      const left = formatLinearExpr(a1, b1);
      const right = formatLinearExpr(a2, b2);
      questions.push(`解：\\(${p}(${left})=${q}(${right})\\)`);
      answers.push(`\\(${coef}x=${constant}\\Rightarrow x=${formatSolvedX(constant, coef)}\\)`);
    }
    return { questions, answers };
  }

  function buildLinearCrossMultiplySolveSet(count) {
    const questions = [];
    const answers = [];
    const denChoices = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const m = denChoices[randInt(0, denChoices.length - 1)];
      const n = denChoices[randInt(0, denChoices.length - 1)];
      const coef = n * a1 - m * a2;
      if (coef === 0) {
        i -= 1;
        continue;
      }
      const constant = m * b2 - n * b1;
      const leftNum = formatLinearExpr(a1, b1);
      const rightNum = formatLinearExpr(a2, b2);
      questions.push(`解：\\(\\frac{${leftNum}}{${m}}=\\frac{${rightNum}}{${n}}\\)`);
      answers.push(
        `\\(${n}(${leftNum})=${m}(${rightNum})\\Rightarrow ${coef}x=${constant}\\Rightarrow x=${formatSolvedX(constant, coef)}\\)`
      );
    }
    return { questions, answers };
  }

  function buildLinearLcmMultiplySolveSet(count) {
    const questions = [];
    const answers = [];
    const denChoices = [2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const m = denChoices[randInt(0, denChoices.length - 1)];
      const n = denChoices[randInt(0, denChoices.length - 1)];
      const c = pickNonZero(-6, 6);
      const l = lcm(m, n);
      const left1 = formatLinearExpr(a1, b1);
      const left2 = formatLinearExpr(a2, b2);
      const op = randInt(0, 1) ? '+' : '-';
      const secondCoef = op === '+' ? a2 : -a2;
      const secondConst = op === '+' ? b2 : -b2;
      const coef2 = (l / n) * secondCoef;
      const const2 = (l / n) * secondConst;
      const finalCoef = (l / m) * a1 + coef2;
      if (finalCoef === 0) {
        i -= 1;
        continue;
      }
      const finalConstant = l * c - (l / m) * b1 - const2;
      questions.push(`解：\\(\\frac{${left1}}{${m}} ${op} \\frac{${left2}}{${n}}=${c}\\)`);
      answers.push(
        `同乘\\(${l}\\)：\\(${finalCoef}x=${finalConstant}\\Rightarrow x=${formatSolvedX(finalConstant, finalCoef)}\\)`
      );
    }
    return { questions, answers };
  }

  function buildLinearSameSolutionSet(count) {
    const questions = [];
    const answers = [];

    function formatNExpr(constant = 0) {
      if (constant === 0) return 'nx';
      return `nx${constant > 0 ? '+' : ''}${constant}`;
    }

    for (let i = 0; i < count; i += 1) {
      const xValue = pickNonZero(-6, 6);
      const leftScale = pickNonZero(-5, 5);
      const innerConst = pickNonZero(-6, 6);
      let rightCoef = pickNonZero(-5, 5);
      while (rightCoef === leftScale) rightCoef = pickNonZero(-5, 5);
      const rightConst = leftScale * (xValue + innerConst) - rightCoef * xValue;

      const leftEq = `${leftScale}\\left(x${innerConst >= 0 ? '+' : ''}${innerConst}\\right)`;
      const rightEq = formatLinearExpr(rightCoef, rightConst);

      const leftLinearCoef = pickNonZero(-8, 8);
      const nValue = pickNonZero(-8, 8);
      const leftLinearConst = pickNonZero(-10, 10);
      const rightLinearConst = leftLinearCoef * xValue + leftLinearConst - nValue * xValue;
      const secondLeft = formatLinearExpr(leftLinearCoef, leftLinearConst);
      const secondRight = formatNExpr(rightLinearConst);

      questions.push(`已知 $${leftEq}=${rightEq}$ 與 $${secondLeft}=${secondRight}$ 的解相同，求 $n$。`);
      answers.push(
        `先解第一式：$${leftEq}=${rightEq}\\Rightarrow ${leftScale - rightCoef}x=${rightConst - leftScale * innerConst}\\Rightarrow x=${xValue}$。再把 $x=${xValue}$ 代入第二式：$${secondLeft}=${secondRight}\\Rightarrow ${leftLinearCoef * xValue + leftLinearConst}=${xValue}n${rightLinearConst >= 0 ? '+' : ''}${rightLinearConst}\\Rightarrow ${xValue}n=${leftLinearCoef * xValue + leftLinearConst - rightLinearConst}\\Rightarrow n=${nValue}$。`
      );
    }
    return { questions, answers };
  }

  function buildPurchaseDiscountApplicationSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const templates = [
          { cost: 300, profitRate: 20, discount: 8 },
          { cost: 450, profitRate: 25, discount: 8 },
          { cost: 600, profitRate: 50, discount: 9 },
          { cost: 750, profitRate: 20, discount: 8 },
          { cost: 900, profitRate: 25, discount: 8 },
          { cost: 1200, profitRate: 50, discount: 9 },
          { cost: 840, profitRate: 40, discount: 10 },
          { cost: 560, profitRate: 25, discount: 9 },
        ];
        const validTemplates = templates.filter((item) => {
          const soldValue = (item.cost * (100 + item.profitRate)) / 100;
          const listValue = (soldValue * 10) / item.discount;
          return Number.isInteger(listValue);
        });
        if (!validTemplates.length) {
          questions.push('某商品的成本與折扣資料有誤，暫無可用題目。');
          answers.push('本題資料需調整為可整數計算。');
          continue;
        }
        const pick = validTemplates[cycle % validTemplates.length];
        const cost = pick.cost;
        const profitRate = pick.profitRate;
        const discount = pick.discount;
        const sold = (cost * (100 + profitRate)) / 100;
        const list = (sold * 10) / discount;
        questions.push(
          `某商品定價 ${list} 元，若以定價的 ${discount} 折出售，可獲利 ${profitRate}% ，求此商品的成本。`
        );
        answers.push(
          `設成本為 $x$ 元，則售價為 $${discount / 10}\\times ${list}$。依題意列式：$${discount / 10}\\times ${list}=\\left(1+${profitRate / 100}\\right)x$。解得 $x=${cost}$。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { cost: 400, markup: 30, discount: 9 },
          { cost: 500, markup: 50, discount: 8 },
          { cost: 800, markup: 30, discount: 9 },
          { cost: 1000, markup: 50, discount: 9 },
          { cost: 1200, markup: 30, discount: 9 },
          { cost: 900, markup: 40, discount: 10 },
          { cost: 700, markup: 50, discount: 8 },
        ];
        const validTemplates = templates.filter((item) => {
          const soldValue = (((item.cost * (100 + item.markup)) / 100) * item.discount) / 10;
          const profitValue = soldValue - item.cost;
          return Number.isInteger(profitValue) && profitValue > 0;
        });
        if (!validTemplates.length) {
          questions.push('某商品的加價與折扣資料有誤，暫無可用題目。');
          answers.push('本題資料需調整為可整數計算且有正利潤。');
          continue;
        }
        const pick = validTemplates[cycle % validTemplates.length];
        const cost = pick.cost;
        const markup = pick.markup;
        const discount = pick.discount;
        const sold = (((cost * (100 + markup)) / 100) * discount) / 10;
        const profit = sold - cost;
        questions.push(
          `某商品先按成本提高 ${markup}% 做為定價，再以定價的 ${discount} 折出售，結果獲利 ${profit} 元，求成本。`
        );
        answers.push(
          `設成本為 $x$ 元，則定價為 $\\left(1+${markup / 100}\\right)x$，售價為 $${discount / 10}\\left(1+${markup / 100}\\right)x$。依題意：$${discount / 10}\\left(1+${markup / 100}\\right)x-x=${profit}$，解得 $x=${cost}$。`
        );
        continue;
      }

      const templates = [
        { student: 180, diff: 120, stuCount: 2, fullCount: 3 },
        { student: 240, diff: 150, stuCount: 3, fullCount: 2 },
        { student: 300, diff: 180, stuCount: 4, fullCount: 2 },
        { student: 360, diff: 120, stuCount: 2, fullCount: 4 },
        { student: 210, diff: 90, stuCount: 5, fullCount: 2 },
        { student: 280, diff: 140, stuCount: 3, fullCount: 3 },
        { student: 320, diff: 160, stuCount: 4, fullCount: 3 },
      ];
      const pick = templates[cycle % templates.length];
      const student = pick.student;
      const diff = pick.diff;
      const full = student + diff;
      const stuCount = pick.stuCount;
      const fullCount = pick.fullCount;
      const total = student * stuCount + full * fullCount;
      questions.push(
        `買 ${stuCount} 張學生票與 ${fullCount} 張全票共付 ${total} 元，已知全票每張比學生票貴 ${diff} 元，求學生票與全票各是多少元。`
      );
      answers.push(
        `設學生票每張 $x$ 元，則全票每張為 $x+${diff}$ 元。依題意：$${stuCount}x+${fullCount}(x+${diff})=${total}$。解得 $x=${student}$，所以全票是 ${full} 元。`
      );
    }

    return { questions, answers };
  }

  function buildAllocationApplicationSet(count) {
    const questions = [];
    const answers = [];
    const dormTemplates = [
      { rooms: 12, peoplePerRoom1: 5, unplaced: 10, peoplePerRoom2: 8, emptyRooms: 1, students: 65 },
      { rooms: 9, peoplePerRoom1: 4, unplaced: 12, peoplePerRoom2: 6, emptyRooms: 1, students: 48 },
      { rooms: 15, peoplePerRoom1: 6, unplaced: 8, peoplePerRoom2: 9, emptyRooms: 1, students: 92 },
      { rooms: 14, peoplePerRoom1: 5, unplaced: 9, peoplePerRoom2: 7, emptyRooms: 1, students: 74 },
      { rooms: 11, peoplePerRoom1: 4, unplaced: 7, peoplePerRoom2: 6, emptyRooms: 1, students: 60 },
      { rooms: 16, peoplePerRoom1: 6, unplaced: 10, peoplePerRoom2: 10, emptyRooms: 1, students: 150 },
    ];
    const classTemplates = [
      { classes: 7, studentsPerClass1: 24, extra: 10, studentsPerClass2: 27, short: 11, total: 178 },
      { classes: 10, studentsPerClass1: 25, extra: 13, studentsPerClass2: 27, short: 7, total: 263 },
      { classes: 8, studentsPerClass1: 26, extra: 9, studentsPerClass2: 29, short: 15, total: 217 },
      { classes: 9, studentsPerClass1: 28, extra: 8, studentsPerClass2: 31, short: 19, total: 260 },
      { classes: 11, studentsPerClass1: 23, extra: 12, studentsPerClass2: 26, short: 21, total: 265 },
      { classes: 12, studentsPerClass1: 24, extra: 14, studentsPerClass2: 28, short: 34, total: 302 },
    ];
    const candyTemplates = [
      { kids: 10, give1: 8, remain: 7, give2: 10, short: 13, total: 87 },
      { kids: 9, give1: 6, remain: 12, give2: 8, short: 6, total: 66 },
      { kids: 12, give1: 7, remain: 9, give2: 9, short: 15, total: 93 },
      { kids: 14, give1: 5, remain: 8, give2: 6, short: 6, total: 78 },
      { kids: 11, give1: 9, remain: 5, give2: 11, short: 17, total: 104 },
      { kids: 13, give1: 6, remain: 11, give2: 8, short: 15, total: 89 },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const t = dormTemplates[cycle % dormTemplates.length];
        questions.push(
          `學生分配宿舍：若每房住 ${t.peoplePerRoom1} 人，則還有 ${t.unplaced} 人沒得住；若每房住 ${t.peoplePerRoom2} 人，則會空出 1 間房，求宿舍間數與學生總數。`
        );
        answers.push(
          `設宿舍有 $x$ 間，學生有 $y$ 人。依題意可列聯立方程式 $${formatSystemLatex(`y=${t.peoplePerRoom1}x+${t.unplaced}`, `y=${t.peoplePerRoom2}(x-1)`)}$。解得 $x=${t.rooms},\\ y=${t.students}$，所以有 ${t.rooms} 間宿舍、${t.students} 位學生。`
        );
        continue;
      }

      if (variant === 1) {
        const t = classTemplates[cycle % classTemplates.length];
        questions.push(
          `分班問題：班級數固定。若每班 ${t.studentsPerClass1} 人，則多出 ${t.extra} 人；若每班 ${t.studentsPerClass2} 人，則不足 ${t.short} 人，求班級數與總人數。`
        );
        answers.push(
          `設班級數為 $x$ 班，總人數為 $y$ 人。依題意可列聯立方程式 $${formatSystemLatex(`y=${t.studentsPerClass1}x+${t.extra}`, `y=${t.studentsPerClass2}x-${t.short}`)}$。解得 $x=${t.classes},\\ y=${t.total}$，所以有 ${t.classes} 班、${t.total} 人。`
        );
        continue;
      }

      const t = candyTemplates[cycle % candyTemplates.length];
      questions.push(
        `分配問題：把一袋糖果分給小朋友，若每人分 ${t.give1} 顆則剩下 ${t.remain} 顆；若每人分 ${t.give2} 顆則不足 ${t.short} 顆，求小朋友有幾人、糖果共有幾顆。`
      );
      answers.push(
        `設小朋友有 $x$ 人，糖果共有 $y$ 顆。依題意可列聯立方程式 $${formatSystemLatex(`y=${t.give1}x+${t.remain}`, `y=${t.give2}x-${t.short}`)}$。解得 $x=${t.kids},\\ y=${t.total}$，所以有 ${t.kids} 位小朋友、${t.total} 顆糖果。`
      );
    }

    return { questions, answers };
  }

  function buildAgeApplicationSet(count) {
    const questions = [];
    const answers = [];
    const ratioAfterTemplates = [
      { child: 9, father: 36, afterYears: 3 },
      { child: 11, father: 44, afterYears: 4 },
      { child: 13, father: 52, afterYears: 5 },
      { child: 8, father: 32, afterYears: 6 },
      { child: 10, father: 40, afterYears: 2 },
      { child: 12, father: 48, afterYears: 4 },
    ];
    const sumRatioTemplates = [
      { child: 12, father: 36, total: 48 },
      { child: 14, father: 42, total: 56 },
      { child: 15, father: 45, total: 60 },
      { child: 16, father: 48, total: 64 },
      { child: 18, father: 54, total: 72 },
      { child: 20, father: 60, total: 80 },
    ];
    const phraseTemplates = [
      { student: 25, teacher: 45 },
      { student: 24, teacher: 42 },
      { student: 28, teacher: 50 },
      { student: 18, teacher: 30 },
      { student: 22, teacher: 38 },
      { student: 30, teacher: 54 },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);
      if (variant === 0) {
        const t = ratioAfterTemplates[cycle % ratioAfterTemplates.length];
        questions.push(
          `年齡追蹤問題：父親現在年齡是兒子的 4 倍，${t.afterYears} 年後兩人的年齡和為 ${t.child + t.father + 2 * t.afterYears} 歲，求父子現在各幾歲。`
        );
        answers.push(
          `設兒子現在 $x$ 歲，父親現在 $y$ 歲。依題意可列聯立方程式 $${formatSystemLatex(`y=4x`, `(x+${t.afterYears})+(y+${t.afterYears})=${t.child + t.father + 2 * t.afterYears}`)}$。解得 $x=${t.child},\\ y=${t.father}$，所以兒子 ${t.child} 歲、父親 ${t.father} 歲。`
        );
      } else if (variant === 1) {
        const t = sumRatioTemplates[cycle % sumRatioTemplates.length];
        questions.push(`年齡推算問題：已知父子年齡和為 ${t.total} 歲，且父親年齡為兒子的 3 倍，求兩人各幾歲。`);
        answers.push(
          `設兒子現在 $x$ 歲，父親現在 $y$ 歲。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${t.total}`, `y=3x`)}$。解得 $x=${t.child},\\ y=${t.father}$，所以兒子 ${t.child} 歲、父親 ${t.father} 歲。`
        );
      } else {
        const t = phraseTemplates[cycle % phraseTemplates.length];
        const phrasePast = 2 * t.student - t.teacher;
        const phraseFuture = 2 * t.teacher - t.student;
        questions.push(
          `年齡追蹤問題：老師對學生說：「我在你這個年紀時，你只有 ${phrasePast} 歲；等你到我現在這個年紀時，我就 ${phraseFuture} 歲了。」求老師與學生現在各幾歲。`
        );
        answers.push(
          `設學生現在 $x$ 歲，老師現在 $y$ 歲。由「我在你這個年紀時，你只有 ${phrasePast} 歲」得 $x-(y-x)=${phrasePast}$，即 $2x-y=${phrasePast}$。由「你到我現在年紀時，我就 ${phraseFuture} 歲」得 $y+(y-x)=${phraseFuture}$，即 $2y-x=${phraseFuture}$。聯立解得 $x=${t.student},\\ y=${t.teacher}$，所以學生 ${t.student} 歲、老師 ${t.teacher} 歲。`
        );
      }
    }

    return { questions, answers };
  }

  function buildSpeedApplicationSet(count) {
    const questions = [];
    const answers = [];
    const mountainTemplates = [
      { upSpeed: 2, downSpeed: 5, totalHours: 28, distance: 40 },
      { upSpeed: 2, downSpeed: 4, totalHours: 12, distance: 16 },
      { upSpeed: 3, downSpeed: 6, totalHours: 15, distance: 30 },
      { upSpeed: 4, downSpeed: 8, totalHours: 18, distance: 48 },
      { upSpeed: 5, downSpeed: 10, totalHours: 21, distance: 70 },
      { upSpeed: 3, downSpeed: 5, totalHours: 16, distance: 30 },
    ];
    const cityVillageTemplates = [
      { totalDistance: 410, totalHours: 7, countrySpeed: 80, citySpeed: 30, countryDistance: 320 },
      { totalDistance: 400, totalHours: 6, countrySpeed: 80, citySpeed: 40, countryDistance: 320 },
      { totalDistance: 420, totalHours: 7, countrySpeed: 90, citySpeed: 30, countryDistance: 360 },
      { totalDistance: 450, totalHours: 8, countrySpeed: 75, citySpeed: 30, countryDistance: 300 },
      { totalDistance: 390, totalHours: 6, countrySpeed: 70, citySpeed: 35, countryDistance: 280 },
      { totalDistance: 360, totalHours: 6, countrySpeed: 60, citySpeed: 30, countryDistance: 240 },
    ];
    const numberLineTemplates = [
      { aStart: -25, bStart: 5, aStep: 1, bStep: 4, jumps: 4 },
      { aStart: -17, bStart: 5, aStep: 1, bStep: 3, jumps: 3 },
      { aStart: -21, bStart: 3, aStep: 2, bStep: 5, jumps: 3 },
      { aStart: -31, bStart: 7, aStep: 2, bStep: 6, jumps: 3 },
      { aStart: -29, bStart: 5, aStep: 3, bStep: 8, jumps: 2 },
      { aStart: -19, bStart: 1, aStep: 2, bStep: 7, jumps: 2 },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const t = mountainTemplates[cycle % mountainTemplates.length];
        questions.push(
          `某人沿相同路線上山與下山，上山時速 ${t.upSpeed} 公里，下山時速 ${t.downSpeed} 公里，共花 ${t.totalHours} 小時，求單程山路長度。`
        );
        answers.push(
          `設單程山路長 $x$ 公里，則上山時間為 $\\frac{x}{${t.upSpeed}}$ 小時，下山時間為 $\\frac{x}{${t.downSpeed}}$ 小時。依題意：$\\frac{x}{${t.upSpeed}}+\\frac{x}{${t.downSpeed}}=${t.totalHours}$，解得 $x=${t.distance}$。`
        );
        continue;
      }

      if (variant === 1) {
        const t = cityVillageTemplates[cycle % cityVillageTemplates.length];
        questions.push(
          `某人騎車全程 ${t.totalDistance} 公里共花 ${t.totalHours} 小時，在鄉村時速 ${t.countrySpeed} 公里，在市區時速 ${t.citySpeed} 公里，求行經鄉村多少公里。`
        );
        answers.push(
          `設行經鄉村 $x$ 公里，則市區是 ${t.totalDistance}-x 公里。依題意：$\\frac{x}{${t.countrySpeed}}+\\frac{${t.totalDistance}-x}{${t.citySpeed}}=${t.totalHours}$，解得 $x=${t.countryDistance}$。`
        );
        continue;
      }

      const t = numberLineTemplates[cycle % numberLineTemplates.length];
      questions.push(
        `兩點在數線上，A 在 ${t.aStart}，B 在 ${t.bStart}。若 A 每次向右跳 ${t.aStep} 單位，B 每次向右跳 ${t.bStep} 單位，跳了幾次後兩者座標互為相反數？`
      );
      answers.push(
        `設跳了 $x$ 次，則 A 在 ${t.aStart}+${t.aStep}x，B 在 ${t.bStart}+${t.bStep}x。互為相反數表示：$${t.aStart}+${t.aStep}x=-(${t.bStart}+${t.bStep}x)$，解得 $x=${t.jumps}$。`
      );
    }

    return { questions, answers };
  }

  function buildHeadsCoinsApplicationSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const rabbits = randInt(4, 12);
        const chickens = randInt(6, 18);
        const heads = rabbits + chickens;
        const legs = rabbits * 4 + chickens * 2;
        questions.push(`雞兔同籠：頭共 ${heads} 個，腳共 ${legs} 隻，求雞和兔各有多少隻。`);
        answers.push(
          `設兔有 $x$ 隻，則雞有 $${heads}-x$ 隻。依題意：$4x+2(${heads}-x)=${legs}$，解得 $x=${rabbits}$。所以兔 ${rabbits} 隻，雞 ${chickens} 隻。`
        );
        continue;
      }

      if (variant === 1) {
        const five = randInt(8, 20);
        const ten = randInt(8, 20);
        const totalCount = five + ten;
        const totalValue = five * 5 + ten * 10;
        questions.push(`硬幣問題：5 元和 10 元硬幣共 ${totalCount} 枚，總值 ${totalValue} 元，求兩種硬幣各有多少枚。`);
        answers.push(
          `設 10 元硬幣有 $x$ 枚，則 5 元硬幣有 $${totalCount}-x$ 枚。依題意：$10x+5(${totalCount}-x)=${totalValue}$，解得 $x=${ten}$。所以 10 元有 ${ten} 枚，5 元有 ${five} 枚。`
        );
        continue;
      }

      const fifty = randInt(4, 12);
      const ten = 3 * fifty;
      const diffValue = fifty * 50 - ten * 10;
      questions.push(
        `硬幣關係：10 元硬幣個數是 50 元硬幣的 3 倍，且 50 元總金額比 10 元總金額多 ${diffValue} 元，求兩種硬幣各有多少枚。`
      );
      answers.push(
        `設 50 元硬幣有 $x$ 枚，則 10 元硬幣有 $3x$ 枚。依題意：$50x-10(3x)=${diffValue}$，解得 $x=${fifty}$。所以 50 元有 ${fifty} 枚，10 元有 ${ten} 枚。`
      );
    }

    return { questions, answers };
  }

  function buildJ133WorkRateSet(count) {
    const questions = [];
    const answers = [];
    const cooperateThenSoloTemplates = [
      { a: 20, b: 25, remainSoloDays: 2, togetherDays: 10, who: '甲', unit: '天', thing: '一項工程' },
      { a: 24, b: 30, remainSoloDays: 3, togetherDays: 12, who: '甲', unit: '天', thing: '一段圍牆' },
      { a: 18, b: 24, remainSoloDays: 2, togetherDays: 8, who: '乙', unit: '天', thing: '一份設計圖' },
      { a: 16, b: 20, remainSoloDays: 2, togetherDays: 6, who: '甲', unit: '天', thing: '一片農地' },
      { a: 15, b: 18, remainSoloDays: 3, togetherDays: 5, who: '乙', unit: '天', thing: '一份企畫書' },
      { a: 30, b: 20, remainSoloDays: 1, togetherDays: 6, who: '甲', unit: '天', thing: '一批零件' },
    ];
    const typingThenSoloTemplates = [
      { a: 50, b: 40, togetherHours: 24, soloLeftHours: 14, who: '阿南', unit: '小時', thing: '一份文件' },
      { a: 60, b: 45, togetherHours: 18, soloLeftHours: 12, who: '阿宏', unit: '小時', thing: '一份報表' },
      { a: 48, b: 36, togetherHours: 16, soloLeftHours: 10, who: '小芸', unit: '小時', thing: '一份稿件' },
      { a: 40, b: 30, togetherHours: 15, soloLeftHours: 10, who: '小凱', unit: '小時', thing: '一份企劃案' },
      { a: 36, b: 24, togetherHours: 12, soloLeftHours: 8, who: '小安', unit: '小時', thing: '一份測驗卷' },
      { a: 54, b: 27, togetherHours: 16, soloLeftHours: 12, who: '小潔', unit: '小時', thing: '一份海報' },
    ];
    const fillPoolTemplates = [
      { a: 10, b: 15, togetherHours: 6, thing: '一座空池' },
      { a: 12, b: 12, togetherHours: 6, thing: '一座空池' },
      { a: 15, b: 30, togetherHours: 10, thing: '一座空池', isFill: true },
      { a: 18, b: 9, togetherHours: 6, thing: '一個水塔' },
      { a: 20, b: 30, togetherHours: 12, thing: '一座蓄水池' },
      { a: 24, b: 12, togetherHours: 8, thing: '一個消防水箱' },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const t = cooperateThenSoloTemplates[cycle % cooperateThenSoloTemplates.length];
        questions.push(
          `${t.thing}，甲單獨做 ${t.a}${t.unit} 可完成，乙單獨做 ${t.b}${t.unit} 可完成，兩人合作若干天後，剩下的由甲單獨做 ${t.remainSoloDays}${t.unit} 完工，求兩人合作了幾天？`
        );
        answers.push(
          `設兩人合作了 $x$ ${t.unit}。依題意可列式：$\\left(\\frac{1}{${t.a}}+\\frac{1}{${t.b}}\\right)x+\\frac{${t.remainSoloDays}}{${t.a}}=1$。解得 $x=${t.togetherDays}$，所以兩人合作了 ${t.togetherDays}${t.unit}。`
        );
        continue;
      }

      if (variant === 1) {
        const t = typingThenSoloTemplates[cycle % typingThenSoloTemplates.length];
        questions.push(
          `${t.thing}，阿南單獨打字要 ${t.a}${t.unit} 完成，小蘭單獨打字要 ${t.b}${t.unit} 完成，兩人合作打了 ${t.togetherHours}${t.unit} 後小蘭離開，阿南還要幾${t.unit}才做得完？`
        );
        answers.push(
          `設阿南還要 $x$ ${t.unit}。依題意可列式：$\\left(\\frac{1}{${t.a}}+\\frac{1}{${t.b}}\\right)\\times ${t.togetherHours}+\\frac{x}{${t.a}}=1$。解得 $x=${t.soloLeftHours}$，所以阿南還要 ${t.soloLeftHours}${t.unit}。`
        );
        continue;
      }

      const t = fillPoolTemplates[cycle % fillPoolTemplates.length];
      questions.push(
        `A 管單獨注水 ${t.a} 小時可把空池注滿，B 管單獨注水 ${t.b} 小時可把空池注滿，兩管同時開放幾小時可將空池注滿？`
      );
      answers.push(
        `設同時開放 $x$ 小時可注滿。依題意可列式：$\\left(\\frac{1}{${t.a}}+\\frac{1}{${t.b}}\\right)x=1$。解得 $x=${t.togetherHours}$，所以需 ${t.togetherHours} 小時。`
      );
    }

    return { questions, answers };
  }

  function buildJ133FractionRemainderSet(count) {
    const questions = [];
    const answers = [];
    const cashTemplates = [
      {
        spent: 15,
        fracNum: 1,
        fracDen: 4,
        finalRemain: 60,
        original: 100,
        thing: '零用錢',
        action1: '去超商買汽水花 15 元',
        action2: '再用原有錢的 1/4 買餅乾',
      },
      {
        spent: 24,
        fracNum: 1,
        fracDen: 5,
        finalRemain: 72,
        original: 120,
        thing: '零用錢',
        action1: '先買文具花 24 元',
        action2: '再用原有錢的 1/5 買點心',
      },
      {
        spent: 18,
        fracNum: 1,
        fracDen: 3,
        finalRemain: 54,
        original: 108,
        thing: '零用錢',
        action1: '先買早餐花 18 元',
        action2: '再用原有錢的 1/3 買書套',
      },
      {
        spent: 30,
        fracNum: 1,
        fracDen: 6,
        finalRemain: 90,
        original: 144,
        thing: '零用錢',
        action1: '先買球鞋花 30 元',
        action2: '再用原有錢的 1/6 買飲料',
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);
      if (variant === 0) {
        const t = cashTemplates[cycle % cashTemplates.length];
        questions.push(`丁丁去超商，${t.action1}，${t.action2}，最後剩 ${t.finalRemain} 元，求原有${t.thing}多少元。`);
        answers.push(
          `設原有${t.thing}為 $x$ 元。依題意可列式：$x-${t.spent}-\\frac{${t.fracNum}}{${t.fracDen}}x=${t.finalRemain}$。解得 $x=${t.original}$，所以原有${t.thing} ${t.original} 元。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { original: 240, remain: 120, a: 4, b: 5, c: 6 },
          { original: 300, remain: 150, a: 4, b: 5, c: 6 },
          { original: 360, remain: 180, a: 4, b: 5, c: 6 },
          { original: 280, remain: 140, a: 4, b: 5, c: 6 },
        ];
        const pick = templates[cycle % templates.length];
        const original = pick.original;
        const remain = pick.remain;
        questions.push(
          `大博讀一本小說，第一天看全部的 $\\frac{1}{4}$，第二天看剩下的 $\\frac{1}{5}$，第三天看剩下的 $\\frac{1}{6}$，最後剩 ${remain} 頁，求小說原有幾頁？`
        );
        answers.push(
          `設小說原有 $x$ 頁。依題意可列式：$x\\left(1-\\frac{1}{4}\\right)\\left(1-\\frac{1}{5}\\right)\\left(1-\\frac{1}{6}\\right)=${remain}$。解得 $x=${original}$，所以小說原有 ${original} 頁。`
        );
        continue;
      }

      const templates = [
        { original: 140, remain: 28, a: 3, b: 10, bNum: 7 },
        { original: 175, remain: 35, a: 3, b: 10, bNum: 7 },
        { original: 210, remain: 42, a: 3, b: 10, bNum: 7 },
        { original: 245, remain: 49, a: 3, b: 10, bNum: 7 },
      ];
      const pick = templates[cycle % templates.length];
      const original = pick.original;
      const remain = pick.remain;
      questions.push(
        `一桶水先倒掉 $\\frac{1}{3}$，再倒掉剩下的 $\\frac{7}{10}$，最後剩下 ${remain} 公升，求此桶水原有多少公升？`
      );
      answers.push(
        `設原有水量為 $x$ 公升。依題意可列式：$x\\left(1-\\frac{1}{3}\\right)\\left(1-\\frac{7}{10}\\right)=${remain}$。解得 $x=${original}$，所以原有 ${original} 公升。`
      );
    }

    return { questions, answers };
  }

  function buildJ133ScorePenaltySet(count) {
    const questions = [];
    const answers = [];
    const partialAnswerTemplates = [
      { total: 20, answered: 18, plus: 5, minus: 2, correct: 15, name: '小鈴' },
      { total: 24, answered: 22, plus: 4, minus: 1, correct: 19, name: '小安' },
      { total: 30, answered: 27, plus: 3, minus: 1, correct: 21, name: '小傑' },
      { total: 25, answered: 23, plus: 4, minus: 2, correct: 17, name: '小萱' },
      { total: 18, answered: 16, plus: 5, minus: 2, correct: 13, name: '小晴' },
      { total: 28, answered: 25, plus: 3, minus: 1, correct: 20, name: '小凱' },
    ];
    const askWrongTemplates = [
      { total: 25, plus: 4, minus: 1, wrong: 7, name: '小立' },
      { total: 20, plus: 5, minus: 1, wrong: 4, name: '小華' },
      { total: 30, plus: 3, minus: 1, wrong: 7, name: '小凱' },
      { total: 24, plus: 4, minus: 2, wrong: 5, name: '小恩' },
      { total: 18, plus: 5, minus: 2, wrong: 3, name: '小芸' },
      { total: 26, plus: 3, minus: 1, wrong: 6, name: '小豪' },
    ];
    const askCorrectTemplates = [
      { total: 20, plus: 5, minus: 1, correct: 16, name: '小華' },
      { total: 18, plus: 5, minus: 2, correct: 12, name: '小芸' },
      { total: 24, plus: 4, minus: 1, correct: 19, name: '小安' },
      { total: 25, plus: 4, minus: 2, correct: 18, name: '小軒' },
      { total: 30, plus: 3, minus: 1, correct: 22, name: '小彤' },
      { total: 28, plus: 5, minus: 2, correct: 20, name: '小禹' },
    ];

    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const t = partialAnswerTemplates[Math.floor(i / 3) % partialAnswerTemplates.length];
        const wrong = t.answered - t.correct;
        const score = t.plus * t.correct - t.minus * wrong;
        questions.push(
          `數學競賽共 ${t.total} 題，答對 1 題得 ${t.plus} 分，答錯 1 題倒扣 ${t.minus} 分，不作答不計分。${t.name} 作答 ${t.answered} 題後得 ${score} 分，求他答對幾題。`
        );
        answers.push(
          `設答對 $x$ 題，則答錯 ${t.answered}-x 題。依題意可列式：$${t.plus}x-${t.minus}(${t.answered}-x)=${score}$。解得 $x=${t.correct}$，所以他答對 ${t.correct} 題。`
        );
      } else if (i % 3 === 1) {
        const t = askWrongTemplates[Math.floor(i / 3) % askWrongTemplates.length];
        const correct = t.total - t.wrong;
        const score = t.plus * correct - t.minus * t.wrong;
        questions.push(`入學測驗共 ${t.total} 題，答對得 ${t.plus} 分，答錯扣 ${t.minus} 分。${t.name} 全部作答後得 ${score} 分，求他答錯幾題。`);
        answers.push(
          `設答錯 $x$ 題，則答對 ${t.total}-x 題。依題意可列式：$${t.plus}(${t.total}-x)-${t.minus}x=${score}$。解得 $x=${t.wrong}$，所以他答錯 ${t.wrong} 題。`
        );
      } else {
        const t = askCorrectTemplates[Math.floor(i / 3) % askCorrectTemplates.length];
        const wrong = t.total - t.correct;
        const score = t.plus * t.correct - t.minus * wrong;
        questions.push(
          `${t.name} 參加段考共 ${t.total} 題，答對得 ${t.plus} 分，答錯扣 ${t.minus} 分，全部作答後共得 ${score} 分，求他答對幾題？`
        );
        answers.push(
          `設答對 $x$ 題，則答錯 ${t.total}-x 題。依題意可列式：$${t.plus}x-${t.minus}(${t.total}-x)=${score}$。解得 $x=${t.correct}$，所以他答對 ${t.correct} 題。`
        );
      }
    }

    return { questions, answers };
  }

  function buildJ133MixtureSet(count) {
    const questions = [];
    const answers = [];
    const saltTemplates = [
      { lowP: 5, lowW: 200, highP: 8, x: 300, target: 6.8 },
      { lowP: 10, lowW: 240, highP: 25, x: 160, target: 16 },
      { lowP: 6, lowW: 180, highP: 12, x: 220, target: 9.3 },
      { lowP: 8, lowW: 150, highP: 20, x: 250, target: 15.5 },
      { lowP: 4, lowW: 300, highP: 10, x: 180, target: 6.25 },
      { lowP: 12, lowW: 200, highP: 18, x: 300, target: 15.6 },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);
      if (variant === 0) {
        const t = saltTemplates[cycle % saltTemplates.length];
        const lowDecimal = (t.lowP / 100).toString();
        const highDecimal = (t.highP / 100).toString();
        const targetDecimal = (t.target / 100).toString();
        questions.push(
          `有兩種食鹽水，${t.lowP}% 的有 ${t.lowW} 克，${t.highP}% 的有 $x$ 克，混合後的濃度為 ${t.target}% ，求 $x$。`
        );
        answers.push(
          `依題意可列式：$${lowDecimal}\\times ${t.lowW}+${highDecimal}x=${targetDecimal}\\times (${t.lowW}+x)$。解得 $x=${t.x}$。`
        );
        continue;
      }

      if (variant === 1) {
        const total = 14;
        const aAmount = 8;
        const alcoholTotal = 11;
        questions.push(
          `甲、乙兩種酒精水混合，甲液酒精比水為 3:1，乙液酒精比水為 5:1。若要配成總共 ${total} 公升，且其中酒精恰有 ${alcoholTotal} 公升的混合液，求甲液需要幾公升？`
        );
        answers.push(
          `設甲液取 $x$ 公升，則乙液取 ${total}-x 公升。依題意可列式：$\\frac{3}{4}x+\\frac{5}{6}(${total}-x)=${alcoholTotal}$。解得 $x=${aAmount}$，所以甲液需要 ${aAmount} 公升。`
        );
        continue;
      }

      const totalWeight = 148;
      const silver = 70;
      const totalLoss = 12;
      questions.push(
        `148 公斤的銅銀合金放入水中，銀會減輕原重量的 $\\frac{1}{21}$，銅會減輕原重量的 $\\frac{1}{9}$。若總共減輕 ${totalLoss} 公斤，求原來銀有多少公斤。`
      );
      answers.push(
        `設原來銀有 $x$ 公斤，則銅有 ${totalWeight}-x 公斤。依題意可列式：$\\frac{x}{21}+\\frac{${totalWeight}-x}{9}=${totalLoss}$。解得 $x=${silver}$，所以原來銀有 ${silver} 公斤。`
      );
    }

    return { questions, answers };
  }

  function buildJ133TieredFeeSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const cycle = Math.floor(i / 4);

      if (variant === 0) {
        const templates = [
          { base: 50, fee: 3, freeMinutes: 47, m1: 100, c1: 209, m2: 130, c2: 299 },
          { base: 40, fee: 2, freeMinutes: 35, m1: 90, c1: 150, m2: 130, c2: 230 },
          { base: 60, fee: 4, freeMinutes: 52, m1: 110, c1: 292, m2: 150, c2: 452 },
          { base: 30, fee: 5, freeMinutes: 28, m1: 80, c1: 290, m2: 100, c2: 390 },
        ];
        const t = templates[cycle % templates.length];
        const base = t.base;
        const fee = t.fee;
        const freeMinutes = t.freeMinutes;
        questions.push(
          `某網咖的基本費用為 ${base} 元（可使用 $t$ 分鐘），超過 $t$ 分鐘後，超過的部分每分鐘收費 $s$ 元。已知小賢第一次上網 ${t.m1} 分鐘花了 ${t.c1} 元，第二次上網 ${t.m2} 分鐘花了 ${t.c2} 元，求 $t$ 與 $s$ 之值。`
        );
        answers.push(
          `依題意可列聯立方程式 $${formatSystemLatex(`${base}+s(${t.m1}-t)=${t.c1}`, `${base}+s(${t.m2}-t)=${t.c2}`)}$。相減得 $${t.m2 - t.m1}s=${t.c2 - t.c1}$，所以 $s=${fee}$。代回得 $${base}+${fee}(${t.m1}-t)=${t.c1}$，解得 $t=${freeMinutes}$。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { base: 28, rate: 0.02, sec1: 500, fee1: 32, sec2: 1200, fee2: 46, threshold: 300 },
          { base: 20, rate: 0.03, sec1: 400, fee1: 23, sec2: 1000, fee2: 41, threshold: 300 },
          { base: 25, rate: 0.01, sec1: 600, fee1: 28, sec2: 1600, fee2: 38, threshold: 300 },
          { base: 30, rate: 0.02, sec1: 700, fee1: 38, sec2: 1400, fee2: 52, threshold: 300 },
        ];
        const t = templates[cycle % templates.length];
        const base = t.base;
        const rate = t.rate;
        questions.push(
          `某電信公司的通話費計算方式為：通話時間未超過 ${t.threshold} 秒收基本費 $b$ 元；超過 ${t.threshold} 秒之後的費用與超過時間成線型關係。已知通話 ${t.sec1} 秒時花費 ${t.fee1} 元，通話 ${t.sec2} 秒時花費 ${t.fee2} 元，求基本費 $b$ 是多少元。`
        );
        answers.push(
          `設超過 ${t.threshold} 秒後每秒加收 $k$ 元，則依題意可列聯立方程式 $${formatSystemLatex(`b+k(${t.sec1}-${t.threshold})=${t.fee1}`, `b+k(${t.sec2}-${t.threshold})=${t.fee2}`)}$。相減得 ${t.sec2 - t.sec1}k=${t.fee2 - t.fee1}，所以 $k=${rate}$。代回得 $b+${t.sec1 - t.threshold}\\times ${rate}=${t.fee1}$，解得 $b=${base}$。`
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { freeKg: 18, rate: 12, w1: 30, f1: 144, w2: 42, f2: 288 },
          { freeKg: 20, rate: 10, w1: 35, f1: 150, w2: 50, f2: 300 },
          { freeKg: 15, rate: 8, w1: 28, f1: 104, w2: 40, f2: 200 },
          { freeKg: 22, rate: 15, w1: 34, f1: 180, w2: 46, f2: 360 },
        ];
        const t = templates[cycle % templates.length];
        const freeKg = t.freeKg;
        const rate = t.rate;
        questions.push(
          `某航空公司規定旅客行李 $a$ 公斤以下免費，超過 $a$ 公斤的部分，超重重量與託運費成線型關係。已知行李重 ${t.w1} 公斤時需付 ${t.f1} 元，重 ${t.w2} 公斤時需付 ${t.f2} 元，求免費額度 $a$ 為多少公斤？`
        );
        answers.push(
          `設超重每公斤收 $k$ 元，則依題意可列聯立方程式 $${formatSystemLatex(`k(${t.w1}-a)=${t.f1}`, `k(${t.w2}-a)=${t.f2}`)}$。相減可得 $${t.w2 - t.w1}k=${t.f2 - t.f1}$，所以 $k=${rate}$。代回得 $${rate}(${t.w1}-a)=${t.f1}$，解得 $a=${freeKg}$。`
        );
        continue;
      }

      questions.push(
        `某網咖消費項目如下：飲料（基本消費）30 元，一小時內（基本消費）$x$ 元，一小時後每分鐘加 $y$ 元。若佳佳上網 2 小時花了 100 元，明力上網 3 小時 20 分鐘共花了 140 元，求 $x$ 與 $y$。`
      );
      answers.push(
        `依題意可列聯立方程式 $${formatSystemLatex(`30+x+60y=100`, `30+x+140y=140`)}$。相減得 $80y=40$，所以 $y=\\frac{1}{2}$。代回得 $30+x+60\\times\\frac{1}{2}=100$，解得 $x=40$。`
      );
    }

    return { questions, answers };
  }

  function buildJ133ClockAngleSet(count) {
    const questions = [];
    const answers = [];

    function minuteLatex(frac) {
      return fractionToLatex(frac, true);
    }

    function minuteDisplay(frac) {
      return `$${minuteLatex(frac)}$`;
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const hour = randInt(1, 5);
        const minute = randInt(6, 28);
        const angle = makeFraction(Math.abs(60 * hour - 11 * minute), 2);
        const overlapMinute = makeFraction(60 * hour, 11);
        const useBeforeOverlap = minute * overlapMinute.den <= overlapMinute.num;
        const branchEquation = useBeforeOverlap
          ? `$30\\times ${hour}-5.5x=${fractionToLatex(angle)}$`
          : `$5.5x-30\\times ${hour}=${fractionToLatex(angle)}$`;
        questions.push(`在 ${hour} 點 $x$ 分時，時針與分針夾角為 $${fractionToLatex(angle)}^\\circ$，求 $x$。`);
        answers.push(
          `分針每分轉 $6^\\circ$，時針每分轉 $0.5^\\circ$。在 ${hour} 點 $x$ 分時，兩針夾角可列為：$|30\\times ${hour}-5.5x|=${fractionToLatex(angle)}$。因為本題對應的時刻在 ${hour} 點後 ${minute} 分，所以可化成 ${branchEquation}。解得 $x=${minute}$。`
        );
        continue;
      }

      if (variant === 1) {
        const hour = randInt(1, 5);
        const minute = makeFraction(60 * hour + 360, 11);
        questions.push(`${hour} 點到 ${hour + 1} 點之間，時針與分針何時會成一直線（夾角 $180^\\circ$）？`);
        answers.push(
          `設經過 $x$ 分。分針每分比時針多轉 $6-0.5=5.5^\\circ$。在 ${hour} 點整時，兩針先差 $30\\times ${hour}= ${30 * hour}^\\circ$。要成一直線，需滿足 $|${30 * hour}-5.5x|=180$。在這一小時內可用 ${30 * hour}+180=5.5x，解得 $x=${minuteLatex(minute)}$ 分，所以答案是 ${hour} 點 ${minuteDisplay(minute)} 分。`
        );
        continue;
      }

      const firstMinute = randInt(5, 25);
      const angle = makeFraction(11 * firstMinute, 2);
      const secondMinute = makeFraction(720 - 11 * firstMinute, 11);
      const elapsed = subFraction(secondMinute, makeFraction(firstMinute, 1));
      questions.push(
        `12 點過後 ${firstMinute} 分時，分針與時針夾角為 $${fractionToLatex(angle)}^\\circ$。再經過多久，兩針會再次出現相同的夾角？`
      );
      answers.push(
        `12 點過後 ${firstMinute} 分時，夾角是 $5.5\\times ${firstMinute}=${fractionToLatex(angle)}^\\circ$。設從 12 點開始算，第二次出現同角度是在 $x$ 分時。此時另一側夾角滿足 $5.5x=360-${fractionToLatex(angle)}$，所以 $x=${minuteLatex(secondMinute)}$。因此從第一次到第二次經過 $${minuteLatex(secondMinute)}-${firstMinute}=${minuteLatex(elapsed)}$ 分，也就是 ${minuteDisplay(elapsed)} 分。`
      );
    }

    return { questions, answers };
  }

  function buildJ213MoneyTicketSet(count) {
    const questions = [];
    const answers = [];

    function isFriendlyPercent(frac) {
      const value = makeFraction(frac.num, frac.den);
      return [1, 2, 4, 5, 10, 20, 25, 50].includes(value.den);
    }

    function formatPercentLatex(frac) {
      const value = makeFraction(frac.num, frac.den);
      return value.den === 1 ? `${value.num}` : fractionToLatex(value, true);
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const wantFraction = randInt(0, 1) === 1;
        let low = 10;
        let high = 25;
        let lowWeight = 200;
        let highWeight = 100;
        let total = 300;
        let soluteTotal = 0;
        let target = makeFraction(0, 1);
        let tries = 0;

        while (tries < 80) {
          low = [10, 12, 15][randInt(0, 2)];
          high = [25, 30, 35][randInt(0, 2)];
          lowWeight = [150, 200, 250, 300][randInt(0, 3)];
          highWeight = [100, 150, 200, 250][randInt(0, 3)];
          total = lowWeight + highWeight;
          soluteTotal = low * lowWeight + high * highWeight;
          target = makeFraction(soluteTotal, total);
          if (!isFriendlyPercent(target)) {
            tries += 1;
            continue;
          }
          if (wantFraction && target.den === 1) {
            tries += 1;
            continue;
          }
          if (!wantFraction && target.den !== 1) {
            tries += 1;
            continue;
          }
          break;
        }

        questions.push(
          `將濃度 ${low}% 的食鹽水與濃度 ${high}% 的食鹽水混合，得到濃度 $${formatPercentLatex(target)}\\%$ 的食鹽水 ${total} 克，求原來兩種食鹽水各幾克。`
        );
        answers.push(
          `設濃度 ${low}% 的食鹽水有 $x$ 克，濃度 ${high}% 的食鹽水有 $y$ 克。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `${low}x+${high}y=${soluteTotal}`)}$。解得 $x=${lowWeight},\\ y=${highWeight}$，所以兩種食鹽水分別是 ${lowWeight} 克與 ${highWeight} 克。`
        );
        continue;
      }

      if (variant === 1) {
        const wantFraction = randInt(0, 1) === 1;
        let low = 20;
        let high = 80;
        let lowWeight = 100;
        let highWeight = 100;
        let total = 200;
        let soluteTotal = 0;
        let target = makeFraction(0, 1);
        let tries = 0;

        while (tries < 80) {
          low = [20, 30, 40][randInt(0, 2)];
          high = [70, 80, 90][randInt(0, 2)];
          lowWeight = [100, 150, 200, 250, 300][randInt(0, 4)];
          highWeight = [100, 150, 200, 250][randInt(0, 3)];
          total = lowWeight + highWeight;
          soluteTotal = low * lowWeight + high * highWeight;
          target = makeFraction(soluteTotal, total);
          if (!isFriendlyPercent(target)) {
            tries += 1;
            continue;
          }
          if (wantFraction && target.den === 1) {
            tries += 1;
            continue;
          }
          if (!wantFraction && target.den !== 1) {
            tries += 1;
            continue;
          }
          break;
        }

        questions.push(
          `實驗室要調配濃度 $${formatPercentLatex(target)}\\%$ 的酒精溶液 ${total} 克，已知有濃度 ${low}% 與濃度 ${high}% 的兩種酒精溶液，求兩種溶液各需要多少克。`
        );
        answers.push(
          `設濃度 ${low}% 的酒精溶液取 $x$ 克，濃度 ${high}% 的酒精溶液取 $y$ 克。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `${low}x+${high}y=${soluteTotal}`)}$。解得 $x=${lowWeight},\\ y=${highWeight}$，所以兩種酒精溶液分別需要 ${lowWeight} 克與 ${highWeight} 克。`
        );
        continue;
      }

      const ratios = [
        [1, 2],
        [2, 3],
        [3, 5],
      ];
      const [a, b] = ratios[randInt(0, ratios.length - 1)];
      const low = [10, 15, 20][randInt(0, 2)];
      const high = [25, 30, 35][randInt(0, 2)];
      const scale = [80, 100, 120][randInt(0, 2)];
      const xWeight = a * scale;
      const yWeight = b * scale;
      const total = xWeight + yWeight;
      const soluteTotal = low * xWeight + high * yWeight;
      const target = makeFraction(soluteTotal, total);
      questions.push(
        `甲、乙兩種糖水的濃度分別是 ${low}% 與 ${high}%，其重量比為 ${a}:${b}，兩種糖水共 ${total} 克。求甲、乙各幾克，並求混合後的重量百分濃度。`
      );
      answers.push(
        `設甲糖水有 $x$ 克，乙糖水有 $y$ 克。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `${b}x=${a}y`)}$。解得 $x=${xWeight},\\ y=${yWeight}$。混合後的糖水濃度為 $\\frac{${low}\\times${xWeight}+${high}\\times${yWeight}}{${total}}=${formatPercentLatex(target)}\\%$，所以混合後的重量百分濃度是 $${formatPercentLatex(target)}\\%$。`
      );
    }

    return { questions, answers };
  }

  function buildJ213HeadsCoinsScoreSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const remainFractions = [
          [1, 3],
          [1, 4],
          [1, 5],
        ];
        const [remainNum, remainDen] = remainFractions[randInt(0, remainFractions.length - 1)];
        const drinkNum = remainDen - remainNum;
        const bottle = [200, 250, 300, 350][randInt(0, 3)];
        const milkUnit = [180, 210, 240, 300][randInt(0, 3)];
        const milk = remainDen * milkUnit;
        const total = bottle + milk;
        const remainTotal = bottle + (milk * remainNum) / remainDen;
        questions.push(
          `一瓶鮮奶連瓶共重 ${total} 公克，喝掉 $${fractionToLatex(makeFraction(drinkNum, remainDen))}$ 的鮮奶後，連瓶共重 ${remainTotal} 公克，求瓶子與原來鮮奶各重多少公克。`
        );
        answers.push(
          `設瓶子重 $x$ 公克，原來鮮奶重 $y$ 公克。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `x+${fractionToLatex(makeFraction(remainNum, remainDen))}y=${remainTotal}`)}$。解得 $x=${bottle},\\ y=${milk}$，所以瓶子重 ${bottle} 公克，原來鮮奶重 ${milk} 公克。`
        );
        continue;
      }

      if (variant === 1) {
        const remainFractions = [
          [3, 4],
          [2, 3],
          [4, 5],
        ];
        const [remainNum, remainDen] = remainFractions[randInt(0, remainFractions.length - 1)];
        const drinkNum = remainDen - remainNum;
        const bottle = [250, 300, 350, 400][randInt(0, 3)];
        const drinkUnit = [180, 240, 300, 360][randInt(0, 3)];
        const drink = remainDen * drinkUnit;
        const total = bottle + drink;
        const remainTotal = bottle + (drink * remainNum) / remainDen;
        questions.push(
          `一瓶飲料連瓶共重 ${total} 公克，喝掉 $${fractionToLatex(makeFraction(drinkNum, remainDen))}$ 的飲料後，連瓶共重 ${remainTotal} 公克，求空瓶重與原來飲料重各多少公克。`
        );
        answers.push(
          `設空瓶重 $x$ 公克，原來飲料重 $y$ 公克。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `x+${fractionToLatex(makeFraction(remainNum, remainDen))}y=${remainTotal}`)}$。解得 $x=${bottle},\\ y=${drink}$，所以空瓶重 ${bottle} 公克，原來飲料重 ${drink} 公克。`
        );
        continue;
      }

      const den = [5, 6, 7][randInt(0, 2)];
      const unit = [25, 30, 35, 40][randInt(0, 3)];
      const cupB = den * unit;
      const cupA = (den - 2) * unit;
      const total = cupA + cupB;
      questions.push(
        `有甲、乙兩個相同杯子裝了不同量的水，兩杯共 ${total} 公克。若將乙杯的 $${fractionToLatex(makeFraction(1, den))}$ 倒入甲杯，兩杯水位就會一樣高，求甲、乙原來各有多少公克水。`
      );
      answers.push(
        `設甲杯原有 $x$ 公克水，乙杯原有 $y$ 公克水。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `x+${fractionToLatex(makeFraction(1, den))}y=${fractionToLatex(makeFraction(den - 1, den))}y`)}$。解得 $x=${cupA},\\ y=${cupB}$，所以甲杯原有 ${cupA} 公克，乙杯原有 ${cupB} 公克。`
      );
    }

    return { questions, answers };
  }

  function buildJ213DigitPlaceValueSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const tens = randInt(1, 7);
        const ones = randInt(1, 9);
        const digitSum = tens + ones;
        const original = 10 * tens + ones;
        const swapped = 10 * ones + tens;
        const diff = swapped - original;
        questions.push(
          `一個二位數的十位數字與個位數字和為 ${digitSum}，若將兩數字對調，新數比原數大 ${diff}，求原數。`
        );
        answers.push(
          `設十位數字為 $x$，個位數字為 $y$。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${digitSum}`, `10y+x=10x+y${diff >= 0 ? `+${diff}` : diff}`)}$。解得 $x=${tens},\\ y=${ones}$，所以原數是 ${original}。`
        );
        continue;
      }

      if (variant === 1) {
        const tens = randInt(1, 3);
        const ones = 3 * tens;
        const original = 10 * tens + ones;
        const newNumber = 100 * tens + 50 + ones;
        const diff = newNumber - original;
        questions.push(
          `某二位數的個位數字是十位數字的 3 倍，若在兩位數中間插入數字 5 變成三位數，新數比原數大 ${diff}，求原數。`
        );
        answers.push(
          `設十位數字為 $x$，個位數字為 $y$。依題意可列聯立方程式 $${formatSystemLatex(`y=3x`, `100x+50+y=10x+y+${diff}`)}$。解得 $x=${tens},\\ y=${ones}$，所以原數是 ${original}。`
        );
        continue;
      }

      const tens = randInt(1, 6);
      const ones = tens + 2;
      const original = 10 * tens + ones;
      const sumDigits = tens + ones;
      const extra = original - 4 * sumDigits;
      questions.push(`一個二位數，其個位數字比十位數字大 2，且原數是兩位數字和的 4 倍多 ${extra}，求此數。`);
      answers.push(
        `設十位數字為 $x$，個位數字為 $y$。依題意可列聯立方程式 $${formatSystemLatex(`y=x+2`, `10x+y=4(x+y)+${extra}`)}$。解得 $x=${tens},\\ y=${ones}$，所以原數是 ${original}。`
      );
    }

    return { questions, answers };
  }

  function buildJ213AgeChaseSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const totalQ = [18, 20, 25][randInt(0, 2)];
        const correct = randInt(Math.ceil(totalQ / 2), totalQ - 3);
        const wrong = totalQ - correct;
        const score = 5 * correct - 2 * wrong;
        questions.push(
          `某次測驗共 ${totalQ} 題，答對一題得 5 分，答錯一題扣 2 分。小明全部作答後共得 ${score} 分，求他答對幾題、答錯幾題。`
        );
        answers.push(
          `設答對 $x$ 題，答錯 $y$ 題。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${totalQ}`, `5x-2y=${score}`)}$。解得 $x=${correct},\\ y=${wrong}$，所以答對 ${correct} 題，答錯 ${wrong} 題。`
        );
        continue;
      }

      if (variant === 1) {
        const totalRounds = [18, 20, 24][randInt(0, 2)];
        const ties = [2, 4, 6][randInt(0, 2)];
        const wins = randInt(6, totalRounds - ties - 4);
        const losses = totalRounds - ties - wins;
        const totalPoints = 3 * wins + 2 * ties + losses;
        questions.push(
          `猜拳比賽共進行 ${totalRounds} 局，贏一局得 3 顆糖，平手得 2 顆，輸一局得 1 顆。已知平手 ${ties} 局，小智最後共得 ${totalPoints} 顆糖，求他贏幾局、輸幾局。`
        );
        answers.push(
          `設小智贏了 $x$ 局，輸了 $y$ 局。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${totalRounds - ties}`, `3x+y=${totalPoints - 2 * ties}`)}$。解得 $x=${wins},\\ y=${losses}$，所以小智贏了 ${wins} 局，輸了 ${losses} 局。`
        );
        continue;
      }

      const totalQ = [40, 50, 60][randInt(0, 2)];
      const blank = [4, 5, 6][randInt(0, 2)];
      const correct = randInt(20, totalQ - blank - 3);
      const wrong = totalQ - blank - correct;
      const score = 2 * correct - wrong;
      questions.push(
        `數學競賽共 ${totalQ} 題，答對一題得 2 分，答錯一題扣 1 分，沒作答不扣分。若小明有 ${blank} 題沒寫，最後得 ${score} 分，求他答對幾題、答錯幾題。`
      );
      answers.push(
        `設答對 $x$ 題，答錯 $y$ 題。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${totalQ - blank}`, `2x-y=${score}`)}$。解得 $x=${correct},\\ y=${wrong}$，所以答對 ${correct} 題，答錯 ${wrong} 題。`
      );
    }

    return { questions, answers };
  }

  function buildJ213SpeedChaseSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const turtle = [4, 5, 6, 8][randInt(0, 3)];
        const rabbit = turtle + [12, 15, 18, 20][randInt(0, 3)];
        const distance = (turtle + rabbit) * [8, 10, 12][randInt(0, 2)];
        const meetOpposite = distance / (turtle + rabbit);
        const catchSame = makeFraction(distance, rabbit - turtle);
        questions.push(
          `龜兔相距 ${distance} 公尺，相向而行 ${meetOpposite} 分鐘後相遇；若改為同向而行，則 $${fractionToLatex(catchSame, true)}$ 分鐘後小兔追上小龜，求兩者分速。`
        );
        answers.push(
          `設小龜分速為 $x$ 公尺，小兔分速為 $y$ 公尺。由題意可列聯立方程式 $${formatSystemLatex(`${meetOpposite}(x+y)=${distance}`, `${fractionToLatex(catchSame, true)}(y-x)=${distance}`)}$。化簡為 $${formatSystemLatex(`x+y=${distance / meetOpposite}`, `y-x=${fractionToLatex(divFraction(makeFraction(distance, 1), catchSame), true)}`)}$，解得 $x=${turtle},\\ y=${rabbit}$。`
        );
        continue;
      }

      if (variant === 1) {
        const boat = [18, 24, 30, 36][randInt(0, 3)];
        const current = [2, 3, 4, 5][randInt(0, 3)];
        const down = boat + current;
        const up = boat - current;
        questions.push(`船在河中航行，順流時速為 ${down} 公里，逆流時速為 ${up} 公里，求船速與水流速。`);
        answers.push(
          `設船在靜水中的速度為 $x$ 公里，水流速度為 $y$ 公里。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${down}`, `x-y=${up}`)}$。解得 $x=${boat},\\ y=${current}$，所以船速 ${boat} 公里、水流速 ${current} 公里。`
        );
        continue;
      }

      if (variant === 2) {
        const ratioList = [
          { num: 3, den: 2 },
          { num: 4, den: 3 },
          { num: 5, den: 4 },
          { num: 7, den: 5 },
        ];
        const ratio = ratioList[randInt(0, ratioList.length - 1)];
        const unit = [60, 75, 90, 105][randInt(0, 3)];
        const slow = ratio.den * unit;
        const fast = ratio.num * unit;
        const delta = fast - slow;
        const minutes = [1, 2, 3][randInt(0, 2)];
        const exceed = [20, 30, 40, 50, 60][randInt(0, 4)];
        const headStart = delta * minutes - exceed;
        if (headStart <= 0 || headStart > 240) {
          i -= 1;
          continue;
        }
        questions.push(
          `甲、乙兩人比賽跑步，甲速率是乙的 $${ratio.num}:${ratio.den}$，且甲每分鐘比乙快 ${delta} 公尺。若乙先跑 ${headStart} 公尺，甲再開始追，${minutes} 分鐘後甲超越乙 ${exceed} 公尺，求兩人速率。`
        );
        answers.push(
          `設甲的速率為 $x$ 公尺/分，乙的速率為 $y$ 公尺/分。依題意可列聯立方程式 $${formatSystemLatex(`${ratio.den}x-${ratio.num}y=0`, `${minutes}(x-y)=${headStart + exceed}`)}$。解得 $x=${fast},\\ y=${slow}$。`
        );
        continue;
      }

      const ratioList = [
        { num: 3, den: 2 },
        { num: 4, den: 3 },
        { num: 5, den: 4 },
      ];
      const ratio = ratioList[randInt(0, ratioList.length - 1)];
      const base = [90, 120, 150, 180][randInt(0, 3)];
      const slow = base * ratio.den;
      const fast = base * ratio.num;
      const minutes = [1, 2][randInt(0, 1)];
      const exceed = [20, 30, 40, 50][randInt(0, 3)];
      const headStart = (fast - slow) * minutes - exceed;
      if (headStart <= 0) {
        i -= 1;
        continue;
      }
      questions.push(
        `甲、乙兩人比賽跑步，甲速率是乙的 $${ratio.num}:${ratio.den}$。若乙先跑 ${headStart} 公尺，甲再開始追，${minutes} 分鐘後甲超越乙 ${exceed} 公尺，求兩人速率。`
      );
      answers.push(
        `設甲的速率為 $x$ 公尺/分，乙的速率為 $y$ 公尺/分。依題意可列聯立方程式 $${formatSystemLatex(`${ratio.den}x-${ratio.num}y=0`, `${minutes}(x-y)=${headStart + exceed}`)}$。解得 $x=${fast},\\ y=${slow}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ323TripleExpandSet(count) {
    const questions = [];
    const answers = [];
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [7, 24, 25],
      [8, 15, 17],
    ];
    for (let i = 0; i < count; i += 1) {
      const type = i % 3;
      if (type === 0) {
        const base = triples[randInt(0, triples.length - 1)];
        const factors = [2, 3, 4, 5, 10];
        const k = factors[randInt(0, factors.length - 1)];
        const a = base[0] * k;
        const b = base[1] * k;
        const c = base[2] * k;
        questions.push(`已知一直角三角形兩股為 \\(${a},${b}\\)，求斜邊長。`);
        answers.push(`\\(${c}\\)`);
        continue;
      }
      if (type === 1) {
        const insides = [2, 3, 5, 6, 7, 10];
        const others = [1, 2, 3];
        const inside = insides[randInt(0, insides.length - 1)];
        const other = others[randInt(0, others.length - 1)];
        const mode = randInt(0, 1);
        if (mode === 0) {
          questions.push(`直角三角形兩股為 \\(${other}\\) 與 \\(\\sqrt{${inside}}\\)，求斜邊。`);
          answers.push(`\\(${formatRadical(other * other + inside)}\\)`);
        } else {
          const c = randInt(4, 10);
          questions.push(`直角三角形一股為 \\(${other}\\)、斜邊為 \\(${c}\\)，求另一股。`);
          answers.push(`\\(${formatRadical(c * c - other * other)}\\)`);
        }
        continue;
      }
      const a = randInt(3, 16);
      const b = randInt(a + 1, a + 10);
      const c = Math.sqrt(a * a + b * b);
      const wording = randInt(0, 1) === 0
        ? `兩邊長為 \\(${a}\\)、\\(${b}\\)。若 \\(${b}\\) 是斜邊，求另一邊。`
        : `兩邊長為 \\(${a}\\)、\\(${b}\\)。若 \\(${b}\\) 不是斜邊，求斜邊。`;
      questions.push(wording);
      answers.push(randInt(0, 1) === 0 ? `\\(${formatRadical(b * b - a * a)}\\)` : `\\(${formatRadical(a * a + b * b)}\\)`);
    }
    return { questions, answers };
  }

  function buildJ323HypotenuseAltitudeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const type = i % 2;
      if (type === 0) {
        const a = randInt(3, 15);
        const b = randInt(4, 16);
        const c = `\\sqrt{${a * a + b * b}}`;
        questions.push(`直角三角形兩股為 \\(${a},${b}\\)。求斜邊上的高 \\(h\\)。`);
        answers.push(`\\(h=\\frac{${a * b}}{${c}}\\)`);
        continue;
      }
      const area = randInt(12, 80);
      const c = randInt(5, 20);
      questions.push(`已知直角三角形面積為 \\(${area}\\)，斜邊長 \\(${c}\\)，求斜邊上的高。`);
      answers.push(`\\(h=\\frac{2\\times${area}}{${c}}=\\frac{${2 * area}}{${c}}\\)`);
    }
    return { questions, answers };
  }

  function buildJ323CoordinateDistanceSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const type = i % 3;
      if (type === 0) {
        const x1 = randInt(-8, 8), y1 = randInt(-8, 8);
        const x2 = randInt(-8, 8), y2 = randInt(-8, 8);
        questions.push(`平面上兩點 \\(A(${x1},${y1}),B(${x2},${y2})\\) 的距離為何？`);
        answers.push(`\\(\\sqrt{(${x1}-${x2})^2+(${y1}-${y2})^2}\\)`);
        continue;
      }
      if (type === 1) {
        const x = randInt(-15, 15), y = randInt(-15, 15);
        questions.push(`點 \\(P(${x},${y})\\) 到原點距離為何？`);
        answers.push(`\\(\\sqrt{${x * x + y * y}}\\)`);
        continue;
      }
      const y = randInt(-8, 8);
      const d = randInt(5, 20);
      const xAbs2 = d * d - y * y;
      if (xAbs2 <= 0) {
        i -= 1;
        continue;
      }
      questions.push(`點 \\(A(k,${y})\\) 到原點距離為 \\(${d}\\)，求 \\(k\\) 的可能值。`);
      answers.push(`\\(k=\\pm\\sqrt{${xAbs2}}\\)`);
    }
    return { questions, answers };
  }

  function buildJ323SpatialDiagonalSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const type = i % 3;
      if (type === 0) {
        const a = randInt(2, 12), b = randInt(2, 12), c = randInt(2, 12);
        questions.push(`長方體長寬高為 \\(${a},${b},${c}\\)，求體對角線。`);
        answers.push(`\\(\\sqrt{${a * a + b * b + c * c}}\\)`);
        continue;
      }
      if (type === 1) {
        const a = randInt(2, 20);
        questions.push(`正方體邊長為 \\(${a}\\)，求體對角線。`);
        answers.push(`\\(${a}\\sqrt{3}\\)`);
        continue;
      }
      const h = randInt(4, 18), c = randInt(6, 20);
      questions.push(`圓柱高為 \\(${h}\\)，底面周長為 \\(${c}\\)。側面展開成長方形後，最短路徑長為何？`);
      answers.push(`\\(\\sqrt{${h * h}+\\left(\\frac{${c}}{2}\\right)^2}\\)`);
    }
    return { questions, answers };
  }

  function buildJ331CommonFactorBasicSet(count) {
    function formatMonomial(coeff, power) {
      if (power === 0) return `${coeff}`;
      if (power === 1) return formatCoeffTerm(coeff, "x", 1);
      return formatCoeffTerm(coeff, "x", power);
    }
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const xPow = randInt(1, 4);
      const common = pickNonZero(2, 6);
      const a = pickNonZero(1, 9);
      const b = pickNonZero(1, 9);
      const extraPow = randInt(1, 3);
      const leftCoef = common * a;
      const rightCoef = common * b;
      const termA = formatMonomial(leftCoef, xPow + extraPow);
      const termB = formatMonomial(rightCoef, xPow);
      questions.push(`提取公因式：\\(${termA}${b > 0 ? "+" : ""}${termB}\\)`);
      const innerA = formatMonomial(a, extraPow);
      const innerB = `${b}`;
      const outer = xPow === 1 ? `${common}x` : `${common}x^${xPow}`;
      answers.push(`\\(${termA}${b > 0 ? "+" : ""}${termB}= ${outer}(${innerA}${b > 0 ? "+" : ""}${innerB})\\)`);
    }
    return { questions, answers };
  }

  function buildJ331PolynomialFactorSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(2, 7);
        questions.push(`提取公因式：\\((x+${p})(x-${p})-(x-${p})\\)`);
        answers.push(`\\((x+${p})(x-${p})-(x-${p})=(x-${p})(x+${p}-1)\\)`);
        continue;
      }
      if (mode === 1) {
        const a = randInt(2, 5);
        const b = randInt(1, 5);
        questions.push(`提取公因式：\\(x(${a}x+${b})-x(x+${b})\\)`);
        answers.push(`\\(x(${a}x+${b})-x(x+${b})=x\\big[(${a}x+${b})-(x+${b})\\big]=x(${a - 1}x)\\)`);
        continue;
      }
      if (mode === 2) {
        const p = randInt(2, 6);
        questions.push(`提取公因式：\\(2(${p}x-1)^2+(${p}x-1)\\)`);
        answers.push(`\\(2(${p}x-1)^2+(${p}x-1)=(${p}x-1)\\big(2(${p}x-1)+1\\big)=(${p}x-1)(${2 * p}x-1)\\)`);
        continue;
      }
      if (mode === 3) {
        const p = randInt(2, 6);
        questions.push(`提取公因式：\\((3x-${p})^2-(3x-${p})\\)`);
        answers.push(`\\((3x-${p})^2-(3x-${p})=(3x-${p})(3x-${p}-1)\\)`);
        continue;
      }
      questions.push(`提取公因式：\\(5(2x-1)^2-3(2x-1)\\)`);
      answers.push(`\\(5(2x-1)^2-3(2x-1)=(2x-1)(10x-8)\\)`);
    }
    return { questions, answers };
  }

  function buildJ331SignTransformSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        const c = randInt(2, 7);
        questions.push(`因式分解：\\(${a}(x-${b}y)-${c}(${b}y-x)\\)`);
        answers.push(`\\(${a}(x-${b}y)-${c}(${b}y-x)=(${a}+${c})(x-${b}y)\\)`);
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 6);
        const q = randInt(2, 6);
        const r = randInt(2, 6);
        questions.push(`因式分解：\\((x+${p})(x-${q})-(x-${r})(${q}-x)\\)`);
        answers.push(`\\((x+${p})(x-${q})-(x-${r})(${q}-x)=(x+${p})(x-${q})+(x-${r})(x-${q})=(x-${q})(2x+${p - r})\\)`);
        continue;
      }
      const A = randInt(3, 7);
      const B = randInt(2, 6);
      const C = randInt(2, 6);
      questions.push(`因式分解：\\(${A}b(a-b)-(${B}-a)^2+${C}(a-b)\\)`);
      answers.push(`\\(${A}b(a-b)-(${B}-a)^2+${C}(a-b)=(${A}b+${C})(a-b)-(a-${B})^2=(a-${B})(${A}b+${C}-a+${B})\\)`);
    }
    return { questions, answers };
  }

  function buildJ331GroupingFactorSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const k = randInt(2, 8);
        const t = randInt(2, 9);
        questions.push(`分組分解：\\(x^2-${k}x+${t}x-${t * k}\\)`);
        answers.push(`\\(x^2-${k}x+${t}x-${t * k}=(x-${k})(x+${t})\\)`);
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 6);
        const q = randInt(2, 6);
        questions.push(`分組分解：\\(${p}x^3+${p}x^2+${q}x+${q}\\)`);
        answers.push(`\\(${p}x^3+${p}x^2+${q}x+${q}=(x+1)(${p}x^2+${q})\\)`);
        continue;
      }
      if (mode === 2) {
        const p = randInt(2, 8);
        const q = [2, 4, 6, 8][randInt(0, 3)];
        const qHalf = q / 2;
        questions.push(`分組分解：\\(2xy+${p}x+${q}y+${p * qHalf}\\)`);
        answers.push(`\\(2xy+${p}x+${q}y+${p * qHalf}=(x+${qHalf})(2y+${p})\\)`);
        continue;
      }
      if (mode === 3) {
        const a = randInt(1, 5), b = randInt(1, 5), c = randInt(1, 5);
        const ax = formatCoeffTerm(a, "x", 1);
        const bx = formatCoeffTerm(b, "x", 1);
        const cx = formatCoeffTerm(c, "x", 1);
        const ay = formatCoeffTerm(a, "y", 1);
        const by = formatCoeffTerm(b, "y", 1);
        const cy = formatCoeffTerm(c, "y", 1);
        questions.push(`分組分解：\\(${ax}+${bx}+${cx}+${ay}+${by}+${cy}\\)`);
        answers.push(`\\(${ax}+${bx}+${cx}+${ay}+${by}+${cy}=${a + b + c}(x+y)\\)`);
        continue;
      }
      const k = randInt(2, 5);
      questions.push(`分組分解：\\(${k}ax+by+${k}cx-ay-${k}bx-cy\\)`);
      answers.push(`\\(${k}ax+by+${k}cx-ay-${k}bx-cy=(${k}x-y)(a-b+c)\\)`);
    }
    return { questions, answers };
  }

  function buildJ331ExpandThenGroupSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(2, 5);
        const r = randInt(2, 6);
        questions.push(`先去括號再分組：\\(${p}(ab-${r})-(${p * r}a-b)\\)`);
        answers.push(`\\(${p}(ab-${r})-(${p * r}a-b)=(${p}a+1)(b-${r})\\)`);
        continue;
      }
      if (mode === 1) {
        const s = randInt(2, 6);
        questions.push(`先去括號再分組：\\((a-${s})x-(x^2-${s}a)\\)`);
        answers.push(`\\((a-${s})x-(x^2-${s}a)=(x+${s})(a-x)\\)`);
        continue;
      }
      if (mode === 2) {
        const t = randInt(2, 6);
        questions.push(`先去括號再分組：\\((x-${t})a-(a^2-${t}x)\\)`);
        answers.push(`\\((x-${t})a-(a^2-${t}x)=(x-a)(a+${t})\\)`);
        continue;
      }
      if (mode === 3) {
        const t = randInt(2, 6);
        questions.push(`先去括號再分組：\\(x^2-( ${t}-a )x-${t}a\\)`);
        answers.push(`\\(x^2-( ${t}-a )x-${t}a=(x-${t})(x+a)\\)`);
        continue;
      }
      const z = randInt(2, 4);
      questions.push(`先去括號再分組：\\(xy(1+${z}^2)+${z}(x^2+y^2)\\)`);
      answers.push(`\\(xy(1+${z}^2)+${z}(x^2+y^2)=(y+${z}x)(x+${z}y)\\)`);
    }
    return { questions, answers };
  }

  function buildJ331CoreFactoringMixedSet(count) {
    const banks = [buildJ331CommonFactorBasicSet, buildJ331PolynomialFactorSet, buildJ331SignTransformSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const fn = banks[i % banks.length];
      const one = fn(1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ331GroupingAdvancedMixedSet(count) {
    const banks = [buildJ331GroupingFactorSet, buildJ331ExpandThenGroupSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const fn = banks[i % banks.length];
      const one = fn(1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ332DiffSquaresSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 10);
      const b = randInt(1, 10);
      const useVar = randInt(0, 1) === 1;
      const ax = formatCoeffTerm(a, "x", 1);
      const by = formatCoeffTerm(b, "y", 1);
      if (useVar) {
        const lead = a * a === 1 ? "x^2" : `${a * a}x^2`;
        questions.push(`因式分解：\\(${lead}-${b * b}\\)`);
        answers.push(`\\(${lead}-${b * b}=(${ax}+${b})(${ax}-${b})\\)`);
      } else {
        questions.push(`因式分解：\\(${a * a}-${b * b}y^2\\)`);
        answers.push(`\\(${a * a}-${b * b}y^2=(${a}+${by})(${a}-${by})\\)`);
      }
    }
    return { questions, answers };
  }

  function buildJ332PerfectSquareSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = randInt(1, 9);
      const sign = randInt(0, 1) === 0 ? "+" : "-";
      const mid = sign === "+" ? 2 * a * b : -2 * a * b;
      const ax = formatCoeffTerm(a, "x", 1);
      questions.push(`因式分解：\\(${a * a}x^2${mid >= 0 ? "+" : ""}${mid}x+${b * b}\\)`);
      answers.push(`\\(${a * a}x^2${mid >= 0 ? "+" : ""}${mid}x+${b * b}=(${ax}${sign}${b})^2\\)`);
    }
    return { questions, answers };
  }

  function buildJ332CompositeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const k = pickNonZero(2, 8);
      const a = randInt(1, 6);
      const b = randInt(1, 8);
      const mode = i % 2;
      const ax = formatCoeffTerm(a, "x", 1);
      const by = formatCoeffTerm(b, "y", 1);
      if (mode === 0) {
        questions.push(`因式分解：\\(${k * a * a}x^2-${k * b * b}y^2\\)`);
        answers.push(`\\(${k * a * a}x^2-${k * b * b}y^2=${k}(${ax}+${by})(${ax}-${by})\\)`);
      } else {
        const mid = -2 * a * b * k;
        questions.push(`因式分解：\\(${k * a * a}x^2${mid >= 0 ? "+" : ""}${mid}x+${k * b * b}\\)`);
        answers.push(`\\(${k * a * a}x^2${mid >= 0 ? "+" : ""}${mid}x+${k * b * b}=${k}(${ax}-${b})^2\\)`);
      }
    }
    return { questions, answers };
  }

  function buildJ332SubstitutionSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = randInt(1, 5);
      const q = randInt(1, 7);
      const mode = i % 2;
      if (mode === 0) {
        questions.push(`因式分解：\\((2x+${p})^2-${q * q}\\)`);
        answers.push(`\\((2x+${p})^2-${q * q}=(2x+${p}+${q})(2x+${p}-${q})\\)`);
      } else {
        questions.push(`因式分解：\\((x-${p})^2-2${q}(x-${p})+${q * q}\\)`);
        answers.push(`\\((x-${p})^2-2${q}(x-${p})+${q * q}=(x-${p}-${q})^2\\)`);
      }
    }
    return { questions, answers };
  }

  function buildJ332FormulaMixedSet(count) {
    const banks = [buildJ332DiffSquaresSet, buildJ332PerfectSquareSet, buildJ332CompositeSet, buildJ332SubstitutionSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ333CrossCoeffOneSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(1, 12);
      const q = pickNonZero(1, 12);
      const s1 = randInt(0, 1) === 0 ? 1 : -1;
      const s2 = randInt(0, 1) === 0 ? 1 : -1;
      const b = s1 * p + s2 * q;
      const c = (s1 * p) * (s2 * q);
      questions.push(`十字交乘因式分解：\\(x^2${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}\\)`);
      answers.push(`\\(x^2${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}=(x${s1 > 0 ? "+" : "-"}${p})(x${s2 > 0 ? "+" : "-"}${q})\\)`);
    }
    return { questions, answers };
  }

  function buildJ333CrossCoeffNonOneSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a1 = randInt(2, 6);
      const a2 = randInt(2, 6);
      const p = randInt(1, 8);
      const q = randInt(1, 8);
      const s1 = randInt(0, 1) === 0 ? 1 : -1;
      const s2 = randInt(0, 1) === 0 ? 1 : -1;
      const A = a1 * a2;
      const B = a1 * (s2 * q) + a2 * (s1 * p);
      const C = (s1 * p) * (s2 * q);
      questions.push(`十字交乘因式分解：\\(${A}x^2${B >= 0 ? "+" : ""}${B}x${C >= 0 ? "+" : ""}${C}\\)`);
      answers.push(`\\(${A}x^2${B >= 0 ? "+" : ""}${B}x${C >= 0 ? "+" : ""}${C}=(${a1}x${s1 > 0 ? "+" : "-"}${p})(${a2}x${s2 > 0 ? "+" : "-"}${q})\\)`);
    }
    return { questions, answers };
  }

  function buildJ333CrossPreprocessSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const g = randInt(2, 6);
      const a1 = randInt(1, 4);
      const a2 = randInt(1, 4);
      const p = randInt(1, 7);
      const q = randInt(1, 7);
      const s1 = randInt(0, 1) === 0 ? 1 : -1;
      const s2 = randInt(0, 1) === 0 ? 1 : -1;
      const A0 = a1 * a2;
      const B0 = a1 * (s2 * q) + a2 * (s1 * p);
      const C0 = (s1 * p) * (s2 * q);
      const signAll = randInt(0, 1) === 0 ? 1 : -1;
      const A = signAll * g * A0;
      const B = signAll * g * B0;
      const C = signAll * g * C0;
      const outer = signAll * g;
      questions.push(`先預處理再十字交乘：\\(${A}x^2${B >= 0 ? "+" : ""}${B}x${C >= 0 ? "+" : ""}${C}\\)`);
      answers.push(`\\(${A}x^2${B >= 0 ? "+" : ""}${B}x${C >= 0 ? "+" : ""}${C}=${outer}(${a1}x${s1 > 0 ? "+" : "-"}${p})(${a2}x${s2 > 0 ? "+" : "-"}${q})\\)`);
    }
    return { questions, answers };
  }

  function buildJ333CrossSubstitutionSet(count) {
    function formatLinearFactor(u, constant) {
      if (constant === 0) return u === 1 ? "x" : `${u}x`;
      return u === 1
        ? `x${constant >= 0 ? "+" : ""}${constant}`
        : `${u}x${constant >= 0 ? "+" : ""}${constant}`;
    }
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const u = pickNonZero(1, 5);
      const v = pickNonZero(1, 6);
      const p = randInt(1, 8);
      const q = randInt(1, 8);
      const s1 = randInt(0, 1) === 0 ? 1 : -1;
      const s2 = randInt(0, 1) === 0 ? 1 : -1;
      const B = s1 * p + s2 * q;
      const C = (s1 * p) * (s2 * q);
      const A2 = u * u;
      const A1 = 2 * u * v + B * u;
      const A0 = v * v + B * v + C;
      const baseExpr = formatLinearFactor(u, v);
      questions.push(`分解：\\((${baseExpr})^2${B >= 0 ? "+" : ""}${B}(${baseExpr})${C >= 0 ? "+" : ""}${C}\\)。`);
      const c1 = v + (s1 > 0 ? p : -p);
      const c2 = v + (s2 > 0 ? q : -q);
      const tExpr = u === 1 ? `x+${v}` : `${u}x+${v}`;
      answers.push(
        `令 \\(t=${tExpr}\\)，原式可視為 \\(t^2${B >= 0 ? "+" : ""}${B}t${C >= 0 ? "+" : ""}${C}\\)。` +
        `十字交乘得 \\((t${s1 > 0 ? "+" : "-"}${p})(t${s2 > 0 ? "+" : "-"}${q})\\)，` +
        `代回為 \\((${formatLinearFactor(u, c1)})(${formatLinearFactor(u, c2)})\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ333CrossStructuredSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const m = randInt(1, 6);
      const p = randInt(1, 8);
      const q = randInt(1, 8);
      const s1 = randInt(0, 1) === 0 ? 1 : -1;
      const s2 = randInt(0, 1) === 0 ? 1 : -1;
      const B = s1 * p + s2 * q;
      const C = (s1 * p) * (s2 * q);
      const A2 = 1;
      const A1 = 2 * m + B;
      const A0 = m * m + B * m + C;
      questions.push(`分解：\\((x+${m})^2${B >= 0 ? "+" : ""}${B}(x+${m})${C >= 0 ? "+" : ""}${C}\\)。`);
      const c1 = m + (s1 > 0 ? p : -p);
      const c2 = m + (s2 > 0 ? q : -q);
      answers.push(
        `令 \\(t=x+${m}\\)，原式可視為 \\(t^2${B >= 0 ? "+" : ""}${B}t${C >= 0 ? "+" : ""}${C}\\)。` +
        `分解為 \\((t${s1 > 0 ? "+" : "-"}${p})(t${s2 > 0 ? "+" : "-"}${q})\\)，` +
        `代回為 \\((x${c1 === 0 ? "" : `${c1 >= 0 ? "+" : ""}${c1}`})(x${c2 === 0 ? "" : `${c2 >= 0 ? "+" : ""}${c2}`})\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ333CrossCoreMixedSet(count) {
    const banks = [buildJ333CrossCoeffOneSet, buildJ333CrossCoeffNonOneSet, buildJ333CrossPreprocessSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ333CrossSubMixedSet(count) {
    const banks = [buildJ333CrossSubstitutionSet, buildJ333CrossStructuredSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ341FactorFormulaSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const a = randInt(1, 6), b = pickNonZero(-10, 10);
        const lead = a === 1 ? "x^2" : `${a}x^2`;
        questions.push(`解方程：\\(${lead}${b >= 0 ? "+" : ""}${b}x=0\\)`);
        answers.push(`\\(x=0\\) 或 \\(x=${formatFraction(-b, a)}\\)`);
      } else if (mode === 1) {
        const a = randInt(1, 6), b = randInt(1, 9);
        const coeff = a * a;
        const lead = coeff === 1 ? "x^2" : `${coeff}x^2`;
        questions.push(`解方程：\\(${lead}-${b * b}=0\\)`);
        answers.push(`\\(x=\\pm${formatFraction(b, a)}\\)`);
      } else {
        const a = randInt(1, 5), b = randInt(1, 9), sign = randInt(0, 1) === 0 ? "+" : "-";
        const mid = sign === "+" ? 2 * a * b : -2 * a * b;
        const coeff = a * a;
        const lead = coeff === 1 ? "x^2" : `${coeff}x^2`;
        questions.push(`解方程：\\(${lead}${mid >= 0 ? "+" : ""}${mid}x+${b * b}=0\\)`);
        answers.push(`\\(x=${sign === "+" ? `-\\frac{${b}}{${a}}` : `\\frac{${b}}{${a}}`}\\)（重根）`);
      }
    }
    return { questions, answers };
  }

  function buildJ341CrossSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const r1n = pickNonZero(-8, 8);
      const r2n = pickNonZero(-8, 8);
      const a = randInt(1, 5);
      const b = -a * (r1n + r2n);
      const c = a * r1n * r2n;
      const lead = a === 1 ? "x^2" : `${a}x^2`;
      questions.push(`解方程：\\(${lead}${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}=0\\)`);
      answers.push(`\\(x=${r1n},${r2n}\\)`);
    }
    return { questions, answers };
  }

  function buildJ341StandardTransformSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        const p = pickNonZero(1, 6);
        const r = randInt(2, 6);
        const q = pickNonZero(-8, 8);
        const t = pickNonZero(-8, 8);
        const leftFactor = formatSingleVarExpr(r, q);
        const rightFactor = formatSingleVarExpr(1, t);
        const x2 = formatFraction(t - q, r - 1);
        questions.push(`解方程：\\((x-${p})(${leftFactor})=(x-${p})(${rightFactor})\\)`);
        answers.push(
          `移項得 \\((x-${p})\\big[(${leftFactor})-(${rightFactor})\\big]=0\\)。` +
          `所以 \\(x-${p}=0\\) 或 \\(${r - 1}x${q - t >= 0 ? "+" : ""}${q - t}=0\\)。` +
          `解得 \\(x=${p}\\) 或 \\(x=${x2}\\)。`
        );
      } else {
        let p = 2;
        let r = 2;
        let u = 1;
        let v = -3;
        let q = 1;
        let k = 0;
        for (let t = 0; t < 80; t += 1) {
          p = pickNonZero(1, 6);
          r = randInt(1, 5);
          u = pickNonZero(-8, 8);
          v = pickNonZero(-8, 8);
          q = r * (p - (u + v));
          if (q === 0 || Math.abs(q) > 12) continue;
          k = -r * u * v - p * q;
          if (k === 0 || Math.abs(k) > 80) continue;
          break;
        }
        const factorText = formatSingleVarExpr(r, q);
        const stdA = r;
        const stdB = q - r * p;
        const stdC = -p * q - k;
        const lead = stdA === 1 ? "x^2" : `${stdA}x^2`;
        const root1 = formatFraction(u, 1);
        const root2 = formatFraction(v, 1);
        const moveText = formatSubtraction(`(x-${p})(${factorText})`, k);
        questions.push(`解方程：\\((x-${p})(${factorText})=${k}\\)`);
        answers.push(
          `先移項：\\(${moveText}=0\\)。` +
          `展開得 \\(${lead}${stdB >= 0 ? "+" : ""}${stdB}x${stdC >= 0 ? "+" : ""}${stdC}=0\\)。` +
          `因式分解可寫成 \\((x-${u})(x${v >= 0 ? "-" : "+"}${Math.abs(v)})=0\\)，` +
          `所以 \\(x=${root1}\\) 或 \\(x=${root2}\\)。`
        );
      }
    }
    return { questions, answers };
  }

  function buildJ341RootPropertyReverseSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const r1 = pickNonZero(-8, 8), r2 = pickNonZero(-8, 8);
        const sum = r1 + r2, prod = r1 * r2;
        questions.push(`已知二次方程兩根為 \\(${r1},${r2}\\)，還原其方程。`);
        answers.push(`\\(x^2${sum >= 0 ? "-" : "+"}${Math.abs(sum)}x${prod >= 0 ? "+" : ""}${prod}=0\\)`);
      } else if (mode === 1) {
        const m = pickNonZero(-8, 8), n = pickNonZero(-12, 12), r1 = pickNonZero(-8, 8);
        const r2 = n / r1;
        questions.push(`若 \\(x^2${m >= 0 ? "+" : ""}${m}x${n >= 0 ? "+" : ""}${n}=0\\) 的一根為 \\(${r1}\\)，求另一根。`);
        answers.push(`\\(x=${formatFraction(n, r1)}\\)`);
      } else {
        const r1 = pickNonZero(-6, 6), r2 = pickNonZero(-6, 6);
        questions.push(`已知兩根和為 \\(${r1 + r2}\\)、兩根積為 \\(${r1 * r2}\\)，寫出二次方程。`);
        answers.push(`\\(x^2${r1 + r2 >= 0 ? "-" : "+"}${Math.abs(r1 + r2)}x${r1 * r2 >= 0 ? "+" : ""}${r1 * r2}=0\\)`);
      }
    }
    return { questions, answers };
  }

  function buildJ342SquareRootSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const k = randInt(2, 15);
        questions.push(`解方程：\\(x^2=${k * k}\\)`);
        answers.push(`\\(x=\\pm${k}\\)`);
      } else if (mode === 1) {
        const h = pickNonZero(-8, 8), k = randInt(2, 12);
        questions.push(`解方程：\\((x${h >= 0 ? "+" : ""}${h})^2=${k * k}\\)`);
        answers.push(`\\(x=${-h + k}\\) 或 \\(x=${-h - k}\\)`);
      } else {
        const a = randInt(1, 5), h = pickNonZero(-6, 6), m = randInt(2, 15), b = randInt(-10, 10);
        const lead = a === 1 ? "" : `${a}`;
        questions.push(`解方程：\\(${lead}(x${h >= 0 ? "+" : ""}${h})^2${b >= 0 ? "+" : ""}${b}=${m * m}\\)`);
        const numerator = m * m - b;
        if (numerator > 0 && numerator % a === 0) {
          const rootText = formatRadical(numerator / a);
          answers.push(`\\(x=${-h}+${rootText}\\) 或 \\(x=${-h}-${rootText}\\)`);
        } else {
          answers.push(`\\(x=${-h}+\\sqrt{\\frac{${numerator}}{${a}}}\\) 或 \\(x=${-h}-\\sqrt{\\frac{${numerator}}{${a}}}\\)`);
        }
      }
    }
    return { questions, answers };
  }

  function buildJ342CompleteSquareTermSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = pickNonZero(-14, 14);
      const fillNumerator = b * b;
      const fillDenominator = 4 * a;
      const deltaNumerator = b;
      const deltaDenominator = 2 * a;
      const fillText = formatFraction(fillNumerator, fillDenominator);
      const deltaText = formatFraction(deltaNumerator, deltaDenominator);
      const lead = a === 1 ? "x^2" : `${a}x^2`;
      const rhsLead = a === 1 ? "" : `${a}`;
      questions.push(`填空使其成完全平方：\\(${lead}${b >= 0 ? "+" : ""}${b}x+\\square=${rhsLead}\\left(x+\\Delta\\right)^2\\)`);
      answers.push(`\\(\\square=${fillText}\\)，\\(\\Delta=${deltaText}\\)`);
    }
    return { questions, answers };
  }

  function buildJ342CompletingSquareSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(-8, 8);
      const q = randInt(2, 12);
      const mode = i % 2;
      const b = -2 * p;
      const c = mode === 0 ? (p * p - q) : (p * p + q);
      const rhs = p * p - c; // = q or -q
      questions.push(`用配方法解：\\(x^2${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}=0\\)`);
      if (rhs > 0) {
        const root = formatRadical(rhs);
        answers.push(`先配方：\\((x${p >= 0 ? "-" : "+"}${Math.abs(p)})^2=${rhs}\\)。再開根號：\\(x=${p}\\pm${root}\\)。`);
      } else if (rhs === 0) {
        answers.push(`先配方：\\((x${p >= 0 ? "-" : "+"}${Math.abs(p)})^2=0\\)。所以 \\(x=${p}\\)（重根）。`);
      } else {
        answers.push(`先配方：\\((x${p >= 0 ? "-" : "+"}${Math.abs(p)})^2=${rhs}\\)。右邊為負，無實數解。`);
      }
    }
    return { questions, answers };
  }

  function buildJ342DiscriminantSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode < 2) {
        const a = pickNonZero(1, 5), b = pickNonZero(-12, 12), c = pickNonZero(-12, 12);
        const D = b * b - 4 * a * c;
        const lead = a === 1 ? "x^2" : `${a}x^2`;
        questions.push(`判別 \\(${lead}${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}=0\\) 的根性質。`);
        answers.push(D > 0 ? `兩相異實根（\\(D=${D}>0\\)）` : D === 0 ? `重根（\\(D=0\\)）` : `無實根（\\(D=${D}<0\\)）`);
      } else {
        const a = randInt(1, 5), c = randInt(1, 20), k = randInt(1, 9);
        const lead = a === 1 ? "x^2" : `${a}x^2`;
        questions.push(`若 \\(${lead}-kx+${c}=0\\) 有重根，求 \\(k\\) 的值。`);
        answers.push(`\\(k=\\pm${formatRadical(4 * a * c)}\\)`);
      }
    }
    return { questions, answers };
  }

  function buildJ342FormulaSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 6), b = pickNonZero(-12, 12), c = pickNonZero(-12, 12);
      const D = b * b - 4 * a * c;
      const lead = a === 1 ? "x^2" : `${a}x^2`;
      questions.push(`用公式解：\\(${lead}${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}=0\\)`);
      if (D >= 0) {
        const sqrtD = Math.sqrt(D);
        if (Number.isInteger(sqrtD)) {
          const x1 = formatFraction(-b + sqrtD, 2 * a);
          const x2 = formatFraction(-b - sqrtD, 2 * a);
          answers.push(x1 === x2 ? `\\(x=${x1}\\)（重根）` : `\\(x=${x1}\\) 或 \\(x=${x2}\\)`);
          continue;
        }
      }
      answers.push(`\\(x=\\frac{${-b}\\pm${D >= 0 ? formatRadical(D) : `\\sqrt{${D}}`}}{${2 * a}}\\)`);
    }
    return { questions, answers };
  }

  function buildJ342ReverseFromSquareSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const p = pickNonZero(-8, 8), q = randInt(1, 20);
        questions.push(`若 \\(x^2${2 * p >= 0 ? "+" : ""}${2 * p}x+a=0\\) 可配方成 \\((x${p >= 0 ? "+" : ""}${p})^2=${q}\\)，求 \\(a\\)。`);
        answers.push(`\\(a=${p * p - q}\\)`);
      } else if (mode === 1) {
        const r1 = pickNonZero(-8, 8), r2 = pickNonZero(-8, 8);
        questions.push(`已知一元二次方程兩根為 \\(${r1},${r2}\\)，求原方程。`);
        answers.push(`\\(x^2${-(r1 + r2) >= 0 ? "+" : ""}${-(r1 + r2)}x${r1 * r2 >= 0 ? "+" : ""}${r1 * r2}=0\\)`);
      } else {
        const a = pickNonZero(1, 5), b = pickNonZero(-12, 12), c = pickNonZero(-12, 12);
        const lead = a === 1 ? "x^2" : `${a}x^2`;
        questions.push(`將 \\(${lead}${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}\\) 寫成 \\(A(x-h)^2+k\\) 形式，求 \\(A+h+k\\)。`);
        answers.push(`先提出 \\(A=${a}\\) 再配方。`);
      }
    }
    return { questions, answers };
  }

  function buildJ342RootsSumProductDirectSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 6), b = pickNonZero(-12, 12), c = pickNonZero(-12, 12);
      const sumText = formatFraction(-b, a);
      const prodText = formatFraction(c, a);
      questions.push(`已知 \\(${a}x^2${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}=0\\)，求兩根和 \\(\\alpha+\\beta\\) 與兩根積 \\(\\alpha\\beta\\)。`);
      answers.push(`\\(\\alpha+\\beta=${sumText}\\)，\\(\\alpha\\beta=${prodText}\\)。`);
    }
    return { questions, answers };
  }

  function buildJ342ReverseEquationFromRootsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        const s = pickNonZero(-10, 10), p = pickNonZero(-20, 20);
        questions.push(`若兩根和為 \\(${s}\\)、兩根積為 \\(${p}\\)，求二次方程。`);
        answers.push(`\\(x^2${-s >= 0 ? "+" : ""}${-s}x${p >= 0 ? "+" : ""}${p}=0\\)。`);
      } else {
        const r1 = pickNonZero(-8, 8), r2 = pickNonZero(-8, 8);
        questions.push(`若兩根分別為 \\(${r1}\\)、\\(${r2}\\)，還原其二次方程。`);
        const s = r1 + r2;
        const p = r1 * r2;
        answers.push(`\\(x^2${-s >= 0 ? "+" : ""}${-s}x${p >= 0 ? "+" : ""}${p}=0\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildJ342ExpressionBySumProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 5), b = pickNonZero(-10, 10), c = pickNonZero(-10, 10);
      const S = formatFraction(-b, a);
      const P = formatFraction(c, a);
      const mode = i % 3;
      if (mode === 0) {
        questions.push(`若 \\(${a}x^2${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}=0\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\(\\alpha^2+\\beta^2\\)。`);
        answers.push(`\\((\\alpha+\\beta)^2-2\\alpha\\beta=${S}^2-2\\cdot${P}\\)。`);
      } else if (mode === 1) {
        questions.push(`若 \\(${a}x^2${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}=0\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\((\\alpha-1)(\\beta-1)\\)。`);
        answers.push(`\\(\\alpha\\beta-(\\alpha+\\beta)+1=${P}-(${S})+1\\)。`);
      } else {
        questions.push(`若 \\(${a}x^2${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}=0\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\((\\alpha-\\beta)^2\\)。`);
        answers.push(`\\((\\alpha+\\beta)^2-4\\alpha\\beta=${S}^2-4\\cdot${P}\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildJ342CoefficientMistakeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const r1 = pickNonZero(-8, 8), r2 = pickNonZero(-8, 8);
      const sum = r1 + r2;
      const prod = r1 * r2;
      const wrongSum = -sum;
      const wrongProd = -prod;
      const mode = i % 2;
      if (mode === 0) {
        questions.push(`某生把一次項符號看錯，誤得兩根為 \\(${r1},${r2}\\)。求正確方程。`);
        answers.push(`錯一次項只會改變「根和」符號，故正確根和為 \\(${wrongSum}\\)、根積不變為 \\(${prod}\\)，方程為 \\(x^2${-wrongSum >= 0 ? "+" : ""}${-wrongSum}x${prod >= 0 ? "+" : ""}${prod}=0\\)。`);
      } else {
        questions.push(`某生把常數項符號看錯，誤得兩根為 \\(${r1},${r2}\\)。求正確方程。`);
        answers.push(`錯常數項只會改變「根積」符號，故正確根和為 \\(${sum}\\)、根積為 \\(${wrongProd}\\)，方程為 \\(x^2${-sum >= 0 ? "+" : ""}${-sum}x${wrongProd >= 0 ? "+" : ""}${wrongProd}=0\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildJ342SpecialRootRelationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const k = pickNonZero(-8, 8);
        questions.push(`若方程 \\(x^2+(k+2)x+(k+5)=0\\) 兩根互為相反數，求 \\(k\\)。`);
        answers.push(`兩根和為 0，故 \\(k+2=0\\Rightarrow k=-2\\)。`);
      } else if (mode === 1) {
        const k = pickNonZero(-9, 9);
        questions.push(`若方程 \\(x^2+(k+1)x+(k-3)=0\\) 有一根為 0，求 \\(k\\)。`);
        answers.push(`有一根為 0 \\(\\Rightarrow\\) 根積為 0，故 \\(k-3=0\\Rightarrow k=3\\)。`);
      } else {
        const m = pickNonZero(1, 6);
        questions.push(`若方程 \\(x^2+mx+9=0\\) 有相等兩根，求 \\(m\\)。`);
        answers.push(`相等兩根 \\(\\Rightarrow D=0\\)：\\(m^2-36=0\\Rightarrow m=\\pm6\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildJ342RootsCoreMixedSet(count) {
    const banks = [buildJ342RootsSumProductDirectSet, buildJ342ReverseEquationFromRootsSet, buildJ342ExpressionBySumProductSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ342RootsAppliedMixedSet(count) {
    const banks = [buildJ342CoefficientMistakeSet, buildJ342SpecialRootRelationSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ313PolynomialDivisionRegularSet(count) {
    const questions = [];
    const answers = [];

    const toFrac = (num, den = 1) => makeFraction(num, den);
    const pickSimpleFrac = () => {
      const den = [2, 3, 4][randInt(0, 2)];
      const num = pickNonZero(-8, 8);
      return makeFraction(num, den);
    };
    const fracIsZero = (f) => !f || Number(f.num || 0) === 0;
    const fracTerm = (f, power) => {
      if (fracIsZero(f)) return null;
      const sign = Number(f.num) < 0 ? -1 : 1;
      const abs = makeFraction(Math.abs(Number(f.num)), Number(f.den));
      const coefText = fractionToLatex(abs);
      if (power === 0) {
        return sign < 0 ? `-${coefText}` : coefText;
      }
      const xPart = power === 1 ? 'x' : `x^${power}`;
      const coefPart = coefText === '1' ? '' : coefText;
      const body = `${coefPart}${xPart}`;
      return sign < 0 ? `-${body}` : body;
    };
    const joinFracPoly = (terms) => {
      const filtered = terms.filter(Boolean);
      if (!filtered.length) return '0';
      return filtered.map((term, index) => {
        if (index === 0) return term;
        return term.startsWith('-') ? `- ${term.slice(1)}` : `+ ${term}`;
      }).join(' ');
    };

    while (questions.length < count) {
      const variant = questions.length % 2;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-6, 6);
        const q2 = toFrac(pickNonZero(-5, 5), 1);
        const q1 = pickSimpleFrac();
        const q0 = pickSimpleFrac();
        const r = pickSimpleFrac();

        const c3 = mulFraction(toFrac(a), q2);
        const c2 = addFraction(mulFraction(toFrac(a), q1), mulFraction(toFrac(b), q2));
        const c1 = addFraction(mulFraction(toFrac(a), q0), mulFraction(toFrac(b), q1));
        const c0 = addFraction(mulFraction(toFrac(b), q0), r);

        const dividend = joinFracPoly([
          fracTerm(c3, 3),
          fracTerm(c2, 2),
          fracTerm(c1, 1),
          fracTerm(c0, 0),
        ]);
        const divisor = joinFracPoly([fracTerm(toFrac(a), 1), fracTerm(toFrac(b), 0)]);
        const quotient = joinFracPoly([fracTerm(q2, 2), fracTerm(q1, 1), fracTerm(q0, 0)]);
        const remainder = fractionToLatex(r);

        questions.push(`計算：$(${dividend})\\div(${divisor})$。`);
        answers.push(`簡答：商 $${quotient}$，餘 $${remainder}$。`);
        continue;
      }

      const a = pickNonZero(-3, 3);
      const b = pickNonZero(-5, 5);
      const c = pickNonZero(-6, 6);
      const p = pickSimpleFrac();
      const q = pickSimpleFrac();
      const r1 = pickSimpleFrac();
      const r0 = pickSimpleFrac();

      const c3 = mulFraction(toFrac(a), p);
      const c2 = addFraction(mulFraction(toFrac(a), q), mulFraction(toFrac(b), p));
      const c1 = addFraction(addFraction(mulFraction(toFrac(b), q), mulFraction(toFrac(c), p)), r1);
      const c0 = addFraction(mulFraction(toFrac(c), q), r0);

      const dividend = joinFracPoly([
        fracTerm(c3, 3),
        fracTerm(c2, 2),
        fracTerm(c1, 1),
        fracTerm(c0, 0),
      ]);
      const divisor = joinFracPoly([fracTerm(toFrac(a), 2), fracTerm(toFrac(b), 1), fracTerm(toFrac(c), 0)]);
      const quotient = joinFracPoly([fracTerm(p, 1), fracTerm(q, 0)]);
      const remainder = joinFracPoly([fracTerm(r1, 1), fracTerm(r0, 0)]);

      questions.push(`計算：$(${dividend})\\div(${divisor})$。`);
      answers.push(`簡答：商 $${quotient}$，餘 $${remainder}$。`);
    }

    return { questions, answers };
  }

  function addPolyCoeffs(a, b) {
    const maxLen = Math.max(a.length, b.length);
    const left = Array(maxLen - a.length).fill(0).concat(a);
    const right = Array(maxLen - b.length).fill(0).concat(b);
    return left.map((value, index) => value + right[index]);
  }

  function scalePolyCoeffs(coeffs, k) {
    return coeffs.map((value) => value * k);
  }

  function evalPoly(coeffs, x) {
    let result = 0;
    const degree = coeffs.length - 1;
    for (let i = 0; i < coeffs.length; i += 1) {
      result += coeffs[i] * (x ** (degree - i));
    }
    return result;
  }

  function buildJ313ReverseDivisionSet(count) {
    const questions = [];
    const answers = [];
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const b = pickNonZero(-6, 6);
        const q2 = pickNonZero(-4, 4);
        const q1 = pickNonZero(-7, 7);
        const q0 = pickNonZero(-8, 8);
        const r = pickNonZero(-12, 12);
        const divisor = [1, b];
        const quotient = [q2, q1, q0];
        const dividend = addPolyCoeffs(multiplyPolyCoeffs(divisor, quotient), [r]);
        questions.push(`一多項式除以 $(x${b >= 0 ? '+' : ''}${b})$，商式為 $${formatPolynomialFromCoeffs(quotient)}$，餘式為 ${r}，求此多項式。`);
        answers.push(`簡答：$${formatPolynomialFromCoeffs(dividend)}$。`);
        continue;
      }

      if (variant === 1) {
        const d = pickNonZero(-5, 5);
        const p2 = pickNonZero(-4, 4);
        const p1 = pickNonZero(-7, 7);
        const p0 = pickNonZero(-9, 9);
        const poly = [p2, p1, p0];
        const product = multiplyPolyCoeffs(poly, [2, d]);
        questions.push(`一多項式與 $(2x${d >= 0 ? '+' : ''}${d})$ 的乘積為 $${formatPolynomialFromCoeffs(product)}$，求此多項式。`);
        answers.push(`簡答：$${formatPolynomialFromCoeffs(poly)}$。`);
        continue;
      }

      const p2 = pickNonZero(-4, 4);
      const p1 = pickNonZero(-7, 7);
      const p0 = pickNonZero(-9, 9);
      const q1 = pickNonZero(-4, 4);
      const q0 = pickNonZero(-7, 7);
      const r = pickNonZero(-9, 9);
      const divisor = [q1, q0];
      const quotient = [p2, p1, p0];
      const dividend = addPolyCoeffs(multiplyPolyCoeffs(divisor, quotient), [r]);
      questions.push(`已知多項式 $A$ 除以 $${formatPolynomialFromCoeffs(divisor)}$ 的商式為 $${formatPolynomialFromCoeffs(quotient)}$，餘式為 ${r}，求多項式 $A$。`);
      answers.push(`簡答：$A=${formatPolynomialFromCoeffs(dividend)}$。`);
    }
    return { questions, answers };
  }

  function buildJ313CoeffSumSet(count) {
    const questions = [];
    const answers = [];
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-7, 7);
        const c = pickNonZero(-9, 9);
        const d = randInt(-10, 10);
        const poly = [a, b, c, d];
        questions.push(`求多項式 $f(x)=${formatPolynomialFromCoeffs(poly)}$ 的常數項與各項係數總和。`);
        answers.push(`簡答：常數項為 ${d}，係數總和為 $f(1)=${evalPoly(poly, 1)}$。`);
        continue;
      }

      if (variant === 1) {
        const p = pickNonZero(-4, 4);
        const n = [4, 5, 6, 8][randInt(0, 3)];
        questions.push(`若 $A=(x-1)^${n}+(${p}x+1)$，求 $A$ 展開後的各項係數總和。`);
        answers.push(`簡答：係數總和為 $A(1)=0+(${p}+1)=${p + 1}$。`);
        continue;
      }

      const a = pickNonZero(-4, 4);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-8, 8);
      questions.push(`已知多項式 $A=( ${a}x${b >= 0 ? '+' : ''}${b} )^2+(${c}-x)(x+1)$，求 $A$ 的各項係數總和。`);
      const value = ((a + b) ** 2) + ((c - 1) * 2);
      answers.push(`簡答：係數總和為 $A(1)=(${a + b})^2+(${c - 1})\\cdot 2=${value}$。`);
    }
    return { questions, answers };
  }

  function buildJ313RemainderTheoremSet(count) {
    const questions = [];
    const answers = [];
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const poly = [pickNonZero(-3, 3), randInt(-6, 6), randInt(-7, 7), randInt(-9, 9)];
        questions.push(`不經除法，求 $${formatPolynomialFromCoeffs(poly)}$ 除以 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 的餘數。`);
        answers.push(`簡答：餘數為 $f(${a})=${evalPoly(poly, a)}$。`);
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(-5, 5);
        const r = pickNonZero(-9, 9);
        const m = pickNonZero(-4, 4);
        const n = pickNonZero(-8, 8);
        questions.push(`已知多項式 $A$ 除以 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 的餘式為 ${r}，求 $( ${m}A${n >= 0 ? '+' : ''}${n} )$ 除以同一除式的餘式。`);
        answers.push(`簡答：餘數為 ${m * r + n}。`);
        continue;
      }

      const a = pickNonZero(-4, 4);
      const p = pickNonZero(-5, 5);
      const q = pickNonZero(-7, 7);
      const c = randInt(-9, 9);
      questions.push(`若多項式 $(${p})x^2+(${q})x+k$ 能被 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 整除，求 $k$。`);
      const k = -(p * a * a + q * a);
      answers.push(`簡答：$k=${k}$。`);
    }
    return { questions, answers };
  }

  function buildJ313FactorTheoremSet(count) {
    const questions = [];
    const answers = [];
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const poly = [pickNonZero(-3, 3), randInt(-6, 6), randInt(-8, 8), randInt(-10, 10)];
        const value = evalPoly(poly, a);
        questions.push(`判斷 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 是否為 $${formatPolynomialFromCoeffs(poly)}$ 的因式。`);
        answers.push(`簡答：代入 $x=${a}$ 得 $f(${a})=${value}$，${value === 0 ? '是因式' : '不是因式'}。`);
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(-4, 4);
        const p = pickNonZero(-4, 4);
        const q = pickNonZero(-7, 7);
        questions.push(`已知 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 為 $${p}x^2+mx+${q}$ 的因式，求 $m$。`);
        const m = -(p * a * a + q) / a;
        if (!Number.isInteger(m)) continue;
        answers.push(`簡答：$m=${m}$。`);
        continue;
      }

      const u = pickNonZero(-3, 3);
      const v = pickNonZero(-4, 4);
      const p = pickNonZero(-3, 3);
      const tail = randInt(-8, 8);
      const fx = multiplyPolyCoeffs([1, -u], [1, -v]);
      const cubic = multiplyPolyCoeffs([p, tail], fx);
      const m = cubic[1];
      const n = cubic[2];
      questions.push(`若 $(x${u >= 0 ? '-' : '+'}${Math.abs(u)})$ 與 $(x${v >= 0 ? '-' : '+'}${Math.abs(v)})$ 皆為 $x^3+mx^2+nx+${cubic[3]}$ 的因式，求 $m,n$。`);
      answers.push(`簡答：$m=${m},\\ n=${n}$。`);
    }
    return { questions, answers };
  }

  function buildJ312PolynomialAddSubSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const a1 = pickNonZero(-6, 6);
        const b1 = pickNonZero(-8, 8);
        const c1 = randInt(-9, 9);
        const a2 = pickNonZero(-6, 6);
        const b2 = pickNonZero(-8, 8);
        const c2 = randInt(-9, 9);
        const p1 = formatPolynomialFromCoeffs([a1, b1, c1]);
        const p2 = formatPolynomialFromCoeffs([a2, b2, c2]);
        const ans = formatPolynomialFromCoeffs([a1 + a2, b1 + b2, c1 + c2]);
        questions.push(`計算：$(${p1})+(${p2})$。`);
        answers.push(`簡答：$${ans}$。`);
        continue;
      }

      if (variant === 1) {
        const a1 = pickNonZero(-6, 6);
        const b1 = pickNonZero(-8, 8);
        const c1 = randInt(-9, 9);
        const a2 = pickNonZero(-6, 6);
        const b2 = pickNonZero(-8, 8);
        const c2 = randInt(-9, 9);
        const p1 = formatPolynomialFromCoeffs([a1, b1, c1]);
        const p2 = formatPolynomialFromCoeffs([a2, b2, c2]);
        const ans = formatPolynomialFromCoeffs([a1 - a2, b1 - b2, c1 - c2]);
        questions.push(`計算：$(${p1})-(${p2})$。`);
        answers.push(`簡答：$${ans}$。`);
        continue;
      }

      const k1 = pickNonZero(2, 4);
      const k2 = pickNonZero(2, 4);
      const a1 = pickNonZero(-4, 4);
      const b1 = pickNonZero(-6, 6);
      const c1 = randInt(-8, 8);
      const a2 = pickNonZero(-4, 4);
      const b2 = pickNonZero(-6, 6);
      const c2 = randInt(-8, 8);
      const p1 = formatPolynomialFromCoeffs([a1, b1, c1]);
      const p2 = formatPolynomialFromCoeffs([a2, b2, c2]);
      const ans = formatPolynomialFromCoeffs([
        k1 * a1 - k2 * a2,
        k1 * b1 - k2 * b2,
        k1 * c1 - k2 * c2,
      ]);
      questions.push(`化簡：$${k1}(${p1})-${k2}(${p2})$。`);
      answers.push(`簡答：$${ans}$。`);
    }

    return { questions, answers };
  }

  function buildJ312DegreeConstraintSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const p = pickNonZero(-6, 6);
        const q = randInt(-8, 8);
        const r = randInt(-9, 9);
        questions.push(`若多項式 $(a${p >= 0 ? '+' : ''}${p})x^2+(${q})x+${r}$ 是一次多項式，求 $a$。`);
        answers.push(`簡答：$a=${-p}$。`);
        continue;
      }

      if (variant === 1) {
        const m = pickNonZero(-5, 5);
        const n = randInt(-8, 8);
        const c = randInt(-9, 9);
        questions.push(`若多項式 $(a${m >= 0 ? '+' : ''}${m})x^3+(${n})x^2+x+${c}$ 是一次多項式，求 $a$。`);
        answers.push(`簡答：$a=${-m}$。`);
        continue;
      }

      const aValue = pickNonZero(-4, 4);
      const u = -aValue;
      const v = -2 * aValue;
      const w = -3 * aValue;
      questions.push(`若多項式 $(a${u >= 0 ? '+' : ''}${u})x^2+(2a${v >= 0 ? '+' : ''}${v})x+(3a${w >= 0 ? '+' : ''}${w})$ 是零多項式，求 $a$。`);
      answers.push(`簡答：$a=${aValue}$。`);
    }

    return { questions, answers };
  }

  function buildJ312PolynomialReverseSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const b = randInt(-8, 8);
        const c = randInt(-9, 9);
        const u = pickNonZero(-4, 4);
        const v = randInt(-8, 8);
        const w = randInt(-9, 9);
        const A = formatPolynomialFromCoeffs([a, b, c]);
        const B = formatPolynomialFromCoeffs([u, v, w]);
        const sum = formatPolynomialFromCoeffs([a + u, b + v, c + w]);
        questions.push(`已知多項式 $A$ 與 $${B}$ 的和為 $${sum}$，求多項式 $A$。`);
        answers.push(`簡答：$A=${A}$。`);
        continue;
      }

      if (variant === 1) {
        const b2 = pickNonZero(-4, 4);
        const b1 = randInt(-8, 8);
        const b0 = randInt(-9, 9);
        const c2 = pickNonZero(-4, 4);
        const c1 = randInt(-8, 8);
        const c0 = randInt(-9, 9);
        const B = formatPolynomialFromCoeffs([b2, b1, b0]);
        const C = formatPolynomialFromCoeffs([c2, c1, c0]);
        const A = formatPolynomialFromCoeffs([b2 + c2, b1 + c1, b0 + c0]);
        questions.push(`若 $(A)-(${B})=${C}$，求多項式 $A$。`);
        answers.push(`簡答：$A=${A}$。`);
        continue;
      }

      const a2 = pickNonZero(-4, 4);
      const a1 = randInt(-8, 8);
      const a0 = randInt(-9, 9);
      const b2 = pickNonZero(-4, 4);
      const b1 = randInt(-8, 8);
      const b0 = randInt(-9, 9);
      const A = formatPolynomialFromCoeffs([a2, a1, a0]);
      const B = formatPolynomialFromCoeffs([b2, b1, b0]);
      const result = formatPolynomialFromCoeffs([2 * a2 - 3 * b2, 2 * a1 - 3 * b1, 2 * a0 - 3 * b0]);
      questions.push(`設 $A=${A}$、$B=${B}$，求 $2A-3B$。`);
      answers.push(`簡答：$${result}$。`);
    }

    return { questions, answers };
  }

  function buildMonomialTimesMonomialQA() {
    const c1 = pickNonZero(-6, 6);
    const c2 = pickNonZero(-6, 6);
    const p1 = randInt(0, 4);
    const p2 = randInt(0, 4);
    const monomialText = (coef, power) => {
      if (power === 0) return `${coef}`;
      const c = coef === 1 ? '' : coef === -1 ? '-' : `${coef}`;
      return `${c}x${power === 1 ? '' : `^${power}`}`;
    };
    const left = monomialText(c1, p1);
    const right = monomialText(c2, p2);
    const simpleAns = p1 + p2 === 0
      ? `${c1 * c2}`
      : `${c1 * c2 === 1 ? '' : c1 * c2 === -1 ? '-' : c1 * c2}x${p1 + p2 === 1 ? '' : `^${p1 + p2}`}`;
    return {
      question: `計算：$(${left})\\times(${right})$。`,
      answer: `簡答：$${simpleAns}$。`,
    };
  }

  function buildMonomialTimesPolyQA(polyDegree = 1) {
    const k = pickNonZero(-5, 5);
    const kp = randInt(0, 2);
    const lead = pickNonZero(-4, 4);
    const mid = pickNonZero(-6, 6);
    const tail = randInt(-8, 8);
    let coeffs;
    if (polyDegree === 1) coeffs = [lead, mid];
    else coeffs = [lead, mid, tail];
    const mStr = kp === 0 ? `${k}` : `${k === 1 ? '' : k === -1 ? '-' : k}x${kp === 1 ? '' : `^${kp}`}`;
    const pStr = formatPolynomialFromCoeffs(coeffs);
    const resultCoeffs = coeffs.map((value) => value * k);
    const resultDegree = polyDegree + kp;
    const full = Array(resultDegree + 1).fill(0);
    for (let i = 0; i < resultCoeffs.length; i += 1) {
      full[i] = resultCoeffs[i];
    }
    const result = formatPolynomialFromCoeffs(full);
    return {
      question: `化簡：$${mStr}(${pStr})$。`,
      answer: `簡答：$${result}$。`,
    };
  }

  function multiplyPolyCoeffs(a, b) {
    const out = Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i += 1) {
      for (let j = 0; j < b.length; j += 1) {
        out[i + j] += a[i] * b[j];
      }
    }
    return out;
  }

  function buildPolyTimesPolyQA(leftDegree, rightDegree) {
    const mkCoeffs = (deg) => {
      if (deg === 1) return [pickNonZero(-4, 4), randInt(-6, 6)];
      return [pickNonZero(-3, 3), randInt(-5, 5), randInt(-6, 6)];
    };
    const left = mkCoeffs(leftDegree);
    const right = mkCoeffs(rightDegree);
    const q = `計算：$(${formatPolynomialFromCoeffs(left)})(${formatPolynomialFromCoeffs(right)})$。`;
    const a = formatPolynomialFromCoeffs(multiplyPolyCoeffs(left, right));
    return { question: q, answer: `簡答：$${a}$。` };
  }

  function dividePolyByMonomialWithRemainder(coeffs, divisorCoef, divisorPower) {
    const degree = coeffs.length - 1;
    const quotient = [];
    const remainderTerms = [];
    for (let i = 0; i < coeffs.length; i += 1) {
      const power = degree - i;
      const coef = coeffs[i];
      if (power >= divisorPower && coef % divisorCoef === 0) {
        quotient.push({
          coef: coef / divisorCoef,
          power: power - divisorPower,
        });
      } else if (coef !== 0) {
        remainderTerms.push({
          coef,
          power,
        });
      }
    }
    const termToText = ({ coef, power }) => {
      if (power === 0) return `${coef}`;
      const c = coef === 1 ? '' : coef === -1 ? '-' : `${coef}`;
      return `${c}x${power === 1 ? '' : `^${power}`}`;
    };
    const joinTerms = (terms) => {
      if (!terms.length) return '0';
      return terms
        .map((term, idx) => {
          const t = termToText(term);
          if (idx === 0) return t;
          return t.startsWith('-') ? `- ${t.slice(1)}` : `+ ${t}`;
        })
        .join(' ');
    };
    return {
      quotient: joinTerms(quotient),
      remainder: joinTerms(remainderTerms),
    };
  }

  function buildPolyDivideMonomialQA(kind = 0) {
    if (kind === 0) {
      const c2 = pickNonZero(1, 6);
      const c1 = c2 * pickNonZero(-8, 8);
      const p1 = randInt(2, 6);
      const p2 = randInt(1, p1);
      const left = `${c1 === 1 ? '' : c1 === -1 ? '-' : c1}x^${p1}`;
      const right = `${c2 === 1 ? '' : c2 === -1 ? '-' : c2}x${p2 === 1 ? '' : `^${p2}`}`;
      const qCoef = c1 / c2;
      const qPow = p1 - p2;
      const ans = qPow === 0
        ? `${qCoef}`
        : `${qCoef === 1 ? '' : qCoef === -1 ? '-' : qCoef}x${qPow === 1 ? '' : `^${qPow}`}`;
      return {
        question: `計算：$(${left})\\div(${right})$。`,
        answer: `簡答：$${ans}$。`,
      };
    }

    if (kind === 1) {
      const divisorCoef = [2, 3, 4, 5][randInt(0, 3)];
      const coeffA = divisorCoef * pickNonZero(-6, 6);
      const coeffB = divisorCoef * pickNonZero(-6, 6);
      const divisor = `${divisorCoef}x`;
      const left = formatPolynomialFromCoeffs([coeffA, coeffB, 0]);
      const { quotient } = dividePolyByMonomialWithRemainder([coeffA, coeffB, 0], divisorCoef, 1);
      return {
        question: `計算：$(${left})\\div(${divisor})$。`,
        answer: `簡答：$${quotient}$。`,
      };
    }

    const divisorCoef = [2, 3, 4, 5][randInt(0, 3)];
    const c2 = divisorCoef * pickNonZero(-5, 5);
    const c1 = divisorCoef * pickNonZero(-5, 5);
    const c0 = pickNonZero(-9, 9);
    const left = formatPolynomialFromCoeffs([c2, c1, c0]);
    const divisor = `${divisorCoef}x`;
    const { quotient, remainder } = dividePolyByMonomialWithRemainder([c2, c1, c0], divisorCoef, 1);
    return {
      question: `計算：$(${left})\\div(${divisor})$。`,
      answer: `簡答：商 $${quotient}$，餘 $${remainder}$。`,
    };
  }

  function buildJ312MulEasyMonoMonoSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildMonomialTimesMonomialQA();
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312MulEasyMonoLinearSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildMonomialTimesPolyQA(1);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312MulEasyMonoQuadraticSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildMonomialTimesPolyQA(2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312MulEasyMixedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = i % 3 === 0
        ? buildMonomialTimesMonomialQA()
        : i % 3 === 1
          ? buildMonomialTimesPolyQA(1)
          : buildMonomialTimesPolyQA(2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312MulAdvLinearLinearSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyTimesPolyQA(1, 1);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312MulAdvLinearQuadraticSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyTimesPolyQA(1, 2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312MulAdvQuadraticQuadraticSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyTimesPolyQA(2, 2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312MulAdvMixedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = i % 3 === 0
        ? buildPolyTimesPolyQA(1, 1)
        : i % 3 === 1
          ? buildPolyTimesPolyQA(1, 2)
          : buildPolyTimesPolyQA(2, 2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312DivMonomialByMonomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(0);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312DivBinomialByMonomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(1);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312DivTrinomialByMonomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ312DivMonomialMixedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(i % 3);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, answers };
  }

  function buildJ213AllocationWorkSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const tents = randInt(6, 14);
        const emptyTents = [1, 2][randInt(0, 1)];
        const totalStudents = 5 * (tents - emptyTents);
        const noTent = totalStudents - 4 * tents;
        if (noTent <= 0) {
          i -= 1;
          continue;
        }
        questions.push(
          `某次露營，學生分配帳篷時，若每頂住 4 人，則有 ${noTent} 人無處可住；若每頂住 5 人，則空出 ${emptyTents} 頂帳篷，求帳篷數與學生人數。`
        );
        answers.push(
          `設帳篷有 $x$ 頂，學生有 $y$ 人。依題意可列聯立方程式 $${formatSystemLatex(`y=4x+${noTent}`, `y=5(x-${emptyTents})`)}$。解得 $x=${tents},\\ y=${totalStudents}$，所以有 ${tents} 頂帳篷、${totalStudents} 位學生。`
        );
        continue;
      }

      if (variant === 1) {
        const multiplier = [3, 4, 5][randInt(0, 2)];
        const ratioChoice = [
          { num: 1, den: 2 },
          { num: 2, den: 3 },
        ][randInt(0, 1)];
        const b = ratioChoice.den === 2 ? 2 * randInt(12, 28) : 3 * randInt(10, 20);
        const a = multiplier * b;
        const c = ((a + b) * ratioChoice.num) / ratioChoice.den;
        const total = a + b + c;
        questions.push(
          `三個人合資 ${total} 元買球，甲出錢是乙的 ${multiplier} 倍，丙出的錢是甲、乙出錢總和的 $${ratioChoice.num}/${ratioChoice.den}$，求三人各出多少元。`
        );
        answers.push(
          `設乙出 $x$ 元，甲出 $y$ 元。依題意可得 $y=${multiplier}x$，且總和為 $x+y+\\frac{${ratioChoice.num}}{${ratioChoice.den}}(x+y)=${total}$。可化為 $${ratioChoice.den + ratioChoice.num}x+${ratioChoice.den + ratioChoice.num}y=${ratioChoice.den * total}$。聯立求得 $x=${b},\\ y=${a}$，所以丙為 ${c} 元；三人分別是乙 ${b} 元、甲 ${a} 元、丙 ${c} 元。`
        );
        continue;
      }

      if (variant === 2) {
        const manRate = makeFraction(1, [18, 20, 24][randInt(0, 2)]);
        const womanRate = makeFraction(1, [24, 30, 40][randInt(0, 2)]);
        const together = divFraction(makeFraction(1, 1), addFraction(manRate, womanRate));
        const comboRate = addFraction(
          mulFraction(makeFraction(2, 1), manRate),
          mulFraction(makeFraction(3, 1), womanRate)
        );
        const comboDays = divFraction(makeFraction(1, 1), comboRate);
        questions.push(
          `某項工程由男、女工各一人合作需 $${fractionToLatex(together, true)}$ 天完成；若男工 2 人、女工 3 人合作則需 $${fractionToLatex(comboDays, true)}$ 天，求男工、女工單做各需幾天。`
        );
        answers.push(
          `設男工一天可做全部工作的 $x$，女工一天可做全部工作的 $y$。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${fractionToLatex(addFraction(manRate, womanRate), true)}`, `2x+3y=${fractionToLatex(comboRate, true)}`)}$。解得 $x=${fractionToLatex(manRate)},\\ y=${fractionToLatex(womanRate)}$，所以男工單做需 ${manRate.den} 天，女工單做需 ${womanRate.den} 天。`
        );
        continue;
      }

      const groupA = [2, 3, 4][randInt(0, 2)];
      const groupB = [3, 4, 5][randInt(0, 2)];
      const rateA = makeFraction(1, [12, 15, 18, 20][randInt(0, 3)]);
      const rateB = makeFraction(1, [18, 24, 30][randInt(0, 2)]);
      const comboRate = addFraction(
        mulFraction(makeFraction(groupA, 1), rateA),
        mulFraction(makeFraction(groupB, 1), rateB)
      );
      const comboDays = divFraction(makeFraction(1, 1), comboRate);
      const singleTogether = divFraction(makeFraction(1, 1), addFraction(rateA, rateB));
      questions.push(
        `某工程甲、乙各一人合作需 $${fractionToLatex(singleTogether, true)}$ 天完成；若改成甲 ${groupA} 人與乙 ${groupB} 人合作，則需 $${fractionToLatex(comboDays, true)}$ 天完成。求甲、乙單做各需幾天。`
      );
      answers.push(
        `設甲一天可做全部工作的 $x$，乙一天可做全部工作的 $y$。可列 $${formatSystemLatex(`x+y=${fractionToLatex(addFraction(rateA, rateB), true)}`, `${groupA}x+${groupB}y=${fractionToLatex(comboRate, true)}`)}$。解得 $x=${fractionToLatex(rateA)},\\ y=${fractionToLatex(rateB)}$，所以甲單做需 ${rateA.den} 天，乙單做需 ${rateB.den} 天。`
      );
    }

    return { questions, answers };
  }

  function buildJ213TieredFeeSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const base = [30, 40, 50, 60][randInt(0, 3)];
        const t = [30, 40, 50, 60][randInt(0, 3)];
        const s = [2, 3, 4, 5][randInt(0, 3)];
        const m1 = t + [30, 40, 50][randInt(0, 2)];
        const m2 = m1 + [20, 30, 40][randInt(0, 2)];
        const cost1 = base + s * (m1 - t);
        const cost2 = base + s * (m2 - t);
        questions.push(
          `某網咖的基本費用為 ${base} 元，可使用 $t$ 分鐘；超過 $t$ 分鐘後，超過的部分每分鐘收費 $s$ 元。已知第一次上網 ${m1} 分鐘花了 ${cost1} 元，第二次上網 ${m2} 分鐘花了 ${cost2} 元，求 $t$ 與 $s$。`
        );
        answers.push(
          `依題意可列聯立方程式 $${formatSystemLatex(`${base}+s(${m1}-t)=${cost1}`, `${base}+s(${m2}-t)=${cost2}`)}$。兩式相減可得 $${m2 - m1}s=${cost2 - cost1}$，所以 $s=${s}$。再代回得 $${base}+${s}(${m1}-t)=${cost1}$，解得 $t=${t}$。`
        );
        continue;
      }

      if (variant === 1) {
        const threshold = [180, 300, 600][randInt(0, 2)];
        const b = [20, 24, 30, 32][randInt(0, 3)];
        const k = [0.02, 0.04, 0.05, 0.1][randInt(0, 3)];
        const d1 = threshold + [200, 300, 400][randInt(0, 2)];
        const d2 = d1 + [300, 400, 500][randInt(0, 2)];
        const cost1 = Number((b + k * (d1 - threshold)).toFixed(2));
        const cost2 = Number((b + k * (d2 - threshold)).toFixed(2));
        questions.push(
          `某電信公司的通話費計算方式為：通話時間未超過 ${threshold} 秒收基本費 $b$ 元，超過 ${threshold} 秒之後的費用與通話時間成線型關係。已知通話 ${d1} 秒花費 ${cost1} 元，通話 ${d2} 秒花費 ${cost2} 元，求基本費 $b$ 與超過 ${threshold} 秒後每秒加收的費用 $k$。`
        );
        answers.push(
          `設超過 ${threshold} 秒後每秒加收 $k$ 元，基本費為 $b$ 元。依題意可列聯立方程式 $${formatSystemLatex(`b+k(${d1}-${threshold})=${cost1}`, `b+k(${d2}-${threshold})=${cost2}`)}$。兩式相減得 $${d2 - d1}k=${Number((cost2 - cost1).toFixed(2))}$，所以 $k=${k}$。再代回得 $b=${b}$。`
        );
        continue;
      }

      if (variant === 2) {
        const a = [15, 18, 20, 24][randInt(0, 3)];
        const k = [12, 15, 18, 20][randInt(0, 3)];
        const w1 = a + [8, 10, 12][randInt(0, 2)];
        const w2 = w1 + [8, 10, 12][randInt(0, 2)];
        const fee1 = k * (w1 - a);
        const fee2 = k * (w2 - a);
        questions.push(
          `某航空公司規定旅客行李在 $a$ 公斤以下免費，超過 $a$ 公斤的部分，每公斤收費 $k$ 元。已知行李重 ${w1} 公斤時需付 ${fee1} 元，重 ${w2} 公斤時需付 ${fee2} 元，求免費額度 $a$ 為多少公斤。`
        );
        answers.push(
          `設超重每公斤收 $k$ 元，免費額度為 $a$ 公斤。依題意可列聯立方程式 $${formatSystemLatex(`k(${w1}-a)=${fee1}`, `k(${w2}-a)=${fee2}`)}$。兩式相減得 $${w2 - w1}k=${fee2 - fee1}$，所以 $k=${k}$。再代回 $${k}(${w1}-a)=${fee1}$，解得 $a=${a}$。`
        );
        continue;
      }

      const drink = [20, 30, 40][randInt(0, 2)];
      const x = [20, 30, 40, 50][randInt(0, 3)];
      const y = [0.5, 1, 1.5, 2][randInt(0, 3)];
      const minutes1 = 120;
      const minutes2 = 200;
      const extra1 = minutes1 - 60;
      const extra2 = minutes2 - 60;
      const total1 = Number((drink + x + extra1 * y).toFixed(2));
      const total2 = Number((drink + x + extra2 * y).toFixed(2));
      questions.push(
        `某網咖消費項目如下：飲料基本消費 ${drink} 元，一小時內基本消費 $x$ 元，一小時後每分鐘加收 $y$ 元。若佳佳上網 2 小時花了 ${total1} 元，明凱上網 3 小時 20 分共花了 ${total2} 元，求 $x$ 與 $y$。`
      );
      answers.push(
        `依題意可列聯立方程式 $${formatSystemLatex(`${drink}+x+${extra1}y=${total1}`, `${drink}+x+${extra2}y=${total2}`)}$。兩式相減得 $${extra2 - extra1}y=${Number((total2 - total1).toFixed(2))}$，所以 $y=${y}$。再代回得 $x=${x}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ213ClassicalTextSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const bigMonk = [18, 24, 27, 30][randInt(0, 3)];
        const smallMonk = [42, 54, 63, 72][randInt(0, 3)];
        const monkTotal = bigMonk + smallMonk;
        const bunTotal = 3 * bigMonk + smallMonk / 3;
        questions.push(
          `古文題：今有饅頭 ${bunTotal} 個、僧人 ${monkTotal} 人。大僧 1 人分 3 個，小僧 3 人分 1 個，問大小僧各幾人？`
        );
        answers.push(
          `設大僧有 $x$ 人，小僧有 $y$ 人。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${monkTotal}`, `3x+\\frac{1}{3}y=${bunTotal}`)}$。將第二式同乘 3，可得 $9x+y=${bunTotal * 3}$。兩式相減得 $8x=${bunTotal * 3 - monkTotal}$，所以 $x=${bigMonk}$，再代回得 $y=${smallMonk}$。因此大僧有 ${bigMonk} 人，小僧有 ${smallMonk} 人。`
        );
        continue;
      }

      if (variant === 1) {
        const fish = [9, 12, 15, 18][randInt(0, 3)];
        const turtle = [8, 10, 11, 13][randInt(0, 3)];
        const feetTotal = 3 * fish + 4 * turtle;
        const eyeTotal = 2 * fish + 6 * turtle;
        questions.push(
          `古文題：三足魚與六眼龜，共游池中。今數其足，共有 ${feetTotal} 足；數其眼，共有 ${eyeTotal} 眼。問三足魚與六眼龜各幾隻？`
        );
        answers.push(
          `設三足魚有 $x$ 隻，六眼龜有 $y$ 隻。依題意可列聯立方程式 $${formatSystemLatex(`3x+4y=${feetTotal}`, `2x+6y=${eyeTotal}`)}$。消去可得 $x=${fish},\\ y=${turtle}$。因此三足魚有 ${fish} 隻，六眼龜有 ${turtle} 隻。`
        );
        continue;
      }

      const goodWine = [4, 5, 6, 7][randInt(0, 3)];
      const lightWine = [9, 12, 15, 18][randInt(0, 3)];
      const bottleTotal = goodWine + lightWine;
      const drunkTotal = 3 * goodWine + lightWine / 3;
      questions.push(
        `古文題：好酒 1 瓶醉 3 客，薄酒 3 瓶醉 1 人。今好酒、薄酒共 ${bottleTotal} 瓶，合計可醉 ${drunkTotal} 人，問好酒、薄酒各幾瓶？`
      );
      answers.push(
        `設好酒有 $x$ 瓶，薄酒有 $y$ 瓶。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${bottleTotal}`, `3x+\\frac{1}{3}y=${drunkTotal}`)}$。將第二式同乘 3，可得 $9x+y=${drunkTotal * 3}$。兩式相減得 $8x=${drunkTotal * 3 - bottleTotal}$，所以 $x=${goodWine}$，再代回得 $y=${lightWine}$。因此好酒有 ${goodWine} 瓶，薄酒有 ${lightWine} 瓶。`
      );
    }

    return { questions, answers };
  }

  function buildJ221CoordinateMixedSet(count) {
    const questions = [];
    const answers = [];

    function quadrantName(x, y) {
      if (x > 0 && y > 0) return '第一象限';
      if (x < 0 && y > 0) return '第二象限';
      if (x < 0 && y < 0) return '第三象限';
      if (x > 0 && y < 0) return '第四象限';
      if (x === 0 && y === 0) return '原點';
      if (x === 0) return 'y 軸上';
      return 'x 軸上';
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        if (randInt(0, 1) === 0) {
          const x = randInt(-9, 9) || 4;
          const y = randInt(-9, 9) || -3;
          questions.push(`如果點 $P(${x},${y})$ 表示平面上一點，求 $P$ 點到 $x$ 軸與 $y$ 軸的距離。`);
          answers.push(
            `點 $P(${x},${y})$ 到 $x$ 軸的距離看 $y$ 的絕對值，到 $y$ 軸的距離看 $x$ 的絕對值，所以到 $x$ 軸距離是 $|${y}|=${Math.abs(y)}$，到 $y$ 軸距離是 $|${x}|=${Math.abs(x)}$。`
          );
        } else {
          const q = randInt(1, 4);
          const qLabel = ['一', '二', '三', '四'][q - 1];
          const dx = [3, 4, 5, 6, 7][randInt(0, 4)];
          const dy = [2, 4, 6, 8, 9][randInt(0, 4)];
          const point =
            q === 1 ? `(${dx},${dy})` : q === 2 ? `(-${dx},${dy})` : q === 3 ? `(-${dx},-${dy})` : `(${dx},-${dy})`;
          questions.push(
            `已知點 $A$ 在第${qLabel}象限，且到 $x$ 軸距離為 ${dy}，到 $y$ 軸距離為 ${dx}，求點 $A$ 的座標。`
          );
          answers.push(
            `到 $y$ 軸距離是 $|x|=${dx}$，到 $x$ 軸距離是 $|y|=${dy}$。再依第${qLabel}象限判斷正負，可得 $A${point}$。`
          );
        }
        continue;
      }

      if (variant === 1) {
        if (randInt(0, 1) === 0) {
          const pts = [];
          while (pts.length < 3) {
            const x = randInt(-8, 8);
            const y = randInt(-8, 8);
            if (x === 0 && y === 0) continue;
            pts.push(`$${String.fromCharCode(65 + pts.length)}(${x},${y})$`);
          }
          questions.push(`判斷下列各點分別位於哪一象限或哪一條坐標軸上：${pts.join('、')}。`);
          const parsed = pts.map((text) => {
            const match = text.match(/([A-Z])\((-?\d+),(-?\d+)\)/);
            const name = match[1];
            const x = Number(match[2]);
            const y = Number(match[3]);
            return `${name} 在${quadrantName(x, y)}`;
          });
          answers.push(parsed.join('，') + '。');
        } else {
          const s = [2, 3, 4, 5][randInt(0, 3)];
          const t = [2, 3, 4, 5][randInt(0, 3)];
          const formA = `$A\\left(\\frac{s}{t},-\\frac{t}{s}\\right)$`;
          const formB = `$B(-t^2,st)$`;
          questions.push(`若 $s>0,t<0$，則點 ${formA} 與 ${formB} 分別位於第幾象限？`);
          answers.push(
            `因為 $s>0,t<0$，所以 $\\frac{s}{t}<0$、$-\\frac{t}{s}>0$，故點 $A$ 在第二象限；又 $-t^2<0$、$st<0$，所以點 $B$ 在第三象限。`
          );
        }
        continue;
      }

      if (variant === 2) {
        if (randInt(0, 1) === 0) {
          const x = randInt(-6, 6);
          const y = randInt(-6, 6);
          const right = randInt(2, 6);
          const vertical = randInt(2, 5);
          const goUp = randInt(0, 1) === 0;
          const newX = x + right;
          const newY = goUp ? y + vertical : y - vertical;
          questions.push(
            `若從點 $A(${x},${y})$ 出發，先向右移 ${right} 單位，再${goUp ? '向上' : '向下'}移 ${vertical} 單位，求終點座標。`
          );
          answers.push(
            `向右移 ${right} 單位表示 $x$ 坐標加 ${right}，${goUp ? '向上' : '向下'}移 ${vertical} 單位表示 $y$ 坐標${goUp ? '加' : '減'} ${vertical}，所以終點是 $(${newX},${newY})$。`
          );
        } else {
          const endX = randInt(-5, 5);
          const endY = randInt(-5, 5);
          const right = randInt(2, 6);
          const down = randInt(2, 5);
          const startX = endX - right;
          const startY = endY + down;
          questions.push(
            `若點 $P$ 先向右移 ${right} 單位，再向下移 ${down} 單位後到達 $Q(${endX},${endY})$，求點 $P$ 的座標。`
          );
          answers.push(
            `設點 $P$ 為 $(x,y)$。向右移 ${right} 單位後 $x$ 變成 ${endX}，所以原本 $x=${endX}-${right}=${startX}$；向下移 ${down} 單位後 $y$ 變成 ${endY}$，所以原本 $y=${endY}+${down}=${startY}$。故點 $P$ 為 $(${startX},${startY})$。`
          );
        }
        continue;
      }

      if (randInt(0, 1) === 0) {
        const candidates = [
          { label: 'A', x: -3, y: 0 },
          { label: 'B', x: 0, y: -1 },
          { label: 'C', x: 1, y: 0 },
          { label: 'D', x: 3, y: -5 },
        ];
        const shuffled = candidates.sort(() => Math.random() - 0.5);
        questions.push(`寫出下列點中哪些在 $x$ 軸上：${shuffled.map((p) => `${p.label}(${p.x},${p.y})`).join('、')}。`);
        const onXAxis = shuffled.filter((p) => p.y === 0).map((p) => `${p.label}(${p.x},${p.y})`);
        answers.push(`在 $x$ 軸上的點需滿足 $y=0$，所以答案是 ${onXAxis.join('、')}。`);
      } else {
        const k = [-4, -2, 1, 3][randInt(0, 3)];
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        const kind = randInt(0, 1);
        if (kind === 0) {
          const xCoef = a;
          const xConst = -a * k;
          const yVal = randInt(-8, 8);
          questions.push(`已知點 $A(${xCoef}k${xConst >= 0 ? '+' : ''}${xConst},${yVal})$ 在 $y$ 軸上，求 $k$。`);
          answers.push(
            `在 $y$ 軸上的點需滿足 $x=0$，所以 $${xCoef}k${xConst >= 0 ? '+' : ''}${xConst}=0$，解得 $k=${k}$。`
          );
        } else {
          const yCoef = b;
          const yConst = -b * k;
          const xVal = randInt(-8, 8);
          questions.push(`已知點 $A(${xVal},${yCoef}k${yConst >= 0 ? '+' : ''}${yConst})$ 在 $x$ 軸上，求 $k$。`);
          answers.push(
            `在 $x$ 軸上的點需滿足 $y=0$，所以 $${yCoef}k${yConst >= 0 ? '+' : ''}${yConst}=0$，解得 $k=${k}$。`
          );
        }
      }
    }

    return { questions, answers };
  }

  function buildJ221AxisDistanceSet(count) {
    const questions = [];
    const answers = [];
    const quadrantLabel = ['一', '二', '三', '四'];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const x = randInt(-9, 9) || 4;
        const y = randInt(-9, 9) || -3;
        questions.push(`如果點 $P(${x},${y})$ 表示平面上一點，求 $P$ 點到 $x$ 軸與 $y$ 軸的距離。`);
        answers.push(
          `點 $P(${x},${y})$ 到 $x$ 軸的距離看 $y$ 的絕對值，到 $y$ 軸的距離看 $x$ 的絕對值，所以到 $x$ 軸距離是 $|${y}|=${Math.abs(y)}$，到 $y$ 軸距離是 $|${x}|=${Math.abs(x)}$。`
        );
        continue;
      }

      const q = randInt(1, 4);
      const qLabel = quadrantLabel[q - 1];
      const dx = [3, 4, 5, 6, 7, 9][randInt(0, 5)];
      const dy = [2, 4, 6, 8, 9, 12][randInt(0, 5)];
      const point =
        q === 1 ? `(${dx},${dy})` : q === 2 ? `(-${dx},${dy})` : q === 3 ? `(-${dx},-${dy})` : `(${dx},-${dy})`;

      if (variant === 1) {
        questions.push(
          `已知點 $A$ 在第${qLabel}象限，且到 $x$ 軸距離為 ${dy}，到 $y$ 軸距離為 ${dx}，求點 $A$ 的座標。`
        );
        answers.push(
          `到 $y$ 軸距離是 $|x|=${dx}$，到 $x$ 軸距離是 $|y|=${dy}$。再依第${qLabel}象限判斷正負，可得 $A${point}$。`
        );
        continue;
      }

      questions.push(
        `若點 $P$ 位於第${qLabel}象限，且 $P$ 點到 $x$ 軸距離為 ${dy}，到 $y$ 軸距離為 ${dx}，求 $P$ 的座標。`
      );
      answers.push(`到兩軸的距離先告訴我們 $|x|=${dx}$、$|y|=${dy}$，再依第${qLabel}象限判斷正負，所以 $P${point}$。`);
    }

    return { questions, answers };
  }

  function buildJ221QuadrantBasicSet(count) {
    const questions = [];
    const answers = [];

    function quadrantName(x, y) {
      if (x > 0 && y > 0) return '第一象限';
      if (x < 0 && y > 0) return '第二象限';
      if (x < 0 && y < 0) return '第三象限';
      if (x > 0 && y < 0) return '第四象限';
      if (x === 0 && y === 0) return '原點';
      if (x === 0) return 'y 軸上';
      return 'x 軸上';
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const pts = [];
        while (pts.length < 3) {
          const x = randInt(-8, 8);
          const y = randInt(-8, 8);
          if (x === 0 && y === 0) continue;
          pts.push({ name: String.fromCharCode(65 + pts.length), x, y });
        }
        questions.push(
          `判斷下列各點分別位於哪一象限或哪一條坐標軸上：${pts.map((p) => `${p.name}(${p.x},${p.y})`).join('、')}。`
        );
        answers.push(pts.map((p) => `${p.name} 在 ${quadrantName(p.x, p.y)}`).join('，') + '。');
        continue;
      }

      if (variant === 1) {
        const s = [2, 3, 4, 5][randInt(0, 3)];
        const t = [2, 3, 4, 5][randInt(0, 3)];
        questions.push(
          `若 $s>0,t<0$，則點 $A\\left(\\frac{s}{t},-\\frac{t}{s}\\right)$ 與 $B(-t^2,st)$ 分別位於第幾象限？`
        );
        answers.push(
          `因為 $s>0,t<0$，所以 $\\frac{s}{t}<0$、$-\\frac{t}{s}>0$，故點 $A$ 在第二象限；又 $-t^2<0$、$st<0$，所以點 $B$ 在第三象限。`
        );
        continue;
      }

      questions.push(`已知點 $P(ab,a-b)$ 在第二象限，判斷 $a\\cdot b$ 為正數或負數。`);
      answers.push(
        `點 $P(ab,a-b)$ 在第二象限，表示第一個坐標 $ab<0$、第二個坐標 $a-b>0$。題目只問 $a\\cdot b$ 的正負，所以可直接判斷 $a\\cdot b$ 為負數。`
      );
    }

    return { questions, answers };
  }

  function buildJ221TranslationSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const x = randInt(-6, 6);
        const y = randInt(-6, 6);
        const right = randInt(2, 6);
        const up = randInt(2, 5);
        questions.push(`若從點 $A(${x},${y})$ 出發，先向右移 ${right} 單位，再向上移 ${up} 單位，求終點座標。`);
        answers.push(
          `向右移 ${right} 單位表示 $x$ 坐標加 ${right}，向上移 ${up} 單位表示 $y$ 坐標加 ${up}，所以終點是 $(${x + right},${y + up})$。`
        );
        continue;
      }

      if (variant === 1) {
        const x = randInt(-6, 6);
        const y = randInt(-6, 6);
        const down = randInt(2, 6);
        const left = randInt(2, 5);
        questions.push(`若從點 $P(${x},${y})$ 出發，先下移 ${down} 單位，再左移 ${left} 單位，求終點座標。`);
        answers.push(
          `下移 ${down} 單位表示 $y$ 坐標減 ${down}，左移 ${left} 單位表示 $x$ 坐標減 ${left}，所以終點是 $(${x - left},${y - down})$。`
        );
        continue;
      }

      const endX = randInt(-5, 5);
      const endY = randInt(-5, 5);
      const right = randInt(2, 6);
      const down = randInt(2, 5);
      const startX = endX - right;
      const startY = endY + down;
      questions.push(
        `若點 $E$ 先右移 ${right} 單位，再下移 ${down} 單位到達 $F(${endX},${endY})$，求原點 $E$ 的坐標。`
      );
      answers.push(
        `設點 $E$ 為 $(x,y)$。右移 ${right} 單位後 $x$ 變成 ${endX}$，所以原本 $x=${endX}-${right}=${startX}$；下移 ${down} 單位後 $y$ 變成 ${endY}$，所以原本 $y=${endY}+${down}=${startY}$。故點 $E$ 為 $(${startX},${startY})$。`
      );
    }

    return { questions, answers };
  }

  function buildJ221AxisSpecialSet(count) {
  const questions = [];
  const answers = [];

  for (let i = 0; i < count; i += 1) {
    const variant = i % 3;
    const cycle = Math.floor(i / 3);

    if (variant === 0) {
      const askXAxis = cycle % 2 === 0;
      const xAxisPool = [-7, -4, -1, 2, 5, 8];
      const yAxisPool = [-6, -3, 1, 4, 7];
      const offAxisPool = [
        { x: -5, y: 2 },
        { x: 3, y: -4 },
        { x: 6, y: 3 },
        { x: -2, y: -5 },
        { x: 4, y: 1 },
      ];
      const points = [];
      if (askXAxis) {
        points.push({ label: 'A', x: xAxisPool[cycle % xAxisPool.length], y: 0 });
        points.push({ label: 'B', x: xAxisPool[(cycle + 2) % xAxisPool.length], y: 0 });
        points.push({ label: 'C', x: 0, y: yAxisPool[cycle % yAxisPool.length] });
        points.push({ label: 'D', ...offAxisPool[cycle % offAxisPool.length] });
      } else {
        points.push({ label: 'A', x: 0, y: yAxisPool[cycle % yAxisPool.length] });
        points.push({ label: 'B', x: 0, y: yAxisPool[(cycle + 2) % yAxisPool.length] });
        points.push({ label: 'C', x: xAxisPool[cycle % xAxisPool.length], y: 0 });
        points.push({ label: 'D', ...offAxisPool[(cycle + 1) % offAxisPool.length] });
      }
      const shuffled = [...points].sort(() => Math.random() - 0.5);
      questions.push(
        `寫出下列點中哪些在 $${askXAxis ? 'x' : 'y'}$ 軸上：${shuffled.map((p) => `${p.label}(${p.x},${p.y})`).join('、')}。`
      );
      const target = shuffled
        .filter((p) => (askXAxis ? p.y === 0 : p.x === 0))
        .map((p) => `${p.label}(${p.x},${p.y})`);
      answers.push(
        `在 $${askXAxis ? 'x' : 'y'}$ 軸上的點需滿足 ${askXAxis ? '$y=0$' : '$x=0$'}，所以答案是 ${target.join('、')}。`
      );
      continue;
    }

    if (variant === 1) {
      const templates = [
        { xCoef: 2, xConst: -3, yCoef: 3, yConst: 2 },
        { xCoef: 3, xConst: -6, yCoef: 2, yConst: 4 },
        { xCoef: 4, xConst: -10, yCoef: 5, yConst: 5 },
        { xCoef: 5, xConst: -15, yCoef: 3, yConst: 6 },
        { xCoef: 6, xConst: -9, yCoef: 4, yConst: 8 },
        { xCoef: 7, xConst: -14, yCoef: 5, yConst: 10 },
      ];
      const pick = templates[cycle % templates.length];
      const k1 = makeFraction(-pick.xConst, pick.xCoef);
      const k2 = makeFraction(-pick.yConst, pick.yCoef);
      questions.push(
        `已知 $A(${pick.xCoef}k${pick.xConst >= 0 ? '+' : ''}${pick.xConst},${pick.yCoef}k${pick.yConst >= 0 ? '+' : ''}${pick.yConst})$ 不屬於任何象限，求 $k$ 的可能值。`
      );
      answers.push(
        `不屬於任何象限表示點在坐標軸上，所以要嘛 ${pick.xCoef}k${pick.xConst >= 0 ? '+' : ''}${pick.xConst}=0，要嘛 ${pick.yCoef}k${pick.yConst >= 0 ? '+' : ''}${pick.yConst}=0。解得 $k=${fractionToLatex(k1, true)}$ 或 $k=${fractionToLatex(k2, true)}$。`
      );
      continue;
    }

    const k = [-3, -2, 1, 4][randInt(0, 3)];
    const mCoef = [2, 3, 4, 6][randInt(0, 3)];
    const xConst = randInt(-8, 8);
    const yConst = -mCoef * k;
    questions.push(
      `已知有一點 $A(${xConst},${mCoef}m${yConst >= 0 ? '+' : ''}${yConst})$ 位在 $x$ 軸上，求 $A$ 點的完整坐標。`
    );
    answers.push(
      `位在 $x$ 軸上的點需滿足 $y=0$，所以 $${mCoef}m${yConst >= 0 ? '+' : ''}${yConst}=0$，解得 $m=${k}$。代回後 $y=0$，因此 $A(${xConst},0)$。`
    );
  }

  return { questions, answers };
}
function buildJ221MidpointSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const x1 = randInt(-10, 8);
        const y1 = randInt(-8, 8);
        const mx = randInt(-6, 6);
        const my = randInt(-6, 6);
        const x2 = 2 * mx - x1;
        const y2 = 2 * my - y1;
        questions.push(`已知 $A(${x1},${y1})$、$B(${x2},${y2})$，求線段 $\\overline{AB}$ 的中點 $M$ 座標。`);
        answers.push(
          `中點公式是 $M\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)$，所以 $M=\\left(\\frac{${x1}+${x2}}{2},\\frac{${y1}+${y2}}{2}\\right)=(${mx},${my})$。`
        );
        continue;
      }

      if (variant === 1) {
        const ax = randInt(-10, 10);
        const ay = randInt(-8, 8);
        const mx = randInt(-6, 6);
        const my = randInt(-6, 6);
        const bx = 2 * mx - ax;
        const by = 2 * my - ay;
        questions.push(
          `已知 $A(${ax},${ay})$、$M(${mx},${my})$，且 $M$ 為線段 $\\overline{AB}$ 的中點，求 $B$ 點座標。`
        );
        answers.push(
          `因為中點滿足 $\\frac{${ax}+x_B}{2}=${mx}$、$\\frac{${ay}+y_B}{2}=${my}$，所以 $x_B=2\\times ${mx}-${ax}=${bx}$，$y_B=2\\times ${my}-${ay}=${by}$。故 $B(${bx},${by})$。`
        );
        continue;
      }

      const cx = randInt(-4, 4);
      const cy = randInt(-4, 4);
      const ax = randInt(-8, 8);
      const ay = randInt(-8, 8);
      const bx = 2 * cx - ax;
      const by = 2 * cy - ay;
      questions.push(
        `若圓心座標為 $(${cx},${cy})$，圓上一點 $A(${ax},${ay})$ 與點 $B$ 為直徑兩端，求另一端點 $B$ 的座標。`
      );
      answers.push(
        `圓心是直徑中點，所以 $\\left(\\frac{${ax}+x_B}{2},\\frac{${ay}+y_B}{2}\\right)=(${cx},${cy})$。解得 $x_B=2\\times(${cx})-(${ax})=${bx}$，$y_B=2\\times(${cy})-(${ay})=${by}$，所以 $B(${bx},${by})$。`
      );
    }

    return { questions, answers };
  }

  function buildJ221SymmetrySet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const x = randInt(-8, 8) || 3;
      const y = randInt(-8, 8) || -4;

      if (variant === 0) {
        questions.push(`求點 $A(${x},${y})$ 關於 $x$ 軸的對稱點座標。`);
        answers.push(`關於 $x$ 軸對稱時，$x$ 坐標不變，$y$ 坐標變號，所以對稱點是 $(${x},${-y})$。`);
        continue;
      }

      if (variant === 1) {
        questions.push(`求點 $B(${x},${y})$ 關於 $y$ 軸的對稱點座標。`);
        answers.push(`關於 $y$ 軸對稱時，$y$ 坐標不變，$x$ 坐標變號，所以對稱點是 $(${-x},${y})$。`);
        continue;
      }

      questions.push(`求點 $C(${x},${y})$ 關於原點的對稱點座標。`);
      answers.push(`關於原點對稱時，$x$、$y$ 都變號，所以對稱點是 $(${-x},${-y})$。`);
    }

    return { questions, answers };
  }

  function buildJ221AreaSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const yBase = randInt(1, 4);
        const ax = randInt(-6, -1);
        const bx = randInt(ax + 2, ax + 7);
        const cx = randInt(-2, 5);
        const cy = yBase + randInt(2, 6);
        const base = bx - ax;
        const height = cy - yBase;
        const area = (base * height) / 2;
        questions.push(
          `已知 $\\triangle ABC$ 的三頂點為 $A(${ax},${yBase})$、$B(${bx},${yBase})$、$C(${cx},${cy})$，求 $\\triangle ABC$ 的面積。`
        );
        answers.push(
          `因為 $A、B$ 在同一條水平線上，所以可把 $\\overline{AB}$ 當底，底長是 ${bx}-${ax}=${base}，高是 ${cy}-${yBase}=${height}。面積為 $\\frac{1}{2}\\times ${base}\\times ${height}=${area}$。`
        );
        continue;
      }

      if (variant === 1) {
        const left = randInt(-3, 2);
        const right = left + randInt(3, 6);
        const bottom = randInt(-2, 2);
        const top = bottom + randInt(2, 5);
        const area = (right - left) * (top - bottom);
        questions.push(
          `矩形 $ABCD$ 的四頂點分別為 $A(${left},${top})$、$B(${left},${bottom})$、$C(${right},${bottom})$、$D(${right},${top})$，求其面積。`
        );
        answers.push(
          `矩形的長是 $${right}-(${left})=${right - left}$，寬是 $${top}-(${bottom})=${top - bottom}$，所以面積是 $${right - left}\\times ${top - bottom}=${area}$。`
        );
        continue;
      }

      const ax = -randInt(3, 6);
      const bx = randInt(4, 9);
      const y = randInt(3, 7);
      const width = bx - ax;
      const area = (width * y) / 2;
      questions.push(`若 $A(${ax},0)$、$B(${bx},0)$、$C(a,${y})$ 為坐標平面上三點，求 $\\triangle ABC$ 的面積。`);
      answers.push(
        `點 $A、B$ 在 $x$ 軸上，所以可把 $\\overline{AB}$ 當底，底長是 $${bx}-(${ax})=${width}$；點 $C$ 到 $x$ 軸的高是 ${y}。因此面積為 $\\frac{1}{2}\\times ${width}\\times ${y}=${area}$，和 $a$ 的值無關。`
      );
    }

    return { questions, answers };
  }

  function buildJ221QuadrantReasoningSet(count) {
  const questions = [];
  const answers = [];

  function qName(id) {
    return ['第一象限', '第二象限', '第三象限', '第四象限'][id - 1];
  }

  for (let i = 0; i < count; i += 1) {
    const variant = i % 3;
    const cycle = Math.floor(i / 3);

    if (variant === 0) {
      const q = randInt(1, 4);
      const result = q === 1 ? 1 : q === 2 ? 4 : q === 3 ? 1 : 4;
      questions.push(`若點 $P(a,b)$ 在${qName(q)}，則點 $Q(a^2,ab)$ 在第幾象限？`);
      answers.push(
        `因為 $a^2>0$，所以 $Q$ 的 $x$ 坐標一定為正。又在${qName(q)}時，$ab$ ${q === 1 || q === 3 ? '為正' : '為負'}，所以 $Q(a^2,ab)$ 在${qName(result)}。`
      );
      continue;
    }

    if (variant === 1) {
      const conds = [
        { ab: '<0', sum: '>0' },
        { ab: '<0', sum: '<0' },
        { ab: '>0', sum: '>0' },
        { ab: '>0', sum: '<0' },
      ];
      const pick = conds[cycle % conds.length];
      questions.push(`已知 $ab${pick.ab}$ 且 $a+b${pick.sum}$，判斷點 $A(a,b^2)$ 位於第幾象限。`);
      if (pick.ab === '<0') {
        answers.push(`由 $ab<0$ 可知 $a、b$ 異號，因此 $a$ 可能為正也可能為負；而 $b^2>0$ 一定為正，所以點 $A(a,b^2)$ 可能在第一象限或第二象限。`);
      } else if (pick.sum === '>0') {
        answers.push(`由 $ab>0$ 且 $a+b>0$ 可知 $a,b$ 同為正數，所以 $a>0$、$b^2>0$，點 $A(a,b^2)$ 在第一象限。`);
      } else {
        answers.push(`由 $ab>0$ 且 $a+b<0$ 可知 $a,b$ 同為負數，所以 $a<0$、$b^2>0$，點 $A(a,b^2)$ 在第二象限。`);
      }
      continue;
    }

    const quadrant = randInt(1, 4);
    const result = quadrant === 1 ? 2 : quadrant === 2 ? 3 : quadrant === 3 ? 4 : 1;
    questions.push(`若點 $A(s,t)$ 在${qName(quadrant)}，則點 $B(-t,s)$ 在第幾象限？`);
    answers.push(
      `在${qName(quadrant)}時，$s、t$ 的正負可先判斷出來，再代入 $B(-t,s)$。整理後可知 $B$ 在${qName(result)}。`
    );
  }

  return { questions, answers };
}
function buildJ221NonnegativeSet(count) {
  const questions = [];
  const answers = [];

  for (let i = 0; i < count; i += 1) {
    const variant = i % 3;
    const cycle = Math.floor(i / 3);

    if (variant === 0) {
      const x = randInt(-4, 4);
      const y = randInt(-4, 4);
      const c1 = 3 * x - 7 * y;
        const c2 = 2 * x + y;
        questions.push(`若 $|3x-7y-${c1}|+|2x+y-${c2}|=0$，求數對 $(x,y)$ 所在的象限。`);
        answers.push(
          `因為兩個絕對值和為 0，所以必須同時為 0，可列 $3x-7y=${c1}$、$2x+y=${c2}$。解得 $(x,y)=(${x},${y})$，所以數對在${x > 0 && y > 0 ? '第一象限' : x < 0 && y > 0 ? '第二象限' : x < 0 && y < 0 ? '第三象限' : x > 0 && y < 0 ? '第四象限' : x === 0 && y === 0 ? '原點' : x === 0 ? 'y 軸上' : 'x 軸上'}。`
        );
        continue;
    }

    if (variant === 1) {
      const templates = [
        { p: 1, q: 2, r: 2, s: -1, t: 6 },
        { p: 1, q: -3, r: 3, s: 2, t: -5 },
        { p: 2, q: -4, r: -1, s: 1, t: 1 },
        { p: 1, q: -1, r: 2, s: 3, t: -8 },
        { p: -1, q: 5, r: 1, s: -2, t: 3 },
        { p: 2, q: 6, r: 1, s: -1, t: -4 },
      ];
      const pick = templates[cycle % templates.length];
      const x = divFraction(makeFraction(-pick.q, 1), makeFraction(pick.p, 1));
      const y = subFraction(mulFraction(makeFraction(pick.r, 1), x), makeFraction(-pick.t, 1));
      const yFinal = divFraction(y, makeFraction(pick.s, 1));
      const xText = fractionToLatex(x, true);
      const yText = fractionToLatex(yFinal, true);
      const term1 = `${formatTerm(pick.p, 'x')}${pick.q >= 0 ? '+' : ''}${pick.q}`;
      const term2 = `${formatTerm(pick.r, 'x')}${pick.s >= 0 ? '+' : ''}${formatTerm(pick.s, 'y')}${pick.t >= 0 ? '+' : ''}${pick.t}`;
      questions.push(`已知 $(${term1})^2+(${term2})^2=0$，求點 $(x,y)$ 的座標。`);
      answers.push(
        `平方和為 0，表示兩項都要是 0，所以可列 ${term1}=0、${term2}=0。先由第一式得 $x=${xText}$，再代入第二式得 $y=${yText}$，所以點為 $(${xText},${yText})$。`
      );
      continue;
    }

    const templates = [
      { c1: 10, c2: 2, p: 2, q: 1, r: 1, s: -1 },
      { c1: -3, c2: 4, p: 1, q: -2, r: 2, s: 1 },
      { c1: 8, c2: -1, p: 3, q: -1, r: 1, s: 1 },
      { c1: 6, c2: 5, p: 2, q: 3, r: 1, s: -2 },
      { c1: -4, c2: 1, p: 1, q: 1, r: 2, s: -3 },
      { c1: 12, c2: -2, p: 4, q: -1, r: 1, s: 2 },
    ];
    const pick = templates[cycle % templates.length];
    const det = pick.p * pick.s - pick.q * pick.r;
    if (det === 0) {
      i -= 1;
      continue;
    }
    const aVal = simplifyFraction(pick.c1 * pick.s - pick.q * pick.c2, det);
    const bVal = simplifyFraction(pick.p * pick.c2 - pick.c1 * pick.r, det);
    const axisDist = makeFraction(Math.abs(bVal.num), bVal.den);
    const eq1 = `${formatTerm(pick.p, 'a')}${pick.q >= 0 ? '+' : ''}${formatTerm(pick.q, 'b')}${pick.c1 >= 0 ? '-' : '+'}${Math.abs(pick.c1)}`;
    const eq2 = `${formatTerm(pick.r, 'a')}${pick.s >= 0 ? '+' : ''}${formatTerm(pick.s, 'b')}${pick.c2 >= 0 ? '-' : '+'}${Math.abs(pick.c2)}`;
    questions.push(`若 $|${eq1}|+(${eq2})^2=0$，求點 $P(a,b)$ 到 $x$ 軸的距離。`);
    answers.push(
      `由非負性質可知 ${eq1}=0 且 ${eq2}=0。解此聯立方程式可得 $a=${fractionToLatex(aVal, true)},\\ b=${fractionToLatex(bVal, true)}$。點 $P(a,b)$ 到 $x$ 軸的距離是 $|b|=${fractionToLatex(axisDist, true)}$。`
    );
  }

  return { questions, answers };
}

  function formatAxByEq(a, b, c) {
    const xTerm = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    const yAbs = Math.abs(b);
    const yTerm = yAbs === 1 ? 'y' : `${yAbs}y`;
    return `${xTerm}${b >= 0 ? '+' : '-'}${yTerm}=${c}`;
  }

  function formatSlopeTerm(m, variable = 'x') {
    if (m === 1) return variable;
    if (m === -1) return `-${variable}`;
    return `${m}${variable}`;
  }

  function formatLineSlopeIntercept(m, b) {
    const slopePart = formatSlopeTerm(m, 'x');
    if (b === 0) return `y=${slopePart}`;
    return `y=${slopePart}${b > 0 ? '+' : ''}${b}`;
  }

  function formatSignedConstant(value) {
    if (value === 0) return '';
    return `${value > 0 ? '+' : ''}${value}`;
  }

  function formatAxByPlusConstZero(a, b, k) {
    const xTerm = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    const yAbs = Math.abs(b);
    const yTerm = yAbs === 1 ? 'y' : `${yAbs}y`;
    const cPart = k === 0 ? '' : `${k > 0 ? '+' : ''}${k}`;
    return `${xTerm}${b >= 0 ? '+' : '-'}${yTerm}${cPart}=0`;
  }

  function normalizeLine(a, b, c) {
    const g = gcd(gcd(Math.abs(a), Math.abs(b)), Math.abs(c));
    let na = a / g;
    let nb = b / g;
    let nc = c / g;
    if (na < 0 || (na === 0 && nb < 0)) {
      na *= -1;
      nb *= -1;
      nc *= -1;
    }
    return { a: na, b: nb, c: nc };
  }

  function lineThroughPointsStd(x1, y1, x2, y2) {
    const a = y1 - y2;
    const b = x2 - x1;
    const c = a * x1 + b * y1;
    return normalizeLine(a, b, c);
  }

  function buildJ222PointLineRelationSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const a = [2, 3, 4, 5][randInt(0, 3)];
        const b = [1, 2, 3, 4][randInt(0, 3)];
        const y0 = randInt(-4, 4);
        const m = randInt(-5, 5);
        const c = a * m + b * y0;
        questions.push(`若點 $(m,${y0})$ 在直線 $${formatAxByEq(a, b, c)}$ 上，求 $m$ 的值。`);
        answers.push(
          `點在直線上，表示把坐標代入方程式後等號一定成立，所以可列 $${a}m${b * y0 >= 0 ? '+' : ''}${b * y0}=${c}$。整理可得 $m=${m}$。`
        );
        continue;
      }

      if (variant === 1) {
        const p = [2, 3, 4][randInt(0, 2)];
        const q = [-5, -4, -3][randInt(0, 2)];
        const aValue = [1, 2, 3, 4][randInt(0, 3)];
        const r = (p - q) * aValue;
        questions.push(`若點 $(${p}a,${q}a+${r})$ 在直線 $x=y$ 上，求 $a$ 的值。`);
        answers.push(
          `在直線 $x=y$ 上，表示橫坐標與縱坐標相等，所以可列 $${p}a=${q}a+${r}$。移項得 $${p - q}a=${r}$，所以 $a=${aValue}$。`
        );
        continue;
      }

      const a = [1, 2, 3, 4][randInt(0, 3)];
      const b = [1, 2, 3, 5][randInt(0, 3)];
      const c0 = randInt(-8, 8);
      const k = c0;
      questions.push(`若方程式 $${formatTwoVarExpr(a, -b, c0)}-k=0$ 的圖形通過原點 $(0,0)$，求 $k$ 的值。`);
      answers.push(`圖形通過原點表示把 $(0,0)$ 代入後要成立，所以原式變成 $${c0}-k=0$，因此 $k=${k}$。`);
    }

    return { questions, answers };
  }

  function buildJ222InterceptAreaSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const templates = [
          { xInt: 2, yInt: 3 },
          { xInt: 3, yInt: 4 },
          { xInt: 4, yInt: 5 },
          { xInt: 5, yInt: 6 },
          { xInt: 6, yInt: 4 },
          { xInt: 8, yInt: 3 },
          { xInt: 9, yInt: 2 },
          { xInt: 10, yInt: 3 },
          { xInt: 12, yInt: 2 },
          { xInt: 7, yInt: 4 },
        ];
        const pick = templates[cycle % templates.length];
        const xInt = pick.xInt;
        const yInt = pick.yInt;
        const a = yInt;
        const b = xInt;
        const c = xInt * yInt;
        const area = (xInt * yInt) / 2;
        questions.push(`求直線 $${formatAxByEq(a, b, c)}$ 與兩坐標軸的交點座標，並求其圍成的三角形面積。`);
        answers.push(
          `令 $y=0$，得 $${a}x=${c}$，所以與 $x$ 軸交於 $(${xInt},0)$；令 $x=0$，得 $${b}y=${c}$，所以與 $y$ 軸交於 $(0,${yInt})$。因此與坐標軸圍成的三角形面積為 $\\frac{1}{2}\\times ${xInt}\\times ${yInt}=${area}$。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { a: 3, b: 2 },
          { a: 4, b: 3 },
          { a: 5, b: 4 },
          { a: 6, b: 2 },
          { a: 8, b: 3 },
          { a: 9, b: 4 },
          { a: 10, b: 5 },
          { a: 12, b: 3 },
          { a: 14, b: 2 },
          { a: 15, b: 4 },
        ];
        const pick = templates[cycle % templates.length];
        const a = pick.a;
        const b = pick.b;
        const area = (a * b) / 2;
        questions.push(
          `若直線 $\\frac{x}{a}+\\frac{y}{${b}}=1$ 的圖形與兩軸所圍成的三角形面積為 ${area}，且直線不通過第四象限，求 $a$ 的值。`
        );
        answers.push(
          `這條直線的截距是 $(a,0)$ 與 $(0,${b})$，所以三角形面積是 $\\frac{1}{2}\\times |a|\\times ${b}=${area}$，可得 $|a|=${a}$。又題目說不通過第四象限，表示 $x$ 截距要為正，因此 $a=${a}$。`
        );
        continue;
      }

      const templates = [
        { m: 1, b: 3 },
        { m: 1, b: 4 },
        { m: 1, b: 5 },
        { m: 2, b: 4 },
        { m: 2, b: 6 },
        { m: 3, b: 6 },
        { m: 2, b: 8 },
        { m: 3, b: 9 },
        { m: 4, b: 8 },
        { m: 5, b: 10 },
      ];
      const pick = templates[cycle % templates.length];
      const m = pick.m;
      const b = pick.b;
      const xInt = b / m;
      const area = (xInt * b) / 2;
      questions.push(`方程式 $y=-${m}x+${b}$ 與兩軸交於 $P,Q$ 兩點，求 $\\triangle POQ$（$O$ 為原點）的面積。`);
      answers.push(
        `令 $x=0$，得 $y=${b}$，所以一個截距點是 $(0,${b})$；令 $y=0$，得 $x=${xInt}$，另一個截距點是 $(${xInt},0)$。因此 $\\triangle POQ$ 的面積為 $\\frac{1}{2}\\times ${xInt}\\times ${b}=${area}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ222QuadrantExclusionSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        questions.push(`已知 $a<0$，則一次函數 $f(x)=ax+5$ 的圖形不通過第幾象限？`);
        answers.push(
          `因為斜率 $a<0$，圖形往右下降，且截距是 5，所以直線會經過第一、第二、第四象限，不會通過第三象限。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(`若 $ab>0$ 且 $a+b<0$，則直線 $ax+by+1=0$ 不通過第幾象限？`);
        answers.push(
          `由 $ab>0$ 且 $a+b<0$ 可知 $a,b$ 都是負數。把式子改寫成 $y=-\\frac{a}{b}x-\\frac{1}{b}$，可知斜率為負、截距為正，因此圖形經過第一、第二、第四象限，不通過第三象限。`
        );
        continue;
      }

      questions.push(`方程式 $y=ax+b$ 的圖形通過第一、三、四象限，則方程式 $y=ax-b$ 不通過第幾象限？`);
      answers.push(
        `原直線通過第一、三、四象限，表示斜率 $a>0$ 且截距 $b<0$。因此 $y=ax-b$ 其實是正斜率、正截距的直線，會經過第一、第二、第三象限，不通過第四象限。`
      );
    }

    return { questions, answers };
  }

  function buildJ222ParallelPerpendicularSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const x0 = randInt(-6, 6);
        const y0 = randInt(-6, 6);
        questions.push(`寫出通過點 $(${x0},${y0})$ 且平行 $y$ 軸的直線方程式。`);
        answers.push(`平行 $y$ 軸的直線是鉛直線，所有點的 $x$ 坐標都相同，所以方程式是 $x=${x0}$。`);
        continue;
      }

      if (variant === 1) {
        const x1 = randInt(-6, 0);
        const x2 = randInt(1, 8);
        const y = randInt(-5, 5);
        questions.push(`直線通過點 $(${x1},${y})$ 與 $(${x2},${y})$ 兩點，求此直線方程式。`);
        answers.push(`兩點的 $y$ 坐標相同，表示這是一條水平線，所以方程式是 $y=${y}$。`);
        continue;
      }

      if (variant === 2) {
        const x = randInt(-6, 6);
        const y = makeFraction(randInt(-7, 7), 2);
        questions.push(`通過點 $(${x},${fractionToLatex(y)})$ 且垂直 $y$ 軸的直線方程式為何？`);
        answers.push(`垂直 $y$ 軸就是平行 $x$ 軸，這是一條水平線，所以方程式是 $y=${fractionToLatex(y)}$。`);
        continue;
      }

      const x = randInt(-5, 5);
      const y1 = randInt(-6, 0);
      const y2 = randInt(1, 7);
      questions.push(`直線通過點 $(${x},${y1})$ 與 $(${x},${y2})$ 兩點，求此直線方程式。`);
      answers.push(`兩點的 $x$ 坐標相同，表示這是一條鉛直線，所以方程式是 $x=${x}$。`);
    }

    return { questions, answers };
  }

  function buildJ222LineFromPointsSet(count) {
    const questions = [];
    const answers = [];

    function findPointsForFixedLine(a, b) {
      const pts = [];
      for (let x = -5; x <= 5; x += 1) {
        const remain = 3 - a * x;
        if (remain % b !== 0) continue;
        const y = remain / b;
        pts.push({ x, y });
      }
      return pts;
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const m = pickNonZero(-3, 3);
        const b = randInt(-5, 5);
        const x1 = randInt(-3, 1);
        const x2 = x1 + randInt(2, 4);
        const y1 = m * x1 + b;
        const y2 = m * x2 + b;
        questions.push(`若直線 $y=ax+b$ 通過點 $(${x1},${y1})$ 與 $(${x2},${y2})$，求此直線方程式。`);
        answers.push(
          `把兩點代入 $y=ax+b$，可列聯立方程式 $${formatSystemLatex(`${x1}a+b=${y1}`, `${x2}a+b=${y2}`)}$。相減可得 $a=${m}$，再代回得 $b=${b}$，所以直線方程式是 $${formatLineSlopeIntercept(m, b)}$。`
        );
        continue;
      }

      if (variant === 1) {
        let a = 1;
        let b = 1;
        let pts = [];
        while (pts.length < 2) {
          a = pickNonZero(-3, 3);
          b = pickNonZero(-3, 3);
          if (gcd(Math.abs(a), Math.abs(b)) !== 1 && gcd(Math.abs(a), Math.abs(b)) !== 3) continue;
          pts = findPointsForFixedLine(a, b).filter((p) => !(p.x === 0 && p.y === 0));
        }
        const p1 = pts[randInt(0, pts.length - 1)];
        let p2 = pts[randInt(0, pts.length - 1)];
        while (p2.x === p1.x && p2.y === p1.y) p2 = pts[randInt(0, pts.length - 1)];
        questions.push(
          `已知直線 $ax+by=3$ 通過點 $(${p1.x},${p1.y})$ 與 $(${p2.x},${p2.y})$，求 $a,b$ 的值與完整的直線方程式。`
        );
        answers.push(
          `把兩點代入 $ax+by=3$，可列聯立方程式 $${formatSystemLatex(`${p1.x}a${p1.y >= 0 ? '+' : ''}${p1.y}b=3`, `${p2.x}a${p2.y >= 0 ? '+' : ''}${p2.y}b=3`)}$。解得 $a=${a},\\ b=${b}$，所以直線方程式是 $${formatAxByEq(a, b, 3)}$。`
        );
        continue;
      }

      const x1 = randInt(-4, 2);
      const y1 = randInt(-6, 4);
      const x2 = x1 + randInt(2, 5);
      const y2 = y1 + pickNonZero(-5, 5);
      const line = lineThroughPointsStd(x1, y1, x2, y2);
      questions.push(`求通過點 $(${x1},${y1})$ 與 $(${x2},${y2})$ 兩點的直線方程式。`);
      answers.push(
        `設直線為一般式。由兩點可先求方向，再整理成標準型。計算可得這條直線的方程式是 $${formatAxByEq(line.a, line.b, line.c)}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ222TwoQuadrantsSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const p = [4, 5, 6, 7][randInt(0, 3)];
        const q = [8, 9, 10, 11][randInt(0, 3)];
        questions.push(`已知線型函數 $f(x)=ax+${p}-${q}x+a$ 的圖形只通過兩個象限，求 $a$ 的值。`);
        answers.push(
          `先化簡為 $y=(a-${q})x+(a+${p})$。若這是一條斜直線且只通過兩個象限，就必須通過原點，所以截距要是 0，可得 $a+${p}=0$，所以 $a=-${p}$。此外，若斜率為 0，就會變成水平線，也只會通過上方或下方兩個象限，因此還有 $a-${q}=0$，得 $a=${q}$。所以 $a$ 的值有 $-${p}$ 或 $${q}$。`
        );
        continue;
      }

      if (variant === 1) {
        const x = [1, 2, 3][randInt(0, 2)];
        const m = [1, 2, 3][randInt(0, 2)];
        const y = m * x;
        questions.push(`若直線 $L$ 只通過第一、三象限且經過點 $(${x},${y})$，求其方程式。`);
        answers.push(
          `只通過第一、三象限的直線必須通過原點，且斜率為正。又因為通過 $(${x},${y})$，斜率是 $\\frac{${y}}{${x}}=${m}$，所以直線方程式是 $${formatLineSlopeIntercept(m, 0)}$。`
        );
        continue;
      }

      if (variant === 2) {
        const x = -[2, 3, 4][randInt(0, 2)];
        const mNum = [2, 3, 4][randInt(0, 2)];
        const mDen = [1, 2, 3][randInt(0, 2)];
        const y = (Math.abs(x) * mNum) / mDen;
        if (!Number.isInteger(y)) {
          i -= 1;
          continue;
        }
        const g = gcd(Math.abs(y), Math.abs(x));
        const rise = Math.abs(y) / g;
        const run = Math.abs(x) / g;
        questions.push(`若直線 $L$ 只通過第二、四象限且經過點 $(${x},${y})$，求其方程式。`);
        answers.push(
          `只通過第二、四象限的直線必須通過原點，且斜率為負。由點 $(${x},${y})$ 與原點可求斜率為 $\\frac{${y}}{${x}}=-\\frac{${rise}}{${run}}$，所以方程式可寫成 $y=-\\frac{${rise}}{${run}}x$，也可整理成 $${rise}x+${run}y=0$。`
        );
        continue;
      }

      questions.push(`若直線 $L$ 只通過第一、二象限且經過點 $(-3,7)$，求其方程式。`);
      answers.push(
        `只通過第一、二象限表示這條直線必須是位於 $x$ 軸上方的水平線，所以 $y$ 坐標固定。又因為通過點 $(-3,7)$，所以方程式是 $y=7$。`
      );
    }

    return { questions, answers };
  }

  function buildJ222TranslationLineSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const p = randInt(2, 6);
        const xNew = -2 + p;
        const aValue = simplifyFraction(23 - 2 * xNew - 3, 3);
        const aText = fractionToLatex(aValue, true);
        questions.push(
          `在坐標平面上，將點 $(-2,1)$ 向右平移 ${p} 單位，再向上平移 $a$ 單位，若新點落在直線 $2x+3y=23$ 上，求 $a$。`
        );
        answers.push(
          `平移後新點是 $(${xNew},1+a)$。代入直線方程式可得 $2\\times ${xNew}+3(1+a)=23$，即 $2\\times ${xNew}+3+3a=23$，所以 $3a=${20 - 2 * xNew}$，解得 $a=${aText}$。`
        );
        continue;
      }

      if (variant === 1) {
        const m = pickNonZero(-3, 3);
        const b = randInt(-6, 6);
        const down = randInt(2, 5);
        const right = randInt(1, 4);
        const newB = b - down - m * right;
        questions.push(
          `將直線 $${formatLineSlopeIntercept(m, b)}$ 向下平移 ${down} 單位，再向右平移 ${right} 單位，求所得新直線方程式。`
        );
        answers.push(
          `設新直線上的點為 $(x,y)$，則在原直線上對應的點是 $(x-${right},y+${down})$。代入原式：$y+${down}=${formatSlopeTerm(m, `(x-${right})`)}${formatSignedConstant(b)}$，整理得 $${formatLineSlopeIntercept(m, newB)}$。`
        );
        continue;
      }

      const a = [1, 2, 3, 4][randInt(0, 3)];
      const b = [1, 2, 3, 4][randInt(0, 3)];
      const right = b;
      const down = a;
      const c = randInt(6, 18);
      questions.push(
        `若點在直線 $${formatAxByEq(a, b, c)}$ 上向右移 ${right} 單位，則還要向下移多少單位，該點才會仍落在原來的直線上？`
      );
      answers.push(
        `設原點是 $(x,y)$。向右移 ${right} 單位後，左式會多出 ${a}×${right}=${a * right}；若再向下移 $t$ 單位，因為 $y$ 減少 $t$，左式會少掉 $${b}t$。要讓方程式仍成立，就要 $${a * right}-${b}t=0$，因此 $t=${down}$。所以要向下移 ${down} 單位。`
      );
    }

    return { questions, answers };
  }

  function buildJ222TwoLinesAreaSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const templates = [
          { a: 1, d: 2 },
          { a: 1, d: 3 },
          { a: 2, d: 2 },
          { a: 2, d: 3 },
          { a: 3, d: 2 },
          { a: 3, d: 3 },
          { a: 4, d: 2 },
          { a: 4, d: 3 },
          { a: 5, d: 2 },
          { a: 2, d: 4 },
        ];
        const pick = templates[cycle % templates.length];
        const a = pick.a;
        const d = pick.d;
        const c = a * d;
        const area = d * c;
        questions.push(`求兩直線 $${formatAxByEq(a, 1, c)}$ 與 $${formatAxByEq(a, -1, -c)}$ 和 $x$ 軸所圍成區域面積。`);
        answers.push(
          `兩直線交點在 $(0,${c})$；與 $x$ 軸交點分別為 $(${d},0)$、$(-${d},0)$。因此底長是 ${2 * d}，高是 ${c}，面積為 $\\frac{1}{2}\\times ${2 * d}\\times ${c}=${area}$。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { px: 2, py: 2, up: 3, down: 2 },
          { px: 3, py: 4, up: 4, down: 3 },
          { px: 4, py: 6, up: 5, down: 4 },
          { px: 3, py: 2, up: 5, down: 2 },
          { px: 2, py: 4, up: 4, down: 2 },
          { px: 4, py: 2, up: 6, down: 3 },
          { px: 5, py: 4, up: 3, down: 2 },
          { px: 3, py: 6, up: 4, down: 4 },
        ];
        const pick = templates[cycle % templates.length];
        const px = pick.px;
        const py = pick.py;
        const y1 = py + pick.up;
        const y2 = py - pick.down;
        const l1 = lineThroughPointsStd(0, y1, px, py);
        const l2 = lineThroughPointsStd(0, y2, px, py);
        const area = (px * (y1 - y2)) / 2;
        questions.push(
          `求兩直線 $${formatAxByEq(l1.a, l1.b, l1.c)}$ 與 $${formatAxByEq(l2.a, l2.b, l2.c)}$ 和 $y$ 軸所圍成區域面積。`
        );
        answers.push(
          `兩直線交點是 $(${px},${py})$，與 $y$ 軸交點分別是 $(0,${y1})$、$(0,${y2})$。因此底長是 ${y1 - y2}，高是 ${px}，面積為 $\\frac{1}{2}\\times ${y1 - y2}\\times ${px}=${area}$。`
        );
        continue;
      }

      const templates = [
        { px: 1, py: 3, left: 2, right: 3 },
        { px: 2, py: 4, left: 3, right: 2 },
        { px: 3, py: 6, left: 4, right: 3 },
        { px: 2, py: 3, left: 2, right: 4 },
        { px: 1, py: 4, left: 3, right: 4 },
        { px: 3, py: 4, left: 3, right: 3 },
        { px: 2, py: 6, left: 4, right: 2 },
        { px: 4, py: 3, left: 2, right: 5 },
      ];
      const pick = templates[cycle % templates.length];
      const px = pick.px;
      const py = pick.py;
      const x1 = px - pick.left;
      const x2 = px + pick.right;
      const l1 = lineThroughPointsStd(px, py, x1, 0);
      const l2 = lineThroughPointsStd(px, py, x2, 0);
      const area = ((x2 - x1) * py) / 2;
      questions.push(
        `已知 $L_1:${formatAxByEq(l1.a, l1.b, l1.c)}$ 與 $L_2:${formatAxByEq(l2.a, l2.b, l2.c)}$ 交於點 $A$，且分別交 $x$ 軸於 $B,C$，求 $\\triangle ABC$ 面積。`
      );
      answers.push(
        `由題意可知交點 $A=(${px},${py})$，而 $B,C$ 在 $x$ 軸上，座標分別是 $(${x1},0)$、$(${x2},0)$。因此 $\\overline{BC}$ 長為 ${x2 - x1}$，高為 ${py}$，所以 $\\triangle ABC$ 面積為 $\\frac{1}{2}\\times ${x2 - x1}\\times ${py}=${area}$。`
      );
    }

    return { questions, answers };
  }

  function appendSignedExprPart(parts, text, negative) {
    if (!text) return;
    if (!parts.length) {
      parts.push(negative ? `-${text}` : text);
      return;
    }
    parts.push(`${negative ? '-' : '+'}${text}`);
  }

  function formatTwoVarExpr(ax, by, c = 0) {
    const parts = [];
    if (ax !== 0) {
      const absAx = Math.abs(ax);
      appendSignedExprPart(parts, absAx === 1 ? 'x' : `${absAx}x`, ax < 0);
    }
    if (by !== 0) {
      const absBy = Math.abs(by);
      appendSignedExprPart(parts, absBy === 1 ? 'y' : `${absBy}y`, by < 0);
    }
    if (c !== 0) {
      appendSignedExprPart(parts, `${Math.abs(c)}`, c < 0);
    }
    return parts.join('') || '0';
  }

  function buildJ2ContextEquationSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const count100 = randInt(3, 12);
        const count10 = randInt(4, 15);
        questions.push(`錢包內有 $x$ 張佰元鈔票與 $y$ 個拾元硬幣，總共有多少元？請用 $x,y$ 列出代數式。`);
        answers.push(`一張佰元鈔票是 100 元，一個拾元硬幣是 10 元，所以總金額可記成 $100x+10y$。`);
        continue;
      }

      if (variant === 1) {
        const full = randInt(120, 260);
        const half = randInt(60, 140);
        questions.push(
          `阿里山全票一張 ${full} 元、半票一張 ${half} 元，若買了 $x$ 張全票與 $y$ 張半票，共需多少錢？請用 $x,y$ 列出代數式。`
        );
        answers.push(`全票總價是 $${full}x$，半票總價是 $${half}y$，所以總金額可記成 $${full}x+${half}y$。`);
        continue;
      }

      if (variant === 2) {
        const onePrice = [10, 12, 15][randInt(0, 2)];
        const anotherPrice = [18, 20, 25][randInt(0, 2)];
        const itemA = ['手工餅乾', '蔥油餅', '車輪餅'][randInt(0, 2)];
        const itemB = ['泡芙', '奶茶', '豆花'][randInt(0, 2)];
        questions.push(
          `${itemA}每份 ${onePrice} 元，${itemB}每份 ${anotherPrice} 元。若買了 $x$ 份${itemA}與 $y$ 份${itemB}，共需多少錢？請用 $x,y$ 列出代數式。`
        );
        answers.push(
          `${itemA}總價是 $${onePrice}x$，${itemB}總價是 $${anotherPrice}y$，所以總金額可記成 $${onePrice}x+${anotherPrice}y$。`
        );
        continue;
      }

      if (variant === 3) {
        const tens = randInt(1, 8);
        const ones = randInt(1, 9);
        questions.push(`若一個兩位數的十位數字是 $x$、個位數字是 $y$，請用 $x,y$ 列出這個兩位數的代數式。`);
        answers.push(`十位數字代表 $10x$，個位數字代表 $y$，所以這個兩位數可記成 $10x+y$。`);
        continue;
      }

      const fixedFee = randInt(2, 8) * 10;
      const rose = randInt(20, 50);
      const lily = randInt(40, 80);
      questions.push(
        `花店包裝一束花，玫瑰每枝 ${rose} 元、百合每枝 ${lily} 元，另加包裝費 ${fixedFee} 元。若用了 $x$ 枝玫瑰與 $y$ 枝百合，總價應記成什麼代數式？`
      );
      answers.push(
        `玫瑰總價是 $${rose}x$，百合總價是 $${lily}y$，再加上包裝費 ${fixedFee} 元，所以總價可記成 $${rose}x+${lily}y+${fixedFee}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ2ClassifySet(count) {
    const questions = [];
    const answers = [];
    const parameterNames = ['a', 'b', 'm', 'n'];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const expr = formatTwoVarExpr(pickNonZero(-8, 8), pickNonZero(-8, 8), randInt(-9, 9));
        questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
        answers.push(`$${expr}$ 沒有等號，且只含 $x,y$ 的一次項，所以它是二元一次式。`);
        continue;
      }

      if (variant === 1) {
        const expr = formatTwoVarExpr(pickNonZero(-8, 8), pickNonZero(-8, 8), 0);
        const rhs = randInt(-12, 12);
        questions.push(`判斷：$${expr}=${rhs}$ 是二元一次式、二元一次方程式，還是都不是？`);
        answers.push(`$${expr}=${rhs}$ 有等號，而且 $x,y$ 都只出現一次，所以它是二元一次方程式。`);
        continue;
      }

      if (variant === 2) {
        const expr = `${pickNonZero(1, 6)}x^2${pickNonZero(-6, 6) >= 0 ? '+' : ''}${pickNonZero(-6, 6)}y`;
        questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
        answers.push(`它含有 $x^2$，已經不是一次，所以不屬於二元一次式，也不是二元一次方程式。`);
        continue;
      }

      if (variant === 3) {
        const expr = `${pickNonZero(1, 5)}xy${pickNonZero(-6, 6) >= 0 ? '+' : ''}${pickNonZero(-6, 6)}x${pickNonZero(-9, 9) >= 0 ? '+' : ''}${randInt(-9, 9)}`;
        questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
        answers.push(`它含有 $xy$，出現兩個未知數相乘，所以不是二元一次式，也不是二元一次方程式。`);
        continue;
      }

      const name = parameterNames[i % parameterNames.length];
      const expr = `${pickNonZero(1, 6)}x+${name}`;
      questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
      answers.push(`它只有一個未知數 $x$，${name} 在這裡是參數，不是第二個未知數，所以不算二元一次式。`);
    }

    return { questions, answers };
  }

  function buildJ2ExpressionSimplifySet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const terms = [];
      let xCoef = 0;
      let yCoef = 0;
      let constant = 0;
      const termCount = randInt(5, 7);
      let hasY = false;
      let hasConstant = false;

      for (let j = 0; j < termCount; j += 1) {
        const type = j < 2 ? (j === 0 ? 'x' : 'y') : ['x', 'y', 'c'][randInt(0, 2)];
        if (type === 'x') {
          const coef = pickNonZero(-8, 8);
          terms.push(coef === 1 ? 'x' : coef === -1 ? '-x' : `${coef}x`);
          xCoef += coef;
        } else if (type === 'y') {
          const coef = pickNonZero(-8, 8);
          terms.push(coef === 1 ? 'y' : coef === -1 ? '-y' : `${coef}y`);
          yCoef += coef;
          hasY = true;
        } else {
          const value = pickNonZero(-9, 9);
          terms.push(`${value}`);
          constant += value;
          hasConstant = true;
        }
      }

      if (!hasY) {
        const coef = pickNonZero(-6, 6);
        terms.push(coef === 1 ? 'y' : coef === -1 ? '-y' : `${coef}y`);
        yCoef += coef;
      }
      if (!hasConstant) {
        const value = pickNonZero(-8, 8);
        terms.push(`${value}`);
        constant += value;
      }

      const questionExpr = terms.reduce((acc, term, index) => {
        if (index === 0) return term;
        return `${acc}${term.startsWith('-') ? '' : '+'}${term}`;
      }, '');
      questions.push(`化簡：$${questionExpr}$。`);
      answers.push(`把 $x$ 項、$y$ 項與常數項分別合併，可得 $${formatTwoVarExpr(xCoef, yCoef, constant)}$。`);
    }

    return { questions, answers };
  }

  function buildJ2DistributeExpandSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const k = pickNonZero(-8, 8);
        const a = pickNonZero(-5, 5);
        const b = pickNonZero(-5, 5);
        const c = pickNonZero(-6, 6);
        const inside = formatTwoVarExpr(a, b, c);
        const result = formatTwoVarExpr(k * a, k * b, k * c);
        questions.push(`化簡：$${k}(${inside})$。`);
        answers.push(`利用分配律把 ${k} 乘進去，得 $${result}$。`);
        continue;
      }

      if (variant === 1) {
        const k = -pickNonZero(2, 8);
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-4, 4);
        const c = pickNonZero(-6, 6);
        const inside = formatTwoVarExpr(a, b, c);
        const result = formatTwoVarExpr(k * a, k * b, k * c);
        questions.push(`化簡：$${k}(${inside})$。`);
        answers.push(`括號前是負數，分配後每一項都要變號，所以 $${k}(${inside})=${result}$。`);
        continue;
      }

      const k1 = pickNonZero(2, 6);
      const k2 = pickNonZero(2, 6);
      const a1 = pickNonZero(-4, 4);
      const b1 = pickNonZero(-4, 4);
      const c1 = pickNonZero(-5, 5);
      const a2 = pickNonZero(-4, 4);
      const b2 = pickNonZero(-4, 4);
      const c2 = pickNonZero(-5, 5);
      const first = `${k1}(${formatTwoVarExpr(a1, b1, c1)})`;
      const second = `${k2}(${formatTwoVarExpr(a2, b2, c2)})`;
      const result = formatTwoVarExpr(k1 * a1 + k2 * a2, k1 * b1 + k2 * b2, k1 * c1 + k2 * c2);
      const expandedFirst = formatTwoVarExpr(k1 * a1, k1 * b1, k1 * c1);
      const expandedSecond = formatTwoVarExpr(k2 * a2, k2 * b2, k2 * c2);
      questions.push(`化簡：$${first}${expandedSecond.startsWith('-') ? '' : '+'}${second}$。`);
      answers.push(
        `先分別展開兩個括號：$${first}+${second}=${expandedFirst}${expandedSecond.startsWith('-') ? '' : '+'}${expandedSecond}$，再合併同類項得 $${result}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ2EvaluateExpressionSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const xValue = randInt(-5, 5);
      const yValue = randInt(-5, 5);
      const a = pickNonZero(-9, 9);
      const b = pickNonZero(-9, 9);
      const c = randInt(-9, 9);
      const expr = formatTwoVarExpr(a, b, c);
      const result = a * xValue + b * yValue + c;
      questions.push(`當 $x=${xValue},\\ y=${yValue}$ 時，求 $${expr}$ 的值。`);
      answers.push(
        `把 $x=${xValue},\\ y=${yValue}$ 代入，可得 $${a}\\times(${xValue})${b >= 0 ? '+' : ''}${b}\\times(${yValue})${c >= 0 ? '+' : ''}${c}=${result}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ2FractionSimplifySet(count) {
    const questions = [];
    const answers = [];
    const denominatorPairs = [
      [3, 4],
      [3, 5],
      [4, 5],
      [2, 3],
      [2, 5],
    ];

    const gcdMany = (values) => values.reduce((acc, value) => gcd(acc, Math.abs(value)), 0);

    for (let i = 0; i < count; i += 1) {
      const [d1, d2] = denominatorPairs[i % denominatorPairs.length];
      const l = lcm(d1, d2);
      const a1 = pickNonZero(-4, 4);
      const b1 = pickNonZero(-4, 4);
      const c1 = randInt(-6, 6);
      const a2 = pickNonZero(-4, 4);
      const b2 = pickNonZero(-4, 4);
      const c2 = randInt(-6, 6);
      const usePlus = i % 2 === 0;
      let numX = a1 * (l / d1) + (usePlus ? 1 : -1) * a2 * (l / d2);
      let numY = b1 * (l / d1) + (usePlus ? 1 : -1) * b2 * (l / d2);
      let numC = c1 * (l / d1) + (usePlus ? 1 : -1) * c2 * (l / d2);
      let den = l;
      const g = gcdMany([numX, numY, numC, den]);
      if (g > 1) {
        numX /= g;
        numY /= g;
        numC /= g;
        den /= g;
      }
      const left = `\\frac{${formatTwoVarExpr(a1, b1, c1)}}{${d1}}`;
      const right = `\\frac{${formatTwoVarExpr(a2, b2, c2)}}{${d2}}`;
      const numerator = formatTwoVarExpr(numX, numY, numC);
      const result = den === 1 ? formatTwoVarExpr(numX, numY, numC) : `\\frac{${numerator}}{${den}}`;
      questions.push(`化簡：$${left}${usePlus ? '+' : '-'}${right}$。`);
      answers.push(
        `先通分成分母都是 $${l}$：$${left}${usePlus ? '+' : '-'}${right}=\\frac{${formatTwoVarExpr(a1 * (l / d1), b1 * (l / d1), c1 * (l / d1))}}{${l}}${usePlus ? '+' : '-'}\\frac{${formatTwoVarExpr(a2 * (l / d2), b2 * (l / d2), c2 * (l / d2))}}{${l}}$。合併分子後得 $${result}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ2OrderedPairCheckSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const xValue = randInt(-4, 6);
      const yValue = randInt(-4, 6);
      const ax = pickNonZero(-5, 5);
      const by = pickNonZero(-5, 5);
      const isValid = i % 2 === 0;
      const rhs = ax * xValue + by * yValue + (isValid ? 0 : pickNonZero(-6, 6));
      const equation = `${formatTwoVarExpr(ax, by)}=${rhs}`;
      questions.push(`檢查數對 $(x,y)=(${xValue},${yValue})$ 是否為方程式 $${equation}$ 的解。`);
      const leftValue = ax * xValue + by * yValue;
      answers.push(
        `把 $(x,y)=(${xValue},${yValue})$ 代入左邊，可得 $${ax}\\times(${xValue})${by >= 0 ? '+' : ''}${by}\\times(${yValue})=${leftValue}$。${leftValue === rhs ? `因為左右兩邊都等於 ${rhs}，所以這組數對是解。` : `因為左邊等於 ${leftValue}，右邊是 ${rhs}，兩邊不相等，所以這組數對不是解。`}`
      );
    }

    return { questions, answers };
  }

  function buildJ2ParameterSubstitutionSet(count) {
    const questions = [];
    const answers = [];
    const names = ['a', 'b', 'm', 'n'];

    for (let i = 0; i < count; i += 1) {
      const name = names[i % names.length];
      const xValue = randInt(-4, 5);
      const yValue = randInt(-4, 5);
      if (yValue === 0) {
        i -= 1;
        continue;
      }
      const fixedCoef = pickNonZero(-6, 6);
      const paramValue = randInt(-8, 8);
      const rhs = fixedCoef * xValue + paramValue * yValue + randInt(-6, 6);
      const constant = rhs - fixedCoef * xValue - paramValue * yValue;
      const equation = `${formatLinearExpr(fixedCoef, constant)}+${name}y=${rhs}`;
      questions.push(`若 $(x,y)=(${xValue},${yValue})$ 是方程式 $${equation}$ 的解，求 ${name}。`);
      answers.push(
        `把 $(x,y)=(${xValue},${yValue})$ 代入，可得 $${fixedCoef === 1 ? '' : fixedCoef === -1 ? '-' : fixedCoef}${xValue}${constant >= 0 ? '+' : ''}${constant}+${name}(${yValue})=${rhs}$。整理後得到 $${yValue}${name}=${rhs - fixedCoef * xValue - constant}$，所以 ${name}=$${paramValue}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ2EquivalentTransformSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const leftAx = pickNonZero(-6, 6);
      const leftBy = pickNonZero(-6, 6);
      const leftC = pickNonZero(-9, 9);
      const rightAx = pickNonZero(-6, 6);
      const rightBy = pickNonZero(-6, 6);
      const rightC = pickNonZero(-9, 9);
      const finalAx = leftAx - rightAx;
      const finalBy = leftBy - rightBy;
      if (finalAx === 0 || finalBy === 0) {
        i -= 1;
        continue;
      }
      const finalC = rightC - leftC;
      const left = formatTwoVarExpr(leftAx, leftBy, leftC);
      const right = formatTwoVarExpr(rightAx, rightBy, rightC);
      questions.push(`把方程式 $${left}=${right}$ 整理成標準型 $Ax+By=C$。`);
      answers.push(
        `先把含 $x,y$ 的項移到左邊，常數移到右邊：$${left}=${right}\\Rightarrow ${formatTwoVarExpr(finalAx, finalBy)}=${finalC}$。所以標準型是 $${formatTwoVarExpr(finalAx, finalBy)}=${finalC}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ2IntegerConstraintSet(count) {
    const questions = [];
    const answers = [];
    const pairsCoPrime = [
      [2, 3],
      [2, 5],
      [3, 4],
      [3, 5],
      [4, 5],
      [5, 6],
    ];

    while (questions.length < count) {
      const [a, b] = pairsCoPrime[randInt(0, pairsCoPrime.length - 1)];
      const total = randInt(3, 7) * a * b;
      const pairs = [];
      for (let x = 0; x <= total; x += 1) {
        const remain = total - a * x;
        if (remain < 0) break;
        if (remain % b === 0) pairs.push([x, remain / b]);
      }
      if (pairs.length < 3 || pairs.length > 6) continue;
      questions.push(`求方程式 $${a}x+${b}y=${total}$ 的所有非負整數解。`);
      const pairText = pairs.map(([x, y]) => `(${x},${y})`).join('、');
      answers.push(
        `由 $${a}x+${b}y=${total}$ 可知 $y=\\frac{${total}-${a}x}{${b}}$。逐一檢查非負整數條件後，可得所有非負整數解為 $${pairText}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ2SolveForVariableSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-6, 6);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-12, 12);
      const equation = `${formatTwoVarExpr(a, b)}=${c}`;
      const xNumerator = `${c}${b > 0 ? '-' : '+'}${Math.abs(b)}y`;
      const yNumerator = `${c}${a > 0 ? '-' : '+'}${Math.abs(a)}x`;
      questions.push(`將方程式 $${equation}$ 分別整理成 $x=\\cdots$ 與 $y=\\cdots$。`);
      answers.push(
        `先整理成 $x$ 用 $y$ 表示：$${a}x=${c}${b > 0 ? '-' : '+'}${Math.abs(b)}y$，所以 $x=\\frac{${xNumerator}}{${a}}$。再整理成 $y$ 用 $x$ 表示：$${b}y=${c}${a > 0 ? '-' : '+'}${Math.abs(a)}x$，所以 $y=\\frac{${yNumerator}}{${b}}$。`
      );
    }

    return { questions, answers };
  }

  function formatSystemLatex(eq1, eq2) {
    return String.raw`\left\{\begin{array}{l}${eq1}\\${eq2}\end{array}\right.`;
  }

  function buildJ212SubstitutionBasicSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      let xValue = randInt(-3, 6);
      let yValue = randInt(-3, 6);

      if (variant === 0) {
        const k = pickNonZero(1, 4);
        const b = xValue - k * yValue;
        const eq1 = `x=${k}y${b >= 0 ? '+' : ''}${b}`;
        const a2 = pickNonZero(1, 4);
        const b2 = pickNonZero(1, 4);
        const c2 = a2 * xValue + b2 * yValue;
        if (a2 === k * b2) {
          i -= 1;
          continue;
        }
        const eq2 = `${a2}x+${b2}y=${c2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        answers.push(
          `由第一式得 $x=${k}y${b >= 0 ? '+' : ''}${b}$，代入第二式：$${a2}(${k}y${b >= 0 ? '+' : ''}${b})+${b2}y=${c2}$。解得 $y=${yValue}$，再代回得 $x=${xValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      if (variant === 1) {
        const d = randInt(-5, 5);
        yValue = xValue + d;
        const eq1 = `y=x${d >= 0 ? '+' : ''}${d}`;
        const a2 = pickNonZero(1, 4);
        const b2 = -pickNonZero(1, 4);
        if (a2 + b2 === 0) {
          i -= 1;
          continue;
        }
        const c2 = a2 * xValue + b2 * yValue;
        const eq2 = `${a2}x${b2 >= 0 ? '+' : ''}${b2}y=${c2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        answers.push(
          `由第一式得 $y=x${d >= 0 ? '+' : ''}${d}$，代入第二式：$${a2}x${b2 >= 0 ? '+' : ''}${b2}(x${d >= 0 ? '+' : ''}${d})=${c2}$。解得 $x=${xValue}$，再代回得 $y=${yValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      const a1 = pickNonZero(2, 5);
      const c1 = a1 * xValue - yValue;
      const eq1 = `${a1}x-y=${c1}`;
      const a2 = pickNonZero(1, 4);
      const b2 = pickNonZero(1, 4);
      if (a2 + b2 * a1 === 0) {
        i -= 1;
        continue;
      }
      const c2 = a2 * xValue + b2 * yValue;
      const eq2 = `${a2}x+${b2}y=${c2}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      answers.push(
        `先由第一式整理得 $y=${a1}x-${c1}$，代入第二式：$${a2}x+${b2}(${a1}x-${c1})=${c2}$。解得 $x=${xValue}$，再代回得 $y=${yValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, answers };
  }

  function buildJ212EliminationAdjustmentSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const xValue = randInt(-4, 6);
      const yValue = randInt(-4, 6);

      if (variant === 0) {
        const a = pickNonZero(1, 4);
        const b = pickNonZero(1, 4);
        const c1 = a * xValue + b * yValue;
        const c2 = a * xValue - b * yValue;
        const eq1 = `${a}x+${b}y=${c1}`;
        const eq2 = `${a}x-${b}y=${c2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        answers.push(
          `兩式中的 $x$ 係數相同，直接相減可消去 $x$：$${2 * b}y=${c1 - c2}$，所以 $y=${yValue}$。再代回任一式，得 $x=${xValue}$，因此 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      if (variant === 1) {
        const a1 = pickNonZero(1, 4);
        const b1 = pickNonZero(1, 4);
        const a2 = randInt(1, 4);
        const b2 = -pickNonZero(1, 4);
        const c1 = a1 * xValue + b1 * yValue;
        const c2 = a2 * xValue + b2 * yValue;
        const eq1 = `${a1}x+${b1}y=${c1}`;
        const eq2 = `${a2}x${b2 >= 0 ? '+' : ''}${b2}y=${c2}`;
        const factor = Math.abs(a1);
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        answers.push(
          `把第二式乘上 ${factor}，使兩式的 $x$ 係數對齊，再相減消去 $x$。整理後得 $y=${yValue}$，代回可得 $x=${xValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      const a1 = pickNonZero(2, 5);
      const a2 = pickNonZero(2, 5);
      const b1 = pickNonZero(1, 5);
      const b2 = -pickNonZero(1, 5);
      const c1 = a1 * xValue + b1 * yValue;
      const c2 = a2 * xValue + b2 * yValue;
      const l = lcm(Math.abs(a1), Math.abs(a2));
      const m1 = l / Math.abs(a1);
      const m2 = l / Math.abs(a2);
      const eq1 = `${a1}x${b1 >= 0 ? '+' : ''}${b1}y=${c1}`;
      const eq2 = `${a2}x${b2 >= 0 ? '+' : ''}${b2}y=${c2}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      answers.push(
        `先把兩式調整成 $x$ 的係數同為 ${l}$：第一式乘 ${m1}，第二式乘 ${m2}$。整理後再相減，可得到 $y=${yValue}$，再代回得 $x=${xValue}$，因此 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, answers };
  }

  function buildJ212FractionDecimalSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const xValue = [2, 4, 6][randInt(0, 2)];
        const yValue = [3, 6, 9][randInt(0, 2)];
        const rhs1 = xValue / 2 + yValue / 3;
        const rhs2 = xValue - yValue;
        const eq1 = String.raw`\frac{x}{2}+\frac{y}{3}=${rhs1}`;
        const eq2 = `x-y=${rhs2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        answers.push(
          `先把第一式同乘 6，得 $3x+2y=${rhs1 * 6}$；第二式是 $x-y=${rhs2}$。再用加減消去或代入求解，可得 $x=${xValue},\ y=${yValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      if (variant === 1) {
        const xValue = [2, 4, 6][randInt(0, 2)];
        const yValue = [2, 5, 8][randInt(0, 2)];
        const rhs1 = trimFixed(0.3 * xValue + 0.5 * yValue, 1);
        const rhs2 = trimFixed(0.1 * xValue + 0.4 * yValue, 1);
        const eq1 = `0.3x+0.5y=${rhs1}`;
        const eq2 = `0.1x+0.4y=${rhs2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        answers.push(
          `先把兩式同乘 10，化成整係數方程式：$3x+5y=${Number(rhs1) * 10}$、$x+4y=${Number(rhs2) * 10}$。再用代入或加減消去求解，可得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      const yValue = [1, 2, 4][randInt(0, 2)];
      const a = randInt(2, 5);
      const b = randInt(1, 4);
      const xValue = a + b;
      const eq1 = String.raw`\frac{x+y}{2}=${a}`;
      const eq2 = String.raw`\frac{x-y}{3}=${b}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      answers.push(
        `先把第一式乘 2、第二式乘 3，得 $x+y=${2 * a}$、$x-y=${3 * b}$。兩式相加可得 $2x=${2 * a + 3 * b}$，所以 $x=${xValue}$；再代回得 $y=${yValue}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ212SolutionTypeSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const a = pickNonZero(1, 7);
        const b = pickNonZero(1, 7);
        const c = pickNonZero(2, 20);
        const eq1 = `${a}x+${b}y=${c}`;
        const eq2 = `${2 * a}x+${2 * b}y=${2 * c}`;
        questions.push(`判斷聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 的解的情形。`);
        answers.push(
          `因為 $\\frac{${a}}{${2 * a}}=\\frac{${b}}{${2 * b}}=\\frac{${c}}{${2 * c}}=\\frac{1}{2}$，兩式其實表示同一直線，所以有無限多組解。`
        );
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(1, 7);
        const b = pickNonZero(1, 7);
        const c = pickNonZero(2, 20);
        const eq1 = `${a}x+${b}y=${c}`;
        const eq2 = `${a}x+${b}y=${c + pickNonZero(1, 6)}`;
        questions.push(`判斷聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 的解的情形。`);
        answers.push(`因為左邊完全相同，但右邊常數不同，所以兩條直線平行而不重合，因此無解。`);
        continue;
      }

      if (variant === 2) {
        const a = pickNonZero(1, 7);
        const b = pickNonZero(1, 7);
        const c = pickNonZero(2, 20);
        const scale = randInt(2, 6);
        const delta = pickNonZero(1, 6);
        const eq1 = `${a}x+${b}y=${c}`;
        const eq2 = `${a * scale}x+${b * scale}y=${c * scale + delta}`;
        questions.push(`判斷聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 的解的情形。`);
        answers.push(
          `前兩組係數比滿足 $\\frac{${a}}{${a * scale}}=\\frac{${b}}{${b * scale}}=\\frac{1}{${scale}}$，但常數比是 $\\frac{${c}}{${c * scale + delta}}$，與前兩者不同，因此兩條直線平行，屬於無解。`
        );
        continue;
      }

      if (variant === 3) {
        let a1 = pickNonZero(1, 7);
        let b1 = pickNonZero(1, 7);
        let a2 = pickNonZero(1, 7);
        let b2 = pickNonZero(1, 7);
        while (a1 * b2 === a2 * b1) {
          a2 = pickNonZero(1, 5);
          b2 = pickNonZero(1, 5);
        }
        const xValue = randInt(-3, 4);
        const yValue = randInt(-3, 4);
        const c1 = a1 * xValue + b1 * yValue;
        const c2 = a2 * xValue + b2 * yValue;
        const eq1 = `${a1}x+${b1}y=${c1}`;
        const eq2 = `${a2}x+${b2}y=${c2}`;
        questions.push(`判斷聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 的解的情形。`);
        answers.push(
          `因為 $\\frac{${a1}}{${a2}}$ 與 $\\frac{${b1}}{${b2}}$ 不相等，兩條直線一定相交，所以恰有一組解。`
        );
        continue;
      }

      const a = pickNonZero(2, 8);
      const b = pickNonZero(2, 8);
      const c = pickNonZero(2, 20);
      const ratioDen = randInt(2, 5);
      const scale = randInt(2, 5);
      const k = ratioDen * b;
      const eq1 = `${a}x+${b}y=${c}`;
      const eq2 = `${ratioDen * a}x+ky=${ratioDen * c}`;
      questions.push(`若聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 有無限多組解，求 $k$。`);
      answers.push(
        `若要有無限多組解，三組比值必須都相同。已知 $\\frac{${a}}{${ratioDen * a}}=\\frac{1}{${ratioDen}}$，所以要有 $\\frac{${b}}{k}=\\frac{1}{${ratioDen}}$，解得 $k=${k}$。同時常數比 $\\frac{${c}}{${ratioDen * c}}=\\frac{1}{${ratioDen}}$ 也一致，所以確實是無限多組解。`
      );
    }

    return { questions, answers };
  }

  function buildJ212TripleEqualSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const xValue = randInt(-3, 5);
      const yValue = randInt(-3, 5);
      const target = randInt(-5, 5);
      const a1 = pickNonZero(1, 5);
      const b1 = pickNonZero(1, 5);
      const c1 = target - a1 * xValue - b1 * yValue;
      const a2 = -pickNonZero(1, 4);
      const b2 = -pickNonZero(1, 4);
      const c2 = target - a2 * xValue - b2 * yValue;
      if (a1 * b2 === a2 * b1 && a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1) {
        i -= 1;
        continue;
      }
      const expr1 = formatTwoVarExpr(a1, b1, c1);
      const expr2 = formatTwoVarExpr(a2, b2, c2);
      const sys1 = `${a1}x${b1 >= 0 ? '+' : ''}${b1}y=${target - c1}`;
      const sys2 = `${a2}x${b2 >= 0 ? '+' : ''}${b2}y=${target - c2}`;
      questions.push(`求滿足 $${expr1}=${expr2}=${target}$ 的 $(x,y)$。`);
      answers.push(
        `把三個式子相等拆成兩個方程式：$${expr1}=${target}$ 與 $${expr2}=${target}$，可得聯立方程式 $${formatSystemLatex(sys1, sys2)}$。解得 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, answers };
  }

  function buildJ212SymmetricSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;
      const a = pickNonZero(2, 7);
      const b = pickNonZero(1, 6);

      if (variant === 0) {
        const xValue = randInt(-4, 6);
        const yValue = xValue;
        const total = (a + b) * xValue;
        const eq1 = `${a}x+${b}y=${total}`;
        const eq2 = `${b}x+${a}y=${total}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        answers.push(
          `兩式相減可得 $(${a - b})x-(${a - b})y=0$，所以 $x=y$。再代回任一式，得 $${a + b}x=${total}$，因此 $x=${xValue},\ y=${yValue}$。`
        );
        continue;
      }

      const xValue = randInt(-4, 6);
      const yValue = -xValue;
      const rhs1 = (a - b) * xValue;
      const rhs2 = (b - a) * xValue;
      const eq1 = `${a}x+${b}y=${rhs1}`;
      const eq2 = `${b}x+${a}y=${rhs2}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      answers.push(
        `兩式相加得 $(${a + b})x+(${a + b})y=0$，所以 $x+y=0$，即 $y=-x$。代回第一式可得 $x=${xValue},\ y=${yValue}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ212AbsZeroSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const xValue = randInt(-3, 5);
      const yValue = randInt(-3, 5);
      const a1 = pickNonZero(1, 4);
      const b1 = pickNonZero(1, 4);
      const c1 = -(a1 * xValue + b1 * yValue);
      const a2 = pickNonZero(1, 4);
      const b2 = -pickNonZero(1, 4);
      const c2 = -(a2 * xValue + b2 * yValue);
      const expr1 = formatTwoVarExpr(a1, b1, c1);
      const expr2 = formatTwoVarExpr(a2, b2, c2);
      if (variant === 0) {
        questions.push(`若 $|${expr1}|+|${expr2}|=0$，求 $(x,y)$。`);
        answers.push(
          `因為兩個絕對值都不會小於 0，而它們的和等於 0，所以兩個絕對值內部都必須等於 0。故可列成聯立方程式 $${formatSystemLatex(`${expr1}=0`, `${expr2}=0`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(`若 $(${expr1})^2+(${expr2})^2=0$，求 $(x,y)$。`);
        answers.push(
          `因為平方都不會小於 0，而兩個平方和等於 0，所以每一項平方都必須是 0。故有 $${formatSystemLatex(`${expr1}=0`, `${expr2}=0`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      questions.push(`若 $|${expr1}|+(${expr2})^2=0$，求 $(x,y)$。`);
      answers.push(
        `因為絕對值與平方都不會小於 0，而它們的和等於 0，所以 $|${expr1}|=0$ 且 $(${expr2})^2=0$。因此可列成 $${formatSystemLatex(`${expr1}=0`, `${expr2}=0`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, answers };
  }

  function solve2x2(a1, b1, c1, a2, b2, c2) {
    const det = a1 * b2 - a2 * b1;
    return {
      det,
      x: (c1 * b2 - c2 * b1) / det,
      y: (a1 * c2 - a2 * c1) / det,
    };
  }

  function buildNumericSystemForPoint(xValue, yValue) {
    while (true) {
      const a1 = pickNonZero(1, 5);
      const b1 = pickNonZero(-5, 5);
      const a2 = pickNonZero(1, 5);
      const b2 = pickNonZero(-5, 5);
      if (a1 * b2 === a2 * b1) continue;
      const c1 = a1 * xValue + b1 * yValue;
      const c2 = a2 * xValue + b2 * yValue;
      return { a1, b1, c1, a2, b2, c2 };
    }
  }

  function buildJ212KnownSolutionCoeffSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        let xValue = randInt(-4, 4);
        while (xValue === 0) xValue = randInt(-4, 4);
        const yValue = randInt(-4, 4);
        const p = pickNonZero(2, 5);
        const q = pickNonZero(1, 5);
        const n = pickNonZero(-5, 5);
        const r = pickNonZero(1, 5);
        const m = p * xValue - q * yValue;
        const rhs = n * xValue + r * yValue;
        questions.push(
          `已知 $x=${xValue},\\ y=${yValue}$ 是聯立方程式 $${formatSystemLatex(`${p}x=m+${q}y`, `nx+${r}y=${rhs}`)}$ 的解，求 $m+2n$。`
        );
        answers.push(
          `把 $x=${xValue},\\ y=${yValue}$ 代入第一式，可得 $m=${p * xValue}-${q}\\times(${yValue})=${m}$。再代入第二式，得 $${xValue}n+${r}\\times(${yValue})=${rhs}$，所以 $${xValue}n=${rhs - r * yValue}$，解得 $n=${n}$。因此 $m+2n=${m}+2\\times(${n})=${m + 2 * n}$。`
        );
        continue;
      }

      if (variant === 1) {
        const xValue = randInt(-3, 4);
        let yValue = randInt(-3, 4);
        while (yValue === 0) yValue = randInt(-3, 4);
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-4, 4);
        const c1 = a * xValue + b * yValue;
        const c2 = b * xValue - a * yValue;
        questions.push(
          `若 $x=${xValue},\\ y=${yValue}$ 是聯立方程式 $${formatSystemLatex(`ax+by=${c1}`, `bx-ay=${c2}`)}$ 的解，求 $|a-b|$。`
        );
        answers.push(
          `把 $x=${xValue},\\ y=${yValue}$ 代入，可得 $(${xValue})a${yValue >= 0 ? '+' : ''}(${yValue})b=${c1}$ 與 $(${xValue})b${-yValue >= 0 ? '+' : ''}(${-yValue})a=${c2}$。解這個關於 $a,b$ 的聯立方程式，可得 $a=${a},\\ b=${b}$，所以 $|a-b|=${Math.abs(a - b)}$。`
        );
        continue;
      }

      if (variant === 2) {
        const xValue = randInt(-3, 4);
        const yValue = randInt(-3, 4);
        const sys = buildNumericSystemForPoint(xValue, yValue);
        questions.push(
          `若 $x=a,\\ y=b$ 為聯立方程式 $${formatSystemLatex(`${sys.a1}x${sys.b1 >= 0 ? '+' : ''}${sys.b1}y=${sys.c1}`, `${sys.a2}x${sys.b2 >= 0 ? '+' : ''}${sys.b2}y=${sys.c2}`)}$ 的解，求 $a+b-1$。`
        );
        answers.push(
          `先解聯立方程式，可得 $(x,y)=(${xValue},${yValue})$。因為題目說 $x=a,\\ y=b$，所以 $a=${xValue},\\ b=${yValue}$，故 $a+b-1=${xValue}+${yValue}-1=${xValue + yValue - 1}$。`
        );
        continue;
      }

      let yValue = randInt(-4, 4);
      while (yValue === 0) yValue = randInt(-4, 4);
      const xValue = randInt(-4, 4);
      const a = pickNonZero(-5, 5);
      const b = pickNonZero(-5, 5);
      const rhs1 = a * xValue + 3 * yValue;
      const rhs2 = 2 * xValue + b * yValue;
      questions.push(
        `已知 $x=${xValue},\\ y=${yValue}$ 是聯立方程式 $${formatSystemLatex(`ax+3y=${rhs1}`, `2x+by=${rhs2}`)}$ 的解，求 $a-b$。`
      );
      answers.push(
        `把 $x=${xValue},\\ y=${yValue}$ 代入第一式，得 $${xValue}a+3\\times(${yValue})=${rhs1}$，所以 $${xValue}a=${rhs1 - 3 * yValue}$，解得 $a=${a}$。再代入第二式，得 $2\\times(${xValue})+${yValue}b=${rhs2}$，所以 $${yValue}b=${rhs2 - 2 * xValue}$，解得 $b=${b}$。因此 $a-b=${a - b}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ212ErrorDiagnosisSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;

      if (variant === 0) {
        const xValue = randInt(1, 6);
        const yValue = randInt(1, 9);
        const a = pickNonZero(1, 5);
        const b = pickNonZero(1, 5);
        const p = pickNonZero(2, 5);
        const c1 = a * xValue + b * yValue;
        const c2 = p * xValue - b * yValue;
        let wrong1 = null;
        let wrong2 = null;
        for (let x1 = -4; x1 <= 10 && !wrong1; x1 += 1) {
          for (let y1 = -4; y1 <= 10; y1 += 1) {
            if ((x1 === xValue && y1 === yValue) || x1 === 0) continue;
            if (p * x1 - b * y1 !== c2) continue;
            const aWrong = (c1 - b * y1) / x1;
            if (Number.isInteger(aWrong) && aWrong !== a) {
              wrong1 = { x: x1, y: y1 };
              break;
            }
          }
        }
        for (let x2 = -4; x2 <= 10 && !wrong2; x2 += 1) {
          for (let y2 = -4; y2 <= 10; y2 += 1) {
            if ((x2 === xValue && y2 === yValue) || y2 === 0) continue;
            if (a * x2 + b * y2 !== c1) continue;
            const bWrong = (p * x2 - c2) / y2;
            if (Number.isInteger(bWrong) && bWrong !== b) {
              wrong2 = { x: x2, y: y2 };
              break;
            }
          }
        }
        if (!wrong1 || !wrong2) {
          i -= 1;
          continue;
        }
        questions.push(
          `小明看錯 $a$，解得 $x=${wrong1.x},\\ y=${wrong1.y}$；小雅看錯 $b$，解得 $x=${wrong2.x},\\ y=${wrong2.y}$。求聯立方程式 $${formatSystemLatex(`ax+by=${c1}`, `${p}x-by=${c2}`)}$ 的正確解。`
        );
        answers.push(
          `因為小明只看錯 $a$，所以他的錯解一定滿足第二式：$${p}\\times(${wrong1.x})-b\\times(${wrong1.y})=${c2}$，解得 $b=${b}$。因為小雅只看錯 $b$，所以她的錯解一定滿足第一式：$a\\times(${wrong2.x})+${b}\\times(${wrong2.y})=${c1}$，解得 $a=${a}$。原方程式變成 $${formatSystemLatex(`${a}x+${b}y=${c1}`, `${p}x-${b}y=${c2}`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      const xValue = randInt(1, 6);
      let yValue = randInt(-4, 6);
      while (yValue === 0) yValue = randInt(-4, 6);
      const b = pickNonZero(1, 5);
      const c = pickNonZero(1, 5);
      const c1 = 4 * xValue + b * yValue;
      const c2 = 3 * xValue + c * yValue;
      let wrong1 = null;
      let wrong2 = null;
      for (let x1 = -3; x1 <= 10 && !wrong1; x1 += 1) {
        for (let y1 = -3; y1 <= 10; y1 += 1) {
          if ((x1 === xValue && y1 === yValue) || y1 === 0) continue;
          if (3 * x1 + c * y1 !== c2) continue;
          const bWrong = (c1 - 4 * x1) / y1;
          if (Number.isInteger(bWrong) && bWrong !== b) {
            wrong1 = { x: x1, y: y1 };
            break;
          }
        }
      }
      for (let x2 = -3; x2 <= 10 && !wrong2; x2 += 1) {
        for (let y2 = -3; y2 <= 10; y2 += 1) {
          if ((x2 === xValue && y2 === yValue) || y2 === 0) continue;
          if (4 * x2 + b * y2 !== c1) continue;
          const cWrong = (c2 - 3 * x2) / y2;
          if (Number.isInteger(cWrong) && cWrong !== c) {
            wrong2 = { x: x2, y: y2 };
            break;
          }
        }
      }
      if (!wrong1 || !wrong2) {
        i -= 1;
        continue;
      }
      questions.push(
        `莉莉看錯 $b$，解得 $x=${wrong1.x},\\ y=${wrong1.y}$；奇奇看錯 $c$，解得 $x=${wrong2.x},\\ y=${wrong2.y}$。求聯立方程式 $${formatSystemLatex(`4x+by=${c1}`, `3x+cy=${c2}`)}$ 的正確解。`
      );
      answers.push(
        `因為莉莉只看錯 $b$，所以她的錯解一定滿足第二式：$3\\times(${wrong1.x})+c\\times(${wrong1.y})=${c2}$，可得 $c=${c}$。因為奇奇只看錯 $c$，所以他的錯解一定滿足第一式：$4\\times(${wrong2.x})+b\\times(${wrong2.y})=${c1}$，可得 $b=${b}$。因此原方程式是 $${formatSystemLatex(`4x+${b}y=${c1}`, `3x+${c}y=${c2}`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, answers };
  }

  function buildJ212SharedSolutionSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const xValue = randInt(-3, 5);
      const yValue = randInt(-3, 5);
      const a = pickNonZero(1, 5);
      const b = pickNonZero(1, 5);

      if (variant === 0) {
        const s = xValue + yValue;
        const d = xValue - yValue;
        const c1 = a * xValue + b * yValue;
        const c2 = a * xValue - b * yValue;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`x+y=${s}`, `x-y=${d}`)}$ 與 $${formatSystemLatex(`ax+by=${c1}`, `ax-by=${c2}`)}$ 有相同的解，求 $a,b$。`
        );
        answers.push(
          `先由第一組解得 $x=${xValue},\\ y=${yValue}$。再把這組 $(x,y)$ 代入第二組，可得關於 $a,b$ 的聯立方程式，解得 $a=${a},\\ b=${b}$。`
        );
        continue;
      }

      if (variant === 1) {
        const p = pickNonZero(1, 5);
        const q = pickNonZero(-5, 5);
        const r = p * xValue + q * yValue;
        const s = a * xValue + b * yValue;
        const t = b * xValue + a * yValue;
        const u = 2 * xValue - 5 * yValue;
        questions.push(
          `若 $${formatSystemLatex(`${p}x${q >= 0 ? '+' : ''}${q}y=${r}`, `bx+ay=${t}`)}$ 與 $${formatSystemLatex(`ax+by=${s}`, `2x-5y=${u}`)}$ 有相同的解，求 $a,b$。`
        );
        answers.push(
          `先利用不含 $a,b$ 的兩式 $${p}x${q >= 0 ? '+' : ''}${q}y=${r}$ 與 $2x-5y=${u}$ 解得 $x=${xValue},\\ y=${yValue}$。再代入其餘兩式 $ax+by=${s}$、$bx+ay=${t}$，解出 $a=${a},\\ b=${b}$。`
        );
        continue;
      }

      const p = pickNonZero(1, 5);
      const q = pickNonZero(-5, 5);
      const r = pickNonZero(1, 5);
      const s = pickNonZero(-5, 5);
      if (p * s === q * r) {
        i -= 1;
        continue;
      }
      const c1 = a * xValue + b * yValue;
      const c2 = a * xValue - b * yValue;
      const d1 = p * xValue + q * yValue;
      const d2 = r * xValue + s * yValue;
      questions.push(
        `若 $${formatSystemLatex(`ax+by=${c1}`, `ax-by=${c2}`)}$ 與 $${formatSystemLatex(`${p}x${q >= 0 ? '+' : ''}${q}y=${d1}`, `${r}x${s >= 0 ? '+' : ''}${s}y=${d2}`)}$ 有相同的解，求 $a,b$。`
      );
      answers.push(
        `先由第二組純數字的聯立方程式解得 $x=${xValue},\\ y=${yValue}$。再代回第一組 $ax+by=${c1}$、$ax-by=${c2}$，即可解得 $a=${a},\\ b=${b}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ212ThirdConditionSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const xValue = 1;
        const yValue = 2;
        const sys = buildNumericSystemForPoint(xValue, yValue);
        const a = pickNonZero(1, 5);
        const b = pickNonZero(1, 5);
        const target = a * xValue + b * yValue;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`${sys.a1}x${sys.b1 >= 0 ? '+' : ''}${sys.b1}y=${sys.c1}`, `${sys.a2}x${sys.b2 >= 0 ? '+' : ''}${sys.b2}y=${sys.c2}`)}$ 的解滿足 $ax+by=${target}$，求 $a+2b$。`
        );
        answers.push(
          `先解聯立方程式，可得 $(x,y)=(1,2)$。把它代入第三個條件 $ax+by=${target}$，就得到 $a+2b=${target}$。`
        );
        continue;
      }

      if (variant === 1) {
        const t = randInt(1, 4);
        const xValue = t;
        const yValue = -t;
        const p = pickNonZero(3, 8);
        const q = pickNonZero(3, 8);
        const r = pickNonZero(3, 8);
        const s = -pickNonZero(1, 6);
        const k = p * xValue + q * yValue;
        const delta = r * xValue + s * yValue - k;
        questions.push(
          `已知聯立方程式 $${formatSystemLatex(`${p}x+${q}y=k`, `${r}x${s >= 0 ? '+' : ''}${s}y=k${delta >= 0 ? '+' : ''}${delta}`)}$ 的解為 $x=a,\\ y=b$。若 $a,b$ 互為相反數，求 $k$。`
        );
        answers.push(
          `因為 $a,b$ 互為相反數，所以可設 $y=-x$。代入兩式聯立，可得 $x=${xValue},\\ y=${yValue}$，進而算出 $k=${k}$。`
        );
        continue;
      }

      if (variant === 2) {
        const yValue = randInt(1, 5);
        const xValue = yValue - 2;
        const a = pickNonZero(1, 6);
        const rhs1 = a * xValue - 4 * yValue + 8;
        const rhs2 = 4 * xValue - yValue - 7;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`ax-4y+8=0`, `4x-y-7=0`)}$ 的解中，$x$ 比 $y$ 小 2，求 $a$。`
        );
        answers.push(
          `由「$x$ 比 $y$ 小 2」可得 $y=x+2$。代入第二式 $4x-y-7=0$，可求得 $x=${xValue},\\ y=${yValue}$。再代入第一式 $ax-4y+8=0$，解得 $a=${a}$。`
        );
        continue;
      }

      const xValue = 2;
      const yValue = 1;
      const p = pickNonZero(1, 5);
      const q = pickNonZero(1, 5);
      const k = 2 * p + q;
      const sys = buildNumericSystemForPoint(xValue, yValue);
      questions.push(
        `若聯立方程式 $${formatSystemLatex(`${sys.a1}x${sys.b1 >= 0 ? '+' : ''}${sys.b1}y=${sys.c1}`, `${sys.a2}x${sys.b2 >= 0 ? '+' : ''}${sys.b2}y=${sys.c2}`)}$ 的解還滿足 $px+qy=${k}$，且 $x$ 是 $y$ 的 2 倍，求 $2p+q$。`
      );
      answers.push(
        `由聯立方程式先求得 $(x,y)=(2,1)$，也確實滿足 $x=2y$。把它代入第三條件 $px+qy=${k}$，可得 $2p+q=${k}$。因此答案就是 $${k}$。`
      );
    }

    return { questions, answers };
  }

  function buildJ212SpecialReverseSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const a = pickNonZero(1, 6);
        const b = pickNonZero(1, 6);
        const c = pickNonZero(2, 12);
        const scale = randInt(2, 4);
        const k = b * scale;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`${a}x+${b}y=${c}`, `${a * scale}x+ky=${c}`)}$ 無解，求 $k$。`
        );
        answers.push(
          `無解表示前兩組係數成比例，但常數比不同。因為 $\\frac{${a}}{${a * scale}}=\\frac{1}{${scale}}$，所以也要有 $\\frac{${b}}{k}=\\frac{1}{${scale}}$，解得 $k=${k}$。此時常數比是 $\\frac{${c}}{${c}}=1$，與前面不同，所以確實無解。`
        );
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(1, 6);
        const b = -pickNonZero(1, 6);
        const c = pickNonZero(2, 12);
        const scale = randInt(2, 4);
        const k = c * scale;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`${a}x${b >= 0 ? '+' : ''}${b}y=${c}`, `${a * scale}x${b * scale >= 0 ? '+' : ''}${b * scale}y=k`)}$ 有無限多組解，求 $k$。`
        );
        answers.push(
          `有無限多組解表示三組比值都相同。前兩組係數比已是 $\\frac{1}{${scale}}$，所以常數也必須滿足 $\\frac{${c}}{k}=\\frac{1}{${scale}}$，解得 $k=${k}$。`
        );
        continue;
      }

      if (variant === 2) {
        const p = randInt(2, 6);
        const a = -randInt(1, 5);
        const r = -p * a;
        const q = [8, 10, 12, 15, 18, 20, 24, 30][randInt(0, 7)];
        const s = p * q;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`x+ay=${q}`, `${p}x-${r}y=${s}`)}$ 有無限多組解，求 $a$。`
        );
        answers.push(
          `若有無限多組解，三組比值都要相同。由 $\\frac{1}{${p}}=\\frac{${q}}{${s}}$，可知也要有 $\\frac{a}{-${r}}=\\frac{1}{${p}}$，所以 $a=${a}$。`
        );
        continue;
      }

      const p = randInt(2, 6);
      const a = -randInt(1, 5);
      const r = -p * a;
      const q = [8, 10, 12, 15, 18, 20, 24, 30][randInt(0, 7)];
      const offset = [1, 2, 3, 4, 5, 6][randInt(0, 5)];
      const s = p * q + offset;
      questions.push(`若聯立方程式 $${formatSystemLatex(`x+ay=${q}`, `${p}x-${r}y=${s}`)}$ 無解，求 $a$。`);
      answers.push(
        `若無解，前兩組係數要成比例，但常數比不同。先由 $\\frac{1}{${p}}=\\frac{a}{-${r}}$ 得 $a=${a}$。此時係數比固定是 $\\frac{1}{${p}}$，但常數比是 $\\frac{${q}}{${s}}$，與 $\\frac{1}{${p}}$ 不同，因此確實無解。`
      );
    }

    return { questions, answers };
  }

  function buildBinomialQuestions(count, mode, kind) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      if (kind === 'variable') {
        const a = randInt(1, 6);
        const b = randInt(1, 9);
        const middle = 2 * a * b * (mode === 'sum' ? 1 : -1);
        questions.push(`展開：$(${a === 1 ? 'x' : `${a}x`}${mode === 'sum' ? '+' : '-'}${b})^2$。`);
        answers.push(
          `利用乘法公式：$(${a === 1 ? 'x' : `${a}x`}${mode === 'sum' ? '+' : '-'}${b})^2=${a * a}x^2${middle >= 0 ? '+' : ''}${middle}x+${b * b}$。`
        );
        continue;
      }

      if (kind === 'fraction') {
        const a = makeFraction(randInt(3, 9), randInt(2, 6));
        const b = makeFraction(randInt(1, 5), randInt(2, 6));
        const sum = mode === 'sum' ? addFraction(a, b) : subFraction(a, b);
        const result = mulFraction(sum, sum);
        const aText = fractionToLatex(a);
        const bText = fractionToLatex(b);
        questions.push(`展開：$\\left(${aText}${mode === 'sum' ? '+' : '-'}${bText}\\right)^2$。`);
        answers.push(
          `先用公式：$\\left(${aText}${mode === 'sum' ? '+' : '-'}${bText}\\right)^2=${aText}^2${mode === 'sum' ? '+' : '-'}2\\cdot${aText}\\cdot${bText}+${bText}^2=${fractionToLatex(result)}$。`
        );
        continue;
      }

      const isDecimal = kind === 'decimal';
      const a = isDecimal ? randInt(10, 80) / 10 : randInt(2, 15);
      const b = isDecimal ? randInt(1, 30) / 10 : randInt(1, 12);
      const aText = formatDecimalValue(a);
      const bText = formatDecimalValue(b);
      const result = Math.pow(mode === 'sum' ? a + b : a - b, 2);
      questions.push(`展開：$(${aText}${mode === 'sum' ? '+' : '-'}${bText})^2$。`);
      answers.push(
        `利用乘法公式：$(${aText}${mode === 'sum' ? '+' : '-'}${bText})^2=${aText}^2${mode === 'sum' ? '+' : '-'}2\\cdot${aText}\\cdot${bText}+${bText}^2=${formatDecimalValue(result)}$。`
      );
    }

    return { questions, answers };
  }

  function buildPureConjugateQuestions(count, kind) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      if (kind === 'fraction') {
        const a = makeFraction(randInt(3, 9), randInt(2, 6));
        const b = makeFraction(randInt(1, 5), randInt(2, 6));
        const result = subFraction(mulFraction(a, a), mulFraction(b, b));
        const aText = fractionToLatex(a);
        const bText = fractionToLatex(b);
        questions.push(`計算：$\\left(${aText}+${bText}\\right)\\left(${aText}-${bText}\\right)$。`);
        answers.push(
          `利用平方差公式：$(a+b)(a-b)=a^2-b^2$，所以結果是 $${aText}^2-${bText}^2=${fractionToLatex(result)}$。`
        );
        continue;
      }

      const isDecimal = kind === 'decimal';
      const a = isDecimal ? randInt(10, 80) / 10 : randInt(3, 20);
      const b = isDecimal ? randInt(1, 30) / 10 : randInt(1, 12);
      const aText = formatDecimalValue(a);
      const bText = formatDecimalValue(b);
      const result = a * a - b * b;
      questions.push(`計算：$(${aText}+${bText})(${aText}-${bText})$。`);
      answers.push(
        `利用平方差公式：$(a+b)(a-b)=a^2-b^2$，所以結果是 $${aText}^2-${bText}^2=${formatDecimalValue(result)}$。`
      );
    }

    return { questions, answers };
  }

  function buildDifferenceOfSquaresQuestions(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = randInt(1, 9);
      const ax = a === 1 ? 'x' : `${a}x`;
      questions.push(`展開：$(${ax}+${b})(${ax}-${b})$。`);
      answers.push(
        `利用平方差公式：$(A+B)(A-B)=A^2-B^2$，其中 $A=${ax},\\ B=${b}$，所以結果是 $${a * a}x^2-${b * b}$。`
      );
    }

    return { questions, answers };
  }

  function buildPureSquareDifferenceQuestions(count, kind) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      if (kind === 'fraction') {
        const a = makeFraction(randInt(3, 9), randInt(2, 6));
        const b = makeFraction(randInt(1, 5), randInt(2, 6));
        const result = subFraction(mulFraction(a, a), mulFraction(b, b));
        questions.push(`計算：$\\left(${fractionToLatex(a)}\\right)^2-\\left(${fractionToLatex(b)}\\right)^2$。`);
        answers.push(`這是平方差：$a^2-b^2=(a+b)(a-b)$，所以結果為 $${fractionToLatex(result)}$。`);
        continue;
      }

      const isDecimal = kind === 'decimal';
      const a = isDecimal ? randInt(10, 80) / 10 : randInt(3, 20);
      const b = isDecimal ? randInt(1, 30) / 10 : randInt(1, 12);
      const aText = formatDecimalValue(a);
      const bText = formatDecimalValue(b);
      const result = a * a - b * b;
      questions.push(`計算：$(${aText})^2-(${bText})^2$。`);
      answers.push(`這是平方差：$a^2-b^2=(a+b)(a-b)$，所以結果為 $${formatDecimalValue(result)}$。`);
    }

    return { questions, answers };
  }

  function buildFactorizationQuestions(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = randInt(1, 9);
      const ax = a === 1 ? 'x' : `${a}x`;
      questions.push(`分解因式：$${a * a}x^2-${b * b}$。`);
      answers.push(`這是平方差：$${a * a}x^2-${b * b}=(${ax}+${b})(${ax}-${b})$。`);
    }

    return { questions, answers };
  }

  function buildJ311FormulaMixedSet(count, kind) {
    const questions = [];
    const answers = [];
    const center = 100;

    function buildNumberLikePair(currentKind) {
      if (currentKind === 'fraction') {
        const deltaOptions = [
          makeFraction(1, 2),
          makeFraction(2, 3),
          makeFraction(3, 5),
          makeFraction(3, 4),
          makeFraction(5, 6),
        ];
        const delta = deltaOptions[randInt(0, deltaOptions.length - 1)];
        const left = addFraction(makeFraction(center, 1), delta);
        const right = subFraction(makeFraction(center, 1), delta);
        return {
          centerText: '100',
          deltaText: fractionToLatex(delta),
          leftText: fractionToLatex(left, true),
          rightText: fractionToLatex(right, true),
          leftSquare: mulFraction(left, left),
          rightSquare: mulFraction(right, right),
          conjugate: subFraction(
            mulFraction(makeFraction(center, 1), makeFraction(center, 1)),
            mulFraction(delta, delta)
          ),
          squareDifference: mulFraction(makeFraction(400, 1), delta),
          formatResult(value) {
            return fractionToLatex(value, true);
          },
          };
        }

        if (currentKind === 'decimal') {
          const delta = [0.2, 0.3, 0.4, 0.5, 0.6, 0.8][randInt(0, 5)];
          const left = center + delta;
          const right = center - delta;
        return {
          centerText: '100',
          deltaText: formatDecimalValue(delta),
          leftText: formatDecimalValue(left),
          rightText: formatDecimalValue(right),
          leftSquare: left * left,
          rightSquare: right * right,
          conjugate: center * center - delta * delta,
          squareDifference: 400 * delta,
          formatResult(value) {
            return formatDecimalValue(value);
          },
        };
      }

      const delta = randInt(1, 9);
      const left = center + delta;
      const right = center - delta;
      return {
        centerText: '100',
        deltaText: `${delta}`,
        leftText: `${left}`,
        rightText: `${right}`,
        leftSquare: left * left,
        rightSquare: right * right,
        conjugate: center * center - delta * delta,
        squareDifference: 400 * delta,
        formatResult(value) {
          return `${value}`;
        },
      };
      }

      for (let i = 0; i < count; i += 1) {
        const variant = i % 4;
        const currentKind = kind === 'mixed'
          ? ['integer', 'decimal', 'fraction'][Math.floor((i % 12) / 4)]
          : kind;
        const pair = buildNumberLikePair(currentKind);

        if (variant === 0) {
          questions.push(`計算：$(${pair.leftText})^2$。`);
        answers.push(
          `把它看成和平方：$(${pair.centerText}+${pair.deltaText})^2=${pair.centerText}^2+2\\cdot ${pair.centerText}\\cdot ${pair.deltaText}+(${pair.deltaText})^2=${pair.formatResult(pair.leftSquare)}$。`
        );
      } else if (variant === 1) {
        questions.push(`計算：$(${pair.rightText})^2$。`);
        answers.push(
          `把它看成差平方：$(${pair.centerText}-${pair.deltaText})^2=${pair.centerText}^2-2\\cdot ${pair.centerText}\\cdot ${pair.deltaText}+(${pair.deltaText})^2=${pair.formatResult(pair.rightSquare)}$。`
        );
      } else if (variant === 2) {
        questions.push(`計算：$(${pair.leftText})\\times(${pair.rightText})$。`);
        answers.push(
          `這是平方差展開：$(${pair.centerText}+${pair.deltaText})\\times(${pair.centerText}-${pair.deltaText})=${pair.centerText}^2-(${pair.deltaText})^2=${pair.formatResult(pair.conjugate)}$。`
        );
      } else {
        questions.push(`計算：$(${pair.leftText})^2-(${pair.rightText})^2$。`);
        answers.push(
          `這是平方差分解：$A^2-B^2=(A+B)(A-B)$。所以原式 $=(${pair.leftText}+${pair.rightText})(${pair.leftText}-${pair.rightText})=${pair.formatResult(pair.squareDifference)}$。`
        );
      }
    }

    return { questions, answers };
  }

  function buildJ311VariableFormulaMixedSet(count) {
    const questions = [];
    const answers = [];

    const builders = [
      () => buildBinomialQuestions(1, 'sum', 'variable'),
      () => buildBinomialQuestions(1, 'diff', 'variable'),
      () => buildDifferenceOfSquaresQuestions(1, 'variable'),
      () => buildFactorizationQuestions(1),
    ];

    for (let i = 0; i < count; i += 1) {
      const result = builders[i % builders.length]();
      questions.push(result.questions[0]);
      answers.push(result.answers[0]);
    }

    return { questions, answers };
  }

  function buildLinearWordExpressionSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      if (variant === 0) {
        questions.push(`打折問題：原價 $x$ 元，打八折後再減 35 元，應記成什麼代數式？`);
        answers.push(`先打八折得到 $0.8x$，再減 35 元，所以代數式是 $0.8x-35$。`);
      } else if (variant === 1) {
        questions.push(`數量分配：一打鉛筆賣 $x$ 元，買了 7 枝再加 5 元，應記成什麼代數式？`);
        answers.push(`一打是 12 枝，所以 7 枝價錢是 $\\frac{7x}{12}$，再加 5 元後為 $\\frac{7x}{12}+5$。`);
      } else if (variant === 2) {
        questions.push(`連續數問題：三個連續偶數中最小的是 $x$，三數總和應記成什麼代數式？`);
        answers.push(`三個連續偶數是 $x,\\ x+2,\\ x+4$，總和是 $x+(x+2)+(x+4)=3x+6$。`);
      } else if (variant === 3) {
        questions.push(`幾何圖形：梯形上底是 $2x+1$、下底是 $4x-2$、高是 6，面積應記成什麼代數式？`);
        answers.push(
          `梯形面積是 $\\frac{(上底+下底)\\times高}{2}$，所以面積為 $\\frac{[(2x+1)+(4x-2)]\\times 6}{2}=18x-3$。`
        );
      } else {
        questions.push(`幣值計算：我有 $x$ 個 5 元硬幣和 32 個 10 元硬幣，總共有多少元？`);
        answers.push(`5 元硬幣共有 $5x$ 元，32 個 10 元硬幣共有 $320$ 元，所以總共有 $5x+320$ 元。`);
      }
    }

    return { questions, answers };
  }

  function buildLinearSubstitutionValueSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      if (variant === 0) {
        const x = pickNonZero(-5, 5);
        questions.push(`當 $x=${x}$，求 $2x-1$ 的值。`);
        answers.push(`把 $x=${x}$ 代入：$2(${x})-1=${2 * x - 1}$。`);
      } else if (variant === 1) {
        const a = pickNonZero(-5, 5);
        const b = makeFraction(randInt(1, 3), 2);
        const value = divFraction(
          addFraction(makeFraction(a, 1), mulFraction(makeFraction(2, 1), b)),
          addFraction(makeFraction(2, 1), b)
        );
        questions.push(`當 $a=${a},\\ b=${fractionToLatex(b)}$，求 $\\frac{a+2b}{2+b}$ 的值。`);
        answers.push(
          `代入得：$\\frac{${a}+2\\times ${fractionToLatex(b)}}{2+${fractionToLatex(b)}}=${fractionToLatex(value)}$。`
        );
      } else if (variant === 2) {
        const x = [0.5, 1.25, -1.25, -2.5][randInt(0, 3)];
        questions.push(`當 $x=${trimDecimalString(x)}$，求 $2x-7$ 的值。`);
        answers.push(
          `把 $x=${trimDecimalString(x)}$ 代入：$2\\times ${trimDecimalString(x)}-7=${trimDecimalString(2 * x - 7)}$。`
        );
      } else {
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-4, 4);
        let c = pickNonZero(-4, 4);
        while (b === c) c = pickNonZero(-4, 4);
        const value = makeFraction(a * b - c, b - c);
        questions.push(`當 $a=${a},\\ b=${b},\\ c=${c}$，求 $\\frac{ab-c}{b-c}$ 的值。`);
        answers.push(`代入得：$\\frac{${a}\\times ${b}-${c}}{${b}-${c}}=${fractionToLatex(value)}$。`);
      }
    }

    return { questions, answers };
  }

  function buildIdentityIntegerBasicSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const sum = a + b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      const diff = a - b;
      if (i % 2 === 0) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)、\\(a-b\\)。`);
        answers.push(
          `\\(ab=\\frac{(a+b)^2-(a^2+b^2)}{2}=\\frac{${sum * sum}-${sqsum}}{2}=${prod}\\)，\\(a-b=${diff}\\) 或 \\(${-diff}\\)。`
        );
      } else {
        questions.push(`已知 \\(ab=${prod}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(a+b\\)、\\(a-b\\)。`);
        answers.push(
          `\\((a+b)^2=${sqsum}+2(${prod})=${sqsum + 2 * prod}\\)，所以 \\(a+b=${sum}\\) 或 \\(${-sum}\\)；\\(a-b=${diff}\\) 或 \\(${-diff}\\)。`
        );
      }
    }
    return { questions, answers };
  }

  function buildSumSqsumToProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const sum = a + b;
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)。`);
      answers.push(`\\(ab=\\frac{(a+b)^2-(a^2+b^2)}{2}=\\frac{${sum * sum}-${sqsum}}{2}=${prod}\\)。`);
    }
    return { questions, answers };
  }

  function buildDiffSqsumToProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const diff = a - b;
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\(a-b=${diff}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)。`);
      answers.push(`\\((a-b)^2=a^2-2ab+b^2\\Rightarrow ab=\\frac{${sqsum}-${diff * diff}}{2}=${prod}\\)。`);
    }
    return { questions, answers };
  }

  function buildIdentitySumProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-7, 7);
      const b = randInt(-7, 7);
      const sum = a + b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      const diff2 = (a - b) * (a - b);
      questions.push(`已知 \\(a+b=${sum}\\)、\\(ab=${prod}\\)，求 \\(a^2+b^2\\)、\\((a-b)^2\\)。`);
      answers.push(
        `\\(a^2+b^2=(a+b)^2-2ab=${sum * sum}-2(${prod})=${sqsum}\\)，\\((a-b)^2=(a+b)^2-4ab=${sum * sum}-4(${prod})=${diff2}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildProductSqsumSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-7, 7);
      const b = randInt(-7, 7);
      const prod = a * b;
      const sqsum = a * a + b * b;
      const sum = a + b;
      const diff = a - b;
      questions.push(`已知 \\(ab=${prod}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(a+b\\)、\\(a-b\\)。`);
      answers.push(
        `\\((a+b)^2=${sqsum}+2(${prod})=${sqsum + 2 * prod}\\Rightarrow a+b=${sum}\\) 或 \\(${-sum}\\)；\\((a-b)^2=${sqsum}-2(${prod})=${sqsum - 2 * prod}\\Rightarrow a-b=${diff}\\) 或 \\(${-diff}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildSquarePairSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-6, 6);
      const b = randInt(-6, 6);
      const sp = (a + b) * (a + b);
      const sm = (a - b) * (a - b);
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\((a+b)^2=${sp}\\)、\\((a-b)^2=${sm}\\)，求 \\(a^2+b^2\\)、\\(ab\\)。`);
      answers.push(`\\(a^2+b^2=\\frac{${sp}+${sm}}{2}=${sqsum}\\)，\\(ab=\\frac{${sp}-${sm}}{4}=${prod}\\)。`);
    }
    return { questions, answers };
  }

  function buildIdentityPairMixedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-7, 7);
      const b = randInt(-7, 7);
      const sum = a + b;
      const diff = a - b;
      const sqsum = a * a + b * b;
      const prod = a * b;
      const sumSquare = sum * sum;
      const diffSquare = diff * diff;
      const variant = i % 5;
      if (variant === 0) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\) 與 \\(a-b\\)。`);
        answers.push(
          `先由 \\(ab=\\frac{(a+b)^2-(a^2+b^2)}{2}=\\frac{${sumSquare}-${sqsum}}{2}=${prod}\\)。再算 \\((a-b)^2=${sqsum}-2(${prod})=${diffSquare}\\)，所以 \\(a-b=${diff}\\) 或 \\(${-diff}\\)。`
        );
      } else if (variant === 1) {
        questions.push(`已知 \\(a-b=${diff}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\) 與 \\(a+b\\)。`);
        answers.push(
          `先由 \\(ab=\\frac{(a^2+b^2)-(a-b)^2}{2}=\\frac{${sqsum}-${diffSquare}}{2}=${prod}\\)。再算 \\((a+b)^2=${sqsum}+2(${prod})=${sumSquare}\\)，所以 \\(a+b=${sum}\\) 或 \\(${-sum}\\)。`
        );
      } else if (variant === 2) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(ab=${prod}\\)，求 \\(a^2+b^2\\) 與 \\(a-b\\)。`);
        answers.push(
          `先由 \\(a^2+b^2=(a+b)^2-2ab=${sumSquare}-2(${prod})=${sqsum}\\)。再算 \\((a-b)^2=(a+b)^2-4ab=${sumSquare}-4(${prod})=${diffSquare}\\)，所以 \\(a-b=${diff}\\) 或 \\(${-diff}\\)。`
        );
      } else if (variant === 3) {
        questions.push(`已知 \\(a-b=${diff}\\)、\\(ab=${prod}\\)，求 \\(a^2+b^2\\) 與 \\(a+b\\)。`);
        answers.push(
          `先由 \\(a^2+b^2=(a-b)^2+2ab=${diffSquare}+2(${prod})=${sqsum}\\)。再算 \\((a+b)^2=(a-b)^2+4ab=${diffSquare}+4(${prod})=${sumSquare}\\)，所以 \\(a+b=${sum}\\) 或 \\(${-sum}\\)。`
        );
      } else {
        questions.push(`已知 \\(a^2+b^2=${sqsum}\\)、\\(ab=${prod}\\)，求 \\(a+b\\) 與 \\(a-b\\)。`);
        answers.push(
          `由 \\((a+b)^2=${sqsum}+2(${prod})=${sumSquare}\\)，得 \\(a+b=${sum}\\) 或 \\(${-sum}\\)；由 \\((a-b)^2=${sqsum}-2(${prod})=${diffSquare}\\)，得 \\(a-b=${diff}\\) 或 \\(${-diff}\\)。`
        );
      }
    }
    return { questions, answers };
  }

  function buildIdentityPairAdvancedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const sum = randInt(-10, 10);
      const diff = randInt(-10, 10);
      const prodFromSum = randInt(-12, 12);
      const prodFromDiff = randInt(-12, 12);
      const sqsumFromSum = sum * sum - 2 * prodFromSum;
      const diffSquareFromSum = sum * sum - 4 * prodFromSum;
      const sqsumFromDiff = diff * diff + 2 * prodFromDiff;
      const sumSquareFromDiff = diff * diff + 4 * prodFromDiff;
      const prodFromSqsum = randInt(-12, 12);
      const sqsum = randInt(5, 60);
      const sumSquareFromSqsum = sqsum + 2 * prodFromSqsum;
      const diffSquareFromSqsum = sqsum - 2 * prodFromSqsum;
      const variant = i % 5;
      if (variant === 0) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsumFromSum}\\)，求 \\(ab\\) 與 \\((a-b)^2\\)。`);
        answers.push(
          `由 \\(a^2+b^2=(a+b)^2-2ab\\)，得 \\(ab=\\frac{${sum * sum}-${sqsumFromSum}}{2}=${prodFromSum}\\)。再由 \\((a-b)^2=(a+b)^2-4ab=${sum * sum}-4(${prodFromSum})=${diffSquareFromSum}\\)。`
        );
      } else if (variant === 1) {
        questions.push(`已知 \\(a-b=${diff}\\)、\\(a^2+b^2=${sqsumFromDiff}\\)，求 \\(ab\\) 與 \\((a+b)^2\\)。`);
        answers.push(
          `由 \\(a^2+b^2=(a-b)^2+2ab\\)，得 \\(ab=\\frac{${sqsumFromDiff}-${diff * diff}}{2}=${prodFromDiff}\\)。再由 \\((a+b)^2=(a-b)^2+4ab=${diff * diff}+4(${prodFromDiff})=${sumSquareFromDiff}\\)。`
        );
      } else if (variant === 2) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(ab=${prodFromSum}\\)，求 \\(a^2+b^2\\) 與 \\((a-b)^2\\)。`);
        answers.push(
          `由 \\(a^2+b^2=(a+b)^2-2ab=${sum * sum}-2(${prodFromSum})=${sqsumFromSum}\\)。再由 \\((a-b)^2=(a+b)^2-4ab=${sum * sum}-4(${prodFromSum})=${diffSquareFromSum}\\)。`
        );
      } else if (variant === 3) {
        questions.push(`已知 \\(a-b=${diff}\\)、\\(ab=${prodFromDiff}\\)，求 \\(a^2+b^2\\) 與 \\((a+b)^2\\)。`);
        answers.push(
          `由 \\(a^2+b^2=(a-b)^2+2ab=${diff * diff}+2(${prodFromDiff})=${sqsumFromDiff}\\)。再由 \\((a+b)^2=(a-b)^2+4ab=${diff * diff}+4(${prodFromDiff})=${sumSquareFromDiff}\\)。`
        );
      } else {
        questions.push(`已知 \\(a^2+b^2=${sqsum}\\)、\\(ab=${prodFromSqsum}\\)，求 \\((a+b)^2\\) 與 \\((a-b)^2\\)。`);
        answers.push(
          `由 \\((a+b)^2=a^2+b^2+2ab=${sqsum}+2(${prodFromSqsum})=${sumSquareFromSqsum}\\)。再由 \\((a-b)^2=a^2+b^2-2ab=${sqsum}-2(${prodFromSqsum})=${diffSquareFromSqsum}\\)。`
        );
      }
    }
    return { questions, answers };
  }

  function buildLinearCombinationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-6, 6);
      const b = randInt(-6, 6);
      const diff = a - b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      const value = 3 * a * a + 4 * a * b + 3 * b * b;
      questions.push(`已知 \\(a-b=${diff}\\)、\\(ab=${prod}\\)，求 \\(3a^2+4ab+3b^2\\)。`);
      answers.push(
        `\\(a^2+b^2=(a-b)^2+2ab=${diff * diff}+2(${prod})=${sqsum}\\)，所以 \\(3a^2+4ab+3b^2=3(${sqsum})+4(${prod})=${value}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildReciprocalSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const val = randInt(3, 8);
      questions.push(`已知 \\(x+\\frac{1}{x}=${val}\\)，求 \\(x^2+\\frac{1}{x^2}\\)。`);
      answers.push(`\\(x^2+\\frac{1}{x^2}=\\left(x+\\frac{1}{x}\\right)^2-2=${val}^2-2=${val * val - 2}\\)。`);
    }
    return { questions, answers };
  }

  function buildReciprocalReverseSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(3, 10);
      questions.push(`已知 \\(x^2+\\frac{1}{x^2}=${base}\\)，求 \\(x+\\frac{1}{x}\\)、\\(x-\\frac{1}{x}\\)。`);
      const plus2 = base + 2;
      const minus2 = base - 2;
      answers.push(
        `\\(\\left(x+\\frac{1}{x}\\right)^2=${plus2}\\Rightarrow x+\\frac{1}{x}=\\pm\\sqrt{${plus2}}\\)，\\(\\left(x-\\frac{1}{x}\\right)^2=${minus2}\\Rightarrow x-\\frac{1}{x}=\\pm\\sqrt{${minus2}}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildReciprocalMixedFractionSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 8);
      const b = randInt(1, 8);
      const sum = a + b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      questions.push(
        `已知 \\(a+b=${sum}\\)、\\(ab=${prod}\\)，求 \\(\\frac{1}{a}+\\frac{1}{b}\\)、\\(\\frac{a}{b}+\\frac{b}{a}\\)。`
      );
      answers.push(
        `\\(\\frac1a+\\frac1b=\\frac{a+b}{ab}=\\frac{${sum}}{${prod}}\\)，\\(\\frac ab+\\frac ba=\\frac{a^2+b^2}{ab}=\\frac{${sqsum}}{${prod}}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildMixedAdvancedIdentitySet(count) {
    const banks = [
      () => buildIdentityIntegerBasicSet(1),
      () => buildIdentitySumProductSet(1),
      () => buildReciprocalSet(1),
      () => buildReciprocalReverseSet(1),
    ];

    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const pick = banks[randInt(0, banks.length - 1)]();
      questions.push(...pick.questions);
      answers.push(...pick.answers);
    }
    return { questions, answers };
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function normalizeRatioInts(a, b) {
    const g = gcd(Math.abs(a), Math.abs(b));
    let ra = a / g;
    let rb = b / g;
    if (rb < 0 || (rb === 0 && ra < 0)) {
      ra *= -1;
      rb *= -1;
    }
    return { a: ra, b: rb };
  }

  function normalizeRatioFromFractions(left, right) {
    const common = lcm(left.den, right.den);
    return normalizeRatioInts(left.num * (common / left.den), right.num * (common / right.den));
  }

  function formatSingleVarExpr(coef, constant) {
    if (coef === 0) return `${constant}`;
    const term = formatTerm(coef, 'x');
    if (constant === 0) return term;
    return `${term}${constant > 0 ? '+' : ''}${constant}`;
  }

  function buildJ231RatioSimplifySet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const left = randomMixedFraction(1, 3, [2, 3, 4, 5], false);
        const right = randomProperFraction([2, 3, 4, 5, 6]);
        if (randInt(0, 1) === 0) {
          const ratio = normalizeRatioFromFractions(left, right);
          const common = lcm(left.den, right.den);
          questions.push(`將 $${integerOrFractionLatex(left)}:${fractionToLatex(right)}$ 化為最簡整數比。`);
          answers.push(
            `先把兩項都看成分數，再同乘分母的最小公倍數 ${common}，可得整數比。約分後，最簡整數比為 $${ratio.a}:${ratio.b}$。`
          );
        } else {
          const value = divFraction(left, right);
          questions.push(`求 $${integerOrFractionLatex(left)}:${fractionToLatex(right)}$ 的比值。`);
          answers.push(
            `比值就是前項除以後項，所以 $${fractionToLatex(left)}\\div ${fractionToLatex(right)}=${fractionToLatex(value)}$。`
          );
        }
        continue;
      }

      if (variant === 1) {
        const decimalChoices = [
          { text: '0.4', frac: makeFraction(2, 5) },
          { text: '0.75', frac: makeFraction(3, 4) },
          { text: '1.2', frac: makeFraction(6, 5) },
          { text: '2.25', frac: makeFraction(9, 4) },
        ];
        const left = decimalChoices[randInt(0, decimalChoices.length - 1)];
        const right = randomMixedFraction(1, 2, [2, 4, 5, 10], false);
        if (randInt(0, 1) === 0) {
          const ratio = normalizeRatioFromFractions(left.frac, right);
          const common = lcm(left.frac.den, right.den);
          questions.push(`將 $${left.text}:${integerOrFractionLatex(right)}$ 化為最簡整數比。`);
          answers.push(
            `先把小數化成分數：$${left.text}=${fractionToLatex(left.frac)}$。再同乘分母的最小公倍數 ${common}，約分後得最簡整數比 $${ratio.a}:${ratio.b}$。`
          );
        } else {
          const value = divFraction(left.frac, right);
          questions.push(`求 $${left.text}:${integerOrFractionLatex(right)}$ 的比值。`);
          answers.push(
            `把小數化成分數後，比值為 $${fractionToLatex(left.frac)}\\div ${fractionToLatex(right)}=${fractionToLatex(value)}$。`
          );
        }
        continue;
      }

      if (variant === 2) {
        const gram = randInt(4, 18) * 50;
        const kg = makeFraction(randInt(2, 9), 10);
        const kgGram = mulFraction(kg, makeFraction(1000, 1));
        const ratio = normalizeRatioFromFractions(makeFraction(gram, 1), kgGram);
        questions.push(`將 ${gram} 公克：$${fractionToLatex(kg)}$ 公斤化為最簡整數比。`);
        answers.push(
          `先把公斤化成公克：$${fractionToLatex(kg)}$ 公斤 $=${fractionToLatex(kgGram)}$ 公克。再把 $${gram}:${fractionToLatex(kgGram)}$ 約成最簡整數比，可得 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 3) {
        const minute = randInt(1, 4);
        const second = randInt(10, 50);
        const totalSecond = minute * 60 + second;
        const otherMinute = randInt(1, 4);
        const ratio = normalizeRatioInts(totalSecond, otherMinute * 60);
        questions.push(`將 ${minute} 分 ${second} 秒：${otherMinute} 分鐘化為最簡整數比。`);
        answers.push(
          `先把時間都化成秒：${minute} 分 ${second} 秒 $=${totalSecond}$ 秒，${otherMinute} 分鐘 $=${otherMinute * 60}$ 秒，所以最簡整數比為 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      const left = makeFraction(randInt(3, 9), randInt(2, 6));
      const right = negateFraction(makeFraction(randInt(2, 8), randInt(2, 6)));
      const value = divFraction(left, right);
      questions.push(`求 $${fractionToLatex(left)}:${fractionToLatex(right)}$ 的比值。`);
      answers.push(
        `比值就是前項除以後項，所以 $${fractionToLatex(left)}\\div ${fractionToLatex(right)}=${fractionToLatex(value)}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231ProportionSolveSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        let x = randInt(-3, 6);
        const a = randInt(1, 5);
        const b = randInt(3, 8);
        const d = randInt(2, 6);
        let c = (d * (x - a)) / b - x;
        while (!Number.isInteger(c) || Math.abs(c) > 9) {
          x = randInt(-3, 6);
          c = (d * (x - a)) / b - x;
        }
        questions.push(
          `求比例式 $(${formatSingleVarExpr(1, -a)}):${b}=(${formatSingleVarExpr(1, c)}):${d}$ 中的 $x$ 值。`
        );
        answers.push(
          `由比例式可得 $${d}\\left(${formatSingleVarExpr(1, -a)}\\right)=${b}\\left(${formatSingleVarExpr(1, c)}\\right)$。整理後解得 $x=${x}$。`
        );
        continue;
      }

      if (variant === 1) {
        const x = randInt(-2, 5);
        const a = randInt(2, 4);
        const b = randInt(3, 6);
        const c = (a * x + 1) * b;
        questions.push(`若 $(${a}x+1):${b}$ 的比值為 ${c}，求 $x$。`);
        answers.push(`比值為 ${c} 表示 $\\dfrac{${a}x+1}{${b}}=${c}$。所以 $${a}x+1=${c * b}$，解得 $x=${x}$。`);
        continue;
      }

      if (variant === 2) {
        const x = randInt(1, 6);
        const left = makeFraction(randInt(2, 5), randInt(2, 4));
        const expr = makeFraction(2 * x, 3);
        const value = divFraction(left, expr);
        questions.push(
          `求比例式 $${fractionToLatex(left)}:${fractionToLatex(makeFraction(2, 3))}x=${value.num}:${value.den}$ 中的 $x$ 值。`
        );
        answers.push(
          `由比例式可得 $${value.den}\\times ${fractionToLatex(left)}=${value.num}\\times ${fractionToLatex(makeFraction(2, 3))}x$。整理後解得 $x=${x}$。`
        );
        continue;
      }

      if (variant === 3) {
        const x = randInt(-2, 6);
        const a = randInt(2, 5);
        const b = randInt(-5, 4);
        const c = randInt(2, 6);
        const ratioValue = divFraction(makeFraction(a * x + b, 1), makeFraction(c, 1));
        questions.push(`若 $(${formatSingleVarExpr(a, b)}):${c}$ 的比值為 $${fractionToLatex(ratioValue)}$，求 $x$。`);
        answers.push(
          `比值為 $${fractionToLatex(ratioValue)}$ 表示 $\\dfrac{${formatSingleVarExpr(a, b)}}{${c}}=${fractionToLatex(ratioValue)}$。交叉相乘後可得 $${formatSingleVarExpr(a, b)}=${fractionToLatex(mulFraction(makeFraction(c, 1), ratioValue))}$，解得 $x=${x}$。`
        );
        continue;
      }

      let x = randInt(-1, 5);
      let p = randInt(1, 4);
      let q = randInt(2, 5);
      let lhs1 = -x + p;
      let lhs2 = 3 * x - q;
      while (lhs2 === 0 || (lhs1 === 0 && lhs2 === 0)) {
        x = randInt(-1, 5);
        p = randInt(1, 4);
        q = randInt(2, 5);
        lhs1 = -x + p;
        lhs2 = 3 * x - q;
      }
      const ratio = normalizeRatioInts(lhs1, lhs2);
      questions.push(
        `求比例式 $(${formatSingleVarExpr(-1, p)}):(${formatSingleVarExpr(3, -q)})=${ratio.a}:${ratio.b}$ 中的 $x$ 值。`
      );
      answers.push(
        `由比例式可得 $${ratio.b}(${formatSingleVarExpr(-1, p)})=${ratio.a}(${formatSingleVarExpr(3, -q)})$。整理後解得 $x=${x}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231RelationTransformSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const p = randInt(3, 8);
        const q = randInt(2, 6);
        const m = randInt(2, 5);
        const n = randInt(2, 5);
        const ratio = normalizeRatioInts(m * q, n * p);
        questions.push(`已知 $${p}x=${q}y$（$x,y\\ne 0$），求 $${m}x:${n}y$。`);
        answers.push(
          `由 $${p}x=${q}y$ 可得 $x:y=${q}:${p}$。因此 $${m}x:${n}y=${m}\\times ${q}:${n}\\times ${p}=${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 1) {
        const lx = randInt(3, 7);
        const ly = -randInt(1, 4);
        const rx = randInt(1, lx - 1);
        const ry = randInt(1, 4);
        const xCoef = lx - rx;
        const yCoef = ry - ly;
        const ratio = normalizeRatioInts(yCoef, xCoef);
        questions.push(
          `已知 $${formatTerm(lx, 'x')}${ly > 0 ? '+' : ''}${formatTerm(ly, 'y')}=${formatTerm(rx, 'x')}${ry > 0 ? '+' : ''}${formatTerm(ry, 'y')}$，整理後求 $x:y$。`
        );
        answers.push(
          `移項整理得 $${formatTerm(xCoef, 'x')}=${formatTerm(yCoef, 'y')}$，因此 $x:y=${yCoef}:${xCoef}$，最簡整數比為 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 2) {
        const xRatio = randInt(2, 5);
        const yRatio = randInt(2, 5);
        const base = normalizeRatioInts(xRatio, yRatio);
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        let c = randInt(1, 4);
        let d = randInt(1, 4);
        while (a === c && b === d) {
          c = randInt(1, 4);
          d = randInt(1, 4);
        }
        const result = normalizeRatioInts(a * base.a + b * base.b, c * base.a + d * base.b);
        questions.push(`已知 $x:y=${base.a}:${base.b}$，求 $(${a}x+${b}y):(${c}x+${d}y)$。`);
        answers.push(
          `由 $x:y=${base.a}:${base.b}$，可設 $x=${base.a}k,\\ y=${base.b}k$。代入得 $(${a}x+${b}y):(${c}x+${d}y)=(${a * base.a + b * base.b})k:(${c * base.a + d * base.b})k=${result.a}:${result.b}$。`
        );
        continue;
      }

      const base = normalizeRatioInts(randInt(2, 5), randInt(2, 5));
      const numerator = 3 * base.a * base.a + 4 * base.a * base.b;
      const denominator = 2 * base.a * base.b + 5 * base.b * base.b;
      const value = simplifyFraction(numerator, denominator);
      questions.push(`已知 $x:y=${base.a}:${base.b}$，求 $\\dfrac{3x^2+4xy}{2xy+5y^2}$ 的值。`);
      answers.push(
        `由 $x:y=${base.a}:${base.b}$，可設 $x=${base.a}k,\\ y=${base.b}k$。代入後分子為 $(3\\times ${base.a}^2+4\\times ${base.a}\\times ${base.b})k^2=${numerator}k^2$，分母為 $(2\\times ${base.a}\\times ${base.b}+5\\times ${base.b}^2)k^2=${denominator}k^2$，所以值為 $${fractionToLatex(value)}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231BasicSingleStepSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const left = randomMixedFraction(1, 3, [2, 3, 4, 5], false);
        const decimalChoices = [
          { text: '0.75', frac: makeFraction(3, 4) },
          { text: '1.2', frac: makeFraction(6, 5) },
          { text: '2.25', frac: makeFraction(9, 4) },
          { text: '0.6', frac: makeFraction(3, 5) },
        ];
        const rightChoice = decimalChoices[cycle % decimalChoices.length];
        if (cycle % 2 === 0) {
          const ratio = normalizeRatioFromFractions(left, rightChoice.frac);
          const common = lcm(left.den, rightChoice.frac.den);
          questions.push(`將 $${integerOrFractionLatex(left)}:${rightChoice.text}$ 化為最簡整數比。`);
          answers.push(
            `先把帶分數與小數化成分數：$${integerOrFractionLatex(left)}=${fractionToLatex(left)}$，$${rightChoice.text}=${fractionToLatex(rightChoice.frac)}$。再同乘分母的最小公倍數 ${common}，化成整數比後約分，可得最簡整數比 $${ratio.a}:${ratio.b}$。`
          );
        } else {
          const value = divFraction(left, rightChoice.frac);
          questions.push(`求 $${integerOrFractionLatex(left)}:${rightChoice.text}$ 的比值。`);
          answers.push(
            `先把小數化成分數：$${rightChoice.text}=${fractionToLatex(rightChoice.frac)}$。比值就是前項除以後項，所以 $${fractionToLatex(left)}\\div ${fractionToLatex(rightChoice.frac)}=${fractionToLatex(value)}$。`
          );
        }
        continue;
      }

      if (variant === 1) {
        const templates = [
          { maleRatio: 7, femaleRatio: 4, mode: 'diff', unit: 17, ask: 'male' },
          { maleRatio: 7, femaleRatio: 4, mode: 'total', unit: 12, ask: 'male' },
          { maleRatio: 5, femaleRatio: 3, mode: 'total', unit: 11, ask: 'female' },
          { maleRatio: 8, femaleRatio: 5, mode: 'diff', unit: 9, ask: 'male' },
          { maleRatio: 6, femaleRatio: 5, mode: 'total', unit: 10, ask: 'male' },
          { maleRatio: 9, femaleRatio: 7, mode: 'diff', unit: 8, ask: 'female' },
          { maleRatio: 4, femaleRatio: 3, mode: 'total', unit: 14, ask: 'female' },
          { maleRatio: 10, femaleRatio: 7, mode: 'diff', unit: 6, ask: 'male' },
          { maleRatio: 11, femaleRatio: 9, mode: 'total', unit: 5, ask: 'male' },
          { maleRatio: 12, femaleRatio: 7, mode: 'diff', unit: 4, ask: 'female' },
        ];
        const pick = templates[cycle % templates.length];
        const male = pick.maleRatio * pick.unit;
        const female = pick.femaleRatio * pick.unit;
        if (pick.mode === 'diff') {
          const diff = male - female;
          questions.push(
            `某班男生與女生的人數比為 $${pick.maleRatio}:${pick.femaleRatio}$，已知男生比女生多 ${diff} 人，求男生有多少人。`
          );
          answers.push(
            `因為男生比女生多 $${pick.maleRatio - pick.femaleRatio}$ 份，而這幾份對應 ${diff} 人，所以 1 份是 ${pick.unit} 人。男生有 $${pick.maleRatio}$ 份，因此男生共有 ${male} 人。`
          );
        } else {
          const total = male + female;
          if (pick.ask === 'male') {
            questions.push(
              `某班男生與女生的人數比為 $${pick.maleRatio}:${pick.femaleRatio}$，全班共有 ${total} 人，求男生有多少人。`
            );
            answers.push(
              `總份數是 $${pick.maleRatio + pick.femaleRatio}$ 份，所以 1 份是 ${pick.unit} 人。男生有 $${pick.maleRatio}$ 份，因此男生共有 ${male} 人。`
            );
          } else {
            questions.push(
              `某班男生與女生的人數比為 $${pick.maleRatio}:${pick.femaleRatio}$，全班共有 ${total} 人，求女生有多少人。`
            );
            answers.push(
              `總份數是 $${pick.maleRatio + pick.femaleRatio}$ 份，所以 1 份是 ${pick.unit} 人。女生有 $${pick.femaleRatio}$ 份，因此女生共有 ${female} 人。`
            );
          }
        }
        continue;
      }

      if (variant === 2) {
        if (cycle % 2 === 0) {
          const ratioChoices = [
            { a: 3, b: 2, unit: 100, target: '弟弟' },
            { a: 4, b: 3, unit: 80, target: '哥哥' },
            { a: 5, b: 4, unit: 70, target: '乙' },
            { a: 7, b: 5, unit: 60, target: '弟弟' },
            { a: 8, b: 3, unit: 50, target: '哥哥' },
            { a: 9, b: 7, unit: 40, target: '乙' },
          ];
          const pick = ratioChoices[cycle % ratioChoices.length];
          const total = (pick.a + pick.b) * pick.unit;
          const leftMoney = pick.a * pick.unit;
          const rightMoney = pick.b * pick.unit;
          if (pick.target === '哥哥') {
            questions.push(`哥哥與弟弟共有 ${total} 元，兩人的錢數比為 $${pick.a}:${pick.b}$，求哥哥有多少元。`);
            answers.push(
              `總份數是 $${pick.a + pick.b}$ 份，所以 1 份是 ${pick.unit} 元。哥哥有 $${pick.a}$ 份，因此哥哥有 ${leftMoney} 元。`
            );
          } else if (pick.target === '弟弟') {
            questions.push(`哥哥與弟弟共有 ${total} 元，兩人的錢數比為 $${pick.a}:${pick.b}$，求弟弟有多少元。`);
            answers.push(
              `總份數是 $${pick.a + pick.b}$ 份，所以 1 份是 ${pick.unit} 元。弟弟有 $${pick.b}$ 份，因此弟弟有 ${rightMoney} 元。`
            );
          } else {
            questions.push(`甲、乙兩人共有 ${total} 元，兩人的錢數比為 $${pick.a}:${pick.b}$，求乙有多少元。`);
            answers.push(
              `總份數是 $${pick.a + pick.b}$ 份，所以 1 份是 ${pick.unit} 元。乙有 $${pick.b}$ 份，因此乙有 ${rightMoney} 元。`
            );
          }
        } else {
          const scaleChoices = [
            { scale: 50000, mapCm: 16 },
            { scale: 25000, mapCm: 12 },
            { scale: 200000, mapCm: 3.5 },
            { scale: 100000, mapCm: 7.2 },
            { scale: 40000, mapCm: 9.5 },
            { scale: 80000, mapCm: 6.25 },
          ];
          const pick = scaleChoices[cycle % scaleChoices.length];
          const actualCm = pick.scale * pick.mapCm;
          const actualKm = actualCm / 100000;
          questions.push(
            `在比例尺 $1:${pick.scale}$ 的地圖上，甲、乙兩地距離是 ${pick.mapCm} 公分，求實際距離是多少公里？`
          );
          answers.push(
            `比例尺 $1:${pick.scale}$ 表示地圖上 1 公分代表實際 ${pick.scale} 公分，所以實際距離是 $${pick.mapCm}\\times ${pick.scale}=${actualCm}$ 公分。再換成公里得 ${actualKm} 公里。`
          );
        }
        continue;
      }

      if (variant === 3) {
        const radiusPool = [
          { radiusA: 2, radiusB: 5 },
          { radiusA: 3, radiusB: 7 },
          { radiusA: 4, radiusB: 9 },
          { radiusA: 5, radiusB: 8 },
          { radiusA: 6, radiusB: 11 },
          { radiusA: 7, radiusB: 10 },
          { radiusA: 8, radiusB: 13 },
          { radiusA: 9, radiusB: 14 },
        ];
        const pick = radiusPool[cycle % radiusPool.length];
        const radiusA = pick.radiusA;
        const radiusB = pick.radiusB;
        const ratio = normalizeRatioInts(radiusA, radiusB);
        questions.push(`已知兩個圓的半徑比為 $${radiusA}:${radiusB}$，求這兩個圓的周長比。`);
        answers.push(
          `圓周長公式是 $C=2\\pi r$，兩個圓的周長都同乘 $2\\pi$，所以周長比與半徑比相同，仍是 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      const ratioTemplates = [
        { m: 2, n: 3 },
        { m: 3, n: 5 },
        { m: 4, n: 6 },
        { m: 5, n: 7 },
        { m: 6, n: 11 },
        { m: 7, n: 9 },
        { m: 8, n: 13 },
        { m: 9, n: 10 },
      ];
      const pick = ratioTemplates[cycle % ratioTemplates.length];
      const m = pick.m;
      const n = pick.n;
      const ratio = normalizeRatioInts(m + n, 2 * n - m);
      questions.push(`若 $(2x-y):${m}=(x+y):${n}$，求 $x:y$ 的最簡整數比。`);
      answers.push(
        `由題意可得 $${n}(2x-y)=${m}(x+y)$。整理得 $${2 * n - m}x=${m + n}y$，所以 $x:y=${m + n}:${2 * n - m}$，最簡整數比為 $${ratio.a}:${ratio.b}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231RegularTwoStepSet(count) {
    const questions = [];
    const answers = [];
    const variants = shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 2) {
        const templates = [
          { m: 3, n: 2, p: 2, q: 1, d: 50 },
          { m: 4, n: 3, p: 3, q: 2, d: 40 },
          { m: 5, n: 3, p: 3, q: 1, d: 60 },
          { m: 6, n: 5, p: 5, q: 4, d: 30 },
          { m: 7, n: 4, p: 3, q: 2, d: 56 },
        ];
        const pick = templates[cycle % templates.length];
        const unit = (pick.p * pick.d) / (pick.p * pick.n - pick.q * pick.m);
        const total = (pick.m + pick.n) * unit;
        questions.push(
          `某校上學期男生與女生人數比為 $${pick.m}:${pick.n}$。下學期男生人數不變，女生減少 ${pick.d} 人後，男女生比變為 $${pick.p}:${pick.q}$，求上學期全校共有多少人。`
        );
        answers.push(
          `設上學期男、女生分別為 $${pick.m}k,\ ${pick.n}k$ 人。依題意有 $${pick.m}k:(${pick.n}k-${pick.d})=${pick.p}:${pick.q}$。交叉相乘得 $${pick.q * pick.m}k=${pick.p * pick.n}k-${pick.p * pick.d}$，解得 $k=${unit}$。因此上學期全校共有 $(${pick.m}+${pick.n})\\times ${unit}=${total}$ 人。`
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { abLeft: 2, abRight: 5, bcLeft: 3, bcRight: 5, unit: 10 },
          { abLeft: 3, abRight: 4, bcLeft: 2, bcRight: 5, unit: 12 },
          { abLeft: 2, abRight: 3, bcLeft: 4, bcRight: 5, unit: 9 },
          { abLeft: 3, abRight: 5, bcLeft: 2, bcRight: 3, unit: 15 },
          { abLeft: 4, abRight: 7, bcLeft: 3, bcRight: 8, unit: 8 },
        ];
        const pick = templates[cycle % templates.length];
        const aRatio = pick.abRight * pick.bcRight;
        const bRatio = pick.abLeft * pick.bcRight;
        const cRatio = pick.abLeft * pick.bcLeft;
        const aMoney = aRatio * pick.unit;
        const bMoney = bRatio * pick.unit;
        const cMoney = cRatio * pick.unit;
        const total = aMoney + bMoney + cMoney;
        questions.push(
          `甲、乙、丙三人共出資 ${total} 元買禮物。已知甲出的錢的 ${pick.abLeft} 倍等於乙出的錢的 ${pick.abRight} 倍，乙出的錢的 ${pick.bcLeft} 倍等於丙出的錢的 ${pick.bcRight} 倍，求三人各出多少元。`
        );
        answers.push(
          `由題意可得 $甲:乙=${pick.abRight}:${pick.abLeft}$，又 $乙:丙=${pick.bcRight}:${pick.bcLeft}$。合併得 $甲:乙:丙=${aRatio}:${bRatio}:${cRatio}$。總份數是 ${aRatio + bRatio + cRatio} 份，所以 1 份是 ${pick.unit} 元。故甲、乙、丙分別出 ${aMoney} 元、${bMoney} 元、${cMoney} 元。`
        );
        continue;
      }

      if (variant === 4) {
        const geometryTemplates = [
          { total: 72, m: 3, n: 4 },
          { total: 80, m: 4, n: 5 },
          { total: 96, m: 5, n: 7 },
          { total: 84, m: 3, n: 5 },
          { total: 90, m: 4, n: 7 },
        ];
        const pick = geometryTemplates[cycle % geometryTemplates.length];
        const total = pick.total;
        const m = pick.m;
        const n = pick.n;
        const areaRatio = normalizeRatioInts(m * m, n * n);
        questions.push(
          `將一條 ${total} 公分的繩子按 $${m}:${n}$ 的比例剪成兩段後，各圍成一個正方形，求這兩個正方形的面積比。`
        );
        answers.push(
          `因為兩段繩長比是 $${m}:${n}$，而正方形邊長都等於周長除以 4，所以兩正方形的邊長比也仍是 $${m}:${n}$。面積比等於邊長比平方，因此面積比為 $${m}^2:${n}^2=${areaRatio.a}:${areaRatio.b}$。`
        );
        continue;
      }

      if (variant === 5) {
        const templates = [
          { m: 5, n: 6, up1: 8, up2: 5 },
          { m: 4, n: 5, up1: 10, up2: 20 },
          { m: 3, n: 4, up1: 15, up2: 10 },
          { m: 6, n: 7, up1: 12, up2: 6 },
          { m: 7, n: 9, up1: 5, up2: 15 },
        ];
        const pick = templates[cycle % templates.length];
        const ratio = normalizeRatioInts(pick.m * (100 + pick.up1), pick.n * (100 + pick.up2));
        questions.push(
          `甲、乙兩人去年的月薪比為 $${pick.m}:${pick.n}$，今年分別調薪 ${pick.up1}% 與 ${pick.up2}% ，求調薪後兩人的月薪比。`
        );
        answers.push(
          `設去年月薪分別為 $${pick.m}k,\ ${pick.n}k$。調薪後變成 $${pick.m}\\left(1+\\frac{${pick.up1}}{100}\\right)k$ 與 $${pick.n}\\left(1+\\frac{${pick.up2}}{100}\\right)k$，所以新比為 $${pick.m * (100 + pick.up1)}:${pick.n * (100 + pick.up2)}=${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 6) {
        const templates = [
          { m: 5, n: 2, years: 3, sum: 55 },
          { m: 4, n: 1, years: 4, sum: 63 },
          { m: 7, n: 3, years: 2, sum: 64 },
          { m: 6, n: 5, years: 3, sum: 97 },
          { m: 3, n: 2, years: 5, sum: 65 },
        ];
        const pick = templates[cycle % templates.length];
        const unit = (pick.sum - 2 * pick.years) / (pick.m + pick.n);
        const father = pick.m * unit;
        const son = pick.n * unit;
        questions.push(
          `父子兩人現在年齡比為 $${pick.m}:${pick.n}$，已知 ${pick.years} 年後兩人的年齡和為 ${pick.sum} 歲，求父子現在各幾歲。`
        );
        answers.push(
          `設父子現在分別為 $${pick.m}k,\ ${pick.n}k$ 歲。${pick.years} 年後年齡和為 $(${pick.m}+${pick.n})k+2\\times ${pick.years}=${pick.sum}$，解得 $k=${unit}$。因此父親現在 ${father} 歲，兒子現在 ${son} 歲。`
        );
        continue;
      }

      if (variant === 7) {
        const templates = [
          { a: 6, b: 5, addA: 5, addB: 3, p: 5, q: 4, unit: 5, item: '唱片' },
          { a: 5, b: 4, addA: 6, addB: 2, p: 4, q: 3, unit: 10, item: '郵票' },
          { a: 7, b: 5, addA: 4, addB: 2, p: 3, q: 2, unit: 2, item: '貼紙' },
          { a: 8, b: 7, addA: 9, addB: 2, p: 5, q: 4, unit: 3, item: '明信片' },
          { a: 9, b: 5, addA: 5, addB: 3, p: 7, q: 4, unit: 2, item: '卡片' },
        ];
        const pick = templates[cycle % templates.length];
        const left = pick.a * pick.unit;
        const right = pick.b * pick.unit;
        questions.push(
          `小甲和小乙原有${pick.item}張數比為 $${pick.a}:${pick.b}$，小甲又增加 ${pick.addA} 張，小乙又增加 ${pick.addB} 張後，張數比變為 $${pick.p}:${pick.q}$，求兩人原有的${pick.item}總數。`
        );
        answers.push(
          `設原本共有 $${pick.a}k$ 與 $${pick.b}k$ 張。依題意有 $(${pick.a}k+${pick.addA}):(${pick.b}k+${pick.addB})=${pick.p}:${pick.q}$。交叉相乘後解得 $k=${pick.unit}$，所以原本總數為 $${pick.a}k+${pick.b}k=${left + right}$ 張。`
        );
        continue;
      }

      if (variant === 8) {
        const templates = [
          { firstA: 5, firstB: 4, removeA: 4, secondA: 5, secondB: 3, removeB: 14, black: 74, white: 56 },
          { firstA: 6, firstB: 5, removeA: 6, secondA: 4, secondB: 3, removeB: 12, black: 66, white: 60 },
          { firstA: 7, firstB: 6, removeA: 5, secondA: 3, secondB: 2, removeB: 15, black: 61, white: 54 },
          { firstA: 8, firstB: 7, removeA: 4, secondA: 4, secondB: 3, removeB: 16, black: 84, white: 72 },
          { firstA: 9, firstB: 8, removeA: 7, secondA: 5, secondB: 4, removeB: 18, black: 88, white: 80 },
        ];
        const pick = templates[cycle % templates.length];
        const numerator = pick.firstA * pick.removeB;
        const denominator = pick.secondA * pick.firstB - pick.firstA * pick.secondB;
        const kValue = makeFraction(numerator, denominator);
        const kText = fractionToLatex(kValue);
        questions.push(
          `原本黑羊與白羊若干隻，黑羊減少 ${pick.removeA} 隻後比變為 $${pick.firstA}:${pick.firstB}$；之後白羊再減少 ${pick.removeB} 隻，比變為 $${pick.secondA}:${pick.secondB}$，求原本黑羊、白羊各多少隻。`
        );
        answers.push(
          `設第二次變化後黑羊、白羊分別為 $${pick.secondA}k$、$${pick.secondB}k$。回推到第一次變化後，黑羊不變、白羊多 ${pick.removeB} 隻，所以有 $${pick.secondA}k:(${pick.secondB}k+${pick.removeB})=${pick.firstA}:${pick.firstB}$。解得 $k=${kText}$。因此第一次變化後白羊有 ${pick.white} 隻、黑羊有 ${pick.black - pick.removeA} 隻，再把黑羊補回 ${pick.removeA} 隻，可得原本黑羊 ${pick.black} 隻、白羊 ${pick.white} 隻。`
        );
        continue;
      }

      if (variant === 9) {
        const templates = [
          { a: 3, b: 2, spend: 150, gain: 275, p: 2, q: 3, unit: 200 },
          { a: 5, b: 3, spend: 160, gain: 260, p: 3, q: 4, unit: 140 },
          { a: 4, b: 3, spend: 180, gain: 240, p: 2, q: 3, unit: 165 },
          { a: 7, b: 5, spend: 210, gain: 320, p: 3, q: 4, unit: 160 },
          { a: 6, b: 5, spend: 190, gain: 350, p: 2, q: 3, unit: 180 },
        ];
        const pick = templates[cycle % templates.length];
        const left = pick.a * pick.unit;
        const right = pick.b * pick.unit;
        questions.push(
          `小甲與小乙原有零用錢比為 $${pick.a}:${pick.b}$，小甲花掉 ${pick.spend} 元，小乙意外獲得 ${pick.gain} 元後，比變為 $${pick.p}:${pick.q}$，求兩人原有多少錢。`
        );
        answers.push(
          `設原本兩人分別有 $${pick.a}k$ 元、$${pick.b}k$ 元。依題意有 $(${pick.a}k-${pick.spend}):(${pick.b}k+${pick.gain})=${pick.p}:${pick.q}$。交叉相乘後解得 $k=${pick.unit}$，所以原本分別是 ${left} 元與 ${right} 元。`
        );
        continue;
      }

      if (variant === 10) {
        const templates = [
          { m: 10, f: 9, cutM: makeFraction(1, 5), cutF: makeFraction(1, 6) },
          { m: 7, f: 5, cutM: makeFraction(1, 7), cutF: makeFraction(1, 5) },
          { m: 8, f: 3, cutM: makeFraction(1, 4), cutF: makeFraction(1, 3) },
          { m: 9, f: 7, cutM: makeFraction(1, 6), cutF: makeFraction(1, 7) },
          { m: 6, f: 5, cutM: makeFraction(1, 3), cutF: makeFraction(1, 4) },
        ];
        const pick = templates[cycle % templates.length];
        const remainM = simplifyFraction(pick.m * (pick.cutM.den - pick.cutM.num), pick.cutM.den);
        const remainF = simplifyFraction(pick.f * (pick.cutF.den - pick.cutF.num), pick.cutF.den);
        const ratio = normalizeRatioInts(remainM.num * remainF.den, remainF.num * remainM.den);
        questions.push(
          `某校去年新生男生與女生比為 $${pick.m}:${pick.f}$，今年男生減少 $${fractionToLatex(pick.cutM)}$，女生減少 $${fractionToLatex(pick.cutF)}$，求今年新生的男生與女生比。`
        );
        answers.push(
          `把去年人數設為 $${pick.m}k$ 與 $${pick.f}k$。今年剩下的男生是 $${pick.m}k\\left(1-${fractionToLatex(pick.cutM)}\\right)$，女生是 $${pick.f}k\\left(1-${fractionToLatex(pick.cutF)}\\right)$。整理後比為 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 11) {
        const templates = [
          { a: 8, b: 7, leaveA: 3, leaveB: 5, p: 7, q: 6, unit: 17 },
          { a: 9, b: 8, leaveA: 4, leaveB: 6, p: 5, q: 4, unit: 14 },
          { a: 7, b: 6, leaveA: 2, leaveB: 4, p: 4, q: 3, unit: 10 },
          { a: 10, b: 9, leaveA: 5, leaveB: 8, p: 3, q: 2, unit: 18 },
          { a: 11, b: 9, leaveA: 4, leaveB: 7, p: 5, q: 4, unit: 11 },
        ];
        const pick = templates[cycle % templates.length];
        const male = pick.a * pick.unit;
        const female = pick.b * pick.unit;
        questions.push(
          `原本教室男、女生比為 $${pick.a}:${pick.b}$，走掉 ${pick.leaveA} 個男生、${pick.leaveB} 個女生後，比變為 $${pick.p}:${pick.q}$，求原本全班共有多少人。`
        );
        answers.push(
          `設原本男、女生分別為 $${pick.a}k$、$${pick.b}k$。依題意有 $(${pick.a}k-${pick.leaveA}):(${pick.b}k-${pick.leaveB})=${pick.p}:${pick.q}$。交叉相乘後解得 $k=${pick.unit}$，所以原本全班共有 ${male + female} 人。`
        );
        continue;
      }

      const templates = [
        { m: 5, n: 6, up1: 6, up2: 12 },
        { m: 7, n: 8, up1: 9, up2: 15 },
        { m: 4, n: 7, up1: 20, up2: 5 },
        { m: 6, n: 5, up1: 8, up2: 16 },
        { m: 3, n: 5, up1: 25, up2: 10 },
      ];
      const pick = templates[cycle % templates.length];
      const ratio = normalizeRatioInts(pick.m * (100 + pick.up1), pick.n * (100 + pick.up2));
      questions.push(
        `阿雄與小祥去年的月薪比為 $${pick.m}:${pick.n}$，今年分別調薪 ${pick.up1}% 與 ${pick.up2}% ，求調薪後兩人的月薪比。`
      );
      answers.push(
        `設去年月薪分別為 $${pick.m}k,\ ${pick.n}k$。調薪後變成 $${pick.m}\\left(1+\\frac{${pick.up1}}{100}\\right)k$ 與 $${pick.n}\\left(1+\\frac{${pick.up2}}{100}\\right)k$，所以新比為 $${pick.m * (100 + pick.up1)}:${pick.n * (100 + pick.up2)}=${ratio.a}:${ratio.b}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231ConcentrationReverseSet(count) {
    const questions = [];
    const answers = [];

    function formatPercentLatexLocal(value) {
      const frac =
        typeof value === 'number'
          ? makeFraction(Math.round(value * 1000000), 1000000)
          : makeFraction(value.num, value.den);
      return frac.den === 1 ? `${frac.num}` : fractionToLatex(frac);
    }

    function formatAmountLatexLocal(value) {
      const frac =
        typeof value === 'number'
          ? makeFraction(Math.round(value * 1000000), 1000000)
          : makeFraction(value.num, value.den);
      return frac.den === 1 ? `${frac.num}` : fractionToLatex(frac);
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;
      const cycle = Math.floor(i / 6);

      if (variant === 0) {
        const templates = [
          { a: 3, b: 1, c: 1, d: 1 },
          { a: 4, b: 1, c: 3, d: 2 },
          { a: 5, b: 2, c: 1, d: 1 },
          { a: 7, b: 3, c: 4, d: 1 },
          { a: 2, b: 1, c: 5, d: 3 },
        ];
        const pick = templates[cycle % templates.length];
        const s1 = makeFraction(pick.b, pick.a + pick.b);
        const s2 = makeFraction(pick.d, pick.c + pick.d);
        const avg = divFraction(addFraction(s1, s2), makeFraction(2, 1));
        questions.push(
          `兩罐相同重量的酒精溶液中，甲罐水與酒精比為 $${pick.a}:${pick.b}$，乙罐水與酒精比為 $${pick.c}:${pick.d}$。若兩罐全部混合，求混合後的酒精重量百分濃度。`
        );
        answers.push(
          formatJ231Answer(
            `${formatPercentLatexLocal(simplifyFraction(avg.num * 100, avg.den))}\\%`,
            `設兩罐各重 $w$ 克，則酒精分別為 $${fractionToLatex(s1)}w$ 與 $${fractionToLatex(s2)}w$。混合後酒精共重 $\\left(${fractionToLatex(s1)}+${fractionToLatex(s2)}\\right)w$，總重量是 $2w$，所以濃度為 $${fractionToLatex(avg)}=${formatPercentLatexLocal(simplifyFraction(avg.num * 100, avg.den))}\\%$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { total: 300, start: 10, target: 6 },
          { total: 360, start: 12, target: 8 },
          { total: 420, start: 15, target: 9 },
          { total: 400, start: 14, target: 7 },
          { total: 280, start: 9, target: 6 },
        ];
        const pick = templates[cycle % templates.length];
        const total = pick.total;
        const start = pick.start;
        const target = pick.target;
        const solute = simplifyFraction(total * start, 100);
        const finalWeight = divFraction(mulFraction(solute, makeFraction(100, 1)), makeFraction(target, 1));
        const water = subFraction(finalWeight, makeFraction(total, 1));
        questions.push(
          `有一杯 ${total} 公克、濃度 ${start}% 的食鹽水，若要把濃度稀釋成 ${target}% ，需要再加入多少公克的水？`
        );
        answers.push(
          formatJ231Answer(
            `${formatAmountLatexLocal(water)} 公克`,
            `原來食鹽量不變，為 $${total}\\times ${start}\\%=${formatAmountLatexLocal(solute)}$ 公克。設加水後總重量為 $x$ 公克，則有 $${target}\\%\\times x=${formatAmountLatexLocal(solute)}$，解得 $x=${formatAmountLatexLocal(finalWeight)}$。所以要再加 $${formatAmountLatexLocal(water)}$ 公克的水。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { total: 240, start: 8, target: 20 },
          { total: 300, start: 10, target: 25 },
          { total: 360, start: 12, target: 30 },
          { total: 420, start: 10, target: 28 },
          { total: 280, start: 12, target: 24 },
        ];
        const pick = templates[cycle % templates.length];
        const total = pick.total;
        const start = pick.start;
        const target = pick.target;
        const startSolute = simplifyFraction(total * start, 100);
        const targetSoluteBeforeAdd = simplifyFraction(target * total, 100);
        const numerator = subFraction(targetSoluteBeforeAdd, startSolute);
        const denominator = subFraction(makeFraction(1, 1), makeFraction(target, 100));
        const add = divFraction(numerator, denominator);
        questions.push(
          `有一杯 ${total} 公克、濃度 ${start}% 的食鹽水，若想把濃度提高到 ${target}% ，需要再加入多少公克的食鹽？`
        );
        answers.push(
          formatJ231Answer(
            `${formatAmountLatexLocal(add)} 公克`,
            `原本食鹽重 $${total}\\times ${start}\\%=${formatAmountLatexLocal(startSolute)}$ 公克。設加入食鹽 $x$ 公克後，總重量變成 $${total}+x$，食鹽重變成 $${formatAmountLatexLocal(startSolute)}+x$。依題意有 $\\dfrac{${formatAmountLatexLocal(startSolute)}+x}{${total}+x}=${target}\\%$，解得 $x=${formatAmountLatexLocal(add)}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { powder: 10, total: 360 },
          { powder: 12, total: 450 },
          { powder: 15, total: 540 },
          { powder: 8, total: 320 },
          { powder: 14, total: 600 },
        ];
        const pick = templates[cycle % templates.length];
        const powder = pick.powder;
        const water = powder * 9;
        const total = pick.total;
        const needPowder = total / 10;
        questions.push(
          `小明用 ${powder} 克咖啡粉加 ${water} 克水泡成咖啡。若想沖泡 ${total} 克相同濃度的咖啡，需要多少克咖啡粉？`
        );
        answers.push(
          formatJ231Answer(
            `${needPowder} 克`,
            `原來咖啡粉與總重量的比是 $${powder}:${powder + water}=1:10$，所以新的一杯若總重量是 ${total} 克，咖啡粉應為 $\\frac{1}{10}\\times ${total}=${needPowder}$ 克。`
          )
        );
        continue;
      }

      if (variant === 4) {
        const ratioTemplates = [
        { waterRatio: 1, waterRatioB: 2, saltRatio: 2, saltRatioB: 4 },
        { waterRatio: 2, waterRatioB: 4, saltRatio: 3, saltRatioB: 5 },
        { waterRatio: 3, waterRatioB: 5, saltRatio: 4, saltRatioB: 6 },
        { waterRatio: 2, waterRatioB: 3, saltRatio: 1, saltRatioB: 2 },
        { waterRatio: 4, waterRatioB: 7, saltRatio: 3, saltRatioB: 5 },
      ];
        const ratioPick = ratioTemplates[cycle % ratioTemplates.length];
        const waterRatio = ratioPick.waterRatio;
        const waterRatioB = ratioPick.waterRatioB;
        const saltRatio = ratioPick.saltRatio;
        const saltRatioB = ratioPick.saltRatioB;
        const concA = makeFraction(saltRatio, saltRatio + waterRatio);
        const concB = makeFraction(saltRatioB, saltRatioB + waterRatioB);
        questions.push(
          `甲、乙兩杯食鹽水中，水量比為 $${waterRatio}:${waterRatioB}$，含鹽量比為 $${saltRatio}:${saltRatioB}$，求兩杯食鹽水各自的重量百分濃度。`
        );
        answers.push(
          formatJ231Answer(
            `甲 ${fractionToLatex(concA)}、乙 ${fractionToLatex(concB)}`,
            `濃度就是 $\\dfrac{鹽}{鹽+水}$。所以甲杯濃度為 $\\dfrac{${saltRatio}}{${saltRatio}+${waterRatio}}=${fractionToLatex(concA)}$，乙杯濃度為 $\\dfrac{${saltRatioB}}{${saltRatioB}+${waterRatioB}}=${fractionToLatex(concB)}$。`
          )
        );
        continue;
      }

      const passTemplates = [
      { a: 2, b: 3, pa: 40, pb: 30 },
      { a: 3, b: 4, pa: 50, pb: 20 },
      { a: 4, b: 5, pa: 60, pb: 40 },
      { a: 5, b: 6, pa: 70, pb: 45 },
      { a: 3, b: 5, pa: 80, pb: 50 },
    ];
      const passPick = passTemplates[cycle % passTemplates.length];
      const a = passPick.a;
      const b = passPick.b;
      const pa = passPick.pa;
      const pb = passPick.pb;
      const combined = simplifyFraction(a * pa + b * pb, a + b);
      questions.push(
        `已知 A、B 兩班人數比為 $${a}:${b}$，A 班及格率 ${pa}% ，B 班及格率 ${pb}% ，求合併後的總及格率。`
      );
      answers.push(
        formatJ231Answer(
          `${formatPercentLatexLocal(combined)}\\%`,
          `把兩班人數設為 $${a}k$ 與 $${b}k$。則及格人數分別為 $${a}k\\times ${pa}\\%$ 與 $${b}k\\times ${pb}\\%$。所以總及格率為 $\\dfrac{${a}\\times ${pa}+${b}\\times ${pb}}{${a + b}}\\%=${formatPercentLatexLocal(combined)}\\%$。`
        )
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231AdvancedThreeStepSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const templates = [
          { girlsRemoved: 3, boysRemoved: 2, t: 6 },
          { girlsRemoved: 4, boysRemoved: 3, t: 8 },
          { girlsRemoved: 5, boysRemoved: 4, t: 10 },
          { girlsRemoved: 6, boysRemoved: 5, t: 12 },
          { girlsRemoved: 7, boysRemoved: 3, t: 14 },
          { girlsRemoved: 8, boysRemoved: 6, t: 16 },
          { girlsRemoved: 9, boysRemoved: 4, t: 18 },
          { girlsRemoved: 10, boysRemoved: 7, t: 20 },
          { girlsRemoved: 11, boysRemoved: 5, t: 22 },
          { girlsRemoved: 12, boysRemoved: 8, t: 24 },
        ];
        const pick = templates[cycle % templates.length];
        const girlsRemoved = pick.girlsRemoved;
        const boysRemoved = pick.boysRemoved;
        const t = pick.t;
        const finalBoys = 4 * t;
        const finalGirls = 3 * t;
        const afterFirstGirls = finalGirls + girlsRemoved;
        const originalBoys = finalBoys + boysRemoved;
        questions.push(
          `原本教室內男、女生若干人，先走掉 ${boysRemoved} 個男生，剩下的男、女生比為 $8:7$；之後又走掉 ${girlsRemoved} 個女生，最後比變為 $4:3$，求原本各有多少人。`
        );
        answers.push(
          formatJ231Answer(
            `男生 ${originalBoys} 人、女生 ${afterFirstGirls} 人`,
            `設第二次變化後男、女生為 $4k,\ 3k$。因為再往前回推時只多出 ${girlsRemoved} 個女生，所以有 $4k:(3k+${girlsRemoved})=8:7$。解得 $k=${t}$。因此第一次變化後男、女生分別為 ${finalBoys} 人、${afterFirstGirls} 人，再把先離開的 ${boysRemoved} 個男生補回去，可得原本男生 ${originalBoys} 人、女生 ${afterFirstGirls} 人。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const a = [20, 24, 30, 36, 40, 48, 60, 72, 80, 100][cycle % 10];
        const total = 45 * a;
        const remain = 36 * a;
        questions.push(
          `某校原有學生 ${total} 人，男、女生比為 $5:4$。若男、女生按 $4:5$ 的比例減少（即男生減少 $4a$ 人、女生減少 $5a$ 人），剩餘學生的男、女生比變為 $7:5$，求剩餘學生共有多少人。`
        );
        answers.push(
          formatJ231Answer(
            `${remain} 人`,
            `設原本男、女生分別為 $5k,\ 4k$ 人。依題意，減少後變成 $(5k-4a):(4k-5a)=7:5$。交叉相乘得 $25k-20a=28k-35a$，所以 $15a=3k$，即 $k=5a$。因此原本總數是 $9k=45a=${total}$，剩餘學生數是 $(5k-4a)+(4k-5a)=9k-9a=36a=${remain}$。`
          )
        );
        continue;
      }

      const templates = [
        { total: 300, start: 10, target: 6 },
        { total: 240, start: 12, target: 8 },
        { total: 360, start: 15, target: 10 },
        { total: 420, start: 8, target: 5 },
        { total: 280, start: 9, target: 6 },
        { total: 400, start: 14, target: 7 },
        { total: 540, start: 10, target: 5 },
        { total: 320, start: 12, target: 6 },
        { total: 450, start: 16, target: 8 },
        { total: 600, start: 15, target: 9 },
      ];
      const pick = templates[cycle % templates.length];
      const solute = simplifyFraction(pick.total * pick.start, 100);
      const finalWeight = divFraction(mulFraction(solute, makeFraction(100, 1)), makeFraction(pick.target, 1));
      const addWater = subFraction(finalWeight, makeFraction(pick.total, 1));
      questions.push(
        `一杯 ${pick.total} 公克的食鹽水濃度為 ${pick.start}% ，若想將濃度降至 ${pick.target}% ，需要再加入多少公克的水？`
      );
      answers.push(
        formatJ231Answer(
          `${fractionToLatex(addWater)} 公克`,
          `原來的食鹽量不變，都是 $${pick.total}\\times ${pick.start}\\%=${fractionToLatex(solute)}$ 公克。設加水後總重量為 $x$ 公克，則有 $${pick.target}\\%\\times x=${fractionToLatex(solute)}$，所以 $x=${fractionToLatex(finalWeight)}$。因此需要再加 $${fractionToLatex(finalWeight)}-${pick.total}=${fractionToLatex(addWater)}$ 公克的水。`
        )
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231KMethodSet(count) {
    const xTerm = (coef) => formatCoeffTerm(coef, "x", 1);
    const yTerm = (coef) => formatCoeffTerm(coef, "y", 1);
    const kTerm = (coef) => {
      if (coef === 0) return "0";
      if (coef === 1) return "k";
      if (coef === -1) return "-k";
      return `${coef}k`;
    };
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const m = randInt(2, 6);
        const n = randInt(2, 6);
        const k = randInt(2, 8);
        const x = m * k;
        const y = n * k;
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        const total = a * x + b * y;
        questions.push(`已知 $x:y=${m}:${n}$，且 $${xTerm(a)}${b > 0 ? '+' : ''}${yTerm(b)}=${total}$，求 $x,y$。`);
        answers.push(
          `設 $x=${m}k,\\ y=${n}k$。代入 $${xTerm(a)}${b > 0 ? '+' : ''}${yTerm(b)}=${total}$，得 $${kTerm(a * m)}+${kTerm(b * n)}=${total}$，所以 $k=${k}$。因此 $x=${x},\\ y=${y}$。`
        );
        continue;
      }

      if (variant === 1) {
        const m = randInt(2, 6);
        let n = -randInt(2, 5);
        while (Math.abs(m) === Math.abs(n)) n = -randInt(2, 5);
        const ratio = normalizeRatioInts(m + n, m - n);
        questions.push(`已知 $(a+b):(a-b)=${m}:${n}$，求 $a:b$。`);
        answers.push(
          `設 $a+b=${m}k,\\ a-b=${n}k$。兩式相加得 $2a=${m + n}k$，相減得 $2b=${m - n}k$，所以 $a:b=${m + n}:${m - n}=${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 2) {
        const m = randInt(2, 5);
        const n = randInt(1, 4);
        const ratio = normalizeRatioInts(m * m - n * n, m * m + n * n);
        questions.push(`已知 $x:y=${m}:${n}$，求 $(x^2-y^2):(x^2+y^2)$。`);
        answers.push(
          `設 $x=${m}k,\\ y=${n}k$。則 $(x^2-y^2):(x^2+y^2)=(${m}^2k^2-${n}^2k^2):(${m}^2k^2+${n}^2k^2)=(${m * m - n * n}):(${m * m + n * n})=${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { m: 5, n: 4, a: 2, b: 5 },
          { m: 4, n: 3, a: 3, b: 4 },
          { m: 7, n: 5, a: 2, b: 3 },
          { m: 3, n: 2, a: 5, b: 4 },
          { m: 6, n: 5, a: 4, b: 3 },
          { m: 5, n: 2, a: 1, b: 2 },
        ];
        const pick = templates[cycle % templates.length];
        const m = pick.m;
        const n = pick.n;
        const a = pick.a;
        const b = pick.b;
        const k = randInt(1, 6);
        const x = m * k;
        const y = n * k;
        const rhs = a * x - b * y;
        questions.push(`已知 $x:y=${m}:${n}$，且 $${xTerm(a)}-${yTerm(b)}=${rhs}$，求 $x,y$。`);
        answers.push(
          `設 $x=${m}k,\\ y=${n}k$。代入 $${xTerm(a)}-${yTerm(b)}=${rhs}$ 得 $${kTerm(a * m)}-${kTerm(b * n)}=${rhs}$，所以 $${kTerm(a * m - b * n)}=${rhs}$，解得 $k=${k}$。因此 $x=${x},\\ y=${y}$。`
        );
        continue;
      }

      const baseTemplates = [
        { m: 4, n: 1 },
        { m: 5, n: 3 },
        { m: 7, n: 1 },
        { m: 3, n: 1 },
        { m: 8, n: 2 },
        { m: 6, n: 2 },
      ];
      const basePick = baseTemplates[cycle % baseTemplates.length];
      const m = basePick.m;
      const n = basePick.n;
      const ratio = normalizeRatioInts(3 * m - n, m + 3 * n);
      questions.push(`已知 $(x+y):(x-y)=${m}:${n}$，求 $(x+2y):(2x-y)$。`);
      answers.push(
        `設 $x+y=${m}k,\\ x-y=${n}k$。兩式相加得 $2x=${m + n}k$，所以 $x=${formatFraction(m + n, 2)}k$；相減得 $2y=${m - n}k$，所以 $y=${formatFraction(m - n, 2)}k$。因此 $(x+2y):(2x-y)=\\left(${formatFraction(m + n, 2)}k+2\\times${formatFraction(m - n, 2)}k\\right):\\left(2\\times${formatFraction(m + n, 2)}k-${formatFraction(m - n, 2)}k\\right)=${3 * m - n}:${m + 3 * n}=${ratio.a}:${ratio.b}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ232BasicDirectInverseSet(count) {
    const questions = [];
    const answers = [];
    const variants = shuffle([0, 1, 2, 3, 4, 5]);
    const niceFractions = [
      makeFraction(1, 2),
      makeFraction(2, 3),
      makeFraction(3, 4),
      makeFraction(5, 4),
      makeFraction(3, 2),
      makeFraction(5, 3),
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 0) {
        const x0 = 2 + ((cycle * 2 + 1) % 5);
        const k = niceFractions[(cycle * 3 + 1) % niceFractions.length];
        const y0 = mulFraction(makeFraction(x0, 1), k);
        questions.push(`若 $y$ 與 $x$ 成正比，且當 $x=${x0}$ 時 $y=${fractionToLatex(y0)}$，求關係式。`);
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(k)}x$`,
            `因為正比可寫成 $y=kx$。由 $x=${x0},\\ y=${fractionToLatex(y0)}$ 得 $k=\\dfrac{${fractionToLatex(y0)}}{${x0}}=${fractionToLatex(k)}$，所以關係式為 $y=${fractionToLatex(k)}x$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const x0 = 2 + ((cycle * 3 + 2) % 5);
        const k = [12, 18, 20, 24, 30][cycle % 5];
        const y0 = divFraction(makeFraction(k, 1), makeFraction(x0, 1));
        questions.push(`若 $y$ 與 $x$ 成反比，且當 $x=${x0}$ 時 $y=${fractionToLatex(y0)}$，求關係式。`);
        answers.push(
          formatJ232Answer(
            `$xy=${k}$`,
            `因為反比可寫成 $xy=k$。由 $x=${x0},\\ y=${fractionToLatex(y0)}$ 得 $k=${x0}\\times ${fractionToLatex(y0)}=${k}$，所以關係式為 $xy=${k}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const x0 = 2 + ((cycle * 2) % 4);
        const x1 = 6 + ((cycle * 3 + 1) % 5);
        const k = niceFractions[(cycle * 5 + 2) % niceFractions.length];
        const y0 = mulFraction(makeFraction(x0, 1), k);
        const y1 = mulFraction(makeFraction(x1, 1), k);
        questions.push(
          `已知 $x$ 與 $y$ 成正比，當 $x=${x0}$ 時 $y=${fractionToLatex(y0)}$，求 $x=${x1}$ 時的 $y$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)}$`,
            `先由 $x=${x0},\\ y=${fractionToLatex(y0)}$ 求得比例常數 $k=${fractionToLatex(k)}$，所以關係式為 $y=${fractionToLatex(k)}x$。當 $x=${x1}$ 時，$y=${fractionToLatex(k)}\\times ${x1}=${fractionToLatex(y1)}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const x0 = 2 + ((cycle * 4 + 1) % 5);
        const k = [12, 18, 20, 24, 30][(cycle * 2 + 1) % 5];
        const y0 = divFraction(makeFraction(k, 1), makeFraction(x0, 1));
        const y1Options = [makeFraction(1, 2), makeFraction(3, 4), makeFraction(5, 3), makeFraction(5, 2)];
        const y1 = y1Options[cycle % y1Options.length];
        const x1 = divFraction(makeFraction(k, 1), y1);
        questions.push(
          `已知 $x$ 與 $y$ 成反比，當 $x=${x0}$ 時 $y=${fractionToLatex(y0)}$，求 $y=${fractionToLatex(y1)}$ 時的 $x$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$x=${fractionToLatex(x1)}$`,
            `先由 $x=${x0},\\ y=${fractionToLatex(y0)}$ 求得反比常數 $k=${k}$，所以關係式是 $xy=${k}$。當 $y=${fractionToLatex(y1)}$ 時，$x=\\dfrac{${k}}{${fractionToLatex(y1)}}=${fractionToLatex(x1)}$。`
          )
        );
        continue;
      }

      if (variant === 4) {
        const templates = [
          { x0: makeFraction(3, 4), y0: makeFraction(9, 8), x1: -2 },
          { x0: makeFraction(2, 3), y0: makeFraction(5, 6), x1: -3 },
          { x0: makeFraction(5, 4), y0: makeFraction(15, 8), x1: -4 },
          { x0: makeFraction(4, 5), y0: makeFraction(6, 5), x1: -5 },
          { x0: makeFraction(5, 6), y0: makeFraction(25, 18), x1: -6 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const x1 = pick.x1;
        const k = divFraction(y0, x0);
        const y1 = mulFraction(makeFraction(x1, 1), k);
        questions.push(
          `已知 $x$ 與 $y$ 成正比，當 $x=${fractionToLatex(x0)}$ 時 $y=${fractionToLatex(y0)}$，求 $x=${x1}$ 時的 $y$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)}$`,
            `由正比關係可設 $y=kx$。先求 $k=\\dfrac{${fractionToLatex(y0)}}{${fractionToLatex(x0)}}=${fractionToLatex(k)}$，所以 $y=${fractionToLatex(k)}x$。當 $x=${x1}$ 時，$y=${fractionToLatex(k)}\\times(${x1})=${fractionToLatex(y1)}$。`
          )
        );
        continue;
      }

      const templates = [
        { x0: makeFraction(14, 3), y0: negateFraction(makeFraction(6, 7)), y1: makeFraction(1, 2) },
        { x0: makeFraction(10, 3), y0: negateFraction(makeFraction(9, 5)), y1: makeFraction(3, 4) },
        { x0: makeFraction(15, 4), y0: negateFraction(makeFraction(8, 5)), y1: makeFraction(2, 3) },
        { x0: makeFraction(9, 2), y0: negateFraction(makeFraction(4, 3)), y1: makeFraction(5, 6) },
        { x0: makeFraction(8, 3), y0: negateFraction(makeFraction(15, 4)), y1: makeFraction(5, 4) },
      ];
      const pick = templates[cycle % templates.length];
      const x0 = pick.x0;
      const y0 = pick.y0;
      const y1 = pick.y1;
      const k = mulFraction(x0, y0);
      const x1 = divFraction(k, y1);
      questions.push(
        `已知 $x$ 與 $y$ 成反比，當 $x=${fractionToLatex(x0)}$ 時 $y=${fractionToLatex(y0)}$，求 $y=${fractionToLatex(y1)}$ 時的 $x$ 值。`
      );
      answers.push(
        formatJ232Answer(
          `$x=${fractionToLatex(x1)}$`,
          `由反比關係可設 $xy=k$。先求 $k=${fractionToLatex(x0)}\\times ${fractionToLatex(y0)}=${fractionToLatex(k)}$。當 $y=${fractionToLatex(y1)}$ 時，$x=\\dfrac{${fractionToLatex(k)}}{${fractionToLatex(y1)}}=${fractionToLatex(x1)}$。`
        )
      );
    }

    return { questions, answers };
  }

  function buildJ232LinearComboProportionSet(count) {
    const questions = [];
    const answers = [];
    const variants = shuffle([0, 1, 2, 3, 4]);

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 0) {
        let x0 = 1;
        let y0 = 1;
        let x1 = 1;
        let k = makeFraction(1, 1);
        let a = 2;
        let b = 9;
        let c = 5;
        let d = -2;
        let y1 = makeFraction(1, 1);
        for (let t = 0; t < 100; t += 1) {
          a = [2, 3][randInt(0, 1)];
          c = [4, 5, 6][randInt(0, 2)];
          b = [3, 5, 7, 9][randInt(0, 3)];
          d = [-4, -3, -2, 1][randInt(0, 3)];
          x0 = randInt(1, 4);
          y0 = randInt(1, 5);
          x1 = randInt(5, 8);
          const left0 = a * y0 + b;
          const right0 = c * x0 + d;
          if (right0 === 0) continue;
          k = simplifyFraction(left0, right0);
          if (Math.abs(k.num) > 5 * k.den) continue;
          const left1 = mulFraction(k, makeFraction(c * x1 + d, 1));
          const candidate = subFraction(left1, makeFraction(b, 1));
          if (candidate.den === 1 && candidate.num % a === 0) {
            y1 = makeFraction(candidate.num / a, 1);
            if (Math.abs(y1.num) <= 30) break;
          }
        }
        questions.push(
          `已知 $( ${formatTerm(a, 'y')}${b >= 0 ? '+' : ''}${b} )$ 與 $( ${formatTerm(c, 'x')}${d >= 0 ? '+' : ''}${d} )$ 成正比，且當 $x=${x0}$ 時 $y=${y0}$。求比例關係式，並求當 $x=${x1}$ 時的 $y$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$${formatTerm(a, 'y')}${b >= 0 ? '+' : ''}${b}=${fractionToLatex(k)}(${formatTerm(c, 'x')}${d >= 0 ? '+' : ''}${d})$，$y=${fractionToLatex(y1)}$`,
            `成正比可寫成 $${formatTerm(a, 'y')}${b >= 0 ? '+' : ''}${b}=k(${formatTerm(c, 'x')}${d >= 0 ? '+' : ''}${d})$。由 $x=${x0},\\ y=${y0}$ 得 $k=\\dfrac{${a * y0 + b}}{${c * x0 + d}}=${fractionToLatex(k)}$。所以關係式為 $${formatTerm(a, 'y')}${b >= 0 ? '+' : ''}${b}=${fractionToLatex(k)}(${formatTerm(c, 'x')}${d >= 0 ? '+' : ''}${d})$。當 $x=${x1}$ 時，解得 $y=${fractionToLatex(y1)}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { a: 2, b0: 3, b1: 12 },
          { a: 5, b0: 2, b1: 10 },
          { a: 4, b0: 5, b1: 15 },
          { a: 6, b0: 4, b1: 12 },
          { a: 3, b0: 6, b1: 18 },
          { a: 7, b0: 5, b1: 20 },
        ];
        const pick = templates[cycle % templates.length];
        const a = pick.a;
        const b0 = pick.b0;
        const b1 = pick.b1;
        const left = 3 * a + 7 * b0;
        const right = 3 * a + 13 * b0;
        const k = simplifyFraction(left, right);
        const newA = (a * b1) / b0;
        questions.push(
          `已知 $(3a+7b)$ 與 $(3a+13b)$ 成正比，當 $a=${a},\\ b=${b0}$ 時比例成立。若 $b=${b1}$，求 $a$。`
        );
        answers.push(
          formatJ232Answer(
            `$a=${newA}$`,
            `因為成正比，所以 $\\dfrac{3a+7b}{3a+13b}$ 為定值。由 $a=${a},\\ b=${b0}$ 可得此定值為 $\\dfrac{${left}}{${right}}=${fractionToLatex(k)}$。所以當 $b=${b1}$ 時，有 $\\dfrac{3a+${7 * b1}}{3a+${13 * b1}}=${fractionToLatex(k)}$，解得 $a=${newA}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const yShift = 2 + (cycle % 3);
        const xShift = 1 + ((cycle * 2 + 1) % 4);
        const x0 = 4 + ((cycle * 3 + 1) % 5);
        const y0 = 2 + ((cycle * 2) % 4);
        const x1Options = [1, 2, 4, 5, 7, 8];
        const x1 = x1Options[(cycle * 3 + 2) % x1Options.length];
        const k = (y0 + yShift) * (x0 + xShift);
        const y1 = makeFraction(k, x1 + xShift);
        const newY = subFraction(y1, makeFraction(yShift, 1));
        questions.push(`已知 $(y+${yShift})$ 與 $(x+${xShift})$ 成反比，當 $x=${x0}$ 時 $y=${y0}$，求 $x=${x1}$ 時的 $y$ 值。`);
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(newY)}$`,
            `因為成反比，所以 $(y+${yShift})(x+${xShift})=k$。由 $x=${x0},\\ y=${y0}$ 得 $k=(${y0}+${yShift})(${x0}+${xShift})=${k}$。因此當 $x=${x1}$ 時，$y+${yShift}=\\dfrac{${k}}{${x1}+${xShift}}=${fractionToLatex(y1)}$，所以 $y=${fractionToLatex(newY)}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { a0: -2, b0: -5, a1: 1 },
          { a0: -1, b0: 2, a1: 2 },
          { a0: 3, b0: -2, a1: -1 },
          { a0: 4, b0: 1, a1: -2 },
          { a0: -3, b0: 3, a1: 3 },
          { a0: 5, b0: -1, a1: 0 },
        ];
        const pick = templates[cycle % templates.length];
        const a0 = pick.a0;
        const b0 = pick.b0;
        const k = (5 * a0 - 2) * (b0 + 4);
        const a1 = pick.a1;
        const b1 = simplifyFraction(k, 5 * a1 - 2);
        const newB = subFraction(b1, makeFraction(4, 1));
        questions.push(`已知 $(5a-2)$ 與 $(b+4)$ 成反比，且當 $a=${a0}$ 時 $b=${b0}$。求 $a=${a1}$ 時的 $b$ 值。`);
        answers.push(
          formatJ232Answer(
            `$b=${fractionToLatex(newB)}$`,
            `由反比可得 $(5a-2)(b+4)=k$。代入 $a=${a0},\\ b=${b0}$ 得 $k=(${5 * a0 - 2})(${b0 + 4})=${k}$。當 $a=${a1}$ 時，$b+4=\\dfrac{${k}}{${5 * a1 - 2}}=${fractionToLatex(b1)}$，所以 $b=${fractionToLatex(newB)}$。`
          )
        );
        continue;
      }

      let xRatio = normalizeRatioInts(randInt(2, 6), randInt(2, 6));
      while (5 * xRatio.a - 6 * xRatio.b === 0) {
        xRatio = normalizeRatioInts(randInt(2, 6), randInt(2, 6));
      }
      const leftA = randInt(2, 5);
      const leftB = randInt(1, 4);
      const rightA = randInt(3, 6);
      const rightB = randInt(1, 4);
      const firstRatio = normalizeRatioInts(leftA * xRatio.a - leftB * xRatio.b, rightA * xRatio.a + rightB * xRatio.b);
      const secondRatio = normalizeRatioInts(3 * xRatio.a + 2 * xRatio.b, 5 * xRatio.a - 6 * xRatio.b);
      questions.push(
        `已知 $( ${formatTerm(leftA, 'x')}${leftB === 0 ? '' : '-' + formatTerm(leftB, 'y')} ):( ${formatTerm(rightA, 'x')}${rightB >= 0 ? '+' : ''}${formatTerm(rightB, 'y')} )=${firstRatio.a}:${firstRatio.b}$，求 $x:y$，再求 $(3x+2y):(5x-6y)$。`
      );
      answers.push(
        formatJ232Answer(
          `$x:y=${xRatio.a}:${xRatio.b}$，$(3x+2y):(5x-6y)=${secondRatio.a}:${secondRatio.b}$`,
          `設 $x:y=m:n$，則題目的比可寫成 $(${leftA}m-${formatTerm(leftB, 'n')}):(${rightA}m+${formatTerm(rightB, 'n')})$。由已知比可反推 $x:y=${xRatio.a}:${xRatio.b}$。再設 $x=${xRatio.a}k,\\ y=${xRatio.b}k$，可得 $(3x+2y):(5x-6y)=(${3 * xRatio.a + 2 * xRatio.b})k:(${5 * xRatio.a - 6 * xRatio.b})k=${secondRatio.a}:${secondRatio.b}$。`
        )
      );
    }

    return { questions, answers };
  }

  function buildJ232SquareProportionSet(count) {
    const questions = [];
    const answers = [];
    const variants = shuffle([0, 1, 2, 3, 4]);

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 0) {
        const templates = [
          { x0: 15, y0: 15, y1: 5 },
          { x0: 12, y0: 12, y1: 6 },
          { x0: 3, y0: 6, y1: 10 },
          { x0: 8, y0: 12, y1: 4 },
          { x0: 18, y0: 18, y1: 9 },
          { x0: 5, y0: 10, y1: 15 },
        ];
        const pick = templates[cycle % templates.length];
        const coeff = simplifyFraction(pick.y0 * pick.y0, 3 * pick.x0);
        const x1 = divFraction(makeFraction(pick.y1 * pick.y1, 1), mulFraction(coeff, makeFraction(3, 1)));
        questions.push(
          `已知 $y^2$ 與 $3x$ 成正比，當 $y=${pick.y0}$ 時 $x=${pick.x0}$，求 $y=${pick.y1}$ 時的 $x$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$x=${fractionToLatex(x1)}$`,
            `由正比可得 $y^2=k\\cdot 3x$。代入 $y=${pick.y0},\\ x=${pick.x0}$ 得 $k=\\dfrac{${pick.y0 * pick.y0}}{${3 * pick.x0}}=${fractionToLatex(coeff)}$。所以 $y^2=${fractionToLatex(coeff)}\\cdot 3x$。當 $y=${pick.y1}$ 時，代入得 $${pick.y1 * pick.y1}=${fractionToLatex(coeff)}\\cdot 3x$，解得 $x=${fractionToLatex(x1)}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { x0: 4, y0: -1, x1: -8 },
          { x0: 5, y0: 2, x1: -1 },
          { x0: 6, y0: -2, x1: 10 },
          { x0: 0, y0: 1, x1: 8 },
          { x0: 7, y0: -1, x1: -3 },
          { x0: 3, y0: 5, x1: 11 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const k = (y0 + 3) * (x0 - 2) * (x0 - 2);
        const x1 = pick.x1;
        const y1plus3 = simplifyFraction(k, (x1 - 2) * (x1 - 2));
        const y1 = subFraction(y1plus3, makeFraction(3, 1));
        questions.push(`已知 $(y+3)$ 與 $(x-2)^2$ 成反比，若 $x=${x0}$ 時 $y=${y0}$，求 $x=${x1}$ 時的 $y$ 值。`);
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)}$`,
            `由反比可得 $(y+3)(x-2)^2=k$。代入 $x=${x0},\\ y=${y0}$ 得 $k=(${y0}+3)\\times (${x0}-2)^2=${k}$。當 $x=${x1}$ 時，$y+3=\\dfrac{${k}}{(${x1}-2)^2}=${fractionToLatex(y1plus3)}$，所以 $y=${fractionToLatex(y1)}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { parts: [5, 3, 2], unit: 1, k: 2 },
          { parts: [6, 3, 1], unit: 1, k: 3 },
          { parts: [4, 3, 2], unit: 1, k: 2 },
          { parts: [7, 2, 1], unit: 1, k: 4 },
          { parts: [5, 4, 1], unit: 1, k: 3 },
          { parts: [8, 3, 1], unit: 1, k: 2 },
        ];
        const pick = templates[cycle % templates.length];
        const parts = pick.parts;
        const totalParts = parts.reduce((a, b) => a + b, 0);
        const weight = totalParts * pick.unit;
        const value = pick.k * weight * weight;
        const pieceWeights = parts.map((part) => part * pick.unit);
        const remainingValue = pick.k * pieceWeights[0] * pieceWeights[0] + pick.k * pieceWeights[1] * pieceWeights[1];
        const loss = value - remainingValue;
        questions.push(
          `某寶石價值與重量的平方成正比。若 ${weight} 克寶石價值 ${value} 萬元，現把它裂成重量比 $${parts.join(':')}$ 的三塊後，最小那一塊遺失，則損失多少萬元？`
        );
        answers.push(
          formatJ232Answer(
            `${loss} 萬元`,
            `設價值 $V$ 與重量 $w$ 的關係為 $V=kw^2$。由 ${weight} 克價值 ${value} 萬元得 $k=\\dfrac{${value}}{${weight}^2}=${pick.k}$。三塊重量分別為 ${pieceWeights.join(' 克、')} 克，最小的 ${pieceWeights[2]} 克遺失，所以剩餘價值要分開算：$${pick.k}\\times ${pieceWeights[0]}^2+${pick.k}\\times ${pieceWeights[1]}^2=${remainingValue}$ 萬元。因此損失為 $${value}-${remainingValue}=${loss}$ 萬元。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const side0 = [4, 6, 8, 9, 12, 14][cycle % 6];
        const area0 = side0 * side0;
        const side1 = [10, 12, 15, 18, 20, 21][(cycle * 2 + 1) % 6];
        const area1 = side1 * side1;
        questions.push(
          `正方形面積 $A$ 與邊長 $s$ 的平方成正比。若邊長 ${side0} 公分時面積為 ${area0} 平方公分，求邊長 ${side1} 公分時的面積。`
        );
        answers.push(
          formatJ232Answer(
            `${area1} 平方公分`,
            `因為正方形面積本來就滿足 $A=s^2$，所以 $A$ 與 $s^2$ 的比例常數是 1。當邊長為 ${side1} 公分時，面積為 ${side1}^2=${area1} 平方公分。`
          )
        );
        continue;
      }

      const templates = [
        { x0: 3, y0: 6, x1: 12 },
        { x0: 5, y0: 10, x1: 9 },
        { x0: 6, y0: 12, x1: 15 },
        { x0: 4, y0: 8, x1: 11 },
        { x0: 7, y0: 14, x1: 13 },
        { x0: 8, y0: 12, x1: 10 },
      ];
      const pick = templates[cycle % templates.length];
      const x0 = pick.x0;
      const y0 = pick.y0;
      const coeff = simplifyFraction(y0 * y0, x0 * x0);
      const x1 = pick.x1;
      const yAbs = mulFraction(simplifyFraction(y0, x0), makeFraction(x1, 1));
      const y1sq = mulFraction(yAbs, yAbs);
      questions.push(`已知 $y^2$ 與 $x^2$ 成正比，且當 $x=${x0}$ 時 $y=${y0}$。求 $x=${x1}$ 時的 $y$ 值。`);
      answers.push(
        formatJ232Answer(
          `$y=\\pm ${fractionToLatex(yAbs)}$`,
          `因為 $y^2$ 與 $x^2$ 成正比，所以可寫成 $y^2=kx^2$。由 $x=${x0},\\ y=${y0}$ 得 $k=\\dfrac{${y0 * y0}}{${x0 * x0}}=${fractionToLatex(coeff)}$。當 $x=${x1}$ 時，$y^2=${fractionToLatex(coeff)}\\times ${x1}^2=${fractionToLatex(y1sq)}$，因此 $y=\\pm ${fractionToLatex(yAbs)}$。`
        )
      );
    }

    return { questions, answers };
  }

  function buildJ232ChainedVariationSet(count) {
    const questions = [];
    const answers = [];
    const variants = shuffle([0, 1, 2, 3, 4]);

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 0) {
        const templates = [
          { x0: -12, y0: -6, z0: 3, x1: 8 },
          { x0: -10, y0: -5, z0: 4, x1: 6 },
          { x0: -15, y0: -9, z0: 2, x1: 10 },
          { x0: -8, y0: -4, z0: 6, x1: 12 },
          { x0: -14, y0: -7, z0: 5, x1: 4 },
          { x0: -18, y0: -12, z0: 3, x1: 9 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const z0 = pick.z0;
        const x1 = pick.x1;
        const ky = divFraction(makeFraction(y0, 1), makeFraction(x0, 1));
        const invConst = z0 * y0;
        const y1 = mulFraction(makeFraction(x1, 1), ky);
        const z1 = divFraction(makeFraction(invConst, 1), y1);
        questions.push(
          `已知 $x$ 與 $y$ 成正比，$y$ 與 $z$ 成反比。當 $z=${z0},\\ y=${y0}$ 時 $x=${x0}$，求當 $x=${x1}$ 時的 $y$ 與 $z$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)},\\ z=${fractionToLatex(z1)}$`,
            `先由 $x$ 與 $y$ 成正比得 $y=kx$。代入 $x=${x0},\\ y=${y0}$，得 $k=${fractionToLatex(ky)}$，所以當 $x=${x1}$ 時，$y=${fractionToLatex(y1)}$。又因 $y$ 與 $z$ 成反比，所以 $yz$ 為定值。由 $y=${y0},\\ z=${z0}$ 得 $yz=${invConst}$，所以此時 $z=\\dfrac{${invConst}}{${fractionToLatex(y1)}}=${fractionToLatex(z1)}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { x0: 6, y0: 4, z0: 9, x1: 15 },
          { x0: 8, y0: 3, z0: 10, x1: 12 },
          { x0: 9, y0: 6, z0: 8, x1: 18 },
          { x0: 10, y0: 5, z0: 12, x1: 20 },
          { x0: 12, y0: 8, z0: 15, x1: 24 },
          { x0: 15, y0: 10, z0: 6, x1: 25 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const z0 = pick.z0;
        const x1 = pick.x1;
        const c1 = x0 * y0;
        const c2 = y0 * z0;
        const y1 = divFraction(makeFraction(c1, 1), makeFraction(x1, 1));
        const z1 = divFraction(makeFraction(c2, 1), y1);
        questions.push(
          `若 $x$ 與 $y$ 成反比，$y$ 與 $z$ 也成反比。當 $(x,y,z)=(${x0},${y0},${z0})$ 時，求當 $x=${x1}$ 時的 $y$ 與 $z$。`
        );
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)},\\ z=${fractionToLatex(z1)}$`,
            `由 $x$ 與 $y$ 成反比，得 $xy=${c1}$，所以當 $x=${x1}$ 時，$y=\\dfrac{${c1}}{${x1}}=${fractionToLatex(y1)}$。又因 $y$ 與 $z$ 成反比，得 $yz=${c2}$，所以 $z=\\dfrac{${c2}}{${fractionToLatex(y1)}}=${fractionToLatex(z1)}$。此外因兩次反比相接，$x$ 與 $z$ 會成正比。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { x0: 6, y0: makeFraction(1, 2), z0: makeFraction(3, 4), x1: -4 },
          { x0: 8, y0: makeFraction(3, 4), z0: makeFraction(5, 6), x1: -2 },
          { x0: 10, y0: makeFraction(2, 5), z0: makeFraction(7, 5), x1: -5 },
          { x0: 12, y0: makeFraction(1, 3), z0: makeFraction(4, 3), x1: -6 },
          { x0: 15, y0: makeFraction(2, 3), z0: makeFraction(9, 10), x1: -3 },
          { x0: 9, y0: makeFraction(5, 6), z0: makeFraction(2, 3), x1: -1 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const z0 = pick.z0;
        const x1 = pick.x1;
        const ky = divFraction(y0, makeFraction(x0, 1));
        const kz = mulFraction(z0, makeFraction(x1, 1));
        const y1 = mulFraction(makeFraction(x1, 1), ky);
        const z1 = divFraction(kz, makeFraction(x1, 1));
        const t1 = subFraction(y1, z1);
        const t1Text = t1.den === 1
          ? `${t1.num}`
          : `${t1.num < 0 ? '-' : ''}\\dfrac{${Math.abs(t1.num)}}{${t1.den}}`;
        const zTermInT = kz.num < 0
          ? `+\\dfrac{${fractionToLatex(negateFraction(kz))}}{x}`
          : `-\\dfrac{${fractionToLatex(kz)}}{x}`;
        questions.push(
          `已知 $T=Y-Z$，其中 $Y$ 與 $x$ 成正比，$Z$ 與 $x$ 成反比。若當 $x=${x0}$ 時，$Y=${fractionToLatex(y0)}$；當 $x=${x1}$ 時，$Z=${fractionToLatex(z0)}$，求 $T$ 與 $x$ 的關係式，並求當 $x=${x1}$ 時的 $T$。`
        );
        answers.push(
          formatJ232Answer(
            `$T=${t1Text}$`,
            `由 $Y$ 與 $x$ 成正比，可設 $Y=${fractionToLatex(ky)}x$。由 $Z$ 與 $x$ 成反比，且 $x=${x1}$ 時 $Z=${fractionToLatex(z0)}$，可得 $Z=\\dfrac{${fractionToLatex(kz)}}{x}$。所以 $T=Y-Z=${fractionToLatex(ky)}x${zTermInT}$。當 $x=${x1}$ 時，$Y=${fractionToLatex(y1)},\\ Z=${fractionToLatex(z1)}$，故 $T=${t1Text}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { x0: 4, y0: 10, z0: 6, x1: 9 },
          { x0: 5, y0: 12, z0: 9, x1: 15 },
          { x0: 6, y0: 14, z0: 8, x1: 18 },
          { x0: 8, y0: 20, z0: 12, x1: 10 },
          { x0: 10, y0: 15, z0: 5, x1: 16 },
          { x0: 12, y0: 18, z0: 6, x1: 20 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const z0 = pick.z0;
        const x1 = pick.x1;
        const ky = divFraction(makeFraction(y0, 1), makeFraction(x0, 1));
        const kz = divFraction(makeFraction(z0, 1), makeFraction(x0, 1));
        const y1 = mulFraction(ky, makeFraction(x1, 1));
        const z1 = mulFraction(kz, makeFraction(x1, 1));
        questions.push(
          `已知 $x$ 與 $y$ 成正比，且 $x$ 與 $z$ 也成正比。若當 $x=${x0}$ 時，$y=${y0},\\ z=${z0}$，求當 $x=${x1}$ 時的 $(y+z)$。`
        );
        answers.push(
          formatJ232Answer(
            `$y+z=${fractionToLatex(addFraction(y1, z1))}$`,
            `由正比可設 $y=${fractionToLatex(ky)}x,\\ z=${fractionToLatex(kz)}x$。因此當 $x=${x1}$ 時，$y=${fractionToLatex(y1)},\\ z=${fractionToLatex(z1)}$，所以 $y+z=${fractionToLatex(addFraction(y1, z1))}$。`
          )
        );
        continue;
      }

      const templates = [
        { x0: 5, y0: 8, z0: 10, x1: 20 },
        { x0: 4, y0: 6, z0: 9, x1: 12 },
        { x0: 6, y0: 9, z0: 12, x1: 18 },
        { x0: 8, y0: 10, z0: 15, x1: 16 },
        { x0: 10, y0: 12, z0: 18, x1: 30 },
        { x0: 12, y0: 15, z0: 20, x1: 24 },
      ];
      const pick = templates[cycle % templates.length];
      const x0 = pick.x0;
      const y0 = pick.y0;
      const z0 = pick.z0;
      const x1 = pick.x1;
      const c1 = x0 * y0;
      const kz = divFraction(makeFraction(z0, 1), makeFraction(y0, 1));
      const y1 = divFraction(makeFraction(c1, 1), makeFraction(x1, 1));
      const z1 = mulFraction(kz, y1);
      questions.push(
        `若 $x$ 與 $y$ 成反比，$y$ 與 $z$ 成正比。當 $(x,y,z)=(${x0},${y0},${z0})$ 時，求當 $x=${x1}$ 時的 $z$。並判斷 $x$ 與 $z$ 的關係。`
      );
      answers.push(
        formatJ232Answer(
          `$z=${fractionToLatex(z1)}$，$x$ 與 $z$ 成反比`,
          `由 $x$ 與 $y$ 成反比得 $xy=${c1}$，所以當 $x=${x1}$ 時，$y=\\dfrac{${c1}}{${x1}}=${fractionToLatex(y1)}$。又因 $y$ 與 $z$ 成正比，且 $z:y=${z0}:${y0}=\\dfrac{${z0}}{${y0}}$，所以 $z=\\dfrac{${z0}}{${y0}}y=\\dfrac{${z0}}{${y0}}\\times ${fractionToLatex(y1)}=${fractionToLatex(z1)}$。因為一反比再接一正比，所以 $x$ 與 $z$ 仍成反比。`
        )
      );
    }

    return { questions, answers };
  }

  function buildJ232PercentChangeSet(count) {
    const questions = [];
    const answers = [];
    const variants = shuffle([0, 1, 2, 3, 4]);

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 0) {
        const drops = [40, 30, 20, 50, 60, 10];
        const drop = drops[cycle % drops.length];
        const keep = simplifyFraction(100 - drop, 100);
        const mult = simplifyFraction(100, 100 - drop);
        questions.push(`若 $y$ 與 $x$ 成反比，當 $x$ 減少 $${drop}\\%$ 時，$y$ 變為原來的幾倍？`);
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(mult)}$ 倍`,
            `$x$ 減少 $${drop}\\%$ 表示變成原來的 $${100 - drop}\\%=\\dfrac{${keep.num}}{${keep.den}}$。因為 $y$ 與 $x$ 成反比，所以 $y$ 會變成原來的倒數倍數，即 $${fractionToLatex(mult)}$ 倍。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const ups = [25, 20, 50, 10, 40, 60];
        const up = ups[cycle % ups.length];
        const den = 100 + up;
        const frac = simplifyFraction(100, den);
        const inc = simplifyFraction(up, 100);
        questions.push(`若 $y$ 與 $x$ 成反比，當 $x$ 增加 $${up}\\%$ 時，$y$ 變為原來的幾分之幾？`);
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(frac)}$`,
            `$x$ 增加 $${up}\\%$ 表示變成原來的 $1+${fractionToLatex(inc)}=\\dfrac{${den}}{100}$ 倍。因為 $y$ 與 $x$ 成反比，所以 $y$ 變為原來的 $${fractionToLatex(frac)}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const mults = [2, 3, 4, 5, 6, 7];
        const m = mults[cycle % mults.length];
        questions.push(`若 $y$ 與 $x$ 成正比，當 $x$ 變為原來的 ${m} 倍時，$y$ 變為原來的幾倍？`);
        answers.push(
          formatJ232Answer(
            `${m} 倍`,
            `正比的意思是兩個量同倍數增減，所以 $x$ 變成 ${m} 倍，$y$ 也會跟著變成 ${m} 倍。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const drops = [20, 10, 25, 30, 40, 50];
        const drop = drops[cycle % drops.length];
        const dec = simplifyFraction(drop, 100);
        questions.push(`若 $y$ 與 $x$ 成正比，當 $x$ 減少 $${drop}\\%$ 時，$y$ 會減少原來的幾分之幾？`);
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(dec)}$`,
            `$x$ 減少 $${drop}\\%$ 表示變成原來的 $${100 - drop}\\%$。因為正比，所以 $y$ 也變成相同比例，因此減少原來的 $${fractionToLatex(dec)}$。`
          )
        );
        continue;
      }

      const templates = [
        { up: 20, down: 25 },
        { up: 25, down: 20 },
        { up: 50, down: 20 },
        { up: 40, down: 10 },
        { up: 10, down: 10 },
        { up: 30, down: 20 },
      ];
      const pick = templates[cycle % templates.length];
      const xFactor = simplifyFraction(100 + pick.up, 100);
      const downFactor = simplifyFraction(100 - pick.down, 100);
      const finalX = mulFraction(xFactor, downFactor);
      const finalY = divFraction(makeFraction(1, 1), finalX);
      questions.push(`若 $y$ 與 $x$ 成反比，當 $x$ 先增加 $${pick.up}\\%$，再減少 $${pick.down}\\%$ 時，$y$ 最後變為原來的幾倍？`);
      answers.push(
        formatJ232Answer(
          `$${fractionToLatex(finalY)}$ 倍`,
          `$x$ 先增加 $${pick.up}\\%$ 變成 $${fractionToLatex(xFactor)}$ 倍，再減少 $${pick.down}\\%$ 就乘上 $${fractionToLatex(downFactor)}$，所以最後 $x$ 變成 $${fractionToLatex(finalX)}$ 倍。因為 $y$ 與 $x$ 成反比，所以 $y$ 變成原來的倒數倍數，即 $${fractionToLatex(finalY)}$ 倍。`
        )
      );
    }

    return { questions, answers };
  }

  function buildJ232WordJudgmentSet(count) {
    const questions = [];
    const answers = [];

    const directBank = [
      () => {
        const price = [35, 40, 45, 50, 60][randInt(0, 4)];
        return {
          q: `已知漫畫書每本 ${price} 元，小妍買了 $x$ 本，共付 $y$ 元。判斷 $y$ 與 $x$ 是成正比、成反比，還是都不是。`,
          a: formatJ232Answer('成正比', `關係式是 $y=${price}x$。這符合 $y=kx$ 的形式，所以 $y$ 與 $x$ 成正比。`),
        };
      },
      () => {
        const speed = [60, 70, 80, 90][randInt(0, 3)];
        return {
          q: `阿成平均每小時以 ${speed} 公里的速率開車，行駛 $x$ 小時後，總路程為 $y$ 公里。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成正比', `關係式是 $y=${speed}x$。因為符合 $y=kx$，所以 $y$ 與 $x$ 成正比。`),
        };
      },
      () => {
        const price = [120, 150, 200, 250][randInt(0, 3)];
        const percent = [6, 7, 8, 9][randInt(0, 3)];
        return {
          q: `一本書定價 ${price} 元，打 $${percent}$ 折後的售價為 $y$ 元。若折數記為 $x$，判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成正比', `折數 $x$ 表示售價是原價的 $\\dfrac{x}{10}$，所以 $y=${price}\\cdot \\dfrac{x}{10}$。這可整理成 $y=${price / 10}x$，因此 $y$ 與 $x$ 成正比。`),
        };
      },
      () => {
        return {
          q: `已知圓的半徑為 $x$ 公分，圓周長為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成正比', `圓周長公式是 $y=2\\pi x$。因為 $2\\pi$ 是常數，符合 $y=kx$ 的形式，所以 $y$ 與 $x$ 成正比。`),
        };
      },
      () => {
        const unit = [12, 15, 20, 25][randInt(0, 3)];
        return {
          q: `一盒彩色筆有 ${unit} 支，買了 $x$ 盒後共有 $y$ 支彩色筆。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成正比', `關係式是 $y=${unit}x$，符合 $y=kx$，所以 $y$ 與 $x$ 成正比。`),
        };
      },
    ];

    const inverseBank = [
      () => {
        const total = [180, 200, 240, 300][randInt(0, 3)];
        return {
          q: `媽媽每天花 ${total} 元買水果。若蘋果單價為 $x$ 元/斤，可買 $y$ 斤。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成反比', `因為單價 $\\times$ 數量 $=$ 總價，所以 $xy=${total}$。這符合 $xy=k$ 的形式，因此 $y$ 與 $x$ 成反比。`),
        };
      },
      () => {
        const area = [24, 30, 36, 40][randInt(0, 3)];
        return {
          q: `一個面積為 ${area} 平方公分的三角形，底邊長為 $x$ 公分，高為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成反比', `三角形面積是 $\\dfrac{1}{2}xy=${area}$，整理得 $xy=${2 * area}$。這符合 $xy=k$ 的形式，所以 $y$ 與 $x$ 成反比。`),
        };
      },
      () => {
        const distance = [240, 300, 360, 420][randInt(0, 3)];
        return {
          q: `兩地相距 ${distance} 公里，開車速率為每小時 $x$ 公里，所需時間為 $y$ 小時。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成反比', `因為 距離 $=$ 速率 $\\times$ 時間，所以 $xy=${distance}$。這符合 $xy=k$，因此 $y$ 與 $x$ 成反比。`),
        };
      },
      () => {
        const volume = [6000, 8000, 12000][randInt(0, 2)];
        return {
          q: `將 ${volume} cc 的水倒入底面積為 $x$ 平方公分的水箱，水深為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成反比', `體積 $=$ 底面積 $\\times$ 高，所以 $xy=${volume}$。符合 $xy=k$ 的形式，因此 $y$ 與 $x$ 成反比。`),
        };
      },
      () => {
        const work = [12, 15, 18, 20][randInt(0, 3)];
        return {
          q: `完成一項固定工作需要 ${work} 工時。若有 $x$ 位工人平均分工，每位工人需工作 $y$ 小時。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成反比', `因為人數 $\\times$ 每人工作時間 $=$ 固定總工時，所以 $xy=${work}$。因此 $y$ 與 $x$ 成反比。`),
        };
      },
    ];

    const neitherBank = [
      () => {
        return {
          q: `一年甲班共有 36 人，其中男生 $x$ 人、女生 $y$ 人。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('都不是', `關係式是 $x+y=36$，也就是 $y=36-x$。這既不是 $y=kx$，也不是 $xy=k$，所以都不是。`),
        };
      },
      () => {
        const perimeter = [24, 30, 40][randInt(0, 2)];
        return {
          q: `周長為 ${perimeter} 公分的長方形，長為 $x$ 公分，寬為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('都不是', `由周長公式得 $2(x+y)=${perimeter}$，整理成 $y=${perimeter / 2}-x$。因為不是 $y=kx$，也不是 $xy=k$，所以都不是。`),
        };
      },
      () => {
        const diff = [18, 24, 30, 36][randInt(0, 3)];
        return {
          q: `爸爸今年 $x$ 歲，女兒今年 $y$ 歲，兩人相差 ${diff} 歲。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('都不是', `關係式是 $x-y=${diff}$，整理成 $y=x-${diff}$。這不是正比，也不是反比，所以都不是。`),
        };
      },
      () => {
        return {
          q: `已知圓的半徑為 $x$ 公分，面積為 $y$ 平方公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('都不是', `圓面積公式是 $y=\\pi x^2$。這是與 $x^2$ 成正比，不是與 $x$ 本身成正比，也不是反比，所以都不是。`),
        };
      },
      () => {
        const base = [30, 40, 50, 60][randInt(0, 3)];
        const perMin = [2, 3, 4][randInt(0, 2)];
        return {
          q: `某電信公司的月租費為 ${base} 元，每分鐘另收 ${perMin} 元，通話 $x$ 分鐘後總費用為 $y$ 元。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('都不是', `關係式是 $y=${perMin}x+${base}$。因為有固定常數項 ${base}，所以不是正比；乘積也不固定，所以不是反比，因此都不是。`),
        };
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const bankType = randInt(0, 2);
      const bank = bankType === 0 ? directBank : bankType === 1 ? inverseBank : neitherBank;
      const pick = bank[randInt(0, bank.length - 1)]();
      questions.push(`判斷題：${pick.q}`);
      answers.push(pick.a);
    }

    return { questions, answers };
  }

  function buildJ241InequalityLanguageSet(count) {
    const questions = [];
    const answers = [];
    const directBank = [
      () => {
        const add = randInt(2, 9);
        const limit = randInt(12, 30);
        return {
          q: `文字轉換：$x$ 加 ${add} 未滿 ${limit}，請寫成不等式。`,
          a: formatJ241Answer(`$x+${add}<${limit}$`, `「未滿」表示嚴格小於，所以不等式是 $x+${add}<${limit}$。`),
        };
      },
      () => {
        const times = randInt(2, 8);
        const add = randInt(3, 12);
        const limit = randInt(20, 60);
        return {
          q: `文字轉換：$x$ 的 ${times} 倍加 ${add} 大於 ${limit}，請寫成不等式。`,
          a: formatJ241Answer(`$${times}x+${add}>${limit}$`, `「大於」對應 $>$，所以不等式是 $${times}x+${add}>${limit}$。`),
        };
      },
      () => {
        const coeff = randInt(2, 5);
        const bias = randInt(1, 8);
        const low = randInt(4, 12);
        const high = low + randInt(4, 10);
        const expr = formatLinearExpr(coeff, bias);
        return {
          q: `文字轉換：$${expr}$ 不到 ${high}，且不低於 ${low}，請寫成不等式。`,
          a: formatJ241Answer(`$${low}≤${expr}<${high}$`, `「不到」表示 $<$，「不低於」表示 $≥$，所以要寫成 $${low}≤${expr}<${high}$。`),
        };
      },
      () => {
        const coeff = randInt(3, 9);
        const low = randInt(30, 80);
        const high = low + randInt(20, 60);
        return {
          q: `文字轉換：$x$ 的 ${coeff} 倍在 ${low} 以上，${high} 以下，請寫成不等式。`,
          a: formatJ241Answer(`$${low}≤${coeff}x≤${high}$`, `國中題裡「以上、以下」通常包含端點，所以式子是 $${low}≤${coeff}x≤${high}$。`),
        };
      },
    ];

    const quickBank = [
      () => {
        const a = pickNonZero(-9, 9);
        const b = randInt(-12, 12);
        const c = randInt(-18, 18);
        const x0 = randInt(-6, 8);
        const ops = ['>', '<', '≥', '≤'];
        const op = ops[randInt(0, ops.length - 1)];
        const left = a * x0 + b;
        const ok = compareFractions(makeFraction(left), op, makeFraction(c));
        return {
          q: `判斷：$x=${x0}$ 是否為 $${formatLinearExpr(a, b)}${displayIneqOp(op)}${c}$ 的解？`,
          a: formatJ241Answer(
            ok ? '是' : '不是',
            `把 $x=${x0}$ 代入左邊得 $${left}$。因為 $${left}${displayIneqOp(op)}${c}$ ${ok ? '成立' : '不成立'}，所以 ${ok ? '是' : '不是'}這個不等式的解。`
          ),
        };
      },
      () => {
        const a = pickNonZero(-7, 7);
        const b = randInt(-8, 8);
        const c = randInt(-10, 12);
        const op = ['>', '<', '≥', '≤'][randInt(0, 3)];
        const candidates = shuffle([
          makeFraction(randInt(-6, 6)),
          makeFraction(randInt(-6, 6)),
          makeFraction(randInt(-10, 10), 2),
          makeFraction(randInt(-10, 10), 2),
        ]).slice(0, 4);
        const hits = candidates.filter((x) => compareFractions(evalLinearAt(a, b, x), op, makeFraction(c)));
        const hitText = hits.map((x) => `$${fractionToLatex(x, true)}$`).join('、');
        return {
          q: `下列哪些數為 $${formatLinearExpr(a, b)}${displayIneqOp(op)}${c}$ 的解：${candidates.map((x) => `$${fractionToLatex(x, true)}$`).join('、')}？`,
          a:
            hits.length > 0
              ? formatJ241Answer(hitText, `逐一代入檢查後，可得符合不等式的數是 ${hitText}。`)
              : formatJ241Answer('沒有符合的數', `逐一代入檢查後，這些數都不符合，所以沒有一個是這個不等式的解。`),
        };
      },
      () => {
        const bound = makeFraction(randInt(10, 36), [2, 4][randInt(0, 1)]);
        const askMax = randInt(0, 1) === 0;
        const op = askMax ? ['<', '≤'][randInt(0, 1)] : ['>', '≥'][randInt(0, 1)];
        const answer = askMax ? maxIntegerForIneq(op, bound) : minIntegerForIneq(op, bound);
        return {
          q: `若 $x${displayIneqOp(op)}${fractionToLatex(bound, true)}$，則 $x$ 的${askMax ? '最大' : '最小'}整數值為何？`,
          a: formatJ241Answer(`$${answer}$`, `先看界線是 $${fractionToLatex(bound, true)}$。依題意可得答案為 $${answer}$。`),
        };
      },
      () => {
        const low = randInt(-20, 4);
        const high = low + randInt(6, 18);
        const includeLow = randInt(0, 1) === 0;
        const includeHigh = randInt(0, 1) === 0;
        const countInt = countIntegersInInterval(makeFraction(low), includeLow, makeFraction(high), includeHigh);
        const leftOp = includeLow ? '≤' : '<';
        const rightOp = includeHigh ? '≤' : '<';
        return {
          q: `滿足 $${low}${leftOp}x${rightOp}${high}$ 的整數解共有幾個？`,
          a: formatJ241Answer(`${countInt} 個`, `整數解會從 ${includeLow ? low : low + 1} 到 ${includeHigh ? high : high - 1}。共有 ${countInt} 個整數解。`),
        };
      },
      () => {
        const low = randInt(-12, -4);
        const countInt = randInt(6, 18);
        const upper = low + countInt + 1;
        const start = low + 1;
        const countExpr = start < 0 ? `a-(${start})` : `a-${start}`;
        return {
          q: `已知滿足 $${low}<x<a$ 的整數解有 ${countInt} 個，求正整數 $a$。`,
          a: formatJ241Answer(`$a=${upper}$`, `整數解會是 ${start} 到 $a-1$。因此個數為 $${countExpr}$，令它等於 ${countInt}，解得 $a=${upper}$。`),
        };
      },
      () => {
        const limit = randInt(3, 8);
        const candidates = shuffle([
          makeFraction(-limit - 1),
          makeFraction(-limit + 1),
          makeFraction(0),
          makeFraction(limit - 1, 2),
          makeFraction(limit + 1, 2),
        ]).slice(0, 4);
        const hits = candidates.filter((x) => Math.abs(x.num / x.den) < limit);
        const hitText = hits.map((x) => `$${fractionToLatex(x, true)}$`).join('、');
        return {
          q: `下列哪些數為 $|x|<${limit}$ 的解：${candidates.map((x) => `$${fractionToLatex(x, true)}$`).join('、')}？`,
          a:
            hits.length > 0
              ? formatJ241Answer(hitText, `因為 $|x|<${limit}$ 表示 $-${limit}<x<${limit}$，所以符合的有 ${hitText}。`)
              : formatJ241Answer('沒有符合的數', `因為 $|x|<${limit}$ 等價於 $-${limit}<x<${limit}$，逐一檢查後沒有符合的數。`),
        };
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const bank = i % 3 === 0 ? directBank : quickBank;
      const pick = bank[randInt(0, bank.length - 1)]();
      questions.push(pick.q);
      answers.push(pick.a);
    }

    return { questions, answers };
  }

  function flipInequality(op) {
    if (op === '>') return '<';
    if (op === '<') return '>';
    if (op === '\\ge' || op === '≥') return '≤';
    return '≥';
  }

  function compareFractions(left, op, right) {
    const l = makeFraction(left.num, left.den);
    const r = makeFraction(right.num, right.den);
    const diff = l.num * r.den - r.num * l.den;
    if (op === '>') return diff > 0;
    if (op === '<') return diff < 0;
    if (op === '\\ge' || op === '≥') return diff >= 0;
    return diff <= 0;
  }

  function displayIneqOp(op) {
    if (op === '\\ge') return '≥';
    if (op === '\\le') return '≤';
    return op;
  }

  function formatIneqBound(frac) {
    const value = makeFraction(frac.num, frac.den);
    return value.den === 1 ? `${value.num}` : fractionToLatex(value, true);
  }

  function formatIneqSolution(op, frac) {
    return `x${displayIneqOp(op)}${formatIneqBound(frac)}`;
  }

  function formatPracticeShortAnswer(shortAnswer, process = '') {
    const shortText = String(shortAnswer || '').trim();
    const processText = String(process || '').trim();
    return processText ? `簡答：${shortText}\n過程：${processText}` : `簡答：${shortText}`;
  }

  function inferPracticeShortAnswer(process) {
    const text = String(process || '').trim();
    if (!text) return '見過程';
    const lastSentence = text
      .split('。')
      .map((part) => part.trim())
      .filter(Boolean)
      .pop() || text;
    const patterns = [
      /最簡整數比(?:為)?\s*(.+)$/,
      /(?:所以|因此|故|可得|解得)\s*(.+)$/,
      /(?:比值|關係式|新比|濃度|答案)(?:為|是)?\s*(.+)$/,
    ];
    for (const pattern of patterns) {
      const match = lastSentence.match(pattern);
      if (match && match[1]) return cleanInferredShortAnswer(match[1]);
    }
    return cleanInferredShortAnswer(lastSentence.replace(/^(所以|因此|故|可得|解得)\s*/, ''));
  }

  function cleanInferredShortAnswer(value) {
    let short = String(value || '').trim();
    ['，因此', '，所以', '，故', '，解得', '，可得'].forEach((marker) => {
      const index = short.lastIndexOf(marker);
      if (index >= 0) short = short.slice(index + marker.length).trim();
    });
    short = short
      .replace(/^最簡整數比(?:為)?\s*/, '')
      .replace(/^原本/, '')
      .trim();
    const finalRatio = short.match(/=([+-]?\d+:[+-]?\d+)\$?$/);
    if (finalRatio) return `$${finalRatio[1]}$`;
    const finalEquation = short.match(/(\$[a-zA-Z]\\s*=[^$]+\$)$/);
    if (finalEquation) return finalEquation[1];
    return short || '見過程';
  }

  function formatJ231Answer(shortAnswer, process = '') {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function finalizeJ231Set(questions, answers) {
    return {
      questions,
      answers: answers.map((answer) => {
        const text = String(answer || '').trim();
        if (text.startsWith('簡答：')) return text;
        return formatJ231Answer(inferPracticeShortAnswer(text), text);
      }),
    };
  }

  function formatJ232Answer(shortAnswer, process = '') {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function formatJ241Answer(shortAnswer, process = '') {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function formatJ242Answer(shortAnswer, process = '') {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function formatIneqAxRelB(coef, op, constant) {
    return `${formatTerm(coef, 'x')}${displayIneqOp(op)}${formatIneqBound(makeFraction(constant))}`;
  }

  function evalLinearAt(a, b, xFrac) {
    return addFraction(mulFraction(makeFraction(a, 1), xFrac), makeFraction(b, 1));
  }

  function maxIntegerForIneq(op, frac) {
    const value = frac.num / frac.den;
    return op === '<' ? Math.ceil(value) - 1 : Math.floor(value);
  }

  function minIntegerForIneq(op, frac) {
    const value = frac.num / frac.den;
    return op === '>' ? Math.floor(value) + 1 : Math.ceil(value);
  }

  function countIntegersInInterval(low, includeLow, high, includeHigh) {
    const lowValue = low.num / low.den;
    const highValue = high.num / high.den;
    const start = includeLow ? Math.ceil(lowValue) : Math.floor(lowValue) + 1;
    const end = includeHigh ? Math.floor(highValue) : Math.ceil(highValue) - 1;
    return Math.max(0, end - start + 1);
  }

  function buildJ241IntegerSolveSet(count) {
    const questions = [];
    const answers = [];
    const solOps = ['>', '<', '≥', '≤'];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const solOp = solOps[randInt(0, solOps.length - 1)];
      const target = randInt(-6, 8);

      if (variant === 0) {
        const coef = pickNonZero(-9, 9);
        const bias = randInt(-12, 12);
        const rawOp = coef > 0 ? solOp : flipInequality(solOp);
        const rhs = coef * target + bias;
        const solution = formatIneqSolution(solOp, makeFraction(target));
        questions.push(`解不等式：$${formatLinearExpr(coef, bias)}${displayIneqOp(rawOp)}${rhs}$。`);
        answers.push(
          formatJ241Answer(`$${solution}$`, `移項前其實已經是一次不等式：$${formatLinearExpr(coef, bias)}${rawOp}${rhs}$。先整理得 $${formatIneqAxRelB(coef, rawOp, rhs - bias)}$。${coef < 0 ? `兩邊同除以負數 ${coef} 時要變號，所以 ` : ''}解得 $${solution}$。`)
        );
        continue;
      }

      if (variant === 1) {
        const rightCoef = pickNonZero(-5, 5);
        let delta = pickNonZero(-6, 6);
        let leftCoef = rightCoef + delta;
        if (leftCoef === 0) leftCoef += 1;
        const bias = randInt(-10, 10);
        const A = leftCoef - rightCoef;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const rawOp = A > 0 ? solOp : flipInequality(solOp);
        const rhsConst = A * target + bias;
        const solution = formatIneqSolution(solOp, makeFraction(target));
        questions.push(
          `解不等式：$${formatLinearExpr(leftCoef, bias)}${displayIneqOp(rawOp)}${formatLinearExpr(rightCoef, rhsConst)}$。`
        );
        answers.push(
          formatJ241Answer(`$${solution}$`, `先移項整理：$${formatTerm(leftCoef, 'x')}${rightCoef > 0 ? '-' : '+'}${formatTerm(Math.abs(rightCoef), 'x')}${rawOp}${rhsConst}${bias >= 0 ? '-' : '+'}${Math.abs(bias)}$，可得 $${formatIneqAxRelB(A, rawOp, rhsConst - bias)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}所以解是 $${solution}$。`)
        );
        continue;
      }

      if (variant === 2) {
        const p = randInt(2, 6);
        const q = pickNonZero(-4, 4);
        const r = randInt(-6, 6);
        const A = p - q;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const rawOp = A > 0 ? solOp : flipInequality(solOp);
        const rhs = A * target + p * r;
        const solution = formatIneqSolution(solOp, makeFraction(target));
        questions.push(
          `解不等式：$${p}(x${r >= 0 ? '+' : ''}${r})${displayIneqOp(rawOp)}${formatLinearExpr(q, rhs)}$。`
        );
        answers.push(
          formatJ241Answer(`$${solution}$`, `先展開得 $${p}x${p * r >= 0 ? '+' : ''}${p * r}${rawOp}${formatLinearExpr(q, rhs)}$。移項整理後可得 $${formatIneqAxRelB(A, rawOp, rhs - p * r)}$。${A < 0 ? `兩邊同除以負數 ${A} 要變號，` : ''}因此 $${solution}$。`)
        );
        continue;
      }

      const p = randInt(2, 6);
      const q = randInt(2, 5);
      const r = randInt(-5, 5);
      const u = randInt(-5, 5);
      const A = p - q;
      if (A === 0) {
        i -= 1;
        continue;
      }
      const rawOp = A > 0 ? solOp : flipInequality(solOp);
      const constPart = p * r - q * u;
      const rhs = A * target + constPart;
      const solution = formatIneqSolution(solOp, makeFraction(target));
      questions.push(
        `解不等式：$${p}(x${r >= 0 ? '+' : ''}${r})-${q}(x${u >= 0 ? '+' : ''}${u})${displayIneqOp(rawOp)}${rhs}$。`
      );
      answers.push(
        formatJ241Answer(`$${solution}$`, `先展開得 $${p}x${p * r >= 0 ? '+' : ''}${p * r}-${q}x${q * u >= 0 ? '-' : '+'}${Math.abs(q * u)}${rawOp}${rhs}$，整理後為 $${formatIneqAxRelB(A, rawOp, rhs - constPart)}$。${A < 0 ? `再除以負數 ${A} 時要變號，` : ''}所以解為 $${solution}$。`)
      );
    }

    return { questions, answers };
  }

  function buildJ241DecimalSolveSet(count) {
    const questions = [];
    const answers = [];
    const solOps = ['>', '<', '≥', '≤'];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const solOp = solOps[randInt(0, solOps.length - 1)];
      const target = randInt(-6, 8);

      if (variant === 0) {
        const scale = 10;
        const coef = pickNonZero(-18, 18);
        const bias = randInt(-15, 15);
        const rhsCoef = pickNonZero(-18, 18);
        const A = coef - rhsCoef;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const rawOp = A > 0 ? solOp : flipInequality(solOp);
        const rhsConst = A * target + bias;
        const solution = formatIneqSolution(solOp, makeFraction(target));
        questions.push(
          `解不等式：$${trimFixed(coef / scale)}x${bias >= 0 ? '+' : ''}${trimFixed(bias / scale)}${displayIneqOp(rawOp)}${trimFixed(rhsCoef / scale)}x${rhsConst >= 0 ? '+' : ''}${trimFixed(rhsConst / scale)}$。`
        );
        answers.push(
          formatJ241Answer(`$${solution}$`, `先把各項都乘以 $${scale}$ 化成整數，得到 $${formatLinearExpr(coef, bias)}${rawOp}${formatLinearExpr(rhsCoef, rhsConst)}$。整理後可得 $${formatIneqAxRelB(A, rawOp, rhsConst - bias)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}所以 $${solution}$。`)
        );
        continue;
      }

      if (variant === 1) {
        const p = randInt(2, 5);
        const q = pickNonZero(-10, 10);
        const r = randInt(-6, 6);
        const A = 10 * p - q;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const rawOp = A > 0 ? solOp : flipInequality(solOp);
        const rhs = A * target + 10 * p * r;
        const inner = r === 0 ? 'x' : `x${r >= 0 ? '+' : ''}${r}`;
        const solution = formatIneqSolution(solOp, makeFraction(target));
        questions.push(
          `解不等式：$${p}\\left(${inner}\\right)${displayIneqOp(rawOp)}${trimFixed(q / 10)}x${rhs >= 0 ? '+' : ''}${trimFixed(rhs / 10)}$。`
        );
        answers.push(
          formatJ241Answer(`$${solution}$`, `先展開並把小數同乘以 $10$ 化成整數，可得 $${p * 10}(x${r >= 0 ? '+' : ''}${r})${rawOp}${formatLinearExpr(q, rhs)}$。整理後為 $${formatIneqAxRelB(A, rawOp, rhs - 10 * p * r)}$。${A < 0 ? `除以負數 ${A} 要變號，` : ''}所以 $${solution}$。`)
        );
        continue;
      }

      const p = randInt(2, 4);
      const q = randInt(2, 4);
      const r = randInt(-5, 5);
      const u = randInt(-5, 5);
      const A = 10 * (p - q);
      if (A === 0) {
        i -= 1;
        continue;
      }
      const rawOp = A > 0 ? solOp : flipInequality(solOp);
      const constPart = 10 * (p * r - q * u);
      const rhs = A * target + constPart;
      const solution = formatIneqSolution(solOp, makeFraction(target));
      questions.push(
        `解不等式：$${trimFixed(p / 10)}(10x${r >= 0 ? '+' : ''}${10 * r})-${trimFixed(q / 10)}(10x${u >= 0 ? '+' : ''}${10 * u})${displayIneqOp(rawOp)}${trimFixed(rhs / 10)}$。`
      );
      answers.push(
        formatJ241Answer(`$${solution}$`, `先展開並整理得 $${p}(10x${r >= 0 ? '+' : ''}${10 * r})-${q}(10x${u >= 0 ? '+' : ''}${10 * u})${rawOp}${rhs}$，進一步可化成 $${formatIneqAxRelB(A, rawOp, rhs - constPart)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}因此 $${solution}$。`)
      );
    }

    return { questions, answers };
  }

  function buildJ241FractionSolveSet(count) {
    const questions = [];
    const answers = [];
    const solOps = ['>', '<', '≥', '≤'];

    function gcdInt(a, b) {
      let x = Math.abs(a);
      let y = Math.abs(b);
      while (y !== 0) {
        const t = x % y;
        x = y;
        y = t;
      }
      return x || 1;
    }

    function lcmInt(a, b) {
      return Math.abs(a * b) / gcdInt(a, b);
    }

    function appendSignedFraction(frac) {
      const value = makeFraction(frac.num, frac.den);
      if (value.num === 0) return '';
      const absValue = makeFraction(Math.abs(value.num), value.den);
      return `${value.num > 0 ? '+' : '-'}${fractionToLatex(absValue, true)}`;
    }

    function appendSignedInteger(value) {
      if (value === 0) return '';
      return `${value > 0 ? '+' : ''}${value}`;
    }

    function clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target) {
      const scale = lcmInt(lcmInt(aFrac.den, bFrac.den), rhsFrac.den);
      const intA = aFrac.num * (scale / aFrac.den);
      const intB = bFrac.num * (scale / bFrac.den);
      const intR = rhsFrac.num * (scale / rhsFrac.den);
      const movedR = intR - intB;
      const beforeMove = `${formatLinearExpr(intA, intB)}${displayIneqOp(rawOp)}${intR}`;
      const afterMove = `${formatTerm(intA, 'x')}${displayIneqOp(rawOp)}${movedR}`;
      const moveText = intB === 0 ? '' : `移項得 $${afterMove}$。`;
      const solution = formatIneqSolution(solOp, target);
      return formatJ241Answer(
        `$${solution}$`,
        `先去分母整理，可得 $${beforeMove}$。${moveText}${intA < 0 ? `兩邊同除以負數 ${intA} 時要變號，` : ''}所以解為 $${solution}$。`
      );
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;
      const solOp = solOps[randInt(0, solOps.length - 1)];
      const targetPool = [
        makeFraction(randInt(-8, 8), 2),
        makeFraction(randInt(-9, 9), 3),
        makeFraction(randInt(-10, 10), 4),
        makeFraction(randInt(-10, 10), 5),
      ];
      const target = targetPool[randInt(0, targetPool.length - 1)];

      if (variant === 0) {
        const p = randInt(-5, 5);
        const d = [2, 3, 4][randInt(0, 2)];
        const c = randInt(-2, 3);
        const e = [2, 3, 5][randInt(0, 2)];
        const aFrac = subFraction(makeFraction(1, d), makeFraction(1, e));
        if (aFrac.num === 0) {
          i -= 1;
          continue;
        }
        const bFrac = addFraction(makeFraction(p, d), makeFraction(c, 1));
        const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
        const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
        questions.push(
          `解不等式：$\\dfrac{${formatLinearExpr(1, p)}}{${d}}${appendSignedInteger(c)}${displayIneqOp(rawOp)}\\dfrac{x}{${e}}${appendSignedFraction(rhsFrac)}$。`
        );
        answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
        continue;
      }

      if (variant === 1) {
        const a = randInt(2, 7);
        const b = randInt(-6, 6);
        const c = randInt(1, 5);
        const d = randInt(-4, 4);
        const den1 = [3, 4, 5][randInt(0, 2)];
        const den2 = [2, 3, 5][randInt(0, 2)];
        const aFrac = subFraction(makeFraction(a, den1), makeFraction(c, den2));
        if (aFrac.num === 0) {
          i -= 1;
          continue;
        }
        const bFrac = subFraction(makeFraction(b, den1), makeFraction(d, den2));
        const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
        const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
        questions.push(
          `解不等式：$\\dfrac{${formatLinearExpr(a, b)}}{${den1}}-\\dfrac{${formatLinearExpr(c, d)}}{${den2}}${displayIneqOp(rawOp)}${fractionToLatex(rhsFrac, true)}$。`
        );
        answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
        continue;
      }

      if (variant === 2) {
        const a = randInt(1, 3);
        const b = randInt(-5, 5);
        const den1 = [2, 4][randInt(0, 1)];
        const den2 = [2, 3][randInt(0, 1)];
        const c2 = randInt(-4, 4);
        const aFrac = addFraction(makeFraction(a, den1), makeFraction(1, den2));
        const bFrac = addFraction(makeFraction(b, den1), makeFraction(c2, den2));
        if (aFrac.num === 0) {
          i -= 1;
          continue;
        }
        const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
        const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
        questions.push(
          `解不等式：$\\dfrac{${formatLinearExpr(a, b)}}{${den1}}+\\dfrac{${formatLinearExpr(1, c2)}}{${den2}}${displayIneqOp(rawOp)}${fractionToLatex(rhsFrac, true)}$。`
        );
        answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
        continue;
      }

      if (variant === 3) {
        const den1 = [2, 3, 4][randInt(0, 2)];
        const p = randInt(-5, 5);
        const den2 = [2, 3, 5][randInt(0, 2)];
        const aFrac = subFraction(makeFraction(1, den1), makeFraction(1, den2));
        if (aFrac.num === 0) {
          i -= 1;
          continue;
        }
        const bFrac = makeFraction(p, den2);
        const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
        const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
        questions.push(
          `解不等式：$\\dfrac{x}{${den1}}-\\dfrac{${formatLinearExpr(1, -p)}}{${den2}}${displayIneqOp(rawOp)}${fractionToLatex(rhsFrac, true)}$。`
        );
        answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
        continue;
      }

      if (variant === 4) {
        const p = randInt(-4, 6);
        const q = randInt(-4, 6);
        const den1 = [2, 4][randInt(0, 1)];
        const den2 = [5, 10][randInt(0, 1)];
        const aFrac = subFraction(makeFraction(1, den1), makeFraction(-1, den2));
        const bFrac = subFraction(makeFraction(p, den1), makeFraction(q, den2));
        const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
        const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
        questions.push(
          `解不等式：$\\dfrac{${formatLinearExpr(1, p)}}{${den1}}${displayIneqOp(rawOp)}\\dfrac{${formatLinearExpr(-1, q)}}{${den2}}${appendSignedFraction(rhsFrac)}$。`
        );
        answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
        continue;
      }

      const den1 = [3, 4, 5][randInt(0, 2)];
      const den2 = [2, 3, 4][randInt(0, 2)];
      const a1 = randInt(1, 3);
      const b1 = randInt(-4, 4);
      const a2 = randInt(1, 3);
      const b2 = randInt(-4, 4);
      const aFrac = subFraction(makeFraction(a1, den1), makeFraction(a2, den2));
      if (aFrac.num === 0) {
        i -= 1;
        continue;
      }
      const bFrac = subFraction(makeFraction(b1, den1), makeFraction(b2, den2));
      const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
      const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
      questions.push(
        `解不等式：$\\dfrac{${formatLinearExpr(a1, b1)}}{${den1}}${displayIneqOp(rawOp)}\\dfrac{${formatLinearExpr(a2, b2)}}{${den2}}${appendSignedFraction(rhsFrac)}$。`
      );
      answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
    }

    return { questions, answers };
  }

  function buildJ241RangeSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const low = randInt(-6, 3);
      const high = low + randInt(3, 8);
      const includeLow = randInt(0, 1) === 0;
      const includeHigh = randInt(0, 1) === 0;
      const coefChoices = [
        makeFraction(2, 1),
        makeFraction(-3, 1),
        makeFraction(1, 4),
        makeFraction(-2, 1),
        makeFraction(3, 2),
      ];
      const coef = coefChoices[randInt(0, coefChoices.length - 1)];
      const bias = randInt(-7, 7);
      const yLowCandidate = addFraction(mulFraction(coef, makeFraction(low, 1)), makeFraction(bias, 1));
      const yHighCandidate = addFraction(mulFraction(coef, makeFraction(high, 1)), makeFraction(bias, 1));
      const increasing = coef.num > 0;
      const lowerY = increasing ? yLowCandidate : yHighCandidate;
      const upperY = increasing ? yHighCandidate : yLowCandidate;
      const lowerInc = increasing ? includeLow : includeHigh;
      const upperInc = increasing ? includeHigh : includeLow;
      const xExprLeft = includeLow ? '≤' : '<';
      const xExprRight = includeHigh ? '≤' : '<';
      const yLeft = lowerInc ? '≤' : '<';
      const yRight = upperInc ? '≤' : '<';
      const coefText = coef.den === 1 ? `${coef.num}` : `\\dfrac{${coef.num}}{${coef.den}}`;
      const yExpr =
        coef.den === 1 && coef.num === 1
          ? `x${bias >= 0 ? '+' : ''}${bias}`
          : coef.den === 1 && coef.num === -1
            ? `-x${bias >= 0 ? '+' : ''}${bias}`
            : `${coefText}x${bias >= 0 ? '+' : ''}${bias}`;
      const rangeAnswer = `${formatIneqBound(lowerY)}${yLeft}y${yRight}${formatIneqBound(upperY)}`;
      questions.push(`已知 $${low}${xExprLeft}x${xExprRight}${high}$，求 $y=${yExpr}$ 的範圍。`);
      answers.push(
        formatJ241Answer(`$${rangeAnswer}$`, `因為 $y=${yExpr}$ ${increasing ? '會隨 $x$ 增加而增加' : '會隨 $x$ 增加而減少'}，所以只要代入兩個端點判斷最小與最大值。可得 $${rangeAnswer}$。`)
      );
    }

    return { questions, answers };
  }

  function buildJ241ReverseCoeffSet(count) {
    const questions = [];
    const answers = [];
    const ops = ['>', '<', '≥', '≤'];
    const targetChoices = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7];

    function symbolMinusNumber(symbol, value) {
      if (value === 0) return symbol;
      return value > 0 ? `${symbol}-${value}` : `${symbol}-(${value})`;
    }

    function numberMinusSymbol(value, symbol) {
      if (value === 0) return `-${symbol}`;
      return `${value}-${symbol}`;
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);
      const solOp = ops[randInt(0, ops.length - 1)];
      const target = targetChoices[randInt(0, targetChoices.length - 1)];

      if (variant === 0) {
        const rhs = randInt(-6, 10);
        const a = 2 * target - rhs;
        questions.push(
          `若 $2x-a${displayIneqOp(solOp)}${rhs}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`
        );
        answers.push(
          formatJ241Answer(`$a=${a}$`, `由 $2x-a${displayIneqOp(solOp)}${rhs}$ 可得 $2x${displayIneqOp(solOp)}${rhs}+a$。因為解的界線是 ${target}，所以 $\\dfrac{${rhs}+a}{2}=${target}$，解得 $a=${a}$。`)
        );
        continue;
      }

      if (variant === 1) {
        const c = randInt(-6, 6);
        const rightCoef = pickNonZero(-7, 7);
        if (rightCoef === 0) {
          i -= 1;
          continue;
        }
        const rawOp = solOp;
        const a = rightCoef + 1;
        const d = (a - rightCoef) * target + c;
        const coefExpr = symbolMinusNumber('a', rightCoef);
        questions.push(
          `若 $ax${c >= 0 ? '+' : ''}${c}${displayIneqOp(rawOp)}${formatLinearExpr(rightCoef, d)}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`
        );
        answers.push(
          formatJ241Answer(`$a=${a}$`, `移項後可得 $(${coefExpr})x${displayIneqOp(rawOp)}${d - c}$。因為解是 $x${displayIneqOp(solOp)}${target}$，所以 $\\dfrac{${d - c}}{${coefExpr}}=${target}$，整理可得 $a=${a}$。`)
        );
        continue;
      }

      if (variant === 2) {
        const a = pickNonZero(-9, 9);
        const rhs = a * target;
        const solText = a > 0 ? solOp : flipInequality(solOp);
        questions.push(`若 $ax${displayIneqOp(solText)}${rhs}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`);
        answers.push(
          formatJ241Answer(`$a=${a}$`, `因為 $ax${displayIneqOp(solText)}${rhs}$ 兩邊同除以 $a$ 後要得到 $x${displayIneqOp(solOp)}${target}$，所以 $a$ 的正負必須和不等號變向情形一致。配合 $${rhs}=a\\times ${target}$，可得 $a=${a}$。`)
        );
        continue;
      }

      if (variant === 3) {
        const a = randInt(-20, 20);
        let rightCoef = pickNonZero(-5, 5);
        if (rightCoef === 2) rightCoef = 3;
        const A = 2 - rightCoef;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const rawOp = A > 0 ? solOp : flipInequality(solOp);
        const d = A * target + a;
        const coefExpr = symbolMinusNumber('2', rightCoef);
        const rhsExpr = numberMinusSymbol(d, 'a');
        questions.push(
          `若 $2x+a${displayIneqOp(rawOp)}${formatLinearExpr(rightCoef, d)}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`
        );
        answers.push(
          formatJ241Answer(`$a=${a}$`, `移項後會得到 $(${coefExpr})x${displayIneqOp(rawOp)}${rhsExpr}$。由於解是 $x${displayIneqOp(solOp)}${target}$，所以要有 $\\dfrac{${rhsExpr}}{${A}}=${target}$，解得 $a=${a}$。`)
        );
        continue;
      }

      const rhsConst = randInt(-8, 8);
      let leftCoef = pickNonZero(-7, 7);
      if (leftCoef === 1) leftCoef = 2;
      const rightCoef = leftCoef - 1;
      const m = target - rhsConst;
      const coefDiff = leftCoef - rightCoef;
      questions.push(
        `若 $${formatTerm(leftCoef, 'x')}-m${displayIneqOp(solOp)}${formatLinearExpr(rightCoef, rhsConst)}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $m$。`
      );
      answers.push(
        formatJ241Answer(`$m=${m}$`, `移項後是 $${formatTerm(coefDiff, 'x')}${displayIneqOp(solOp)}${rhsConst}+m$，也就是 $x${displayIneqOp(solOp)}${rhsConst}+m$。解應為 $x${displayIneqOp(solOp)}${target}$，因此 $${rhsConst}+m=${target}$，所以 $m=${m}$。`)
      );
    }

    return { questions, answers };
  }

  function buildJ241KnownSolutionParamRangeSet(count) {
    const questions = [];
    const answers = [];
    const ops = ['>', '<', '≥', '≤'];

    function chooseTargetsForX0(x0) {
      const base = [makeFraction(-5), makeFraction(-4), makeFraction(-3), makeFraction(-2), makeFraction(-1), makeFraction(0), makeFraction(1), makeFraction(2), makeFraction(3), makeFraction(4), makeFraction(5)];
      if (Math.abs(x0) % 2 === 0) {
        base.push(makeFraction(-7, 2), makeFraction(-5, 2), makeFraction(-3, 2), makeFraction(-1, 2), makeFraction(1, 2), makeFraction(3, 2), makeFraction(5, 2), makeFraction(7, 2));
      }
      if (Math.abs(x0) % 3 === 0) {
        base.push(makeFraction(-8, 3), makeFraction(-5, 3), makeFraction(-4, 3), makeFraction(-2, 3), makeFraction(2, 3), makeFraction(4, 3), makeFraction(5, 3), makeFraction(8, 3));
      }
      return base;
    }

    for (let i = 0; i < count; i += 1) {
      let built = false;
      for (let tries = 0; tries < 60 && !built; tries += 1) {
        const x0Choices = [-6, -4, -3, -2, 2, 3, 4, 6];
        const x0 = x0Choices[randInt(0, x0Choices.length - 1)];
        const targetChoices = chooseTargetsForX0(x0);
        const target = targetChoices[randInt(0, targetChoices.length - 1)];
        const solOp = ops[randInt(0, ops.length - 1)];
        const askMax = solOp === '<' || solOp === '≤';
        const askText = askMax ? '最大' : '最小';
        const integerAnswer = askMax ? maxIntegerForIneq(solOp, target) : minIntegerForIneq(solOp, target);
        if (integerAnswer === null || integerAnswer === undefined) continue;
        const rawOp = x0 > 0 ? solOp : flipInequality(solOp);
        const rightCoef = pickNonZero(-4, 4);
        const leftBias = randInt(-8, 8);
        const x0TimesTarget = (x0 * target.num) / target.den;
        if (!Number.isInteger(x0TimesTarget)) continue;
        const rightConst = x0TimesTarget - rightCoef * x0 + leftBias;
        if (rightConst < -18 || rightConst > 18) continue;
        const leftExpr = `ax${leftBias >= 0 ? '+' : ''}${leftBias}`;
        const rightExpr = formatLinearExpr(rightCoef, rightConst);
        questions.push(
          `已知 $x=${x0}$ 為不等式 $${leftExpr}${displayIneqOp(rawOp)}${rightExpr}$ 的解，求 $a$ 的範圍，並求滿足條件的${askText}整數。`
        );
        answers.push(
          formatJ241Answer(
            `$a${displayIneqOp(solOp)}${fractionToLatex(target, true)}$，${askText}整數為 $${integerAnswer}$`,
            `把 $x=${x0}$ 代入，可得 $${x0}a${leftBias >= 0 ? '+' : ''}${leftBias}${displayIneqOp(rawOp)}${rightCoef * x0}${rightConst >= 0 ? '+' : ''}${rightConst}$。整理得 $${x0}a${displayIneqOp(rawOp)}${rightCoef * x0 + rightConst - leftBias}$。再解得 $a${displayIneqOp(solOp)}${fractionToLatex(target, true)}$。因此滿足條件的${askText}整數為 $${integerAnswer}$。`
          )
        );
        built = true;
      }
      if (!built) {
        questions.push('已知 $x=-4$ 為不等式 $ax-5<2x+4$ 的解，求 $a$ 的範圍，並求滿足條件的最小整數。');
        answers.push(formatJ241Answer('$a>-\\frac{1}{4}$，最小整數為 $0$', '把 $x=-4$ 代入，可得 $-4a-5<-4$。整理得 $-4a<1$，所以 $a>-\\frac{1}{4}$。因此滿足條件的最小整數為 $0$。'));
      }
    }

    return { questions, answers };
  }

  function buildJ241SameSolutionSet(count) {
    const questions = [];
    const answers = [];
    const ops = ['>', '<', '≥', '≤'];

    function symbolWithConst(symbol, constant) {
      if (constant === 0) return symbol;
      return `${symbol}${constant > 0 ? '+' : ''}${constant}`;
    }

    for (let i = 0; i < count; i += 1) {
      const solOp = ops[randInt(0, ops.length - 1)];
      const target = randInt(-5, 7);
      const variant = i % 3;

      if (variant === 0) {
        const p = randInt(2, 6);
        const q = pickNonZero(-4, 4);
        const r = randInt(-5, 5);
        const A = p - q;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const raw1 = A > 0 ? solOp : flipInequality(solOp);
        const rhs1 = A * target + p * r;

        const s = randInt(2, 5);
        const t = pickNonZero(-4, 4);
        const u = randInt(-5, 5);
        const B = s - t;
        if (B === 0) {
          i -= 1;
          continue;
        }
        const raw2 = B > 0 ? solOp : flipInequality(solOp);
        const a = randInt(-20, 20);
        const rhs2 = B * target + s * u - a;
        const secondConst = rhs2 - s * u;
        const secondRhs = symbolWithConst('a', secondConst);
        questions.push(
          `若不等式 $${p}(x${r >= 0 ? '+' : ''}${r})${displayIneqOp(raw1)}${formatLinearExpr(q, rhs1)}$ 的解與 $${s}(x${u >= 0 ? '+' : ''}${u})${displayIneqOp(raw2)}${formatLinearExpr(t, rhs2)}+a$ 的解相同，求 $a$。`
        );
        answers.push(
          formatJ241Answer(`$a=${a}$`, `先解第一個不等式，整理後得 $${formatIneqSolution(solOp, makeFraction(target))}$。第二個不等式展開整理後可化成 $${formatTerm(B, 'x')}${displayIneqOp(raw2)}${secondRhs}$。因為兩者解相同，所以界線也必須是 ${target}，即 $${secondRhs}=${B * target}$。解得 $a=${a}$。`)
        );
        continue;
      }

      if (variant === 1) {
        const p = randInt(2, 5);
        const q = randInt(2, 5);
        const r = randInt(-4, 4);
        const u = randInt(-4, 4);
        const A = p - q;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const raw1 = A > 0 ? solOp : flipInequality(solOp);
        const rhs1 = A * target + p * r - q * u;

        const s = randInt(2, 5);
        const t = randInt(2, 5);
        const B = s - t;
        if (B === 0) {
          i -= 1;
          continue;
        }
        const raw2 = B > 0 ? solOp : flipInequality(solOp);
        const m = randInt(-8, 8);
        const a = B * target + s * m - t * u;
        const secondConst = -(s * m - t * u);
        const secondRhs = symbolWithConst('a', secondConst);
        questions.push(
          `若 $${p}(x${r >= 0 ? '+' : ''}${r})-${q}(x${u >= 0 ? '+' : ''}${u})${displayIneqOp(raw1)}${rhs1}$ 的解與 $${s}(x${m >= 0 ? '+' : ''}${m})-${t}(x${u >= 0 ? '+' : ''}${u})${displayIneqOp(raw2)}a$ 的解相同，求 $a$。`
        );
        answers.push(
          formatJ241Answer(`$a=${a}$`, `第一個不等式展開整理後可得 $${formatIneqSolution(solOp, makeFraction(target))}$。第二個不等式化簡後是 $${formatTerm(B, 'x')}${displayIneqOp(raw2)}${secondRhs}$。由於兩式解相同，所以界線也應是 ${target}，因此 $${secondRhs}=${B * target}$，得 $a=${a}$。`)
        );
        continue;
      }

      const p = randInt(2, 5);
      const q = pickNonZero(-4, 4);
      const r = randInt(-4, 4);
      const A = p - q;
      if (A === 0) {
        i -= 1;
        continue;
      }
      const raw1 = A > 0 ? solOp : flipInequality(solOp);
      const rhs1 = A * target + p * r;

      const s = randInt(2, 5);
      const t = pickNonZero(-4, 4);
      const u = randInt(-5, 5);
      const B = s - t;
      if (B === 0) {
        i -= 1;
        continue;
      }
      const raw2 = B > 0 ? solOp : flipInequality(solOp);
      const a = B * target + s * u;
      const secondRhs = symbolWithConst('a', -s * u);
      questions.push(
        `若不等式 $${p}(x${r >= 0 ? '+' : ''}${r})${displayIneqOp(raw1)}${formatLinearExpr(q, rhs1)}$ 的解與 $${s}(x${u >= 0 ? '+' : ''}${u})${displayIneqOp(raw2)}${t}x+a$ 的解相同，求 $a$。`
      );
      answers.push(
        formatJ241Answer(`$a=${a}$`, `先把第一個不等式化簡，得 $${formatIneqSolution(solOp, makeFraction(target))}$。第二個不等式整理成 $${formatTerm(B, 'x')}${displayIneqOp(raw2)}${secondRhs}$。要和前式解相同，就要有 $${secondRhs}=${B * target}$，解得 $a=${a}$。`)
      );
    }

    return { questions, answers };
  }

  function buildJ242BasicWordSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;
      const cycle = Math.floor(i / 6);

      if (variant === 0) {
        const countItem = 4 + (cycle % 4);
        const budget = 90 + cycle * 17 + countItem;
        const bound = fractionToLatex(makeFraction(budget, countItem), true);
        questions.push(`預算購買：一枝螢光筆 $x$ 元，買 ${countItem} 枝的錢不夠付 ${budget} 元，求 $x$ 的範圍。`);
        answers.push(
          formatJ242Answer(`$x<${bound}$`, `依題意可列不等式 $${countItem}x<${budget}$。兩邊同除以 ${countItem}，得 $x<${bound}$。`)
        );
        continue;
      }

      if (variant === 1) {
        const names = ['小涵', '小宇', '小晴', '小恩', '小妍', '小杰', '小蓉', '小翔'];
        const name = names[cycle % names.length];
        const gain = 4 + ((cycle * 5 + 1) % 8);
        const limit = 56 + ((cycle * 11 + 3) % 31);
        questions.push(`體重限制：${name}現在體重 $x$ 公斤，增加 ${gain} 公斤後超過 ${limit} 公斤，求 $x$ 的範圍。`);
        answers.push(formatJ242Answer(`$x>${limit - gain}$`, `依題意可列 $x+${gain}>${limit}$，所以 $x>${limit - gain}$。`));
        continue;
      }

      if (variant === 2) {
        const a = 70 + ((cycle * 7 + 3) % 23);
        const b = 74 + ((cycle * 11 + 5) % 23);
        const needScore = 80 + ((cycle * 13 + 7) % 21);
        const target = a + b + needScore;
        questions.push(
          `考試總分：三次數學測驗分數分別為 ${a}、${b}、$x$ 分，總分達 ${target} 分以上，求 $x$ 的最小值。`
        );
        answers.push(
          formatJ242Answer(`${target - a - b} 分`, `依題意：$${a}+${b}+x≥${target}$。整理得 $x≥${target - a - b}$，所以 $x$ 的最小值是 ${target - a - b}。`)
        );
        continue;
      }

      if (variant === 3) {
        const start = 120 + ((cycle * 37 + 11) % 301);
        const daily = 20 + ((cycle * 17 + 9) % 71);
        const plannedDays = 4 + ((cycle * 5 + 2) % 7);
        const shortage = 5 + ((cycle * 11 + 3) % 21);
        const goal = start + daily * plannedDays - shortage;
        questions.push(
          `存款目標：小安已經有 ${start} 元，每天存 ${daily} 元，想買 ${goal} 元的物品，至少要再存 $x$ 天才夠，求 $x$ 的範圍。`
        );
        const need = goal - start;
        const bound = fractionToLatex(makeFraction(need, daily), true);
        const minDays = Math.ceil(need / daily);
        answers.push(
          formatJ242Answer(`至少 ${minDays} 天（$x≥${bound}$）`, `依題意可列 $${daily}x+${start}≥${goal}$，整理得 $${daily}x≥${need}$，所以 $x≥${bound}$。若以天數計，至少要 ${minDays} 天。`)
        );
        continue;
      }

      if (variant === 4) {
        const kids = 4 + ((cycle * 3 + 1) % 7);
        const each = 4 + ((cycle * 5 + 2) % 8);
        questions.push(`基礎分配：將 $x$ 顆糖果分給 ${kids} 位小朋友，每人至少得 ${each} 顆，求糖果總數的最小值。`);
        answers.push(
          formatJ242Answer(`${kids * each} 顆`, `每人至少 ${each} 顆，${kids} 人至少共要 $${kids}\\times ${each}=${kids * each}$ 顆，所以 $x≥${kids * each}$，最小值是 ${kids * each}。`)
        );
        continue;
      }

      const length = 6 + ((cycle * 7 + 2) % 10);
      const heightBase = 4 + ((cycle * 5 + 1) % 8);
      const areaLimit = length * heightBase - (1 + ((cycle * 3) % (length - 1)));
      const bound = fractionToLatex(makeFraction(areaLimit, length), true);
      questions.push(`矩形面積：長方形長是 ${length}，寬是 $x$，若面積不到 ${areaLimit} 平方公分，求 $x$ 的範圍。`);
      answers.push(
        formatJ242Answer(`$x<${bound}$`, `依題意可列 $${length}x<${areaLimit}$，因此 $x<${bound}$。`)
      );
    }

    return { questions, answers };
  }

  function buildJ242RegularWordSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;

      if (variant === 0) {
        const books = randInt(3, 6);
        const gift = randInt(80, 160);
        const pay = randInt(420, 650);
        const threshold = randInt(40, 110);
        const spendLimit = pay - threshold;
        const bound = fractionToLatex(makeFraction(spendLimit - gift, books), true);
        questions.push(
          `購物找零：小萱買了 ${books} 本每本 $x$ 元的書與一個 ${gift} 元的飾品，付 ${pay} 元找回的錢超過 ${threshold} 元，求 $x$ 的範圍。`
        );
        answers.push(
          formatJ242Answer(`$x<${bound}$`, `找回超過 ${threshold} 元，表示實際花費不到 ${pay - threshold} 元。可列不等式 $${books}x+${gift}<${spendLimit}$，整理得 $x<${bound}$。`)
        );
        continue;
      }

      if (variant === 1) {
        const start = randInt(50, 100);
        const step = randInt(4, 8);
        const totalCap = start + step * randInt(18, 30) - randInt(3, 15);
        questions.push(
          `計程車資：起跳價 ${start} 元，每跳一次加 ${step} 元，跳了 $x$ 次後總價不到 ${totalCap} 元，求 $x$ 的最大整數值。`
        );
        const rhs = totalCap - start;
        const bound = makeFraction(rhs, step);
        const boundText = fractionToLatex(bound, true);
        const maxValue = maxIntegerForIneq('<', bound);
        answers.push(
          formatJ242Answer(`${maxValue}`, `依題意：$${step}x+${start}<${totalCap}$，所以 $${step}x<${rhs}$，得 $x<${boundText}$。因此 $x$ 的最大整數值是 ${maxValue}。`)
        );
        continue;
      }

      if (variant === 2) {
        const totalStudents = randInt(30, 45);
        const boys = randInt(14, totalStudents - 8);
        const girls = totalStudents - boys;
        const delta = randInt(1, 4);
        const targetAvg = boys + girls > 0 ? randInt(68, 86) : 70;
        questions.push(
          `平均分數：${totalStudents} 位學生中男生 ${boys} 位，男生平均 $x$ 分，女生平均比男生多 ${delta} 分，全班平均不低於 ${targetAvg} 分，求 $x$ 的範圍。`
        );
        const coef = totalStudents;
        const rhs = targetAvg * totalStudents - girls * delta;
        const bound = fractionToLatex(makeFraction(rhs, coef), true);
        answers.push(
          formatJ242Answer(`$x≥${bound}$`, `女生平均為 $x+${delta}$ 分，所以全班總分至少為 $${targetAvg}\\times ${totalStudents}$。可列 $${boys}x+${girls}(x+${delta})≥${targetAvg * totalStudents}$。整理得 $${coef}x≥${rhs}$，所以 $x≥${bound}$。`)
        );
        continue;
      }

      if (variant === 3) {
        const base = randInt(4, 10);
        const low = randInt(10, 18);
        const high = low + randInt(3, 7);
        questions.push(
          `三角形面積：三角形底為 ${base}，高為 $(x-2)$，面積大於 ${low} 但不超過 ${high}，求 $x$ 的範圍。`
        );
        const lowBound = addFraction(makeFraction(2 * low, base), makeFraction(2));
        const highBound = addFraction(makeFraction(2 * high, base), makeFraction(2));
        const rangeText = `$x>${fractionToLatex(lowBound, true)}$ 且 $x≤${fractionToLatex(highBound, true)}$`;
        answers.push(
          formatJ242Answer(rangeText, `面積為 $\\dfrac{${base}(x-2)}{2}$，依題意：$${low}<\\dfrac{${base}(x-2)}{2}≤${high}$。同乘以 $\\dfrac{2}{${base}}$ 並整理，可得 ${rangeText}。`)
        );
        continue;
      }

      if (variant === 4) {
        const rate = randInt(20, 50);
        const cap = rate * randInt(4, 8);
        questions.push(
          `停車費率：某停車場每小時收費 ${rate} 元，不滿 1 小時以 1 小時計。若停了 $x$ 小時，總費用不超過 ${cap} 元，求 $x$ 的範圍。`
        );
        const bound = fractionToLatex(makeFraction(cap, rate), true);
        const maxHours = Math.floor(cap / rate);
        answers.push(
          formatJ242Answer(`$x≤${bound}$，最多 ${maxHours} 小時`, `依題意：$${rate}x≤${cap}$，所以 $x≤${bound}$。若題目限制以小時計，則最多可停 ${maxHours} 小時。`)
        );
        continue;
      }

      const younger = randInt(8, 15);
      const gap = randInt(6, 12);
      questions.push(
        `年齡限制：小恩今年 $x$ 歲，小岩 ${younger} 歲，兩人歲數至少相差 ${gap} 歲且小恩較大，求 $x$ 的範圍。`
      );
      answers.push(formatJ242Answer(`$x≥${younger + gap}$`, `因為小恩較大，且年齡至少差 ${gap} 歲，所以 $x-${younger}≥${gap}$。整理得 $x≥${younger + gap}$。`));
    }

    return { questions, answers };
  }

  function buildJ242AdvancedWordSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;
      const cycle = Math.floor(i / 6);

      if (variant === 0) {
        const unplacedChoices = [8, 9, 10, 11, 12, 13, 14, 15, 16];
        const unplaced = unplacedChoices[cycle % unplacedChoices.length];
        const possibleRooms = Array.from({ length: 30 }, (_, idx) => idx + 1).filter(
          (n) => 7 * (n - 1) < 5 * n + unplaced && 5 * n + unplaced < 7 * n
        );
        const roomText = possibleRooms.join('、');
        const lowerText = fractionToLatex(makeFraction(unplaced, 2), true);
        const upperText = fractionToLatex(makeFraction(unplaced + 7, 2), true);
        questions.push(
          `宿舍分配：有一群學生分配宿舍，若每間住 5 人，則 ${unplaced} 人無房可住；若每間住 7 人，則有一間住不滿但非空房。求宿舍可能的間數。`
        );
        answers.push(
          formatJ242Answer(`${roomText} 間`, `設宿舍有 $x$ 間，則學生總數可寫成 $5x+${unplaced}$。若每間住 7 人，因為有一間住不滿但不是空房，所以滿足 $7(x-1)<5x+${unplaced}<7x$。整理後得到 $x>${lowerText}$ 且 $x<${upperText}$。因此宿舍可能的整數間數是 ${roomText}。`)
        );
        continue;
      }

      if (variant === 1) {
        const total = 25;
        const score = 4;
        const penalty = 1;
        const boundChoices = [76, 79, 82, 85, 88, 91];
        const bound = boundChoices[cycle % boundChoices.length];
        questions.push(
          `計分扣分制：數學測驗共 ${total} 題，對 1 題得 ${score} 分，錯 1 題倒扣 ${penalty} 分。小威全部作答，錯了 $x$ 題且得分超過 ${bound} 分，求 $x$ 的最大值。`
        );
        const rhs = score * total - bound;
        const coef = score + penalty;
        const boundFrac = makeFraction(rhs, coef);
        const boundText = fractionToLatex(boundFrac, true);
        const maxWrong = maxIntegerForIneq('<', boundFrac);
        answers.push(
          formatJ242Answer(`${maxWrong} 題`, `若錯 $x$ 題，則對了 $${total}-x$ 題，得分為 $${score}(${total}-x)-${penalty}x$。依題意：$${score}(${total}-x)-${penalty}x>${bound}$，整理得 $${coef}x<${score * total - bound}$，即 $x<${boundText}$。因此 $x$ 的最大值是 ${maxWrong}。`)
        );
        continue;
      }

      if (variant === 2) {
        const thresholdChoices = [20, 21, 22, 24, 25, 27, 30];
        const lowFeeChoices = [10, 12, 14, 11, 13, 15, 16];
        const feeGapChoices = [5, 6, 7, 4, 6, 5, 7];
        const threshold = thresholdChoices[cycle % thresholdChoices.length];
        const lowFee = lowFeeChoices[cycle % lowFeeChoices.length];
        const highFee = lowFee + feeGapChoices[cycle % feeGapChoices.length];
        questions.push(
          `分段郵資：寄 $x$ 公克的限時郵件，若 ${threshold} 公克以下郵資為 ${lowFee} 元，超過 ${threshold} 公克且不超過 ${threshold + 30} 公克郵資為 ${highFee} 元。若付 ${highFee} 元郵資，求 $x$ 的範圍。`
        );
        answers.push(
          formatJ242Answer(`$${threshold}<x≤${threshold + 30}$`, `付 ${highFee} 元代表重量已超過 ${threshold} 公克，但沒有超過 ${threshold + 30} 公克，所以 $${threshold}<x≤${threshold + 30}$。`)
        );
        continue;
      }

      if (variant === 3) {
        const volumeTemplates = [
          { first: 3, extra: 2, gaps: [120, 135, 150, 165, 180] },
          { first: 2, extra: 2, gaps: [80, 100, 120, 140, 160] },
          { first: 4, extra: 2, gaps: [120, 144, 168, 192, 216] },
        ];
        const template = volumeTemplates[cycle % volumeTemplates.length];
        const gap = template.gaps[cycle % template.gaps.length];
        const water = (18 + ((cycle * 5 + 3) % 14)) * 10;
        const cup = water + gap;
        const totalBeads = template.first + template.extra;
        const lowerBound = fractionToLatex(makeFraction(gap, totalBeads), true);
        const upperBound = fractionToLatex(makeFraction(gap, template.first), true);
        questions.push(
          `體積位移：${cup}cc 的杯子裡先裝 ${water}cc 的水，放入 ${template.first} 顆玻璃珠後水未滿；再放 ${template.extra} 顆則溢出。若每顆玻璃珠體積為 $x$ cc，求 $x$ 的範圍。`
        );
        answers.push(
          formatJ242Answer(`$${lowerBound}<x<${upperBound}$`, `放入 ${template.first} 顆後未滿：$${water}+${template.first}x<${cup}$；再放 ${template.extra} 顆後共有 ${totalBeads} 顆且溢出：$${water}+${totalBeads}x>${cup}$。整理得 $x<${upperBound}$ 且 $x>${lowerBound}$，所以 $${lowerBound}<x<${upperBound}$。`)
        );
        continue;
      }

      if (variant === 4) {
        const ticketOptions = [160, 180, 200, 220, 240, 280, 320];
        const discountPeopleOptions = [16, 20, 24, 28, 32];
        const ticket = ticketOptions[cycle % ticketOptions.length];
        const discountPeople = discountPeopleOptions[cycle % discountPeopleOptions.length];
        const discountPrice = (ticket * 3) / 4;
        const groupCost = discountPrice * discountPeople;
        const minPeople = Math.floor(groupCost / ticket) + 1;
        questions.push(
          `門票團體折價：門票每張 ${ticket} 元，${discountPeople} 人以上可打 75 折。若團體人數 $x$ 人（且 $x<${discountPeople}$），直接買 ${discountPeople} 張團體票反而更便宜，求 $x$ 的最小值。`
        );
        answers.push(
          formatJ242Answer(`${minPeople} 人`, `買 $x$ 張原價票需 $${ticket}x$ 元；直接買 ${discountPeople} 張團體票需 $${discountPrice}\\times ${discountPeople}=${groupCost}$ 元。依題意：$${groupCost}<${ticket}x$，所以 $x>${fractionToLatex(makeFraction(groupCost, ticket), true)}$。又 $x$ 是整數且 $x<${discountPeople}$，故最小值是 $${minPeople}$。`)
        );
        continue;
      }

      if (variant === 5) {
        const voteChoices = [31, 34, 37, 40, 43];
        const totalVotes = voteChoices[cycle % voteChoices.length];
        questions.push(
          `選舉席次判定：某班要從 4 位候選人中選出得票最高的 2 人參加比賽。若有效票共 ${totalVotes} 票，阿文目前得 $x$ 票，至少要得幾票才能保證當選？`
        );
        const bound = makeFraction(totalVotes, 3);
        const minVote = Math.floor(totalVotes / 3) + 1;
        answers.push(
          formatJ242Answer(`${minVote} 票`, `若阿文得 $x$ 票，剩下 ${totalVotes}-$x$ 票要分給另外 3 人。要讓阿文無法保證當選，至少要有 2 個人各得 $x$ 票，因此必須滿足 $${totalVotes}-x\\ge 2x$。所以要保證當選，就要 $${totalVotes}-x<2x$，整理得 $x>${fractionToLatex(bound, true)}$。又票數是整數，所以至少要 ${minVote} 票。`)
        );
        continue;
      }

    }

    return { questions, answers };
  }

  function buildJ1DistributiveLawSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = [20, 30, 40, 50, 60, 70, 80, 90][randInt(0, 7)];
      const near = randInt(101, 399) * (randInt(0, 1) ? 1 : -1);
      const delta = randInt(1, 8) * (randInt(0, 1) ? 1 : -1);
      const exact = near + delta;
      const total = exact * base;
      questions.push(`利用分配律計算：${exact}×${base}`);
      answers.push(
        `把 ${exact} 看成 ${near}${delta >= 0 ? '+' : ''}${delta}，依分配律：$(${near}${delta >= 0 ? '+' : ''}${delta})\\times ${base}=${near}\\times ${base}${delta >= 0 ? '+' : ''}${delta}\\times ${base}=${total}$。`
      );
    }
    return { questions, answers };
  }

  function buildJ1CommonFactorSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const common = pickNonZero(-90, 90);
      const a = pickNonZero(-40, 40);
      const b = pickNonZero(-40, 40);
      const total = common * a + common * b;
      questions.push(`利用提出公因數計算：${common}×(${a}) + ${common}×(${b})`);
      answers.push(
        `提出公因數 ${common}：$${common}\\times(${a})+${common}\\times(${b})=${common}\\times(${a}${b >= 0 ? '+' : ''}${b})=${common}\\times(${a + b})=${total}$。`
      );
    }
    return { questions, answers };
  }

  function buildJ1CommonFactorFourTermsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(-20, 20);
      const q = pickNonZero(-20, 20);
      const a = pickNonZero(-15, 15);
      const b = pickNonZero(-15, 15);
      const c = pickNonZero(-15, 15);
      const d = pickNonZero(-15, 15);
      const value = p * a + p * b + q * c + q * d;
      questions.push(`利用分組提出公因數計算：${p}×(${a}) + ${p}×(${b}) + ${q}×(${c}) + ${q}×(${d})`);
      answers.push(
        `先兩兩分組：$${p}[(${a})${b >= 0 ? '+' : ''}(${b})]+${q}[(${c})${d >= 0 ? '+' : ''}(${d})]=${p}\\times(${a + b})${q >= 0 ? '+' : ''}${q}\\times(${c + d})=${value}$。`
      );
    }
    return { questions, answers };
  }

  function buildJ1VariableNearbySet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(30, 90);
      const b = randInt(10, 40);
      const x = randInt(3, 9);
      const y = randInt(2, 8);
      const left = a * x + (a + b) * y;
      questions.push(`設法利用分配律計算：${a}×${x} + ${a + b}×${y}`);
      answers.push(
        `把第二項拆成 ${a}×${y}+${b}×${y}$，原式 $=${a}×${x}+${a}×${y}+${b}×${y}=${a}×(${x + y})+${b}×${y}=${a}×${x + y}+${b}×${y}=${left}$。`
      );
    }
    return { questions, answers };
  }

  function buildJ1VariableDistributiveEvalSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-12, 12);
      const b = pickNonZero(-12, 12);
      const x = pickNonZero(-10, 10);
      const target = a * x;
      const expr = a * (x + b);
      questions.push(`已知 ${a}×${x}=${target}，求 ${a}×(${x}${b >= 0 ? '+' : ''}${b}) 的值。`);
      answers.push(
        `利用分配律：$${a}\\times(${x}${b >= 0 ? '+' : ''}${b})=${a}\\times${x}${a * b >= 0 ? '+' : ''}${a * b}=${target}${a * b >= 0 ? '+' : ''}${a * b}=${expr}$。`
      );
    }
    return { questions, answers };
  }

  function buildWeirdSymbolCalcSet(count) {
    const questions = [];
    const answers = [];
    const symbolDefs = [
      { sym: '★', calc: (a, b) => a + 2 * b, text: 'a★b=a+2b' },
      { sym: '◎', calc: (a, b) => 2 * a - b, text: 'a◎b=2a-b' },
      { sym: '◆', calc: (a, b) => a * b + a, text: 'a◆b=ab+a' },
    ];
    for (let i = 0; i < count; i += 1) {
      const def = symbolDefs[i % symbolDefs.length];
      const a = pickNonZero(-9, 9);
      const b = pickNonZero(-9, 9);
      const value = def.calc(a, b);
      questions.push(`若規定 ${def.text}，求 ${a}${def.sym}${b}。`);
      answers.push(`依規定代入：$${a}${def.sym}${b}=${value}$。`);
    }
    return { questions, answers };
  }

  function buildWeirdSymbolCalcThreeLayerSet(count) {
    const questions = [];
    const answers = [];
    const symbolDefs = [
      { sym: '★', calc: (a, b) => a + 2 * b, text: 'a★b=a+2b' },
      { sym: '◎', calc: (a, b) => 2 * a - b, text: 'a◎b=2a-b' },
    ];
    for (let i = 0; i < count; i += 1) {
      const d1 = symbolDefs[0];
      const d2 = symbolDefs[1];
      const a = pickNonZero(-6, 6);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-6, 6);
      const inner = d1.calc(a, b);
      const value = d2.calc(inner, c);
      questions.push(`若規定 ${d1.text}，${d2.text}，求 (${a}${d1.sym}${b})${d2.sym}${c}。`);
      answers.push(
        `先算內層：$${a}${d1.sym}${b}=${inner}$；再算外層：$${inner}${d2.sym}${c}=${value}$。所以結果是 ${value}。`
      );
    }
    return { questions, answers };
  }

  function parseGenerateCall(generateFn) {
    if (typeof generateFn !== 'function') return null;
    const source = Function.prototype.toString.call(generateFn);
    const match = source.match(/return\s+([A-Za-z_$][\w$]*)\(([\s\S]*?)\)\s*;/);
    if (!match) return null;
    return {
      builderName: match[1],
      argsSource: String(match[2] || '').trim(),
    };
  }

  function resolveLocalBuilder(builderName) {
    if (!builderName) return null;
    try {
      return eval(builderName);
    } catch (_error) {
      return null;
    }
  }

  function evaluateBuilderArgs(argsSource) {
    const source = String(argsSource || '').trim();
    if (!source) return [];
    try {
      const result = eval(`[${source}]`);
      return Array.isArray(result) ? result : null;
    } catch (_error) {
      return null;
    }
  }

  function replaceTrailingCountArg(argsSource, nextCount) {
    const source = String(argsSource || '').trim();
    const count = Number(nextCount);
    if (!Number.isFinite(count) || count <= 0) return source;
    if (!source) return `${count}`;
    return source.replace(/-?\d+(?:\.\d+)?\s*$/, `${count}`);
  }

  function runGenerateWithQuestionCount(generateFn, nextCount) {
    const parsed = parseGenerateCall(generateFn);
    const count = Number(nextCount);
    if (!parsed || !Number.isFinite(count) || count <= 0) return null;

    const builder = resolveLocalBuilder(parsed.builderName);
    if (typeof builder !== 'function') return null;

    const nextArgsSource = replaceTrailingCountArg(parsed.argsSource, count);
    const args = evaluateBuilderArgs(nextArgsSource);
    if (!Array.isArray(args)) return null;

    try {
      return builder(...args);
    } catch (_error) {
      return null;
    }
  }

  function shuffleGeneratedSet(result) {
    if (!result || typeof result !== 'object') return result;
    const questions = Array.isArray(result.questions) ? result.questions.slice() : [];
    const answers = Array.isArray(result.answers) ? result.answers.slice() : [];
    const maxLen = Math.max(questions.length, answers.length);
    if (maxLen <= 1) return result;

    const pairs = Array.from({ length: maxLen }, (_, index) => ({
      question: questions[index],
      answer: answers[index],
    }));
    const shuffled = shuffle(pairs);

    return {
      ...result,
      questions: shuffled.map((entry) => entry.question).filter((entry) => entry !== undefined),
      answers: shuffled.map((entry) => entry.answer).filter((entry) => entry !== undefined),
    };
  }

  window.formulaPracticeStore = {
    configs: {
      'midpoint-formula': {
        type: 'drill',
        title: '簡易無限練習',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildMidpointSet(10);
        },
      },
      'distance-formula': {
        type: 'drill',
        title: '簡易無限練習',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildDistanceSet(10);
        },
      },
      'integer-add-subtract-four-terms-drill': {
        type: 'drill',
        title: '簡易無限練習',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildFourTermIntegerSet(10);
        },
      },
      'three-products-add-subtract-drill': {
        type: 'drill',
        title: '中等無限練習',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildThreeProductSet(5);
        },
      },
      'time-baseline-basic-drill': {
        type: 'drill',
        title: '時間基準問題',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildTimeBaselineBasicSet(10);
        },
      },
      'time-baseline-advanced-drill': {
        type: 'drill',
        title: '進階時間基準問題',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildTimeBaselineAdvancedSet(10);
        },
      },
      'nearby-average-baseline-drill': {
        type: 'drill',
        title: '基準值平均與反求未知數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildNearbyAverageBaselineSet(5);
        },
      },
      'j1-1-3-sign-brackets-power-drill': {
        type: 'drill',
        title: '正負號、括號與次方判別',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildExponentSignBracketSet(5);
        },
      },
      'j1-1-3-exponent-law-single-rule-drill': {
        type: 'drill',
        title: '指數律單一法則',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildExponentLawSingleRuleSet(5);
        },
      },
      'j1-1-3-exponent-law-mixed-rule-drill': {
        type: 'drill',
        title: '指數律進階混合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildExponentLawMixedSet(5);
        },
      },
      'j1-1-3-exponent-mixed-operations-drill': {
        type: 'drill',
        title: '零次方、負次方與綜合四則',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildExponentMixedOperationsSet(5);
        },
      },
      'j1-1-3-exponent-word-problem-drill': {
        type: 'drill',
        title: '指數生活應用',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildExponentWordProblemSet(5);
        },
      },
      'j1-1-4-scientific-convert-drill': {
        type: 'drill',
        title: '數值與科學記號的互換',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildScientificNotationConvertSet(5);
        },
      },
      'j1-1-4-scientific-digit-reading-drill': {
        type: 'drill',
        title: '位數判讀與小數點後的零',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildScientificDigitReadingSet(5);
        },
      },
      'j1-1-4-scientific-compare-drill': {
        type: 'drill',
        title: '科學記號的大小比較',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildScientificCompareSet(5);
        },
      },
      'j1-1-4-scientific-mul-div-drill': {
        type: 'drill',
        title: '科學記號的乘除運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildScientificMulDivSet(5);
        },
      },
      'j1-1-4-scientific-add-sub-drill': {
        type: 'drill',
        title: '科學記號的加減運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildScientificAddSubSet(5);
        },
      },
      'j1-1-4-scientific-unit-conversion-drill': {
        type: 'drill',
        title: '長度與重量單位的轉換',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildScientificUnitConversionSet(5);
        },
      },
      'j1-1-4-scientific-normalize-drill': {
        type: 'drill',
        title: '不完整科學記號化為標準形',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildScientificNormalizeSet(5);
        },
      },
      'opposite-number-equation-drill': {
        type: 'drill',
        title: '相反數問題',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildOppositeNumberSet(10);
        },
      },
      'midpoint-distance-combined-drill': {
        type: 'drill',
        title: '中點與距離問題',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildMidpointDistanceCombinedSet(10);
        },
      },
      'same-shift-opposite-drill': {
        type: 'drill',
        title: '兩數同加或減一數成相反數',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildSameShiftOppositeSet(10);
        },
      },
      'midpoint-reverse-drill': {
        type: 'drill',
        title: '中點反向問題',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildMidpointReverseSet(10);
        },
      },
      'midpoint-plus-distance-drill': {
        type: 'drill',
        title: '中點加距離綜合問題',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildMidpointPlusDistanceSet(10);
        },
      },
      'three-point-quick-distance-drill': {
        type: 'drill',
        title: '三點快速看距離練習',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildThreePointQuickDistanceSet(10);
        },
      },
      'coordinate-origin-unit-change': {
        type: 'drill',
        title: '改變原點與單位長時坐標變化',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildCoordinateOriginUnitChangeSet(3);
        },
      },
      'j3-1-1-formula-mixed-integer-drill': {
        type: 'drill',
        title: '乘法公式綜合（整數版）',
        difficulty: 'easy',
        questionCount: 4,
        generate() {
          return buildJ311FormulaMixedSet(4, 'integer');
        },
      },
      'j3-1-1-formula-mixed-decimal-drill': {
        type: 'drill',
        title: '乘法公式綜合（小數版）',
        difficulty: 'easy',
        questionCount: 4,
        generate() {
          return buildJ311FormulaMixedSet(4, 'decimal');
        },
      },
      'j3-1-1-formula-mixed-fraction-drill': {
        type: 'drill',
        title: '乘法公式綜合（分數版）',
        difficulty: 'medium',
        questionCount: 4,
        generate() {
          return buildJ311FormulaMixedSet(4, 'fraction');
        },
      },
      'j3-1-1-formula-mixed-variable-drill': {
        type: 'drill',
        title: '乘法公式綜合版（未知數）',
        difficulty: 'medium',
        questionCount: 4,
        generate() {
          return buildJ311VariableFormulaMixedSet(4);
        },
      },
      'sum-square-variable-drill': {
        type: 'drill',
        title: '和平方未知數版',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildBinomialQuestions(5, 'sum', 'variable');
        },
      },
      'difference-square-variable-drill': {
        type: 'drill',
        title: '差平方未知數版',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildBinomialQuestions(5, 'diff', 'variable');
        },
      },
      'square-difference-variable-drill': {
        type: 'drill',
        title: '平方差未知數展開',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildDifferenceOfSquaresQuestions(5, 'variable');
        },
      },
      'square-difference-factorization-variable-drill': {
        type: 'drill',
        title: '平方差未知數分解',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildFactorizationQuestions(5);
        },
      },
      'identity-value-integer-basic-drill': {
        type: 'drill',
        title: '求值整數版',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildIdentityIntegerBasicSet(5);
        },
      },
      'identity-value-pair-mixed-drill': {
        type: 'drill',
        title: '求值公式綜合版（三選二）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildIdentityPairMixedSet(5);
        },
      },
      'identity-value-pair-advanced-drill': {
        type: 'drill',
        title: '求值公式進階版（三選二）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildIdentityPairAdvancedSet(5);
        },
      },
      'identity-value-sum-sqsum-to-product-drill': {
        type: 'drill',
        title: '由 a+b、a^2+b^2 求 ab',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildSumSqsumToProductSet(5);
        },
      },
      'identity-value-diff-sqsum-to-product-drill': {
        type: 'drill',
        title: '由 a-b、a^2+b^2 求 ab',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildDiffSqsumToProductSet(5);
        },
      },
      'identity-value-sum-product-drill': {
        type: 'drill',
        title: '由 a+b、ab 開始求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildIdentitySumProductSet(5);
        },
      },
      'identity-value-product-sqsum-drill': {
        type: 'drill',
        title: '由 ab、a^2+b^2 求 a+b、a-b',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildProductSqsumSet(5);
        },
      },
      'identity-value-square-pair-drill': {
        type: 'drill',
        title: '由 (a+b)^2、(a-b)^2 求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildSquarePairSet(5);
        },
      },
      'identity-value-linear-combination-drill': {
        type: 'drill',
        title: '組合式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildLinearCombinationSet(5);
        },
      },
      'identity-value-reciprocal-drill': {
        type: 'drill',
        title: '倒數型求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildReciprocalSet(5);
        },
      },
      'identity-value-reciprocal-reverse-drill': {
        type: 'drill',
        title: '倒數反推型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildReciprocalReverseSet(5);
        },
      },
      'identity-value-reciprocal-mixed-fraction-drill': {
        type: 'drill',
        title: '倒數混合分式型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildReciprocalMixedFractionSet(5);
        },
      },
      'identity-value-mixed-advanced-drill': {
        type: 'drill',
        title: '求值進階混合版',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildMixedAdvancedIdentitySet(5);
        },
      },
      'cubic-divide-linear': {
        type: 'drill',
        title: '三次多項式（四項）÷ 一次多項式',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildCubicDivideLinearSet(3);
        },
      },
      'cubic-divide-quadratic': {
        type: 'drill',
        title: '三次多項式（四項）÷ 二次多項式',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildCubicDivideQuadraticSet(3);
        },
      },
      'j3-1-3-polynomial-division-regular-drill': {
        type: 'drill',
        title: '多項式除法正常版（含分數與餘數）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ313PolynomialDivisionRegularSet(5);
        },
      },
      'j3-1-3-reverse-division-drill': {
        type: 'drill',
        title: '反面出題（已知商、餘）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ313ReverseDivisionSet(5);
        },
      },
      'j3-1-3-coeff-sum-drill': {
        type: 'drill',
        title: '係數和與常數項題型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ313CoeffSumSet(5);
        },
      },
      'j3-1-3-remainder-theorem-drill': {
        type: 'drill',
        title: '餘式定理應用題型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ313RemainderTheoremSet(5);
        },
      },
      'j3-1-3-factor-theorem-drill': {
        type: 'drill',
        title: '因式定理與未知係數判定',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ313FactorTheoremSet(5);
        },
      },
      'j3-1-2-polynomial-add-subtract-drill': {
        type: 'drill',
        title: '多項式加減運算（樣式與直式）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ312PolynomialAddSubSet(5);
        },
      },
      'j3-1-2-degree-constraint-drill': {
        type: 'drill',
        title: '根據次數性質反求參數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ312DegreeConstraintSet(5);
        },
      },
      'j3-1-2-polynomial-reverse-application-drill': {
        type: 'drill',
        title: '多項式逆推應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ312PolynomialReverseSet(5);
        },
      },
      'j3-1-2-mul-easy-mixed-drill': {
        type: 'drill',
        title: '多項式乘法（簡易版）',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312MulEasyMixedSet(6);
        },
      },
      'j3-1-2-mul-mono-mono-drill': {
        type: 'drill',
        title: '單項式 × 單項式',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312MulEasyMonoMonoSet(6);
        },
      },
      'j3-1-2-mul-mono-linear-drill': {
        type: 'drill',
        title: '單項式 × 一次多項式',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312MulEasyMonoLinearSet(6);
        },
      },
      'j3-1-2-mul-mono-quadratic-drill': {
        type: 'drill',
        title: '單項式 × 二次多項式',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312MulEasyMonoQuadraticSet(6);
        },
      },
      'j3-1-2-mul-advanced-mixed-drill': {
        type: 'drill',
        title: '進階多項式乘法',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312MulAdvMixedSet(6);
        },
      },
      'j3-1-2-mul-linear-linear-drill': {
        type: 'drill',
        title: '一次式 × 一次式',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312MulAdvLinearLinearSet(6);
        },
      },
      'j3-1-2-mul-linear-quadratic-drill': {
        type: 'drill',
        title: '一次式 × 二次式',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312MulAdvLinearQuadraticSet(6);
        },
      },
      'j3-1-2-mul-quadratic-quadratic-drill': {
        type: 'drill',
        title: '二次式 × 二次式',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312MulAdvQuadraticQuadraticSet(6);
        },
      },
      'j3-1-2-div-monomial-mixed-drill': {
        type: 'drill',
        title: '多項式除以單項式',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312DivMonomialMixedSet(6);
        },
      },
      'j3-1-2-div-mono-by-mono-drill': {
        type: 'drill',
        title: '單項式 ÷ 單項式',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312DivMonomialByMonomialSet(6);
        },
      },
      'j3-1-2-div-binomial-by-mono-drill': {
        type: 'drill',
        title: '二項式 ÷ 單項式',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312DivBinomialByMonomialSet(6);
        },
      },
      'j3-1-2-div-trinomial-by-mono-drill': {
        type: 'drill',
        title: '三項式 ÷ 單項式（含餘數）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312DivTrinomialByMonomialSet(6);
        },
      },
      'square-root-basic-junior': {
        type: 'drill',
        title: '平方根估算與近似（綜合）',
        difficulty: 'easy',
        questionCount: 8,
        generate() {
          return buildJ321SqrtEstimateMixedSet(8);
        },
      },
      'j3-2-3-triple-expand-drill': {
        type: 'drill',
        title: '畢氏數擴展與倍數',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ323TripleExpandSet(6);
        },
      },
      'j3-2-3-hypotenuse-altitude-drill': {
        type: 'drill',
        title: '斜邊高與面積性質',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ323HypotenuseAltitudeSet(6);
        },
      },
      'j3-2-3-coordinate-distance-drill': {
        type: 'drill',
        title: '座標平面兩點距離',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ323CoordinateDistanceSet(6);
        },
      },
      'j3-2-3-spatial-diagonal-drill': {
        type: 'drill',
        title: '立體圖形空間對角線',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ323SpatialDiagonalSet(6);
        },
      },
      'j3-3-1-core-factoring-mixed': {
        type: 'drill',
        title: '因式分解核心綜合（公因式）',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ331CoreFactoringMixedSet(6);
        },
      },
      'j3-3-1-common-factor-basic': {
        type: 'drill',
        title: '基礎單項提取',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ331CommonFactorBasicSet(6);
        },
      },
      'j3-3-1-common-factor-polynomial': {
        type: 'drill',
        title: '多項式式子提取',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ331PolynomialFactorSet(6);
        },
      },
      'j3-3-1-sign-transform-factoring': {
        type: 'drill',
        title: '變號法則應用',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ331SignTransformSet(6);
        },
      },
      'j3-3-1-grouping-advanced-mixed': {
        type: 'drill',
        title: '分組分解進階綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ331GroupingAdvancedMixedSet(6);
        },
      },
      'j3-3-1-grouping-factor': {
        type: 'drill',
        title: '分組分解',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ331GroupingFactorSet(6);
        },
      },
      'j3-3-1-expand-then-group': {
        type: 'drill',
        title: '先去括號再分組',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ331ExpandThenGroupSet(6);
        },
      },
      'j3-3-2-formula-mixed': {
        type: 'drill',
        title: '公式辨識與應用綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ332FormulaMixedSet(6);
        },
      },
      'j3-3-2-diff-squares': {
        type: 'drill',
        title: '平方差公式基礎',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ332DiffSquaresSet(6);
        },
      },
      'j3-3-2-perfect-square': {
        type: 'drill',
        title: '完全平方公式基礎',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ332PerfectSquareSet(6);
        },
      },
      'j3-3-2-composite-formula': {
        type: 'drill',
        title: '複合運算（先提公因式）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ332CompositeSet(6);
        },
      },
      'j3-3-2-substitution-formula': {
        type: 'drill',
        title: '多項式換項（括號型）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ332SubstitutionSet(6);
        },
      },
      'j3-3-3-cross-core-mixed': {
        type: 'drill',
        title: '十字交乘核心綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossCoreMixedSet(6);
        },
      },
      'j3-3-3-cross-coeff-one': {
        type: 'drill',
        title: '係數為 1 基礎類',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ333CrossCoeffOneSet(6);
        },
      },
      'j3-3-3-cross-coeff-nonone': {
        type: 'drill',
        title: '係數不為 1 進階類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossCoeffNonOneSet(6);
        },
      },
      'j3-3-3-cross-preprocess': {
        type: 'drill',
        title: '負號與公因數預處理',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossPreprocessSet(6);
        },
      },
      'j3-3-3-cross-sub-mixed': {
        type: 'drill',
        title: '十字交乘換元綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossSubMixedSet(6);
        },
      },
      'j3-3-3-cross-substitution': {
        type: 'drill',
        title: '代換換元十字交乘',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossSubstitutionSet(6);
        },
      },
      'j3-3-3-cross-structured': {
        type: 'drill',
        title: '括號型結構十字交乘',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossStructuredSet(6);
        },
      },
      'j3-4-1-factor-formula-solve': {
        type: 'drill',
        title: '提公因式與平方公式求解',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ341FactorFormulaSolveSet(6);
        },
      },
      'j3-4-1-cross-solve': {
        type: 'drill',
        title: '十字交乘專項練習',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ341CrossSolveSet(6);
        },
      },
      'j3-4-1-standard-transform-solve': {
        type: 'drill',
        title: '標準式轉化與消因式',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ341StandardTransformSet(6);
        },
      },
      'j3-4-1-root-property-reverse': {
        type: 'drill',
        title: '根的性質與方程還原',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ341RootPropertyReverseSet(6);
        },
      },
      'j3-4-2-square-root-solve': {
        type: 'drill',
        title: '平方根觀念求解類',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ342SquareRootSolveSet(6);
        },
      },
      'j3-4-2-complete-square-term': {
        type: 'drill',
        title: '完全平方補項類',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ342CompleteSquareTermSet(6);
        },
      },
      'j3-4-2-completing-square-solve': {
        type: 'drill',
        title: '配方法完整求解類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342CompletingSquareSolveSet(6);
        },
      },
      'j3-4-2-discriminant-judge': {
        type: 'drill',
        title: '判別式與根性質判定類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342DiscriminantSet(6);
        },
      },
      'j3-4-2-formula-direct-solve': {
        type: 'drill',
        title: '公式解直接套用類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342FormulaSolveSet(6);
        },
      },
      'j3-4-2-reverse-from-square': {
        type: 'drill',
        title: '配方後形式與參數還原類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342ReverseFromSquareSet(6);
        },
      },
      'j3-4-2-roots-core-mixed': {
        type: 'drill',
        title: '兩根和積核心綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342RootsCoreMixedSet(6);
        },
      },
      'j3-4-2-roots-direct': {
        type: 'drill',
        title: '由方程式求兩根和與積',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ342RootsSumProductDirectSet(6);
        },
      },
      'j3-4-2-roots-reverse': {
        type: 'drill',
        title: '由和積（或兩根）還原方程',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342ReverseEquationFromRootsSet(6);
        },
      },
      'j3-4-2-roots-expression': {
        type: 'drill',
        title: '代數式變形（和積）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342ExpressionBySumProductSet(6);
        },
      },
      'j3-4-2-roots-applied-mixed': {
        type: 'drill',
        title: '兩根和積應用綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342RootsAppliedMixedSet(6);
        },
      },
      'j3-4-2-roots-coefficient-mistake': {
        type: 'drill',
        title: '係數看錯題（和積修正）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342CoefficientMistakeSet(6);
        },
      },
      'j3-4-2-roots-special-relation': {
        type: 'drill',
        title: '特殊根關係（相反數/倒數）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342SpecialRootRelationSet(6);
        },
      },
      'radical-mul-div-split-rule': {
        type: 'drill',
        title: '根式乘除可拆',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildRadicalMulDivSet(5);
        },
      },
      'radical-add-subtract-like-terms': {
        type: 'drill',
        title: '根式加減同類項',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildRadicalAddLikeTermsSet(5);
        },
      },
      'simplest-radical-form-junior': {
        type: 'drill',
        title: '最簡根式',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildSimplestRadicalSet(5);
        },
      },
      'rationalize-denominator-monomial-junior': {
        type: 'drill',
        title: '單項有理化分母',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildRationalizeMonomialSet(3);
        },
      },
      'rationalize-denominator-binomial-junior': {
        type: 'drill',
        title: '多項有理化分母（平方差）',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildRationalizeBinomialSet(3);
        },
      },
      'abs-four-terms-calc-drill': {
        type: 'drill',
        title: '四數含絕對值計算',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildAbsFourTermsSet(10);
        },
      },
      'abs-count-basic-drill': {
        type: 'drill',
        title: '絕對值個數問題',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildAbsCountBasicSet(10);
        },
      },
      'abs-count-two-sided-drill': {
        type: 'drill',
        title: '絕對值個數問題二邊範圍',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildAbsCountTwoSidedSet(10);
        },
      },
      'abs-count-reverse-drill': {
        type: 'drill',
        title: '絕對值個數問題反向',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildAbsCountReverseSet(10);
        },
      },
      'abs-equation-leading-one-drill': {
        type: 'drill',
        title: '絕對值方程式（最高次係數=1）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildAbsEquationLeadingOneSet(5);
        },
      },
      'abs-equation-leading-not-one-drill': {
        type: 'drill',
        title: '絕對值方程式（最高次係數≠1）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildAbsEquationLeadingNotOneSet(5);
        },
      },
      'nonnegative-sum-zero-drill': {
        type: 'drill',
        title: '非負整數和=0',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildNonnegativeSumZeroSet(5);
        },
      },
      'nonnegative-sum-fixed-one-drill': {
        type: 'drill',
        title: '非負整數和固定討論',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildNonnegativeSumFixedOneSet(5);
        },
      },
      'nonnegative-sum-fixed-multix-drill': {
        type: 'drill',
        title: '非負整數解和固定討論多組解（只求x）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildNonnegativeSumFixedMultiXSet(5);
        },
      },
      'abs-both-sides-advanced-drill': {
        type: 'drill',
        title: '進階補充：兩邊都有絕對值',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildAbsoluteBothSidesAdvancedSet(5);
        },
      },
      'abs-two-group-calc-drill': {
        type: 'drill',
        title: '二組絕對值計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildAbsTwoGroupsSet(5);
        },
      },
      'abs-remove-and-calc-drill': {
        type: 'drill',
        title: '去絕對值計算',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildAbsRemoveAndCalcSet(3);
        },
      },
      'linear-remove-parentheses-drill': {
        type: 'drill',
        title: '去括號（一元一次）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildLinearRemoveParenthesesSet(5);
        },
      },
      'linear-multiply-parentheses-drill': {
        type: 'drill',
        title: '有乘法的去括號（一元一次）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildLinearMultiplyParenthesesSet(5);
        },
      },
      'linear-fraction-parentheses-drill': {
        type: 'drill',
        title: '有分數的去括號（一元一次）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildLinearFractionParenthesesSet(5);
        },
      },
      'linear-word-expression-drill': {
        type: 'drill',
        title: '綜合列式文字題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildLinearWordExpressionSet(5);
        },
      },
      'linear-substitution-value-drill': {
        type: 'drill',
        title: '綜合代入求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildLinearSubstitutionValueSet(5);
        },
      },
      'linear-move-terms-solve-drill': {
        type: 'drill',
        title: '移項求解',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildLinearMoveTermsSolveSet(5);
        },
      },
      'linear-expand-move-solve-drill': {
        type: 'drill',
        title: '展開移項求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildLinearExpandMoveSolveSet(5);
        },
      },
      'linear-cross-expand-move-solve-drill': {
        type: 'drill',
        title: '交叉相乘後展開移項求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildLinearCrossMultiplySolveSet(5);
        },
      },
      'linear-lcm-multiply-move-solve-drill': {
        type: 'drill',
        title: '同乘公倍數後整理移項求解',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildLinearLcmMultiplySolveSet(5);
        },
      },
      'linear-same-solution-drill': {
        type: 'drill',
        title: '解相同題型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildLinearSameSolutionSet(5);
        },
      },
      'j1-3-3-purchase-discount-application-drill': {
        type: 'drill',
        title: '錢數買賣與折扣問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildPurchaseDiscountApplicationSet(5);
        },
      },
      'j1-3-3-allocation-application-drill': {
        type: 'drill',
        title: '分配問題（剩餘與不足）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildAllocationApplicationSet(5);
        },
      },
      'j1-3-3-age-application-drill': {
        type: 'drill',
        title: '年齡推算問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildAgeApplicationSet(5);
        },
      },
      'j1-3-3-speed-application-drill': {
        type: 'drill',
        title: '行程與速率問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildSpeedApplicationSet(5);
        },
      },
      'j1-3-3-heads-coins-application-drill': {
        type: 'drill',
        title: '雞兔同籠與硬幣問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildHeadsCoinsApplicationSet(5);
        },
      },
      'j1-3-3-work-rate-application-drill': {
        type: 'drill',
        title: '工程與工作效率問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ133WorkRateSet(5);
        },
      },
      'j1-3-3-fraction-remainder-application-drill': {
        type: 'drill',
        title: '剩餘量的分率問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ133FractionRemainderSet(5);
        },
      },
      'j1-3-3-score-penalty-application-drill': {
        type: 'drill',
        title: '得分倒扣問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ133ScorePenaltySet(5);
        },
      },
      'j1-3-3-mixture-application-drill': {
        type: 'drill',
        title: '濃度與混合問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ133MixtureSet(5);
        },
      },
      'j1-3-3-tiered-fee-application-drill': {
        type: 'drill',
        title: '基本費與超額計費問題',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ133TieredFeeSet(5);
        },
      },
      'j1-3-3-clock-angle-application-drill': {
        type: 'drill',
        title: '時鐘與角度問題',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ133ClockAngleSet(5);
        },
      },
      'j2-1-1-context-to-equation-drill': {
        type: 'drill',
        title: '文字敘述轉換為代數式',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2ContextEquationSet(5);
        },
      },
      'j2-1-1-expression-classify-drill': {
        type: 'drill',
        title: '二元一次式與方程式判別',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2ClassifySet(5);
        },
      },
      'j2-1-1-evaluate-expression-drill': {
        type: 'drill',
        title: '求二元一次式的值',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2EvaluateExpressionSet(5);
        },
      },
      'j2-1-1-expression-simplify-drill': {
        type: 'drill',
        title: '二元一次式的化簡（合併同類項）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2ExpressionSimplifySet(5);
        },
      },
      'j2-1-1-distribute-expand-drill': {
        type: 'drill',
        title: '去括號與分配律運算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2DistributeExpandSet(5);
        },
      },
      'j2-1-1-fraction-simplify-drill': {
        type: 'drill',
        title: '分數形式的化簡（通分）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ2FractionSimplifySet(5);
        },
      },
      'j2-1-1-ordered-pair-check-drill': {
        type: 'drill',
        title: '數對代入與成立判斷',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2OrderedPairCheckSet(5);
        },
      },
      'j2-1-1-parameter-substitution-drill': {
        type: 'drill',
        title: '參數題代入求係數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ2ParameterSubstitutionSet(5);
        },
      },
      'j2-1-1-equivalent-transform-drill': {
        type: 'drill',
        title: '標準型整理（移項）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2EquivalentTransformSet(5);
        },
      },
      'j2-1-1-integer-constraint-drill': {
        type: 'drill',
        title: '列出多組整數解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ2IntegerConstraintSet(5);
        },
      },
      'j2-1-1-solve-for-variable-drill': {
        type: 'drill',
        title: '整理成 x 表示 y、y 表示 x',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ2SolveForVariableSet(5);
        },
      },
      'j2-1-2-substitution-basic-drill': {
        type: 'drill',
        title: '代入消去法的基礎練習',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ212SubstitutionBasicSet(5);
        },
      },
      'j2-1-2-elimination-adjustment-drill': {
        type: 'drill',
        title: '加減消去法的係數調整',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ212EliminationAdjustmentSet(5);
        },
      },
      'j2-1-2-fraction-decimal-drill': {
        type: 'drill',
        title: '分數與小數型的化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ212FractionDecimalSet(5);
        },
      },
      'j2-1-2-solution-type-drill': {
        type: 'drill',
        title: '解的個數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ212SolutionTypeSet(5);
        },
      },
      'j2-1-2-triple-equal-drill': {
        type: 'drill',
        title: '特殊結構運算（A=B=C）',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212TripleEqualSet(5);
        },
      },
      'j2-1-2-symmetric-system-drill': {
        type: 'drill',
        title: '特殊結構運算（係數對稱）',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212SymmetricSet(5);
        },
      },
      'j2-1-2-abs-zero-drill': {
        type: 'drill',
        title: '特殊結構運算（非負性質）',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212AbsZeroSet(5);
        },
      },
      'j2-1-2-known-solution-coeff-drill': {
        type: 'drill',
        title: '已知解反求係數',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212KnownSolutionCoeffSet(5);
        },
      },
      'j2-1-2-error-diagnosis-drill': {
        type: 'drill',
        title: '看錯題目（邏輯排錯）',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212ErrorDiagnosisSet(5);
        },
      },
      'j2-1-2-shared-solution-drill': {
        type: 'drill',
        title: '同解問題（兩組方程組共有解）',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212SharedSolutionSet(5);
        },
      },
      'j2-1-2-third-condition-drill': {
        type: 'drill',
        title: '解滿足第三個條件',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212ThirdConditionSet(5);
        },
      },
      'j2-1-2-special-reverse-drill': {
        type: 'drill',
        title: '特殊解情形的反求',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212SpecialReverseSet(5);
        },
      },
      'j2-1-3-money-ticket-drill': {
        type: 'drill',
        title: '濃度與混合問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ213MoneyTicketSet(5);
        },
      },
      'j2-1-3-heads-coins-score-drill': {
        type: 'drill',
        title: '淨重、毛重與容器問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ213HeadsCoinsScoreSet(5);
        },
      },
      'j2-1-3-digit-placevalue-drill': {
        type: 'drill',
        title: '數字位數與交換問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ213DigitPlaceValueSet(5);
        },
      },
      'j2-1-3-age-chase-drill': {
        type: 'drill',
        title: '測驗得分與勝負判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ213AgeChaseSet(5);
        },
      },
      'j2-1-3-speed-chase-drill': {
        type: 'drill',
        title: '行程速率與追趕問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ213SpeedChaseSet(5);
        },
      },
      'j2-1-3-allocation-work-drill': {
        type: 'drill',
        title: '分配與工程問題',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ213AllocationWorkSet(5);
        },
      },
      'j2-1-3-tiered-fee-drill': {
        type: 'drill',
        title: '基本費與超額計費問題',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ213TieredFeeSet(5);
        },
      },
      'j2-1-3-classical-text-drill': {
        type: 'drill',
        title: '古文應用題',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ213ClassicalTextSet(5);
        },
      },
      'j2-2-1-axis-distance-drill': {
        type: 'drill',
        title: '點的坐標表示法與坐標軸距離',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ221AxisDistanceSet(5);
        },
      },
      'j2-2-1-quadrant-basic-drill': {
        type: 'drill',
        title: '各象限及其性質符號判別',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ221QuadrantBasicSet(5);
        },
      },
      'j2-2-1-translation-basic-drill': {
        type: 'drill',
        title: '坐標平面上的平移移動',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ221TranslationSet(5);
        },
      },
      'j2-2-1-axis-special-drill': {
        type: 'drill',
        title: '坐標軸上的點與特殊位置判定',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ221AxisSpecialSet(5);
        },
      },
      'j2-2-1-midpoint-drill': {
        type: 'drill',
        title: '中點坐標公式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ221MidpointSet(5);
        },
      },
      'j2-2-1-symmetry-drill': {
        type: 'drill',
        title: '坐標平面上的對稱點',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ221SymmetrySet(5);
        },
      },
      'j2-2-1-area-drill': {
        type: 'drill',
        title: '幾何圖形的面積計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ221AreaSet(5);
        },
      },
      'j2-2-1-quadrant-reasoning-drill': {
        type: 'drill',
        title: '含代數參數的象限推理',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ221QuadrantReasoningSet(5);
        },
      },
      'j2-2-1-nonnegative-drill': {
        type: 'drill',
        title: '絕對值與平方的非負性質應用',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ221NonnegativeSet(5);
        },
      },
      'j2-2-2-point-line-relation-drill': {
        type: 'drill',
        title: '含有未知數的點與方程式關係',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ222PointLineRelationSet(5);
        },
      },
      'j2-2-2-intercept-area-drill': {
        type: 'drill',
        title: '利用截距找交點與三角形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ222InterceptAreaSet(5);
        },
      },
      'j2-2-2-quadrant-exclusion-drill': {
        type: 'drill',
        title: '由係數正負判斷不通過之象限',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ222QuadrantExclusionSet(5);
        },
      },
      'j2-2-2-parallel-perpendicular-drill': {
        type: 'drill',
        title: '水平線與鉛垂線的判定與方程',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ222ParallelPerpendicularSet(5);
        },
      },
      'j2-2-2-line-from-points-drill': {
        type: 'drill',
        title: '已知兩點求直線方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ222LineFromPointsSet(5);
        },
      },
      'j2-2-2-only-two-quadrants-drill': {
        type: 'drill',
        title: '進階判斷：只通過兩個象限',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ222TwoQuadrantsSet(5);
        },
      },
      'j2-2-2-point-translation-line-drill': {
        type: 'drill',
        title: '點的平移與直線的變動',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ222TranslationLineSet(5);
        },
      },
      'j2-2-2-two-lines-area-drill': {
        type: 'drill',
        title: '兩直線交點與坐標軸圍成面積',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ222TwoLinesAreaSet(5);
        },
      },
      'j2-3-1-ratio-simplify-drill': {
        type: 'drill',
        title: '比例化簡與比值運算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ231RatioSimplifySet(5);
        },
      },
      'j2-3-1-proportion-solve-drill': {
        type: 'drill',
        title: '比例式求解未知數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ231ProportionSolveSet(5);
        },
      },
      'j2-3-1-relation-transform-drill': {
        type: 'drill',
        title: '關係式與比例式互換',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ231RelationTransformSet(5);
        },
      },
      'j2-3-1-k-method-drill': {
        type: 'drill',
        title: '設比例常數求值',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ231KMethodSet(5);
        },
      },
      'j2-3-1-basic-single-step-drill': {
        type: 'drill',
        title: '基本題型（單層動作）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ231BasicSingleStepSet(5);
        },
      },
      'j2-3-1-regular-two-step-drill': {
        type: 'drill',
        title: '正規題型（二層動作）',
        difficulty: 'medium',
        questionCount: 7,
        generate() {
          return buildJ231RegularTwoStepSet(7);
        },
      },
      'j2-3-1-advanced-three-step-drill': {
        type: 'drill',
        title: '進階題型（三層動作）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ231AdvancedThreeStepSet(5);
        },
      },
      'j2-3-1-concentration-reverse-drill': {
        type: 'drill',
        title: '濃度混合與逆推稀釋題',
        difficulty: 'challenge',
        questionCount: 6,
        generate() {
          return buildJ231ConcentrationReverseSet(6);
        },
      },
      'j2-3-2-basic-direct-inverse-drill': {
        type: 'drill',
        title: '基礎正反比運算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ232BasicDirectInverseSet(5);
        },
      },
      'j2-3-2-linear-combo-proportion-drill': {
        type: 'drill',
        title: '線性組合式比例',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ232LinearComboProportionSet(5);
        },
      },
      'j2-3-2-square-proportion-drill': {
        type: 'drill',
        title: '次方型比例',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ232SquareProportionSet(5);
        },
      },
      'j2-3-2-chained-variation-drill': {
        type: 'drill',
        title: '正反比鏈接',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ232ChainedVariationSet(5);
        },
      },
      'j2-3-2-percent-change-drill': {
        type: 'drill',
        title: '變量百分率異動下的比例計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ232PercentChangeSet(5);
        },
      },
      'j2-3-2-word-judgment-drill': {
        type: 'drill',
        title: '正反比文字判斷',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildJ232WordJudgmentSet(10);
        },
      },
      'j2-4-1-inequality-language-drill': {
        type: 'drill',
        title: '基本判定與直覺題',
        difficulty: 'easy',
        questionCount: 8,
        generate() {
          return buildJ241InequalityLanguageSet(8);
        },
      },
      'j2-4-1-inequality-integer-drill': {
        type: 'drill',
        title: '正規解不等式（整數型）',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ241IntegerSolveSet(6);
        },
      },
      'j2-4-1-inequality-fraction-drill': {
        type: 'drill',
        title: '進階運算題（分數型）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ241FractionSolveSet(5);
        },
      },
      'j2-4-1-inequality-decimal-drill': {
        type: 'drill',
        title: '進階運算題（小數型）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ241DecimalSolveSet(5);
        },
      },
      'j2-4-1-inequality-range-drill': {
        type: 'drill',
        title: '範圍推導',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ241RangeSet(6);
        },
      },
      'j2-4-1-inequality-reverse-coeff-drill': {
        type: 'drill',
        title: '由解逆推原不等式中的未知係數',
        difficulty: 'hard',
        questionCount: 6,
        generate() {
          return buildJ241ReverseCoeffSet(6);
        },
      },
      'j2-4-1-inequality-known-solution-range-drill': {
        type: 'drill',
        title: '已知解反求參數範圍',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ241KnownSolutionParamRangeSet(5);
        },
      },
      'j2-4-1-inequality-same-solution-drill': {
        type: 'drill',
        title: '綜合應用題（兩不等式解相同）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ241SameSolutionSet(5);
        },
      },
      'j2-4-2-basic-word-drill': {
        type: 'drill',
        title: '基本題型（單層動作）',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ242BasicWordSet(6);
        },
      },
      'j2-4-2-regular-word-drill': {
        type: 'drill',
        title: '正規題型（二層動作）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ242RegularWordSet(6);
        },
      },
      'j2-4-2-advanced-word-drill': {
        type: 'drill',
        title: '進階題型（三層動作）',
        difficulty: 'hard',
        questionCount: 7,
        generate() {
          return buildJ242AdvancedWordSet(7);
        },
      },
      'j1-distributive-law-drill': {
        type: 'drill',
        title: '分配律',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ1DistributiveLawSet(5);
        },
      },
      'j1-common-factor-drill': {
        type: 'drill',
        title: '提出公因數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ1CommonFactorSet(5);
        },
      },
      'j1-common-factor-four-terms-drill': {
        type: 'drill',
        title: '4項提出公因數',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildJ1CommonFactorFourTermsSet(3);
        },
      },
      'j1-variable-distributive-nearby-drill': {
        type: 'drill',
        title: '利用未知數的分配律',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ1VariableNearbySet(5);
        },
      },
      'j1-variable-distributive-eval-drill': {
        type: 'drill',
        title: '利用分配律與未知數求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ1VariableDistributiveEvalSet(5);
        },
      },
      'weird-symbol-calc': {
        type: 'drill',
        title: '奇怪的符號計算',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildWeirdSymbolCalcSet(3);
        },
      },
      'weird-symbol-calc-three-layer': {
        type: 'drill',
        title: '奇怪的符號計算三層版',
        difficulty: 'hard',
        questionCount: 3,
        generate() {
          return buildWeirdSymbolCalcThreeLayerSet(3);
        },
      },
      'mod9-remainder-drill': {
        type: 'drill',
        title: '大數除以9餘數',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildModuloRemainderSet(9, 10);
        },
      },
      'mod9-unknown-multiple-drill': {
        type: 'drill',
        title: '反向求一大數除以9整除',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildModuloUnknownMultipleSet(9, 10);
        },
      },
      'mod9-unknown-remainder-drill': {
        type: 'drill',
        title: '反向求一大數除以9餘數',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildModuloUnknownRemainderSet(9, 10);
        },
      },
      'mod11-remainder-drill': {
        type: 'drill',
        title: '大數除以11餘數',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildModuloRemainderSet(11, 10);
        },
      },
      'mod11-unknown-multiple-drill': {
        type: 'drill',
        title: '反向求一大數除以11整除',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildModuloUnknownMultipleSet(11, 10);
        },
      },
      'mod11-unknown-remainder-drill': {
        type: 'drill',
        title: '反向求一大數除以11餘數',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildModuloUnknownRemainderSet(11, 10);
        },
      },
      'j1-2-1-gcd-lcm-calculation-drill': {
        type: 'drill',
        title: '最大公因數與最小公倍數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildGcdLcmCalculationSet(5);
        },
      },
      'j1-2-1-gcd-lcm-product-relation-drill': {
        type: 'drill',
        title: '乘積與公因倍數關係',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildGcdLcmProductRelationSet(5);
        },
      },
      'j1-2-1-remainder-shortage-mixed-drill': {
        type: 'drill',
        title: '餘數與不足問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildRemainderShortageMixedSet(5);
        },
      },
      'j1-2-1-hanxin-advanced-drill': {
        type: 'drill',
        title: '韓信點兵進階',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildHanXinAdvancedSet(5);
        },
      },
      'j1-2-1-prime-factor-notation-drill': {
        type: 'drill',
        title: '標準分解式的寫法',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildPrimeFactorNotationSet(5);
        },
      },
      'j1-2-1-divisor-count-sum-mixed-drill': {
        type: 'drill',
        title: '正因數個數與總和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildDivisorCountSumMixedSet(5);
        },
      },
      'j1-2-1-rectangle-factor-pairs-drill': {
        type: 'drill',
        title: '矩形排列問題',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildRectangleFactorPairsSet(5);
        },
      },
      'j1-2-3-fraction-add-sub-brackets-drill': {
        type: 'drill',
        title: '分數加減混合（去括號）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildFractionAddSubBracketSet(5);
        },
      },
      'j1-2-3-fraction-add-sub-negative-drill': {
        type: 'drill',
        title: '分數加減混合（負號轉換）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildFractionAddSubNegativeSet(5);
        },
      },
      'j1-2-3-fraction-add-sub-absolute-drill': {
        type: 'drill',
        title: '分數加減混合（絕對值對稱）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildFractionAbsoluteSymmetrySet(5);
        },
      },
      'j1-2-3-fraction-mul-div-mixed-drill': {
        type: 'drill',
        title: '分數乘除（帶分數與倒數）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildFractionMulDivMixedSet(5);
        },
      },
      'j1-2-3-fraction-distributive-common-factor-drill': {
        type: 'drill',
        title: '分數乘除（分配律提公因數）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildFractionDistributiveCommonFactorSet(5);
        },
      },
      'j1-2-3-fraction-distributive-regroup-drill': {
        type: 'drill',
        title: '分數乘除（分配律重組）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildFractionDistributiveRegroupSet(5);
        },
      },
      'j1-2-3-telescoping-gap-four-sum-drill': {
        type: 'drill',
        title: '分項對消（間隔四項和）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildTelescopingGapFourSumSet(5);
        },
      },
      'j1-2-3-telescoping-adjacent-sum-drill': {
        type: 'drill',
        title: '分項對消（相鄰連分式和）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildTelescopingAdjacentSumSet(5);
        },
      },
      'j1-2-3-telescoping-product-drill': {
        type: 'drill',
        title: '分項對消（連乘積）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildTelescopingProductSet(5);
        },
      },
      'factor-application-separate-grouping-drill': {
        type: 'drill',
        title: '男女分別分組',
        difficulty: 'easy',
        questionCount: 3,
        generate() {
          return buildSeparateGroupingSet(3);
        },
      },
      'factor-application-mixed-grouping-drill': {
        type: 'drill',
        title: '男女混合分組',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildMixedGroupingSet(3);
        },
      },
      'factor-application-circular-track-drill': {
        type: 'drill',
        title: '環狀跑道同點重合',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildCircularTrackSet(3);
        },
      },
      'factor-road-planting-single-drill': {
        type: 'drill',
        title: '道路種樹（單側）',
        difficulty: 'easy',
        questionCount: 3,
        generate() {
          return buildRoadPlantingSingleSet(3);
        },
      },
      'factor-road-planting-double-drill': {
        type: 'drill',
        title: '道路種樹（兩側）',
        difficulty: 'easy',
        questionCount: 3,
        generate() {
          return buildRoadPlantingDoubleSet(3);
        },
      },
      'factor-road-keep-position-drill': {
        type: 'drill',
        title: '不需移動個數',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildRoadReplantKeepSet(3);
        },
      },
      'factor-rectangle-equal-square-drill': {
        type: 'drill',
        title: '長方形裁成相同正方形',
        difficulty: 'easy',
        questionCount: 3,
        generate() {
          return buildRectangleMaxSquarePiecesSet(3);
        },
      },
      'factor-rectangle-max-square-mixed-drill': {
        type: 'drill',
        title: '長方形裁成數個最大正方形',
        difficulty: 'medium',
        questionCount: 3,
        generate() {
          return buildRectangleMinSquarePiecesSet(3);
        },
      },
    },
    getConfig(id) {
      const topicId = String(id || '').trim();
      const direct = this.configs[topicId] || null;
      const assignmentStore = window.formulaPracticeAssignmentStore || {};
      const assignment = assignmentStore?.byId?.[topicId] || null;
      const practiceLibraryStore = window.practiceLibraryStore || {};
      const practiceRecord = practiceLibraryStore?.byId?.[topicId] || null;

      function buildFixedExampleConfig(source) {
        return {
          type: 'fixed-example',
          title: source.title || '舉例說明',
          prompt: source.prompt || '',
          answer: source.answer || '',
          difficulty: source.difficulty || '',
          questionCount: Number(source.questionCount) || 0,
        };
      }

      function buildGeneratorConfig(base, source) {
        if (!base) return null;
        const merged = {
          ...base,
          type: source.mode || base.type,
          title: source.title || base.title,
          difficulty: source.difficulty || base.difficulty,
          questionCount: Number(source.questionCount) || base.questionCount,
        };
        if (typeof base.generate === 'function') {
          merged.generate = function generateWithAssignmentCount(item) {
            const generated =
              runGenerateWithQuestionCount(base.generate, this.questionCount) ?? base.generate.call(this, item);
            return shuffleGeneratedSet(generated);
          };
        }
        return merged;
      }

      if (assignment && assignment.enabled === false) {
        return null;
      }

      if (assignment) {
        const mode = String(assignment.mode || '').trim() || 'generator';
        if (mode === 'fixed-example') {
          return buildFixedExampleConfig(assignment);
        }

        const practiceKey = String(assignment.practiceKey || '').trim();
        const base = (practiceKey && this.configs[practiceKey]) || direct;
        return buildGeneratorConfig(base, assignment);
      }

      if (practiceRecord && practiceRecord.enabled === false) {
        return null;
      }

      if (practiceRecord) {
        const mode = String(practiceRecord.mode || '').trim() || 'generator';
        if (mode === 'fixed-example') {
          return buildFixedExampleConfig(practiceRecord);
        }

        const generatorKey = String(practiceRecord.generatorKey || practiceRecord.practiceKey || '').trim();
        const base = (generatorKey && this.configs[generatorKey]) || direct;
        return buildGeneratorConfig(base, practiceRecord);
      }

      return buildGeneratorConfig(direct, {});
    },
  };
})();


