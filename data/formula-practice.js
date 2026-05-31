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
        inside /= k * k;
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

  function isPerfectSquare(n) {
    if (n < 0) return false;
    const r = Math.floor(Math.sqrt(n));
    return r * r === n;
  }

  function pickNonSquare(min, max) {
    let v = randInt(min, max);
    while (isPerfectSquare(v)) v = randInt(min, max);
    return v;
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
          inside /= k * k;
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
      'nearest-integer',
      'between-two-integers',
      'integer-part',
      'count-n-in-interval',
      'find-a-from-interval',
      'two-radicals-integer-part',
    ];

    for (let i = 0; i < count; i += 1) {
      const type = templates[i % templates.length];

      if (type === 'nearest-integer') {
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

      if (type === 'between-two-integers') {
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

      if (type === 'integer-part') {
        const { n, value, expr } = buildIntervalTargetExpr(10, 30);
        const useVarStyle = randInt(0, 1) === 1;
        if (useVarStyle) {
          const varName = pickFrom(['a', 'b', 'k']);
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

      if (type === 'count-n-in-interval') {
        const a = randInt(6, 20);
        const b = randInt(a + 2, a + 7);
        const countN = b * b - a * a - 1;
        questions.push(`若 \\(${a}<\\sqrt{n}<${b}\\)，且 \\(n\\) 為正整數，符合條件的 \\(n\\) 有幾個？`);
        answers.push(`\\(${countN}\\)`);
        continue;
      }

      if (type === 'find-a-from-interval') {
        const { n, value, expr } = buildIntervalTargetExpr(7, 28);
        const a = n;
        const useVarStyle = randInt(0, 1) === 1;
        if (useVarStyle) {
          const varName = pickFrom(['a', 'm', 't']);
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

      if (type === 'two-radicals-integer-part') {
        const left = buildIntervalTargetExpr(6, 16);
        const right = buildIntervalTargetExpr(7, 18);
        const leftVar = pickFrom(['a', 'm']);
        const rightVar = leftVar === 'a' ? 'b' : 'n';
        const rootValue = left.n + right.n + 1;
        const question = pickFrom([
          `設 \\(${leftVar}\\) 為 \\(${left.expr}\\) 的整數部分，\\(${rightVar}\\) 為 \\(${right.expr}\\) 的整數部分，求 \\(\\sqrt{${leftVar}+${rightVar}+1}\\)。`,
          `若 \\(${leftVar}=\\lfloor ${left.expr} \\rfloor\\)、\\(${rightVar}=\\lfloor ${right.expr} \\rfloor\\)，求 \\(\\sqrt{${leftVar}+${rightVar}+1}\\)。`,
        ]);
        questions.push(question);
        answers.push(`\\(${formatRadical(rootValue)}\\)`);
        continue;
      }
    }
    return { questions, answers };
  }

  function buildRadicalMulDivSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const a = pickNonSquare(2, 18);
        const b = pickNonSquare(2, 18);
        questions.push(`計算：\\(\\sqrt{${a}}\\cdot\\sqrt{${b}}\\)。`);
        answers.push(`\\(\\sqrt{${a}}\\cdot\\sqrt{${b}}=${formatRadical(a * b)}\\)。`);
      } else {
        let m = pickNonSquare(2, 18);
        let n = pickNonSquare(2, 18);
        while (isPerfectSquare(m * n)) {
          m = pickNonSquare(2, 18);
          n = pickNonSquare(2, 18);
        }
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
      const k = pickNonSquare(2, 20);
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
      const a = pickNonSquare(2, 30);
      questions.push(`有理化分母：\\(\\frac{1}{\\sqrt{${a}}}\\)。`);
      const simp = simplifyRadical(a);
      if (simp.outside === 1) {
        answers.push(`\\(\\frac{1}{\\sqrt{${a}}}=\\frac{\\sqrt{${a}}}{${a}}\\)。`);
      } else {
        // 1/(k√n) = √n/(kn), ensure denominator rationalized and radical simplified.
        const den = simp.outside * simp.inside;
        answers.push(
          `\\(\\frac{1}{\\sqrt{${a}}}=\\frac{1}{${simp.outside}\\sqrt{${simp.inside}}}=\\frac{\\sqrt{${simp.inside}}}{${den}}\\)。`
        );
      }
    }
    return { questions, answers };
  }

  function buildRationalizeBinomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 9);
      let b = pickNonSquare(2, 30);
      while (b === a * a) b = pickNonSquare(2, 30);
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
        questions.push(
          `入學測驗共 ${t.total} 題，答對得 ${t.plus} 分，答錯扣 ${t.minus} 分。${t.name} 全部作答後得 ${score} 分，求他答錯幾題。`
        );
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
      const wording =
        randInt(0, 1) === 0
          ? `兩邊長為 \\(${a}\\)、\\(${b}\\)。若 \\(${b}\\) 是斜邊，求另一邊。`
          : `兩邊長為 \\(${a}\\)、\\(${b}\\)。若 \\(${b}\\) 不是斜邊，求斜邊。`;
      questions.push(wording);
      answers.push(
        randInt(0, 1) === 0 ? `\\(${formatRadical(b * b - a * a)}\\)` : `\\(${formatRadical(a * a + b * b)}\\)`
      );
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
        const x1 = randInt(-8, 8),
          y1 = randInt(-8, 8);
        const x2 = randInt(-8, 8),
          y2 = randInt(-8, 8);
        questions.push(`平面上兩點 \\(A(${x1},${y1}),B(${x2},${y2})\\) 的距離為何？`);
        answers.push(`\\(\\sqrt{(${x1}-${x2})^2+(${y1}-${y2})^2}\\)`);
        continue;
      }
      if (type === 1) {
        const x = randInt(-15, 15),
          y = randInt(-15, 15);
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
        const a = randInt(2, 12),
          b = randInt(2, 12),
          c = randInt(2, 12);
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
      const h = randInt(4, 18),
        c = randInt(6, 20);
      questions.push(`圓柱高為 \\(${h}\\)，底面周長為 \\(${c}\\)。側面展開成長方形後，最短路徑長為何？`);
      answers.push(`\\(\\sqrt{${h * h}+\\left(\\frac{${c}}{2}\\right)^2}\\)`);
    }
    return { questions, answers };
  }

  function buildJ331CommonFactorBasicSet(count) {
    function formatMonomial(coeff, power) {
      if (power === 0) return `${coeff}`;
      if (power === 1) return formatCoeffTerm(coeff, 'x', 1);
      return formatCoeffTerm(coeff, 'x', power);
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
      questions.push(`提取公因式：\\(${termA}${b > 0 ? '+' : ''}${termB}\\)`);
      const innerA = formatMonomial(a, extraPow);
      const innerB = `${b}`;
      const outer = xPow === 1 ? `${common}x` : `${common}x^${xPow}`;
      answers.push(`\\(${termA}${b > 0 ? '+' : ''}${termB}= ${outer}(${innerA}${b > 0 ? '+' : ''}${innerB})\\)`);
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
        const a = randInt(1, 5),
          b = randInt(1, 5),
          c = randInt(1, 5);
        const ax = formatCoeffTerm(a, 'x', 1);
        const bx = formatCoeffTerm(b, 'x', 1);
        const cx = formatCoeffTerm(c, 'x', 1);
        const ay = formatCoeffTerm(a, 'y', 1);
        const by = formatCoeffTerm(b, 'y', 1);
        const cy = formatCoeffTerm(c, 'y', 1);
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
      const ax = formatCoeffTerm(a, 'x', 1);
      const by = formatCoeffTerm(b, 'y', 1);
      if (useVar) {
        const lead = a * a === 1 ? 'x^2' : `${a * a}x^2`;
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
      const sign = randInt(0, 1) === 0 ? '+' : '-';
      const mid = sign === '+' ? 2 * a * b : -2 * a * b;
      const ax = formatCoeffTerm(a, 'x', 1);
      questions.push(`因式分解：\\(${a * a}x^2${mid >= 0 ? '+' : ''}${mid}x+${b * b}\\)`);
      answers.push(`\\(${a * a}x^2${mid >= 0 ? '+' : ''}${mid}x+${b * b}=(${ax}${sign}${b})^2\\)`);
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
      const ax = formatCoeffTerm(a, 'x', 1);
      const by = formatCoeffTerm(b, 'y', 1);
      if (mode === 0) {
        questions.push(`因式分解：\\(${k * a * a}x^2-${k * b * b}y^2\\)`);
        answers.push(`\\(${k * a * a}x^2-${k * b * b}y^2=${k}(${ax}+${by})(${ax}-${by})\\)`);
      } else {
        const mid = -2 * a * b * k;
        questions.push(`因式分解：\\(${k * a * a}x^2${mid >= 0 ? '+' : ''}${mid}x+${k * b * b}\\)`);
        answers.push(`\\(${k * a * a}x^2${mid >= 0 ? '+' : ''}${mid}x+${k * b * b}=${k}(${ax}-${b})^2\\)`);
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
      const c = s1 * p * (s2 * q);
      questions.push(`十字交乘因式分解：\\(x^2${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}\\)`);
      answers.push(
        `\\(x^2${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=(x${s1 > 0 ? '+' : '-'}${p})(x${s2 > 0 ? '+' : '-'}${q})\\)`
      );
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
      const C = s1 * p * (s2 * q);
      questions.push(`十字交乘因式分解：\\(${A}x^2${B >= 0 ? '+' : ''}${B}x${C >= 0 ? '+' : ''}${C}\\)`);
      answers.push(
        `\\(${A}x^2${B >= 0 ? '+' : ''}${B}x${C >= 0 ? '+' : ''}${C}=(${a1}x${s1 > 0 ? '+' : '-'}${p})(${a2}x${s2 > 0 ? '+' : '-'}${q})\\)`
      );
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
      const C0 = s1 * p * (s2 * q);
      const signAll = randInt(0, 1) === 0 ? 1 : -1;
      const A = signAll * g * A0;
      const B = signAll * g * B0;
      const C = signAll * g * C0;
      const outer = signAll * g;
      questions.push(`\\(${A}x^2${B >= 0 ? '+' : ''}${B}x${C >= 0 ? '+' : ''}${C}\\)`);
      answers.push(
        `\\(${A}x^2${B >= 0 ? '+' : ''}${B}x${C >= 0 ? '+' : ''}${C}=${outer}(${a1}x${s1 > 0 ? '+' : '-'}${p})(${a2}x${s2 > 0 ? '+' : '-'}${q})\\)`
      );
    }
    return { questions, answers };
  }

  function buildJ333CrossSubstitutionSet(count) {
    function formatLinearFactor(u, constant) {
      if (constant === 0) return u === 1 ? 'x' : `${u}x`;
      return u === 1 ? `x${constant >= 0 ? '+' : ''}${constant}` : `${u}x${constant >= 0 ? '+' : ''}${constant}`;
    }
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const u = pickNonZero(1, 5);
      const v = pickNonZero(1, 6);
      let p = randInt(2, 8);
      let q = randInt(2, 8);
      let s1 = randInt(0, 1) === 0 ? 1 : -1;
      let s2 = randInt(0, 1) === 0 ? 1 : -1;
      let B = s1 * p + s2 * q;
      let C = s1 * p * (s2 * q);
      while (Math.abs(B) <= 1 || Math.abs(C) <= 1) {
        p = randInt(2, 8);
        q = randInt(2, 8);
        s1 = randInt(0, 1) === 0 ? 1 : -1;
        s2 = randInt(0, 1) === 0 ? 1 : -1;
        B = s1 * p + s2 * q;
        C = s1 * p * (s2 * q);
      }
      const A2 = u * u;
      const A1 = 2 * u * v + B * u;
      const A0 = v * v + B * v + C;
      const baseExpr = formatLinearFactor(u, v);
      questions.push(`分解：\\((${baseExpr})^2${B >= 0 ? '+' : ''}${B}(${baseExpr})${C >= 0 ? '+' : ''}${C}\\)。`);
      const c1 = v + (s1 > 0 ? p : -p);
      const c2 = v + (s2 > 0 ? q : -q);
      const tExpr = u === 1 ? `x+${v}` : `${u}x+${v}`;
      answers.push(
        `令 \\(t=${tExpr}\\)，原式可視為 \\(t^2${B >= 0 ? '+' : ''}${B}t${C >= 0 ? '+' : ''}${C}\\)。` +
          `十字交乘得 \\((t${s1 > 0 ? '+' : '-'}${p})(t${s2 > 0 ? '+' : '-'}${q})\\)，` +
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
      let p = randInt(2, 8);
      let q = randInt(2, 8);
      let s1 = randInt(0, 1) === 0 ? 1 : -1;
      let s2 = randInt(0, 1) === 0 ? 1 : -1;
      let B = s1 * p + s2 * q;
      let C = s1 * p * (s2 * q);
      while (Math.abs(B) <= 1 || Math.abs(C) <= 1) {
        p = randInt(2, 8);
        q = randInt(2, 8);
        s1 = randInt(0, 1) === 0 ? 1 : -1;
        s2 = randInt(0, 1) === 0 ? 1 : -1;
        B = s1 * p + s2 * q;
        C = s1 * p * (s2 * q);
      }
      const A2 = 1;
      const A1 = 2 * m + B;
      const A0 = m * m + B * m + C;
      questions.push(`分解：\\((x+${m})^2${B >= 0 ? '+' : ''}${B}(x+${m})${C >= 0 ? '+' : ''}${C}\\)。`);
      const c1 = m + (s1 > 0 ? p : -p);
      const c2 = m + (s2 > 0 ? q : -q);
      answers.push(
        `令 \\(t=x+${m}\\)，原式可視為 \\(t^2${B >= 0 ? '+' : ''}${B}t${C >= 0 ? '+' : ''}${C}\\)。` +
          `分解為 \\((t${s1 > 0 ? '+' : '-'}${p})(t${s2 > 0 ? '+' : '-'}${q})\\)，` +
          `代回為 \\((x${c1 === 0 ? '' : `${c1 >= 0 ? '+' : ''}${c1}`})(x${c2 === 0 ? '' : `${c2 >= 0 ? '+' : ''}${c2}`})\\)。`
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
        const a = randInt(1, 6),
          b = pickNonZero(-10, 10);
        const lead = a === 1 ? 'x^2' : `${a}x^2`;
        questions.push(`解方程：\\(${lead}${b >= 0 ? '+' : ''}${b}x=0\\)`);
        answers.push(`\\(x=0\\) 或 \\(x=${formatFraction(-b, a)}\\)`);
      } else if (mode === 1) {
        const a = randInt(1, 6),
          b = randInt(1, 9);
        const coeff = a * a;
        const lead = coeff === 1 ? 'x^2' : `${coeff}x^2`;
        questions.push(`解方程：\\(${lead}-${b * b}=0\\)`);
        answers.push(`\\(x=\\pm${formatFraction(b, a)}\\)`);
      } else {
        const a = randInt(1, 5),
          b = randInt(1, 9),
          sign = randInt(0, 1) === 0 ? '+' : '-';
        const mid = sign === '+' ? 2 * a * b : -2 * a * b;
        const coeff = a * a;
        const lead = coeff === 1 ? 'x^2' : `${coeff}x^2`;
        questions.push(`解方程：\\(${lead}${mid >= 0 ? '+' : ''}${mid}x+${b * b}=0\\)`);
        answers.push(`\\(x=${sign === '+' ? `-\\frac{${b}}{${a}}` : `\\frac{${b}}{${a}}`}\\)（重根）`);
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
      const lead = a === 1 ? 'x^2' : `${a}x^2`;
      questions.push(`解方程：\\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\)`);
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
            `所以 \\(x-${p}=0\\) 或 \\(${r - 1}x${q - t >= 0 ? '+' : ''}${q - t}=0\\)。` +
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
        const lead = stdA === 1 ? 'x^2' : `${stdA}x^2`;
        const root1 = formatFraction(u, 1);
        const root2 = formatFraction(v, 1);
        const moveText = formatSubtraction(`(x-${p})(${factorText})`, k);
        questions.push(`解方程：\\((x-${p})(${factorText})=${k}\\)`);
        answers.push(
          `先移項：\\(${moveText}=0\\)。` +
            `展開得 \\(${lead}${stdB >= 0 ? '+' : ''}${stdB}x${stdC >= 0 ? '+' : ''}${stdC}=0\\)。` +
            `因式分解可寫成 \\((x-${u})(x${v >= 0 ? '-' : '+'}${Math.abs(v)})=0\\)，` +
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
        const r1 = pickNonZero(-8, 8),
          r2 = pickNonZero(-8, 8);
        const sum = r1 + r2,
          prod = r1 * r2;
        questions.push(`已知二次方程兩根為 \\(${r1},${r2}\\)，還原其方程。`);
        answers.push(`\\(x^2${sum >= 0 ? '-' : '+'}${Math.abs(sum)}x${prod >= 0 ? '+' : ''}${prod}=0\\)`);
      } else if (mode === 1) {
        const m = pickNonZero(-8, 8),
          n = pickNonZero(-12, 12),
          r1 = pickNonZero(-8, 8);
        const r2 = n / r1;
        questions.push(
          `若 \\(x^2${m >= 0 ? '+' : ''}${m}x${n >= 0 ? '+' : ''}${n}=0\\) 的一根為 \\(${r1}\\)，求另一根。`
        );
        answers.push(`\\(x=${formatFraction(n, r1)}\\)`);
      } else {
        const r1 = pickNonZero(-6, 6),
          r2 = pickNonZero(-6, 6);
        questions.push(`已知兩根和為 \\(${r1 + r2}\\)、兩根積為 \\(${r1 * r2}\\)，寫出二次方程。`);
        answers.push(`\\(x^2${r1 + r2 >= 0 ? '-' : '+'}${Math.abs(r1 + r2)}x${r1 * r2 >= 0 ? '+' : ''}${r1 * r2}=0\\)`);
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
        const h = pickNonZero(-8, 8),
          k = randInt(2, 12);
        questions.push(`解方程：\\((x${h >= 0 ? '+' : ''}${h})^2=${k * k}\\)`);
        answers.push(`\\(x=${-h + k}\\) 或 \\(x=${-h - k}\\)`);
      } else {
        const a = randInt(1, 5),
          h = pickNonZero(-6, 6),
          m = randInt(2, 15),
          b = randInt(-10, 10);
        const lead = a === 1 ? '' : `${a}`;
        questions.push(`解方程：\\(${lead}(x${h >= 0 ? '+' : ''}${h})^2${b >= 0 ? '+' : ''}${b}=${m * m}\\)`);
        const numerator = m * m - b;
        if (numerator > 0 && numerator % a === 0) {
          const rootText = formatRadical(numerator / a);
          answers.push(`\\(x=${-h}+${rootText}\\) 或 \\(x=${-h}-${rootText}\\)`);
        } else {
          answers.push(
            `\\(x=${-h}+\\sqrt{\\frac{${numerator}}{${a}}}\\) 或 \\(x=${-h}-\\sqrt{\\frac{${numerator}}{${a}}}\\)`
          );
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
      const lead = a === 1 ? 'x^2' : `${a}x^2`;
      const rhsLead = a === 1 ? '' : `${a}`;
      questions.push(
        `填空使其成完全平方：\\(${lead}${b >= 0 ? '+' : ''}${b}x+\\square=${rhsLead}\\left(x+\\Delta\\right)^2\\)`
      );
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
      const c = mode === 0 ? p * p - q : p * p + q;
      const rhs = p * p - c; // = q or -q
      questions.push(`用配方法解：\\(x^2${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\)`);
      if (rhs > 0) {
        const root = formatRadical(rhs);
        answers.push(
          `先配方：\\((x${p >= 0 ? '-' : '+'}${Math.abs(p)})^2=${rhs}\\)。再開根號：\\(x=${p}\\pm${root}\\)。`
        );
      } else if (rhs === 0) {
        answers.push(`先配方：\\((x${p >= 0 ? '-' : '+'}${Math.abs(p)})^2=0\\)。所以 \\(x=${p}\\)（重根）。`);
      } else {
        answers.push(`先配方：\\((x${p >= 0 ? '-' : '+'}${Math.abs(p)})^2=${rhs}\\)。右邊為負，無實數解。`);
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
        const a = pickNonZero(1, 5),
          b = pickNonZero(-12, 12),
          c = pickNonZero(-12, 12);
        const D = b * b - 4 * a * c;
        const lead = a === 1 ? 'x^2' : `${a}x^2`;
        questions.push(`判別 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\) 的根性質。`);
        answers.push(
          D > 0 ? `兩相異實根（\\(D=${D}>0\\)）` : D === 0 ? `重根（\\(D=0\\)）` : `無實根（\\(D=${D}<0\\)）`
        );
      } else {
        const a = randInt(1, 5),
          c = randInt(1, 20),
          k = randInt(1, 9);
        const lead = a === 1 ? 'x^2' : `${a}x^2`;
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
      const a = pickNonZero(1, 6),
        b = pickNonZero(-12, 12),
        c = pickNonZero(-12, 12);
      const D = b * b - 4 * a * c;
      const lead = a === 1 ? 'x^2' : `${a}x^2`;
      questions.push(`用公式解：\\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\)`);
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
        const p = pickNonZero(-8, 8),
          q = randInt(1, 20);
        questions.push(
          `若 \\(x^2${2 * p >= 0 ? '+' : ''}${2 * p}x+a=0\\) 可配方成 \\((x${p >= 0 ? '+' : ''}${p})^2=${q}\\)，求 \\(a\\)。`
        );
        answers.push(`\\(a=${p * p - q}\\)`);
      } else if (mode === 1) {
        const r1 = pickNonZero(-8, 8),
          r2 = pickNonZero(-8, 8);
        questions.push(`已知一元二次方程兩根為 \\(${r1},${r2}\\)，求原方程。`);
        answers.push(`\\(x^2${-(r1 + r2) >= 0 ? '+' : ''}${-(r1 + r2)}x${r1 * r2 >= 0 ? '+' : ''}${r1 * r2}=0\\)`);
      } else {
        const a = pickNonZero(1, 5),
          b = pickNonZero(-12, 12),
          c = pickNonZero(-12, 12);
        const lead = a === 1 ? 'x^2' : `${a}x^2`;
        questions.push(
          `將 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}\\) 寫成 \\(A(x-h)^2+k\\) 形式，求 \\(A+h+k\\)。`
        );
        answers.push(`先提出 \\(A=${a}\\) 再配方。`);
      }
    }
    return { questions, answers };
  }

  function buildJ342RootsSumProductDirectSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 6),
        b = pickNonZero(-12, 12),
        c = pickNonZero(-12, 12);
      const sumText = formatFraction(-b, a);
      const prodText = formatFraction(c, a);
      const lead = a === 1 ? 'x^2' : `${a}x^2`;
      questions.push(
        `已知 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\)，求兩根和 \\(\\alpha+\\beta\\) 與兩根積 \\(\\alpha\\beta\\)。`
      );
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
        const s = pickNonZero(-10, 10),
          p = pickNonZero(-20, 20);
        questions.push(`若兩根和為 \\(${s}\\)、兩根積為 \\(${p}\\)，求二次方程。`);
        answers.push(`\\(x^2${-s >= 0 ? '+' : ''}${-s}x${p >= 0 ? '+' : ''}${p}=0\\)。`);
      } else {
        const r1 = pickNonZero(-8, 8),
          r2 = pickNonZero(-8, 8);
        questions.push(`若兩根分別為 \\(${r1}\\)、\\(${r2}\\)，還原其二次方程。`);
        const s = r1 + r2;
        const p = r1 * r2;
        answers.push(`\\(x^2${-s >= 0 ? '+' : ''}${-s}x${p >= 0 ? '+' : ''}${p}=0\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildJ342ExpressionBySumProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 5),
        b = pickNonZero(-10, 10),
        c = pickNonZero(-10, 10);
      const lead = a === 1 ? 'x^2' : `${a}x^2`;
      const S = formatFraction(-b, a);
      const P = formatFraction(c, a);
      const mode = i % 3;
      if (mode === 0) {
        questions.push(
          `若 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\(\\alpha^2+\\beta^2\\)。`
        );
        answers.push(`\\((\\alpha+\\beta)^2-2\\alpha\\beta=${S}^2-2\\cdot${P}\\)。`);
      } else if (mode === 1) {
        questions.push(
          `若 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\((\\alpha-1)(\\beta-1)\\)。`
        );
        answers.push(`\\(\\alpha\\beta-(\\alpha+\\beta)+1=${P}-(${S})+1\\)。`);
      } else {
        questions.push(
          `若 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\((\\alpha-\\beta)^2\\)。`
        );
        answers.push(`\\((\\alpha+\\beta)^2-4\\alpha\\beta=${S}^2-4\\cdot${P}\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildJ342CoefficientMistakeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const r1 = pickNonZero(-8, 8),
        r2 = pickNonZero(-8, 8);
      const sum = r1 + r2;
      const prod = r1 * r2;
      const wrongSum = -sum;
      const wrongProd = -prod;
      const mode = i % 2;
      if (mode === 0) {
        questions.push(`某生把一次項符號看錯，誤得兩根為 \\(${r1},${r2}\\)。求正確方程。`);
        answers.push(
          `錯一次項只會改變「根和」符號，故正確根和為 \\(${wrongSum}\\)、根積不變為 \\(${prod}\\)，方程為 \\(x^2${-wrongSum >= 0 ? '+' : ''}${-wrongSum}x${prod >= 0 ? '+' : ''}${prod}=0\\)。`
        );
      } else {
        questions.push(`某生把常數項符號看錯，誤得兩根為 \\(${r1},${r2}\\)。求正確方程。`);
        answers.push(
          `錯常數項只會改變「根積」符號，故正確根和為 \\(${sum}\\)、根積為 \\(${wrongProd}\\)，方程為 \\(x^2${-sum >= 0 ? '+' : ''}${-sum}x${wrongProd >= 0 ? '+' : ''}${wrongProd}=0\\)。`
        );
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
    const banks = [
      buildJ342RootsSumProductDirectSet,
      buildJ342ReverseEquationFromRootsSet,
      buildJ342ExpressionBySumProductSet,
    ];
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

  function buildJ343NumberPropertyWordSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const x = randInt(4, 12);
        const y = randInt(3, 10);
        const sum = x + y;
        const prod = x * y;
        questions.push(`已知兩數的和為 ${sum}，積為 ${prod}，求這兩數。`);
        answers.push(`簡答：${x} 與 ${y}。`);
        continue;
      }
      if (mode === 1) {
        const n = randInt(6, 20);
        const a = 2 * n - 1;
        const b = 2 * n + 1;
        questions.push(`已知兩個連續奇數的乘積為 ${a * b}，求這兩數。`);
        answers.push(`簡答：${a} 與 ${b}。`);
        continue;
      }
      if (mode === 2) {
        const n = randInt(4, 10);
        const a = 2 * n - 2;
        const b = 2 * n;
        const c = 2 * n + 2;
        questions.push(`三個連續偶數的平方和為 ${a * a + b * b + c * c}，求此三數。`);
        answers.push(`簡答：${a}、${b}、${c}。`);
        continue;
      }
      if (mode === 3) {
        const x = pickNonZero(-6, 8);
        const rhs = x * x - 3 * x;
        questions.push(`某數的平方減去該數的 3 倍，結果為 ${rhs}，求此數。`);
        answers.push(`簡答：${x}。`);
        continue;
      }
      const x = randInt(2, 6);
      const s = addFraction(makeFraction(x, 1), makeFraction(1, x));
      questions.push(`已知一正數與其倒數的和為 ${fractionToLatex(s)}，求此數。`);
      answers.push(`簡答：${x} 或 ${formatFraction(1, x)}。`);
    }
    return { questions, answers };
  }

  function buildJ343GeometryAreaWordSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const w = randInt(2, 10);
        const d = randInt(2, 6);
        const l = w + d;
        questions.push(`有一長方形，長比寬多 ${d} 公分，面積為 ${l * w} 平方公分，求長與寬。`);
        answers.push(`簡答：長 ${l} 公分，寬 ${w} 公分。`);
        continue;
      }
      if (mode === 1) {
        const s = randInt(2, 8);
        const d = randInt(2, 5);
        const big = s + d;
        questions.push(`大小兩個正方形邊長相差 ${d} 公分，面積和為 ${big * big + s * s} 平方公分，求兩邊長。`);
        answers.push(`簡答：${big} 公分與 ${s} 公分。`);
        continue;
      }
      if (mode === 2) {
        const k = randInt(2, 5);
        const a = 3 * k,
          b = 4 * k,
          c = 5 * k;
        questions.push(`一直角三角形三邊長比為 3:4:5，且周長為 ${a + b + c}，求三邊長。`);
        answers.push(`簡答：${a}、${b}、${c}。`);
        continue;
      }
      if (mode === 3) {
        const x = randInt(7, 20);
        const remain = x * x - 12;
        questions.push(
          `從邊長為 x 的正方形紙片中剪去一個長 4、寬 3 的小長方形後，剩餘面積為 ${remain} 平方公分，求 x。`
        );
        answers.push(`簡答：x=${x}。`);
        continue;
      }
      const h = randInt(4, 12);
      const d = randInt(2, 6);
      const b = h - d;
      const area = (b * h) / 2;
      questions.push(`某三角形底邊比高短 ${d} 公分，面積為 ${area} 平方公分，求底與高。`);
      answers.push(`簡答：底 ${b} 公分，高 ${h} 公分。`);
    }
    return { questions, answers };
  }

  function buildJ343BusinessWordSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const baseN = 30,
          baseP = 5000,
          dec = 100;
        const t = randInt(8, 20);
        const n = baseN + t;
        const rev = n * (baseP - dec * t);
        questions.push(
          `預定人數 ${baseN} 人、每人收費 ${baseP} 元；每增加 1 人，每人可減收 ${dec} 元。若總收入為 ${rev} 元，求參加人數。`
        );
        answers.push(`簡答：${n} 人。`);
        continue;
      }
      if (mode === 1) {
        const cost = 800;
        const spoil = randInt(3, 6);
        const x = randInt(28, 60);
        const sellable = x - spoil;
        const profitPerKg = [4, 5, 8, 10][randInt(0, 3)];
        const totalProfit = sellable * profitPerKg - cost;
        questions.push(
          `以 ${cost} 元買進一批水果，其中 ${spoil} 公斤損壞，剩下每公斤比成本多賣 ${profitPerKg} 元，最後賺 ${totalProfit} 元，求買進多少公斤。`
        );
        answers.push(`簡答：${x} 公斤。`);
        continue;
      }
      if (mode === 2) {
        const unit = 280,
          gate = 15,
          dec = 5;
        const q = randInt(18, 40);
        const total = q * (unit - (q - gate) * dec);
        questions.push(
          `班服每件 ${unit} 元；若超過 ${gate} 件，超過的每多 1 件每件再便宜 ${dec} 元。總金額為 ${total} 元，求購買數量。`
        );
        answers.push(`簡答：${q} 件。`);
        continue;
      }
      if (mode === 3) {
        const p0 = 220,
          n0 = 1800,
          up = 10;
        const t = randInt(20, 50);
        const price = p0 - t;
        const qty = n0 + up * t;
        const revenue = price * qty;
        questions.push(`票價 ${p0} 元可賣 ${n0} 張；每降價 1 元可多賣 ${up} 張。若收入為 ${revenue} 元，求票價。`);
        answers.push(`簡答：${price} 元。`);
        continue;
      }
      const p0 = 80,
        n0 = 100,
        addBuy = 25;
      const t = randInt(1, 4);
      const price = p0 - 10 * t;
      const qty = n0 + addBuy * t;
      const rev = price * qty;
      questions.push(
        `原本每件 ${p0} 元時有 ${n0} 人購買；若每降價 10 元，購買者增加 ${addBuy} 人。若收入要達 ${rev} 元，應訂價多少？`
      );
      answers.push(`簡答：${price} 元。`);
    }
    return { questions, answers };
  }

  function buildJ411FindAnFromA1DNSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-30, 30);
      const d = pickNonZero(-9, 9);
      const n = randInt(6, 25);
      const an = a1 + (n - 1) * d;
      questions.push(`已知等差數列首項 \\(a_1=${a1}\\)、公差 \\(d=${d}\\)，求第 ${n} 項 \\(a_${n}\\)。`);
      answers.push(`簡答：\\(a_${n}=${an}\\)。`);
    }
    return { questions, answers };
  }

  function buildJ411TwoTermsFindA1DSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const m = randInt(2, 8);
      const n = randInt(m + 2, m + 10);
      const d = pickNonZero(-8, 8);
      const a1 = pickNonZero(-25, 25);
      const am = a1 + (m - 1) * d;
      const an = a1 + (n - 1) * d;
      const askMode = i % 2;
      if (askMode === 0) {
        questions.push(`已知等差數列 \\(a_${m}=${am},\\ a_${n}=${an}\\)，求公差 \\(d\\) 與首項 \\(a_1\\)。`);
        answers.push(`簡答：\\(d=${d},\\ a_1=${a1}\\)。`);
      } else {
        const k = randInt(n + 1, n + 10);
        const ak = a1 + (k - 1) * d;
        questions.push(`已知等差數列 \\(a_${m}=${am},\\ a_${n}=${an}\\)，求第 ${k} 項 \\(a_${k}\\)。`);
        answers.push(`簡答：\\(a_${k}=${ak}\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildJ411FindNSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-20, 20);
      const d = pickNonZero(-8, 8);
      const n = randInt(8, 30);
      const an = a1 + (n - 1) * d;
      questions.push(`等差數列 \\(${a1},\\ ${a1 + d},\\ ${a1 + 2 * d},\\ldots,\\ ${an}\\)，共有幾項？`);
      answers.push(`簡答：${n} 項。`);
    }
    return { questions, answers };
  }

  function buildJ411CoreMixedSet(count) {
    const banks = [buildJ411FindAnFromA1DNSet, buildJ411TwoTermsFindA1DSet, buildJ411FindNSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ411MiddleTermApplySet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const x = randInt(3, 12);
        const b = randInt(4, 16);
        const c = 2 * b - x;
        questions.push(`已知 \\(${x},\\ b,\\ ${c}\\) 三數成等差數列，求 \\(b\\)。`);
        answers.push(`簡答：\\(b=${b}\\)。`);
      } else if (mode === 1) {
        const a = randInt(2, 12);
        const b = randInt(3, 12);
        const x = 2 * b - a;
        questions.push(`若 \\(${a},\\ x,\\ ${b}\\) 三數成等差數列，求 \\(x\\)。`);
        answers.push(`簡答：\\(x=${x}\\)。`);
      } else if (mode === 2) {
        const p = randInt(2, 8);
        const x = randInt(2, 10);
        const y = randInt(2, 10);
        // 2(px+1)=(px+y)+(px-y+2) always true by design; ask x-like linear solve
        const left = 2 * (p * x + 1);
        const rightC = (p + 1) * x - 5;
        questions.push(`設 \\(${p}x+1,\\ ${p}x+${y},\\ ${p}x-${y + 2}\\) 成等差數列，求 \\(x\\)。`);
        answers.push(`簡答：\\(x=${x}\\)。`);
      } else {
        const s = randInt(5, 20);
        const p = randInt(2, 12);
        const q = randInt(2, 12);
        questions.push(`設兩數的等差中項為 ${s}，且兩數之積為 ${p * q}，求這兩數。`);
        answers.push(`簡答：${p} 與 ${q}。`);
      }
    }
    return { questions, answers };
  }

  function buildJ411InsertNumbersSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const a = pickNonZero(-30, 30);
        const d = pickNonZero(-8, 8);
        const m = randInt(2, 10);
        const b = a + (m + 1) * d;
        questions.push(`在 ${a} 與 ${b} 之間插入 ${m} 個數使其成等差數列，求新公差 \\(d\\)。`);
        answers.push(`簡答：\\(d=${d}\\)。`);
      } else if (mode === 1) {
        const a = pickNonZero(-30, 30);
        const d = pickNonZero(-6, 6);
        const m = randInt(3, 12);
        const b = a + (m + 1) * d;
        const k = randInt(2, m);
        const target = a + k * d;
        questions.push(`在 ${a} 與 ${b} 之間插入 ${m} 個數成等差數列，求插入的第 ${k} 個數。`);
        answers.push(`簡答：${target}。`);
      } else if (mode === 2) {
        const a = pickNonZero(-20, 20);
        const d = pickNonZero(-5, 5);
        const m = randInt(4, 15);
        const b = a + (m + 1) * d;
        questions.push(`在 ${a} 與 ${b} 之間插入 \\(n\\) 個數使其成等差數列，若公差為 ${d}，求 \\(n\\)。`);
        answers.push(`簡答：\\(n=${m}\\)。`);
      } else {
        const a = pickNonZero(-20, 20);
        const d = pickNonZero(-7, 7);
        const m = randInt(5, 20);
        const b = a + (m + 1) * d;
        const idx = randInt(1, m);
        const x = a + idx * d;
        questions.push(`在 ${a} 與 ${b} 間插入 ${m} 個數成等差數列，求插入後第 ${idx} 個數。`);
        answers.push(`簡答：${x}。`);
      }
    }
    return { questions, answers };
  }

  function buildJ411RangeMultipleCountSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const k = [3, 4, 5, 6, 7, 8][randInt(0, 5)];
        const L = randInt(1, 120);
        const R = L + randInt(80, 260);
        const cnt = Math.floor(R / k) - Math.floor((L - 1) / k);
        questions.push(`在 ${L} 到 ${R} 的整數中，${k} 的倍數有多少個？`);
        answers.push(`簡答：${cnt} 個。`);
      } else if (mode === 1) {
        const d = [2, 3, 4, 5, 6, 7][randInt(0, 5)];
        const r = randInt(0, d - 1);
        const L = randInt(1, 120);
        const R = L + randInt(80, 260);
        const cnt = Math.floor((R - r) / d) - Math.floor((L - 1 - r) / d);
        questions.push(`在 ${L} 到 ${R} 的整數中，除以 ${d} 餘 ${r} 的數共有多少個？`);
        answers.push(`簡答：${cnt} 個。`);
      } else if (mode === 2) {
        const k = [4, 6, 8, 9, 10, 12][randInt(0, 5)];
        const L = randInt(1, 150);
        const R = L + randInt(90, 260);
        const cnt = Math.floor(R / k) - Math.floor((L - 1) / k);
        questions.push(`在 ${L} 到 ${R} 的整數中，能被 ${k} 整除的數有多少個？`);
        answers.push(`簡答：${cnt} 個。`);
      } else {
        const k = [5, 7, 9][randInt(0, 2)];
        const L = randInt(1, 100);
        const R = L + randInt(100, 260);
        const cnt = Math.floor(R / k) - Math.floor((L - 1) / k);
        questions.push(`在整數區間 [${L}, ${R}] 中，${k} 的倍數共有多少個？`);
        answers.push(`簡答：${cnt} 個。`);
      }
    }
    return { questions, answers };
  }

  function buildJ411CommonTermTwoAPSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      const d1 = [2, 3, 4, 5, 6][randInt(0, 4)];
      const d2 = [3, 4, 5, 6, 7][randInt(0, 4)];
      const L = (d1 * d2) / gcdInt(d1, d2);
      const t = randInt(2, 8);
      const firstCommon = t * L + randInt(0, 2);
      const a1 = firstCommon - d1 * randInt(1, 3);
      const b1 = firstCommon - d2 * randInt(1, 3);
      const c1 = firstCommon;
      const c2 = firstCommon + L;
      const c3 = firstCommon + 2 * L;
      if (mode === 0) {
        questions.push(
          `數列甲為 ${a1}, ${a1 + d1}, ${a1 + 2 * d1}, ...；數列乙為 ${b1}, ${b1 + d2}, ${b1 + 2 * d2}, ...，求前 3 個共同項。`
        );
        answers.push(`簡答：${c1}、${c2}、${c3}。`);
      } else if (mode === 1) {
        const n = randInt(5, 12);
        const cn = firstCommon + (n - 1) * L;
        questions.push(
          `數列 A：${a1}, ${a1 + d1}, ${a1 + 2 * d1}, ...；數列 B：${b1}, ${b1 + d2}, ${b1 + 2 * d2}, ...，求共同項形成新數列的第 ${n} 項。`
        );
        answers.push(`簡答：${cn}。`);
      } else if (mode === 2) {
        questions.push(
          `已知兩等差數列 ${a1}, ${a1 + d1}, ${a1 + 2 * d1}, ... 與 ${b1}, ${b1 + d2}, ${b1 + 2 * d2}, ...，求最小共同項。`
        );
        answers.push(`簡答：${firstCommon}。`);
      } else {
        questions.push(`若數列甲首項 ${a1} 公差 ${d1}；數列乙首項 ${b1} 公差 ${d2}，求最小共同項。`);
        answers.push(`簡答：${firstCommon}。`);
      }
    }
    return { questions, answers };
  }

  function formatApList(a1, d, visibleCount = 4) {
    return Array.from({ length: visibleCount }, (_, index) => a1 + index * d).join(', ');
  }

  function formatSignedAdd(value) {
    return value >= 0 ? `+${value}` : `${value}`;
  }

  function formatPairSum(a, b) {
    return `${a}${formatSignedAdd(b)}`;
  }

  function formatSnQuadratic(p, q) {
    const quad = p === 1 ? 'n^2' : `${p}n^2`;
    if (q === 0) return quad;
    if (q === 1) return `${quad}+n`;
    if (q === -1) return `${quad}-n`;
    return `${quad}${formatSignedAdd(q)}n`;
  }

  function formatLinearN(coef, constant) {
    const nPart = coef === 1 ? 'n' : coef === -1 ? '-n' : `${coef}n`;
    return `${nPart}${constant === 0 ? '' : formatSignedAdd(constant)}`;
  }

  function formatApNthFormula(a1, d) {
    return `${a1}${d >= 0 ? `+${d}` : d}(n-1)`;
  }

  function latexSub(base, index) {
    return `${base}_{${index}}`;
  }

  function formatApListLatex(a1, d, visibleCount = 4) {
    return `\\(${formatApList(a1, d, visibleCount)}, \\ldots\\)`;
  }

  function powInt(base, exponent) {
    let result = 1;
    for (let i = 0; i < exponent; i += 1) result *= base;
    return result;
  }

  function powFraction(frac, exponent) {
    let result = makeFraction(1, 1);
    for (let i = 0; i < exponent; i += 1) result = mulFraction(result, frac);
    return result;
  }

  function isFractionOne(frac) {
    const value = makeFraction(frac.num, frac.den);
    return value.num === value.den;
  }

  function isFractionNegativeOne(frac) {
    const value = makeFraction(frac.num, frac.den);
    return value.num === -value.den;
  }

  function formatFractionLatexForFactor(frac) {
    const value = makeFraction(frac.num, frac.den);
    const body = formatRatioLatex(value);
    return value.den === 1 && value.num > 0 ? body : `\\left(${body}\\right)`;
  }

  function formatRatioLatex(frac) {
    const value = makeFraction(frac.num, frac.den);
    return formatFraction(value.num, value.den);
  }

  function formatGeometricTermLatex(value) {
    if (typeof value === 'number') return `${value}`;
    return formatFraction(value.num, value.den);
  }

  function formatGeometricListLatex(a1, ratio, visibleCount = 4) {
    const terms = [];
    let current = makeFraction(a1.num, a1.den);
    for (let i = 0; i < visibleCount; i += 1) {
      terms.push(formatGeometricTermLatex(current));
      current = mulFraction(current, ratio);
    }
    return `\\(${terms.join(', ')}, \\ldots\\)`;
  }

  function geometricTerm(a1, ratio, n) {
    return mulFraction(a1, powFraction(ratio, n - 1));
  }

  function formatGeometricNthFormula(a1, ratio, n) {
    return `${formatGeometricTermLatex(a1)}\\cdot ${formatFractionLatexForFactor(ratio)}^{${n - 1}}`;
  }

  function inlineMath(text) {
    return `\\(${text}\\)`;
  }

  function buildS211SequenceFiveSubtypeMixedSet(count, fixedMode = null) {
    const questions = [];
    const answers = [];
    const aTerm = (index) => latexSub('a', index);
    for (let i = 0; i < count; i += 1) {
      const mode = Number.isInteger(fixedMode) ? fixedMode : i % 5;
      if (mode === 0) {
        const type = randInt(0, 4);
        if (type === 0) {
          const p = pickNonZero(-6, 8);
          const q = pickNonZero(-12, 12);
          const n = randInt(5, 15);
          const value = p * n + q;
          questions.push(`題型一：已知一般項公式。設 \\(a_n=${formatFunctionLinear(p, q, 'n')}\\)，求 \\(${aTerm(n)}\\)。`);
          answers.push(
            `簡答：\\(${aTerm(n)}=${value}\\)。過程：把 \\(n=${n}\\) 代入 \\(a_n=${formatFunctionLinear(p, q, 'n')}\\)，得 \\(${aTerm(n)}=${p}\\cdot${n}${q === 0 ? '' : formatSignedAdd(q)}=${value}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const n = randInt(4, 12);
          const value = makeFraction(n, 2 * n + 1);
          questions.push(`題型一：已知一般項公式。設 \\(a_n=\\frac{n}{2n+1}\\)，求 \\(${aTerm(n)}\\)。`);
          answers.push(
            `簡答：\\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。過程：代入 \\(n=${n}\\)，\\(${aTerm(n)}=\\frac{${n}}{2\\cdot${n}+1}=\\frac{${n}}{${2 * n + 1}}=${formatFraction(value.num, value.den)}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const n = randInt(3, 7);
          const base = [-2, -3][randInt(0, 1)];
          const value = powInt(base, n) * (n + 1);
          questions.push(`題型一：已知一般項公式。設 \\(a_n=(${base})^n(n+1)\\)，求 \\(${aTerm(n)}\\)。`);
          answers.push(
            `簡答：\\(${aTerm(n)}=${value}\\)。過程：代入 \\(n=${n}\\)，\\(${aTerm(n)}=(${base})^{${n}}(${n}+1)=${powInt(base, n)}\\cdot${n + 1}=${value}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const n = randInt(4, 9);
          const value = powInt(2, n - 1) + n * n;
          questions.push(`題型一：已知一般項公式。設 \\(a_n=2^{n-1}+n^2\\)，求 \\(${aTerm(n)}\\)。`);
          answers.push(
            `簡答：\\(${aTerm(n)}=${value}\\)。過程：代入 \\(n=${n}\\)，\\(${aTerm(n)}=2^{${n - 1}}+${n}^2=${powInt(2, n - 1)}+${n * n}=${value}\\)。`
          );
          continue;
        }
        const n = randInt(5, 14);
        const c = pickNonSquare(2 * n + 2, 5 * n + 20);
        const p = Math.max(1, Math.floor((c - 1) / n));
        const inside = p * n + 1;
        if (isPerfectSquare(inside)) {
          i -= 1;
          continue;
        }
        questions.push(`題型一：已知一般項公式。設 \\(a_n=\\sqrt{${p}n+1}\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(
          `簡答：\\(${aTerm(n)}=\\sqrt{${inside}}\\)。過程：代入 \\(n=${n}\\)，\\(${aTerm(n)}=\\sqrt{${p}\\cdot${n}+1}=\\sqrt{${inside}}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const type = randInt(0, 4);
        if (type === 0) {
          const a1 = pickNonZero(-12, 20);
          const d = pickNonZero(-7, 7);
          const n = randInt(12, 30);
          const an = a1 + (n - 1) * d;
          questions.push(`題型二：等差數列基本參數計算。等差數列 \\(${aTerm(1)}=${a1}\\)，公差 \\(d=${d}\\)，求 \\(${aTerm(n)}\\)。`);
          answers.push(`簡答：\\(${aTerm(n)}=${an}\\)。過程：\\(a_n=a_1+(n-1)d\\)，所以 \\(${aTerm(n)}=${a1}+${n - 1}\\cdot(${d})=${an}\\)。`);
          continue;
        }
        if (type === 1) {
          const m = randInt(2, 5);
          const n = m + randInt(3, 8);
          const d = pickNonZero(2, 7);
          const a1 = pickNonZero(-10, 15);
          const am = a1 + (m - 1) * d;
          const an = a1 + (n - 1) * d;
          questions.push(`題型二：等差數列基本參數計算。等差數列第 ${m} 項為 ${am}，第 ${n} 項為 ${an}，求公差 \\(d\\)。`);
          answers.push(`簡答：\\(d=${d}\\)。過程：\\(${aTerm(n)}-${aTerm(m)}=(${n}-${m})d\\)，所以 \\(${an}-(${am})=${n - m}d\\)，得 \\(d=${d}\\)。`);
          continue;
        }
        if (type === 2) {
          const a = randInt(5, 20);
          const d = randInt(2, 6);
          const insert = randInt(5, 30);
          const b = a + (insert + 1) * d;
          questions.push(`題型二：等差數列基本參數計算。在 ${a} 與 ${b} 之間插入 ${insert} 個數使其成等差數列，求此數列的公差。`);
          answers.push(`簡答：\\(d=${d}\\)。過程：插入 ${insert} 個數後，從 ${a} 到 ${b} 共分成 ${insert + 1} 段，所以公差 \\(d=\\frac{${b}-${a}}{${insert + 1}}=${d}\\)。`);
          continue;
        }
        if (type === 3) {
          const a1 = randInt(20, 60);
          const d = -randInt(2, 8);
          const firstNeg = Math.floor(1 - a1 / d) + 1;
          const terms = [a1, a1 + d, a1 + 2 * d, a1 + 3 * d];
          questions.push(`題型二：等差數列基本參數計算。等差數列 \\(${terms.join(', ')},\\ldots\\)，問自第幾項開始變為負數？`);
          answers.push(`簡答：第 ${firstNeg} 項。過程：通項 \\(a_n=${a1}+(n-1)(${d})\\)。要求 \\(a_n<0\\)，解得 \\(n>1-\\frac{${a1}}{${d}}\\)，所以最小整數為 ${firstNeg}。`);
          continue;
        }
        const a1 = pickNonZero(-15, 15);
        const d = pickNonZero(-5, 5);
        const a5 = a1 + 4 * d;
        const a10 = a1 + 9 * d;
        const target = a1 + 13 * d;
        questions.push(`題型二：等差數列基本參數計算。已知等差數列 \\(${aTerm(5)}+${aTerm(10)}=${a5 + a10}\\)，求 \\(${aTerm(1)}+${aTerm(14)}\\)。`);
        answers.push(
          `簡答：\\(${aTerm(1)}+${aTerm(14)}=${a1 + target}\\)。過程：等差數列中，下標和相同的兩項和相等。因為 \\(5+10=1+14=15\\)，所以 \\(${aTerm(1)}+${aTerm(14)}=${aTerm(5)}+${aTerm(10)}=${a5 + a10}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const type = randInt(0, 4);
        if (type === 0) {
          const a1 = [2, 3, 4][randInt(0, 2)];
          const r = [2, 3, -2][randInt(0, 2)];
          const n = randInt(5, 10);
          const an = a1 * powInt(r, n - 1);
          questions.push(`題型三：等比數列基本參數計算。等比數列 \\(${aTerm(1)}=${a1}\\)，公比 \\(r=${r}\\)，求 \\(${aTerm(n)}\\)。`);
          answers.push(`簡答：\\(${aTerm(n)}=${an}\\)。過程：\\(a_n=a_1r^{n-1}\\)，所以 \\(${aTerm(n)}=${a1}\\cdot(${r})^{${n - 1}}=${an}\\)。`);
          continue;
        }
        if (type === 1) {
          const r = [2, 3, -2][randInt(0, 2)];
          const a1 = pickNonZero(1, 5);
          const a2 = a1 * r;
          const a5 = a1 * powInt(r, 4);
          questions.push(`題型三：等比數列基本參數計算。等比數列第 2 項為 ${a2}，第 5 項為 ${a5}，求公比 \\(r\\)。`);
          answers.push(`簡答：\\(r=${r}\\)。過程：\\(\\frac{a_5}{a_2}=r^{5-2}=r^3\\)，所以 \\(r^3=\\frac{${a5}}{${a2}}=${powInt(r, 3)}\\)，得 \\(r=${r}\\)。`);
          continue;
        }
        if (type === 2) {
          const a = randInt(2, 5);
          const r = randInt(2, 4);
          const x = a * r;
          const y = a * r * r;
          const b = a * r * r * r;
          questions.push(`題型三：等比數列基本參數計算。在 ${a} 與 ${b} 之間插入兩個正數 \\(x,y\\)，使其成等比數列，求 \\((x,y)\\)。`);
          answers.push(`簡答：\\((x,y)=(${x},${y})\\)。過程：四項為 \\(${a},x,y,${b}\\)，公比 \\(r\\) 滿足 \\(${a}r^3=${b}\\)，得 \\(r=${r}\\)，所以 \\(x=${a}\\cdot${r}=${x}\\)，\\(y=${a}\\cdot${r}^2=${y}\\)。`);
          continue;
        }
        if (type === 3) {
          const a1 = makeFraction(1, [2, 3, 4][randInt(0, 2)]);
          const r = randInt(2, 4);
          const a4 = mulFraction(a1, makeFraction(powInt(r, 3), 1));
          const a8 = mulFraction(a1, makeFraction(powInt(r, 7), 1));
          questions.push(`題型三：等比數列基本參數計算。等比數列 \\(${aTerm(1)}=${formatFraction(a1.num, a1.den)}\\)，\\(${aTerm(4)}=${formatFraction(a4.num, a4.den)}\\)，求第 8 項。`);
          answers.push(`簡答：\\(${aTerm(8)}=${formatFraction(a8.num, a8.den)}\\)。過程：由 \\(${aTerm(4)}=a_1r^3\\)，得 \\(r=${r}\\)。所以 \\(${aTerm(8)}=a_1r^7=${formatFraction(a1.num, a1.den)}\\cdot${r}^7=${formatFraction(a8.num, a8.den)}\\)。`);
          continue;
        }
        const a1 = randInt(2, 8);
        const r = [2, 3][randInt(0, 1)];
        const a3 = a1 * r * r;
        const a5 = a1 * powInt(r, 4);
        questions.push(`題型三：等比數列基本參數計算。已知等比數列 \\(a_n\\) 每一項均為正數，若 \\(${aTerm(3)}=${a3}\\)、\\(${aTerm(5)}=${a5}\\)，求 \\(${aTerm(1)}\\)。`);
        answers.push(`簡答：\\(${aTerm(1)}=${a1}\\)。過程：\\(\\frac{${aTerm(5)}}{${aTerm(3)}}=r^2=\\frac{${a5}}{${a3}}=${r * r}\\)，且各項為正，所以 \\(r=${r}\\)。再由 \\(${aTerm(3)}=a_1r^2\\)，得 \\(${aTerm(1)}=${a3}\\div${r * r}=${a1}\\)。`);
        continue;
      }

      if (mode === 3) {
        const type = randInt(0, 4);
        if (type === 0) {
          questions.push(`題型四：等差中項與等比中項的應用。若 \\(x-1,\\ 2x+1,\\ 5x-3\\) 三數成等差數列，求 \\(x\\)。`);
          answers.push(`簡答：\\(x=3\\)。過程：三數成等差表示中項兩倍等於兩端和：\\(2(2x+1)=(x-1)+(5x-3)\\)。整理得 \\(4x+2=6x-4\\)，所以 \\(x=3\\)。`);
          continue;
        }
        if (type === 1) {
          const mid = [6, 9, 12][randInt(0, 2)];
          const last = 3 * mid * mid / 9;
          const k = mid - 2;
          questions.push(`題型四：等差中項與等比中項的應用。若 \\(k+2\\) 是 3 與 ${last} 的等比中項，求 \\(k\\) 之值。`);
          answers.push(`簡答：\\(k=${k}\\) 或 \\(k=${-mid - 2}\\)。過程：等比中項平方等於兩端乘積，所以 \\((k+2)^2=3\\cdot${last}=${mid * mid}\\)，得 \\(k+2=\\pm${mid}\\)。`);
          continue;
        }
        if (type === 2) {
          const a = 1;
          const b = 10;
          questions.push(`題型四：等差中項與等比中項的應用。已知 \\(a,2,b\\) 成等比數列，且 \\(a,5,b\\) 成等差數列，求 \\(a^2+b^2\\)。`);
          answers.push(`簡答：92。過程：由等比得 \\(2^2=ab\\)，所以 \\(ab=4\\)。由等差得 \\(a+b=10\\)。因此 \\(a^2+b^2=(a+b)^2-2ab=100-8=92\\)。`);
          continue;
        }
        if (type === 3) {
          const nums = [3, 6, 12];
          questions.push(`題型四：等差中項與等比中項的應用。若三正數成等比數列，其積為 216，其和為 21，求此三數。`);
          answers.push(`簡答：3、6、12。過程：設三數為 \\(\\frac{a}{r},a,ar\\)。其積為 \\(a^3=216\\)，得 \\(a=6\\)。又總和 21，所以 \\(\\frac{6}{r}+6+6r=21\\)，解得 \\(r=2\\) 或 \\(\\frac12\\)，三數為 3、6、12。`);
          continue;
        }
        questions.push(`題型四：等差中項與等比中項的應用。若 \\(x,y\\) 的算術平均數為 10，幾何平均數為 8，求以 \\(x,y\\) 為兩根的一元二次方程式。`);
        answers.push(`簡答：\\(t^2-20t+64=0\\)。過程：算術平均為 10，故 \\(x+y=20\\)；幾何平均為 8，故 \\(xy=64\\)。以 \\(x,y\\) 為根的方程式為 \\(t^2-(x+y)t+xy=0\\)，所以 \\(t^2-20t+64=0\\)。`);
        continue;
      }

      const type = randInt(0, 4);
      if (type === 0) {
        const a1 = randInt(1, 8);
        const c = randInt(2, 6);
        const n = randInt(10, 40);
        const an = a1 + (n - 1) * c;
        questions.push(`題型五：基礎遞迴關係式的項數推導。設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=a_{n-1}+${c}\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${an}\\)。過程：每次增加 ${c}，所以是等差數列，\\(a_n=a_1+(n-1)${c}\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${an}\\)。`);
        continue;
      }
      if (type === 1) {
        const n = randInt(4, 7);
        const a1 = randInt(1, 3);
        let value = a1;
        for (let j = 2; j <= n; j += 1) value = 2 * value + 1;
        questions.push(`題型五：基礎遞迴關係式的項數推導。設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=2a_{n-1}+1\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${value}\\)。過程：逐項推得 \\(${aTerm(2)}=${2 * a1 + 1}\\)，再依同一遞迴式推到第 ${n} 項，可得 \\(${aTerm(n)}=${value}\\)。`);
        continue;
      }
      if (type === 2) {
        const n = randInt(4, 7);
        const a1 = randInt(1, 4);
        let value = a1;
        for (let j = 2; j <= n; j += 1) value *= j;
        questions.push(`題型五：基礎遞迴關係式的項數推導。設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=n\\cdot a_{n-1}\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${value}\\)。過程：\\(a_n=n(n-1)\\cdots2\\cdot a_1\\)，所以 \\(${aTerm(n)}=${n}!\\cdot${a1}=${value}\\)。`);
        continue;
      }
      if (type === 3) {
        const n = [10, 20, 50, 100][randInt(0, 3)];
        questions.push(`題型五：基礎遞迴關係式的項數推導。設 \\(${aTerm(1)}=2\\)，\\(a_n=\\frac{1}{1-a_{n-1}}\\)，求 \\(${aTerm(n)}\\)。`);
        const cycle = [2, -1, makeFraction(1, 2)];
        const value = cycle[(n - 1) % 3];
        const text = typeof value === 'number' ? `${value}` : formatFraction(value.num, value.den);
        answers.push(`簡答：\\(${aTerm(n)}=${text}\\)。過程：依序算得 \\(${aTerm(1)}=2\\)、\\(${aTerm(2)}=-1\\)、\\(${aTerm(3)}=\\frac12\\)、\\(${aTerm(4)}=2\\)，所以週期為 3。因為 ${n} 除以 3 的餘數決定位置，得 \\(${aTerm(n)}=${text}\\)。`);
        continue;
      }
      const n = randInt(8, 15);
      const value = n * n;
      questions.push(`題型五：基礎遞迴關係式的項數推導。設 \\(${aTerm(1)}=1\\)，\\(a_n=a_{n-1}+(2n-1)\\)，求 \\(${aTerm(n)}\\)。`);
      answers.push(`簡答：\\(${aTerm(n)}=${value}\\)。過程：每次增加奇數，\\(a_n=1+3+5+\\cdots+(2n-1)=n^2\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${n}^2=${value}\\)。`);
    }
    return { questions, answers };
  }

  function buildS211NthFormulaValueSet(count) {
    return buildS211SequenceFiveSubtypeMixedSet(count, 0);
  }

  function buildS211ArithmeticBasicParameterSet(count) {
    return buildS211SequenceFiveSubtypeMixedSet(count, 1);
  }

  function buildS211GeometricBasicParameterSet(count) {
    return buildS211SequenceFiveSubtypeMixedSet(count, 2);
  }

  function buildS211MeansApplicationSet(count) {
    return buildS211SequenceFiveSubtypeMixedSet(count, 3);
  }

  function buildS211BasicRecurrenceTermSet(count) {
    return buildS211SequenceFiveSubtypeMixedSet(count, 4);
  }

  function buildS211ArithmeticGeometricMixedParameterSet(count) {
    const questions = [];
    const answers = [];
    const aTerm = (index) => latexSub('a', index);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const first = [2, 3, 5][randInt(0, 2)];
        const r = [2, 3][randInt(0, 1)];
        const last = first * powInt(r, 4);
        questions.push(`等差與等比數列的混合參數：在 ${first} 與 ${last} 之間插入三個實數 \\(x,y,z\\)，使五個數成等比數列，求此數列所有可能的公比。`);
        answers.push(`簡答：\\(r=${r}\\) 或 \\(r=-${r}\\)。過程：五項為 \\(${first},x,y,z,${last}\\)，所以 \\(${first}r^4=${last}\\)，得 \\(r^4=${powInt(r, 4)}\\)。因此實數公比為 \\(\\pm${r}\\)。`);
        continue;
      }

      if (type === 1) {
        const d = 2 * randInt(1, 4);
        const b = (d * d + 2 * d + 2) / 2;
        const a = b - d;
        const c = b + d;
        const sum = a + b + c;
        questions.push(`等差與等比數列的混合參數：已知 \\(a,b,c\\) 成遞增等差數列且和為 ${sum}；若 \\(a-1,b-1,c+1\\) 成等比數列，求 \\((a,b,c)\\)。`);
        answers.push(`簡答：\\((a,b,c)=(${a},${b},${c})\\)。過程：設三數為 \\(b-d,b,b+d\\)，由和為 ${sum} 得 \\(b=${b}\\)。又 \\((b-1)^2=(b-d-1)(b+d+1)\\)，解得 \\(d=${d}\\)，所以三數為 ${a},${b},${c}。`);
        continue;
      }

      if (type === 2) {
        questions.push(`等差與等比數列的混合參數：已知 \\(a,2,b\\) 三數成等比數列，且 \\(a,5,b\\) 三數成等差數列，求 \\(|a-b|\\) 的值。`);
        answers.push(`簡答：\\(2\\sqrt{21}\\)。過程：由等比中項得 \\(ab=2^2=4\\)；由等差中項得 \\(a+b=10\\)。因此 \\((a-b)^2=(a+b)^2-4ab=100-16=84\\)，所以 \\(|a-b|=${formatRadical(84)}\\)。`);
        continue;
      }

      if (type === 3) {
        const first = randInt(8, 18);
        const d = randInt(2, 5);
        const insert = randInt(4, 10);
        const last = first + (insert + 1) * d;
        const fourth = first + 3 * d;
        questions.push(`等差與等比數列的混合參數：在 ${first} 與 ${last} 之間插入 \\(k\\) 個數使其成等差數列。若第四項為 ${fourth}，求 \\(k\\)。`);
        answers.push(`簡答：\\(k=${insert}\\)。過程：第四項為 \\(${first}+3d=${fourth}\\)，所以公差 \\(d=${d}\\)。從 ${first} 到 ${last} 的總段數為 \\(\\frac{${last}-${first}}{${d}}=${insert + 1}\\)，因此插入數 \\(k=${insert + 1}-1=${insert}\\)。`);
        continue;
      }

      const d = pickNonZero(-4, 5);
      questions.push(`等差與等比數列的混合參數：已知 \\(${aTerm(1)},${aTerm(2)},${aTerm(3)},${aTerm(4)}\\) 成等差數列，公差為 \\(d\\)。設 \\(b_n=2^{a_n}\\)，證明 \\(b_n\\) 為等比數列並用 \\(d\\) 表示其公比。`);
      answers.push(`簡答：\\(b_n\\) 為等比數列，公比為 \\(2^d\\)。過程：因為 \\(a_{n+1}=a_n+d\\)，所以 \\(\\frac{b_{n+1}}{b_n}=\\frac{2^{a_{n+1}}}{2^{a_n}}=2^{a_{n+1}-a_n}=2^d\\)。相鄰兩項比值固定，故 \\(b_n\\) 是等比數列。`);
    }

    return { questions, answers };
  }

  function buildS211VisualGroupPatternSet(count) {
    const questions = [];
    const answers = [];
    const aTerm = (index) => latexSub('a', index);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      const cycle = Math.floor(i / 5);

      if (type === 0) {
        const group = 8 + cycle + randInt(0, 8);
        const last = (group * (group + 1)) / 2;
        questions.push(`圖形規律與群數列：將自然數依序分組為 \\((1),(2,3),(4,5,6),\\ldots\\)，求第 ${group} 組中的最後一個數。`);
        answers.push(`簡答：${last}。過程：第 \\(k\\) 組有 \\(k\\) 個數，所以第 ${group} 組最後一個數是 \\(1+2+\\cdots+${group}=\\frac{${group}(${group}+1)}{2}=${last}\\)。`);
        continue;
      }

      if (type === 1) {
        const first = [5, 8, 12][randInt(0, 2)];
        const diff = [4, 6, 8][randInt(0, 2)];
        const n = 12 + cycle + randInt(0, 8);
        const value = first + (n - 1) * diff;
        questions.push(`圖形規律與群數列：用正方形磁磚鋪圖形，第 1 圖需 ${first} 塊，之後每增加一圖多 ${diff} 塊，求第 ${n} 圖需要幾塊磁磚。`);
        answers.push(`簡答：${value} 塊。過程：磁磚數形成等差數列，\\(${aTerm(1)}=${first}\\)、\\(d=${diff}\\)。所以 \\(${aTerm(n)}=${first}+(${n}-1)\\cdot${diff}=${value}\\)。`);
        continue;
      }

      if (type === 2) {
        const n = 6 + cycle + randInt(0, 6);
        const value = (n * (n + 1)) / 2 + 1;
        questions.push(`圖形規律與群數列：平面上有 ${n} 條直線，任兩線不平行且任三線不共點，最多可將平面分成幾個區域？`);
        answers.push(`簡答：${value} 個。過程：第 \\(n\\) 條直線最多和前面 \\(n-1\\) 條直線相交，新增 \\(n\\) 個區域，所以 \\(a_n=1+(1+2+\\cdots+n)=1+\\frac{n(n+1)}{2}\\)。代入 \\(n=${n}\\)，得 ${value}。`);
        continue;
      }

      if (type === 3) {
        const p = randInt(2, 6);
        const q = randInt(3, 9);
        const group = p + q - 1;
        const index = ((group - 1) * group) / 2 + p;
        questions.push(`圖形規律與群數列：數列 \\(\\frac{1}{1},\\frac{1}{2},\\frac{2}{1},\\frac{1}{3},\\frac{2}{2},\\frac{3}{1},\\ldots\\) 依分子分母和分組排列，問 \\(\\frac{${p}}{${q}}\\) 是第幾項？`);
        answers.push(`簡答：第 ${index} 項。過程：\\(\\frac{${p}}{${q}}\\) 的分子分母和為 ${p + q}，所以在第 ${group} 組；前面共有 \\(1+2+\\cdots+${group - 1}=\\frac{${group - 1}\\cdot${group}}{2}\\) 項。它在該組第 ${p} 個，因此項序為 ${index}。`);
        continue;
      }

      const layer = 8 + cycle + randInt(0, 5);
      const balls = (layer * (layer + 1)) / 2;
      questions.push(`圖形規律與群數列：一堆圓球排成三角堆，第 1 層 1 個、第 2 層 2 個、第 3 層 3 個，求第 ${layer} 層為止共有多少個圓球。`);
      answers.push(`簡答：${balls} 個。過程：總數是前三角數，\\(1+2+\\cdots+${layer}=\\frac{${layer}(${layer}+1)}{2}=${balls}\\)。`);
    }

    return { questions, answers };
  }

  function buildS211RecurrenceTransformSet(count) {
    const questions = [];
    const answers = [];
    const aTerm = (index) => latexSub('a', index);
    const fracText = (frac) => formatFraction(frac.num, frac.den);
    const transformFraction = (start, steps, coeffs) => {
      let value = makeFraction(start.num, start.den);
      const terms = [value];
      for (let j = 2; j <= steps; j += 1) {
        const numerator = addFraction(mulFraction(makeFraction(coeffs.a, 1), value), makeFraction(coeffs.b, 1));
        const denominator = addFraction(mulFraction(makeFraction(coeffs.c, 1), value), makeFraction(coeffs.d, 1));
        value = divFraction(numerator, denominator);
        terms.push(value);
      }
      return terms;
    };

    for (let i = 0; i < count; i += 1) {
      const type = i % 8;

      if (type === 0) {
        const a1 = randInt(2, 6);
        const n = randInt(6, 10);
        const value = (a1 - 1) * powInt(2, n - 1) + 1;
        questions.push(`線性遞迴轉換：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=2a_{n-1}-1\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${value}\\)。過程：兩邊同減 1 得 \\(a_n-1=2(a_{n-1}-1)\\)，所以 \\(a_n-1=(${a1}-1)2^{n-1}\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${value}\\)。`);
        continue;
      }

      if (type === 1) {
        const a1 = randInt(1, 4);
        const n = randInt(4, 6);
        let value = a1;
        for (let j = 2; j <= n; j += 1) value = 3 * value + 2;
        questions.push(`線性遞迴轉換：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=3a_{n-1}+2\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${value}\\)。過程：固定點為 \\(-1\\)，所以 \\(a_n+1=3(a_{n-1}+1)\\)。因此 \\(a_n+1=(${a1}+1)3^{n-1}\\)，代入 \\(n=${n}\\) 得 \\(${aTerm(n)}=${value}\\)。`);
        continue;
      }

      if (type === 2) {
        const a1 = [0, 2, 4][randInt(0, 2)];
        const n = randInt(5, 8);
        const value = addFraction(makeFraction(6, 1), mulFraction(makeFraction(a1 - 6, 1), makeFraction(1, powInt(2, n - 1))));
        questions.push(`線性遞迴轉換：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=\\frac12a_{n-1}+3\\ (n\\geq2)\\)，求一般項 \\(a_n\\)，並求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(a_n=6+(${a1}-6)\\left(\\frac12\\right)^{n-1}\\)，\\(${aTerm(n)}=${fracText(value)}\\)。過程：固定點 \\(L\\) 滿足 \\(L=\\frac12L+3\\)，得 \\(L=6\\)。因此 \\(a_n-6=\\frac12(a_{n-1}-6)\\)，推出一般項並代入 \\(n=${n}\\)。`);
        continue;
      }

      if (type === 3) {
        const a1 = randInt(1, 4);
        const n = 4;
        let value = a1;
        const terms = [a1];
        for (let j = 2; j <= n; j += 1) {
          value = 2 * value + (j + 1);
          terms.push(value);
        }
        questions.push(`線性遞迴轉換：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=2a_{n-1}+(n+1)\\ (n\\geq2)\\)，求 \\(${aTerm(4)}\\)。`);
        answers.push(`簡答：\\(${aTerm(4)}=${value}\\)。過程：\\(${aTerm(2)}=2\\cdot${a1}+3=${terms[1]}\\)，\\(${aTerm(3)}=2\\cdot${terms[1]}+4=${terms[2]}\\)，\\(${aTerm(4)}=2\\cdot${terms[2]}+5=${terms[3]}\\)。`);
        continue;
      }

      if (type === 4) {
        const c = [6, 8, 10][randInt(0, 2)];
        const a1 = randInt(1, c - 1);
        const a2 = -a1 + c;
        questions.push(`線性遞迴轉換：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=-a_{n-1}+${c}\\ (n\\geq2)\\)，觀察此數列是否具有循環性。`);
        answers.push(`簡答：有，週期為 2。過程：\\(${aTerm(2)}=-${a1}+${c}=${a2}\\)，\\(${aTerm(3)}=-${a2}+${c}=${a1}\\)，之後會在 ${a1} 與 ${a2} 之間交替出現。`);
        continue;
      }

      if (type === 5) {
        const a1 = randInt(2, 5);
        const n = [10, 50, 100, 2026][randInt(0, 3)];
        const value = makeFraction(a1, a1 * n - a1 + 1);
        questions.push(`分式遞迴的規律觀察：設 \\(${aTerm(1)}=${a1}\\)，\\(a_{n+1}=\\frac{a_n}{a_n+1}\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${fracText(value)}\\)。過程：令 \\(b_n=\\frac1{a_n}\\)，則 \\(b_{n+1}=\\frac{a_n+1}{a_n}=b_n+1\\)。因為 \\(b_1=\\frac1{${a1}}\\)，所以 \\(b_n=n-1+\\frac1{${a1}}\\)，故 \\(a_n=\\frac{${a1}}{${a1}n-${a1 - 1}}\\)。代入 \\(n=${n}\\) 得答案。`);
        continue;
      }

      if (type === 6) {
        const n = [20, 50, 100, 2026][randInt(0, 3)];
        const cycle = [2, -1, makeFraction(1, 2)];
        const value = cycle[(n - 1) % 3];
        const text = typeof value === 'number' ? `${value}` : fracText(value);
        questions.push(`分式遞迴的週期性：設 \\(${aTerm(1)}=2\\)，\\(a_n=\\frac{1}{1-a_{n-1}}\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${text}\\)。過程：逐項計算得 \\(${aTerm(1)}=2\\)、\\(${aTerm(2)}=-1\\)、\\(${aTerm(3)}=\\frac12\\)、\\(${aTerm(4)}=2\\)，所以週期為 3。依 ${n} 在週期中的位置可得 \\(${aTerm(n)}=${text}\\)。`);
        continue;
      }

      const templates = [
        {
          start: makeFraction(1, 1),
          coeffs: { a: -1, b: 4, c: -1, d: 3 },
          text: '\\frac{4-a_{n-1}}{3-a_{n-1}}',
          target: 4,
          conjecture: 'a_n=\\frac{2n-1}{n}',
        },
        {
          start: makeFraction(0, 1),
          coeffs: { a: 1, b: 1, c: -4, d: 5 },
          text: '\\frac{1+a_{n-1}}{5-4a_{n-1}}',
          target: 4,
          conjecture: 'a_n=\\frac{n-1}{2n+1}',
        },
      ];
      const pick = templates[randInt(0, templates.length - 1)];
      const terms = transformFraction(pick.start, pick.target, pick.coeffs);
      questions.push(`分式遞迴求值與推測：設 \\(${aTerm(1)}=${fracText(pick.start)}\\)，\\(a_n=${pick.text}\\)，求前 ${pick.target} 項並推測一般項。`);
      answers.push(`簡答：\\(${terms.map((v, idx) => `${aTerm(idx + 1)}=${fracText(v)}`).join(', ')}\\)，推測 \\(${pick.conjecture}\\)。過程：依遞迴式逐項代入可得前 ${pick.target} 項；觀察分子與分母隨 \\(n\\) 的線性變化，即可得到上述一般項。`);
    }

    return { questions, answers };
  }

  function buildS211CumulativeProductRecurrenceSet(count) {
    const questions = [];
    const answers = [];
    const aTerm = (index) => latexSub('a', index);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const a1 = randInt(1, 4);
        const n = randInt(8, 14);
        const value = a1 + (n - 1) * (2 * n + 3);
        questions.push(`累加型與累乘型遞迴：設 \\(${aTerm(1)}=${a1}\\)，\\(a_{n+1}-a_n=4n+3\\ (n\\geq1)\\)，求一般項 \\(a_n\\)。`);
        answers.push(`簡答：\\(a_n=${a1}+(n-1)(2n+3)\\)。過程：把差分累加，\\(a_n=a_1+\\sum_{k=1}^{n-1}(4k+3)\\)。計算得 \\(\\sum_{k=1}^{n-1}(4k+3)=(n-1)(2n+3)\\)，所以一般項如上；例如 \\(${aTerm(n)}=${value}\\)。`);
        continue;
      }

      if (type === 1) {
        const n = randInt(12, 24);
        const value = n * n;
        questions.push(`累加型與累乘型遞迴：設 \\(${aTerm(1)}=1\\)，\\(a_n=a_{n-1}+(2n-1)\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${value}\\)。過程：\\(a_n=1+3+5+\\cdots+(2n-1)=n^2\\)，所以 \\(${aTerm(n)}=${n}^2=${value}\\)。`);
        continue;
      }

      if (type === 2) {
        const n = [12, 20, 30, 50][randInt(0, 3)];
        const a1 = [2, 4, 6][randInt(0, 2)];
        const value = simplifyFraction(a1 * (n + 1), 2);
        questions.push(`累加型與累乘型遞迴：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=\\frac{n+1}{n}a_{n-1}\\ (n\\geq2)\\)，利用累乘法求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。過程：\\(a_n=${a1}\\cdot\\frac32\\cdot\\frac43\\cdot\\frac54\\cdots\\frac{n+1}{n}\\)，中間項相消後為 \\(${a1}\\cdot\\frac{n+1}{2}\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。`);
        continue;
      }

      if (type === 3) {
        const n = randInt(6, 10);
        const value = powInt(2, n) - 1;
        questions.push(`累加型與累乘型遞迴：設 \\(${aTerm(1)}=1\\)，\\(a_n=a_{n-1}+2^{n-1}\\ (n\\geq2)\\)，求一般項並計算 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(a_n=2^n-1\\)，\\(${aTerm(n)}=${value}\\)。過程：\\(a_n=1+2+2^2+\\cdots+2^{n-1}\\)，這是等比級數和，所以 \\(a_n=2^n-1\\)。`);
        continue;
      }

      const n = randInt(8, 16);
      const value = makeFraction(1, n + 2);
      questions.push(`累加型與累乘型遞迴：設 \\(${aTerm(1)}=\\frac13\\)，\\(a_{n+1}=\\frac{n+2}{n+3}a_n\\)，求通式 \\(a_n\\)。`);
      answers.push(`簡答：\\(a_n=\\frac{1}{n+2}\\)。過程：累乘得 \\(a_n=\\frac13\\cdot\\frac34\\cdot\\frac45\\cdot\\frac56\\cdots\\frac{n+1}{n+2}\\)，中間項相消後得到 \\(a_n=\\frac1{n+2}\\)；例如 \\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。`);
    }

    return { questions, answers };
  }

  function buildS211CombinatorialRecurrenceSet(count) {
    const questions = [];
    const answers = [];
    const aTerm = (index) => latexSub('a', index);
    const fib = [0, 1];
    for (let i = 2; i <= 40; i += 1) fib[i] = fib[i - 1] + fib[i - 2];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const n = randInt(8, 14);
        const value = fib[n + 1];
        questions.push(`計數類遞迴：每次可爬 1 階或 2 階，爬到第 ${n} 階共有幾種方法？`);
        answers.push(`簡答：${value} 種。過程：設 \\(a_n\\) 為爬 \\(n\\) 階的方法數，最後一步可能從 \\(n-1\\) 階走 1 階，或從 \\(n-2\\) 階走 2 階，所以 \\(a_n=a_{n-1}+a_{n-2}\\)，且 \\(a_1=1,a_2=2\\)。因此 \\(${aTerm(n)}=${value}\\)。`);
        continue;
      }

      if (type === 1) {
        const n = randInt(6, 12);
        const value = fib[n + 1];
        questions.push(`計數類遞迴：用 \\(1\\times2\\) 的骨牌鋪滿 \\(2\\times${n}\\) 的長方形區域，共有幾種鋪法？`);
        answers.push(`簡答：${value} 種。過程：看最左邊：若放一塊直骨牌，剩 \\(2\\times(${n}-1)\\)；若放兩塊橫骨牌，剩 \\(2\\times(${n}-2)\\)。所以 \\(a_n=a_{n-1}+a_{n-2}\\)，\\(a_1=1,a_2=2\\)，得 \\(${aTerm(n)}=${value}\\)。`);
        continue;
      }

      if (type === 2) {
        const n = randInt(6, 12);
        const value = fib[n + 2];
        questions.push(`計數類遞迴：一排 ${n} 個格子塗紅、白兩色，規定白格不可相鄰，求共有幾種塗法。`);
        answers.push(`簡答：${value} 種。過程：若最後一格塗紅，前面有 \\(a_{n-1}\\) 種；若最後一格塗白，倒數第二格必為紅，前面有 \\(a_{n-2}\\) 種。因此 \\(a_n=a_{n-1}+a_{n-2}\\)，且 \\(a_1=2,a_2=3\\)，所以 \\(${aTerm(n)}=${value}\\)。`);
        continue;
      }

      if (type === 3) {
        const n = randInt(8, 14);
        const value = n % 2 === 0 ? -1 : 1;
        questions.push(`計數類遞迴：已知 \\(F_n\\) 為費氏數列，\\(F_1=F_2=1\\)。求 \\(F_{${n}}^2-F_{${n - 1}}F_{${n + 1}}\\) 的值。`);
        answers.push(`簡答：${value}。過程：卡西尼恆等式為 \\(F_n^2-F_{n-1}F_{n+1}=(-1)^{n-1}\\)。代入 \\(n=${n}\\)，得到 ${value}。`);
        continue;
      }

      const n = randInt(7, 13);
      const value = fib[n];
      questions.push(`計數類遞迴：一開始有 1 對新生兔子，每對兔子滿一個月後每月生 1 對，且兔子不死亡。若總對數形成費氏數列，求第 ${n} 個月共有幾對兔子。`);
      answers.push(`簡答：${value} 對。過程：第 \\(n\\) 個月的兔子來自上個月原有兔子，加上已成熟並生育的兔子，所以 \\(F_n=F_{n-1}+F_{n-2}\\)，\\(F_1=F_2=1\\)。因此 \\(F_{${n}}=${value}\\)。`);
    }

    return { questions, answers };
  }

  function buildS211GeometricCoordinateSequenceSet(count) {
    const questions = [];
    const answers = [];
    const aTerm = (index) => latexSub('a', index);
    const pointText = (x, y) => `(${formatFraction(x.num, x.den)},${formatFraction(y.num, y.den)})`;

    for (let i = 0; i < count; i += 1) {
      const type = i % 8;

      if (type === 0) {
        const n = randInt(5, 10);
        const value = powInt(2, n) - 1;
        questions.push(`幾何分割與座標數列：河內塔有 ${n} 個盤子，每次只能移動一個盤子，且大盤不可放在小盤上，求最少移動次數。`);
        answers.push(`簡答：${value} 次。過程：設最少次數為 \\(a_n\\)。先移上面 \\(n-1\\) 個盤需 \\(a_{n-1}\\) 次，再移最大盤 1 次，再移回 \\(n-1\\) 個盤，故 \\(a_n=2a_{n-1}+1\\)，\\(a_1=1\\)，所以 \\(a_n=2^n-1\\)。代入 \\(n=${n}\\) 得 ${value}。`);
        continue;
      }

      if (type === 1) {
        const n = randInt(6, 12);
        const value = (n * (n + 1)) / 2 + 1;
        questions.push(`幾何分割與座標數列：平面上有 ${n} 條直線，任兩條不平行且任三條不共點，最多可分割成幾個區域？`);
        answers.push(`簡答：${value} 個。過程：新增第 \\(n\\) 條直線時最多被前面直線切成 \\(n\\) 段，因此多出 \\(n\\) 個區域。故 \\(a_n=1+1+2+\\cdots+n=1+\\frac{n(n+1)}{2}\\)，代入得 ${value}。`);
        continue;
      }

      if (type === 2) {
        const n = randInt(5, 10);
        const value = n * n - n + 2;
        questions.push(`幾何分割與座標數列：平面上有 ${n} 個圓，任兩圓交於兩點且任三圓不共點，最多可將平面分成幾個區域？`);
        answers.push(`簡答：${value} 個。過程：第 \\(n\\) 個圓最多被前面 \\(n-1\\) 個圓切成 \\(2(n-1)\\) 段，因此新增 \\(2(n-1)\\) 個區域。由 \\(a_1=2\\)，得 \\(a_n=2+2(1+2+\\cdots+n-1)=n^2-n+2\\)。`);
        continue;
      }

      if (type === 3) {
        const n = randInt(6, 12);
        let x = makeFraction(1, 1);
        let y = makeFraction(0, 1);
        const dirs = [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
        ];
        for (let step = 2; step <= n; step += 1) {
          const len = makeFraction(1, step);
          const dir = dirs[(step - 2) % 4];
          x = addFraction(x, makeFraction(dir[0] * len.num, len.den));
          y = addFraction(y, makeFraction(dir[1] * len.num, len.den));
        }
        questions.push(`幾何分割與座標數列：一點 \\(P\\) 在座標平面上，\\(P_1=(1,0)\\)，之後依「上、右、下、左」循環移動，從 \\(P_{k-1}\\) 到 \\(P_k\\) 的距離為 \\(\\frac1k\\)。求 \\(P_{${n}}\\) 的座標。`);
        answers.push(`簡答：\\(P_{${n}}=${pointText(x, y)}\\)。過程：從 \\(P_1=(1,0)\\) 開始，依序把第 2 次到第 ${n} 次的位移向量相加；水平方向與鉛直方向分開累加，可得座標為 ${pointText(x, y)}。`);
        continue;
      }

      if (type === 4) {
        const side = [3, 6, 9, 12][randInt(0, 3)];
        const n = randInt(2, 5);
        const value = makeFraction(3 * side * powInt(4, n), powInt(3, n));
        questions.push(`幾何分割與座標數列：正三角形邊長為 ${side}，依雪花曲線規則每一步把每段線段替換成原來的 \\(\\frac43\\) 倍長，求第 ${n} 步後的周長。`);
        answers.push(`簡答：\\(${fracTextForDisplay(value)}\\)。過程：初始周長為 \\(3\\cdot${side}\\)，每一步周長乘以 \\(\\frac43\\)，所以第 ${n} 步周長為 \\(3\\cdot${side}\\left(\\frac43\\right)^{${n}}=${fracTextForDisplay(value)}\\)。`);
        continue;
      }

      if (type === 5) {
        const n = randInt(7, 14);
        const diagonals = (n * (n - 3)) / 2;
        const increase = n - 1;
        questions.push(`幾何分割與座標數列：凸 \\(n\\) 邊形的對角線共有 \\(a_n\\) 條。若 \\(n=${n}\\)，求對角線數 \\(a_n\\)，並說明從 \\(n\\) 邊形增加一個頂點變成 \\(n+1\\) 邊形時，對角線會增加幾條。`);
        answers.push(`簡答：\\(a_n=${diagonals}\\)，增加 ${increase} 條。過程：每個頂點可連到 \\(n-3\\) 個非相鄰頂點，總共算了兩次，所以 \\(a_n=\\frac{n(n-3)}2\\)。代入 \\(n=${n}\\) 得 ${diagonals}；增加一點後，新增對角線數為 \\(a_{n+1}-a_n=n-1=${increase}\\)。`);
        continue;
      }

      if (type === 6) {
        const n = randInt(6, 12);
        const fib = [1, 2];
        for (let j = 2; j <= n; j += 1) fib[j] = fib[j - 1] + fib[j - 2];
        const value = fib[n];
        questions.push(`幾何分割與座標數列：一列 ${n} 個正方形用黑、白兩色塗滿，規定黑格不可連續相鄰，求共有幾種塗法。`);
        answers.push(`簡答：${value} 種。過程：設 \\(a_n\\) 為 \\(n\\) 格的塗法數。最後一格若為白，前面有 \\(a_{n-1}\\) 種；若為黑，倒數第二格必為白，前面有 \\(a_{n-2}\\) 種。因此 \\(a_n=a_{n-1}+a_{n-2}\\)，且 \\(a_1=2,a_2=3\\)，代入得 \\(${aTerm(n)}=${value}\\)。`);
        continue;
      }

      const sides = randInt(5, 10);
      const eachSide = randInt(4, 12);
      const total = sides * (eachSide - 1);
      questions.push(`幾何分割與座標數列：用鋼珠排成正 ${sides} 邊形，每邊有 ${eachSide} 顆鋼珠且頂點鋼珠不重複計算，求總共需要幾顆鋼珠。`);
      answers.push(`簡答：${total} 顆。過程：若每邊 ${eachSide} 顆，直接乘會把每個頂點算兩次。可改想成每邊提供 ${eachSide - 1} 顆新的鋼珠，所以總數為 \\(${sides}(${eachSide}-1)=${total}\\)。`);
    }

    return { questions, answers };
  }

  function formatIntegerRatio(a, b) {
    const divisor = gcdInt(Math.abs(a), Math.abs(b)) || 1;
    return `${a / divisor}:${b / divisor}`;
  }

  function apSum(a1, d, n) {
    return (n * (2 * a1 + (n - 1) * d)) / 2;
  }

  function formatSeriesWithSigns(terms, lastTerm = null) {
    const pieces = terms.map((term, index) => {
      if (index === 0) return `${term}`;
      return term >= 0 ? `+${term}` : `${term}`;
    });
    if (lastTerm === null) return pieces.join('');
    const lastText = lastTerm >= 0 ? `+${lastTerm}` : `${lastTerm}`;
    return `${pieces.join('')}+\\cdots${lastText}`;
  }

  function buildS212SevenSubtypeMixedSet(count, fixedMode = null) {
    const questions = [];
    const answers = [];
    const aTerm = (index) => latexSub('a', index);
    const sTerm = (index) => latexSub('S', index);

    for (let i = 0; i < count; i += 1) {
      const mode = Number.isInteger(fixedMode) ? fixedMode : i % 7;

      if (mode === 0) {
        const type = i % 5;
        if (type === 0) {
          const a1 = randInt(10, 70);
          const d = -randInt(2, 6);
          const n = randInt(8, 18);
          const sum = apSum(a1, d, n);
          questions.push(`題型一：基礎公式求和。已知等差數列 \\(${aTerm(1)}=${a1}\\)，公差 \\(d=${d}\\)，求前 ${n} 項和 \\(${sTerm(n)}\\)。`);
          answers.push(`簡答：\\(${sTerm(n)}=${sum}\\)。過程：\\(S_n=\\frac{n}{2}[2a_1+(n-1)d]\\)，所以 \\(${sTerm(n)}=\\frac{${n}}{2}[2\\cdot${a1}+${n - 1}\\cdot(${d})]=${sum}\\)。`);
          continue;
        }
        if (type === 1) {
          const a1 = -randInt(1, 9);
          const d = randInt(3, 8);
          const n = randInt(10, 18);
          const last = a1 + (n - 1) * d;
          const sum = apSum(a1, d, n);
          questions.push(`題型一：基礎公式求和。求等差級數 \\(${formatSeriesWithSigns([a1, a1 + d, a1 + 2 * d], last)}\\) 的總和。`);
          answers.push(`簡答：${sum}。過程：首項為 ${a1}，末項為 ${last}，共有 \\(n=\\frac{${last}-(${a1})}{${d}}+1=${n}\\) 項。故總和 \\(S_n=\\frac{${n}(${a1}+${last})}{2}=${sum}\\)。`);
          continue;
        }
        if (type === 2) {
          const a1 = randInt(3, 12);
          const d = randInt(4, 9);
          const n = randInt(10, 20);
          const an = a1 + (n - 1) * d;
          const sum = apSum(a1, d, n);
          questions.push(`題型一：基礎公式求和。已知等差數列首項為 ${a1}，末項為 ${an}，總和為 ${sum}，求項數 \\(n\\)。`);
          answers.push(`簡答：\\(n=${n}\\)。過程：等差級數和 \\(S_n=\\frac{n(a_1+a_n)}{2}\\)，所以 ${sum}\\(=\\frac{n(${a1}+${an})}{2}\\)，解得 \\(n=${n}\\)。`);
          continue;
        }
        if (type === 3) {
          const a1 = randInt(4, 12);
          const d = randInt(5, 9);
          const n = randInt(10, 16);
          const an = a1 + (n - 1) * d;
          const sum = apSum(a1, d, n);
          questions.push(`題型一：基礎公式求和。求等差級數 \\(${formatSeriesWithSigns([a1, a1 + d, a1 + 2 * d], an)}\\) 的總和。`);
          answers.push(`簡答：${sum}。過程：首項 ${a1}、公差 ${d}、末項 ${an}，故項數 \\(n=\\frac{${an}-${a1}}{${d}}+1=${n}\\)。總和為 \\(\\frac{${n}(${a1}+${an})}{2}=${sum}\\)。`);
          continue;
        }
        const n = randInt(8, 24);
        const a1 = randInt(2, 10);
        const d = randInt(1, 5);
        const firstTwoSum = 2 * a1 + d;
        const lastTwoSum = 2 * (a1 + (n - 1) * d) - d;
        const sum = apSum(a1, d, n);
        questions.push(`題型一：基礎公式求和。設一等差數列前兩項和為 ${firstTwoSum}，最後兩項和為 ${lastTwoSum}，總和為 ${sum}，求項數。`);
        answers.push(`簡答：${n} 項。過程：等差數列中，\\((a_1+a_2)+(a_{n-1}+a_n)=2(a_1+a_n)\\)，所以 \\(a_1+a_n=\\frac{${firstTwoSum}+${lastTwoSum}}{2}\\)。又 \\(S_n=\\frac{n(a_1+a_n)}{2}\\)，代入得 \\(${sum}=\\frac{n\\cdot${(firstTwoSum + lastTwoSum) / 2}}{2}\\)，故 \\(n=${n}\\)。`);
        continue;
      }

      if (mode === 1) {
        const multiple = [4, 5, 6, 7, 8, 9, 11, 13][randInt(0, 7)];
        const startPool = [1, 50, 100, 200, 500];
        let start = startPool[randInt(0, startPool.length - 1)];
        let end = start + randInt(60, 180);
        if (i % 5 === 4) {
          start = 10;
          end = 99;
        }
        const first = Math.ceil(start / multiple) * multiple;
        const last = Math.floor(end / multiple) * multiple;
        const n = Math.floor((last - first) / multiple) + 1;
        const sum = n > 0 ? (n * (first + last)) / 2 : 0;
        questions.push(`題型二：範圍內倍數之和。求 ${start} 到 ${end} 的整數中，所有 ${multiple} 的倍數之總和。`);
        answers.push(`簡答：${sum}。過程：範圍內第一個 ${multiple} 的倍數是 ${first}，最後一個是 ${last}，形成公差 ${multiple} 的等差數列。項數 \\(n=\\frac{${last}-${first}}{${multiple}}+1=${n}\\)，所以總和為 \\(\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`);
        continue;
      }

      if (mode === 2) {
        const a1 = randInt(20, 120);
        const d = -randInt(2, 12);
        if (a1 % -d === 0) {
          i -= 1;
          continue;
        }
        const positiveCount = Math.floor((a1 - 1) / -d) + 1;
        const maxSum = apSum(a1, d, positiveCount);
        const lastPositive = a1 + (positiveCount - 1) * d;
        const next = a1 + positiveCount * d;
        questions.push(`題型三：級數和的最大值。已知等差數列 \\(${aTerm(1)}=${a1}\\)，公差 \\(d=${d}\\)，求前 \\(n\\) 項和 \\(S_n\\) 的最大值與此時的 \\(n\\)。`);
        answers.push(`簡答：當 \\(n=${positiveCount}\\) 時，最大值為 ${maxSum}。過程：公差為負，前項先增加總和，直到項變成負數後總和會下降。由 \\(a_n=${a1}+(n-1)(${d})>0\\) 得最後一個正項是 \\(a_{${positiveCount}}=${lastPositive}\\)，下一項 \\(a_{${positiveCount + 1}}=${next}\\le0\\)。所以最大和為 \\(S_{${positiveCount}}=\\frac{${positiveCount}(${a1}+${lastPositive})}{2}=${maxSum}\\)。`);
        continue;
      }

      if (mode === 3) {
        const type = i % 5;
        if (type < 3) {
          const p = randInt(1, 6);
          const q = pickNonZero(-8, 8);
          const coef = 2 * p;
          const constant = q - p;
          const n = randInt(6, 15);
          const value = coef * n + constant;
          questions.push(`題型四：已知 \\(S_n\\) 公式求一般項。設數列前 \\(n\\) 項和 \\(S_n=${formatSnQuadratic(p, q)}\\)，求一般項 \\(a_n\\)；並求 \\(${aTerm(n)}\\)。`);
          answers.push(`簡答：\\(a_n=${formatLinearN(coef, constant)}\\)，\\(${aTerm(n)}=${value}\\)。過程：\\(a_n=S_n-S_{n-1}\\)。相減得 \\(a_n=${formatLinearN(coef, constant)}\\)，代入 \\(n=${n}\\) 得 \\(${aTerm(n)}=${value}\\)。`);
          continue;
        }
        const p = randInt(2, 6);
        const q = -randInt(1, 8);
        const a1 = p + q;
        const coef = 2 * p;
        const constant = q - p;
        questions.push(`題型四：已知 \\(S_n\\) 公式求一般項。若 \\(S_n=${formatSnQuadratic(p, q)}\\)，求 \\(a_1\\) 與一般項 \\(a_n\\)。`);
        answers.push(`簡答：\\(a_1=${a1}\\)，\\(a_n=${formatLinearN(coef, constant)}\\)。過程：\\(a_1=S_1=${p}+(${q})=${a1}\\)。當 \\(n\\ge2\\) 時，\\(a_n=S_n-S_{n-1}=${formatLinearN(coef, constant)}\\)，代入 \\(n=1\\) 也得到 ${a1}，所以此式可作為一般項。`);
        continue;
      }

      if (mode === 4) {
        const alpha = randInt(2, 8);
        const beta = randInt(2, 8);
        const c1 = randInt(1, 5);
        const c2 = randInt(1, 5);
        const k = randInt(5, 20);
        const firstTerm = alpha * (2 * k - 1) + c1;
        const secondTerm = beta * (2 * k - 1) + c2;
        const ratio = formatIntegerRatio(firstTerm, secondTerm);
        questions.push(`題型五：兩等差數列的和與項之比。設兩等差數列前 \\(n\\) 項和之比為 \\((${alpha}n+${c1}):(${beta}n+${c2})\\)，求兩數列第 ${k} 項之比。`);
        answers.push(`簡答：${ratio}。過程：等差數列前 \\(n\\) 項和可寫成 \\(\\frac{n}{2}\\) 乘上一個關於 \\(n\\) 的一次式。若和比的一次式為 \\(${alpha}n+${c1}\\)，則第 \\(k\\) 項對應 \\(${alpha}(2k-1)+${c1}\\)。所以第 ${k} 項之比為 \\([${alpha}(2\\cdot${k}-1)+${c1}]:[${beta}(2\\cdot${k}-1)+${c2}]=${firstTerm}:${secondTerm}=${ratio}\\)。`);
        continue;
      }

      if (mode === 5) {
        const type = i % 5;
        if (type === 0) {
          const front = randInt(8, 20);
          const diff = randInt(1, 4);
          const rows = randInt(12, 30);
          const total = apSum(front, diff, rows);
          questions.push(`題型六：生活情境應用。電影院共有 ${rows} 排座位，最前排有 ${front} 個座位，後排比前排多 ${diff} 個座位，求全區總座位數。`);
          answers.push(`簡答：${total} 個。過程：每排座位數形成等差數列，首項 ${front}、公差 ${diff}、共 ${rows} 項。總和 \\(S_{${rows}}=\\frac{${rows}}{2}[2\\cdot${front}+${rows - 1}\\cdot${diff}]=${total}\\)。`);
          continue;
        }
        if (type === 1) {
          const layers = randInt(6, 14);
          const total = (layers * (layers + 1) * (layers + 2)) / 6;
          const bottomCups = (layers * (layers + 1)) / 2;
          questions.push(`題型六：生活情境應用。高腳杯堆成 ${layers} 層，底層每邊 ${layers} 杯排成正三角形，每往上一層每邊少一杯，求總杯數。`);
          answers.push(`簡答：${total} 杯。過程：底層有 \\(1+2+\\cdots+${layers}=${bottomCups}\\) 杯，往上依序為三角數 \\(T_{${layers}},T_{${layers - 1}},\\ldots,T_1\\)。總數為 \\(T_1+T_2+\\cdots+T_{${layers}}=\\frac{${layers}(${layers}+1)(${layers}+2)}{6}=${total}\\)。`);
          continue;
        }
        if (type === 2) {
          const sides = randInt(5, 12);
          const d = randInt(1, 4) * 5;
          const minAngle = ((sides - 2) * 180 * 2 / sides - (sides - 1) * d) / 2;
          if (!Number.isInteger(minAngle) || minAngle <= 0) {
            i -= 1;
            continue;
          }
          questions.push(`題型六：生活情境應用。一凸多邊形內角成等差數列，最小角為 ${minAngle}°，公差為 ${d}°，求邊數。`);
          answers.push(`簡答：${sides} 邊。過程：設邊數為 \\(n\\)，內角和為 \\((n-2)180°\\)。等差和為 \\(\\frac{n}{2}[2\\cdot${minAngle}+(n-1)${d}]\\)。代入檢查可得 \\(n=${sides}\\) 時兩邊皆為 ${(sides - 2) * 180}°，所以邊數為 ${sides}。`);
          continue;
        }
        if (type === 3) {
          const n = randInt(12, 30);
          const first = randInt(8, 20);
          const d = randInt(1, 5);
          const total = apSum(first, d, n);
          questions.push(`題型六：生活情境應用。某人分 ${n} 期還款，各期款額成等差數列，第一期 ${first} 萬元，每期增加 ${d} 萬元，求總還款額。`);
          answers.push(`簡答：${total} 萬元。過程：還款額形成等差級數，首項 ${first}、公差 ${d}、共 ${n} 項。總和為 \\(\\frac{${n}}{2}[2\\cdot${first}+${n - 1}\\cdot${d}]=${total}\\)。`);
          continue;
        }
        const rows = randInt(10, 25);
        const first = randInt(6, 15);
        const diff = randInt(2, 5);
        const total = apSum(first, diff, rows);
        questions.push(`題型六：生活情境應用。某球場共有 ${rows} 排座位，第一排 ${first} 個座位，每排比前一排多 ${diff} 個，求總座位數。`);
        answers.push(`簡答：${total} 個。過程：座位數為等差級數，\\(a_1=${first}\\)、\\(d=${diff}\\)、\\(n=${rows}\\)。所以總和 \\(S_n=\\frac{${rows}}{2}[2\\cdot${first}+(${rows}-1)${diff}]=${total}\\)。`);
        continue;
      }

      const type = i % 5;
      if (type === 0) {
        const p = randInt(1, 5);
        const q = randInt(1, 8);
        questions.push(`題型七：給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=${formatSnQuadratic(p, q)}\\)，求 \\(a_n\\)。`);
        answers.push(`簡答：\\(a_n=${formatLinearN(2 * p, q - p)}\\)。過程：\\(a_n=S_n-S_{n-1}\\)，將 \\(S_n\\) 與 \\(S_{n-1}\\) 相減，得 \\(a_n=${formatLinearN(2 * p, q - p)}\\)。`);
        continue;
      }
      if (type === 1) {
        const n = randInt(5, 12);
        const value = makeFraction(1, (2 * n + 1) * (2 * n - 1));
        questions.push(`題型七：給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=\\frac{n}{2n+1}\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。過程：\\(a_n=S_n-S_{n-1}=\\frac{n}{2n+1}-\\frac{n-1}{2n-1}=\\frac{1}{(2n+1)(2n-1)}\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。`);
        continue;
      }
      if (type === 2) {
        const n = randInt(6, 12);
        const value = powInt(2, n - 1);
        questions.push(`題型七：給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=2^n-1\\)，求 \\(${aTerm(n)}\\)，並判斷是否為等比數列。`);
        answers.push(`簡答：\\(${aTerm(n)}=${value}\\)，此數列為等比數列。過程：\\(a_n=S_n-S_{n-1}=(2^n-1)-(2^{n-1}-1)=2^{n-1}\\)。相鄰兩項比值為 2，所以是等比數列。`);
        continue;
      }
      if (type === 3) {
        const n = randInt(4, 9);
        const value = n * (n + 1);
        questions.push(`題型七：給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=\\frac13n(n+1)(n+2)\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${value}\\)。過程：\\(a_n=S_n-S_{n-1}=\\frac13n(n+1)(n+2)-\\frac13(n-1)n(n+1)=n(n+1)\\)。代入 \\(n=${n}\\)，得 ${value}。`);
        continue;
      }
      const p = randInt(2, 6);
      const q = -randInt(1, 6);
      const d = 2 * p;
      questions.push(`題型七：給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=${formatSnQuadratic(p, q)}\\)，求 \\(a_{10}\\) 與公差 \\(d\\)，並判斷是否為等差數列。`);
      answers.push(`簡答：\\(a_{10}=${20 * p + q - p}\\)，\\(d=${d}\\)，是等差數列。過程：\\(a_n=S_n-S_{n-1}=${formatLinearN(2 * p, q - p)}\\)，這是 \\(n\\) 的一次式，因此為等差數列，公差為 ${d}。代入 \\(n=10\\)，得 \\(a_{10}=${20 * p + q - p}\\)。`);
    }

    return { questions, answers };
  }

  function buildS212BasicSumFormulaSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 0);
  }

  function buildS212RangeMultipleSumSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 1);
  }

  function buildS212MaxSumSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 2);
  }

  function buildS212SnToAnSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 3);
  }

  function buildS212TwoApRatioSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 4);
  }

  function buildS212ApplicationSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 5);
  }

  function buildS212GivenSnGeneralTermSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 6);
  }

  function fractionText(frac) {
    return formatFraction(frac.num, frac.den);
  }

  function geometricSumFraction(a1, r, n) {
    let sum = makeFraction(0, 1);
    let term = makeFraction(a1.num, a1.den);
    for (let i = 0; i < n; i += 1) {
      sum = addFraction(sum, term);
      term = mulFraction(term, r);
    }
    return sum;
  }

  function geometricTermFraction(a1, r, n) {
    let term = makeFraction(a1.num, a1.den);
    for (let i = 1; i < n; i += 1) term = mulFraction(term, r);
    return term;
  }

  function formatGeometricSeriesTerms(a1, r, n, visibleCount = 4) {
    const terms = [];
    let term = makeFraction(a1.num, a1.den);
    const shown = Math.min(visibleCount, n);
    for (let i = 0; i < shown; i += 1) {
      terms.push(fractionText(term));
      term = mulFraction(term, r);
    }
    const last = geometricTermFraction(a1, r, n);
    const prefix = terms
      .map((text, index) => (index === 0 || text.startsWith('-') ? text : `+${text}`))
      .join('');
    const lastText = fractionText(last);
    if (n > visibleCount) return `${prefix}+\\cdots${lastText.startsWith('-') ? lastText : `+${lastText}`}`;
    return prefix;
  }

  function buildS212GeometricSeriesFiveSubtypeMixedSet(count, fixedMode = null) {
    const questions = [];
    const answers = [];
    const aTerm = (index) => latexSub('a', index);
    const sTerm = (index) => latexSub('S', index);

    for (let i = 0; i < count; i += 1) {
      const mode = Number.isInteger(fixedMode) ? fixedMode : i % 5;

      if (mode === 0) {
        const type = i % 5;
        if (type === 0) {
          const a1 = makeFraction(randInt(2, 8), 1);
          const r = makeFraction([-2, 2, 3][randInt(0, 2)], 1);
          const n = randInt(5, 9);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(`題型一：基礎參數求和。已知等比數列 \\(${aTerm(1)}=${fractionText(a1)}\\)，公比 \\(r=${fractionText(r)}\\)，求前 ${n} 項和 \\(${sTerm(n)}\\)。`);
          answers.push(`簡答：\\(${sTerm(n)}=${fractionText(sum)}\\)。過程：等比級數和 \\(S_n=a_1\\frac{1-r^n}{1-r}\\)。代入 \\(a_1=${fractionText(a1)}\\)、\\(r=${fractionText(r)}\\)、\\(n=${n}\\)，得 \\(${sTerm(n)}=${fractionText(sum)}\\)。`);
          continue;
        }
        if (type === 1) {
          const den = [2, 3, 4][randInt(0, 2)];
          const a1 = makeFraction(1, den);
          const r = makeFraction(2, 1);
          const n = randInt(6, 10);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(`題型一：基礎參數求和。已知等比數列 \\(${aTerm(1)}=${fractionText(a1)}\\)，公比 \\(r=2\\)，求前 ${n} 項和。`);
          answers.push(`簡答：${fractionText(sum)}。過程：\\(S_n=a_1\\frac{1-r^n}{1-r}\\)，所以 \\(S_{${n}}=${fractionText(a1)}\\cdot\\frac{1-2^{${n}}}{1-2}=${fractionText(sum)}\\)。`);
          continue;
        }
        if (type === 2) {
          const a1 = makeFraction(randInt(2, 9), 1);
          const r = makeFraction(2, 1);
          const n = randInt(5, 10);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(`題型一：基礎參數求和。已知等比數列首項為 ${fractionText(a1)}，公比為 2，總和為 ${fractionText(sum)}，求項數 \\(n\\)。`);
          answers.push(`簡答：\\(n=${n}\\)。過程：\\(S_n=${fractionText(a1)}(2^n-1)\\)。由 \\(${fractionText(sum)}=${fractionText(a1)}(2^n-1)\\)，得 \\(2^n=${powInt(2, n)}\\)，所以 \\(n=${n}\\)。`);
          continue;
        }
        if (type === 3) {
          const a1 = randInt(2, 8);
          const r = [2, 3][randInt(0, 1)];
          questions.push(`題型一：基礎參數求和。已知等比數列 \\(${aTerm(1)}=${a1}\\)，公比 \\(r=${r}\\)，求前 \\(n\\) 項和 \\(S_n\\) 的公式。`);
          answers.push(`簡答：\\(S_n=${formatFraction(a1, r - 1)}(${r}^n-1)\\)。過程：\\(S_n=a_1\\frac{r^n-1}{r-1}\\)，代入 \\(a_1=${a1}\\)、\\(r=${r}\\)，得 \\(S_n=${formatFraction(a1, r - 1)}(${r}^n-1)\\)。`);
          continue;
        }
        const a1 = makeFraction([64, 128, 256][randInt(0, 2)], 1);
        const r = makeFraction(1, 2);
        const n = randInt(6, 10);
        const sum = geometricSumFraction(a1, r, n);
        questions.push(`題型一：基礎參數求和。設等比數列 \\(${aTerm(1)}=${fractionText(a1)}\\)，\\(r=\\frac12\\)，求前 ${n} 項和。`);
        answers.push(`簡答：${fractionText(sum)}。過程：\\(S_n=a_1\\frac{1-r^n}{1-r}\\)，所以 \\(S_{${n}}=${fractionText(a1)}\\cdot\\frac{1-(\\frac12)^{${n}}}{1-\\frac12}=${fractionText(sum)}\\)。`);
        continue;
      }

      if (mode === 1) {
        const type = i % 5;
        if (type < 2) {
          const a1 = makeFraction([2, 3, 4, 5][randInt(0, 3)], 1);
          const r = makeFraction([2, 3][randInt(0, 1)], 1);
          const n = randInt(5, 8);
          const last = geometricTermFraction(a1, r, n);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(`題型二：級數求和計算。求等比級數 \\(${formatGeometricSeriesTerms(a1, r, n)}\\) 的總和。`);
          answers.push(`簡答：${fractionText(sum)}。過程：首項為 ${fractionText(a1)}，公比為 ${fractionText(r)}，末項為 ${fractionText(last)}，共有 ${n} 項。套用等比級數和公式得 \\(S_{${n}}=${fractionText(sum)}\\)。`);
          continue;
        }
        if (type < 4) {
          const a1 = makeFraction([128, 256, 384][randInt(0, 2)], 1);
          const r = makeFraction(1, 2);
          const n = randInt(6, 9);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(`題型二：級數求和計算。求等比級數 \\(${formatGeometricSeriesTerms(a1, r, n)}\\) 的總和。`);
          answers.push(`簡答：${fractionText(sum)}。過程：此級數首項為 ${fractionText(a1)}、公比為 \\(\\frac12\\)、共 ${n} 項，所以 \\(S_{${n}}=${fractionText(a1)}\\frac{1-(\\frac12)^{${n}}}{1-\\frac12}=${fractionText(sum)}\\)。`);
          continue;
        }
        const a1 = makeFraction(1, 1);
        const r = makeFraction(2, 3);
        const n = randInt(5, 9);
        const sum = geometricSumFraction(a1, r, n);
        questions.push(`題型二：級數求和計算。求等比級數 \\(1+\\frac23+\\frac49+\\cdots\\) 的前 ${n} 項和。`);
        answers.push(`簡答：${fractionText(sum)}。過程：首項為 1，公比為 \\(\\frac23\\)，所以 \\(S_{${n}}=\\frac{1-(\\frac23)^{${n}}}{1-\\frac23}=${fractionText(sum)}\\)。`);
        continue;
      }

      if (mode === 2) {
        const base = randInt(1, 8);
        const q = [2, 3, 4][randInt(0, 2)];
        const s1 = base;
        const s2 = base * (1 + q);
        const s3 = base * (1 + q + q * q);
        const block = [4, 5, 10][randInt(0, 2)];
        questions.push(`題型三：分段和性質的應用。設等比級數前 ${block} 項和為 ${s1}，前 ${2 * block} 項和為 ${s2}，求前 ${3 * block} 項和。`);
        answers.push(`簡答：${s3}。過程：等比級數每一段相同長度的和也成等比。設第二段與第一段的比為 \\(q\\)，由 \\(${s2}=${s1}(1+q)\\) 得 \\(q=${q}\\)。所以前三段和為 \\(${s1}(1+${q}+${q}^2)=${s3}\\)。`);
        continue;
      }

      if (mode === 3) {
        const type = i % 5;
        if (type < 2) {
          const c = randInt(1, 6);
          const r = [2, 3][randInt(0, 1)];
          const n = randInt(4, 8);
          const an = c * (r - 1) * powInt(r, n - 1);
          questions.push(`題型四：已知 \\(S_n\\) 公式求一般項。設數列前 \\(n\\) 項和 \\(S_n=${c}(${r}^n-1)\\)，求 \\(${aTerm(n)}\\) 與此數列公比。`);
          answers.push(`簡答：\\(${aTerm(n)}=${an}\\)，公比為 ${r}。過程：\\(a_n=S_n-S_{n-1}=${c}(${r}^n-1)-${c}(${r}^{n-1}-1)=${c}(${r}-1)${r}^{n-1}\\)。代入 \\(n=${n}\\) 得 \\(${aTerm(n)}=${an}\\)，且相鄰項比為 ${r}。`);
          continue;
        }
        if (type < 4) {
          const c = randInt(1, 5);
          const r = 3;
          const n = randInt(4, 7);
          const an = c * (r - 1) * powInt(r, n - 1);
          questions.push(`題型四：已知 \\(S_n\\) 公式求一般項。已知 \\(S_n=${c}(3^n-1)\\)，求一般項 \\(a_n\\)。`);
          answers.push(`簡答：\\(a_n=${2 * c}\\cdot3^{n-1}\\)。過程：\\(a_n=S_n-S_{n-1}\\)，所以 \\(a_n=${c}(3^n-1)-${c}(3^{n-1}-1)=${2 * c}\\cdot3^{n-1}\\)。例如 \\(a_{${n}}=${an}\\)。`);
          continue;
        }
        const c = randInt(1, 4);
        questions.push(`題型四：已知 \\(S_n\\) 公式求一般項。若 \\(S_n=${formatFraction(c, 2)}(4^n-1)\\)，求 \\(a_1\\) 與 \\(a_{10}\\)。`);
        answers.push(`簡答：\\(a_1=${formatFraction(3 * c, 2)}\\)，\\(a_{10}=${formatFraction(3 * c * powInt(4, 9), 2)}\\)。過程：\\(a_n=S_n-S_{n-1}=${formatFraction(c, 2)}(4^n-4^{n-1})=${formatFraction(3 * c, 2)}\\cdot4^{n-1}\\)。代入 \\(n=1,10\\) 即得答案。`);
        continue;
      }

      const type = i % 5;
      if (type === 0) {
        const principal = [10000, 20000, 50000][randInt(0, 2)];
        const rate = [2, 3, 5][randInt(0, 2)];
        const years = randInt(4, 10);
        questions.push(`題型五：生活情境應用。某人年初存入 ${principal} 元，年利率 ${rate}% 且每年計息一次，求 ${years} 年年底的本利和。`);
        answers.push(`簡答：\\(${principal}(1+\\frac{${rate}}{100})^{${years}}\\) 元。過程：複利成長每年乘上 \\(1+\\frac{${rate}}{100}\\)，所以 ${years} 年後本利和為 \\(${principal}(1+\\frac{${rate}}{100})^{${years}}\\)。`);
        continue;
      }
      if (type === 1) {
        const height = [81, 162, 243][randInt(0, 2)];
        const ratio = makeFraction(1, 3);
        const bounce = randInt(4, 7);
        let distance = makeFraction(height, 1);
        let rebound = makeFraction(height, 3);
        for (let j = 1; j < bounce; j += 1) {
          distance = addFraction(distance, mulFraction(makeFraction(2, 1), rebound));
          rebound = mulFraction(rebound, ratio);
        }
        questions.push(`題型五：生活情境應用。一個球從 ${height} 公尺落下，每次著地後跳回原高度的 \\(\\frac13\\)，求第 ${bounce} 次著地時，球所經過的總路程。`);
        answers.push(`簡答：${fractionText(distance)} 公尺。過程：第一次落下為 ${height} 公尺；之後每次彈起與落下成對出現，長度形成等比級數。總路程為 \\(${height}+2(${height}\\cdot\\frac13+${height}\\cdot(\\frac13)^2+\\cdots+${height}\\cdot(\\frac13)^{${bounce - 1}})=${fractionText(distance)}\\)。`);
        continue;
      }
      if (type === 2) {
        const initial = [50, 100, 200][randInt(0, 2)];
        const hours = randInt(5, 10);
        const total = initial * powInt(2, hours);
        questions.push(`題型五：生活情境應用。某種細菌每小時分裂一次，一個變兩個。若初始有 ${initial} 個，問 ${hours} 小時後共有多少個細菌？`);
        answers.push(`簡答：${total} 個。過程：每小時數量乘以 2，是等比成長。${hours} 小時後為 \\(${initial}\\cdot2^{${hours}}=${total}\\)。`);
        continue;
      }
      if (type === 3) {
        const payment = [10000, 20000, 30000][randInt(0, 2)];
        const years = randInt(3, 6);
        questions.push(`題型五：生活情境應用。某分期付款每年底繳 ${payment} 元，年利率 10% 複利計息，連續繳 ${years} 年，求最後一年年底的累積價值。`);
        answers.push(`簡答：\\(${payment}\\left(1+\\frac{11}{10}+(\\frac{11}{10})^2+\\cdots+(\\frac{11}{10})^{${years - 1}}\\right)\\) 元。過程：每一期款項到最後一年年底累積的時間不同，形成等比級數，公比為 \\(\\frac{11}{10}\\)，所以累積價值為 \\(${payment}\\cdot\\frac{(\\frac{11}{10})^{${years}}-1}{\\frac{11}{10}-1}\\)。`);
        continue;
      }
      const side = randInt(3, 8);
      const steps = randInt(3, 6);
      questions.push(`題型五：生活情境應用。取一邊長為 ${side} 的正三角形，將其四等分後移走中間三角形，重複此步驟 ${steps} 次，求剩餘總面積是原面積的幾倍。`);
      answers.push(`簡答：\\((\\frac{3}{4})^{${steps}}\\) 倍。過程：每次移走目前面積的 \\(\\frac{1}{4}\\)，所以剩餘面積每次乘以 \\(\\frac{3}{4}\\)。重複 ${steps} 次後為原面積的 \\((\\frac{3}{4})^{${steps}}\\) 倍。`);
    }

    return { questions, answers };
  }

  function buildS212GeometricBasicSumSet(count) {
    return buildS212GeometricSeriesFiveSubtypeMixedSet(count, 0);
  }

  function buildS212GeometricSeriesComputeSet(count) {
    return buildS212GeometricSeriesFiveSubtypeMixedSet(count, 1);
  }

  function buildS212GeometricSegmentPropertySet(count) {
    return buildS212GeometricSeriesFiveSubtypeMixedSet(count, 2);
  }

  function buildS212GeometricSnToAnSet(count) {
    return buildS212GeometricSeriesFiveSubtypeMixedSet(count, 3);
  }

  function buildS212GeometricApplicationsSet(count) {
    return buildS212GeometricSeriesFiveSubtypeMixedSet(count, 4);
  }

  function sumFirstN(n) {
    return (n * (n + 1)) / 2;
  }

  function sumSquares(n) {
    return (n * (n + 1) * (2 * n + 1)) / 6;
  }

  function sumCubes(n) {
    const s = sumFirstN(n);
    return s * s;
  }

  function sumSquaresRange(start, end) {
    return sumSquares(end) - sumSquares(start - 1);
  }

  function buildS212SigmaFiveSubtypeMixedSet(count, fixedMode = null) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = Number.isInteger(fixedMode) ? fixedMode : i % 5;

      if (mode === 0) {
        const type = i % 5;
        if (type === 0) {
          const upper = randInt(10, 25);
          const value = sumSquares(upper);
          questions.push(`題型一：標準公式與範圍變換。計算 \\(\\sum_{k=1}^{${upper}} k^2\\) 的值。`);
          answers.push(`簡答：${value}。過程：\\(\\sum_{k=1}^{n}k^2=\\frac{n(n+1)(2n+1)}{6}\\)。代入 \\(n=${upper}\\)，得 \\(\\frac{${upper}\\cdot${upper + 1}\\cdot${2 * upper + 1}}{6}=${value}\\)。`);
          continue;
        }
        if (type === 1) {
          const upper = randInt(6, 14);
          const value = sumCubes(upper) + upper;
          questions.push(`題型一：標準公式與範圍變換。求 \\(\\sum_{k=1}^{${upper}}(k^3+1)\\) 之總和。`);
          answers.push(`簡答：${value}。過程：\\(\\sum(k^3+1)=\\sum k^3+\\sum1\\)，且 \\(\\sum_{k=1}^{n}k^3=\\left[\\frac{n(n+1)}{2}\\right]^2\\)。代入 \\(n=${upper}\\)，得 ${sumCubes(upper)}+${upper}=${value}\\)。`);
          continue;
        }
        if (type === 2) {
          const start = randInt(5, 12);
          const end = start + randInt(6, 12);
          const value = sumSquaresRange(start, end);
          questions.push(`題型一：標準公式與範圍變換。計算 \\(${start}^2+${start + 1}^2+\\cdots+${end}^2\\) 的值。`);
          answers.push(`簡答：${value}。過程：改寫為 \\(\\sum_{k=${start}}^{${end}}k^2=\\sum_{k=1}^{${end}}k^2-\\sum_{k=1}^{${start - 1}}k^2\\)。所以值為 ${sumSquares(end)}-${sumSquares(start - 1)}=${value}。`);
          continue;
        }
        if (type === 3) {
          const upper = randInt(8, 18);
          const value = sumSquares(upper) + sumFirstN(upper);
          questions.push(`題型一：標準公式與範圍變換。計算 \\(\\sum_{k=1}^{${upper}} k(k+1)\\) 的值。`);
          answers.push(`簡答：${value}。過程：\\(k(k+1)=k^2+k\\)，所以 \\(\\sum k(k+1)=\\sum k^2+\\sum k\\)。代入 \\(n=${upper}\\)，得 ${sumSquares(upper)}+${sumFirstN(upper)}=${value}。`);
          continue;
        }
        const m = randInt(5, 10);
        const n = randInt(m + 3, m + 8);
        const value = sumCubes(n) - sumCubes(m);
        questions.push(`題型一：標準公式與範圍變換。設 \\(f(n)=\\sum_{k=1}^{n}k^3\\)，求 \\(f(${n})-f(${m})\\)。`);
        answers.push(`簡答：${value}。過程：\\(f(n)=\\left[\\frac{n(n+1)}{2}\\right]^2\\)。所以 \\(f(${n})-f(${m})=${sumCubes(n)}-${sumCubes(m)}=${value}\\)。`);
        continue;
      }

      if (mode === 1) {
        const type = i % 5;
        if (type === 0) {
          const n = randInt(6, 15);
          const sA = randInt(10, 40);
          const sA2 = randInt(50, 200);
          const value = 2 * sA + 3 * n;
          questions.push(`題型二：線性性質與常數項處理。已知 \\(\\sum_{k=1}^{${n}}a_k=${sA}\\)、\\(\\sum_{k=1}^{${n}}a_k^2=${sA2}\\)，求 \\(\\sum_{k=1}^{${n}}(2a_k+3)\\)。`);
          answers.push(`簡答：${value}。過程：利用 Sigma 線性性質，\\(\\sum(2a_k+3)=2\\sum a_k+\\sum3=2\\cdot${sA}+3\\cdot${n}=${value}\\)。其中 \\(\\sum a_k^2\\) 是干擾資訊。`);
          continue;
        }
        if (type === 1) {
          const n = randInt(10, 30);
          const a = randInt(2, 8);
          const b = pickNonZero(-8, 8);
          const value = a * sumFirstN(n) + b * n;
          questions.push(`題型二：線性性質與常數項處理。計算 \\(\\sum_{k=1}^{${n}}(${a}k${formatSignedAdd(b)})\\) 的總和。`);
          answers.push(`簡答：${value}。過程：\\(\\sum(${a}k${formatSignedAdd(b)})=${a}\\sum k${formatSignedAdd(b)}\\sum1=${a}\\cdot${sumFirstN(n)}${formatSignedAdd(b)}\\cdot${n}=${value}\\)。`);
          continue;
        }
        if (type === 2) {
          const n = randInt(6, 18);
          const sumPlus = randInt(30, 80);
          const sumMinus = randInt(4, 28);
          const value = (sumPlus + sumMinus) / 2;
          if (!Number.isInteger(value)) {
            i -= 1;
            continue;
          }
          questions.push(`題型二：線性性質與常數項處理。若 \\(\\sum_{k=1}^{${n}}(a_k+b_k)=${sumPlus}\\) 且 \\(\\sum_{k=1}^{${n}}(a_k-b_k)=${sumMinus}\\)，求 \\(\\sum_{k=1}^{${n}}a_k\\)。`);
          answers.push(`簡答：${value}。過程：兩式相加得 \\(2\\sum a_k=${sumPlus}+${sumMinus}=${sumPlus + sumMinus}\\)，所以 \\(\\sum a_k=${value}\\)。`);
          continue;
        }
        if (type === 3) {
          const n = randInt(20, 120);
          const value = 4 * sumFirstN(n);
          questions.push(`題型二：線性性質與常數項處理。求 \\(\\sum_{k=1}^{${n}}(k+1)^2-\\sum_{k=1}^{${n}}(k-1)^2\\)。`);
          answers.push(`簡答：${value}。過程：\\((k+1)^2-(k-1)^2=4k\\)，所以原式為 \\(\\sum_{k=1}^{${n}}4k=4\\cdot${sumFirstN(n)}=${4 * sumFirstN(n)}\\)。注意若題目寫成兩個 Sigma 相減，也可合併成同一個 Sigma 後再化簡。`);
          continue;
        }
        const n = randInt(5, 20);
        const value = n * n;
        questions.push(`題型二：線性性質與常數項處理。計算 \\(\\sum_{k=1}^{${n}}(2k-1)\\)，並說明其結果為何。`);
        answers.push(`簡答：${value}。過程：\\(\\sum(2k-1)=2\\sum k-\\sum1=2\\cdot${sumFirstN(n)}-${n}=${value}\\)，所以前 ${n} 個正奇數和為 \\(n^2\\)。`);
        continue;
      }

      if (mode === 2) {
        const type = i % 5;
        if (type === 0) {
          const n = randInt(5, 15);
          const value = makeFraction(n, n + 1);
          questions.push(`題型三：分式拆項對消。求 \\(\\sum_{k=1}^{${n}}\\frac{1}{k(k+1)}\\) 的總和。`);
          answers.push(`簡答：\\(${fractionText(value)}\\)。過程：\\(\\frac{1}{k(k+1)}=\\frac1k-\\frac{1}{k+1}\\)。展開後中間項全部抵消，剩下 \\(1-\\frac{1}{${n + 1}}=${fractionText(value)}\\)。`);
          continue;
        }
        if (type === 1) {
          const start = randInt(1, 4);
          const terms = randInt(5, 10);
          const end = start + 2 * (terms - 1);
          const value = makeFraction(terms, start * (end + 2));
          questions.push(`題型三：分式拆項對消。計算 \\(\\frac{1}{${start}\\cdot${start + 2}}+\\frac{1}{${start + 2}\\cdot${start + 4}}+\\cdots+\\frac{1}{${end}\\cdot${end + 2}}\\)。`);
          answers.push(`簡答：\\(${fractionText(value)}\\)。過程：\\(\\frac{1}{k(k+2)}=\\frac12(\\frac1k-\\frac{1}{k+2})\\)。逐項抵消後只剩首尾，結果為 \\(${fractionText(value)}\\)。`);
          continue;
        }
        if (type === 2) {
          const n = randInt(4, 12);
          const value = makeFraction(n, 2 * (n + 2));
          questions.push(`題型三：分式拆項對消。求 \\(\\sum_{k=1}^{${n}}\\frac{1}{k(k+2)}\\) 之和。`);
          answers.push(`簡答：\\(${fractionText(value)}\\)。過程：\\(\\frac{1}{k(k+2)}=\\frac12(\\frac1k-\\frac{1}{k+2})\\)。相消後得 \\(\\frac12(1+\\frac12-\\frac{1}{${n + 1}}-\\frac{1}{${n + 2}})=${fractionText(value)}\\)。`);
          continue;
        }
        if (type === 3) {
          const n = randInt(5, 18);
          if (isPerfectSquare(n + 1)) {
            i -= 1;
            continue;
          }
          const value = `${formatRadical(n + 1)}-1`;
          questions.push(`題型三：分式拆項對消。計算 \\(\\sum_{k=1}^{${n}}\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}\\)。`);
          answers.push(`簡答：\\(${value}\\)。過程：分母有理化，\\(\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}=\\sqrt{k+1}-\\sqrt{k}\\)。展開後對消，剩下 \\(\\sqrt{${n + 1}}-1=${value}\\)。`);
          continue;
        }
        const n = randInt(5, 15);
        const value = makeFraction(n * n + 2 * n, (n + 1) * (n + 1));
        questions.push(`題型三：分式拆項對消。求 \\(\\sum_{k=1}^{${n}}\\frac{2k+1}{k^2(k+1)^2}\\)。`);
        answers.push(`簡答：\\(${fractionText(value)}\\)。過程：\\(\\frac{2k+1}{k^2(k+1)^2}=\\frac{1}{k^2}-\\frac{1}{(k+1)^2}\\)。展開後抵消，剩下 \\(1-\\frac{1}{(${n}+1)^2}=${fractionText(value)}\\)。`);
        continue;
      }

      if (mode === 3) {
        const type = i % 5;
        if (type === 0) {
          const n = randInt(8, 20);
          const value = 100 * sumFirstN(n) - sumSquares(n);
          questions.push(`題型四：數列規律轉化為 Sigma 記號。將 \\(1\\cdot99+2\\cdot98+3\\cdot97+\\cdots+${n}\\cdot${100 - n}\\) 寫成 Sigma 記號並求和。`);
          answers.push(`簡答：\\(\\sum_{k=1}^{${n}}k(100-k)=${value}\\)。過程：第 \\(k\\) 項為 \\(k(100-k)\\)，所以總和為 \\(100\\sum k-\\sum k^2=100\\cdot${sumFirstN(n)}-${sumSquares(n)}=${value}\\)。`);
          continue;
        }
        if (type === 1) {
          const n = randInt(5, 16);
          const value = sumFirstN(n) + sumSquares(n);
          questions.push(`題型四：數列規律轉化為 Sigma 記號。計算 \\(1\\cdot2+2\\cdot3+3\\cdot4+\\cdots+${n}(${n + 1})\\)。`);
          answers.push(`簡答：${value}。過程：第 \\(k\\) 項為 \\(k(k+1)\\)，所以總和 \\(\\sum_{k=1}^{${n}}k(k+1)=\\sum k^2+\\sum k=${sumSquares(n)}+${sumFirstN(n)}=${value}\\)。`);
          continue;
        }
        if (type === 2) {
          const first = randInt(3, 9);
          const d = randInt(3, 6);
          const last = first + d * randInt(8, 16);
          const n = (last - first) / d + 1;
          const value = (n * (first + last)) / 2;
          questions.push(`題型四：數列規律轉化為 Sigma 記號。級數 \\(${first}+${first + d}+${first + 2 * d}+\\cdots+${last}\\) 請用 Sigma 符號表示並求和。`);
          answers.push(`簡答：\\(\\sum_{k=1}^{${n}}[${first}+${d}(k-1)]=${value}\\)。過程：一般項為 \\(${first}+${d}(k-1)\\)，共有 ${n} 項，所以和為 \\(\\frac{${n}(${first}+${last})}{2}=${value}\\)。`);
          continue;
        }
        if (type === 3) {
          const n = randInt(6, 12);
          const sum = (n * (n + 1) * (n + 2)) / 6;
          questions.push(`題型四：數列規律轉化為 Sigma 記號。求 \\((1)+(1+2)+(1+2+3)+\\cdots+(1+2+\\cdots+${n})\\) 的總和。`);
          answers.push(`簡答：${sum}。過程：第 \\(k\\) 組為 \\(1+2+\\cdots+k=\\frac{k(k+1)}2\\)，所以總和為 \\(\\sum_{k=1}^{${n}}\\frac{k(k+1)}2=${sum}\\)。`);
          continue;
        }
        const n = randInt(6, 12);
        let total = 0;
        for (let k = 1; k <= n; k += 1) total += (3 * k - 2) * (3 * k);
        questions.push(`題型四：數列規律轉化為 Sigma 記號。計算 \\(1\\cdot3+4\\cdot6+7\\cdot9+\\cdots\\) 前 ${n} 項和。`);
        answers.push(`簡答：${total}。過程：第 \\(k\\) 項為 \\((3k-2)(3k)\\)，所以總和為 \\(\\sum_{k=1}^{${n}}(3k-2)(3k)\\)。展開為 \\(\\sum(9k^2-6k)\\)，代入公式得 ${total}。`);
        continue;
      }

      const type = i % 5;
      if (type === 0) {
        const n = randInt(6, 14);
        const value = powInt(2, n + 1) - 2 + sumFirstN(n);
        questions.push(`題型五：多項式與指數混合型 Sigma。求 \\(\\sum_{k=1}^{${n}}(2^k+k)\\) 的值。`);
        answers.push(`簡答：${value}。過程：拆成 \\(\\sum2^k+\\sum k\\)。其中 \\(\\sum_{k=1}^{${n}}2^k=2^{${n + 1}}-2\\)，\\(\\sum k=${sumFirstN(n)}\\)，所以總和為 ${value}。`);
        continue;
      }
      if (type === 1) {
        const n = randInt(5, 10);
        const value = (powInt(3, n + 1) - 3) / 2 - 2 * sumFirstN(n) + n;
        questions.push(`題型五：多項式與指數混合型 Sigma。計算 \\(\\sum_{k=1}^{${n}}(3^k-2k+1)\\)。`);
        answers.push(`簡答：${value}。過程：拆成 \\(\\sum3^k-2\\sum k+\\sum1\\)。代入 \\(\\sum3^k=\\frac{3^{${n + 1}}-3}{2}\\)、\\(\\sum k=${sumFirstN(n)}\\)、\\(\\sum1=${n}\\)，得 ${value}。`);
        continue;
      }
      if (type === 2) {
        const n = randInt(4, 8);
        const x = randInt(2, 5);
        const y = randInt(1, 4);
        const value = powInt(x + y, n);
        questions.push(`題型五：多項式與指數混合型 Sigma。計算 \\(\\sum_{k=0}^{${n}}\\binom{${n}}{k}${x}^{${n}-k}${y}^{k}\\)。`);
        answers.push(`簡答：${value}。過程：由二項式定理，\\(\\sum_{k=0}^{n}\\binom{n}{k}x^{n-k}y^k=(x+y)^n\\)。所以原式為 \\((${x}+${y})^{${n}}=${value}\\)。`);
        continue;
      }
      if (type === 3) {
        const n = randInt(6, 12);
        const value = mulFraction(makeFraction(5, 1), subFraction(makeFraction(1, 1), powFraction(makeFraction(1, 2), n)));
        questions.push(`題型五：多項式與指數混合型 Sigma。求 \\(\\sum_{k=1}^{${n}}5\\cdot(\\frac12)^k\\) 的值。`);
        answers.push(`簡答：\\(${fractionText(value)}\\)。過程：這是首項 \\(\\frac52\\)、公比 \\(\\frac12\\) 的等比級數；或直接用公式 \\(5\\sum_{k=1}^{${n}}(\\frac12)^k=5(1-(\\frac12)^{${n}})=${fractionText(value)}\\)。`);
        continue;
      }
      const n = randInt(5, 10);
      const value = n + 1;
      questions.push(`題型五：多項式與指數混合型 Sigma。計算 \\(\\sum_{k=1}^{${n}}[(k+1)!-k!]\\)。`);
      answers.push(`簡答：\\(${n + 1}!-1\\)。過程：這是階乘型望遠鏡和，展開後 \\((2!-1!)+(3!-2!)+\\cdots+((${n}+1)!-${n}!)\\)，中間項抵消，剩下 \\((${n}+1)!-1!\\)，即 \\(${n + 1}!-1\\)。`);
    }

    return { questions, answers };
  }

  function buildS212SigmaFormulaRangeSet(count) {
    return buildS212SigmaFiveSubtypeMixedSet(count, 0);
  }

  function buildS212SigmaLinearitySet(count) {
    return buildS212SigmaFiveSubtypeMixedSet(count, 1);
  }

  function buildS212SigmaTelescopingSet(count) {
    return buildS212SigmaFiveSubtypeMixedSet(count, 2);
  }

  function buildS212SigmaPatternSet(count) {
    return buildS212SigmaFiveSubtypeMixedSet(count, 3);
  }

  function buildS212SigmaMixedSet(count) {
    return buildS212SigmaFiveSubtypeMixedSet(count, 4);
  }

  function fracTextForDisplay(frac) {
    return formatFraction(frac.num, frac.den);
  }

  function pickGeometricRatio(options = {}) {
    const pool = options.allowFraction
      ? [
          makeFraction(2),
          makeFraction(3),
          makeFraction(-2),
          makeFraction(-3),
          makeFraction(1, 2),
          makeFraction(2, 3),
          makeFraction(-1, 2),
          makeFraction(-2, 3),
        ]
      : [makeFraction(2), makeFraction(3), makeFraction(4), makeFraction(-2), makeFraction(-3)];
    return pool[randInt(0, pool.length - 1)];
  }

  function apSumFromFirstLast(n, first, last) {
    return (n * (first + last)) / 2;
  }

  function firstInRangeByRemainder(start, divisor, remainder) {
    const mod = ((remainder % divisor) + divisor) % divisor;
    const offset = (mod - (start % divisor) + divisor) % divisor;
    return start + offset;
  }

  function buildJ413SeriesFormulaCoreSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a1 = pickNonZero(-18, 24);
        const d = pickNonZero(-8, 8);
        const n = randInt(8, 24);
        const an = a1 + (n - 1) * d;
        const sum = apSumFromFirstLast(n, a1, an);
        questions.push(`已知一等差級數的首項為 ${a1}，公差為 ${d}，求前 ${n} 項和 \\(${latexSub('S', n)}\\)。`);
        answers.push(
          `簡答：\\(${latexSub('S', n)}=${sum}\\)。過程：第 ${n} 項 \\(${latexSub('a', n)}=a_1+(${n}-1)d=${a1}+${n - 1}\\cdot(${d})=${an}\\)，所以 \\(${latexSub('S', n)}=\\frac{${n}(${formatPairSum(a1, an)})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a1 = pickNonZero(-20, 20);
        const d = pickNonZero(-7, 7);
        const n = randInt(9, 22);
        const an = a1 + (n - 1) * d;
        const sum = apSumFromFirstLast(n, a1, an);
        questions.push(`等差級數 ${formatApListLatex(a1, d)} 中，求前 ${n} 項和。`);
        answers.push(
          `簡答：${sum}。過程：首項為 ${a1}，公差為 ${d}，末項 \\(${latexSub('a', n)}=${a1}+${n - 1}\\cdot(${d})=${an}\\)，故 \\(${latexSub('S', n)}=\\frac{${n}(${formatPairSum(a1, an)})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a1 = pickNonZero(-25, 25);
        const n = randInt(8, 20);
        const an = a1 + (n - 1) * pickNonZero(-6, 6);
        const sum = apSumFromFirstLast(n, a1, an);
        questions.push(`已知一等差級數的首項為 ${a1}，第 ${n} 項為 ${an}，求前 ${n} 項和 \\(${latexSub('S', n)}\\)。`);
        answers.push(
          `簡答：\\(${latexSub('S', n)}=${sum}\\)。過程：已知首項與末項，可直接配對求和：\\(${latexSub('S', n)}=\\frac{${n}(${formatPairSum(a1, an)})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const n = randInt(8, 18);
        const d = pickNonZero(-6, 6);
        const a1 = pickNonZero(-18, 24);
        const an = a1 + (n - 1) * d;
        const sumN = apSumFromFirstLast(n, a1, an);
        const m = n + randInt(8, 22);
        const am = a1 + (m - 1) * d;
        const sumM = apSumFromFirstLast(m, a1, am);
        questions.push(
          `設一等差級數的前 ${n} 項和為 ${sumN}，前 ${m} 項和為 ${sumM}，且首項為 ${a1}，求此級數的公差。`
        );
        answers.push(
          `簡答：公差 \\(d=${d}\\)。過程：由 \\(S_n=\\frac{n[2a_1+(n-1)d]}{2}\\)，代入 \\(${sumN}=\\frac{${n}[2\\cdot${a1}+${n - 1}d]}{2}\\)，解得 \\(d=${d}\\)；再代入前 ${m} 項和可驗算為 ${sumM}。`
        );
        continue;
      }
      const a1 = randInt(2, 14);
      const d = randInt(2, 7);
      const n = randInt(10, 20);
      const an = a1 + (n - 1) * d;
      const sum = apSumFromFirstLast(n, a1, an);
      questions.push(`已知等差級數首項為 ${a1}，末項為 ${an}，總和為 ${sum}，求此級數共有幾項。`);
      answers.push(
        `簡答：${n} 項。過程：設共有 \\(n\\) 項，\\(S_n=\\frac{n(${formatPairSum(a1, an)})}{2}=${sum}\\)，所以 \\(n=\\frac{2\\cdot${sum}}{${formatPairSum(a1, an)}}=${n}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ413RangeMultipleSumSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const divisor = [4, 5, 6, 8, 9, 10, 12][randInt(0, 6)];
        const start = randInt(1, 120);
        const end = start + randInt(180, 520);
        const first = firstInRangeByRemainder(start, divisor, 0);
        const last = end - (((end % divisor) - 0 + divisor) % divisor);
        const n = (last - first) / divisor + 1;
        const sum = apSumFromFirstLast(n, first, last);
        questions.push(`求 ${start} 到 ${end} 的整數中，所有 ${divisor} 的倍數之總和。`);
        answers.push(
          `簡答：${sum}。過程：第一個倍數是 ${first}，最後一個倍數是 ${last}，公差為 ${divisor}，項數 \\(n=\\frac{${last}-${first}}{${divisor}}+1=${n}\\)，總和 \\(S=\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const divisor = [5, 6, 7, 8, 9, 11, 13][randInt(0, 6)];
        const remainder = randInt(1, divisor - 1);
        const start = randInt(40, 180);
        const end = start + randInt(160, 420);
        const first = firstInRangeByRemainder(start, divisor, remainder);
        const last = end - (((end % divisor) - remainder + divisor) % divisor);
        const n = (last - first) / divisor + 1;
        const sum = apSumFromFirstLast(n, first, last);
        questions.push(`求 ${start} 到 ${end} 的整數中，除以 ${divisor} 餘 ${remainder} 的所有整數之和。`);
        answers.push(
          `簡答：${sum}。過程：符合條件的數形成等差數列，首項 ${first}、末項 ${last}、公差 ${divisor}，項數 \\(\\frac{${last}-${first}}{${divisor}}+1=${n}\\)，所以總和為 \\(\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const start = randInt(1, 80);
        const end = start + randInt(80, 180);
        const first = start % 2 === 1 ? start : start + 1;
        const last = end % 2 === 1 ? end : end - 1;
        const n = (last - first) / 2 + 1;
        const sum = apSumFromFirstLast(n, first, last);
        questions.push(`求 ${start} 到 ${end} 的整數中，所有奇數的總和。`);
        answers.push(
          `簡答：${sum}。過程：奇數依序為 ${first}, ${first + 2}, ${first + 4}, \\ldots, ${last}，項數 \\(\\frac{${last}-${first}}{2}+1=${n}\\)，總和 \\(\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const divisor = [3, 4, 5, 6, 7][randInt(0, 4)];
        const remainder = randInt(1, divisor - 1);
        const start = randInt(20, 120);
        const end = start + randInt(120, 320);
        const first = firstInRangeByRemainder(start, divisor, remainder);
        const last = end - (((end % divisor) - remainder + divisor) % divisor);
        const n = (last - first) / divisor + 1;
        const sum = apSumFromFirstLast(n, first, last);
        questions.push(`求 ${start} 到 ${end} 的整數中，除以 ${divisor} 餘 ${remainder} 的整數共有幾個？其總和為何？`);
        answers.push(
          `簡答：共 ${n} 個，總和 ${sum}。過程：首項 ${first}、末項 ${last}、公差 ${divisor}，所以項數 \\(\\frac{${last}-${first}}{${divisor}}+1=${n}\\)，總和 \\(\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
        );
        continue;
      }
      const divisor = [7, 11, 13][randInt(0, 2)];
      const start = randInt(100, 260);
      const end = start + randInt(380, 740);
      const first = firstInRangeByRemainder(start, divisor, 0);
      const last = end - (((end % divisor) + divisor) % divisor);
      const n = (last - first) / divisor + 1;
      const sum = apSumFromFirstLast(n, first, last);
      questions.push(`求 ${start} 到 ${end} 的整數中，能被 ${divisor} 整除的數共有幾個？其總和為何？`);
      answers.push(
        `簡答：共 ${n} 個，總和 ${sum}。過程：符合條件的第一個數是 ${first}，最後一個數是 ${last}，公差 ${divisor}，故項數為 ${n}，總和為 \\(\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ413MaxMinSumSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const dAbs = randInt(2, 7);
        let a1 = randInt(30, 85);
        while (a1 % dAbs === 0) a1 = randInt(30, 85);
        const d = -dAbs;
        const firstNegativeIndex = Math.floor(a1 / dAbs) + 2;
        const lastPositiveIndex = firstNegativeIndex - 1;
        const lastPositive = a1 + (lastPositiveIndex - 1) * d;
        const maxSum = apSumFromFirstLast(lastPositiveIndex, a1, lastPositive);
        questions.push(
          `有一等差級數為 ${formatApListLatex(a1, d)}，求：(1) 從第幾項開始為負數？(2) 前幾項的和最大？最大值為多少？`
        );
        answers.push(
          `簡答：(1) 第 ${firstNegativeIndex} 項開始為負數；(2) 前 ${lastPositiveIndex} 項和最大，最大值 ${maxSum}。過程：\\(a_n=${formatApNthFormula(a1, d)}\\)。解 \\(a_n<0\\) 得第一個負項為第 ${firstNegativeIndex} 項；最大和要加到最後一個正項，第 ${lastPositiveIndex} 項為 ${lastPositive}，所以最大和 \\(\\frac{${lastPositiveIndex}(${formatPairSum(a1, lastPositive)})}{2}=${maxSum}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const d = randInt(3, 8);
        const firstPositiveIndex = randInt(8, 18);
        let a1 = -d * (firstPositiveIndex - 1) + randInt(1, d);
        while (Math.abs(a1) % d === 0) {
          a1 = -d * (firstPositiveIndex - 1) + randInt(1, d);
        }
        const lastNegativeIndex = firstPositiveIndex - 1;
        const lastNegative = a1 + (lastNegativeIndex - 1) * d;
        const minSum = apSumFromFirstLast(lastNegativeIndex, a1, lastNegative);
        questions.push(`等差級數首項為 ${a1}，公差為 ${d}。若前 \\(n\\) 項和會先變小再變大，求 \\(S_n\\) 的最小值。`);
        answers.push(
          `簡答：最小值 ${minSum}。過程：\\(a_n=${formatApNthFormula(a1, d)}\\)。前面都是負項時，總和會越加越小；第一個正項是第 ${firstPositiveIndex} 項，所以最小和在前 ${lastNegativeIndex} 項，\\(${latexSub('S', lastNegativeIndex)}=\\frac{${lastNegativeIndex}(${formatPairSum(a1, lastNegative)})}{2}=${minSum}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const d = -randInt(2, 6);
        let a1 = randInt(35, 85);
        while (a1 % Math.abs(d) === 0) a1 = randInt(35, 85);
        const peakN = Math.floor((a1 - 1) / Math.abs(d)) + 1;
        const an = a1 + (peakN - 1) * d;
        const sum = apSumFromFirstLast(peakN, a1, an);
        questions.push(`已知等差級數首項為 ${a1}，公差為 ${d}，求前幾項和最大？最大值為何？`);
        answers.push(
          `簡答：前 ${peakN} 項和最大，最大值 ${sum}。過程：因為公差為負，項會逐漸變小；和最大時加到最後一個正項。第 ${peakN} 項為 ${an}，下一項為 ${an + d}<0，所以最大和為 \\(${latexSub('S', peakN)}=\\frac{${peakN}(${formatPairSum(a1, an)})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const d = randInt(2, 7);
        let a1 = -randInt(20, 70);
        while (Math.abs(a1) % d === 0) a1 = -randInt(20, 70);
        const firstPositiveIndex = Math.floor(-a1 / d) + 2;
        const lastNegativeIndex = firstPositiveIndex - 1;
        const lastNegative = a1 + (lastNegativeIndex - 1) * d;
        const minSum = apSumFromFirstLast(lastNegativeIndex, a1, lastNegative);
        questions.push(`等差級數 ${formatApListLatex(a1, d)}，若前 \\(n\\) 項和為負數，則 \\(S_n\\) 的最小值為何？`);
        answers.push(
          `簡答：${minSum}。過程：首項為負且公差為正，累加到最後一個負項時總和最小。第 ${lastNegativeIndex} 項為 ${lastNegative}，第 ${firstPositiveIndex} 項開始為正，所以最小值 \\(${latexSub('S', lastNegativeIndex)}=\\frac{${lastNegativeIndex}(${formatPairSum(a1, lastNegative)})}{2}=${minSum}\\)。`
        );
        continue;
      }
      const d = -randInt(2, 6);
      let a1 = randInt(35, 80);
      while (a1 % Math.abs(d) === 0) a1 = randInt(35, 80);
      const lastPositiveIndex = Math.floor((a1 - 1) / Math.abs(d)) + 1;
      const lastPositive = a1 + (lastPositiveIndex - 1) * d;
      const maxSum = apSumFromFirstLast(lastPositiveIndex, a1, lastPositive);
      questions.push(`已知等差級數首項為 ${a1}，公差為 ${d}，求前幾項和最大？此最大值為多少？`);
      answers.push(
        `簡答：前 ${lastPositiveIndex} 項和最大，最大值 ${maxSum}。過程：\\(a_n=${formatApNthFormula(a1, d)}\\)，最後一個正項是第 ${lastPositiveIndex} 項，值為 ${lastPositive}；再下一項為 ${lastPositive + d}<0，所以最大和為 \\(\\frac{${lastPositiveIndex}(${formatPairSum(a1, lastPositive)})}{2}=${maxSum}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ413WordApplicationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const rows = randInt(12, 28);
        const first = randInt(10, 35);
        const d = randInt(2, 5);
        const last = first + (rows - 1) * d;
        const total = apSumFromFirstLast(rows, first, last);
        questions.push(
          `某表演廳共有 ${rows} 排座位，第一排有 ${first} 個座位，每一排比前一排多 ${d} 個，求全廳總座位數。`
        );
        answers.push(
          `簡答：${total} 個座位。過程：各排座位數形成等差數列，首項 ${first}、公差 ${d}、第 ${rows} 排 ${last} 個，所以總數 \\(${latexSub('S', rows)}=\\frac{${rows}(${first}+${last})}{2}=${total}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const days = randInt(10, 21);
        const first = randInt(3, 15);
        const d = randInt(2, 8);
        const last = first + (days - 1) * d;
        const total = apSumFromFirstLast(days, first, last);
        questions.push(`小哲第一天存 ${first} 元，之後每天都比前一天多存 ${d} 元，連續存 ${days} 天後，共存了多少元？`);
        answers.push(
          `簡答：${total} 元。過程：每天存款為等差數列，末日金額 ${last} 元，故總存款 \\(\\frac{${days}(${first}+${last})}{2}=${total}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const layers = randInt(6, 18);
        const top = randInt(1, 6);
        const d = randInt(1, 4);
        const bottom = top + (layers - 1) * d;
        const total = apSumFromFirstLast(layers, top, bottom);
        questions.push(`大賣場將罐頭堆成 ${layers} 層，最上層有 ${top} 罐，每往下一層多 ${d} 罐，求共有幾罐。`);
        answers.push(
          `簡答：${total} 罐。過程：每層罐數為等差數列，最下層 ${bottom} 罐，總罐數 \\(\\frac{${layers}(${top}+${bottom})}{2}=${total}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const seconds = randInt(6, 14);
        const first = randInt(3, 8);
        const d = randInt(3, 10);
        const last = first + (seconds - 1) * d;
        const total = apSumFromFirstLast(seconds, first, last);
        questions.push(
          `一物體第 1 秒落下 ${first} 公尺，之後每一秒比前一秒多落下 ${d} 公尺，求 ${seconds} 秒內共下落多少公尺。`
        );
        answers.push(
          `簡答：${total} 公尺。過程：每秒距離形成等差數列，第 ${seconds} 秒落下 ${last} 公尺，所以總距離 \\(\\frac{${seconds}(${first}+${last})}{2}=${total}\\)。`
        );
        continue;
      }
      const awards = randInt(6, 15);
      const first = randInt(120, 500);
      const d = randInt(50, 300);
      const total = apSumFromFirstLast(awards, first, first + (awards - 1) * d);
      const top = first + (awards - 1) * d;
      questions.push(
        `某公司發放獎金，共 ${awards} 個獎項且金額成等差數列。已知最小獎為 ${first} 元，每一級多 ${d} 元，求最大獎與總獎金。`
      );
      answers.push(
        `簡答：最大獎 ${top} 元，總獎金 ${total} 元。過程：最大獎為第 ${awards} 項，\\(${first}+${awards - 1}\\cdot${d}=${top}\\)；總獎金 \\(\\frac{${awards}(${first}+${top})}{2}=${total}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ413SnRelationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(1, 5);
        const q = pickNonZero(-8, 12);
        const n = randInt(6, 15);
        const an = p * (2 * n - 1) + q;
        questions.push(`已知一等差級數前 \\(n\\) 項和 \\(S_n=${formatSnQuadratic(p, q)}\\)，求此數列的第 ${n} 項。`);
        answers.push(
          `簡答：\\(${latexSub('a', n)}=${an}\\)。過程：\\(a_n=S_n-S_{n-1}\\)。所以 \\(a_n=${formatSnQuadratic(p, q)}-[${p === 1 ? '' : p}(n-1)^2${q === 0 ? '' : `${formatSignedAdd(q)}(n-1)`}]=${formatLinearN(2 * p, q - p)}\\)，代入 \\(n=${n}\\) 得 ${an}。`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 6);
        const q = pickNonZero(-10, 14);
        const n = randInt(5, 12);
        const an = p * (2 * n - 1) + q;
        const d = 2 * p;
        questions.push(`設等差級數前 \\(n\\) 項和 \\(S_n=${formatSnQuadratic(p, q)}\\)，求第 ${n} 項及公差。`);
        answers.push(
          `簡答：\\(${latexSub('a', n)}=${an}\\)，公差 \\(d=${d}\\)。過程：\\(a_n=S_n-S_{n-1}=${formatLinearN(2 * p, q - p)}\\)，代入 ${n} 得 ${an}；因 \\(a_n\\) 的一次式係數為 ${2 * p}，故公差為 ${d}。`
        );
        continue;
      }
      if (mode === 2) {
        const d = [2, 4, 6, 8, 10][randInt(0, 4)];
        const p = d / 2;
        const q = pickNonZero(-8, 10);
        questions.push(`若一等差級數前 \\(n\\) 項和為 \\(S_n=${formatSnQuadratic(p, q)}\\)，求其公差 \\(d\\)。`);
        answers.push(
          `簡答：\\(d=${d}\\)。過程：\\(a_n=S_n-S_{n-1}=${formatLinearN(2 * p, q - p)}\\)，所以相鄰兩項差固定為一次式係數 ${2 * p}，即公差 ${d}。`
        );
        continue;
      }
      if (mode === 3) {
        const a1 = pickNonZero(-12, 18);
        const d = pickNonZero(2, 8);
        const s12 = apSumFromFirstLast(12, a1, a1 + 11 * d);
        const s13 = apSumFromFirstLast(13, a1, a1 + 12 * d);
        const a13 = s13 - s12;
        questions.push(`已知等差級數 \\(S_{12}=${s12}\\)、\\(S_{13}=${s13}\\)，求此數列的第 13 項。`);
        answers.push(
          `簡答：\\(a_{13}=${a13}\\)。過程：\\(S_{13}\\) 比 \\(S_{12}\\) 多出第 13 項，所以 \\(a_{13}=S_{13}-S_{12}=${s13}-${s12}=${a13}\\)。`
        );
        continue;
      }
      let p1 = randInt(1, 5);
      let q1 = pickNonZero(-6, 10);
      let p2 = randInt(1, 5);
      let q2 = pickNonZero(-6, 10);
      const askN = randInt(3, 8);
      let a = p1 * (2 * askN - 1) + q1;
      let b = p2 * (2 * askN - 1) + q2;
      while (a <= 0 || b <= 0) {
        p1 = randInt(1, 5);
        q1 = pickNonZero(-6, 10);
        p2 = randInt(1, 5);
        q2 = pickNonZero(-6, 10);
        a = p1 * (2 * askN - 1) + q1;
        b = p2 * (2 * askN - 1) + q2;
      }
      const g = gcdInt(a, b);
      const ra = a / g;
      const rb = b / g;
      questions.push(
        `若兩個等差級數的前 \\(n\\) 項和分別為 \\(S_n=${formatSnQuadratic(p1, q1)}\\)、\\(T_n=${formatSnQuadratic(p2, q2)}\\)，求兩數列第 ${askN} 項的比。`
      );
      answers.push(
        `簡答：${ra}:${rb}。過程：第 \\(n\\) 項為前 \\(n\\) 項和減前 \\(n-1\\) 項和。故 \\(${latexSub('a', askN)}=${a}\\)，\\(${latexSub('b', askN)}=${b}\\)，比為 ${a}:${b}=${ra}:${rb}。`
      );
    }
    return { questions, answers };
  }

  function buildJ413ArithmeticSeriesMixedSet(count) {
    const banks = [
      buildJ413SeriesFormulaCoreSet,
      buildJ413RangeMultipleSumSet,
      buildJ413MaxMinSumSet,
      buildJ413WordApplicationSet,
      buildJ413SnRelationSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ412GeometricNthTermSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      let a1;
      let r;
      let n;
      if (mode === 0) {
        a1 = makeFraction(pickNonZero(2, 12), 1);
        r = [makeFraction(2), makeFraction(3), makeFraction(-2)][randInt(0, 2)];
        n = randInt(4, 7);
      } else if (mode === 1) {
        a1 = makeFraction(pickNonZero(-9, 9), 1);
        r = [makeFraction(-2), makeFraction(-3), makeFraction(2), makeFraction(3)][randInt(0, 3)];
        n = randInt(4, 6);
      } else if (mode === 2) {
        a1 = makeFraction([1, 2, 3, 4, 5][randInt(0, 4)], [2, 3, 4][randInt(0, 2)]);
        r = [makeFraction(2), makeFraction(3), makeFraction(-2)][randInt(0, 2)];
        n = randInt(4, 7);
      } else if (mode === 3) {
        const den = [2, 3, 4, 5][randInt(0, 3)];
        a1 = makeFraction(pickNonZero(-6, 6), den);
        r = [makeFraction(-2), makeFraction(2), makeFraction(-3)][randInt(0, 2)];
        n = randInt(4, 7);
      } else {
        r = [makeFraction(1, 2), makeFraction(2, 3), makeFraction(3, 4), makeFraction(-1, 2)][randInt(0, 3)];
        n = randInt(4, 7);
        const scale = powInt(r.den, n - 1);
        a1 = makeFraction(pickNonZero(1, 8) * scale, 1);
      }
      const an = geometricTerm(a1, r, n);
      questions.push(
        `已知一等比數列的首項 \\(a_1=${formatGeometricTermLatex(a1)}\\)，公比 \\(r=${formatRatioLatex(r)}\\)，求第 ${n} 項 \\(${latexSub('a', n)}\\)。`
      );
      answers.push(
        `簡答：\\(${latexSub('a', n)}=${formatGeometricTermLatex(an)}\\)。過程：\\(${latexSub('a', n)}=a_1r^{${n - 1}}=${formatGeometricNthFormula(a1, r, n)}=${formatGeometricTermLatex(an)}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ412FindRatioFirstTermSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a1 = makeFraction(pickNonZero(1, 8), 1);
        const r = [makeFraction(2), makeFraction(3), makeFraction(-2), makeFraction(-3)][randInt(0, 3)];
        const m = randInt(2, 4);
        const n = m + 1;
        const am = geometricTerm(a1, r, m);
        const an = geometricTerm(a1, r, n);
        questions.push(
          `設一等比數列的第 ${m} 項為 ${formatGeometricTermLatex(am)}，第 ${n} 項為 ${formatGeometricTermLatex(an)}，求公比 \\(r\\)。`
        );
        answers.push(
          `簡答：\\(r=${formatRatioLatex(r)}\\)。過程：相鄰兩項相除，\\(r=\\frac{a_${n}}{a_${m}}=${formatGeometricTermLatex(an)}\\div ${formatGeometricTermLatex(am)}=${formatRatioLatex(r)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const r = [makeFraction(2), makeFraction(-2), makeFraction(3), makeFraction(-3)][randInt(0, 3)];
        const a1 = makeFraction(pickNonZero(1, 6), 1);
        const m = randInt(2, 4);
        const n = m + 3;
        const am = geometricTerm(a1, r, m);
        const an = geometricTerm(a1, r, n);
        questions.push(
          `已知一等比數列的第 ${m} 項為 ${formatGeometricTermLatex(am)}，第 ${n} 項為 ${formatGeometricTermLatex(an)}，且公比為整數，求公比 \\(r\\)。`
        );
        answers.push(
          `簡答：\\(r=${formatRatioLatex(r)}\\)。過程：\\(\\frac{${latexSub('a', n)}}{${latexSub('a', m)}}=r^{${n - m}}\\)，所以 \\(r^${n - m}=${formatGeometricTermLatex(an)}\\div ${formatGeometricTermLatex(am)}=${formatRatioLatex(powFraction(r, n - m))}\\)。因為 ${n - m} 是奇數，符號可一起判定，得 \\(r=${formatRatioLatex(r)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a1 = makeFraction(pickNonZero(2, 10), 1);
        const r = [makeFraction(2), makeFraction(3), makeFraction(-2)][randInt(0, 2)];
        const m = randInt(3, 5);
        const am = geometricTerm(a1, r, m);
        questions.push(
          `已知一等比數列的第 ${m} 項為 ${formatGeometricTermLatex(am)}，公比 \\(r=${formatRatioLatex(r)}\\)，求首項 \\(a_1\\)。`
        );
        answers.push(
          `簡答：\\(a_1=${formatGeometricTermLatex(a1)}\\)。過程：\\(a_${m}=a_1r^{${m - 1}}\\)，所以 \\(a_1=${formatGeometricTermLatex(am)}\\div ${formatFractionLatexForFactor(r)}^{${m - 1}}=${formatGeometricTermLatex(a1)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const r = [makeFraction(1, 2), makeFraction(2, 3), makeFraction(-1, 2)][randInt(0, 2)];
        const m = randInt(3, 5);
        const a1 = makeFraction(pickNonZero(1, 7) * powInt(r.den, m - 1), 1);
        const am = geometricTerm(a1, r, m);
        questions.push(
          `已知一等比數列的第 ${m} 項為 ${formatGeometricTermLatex(am)}，公比 \\(r=${formatRatioLatex(r)}\\)，求首項 \\(a_1\\)。`
        );
        answers.push(
          `簡答：\\(a_1=${formatGeometricTermLatex(a1)}\\)。過程：\\(a_${m}=a_1r^{${m - 1}}\\)，所以 \\(a_1=${formatGeometricTermLatex(am)}\\div ${formatFractionLatexForFactor(r)}^{${m - 1}}=${formatGeometricTermLatex(a1)}\\)。`
        );
        continue;
      }
      const a1 = makeFraction(pickNonZero(1, 9), 1);
      const r = [makeFraction(-2), makeFraction(-3), makeFraction(2), makeFraction(3)][randInt(0, 3)];
      const m = [4, 6][randInt(0, 1)];
      const am = geometricTerm(a1, r, m);
      questions.push(
        `一等比數列的首項為 ${formatGeometricTermLatex(a1)}，第 ${m} 項為 ${formatGeometricTermLatex(am)}，求公比 \\(r\\)。`
      );
      answers.push(
        `簡答：\\(r=${formatRatioLatex(r)}\\)。過程：\\(a_${m}=a_1r^{${m - 1}}\\)，所以 \\(r^{${m - 1}}=${formatGeometricTermLatex(am)}\\div ${formatGeometricTermLatex(a1)}=${formatRatioLatex(powFraction(r, m - 1))}\\)。因為 ${m - 1} 是奇數，符號可一起判定，得 \\(r=${formatRatioLatex(r)}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ412GeometricMeanUnknownSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = randInt(2, 12);
        const c = a * [4, 9, 16][randInt(0, 2)];
        const yAbs = Math.sqrt(a * c);
        questions.push(`已知 ${a} 與 ${c} 的等比中項為 \\(y\\)，求 \\(y\\) 的值。`);
        answers.push(
          `簡答：\\(y=\\pm ${yAbs}\\)。過程：三數成等比時，中項平方等於兩端乘積，\\(y^2=${a}\\cdot${c}=${a * c}\\)，所以 \\(y=\\pm ${yAbs}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const [leftShift, rightShift] = [
          [2, 4],
          [3, 6],
          [3, 4],
          [4, 6],
        ][randInt(0, 3)];
        const x = (leftShift * rightShift) / (rightShift - leftShift);
        const linearCoeff = rightShift - leftShift;
        const linearLeft = linearCoeff === 1 ? 'x' : `${linearCoeff}x`;
        questions.push(`若 \\(x-${leftShift},\\ x,\\ x+${rightShift}\\) 三數成等比數列，求 \\(x\\) 之值。`);
        answers.push(
          `簡答：\\(x=${x}\\)。過程：三數成等比時，中項平方等於兩端乘積，\\(x^2=(x-${leftShift})(x+${rightShift})\\)。展開後消去 \\(x^2\\)，得 \\(${linearLeft}=${leftShift * rightShift}\\)，所以 \\(x=${x}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const x = [2, 3, 4, 5, 6][randInt(0, 4)];
        const ratio = [2, 3, 4][randInt(0, 2)];
        const middle = x * ratio;
        const last = x * ratio * ratio;
        questions.push(`若 \\(x,\\ ${middle},\\ ${last}\\) 三數成等比數列，且各項皆為正數，求 \\(x\\) 之值。`);
        answers.push(
          `簡答：\\(x=${x}\\)。過程：中項平方等於兩端乘積，\\(${middle}^2=x\\cdot${last}\\)，所以 \\(x=\\frac{${middle * middle}}{${last}}=${x}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const a = [2, 3, 5, 6][randInt(0, 3)];
        const c = a * [8, 18, 32][randInt(0, 2)];
        const product = a * c;
        const root = formatRadical(product);
        questions.push(`求 \\(${a}\\) 與 \\(${c}\\) 的等比中項。`);
        answers.push(
          `簡答：\\(\\pm ${root}\\)。過程：設等比中項為 \\(y\\)，則 \\(y^2=${a}\\cdot${c}=${product}\\)，所以 \\(y=\\pm ${root}\\)。`
        );
        continue;
      }
      const first = -[2, 3, 4, 5][randInt(0, 3)];
      const last = first * [4, 9, 16][randInt(0, 2)];
      const product = first * last;
      const mAbs = Math.sqrt(product);
      questions.push(`已知 \\(${first},\\ m,\\ ${last}\\) 三數成等比數列，求 \\(m\\) 的值。`);
      answers.push(
        `簡答：\\(m=\\pm ${mAbs}\\)。過程：若三數成等比，必須 \\(m^2=${first}\\cdot${last}=${product}\\)，所以 \\(m=\\pm ${mAbs}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ412TermIndexSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const r =
        mode === 1
          ? makeFraction(1, [2, 3, 5][randInt(0, 2)])
          : [makeFraction(2), makeFraction(3), makeFraction(-2), makeFraction(-3)][randInt(0, 3)];
      const a1 = mode === 1 ? makeFraction(powInt(r.den, randInt(3, 5)), 1) : makeFraction(pickNonZero(1, 7), 1);
      const n = randInt(4, 8);
      const an = geometricTerm(a1, r, n);
      if (mode === 0 || mode === 1) {
        questions.push(
          `等比數列 ${formatGeometricListLatex(a1, r)}，請問 ${inlineMath(formatGeometricTermLatex(an))} 是該數列的第幾項？`
        );
        answers.push(
          `簡答：第 ${n} 項。過程：\\(${formatGeometricTermLatex(an)}=${formatGeometricTermLatex(a1)}\\cdot ${formatFractionLatexForFactor(r)}^{${n - 1}}\\)，所以它是第 ${n} 項。`
        );
        continue;
      }
      if (mode === 2) {
        const miss = mulFraction(an, r);
        questions.push(
          `等比數列 ${formatGeometricListLatex(a1, r)}，請問 ${inlineMath(formatGeometricTermLatex(miss))} 是該數列的第幾項？`
        );
        answers.push(
          `簡答：第 ${n + 1} 項。過程：從首項開始乘公比，\\(${formatGeometricTermLatex(miss)}=${formatGeometricTermLatex(a1)}\\cdot ${formatFractionLatexForFactor(r)}^{${n}}\\)，所以是第 ${n + 1} 項。`
        );
        continue;
      }
      if (mode === 3) {
        const target = geometricTerm(a1, r, n);
        questions.push(
          `已知一等比數列的首項為 ${formatGeometricTermLatex(a1)}，公比為 ${formatRatioLatex(r)}，若某一項為 ${inlineMath(formatGeometricTermLatex(target))}，求它是第幾項。`
        );
        answers.push(
          `簡答：第 ${n} 項。過程：\\(a_n=${formatGeometricTermLatex(a1)}\\cdot ${formatFractionLatexForFactor(r)}^{n-1}\\)。比對 ${formatGeometricTermLatex(target)} 可得 \\(n-1=${n - 1}\\)，所以 \\(n=${n}\\)。`
        );
        continue;
      }
      const notTerm = addFraction(an, makeFraction(1, 1));
      questions.push(
        `等比數列 ${formatGeometricListLatex(a1, r)}，請問 ${inlineMath(formatGeometricTermLatex(notTerm))} 是不是此數列的一項？`
      );
      answers.push(
        `簡答：不是。過程：相鄰項都固定乘以 \\(r=${formatRatioLatex(r)}\\)，而 ${formatGeometricTermLatex(notTerm)} 介於已生成的等比項附近，無法寫成 \\(${formatGeometricTermLatex(a1)}\\cdot ${formatFractionLatexForFactor(r)}^k\\)（\\(k\\) 為非負整數），所以不是。`
      );
    }
    return { questions, answers };
  }

  function buildJ412WordApplicationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const hours = randInt(5, 10);
        const initial = randInt(1, 5);
        const total = initial * powInt(2, hours);
        questions.push(`細菌分裂：某種細菌每小時分裂為 2 個，若一開始有 ${initial} 個，則 ${hours} 小時後共有多少個？`);
        answers.push(
          `簡答：${total} 個。過程：每小時乘以 2，形成等比數列；${hours} 小時後為 \\(${initial}\\cdot 2^{${hours}}=${total}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const folds = randInt(3, 7);
        const numerator = [1, 2, 3, 5][randInt(0, 3)];
        const denominator = [1000, 2000, 4000][randInt(0, 2)];
        const start = makeFraction(numerator, denominator);
        const total = mulFraction(start, makeFraction(powInt(2, folds), 1));
        questions.push(
          `摺紙厚度：一張紙厚度為 \\(${formatGeometricTermLatex(start)}\\) 公分，對摺 ${folds} 次後，總厚度為多少公分？`
        );
        answers.push(
          `簡答：\\(${formatGeometricTermLatex(total)}\\) 公分。過程：每摺一次厚度乘以 2，所以厚度為 \\(${formatGeometricTermLatex(start)}\\cdot 2^{${folds}}=${formatGeometricTermLatex(total)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const height = [128, 192, 256, 320][randInt(0, 3)];
        const bounce = randInt(3, 6);
        const ratio = [makeFraction(1, 2), makeFraction(3, 4)][randInt(0, 1)];
        const h = mulFraction(makeFraction(height), powFraction(ratio, bounce));
        questions.push(
          `球體反彈：一顆球從 ${height} 公尺高處落下，每次反彈高度為原高度的 \\(${formatRatioLatex(ratio)}\\)，求第 ${bounce} 次反彈的高度。`
        );
        answers.push(
          `簡答：\\(${formatGeometricTermLatex(h)}\\) 公尺。過程：每次反彈高度都乘以 \\(${formatRatioLatex(ratio)}\\)，所以第 ${bounce} 次為 \\(${height}\\cdot ${formatFractionLatexForFactor(ratio)}^{${bounce}}=${formatGeometricTermLatex(h)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const price = [80, 100, 120, 150][randInt(0, 3)];
        const years = randInt(2, 5);
        const ratio = [makeFraction(4, 5), makeFraction(3, 4), makeFraction(9, 10)][randInt(0, 2)];
        const value = mulFraction(makeFraction(price), powFraction(ratio, years));
        questions.push(
          `價值折舊：新車售價 ${price} 萬元，每年折舊後剩原來的 \\(${formatRatioLatex(ratio)}\\)，求 ${years} 年後的車價。`
        );
        answers.push(
          `簡答：\\(${formatGeometricTermLatex(value)}\\) 萬元。過程：每年都乘以 \\(${formatRatioLatex(ratio)}\\)，所以 ${years} 年後為 \\(${price}\\cdot ${formatFractionLatexForFactor(ratio)}^{${years}}=${formatGeometricTermLatex(value)}\\)。`
        );
        continue;
      }
      const population = [30000, 50000, 60000, 80000][randInt(0, 3)];
      const years = randInt(2, 4);
      const ratio = [makeFraction(11, 10), makeFraction(6, 5), makeFraction(21, 20)][randInt(0, 2)];
      const future = mulFraction(makeFraction(population), powFraction(ratio, years));
      questions.push(
        `複利成長：某城市人口每年變為前一年的 \\(${formatRatioLatex(ratio)}\\)，若今年人口為 ${population} 人，求 ${years} 年後的人口數。`
      );
      answers.push(
        `簡答：\\(${formatGeometricTermLatex(future)}\\) 人。過程：每年乘以 \\(${formatRatioLatex(ratio)}\\)，${years} 年後為 \\(${population}\\cdot ${formatFractionLatexForFactor(ratio)}^{${years}}=${formatGeometricTermLatex(future)}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ412GeometricSequenceMixedSet(count) {
    const banks = [
      buildJ412GeometricNthTermSet,
      buildJ412FindRatioFirstTermSet,
      buildJ412GeometricMeanUnknownSet,
      buildJ412TermIndexSet,
      buildJ412WordApplicationSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function formatFunctionLinear(a, b, variable = 'x') {
    return formatLinearExpr(a, b).replaceAll('x', variable);
  }

  function formatFunctionQuadratic(a, b, c) {
    const parts = [];
    if (a !== 0) parts.push(a === 1 ? 'x^2' : a === -1 ? '-x^2' : `${a}x^2`);
    if (b !== 0) {
      const term = b === 1 ? 'x' : b === -1 ? '-x' : `${b}x`;
      parts.push(parts.length && b > 0 ? `+${term}` : term);
    }
    if (c !== 0) parts.push(parts.length && c > 0 ? `+${c}` : `${c}`);
    return parts.join('') || '0';
  }

  function formatFunctionFractionValue(value) {
    const frac = typeof value === 'number' ? makeFraction(value, 1) : makeFraction(value.num, value.den);
    return formatFraction(frac.num, frac.den);
  }

  function formatProductForSubstitution(coef, value) {
    if (coef === 1) return wrapIfNegative(value);
    if (coef === -1) return `-${wrapIfNegative(value)}`;
    return `${coef}\\cdot(${value})`;
  }

  function formatProductWithLatexValue(coef, valueText) {
    const body = String(valueText || '0');
    const wrapped = body.startsWith('-') ? `\\left(${body}\\right)` : body;
    if (coef === 1) return body;
    if (coef === -1) return `-${wrapped}`;
    return `${coef}\\cdot${wrapped}`;
  }

  function formatSquareProductForSubstitution(coef, value) {
    if (coef === 1) return `(${value})^2`;
    if (coef === -1) return `-(${value})^2`;
    return `${coef}\\cdot(${value})^2`;
  }

  function pickFlowMultiplier() {
    return [-5, -4, -3, -2, 2, 3, 4, 5][randInt(0, 7)];
  }

  function formatUnknownSlopeFunction(constant) {
    return `mx${constant === 0 ? '' : formatSignedAdd(constant)}`;
  }

  function functionAnswer(isFunction, reason) {
    return `簡答：${isFunction ? '是函數' : '不是函數'}。過程：${reason}`;
  }

  function buildJ421FunctionRelationJudgeSet(count) {
    const questions = [];
    const answers = [];
    const contexts = [
      {
        x: '一位學生的身分證字號',
        y: '該學生的生日',
        ok: true,
        reason: '每一個身分證字號只屬於一位學生，因此生日也固定。',
      },
      { x: '一位學生的年齡', y: '該學生的姓名', ok: false, reason: '同一年齡可能有很多位學生，會對到不同姓名。' },
      { x: '正方形的邊長', y: '此正方形的面積', ok: true, reason: '邊長固定時，面積就是邊長平方，只會有一個值。' },
      { x: '長方形的周長', y: '此長方形的面積', ok: false, reason: '同一個周長可以有不同長寬，例如面積可能不同。' },
      {
        x: '同一天中的時刻',
        y: '某路口測得的氣溫',
        ok: true,
        reason: '若每個時刻只記錄一次氣溫，時刻固定就只有一個測量值。',
      },
      {
        x: '某班學生的座號',
        y: '該座號學生的數學段考分數',
        ok: true,
        reason: '在同一班同一次考試中，每個座號只對到一個分數。',
      },
      {
        x: '商品的原價',
        y: '打八折後的售價',
        ok: true,
        reason: '原價固定時，售價就是原價乘以 \\(\\frac{4}{5}\\)，只會有一個值。',
      },
      { x: '一個整數', y: '它的平方根', ok: false, reason: '例如 x=9 時，y 可以是 3 或 -3，同一個 x 對到兩個 y。' },
      { x: '月份', y: '該月天數（以平年為準）', ok: true, reason: '以平年為準時，每個月份的天數固定。' },
      { x: '一個人的身高', y: '此人的體重', ok: false, reason: '同樣身高的人可能有不同體重。' },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const item = contexts[randInt(0, contexts.length - 1)];
        questions.push(
          `判斷是非：若 \\(x\\) 為${item.x}，\\(y\\) 為${item.y}，則 \\(y\\) 是 \\(x\\) 的函數。這句話是否正確？`
        );
        answers.push(
          `簡答：${item.ok ? '正確' : '錯誤'}。過程：${item.reason}所以${item.ok ? '符合' : '不符合'}「同一個 x 只對到一個 y」的函數判別。`
        );
        continue;
      }
      if (mode === 1) {
        const duplicateX = randInt(-3, 5);
        const y1 = randInt(-8, 8);
        const y2 = y1 + randInt(1, 6);
        const pairs = shuffle([
          `(${duplicateX}, ${y1})`,
          `(${duplicateX}, ${y2})`,
          `(${duplicateX + randInt(1, 4)}, ${randInt(-8, 8)})`,
          `(${duplicateX - randInt(1, 4)}, ${randInt(-8, 8)})`,
        ]);
        questions.push(`下列對應關係：${pairs.join('、')}。請判斷 \\(y\\) 是否為 \\(x\\) 的函數。`);
        answers.push(
          functionAnswer(false, `同一個 \\(x=${duplicateX}\\) 同時對到 \\(y=${y1}\\) 與 \\(y=${y2}\\)，違反函數定義。`)
        );
        continue;
      }
      if (mode === 2) {
        const xs = shuffle([randInt(-5, -1), randInt(0, 3), randInt(4, 8), randInt(9, 12)]);
        const a = pickNonZero(-4, 4);
        const b = randInt(-8, 8);
        const pairs = xs.map((x) => `(${x}, ${a * x + b})`);
        questions.push(`下列對應關係：${pairs.join('、')}。請判斷 \\(y\\) 是否為 \\(x\\) 的函數。`);
        answers.push(functionAnswer(true, `每一個列出的 \\(x\\) 都只出現一次，也都只對到一個 \\(y\\)，所以是函數。`));
        continue;
      }
      if (mode === 3) {
        const t = randInt(2, 9);
        questions.push(
          `關係式 \\(y^2=x\\) 中，若 \\(x=${t * t}\\)，請列出可能的 \\(y\\) 值，並判斷 \\(y\\) 是否為 \\(x\\) 的函數。`
        );
        answers.push(
          `簡答：\\(y=${t}\\) 或 \\(y=-${t}\\)，不是函數。過程：\\(y^2=${t * t}\\) 時，\\(y\\) 有正負兩個值；同一個 \\(x\\) 對到兩個 \\(y\\)，所以不是函數。`
        );
        continue;
      }
      const a = pickNonZero(-5, 5);
      const b = randInt(-9, 9);
      questions.push(`關係式 \\(y=${formatFunctionLinear(a, b)}\\) 中，請判斷 \\(y\\) 是否為 \\(x\\) 的函數。`);
      answers.push(
        functionAnswer(
          true,
          `任意給定一個 \\(x\\)，代入 \\(y=${formatFunctionLinear(a, b)}\\) 都只會算出一個 \\(y\\) 值，所以是函數。`
        )
      );
    }
    return { questions, answers };
  }

  function buildJ421FunctionValueBasicSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = pickNonZero(-6, 6);
        const b = randInt(-12, 12);
        const x1 = randInt(-5, 8);
        const x2 = randInt(-5, 8);
        const v1 = a * x1 + b;
        const v2 = a * x2 + b;
        questions.push(`若函數 \\(f(x)=${formatFunctionLinear(a, b)}\\)，求 \\(f(${x1})\\) 與 \\(f(${x2})\\) 的值。`);
        answers.push(
          `簡答：\\(f(${x1})=${v1}\\)，\\(f(${x2})=${v2}\\)。過程：\\(f(${x1})=${formatProductForSubstitution(a, x1)}${formatSignedAdd(b)}=${v1}\\)；\\(f(${x2})=${formatProductForSubstitution(a, x2)}${formatSignedAdd(b)}=${v2}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = pickNonZero(1, 4);
        const b = pickNonZero(-6, 6);
        const c = randInt(-10, 10);
        const x = randInt(-4, 5);
        const value = a * x * x + b * x + c;
        questions.push(`已知函數 \\(g(x)=${formatFunctionQuadratic(a, b, c)}\\)，求 \\(g(${x})\\)。`);
        answers.push(
          `簡答：\\(g(${x})=${value}\\)。過程：\\(g(${x})=${formatSquareProductForSubstitution(a, x)}${b === 0 ? '' : formatSignedAdd(b) + `\\cdot(${x})`}${c === 0 ? '' : formatSignedAdd(c)}=${value}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a = pickNonZero(-5, 5);
        const h = randInt(-8, 8);
        const c = randInt(1, 9);
        const x = randInt(-6, 8);
        const value = Math.abs(a * x + h) + c;
        questions.push(`設函數 \\(f(x)=|${formatFunctionLinear(a, h)}|+${c}\\)，求 \\(f(${x})\\)。`);
        answers.push(
          `簡答：\\(f(${x})=${value}\\)。過程：先算絕對值內部 \\(${formatProductForSubstitution(a, x)}${formatSignedAdd(h)}=${a * x + h}\\)，所以 \\(f(${x})=|${a * x + h}|+${c}=${value}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const c = pickNonZero(-12, 12);
        const x1 = randInt(-20, 20);
        const x2 = randInt(-20, 20);
        questions.push(`若 \\(f(x)=${c}\\) 為常數函數，求 \\(f(${x1})+f(${x2})\\)。`);
        answers.push(
          `簡答：${2 * c}。過程：常數函數不論輸入多少，輸出都等於 ${c}，所以 \\(f(${x1})+f(${x2})=${c}${formatSignedAdd(c)}=${2 * c}\\)。`
        );
        continue;
      }
      const denShift = randInt(1, 8);
      const numerator = pickNonZero(-24, 24);
      let x = randInt(-8, 10);
      while (x + denShift === 0) x = randInt(-8, 10);
      const value = makeFraction(numerator, x + denShift);
      questions.push(`設函數 \\(h(x)=\\frac{${numerator}}{x${formatSignedAdd(denShift)}}\\)，求 \\(h(${x})\\)。`);
      answers.push(
        `簡答：\\(h(${x})=${formatFunctionFractionValue(value)}\\)。過程：分母為 \\(${x}${formatSignedAdd(denShift)}=${x + denShift}\\)，所以 \\(h(${x})=\\frac{${numerator}}{${x + denShift}}=${formatFunctionFractionValue(value)}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ421FunctionReverseSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = pickNonZero(-6, 6);
        const x = randInt(-5, 8);
        const k = pickNonZero(-12, 12);
        const fx = a * x + k;
        questions.push(`已知函數 \\(f(x)=${formatFunctionLinear(a, 0)}+k\\)，且 \\(f(${x})=${fx}\\)，求 \\(k\\)。`);
        answers.push(
          `簡答：\\(k=${k}\\)。過程：\\(f(${x})=${formatProductForSubstitution(a, x)}+k=${fx}\\)，所以 \\(k=${fx}${formatSignedAdd(-a * x)}=${k}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = pickNonZero(-5, 5);
        const b = randInt(-9, 9);
        const x = randInt(-6, 6);
        const target = a * x + b;
        questions.push(`若 \\(g(x)=${formatFunctionLinear(a, b)}\\)，且 \\(g(a_0)=${target}\\)，求 \\(a_0\\) 的值。`);
        answers.push(
          `簡答：\\(a_0=${x}\\)。過程：令輸入為 \\(a_0\\)，\\(${formatFunctionLinear(a, b).replaceAll('x', 'a_0')}=${target}\\)，解得 \\(a_0=${x}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a = pickNonZero(-5, 5);
        const b = randInt(-8, 8);
        const x = pickNonZero(-4, 7);
        const m = pickNonZero(-5, 5);
        const c = a * x + b - m * x;
        questions.push(
          `已知兩個一次函數 \\(f(x)=${formatFunctionLinear(a, b)}\\) 與 \\(g(x)=${formatUnknownSlopeFunction(c)}\\)，在 \\(x=${x}\\) 時函數值相等，求 \\(m\\)。`
        );
        answers.push(
          `簡答：\\(m=${m}\\)。過程：在 \\(x=${x}\\) 時，\\(f(${x})=${a * x + b}\\)，而 \\(g(${x})=${formatFunctionLinear(x, c, 'm')}\\)。令 \\(${formatFunctionLinear(x, c, 'm')}=${a * x + b}\\)，得 \\(m=${formatFraction(a * x + b - c, x)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const k = pickNonZero(-6, 8);
        const x = randInt(-8, 8);
        const value = (k * x - 1) / 2;
        if (!Number.isInteger(value)) {
          i -= 1;
          continue;
        }
        questions.push(`若函數 \\(f(x)=\\frac{kx-1}{2}\\)，且 \\(f(${x})=${value}\\)，求 \\(k\\)。`);
        answers.push(
          `簡答：\\(k=${k}\\)。過程：\\(\\frac{${formatTerm(x, 'k')}-1}{2}=${value}\\)，兩邊乘以 2 得 \\(${formatTerm(x, 'k')}-1=${2 * value}\\)，所以 \\(k=${k}\\)。`
        );
        continue;
      }
      const a = pickNonZero(-6, 6);
      const b = randInt(-10, 10);
      const input = randInt(-6, 8);
      const target = a * input + b;
      questions.push(`設 \\(f(x)=${formatFunctionLinear(a, b)}\\)。若 \\(f(t)=${target}\\)，求 \\(t\\)。`);
      answers.push(
        `簡答：\\(t=${input}\\)。過程：\\(${formatFunctionLinear(a, b, 't')}=${target}\\)，所以 \\(${formatTerm(a, 't')}=${target - b}\\)，解得 \\(t=${input}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ421FunctionFlowCompositeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const add = randInt(1, 8);
        const mul = pickFlowMultiplier();
        const sub = randInt(1, 12);
        const a = mul;
        const b = mul * add - sub;
        questions.push(
          `有一計算流程：輸入 \\(x\\) → 加 ${add} → 乘以 ${mul} → 減 ${sub} → 輸出 \\(y\\)。請寫出 \\(y\\) 與 \\(x\\) 的關係式。`
        );
        answers.push(
          `簡答：\\(y=${formatFunctionLinear(a, b)}\\)。過程：加 ${add} 後為 \\(x${formatSignedAdd(add)}\\)，乘以 ${mul} 得 \\(${mul}(x${formatSignedAdd(add)})\\)，再減 ${sub}，所以 \\(y=${formatFunctionLinear(a, b)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const add = randInt(1, 8);
        const mul = pickFlowMultiplier();
        const sub = randInt(1, 12);
        const x = randInt(-6, 8);
        const y = mul * (x + add) - sub;
        questions.push(
          `承上類流程：輸入 \\(x\\) → 加 ${add} → 乘以 ${mul} → 減 ${sub} → 輸出 \\(y\\)。若輸入 ${x}，輸出為多少？`
        );
        answers.push(`簡答：${y}。過程：\\(y=${mul}(${x}${formatSignedAdd(add)})-${sub}=${y}\\)。`);
        continue;
      }
      if (mode === 2) {
        const add = randInt(1, 6);
        const mul = pickNonZero(2, 6);
        const sub = randInt(1, 10);
        const x = randInt(-5, 8);
        const y = mul * (x + add) - sub;
        questions.push(
          `流程為：輸入 \\(x\\) → 加 ${add} → 乘以 ${mul} → 減 ${sub} → 輸出 \\(y\\)。若輸出為 ${y}，求輸入 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：逆推時先加回 ${sub} 得 ${y + sub}，再除以 ${mul} 得 ${x + add}，最後減 ${add}，所以 \\(x=${x}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const a = pickNonZero(-4, 4);
        const b = randInt(-6, 6);
        const c = pickNonZero(-4, 4);
        const d = randInt(-6, 6);
        const x = randInt(-5, 6);
        const gx = c * x + d;
        const value = a * gx + b;
        questions.push(
          `若 \\(f(x)=${formatFunctionLinear(a, b)}\\)，\\(g(x)=${formatFunctionLinear(c, d)}\\)，求 \\(f(g(${x}))\\)。`
        );
        answers.push(
          `簡答：${value}。過程：先算 \\(g(${x})=${c}\\cdot(${x})${formatSignedAdd(d)}=${gx}\\)，再算 \\(f(${gx})=${a}\\cdot(${gx})${formatSignedAdd(b)}=${value}\\)。`
        );
        continue;
      }
      const a = pickNonZero(-5, 5);
      const b = randInt(-8, 8);
      const n = randInt(3, 6);
      let sum = 0;
      for (let x = 1; x <= n; x += 1) sum += a * x + b;
      const sumInputText = `(1+\\cdots+${n})`;
      const aSumText = a === 1 ? sumInputText : a === -1 ? `-${sumInputText}` : `${a}${sumInputText}`;
      const aSumValue = a * ((n * (n + 1)) / 2);
      const bSumText = b === 0 ? '' : `${formatSignedAdd(b)}\\cdot${n}`;
      const totalText = b === 0 ? `${aSumValue}` : `${aSumValue}${formatSignedAdd(b * n)}`;
      questions.push(`已知函數 \\(f(x)=${formatFunctionLinear(a, b)}\\)，求 \\(f(1)+f(2)+\\cdots+f(${n})\\)。`);
      answers.push(`簡答：${sum}。過程：\\(f(1)+\\cdots+f(${n})=${aSumText}${bSumText}=${totalText}=${sum}\\)。`);
    }
    return { questions, answers };
  }

  function buildJ421FunctionWordModelSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const c = [10, 15, 20, 25, 30, 35][randInt(0, 5)];
        const f = makeFraction(9 * c + 160, 5);
        questions.push(
          `溫標轉換：華氏溫度 \\(F\\) 與攝氏溫度 \\(C\\) 的關係為 \\(F=\\frac{9}{5}C+32\\)。當 \\(C=${c}\\) 時，求 \\(F\\)。`
        );
        answers.push(
          `簡答：\\(F=${formatFunctionFractionValue(f)}\\)。過程：代入 \\(C=${c}\\)，\\(F=\\frac{9}{5}\\cdot${c}+32=${formatFunctionFractionValue(f)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const side = randInt(4, 18);
        const perimeter = 4 * side;
        questions.push(
          `幾何周長：一正方形邊長為 \\(x\\) 公分，周長為 \\(y\\) 公分。請寫出 \\(y\\) 與 \\(x\\) 的函數關係式，並求邊長為 ${side} 公分時的周長。`
        );
        answers.push(
          `簡答：\\(y=4x\\)，周長 ${perimeter} 公分。過程：正方形有 4 條等長邊，所以 \\(y=4x\\)。代入 \\(x=${side}\\)，得 \\(y=4\\cdot${side}=${perimeter}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const speed = [40, 50, 60, 70, 80, 90][randInt(0, 5)];
        const hours = randInt(2, 6);
        const distance = speed * hours;
        questions.push(
          `等速運動：一輛車以每小時 ${speed} 公里的固定速度行駛 \\(x\\) 小時，距離為 \\(y\\) 公里。求 \\(y\\) 與 \\(x\\) 的關係式，並求行駛 ${hours} 小時的距離。`
        );
        answers.push(
          `簡答：\\(y=${speed}x\\)，距離 ${distance} 公里。過程：距離等於速度乘以時間，所以 \\(y=${speed}x\\)；代入 \\(x=${hours}\\)，\\(y=${speed}\\cdot${hours}=${distance}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const initial = randInt(16, 30);
        const rate = [makeFraction(1, 2), makeFraction(2, 3), makeFraction(3, 4)][randInt(0, 2)];
        const minutes = randInt(6, 18);
        const remain = subFraction(makeFraction(initial), mulFraction(rate, makeFraction(minutes)));
        if (remain.num < 0) {
          i -= 1;
          continue;
        }
        questions.push(
          `消耗模型：一支長 ${initial} 公分的蠟燭，每分鐘燃燒 \\(${formatFunctionFractionValue(rate)}\\) 公分。若燃燒 \\(x\\) 分鐘後剩下 \\(y\\) 公分，求關係式及燃燒 ${minutes} 分鐘後的長度。`
        );
        answers.push(
          `簡答：\\(y=${initial}-${formatFunctionFractionValue(rate)}x\\)，剩 \\(${formatFunctionFractionValue(remain)}\\) 公分。過程：剩餘長度等於原長減去燃燒長度，所以 \\(y=${initial}-${formatFunctionFractionValue(rate)}x\\)。代入 \\(x=${minutes}\\)，得 \\(y=${initial}-${formatFunctionFractionValue(rate)}\\cdot${minutes}=${formatFunctionFractionValue(remain)}\\)。`
        );
        continue;
      }
      const seconds = randInt(360, 900);
      const extra = seconds - 300;
      const cost = makeFraction(1800 + extra, 10);
      questions.push(
        `資費計算：某通話費前 300 秒共收 180 元，超過 300 秒後每秒收 \\(\\frac{1}{10}\\) 元。若通話時間為 \\(x\\) 秒（\\(x>300\\)），總費用為 \\(y\\) 元，求關係式及通話 ${seconds} 秒的費用。`
      );
      answers.push(
        `簡答：\\(y=180+\\frac{x-300}{10}\\)，費用 \\(${formatFunctionFractionValue(cost)}\\) 元。過程：超過的秒數是 \\(x-300\\)，所以 \\(y=180+\\frac{x-300}{10}\\)。代入 \\(x=${seconds}\\)，\\(y=180+\\frac{${extra}}{10}=${formatFunctionFractionValue(cost)}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ421FunctionMixedSet(count) {
    const banks = [
      buildJ421FunctionRelationJudgeSet,
      buildJ421FunctionValueBasicSet,
      buildJ421FunctionReverseSolveSet,
      buildJ421FunctionFlowCompositeSet,
      buildJ421FunctionWordModelSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function formatSignedFractionTerm(frac) {
    const value = makeFraction(frac.num, frac.den);
    const absText = formatFraction(Math.abs(value.num), value.den);
    return value.num >= 0 ? `+${absText}` : `-${absText}`;
  }

  function formatFractionCoeffTerm(frac, variable = 'x') {
    const value = makeFraction(frac.num, frac.den);
    if (value.num === 0) return '0';
    if (value.den === 1) return formatTerm(value.num, variable);
    const sign = value.num < 0 ? '-' : '';
    const absText = formatFraction(Math.abs(value.num), value.den);
    return `${sign}${absText}${variable}`;
  }

  function formatLinearFractionExpr(slope, intercept, variable = 'x') {
    const m = makeFraction(slope.num, slope.den);
    const b = makeFraction(intercept.num, intercept.den);
    const mText = formatFractionCoeffTerm(m, variable);
    if (b.num === 0) return mText;
    return `${mText}${formatSignedFractionTerm(b)}`;
  }

  function formatPoint(x, y) {
    return `(${formatFunctionFractionValue(x)}, ${formatFunctionFractionValue(y)})`;
  }

  function formatDifferenceText(a, b) {
    return `${a}${formatSignedAdd(-b)}`;
  }

  function evalLinearFraction(slope, intercept, x) {
    return addFraction(mulFraction(slope, makeFraction(x, 1)), intercept);
  }

  function lineThroughPointSlope(pointX, pointY, slope) {
    const intercept = subFraction(makeFraction(pointY, 1), mulFraction(slope, makeFraction(pointX, 1)));
    return { slope, intercept };
  }

  function buildJ422LinearEquationTwoPointsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const a = pickNonZero(-5, 5);
      const b = randInt(-12, 12);
      let x1 = randInt(-5, 5);
      let x2 = randInt(-5, 5);
      while (x2 === x1) x2 = randInt(-5, 5);
      const y1 = a * x1 + b;
      const y2 = a * x2 + b;
      if (mode === 0) {
        questions.push(
          `已知一次函數 \\(f(x)=ax+b\\) 的圖形通過 ${formatPoint(x1, y1)} 與 ${formatPoint(x2, y2)}，求此函數關係式。`
        );
        answers.push(
          `簡答：\\(f(x)=${formatFunctionLinear(a, b)}\\)。過程：斜率 \\(a=\\frac{${formatDifferenceText(y2, y1)}}{${formatDifferenceText(x2, x1)}}=${a}\\)。代入 ${formatPoint(x1, y1)}，得 \\(${y1}=${formatProductForSubstitution(a, x1)}+b\\)，所以 \\(b=${b}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const askX = randInt(-6, 8);
        const askY = a * askX + b;
        questions.push(
          `設線型函數通過 ${formatPoint(x1, y1)} 與 ${formatPoint(x2, y2)}，求當 \\(x=${askX}\\) 時的函數值。`
        );
        answers.push(
          `簡答：${askY}。過程：先求斜率 \\(a=\\frac{${formatDifferenceText(y2, y1)}}{${formatDifferenceText(x2, x1)}}=${a}\\)，再得函數式 \\(y=${formatFunctionLinear(a, b)}\\)。代入 \\(x=${askX}\\)，\\(y=${askY}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`若線型函數 \\(y=g(x)\\) 通過 ${formatPoint(x1, y1)} 與 ${formatPoint(x2, y2)}，求其圖形。`);
        answers.push(
          `簡答：\\(y=${formatFunctionLinear(a, b)}\\)。過程：\\(a=\\frac{${formatDifferenceText(y2, y1)}}{${formatDifferenceText(x2, x1)}}=${a}\\)，代入其中一點求得截距 \\(b=${b}\\)，所以圖形為直線 \\(y=${formatFunctionLinear(a, b)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(
          `已知一次函數圖形通過 ${formatPoint(x1, y1)} 與 ${formatPoint(x2, y2)}，求此函數的斜率與 \\(y\\) 軸截距。`
        );
        answers.push(
          `簡答：斜率 ${a}，\\(y\\) 軸截距 ${b}。過程：斜率 \\(\\frac{${formatDifferenceText(y2, y1)}}{${formatDifferenceText(x2, x1)}}=${a}\\)；函數式為 \\(y=${formatFunctionLinear(a, b)}\\)，故 \\(y\\) 軸截距為 ${b}。`
        );
        continue;
      }
      const f1 = a + b;
      const f2 = 2 * a + b;
      questions.push(`一次函數 \\(f(x)=ax+b\\) 滿足 \\(f(1)=${f1}\\) 且 \\(f(2)=${f2}\\)，求 \\(f(x)\\)。`);
      answers.push(
        `簡答：\\(f(x)=${formatFunctionLinear(a, b)}\\)。過程：\\(a=f(2)-f(1)=${formatDifferenceText(f2, f1)}=${a}\\)，再由 \\(a+b=${f1}\\) 得 \\(b=${b}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ422InterceptPositionSet(count) {
    const questions = [];
    const answers = [];
    const quadrantNames = ['第一象限', '第二象限', '第三象限', '第四象限'];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const xIntercept = pickNonZero(-8, 8);
        const yIntercept = pickNonZero(-10, 10);
        const slope = makeFraction(-yIntercept, xIntercept);
        questions.push(
          `求一次函數 \\(y=${formatLinearFractionExpr(slope, makeFraction(yIntercept))}\\) 與 \\(x\\) 軸、\\(y\\) 軸的交點座標。`
        );
        answers.push(
          `簡答：\\(x\\) 軸交點 ${formatPoint(xIntercept, 0)}，\\(y\\) 軸交點 ${formatPoint(0, yIntercept)}。過程：令 \\(y=0\\) 得 \\(x=${xIntercept}\\)；令 \\(x=0\\) 得 \\(y=${yIntercept}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = pickNonZero(-5, 5);
        const b = pickNonZero(-12, 12);
        const missing =
          a > 0 && b > 0 ? '第四象限' : a > 0 && b < 0 ? '第二象限' : a < 0 && b > 0 ? '第三象限' : '第一象限';
        questions.push(`已知函數 \\(f(x)=${formatFunctionLinear(a, b)}\\)，請問其圖形不通過哪一個象限？`);
        answers.push(
          `簡答：不通過${missing}。過程：斜率 ${a > 0 ? '為正' : '為負'}，\\(y\\) 軸截距 ${b > 0 ? '為正' : '為負'}，依直線穿過兩軸的位置判斷，缺少${missing}。`
        );
        continue;
      }
      if (mode === 2) {
        const a = -randInt(1, 6);
        const b = randInt(2, 12);
        questions.push(`若一次函數 \\(y=ax+b\\) 中，\\(ab>0\\) 且 \\(a<0\\)，則其圖形通過哪些象限？`);
        answers.push(
          `簡答：第二、第三、第四象限。過程：\\(a<0\\) 且 \\(ab>0\\)，所以 \\(b<0\\)。斜率負、截距負時，直線不通過第一象限，故通過第二、第三、第四象限。`
        );
        continue;
      }
      if (mode === 3) {
        const xIntercept = pickNonZero(-9, 9);
        const yIntercept = pickNonZero(-9, 9);
        questions.push(
          `一次函數的圖形與兩座標軸交於 ${formatPoint(xIntercept, 0)}、${formatPoint(0, yIntercept)}，求此兩交點所形成線段的中點座標。`
        );
        answers.push(
          `簡答：\\((${formatFraction(xIntercept, 2)}, ${formatFraction(yIntercept, 2)})\\)。過程：中點座標為 \\((\\frac{${xIntercept}+0}{2},\\frac{0${formatSignedAdd(yIntercept)}}{2})=(${formatFraction(xIntercept, 2)}, ${formatFraction(yIntercept, 2)})\\)。`
        );
        continue;
      }
      const c = pickNonZero(-9, 9);
      const pass = c > 0 ? ['第一象限', '第二象限'] : ['第三象限', '第四象限'];
      const missing = quadrantNames.filter((q) => !pass.includes(q)).join('、');
      questions.push(`已知常數函數 \\(f(x)=${c}\\)，請問其圖形通過哪些象限？`);
      answers.push(
        `簡答：通過${pass.join('、')}。過程：圖形是水平直線 \\(y=${c}\\)，在 \\(x>0\\) 與 \\(x<0\\) 都有點；因為 \\(y${c > 0 ? '>0' : '<0'}\\)，所以不通過${missing}。`
      );
    }
    return { questions, answers };
  }

  function buildJ422AxisAreaSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const xIntercept = pickNonZero(-10, 10);
      const yIntercept = pickNonZero(-12, 12);
      const slope = makeFraction(-yIntercept, xIntercept);
      const area = Math.abs(xIntercept * yIntercept) / 2;
      if (mode === 0) {
        questions.push(
          `計算一次函數 \\(y=${formatLinearFractionExpr(slope, makeFraction(yIntercept))}\\) 的圖形與兩坐標軸所圍成的三角形面積。`
        );
        answers.push(
          `簡答：${formatFunctionFractionValue(makeFraction(Math.abs(xIntercept * yIntercept), 2))} 平方單位。過程：\\(x\\) 軸截距為 ${xIntercept}，\\(y\\) 軸截距為 ${yIntercept}，面積 \\(=\\frac{|${xIntercept}\\cdot${yIntercept}|}{2}=${formatFunctionFractionValue(makeFraction(Math.abs(xIntercept * yIntercept), 2))}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const b = [4, 6, 8, 10, 12][randInt(0, 4)];
        const targetArea = [12, 16, 18, 24, 30, 36][randInt(0, 5)];
        const x0 = (2 * targetArea) / b;
        if (!Number.isInteger(x0)) {
          i -= 1;
          continue;
        }
        const a = makeFraction(-b, x0);
        questions.push(
          `若一次函數 \\(y=ax+${b}\\) 的圖形與兩坐標軸圍成的面積為 ${targetArea} 平方單位，且 \\(a<0\\)，求 \\(a\\)。`
        );
        answers.push(
          `簡答：\\(a=${formatFunctionFractionValue(a)}\\)。過程：\\(y\\) 軸截距為 ${b}，面積 \\(\\frac{|x_0|\\cdot${b}}{2}=${targetArea}\\)，得 \\(x_0=${x0}\\)。又 \\(0=a\\cdot${x0}+${b}\\)，所以 \\(a=${formatFunctionFractionValue(a)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(
          `計算一次函數 \\(y=${formatLinearFractionExpr(slope, makeFraction(yIntercept))}\\) 的圖形與兩坐標軸所圍成的三角形面積，並列出兩截距。`
        );
        answers.push(
          `簡答：截距為 ${formatPoint(xIntercept, 0)}、${formatPoint(0, yIntercept)}，面積 \\(${formatFunctionFractionValue(makeFraction(Math.abs(xIntercept * yIntercept), 2))}\\)。過程：令 \\(y=0\\) 得 \\(x=${xIntercept}\\)，令 \\(x=0\\) 得 \\(y=${yIntercept}\\)，面積為兩截距絕對值乘積的一半。`
        );
        continue;
      }
      if (mode === 3) {
        const a = pickNonZero(-6, 6);
        const b = pickNonZero(-10, 10);
        const x0 = makeFraction(-b, a);
        const areaFrac = makeFraction(Math.abs(b * b), 2 * Math.abs(a));
        questions.push(`設一次函數 \\(f(x)=${formatFunctionLinear(a, b)}\\)，求其圖形與兩坐標軸所形成的圖形面積。`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(areaFrac)}\\) 平方單位。過程：\\(y\\) 軸截距為 ${b}，\\(x\\) 軸截距為 \\(${formatFunctionFractionValue(x0)}\\)，面積 \\(=\\frac{|${formatFunctionFractionValue(x0)}\\cdot${b}|}{2}=${formatFunctionFractionValue(areaFrac)}\\)。`
        );
        continue;
      }
      questions.push(
        `求一次函數 \\(y=${formatLinearFractionExpr(slope, makeFraction(yIntercept))}\\) 的圖形與兩坐標軸圍成的面積。`
      );
      answers.push(
        `簡答：\\(${formatFunctionFractionValue(makeFraction(Math.abs(xIntercept * yIntercept), 2))}\\) 平方單位。過程：兩軸截距分別為 ${formatFunctionFractionValue(makeFraction(xIntercept))} 與 ${formatFunctionFractionValue(makeFraction(yIntercept))}，所以面積為 \\(\\frac{|${xIntercept}\\cdot${yIntercept}|}{2}=${formatFunctionFractionValue(makeFraction(Math.abs(xIntercept * yIntercept), 2))}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ422LineIntersectionParallelSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const px = randInt(-5, 6);
        const py = randInt(-8, 8);
        let m1 = pickNonZero(-5, 5);
        let m2 = pickNonZero(-5, 5);
        while (m2 === m1) m2 = pickNonZero(-5, 5);
        const line1 = lineThroughPointSlope(px, py, makeFraction(m1));
        const line2 = lineThroughPointSlope(px, py, makeFraction(m2));
        const diffSlope = m1 - m2;
        const diffIntercept = line2.intercept.num / line2.intercept.den - line1.intercept.num / line1.intercept.den;
        questions.push(
          `求兩個一次函數 \\(y=${formatLinearFractionExpr(line1.slope, line1.intercept)}\\) 與 \\(y=${formatLinearFractionExpr(line2.slope, line2.intercept)}\\) 的圖形交點座標。`
        );
        answers.push(
          `簡答：${formatPoint(px, py)}。過程：聯立兩式，移項得 \\(${formatTerm(diffSlope, 'x')}=${diffIntercept}\\)，解得 \\(x=${px}\\)，代回得 \\(y=${py}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const c1 = pickNonZero(-10, 10);
        const c2 = pickNonZero(-10, 10);
        questions.push(`求一次函數 \\(y=${c1}\\) 與 \\(y=${formatFunctionLinear(-2, c2)}\\) 圖形的交點座標。`);
        const x = makeFraction(c2 - c1, 2);
        answers.push(
          `簡答：${formatPoint(x, c1)}。過程：聯立 \\(${c1}=-2x${formatSignedAdd(c2)}\\)，得 \\(x=${formatFunctionFractionValue(x)}\\)，所以交點為 ${formatPoint(x, c1)}。`
        );
        continue;
      }
      if (mode === 2) {
        const c = randInt(-10, 10);
        const xAxisPoint = pickNonZero(-6, 6);
        const knownSlope = -3;
        const knownIntercept = -knownSlope * xAxisPoint;
        const unknownA = makeFraction(-c, xAxisPoint);
        questions.push(
          `若直線 \\(y=ax${formatSignedAdd(c)}\\) 與 \\(y=${formatFunctionLinear(knownSlope, knownIntercept)}\\) 的圖形相交於 \\(x\\) 軸上，求 \\(a\\)。`
        );
        answers.push(
          `簡答：\\(a=${formatFunctionFractionValue(unknownA)}\\)。過程：交點在 \\(x\\) 軸上表示 \\(y=0\\)。令第一條直線通過 \\((${xAxisPoint},0)\\)，則 \\(0=a\\cdot${xAxisPoint}${formatSignedAdd(c)}\\)，所以 \\(a=${formatFunctionFractionValue(unknownA)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const m = pickNonZero(-6, 6);
        const lineConst = randInt(-20, 20);
        questions.push(
          `已知兩函數 \\(f(x)=${formatTerm(m, 'x')}+7k-11\\) 與 \\(g(x)=${formatFunctionLinear(-8, lineConst)}\\) 的圖形交點在 \\(x\\) 軸上。若 \\(f\\) 的斜率為 ${m}，求符合交點在 \\(x\\) 軸時的 \\(k\\)（以 \\(x\\) 軸交點由 \\(g\\) 決定）。`
        );
        const gxZero = makeFraction(lineConst, 8);
        const kValue = makeFraction(11 * 8 - m * lineConst, 56);
        answers.push(
          `簡答：\\(k=${formatFunctionFractionValue(kValue)}\\)。過程：交點在 \\(x\\) 軸上，先由 \\(g(x)=-8x${formatSignedAdd(lineConst)}=0\\) 得 \\(x=${formatFunctionFractionValue(gxZero)}\\)。代入 \\(f\\)：\\(${formatProductWithLatexValue(m, formatFunctionFractionValue(gxZero))}+7k-11=0\\)，解得 \\(k=${formatFunctionFractionValue(kValue)}\\)。`
        );
        continue;
      }
      const px = randInt(-4, 5);
      const py = randInt(-6, 8);
      const slope = pickNonZero(-5, 5);
      const b = py - slope * px;
      let knownB = randInt(-8, 8);
      while (knownB === b) knownB = randInt(-8, 8);
      questions.push(
        `設直線 \\(y=ax+b\\) 與 \\(y=${formatFunctionLinear(slope, knownB)}\\) 平行，且通過 ${formatPoint(px, py)}，求 \\(a+b\\)。`
      );
      answers.push(
        `簡答：\\(a+b=${slope + b}\\)。過程：平行直線斜率相同，所以 \\(a=${slope}\\)。代入 ${formatPoint(px, py)} 得 \\(${py}=${formatProductForSubstitution(slope, px)}+b\\)，所以 \\(b=${b}\\)，\\(a+b=${slope + b}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ422LinearFunctionMixedSet(count) {
    const banks = [
      buildJ422LinearEquationTwoPointsSet,
      buildJ422InterceptPositionSet,
      buildJ422AxisAreaSet,
      buildJ422LineIntersectionParallelSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ431TriangleInteriorAngleSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    const ratioSets = [
      [1, 2, 3],
      [1, 3, 5],
      [2, 3, 4],
      [2, 5, 5],
      [3, 4, 5],
      [4, 5, 6],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = (i + startOffset) % 5;
      if (mode === 0) {
        let ratio = ratioSets[randInt(0, ratioSets.length - 1)];
        let unit = 180 / ratio.reduce((sum, value) => sum + value, 0);
        while (!Number.isInteger(unit)) {
          ratio = ratioSets[randInt(0, ratioSets.length - 1)];
          unit = 180 / ratio.reduce((sum, value) => sum + value, 0);
        }
        const angles = ratio.map((value) => value * unit);
        questions.push(`已知 \\(\\triangle ABC\\) 三個內角的度數比為 ${ratio.join(':')}，求此三角形的最大角。`);
        answers.push(
          `簡答：${Math.max(...angles)}°。過程：三角形內角和為 180°，比例總和為 ${ratio.reduce((sum, value) => sum + value, 0)} 份，所以一份為 ${unit}°，三角分別為 ${angles.join('°、')}°，最大角為 ${Math.max(...angles)}°。`
        );
        continue;
      }
      if (mode === 1) {
        let x = randInt(20, 40);
        let a = randInt(-20, 20);
        let b = 180 - 6 * x - a;
        while (2 * x + a <= 0 || 3 * x + b <= 0 || b < -40 || b > 60) {
          x = randInt(20, 40);
          a = randInt(-20, 20);
          b = 180 - 6 * x - a;
        }
        const exprA = `2x${formatSignedAdd(a)}`;
        const exprC = `3x${formatSignedAdd(b)}`;
        const sumExpr = `${exprA}+x${exprC.startsWith('-') ? exprC : `+${exprC}`}`;
        questions.push(
          `若 \\(\\triangle ABC\\) 的三內角分別為 \\(${exprA}\\)°、\\(x\\)°、\\(${exprC}\\)°，求 \\(x\\) 之值。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：三角形內角和為 180°，所以 \\(${sumExpr}=180\\)，化簡得 \\(${formatFunctionLinear(6, a + b)}=180\\)，解得 \\(x=${x}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const angleA = randInt(35, 90);
        const diff = [10, 20, 30, 40][randInt(0, 3)];
        if ((180 - angleA + diff) % 2 !== 0) {
          i -= 1;
          continue;
        }
        const angleB = (180 - angleA + diff) / 2;
        const angleC = angleB - diff;
        if (angleC <= 0) {
          i -= 1;
          continue;
        }
        questions.push(
          `在 \\(\\triangle ABC\\) 中，已知 \\(\\angle A=${angleA}°\\)，且 \\(\\angle B-\\angle C=${diff}°\\)，求 \\(\\angle B\\)。`
        );
        answers.push(
          `簡答：\\(\\angle B=${angleB}°\\)。過程：\\(\\angle B+\\angle C=180°-${angleA}°=${180 - angleA}°\\)，又 \\(\\angle B-\\angle C=${diff}°\\)。兩式相加得 \\(2\\angle B=${2 * angleB}°\\)，所以 \\(\\angle B=${angleB}°\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const known = randInt(40, 100);
        const ratio = [
          [1, 2],
          [2, 3],
          [3, 4],
          [3, 5],
        ][randInt(0, 3)];
        const remain = 180 - known;
        const unit = remain / (ratio[0] + ratio[1]);
        if (!Number.isInteger(unit)) {
          i -= 1;
          continue;
        }
        const small = Math.min(ratio[0] * unit, ratio[1] * unit, known);
        questions.push(`已知三角形的一個內角為 ${known}°，另外兩個內角的度數比為 ${ratio[0]}:${ratio[1]}，求最小角。`);
        answers.push(
          `簡答：${small}°。過程：另外兩角和為 \\(180°-${known}°=${remain}°\\)，比例共 ${ratio[0] + ratio[1]} 份，一份為 ${unit}°，三角為 ${known}°、${ratio[0] * unit}°、${ratio[1] * unit}°，最小角為 ${small}°。`
        );
        continue;
      }
      const angleB = randInt(35, 85);
      const angleA = randInt(30, 100 - Math.floor(angleB / 2));
      const angleC = 180 - angleA - angleB;
      if (angleC <= 0) {
        i -= 1;
        continue;
      }
      const sumAB = angleA + angleB;
      const sumBC = angleB + angleC;
      questions.push(
        `若 \\(\\triangle ABC\\) 中，\\(\\angle A+\\angle B=${sumAB}°\\)，且 \\(\\angle B+\\angle C=${sumBC}°\\)，求 \\(\\angle B\\) 的度數。`
      );
      answers.push(
        `簡答：\\(\\angle B=${angleB}°\\)。過程：兩式相加得 \\(\\angle A+2\\angle B+\\angle C=${sumAB + sumBC}°\\)。因為 \\(\\angle A+\\angle B+\\angle C=180°\\)，所以 \\(\\angle B=${sumAB + sumBC}°-180°=${angleB}°\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ431PolygonInteriorSumSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = (i + startOffset) % 5;
      if (mode === 0) {
        const n = randInt(5, 14);
        const sum = (n - 2) * 180;
        questions.push(`求一個 ${n} 邊形的內角和為多少度？`);
        answers.push(
          `簡答：${sum}°。過程：\\(n\\) 邊形內角和為 \\((n-2)\\times180°\\)，所以 \\((${n}-2)\\times180°=${sum}°\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const n = randInt(5, 16);
        const sum = (n - 2) * 180;
        questions.push(`若一個多邊形的內角總和為 ${sum}°，則此多邊形為幾邊形？`);
        answers.push(
          `簡答：${n} 邊形。過程：設為 \\(n\\) 邊形，\\((n-2)\\times180=${sum}\\)，所以 \\(n-2=${sum / 180}\\)，\\(n=${n}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const diagonals = randInt(3, 9);
        const n = diagonals + 3;
        const sum = (n - 2) * 180;
        questions.push(`已知一個多邊形從其中一個頂點最多可以作出 ${diagonals} 條對角線，求此多邊形的內角和。`);
        answers.push(
          `簡答：${sum}°。過程：從一頂點可作的對角線數為 \\(n-3\\)，所以 \\(n-3=${diagonals}\\)，得 \\(n=${n}\\)。內角和為 \\((${n}-2)\\times180=${sum}°\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const k = randInt(2, 6);
        const n = 2 + 2 * k;
        const sum = (n - 2) * 180;
        questions.push(`若一個多邊形的內角總和是其外角和的 ${k} 倍，求此多邊形的邊數。`);
        answers.push(
          `簡答：${n} 邊形。過程：任意多邊形外角和為 360°，內角和為 \\((n-2)180°\\)。由 \\((n-2)180=${k}\\cdot360\\)，得 \\(n-2=${2 * k}\\)，所以 \\(n=${n}\\)。`
        );
        continue;
      }
      const n = randInt(5, 12);
      const d = [2, 4, 6, 8][randInt(0, 3)];
      const total = (n - 2) * 180;
      const firstNumerator = 2 * total - n * (n - 1) * d;
      const firstDenominator = 2 * n;
      if (firstNumerator <= 0 || firstNumerator % firstDenominator !== 0) {
        i -= 1;
        continue;
      }
      const first = firstNumerator / firstDenominator;
      questions.push(`一個 \\(n\\) 邊形的所有內角由小到大成等差數列，公差為 ${d}°，若最小角為 ${first}°，求 \\(n\\)。`);
      answers.push(
        `簡答：\\(n=${n}\\)。過程：內角和為 \\((n-2)180°\\)。等差角總和為 \\(\\frac{n[2\\cdot${first}+(n-1)\\cdot${d}]}{2}\\)。代入檢查得 \\(n=${n}\\) 時，總和為 ${total}°，符合 \\((n-2)180°\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ431RegularPolygonAngleSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    const regularNs = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20];
    for (let i = 0; i < count; i += 1) {
      const mode = (i + startOffset) % 5;
      if (mode === 0) {
        const n = regularNs[randInt(0, regularNs.length - 1)];
        const angle = makeFraction((n - 2) * 180, n);
        questions.push(`求正 ${n} 邊形的一個內角是多少度？`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(angle)}°\\)。過程：正 \\(n\\) 邊形每個內角相等，為 \\(\\frac{(${n}-2)\\times180°}{${n}}=${formatFunctionFractionValue(angle)}°\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const n = regularNs[randInt(0, regularNs.length - 1)];
        const angle = makeFraction((n - 2) * 180, n);
        questions.push(
          `若一個正多邊形的每一個內角為 \\(${formatFunctionFractionValue(angle)}°\\)，則此多邊形為幾邊形？`
        );
        answers.push(
          `簡答：正 ${n} 邊形。過程：正多邊形外角為 \\(180°-${formatFunctionFractionValue(angle)}°=${formatFunctionFractionValue(makeFraction(360, n))}°\\)，邊數 \\(n=\\frac{360°}{${formatFunctionFractionValue(makeFraction(360, n))}°}=${n}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const n = [5, 6, 8, 9, 10, 12, 15, 18][randInt(0, 7)];
        const exterior = makeFraction(360, n);
        questions.push(
          `已知一個正多邊形的每一個外角為 \\(${formatFunctionFractionValue(exterior)}°\\)，求其邊數 \\(n\\)。`
        );
        answers.push(
          `簡答：\\(n=${n}\\)。過程：正多邊形外角和為 360°，每一外角相等，所以 \\(n=\\frac{360}{${formatFunctionFractionValue(exterior)}}=${n}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const n = [6, 8, 10, 12, 15][randInt(0, 4)];
        const interior = makeFraction((n - 2) * 180, n);
        const exterior = makeFraction(360, n);
        const ratio = divFraction(interior, exterior);
        questions.push(
          `若某正多邊形的一個內角度數是其外角度數的 ${formatFunctionFractionValue(ratio)} 倍，求此多邊形的內角和。`
        );
        answers.push(
          `簡答：${(n - 2) * 180}°。過程：設邊數為 \\(n\\)，\\(\\frac{內角}{外角}=\\frac{180-360/n}{360/n}=\\frac{${n - 2}}{2}=${formatFunctionFractionValue(ratio)}\\)，得 \\(n=${n}\\)。內角和為 \\((${n}-2)180=${(n - 2) * 180}°\\)。`
        );
        continue;
      }
      const n1 = [6, 8, 10, 12][randInt(0, 3)];
      const n2 = n1 + [1, 2, 4][randInt(0, 2)];
      const angle1 = makeFraction((n1 - 2) * 180, n1);
      const angle2 = makeFraction((n2 - 2) * 180, n2);
      const diff = subFraction(angle2, angle1);
      questions.push(`計算正 ${n1} 邊形與正 ${n2} 邊形各一個內角的度數相差多少？`);
      answers.push(
        `簡答：\\(${formatFunctionFractionValue(absFraction(diff))}°\\)。過程：正 ${n1} 邊形一內角為 \\(${formatFunctionFractionValue(angle1)}°\\)，正 ${n2} 邊形一內角為 \\(${formatFunctionFractionValue(angle2)}°\\)，相差 \\(${formatFunctionFractionValue(absFraction(diff))}°\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ431PolygonAngleMixedSet(count) {
    const banks = [buildJ431TriangleInteriorAngleSet, buildJ431PolygonInteriorSumSet, buildJ431RegularPolygonAngleSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1, Math.floor(i / banks.length));
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ431ComplementarySupplementaryAngleSet(count) {
    const questions = [];
    const answers = [];
    const ratioPairs = [
      [1, 2],
      [2, 3],
      [3, 7],
      [4, 5],
      [5, 7],
      [7, 8],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        let ratio = ratioPairs[randInt(0, ratioPairs.length - 1)];
        let unit = 180 / (ratio[0] + ratio[1]);
        while (!Number.isInteger(unit)) {
          ratio = ratioPairs[randInt(0, ratioPairs.length - 1)];
          unit = 180 / (ratio[0] + ratio[1]);
        }
        const angleA = ratio[0] * unit;
        const angleB = ratio[1] * unit;
        questions.push(
          `已知 \\(\\angle A\\) 與 \\(\\angle B\\) 互為補角，且 \\(\\angle A:\\angle B=${ratio[0]}:${ratio[1]}\\)，求 \\(\\angle A\\) 的度數。`
        );
        answers.push(
          `簡答：\\(\\angle A=${angleA}°\\)。過程：互為補角表示兩角和為 180°。比例共 ${ratio[0] + ratio[1]} 份，一份為 ${unit}°，所以 \\(\\angle A=${ratio[0]}\\cdot${unit}°=${angleA}°\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const k = [3, 4, 6, 10][randInt(0, 3)];
        const angle = (90 * (k - 2)) / (k - 1);
        questions.push(`若 \\(\\angle A\\) 的補角是 \\(\\angle A\\) 餘角的 ${k} 倍，求 \\(\\angle A\\) 是多少度？`);
        answers.push(
          `簡答：\\(\\angle A=${angle}°\\)。過程：\\(\\angle A\\) 的補角為 \\(180°-A\\)，餘角為 \\(90°-A\\)。由 \\(180-A=${k}(90-A)\\)，解得 \\(A=${angle}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const x = randInt(10, 35);
        const a = randInt(2, 5);
        const c = randInt(2, 5);
        const b = randInt(5, 40);
        const d = 180 - (a + c) * x - b;
        if (a * x + b <= 0 || c * x + d <= 0 || d < -40 || d > 60) {
          i -= 1;
          continue;
        }
        const angle1 = a * x + b;
        const angle2 = c * x + d;
        const expr1 = formatFunctionLinear(a, b);
        const expr2 = formatFunctionLinear(c, d);
        questions.push(
          `若 \\(\\angle 1=(${expr1})°\\)，\\(\\angle 2=(${expr2})°\\)，且 \\(\\angle 1\\) 與 \\(\\angle 2\\) 互補，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：互補表示兩角和為 180°，所以 \\((${expr1})+(${expr2})=180\\)，化簡得 \\(${formatFunctionLinear(a + c, b + d)}=180\\)，解得 \\(x=${x}\\)。此時兩角為 ${angle1}°、${angle2}°。`
        );
        continue;
      }
      if (mode === 3) {
        const angle3 = randInt(20, 70);
        const angle2 = 90 - angle3;
        const angle1 = 180 - angle2;
        questions.push(
          `若 \\(\\angle 1\\) 是 \\(\\angle 2\\) 的補角，\\(\\angle 2\\) 是 \\(\\angle 3\\) 的餘角，已知 \\(\\angle 3=${angle3}°\\)，求 \\(\\angle 1\\)。`
        );
        answers.push(
          `簡答：\\(\\angle 1=${angle1}°\\)。過程：\\(\\angle 2\\) 是 \\(\\angle 3\\) 的餘角，所以 \\(\\angle 2=90°-${angle3}°=${angle2}°\\)。\\(\\angle 1\\) 是 \\(\\angle 2\\) 的補角，所以 \\(\\angle 1=180°-${angle2}°=${angle1}°\\)。`
        );
        continue;
      }
      const extra = [10, 15, 20, 25, 30, 35, 40][randInt(0, 6)];
      questions.push(`一個角的補角比它的餘角的 2 倍多 ${extra}°，求這個角的度數。`);
      answers.push(
        `簡答：${extra}°。過程：設此角為 \\(x°\\)，補角為 \\(180°-x\\)，餘角為 \\(90°-x\\)。依題意 \\(180-x=2(90-x)+${extra}\\)，化簡得 \\(x=${extra}\\)。`
      );
    }
    return { questions, answers };
  }

  function bisectionCountForParts(parts) {
    let value = Number(parts);
    let count = 0;
    while (value > 1 && value % 2 === 0) {
      value /= 2;
      count += 1;
    }
    return value === 1 ? count : null;
  }

  function buildJ432ConstructionBisectionSet(count) {
    const questions = [];
    const answers = [];
    const ratioCores = [
      [1, 3],
      [3, 5],
      [5, 11],
      [7, 9],
      [7, 25],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const core = ratioCores[randInt(0, ratioCores.length - 1)];
        const scale = [1, 2, 3, 4, 5][randInt(0, 4)];
        const left = core[0] * scale;
        const right = core[1] * scale;
        const totalParts = core[0] + core[1];
        const steps = bisectionCountForParts(totalParts);
        questions.push(`若欲將線段 \\(AB\\) 分成 ${left}:${right} 的兩段，至少需作幾次「中垂線作圖」？`);
        answers.push(
          `簡答：${steps} 次。過程：比例 ${left}:${right} 先約分為 ${core[0]}:${core[1]}，共 ${totalParts} 等份。每作一次中垂線可把現有小段再二等分，所以要得到 ${totalParts} 等份需連續二分 ${steps} 次。`
        );
        continue;
      }
      if (mode === 1) {
        const divisor = [4, 8, 16][randInt(0, 2)];
        const basePool = [64, 80, 96, 112, 120, 128, 144, 160, 192, 240].filter((value) => value % divisor === 0);
        const base = basePool[randInt(0, basePool.length - 1)];
        const target = base / divisor;
        const steps = bisectionCountForParts(divisor);
        questions.push(`若要將一個 ${base}° 的角平分出一個 ${target}° 的角，至少需利用「角平分線作圖」幾次？`);
        answers.push(
          `簡答：${steps} 次。過程：${base}° 要變成 ${target}°，等於要分成 \\(\\frac{${base}}{${target}}=${divisor}\\) 等份。因為 ${divisor}=2^${steps}，所以需連續作 ${steps} 次角平分線。`
        );
        continue;
      }
      if (mode === 2) {
        const denominator = [4, 8, 16, 32][randInt(0, 3)];
        const totalPool = [8, 12, 16, 20, 24, 32, 40, 48, 64].filter((value) => value % denominator === 0);
        const total = totalPool[randInt(0, totalPool.length - 1)];
        if (total % denominator !== 0) {
          i -= 1;
          continue;
        }
        const numeratorPool = Array.from({ length: denominator - 1 }, (_, index) => index + 1).filter(
          (value) => bisectionCountForParts(denominator / gcdInt(value, denominator)) >= 2
        );
        const numerator = numeratorPool[randInt(0, numeratorPool.length - 1)];
        const length = (total / denominator) * numerator;
        const g = gcdInt(length, total);
        const reducedDen = total / g;
        const steps = bisectionCountForParts(reducedDen);
        if (steps === null || steps < 2) {
          i -= 1;
          continue;
        }
        if (numerator === 1) {
          questions.push(
            `若要在 \\(AB\\) 上作出長度為原線段 \\(\\frac{1}{${denominator}}\\) 的小段，至少需作幾次中點作圖？`
          );
          answers.push(
            `簡答：${steps} 次。過程：長度變為原來的 \\(\\frac{1}{${denominator}}\\)，表示要連續二分到 ${denominator} 等份。因為 ${denominator}=2^${steps}，所以至少需 ${steps} 次。`
          );
        } else {
          questions.push(
            `已知線段 \\(AB=${total}\\) 公分，欲在其上找一點 \\(C\\) 使 \\(AC=${length}\\) 公分；若只用中點作圖法，最少需作幾次？`
          );
          answers.push(
            `簡答：${steps} 次。過程：\\(AC:AB=${length}:${total}\\)，約分後分母為 ${reducedDen}，表示需把 \\(AB\\) 分成 ${reducedDen} 等份才能定位。因為 ${reducedDen}=2^${steps}，所以最少需 ${steps} 次中點作圖。`
          );
        }
        continue;
      }
      if (mode === 3) {
        const parts = [4, 8, 16, 32][randInt(0, 3)];
        const points = parts - 1;
        questions.push(`若要把線段 \\(AB\\) 分成 ${parts} 等份，且所有等分點都要作出來，至少需要作幾次中垂線作圖？`);
        answers.push(
          `簡答：${points} 次。過程：分成 ${parts} 等份時，線段內共有 ${parts}-1=${points} 個等分點需要作出；題目要求全部等分點，所以至少需 ${points} 次作圖。`
        );
        continue;
      }
      const angle = [80, 96, 112, 120, 144, 160][randInt(0, 5)];
      const steps = randInt(2, 4);
      const smallest = makeFraction(angle, 2 ** steps);
      questions.push(`已知 \\(\\angle A=${angle}°\\)，若連續作 ${steps} 次角平分線，則最小的角為多少度？`);
      answers.push(
        `簡答：\\(${formatFunctionFractionValue(smallest)}°\\)。過程：每作一次角平分線，角度變為原來的一半；連續 ${steps} 次後為 \\(\\frac{${angle}}{2^${steps}}=${formatFunctionFractionValue(smallest)}°\\)。`
      );
    }
    return { questions, answers };
  }

  function pickAcuteAngle() {
    return randInt(20, 80);
  }

  function pickObtuseAngle() {
    return randInt(100, 160);
  }

  function formatAngleOptions(values) {
    return values.map((value) => `${value}°`).join(' 或 ');
  }

  function angleParallelValues(angle) {
    const other = 180 - angle;
    return angle === other ? [angle] : [angle, other].sort((a, b) => a - b);
  }

  function anglePerpValues(angle) {
    return angleParallelValues(angle);
  }

  function angleMixedValues(angle) {
    if (angle < 90) return [90 - angle, 90 + angle];
    return [angle - 90, 270 - angle];
  }

  function buildJ441ParallelAcuteSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickAcuteAngle();
      const values = angleParallelValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知銳角 \\(\\angle A=${angle}°\\)，且 \\(\\angle A\\) 的兩邊分別平行於 \\(\\angle B\\) 的兩邊，求 \\(\\angle B\\) 所有可能的度數。`
        );
      } else if (mode === 1) {
        questions.push(`若兩個角的對應邊互相平行，其中一角為 ${angle}°，則另一角在 180° 以內可能是多少度？`);
      } else {
        questions.push(
          `銳角 \\(\\angle A\\) 為 ${angle}°。若 \\(\\angle B\\) 與它形成「兩邊平行型」，求 \\(\\angle B\\) 的可能值。`
        );
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：兩邊分別平行時，兩角可能相等或互補，所以 \\(\\angle B=${angle}°\\) 或 \\(180°-${angle}°=${180 - angle}°\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ441ParallelObtuseSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickObtuseAngle();
      const values = angleParallelValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知鈍角 \\(\\angle A=${angle}°\\)，且 \\(\\angle A\\) 的兩邊分別平行於 \\(\\angle B\\) 的兩邊，求 \\(\\angle B\\) 所有可能的度數。`
        );
      } else if (mode === 1) {
        questions.push(
          `若 \\(\\angle A=${angle}°\\)，另一角的兩邊分別與 \\(\\angle A\\) 的兩邊平行，則另一角可能為幾度？`
        );
      } else {
        questions.push(`鈍角 ${angle}° 經由兩邊平行型對應到另一個角，求另一角在 180° 以內的可能度數。`);
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：兩邊平行型會得到同角或補角，所以可能為 ${angle}°，也可能為 \\(180°-${angle}°=${180 - angle}°\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ441PerpendicularAcuteSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickAcuteAngle();
      const values = anglePerpValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知銳角 \\(\\angle A=${angle}°\\)，且 \\(\\angle A\\) 的兩邊分別垂直於 \\(\\angle B\\) 的兩邊，求 \\(\\angle B\\) 所有可能的度數。`
        );
      } else if (mode === 1) {
        questions.push(`兩個角的對應邊互相垂直，若其中一角為 ${angle}°，另一角可能是多少度？`);
      } else {
        questions.push(`銳角 ${angle}° 與另一角屬於「兩邊垂直型」，求另一角在 180° 以內的可能值。`);
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：兩邊分別垂直時，旋轉後的夾角關係仍可能相等或互補，所以 \\(\\angle B=${angle}°\\) 或 \\(180°-${angle}°=${180 - angle}°\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ441PerpendicularObtuseSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickObtuseAngle();
      const values = anglePerpValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知鈍角 \\(\\angle A=${angle}°\\)，且 \\(\\angle A\\) 的兩邊分別垂直於 \\(\\angle B\\) 的兩邊，求 \\(\\angle B\\) 所有可能的度數。`
        );
      } else if (mode === 1) {
        questions.push(`若一個 ${angle}° 的角與另一角兩邊互相垂直，另一角可能是多少度？`);
      } else {
        questions.push(
          `鈍角 \\(\\angle A=${angle}°\\)。若 \\(\\angle B\\) 是兩邊垂直型對應角，求 \\(\\angle B\\) 的可能度數。`
        );
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：兩邊垂直型同樣會出現同角或補角，所以可能為 ${angle}° 或 \\(180°-${angle}°=${180 - angle}°\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ441MixedAcuteSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickAcuteAngle();
      const values = angleMixedValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知銳角 \\(\\angle A=${angle}°\\)，\\(\\angle A\\) 與 \\(\\angle B\\) 的一邊互相平行，另一邊互相垂直，求 \\(\\angle B\\) 在 180° 以內的度數。`
        );
      } else if (mode === 1) {
        questions.push(`若一個 ${angle}° 的銳角與另一角呈「一平行一垂直型」，求另一角可能是多少度？`);
      } else {
        questions.push(
          `銳角 \\(\\angle A=${angle}°\\)。若 \\(\\angle B\\) 有一邊與 \\(\\angle A\\) 平行，另一邊與 \\(\\angle A\\) 垂直，求 \\(\\angle B\\) 的可能值。`
        );
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：一平行一垂直時，會與 90° 形成互餘或相差 90°。因 \\(\\angle A\\) 為銳角，所以 \\(\\angle B=90°-${angle}°=${90 - angle}°\\) 或 \\(90°+${angle}°=${90 + angle}°\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ441MixedObtuseSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickObtuseAngle();
      const values = angleMixedValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知鈍角 \\(\\angle A=${angle}°\\)，\\(\\angle A\\) 與 \\(\\angle B\\) 的一邊互相平行，另一邊互相垂直，求 \\(\\angle B\\) 在 180° 以內的度數。`
        );
      } else if (mode === 1) {
        questions.push(`若一個 ${angle}° 的鈍角與另一角呈「一平行一垂直型」，求另一角可能是多少度？`);
      } else {
        questions.push(
          `鈍角 \\(\\angle A=${angle}°\\)。若 \\(\\angle B\\) 有一邊與 \\(\\angle A\\) 平行、另一邊與 \\(\\angle A\\) 垂直，求 \\(\\angle B\\) 的可能值。`
        );
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：一平行一垂直且 \\(\\angle A\\) 為鈍角時，常用 180° 內角處理：相差 90° 得 \\(${angle}°-90°=${angle - 90}°\\)，另一個為 \\(270°-${angle}°=${270 - angle}°\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ441ParallelPerpendicularAngleMixedSet(count) {
    const banks = [
      buildJ441ParallelAcuteSet,
      buildJ441ParallelObtuseSet,
      buildJ441PerpendicularAcuteSet,
      buildJ441PerpendicularObtuseSet,
      buildJ441MixedAcuteSet,
      buildJ441MixedObtuseSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1, Math.floor(i / banks.length));
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  const J442_SHAPE_CODES = [
    { code: '甲', name: '正方形', props: ['A', 'B', 'D', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N'] },
    { code: '乙', name: '矩形', props: ['B', 'E', 'G', 'H', 'J', 'K', 'M'] },
    { code: '丙', name: '菱形', props: ['A', 'B', 'D', 'E', 'H', 'K', 'L', 'N'] },
    { code: '丁', name: '平行四邊形', props: ['B', 'E', 'H', 'K'] },
    { code: '戊', name: '等腰梯形', props: ['C', 'F', 'J', 'M'] },
    { code: '己', name: '箏形', props: ['D', 'I', 'L', 'O'] },
  ];

  const J442_PROPERTY_CODES = [
    { code: 'A', name: '四邊等長' },
    { code: 'B', name: '二組對邊等長' },
    { code: 'C', name: '只一組對邊等長' },
    { code: 'D', name: '二組鄰邊等長' },
    { code: 'E', name: '二組對邊平行' },
    { code: 'F', name: '只一組對邊平行' },
    { code: 'G', name: '四角垂直' },
    { code: 'H', name: '二組對角相等' },
    { code: 'I', name: '只一組對角相等' },
    { code: 'J', name: '二組鄰角相等' },
    { code: 'K', name: '對角線互相平分' },
    { code: 'L', name: '對角線互相垂直' },
    { code: 'M', name: '對角線等長' },
    { code: 'N', name: '二對角線為角平分線' },
    { code: 'O', name: '只一對角線為角平分線' },
  ];

  function formatJ442ShapeList() {
    return J442_SHAPE_CODES.map((item) => `${item.code}. ${item.name}`).join('；');
  }

  function formatJ442PropertyList() {
    return J442_PROPERTY_CODES.map((item) => `${item.code}. ${item.name}`).join('；');
  }

  function j442PropertyNames(codes) {
    const names = codes.map((code) => J442_PROPERTY_CODES.find((item) => item.code === code)?.name || code);
    return names.join('、');
  }

  function j442ShapeNames(codes) {
    const names = codes.map((code) => J442_SHAPE_CODES.find((item) => item.code === code)?.name || code);
    return names.join('、');
  }

  function j442ShapesForProperty(propertyCode) {
    return J442_SHAPE_CODES.filter((shape) => shape.props.includes(propertyCode)).map((shape) => shape.code);
  }

  function buildJ442QuadrilateralPropertyCodeSet(count) {
    const questions = [];
    const answers = [];
    const shapeList = formatJ442ShapeList();
    const propertyList = formatJ442PropertyList();
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const prompts = J442_SHAPE_CODES.map((shape, index) => `(${index + 1}) ${shape.name}`).join(' ');
        const simple = J442_SHAPE_CODES.map((shape) => `${shape.name}: ${shape.props.join('、')}`).join('\n');
        const process = J442_SHAPE_CODES.map(
          (shape) => `${shape.name} 具有 ${j442PropertyNames(shape.props)}，所以填 ${shape.props.join('、')}`
        ).join('\n');
        questions.push(`性質代號選項：${propertyList}。請依每個圖形，填入它必定具有的性質代號：${prompts}。`);
        answers.push(`簡答：\n${simple}\n過程：\n${process}`);
        continue;
      }
      const selectedProps = shuffle(J442_PROPERTY_CODES).slice(0, 4);
      const prompts = selectedProps.map((prop, index) => `(${index + 1}) ${prop.name}`).join(' ');
      const simple = selectedProps
        .map((prop) => `${prop.name}: ${j442ShapesForProperty(prop.code).join('、')}`)
        .join('\n');
      const process = selectedProps
        .map((prop) => {
          const shapeCodes = j442ShapesForProperty(prop.code);
          return `具有「${prop.name}」的圖形是 ${j442ShapeNames(shapeCodes)}，所以填 ${shapeCodes.join('、')}`;
        })
        .join('\n');
      questions.push(`圖形代號選項：${shapeList}。請依每個性質名稱，填入符合的圖形代號：${prompts}。`);
      answers.push(`簡答：\n${simple}\n過程：\n${process}`);
    }
    return { questions, answers };
  }

  function formatS111RepeatingDecimal(integerPart, nonRepeat, repeat) {
    return `${integerPart}.${nonRepeat || ''}\\overline{${repeat}}`;
  }

  function buildS111RepeatingDecimalFractionSet(count) {
    const questions = [];
    const answers = [];
    const patterns = [
      { intMin: 0, intMax: 0, nonRepeatLen: 0, repeatLen: 2 },
      { intMin: 0, intMax: 0, nonRepeatLen: 0, repeatLen: 3 },
      { intMin: 0, intMax: 0, nonRepeatLen: 1, repeatLen: 1 },
      { intMin: 1, intMax: 4, nonRepeatLen: 0, repeatLen: 3 },
      { intMin: 0, intMax: 0, nonRepeatLen: 2, repeatLen: 2 },
    ];
    const randomDigits = (len, firstCanBeZero = true) => {
      let text = '';
      for (let i = 0; i < len; i += 1) {
        const digit = i === 0 && !firstCanBeZero ? randInt(1, 9) : randInt(0, 9);
        text += `${digit}`;
      }
      return text;
    };
    const toNumber = (text) => (text ? Number(text) : 0);

    for (let i = 0; i < count; i += 1) {
      const pattern = patterns[i % patterns.length];
      let repeat = randomDigits(pattern.repeatLen, false);
      while (/^0+$/.test(repeat)) repeat = randomDigits(pattern.repeatLen, false);
      const nonRepeat = randomDigits(pattern.nonRepeatLen, true);
      const integerPart = randInt(pattern.intMin, pattern.intMax);
      const m = nonRepeat.length;
      const r = repeat.length;
      const denominator = 10 ** m * (10 ** r - 1);
      const numeratorPart = toNumber(`${nonRepeat}${repeat}`) - toNumber(nonRepeat);
      const totalNumerator = integerPart * denominator + numeratorPart;
      const value = reduceFraction(totalNumerator, denominator);
      const decimalText = formatS111RepeatingDecimal(integerPart, nonRepeat, repeat);
      const prefixText = nonRepeat ? `非循環部分為 ${nonRepeat}，` : '';
      questions.push(`將 \\(${decimalText}\\) 化為最簡分數。`);
      answers.push(
        `簡答：\\(${formatFraction(value.numerator, value.denominator)}\\)。過程：${prefixText}循環節為 ${repeat}。小數部分 \\(=\\frac{${toNumber(`${nonRepeat}${repeat}`)}-${toNumber(nonRepeat)}}{10^{${m}}(10^{${r}}-1)}=\\frac{${numeratorPart}}{${denominator}}\\)。加上整數部分後得 \\(\\frac{${totalNumerator}}{${denominator}}=${formatFraction(value.numerator, value.denominator)}\\)。`
      );
    }
    return { questions, answers };
  }

  function formatS111SignedRadicalTerm(coeff, inside, sign) {
    const radical = inside === 1 ? `${coeff}` : `${coeff === 1 ? '' : coeff}\\sqrt{${inside}}`;
    return sign === '-' ? `-${radical}` : `+${radical}`;
  }

  function formatS111RadicalSum(left, sign, right) {
    if (sign === '+') return `${left}+${right}`;
    return `${left}-${right}`;
  }

  function buildS111NestedRadicalSimplifySet(count) {
    const questions = [];
    const answers = [];
    while (questions.length < count) {
      const sign = questions.length % 2 === 0 ? '-' : '+';
      const p = randInt(1, 24);
      const q = randInt(1, 24);
      if (p === q) continue;
      if (sign === '-' && p < q) continue;
      if (simplifyRadical(p).inside === simplifyRadical(q).inside) continue;
      const inner = simplifyRadical(p * q);
      if (inner.inside === 1) continue;
      if (inner.inside > 72) continue;
      const coeff = 2 * inner.outside;
      const constant = p + q;
      const left = formatRadical(sign === '-' ? p : Math.max(p, q));
      const right = formatRadical(sign === '-' ? q : Math.min(p, q));
      const answerText =
        sign === '-'
          ? formatS111RadicalSum(formatRadical(p), '-', formatRadical(q))
          : formatS111RadicalSum(formatRadical(Math.max(p, q)), '+', formatRadical(Math.min(p, q)));
      const middleTerm = formatS111SignedRadicalTerm(coeff, inner.inside, sign);
      questions.push(`化簡 \\(\\sqrt{${constant}${middleTerm}}\\)。`);
      answers.push(
        `簡答：\\(${answerText}\\)。過程：因為 \\((${left}${sign === '+' ? '+' : '-'}${right})^2=${p}+${q}${middleTerm}=${constant}${middleTerm}\\)，且根號表示非負值，所以 \\(\\sqrt{${constant}${middleTerm}}=${answerText}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS111RadicalIntegerFractionalPartSet(count) {
    const questions = [];
    const answers = [];
    const nonSquares = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19];
    for (let i = 0; i < count; i += 1) {
      const sign = i % 2 === 0 ? '+' : '-';
      const n = nonSquares[randInt(0, nonSquares.length - 1)];
      const rootFloor = Math.floor(Math.sqrt(n));
      const rootCeil = rootFloor + 1;
      let c = randInt(rootCeil + 1, rootCeil + 6);
      if (sign === '+') c = randInt(1, 6);
      const constant = c * c + n;
      const middle = simplifyRadical(c * c * n);
      if (middle.inside === 1) {
        i -= 1;
        continue;
      }
      const coeff = 2 * middle.outside;
      const middleTerm = formatS111SignedRadicalTerm(coeff, middle.inside, sign);
      const simplified = sign === '+' ? `${c}+\\sqrt{${n}}` : `${c}-\\sqrt{${n}}`;
      const a = sign === '+' ? c + rootFloor : c - rootCeil;
      const b = sign === '+' ? `\\sqrt{${n}}-${rootFloor}` : `${rootCeil}-\\sqrt{${n}}`;
      if (a < 0) {
        i -= 1;
        continue;
      }
      questions.push(
        `設 \\(\\sqrt{${constant}${middleTerm}}\\) 的整數部分為 \\(a\\)，正小數部分為 \\(b\\)，求 \\(a,b\\)。`
      );
      answers.push(
        `簡答：\\(a=${a},\\ b=${b}\\)。過程：\\(\\sqrt{${constant}${middleTerm}}=${simplified}\\)。又 \\(${rootFloor}<\\sqrt{${n}}<${rootCeil}\\)，所以此數介於 \\(${a}\\) 與 \\(${a + 1}\\) 之間，整數部分 \\(a=${a}\\)，正小數部分 \\(b=(${simplified})-${a}=${b}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS111RationalIrrationalTrueFalseSet(count) {
    const questions = [];
    const answers = [];
    const items = [
      {
        statement: '若 \\(a,b\\) 均為無理數，則 \\(a+b\\) 必為無理數。',
        truth: false,
        process: '反例：取 \\(a=\\sqrt{2}, b=-\\sqrt{2}\\)，兩者都是無理數，但 \\(a+b=0\\) 是有理數。',
      },
      {
        statement: '若 \\(a\\) 為有理數且 \\(b\\) 為無理數，則 \\(a+b\\) 必為無理數。',
        truth: true,
        process: '若 \\(a+b\\) 是有理數，則 \\(b=(a+b)-a\\) 也會是有理數，與 \\(b\\) 為無理數矛盾。',
      },
      {
        statement: '若 \\(a\\) 為非零有理數且 \\(b\\) 為無理數，則 \\(ab\\) 必為無理數。',
        truth: true,
        process: '若 \\(ab\\) 是有理數，因 \\(a\\neq0\\) 且 \\(a\\) 有理，則 \\(b=\\frac{ab}{a}\\) 會是有理數，矛盾。',
      },
      {
        statement: '若 \\(a,b\\) 均為無理數，則 \\(ab\\) 必為無理數。',
        truth: false,
        process: '反例：取 \\(a=b=\\sqrt{2}\\)，則 \\(ab=2\\) 是有理數。',
      },
      {
        statement: '若 \\(a+b\\) 與 \\(a-b\\) 均為有理數，則 \\(a,b\\) 必為有理數。',
        truth: true,
        process: '因 \\(a=\\frac{(a+b)+(a-b)}{2}\\)，\\(b=\\frac{(a+b)-(a-b)}{2}\\)，有理數經加減除以 2 後仍為有理數。',
      },
      {
        statement: '任意兩個相異有理數之間，必存在另一個有理數。',
        truth: true,
        process: '設兩有理數為 \\(p<q\\)，則平均數 \\(\\frac{p+q}{2}\\) 仍為有理數，且位於 \\(p\\) 與 \\(q\\) 之間。',
      },
      {
        statement: '若 \\(a^2\\) 為有理數，則 \\(a\\) 必為有理數。',
        truth: false,
        process: '反例：取 \\(a=\\sqrt{2}\\)，則 \\(a^2=2\\) 是有理數，但 \\(a\\) 是無理數。',
      },
      {
        statement: '若 \\(a^3\\) 與 \\(a^8\\) 均為有理數，則 \\(a\\) 必為有理數。',
        truth: true,
        process:
          '若 \\(a=0\\) 則為有理數；若 \\(a\\neq0\\)，則 \\(a=\\frac{a^9}{a^8}=\\frac{(a^3)^3}{a^8}\\)，分子分母皆為有理數，所以 \\(a\\) 為有理數。',
      },
      {
        statement: '非零無理數的倒數必為無理數。',
        truth: true,
        process: '若 \\(\\frac{1}{a}\\) 是有理數且不為 0，則 \\(a\\) 會是此有理數的倒數，也會是有理數，矛盾。',
      },
      {
        statement: '若 \\(a\\) 為有理數、\\(b\\) 為無理數，則 \\(a-b\\) 必為無理數。',
        truth: true,
        process: '若 \\(a-b\\) 是有理數，則 \\(b=a-(a-b)\\) 也會是有理數，與 \\(b\\) 為無理數矛盾。',
      },
    ];
    const selected = shuffle(items);
    for (let i = 0; i < count; i += 1) {
      const item = selected[i % selected.length];
      questions.push(`判斷是非，並說明理由：${item.statement}`);
      answers.push(`簡答：${item.truth ? '正確' : '錯誤'}。過程：${item.process}`);
    }
    return { questions, answers };
  }

  function formatS111SurdPart(coeff, radical) {
    const abs = Math.abs(coeff);
    const body = `${abs === 1 ? '' : abs}\\sqrt{${radical}}`;
    return coeff < 0 ? `-${body}` : `+${body}`;
  }

  function formatS111SurdBinomial(rational, coeff, radical) {
    if (coeff === 0) return `${rational}`;
    if (rational === 0) {
      const part = formatS111SurdPart(coeff, radical);
      return part.startsWith('+') ? part.slice(1) : part;
    }
    return `${rational}${formatS111SurdPart(coeff, radical)}`;
  }

  function formatS111LinearEquationRow(a, xName, b, yName, value) {
    const left = `${formatTerm(a, xName)} ${b < 0 ? '- ' : '+ '}${formatTerm(Math.abs(b), yName)}`;
    return `${left}=${value}`;
  }

  function buildS111IrrationalEqualitySolveSet(count) {
    const questions = [];
    const answers = [];
    const radicals = [2, 3, 5, 6, 7, 10, 11];
    while (questions.length < count) {
      const mode = questions.length % 5;
      const radical = radicals[randInt(0, radicals.length - 1)];

      if (mode === 0 || mode === 1) {
        const x = pickNonZero(-5, 5);
        const y = pickNonZero(-5, 5);
        let a = pickNonZero(-4, 5);
        let c = pickNonZero(-4, 5);
        let b = pickNonZero(-4, 5);
        let d = pickNonZero(-4, 5);
        while (a * d - b * c === 0) {
          a = pickNonZero(-4, 5);
          c = pickNonZero(-4, 5);
          b = pickNonZero(-4, 5);
          d = pickNonZero(-4, 5);
        }
        const rationalTarget = a * x + c * y;
        const irrationalTarget = b * x + d * y;
        const left = `(${formatS111SurdBinomial(a, b, radical)})x+(${formatS111SurdBinomial(c, d, radical)})y`;
        const right = formatS111SurdBinomial(rationalTarget, irrationalTarget, radical);
        if (mode === 0) {
          questions.push(`設 \\(x,y\\) 為有理數，若 \\(${left}=${right}\\)，求 \\(x,y\\) 的值。`);
          answers.push(
            `簡答：\\(x=${x},\\ y=${y}\\)。過程：比較有理數部分與 \\(\\sqrt{${radical}}\\) 的係數，得 \\(${formatS111LinearEquationRow(a, 'x', c, 'y', rationalTarget)}\\)、\\(${formatS111LinearEquationRow(b, 'x', d, 'y', irrationalTarget)}\\)。解聯立方程式，得 \\(x=${x},\\ y=${y}\\)。`
          );
        } else {
          questions.push(`設 \\(x,y\\in\\mathbb{Q}\\)，若 \\(${left}=${right}\\)，求 \\(x+y\\)。`);
          answers.push(
            `簡答：\\(${x + y}\\)。過程：比較有理數部分與 \\(\\sqrt{${radical}}\\) 的係數，得 \\(${formatS111LinearEquationRow(a, 'x', c, 'y', rationalTarget)}\\)、\\(${formatS111LinearEquationRow(b, 'x', d, 'y', irrationalTarget)}\\)。解得 \\(x=${x},\\ y=${y}\\)，所以 \\(x+y=${x + y}\\)。`
          );
        }
        continue;
      }

      if (mode === 2) {
        const aValue = pickNonZero(-5, 7);
        const bValue = pickNonZero(-5, 7);
        const r = 2 * aValue - bValue;
        const s = aValue + 2 * bValue;
        questions.push(
          `設 \\(a,b\\in\\mathbb{Q}\\)，若 \\((a-b)+(a+b)\\sqrt{${radical}}=(${r}-a)+(${s}-b)\\sqrt{${radical}}\\)，求 \\(a,b\\)。`
        );
        answers.push(
          `簡答：\\(a=${aValue},\\ b=${bValue}\\)。過程：比較有理數部分得 \\(a-b=${r}-a\\)，比較 \\(\\sqrt{${radical}}\\) 的係數得 \\(a+b=${s}-b\\)。解此聯立方程式，得 \\(a=${aValue},\\ b=${bValue}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const aValue = pickNonZero(-4, 6);
        const bValue = pickNonZero(-4, 6);
        let p = pickNonZero(1, 4);
        let q = pickNonZero(1, 4);
        let r = pickNonZero(1, 4);
        let s = pickNonZero(1, 4);
        while (p * s - q * r === 0) {
          p = pickNonZero(1, 4);
          q = pickNonZero(1, 4);
          r = pickNonZero(1, 4);
          s = pickNonZero(1, 4);
        }
        const rationalTarget = p * aValue + r * bValue;
        const irrationalTarget = q * aValue + s * bValue;
        questions.push(
          `設 \\(a,b\\) 為有理數，若 \\((${formatS111SurdBinomial(p, q, radical)})a+(${formatS111SurdBinomial(r, s, radical)})b=${formatS111SurdBinomial(rationalTarget, irrationalTarget, radical)}\\)，求 \\(a,b\\)。`
        );
        answers.push(
          `簡答：\\(a=${aValue},\\ b=${bValue}\\)。過程：比較有理數部分與 \\(\\sqrt{${radical}}\\) 的係數，得 \\(${formatS111LinearEquationRow(p, 'a', r, 'b', rationalTarget)}\\)、\\(${formatS111LinearEquationRow(q, 'a', s, 'b', irrationalTarget)}\\)。解得 \\(a=${aValue},\\ b=${bValue}\\)。`
        );
        continue;
      }

      const x = pickNonZero(-5, 6);
      const y = pickNonZero(-5, 6);
      const m = randInt(2, 5);
      const n = randInt(2, 6);
      const rationalTarget = x + m * m;
      const irrationalTarget = y * n;
      questions.push(
        `若 \\(x,y\\in\\mathbb{Q}\\)，且 \\(x+${n}y\\sqrt{${radical}}+${m * m}=${formatS111SurdBinomial(rationalTarget, irrationalTarget, radical)}\\)，求 \\(x^2+y^2\\)。`
      );
      answers.push(
        `簡答：\\(${x * x + y * y}\\)。過程：比較有理數部分與 \\(\\sqrt{${radical}}\\) 的係數，得 \\(x+${m * m}=${rationalTarget}\\)、\\(${n}y=${irrationalTarget}\\)，所以 \\(x=${x}, y=${y}\\)，\\(x^2+y^2=${x * x + y * y}\\)。`
      );
    }
    return { questions, answers };
  }

  function formatS111PointFraction(fraction) {
    return formatFunctionFractionValue(fraction);
  }

  function buildS111NumberLineSectionSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = randInt(-10, 4);
        const b = a + randInt(4, 15);
        const m = randInt(2, 7);
        const n = randInt(2, 8);
        const p = makeFraction(n * a + m * b, m + n);
        questions.push(
          `數線上有 \\(A(${a}), B(${b})\\)，點 \\(P\\) 在線段 \\(AB\\) 上且 \\(PA:PB=${m}:${n}\\)，求 \\(P\\) 點坐標。`
        );
        answers.push(
          `簡答：\\(${formatS111PointFraction(p)}\\)。過程：內分點公式為 \\(P=\\frac{${n}\\cdot${a}+${m}\\cdot${b}}{${m}+${n}}=${formatS111PointFraction(p)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = randInt(-12, 0);
        const b = a + randInt(5, 16);
        let m = randInt(2, 8);
        let n = randInt(2, 8);
        while (m === n) n = randInt(2, 8);
        const internal = makeFraction(n * a + m * b, m + n);
        const external = makeFraction(m * b - n * a, m - n);
        questions.push(
          `數線上 \\(A(${a}), B(${b})\\)，點 \\(P\\) 滿足 \\(AP:PB=${m}:${n}\\)，求 \\(P\\) 點可能的所有坐標。`
        );
        answers.push(
          `簡答：\\(${formatS111PointFraction(internal)}\\)、\\(${formatS111PointFraction(external)}\\)。過程：一個點在 \\(AB\\) 之間，內分坐標為 \\(\\frac{${n}\\cdot${a}+${m}\\cdot${b}}{${m}+${n}}=${formatS111PointFraction(internal)}\\)；另一個點在線段外，外分坐標為 \\(\\frac{${m}\\cdot${b}-${n}\\cdot${a}}{${m}-${n}}=${formatS111PointFraction(external)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a = randInt(-8, 4);
        const b = a + randInt(5, 18);
        const m = randInt(2, 7);
        const n = randInt(2, 7);
        const p = makeFraction(n * a + m * b, m + n);
        questions.push(
          `設 \\(A(${a}), B(${b})\\)，\\(P\\) 介於 \\(A,B\\) 之間且 \\(AP:BP=${m}:${n}\\)，求 \\(P\\) 點坐標。`
        );
        answers.push(
          `簡答：\\(${formatS111PointFraction(p)}\\)。過程：\\(AP:BP=${m}:${n}\\) 表示 \\(P\\) 距離 \\(A\\) 佔全長的 \\(\\frac{${m}}{${m}+${n}}\\)。因此 \\(P=${a}+\\frac{${m}}{${m}+${n}}(${b}-${wrapIfNegative(a)})=${formatS111PointFraction(p)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const p0 = pickNonZero(-10, 10);
        const o = 0;
        let m = randInt(2, 7);
        let n = randInt(2, 7);
        while (m === n) n = randInt(2, 7);
        const internal = makeFraction(n * p0 + m * o, m + n);
        const external = makeFraction(m * o - n * p0, m - n);
        questions.push(
          `數線上有 \\(P(${p0}), O(0)\\)，點 \\(Q\\) 滿足 \\(PQ:QO=${m}:${n}\\)。求 \\(Q\\) 點坐標，並分成線段內與線段外兩種情形。`
        );
        answers.push(
          `簡答：線段內 \\(${formatS111PointFraction(internal)}\\)，線段外 \\(${formatS111PointFraction(external)}\\)。過程：線段內用內分公式 \\(Q=\\frac{${n}\\cdot${p0}+${m}\\cdot0}{${m}+${n}}=${formatS111PointFraction(internal)}\\)；線段外用外分公式 \\(Q=\\frac{${m}\\cdot0-${n}\\cdot${p0}}{${m}-${n}}=${formatS111PointFraction(external)}\\)。`
        );
        continue;
      }
      const aText = 'a';
      const bText = 'b';
      questions.push(`設 \\(a<b\\)，若 \\(P_1,P_2,P_3\\) 為 \\(a,b\\) 間的三個等分點，求 \\(P_2\\) 的坐標表示式。`);
      answers.push(
        `簡答：\\(\\frac{a+b}{2}\\)。過程：三個等分點會把 \\(a,b\\) 分成 4 等分，\\(P_2\\) 是第 2 個等分點，坐標為 \\(${aText}+\\frac{2}{4}(${bText}-${aText})=\\frac{a+b}{2}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS111AmgmExtremaSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const k = randInt(4, 10);
        const s = 2 * k;
        const c = randInt(2, 5);
        const max = makeFraction(s * s, 4 * c);
        questions.push(`設 \\(a,b>0\\) 且 \\(a+${c}b=${s}\\)，求 \\(ab\\) 的最大值。`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(max)}\\)。過程：令 \\(u=a, v=${c}b\\)，則 \\(u+v=${s}\\)。由算幾不等式，\\(uv\\leq (\\frac{${s}}{2})^2=${k * k}\\)。因 \\(uv=${c}ab\\)，所以 \\(ab\\leq ${formatFunctionFractionValue(max)}\\)，最大值為 \\(${formatFunctionFractionValue(max)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 5);
        const q = randInt(2, 6);
        const k = randInt(4, 9);
        const s = 2 * k;
        const max = makeFraction(s * s, 4 * p * q);
        questions.push(`設 \\(a,b>0\\) 且 \\(${p}a+${q}b=${s}\\)，求 \\(ab\\) 的最大值。`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(max)}\\)。過程：令 \\(u=${p}a, v=${q}b\\)，則 \\(u+v=${s}\\)。當 \\(u=v=${k}\\) 時，\\(uv\\) 最大為 ${k * k}。又 \\(uv=${p * q}ab\\)，所以 \\(ab\\) 最大為 \\(${formatFunctionFractionValue(max)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const p = randInt(2, 6);
        const q = randInt(2, 6);
        const t = randInt(2, 6);
        const product = t * t;
        const min = 2 * p * q * t;
        questions.push(`設 \\(x,y>0\\) 且 \\(xy=${product}\\)，求 \\(${p * p}x+${q * q}y\\) 的最小值。`);
        answers.push(
          `簡答：${min}。過程：由算幾不等式，\\(${p * p}x+${q * q}y\\geq2\\sqrt{${p * p}x\\cdot${q * q}y}=2\\cdot${p * q}\\sqrt{xy}=2\\cdot${p * q}\\cdot${t}=${min}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const product = [4, 6, 8, 9, 12, 16][randInt(0, 5)];
        const c = randInt(2, 6);
        const exact = simplifyRadical(c * product);
        const coeff = 2 * exact.outside;
        const g = gcdInt(coeff, product);
        const reducedCoeff = coeff / g;
        const reducedDen = product / g;
        const radicalNumerator = `${reducedCoeff === 1 ? '' : reducedCoeff}\\sqrt{${exact.inside}}`;
        const minText =
          exact.inside === 1
            ? formatFraction(coeff, product)
            : reducedDen === 1
              ? radicalNumerator
              : `\\frac{${radicalNumerator}}{${reducedDen}}`;
        questions.push(`設 \\(a,b>0\\) 且 \\(ab=${product}\\)，求 \\(\\frac{1}{a}+\\frac{${c}}{b}\\) 的最小值。`);
        answers.push(
          `簡答：\\(${minText}\\)。過程：\\(\\frac{1}{a}+\\frac{${c}}{b}\\geq2\\sqrt{\\frac{1}{a}\\cdot\\frac{${c}}{b}}=2\\sqrt{\\frac{${c}}{ab}}=2\\sqrt{\\frac{${c}}{${product}}}=${minText}\\)。`
        );
        continue;
      }
      const c = randInt(1, 5);
      questions.push(
        `設 \\(x,y\\) 為正實數且 \\(x+y=${2 * c}\\)，求 \\(\\frac{${2 * c}y}{x}+\\frac{${2 * c}x}{y}\\) 的最小值。`
      );
      answers.push(
        `簡答：${4 * c}。過程：令 \\(t=\\frac{y}{x}>0\\)，則原式 \\(=${2 * c}t+${2 * c}\\cdot\\frac{1}{t}\\geq2\\sqrt{${2 * c}t\\cdot${2 * c}\\cdot\\frac{1}{t}}=${4 * c}\\)。當 \\(t=1\\)，也就是 \\(x=y=${c}\\) 時取到最小值。`
      );
    }
    return { questions, answers };
  }

  function formatS111RootOrInteger(n) {
    const root = Math.floor(Math.sqrt(n));
    if (root * root === n) return `${root}`;
    return formatRadical(n);
  }

  function formatS111RootDifference(high, low) {
    const highRoot = Math.floor(Math.sqrt(high));
    const lowRoot = Math.floor(Math.sqrt(low));
    if (highRoot * highRoot === high && lowRoot * lowRoot === low) return `${highRoot - lowRoot}`;
    const highRad = simplifyRadical(high);
    const lowRad = simplifyRadical(low);
    if (highRad.inside === lowRad.inside && highRad.inside > 1) {
      const coeff = highRad.outside - lowRad.outside;
      if (coeff === 1) return `\\sqrt{${highRad.inside}}`;
      return `${coeff}\\sqrt{${highRad.inside}}`;
    }
    return `${formatS111RootOrInteger(high)}-${formatS111RootOrInteger(low)}`;
  }

  function buildS111RadicalIntegerRangeSet(count) {
    const questions = [];
    const answers = [];
    const nonSquares = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const n = nonSquares[randInt(0, nonSquares.length - 1)];
        const c = randInt(1, 6);
        const floor = Math.floor(Math.sqrt(n));
        const valueFloor = c + floor;
        const inner = simplifyRadical(c * c * n);
        const expr = `\\sqrt{${c * c + n}+${2 * inner.outside}\\sqrt{${inner.inside}}}`;
        questions.push(`設 \\(a=${expr}\\)，則 \\(a\\) 在哪兩個連續整數之間？`);
        answers.push(
          `簡答：\\(${valueFloor}\\) 與 \\(${valueFloor + 1}\\) 之間。過程：\\(${expr}=\\sqrt{(${c}+\\sqrt{${n}})^2}=${c}+\\sqrt{${n}}\\)。因 \\(${floor}<\\sqrt{${n}}<${floor + 1}\\)，所以 \\(${valueFloor}<a<${valueFloor + 1}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const n = nonSquares[randInt(0, nonSquares.length - 1)];
        const c = randInt(1, 5);
        const floor = Math.floor(Math.sqrt(n));
        const inner = simplifyRadical(c * c * n);
        const expr = `\\sqrt{${c * c + n}+${2 * inner.outside}\\sqrt{${inner.inside}}}`;
        questions.push(`設 \\(a=${expr}\\)，求 \\(a\\) 的整數部分。`);
        answers.push(
          `簡答：${c + floor}。過程：\\(${expr}=${c}+\\sqrt{${n}}\\)，且 \\(${floor}<\\sqrt{${n}}<${floor + 1}\\)，所以 \\(${c + floor}<a<${c + floor + 1}\\)，整數部分為 ${c + floor}。`
        );
        continue;
      }
      if (mode === 2) {
        const k = randInt(3, 9);
        const n = k * k - 1;
        const lower = 2 * k - 1;
        questions.push(
          `設 \\(a=\\frac{1}{${k}-\\sqrt{${n}}}\\)，判定 \\(a\\) 是否在整數 ${lower} 和 ${lower + 1} 之間。`
        );
        answers.push(
          `簡答：是，\\(${lower}<a<${lower + 1}\\)。過程：有理化得 \\(a=\\frac{${k}+\\sqrt{${n}}}{${k * k}-${n}}=${k}+\\sqrt{${n}}\\)。因 \\(${k - 1}<\\sqrt{${n}}<${k}\\)，所以 \\(${lower}<a<${lower + 1}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const n = nonSquares[randInt(0, nonSquares.length - 1)];
        const c = randInt(2, 7);
        const floor = Math.floor(Math.sqrt(n));
        const correct = c + floor;
        const inner = simplifyRadical(c * c * n);
        const expr = `\\sqrt{${c * c + n}+${2 * inner.outside}\\sqrt{${inner.inside}}}`;
        const options = shuffle([
          `\\(${correct - 1}\\sim${correct}\\)`,
          `\\(${correct}\\sim${correct + 1}\\)`,
          `\\(${correct + 1}\\sim${correct + 2}\\)`,
        ]);
        questions.push(
          `設 \\(a=${expr}\\)，判斷 \\(a\\) 落在下列哪個區間：${options.map((op, idx) => `(${String.fromCharCode(65 + idx)}) ${op}`).join(' ')}。`
        );
        answers.push(
          `簡答：${options.indexOf(`\\(${correct}\\sim${correct + 1}\\)`) >= 0 ? String.fromCharCode(65 + options.indexOf(`\\(${correct}\\sim${correct + 1}\\)`)) : ''}。過程：\\(${expr}=${c}+\\sqrt{${n}}\\)，且 \\(${floor}<\\sqrt{${n}}<${floor + 1}\\)，故 \\(${correct}<a<${correct + 1}\\)。`
        );
        continue;
      }
      const n = nonSquares[randInt(0, nonSquares.length - 1)];
      const c = randInt(5, 11);
      const floor = Math.floor(Math.sqrt(n));
      const ceil = floor + 1;
      const integerPart = c - ceil;
      questions.push(`求 \\(${c}-\\sqrt{${n}}\\) 的整數部分。`);
      answers.push(
        `簡答：${integerPart}。過程：因 \\(${floor}<\\sqrt{${n}}<${ceil}\\)，所以 \\(${c - ceil}<${c}-\\sqrt{${n}}<${c - floor}\\)。因此整數部分為 ${integerPart}。`
      );
    }
    return { questions, answers };
  }

  function buildS111TelescopingRationalizationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const end = randInt(3, 5);
        const terms = [];
        for (let k = 1; k < end; k += 1) {
          terms.push(`\\frac{1}{${formatS111RootOrInteger(k)}+${formatS111RootOrInteger(k + 1)}}`);
        }
        questions.push(`求 \\(${terms.join('+')}\\) 之值。`);
        answers.push(
          `簡答：\\(${formatS111RootDifference(end, 1)}\\)。過程：每一項有理化，\\(\\frac{1}{${formatS111RootOrInteger(1)}+${formatS111RootOrInteger(2)}}=${formatS111RootOrInteger(2)}-${formatS111RootOrInteger(1)}\\)，依此類推會連鎖消去，所以總和為 \\(${formatS111RootDifference(end, 1)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const start = randInt(2, 5);
        const end = start + randInt(4, 7);
        questions.push(
          `求 \\(\\frac{1}{${formatS111RootOrInteger(start)}+${formatS111RootOrInteger(start + 1)}}+\\frac{1}{${formatS111RootOrInteger(start + 1)}+${formatS111RootOrInteger(start + 2)}}+\\cdots+\\frac{1}{${formatS111RootOrInteger(end - 1)}+${formatS111RootOrInteger(end)}}\\) 之值。`
        );
        answers.push(
          `簡答：\\(${formatS111RootDifference(end, start)}\\)。過程：\\(\\frac{1}{\\sqrt{k}+\\sqrt{k+1}}=\\sqrt{k+1}-\\sqrt{k}\\)。各項相加後中間根式全部消去，只剩 \\(${formatS111RootDifference(end, start)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        let r = [2, 3, 5, 6, 7][randInt(0, 4)];
        let start = randInt(1, 3);
        let end = start + randInt(3, 5);
        let firstA = start * start + r;
        let firstB = (start + 1) * (start + 1) + r;
        let lastA = (end - 1) * (end - 1) + r;
        let lastB = end * end + r;
        while ([firstA, firstB, lastA, lastB].some(isPerfectSquare)) {
          r = [2, 3, 5, 6, 7][randInt(0, 4)];
          start = randInt(1, 3);
          end = start + randInt(3, 5);
          firstA = start * start + r;
          firstB = (start + 1) * (start + 1) + r;
          lastA = (end - 1) * (end - 1) + r;
          lastB = end * end + r;
        }
        questions.push(
          `求 \\(\\frac{${2 * start + 1}}{${formatS111RootOrInteger(firstA)}+${formatS111RootOrInteger(firstB)}}+\\frac{${2 * (start + 1) + 1}}{${formatS111RootOrInteger((start + 1) * (start + 1) + r)}+${formatS111RootOrInteger((start + 2) * (start + 2) + r)}}+\\cdots+\\frac{${2 * end - 1}}{${formatS111RootOrInteger(lastA)}+${formatS111RootOrInteger(lastB)}}\\) 之值。`
        );
        answers.push(
          `簡答：\\(${formatS111RootDifference(lastB, firstA)}\\)。過程：因 \\(((k+1)^2+${r})-(k^2+${r})=2k+1\\)，所以 \\(\\frac{2k+1}{\\sqrt{k^2+${r}}+\\sqrt{(k+1)^2+${r}}}=\\sqrt{(k+1)^2+${r}}-\\sqrt{k^2+${r}}\\)。連鎖消去後剩 \\(${formatS111RootDifference(lastB, firstA)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const start = randInt(2, 6);
        const step = randInt(2, 5);
        const terms = randInt(3, 5);
        const end = start + step * terms;
        questions.push(
          `求 \\(\\frac{${step}}{${formatS111RootOrInteger(start)}+${formatS111RootOrInteger(start + step)}}+\\frac{${step}}{${formatS111RootOrInteger(start + step)}+${formatS111RootOrInteger(start + 2 * step)}}+\\cdots+\\frac{${step}}{${formatS111RootOrInteger(end - step)}+${formatS111RootOrInteger(end)}}\\) 之值。`
        );
        answers.push(
          `簡答：\\(${formatS111RootDifference(end, start)}\\)。過程：\\(\\frac{${step}}{\\sqrt{k}+\\sqrt{k+${step}}}=\\sqrt{k+${step}}-\\sqrt{k}\\)。相鄰項會消去，所以總和為 \\(${formatS111RootDifference(end, start)}\\)。`
        );
        continue;
      }
      const n = randInt(4, 9);
      questions.push(
        `化簡 \\(\\frac{1}{\\sqrt{x}+\\sqrt{x+1}}+\\frac{1}{\\sqrt{x+1}+\\sqrt{x+2}}+\\cdots+\\frac{1}{\\sqrt{x+${n - 1}}+\\sqrt{x+${n}}}\\)。`
      );
      answers.push(
        `簡答：\\(\\sqrt{x+${n}}-\\sqrt{x}\\)。過程：每一項有理化後 \\(\\frac{1}{\\sqrt{x+k}+\\sqrt{x+k+1}}=\\sqrt{x+k+1}-\\sqrt{x+k}\\)。連續相加後中間項消去，剩 \\(\\sqrt{x+${n}}-\\sqrt{x}\\)。`
      );
    }
    return { questions, answers };
  }

  function formatS112Linear(coeff, constant, variable = 'x') {
    return formatFunctionLinear(coeff, constant).replaceAll('x', variable);
  }

  function formatS112AbsLinear(coeff, constant, variable = 'x') {
    return `|${formatS112Linear(coeff, constant, variable)}|`;
  }

  function formatS112DistanceTerm(point, variable = 'x') {
    return point >= 0 ? `|${variable}-${point}|` : `|${variable}+${Math.abs(point)}|`;
  }

  function formatS112ClosedInterval(left, right) {
    return `\\(${left}\\leq x\\leq ${right}\\)`;
  }

  function formatS112OpenInterval(left, right) {
    return `\\(${left}<x<${right}\\)`;
  }

  function formatS112Outside(left, right, inclusive = false) {
    const op = inclusive ? '\\leq' : '<';
    const op2 = inclusive ? '\\geq' : '>';
    return `\\(x${op}${left}\\) 或 \\(x${op2}${right}\\)`;
  }

  function countIntegersInClosedInterval(left, right) {
    return Math.max(0, Math.floor(right) - Math.ceil(left) + 1);
  }

  function buildS112AbsInequalityBasicSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const a = randInt(2, 5);
      const center = randInt(-5, 6);
      const radius = randInt(2, 8);
      const constant = -a * center;
      const bound = a * radius;
      const expr = formatS112AbsLinear(a, constant);
      if (mode === 0) {
        questions.push(`解不等式 \\(${expr}\\leq ${bound}\\)。`);
        answers.push(
          `簡答：${formatS112ClosedInterval(center - radius, center + radius)}。過程：\\(${expr}\\leq ${bound}\\) 等價於 \\(-${bound}\\leq ${formatS112Linear(a, constant)}\\leq ${bound}\\)。同除以 ${a} 後得 ${formatS112ClosedInterval(center - radius, center + radius)}。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`解不等式 \\(${expr}\\geq ${bound}\\)。`);
        answers.push(
          `簡答：${formatS112Outside(center - radius, center + radius, true)}。過程：\\(|u|\\geq ${bound}\\) 等價於 \\(u\\leq -${bound}\\) 或 \\(u\\geq ${bound}\\)。令 \\(u=${formatS112Linear(a, constant)}\\)，解得 ${formatS112Outside(center - radius, center + radius, true)}。`
        );
        continue;
      }
      if (mode === 2) {
        const inner = randInt(1, radius - 1);
        questions.push(`解不等式 \\(${a * inner}<${expr}\\leq ${bound}\\)。`);
        answers.push(
          `簡答：\\(${center - radius}\\leq x<${center - inner}\\) 或 \\(${center + inner}<x\\leq ${center + radius}\\)。過程：先解 \\(|${formatS112Linear(a, constant)}|\\leq ${bound}\\)，得 ${formatS112ClosedInterval(center - radius, center + radius)}；再排除 \\(|${formatS112Linear(a, constant)}|\\leq ${a * inner}\\)，即排除 \\(${center - inner}\\leq x\\leq ${center + inner}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const left = center - radius;
        const right = center + radius;
        questions.push(`解不等式 \\(${a}<${formatS112AbsLinear(a, constant)}\\leq ${bound}\\)。`);
        const inner = 1;
        answers.push(
          `簡答：\\(${left}\\leq x<${center - inner}\\) 或 \\(${center + inner}<x\\leq ${right}\\)。過程：\\(${formatS112AbsLinear(a, constant)}>${a}\\) 表示 \\(x<${center - inner}\\) 或 \\(x>${center + inner}\\)，再與 \\(${formatS112AbsLinear(a, constant)}\\leq${bound}\\) 的解集 ${formatS112ClosedInterval(left, right)} 取交集。`
        );
        continue;
      }
      questions.push(`解不等式 \\(${expr}<${bound}\\)，並求其整數解個數。`);
      const left = center - radius;
      const right = center + radius;
      const integerCount = countIntegersInClosedInterval(left + 1, right - 1);
      answers.push(
        `簡答：${formatS112OpenInterval(left, right)}，整數解 ${integerCount} 個。過程：\\(${expr}<${bound}\\) 等價於 \\(-${bound}<${formatS112Linear(a, constant)}<${bound}\\)，解得 ${formatS112OpenInterval(left, right)}。其中整數為 ${Math.ceil(left + 1)} 到 ${Math.floor(right - 1)}，共 ${integerCount} 個。`
      );
    }
    return { questions, answers };
  }

  function buildS112AbsReverseParameterSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const center = randInt(-4, 6);
      const radius = randInt(2, 7);
      const left = center - radius;
      const right = center + radius;
      if (mode === 0) {
        questions.push(
          `已知不等式 \\(|x-a|\\leq b\\) 之解為 ${formatS112ClosedInterval(left, right)}，求數對 \\((a,b)\\)。`
        );
        answers.push(
          `簡答：\\((a,b)=(${center},${radius})\\)。過程：\\(|x-a|\\leq b\\) 的解集中心是 \\(a\\)，半徑是 \\(b\\)。由端點平均得 \\(a=\\frac{${left}+${wrapIfNegative(right)}}{2}=${center}\\)，區間長為 ${right - left}，所以 \\(b=${radius}\\)。`
        );
        continue;
      }
      const m = randInt(2, 5);
      const constant = -m * center;
      const bound = m * radius;
      if (mode === 1) {
        questions.push(
          `已知不等式 \\(|ax${constant < 0 ? constant : `+${constant}`}|\\leq ${bound}\\) 之解為 ${formatS112ClosedInterval(left, right)}，且 \\(a>0\\)，求 \\(a\\)。`
        );
        const centerATerm = center === -1 ? '-a' : center === 1 ? 'a' : `${center}a`;
        answers.push(
          `簡答：\\(a=${m}\\)。過程：解集中心為 ${center}，所以 \\(ax${constant < 0 ? constant : `+${constant}`}=0\\) 的解為 \\(x=${center}\\)。代入得 \\(${centerATerm}${constant < 0 ? constant : `+${constant}`}=0\\)，故 \\(a=${m}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const localCenter = -3 + radius;
        const localConstant = -m * localCenter;
        const localB = m * radius;
        questions.push(
          `已知 \\(|${m}x${localConstant < 0 ? localConstant : `+${localConstant}`}|\\leq b\\) 的解為 \\(-3\\leq x\\leq ${-3 + 2 * radius}\\)，求 \\(b\\)。`
        );
        answers.push(
          `簡答：\\(b=${localB}\\)。過程：此解集半徑為 ${radius}。\\(|${m}x${localConstant < 0 ? localConstant : `+${localConstant}`}|\\leq b\\) 中，\\(x\\) 的半徑會是 \\(\\frac{b}{${m}}\\)，所以 \\(\\frac{b}{${m}}=${radius}\\)，得 \\(b=${localB}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(
          `若 \\(x>${right}\\) 或 \\(x<${left}\\) 為不等式 \\(|ax+1|>b\\) 的解，且 \\(a>0\\)，求 \\(a,b\\)。`
        );
        const a = 2;
        const c = -a * center;
        const b = a * radius;
        questions[questions.length - 1] =
          `若 \\(x>${right}\\) 或 \\(x<${left}\\) 為不等式 \\(|${a}x${c < 0 ? c : `+${c}`}|>b\\) 的解，求 \\(b\\)。`;
        answers.push(
          `簡答：\\(b=${b}\\)。過程：外側解表示中心為 ${center}、半徑為 ${radius}。\\(|${a}x${c < 0 ? c : `+${c}`}|>b\\) 的半徑為 \\(\\frac{b}{${a}}\\)，所以 \\(b=${a}\\cdot${radius}=${b}\\)。`
        );
        continue;
      }
      questions.push(
        `已知 \\(|${m}x${constant < 0 ? constant : `+${constant}`}|<b\\) 的解為 ${formatS112OpenInterval(left, right)}，求 \\(b\\)。`
      );
      answers.push(
        `簡答：\\(b=${bound}\\)。過程：解集半徑為 ${radius}，而 \\(|${m}x${constant < 0 ? constant : `+${constant}`}|<b\\) 的半徑為 \\(\\frac{b}{${m}}\\)，故 \\(b=${m}\\cdot${radius}=${bound}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS112AbsSumMinimumSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const a = randInt(-8, 0);
      const b = a + randInt(3, 7);
      const c = b + randInt(3, 7);
      if (mode === 0) {
        const min = b - a + (c - b);
        questions.push(
          `對任意實數 \\(x\\)，求 \\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(b)}+${formatS112DistanceTerm(c)}\\) 的最小值。`
        );
        answers.push(
          `簡答：${min}。過程：三個點的距離和在中位數 \\(x=${b}\\) 時最小，最小值為距離 ${b - a}+0+${c - b}=${min}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const k = c - a;
        questions.push(
          `設 \\(x\\) 為實數，求使 \\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(c)}=k\\) 有解的最小整數 \\(k\\)。`
        );
        answers.push(
          `簡答：${k}。過程：\\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(c)}\\) 表示 \\(x\\) 到 ${a} 與 ${c} 的距離和，最小值是兩點距離 ${c - a}，所以最小整數 \\(k=${k}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const start = randInt(-3, 2);
        const end = start + randInt(5, 8);
        const minStart = Math.floor((start + end) / 2);
        const minEnd = Math.ceil((start + end) / 2);
        let min = 0;
        for (let t = start; t <= end; t += 1) min += Math.abs(minStart - t);
        questions.push(
          `求函數 \\(f(x)=${formatS112DistanceTerm(start)}+${formatS112DistanceTerm(start + 1)}+\\cdots+${formatS112DistanceTerm(end)}\\) 取到最小值的範圍，並求最小值 \\(k\\)。`
        );
        answers.push(
          `簡答：最小範圍 ${formatS112ClosedInterval(minStart, minEnd)}，\\(k=${min}\\)。過程：多個距離和在資料的中位數位置最小；若項數為偶數，最小範圍是中間兩點之間。代入 \\(x=${minStart}\\) 得最小值 ${min}。`
        );
        continue;
      }
      if (mode === 3) {
        const p = randInt(-5, 3);
        const q = p + randInt(4, 9);
        const distance = q - p;
        const k = distance + 2 * randInt(1, 4);
        const left = p - (k - distance) / 2;
        const right = q + (k - distance) / 2;
        questions.push(`解方程式 \\(${formatS112DistanceTerm(p)}+${formatS112DistanceTerm(q)}=${k}\\)。`);
        answers.push(
          `簡答：\\(x=${left}\\) 或 \\(x=${right}\\)。過程：兩點距離為 ${distance}。當距離和大於 ${distance} 時，解在兩端外側，超出的 ${k - distance} 會平均分到兩側，所以 \\(x=${left}\\) 或 \\(x=${right}\\)。`
        );
        continue;
      }
      const p = randInt(-6, 2);
      const q = p + randInt(4, 9);
      questions.push(
        `求 \\(${formatS112DistanceTerm(p)}+${formatS112DistanceTerm(q)}\\) 的最小值，並說明在哪些 \\(x\\) 取到。`
      );
      answers.push(
        `簡答：最小值 ${q - p}，在 ${formatS112ClosedInterval(p, q)} 取到。過程：\\(x\\) 在兩點 ${p}, ${q} 之間時，兩段距離和恰為兩點距離 ${q - p}；在外側會更大。`
      );
    }
    return { questions, answers };
  }

  function buildS112AbsNumberLineRangeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const a = randInt(-8, -1);
      const b = randInt(2, 10);
      const distance = b - a;
      if (mode === 0) {
        const extra = 2 * randInt(1, 5);
        const bound = distance + extra;
        const left = a - extra / 2;
        const right = b + extra / 2;
        const countInts = countIntegersInClosedInterval(left, right);
        questions.push(
          `求滿足 \\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(b)}\\leq ${bound}\\) 的整數 \\(x\\) 共有幾個。`
        );
        answers.push(
          `簡答：${countInts} 個。過程：兩定點距離為 ${distance}，允許的總距離為 ${bound}，多出的 ${extra} 平均分到左右兩側，所以解集為 ${formatS112ClosedInterval(left, right)}，整數共有 ${countInts} 個。`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(-7, -2);
        const q = randInt(1, 7);
        const r = q + randInt(3, 7);
        const min = q - p + (r - q);
        questions.push(
          `對任意實數 \\(x\\)，求 \\(${formatS112DistanceTerm(p)}+${formatS112DistanceTerm(q)}+${formatS112DistanceTerm(r)}\\) 的最小值。`
        );
        answers.push(
          `簡答：${min}。過程：三個距離和在中間點 \\(x=${q}\\) 最小，最小值為距離 ${q - p}+0+${r - q}=${min}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(
          `求使 \\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(b)}=k\\) 有解的最小整數 \\(k\\)。`
        );
        answers.push(
          `簡答：${distance}。過程：兩點距離和最小就是兩點間距離，當 \\(x\\) 在線段 \\([${a},${b}]\\) 上時取到，因此最小整數 \\(k=${distance}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const p = randInt(-6, -1);
        const q = randInt(3, 9);
        const min = q - p;
        questions.push(
          `對任意實數 \\(x\\)，求 \\(${formatS112DistanceTerm(p)}+${formatS112DistanceTerm(q)}\\) 的最小值與取到最小值的範圍。`
        );
        answers.push(
          `簡答：最小值 ${min}，範圍 ${formatS112ClosedInterval(p, q)}。過程：\\(x\\) 在 ${p} 與 ${q} 之間時，到兩端點的距離和等於兩點距離 ${min}；若在外側，距離和會變大。`
        );
        continue;
      }
      const extra = 2 * randInt(1, 4);
      const total = distance + extra;
      const left = a - extra / 2;
      const right = b + extra / 2;
      questions.push(
        `數線上有 \\(A(${a}),B(${b})\\)，點 \\(P(x)\\) 滿足 \\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(b)}=${total}\\)，求 \\(x\\) 的可能值。`
      );
      answers.push(
        `簡答：\\(x=${left}\\) 或 \\(x=${right}\\)。過程：\\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(b)}\\) 是 \\(P\\) 到兩端點的距離和，線段長為 ${distance}。總距離多出 ${extra}，平均分到線段外兩端，所以 \\(x=${left}\\) 或 \\(x=${right}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS112AbsRangeSimplificationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const left = randInt(2, 5);
        const right = left + randInt(3, 6);
        questions.push(`已知 \\(${left}\\leq x\\leq ${right}\\)，化簡 \\(|x-${left - 1}|-|x-${right + 2}|+|x|\\)。`);
        const constant = -(left + right + 1);
        const simplified = formatS112Linear(3, constant);
        answers.push(
          `簡答：\\(${simplified}\\)。過程：在此範圍內，\\(x-${left - 1}\\geq0\\)、\\(x-${right + 2}\\leq0\\)、\\(x>0\\)。所以原式 \\(=(x-${left - 1})-(${right + 2}-x)+x=${simplified}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const xLow = randInt(2, 4);
        const xHigh = xLow + randInt(3, 5);
        const yLow = randInt(-7, -5);
        const yHigh = randInt(-3, -1);
        const c1 = xHigh + yHigh + 2;
        const c2 = xLow - yHigh - 1;
        questions.push(
          `已知 \\(${xLow}<x<${xHigh}\\) 且 \\(${yLow}<y<${yHigh}\\)，化簡 \\(|x+y-${c1}|-|x-y-${c2}|\\)。`
        );
        answers.push(
          `簡答：\\(${-2}x+${c1 + c2}\\)。過程：由範圍可知 \\(x+y-${c1}<0\\)，且 \\(x-y-${c2}>0\\)。所以原式 \\(=${c1}-x-y-(x-y-${c2})=-2x+${c1 + c2}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`設 \\(0<x<1\\)，化簡 \\(\\sqrt{x^2+\\frac{1}{x^2}+2}-\\sqrt{x^2+\\frac{1}{x^2}-2}\\)。`);
        answers.push(
          `簡答：\\(2x\\)。過程：第一個根號為 \\(\\sqrt{(x+\\frac1x)^2}=|x+\\frac1x|=x+\\frac1x\\)；第二個為 \\(\\sqrt{(\\frac1x-x)^2}=|\\frac1x-x|=\\frac1x-x\\)。相減得 \\(2x\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`設三角形三邊長為 \\(a,b,c\\)，化簡 \\(|a+b-c|-\\sqrt{a^2+b^2+c^2-2ab-2bc+2ca}\\)。`);
        answers.push(
          `簡答：0。過程：三角形中 \\(a+b-c>0\\)，所以 \\(|a+b-c|=a+b-c\\)。根號內為 \\((a+b-c)^2\\)，故根號為 \\(|a+b-c|=a+b-c\\)，相減為 0。`
        );
        continue;
      }
      questions.push(`設 \\(a>1\\)，化簡 \\(\\sqrt{a^2+2a+1}-\\sqrt{a^2-2a+1}\\)。`);
      answers.push(
        `簡答：2。過程：\\(\\sqrt{a^2+2a+1}=|a+1|=a+1\\)，\\(\\sqrt{a^2-2a+1}=|a-1|=a-1\\)。因 \\(a>1\\)，相減得 2。`
      );
    }
    return { questions, answers };
  }

  function buildS112AbsQuadraticMixedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const u = randInt(2, 6);
        const c = u * u + u;
        questions.push(`解方程式 \\(x^2+|x|-${c}=0\\)。`);
        answers.push(
          `簡答：\\(x=\\pm${u}\\)。過程：令 \\(t=|x|\\geq0\\)，則 \\(x^2=t^2\\)，原式成為 \\(t^2+t-${c}=0\\)，解得 \\(t=${u}\\)，故 \\(x=\\pm${u}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const u = randInt(3, 8);
        let sum = randInt(8, 15);
        while (sum - u <= 0 || sum - u === u) sum = randInt(8, 15);
        const prod = u * (sum - u);
        questions.push(`解方程式 \\(x^2-${sum}|x|+${prod}=0\\)。`);
        answers.push(
          `簡答：\\(x=\\pm${u}\\) 或 \\(x=\\pm${sum - u}\\)。過程：令 \\(t=|x|\\geq0\\)，得 \\(t^2-${sum}t+${prod}=0\\)，解出 \\(t=${u}\\) 或 \\(t=${sum - u}\\)，因此 \\(x\\) 為正負兩組。`
        );
        continue;
      }
      if (mode === 2) {
        const r1 = randInt(1, 4);
        const r2 = r1 + randInt(2, 5);
        const k = r1 * r2;
        questions.push(`解方程式 \\(|x^2-${r1 + r2}x+${k}|=0\\)。`);
        answers.push(
          `簡答：\\(x=${r1}\\) 或 \\(x=${r2}\\)。過程：絕對值等於 0 表示內部為 0，故解 \\(x^2-${r1 + r2}x+${k}=0\\)，因式分解得 \\((x-${r1})(x-${r2})=0\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const k = randInt(2, 7);
        questions.push(`化簡 \\(3\\sqrt{k^2-2k+1}+4\\sqrt{k^2+4k+4}\\)，其中 \\(k>1\\)。`);
        answers.push(
          `簡答：\\(7k+5\\)。過程：\\(\\sqrt{k^2-2k+1}=|k-1|=k-1\\)，\\(\\sqrt{k^2+4k+4}=|k+2|=k+2\\)。所以原式 \\(=3(k-1)+4(k+2)=7k+5\\)。`
        );
        continue;
      }
      const u = randInt(2, 6);
      const c = u * u - u;
      questions.push(`解方程式 \\(x^2-|x|-${c}=0\\)。`);
      answers.push(
        `簡答：\\(x=\\pm${u}\\)。過程：令 \\(t=|x|\\geq0\\)，則 \\(x^2=t^2\\)，得到 \\(t^2-t-${c}=0\\)。解得 \\(t=${u}\\) 或負根；因 \\(t\\geq0\\)，取 \\(t=${u}\\)，所以 \\(x=\\pm${u}\\)。`
      );
    }
    return { questions, answers };
  }

  function formatS113MonoTerm(coeff, mono) {
    if (coeff === 0) return null;
    const abs = Math.abs(coeff);
    const body = mono ? `${abs === 1 ? '' : abs}${mono}` : `${abs}`;
    return coeff < 0 ? `-${body}` : body;
  }

  function joinS113Terms(terms) {
    const filtered = terms.filter(Boolean);
    if (!filtered.length) return '0';
    return filtered
      .map((term, index) => {
        if (index === 0) return term;
        return term.startsWith('-') ? `- ${term.slice(1)}` : `+ ${term}`;
      })
      .join(' ');
  }

  function formatS113RadicalTerm(coeff, radicand) {
    const simp = simplifyRadical(radicand);
    const totalCoeff = coeff * simp.outside;
    if (simp.inside === 1) return formatS113MonoTerm(totalCoeff, '');
    return formatS113MonoTerm(totalCoeff, `\\sqrt{${simp.inside}}`);
  }

  function formatS113BinomialTerm(coeff, mono) {
    return formatS113MonoTerm(coeff, mono);
  }

  function formatS113Binomial(a, monoA, b, monoB) {
    return joinS113Terms([formatS113BinomialTerm(a, monoA), formatS113BinomialTerm(b, monoB)]);
  }

  function buildS113BinomialCubeExpansionSet(count) {
    const questions = [];
    const answers = [];
    const monoSets = [
      ['x', 'y', 'x^3', 'x^2y', 'xy^2', 'y^3'],
      ['a', 'b', 'a^3', 'a^2b', 'ab^2', 'b^3'],
      ['x^2', 'y', 'x^6', 'x^4y', 'x^2y^2', 'y^3'],
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 5 === 3) {
        const base = randInt(91, 109);
        const valueText = `${base / 10}`;
        const delta = base - 100;
        const result = (base * base * base) / 1000;
        questions.push(`利用公式計算 \\(${valueText}^3\\)。`);
        answers.push(
          `簡答：\\(${formatFraction(base * base * base, 1000)}\\)。過程：\\(${valueText}=10${delta >= 0 ? '+' : ''}${formatFraction(delta, 10)}\\)，利用 \\((a+b)^3=a^3+3a^2b+3ab^2+b^3\\) 展開計算，得 \\(${formatFraction(base * base * base, 1000)}\\)。`
        );
        continue;
      }
      const [monoA, monoB, m3, m21, m12, m03] = monoSets[i % monoSets.length];
      const a = pickNonZero(-5, 5);
      const b = pickNonZero(-5, 5);
      const inside = formatS113Binomial(a, monoA, b, monoB);
      const terms = [
        formatS113MonoTerm(a ** 3, m3),
        formatS113MonoTerm(3 * a * a * b, m21),
        formatS113MonoTerm(3 * a * b * b, m12),
        formatS113MonoTerm(b ** 3, m03),
      ];
      const expanded = joinS113Terms(terms);
      questions.push(`展開 \\((${inside})^3\\)。`);
      answers.push(
        `簡答：\\(${expanded}\\)。過程：套用 \\((A+B)^3=A^3+3A^2B+3AB^2+B^3\\)，令 \\(A=${formatS113MonoTerm(a, monoA)}\\)、\\(B=${formatS113MonoTerm(b, monoB)}\\)，整理得 \\(${expanded}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS113CubeSumDifferenceSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const s = randInt(3, 10);
        const p = randInt(1, Math.floor((s * s - 1) / 4));
        const value = s ** 3 - 3 * p * s;
        questions.push(`已知 \\(a+b=${s}\\)、\\(ab=${p}\\)，求 \\(a^3+b^3\\)。`);
        answers.push(`簡答：${value}。過程：\\(a^3+b^3=(a+b)^3-3ab(a+b)=${s}^3-3\\cdot${p}\\cdot${s}=${value}\\)。`);
        continue;
      }
      if (mode === 1) {
        const d = randInt(2, 8);
        const p = randInt(1, 9);
        const value = d ** 3 + 3 * p * d;
        questions.push(`已知 \\(a-b=${d}\\)、\\(ab=${p}\\)，求 \\(a^3-b^3\\)。`);
        answers.push(`簡答：${value}。過程：\\(a^3-b^3=(a-b)^3+3ab(a-b)=${d}^3+3\\cdot${p}\\cdot${d}=${value}\\)。`);
        continue;
      }
      if (mode === 2) {
        const s = randInt(3, 9);
        const p = randInt(1, 8);
        const value = s ** 3 - 3 * p * s;
        questions.push(`已知 \\(x+2y=${s}\\)、\\(xy=${p}\\)，求 \\(x^3+8y^3\\)。`);
        answers.push(
          `簡答：${value}。過程：把 \\(x^3+8y^3\\) 看成 \\(x^3+(2y)^3\\)。\\((x+2y)^3=x^3+8y^3+3\\cdot x\\cdot2y(x+2y)\\)，所以值為 \\(${s}^3-6\\cdot${p}\\cdot${s}=${value}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const d = randInt(3, 9);
        const p = randInt(1, 7);
        const value = d ** 3 + 6 * p * d;
        questions.push(`已知 \\(2x-y=${d}\\)、\\(xy=${p}\\)，求 \\(8x^3-y^3\\)。`);
        answers.push(
          `簡答：${value}。過程：\\(8x^3-y^3=(2x)^3-y^3\\)。利用 \\(A^3-B^3=(A-B)^3+3AB(A-B)\\)，得 \\(${d}^3+3\\cdot(2xy)\\cdot${d}=${value}\\)。`
        );
        continue;
      }
      const s = randInt(3, 8);
      const p = randInt(1, 6);
      const cubeSum = s ** 3 - 3 * p * s;
      const value = cubeSum * cubeSum - 2 * p ** 3;
      questions.push(`已知 \\(a+b=${s}\\)、\\(ab=${p}\\)，求 \\(a^6+b^6\\)。`);
      answers.push(
        `簡答：${value}。過程：先求 \\(a^3+b^3=${cubeSum}\\)。再用 \\(a^6+b^6=(a^3+b^3)^2-2a^3b^3\\)，得 \\(${cubeSum}^2-2\\cdot${p ** 3}=${value}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS113ReciprocalCubeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const s = randInt(3, 8);
      if (mode === 0) {
        const value = s ** 3 - 3 * s;
        questions.push(`已知 \\(x+\\frac{1}{x}=${s}\\)，求 \\(x^3+\\frac{1}{x^3}\\)。`);
        answers.push(
          `簡答：${value}。過程：\\((x+\\frac1x)^3=x^3+\\frac1{x^3}+3(x+\\frac1x)\\)，所以 \\(x^3+\\frac1{x^3}=${s}^3-3\\cdot${s}=${value}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const d = randInt(2, 7);
        const value = d ** 3 + 3 * d;
        questions.push(`已知 \\(x-\\frac{1}{x}=${d}\\)，求 \\(x^3-\\frac{1}{x^3}\\)。`);
        answers.push(
          `簡答：${value}。過程：\\((x-\\frac1x)^3=x^3-\\frac1{x^3}-3(x-\\frac1x)\\)，所以 \\(x^3-\\frac1{x^3}=${d}^3+3\\cdot${d}=${value}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const value = s ** 3 - 3 * s;
        questions.push(`已知 \\(x^2-${s}x+1=0\\)，求 \\(x^3+\\frac{1}{x^3}\\)。`);
        answers.push(
          `簡答：${value}。過程：兩邊除以 \\(x\\)，得 \\(x+\\frac1x=${s}\\)。因此 \\(x^3+\\frac1{x^3}=${s}^3-3\\cdot${s}=${value}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const value = s ** 3 - 3 * s;
        questions.push(`已知 \\(x^{\\frac12}+x^{-\\frac12}=${s}\\)，求 \\(x^{\\frac32}+x^{-\\frac32}\\)。`);
        answers.push(
          `簡答：${value}。過程：令 \\(t=\\sqrt{x}\\)，則題目成為已知 \\(t+\\frac1t=${s}\\)，求 \\(t^3+\\frac1{t^3}\\)，所以答案為 \\(${s}^3-3\\cdot${s}=${value}\\)。`
        );
        continue;
      }
      const n = randInt(2, 5);
      const value = n ** 3 + (2 - 3 * n * n) * n;
      questions.push(`已知 \\(x=2-\\sqrt{3}\\)，求 \\(x^3+\\frac{1}{x^3}\\)。`);
      answers.push(
        `簡答：52。過程：\\(\\frac1x=2+\\sqrt3\\)，所以 \\(x+\\frac1x=4\\)。因此 \\(x^3+\\frac1{x^3}=4^3-3\\cdot4=52\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS113TernarySquareSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 1) {
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-5, 5);
        const c = pickNonZero(-4, 4);
        const vars = mode === 0 ? ['a', 'b', 'c'] : ['x', 'y', 'z'];
        const inside = joinS113Terms([
          formatS113MonoTerm(a, vars[0]),
          formatS113MonoTerm(b, vars[1]),
          formatS113MonoTerm(c, vars[2]),
        ]);
        const expanded = joinS113Terms([
          formatS113MonoTerm(a * a, `${vars[0]}^2`),
          formatS113MonoTerm(b * b, `${vars[1]}^2`),
          formatS113MonoTerm(c * c, `${vars[2]}^2`),
          formatS113MonoTerm(2 * a * b, `${vars[0]}${vars[1]}`),
          formatS113MonoTerm(2 * a * c, `${vars[0]}${vars[2]}`),
          formatS113MonoTerm(2 * b * c, `${vars[1]}${vars[2]}`),
        ]);
        questions.push(`展開 \\((${inside})^2\\)。`);
        answers.push(
          `簡答：\\(${expanded}\\)。過程：使用 \\((A+B+C)^2=A^2+B^2+C^2+2AB+2AC+2BC\\)，代入並整理得 \\(${expanded}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const s = randInt(4, 10);
        const p = randInt(1, 12);
        const value = s * s - 2 * p;
        questions.push(`已知 \\(a+b+c=${s}\\)、\\(ab+bc+ca=${p}\\)，求 \\(a^2+b^2+c^2\\)。`);
        answers.push(
          `簡答：${value}。過程：\\((a+b+c)^2=a^2+b^2+c^2+2(ab+bc+ca)\\)，所以 \\(a^2+b^2+c^2=${s}^2-2\\cdot${p}=${value}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const root = randInt(5, 12);
        const squareSum = randInt(10, root * root - 2);
        const pairSum = makeFraction(root * root - squareSum, 2);
        questions.push(
          `已知 \\(a^2+b^2+c^2=${squareSum}\\)、\\(ab+bc+ca=${formatFunctionFractionValue(pairSum)}\\)，求 \\(a+b+c\\) 的正值。`
        );
        answers.push(
          `簡答：${root}。過程：\\((a+b+c)^2=${squareSum}+2\\cdot${formatFunctionFractionValue(pairSum)}=${root * root}\\)，取正值得 \\(a+b+c=${root}\\)。`
        );
        continue;
      }
      const t = randInt(2, 6);
      questions.push(`展開 \\((x+y-${t})(x+y+${t})\\)。`);
      answers.push(
        `簡答：\\(x^2+2xy+y^2-${t * t}\\)。過程：視為 \\((x+y)^2-${t}^2\\)，故結果為 \\(x^2+2xy+y^2-${t * t}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS113TernaryCubicSpecialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 1) {
        const s = randInt(4, 9);
        const p = randInt(1, 10);
        const r = randInt(1, 8);
        const value = s ** 3 - 3 * s * p + 3 * r;
        questions.push(`已知 \\(a+b+c=${s}\\)、\\(ab+bc+ca=${p}\\)、\\(abc=${r}\\)，求 \\(a^3+b^3+c^3\\)。`);
        answers.push(
          `簡答：${value}。過程：\\(a^3+b^3+c^3=(a+b+c)^3-3(a+b+c)(ab+bc+ca)+3abc\\)，代入得 \\(${s}^3-3\\cdot${s}\\cdot${p}+3\\cdot${r}=${value}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const s = randInt(6, 14);
        const squareSum = randInt(20, 80);
        const cubeSum = randInt(80, 260);
        const pair = makeFraction(s * s - squareSum, 2);
        const abc = makeFraction((cubeSum - s ** 3) * pair.den + 3 * s * pair.num, 3 * pair.den);
        questions.push(
          `已知 \\(a+b+c=${s}\\)、\\(a^2+b^2+c^2=${squareSum}\\)、\\(a^3+b^3+c^3=${cubeSum}\\)，求 \\(abc\\)。`
        );
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(abc)}\\)。過程：先由 \\(ab+bc+ca=\\frac{${s * s}-${squareSum}}{2}=${formatFunctionFractionValue(pair)}\\)。再代入三項立方公式，解得 \\(abc=${formatFunctionFractionValue(abc)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`化簡 \\(\\frac{x^3+y^3+z^3-3xyz}{x+y+z}\\)。`);
        answers.push(
          `簡答：\\(x^2+y^2+z^2-xy-yz-zx\\)。過程：\\(x^3+y^3+z^3-3xyz=(x+y+z)(x^2+y^2+z^2-xy-yz-zx)\\)，約去 \\(x+y+z\\) 後得到答案。`
        );
        continue;
      }
      questions.push(`因式分解 \\(x^3+y^3-z^3+3xyz\\)。`);
      answers.push(
        `簡答：\\((x+y-z)(x^2+y^2+z^2-xy+yz+zx)\\)。過程：令 \\(a=x,b=y,c=-z\\)，套用 \\(a^3+b^3+c^3-3abc\\) 公式，即得結果。`
      );
    }
    return { questions, answers };
  }

  function buildS113RadicalTernaryOperationSet(count) {
    const questions = [];
    const answers = [];
    const roots = [2, 3, 5, 6, 7, 10, 11];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 2) {
        const a = roots[randInt(0, roots.length - 1)];
        let b = roots[randInt(0, roots.length - 1)];
        let c = roots[randInt(0, roots.length - 1)];
        while (b === a) b = roots[randInt(0, roots.length - 1)];
        while (c === a || c === b) c = roots[randInt(0, roots.length - 1)];
        const signC = mode === 1 ? -1 : 1;
        const expr = `\\sqrt{${a}}+\\sqrt{${b}}${signC < 0 ? '-' : '+'}\\sqrt{${c}}`;
        const result = joinS113Terms([
          `${a + b + c}`,
          formatS113RadicalTerm(2, a * b),
          formatS113RadicalTerm(2 * signC, a * c),
          formatS113RadicalTerm(2 * signC, b * c),
        ]);
        questions.push(`計算 \\((${expr})^2\\)。`);
        const cross1 = formatS113RadicalTerm(2, a * b);
        const cross2 = formatS113RadicalTerm(2 * signC, a * c);
        const cross3 = formatS113RadicalTerm(2 * signC, b * c);
        answers.push(
          `簡答：\\(${result}\\)。過程：利用 \\((A+B+C)^2\\) 展開，平方項為 ${a}+${b}+${c}，交叉項依序為 \\(${cross1}\\)、\\(${cross2}\\)、\\(${cross3}\\)，整理得 \\(${result}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`利用公式計算 \\((\\sqrt{2}+\\sqrt{3}+\\sqrt{6})^2\\)。`);
        answers.push(
          `簡答：\\(11+6\\sqrt{2}+4\\sqrt{3}+2\\sqrt{6}\\)。過程：平方項為 \\(2+3+6=11\\)，交叉項為 \\(2\\sqrt{6}+4\\sqrt{3}+6\\sqrt{2}\\)，合併後得 \\(11+6\\sqrt{2}+4\\sqrt{3}+2\\sqrt{6}\\)。`
        );
        continue;
      }
      const radical = [2, 3, 5, 7][randInt(0, 3)];
      const aVal = randInt(2, 6);
      const bVal = randInt(1, 5);
      questions.push(
        `已知 \\(a,b,c\\) 為有理數且 \\((a-b)+(a+b)\\sqrt{${radical}}=(${2 * aVal - bVal}-a)+(${aVal + 2 * bVal}-b)\\sqrt{${radical}}\\)，求 \\(a,b\\)。`
      );
      answers.push(
        `簡答：\\(a=${aVal},\\ b=${bVal}\\)。過程：比較有理部分得 \\(a-b=${2 * aVal - bVal}-a\\)，比較 \\(\\sqrt{${radical}}\\) 係數得 \\(a+b=${aVal + 2 * bVal}-b\\)，解得 \\(a=${aVal}, b=${bVal}\\)。`
      );
    }
    return { questions, answers };
  }

  function formatJ113PolyTerm(coeff, text) {
    if (coeff === 0) return null;
    const abs = Math.abs(coeff);
    const body = text ? `${abs === 1 ? '' : abs}${text}` : `${abs}`;
    return coeff < 0 ? `-${body}` : body;
  }

  function joinJ113PolyTerms(terms) {
    const filtered = terms.filter(Boolean);
    if (!filtered.length) return '0';
    return filtered
      .map((term, index) => {
        if (index === 0) return term;
        return term.startsWith('-') ? `- ${term.slice(1)}` : `+ ${term}`;
      })
      .join(' ');
  }

  function formatJ113LinearFactor(xCoeff, yCoeff, constant) {
    return joinJ113PolyTerms([
      formatJ113PolyTerm(xCoeff, 'x'),
      formatJ113PolyTerm(yCoeff, 'y'),
      formatJ113PolyTerm(constant, ''),
    ]);
  }

  function buildJ113BiquadraticSplitSquareFactoringSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 4) {
        const n = randInt(2, 4);
        const high = `x^${4 * n}`;
        const mid = `x^${2 * n}`;
        const low = `x^${n}`;
        const f1 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, mid),
          formatJ113PolyTerm(1, low),
          formatJ113PolyTerm(1, ''),
        ]);
        const f2 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, mid),
          formatJ113PolyTerm(-1, low),
          formatJ113PolyTerm(1, ''),
        ]);
        questions.push(`因式分解 \\(${high} + ${mid} + 1\\)。`);
        answers.push(
          `簡答：\\((${f1})(${f2})\\)。過程：令 \\(y=${low}\\)，則原式為 \\(y^4+y^2+1\\)。補上並扣除 \\(y^2\\)，得 \\((y^2+1)^2-y^2\\)，再用平方差分解並代回。`
        );
        continue;
      }
      if (mode === 2) {
        const r = randInt(2, 5);
        const p = 2 * r * r;
        const poly = joinJ113PolyTerms([formatJ113PolyTerm(1, 'x^4'), formatJ113PolyTerm(p * p, '')]);
        const f1 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, 'x^2'),
          formatJ113PolyTerm(2 * r, 'x'),
          formatJ113PolyTerm(p, ''),
        ]);
        const f2 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, 'x^2'),
          formatJ113PolyTerm(-2 * r, 'x'),
          formatJ113PolyTerm(p, ''),
        ]);
        questions.push(`因式分解 \\(${poly}\\)。（提示：補上 \\(${2 * p}x^2\\) 並扣除）`);
        answers.push(
          `簡答：\\((${f1})(${f2})\\)。過程：\\(${poly}=(x^2+${p})^2-${2 * p}x^2=(x^2+${p})^2-(${2 * r}x)^2\\)，所以分解為 \\((${f1})(${f2})\\)。`
        );
        continue;
      }
      const variable = mode === 1 ? 'a' : 'x';
      const leadCoeff = mode === 3 ? randInt(2, 5) : 1;
      let p = randInt(1, 6);
      let q = randInt(1, 5);
      let discriminant = q * q - 4 * leadCoeff * p;
      while (discriminant >= 0 && isPerfectSquare(discriminant)) {
        p = randInt(1, 6);
        q = randInt(1, 5);
        discriminant = q * q - 4 * leadCoeff * p;
      }
      const middle = 2 * leadCoeff * p - q * q;
      const poly = joinJ113PolyTerms([
        formatJ113PolyTerm(leadCoeff * leadCoeff, `${variable}^4`),
        formatJ113PolyTerm(middle, `${variable}^2`),
        formatJ113PolyTerm(p * p, ''),
      ]);
      const f1 = joinJ113PolyTerms([
        formatJ113PolyTerm(leadCoeff, `${variable}^2`),
        formatJ113PolyTerm(q, variable),
        formatJ113PolyTerm(p, ''),
      ]);
      const f2 = joinJ113PolyTerms([
        formatJ113PolyTerm(leadCoeff, `${variable}^2`),
        formatJ113PolyTerm(-q, variable),
        formatJ113PolyTerm(p, ''),
      ]);
      const qVarText = q === 1 ? variable : `${q}${variable}`;
      questions.push(`因式分解 \\(${poly}\\)。`);
      answers.push(
        `簡答：\\((${f1})(${f2})\\)。過程：補成 \\((${leadCoeff === 1 ? '' : leadCoeff}${variable}^2+${p})^2-(${qVarText})^2\\)，再用平方差公式分解，得 \\((${f1})(${f2})\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ113BinaryQuadraticCrossFactoringSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      let a = pickNonZero(-4, 4);
      let b = pickNonZero(-5, 5);
      let c = pickNonZero(-6, 6);
      let d = pickNonZero(-4, 4);
      let e = pickNonZero(-5, 5);
      let f = pickNonZero(-6, 6);
      while (a * e === b * d) {
        a = pickNonZero(-4, 4);
        b = pickNonZero(-5, 5);
        d = pickNonZero(-4, 4);
        e = pickNonZero(-5, 5);
      }
      const poly = joinJ113PolyTerms([
        formatJ113PolyTerm(a * d, 'x^2'),
        formatJ113PolyTerm(a * e + b * d, 'xy'),
        formatJ113PolyTerm(b * e, 'y^2'),
        formatJ113PolyTerm(a * f + c * d, 'x'),
        formatJ113PolyTerm(b * f + c * e, 'y'),
        formatJ113PolyTerm(c * f, ''),
      ]);
      const f1 = formatJ113LinearFactor(a, b, c);
      const f2 = formatJ113LinearFactor(d, e, f);
      questions.push(`因式分解 \\(${poly}\\)。`);
      answers.push(
        `簡答：\\((${f1})(${f2})\\)。過程：把二元二次式看成兩個一次式相乘，用雙十字交乘配 \\(x^2,xy,y^2\\) 與 \\(x,y,常數\\) 項，可得 \\((${f1})(${f2})\\)。`
      );
    }
    return { questions, answers };
  }

  function formatS114Exponent(num, den = 1) {
    const frac = reduceFraction(num, den);
    if (frac.denominator === 1) return `${frac.numerator}`;
    return `\\frac{${frac.numerator}}{${frac.denominator}}`;
  }

  function formatS114Power(base, num, den = 1) {
    const frac = reduceFraction(num, den);
    if (frac.numerator === 0) return '1';
    if (frac.denominator === 1 && frac.numerator === 1) return base;
    return `${base}^{${formatS114Exponent(num, den)}}`;
  }

  function buildS114NumericRationalExponentSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const b = randInt(2, 6);
        const n = randInt(2, 4);
        const m = randInt(1, 4);
        questions.push(`計算 \\((${b ** n})^{${formatS114Exponent(-m, n)}}\\) 之值。`);
        answers.push(
          `簡答：\\(${formatFraction(1, b ** m)}\\)。過程：\\((${b ** n})^{${formatS114Exponent(-m, n)}}=${b}^{-${m}}=${formatFraction(1, b ** m)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const b = randInt(2, 5);
        const decimalItems = [
          { num: 1, den: 2, label: '0.5' },
          { num: 1, den: 4, label: '0.25' },
          { num: 3, den: 2, label: '1.5' },
        ];
        const item = decimalItems[randInt(0, decimalItems.length - 1)];
        const resultPower = formatS114Power(`${b}`, item.num);
        const resultValue = b ** item.num;
        const resultText = resultPower === `${resultValue}` ? `${resultValue}` : `${resultPower}=${resultValue}`;
        questions.push(`計算 \\((${b ** item.den})^{${item.label}}\\) 之值。`);
        answers.push(
          `簡答：${resultValue}。過程：\\(${item.label}=${formatS114Exponent(item.num, item.den)}\\)，所以 \\((${b ** item.den})^{${item.label}}=${resultText}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        let a = randInt(2, 5);
        let b = randInt(2, 5);
        while (gcd(a, b) !== 1) {
          a = randInt(2, 5);
          b = randInt(2, 5);
        }
        questions.push(
          `計算 \\((\\frac{${a ** 3}}{${b ** 3}})^{-1/3}\\cdot(\\frac{${a ** 2}}{${b ** 2}})^{1/2}\\) 之值。`
        );
        answers.push(
          `簡答：1。過程：第一因式為 \\(\\frac{${b}}{${a}}\\)，第二因式為 \\(\\frac{${a}}{${b}}\\)，相乘得 1。`
        );
        continue;
      }
      if (mode === 3) {
        const root = randInt(2, 5);
        const sum = reduceFraction(1 + root ** 4, root * root);
        questions.push(`化簡 \\(${root ** 3}^{-2/3}+(${root ** 5})^{2/5}\\)。`);
        answers.push(
          `簡答：\\(${formatFraction(sum.numerator, sum.denominator)}\\)。過程：\\(${root ** 3}^{-2/3}=(${root})^{-2}=${formatFraction(1, root * root)}\\)，\\((${root ** 5})^{2/5}=${root}^2=${root * root}\\)，相加得 \\(${formatFraction(sum.numerator, sum.denominator)}\\)。`
        );
        continue;
      }
      questions.push(`計算 \\(2^{1/2}\\cdot4^{1/8}\\cdot8^{1/24}\\cdot16^{1/32}\\) 的值。`);
      answers.push(
        `簡答：\\(2\\)。過程：全部化為 2 的冪，指數和為 \\(\\frac12+\\frac14+\\frac18+\\frac18=1\\)，所以原式為 2。`
      );
    }
    return { questions, answers };
  }

  function buildS114VariableExponentSimplificationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const m = randInt(3, 7);
        const n = randInt(1, m - 2);
        questions.push(`化簡 \\((a^${m}\\cdot a^{-${n}})^2\\div \\sqrt{a^{${m - n}}}\\)，設 \\(a>0\\)。`);
        answers.push(
          `簡答：\\(${formatS114Power('a', 3 * (m - n), 2)}\\)。過程：\\((a^${m}\\cdot a^{-${n}})^2=a^{${2 * (m - n)}}\\)，\\(\\sqrt{a^{${m - n}}}=${formatS114Power('a', m - n, 2)}\\)，相除得 \\(${formatS114Power('a', 3 * (m - n), 2)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 5);
        questions.push(`化簡 \\(\\sqrt[3]{a^${p}}\\cdot\\sqrt[6]{a^{${p + 3}}}\\)，設 \\(a>0\\)。`);
        answers.push(
          `簡答：\\(${formatS114Power('a', 3 * p + 3, 6)}\\)。過程：\\(\\sqrt[3]{a^${p}}=${formatS114Power('a', p, 3)}\\)，\\(\\sqrt[6]{a^{${p + 3}}}=${formatS114Power('a', p + 3, 6)}\\)，相乘指數相加得 \\(${formatS114Power('a', 3 * p + 3, 6)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`設 \\(a,b>0\\)，化簡 \\(\\sqrt[3]{ab^2}\\times(a^2b)^{2/3}\\)。`);
        answers.push(
          `簡答：\\(${formatS114Power('a', 5, 3)}${formatS114Power('b', 4, 3)}\\)。過程：\\(\\sqrt[3]{ab^2}=${formatS114Power('a', 1, 3)}${formatS114Power('b', 2, 3)}\\)，\\((a^2b)^{2/3}=${formatS114Power('a', 4, 3)}${formatS114Power('b', 2, 3)}\\)，相乘得 \\(${formatS114Power('a', 5, 3)}${formatS114Power('b', 4, 3)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`化簡 \\((a^{1/4}-b^{1/4})(a^{1/4}+b^{1/4})(a^{1/2}+b^{1/2})(a+b)\\)。`);
        answers.push(
          `簡答：\\(a^2-b^2\\)。過程：前兩項先成平方差 \\(a^{1/2}-b^{1/2}\\)，再乘 \\(a^{1/2}+b^{1/2}\\) 得 \\(a-b\\)，最後乘 \\(a+b\\) 得 \\(a^2-b^2\\)。`
        );
        continue;
      }
      questions.push(`化簡 \\(\\frac{a^{2x}a^{3-x}}{a^{x-1}}\\)，並以 \\(a\\) 的次方表示。`);
      answers.push(
        `簡答：\\(a^4\\)。過程：分子指數相加為 \\(2x+3-x=x+3\\)，再除以 \\(a^{x-1}\\) 等於指數相減，得 \\(a^{x+3-(x-1)}=a^4\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS114ExponentialSymmetricValueSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const s = randInt(3, 8);
      if (mode === 0) {
        questions.push(`已知 \\(x^{1/2}+x^{-1/2}=${s}\\)，求 \\(x+x^{-1}\\) 之值。`);
        answers.push(`簡答：${s * s - 2}。過程：平方得 \\(x+x^{-1}+2=${s * s}\\)，所以 \\(x+x^{-1}=${s * s - 2}\\)。`);
        continue;
      }
      if (mode === 1) {
        questions.push(`已知 \\(x^{1/2}+x^{-1/2}=${s}\\)，求 \\(x^{3/2}+x^{-3/2}\\) 之值。`);
        answers.push(
          `簡答：${s ** 3 - 3 * s}。過程：令 \\(u=x^{1/2}\\)，則 \\(u+u^{-1}=${s}\\)。\\(u^3+u^{-3}=${s}^3-3\\cdot${s}=${s ** 3 - 3 * s}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`若 \\(a^x+a^{-x}=${s}\\)，求 \\(a^{2x}+a^{-2x}\\)。`);
        answers.push(
          `簡答：${s * s - 2}。過程：\\((a^x+a^{-x})^2=a^{2x}+a^{-2x}+2\\)，所以值為 \\(${s}^2-2=${s * s - 2}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`已知 \\(a^x+a^{-x}=${s}\\)，求 \\((a^{x/2}+a^{-x/2})^2\\)。`);
        answers.push(`簡答：${s + 2}。過程：\\((a^{x/2}+a^{-x/2})^2=a^x+a^{-x}+2=${s + 2}\\)。`);
        continue;
      }
      questions.push(`計算 \\(\\frac{a^{3x}+a^{-3x}}{a^x+a^{-x}}\\)。`);
      answers.push(
        `簡答：\\(a^{2x}+a^{-2x}-1\\)。過程：令 \\(u=a^x\\)，則 \\(\\frac{u^3+u^{-3}}{u+u^{-1}}=u^2+u^{-2}-1\\)，代回即可。`
      );
    }
    return { questions, answers };
  }

  function buildS114ExponentialEquationInequalitySet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const r1 = randInt(0, 2);
        const r2 = r1 + randInt(1, 2);
        questions.push(`解方程式 \\(25^x-${5 ** r1 + 5 ** r2}\\cdot5^x+${5 ** (r1 + r2)}=0\\)。`);
        answers.push(
          `簡答：\\(x=${r1}\\) 或 \\(x=${r2}\\)。過程：令 \\(t=5^x>0\\)，則 \\(25^x=t^2\\)，原式變成 \\(t^2-${5 ** r1 + 5 ** r2}t+${5 ** (r1 + r2)}=0\\)，解得 \\(t=${5 ** r1}\\) 或 \\(t=${5 ** r2}\\)，所以 \\(x=${r1}\\) 或 \\(x=${r2}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const sol = randInt(2, 6);
        questions.push(`解方程式 \\(4^{2x-1}=8^{x+${sol - 2}}\\)。`);
        answers.push(
          `簡答：\\(x=${sol}\\)。過程：化為同底 2，左邊為 \\(2^{4x-2}\\)，右邊為 \\(2^{3x+${3 * (sol - 2)}}\\)。比較指數得 \\(x=${sol}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const r1 = randInt(1, 3);
        const r2 = r1 + randInt(2, 4);
        questions.push(`解方程式 \\(2^{2x}-${2 ** r1 + 2 ** r2}\\cdot2^x+${2 ** (r1 + r2)}=0\\)。`);
        answers.push(
          `簡答：\\(x=${r1}\\) 或 \\(x=${r2}\\)。過程：令 \\(t=2^x>0\\)，方程成為 \\(t^2-${2 ** r1 + 2 ** r2}t+${2 ** (r1 + r2)}=0\\)，解得 \\(t=${2 ** r1}\\) 或 \\(t=${2 ** r2}\\)，所以 \\(x=${r1}\\) 或 \\(x=${r2}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`解不等式 \\((3^x-9)(3^x-27)\\leq0\\)。`);
        answers.push(
          `簡答：\\(2\\leq x\\leq3\\)。過程：令 \\(t=3^x>0\\)，則 \\((t-9)(t-27)\\leq0\\)，得 \\(9\\leq t\\leq27\\)，所以 \\(2\\leq x\\leq3\\)。`
        );
        continue;
      }
      questions.push(`解不等式 \\((\\frac14)^x+(\\frac12)^x-2<0\\)。`);
      answers.push(
        `簡答：\\(x>0\\)。過程：令 \\(t=(\\frac12)^x>0\\)，則 \\((\\frac14)^x=t^2\\)，不等式為 \\(t^2+t-2<0\\)，得 \\(0<t<1\\)，所以 \\(x>0\\)。`
      );
    }
    return { questions, answers };
  }

  const S115_LOGS = {
    2: 3010,
    3: 4771,
    4: 6021,
    5: 6990,
    6: 7781,
    7: 8451,
    8: 9031,
    9: 9542,
    11: 10414,
  };

  const S115_LOG_DIGIT_THRESHOLDS = [
    { digit: 1, logInt: 0 },
    { digit: 2, logInt: 3010 },
    { digit: 3, logInt: 4771 },
    { digit: 4, logInt: 6021 },
    { digit: 5, logInt: 6990 },
    { digit: 6, logInt: 7781 },
    { digit: 7, logInt: 8451 },
    { digit: 8, logInt: 9031 },
    { digit: 9, logInt: 9542 },
    { digit: 10, logInt: 10000 },
  ];

  function formatS115LogInt(value) {
    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);
    const integerPart = Math.floor(absValue / 10000);
    const decimalPart = `${absValue % 10000}`.padStart(4, '0');
    return `${sign}${integerPart}.${decimalPart}`;
  }

  function formatS115PureDecimal(value) {
    return `0.${`${value}`.padStart(4, '0')}`;
  }

  function formatS115SignedTerm(value, variable) {
    if (value === 0) return '';
    const sign = value > 0 ? '+' : '-';
    const absValue = Math.abs(value);
    const coefficient = absValue === 1 ? '' : absValue;
    return `${sign}${coefficient}${variable}`;
  }

  function getS115LeadingDigitByMantissa(mantissaInt) {
    const normalized = ((mantissaInt % 10000) + 10000) % 10000;
    for (let i = S115_LOG_DIGIT_THRESHOLDS.length - 2; i >= 0; i -= 1) {
      if (normalized >= S115_LOG_DIGIT_THRESHOLDS[i].logInt) return S115_LOG_DIGIT_THRESHOLDS[i].digit;
    }
    return 1;
  }

  function buildS115LargeNumberDigitCountSet(count) {
    const questions = [];
    const answers = [];
    const logItems = [
      { base: 2, logInt: S115_LOGS[2] },
      { base: 3, logInt: S115_LOGS[3] },
      { base: 7, logInt: S115_LOGS[7] },
      { base: 11, logInt: S115_LOGS[11] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 2) {
        const item = logItems[mode];
        const exponent = randInt(18, 120);
        const product = item.logInt * exponent;
        if (product % 10000 === 0) {
          i -= 1;
          continue;
        }
        const integerPart = Math.floor(product / 10000);
        const digits = integerPart + 1;
        questions.push(
          `已知 \\(\\log ${item.base}\\approx ${formatS115LogInt(item.logInt)}\\)，求 \\(${item.base}^{${exponent}}\\) 為幾位數？`
        );
        answers.push(
          `簡答：${digits} 位數。過程：\\(\\log ${item.base}^{${exponent}}=${exponent}\\log ${item.base}\\approx ${formatS115LogInt(product)}\\)，其首數為 ${integerPart}，所以 \\(${item.base}^{${exponent}}\\) 為 ${integerPart}+1=${digits} 位數。`
        );
        continue;
      }
      if (mode === 3) {
        const base = 11;
        const exponent = randInt(12, 30);
        const product = S115_LOGS[base] * exponent;
        const digits = Math.floor(product / 10000) + 1;
        questions.push(`若 \\(11^${exponent}\\) 為 ${digits} 位數，求 \\(\\log 11\\) 的可能範圍。`);
        answers.push(
          `簡答：\\(${formatFraction(digits - 1, exponent)}\\leq\\log 11<${formatFraction(digits, exponent)}\\)。過程：${digits} 位數代表 \\(${digits - 1}\\leq\\log 11^${exponent}<${digits}\\)，也就是 \\(${digits - 1}\\leq ${exponent}\\log 11<${digits}\\)，兩邊同除以 ${exponent} 即得範圍。`
        );
        continue;
      }
      const exponent = randInt(20, 90);
      const log6 = S115_LOGS[2] + S115_LOGS[3];
      const product = log6 * exponent;
      const integerPart = Math.floor(product / 10000);
      const digits = integerPart + 1;
      questions.push(`已知 \\(\\log 2\\approx0.3010,\\log 3\\approx0.4771\\)，判定 \\(6^{${exponent}}\\) 的位數。`);
      answers.push(
        `簡答：${digits} 位數。過程：\\(\\log 6=\\log2+\\log3\\approx0.7781\\)，\\(\\log 6^{${exponent}}\\approx ${formatS115LogInt(product)}\\)，首數為 ${integerPart}，所以位數為 ${digits}。`
      );
    }
    return { questions, answers };
  }

  function buildS115FirstNonzeroDecimalPlaceSet(count) {
    const questions = [];
    const answers = [];
    const bases = [
      { base: 2, logInt: S115_LOGS[2] },
      { base: 3, logInt: S115_LOGS[3] },
      { base: 7, logInt: S115_LOGS[7] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 1) {
        const item = bases[mode];
        const exponent = randInt(20, 120);
        const positiveLog = item.logInt * exponent;
        if (positiveLog % 10000 === 0) {
          i -= 1;
          continue;
        }
        const place = Math.ceil(positiveLog / 10000);
        questions.push(
          `已知 \\(\\log ${item.base}\\approx ${formatS115LogInt(item.logInt)}\\)，判定 \\((\\frac{1}{${item.base}})^{${exponent}}\\) 從小數點後第幾位開始出現不為 0 的數字。`
        );
        answers.push(
          `簡答：第 ${place} 位。過程：\\(\\log (\\frac{1}{${item.base}})^{${exponent}}=-${exponent}\\log ${item.base}\\approx -${formatS115LogInt(positiveLog)}\\)。因為 \\(-${place}<\\log x<-${place - 1}\\)，所以首位非零在小數點後第 ${place} 位。`
        );
        continue;
      }
      if (mode === 2) {
        const exponent = randInt(30, 100);
        const positiveLog = (S115_LOGS[7] - S115_LOGS[2]) * exponent;
        const place = Math.ceil(positiveLog / 10000);
        questions.push(
          `已知 \\(\\log2\\approx0.3010,\\log7\\approx0.8451\\)，判定 \\((\\frac{2}{7})^{${exponent}}\\) 的首位非零出現在小數點後第幾位。`
        );
        answers.push(
          `簡答：第 ${place} 位。過程：\\(\\log(\\frac{2}{7})^{${exponent}}=${exponent}(\\log2-\\log7)\\approx-${formatS115LogInt(positiveLog)}\\)，所以首位非零在小數點後第 ${place} 位。`
        );
        continue;
      }
      if (mode === 3) {
        const place = randInt(3, 9);
        const mantissa = randInt(1000, 9000);
        const positiveLog = (place - 1) * 10000 + mantissa;
        questions.push(`若 \\(\\log x=-${formatS115LogInt(positiveLog)}\\)，判定 \\(x\\) 從小數點後第幾位開始不為 0。`);
        answers.push(
          `簡答：第 ${place} 位。過程：\\(-${place}<\\log x<-${place - 1}\\)，表示 \\(10^{-${place}}<x<10^{-${place + -1}}\\)，所以首位非零在小數點後第 ${place} 位。`
        );
        continue;
      }
      const exponent = randInt(60, 160);
      const positiveLog = 170 * exponent;
      const place = Math.ceil(positiveLog / 10000);
      questions.push(
        `已知 \\(\\log1.04\\approx0.0170\\)，判定 \\((1.04)^{-${exponent}}\\) 的首位非零出現在小數點後第幾位。`
      );
      answers.push(
        `簡答：第 ${place} 位。過程：\\(\\log(1.04)^{-${exponent}}=-${exponent}\\log1.04\\approx-${formatS115LogInt(positiveLog)}\\)，所以首位非零在小數點後第 ${place} 位。`
      );
    }
    return { questions, answers };
  }

  function buildS115LeadingDigitSet(count) {
    const questions = [];
    const answers = [];
    const baseItems = [
      { base: 2, logInt: S115_LOGS[2] },
      { base: 3, logInt: S115_LOGS[3] },
      { base: 7, logInt: S115_LOGS[7] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 2) {
        const item = baseItems[mode];
        const exponent = randInt(20, 100);
        const logValue = item.logInt * exponent;
        const mantissa = logValue % 10000;
        const digit = getS115LeadingDigitByMantissa(mantissa);
        const nextLog = S115_LOG_DIGIT_THRESHOLDS[digit - 1].logInt;
        const upperLog = S115_LOG_DIGIT_THRESHOLDS[digit].logInt;
        questions.push(
          `已知常用對數表，\\(\\log ${item.base}\\approx${formatS115LogInt(item.logInt)}\\)，求 \\(${item.base}^{${exponent}}\\) 的最高位數字。`
        );
        answers.push(
          `簡答：${digit}。過程：\\(\\log ${item.base}^{${exponent}}\\approx${formatS115LogInt(logValue)}\\)，尾數為 ${formatS115PureDecimal(mantissa)}。因為 \\(\\log ${digit}\\approx${formatS115LogInt(nextLog)}\\leq ${formatS115PureDecimal(mantissa)}<\\log ${digit + 1}\\approx${formatS115LogInt(upperLog)}\\)，所以最高位數字為 ${digit}。`
        );
        continue;
      }
      if (mode === 3) {
        const characteristic = randInt(2, 9);
        const mantissas = [3310, 5229, 6690, 8129];
        const tail = mantissas[randInt(0, mantissas.length - 1)];
        const logValue = -(characteristic * 10000 + tail);
        const mantissa = 10000 - tail;
        const digit = getS115LeadingDigitByMantissa(mantissa);
        questions.push(`若 \\(\\log a=${formatS115LogInt(logValue)}\\)，求 \\(a\\) 的最高位數字。`);
        answers.push(
          `簡答：${digit}。過程：\\(\\log a=${formatS115LogInt(logValue)}\\) 的首數為 \\(-${characteristic + 1}\\)，尾數為 ${formatS115PureDecimal(mantissa)}。依對數尾數比較，可得最高位數字為 ${digit}。`
        );
        continue;
      }
      const exponent = randInt(10, 60);
      const logValue = (S115_LOGS[5] - S115_LOGS[6]) * exponent;
      const mantissa = ((logValue % 10000) + 10000) % 10000;
      const digit = getS115LeadingDigitByMantissa(mantissa);
      questions.push(
        `已知 \\(\\log5\\approx0.6990,\\log6\\approx0.7781\\)，求 \\((\\frac{5}{6})^{${exponent}}\\) 的首位非零數字。`
      );
      answers.push(
        `簡答：${digit}。過程：\\(\\log(\\frac{5}{6})^{${exponent}}=${exponent}(\\log5-\\log6)\\approx${formatS115LogInt(logValue)}\\)，其尾數為 ${formatS115PureDecimal(mantissa)}，所以首位非零數字為 ${digit}。`
      );
    }
    return { questions, answers };
  }

  function buildS115CharacteristicMantissaAlgebraSet(count) {
    const questions = [];
    const answers = [];
    const tails = [3010, 4771, 6021, 6990, 8451];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 2) {
        const characteristic = randInt(1, 4);
        const tail = tails[randInt(0, tails.length - 1)];
        const sum = characteristic * 10000 + tail;
        const product = characteristic * tail;
        questions.push(
          `若 \\(\\log a\\) 的首數與尾數為方程 \\(x^2-${formatS115LogInt(sum)}x+${formatS115LogInt(product)}=0\\) 的兩根，求 \\(\\log a\\)。`
        );
        answers.push(
          `簡答：\\(\\log a=${formatS115LogInt(characteristic * 10000 + tail)}\\)。過程：方程兩根為 ${characteristic} 與 ${formatS115PureDecimal(tail)}。首數必為整數、尾數必為 \\([0,1)\\) 的小數，所以首數為 ${characteristic}、尾數為 ${formatS115PureDecimal(tail)}，故 \\(\\log a=${formatS115LogInt(characteristic * 10000 + tail)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(
          `已知 \\(\\log a\\) 的尾數與 \\(\\log \\frac{1}{a}\\) 的尾數相同，且 \\(1<a<10\\)，求 \\(a\\)。`
        );
        answers.push(
          `簡答：\\(a=\\sqrt{10}\\)。過程：設 \\(\\log a=\\alpha\\)，其中 \\(0<\\alpha<1\\)。則 \\(\\log\\frac{1}{a}=-\\alpha=-1+(1-\\alpha)\\)，尾數為 \\(1-\\alpha\\)。兩尾數相同得 \\(\\alpha=1-\\alpha\\)，所以 \\(\\alpha=\\frac{1}{2}\\)，故 \\(a=10^{1/2}=\\sqrt{10}\\)。`
        );
        continue;
      }
      questions.push(`若 \\(\\log x^2\\) 與 \\(\\log\\frac{1}{x}\\) 的尾數相同，且 \\(1<x<\\sqrt{10}\\)，求 \\(x\\)。`);
      answers.push(
        `簡答：\\(x=\\sqrt[3]{10}\\)。過程：設 \\(\\log x=\\alpha\\)，\\(0<\\alpha<\\frac{1}{2}\\)。\\(\\log x^2=2\\alpha\\)，\\(\\log\\frac{1}{x}=-\\alpha\\) 的尾數為 \\(1-\\alpha\\)。令 \\(2\\alpha=1-\\alpha\\)，得 \\(\\alpha=\\frac{1}{3}\\)，所以 \\(x=10^{1/3}=\\sqrt[3]{10}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS115LogOperationScientificNotationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(
          `已知 \\(\\log2\\approx0.3010,\\log3\\approx0.4771\\)，求 \\(\\log1.2\\) 與 \\(\\log1.5\\) 的近似值。`
        );
        answers.push(
          `簡答：\\(\\log1.2\\approx0.0791\\)，\\(\\log1.5\\approx0.1761\\)。過程：\\(1.2=\\frac{6}{5}\\)，所以 \\(\\log1.2=\\log6-\\log5=(\\log2+\\log3)-(1-\\log2)=2\\log2+\\log3-1\\approx0.0791\\)。\\(1.5=\\frac{3}{2}\\)，所以 \\(\\log1.5=\\log3-\\log2\\approx0.1761\\)。`
        );
        continue;
      }
      if (mode === 1) {
        let exponent2 = randInt(12, 25);
        let exponent3 = randInt(8, 18);
        let log2Term = S115_LOGS[2] * exponent2;
        let log3Term = S115_LOGS[3] * exponent3;
        while (Math.abs(Math.floor(log2Term / 10000) - Math.floor(log3Term / 10000)) < 2) {
          exponent2 = randInt(12, 25);
          exponent3 = randInt(8, 18);
          log2Term = S115_LOGS[2] * exponent2;
          log3Term = S115_LOGS[3] * exponent3;
        }
        const larger =
          log2Term >= log3Term
            ? { base: 2, exponent: exponent2, logValue: log2Term }
            : { base: 3, exponent: exponent3, logValue: log3Term };
        const digits = Math.floor(larger.logValue / 10000) + 1;
        questions.push(
          `已知 \\(\\log2\\approx0.3010,\\log3\\approx0.4771\\)，判定 \\(2^{${exponent2}}+3^{${exponent3}}\\) 大約為幾位數。`
        );
        answers.push(
          `簡答：約 ${digits} 位數。過程：比較兩項對數，\\(\\log2^{${exponent2}}\\approx${formatS115LogInt(log2Term)}\\)，\\(\\log3^{${exponent3}}\\approx${formatS115LogInt(log3Term)}\\)。兩項位數至少差 2 位，較小項不會改變總和位數；較大項為 \\(${larger.base}^{${larger.exponent}}\\)，所以總和約為 ${digits} 位數。`
        );
        continue;
      }
      if (mode === 2) {
        const coefficient = randInt(12, 98);
        const zeros = randInt(3, 6);
        const value = coefficient * 10 ** zeros;
        questions.push(`將 ${value} 表為科學記號，並判定其對數的首數。`);
        answers.push(
          `簡答：\\(${coefficient / 10}\\times10^{${zeros + 1}}\\)，首數為 ${zeros + 1}。過程：${value}=${coefficient / 10}\\times10^{${zeros + 1}}\\)，且 \\(1\\leq${coefficient / 10}<10\\)，所以 \\(\\log ${value}=\\log(${coefficient / 10})+${zeros + 1}\\)，首數為 ${zeros + 1}。`
        );
        continue;
      }
      if (mode === 3) {
        const coefficientItems = [
          { text: '1.2', logInt: 791 },
          { text: '1.5', logInt: 1761 },
          { text: '2', logInt: 3010 },
          { text: '3', logInt: 4771 },
          { text: '5', logInt: 6990 },
          { text: '6', logInt: 7781 },
          { text: '7', logInt: 8451 },
          { text: '8', logInt: 9031 },
          { text: '9', logInt: 9542 },
        ];
        const coefficient = coefficientItems[randInt(0, coefficientItems.length - 1)];
        const exponent = randInt(2, 6);
        questions.push(
          `已知 \\(\\log${coefficient.text}\\approx${formatS115LogInt(coefficient.logInt)}\\)，求 \\(\\log(${coefficient.text}\\times10^{${exponent}})\\)。`
        );
        answers.push(
          `簡答：\\(${formatS115LogInt(exponent * 10000 + coefficient.logInt)}\\)。過程：\\(\\log(${coefficient.text}\\times10^{${exponent}})=\\log${coefficient.text}+${exponent}\\approx${formatS115LogInt(coefficient.logInt)}+${exponent}=${formatS115LogInt(exponent * 10000 + coefficient.logInt)}\\)。`
        );
        continue;
      }
      const choices = [
        { logInt: -26990, text: '2\\times10^{-3}', process: '-3+\\log2=-3+0.3010=-2.6990' },
        { logInt: -25229, text: '3\\times10^{-3}', process: '-3+\\log3=-3+0.4771=-2.5229' },
        { logInt: -13010, text: '5\\times10^{-2}', process: '-2+\\log5=-2+0.6990=-1.3010' },
      ];
      const item = choices[randInt(0, choices.length - 1)];
      questions.push(`已知 \\(\\log x=${formatS115LogInt(item.logInt)}\\)，將 \\(x\\) 表示為科學記號。`);
      answers.push(`簡答：\\(${item.text}\\)。過程：因為 \\(${item.process}\\)，所以 \\(x=${item.text}\\)。`);
    }
    return { questions, answers };
  }

  function formatS121Point(p) {
    return `(${p.x},${p.y})`;
  }

  function formatS121Signed(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `${value}`;
  }

  function formatS121Term(coef, variable) {
    if (coef === 0) return '';
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${coef}${variable}`;
  }

  function formatS121Line(a, b, c) {
    const parts = [];
    if (a !== 0) parts.push(formatS121Term(a, 'x'));
    if (b !== 0) parts.push(`${b > 0 && parts.length ? '+' : ''}${formatS121Term(b, 'y')}`);
    if (c !== 0) parts.push(`${c > 0 && parts.length ? '+' : ''}${c}`);
    return `${parts.join('')}=0`;
  }

  function formatS121FractionText(value) {
    return formatFunctionFractionValue(makeFraction(value, 1));
  }

  function formatS121VectorOffset(t, a, b) {
    return `${t >= 0 ? '+' : '-'}${Math.abs(t)}(${a},${b})`;
  }

  function formatS121ParamExpr(base, coeff, parameter) {
    if (coeff === 0) return `${base}`;
    const sign = coeff > 0 ? '+' : '-';
    const absCoeff = Math.abs(coeff);
    const coefText = absCoeff === 1 ? '' : `${absCoeff}`;
    return `${base}${sign}${coefText}${parameter}`;
  }

  function buildS121ProjectionSymmetrySet(count) {
    const questions = [];
    const answers = [];
    const normals = [
      [1, 2],
      [2, -1],
      [3, -2],
      [2, 3],
      [1, -3],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = normals[i % normals.length];
      const foot = { x: randInt(-4, 5), y: randInt(-4, 5) };
      const t = randInt(1, 3) * (randInt(0, 1) ? 1 : -1);
      const p = { x: foot.x + a * t, y: foot.y + b * t };
      const q = { x: foot.x - a * t, y: foot.y - b * t };
      const c = -(a * foot.x + b * foot.y);
      const line = formatS121Line(a, b, c);
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`求點 \\(P${formatS121Point(p)}\\) 對直線 \\(L:${line}\\) 的投影點坐標。`);
        answers.push(
          `簡答：\\(${formatS121Point(foot)}\\)。過程：投影點在直線 \\(L\\) 上，且 \\(P\\) 到投影點的連線方向與 \\(L\\) 的法向量 \\((${a},${b})\\) 平行。由建構可寫 \\(P=${formatS121Point(foot)}${formatS121VectorOffset(t, a, b)}\\)，所以垂足為 \\(${formatS121Point(foot)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`求點 \\(P${formatS121Point(p)}\\) 關於直線 \\(L:${line}\\) 的對稱點坐標。`);
        answers.push(
          `簡答：\\(${formatS121Point(q)}\\)。過程：對稱軸上的中點就是垂足 \\(${formatS121Point(foot)}\\)。因為 \\(P=${formatS121Point(foot)}${formatS121VectorOffset(t, a, b)}\\)，反射後為 \\(${formatS121Point(foot)}${formatS121VectorOffset(-t, a, b)}=${formatS121Point(q)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(
          `直線 \\(L:${line}\\) 為線段 \\(AB\\) 的中垂線。已知 \\(A${formatS121Point(p)}\\)，求 \\(B\\) 點坐標。`
        );
        answers.push(
          `簡答：\\(B${formatS121Point(q)}\\)。過程：中垂線上的垂足是 \\(AB\\) 中點 \\(${formatS121Point(foot)}\\)，所以 \\(B\\) 是 \\(A\\) 關於 \\(L\\) 的對稱點，得 \\(B${formatS121Point(q)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(
          `光線經過 \\(A${formatS121Point(p)}\\)，碰到直線 \\(L:${line}\\) 後反射，反射後經過 \\(B${formatS121Point(q)}\\)。求反射點坐標。`
        );
        answers.push(
          `簡答：\\(${formatS121Point(foot)}\\)。過程：\\(A\\) 與 \\(B\\) 關於反射直線對稱時，連線 \\(AB\\) 與鏡面交點即為反射點。\\(A,B\\) 的中點為 \\(${formatS121Point(foot)}\\)，且在 \\(L\\) 上，所以反射點為 \\(${formatS121Point(foot)}\\)。`
        );
        continue;
      }
      questions.push(
        `點 \\(P${formatS121Point(p)}\\) 關於直線 \\(L:${line}\\) 的對稱點為 \\(Q\\)。求線段 \\(PQ\\) 的中點。`
      );
      answers.push(
        `簡答：\\(${formatS121Point(foot)}\\)。過程：對稱點連線 \\(PQ\\) 會垂直對稱軸，且被對稱軸平分，所以 \\(PQ\\) 的中點就是 \\(P\\) 在 \\(L\\) 上的投影點 \\(${formatS121Point(foot)}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS121LineClusterFixedPointSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = { x: randInt(-4, 4), y: randInt(-4, 4) };
      const a0 = randInt(1, 4);
      const b0 = randInt(-4, 4) || 2;
      const a1 = randInt(-4, 4) || -1;
      const b1 = randInt(1, 4);
      if (a0 * b1 - a1 * b0 === 0) {
        i -= 1;
        continue;
      }
      const c0 = -(a0 * p.x + b0 * p.y);
      const c1 = -(a1 * p.x + b1 * p.y);
      const mode = i % 5;
      const parameter = mode % 2 === 0 ? 'k' : 'm';
      questions.push(
        `不論 \\(${parameter}\\) 為何實數，直線 \\(L:(${formatS121ParamExpr(a0, a1, parameter)})x+(${formatS121ParamExpr(b0, b1, parameter)})y+(${formatS121ParamExpr(c0, c1, parameter)})=0\\) 恆過一定點，求此點坐標。`
      );
      answers.push(
        `簡答：\\(${formatS121Point(p)}\\)。過程：把含 \\(${parameter}\\) 與不含 \\(${parameter}\\) 的部分分開，得 \\(${formatS121Line(a0, b0, c0)}\\) 與 \\(${formatS121Line(a1, b1, c1)}\\)。兩式交點同時滿足所有 \\(${parameter}\\) 的直線，解得定點為 \\(${formatS121Point(p)}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS121TriangleNonexistenceSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '三直線 \\(L_1:x=0\\)、\\(L_2:y=0\\)、\\(L_3:kx+y-1=0\\) 不能圍成三角形，求 \\(k\\)。',
        a: '簡答：\\(k=0\\)。過程：若三線不能圍成三角形，可能是兩線平行或三線共點。此題 \\(L_3\\) 與 \\(L_2:y=0\\) 平行時需 \\(k=0\\)，此時 \\(L_3:y=1\\)，與 \\(L_2\\) 平行，所以不能圍成三角形。',
      },
      {
        q: '三直線 \\(L_1:x=2\\)、\\(L_2:y=-1\\)、\\(L_3:x+ky-3=0\\) 三線共點時不能圍成三角形，求 \\(k\\)。',
        a: '簡答：\\(k=-1\\)。過程：\\(L_1,L_2\\) 交於 \\((2,-1)\\)。代入 \\(L_3\\)：\\(2+k(-1)-3=0\\)，得 \\(k=-1\\)。',
      },
      {
        q: '三直線 \\(L_1:2x-y=1\\)、\\(L_2:2x-y=5\\)、\\(L_3:x+ky=3\\) 是否可能圍成三角形？',
        a: '簡答：不能。過程：\\(L_1\\) 與 \\(L_2\\) 斜率相同且截距不同，兩線平行。三條直線只要已有兩線平行，就無法圍成三角形。',
      },
      {
        q: '若 \\(L_k:x+y-4+k(x-y+2)=0\\) 與 \\(x=1\\)、\\(y=3\\) 三線共點，求 \\(k\\)。',
        a: '簡答：任意實數 \\(k\\)。過程：\\(x=1\\)、\\(y=3\\) 交於 \\((1,3)\\)。代入 \\(L_k\\)：\\(1+3-4+k(1-3+2)=0\\)，即 \\(0+0k=0\\)，所以任何 \\(k\\) 都通過此點。',
      },
      {
        q: '設 \\(L_1:x+y=4\\)、\\(L_2:x-y=2\\)、\\(L_3:kx+y=6\\)。若三線不能圍成三角形，求 \\(k\\) 的可能值。',
        a: '簡答：\\(k=-1,1,\\frac{5}{3}\\)。過程：三線不能圍成三角形有兩線平行或三線共點兩種情形。\\(L_1\\) 斜率為 \\(-1\\)，\\(L_2\\) 斜率為 \\(1\\)，\\(L_3:kx+y=6\\) 斜率為 \\(-k\\)。因此 \\(L_3\\parallel L_1\\) 時 \\(-k=-1\\)，得 \\(k=1\\)；\\(L_3\\parallel L_2\\) 時 \\(-k=1\\)，得 \\(k=-1\\)。又 \\(L_1,L_2\\) 交於 \\((3,1)\\)，若三線共點，代入 \\(L_3\\) 得 \\(3k+1=6\\)，所以 \\(k=\\frac{5}{3}\\)。因此可能值為 \\(-1,1,\\frac{5}{3}\\)。',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS121InverseDistanceSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '設直線 \\(L\\) 的斜率為 \\(\\frac{3}{4}\\)，且與兩坐標軸圍成的三角形面積為 24，求 \\(L\\) 的方程式。',
        a: '簡答：\\(3x-4y+24=0\\) 或 \\(3x-4y-24=0\\)。過程：斜率為 \\(\\frac{3}{4}\\)，設 \\(y=\\frac{3}{4}x+b\\)。兩軸截距為 \\(-\\frac{4b}{3}\\)、\\(b\\)，面積 \\(=\\frac{1}{2}|-\\frac{4b}{3}\\cdot b|=24\\)，得 \\(b^2=36\\)，所以 \\(b=\\pm6\\)，整理得兩式。',
      },
      {
        q: '已知平行線 \\(L_1:3x-4y+2=0\\) 與 \\(L_2:3x-4y+k=0\\) 的距離為 2，求 \\(k\\) 的可能值。',
        a: '簡答：\\(k=12\\) 或 \\(k=-8\\)。過程：平行線距離 \\(d=\\frac{|k-2|}{\\sqrt{3^2+(-4)^2}}=\\frac{|k-2|}{5}\\)。令距離為 2，得 \\(|k-2|=10\\)，所以 \\(k=12\\) 或 \\(-8\\)。',
      },
      {
        q: '直線 \\(L\\) 通過點 \\((4,2)\\)，且與兩坐標軸圍成的三角形面積為 16。若 \\(L\\) 的兩截距皆為正，求 \\(L\\)。',
        a: '簡答：\\(x+2y-8=0\\)。過程：設截距式為 \\(\\frac{x}{a}+\\frac{y}{b}=1\\)，且 \\(\\frac{1}{2}ab=16\\)，所以 \\(ab=32\\)。取 \\(a=8,b=4\\)，代入 \\((4,2)\\) 得 \\(\\frac{4}{8}+\\frac{2}{4}=1\\)，故 \\(\\frac{x}{8}+\\frac{y}{4}=1\\)，整理得 \\(x+2y-8=0\\)。',
      },
      {
        q: '若點 \\(A(1,2)\\) 到直線 \\(L:2x+y+k=0\\) 的距離為 \\(\\sqrt5\\)，求 \\(k\\)。',
        a: '簡答：\\(k=1\\) 或 \\(k=-9\\)。過程：距離公式得 \\(\\frac{|2\\cdot1+2+k|}{\\sqrt{2^2+1^2}}=\\sqrt5\\)，所以 \\(|k+4|=5\\)，得 \\(k=1\\) 或 \\(k=-9\\)。',
      },
      {
        q: '設直線 \\(L\\) 過點 \\((-3,4)\\)，且與坐標軸在第二象限圍成三角形面積最小，求最小面積。',
        a: '簡答：24。過程：設負 \\(x\\) 截距長為 \\(a\\)、正 \\(y\\) 截距長為 \\(b\\)，直線為 \\(-\\frac{x}{a}+\\frac{y}{b}=1\\)。代入 \\((-3,4)\\) 得 \\(\\frac{3}{a}+\\frac{4}{b}=1\\)。由 AM-GM 可得面積 \\(\\frac{1}{2}ab\\) 最小在 \\(\\frac{3}{a}=\\frac{4}{b}=\\frac{1}{2}\\)，得 \\(a=6,b=8\\)，最小面積為 24。',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS121GeometricOptimizationSet(count) {
    const templates = [
      {
        q: '設 \\(A(1,5),B(6,7)\\)，動點 \\(P(x,0)\\) 在 \\(x\\) 軸上移動，求 \\(PA+PB\\) 的最小值。',
        a: '簡答：13。過程：將 \\(A\\) 對 \\(x\\) 軸反射為 \\(A\\prime(1,-5)\\)。\\(PA+PB=A\\prime P+PB\\)，最短為直線距離 \\(A\\prime B\\)，故最小值 \\(=\\sqrt{(6-1)^2+(7+5)^2}=13\\)。',
      },
      {
        q: '求 \\(\\sqrt{(x-4)^2+25}+\\sqrt{(x+4)^2+1}\\) 的最小值。',
        a: '簡答：10。過程：此式可看成 \\(P(x,0)\\) 到 \\(A(4,5)\\)、\\(B(-4,1)\\) 的距離和。將 \\(A\\) 對 \\(x\\) 軸反射為 \\(A\\prime(4,-5)\\)，最小值為 \\(A\\prime B=\\sqrt{8^2+6^2}=10\\)。',
      },
      {
        q: '設 \\(A(1,-1),B(3,2)\\)，在直線 \\(L:2x+y+1=0\\) 上找一點 \\(P\\)，使 \\(PA^2+PB^2\\) 最小。',
        a: '簡答：\\(P(-\\frac{1}{5},-\\frac{3}{5})\\)。過程：\\(PA^2+PB^2=2PM^2+\\frac{1}{2}AB^2\\)，其中 \\(M\\) 是 \\(AB\\) 中點 \\((2,\\frac{1}{2})\\)。因此只需取 \\(M\\) 到 \\(L\\) 的投影點。對直線 \\(2x+y+1=0\\)，\\(d=\\frac{2\\cdot2+\\frac{1}{2}+1}{2^2+1^2}=\\frac{11}{10}\\)，投影點為 \\((2,\\frac{1}{2})-\\frac{11}{10}(2,1)=(-\\frac{1}{5},-\\frac{3}{5})\\)。',
      },
      {
        q: '兩點 \\(A(2,1),B(9,4)\\) 在直線 \\(L:3x-y=15\\) 的異側，\\(P\\) 在 \\(L\\) 上移動，求 \\(|PA-PB|\\) 的最大值。',
        a: '簡答：\\(\\sqrt{26}\\)。過程：設 \\(P=(t,3t-15)\\)。則 \\(PA^2=(t-2)^2+(3t-16)^2\\)，\\(PB^2=(t-9)^2+(3t-19)^2\\)。在 \\(P\\) 位於交點同側且 \\(PA>PB\\) 時，令 \\(D=PA-PB\\)，則 \\(D\\prime=\\frac{10t-50}{PA}-\\frac{10t-66}{PB}\\)。由 \\(D\\prime=0\\) 可得 \\(t=13\\)。此時 \\(P=(13,24)\\)，\\(PA=\\sqrt{650}=5\\sqrt{26}\\)，\\(PB=\\sqrt{416}=4\\sqrt{26}\\)，所以 \\(D=\\sqrt{26}\\)。而交點處 \\(D=0\\)，當 \\(|t|\\) 越來越大時 \\(|PA-PB|\\) 趨近 \\(\\frac{8\\sqrt{10}}{5}<\\sqrt{26}\\)，因此最大值為 \\(\\sqrt{26}\\)。',
      },
      {
        q: '在 \\(x\\) 軸上找點 \\(P\\)，使 \\(P\\) 到 \\((2,3)\\) 與 \\((-4,1)\\) 的距離平方和最小。',
        a: '簡答：\\(P(-1,0)\\)。過程：距離平方和最小時，\\(P\\) 是兩點中點 \\((-1,2)\\) 到 \\(x\\) 軸的投影，因此 \\(P=(-1,0)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS121TriangleCentersSet(count) {
    const templates = [
      {
        q: '已知 \\(\\triangle ABC\\) 三頂點為 \\(A(1,8),B(3,5),C(12,11)\\)，求重心 \\(G\\) 坐標。',
        a: '簡答：\\(G(\\frac{16}{3},8)\\)。過程：重心為三頂點坐標平均，\\(G=(\\frac{1+3+12}{3},\\frac{8+5+11}{3})=(\\frac{16}{3},8)\\)。',
      },
      {
        q: '已知 \\(\\triangle ABC\\) 三頂點為 \\(A(2,1),B(7,4),C(4,9)\\)，求外心 \\(O\\) 坐標。',
        a: '簡答：\\(O(3,5)\\)。過程：外心在兩邊中垂線交點。\\(AB\\) 中點 \\((\\frac{9}{2},\\frac{5}{2})\\)，斜率 \\(\\frac{3}{5}\\)，中垂線斜率 \\(-\\frac{5}{3}\\)。\\(AC\\) 中點 \\((3,5)\\)，斜率 4，中垂線斜率 \\(-\\frac{1}{4}\\)。解兩中垂線得 \\(O(3,5)\\)，且到三頂點距離皆為 \\(\\sqrt{17}\\)。',
      },
      {
        q: '若三邊所在直線為 \\(x+2y=9\\)、\\(x-y=9\\)、\\(3x-y=13\\)，求三角形重心。',
        a: '簡答：\\((\\frac{16}{3},-\\frac{5}{3})\\)。過程：三頂點為三條邊兩兩交點。\\(x+2y=9\\) 與 \\(x-y=9\\) 交於 \\((9,0)\\)；\\(x+2y=9\\) 與 \\(3x-y=13\\) 交於 \\((5,2)\\)；\\(x-y=9\\) 與 \\(3x-y=13\\) 交於 \\((2,-7)\\)。重心為 \\((\\frac{9+5+2}{3},\\frac{0+2-7}{3})=(\\frac{16}{3},-\\frac{5}{3})\\)。',
      },
      {
        q: '已知 \\(A(3,5),B(-1,2),C(9,-3)\\)，求 \\(A\\) 角內角平分線方向可經過的一點。',
        a: '簡答：可取 \\((2,-2)\\)。過程：角平分線方向可由兩邊的單位向量和取得。\\(\\overrightarrow{AB}=(-4,-3)\\)，單位向量為 \\((-\\frac{4}{5},-\\frac{3}{5})\\)；\\(\\overrightarrow{AC}=(6,-8)\\)，單位向量為 \\((\\frac{3}{5},-\\frac{4}{5})\\)。相加得 \\((-\\frac{1}{5},-\\frac{7}{5})\\)，所以可取方向 \\((-1,-7)\\)，從 \\(A\\) 出發得到點 \\((2,-2)\\)。',
      },
      {
        q: '由直線 \\(x=0\\)、\\(3x-4y-5=0\\)、\\(3x+4y-5=0\\) 圍成三角形，求其內心。',
        a: '簡答：\\((\\frac{5}{8},0)\\)。過程：兩斜邊關於 \\(x\\) 軸對稱，內心在 \\(y=0\\)。到直線 \\(x=0\\) 的距離為 \\(x\\)，到 \\(3x-4y-5=0\\) 的距離為 \\(\\frac{|3x-5|}{5}\\)。內心在三角形內，令 \\(x=\\frac{5-3x}{5}\\)，得 \\(x=\\frac{5}{8}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS121InterceptConstraintsSet(count) {
    const templates = [
      {
        q: '求通過點 \\((2,3)\\)，且在兩軸上的截距相等之直線方程式。',
        a: '簡答：\\(x+y=5\\)。過程：截距相等設為 \\(a\\)，截距式 \\(\\frac{x}{a}+\\frac{y}{a}=1\\)，即 \\(x+y=a\\)。代入 \\((2,3)\\) 得 \\(a=5\\)。',
      },
      {
        q: '一直線過點 \\((-1,9)\\)，且在兩軸上之截距乘積為 12，求此直線方程式之一。',
        a: '簡答：\\(3x+y=6\\)。過程：設截距為 \\(a,b\\)，則截距式為 \\(\\frac{x}{a}+\\frac{y}{b}=1\\)，且 \\(ab=12\\)。取 \\(a=2,b=6\\)，可得 \\(\\frac{x}{2}+\\frac{y}{6}=1\\)，整理為 \\(3x+y=6\\)。代入 \\((-1,9)\\) 得 \\(3(-1)+9=6\\)，且兩截距乘積為 \\(2\\cdot6=12\\)，符合題意。',
      },
      {
        q: '直線通過 \\((4,1)\\)，且與兩坐標軸在第一象限圍成三角形面積為 8，求其方程式。',
        a: '簡答：\\(x+4y=8\\)。過程：設截距式 \\(\\frac{x}{a}+\\frac{y}{b}=1\\)，且 \\(ab=16\\)。代入 \\((4,1)\\)，取 \\(a=8,b=2\\)，得 \\(\\frac{x}{8}+\\frac{y}{2}=1\\)，整理為 \\(x+4y=8\\)。',
      },
      {
        q: '求通過點 \\((3,-2)\\)，且 \\(x\\) 截距與 \\(y\\) 截距之比為 \\(2:3\\) 的直線。',
        a: '簡答：\\(3x+2y=5\\)。過程：設截距為 \\(2t,3t\\)，截距式 \\(\\frac{x}{2t}+\\frac{y}{3t}=1\\)。代入 \\((3,-2)\\) 得 \\(\\frac{3}{2t}-\\frac{2}{3t}=1\\)，解得 \\(t=\\frac{5}{6}\\)，整理得 \\(3x+2y=5\\)。',
      },
      {
        q: '直線 \\(L\\) 通過 \\((4,3)\\)，且其 \\(x\\) 截距與 \\(y\\) 截距均為正整數，問此種直線共有幾條？',
        a: '簡答：6 條。過程：設截距為正整數 \\(a,b\\)，\\(\\frac{4}{a}+\\frac{3}{b}=1\\)。整理得 \\((a-4)(b-3)=12\\)。12 的正因數配對共有 6 組，所以共有 6 條。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS121AnglesBetweenLinesSet(count) {
    const templates = [
      {
        q: '求通過點 \\((1,-2)\\)，且與直線 \\(2x-y+3=0\\) 成 \\(45^\\circ\\) 交角的直線方程式。',
        a: '簡答：\\(y+2=3(x-1)\\) 或 \\(y+2=-\\frac{1}{3}(x-1)\\)。過程：原直線斜率為 2。設所求斜率為 \\(m\\)，\\(|\\frac{m-2}{1+2m}|=1\\)，得 \\(m=3\\) 或 \\(-\\frac{1}{3}\\)，再代入點斜式。',
      },
      {
        q: '已知兩直線 \\(x+y=7\\) 與 \\((1-\\sqrt3)x-(1+\\sqrt3)y-1=0\\)，求其夾角。',
        a: '簡答：\\(60^\\circ\\)。過程：第一條斜率 \\(-1\\)，第二條斜率 \\(\\frac{1-\\sqrt3}{1+\\sqrt3}\\)。代入 \\(\\tan\\theta=|\\frac{m_1-m_2}{1+m_1m_2}|\\)，可得 \\(\\tan\\theta=\\sqrt3\\)，所以銳角為 \\(60^\\circ\\)。',
      },
      {
        q: '直線 \\(L_1\\) 斜率為 1，直線 \\(L_2\\) 與 \\(L_1\\) 交角為 \\(45^\\circ\\)，且通過 \\((1,2)\\)，求 \\(L_2\\) 方程式。',
        a: '簡答：\\(x=1\\) 或 \\(y=2\\)。過程：設 \\(L_2\\) 斜率為 \\(m\\)，\\(|\\frac{m-1}{1+m}|=1\\)，得 \\(m=0\\) 或垂直線。通過 \\((1,2)\\)，故為 \\(y=2\\) 或 \\(x=1\\)。',
      },
      {
        q: '求通過原點且與直線 \\(-\\sqrt3x+y-2=0\\) 成 \\(60^\\circ\\) 角的直線方程式。',
        a: '簡答：\\(y=0\\) 或 \\(y=-\\sqrt3x\\)。過程：原直線斜率 \\(\\sqrt3\\)。與其成 \\(60^\\circ\\) 的方向角可為 \\(0^\\circ\\) 或 \\(120^\\circ\\)，所以通過原點的直線為 \\(y=0\\) 或 \\(y=-\\sqrt3x\\)。',
      },
      {
        q: '若直線 \\(y=mx\\) 與 \\(y=2x+1\\) 的交角為 \\(45^\\circ\\)，求 \\(m\\)。',
        a: '簡答：\\(m=3\\) 或 \\(m=-\\frac{1}{3}\\)。過程：\\(|\\frac{m-2}{1+2m}|=1\\)，解得 \\(m=3\\) 或 \\(m=-\\frac{1}{3}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS121LightReflectionPathSet(count) {
    const templates = [
      {
        q: '光線從 \\(A(2,3)\\) 出發，先碰到 \\(x\\) 軸後反射並通過 \\(B(8,5)\\)，求反射點坐標。',
        a: '簡答：\\((\\frac{17}{4},0)\\)。過程：將 \\(B\\) 對 \\(x\\) 軸反射為 \\(B\\prime(8,-5)\\)。連接 \\(A(2,3)\\) 與 \\(B\\prime\\)，其與 \\(x\\) 軸交點即反射點。用參數式解 \\(y=0\\)，得 \\((\\frac{17}{4},0)\\)。',
      },
      {
        q: '一道光線沿 \\(3x-4y=1\\) 射向 \\(x\\) 軸上的點 \\((3,0)\\)，求反射後光線方程式。',
        a: '簡答：\\(3x+4y-9=0\\)。過程：對 \\(x\\) 軸反射時斜率變號。入射線斜率為 \\(\\frac{3}{4}\\)，反射線斜率為 \\(-\\frac{3}{4}\\)，過 \\((3,0)\\)，得 \\(y=-\\frac{3}{4}(x-3)\\)，整理為 \\(3x+4y-9=0\\)。',
      },
      {
        q: '光線從 \\(A(-4,1)\\) 出發，先碰到 \\(y\\) 軸後反射並通過 \\(B(6,5)\\)，求反射點坐標。',
        a: '簡答：\\((0,-7)\\)。過程：將 \\(A\\) 對 \\(y\\) 軸反射為 \\(A\\prime(4,1)\\)。連接 \\(A\\prime\\) 與 \\(B(6,5)\\)，其與 \\(y\\) 軸交點即反射點。直線斜率為 2，方程為 \\(y-1=2(x-4)\\)，令 \\(x=0\\) 得 \\(y=-7\\)。',
      },
      {
        q: '撞球檯上白球在 \\((5,15)\\)，欲撞擊在 \\((80,30)\\) 的紅球，若先碰撞邊 \\(y=0\\)，求碰撞點。',
        a: '簡答：\\((55,0)\\)。過程：將紅球對 \\(y=0\\) 反射為 \\((80,-30)\\)。連白球 \\((5,15)\\) 與 \\((80,-30)\\)，與 \\(y=0\\) 的交點即碰撞點。直線參數解得 \\((55,0)\\)。',
      },
      {
        q: '已知光線經 \\(y=x\\) 反射，入射光線為 \\(x+2y=5\\)，求反射光線方程式。',
        a: '簡答：\\(2x+y=5\\)。過程：關於 \\(y=x\\) 反射會交換 \\(x,y\\)。將入射線方程 \\(x+2y=5\\) 中的 \\(x,y\\) 互換，得反射線 \\(2x+y=5\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS121AreaPartitioningSet(count) {
    const templates = [
      {
        q: '設 \\(A(0,0),B(10,0),C(10,6),D(0,6)\\)，求過 \\((7,4)\\) 且平分四邊形 \\(ABCD\\) 面積的直線斜率。',
        a: '簡答：\\(\\frac{1}{2}\\)。過程：矩形的面積平分線若通過中心 \\((5,3)\\)，則必平分面積。直線又過 \\((7,4)\\)，斜率為 \\(\\frac{4-3}{7-5}=\\frac{1}{2}\\)。',
      },
      {
        q: '直線 \\(y=m(x-7)+4\\) 平分矩形 \\([0,14]\\times[0,8]\\) 面積，求 \\(m\\)。',
        a: '簡答：任意實數 \\(m\\)。過程：矩形中心為 \\((7,4)\\)。任一通過中心的直線都把中心對稱圖形面積平分，而題目直線皆通過 \\((7,4)\\)，所以任意 \\(m\\) 皆可。',
      },
      {
        q: '三角形頂點為 \\((0,0),(6,0),(0,8)\\)，求過原點且平分三角形面積的直線。',
        a: '簡答：\\(y=\\frac{4}{3}x\\)。過程：從頂點出發的中線平分三角形面積。對邊端點 \\((6,0),(0,8)\\) 的中點為 \\((3,4)\\)，故直線通過原點與 \\((3,4)\\)，方程為 \\(y=\\frac{4}{3}x\\)。',
      },
      {
        q: '給定平行四邊形三頂點 \\((0,0),(8,0),(10,6)\\)，求過中心且平分面積的一條直線。',
        a: '簡答：例如 \\(y=3\\)。過程：第四點為 \\((2,6)\\)，中心為兩對角線中點 \\((5,3)\\)。任一過中心的直線平分平行四邊形面積，因此可取 \\(y=3\\)。',
      },
      {
        q: '坐標平面上有一個中心在 \\((2,-1)\\) 的中心對稱區域，求平分此區域總面積的直線集合特徵。',
        a: '簡答：所有通過 \\((2,-1)\\) 的直線。過程：中心對稱區域中，通過對稱中心的任一直線會把每一點與其對稱點分到兩側，因此兩側面積相等。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS121LineSegmentSlopeRangeSet(count) {
    const templates = [
      {
        q: '設 \\(A(-2,1),B(1,2)\\)，直線 \\(L:y=mx\\) 與線段 \\(AB\\) 相交，求 \\(m\\) 的範圍。',
        a: '簡答：\\(m\\leq -\\frac{1}{2}\\) 或 \\(m\\geq 2\\)。過程：若 \\(L:y=mx\\) 與線段 \\(AB\\) 相交，則線段上某點 \\((x,y)\\) 滿足 \\(m=\\frac{y}{x}\\)。端點斜率為 \\(\\frac{1}{-2}=-\\frac{1}{2}\\)、\\(\\frac{2}{1}=2\\)。線段 \\(AB\\) 會跨過 \\(x=0\\)，且跨越處不是原點，所以斜率在左側趨向 \\(-\\infty\\)，在右側由 \\(+\\infty\\) 降到 2。因此範圍為 \\((-\\infty,-\\frac{1}{2}]\\cup[2,\\infty)\\)。',
      },
      {
        q: '設 \\(A(-2,1),B(3,2)\\)，直線 \\(L:y=mx+2\\)。若 \\(L\\) 與線段 \\(AB\\) 相交，求 \\(m\\) 的範圍。',
        a: '簡答：\\(m\\leq 0\\) 或 \\(m\\geq \\frac{1}{2}\\)。過程：線段上點若在 \\(L:y=mx+2\\) 上，則 \\(m=\\frac{y-2}{x}\\)。端點給出 \\(m_A=\\frac{1-2}{-2}=\\frac{1}{2}\\)、\\(m_B=\\frac{2-2}{3}=0\\)。線段跨過 \\(x=0\\)，此時 \\(y-2\\neq0\\)，斜率會分成兩段，得到 \\((-\\infty,0]\\cup[\\frac{1}{2},\\infty)\\)。',
      },
      {
        q: '已知 \\(A(3,4),B(-1,2)\\)，直線 \\(L:y-1=m(x-2)\\) 與線段 \\(AB\\) 不相交，求 \\(m\\) 的範圍。',
        a: '簡答：\\(-\\frac{1}{3}<m<3\\)。過程：若相交，線段上某點需滿足 \\(m=\\frac{y-1}{x-2}\\)。端點給出 \\(m_A=\\frac{4-1}{3-2}=3\\)、\\(m_B=\\frac{2-1}{-1-2}=-\\frac{1}{3}\\)。線段跨過 \\(x=2\\)，相交斜率範圍為 \\((-\\infty,-\\frac{1}{3}]\\cup[3,\\infty)\\)，所以不相交時為補集 \\((-\\frac{1}{3},3)\\)。',
      },
      {
        q: '若直線 \\(L\\) 斜率為 \\(m\\) 且通過 \\((0,3)\\)，要使 \\(L\\) 與連接 \\(A(-2,1),B(1,2)\\) 的線段相交，求 \\(m\\)。',
        a: '簡答：\\(m\\leq -1\\) 或 \\(m\\geq 1\\)。過程：直線過 \\((0,3)\\)，所以線段上點 \\((x,y)\\) 對應斜率 \\(m=\\frac{y-3}{x}\\)。端點斜率為 \\(\\frac{1-3}{-2}=1\\)、\\(\\frac{2-3}{1}=-1\\)。線段跨過 \\(x=0\\)，且該點不在 \\((0,3)\\)，所以可取斜率為 \\((-\\infty,-1]\\cup[1,\\infty)\\)。',
      },
      {
        q: '設直線 \\(L:mx-y+(2m+3)=0\\)，若 \\(L\\) 與線段 \\(A(1,2),B(4,5)\\) 相交，求 \\(m\\)。',
        a: '簡答：\\(-\\frac{1}{3}\\leq m\\leq \\frac{1}{3}\\)。過程：方程可寫成 \\(y=m(x+2)+3\\)，表示直線族都通過 \\((-2,3)\\)。線段上點若在直線上，則 \\(m=\\frac{y-3}{x+2}\\)。端點斜率為 \\(\\frac{2-3}{1+2}=-\\frac{1}{3}\\)、\\(\\frac{5-3}{4+2}=\\frac{1}{3}\\)。因為線段上 \\(x+2>0\\)，斜率連續變化，所以 \\(-\\frac{1}{3}\\leq m\\leq\\frac{1}{3}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS121PointLineSideSet(count) {
    const templates = [
      {
        q: '已知 \\(A(-2,1),B(1,2)\\) 位於直線 \\(L:mx-y+3=0\\) 的異側，求 \\(m\\) 的範圍。',
        a: '簡答：\\(m<-1\\) 或 \\(m>1\\)。過程：令 \\(f(x,y)=mx-y+3\\)。則 \\(f(A)=-2m-1+3=2-2m\\)，\\(f(B)=m-2+3=m+1\\)。異側表示 \\(f(A)f(B)<0\\)，所以 \\((2-2m)(m+1)<0\\)，化簡得 \\((1-m)(m+1)<0\\)，故 \\(m<-1\\) 或 \\(m>1\\)。',
      },
      {
        q: '設 \\(P(0,3)\\) 與原點 \\(O(0,0)\\) 位於直線 \\(L:2x+3y-12=0\\) 的哪一側？判斷同側或異側。',
        a: '簡答：同側，且都在 \\(2x+3y-12<0\\) 的一側。過程：代入 \\(P(0,3)\\) 得 \\(2\\cdot0+3\\cdot3-12=-3<0\\)；代入 \\(O(0,0)\\) 得 \\(-12<0\\)。兩個值同號，所以兩點在同側。',
      },
      {
        q: '若點 \\(A(k,2)\\) 與 \\(B(-4,4)\\) 在直線 \\(L:4x-3y+12=0\\) 的同側，求實數 \\(k\\) 的範圍。',
        a: '簡答：\\(k<-\\frac{3}{2}\\)。過程：令 \\(f(x,y)=4x-3y+12\\)。\\(f(A)=4k-6+12=4k+6\\)，\\(f(B)=-16-12+12=-16\\)。同側表示 \\(f(A)f(B)>0\\)，即 \\((4k+6)(-16)>0\\)，所以 \\(4k+6<0\\)，得 \\(k<-\\frac{3}{2}\\)。',
      },
      {
        q: '已知直線 \\(L:3x+y-7=0\\) 將平面分成兩半，判斷 \\((1,1),(2,1),(3,0),(-1,9)\\) 中哪些點與原點在同一個半平面。',
        a: '簡答：\\((1,1)\\)、\\((-1,9)\\)。過程：原點代入得 \\(-7<0\\)。各點代入 \\(3x+y-7\\)：\\((1,1)\\) 得 \\(-3<0\\)，\\((2,1)\\) 得 0，在直線上，\\((3,0)\\) 得 \\(2>0\\)，\\((-1,9)\\) 得 \\(-1<0\\)。所以與原點同半平面的是 \\((1,1)\\)、\\((-1,9)\\)。',
      },
      {
        q: '設 \\(A(2,1),B(3,5)\\) 在直線 \\(L:x-2y+k=0\\) 的兩側，求 \\(k\\) 的範圍。',
        a: '簡答：\\(0<k<7\\)。過程：令 \\(f(x,y)=x-2y+k\\)。\\(f(A)=2-2+k=k\\)，\\(f(B)=3-10+k=k-7\\)。兩側表示 \\(f(A)f(B)<0\\)，所以 \\(k(k-7)<0\\)，解得 \\(0<k<7\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS121LatticePointCountingSet(count) {
    const templates = [
      {
        q: '求滿足聯立不等式 \\(0<x<5,\\ 0<y<6,\\ x+y\\leq7\\) 的區域內共有幾個格子點。',
        a: '簡答：17 個。過程：因為 \\(x,y\\) 都是整數，\\(x=1,2,3,4\\)，且 \\(y=1,2,3,4,5\\)。逐一看 \\(x+y\\leq7\\)：\\(x=1\\) 時有 5 個，\\(x=2\\) 時有 5 個，\\(x=3\\) 時有 4 個，\\(x=4\\) 時有 3 個，共 \\(5+5+4+3=17\\) 個。',
      },
      {
        q: '在 \\(x\\geq0,\\ y\\geq0,\\ 2x+y\\leq6\\) 圍成的區域中，共有幾個格子點。',
        a: '簡答：16 個。過程：\\(x\\) 可為 0,1,2,3。當 \\(x=0\\)，\\(y=0\\sim6\\) 有 7 個；\\(x=1\\)，\\(y=0\\sim4\\) 有 5 個；\\(x=2\\)，\\(y=0\\sim2\\) 有 3 個；\\(x=3\\)，\\(y=0\\) 有 1 個。合計 \\(7+5+3+1=16\\) 個。',
      },
      {
        q: '滿足 \\(x+3y\\geq-6,\\ x-y\\leq1,\\ y\\leq-1\\) 的解區域中，求其格子點個數。',
        a: '簡答：4 個。過程：由 \\(x+3y\\geq-6\\) 得 \\(x\\geq-6-3y\\)，由 \\(x-y\\leq1\\) 得 \\(x\\leq y+1\\)。要有整數 \\(x\\)，需 \\(-6-3y\\leq y+1\\)，即 \\(y\\geq-\\frac{7}{4}\\)。又 \\(y\\leq-1\\)，所以整數 \\(y\\) 只能是 \\(-1\\)。此時 \\(-3\\leq x\\leq0\\)，共有 4 個格子點。',
      },
      {
        q: '求不等式組 \\(x+y\\leq4,\\ 2x+y\\leq6,\\ x\\geq0,\\ y\\geq0\\) 圍成區域的格子點總數。',
        a: '簡答：13 個。過程：枚舉非負整數 \\(x\\)。\\(x=0\\) 時 \\(y=0\\sim4\\) 有 5 個；\\(x=1\\) 時 \\(y=0\\sim3\\) 有 4 個；\\(x=2\\) 時 \\(y=0\\sim2\\) 有 3 個；\\(x=3\\) 時 \\(y=0\\) 有 1 個。合計 \\(5+4+3+1=13\\) 個。',
      },
      {
        q: '在 \\(x+2y\\leq8,\\ x\\geq2,\\ y\\geq1\\) 的區域內共有幾個格子點。',
        a: '簡答：9 個。過程：由 \\(x+2y\\leq8\\) 且 \\(x\\geq2\\)，可知 \\(y\\leq3\\)，所以 \\(y=1,2,3\\)。當 \\(y=1\\)，\\(2\\leq x\\leq6\\) 有 5 個；\\(y=2\\)，\\(2\\leq x\\leq4\\) 有 3 個；\\(y=3\\)，\\(x=2\\) 有 1 個。合計 9 個。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS121AbsoluteInequalityAreaSet(count) {
    const templates = [
      {
        q: '在坐標平面上畫出 \\(|x|+|y|\\leq4\\) 的圖形並求其面積。',
        a: '簡答：32。過程：\\(|x|+|y|\\leq4\\) 是以原點為中心的菱形，四個頂點為 \\((4,0),(0,4),(-4,0),(0,-4)\\)。兩條對角線長都是 8，所以面積為 \\(\\frac{8\\cdot8}{2}=32\\)。',
      },
      {
        q: '求不等式組 \\(|4x+y|\\leq2\\) 與 \\(|x-y|\\leq2\\) 所圍成圖形的面積。',
        a: '簡答：\\(\\frac{16}{5}\\)。過程：令 \\(u=4x+y\\)、\\(v=x-y\\)，則區域變成 \\(-2\\leq u\\leq2,\\ -2\\leq v\\leq2\\)，在 \\(uv\\) 平面面積為 16。變換的行列式絕對值為 \\(|4(-1)-1\\cdot1|=5\\)，所以原 \\(xy\\) 平面面積為 \\(\\frac{16}{5}\\)。',
      },
      {
        q: '求 \\(|x|\\geq|y|\\) 與 \\(|x-1|\\leq2\\) 所圍成的區域面積。',
        a: '簡答：10。過程：\\(|x-1|\\leq2\\) 表示 \\(-1\\leq x\\leq3\\)，而 \\(|x|\\geq|y|\\) 表示 \\(-|x|\\leq y\\leq |x|\\)。面積為 \\(\\int_{-1}^{3}2|x|\\,dx=\\int_{-1}^{0}(-2x)\\,dx+\\int_{0}^{3}2x\\,dx=1+9=10\\)。',
      },
      {
        q: '畫出 \\(|x|+4|y|>4\\) 且 \\(|x|+|y|<4\\) 的圖形區域並求面積。',
        a: '簡答：24。過程：外層 \\(|x|+|y|<4\\) 是對角線長皆為 8 的菱形，面積 32。被挖掉的 \\(|x|+4|y|\\leq4\\) 是頂點 \\((\\pm4,0),(0,\\pm1)\\) 的菱形，面積 \\(\\frac{8\\cdot2}{2}=8\\)。嚴格不等號不影響面積，所以所求面積為 \\(32-8=24\\)。',
      },
      {
        q: '求 \\(|2x|+|3y|\\leq6\\) 所圍成幾何圖形的面積。',
        a: '簡答：12。過程：不等式可化為 \\(\\frac{|x|}{3}+\\frac{|y|}{2}\\leq1\\)，圖形是頂點 \\((\\pm3,0),(0,\\pm2)\\) 的菱形。兩條對角線長為 6 與 4，面積為 \\(\\frac{6\\cdot4}{2}=12\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function formatS122Point(point) {
    return `(${point.x},${point.y})`;
  }

  function formatS122SignedNumber(value) {
    return value < 0 ? `-${Math.abs(value)}` : `+${value}`;
  }

  function formatS122CoeffVar(coef, variable) {
    if (coef === 0) return '';
    const abs = Math.abs(coef);
    const body = abs === 1 ? variable : `${abs}${variable}`;
    return coef > 0 ? `+${body}` : `-${body}`;
  }

  function formatS122CircleGeneral(a, d, e, f) {
    const lead = a === 1 ? 'x^2+y^2' : `${a}x^2+${a}y^2`;
    const xTerm = formatS122CoeffVar(d, 'x');
    const yTerm = formatS122CoeffVar(e, 'y');
    const cTerm = f === 0 ? '' : formatS122SignedNumber(f);
    return `${lead}${xTerm}${yTerm}${cTerm}=0`;
  }

  function formatS122CircleStandard(h, k, r2) {
    const xPart = h === 0 ? 'x^2' : `(x${formatS122SignedNumber(-h)})^2`;
    const yPart = k === 0 ? 'y^2' : `(y${formatS122SignedNumber(-k)})^2`;
    return `${xPart}+${yPart}=${r2}`;
  }

  function formatS122CircleAnswer(h, k, r2) {
    return `圓心 \\(${formatS122Point({ x: h, y: k })}\\)，半徑 \\(${formatRadical(r2)}\\)`;
  }

  function formatS122CircleEquationFromCoeffs(a, d, e, f) {
    return formatS122CircleGeneral(a, d, e, f);
  }

  function formatS123LineEquation(a, b, c) {
    const parts = [];
    const pushTerm = (coef, variable) => {
      if (coef === 0) return;
      const abs = Math.abs(coef);
      const body = abs === 1 ? variable : `${abs}${variable}`;
      if (parts.length === 0) {
        parts.push(coef < 0 ? `-${body}` : body);
      } else {
        parts.push(coef < 0 ? `-${body}` : `+${body}`);
      }
    };
    pushTerm(a, 'x');
    pushTerm(b, 'y');
    if (c !== 0) {
      if (parts.length === 0) {
        parts.push(`${c}`);
      } else {
        parts.push(c < 0 ? `-${Math.abs(c)}` : `+${c}`);
      }
    }
    return `${parts.join('')}=0`;
  }

  function buildS122GeneralToStandardSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const a = mode === 1 || mode === 2 || mode === 4 ? [2, 3, 5][randInt(0, 2)] : 1;
      const h = pickNonZero(-5, 5);
      const k = pickNonZero(-4, 4);
      const r = randInt(2, 8);
      const d = -2 * a * h;
      const e = -2 * a * k;
      const f = a * (h * h + k * k - r * r);
      const equation = formatS122CircleGeneral(a, d, e, f);
      const standard = formatS122CircleStandard(h, k, r * r);
      questions.push(`求方程式 \\(${equation}\\) 的圓心坐標與半徑。`);
      const divideText = a === 1 ? '二次項係數已為 1，直接配方' : `先將方程式同除以 \\(${a}\\)，再配方`;
      answers.push(
        `簡答：${formatS122CircleAnswer(h, k, r * r)}。過程：${divideText}得 \\(${standard}\\)。所以圓心為 \\(${formatS122Point({ x: h, y: k })}\\)，半徑為 \\(${r}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildS122CircleDiscriminantParameterSet(count) {
    const templates = [
      {
        q: '討論方程式 \\(x^2+y^2+2x+4y+3-2k=0\\) 隨 \\(k\\) 值變化的圖形意義。',
        a: '簡答：\\(k>-1\\) 為圓，\\(k=-1\\) 為一點，\\(k<-1\\) 不存在實圖形。過程：判別量 \\(\\Delta=d^2+e^2-4f=2^2+4^2-4(3-2k)=8k+8\\)。\\(\\Delta>0\\) 為圓，\\(\\Delta=0\\) 為點，\\(\\Delta<0\\) 不存在，所以得到上述範圍。',
      },
      {
        q: '若 \\(x^2+y^2+4x-2ky+(k+6)=0\\) 代表一個點，求 \\(k\\) 之值。',
        a: '簡答：\\(k=-1\\) 或 \\(k=2\\)。過程：代表一點表示 \\(\\Delta=0\\)。此處 \\(d=4,e=-2k,f=k+6\\)，所以 \\(\\Delta=4^2+(-2k)^2-4(k+6)=4k^2-4k-8=4(k-2)(k+1)\\)。令其為 0，得 \\(k=-1\\) 或 \\(k=2\\)。',
      },
      {
        q: '若 \\(x^2+y^2+2(m+1)x-2my+3m^2-2=0\\) 的圖形為一圓，求 \\(m\\) 的範圍。',
        a: '簡答：\\(-1<m<3\\)。過程：要成為一圓需 \\(r^2>0\\)，等價於 \\(\\Delta>0\\)。\\(\\Delta=[2(m+1)]^2+(-2m)^2-4(3m^2-2)=-4(m-3)(m+1)\\)。令 \\(-4(m-3)(m+1)>0\\)，得 \\(-1<m<3\\)。',
      },
      {
        q: '若 \\(x^2+y^2+2(m+1)x-2my+3m^2-2=0\\) 的圖形為一圓，當 \\(m\\) 為何值時，此圓有最大面積？',
        a: '簡答：\\(m=1\\)，最大面積為 \\(4\\pi\\)。過程：此圓的半徑平方為 \\(r^2=\\frac{[2(m+1)]^2+(-2m)^2-4(3m^2-2)}{4}=-m^2+2m+3=4-(m-1)^2\\)。面積 \\(\\pi r^2\\) 最大時，\\((m-1)^2\\) 最小，所以 \\(m=1\\)，此時 \\(r^2=4\\)，最大面積為 \\(4\\pi\\)。',
      },
      {
        q: '已知 \\(x^2+y^2+kx+2ky-5k-25=0\\) 恆通過兩定點，求這兩定點。',
        a: '簡答：\\((5,0)\\)、\\((-3,4)\\)。過程：將方程式整理為 \\(x^2+y^2-25+k(x+2y-5)=0\\)。若一點對所有 \\(k\\) 都成立，需同時滿足 \\(x^2+y^2-25=0\\) 與 \\(x+2y-5=0\\)。代入 \\(x=5-2y\\)，得 \\(y=0\\) 或 \\(y=4\\)，所以兩定點為 \\((5,0)\\)、\\((-3,4)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS122CircleFromConditionsSet(count) {
    const templates = [
      {
        q: '求以點 \\(A(-1,3)\\)、\\(B(-5,1)\\) 為直徑兩端點的圓方程式。',
        a: '簡答：\\((x+3)^2+(y-2)^2=5\\)。過程：直徑端點中點為圓心，\\(C=(-3,2)\\)。半徑平方為 \\(CA^2=(2)^2+(1)^2=5\\)，所以圓方程式為 \\((x+3)^2+(y-2)^2=5\\)。',
      },
      {
        q: '求圓心在直線 \\(x+3y-4=0\\) 上，且與 \\(x\\) 軸及 \\(y\\) 軸都相切的圓方程式。',
        a: '簡答：\\((x-1)^2+(y-1)^2=1\\) 或 \\((x+2)^2+(y-2)^2=4\\)。過程：同時與兩坐標軸相切，圓心 \\((h,k)\\) 需滿足 \\(|h|=|k|=r\\)。若 \\(k=h\\)，代入直線得 \\(4h=4\\)，所以 \\((h,k)=(1,1)\\)；若 \\(k=-h\\)，得 \\(-2h=4\\)，所以 \\((h,k)=(-2,2)\\)。半徑分別為 1、2。',
      },
      {
        q: '求通過三點 \\(P(5,2)\\)、\\(Q(3,-2)\\)、\\(R(-1,2)\\) 的圓方程式。',
        a: '簡答：\\((x-2)^2+(y-1)^2=10\\)。過程：觀察三點到 \\((2,1)\\) 的距離平方皆為 10：\\((5-2)^2+(2-1)^2=10\\)、\\((3-2)^2+(-2-1)^2=10\\)、\\((-1-2)^2+(2-1)^2=10\\)。所以圓心為 \\((2,1)\\)，半徑平方為 10。',
      },
      {
        q: '圓心在 \\(y\\) 軸上，且通過兩點 \\((2,10)\\)、\\((6,2)\\)，求其方程式。',
        a: '簡答：\\(x^2+(y-3)^2=53\\)。過程：設圓心為 \\((0,c)\\)。兩點到圓心距離相等，所以 \\(2^2+(10-c)^2=6^2+(2-c)^2\\)。解得 \\(c=3\\)，半徑平方為 \\(2^2+(10-3)^2=53\\)。',
      },
      {
        q: '求與圓 \\((x-3)^2+y^2=16\\) 同圓心，且圓周長為其一半的圓。',
        a: '簡答：\\((x-3)^2+y^2=4\\)。過程：原圓圓心為 \\((3,0)\\)，半徑為 4。圓周長和半徑成正比，周長變成一半表示半徑變成 2，所以新圓方程式為 \\((x-3)^2+y^2=2^2\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS122ApolloniusCircleSet(count) {
    function equationForRatio(a, b, m, n) {
      let aa = n * n - m * m;
      let d = -2 * n * n * a.x + 2 * m * m * b.x;
      let e = -2 * n * n * a.y + 2 * m * m * b.y;
      let f = n * n * (a.x * a.x + a.y * a.y) - m * m * (b.x * b.x + b.y * b.y);
      if (aa < 0) {
        aa *= -1;
        d *= -1;
        e *= -1;
        f *= -1;
      }
      const g = gcdInt(gcdInt(aa, d), gcdInt(e, f));
      return { a: aa / g, d: d / g, e: e / g, f: f / g };
    }
    const templates = [
      { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, m: 2, n: 1, wording: '已知 \\(A(0,0)\\)、\\(B(3,0)\\)，若點 \\(P\\) 滿足 \\(PA=2PB\\)，求 \\(P\\) 的軌跡方程式。' },
      { a: { x: 2, y: 1 }, b: { x: 8, y: 4 }, m: 2, n: 1, wording: '已知 \\(A(2,1)\\)、\\(B(8,4)\\)，若點 \\(P\\) 滿足 \\(PA:PB=2:1\\)，求 \\(P\\) 的軌跡方程式。' },
      { a: { x: 0, y: 0 }, b: { x: 30, y: 0 }, m: 2, n: 1, wording: '獵狗問題：設大獵犬在 \\(A(0,0)\\)、小獵犬在 \\(B(30,0)\\)，且大獵犬速度為小獵犬 2 倍，求兩犬同時抵達獵物的區域圖形。' },
      { a: { x: 3, y: 5 }, b: { x: -10, y: 4 }, m: 2, n: 3, wording: '設 \\(A(3,5)\\)、\\(B(-10,4)\\)，滿足 \\(PA:PB=2:3\\)，求軌跡方程式。' },
      { a: { x: 1, y: 5 }, b: { x: 9, y: 0 }, m: 2, n: 1, wording: '已知 \\(A(1,5)\\)、\\(B(9,0)\\)，求滿足 \\(PA=2PB\\) 的圖形面積。' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      const eq = equationForRatio(item.a, item.b, item.m, item.n);
      const centerX = formatFraction(-eq.d, 2 * eq.a);
      const centerY = formatFraction(-eq.e, 2 * eq.a);
      const delta = eq.d * eq.d + eq.e * eq.e - 4 * eq.a * eq.f;
      const r2 = formatFraction(delta, 4 * eq.a * eq.a);
      questions.push(item.wording);
      if (i % 5 === 4) {
        answers.push(
          `簡答：面積 \\(\\frac{356\\pi}{9}\\)。過程：由 \\(PA=2PB\\)，得 \\((x-1)^2+(y-5)^2=4[(x-9)^2+y^2]\\)，整理為 \\(${formatS122CircleEquationFromCoeffs(eq.a, eq.d, eq.e, eq.f)}\\)。配方後半徑平方為 \\(${r2}\\)，所以面積為 \\(\\pi\\cdot\\frac{356}{9}=\\frac{356\\pi}{9}\\)。`
        );
      } else {
        answers.push(
          `簡答：\\(${formatS122CircleEquationFromCoeffs(eq.a, eq.d, eq.e, eq.f)}\\)。過程：由 \\(PA:PB=${item.m}:${item.n}\\)，可列 \\(${item.n}^2PA^2=${item.m}^2PB^2\\)。代入 \\(A${formatS122Point(item.a)}\\)、\\(B${formatS122Point(item.b)}\\) 後整理，即得 \\(${formatS122CircleEquationFromCoeffs(eq.a, eq.d, eq.e, eq.f)}\\)。其圓心為 \\((${centerX},${centerY})\\)，半徑平方為 \\(${r2}\\)。`
        );
      }
    }
    return { questions, answers };
  }

  function buildS122RadicalAxisSet(count) {
    const templates = [
      {
        q: '求二圓 \\(C_1:x^2+y^2+3x+4y+1=0\\) 與 \\(C_2:x^2+y^2+x-3y=0\\) 的公共弦方程式。',
        a: '簡答：\\(2x+7y+1=0\\)。過程：兩圓交點同時滿足兩方程，將 \\(C_1-C_2\\)，二次項消去，得 \\((3x-x)+(4y+3y)+1=0\\)，所以公共弦方程式為 \\(2x+7y+1=0\\)。',
      },
      {
        q: '求過圓 \\(x^2+y^2-2x+4y+1=0\\) 與直線 \\(x+2y+2=0\\) 之交點，且過點 \\((2,3)\\) 的圓。',
        a: '簡答：\\(5x^2+5y^2-21x-2y-17=0\\)。過程：設所求圓為 \\(x^2+y^2-2x+4y+1+\\lambda(x+2y+2)=0\\)。代入 \\((2,3)\\) 得 \\(22+10\\lambda=0\\)，所以 \\(\\lambda=-\\frac{11}{5}\\)。同乘以 5 整理得 \\(5x^2+5y^2-21x-2y-17=0\\)。',
      },
      {
        q: '以兩圓 \\(C_1:x^2+y^2-25=0\\) 與 \\(C_2:x^2+y^2-6x-7=0\\) 之公共弦為直徑，求圓方程式。',
        a: '簡答：\\((x-3)^2+y^2=16\\)。過程：兩圓相減得公共弦 \\(x=3\\)。代入 \\(x^2+y^2=25\\)，得 \\(y=\\pm4\\)，所以公共弦端點為 \\((3,4),(3,-4)\\)。以此為直徑的圓心為 \\((3,0)\\)，半徑為 4，故方程式為 \\((x-3)^2+y^2=16\\)。',
      },
      {
        q: '求過圓 \\(x^2+y^2-2x-4y+1=0\\) 與直線 \\(2x-y+4=0\\) 之交點，且切於 \\(y\\) 軸的圓。',
        a: '簡答：\\(x^2+y^2+2x-6y+9=0\\) 或 \\(x^2+y^2+10x-10y+25=0\\)。過程：設圓族為 \\(x^2+y^2-2x-4y+1+\\lambda(2x-y+4)=0\\)。其 \\(x\\) 係數為 \\(-2+2\\lambda\\)，\\(y\\) 係數為 \\(-4-\\lambda\\)，常數為 \\(1+4\\lambda\\)。切於 \\(y\\) 軸表示圓心到 \\(y\\) 軸距離等於半徑，化成 \\((-4-\\lambda)^2=4(1+4\\lambda)\\)，得 \\(\\lambda=2\\) 或 6，代回即得兩圓。',
      },
      {
        q: '若圓系 \\(x^2+y^2+kx+2ky-5k-25=0\\) 恆過哪兩定點？',
        a: '簡答：\\((5,0)\\)、\\((-3,4)\\)。過程：整理為 \\(x^2+y^2-25+k(x+2y-5)=0\\)。恆過定點需同時滿足 \\(x^2+y^2-25=0\\) 與 \\(x+2y-5=0\\)。解得 \\((5,0)\\)、\\((-3,4)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS122PointCircleDistanceExtremaSet(count) {
    const templates = [
      {
        q: '求點 \\(P(6,3)\\) 到圓 \\(x^2+y^2-4x+2y+3=0\\) 的最短距離與最長距離。',
        a: '簡答：最短距離 \\(3\\sqrt2\\)，最長距離 \\(5\\sqrt2\\)。過程：圓配方為 \\((x-2)^2+(y+1)^2=2\\)，圓心 \\(C(2,-1)\\)，半徑 \\(r=\\sqrt2\\)。\\(PC=\\sqrt{(6-2)^2+(3+1)^2}=4\\sqrt2\\)。因為點在圓外，最短距離為 \\(PC-r=3\\sqrt2\\)，最長距離為 \\(PC+r=5\\sqrt2\\)。',
      },
      {
        q: '若 \\(A(1,5)\\) 為圓 \\((x+3)^2+(y-2)^2=36\\) 內部一點，求 \\(A\\) 到圓周的最短距離。',
        a: '簡答：1。過程：圓心為 \\((-3,2)\\)，半徑為 6。\\(A\\) 到圓心距離為 \\(\\sqrt{(1+3)^2+(5-2)^2}=5\\)。點在圓內時，到圓周的最短距離為 \\(r-AC=6-5=1\\)。',
      },
      {
        q: '設 \\(P(a,b)\\) 為圓 \\(x^2+y^2-4x-2y+4=0\\) 上的動點，求 \\(a^2+(b-1)^2\\) 的最大值。',
        a: '簡答：9。過程：\\(a^2+(b-1)^2\\) 表示點 \\(P(a,b)\\) 到 \\((0,1)\\) 的距離平方。圓配方為 \\((x-2)^2+(y-1)^2=1\\)，圓心 \\((2,1)\\)，半徑 1。\\((0,1)\\) 到圓心距離為 2，所以到圓上點的最大距離為 \\(2+1=3\\)，平方最大值為 9。',
      },
      {
        q: '已知圓 \\(C:x^2+y^2-10x+9=0\\)，求圓上點到直線 \\(3x+4y-15=0\\) 的最短距離。',
        a: '簡答：0。過程：圓配方為 \\((x-5)^2+y^2=16\\)，圓心 \\((5,0)\\)，半徑 4。圓心到直線的距離為 \\(\\frac{|3\\cdot5+4\\cdot0-15|}{5}=0\\)，表示直線通過圓心，因此直線與圓相交，圓上有點在此直線上，最短距離為 0。',
      },
      {
        q: '求原點到圓 \\((x-7)^2+(y-8)^2=9\\) 的整數距離共有幾個。',
        a: '簡答：6 個。過程：圓心 \\((7,8)\\) 到原點距離為 \\(\\sqrt{113}\\)，半徑為 3。因此原點到圓上點的距離範圍是 \\([\\sqrt{113}-3,\\sqrt{113}+3]\\)。因為 \\(10<\\sqrt{113}<11\\)，此範圍約為 7 到 14 之間，實際整數距離為 8、9、10、11、12、13，共 6 個。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS122AxisTangentCircleSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const r = randInt(2, 7);
        const point = { x: r, y: 2 * r };
        const h = r;
        const k = r;
        questions.push(`求通過點 \\(${formatS122Point(point)}\\)，且與 \\(x\\) 軸、\\(y\\) 軸均相切，圓心在第一象限的圓方程式。`);
        answers.push(`簡答：\\((x-${h})^2+(y-${k})^2=${r * r}\\)。過程：與兩坐標軸都相切且圓心在第一象限，圓心可設為 \\((r,r)\\)，半徑為 \\(r\\)。代入點 \\(${formatS122Point(point)}\\)，得 \\((${point.x}-r)^2+(${point.y}-r)^2=r^2\\)，解得 \\(r=${r}\\)。`);
        continue;
      }

      if (type === 1) {
        const r = randInt(2, 6);
        questions.push(`求通過點 \\((${2 * r},${r})\\)，且與兩坐標軸均相切的所有圓方程式。`);
        answers.push(`簡答：\\((x-${r})^2+(y-${r})^2=${r * r}\\)。過程：若圓心為 \\((h,k)\\)，與兩軸相切表示 \\(|h|=|k|=r\\)。檢查四種符號組合，只有 \\((h,k)=(${r},${r})\\) 會使點 \\((${2 * r},${r})\\) 到圓心距離為 ${r}，故圓方程式如上。`);
        continue;
      }

      if (type === 2) {
        const r = randInt(2, 6);
        const c = 2 * r;
        questions.push(`求圓心在直線 \\(x+y=${c}\\) 上，且與兩坐標軸都相切的所有圓方程式。`);
        answers.push(`簡答：\\((x-${r})^2+(y-${r})^2=${r * r}\\)。過程：與兩坐標軸相切時圓心為 \\((\\pm r,\\pm r)\\)。代入 \\(x+y=${c}\\)，只有 \\((r,r)=(${r},${r})\\) 符合，所以半徑為 ${r}。`);
        continue;
      }

      if (type === 3) {
        const r = randInt(2, 5);
        questions.push(`已知一圓與兩坐標軸相切，且半徑為 ${r}，求所有可能的圓心坐標。`);
        answers.push(`簡答：\\((\\pm${r},\\pm${r})\\)。過程：與 \\(x\\) 軸相切表示圓心到 \\(x\\) 軸距離為半徑，所以 \\(|k|=${r}\\)；與 \\(y\\) 軸相切表示 \\(|h|=${r}\\)。因此圓心為 \\((\\pm${r},\\pm${r})\\)。`);
        continue;
      }

      const r = randInt(2, 6);
      const point = { x: -r, y: 2 * r };
      questions.push(`求通過點 \\(${formatS122Point(point)}\\)，且與 \\(x\\) 軸、\\(y\\) 軸均相切，圓心在第二象限的圓方程式。`);
      answers.push(`簡答：\\((x+${r})^2+(y-${r})^2=${r * r}\\)。過程：圓心在第二象限且與兩軸相切，可設圓心為 \\((-r,r)\\)，半徑為 \\(r\\)。代入點 \\(${formatS122Point(point)}\\)，得 \\((-${r}+r)^2+(${2 * r}-r)^2=r^2\\)，所以半徑為 ${r}。`);
    }

    return { questions, answers };
  }

  function buildS122ParametricStandardSet(count) {
    const questions = [];
    const answers = [];
    const paramCoord = (center, radius, trig) => {
      if (center === 0) return `${radius}\\${trig}`;
      return `${center}${radius >= 0 ? '+' : ''}${radius}\\${trig}`;
    };

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const h = randInt(-4, 4);
        const k = randInt(-3, 3);
        const r = randInt(2, 6);
        questions.push(`將圓 \\(${formatS122CircleStandard(h, k, r * r)}\\) 化為參數式。`);
        answers.push(`簡答：\\(x=${paramCoord(h, r, 'cos')}\\theta,\\ y=${paramCoord(k, r, 'sin')}\\theta\\)。過程：標準式 \\((x-h)^2+(y-k)^2=r^2\\) 的參數式為 \\(x=h+r\\cos\\theta,\\ y=k+r\\sin\\theta\\)。本題圓心為 \\(${formatS122Point({ x: h, y: k })}\\)，半徑為 ${r}。`);
        continue;
      }

      if (type === 1) {
        const h = randInt(-4, 4);
        const k = randInt(-4, 4);
        const r = randInt(2, 6);
        questions.push(`已知圓的參數式為 \\(x=${paramCoord(h, r, 'cos')}\\theta,\\ y=${paramCoord(k, r, 'sin')}\\theta\\)，求其標準式。`);
        answers.push(`簡答：\\(${formatS122CircleStandard(h, k, r * r)}\\)。過程：由參數式可知圓心為 \\(${formatS122Point({ x: h, y: k })}\\)，半徑為 ${r}，所以標準式為 \\(${formatS122CircleStandard(h, k, r * r)}\\)。`);
        continue;
      }

      if (type === 2) {
        const r = randInt(2, 8);
        const den = [3, 4, 6][randInt(0, 2)];
        const arc = simplifyFraction(2 * r, den);
        const arcText = arc.den === 1 ? `${arc.num}\\pi` : `\\frac{${arc.num}\\pi}{${arc.den}}`;
        questions.push(`圓的參數式為 \\(x=h+${r}\\cos\\theta,\\ y=k+${r}\\sin\\theta\\)。求 \\(0\\leq\\theta\\leq\\frac{2\\pi}{${den}}\\) 所表示的弧長。`);
        answers.push(`簡答：\\(${arcText}\\)。過程：弧長 \\(s=r\\theta\\)。本題半徑為 ${r}，角度範圍長為 \\(\\frac{2\\pi}{${den}}\\)，所以 \\(s=${r}\\cdot\\frac{2\\pi}{${den}}=${arcText}\\)。`);
        continue;
      }

      if (type === 3) {
        const yText = randInt(0, 1) === 0 ? '\\frac{\\sqrt3}{2}' : '-\\frac{\\sqrt3}{2}';
        questions.push(`在單位圓 \\(x=\\cos\\theta,\\ y=\\sin\\theta\\) 上一點，其 \\(y\\) 坐標為 \\(${yText}\\)，求所有可能的點坐標。`);
        answers.push(`簡答：\\((\\frac12,${yText})\\)、\\((-\\frac12,${yText})\\)。過程：單位圓上有 \\(x^2+y^2=1\\)。代入 \\(y^2=\\frac34\\)，得 \\(x^2=\\frac14\\)，所以 \\(x=\\pm\\frac12\\)。`);
        continue;
      }

      const r = randInt(2, 5);
      const px = 3 * r;
      const nearestX = r;
      questions.push(`利用參數式求圓 \\(x^2+y^2=${r * r}\\) 上距離點 \\((${px},0)\\) 最近的點。`);
      answers.push(`簡答：\\((${nearestX},0)\\)。過程：圓可設 \\(x=${r}\\cos\\theta,\\ y=${r}\\sin\\theta\\)。到 \\((${px},0)\\) 的距離平方為 \\((${r}\\cos\\theta-${px})^2+(${r}\\sin\\theta)^2=${r * r + px * px}-${2 * r * px}\\cos\\theta\\)。要最小，需 \\(\\cos\\theta=1\\)，故最近點為 \\((${r},0)\\)。`);
    }

    return { questions, answers };
  }

  function buildS122CirclePointAlgebraExtremaSet(count) {
    const questions = [];
    const answers = [];
    const formatCoeffRadical = (coeff, inside) => {
      const simplified = simplifyRadical(inside);
      const outside = coeff * simplified.outside;
      if (simplified.inside === 1) return `${outside}`;
      return `${outside === 1 ? '' : outside}\\sqrt{${simplified.inside}}`;
    };

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const r = randInt(1, 4);
        const a = [2, 3, 4][randInt(0, 2)];
        const b = [-3, -1, 2][randInt(0, 2)];
        const norm = a * a + b * b;
        const bound = formatCoeffRadical(r, norm);
        questions.push(`已知 \\((x,y)\\) 滿足 \\(x^2+y^2\\leq ${r * r}\\)，求 \\(${a}x${b >= 0 ? '+' : ''}${b}y\\) 的最大值與最小值。`);
        answers.push(`簡答：最大值 \\(${bound}\\)，最小值 \\(-${bound}\\)。過程：線性式 \\(${a}x${b >= 0 ? '+' : ''}${b}y\\) 在圓盤上的極值為 \\(\\pm r\\sqrt{${a}^2+(${b})^2}\\)。代入 \\(r=${r}\\)，得 \\(\\pm ${bound}\\)。`);
        continue;
      }

      if (type === 1) {
        const h = randInt(1, 4);
        const k = randInt(-3, 3);
        const r = randInt(1, 4);
        const targetY = k + randInt(-2, 2);
        const centerDist = h * h + (k - targetY) * (k - targetY);
        const max = Math.pow(Math.floor(Math.sqrt(centerDist)) === Math.sqrt(centerDist) ? Math.sqrt(centerDist) + r : 0, 2);
        const yDiffText = targetY >= 0 ? `b-${targetY}` : `b+${Math.abs(targetY)}`;
        questions.push(`設 \\(P(a,b)\\) 為圓 \\(${formatS122CircleStandard(h, k, r * r)}\\) 上的動點，求 \\(a^2+(${yDiffText})^2\\) 的最大值。`);
        const dText = formatRadical(centerDist);
        const maxText = centerDist === 0 ? `${r * r}` : `(${dText}+${r})^2`;
        answers.push(`簡答：\\(${maxText}\\)。過程：\\(a^2+(${yDiffText})^2\\) 表示點 \\(P(a,b)\\) 到 \\((0,${targetY})\\) 的距離平方。圓心到該點距離為 \\(${dText}\\)，半徑為 ${r}，所以最大距離為 \\(${dText}+${r}\\)，平方最大值為 \\(${maxText}\\)。`);
        continue;
      }

      if (type === 2) {
        const r = randInt(1, 4);
        const a = 3;
        const b = 4;
        const max = 5 * r;
        questions.push(`設 \\(y=\\sqrt{${r * r}-x^2}\\)，求 \\(${a}x+${b}y\\) 的最大值。`);
        answers.push(`簡答：${max}。過程：\\(y=\\sqrt{${r * r}-x^2}\\) 表示上半圓 \\(x^2+y^2=${r * r},\\ y\\geq0\\)。線性式 \\(3x+4y\\) 的最大值為 \\(r\\sqrt{3^2+4^2}=5r\\)，代入 \\(r=${r}\\) 得 ${max}。`);
        continue;
      }

      if (type === 3) {
        const picks = [
          { h: 5, r: 3, denRoot: 4 },
          { h: 5, r: 4, denRoot: 3 },
          { h: 13, r: 5, denRoot: 12 },
          { h: 13, r: 12, denRoot: 5 },
        ];
        const pick = picks[randInt(0, picks.length - 1)];
        const h = pick.h;
        const r = pick.r;
        const den = h * h - r * r;
        const slope = simplifyFraction(r, pick.denRoot);
        const slopeText = formatFraction(slope.num, slope.den);
        questions.push(`若 \\((x,y)\\) 在圓 \\(x^2+y^2=${r * r}\\) 上，求 \\(\\frac{y}{x-${h}}\\) 的範圍。`);
        answers.push(`簡答：\\(-${slopeText}\\leq \\frac{y}{x-${h}}\\leq ${slopeText}\\)。過程：\\(\\frac{y}{x-${h}}\\) 是外點 \\((${h},0)\\) 與圓上點連線的斜率。極端情況發生在切線，設斜率為 \\(m\\)，切線 \\(y=m(x-${h})\\) 到原點距離等於半徑：\\(\\frac{|${h}m|}{\\sqrt{m^2+1}}=${r}\\)。解得 \\(m^2=\\frac{${r * r}}{${den}}\\)，所以 \\(|m|=${slopeText}\\)。`);
        continue;
      }

      const h = randInt(5, 9);
      const k = randInt(4, 8);
      const r = randInt(2, 4);
      const c2 = h * h + k * k;
      const lo = Math.ceil(Math.sqrt(c2) - r);
      const hi = Math.floor(Math.sqrt(c2) + r);
      const countInts = Math.max(0, hi - lo + 1);
      questions.push(`已知圓 \\((x-${h})^2+(y-${k})^2=${r * r}\\)，求圓上點到原點距離為整數值的可能個數。`);
      answers.push(`簡答：${countInts} 個。過程：圓心 \\(C(${h},${k})\\) 到原點距離為 \\(${formatRadical(c2)}\\)，半徑為 ${r}，所以距離範圍為 \\([${formatRadical(c2)}-${r},${formatRadical(c2)}+${r}]\\)。其中整數距離從 ${lo} 到 ${hi}，共有 ${countInts} 個。`);
    }

    return { questions, answers };
  }

  function buildS122TriangleCircumInCircleSet(count) {
    const templates = [
      {
        q: '求以 \\(A(5,2)\\)、\\(B(4,3)\\)、\\(C(-2,-5)\\) 為三頂點之三角形的外接圓方程式。',
        a: '簡答：\\((x-1)^2+(y+1)^2=25\\)。過程：設外接圓為 \\(x^2+y^2+Dx+Ey+F=0\\)。代入三點可解得 \\(D=-2,E=2,F=-23\\)，所以圓方程式為 \\(x^2+y^2-2x+2y-23=0\\)，配方得 \\((x-1)^2+(y+1)^2=25\\)。',
      },
      {
        q: '求三直線 \\(x-y-9=0\\)、\\(x+2y=0\\)、\\(3x-y-7=0\\) 圍成之三角形的外接圓圓心。',
        a: '簡答：\\((2,-6)\\)。過程：三條直線兩兩相交得頂點 \\((6,-3)\\)、\\((-1,-10)\\)、\\((2,-1)\\)。設外心為 \\((h,k)\\)，由到三頂點距離相等，解兩條中垂線可得 \\((h,k)=(2,-6)\\)。',
      },
      {
        q: '求三直線 \\(x=0\\)、\\(3x-4y-5=0\\)、\\(3x+4y+10=0\\) 圍成三角形之內切圓方程式。',
        a: '簡答：\\((x+\\frac{5}{16})^2+(y+\\frac{15}{8})^2=\\frac{25}{256}\\)。過程：三角形三頂點為 \\((0,-\\frac54)\\)、\\((0,-\\frac52)\\)、\\((-\\frac56,-\\frac{15}{8})\\)。由對稱邊長可得內心在 \\(y=-\\frac{15}{8}\\)，再令到直線 \\(x=0\\) 與到斜邊的距離相等，可得內心 \\((-\\frac{5}{16},-\\frac{15}{8})\\)，半徑為 \\(\\frac{5}{16}\\)。',
      },
      {
        q: '已知 \\(\\triangle ABC\\) 三頂點為 \\(A(1,1)\\)、\\(B(3,1)\\)、\\(C(s,t)\\)，若其外接圓心為 \\((2,-1)\\) 且半徑為 5，求一組可能的 \\(C\\) 點。',
        a: '簡答：例如 \\(C(-2,2)\\)。過程：外接圓心 \\((2,-1)\\)、半徑 5，故 \\(C\\) 必須在 \\((x-2)^2+(y+1)^2=25\\) 上，且不可與 \\(A,B\\) 共線。取 \\((-2,2)\\)，有 \\((-2-2)^2+(2+1)^2=16+9=25\\)，且不在直線 \\(y=1\\) 上，所以可作為 \\(C\\) 點。',
      },
      {
        q: '求以 \\((0,0)\\)、\\((3,0)\\)、\\((0,4)\\) 為頂點的三角形其內切圓圓心坐標。',
        a: '簡答：\\((1,1)\\)。過程：這是直角三角形，兩股長為 3、4，斜邊長為 5。直角三角形內切圓半徑 \\(r=\\frac{3+4-5}{2}=1\\)。內心距兩坐標軸皆為 1，且在第一象限，所以內心為 \\((1,1)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS123GivenSlopeTangentSet(count) {
    const templates = [
      {
        q: '求斜率為 \\(-2\\) 且與圓 \\(x^2+y^2=5\\) 相切的兩條直線方程式。',
        a: '簡答：\\(y=-2x+5\\) 或 \\(y=-2x-5\\)。過程：設切線為 \\(y=-2x+b\\)，即 \\(2x+y-b=0\\)。圓心 \\((0,0)\\) 到切線距離需等於半徑 \\(\\sqrt5\\)，所以 \\(\\frac{|b|}{\\sqrt5}=\\sqrt5\\)，得 \\(|b|=5\\)。',
      },
      {
        q: '求與直線 \\(x+2y=3\\) 平行且與圓 \\(x^2+y^2-6x+2y+5=0\\) 相切的切線。',
        a: '簡答：\\(x+2y+4=0\\) 或 \\(x+2y-6=0\\)。過程：圓配方為 \\((x-3)^2+(y+1)^2=5\\)，圓心 \\((3,-1)\\)，半徑 \\(\\sqrt5\\)。設平行切線為 \\(x+2y+c=0\\)，距離條件 \\(\\frac{|3+2(-1)+c|}{\\sqrt5}=\\sqrt5\\)，得 \\(|1+c|=5\\)，所以 \\(c=4\\) 或 \\(-6\\)。',
      },
      {
        q: '求與直線 \\(x-3y-4=0\\) 平行且與圓 \\(x^2+y^2+4x+6y+4=0\\) 相切的切線。',
        a: '簡答：\\(x-3y+4+\\sqrt{140}=0\\) 或 \\(x-3y+4-\\sqrt{140}=0\\)。過程：圓配方為 \\((x+2)^2+(y+3)^2=9\\)，圓心 \\((-2,-3)\\)，半徑 3。設切線為 \\(x-3y+c=0\\)，距離條件 \\(\\frac{|-2-3(-3)+c|}{\\sqrt{10}}=3\\)，即 \\(|7+c|=3\\sqrt{10}=\\sqrt{90}\\)。等價寫成 \\(c=-7\\pm3\\sqrt{10}\\)，也可整理為上式。',
      },
      {
        q: '已知圓 \\((x-4)^2+(y-1)^2=10\\)，求斜率為 3 的切線方程式。',
        a: '簡答：\\(y-1=3(x-4)\\pm\\sqrt{100}\\)，即 \\(y=3x-1\\) 或 \\(y=3x-21\\)。過程：斜率為 3 的直線可設 \\(y-1=3(x-4)+b\\)。圓心到此直線的距離為 \\(\\frac{|b|}{\\sqrt{1+3^2}}\\)，需等於半徑 \\(\\sqrt{10}\\)，所以 \\(|b|=10\\)。',
      },
      {
        q: '設直線 \\(y=mx+2\\) 與圓 \\(x^2+y^2=1\\) 相切，求實數 \\(m\\) 之值。',
        a: '簡答：\\(m=\\pm\\sqrt3\\)。過程：直線寫成 \\(mx-y+2=0\\)。圓心 \\((0,0)\\) 到直線距離等於半徑 1，故 \\(\\frac{|2|}{\\sqrt{m^2+1}}=1\\)。解得 \\(m^2=3\\)，所以 \\(m=\\pm\\sqrt3\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS123ExternalPointTangentSet(count) {
    const templates = [
      {
        q: '求過圓外點 \\(P(1,1)\\) 且與圓 \\(x^2+(y-3)^2=1\\) 相切的兩條直線方程式。',
        a: '簡答：\\(x=1\\) 或 \\(3x+4y-7=0\\)。過程：一條切線為鉛直線 \\(x=1\\)，它到圓心 \\((0,3)\\) 的距離為 1。另一條設為 \\(y-1=m(x-1)\\)，即 \\(mx-y+1-m=0\\)。距離條件 \\(\\frac{|m\\cdot0-3+1-m|}{\\sqrt{m^2+1}}=1\\)，解得 \\(m=-\\frac34\\)，所以 \\(3x+4y-7=0\\)。',
      },
      {
        q: '自點 \\(P(6,3)\\) 向圓 \\((x-2)^2+(y-3)^2=9\\) 作切線，求其切線長。',
        a: '簡答：\\(\\sqrt7\\)。過程：圓心 \\((2,3)\\)，半徑 3。\\(PC=4\\)，切線長 \\(PT=\\sqrt{PC^2-r^2}=\\sqrt{16-9}=\\sqrt7\\)。',
      },
      {
        q: '求過點 \\(A(4,5)\\) 且與圓 \\((x-3)^2+(y-2)^2=1\\) 相切的切線長。',
        a: '簡答：3。過程：圓心 \\((3,2)\\)，半徑 1。\\(AC=\\sqrt{(4-3)^2+(5-2)^2}=\\sqrt{10}\\)。切線長為 \\(\\sqrt{AC^2-r^2}=\\sqrt{10-1}=3\\)。',
      },
      {
        q: '自點 \\(P(12,3)\\) 向圓 \\(x^2+y^2-4x-6y-12=0\\) 作兩切線，求兩切線的夾角。',
        a: '簡答：\\(60^\\circ\\)。過程：圓配方為 \\((x-2)^2+(y-3)^2=25\\)，圓心 \\((2,3)\\)，半徑 5。\\(PC=10\\)。若兩切線夾角為 \\(\\theta\\)，則 \\(\\sin\\frac{\\theta}{2}=\\frac{r}{PC}=\\frac12\\)，所以 \\(\\frac{\\theta}{2}=30^\\circ\\)，\\(\\theta=60^\\circ\\)。',
      },
      {
        q: '已知點 \\(P(8,1)\\) 作圓 \\(x^2+y^2-2x+4y-7=0\\) 的兩切線，求兩切點連線（極線）的方程式。',
        a: '簡答：\\(7x+3y-13=0\\)。過程：圓為 \\(x^2+y^2+dx+ey+f=0\\)，其中 \\(d=-2,e=4,f=-7\\)。外點 \\((x_0,y_0)=(8,1)\\) 的極線公式為 \\(xx_0+yy_0+\\frac{d(x+x_0)}{2}+\\frac{e(y+y_0)}{2}+f=0\\)。代入得 \\(8x+y-(x+8)+2(y+1)-7=0\\)，整理為 \\(7x+3y-13=0\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS123ChordLengthSet(count) {
    const templates = [
      {
        q: '直線 \\(3x-4y=k\\) 與圓 \\(x^2+y^2+4x-6y-12=0\\) 相交之弦長為 6，求 \\(k\\)。',
        a: '簡答：\\(k=2\\) 或 \\(k=-38\\)。過程：圓配方為 \\((x+2)^2+(y-3)^2=25\\)，圓心 \\((-2,3)\\)，半徑 5。弦長 6 表示半弦長為 3，所以圓心到直線距離 \\(d=\\sqrt{5^2-3^2}=4\\)。直線為 \\(3x-4y-k=0\\)，距離 \\(\\frac{|-6-12-k|}{5}=4\\)，得 \\(|k+18|=20\\)，所以 \\(k=2\\) 或 \\(-38\\)。',
      },
      {
        q: '設直線 \\(x-my-m=0\\) 與圓 \\(x^2+y^2-x=0\\) 相交於兩點，若弦長等於直徑，求 \\(m\\)。',
        a: '簡答：\\(m=\\frac12\\)。過程：弦長等於直徑表示直線通過圓心。圓配方為 \\((x-\\frac12)^2+y^2=\\frac14\\)，圓心 \\((\\frac12,0)\\)。代入直線得 \\(\\frac12-m=0\\)，所以 \\(m=\\frac12\\)。',
      },
      {
        q: '求點 \\(A(1,-1)\\) 為中點之圓 \\(x^2+y^2-6x+4y+4=0\\) 的弦所在的直線方程式。',
        a: '簡答：\\(-2x+y+3=0\\)。過程：圓心為 \\((3,-2)\\)。若 \\(A\\) 是弦中點，則圓心到弦的連線垂直於弦，所以弦的法向量可取 \\(\\overrightarrow{CA}=(-2,1)\\)。過 \\(A(1,-1)\\) 得 \\(-2(x-1)+(y+1)=0\\)，整理為 \\(-2x+y+3=0\\)。',
      },
      {
        q: '一圓過 \\(P(4,1)\\)，且圓心在 \\(2x-y=1\\) 上，若在 \\(y\\) 軸之截弦長為 4，求其圓方程式。',
        a: '簡答：\\((x-2)^2+(y-3)^2=8\\)。過程：設圓心為 \\((h,k)\\)，由 \\(2h-k=1\\) 得 \\(k=2h-1\\)。\\(y\\) 軸截弦長為 4，故 \\(r^2-h^2=2^2=4\\)。又圓過 \\((4,1)\\)，所以 \\(r^2=(h-4)^2+(k-1)^2\\)。聯立得 \\(h=2,k=3,r^2=8\\)。',
      },
      {
        q: '圓 \\(x^2+y^2=9\\) 與過點 \\((1,2)\\) 之直線相交，求其弦長之最大值與最小值。',
        a: '簡答：最大值 6，最小值 4。過程：圓心為原點，半徑為 3。過圓內點 \\((1,2)\\) 的所有直線中，通過圓心時弦長最大，為直徑 6；當直線垂直於 \\((1,2)\\) 與圓心連線時，圓心到弦距離最大為 \\(\\sqrt5\\)，弦長最小為 \\(2\\sqrt{9-5}=4\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS123ChordMidpointLocusSet(count) {
    const templates = [
      {
        q: '設圓 \\(C:x^2+y^2-6x+4y+4=0\\)，求過點 \\(A(1,-1)\\) 之所有弦的中點軌跡方程式。',
        a: '簡答：\\((x-2)^2+(y+\\frac32)^2=\\frac54\\)。過程：圓心 \\(C(3,-2)\\)。若 \\(M\\) 是過定點 \\(A\\) 的弦中點，則 \\(CM\\perp AM\\)，所以 \\(M\\) 的軌跡是以 \\(CA\\) 為直徑的圓。\\(CA\\) 中點為 \\((2,-\\frac32)\\)，半徑平方為 \\(\\frac{CA^2}{4}=\\frac54\\)。',
      },
      {
        q: '已知圓 \\((x+1)^2+(y-2)^2=16\\)，求過內部定點 \\(A(-2,-1)\\) 之弦中點形成的圖形方程式。',
        a: '簡答：\\((x+\\frac32)^2+(y-\\frac12)^2=\\frac52\\)。過程：圓心為 \\((-1,2)\\)。弦中點 \\(M\\) 滿足 \\(CM\\perp AM\\)，故軌跡為以 \\(CA\\) 為直徑的圓。直徑端點 \\((-1,2),(-2,-1)\\)，得圓心 \\((-\\frac32,\\frac12)\\)，半徑平方 \\(\\frac{10}{4}=\\frac52\\)。',
      },
      {
        q: '若點 \\(A(2,2)\\) 是圓 \\(x^2+y^2-10x-8y-5=0\\) 內部一點，求過 \\(A\\) 點的所有弦中點軌跡。',
        a: '簡答：\\((x-\\frac72)^2+(y-3)^2=\\frac{13}{4}\\)。過程：圓心為 \\((5,4)\\)。弦中點軌跡是以圓心與定點 \\(A\\) 為直徑的圓。其圓心為 \\((\\frac72,3)\\)，半徑平方為 \\(\\frac{(5-2)^2+(4-2)^2}{4}=\\frac{13}{4}\\)。',
      },
      {
        q: '設點 \\(A(3,4)\\) 為圓 \\((x+2)^2+(y-5)^2=49\\) 內部一點，求過 \\(A\\) 點弦中點的圓心與半徑。',
        a: '簡答：圓心 \\((\\frac12,\\frac92)\\)，半徑 \\(\\sqrt{\\frac{13}{2}}\\)。過程：原圓圓心 \\((-2,5)\\)。弦中點軌跡是以 \\((-2,5)\\) 與 \\((3,4)\\) 為直徑的圓，所以圓心為兩點中點 \\((\\frac12,\\frac92)\\)，半徑平方為 \\(\\frac{(5)^2+(-1)^2}{4}=\\frac{13}{2}\\)。',
      },
      {
        q: '求圓 \\(x^2+y^2=9\\) 內，過點 \\((1,2)\\) 之弦中點所成圖形的面積。',
        a: '簡答：\\(\\frac{5\\pi}{4}\\)。過程：原圓圓心為 \\((0,0)\\)。弦中點軌跡是以 \\((0,0)\\) 與 \\((1,2)\\) 為直徑的圓，其半徑平方為 \\(\\frac{1^2+2^2}{4}=\\frac54\\)，所以面積為 \\(\\pi\\cdot\\frac54=\\frac{5\\pi}{4}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS123PerpendicularTangentsLocusSet(count) {
    const templates = [
      {
        q: '圓 \\(C:x^2+y^2-8x+4y-5=0\\)，考慮此圓任意兩條互相垂直的切線之交點形成的圖形方程式。',
        a: '簡答：\\((x-4)^2+(y+2)^2=50\\)。過程：原圓配方為 \\((x-4)^2+(y+2)^2=25\\)，圓心 \\((4,-2)\\)，半徑 5。若從點 \\(P\\) 作兩切線且互相垂直，則 \\(CP=\\sqrt2r=5\\sqrt2\\)。所以交點軌跡為同圓心、半徑 \\(5\\sqrt2\\) 的圓。',
      },
      {
        q: '若圓 \\(x^2+y^2=r^2\\) 的兩條互相垂直的切線交於點 \\(P(x,y)\\)，證明點 \\(P\\) 的軌跡也是一個圓。',
        a: '簡答：\\(x^2+y^2=2r^2\\)。過程：設圓心為 \\(O\\)，切點為 \\(T\\)。由切線性質 \\(OT\\perp PT\\)，且兩切線互相垂直，可得 \\(OP=\\sqrt2r\\)。因此 \\(P\\) 到原點距離固定為 \\(\\sqrt2r\\)，軌跡為 \\(x^2+y^2=2r^2\\)。',
      },
      {
        q: '已知圓 \\((x-1)^2+(y+2)^2=9\\)，求其垂直切線交點軌跡的半徑。',
        a: '簡答：\\(3\\sqrt2\\)。過程：原圓半徑為 3。垂直切線交點到圓心的距離恆為 \\(\\sqrt2r\\)，所以軌跡半徑為 \\(3\\sqrt2\\)。',
      },
      {
        q: '設點 \\(P(a,b)\\) 到圓 \\(x^2+y^2=5\\) 的兩切線互相垂直，求 \\(a^2+b^2\\) 之值。',
        a: '簡答：10。過程：圓心為原點，半徑 \\(\\sqrt5\\)。垂直切線交點到圓心距離為 \\(\\sqrt2r=\\sqrt{10}\\)，所以 \\(a^2+b^2=10\\)。',
      },
      {
        q: '給定圓 \\(x^2+y^2+2x-4y=0\\)，求其垂直切線交點所成圓形圖形的面積。',
        a: '簡答：\\(10\\pi\\)。過程：原圓配方為 \\((x+1)^2+(y-2)^2=5\\)，半徑平方為 5。垂直切線交點軌跡的半徑平方為 \\(2r^2=10\\)，所以面積為 \\(10\\pi\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS123RadicalAxisCircleFamilySet(count) {
    const templates = [
      {
        q: '求兩圓 \\(C_1:x^2+y^2+3x+4y+1=0\\) 與 \\(C_2:x^2+y^2+x-3y=0\\) 的公共弦方程式。',
        a: '簡答：\\(2x+7y+1=0\\)。過程：公共弦所在直線即兩圓的根軸。將 \\(C_1-C_2\\)，二次項消去，得 \\((3x-x)+(4y+3y)+1=0\\)，所以公共弦方程式為 \\(2x+7y+1=0\\)。',
      },
      {
        q: '求過圓 \\(x^2+y^2-2x+4y+1=0\\) 與直線 \\(x+2y+2=0\\) 之交點，且過點 \\((2,3)\\) 的圓。',
        a: '簡答：\\(5x^2+5y^2-21x-2y-17=0\\)。過程：設圓系為 \\(x^2+y^2-2x+4y+1+\\lambda(x+2y+2)=0\\)。代入 \\((2,3)\\) 得 \\(22+10\\lambda=0\\)，所以 \\(\\lambda=-\\frac{11}{5}\\)。同乘 5 整理得 \\(5x^2+5y^2-21x-2y-17=0\\)。',
      },
      {
        q: '以兩圓 \\(C_1:x^2+y^2-25=0\\) 與 \\(C_2:x^2+y^2-6x-7=0\\) 之公共弦為直徑，求圓方程式。',
        a: '簡答：\\((x-3)^2+y^2=16\\)。過程：兩圓相減得公共弦 \\(x=3\\)。代入 \\(x^2+y^2=25\\)，得交點 \\((3,4),(3,-4)\\)。以公共弦為直徑，圓心為 \\((3,0)\\)，半徑 4，所以方程式為 \\((x-3)^2+y^2=16\\)。',
      },
      {
        q: '設圓 \\(C_1:x^2+y^2+ax+7y-1=0\\) 與 \\(C_2:x^2+y^2+2x+by-5=0\\) 相交於兩點，且其公共弦為 \\(x-2y=2\\)，求 \\(a,b\\) 之值。',
        a: '簡答：\\(a=0,\\ b=3\\)。過程：兩圓相減得根軸 \\((a-2)x+(7-b)y+4=0\\)。它要與 \\(x-2y-2=0\\) 同一直線，故存在比例常數 \\(\\lambda\\)，使 \\(a-2=\\lambda\\)、\\(7-b=-2\\lambda\\)、\\(4=-2\\lambda\\)。得 \\(\\lambda=-2\\)，所以 \\(a=0,b=3\\)。',
      },
      {
        q: '求過圓 \\(x^2+y^2+2x-4y+1=0\\) 與直線 \\(2x-y+4=0\\) 之交點，且過點 \\((1,2)\\) 的圓。',
        a: '簡答：\\(3x^2+3y^2+10x-14y+11=0\\)。過程：設圓系為 \\(x^2+y^2+2x-4y+1+\\lambda(2x-y+4)=0\\)。代入 \\((1,2)\\) 得 \\(-2+3\\lambda=0\\)，所以 \\(\\lambda=\\frac23\\)。代回並同乘 3，整理得 \\(3x^2+3y^2+10x-14y+11=0\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS123PolarLineSet(count) {
    const templates = [
      {
        q: '自圓外點 \\(P(8,1)\\) 作圓 \\(x^2+y^2-2x+4y-7=0\\) 的切線，求兩切點連線（極線）的方程式。',
        a: '簡答：\\(7x+3y-13=0\\)。過程：對圓 \\(x^2+y^2+dx+ey+f=0\\)，外點 \\((x_0,y_0)\\) 的極線為 \\(xx_0+yy_0+\\frac{d(x+x_0)}2+\\frac{e(y+y_0)}2+f=0\\)。代入 \\(d=-2,e=4,f=-7,(x_0,y_0)=(8,1)\\)，得 \\(8x+y-(x+8)+2(y+1)-7=0\\)，整理為 \\(7x+3y-13=0\\)。',
      },
      {
        q: '已知圓 \\(C:x^2+y^2=5\\)，求點 \\(P(3,-1)\\) 對於該圓的極線（切點弦）方程式。',
        a: '簡答：\\(3x-y=5\\)。過程：對圓 \\(x^2+y^2=r^2\\)，點 \\((x_0,y_0)\\) 的極線為 \\(xx_0+yy_0=r^2\\)。代入 \\((3,-1)\\) 與 \\(r^2=5\\)，得 \\(3x-y=5\\)。',
      },
      {
        q: '若自點 \\(P\\) 向圓 \\(x^2+y^2+4x-6y+1=0\\) 作兩切線，其切點弦方程式為 \\(3x-5y+9=0\\)，求 \\(P\\) 點坐標。',
        a: '簡答：\\((1,-2)\\)。過程：設 \\(P(x_0,y_0)\\)。極線公式給出 \\((x_0+2)x+(y_0-3)y+(2x_0-3y_0+1)=0\\)。與 \\(3x-5y+9=0\\) 比較係數，可得比例為 1，所以 \\(x_0+2=3\\)、\\(y_0-3=-5\\)，解得 \\(P(1,-2)\\)。',
      },
      {
        q: '自 \\(P(5,3)\\) 向圓 \\((x-1)^2+(y-2)^2=5\\) 作兩切線，切點分別為 \\(M,N\\)，求直線 \\(MN\\) 的方程式。',
        a: '簡答：\\(4x+y-11=0\\)。過程：圓心為 \\((1,2)\\)，半徑平方為 5。切點弦極線公式為 \\((x_0-h)(x-h)+(y_0-k)(y-k)=r^2\\)。代入 \\(P(5,3)\\)，得 \\(4(x-1)+1(y-2)=5\\)，整理為 \\(4x+y-11=0\\)。',
      },
      {
        q: '若點 \\(P(x_0,y_0)\\) 在圓外，求其對應圓 \\(x^2+y^2+dx+ey+f=0\\) 的極線公式。',
        a: '簡答：\\(xx_0+yy_0+\\frac{d(x+x_0)}2+\\frac{e(y+y_0)}2+f=0\\)。過程：把圓的一般式視為兩切點共同滿足的方程，利用切點弦的對稱替換規則 \\(x^2\\to xx_0\\)、\\(y^2\\to yy_0\\)、\\(x\\to\\frac{x+x_0}{2}\\)、\\(y\\to\\frac{y+y_0}{2}\\)，即可得到極線公式。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS123LightShadowProjectionSet(count) {
    const templates = [
      {
        q: '在 \\((7,8)\\) 處有一光源，將圓 \\(C:x^2+y^2-4x-6y+12=0\\) 投射到 \\(x\\) 軸上的影長為何？',
        a: '簡答：\\(\\frac{14}{3}\\)。過程：圓配方為 \\((x-2)^2+(y-3)^2=1\\)。設過光源 \\((7,8)\\) 的切線斜率為 \\(m\\)，距離條件得 \\(m=\\frac43\\) 或 \\(\\frac34\\)。兩切線與 \\(x\\) 軸交點的 \\(x\\) 坐標分別為 1 與 \\(-\\frac{11}{3}\\)，所以影長為 \\(1-(-\\frac{11}{3})=\\frac{14}{3}\\)。',
      },
      {
        q: '坐標平面上 \\((7,5)\\) 處有一光源，將圓 \\(x^2+(y-1)^2=1\\) 投射在 \\(y=0\\) 上，求陰影長度。',
        a: '簡答：\\(\\frac{16}{3}\\)。過程：圓心 \\((0,1)\\)，半徑 1。過 \\((7,5)\\) 的兩切線斜率由距離條件可得 \\(m=\\frac34\\) 或 \\(\\frac{5}{12}\\)。與 \\(y=0\\) 交於 \\((\\frac13,0)\\)、\\((-5,0)\\)，所以影長為 \\(\\frac13-(-5)=\\frac{16}{3}\\)。',
      },
      {
        q: '點 \\(P(-2,h)\\) 處有一光源，圓 \\(x^2+y^2=1\\)（\\(y\\geq0\\)）為障礙物，若影長需覆蓋到 \\(Q(2,0)\\)，求 \\(h\\) 最小值。',
        a: '簡答：\\(\\frac{4\\sqrt3}{3}\\)。過程：要剛好覆蓋到 \\(Q(2,0)\\)，直線 \\(PQ\\) 必為半圓的切線。其方程可寫成 \\(hx+4y-2h=0\\)。圓心到此線距離需為 1，故 \\(\\frac{2h}{\\sqrt{h^2+16}}=1\\)，解得 \\(h=\\frac{4\\sqrt3}{3}\\)。',
      },
      {
        q: '設光源在 \\((7,5)\\)，將圓 \\(x^2+(y-1)^2=1\\) 投射到 \\(x\\) 軸的影長。',
        a: '簡答：\\(\\frac{16}{3}\\)。過程：此題與投射到 \\(y=0\\) 相同。圓心 \\((0,1)\\)，半徑 1。兩條切線與 \\(x\\) 軸交於 \\((\\frac13,0)\\) 與 \\((-5,0)\\)，所以影長為 \\(\\frac{16}{3}\\)。',
      },
      {
        q: '已知一半徑為 60 的圓形城堡，光源在正北方 100 單位處，求在 \\(x\\) 軸上產生的陰影寬度。',
        a: '簡答：150。過程：設城堡為 \\(x^2+y^2=60^2\\)，光源在 \\((0,100)\\)。兩切線對稱，設右側切線與 \\(x\\) 軸交於 \\((a,0)\\)。直線過 \\((0,100),(a,0)\\)，到原點距離為半徑 60，可得 \\(\\frac{100a}{\\sqrt{a^2+10000}}=60\\)，解得 \\(a=75\\)。左右對稱，所以陰影寬度為 \\(2a=150\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, answers };
  }

  function buildS123LineCircleParameterRelationSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const r = randInt(1, 4);
        const bound = formatRadical(2 * r * r);
        questions.push(`討論直線 \\(x-y+k=0\\) 與圓 \\(x^2+y^2=${r * r}\\) 的相交情形，並用 \\(k\\) 表示相交於 0、1、2 點的範圍。`);
        answers.push(`簡答：\\(|k|<${bound}\\) 時交於 2 點；\\(|k|=${bound}\\) 時相切；\\(|k|>${bound}\\) 時無交點。過程：圓心為 \\((0,0)\\)，半徑為 ${r}。圓心到直線距離 \\(d=\\frac{|k|}{\\sqrt{2}}\\)。比較 \\(d\\) 與半徑 ${r}，即得上述三種情形。`);
        continue;
      }

      if (type === 1) {
        const mAbs = [3, 4, 5][randInt(0, 2)];
        const cRadicand = mAbs * mAbs + 1;
        const cText = formatRadical(cRadicand);
        questions.push(`若直線 \\(kx-y+${cText}=0\\) 與圓 \\(x^2+y^2=1\\) 相切，求 \\(k\\) 的值。`);
        answers.push(`簡答：\\(k=${mAbs}\\) 或 \\(k=-${mAbs}\\)。過程：圓心 \\((0,0)\\) 到直線距離需等於半徑 1，所以 \\(\\frac{${cText}}{\\sqrt{k^2+1}}=1\\)。平方後得 \\(k^2+1=${cRadicand}\\)，因此 \\(k^2=${mAbs * mAbs}\\)，故 \\(k=\\pm${mAbs}\\)。`);
        continue;
      }

      if (type === 2) {
        const b = [2, 3, 4][randInt(0, 2)];
        const threshold = b * b - 1;
        questions.push(`若直線 \\(y=mx+${b}\\) 與圓 \\(x^2+y^2=1\\) 相交於相異兩點，求 \\(m\\) 的範圍。`);
        answers.push(`簡答：\\(m<-${formatRadical(threshold)}\\) 或 \\(m>${formatRadical(threshold)}\\)。過程：圓心到直線 \\(mx-y+${b}=0\\) 的距離為 \\(\\frac{|${b}|}{\\sqrt{m^2+1}}\\)。相異兩點表示距離小於半徑 1，因此 \\(\\frac{${b * b}}{m^2+1}<1\\)，得 \\(m^2>${threshold}\\)。`);
        continue;
      }

      if (type === 3) {
        const h = randInt(-3, 4);
        const k0 = randInt(-3, 4);
        const r = randInt(1, 4);
        const base = 3 * h + 4 * k0;
        questions.push(`若直線 \\(3x+4y=t\\) 與圓 \\(${formatS122CircleStandard(h, k0, r * r)}\\) 無交點，求 \\(t\\) 的範圍。`);
        answers.push(`簡答：\\(t<${base - 5 * r}\\) 或 \\(t>${base + 5 * r}\\)。過程：圓心為 \\(${formatS122Point({ x: h, y: k0 })}\\)，半徑為 ${r}。圓心到直線距離為 \\(\\frac{|3\\cdot(${h})+4\\cdot(${k0})-t|}{5}=\\frac{|${base}-t|}{5}\\)。無交點表示此距離大於 ${r}，所以 \\(|${base}-t|>${5 * r}\\)。`);
        continue;
      }

      const h = randInt(-3, 3);
      const k0 = randInt(-3, 3);
      const r = randInt(2, 5);
      const base = 3 * h + 4 * k0;
      const modes = [
        { offset: 0, relation: '相交於 2 點', reason: `小於半徑 ${r}` },
        { offset: 5 * r, relation: '相切', reason: `等於半徑 ${r}` },
        { offset: 5 * r + 5, relation: '無交點', reason: `大於半徑 ${r}` },
      ];
      const pick = modes[randInt(0, modes.length - 1)];
      const t = base + pick.offset;
      const tMoveText = t >= 0 ? `-${t}` : `+${-t}`;
      questions.push(`判斷圓 \\(${formatS122CircleStandard(h, k0, r * r)}\\) 與直線 \\(3x+4y=${t}\\) 的位置關係。`);
      answers.push(`簡答：${pick.relation}。過程：圓心為 \\(${formatS122Point({ x: h, y: k0 })}\\)，半徑 ${r}。圓心到直線距離為 \\(\\frac{|3\\cdot(${h})+4\\cdot(${k0})${tMoveText}|}{5}=\\frac{${Math.abs(base - t)}}{5}=${Math.abs(base - t) / 5}\\)，${pick.reason}，所以位置關係為${pick.relation}。`);
    }

    return { questions, answers };
  }

  function buildS123PointPowerTangentChordSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const triples = [
          { p: 13, r: 5, len: 12 },
          { p: 10, r: 6, len: 8 },
          { p: 25, r: 7, len: 24 },
        ];
        const pick = triples[randInt(0, triples.length - 1)];
        questions.push(`已知點 \\(P(${pick.p},0)\\) 到圓 \\(x^2+y^2=${pick.r * pick.r}\\) 作切線，求切線長。`);
        answers.push(`簡答：${pick.len}。過程：點 \\(P\\) 到圓心距離為 ${pick.p}，半徑為 ${pick.r}。切線長平方為 \\(OP^2-r^2=${pick.p * pick.p}-${pick.r * pick.r}=${pick.len * pick.len}\\)，所以切線長為 ${pick.len}。`);
        continue;
      }

      if (type === 1) {
        questions.push(`已知點 \\(P(a,2a)\\) 在圓 \\(x^2+y^2-2x=0\\) 的內部，求 \\(a\\) 的範圍。`);
        answers.push(`簡答：\\(0<a<\\frac25\\)。過程：點在圓內表示代入圓方程式後小於 0。代入 \\((a,2a)\\)，得 \\(a^2+(2a)^2-2a=5a^2-2a<0\\)。分解為 \\(a(5a-2)<0\\)，所以 \\(0<a<\\frac25\\)。`);
        continue;
      }

      if (type === 2) {
        const templates = [
          { d: -6, e: 2, f: 5 },
          { d: 4, e: -8, f: 7 },
          { d: -10, e: -2, f: 13 },
        ];
        const pick = templates[randInt(0, templates.length - 1)];
        const lenText = formatRadical(pick.f);
        questions.push(`求原點 \\(O(0,0)\\) 到圓 \\(x^2+y^2${pick.d >= 0 ? '+' : ''}${pick.d}x${pick.e >= 0 ? '+' : ''}${pick.e}y+${pick.f}=0\\) 的切線長。`);
        answers.push(`簡答：\\(${lenText}\\)。過程：對圓 \\(x^2+y^2+dx+ey+f=0\\)，點 \\((0,0)\\) 的冪為 \\(f\\)，也就是切線長平方。此題 \\(f=${pick.f}\\)，所以切線長為 \\(${lenText}\\)。`);
        continue;
      }

      if (type === 3) {
        questions.push(`設 \\(A(1,1)\\)，任一直線過 \\(A\\) 且與圓 \\(x^2+y^2-2x+6y+1=0\\) 交於兩點 \\(P,Q\\)。求 \\(AP\\cdot AQ\\) 的值。`);
        answers.push(`簡答：7。過程：由點冪定理，\\(AP\\cdot AQ\\) 等於點 \\(A\\) 對圓的冪。代入 \\((1,1)\\) 得 \\(1^2+1^2-2\\cdot1+6\\cdot1+1=7\\)，所以 \\(AP\\cdot AQ=7\\)。`);
        continue;
      }

      const h = randInt(-3, 3);
      const k0 = randInt(-3, 3);
      const r = randInt(2, 5);
      const px = h + r + randInt(2, 5);
      const py = k0;
      const power = (px - h) * (px - h) - r * r;
      questions.push(`設點 \\(P(${px},${py})\\)，從 \\(P\\) 向圓 \\(${formatS122CircleStandard(h, k0, r * r)}\\) 作兩切線，切點為 \\(M,N\\)。求 \\(PM^2\\) 的值。`);
      answers.push(`簡答：${power}。過程：點到圓的切線長平方等於點冪。\\(PC=${Math.abs(px - h)}\\)，半徑為 ${r}，所以 \\(PM^2=PC^2-r^2=${Math.abs(px - h)}^2-${r}^2=${power}\\)。`);
    }

    return { questions, answers };
  }

  function buildS123VerticalTangentTrapSet(count) {
    const questions = [];
    const answers = [];
    const cases = [
      { h: 0, k: 3, r: 1, t: -2, side: 1 },
      { h: -1, k: 0, r: 2, t: 4, side: -1 },
      { h: 3, k: -2, r: 2, t: 6, side: 1 },
      { h: -2, k: 1, r: 3, t: 6, side: -1 },
      { h: 2, k: 4, r: 1, t: -3, side: 1 },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const px = item.h + item.side * item.r;
      const py = item.k + item.t;
      const rawNum = item.side * (item.t * item.t - item.r * item.r);
      const rawDen = 2 * item.r * item.t;
      const frac = reduceFraction(rawNum, rawDen);
      const line = formatS123LineEquation(frac.numerator, -frac.denominator, frac.denominator * py - frac.numerator * px);
      const vertical = `x=${px}`;
      const slopeText = formatFraction(rawNum, rawDen);
      questions.push(
        `求過圓外點 \\(P${formatS122Point({ x: px, y: py })}\\) 且與圓 \\(${formatS122CircleStandard(item.h, item.k, item.r * item.r)}\\) 相切的兩條直線方程式。`
      );
      answers.push(
        `簡答：\\(${vertical}\\) 或 \\(${line}\\)。過程：因為 \\(P\\) 的 \\(x\\) 坐標正好是圓心 \\(x\\) 坐標加上半徑或減去半徑，所以一條切線是鉛直線 \\(${vertical}\\)。另一條不可用鉛直線表示，設為 \\(y-${wrapIfNegative(py)}=m(x-${wrapIfNegative(px)})\\)。由圓心到直線距離等於半徑 ${item.r}，可得 \\(m=${slopeText}\\)，整理為 \\(${line}\\)。`
      );
    }

    return { questions, answers };
  }

  function buildS123IntegerDistanceCountingSet(count) {
    const questions = [];
    const answers = [];
    const isPrime = (n) => {
      if (n < 2) return false;
      for (let d = 2; d * d <= n; d += 1) {
        if (n % d === 0) return false;
      }
      return true;
    };
    const countByDistance = (minD, maxD, predicate) => {
      let distanceCount = 0;
      let pointCount = 0;
      for (let d = Math.ceil(minD); d <= Math.floor(maxD); d += 1) {
        if (!predicate(d)) continue;
        distanceCount += 1;
        pointCount += d === minD || d === maxD ? 1 : 2;
      }
      return { distanceCount, pointCount };
    };
    const templates = [
      {
        q: () => {
          const c = randInt(6, 10);
          const r = randInt(2, 4);
          const minD = c - r;
          const maxD = c + r;
          const result = countByDistance(minD, maxD, () => true);
          return {
            question: `求原點 \\(O(0,0)\\) 到圓 \\((x-${c})^2+y^2=${r * r}\\) 上，距離值為整數的點共有幾個？`,
            answer: `簡答：${result.pointCount} 個。過程：圓心為 \\(C(${c},0)\\)，半徑為 ${r}，所以 \\(O\\) 到圓上點的距離範圍為 \\(${c}-${r}\\leq OP\\leq${c}+${r}\\)，即 \\(${minD}\\leq OP\\leq${maxD}\\)。每個介於中間的整數距離會對應 2 點，兩端距離各對應 1 點，因此共有 \\(2\\cdot${result.distanceCount}-2=${result.pointCount}\\) 個點。`,
          };
        },
      },
      {
        q: () => {
          const c = 9 + randInt(0, 2);
          const r = 4;
          const minD = c - r;
          const maxD = c + r;
          const result = countByDistance(minD, maxD, isPrime);
          return {
            question: `已知圓 \\((x-${c})^2+y^2=${r * r}\\)，求圓上到原點距離為質數的點共有幾個？`,
            answer: `簡答：${result.pointCount} 個。過程：原點到圓上點的距離介於 \\(${minD}\\) 與 \\(${maxD}\\) 之間。此範圍內的質數距離共有 ${result.distanceCount} 個；若距離不是端點，會對稱得到 2 點，若剛好是端點則只有 1 點。逐一計數得 ${result.pointCount} 個點。`,
          };
        },
      },
      {
        q: () => {
          const c = randInt(7, 10);
          const r = 3;
          const minD = c - r;
          const maxD = c + r;
          const result = countByDistance(minD, maxD, (d) => d % 2 === 1);
          return {
            question: `判斷圓 \\((x-${c})^2+y^2=${r * r}\\) 上，有幾個點到原點的距離為奇數？`,
            answer: `簡答：${result.pointCount} 個。過程：距離範圍是 \\(${minD}\\leq OP\\leq${maxD}\\)。其中奇數距離共有 ${result.distanceCount} 個；中間距離各給 2 點，端點若符合只給 1 點，所以共有 ${result.pointCount} 個點。`,
          };
        },
      },
      {
        q: () => {
          const c = randInt(7, 11);
          const r = randInt(2, 4);
          const distance = c;
          return {
            question: `圓 \\((x-${c})^2+y^2=${r * r}\\) 上，到原點距離等於 ${distance} 的點共有幾個？`,
            answer: `簡答：2 個。過程：原點到圓上點的距離範圍為 \\(${c - r}\\leq OP\\leq${c + r}\\)。因為 ${distance} 在兩端之間，不是最短或最遠距離，所以與以原點為圓心、半徑 ${distance} 的圓相交於 2 點。`,
          };
        },
      },
      {
        q: () => {
          const c = randInt(6, 9);
          const r = randInt(2, 4);
          const endDistance = c + r;
          return {
            question: `圓 \\((x-${c})^2+y^2=${r * r}\\) 上，到原點距離等於最大值的點共有幾個？最大距離是多少？`,
            answer: `簡答：1 個，最大距離為 ${endDistance}。過程：原點與圓心距離為 ${c}，半徑為 ${r}，最大距離為 \\(${c}+${r}=${endDistance}\\)。最大距離只發生在原點、圓心連線延長方向上的端點，所以只有 1 個點。`,
          };
        },
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length].q();
      questions.push(item.question);
      answers.push(item.answer);
    }

    return { questions, answers };
  }

  function buildS123CommonChordDiameterCircleSet(count) {
    const questions = [];
    const answers = [];
    const cases = [
      { r: 5, a: 3, d: -10 },
      { r: 10, a: 6, d: -8 },
      { r: 13, a: 5, d: -12 },
      { r: 8, a: -4, d: 6 },
      { r: 15, a: -9, d: 10 },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const r2 = item.r * item.r;
      const newR2 = r2 - item.a * item.a;
      const f = -item.d * item.a - r2;
      const c2 = formatS122CircleGeneral(1, item.d, 0, f);
      questions.push(`以兩圓 \\(C_1:x^2+y^2=${r2}\\) 與 \\(C_2:${c2}\\) 的公共弦為直徑，求此新圓的方程式。`);
      answers.push(
        `簡答：\\(${formatS122CircleStandard(item.a, 0, newR2)}\\)。過程：將 \\(C_2-C_1\\) 消去二次項，得 \\(${item.d}x${f + r2 >= 0 ? '+' : ''}${f + r2}=0\\)，所以公共弦為 \\(x=${item.a}\\)。代回 \\(x^2+y^2=${r2}\\)，得交點的 \\(y^2=${newR2}\\)。以此公共弦為直徑時，圓心為 \\((${item.a},0)\\)，半徑平方為 ${newR2}，故方程式為 \\(${formatS122CircleStandard(item.a, 0, newR2)}\\)。`
      );
    }

    return { questions, answers };
  }

  function buildS123CircleAreaExtremaSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      if (type === 0) {
        const point = [
          { x: 3, y: -4, len: 5 },
          { x: 5, y: 12, len: 13 },
          { x: 8, y: -15, len: 17 },
        ][randInt(0, 2)];
        const qx = point.x;
        const qy = point.y;
        const qLen2 = qx * qx + qy * qy;
        const lenText = formatRadical(qLen2);
        questions.push(`若 \\(P\\) 為單位圓 \\(x^2+y^2=1\\) 上任一點，令 \\(O(0,0)\\)、\\(Q(${qx},${qy})\\)，求 \\(\\triangle OPQ\\) 面積的最大值。`);
        answers.push(`簡答：\\(${formatFraction(point.len, 2)}\\)。過程：\\(\\triangle OPQ\\) 面積為 \\(\\frac12|\\overrightarrow{OP}\\times\\overrightarrow{OQ}|\\)。當 \\(OP\\perp OQ\\) 時最大，且 \\(OP=1\\)、\\(OQ=${lenText}\\)，所以最大面積為 \\(\\frac12\\cdot1\\cdot${lenText}=${formatFraction(point.len, 2)}\\)。`);
        continue;
      }

      if (type === 1) {
        const r = [2, 4, 6][randInt(0, 2)];
        questions.push(`在圓 \\(x^2+y^2=${r * r}\\) 的第一象限內作一個邊平行坐標軸、兩邊貼在坐標軸上的內接矩形，求其最大面積。`);
        answers.push(`簡答：${(r * r) / 2}。過程：設右上頂點為 \\((x,y)\\)，則 \\(x^2+y^2=${r * r}\\)，矩形面積為 \\(xy\\)。由 \\((x-y)^2\\geq0\\)，得 \\(2xy\\leq x^2+y^2=${r * r}\\)，所以 \\(xy\\leq${(r * r) / 2}\\)。等號在 \\(x=y\\) 時成立。`);
        continue;
      }

      if (type === 2) {
        const triples = [
          { a: 3, b: -4, r: 2 },
          { a: 5, b: 12, r: 1 },
          { a: 8, b: -6, r: 3 },
        ];
        const pick = triples[randInt(0, triples.length - 1)];
        const lenValue = Math.sqrt(pick.a * pick.a + pick.b * pick.b);
        const len = formatRadical(pick.a * pick.a + pick.b * pick.b);
        const extreme = pick.r * lenValue;
        questions.push(`已知 \\((x,y)\\) 滿足 \\(x^2+y^2\\leq${pick.r * pick.r}\\)，求 \\(${pick.a}x${pick.b >= 0 ? '+' : ''}${pick.b}y\\) 的最大值與最小值。`);
        answers.push(`簡答：最大值 \\(${extreme}\\)，最小值 \\(-${extreme}\\)。過程：線性式 \\(${pick.a}x${pick.b >= 0 ? '+' : ''}${pick.b}y\\) 在圓盤上的極值為 \\(\\pm r\\sqrt{a^2+b^2}\\)。此題 \\(r=${pick.r}\\)，\\(\\sqrt{a^2+b^2}=${len}\\)，所以最大值為 ${extreme}，最小值為 \\(-${extreme}\\)。`);
        continue;
      }

      if (type === 3) {
        const h = randInt(-3, 3);
        const k0 = randInt(-3, 3);
        const r = randInt(1, 3);
        const lineC = h + k0;
        const line = formatS123LineEquation(1, 1, -lineC);
        questions.push(`若點 \\(P\\) 在圓 \\(${formatS122CircleStandard(h, k0, r * r)}\\) 上移動，求 \\(P\\) 到直線 \\(${line}\\) 所形成、以該距離為高且底為 4 的三角形面積最大值。`);
        answers.push(`簡答：${2 * r}。過程：直線 \\(${line}\\) 通過圓心 \\(${formatS122Point({ x: h, y: k0 })}\\)。圓上點到一條過圓心直線的最大距離就是半徑 ${r}，所以三角形面積最大為 \\(\\frac12\\cdot4\\cdot${r}=${2 * r}\\)。`);
        continue;
      }

      const r = randInt(2, 6);
      questions.push(`同一圓 \\(x^2+y^2=${r * r}\\) 內接一個正三角形，並外切一個正三角形，求內接正三角形面積與外切正三角形面積之比。`);
      answers.push(`簡答：\\(1:4\\)。過程：同一圓作為內接正三角形的外接圓時，面積為 \\(\\frac{3\\sqrt3}{4}r^2\\)；作為外切正三角形的內切圓時，面積為 \\(3\\sqrt3 r^2\\)。兩者相比為 \\(\\frac{3\\sqrt3}{4}r^2:3\\sqrt3 r^2=1:4\\)。`);
    }

    return { questions, answers };
  }

  function buildS131CoefficientSumParitySet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        let a = randInt(-3, 4);
        let b = pickNonZero(-4, 4);
        while (Math.abs(1 + a + b) <= 1) {
          a = randInt(-3, 4);
          b = pickNonZero(-4, 4);
        }
        const n = randInt(3, 6);
        const value = 1 + a + b;
        questions.push(`設 \\(f(x)=(${formatPolynomialFromCoeffs([1, a, b])})^{${n}}\\)，求 \\(f(x)\\) 展開式中所有項的係數總和。`);
        answers.push(`簡答：${Math.pow(value, n)}。過程：多項式所有項的係數總和等於 \\(f(1)\\)。所以 \\(f(1)=(1${a >= 0 ? '+' : ''}${a}${b >= 0 ? '+' : ''}${b})^{${n}}=${value}^{${n}}=${Math.pow(value, n)}\\)。`);
        continue;
      }

      if (type === 1) {
        const a = randInt(2, 5);
        const b = randInt(1, 4);
        const c = randInt(1, 3);
        const n = randInt(2, 4);
        const total = Math.pow(1 + a + b + c, n);
        const alt = Math.pow(-1 + a - b + c, n);
        const even = (total + alt) / 2;
        questions.push(`設 \\(f(x)=(${formatPolynomialFromCoeffs([1, a, b, c])})^{${n}}\\)，求展開式中偶次項的係數和。`);
        answers.push(`簡答：${even}。過程：所有係數和為 \\(f(1)=${total}\\)，偶次項係數和為 \\(\\frac{f(1)+f(-1)}{2}\\)。又 \\(f(-1)=(-1+${a}-${b}+${c})^{${n}}=${alt}\\)，所以偶次項係數和為 \\(\\frac{${total}+${alt}}{2}=${even}\\)。`);
        continue;
      }

      if (type === 2) {
        const a = randInt(1, 4);
        const b = randInt(1, 5);
        const c = randInt(-3, 3);
        const n = randInt(2, 4);
        const total = Math.pow(1 + a + b + c, n);
        const alt = Math.pow(-1 + a - b + c, n);
        const odd = (total - alt) / 2;
        questions.push(`設 \\(f(x)=(${formatPolynomialFromCoeffs([1, a, b, c])})^{${n}}\\)，求展開式中奇次項的係數和。`);
        answers.push(`簡答：${odd}。過程：奇次項係數和為 \\(\\frac{f(1)-f(-1)}{2}\\)。此題 \\(f(1)=${total}\\)，\\(f(-1)=${alt}\\)，所以奇次項係數和為 \\(\\frac{${total}-(${alt})}{2}=${odd}\\)。`);
        continue;
      }

      if (type === 3) {
        const k = randInt(-3, 4);
        const oddSum = 4 - 3 * k;
        questions.push(`設 \\(f(x)=(x^2+kx+1)(x^3-2x^2+x-1)\\)，已知奇次項係數和為 ${oddSum}，求實數 \\(k\\)。`);
        answers.push(`簡答：\\(k=${k}\\)。過程：奇次項係數和為 \\(\\frac{f(1)-f(-1)}2\\)。其中 \\(f(1)=(1+k+1)(1-2+1-1)=-(k+2)\\)，\\(f(-1)=(1-k+1)(-1-2-1-1)=-5(2-k)\\)。令 \\(\\frac{-(k+2)-[-5(2-k)]}{2}=${oddSum}\\)，可解得 \\(k=${k}\\)。`);
        continue;
      }

      const a = randInt(2, 5);
      const b = randInt(1, 4);
      const n = randInt(3, 6);
      const total = Math.pow(1 + a + b, n);
      const alt = Math.pow(1 - a + b, n);
      const odd = (total - alt) / 2;
      const even = (total + alt) / 2;
      questions.push(`設 \\(f(x)=(${formatPolynomialFromCoeffs([1, a, b])})^{${n}}\\)。若奇次項係數和為 \\(A\\)，偶次項係數和為 \\(B\\)，求 \\(A+B\\)。`);
      answers.push(`簡答：${total}。過程：奇次項係數和 \\(A=\\frac{f(1)-f(-1)}2=${odd}\\)，偶次項係數和 \\(B=\\frac{f(1)+f(-1)}2=${even}\\)。因此 \\(A+B=f(1)=${total}\\)。`);
    }

    return { questions, answers };
  }

  function buildS131DifferenceReversePolynomialSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const d = randInt(-4, 5);
        const c = randInt(-5, 8);
        questions.push(`設 \\(f(x)\\) 為一次式，滿足 \\(f(x+1)-f(x)=${d}\\)，且 \\(f(0)=${c}\\)，求 \\(f(x)\\)。`);
        answers.push(`簡答：\\(f(x)=${formatPolynomialFromCoeffs([d, c])}\\)。過程：設 \\(f(x)=ax+b\\)。則 \\(f(x+1)-f(x)=a\\)，所以 \\(a=${d}\\)。又 \\(f(0)=b=${c}\\)，故 \\(f(x)=${formatPolynomialFromCoeffs([d, c])}\\)。`);
        continue;
      }

      if (type === 1) {
        const a = randInt(1, 4);
        const b = randInt(-5, 5);
        const c = randInt(-3, 6);
        const A = 2 * a;
        const B = a + b;
        questions.push(`已知多項式 \\(f(x)\\) 滿足 \\(f(x+1)-f(x)=${formatPolynomialFromCoeffs([A, B])}\\)，且 \\(f(0)=${c}\\)，求最低次多項式 \\(f(x)\\)。`);
        answers.push(`簡答：\\(f(x)=${formatPolynomialFromCoeffs([a, b, c])}\\)。過程：設 \\(f(x)=ax^2+bx+c\\)。則 \\(f(x+1)-f(x)=2ax+(a+b)\\)。比較係數得 \\(2a=${A}\\)、\\(a+b=${B}\\)，所以 \\(a=${a},b=${b}\\)。又 \\(f(0)=c=${c}\\)。`);
        continue;
      }

      if (type === 2) {
        const a = randInt(1, 3);
        const b = randInt(-4, 4);
        const c = randInt(-4, 5);
        const d = randInt(-3, 3);
        const A = 3 * a;
        const B = 3 * a + 2 * b;
        const C = a + b + c;
        questions.push(`若 \\(f(x+1)-f(x)=${formatPolynomialFromCoeffs([A, B, C])}\\)，且 \\(f(0)=${d}\\)，求最低次多項式 \\(f(x)\\)。`);
        answers.push(`簡答：\\(f(x)=${formatPolynomialFromCoeffs([a, b, c, d])}\\)。過程：設 \\(f(x)=ax^3+bx^2+cx+d\\)。差分為 \\(3ax^2+(3a+2b)x+(a+b+c)\\)。比較係數得 \\(a=${a},b=${b},c=${c}\\)，再由 \\(f(0)=d=${d}\\)。`);
        continue;
      }

      if (type === 3) {
        const a = randInt(1, 5);
        const b = randInt(-6, 6);
        questions.push(`設 \\(f(x)\\) 為二次多項式，若 \\(f(x+2)-f(x)=${formatPolynomialFromCoeffs([4 * a, 4 * a + 2 * b])}\\)，求 \\(f(x)\\) 的最高次項係數。`);
        answers.push(`簡答：${a}。過程：設 \\(f(x)=Ax^2+Bx+C\\)，則 \\(f(x+2)-f(x)=4Ax+(4A+2B)\\)。比較 \\(x\\) 係數，\\(4A=${4 * a}\\)，所以 \\(A=${a}\\)。`);
        continue;
      }

      const m = randInt(2, 5);
      questions.push(`若 \\(f(x+1)-f(x)\\) 是 ${m} 次多項式，且最高次項不抵消，判斷 \\(f(x)\\) 的次數。`);
      answers.push(`簡答：${m + 1} 次。過程：差分會使多項式次數降低 1。也就是 \\(n\\) 次多項式做 \\(f(x+1)-f(x)\\) 後通常成為 \\(n-1\\) 次。因此差分是 ${m} 次時，原多項式 \\(f(x)\\) 應為 ${m + 1} 次。`);
    }

    return { questions, answers };
  }

  function buildS131PolynomialIdentityParameterSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '若 \\((a+b)x^3+(1-a)x^2+(a-b)x+2b+3\\) 為一次式，求數對 \\((a,b)\\)。',
        a: '簡答：\\((a,b)=(1,-1)\\)。過程：一次式表示三次項與二次項係數皆為 0，所以 \\(a+b=0\\)、\\(1-a=0\\)。解得 \\(a=1,b=-1\\)。此時一次項係數 \\(a-b=2\\)，確實不是 0。',
      },
      {
        q: '設 \\(f(x)=a(x-1)(x-2)+b(x-2)+c\\) 與 \\(g(x)=2x^2-3x+5\\) 恆相等，求 \\(a,b,c\\)。',
        a: '簡答：\\(a=2,b=3,c=7\\)。過程：展開得 \\(f(x)=ax^2+(-3a+b)x+(2a-2b+c)\\)。與 \\(2x^2-3x+5\\) 比較係數，得 \\(a=2\\)、\\(-3a+b=-3\\)，所以 \\(b=3\\)；再由 \\(2a-2b+c=5\\)，得 \\(c=7\\)。',
      },
      {
        q: '若 \\((a-2)x^3+(b-c+1)x^2+(2c-1)x+d+2\\) 對任意實數 \\(x\\) 代入後皆為 6，求 \\(a,b,c,d\\)。',
        a: '簡答：\\(a=2,b=-\\frac{1}{2},c=\\frac{1}{2},d=4\\)。過程：恆為常數 6，表示 \\(x^3,x^2,x\\) 係數都為 0，常數項為 6。故 \\(a-2=0\\)、\\(2c-1=0\\)、\\(b-c+1=0\\)、\\(d+2=6\\)，解得答案。',
      },
      {
        q: '設 \\(f(x)=(a+3)x^3+(b-2)x^2+(3c+4)x+d\\)。若 \\(f(1)=1,f(2)=2,f(3)=3,f(4)=4\\)，求 \\(a,b,c,d\\)。',
        a: '簡答：\\(a=-3,b=2,c=-1,d=0\\)。過程：條件表示 \\(f(x)-x\\) 這個三次以下多項式有 \\(1,2,3,4\\) 四個根，所以 \\(f(x)-x\\equiv0\\)，即 \\(f(x)=x\\)。比較係數得 \\(a+3=0,b-2=0,3c+4=1,d=0\\)。',
      },
      {
        q: '已知 \\(\\frac{2x^2+hx+k}{x^2+x-2}\\) 之值恆為定值 \\(t\\)，求 \\(h,k,t\\)。',
        a: '簡答：\\(h=2,k=-4,t=2\\)。過程：分式值恆為定值表示分子恆等於 \\(t(x^2+x-2)\\)。比較二次項得 \\(t=2\\)，所以分子應為 \\(2x^2+2x-4\\)，故 \\(h=2,k=-4\\)。',
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }

    return { questions, answers };
  }

  function buildS131DegreeAfterOperationsSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '若 \\(\\deg f(x)=4\\)、\\(\\deg g(x)=4\\)，則 \\(\\deg(f(x)-g(x))\\) 的可能值為何？',
        a: '簡答：可能小於或等於 4；若最高次項沒有抵消則為 4，若抵消則可能為 3、2、1、0，甚至零多項式的次數不定義。過程：同次多項式相減時，最高次項係數可能相消，所以只能說結果次數不超過 4。',
      },
      {
        q: '已知 \\(\\deg(f(x)g(x))=6\\)、\\(\\deg(f(x)+g(x))=4\\)，求 \\(f(x)\\) 可能的次數。',
        a: '簡答：2 或 4。過程：設 \\(\\deg f=m,\\deg g=n\\)，則 \\(m+n=6\\)。又和的次數為 4，表示兩者較大的次數必須是 4，或最高次抵消後降到 4。可行的配對為 \\((m,n)=(2,4),(4,2)\\) 或同為 3 不可能使和為 4，所以 \\(f\\) 可能為 2 或 4 次。',
      },
      {
        q: '若 \\(f(x)\\)、\\(g(x)\\) 均為 \\(n\\) 次多項式，令 \\(h(x)=f(x)-g(x)\\)，則 \\(h(x)\\) 的次數可能如何？',
        a: '簡答：可能小於或等於 \\(n\\)，也可能成為零多項式。過程：兩個 \\(n\\) 次多項式相減時，最高次項係數若不同，結果仍為 \\(n\\) 次；若相同，最高次項抵消，次數會降低；若所有係數都相同，則為零多項式。',
      },
      {
        q: '若 \\(f(x)\\) 為四次式，求 \\((x^3-3)f(x^2-1)\\) 的次數。',
        a: '簡答：11 次。過程：\\(f(x)\\) 為四次式，所以 \\(f(x^2-1)\\) 的最高次來自 \\((x^2)^4=x^8\\)，是 8 次。再乘上 \\((x^3-3)\\)，最高次為 \\(8+3=11\\)。',
      },
      {
        q: '判斷 \\((x^2+1)^3-(x^3+1)^2\\) 的次數。',
        a: '簡答：4 次。過程：兩部分最高次都是 \\(x^6\\)，相減後 \\(x^6\\) 抵消。展開看下一層：\\((x^2+1)^3=x^6+3x^4+3x^2+1\\)，\\((x^3+1)^2=x^6+2x^3+1\\)，差為 \\(3x^4-2x^3+3x^2\\)，所以次數為 4。',
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }

    return { questions, answers };
  }

  function buildS131SpecificCoefficientSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '求 \\((x+1)(x+2)\\cdots(x+10)\\) 展開式中的 \\(x^9\\) 項係數。',
        a: '簡答：55。過程：十個一次因式相乘時，\\(x^9\\) 項係數等於所有常數項的總和，故為 \\(1+2+\\cdots+10=55\\)。',
      },
      {
        q: '設 \\(f(x)=(x^5-2x^4+3x^3-4x^2+5x+2)(3x^6+2x^3+x^2+1)\\)，求展開後 \\(x^2\\) 的係數。',
        a: '簡答：-2。過程：要湊 \\(x^2\\)，只有兩種來源：第一個多項式的 \\(-4x^2\\) 乘第二個的常數 1，以及第一個多項式的常數 2 乘第二個的 \\(x^2\\)。因此係數為 \\(-4\\cdot1+2\\cdot1=-2\\)。',
      },
      {
        q: '求 \\((1-2x+3x^2-\\cdots+11x^{10})(1+3x^2+5x^4+\\cdots+11x^{10})\\) 乘開後 \\(x^9\\) 的係數。',
        a: '簡答：-110。過程：第二個多項式只含偶次項。要湊 \\(x^9\\)，第一個多項式需取奇次項：\\((-2x)(9x^8)+(-4x^3)(7x^6)+(-6x^5)(5x^4)+(-8x^7)(3x^2)+(-10x^9)(1)\\)。係數和為 \\(-18-28-30-24-10=-110\\)。',
      },
      {
        q: '求 \\((1+x+x^2+\\cdots+x^8)(1+x+x^2+\\cdots+x^6)\\) 展開式中 \\(x^5\\) 的係數。',
        a: '簡答：6。過程：要湊 \\(x^5\\)，可取 \\((x^0,x^5),(x^1,x^4),\\ldots,(x^5,x^0)\\)，共有 6 種搭配，所以係數為 6。',
      },
      {
        q: '求 \\((1+x)^8\\) 展開式中 \\(x^3\\) 與 \\(x^5\\) 項係數之和。',
        a: '簡答：112。過程：\\((1+x)^8\\) 中 \\(x^3\\) 係數為 \\(\\binom83=56\\)，\\(x^5\\) 係數為 \\(\\binom85=56\\)，係數和為 112。',
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }

    return { questions, answers };
  }

  function buildS131PolynomialFiveSubtypeMixedSet(count) {
    const banks = [
      buildS131CoefficientSumParitySet,
      buildS131DifferenceReversePolynomialSet,
      buildS131PolynomialIdentityParameterSet,
      buildS131DegreeAfterOperationsSet,
      buildS131SpecificCoefficientSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, answers };
  }

  function addPolyCoeffs(a, b) {
    const len = Math.max(a.length, b.length);
    const left = Array(len - a.length).fill(0).concat(a);
    const right = Array(len - b.length).fill(0).concat(b);
    return left.map((value, index) => value + right[index]);
  }

  function multiplyLinearByPoly(linear, poly) {
    const result = Array(poly.length + 1).fill(0);
    for (let i = 0; i < linear.length; i += 1) {
      for (let j = 0; j < poly.length; j += 1) {
        result[i + j] += linear[i] * poly[j];
      }
    }
    return result;
  }

  function expandAroundC(coeffs, c) {
    const degree = coeffs.length - 1;
    const result = Array(degree + 1).fill(0);
    const choose = (n, r) => {
      if (r < 0 || r > n) return 0;
      let value = 1;
      for (let k = 1; k <= r; k += 1) {
        value = (value * (n - k + 1)) / k;
      }
      return value;
    };
    for (let i = 0; i < coeffs.length; i += 1) {
      const power = degree - i;
      const coef = coeffs[i];
      for (let j = 0; j <= power; j += 1) {
        const binom = choose(power, j);
        result[degree - j] += coef * binom * Math.pow(-c, power - j);
      }
    }
    return result;
  }

  function formatS131LinearFactor(c) {
    if (c === 0) return 'x';
    return `x${c > 0 ? '-' : '+'}${Math.abs(c)}`;
  }

  function formatS131ShiftBase(c) {
    if (c === 0) return 'x';
    return `(x${c > 0 ? '-' : '+'}${Math.abs(c)})`;
  }

  function formatS131ShiftPolynomial(coeffs, c) {
    const base = formatS131ShiftBase(c);
    const degree = coeffs.length - 1;
    const parts = [];
    coeffs.forEach((coef, index) => {
      if (coef === 0) return;
      const power = degree - index;
      const abs = Math.abs(coef);
      let body = '';
      if (power === 0) {
        body = `${abs}`;
      } else {
        const variableText = power === 1 ? base : `${base}^${power}`;
        body = abs === 1 ? variableText : `${abs}${variableText}`;
      }
      if (!parts.length) {
        parts.push(coef < 0 ? `-${body}` : body);
      } else {
        parts.push(coef < 0 ? `-${body}` : `+${body}`);
      }
    });
    return parts.join('') || '0';
  }

  function buildS131AxMinusBDivisionSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = [2, 3, 4][randInt(0, 2)];
      const b = pickNonZero(-5, 5);
      const q2 = pickNonZero(-3, 4);
      const q1 = randInt(-5, 5);
      const q0 = randInt(-6, 6);
      const r = randInt(-8, 8);
      const divisor = [a, b];
      const quotient = [q2, q1, q0];
      const dividend = addPolyCoeffs(multiplyLinearByPoly(divisor, quotient), [r]);
      const divisorText = formatPolynomialFromCoeffs(divisor);
      const dividendText = formatPolynomialFromCoeffs(dividend);
      const quotientText = formatPolynomialFromCoeffs(quotient);
      const remainderText = r < 0 ? `-${Math.abs(r)}` : `+${r}`;
      questions.push(`求 \\(${dividendText}\\) 除以 \\(${divisorText}\\) 的商式與餘式。`);
      answers.push(`簡答：商式 \\(${quotientText}\\)，餘式 ${r}。過程：此題除式首項係數不是 1，做綜合除法時若先用根 \\(x=${formatFraction(-b, a)}\\) 得到偽商，最後還要除以 ${a} 才是真正商式。檢查可得 \\(${dividendText}=(${divisorText})(${quotientText})${remainderText}\\)，所以答案如上。`);
    }
    return { questions, answers };
  }

  function buildS131SuccessiveDivisionTaylorSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)=8x^3+4x^2-16x+5\\)，將其表示成 \\((x-1)\\) 的降冪排列。',
        a: '簡答：\\(f(x)=8(x-1)^3+28(x-1)^2+16(x-1)+1\\)。過程：令 \\(u=x-1\\)，則 \\(x=u+1\\)。代入得 \\(8(u+1)^3+4(u+1)^2-16(u+1)+5=8u^3+28u^2+16u+1\\)。',
      },
      {
        q: '將 \\(f(x)=x^3-4x^2+7x-1\\) 改寫為 \\((x-2)\\) 的降冪形式，並估計 \\(f(2.003)\\) 到小數點後三位。',
        a: '簡答：\\(f(x)=(x-2)^3+2(x-2)^2+3(x-2)+5\\)，\\(f(2.003)\\approx5.009\\)。過程：令 \\(u=x-2\\)，代入 \\(x=u+2\\) 得 \\(u^3+2u^2+3u+5\\)。當 \\(x=2.003\\) 時 \\(u=0.003\\)，所以值約為 \\(5+3(0.003)+2(0.003)^2+(0.003)^3=5.009018027\\)，取到小數點後三位為 5.009。',
      },
      {
        q: '設 \\(f(x)=27x^3+36x^2+21x+4\\)，將其改寫為 \\(a(3x+2)^3+b(3x+2)^2+c(3x+2)+d\\)，求係數和 \\(a+b+c+d\\)。',
        a: '簡答：0。過程：令 \\(u=3x+2\\)，則 \\(x=\\frac{u-2}{3}\\)。代入後得 \\(f(x)=u^3-2u^2+3u-2\\)，所以 \\(a+b+c+d=1-2+3-2=0\\)。',
      },
      {
        q: '若 \\(f(x)=(x-2)^4+8(x-2)^3+15(x-2)^2+13(x-2)+9\\)，將其展開為 \\(x\\) 的多項式。',
        a: '簡答：\\(x^4-9x^2+17x-5\\)。過程：令 \\(u=x-2\\)，直接展開各項：\\((x-2)^4+8(x-2)^3+15(x-2)^2+13(x-2)+9=x^4-9x^2+17x-5\\)。',
      },
      {
        q: '設 \\(f(x)=16x^4+32x^3-8x^2-24x+5\\)，表示為 \\((2x+1)\\) 的泰勒形式。',
        a: '簡答：\\((2x+1)^4-8(2x+1)^2+12\\)。過程：令 \\(u=2x+1\\)，則 \\(x=\\frac{u-1}{2}\\)。代入整理得 \\(u^4-8u^2+12\\)，所以泰勒形式為 \\((2x+1)^4-8(2x+1)^2+12\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      if (i < templates.length && Math.random() < 0.5) {
        const item = templates[i % templates.length];
        questions.push(item.q);
        answers.push(item.a);
        continue;
      }
      const c = randInt(-3, 3);
      const a3 = pickNonZero(-3, 3);
      const a2 = randInt(-5, 5);
      const a1 = randInt(-6, 6);
      const a0 = randInt(-8, 8);
      const expanded = expandAroundC([a3, a2, a1, a0], c);
      const polyText = formatPolynomialFromCoeffs(expanded);
      const shift = formatS131ShiftBase(c);
      const shiftedPoly = formatS131ShiftPolynomial([a3, a2, a1, a0], c);
      if (type === 1) {
        const eps = 0.01;
        const approx = a0 + a1 * eps + a2 * eps * eps + a3 * eps * eps * eps;
        questions.push(`設 \\(f(x)=${polyText}\\)，已知其關於 \\(${shift}\\) 的降冪排列，估計 \\(f(${trimFixed(c + eps, 3)})\\) 到小數點後四位。`);
        answers.push(`簡答：約 ${trimFixed(approx, 4)}。過程：把 \\(x=${trimFixed(c + eps, 3)}\\) 寫成 \\(${shift}=0.01\\)。由降冪式 \\(f(x)=${shiftedPoly}\\)，代入 \\(${shift}=0.01\\) 得約 ${trimFixed(approx, 4)}。`);
        continue;
      }
      questions.push(`設 \\(f(x)=${polyText}\\)，將其表示為 \\(${shift}\\) 的降冪排列。`);
      answers.push(`簡答：\\(f(x)=${shiftedPoly}\\)。過程：連續除以 \\(${formatS131LinearFactor(c)}\\) 時，第一次餘式是常數項 ${a0}，第二次餘式是一次係數 ${a1}，再來是二次係數 ${a2}，最後最高次係數 ${a3}，所以得到上述降冪排列。`);
    }
    return { questions, answers };
  }

  function buildS131ProductSpecificCoefficientSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '求 \\((x^2-x+3)(5x^6+2x^5-3x^4+5x^2-1)\\) 展開式中 \\(x^3\\) 的係數。',
        a: '簡答：-5。過程：要得到 \\(x^3\\)，可檢查項次配對：\\(x^2\\) 需配一次項，但第二個多項式沒有一次項；\\(-x\\) 配 \\(5x^2\\) 得係數 \\(-5\\)；常數 3 需配三次項，但第二個多項式沒有三次項。所以 \\(x^3\\) 係數為 -5。',
      },
      {
        q: '求多項式 \\(x(x+1)(x+2)\\cdots(x+10)\\) 展開式中 \\(x^9\\) 項的係數。',
        a: '簡答：1320。過程：整體共有 11 個一次因式，其中一個常數為 0。\\(x^9\\) 項表示要從 11 個因式中選出 2 個常數項相乘，但含 0 的常數項不能選，所以係數為 \\(\\sum_{1\\leq i<j\\leq10}ij\\)。由 \\(\\frac{(1+\\cdots+10)^2-(1^2+\\cdots+10^2)}2=\\frac{55^2-385}{2}=1320\\)。',
      },
      {
        q: '求 \\((x^2-4x+3)(x^3+2x^2-4x+3)\\) 展開後所有項係數總和。',
        a: '簡答：0。過程：所有項係數總和等於把 \\(x=1\\) 代入。第一個括號 \\(1-4+3=0\\)，所以整個乘積在 \\(x=1\\) 的值為 0。',
      },
      {
        q: '設 \\(f(x)=(x^2+1)^3-(x^3+1)^2\\)，判斷其最高次項係數。',
        a: '簡答：3。過程：兩者的 \\(x^6\\) 項係數同為 1，會互相抵消。下一個最高次來自 \\((x^2+1)^3\\) 的 \\(3x^4\\)，而 \\((x^3+1)^2\\) 沒有 \\(x^4\\) 項，所以最高次項為 \\(3x^4\\)，係數為 3。',
      },
      {
        q: '已知 \\((x^2+ax+2)(x^3+2x^2-3x+1)\\) 展開式中 \\(x^3\\) 係數為 7，求 \\(a\\)。',
        a: '簡答：\\(a=4\\)。過程：\\(x^3\\) 項來自 \\(x^2\\cdot(-3x)\\)、\\(ax\\cdot2x^2\\)、\\(2\\cdot x^3\\)。係數為 \\(-3+2a+2=2a-1\\)。由 \\(2a-1=7\\)，得 \\(a=4\\)。',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131RemainderTransformationSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '設 \\(f(x)\\) 除以 \\((x-2)\\) 的商為 \\(Q(x)\\)、餘式為 5，求 \\(xf(x)\\) 除以 \\((x-2)\\) 的餘式。',
        a: '簡答：10。過程：由餘式定理，\\(f(2)=5\\)。要求 \\(xf(x)\\) 除以 \\(x-2\\) 的餘式，只要代入 \\(x=2\\)，得 \\(2f(2)=10\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\((3x-2)\\) 的餘式為 6，求 \\(f(\\frac{x}{3})\\) 除以 \\((x-2)\\) 的餘式。',
        a: '簡答：6。過程：除以 \\(3x-2\\) 的餘式為 6，表示 \\(f(\\frac23)=6\\)。而 \\(f(\\frac{x}{3})\\) 除以 \\(x-2\\) 的餘式為代入 \\(x=2\\)，即 \\(f(\\frac23)=6\\)。',
      },
      {
        q: '設 \\((x+1)f(x)\\) 除以 \\(x^2+x+1\\) 的餘式為 \\(5x+3\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(2x+5\\)。過程：在模 \\(x^2+x+1\\) 下，\\((x+1)(-x)=1\\)，所以 \\(x+1\\) 的反元素是 \\(-x\\)。因此 \\(f(x)\\) 的餘式為 \\((-x)(5x+3)=-5x^2-3x\\)。又 \\(x^2\\equiv-x-1\\)，得 \\(-5x^2-3x\\equiv5x+5-3x=2x+5\\)。',
      },
      {
        q: '若 \\(f(x)\\) 除以 \\((x-1)^2\\) 餘式為 \\(3x+2\\)，除以 \\((x-2)^2\\) 餘式為 \\(5x-3\\)，求除以 \\((x-1)(x-2)\\) 的餘式。',
        a: '簡答：\\(2x+3\\)。過程：設所求餘式為 \\(ax+b\\)。由第一個條件得 \\(f(1)=3(1)+2=5\\)，所以 \\(a+b=5\\)。由第二個條件得 \\(f(2)=5(2)-3=7\\)，所以 \\(2a+b=7\\)。解得 \\(a=2,b=3\\)，餘式為 \\(2x+3\\)。',
      },
      {
        q: '求 \\((3x+1)^{100}\\) 除以 \\((3x+2)\\) 的餘式。',
        a: '簡答：1。過程：除以 \\(3x+2\\) 時代入根 \\(x=-\\frac23\\)。此時 \\(3x+1=-1\\)，所以餘式為 \\((-1)^{100}=1\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\(2x-3\\) 的商為 \\(Q(x)\\)、餘式為 \\(r\\)，求 \\(f(x)\\) 除以 \\(x-\\frac32\\) 的商式與餘式。',
        a: '簡答：商式 \\(2Q(x)\\)，餘式 \\(r\\)。過程：因為 \\(2x-3=2(x-\\frac32)\\)，若 \\(f(x)=(2x-3)Q(x)+r\\)，則 \\(f(x)=(x-\\frac32)[2Q(x)]+r\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\(ax-b\\) 的商為 \\(q(x)\\)、餘式為 \\(r\\)，求 \\(xf(x)\\) 除以 \\(x-\\frac{b}{a}\\) 的餘式。',
        a: '簡答：\\(\\frac{br}{a}\\)。過程：由 \\(ax-b=0\\) 得 \\(x=\\frac ba\\)，且 \\(f(\\frac ba)=r\\)。所以 \\(xf(x)\\) 除以 \\(x-\\frac ba\\) 的餘式為 \\(\\frac ba\\cdot r=\\frac{br}{a}\\)。',
      },
      {
        q: '若 \\(f(x)\\) 除以 \\(ax+b\\) 的商為 \\(Q(x)\\)、餘式為 \\(r\\)，求 \\(f(\\frac{x}{a})\\) 除以 \\(x+b\\) 的餘式。',
        a: '簡答：\\(r\\)。過程：除以 \\(x+b\\) 代入 \\(x=-b\\)，得到 \\(f(-\\frac ba)\\)。而 \\(ax+b=0\\) 的根也是 \\(-\\frac ba\\)，所以餘式仍為 \\(r\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(g(x)\\) 的商為 \\(q(x)\\)、餘式為 \\(r(x)\\)，求 \\(3f(x)\\) 除以 \\(4g(x)\\) 的商式與餘式。',
        a: '簡答：商式 \\(\\frac34q(x)\\)，餘式 \\(3r(x)\\)。過程：由 \\(f(x)=g(x)q(x)+r(x)\\)，得 \\(3f(x)=4g(x)\\cdot\\frac34q(x)+3r(x)\\)。若 \\(3r(x)\\) 次數小於 \\(g(x)\\)，也小於 \\(4g(x)\\)，因此餘式為 \\(3r(x)\\)。',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131HighPowerRemainderSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '求 \\(x^{12}\\) 除以 \\((x+1)^2\\) 的餘式。',
        a: '簡答：\\(-12x-11\\)。過程：除以 \\((x+1)^2\\) 的餘式設為 \\(ax+b\\)，需與 \\(x^{12}\\) 在 \\(x=-1\\) 的函數值與導數值相同。\\(r(-1)=1\\)、\\(r\'(-1)=12(-1)^{11}=-12\\)，所以 \\(a=-12\\)，\\(-a+b=1\\)，得 \\(b=-11\\)。',
      },
      {
        q: '求 \\(x^{2000}-3x^{90}+5x^{18}-7\\) 除以 \\((x^3-1)\\) 的餘式。',
        a: '簡答：\\(x^2-5\\)。過程：在模 \\(x^3-1\\) 下，\\(x^3\\equiv1\\)。因為 \\(2000\\equiv2\\pmod3\\)，\\(90,18\\) 都是 3 的倍數，所以餘式為 \\(x^2-3+5-7=x^2-5\\)。',
      },
      {
        q: '計算 \\(13^{10}-13^4+1\\) 除以 \\((13^2-13+1)\\) 的餘數。',
        a: '簡答：1。過程：令 \\(t=13\\)，由 \\(t^2-t+1=0\\) 得 \\(t^3\\equiv-1\\)、\\(t^6\\equiv1\\)。所以 \\(t^{10}=t^6t^4\\equiv t^4\\)，原式 \\(t^{10}-t^4+1\\equiv1\\)。因此餘數為 1。',
      },
      {
        q: '求 \\(x^{100}+1\\) 除以 \\((x-1)^2\\) 的餘式。',
        a: '簡答：\\(100x-98\\)。過程：設餘式為 \\(ax+b\\)。需滿足 \\(r(1)=1^{100}+1=2\\)，且 \\(r\'(1)=100\\)。故 \\(a=100\\)，\\(100+b=2\\)，得 \\(b=-98\\)。',
      },
      {
        q: '已知 \\(f(x)=x^{32}-3x^{24}+3x^{14}-2\\)，求其除以 \\((x^2+x+1)\\) 的餘式。',
        a: '簡答：\\(-4x-9\\)。過程：在模 \\(x^2+x+1\\) 下，\\(x^3\\equiv1\\)。所以 \\(x^{32}\\equiv x^2\\)、\\(x^{24}\\equiv1\\)、\\(x^{14}\\equiv x^2\\)。原式餘式為 \\(x^2-3+3x^2-2=4x^2-5\\)。再用 \\(x^2\\equiv-x-1\\)，得 \\(-4x-9\\)。',
      },
      {
        q: '求 \\(x^{12}\\) 除以 \\((x+1)^2\\) 的餘式，並以此計算 \\(9^{12}\\) 除以 100 的餘數。',
        a: '簡答：餘式 \\(-12x-11\\)，餘數 81。過程：除以 \\((x+1)^2\\) 的餘式為 \\(-12x-11\\)。因為 100\\(=(9+1)^2\\)，代入 \\(x=9\\) 得 \\(-108-11=-119\\)，除以 100 的餘數為 81。',
      },
      {
        q: '證明 \\(8^{20}-5^{20}\\) 是 3 的倍數。',
        a: '簡答：是 3 的倍數。過程：因為 \\(8\\equiv5\\equiv2\\pmod3\\)，所以 \\(8^{20}-5^{20}\\equiv2^{20}-2^{20}\\equiv0\\pmod3\\)。',
      },
      {
        q: '計算 \\(13^{10}-13^4+1\\) 除以 \\(13^2-13+1\\) 的餘數。',
        a: '簡答：1。過程：令 \\(t=13\\)。在模 \\(t^2-t+1\\) 下，\\(t^3\\equiv-1\\)，所以 \\(t^6\\equiv1\\)。因此 \\(t^{10}\\equiv t^4\\)，原式 \\(t^{10}-t^4+1\\equiv1\\)。',
      },
      {
        q: '利用除法原理求 \\(23756108^{12}\\) 除以 \\(101\\) 的餘數。',
        a: '簡答：56。過程：先把底數化小，\\(23756108\\equiv35\\pmod{101}\\)。依序平方得 \\(35^2\\equiv13\\)，\\(35^4\\equiv68\\)，\\(35^8\\equiv79\\)。所以 \\(35^{12}=35^8\\cdot35^4\\equiv79\\cdot68=5372\\equiv56\\pmod{101}\\)。',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131DivisionRemainderFiveSubtypeMixedSet(count) {
    const banks = [
      buildS131AxMinusBDivisionSet,
      buildS131SuccessiveDivisionTaylorSet,
      buildS131ProductSpecificCoefficientSet,
      buildS131RemainderTransformationSet,
      buildS131HighPowerRemainderSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, answers };
  }

  function buildS131ComplexRootRemainderSet(count) {
    const templates = [
      {
        q: '求 \\(x^{100}+x^{50}+1\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：0。過程：由 \\(x^2+x+1=0\\) 得 \\(x^3\\equiv1\\)。因為 \\(100\\equiv1\\pmod3\\)，\\(50\\equiv2\\pmod3\\)，所以 \\(x^{100}+x^{50}+1\\equiv x+x^2+1=0\\)。',
      },
      {
        q: '求 \\(x^{81}+x^{49}+x^9\\) 除以 \\(x^2-x+1\\) 的餘式。',
        a: '簡答：\\(x-2\\)。過程：由 \\(x^2-x+1=0\\) 得 \\(x^3\\equiv-1\\)，所以週期為 6。\\(81\\equiv3\\)、\\(49\\equiv1\\)、\\(9\\equiv3\\pmod6\\)，故 \\(x^{81}+x^{49}+x^9\\equiv x^3+x+x^3\\equiv -1+x-1=x-2\\)。',
      },
      {
        q: '求 \\(x^{2006}-1\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-x-2\\)。過程：由 \\(x^2+x+1=0\\) 得 \\(x^3\\equiv1\\)。因為 \\(2006\\equiv2\\pmod3\\)，所以 \\(x^{2006}-1\\equiv x^2-1\\)。再用 \\(x^2\\equiv-x-1\\)，得餘式 \\(-x-2\\)。',
      },
      {
        q: '求 \\(x^{12}\\) 除以 \\(x^2+1\\) 的餘式。',
        a: '簡答：1。過程：由 \\(x^2+1=0\\) 得 \\(x^2\\equiv-1\\)，所以 \\(x^{12}=(x^2)^6\\equiv(-1)^6=1\\)。',
      },
      {
        q: '已知 \\(f(x)=x^{32}-3x^{24}+3x^{14}-2\\)，求其除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-4x-9\\)。過程：由 \\(x^2+x+1=0\\) 得 \\(x^3\\equiv1\\)。所以 \\(x^{32}\\equiv x^2\\)、\\(x^{24}\\equiv1\\)、\\(x^{14}\\equiv x^2\\)。原式餘式為 \\(4x^2-5\\)，再用 \\(x^2\\equiv-x-1\\)，得 \\(-4x-9\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131CompositionRemainderSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)=x^3-2x^2-x+5\\)，求 \\(f(f(x))\\) 除以 \\(x-2\\) 的餘式。',
        a: '簡答：11。過程：除以 \\(x-2\\) 的餘式等於代入 \\(x=2\\)。先算 \\(f(2)=8-8-2+5=3\\)，所以 \\(f(f(2))=f(3)=27-18-3+5=11\\)。',
      },
      {
        q: '設 \\(f(x)=x^2-x+2\\)，\\(g(x)=f(f(x))\\)，求 \\(g(x)\\) 除以 \\(x-2\\) 的餘式。',
        a: '簡答：14。過程：餘式為 \\(g(2)=f(f(2))\\)。\\(f(2)=4-2+2=4\\)，\\(f(4)=16-4+2=14\\)。',
      },
      {
        q: '已知 \\(f(1)=2\\)、\\(f(2)=7\\)，求 \\(f(f(x))\\) 除以 \\(x-1\\) 的餘式。',
        a: '簡答：7。過程：除以 \\(x-1\\) 的餘式為代入 \\(x=1\\)。因此 \\(f(f(1))=f(2)=7\\)。',
      },
      {
        q: '設 \\(f(x)=x^3-2x^2+x+2\\)，求 \\(f(f(x))\\) 除以 \\(x-2\\) 的餘式。',
        a: '簡答：38。過程：餘式為 \\(f(f(2))\\)。先算 \\(f(2)=8-8+2+2=4\\)，再算 \\(f(4)=64-32+4+2=38\\)。',
      },
      {
        q: '若 \\(f(1)=3\\)、\\(f(3)=5\\)，求 \\(f(f(x))\\) 除以 \\(x-1\\) 的餘式。',
        a: '簡答：5。過程：除以 \\(x-1\\) 的餘式為 \\(f(f(1))\\)。由 \\(f(1)=3\\)，再用 \\(f(3)=5\\)，所以餘式為 5。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131SquareDivisorRemainderSet(count) {
    const templates = [
      {
        q: '求 \\(x^{20}+2\\) 除以 \\((x-1)^2\\) 的餘式。',
        a: '簡答：\\(20x-17\\)。過程：設餘式為 \\(ax+b\\)。除以 \\((x-1)^2\\) 時，要同時符合函數值與導數值：\\(r(1)=1^{20}+2=3\\)，\\(r\'(1)=20\\)。故 \\(a=20\\)，\\(20+b=3\\)，得 \\(b=-17\\)。',
      },
      {
        q: '設 \\(ax^8+bx^7+1\\) 能被 \\((x-1)^2\\) 整除，求數對 \\((a,b)\\)。',
        a: '簡答：\\((a,b)=(7,-8)\\)。過程：能被 \\((x-1)^2\\) 整除，表示 \\(P(1)=0\\) 且 \\(P\'(1)=0\\)。所以 \\(a+b+1=0\\)，\\(8a+7b=0\\)。解得 \\(a=7,b=-8\\)。',
      },
      {
        q: '求 \\(x^{100}+1\\) 除以 \\((x-1)^2\\) 的餘式。',
        a: '簡答：\\(100x-98\\)。過程：設餘式為 \\(ax+b\\)。\\(r(1)=2\\)，且 \\(r\'(1)=100\\)，所以 \\(a=100\\)、\\(100+b=2\\)，得 \\(b=-98\\)。',
      },
      {
        q: '設 \\((x+1)^n(x^2+ax+b)\\) 除以 \\((x-1)^2\\) 的餘式為 \\(2^n(x-1)\\)，求 \\(a,b\\)。',
        a: '簡答：\\(a=-1,b=0\\)。過程：令 \\(P(x)=(x+1)^n(x^2+ax+b)\\)。餘式 \\(2^n(x-1)\\) 在 \\(x=1\\) 的值為 0，導數值為 \\(2^n\\)。由 \\(P(1)=2^n(1+a+b)=0\\)，得 \\(1+a+b=0\\)。又 \\(P\'(1)=2^n(2+a)=2^n\\)，得 \\(a=-1\\)，所以 \\(b=0\\)。',
      },
      {
        q: '若 \\(f(x)\\) 除以 \\((x-1)^2\\) 餘式為 \\(3x+2\\)，求 \\(f(x)\\) 在 \\(x=1\\) 的值與導數值。',
        a: '簡答：\\(f(1)=5,\\ f\'(1)=3\\)。過程：除以 \\((x-1)^2\\) 的餘式保留在 \\(x=1\\) 的函數值與導數值。餘式 \\(r(x)=3x+2\\)，所以 \\(f(1)=r(1)=5\\)，\\(f\'(1)=r\'(1)=3\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131StepwiseRemainderConstructionSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)\\) 除以 \\(x-1,x-2,x-3\\) 的餘式分別為 3,7,13，求 \\(f(x)\\) 除以 \\((x-1)(x-2)(x-3)\\) 的餘式。',
        a: '簡答：\\(x^2+x+1\\)。過程：設餘式為 \\(ax^2+bx+c\\)。由 \\(r(1)=3,r(2)=7,r(3)=13\\)，解得 \\(a=1,b=1,c=1\\)，故餘式為 \\(x^2+x+1\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2+x+1\\) 餘 \\(7x+16\\)，且除以 \\(x-1\\) 餘 8，求 \\(f(x)\\) 除以 \\(x^3-1\\) 的餘式。',
        a: '簡答：\\(-5x^2+2x+11\\)。過程：因為 \\(x^3-1=(x-1)(x^2+x+1)\\)，設餘式為 \\(7x+16+k(x^2+x+1)\\)。代入 \\(x=1\\) 得 \\(23+3k=8\\)，所以 \\(k=-5\\)，餘式為 \\(-5x^2+2x+11\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\((x-1)(x-2)\\) 餘 \\(2x+5\\)，除以 \\((x-2)(x-3)\\) 餘 \\(4x+1\\)，求除以 \\((x-1)(x-2)(x-3)\\) 的餘式。',
        a: '簡答：\\(x^2-x+7\\)。過程：由第一個餘式得 \\(f(1)=7,f(2)=9\\)；由第二個餘式得 \\(f(2)=9,f(3)=13\\)。設 \\(r(x)=ax^2+bx+c\\)，使 \\(r(1)=7,r(2)=9,r(3)=13\\)，解得 \\(r(x)=x^2-x+7\\)。',
      },
      {
        q: '已知 \\(f(1)=3,f(-1)=1,f(2)=7\\)，求 \\(f(x)\\) 除以 \\((x-1)(x+1)(x-2)\\) 的餘式。',
        a: '簡答：\\(x^2+x+1\\)。過程：設餘式為 \\(ax^2+bx+c\\)。代入三個根得 \\(a+b+c=3\\)、\\(a-b+c=1\\)、\\(4a+2b+c=7\\)。解得 \\(a=1,b=1,c=1\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2-1\\) 餘 \\(-x+4\\)，求 \\(f(1)\\) 與 \\(f(-1)\\)。',
        a: '簡答：\\(f(1)=3,\\ f(-1)=5\\)。過程：\\(x^2-1=(x-1)(x+1)\\)。餘式 \\(-x+4\\) 在根上的值就是原多項式在根上的值，所以 \\(f(1)=3\\)，\\(f(-1)=5\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131CoefficientTransformRemainderSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)\\) 除以 \\(3x-2\\) 的商為 \\(q(x)\\)、餘式為 5，求 \\(xf(x)\\) 除以 \\(x-\\frac23\\) 的餘式。',
        a: '簡答：\\(\\frac{10}{3}\\)。過程：除以 \\(3x-2\\) 餘 5 表示 \\(f(\\frac23)=5\\)。所以 \\(xf(x)\\) 除以 \\(x-\\frac23\\) 的餘式為 \\(\\frac23\\cdot5=\\frac{10}{3}\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(2x-3\\) 的餘式為 7，求 \\(f(3x)\\) 除以 \\(2x-1\\) 的餘式。',
        a: '簡答：7。過程：\\(2x-3=0\\) 的根為 \\(\\frac32\\)，所以 \\(f(\\frac32)=7\\)。要求 \\(f(3x)\\) 除以 \\(2x-1\\) 的餘式，代入 \\(x=\\frac12\\)，得 \\(f(\\frac32)=7\\)。',
      },
      {
        q: '設 \\((x+1)f(x)\\) 除以 \\(x^2+x+1\\) 的餘式為 \\(5x+3\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(2x+5\\)。過程：在模 \\(x^2+x+1\\) 下，\\((x+1)(-x)=1\\)。因此 \\(f(x)\\equiv -x(5x+3)=-5x^2-3x\\)。又 \\(x^2\\equiv-x-1\\)，得餘式 \\(2x+5\\)。',
      },
      {
        q: '已知 \\(xf(x)\\) 除以 \\(x^2+x+1\\) 的餘式為 \\(3x+2\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-2x+1\\)。過程：在模 \\(x^2+x+1\\) 下，\\(x^{-1}\\equiv x^2\\equiv-x-1\\)。所以 \\(f(x)\\equiv(3x+2)(-x-1)=-3x^2-5x-2\\equiv-2x+1\\)。',
      },
      {
        q: '設 \\(f(x)=x^4+3x^2-2x-1\\)，求 \\(g(x)=f(2x-3)\\) 除以 \\(2x-1\\) 的餘式。',
        a: '簡答：31。過程：除以 \\(2x-1\\) 時代入 \\(x=\\frac12\\)。此時 \\(2x-3=-2\\)，所以餘式為 \\(f(-2)=16+12+4-1=31\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\(2x-3\\) 的商為 \\(Q(x)\\)、餘式為 \\(r\\)，求 \\(3f(x)\\) 除以 \\(4(2x-3)\\) 的商式與餘式。',
        a: '簡答：商式 \\(\\frac34Q(x)\\)，餘式 \\(3r\\)。過程：由 \\(f(x)=(2x-3)Q(x)+r\\)，得 \\(3f(x)=4(2x-3)\\cdot\\frac34Q(x)+3r\\)。所以商式為 \\(\\frac34Q(x)\\)，餘式為 \\(3r\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\(ax-b\\) 的商為 \\(q(x)\\)、餘式為 \\(r\\)，求 \\(xf(x)\\) 除以 \\(x-\\frac ba\\) 的餘式。',
        a: '簡答：\\(\\frac{br}{a}\\)。過程：由 \\(ax-b=0\\) 得 \\(x=\\frac ba\\)，且 \\(f(\\frac ba)=r\\)。所以 \\(xf(x)\\) 的餘式為 \\(\\frac ba\\cdot r=\\frac{br}{a}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131RemainderOperationsSet(count) {
    const templates = [
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2-x-1\\) 餘 \\(2x+1\\)，\\(g(x)\\) 除以同一除式餘 \\(x-3\\)，求 \\(f(x)+g(x)\\) 的餘式。',
        a: '簡答：\\(3x-2\\)。過程：同一除式下，加法的餘式可直接相加：\\((2x+1)+(x-3)=3x-2\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2-x-1\\) 餘 \\(2x+1\\)，\\(g(x)\\) 除以同一除式餘 \\(x-3\\)，求 \\(2f(x)-3g(x)\\) 的餘式。',
        a: '簡答：\\(x+11\\)。過程：餘式可做同樣線性組合，\\(2(2x+1)-3(x-3)=4x+2-3x+9=x+11\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2-x-1\\) 餘 \\(2x+1\\)，\\(g(x)\\) 除以同一除式餘 \\(x-3\\)，求 \\(f(x)g(x)\\) 的餘式。',
        a: '簡答：\\(-3x-1\\)。過程：先乘餘式：\\((2x+1)(x-3)=2x^2-5x-3\\)。由 \\(x^2\\equiv x+1\\)，得 \\(2x^2-5x-3\\equiv2(x+1)-5x-3=-3x-1\\)。',
      },
      {
        q: '若 \\(f(x)\\) 除以 \\(x-2\\) 餘 5，\\(g(x)\\) 除以 \\(x-2\\) 餘 3，求 \\((f(x))^2+(g(x))^2\\) 除以 \\(x-2\\) 的餘式。',
        a: '簡答：34。過程：代入 \\(x=2\\)，得 \\(f(2)=5,g(2)=3\\)，所以餘式為 \\(5^2+3^2=34\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 被 \\(g(x)\\) 除餘 \\(r(x)\\)，求 \\(3f(x)\\) 被 \\(g(x)\\) 除的餘式。',
        a: '簡答：\\(3r(x)\\)。過程：若 \\(f(x)=g(x)Q(x)+r(x)\\)，則 \\(3f(x)=g(x)[3Q(x)]+3r(x)\\)。只要 \\(3r(x)\\) 的次數仍小於 \\(g(x)\\) 的次數，它就是餘式。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131LowToHighRemainderSet(count) {
    const templates = [
      {
        q: '已知 \\(f(x)\\) 除以 \\(x-1\\) 餘 9，除以 \\(x-2\\) 餘 16，求 \\(f(x)\\) 除以 \\((x-1)(x-2)\\) 的餘式。',
        a: '簡答：\\(7x+2\\)。過程：設餘式為 \\(ax+b\\)。由 \\(r(1)=9,r(2)=16\\)，得 \\(a+b=9\\)、\\(2a+b=16\\)，解得 \\(a=7,b=2\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x-1\\) 餘 2，除以 \\(x+2\\) 餘 -4，求 \\(f(x)\\) 除以 \\(x^2+x-2\\) 的餘式。',
        a: '簡答：\\(2x\\)。過程：\\(x^2+x-2=(x-1)(x+2)\\)。設餘式 \\(ax+b\\)，由 \\(r(1)=2,r(-2)=-4\\)，解得 \\(a=2,b=0\\)。',
      },
      {
        q: '已知多項式除以 \\(x^2-5x+4\\) 餘 \\(x+2\\)，除以 \\(x^2-5x+6\\) 餘 \\(3x+4\\)，求除以 \\(x^2-4x+3\\) 的餘式。',
        a: '簡答：\\(5x-2\\)。過程：三個二次式的根分別給出 \\(f(1)=3,f(4)=6\\) 與 \\(f(2)=10,f(3)=13\\)。要求除以 \\(x^2-4x+3=(x-1)(x-3)\\)，設餘式 \\(ax+b\\)，由 \\(r(1)=3,r(3)=13\\)，得 \\(r(x)=5x-2\\)。',
      },
      {
        q: '若 \\(f(1)=3,f(-1)=5\\)，求 \\(f(x)\\) 除以 \\(x^2-1\\) 的餘式。',
        a: '簡答：\\(-x+4\\)。過程：設餘式為 \\(ax+b\\)。由 \\(a+b=3\\)、\\(-a+b=5\\)，解得 \\(a=-1,b=4\\)。',
      },
      {
        q: '若 \\(f(x)\\) 分別除以 \\(x-1,x-2,x-3\\) 的餘式為 5,10,17，求除以 \\((x-1)(x-2)(x-3)\\) 的餘式。',
        a: '簡答：\\(x^2+2x+2\\)。過程：設餘式為 \\(ax^2+bx+c\\)。代入 \\(x=1,2,3\\)，得 \\(a+b+c=5\\)、\\(4a+2b+c=10\\)、\\(9a+3b+c=17\\)。解得 \\(a=1,b=2,c=2\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131TransformedDividendRemainderSet(count) {
    const templates = [
      {
        q: '已知 \\((x+1)f(x)\\) 除以 \\(x^2+x+1\\) 餘 \\(5x+3\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(2x+5\\)。過程：在模 \\(x^2+x+1\\) 下，\\((x+1)(-x)=1\\)，所以 \\(f(x)\\equiv -x(5x+3)=-5x^2-3x\\equiv2x+5\\)。',
      },
      {
        q: '已知 \\(xf(x)\\) 除以 \\(x^2+x+1\\) 的餘式為 \\(3x+2\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-2x+1\\)。過程：在模 \\(x^2+x+1\\) 下，\\(x^{-1}\\equiv x^2\\equiv-x-1\\)。因此 \\(f(x)\\equiv(3x+2)(-x-1)\\equiv-2x+1\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(3x-2\\) 餘 4，求 \\(xf(x)\\) 除以 \\(x-\\frac23\\) 的餘式。',
        a: '簡答：\\(\\frac{8}{3}\\)。過程：由題意 \\(f(\\frac23)=4\\)。所以 \\(xf(x)\\) 除以 \\(x-\\frac23\\) 的餘式為 \\(\\frac23\\cdot4=\\frac83\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\(2x-3\\) 餘 5，求 \\(f(3x)\\) 除以 \\(2x-1\\) 的餘式。',
        a: '簡答：5。過程：除以 \\(2x-1\\) 代入 \\(x=\\frac12\\)，得 \\(f(3x)=f(\\frac32)\\)。而 \\(2x-3=0\\) 的根正是 \\(\\frac32\\)，所以餘式為 5。',
      },
      {
        q: '設 \\(f(x)=x^4+3x^2-2x-1\\)，求 \\(f(2x-3)\\) 除以 \\(2x-1\\) 的餘式。',
        a: '簡答：31。過程：代入 \\(x=\\frac12\\)，此時 \\(2x-3=-2\\)。所以餘式為 \\(f(-2)=16+12+4-1=31\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131SquareDivisorCalculationSet(count) {
    const templates = [
      {
        q: '求 \\(x^{12}\\) 除以 \\((x+1)^2\\) 的餘式。',
        a: '簡答：\\(-12x-11\\)。過程：設餘式 \\(ax+b\\)。在 \\(x=-1\\) 處函數值為 1，導數值為 \\(-12\\)，所以 \\(a=-12\\)，\\(-a+b=1\\)，得 \\(b=-11\\)。',
      },
      {
        q: '以 \\((x-1)^2\\) 除 \\(x^{100}+1\\) 的餘式為何？',
        a: '簡答：\\(100x-98\\)。過程：設餘式為 \\(ax+b\\)。由 \\(r(1)=2\\)、\\(r\'(1)=100\\)，得 \\(a=100,b=-98\\)。',
      },
      {
        q: '設 \\(ax^8+bx^7+1\\) 能被 \\((x-1)^2\\) 整除，求 \\((a,b)\\)。',
        a: '簡答：\\((7,-8)\\)。過程：令 \\(P(x)=ax^8+bx^7+1\\)。整除表示 \\(P(1)=0\\)、\\(P\'(1)=0\\)。因此 \\(a+b+1=0\\)、\\(8a+7b=0\\)，解得 \\((a,b)=(7,-8)\\)。',
      },
      {
        q: '設 \\((x+1)^n(x^2+ax+b)\\) 除以 \\((x-1)^2\\) 的餘式為 \\(2^n(x-1)\\)，求 \\(a,b\\)。',
        a: '簡答：\\(a=-1,b=0\\)。過程：在 \\(x=1\\) 比較函數值與導數值。\\(P(1)=0\\) 得 \\(1+a+b=0\\)；\\(P\'(1)=2^n\\) 得 \\(2+a=1\\)。所以 \\(a=-1,b=0\\)。',
      },
      {
        q: '若 \\(f(x)\\) 除以 \\((x-1)^2\\) 餘 \\(3x+2\\)，除以 \\((x-2)^2\\) 餘 \\(5x-3\\)，求 \\(f(x)\\) 除以 \\((x-1)(x-2)\\) 的餘式。',
        a: '簡答：\\(2x+3\\)。過程：只需保留 \\(x=1,2\\) 的值。由第一個餘式得 \\(f(1)=5\\)，由第二個餘式得 \\(f(2)=7\\)。設餘式 \\(ax+b\\)，解 \\(a+b=5,2a+b=7\\)，得 \\(2x+3\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131SpecialXnRemainderSet(count) {
    const templates = [
      {
        q: '求 \\(x^{2000}-3x^{90}+5x^{18}-7\\) 除以 \\(x^3-1\\) 的餘式。',
        a: '簡答：\\(x^2-5\\)。過程：由 \\(x^3\\equiv1\\)，得 \\(x^{2000}\\equiv x^2\\)，\\(x^{90}\\equiv1\\)，\\(x^{18}\\equiv1\\)。所以餘式為 \\(x^2-3+5-7=x^2-5\\)。',
      },
      {
        q: '求 \\(x^{10}+2x^9+1\\) 除以 \\(x^2+x-2\\) 的餘式。',
        a: '簡答：\\(x+3\\)。過程：\\(x^2+x-2=(x-1)(x+2)\\)。設餘式 \\(ax+b\\)。代入 \\(x=1\\) 得值 4，代入 \\(x=-2\\) 得值 1，所以 \\(a+b=4\\)、\\(-2a+b=1\\)，解得 \\(a=1,b=3\\)。',
      },
      {
        q: '已知 \\(f(x)=x^{32}-3x^{24}+3x^{14}-2\\)，求其除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-4x-9\\)。過程：由 \\(x^3\\equiv1\\)，得 \\(x^{32}\\equiv x^2\\)，\\(x^{24}\\equiv1\\)，\\(x^{14}\\equiv x^2\\)。所以餘式為 \\(4x^2-5\\equiv-4x-9\\)。',
      },
      {
        q: '求 \\(x^{2006}-1\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-x-2\\)。過程：由 \\(x^3\\equiv1\\)，且 \\(2006\\equiv2\\pmod3\\)，得 \\(x^{2006}-1\\equiv x^2-1\\equiv-x-2\\)。',
      },
      {
        q: '求 \\(x^8+x^4+1\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：0。過程：由 \\(x^3\\equiv1\\)，得 \\(x^8\\equiv x^2\\)、\\(x^4\\equiv x\\)。所以 \\(x^8+x^4+1\\equiv x^2+x+1=0\\)。',
      },
      {
        q: '求 \\(x^{100}+x^{50}+1\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：0。過程：由 \\(x^3\\equiv1\\)，且 \\(100\\equiv1\\)、\\(50\\equiv2\\pmod3\\)，所以原式餘式為 \\(x+x^2+1=0\\)。',
      },
      {
        q: '求 \\(x^{81}+x^{49}+x^9\\) 除以 \\(x^2-x+1\\) 的餘式。',
        a: '簡答：\\(x-2\\)。過程：由 \\(x^2-x+1=0\\) 得 \\(x^3\\equiv-1\\)、\\(x^6\\equiv1\\)。因此 \\(x^{81}\\equiv x^3\\equiv-1\\)，\\(x^{49}\\equiv x\\)，\\(x^9\\equiv x^3\\equiv-1\\)，餘式為 \\(x-2\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131RecoverDividendFromQuotientSet(count) {
    const templates = [
      {
        q: '若多項式 \\(f(x)\\) 除以 \\(x-2\\) 的商式為 \\(x^2+2x-1\\)，餘式為 5，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=x^3-5x+7\\)。過程：由除法原理，\\(f(x)=(x-2)(x^2+2x-1)+5\\)。展開得 \\(x^3-5x+2+5=x^3-5x+7\\)。',
      },
      {
        q: '已知 \\(x^3+4x^2+7x+3\\) 除以 \\(f(x)\\) 的商式為 \\(x+2\\)，餘式為 \\(2x+1\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=x^2+2x+1\\)。過程：由 \\(x^3+4x^2+7x+3=f(x)(x+2)+(2x+1)\\)，得 \\(f(x)(x+2)=x^3+4x^2+5x+2\\)。除以 \\(x+2\\) 得 \\(f(x)=x^2+2x+1\\)。',
      },
      {
        q: '設 \\(2x^3-3x^2+ax+10\\) 除以 \\(x^2-3x+b\\) 的商式為 \\(2x+c\\)，餘式為 \\(3x-2\\)，求數對 \\((a,b,c)\\)。',
        a: '簡答：\\((a,b,c)=(2,4,3)\\)。過程：由除法原理，\\(2x^3-3x^2+ax+10=(x^2-3x+b)(2x+c)+(3x-2)\\)。比較係數得 \\(c-6=-3\\)，所以 \\(c=3\\)；\\(bc-2=10\\)，所以 \\(b=4\\)；\\(a=2b-3c+3=2\\)。',
      },
      {
        q: '若 \\(f(x)=(2x^2+x-2)q(x)+(2x+3)\\)，且 \\(f(x)=4x^3-3x+5\\)，求 \\(q(x)\\)。',
        a: '簡答：\\(q(x)=2x-1\\)。過程：先移去餘式，\\((2x^2+x-2)q(x)=4x^3-3x+5-(2x+3)=4x^3-5x+2\\)。再除以 \\(2x^2+x-2\\)，得 \\(q(x)=2x-1\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2-x+1\\) 的商式為 \\(x^2+x+1\\)，餘式為 \\(x-1\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=x^4+x^2+x\\)。過程：由除法原理，\\(f(x)=(x^2-x+1)(x^2+x+1)+(x-1)\\)。前一乘積為 \\(x^4+x^2+1\\)，再加上 \\(x-1\\)，得 \\(x^4+x^2+x\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131DivisibilityUnknownCoefficientSet(count) {
    const templates = [
      {
        q: '若 \\(x^3-3x^2+mx+2\\) 可被 \\(x^2+nx+1\\) 整除，求數對 \\((m,n)\\)。',
        a: '簡答：\\((m,n)=(-9,-5)\\)。過程：因為三次式除以二次式整除，商式可設為 \\(x+a\\)。比較常數項得 \\(a=2\\)。展開 \\((x^2+nx+1)(x+2)\\)，由 \\(x^2\\) 係數得 \\(n+2=-3\\)，所以 \\(n=-5\\)；一次項係數為 \\(2n+1=-9\\)，故 \\(m=-9\\)。',
      },
      {
        q: '已知 \\(2x^3-5x^2+8x+a\\) 是 \\(x^2-4x+b\\) 的倍式，求 \\(a,b\\) 之值。',
        a: '簡答：\\(a=30,b=10\\)。過程：商式設為 \\(2x+c\\)。展開 \\((x^2-4x+b)(2x+c)\\)，由 \\(x^2\\) 係數得 \\(c-8=-5\\)，所以 \\(c=3\\)。一次項係數 \\(2b-4c=8\\)，得 \\(b=10\\)。常數項 \\(bc=30\\)，所以 \\(a=30\\)。',
      },
      {
        q: '設 \\(x^4-2x^3+7x^2+ax+10\\) 可被 \\(x^2-2x+b\\) 整除，求 \\(a+b\\)。',
        a: '簡答：1。過程：商式設為 \\(x^2+px+q\\)。比較 \\(x^3\\) 係數得 \\(p=0\\)。再由 \\(x^2\\) 與常數項得 \\(q+b=7\\)、\\(bq=10\\)。取整數解 \\((b,q)=(5,2)\\)，一次項係數 \\(a=-2q+bp=-4\\)。所以 \\(a+b=1\\)。',
      },
      {
        q: '若 \\(x^3+ax^2+3x-2\\) 可被 \\(x^2-x+2\\) 整除，求 \\(a\\)。',
        a: '簡答：\\(a=-2\\)。過程：商式設為 \\(x+q\\)。展開 \\((x^2-x+2)(x+q)=x^3+(q-1)x^2+(2-q)x+2q\\)。由一次項 \\(2-q=3\\) 得 \\(q=-1\\)，所以 \\(a=q-1=-2\\)，常數項也為 \\(-2\\)，相符。',
      },
      {
        q: '判斷 \\(x^3+6x^2-x-30\\) 是否能被 \\(x+3\\) 整除，並求其商式。',
        a: '簡答：能，商式為 \\(x^2+3x-10\\)。過程：代入 \\(x=-3\\)，得 \\(-27+54+3-30=0\\)，所以可被 \\(x+3\\) 整除。綜合除法係數 \\(1,6,-1,-30\\) 除以 \\(-3\\)，得商式 \\(x^2+3x-10\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131DivisionPrincipleReverseTwoSubtypeMixedSet(count) {
    const banks = [
      buildS131RecoverDividendFromQuotientSet,
      buildS131DivisibilityUnknownCoefficientSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, answers };
  }

  function buildS131InterpolationPolynomialFromPointsSet(count) {
    const templates = [
      {
        q: '求通過 \\((1,5),(2,6),(3,25)\\) 三點的最低次多項式 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=9x^2-26x+22\\)。過程：設 \\(f(x)=ax^2+bx+c\\)。代入三點得 \\(a+b+c=5\\)、\\(4a+2b+c=6\\)、\\(9a+3b+c=25\\)。相減得 \\(3a+b=1\\)、\\(5a+b=19\\)，所以 \\(a=9,b=-26,c=22\\)。',
      },
      {
        q: '已知三次多項式 \\(f(x)\\) 滿足 \\(f(1)=7,f(2)=6,f(3)=11,f(4)=28\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=x^3-3x^2+x+8\\)。過程：設 \\(f(x)=ax^3+bx^2+cx+d\\)。代入四個條件並相減，可得三階差為 6，所以 \\(a=1\\)。再解得 \\(b=-3,c=1,d=8\\)。',
      },
      {
        q: '求通過 \\((11,3),(12,5),(13,8)\\) 三點的最低次多項式。',
        a: '簡答：\\(f(x)=\\frac12(x-11)^2+\\frac32(x-11)+3\\)。過程：令 \\(t=x-11\\)，三點變成 \\((0,3),(1,5),(2,8)\\)。設 \\(f=at^2+bt+c\\)，得 \\(c=3\\)、\\(a+b=2\\)、\\(4a+2b=5\\)，所以 \\(a=\\frac12,b=\\frac32\\)。',
      },
      {
        q: '已知三次多項式圖形經過 \\((-1,1),(0,5),(1,3),(2,1)\\)，求此多項式。',
        a: '簡答：\\(f(x)=\\frac23x^3-3x^2-\\frac83x+5\\)。過程：設 \\(f(x)=ax^3+bx^2+cx+d\\)。由 \\(f(0)=5\\) 得 \\(d=5\\)。代入其餘三點解聯立，可得 \\(a=\\frac23,b=-3,c=-\\frac83\\)。',
      },
      {
        q: '求通過 \\((997,3),(999,-2),(1001,1)\\) 三點的二次多項式。',
        a: '簡答：\\(f(x)=(x-999)^2-\\frac12(x-999)-2\\)。過程：令 \\(t=\\frac{x-999}{2}\\)，三點變成 \\((-1,3),(0,-2),(1,1)\\)。設 \\(f=at^2+bt+c\\)，得 \\(c=-2\\)、\\(a-b=5\\)、\\(a+b=3\\)，所以 \\(a=4,b=-1\\)。換回 \\(x\\) 得答案。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131InterpolationValueOnlySet(count) {
    const templates = [
      {
        q: '設 \\(f(x)\\) 為二次多項式，且 \\(f(11)=6,f(12)=11,f(13)=10\\)，求 \\(f(14)\\) 之值。',
        a: '簡答：3。過程：相鄰一次差為 5、-1，所以二次差為 -6。下一個一次差為 \\(-1-6=-7\\)，因此 \\(f(14)=10-7=3\\)。',
      },
      {
        q: '設 \\(f(x)\\) 為二次多項式，且 \\(f(11)=6,f(12)=11,f(13)=10\\)，求 \\(f(0)\\) 之值。',
        a: '簡答：-445。過程：令 \\(t=x-11\\)，則 \\(f=-3t^2+8t+6\\)。當 \\(x=0\\) 時 \\(t=-11\\)，所以 \\(f(0)=-3(121)+8(-11)+6=-445\\)。',
      },
      {
        q: '設 \\(f(x)\\) 為二次多項式，滿足 \\(f(-1)=3,f(1)=1,f(2)=3\\)，求 \\(f(3)\\)。',
        a: '簡答：7。過程：設 \\(f(x)=ax^2+bx+c\\)。由三個條件解得 \\(a=1,b=-1,c=1\\)，所以 \\(f(3)=9-3+1=7\\)。',
      },
      {
        q: '已知二次多項式滿足 \\(f(1)=1,f(2)=4,f(3)=9\\)，求 \\(f(4)\\)。',
        a: '簡答：16。過程：這三點符合 \\(f(x)=x^2\\)。也可看一次差為 3、5，二次差為 2，所以下一個一次差為 7，\\(f(4)=9+7=16\\)。',
      },
      {
        q: '設 \\(f(x)\\) 為三次多項式，已知 \\(f(1)=f(2)=f(3)=2\\)，且 \\(f(0)=-16\\)，求 \\(f(5)\\)。',
        a: '簡答：74。過程：因為 \\(f(x)-2\\) 在 \\(1,2,3\\) 都為 0，故 \\(f(x)=2+k(x-1)(x-2)(x-3)\\)。代入 \\(x=0\\) 得 \\(2-6k=-16\\)，所以 \\(k=3\\)。因此 \\(f(5)=2+3\\cdot4\\cdot3\\cdot2=74\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131InterpolationStructuralRemainderSet(count) {
    const templates = [
      {
        q: '設三次多項式 \\(f(x)\\)，已知 \\(f(1)=f(2)=f(3)=4\\)，且 \\(f(-1)=-44\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=2x^3-12x^2+22x-8\\)。過程：因為 \\(f(x)-4\\) 在 \\(1,2,3\\) 都為 0，設 \\(f(x)=4+k(x-1)(x-2)(x-3)\\)。代入 \\(x=-1\\)，得 \\(4-24k=-44\\)，所以 \\(k=2\\)，展開即得答案。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x-1,x-2,x-3\\) 的餘式分別為 5,10,17，求除以 \\((x-1)(x-2)(x-3)\\) 的餘式 \\(r(x)\\)。',
        a: '簡答：\\(r(x)=x^2+2x+2\\)。過程：餘式 \\(r(x)\\) 的次數小於 3，且 \\(r(1)=5,r(2)=10,r(3)=17\\)。設 \\(r=ax^2+bx+c\\)，解得 \\(a=1,b=2,c=2\\)。',
      },
      {
        q: '設 \\(f(x)\\) 為三次多項式，若 \\(f(1)=f(2)=0,f(3)=-4,f(4)=-6\\)，求 \\(f(5)\\)。',
        a: '簡答：0。過程：由 \\(f(1)=f(2)=0\\)，設 \\(f(x)=(x-1)(x-2)(ax+b)\\)。代入 \\(x=3,4\\)，得 \\(3a+b=-2\\)、\\(4a+b=-1\\)，所以 \\(a=1,b=-5\\)。代入 \\(x=5\\) 得 0。',
      },
      {
        q: '設 \\(f(x)\\) 為二次多項式，且 \\(f(2)=9,f(-1)=0,f(4)=5\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=-\\frac43x^2+5x+\\frac{19}{3}\\)。過程：設 \\(f(x)=ax^2+bx+c\\)。代入三點得 \\(4a+2b+c=9\\)、\\(a-b+c=0\\)、\\(16a+4b+c=5\\)，解得 \\(a=-\\frac43,b=5,c=\\frac{19}{3}\\)。',
      },
      {
        q: '已知三次多項式 \\(f(x)\\) 滿足 \\(f(1)=f(2)=f(3)=5\\)，且 \\(f(4)=44\\)，求 \\(f(0)\\)。',
        a: '簡答：-34。過程：設 \\(f(x)=5+k(x-1)(x-2)(x-3)\\)。代入 \\(x=4\\) 得 \\(5+6k=44\\)，所以 \\(k=\\frac{13}{2}\\)。代入 \\(x=0\\)，得 \\(5-6\\cdot\\frac{13}{2}=-34\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131InterpolationFiniteDifferenceSet(count) {
    const templates = [
      {
        q: '二次函數 \\(f(x)\\) 滿足 \\(f(1)=3,f(2)=2,f(3)=7\\)，利用階差求 \\(f(4)\\)。',
        a: '簡答：18。過程：一次差為 \\(-1,5\\)，二次差為 6。下一個一次差為 \\(5+6=11\\)，所以 \\(f(4)=7+11=18\\)。',
      },
      {
        q: '三次函數 \\(f(x)\\) 滿足 \\(f(10)=3,f(20)=2,f(30)=7,f(40)=5\\)，求 \\(f(50)\\)。',
        a: '簡答：-17。過程：因為輸入值等差，可用階差。一次差為 \\(-1,5,-2\\)，二次差為 \\(6,-7\\)，三次差為 -13。下一個二次差為 \\(-20\\)，下一個一次差為 \\(-22\\)，所以 \\(f(50)=5-22=-17\\)。',
      },
      {
        q: '三次多項式 \\(f(2001)=7,f(2002)=9,f(2003)=13,f(2004)=31\\)，求 \\(f(2005)\\)。',
        a: '簡答：75。過程：一次差為 2,4,18，二次差為 2,14，三次差為 12。下一個二次差為 26，下一個一次差為 44，所以 \\(f(2005)=31+44=75\\)。',
      },
      {
        q: '已知 \\(f(-2)=13,f(-1)=9,f(0)=5,f(1)=7\\)，利用等差插值求 \\(f(2)\\)。',
        a: '簡答：21。過程：一次差為 -4,-4,2，二次差為 0,6，三次差為 6。下一個二次差為 12，下一個一次差為 14，所以 \\(f(2)=7+14=21\\)。',
      },
      {
        q: '若二次多項式 \\(f(x)\\) 滿足 \\(f(1)=2,f(2)=5,f(3)=10\\)，利用階差預測 \\(f(4)\\)。',
        a: '簡答：17。過程：一次差為 3,5，二次差為 2。下一個一次差為 \\(5+2=7\\)，所以 \\(f(4)=10+7=17\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131InterpolationLagrangeSpecialSet(count) {
    const templates = [
      {
        q: '設 \\(a,b,c\\) 相異，令 \\(f(x)=\\frac{(x-a)(x-b)}{(c-a)(c-b)}+\\frac{(x-b)(x-c)}{(a-b)(a-c)}+\\frac{(x-c)(x-a)}{(b-c)(b-a)}\\)。證明 \\(f(x)=1\\)，並求 \\(f(2000)\\)。',
        a: '簡答：\\(f(x)=1\\)，\\(f(2000)=1\\)。過程：此式是通過 \\((a,1),(b,1),(c,1)\\) 的二次以下插值多項式。常數多項式 1 也通過這三點，由唯一性可知 \\(f(x)=1\\)。',
      },
      {
        q: '給定三點 \\((4,5),(6,7),(8,9)\\)，求其插值多項式並解釋為何退化為一次式。',
        a: '簡答：\\(f(x)=x+1\\)。過程：三點都在直線 \\(y=x+1\\) 上。雖然用三點可求二次以下插值多項式，但二次項係數為 0，因此退化為一次式。',
      },
      {
        q: '設 \\(f(x)=2\\cdot\\frac{(x-\\sqrt3)(x-\\sqrt5)}{(\\sqrt2-\\sqrt3)(\\sqrt2-\\sqrt5)}+3\\cdot\\frac{(x-\\sqrt2)(x-\\sqrt5)}{(\\sqrt3-\\sqrt2)(\\sqrt3-\\sqrt5)}+5\\cdot\\frac{(x-\\sqrt2)(x-\\sqrt3)}{(\\sqrt5-\\sqrt2)(\\sqrt5-\\sqrt3)}\\)，求 \\(f(\\sqrt{179})\\)。',
        a: '簡答：179。過程：此拉格朗日式通過 \\((\\sqrt2,2),(\\sqrt3,3),(\\sqrt5,5)\\)。二次多項式 \\(x^2\\) 也通過這三點，因此由唯一性 \\(f(x)=x^2\\)，所以 \\(f(\\sqrt{179})=179\\)。',
      },
      {
        q: '若多項式 \\(f(x)\\) 次數不超過 100，且 \\(f(1)=1,f(2)=\\frac12,\\ldots,f(101)=\\frac1{101}\\)，利用結構化列式求 \\(f(102)\\)。',
        a: '簡答：\\(\\frac1{51}\\)。過程：令 \\(P(x)=xf(x)-1\\)，則 \\(P(1),P(2),\\ldots,P(101)\\) 都為 0，且 \\(P(x)\\) 次數不超過 101。又 \\(P(0)=-1\\)，可得 \\(P(x)=\\frac{(x-1)(x-2)\\cdots(x-101)}{101!}\\)。因此 \\(102f(102)-1=P(102)=1\\)，所以 \\(f(102)=\\frac2{102}=\\frac1{51}\\)。',
      },
      {
        q: '若多項式 \\(f(x)\\) 滿足 \\(f(1)=1,f(2)=4,f(3)=9\\)，判斷 \\(f(x)-x^2\\) 是否有因式 \\((x-1)(x-2)(x-3)\\)。',
        a: '簡答：有。過程：令 \\(g(x)=f(x)-x^2\\)。由題意得 \\(g(1)=0,g(2)=0,g(3)=0\\)，所以 \\(x-1,x-2,x-3\\) 都是因式，因此 \\((x-1)(x-2)(x-3)\\) 為因式。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, answers };
  }

  function buildS131InterpolationPolynomialFiveSubtypeMixedSet(count) {
    const banks = [
      buildS131InterpolationPolynomialFromPointsSet,
      buildS131InterpolationValueOnlySet,
      buildS131InterpolationStructuralRemainderSet,
      buildS131InterpolationFiniteDifferenceSet,
      buildS131InterpolationLagrangeSpecialSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, answers };
  }

  function buildS131AdvancedRemainderFiveSubtypeMixedSet(count) {
    const banks = [
      buildS131ComplexRootRemainderSet,
      buildS131CompositionRemainderSet,
      buildS131SquareDivisorRemainderSet,
      buildS131StepwiseRemainderConstructionSet,
      buildS131CoefficientTransformRemainderSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, answers };
  }

  function buildS131RemainderApplicationsFiveSubtypeMixedSet(count) {
    const banks = [
      buildS131RemainderOperationsSet,
      buildS131LowToHighRemainderSet,
      buildS131TransformedDividendRemainderSet,
      buildS131SquareDivisorCalculationSet,
      buildS131SpecialXnRemainderSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, answers };
  }

  function formatJ611Coefficient(frac) {
    const value = makeFraction(frac.num, frac.den);
    if (value.den === 1) {
      if (value.num === 1) return '';
      if (value.num === -1) return '-';
      return `${value.num}`;
    }
    if (value.num < 0) return `-\\frac{${Math.abs(value.num)}}{${value.den}}`;
    return `\\frac{${value.num}}{${value.den}}`;
  }

  function formatJ611Parabola(frac) {
    return `y=${formatJ611Coefficient(frac)}x^2`;
  }

  function formatJ611Abs(frac) {
    const value = absFraction(frac);
    return fractionToLatex(value);
  }

  function buildJ611OpeningDirectionVertexAxisSet(count) {
    const candidates = [
      makeFraction(5, 1),
      makeFraction(-7, 1),
      makeFraction(2, 3),
      makeFraction(-1, 2),
      makeFraction(100, 1),
      makeFraction(-3, 4),
      makeFraction(4, 1),
      makeFraction(-6, 1),
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = candidates[i % candidates.length];
      const eq = formatJ611Parabola(a);
      const opensUp = a.num > 0;
      const mode = i % 4;
      if (mode === 0) {
        questions.push(`二次函數 \\(${eq}\\) 的開口方向為何？`);
        answers.push(`簡答：開口向${opensUp ? '上' : '下'}。過程：對 \\(y=ax^2\\) 而言，\\(a>0\\) 開口向上，\\(a<0\\) 開口向下。本題 \\(a=${fractionToLatex(a)}\\)，所以開口向${opensUp ? '上' : '下'}。`);
        continue;
      }
      if (mode === 1) {
        questions.push(`二次函數 \\(${eq}\\) 具有最高點還是最低點？`);
        answers.push(`簡答：${opensUp ? '最低點' : '最高點'}。過程：\\(y=ax^2\\) 的頂點固定為 \\((0,0)\\)。若 \\(a>0\\) 開口向上，頂點是最低點；若 \\(a<0\\) 開口向下，頂點是最高點。`);
        continue;
      }
      if (mode === 2) {
        questions.push(`二次函數 \\(${eq}\\) 的對稱軸方程式為何？`);
        answers.push('簡答：\\(x=0\\)。過程：標準型 \\(y=ax^2\\) 的圖形以 \\(y\\) 軸為對稱軸，因此對稱軸方程式為 \\(x=0\\)。');
        continue;
      }
      questions.push(`二次函數 \\(${eq}\\) 的頂點坐標為何？`);
      answers.push('簡答：\\((0,0)\\)。過程：標準型 \\(y=ax^2\\) 沒有左右或上下平移，所以頂點固定在原點 \\((0,0)\\)。');
    }
    return { questions, answers };
  }

  function buildJ611OpeningWidthOrderSet(count) {
    const sets = [
      [makeFraction(3, 1), makeFraction(1, 1), makeFraction(10, 1)],
      [makeFraction(-5, 1), makeFraction(-1, 1), makeFraction(-1, 10)],
      [makeFraction(1, 2), makeFraction(1, 4), makeFraction(2, 1)],
      [makeFraction(4, 1), makeFraction(-6, 1), makeFraction(2, 1)],
      [makeFraction(3, 2), makeFraction(-4, 1), makeFraction(1, 3)],
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const list = sets[i % sets.length];
      const labels = ['甲', '乙', '丙'];
      const descriptions = list.map((a, idx) => `${labels[idx]}：\\(${formatJ611Parabola(a)}\\)`).join('，');
      const narrowToWide = list
        .map((a, idx) => ({ label: labels[idx], abs: Math.abs(a.num / a.den), a }))
        .sort((x, y) => y.abs - x.abs);
      const wideToNarrow = narrowToWide.slice().reverse();
      if (i % 2 === 0) {
        questions.push(`${descriptions}，請依開口由小到大排列。`);
        answers.push(`簡答：${narrowToWide.map((item) => item.label).join('、')}。過程：\\(|a|\\) 越大，開口越小；\\(|a|\\) 越小，開口越大。各式的 \\(|a|\\) 分別為 ${list.map((a, idx) => `${labels[idx]}:${formatJ611Abs(a)}`).join('、')}，所以由小到大為 ${narrowToWide.map((item) => item.label).join('、')}。`);
      } else {
        questions.push(`${descriptions}，請依開口由大到小排列。`);
        answers.push(`簡答：${wideToNarrow.map((item) => item.label).join('、')}。過程：\\(|a|\\) 越小，開口越大；\\(|a|\\) 越大，開口越小。各式的 \\(|a|\\) 分別為 ${list.map((a, idx) => `${labels[idx]}:${formatJ611Abs(a)}`).join('、')}，所以由大到小為 ${wideToNarrow.map((item) => item.label).join('、')}。`);
      }
    }
    return { questions, answers };
  }

  function buildJ611FindCoefficientFromPointSet(count) {
    const points = [
      { x: 1, y: 3 },
      { x: 2, y: -8 },
      { x: -3, y: 18 },
      { x: 4, y: 4 },
      { x: -2, y: -12 },
      { x: 5, y: 10 },
      { x: -4, y: -6 },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const point = points[i % points.length];
      const a = makeFraction(point.y, point.x * point.x);
      questions.push(`二次函數 \\(y=ax^2\\) 通過點 \\((${point.x},${point.y})\\)，求 \\(a\\) 之值。`);
      answers.push(`簡答：\\(a=${fractionToLatex(a)}\\)。過程：把點 \\((${point.x},${point.y})\\) 代入 \\(y=ax^2\\)，得 \\(${point.y}=a\\cdot${point.x}^2\\)。所以 \\(a=\\frac{${point.y}}{${point.x * point.x}}=${fractionToLatex(a)}\\)。`);
    }
    return { questions, answers };
  }

  function buildJ611YAxisReflectionSet(count) {
    const items = [
      { x: 3, y: 9, a: makeFraction(1, 1) },
      { x: -2, y: 4, a: makeFraction(1, 1) },
      { x: 5, y: -25, a: makeFraction(-1, 1) },
      { x: -1, y: makeFraction(1, 2), a: makeFraction(1, 2) },
      { x: 4, y: -8, a: makeFraction(-1, 2) },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = items[i % items.length];
      const yText = typeof item.y === 'number' ? `${item.y}` : fractionToLatex(item.y);
      const reflected = `(${-item.x},${yText})`;
      if (i % 5 === 4) {
        questions.push(`若 \\(y=ax^2\\) 通過 \\((p,q)\\)，則該圖形必也會通過哪一個點？請用 \\(p,q\\) 表示。`);
        answers.push('簡答：\\((-p,q)\\)。過程：\\(y=ax^2\\) 以 \\(y\\) 軸為對稱軸，點的 \\(x\\) 坐標會變成相反數，而 \\(y\\) 坐標不變，所以對稱點為 \\((-p,q)\\)。');
        continue;
      }
      questions.push(`點 \\((${item.x},${yText})\\) 在 \\(${formatJ611Parabola(item.a)}\\) 圖形上，其對稱點坐標為何？`);
      answers.push(`簡答：\\(${reflected}\\)。過程：\\(y=ax^2\\) 的對稱軸是 \\(y\\) 軸，也就是 \\(x=0\\)。關於 \\(y\\) 軸對稱時，\\(x\\) 坐標變號、\\(y\\) 坐標不變，所以對稱點為 \\(${reflected}\\)。`);
    }
    return { questions, answers };
  }

  function buildJ611ParabolaAx2FourSubtypeMixedSet(count) {
    const banks = [
      buildJ611OpeningDirectionVertexAxisSet,
      buildJ611OpeningWidthOrderSet,
      buildJ611FindCoefficientFromPointSet,
      buildJ611YAxisReflectionSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, answers };
  }

  function buildJ443TrapezoidMidlineBasicSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const top = randInt(4, 18);
        const bottom = top + randInt(2, 18);
        const mid = makeFraction(top + bottom, 2);
        questions.push(`已知一梯形的上底為 ${top}、下底為 ${bottom}，求其中線長。`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(mid)}\\)。過程：梯形中線長為上底與下底的平均，\\(\\frac{${top}+${bottom}}{2}=${formatFunctionFractionValue(mid)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const top = randInt(4, 15);
        const bottom = top + randInt(4, 20);
        const mid = makeFraction(top + bottom, 2);
        questions.push(`設一梯形的中線長為 \\(${formatFunctionFractionValue(mid)}\\)，上底為 ${top}，求下底長度。`);
        answers.push(
          `簡答：${bottom}。過程：\\(中線=\\frac{上底+下底}{2}\\)，所以 \\(${formatFunctionFractionValue(mid)}=\\frac{${top}+下底}{2}\\)。兩邊乘以 2 得 ${top}+下底=${top + bottom}，故下底為 ${bottom}。`
        );
        continue;
      }
      if (mode === 2) {
        const ratio = [
          [1, 3],
          [2, 3],
          [3, 5],
          [4, 7],
        ][randInt(0, 3)];
        const unit = randInt(2, 8);
        const top = ratio[0] * unit;
        const bottom = ratio[1] * unit;
        const mid = makeFraction(top + bottom, 2);
        const topExpr = formatTerm(ratio[0], 'x');
        const bottomExpr = formatTerm(ratio[1], 'x');
        const sumExpr = formatTerm(ratio[0] + ratio[1], 'x');
        questions.push(
          `若一梯形的上底與下底之比為 ${ratio[0]}:${ratio[1]}，且中線長為 \\(${formatFunctionFractionValue(mid)}\\)，求下底。`
        );
        answers.push(
          `簡答：${bottom}。過程：設上底、下底分別為 ${topExpr}、${bottomExpr}，則中線 \\(=\\frac{${topExpr}+${bottomExpr}}{2}=\\frac{${sumExpr}}{2}\\)。由中線為 \\(${formatFunctionFractionValue(mid)}\\) 得 \\(x=${unit}\\)，所以下底為 ${ratio[1]}\\cdot${unit}=${bottom}。`
        );
        continue;
      }
      if (mode === 3) {
        const top = randInt(4, 16);
        const diff = randInt(3, 15);
        const bottom = top + diff;
        const mid = makeFraction(top + bottom, 2);
        questions.push(
          `已知梯形的中線長為 \\(${formatFunctionFractionValue(mid)}\\)，且下底比上底長 ${diff}，求上底長度。`
        );
        answers.push(
          `簡答：${top}。過程：設上底為 \\(x\\)，下底為 \\(x+${diff}\\)。\\(\\frac{x+x+${diff}}{2}=${formatFunctionFractionValue(mid)}\\)，所以 \\(2x+${diff}=${top + bottom}\\)，解得 \\(x=${top}\\)。`
        );
        continue;
      }
      const x = randInt(3, 12);
      const topConst = randInt(1, 6);
      const bottomA = randInt(2, 4);
      const bottomConst = 2 * 13 - (1 + bottomA) * x - topConst;
      const mid = makeFraction(x + topConst + (bottomA * x + bottomConst), 2);
      if (
        bottomA * x + bottomConst <= 0 ||
        topConst + x <= 0 ||
        mid.num !== 13 * mid.den ||
        bottomConst < -8 ||
        bottomConst > 12
      ) {
        i -= 1;
        continue;
      }
      questions.push(
        `若一梯形的上底為 \\(x+${topConst}\\)，下底為 \\(${formatFunctionLinear(bottomA, bottomConst)}\\)，中線長為 13，求 \\(x\\) 之值。`
      );
      answers.push(
        `簡答：\\(x=${x}\\)。過程：中線公式為 \\(\\frac{(x+${topConst})+(${formatFunctionLinear(bottomA, bottomConst)})}{2}=13\\)，化簡得 \\(${formatFunctionLinear(1 + bottomA, topConst + bottomConst)}=26\\)，解得 \\(x=${x}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ443ParallelDivisionSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const top = randInt(4, 12);
        const bottom = top + randInt(6, 20);
        const mid = makeFraction(top + bottom, 2);
        questions.push(
          `梯形 \\(ABCD\\) 中，\\(AD\\parallel BC\\)，\\(E,F\\) 為兩腰中點。若 \\(AD=${top}\\)，\\(BC=${bottom}\\)，求 \\(EF\\)。`
        );
        answers.push(
          `簡答：\\(EF=${formatFunctionFractionValue(mid)}\\)。過程：兩腰中點連線為梯形中線，長度為兩底平均，\\(EF=\\frac{${top}+${bottom}}{2}=${formatFunctionFractionValue(mid)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const top = randInt(4, 10);
        const bottom = top + randInt(8, 24);
        const first = makeFraction(2 * top + bottom, 3);
        const second = makeFraction(top + 2 * bottom, 3);
        questions.push(`梯形的兩腰被三等分，且上底為 ${top}、下底為 ${bottom}，求中間兩條平行線段的長度。`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(first)}\\)、\\(${formatFunctionFractionValue(second)}\\)。過程：從上底到下底的平行線長成等差變化，公差為 \\(\\frac{${bottom}-${top}}{3}\\)。兩條分割線長為 \\(${formatFunctionFractionValue(first)}\\)、\\(${formatFunctionFractionValue(second)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const top = randInt(4, 12);
        const bottom = top + randInt(8, 24);
        const first = makeFraction(2 * top + bottom, 3);
        const second = makeFraction(top + 2 * bottom, 3);
        const sum = addFraction(first, second);
        questions.push(
          `梯形 \\(ABCD\\) 中，將兩腰三等分。已知上底為 ${top}、下底為 ${bottom}，求中間兩條分割線段長度之和。`
        );
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(sum)}\\)。過程：三等分時中間兩線長為 \\(\\frac{2上底+下底}{3}\\)、\\(\\frac{上底+2下底}{3}\\)，相加為 \\(${formatFunctionFractionValue(first)}+${formatFunctionFractionValue(second)}=${formatFunctionFractionValue(sum)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const top = randInt(3, 10);
        const bottom = top + randInt(8, 28);
        const q1 = makeFraction(3 * top + bottom, 4);
        const q2 = makeFraction(top + bottom, 2);
        const q3 = makeFraction(top + 3 * bottom, 4);
        questions.push(
          `梯形 \\(ABCD\\) 中，將兩腰四等分。已知上底為 ${top}、下底為 ${bottom}，求中間三條平行線段的長度。`
        );
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(q1)}\\)、\\(${formatFunctionFractionValue(q2)}\\)、\\(${formatFunctionFractionValue(q3)}\\)。過程：平行線段長從上底到下底等差變化，四等分時三條中間線依序為 \\(\\frac{3上底+下底}{4}\\)、\\(\\frac{上底+下底}{2}\\)、\\(\\frac{上底+3下底}{4}\\)，代入得上述結果。`
        );
        continue;
      }
      const top = randInt(4, 12);
      const bottom = top + randInt(12, 28);
      const parts = 3;
      const d = makeFraction(bottom - top, parts);
      const first = addFraction(makeFraction(top), d);
      const second = addFraction(makeFraction(top), mulFraction(d, makeFraction(2)));
      questions.push(
        `若梯形被三條等距的中位線分成四層，已知最上面一條線段長為 ${top}，最下面一條線段長為 ${bottom}，求中間兩層線段長之和。`
      );
      answers.push(
        `簡答：\\(${formatFunctionFractionValue(addFraction(first, second))}\\)。過程：四層表示從最上到最下共有 3 個等差間隔，公差為 \\(\\frac{${bottom}-${top}}{3}=${formatFunctionFractionValue(d)}\\)。中間兩層為 \\(${formatFunctionFractionValue(first)}\\)、\\(${formatFunctionFractionValue(second)}\\)，和為 \\(${formatFunctionFractionValue(addFraction(first, second))}\\)。`
      );
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
      return filtered
        .map((term, index) => {
          if (index === 0) return term;
          return term.startsWith('-') ? `- ${term.slice(1)}` : `+ ${term}`;
        })
        .join(' ');
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

        const dividend = joinFracPoly([fracTerm(c3, 3), fracTerm(c2, 2), fracTerm(c1, 1), fracTerm(c0, 0)]);
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

      const dividend = joinFracPoly([fracTerm(c3, 3), fracTerm(c2, 2), fracTerm(c1, 1), fracTerm(c0, 0)]);
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
    const left = Array(maxLen - a.length)
      .fill(0)
      .concat(a);
    const right = Array(maxLen - b.length)
      .fill(0)
      .concat(b);
    return left.map((value, index) => value + right[index]);
  }

  function scalePolyCoeffs(coeffs, k) {
    return coeffs.map((value) => value * k);
  }

  function evalPoly(coeffs, x) {
    let result = 0;
    const degree = coeffs.length - 1;
    for (let i = 0; i < coeffs.length; i += 1) {
      result += coeffs[i] * x ** (degree - i);
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
        questions.push(
          `一多項式除以 $(x${b >= 0 ? '+' : ''}${b})$，商式為 $${formatPolynomialFromCoeffs(quotient)}$，餘式為 ${r}，求此多項式。`
        );
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
        questions.push(
          `一多項式與 $(2x${d >= 0 ? '+' : ''}${d})$ 的乘積為 $${formatPolynomialFromCoeffs(product)}$，求此多項式。`
        );
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
      questions.push(
        `已知多項式 $A$ 除以 $${formatPolynomialFromCoeffs(divisor)}$ 的商式為 $${formatPolynomialFromCoeffs(quotient)}$，餘式為 ${r}，求多項式 $A$。`
      );
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
        questions.push(`若 $A=(x-1)^${n}+(${formatSingleVarExpr(p, 1)})$，求 $A$ 展開後的各項係數總和。`);
        answers.push(`簡答：係數總和為 $A(1)=0+(${p}+1)=${p + 1}$。`);
        continue;
      }

      const a = pickNonZero(-4, 4);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-8, 8);
      questions.push(`已知多項式 $A=( ${a}x${b >= 0 ? '+' : ''}${b} )^2+(${c}-x)(x+1)$，求 $A$ 的各項係數總和。`);
      const value = (a + b) ** 2 + (c - 1) * 2;
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
        questions.push(
          `不經除法，求 $${formatPolynomialFromCoeffs(poly)}$ 除以 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 的餘數。`
        );
        answers.push(`簡答：餘數為 $f(${a})=${evalPoly(poly, a)}$。`);
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(-5, 5);
        const r = pickNonZero(-9, 9);
        const m = pickNonZero(-4, 4);
        const n = pickNonZero(-8, 8);
        questions.push(
          `已知多項式 $A$ 除以 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 的餘式為 ${r}，求 $( ${m}A${n >= 0 ? '+' : ''}${n} )$ 除以同一除式的餘式。`
        );
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
        questions.push(
          `判斷 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 是否為 $${formatPolynomialFromCoeffs(poly)}$ 的因式。`
        );
        answers.push(`簡答：代入 $x=${a}$ 得 $f(${a})=${value}$，${value === 0 ? '是因式' : '不是因式'}。`);
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(-4, 4);
        const p = pickNonZero(-4, 4);
        const q = pickNonZero(-7, 7);
        const m = -(p * a * a + q) / a;
        if (!Number.isInteger(m)) continue;
        const lead = p === 1 ? 'x^2' : p === -1 ? '-x^2' : `${p}x^2`;
        questions.push(`已知 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 為 $${lead}+mx+${q}$ 的因式，求 $m$。`);
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
      questions.push(
        `若 $(x${u >= 0 ? '-' : '+'}${Math.abs(u)})$ 與 $(x${v >= 0 ? '-' : '+'}${Math.abs(v)})$ 皆為 $x^3+mx^2+nx+${cubic[3]}$ 的因式，求 $m,n$。`
      );
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
      const ans = formatPolynomialFromCoeffs([k1 * a1 - k2 * a2, k1 * b1 - k2 * b2, k1 * c1 - k2 * c2]);
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
        const q = pickNonZero(-8, 8);
        const r = randInt(-9, 9);
        const qTerm = formatCoeffTerm(q, 'x', 1);
        questions.push(
          `若多項式 $(a${p >= 0 ? '+' : ''}${p})x^2${qTerm.startsWith('-') ? '' : '+'}${qTerm}${r >= 0 ? '+' : ''}${r}$ 是一次多項式，求 $a$。`
        );
        answers.push(`簡答：$a=${-p}$。`);
        continue;
      }

      if (variant === 1) {
        const m = pickNonZero(-5, 5);
        const n = pickNonZero(-8, 8);
        const c = randInt(-9, 9);
        questions.push(
          `若多項式 $(a${m >= 0 ? '+' : ''}${m})x^3${n >= 0 ? '+' : ''}${n}x^2+x${c >= 0 ? '+' : ''}${c}$ 是一次多項式，求 $a$。`
        );
        answers.push(`簡答：$a=${-m}$。`);
        continue;
      }

      const aValue = pickNonZero(-4, 4);
      const u = -aValue;
      const v = -2 * aValue;
      const w = -3 * aValue;
      questions.push(
        `若多項式 $(a${u >= 0 ? '+' : ''}${u})x^2+(2a${v >= 0 ? '+' : ''}${v})x+(3a${w >= 0 ? '+' : ''}${w})$ 是零多項式，求 $a$。`
      );
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
    const simpleAns =
      p1 + p2 === 0
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
    const mStr =
      kp === 0
        ? k === 1
          ? ''
          : k === -1
            ? '-'
            : `${k}`
        : `${k === 1 ? '' : k === -1 ? '-' : k}x${kp === 1 ? '' : `^${kp}`}`;
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
      const ans =
        qPow === 0 ? `${qCoef}` : `${qCoef === 1 ? '' : qCoef === -1 ? '-' : qCoef}x${qPow === 1 ? '' : `^${qPow}`}`;
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
      const qa =
        i % 3 === 0
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
      const qa =
        i % 3 === 0
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
          answers.push(
            `由 $ab<0$ 可知 $a、b$ 異號，因此 $a$ 可能為正也可能為負；而 $b^2>0$ 一定為正，所以點 $A(a,b^2)$ 可能在第一象限或第二象限。`
          );
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
        questions.push(`若聯立方程式 $${formatSystemLatex(`x+ay=${q}`, `${p}x-${r}y=${s}`)}$ 有無限多組解，求 $a$。`);
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
      const lead = a * a === 1 ? 'x^2' : `${a * a}x^2`;
      questions.push(`展開：$(${ax}+${b})(${ax}-${b})$。`);
      answers.push(`利用平方差公式：$(A+B)(A-B)=A^2-B^2$，其中 $A=${ax},\\ B=${b}$，所以結果是 $${lead}-${b * b}$。`);
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
      const lead = a * a === 1 ? 'x^2' : `${a * a}x^2`;
      questions.push(`分解因式：$${lead}-${b * b}$。`);
      answers.push(`這是平方差：$${lead}-${b * b}=(${ax}+${b})(${ax}-${b})$。`);
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
      const currentKind = kind === 'mixed' ? ['integer', 'decimal', 'fraction'][Math.floor((i % 12) / 4)] : kind;
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
    const xTerm = (coef) => formatCoeffTerm(coef, 'x', 1);
    const yTerm = (coef) => formatCoeffTerm(coef, 'y', 1);
    const kTerm = (coef) => {
      if (coef === 0) return '0';
      if (coef === 1) return 'k';
      if (coef === -1) return '-k';
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
        questions.push(
          `已知 $(y+${yShift})$ 與 $(x+${xShift})$ 成反比，當 $x=${x0}$ 時 $y=${y0}$，求 $x=${x1}$ 時的 $y$ 值。`
        );
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
        const t1Text = t1.den === 1 ? `${t1.num}` : `${t1.num < 0 ? '-' : ''}\\dfrac{${Math.abs(t1.num)}}{${t1.den}}`;
        const zTermInT =
          kz.num < 0 ? `+\\dfrac{${fractionToLatex(negateFraction(kz))}}{x}` : `-\\dfrac{${fractionToLatex(kz)}}{x}`;
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
          formatJ232Answer(`${m} 倍`, `正比的意思是兩個量同倍數增減，所以 $x$ 變成 ${m} 倍，$y$ 也會跟著變成 ${m} 倍。`)
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
      questions.push(
        `若 $y$ 與 $x$ 成反比，當 $x$ 先增加 $${pick.up}\\%$，再減少 $${pick.down}\\%$ 時，$y$ 最後變為原來的幾倍？`
      );
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
          a: formatJ232Answer(
            '成正比',
            `折數 $x$ 表示售價是原價的 $\\dfrac{x}{10}$，所以 $y=${price}\\cdot \\dfrac{x}{10}$。這可整理成 $y=${price / 10}x$，因此 $y$ 與 $x$ 成正比。`
          ),
        };
      },
      () => {
        return {
          q: `已知圓的半徑為 $x$ 公分，圓周長為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成正比',
            `圓周長公式是 $y=2\\pi x$。因為 $2\\pi$ 是常數，符合 $y=kx$ 的形式，所以 $y$ 與 $x$ 成正比。`
          ),
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
          a: formatJ232Answer(
            '成反比',
            `因為單價 $\\times$ 數量 $=$ 總價，所以 $xy=${total}$。這符合 $xy=k$ 的形式，因此 $y$ 與 $x$ 成反比。`
          ),
        };
      },
      () => {
        const area = [24, 30, 36, 40][randInt(0, 3)];
        return {
          q: `一個面積為 ${area} 平方公分的三角形，底邊長為 $x$ 公分，高為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成反比',
            `三角形面積是 $\\dfrac{1}{2}xy=${area}$，整理得 $xy=${2 * area}$。這符合 $xy=k$ 的形式，所以 $y$ 與 $x$ 成反比。`
          ),
        };
      },
      () => {
        const distance = [240, 300, 360, 420][randInt(0, 3)];
        return {
          q: `兩地相距 ${distance} 公里，開車速率為每小時 $x$ 公里，所需時間為 $y$ 小時。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成反比',
            `因為 距離 $=$ 速率 $\\times$ 時間，所以 $xy=${distance}$。這符合 $xy=k$，因此 $y$ 與 $x$ 成反比。`
          ),
        };
      },
      () => {
        const volume = [6000, 8000, 12000][randInt(0, 2)];
        return {
          q: `將 ${volume} cc 的水倒入底面積為 $x$ 平方公分的水箱，水深為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成反比',
            `體積 $=$ 底面積 $\\times$ 高，所以 $xy=${volume}$。符合 $xy=k$ 的形式，因此 $y$ 與 $x$ 成反比。`
          ),
        };
      },
      () => {
        const work = [12, 15, 18, 20][randInt(0, 3)];
        return {
          q: `完成一項固定工作需要 ${work} 工時。若有 $x$ 位工人平均分工，每位工人需工作 $y$ 小時。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成反比',
            `因為人數 $\\times$ 每人工作時間 $=$ 固定總工時，所以 $xy=${work}$。因此 $y$ 與 $x$ 成反比。`
          ),
        };
      },
    ];

    const neitherBank = [
      () => {
        return {
          q: `一年甲班共有 36 人，其中男生 $x$ 人、女生 $y$ 人。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '都不是',
            `關係式是 $x+y=36$，也就是 $y=36-x$。這既不是 $y=kx$，也不是 $xy=k$，所以都不是。`
          ),
        };
      },
      () => {
        const perimeter = [24, 30, 40][randInt(0, 2)];
        return {
          q: `周長為 ${perimeter} 公分的長方形，長為 $x$ 公分，寬為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '都不是',
            `由周長公式得 $2(x+y)=${perimeter}$，整理成 $y=${perimeter / 2}-x$。因為不是 $y=kx$，也不是 $xy=k$，所以都不是。`
          ),
        };
      },
      () => {
        const diff = [18, 24, 30, 36][randInt(0, 3)];
        return {
          q: `爸爸今年 $x$ 歲，女兒今年 $y$ 歲，兩人相差 ${diff} 歲。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '都不是',
            `關係式是 $x-y=${diff}$，整理成 $y=x-${diff}$。這不是正比，也不是反比，所以都不是。`
          ),
        };
      },
      () => {
        return {
          q: `已知圓的半徑為 $x$ 公分，面積為 $y$ 平方公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '都不是',
            `圓面積公式是 $y=\\pi x^2$。這是與 $x^2$ 成正比，不是與 $x$ 本身成正比，也不是反比，所以都不是。`
          ),
        };
      },
      () => {
        const base = [30, 40, 50, 60][randInt(0, 3)];
        const perMin = [2, 3, 4][randInt(0, 2)];
        return {
          q: `某電信公司的月租費為 ${base} 元，每分鐘另收 ${perMin} 元，通話 $x$ 分鐘後總費用為 $y$ 元。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '都不是',
            `關係式是 $y=${perMin}x+${base}$。因為有固定常數項 ${base}，所以不是正比；乘積也不固定，所以不是反比，因此都不是。`
          ),
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
          a: formatJ241Answer(
            `$${times}x+${add}>${limit}$`,
            `「大於」對應 $>$，所以不等式是 $${times}x+${add}>${limit}$。`
          ),
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
          a: formatJ241Answer(
            `$${low}≤${expr}<${high}$`,
            `「不到」表示 $<$，「不低於」表示 $≥$，所以要寫成 $${low}≤${expr}<${high}$。`
          ),
        };
      },
      () => {
        const coeff = randInt(3, 9);
        const low = randInt(30, 80);
        const high = low + randInt(20, 60);
        return {
          q: `文字轉換：$x$ 的 ${coeff} 倍在 ${low} 以上，${high} 以下，請寫成不等式。`,
          a: formatJ241Answer(
            `$${low}≤${coeff}x≤${high}$`,
            `國中題裡「以上、以下」通常包含端點，所以式子是 $${low}≤${coeff}x≤${high}$。`
          ),
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
          a: formatJ241Answer(
            `$${answer}$`,
            `先看界線是 $${fractionToLatex(bound, true)}$。依題意可得答案為 $${answer}$。`
          ),
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
          a: formatJ241Answer(
            `${countInt} 個`,
            `整數解會從 ${includeLow ? low : low + 1} 到 ${includeHigh ? high : high - 1}。共有 ${countInt} 個整數解。`
          ),
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
          a: formatJ241Answer(
            `$a=${upper}$`,
            `整數解會是 ${start} 到 $a-1$。因此個數為 $${countExpr}$，令它等於 ${countInt}，解得 $a=${upper}$。`
          ),
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
              : formatJ241Answer(
                  '沒有符合的數',
                  `因為 $|x|<${limit}$ 等價於 $-${limit}<x<${limit}$，逐一檢查後沒有符合的數。`
                ),
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
    const lastSentence =
      text
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
          formatJ241Answer(
            `$${solution}$`,
            `移項前其實已經是一次不等式：$${formatLinearExpr(coef, bias)}${rawOp}${rhs}$。先整理得 $${formatIneqAxRelB(coef, rawOp, rhs - bias)}$。${coef < 0 ? `兩邊同除以負數 ${coef} 時要變號，所以 ` : ''}解得 $${solution}$。`
          )
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
          formatJ241Answer(
            `$${solution}$`,
            `先移項整理：$${formatTerm(leftCoef, 'x')}${rightCoef > 0 ? '-' : '+'}${formatTerm(Math.abs(rightCoef), 'x')}${rawOp}${rhsConst}${bias >= 0 ? '-' : '+'}${Math.abs(bias)}$，可得 $${formatIneqAxRelB(A, rawOp, rhsConst - bias)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}所以解是 $${solution}$。`
          )
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
          formatJ241Answer(
            `$${solution}$`,
            `先展開得 $${p}x${p * r >= 0 ? '+' : ''}${p * r}${rawOp}${formatLinearExpr(q, rhs)}$。移項整理後可得 $${formatIneqAxRelB(A, rawOp, rhs - p * r)}$。${A < 0 ? `兩邊同除以負數 ${A} 要變號，` : ''}因此 $${solution}$。`
          )
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
        formatJ241Answer(
          `$${solution}$`,
          `先展開得 $${p}x${p * r >= 0 ? '+' : ''}${p * r}-${q}x${q * u >= 0 ? '-' : '+'}${Math.abs(q * u)}${rawOp}${rhs}$，整理後為 $${formatIneqAxRelB(A, rawOp, rhs - constPart)}$。${A < 0 ? `再除以負數 ${A} 時要變號，` : ''}所以解為 $${solution}$。`
        )
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
          formatJ241Answer(
            `$${solution}$`,
            `先把各項都乘以 $${scale}$ 化成整數，得到 $${formatLinearExpr(coef, bias)}${rawOp}${formatLinearExpr(rhsCoef, rhsConst)}$。整理後可得 $${formatIneqAxRelB(A, rawOp, rhsConst - bias)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}所以 $${solution}$。`
          )
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
          formatJ241Answer(
            `$${solution}$`,
            `先展開並把小數同乘以 $10$ 化成整數，可得 $${p * 10}(x${r >= 0 ? '+' : ''}${r})${rawOp}${formatLinearExpr(q, rhs)}$。整理後為 $${formatIneqAxRelB(A, rawOp, rhs - 10 * p * r)}$。${A < 0 ? `除以負數 ${A} 要變號，` : ''}所以 $${solution}$。`
          )
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
        formatJ241Answer(
          `$${solution}$`,
          `先展開並整理得 $${p}(10x${r >= 0 ? '+' : ''}${10 * r})-${q}(10x${u >= 0 ? '+' : ''}${10 * u})${rawOp}${rhs}$，進一步可化成 $${formatIneqAxRelB(A, rawOp, rhs - constPart)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}因此 $${solution}$。`
        )
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
        formatJ241Answer(
          `$${rangeAnswer}$`,
          `因為 $y=${yExpr}$ ${increasing ? '會隨 $x$ 增加而增加' : '會隨 $x$ 增加而減少'}，所以只要代入兩個端點判斷最小與最大值。可得 $${rangeAnswer}$。`
        )
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
        questions.push(`若 $2x-a${displayIneqOp(solOp)}${rhs}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`);
        answers.push(
          formatJ241Answer(
            `$a=${a}$`,
            `由 $2x-a${displayIneqOp(solOp)}${rhs}$ 可得 $2x${displayIneqOp(solOp)}${rhs}+a$。因為解的界線是 ${target}，所以 $\\dfrac{${rhs}+a}{2}=${target}$，解得 $a=${a}$。`
          )
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
          formatJ241Answer(
            `$a=${a}$`,
            `移項後可得 $(${coefExpr})x${displayIneqOp(rawOp)}${d - c}$。因為解是 $x${displayIneqOp(solOp)}${target}$，所以 $\\dfrac{${d - c}}{${coefExpr}}=${target}$，整理可得 $a=${a}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const a = pickNonZero(-9, 9);
        const rhs = a * target;
        const solText = a > 0 ? solOp : flipInequality(solOp);
        questions.push(`若 $ax${displayIneqOp(solText)}${rhs}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`);
        answers.push(
          formatJ241Answer(
            `$a=${a}$`,
            `因為 $ax${displayIneqOp(solText)}${rhs}$ 兩邊同除以 $a$ 後要得到 $x${displayIneqOp(solOp)}${target}$，所以 $a$ 的正負必須和不等號變向情形一致。配合 $${rhs}=a\\times ${target}$，可得 $a=${a}$。`
          )
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
          formatJ241Answer(
            `$a=${a}$`,
            `移項後會得到 $(${coefExpr})x${displayIneqOp(rawOp)}${rhsExpr}$。由於解是 $x${displayIneqOp(solOp)}${target}$，所以要有 $\\dfrac{${rhsExpr}}{${A}}=${target}$，解得 $a=${a}$。`
          )
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
        formatJ241Answer(
          `$m=${m}$`,
          `移項後是 $${formatTerm(coefDiff, 'x')}${displayIneqOp(solOp)}${rhsConst}+m$，也就是 $x${displayIneqOp(solOp)}${rhsConst}+m$。解應為 $x${displayIneqOp(solOp)}${target}$，因此 $${rhsConst}+m=${target}$，所以 $m=${m}$。`
        )
      );
    }

    return { questions, answers };
  }

  function buildJ241KnownSolutionParamRangeSet(count) {
    const questions = [];
    const answers = [];
    const ops = ['>', '<', '≥', '≤'];

    function chooseTargetsForX0(x0) {
      const base = [
        makeFraction(-5),
        makeFraction(-4),
        makeFraction(-3),
        makeFraction(-2),
        makeFraction(-1),
        makeFraction(0),
        makeFraction(1),
        makeFraction(2),
        makeFraction(3),
        makeFraction(4),
        makeFraction(5),
      ];
      if (Math.abs(x0) % 2 === 0) {
        base.push(
          makeFraction(-7, 2),
          makeFraction(-5, 2),
          makeFraction(-3, 2),
          makeFraction(-1, 2),
          makeFraction(1, 2),
          makeFraction(3, 2),
          makeFraction(5, 2),
          makeFraction(7, 2)
        );
      }
      if (Math.abs(x0) % 3 === 0) {
        base.push(
          makeFraction(-8, 3),
          makeFraction(-5, 3),
          makeFraction(-4, 3),
          makeFraction(-2, 3),
          makeFraction(2, 3),
          makeFraction(4, 3),
          makeFraction(5, 3),
          makeFraction(8, 3)
        );
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
        answers.push(
          formatJ241Answer(
            '$a>-\\frac{1}{4}$，最小整數為 $0$',
            '把 $x=-4$ 代入，可得 $-4a-5<-4$。整理得 $-4a<1$，所以 $a>-\\frac{1}{4}$。因此滿足條件的最小整數為 $0$。'
          )
        );
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
          formatJ241Answer(
            `$a=${a}$`,
            `先解第一個不等式，整理後得 $${formatIneqSolution(solOp, makeFraction(target))}$。第二個不等式展開整理後可化成 $${formatTerm(B, 'x')}${displayIneqOp(raw2)}${secondRhs}$。因為兩者解相同，所以界線也必須是 ${target}，即 $${secondRhs}=${B * target}$。解得 $a=${a}$。`
          )
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
          formatJ241Answer(
            `$a=${a}$`,
            `第一個不等式展開整理後可得 $${formatIneqSolution(solOp, makeFraction(target))}$。第二個不等式化簡後是 $${formatTerm(B, 'x')}${displayIneqOp(raw2)}${secondRhs}$。由於兩式解相同，所以界線也應是 ${target}，因此 $${secondRhs}=${B * target}$，得 $a=${a}$。`
          )
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
        formatJ241Answer(
          `$a=${a}$`,
          `先把第一個不等式化簡，得 $${formatIneqSolution(solOp, makeFraction(target))}$。第二個不等式整理成 $${formatTerm(B, 'x')}${displayIneqOp(raw2)}${secondRhs}$。要和前式解相同，就要有 $${secondRhs}=${B * target}$，解得 $a=${a}$。`
        )
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
          formatJ242Answer(
            `$x<${bound}$`,
            `依題意可列不等式 $${countItem}x<${budget}$。兩邊同除以 ${countItem}，得 $x<${bound}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const names = ['小涵', '小宇', '小晴', '小恩', '小妍', '小杰', '小蓉', '小翔'];
        const name = names[cycle % names.length];
        const gain = 4 + ((cycle * 5 + 1) % 8);
        const limit = 56 + ((cycle * 11 + 3) % 31);
        questions.push(`體重限制：${name}現在體重 $x$ 公斤，增加 ${gain} 公斤後超過 ${limit} 公斤，求 $x$ 的範圍。`);
        answers.push(
          formatJ242Answer(`$x>${limit - gain}$`, `依題意可列 $x+${gain}>${limit}$，所以 $x>${limit - gain}$。`)
        );
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
          formatJ242Answer(
            `${target - a - b} 分`,
            `依題意：$${a}+${b}+x≥${target}$。整理得 $x≥${target - a - b}$，所以 $x$ 的最小值是 ${target - a - b}。`
          )
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
          formatJ242Answer(
            `至少 ${minDays} 天（$x≥${bound}$）`,
            `依題意可列 $${daily}x+${start}≥${goal}$，整理得 $${daily}x≥${need}$，所以 $x≥${bound}$。若以天數計，至少要 ${minDays} 天。`
          )
        );
        continue;
      }

      if (variant === 4) {
        const kids = 4 + ((cycle * 3 + 1) % 7);
        const each = 4 + ((cycle * 5 + 2) % 8);
        questions.push(`基礎分配：將 $x$ 顆糖果分給 ${kids} 位小朋友，每人至少得 ${each} 顆，求糖果總數的最小值。`);
        answers.push(
          formatJ242Answer(
            `${kids * each} 顆`,
            `每人至少 ${each} 顆，${kids} 人至少共要 $${kids}\\times ${each}=${kids * each}$ 顆，所以 $x≥${kids * each}$，最小值是 ${kids * each}。`
          )
        );
        continue;
      }

      const length = 6 + ((cycle * 7 + 2) % 10);
      const heightBase = 4 + ((cycle * 5 + 1) % 8);
      const areaLimit = length * heightBase - (1 + ((cycle * 3) % (length - 1)));
      const bound = fractionToLatex(makeFraction(areaLimit, length), true);
      questions.push(`矩形面積：長方形長是 ${length}，寬是 $x$，若面積不到 ${areaLimit} 平方公分，求 $x$ 的範圍。`);
      answers.push(formatJ242Answer(`$x<${bound}$`, `依題意可列 $${length}x<${areaLimit}$，因此 $x<${bound}$。`));
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
          formatJ242Answer(
            `$x<${bound}$`,
            `找回超過 ${threshold} 元，表示實際花費不到 ${pay - threshold} 元。可列不等式 $${books}x+${gift}<${spendLimit}$，整理得 $x<${bound}$。`
          )
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
          formatJ242Answer(
            `${maxValue}`,
            `依題意：$${step}x+${start}<${totalCap}$，所以 $${step}x<${rhs}$，得 $x<${boundText}$。因此 $x$ 的最大整數值是 ${maxValue}。`
          )
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
          formatJ242Answer(
            `$x≥${bound}$`,
            `女生平均為 $x+${delta}$ 分，所以全班總分至少為 $${targetAvg}\\times ${totalStudents}$。可列 $${boys}x+${girls}(x+${delta})≥${targetAvg * totalStudents}$。整理得 $${coef}x≥${rhs}$，所以 $x≥${bound}$。`
          )
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
          formatJ242Answer(
            rangeText,
            `面積為 $\\dfrac{${base}(x-2)}{2}$，依題意：$${low}<\\dfrac{${base}(x-2)}{2}≤${high}$。同乘以 $\\dfrac{2}{${base}}$ 並整理，可得 ${rangeText}。`
          )
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
          formatJ242Answer(
            `$x≤${bound}$，最多 ${maxHours} 小時`,
            `依題意：$${rate}x≤${cap}$，所以 $x≤${bound}$。若題目限制以小時計，則最多可停 ${maxHours} 小時。`
          )
        );
        continue;
      }

      const younger = randInt(8, 15);
      const gap = randInt(6, 12);
      questions.push(
        `年齡限制：小恩今年 $x$ 歲，小岩 ${younger} 歲，兩人歲數至少相差 ${gap} 歲且小恩較大，求 $x$ 的範圍。`
      );
      answers.push(
        formatJ242Answer(
          `$x≥${younger + gap}$`,
          `因為小恩較大，且年齡至少差 ${gap} 歲，所以 $x-${younger}≥${gap}$。整理得 $x≥${younger + gap}$。`
        )
      );
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
          formatJ242Answer(
            `${roomText} 間`,
            `設宿舍有 $x$ 間，則學生總數可寫成 $5x+${unplaced}$。若每間住 7 人，因為有一間住不滿但不是空房，所以滿足 $7(x-1)<5x+${unplaced}<7x$。整理後得到 $x>${lowerText}$ 且 $x<${upperText}$。因此宿舍可能的整數間數是 ${roomText}。`
          )
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
          formatJ242Answer(
            `${maxWrong} 題`,
            `若錯 $x$ 題，則對了 $${total}-x$ 題，得分為 $${score}(${total}-x)-${penalty}x$。依題意：$${score}(${total}-x)-${penalty}x>${bound}$，整理得 $${coef}x<${score * total - bound}$，即 $x<${boundText}$。因此 $x$ 的最大值是 ${maxWrong}。`
          )
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
          formatJ242Answer(
            `$${threshold}<x≤${threshold + 30}$`,
            `付 ${highFee} 元代表重量已超過 ${threshold} 公克，但沒有超過 ${threshold + 30} 公克，所以 $${threshold}<x≤${threshold + 30}$。`
          )
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
          formatJ242Answer(
            `$${lowerBound}<x<${upperBound}$`,
            `放入 ${template.first} 顆後未滿：$${water}+${template.first}x<${cup}$；再放 ${template.extra} 顆後共有 ${totalBeads} 顆且溢出：$${water}+${totalBeads}x>${cup}$。整理得 $x<${upperBound}$ 且 $x>${lowerBound}$，所以 $${lowerBound}<x<${upperBound}$。`
          )
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
          formatJ242Answer(
            `${minPeople} 人`,
            `買 $x$ 張原價票需 $${ticket}x$ 元；直接買 ${discountPeople} 張團體票需 $${discountPrice}\\times ${discountPeople}=${groupCost}$ 元。依題意：$${groupCost}<${ticket}x$，所以 $x>${fractionToLatex(makeFraction(groupCost, ticket), true)}$。又 $x$ 是整數且 $x<${discountPeople}$，故最小值是 $${minPeople}$。`
          )
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
          formatJ242Answer(
            `${minVote} 票`,
            `若阿文得 $x$ 票，剩下 ${totalVotes}-$x$ 票要分給另外 3 人。要讓阿文無法保證當選，至少要有 2 個人各得 $x$ 票，因此必須滿足 $${totalVotes}-x\\ge 2x$。所以要保證當選，就要 $${totalVotes}-x<2x$，整理得 $x>${fractionToLatex(bound, true)}$。又票數是整數，所以至少要 ${minVote} 票。`
          )
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
      'j1-1-3-biquadratic-split-square-factoring': {
        type: 'drill',
        title: '二次三項式的拆項配方因式分解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ113BiquadraticSplitSquareFactoringSet(5);
        },
      },
      'j1-1-3-binary-quadratic-cross-factoring': {
        type: 'drill',
        title: '二元二次式的雙十字交乘法因式分解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ113BinaryQuadraticCrossFactoringSet(5);
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
      'j3-4-3-number-property-word': {
        type: 'drill',
        title: '數字性質與運算問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ343NumberPropertyWordSet(5);
        },
      },
      'j3-4-3-geometry-area-word': {
        type: 'drill',
        title: '幾何圖形面積問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ343GeometryAreaWordSet(5);
        },
      },
      'j3-4-3-business-sales-word': {
        type: 'drill',
        title: '商業銷售與分攤問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ343BusinessWordSet(5);
        },
      },
      'j4-1-1-ap-core-mixed': {
        type: 'drill',
        title: '等差數列核心綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ411CoreMixedSet(6);
        },
      },
      'j4-1-1-ap-find-an': {
        type: 'drill',
        title: '基礎通項求值',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ411FindAnFromA1DNSet(5);
        },
      },
      'j4-1-1-ap-two-terms': {
        type: 'drill',
        title: '已知兩項求首項公差',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ411TwoTermsFindA1DSet(5);
        },
      },
      'j4-1-1-ap-find-n': {
        type: 'drill',
        title: '求項數判定',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ411FindNSet(5);
        },
      },
      'j4-1-1-ap-middle-term': {
        type: 'drill',
        title: '等差中項應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ411MiddleTermApplySet(5);
        },
      },
      'j4-1-1-ap-insert': {
        type: 'drill',
        title: '插入數與新公差',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ411InsertNumbersSet(5);
        },
      },
      'j4-1-1-ap-range-multiple-count': {
        type: 'drill',
        title: '範圍倍數判定（計算個數）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ411RangeMultipleCountSet(5);
        },
      },
      'j4-1-1-ap-common-term': {
        type: 'drill',
        title: '兩等差數列共同項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ411CommonTermTwoAPSet(5);
        },
      },
      'j4-1-2-geometric-mixed': {
        type: 'drill',
        title: '等比數列五大題型綜合',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildJ412GeometricSequenceMixedSet(10);
        },
      },
      'j4-1-2-geometric-nth-term': {
        type: 'drill',
        title: '基礎通項求值',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ412GeometricNthTermSet(5);
        },
      },
      'j4-1-2-geometric-find-ratio-first': {
        type: 'drill',
        title: '求公比與首項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ412FindRatioFirstTermSet(5);
        },
      },
      'j4-1-2-geometric-mean-unknown': {
        type: 'drill',
        title: '等比中項與代數應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ412GeometricMeanUnknownSet(5);
        },
      },
      'j4-1-2-geometric-term-index': {
        type: 'drill',
        title: '項數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ412TermIndexSet(5);
        },
      },
      'j4-1-2-geometric-word-applications': {
        type: 'drill',
        title: '生活應用規律',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ412WordApplicationSet(5);
        },
      },
      'j4-1-3-series-mixed': {
        type: 'drill',
        title: '等差級數五大題型綜合',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildJ413ArithmeticSeriesMixedSet(10);
        },
      },
      'j4-1-3-series-formula-core': {
        type: 'drill',
        title: '基礎求和與反求練習',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ413SeriesFormulaCoreSet(5);
        },
      },
      'j4-1-3-range-multiple-sum': {
        type: 'drill',
        title: '特定範圍內的倍數與餘數總和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ413RangeMultipleSumSet(5);
        },
      },
      'j4-1-3-max-min-sum': {
        type: 'drill',
        title: '級數最大值與最小值判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ413MaxMinSumSet(5);
        },
      },
      'j4-1-3-word-applications': {
        type: 'drill',
        title: '生活情境與幾何排列應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ413WordApplicationSet(5);
        },
      },
      'j4-1-3-sn-relation': {
        type: 'drill',
        title: '進階 S_n 函數與項的關係',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ413SnRelationSet(5);
        },
      },
      'j4-2-1-function-mixed': {
        type: 'drill',
        title: '函數五大題型綜合',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildJ421FunctionMixedSet(10);
        },
      },
      'j4-2-1-function-relation-judge': {
        type: 'drill',
        title: '函數關係判別題',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ421FunctionRelationJudgeSet(5);
        },
      },
      'j4-2-1-function-value-basic': {
        type: 'drill',
        title: '基礎函數值計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ421FunctionValueBasicSet(5);
        },
      },
      'j4-2-1-function-reverse-solve': {
        type: 'drill',
        title: '函數值的反求與未知數求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ421FunctionReverseSolveSet(5);
        },
      },
      'j4-2-1-function-flow-composite': {
        type: 'drill',
        title: '計算流程圖與複合運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ421FunctionFlowCompositeSet(5);
        },
      },
      'j4-2-1-function-word-model': {
        type: 'drill',
        title: '生活情境與公式轉換應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ421FunctionWordModelSet(5);
        },
      },
      'j4-2-2-linear-function-mixed': {
        type: 'drill',
        title: '線型函數四大題型綜合',
        difficulty: 'medium',
        questionCount: 8,
        generate() {
          return buildJ422LinearFunctionMixedSet(8);
        },
      },
      'j4-2-2-linear-equation-two-points': {
        type: 'drill',
        title: '求線型函數關係式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ422LinearEquationTwoPointsSet(5);
        },
      },
      'j4-2-2-intercept-position': {
        type: 'drill',
        title: '坐標軸交點與圖形位置判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ422InterceptPositionSet(5);
        },
      },
      'j4-2-2-axis-area': {
        type: 'drill',
        title: '線型函數圖形與坐標軸的面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ422AxisAreaSet(5);
        },
      },
      'j4-2-2-line-intersection-parallel': {
        type: 'drill',
        title: '兩直線交點與平行性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ422LineIntersectionParallelSet(5);
        },
      },
      'j4-3-1-polygon-angle-mixed': {
        type: 'drill',
        title: '三角形與多邊形角度綜合',
        difficulty: 'medium',
        questionCount: 9,
        generate() {
          return buildJ431PolygonAngleMixedSet(9);
        },
      },
      'j4-3-1-complementary-supplementary-angles': {
        type: 'drill',
        title: '補角與餘角推理綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ431ComplementarySupplementaryAngleSet(5);
        },
      },
      'j4-3-2-construction-bisection-count': {
        type: 'drill',
        title: '尺規作圖平分次數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ432ConstructionBisectionSet(5);
        },
      },
      'j4-4-1-parallel-perpendicular-angles': {
        type: 'drill',
        title: '平行垂直角度六型綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ441ParallelPerpendicularAngleMixedSet(6);
        },
      },
      'j4-4-2-quadrilateral-property-codes': {
        type: 'drill',
        title: '特殊四邊形性質代號判讀',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ442QuadrilateralPropertyCodeSet(6);
        },
      },
      'j4-4-3-trapezoid-midline-basic': {
        type: 'drill',
        title: '梯形中線基本運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ443TrapezoidMidlineBasicSet(5);
        },
      },
      'j4-4-3-parallel-division': {
        type: 'drill',
        title: '多重平行線分割',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ443ParallelDivisionSet(5);
        },
      },
      'j6-1-1-parabola-ax2-four-subtypes': {
        type: 'drill',
        title: '二次函數 y=ax^2 四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ611ParabolaAx2FourSubtypeMixedSet(5);
        },
      },
      'j6-1-1-opening-vertex-axis': {
        type: 'drill',
        title: '開口方向與頂點特徵快問快答',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ611OpeningDirectionVertexAxisSet(5);
        },
      },
      'j6-1-1-opening-width-order': {
        type: 'drill',
        title: '開口大小的排序練習',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ611OpeningWidthOrderSet(5);
        },
      },
      'j6-1-1-find-coefficient-from-point': {
        type: 'drill',
        title: '已知圖形通過點求係數 a',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ611FindCoefficientFromPointSet(5);
        },
      },
      'j6-1-1-yaxis-reflection': {
        type: 'drill',
        title: '圖形對稱點推算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ611YAxisReflectionSet(5);
        },
      },
      's1-1-1-repeating-decimal-fraction': {
        type: 'drill',
        title: '循環小數化成分數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS111RepeatingDecimalFractionSet(5);
        },
      },
      's1-1-1-nested-radical-simplify': {
        type: 'drill',
        title: '雙重根號的化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS111NestedRadicalSimplifySet(5);
        },
      },
      's1-1-1-radical-integer-fractional-part': {
        type: 'drill',
        title: '根式數值的整數與小數部分',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS111RadicalIntegerFractionalPartSet(5);
        },
      },
      's1-1-1-rational-irrational-true-false': {
        type: 'drill',
        title: '有理數與無理數的性質判定',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildS111RationalIrrationalTrueFalseSet(6);
        },
      },
      's1-1-1-irrational-equality-solve': {
        type: 'drill',
        title: '無理數相等的性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS111IrrationalEqualitySolveSet(5);
        },
      },
      's1-1-1-number-line-section': {
        type: 'drill',
        title: '數線上的分點公式坐標計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS111NumberLineSectionSet(5);
        },
      },
      's1-1-1-amgm-extrema': {
        type: 'drill',
        title: '算幾不等式的極值應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS111AmgmExtremaSet(5);
        },
      },
      's1-1-1-radical-integer-range': {
        type: 'drill',
        title: '根式的整數範圍與連續整數估計',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS111RadicalIntegerRangeSet(5);
        },
      },
      's1-1-1-telescoping-rationalization': {
        type: 'drill',
        title: '連鎖型有理化',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS111TelescopingRationalizationSet(5);
        },
      },
      's1-1-2-abs-inequality-basic': {
        type: 'drill',
        title: '絕對值不等式的基本運算與圖示',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS112AbsInequalityBasicSet(5);
        },
      },
      's1-1-2-abs-reverse-parameter': {
        type: 'drill',
        title: '反推係數題型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS112AbsReverseParameterSet(5);
        },
      },
      's1-1-2-abs-sum-minimum': {
        type: 'drill',
        title: '多個絕對值的和與最小值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS112AbsSumMinimumSet(5);
        },
      },
      's1-1-2-abs-number-line-range': {
        type: 'drill',
        title: '數線上多個絕對值的極值與解的範圍',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS112AbsNumberLineRangeSet(5);
        },
      },
      's1-1-2-abs-range-simplification': {
        type: 'drill',
        title: '特定範圍下的代數式化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS112AbsRangeSimplificationSet(5);
        },
      },
      's1-1-2-abs-quadratic-mixed': {
        type: 'drill',
        title: '絕對值與根號、二次項的混合運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS112AbsQuadraticMixedSet(5);
        },
      },
      's1-1-3-binomial-cube-expansion': {
        type: 'drill',
        title: '雙係數展開練習',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS113BinomialCubeExpansionSet(5);
        },
      },
      's1-1-3-cube-sum-difference': {
        type: 'drill',
        title: '給定和差與積的求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS113CubeSumDifferenceSet(5);
        },
      },
      's1-1-3-reciprocal-cube': {
        type: 'drill',
        title: '倒數和立方應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS113ReciprocalCubeSet(5);
        },
      },
      's1-1-3-ternary-square': {
        type: 'drill',
        title: '三項和平方展開與變換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS113TernarySquareSet(5);
        },
      },
      's1-1-3-ternary-cubic-special': {
        type: 'drill',
        title: '三項立方和特殊公式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS113TernaryCubicSpecialSet(5);
        },
      },
      's1-1-3-radical-ternary-operation': {
        type: 'drill',
        title: '含根式的三項運算練習',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS113RadicalTernaryOperationSet(5);
        },
      },
      's1-1-4-numeric-rational-exponent': {
        type: 'drill',
        title: '數值運算（含分數、負數及小數指數）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS114NumericRationalExponentSet(5);
        },
      },
      's1-1-4-variable-exponent-simplification': {
        type: 'drill',
        title: '含有變數的指數式化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS114VariableExponentSimplificationSet(5);
        },
      },
      's1-1-4-exponential-symmetric-value': {
        type: 'drill',
        title: '指數對稱式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS114ExponentialSymmetricValueSet(5);
        },
      },
      's1-1-4-exponential-equation-inequality': {
        type: 'drill',
        title: '指數方程式與不等式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS114ExponentialEquationInequalitySet(5);
        },
      },
      's1-1-5-large-number-digit-count': {
        type: 'drill',
        title: '大數的位數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS115LargeNumberDigitCountSet(5);
        },
      },
      's1-1-5-first-nonzero-decimal-place': {
        type: 'drill',
        title: '純小數的首位非零項位置',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS115FirstNonzeroDecimalPlaceSet(5);
        },
      },
      's1-1-5-leading-digit': {
        type: 'drill',
        title: '判定最高位數字',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS115LeadingDigitSet(5);
        },
      },
      's1-1-5-characteristic-mantissa-algebra': {
        type: 'drill',
        title: '首數與尾數的代數性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS115CharacteristicMantissaAlgebraSet(5);
        },
      },
      's1-1-5-log-operation-scientific-notation': {
        type: 'drill',
        title: '常用對數運算與科學記號轉換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS115LogOperationScientificNotationSet(5);
        },
      },
      's1-2-1-projection-symmetry': {
        type: 'drill',
        title: '點對直線的投影與對稱',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121ProjectionSymmetrySet(5);
        },
      },
      's1-2-1-line-cluster-fixed-point': {
        type: 'drill',
        title: '直線族與恆過定點',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121LineClusterFixedPointSet(5);
        },
      },
      's1-2-1-triangle-nonexistence': {
        type: 'drill',
        title: '三線不能圍成三角形的參數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121TriangleNonexistenceSet(5);
        },
      },
      's1-2-1-inverse-distance': {
        type: 'drill',
        title: '點到線與平行線距離逆向應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121InverseDistanceSet(5);
        },
      },
      's1-2-1-geometric-optimization': {
        type: 'drill',
        title: '數線幾何與距離極值問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121GeometricOptimizationSet(5);
        },
      },
      's1-2-1-triangle-centers': {
        type: 'drill',
        title: '三角形四心的解析坐標',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121TriangleCentersSet(5);
        },
      },
      's1-2-1-intercept-constraints': {
        type: 'drill',
        title: '給定截距特定關係的直線',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121InterceptConstraintsSet(5);
        },
      },
      's1-2-1-angles-between-lines': {
        type: 'drill',
        title: '兩直線交角與正切公式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121AnglesBetweenLinesSet(5);
        },
      },
      's1-2-1-light-reflection-path': {
        type: 'drill',
        title: '光線反射與路徑坐標',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121LightReflectionPathSet(5);
        },
      },
      's1-2-1-area-partitioning': {
        type: 'drill',
        title: '平分多邊形面積的直線',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121AreaPartitioningSet(5);
        },
      },
      's1-2-1-line-segment-slope-range': {
        type: 'drill',
        title: '直線與線段相交的斜率範圍',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121LineSegmentSlopeRangeSet(5);
        },
      },
      's1-2-1-point-line-side': {
        type: 'drill',
        title: '點對直線的相對位置',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121PointLineSideSet(5);
        },
      },
      's1-2-1-lattice-point-counting': {
        type: 'drill',
        title: '線性不等式區域內的格子點計數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121LatticePointCountingSet(5);
        },
      },
      's1-2-1-absolute-inequality-area': {
        type: 'drill',
        title: '含絕對值的二元一次不等式圍成面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS121AbsoluteInequalityAreaSet(5);
        },
      },
      's1-2-2-general-to-standard': {
        type: 'drill',
        title: '一般式轉換為標準式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS122GeneralToStandardSet(5);
        },
      },
      's1-2-2-circle-discriminant-parameter': {
        type: 'drill',
        title: '圓的判定與參數範圍',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS122CircleDiscriminantParameterSet(5);
        },
      },
      's1-2-2-circle-from-conditions': {
        type: 'drill',
        title: '給定幾何條件求圓方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS122CircleFromConditionsSet(5);
        },
      },
      's1-2-2-apollonius-circle': {
        type: 'drill',
        title: '阿波羅尼斯圓',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS122ApolloniusCircleSet(5);
        },
      },
      's1-2-2-radical-axis': {
        type: 'drill',
        title: '圓系方程與公共弦應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS122RadicalAxisSet(5);
        },
      },
      's1-2-2-point-circle-distance-extrema': {
        type: 'drill',
        title: '點到圓的距離極值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS122PointCircleDistanceExtremaSet(5);
        },
      },
      's1-2-2-axis-tangent-circle': {
        type: 'drill',
        title: '與兩坐標軸相切的圓',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS122AxisTangentCircleSet(5);
        },
      },
      's1-2-2-parametric-standard-circle': {
        type: 'drill',
        title: '圓的參數式與標準式互換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS122ParametricStandardSet(5);
        },
      },
      's1-2-2-circle-point-algebra-extrema': {
        type: 'drill',
        title: '圓上動點的代數式極值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS122CirclePointAlgebraExtremaSet(5);
        },
      },
      's1-2-2-triangle-circum-incircle': {
        type: 'drill',
        title: '三角形之外接圓與內切圓',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS122TriangleCircumInCircleSet(5);
        },
      },
      's1-2-3-given-slope-tangent': {
        type: 'drill',
        title: '給定斜率的切線方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123GivenSlopeTangentSet(5);
        },
      },
      's1-2-3-external-point-tangent': {
        type: 'drill',
        title: '過圓外一點的切線與切線長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123ExternalPointTangentSet(5);
        },
      },
      's1-2-3-chord-length': {
        type: 'drill',
        title: '圓的弦長與幾何性質應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123ChordLengthSet(5);
        },
      },
      's1-2-3-chord-midpoint-locus': {
        type: 'drill',
        title: '弦中點的軌跡方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123ChordMidpointLocusSet(5);
        },
      },
      's1-2-3-perpendicular-tangents-locus': {
        type: 'drill',
        title: '互相垂直切線的交點軌跡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123PerpendicularTangentsLocusSet(5);
        },
      },
      's1-2-3-radical-axis-circle-family': {
        type: 'drill',
        title: '兩圓根軸、公共弦與圓系方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123RadicalAxisCircleFamilySet(5);
        },
      },
      's1-2-3-polar-line': {
        type: 'drill',
        title: '極線與切點弦方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123PolarLineSet(5);
        },
      },
      's1-2-3-light-shadow-projection': {
        type: 'drill',
        title: '光源投影與陰影長度計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123LightShadowProjectionSet(5);
        },
      },
      's1-2-3-line-circle-parameter-relation': {
        type: 'drill',
        title: '圓與直線相交情形參數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123LineCircleParameterRelationSet(5);
        },
      },
      's1-2-3-point-power-tangent-chord': {
        type: 'drill',
        title: '點對圓的冪與切線長應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123PointPowerTangentChordSet(5);
        },
      },
      's1-2-3-vertical-tangent-trap': {
        type: 'drill',
        title: '切線斜率的鉛垂線陷阱',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123VerticalTangentTrapSet(5);
        },
      },
      's1-2-3-integer-distance-counting': {
        type: 'drill',
        title: '圓上動點與定點的整數距離計數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123IntegerDistanceCountingSet(5);
        },
      },
      's1-2-3-common-chord-diameter-circle': {
        type: 'drill',
        title: '以公弦為直徑的圓',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123CommonChordDiameterCircleSet(5);
        },
      },
      's1-2-3-circle-area-extrema': {
        type: 'drill',
        title: '圓內接或外切圖形的面積極值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS123CircleAreaExtremaSet(5);
        },
      },
      's1-3-1-polynomial-five-subtypes': {
        type: 'drill',
        title: '多項式進階技巧五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131PolynomialFiveSubtypeMixedSet(5);
        },
      },
      's1-3-1-coefficient-sum-parity': {
        type: 'drill',
        title: '多項式係數總和與奇偶項係數和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131CoefficientSumParitySet(5);
        },
      },
      's1-3-1-difference-reverse-polynomial': {
        type: 'drill',
        title: '由差分反推原多項式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131DifferenceReversePolynomialSet(5);
        },
      },
      's1-3-1-polynomial-identity-parameters': {
        type: 'drill',
        title: '多項式相等與恆等式參數求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131PolynomialIdentityParameterSet(5);
        },
      },
      's1-3-1-degree-after-operations': {
        type: 'drill',
        title: '運算後的多項式次數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131DegreeAfterOperationsSet(5);
        },
      },
      's1-3-1-specific-coefficient': {
        type: 'drill',
        title: '多項式變形與特定項係數組合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131SpecificCoefficientSet(5);
        },
      },
      's1-3-1-division-remainder-five-subtypes': {
        type: 'drill',
        title: '多項式除法與餘式五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131DivisionRemainderFiveSubtypeMixedSet(5);
        },
      },
      's1-3-1-ax-minus-b-division': {
        type: 'drill',
        title: '除式為 ax-b 型的綜合除法',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131AxMinusBDivisionSet(5);
        },
      },
      's1-3-1-successive-division-taylor': {
        type: 'drill',
        title: '連續綜合除法與降冪排列',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131SuccessiveDivisionTaylorSet(5);
        },
      },
      's1-3-1-product-specific-coefficient': {
        type: 'drill',
        title: '多項式乘法展開的特定項係數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131ProductSpecificCoefficientSet(5);
        },
      },
      's1-3-1-remainder-transformation': {
        type: 'drill',
        title: '變形多項式的餘式推導',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131RemainderTransformationSet(5);
        },
      },
      's1-3-1-high-power-remainder': {
        type: 'drill',
        title: '高次方項除法的特殊降次法',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131HighPowerRemainderSet(5);
        },
      },
      's1-3-1-advanced-remainder-five-subtypes': {
        type: 'drill',
        title: '高次餘式與除式變形五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131AdvancedRemainderFiveSubtypeMixedSet(5);
        },
      },
      's1-3-1-complex-root-remainder': {
        type: 'drill',
        title: '利用複數根求解高次項餘式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131ComplexRootRemainderSet(5);
        },
      },
      's1-3-1-composition-remainder': {
        type: 'drill',
        title: '多項式函數合成的餘式問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131CompositionRemainderSet(5);
        },
      },
      's1-3-1-square-divisor-remainder': {
        type: 'drill',
        title: '完全平方除式的餘式判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131SquareDivisorRemainderSet(5);
        },
      },
      's1-3-1-stepwise-remainder-construction': {
        type: 'drill',
        title: '階梯式餘式推導與建立',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131StepwiseRemainderConstructionSet(5);
        },
      },
      's1-3-1-coefficient-transform-remainder': {
        type: 'drill',
        title: '除法原理的係數變換與商式推導',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131CoefficientTransformRemainderSet(5);
        },
      },
      's1-3-1-remainder-applications-five-subtypes': {
        type: 'drill',
        title: '餘式運算與特殊降次五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131RemainderApplicationsFiveSubtypeMixedSet(5);
        },
      },
      's1-3-1-remainder-operations': {
        type: 'drill',
        title: '多項式四則運算後的餘式判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131RemainderOperationsSet(5);
        },
      },
      's1-3-1-low-to-high-remainder': {
        type: 'drill',
        title: '給定低次餘式求高次乘積項餘式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131LowToHighRemainderSet(5);
        },
      },
      's1-3-1-transformed-dividend-remainder': {
        type: 'drill',
        title: '被除式變形後的餘式推導',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131TransformedDividendRemainderSet(5);
        },
      },
      's1-3-1-square-divisor-calculation': {
        type: 'drill',
        title: '完全平方除式與高次餘式計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131SquareDivisorCalculationSet(5);
        },
      },
      's1-3-1-special-xn-remainder': {
        type: 'drill',
        title: '特殊 x^n 正負一的降次代換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131SpecialXnRemainderSet(5);
        },
      },
      's1-3-1-division-principle-reverse-two-subtypes': {
        type: 'drill',
        title: '除法原理反推與整除判定綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131DivisionPrincipleReverseTwoSubtypeMixedSet(5);
        },
      },
      's1-3-1-recover-dividend-from-quotient': {
        type: 'drill',
        title: '給定商式與餘式反求被除式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131RecoverDividendFromQuotientSet(5);
        },
      },
      's1-3-1-divisibility-unknown-coefficients': {
        type: 'drill',
        title: '利用整除性質求未知係數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131DivisibilityUnknownCoefficientSet(5);
        },
      },
      's1-3-1-interpolation-polynomial-five-subtypes': {
        type: 'drill',
        title: '插值多項式五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131InterpolationPolynomialFiveSubtypeMixedSet(5);
        },
      },
      's1-3-1-interpolation-from-points': {
        type: 'drill',
        title: '給定點坐標求最低次插值多項式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131InterpolationPolynomialFromPointsSet(5);
        },
      },
      's1-3-1-interpolation-value-only': {
        type: 'drill',
        title: '插值多項式的特定數值求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131InterpolationValueOnlySet(5);
        },
      },
      's1-3-1-interpolation-structural-remainder': {
        type: 'drill',
        title: '插值結構化設定與餘式定理結合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131InterpolationStructuralRemainderSet(5);
        },
      },
      's1-3-1-interpolation-finite-difference': {
        type: 'drill',
        title: '等差坐標的階差速解法',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131InterpolationFiniteDifferenceSet(5);
        },
      },
      's1-3-1-interpolation-lagrange-special': {
        type: 'drill',
        title: '拉格朗日列式的恆等式與特殊性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS131InterpolationLagrangeSpecialSet(5);
        },
      },
      's2-1-1-sequence-core-five-subtypes': {
        type: 'drill',
        title: '數列核心五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS211SequenceFiveSubtypeMixedSet(5);
        },
      },
      's2-1-1-nth-formula-value': {
        type: 'drill',
        title: '已知一般項公式求特定項',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS211NthFormulaValueSet(5);
        },
      },
      's2-1-1-arithmetic-basic-parameters': {
        type: 'drill',
        title: '等差數列基本參數計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS211ArithmeticBasicParameterSet(5);
        },
      },
      's2-1-1-geometric-basic-parameters': {
        type: 'drill',
        title: '等比數列基本參數計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS211GeometricBasicParameterSet(5);
        },
      },
      's2-1-1-means-application': {
        type: 'drill',
        title: '等差中項與等比中項應用',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS211MeansApplicationSet(5);
        },
      },
      's2-1-1-basic-recurrence-terms': {
        type: 'drill',
        title: '基礎遞迴關係式項數推導',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS211BasicRecurrenceTermSet(5);
        },
      },
      's2-1-1-arithmetic-geometric-mixed-parameters': {
        type: 'drill',
        title: '等差與等比數列的混合參數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS211ArithmeticGeometricMixedParameterSet(5);
        },
      },
      's2-1-1-visual-group-patterns': {
        type: 'drill',
        title: '圖形規律與群數列',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS211VisualGroupPatternSet(5);
        },
      },
      's2-1-1-recurrence-transform-mixed': {
        type: 'drill',
        title: '遞迴轉換與一般項推測',
        difficulty: 'medium',
        questionCount: 8,
        generate() {
          return buildS211RecurrenceTransformSet(8);
        },
      },
      's2-1-1-cumulative-product-recurrence': {
        type: 'drill',
        title: '累加型與累乘型遞迴',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS211CumulativeProductRecurrenceSet(5);
        },
      },
      's2-1-1-combinatorial-recurrence': {
        type: 'drill',
        title: '計數類遞迴與費氏數列',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS211CombinatorialRecurrenceSet(5);
        },
      },
      's2-1-1-geometric-coordinate-sequences': {
        type: 'drill',
        title: '幾何分割與座標數列',
        difficulty: 'medium',
        questionCount: 8,
        generate() {
          return buildS211GeometricCoordinateSequenceSet(8);
        },
      },
      's2-1-2-series-sum-seven-subtypes': {
        type: 'drill',
        title: '等差級數與求和七小類綜合',
        difficulty: 'medium',
        questionCount: 7,
        generate() {
          return buildS212SevenSubtypeMixedSet(7);
        },
      },
      's2-1-2-basic-sum-formula': {
        type: 'drill',
        title: '基礎公式求和',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS212BasicSumFormulaSet(5);
        },
      },
      's2-1-2-range-multiple-sum': {
        type: 'drill',
        title: '範圍內倍數之和',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS212RangeMultipleSumSet(5);
        },
      },
      's2-1-2-max-sum': {
        type: 'drill',
        title: '級數和的最大值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212MaxSumSet(5);
        },
      },
      's2-1-2-sn-to-an': {
        type: 'drill',
        title: '已知 Sn 公式求一般項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212SnToAnSet(5);
        },
      },
      's2-1-2-two-ap-ratio': {
        type: 'drill',
        title: '兩等差數列的和與項之比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212TwoApRatioSet(5);
        },
      },
      's2-1-2-applications': {
        type: 'drill',
        title: '等差級數生活情境應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212ApplicationSet(5);
        },
      },
      's2-1-2-given-sn-general-term': {
        type: 'drill',
        title: '給定前 n 項和公式求一般項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212GivenSnGeneralTermSet(5);
        },
      },
      's2-1-2-geometric-series-five-subtypes': {
        type: 'drill',
        title: '等比級數與複利五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212GeometricSeriesFiveSubtypeMixedSet(5);
        },
      },
      's2-1-2-geometric-basic-sum': {
        type: 'drill',
        title: '等比級數基礎參數求和',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS212GeometricBasicSumSet(5);
        },
      },
      's2-1-2-geometric-series-compute': {
        type: 'drill',
        title: '等比級數求和計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS212GeometricSeriesComputeSet(5);
        },
      },
      's2-1-2-geometric-segment-property': {
        type: 'drill',
        title: '等比級數分段和性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212GeometricSegmentPropertySet(5);
        },
      },
      's2-1-2-geometric-sn-to-an': {
        type: 'drill',
        title: '等比型 Sn 公式求一般項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212GeometricSnToAnSet(5);
        },
      },
      's2-1-2-geometric-applications': {
        type: 'drill',
        title: '等比級數生活情境應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212GeometricApplicationsSet(5);
        },
      },
      's2-1-2-sigma-five-subtypes': {
        type: 'drill',
        title: 'Sigma 求和五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212SigmaFiveSubtypeMixedSet(5);
        },
      },
      's2-1-2-sigma-formula-range': {
        type: 'drill',
        title: 'Sigma 標準公式與範圍變換',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS212SigmaFormulaRangeSet(5);
        },
      },
      's2-1-2-sigma-linearity': {
        type: 'drill',
        title: 'Sigma 線性性質與常數項',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS212SigmaLinearitySet(5);
        },
      },
      's2-1-2-sigma-telescoping': {
        type: 'drill',
        title: '分式拆項對消',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212SigmaTelescopingSet(5);
        },
      },
      's2-1-2-sigma-pattern': {
        type: 'drill',
        title: '數列規律轉化為 Sigma 記號',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212SigmaPatternSet(5);
        },
      },
      's2-1-2-sigma-mixed': {
        type: 'drill',
        title: '多項式與指數混合型 Sigma',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS212SigmaMixedSet(5);
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
