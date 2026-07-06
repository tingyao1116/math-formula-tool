(() => {
  const store = window.formulaPracticeStore;
  if (!store || typeof store.registerConfigs !== 'function') return;

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

  function randomJ611Coefficient(options = {}) {
    const denChoices = options.integerOnly ? [1] : [1, 1, 1, 2, 3, 4];
    const den = denChoices[randInt(0, denChoices.length - 1)];
    let num = pickNonZero(-9, 9);
    if (options.positive) num = randInt(1, 9);
    if (options.negative) num = -randInt(1, 9);
    return makeFraction(num, den);
  }

  function formatJ611SignedLinearTerm(coeff) {
    if (coeff === 0) return '';
    const sign = coeff > 0 ? '+' : '-';
    const abs = Math.abs(coeff);
    return `${sign}${abs === 1 ? '' : abs}x`;
  }

  function formatJ611SignedConstant(constant) {
    if (constant === 0) return '';
    return `${constant > 0 ? '+' : '-'}${Math.abs(constant)}`;
  }

  function formatJ611GeneralQuadratic(a, b, c) {
    return `y=${formatJ611Coefficient(a)}x^2${formatJ611SignedLinearTerm(b)}${formatJ611SignedConstant(c)}`;
  }

  function j611FractionValueAt(a, x) {
    return makeFraction(a.num * x * x, a.den);
  }

  function buildJ611QuadraticDefinitionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = randomJ611Coefficient();
        const b = randInt(-6, 6);
        const c = randInt(-9, 9);
        const eq = formatJ611GeneralQuadratic(a, b, c);
        questions.push(`判斷\\(${eq}\\) 是否為二次函數？`);
        answers.push(
          `簡答：是。過程：整理後最高次項是 \\(x^2\\)，且二次項係數 \\(a=${fractionToLatex(a)}\\neq0\\)，所以是二次函數。`
        );
        continue;
      }
      if (mode === 1) {
        const m = pickNonZero(-8, 8);
        const c = randInt(-9, 9);
        questions.push(`判斷 \\(y=${m}x${formatJ611SignedConstant(c)}\\) 是否為二次函數？`);
        answers.push('簡答：不是。過程：最高次只有一次，沒有非零的 \\(x^2\\) 項，所以不是二次函數。');
        continue;
      }
      if (mode === 2) {
        const n = randInt(2, 9);
        questions.push(`判斷 \\(y=\\dfrac{${n}}{x^2}\\) 是否為二次函數？`);
        answers.push('簡答：不是。過程：二次函數必須能寫成 \\(y=ax^2+bx+c\\)，變數 \\(x\\) 不能在分母中。');
        continue;
      }
      if (mode === 3) {
        const a = pickNonZero(-5, 5);
        const c = randInt(-6, 6);
        questions.push(`判斷 \\(y=${a}x^2${formatJ611SignedLinearTerm(c)}-${a}x^2\\) 化簡後是否為二次函數？`);
        answers.push(
          `簡答：不是。過程：\\(${a}x^2-${a}x^2=0\\)，二次項被消掉，化簡後只剩一次項或常數，所以不是二次函數。`
        );
        continue;
      }
      const a = randInt(1, 6);
      questions.push(`判斷 \\(y=|${a}x^2-1|\\) 是否為二次函數？`);
      answers.push(
        '簡答：不是。過程：雖然絕對值內有 \\(x^2\\)，但整個式子含有絕對值，不能化成固定的 \\(ax^2+bx+c\\) 形式。'
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611OpeningDirectionVertexAxisSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randomJ611Coefficient();
      const eq = formatJ611Parabola(a);
      const opensUp = a.num > 0;
      const mode = i % 4;
      if (mode === 0) {
        questions.push(`二次函數 \\(${eq}\\) 的開口方向為何？`);
        answers.push(
          `簡答：開口向${opensUp ? '上' : '下'}。過程：對 \\(y=ax^2\\) 而言，\\(a>0\\) 開口向上，\\(a<0\\) 開口向下。本題 \\(a=${fractionToLatex(a)}\\)，所以開口向${opensUp ? '上' : '下'}。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`二次函數 \\(${eq}\\) 具有最高點還是最低點？`);
        answers.push(
          `簡答：${opensUp ? '最低點' : '最高點'}。過程：\\(y=ax^2\\) 的頂點固定為 \\((0,0)\\)。若 \\(a>0\\) 開口向上，頂點是最低點；若 \\(a<0\\) 開口向下，頂點是最高點。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`二次函數 \\(${eq}\\) 的對稱軸方程式為何？`);
        answers.push(
          '簡答：\\(x=0\\)。過程：標準型 \\(y=ax^2\\) 的圖形以 \\(y\\) 軸為對稱軸，因此對稱軸方程式為 \\(x=0\\)。'
        );
        continue;
      }
      questions.push(`二次函數 \\(${eq}\\) 的頂點坐標為何？`);
      answers.push('簡答：\\((0,0)\\)。過程：標準型 \\(y=ax^2\\) 沒有左右或上下平移，所以頂點固定在原點 \\((0,0)\\)。');
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611OpeningWidthOrderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const seen = new Set();
      const list = [];
      while (list.length < 3) {
        const a = randomJ611Coefficient();
        const key = `${Math.abs(a.num)}/${a.den}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push(a);
        }
      }
      const labels = ['甲', '乙', '丙'];
      const descriptions = list.map((a, idx) => `${labels[idx]}：\\(${formatJ611Parabola(a)}\\)`).join('，');
      const narrowToWide = list
        .map((a, idx) => ({ label: labels[idx], abs: Math.abs(a.num / a.den), a }))
        .sort((x, y) => y.abs - x.abs);
      const wideToNarrow = narrowToWide.slice().reverse();
      if (i % 2 === 0) {
        questions.push(`${descriptions}，請依開口由小到大排列。`);
        answers.push(
          `簡答：${narrowToWide.map((item) => item.label).join('、')}。過程：\\(|a|\\) 越大，開口越小；\\(|a|\\) 越小，開口越大。各式的 \\(|a|\\) 分別為 $${list.map((a, idx) => `${labels[idx]}:${formatJ611Abs(a)}`).join('、')}$，所以由小到大為 ${narrowToWide.map((item) => item.label).join('、')}。`
        );
      } else {
        questions.push(`${descriptions}，請依開口由大到小排列。`);
        answers.push(
          `簡答：${wideToNarrow.map((item) => item.label).join('、')}。過程：\\(|a|\\) 越小，開口越大；\\(|a|\\) 越大，開口越小。各式的 \\(|a|\\) 分別為 $${list.map((a, idx) => `${labels[idx]}:${formatJ611Abs(a)}`).join('、')}$，所以由大到小為 ${wideToNarrow.map((item) => item.label).join('、')}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611FindCoefficientFromPointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const x = pickNonZero(-6, 6);
      const a = randomJ611Coefficient();
      const y = j611FractionValueAt(a, x);
      const yText = fractionToLatex(y);
      const xSub = x < 0 ? `(${x})` : `${x}`;
      questions.push(`二次函數 \\(y=ax^2\\) 通過點 \\((${x},${yText})\\)，求 \\(a\\) 之值。`);
      answers.push(
        `簡答：\\(a=${fractionToLatex(a)}\\)。過程：把點 \\((${x},${yText})\\) 代入 \\(y=ax^2\\)，得 \\(${yText}=a\\cdot${xSub}^2\\)。所以 \\(a=\\dfrac{${yText}}{${x * x}}=${fractionToLatex(a)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611YAxisReflectionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 5 === 4) {
        questions.push(`若 \\(y=ax^2\\) 通過 \\((p,q)\\)，則該圖形必也會通過哪一個點？請用 \\(p,q\\) 表示。`);
        answers.push(
          '簡答：\\((-p,q)\\)。過程：\\(y=ax^2\\) 以 \\(y\\) 軸為對稱軸，點的 \\(x\\) 坐標會變成相反數，而 \\(y\\) 坐標不變，所以對稱點為 \\((-p,q)\\)。'
        );
        continue;
      }
      const a = randomJ611Coefficient();
      const x = pickNonZero(-7, 7);
      const y = j611FractionValueAt(a, x);
      const yText = fractionToLatex(y);
      const reflected = `(${-x},${yText})`;
      questions.push(`點 \\((${x},${yText})\\) 在 \\(${formatJ611Parabola(a)}\\) 圖形上，其對稱點坐標為何？`);
      answers.push(
        `簡答：\\(${reflected}\\)。過程：\\(y=ax^2\\) 的對稱軸是 \\(y\\) 軸，也就是 \\(x=0\\)。關於 \\(y\\) 軸對稱時，\\(x\\) 坐標變號、\\(y\\) 坐標不變，所以對稱點為 \\(${reflected}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611QuadrantLocationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randomJ611Coefficient();
      const opensUp = a.num > 0;
      questions.push(`二次函數 \\(${formatJ611Parabola(a)}\\) 的圖形除了原點外，主要分布在哪些象限？`);
      answers.push(
        `簡答：第${opensUp ? '一、二' : '三、四'}象限。過程：\\(x^2\\ge0\\)，所以 \\(y=ax^2\\) 的 \\(y\\) 值符號由 \\(a\\) 決定。本題 \\(a${opensUp ? '>0' : '<0'}\\)，除原點外 \\(y${opensUp ? '>0' : '<0'}\\)，故在第${opensUp ? '一、二' : '三、四'}象限。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611ParabolaAx2FourSubtypeMixedSet(count) {
    const banks = [
      buildJ611QuadraticDefinitionSet,
      buildJ611OpeningDirectionVertexAxisSet,
      buildJ611OpeningWidthOrderSet,
      buildJ611FindCoefficientFromPointSet,
      buildJ611YAxisReflectionSet,
      buildJ611QuadrantLocationSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611SquareInParabolaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const side = randInt(2, 12);
      const a = makeFraction(4, side);
      const area = side * side;
      const perimeter = 4 * side;
      const askArea = i % 3 !== 1;
      questions.push(
        `正方形 \\(ABCD\\) 中，\\(A,B\\) 在 \\(x\\) 軸上，\\(C,D\\) 在二次函數 \\(${formatJ611Parabola(a)}\\) 的圖形上，且正方形關於 \\(y\\) 軸對稱。求此正方形的${askArea ? '面積' : '周長'}。`
      );
      answers.push(
        `簡答：${askArea ? area : perimeter}。過程：設正方形邊長為 \\(s\\)，則上方頂點可設為 \\((\\frac{s}{2},s)\\)。代入 \\(y=ax^2\\) 得 \\(s=a(\\frac{s}{2})^2\\)，所以 \\(a=\\frac{4}{s}\\)，本題 \\(a=${fractionToLatex(a)}\\)，故 \\(s=${side}\\)。因此${askArea ? `面積為 \\(${side}^2=${area}\\)` : `周長為 \\(4\\cdot${side}=${perimeter}\\)`}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611HorizontalChordLengthSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const x0 = randInt(2, 9);
      const a = randInt(1, 5) * (i % 2 === 0 ? 1 : -1);
      const k = a * x0 * x0;
      const length = 2 * x0;
      questions.push(
        `二次函數 \\(y=${a}x^2\\) 與水平直線 \\(y=${k}\\) 交於 \\(A,B\\) 兩點，求 \\(\\overline{AB}\\) 的長度。`
      );
      answers.push(
        `簡答：\\(${length}\\)。過程：聯立 \\(${k}=${a}x^2\\)，得 \\(x^2=${x0 * x0}\\)，所以交點的 \\(x\\) 坐標為 \\(\\pm${x0}\\)。水平弦長為 \\(${x0}-(-${x0})=${length}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611TriangleAreaOnParabolaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const x0 = randInt(2, 7);
      const a = randInt(1, 4);
      const k = a * x0 * x0;
      const area = x0 * k;
      questions.push(
        `直線 \\(y=${k}\\) 與二次函數 \\(y=${a}x^2\\) 交於 \\(A,B\\) 兩點，\\(O\\) 為原點，求 \\(\\triangle AOB\\) 的面積。`
      );
      answers.push(
        `簡答：\\(${area}\\)。過程：由 \\(${k}=${a}x^2\\) 得 \\(x=\\pm${x0}\\)，所以 \\(AB=${2 * x0}\\)。\\(O\\) 到直線 \\(y=${k}\\) 的距離為 \\(${k}\\)，故面積 \\(=\\frac12\\cdot${2 * x0}\\cdot${k}=${area}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611LineParabolaGridPointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 4);
      const m = randInt(3, 10);
      const limit = Math.floor(Math.sqrt(m / a));
      let countPoints = 0;
      for (let x = -limit; x <= limit; x += 1) {
        countPoints += m - a * x * x + 1;
      }
      questions.push(
        `在坐標平面上，求直線 \\(y=${m}\\) 與拋物線 \\(y=${a}x^2\\) 所圍區域內（含邊界）且坐標皆為整數的格子點共有幾個？`
      );
      answers.push(
        `簡答：\\(${countPoints}\\) 個。過程：區域內需滿足 \\(${a}x^2\\le y\\le ${m}\\)。整數 \\(x\\) 需滿足 \\(${a}x^2\\le ${m}\\)，所以 \\(|x|\\le${limit}\\)。再逐一計算每個整數 \\(x\\) 可搭配的整數 \\(y\\) 數量並相加，得到 \\(${countPoints}\\) 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611ParabolaModelingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const aInt = randInt(1, 3);
      const half = randInt(5, 12);
      const newHalf = randInt(2, half - 1);
      const depth = aInt * half * half;
      const newDepth = aInt * newHalf * newHalf;
      const lower = depth - newDepth;
      const width = 2 * half;
      questions.push(
        `一個拋物線形河道以最低處為原點，截面可設為 \\(y=ax^2\\)。若水深 \\(${depth}\\) 公尺時水面寬 \\(${width}\\) 公尺，當水位下降 \\(${lower}\\) 公尺時，水面寬為多少公尺？`
      );
      answers.push(
        `簡答：\\(${2 * newHalf}\\) 公尺。過程：水深 \\(${depth}\\) 時半寬為 \\(${half}\\)，代入 \\(y=ax^2\\) 得 \\(${depth}=a\\cdot${half}^2\\)，所以 \\(a=${aInt}\\)。下降 \\(${lower}\\) 公尺後水深為 \\(${newDepth}\\)，解 \\(${newDepth}=${aInt}x^2\\)，得 \\(x=${newHalf}\\)，故水面寬為 \\(${2 * newHalf}\\) 公尺。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ611ParabolaApplicationsFiveSubtypeMixedSet(count) {
    const banks = [
      buildJ611SquareInParabolaSet,
      buildJ611HorizontalChordLengthSet,
      buildJ611TriangleAreaOnParabolaSet,
      buildJ611LineParabolaGridPointSet,
      buildJ611ParabolaModelingSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function j612FormatVertexEquation(a, h, k) {
    const coeff = formatJ611Coefficient(a);
    const variablePart = j612FormatShiftedX(h);
    return `y=${coeff}${variablePart}^2${formatJ611SignedConstant(k)}`;
  }

  function j612FormatShiftedX(h) {
    return h === 0 ? 'x' : `(x${h > 0 ? '-' : '+'}${Math.abs(h)})`;
  }

  function j612ExpandVertexForm(a, h, k) {
    return {
      a,
      b: makeFraction(-2 * a.num * h, a.den),
      c: makeFraction(a.num * h * h + k * a.den, a.den),
    };
  }

  function j612FormatLinearFractionTerm(coeff) {
    const value = makeFraction(coeff.num, coeff.den);
    if (value.num === 0) return '';
    const sign = value.num > 0 ? '+' : '-';
    const absValue = makeFraction(Math.abs(value.num), value.den);
    if (absValue.den === 1) return `${sign}${absValue.num === 1 ? '' : absValue.num}x`;
    return `${sign}${absValue.num === 1 ? '' : fractionToLatex(absValue)}x`;
  }

  function j612FormatConstantFractionTerm(constant) {
    const value = makeFraction(constant.num, constant.den);
    if (value.num === 0) return '';
    return `${value.num > 0 ? '+' : '-'}${fractionToLatex(makeFraction(Math.abs(value.num), value.den))}`;
  }

  function j612FormatGeneralQuadratic(a, b, c) {
    return `y=${formatJ611Coefficient(a)}x^2${j612FormatLinearFractionTerm(b)}${j612FormatConstantFractionTerm(c)}`;
  }

  function j612ExtremeName(a) {
    return a.num > 0 ? '最小' : '最大';
  }

  function j612MoveText(dx, dy) {
    const horizontal = dx === 0 ? '' : `向${dx > 0 ? '右' : '左'}平移 ${Math.abs(dx)} 單位`;
    const vertical = dy === 0 ? '' : `向${dy > 0 ? '上' : '下'}平移 ${Math.abs(dy)} 單位`;
    if (horizontal && vertical) return `${horizontal}，再${vertical}`;
    return horizontal || vertical || '不平移';
  }

  function j612PickVertexData(options = {}) {
    const a = randomJ611Coefficient({ integerOnly: true });
    const h = randInt(-5, 5);
    const k = options.nonzeroK ? pickNonZero(-8, 8) : randInt(-8, 8);
    return { a, h, k };
  }

  function buildJ612VertexFormReadSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const { a, h, k } = j612PickVertexData();
      const eq = j612FormatVertexEquation(a, h, k);
      questions.push(
        `二次函數 \\(${eq}\\)：在 \\(x=\\) 多少時，有${j612ExtremeName(a)}值？此${j612ExtremeName(a)}值為何？並寫出對稱軸。`
      );
      answers.push(
        `簡答：在 \\(x=${h}\\) 時有${j612ExtremeName(a)}值 \\(${k}\\)，對稱軸為 \\(x=${h}\\)。過程：頂點式 \\(y=a(x-h)^2+k\\) 的頂點為 \\((h,k)\\)，本題頂點為 \\((${h},${k})\\)。因為 \\(a=${fractionToLatex(a)}${a.num > 0 ? '>0' : '<0'}\\)，所以頂點給出${j612ExtremeName(a)}值。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612CompletingSquareExtremeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const { a, h, k } = j612PickVertexData();
      const expanded = j612ExpandVertexForm(a, h, k);
      const general = j612FormatGeneralQuadratic(expanded.a, expanded.b, expanded.c);
      const vertex = j612FormatVertexEquation(a, h, k);
      questions.push(`將 \\(${general}\\) 化為頂點式，並求頂點坐標、對稱軸與${j612ExtremeName(a)}值。`);
      answers.push(
        `簡答：\\(${vertex}\\)，頂點 \\((${h},${k})\\)，對稱軸 \\(x=${h}\\)，${j612ExtremeName(a)}值為 \\(${k}\\)。過程：配方可把一般式化為 \\(y=a(x-h)^2+k\\)。本題化為 \\(${vertex}\\)，所以直接讀出頂點與極值。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612FunctionFromVertexPointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randomJ611Coefficient({ integerOnly: true });
      const h = randInt(-4, 4);
      const k = randInt(-6, 6);
      let p = h;
      while (p === h) p = randInt(-6, 6);
      const q = a.num * (p - h) * (p - h) + k;
      const eq = j612FormatVertexEquation(a, h, k);
      questions.push(`已知二次函數的頂點為 \\((${h},${k})\\)，且圖形通過點 \\((${p},${q})\\)，求此二次函數。`);
      answers.push(
        `簡答：\\(${eq}\\)。過程：設 \\(y=a${j612FormatShiftedX(h)}^2${formatJ611SignedConstant(k)}\\)，代入 \\((${p},${q})\\) 得 \\(${q}=a(${p - h})^2${formatJ611SignedConstant(k)}\\)，解得 \\(a=${fractionToLatex(a)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612ExtremeParameterFromConditionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = i % 2 === 0 ? randInt(1, 5) : -randInt(1, 5);
      const h = randInt(-5, 5);
      const extreme = randInt(-8, 12);
      const b = -2 * a * h;
      const c = extreme + a * h * h;
      const kind = a > 0 ? '最小' : '最大';
      if (i % 2 === 0) {
        questions.push(
          `已知二次函數 \\(y=${a}x^2${formatJ611SignedLinearTerm(b)}+k\\) 在 \\(x=${h}\\) 時有${kind}值 \\(${extreme}\\)，求 \\(k\\)。`
        );
        answers.push(
          `簡答：\\(k=${c}\\)。過程：此式的頂點 \\(x\\) 坐標為 \\(-\\frac{b}{2a}=${h}\\)。因為在 \\(x=${h}\\) 時函數值為 \\(${extreme}\\)，所以 \\(${extreme}=${a}\\cdot(${h})^2+${b}\\cdot(${h})+k\\)，解得 \\(k=${c}\\)。`
        );
        continue;
      }
      questions.push(
        `已知二次函數 \\(y=${a}x^2+bx${formatJ611SignedConstant(c)}\\) 在 \\(x=${h}\\) 時有${kind}值 \\(${extreme}\\)，求 \\(b\\)。`
      );
      answers.push(
        `簡答：\\(b=${b}\\)。過程：二次函數 \\(y=ax^2+bx+c\\) 的頂點 \\(x\\) 坐標為 \\(-\\frac{b}{2a}\\)。本題 \\(-\\frac{b}{2\\cdot${a}}=${h}\\)，所以 \\(b=${b}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612VertexFormExtremaMixedSet(count) {
    const banks = [
      buildJ612VertexFormReadSet,
      buildJ612CompletingSquareExtremeSet,
      buildJ612FunctionFromVertexPointSet,
      buildJ612ExtremeParameterFromConditionSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612BasicTranslationEquationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randomJ611Coefficient({ integerOnly: true });
      let dx = randInt(-7, 7);
      let dy = randInt(-8, 8);
      if (dx === 0 && dy === 0) dx = randInt(1, 7);
      const base = formatJ611Parabola(a);
      const eq = j612FormatVertexEquation(a, dx, dy);
      questions.push(`將 \\(${base}\\) 的圖形${j612MoveText(dx, dy)}，求新函數。`);
      answers.push(
        `簡答：\\(${eq}\\)。過程：由 \\(y=ax^2\\) 平移，右 \\(h\\)、上 \\(k\\) 後為 \\(y=a(x-h)^2+k\\)。本題 \\(h=${dx}\\)、\\(k=${dy}\\)，且平移不改變 \\(a\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612VertexAxisTranslationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const { a, h, k } = j612PickVertexData();
      const dx = pickNonZero(-6, 6);
      const dy = randInt(-6, 6);
      const newH = h + dx;
      const newK = k + dy;
      questions.push(
        `二次函數 \\(${j612FormatVertexEquation(a, h, k)}\\) 的圖形${j612MoveText(dx, dy)}，求新頂點坐標與對稱軸。`
      );
      answers.push(
        `簡答：新頂點為 \\((${newH},${newK})\\)，對稱軸為 \\(x=${newH}\\)。過程：平移只改變頂點位置，原頂點 \\((${h},${k})\\) 加上位移 \\((${dx},${dy})\\)，得到 \\((${newH},${newK})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612TranslationReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randomJ611Coefficient({ integerOnly: true });
      const h1 = randInt(-5, 5);
      const k1 = randInt(-6, 6);
      const dx = pickNonZero(-6, 6);
      const dy = pickNonZero(-6, 6);
      const h2 = h1 + dx;
      const k2 = k1 + dy;
      questions.push(
        `\\(${j612FormatVertexEquation(a, h1, k1)}\\) 的圖形經過平移後變成 \\(${j612FormatVertexEquation(a, h2, k2)}\\)，請問向哪個方向平移各幾單位？`
      );
      answers.push(
        `簡答：${j612MoveText(dx, dy)}。過程：比較頂點，原頂點為 \\((${h1},${k1})\\)，新頂點為 \\((${h2},${k2})\\)，位移量為 \\((${h2}-${h1},${k2}-${k1})=(${dx},${dy})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612CongruenceSameASet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const labels = ['甲', '乙', '丙'];
    for (let i = 0; i < count; i += 1) {
      const a = randomJ611Coefficient({ integerOnly: true });
      const otherA = makeFraction(a.num + (a.num > 0 ? 1 : -1), 1);
      const items = [
        { label: '甲', eq: j612FormatVertexEquation(a, randInt(-4, 4), randInt(-5, 5)), same: true },
        { label: '乙', eq: j612FormatVertexEquation(a, randInt(-4, 4), randInt(-5, 5)), same: true },
        { label: '丙', eq: j612FormatVertexEquation(otherA, randInt(-4, 4), randInt(-5, 5)), same: false },
      ];
      const shuffled = shuffle(items);
      const desc = shuffled.map((item) => `${item.label}：\\(${item.eq}\\)`).join('，');
      const answerLabels = shuffled
        .filter((item) => item.same)
        .map((item) => item.label)
        .join('、');
      questions.push(`${desc}，哪些圖形可由同一個二次函數圖形平移後互相重合？`);
      answers.push(
        `簡答：${answerLabels}。過程：二次函數圖形只靠平移互相重合時，開口大小與方向不變，也就是 \\(a\\) 值相同；頂點位置不同沒有關係。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612PointAfterTranslationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const x = randInt(-6, 6);
      const y = randInt(-8, 8);
      const dx = pickNonZero(-7, 7);
      const dy = pickNonZero(-7, 7);
      questions.push(`圖形上的點 \\((${x},${y})\\) 隨函數圖形${j612MoveText(dx, dy)}，求移動後此點的坐標。`);
      answers.push(
        `簡答：\\((${x + dx},${y + dy})\\)。過程：圖形平移時，圖形上每一點都跟著加上相同位移量；所以 \\((x,y)\\to(x+${dx},y+${dy})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612TranslationGraphMixedSet(count) {
    const banks = [
      buildJ612BasicTranslationEquationSet,
      buildJ612VertexAxisTranslationSet,
      buildJ612TranslationReverseSet,
      buildJ612CongruenceSameASet,
      buildJ612PointAfterTranslationSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612XInterceptsCoordinateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randomJ611Coefficient({ integerOnly: true });
      const h = randInt(-5, 5);
      const r = randInt(1, 6);
      const k = -a.num * r * r;
      const eq = j612FormatVertexEquation(a, h, k);
      const x1 = h - r;
      const x2 = h + r;
      questions.push(`求二次函數 \\(${eq}\\) 與 \\(x\\) 軸的交點坐標。`);
      answers.push(
        `簡答：\\((${x1},0)\\)、\\((${x2},0)\\)。過程：令 \\(y=0\\)，得 \\(0=${fractionToLatex(a)}${j612FormatShiftedX(h)}^2${formatJ611SignedConstant(k)}\\)，所以 \\(${j612FormatShiftedX(h)}^2=${r * r}\\)，\\(x=${x1}\\) 或 \\(x=${x2}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612DiscriminantCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      let a = pickNonZero(-5, 5);
      let b;
      let c;
      let countText;
      if (mode === 0) {
        let r1 = randInt(-5, 4);
        let r2 = r1;
        while (r2 === r1) r2 = randInt(-5, 5);
        b = -a * (r1 + r2);
        c = a * r1 * r2;
        countText = '兩個';
      } else if (mode === 1) {
        const r = randInt(-5, 5);
        b = -2 * a * r;
        c = a * r * r;
        countText = '一個';
      } else {
        a = i % 2 === 0 ? randInt(1, 5) : -randInt(1, 5);
        const h = randInt(-4, 4);
        const k = a > 0 ? randInt(1, 8) : -randInt(1, 8);
        const expanded = j612ExpandVertexForm(makeFraction(a), h, k);
        b = expanded.b.num / expanded.b.den;
        c = expanded.c.num / expanded.c.den;
        countText = '沒有';
      }
      const d = b * b - 4 * a * c;
      const eq = j612FormatGeneralQuadratic(makeFraction(a), makeFraction(b), makeFraction(c));
      questions.push(`判斷二次函數 \\(${eq}\\) 與 \\(x\\) 軸有幾個交點。`);
      answers.push(
        `簡答：${countText}交點。過程：判別式 \\(D=b^2-4ac=${d}\\)。因為 \\(D${d > 0 ? '>0' : d === 0 ? '=0' : '<0'}\\)，所以與 \\(x\\) 軸有${countText}交點。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612VertexPositionIntersectionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      const opensUp = i % 2 === 0;
      const a = makeFraction(opensUp ? randInt(1, 5) : -randInt(1, 5));
      const h = randInt(-5, 5);
      let k;
      let countText;
      if (mode === 0) {
        k = 0;
        countText = '一個';
      } else if (mode === 1) {
        k = opensUp ? -randInt(1, 8) : randInt(1, 8);
        countText = '兩個';
      } else {
        k = opensUp ? randInt(1, 8) : -randInt(1, 8);
        countText = '沒有';
      }
      const eq = j612FormatVertexEquation(a, h, k);
      questions.push(`利用頂點位置與開口方向，判斷 \\(${eq}\\) 與 \\(x\\) 軸有幾個交點。`);
      answers.push(
        `簡答：${countText}交點。過程：頂點為 \\((${h},${k})\\)，且圖形開口向${opensUp ? '上' : '下'}。${countText === '一個' ? '頂點剛好在 \\(x\\) 軸上，所以只相切一次。' : countText === '兩個' ? `頂點在 \\(x\\) 軸${opensUp ? '下方且開口向上' : '上方且開口向下'}，圖形會穿過 \\(x\\) 軸兩次。` : `頂點在 \\(x\\) 軸${opensUp ? '上方且開口向上' : '下方且開口向下'}，整個圖形不會碰到 \\(x\\) 軸。`}`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ612XAxisIntersectionMixedSet(count) {
    const banks = [
      buildJ612XInterceptsCoordinateSet,
      buildJ612DiscriminantCountSet,
      buildJ612VertexPositionIntersectionSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613NumberSumSquareExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const sum = randInt(5, 25) * 2;
      const half = sum / 2;
      if (i % 3 === 0) {
        const minValue = 2 * half * half;
        questions.push(`已知兩數和為 \\(${sum}\\)，求這兩數平方和的最小值。`);
        answers.push(
          `簡答：\\(${minValue}\\)。過程：設一數為 \\(x\\)，另一數為 \\(${sum}-x\\)，平方和 \\(S=x^2+(${sum}-x)^2\\)。此二次函數開口向上，當兩數最接近，也就是 \\(x=\\frac{${sum}}{2}\\) 時最小。`
        );
        continue;
      }
      if (i % 3 === 1) {
        const product = Math.floor(half) * Math.ceil(half);
        questions.push(`將 \\(${sum}\\) 分成兩個非負數，求兩數乘積的最大值。`);
        answers.push(
          `簡答：\\(${product}\\)。過程：設兩數為 \\(x\\) 與 \\(${sum}-x\\)，乘積 \\(P=x(${sum}-x)=-x^2+${sum}x\\)。開口向下，頂點在 \\(x=\\frac{${sum}}{2}\\)，所以兩數越接近乘積越大。`
        );
        continue;
      }
      const diff = randInt(4, 20);
      questions.push(`已知兩個非負數的差為 \\(${diff}\\)，求兩數乘積的最小值。`);
      answers.push(
        `簡答：\\(0\\)。過程：設較大數為 \\(x+${diff}\\)，較小數為 \\(x\\)，且 \\(x\\ge0\\)。乘積為 \\(x(x+${diff})\\)，在可行範圍 \\(x\\ge0\\) 中，端點 \\(x=0\\) 時最小，故最小值為 \\(0\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613LineDistanceSquareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-9, 3);
      const b = randInt(a + 2, 10);
      const midpointNum = a + b;
      const minValue = ((b - a) * (b - a)) / 2;
      const midpointText = midpointNum % 2 === 0 ? `${midpointNum / 2}` : `\\frac{${midpointNum}}{2}`;
      const minText = Number.isInteger(minValue) ? `${minValue}` : fractionToLatex(makeFraction((b - a) * (b - a), 2));
      if (i % 2 === 0) {
        questions.push(
          `已知數線上兩點 \\(A(${a})\\)、\\(B(${b})\\)，找一點 \\(P(x)\\) 使 \\(PA^2+PB^2\\) 的值最小，並求最小值。`
        );
        answers.push(
          `簡答：\\(P\\) 在 \\(x=${midpointText}\\)，最小值為 \\(${minText}\\)。過程：\\(PA^2+PB^2=(x-${a})^2+(x-${b})^2\\)，其頂點在兩定點的中點。`
        );
      } else {
        const c = randInt(b + 2, b + 8);
        const averageNum = a + b + c;
        const avgText = averageNum % 3 === 0 ? `${averageNum / 3}` : `\\frac{${averageNum}}{3}`;
        questions.push(
          `已知數線上三點 \\(A(${a})\\)、\\(B(${b})\\)、\\(C(${c})\\)，找一點 \\(X(x)\\) 使 \\(XA^2+XB^2+XC^2\\) 最小。`
        );
        answers.push(
          `簡答：\\(x=${avgText}\\)。過程：多個距離平方和的最小點在坐標平均值，故 \\(x=\\dfrac{${a}+${b}+${c}}{3}=${avgText}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613LinearConstraintExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const sum = randInt(8, 30) * 2;
        const product = (sum / 2) * (sum / 2);
        questions.push(`已知 \\(x+y=${sum}\\)，且 \\(x,y\\ge0\\)，求 \\(xy\\) 的最大值。`);
        answers.push(
          `簡答：\\(${product}\\)。過程：令 \\(y=${sum}-x\\)，則 \\(xy=x(${sum}-x)=-x^2+${sum}x\\)。此拋物線開口向下，在 \\(x=\\frac{${sum}}{2}\\) 時有最大值。`
        );
        continue;
      }
      if (mode === 1) {
        const sum = randInt(12, 48);
        const minValue = (sum * sum) / 5;
        const minText = Number.isInteger(minValue) ? `${minValue}` : fractionToLatex(makeFraction(sum * sum, 5));
        questions.push(`已知 \\(x+2y=${sum}\\)，求 \\(x^2+y^2\\) 的最小值。`);
        answers.push(
          `簡答：\\(${minText}\\)。過程：由 \\(x=${sum}-2y\\)，得 \\(x^2+y^2=(${sum}-2y)^2+y^2\\)。配方後在 \\(y=\\frac{2\\cdot${sum}}{5}\\) 時最小，最小值為 \\(\\frac{${sum}^2}{5}\\)。`
        );
        continue;
      }
      const total = randInt(10, 40);
      const squareSum = total % 2 === 0 ? (total * total) / 2 : fractionToLatex(makeFraction(total * total, 2));
      questions.push(`已知 \\(x+y=${total}\\)，求 \\(x^2+y^2\\) 的最小值。`);
      answers.push(
        `簡答：\\(${squareSum}\\)。過程：平方和在兩數相等時最小，所以 \\(x=y=\\frac{${total}}{2}\\)，最小值為 \\(2\\left(\\frac{${total}}{2}\\right)^2=\\frac{${total * total}}{2}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613IntervalExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = i % 2 === 0 ? randInt(1, 4) : -randInt(1, 4);
      const h = randInt(-3, 5);
      const k = randInt(-8, 8);
      const left = h - randInt(1, 4);
      const right = h + randInt(1, 4);
      const expanded = j612ExpandVertexForm(makeFraction(a), h, k);
      const eq = j612FormatGeneralQuadratic(expanded.a, expanded.b, expanded.c);
      const valueAt = (x) => a * (x - h) * (x - h) + k;
      const candidates = [
        { x: left, y: valueAt(left) },
        { x: right, y: valueAt(right) },
        { x: h, y: k },
      ];
      const maxItem = candidates.reduce((best, item) => (item.y > best.y ? item : best), candidates[0]);
      const minItem = candidates.reduce((best, item) => (item.y < best.y ? item : best), candidates[0]);
      questions.push(
        `設 \\(${left}\\le x\\le ${right}\\)，二次函數 \\(${eq}\\) 的最大值 \\(M\\) 與最小值 \\(m\\) 各為多少？`
      );
      answers.push(
        `簡答：\\(M=${maxItem.y}\\)，\\(m=${minItem.y}\\)。過程：區間內二次函數的最大、最小值只需比較端點與區間內的頂點。本題頂點為 \\((${h},${k})\\)，再比較 \\(x=${left},${h},${right}\\) 的函數值即可。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613AlgebraExtremaMixedSet(count) {
    const banks = [
      buildJ613NumberSumSquareExtremaSet,
      buildJ613LineDistanceSquareSet,
      buildJ613LinearConstraintExtremaSet,
      buildJ613IntervalExtremaSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613RectanglePerimeterAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const perimeter = randInt(20, 90) * 2;
      const half = perimeter / 2;
      const side = half / 2;
      const areaText = Number.isInteger(side * side) ? `${side * side}` : fractionToLatex(makeFraction(half * half, 4));
      questions.push(`用一段長 \\(${perimeter}\\) 公分的繩子圍成一個矩形，求此矩形的最大面積。`);
      answers.push(
        `簡答：\\(${areaText}\\) 平方公分。過程：設長為 \\(x\\)，寬為 \\(${half}-x\\)，面積 \\(A=x(${half}-x)\\)。固定周長的矩形中，正方形面積最大，所以長、寬皆為 \\(\\frac{${half}}{2}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613FencingVariationsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const fence = randInt(8, 30) * 4;
        const depth = fence / 4;
        const length = fence / 2;
        const area = depth * length;
        questions.push(
          `用長 \\(${fence}\\) 公尺的圍籬靠著河邊圍成一個矩形菜園，河邊那一側不用圍。求可圍出的最大面積。`
        );
        answers.push(
          `簡答：\\(${area}\\) 平方公尺。過程：設垂直河邊的邊長為 \\(x\\)，另一邊為 \\(${fence}-2x\\)，面積 \\(A=x(${fence}-2x)\\)。頂點在 \\(x=${depth}\\)，所以最大面積為 \\(${depth}\\cdot${length}=${area}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const fence = randInt(3, 8) * 24;
        const depth = fence / 6;
        const width = fence / 8;
        const area = (fence * fence) / 24;
        questions.push(
          `用長 \\(${fence}\\) 公尺的圍籬圍成兩個並排且大小相同的矩形養雞場，中間共用一道隔欄。求兩個養雞場的最大總面積。`
        );
        answers.push(
          `簡答：\\(${area}\\) 平方公尺。過程：設每格深 \\(x\\)、寬 \\(y\\)，圍籬總長為 \\(3x+4y=${fence}\\)，總面積 \\(A=2xy\\)。代入 \\(y=\\frac{${fence}-3x}{4}\\) 後得到二次函數，頂點在 \\(x=${depth}\\)，\\(y=${width}\\)。`
        );
        continue;
      }
      const opening = randInt(2, 8) * 2;
      const totalPerimeter = randInt(8, 25) * 4;
      const fence = totalPerimeter - opening;
      const side = totalPerimeter / 4;
      const area = side * side;
      questions.push(
        `用長 \\(${fence}\\) 公尺的圍籬圍成一個矩形停車場，其中一邊保留 \\(${opening}\\) 公尺作為出入口不圍。求可圍出的最大面積。`
      );
      answers.push(
        `簡答：\\(${area}\\) 平方公尺。過程：實際矩形周長等於圍籬長加出入口長，為 \\(${fence}+${opening}=${totalPerimeter}\\)。固定周長時矩形面積在正方形時最大，所以邊長為 \\(${side}\\)，面積為 \\(${area}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613SplitSquaresMinimumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const length = randInt(20, 100);
      const minText = fractionToLatex(makeFraction(length * length, 32));
      questions.push(`將一條長 \\(${length}\\) 公分的鐵絲剪成兩段，分別圍成兩個正方形，求這兩個正方形面積和的最小值。`);
      answers.push(
        `簡答：\\(${minText}\\) 平方公分。過程：若兩段周長分別為 \\(x\\) 與 \\(${length}-x\\)，面積和為 \\(\\left(\\frac{x}{4}\\right)^2+\\left(\\frac{${length}-x}{4}\\right)^2\\)。兩段長度相等時最小，此時每段周長為 \\(\\frac{${length}}{2}\\)，面積和為 \\(\\frac{${length}^2}{32}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613ParabolaClearanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const height = randInt(4, 12);
      const halfWidth = randInt(3, 10);
      const vehicleHalf = randInt(1, halfWidth - 1);
      const vehicleWidth = 2 * vehicleHalf;
      const clearance = makeFraction(
        height * (halfWidth * halfWidth - vehicleHalf * vehicleHalf),
        halfWidth * halfWidth
      );
      questions.push(
        `一個拋物線隧道高 \\(${height}\\) 公尺、底寬 \\(${2 * halfWidth}\\) 公尺。若車寬 \\(${vehicleWidth}\\) 公尺且置中通過，求車輛可通過的最大車高。`
      );
      answers.push(
        `簡答：\\(${fractionToLatex(clearance)}\\) 公尺。過程：以隧道中心底部為原點，設拋物線為 \\(y=${height}-\\frac{${height}}{${halfWidth * halfWidth}}x^2\\)。車寬 \\(${vehicleWidth}\\) 表示車頂角落在 \\(x=\\pm${vehicleHalf}\\)，代入得到高度 \\(${fractionToLatex(clearance)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613WaterChannelWidthSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const depth = randInt(4, 12);
      const width = randInt(5, 12) * 2;
      const drop = randInt(1, depth - 1);
      const newDepth = depth - drop;
      const halfWidth = width / 2;
      const newHalfSquared = makeFraction(halfWidth * halfWidth * newDepth, depth);
      questions.push(
        `一個拋物線形河道，最深處離岸面 \\(${depth}\\) 公尺，水滿時河面寬 \\(${width}\\) 公尺。若水位下降 \\(${drop}\\) 公尺，求此時水面寬。`
      );
      answers.push(
        `簡答：\\(2\\sqrt{${fractionToLatex(newHalfSquared)}}\\) 公尺。過程：以河底為原點設 \\(y=ax^2\\)。滿水時半寬為 \\(${halfWidth}\\)，代入得 \\(${depth}=a(${halfWidth})^2\\)。新水深為 \\(${newDepth}\\)，解 \\(ax^2=${newDepth}\\)，水面寬為 \\(2|x|\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613GeometryModelingMixedSet(count) {
    const banks = [
      buildJ613RectanglePerimeterAreaSet,
      buildJ613FencingVariationsSet,
      buildJ613SplitSquaresMinimumSet,
      buildJ613ParabolaClearanceSet,
      buildJ613WaterChannelWidthSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613TicketRevenueSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const basePeople = randInt(20, 80);
      const basePrice = randInt(20, 80) * 100;
      const priceStep = randInt(1, 5) * 100;
      const extraPeople = randInt(2, 12);
      const bestX = Math.max(
        0,
        Math.round((basePrice * extraPeople - basePeople * priceStep) / (2 * priceStep * extraPeople))
      );
      const bestPrice = basePrice - priceStep * bestX;
      const bestPeople = basePeople + extraPeople * bestX;
      const bestRevenue = bestPrice * bestPeople;
      questions.push(
        `某活動原票價 \\(${basePrice}\\) 元時有 \\(${basePeople}\\) 人參加；票價每降 \\(${priceStep}\\) 元，會增加 \\(${extraPeople}\\) 人。若最多降價到票價仍為正，求票價定為多少時收入最大。`
      );
      answers.push(
        `簡答：定為 \\(${bestPrice}\\) 元時收入最大。過程：設降價 \\(x\\) 次，收入 \\(R=(${basePrice}-${priceStep}x)(${basePeople}+${extraPeople}x)\\)，這是開口向下的二次函數，取頂點附近的整數 \\(x=${bestX}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613PriceProfitSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const cost = randInt(20, 90);
      const basePrice = cost + randInt(20, 80);
      const baseSales = randInt(30, 120);
      const step = randInt(1, 5);
      const salesGain = randInt(3, 15);
      const bestX = Math.max(
        0,
        Math.round(((basePrice - cost) * salesGain - baseSales * step) / (2 * step * salesGain))
      );
      const bestPrice = basePrice - step * bestX;
      const bestProfit = (bestPrice - cost) * (baseSales + salesGain * bestX);
      questions.push(
        `某商品成本 \\(${cost}\\) 元，定價 \\(${basePrice}\\) 元時可賣 \\(${baseSales}\\) 件；每降價 \\(${step}\\) 元可多賣 \\(${salesGain}\\) 件。求定價多少元時利潤最大。`
      );
      answers.push(
        `簡答：定為 \\(${bestPrice}\\) 元時利潤最大。過程：設降價 \\(x\\) 次，利潤 \\(P=(${basePrice}-${step}x-${cost})(${baseSales}+${salesGain}x)\\)，配方或用頂點判斷最大值位置。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613OrchardYieldSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const trees = randInt(20, 80);
      const yieldPerTree = randInt(200, 1200);
      const drop = randInt(5, 30);
      const bestAdd = Math.max(0, Math.round((yieldPerTree - trees * drop) / (2 * drop)));
      const bestTrees = trees + bestAdd;
      const bestTotal = bestTrees * (yieldPerTree - drop * bestAdd);
      questions.push(
        `果園原有 \\(${trees}\\) 棵果樹，每棵產量 \\(${yieldPerTree}\\) 顆；每多種一棵，平均每棵產量減少 \\(${drop}\\) 顆。求總產量最大時應加種幾棵。`
      );
      answers.push(
        `簡答：約加種 \\(${bestAdd}\\) 棵，總產量 \\(${bestTotal}\\) 顆。過程：設加種 \\(x\\) 棵，總產量 \\(T=(${trees}+x)(${yieldPerTree}-${drop}x)\\)，為開口向下的二次函數，最大值在頂點附近。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ613BusinessProductionMixedSet(count) {
    const banks = [buildJ613TicketRevenueSet, buildJ613PriceProfitSet, buildJ613OrchardYieldSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function j621SqrtText(value) {
    const root = Math.sqrt(value);
    return Number.isInteger(root) ? `${root}` : `\\sqrt{${value}}`;
  }

  function j621SquareTerm(value) {
    return `${value}^2`;
  }

  function buildJ621CuboidSpaceDiagonalSet(count) {
    const triples = [
      [3, 4, 12],
      [4, 6, 12],
      [5, 6, 10],
      [6, 8, 10],
      [6, 8, 24],
      [8, 9, 12],
      [9, 12, 20],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [length, width, height] = triples[randInt(0, triples.length - 1)];
      const diagonalSquared = length * length + width * width + height * height;
      questions.push(
        `長方體的長、寬、高分別為 \\(${length}\\)、\\(${width}\\)、\\(${height}\\) 公分，求其體對角線長。`
      );
      answers.push(
        `簡答：\\(${j621SqrtText(diagonalSquared)}\\) 公分。過程：空間中的三個互相垂直方向可用三維畢氏定理，體對角線 \\(d\\) 滿足 \\(d^2=${j621SquareTerm(length)}+${j621SquareTerm(width)}+${j621SquareTerm(height)}=${diagonalSquared}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ621LinePlaneDistanceSet(count) {
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [7, 24, 25],
      [8, 15, 17],
      [9, 12, 15],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [height, planeDistance, slant] = triples[randInt(0, triples.length - 1)];
      questions.push(
        `直線 \\(AB\\) 垂直平面 \\(S\\) 於 \\(B\\)，點 \\(C\\) 在平面 \\(S\\) 上。若 \\(AB=${height}\\)、\\(AC=${slant}\\)，求 \\(BC\\) 的長度。`
      );
      answers.push(
        `簡答：\\(${planeDistance}\\)。過程：因為 \\(AB\\perp S\\)，且 \\(BC\\) 在平面 \\(S\\) 上並通過垂足 \\(B\\)，所以 \\(AB\\perp BC\\)。在直角三角形 \\(ABC\\) 中，\\(BC=\\sqrt{${slant}^2-${height}^2}=${planeDistance}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ621ThreePerpendicularDistanceSet(count) {
    const cases = [
      [3, 4, 12],
      [4, 6, 12],
      [5, 12, 12],
      [6, 8, 15],
      [8, 9, 12],
      [9, 12, 20],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [height, first, second] = cases[randInt(0, cases.length - 1)];
      const distanceSquared = height * height + first * first + second * second;
      questions.push(
        `直線 \\(L\\) 垂直平面 \\(S\\) 於 \\(P\\)。平面 \\(S\\) 上有 \\(PQ\\perp QR\\)，且 \\(LP=${height}\\)、\\(PQ=${first}\\)、\\(QR=${second}\\)，求 \\(LR\\) 的長度。`
      );
      answers.push(
        `簡答：\\(${j621SqrtText(distanceSquared)}\\)。過程：先在平面內得 \\(PR^2=PQ^2+QR^2\\)，再由 \\(LP\\perp S\\) 得 \\(LP\\perp PR\\)。所以 \\(LR^2=LP^2+PQ^2+QR^2=${height * height}+${first * first}+${second * second}=${distanceSquared}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ621CubeFaceCenterDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const side = randInt(4, 18);
      const answerText = side % 2 === 0 ? `${side / 2}\\sqrt{2}` : `\\frac{${side}\\sqrt{2}}{2}`;
      questions.push(`正方體邊長為 \\(${side}\\) 公分，求相鄰兩個面中心點之間的距離。`);
      answers.push(
        `簡答：\\(${answerText}\\) 公分。過程：兩個相鄰面中心與共同稜的中點可形成等腰直角三角形，兩股皆為 \\(\\frac{${side}}{2}\\)，距離為 \\(\\sqrt{(\\frac{${side}}{2})^2+(\\frac{${side}}{2})^2}=\\frac{${side}\\sqrt{2}}{2}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ621SpatialDistanceMixedSet(count) {
    const banks = [
      buildJ621CuboidSpaceDiagonalSet,
      buildJ621LinePlaneDistanceSet,
      buildJ621ThreePerpendicularDistanceSet,
      buildJ621CubeFaceCenterDistanceSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ621LinePlanePerpendicularLogicSet(count) {
    const lineNames = ['L', 'M', 'N', 'K'];
    const planeNames = ['S', 'P', 'Q', 'R'];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const l1 = lineNames[i % lineNames.length];
      const l2 = lineNames[(i + 1) % lineNames.length];
      const plane = planeNames[i % planeNames.length];
      const mode = i % 3;
      if (mode === 0) {
        questions.push(
          `直線 \\(${l1}\\) 垂直平面 \\(${plane}\\) 於 \\(A\\)。若平面 \\(${plane}\\) 上有一直線 \\(${l2}\\) 通過 \\(A\\)，則 \\(${l1}\\) 與 \\(${l2}\\) 的夾角為幾度？`
        );
        answers.push(`簡答：\\(90^\\circ\\)。過程：直線垂直平面，表示它垂直於該平面內所有通過垂足的直線。`);
      } else if (mode === 1) {
        questions.push(
          `在空間中，直線 \\(${l1}\\) 與直線 \\(${l2}\\) 都垂直同一平面 \\(${plane}\\)，判斷 \\(${l1}\\) 與 \\(${l2}\\) 的位置關係。`
        );
        answers.push(
          `簡答：\\(${l1}\\parallel ${l2}\\)。過程：同時垂直同一平面的兩條直線，方向都等同於該平面的法線方向，所以互相平行。`
        );
      } else {
        questions.push(
          `若直線 \\(${l1}\\parallel\\) 平面 \\(${plane}\\)，且平面 \\(${plane}\\) 上有一直線 \\(${l2}\\)，則 \\(${l1}\\) 與 \\(${l2}\\) 一定平行嗎？`
        );
        answers.push(
          `簡答：不一定。過程：\\(${l1}\\parallel\\) 平面只表示 \\(${l1}\\) 不與該平面相交；平面內的直線方向很多，\\(${l2}\\) 可能與 \\(${l1}\\) 平行，也可能歪斜。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ621ParallelPerpendicularRelationsSet(count) {
    const planeNames = ['P', 'Q', 'R', 'S'];
    const lineNames = ['L', 'M', 'N', 'K'];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const p1 = planeNames[i % planeNames.length];
        const p2 = planeNames[(i + 1) % planeNames.length];
        const p3 = planeNames[(i + 2) % planeNames.length];
        questions.push(
          `若平面 \\(${p1}\\perp ${p2}\\)，且平面 \\(${p2}\\perp ${p3}\\)，則 \\(${p1}\\) 與 \\(${p3}\\) 是否一定平行？`
        );
        answers.push(
          `簡答：不一定。過程：兩個平面都垂直同一平面時，它們可能平行，也可能相交，不能只由「都垂直」推出平行。`
        );
      } else if (mode === 1) {
        const l1 = lineNames[i % lineNames.length];
        const l2 = lineNames[(i + 1) % lineNames.length];
        const l3 = lineNames[(i + 2) % lineNames.length];
        questions.push(
          `若兩條相異直線 \\(${l1}\\) 與 \\(${l2}\\) 同時垂直第三條直線 \\(${l3}\\)，則 \\(${l1}\\) 與 \\(${l2}\\) 可能有哪幾種位置關係？`
        );
        answers.push(
          `簡答：可能平行、相交或歪斜。過程：在空間中，只知道兩線都垂直同一線，仍不足以決定兩線彼此的位置。`
        );
      } else {
        const l = lineNames[i % lineNames.length];
        const p1 = planeNames[i % planeNames.length];
        const p2 = planeNames[(i + 1) % planeNames.length];
        questions.push(
          `若直線 \\(${l}\\perp\\) 平面 \\(${p1}\\)，且平面 \\(${p1}\\parallel ${p2}\\)，則 \\(${l}\\) 與平面 \\(${p2}\\) 的關係為何？`
        );
        answers.push(
          `簡答：\\(${l}\\perp ${p2}\\)。過程：平行平面的法線方向相同；直線若垂直其中一個平面，也垂直與它平行的平面。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ621SpatialLogicMixedSet(count) {
    const banks = [buildJ621LinePlanePerpendicularLogicSet, buildJ621ParallelPerpendicularRelationsSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function j621RatioText(num, den) {
    const reduced = makeFraction(num, den);
    return reduced.den === 1 ? `${reduced.num}` : fractionToLatex(reduced);
  }

  function buildJ621SolidScalingRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const radiusScale = randInt(2, 5);
        const heightDen = randInt(2, 4);
        const ratioText = j621RatioText(radiusScale * radiusScale, heightDen);
        questions.push(
          `圓柱的底面半徑變為原來的 \\(${radiusScale}\\) 倍，高變為原來的 \\(\\frac{1}{${heightDen}}\\)，則體積變為原來的幾倍？`
        );
        answers.push(
          `簡答：\\(${ratioText}\\) 倍。過程：圓柱體積 \\(V=\\pi r^2h\\)，半徑影響平方，所以體積倍率為 \\(${radiusScale}^2\\times\\frac{1}{${heightDen}}=${ratioText}\\)。`
        );
      } else {
        const a = randInt(2, 5);
        const b = randInt(a + 1, 8);
        questions.push(`兩個正方體的邊長比為 \\(${a}:${b}\\)，求它們的表面積比與體積比。`);
        answers.push(
          `簡答：表面積比 \\(${a * a}:${b * b}\\)，體積比 \\(${a * a * a}:${b * b * b}\\)。過程：相似立體長度比為 \\(a:b\\) 時，面積比為 \\(a^2:b^2\\)，體積比為 \\(a^3:b^3\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ621CylinderVolumeModelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const radiusA = randInt(2, 8);
        const heightA = randInt(3, 12);
        const radiusB = radiusA * randInt(2, 3);
        const heightB = heightA * randInt(2, 4);
        const ratioA = radiusA * radiusA * heightA;
        const ratioB = radiusB * radiusB * heightB;
        const reduced = makeFraction(ratioA, ratioB);
        questions.push(
          `甲、乙兩個圓柱，甲的底面半徑為 \\(${radiusA}\\)、高為 \\(${heightA}\\)；乙的底面半徑為 \\(${radiusB}\\)、高為 \\(${heightB}\\)。求甲、乙體積比。`
        );
        answers.push(
          `簡答：\\(${reduced.num}:${reduced.den}\\)。過程：體積比只需比較 \\(r^2h\\)，所以甲：乙 \\(=${radiusA}^2\\cdot${heightA}:${radiusB}^2\\cdot${heightB}=${reduced.num}:${reduced.den}\\)。`
        );
      } else {
        const radius = randInt(2, 8);
        const height = randInt(4, 15);
        const volume = radius * radius * height;
        questions.push(`一個圓柱的底面半徑為 \\(${radius}\\) 公分，高為 \\(${height}\\) 公分，求其體積。`);
        answers.push(
          `簡答：\\(${volume}\\pi\\) 立方公分。過程：\\(V=\\pi r^2h=\\pi\\cdot${radius}^2\\cdot${height}=${volume}\\pi\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ621CompositeSolidVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const side = randInt(8, 20);
        const radius = randInt(2, Math.floor(side / 3));
        const cubeVolume = side * side * side;
        const cylinderCoeff = radius * radius * side;
        questions.push(
          `一個邊長為 \\(${side}\\) 公分的正方體木塊，中間挖掉一個直徑為 \\(${2 * radius}\\) 公分、貫穿上下的圓柱孔，求剩餘木塊的體積。`
        );
        answers.push(
          `簡答：\\(${cubeVolume}-${cylinderCoeff}\\pi\\) 立方公分。過程：剩餘體積等於正方體體積減圓柱孔體積，\\(${side}^3-\\pi\\cdot${radius}^2\\cdot${side}=${cubeVolume}-${cylinderCoeff}\\pi\\)。`
        );
      } else {
        const length = randInt(8, 24);
        const width = randInt(3, 10);
        questions.push(
          `將長 \\(${length}\\) 公分、寬 \\(${width}\\) 公分的長方形紙片，以長邊為軸旋轉一周，所得立體圖形的體積為何？`
        );
        answers.push(
          `簡答：\\(${width * width * length}\\pi\\) 立方公分。過程：以長邊為軸旋轉會形成圓柱，高為 \\(${length}\\)，半徑為 \\(${width}\\)，體積為 \\(\\pi\\cdot${width}^2\\cdot${length}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ621SolidVolumeRatioMixedSet(count) {
    const banks = [buildJ621SolidScalingRatioSet, buildJ621CylinderVolumeModelSet, buildJ621CompositeSolidVolumeSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function j622PiTerm(coefficient) {
    if (coefficient === 1) return '\\pi';
    return `${coefficient}\\pi`;
  }

  function j622MinSurfacePath(a, b, c) {
    const candidates = [
      { flat: a + b, height: c },
      { flat: a + c, height: b },
      { flat: b + c, height: a },
    ];
    let best = candidates[0];
    let bestSquared = best.flat * best.flat + best.height * best.height;
    for (let i = 1; i < candidates.length; i += 1) {
      const value = candidates[i].flat * candidates[i].flat + candidates[i].height * candidates[i].height;
      if (value < bestSquared) {
        best = candidates[i];
        bestSquared = value;
      }
    }
    return { ...best, squared: bestSquared, text: j621SqrtText(bestSquared) };
  }

  function buildJ622TriangularPrismVolumeSet(count) {
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [8, 15, 17],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [a, b, hyp] = triples[randInt(0, triples.length - 1)];
      const height = randInt(6, 18);
      const baseArea = (a * b) / 2;
      const volume = baseArea * height;
      questions.push(
        `一個直角三角柱的底面為直角三角形，兩股長分別為 \\(${a}\\) 公分、\\(${b}\\) 公分，柱高為 \\(${height}\\) 公分，求其體積。`
      );
      answers.push(
        `簡答：\\(${volume}\\) 立方公分。過程：柱體體積 \\(V=\\text{底面積}\\times\\text{高}\\)，底面積 \\(=\\frac12\\cdot${a}\\cdot${b}=${baseArea}\\)，所以 \\(V=${baseArea}\\cdot${height}=${volume}\\)。`
      );
      void hyp;
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622RectPrismSurfaceVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const length = randInt(3, 12);
      const width = randInt(3, 10);
      const height = randInt(4, 14);
      if (i % 2 === 0) {
        const surface = 2 * (length * width + width * height + length * height);
        questions.push(
          `長方體的長、寬、高分別為 \\(${length}\\)、\\(${width}\\)、\\(${height}\\) 公分，求其總表面積。`
        );
        answers.push(
          `簡答：\\(${surface}\\) 平方公分。過程：長方體表面積 \\(=2(lw+wh+lh)=2(${length}\\cdot${width}+${width}\\cdot${height}+${length}\\cdot${height})=${surface}\\)。`
        );
      } else {
        const volume = length * width * height;
        questions.push(`長方體的長、寬、高分別為 \\(${length}\\)、\\(${width}\\)、\\(${height}\\) 公分，求其體積。`);
        answers.push(
          `簡答：\\(${volume}\\) 立方公分。過程：長方體體積 \\(V=lwh=${length}\\cdot${width}\\cdot${height}=${volume}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622CylinderSurfaceVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const radius = randInt(2, 9);
      const height = randInt(5, 18);
      if (i % 2 === 0) {
        const volumeCoeff = radius * radius * height;
        questions.push(
          `直圓柱的底面半徑為 \\(${radius}\\) 公分，柱高為 \\(${height}\\) 公分，求其體積（以 \\(\\pi\\) 表示）。`
        );
        answers.push(
          `簡答：\\(${j622PiTerm(volumeCoeff)}\\) 立方公分。過程：\\(V=\\pi r^2h=\\pi\\cdot${radius}^2\\cdot${height}=${j622PiTerm(volumeCoeff)}\\)。`
        );
      } else {
        const surfaceCoeff = 2 * radius * radius + 2 * radius * height;
        questions.push(
          `直圓柱的底面半徑為 \\(${radius}\\) 公分，高為 \\(${height}\\) 公分，求其總表面積（以 \\(\\pi\\) 表示）。`
        );
        answers.push(
          `簡答：\\(${j622PiTerm(surfaceCoeff)}\\) 平方公分。過程：總表面積 \\(=2\\pi r^2+2\\pi rh=2\\pi\\cdot${radius}^2+2\\pi\\cdot${radius}\\cdot${height}=${j622PiTerm(surfaceCoeff)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622BasicSurfaceVolumeMixedSet(count) {
    const banks = [
      buildJ622TriangularPrismVolumeSet,
      buildJ622RectPrismSurfaceVolumeSet,
      buildJ622CylinderSurfaceVolumeSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622HollowCylinderVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const outer = randInt(5, 12);
      const inner = randInt(2, outer - 2);
      const length = randInt(20, 120);
      const coeff = (outer * outer - inner * inner) * length;
      questions.push(
        `一段空心圓柱水管，外圓半徑為 \\(${outer}\\) 公分，內圓半徑為 \\(${inner}\\) 公分，長度為 \\(${length}\\) 公分，求製成此水管所需材料的體積。`
      );
      answers.push(
        `簡答：\\(${j622PiTerm(coeff)}\\) 立方公分。過程：材料體積為外圓柱減內圓柱，\\(V=\\pi(${outer}^2-${inner}^2)\\cdot${length}=${j622PiTerm(coeff)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622PrismCylinderCompositeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const side = randInt(8, 18);
        const radius = randInt(2, Math.floor(side / 3));
        const cubeVolume = side * side * side;
        const removed = radius * radius * side;
        questions.push(
          `一個邊長為 \\(${side}\\) 公分的正方體木塊，中間挖掉一個直徑為 \\(${2 * radius}\\) 公分且貫穿上下底面的圓柱孔，求剩餘體積。`
        );
        answers.push(
          `簡答：\\(${cubeVolume}-${j622PiTerm(removed)}\\) 立方公分。過程：剩餘體積 \\(=${side}^3-\\pi\\cdot${radius}^2\\cdot${side}=${cubeVolume}-${j622PiTerm(removed)}\\)。`
        );
      } else {
        const length = randInt(8, 18);
        const width = randInt(5, 14);
        const height = randInt(5, 15);
        const cut = randInt(2, Math.min(length, width) - 2);
        const volume = length * width * height - cut * cut * height;
        questions.push(
          `一個長、寬、高分別為 \\(${length}\\)、\\(${width}\\)、\\(${height}\\) 公分的長方體，中間挖掉一個底面邊長為 \\(${cut}\\) 公分、貫穿上下的正方柱孔，求剩餘體積。`
        );
        answers.push(
          `簡答：\\(${volume}\\) 立方公分。過程：用大長方體體積減去被挖掉的正方柱體積，\\(${length}\\cdot${width}\\cdot${height}-${cut}^2\\cdot${height}=${volume}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622SolidScalingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const scale = randInt(2, 5);
        questions.push(`若一個立體圖形的所有長度都變為原來的 \\(${scale}\\) 倍，則表面積與體積分別變為原來的幾倍？`);
        answers.push(
          `簡答：表面積 \\(${scale * scale}\\) 倍，體積 \\(${scale * scale * scale}\\) 倍。過程：長度倍率為 \\(k\\) 時，面積倍率為 \\(k^2\\)，體積倍率為 \\(k^3\\)。`
        );
      } else {
        const radiusScale = randInt(2, 4);
        const heightDen = randInt(2, 5);
        const ratio = j621RatioText(radiusScale * radiusScale, heightDen);
        questions.push(
          `圓柱的底面半徑變為原來的 \\(${radiusScale}\\) 倍，高變為原來的 \\(\\frac{1}{${heightDen}}\\)，則新體積與原體積的比值為何？`
        );
        answers.push(
          `簡答：\\(${ratio}:1\\)。過程：圓柱體積倍率為 \\(r^2h\\) 的倍率，故為 \\(${radiusScale}^2\\cdot\\frac{1}{${heightDen}}=${ratio}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622CompositeScalingMixedSet(count) {
    const banks = [buildJ622HollowCylinderVolumeSet, buildJ622PrismCylinderCompositeSet, buildJ622SolidScalingSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622CuboidSurfaceShortestPathSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const length = randInt(4, 12);
      const width = randInt(3, 10);
      const height = randInt(3, 9);
      const best = j622MinSurfacePath(length, width, height);
      questions.push(
        `長方體的長、寬、高分別為 \\(${length}\\)、\\(${width}\\)、\\(${height}\\) 公分。若螞蟻從一個頂點沿表面爬到相對頂點，求最短路徑長。`
      );
      answers.push(
        `簡答：\\(${best.text}\\) 公分。過程：展開相鄰兩個面，把路徑化為平面直線。比較 \\((l+w)^2+h^2\\)、\\((l+h)^2+w^2\\)、\\((w+h)^2+l^2\\)，最小為 \\(${best.flat}^2+${best.height}^2=${best.squared}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622CylinderSurfaceShortestPathSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const circumference = randInt(6, 24);
      const height = randInt(5, 20);
      const distanceSquared = circumference * circumference + height * height;
      questions.push(
        `一個圓柱的底面周長為 \\(${circumference}\\) 公分，高為 \\(${height}\\) 公分。螞蟻沿側面繞一圈爬到正上方對應點，求最短路徑長。`
      );
      answers.push(
        `簡答：\\(${j621SqrtText(distanceSquared)}\\) 公分。過程：圓柱側面展開是長方形，寬為底面周長 \\(${circumference}\\)，高為 \\(${height}\\)，最短路徑為對角線 \\(\\sqrt{${circumference}^2+${height}^2}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622SurfaceShortestPathMixedSet(count) {
    const banks = [buildJ622CuboidSurfaceShortestPathSet, buildJ622CylinderSurfaceShortestPathSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622PrismCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const n = randInt(3, 12);
      const vertices = 2 * n;
      const edges = 3 * n;
      const faces = n + 2;
      const mode = i % 3;
      if (mode === 0) {
        questions.push(`一個 \\(${n}\\) 角柱共有幾個頂點、幾條邊與幾個面？`);
        answers.push(
          `簡答：頂點 \\(${vertices}\\) 個，邊 \\(${edges}\\) 條，面 \\(${faces}\\) 個。過程：\\(n\\) 角柱有上下兩個 \\(n\\) 邊形底面，所以 \\(V=2n,E=3n,F=n+2\\)。`
        );
      } else if (mode === 1) {
        questions.push(`某角柱共有 \\(${edges}\\) 條邊，請問它是幾角柱？共有幾個面？`);
        answers.push(
          `簡答：\\(${n}\\) 角柱，面有 \\(${faces}\\) 個。過程：角柱邊數 \\(E=3n\\)，所以 \\(n=${edges}\\div3=${n}\\)，面數 \\(F=n+2=${faces}\\)。`
        );
      } else {
        questions.push(`某角柱共有 \\(${vertices}\\) 個頂點，求此角柱的邊數與面數。`);
        answers.push(
          `簡答：邊 \\(${edges}\\) 條，面 \\(${faces}\\) 個。過程：角柱頂點數 \\(V=2n\\)，所以 \\(n=${vertices}\\div2=${n}\\)，再得 \\(E=3n=${edges}\\)、\\(F=n+2=${faces}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622EulerFormulaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const vertices = randInt(6, 20);
      const faces = randInt(5, 14);
      const edges = vertices + faces - 2;
      if (i % 2 === 0) {
        questions.push(`某凸多面體有 \\(${vertices}\\) 個頂點、\\(${faces}\\) 個面，求其邊數。`);
        answers.push(
          `簡答：\\(${edges}\\) 條。過程：尤拉公式 \\(V-E+F=2\\)，所以 \\(E=V+F-2=${vertices}+${faces}-2=${edges}\\)。`
        );
      } else {
        questions.push(`某凸多面體有 \\(${edges}\\) 條邊、\\(${faces}\\) 個面，求其頂點數。`);
        answers.push(
          `簡答：\\(${vertices}\\) 個。過程：由 \\(V-E+F=2\\)，得 \\(V=E-F+2=${edges}-${faces}+2=${vertices}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622PrismEulerMixedSet(count) {
    const banks = [buildJ622PrismCountingSet, buildJ622EulerFormulaSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622WaterDisplacementSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const baseArea = randInt(20, 150);
      const rise = randInt(2, 12);
      const volume = baseArea * rise;
      questions.push(
        `一個底面積為 \\(${baseArea}\\) 平方公分的柱形水桶，投入一塊石頭後水位上升 \\(${rise}\\) 公分。若石頭完全沒入水中，求石頭體積。`
      );
      answers.push(
        `簡答：\\(${volume}\\) 立方公分。過程：水位上升造成的體積增加等於石頭排開的水量，\\(V=\\text{底面積}\\times\\text{上升高度}=${baseArea}\\cdot${rise}=${volume}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622WaterPipeVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const diameter = randInt(4, 16);
      const radius = diameter / 2;
      const length = randInt(20, 100);
      const numerator = diameter * diameter * length;
      const coeff = makeFraction(numerator, 4);
      const coeffText = coeff.den === 1 ? j622PiTerm(coeff.num) : `${fractionToLatex(coeff)}\\pi`;
      questions.push(
        `一段內徑為 \\(${diameter}\\) 公分、長 \\(${length}\\) 公分的圓柱形水管，裡面裝滿水，求水的體積。`
      );
      answers.push(
        `簡答：\\(${coeffText}\\) 立方公分。過程：半徑為 \\(${radius}\\) 公分，水的體積為 \\(\\pi r^2h=\\pi\\cdot(${diameter}/2)^2\\cdot${length}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ622ContainerWaterMixedSet(count) {
    const banks = [buildJ622WaterDisplacementSet, buildJ622WaterPipeVolumeSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function j623PiTerm(coefficient) {
    if (coefficient === 1) return '\\pi';
    return `${coefficient}\\pi`;
  }

  function j623SphereSectionTriple() {
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [7, 24, 25],
      [8, 15, 17],
      [9, 12, 15],
      [10, 24, 26],
    ];
    return triples[randInt(0, triples.length - 1)];
  }

  function ratioText(values) {
    return values.join(':');
  }

  function buildJ623SphereSectionRadiusDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [r, h, radius] = j623SphereSectionTriple();
      const mode = i % 3;
      if (mode === 0) {
        questions.push(`已知球半徑為 \\(${radius}\\) 公分，球心到截平面的距離為 \\(${h}\\) 公分，求截圓半徑。`);
        answers.push(
          `簡答：\\(${r}\\) 公分。過程：球半徑 \\(R\\)、截圓半徑 \\(r\\)、球心到截平面距離 \\(h\\) 滿足 \\(R^2=r^2+h^2\\)，所以 \\(r=\\sqrt{${radius}^2-${h}^2}=${r}\\)。`
        );
      } else if (mode === 1) {
        questions.push(`已知球半徑為 \\(${radius}\\) 公分，截圓半徑為 \\(${r}\\) 公分，求球心到截平面的距離。`);
        answers.push(`簡答：\\(${h}\\) 公分。過程：\\(h=\\sqrt{R^2-r^2}=\\sqrt{${radius}^2-${r}^2}=${h}\\)。`);
      } else {
        questions.push(
          `已知某球被平面截得的截圓半徑為 \\(${r}\\) 公分，球心到截平面的距離為 \\(${h}\\) 公分，求此球半徑。`
        );
        answers.push(`簡答：\\(${radius}\\) 公分。過程：\\(R=\\sqrt{r^2+h^2}=\\sqrt{${r}^2+${h}^2}=${radius}\\)。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623SphereSectionCircleMeasureSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [r, h, radius] = j623SphereSectionTriple();
      if (i % 2 === 0) {
        questions.push(
          `已知球半徑為 \\(${radius}\\) 公分，球心到截平面的距離為 \\(${h}\\) 公分，求截圓面積（以 \\(\\pi\\) 表示）。`
        );
        answers.push(
          `簡答：\\(${j623PiTerm(r * r)}\\) 平方公分。過程：先由 \\(r=\\sqrt{${radius}^2-${h}^2}=${r}\\)，截圓面積 \\(=\\pi r^2=${j623PiTerm(r * r)}\\)。`
        );
      } else {
        questions.push(
          `已知球半徑為 \\(${radius}\\) 公分，球心到截平面的距離為 \\(${h}\\) 公分，求截圓周長（以 \\(\\pi\\) 表示）。`
        );
        answers.push(
          `簡答：\\(${j623PiTerm(2 * r)}\\) 公分。過程：先求截圓半徑 \\(r=${r}\\)，所以周長 \\(=2\\pi r=${j623PiTerm(2 * r)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623SphereSectionReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [r, h, radius] = j623SphereSectionTriple();
      if (i % 2 === 0) {
        questions.push(
          `已知某球的截圓面積為 \\(${j623PiTerm(r * r)}\\) 平方公分，球心到截平面的距離為 \\(${h}\\) 公分，求此球半徑。`
        );
        answers.push(
          `簡答：\\(${radius}\\) 公分。過程：由截圓面積得截圓半徑 \\(r=${r}\\)，再用 \\(R^2=r^2+h^2\\)，得 \\(R=${radius}\\)。`
        );
      } else {
        questions.push(
          `已知某球的截圓周長為 \\(${j623PiTerm(2 * r)}\\) 公分，球心到截平面的距離為 \\(${h}\\) 公分，求此球半徑。`
        );
        answers.push(
          `簡答：\\(${radius}\\) 公分。過程：由 \\(2\\pi r=${j623PiTerm(2 * r)}\\) 得 \\(r=${r}\\)，所以 \\(R=\\sqrt{${r}^2+${h}^2}=${radius}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623SphereGreatCircleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const radius = randInt(4, 15);
      if (i % 3 === 0) {
        questions.push(`已知球半徑為 \\(${radius}\\) 公分，若平面通過球心，求截得的大圓面積（以 \\(\\pi\\) 表示）。`);
        answers.push(
          `簡答：\\(${j623PiTerm(radius * radius)}\\) 平方公分。過程：通過球心時 \\(h=0\\)，截圓半徑等於球半徑，所以面積 \\(=\\pi R^2=${j623PiTerm(radius * radius)}\\)。`
        );
      } else if (i % 3 === 1) {
        questions.push(`已知球的大圓周長為 \\(${j623PiTerm(2 * radius)}\\) 公分，求球半徑。`);
        answers.push(
          `簡答：\\(${radius}\\) 公分。過程：大圓半徑就是球半徑，\\(2\\pi R=${j623PiTerm(2 * radius)}\\)，所以 \\(R=${radius}\\)。`
        );
      } else {
        questions.push(`已知某球的大圓面積為 \\(${j623PiTerm(radius * radius)}\\) 平方公分，求此球直徑。`);
        answers.push(
          `簡答：\\(${2 * radius}\\) 公分。過程：大圓面積 \\(=\\pi R^2\\)，故 \\(R=${radius}\\)，直徑為 \\(2R=${2 * radius}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623SphereSectionMixedSet(count) {
    const banks = [
      buildJ623SphereSectionRadiusDistanceSet,
      buildJ623SphereSectionCircleMeasureSet,
      buildJ623SphereSectionReverseSet,
      buildJ623SphereGreatCircleSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function j623ConeSectorPair() {
    const pairs = [
      { slant: 12, radius: 3, angle: 90 },
      { slant: 15, radius: 5, angle: 120 },
      { slant: 18, radius: 6, angle: 120 },
      { slant: 10, radius: 4, angle: 144 },
      { slant: 20, radius: 5, angle: 90 },
      { slant: 18, radius: 3, angle: 60 },
      { slant: 24, radius: 8, angle: 120 },
    ];
    return pairs[randInt(0, pairs.length - 1)];
  }

  function buildJ623ConeSectorAngleArcSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = j623ConeSectorPair();
      if (i % 3 === 0) {
        questions.push(
          `已知圓錐母線長為 \\(${item.slant}\\) 公分，底面半徑為 \\(${item.radius}\\) 公分，求其側面展開扇形的圓心角。`
        );
        answers.push(
          `簡答：\\(${item.angle}^\\circ\\)。過程：扇形弧長等於底面圓周長，\\(\\theta=360^\\circ\\times\\frac{r}{R}=360^\\circ\\times\\frac{${item.radius}}{${item.slant}}=${item.angle}^\\circ\\)。`
        );
      } else if (i % 3 === 1) {
        questions.push(
          `已知圓錐側面展開扇形的圓心角為 \\(${item.angle}^\\circ\\)，母線長為 \\(${item.slant}\\) 公分，求底面半徑。`
        );
        answers.push(
          `簡答：\\(${item.radius}\\) 公分。過程：\\(\\frac{\\theta}{360^\\circ}=\\frac{r}{R}\\)，所以 \\(r=${item.slant}\\times\\frac{${item.angle}}{360}=${item.radius}\\)。`
        );
      } else {
        questions.push(
          `已知圓錐底面半徑為 \\(${item.radius}\\) 公分，側面展開扇形的圓心角為 \\(${item.angle}^\\circ\\)，求母線長。`
        );
        answers.push(
          `簡答：\\(${item.slant}\\) 公分。過程：\\(R=\\frac{360^\\circ r}{\\theta}=\\frac{360\\cdot${item.radius}}{${item.angle}}=${item.slant}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623ConePythagoreanSet(count) {
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [8, 15, 17],
      [7, 24, 25],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [radius, height, slant] = triples[randInt(0, triples.length - 1)];
      if (i % 3 === 0) {
        questions.push(`已知圓錐的底面半徑為 \\(${radius}\\) 公分，高為 \\(${height}\\) 公分，求母線長。`);
        answers.push(
          `簡答：\\(${slant}\\) 公分。過程：圓錐的高、底面半徑、母線長形成直角三角形，\\(R^2=r^2+h^2\\)，所以母線長 \\(=\\sqrt{${radius}^2+${height}^2}=${slant}\\)。`
        );
      } else if (i % 3 === 1) {
        questions.push(`已知圓錐的母線長為 \\(${slant}\\) 公分，底面半徑為 \\(${radius}\\) 公分，求圓錐的高。`);
        answers.push(
          `簡答：\\(${height}\\) 公分。過程：\\(h=\\sqrt{R^2-r^2}=\\sqrt{${slant}^2-${radius}^2}=${height}\\)。`
        );
      } else {
        questions.push(`已知圓錐的母線長為 \\(${slant}\\) 公分，高為 \\(${height}\\) 公分，求底面半徑。`);
        answers.push(
          `簡答：\\(${radius}\\) 公分。過程：\\(r=\\sqrt{R^2-h^2}=\\sqrt{${slant}^2-${height}^2}=${radius}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623ConeSurfaceAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const radius = randInt(2, 9);
      const slant = randInt(radius + 3, radius + 16);
      const lateralCoeff = radius * slant;
      const totalCoeff = radius * (radius + slant);
      if (i % 3 === 0) {
        questions.push(
          `已知圓錐底面半徑為 \\(${radius}\\) 公分，母線長為 \\(${slant}\\) 公分，求其側面積（以 \\(\\pi\\) 表示）。`
        );
        answers.push(
          `簡答：\\(${j623PiTerm(lateralCoeff)}\\) 平方公分。過程：圓錐側面積 \\(=\\pi rR=\\pi\\cdot${radius}\\cdot${slant}=${j623PiTerm(lateralCoeff)}\\)。`
        );
      } else if (i % 3 === 1) {
        questions.push(
          `已知圓錐底面半徑為 \\(${radius}\\) 公分，母線長為 \\(${slant}\\) 公分，求其表面積（以 \\(\\pi\\) 表示）。`
        );
        answers.push(
          `簡答：\\(${j623PiTerm(totalCoeff)}\\) 平方公分。過程：表面積 \\(=\\pi r^2+\\pi rR=\\pi\\cdot${radius}^2+\\pi\\cdot${radius}\\cdot${slant}=${j623PiTerm(totalCoeff)}\\)。`
        );
      } else {
        questions.push(
          `已知圓錐側面積為 \\(${j623PiTerm(lateralCoeff)}\\) 平方公分，底面半徑為 \\(${radius}\\) 公分，求母線長。`
        );
        answers.push(
          `簡答：\\(${slant}\\) 公分。過程：側面積 \\(=\\pi rR\\)，所以 \\(R=${lateralCoeff}\\div${radius}=${slant}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623ConeAreaRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const radius = randInt(2, 8);
      const multiplier = randInt(2, 6);
      const slant = radius * multiplier;
      if (i % 2 === 0) {
        questions.push(
          `已知圓錐母線長為 \\(${slant}\\) 公分，底面半徑為 \\(${radius}\\) 公分，求側面展開扇形面積與底面面積的比值。`
        );
        answers.push(
          `簡答：\\(${multiplier}:1\\)。過程：\\(\\frac{\\text{側面積}}{\\text{底面積}}=\\frac{\\pi rR}{\\pi r^2}=\\frac{R}{r}=\\frac{${slant}}{${radius}}=${multiplier}\\)。`
        );
      } else {
        questions.push(
          `已知某圓錐的側面積是底面積的 \\(${multiplier}\\) 倍，若底面半徑為 \\(${radius}\\) 公分，求母線長。`
        );
        answers.push(
          `簡答：\\(${slant}\\) 公分。過程：側面積與底面積比為 \\(R:r\\)，所以 \\(R=${multiplier}\\times${radius}=${slant}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623ConeSurfaceMixedSet(count) {
    const banks = [
      buildJ623ConeSectorAngleArcSet,
      buildJ623ConePythagoreanSet,
      buildJ623ConeSurfaceAreaSet,
      buildJ623ConeAreaRatioSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623PyramidCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const n = randInt(3, 18);
      const vertices = n + 1;
      const faces = n + 1;
      const edges = 2 * n;
      if (i % 3 === 0) {
        questions.push(`一個 \\(${n}\\) 角錐共有幾個頂點、幾個面與幾條邊？`);
        answers.push(
          `簡答：頂點 \\(${vertices}\\) 個，面 \\(${faces}\\) 個，邊 \\(${edges}\\) 條。過程：\\(n\\) 角錐有底面 \\(n\\) 個頂點加錐頂，所以 \\(V=n+1,F=n+1,E=2n\\)。`
        );
      } else if (i % 3 === 1) {
        questions.push(`若一個角錐共有 \\(${edges}\\) 條邊，請問這是幾角錐？其頂點數為多少？`);
        answers.push(
          `簡答：\\(${n}\\) 角錐，頂點 \\(${vertices}\\) 個。過程：角錐邊數 \\(E=2n\\)，故 \\(n=${edges}\\div2=${n}\\)，頂點數 \\(V=n+1=${vertices}\\)。`
        );
      } else {
        questions.push(`已知一個角錐的面數為 \\(${faces}\\)，求其底面為幾邊形，並求邊數。`);
        answers.push(
          `簡答：底面為 \\(${n}\\) 邊形，邊數 \\(${edges}\\) 條。過程：角錐面數 \\(F=n+1\\)，所以 \\(n=${faces}-1=${n}\\)，邊數 \\(E=2n=${edges}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623PyramidEulerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const vertices = randInt(5, 20);
      const faces = randInt(5, 16);
      const edges = vertices + faces - 2;
      if (i % 2 === 0) {
        questions.push(`某凸多面體有 \\(${vertices}\\) 個頂點與 \\(${faces}\\) 個面，求其邊數。`);
        answers.push(
          `簡答：\\(${edges}\\) 條。過程：由尤拉公式 \\(V-E+F=2\\)，得 \\(E=V+F-2=${vertices}+${faces}-2=${edges}\\)。`
        );
      } else {
        questions.push(`某凸多面體有 \\(${edges}\\) 條邊與 \\(${faces}\\) 個面，求其頂點數。`);
        answers.push(`簡答：\\(${vertices}\\) 個。過程：\\(V=E-F+2=${edges}-${faces}+2=${vertices}\\)。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623PyramidReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const n = randInt(3, 18);
      const vertices = n + 1;
      const faces = n + 1;
      const edges = 2 * n;
      if (i % 3 === 0) {
        questions.push(
          `已知某 \\(n\\) 角錐的頂點數、面數與邊數之總和為 \\(${vertices + faces + edges}\\)，求 \\(n\\) 之值。`
        );
        answers.push(
          `簡答：\\(${n}\\)。過程：\\(n\\) 角錐有 \\(V=n+1,F=n+1,E=2n\\)，總和為 \\(4n+2\\)。令 \\(4n+2=${vertices + faces + edges}\\)，得 \\(n=${n}\\)。`
        );
      } else if (i % 3 === 1) {
        questions.push(`已知某 \\(n\\) 角錐的邊數比頂點數多 \\(${edges - vertices}\\)，求 \\(n\\) 之值。`);
        answers.push(
          `簡答：\\(${n}\\)。過程：邊數 \\(E=2n\\)，頂點數 \\(V=n+1\\)，所以 \\(E-V=n-1=${edges - vertices}\\)，得 \\(n=${n}\\)。`
        );
      } else {
        questions.push(`已知一個角錐的頂點數與面數之和為 \\(${vertices + faces}\\)，求此角錐的邊數。`);
        answers.push(
          `簡答：\\(${edges}\\) 條。過程：角錐 \\(V=F=n+1\\)，所以 \\(2(n+1)=${vertices + faces}\\)，得 \\(n=${n}\\)，邊數 \\(E=2n=${edges}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623PyramidCountingMixedSet(count) {
    const banks = [buildJ623PyramidCountingSet, buildJ623PyramidEulerSet, buildJ623PyramidReverseSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function j623ProbabilityText(numerator, denominator) {
    return fractionToLatex(makeFraction(numerator, denominator));
  }

  function j623CountMultiples(limit, divisor) {
    return Math.floor(limit / divisor);
  }

  function j623Combination(n, r) {
    if (r < 0 || r > n) return 0;
    const k = Math.min(r, n - r);
    let value = 1;
    for (let i = 1; i <= k; i += 1) {
      value = (value * (n - k + i)) / i;
    }
    return value;
  }

  function buildJ623SingleTrialProbabilitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const primeDice = [2, 3, 5];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const divisor = [2, 3, 4, 5, 6][randInt(0, 4)];
        const hits = j623CountMultiples(6, divisor);
        questions.push(`投擲一顆公正骰子，出現點數為 \\(${divisor}\\) 的倍數的機率為何？`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(hits, 6)}\\)。過程：樣本空間有 6 種結果，其中 \\(${divisor}\\) 的倍數有 \\(${hits}\\) 種，所以機率為 \\(\\frac{${hits}}6=${j623ProbabilityText(hits, 6)}\\)。`
        );
      } else if (mode === 1) {
        const red = randInt(3, 10);
        const white = randInt(4, 15);
        questions.push(`袋中有 \\(${red}\\) 顆紅球、\\(${white}\\) 顆白球，任取一球，取到白球的機率為何？`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(white, red + white)}\\)。過程：總球數為 \\(${red + white}\\)，白球有 \\(${white}\\) 顆，所以機率為 \\(\\frac{${white}}{${red + white}}=${j623ProbabilityText(white, red + white)}\\)。`
        );
      } else if (mode === 2) {
        const max = [30, 40, 50, 60][randInt(0, 3)];
        const divisor = [2, 3, 5, 7][randInt(0, 3)];
        const hits = j623CountMultiples(max, divisor);
        questions.push(
          `籤筒中有 \\(1\\) 到 \\(${max}\\) 號的籤，隨機抽出一支，抽中號碼為 \\(${divisor}\\) 的倍數的機率為何？`
        );
        answers.push(
          `簡答：\\(${j623ProbabilityText(hits, max)}\\)。過程：\\(1\\) 到 \\(${max}\\) 中，\\(${divisor}\\) 的倍數有 \\(\\lfloor ${max}/${divisor}\\rfloor=${hits}\\) 個，所以機率為 \\(\\frac{${hits}}{${max}}=${j623ProbabilityText(hits, max)}\\)。`
        );
      } else if (mode === 3) {
        const suit = ['紅心', '黑桃', '方塊', '梅花'][randInt(0, 3)];
        questions.push(`從一副 52 張撲克牌中任取一張，抽中${suit}的機率為何？`);
        answers.push(
          `簡答：\\(\\frac14\\)。過程：每種花色有 13 張，總共 52 張，所以機率為 \\(\\frac{13}{52}=\\frac14\\)。`
        );
      } else {
        questions.push('投擲一顆公正骰子，出現點數為質數的機率為何？');
        answers.push(
          `簡答：\\(\\frac12\\)。過程：骰子點數中的質數為 \\(${primeDice.join('、')}\\)，共有 3 種，因此機率為 \\(\\frac36=\\frac12\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623CoinTreeProbabilitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const tosses = randInt(2, 4);
      const total = 2 ** tosses;
      const mode = i % 4;
      if (mode === 0) {
        questions.push(`同時投擲 \\(${tosses}\\) 枚公正硬幣，全部出現正面的機率為何？`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(1, total)}\\)。過程：\\(${tosses}\\) 枚硬幣共有 \\(2^{${tosses}}=${total}\\) 種等可能結果，全部正面只有 1 種。`
        );
      } else if (mode === 1) {
        const heads = randInt(1, tosses - 1);
        const hit = j623Combination(tosses, heads);
        questions.push(`同時投擲 \\(${tosses}\\) 枚公正硬幣，恰有 \\(${heads}\\) 枚正面的機率為何？`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, total)}\\)。過程：恰有 \\(${heads}\\) 枚正面的選法為 \\(C(${tosses},${heads})=${hit}\\)，總結果 \\(${total}\\) 種。`
        );
      } else if (mode === 2) {
        questions.push(`同時投擲 \\(${tosses}\\) 枚公正硬幣，至少出現一次正面的機率為何？`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(total - 1, total)}\\)。過程：用反面思考，沒有正面只有「全反面」1 種，所以機率為 \\(1-\\frac1{${total}}=${j623ProbabilityText(total - 1, total)}\\)。`
        );
      } else {
        const girls = randInt(2, 4);
        questions.push(`一個家庭有 \\(${girls}\\) 個小孩，生男生女機率相等，求全部都是女孩的機率。`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(1, 2 ** girls)}\\)。過程：共有 \\(2^{${girls}}=${2 ** girls}\\) 種性別組合，全部女孩只有 1 種。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623DiceSumProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const pairs = [];
      for (let a = 1; a <= 6; a += 1) {
        for (let b = 1; b <= 6; b += 1) pairs.push([a, b]);
      }
      const mode = i % 5;
      if (mode === 0) {
        const sumTarget = randInt(4, 10);
        const hit = pairs.filter(([a, b]) => a + b === sumTarget).length;
        questions.push(`投擲兩顆公正骰子，兩次點數和等於 \\(${sumTarget}\\) 的機率為何？`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, 36)}\\)。過程：兩顆骰子共有 36 種等可能結果，和為 \\(${sumTarget}\\) 的組合有 \\(${hit}\\) 種。`
        );
      } else if (mode === 1) {
        const diff = randInt(0, 3);
        const hit = pairs.filter(([a, b]) => Math.abs(a - b) === diff).length;
        questions.push(`投擲兩顆公正骰子，兩次點數差的絕對值為 \\(${diff}\\) 的機率為何？`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, 36)}\\)。過程：列出 \\((a,b)\\) 的 36 種結果，滿足 \\(|a-b|=${diff}\\) 的共有 \\(${hit}\\) 種。`
        );
      } else if (mode === 2) {
        const product = [6, 8, 10, 12, 18][randInt(0, 4)];
        const hit = pairs.filter(([a, b]) => a * b === product).length;
        questions.push(`投擲兩顆公正骰子，兩次點數之積為 \\(${product}\\) 的機率為何？`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, 36)}\\)。過程：符合 \\(ab=${product}\\) 且 \\(1\\le a,b\\le6\\) 的有序點數對共有 \\(${hit}\\) 組。`
        );
      } else if (mode === 3) {
        const hit = pairs.filter(([a, b]) => a === b).length;
        questions.push('投擲兩顆公正骰子，兩次點數相同的機率為何？');
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, 36)}\\)。過程：相同點數為 \\((1,1),(2,2),\\ldots,(6,6)\\)，共有 6 種。`
        );
      } else {
        const threshold = randInt(8, 11);
        const hit = pairs.filter(([a, b]) => a + b >= threshold).length;
        questions.push(`投擲兩顆公正骰子，點數和至少為 \\(${threshold}\\) 的機率為何？`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, 36)}\\)。過程：所有有序點數對共有 36 種，和 \\(\\ge ${threshold}\\) 的共有 \\(${hit}\\) 種。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623NumberArrangementProbabilitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const digits = i % 2 === 0 ? [0, randInt(1, 4), randInt(5, 9)] : [randInt(1, 3), randInt(4, 6), randInt(7, 9)];
      const hundredsDigits = digits.filter((digit) => digit !== 0);
      const total = hundredsDigits.length * 2;
      const numbers = [];
      for (const a of digits) {
        for (const b of digits) {
          for (const c of digits) {
            if (a !== b && b !== c && a !== c && a !== 0) numbers.push(100 * a + 10 * b + c);
          }
        }
      }
      if (i % 3 === 0) {
        const hit = numbers.filter((value) => value % 2 === 0).length;
        questions.push(`用數字 \\(${digits.join('、')}\\) 各用一次排成三位數，求此數為偶數的機率。`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, total)}\\)。過程：可排成 \\(${total}\\) 個三位數，其中偶數有 \\(${hit}\\) 個。`
        );
      } else if (i % 3 === 1) {
        const hit = numbers.filter((value) => value % 3 === 0).length;
        questions.push(`用數字 \\(${digits.join('、')}\\) 各用一次排成三位數，求此數為 \\(3\\) 的倍數的機率。`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, total)}\\)。過程：數字和若為 3 的倍數，所有排列都會是 3 的倍數；此題符合者有 \\(${hit}\\) 個。`
        );
      } else {
        const threshold = Math.min(...numbers) + 100;
        const hit = numbers.filter((value) => value > threshold).length;
        questions.push(`用數字 \\(${digits.join('、')}\\) 各用一次排成三位數，求此數大於 \\(${threshold}\\) 的機率。`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, total)}\\)。過程：先排出不重複且首位不可為 0 的三位數，共 \\(${total}\\) 個；其中大於 \\(${threshold}\\) 的有 \\(${hit}\\) 個。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623SamplingWithWithoutReplacementSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const red = randInt(3, 8);
      const white = randInt(3, 8);
      const total = red + white;
      if (i % 2 === 0) {
        questions.push(
          `袋中有 \\(${red}\\) 顆紅球、\\(${white}\\) 顆白球，連續取出兩球不放回，兩球都為紅球的機率為何？`
        );
        answers.push(
          `簡答：\\(${j623ProbabilityText(red * (red - 1), total * (total - 1))}\\)。過程：不放回時第二次總數與紅球數都少 1，所以機率為 \\(\\frac{${red}}{${total}}\\cdot\\frac{${red - 1}}{${total - 1}}=${j623ProbabilityText(red * (red - 1), total * (total - 1))}\\)。`
        );
      } else {
        questions.push(
          `袋中有 \\(${red}\\) 顆紅球、\\(${white}\\) 顆白球，連續取出兩球且每次放回，兩球顏色相同的機率為何？`
        );
        answers.push(
          `簡答：\\(${j623ProbabilityText(red * red + white * white, total * total)}\\)。過程：放回時兩次獨立，同色包含紅紅與白白，機率為 \\((\\frac{${red}}{${total}})^2+(\\frac{${white}}{${total}})^2=${j623ProbabilityText(red * red + white * white, total * total)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623TwoBagCombinationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const maxA = randInt(3, 6);
      const maxB = randInt(3, 6);
      const pairs = [];
      for (let a = 1; a <= maxA; a += 1) {
        for (let b = 1; b <= maxB; b += 1) pairs.push([a, b]);
      }
      if (i % 2 === 0) {
        const hit = pairs.filter(([a, b]) => a === b).length;
        questions.push(
          `甲袋有 \\(1\\) 到 \\(${maxA}\\) 號球，乙袋有 \\(1\\) 到 \\(${maxB}\\) 號球，各取一球，編號相同的機率為何？`
        );
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, maxA * maxB)}\\)。過程：總結果有 \\(${maxA}\\cdot${maxB}=${maxA * maxB}\\) 種，編號相同有 \\(${hit}\\) 種。`
        );
      } else {
        const hit = pairs.filter(([a, b]) => (a + b) % 2 === 0).length;
        questions.push(
          `甲袋有 \\(1\\) 到 \\(${maxA}\\) 號球，乙袋有 \\(1\\) 到 \\(${maxB}\\) 號球，各取一球，兩數之和為偶數的機率為何？`
        );
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, maxA * maxB)}\\)。過程：和為偶數表示同奇偶，符合的有序配對共有 \\(${hit}\\) 種。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623AlgebraConditionProbabilitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const pairs = [];
      for (let a = 1; a <= 6; a += 1) {
        for (let b = 1; b <= 6; b += 1) pairs.push([a, b]);
      }
      if (i % 2 === 0) {
        const k = randInt(7, 11);
        const hit = pairs.filter(([a, b]) => a + b >= k).length;
        questions.push(`投擲兩顆公正骰子，點數分別為 \\(a,b\\)。點 \\((a,b)\\) 滿足 \\(a+b\\ge ${k}\\) 的機率為何？`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, 36)}\\)。過程：共有 36 個有序點數對，其中滿足 \\(a+b\\ge ${k}\\) 的有 \\(${hit}\\) 個。`
        );
      } else {
        const hit = pairs.filter(([a, b]) => a < b).length;
        questions.push('投擲兩顆公正骰子，點數分別為 \\(a,b\\)。點 \\((a,b)\\) 滿足 \\(a<b\\) 的機率為何？');
        answers.push(
          `簡答：\\(${j623ProbabilityText(hit, 36)}\\)。過程：\\(a<b\\) 的有序點數對共有 \\(${hit}\\) 個，所以機率為 \\(${j623ProbabilityText(hit, 36)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623ComplementProbabilitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const attempts = randInt(2, 5);
        const missFractions = [
          [1, 2],
          [1, 3],
          [1, 4],
          [1, 5],
          [2, 5],
          [2, 7],
          [3, 5],
        ];
        const [missNumerator, missDenominator] = missFractions[randInt(0, missFractions.length - 1)];
        const missPower = missNumerator ** attempts;
        const totalPower = missDenominator ** attempts;
        questions.push(
          `某人每次射擊沒中目標的機率為 \\(\\frac{${missNumerator}}{${missDenominator}}\\)，連續射擊 \\(${attempts}\\) 次且每次結果互不影響。求至少射中一次的機率。`
        );
        answers.push(
          `簡答：\\(${j623ProbabilityText(totalPower - missPower, totalPower)}\\)。過程：至少一次可用互補事件，先算一次都沒中：\\((\\frac{${missNumerator}}{${missDenominator}})^{${attempts}}=\\frac{${missPower}}{${totalPower}}\\)，所以至少一次命中為 \\(1-\\frac{${missPower}}{${totalPower}}=${j623ProbabilityText(totalPower - missPower, totalPower)}\\)。`
        );
      } else if (i % 3 === 1) {
        const bags = randInt(2, 4);
        const bad = randInt(1, 3);
        const total = bad + randInt(5, 9);
        const goodPower = (total - bad) ** bags;
        const totalPower = total ** bags;
        questions.push(
          `袋中有 \\(${bad}\\) 顆瑕疵球、\\(${total - bad}\\) 顆正常球。每次取一球後放回，共取 \\(${bags}\\) 次。求至少取到一次瑕疵球的機率。`
        );
        answers.push(
          `簡答：\\(${j623ProbabilityText(totalPower - goodPower, totalPower)}\\)。過程：互補事件是「每次都取到正常球」，機率為 \\((\\frac{${total - bad}}{${total}})^{${bags}}=\\frac{${goodPower}}{${totalPower}}\\)，故至少一次瑕疵為 \\(1-\\frac{${goodPower}}{${totalPower}}=${j623ProbabilityText(totalPower - goodPower, totalPower)}\\)。`
        );
      } else {
        const tosses = randInt(3, 5);
        const noHead = 1;
        const total = 2 ** tosses;
        questions.push(`連續投擲一枚公正硬幣 \\(${tosses}\\) 次，求至少出現一次正面的機率。`);
        answers.push(
          `簡答：\\(${j623ProbabilityText(total - noHead, total)}\\)。過程：互補事件是完全沒有正面，也就是全反面，只有 1 種；總結果 \\(2^{${tosses}}=${total}\\) 種，所以機率為 \\(1-\\frac1{${total}}=${j623ProbabilityText(total - noHead, total)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623RockPaperScissorsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        questions.push('甲、乙兩人猜拳一次，求甲獲勝的機率。');
        answers.push(
          '簡答：\\(\\frac13\\)。過程：共有 \\(3\\times3=9\\) 種等可能結果，甲勝有 3 種，所以機率為 \\(\\frac39=\\frac13\\)。'
        );
      } else if (i % 3 === 1) {
        questions.push('甲、乙兩人猜拳一次，求兩人平手的機率。');
        answers.push('簡答：\\(\\frac13\\)。過程：平手為兩人同出剪刀、石頭或布，共 3 種，總結果 9 種。');
      } else {
        questions.push('甲、乙、丙三人猜拳一次，求三人平手的機率。（全同或全不同皆視為平手）');
        answers.push(
          '簡答：\\(\\frac13\\)。過程：總結果 \\(3^3=27\\) 種；全同 3 種，全不同 \\(3!=6\\) 種，共 9 種，所以機率為 \\(\\frac9{27}=\\frac13\\)。'
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623ProbabilitySingleMixedSet(count) {
    const banks = [
      buildJ623SingleTrialProbabilitySet,
      buildJ623CoinTreeProbabilitySet,
      buildJ623DiceSumProductSet,
      buildJ623NumberArrangementProbabilitySet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623ProbabilityCompoundMixedSet(count) {
    const banks = [
      buildJ623SamplingWithWithoutReplacementSet,
      buildJ623TwoBagCombinationSet,
      buildJ623AlgebraConditionProbabilitySet,
      buildJ623ComplementProbabilitySet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ623ProbabilityGameMixedSet(count) {
    const banks = [buildJ623RockPaperScissorsSet, buildJ623CoinTreeProbabilitySet, buildJ623DiceSumProductSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function j631PercentText(numerator, denominator) {
    const percent = (numerator * 100) / denominator;
    return Number.isInteger(percent) ? `${percent}\\%` : `${percent.toFixed(1)}\\%`;
  }

  function j631AngleText(percent) {
    const angle = percent * 3.6;
    return Number.isInteger(angle) ? `${angle}^\\circ` : `${angle.toFixed(1)}^\\circ`;
  }

  function buildJ631RelativeFrequencySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const totals = [40, 50, 60, 80, 100, 120, 200];
    for (let i = 0; i < count; i += 1) {
      const total = totals[randInt(0, totals.length - 1)];
      if (i % 3 === 0) {
        const frequency = randInt(4, Math.floor(total / 2));
        questions.push(`某班共有 \\(${total}\\) 人，其中某分數區間有 \\(${frequency}\\) 人，求此組的相對次數。`);
        answers.push(
          `簡答：\\(${j631PercentText(frequency, total)}\\)。過程：相對次數 \\(=\\frac{\\text{該組次數}}{\\text{總次數}}\\times100\\%=\\frac{${frequency}}{${total}}\\times100\\%=${j631PercentText(frequency, total)}\\)。`
        );
      } else if (i % 3 === 1) {
        const percentChoices = [10, 12, 15, 20, 25, 30, 40];
        const percent = percentChoices[randInt(0, percentChoices.length - 1)];
        const frequency = (total * percent) / 100;
        if (!Number.isInteger(frequency)) {
          i -= 1;
          continue;
        }
        questions.push(`在一份 \\(${total}\\) 人的資料中，某組相對次數為 \\(${percent}\\%\\)，求該組實際次數。`);
        answers.push(
          `簡答：\\(${frequency}\\) 人。過程：實際次數 \\(=\\text{總次數}\\times\\text{相對次數}=${total}\\times${percent}\\%=${frequency}\\)。`
        );
      } else {
        const percentChoices = [10, 20, 25, 40, 50];
        const percent = percentChoices[randInt(0, percentChoices.length - 1)];
        const frequency = (total * percent) / 100;
        questions.push(`已知某組次數為 \\(${frequency}\\) 人，且占全部資料的 \\(${percent}\\%\\)，求全部資料總次數。`);
        answers.push(
          `簡答：\\(${total}\\) 人。過程：總次數 \\(=\\frac{\\text{該組次數}}{\\text{相對次數}}=\\frac{${frequency}}{${percent}\\%}=${total}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631CumulativeFrequencySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const counts = [randInt(3, 8), randInt(4, 10), randInt(5, 12), randInt(4, 10), randInt(3, 8)];
      const cumulative = counts.reduce((list, value) => {
        list.push((list[list.length - 1] || 0) + value);
        return list;
      }, []);
      const total = cumulative[cumulative.length - 1];
      const groupIndex = randInt(1, 4);
      if (i % 3 === 0) {
        questions.push(
          `一組資料分成五組，各組次數依序為 \\(${counts.join('、')}\\)。求第 \\(${groupIndex + 1}\\) 組的累積次數。`
        );
        answers.push(
          `簡答：\\(${cumulative[groupIndex]}\\)。過程：累積次數是從第一組加到該組，故為 \\(${counts.slice(0, groupIndex + 1).join('+')}=${cumulative[groupIndex]}\\)。`
        );
      } else if (i % 3 === 1) {
        const before = cumulative[groupIndex - 1];
        questions.push(
          `某分組資料到第 \\(${groupIndex}\\) 組的累積次數為 \\(${before}\\)，到第 \\(${groupIndex + 1}\\) 組的累積次數為 \\(${cumulative[groupIndex]}\\)，求第 \\(${groupIndex + 1}\\) 組原始次數。`
        );
        answers.push(
          `簡答：\\(${counts[groupIndex]}\\)。過程：某組次數 = 目前累積次數 − 前一組累積次數，\\(${cumulative[groupIndex]}-${before}=${counts[groupIndex]}\\)。`
        );
      } else {
        const below = cumulative[groupIndex];
        questions.push(
          `某班共有 \\(${total}\\) 人，未滿某分數的人數累積為 \\(${below}\\) 人，求達到該分數以上的人數與相對次數。`
        );
        answers.push(
          `簡答：\\(${total - below}\\) 人，\\(${j631PercentText(total - below, total)}\\)。過程：達到該分數以上人數為 \\(${total}-${below}=${total - below}\\)，相對次數為 \\(\\frac{${total - below}}{${total}}\\times100\\%=${j631PercentText(total - below, total)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631ClassIntervalRuleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const width = [5, 10][randInt(0, 1)];
      const start = width === 10 ? randInt(1, 5) * 10 : randInt(4, 10) * 5;
      const groupIndex = randInt(1, 6);
      const lower = start + width * (groupIndex - 1);
      const upper = lower + width;
      if (i % 3 === 0) {
        const value = randInt(lower, upper - 1);
        questions.push(
          `分組資料從 \\(${start}\\) 開始，組距為 \\(${width}\\)。若採「含下限、不含上限」，數值 \\(${value}\\) 應歸入哪一組？`
        );
        answers.push(
          `簡答：\\(${lower}\\sim${upper}\\) 這一組。過程：此組表示 \\(${lower}\\le x<${upper}\\)，而 \\(${value}\\) 落在此範圍內。`
        );
      } else if (i % 3 === 1) {
        questions.push(
          `分組資料第一組為 \\(${start}\\sim${start + width}\\)，組距為 \\(${width}\\)，求第 \\(${groupIndex}\\) 組的範圍（含下限、不含上限）。`
        );
        answers.push(
          `簡答：\\(${lower}\\sim${upper}\\)。過程：第 \\(${groupIndex}\\) 組下限為 \\(${start}+(${groupIndex}-1)\\cdot${width}=${lower}\\)，上限為 \\(${lower}+${width}=${upper}\\)。`
        );
      } else {
        const midpoint = lower + width / 2;
        questions.push(`已知某組的下限為 \\(${lower}\\)，上限為 \\(${upper}\\)，求該組中點。`);
        answers.push(
          `簡答：\\(${midpoint}\\)。過程：組中點 \\(=\\frac{\\text{下限}+\\text{上限}}{2}=\\frac{${lower}+${upper}}{2}=${midpoint}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631MarkRecaptureSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const markedTotal = randInt(10, 40);
      const sample = randInt(50, 160);
      const markedInSample = randInt(4, Math.min(markedTotal, 20));
      const estimate = makeFraction(markedTotal * sample, markedInSample);
      const estimateText = estimate.den === 1 ? `${estimate.num}` : fractionToLatex(estimate);
      questions.push(
        `池塘中先標記 \\(${markedTotal}\\) 條魚後放回，再隨機捕撈 \\(${sample}\\) 條，發現其中 \\(${markedInSample}\\) 條有標記。估計池塘中魚的總數。`
      );
      answers.push(
        `簡答：約 \\(${estimateText}\\) 條。過程：用比例 \\(\\frac{\\text{標記總數}}{\\text{魚總數}}\\approx\\frac{\\text{樣本中標記數}}{\\text{樣本數}}\\)，所以魚總數 \\(\\approx\\frac{${markedTotal}\\cdot${sample}}{${markedInSample}}=${estimateText}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631DataSortingCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const start = randInt(20, 60);
      const width = 10;
      const data = Array.from({ length: 12 }, () => randInt(start, start + 49));
      const lower = start + width * randInt(0, 3);
      const upper = lower + width;
      const hits = data.filter((value) => value >= lower && value < upper).length;
      questions.push(
        `資料為 \\(${data.join('、')}\\)。若以 \\(${lower}\\sim${upper}\\) 為一組（含 \\(${lower}\\)，不含 \\(${upper}\\)），求此組的次數。`
      );
      answers.push(
        `簡答：\\(${hits}\\)。過程：逐一檢查資料中滿足 \\(${lower}\\le x<${upper}\\) 的數值，共有 \\(${hits}\\) 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631MissingFrequencySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const total = randInt(40, 100);
      const counts = [randInt(3, 12), randInt(5, 16), randInt(4, 15), randInt(3, 12)];
      const knownSum = counts.reduce((sum, value) => sum + value, 0);
      const missing = Math.max(5, total - knownSum);
      const actualTotal = knownSum + missing;
      if (i % 2 === 0) {
        questions.push(
          `一組資料分為五組，前四組次數分別為 \\(${counts.join('、')}\\)，總次數為 \\(${actualTotal}\\)。求第五組次數。`
        );
        answers.push(
          `簡答：\\(${missing}\\)。過程：第五組次數 \\(=\\text{總次數}-\\text{已知四組次數和}=${actualTotal}-(${counts.join('+')})=${missing}\\)。`
        );
      } else {
        const target = randInt(2, 4);
        const cumulative = counts.slice(0, target).reduce((sum, value) => sum + value, 0);
        questions.push(
          `某累積次數分配表中，第 \\(${target}\\) 組以前的累積次數為 \\(${cumulative}\\)，第 \\(${target + 1}\\) 組以前的累積次數為 \\(${cumulative + missing}\\)。求第 \\(${target + 1}\\) 組次數。`
        );
        answers.push(
          `簡答：\\(${missing}\\)。過程：該組次數為兩個相鄰累積次數相減，\\(${cumulative + missing}-${cumulative}=${missing}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631ChartTrendReadingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = [
      { label: '某市一月至六月的觀光人數', unit: '人' },
      { label: '某校一週午餐訂購數', unit: '份' },
      { label: '某店連續六個月的銷售量', unit: '件' },
      { label: '某地一天六個時段的氣溫', unit: '度' },
    ];
    for (let i = 0; i < count; i += 1) {
      const context = contexts[randInt(0, contexts.length - 1)];
      const start = context.unit === '度' ? randInt(18, 25) : randInt(20, 60) * 10;
      const steps = Array.from({ length: 5 }, () => randInt(-3, 6) * (context.unit === '度' ? 1 : 10));
      const values = steps.reduce(
        (list, step) => {
          const next = Math.max(context.unit === '度' ? 10 : 50, list[list.length - 1] + step);
          list.push(next);
          return list;
        },
        [start]
      );
      const labels = ['第1期', '第2期', '第3期', '第4期', '第5期', '第6期'];
      const changes = values.slice(1).map((value, index) => value - values[index]);
      const maxChangeIndex = changes.reduce(
        (best, value, index) => (Math.abs(value) > Math.abs(changes[best]) ? index : best),
        0
      );
      if (i % 3 === 0) {
        const from = randInt(0, 3);
        const to = randInt(from + 1, 5);
        questions.push(
          `${context.label}依序為 \\(${values.join('、')}\\) ${context.unit}。若把這些資料畫成折線圖，求${labels[from]}到${labels[to]}的變化量。`
        );
        answers.push(
          `簡答：\\(${values[to] - values[from]}\\)${context.unit}。過程：變化量 = 後一期數值 - 前一期數值，\\(${values[to]}-${values[from]}=${values[to] - values[from]}\\)。`
        );
      } else if (i % 3 === 1) {
        questions.push(
          `${context.label}依序為 \\(${values.join('、')}\\)。若畫成折線圖，相鄰兩期中哪一段變化幅度最大？`
        );
        answers.push(
          `簡答：${labels[maxChangeIndex]}到${labels[maxChangeIndex + 1]}。過程：相鄰差依序為 \\(${changes.join('、')}\\)，比較絕對值，最大的是 \\(${changes[maxChangeIndex]}\\)。`
        );
      } else {
        const first = values[0];
        const last = values[5];
        const percent = ((last - first) * 100) / first;
        const percentText = Number.isInteger(percent) ? `${percent}\\%` : `${percent.toFixed(1)}\\%`;
        questions.push(
          `${context.label}第1期為 \\(${first}\\)，第6期為 \\(${last}\\)。求第6期相對於第1期的成長率或減少率。（百分率四捨五入到小數第一位）`
        );
        answers.push(
          `簡答：\\(${percentText}\\)。過程：變化百分率 \\(=\\frac{${last}-${first}}{${first}}\\times100\\%=${percentText}\\)。正值表示成長，負值表示減少。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631SamplingEstimatedTotalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const perBox = [25, 40, 50, 60][randInt(0, 3)];
        const goodNumerator = [9, 18, 19, 24, 47][randInt(0, 4)];
        const goodDenominator = goodNumerator === 47 ? 50 : goodNumerator === 24 ? 25 : goodNumerator + 1;
        const boxes = goodDenominator * randInt(2, 6);
        const totalItems = boxes * perBox;
        const bad = makeFraction(totalItems * (goodDenominator - goodNumerator), goodDenominator);
        questions.push(
          `某批商品共有 \\(${boxes}\\) 箱，每箱 \\(${perBox}\\) 個。經抽樣估計，完好商品約占 \\(\\frac{${goodNumerator}}{${goodDenominator}}\\)。估計這批商品中瑕疵品約有幾個？`
        );
        answers.push(
          `簡答：約 \\(${j632StatText(bad)}\\) 個。過程：總數 \\(${boxes}\\times${perBox}=${totalItems}\\)，瑕疵比例 \\(=1-\\frac{${goodNumerator}}{${goodDenominator}}=\\frac{${goodDenominator - goodNumerator}}{${goodDenominator}}\\)，所以約 \\(${totalItems}\\times\\frac{${goodDenominator - goodNumerator}}{${goodDenominator}}=${j632StatText(bad)}\\)。`
        );
      } else {
        const perBundle = [20, 30, 40, 50][randInt(0, 3)];
        const sampleBundles = randInt(4, 10);
        const totalBundles = sampleBundles * randInt(5, 10);
        const damagedInSample = randInt(sampleBundles + 2, sampleBundles * 4);
        const sampleItems = sampleBundles * perBundle;
        const totalItems = totalBundles * perBundle;
        const estimate = makeFraction(totalItems * damagedInSample, sampleItems);
        questions.push(
          `某書店進了 \\(${totalBundles}\\) 捆書，每捆 \\(${perBundle}\\) 本。隨機抽查 \\(${sampleBundles}\\) 捆，共發現 \\(${damagedInSample}\\) 本破損。依抽樣比例估計，整批約有幾本破損？`
        );
        answers.push(
          `簡答：約 \\(${j632StatText(estimate)}\\) 本。過程：樣本破損率 \\(=\\frac{${damagedInSample}}{${sampleItems}}\\)，整批共有 \\(${totalItems}\\) 本，所以估計破損本數 \\(=${totalItems}\\times\\frac{${damagedInSample}}{${sampleItems}}=${j632StatText(estimate)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631FrequencyDistributionMixedSet(count) {
    const banks = [
      buildJ631RelativeFrequencySet,
      buildJ631CumulativeFrequencySet,
      buildJ631ClassIntervalRuleSet,
      buildJ631MarkRecaptureSet,
      buildJ631DataSortingCountSet,
      buildJ631MissingFrequencySet,
      buildJ631ChartTrendReadingSet,
      buildJ631SamplingEstimatedTotalSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631PieAnglePercentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const percents = [5, 10, 12.5, 15, 20, 25, 30, 40, 45];
    const angles = [36, 45, 54, 72, 90, 108, 120, 144, 162];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const percent = percents[randInt(0, percents.length - 1)];
        questions.push(`某項目占全體的 \\(${percent}\\%\\)，求它在圓餅圖中的圓心角。`);
        answers.push(
          `簡答：\\(${j631AngleText(percent)}\\)。過程：圓心角 \\(=360^\\circ\\times\\text{百分比}=360^\\circ\\times${percent}\\%=${j631AngleText(percent)}\\)。`
        );
      } else {
        const angle = angles[randInt(0, angles.length - 1)];
        const percent = angle / 3.6;
        questions.push(`圓餅圖中某項目的圓心角為 \\(${angle}^\\circ\\)，求它占全體的百分比。`);
        answers.push(
          `簡答：\\(${percent}\\%\\)。過程：百分比 \\(=\\frac{${angle}^\\circ}{360^\\circ}\\times100\\%=${percent}\\%\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631PiePartialQuantitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const totals = [40, 50, 60, 80, 100, 200, 500, 1000];
    const percents = [6, 10, 12, 15, 20, 24, 25, 30, 40];
    for (let i = 0; i < count; i += 1) {
      const total = totals[randInt(0, totals.length - 1)];
      const percent = percents[randInt(0, percents.length - 1)];
      const countValue = (total * percent) / 100;
      if (!Number.isInteger(countValue)) {
        i -= 1;
        continue;
      }
      if (i % 2 === 0) {
        questions.push(`某校共有 \\(${total}\\) 位學生，其中某活動參與者占 \\(${percent}\\%\\)，求參與者人數。`);
        answers.push(
          `簡答：\\(${countValue}\\) 人。過程：人數 \\(=\\text{總人數}\\times\\text{百分比}=${total}\\times${percent}\\%=${countValue}\\)。`
        );
      } else {
        questions.push(`某項目有 \\(${countValue}\\) 人，占全體 \\(${percent}\\%\\)，求全體人數。`);
        answers.push(`簡答：\\(${total}\\) 人。過程：全體人數 \\(=\\frac{${countValue}}{${percent}\\%}=${total}\\)。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631PieCompareDifferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const totals = [40, 100, 200, 400, 500, 1000];
    for (let i = 0; i < count; i += 1) {
      const total = totals[randInt(0, totals.length - 1)];
      const p1 = randInt(2, 8) * 5;
      const p2 = randInt(1, p1 / 5 - 1) * 5;
      const diff = (total * (p1 - p2)) / 100;
      questions.push(`在 \\(${total}\\) 人的資料中，甲項占 \\(${p1}\\%\\)，乙項占 \\(${p2}\\%\\)。求甲比乙多幾人。`);
      answers.push(`簡答：\\(${diff}\\) 人。過程：人數差 \\(=${total}\\times(${p1}\\%-${p2}\\%)=${diff}\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631PieMissingAllocationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const p1 = randInt(1, 4) * 10;
      const p2 = randInt(1, 3) * 10;
      const p3 = randInt(1, 3) * 5;
      const missingPercent = 100 - p1 - p2 - p3;
      if (i % 2 === 0) {
        questions.push(
          `圓餅圖共有四項，前三項百分比分別為 \\(${p1}\\%\\)、\\(${p2}\\%\\)、\\(${p3}\\%\\)，求第四項百分比。`
        );
        answers.push(
          `簡答：\\(${missingPercent}\\%\\)。過程：總百分比為 \\(100\\%\\)，所以第四項 \\(=100\\%-${p1}\\%-${p2}\\%-${p3}\\%=${missingPercent}\\%\\)。`
        );
      } else {
        const a1 = randInt(1, 4) * 30;
        const a2 = randInt(1, 3) * 30;
        const a3 = randInt(1, 3) * 30;
        const missingAngle = 360 - a1 - a2 - a3;
        questions.push(
          `圓餅圖共有四項，前三項圓心角分別為 \\(${a1}^\\circ\\)、\\(${a2}^\\circ\\)、\\(${a3}^\\circ\\)，求第四項的圓心角。`
        );
        answers.push(
          `簡答：\\(${missingAngle}^\\circ\\)。過程：整個圓為 \\(360^\\circ\\)，所以第四項 \\(=360^\\circ-${a1}^\\circ-${a2}^\\circ-${a3}^\\circ=${missingAngle}^\\circ\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631PiePercentilePositionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const total = [40, 60, 80, 100, 120][randInt(0, 4)];
      const percentiles = [25, 50, 75, 90];
      const p = percentiles[randInt(0, percentiles.length - 1)];
      const position = (total * p) / 100;
      const angle = p * 3.6;
      questions.push(
        `某資料共有 \\(${total}\\) 筆，若要在圓餅圖上標出第 \\(${p}\\) 百分位數以前的比例，對應的圓心角為多少？該百分位大約對應第幾筆資料？`
      );
      answers.push(
        `簡答：圓心角 \\(${angle}^\\circ\\)，約第 \\(${position}\\) 筆。過程：第 \\(${p}\\) 百分位數以前占 \\(${p}\\%\\)，圓心角 \\(=360^\\circ\\times${p}\\%=${angle}^\\circ\\)，位置約 \\(${total}\\times${p}\\%=${position}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ631PieChartMixedSet(count) {
    const banks = [
      buildJ631PieAnglePercentSet,
      buildJ631PiePartialQuantitySet,
      buildJ631PieCompareDifferenceSet,
      buildJ631PieMissingAllocationSet,
      buildJ631PiePercentilePositionSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function j632StatText(value) {
    const fraction = typeof value === 'number' ? makeFraction(value, 1) : value;
    return fraction.den === 1 ? `${fraction.num}` : fractionToLatex(fraction);
  }

  function j632MeanText(sum, count) {
    return j632StatText(makeFraction(sum, count));
  }

  function j632MedianOfSorted(sorted) {
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 1) return makeFraction(sorted[middle], 1);
    return makeFraction(sorted[middle - 1] + sorted[middle], 2);
  }

  function j632QuartilesOfSorted(sorted) {
    const middle = Math.floor(sorted.length / 2);
    const lower = sorted.slice(0, middle);
    const upper = sorted.length % 2 === 0 ? sorted.slice(middle) : sorted.slice(middle + 1);
    return {
      q1: j632MedianOfSorted(lower),
      q2: j632MedianOfSorted(sorted),
      q3: j632MedianOfSorted(upper),
    };
  }

  function buildJ632RawMeanMedianModeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = randInt(5, 30);
      const data = [
        mode - randInt(3, 6),
        mode - randInt(1, 2),
        mode,
        mode,
        mode,
        mode + randInt(1, 3),
        mode + randInt(4, 7),
      ].sort((a, b) => a - b);
      const sum = data.reduce((total, value) => total + value, 0);
      const median = data[3];
      questions.push(`給定資料 \\(${data.join('、')}\\)，求其平均數、中位數與眾數。`);
      answers.push(
        `簡答：平均數 \\(${j632MeanText(sum, data.length)}\\)，中位數 \\(${median}\\)，眾數 \\(${mode}\\)。過程：平均數看總和，\\(${sum}\\div${data.length}=${j632MeanText(sum, data.length)}\\)；資料已排序且共有 7 筆，中位數是第 4 筆；出現最多次的是 \\(${mode}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632LinearTransformStatisticsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mean = randInt(40, 80);
      const median = mean + randInt(-4, 4);
      const mode = mean + randInt(-5, 5);
      const range = randInt(12, 40);
      const iqr = randInt(5, Math.min(20, range - 2));
      if (i % 2 === 0) {
        const add = randInt(3, 15);
        questions.push(
          `某組資料的平均數為 \\(${mean}\\)、中位數為 \\(${median}\\)、眾數為 \\(${mode}\\)、全距為 \\(${range}\\)、四分位距為 \\(${iqr}\\)。若每筆資料都加 \\(${add}\\)，求新的平均數、中位數、眾數、全距與四分位距。`
        );
        answers.push(
          `簡答：平均數 \\(${mean + add}\\)，中位數 \\(${median + add}\\)，眾數 \\(${mode + add}\\)，全距 \\(${range}\\)，四分位距 \\(${iqr}\\)。過程：整體平移會讓位置統計量都加 \\(${add}\\)，但資料間距離不變，所以全距與四分位距不變。`
        );
      } else {
        const multiple = randInt(2, 5);
        questions.push(
          `某組資料的平均數為 \\(${mean}\\)、中位數為 \\(${median}\\)、眾數為 \\(${mode}\\)、全距為 \\(${range}\\)、四分位距為 \\(${iqr}\\)。若每筆資料都乘以 \\(${multiple}\\)，求新的五個統計量。`
        );
        answers.push(
          `簡答：平均數 \\(${mean * multiple}\\)，中位數 \\(${median * multiple}\\)，眾數 \\(${mode * multiple}\\)，全距 \\(${range * multiple}\\)，四分位距 \\(${iqr * multiple}\\)。過程：乘上正數 \\(${multiple}\\) 時，所有位置與距離統計量都乘以 \\(${multiple}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632WeightedAverageSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const n1 = randInt(8, 30);
      const n2 = randInt(8, 30);
      const avg1 = randInt(55, 85);
      const avg2 = randInt(50, 90);
      const total = n1 * avg1 + n2 * avg2;
      const combined = makeFraction(total, n1 + n2);
      questions.push(
        `甲組 \\(${n1}\\) 人平均 \\(${avg1}\\) 分，乙組 \\(${n2}\\) 人平均 \\(${avg2}\\) 分。兩組合併後的總平均為多少？`
      );
      answers.push(
        `簡答：\\(${j632StatText(combined)}\\) 分。過程：合併平均要用人數加權，\\(\\bar x=\\frac{${n1}\\cdot${avg1}+${n2}\\cdot${avg2}}{${n1}+${n2}}=${j632StatText(combined)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632MeanMissingValueSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const countValue = randInt(4, 7);
      const average = randInt(8, 30);
      const known = Array.from({ length: countValue - 1 }, () => average + randInt(-5, 5));
      const missing = countValue * average - known.reduce((sum, value) => sum + value, 0);
      questions.push(
        `\\(${countValue}\\) 個數的平均數為 \\(${average}\\)。已知其中 \\(${countValue - 1}\\) 個數為 \\(${known.join('、')}\\)，求剩下的一個數。`
      );
      answers.push(
        `簡答：\\(${missing}\\)。過程：總和 \\(=\\text{平均數}\\times\\text{個數}=${average}\\times${countValue}=${average * countValue}\\)，已知數總和為 \\(${known.reduce((sum, value) => sum + value, 0)}\\)，所以未知數為 \\(${average * countValue}-${known.reduce((sum, value) => sum + value, 0)}=${missing}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632DataCorrectionEffectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const countValue = randInt(20, 45);
      const oldMean = randInt(45, 80);
      const wrong = randInt(40, 90);
      const delta = randInt(-3, 3) * countValue || countValue;
      const correct = wrong + delta;
      const newMean = oldMean + delta / countValue;
      questions.push(
        `某班 \\(${countValue}\\) 位學生的平均為 \\(${oldMean}\\) 分。後來發現其中一筆成績 \\(${wrong}\\) 分應改為 \\(${correct}\\) 分，求修正後的平均數。`
      );
      answers.push(
        `簡答：\\(${newMean}\\) 分。過程：只需修正總和的差，平均數改變 \\(\\frac{${correct}-${wrong}}{${countValue}}=${delta / countValue}\\)，所以新平均為 \\(${oldMean}+${delta / countValue}=${newMean}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632ArithmeticSequenceStatisticsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const lengths = [5, 9, 13];
    for (let i = 0; i < count; i += 1) {
      const length = lengths[randInt(0, lengths.length - 1)];
      const first = randInt(4, 30);
      const diff = randInt(2, 8);
      const data = Array.from({ length }, (_, index) => first + index * diff);
      const quartiles = j632QuartilesOfSorted(data);
      questions.push(
        `一組資料由小到大排列成等差數列，共 \\(${length}\\) 項，第一項為 \\(${first}\\)，公差為 \\(${diff}\\)。求中位數、\\(Q_1\\)、\\(Q_3\\) 與全距。（四分位數採上下半部不含中位數）`
      );
      answers.push(
        `簡答：中位數 \\(${j632StatText(quartiles.q2)}\\)，\\(Q_1=${j632StatText(quartiles.q1)}\\)，\\(Q_3=${j632StatText(quartiles.q3)}\\)，全距 \\(${data[data.length - 1] - data[0]}\\)。過程：等差數列的中位數就是中間項；再分別看下半部與上半部的中間位置。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632CentralTendencyMixedSet(count) {
    const banks = [
      buildJ632RawMeanMedianModeSet,
      buildJ632LinearTransformStatisticsSet,
      buildJ632WeightedAverageSet,
      buildJ632MeanMissingValueSet,
      buildJ632DataCorrectionEffectSet,
      buildJ632ArithmeticSequenceStatisticsSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632FiveNumberRangeIqrSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const min = randInt(10, 40);
      const q1 = min + randInt(5, 15);
      const q2 = q1 + randInt(5, 15);
      const q3 = q2 + randInt(5, 15);
      const max = q3 + randInt(5, 20);
      questions.push(
        `已知一組資料的五數為最小值 \\(${min}\\)、\\(Q_1=${q1}\\)、\\(Q_2=${q2}\\)、\\(Q_3=${q3}\\)、最大值 \\(${max}\\)。求全距與四分位距。`
      );
      answers.push(
        `簡答：全距 \\(${max - min}\\)，四分位距 \\(${q3 - q1}\\)。過程：全距 \\(=\\text{最大值}-\\text{最小值}=${max}-${min}\\)；四分位距 \\(=Q_3-Q_1=${q3}-${q1}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632RawQuartileCalculationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const start = randInt(5, 30);
      const data = [0, 2, 5, 8, 12, 16, 21, 25, 30].map((value) => start + value + randInt(0, 1));
      data.sort((a, b) => a - b);
      const quartiles = j632QuartilesOfSorted(data);
      questions.push(
        `資料由小到大為 \\(${data.join('、')}\\)。求 \\(Q_1,Q_2,Q_3\\) 與四分位距。（四分位數採上下半部不含中位數）`
      );
      answers.push(
        `簡答：\\(Q_1=${j632StatText(quartiles.q1)},Q_2=${j632StatText(quartiles.q2)},Q_3=${j632StatText(quartiles.q3)}\\)，四分位距 \\(${j632StatText(makeFraction(quartiles.q3.num * quartiles.q1.den - quartiles.q1.num * quartiles.q3.den, quartiles.q3.den * quartiles.q1.den))}\\)。過程：先找中位數 \\(Q_2\\)，再分別取下半部與上半部的中位數。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632FrequencyQuartilePositionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const labels = ['40～50', '50～60', '60～70', '70～80', '80～90'];
    for (let i = 0; i < count; i += 1) {
      const counts = [randInt(3, 8), randInt(5, 12), randInt(8, 16), randInt(5, 12), randInt(3, 8)];
      const total = counts.reduce((sum, value) => sum + value, 0);
      const targetName = ['Q_1', 'Q_2', 'Q_3'][i % 3];
      const targetPosition = total * [0.25, 0.5, 0.75][i % 3];
      let cumulative = 0;
      let group = labels[labels.length - 1];
      for (let index = 0; index < counts.length; index += 1) {
        cumulative += counts[index];
        if (cumulative >= targetPosition) {
          group = labels[index];
          break;
        }
      }
      questions.push(
        `某次數分配表各組 \\(${labels.join('、')}\\) 的次數依序為 \\(${counts.join('、')}\\)，共 \\(${total}\\) 人。判斷 \\(${targetName}\\) 落在哪一組。`
      );
      answers.push(
        `簡答：\\(${targetName}\\) 落在 \\(${group}\\) 組。過程：\\(${targetName}\\) 約看第 \\(${targetPosition}\\) 筆資料；累積次數首次達到或超過此位置的組別就是答案。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632BoxplotFiveNumberSummarySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const min = randInt(10, 30);
      const q1 = min + randInt(4, 12);
      const q2 = q1 + randInt(4, 12);
      const q3 = q2 + randInt(4, 12);
      const max = q3 + randInt(4, 12);
      const gaps = [
        { name: '最小值到 \\(Q_1\\)', value: q1 - min },
        { name: '\\(Q_1\\) 到 \\(Q_2\\)', value: q2 - q1 },
        { name: '\\(Q_2\\) 到 \\(Q_3\\)', value: q3 - q2 },
        { name: '\\(Q_3\\) 到最大值', value: max - q3 },
      ];
      const smallest = gaps.reduce((best, gap) => (gap.value < best.value ? gap : best), gaps[0]);
      questions.push(
        `某盒狀圖的五數為 \\(${min},${q1},${q2},${q3},${max}\\)。求全距、四分位距，並判斷哪一段資料最集中。`
      );
      answers.push(
        `簡答：全距 \\(${max - min}\\)，四分位距 \\(${q3 - q1}\\)，最集中的是「${smallest.name}」。過程：盒狀圖相鄰五數的距離越短，表示同樣 25% 資料越集中。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632BoxplotComparisonSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const rangeA = randInt(30, 70);
      const iqrA = randInt(10, Math.floor(rangeA / 2));
      const rangeB = randInt(30, 70);
      const iqrB = randInt(10, Math.floor(rangeB / 2));
      const spreadWinner = rangeA > rangeB ? '甲班' : rangeA < rangeB ? '乙班' : '兩班相同';
      const concentrated = iqrA < iqrB ? '甲班' : iqrA > iqrB ? '乙班' : '兩班相同';
      questions.push(
        `甲班盒狀圖的全距為 \\(${rangeA}\\)、四分位距為 \\(${iqrA}\\)；乙班全距為 \\(${rangeB}\\)、四分位距為 \\(${iqrB}\\)。哪一班整體分散較大？哪一班中間 50% 較集中？`
      );
      answers.push(
        `簡答：整體分散較大：${spreadWinner}；中間 50% 較集中：${concentrated}。過程：全距比較整體分散，四分位距比較中間 50% 的集中程度，四分位距越小越集中。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632PercentileRankConversionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const totals = [40, 50, 80, 100, 200, 8000];
    const prs = [25, 40, 53, 75, 82, 90, 92];
    for (let i = 0; i < count; i += 1) {
      const total = totals[randInt(0, totals.length - 1)];
      const pr = prs[randInt(0, prs.length - 1)];
      const below = Math.floor((total * pr) / 100);
      questions.push(`某測驗共有 \\(${total}\\) 人參加，小明的百分等級為 \\(PR${pr}\\)。估計他的成績至少贏過幾人？`);
      answers.push(
        `簡答：約 \\(${below}\\) 人。過程：\\(PR${pr}\\) 表示約有 \\(${pr}\\%\\) 的人不高於他，所以人數約為 \\(${total}\\times${pr}\\%=${(total * pr) / 100}\\)，取整數約 \\(${below}\\) 人。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632SortedDataPercentileSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const percentileChoices = [25, 40, 50, 60, 75, 80, 90];
    for (let i = 0; i < count; i += 1) {
      const length = [10, 12, 15, 20][randInt(0, 3)];
      const base = randInt(35, 55);
      const data = Array.from({ length }, (_, index) => base + index * randInt(2, 4) + randInt(0, 1));
      data.sort((a, b) => a - b);
      if (i % 2 === 0) {
        const p = percentileChoices[randInt(0, percentileChoices.length - 1)];
        const position = Math.ceil((length * p) / 100);
        const value = data[position - 1];
        questions.push(
          `某測驗成績由小到大排列為 \\(${data.join('、')}\\)。以「第 \\(p\\) 百分位數約看第 \\(\\lceil np/100\\rceil\\) 筆」計算，求第 \\(${p}\\) 百分位數。`
        );
        answers.push(
          `簡答：\\(${value}\\) 分。過程：共有 \\(${length}\\) 筆，位置 \\(=\\lceil ${length}\\times${p}/100\\rceil=\\lceil ${(length * p) / 100}\\rceil=${position}\\)，所以看第 \\(${position}\\) 筆，為 \\(${value}\\) 分。`
        );
      } else {
        const position = randInt(2, length - 1);
        const value = data[position - 1];
        const pr = Math.round((position / length) * 100);
        questions.push(
          `某測驗成績由小到大排列為 \\(${data.join('、')}\\)。若小華得到 \\(${value}\\) 分，且這是第 \\(${position}\\) 筆資料，估計他的百分等級約為多少？`
        );
        answers.push(
          `簡答：約 \\(PR${pr}\\)。過程：百分等級可用「不高於他的資料數占全體比例」估計，\\(\\frac{${position}}{${length}}\\times100\\%=${((position / length) * 100).toFixed(1)}\\%\\)，約為 \\(PR${pr}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ632QuartileBoxplotMixedSet(count) {
    const banks = [
      buildJ632FiveNumberRangeIqrSet,
      buildJ632RawQuartileCalculationSet,
      buildJ632FrequencyQuartilePositionSet,
      buildJ632BoxplotFiveNumberSummarySet,
      buildJ632BoxplotComparisonSet,
      buildJ632PercentileRankConversionSet,
      buildJ632SortedDataPercentileSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function deriveSummaryAnswerFromDetail(detail) {
    const text = String(detail || '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) return '';

    // Prefer an explicit "簡答：X" / "答案：X" label when present (the vast
    // majority of practice-generator answers are written this way): extract
    // everything up to the next "過程/解析/詳解/說明" label. This must run
    // before the looser heuristics below, which otherwise can grab an
    // unrelated trailing fragment of the *explanation* text (e.g. a sentence
    // ending in "...可得範圍。" gets misread as the answer "範圍").
    const labelMatch = text.match(/(?:簡答|答案)[:：]\s*([\s\S]*?)(?=(?:。|；|\n)?\s*(?:過程|解析|詳解|說明)[:：]|$)/);
    if (labelMatch && labelMatch[1] && labelMatch[1].trim()) {
      return labelMatch[1].trim();
    }

    const directKeywords = ['所以', '解得', '結果是', '因此', '答案是', '可得'];
    let lastKeywordIndex = -1;
    let lastKeyword = '';
    for (const keyword of directKeywords) {
      const idx = text.lastIndexOf(keyword);
      if (idx > lastKeywordIndex) {
        lastKeywordIndex = idx;
        lastKeyword = keyword;
      }
    }
    if (lastKeywordIndex >= 0) {
      const candidate = text
        .slice(lastKeywordIndex + lastKeyword.length)
        .trim()
        .replace(/^[：:，, ]+/, '')
        .replace(/[。．]+$/, '');
      if (candidate) return candidate;
    }

    const mathMatches = [...text.matchAll(/\$([^$]+)\$/g)];
    if (mathMatches.length) {
      const candidate = mathMatches[mathMatches.length - 1][1].trim();
      if (candidate) return `$${candidate}$`;
    }

    const sentence = text.split(/[。．]/)[0].trim();
    return sentence || text;
  }

  function createAnswerList(summaryAnswers) {
    const answers = [];
    const nativePush = Array.prototype.push;
    answers.push = function pushAnswerWithSummary(...items) {
      items.forEach((item) => {
        summaryAnswers.push(deriveSummaryAnswerFromDetail(item));
      });
      return nativePush.apply(this, items);
    };
    return answers;
  }

  const nextConfigs = {
    'j6-1-1-parabola-ax2-four-subtypes': {
      type: 'drill',
      title: '二次函數 y=ax^2 基本圖形判讀綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ611ParabolaAx2FourSubtypeMixedSet(6);
      },
    },
    'j6-1-1-quadratic-definition': {
      type: 'drill',
      title: '二次函數的定義判別',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ611QuadraticDefinitionSet(5);
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
    'j6-1-1-quadrant-location': {
      type: 'drill',
      title: '圖形所在象限判定',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ611QuadrantLocationSet(5);
      },
    },
    'j6-1-1-parabola-applications-five-subtypes': {
      type: 'drill',
      title: '二次函數圖形的坐標幾何與建模綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ611ParabolaApplicationsFiveSubtypeMixedSet(5);
      },
    },
    'j6-1-1-square-in-parabola': {
      type: 'drill',
      title: '拋物線內嵌正方形',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ611SquareInParabolaSet(5);
      },
    },
    'j6-1-1-horizontal-chord-length': {
      type: 'drill',
      title: '水平弦長與距離計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ611HorizontalChordLengthSet(5);
      },
    },
    'j6-1-1-triangle-area-on-parabola': {
      type: 'drill',
      title: '拋物線上的三角形面積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ611TriangleAreaOnParabolaSet(5);
      },
    },
    'j6-1-1-line-parabola-grid-points': {
      type: 'drill',
      title: '多個函數的格子點判讀',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ611LineParabolaGridPointSet(5);
      },
    },
    'j6-1-1-parabola-modeling': {
      type: 'drill',
      title: '二次函數的實際建模',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ611ParabolaModelingSet(5);
      },
    },
    'j6-1-2-vertex-form-extrema-three-subtypes': {
      type: 'drill',
      title: '頂點式、配方法與極值判定綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ612VertexFormExtremaMixedSet(6);
      },
    },
    'j6-1-2-vertex-form-read': {
      type: 'drill',
      title: '頂點式參數的直覺讀取',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ612VertexFormReadSet(5);
      },
    },
    'j6-1-2-completing-square-extreme': {
      type: 'drill',
      title: '配方法轉換與極值判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612CompletingSquareExtremeSet(5);
      },
    },
    'j6-1-2-function-from-vertex-point': {
      type: 'drill',
      title: '給定頂點與通過點反求函數式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612FunctionFromVertexPointSet(5);
      },
    },
    'j6-1-2-extreme-parameter-from-condition': {
      type: 'drill',
      title: '由極值條件反求參數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612ExtremeParameterFromConditionSet(5);
      },
    },
    'j6-1-2-translation-graph-five-subtypes': {
      type: 'drill',
      title: '平移變換與圖形重合綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612TranslationGraphMixedSet(5);
      },
    },
    'j6-1-2-basic-translation-equation': {
      type: 'drill',
      title: '基礎平移寫出新函數式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612BasicTranslationEquationSet(5);
      },
    },
    'j6-1-2-vertex-axis-translation': {
      type: 'drill',
      title: '頂點坐標與對稱軸的位移追蹤',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612VertexAxisTranslationSet(5);
      },
    },
    'j6-1-2-translation-reverse': {
      type: 'drill',
      title: '平移關係判定與反求位移',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612TranslationReverseSet(5);
      },
    },
    'j6-1-2-congruence-same-a': {
      type: 'drill',
      title: '圖形重合判定與相同 a 值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612CongruenceSameASet(5);
      },
    },
    'j6-1-2-point-after-translation': {
      type: 'drill',
      title: '圖形上特定點的坐標變化',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612PointAfterTranslationSet(5);
      },
    },
    'j6-1-2-x-axis-intersection-three-subtypes': {
      type: 'drill',
      title: '與 x 軸交點與判別式綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ612XAxisIntersectionMixedSet(6);
      },
    },
    'j6-1-2-x-intercepts-coordinate': {
      type: 'drill',
      title: '計算二次函數與 x 軸交點坐標',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612XInterceptsCoordinateSet(5);
      },
    },
    'j6-1-2-discriminant-count': {
      type: 'drill',
      title: '用判別式判斷與 x 軸交點個數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612DiscriminantCountSet(5);
      },
    },
    'j6-1-2-vertex-position-intersection': {
      type: 'drill',
      title: '結合頂點位置與開口判斷交點個數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ612VertexPositionIntersectionSet(5);
      },
    },
    'j6-1-3-algebra-extrema-three-subtypes': {
      type: 'drill',
      title: '代數限制與距離平方極值綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ613AlgebraExtremaMixedSet(6);
      },
    },
    'j6-1-3-number-sum-square-extrema': {
      type: 'drill',
      title: '數字與平方和極值問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613NumberSumSquareExtremaSet(5);
      },
    },
    'j6-1-3-line-distance-square': {
      type: 'drill',
      title: '數線上的距離平方和極值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613LineDistanceSquareSet(5);
      },
    },
    'j6-1-3-linear-constraint-extrema': {
      type: 'drill',
      title: '代數約束下的極值計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613LinearConstraintExtremaSet(5);
      },
    },
    'j6-1-3-interval-extrema': {
      type: 'drill',
      title: '限制區間內的最大值與最小值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613IntervalExtremaSet(5);
      },
    },
    'j6-1-3-geometry-modeling-four-subtypes': {
      type: 'drill',
      title: '幾何面積、通行限制與拋物線建模綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ613GeometryModelingMixedSet(6);
      },
    },
    'j6-1-3-rectangle-perimeter-area': {
      type: 'drill',
      title: '幾何圖形面積與周長極值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613RectanglePerimeterAreaSet(5);
      },
    },
    'j6-1-3-fencing-variations': {
      type: 'drill',
      title: '圍籬、河邊與出入口面積最大化',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613FencingVariationsSet(5);
      },
    },
    'j6-1-3-split-squares-minimum': {
      type: 'drill',
      title: '鐵絲分段圍正方形的面積最小',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613SplitSquaresMinimumSet(5);
      },
    },
    'j6-1-3-parabola-clearance': {
      type: 'drill',
      title: '拋物線建模與通行高度判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613ParabolaClearanceSet(5);
      },
    },
    'j6-1-3-water-channel-width': {
      type: 'drill',
      title: '拋物線河道與水面寬度變化',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613WaterChannelWidthSet(5);
      },
    },
    'j6-1-3-business-production-three-subtypes': {
      type: 'drill',
      title: '利潤策略、票價收入與產量決策綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ613BusinessProductionMixedSet(6);
      },
    },
    'j6-1-3-ticket-revenue': {
      type: 'drill',
      title: '票價調整與最高收入',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613TicketRevenueSet(5);
      },
    },
    'j6-1-3-price-profit': {
      type: 'drill',
      title: '商品定價與最大利潤',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613PriceProfitSet(5);
      },
    },
    'j6-1-3-orchard-yield': {
      type: 'drill',
      title: '果園產量與植樹密度問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ613OrchardYieldSet(5);
      },
    },
    'j6-2-1-spatial-distance-four-subtypes': {
      type: 'drill',
      title: '空間距離與垂直性質綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ621SpatialDistanceMixedSet(6);
      },
    },
    'j6-2-1-cuboid-space-diagonal': {
      type: 'drill',
      title: '長方體體對角線與三維畢氏',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ621CuboidSpaceDiagonalSet(5);
      },
    },
    'j6-2-1-line-plane-distance': {
      type: 'drill',
      title: '直線垂直平面形成的距離計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ621LinePlaneDistanceSet(5);
      },
    },
    'j6-2-1-three-perpendicular-distance': {
      type: 'drill',
      title: '三垂線配置中的空間距離',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ621ThreePerpendicularDistanceSet(5);
      },
    },
    'j6-2-1-cube-face-center-distance': {
      type: 'drill',
      title: '正方體相鄰面中心距離',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ621CubeFaceCenterDistanceSet(5);
      },
    },
    'j6-2-1-spatial-logic-two-subtypes': {
      type: 'drill',
      title: '空間線面關係與邏輯判定',
      difficulty: 'easy',
      questionCount: 6,
      generate() {
        return buildJ621SpatialLogicMixedSet(6);
      },
    },
    'j6-2-1-line-plane-perpendicular-logic': {
      type: 'drill',
      title: '線垂直平面的性質判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ621LinePlanePerpendicularLogicSet(5);
      },
    },
    'j6-2-1-parallel-perpendicular-relations': {
      type: 'drill',
      title: '平行與垂直關係的反例判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ621ParallelPerpendicularRelationsSet(5);
      },
    },
    'j6-2-1-solid-volume-ratio-three-subtypes': {
      type: 'drill',
      title: '立體體積比例與旋轉建模綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ621SolidVolumeRatioMixedSet(6);
      },
    },
    'j6-2-1-solid-scaling-ratio': {
      type: 'drill',
      title: '相似立體與圓柱體積倍率',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ621SolidScalingRatioSet(5);
      },
    },
    'j6-2-1-cylinder-volume-model': {
      type: 'drill',
      title: '圓柱體積與體積比計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ621CylinderVolumeModelSet(5);
      },
    },
    'j6-2-1-composite-solid-volume': {
      type: 'drill',
      title: '挖孔與旋轉形成的複合體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ621CompositeSolidVolumeSet(5);
      },
    },
    'j6-2-2-basic-surface-volume-three-subtypes': {
      type: 'drill',
      title: '柱體表面積與體積基本計算',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ622BasicSurfaceVolumeMixedSet(6);
      },
    },
    'j6-2-2-triangular-prism-volume': {
      type: 'drill',
      title: '直角三角柱體積計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622TriangularPrismVolumeSet(5);
      },
    },
    'j6-2-2-rect-prism-surface-volume': {
      type: 'drill',
      title: '長方體表面積與體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622RectPrismSurfaceVolumeSet(5);
      },
    },
    'j6-2-2-cylinder-surface-volume': {
      type: 'drill',
      title: '圓柱體積與表面積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622CylinderSurfaceVolumeSet(5);
      },
    },
    'j6-2-2-composite-scaling-three-subtypes': {
      type: 'drill',
      title: '複合立體與比例變化綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ622CompositeScalingMixedSet(6);
      },
    },
    'j6-2-2-hollow-cylinder-volume': {
      type: 'drill',
      title: '空心圓柱材料體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622HollowCylinderVolumeSet(5);
      },
    },
    'j6-2-2-prism-cylinder-composite': {
      type: 'drill',
      title: '挖孔與複合柱體體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622PrismCylinderCompositeSet(5);
      },
    },
    'j6-2-2-solid-scaling-ratio': {
      type: 'drill',
      title: '立體比例變化與倍率',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622SolidScalingSet(5);
      },
    },
    'j6-2-2-surface-shortest-path-two-subtypes': {
      type: 'drill',
      title: '立體展開圖與表面最短路徑',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ622SurfaceShortestPathMixedSet(6);
      },
    },
    'j6-2-2-cuboid-surface-shortest-path': {
      type: 'drill',
      title: '長方體表面最短路徑',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622CuboidSurfaceShortestPathSet(5);
      },
    },
    'j6-2-2-cylinder-surface-shortest-path': {
      type: 'drill',
      title: '圓柱側面展開最短路徑',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622CylinderSurfaceShortestPathSet(5);
      },
    },
    'j6-2-2-prism-euler-two-subtypes': {
      type: 'drill',
      title: '角柱數量規律與尤拉公式',
      difficulty: 'easy',
      questionCount: 6,
      generate() {
        return buildJ622PrismEulerMixedSet(6);
      },
    },
    'j6-2-2-prism-counting': {
      type: 'drill',
      title: '角柱頂點邊面數量規律',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ622PrismCountingSet(5);
      },
    },
    'j6-2-2-euler-formula': {
      type: 'drill',
      title: '尤拉公式的應用與反推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622EulerFormulaSet(5);
      },
    },
    'j6-2-2-container-water-two-subtypes': {
      type: 'drill',
      title: '容器水位與排水體積',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ622ContainerWaterMixedSet(6);
      },
    },
    'j6-2-2-water-displacement': {
      type: 'drill',
      title: '水位上升與排開體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622WaterDisplacementSet(5);
      },
    },
    'j6-2-2-water-pipe-volume': {
      type: 'drill',
      title: '圓柱形水管容量計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ622WaterPipeVolumeSet(5);
      },
    },
    'j6-2-3-sphere-section-four-subtypes': {
      type: 'drill',
      title: '球截面半徑、面積與大圓綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ623SphereSectionMixedSet(6);
      },
    },
    'j6-2-3-sphere-section-radius-distance': {
      type: 'drill',
      title: '球截面半徑與球心距離',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623SphereSectionRadiusDistanceSet(5);
      },
    },
    'j6-2-3-sphere-section-circle-measure': {
      type: 'drill',
      title: '截圓面積與周長計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623SphereSectionCircleMeasureSet(5);
      },
    },
    'j6-2-3-sphere-section-reverse': {
      type: 'drill',
      title: '由截圓資訊反求球半徑',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623SphereSectionReverseSet(5);
      },
    },
    'j6-2-3-sphere-great-circle': {
      type: 'drill',
      title: '大圓與最大截面判定',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ623SphereGreatCircleSet(5);
      },
    },
    'j6-2-3-cone-surface-four-subtypes': {
      type: 'drill',
      title: '圓錐展開、母線與表面積綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ623ConeSurfaceMixedSet(6);
      },
    },
    'j6-2-3-cone-sector-angle-arc': {
      type: 'drill',
      title: '圓錐展開扇形圓心角',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623ConeSectorAngleArcSet(5);
      },
    },
    'j6-2-3-cone-pythagorean': {
      type: 'drill',
      title: '圓錐高、半徑與母線',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623ConePythagoreanSet(5);
      },
    },
    'j6-2-3-cone-surface-area': {
      type: 'drill',
      title: '圓錐側面積與表面積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623ConeSurfaceAreaSet(5);
      },
    },
    'j6-2-3-cone-area-ratio': {
      type: 'drill',
      title: '圓錐側面積與底面積比',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623ConeAreaRatioSet(5);
      },
    },
    'j6-2-3-pyramid-counting-three-subtypes': {
      type: 'drill',
      title: '角錐數量規律與尤拉公式綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ623PyramidCountingMixedSet(6);
      },
    },
    'j6-2-3-pyramid-counting': {
      type: 'drill',
      title: 'n 角錐頂點邊面數量規律',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ623PyramidCountingSet(5);
      },
    },
    'j6-2-3-pyramid-euler': {
      type: 'drill',
      title: '尤拉公式與多面體反推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623PyramidEulerSet(5);
      },
    },
    'j6-2-3-pyramid-reverse': {
      type: 'drill',
      title: '角錐 n 值反向推算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623PyramidReverseSet(5);
      },
    },
    'j6-3-3-probability-single-mixed': {
      type: 'drill',
      title: '單一試驗與古典機率綜合',
      difficulty: 'easy',
      questionCount: 6,
      generate() {
        return buildJ623ProbabilitySingleMixedSet(6);
      },
    },
    'j6-3-3-single-trial-probability': {
      type: 'drill',
      title: '單一隨機試驗的機率',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ623SingleTrialProbabilitySet(5);
      },
    },
    'j6-3-3-coin-tree-probability': {
      type: 'drill',
      title: '硬幣與性別樹狀圖機率',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ623CoinTreeProbabilitySet(5);
      },
    },
    'j6-3-3-dice-sum-product': {
      type: 'drill',
      title: '兩顆骰子的點數運算機率',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623DiceSumProductSet(5);
      },
    },
    'j6-3-3-number-arrangement-probability': {
      type: 'drill',
      title: '數字排列與倍數條件機率',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623NumberArrangementProbabilitySet(5);
      },
    },
    'j6-3-3-probability-compound-mixed': {
      type: 'drill',
      title: '兩步試驗、抽樣與互補事件綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ623ProbabilityCompoundMixedSet(6);
      },
    },
    'j6-3-3-sampling-with-without-replacement': {
      type: 'drill',
      title: '放回與不放回抽球機率',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623SamplingWithWithoutReplacementSet(5);
      },
    },
    'j6-3-3-two-bag-combination': {
      type: 'drill',
      title: '兩袋各取一球的組合機率',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623TwoBagCombinationSet(5);
      },
    },
    'j6-3-3-algebra-condition-probability': {
      type: 'drill',
      title: '骰子點數與代數條件機率',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623AlgebraConditionProbabilitySet(5);
      },
    },
    'j6-3-3-complement-probability': {
      type: 'drill',
      title: '互補事件與至少一次機率',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623ComplementProbabilitySet(5);
      },
    },
    'j6-3-3-probability-game-mixed': {
      type: 'drill',
      title: '猜拳、骰子與遊戲機率綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ623ProbabilityGameMixedSet(6);
      },
    },
    'j6-3-3-rock-paper-scissors': {
      type: 'drill',
      title: '猜拳樣本空間與勝負機率',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ623RockPaperScissorsSet(5);
      },
    },
    'j6-3-1-frequency-distribution-eight-subtypes': {
      type: 'drill',
      title: '次數分配、統計圖表與抽樣估計綜合',
      difficulty: 'medium',
      questionCount: 8,
      generate() {
        return buildJ631FrequencyDistributionMixedSet(8);
      },
    },
    'j6-3-1-relative-frequency': {
      type: 'drill',
      title: '相對次數與總次數互換',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ631RelativeFrequencySet(5);
      },
    },
    'j6-3-1-cumulative-frequency': {
      type: 'drill',
      title: '累積次數與原始次數推算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ631CumulativeFrequencySet(5);
      },
    },
    'j6-3-1-class-interval-rule': {
      type: 'drill',
      title: '組距範圍與組中點判定',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ631ClassIntervalRuleSet(5);
      },
    },
    'j6-3-1-mark-recapture-estimation': {
      type: 'drill',
      title: '抽樣調查與母體數估計',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ631MarkRecaptureSet(5);
      },
    },
    'j6-3-1-data-sorting-count': {
      type: 'drill',
      title: '資料排序與區間計數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ631DataSortingCountSet(5);
      },
    },
    'j6-3-1-missing-frequency': {
      type: 'drill',
      title: '缺漏次數與累積次數補齊',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ631MissingFrequencySet(5);
      },
    },
    'j6-3-1-chart-trend-reading': {
      type: 'drill',
      title: '折線圖與統計表增減判讀',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ631ChartTrendReadingSet(5);
      },
    },
    'j6-3-1-sampling-estimated-total': {
      type: 'drill',
      title: '抽樣比例估計總量',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ631SamplingEstimatedTotalSet(5);
      },
    },
    'j6-3-1-pie-chart-five-subtypes': {
      type: 'drill',
      title: '圓餅圖百分比、圓心角與人數綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ631PieChartMixedSet(6);
      },
    },
    'j6-3-1-pie-angle-percent': {
      type: 'drill',
      title: '圓餅圖百分比與圓心角互換',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ631PieAnglePercentSet(5);
      },
    },
    'j6-3-1-pie-partial-quantity': {
      type: 'drill',
      title: '圓餅圖部分人數與總數推算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ631PiePartialQuantitySet(5);
      },
    },
    'j6-3-1-pie-compare-difference': {
      type: 'drill',
      title: '圓餅圖類別人數差距比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ631PieCompareDifferenceSet(5);
      },
    },
    'j6-3-1-pie-missing-allocation': {
      type: 'drill',
      title: '圓餅圖缺失項目補齊',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ631PieMissingAllocationSet(5);
      },
    },
    'j6-3-1-pie-percentile-position': {
      type: 'drill',
      title: '百分位數與圓餅圖分組定位',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ631PiePercentilePositionSet(5);
      },
    },
    'j6-3-2-central-tendency-six-subtypes': {
      type: 'drill',
      title: '平均數、中位數、眾數與加權平均綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ632CentralTendencyMixedSet(6);
      },
    },
    'j6-3-2-raw-mean-median-mode': {
      type: 'drill',
      title: '未分組資料的平均數、中位數與眾數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ632RawMeanMedianModeSet(5);
      },
    },
    'j6-3-2-linear-transform-statistics': {
      type: 'drill',
      title: '統計量的加減與倍數變換',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632LinearTransformStatisticsSet(5);
      },
    },
    'j6-3-2-weighted-average': {
      type: 'drill',
      title: '混合組別的加權平均',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632WeightedAverageSet(5);
      },
    },
    'j6-3-2-mean-missing-value': {
      type: 'drill',
      title: '已知平均數反求未知數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632MeanMissingValueSet(5);
      },
    },
    'j6-3-2-data-correction-effect': {
      type: 'drill',
      title: '資料修正對平均數的影響',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632DataCorrectionEffectSet(5);
      },
    },
    'j6-3-2-arithmetic-sequence-statistics': {
      type: 'drill',
      title: '等差資料的統計量規律',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632ArithmeticSequenceStatisticsSet(5);
      },
    },
    'j6-3-2-quartile-boxplot-seven-subtypes': {
      type: 'drill',
      title: '四分位數、盒狀圖與百分位數綜合',
      difficulty: 'medium',
      questionCount: 7,
      generate() {
        return buildJ632QuartileBoxplotMixedSet(7);
      },
    },
    'j6-3-2-five-number-range-iqr': {
      type: 'drill',
      title: '五數摘要的全距與四分位距',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ632FiveNumberRangeIqrSet(5);
      },
    },
    'j6-3-2-raw-quartile-calculation': {
      type: 'drill',
      title: '未分組資料的四分位數計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632RawQuartileCalculationSet(5);
      },
    },
    'j6-3-2-frequency-quartile-position': {
      type: 'drill',
      title: '次數分配表中的四分位數定位',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632FrequencyQuartilePositionSet(5);
      },
    },
    'j6-3-2-boxplot-five-number-summary': {
      type: 'drill',
      title: '盒狀圖五數摘要與集中程度',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632BoxplotFiveNumberSummarySet(5);
      },
    },
    'j6-3-2-boxplot-comparison': {
      type: 'drill',
      title: '盒狀圖比較與邏輯判讀',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632BoxplotComparisonSet(5);
      },
    },
    'j6-3-2-percentile-rank-conversion': {
      type: 'drill',
      title: '百分位數與名次逆向推算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632PercentileRankConversionSet(5);
      },
    },
    'j6-3-2-sorted-data-percentile': {
      type: 'drill',
      title: '排序資料中的百分位定位',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ632SortedDataPercentileSet(5);
      },
    },
  };

  const bundleFingerprint = 'j6-bundle-v20260706-summary-v1';
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== 'object') return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
