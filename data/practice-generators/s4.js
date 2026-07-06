(() => {
  const store = window.formulaPracticeStore;
  if (!store || typeof store.registerConfigs !== "function") return;
  try {

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

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

  function buildS223MixedSet(banks, count) {
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

  function s324Pick(items) {
    return items[randInt(0, items.length - 1)];
  }

  function s331Gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function s331Frac(num, den) {
    if (den === 0) return '未定義';
    let n = num;
    let d = den;
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = s331Gcd(n, d);
    n /= g;
    d /= g;
    if (d === 1) return String(n);
    return '\\frac{' + n + '}{' + d + '}';
  }

  function s333Sqrt(n) {
    const root = Math.sqrt(n);
    if (Number.isInteger(root)) return String(root);
    return '\\sqrt{' + n + '}';
  }

  function s333Quotient(numer, denom) {
    if (numer === 0) return '0';
    const numericDenom = typeof denom === 'number' ? denom : /^-?\d+$/.test(String(denom)) ? Number(denom) : null;
    if (numericDenom !== null) return s331Frac(numer, numericDenom);
    return '\\frac{' + numer + '}{' + denom + '}';
  }

  function s333RadicalMultiple(k, n) {
    const root = Math.sqrt(n);
    if (Number.isInteger(root)) return String(k * root);
    return (k === 1 ? '' : String(k)) + '\\sqrt{' + n + '}';
  }

  function s334Det(a, b, c, d) {
    return a * d - b * c;
  }

  function s334SignedTerm(coef, symbol) {
    if (coef === 0) return '';
    if (coef === 1) return '+' + symbol;
    if (coef === -1) return '-' + symbol;
    return (coef > 0 ? '+' : '') + coef + symbol;
  }

  function s411Name(base) {
    return base + '_' + randInt(1, 9);
  }

  function buildS411SpatialRelationsSet(count) {
    const builders = [
      () => {
        const L1 = s411Name('L');
        const L2 = s411Name('M');
        const E = s411Name('E');
        const isPerp = Math.random() < 0.5;
        return isPerp
          ? s331QA(
              '若兩相異直線 ' +
                s331M(L1 + ',' + L2) +
                ' 同時垂直於平面 ' +
                s331M(E) +
                '，則 ' +
                s331M(L1) +
                ' 與 ' +
                s331M(L2) +
                ' 是否必定平行？',
              '是',
              '同一平面的垂線方向唯一，因此兩條都垂直同一平面的直線必定平行。'
            )
          : s331QA(
              '若兩相異直線 ' +
                s331M(L1 + ',' + L2) +
                ' 同時平行於平面 ' +
                s331M(E) +
                '，則 ' +
                s331M(L1) +
                ' 與 ' +
                s331M(L2) +
                ' 是否必定平行？',
              '否',
              '兩直線都平行同一平面時，仍可能相交或歪斜，不一定彼此平行。'
            );
      },
      () => {
        const E1 = s411Name('E');
        const E2 = s411Name('F');
        const L = s411Name('L');
        const isPerp = Math.random() < 0.5;
        return isPerp
          ? s331QA(
              '若兩相異平面 ' +
                s331M(E1 + ',' + E2) +
                ' 同時垂直於直線 ' +
                s331M(L) +
                '，則 ' +
                s331M(E1) +
                ' 與 ' +
                s331M(E2) +
                ' 是否必定平行？',
              '是',
              '同一直線的垂直平面方向固定；兩相異平面都垂直同一直線時必定平行。'
            )
          : s331QA(
              '若兩相異平面 ' +
                s331M(E1 + ',' + E2) +
                ' 同時平行於直線 ' +
                s331M(L) +
                '，則 ' +
                s331M(E1) +
                ' 與 ' +
                s331M(E2) +
                ' 是否必定平行？',
              '否',
              '兩平面都平行同一直線時，仍可能相交於一條與該直線平行的交線。'
            );
      },
      () => {
        const L = s411Name('L');
        const E = s411Name('E');
        return s331QA(
          '若直線 ' +
            s331M(L) +
            ' 平行於平面 ' +
            s331M(E) +
            '，則平面 ' +
            s331M(E) +
            ' 上任一直線都與 ' +
            s331M(L) +
            ' 平行嗎？',
          '否',
          '平面內只有部分直線可能與 ' + s331M(L) + ' 平行；其他直線可能與 ' + s331M(L) + ' 歪斜。'
        );
      },
      () => {
        const P = s411Name('P');
        const E = s411Name('E');
        return s331QA(
          '過平面 ' + s331M(E) + ' 外一點 ' + s331M(P) + '，恰有一條直線平行於平面 ' + s331M(E) + ' 嗎？',
          '否',
          '過平面外一點可作無窮多條直線平行於該平面，方向不唯一。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS411PlaneDeterminationSet(count) {
    const builders = [
      () => {
        const nonCollinear = Math.random() < 0.6;
        return s331QA(
          nonCollinear ? '空間中三個不共線點，是否能決定唯一一個平面？' : '空間中三個共線點，是否能決定唯一一個平面？',
          nonCollinear ? '是' : '否',
          nonCollinear ? '三個不共線點是決定平面的基本條件。' : '三點共線時，有無窮多個平面可以通過同一直線。'
        );
      },
      () => {
        const outside = Math.random() < 0.6;
        return s331QA(
          outside
            ? '一條直線與此直線外的一個點，是否能決定唯一一個平面？'
            : '一條直線與此直線上的一個點，是否能決定唯一一個平面？',
          outside ? '是' : '否',
          outside
            ? '直線加上線外一點，能唯一決定一個平面。'
            : '點已在直線上，條件沒有增加；仍有無窮多平面可通過該直線。'
        );
      },
      () => {
        const relation = s324Pick([
          ['相交', '是', '兩條相交直線決定唯一平面。'],
          ['平行', '是', '兩條相異平行直線決定唯一平面。'],
          ['歪斜', '否', '歪斜線不共平面，不能決定一個平面。'],
        ]);
        return s331QA('兩條互相「' + relation[0] + '」的相異直線，是否能決定唯一一個平面？', relation[1], relation[2]);
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS411PolyhedronEdgeRelationsSet(count) {
    const builders = [
      () => {
        const vertical = s324Pick([
          ['AE', 'BC,CD,FG,GH'],
          ['BF', 'CD,DA,GH,HE'],
          ['CG', 'DA,AB,HE,EF'],
          ['DH', 'AB,BC,EF,FG'],
        ]);
        return s331QA(
          '在長方體 ' + s331M('ABCD-EFGH') + ' 中，找出所有與稜線 ' + s331M(vertical[0]) + ' 互為歪斜線的稜線。',
          s331M(vertical[1]),
          '先排除與它相交的稜，再排除與它平行的稜，剩下不相交且不平行者就是歪斜線。'
        );
      },
      () => {
        const pair = s324Pick([
          ['AB', 'CD', '歪斜且垂直'],
          ['AC', 'BD', '歪斜且垂直'],
          ['AD', 'BC', '歪斜且垂直'],
        ]);
        return s331QA(
          '在正四面體 ' + s331M('ABCD') + ' 中，稜線 ' + s331M(pair[0]) + ' 與對稜 ' + s331M(pair[1]) + ' 的關係為何？',
          pair[2],
          '正四面體的對稜不相交且不平行，所以是歪斜線；由對稱性可判斷兩對稜互相垂直。'
        );
      },
      () => {
        const through = randInt(2, 4);
        return s331QA(
          '正方體中，若一個平面通過同一頂點出發的 ' + through + ' 條稜，截面可能是什麼圖形？',
          through >= 3 ? '三角形' : '不一定，需再知道平面位置',
          through >= 3
            ? '通過同一頂點的三條稜時，截面會在鄰近三條稜上各取一點，形成三角形。'
            : '只知道兩條稜仍不足以唯一決定截面形狀。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS411ThreePerpendicularDistanceSet(count) {
    const builders = [
      () => {
        const data = s324Pick([
          [3, 4, 5, 12, 13],
          [5, 12, 13, 84, 85],
          [7, 24, 25, 60, 65],
          [8, 15, 17, 144, 145],
        ]);
        const PA = data[0];
        const AB = data[1];
        const PB = data[2];
        const BC = data[3];
        const PC = data[4];
        return s331QA(
          '已知 ' +
            s331M('PA\\perp E') +
            ' 於 ' +
            s331M('A') +
            '，在平面 ' +
            s331M('E') +
            ' 上有 ' +
            s331M('AB\\perp BC') +
            '。若 ' +
            s331MJ('PA=', PA, ',\\ AB=', AB, ',\\ BC=', BC) +
            '，求 ' +
            s331M('PC') +
            '。',
          s331MJ(PC),
          '先用 ' +
            s331M('PA^2+AB^2=PB^2') +
            '，再用三垂線定理得到 ' +
            s331M('PB\\perp BC') +
            '，故 ' +
            s331M('PC^2=PB^2+BC^2') +
            '。'
        );
      },
      () => {
        const PC = s324Pick([13, 17, 25, 29]);
        const PA = s324Pick([3, 5, 7, 8]);
        const BC = s324Pick([4, 8, 12, 15]);
        const ab2 = PC * PC - PA * PA - BC * BC;
        const AB = Math.sqrt(ab2);
        const ok = Number.isInteger(AB) && AB > 0;
        return s331QA(
          '承三垂線配置，若 ' + s331MJ('PA=', PA, ',\\ BC=', BC, ',\\ PC=', PC) + '，求 ' + s331M('AB') + '。',
          ok ? s331MJ(AB) : s331M('\\sqrt{' + ab2 + '}'),
          '由 ' + s331M('PC^2=PA^2+AB^2+BC^2') + '，移項得到 ' + s331M('AB^2=PC^2-PA^2-BC^2') + '。'
        );
      },
      () => {
        const h = s324Pick([8, 12, 15]);
        const r = s324Pick([5, 9, 16]);
        return s331QA(
          '一座垂直於地面的塔高 ' + h + ' 公尺，塔底中心到河流最近點水平距離為 ' + r + ' 公尺，求塔頂到該點的距離。',
          s331MJ(s333Sqrt(h * h + r * r)),
          '塔高與水平距離互相垂直，直接形成直角三角形。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS411ProjectionDistanceSet(count) {
    const builders = [
      () => {
        const OA = s324Pick([5, 8, 12]);
        const AB = s324Pick([3, 4, 5]);
        const OC = s333Sqrt(OA * OA + AB * AB);
        const BC = s324Pick([4, 12, 15]);
        return s331QA(
          '設點 ' +
            s331M('O') +
            ' 在平面 ' +
            s331M('E') +
            ' 外，投影為 ' +
            s331M('A') +
            '；點 ' +
            s331M('C') +
            ' 在平面內且其投影路徑經 ' +
            s331M('B') +
            '。已知 ' +
            s331MJ('OA=', OA, ',\\ AB=', AB, ',\\ BC=', BC) +
            '，求 ' +
            s331M('OC') +
            ' 的表示式。',
          s331MJ('\\sqrt{', OA * OA + AB * AB + BC * BC, '}'),
          '空間距離可分解成互相垂直的三段，使用 ' + s331M('OC^2=OA^2+AB^2+BC^2') + '。'
        );
      },
      () => {
        const d1 = s324Pick([1, 2, 3, 4]);
        const d2 = s324Pick([6, 8, 10, 12]);
        const target = s333Sqrt(d1 * d1 + d2 * d2);
        return s331QA(
          '房間兩面牆與天花板兩兩垂直，一隻昆蟲在牆角附近移動，距兩面牆分別為 ' +
            d1 +
            '、' +
            d2 +
            '，且離天花板為 ' +
            d2 +
            '。求牠到牆角的直線距離。',
          s331MJ(s333Sqrt(d1 * d1 + 2 * d2 * d2)),
          '三個互相垂直的方向可用空間畢氏定理：' + s331M('d^2=x^2+y^2+z^2') + '。'
        );
      },
      () => {
        const a = s324Pick([3, 5, 7]);
        const b = s324Pick([4, 12, 24]);
        return s331QA(
          '兩個互相垂直的圓柱高度都是 ' + a + '，軸線間水平距離為 ' + b + '，求兩頂端點的最短距離模型應使用哪個公式？',
          s331MJ('\\sqrt{', a * a + b * b, '}'),
          '題目可化為一個垂直高度與一個水平距離構成的直角三角形。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS411SolidEdgeRelationsSet(count) {
    const builders = [
      () => {
        const a = randInt(2, 9);
        return s331QA(
          '正四面體邊長為 ' + s331M('a=' + a) + '，求其高。',
          s331MJ(s331Frac(a, 3), '\\sqrt{6}'),
          '正四面體高為 ' + s331M('\\frac{\\sqrt6}{3}a') + '，代入邊長即可。'
        );
      },
      () => {
        const a = randInt(2, 9);
        return s331QA(
          '正四面體邊長為 ' + s331M('a=' + a) + '，求兩條歪斜對稜的最短距離。',
          s331MJ(s331Frac(a, 2), '\\sqrt{2}'),
          '正四面體對稜距離為 ' + s331M('\\frac{\\sqrt2}{2}a') + '。'
        );
      },
      () => {
        const a = randInt(2, 8);
        return s331QA(
          '正四面體中，相鄰兩面所成二面角的餘弦值為何？邊長 ' + s331M('a=' + a) + ' 是否影響答案？',
          s331M('\\frac13') + '，不影響',
          '正四面體的二面角只由形狀決定，與邊長無關，其餘弦值為 ' + s331M('\\frac13') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS411RegularPolyhedronMeasureSet(count) {
    const builders = [
      () => {
        const a = randInt(2, 8);
        return s331QA(
          '邊長為 ' + s331M('a=' + a) + ' 的正四面體，求體積。',
          s331MJ(s331Frac(a * a * a, 12), '\\sqrt{2}'),
          '正四面體體積公式為 ' + s331M('V=\\frac{\\sqrt2}{12}a^3') + '。'
        );
      },
      () => {
        const a = randInt(2, 7);
        return s331QA(
          '邊長為 ' + s331M('a=' + a) + ' 的正八面體，求體積與正四面體體積的比值。',
          s331M('4:1'),
          '同邊長時，正八面體體積為 ' +
            s331M('\\frac{\\sqrt2}{3}a^3') +
            '，正四面體為 ' +
            s331M('\\frac{\\sqrt2}{12}a^3') +
            '，比值為 4。'
        );
      },
      () => {
        const a = randInt(2, 8);
        return s331QA(
          '一個底面邊長與側面稜長均為 ' + s331M('a=' + a) + ' 的正四角錐，求錐頂到底面的高。',
          s331MJ(s331Frac(a, 2), '\\sqrt{2}'),
          '底面中心到頂點的水平距離為 ' +
            s331M('\\frac{\\sqrt2}{2}a') +
            '，用直角三角形求高為 ' +
            s331M('\\frac{\\sqrt2}{2}a') +
            '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS411SpatialRelationsMixedSet(count) {
    return buildS223MixedSet(
      [buildS411SpatialRelationsSet, buildS411PlaneDeterminationSet, buildS411PolyhedronEdgeRelationsSet],
      count
    );
  }

  function buildS411DistanceMixedSet(count) {
    return buildS223MixedSet([buildS411ThreePerpendicularDistanceSet, buildS411ProjectionDistanceSet], count);
  }

  function buildS411RegularSolidMixedSet(count) {
    return buildS223MixedSet([buildS411SolidEdgeRelationsSet, buildS411RegularPolyhedronMeasureSet], count);
  }

  function s412Point(name, p) {
    return name + '(' + p[0] + ',' + p[1] + ',' + p[2] + ')';
  }

  function s412Vec3(x, y, z) {
    return '(' + x + ',' + y + ',' + z + ')';
  }

  function s412Len3(v) {
    return s333Sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }

  function s412DistSq(a, b) {
    return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2]);
  }

  function s412Dot3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function s412Cross3(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  function buildS412PointProjectionDistanceSet(count) {
    const builders = [
      () => {
        const p = [randInt(-8, 8) || 2, randInt(-8, 8) || -3, randInt(-8, 8) || 5];
        const target = s324Pick([
          ['x 軸', [p[0], 0, 0], '保留 x 坐標，其餘坐標變成 0。'],
          ['y 軸', [0, p[1], 0], '保留 y 坐標，其餘坐標變成 0。'],
          ['z 軸', [0, 0, p[2]], '保留 z 坐標，其餘坐標變成 0。'],
          ['xy 平面', [p[0], p[1], 0], '投影到 xy 平面時，z 坐標變成 0。'],
          ['yz 平面', [0, p[1], p[2]], '投影到 yz 平面時，x 坐標變成 0。'],
          ['xz 平面', [p[0], 0, p[2]], '投影到 xz 平面時，y 坐標變成 0。'],
        ]);
        return s331QA(
          '已知 ' + s331M(s412Point('P', p)) + '，求其在 ' + target[0] + ' 上的投影點坐標。',
          s331M(s412Point('P\\prime', target[1])),
          target[2]
        );
      },
      () => {
        const p = [randInt(-7, 7) || -1, randInt(-7, 7) || 4, randInt(-7, 7) || 6];
        const target = s324Pick([
          ['xy 平面', [p[0], p[1], -p[2]], '對稱於 xy 平面時，只有 z 坐標變號。'],
          ['yz 平面', [-p[0], p[1], p[2]], '對稱於 yz 平面時，只有 x 坐標變號。'],
          ['xz 平面', [p[0], -p[1], p[2]], '對稱於 xz 平面時，只有 y 坐標變號。'],
          ['原點', [-p[0], -p[1], -p[2]], '對稱於原點時，三個坐標都變號。'],
        ]);
        return s331QA(
          '已知 ' + s331M(s412Point('P', p)) + '，求其對 ' + target[0] + ' 的對稱點坐標。',
          s331M(s412Point('P\\prime', target[1])),
          target[2]
        );
      },
      () => {
        const p = [randInt(-8, 8) || 3, randInt(-8, 8) || 4, randInt(-8, 8) || 12];
        const target = s324Pick([
          ['x 軸', p[1] * p[1] + p[2] * p[2], '到 x 軸距離只看 y,z 兩個坐標。'],
          ['y 軸', p[0] * p[0] + p[2] * p[2], '到 y 軸距離只看 x,z 兩個坐標。'],
          ['z 軸', p[0] * p[0] + p[1] * p[1], '到 z 軸距離只看 x,y 兩個坐標。'],
          ['xy 平面', p[2] * p[2], '到 xy 平面距離為 |z|。'],
          ['yz 平面', p[0] * p[0], '到 yz 平面距離為 |x|。'],
          ['原點', p[0] * p[0] + p[1] * p[1] + p[2] * p[2], '到原點距離使用三維距離公式。'],
        ]);
        return s331QA(
          '已知 ' + s331M(s412Point('P', p)) + '，求其到 ' + target[0] + ' 的距離。',
          s331MJ(s333Sqrt(target[1])),
          target[2]
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412VectorOperationLengthSet(count) {
    const builders = [
      () => {
        const a = [randInt(-5, 5) || 3, randInt(-5, 5) || -1, randInt(-5, 5) || 2];
        const b = [randInt(-5, 5) || 1, randInt(-5, 5) || 2, randInt(-5, 5) || -1];
        const u = randInt(2, 4);
        const v = randInt(-4, -2);
        const ans = [u * a[0] + v * b[0], u * a[1] + v * b[1], u * a[2] + v * b[2]];
        return s331QA(
          '設 ' +
            s331MJ('a=', s412Vec3(a[0], a[1], a[2]), ',\\ b=', s412Vec3(b[0], b[1], b[2])) +
            '，求 ' +
            s331M(u + 'a' + v + 'b') +
            ' 的分量。',
          s331M(s412Vec3(ans[0], ans[1], ans[2])),
          '三維向量加減與二維相同，逐坐標計算。'
        );
      },
      () => {
        const A = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const d = s324Pick([
          [3, 4, 12],
          [5, 12, 0],
          [2, 3, 6],
          [1, 2, 2],
          [4, 4, 7],
        ]);
        const B = [A[0] + d[0], A[1] + d[1], A[2] + d[2]];
        return s331QA(
          '已知 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            '，求 ' +
            s331M('\\overrightarrow{AB}') +
            ' 與 ' +
            s331M('|AB|') +
            '。',
          s331MJ('\\overrightarrow{AB}=', s412Vec3(d[0], d[1], d[2]), ',\\ |AB|=', s412Len3(d)),
          '先用終點減起點得到向量，再用三維長度公式。'
        );
      },
      () => {
        const v = s324Pick([
          [2, -3, -6],
          [1, 2, 2],
          [3, 4, 12],
          [4, 4, 2],
        ]);
        const len = s412Len3(v);
        return s331QA(
          '求向量 ' + s331MJ('v=', s412Vec3(v[0], v[1], v[2])) + ' 的單位向量。',
          s331MJ('\\pm\\frac{1}{', len, '}', s412Vec3(v[0], v[1], v[2])),
          '單位向量為 ' + s331M('\\pm\\frac{v}{|v|}') + '；若只要同方向，取正號。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412SectionCentroidSet(count) {
    const builders = [
      () => {
        const A = [randInt(-5, 5), randInt(-5, 5), randInt(-5, 5)];
        const B = [A[0] + 2 * randInt(1, 5), A[1] + 2 * randInt(-4, 4), A[2] + 2 * randInt(-4, 4)];
        const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
        return s331QA(
          '已知 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            '，求線段 ' +
            s331M('AB') +
            ' 的中點坐標。',
          s331M(s412Point('M', mid)),
          '中點公式為三個坐標分別取平均。'
        );
      },
      () => {
        const A = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const B = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const m = randInt(2, 5);
        const n = randInt(1, 4);
        const px = s331Frac(n * A[0] + m * B[0], m + n);
        const py = s331Frac(n * A[1] + m * B[1], m + n);
        const pz = s331Frac(n * A[2] + m * B[2], m + n);
        return s331QA(
          '已知 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            '，點 ' +
            s331M('P') +
            ' 在 ' +
            s331M('AB') +
            ' 上且 ' +
            s331M('AP:PB=' + m + ':' + n) +
            '，求 ' +
            s331M('P') +
            '。',
          s331M('P(' + px + ',' + py + ',' + pz + ')'),
          '內分點公式逐坐標使用：' + s331M('P=\\frac{nA+mB}{m+n}') + '。'
        );
      },
      () => {
        const A = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const B = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const C = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        return s331QA(
          '已知 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            '、' +
            s331M(s412Point('C', C)) +
            '，求 ' +
            s331M('\\triangle ABC') +
            ' 的重心坐標。',
          s331M(
            'G(' +
              s331Frac(A[0] + B[0] + C[0], 3) +
              ',' +
              s331Frac(A[1] + B[1] + C[1], 3) +
              ',' +
              s331Frac(A[2] + B[2] + C[2], 3) +
              ')'
          ),
          '重心為三頂點坐標的平均。'
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const B = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const C = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1], A[2] + C[2] - B[2]];
        return s331QA(
          '若 ' +
            s331M('ABCD') +
            ' 為平行四邊形，已知 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            '、' +
            s331M(s412Point('C', C)) +
            '，求第四頂點 ' +
            s331M('D') +
            '。',
          s331M(s412Point('D', D)),
          '平行四邊形對角線中點相同，所以 ' + s331M('D=A+C-B') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412DirectionCosinesSet(count) {
    const builders = [
      () => {
        const v = s324Pick([
          [1, 2, 2],
          [2, -3, 6],
          [3, 4, 12],
          [2, 2, 1],
          [4, 4, 7],
        ]);
        const len = s412Len3(v);
        return s331QA(
          '求向量 ' + s331MJ('v=', s412Vec3(v[0], v[1], v[2])) + ' 的三個方向餘弦。',
          s331MJ(
            '\\left(',
            s333Quotient(v[0], len),
            ',',
            s333Quotient(v[1], len),
            ',',
            s333Quotient(v[2], len),
            '\\right)'
          ),
          '方向餘弦就是向量各坐標除以向量長度。'
        );
      },
      () => {
        const angle = s324Pick([
          [60, 45, 90],
          [45, 60, 90],
          [90, 45, 45],
        ]);
        return s331QA(
          '判斷 ' +
            s331M('(' + angle[0] + '^\\circ,' + angle[1] + '^\\circ,' + angle[2] + '^\\circ)') +
            ' 是否可能為空間向量的三個方向角。',
          '可能',
          '檢查 ' + s331M('\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1') + '。'
        );
      },
      () => {
        const len = randInt(2, 8);
        return s331QA(
          '若一向量與三坐標軸正向的夾角皆相等，且長度為 ' + len + '，求其坐標表示。',
          s331MJ(
            '\\pm\\left(\\frac{' + len + '}{\\sqrt3},\\frac{' + len + '}{\\sqrt3},\\frac{' + len + '}{\\sqrt3}\\right)'
          ),
          '三個方向餘弦平方和為 1 且相等，所以各為 ' + s331M('\\pm\\frac{1}{\\sqrt3}') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412CoordinateGeometrySet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const d = [randInt(1, 4), randInt(-3, 3) || 2, randInt(1, 4)];
        const B = [A[0] + d[0], A[1] + d[1], A[2] + d[2]];
        const t = randInt(2, 5);
        const C = [A[0] + t * d[0], A[1] + t * d[1], A[2] + t * d[2]];
        return s331QA(
          '已知空間中三點 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            '、' +
            s331M('C(x,y,' + C[2] + ')') +
            ' 三點共線，求 ' +
            s331M('x,y') +
            '。',
          s331MJ('x=', C[0], ',\\ y=', C[1]),
          '三點共線表示 ' + s331M('\\overrightarrow{AC}=t\\overrightarrow{AB}') + '，逐坐標比較。'
        );
      },
      () => {
        const p = [randInt(2, 7), randInt(2, 7), randInt(2, 7)];
        const dyz = s333Sqrt(p[1] * p[1] + p[2] * p[2]);
        const dxyz = s333Sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
        return s331QA(
          '若空間點 ' +
            s331M('P(a,b,c)') +
            ' 在第一卦限，且到 ' +
            s331M('yz') +
            ' 平面、' +
            s331M('x') +
            ' 軸、原點的距離分別為 ' +
            s331M(p[0] + ',' + dyz + ',' + dxyz) +
            '，求 ' +
            s331M('P') +
            '。',
          s331M(s412Point('P', p)),
          '第一卦限坐標為正；到 ' +
            s331M('yz') +
            ' 平面是 ' +
            s331M('a') +
            '，到 ' +
            s331M('x') +
            ' 軸是 ' +
            s331M('\\sqrt{b^2+c^2}') +
            '。'
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const B = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const x = randInt(-5, 5) || 2;
        const lhs = (x - A[0]) ** 2 + A[1] ** 2 + A[2] ** 2;
        const rhsRest = B[1] ** 2 + B[2] ** 2;
        const expr = lhs - rhsRest;
        return s331QA(
          '點 ' +
            s331M('P') +
            ' 在 ' +
            s331M('x') +
            ' 軸上，且 ' +
            s331M('P(' + x + ',0,0)') +
            ' 與 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            ' 等距離。請驗證此條件是否成立。',
          expr === (x - B[0]) ** 2 ? '成立' : '不成立',
          '設 ' + s331M('P=(t,0,0)') + '，比較 ' + s331M('PA^2') + ' 與 ' + s331M('PB^2') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412QuadraticExtremaSet(count) {
    const builders = [
      () => {
        const A = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const B = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const C = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const gx = s331Frac(A[0] + B[0] + C[0], 3);
        const gy = s331Frac(A[1] + B[1] + C[1], 3);
        const gz = s331Frac(A[2] + B[2] + C[2], 3);
        return s331QA(
          '設 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            '、' +
            s331M(s412Point('C', C)) +
            '，求點 ' +
            s331M('P') +
            ' 使 ' +
            s331M('PA^2+PB^2+PC^2') +
            ' 最小時的坐標。',
          s331M('P(' + gx + ',' + gy + ',' + gz + ')'),
          '平方距離和最小點為重心，也就是坐標平均。'
        );
      },
      () => {
        const p = [randInt(1, 5), randInt(-5, 5) || 2, randInt(-5, 5) || -3];
        const q = [randInt(-5, 5) || -2, randInt(1, 5), randInt(-5, 5) || 4];
        const y = s331Frac(p[1] + q[1], 2);
        return s331QA(
          '點 ' +
            s331M('P') +
            ' 在 ' +
            s331M('y') +
            ' 軸上，求使其到 ' +
            s331M(s412Point('A', p)) +
            ' 與 ' +
            s331M(s412Point('B', q)) +
            ' 的距離平方和最小的 ' +
            s331M('P') +
            '。',
          s331M('P(0,' + y + ',0)'),
          '設 ' + s331M('P=(0,t,0)') + '，平方和只含 ' + s331M('(t-y_A)^2+(t-y_B)^2') + '，最小在平均值。'
        );
      },
      () => {
        const n = [randInt(1, 5), randInt(-5, 5) || 3, randInt(1, 5)];
        const r = randInt(3, 9);
        return s331QA(
          '已知 ' +
            s331M('x^2+y^2+z^2=' + r * r) +
            '，求 ' +
            s331M(n[0] + 'x' + s334SignedTerm(n[1], 'y') + s334SignedTerm(n[2], 'z')) +
            ' 的最大值與最小值。',
          s331MJ(
            '\\max=',
            s333RadicalMultiple(r, s412Dot3(n, n)),
            ',\\ \\min=-',
            s333RadicalMultiple(r, s412Dot3(n, n))
          ),
          '用柯西不等式：' + s331M('|n\\cdot X|\\le |n||X|') + '。'
        );
      },
      () => {
        const a = randInt(1, 5);
        const b = randInt(-5, 5) || -2;
        const c = randInt(1, 5);
        const d = randInt(4, 18);
        return s331QA(
          '已知 ' +
            s331M(a + 'x' + s334SignedTerm(b, 'y') + s334SignedTerm(c, 'z') + '=' + d) +
            '，求 ' +
            s331M('x^2+y^2+z^2') +
            ' 的最小值。',
          s331MJ(s331Frac(d * d, a * a + b * b + c * c)),
          '原點到平面的距離平方就是最小值：' + s331M('\\frac{d^2}{a^2+b^2+c^2}') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412ReflectionPathSet(count) {
    const builders = [
      () => {
        const A = [randInt(-5, 5), randInt(-5, 5), randInt(1, 8)];
        const B = [randInt(-5, 5), randInt(-5, 5), randInt(1, 8)];
        const reflected = [A[0], A[1], -A[2]];
        return s331QA(
          '設 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            '，點 ' +
            s331M('P') +
            ' 在 ' +
            s331M('xy') +
            ' 平面上移動，求 ' +
            s331M('AP+PB') +
            ' 的最小值。',
          s331MJ(s333Sqrt(s412DistSq(reflected, B))),
          '把 ' +
            s331M('A') +
            ' 對 ' +
            s331M('xy') +
            ' 平面反射成 ' +
            s331M('A\\prime') +
            '，最短路徑為直線 ' +
            s331M('A\\prime B') +
            '。'
        );
      },
      () => {
        const box = [randInt(1, 5), randInt(2, 6), randInt(3, 7)];
        const a = s333Sqrt((box[0] + box[1]) ** 2 + box[2] ** 2);
        const b = s333Sqrt((box[0] + box[2]) ** 2 + box[1] ** 2);
        const c = s333Sqrt((box[1] + box[2]) ** 2 + box[0] ** 2);
        return s331QA(
          '長、寬、高分別為 ' + box.join('、') + ' 的長方體中，一隻昆蟲沿表面從一個頂點到相對頂點，求最短路徑長。',
          s331MJ('\\min\\{', a, ',', b, ',', c, '\\}'),
          '把相鄰兩個面展開成矩形，三種展開方式取最短。'
        );
      },
      () => {
        const P = [randInt(-4, 4), randInt(-4, 4), randInt(1, 6)];
        const R = [2 * P[0], 2 * P[1], -P[2]];
        return s331QA(
          '光線經過 ' +
            s331M(s412Point('P', P)) +
            ' 射向 ' +
            s331M('xy') +
            ' 平面上的原點，反射後通過點 ' +
            s331M('R') +
            '，且水平位移為原來的 2 倍，求 ' +
            s331M('R') +
            '。',
          s331M(s412Point('R', R)),
          '對 ' + s331M('xy') + ' 平面反射時，垂直方向坐標變號，水平坐標依題意放大。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412ProjectionAreaSet(count) {
    const builders = [
      () => {
        const A = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const B = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const C = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const area2 = Math.abs(s334Det(B[1] - A[1], C[1] - A[1], B[2] - A[2], C[2] - A[2]));
        return s331QA(
          '空間三點 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            '、' +
            s331M(s412Point('C', C)) +
            ' 投影到 ' +
            s331M('yz') +
            ' 平面後，求投影三角形面積。',
          s331MJ(s331Frac(area2, 2)),
          '投影到 ' + s331M('yz') + ' 平面時只保留 ' + s331M('(y,z)') + '，再用二維行列式面積。'
        );
      },
      () => {
        const u = [randInt(1, 5), randInt(-4, 4) || 2, randInt(-4, 4) || 3];
        const v = [randInt(-4, 4) || -1, randInt(1, 5), randInt(-4, 4) || 2];
        const cross = s412Cross3(u, v);
        return s331QA(
          '由向量 ' +
            s331MJ('u=', s412Vec3(u[0], u[1], u[2]), ',\\ v=', s412Vec3(v[0], v[1], v[2])) +
            ' 張成的平行四邊形，求其在 ' +
            s331M('xy') +
            ' 平面上的投影面積。',
          s331MJ(Math.abs(cross[2])),
          '投影到 ' + s331M('xy') + ' 平面的面積等於法向量的 ' + s331M('z') + ' 分量絕對值。'
        );
      },
      () => {
        const d = s324Pick([
          [3, 4, 12],
          [5, 12, 0],
          [2, 3, 6],
          [1, 2, 2],
          [4, 4, 7],
        ]);
        const lengths = [
          s333Sqrt(d[0] * d[0] + d[1] * d[1]),
          s333Sqrt(d[1] * d[1] + d[2] * d[2]),
          s333Sqrt(d[0] * d[0] + d[2] * d[2]),
        ];
        return s331QA(
          '已知線段在 ' +
            s331M('xy,yz,xz') +
            ' 三個坐標平面上的正射影長分別為 ' +
            s331M(lengths.join(',')) +
            '，求原線段長度。',
          s331MJ(s412Len3(d)),
          '三個平面投影長平方總和為 ' + s331M('2L^2') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }


  function buildS412SymmetricLineEquationSet(count) {
    // helper: render symmetric line equation (x-px)/vx=(y-py)/vy=(z-pz)/vz
    function s412LinePart(varName, p, d) {
      const shift = p === 0 ? varName : (p > 0 ? varName + '-' + p : varName + '+' + (-p));
      return d === 1 ? shift : ('\\dfrac{' + shift + '}{' + d + '}');
    }
    function s412SymLineTex(P, v) {
      return s412LinePart('x', P[0], v[0]) + '=' + s412LinePart('y', P[1], v[1]) + '=' + s412LinePart('z', P[2], v[2]);
    }
    const builders = [
      () => {
        const P = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [randInt(1, 4), s324Pick([-3, -2, -1, 1, 2, 3]), s324Pick([-3, -2, -1, 1, 2, 3])];
        return s331QA(
          '求過點 ' + s331M(s412Point('P', P)) + '、方向向量為 ' + s331M(s412Vec3(v[0], v[1], v[2])) + ' 的直線對稱式。',
          '\\(' + s412SymLineTex(P, v) + '\\)',
          '對稱式為 ' + s331M('\\dfrac{x-p_x}{a}=\\dfrac{y-p_y}{b}=\\dfrac{z-p_z}{c}') + '，代入點坐標與方向向量各分量。'
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const d = [randInt(1, 4), s324Pick([-3, -2, -1, 1, 2, 3]), s324Pick([-3, -2, -1, 1, 2, 3])];
        const B = [A[0] + d[0], A[1] + d[1], A[2] + d[2]];
        return s331QA(
          '求過兩點 ' + s331M(s412Point('A', A)) + ' 與 ' + s331M(s412Point('B', B)) + ' 的直線對稱式。',
          '\\(' + s412SymLineTex(A, d) + '\\)',
          '方向向量為 ' + s331M('\\overrightarrow{AB}=' + s412Vec3(d[0], d[1], d[2])) + '，再代入點 ' + s331M('A') + ' 套公式。'
        );
      },
      () => {
        const P = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const vPool = [[1,1,1],[1,1,-1],[1,-1,1],[-1,1,1]];
        const v = s324Pick(vPool);
        const t = randInt(2, 5);
        const Q = [P[0] + t * v[0], P[1] + t * v[1], P[2] + t * v[2]];
        return s331QA(
          '判斷點 ' + s331M(s412Point('Q', Q)) + ' 是否在直線 ' + s331M(s412SymLineTex(P, v)) + ' 上。',
          '是（代入 ' + s331M('t=' + t) + '）',
          '令各式等於 ' + s331M('t') + '，解得 ' + s331M('t') + ' 後代回驗算，三式值相同即在直線上。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412SolidCoordinateRestoreSet(count) {
    const builders = [
      () => {
        const B = [randInt(1, 6), randInt(-5, 5), randInt(-5, 5)];
        const H = [randInt(-5, 5), randInt(1, 6), randInt(-5, 5)];
        return s331QA(
          '一長方體的長寬高分別與坐標軸平行，已知相對頂點 ' +
            s331M(s412Point('B', B)) +
            ' 與 ' +
            s331M(s412Point('H', H)) +
            '，求其他頂點的一個可能坐標。',
          s331M('(' + B[0] + ',' + H[1] + ',' + B[2] + ')'),
          '軸平行長方體的頂點坐標由相對頂點的三個坐標互相搭配而成；此題答案不唯一，列出一個即可。'
        );
      },
      () => {
        const B = [randInt(1, 5), randInt(-3, 3), randInt(-3, 3)];
        const D = [randInt(-3, 3), randInt(1, 5), randInt(-3, 3)];
        const E = [randInt(-3, 3), randInt(-3, 3), randInt(1, 5)];
        const G = [B[0] + D[0] + E[0], B[1] + D[1] + E[1], B[2] + D[2] + E[2]];
        return s331QA(
          '平行六面體 ' +
            s331M('ABCD-EFGH') +
            ' 中，' +
            s331M('A(0,0,0)') +
            '、' +
            s331M(s412Point('B', B)) +
            '、' +
            s331M(s412Point('D', D)) +
            '、' +
            s331M(s412Point('E', E)) +
            '，求頂點 ' +
            s331M('G') +
            '。',
          s331M(s412Point('G', G)),
          '由同一頂點出發的三個稜向量相加：' + s331M('G=A+AB+AD+AE') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412AngleBisectorVectorSet(count) {
    const builders = [
      () => {
        const a = s324Pick([
          [2, 1, -3],
          [1, 2, 2],
          [3, 0, 4],
        ]);
        const b = s324Pick([
          [1, 0, 2],
          [2, -1, 2],
          [0, 3, 4],
        ]);
        return s331QA(
          '設 ' +
            s331MJ('a=', s412Vec3(a[0], a[1], a[2]), ',\\ b=', s412Vec3(b[0], b[1], b[2])) +
            '，寫出平分 ' +
            s331M('a,b') +
            ' 夾角的方向向量。',
          s331MJ(
            '\\frac{',
            s412Vec3(a[0], a[1], a[2]),
            '}{',
            s412Len3(a),
            '}+\\frac{',
            s412Vec3(b[0], b[1], b[2]),
            '}{',
            s412Len3(b),
            '}'
          ),
          '角平分方向為兩個單位方向向量相加。'
        );
      },
      () => {
        const v = s324Pick([
          [2, 3, -6],
          [1, 2, 2],
          [3, 4, 12],
        ]);
        return s331QA(
          '若 ' + s331MJ('v=', s412Vec3(v[0], v[1], v[2])) + '，求與 ' + s331M('v') + ' 同方向的單位向量。',
          s331MJ('\\frac{1}{', s412Len3(v), '}', s412Vec3(v[0], v[1], v[2])),
          '把方向向量除以自身長度即可單位化。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412CoordinateBasicMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS412PointProjectionDistanceSet,
        buildS412VectorOperationLengthSet,
        buildS412SectionCentroidSet,
        buildS412DirectionCosinesSet,
        buildS412CoordinateGeometrySet,
      ],
      count
    );
  }

  function buildS412ExtremaProjectionMixedSet(count) {
    return buildS223MixedSet(
      [buildS412QuadraticExtremaSet, buildS412ReflectionPathSet, buildS412ProjectionAreaSet],
      count
    );
  }

  function buildS412SolidAdvancedMixedSet(count) {
    return buildS223MixedSet([buildS412SolidCoordinateRestoreSet, buildS412AngleBisectorVectorSet], count);
  }

  function s413Sub3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  function s413Scale3(k, v) {
    return [k * v[0], k * v[1], k * v[2]];
  }

  function s413Add3(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  function s413Vec3Tex(v) {
    return s412Vec3(v[0], v[1], v[2]);
  }

  function buildS413InnerProductAngleSet(count) {
    const builders = [
      () => {
        const a = [randInt(-5, 5) || 1, randInt(-5, 5) || 1, randInt(-5, 5) || 2];
        const b = [randInt(-5, 5) || -1, randInt(-5, 5) || 2, randInt(-5, 5) || 1];
        const dot = s412Dot3(a, b);
        return s331QA(
          '設 ' +
            s331MJ('a=', s413Vec3Tex(a), ',\\ b=', s413Vec3Tex(b)) +
            '，求 ' +
            s331M('a\\cdot b') +
            ' 與夾角餘弦值。',
          s331MJ('a\\cdot b=', dot, ',\\ \\cos\\theta=', s333Quotient(dot, s333Sqrt(s412Dot3(a, a) * s412Dot3(b, b)))),
          '空間內積為三個對應坐標乘積相加，再除以兩向量長度乘積得到夾角餘弦。'
        );
      },
      () => {
        const A = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const u = [randInt(1, 4), randInt(-4, 4) || 2, randInt(-4, 4) || -1];
        const v = [randInt(-4, 4) || 3, randInt(1, 4), randInt(-4, 4) || 2];
        const B = s413Add3(A, u);
        const C = s413Add3(A, v);
        return s331QA(
          '已知 ' +
            s331M(s412Point('A', A)) +
            '、' +
            s331M(s412Point('B', B)) +
            '、' +
            s331M(s412Point('C', C)) +
            '，求 ' +
            s331M('\\overrightarrow{AB}\\cdot\\overrightarrow{AC}') +
            '。',
          s331MJ(s412Dot3(u, v)),
          '先求 ' + s331M('AB=B-A') + '、' + s331M('AC=C-A') + '，再做三維內積。'
        );
      },
      () => {
        const len = 2 * randInt(2, 8);
        return s331QA(
          '設 ' +
            s331MJ('a=', s413Vec3Tex([1, 0, 0]), ',\\ b=', s412Vec3('x', 'y', 'z')) +
            '，已知 ' +
            s331MJ('|b|=', len) +
            '，且 ' +
            s331M('a') +
            ' 與 ' +
            s331M('b') +
            ' 的夾角為 ' +
            s331M('120^\\circ') +
            '，求 ' +
            s331M('x') +
            '。',
          s331MJ('x=', -len / 2),
          '因為 ' +
            s331M('a') +
            ' 是 ' +
            s331M('x') +
            ' 軸正向單位向量，所以 ' +
            s331M('a\\cdot b=x=|b|\\cos120^\\circ') +
            '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413PerpendicularParallelSet(count) {
    const builders = [
      () => {
        const t = randInt(-5, 5) || 2;
        const p = randInt(-4, 4) || 2;
        const q = randInt(-4, 4) || 3;
        const a = [randInt(-3, 3) || 2, randInt(-3, 3) || -1, 1];
        const constant = -(a[0] * p + a[1] * q + t);
        const zText = constant >= 0 ? 't+' + constant : 't' + constant;
        return s331QA(
          '已知 ' + s331MJ('a=', s413Vec3Tex(a), ',\\ b=', s412Vec3(p, q, zText)) + ' 垂直，求 ' + s331M('t') + '。',
          s331MJ('t=', t),
          '垂直表示 ' + s331M('a\\cdot b=0') + '，列一次方程式求參數。'
        );
      },
      () => {
        const k = randInt(-4, 4) || 2;
        const u = [1, -2, 3];
        const v = [2, 3, 6];
        const combo = s413Add3(s413Scale3(k, u), v);
        return s331QA(
          '若 ' +
            s331MJ('u=', s413Vec3Tex(u), ',\\ v=', s413Vec3Tex(v)) +
            '，且 ' +
            s331M('ku+v') +
            ' 與 ' +
            s331M('u') +
            ' 垂直，求 ' +
            s331M('k') +
            '。',
          s331MJ('k=', s331Frac(-s412Dot3(v, u), s412Dot3(u, u))),
          '列 ' + s331M('(ku+v)\\cdot u=0') + '，即 ' + s331M('k|u|^2+v\\cdot u=0') + '。'
        );
      },
      () => {
        const base = [randInt(1, 4), randInt(-4, 4) || 2, randInt(-4, 4) || -1];
        const scale = randInt(2, 5);
        const b = s413Scale3(scale, base);
        return s331QA(
          '設 ' +
            s331MJ('a=', s413Vec3Tex(base)) +
            '，且 ' +
            s331M('b') +
            ' 與 ' +
            s331M('a') +
            ' 平行、' +
            s331MJ('|b|=', scale, '|a|') +
            '，求一個可能的 ' +
            s331M('b') +
            '。',
          s331M(s413Vec3Tex(b)),
          '平行向量可表示成純量倍數；此題取同方向 ' + scale + ' 倍。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413LengthCombinationSet(count) {
    const builders = [
      () => {
        const lenA = randInt(2, 6);
        const lenB = randInt(2, 6);
        const dot = randInt(-lenA * lenB + 1, lenA * lenB - 1);
        const p = randInt(2, 4);
        const q = randInt(2, 4);
        const value = p * p * lenA * lenA - 2 * p * q * dot + q * q * lenB * lenB;
        return s331QA(
          '已知 ' +
            s331MJ('|a|=', lenA, ',\\ |b|=', lenB, ',\\ a\\cdot b=', dot) +
            '，求 ' +
            s331M('|' + p + 'a-' + q + 'b|') +
            '。',
          s331MJ(s333Sqrt(value)),
          '利用 ' + s331M('|pa-qb|^2=p^2|a|^2-2pq(a\\cdot b)+q^2|b|^2') + '。'
        );
      },
      () => {
        const sum = randInt(6, 12);
        const diff = randInt(2, 5);
        const dot = s331Frac(sum * sum - diff * diff, 4);
        return s331QA(
          '已知空間向量 ' +
            s331M('a,b') +
            ' 滿足 ' +
            s331MJ('|a+b|=', sum, ',\\ |a-b|=', diff) +
            '，求 ' +
            s331M('a\\cdot b') +
            '。',
          s331MJ(dot),
          '由 ' + s331M('|a+b|^2-|a-b|^2=4a\\cdot b') + '。'
        );
      },
      () => {
        const a = [randInt(-3, 3) || 1, randInt(-3, 3) || -1, randInt(-3, 3) || 2];
        const lenB = randInt(2, 7);
        const dotMax = lenB * s412Len3(a);
        return s331QA(
          '設 ' +
            s331MJ('a=', s413Vec3Tex(a)) +
            '，若 ' +
            s331MJ('|b|=', lenB) +
            '，求 ' +
            s331M('a\\cdot b') +
            ' 的最大值。',
          s331MJ(lenB, '\\cdot', s412Len3(a)),
          '由柯西不等式，內積最大發生在 ' + s331M('b') + ' 與 ' + s331M('a') + ' 同方向。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413ProjectionVectorSet(count) {
    const builders = [
      () => {
        const a = [randInt(-5, 5) || 2, randInt(-5, 5) || 1, randInt(-5, 5) || 3];
        const b = s324Pick([
          [1, 2, 2],
          [2, -1, 2],
          [3, 0, 4],
          [2, 2, 1],
        ]);
        const dot = s412Dot3(a, b);
        const lenSq = s412Dot3(b, b);
        return s331QA(
          '求 ' + s331MJ('a=', s413Vec3Tex(a)) + ' 在 ' + s331MJ('b=', s413Vec3Tex(b)) + ' 上的正射影向量與正射影長。',
          s331MJ(
            '\\operatorname{proj}_b a=',
            s412Vec3(s331Frac(dot * b[0], lenSq), s331Frac(dot * b[1], lenSq), s331Frac(dot * b[2], lenSq)),
            ',\\ \\text{正射影長}=',
            s333Quotient(Math.abs(dot), s412Len3(b))
          ),
          '正射影向量為 ' + s331M('\\frac{a\\cdot b}{|b|^2}b') + '，正射影長取非負。'
        );
      },
      () => {
        const u = s324Pick([
          [1, 2, 3],
          [2, 1, 2],
          [1, -2, 2],
        ]);
        const parallel = s413Scale3(randInt(2, 5), u);
        const perp = s324Pick([
          [2, -2, 1],
          [1, 0, -1],
          [3, 1, -2],
        ]);
        const v = s413Add3(parallel, perp);
        return s331QA(
          '將 ' +
            s331MJ('v=', s413Vec3Tex(v)) +
            ' 分解為平行於 ' +
            s331MJ('u=', s413Vec3Tex(u)) +
            ' 與垂直於 ' +
            s331M('u') +
            ' 的兩個分量。',
          s331M('\\operatorname{proj}_u v\\text{ 與 }v-\\operatorname{proj}_u v'),
          '此類題統一用正射影公式分解；題目數據每次替換。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413PlaneNormalProjectionSet(count) {
    const builders = [
      () => {
        const P = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const n = [randInt(1, 4), randInt(-4, 4) || 2, randInt(1, 4)];
        const c = randInt(-8, 8);
        const value = s412Dot3(n, P) + c;
        const lenSq = s412Dot3(n, n);
        const H = [
          s331Frac(P[0] * lenSq - value * n[0], lenSq),
          s331Frac(P[1] * lenSq - value * n[1], lenSq),
          s331Frac(P[2] * lenSq - value * n[2], lenSq),
        ];
        return s331QA(
          '求點 ' +
            s331M(s412Point('P', P)) +
            ' 在平面 ' +
            s331M(n[0] + 'x' + s334SignedTerm(n[1], 'y') + s334SignedTerm(n[2], 'z') + (c >= 0 ? '+' + c : c) + '=0') +
            ' 上的正射影點。',
          s331M('H(' + H.join(',') + ')'),
          '令法向量為 ' + s331M('n') + '，垂足公式為 ' + s331M('H=P-\\frac{n\\cdot P+c}{|n|^2}n') + '。'
        );
      },
      () => {
        const P = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const n = [randInt(1, 4), randInt(-4, 4) || 2, randInt(1, 4)];
        const c = randInt(-6, 6);
        const value = Math.abs(s412Dot3(n, P) + c);
        return s331QA(
          '求點 ' +
            s331M(s412Point('P', P)) +
            ' 到平面 ' +
            s331M(n[0] + 'x' + s334SignedTerm(n[1], 'y') + s334SignedTerm(n[2], 'z') + (c >= 0 ? '+' + c : c) + '=0') +
            ' 的距離。',
          s331MJ(s333Quotient(value, s412Len3(n))),
          '點到平面距離是點到法向量方向的正射影長。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413AngleBisectorSet(count) {
    const builders = [
      () => {
        const a = s324Pick([
          [2, 1, 2],
          [1, 2, 2],
          [2, -1, 2],
        ]);
        const b = s324Pick([
          [1, 2, 2],
          [2, 1, -2],
          [0, 3, 4],
        ]);
        return s331QA(
          '已知 ' +
            s331MJ('a=', s413Vec3Tex(a), ',\\ b=', s413Vec3Tex(b)) +
            '，寫出平分 ' +
            s331M('a,b') +
            ' 夾角的方向向量。',
          s331MJ('\\frac{a}{|a|}+\\frac{b}{|b|}'),
          '角平分方向為兩個單位方向向量的和；若需坐標，再分別單位化後相加。'
        );
      },
      () => {
        const u = [6, -3, 6];
        const v = [1, 2, 2];
        return s331QA(
          '設 ' +
            s331MJ('u=', s413Vec3Tex(u), ',\\ v=', s413Vec3Tex(v)) +
            '，若向量 ' +
            s331M('w=u+tv') +
            ' 平分 ' +
            s331M('u,v') +
            ' 的夾角，求 ' +
            s331M('t') +
            '。',
          s331MJ('t=3'),
          '先算角平分方向 ' +
            s331M('\\frac{u}{|u|}+\\frac{v}{|v|}=(1,\\frac13,\\frac43)') +
            '，再與 ' +
            s331M('u+tv=(6+t,-3+2t,6+2t)') +
            ' 比例比較。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413CauchyExtremaSet(count) {
    const builders = [
      () => {
        const n = [randInt(1, 5), randInt(-5, 5) || -2, randInt(1, 5)];
        const d = randInt(4, 16);
        return s331QA(
          '已知 ' +
            s331M(n[0] + 'x' + s334SignedTerm(n[1], 'y') + s334SignedTerm(n[2], 'z') + '=' + d) +
            '，求 ' +
            s331M('x^2+y^2+z^2') +
            ' 的最小值。',
          s331MJ(s331Frac(d * d, s412Dot3(n, n))),
          '柯西不等式或點到平面距離可得最小值 ' + s331M('\\frac{d^2}{|n|^2}') + '。'
        );
      },
      () => {
        const r = randInt(2, 8);
        const n = [randInt(1, 5), randInt(-5, 5) || 4, randInt(1, 5)];
        return s331QA(
          '已知 ' +
            s331M('x^2+y^2+z^2=' + r * r) +
            '，求 ' +
            s331M(n[0] + 'x' + s334SignedTerm(n[1], 'y') + s334SignedTerm(n[2], 'z')) +
            ' 的最大值與最小值。',
          s331MJ(
            '\\max=',
            s333RadicalMultiple(r, s412Dot3(n, n)),
            ',\\ \\min=-',
            s333RadicalMultiple(r, s412Dot3(n, n))
          ),
          '由 ' + s331M('|n\\cdot X|\\le |n||X|') + '。'
        );
      },
      () => {
        const p = randInt(1, 5);
        const q = randInt(1, 5);
        const r = randInt(1, 5);
        return s331QA(
          '已知正數 ' +
            s331M('x,y,z') +
            ' 滿足 ' +
            s331M('x+y+z=9') +
            '，求 ' +
            s331M('\\frac{' + p + '}{x}+\\frac{' + q + '}{y}+\\frac{' + r + '}{z}') +
            ' 的最小值。',
          s331MJ('\\frac{(\\sqrt{' + p + '}+\\sqrt{' + q + '}+\\sqrt{' + r + '})^2}{9}'),
          '使用柯西不等式的分式型：' + s331M('\\sum\\frac{a_i}{x_i}\\ge\\frac{(\\sum\\sqrt{a_i})^2}{\\sum x_i}') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413TriangleAreaSet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const u = [randInt(1, 5), randInt(-4, 4) || 2, randInt(-4, 4) || 1];
        const v = [randInt(-4, 4) || -1, randInt(1, 5), randInt(-4, 4) || 3];
        const cross = s412Cross3(u, v);
        const rad = s412Dot3(cross, cross);
        return s331QA(
          '已知 ' +
            s331M(s412Point('A', A)) +
            '，且 ' +
            s331MJ('\\overrightarrow{AB}=', s413Vec3Tex(u), ',\\ \\overrightarrow{AC}=', s413Vec3Tex(v)) +
            '，求 ' +
            s331M('\\triangle ABC') +
            ' 面積。',
          s331MJ('\\frac{', s333Sqrt(rad), '}{2}'),
          '三角形面積為 ' + s331M('\\frac12|AB\\times AC|') + '，也可用內積公式。'
        );
      },
      () => {
        const lenA = randInt(2, 7);
        const lenB = randInt(2, 7);
        const dot = randInt(-lenA * lenB + 1, lenA * lenB - 1);
        const rad = lenA * lenA * lenB * lenB - dot * dot;
        return s331QA(
          '已知 ' +
            s331MJ('|AB|=', lenA, ',\\ |AC|=', lenB, ',\\ \\overrightarrow{AB}\\cdot\\overrightarrow{AC}=', dot) +
            '，求 ' +
            s331M('\\triangle ABC') +
            ' 面積。',
          s331MJ('\\frac{', s333Sqrt(rad), '}{2}'),
          '用 ' + s331M('K=\\frac12\\sqrt{|AB|^2|AC|^2-(AB\\cdot AC)^2}') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }


  function buildS413AMGMExtremaSet(count) {
    const builders = [
      () => {
        // AM-GM: x+y+z=3n, x,y,z>0, maximize xyz
        const n = randInt(1, 4);
        const S = 3 * n;
        const maxXyz = n * n * n;
        return s331QA(
          '正數 ' + s331M('x,y,z') + ' 滿足 ' + s331M('x+y+z=' + S) + '，求 ' + s331M('xyz') + ' 的最大值。',
          s331MJ(maxXyz),
          '由 AM-GM：' + s331M('\\dfrac{x+y+z}{3}\\ge\\sqrt[3]{xyz}') + '，等號在 ' + s331M('x=y=z=' + n) + ' 時成立，最大值 ' + s331M(maxXyz + '') + '。'
        );
      },
      () => {
        // Cauchy: x+y+z=S, x,y,z>0, minimize x^2+y^2+z^2
        const k = randInt(1, 4);
        const S = 3 * k;
        const minSq = 3 * k * k;
        return s331QA(
          '正數 ' + s331M('x,y,z') + ' 滿足 ' + s331M('x+y+z=' + S) + '，求 ' + s331M('x^2+y^2+z^2') + ' 的最小值。',
          s331MJ(minSq),
          '由柯西：' + s331M('(x^2+y^2+z^2)\\cdot3\\ge(x+y+z)^2=' + (S*S)) + '，等號在 ' + s331M('x=y=z=' + k) + ' 時成立，最小值 ' + s331M(minSq + '') + '。'
        );
      },
      () => {
        // Sphere to plane: max distance from (x,y,z) on x^2+y^2+z^2=rSq to plane
        const casePool = [
          { rSq: 25, r: 5, a: 1, b: 2, c: 2, d: 6, nLen: 3, cDist: 2, maxDist: 7 },
          { rSq: 16, r: 4, a: 2, b: 1, c: 2, d: 9, nLen: 3, cDist: 3, maxDist: 7 },
          { rSq:  9, r: 3, a: 2, b: 2, c: 1, d: 3, nLen: 3, cDist: 1, maxDist: 4 },
          { rSq: 25, r: 5, a: 1, b: 0, c: 0, d: 3, nLen: 1, cDist: 3, maxDist: 8 },
          { rSq: 36, r: 6, a: 0, b: 1, c: 0, d: 4, nLen: 1, cDist: 4, maxDist: 10 },
          { rSq: 49, r: 7, a: 0, b: 0, c: 1, d: 5, nLen: 1, cDist: 5, maxDist: 12 },
        ];
        const cc = s324Pick(casePool);
        const terms = [];
        if (cc.a !== 0) terms.push(cc.a === 1 ? 'x' : cc.a + 'x');
        if (cc.b !== 0) terms.push((cc.b > 0 && terms.length > 0 ? '+' : '') + (cc.b === 1 ? 'y' : cc.b + 'y'));
        if (cc.c !== 0) terms.push((cc.c > 0 && terms.length > 0 ? '+' : '') + (cc.c === 1 ? 'z' : cc.c + 'z'));
        const planeStr = terms.join('') + '=' + cc.d;
        return s331QA(
          '已知 ' + s331M('x^2+y^2+z^2=' + cc.rSq) + '，求點 ' + s331M('(x,y,z)') + ' 到平面 ' + s331M(planeStr) + ' 的最大距離。',
          s331MJ(cc.maxDist),
          '球心到平面距離 ' + s331M('\\dfrac{' + cc.d + '}{' + cc.nLen + '}=' + cc.cDist) + '，球半徑 ' + s331M(cc.r + '') + '，最大距離 ' + s331M('=' + cc.cDist + '+' + cc.r + '=' + cc.maxDist) + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413InnerProductMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS413InnerProductAngleSet,
        buildS413PerpendicularParallelSet,
        buildS413LengthCombinationSet,
        buildS413TriangleAreaSet,
      ],
      count
    );
  }

  function buildS413ProjectionPlaneMixedSet(count) {
    return buildS223MixedSet(
      [buildS413ProjectionVectorSet, buildS413PlaneNormalProjectionSet, buildS413AngleBisectorSet],
      count
    );
  }

  function buildS413CauchyExtremaMixedSet(count) {
    return buildS223MixedSet(
      [buildS413CauchyExtremaSet, buildS413TriangleAreaSet, buildS413LengthCombinationSet],
      count
    );
  }

  function s414Cross(a, b) {
    return s412Cross3(a, b);
  }

  function s414Det3(a, b, c) {
    return s412Dot3(a, s414Cross(b, c));
  }

  function s414AbsDet3(a, b, c) {
    return Math.abs(s414Det3(a, b, c));
  }

  function s414Matrix3Tex(rows) {
    return '\\begin{vmatrix}' + rows.map((row) => row.join('&')).join('\\\\') + '\\end{vmatrix}';
  }

  function buildS414CrossBasicNormalSet(count) {
    const builders = [
      () => {
        const a = [randInt(-3, 4), randInt(-4, 4), randInt(-3, 4)];
        const b = [randInt(-3, 4), randInt(-4, 4), randInt(-3, 4)];
        const cross = s414Cross(a, b);
        return s331QA(
          `設向量 \\(a=${s412Vec3(a[0], a[1], a[2])}\\)、\\(b=${s412Vec3(b[0], b[1], b[2])}\\)，求 \\(a\\times b\\)。`,
          s412Vec3(cross[0], cross[1], cross[2]),
          `方法：外積照 \\((a_2b_3-a_3b_2,\\ a_3b_1-a_1b_3,\\ a_1b_2-a_2b_1)\\) 逐項計算。`
        );
      },
      () => {
        const u = [randInt(1, 4), randInt(-3, 3), randInt(1, 4)];
        const v = [randInt(-3, 3), randInt(1, 4), randInt(-3, 3)];
        const n = s414Cross(u, v);
        const len = s412Len3(n);
        return s331QA(
          `已知 \\(u=${s412Vec3(u[0], u[1], u[2])}\\)、\\(v=${s412Vec3(v[0], v[1], v[2])}\\)，求同時垂直於 \\(u,v\\) 的一個單位向量。`,
          `\\(\\pm \\dfrac{${s412Vec3(n[0], n[1], n[2])}}{${len}}\\)`,
          `方法：先算 \\(u\\times v\\) 得到公垂向量，再除以它的長度。`
        );
      },
      () => {
        const k = randInt(-4, 4);
        const a = [1, k, 2];
        const b = [2, 1, -1];
        const cross = s414Cross(a, b);
        return s331QA(
          `設 \\(a=(1,k,2)\\)、\\(b=(2,1,-1)\\)。若 \\(a\\times b\\) 的第一個分量為 \\(${cross[0]}\\)，求 \\(k\\)。`,
          `\\(k=${k}\\)`,
          `方法：第一個分量為 \\(k\\cdot(-1)-2\\cdot1=-k-2\\)，令它等於題目給定值。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414CrossAreaDistanceSet(count) {
    const builders = [
      () => {
        const A = [randInt(-2, 3), randInt(-2, 3), randInt(-2, 3)];
        const AB = [randInt(1, 5), randInt(-3, 3), randInt(-2, 4)];
        const AC = [randInt(-3, 3), randInt(1, 5), randInt(-2, 4)];
        const B = s413Add3(A, AB);
        const C = s413Add3(A, AC);
        const area2 = s412Len3(s414Cross(AB, AC));
        return s331QA(
          `已知空間三點 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)、\\(${s412Point('C', C)}\\)，求 \\(\\triangle ABC\\) 的面積。`,
          `\\(\\dfrac{${area2}}{2}\\)`,
          `方法：\\(\\triangle ABC\\) 面積為 \\(\\frac12|\\overrightarrow{AB}\\times\\overrightarrow{AC}|\\)。`
        );
      },
      () => {
        const a = [randInt(1, 5), randInt(-3, 3), randInt(-2, 4)];
        const b = [randInt(-3, 3), randInt(1, 5), randInt(-2, 4)];
        const area = s412Len3(s414Cross(a, b));
        return s331QA(
          `向量 \\(a=${s412Vec3(a[0], a[1], a[2])}\\)、\\(b=${s412Vec3(b[0], b[1], b[2])}\\) 張成一個平行四邊形，求其面積。`,
          `\\(${area}\\)`,
          `方法：平行四邊形面積就是 \\(|a\\times b|\\)。`
        );
      },
      () => {
        const Q = [randInt(-2, 2), randInt(-2, 2), randInt(-2, 2)];
        const d = [randInt(1, 4), randInt(-3, 3), randInt(-2, 3)];
        const h = randInt(1, 4);
        const perp = s414Cross(d, [0, 0, 1]);
        const P = s413Add3(Q, s413Scale3(h, perp));
        const pq = s413Sub3(P, Q);
        const dist = `\\dfrac{${s412Len3(s414Cross(pq, d))}}{${s412Len3(d)}}`;
        return s331QA(
          `空間中一點 \\(${s412Point('P', P)}\\)，直線 \\(L\\) 通過 \\(${s412Point('Q', Q)}\\) 且方向向量為 \\(${s412Vec3(d[0], d[1], d[2])}\\)，求點 \\(P\\) 到直線 \\(L\\) 的距離。`,
          `\\(${dist}\\)`,
          `方法：點到直線距離為 \\(\\dfrac{|\\overrightarrow{QP}\\times d|}{|d|}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414CrossLengthIdentitySet(count) {
    const builders = [
      () => {
        const la = randInt(2, 7);
        const lb = randInt(3, 8);
        const dot = randInt(-la * lb + 1, la * lb - 1);
        const crossSq = la * la * lb * lb - dot * dot;
        return s331QA(
          `已知 \\(|a|=${la}\\)、\\(|b|=${lb}\\)、\\(a\\cdot b=${dot}\\)，求 \\(|a\\times b|\\)。`,
          `\\(${s333Sqrt(crossSq)}\\)`,
          `方法：使用 \\(|a\\times b|^2=|a|^2|b|^2-(a\\cdot b)^2\\)。`
        );
      },
      () => {
        const la = randInt(2, 6);
        const lb = randInt(3, 8);
        const sinNum = s324Pick([1, 2]);
        const sinDen = s324Pick([2, 3]);
        const area = s333Quotient(la * lb * sinNum, sinDen);
        return s331QA(
          `兩向量 \\(a,b\\) 的夾角 \\(\\theta\\) 滿足 \\(\\sin\\theta=${s331Frac(sinNum, sinDen)}\\)，且 \\(|a|=${la}\\)、\\(|b|=${lb}\\)。求 \\(a,b\\) 張成的平行四邊形面積。`,
          `\\(${area}\\)`,
          `方法：面積為 \\(|a||b|\\sin\\theta=|a\\times b|\\)。`
        );
      },
      () => {
        const a = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const b = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const crossLen = s412Len3(s414Cross(a, b));
        const dot = s412Dot3(a, b);
        return s331QA(
          `設 \\(a=${s412Vec3(a[0], a[1], a[2])}\\)、\\(b=${s412Vec3(b[0], b[1], b[2])}\\)。分別求 \\(|a\\times b|\\) 與 \\(a\\cdot b\\)，並檢查平方和關係。`,
          `\\(|a\\times b|=${crossLen}\\)，\\(a\\cdot b=${dot}\\)`,
          `方法：同時計算外積與內積，可驗證 \\(|a\\times b|^2+(a\\cdot b)^2=|a|^2|b|^2\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414TripleVolumeSet(count) {
    const builders = [
      () => {
        const a = [randInt(1, 4), randInt(-2, 3), randInt(-2, 3)];
        const b = [randInt(-2, 3), randInt(1, 4), randInt(-2, 3)];
        const c = [randInt(-2, 3), randInt(-2, 3), randInt(1, 4)];
        const volume = s414AbsDet3(a, b, c);
        return s331QA(
          `求向量 \\(a=${s412Vec3(a[0], a[1], a[2])}\\)、\\(b=${s412Vec3(b[0], b[1], b[2])}\\)、\\(c=${s412Vec3(c[0], c[1], c[2])}\\) 張成的平行六面體體積。`,
          `\\(${volume}\\)`,
          `方法：平行六面體體積為 \\(|\\det(a,b,c)|=|a\\cdot(b\\times c)|\\)。`
        );
      },
      () => {
        const A = [randInt(-2, 2), randInt(-2, 2), randInt(-2, 2)];
        const AB = [randInt(1, 4), randInt(-2, 3), randInt(-2, 3)];
        const AC = [randInt(-2, 3), randInt(1, 4), randInt(-2, 3)];
        const AD = [randInt(-2, 3), randInt(-2, 3), randInt(1, 4)];
        const B = s413Add3(A, AB);
        const C = s413Add3(A, AC);
        const D = s413Add3(A, AD);
        const det = s414AbsDet3(AB, AC, AD);
        return s331QA(
          `已知四面體頂點 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)、\\(${s412Point('C', C)}\\)、\\(${s412Point('D', D)}\\)，求其體積。`,
          `\\(${s333Quotient(det, 6)}\\)`,
          `方法：四面體體積為 \\(\\frac16|\\det(\\overrightarrow{AB},\\overrightarrow{AC},\\overrightarrow{AD})|\\)。`
        );
      },
      () => {
        const base = randInt(3, 12);
        const height = randInt(2, 9);
        const tetra = base * height;
        return s331QA(
          `某四面體以 \\(\\triangle ABC\\) 為底，底面積為 \\(${base}\\)，點 \\(D\\) 到平面 \\(ABC\\) 的距離為 \\(${height}\\)。求四面體 \\(ABCD\\) 的體積。`,
          `\\(${s333Quotient(tetra, 3)}\\)`,
          `方法：四面體體積為 \\(\\frac13\\times\\text{底面積}\\times\\text{高}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414CoplanarCollinearSet(count) {
    const builders = [
      () => {
        const A = [1, 2, 3];
        const u = [randInt(1, 3), randInt(-2, 2), randInt(1, 3)];
        const v = [randInt(-2, 2), randInt(1, 3), randInt(-2, 3)];
        const B = s413Add3(A, u);
        const C = s413Add3(A, v);
        const p = randInt(1, 3);
        const q = randInt(-2, 3);
        const D = s413Add3(A, s413Add3(s413Scale3(p, u), s413Scale3(q, v)));
        return s331QA(
          `判斷 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)、\\(${s412Point('C', C)}\\)、\\(${s412Point('D', D)}\\) 是否共面。`,
          `共面`,
          `方法：若 \\(\\det(\\overrightarrow{AB},\\overrightarrow{AC},\\overrightarrow{AD})=0\\)，四點共面。`
        );
      },
      () => {
        const A = [randInt(-2, 2), randInt(-2, 2), randInt(-2, 2)];
        const d = [randInt(1, 3), randInt(-2, 3), randInt(1, 3)];
        const m = randInt(2, 4);
        const B = s413Add3(A, d);
        const C = s413Add3(A, s413Scale3(m, d));
        return s331QA(
          `判斷 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)、\\(${s412Point('C', C)}\\) 是否共線。`,
          `共線`,
          `方法：若 \\(\\overrightarrow{AB}\\times\\overrightarrow{AC}=0\\)，三點共線。`
        );
      },
      () => {
        const A = [1, 2, 3];
        const u = [2, -1, 1];
        const v = [-1, 2, 2];
        const p = randInt(1, 4);
        const q = randInt(-2, 3);
        const D = s413Add3(A, s413Add3(s413Scale3(p, u), s413Scale3(q, v)));
        return s331QA(
          `已知 \\(A(1,2,3)\\)、\\(B(3,1,4)\\)、\\(C(0,4,5)\\)。若 \\(D(${D[0]},${D[1]},t)\\) 與 \\(A,B,C\\) 共面，求 \\(t\\)。`,
          `\\(t=${D[2]}\\)`,
          `方法：令 \\(\\det(\\overrightarrow{AB},\\overrightarrow{AC},\\overrightarrow{AD})=0\\)，解出未知座標。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414ParameterInverseSet(count) {
    const builders = [
      () => {
        const k = randInt(-3, 5);
        const A = [-1, -2, -3];
        const B = [5, -2, 3];
        const C = [1, 0, k];
        const area = `\\dfrac{${s412Len3(s414Cross(s413Sub3(B, A), s413Sub3(C, A)))}}{2}`;
        return s331QA(
          `已知 \\(\\triangle ABC\\) 的頂點為 \\(A(-1,-2,-3)\\)、\\(B(5,-2,3)\\)、\\(C(1,0,k)\\)，若本次 \\(k=${k}\\)，求三角形面積。`,
          `\\(${area}\\)`,
          `方法：這類逆算題仍先用 \\(\\frac12|\\overrightarrow{AB}\\times\\overrightarrow{AC}|\\)，再依題意代入或反解參數。`
        );
      },
      () => {
        const k = randInt(-3, 4);
        const a = [2, 1, -1];
        const b = [2, k, -1];
        const c = [-1, 1, 3];
        const volume = s414AbsDet3(a, b, c);
        return s331QA(
          `已知 \\(a=(2,1,-1)\\)、\\(b=(2,k,-1)\\)、\\(c=(-1,1,3)\\)。若本次 \\(k=${k}\\)，求三向量張成的平行六面體體積。`,
          `\\(${volume}\\)`,
          `方法：體積由 \\(|\\det(a,b,c)|\\) 決定；若題目反給體積，可把行列式寫成含 \\(k\\) 的式子再解。`
        );
      },
      () => {
        const u = [2, 1, -1];
        const v = [1, 3, 3];
        const p = randInt(-4, 4);
        const q = randInt(-4, 4);
        const a = [-6, p, q];
        const target = s414Cross(u, v);
        return s331QA(
          `設 \\(u=(2,1,-1)\\)、\\(v=(1,3,3)\\)。若 \\(a=(-6,p,q)\\) 同時垂直於 \\(u,v\\)，判斷 \\((p,q)=(${p},${q})\\) 是否可行。`,
          s412Dot3(a, u) === 0 && s412Dot3(a, v) === 0
            ? `可行`
            : `不可行；公垂方向應與 \\(${s412Vec3(target[0], target[1], target[2])}\\) 平行`,
          `方法：同時垂直可用兩個內積為 0，或直接比較是否平行於 \\(u\\times v\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414DeterminantPropertiesSet(count) {
    const builders = [
      () => {
        const det = randInt(2, 8);
        const m = randInt(2, 4);
        const n = randInt(-3, 3);
        const result = m * det;
        return s331QA(
          `已知 \\(\\det(a,b,c)=${det}\\)，求 \\(\\det(${m}a${s334SignedTerm(n, 'b')}, b, c)\\)。`,
          `\\(${result}\\)`,
          `方法：第一欄的 \\(${m}a\\) 讓行列式乘以 \\(${m}\\)，加上 \\(${n}b\\) 不改變值。`
        );
      },
      () => {
        const det = randInt(2, 7);
        const result = 2 * det;
        return s331QA(
          `已知 \\(\det(u,v,w)=${det}\\)，求 \\(\det(u+v,\\ v+w,\\ w+u)\\)。`,
          `\\(${result}\\)`,
          `方法：用線性與交錯性展開，留下兩個同向循環項，所以結果為 \\(2\\det(u,v,w)\\)。`
        );
      },
      () => {
        const volume = randInt(2, 9);
        const r = randInt(2, 4);
        const s = randInt(2, 4);
        const t = randInt(2, 4);
        return s331QA(
          `三向量 \\(a,b,c\\) 張成的平行六面體體積為 \\(${volume}\\)。求 \\(${r}a,${s}b,${t}c\\) 張成的新體積。`,
          `\\(${Math.abs(r * s * t) * volume}\\)`,
          `方法：每個方向放大多少倍，體積就乘上三個倍率的絕對值。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414NumericDeterminantSet(count) {
    const builders = [
      () => {
        const p = randInt(2, 9);
        const q = randInt(2, 9);
        const r = randInt(2, 9);
        const rows = [
          [p, p + q, p + q + r],
          [q, q + r, q + r + p],
          [r, r + p, r + p + q],
        ];
        const value = s414Det3(rows[0], rows[1], rows[2]);
        return s331QA(
          `計算行列式 \\(${s414Matrix3Tex(rows)}\\)。`,
          `\\(${value}\\)`,
          `方法：可先做行列運算化簡，再展開；不要硬算到最後才整理。`
        );
      },
      () => {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        const c = randInt(2, 6);
        const rows = [
          [1, 1, 1],
          [a, b, c],
          [a * a, b * b, c * c],
        ];
        const value = (b - a) * (c - a) * (c - b);
        return s331QA(
          `計算范德蒙行列式 \\(${s414Matrix3Tex(rows)}\\)。`,
          `\\(${value}\\)`,
          `方法：\\(\\begin{vmatrix}1&1&1\\\\a&b&c\\\\a^2&b^2&c^2\\end{vmatrix}=(b-a)(c-a)(c-b)\\)。`
        );
      },
      () => {
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        const c = randInt(2, 5);
        const rows = [
          [1, 2, 3],
          [0, a, b],
          [0, 0, c],
        ];
        return s331QA(
          `計算上三角行列式 \\(${s414Matrix3Tex(rows)}\\)。`,
          `\\(${a * c}\\)`,
          `方法：三角矩陣的行列式等於主對角線乘積。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414DeterminantEquationSet(count) {
    const builders = [
      () => {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        const x = randInt(-5, 6);
        const target = (x + 1) * a * b;
        const rows = [
          ['x+1', 2, 3],
          [0, a, 1],
          [0, 0, b],
        ];
        return s331QA(
          `解方程式 \\(${s414Matrix3Tex(rows)}=${target}\\)。`,
          `\\(x=${x}\\)`,
          `方法：三角行列式為 \\((x+1)\\cdot${a}\\cdot${b}\\)，再解一次方程。`
        );
      },
      () => {
        const x = randInt(2, 5);
        const rows = [
          ['x', 1, 2],
          [1, 'x', 2],
          [1, 2, 'x'],
        ];
        const value = s414Det3([x, 1, 2], [1, x, 2], [1, 2, x]);
        return s331QA(
          `設 \\(f(x)=${s414Matrix3Tex(rows)}\\)。若本次 \\(x=${x}\\)，求 \\(f(x)\\) 的值。`,
          `\\(${value}\\)`,
          `方法：把行列式看成多項式；代入後可用行列運算或直接展開。`
        );
      },
      () => {
        const a = randInt(1, 4);
        const b = randInt(2, 5);
        const c = randInt(3, 6);
        const rows = [
          [1, 1, 1],
          [a, b, c],
          [a * a, b * b, c * c],
        ];
        return s331QA(
          `判斷 \\(${s414Matrix3Tex(rows)}\\) 是否為 0，並說明其代表的幾何意義。`,
          a === b || b === c || a === c
            ? `為 0；代表三個參數中有重複，對應點不形成非零面積`
            : `不為 0；值為 \\(${(b - a) * (c - a) * (c - b)}\\)`,
          `方法：范德蒙行列式有相同參數時為 0，幾何上常表示退化或線性相依。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414AdvancedPolynomialSet(count) {
    const builders = [
      () => {
        const a = randInt(1, 4);
        const b = randInt(5, 8);
        const c = randInt(9, 12);
        return s331QA(
          `計算 \\(\\begin{vmatrix}1&1&1\\\\${a}&${b}&${c}\\\\${a * a}&${b * b}&${c * c}\\end{vmatrix}\\)。`,
          `\\(${(b - a) * (c - a) * (c - b)}\\)`,
          `方法：這是范德蒙型，直接用 \\((b-a)(c-a)(c-b)\\)。`
        );
      },
      () => {
        const area = randInt(3, 12);
        const r = randInt(2, 5);
        const s = randInt(2, 5);
        return s331QA(
          `已知 \\(\\triangle ABC\\) 面積為 \\(${area}\\)。若頂點經線性變換 \\((x,y)\\mapsto(${r}x,${s}y)\\)，求新三角形面積。`,
          `\\(${r * s * area}\\)`,
          `方法：二維線性變換的面積倍率為對應行列式的絕對值，本題倍率為 \\(${r}\\cdot${s}\\)。`
        );
      },
      () => {
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        const c = randInt(1, 4);
        const rows = [
          [1, 1, 1],
          [a, b, c],
          [b + c, a + c, a + b],
        ];
        const value = s414Det3(rows[0], rows[1], rows[2]);
        return s331QA(
          `計算特殊代數行列式 \\(${s414Matrix3Tex(rows)}\\)。`,
          `\\(${value}\\)`,
          `方法：先做列運算觀察相依關係；代數行列式的重點是找結構，不是盲目展開。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414CrossAreaMixedSet(count) {
    return buildS223MixedSet(
      [buildS414CrossBasicNormalSet, buildS414CrossAreaDistanceSet, buildS414CrossLengthIdentitySet],
      count
    );
  }

  function buildS414VolumeCoplanarMixedSet(count) {
    return buildS223MixedSet(
      [buildS414TripleVolumeSet, buildS414CoplanarCollinearSet, buildS414ParameterInverseSet],
      count
    );
  }

  function buildS414DeterminantAlgebraMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS414DeterminantPropertiesSet,
        buildS414NumericDeterminantSet,
        buildS414DeterminantEquationSet,
        buildS414AdvancedPolynomialSet,
      ],
      count
    );
  }

  function buildS411EquidistantPlaneLocusCleanSet(count) {
    const builders = [
      () => {
        const a = randInt(2, 6);
        const h = randInt(2, 6);
        const y = randInt(2, 8);
        const rSq = a * a + h * h + y * y;
        return s331QA(
          `令 \\(A(${a},0,${h})\\)、\\(B(${-a},0,${h})\\)，點 \\(P\\) 在 \\(xy\\) 平面上，且 \\(PA=PB=\\sqrt{${rSq}}\\)。求所有可能的 \\(P\\) 坐標。`,
          `\\((0,${y},0)\\)、\\((0,${-y},0)\\)`,
          `由 \\(PA=PB\\) 得 \\(x=0\\)。再代入 \\(PA^2=${rSq}\\)，得 \\(${a * a}+y^2+${h * h}=${rSq}\\)，所以 \\(y=\\pm${y}\\)。`
        );
      },
      () => {
        const a = randInt(2, 5);
        const h = randInt(1, 6);
        const y = randInt(2, 7);
        const rSq = a * a + h * h + y * y;
        return s331QA(
          `令 \\(A(${a},0,${h})\\)、\\(B(${-a},0,${h})\\)。若 \\(P=(0,t,0)\\) 且 \\(PA=PB=\\sqrt{${rSq}}\\)，求 \\(t\\)。`,
          `\\(t=\\pm${y}\\)`,
          `因為 \\(P\\) 已在兩點的垂直平分平面上，只要算 \\(PA^2=${a * a}+t^2+${h * h}=${rSq}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS411MovingPointDistanceCleanSet(count) {
    const builders = [
      () => {
        const a = randInt(2, 8);
        const b = randInt(2, 8);
        const c = randInt(2, 8);
        return s331QA(
          `兩質點同時從 \\(P_0=(0,0,0)\\)、\\(Q_0=(0,${b},0)\\) 出發，1 秒後分別到 \\(P_1=(${a},0,0)\\)、\\(Q_1=(${a},${b},${c})\\)，且皆等速直線運動。求兩質點距離何時最小，最小值是多少。`,
          `\\(t=0\\) 時最小，最小值 \\(${b}\\)`,
          `設時間為 \\(t\\)，兩點差向量為 \\((0,${b},${c}t)\\)，距離平方 \\(d^2=${b * b}+${c * c}t^2\\)，在 \\(0\\le t\\le1\\) 時最小於 \\(t=0\\)。`
        );
      },
      () => {
        const a = randInt(2, 7);
        const b = randInt(2, 7);
        const c = randInt(2, 7);
        const maxSq = b * b + c * c;
        return s331QA(
          `兩質點同時從 \\((0,0,0)\\)、\\((0,${b},0)\\) 出發，1 秒後分別到 \\((${a},0,0)\\)、\\((${a},${b},${c})\\)。求這段時間兩質點距離的最大值。`,
          `\\(\\sqrt{${maxSq}}\\)`,
          `同設時間 \\(t\\)，距離平方為 \\(${b * b}+${c * c}t^2\\)，在 \\(t=1\\) 最大，所以最大距離為 \\(\\sqrt{${maxSq}}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412UnitDirectionSumCleanSet(count) {
    const builders = [
      () => {
        const v = s324Pick([
          [2, 2, 1],
          [1, 2, 2],
          [2, -3, 6],
          [3, 4, 12],
          [4, 4, 7],
        ]);
        const sum = v[0] + v[1] + v[2];
        return s331QA(
          `設 \\(u=(x,y,z)\\) 為向量 \\(${s412Vec3(v[0], v[1], v[2])}\\) 同方向的單位向量，求 \\(x+y+z\\)。`,
          `\\(${s333Quotient(sum, s412Len3(v))}\\)`,
          `同方向單位向量為 \\(\\dfrac{${s412Vec3(v[0], v[1], v[2])}}{${s412Len3(v)}}\\)，所以坐標和為 \\(\\dfrac{${sum}}{${s412Len3(v)}}\\)。`
        );
      },
      () => {
        const v = s324Pick([
          [3, 0, 4],
          [0, 3, 4],
          [6, -3, 6],
          [5, 12, 0],
        ]);
        return s331QA(
          `求與 \\(${s412Vec3(v[0], v[1], v[2])}\\) 同方向的單位向量。`,
          `\\(\\dfrac{${s412Vec3(v[0], v[1], v[2])}}{${s412Len3(v)}}\\)`,
          `同方向取正向，將原向量除以長度 \\(${s412Len3(v)}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412ParametricVectorMinCleanSet(count) {
    const builders = [
      () => {
        const b = s324Pick([
          [1, -1, 2],
          [2, 1, -2],
          [1, 2, 2],
          [2, -3, 6],
        ]);
        const t0 = randInt(-4, 5) || 2;
        const perp = [b[1], -b[0], 0];
        const a = s413Sub3(perp, s413Scale3(t0, b));
        const minSq = s412Dot3(perp, perp);
        return s331QA(
          `設 \\(a=${s412Vec3(a[0], a[1], a[2])}\\)、\\(b=${s412Vec3(b[0], b[1], b[2])}\\)。求 \\(|a+tb|\\) 的最小值與此時 \\(t\\)。`,
          `\\(t=${t0}\\)，最小值 \\(${s333Sqrt(minSq)}\\)`,
          `當 \\(a+tb\\) 與 \\(b\\) 垂直時長度最小。解 \\((a+tb)\\cdot b=0\\)，得 \\(t=${t0}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412LineProjectionPointCleanSet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const d = s324Pick([
          [2, 1, 2],
          [1, 2, 2],
          [3, 0, 4],
          [2, -1, 2],
        ]);
        const s = randInt(-2, 4);
        const perp = [d[1], -d[0], 0];
        const H = s413Add3(A, s413Scale3(s, d));
        const P = s413Add3(H, perp);
        return s331QA(
          `直線 \\(L\\) 通過 \\(${s412Point('A', A)}\\)，方向向量為 \\(${s412Vec3(d[0], d[1], d[2])}\\)。若 \\(P=(${P.join(',')})\\)，求 \\(P\\) 在 \\(L\\) 上的正射影點。`,
          `\\(${s412Point('H', H)}\\)`,
          `令 \\(H=A+sd\\)。本題資料設計成 \\(PH\\perp d\\)，所以 \\(H\\) 就是垂足；一般可用 \\(s=\\dfrac{(P-A)\\cdot d}{|d|^2}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413ProjectionScalarCleanSet(count) {
    const builders = [
      () => {
        const a = s324Pick([
          [2, 2, 1],
          [1, 2, 2],
          [3, 0, 4],
          [2, -1, 2],
        ]);
        const bLen = randInt(2, 8);
        const cosNum = s324Pick([-1, 1]);
        const cosDen = 2;
        const scalar = s331Frac(bLen * cosNum, cosDen);
        return s331QA(
          `已知 \\(|b|=${bLen}\\)，且 \\(a=${s412Vec3(a[0], a[1], a[2])}\\) 與 \\(b\\) 的夾角為 \\(${cosNum > 0 ? 60 : 120}^\\circ\\)。求 \\(b\\) 在 \\(a\\) 上的正射影長（帶正負）。`,
          `\\(${scalar}\\)`,
          `帶正負的正射影長為 \\(|b|\\cos\\theta=${bLen}\\cdot(${s331Frac(cosNum, cosDen)})\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413SphereLinearExtremaCleanSet(count) {
    const builders = [
      () => {
        const center = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const r = randInt(2, 7);
        const n = s324Pick([
          [2, 1, -2],
          [1, 2, 2],
          [2, -1, 2],
          [3, 0, 4],
        ]);
        const centerValue = s412Dot3(n, center);
        const span = `${r}${s412Len3(n) === '1' ? '' : '\\cdot' + s412Len3(n)}`;
        return s331QA(
          `實數 \\(x,y,z\\) 滿足 \\((x${center[0] >= 0 ? '-' + center[0] : '+' + -center[0]})^2+(y${center[1] >= 0 ? '-' + center[1] : '+' + -center[1]})^2+(z${center[2] >= 0 ? '-' + center[2] : '+' + -center[2]})^2=${r * r}\\)。求 \\(${n[0]}x${s334SignedTerm(n[1], 'y')}${s334SignedTerm(n[2], 'z')}\\) 的最大值與最小值。`,
          `最大值 \\(${centerValue}+${span}\\)，最小值 \\(${centerValue}-${span}\\)`,
          `把式子看成 \\(n\\cdot X\\)。球心貢獻 \\(n\\cdot C=${centerValue}\\)，變動量最大為 \\(r|n|=${span}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413PlaneDistanceMinimumCleanSet(count) {
    const builders = [
      () => {
        const n = [randInt(1, 5), randInt(-4, 4) || -2, randInt(1, 5)];
        const center = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const gap = randInt(2, 10);
        const d = s412Dot3(n, center) + gap;
        const min = s331Frac(gap * gap, s412Dot3(n, n));
        return s331QA(
          `實數 \\(x,y,z\\) 滿足 \\(${n[0]}x${s334SignedTerm(n[1], 'y')}${s334SignedTerm(n[2], 'z')}=${d}\\)。求 \\((x${center[0] >= 0 ? '-' + center[0] : '+' + -center[0]})^2+(y${center[1] >= 0 ? '-' + center[1] : '+' + -center[1]})^2+(z${center[2] >= 0 ? '-' + center[2] : '+' + -center[2]})^2\\) 的最小值。`,
          `\\(${min}\\)`,
          `這是點 \\(${center.join(',')}\\) 到平面距離平方。距離為 \\(\\dfrac{|${d}-${s412Dot3(n, center)}|}{\\sqrt{${s412Dot3(n, n)}}}\\)，平方為 \\(${min}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414TriangleHeightCleanSet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const AB = s324Pick([
          [3, 0, 0],
          [0, 4, 0],
          [2, 2, 1],
          [1, 2, 2],
        ]);
        const AC = s324Pick([
          [1, 2, 2],
          [2, -1, 2],
          [3, 1, -2],
          [0, 3, 4],
        ]);
        const B = s413Add3(A, AB);
        const C = s413Add3(A, AC);
        const crossLen = s412Len3(s414Cross(AB, AC));
        const baseLen = s412Len3(AB);
        return s331QA(
          `已知 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)、\\(${s412Point('C', C)}\\)。以 \\(AB\\) 為底，求 \\(\\triangle ABC\\) 的高。`,
          `\\(\\dfrac{${crossLen}}{${baseLen}}\\)`,
          `三角形面積 \\(K=\\frac12|AB\\times AC|\\)，又 \\(K=\\frac12|AB|h\\)，所以 \\(h=\\dfrac{|AB\\times AC|}{|AB|}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414VolumeLinearCombinationCleanSet(count) {
    const builders = [
      () => {
        const volume = randInt(2, 12);
        const r = randInt(2, 5);
        const s = randInt(-4, -1);
        const t = randInt(2, 5);
        const factor = Math.abs(r * t);
        return s331QA(
          `已知三向量 \\(a,b,c\\) 張成的平行六面體體積為 \\(${volume}\\)。求 \\(${r}a+b,\\ b${s334SignedTerm(s, 'c')},\\ ${t}c\\) 張成的平行六面體體積。`,
          `\\(${factor * volume}\\)`,
          `行列式 \\(\\det(${r}a+b,b${s}c,${t}c)\\) 中，與重複欄相關的項都為 0，只剩 \\(${r}\\cdot${t}\\det(a,b,c)\\)，體積乘 \\(${factor}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414VandermondeParameterCleanSet(count) {
    const builders = [
      () => {
        const a = randInt(1, 4);
        const b = a + randInt(2, 5);
        const c = b + randInt(2, 5);
        return s331QA(
          `解方程式 \\(\\begin{vmatrix}1&1&1\\\\${a}&x&${c}\\\\${a * a}&x^2&${c * c}\\end{vmatrix}=0\\)。`,
          `\\(x=${a}\\) 或 \\(x=${c}\\)`,
          `這是范德蒙行列式，值為 \\((x-${a})(${c}-${a})(${c}-x)\\)，所以 \\(x=${a}\\) 或 \\(x=${c}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414DeterminantOperationCleanSet(count) {
    const builders = [
      () => {
        const det = randInt(2, 12);
        const m = randInt(2, 5);
        const n = randInt(-4, 4) || 1;
        return s331QA(
          `已知 \\(D=\\det(a,b,c)=${det}\\)。求 \\(\\det(a${s334SignedTerm(n, 'b')},\\ ${m}b,\\ c)\\)。`,
          `\\(${m * det}\\)`,
          `第一欄加上第二欄倍數不改變行列式；第二欄乘以 \\(${m}\\) 會使行列式乘以 \\(${m}\\)。`
        );
      },
      () => {
        const det = randInt(2, 10);
        return s331QA(
          `已知 \\(\\det(a,b,c)=${det}\\)。求 \\(\\det(b,c,a)-\\det(c,b,a)\\)。`,
          `\\(${2 * det}\\)`,
          `\\((b,c,a)\\) 是循環排列，值仍為 \\(D\\)；\\((c,b,a)\\) 交換一次，值為 \\(-D\\)，相減得 \\(2D\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS411CubeFaceCenterOctahedronVolumeCleanSet(count) {
    const builders = [
      () => {
        const octVolume = s324Pick([4, 6, 8, 12, 18, 24]);
        return s331QA(
          `以正立方體六個面的中心為頂點可形成一個正八面體。若此正八面體體積為 \\(${octVolume}\\)，求原正立方體的體積。`,
          `\\(${6 * octVolume}\\)`,
          `設正立方體邊長為 \\(a\\)。六個面心形成的正八面體體積為 \\(\\frac{a^3}{6}\\)，所以正立方體體積為正八面體體積的 6 倍。`
        );
      },
      () => {
        const side = s324Pick([6, 12, 18, 24]);
        const cubeVolume = side * side * side;
        const octVolume = cubeVolume / 6;
        return s331QA(
          `正立方體邊長為 \\(${side}\\)，連結六個面中心形成正八面體，求此正八面體的體積。`,
          `\\(${octVolume}\\)`,
          `面心正八面體可視為三條互相垂直的對角線長皆為 \\(${side}\\) 的八面體，體積為 \\(\\frac{a^3}{6}=\\frac{${cubeVolume}}{6}=${octVolume}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412AxisEquidistantPointCleanSet(count) {
    function tMinus(value) {
      if (value === 0) return 't';
      return value > 0 ? `t-${value}` : `t+${Math.abs(value)}`;
    }

    const builders = [
      () => {
        let data = null;
        for (let tries = 0; tries < 200 && !data; tries += 1) {
          const t = randInt(-6, 6);
          const z1 = randInt(-5, 5);
          const z2 = randInt(-5, 5);
          const a = randInt(2, 8);
          if (z1 === z2) continue;
          const bSq = a * a + (t - z1) * (t - z1) - (t - z2) * (t - z2);
          const b = Math.sqrt(bSq);
          if (Number.isInteger(b) && b > 0 && b <= 12) data = { t, z1, z2, a, b };
        }
        if (!data) data = { t: 2, z1: 1, z2: 3, a: 3, b: 5 };
        const A = [data.a, 0, data.z1];
        const B = [0, data.b, data.z2];
        return s331QA(
          `設點 \\(P\\) 在 \\(z\\) 軸上，且 \\(P\\) 到 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\) 兩點等距離，求 \\(P\\) 的坐標。`,
          `\\(P(0,0,${data.t})\\)`,
          `令 \\(P=(0,0,t)\\)。由 \\(PA^2=PB^2\\)，得 \\(${data.a}^2+(${tMinus(data.z1)})^2=${data.b}^2+(${tMinus(data.z2)})^2\\)，解得 \\(t=${data.t}\\)。`
        );
      },
      () => {
        let data = null;
        for (let tries = 0; tries < 200 && !data; tries += 1) {
          const answerT = randInt(-5, 5);
          const z1 = randInt(-4, 4);
          const z2 = randInt(-4, 4);
          const a = randInt(2, 7);
          if (z1 === z2) continue;
          const bSq = a * a + (answerT - z1) * (answerT - z1) - (answerT - z2) * (answerT - z2);
          const b = Math.sqrt(bSq);
          if (Number.isInteger(b) && b > 0 && b <= 10) data = { answerT, A: [a, 0, z1], B: [0, b, z2] };
        }
        if (!data) data = { answerT: 2, A: [3, 0, 1], B: [0, 5, 3] };
        return s331QA(
          `點 \\(P=(0,0,t)\\) 在 \\(z\\) 軸上，且 \\(PA=PB\\)。若 \\(${s412Point('A', data.A)}\\)、\\(${s412Point('B', data.B)}\\)，求 \\(t\\)。`,
          `\\(t=${data.answerT}\\)`,
          `代入距離平方相等：\\(PA^2=PB^2\\)，整理後是一元一次方程。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS412CentroidPlaneProjectionCleanSet(count) {
    const builders = [
      () => {
        const m = randInt(1, 6);
        const n = randInt(1, 6);
        const p = randInt(1, 6);
        const A = [3 * m, 0, 0];
        const B = [0, 3 * n, 0];
        const C = [0, 0, 3 * p];
        const answer = [s331Frac(2 * m, 3), s331Frac(2 * n, 3), s331Frac(2 * p, 3)];
        return s331QA(
          `已知 \\(\\triangle ABC\\) 的三頂點為 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)、\\(${s412Point('C', C)}\\)。自其重心 \\(G\\) 分別作 \\(xy\\)、\\(yz\\)、\\(zx\\) 平面之垂線，垂足為 \\(P,Q,R\\)，求 \\(\\triangle PQR\\) 的重心坐標。`,
          `\\((${answer.join(',')})\\)`,
          `先得 \\(G=(${m},${n},${p})\\)。三個投影點為 \\(P=(${m},${n},0)\\)、\\(Q=(0,${n},${p})\\)、\\(R=(${m},0,${p})\\)，再取三點平均。`
        );
      },
      () => {
        const g = [randInt(1, 8), randInt(1, 8), randInt(1, 8)];
        const answer = [s331Frac(2 * g[0], 3), s331Frac(2 * g[1], 3), s331Frac(2 * g[2], 3)];
        return s331QA(
          `空間中一點 \\(G(${g.join(',')})\\) 分別投影到 \\(xy\\)、\\(yz\\)、\\(zx\\) 平面，得三點 \\(P,Q,R\\)。求 \\(\\triangle PQR\\) 的重心坐標。`,
          `\\((${answer.join(',')})\\)`,
          `三投影點為 \\((${g[0]},${g[1]},0)\\)、\\((0,${g[1]},${g[2]})\\)、\\((${g[0]},0,${g[2]})\\)，三點平均即為答案。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413AngleBisectorCoefficientCleanSet(count) {
    const builders = [
      () => {
        const item = s324Pick([
          { u: [3, 1, 2], v: [2, -4, -6], ratio: 2 },
          { u: [1, 2, 2], v: [4, -4, 2], ratio: 2 },
          { u: [2, 1, 2], v: [6, -3, 6], ratio: 3 },
          { u: [3, 0, 4], v: [0, 6, 8], ratio: 2 },
        ]);
        return s331QA(
          `已知 \\(\\overrightarrow{OA}=${s412Vec3(item.u[0], item.u[1], item.u[2])}\\)、\\(\\overrightarrow{OB}=${s412Vec3(item.v[0], item.v[1], item.v[2])}\\)。若 \\(\\overrightarrow{OC}\\) 平分 \\(\\angle AOB\\)，且 \\(\\overrightarrow{OC}=x\\overrightarrow{OA}+\\overrightarrow{OB}\\)，求 \\(x\\)。`,
          `\\(x=${item.ratio}\\)`,
          `角平分方向為 \\(\\frac{OA}{|OA|}+\\frac{OB}{|OB|}\\)。此題 \\(|OB|=${item.ratio}|OA|\\)，所以寫成 \\(xOA+OB\\) 時，\\(x=\\frac{|OB|}{|OA|}=${item.ratio}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413LinearOverNormExtremaCleanSet(count) {
    function firstLinearTerm(coef, variable) {
      if (coef === 1) return variable;
      if (coef === -1) return `-${variable}`;
      return `${coef}${variable}`;
    }

    const builders = [
      () => {
        const n = s324Pick([
          [2, -2, -1],
          [1, 2, -2],
          [3, 4, 0],
          [2, 1, 2],
          [1, -2, 2],
        ]);
        const len = s412Len3(n);
        return s331QA(
          `若 \\((x,y,z)\\ne(0,0,0)\\)，求 \\(\\dfrac{${firstLinearTerm(n[0], 'x')}${s334SignedTerm(n[1], 'y')}${s334SignedTerm(n[2], 'z')}}{\\sqrt{x^2+y^2+z^2}}\\) 的最大值與最小值。`,
          `最大值 \\(${len}\\)，最小值 \\(-${len}\\)`,
          `由柯西不等式，\\(|n\\cdot X|\\le |n||X|\\)。分母是 \\(|X|\\)，所以最大、最小為 \\(\\pm|n|\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS413PairwiseOrthogonalParameterCleanSet(count) {
    function kTerm(offset) {
      if (offset === 0) return 'k';
      return offset > 0 ? `k+${offset}` : `k-${Math.abs(offset)}`;
    }

    const builders = [
      () => {
        const root = s324Pick([1, 2, 3, 4]);
        const shift = 2 - root;
        const a = [kTerm(shift), -1, 3];
        const b = [kTerm(shift - 1), -1, -1];
        const c = [kTerm(shift + 2), 5, -1];
        return s331QA(
          `三向量 \\(a=${s412Vec3(a[0], a[1], a[2])}\\)、\\(b=${s412Vec3(b[0], b[1], b[2])}\\)、\\(c=${s412Vec3(c[0], c[1], c[2])}\\) 兩兩互相垂直，求 \\(k\\)。`,
          `\\(k=${root}\\)`,
          `兩兩垂直表示 \\(a\\cdot b=0\\)、\\(a\\cdot c=0\\)、\\(b\\cdot c=0\\)。本題三個方程有共同解 \\(k=${root}\\)，代入可使三個內積同時為 0。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS414ConsecutiveRowDeterminantCleanSet(count) {
    const builders = [
      () => {
        const n = randInt(5, 50);
        const rows = [
          [n, n + 1, n + 2],
          [n + 1, n + 2, n + 3],
          [n + 2, n + 3, n + 5],
        ];
        return s331QA(
          `計算行列式 \\(${s414Matrix3Tex(rows)}\\)。`,
          `\\(-1\\)`,
          `先做列運算：令 \\(R_2\\leftarrow R_2-R_1\\)、\\(R_3\\leftarrow R_3-R_1\\)，可快速化成常數型行列式，結果恆為 \\(-1\\)。`
        );
      },
      () => {
        const n = randInt(100, 999);
        const rows = [
          [n, n + 1, n + 2],
          [n + 1, n + 2, n + 3],
          [n + 2, n + 3, n + 5],
        ];
        return s331QA(
          `不直接展開，計算 \\(${s414Matrix3Tex(rows)}\\)。`,
          `\\(-1\\)`,
          `這類連續列只差固定量，先相減再展開最省。無論 \\(n\\) 為何，此結構的值都是 \\(-1\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function s421Gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function s421Frac(numer, denom) {
    if (denom < 0) {
      numer = -numer;
      denom = -denom;
    }
    const g = s421Gcd(numer, denom);
    numer /= g;
    denom /= g;
    if (denom === 1) return String(numer);
    return '\\frac{' + numer + '}{' + denom + '}';
  }

  function s421Term(coef, variable, first) {
    if (coef === 0) return '';
    const sign = coef > 0 ? (first ? '' : '+') : '-';
    const abs = Math.abs(coef);
    const body = abs === 1 ? variable : abs + variable;
    return sign + body;
  }

  function s421PlaneTex(n, d) {
    let text = '';
    [
      ['x', n[0]],
      ['y', n[1]],
      ['z', n[2]],
    ].forEach(([variable, coef]) => {
      const term = s421Term(coef, variable, text === '');
      if (term) text += term;
    });
    if (d > 0) text += '+' + d;
    if (d < 0) text += d;
    return (text || '0') + '=0';
  }

  function s421PlaneFromPointNormal(point, normal) {
    return -s412Dot3(point, normal);
  }

  function s421PlaneDistance(point, normal, d) {
    const numer = Math.abs(s412Dot3(point, normal) + d);
    const denom = s412Len3(normal);
    if (numer === 0) return '0';
    return '\\dfrac{' + numer + '}{' + denom + '}';
  }

  function s421PointFrac(name, numerators, denom) {
    return name + '(' + numerators.map((v) => s421Frac(v, denom)).join(',') + ')';
  }

  function buildS421PointNormalPlaneSet(count) {
    const builders = [
      () => {
        const P = [randInt(-3, 5), randInt(-4, 4), randInt(-3, 5)];
        const n = [randInt(1, 5), randInt(-4, 4), randInt(-3, 5)];
        const d = s421PlaneFromPointNormal(P, n);
        return s331QA(
          `求通過點 \\(${s412Point('P', P)}\\)，且以 \\(n=${s412Vec3(n[0], n[1], n[2])}\\) 為法向量的平面方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：點法式為 \\(a(x-x_0)+b(y-y_0)+c(z-z_0)=0\\)，其中 \\((a,b,c)\\) 是法向量。`
        );
      },
      () => {
        const A = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const B = [randInt(-2, 5), randInt(-2, 5), randInt(-2, 5)];
        const n = s413Sub3(B, A);
        const d = s421PlaneFromPointNormal(B, n);
        return s331QA(
          `已知 \\(${s412Point('A', A)}\\) 與 \\(${s412Point('B', B)}\\)，且直線 \\(AB\\) 垂直平面 \\(E\\) 於 \\(B\\) 點，求平面 \\(E\\) 的方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：若直線垂直平面，則直線方向向量 \\(\\overrightarrow{AB}\\) 就是平面的法向量。`
        );
      },
      () => {
        const P = [randInt(-4, 5), randInt(-3, 4), randInt(-4, 5)];
        const axis = s324Pick([
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ]);
        const d = s421PlaneFromPointNormal(P, axis);
        return s331QA(
          `求通過點 \\(${s412Point('P', P)}\\)，且垂直於 ${axis[0] ? '\\(x\\)' : axis[1] ? '\\(y\\)' : '\\(z\\)'} 軸的平面方程式。`,
          `\\(${s421PlaneTex(axis, d)}\\)`,
          `方法：垂直於某坐標軸，代表該坐標軸方向就是法向量。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421ThreePointInterceptPlaneSet(count) {
    const builders = [
      () => {
        const A = [randInt(-2, 3), randInt(-2, 3), randInt(-2, 3)];
        const u = [randInt(1, 4), randInt(-2, 3), randInt(-2, 3)];
        const v = [randInt(-2, 3), randInt(1, 4), randInt(-2, 3)];
        const B = s413Add3(A, u);
        const C = s413Add3(A, v);
        const n = s414Cross(u, v);
        const d = s421PlaneFromPointNormal(A, n);
        return s331QA(
          `求通過 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)、\\(${s412Point('C', C)}\\) 三點的平面方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：先算 \\(\\overrightarrow{AB}\\times\\overrightarrow{AC}\\) 得法向量，再代入點法式。`
        );
      },
      () => {
        const a = randInt(2, 7);
        const b = randInt(2, 7);
        const c = randInt(2, 7);
        const n = [b * c, a * c, a * b];
        const d = -a * b * c;
        return s331QA(
          `求在 \\(x,y,z\\) 三軸上的截距分別為 \\(${a}\\)、\\(${b}\\)、\\(${c}\\) 的平面方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：截距式為 \\(\\frac{x}{${a}}+\\frac{y}{${b}}+\\frac{z}{${c}}=1\\)，再化為一般式。`
        );
      },
      () => {
        const a = randInt(2, 7);
        const b = randInt(2, 7);
        const c = randInt(2, 7);
        const n = [b * c, a * c, a * b];
        const d = -a * b * c;
        return s331QA(
          `平面通過 \\(( ${a},0,0)\\)、\\((0,${b},0)\\)、\\((0,0,${c})\\)，求其一般式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：三軸截點題可直接用截距式，也可用三點外積求法向量。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421PlaneRelationAngleSet(count) {
    const builders = [
      () => {
        const P = [randInt(-2, 4), randInt(-3, 3), randInt(-2, 4)];
        const n = [randInt(1, 4), randInt(-3, 3), randInt(-3, 4)];
        const d = s421PlaneFromPointNormal(P, n);
        const k = randInt(-5, 5);
        const d2 = d + k || d + 2;
        return s331QA(
          `求通過 \\(${s412Point('P', P)}\\)，且與平面 \\(${s421PlaneTex(n, d2)}\\) 平行的平面方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：平行平面的法向量平行，可沿用同一個法向量後代入指定點。`
        );
      },
      () => {
        const a = randInt(1, 5);
        const n1 = [a, 1, -3];
        const n2 = [a, 2, a];
        const dot = s412Dot3(n1, n2);
        return s331QA(
          `已知平面 \\(${s421PlaneTex(n1, -1)}\\) 與 \\(${s421PlaneTex(n2, -2)}\\)，判斷是否互相垂直。`,
          dot === 0 ? `垂直` : `不垂直，因為法向量內積為 \\(${dot}\\)`,
          `方法：兩平面垂直等價於兩法向量垂直，也就是 \\(n_1\\cdot n_2=0\\)。`
        );
      },
      () => {
        const n1 = [2, 1, -1];
        const n2 = [1, -1, 2];
        const dot = s412Dot3(n1, n2);
        const denom = s333Sqrt(s412Dot3(n1, n1) * s412Dot3(n2, n2));
        return s331QA(
          `求兩平面 \\(${s421PlaneTex(n1, -randInt(1, 5))}\\) 與 \\(${s421PlaneTex(n2, randInt(-4, 4))}\\) 的夾角餘弦值。`,
          `\\(\\dfrac{|${dot}|}{${denom}}\\)`,
          `方法：平面夾角由法向量夾角決定，\\(\\cos\\theta=\\frac{|n_1\\cdot n_2|}{|n_1||n_2|}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421PointPlaneDistanceSet(count) {
    const builders = [
      () => {
        const n = [randInt(1, 4), randInt(-3, 3), randInt(-2, 4)];
        const d = randInt(-8, 8);
        const P = [randInt(-4, 5), randInt(-4, 5), randInt(-4, 5)];
        return s331QA(
          `求點 \\(${s412Point('P', P)}\\) 到平面 \\(${s421PlaneTex(n, d)}\\) 的距離。`,
          `\\(${s421PlaneDistance(P, n, d)}\\)`,
          `方法：點到平面距離為 \\(\\dfrac{|ax_0+by_0+cz_0+d|}{\\sqrt{a^2+b^2+c^2}}\\)。`
        );
      },
      () => {
        const P = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const n = [2, -1, 2];
        const distance = randInt(1, 4);
        const base = -s412Dot3(P, n);
        const d = base + distance * s412Len3(n);
        return s331QA(
          `已知點 \\(${s412Point('P', P)}\\) 到平面 \\(2x-y+2z+k=0\\) 的距離為 \\(${distance}\\)，求一個可能的 \\(k\\) 值。`,
          `\\(k=${d}\\)`,
          `方法：代入距離公式後會有絕對值，因此通常有兩個可能值；本題列出其中一個。`
        );
      },
      () => {
        const n = [1, -2, 2];
        const d = randInt(-6, 6);
        const P = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        return s331QA(
          `在平面 \\(${s421PlaneTex(n, d)}\\) 上找一點 \\(Q\\)，使 \\(P${s412Vec3(P[0], P[1], P[2])}\\) 到 \\(Q\\) 的距離最短，並求最短距離。`,
          `最短距離為 \\(${s421PlaneDistance(P, n, d)}\\)`,
          `方法：最短連線必垂直平面，所以最短距離就是點到平面的距離。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421ParallelPlaneDistanceSet(count) {
    const builders = [
      () => {
        const n = [randInt(1, 4), randInt(-3, 3), randInt(-3, 4)];
        const d1 = randInt(-8, 8);
        const gap = randInt(2, 9);
        const d2 = d1 + gap;
        return s331QA(
          `求兩平行平面 \\(${s421PlaneTex(n, d1)}\\) 與 \\(${s421PlaneTex(n, d2)}\\) 的距離。`,
          `\\(\\dfrac{${Math.abs(d2 - d1)}}{${s412Len3(n)}}\\)`,
          `方法：同法向量平行平面的距離為 \\(\\frac{|d_2-d_1|}{\\sqrt{a^2+b^2+c^2}}\\)。`
        );
      },
      () => {
        const n = [1, 2, 2];
        const d1 = randInt(-8, 4);
        const distance = randInt(1, 5);
        const d2 = d1 + distance * 3;
        return s331QA(
          `求與平面 \\(${s421PlaneTex(n, d1)}\\) 平行且距離為 \\(${distance}\\) 的一個平面方程式。`,
          `\\(${s421PlaneTex(n, d2)}\\)`,
          `方法：法向量不變，且 \\(|d_2-d_1|=距離\\times|n|\\)。`
        );
      },
      () => {
        const n = [2, -1, 2];
        const d = randInt(-8, 8);
        const P = [randInt(-4, 5), randInt(-4, 5), randInt(-4, 5)];
        const d2 = -s412Dot3(P, n);
        return s331QA(
          `求通過 \\(${s412Point('P', P)}\\)，且與平面 \\(${s421PlaneTex(n, d)}\\) 平行的平面方程式，並求兩平面距離。`,
          `平面為 \\(${s421PlaneTex(n, d2)}\\)，距離為 \\(\\dfrac{${Math.abs(d2 - d)}}{${s412Len3(n)}}\\)`,
          `方法：先用同法向量建立平行平面，再用平行平面距離公式。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421ProjectionReflectionSet(count) {
    const builders = [
      () => {
        const n = [1, -2, 2];
        const H = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const t = randInt(1, 4);
        const P = s413Add3(H, s413Scale3(t, n));
        const d = s421PlaneFromPointNormal(H, n);
        return s331QA(
          `求點 \\(${s412Point('P', P)}\\) 在平面 \\(${s421PlaneTex(n, d)}\\) 上的投影點坐標。`,
          `\\(${s412Point('H', H)}\\)`,
          `方法：投影點在垂線上，可寫成 \\(P-t n\\)，再代入平面求 \\(t\\)。`
        );
      },
      () => {
        const n = [1, 2, 1];
        const H = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const t = randInt(1, 4);
        const P = s413Add3(H, s413Scale3(t, n));
        const R = s413Add3(H, s413Scale3(-t, n));
        const d = s421PlaneFromPointNormal(H, n);
        return s331QA(
          `求點 \\(${s412Point('P', P)}\\) 對稱於平面 \\(${s421PlaneTex(n, d)}\\) 的對稱點。`,
          `\\(${s412Point('P\\prime', R)}\\)`,
          `方法：平面上的投影點是對稱中點，所以先找垂足，再做中點對稱。`
        );
      },
      () => {
        const P = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const n = [2, -1, 2];
        const d = randInt(-5, 5);
        const denom = s412Dot3(n, n);
        const value = s412Dot3(P, n) + d;
        const footNumer = P.map((coord, i) => coord * denom - value * n[i]);
        return s331QA(
          `求點 \\(${s412Point('P', P)}\\) 在平面 \\(${s421PlaneTex(n, d)}\\) 上的垂足坐標。`,
          `\\(${s421PointFrac('H', footNumer, denom)}\\)`,
          `方法：垂足公式為 \\(H=P-\\frac{ax_0+by_0+cz_0+d}{a^2+b^2+c^2}n\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421PerpendicularBisectorSet(count) {
    const builders = [
      () => {
        const A = [2 * randInt(-2, 3), 2 * randInt(-2, 3), 2 * randInt(-2, 3)];
        const B = [2 * randInt(-1, 4), 2 * randInt(-1, 4), 2 * randInt(-1, 4)];
        const n = s413Sub3(B, A);
        const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
        const d = s421PlaneFromPointNormal(M, n);
        return s331QA(
          `已知 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)，求線段 \\(AB\\) 的垂直平分面方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：垂直平分面的法向量為 \\(\\overrightarrow{AB}\\)，且通過中點。`
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const B = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        return s331QA(
          `空間中所有到 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\) 等距離的點形成什麼圖形？`,
          `線段 \\(AB\\) 的垂直平分面`,
          `方法：等距離軌跡由 \\(PA^2=PB^2\\) 化簡，會得到一個平面。`
        );
      },
      () => {
        const A = [2, -1, 4];
        const B = [6, 3, 0];
        const n = s413Sub3(B, A);
        const M = [4, 1, 2];
        const d = s421PlaneFromPointNormal(M, n);
        return s331QA(
          `求使平面上任一點到 \\(A(2,-1,4)\\)、\\(B(6,3,0)\\) 距離相等的平面方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：這是垂直平分面題型，核心不是展開距離，而是抓中點與法向量。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421PlaneFamilyVolumeSet(count) {
    const builders = [
      () => {
        const a = randInt(2, 8);
        const b = randInt(2, 8);
        const c = randInt(2, 8);
        const volume = s333Quotient(a * b * c, 6);
        return s331QA(
          `平面與三坐標軸在第一卦限的截距分別為 \\(${a}\\)、\\(${b}\\)、\\(${c}\\)，求它與三坐標平面圍成四面體的體積。`,
          `\\(${volume}\\)`,
          `方法：截距式四面體體積為 \\(V=\\frac16abc\\)。`
        );
      },
      () => {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        const c = randInt(2, 6);
        const scale = randInt(2, 4);
        const n = [b * c, a * c, a * b];
        const d = -a * b * c;
        return s331QA(
          `已知平面 \\(${s421PlaneTex(n, d)}\\)。若改成與它平行且三軸截距皆放大為原來 \\(${scale}\\) 倍的平面，求新平面方程式。`,
          `\\(${s421PlaneTex(n, d * scale)}\\)`,
          `方法：截距同倍率放大時，法向量比例可不變，常數項按同倍率縮放。`
        );
      },
      () => {
        const n = [3, -2, 1];
        const sum = randInt(6, 18);
        const d = -sum;
        return s331QA(
          `平面法向量為 \\((3,-2,1)\\)，且三軸截距和為 \\(${sum}\\)。求一個符合條件的平面方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：先寫 \\(3x-2y+z+d=0\\)，再用截距或指定條件解出常數項。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421ReflectionShortestPathSet(count) {
    const builders = [
      () => {
        const A = [randInt(-4, -1), randInt(-3, 4), randInt(-3, 4)];
        const B = [randInt(-5, -1), randInt(-3, 4), randInt(-3, 4)];
        const R = [-B[0], B[1], B[2]];
        const dist = s412Len3(s413Sub3(A, R));
        return s331QA(
          `點 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\) 在平面 \\(x=0\\) 同側。若 \\(P\\) 在平面 \\(x=0\\) 上，求 \\(PA+PB\\) 的最小值。`,
          `\\(${dist}\\)`,
          `方法：把 \\(B\\) 對平面反射成 \\(B'\\)，則最短折線長為直線距離 \\(AB'\\)。`
        );
      },
      () => {
        const P = [randInt(2, 6), randInt(-3, 4), randInt(-3, 4)];
        const R = [-P[0], P[1], P[2]];
        return s331QA(
          `光線由 \\(${s412Point('P', P)}\\) 射向平面 \\(x=0\\) 後反射，求 \\(P\\) 對此平面的對稱點。`,
          `\\(${s412Point('P\\prime', R)}\\)`,
          `方法：對稱於 \\(x=0\\) 時只改變 \\(x\\) 坐標的正負號。`
        );
      },
      () => {
        const h = randInt(4, 12);
        const a = randInt(3, 10);
        const b = randInt(4, 12);
        const dist = s333Sqrt(h * h + a * a + b * b);
        return s331QA(
          `一座塔高 \\(${h}\\) 公尺，塔底到目標點的水平位移可分解為 \\(${a}\\) 公尺與 \\(${b}\\) 公尺，求塔頂到目標點的直線距離。`,
          `\\(${dist}\\) 公尺`,
          `方法：空間距離用三維畢氏定理，平方和再開根號。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }


  // ── s4-2-1 新增：兩平面交線 ──────────────────────────────
  function buildS421TwoPlaneIntersectionSet(count) {
    // 五組法向量對，|det(XY子式)|=1，確保 z=0 時交點為整數
    const pairPool = [
      { n1:[1,1,0], n2:[0,1,1] },
      { n1:[1,0,1], n2:[1,1,0] },
      { n1:[2,1,0], n2:[1,0,1] },
      { n1:[1,2,0], n2:[0,1,1] },
      { n1:[1,1,0], n2:[1,0,1] },
    ];
    // 用 Cramer's rule：令 z=0，解 n[0]x+n[1]y=-d
    function ipXY(n1, d1, n2, d2) {
      const det = n1[0]*n2[1] - n1[1]*n2[0];
      const x = ((-d1)*n2[1] - (-d2)*n1[1]) / det;
      const y = (n1[0]*(-d2) - n2[0]*(-d1)) / det;
      return [x, y, 0];
    }
    const builders = [
      () => {
        const { n1, n2 } = s324Pick(pairPool);
        const d1 = randInt(-5, 5); const d2 = randInt(-5, 5);
        const v = s414Cross(n1, n2);
        return s331QA(
          `已知兩平面 \\(E_1:\\;${s421PlaneTex(n1, d1)}\\) 與 \\(E_2:\\;${s421PlaneTex(n2, d2)}\\)，求兩平面交線的方向向量。`,
          `\\(${s412Vec3(v[0],v[1],v[2])}\\)（或任意非零倍數）`,
          `方法：交線方向向量 = 兩法向量外積 \\(\\vec{n}_1\\times\\vec{n}_2\\)。`
        );
      },
      () => {
        const { n1, n2 } = s324Pick(pairPool);
        const d1 = randInt(-5, 5); const d2 = randInt(-5, 5);
        const P = ipXY(n1, d1, n2, d2);
        return s331QA(
          `求兩平面 \\(E_1:\\;${s421PlaneTex(n1, d1)}\\) 與 \\(E_2:\\;${s421PlaneTex(n2, d2)}\\) 交線上一點坐標。`,
          `\\((${P[0]},\\,${P[1]},\\,0)\\)`,
          `方法：令 \\(z=0\\) 代入兩平面方程組，Cramer 法解出 \\(x,y\\)。`
        );
      },
      () => {
        const { n1, n2 } = s324Pick(pairPool);
        const d1 = randInt(-4, 4); const d2 = randInt(-4, 4);
        const v = s414Cross(n1, n2);
        const P = ipXY(n1, d1, n2, d2);
        return s331QA(
          `求兩平面 \\(${s421PlaneTex(n1, d1)}\\) 與 \\(${s421PlaneTex(n2, d2)}\\) 的交線方程式。`,
          `過點 \\((${P[0]},\\,${P[1]},\\,0)\\)，方向向量 \\(${s412Vec3(v[0],v[1],v[2])}\\)`,
          `方法：方向 = \\(\\vec{n}_1\\times\\vec{n}_2\\)；令 \\(z=0\\) 解兩式得特殊點，合成直線方程。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  // ── s4-2-1 新增：特殊條件平面建構 ────────────────────────
  function buildS421PlaneSpecialConditionSet(count) {
    // Case 1 向量對（a×b 有整數分量）
    const vecPairPool = [
      { a:[1,1,0], b:[0,1,1] }, // n=(1,-1,1)
      { a:[1,2,0], b:[0,1,1] }, // n=(2,-1,1)
      { a:[2,1,0], b:[1,0,1] }, // n=(1,-2,-1) = -(1,2,1)... let check: (2,1,0)×(1,0,1)=(1*1-0*0,0*1-2*1,2*0-1*1)=(1,-2,-1)
      { a:[1,0,1], b:[1,1,0] }, // n=(-1,1,1)
      { a:[1,1,1], b:[1,-1,0] }, // n=(1*0-1*(-1),1*1-1*0,1*(-1)-1*1)=(1,1,-2)
    ];
    // Case 3 (包含直線 + 垂直平面) 預設案例
    const lineNormPairPool = [
      { vL:[1,2,1], nP:[1,0,0], A:[0,0,0] },  // n_new = vL×nP = (2*0-1*0,1*1-1*0,1*0-2*1)=(0,1,-2)
      { vL:[1,2,0], nP:[0,0,1], A:[1,0,0] },  // n_new = (2*1-0*0,0*0-1*1,1*0-2*0)=(2,-1,0)
      { vL:[1,1,1], nP:[1,-1,0], A:[0,1,0] }, // n_new = (1*0-1*(-1),1*1-1*0,1*(-1)-1*1)=(1,1,-2)
      { vL:[2,1,0], nP:[0,1,0], A:[0,0,2] },  // n_new = (1*0-0*1,0*0-2*0,2*1-1*0)=(0,0,2)→(0,0,1)
    ];
    const builders = [
      () => {
        // 通過點P且平行兩向量 a,b → 法向量 = a×b
        const { a, b } = s324Pick(vecPairPool);
        const n = s414Cross(a, b);
        const P = [randInt(-3,3), randInt(-3,3), randInt(-3,3)];
        const d = -(n[0]*P[0]+n[1]*P[1]+n[2]*P[2]);
        return s331QA(
          `求過點 \\(${s412Point('P',P)}\\) 且平行向量 \\(\\vec{a}=${s412Vec3(a[0],a[1],a[2])}\\) 和 \\(\\vec{b}=${s412Vec3(b[0],b[1],b[2])}\\) 的平面方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：平面法向量 \\(\\vec{n}=\\vec{a}\\times\\vec{b}=${s412Vec3(n[0],n[1],n[2])}\\)，再代入點 \\(P\\) 求常數項。`
        );
      },
      () => {
        // 通過點P且垂直直線L（方向向量=法向量）
        const vCases = [[1,2,2],[2,1,2],[2,2,1],[1,2,-1],[3,1,1],[1,-1,2]];
        const v = s324Pick(vCases);
        const P = [randInt(-3,3), randInt(-3,3), randInt(-3,3)];
        const d = -(v[0]*P[0]+v[1]*P[1]+v[2]*P[2]);
        return s331QA(
          `已知直線 \\(L\\) 的方向向量為 \\(${s412Vec3(v[0],v[1],v[2])}\\)，求過點 \\(${s412Point('P',P)}\\) 且垂直於 \\(L\\) 的平面方程式。`,
          `\\(${s421PlaneTex(v, d)}\\)`,
          `方法：平面法向量 = 直線方向向量 \\(${s412Vec3(v[0],v[1],v[2])}\\)，代入點 \\(P\\) 定方程。`
        );
      },
      () => {
        // 包含直線L且垂直平面E → 法向量 = vL × nE
        const { vL, nP, A } = s324Pick(lineNormPairPool);
        const nNew = s414Cross(vL, nP);
        // 簡化：若全部分量為偶數則除以2
        const g = nNew.reduce((acc,x)=>{ const v=Math.abs(x); return v===0?acc:acc===0?v:gcd(acc,v); }, 0);
        function gcd(a,b){return b===0?a:gcd(b,a%b);}
        const nSim = g>1 ? nNew.map(x=>x/g) : nNew;
        const d = -(nSim[0]*A[0]+nSim[1]*A[1]+nSim[2]*A[2]);
        const Aadjusted = [A[0]+randInt(-2,2), A[1]+randInt(-2,2), A[2]+randInt(-2,2)];
        const da = -(nSim[0]*Aadjusted[0]+nSim[1]*Aadjusted[1]+nSim[2]*Aadjusted[2]);
        return s331QA(
          `直線 \\(L\\) 過點 \\(${s412Point('A',Aadjusted)}\\)，方向向量為 \\(${s412Vec3(vL[0],vL[1],vL[2])}\\)；平面 \\(E\\) 的法向量為 \\(${s412Vec3(nP[0],nP[1],nP[2])}\\)。求包含 \\(L\\) 且垂直於 \\(E\\) 的平面方程式。`,
          `\\(${s421PlaneTex(nSim, da)}\\)`,
          `方法：所求平面法向量 \\(=\\vec{v}_L\\times\\vec{n}_E=${s412Vec3(nSim[0],nSim[1],nSim[2])}\\)，代入 \\(A\\) 定方程。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421PlaneEquationMixedSet(count) {
    return buildS223MixedSet(
      [buildS421PointNormalPlaneSet, buildS421ThreePointInterceptPlaneSet, buildS421PlaneRelationAngleSet],
      count
    );
  }

  function buildS421DistanceProjectionMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS421PointPlaneDistanceSet,
        buildS421ParallelPlaneDistanceSet,
        buildS421ProjectionReflectionSet,
        buildS421PerpendicularBisectorSet,
      ],
      count
    );
  }

  function buildS421PlaneApplicationMixedSet(count) {
    return buildS223MixedSet(
      [buildS421PlaneFamilyVolumeSet, buildS421ReflectionShortestPathSet, buildS421PointPlaneDistanceSet],
      count
    );
  }

  function s422LineParamTex(P, v, parameter = 't') {
    const piece = (coord, step) => coord + (step >= 0 ? '+' : '') + step + parameter;
    const cleanPiece = (coord, step) => (step === 0 ? String(coord) : piece(coord, step));
    return `\\begin{cases}x=${cleanPiece(P[0], v[0])}\\\\y=${cleanPiece(P[1], v[1])}\\\\z=${cleanPiece(P[2], v[2])}\\end{cases}`;
  }

  function s422LineSymTex(P, v) {
    return `\\dfrac{x${P[0] >= 0 ? '-' + P[0] : '+' + Math.abs(P[0])}}{${v[0]}}=\\dfrac{y${P[1] >= 0 ? '-' + P[1] : '+' + Math.abs(P[1])}}{${v[1]}}=\\dfrac{z${P[2] >= 0 ? '-' + P[2] : '+' + Math.abs(P[2])}}{${v[2]}}`;
  }

  function s422PointOnLine(P, v, t) {
    return s413Add3(P, s413Scale3(t, v));
  }

  function s422PerpVector(v) {
    const candidate = s414Cross(v, [0, 0, 1]);
    if (candidate[0] || candidate[1] || candidate[2]) return candidate;
    return s414Cross(v, [0, 1, 0]);
  }

  function buildS422LineEquationBasicSet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const v = [randInt(1, 5), randInt(-4, 4) || 2, randInt(1, 5)];
        return s331QA(
          `求通過 \\(${s412Point('A', A)}\\)，且方向向量為 \\(v=${s412Vec3(v[0], v[1], v[2])}\\) 的直線參數式。`,
          `\\(${s422LineParamTex(A, v)}\\)`,
          `方法：空間直線由「一點加上一個方向向量」決定，寫成 \\((x,y,z)=A+t v\\)。`
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [randInt(1, 4), randInt(1, 4), randInt(1, 4)];
        const B = s422PointOnLine(A, v, randInt(2, 5));
        return s331QA(
          `已知 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)，求通過兩點的直線對稱比例式。`,
          `\\(${s422LineSymTex(A, v)}\\)`,
          `方法：先求方向向量 \\(\\overrightarrow{AB}\\)，再寫 \\(\\frac{x-x_0}{l}=\\frac{y-y_0}{m}=\\frac{z-z_0}{n}\\)。`
        );
      },
      () => {
        const P = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const axis = s324Pick([
          { name: 'x', v: [1, 0, 0] },
          { name: 'y', v: [0, 1, 0] },
          { name: 'z', v: [0, 0, 1] },
        ]);
        return s331QA(
          `求通過 \\(${s412Point('P', P)}\\)，且平行於 \\(${axis.name}\\) 軸的直線參數式。`,
          `\\(${s422LineParamTex(P, axis.v)}\\)`,
          `方法：平行某坐標軸時，方向向量就是該軸的單位方向。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422LinePlaneInteractionSet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [randInt(1, 4), randInt(-3, 3) || 1, randInt(-3, 3) || 2];
        const t0 = randInt(-3, 4);
        const X = s422PointOnLine(A, v, t0);
        const n = [randInt(1, 4), randInt(-3, 3) || 2, randInt(-3, 4) || -1];
        const d = s421PlaneFromPointNormal(X, n);
        return s331QA(
          `求直線 \\(L:${s422LineParamTex(A, v)}\\) 與平面 \\(E:${s421PlaneTex(n, d)}\\) 的交點。`,
          `\\(${s412Point('Q', X)}\\)`,
          `方法：把直線參數式代入平面方程，解出參數後回代坐標。`
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [randInt(1, 4), randInt(-3, 3) || 1, randInt(-3, 3) || 2];
        const n = s422PerpVector(v);
        const contain = Math.random() < 0.5;
        const d = contain ? s421PlaneFromPointNormal(A, n) : s421PlaneFromPointNormal(A, n) + randInt(1, 5);
        return s331QA(
          `判斷直線 \\(L:${s422LineParamTex(A, v)}\\) 與平面 \\(E:${s421PlaneTex(n, d)}\\) 的關係。`,
          contain ? `直線在平面上` : `直線與平面平行但不相交`,
          `方法：先看 \\(v\\cdot n=0\\)。若再代入直線上一點也滿足平面，則直線在平面上；否則平行。`
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [1, 2, -1];
        const n = [2, -1, 3];
        const d = randInt(-6, 6);
        const dot = Math.abs(s412Dot3(v, n));
        const denom = s333Sqrt(s412Dot3(v, v) * s412Dot3(n, n));
        return s331QA(
          `求直線 \\(L:${s422LineParamTex(A, v)}\\) 與平面 \\(E:${s421PlaneTex(n, d)}\\) 所成角的正弦值。`,
          `\\(\\dfrac{${dot}}{${denom}}\\)`,
          `方法：線面角 \\(\\theta\\) 滿足 \\(\\sin\\theta=\\frac{|v\\cdot n|}{|v||n|}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422PierceCoordinatePlaneSet(count) {
    const builders = [
      () => {
        const A = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const v = [randInt(1, 4), randInt(1, 4), randInt(1, 4)];
        const target = s324Pick([
          { plane: 'xy', index: 2 },
          { plane: 'yz', index: 0 },
          { plane: 'xz', index: 1 },
        ]);
        const numer = -A[target.index];
        const denom = v[target.index];
        const pointNumer = A.map((coord, i) => coord * denom + numer * v[i]);
        return s331QA(
          `求直線 \\(L:${s422LineParamTex(A, v)}\\) 與 \\(${target.plane}\\) 平面的交點坐標。`,
          `\\(${s421PointFrac('Q', pointNumer, denom)}\\)`,
          `方法：與 \\(xy,yz,xz\\) 平面相交時，分別令 \\(z=0,x=0,y=0\\) 後解參數。`
        );
      },
      () => {
        const b = randInt(-6, 8);
        const A = [0, 6, 12];
        const Q = [6, b, -6];
        const v = s413Sub3(Q, A);
        return s331QA(
          `直線通過 \\(A(0,6,12)\\) 與 \\(Q(6,${b},-6)\\)。判斷此直線是否與 \\(x\\) 軸相交。`,
          b === -3 ? `會，交於 \\((4,0,0)\\)` : `不會；代入 \\(y=0,z=0\\) 得到的參數不一致`,
          `方法：與 \\(x\\) 軸相交必須同時滿足 \\(y=0\\) 與 \\(z=0\\)。`
        );
      },
      () => {
        const A = [1, 3, 4];
        const v = [2, -1, 2];
        const t = randInt(-2, 3);
        const P = s422PointOnLine(A, v, t);
        const ok = P[0] > 0 && P[1] > 0 && P[2] > 0;
        return s331QA(
          `直線 \\(L:${s422LineParamTex(A, v)}\\) 上參數 \\(t=${t}\\) 的點是否位於第一卦限？`,
          ok ? `是，點為 \\(${s412Point('P', P)}\\)` : `否，點為 \\(${s412Point('P', P)}\\)`,
          `方法：先由參數算出坐標，再檢查三個坐標是否皆為正。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422ParameterConstraintSet(count) {
    const builders = [
      () => {
        const A = [randInt(-2, 3), randInt(-2, 3), randInt(-2, 3)];
        const v = [randInt(1, 4), randInt(-3, 3) || 1, randInt(1, 4)];
        const t = randInt(2, 5);
        const P = s422PointOnLine(A, v, t);
        return s331QA(
          `點 \\(P\\) 在以 \\(${s412Point('A', A)}\\) 為起點、方向向量 \\(${s412Vec3(v[0], v[1], v[2])}\\) 的射線上，且 \\(P=${s412Point('P', P)}\\)。求參數 \\(t\\) 並判斷是否在線段延長線上。`,
          `\\(t=${t}\\)，在以 \\(A\\) 為起點的射線上`,
          `方法：寫成 \\(P=A+tv\\)，比較任一非零分量即可求 \\(t\\)，再依 \\(t\\) 的範圍判斷軌跡。`
        );
      },
      () => {
        const A = [3, 1, -1];
        const B = [2, 5, 3];
        const t = randInt(2, 5);
        const P = s422PointOnLine(A, s413Sub3(B, A), t);
        return s331QA(
          `已知 \\(A(3,1,-1)\\)、\\(B(2,5,3)\\)，若 \\(P\\) 滿足 \\(\\overrightarrow{AP}=${t}\\overrightarrow{AB}\\)，求 \\(P\\) 坐標。`,
          `\\(${s412Point('P', P)}\\)`,
          `方法：參數式 \\(P=A+t(B-A)\\)，\\(0\\le t\\le1\\) 在線段上，\\(t>1\\) 在延長線上。`
        );
      },
      () => {
        const A = [1, 2, 3];
        const B = [4, 6, 15];
        const v = s413Sub3(B, A);
        return s331QA(
          `已知 \\(A(1,2,3)\\)、\\(B(4,6,15)\\)，請寫出線段 \\(AB\\) 的參數式並標註參數範圍。`,
          `\\((x,y,z)=(1,2,3)+t${s412Vec3(v[0], v[1], v[2])}\\)，\\(0\\le t\\le1\\)`,
          `方法：線段不是整條直線，必須加上 \\(0\\le t\\le1\\) 的參數限制。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422PointLineProjectionSet(count) {
    const builders = [
      () => {
        const A = [randInt(-2, 3), randInt(-2, 3), randInt(-2, 3)];
        const v = [randInt(1, 4), randInt(-3, 3) || 1, randInt(1, 4)];
        const t = randInt(-2, 4);
        const h = randInt(1, 4);
        const w = s422PerpVector(v);
        const H = s422PointOnLine(A, v, t);
        const P = s413Add3(H, s413Scale3(h, w));
        const dist = `\\dfrac{${s412Len3(s414Cross(s413Sub3(P, A), v))}}{${s412Len3(v)}}`;
        return s331QA(
          `求點 \\(${s412Point('P', P)}\\) 到直線 \\(L:${s422LineParamTex(A, v)}\\) 的垂足坐標與距離。`,
          `垂足為 \\(${s412Point('H', H)}\\)，距離為 \\(${dist}\\)`,
          `方法：垂足 \\(H=A+tv\\) 滿足 \\((P-H)\\cdot v=0\\)；距離也可用 \\(\\frac{|\\overrightarrow{AP}\\times v|}{|v|}\\)。`
        );
      },
      () => {
        const A = [1, 1, -2];
        const v = [2, 3, 2];
        const t = randInt(-2, 3);
        const H = s422PointOnLine(A, v, t);
        const P = s413Add3(H, [2, -2, -1]);
        const R = s413Add3(s413Scale3(2, H), s413Scale3(-1, P));
        return s331QA(
          `已知點 \\(${s412Point('P', P)}\\)，求其對直線 \\(L:${s422LineParamTex(A, v)}\\) 的對稱點坐標。`,
          `\\(${s412Point('P\\prime', R)}\\)`,
          `方法：先求垂足 \\(H\\)，再用 \\(P'=2H-P\\)。`
        );
      },
      () => {
        const P = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const A = [0, 0, 0];
        const v = [1, 1, 1];
        const dot = s412Dot3(P, v);
        return s331QA(
          `求點 \\(${s412Point('P', P)}\\) 到直線 \\(x=y=z\\) 的正射影點。`,
          `\\(H(${s421Frac(dot, 3)},${s421Frac(dot, 3)},${s421Frac(dot, 3)})\\)`,
          `方法：令垂足為 \\((t,t,t)\\)，使用 \\((P-H)\\cdot(1,1,1)=0\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422ParallelSkewDistanceSet(count) {
    const builders = [
      () => {
        const A = [randInt(-2, 3), randInt(-2, 3), randInt(-2, 3)];
        const v = [randInt(1, 4), randInt(-3, 3) || 1, randInt(1, 4)];
        const offset = s422PerpVector(v);
        const B = s413Add3(A, s413Scale3(randInt(1, 4), offset));
        const dist = `\\dfrac{${s412Len3(s414Cross(s413Sub3(B, A), v))}}{${s412Len3(v)}}`;
        return s331QA(
          `求兩平行直線 \\(L_1:${s422LineParamTex(A, v)}\\) 與 \\(L_2:${s422LineParamTex(B, v, 's')}\\) 的距離。`,
          `\\(${dist}\\)`,
          `方法：在其中一直線取一點，到另一條直線作點線距離即可。`
        );
      },
      () => {
        const h = randInt(1, 8);
        const A = [0, 0, 0];
        const B = [randInt(-3, 3), randInt(-3, 3), h];
        const v1 = [1, 0, 0];
        const v2 = [0, 1, 0];
        return s331QA(
          `判斷直線 \\(L_1:${s422LineParamTex(A, v1)}\\) 與 \\(L_2:${s422LineParamTex(B, v2, 's')}\\) 的關係，並求最短距離。`,
          `歪斜線，最短距離為 \\(${Math.abs(h)}\\)`,
          `方法：方向不平行且不相交為歪斜；距離可用 \\(\\frac{|\\overrightarrow{AB}\\cdot(v_1\\times v_2)|}{|v_1\\times v_2|}\\)。`
        );
      },
      () => {
        const A = [randInt(-2, 2), randInt(-2, 2), randInt(-2, 2)];
        const v = [2, -1, 1];
        const B = s422PointOnLine(A, v, randInt(2, 5));
        return s331QA(
          `判斷直線 \\(L_1:${s422LineParamTex(A, v)}\\) 與 \\(L_2:${s422LineParamTex(B, v, 's')}\\) 的位置關係。`,
          `重合`,
          `方法：方向向量平行，且其中一直線的一點也落在另一條直線上，所以兩線重合。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422CommonPerpendicularSet(count) {
    const builders = [
      () => {
        const h = randInt(2, 9);
        const A = [0, 0, 0];
        const B = [randInt(-3, 3), randInt(-3, 3), h];
        const v1 = [1, 0, 0];
        const v2 = [0, 1, 0];
        return s331QA(
          `求歪斜線 \\(L_1:${s422LineParamTex(A, v1)}\\) 與 \\(L_2:${s422LineParamTex(B, v2, 's')}\\) 的公垂線方向向量與最短距離。`,
          `公垂方向可取 \\((0,0,1)\\)，最短距離為 \\(${h}\\)`,
          `方法：公垂線方向為 \\(v_1\\times v_2\\)，距離是兩線在此方向上的投影長。`
        );
      },
      () => {
        const A = [0, 0, 0];
        const B = [randInt(1, 4), randInt(1, 4), randInt(2, 8)];
        const v1 = [1, 0, 0];
        const v2 = [0, 1, 0];
        return s331QA(
          `設 \\(L_1:${s422LineParamTex(A, v1)}\\)，\\(L_2:${s422LineParamTex(B, v2, 's')}\\)。求兩條歪斜線公垂線的兩個垂足坐標。`,
          `可取 \\(( ${B[0]},0,0)\\) 與 \\((${B[0]},${B[1]},${B[2]})\\)`,
          `方法：本題兩方向分別平行 \\(x,y\\) 軸，公垂線方向為 \\(z\\) 軸方向。`
        );
      },
      () => {
        const v1 = [randInt(1, 4), randInt(-2, 3) || 1, randInt(1, 4)];
        const v2 = [randInt(-3, 3) || 1, randInt(1, 4), randInt(-2, 3) || 2];
        const cross = s414Cross(v1, v2);
        return s331QA(
          `兩歪斜線方向向量分別為 \\(v_1=${s412Vec3(v1[0], v1[1], v1[2])}\\)、\\(v_2=${s412Vec3(v2[0], v2[1], v2[2])}\\)，求其公垂線的一個方向向量。`,
          `\\(${s412Vec3(cross[0], cross[1], cross[2])}\\)`,
          `方法：公垂線要同時垂直兩方向，所以方向向量可取 \\(v_1\\times v_2\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422MovingPointExtremaSet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const B = [randInt(-3, 4), randInt(-3, 4), randInt(-3, 4)];
        const tNumer = A[0] + B[0];
        return s331QA(
          `點 \\(P\\) 在 \\(x\\) 軸上移動。求使 \\(PA^2+PB^2\\) 最小的 \\(P\\) 坐標，其中 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)。`,
          `\\(P(${s421Frac(tNumer, 2)},0,0)\\)`,
          `方法：把 \\(P=(t,0,0)\\) 代入平方距離和，配方後最小值出現在兩點投影的中點。`
        );
      },
      () => {
        const A = [randInt(-2, 3), randInt(-2, 3), randInt(-2, 3)];
        const v = [1, 2, -2];
        const t = randInt(-2, 4);
        const P = s422PointOnLine(A, v, t);
        const O = [0, 0, 0];
        const dist = s412Len3(P);
        return s331QA(
          `直線 \\(L:${s422LineParamTex(A, v)}\\) 上取參數 \\(t=${t}\\) 的點 \\(P\\)。求此時 \\(OP\\) 長度。`,
          `\\(${dist}\\)`,
          `方法：動點題先以參數寫出 \\(P(t)\\)，再代入距離或面積公式；極值題會變成二次函數。`
        );
      },
      () => {
        const A = [1, 0, 1];
        const lineP = [1, 0, -1];
        const v = [2, 1, -2];
        const t = randInt(-2, 4);
        const P = s422PointOnLine(lineP, v, t);
        const dot = s412Dot3(s413Sub3(P, A), P);
        return s331QA(
          `設 \\(P\\) 為直線 \\(L:${s422LineParamTex(lineP, v)}\\) 上參數 \\(t=${t}\\) 的點，已知 \\(A(1,0,1)\\)，求 \\(\\overrightarrow{OP}\\cdot\\overrightarrow{AP}\\)。`,
          `\\(${dot}\\)`,
          `方法：先求 \\(P(t)\\)，再把內積化成代數式；若要極值，再對二次式配方。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422PlaneContainingLineSet(count) {
    const builders = [
      () => {
        const A = [randInt(-2, 3), randInt(-2, 3), randInt(-2, 3)];
        const v = [randInt(1, 4), randInt(-2, 3) || 1, randInt(1, 4)];
        const P = s413Add3(A, s422PerpVector(v));
        const n = s414Cross(v, s413Sub3(P, A));
        const d = s421PlaneFromPointNormal(A, n);
        return s331QA(
          `求包含點 \\(${s412Point('P', P)}\\) 與直線 \\(L:${s422LineParamTex(A, v)}\\) 的平面方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：包含直線與外點的平面，其法向量可由「直線方向」與「線上一點到外點向量」外積取得。`
        );
      },
      () => {
        const A = [0, 0, 0];
        const v1 = [1, 2, -1];
        const v2 = [2, -1, 1];
        const n = s414Cross(v1, v2);
        const d = s421PlaneFromPointNormal(A, n);
        return s331QA(
          `求包含兩條相交直線 \\(L_1:${s422LineParamTex(A, v1)}\\)、\\(L_2:${s422LineParamTex(A, v2, 's')}\\) 的平面方程式。`,
          `\\(${s421PlaneTex(n, d)}\\)`,
          `方法：兩相交直線決定一平面，平面法向量為兩條方向向量的外積。`
        );
      },
      () => {
        const n = [1, -2, 1];
        const d = randInt(-5, 5);
        const A = [randInt(-2, 3), randInt(-2, 3), randInt(-2, 3)];
        const v = s422PerpVector(n);
        const d2 = s421PlaneFromPointNormal(A, n);
        return s331QA(
          `求一個包含直線 \\(L:${s422LineParamTex(A, v)}\\)，且與平面 \\(${s421PlaneTex(n, d)}\\) 平行的平面方程式。`,
          `\\(${s421PlaneTex(n, d2)}\\)`,
          `方法：欲與已知平面平行，法向量相同；欲包含直線，需讓線上一點代入成立且方向向量與法向量垂直。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }


  // ── s4-2-2 新增：兩直線完整關係（含相交求交點）────────────
  function buildS422TwoLineRelationFullSet(count) {
    // 平行案例：方向向量相同，直線不重合
    const parallelPool = [
      { A:[0,0,0], d:[1,2,1], B:[1,0,0] },   // AB=(1,0,0); AB×d=(-1,-1,2); dist=√6/√6=1 → 簡化計算
      { A:[1,0,0], d:[1,1,2], B:[0,1,0] },
      { A:[0,1,0], d:[2,1,1], B:[0,0,1] },
      { A:[0,0,1], d:[1,2,2], B:[1,0,0] },
    ];
    // 相交案例：預設在交點 Pt 相交
    const intersectPool = [
      // A,d1 → L1 過A方向d1；L2 過 B=Pt+s*d2 @ s=-1 相當於 B
      // 驗證：A+t*d1=Pt, B+s*d2=Pt
      { A:[0,1,2], d1:[1,1,1], B:[-1,0,2], d2:[2,1,-1], Pt:[1,2,3] }, // t=1,s=1
      { A:[0,0,0], d1:[1,1,1], B:[-1,0,2], d2:[2,1,-1], Pt:[1,1,1] }, // t=1,s=1 check: (-1+2,0+1,2-1)=(1,1,1)✓
      { A:[1,0,0], d1:[1,2,1], B:[0,0,1], d2:[1,2,-1], Pt:[2,2,1] }, // t=1,s=2 check: A+d1=(2,2,1)✓; B+2*d2=(0+2,0+4,1-2)=(2,4,-1)≠(2,2,1) NO
      { A:[0,0,0], d1:[1,2,1], B:[1,0,2], d2:[-1,2,-1], Pt:[1,2,1] }, // t=1, A+d1=(1,2,1)✓; s: B+s*d2=(1-s,2s,2-s)=(1,2,1)→s=0→B=(1,0,2)≠(1,2,1) NO
    ];
    // 用可靠的預設相交案例
    const reliableIntersect = [
      { A:[0,1,2], d1:[1,1,1], B:[-1,0,2], d2:[2,1,-1], Pt:[1,2,3] },
      { A:[0,0,0], d1:[1,1,1], B:[-1,0,2], d2:[2,1,-1], Pt:[1,1,1] },
      { A:[1,0,0], d1:[0,1,1], B:[1,2,0], d2:[0,-1,1], Pt:[1,1,1] }, // t=1:A+(0,1,1)=(1,1,1)✓; s=1:B+(0,-1,1)=(1,1,1)✓
      { A:[0,0,1], d1:[1,1,0], B:[1,0,0], d2:[-1,1,1], Pt:[2,2,1] }, // t=2: A+2*(1,1,0)=(2,2,1)✓; s=1: B+(-1,1,1)=(0,1,1)≠(2,2,1) NO
    ];
    // 僅使用已驗證的
    const goodIntersect = [
      { A:[0,1,2], d1:[1,1,1], B:[-1,0,2], d2:[2,1,-1], Pt:[1,2,3] },
      { A:[0,0,0], d1:[1,1,1], B:[-1,0,2], d2:[2,1,-1], Pt:[1,1,1] },
      { A:[1,0,0], d1:[0,1,1], B:[1,2,0], d2:[0,-1,1], Pt:[1,1,1] },
      { A:[0,0,0], d1:[2,1,1], B:[1,1,-1], d2:[-1,0,1], Pt:[2,1,1] },
      // 驗證最後一個: A+t*(2,1,1)=(2t,t,t)=(2,1,1)→t=1✓; B+s*(-1,0,1)=(1-s,1,-1+s)=(2,1,1)→1-s=2→s=-1→(-1+1)=-1+(-1)=-2≠1 NO
    ];
    // 用 3 個已驗確的
    const safeIntersect = [
      { A:[0,1,2], d1:[1,1,1], B:[-1,0,2], d2:[2,1,-1], Pt:[1,2,3] },
      { A:[0,0,0], d1:[1,1,1], B:[-1,0,2], d2:[2,1,-1], Pt:[1,1,1] },
      { A:[1,0,0], d1:[0,1,1], B:[1,2,0], d2:[0,-1,1], Pt:[1,1,1] },
    ];
    // 歪斜案例
    const skewPool = [
      // L1: A,d1; L2: B,d2; 已知 (B-A)·(d1×d2) ≠ 0
      { A:[0,0,0], d1:[1,1,1], B:[0,0,1], d2:[1,-1,1] }, // d1×d2=(1*1-1*(-1),1*1-1*1,1*(-1)-1*1)=(2,0,-2); (B-A)=(0,0,1); dot=0+0-2=-2≠0 ✓
      { A:[0,0,0], d1:[1,2,1], B:[1,0,0], d2:[1,-1,2] }, // d1×d2=(2*2-1*(-1),1*1-1*2,1*(-1)-2*1)=(5,-1,-3); (B-A)=(1,0,0); dot=5≠0 ✓
      { A:[0,0,0], d1:[1,1,2], B:[0,1,0], d2:[2,1,-1] }, // d1×d2=(1*(-1)-2*1,2*2-1*(-1),1*1-1*2)=(-3,5,-1); (B-A)=(0,1,0); dot=5≠0 ✓
    ];

    const builders = [
      () => {
        const { A, d, B } = s324Pick(parallelPool);
        const cross = s414Cross(s413Sub3(B, A), d);
        const crossLen = s412Len3(cross);
        const dLen = s412Len3(d);
        return s331QA(
          `判斷直線 \\(L_1\\)（過 \\(${s412Point('A',A)}\\)，方向 \\(${s412Vec3(d[0],d[1],d[2])}\\)）與直線 \\(L_2\\)（過 \\(${s412Point('B',B)}\\)，方向 \\(${s412Vec3(d[0],d[1],d[2])}\\)）的位置關係，並求兩線距離。`,
          `平行；距離 \\(=\\dfrac{${crossLen}}{${dLen}}\\)（化簡後）`,
          `方法：方向向量相同代表平行；距離 \\(=\\dfrac{|\\overrightarrow{AB}\\times\\vec{d}|}{|\\vec{d}|}\\)。`
        );
      },
      () => {
        const c = s324Pick(safeIntersect);
        const { A, d1, B, d2, Pt } = c;
        return s331QA(
          `判斷直線 \\(L_1\\)（過 \\(${s412Point('A',A)}\\)，方向 \\(${s412Vec3(d1[0],d1[1],d1[2])}\\)）與直線 \\(L_2\\)（過 \\(${s412Point('B',B)}\\)，方向 \\(${s412Vec3(d2[0],d2[1],d2[2])}\\)）的位置關係，並求交點（若有）。`,
          `相交；交點 \\(${s412Point('P',Pt)}\\)`,
          `方法：設 \\(A+t\\vec{d}_1=B+s\\vec{d}_2\\) 解三個方程，交叉驗證三式均成立代表相交。`
        );
      },
      () => {
        const { A, d1, B, d2 } = s324Pick(skewPool);
        const cross = s414Cross(d1, d2);
        const AB = s413Sub3(B, A);
        const distNum = Math.abs(s412Dot3(AB, cross));
        const denom = s412Len3(cross);
        return s331QA(
          `判斷直線 \\(L_1\\)（過 \\(${s412Point('A',A)}\\)，方向 \\(${s412Vec3(d1[0],d1[1],d1[2])}\\)）與直線 \\(L_2\\)（過 \\(${s412Point('B',B)}\\)，方向 \\(${s412Vec3(d2[0],d2[1],d2[2])}\\)）的位置關係，若為歪斜線，求距離。`,
          `歪斜；距離 \\(=\\dfrac{${distNum}}{${denom}}\\)`,
          `方法：先驗 \\(\\vec{d}_1\\times\\vec{d}_2\\neq\\vec{0}\\)（非平行），再驗 \\(\\overrightarrow{AB}\\cdot(\\vec{d}_1\\times\\vec{d}_2)\\neq 0\\)（歪斜）；距離公式 \\(=\\dfrac{|\\overrightarrow{AB}\\cdot(\\vec{d}_1\\times\\vec{d}_2)|}{|\\vec{d}_1\\times\\vec{d}_2|}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  // ── s4-2-2 新增：直線通過點且垂直平面 ────────────────────
  function buildS422LinePerpPlaneSet(count) {
    const planePool = [
      { n:[1,2,2], dCoeff:1 }, { n:[2,1,2], dCoeff:1 },
      { n:[1,1,1], dCoeff:1 }, { n:[3,1,1], dCoeff:1 },
      { n:[1,3,1], dCoeff:1 }, { n:[1,1,3], dCoeff:1 },
      { n:[2,3,1], dCoeff:1 }, { n:[1,2,3], dCoeff:1 },
    ];
    const builders = [
      () => {
        // 過P且垂直於平面E → 方向向量 = E 的法向量
        const { n } = s324Pick(planePool);
        const d_plane = randInt(-6,6);
        const P = [randInt(-3,3), randInt(-3,3), randInt(-3,3)];
        return s331QA(
          `求過點 \\(${s412Point('P',P)}\\) 且垂直於平面 \\(${s421PlaneTex(n, d_plane)}\\) 的直線方程式（對稱式）。`,
          `\\(${s422LineSymTex(P,n)}\\)`,
          `方法：平面 \\(E\\) 的法向量 \\(\\vec{n}=${s412Vec3(n[0],n[1],n[2])}\\) 即所求直線的方向向量，代入點 \\(P\\) 寫對稱式。`
        );
      },
      () => {
        // 求直線的方向向量（直線⊥平面）
        const { n } = s324Pick(planePool);
        const d_plane = randInt(-5,5);
        const P = [randInt(-3,3), randInt(-3,3), randInt(-3,3)];
        return s331QA(
          `點 \\(${s412Point('P',P)}\\) 在平面 \\(E:\\;${s421PlaneTex(n, d_plane)}\\) 外，求過 \\(P\\) 且垂直於 \\(E\\) 的直線與 \\(E\\) 的交點（垂足坐標）。`,
          s421PointFrac('H', [
            P[0]*( n[0]*n[0]+n[1]*n[1]+n[2]*n[2] ) - n[0]*(n[0]*P[0]+n[1]*P[1]+n[2]*P[2]+d_plane),
            P[1]*( n[0]*n[0]+n[1]*n[1]+n[2]*n[2] ) - n[1]*(n[0]*P[0]+n[1]*P[1]+n[2]*P[2]+d_plane),
            P[2]*( n[0]*n[0]+n[1]*n[1]+n[2]*n[2] ) - n[2]*(n[0]*P[0]+n[1]*P[1]+n[2]*P[2]+d_plane),
          ], n[0]*n[0]+n[1]*n[1]+n[2]*n[2]),
          `方法：直線 \\(P+t\\vec{n}\\)；代入平面方程求 \\(t\\)，再得交點坐標。`
        );
      },
      () => {
        // 兩平面法向量各自決定兩直線方向，求其是否平行
        const pick1 = s324Pick(planePool);
        const pick2 = s324Pick(planePool.filter(p => p !== pick1));
        const n1 = pick1.n; const n2 = pick2.n;
        const d1 = randInt(-4,4); const d2 = randInt(-4,4);
        const dot = s412Dot3(n1,n2);
        const l1 = s412Len3(n1); const l2 = s412Len3(n2);
        const cross = s414Cross(n1,n2);
        const isParallel = cross.every(x=>x===0);
        return s331QA(
          `直線 \\(L_1\\perp E_1:\\;${s421PlaneTex(n1,d1)}\\)，直線 \\(L_2\\perp E_2:\\;${s421PlaneTex(n2,d2)}\\)。判斷 \\(L_1\\) 與 \\(L_2\\) 的位置關係（僅判斷方向）。`,
          isParallel ? `方向相同（平行或重合）` : `方向夾角的餘弦值為 \\(\\dfrac{${dot}}{${l1}\\cdot${l2}}\\)（不平行）`,
          `方法：垂直平面的直線方向即各自法向量；比較 \\(\\vec{n}_1,\\vec{n}_2\\) 是否共線。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421CommonLinePlaneFamilyCleanSet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [randInt(1, 4), randInt(-3, 3) || 1, randInt(1, 4)];
        const B = s413Add3(A, v);
        const t = s324Pick([-3, -2, -1, 2, 3, 4]);
        const P = s422PointOnLine(A, v, t);
        return s331QA(
          `坐標空間中三個相異平面都通過 \\(${s412Point('A', A)}\\) 與 \\(${s412Point('B', B)}\\)。判斷 \\(${s412Point('P', P)}\\) 是否一定同時在這三個平面上。`,
          `是`,
          `三平面共同通過兩點 \\(A,B\\)，所以共同交集至少包含直線 \\(AB\\)。因為 \\(P=A+${t}\\overrightarrow{AB}\\)，故 \\(P\\) 在直線 \\(AB\\) 上。`
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [randInt(1, 4), randInt(-3, 3) || 1, randInt(1, 4)];
        const B = s413Add3(A, v);
        const off = s422PerpVector(v);
        const P = s413Add3(s422PointOnLine(A, v, randInt(-2, 3)), off);
        return s331QA(
          `坐標空間中所有通過 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\) 的平面，其共同點是否一定包含 \\(${s412Point('P', P)}\\)？`,
          `否`,
          `所有這類平面的共同交集是直線 \\(AB\\)。檢查 \\(\\overrightarrow{AP}\\) 與 \\(\\overrightarrow{AB}\\) 不成比例，所以 \\(P\\) 不一定在每個平面上。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421CoplanarParameterCleanSet(count) {
    const builders = [
      () => {
        const pair = s324Pick([
          [[1, 2, 3], [2, 1, -1]],
          [[2, 1, 1], [1, -1, 3]],
          [[1, -2, 2], [3, 1, 1]],
          [[2, -1, 3], [-1, 2, 1]],
        ]);
        const A = pair[0];
        const B = pair[1];
        const p = randInt(-2, 4);
        const q = randInt(-2, 4);
        const C = s413Add3(s413Scale3(p, A), s413Scale3(q, B));
        return s331QA(
          `設 \\(O(0,0,0)\\)、\\(A=${s412Vec3(A[0], A[1], A[2])}\\)、\\(B=${s412Vec3(B[0], B[1], B[2])}\\)、\\(C=(${C[0]},${C[1]},k)\\) 四點共平面。求 \\(k\\)。`,
          `\\(k=${C[2]}\\)`,
          `四點中有原點時，共平面等價於 \\(C\\) 可表示成 \\(pA+qB\\)。本題由前兩個坐標可回推出 \\(p=${p}\\)、\\(q=${q}\\)，所以第三坐標 \\(k=${C[2]}\\)。`
        );
      },
      () => {
        const A = [randInt(1, 4), randInt(-3, 3) || 1, randInt(1, 4)];
        const B = [randInt(-3, 3) || 2, randInt(1, 4), randInt(-3, 3) || 1];
        const p = randInt(-2, 4);
        const q = randInt(-2, 4);
        const C = s413Add3(s413Scale3(p, A), s413Scale3(q, B));
        return s331QA(
          `已知 \\(O,A,B,C\\) 四點共平面，且 \\(A=${s412Vec3(A[0], A[1], A[2])}\\)、\\(B=${s412Vec3(B[0], B[1], B[2])}\\)。若 \\(C=pA+qB\\)，其中 \\(p=${p}\\)、\\(q=${q}\\)，求 \\(C\\) 坐標。`,
          `\\(${s412Vec3(C[0], C[1], C[2])}\\)`,
          `通過原點且含 \\(A,B\\) 的平面，可寫成 \\(sA+tB\\)。代入 \\(p,q\\) 逐坐標相加。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421ParallelPlaneDistanceParameterCleanSet(count) {
    const builders = [
      () => {
        const n = s324Pick([
          [1, 2, 2],
          [2, -1, 2],
          [2, 1, 2],
          [1, -2, 2],
        ]);
        const d1 = randInt(-6, 6);
        const distance = randInt(1, 5);
        const len = s412Len3(n);
        const d2 = d1 + distance * Number(len);
        return s331QA(
          `平面 \\(E_1:${s421PlaneTex(n, d1)}\\)。求一個與 \\(E_1\\) 平行且距離為 \\(${distance}\\) 的平面 \\(E_2\\)。`,
          `\\(${s421PlaneTex(n, d2)}\\)`,
          `平行平面法向量相同，距離公式為 \\(\\dfrac{|d_2-d_1|}{|n|}\\)。本題 \\(|n|=${len}\\)，所以可取 \\(d_2=${d2}\\)。`
        );
      },
      () => {
        const n = [2, -1, 2];
        const d1 = randInt(-6, 6);
        const d2 = d1 + 3 * randInt(1, 5);
        return s331QA(
          `求平面 \\(${s421PlaneTex(n, d1)}\\) 與 \\(${s421PlaneTex(n, d2)}\\) 的距離。`,
          `\\(${s331Frac(Math.abs(d2 - d1), 3)}\\)`,
          `兩平面法向量相同，距離為 \\(\\frac{|d_2-d_1|}{\\sqrt{2^2+(-1)^2+2^2}}=\\frac{|${d2}-${d1}|}{3}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421PlaneAngleParameterCleanSet(count) {
    const builders = [
      () => {
        const k0 = randInt(-4, 5);
        const b = randInt(1, 4);
        const a = randInt(-5, 5) || 2;
        const c = -a - b * k0;
        const cText = c >= 0 ? `+${c}` : `${c}`;
        const n2 = [a, b, c];
        return s331QA(
          `設平面 \\(E_1:x+ky+z-2=0\\)、\\(E_2:${s421PlaneTex(n2, randInt(-5, 5))}\\)。求 \\(E_1\\) 與 \\(E_2\\) 垂直時的 \\(k\\)。`,
          `\\(k=${k0}\\)`,
          `兩平面垂直看法向量內積為 0：\\((1,k,1)\\cdot(${a},${b},${c})=0\\)，所以 \\(${a}+${b}k${cText}=0\\)，解得 \\(k=${k0}\\)。`
        );
      },
      () => {
        const k0 = randInt(-4, 5);
        const m = randInt(2, 5);
        const n2 = [m, m * k0, m];
        return s331QA(
          `設 \\(E_1:x+ky+z-2=0\\)，\\(E_2:${s421PlaneTex(n2, randInt(-6, 6))}\\)。求兩平面平行時的 \\(k\\)。`,
          `\\(k=${k0}\\)`,
          `平行平面的法向量成比例。\\(E_2\\) 的法向量是 \\((${m},${m * k0},${m})=${m}(1,${k0},1)\\)，所以 \\(k=${k0}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422LineRelationClassificationCleanSet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [randInt(1, 4), randInt(-3, 3) || 1, randInt(1, 4)];
        const B = s413Add3(A, s422PerpVector(v));
        return s331QA(
          `判斷直線 \\(L_1:${s422LineParamTex(A, v)}\\) 與 \\(L_2:${s422LineParamTex(B, v, 's')}\\) 的位置關係。`,
          `平行但不重合`,
          `方向向量相同，所以兩線平行；但 \\(B\\) 不在 \\(L_1\\) 上，所以不是重合。`
        );
      },
      () => {
        const P = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v1 = [1, 2, 1];
        const v2 = [2, -1, 1];
        const A = s413Sub3(P, v1);
        const B = s413Sub3(P, s413Scale3(2, v2));
        return s331QA(
          `判斷直線 \\(L_1:${s422LineParamTex(A, v1)}\\) 與 \\(L_2:${s422LineParamTex(B, v2, 's')}\\) 的位置關係，若相交求交點。`,
          `相交於 \\(${s412Point('P', P)}\\)`,
          `解 \\(A+t v_1=B+s v_2\\)。本題資料設計成 \\(t=1\\)、\\(s=2\\) 時同為 \\(P\\)。`
        );
      },
      () => {
        const h = randInt(1, 8);
        const A = [0, 0, 0];
        const B = [randInt(-3, 3), randInt(-3, 3), h];
        const v1 = [1, 0, 0];
        const v2 = [0, 1, 0];
        return s331QA(
          `判斷直線 \\(L_1:${s422LineParamTex(A, v1)}\\) 與 \\(L_2:${s422LineParamTex(B, v2, 's')}\\) 的位置關係。`,
          `歪斜線`,
          `方向不平行，且一條在 \\(z=0\\) 水平線、另一條在 \\(z=${h}\\) 的平行水平層中，不會相交，因此為歪斜線。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422LinePlaneHitTimeCleanSet(count) {
    const builders = [
      () => {
        const P = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = s324Pick([
          [1, 2, 2],
          [2, -1, 2],
          [2, 1, -1],
          [1, -2, 2],
        ]);
        const t0 = randInt(2, 6);
        const n = s324Pick([
          [1, -1, 3],
          [2, 1, 1],
          [1, 2, -1],
        ]);
        const hit = s422PointOnLine(P, v, t0);
        const d = s421PlaneFromPointNormal(hit, n);
        return s331QA(
          `質點自 \\(${s412Point('P', P)}\\) 沿方向 \\(${s412Vec3(v[0], v[1], v[2])}\\) 等速前進，位置為 \\(P+t v\\)。求幾秒後到達平面 \\(${s421PlaneTex(n, d)}\\)。`,
          `\\(t=${t0}\\)`,
          `把 \\(P+t v\\) 代入平面方程，得到一次方程。資料設計成 \\(t=${t0}\\) 時剛好落在平面上。`
        );
      },
      () => {
        const P = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [1, 2, 2];
        const n = s422PerpVector(v);
        const d = s421PlaneFromPointNormal(s413Add3(P, n), n);
        return s331QA(
          `質點自 \\(${s412Point('P', P)}\\) 沿方向 \\(${s412Vec3(v[0], v[1], v[2])}\\) 前進。判斷它是否會到達平面 \\(${s421PlaneTex(n, d)}\\)。`,
          `不會`,
          `因為方向向量 \\(v\\) 與平面法向量 \\(n\\) 內積為 0，路徑與平面平行；起點又不在平面上，所以永遠不會到達。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422LinePlaneRelationCleanSet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [randInt(1, 4), randInt(-3, 3) || 1, randInt(1, 4)];
        const n = s422PerpVector(v);
        const d = s421PlaneFromPointNormal(A, n);
        return s331QA(
          `判斷直線 \\(L:${s422LineParamTex(A, v)}\\) 與平面 \\(E:${s421PlaneTex(n, d)}\\) 的關係。`,
          `直線在平面上`,
          `先算 \\(v\\cdot n=0\\)，表示直線方向平行平面；再代入線上一點 \\(A\\) 成立，所以整條直線在平面上。`
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const n = [randInt(1, 4), randInt(-3, 3) || 1, randInt(1, 4)];
        const d = s421PlaneFromPointNormal(A, n);
        return s331QA(
          `判斷直線 \\(L:${s422LineParamTex(A, n)}\\) 與平面 \\(E:${s421PlaneTex(n, d)}\\) 的關係。`,
          `垂直且交於 \\(${s412Point('A', A)}\\)`,
          `直線方向向量就是平面法向量，所以直線垂直平面；又 \\(A\\) 在平面上，所以交點為 \\(A\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422PointLineReflectionCleanSet(count) {
    const builders = [
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = s324Pick([
          [1, 2, 2],
          [2, -1, 2],
          [3, 0, 4],
          [2, 2, 1],
        ]);
        const t = randInt(-2, 4);
        const h = randInt(1, 4);
        const w = s422PerpVector(v);
        const H = s422PointOnLine(A, v, t);
        const P = s413Add3(H, s413Scale3(h, w));
        const R = s413Sub3(s413Scale3(2, H), P);
        return s331QA(
          `已知點 \\(${s412Point('P', P)}\\) 與直線 \\(L:${s422LineParamTex(A, v)}\\)。求 \\(P\\) 對 \\(L\\) 的對稱點。`,
          `\\(${s412Point('P\\prime', R)}\\)`,
          `先求垂足 \\(H\\)。本題資料設計成 \\(H=${s412Vec3(H[0], H[1], H[2])}\\)，再用 \\(P'=2H-P\\)。`
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const v = [1, 1, 1];
        const P = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
        const dot = s412Dot3(s413Sub3(P, A), v);
        const H = [
          s331Frac(3 * A[0] + dot, 3),
          s331Frac(3 * A[1] + dot, 3),
          s331Frac(3 * A[2] + dot, 3),
        ];
        return s331QA(
          `求點 \\(${s412Point('P', P)}\\) 在直線 \\(L:${s422LineParamTex(A, v)}\\) 上的垂足坐標。`,
          `\\(H(${H.join(',')})\\)`,
          `令垂足 \\(H=A+t(1,1,1)\\)，由 \\((P-H)\\cdot(1,1,1)=0\\) 求出 \\(t\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421PlaneSystemConsistencyCleanSet(count) {
    const pairPool = [
      { n1: [1, 1, 0], n2: [0, 1, 1] },
      { n1: [1, 0, 1], n2: [1, 1, 0] },
      { n1: [2, 1, 0], n2: [1, 0, 1] },
      { n1: [1, 2, 0], n2: [0, 1, 1] },
    ];
    const builders = [
      () => {
        const { n1, n2 } = s324Pick(pairPool);
        const P = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const d1 = s421PlaneFromPointNormal(P, n1);
        const d2 = s421PlaneFromPointNormal(P, n2);
        const r = randInt(1, 3);
        const s = randInt(1, 3);
        const n3 = [
          r * n1[0] + s * n2[0],
          r * n1[1] + s * n2[1],
          r * n1[2] + s * n2[2],
        ];
        const k = r * d1 + s * d2;
        return s331QA(
          `三平面 \\(E_1:${s421PlaneTex(n1, d1)}\\)、\\(E_2:${s421PlaneTex(n2, d2)}\\)、\\(E_3:${s421PlaneTex(n3, 0).replace('=0', '+k=0')}\\)。若三平面共同交集為同一直線，求 \\(k\\)。`,
          `\\(k=${k}\\)`,
          `前兩平面交於一直線。第三平面要也包含此交線，方程式必須是前兩式的線性組合。本題 \\(n_3=${r}n_1+${s}n_2\\)，所以常數項也要 \\(k=${r}d_1+${s}d_2=${k}\\)。`
        );
      },
      () => {
        const { n1, n2 } = s324Pick(pairPool);
        const P = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const d1 = s421PlaneFromPointNormal(P, n1);
        const d2 = s421PlaneFromPointNormal(P, n2);
        const r = randInt(2, 4);
        const s = -randInt(1, 3);
        const n3 = [
          r * n1[0] + s * n2[0],
          r * n1[1] + s * n2[1],
          r * n1[2] + s * n2[2],
        ];
        const k = r * d1 + s * d2;
        return s331QA(
          `若方程組 \\(E_1:${s421PlaneTex(n1, d1)}\\)、\\(E_2:${s421PlaneTex(n2, d2)}\\)、\\(E_3:${s421PlaneTex(n3, 0).replace('=0', '+k=0')}\\) 有無限多解且解集合為一直線，求 \\(k\\)。`,
          `\\(k=${k}\\)`,
          `三個平面要共線相交時，第三個平面需包含 \\(E_1,E_2\\) 的交線。因為 \\(n_3=${r}n_1${s >= 0 ? '+' : ''}${s}n_2\\)，常數項同步做同樣組合，得 \\(k=${r}d_1${s >= 0 ? '+' : ''}${s}d_2=${k}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS421SegmentProjectionLengthCleanSet(count) {
    const dataPool = [
      { n: [1, 1, 1], p: [1, -1, 0] },
      { n: [2, -1, 2], p: [1, 0, -1] },
      { n: [1, 2, -1], p: [2, -1, 0] },
      { n: [1, -2, 2], p: [2, 1, 0] },
      { n: [2, 1, -2], p: [1, 0, 1] },
    ];
    const builders = [
      () => {
        const { n, p } = s324Pick(dataPool);
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const q = randInt(1, 4);
        const v = s413Add3(p, s413Scale3(q, n));
        const B = s413Add3(A, v);
        const H = [randInt(-2, 2), randInt(-2, 2), randInt(-2, 2)];
        const d = s421PlaneFromPointNormal(H, n);
        return s331QA(
          `已知 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)，求線段 \\(AB\\) 在平面 \\(E:${s421PlaneTex(n, d)}\\) 上的正射影長。`,
          `\\(${s412Len3(p)}\\)`,
          `把 \\(\\overrightarrow{AB}\\) 分解成平行平面與垂直平面的部分。此題 \\(\\overrightarrow{AB}=${s412Vec3(v[0], v[1], v[2])}=${s412Vec3(p[0], p[1], p[2])}+${q}${s412Vec3(n[0], n[1], n[2])}\\)，投影到平面後只留下平行平面的部分，長度為 \\(${s412Len3(p)}\\)。`
        );
      },
      () => {
        const { n, p } = s324Pick(dataPool);
        const multiplier = randInt(2, 4);
        const A = [randInt(-2, 2), randInt(-2, 2), randInt(-2, 2)];
        const q = randInt(1, 3);
        const parallelPart = s413Scale3(multiplier, p);
        const v = s413Add3(parallelPart, s413Scale3(q, n));
        const B = s413Add3(A, v);
        const d = randInt(-5, 5);
        return s331QA(
          `線段 \\(AB\\) 的端點為 \\(${s412Point('A', A)}\\)、\\(${s412Point('B', B)}\\)。求 \\(AB\\) 正射影到平面 \\(${s421PlaneTex(n, d)}\\) 後的長度。`,
          `\\(${s412Len3(parallelPart)}\\)`,
          `平面法向量為 \\(n=${s412Vec3(n[0], n[1], n[2])}\\)。本題 \\(\\overrightarrow{AB}\\) 的平面內分量為 \\(${s412Vec3(parallelPart[0], parallelPart[1], parallelPart[2])}\\)，因為它與 \\(n\\) 內積為 0，所以投影長為 \\(${s412Len3(parallelPart)}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422TwoPlaneLineParamCleanSet(count) {
    const pairPool = [
      { n1: [1, 1, 0], n2: [0, 1, 1] },
      { n1: [1, 0, 1], n2: [1, 1, 0] },
      { n1: [2, 1, 0], n2: [1, 0, 1] },
      { n1: [1, 2, 0], n2: [0, 1, 1] },
    ];
    const builders = [
      () => {
        const { n1, n2 } = s324Pick(pairPool);
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const d1 = s421PlaneFromPointNormal(A, n1);
        const d2 = s421PlaneFromPointNormal(A, n2);
        const v = s414Cross(n1, n2);
        return s331QA(
          `直線 \\(L\\) 為兩平面 \\(E_1:${s421PlaneTex(n1, d1)}\\)、\\(E_2:${s421PlaneTex(n2, d2)}\\) 的交線。求 \\(L\\) 的一組參數式。`,
          `\\(${s422LineParamTex(A, v)}\\)`,
          `交線方向向量為 \\(n_1\\times n_2=${s412Vec3(v[0], v[1], v[2])}\\)。又 \\(${s412Point('A', A)}\\) 同時滿足兩平面，所以可寫成 \\(A+t(n_1\\times n_2)\\)。`
        );
      },
      () => {
        const { n1, n2 } = s324Pick(pairPool);
        const A = [randInt(-2, 4), randInt(-2, 4), randInt(-2, 4)];
        const d1 = s421PlaneFromPointNormal(A, n1);
        const d2 = s421PlaneFromPointNormal(A, n2);
        const v = s414Cross(n1, n2);
        const sum = v[0] + v[1] + v[2];
        return s331QA(
          `兩平面 \\(${s421PlaneTex(n1, d1)}\\)、\\(${s421PlaneTex(n2, d2)}\\) 的交線方向向量可取 \\((a,b,c)\\)。求 \\(a+b+c\\)。`,
          `\\(${sum}\\)`,
          `交線方向向量為兩法向量外積：\\((a,b,c)=n_1\\times n_2=${s412Vec3(v[0], v[1], v[2])}\\)，因此 \\(a+b+c=${sum}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422CoplanarPerpendicularLineCleanSet(count) {
    const dataPool = [
      { v: [1, 2, 2], w: [2, -1, 0] },
      { v: [2, -1, 2], w: [1, 2, 0] },
      { v: [1, 1, 1], w: [1, -1, 0] },
      { v: [2, 1, -2], w: [1, 0, 1] },
      { v: [1, -2, 2], w: [2, 1, 0] },
    ];
    const builders = [
      () => {
        const { v, w } = s324Pick(dataPool);
        const A = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const t0 = randInt(-2, 3);
        const h = randInt(1, 4);
        const H = s422PointOnLine(A, v, t0);
        const P = s413Add3(H, s413Scale3(h, w));
        return s331QA(
          `直線 \\(L:${s422LineParamTex(A, v)}\\)，點 \\(${s412Point('P', P)}\\) 不在 \\(L\\) 上。求過 \\(P\\)、與 \\(L\\) 共平面且垂直於 \\(L\\) 的直線方程式。`,
          `\\(${s422LineParamTex(P, w)}\\)`,
          `在 \\(L\\) 上找垂足 \\(H\\)。本題資料設計成 \\(H=${s412Vec3(H[0], H[1], H[2])}\\)，且 \\(\\overrightarrow{HP}=${s412Vec3(h * w[0], h * w[1], h * w[2])}\\) 與 \\(L\\) 的方向向量內積為 0，所以所求直線方向可取 \\(${s412Vec3(w[0], w[1], w[2])}\\)。`
        );
      },
      () => {
        const { v, w } = s324Pick(dataPool);
        const A = [randInt(-2, 2), randInt(-2, 2), randInt(-2, 2)];
        const t0 = randInt(1, 4);
        const H = s422PointOnLine(A, v, t0);
        const P = s413Add3(H, w);
        return s331QA(
          `已知 \\(L:${s422LineParamTex(A, v)}\\)，若過 \\(${s412Point('P', P)}\\) 作一直線 \\(m\\)，使 \\(m\\) 與 \\(L\\) 共面且互相垂直，求 \\(m\\) 與 \\(L\\) 的交點。`,
          `\\(${s412Point('H', H)}\\)`,
          `共面且垂直時，交點就是 \\(P\\) 到 \\(L\\) 的垂足。檢查 \\(H=A+${t0}v=${s412Vec3(H[0], H[1], H[2])}\\)，且 \\((P-H)\\cdot v=0\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422LineProjectionOnPlaneCleanSet(count) {
    const dataPool = [
      { n: [1, 1, 1], p: [1, -1, 0] },
      { n: [2, -1, 2], p: [1, 0, -1] },
      { n: [1, 2, -1], p: [2, -1, 0] },
      { n: [1, -2, 2], p: [2, 1, 0] },
    ];
    const builders = [
      () => {
        const { n, p } = s324Pick(dataPool);
        const H = [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)];
        const r = randInt(1, 3);
        const q = randInt(1, 4);
        const A = s413Add3(H, s413Scale3(r, n));
        const v = s413Add3(p, s413Scale3(q, n));
        const d = s421PlaneFromPointNormal(H, n);
        return s331QA(
          `求直線 \\(L:${s422LineParamTex(A, v)}\\) 正射影到平面 \\(E:${s421PlaneTex(n, d)}\\) 上的投影直線方程式。`,
          `\\(${s422LineParamTex(H, p)}\\)`,
          `先把 \\(L\\) 上一點 \\(A\\) 投影到平面，得 \\(H=${s412Vec3(H[0], H[1], H[2])}\\)。再把方向向量 \\(v\\) 扣掉法向量方向的分量，留下平面內方向 \\(${s412Vec3(p[0], p[1], p[2])}\\)，所以投影直線為 \\(H+tp\\)。`
        );
      },
      () => {
        const { n, p } = s324Pick(dataPool);
        const H = [randInt(-2, 2), randInt(-2, 2), randInt(-2, 2)];
        const A = s413Add3(H, s413Scale3(randInt(1, 4), n));
        const q = randInt(2, 5);
        const v = s413Add3(s413Scale3(2, p), s413Scale3(q, n));
        const d = s421PlaneFromPointNormal(H, n);
        return s331QA(
          `直線 \\(L:${s422LineParamTex(A, v)}\\) 投影到平面 \\(${s421PlaneTex(n, d)}\\) 後，方向向量可取何者？`,
          `\\(${s412Vec3(p[0], p[1], p[2])}\\)`,
          `投影後方向只保留與平面平行的分量。本題 \\(v=2${s412Vec3(p[0], p[1], p[2])}+${q}${s412Vec3(n[0], n[1], n[2])}\\)，法向量分量會被壓掉，所以方向可取 \\(${s412Vec3(p[0], p[1], p[2])}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS422CoordinateLineMixedSet(count) {
    return buildS223MixedSet(
      [buildS422LineEquationBasicSet, buildS422PierceCoordinatePlaneSet, buildS422ParameterConstraintSet],
      count
    );
  }

  function buildS422RelationDistanceMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS422LinePlaneInteractionSet,
        buildS422PointLineProjectionSet,
        buildS422ParallelSkewDistanceSet,
        buildS422CommonPerpendicularSet,
      ],
      count
    );
  }

  function buildS422AdvancedLineMixedSet(count) {
    return buildS223MixedSet(
      [buildS422MovingPointExtremaSet, buildS422PlaneContainingLineSet, buildS422LinePlaneInteractionSet],
      count
    );
  }

  function s431C(n, r) {
    if (r < 0 || r > n) return 0;
    r = Math.min(r, n - r);
    let value = 1;
    for (let i = 1; i <= r; i += 1) value = (value * (n - r + i)) / i;
    return Math.round(value);
  }

  function s431Frac(numer, denom) {
    return s421Frac(numer, denom);
  }

  function s431Percent(p) {
    return `${p}\\%`;
  }

  function s431Answer(numer, denom) {
    return `\\(${s431Frac(numer, denom)}\\)`;
  }

  function buildS431ConditionalAlgebraSet(count) {
    const builders = [
      () => {
        const total = 120;
        const b = randInt(30, 70);
        const a = randInt(b, 90);
        const inter = randInt(10, b - 5);
        return s331QA(
          `已知 \\(P(A)=${s431Frac(a, total)}\\)、\\(P(B)=${s431Frac(b, total)}\\)、\\(P(A\\cap B)=${s431Frac(inter, total)}\\)，求 \\(P(A|B)\\)。`,
          s431Answer(inter, b),
          `方法：條件機率就是把樣本空間縮成 \\(B\\)，所以 \\(P(A|B)=\\frac{P(A\\cap B)}{P(B)}\\)。`
        );
      },
      () => {
        const total = 120;
        const a = randInt(30, 70);
        const b = randInt(30, 70);
        const inter = randInt(10, Math.min(a, b) - 2);
        const union = a + b - inter;
        return s331QA(
          `設 \\(A,B\\) 為兩事件，已知 \\(P(A)=${s431Frac(a, total)}\\)、\\(P(B)=${s431Frac(b, total)}\\)、\\(P(A\\cup B)=${s431Frac(union, total)}\\)，求 \\(P(B|A)\\)。`,
          s431Answer(inter, a),
          `方法：先用 \\(P(A\\cap B)=P(A)+P(B)-P(A\\cup B)\\)，再除以 \\(P(A)\\)。`
        );
      },
      () => {
        const total = 100;
        const a = randInt(35, 65);
        const b = randInt(30, 60);
        const inter = randInt(8, Math.min(a, b) - 5);
        const neither = total - (a + b - inter);
        return s331QA(
          `已知 \\(P(A)=${s431Frac(a, total)}\\)、\\(P(B)=${s431Frac(b, total)}\\)，且 \\(P(A'\\cap B')=${s431Frac(neither, total)}\\)，求 \\(P(A|B)\\)。`,
          s431Answer(inter, b),
          `方法：\\(P(A\\cup B)=1-P(A'\\cap B')\\)，接著用聯集公式求交集。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431ConcreteConditionSet(count) {
    const builders = [
      () => {
        const first = randInt(1, 6);
        const target = first + randInt(1, 6);
        return s331QA(
          `連續投擲一顆公正骰子兩次，已知第一次點數為 \\(${first}\\)，求兩次點數和為 \\(${target}\\) 的機率。`,
          s431Answer(1, 6),
          `方法：已知第一次後，只剩第二次有 6 種等可能結果。`
        );
      },
      () => {
        const tosses = randInt(3, 5);
        const atLeast = randInt(1, tosses - 1);
        let favorable = 0;
        for (let r = atLeast - 1; r <= tosses - 1; r += 1) favorable += s431C(tosses - 1, r);
        return s331QA(
          `投擲一枚公正硬幣 \\(${tosses}\\) 次，已知第一次為正面，求至少出現 \\(${atLeast}\\) 次正面的機率。`,
          s431Answer(favorable, 2 ** (tosses - 1)),
          `方法：已知第一次正面後，只需在剩下 \\(${tosses - 1}\\) 次中計算還需要多少個正面。`
        );
      },
      () => {
        const kids = randInt(2, 4);
        return s331QA(
          `某家庭有 \\(${kids}\\) 個小孩，已知至少有一個女孩，求全都是女孩的機率。`,
          s431Answer(1, 2 ** kids - 1),
          `方法：已知「至少一個女孩」會排除全男一種情形，條件樣本空間剩 \\(2^n-1\\) 種。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431DrawingSamplingSet(count) {
    const builders = [
      () => {
        const white = randInt(3, 7);
        const black = randInt(4, 8);
        const totalAtLeastWhite = s431C(white + black, 3) - s431C(black, 3);
        const favorable = white * s431C(black, 2);
        return s331QA(
          `一袋中有 \\(${white}\\) 顆白球、\\(${black}\\) 顆黑球，連續取出三球（不放回）。在取出三球中至少有一顆白球的條件下，求第一次取到白球且後兩球皆為黑球的機率。`,
          s431Answer(favorable, totalAtLeastWhite),
          `方法：條件事件是「三球不全黑」；分子是白、黑、黑的組合情形。`
        );
      },
      () => {
        const red = randInt(3, 6);
        const white = randInt(3, 6);
        const black = randInt(4, 8);
        const total = s431C(red + white + black, 3);
        const allSame = s431C(red, 3) + s431C(white, 3) + s431C(black, 3);
        const favorable = white * s431C(red + black, 2);
        return s331QA(
          `袋中有 \\(${red}\\) 紅球、\\(${white}\\) 白球、\\(${black}\\) 黑球，取出三球（不放回）。已知三球不全同色，求其中恰有一顆白球的機率。`,
          s431Answer(favorable, total - allSame),
          `方法：先排除全同色作為條件樣本空間，再計算恰一白的組合數。`
        );
      },
      () => {
        const red = randInt(3, 6);
        const white = randInt(3, 6);
        return s331QA(
          `袋中有 \\(${red}\\) 紅球、\\(${white}\\) 白球，放回抽球兩次。已知第一次抽到紅球，求第二次抽到白球的機率。`,
          s431Answer(white, red + white),
          `方法：放回抽樣會重置袋中比例，所以第二次仍看原本白球比例。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431SocialTableSet(count) {
    const builders = [
      () => {
        const mathFail = randInt(15, 30);
        const engFail = randInt(12, 28);
        const both = randInt(4, Math.min(mathFail, engFail) - 2);
        return s331QA(
          `某班期中考，數學不及格占 \\(${s431Percent(mathFail)}\\)，英文不及格占 \\(${s431Percent(engFail)}\\)，兩科都不及格占 \\(${s431Percent(both)}\\)。已知某生數學不及格，求他英文也不及格的機率。`,
          s431Answer(both, mathFail),
          `方法：把「數學不及格」當作新的樣本空間，分子取兩科都不及格。`
        );
      },
      () => {
        const speakJ = randInt(30, 50);
        const speakF = randInt(25, 45);
        const both = randInt(8, Math.min(speakJ, speakF) - 3);
        const neither = 100 - speakJ - speakF + both;
        return s331QA(
          `調查顯示 \\(${s431Percent(speakJ)}\\) 學生會日語，\\(${s431Percent(speakF)}\\) 會法語，兩者都不會占 \\(${s431Percent(neither)}\\)。已知某生會日語，求他也會法語的機率。`,
          s431Answer(both, speakJ),
          `方法：先用 \\(P(J\\cap F)=P(J)+P(F)-P(J\\cup F)\\)，其中 \\(P(J\\cup F)=1-P(兩者都不會)\\)。`
        );
      },
      () => {
        const diseaseA = randInt(8, 16);
        const diseaseB = randInt(7, 14);
        const both = randInt(2, Math.min(diseaseA, diseaseB) - 1);
        return s331QA(
          `某地區人口中有眼疾者占 \\(${s431Percent(diseaseA)}\\)，有牙疾者占 \\(${s431Percent(diseaseB)}\\)，二者兼有者占 \\(${s431Percent(both)}\\)。選出一人，已知患有眼疾，求也患有牙疾的機率。`,
          s431Answer(both, diseaseA),
          `方法：社會統計比例題仍是條件機率，分母換成已知族群。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431DiagnosticBayesSet(count) {
    const builders = [
      () => {
        const prevalence = randInt(1, 8);
        const sensitivity = randInt(85, 98);
        const falsePositive = randInt(2, 12);
        const numerator = prevalence * sensitivity;
        const denominator = numerator + (100 - prevalence) * falsePositive;
        return s331QA(
          `某疾病盛行率為 \\(${s431Percent(prevalence)}\\)，檢驗對患者呈陽性的機率為 \\(${s431Percent(sensitivity)}\\)，對健康者誤判為陽性的機率為 \\(${s431Percent(falsePositive)}\\)。若檢驗結果為陽性，求實際患病的機率。`,
          s431Answer(numerator, denominator),
          `方法：貝氏定理的分子是「患病且陽性」，分母是所有會呈陽性的來源總和。`
        );
      },
      () => {
        const defect = randInt(2, 8);
        const hit = randInt(85, 96);
        const falseAlarm = randInt(3, 10);
        const numerator = (100 - defect) * (100 - falseAlarm);
        const denominator = numerator + defect * (100 - hit);
        return s331QA(
          `某產品不良率為 \\(${s431Percent(defect)}\\)，檢測器對不良品判為不良的機率為 \\(${s431Percent(hit)}\\)，對良品誤判為不良的機率為 \\(${s431Percent(falseAlarm)}\\)。若檢測結果為良品，求實際為良品的機率。`,
          s431Answer(numerator, denominator),
          `方法：題目問「檢測為良品後真的良品」，分母要合併良品被判良與不良品漏判兩種來源。`
        );
      },
      () => {
        const rateA = randInt(20, 50);
        const badA = randInt(1, 6);
        const badB = randInt(2, 9);
        const numerator = rateA * badA;
        const denominator = numerator + (100 - rateA) * badB;
        return s331QA(
          `某工廠由甲、乙兩條產線生產，甲產量占 \\(${s431Percent(rateA)}\\)，乙占 \\(${s431Percent(100 - rateA)}\\)。甲不良率 \\(${s431Percent(badA)}\\)，乙不良率 \\(${s431Percent(badB)}\\)。任取一件為不良品，求其來自甲產線的機率。`,
          s431Answer(numerator, denominator),
          `方法：這也是來源反推，分子是甲且不良，分母是所有不良品來源。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431MultiSourceSet(count) {
    const builders = [
      () => {
        const a = randInt(3, 7);
        const b = randInt(4, 8);
        const c = randInt(5, 9);
        const aw = randInt(1, a - 1);
        const bw = randInt(1, b - 1);
        const cw = randInt(1, c - 1);
        const numerator = aw * b * c;
        const denominator = aw * b * c + bw * a * c + cw * a * b;
        return s331QA(
          `甲袋有 \\(${aw}\\) 白 \\(${a - aw}\\) 紅，乙袋有 \\(${bw}\\) 白 \\(${b - bw}\\) 紅，丙袋有 \\(${cw}\\) 白 \\(${c - cw}\\) 紅。隨機選一袋再取一球，已知取到白球，求來自甲袋的機率。`,
          s431Answer(numerator, denominator),
          `方法：先選來源再取樣；已知白球後，用各來源產生白球的權重反推。`
        );
      },
      () => {
        const pA = randInt(20, 45);
        const pB = randInt(20, 45);
        const pC = 100 - pA - pB;
        const dA = randInt(1, 6);
        const dB = randInt(2, 8);
        const dC = randInt(3, 9);
        const numerator = pB * dB;
        const denominator = pA * dA + pB * dB + pC * dC;
        return s331QA(
          `倉庫中 A、B、C 三家工廠產品比例為 \\(${s431Percent(pA)}\\)、\\(${s431Percent(pB)}\\)、\\(${s431Percent(pC)}\\)，不良率分別為 \\(${s431Percent(dA)}\\)、\\(${s431Percent(dB)}\\)、\\(${s431Percent(dC)}\\)。任取一件為不良品，求來自 B 廠的機率。`,
          s431Answer(numerator, denominator),
          `方法：多來源題先列出每個來源產生目標結果的權重，再用該來源權重除以總權重。`
        );
      },
      () => {
        const pA = randInt(50, 80);
        const pB = randInt(40, 70);
        const pC = randInt(30, 60);
        const numerator = pA * (100 - pB) * (100 - pC);
        const denominator = numerator + (100 - pA) * pB * (100 - pC) + (100 - pA) * (100 - pB) * pC + pA * pB * pC;
        return s331QA(
          `三名射手 A、B、C 命中率分別為 \\(${s431Percent(pA)}\\)、\\(${s431Percent(pB)}\\)、\\(${s431Percent(pC)}\\)。三人各射一發，已知恰有一人命中，求命中者是 A 的機率。`,
          s431Answer(numerator, denominator),
          `方法：已知「恰一人命中」後，分母只加總三種單人命中的情形。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431IndependentInferenceSet(count) {
    const builders = [
      () => {
        const pA = randInt(20, 50);
        const pB = randInt(20, 50);
        const pC = randInt(20, 50);
        const numeratorA = pA * (100 - pB) * (100 - pC) + pA * pB * pC;
        const denominator =
          pA * (100 - pB) * (100 - pC) + (100 - pA) * pB * (100 - pC) + (100 - pA) * (100 - pB) * pC + pA * pB * pC;
        return s331QA(
          `甲、乙、丙三人譯出密碼的機率分別為 \\(${s431Percent(pA)}\\)、\\(${s431Percent(pB)}\\)、\\(${s431Percent(pC)}\\)。已知密碼由奇數人譯出，求甲有譯出的機率。`,
          s431Answer(numeratorA, denominator),
          `方法：獨立事件要把每種成功失敗組合乘起來；條件事件只保留符合描述的結果。`
        );
      },
      () => {
        const failA = randInt(5, 20);
        const failB = randInt(5, 20);
        const numerator = failB * (100 - failA);
        const denominator = failA * (100 - failB) + numerator;
        return s331QA(
          `某系統由兩個獨立組件組成，甲失效機率 \\(${s431Percent(failA)}\\)，乙失效機率 \\(${s431Percent(failB)}\\)。已知剛好一個組件失效，求乙失效的機率。`,
          s431Answer(numerator, denominator),
          `方法：剛好一個失效有兩種互斥來源：甲失乙好、乙失甲好。`
        );
      },
      () => {
        const pC = randInt(40, 80);
        return s331QA(
          `三名射手 A、B、C 獨立射擊。已知 A、B 都命中，且 C 的命中率為 \\(${s431Percent(pC)}\\)，求 C 沒命中的機率。`,
          s431Answer(100 - pC, 100),
          `方法：獨立時，已知 A、B 命中不會改變 C 的命中或未命中機率。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431SequenceTransitionSet(count) {
    const builders = [
      () => {
        const staySunny = randInt(60, 85);
        const rainToSunny = randInt(30, 60);
        const startSunny = randInt(50, 80);
        const day2Sunny = startSunny * staySunny + (100 - startSunny) * rainToSunny;
        return s331QA(
          `某地今日晴天機率為 \\(${s431Percent(startSunny)}\\)。若晴天隔天仍晴的機率為 \\(${s431Percent(staySunny)}\\)，雨天隔天轉晴的機率為 \\(${s431Percent(rainToSunny)}\\)，求明天晴天的機率。`,
          s431Answer(day2Sunny, 10000),
          `方法：狀態轉移題把「今日晴再到明日晴」與「今日雨再到明日晴」兩條路徑相加。`
        );
      },
      () => {
        const pAB = randInt(50, 80);
        const pBA = randInt(20, 50);
        const firstA = randInt(40, 70);
        const afterA = firstA * (100 - pAB) + (100 - firstA) * pBA;
        return s331QA(
          `某質點在 A、B 兩點移動，若在 A 下一次到 B 的機率為 \\(${s431Percent(pAB)}\\)，在 B 下一次到 A 的機率為 \\(${s431Percent(pBA)}\\)。已知初始在 A 的機率為 \\(${s431Percent(firstA)}\\)，求移動一次後在 A 的機率。`,
          s431Answer(afterA, 10000),
          `方法：分路徑計算「原本在 A 且留在 A」加上「原本在 B 且移到 A」。`
        );
      },
      () => {
        const liePrior = randInt(20, 60);
        const sayLieIfLie = randInt(60, 90);
        const sayLieIfTruth = randInt(10, 35);
        const numerator = liePrior * sayLieIfLie;
        const denominator = numerator + (100 - liePrior) * sayLieIfTruth;
        return s331QA(
          `某人說謊機率為 \\(${s431Percent(liePrior)}\\)。若真的說謊時，被判定說謊的機率為 \\(${s431Percent(sayLieIfLie)}\\)；若說真話時，被誤判說謊的機率為 \\(${s431Percent(sayLieIfTruth)}\\)。已知被判定說謊，求真的說謊機率。`,
          s431Answer(numerator, denominator),
          `方法：這是轉移後反推原狀態，使用貝氏定理。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431StratifiedStatsSet(count) {
    const builders = [
      () => {
        const male = randInt(45, 65);
        const female = 100 - male;
        const maleRate = randInt(20, 45);
        const femaleRate = randInt(5, 25);
        const numerator = female * femaleRate;
        const denominator = male * maleRate + numerator;
        return s331QA(
          `某城市中男性占 \\(${s431Percent(male)}\\)，女性占 \\(${s431Percent(female)}\\)。男性中抽菸比例為 \\(${s431Percent(maleRate)}\\)，女性為 \\(${s431Percent(femaleRate)}\\)。任選一名抽菸者，求其為女性的機率。`,
          s431Answer(numerator, denominator),
          `方法：分層統計要先乘上族群比例，再做條件反推。`
        );
      },
      () => {
        const read = randInt(55, 75);
        const passRead = randInt(75, 95);
        const passNo = randInt(10, 35);
        const denominator = read * passRead + (100 - read) * passNo;
        return s331QA(
          `某次考試有讀書者占 \\(${s431Percent(read)}\\)，其及格率為 \\(${s431Percent(passRead)}\\)；未讀書者及格率為 \\(${s431Percent(passNo)}\\)。選一名及格者，求其為沒讀書者的機率。`,
          s431Answer((100 - read) * passNo, denominator),
          `方法：已知及格後，分母是所有及格來源，分子取未讀書且及格。`
        );
      },
      () => {
        const a = randInt(20, 45);
        const b = randInt(20, 45);
        const c = 100 - a - b;
        const ra = randInt(3, 12);
        const rb = randInt(3, 12);
        const rc = randInt(3, 12);
        return s331QA(
          `工安事故統計：酒駕占 \\(${s431Percent(a)}\\)，疲勞駕駛占 \\(${s431Percent(b)}\\)，其他占 \\(${s431Percent(c)}\\)。三類造成重傷的機率分別為 \\(${s431Percent(ra)}\\)、\\(${s431Percent(rb)}\\)、\\(${s431Percent(rc)}\\)。已知發生重傷事故，求其為酒駕造成的機率。`,
          s431Answer(a * ra, a * ra + b * rb + c * rc),
          `方法：加權分層後再條件化，不能只比較重傷率，還要乘上各類比例。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }


  // ── s4-3-1 新增：補事件條件機率 P(A|B^c) ────────────────
  function buildS431ComplementConditionalSet(count) {
    const builders = [
      () => {
        // 直接給 P(A), P(B), P(A∩B)，求 P(A|B^c)
        const total = 100;
        const pA = randInt(30, 70);
        const pB = randInt(30, 70);
        const maxInter = Math.min(pA, pB) - 2;
        const pAB = randInt(5, maxInter);
        // P(A|B^c) = (P(A) - P(A∩B)) / (1 - P(B))
        const numer = pA - pAB;
        const denom = total - pB;
        return s331QA(
          `已知 \\(P(A)=${s431Frac(pA, total)}\\)、\\(P(B)=${s431Frac(pB, total)}\\)、\\(P(A\\cap B)=${s431Frac(pAB, total)}\\)，求 \\(P(A|B^c)\\)。`,
          s431Answer(numer, denom),
          `方法：\\(P(A|B^c)=\\dfrac{P(A\\cap B^c)}{P(B^c)}=\\dfrac{P(A)-P(A\\cap B)}{1-P(B)}\\)。`
        );
      },
      () => {
        // 給 P(A), P(B), P(A∩B)，求 P(B|A^c)
        const total = 100;
        const pA = randInt(30, 70);
        const pB = randInt(30, 70);
        const maxInter = Math.min(pA, pB) - 2;
        const pAB = randInt(5, maxInter);
        // P(B|A^c) = (P(B) - P(A∩B)) / (1 - P(A))
        const numer = pB - pAB;
        const denom = total - pA;
        return s331QA(
          `設 \\(A,B\\) 為兩事件，已知 \\(P(A)=${s431Frac(pA, total)}\\)、\\(P(B)=${s431Frac(pB, total)}\\)、\\(P(A\\cap B)=${s431Frac(pAB, total)}\\)，求 \\(P(B|A^c)\\)。`,
          s431Answer(numer, denom),
          `方法：\\(P(B|A^c)=\\dfrac{P(A^c\\cap B)}{P(A^c)}=\\dfrac{P(B)-P(A\\cap B)}{1-P(A)}\\)。`
        );
      },
      () => {
        // 給 P(A), P(A∪B), P(A∩B) via P(B) derived，求 P(A^c|B^c)
        const total = 100;
        const pA = randInt(30, 65);
        const pB = randInt(30, 65);
        const maxInter = Math.min(pA, pB) - 2;
        const pAB = randInt(5, maxInter);
        const pAuB = pA + pB - pAB;
        // P(A^c ∩ B^c) = 1 - P(A∪B) = 1 - pAuB/100
        // P(B^c) = 1 - pB/100
        // P(A^c | B^c) = P(A^c∩B^c)/P(B^c) = (100-pAuB)/(100-pB)
        const numer = total - pAuB;
        const denom = total - pB;
        return s331QA(
          `設 \\(P(A)=${s431Frac(pA, total)}\\)、\\(P(B)=${s431Frac(pB, total)}\\)、\\(P(A\\cap B)=${s431Frac(pAB, total)}\\)，求 \\(P(A^c|B^c)\\)。`,
          s431Answer(numer, denom),
          `方法：\\(P(A^c\\cap B^c)=P((A\\cup B)^c)=1-P(A\\cup B)\\)；分母 \\(P(B^c)=1-P(B)\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  // ── s4-3-1 新增：全機率公式抽象樹形 ──────────────────────
  function buildS431TotalProbAbstractSet(count) {
    const builders = [
      () => {
        // 給 P(A), P(B|A), P(B|A^c)，求 P(B)
        const pA = randInt(20, 70);
        const pBgA = randInt(40, 90);
        const pBgAc = randInt(10, 50);
        // P(B) = pA * pBgA + (100-pA) * pBgAc   / 10000
        const numer = pA * pBgA + (100 - pA) * pBgAc;
        return s331QA(
          `設 \\(P(A)=${s431Frac(pA, 100)}\\)、\\(P(B|A)=${s431Frac(pBgA, 100)}\\)、\\(P(B|A^c)=${s431Frac(pBgAc, 100)}\\)，求 \\(P(B)\\)。`,
          s431Answer(numer, 10000),
          `方法：全機率公式 \\(P(B)=P(A)P(B|A)+P(A^c)P(B|A^c)\\)。`
        );
      },
      () => {
        // 給 P(A), P(B|A), P(B|A^c)，求 P(A|B)（全機率公式再反推）
        const pA = randInt(20, 60);
        const pBgA = randInt(50, 90);
        const pBgAc = randInt(5, 35);
        const totalPB = pA * pBgA + (100 - pA) * pBgAc;
        const numer = pA * pBgA;
        // P(A|B) = P(A)P(B|A) / P(B)
        return s331QA(
          `設 \\(P(A)=${s431Frac(pA, 100)}\\)、\\(P(B|A)=${s431Frac(pBgA, 100)}\\)、\\(P(B|A^c)=${s431Frac(pBgAc, 100)}\\)，先求 \\(P(B)\\)，再求 \\(P(A|B)\\)。`,
          `\\(P(B)=${s431Frac(totalPB, 10000)}\\)；\\(P(A|B)=${s431Frac(numer, totalPB)}\\)`,
          `方法：先全機率 \\(P(B)=P(A)P(B|A)+P(A^c)P(B|A^c)\\)；再貝氏 \\(P(A|B)=\\dfrac{P(A)P(B|A)}{P(B)}\\)。`
        );
      },
      () => {
        // 反向：給 P(A), P(B|A^c)，及已知 P(B)，推算 P(B|A)
        const pA = randInt(20, 60);
        const pBgAc = randInt(10, 40);
        // Choose pBgA so that P(B) comes out to a clean value
        // P(B) = pA*pBgA + (100-pA)*pBgAc  / 10000
        // Let pBgA be a random value that makes the problem work
        const pBgA = randInt(50, 90);
        const totalPB = pA * pBgA + (100 - pA) * pBgAc;
        const pBactual = `${s431Frac(totalPB, 10000)}`;
        return s331QA(
          `已知 \\(P(A)=${s431Frac(pA, 100)}\\)、\\(P(B|A^c)=${s431Frac(pBgAc, 100)}\\)，且計算得 \\(P(B)=${s431Frac(totalPB, 10000)}\\)。驗算 \\(P(B|A)\\) 應為多少？`,
          `\\(${s431Frac(pBgA, 100)}\\)`,
          `方法：由全機率公式反推 \\(P(B|A)=\\dfrac{P(B)-P(A^c)P(B|A^c)}{P(A)}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431BasicSamplingMixedSet(count) {
    return buildS223MixedSet(
      [buildS431ConditionalAlgebraSet, buildS431ConcreteConditionSet, buildS431DrawingSamplingSet],
      count
    );
  }

  function buildS431BayesSourceMixedSet(count) {
    return buildS223MixedSet([buildS431SocialTableSet, buildS431DiagnosticBayesSet, buildS431MultiSourceSet], count);
  }

  function buildS431InferenceTransitionMixedSet(count) {
    return buildS223MixedSet(
      [buildS431IndependentInferenceSet, buildS431SequenceTransitionSet, buildS431StratifiedStatsSet],
      count
    );
  }

  function buildS432IndependenceAlgebraSet(count) {
    const builders = [
      () => {
        const aDen = randInt(3, 8);
        const aNum = randInt(1, aDen - 1);
        const bDen = randInt(3, 8);
        const bNum = randInt(1, bDen - 1);
        const unionNumer = aNum * bDen + bNum * aDen - aNum * bNum;
        const unionDenom = aDen * bDen;
        return s331QA(
          `設 \\(A,B\\) 為獨立事件，已知 \\(P(A)=${s431Frac(aNum, aDen)}\\)、\\(P(A\\cup B)=${s431Frac(unionNumer, unionDenom)}\\)，求 \\(P(B)\\)。`,
          s431Answer(bNum, bDen),
          `提示：獨立事件滿足 \\(P(A\\cap B)=P(A)P(B)\\)，所以 \\(P(A\\cup B)=P(A)+P(B)-P(A)P(B)\\)。`
        );
      },
      () => {
        const aDen = randInt(4, 9);
        const aNum = randInt(1, aDen - 2);
        const bDen = randInt(4, 9);
        const bNum = randInt(1, bDen - 2);
        return s331QA(
          `已知 \\(A,B\\) 為獨立事件，\\(P(A)=${s431Frac(aNum, aDen)}\\)、\\(P(B)=${s431Frac(bNum, bDen)}\\)，求 \\(P(A'\\cap B)\\)。`,
          s431Answer((aDen - aNum) * bNum, aDen * bDen),
          `提示：若 \\(A,B\\) 獨立，則 \\(A'\\) 與 \\(B\\) 也獨立，因此 \\(P(A'\\cap B)=P(A')P(B)\\)。`
        );
      },
      () => {
        const aDen = randInt(4, 9);
        const aNum = randInt(1, aDen - 2);
        const bDen = randInt(4, 9);
        const bNum = randInt(1, bDen - 2);
        const unionNumer = aNum * bDen + bNum * aDen - aNum * bNum;
        const unionDenom = aDen * bDen;
        return s331QA(
          `已知 \\(P(A)=${s431Frac(aNum, aDen)}\\)、\\(P(B)=${s431Frac(bNum, bDen)}\\)，且 \\(P(A\\cup B)=${s431Frac(unionNumer, unionDenom)}\\)。判斷 \\(A,B\\) 是否為獨立事件。`,
          `是，因為 \\(P(A\\cap B)=P(A)P(B)=${s431Frac(aNum * bNum, aDen * bDen)}\\)。`,
          `提示：先由聯集公式反推 \\(P(A\\cap B)\\)，再和 \\(P(A)P(B)\\) 比較。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432RepeatedTrialsSet(count) {
    const builders = [
      () => {
        const trials = randInt(5, 8);
        const need = randInt(2, Math.min(4, trials - 1));
        const pNum = randInt(1, 3);
        const pDen = randInt(4, 7);
        const qNum = pDen - pNum;
        const numer = s431C(trials, need) * pNum ** need * qNum ** (trials - need);
        const denom = pDen ** trials;
        return s331QA(
          `投擲一個成功率為 \\(${s431Frac(pNum, pDen)}\\) 的獨立試驗 \\(${trials}\\) 次，求恰好成功 \\(${need}\\) 次的機率。`,
          s431Answer(numer, denom),
          `提示：二項分布公式 \\(C_n^r p^r(1-p)^{n-r}\\)，重點是每次試驗互不影響。`
        );
      },
      () => {
        const trials = randInt(4, 7);
        const pNum = 1;
        const pDen = 6;
        const qNum = pDen - pNum;
        const numer = qNum ** (trials - 1) * pNum;
        const denom = pDen ** trials;
        return s331QA(
          `連續投擲一顆公正骰子，直到出現 \\(6\\) 點為止。求第 \\(${trials}\\) 次才第一次出現 \\(6\\) 點的機率。`,
          s431Answer(numer, denom),
          `提示：前 \\(${trials - 1}\\) 次都失敗，最後一次成功，所以機率為 \\((1-p)^{${trials - 1}}p\\)。`
        );
      },
      () => {
        const shots = randInt(5, 8);
        const hits = randInt(2, Math.min(4, shots - 1));
        const pNum = randInt(2, 4);
        const pDen = randInt(5, 8);
        const qNum = pDen - pNum;
        let favorable = 0;
        for (let r = hits; r <= shots; r += 1) favorable += s431C(shots, r) * pNum ** r * qNum ** (shots - r);
        return s331QA(
          `某射手每發命中率為 \\(${s431Frac(pNum, pDen)}\\)，連續射擊 \\(${shots}\\) 發且每發互不影響，求至少命中 \\(${hits}\\) 發的機率。`,
          s431Answer(favorable, pDen ** shots),
          `提示：「至少」要把 \\(${hits}\\) 發到 \\(${shots}\\) 發的二項機率全部相加。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432TwoWayTableIndependenceSet(count) {
    const builders = [
      () => {
        const passRatio = randInt(3, 8);
        const failRatio = randInt(2, 7);
        const maleScale = randInt(10, 24);
        const femaleScale = randInt(10, 24);
        const malePass = passRatio * maleScale;
        const maleFail = failRatio * maleScale;
        const femalePass = passRatio * femaleScale;
        const femaleFail = failRatio * femaleScale;
        return s331QA(
          `某次段考「性別」與「數學及格」人數如下：男生及格 \\(${malePass}\\) 人、不及格 \\(${maleFail}\\) 人；女生及格 \\(${femalePass}\\) 人、不及格 \\(${femaleFail}\\) 人。判斷性別與數學及格是否獨立。`,
          `是，因為兩列比例相同：\\(${s431Frac(malePass, maleFail)}=${s431Frac(femalePass, femaleFail)}\\)。`,
          `提示：二維表判定獨立，可檢查交叉乘積是否相等：\\(ad=bc\\)。`
        );
      },
      () => {
        const row1a = randInt(6, 15);
        const row1b = randInt(4, 12);
        const row2a = randInt(10, 24);
        const xNumer = row1b * row2a;
        const xDenom = row1a;
        return s331QA(
          `某調查表中，第一組有市區 \\(${row1a}\\) 人、郊區 \\(${row1b}\\) 人；第二組有市區 \\(${row2a}\\) 人、郊區 \\(x\\) 人。若「組別」與「地區」為獨立事件，求 \\(x\\)。`,
          `\\(x=${s431Frac(xNumer, xDenom)}\\)`,
          `提示：獨立代表兩列的市區：郊區比例相同，因此 \\(${row1a}: ${row1b}=${row2a}:x\\)。`
        );
      },
      () => {
        const a = randInt(30, 80);
        const b = randInt(20, 70);
        const c = randInt(20, 70);
        const d = randInt(20, 70);
        const verdict = a * d === b * c ? '是' : '否';
        return s331QA(
          `某公司員工名單：男本國籍 \\(${a}\\) 人、男外國籍 \\(${b}\\) 人、女本國籍 \\(${c}\\) 人、女外國籍 \\(${d}\\) 人。判斷「性別」與「國籍」是否獨立。`,
          `${verdict}，因為交叉乘積為 \\(${a}\\times ${d}\\) 與 \\(${b}\\times ${c}\\)。`,
          `提示：二維表不必先算每格機率，直接用 \\(ad=bc\\) 判斷最穩。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432MultiMemberSuccessSet(count) {
    const builders = [
      () => {
        const pA = randInt(40, 80);
        const pB = randInt(40, 80);
        const pC = randInt(40, 80);
        const failAll = (100 - pA) * (100 - pB) * (100 - pC);
        return s331QA(
          `甲、乙、丙三人射擊命中率分別為 \\(${s431Percent(pA)}\\)、\\(${s431Percent(pB)}\\)、\\(${s431Percent(pC)}\\)，三人同時射擊且互不影響，求目標至少中一發的機率。`,
          s431Answer(1000000 - failAll, 1000000),
          `提示：至少一人成功常用反面事件：\\(1-P(三人都失敗)\\)。`
        );
      },
      () => {
        const pA = randInt(40, 75);
        const pB = randInt(40, 75);
        const pC = randInt(40, 75);
        const numer = pA * (100 - pB) * (100 - pC) + (100 - pA) * pB * (100 - pC) + (100 - pA) * (100 - pB) * pC;
        return s331QA(
          `甲、乙、丙三人各自解題，解出機率分別為 \\(${s431Percent(pA)}\\)、\\(${s431Percent(pB)}\\)、\\(${s431Percent(pC)}\\)。求恰好只有一人解出的機率。`,
          s431Answer(numer, 1000000),
          `提示：恰好一人成功有三種互斥情形，要逐項相乘後相加。`
        );
      },
      () => {
        const pA = randInt(45, 80);
        const pB = randInt(45, 80);
        const pC = randInt(45, 80);
        const numerator = (100 - pA) * pB * pC;
        const denominator = pA * pB * (100 - pC) + pA * (100 - pB) * pC + numerator;
        return s331QA(
          `三人命中率分別為 \\(${s431Percent(pA)}\\)、\\(${s431Percent(pB)}\\)、\\(${s431Percent(pC)}\\)，且互相獨立。已知恰有兩人命中，求甲未命中的機率。`,
          s431Answer(numerator, denominator),
          `提示：已知恰兩人命中後，分母只列三種「兩中一不中」的情形。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432CircuitPathSet(count) {
    const builders = [
      () => {
        const p = randInt(40, 80);
        const q = randInt(40, 80);
        const r = randInt(40, 80);
        return s331QA(
          `電路中有三個獨立開關 \\(A,B,C\\) 串聯，通過機率分別為 \\(${s431Percent(p)}\\)、\\(${s431Percent(q)}\\)、\\(${s431Percent(r)}\\)。求電流能從左端流到右端的機率。`,
          s431Answer(p * q * r, 1000000),
          `提示：串聯要全部成功，所以機率相乘。`
        );
      },
      () => {
        const p = randInt(30, 70);
        const q = randInt(30, 70);
        const r = randInt(30, 70);
        const fail = (100 - p) * (100 - q) * (100 - r);
        return s331QA(
          `電路中有三個獨立開關並聯，通過機率分別為 \\(${s431Percent(p)}\\)、\\(${s431Percent(q)}\\)、\\(${s431Percent(r)}\\)。求電路可導通的機率。`,
          s431Answer(1000000 - fail, 1000000),
          `提示：並聯至少一條路通即可，先算全部不通再取反面。`
        );
      },
      () => {
        const p = randInt(40, 80);
        const q = randInt(40, 80);
        const r = randInt(40, 80);
        const path1 = p * q;
        const path2 = r * 100;
        const numer = 10000 - ((10000 - path1) * (10000 - path2)) / 10000;
        return s331QA(
          `某電路有兩條獨立路徑並聯：上路徑由 \\(A,B\\) 串聯，通過率為 \\(${s431Percent(p)}\\)、\\(${s431Percent(q)}\\)；下路徑只有 \\(C\\)，通過率為 \\(${s431Percent(r)}\\)。求總導通機率。`,
          s431Answer(Math.round(numer), 10000),
          `提示：先算每條路徑成功率，再用並聯公式 \\(1-(1-p_1)(1-p_2)\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432SequentialCompetitionSet(count) {
    const builders = [
      () => {
        const pNum = randInt(1, 4);
        const pDen = randInt(pNum + 2, 8);
        const qNum = pDen - pNum;
        const rounds = randInt(2, 4);
        let numer = 0;
        for (let i = 0; i < rounds; i += 1) numer += qNum ** (2 * i) * pNum * pDen ** (2 * (rounds - i) - 1);
        const denom = pDen ** (2 * rounds);
        return s331QA(
          `甲、乙輪流投擲一個獨立試驗，甲先投。每次甲成功機率為 \\(${s431Frac(pNum, pDen)}\\)，乙成功機率也為 \\(${s431Frac(pNum, pDen)}\\)。先成功者獲勝，最多各投 \\(${rounds}\\) 次。求甲獲勝的機率。`,
          s431Answer(numer, denom),
          `提示：甲可在第 1、2、…、\\(${rounds}\\) 輪成功；每一輪前需前面兩人都失敗。`
        );
      },
      () => {
        const p = randInt(55, 80);
        const lose = 100 - p;
        const wins = randInt(1, 2);
        const losses = randInt(1, 2);
        const need = 3 - wins;
        const maxGames = need + (3 - losses) - 1;
        let favorable = 0;
        for (let failures = 0; failures <= 2 - losses; failures += 1) {
          favorable += s431C(need + failures - 1, failures) * p ** need * lose ** failures;
        }
        return s331QA(
          `甲乙進行五戰三勝制比賽，甲單場勝率為 \\(${s431Percent(p)}\\)。目前甲 \\(${wins}\\) 勝 \\(${losses}\\) 敗，求甲最後獲勝的機率。`,
          s431Answer(favorable, 100 ** maxGames),
          `提示：比賽在甲再拿到 \\(${need}\\) 勝時結束，最後一場必為甲勝。`
        );
      },
      () => {
        const pNum = randInt(1, 3);
        const pDen = randInt(pNum + 2, 7);
        const games = randInt(3, 5);
        const need = randInt(1, games);
        const numer = s431C(games - 1, need - 1) * pNum ** need * (pDen - pNum) ** (games - need);
        return s331QA(
          `某人每次罰球命中率為 \\(${s431Frac(pNum, pDen)}\\)，連續罰球 \\(${games}\\) 次。求第 \\(${games}\\) 次投進且總共投進 \\(${need}\\) 球的機率。`,
          s431Answer(numer, pDen ** games),
          `提示：最後一次已指定成功，前 \\(${games - 1}\\) 次中需成功 \\(${need - 1}\\) 次。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432AlgebraicPropertiesSet(count) {
    const builders = [
      () => {
        const pA = randInt(40, 70);
        const pB = randInt(40, 70);
        const pC = randInt(40, 70);
        return s331QA(
          `三整數 \\(a,b,c\\) 分別為偶數的機率為 \\(${s431Percent(pA)}\\)、\\(${s431Percent(pB)}\\)、\\(${s431Percent(pC)}\\)，且彼此互不影響。求乘積 \\(abc\\) 為偶數的機率。`,
          s431Answer(1000000 - (100 - pA) * (100 - pB) * (100 - pC), 1000000),
          `提示：乘積為偶數等同至少一個因數為偶數，可用反面「三個都不是偶數」。`
        );
      },
      () => {
        const die = randInt(2, 6);
        return s331QA(
          `投擲兩顆公正骰子。令事件 \\(A\\) 為第一顆點數是 \\(${die}\\) 的倍數，事件 \\(B\\) 為兩顆點數和為 \\(7\\)。判斷 \\(A,B\\) 是否為獨立事件。`,
          '是，因為 \\(P(A\\cap B)=P(A)P(B)\\)。',
          `提示：列出第一顆符合條件的點數，再檢查和為 7 的搭配數。`
        );
      },
      () => {
        const n = randInt(3, 6);
        const target = randInt(n + 2, 3 * n + 1);
        let countWays = 0;
        for (let a = 1; a <= n; a += 1) {
          for (let b = 1; b <= n; b += 1) {
            for (let c = 1; c <= n; c += 1) {
              if (a + b + c === target) countWays += 1;
            }
          }
        }
        return s331QA(
          `盒中有標號 \\(1\\) 到 \\(${n}\\) 的卡片，每次取後放回，連取三次。求三次所得標號和為 \\(${target}\\) 的機率。`,
          s431Answer(countWays, n ** 3),
          `提示：取後放回代表三次獨立；可用有序三元組計數。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432OrderedSuccessSet(count) {
    const builders = [
      () => {
        const pNum = randInt(1, 3);
        const pDen = randInt(pNum + 2, 7);
        const trials = randInt(5, 8);
        const success = randInt(2, Math.min(4, trials));
        const numer = s431C(trials - 1, success - 1) * pNum ** success * (pDen - pNum) ** (trials - success);
        return s331QA(
          `某試驗成功率為 \\(${s431Frac(pNum, pDen)}\\)，重複 \\(${trials}\\) 次。求第 \\(${trials}\\) 次為成功，且總共成功 \\(${success}\\) 次的機率。`,
          s431Answer(numer, pDen ** trials),
          `提示：最後一次已固定成功，前面 \\(${trials - 1}\\) 次需成功 \\(${success - 1}\\) 次。`
        );
      },
      () => {
        const pNum = 1;
        const pDen = 6;
        const stop = randInt(4, 7);
        return s331QA(
          `連續投擲一顆公正骰子，直到出現 \\(6\\) 點為止。求恰好在第 \\(${stop}\\) 次停止的機率。`,
          s431Answer((pDen - pNum) ** (stop - 1) * pNum, pDen ** stop),
          `提示：第 \\(${stop}\\) 次才停止，表示前面都不是 6，最後一次是 6。`
        );
      },
      () => {
        const red = randInt(3, 6);
        const white = randInt(2, 5);
        const draws = randInt(4, 6);
        const needRed = randInt(2, draws - 1);
        const numer = s431C(draws - 1, needRed - 1) * red ** needRed * white ** (draws - needRed);
        const denom = (red + white) ** draws;
        return s331QA(
          `袋中有 \\(${red}\\) 紅球、\\(${white}\\) 白球，每次取一球後放回，連取 \\(${draws}\\) 次。求前 \\(${draws - 1}\\) 次中已有 \\(${needRed - 1}\\) 次紅球，且第 \\(${draws}\\) 次也取到紅球的機率。`,
          s431Answer(numer, denom),
          `提示：放回抽樣可視為獨立重複試驗，最後一次的位置已固定。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432DistributionPatternsSet(count) {
    const builders = [
      () => {
        const trials = randInt(8, 12);
        const pNum = 1;
        const pDen = 2;
        const r1 = randInt(2, Math.floor(trials / 2));
        const r2 = trials - r1;
        const p1 = s431C(trials, r1);
        const p2 = s431C(trials, r2);
        const verdict = p1 === p2 ? '相等' : p1 > p2 ? `\\(p_${r1}\\) 較大` : `\\(p_${r2}\\) 較大`;
        return s331QA(
          `丟一枚均勻硬幣 \\(${trials}\\) 次，令 \\(p_n\\) 表示出現 \\(n\\) 次正面的機率。比較 \\(p_${r1}\\) 與 \\(p_${r2}\\) 的大小。`,
          verdict,
          `提示：當 \\(p=\\frac12\\) 時，\\(p_n\\) 與組合數 \\(C_${trials}^n\\) 成正比，且左右對稱。`
        );
      },
      () => {
        const trials = randInt(5, 9);
        const pNum = randInt(1, 3);
        const pDen = randInt(pNum + 2, 7);
        const expected = trials * pNum;
        return s331QA(
          `隨機變數 \\(X\\) 服從二項分布 \\(B(${trials},${s431Frac(pNum, pDen)})\\)。求 \\(X\\) 的期望值。`,
          `\\(${s431Frac(expected, pDen)}\\)`,
          `提示：二項分布的期望值為 \\(E(X)=np\\)。`
        );
      },
      () => {
        const trials = randInt(6, 10);
        const lower = randInt(1, 3);
        const upper = randInt(lower + 2, Math.min(trials, lower + 5));
        let favorable = 0;
        for (let r = lower; r <= upper; r += 1) favorable += s431C(trials, r);
        return s331QA(
          `投擲一枚公正硬幣 \\(${trials}\\) 次，判斷「正面次數介於 \\(${lower}\\) 到 \\(${upper}\\) 次」的機率是多少。`,
          s431Answer(favorable, 2 ** trials),
          `提示：範圍型二項機率要把各次數的組合數加總。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }


  // ── s4-3-2 新增：逆向 Bayes P(B|A) from P(A|B) ──────────
  function buildS432InverseBayesSet(count) {
    const builders = [
      () => {
        // P(A|B), P(B), P(A) → P(B|A) = P(A|B)*P(B)/P(A)
        const pAB_n = randInt(3, 7);  // P(A|B) = pAB_n/10
        const pAB_d = 10;
        const pB_n = randInt(2, 6);   // P(B) = pB_n/10
        const pB_d = 10;
        const pA_n = randInt(3, 8);   // P(A) = pA_n/10
        const pA_d = 10;
        // P(A∩B) = pAB_n * pB_n / 100
        // P(B|A) = P(A∩B)/P(A) = pAB_n * pB_n / (pA_n * 10)
        const numer = pAB_n * pB_n;
        const denom = pA_n * pAB_d;
        return s331QA(
          `設 \\(A,B\\) 為兩事件，已知 \\(P(A|B)=${s431Frac(pAB_n, pAB_d)}\\)、\\(P(B)=${s431Frac(pB_n, pB_d)}\\)、\\(P(A)=${s431Frac(pA_n, pA_d)}\\)，求 \\(P(B|A)\\)。`,
          s431Answer(numer, denom),
          `方法：由乘法定理 \\(P(A\\cap B)=P(A|B)P(B)\\)，再套條件機率 \\(P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}\\)。`
        );
      },
      () => {
        // 整數%版：P(A|B)=a/100, P(B)=b/100, P(A)=c/100
        const pAB = randInt(55, 85);   // P(A|B) as %
        const pB  = randInt(30, 60);   // P(B) as %
        const pA  = randInt(40, 75);   // P(A) as %
        // P(A∩B) = pAB * pB / 10000
        // P(B|A) = pAB * pB / (pA * 100)
        const numer = pAB * pB;
        const denom = pA * 100;
        return s331QA(
          `已知 \\(P(A|B)=${s431Frac(pAB, 100)}\\)、\\(P(B)=${s431Frac(pB, 100)}\\)、\\(P(A)=${s431Frac(pA, 100)}\\)，求 \\(P(B|A)\\)。`,
          s431Answer(numer, denom),
          `方法：\\(P(A\\cap B)=P(A|B)\\cdot P(B)\\)，\\(P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}\\)。`
        );
      },
      () => {
        // 已知 P(A|B), P(B), P(A^c)，求 P(B|A^c)
        const pAB = randInt(40, 80);    // P(A|B) as %
        const pB  = randInt(30, 60);    // P(B) as %
        const pAc = randInt(30, 70);    // P(A^c) as %
        const pA  = 100 - pAc;
        // P(A∩B) = pAB * pB / 10000
        // P(A^c ∩ B) = P(B) - P(A∩B) = pB/100 - pAB*pB/10000 = pB*(100-pAB)/10000
        // P(B|A^c) = P(A^c∩B)/P(A^c) = pB*(100-pAB)/(pAc*100)
        const numer = pB * (100 - pAB);
        const denom = pAc * 100;
        return s331QA(
          `設 \\(P(A|B)=${s431Frac(pAB, 100)}\\)、\\(P(B)=${s431Frac(pB, 100)}\\)、\\(P(A^c)=${s431Frac(pAc, 100)}\\)，求 \\(P(B|A^c)\\)。`,
          s431Answer(numer, denom),
          `方法：\\(P(A^c\\cap B)=P(B)-P(A\\cap B)=P(B)-P(A|B)\\cdot P(B)\\)，再除以 \\(P(A^c)\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  // ── s4-3-2 新增：考試猜題 Bayes 模型 ─────────────────────
  function buildS432ExamGuessingSet(count) {
    // P(knows) = k/m, P(correct|knows)=1, P(correct|doesn't know)=1/n
    // P(knows|correct) = (k/m) / [(k/m) + (1-k/m)/n]
    //                  = n*k / [n*k + (m-k)]
    const kPairs = [
      { k: 3, m: 5 }, { k: 4, m: 5 }, { k: 2, m: 5 },
      { k: 2, m: 3 }, { k: 3, m: 4 }, { k: 1, m: 3 },
    ];
    const nChoicePool = [3, 4, 5];
    const builders = [
      () => {
        const { k, m } = s324Pick(kPairs);
        const n = s324Pick(nChoicePool);
        const numer = n * k;
        const denom = n * k + (m - k);
        return s331QA(
          `某考試為 \\(${n}\\) 選一的單選題。若學生會做，答對機率為 \\(1\\)；若不會做，則隨機猜答，答對機率為 \\(\\dfrac{1}{${n}}\\)。已知某學生會做此題的機率為 \\(${s431Frac(k, m)}\\)，在答對的條件下，求學生其實會做此題的機率。`,
          s431Answer(numer, denom),
          `方法：貝氏定理，分子 = P(會)·P(對|會)，分母再加 P(不會)·P(對|不會)。`
        );
      },
      () => {
        // 變形：已知答對，反推 P(猜對) 的比例
        const { k, m } = s324Pick(kPairs);
        const n = s324Pick(nChoicePool);
        const numer = n * k;
        const denom = n * k + (m - k);
        const guessNumer = m - k;
        return s331QA(
          `某次選擇題測驗共 \\(${n}\\) 個選項。學生若會做則必對；若不會做則隨機猜，猜對率 \\(\\dfrac{1}{${n}}\\)。某生答對此題，且事前估計他會做的機率為 \\(${s431Frac(k, m)}\\)。求他答對此題是因為猜對（而非真的會做）的機率。`,
          s431Answer(guessNumer, denom),
          `方法：P(猜對|答對) = P(不會且猜對)/P(答對) = \\(\\dfrac{P(不會)\\cdot\\frac{1}{n}}{P(答對)}\\)。`
        );
      },
      () => {
        // 反向：已知答錯，求學生不會做的機率（答錯一定不會做）
        const { k, m } = s324Pick(kPairs);
        const n = s324Pick(nChoicePool);
        // P(wrong|knows) = 0, P(wrong|doesn't know) = (n-1)/n
        // P(doesn't know | wrong) = P(doesn't know)*(n-1)/n / P(wrong)
        // P(wrong) = (m-k)/m * (n-1)/n
        // P(doesn't know | wrong) = 1 (always)
        // Wait, that's trivially 1. Let me do something more interesting:
        // Instead: Given wrong, find P(doesn't know) = trivially 1 since knows => correct
        // So let me use a different scenario: "若學生不確定，隨機猜p/q對"
        // P(correct | uncertain) = p/q (not 1/n, where uncertain ≠ doesn't know)
        // Use three-state model: knows(k/m), unsure(u/m), clueless(1-k/m-u/m)
        // This gets complex. Let me just do another forward question instead.
        const { k: k2, m: m2 } = s324Pick(kPairs.filter(p => p.k !== k || p.m !== m));
        const n2 = s324Pick(nChoicePool.filter(x => x !== n));
        const numer2 = n2 * k2;
        const denom2 = n2 * k2 + (m2 - k2);
        const pKnow = s431Frac(k2, m2);
        const pCorrectGiven = s431Frac(numer2, denom2);
        return s331QA(
          `某測驗每題有 \\(${n2}\\) 個選項。學生若知道答案必對，不知道則隨機猜（猜對率 \\(\\frac{1}{${n2}}\\)）。設某題學生知道答案的機率為 \\(${pKnow}\\)。已知他答對了，求他知道答案的機率。`,
          s431Answer(numer2, denom2),
          `方法：\\(P(\\text{知道}|\\text{對})=\\dfrac{P(\\text{知道})\\cdot 1}{P(\\text{知道})\\cdot 1+P(\\text{不知})\\cdot\\frac{1}{${n2}}}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431DrawerParadoxCleanSet(count) {
    const builders = [
      () => {
        const doubleGold = randInt(1, 4);
        const mixed = randInt(1, 5);
        const empty = randInt(1, 4);
        const numerator = 2 * doubleGold;
        const denominator = numerator + mixed;
        return s331QA(
          `有 \\(${doubleGold + mixed + empty}\\) 張桌子，每張桌子有兩個抽屜。其中 \\(${doubleGold}\\) 張桌子兩抽屜都有金塊，\\(${mixed}\\) 張桌子只有一個抽屜有金塊，\\(${empty}\\) 張桌子兩抽屜皆空。隨機選一張桌子再隨機開一個抽屜，已知開到金塊，求同桌另一抽屜也有金塊的機率。`,
          s431Answer(numerator, denominator),
          `已知開到金塊後，條件樣本不是桌子數，而是「可被看到的金塊抽屜」。雙金桌提供 \\(2\\times ${doubleGold}\\) 個有利抽屜，單金桌提供 \\(${mixed}\\) 個金塊抽屜，所以機率為 \\(\\frac{${numerator}}{${denominator}}\\)。`
        );
      },
      () => {
        const doubleRed = randInt(1, 4);
        const mixed = randInt(1, 5);
        const doubleBlue = randInt(1, 4);
        const numerator = mixed;
        const denominator = 2 * doubleRed + mixed;
        return s331QA(
          `袋中有 \\(${doubleRed}\\) 張雙面紅卡、\\(${mixed}\\) 張一紅一藍卡、\\(${doubleBlue}\\) 張雙面藍卡。隨機取一張放桌上，已知朝上為紅色，求反面為藍色的機率。`,
          s431Answer(numerator, denominator),
          `看到紅面時，條件樣本是所有可能朝上的紅面。雙面紅卡有 \\(2\\times ${doubleRed}\\) 個紅面，一紅一藍卡有 \\(${mixed}\\) 個紅面；只有一紅一藍卡的反面是藍色。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431LostCardBayesCleanSet(count) {
    const builders = [
      () => {
        const suits = s324Pick([4, 5, 6]);
        const ranks = randInt(9, 13);
        const draw = randInt(2, Math.min(3, suits - 1));
        const total = suits * ranks;
        const targetLostWeight = suits * s431C(suits - 1, draw);
        const otherLostWeight = (total - suits) * s431C(suits, draw);
        return s331QA(
          `一副牌共有 \\(${ranks}\\) 種點數，每種點數有 \\(${suits}\\) 張。已知遺失一張牌後，從剩下的 \\(${total - 1}\\) 張中任取 \\(${draw}\\) 張，結果全是指定點數。求遺失的牌也是此指定點數的機率。`,
          s431Answer(targetLostWeight, targetLostWeight + otherLostWeight),
          `用貝氏定理。若遺失指定點數，剩下 \\(${suits - 1}\\) 張指定點數；若遺失其他點數，剩下 \\(${suits}\\) 張指定點數。兩種來源的權重分別為 \\(${suits}\\cdot C(${suits - 1},${draw})\\) 與 \\(${total - suits}\\cdot C(${suits},${draw})\\)。`
        );
      },
      () => {
        const suits = 4;
        const ranks = randInt(8, 13);
        const draw = 2;
        const total = suits * ranks;
        const targetLostWeight = suits * s431C(suits - 1, draw);
        const otherLostWeight = (total - suits) * s431C(suits, draw);
        return s331QA(
          `某牌組有 \\(${ranks}\\) 種號碼，每種號碼 \\(4\\) 張，遺失一張後從其餘牌中抽出 \\(2\\) 張，且兩張都是 \\(A\\) 號。求遺失的牌為 \\(A\\) 號的機率。`,
          s431Answer(targetLostWeight, targetLostWeight + otherLostWeight),
          `不要直接說剩下看到兩張 \\(A\\) 就代表遺失 \\(A\\) 的可能較大；要比較「遺失 \\(A\\)」與「遺失非 \\(A\\)」兩種來源造成此觀察的權重。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431TruthReportColorCleanSet(count) {
    const builders = [
      () => {
        const red = randInt(3, 8);
        const white = randInt(2, 7);
        const truthA = randInt(60, 90);
        const truthB = randInt(55, 85);
        const numerator = red * truthA * truthB;
        const denominator = numerator + white * (100 - truthA) * (100 - truthB);
        return s331QA(
          `箱中有 \\(${red}\\) 個紅球、\\(${white}\\) 個白球。甲說實話的機率為 \\(${s431Percent(truthA)}\\)，乙說實話的機率為 \\(${s431Percent(truthB)}\\)。任取一球後，兩人都說「是紅球」，求此球確為紅球的機率。`,
          s431Answer(numerator, denominator),
          `若球真紅，兩人都說紅的權重是 \\(${red}\\cdot${truthA}\\cdot${truthB}\\)；若球真白，兩人都要說謊才會都說紅，權重是 \\(${white}\\cdot${100 - truthA}\\cdot${100 - truthB}\\)。`
        );
      },
      () => {
        const red = randInt(4, 9);
        const white = randInt(3, 8);
        const truth = randInt(60, 90);
        const liarTruth = 100 - randInt(50, 80);
        const numerator = white * truth * liarTruth;
        const denominator = numerator + red * (100 - truth) * (100 - liarTruth);
        return s331QA(
          `箱中有 \\(${red}\\) 個紅球、\\(${white}\\) 個白球。甲說實話機率為 \\(${s431Percent(truth)}\\)，乙說謊機率為 \\(${s431Percent(100 - liarTruth)}\\)。任取一球後兩人都說「是白球」，求此球確為白球的機率。`,
          s431Answer(numerator, denominator),
          `乙說謊機率已給，所以乙說實話機率為 \\(${s431Percent(liarTruth)}\\)。兩人都說白可能來自真白且都說對，也可能來自真紅且都說錯，分別列權重後相除。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS431SignalChannelBayesCleanSet(count) {
    const builders = [
      () => {
        const prior0 = randInt(30, 70);
        const same0 = randInt(60, 85);
        const star0 = randInt(5, Math.min(20, 95 - same0));
        const wrong0 = 100 - same0 - star0;
        const same1 = randInt(60, 85);
        const star1 = randInt(5, Math.min(20, 95 - same1));
        const wrong1 = 100 - same1 - star1;
        const numerator = prior0 * same0;
        const denominator = numerator + (100 - prior0) * wrong1;
        return s331QA(
          `某通訊系統送出 \\(0\\) 的機率為 \\(${s431Percent(prior0)}\\)，送出 \\(1\\) 的機率為 \\(${s431Percent(100 - prior0)}\\)。送出 \\(0\\) 時收到 \\(0,1,*\\) 的機率依序為 \\(${s431Percent(same0)}\\)、\\(${s431Percent(wrong0)}\\)、\\(${s431Percent(star0)}\\)；送出 \\(1\\) 時收到 \\(1,0,*\\) 的機率依序為 \\(${s431Percent(same1)}\\)、\\(${s431Percent(wrong1)}\\)、\\(${s431Percent(star1)}\\)。若收到 \\(0\\)，求原本送出 \\(0\\) 的機率。`,
          s431Answer(numerator, denominator),
          `收到 \\(0\\) 有兩種來源：原本送 \\(0\\) 且正確收到 \\(0\\)，或原本送 \\(1\\) 但誤收為 \\(0\\)。用這兩個權重做貝氏反推。`
        );
      },
      () => {
        const prior0 = randInt(25, 65);
        const star0 = randInt(5, 25);
        const star1 = randInt(5, 25);
        const numerator = prior0 * star0;
        const denominator = numerator + (100 - prior0) * star1;
        return s331QA(
          `某訊號送出 \\(0\\) 的機率為 \\(${s431Percent(prior0)}\\)，送出 \\(1\\) 的機率為 \\(${s431Percent(100 - prior0)}\\)。若送出 \\(0\\) 時收到 \\(*\\) 的機率為 \\(${s431Percent(star0)}\\)，送出 \\(1\\) 時收到 \\(*\\) 的機率為 \\(${s431Percent(star1)}\\)。已知收到 \\(*\\)，求原本送出 \\(0\\) 的機率。`,
          s431Answer(numerator, denominator),
          `收到 \\(*\\) 不是沒有資訊，而是要比較兩種來源產生 \\(*\\) 的權重：\\(P(0)P(*|0)\\) 與 \\(P(1)P(*|1)\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432ConditionedSuccessPositionCleanSet(count) {
    const builders = [
      () => {
        const trials = randInt(4, 8);
        const successes = randInt(1, trials - 1);
        const position = randInt(1, trials);
        return s331QA(
          `投擲一枚公正硬幣 \\(${trials}\\) 次，已知共出現 \\(${successes}\\) 次正面。求第 \\(${position}\\) 次投擲為正面的機率。`,
          s431Answer(successes, trials),
          `已知總共有 \\(${successes}\\) 次正面後，每一個位置對稱，因此指定位置為正面的機率為 \\(\\frac{${successes}}{${trials}}\\)。`
        );
      },
      () => {
        const draws = randInt(4, 7);
        const whiteDrawn = randInt(1, draws - 1);
        const white = randInt(whiteDrawn + 1, whiteDrawn + 6);
        const redDrawn = draws - whiteDrawn;
        const red = randInt(redDrawn + 1, redDrawn + 6);
        const position = randInt(1, draws);
        return s331QA(
          `袋中有 \\(${white}\\) 顆白球、\\(${red}\\) 顆紅球，不放回抽取 \\(${draws}\\) 次。已知抽出的 \\(${draws}\\) 球中恰有 \\(${whiteDrawn}\\) 顆白球，求第 \\(${position}\\) 球為白球的條件機率。`,
          s431Answer(whiteDrawn, draws),
          `條件已固定 \\(${draws}\\) 個位置中有 \\(${whiteDrawn}\\) 個白球；在位置對稱下，指定位置是白球的機率就是 \\(\\frac{${whiteDrawn}}{${draws}}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432TrafficLightCountsCleanSet(count) {
    function exactlyKRedNumer(greens, k) {
      const reds = greens.map((g) => 60 - g);
      let sum = 0;
      for (let mask = 0; mask < 8; mask += 1) {
        let redCount = 0;
        let ways = 1;
        for (let i = 0; i < 3; i += 1) {
          if (mask & (1 << i)) {
            redCount += 1;
            ways *= reds[i];
          } else {
            ways *= greens[i];
          }
        }
        if (redCount === k) sum += ways;
      }
      return sum;
    }
    const builders = [
      () => {
        const greens = [randInt(2, 5) * 10, randInt(2, 5) * 10, randInt(2, 5) * 10];
        const k = randInt(0, 3);
        return s331QA(
          `甲乙兩地間有三處紅綠燈，每分鐘中綠燈秒數分別為 \\(${greens[0]}\\)、\\(${greens[1]}\\)、\\(${greens[2]}\\) 秒，且彼此獨立。求恰好遇到 \\(${k}\\) 次紅燈的機率。`,
          s431Answer(exactlyKRedNumer(greens, k), 60 ** 3),
          `每一處紅燈機率為 \\(\\frac{60-g_i}{60}\\)。因三處機率不同，恰好 \\(${k}\\) 次紅燈要列出所有位置組合後相加，不能直接套同一個 \\(p\\) 的二項公式。`
        );
      },
      () => {
        const greens = [randInt(2, 5) * 10, randInt(2, 5) * 10, randInt(2, 5) * 10];
        const noRed = greens[0] * greens[1] * greens[2];
        return s331QA(
          `某路線有三個互不影響的紅綠燈，每分鐘中綠燈秒數為 \\(${greens[0]}\\)、\\(${greens[1]}\\)、\\(${greens[2]}\\) 秒。求一路綠燈直達的機率。`,
          s431Answer(noRed, 60 ** 3),
          `一路綠燈表示三處都遇到綠燈，獨立事件直接相乘：\\(\\frac{${greens[0]}}{60}\\cdot\\frac{${greens[1]}}{60}\\cdot\\frac{${greens[2]}}{60}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS432IndependenceTrialMixedSet(count) {
    return buildS223MixedSet(
      [buildS432IndependenceAlgebraSet, buildS432RepeatedTrialsSet, buildS432OrderedSuccessSet],
      count
    );
  }

  function buildS432TableSystemMixedSet(count) {
    return buildS223MixedSet(
      [buildS432TwoWayTableIndependenceSet, buildS432MultiMemberSuccessSet, buildS432CircuitPathSet],
      count
    );
  }

  function buildS432AdvancedDistributionMixedSet(count) {
    return buildS223MixedSet(
      [buildS432SequentialCompetitionSet, buildS432AlgebraicPropertiesSet, buildS432DistributionPatternsSet],
      count
    );
  }

  function s441Det3(m) {
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
  }

  function s441ReplaceCol(m, col, b) {
    return m.map((row, index) => row.map((value, j) => (j === col ? b[index] : value)));
  }

  function s441Term(coef, variable, first) {
    if (coef === 0) return '';
    const sign = coef < 0 ? '-' : first ? '' : '+';
    const abs = Math.abs(coef);
    const body = abs === 1 ? variable : `${abs}${variable}`;
    return `${sign}${body}`;
  }

  function s441LinearExpr(coefs, vars) {
    let text = '';
    coefs.forEach((coef, index) => {
      const term = s441Term(coef, vars[index], text === '');
      if (term) text += term;
    });
    return text || '0';
  }

  function s441SystemTex(rows, vars = ['x', 'y', 'z']) {
    return `\\begin{cases}${rows.map((row) => `${s441LinearExpr(row.slice(0, vars.length), vars)}=${row[vars.length]}`).join('\\\\')}\\end{cases}`;
  }

  function s441MatrixTex(rows) {
    return `\\begin{bmatrix}${rows.map((row) => row.join('&')).join('\\\\')}\\end{bmatrix}`;
  }

  function s441Tuple(values) {
    return `(${values.join(', ')})`;
  }

  function s441UniqueSystem() {
    let matrix;
    let det = 0;
    while (det === 0) {
      matrix = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => randInt(-4, 5)));
      if (matrix.some((row) => row.every((value) => value === 0))) continue;
      det = s441Det3(matrix);
    }
    const sol = [randInt(-4, 5), randInt(-4, 5), randInt(-4, 5)];
    const rhs = matrix.map((row) => row.reduce((sum, value, index) => sum + value * sol[index], 0));
    return { matrix, det, sol, rows: matrix.map((row, index) => [...row, rhs[index]]) };
  }

  function buildS441GaussianBasicSet(count) {
    const builders = [
      () => {
        const sys = s441UniqueSystem();
        return s331QA(
          `利用高斯消去法解三元一次方程組 \\(${s441SystemTex(sys.rows)}\\)。`,
          `\\((x,y,z)=${s441Tuple(sys.sol)}\\)`,
          `提示：把增廣矩陣化為上三角形，再由最後一列開始回代。`
        );
      },
      () => {
        const sys = s441UniqueSystem();
        return s331QA(
          `將方程組 \\(${s441SystemTex(sys.rows)}\\) 寫成增廣矩陣並求解。`,
          `增廣矩陣為 \\(${s441MatrixTex(sys.rows)}\\)，解為 \\((x,y,z)=${s441Tuple(sys.sol)}\\)。`,
          `提示：增廣矩陣的最後一欄是常數項，列運算不改變方程組的解。`
        );
      },
      () => {
        const sys = s441UniqueSystem();
        return s331QA(
          `方程組 \\(${s441SystemTex(sys.rows)}\\) 的係數較雜，請用消去法求 \\(x+y+z\\)。`,
          `\\(${sys.sol[0] + sys.sol[1] + sys.sol[2]}\\)`,
          `提示：不必先害怕大係數，核心仍是用列運算消去兩個未知數。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS441CramerDeterminantSet(count) {
    const builders = [
      () => {
        const sys = s441UniqueSystem();
        const b = sys.rows.map((row) => row[3]);
        const dx = s441Det3(s441ReplaceCol(sys.matrix, 0, b));
        const dy = s441Det3(s441ReplaceCol(sys.matrix, 1, b));
        const dz = s441Det3(s441ReplaceCol(sys.matrix, 2, b));
        return s331QA(
          `利用克拉瑪公式解方程組 \\(${s441SystemTex(sys.rows)}\\)。`,
          `\\(\\Delta=${sys.det},\\Delta_x=${dx},\\Delta_y=${dy},\\Delta_z=${dz}\\)，所以 \\((x,y,z)=${s441Tuple(sys.sol)}\\)。`,
          `提示：唯一解時 \\(x=\\frac{\\Delta_x}{\\Delta},\\ y=\\frac{\\Delta_y}{\\Delta},\\ z=\\frac{\\Delta_z}{\\Delta}\\)。`
        );
      },
      () => {
        const sys = s441UniqueSystem();
        const b = sys.rows.map((row) => row[3]);
        const dx = s441Det3(s441ReplaceCol(sys.matrix, 0, b));
        return s331QA(
          `已知方程組 \\(${s441SystemTex(sys.rows)}\\)。利用克拉瑪公式求 \\(x\\) 的值。`,
          `\\(x=${s421Frac(dx, sys.det)}\\)`,
          `提示：只要求 \\(x\\) 時，只需計算 \\(\\Delta\\) 與 \\(\\Delta_x\\)。`
        );
      },
      () => {
        const sys = s441UniqueSystem();
        const ratio = sys.sol.map((value) => value * sys.det);
        return s331QA(
          `某三元方程組的 \\(\\Delta=${sys.det}\\)，且 \\((\\Delta_x,\\Delta_y,\\Delta_z)=${s441Tuple(ratio)}\\)。求 \\((x,y,z)\\)。`,
          `\\((x,y,z)=${s441Tuple(sys.sol)}\\)`,
          `提示：克拉瑪公式可直接把行列式比值轉成解。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS441SpecialSolutionsSet(count) {
    const builders = [
      () => {
        const a = randInt(1, 4);
        const b = randInt(-3, 3);
        const c = randInt(1, 4);
        const d = randInt(-2, 4);
        const rows = [
          [a, b, c, d],
          [2 * a, 2 * b, 2 * c, 2 * d + randInt(1, 3)],
          [a + 1, b - 1, c + 2, d + randInt(-2, 2)],
        ];
        return s331QA(
          `判斷方程組 \\(${s441SystemTex(rows)}\\) 的解的情形。`,
          `無解。`,
          `提示：前兩式左邊成比例但常數項不成比例，列運算會得到 \\(0=k\\ (k\\ne0)\\)。`
        );
      },
      () => {
        const a = randInt(1, 4);
        const b = randInt(-3, 3);
        const c = randInt(1, 4);
        const d = randInt(-2, 4);
        const e = randInt(-3, 3) || 1;
        const f = randInt(1, 4);
        const g = randInt(-3, 3);
        const h = randInt(-2, 4);
        const rows = [
          [a, b, c, d],
          [e, f, g, h],
          [a + e, b + f, c + g, d + h],
        ];
        return s331QA(
          `判斷方程組 \\(${s441SystemTex(rows)}\\) 的解的情形，並說明原因。`,
          `無限多組解。`,
          `提示：第三式是前兩式相加，真正獨立的限制只有兩個，因此會留下自由變數。`
        );
      },
      () => {
        const sys = s441UniqueSystem();
        return s331QA(
          `判斷方程組 \\(${s441SystemTex(sys.rows)}\\) 是否有唯一解。`,
          `有唯一解，因為係數行列式 \\(\\Delta=${sys.det}\\ne0\\)。`,
          `提示：三元一次方程組若 \\(\\Delta\\ne0\\)，三個平面交於唯一一點。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS441ParameterSolutionsSet(count) {
    const builders = [
      () =>
        s331QA(
          `討論方程組 \\(\\begin{cases}x+y+az=1\\\\x+ay+z=1\\\\ax+y+z=1\\end{cases}\\) 在不同 \\(a\\) 值下的解的情形。`,
          `\\(a\\ne1,-2\\) 時有唯一解；\\(a=1\\) 時無限多組解；\\(a=-2\\) 時無解。`,
          `提示：係數行列式為 \\(-(a-1)^2(a+2)\\)，再代入特殊值檢查是否矛盾。`
        ),
      () => {
        const rows = [
          [1, -1, -2, 3],
          [1, 1, 1, 1],
          [5, 1, -1, 9],
        ];
        return s331QA(
          `已知方程組 \\(${s441SystemTex(rows)}\\) 有兩組以上的解。若第三式寫成 \\(5x+y+az=9\\)，求 \\(a\\)。`,
          `\\(a=-1\\)`,
          `提示：有兩組以上的解表示第三個平面必須和前兩式的交線相容。`
        );
      },
      () =>
        s331QA(
          `求 \\(a\\) 使方程組 \\(\\begin{cases}x-y-z=2\\\\x+z=3\\\\4x-3y-2z=a\\end{cases}\\) 有解。`,
          `\\(a=7\\)`,
          `提示：先由前兩式解出 \\(x,y,z\\) 的關係，再代入第三式檢查常數項。`
        ),
    ];
    return s331MakeSet(count, builders);
  }

  function buildS441HomogeneousRatioSet(count) {
    const builders = [
      () =>
        s331QA(
          `討論齊次方程組 \\(\\begin{cases}x+y+az=0\\\\x+ay+z=0\\\\ax+y+z=0\\end{cases}\\) 何時有非零解。`,
          `\\(a=1\\) 或 \\(a=-2\\)。`,
          `提示：齊次方程組一定有零解；要有非零解，必須 \\(\\Delta=0\\)。`
        ),
      () => {
        const p = randInt(2, 5);
        const q = randInt(2, 5);
        const rows = [
          [1, 0, -p, 0],
          [0, 1, -q, 0],
        ];
        return s331QA(
          `已知齊次方程組 \\(${s441SystemTex(rows)}\\)，且 \\(z\\ne0\\)。求 \\(x:y:z\\)。`,
          `\\(${p}:${q}:1\\)`,
          `提示：齊次方程組的比例解可令自由變數 \\(z=1\\) 來讀出。`
        );
      },
      () => {
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        return s331QA(
          `齊次方程組 \\(\\begin{cases}x-${a}z=0\\\\y-${b}z=0\\\\${b}x-${a}y=0\\end{cases}\\) 是否有非零解？若有，求 \\(x:y:z\\)。`,
          `有，\\(x:y:z=${a}:${b}:1\\)。`,
          `提示：第三式是前兩式推出的相依條件，因此保留一個自由變數。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS441PlaneRelationsSet(count) {
    const builders = [
      () =>
        s331QA(
          `判斷三平面 \\(x+y+az=1\\)、\\(x+ay+z=1\\)、\\(ax+y+z=1\\) 在 \\(a=1\\) 與 \\(a=-2\\) 時的幾何關係。`,
          `\\(a=1\\) 時三平面重合；\\(a=-2\\) 時無共同點。`,
          `提示：把三平面視為三元一次方程組，解的個數就是共同交集的型態。`
        ),
      () => {
        const rows = [
          [1, 2, 1, 3],
          [2, 5, -2, 5],
          [1, 4, -7, 1],
        ];
        return s331QA(
          `三平面 \\(x+2y+z=a\\)、\\(2x+5y-2z=5\\)、\\(x+4y-7z=1\\) 若交於一直線，求 \\(a\\)。`,
          `\\(a=3\\)`,
          `提示：交於一直線代表方程組無限多解，列運算後最後一列必須變成 \\(0=0\\)。`
        );
      },
      () => {
        const p = randInt(1, 4);
        const rows = [
          [1, 1, 1, p],
          [2, 2, 2, p + 1],
          [1, -1, 1, 0],
        ];
        return s331QA(
          `判斷三平面 \\(${s441SystemTex(rows)}\\) 是否有共同交點。`,
          `沒有共同交點。`,
          `提示：前兩個平面法向量平行，但常數項不成比例，形成平行異面限制。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS441MatrixBackSubstitutionSet(count) {
    const builders = [
      () => {
        const x = randInt(-3, 5);
        const y = randInt(-3, 5);
        const z = randInt(-3, 5);
        const a = 2 * x + y - z;
        const b = -y + 3 * z;
        const c = z;
        const matrix = [
          [1, 2, -1, a],
          [0, -1, 3, b],
          [0, 0, 1, c],
        ];
        return s331QA(
          `增廣矩陣 \\(${s441MatrixTex(matrix)}\\) 對應的解為 \\((x,y,z)=(${x},${y},${z})\\)。求矩陣中的常數欄 \\((a,b,c)\\)。`,
          `\\((a,b,c)=(${a},${b},${c})\\)`,
          `提示：上三角矩陣可由下往上回代，這題反向把解代回每列。`
        );
      },
      () => {
        const x = randInt(-3, 5);
        const y = randInt(-3, 5);
        const z = randInt(-3, 5);
        const a = x + z;
        const b = 2 * y - z;
        const c = 3 * x - y + 2 * z;
        return s331QA(
          `方程組經列運算化為 \\(\\begin{bmatrix}1&0&1&a\\\\0&2&-1&b\\\\3&-1&2&c\\end{bmatrix}\\)，且解為 \\((x,y,z)=(${x},${y},${z})\\)。求 \\(a+b+c\\)。`,
          `\\(${a + b + c}\\)`,
          `提示：列運算後的矩陣仍代表同一組解，把解代入每列即可還原未知常數。`
        );
      },
      () => {
        const sys = s441UniqueSystem();
        return s331QA(
          `方程組 \\(${s441SystemTex(sys.rows)}\\) 的增廣矩陣若化成列階梯形，最後必須對應哪一類解？`,
          `唯一解。`,
          `提示：因為原係數行列式 \\(\\Delta=${sys.det}\\ne0\\)，三個樞紐都存在。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS441CoplanarLinearSet(count) {
    const builders = [
      () => {
        const a = randInt(-3, 4);
        const A = [a, 1, 1];
        const B = [a + 1, 1, 0];
        const C = [1, 2, 1];
        const D = [-1, -1, 3];
        const det = s441Det3([
          [B[0] - A[0], B[1] - A[1], B[2] - A[2]],
          [C[0] - A[0], C[1] - A[1], C[2] - A[2]],
          [D[0] - A[0], D[1] - A[1], D[2] - A[2]],
        ]);
        return s331QA(
          `已知空間四點 \\(A(${A.join(',')}),B(${B.join(',')}),C(${C.join(',')}),D(${D.join(',')})\\)。判斷四點是否共平面。`,
          det === 0 ? `共平面。` : `不共平面。`,
          `提示：四點共平面等價於 \\(\\det(\\overrightarrow{AB},\\overrightarrow{AC},\\overrightarrow{AD})=0\\)。`
        );
      },
      () => {
        const x = randInt(1, 4);
        const y = randInt(1, 4);
        const a = [1, 1, 1];
        const b = [1, 3, 4];
        const c = [1, 2, 6];
        const d = a.map((value, index) => x * value + y * b[index] + c[index]);
        return s331QA(
          `判斷向量 \\(d=${s441Tuple(d)}\\) 是否可表示為 \\(a=${s441Tuple(a)}\\)、\\(b=${s441Tuple(b)}\\)、\\(c=${s441Tuple(c)}\\) 的線性組合。`,
          `可以，例如 \\(d=${x}a+${y}b+c\\)。`,
          `提示：把 \\(d=xa+yb+zc\\) 視為三元一次方程組求係數。`
        );
      },
      () => {
        const A = [randInt(-2, 3), randInt(-2, 3), randInt(-2, 3)];
        const u = [randInt(1, 4), randInt(-3, 3), randInt(1, 4)];
        const v = [randInt(-3, 3), randInt(1, 4), randInt(1, 4)];
        const area2 = Math.abs(
          s441Det3([
            [u[0], u[1], u[2]],
            [v[0], v[1], v[2]],
            [0, 0, 1],
          ])
        );
        return s331QA(
          `平面上三點以向量表示為 \\(A=${s441Tuple(A)}\\)、\\(B=A+${s441Tuple(u)}\\)、\\(C=A+${s441Tuple(v)}\\)。若只看 \\(xy\\) 平面投影，求投影三角形面積。`,
          `\\(${s421Frac(area2, 2)}\\)`,
          `提示：投影到 \\(xy\\) 平面時，只取向量的 \\(x,y\\) 分量做二階行列式面積。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS441ModelingSet(count) {
    const builders = [
      () => {
        const a = randInt(1, 3);
        const b = randInt(-4, 4);
        const c = randInt(-3, 6);
        const xs = [-1, 1, 3];
        const points = xs.map((x) => [x, a * x * x + b * x + c]);
        return s331QA(
          `已知二次函數 \\(f(x)=ax^2+bx+c\\) 通過 \\((${points[0][0]},${points[0][1]})\\)、\\((${points[1][0]},${points[1][1]})\\)、\\((${points[2][0]},${points[2][1]})\\)。求 \\((a,b,c)\\)。`,
          `\\((a,b,c)=(${a},${b},${c})\\)`,
          `提示：把三個點代入函數式，就得到三元一次聯立方程組。`
        );
      },
      () => {
        const x = randInt(2, 6);
        const y = randInt(2, 6);
        const z = randInt(2, 6);
        const rows = [
          [1, 1, 1, x + y + z],
          [2, 3, 4, 2 * x + 3 * y + 4 * z],
          [1, -1, 2, x - y + 2 * z],
        ];
        return s331QA(
          `甲、乙、丙三種合金用量分別為 \\(x,y,z\\) 公斤，已知條件形成方程組 \\(${s441SystemTex(rows)}\\)。求三種合金用量。`,
          `\\((x,y,z)=(${x},${y},${z})\\) 公斤`,
          `提示：應用題先設三個未知量，再把總量與成分條件翻成三條方程式。`
        );
      },
      () => {
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        const c = randInt(2, 5);
        const rows = [
          [1, 1, 0, a + b],
          [0, 1, 1, b + c],
          [1, 0, 1, a + c],
        ];
        return s331QA(
          `甲乙合作需 \\(${a + b}\\) 天、乙丙合作需 \\(${b + c}\\) 天、甲丙合作需 \\(${a + c}\\) 天。若令三人單獨所需時間的代數量為 \\(x,y,z\\)，解方程組 \\(${s441SystemTex(rows)}\\)。`,
          `\\((x,y,z)=(${a},${b},${c})\\)`,
          `提示：這類文字題重點是把三個兩兩關係翻成三條一次方程式。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function s441NonzeroInt(min, max) {
    let value = 0;
    while (value === 0) value = randInt(min, max);
    return value;
  }

  function s441ReciprocalSystemData() {
    let matrix;
    let det = 0;
    while (det === 0) {
      matrix = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => s441NonzeroInt(-4, 4)));
      det = s441Det3(matrix);
    }
    const uvw = Array.from({ length: 3 }, () => s441NonzeroInt(-3, 3));
    const rhs = matrix.map((row) => row.reduce((sum, value, index) => sum + value * uvw[index], 0));
    const xyz = uvw.map((value) => formatFraction(1, value));
    return { matrix, rhs, uvw, xyz };
  }

  function s441ReciprocalTerm(coef, variable, first) {
    const abs = Math.abs(coef);
    const sign = coef < 0 ? '-' : first ? '' : '+';
    const body = abs === 1 ? `\\frac{1}{${variable}}` : `\\frac{${abs}}{${variable}}`;
    return `${sign}${body}`;
  }

  function s441ReciprocalEquation(row, rhs) {
    const vars = ['x', 'y', 'z'];
    return `${row.map((coef, index) => s441ReciprocalTerm(coef, vars[index], index === 0)).join('')}=${rhs}`;
  }

  function s441ReciprocalSystemTex(rows, rhs) {
    return `\\begin{cases}${rows.map((row, index) => s441ReciprocalEquation(row, rhs[index])).join('\\\\')}\\end{cases}`;
  }

  function buildS441ReciprocalSubstitutionSet(count) {
    const builders = [
      () => {
        const sys = s441ReciprocalSystemData();
        return s331QA(
          `解方程組 \\(${s441ReciprocalSystemTex(sys.matrix, sys.rhs)}\\)，求 \\(z\\) 的值。`,
          `\\(z=${sys.xyz[2]}\\)`,
          `提示：令 \\(u=\\frac1x\\)、\\(v=\\frac1y\\)、\\(w=\\frac1z\\)，先解三元一次方程組，再把 \\(w\\) 取倒數。`
        );
      },
      () => {
        const sys = s441ReciprocalSystemData();
        return s331QA(
          `解方程組 \\(${s441ReciprocalSystemTex(sys.matrix, sys.rhs)}\\)，求 \\((x,y,z)\\)。`,
          `\\((x,y,z)=(${sys.xyz.join(',')})\\)`,
          `提示：不要直接通分硬算；先把 \\(\\frac1x,\\frac1y,\\frac1z\\) 分別設成新未知數。`
        );
      },
      () => {
        const sys = s441ReciprocalSystemData();
        const numer = sys.uvw[1] * sys.uvw[2] + sys.uvw[0] * sys.uvw[2] + sys.uvw[0] * sys.uvw[1];
        const denom = sys.uvw[0] * sys.uvw[1] * sys.uvw[2];
        return s331QA(
          `方程組 \\(${s441ReciprocalSystemTex(sys.matrix, sys.rhs)}\\) 的解為 \\((x,y,z)\\)。求 \\(x+y+z\\)。`,
          `\\(${formatFraction(numer, denom)}\\)`,
          `提示：先解出 \\((u,v,w)=(\\frac1x,\\frac1y,\\frac1z)\\)，再換回 \\(x,y,z\\) 後相加。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS441BasicCramerMixedSet(count) {
    return buildS223MixedSet(
      [buildS441GaussianBasicSet, buildS441CramerDeterminantSet, buildS441SpecialSolutionsSet],
      count
    );
  }

  function buildS441ParameterGeometryMixedSet(count) {
    return buildS223MixedSet(
      [buildS441ParameterSolutionsSet, buildS441HomogeneousRatioSet, buildS441PlaneRelationsSet],
      count
    );
  }

  function buildS441MatrixModelMixedSet(count) {
    return buildS223MixedSet(
      [buildS441MatrixBackSubstitutionSet, buildS441CoplanarLinearSet, buildS441ModelingSet],
      count
    );
  }

  function s442Matrix(rows) {
    return s441MatrixTex(rows);
  }

  function s442Add(A, B) {
    return A.map((row, i) => row.map((value, j) => value + B[i][j]));
  }

  function s442Sub(A, B) {
    return A.map((row, i) => row.map((value, j) => value - B[i][j]));
  }

  function s442Scalar(k, A) {
    return A.map((row) => row.map((value) => k * value));
  }

  function s442Mul(A, B) {
    return A.map((row) => B[0].map((_, j) => row.reduce((sum, value, k) => sum + value * B[k][j], 0)));
  }

  function s442Det2(A) {
    return A[0][0] * A[1][1] - A[0][1] * A[1][0];
  }

  function s442MatrixAnswer(A) {
    return `\\(${s442Matrix(A)}\\)`;
  }

  function s442RandomMatrix(rows, cols, min = -4, max = 6) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => randInt(min, max)));
  }

  function buildS442MatrixEqualitySet(count) {
    const builders = [
      () => {
        const x = randInt(-5, 6);
        const y = randInt(-5, 6);
        const u = randInt(-5, 6);
        const v = randInt(-5, 6);
        const left = [
          [`${x}+${y}`, `${u}+${v}`],
          [`${u}`, `${x}-${y}`],
        ];
        const right = [
          [x + y, u + v],
          [u, x - y],
        ];
        return s331QA(
          `設 \\(\\begin{bmatrix}x+y&u+v\\\\u&x-y\\end{bmatrix}=${s442Matrix(right)}\\)，求 \\(x,y,u,v\\)。`,
          `\\((x,y,u,v)=(${x},${y},${u},${v})\\)`,
          `提示：矩陣相等就是同位置元素相等，逐格列方程即可。`
        );
      },
      () => {
        const a = randInt(-4, 5);
        const b = randInt(-4, 5);
        const x = randInt(-3, 6);
        const y = randInt(-3, 6);
        const right = [
          [a + 3 * b, 7],
          [-3, x + y],
        ];
        return s331QA(
          `若 \\(\\begin{bmatrix}a+3b&7\\\\-3&x+y\\end{bmatrix}=\\begin{bmatrix}${right[0][0]}&7\\\\-3&${right[1][1]}\\end{bmatrix}\\)，且 \\(a=${a}\\)、\\(x=${x}\\)，求 \\(b,y\\)。`,
          `\\((b,y)=(${b},${y})\\)`,
          `提示：先比對左上角求 \\(b\\)，再比對右下角求 \\(y\\)。`
        );
      },
      () => {
        const theta = randInt(1, 4) * 15;
        const a = 1;
        const b = 0;
        const c = 1;
        return s331QA(
          `已知 \\(\\begin{bmatrix}\\cos^2 ${theta}^\\circ+\\sin^2 ${theta}^\\circ&\\sin ${theta}^\\circ-\\sin ${theta}^\\circ\\\\\\cos ${theta}^\\circ-\\cos ${theta}^\\circ&\\cos^2 ${theta}^\\circ+\\sin^2 ${theta}^\\circ\\end{bmatrix}=\\begin{bmatrix}a&b\\\\0&c\\end{bmatrix}\\)，求 \\(a,b,c\\)。`,
          `\\((a,b,c)=(${a},${b},${c})\\)`,
          `提示：先化簡三角恆等式，再用矩陣相等比對元素。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442LinearMatrixAlgebraSet(count) {
    const builders = [
      () => {
        const A = s442RandomMatrix(2, 2);
        const B = s442RandomMatrix(2, 2);
        const X = s442Scalar(-1, s442Add(s442Scalar(4, A), s442Scalar(-6, B)));
        return s331QA(
          `已知 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\)，求滿足 \\(4A-X=3(2B-X)\\) 的矩陣 \\(X\\)。`,
          s442MatrixAnswer(X),
          `提示：先移項整理成 \\(X=6B-4A\\)，再做係數積與加減。`
        );
      },
      () => {
        const A = s442RandomMatrix(2, 2);
        const B = s442RandomMatrix(2, 2);
        const X = s442Scalar(1, s442Sub(s442Scalar(5, B), s442Scalar(3, A))).map((row) =>
          row.map((value) => value / 2)
        );
        const Xint = X.every((row) => row.every(Number.isInteger));
        if (!Xint) return builders[0]();
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\)，求滿足 \\(3A+2X=5B\\) 的矩陣 \\(X\\)。`,
          s442MatrixAnswer(X),
          `提示：矩陣方程式可像代數式一樣移項，但每一步都要保持矩陣階數相同。`
        );
      },
      () => {
        const A = s442RandomMatrix(2, 2);
        const B = s442RandomMatrix(2, 2);
        const X = s442Add(s442Scalar(3, A), s442Scalar(-2, B));
        const Y = s442Add(s442Scalar(2, A), s442Scalar(-1, B));
        return s331QA(
          `解矩陣方程組 \\(\\begin{cases}X-Y=A\\\\-2X+3Y=B\\end{cases}\\)，其中 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\)。求 \\(X\\)。`,
          s442MatrixAnswer(X),
          `提示：把 \\(X,Y\\) 當未知量消去，可得 \\(Y=B+2A\\)、\\(X=3A+2B\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442MatrixEquationSet(count) {
    const builders = [
      () => {
        const x = randInt(-4, 5);
        const y = randInt(-4, 5);
        const A = [
          [2, 1],
          [3, -5],
        ];
        const B = [[2 * x + y], [3 * x - 5 * y]];
        return s331QA(
          `已知 \\(${s442Matrix(A)}\\begin{bmatrix}x\\\\y\\end{bmatrix}=${s442Matrix(B)}\\)，求 \\(x,y\\)。`,
          `\\((x,y)=(${x},${y})\\)`,
          `提示：矩陣乘法可轉回二元聯立方程組。`
        );
      },
      () => {
        const a = randInt(-3, 4);
        const b = randInt(-3, 4);
        const c = randInt(-3, 4);
        const d = randInt(-3, 4);
        const A = [
          [a, b],
          [c, d],
        ];
        const U = [
          [1, 2],
          [3, 5],
        ];
        const B = s442Mul(A, U);
        return s331QA(
          `已知二階矩陣 \\(A=\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}\\) 滿足 \\(A${s442Matrix(U)}=${s442Matrix(B)}\\)，求 \\((a,b,c,d)\\)。`,
          `\\((a,b,c,d)=(${a},${b},${c},${d})\\)`,
          `提示：把未知矩陣乘開，比對四個位置的元素。`
        );
      },
      () => {
        const A = [
          [randInt(1, 4), randInt(-3, 3)],
          [randInt(-3, 3), randInt(1, 4)],
        ];
        if (s442Det2(A) === 0) return builders[0]();
        const X = s442RandomMatrix(2, 2);
        const B = s442Mul(A, X);
        return s331QA(
          `求矩陣 \\(X\\)，使 \\(${s442Matrix(A)}X=${s442Matrix(B)}\\)。`,
          s442MatrixAnswer(X),
          `提示：可把 \\(X\\) 的兩欄分別視為兩組聯立方程求解。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442MultiplicationDimensionSet(count) {
    const builders = [
      () => {
        const A = s442RandomMatrix(2, 3);
        const B = s442RandomMatrix(3, 2);
        return s331QA(
          `已知 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\)，計算 \\(AB\\)，並判斷 \\(BA\\) 是否存在。`,
          `\\(AB=${s442Matrix(s442Mul(A, B))}\\)，\\(BA\\) 也存在且為 \\(3\\times3\\) 矩陣。`,
          `提示：前矩陣的行數要等於後矩陣的列數；結果階數看外側的列與行。`
        );
      },
      () => {
        const A = s442RandomMatrix(1, 3);
        const B = s442RandomMatrix(3, 1);
        return s331QA(
          `設列矩陣 \\(A=${s442Matrix(A)}\\)、行矩陣 \\(B=${s442Matrix(B)}\\)，求 \\(AB\\) 的值。`,
          `\\(${s442Mul(A, B)[0][0]}\\)`,
          `提示：列矩陣乘行矩陣是內積，結果是 \\(1\\times1\\)。`
        );
      },
      () => {
        const m = randInt(2, 5);
        const n = randInt(2, 5);
        const p = randInt(2, 5);
        return s331QA(
          `若 \\(A\\) 為 \\(${m}\\times${n}\\) 矩陣，\\(B\\) 為 \\(${n}\\times${p}\\) 矩陣，求 \\(AB\\) 的階數，並判斷 \\(BA\\) 是否一定存在。`,
          `\\(AB\\) 為 \\(${m}\\times${p}\\)；\\(BA\\) 不一定存在，需 \\(${p}=${m}\\)。`,
          `提示：只看中間是否相等決定能不能乘，外側決定結果階數。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442AlgebraicPropertiesSet(count) {
    const builders = [
      () => {
        const A = [
          [1, 0],
          [0, -1],
        ];
        const B = [
          [1, 1],
          [1, 1],
        ];
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\)。驗證 \\((A+B)^2\\ne A^2+2AB+B^2\\)。`,
          `\\((A+B)^2=${s442Matrix(s442Mul(s442Add(A, B), s442Add(A, B)))}\\)，但 \\(A^2+2AB+B^2=${s442Matrix(s442Add(s442Add(s442Mul(A, A), s442Scalar(2, s442Mul(A, B))), s442Mul(B, B)))}\\)。`,
          `提示：矩陣乘法通常不交換，平方公式的中間項應是 \\(AB+BA\\)，不是固定 \\(2AB\\)。`
        );
      },
      () => {
        const A = [
          [1, 3],
          [2, 6],
        ];
        const B = [
          [2, 0],
          [-1, 0],
        ];
        return s331QA(
          `已知 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\)。計算 \\(AB\\)，並說明 \\(AB=O\\) 是否代表 \\(A=O\\) 或 \\(B=O\\)。`,
          `\\(AB=${s442Matrix(s442Mul(A, B))}\\)，但 \\(A\\ne O\\)、\\(B\\ne O\\)。`,
          `提示：矩陣乘法有零因子，不能把數的消去律直接搬過來。`
        );
      },
      () => {
        const A = [
          [2, 2],
          [1, 1],
        ];
        const B = [
          [0, 1],
          [3, 1],
        ];
        const C = [
          [2, 2],
          [1, 0],
        ];
        return s331QA(
          `驗證 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\)、\\(C=${s442Matrix(C)}\\) 滿足 \\(AB=AC\\)，但 \\(B\\ne C\\)。`,
          `\\(AB=${s442Matrix(s442Mul(A, B))}=AC\\)，但 \\(B\\) 與 \\(C\\) 不相等。`,
          `提示：若左乘矩陣不可逆，\\(AB=AC\\) 不一定能消去 \\(A\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442SpecialMatricesSet(count) {
    const builders = [
      () => {
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        const n = randInt(4, 8);
        return s331QA(
          `設對角矩陣 \\(D=\\begin{bmatrix}${a}&0\\\\0&${b}\\end{bmatrix}\\)，求 \\(D^{${n}}\\)。`,
          `\\(D^{${n}}=\\begin{bmatrix}${a ** n}&0\\\\0&${b ** n}\\end{bmatrix}\\)`,
          `提示：對角矩陣的次方，就是對角線元素各自取次方。`
        );
      },
      () => {
        const k = randInt(2, 6);
        const A = [
          [k, k],
          [k, k],
        ];
        return s331QA(
          `已知 \\(A=${s442Matrix(A)}\\)，求實數 \\(m\\) 使 \\(A^2=mA\\)。`,
          `\\(m=${2 * k}\\)`,
          `提示：每列相同的二階矩陣相乘後，會變成列和倍數。`
        );
      },
      () => {
        const n = randInt(2, 4);
        const A = [
          [1, 1, 1],
          [0, 1, 1],
          [0, 0, 1],
        ];
        return s331QA(
          `設上三角矩陣 \\(A=${s442Matrix(A)}\\)，計算 \\(A^2\\)，並觀察其仍為哪一類矩陣。`,
          `\\(A^2=${s442Matrix(s442Mul(A, A))}\\)，仍為上三角矩陣。`,
          `提示：上三角矩陣相乘仍是上三角矩陣，對角線元素也會相乘。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442MatrixPowersSet(count) {
    const builders = [
      () => {
        const n = randInt(8, 30);
        return s331QA(
          `若 \\(A=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}\\)，求 \\(A^{${n}}\\)。`,
          `\\(A^{${n}}=\\begin{bmatrix}1&${n}\\\\0&1\\end{bmatrix}\\)`,
          `提示：先算 \\(A^2,A^3\\)，會發現右上角每乘一次增加 1。`
        );
      },
      () => {
        const n = randInt(4, 10);
        return s331QA(
          `若 \\(A=\\begin{bmatrix}2&1\\\\0&2\\end{bmatrix}\\)，求 \\(A^{${n}}\\)。`,
          `\\(A^{${n}}=\\begin{bmatrix}${2 ** n}&${n * 2 ** (n - 1)}\\\\0&${2 ** n}\\end{bmatrix}\\)`,
          `提示：這是 \\(2I+N\\) 且 \\(N^2=O\\)，所以 \\((2I+N)^n=2^nI+n2^{n-1}N\\)。`
        );
      },
      () => {
        const n = randInt(10, 30);
        const mod = n % 4;
        const ans =
          mod === 0
            ? [
                [1, 0],
                [0, 1],
              ]
            : mod === 1
              ? [
                  [0, 1],
                  [-1, 0],
                ]
              : mod === 2
                ? [
                    [-1, 0],
                    [0, -1],
                  ]
                : [
                    [0, -1],
                    [1, 0],
                  ];
        return s331QA(
          `設 \\(A=\\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}\\)，求 \\(A^{${n}}\\)。`,
          s442MatrixAnswer(ans),
          `提示：此矩陣每 4 次循環一次，先看指數除以 4 的餘數。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442CayleyHamiltonSet(count) {
    const builders = [
      () => {
        const A = [
          [1, 3],
          [2, 4],
        ];
        const tr = A[0][0] + A[1][1];
        const det = s442Det2(A);
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)，驗證 \\(A^2-${tr}A${det < 0 ? '+' + -det : '-' + det}I=O\\)。`,
          `\\(A^2=${s442Matrix(s442Mul(A, A))}\\)，代入後確為零矩陣。`,
          `提示：二階矩陣滿足 \\(A^2-(a+d)A+(ad-bc)I=O\\)。`
        );
      },
      () => {
        const A = [
          [1, 2],
          [3, 4],
        ];
        const A2 = s442Mul(A, A);
        return s331QA(
          `若 \\(A=${s442Matrix(A)}\\)，求常數 \\(p,q\\) 使 \\(A^2=pA+qI\\)。`,
          `\\((p,q)=(5,2)\\)`,
          `提示：由凱萊－哈密頓定理，\\(A^2-(a+d)A+(ad-bc)I=O\\)。`
        );
      },
      () => {
        const A = [
          [2, 1],
          [4, 3],
        ];
        return s331QA(
          `已知 \\(A=${s442Matrix(A)}\\)。利用特徵方程化簡 \\(A^3-5A^2+2A\\)。`,
          `\\(O\\)`,
          `提示：此矩陣滿足 \\(A^2-5A+2I=O\\)，所以 \\(A^3-5A^2+2A=A(A^2-5A+2I)\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442DiagonalPowerSet(count) {
    const builders = [
      () => {
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        const P = [
          [1, 1],
          [1, -1],
        ];
        return s331QA(
          `設 \\(D=\\begin{bmatrix}${a}&0\\\\0&${b}\\end{bmatrix}\\)，且 \\(A=PDP^{-1}\\)。用 \\(P,D\\) 表示 \\(A^n\\)。`,
          `\\(A^n=PD^nP^{-1}\\)，其中 \\(D^n=\\begin{bmatrix}${a}^n&0\\\\0&${b}^n\\end{bmatrix}\\)。`,
          `提示：可對角化矩陣的高次方，重點是把次方集中到對角矩陣。`
        );
      },
      () => {
        const n = randInt(5, 10);
        const d1 = randInt(2, 4);
        const d2 = randInt(2, 4);
        return s331QA(
          `若 \\(B=ADA^{-1}\\)，其中 \\(D=\\begin{bmatrix}${d1}&0\\\\0&${d2}\\end{bmatrix}\\)，求 \\(B^{${n}}\\) 的結構。`,
          `\\(B^{${n}}=AD^{${n}}A^{-1}=A\\begin{bmatrix}${d1 ** n}&0\\\\0&${d2 ** n}\\end{bmatrix}A^{-1}\\)。`,
          `提示：相似變換下的次方可直接推進對角矩陣。`
        );
      },
      () => {
        const A = [
          [3, 1],
          [1, 3],
        ];
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)，向量 \\((1,1)^T\\)、\\((1,-1)^T\\) 分別為特徵向量。求對應特徵值。`,
          `對 \\((1,1)^T\\) 的特徵值為 \\(4\\)，對 \\((1,-1)^T\\) 的特徵值為 \\(2\\)。`,
          `提示：計算 \\(Av\\)，若結果是 \\(\\lambda v\\)，則 \\(\\lambda\\) 為特徵值。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442DetPropertiesSet(count) {
    const builders = [
      () => {
        // det(kA) = k^2 * det(A) for 2x2
        const d = randInt(2, 8);
        const k = randInt(2, 5);
        return s331QA(
          `已知二階矩陣 \\(A\\) 的行列式值 \\(\\det(A)=${d}\\)。求 \\(\\det(${k}A)\\)。`,
          `\\(${k * k * d}\\)`,
          `提示：對 \\(n\\) 階矩陣，\\(\\det(kA)=k^n\\det(A)\\)。這裡 \\(n=2\\)，所以 \\(\\det(${k}A)=${k}^2\\cdot${d}=${k * k * d}\\)。`
        );
      },
      () => {
        // det(AB) = det(A) * det(B)
        const da = randInt(2, 6);
        const db = randInt(2, 6);
        const sign = Math.random() < 0.5 ? -1 : 1;
        const actualDb = sign * db;
        return s331QA(
          `已知 \\(\\det(A)=${da}\\)、\\(\\det(B)=${actualDb}\\)，求 \\(\\det(AB)\\)。`,
          `\\(${da * actualDb}\\)`,
          `提示：\\(\\det(AB)=\\det(A)\\cdot\\det(B)=${da}\\times(${actualDb})=${da * actualDb}\\)。`
        );
      },
      () => {
        // det(A^{-1}B) = det(B)/det(A)
        const da = randInt(2, 5);
        const db = randInt(2, 5);
        return s331QA(
          `已知 \\(\\det(A)=${da}\\)、\\(\\det(B)=${db}\\)，求 \\(\\det(A^{-1}B)\\)。`,
          `\\(${formatFraction(db, da)}\\)`,
          `提示：\\(\\det(A^{-1})=\\frac{1}{\\det(A)}\\)，所以 \\(\\det(A^{-1}B)=\\frac{\\det(B)}{\\det(A)}=\\frac{${db}}{${da}}=${formatFraction(db, da)}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442SimilarMatrixSet(count) {
    const B90 = [[0, -1], [1, 0]];
    const B90inv = [[0, 1], [-1, 0]];

    function computeBABinv(B, Binv, A) {
      return s442Mul(s442Mul(B, A), Binv);
    }

    const builders = [
      () => {
        const a = randInt(-3, 4);
        const b = randInt(-3, 4);
        const c = randInt(-3, 4);
        const d = randInt(-3, 4);
        const A = [[a, b], [c, d]];
        const result = computeBABinv(B90, B90inv, A);
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B90)}\\)。求 \\(BAB^{-1}\\)。`,
          s442MatrixAnswer(result),
          `提示：\\(B\\) 為 \\(90^\\circ\\) 旋轉矩陣，\\(B^{-1}=B^T=${s442Matrix(B90inv)}\\)。先算 \\(BA\\)，再右乘 \\(B^{-1}\\)。`
        );
      },
      () => {
        const k = randInt(1, 4);
        const Bsh = [[1, k], [0, 1]];
        const BshInv = [[1, -k], [0, 1]];
        const a = randInt(-3, 4);
        const b = randInt(-3, 4);
        const c = randInt(-3, 4);
        const d = randInt(-3, 4);
        const A = [[a, b], [c, d]];
        const result = computeBABinv(Bsh, BshInv, A);
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(Bsh)}\\)。求 \\(BAB^{-1}\\)。`,
          s442MatrixAnswer(result),
          `提示：\\(B\\) 為推移矩陣，\\(B^{-1}=${s442Matrix(BshInv)}\\)。先算 \\(BA\\)，再右乘 \\(B^{-1}\\)。`
        );
      },
      () => {
        const a = randInt(1, 5);
        const b = randInt(-3, 4);
        const c = randInt(-3, 4);
        const d = randInt(1, 5);
        const A = [[a, b], [c, d]];
        const tr = a + d;
        const det = s442Det2(A);
        const result = computeBABinv(B90, B90inv, A);
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B90)}\\)。計算 \\(BAB^{-1}\\)，並驗證其跡數與行列式是否與 \\(A\\) 相同。`,
          `\\(BAB^{-1}=${s442Matrix(result)}\\)，跡數 \\(=${tr}\\)，行列式 \\(=${det}\\)，與 \\(A\\) 相同。`,
          `提示：相似矩陣的跡數與行列式均不變，\\(\\operatorname{tr}(A)=${tr}\\)，\\(\\det(A)=${det}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442ElementaryRowOperationSet(count) {
    const builders = [
      () => {
        const k = s441NonzeroInt(-5, 5);
        const A = s442RandomMatrix(2, 3, -4, 5);
        const E = [
          [1, 0],
          [k, 1],
        ];
        const result = s442Mul(E, A);
        return s331QA(
          `矩陣 \\(A=${s442Matrix(A)}\\)。若要對 \\(A\\) 做列運算 \\(R_2\\leftarrow R_2${k >= 0 ? '+' : ''}${k}R_1\\)，求左乘的基本矩陣 \\(E\\)，並求 \\(EA\\)。`,
          `\\(E=${s442Matrix(E)}\\)，\\(EA=${s442Matrix(result)}\\)`,
          `提示：列運算用左乘基本矩陣表示；\\(R_2\\leftarrow R_2+kR_1\\) 對應 \\(\\begin{bmatrix}1&0\\\\k&1\\end{bmatrix}\\)。`
        );
      },
      () => {
        const k = s441NonzeroInt(-4, 4);
        const A = s442RandomMatrix(2, 3, -4, 5);
        const E = [
          [1, k],
          [0, 1],
        ];
        const result = s442Mul(E, A);
        return s331QA(
          `已知 \\(E=${s442Matrix(E)}\\)、\\(A=${s442Matrix(A)}\\)。說明左乘 \\(E\\) 對 \\(A\\) 做了哪個列運算，並求 \\(EA\\)。`,
          `\\(R_1\\leftarrow R_1${k >= 0 ? '+' : ''}${k}R_2\\)，\\(EA=${s442Matrix(result)}\\)`,
          `提示：基本矩陣的非對角元素在第 \\((1,2)\\) 位，表示把第 2 列的 \\(${k}\\) 倍加到第 1 列。`
        );
      },
      () => {
        const A = s442RandomMatrix(3, 3, -3, 5);
        const E = [
          [1, 0, 0],
          [0, 0, 1],
          [0, 1, 0],
        ];
        const result = s442Mul(E, A);
        return s331QA(
          `矩陣 \\(A=${s442Matrix(A)}\\)。若交換第 2 列與第 3 列，寫出左乘基本矩陣 \\(E\\)，並求 \\(EA\\)。`,
          `\\(E=${s442Matrix(E)}\\)，\\(EA=${s442Matrix(result)}\\)`,
          `提示：交換列的基本矩陣，就是把單位矩陣的相同兩列交換。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442EqualityAlgebraMixedSet(count) {
    return buildS223MixedSet(
      [buildS442MatrixEqualitySet, buildS442LinearMatrixAlgebraSet, buildS442MatrixEquationSet],
      count
    );
  }

  function buildS442MultiplicationPropertyMixedSet(count) {
    return buildS223MixedSet(
      [buildS442MultiplicationDimensionSet, buildS442AlgebraicPropertiesSet, buildS442SpecialMatricesSet],
      count
    );
  }

  function buildS442PowerPolynomialMixedSet(count) {
    return buildS223MixedSet([buildS442MatrixPowersSet, buildS442CayleyHamiltonSet, buildS442DiagonalPowerSet], count);
  }

  function s443Inv2(A) {
    const det = s442Det2(A);
    return [
      [formatFraction(A[1][1], det), formatFraction(-A[0][1], det)],
      [formatFraction(-A[1][0], det), formatFraction(A[0][0], det)],
    ];
  }

  function s443Invertible2(min = -5, max = 6) {
    let A;
    do {
      A = s442RandomMatrix(2, 2, min, max);
    } while (s442Det2(A) === 0);
    return A;
  }

  function s443Column(v) {
    return `\\begin{bmatrix}${v[0]}\\\\${v[1]}\\end{bmatrix}`;
  }

  function s443Solve2(A, b) {
    const det = s442Det2(A);
    const x = A[1][1] * b[0] - A[0][1] * b[1];
    const y = -A[1][0] * b[0] + A[0][0] * b[1];
    return [formatFraction(x, det), formatFraction(y, det)];
  }

  function s443Pow2(A, n) {
    let result = [
      [1, 0],
      [0, 1],
    ];
    for (let i = 0; i < n; i += 1) result = s442Mul(result, A);
    return result;
  }

  function buildS443InverseExistenceSet(count) {
    const builders = [
      () => {
        return s331QA(
          `設 \\(A=\\begin{bmatrix}a-3&-1\\\\-2&a-2\\end{bmatrix}\\)。若 \\(A^{-1}\\) 不存在，求實數 \\(a\\)。`,
          `\\(a=1\\) 或 \\(a=4\\)`,
          `提示：反矩陣不存在等價於 \\(\\det(A)=0\\)。此題的行列式會化成含 \\(a\\) 的方程式。`
        );
      },
      () => {
        const x = randInt(-4, 5) || 2;
        const A = [
          [2 * x + 1, 4 * x],
          [x, 2 * x - 1],
        ];
        return s331QA(
          `設 \\(A=\\begin{bmatrix}2x+1&4x\\\\x&2x-1\\end{bmatrix}\\)。若 \\(A\\) 可逆，求 \\(x\\) 的範圍。`,
          `所有實數 \\(x\\) 皆可。`,
          `提示：先算 \\(\\det(A)=(2x+1)(2x-1)-4x^2=-1\\)，此題其實對所有實數都可逆。若改成參數式，仍以 \\(\\det(A)\\ne0\\) 判斷。`
        );
      },
      () => {
        const b = randInt(-5, 5);
        const A = [
          [1 + b, 3 * b],
          [1, b],
        ];
        const exists = s442Det2(A) !== 0;
        return s331QA(
          `設 \\(A=\\begin{bmatrix}a+6&3b\\\\1&a\\end{bmatrix}\\)。若對任意實數 \\(a\\)，\\(A^{-1}\\) 恆存在，求整數 \\(b\\) 的範圍。`,
          `\\(b<3\\)`,
          `提示：\\(\\det(A)=a^2+6a-3b=(a+3)^2-9-3b\\)。要對所有 \\(a\\) 都不為 0，最小值需大於 0。`
        );
      },
      () => {
        const A = [
          [2, 2],
          [2, 2],
        ];
        const B = [
          [1, 2],
          [3, 4],
        ];
        const C = [
          [0, 0],
          [0, 1],
        ];
        return s331QA(
          `判斷下列矩陣哪些沒有反矩陣：\\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\)、\\(C=${s442Matrix(C)}\\)。`,
          `\\(A\\) 與 \\(C\\) 沒有反矩陣。`,
          `提示：二階矩陣只要檢查 \\(ad-bc\\) 是否為 0。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443InverseFormulaSet(count) {
    const builders = [
      () => {
        const A = s443Invertible2(-5, 6);
        return s331QA(
          `求二階方陣 \\(A=${s442Matrix(A)}\\) 的反矩陣 \\(A^{-1}\\)。`,
          `\\(A^{-1}=${s442Matrix(s443Inv2(A))}\\)`,
          `提示：\\(\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}^{-1}=\\frac1{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}\\)。`
        );
      },
      () => {
        const k = randInt(2, 6);
        const A = [
          [0, -1],
          [1, 0],
        ];
        return s331QA(
          `設旋轉矩陣 \\(A=${s442Matrix(A)}\\)。求 \\(A^{-1}\\)，並說明它與 \\(A\\) 的關係。`,
          `\\(A^{-1}=\\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}=-A\\)`,
          `提示：旋轉 \\(90^\\circ\\) 的反向是旋轉 \\(-90^\\circ\\)。也可直接套二階反矩陣公式。`
        );
      },
      () => {
        const a = randInt(-4, 5);
        const d = randInt(-4, 5);
        if (a * d === 0) return builders[0]();
        const A = [
          [a, 0],
          [0, d],
        ];
        return s331QA(
          `設對角矩陣 \\(A=${s442Matrix(A)}\\)。求 \\(A^{-1}\\)。`,
          `\\(A^{-1}=\\begin{bmatrix}${formatFraction(1, a)}&0\\\\0&${formatFraction(1, d)}\\end{bmatrix}\\)`,
          `提示：對角矩陣的反矩陣，就是把每個非零對角元素取倒數。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443InverseMatrixEquationSet(count) {
    const builders = [
      () => {
        const A = s443Invertible2(-4, 5);
        const X = s442RandomMatrix(2, 2, -3, 5);
        const B = s442Mul(A, X);
        return s331QA(
          `已知 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\)，求滿足 \\(AX=B\\) 的矩陣 \\(X\\)。`,
          s442MatrixAnswer(X),
          `提示：左邊是 \\(AX\\)，所以左乘 \\(A^{-1}\\)，得 \\(X=A^{-1}B\\)。`
        );
      },
      () => {
        const A = s443Invertible2(-4, 5);
        const X = s442RandomMatrix(2, 2, -3, 5);
        const B = s442Mul(X, A);
        return s331QA(
          `已知 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\)，求滿足 \\(XA=B\\) 的矩陣 \\(X\\)。`,
          s442MatrixAnswer(X),
          `提示：右邊是 \\(XA\\)，所以右乘 \\(A^{-1}\\)，得 \\(X=BA^{-1}\\)。`
        );
      },
      () => {
        const A = s443Invertible2(-3, 5);
        const x = randInt(-4, 5);
        const y = randInt(-4, 5);
        const b = s442Mul(A, [[x], [y]]).map((row) => row[0]);
        const ans = s443Solve2(A, b);
        return s331QA(
          `利用反矩陣解聯立方程 \\(${s442Matrix(A)}\\begin{bmatrix}x\\\\y\\end{bmatrix}=${s443Column(b)}\\)。`,
          `\\((x,y)=(${ans[0]},${ans[1]})\\)`,
          `提示：把方程寫成 \\(AX=B\\)，再用 \\(X=A^{-1}B\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443InversePropertiesSet(count) {
    const builders = [
      () => {
        const A = s443Invertible2(-3, 5);
        const B = s443Invertible2(-3, 5);
        return s331QA(
          `已知 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\) 皆可逆。寫出 \\((AB)^{-1}\\) 與 \\(A^{-1},B^{-1}\\) 的關係。`,
          `\\((AB)^{-1}=B^{-1}A^{-1}\\)`,
          `提示：反矩陣會把乘法順序反過來，因為 \\((AB)(B^{-1}A^{-1})=I\\)。`
        );
      },
      () => {
        const A = [
          [3, 2],
          [-2, -1],
        ];
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)。若 \\(A^{-1}=rA+sI\\)，求 \\((r,s)\\)。`,
          `\\((r,s)=(-1,2)\\)`,
          `提示：由二階矩陣的特徵方程 \\(A^2-(a+d)A+(ad-bc)I=O\\)，再整理出 \\(A^{-1}\\)。`
        );
      },
      () => {
        const n = randInt(3, 8);
        const A = [
          [1, 1],
          [0, 1],
        ];
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)。求 \\(A^{-${n}}\\)。`,
          `\\(A^{-${n}}=\\begin{bmatrix}1&-${n}\\\\0&1\\end{bmatrix}\\)`,
          `提示：先得 \\(A^{-1}=\\begin{bmatrix}1&-1\\\\0&1\\end{bmatrix}\\)，再觀察次方規律。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443InversePowersSet(count) {
    const builders = [
      () => {
        const A = [
          [0, 1],
          [-1, 0],
        ];
        const n = randInt(7, 25);
        const inv = [
          [0, -1],
          [1, 0],
        ];
        const ans = s443Pow2(inv, n);
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)。求 \\((A^{-1})^{${n}}\\)。`,
          s442MatrixAnswer(ans),
          `提示：\\(A^{-1}\\) 也有 4 次循環，先看指數除以 4 的餘數。`
        );
      },
      () => {
        const A = [
          [2, 1],
          [0, 2],
        ];
        const n = randInt(3, 8);
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)。求 \\(A^{-1}\\)，並寫出 \\((A^{-1})^{${n}}\\)。`,
          `\\(A^{-1}=\\begin{bmatrix}${formatFraction(1, 2)}&${formatFraction(-1, 4)}\\\\0&${formatFraction(1, 2)}\\end{bmatrix}\\)，\\((A^{-1})^{${n}}=\\begin{bmatrix}${formatFraction(1, 2 ** n)}&${formatFraction(-n, 2 ** (n + 1))}\\\\0&${formatFraction(1, 2 ** n)}\\end{bmatrix}\\)`,
          `提示：把 \\(A=2I+N\\)、\\(N^2=O\\)，反矩陣後仍可用同樣的 nilpotent 規律。`
        );
      },
      () => {
        const A = [
          [1, 1],
          [0, 1],
        ];
        const n = randInt(5, 16);
        return s331QA(
          `已知 \\(A=${s442Matrix(A)}\\)。化簡 \\(A^${n}A^{-${n - 2}}\\)。`,
          `\\(A^2=\\begin{bmatrix}1&2\\\\0&1\\end{bmatrix}\\)`,
          `提示：同一可逆矩陣的次方可合併，\\(A^mA^n=A^{m+n}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443InversePolynomialSet(count) {
    const builders = [
      () => {
        const p = randInt(-4, 5) || 2;
        const q = randInt(1, 5);
        const qTerm = q === 1 ? 'I' : `${q}I`;
        const pTerm = p === 1 ? 'A' : p === -1 ? '-A' : `${p}A`;
        const aCoeff = formatFraction(1, q);
        const aTerm = aCoeff === '1' ? 'A' : `${aCoeff}A`;
        const iCoeff = formatFraction(Math.abs(p), q);
        const iTerm = iCoeff === '1' ? 'I' : `${iCoeff}I`;
        return s331QA(
          `已知可逆方陣 \\(A\\) 滿足 \\(A^2=${pTerm}+${qTerm}\\)。試將 \\(A^{-1}\\) 表示成 \\(rA+sI\\) 的形式。`,
          `\\(A^{-1}=${aTerm}${p >= 0 ? '-' : '+'}${iTerm}\\)`,
          `提示：由 \\(A^2-(${pTerm})=${qTerm}\\)，提出 \\(A\\) 得 \\(A(A-${p}I)=${qTerm}\\)。`
        );
      },
      () => {
        const tr = randInt(3, 8);
        const det = randInt(1, 6);
        return s331QA(
          `二階可逆矩陣 \\(A\\) 滿足 \\(A^2-${tr}A+${det}I=O\\)。求 \\(A^{-1}\\) 關於 \\(A,I\\) 的表示式。`,
          `\\(A^{-1}=${formatFraction(tr, det)}I-${formatFraction(1, det)}A\\)`,
          `提示：把等式改寫成 \\(A(${tr}I-A)=${det}I\\)，再左右同除以 \\(${det}\\)。`
        );
      },
      () => {
        const n = randInt(3, 6);
        return s331QA(
          `若可逆方陣 \\(A\\) 滿足 \\(A^2=I\\)，化簡 \\((A^{-1})^{${n}}A^{${n + 1}}\\)。`,
          `\\(A\\)`,
          `提示：\\(A^2=I\\) 代表 \\(A^{-1}=A\\)，再合併同底矩陣的次方。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443TransitionMatrixSet(count) {
    const builders = [
      () => {
        const hit = randInt(55, 85) / 100;
        const miss = randInt(20, 60) / 100;
        const P = [
          [hit, miss],
          [1 - hit, 1 - miss],
        ].map((row) => row.map((v) => Number(v.toFixed(2))));
        return s331QA(
          `某射手前一球進，下一球命中率為 \\(${hit}\\)；前一球沒進，下一球命中率為 \\(${miss}\\)。以狀態向量 \\([進球,未進]^T\\) 表示，寫出轉移矩陣 \\(P\\)。`,
          `\\(P=${s442Matrix(P)}\\)`,
          `提示：每一欄代表「從某狀態轉到各狀態」的機率，因此每欄和為 1。`
        );
      },
      () => {
        const P = [
          [0.8, 0.6],
          [0.2, 0.4],
        ];
        const x0 = [[randInt(2, 8)], [randInt(2, 8)]];
        const x1 = s442Mul(P, x0).map((row) => [Number(row[0].toFixed(2))]);
        return s331QA(
          `已知轉移矩陣 \\(P=${s442Matrix(P)}\\)，初始向量 \\(X_0=${s442Matrix(x0)}\\)。求一步後的狀態向量 \\(X_1\\)。`,
          `\\(X_1=${s442Matrix(x1)}\\)`,
          `提示：狀態更新公式是 \\(X_{n+1}=PX_n\\)。`
        );
      },
      () => {
        const P = [
          [0.5, 0.2],
          [0.5, 0.8],
        ];
        const X0 = [[randInt(3, 8)], [randInt(3, 8)]];
        const X2 = s442Mul(P, s442Mul(P, X0)).map((row) => [Number(row[0].toFixed(2))]);
        return s331QA(
          `某城市人口在兩區間移動，轉移矩陣 \\(P=${s442Matrix(P)}\\)，初始人口向量 \\(X_0=${s442Matrix(X0)}\\)。求兩年後人口向量 \\(X_2\\)。`,
          `\\(X_2=${s442Matrix(X2)}\\)`,
          `提示：兩步後是 \\(X_2=P^2X_0\\)，不要只乘一次。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443StableStateSet(count) {
    const builders = [
      () => {
        const pNum = randInt(3, 7);
        const qNum = randInt(2, 6);
        const p = pNum / 10;
        const q = qNum / 10;
        const oneMinusP = Number((1 - p).toFixed(1));
        const oneMinusQ = Number((1 - q).toFixed(1));
        const xNum = qNum;
        const yNum = 10 - pNum;
        const sum = xNum + yNum;
        return s331QA(
          `已知轉移矩陣 \\(P=\\begin{bmatrix}${p}&${q}\\\\${oneMinusP}&${oneMinusQ}\\end{bmatrix}\\)。若穩定狀態為 \\(X=\\begin{bmatrix}x\\\\y\\end{bmatrix}\\) 且 \\(x+y=1\\)，求 \\(X\\)。`,
          `\\(X=\\begin{bmatrix}${formatFraction(xNum, sum)}\\\\${formatFraction(yNum, sum)}\\end{bmatrix}\\)`,
          `提示：穩定狀態滿足 \\(PX=X\\)，再加上總和為 1。`
        );
      },
      () => {
        const cityA = randInt(40, 70);
        const cityB = 100 - cityA;
        const P = [
          [0.75, 0.25],
          [0.25, 0.75],
        ];
        return s331QA(
          `兩地人口每年各有 \\(25\\%\\) 搬到對方地區。若初始比例為 \\(X_0=\\begin{bmatrix}${cityA}\\\\${cityB}\\end{bmatrix}\\)，長期穩定比例為何？`,
          `\\(\\begin{bmatrix}50\\\\50\\end{bmatrix}\\)`,
          `提示：此轉移矩陣對稱，長期會趨近兩地各半。`
        );
      },
      () => {
        const a = randInt(2, 6) / 10;
        const c = Number((1 - a).toFixed(1));
        return s331QA(
          `已知 \\(P=\\begin{bmatrix}0.6&${a}\\\\0.4&${c}\\end{bmatrix}\\) 的穩定狀態為 \\(\\begin{bmatrix}0.3\\\\0.7\\end{bmatrix}\\)。判斷此條件是否可能成立。`,
          `不可能，因為 \\(0.6\\cdot0.3+${a}\\cdot0.7\\ne0.3\\)。`,
          `提示：把穩定向量代入 \\(PX=X\\)，逐列檢查。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443TransitionPropertySet(count) {
    const builders = [
      () => {
        const b = randInt(2, 7) / 10;
        const c = randInt(2, 7) / 10;
        const a = Number((1 - c).toFixed(1));
        const d = Number((1 - b).toFixed(1));
        return s331QA(
          `設 \\(P=\\begin{bmatrix}a&${b}\\\\${c}&d\\end{bmatrix}\\) 為轉移矩陣。求 \\(a,d\\)。`,
          `\\((a,d)=(${a},${d})\\)`,
          `提示：以欄向量表示狀態時，轉移矩陣每一欄的元素和都必須等於 1。`
        );
      },
      () => {
        const P = [
          [0.8, 0.4],
          [0.2, 0.6],
        ];
        const Q = [
          [0.7, 0.3],
          [0.3, 0.7],
        ];
        const PQ = s442Mul(P, Q).map((row) => row.map((value) => Number(value.toFixed(2))));
        return s331QA(
          `已知 \\(P=${s442Matrix(P)}\\)、\\(Q=${s442Matrix(Q)}\\) 均為轉移矩陣。計算 \\(PQ\\)，並判斷 \\(PQ\\) 是否仍為轉移矩陣。`,
          `\\(PQ=${s442Matrix(PQ)}\\)，仍為轉移矩陣。`,
          `提示：兩個轉移矩陣相乘，仍表示連續兩步的狀態轉移。`
        );
      },
      () => {
        const A = [
          [0.6, 0.2],
          [0.4, 0.8],
        ];
        const B = [
          [0.6, 0.2],
          [0.3, 0.8],
        ];
        return s331QA(
          `判斷 \\(A=${s442Matrix(A)}\\)、\\(B=${s442Matrix(B)}\\) 哪一個是轉移矩陣。`,
          `\\(A\\) 是轉移矩陣，\\(B\\) 不是。`,
          `提示：逐欄檢查元素是否非負，且每一欄總和是否為 1。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443InverseBasicMixedSet(count) {
    return buildS223MixedSet(
      [buildS443InverseExistenceSet, buildS443InverseFormulaSet, buildS443InverseMatrixEquationSet],
      count
    );
  }

  function buildS443InversePropertyMixedSet(count) {
    return buildS223MixedSet(
      [buildS443InversePropertiesSet, buildS443InversePowersSet, buildS443InversePolynomialSet],
      count
    );
  }

  function buildS443TransitionMixedSet(count) {
    return buildS223MixedSet(
      [buildS443TransitionMatrixSet, buildS443StableStateSet, buildS443TransitionPropertySet],
      count
    );
  }

  function s444Vec2(v) {
    return `(${v[0]},${v[1]})`;
  }

  function s444MatVec(A, v) {
    return [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
  }

  function s444LineTex(line) {
    const [a, b, c] = line;
    const aText = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    const bText = b === 0 ? '' : b > 0 ? `+${b === 1 ? '' : b}y` : `-${b === -1 ? '' : Math.abs(b)}y`;
    const cText = c === 0 ? '' : c > 0 ? `+${c}` : `${c}`;
    return `${aText}${bText}${cText}=0`;
  }

  function s444SquareTerm(variable, center) {
    if (center === 0) return `${variable}^2`;
    return `(${variable}${center < 0 ? '+' + Math.abs(center) : '-' + center})^2`;
  }

  function s444MatrixFromColumns(u, v) {
    return [
      [u[0], v[0]],
      [u[1], v[1]],
    ];
  }

  function buildS444PointMappingSet(count) {
    const builders = [
      () => {
        const A = s443Invertible2(-4, 5);
        const P = [randInt(-5, 6), randInt(-5, 6)];
        const Q = s444MatVec(A, P);
        return s331QA(
          `設線性變換 \\(T\\) 的矩陣為 \\(A=${s442Matrix(A)}\\)。求點 \\(P${s444Vec2(P)}\\) 經 \\(T\\) 變換後的像點 \\(P'\\)。`,
          `\\(P'=${s444Vec2(Q)}\\)`,
          `提示：把點當成欄向量，直接計算 \\(P'=AP\\)。`
        );
      },
      () => {
        const A = s443Invertible2(-4, 5);
        const P = [randInt(-4, 5), randInt(-4, 5)];
        const Q = s444MatVec(A, P);
        return s331QA(
          `已知 \\(A=${s442Matrix(A)}\\) 將點 \\(P\\) 映到 \\(P'${s444Vec2(Q)}\\)。求原點 \\(P\\) 的座標。`,
          `\\(P=${s444Vec2(P)}\\)`,
          `提示：由 \\(AP=P'\\)，可用 \\(P=A^{-1}P'\\) 還原。`
        );
      },
      () => {
        const u = [randInt(-4, 5), randInt(-4, 5)];
        const v = [randInt(-4, 5), randInt(-4, 5)];
        const A = s444MatrixFromColumns(u, v);
        return s331QA(
          `二階線性變換 \\(T\\) 將 \\((1,0)\\) 映到 \\(${s444Vec2(u)}\\)，將 \\((0,1)\\) 映到 \\(${s444Vec2(v)}\\)。求 \\(T\\) 的矩陣。`,
          `\\(T=${s442Matrix(A)}\\)`,
          `提示：標準基底的像向量，正好就是變換矩陣的兩個欄向量。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444MatrixSolvingSet(count) {
    const builders = [
      () => {
        const A = s443Invertible2(-3, 5);
        let P = [randInt(-4, 5), randInt(-4, 5)];
        let R = [randInt(-4, 5), randInt(-4, 5)];
        while (P[0] * R[1] - P[1] * R[0] === 0) {
          P = [randInt(-4, 5), randInt(-4, 5)];
          R = [randInt(-4, 5), randInt(-4, 5)];
        }
        const Q = s444MatVec(A, P);
        const S = s444MatVec(A, R);
        return s331QA(
          `已知點 \\(${s444Vec2(P)}\\)、\\(${s444Vec2(R)}\\) 經方陣 \\(A\\) 分別映到 \\(${s444Vec2(Q)}\\)、\\(${s444Vec2(S)}\\)。若這兩個原像不共線於原點，求 \\(A\\)。`,
          `\\(A=${s442Matrix(A)}\\)`,
          `提示：把兩個原像作為欄組成矩陣 \\(X\\)，像點作為欄組成 \\(Y\\)，則 \\(AX=Y\\)。`
        );
      },
      () => {
        const a = randInt(-4, 5);
        const b = randInt(-4, 5);
        const y1 = a + 2 * b;
        const y2 = 2 * a - b;
        return s331QA(
          `線性變換 \\(A=\\begin{bmatrix}1&2\\\\2&-1\\end{bmatrix}\\) 將點 \\((a,b)\\) 映到 \\((${y1},${y2})\\)。求 \\((a,b)\\)。`,
          `\\((a,b)=(${a},${b})\\)`,
          `提示：矩陣映射求原像，就是解二元一次聯立方程式。`
        );
      },
      () => {
        const a = randInt(-5, 5);
        const b = randInt(-5, 5);
        return s331QA(
          `線性變換 \\(A=\\begin{bmatrix}1&a\\\\b&2\\end{bmatrix}\\) 將點 \\((1,2)\\) 映到 \\((${1 + 2 * a},${b + 4})\\)。求 \\(a,b\\)。`,
          `\\((a,b)=(${a},${b})\\)`,
          `提示：先把 \\(A\\begin{bmatrix}1\\\\2\\end{bmatrix}\\) 乘開，再逐項比較。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444RotationReflectionSet(count) {
    const builders = [
      () => {
        const P = [randInt(-6, 6), randInt(-6, 6)];
        const Q = [-P[1], P[0]];
        return s331QA(
          `點 \\(P${s444Vec2(P)}\\) 繞原點逆時針旋轉 \\(90^\\circ\\)，求像點 \\(P'\\)。`,
          `\\(P'=${s444Vec2(Q)}\\)`,
          `提示：逆時針旋轉 \\(90^\\circ\\) 的矩陣是 \\(\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}\\)，座標變成 \\((-y,x)\\)。`
        );
      },
      () => {
        const P = [randInt(-6, 6), randInt(-6, 6)];
        const Q = [P[1], P[0]];
        return s331QA(
          `點 \\(P${s444Vec2(P)}\\) 對直線 \\(y=x\\) 鏡射，求像點 \\(P'\\)。`,
          `\\(P'=${s444Vec2(Q)}\\)`,
          `提示：對 \\(y=x\\) 鏡射會交換兩個座標，矩陣為 \\(\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}\\)。`
        );
      },
      () => {
        const angle = s324Pick([30, 45, 60, 90]);
        const matrix =
          angle === 30
            ? '\\begin{bmatrix}\\frac{\\sqrt3}{2}&-\\frac12\\\\\\frac12&\\frac{\\sqrt3}{2}\\end{bmatrix}'
            : angle === 45
              ? '\\begin{bmatrix}\\frac{\\sqrt2}{2}&-\\frac{\\sqrt2}{2}\\\\\\frac{\\sqrt2}{2}&\\frac{\\sqrt2}{2}\\end{bmatrix}'
              : angle === 60
                ? '\\begin{bmatrix}\\frac12&-\\frac{\\sqrt3}{2}\\\\\\frac{\\sqrt3}{2}&\\frac12\\end{bmatrix}'
                : '\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}';
        return s331QA(
          `寫出繞原點逆時針旋轉 \\(${angle}^\\circ\\) 的二階矩陣。`,
          `\\(${matrix}\\)`,
          `提示：旋轉矩陣為 \\(R_\\theta=\\begin{bmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{bmatrix}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444EquationTransformSet(count) {
    const builders = [
      () => {
        const line = [randInt(1, 5), randInt(-4, 4) || 2, randInt(-6, 6)];
        const ans = [-line[1], line[0], line[2]];
        return s331QA(
          `直線 \\(${s444LineTex(line)}\\) 繞原點逆時針旋轉 \\(90^\\circ\\) 後，求新直線方程式。`,
          `\\(${s444LineTex(ans)}\\)`,
          `提示：新座標 \\((X,Y)=(-y,x)\\)，所以原座標可寫成 \\((x,y)=(Y,-X)\\)，代回原方程。`
        );
      },
      () => {
        const h = randInt(-4, 4);
        const k = randInt(-4, 4);
        const r = randInt(2, 6);
        return s331QA(
          `圓 \\(${s444SquareTerm('x', h)}+${s444SquareTerm('y', k)}=${r * r}\\) 對直線 \\(y=x\\) 鏡射後，求新圓方程式。`,
          `\\(${s444SquareTerm('x', k)}+${s444SquareTerm('y', h)}=${r * r}\\)`,
          `提示：對 \\(y=x\\) 鏡射會交換圓心座標，半徑不變。`
        );
      },
      () => {
        const a = randInt(1, 5);
        const b = randInt(1, 5);
        return s331QA(
          `拋物線 \\(y=${a}x^2+${b}x\\) 對 \\(y\\) 軸鏡射後，求新圖形方程式。`,
          `\\(y=${a}x^2-${b}x\\)`,
          `提示：對 \\(y\\) 軸鏡射時，把原式中的 \\(x\\) 換成 \\(-x\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444ScalingShearSet(count) {
    const builders = [
      () => {
        const sx = randInt(2, 5);
        const sy = randInt(2, 5);
        const P = [randInt(-4, 5), randInt(-4, 5)];
        return s331QA(
          `伸縮變換 \\(A=\\begin{bmatrix}${sx}&0\\\\0&${sy}\\end{bmatrix}\\) 作用於點 \\(P${s444Vec2(P)}\\)。求像點 \\(P'\\)。`,
          `\\(P'=(${sx * P[0]},${sy * P[1]})\\)`,
          `提示：對角矩陣代表沿 \\(x\\)、\\(y\\) 方向分別伸縮。`
        );
      },
      () => {
        const k = randInt(1, 5);
        const P = [randInt(-4, 5), randInt(-4, 5)];
        return s331QA(
          `推移變換 \\(A=\\begin{bmatrix}1&${k}\\\\0&1\\end{bmatrix}\\) 作用於點 \\(P${s444Vec2(P)}\\)。求像點 \\(P'\\)。`,
          `\\(P'=(${P[0] + k * P[1]},${P[1]})\\)`,
          `提示：此推移保持 \\(y\\) 不變，\\(x\\) 方向多加 \\(${k}y\\)。`
        );
      },
      () => {
        const sx = randInt(2, 5);
        const sy = randInt(2, 5);
        return s331QA(
          `單位圓 \\(x^2+y^2=1\\) 經 \\(A=\\begin{bmatrix}${sx}&0\\\\0&${sy}\\end{bmatrix}\\) 伸縮後，求新橢圓方程式與面積。`,
          `\\(\\frac{x^2}{${sx * sx}}+\\frac{y^2}{${sy * sy}}=1\\)，面積為 \\(${sx * sy}\\pi\\)。`,
          `提示：半軸長分別變為 \\(${sx}\\)、\\(${sy}\\)，面積倍率為 \\(|\\det(A)|=${sx * sy}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444AreaScalingSet(count) {
    const builders = [
      () => {
        const area = randInt(3, 12);
        const A = [
          [randInt(1, 4), randInt(-2, 3)],
          [randInt(-2, 3), randInt(1, 4)],
        ];
        const det = Math.abs(s442Det2(A)) || 2;
        const M =
          det === Math.abs(s442Det2(A))
            ? A
            : [
                [2, 0],
                [0, 1],
              ];
        const scale = Math.abs(s442Det2(M));
        return s331QA(
          `已知 \\(\\triangle ABC\\) 面積為 \\(${area}\\)，經矩陣 \\(M=${s442Matrix(M)}\\) 變換後，求新三角形面積。`,
          `\\(${area * scale}\\)`,
          `提示：線性變換後的面積倍率為 \\(|\\det(M)|\\)。`
        );
      },
      () => {
        const area = randInt(2, 10);
        const det = randInt(2, 8);
        return s331QA(
          `由向量 \\(u,v\\) 張成的平行四邊形面積為 \\(${area}\\)。若線性變換 \\(T\\) 的行列式為 \\(${det}\\)，求變換後面積。`,
          `\\(${area * det}\\)`,
          `提示：所有平面面積都會乘上 \\(|\\det(T)|\\)。`
        );
      },
      () => {
        const side = randInt(2, 6);
        const A = [
          [1, 1],
          [2, 1],
        ];
        return s331QA(
          `正方形面積為 \\(${side * side}\\)，經 \\(A=${s442Matrix(A)}\\) 映射後，求新圖形面積為原來的幾倍。`,
          `\\(1\\) 倍`,
          `提示：倍率為 \\(|\\det(A)|=|1\\cdot1-1\\cdot2|=1\\)，面積保持不變。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444InvariantSet(count) {
    const builders = [
      () => {
        const A = [
          [0, -1],
          [1, 0],
        ];
        const u = [randInt(-5, 5), randInt(-5, 5)];
        const v = [randInt(-5, 5), randInt(-5, 5)];
        const dotBefore = u[0] * v[0] + u[1] * v[1];
        const Au = s444MatVec(A, u);
        const Av = s444MatVec(A, v);
        const dotAfter = Au[0] * Av[0] + Au[1] * Av[1];
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\) 為旋轉矩陣，\\(u=${s444Vec2(u)}\\)、\\(v=${s444Vec2(v)}\\)。比較 \\(u\\cdot v\\) 與 \\((Au)\\cdot(Av)\\)。`,
          `兩者相等，皆為 \\(${dotBefore}\\)。`,
          `提示：旋轉會保持長度與夾角，因此內積也保持不變。`
        );
      },
      () => {
        const A = [
          [1, 2],
          [0, 1],
        ];
        const area = randInt(4, 12);
        return s331QA(
          `圖形面積為 \\(${area}\\)，經推移矩陣 \\(A=${s442Matrix(A)}\\) 變換後，面積是否改變？`,
          `不改變，仍為 \\(${area}\\)。`,
          `提示：推移矩陣的行列式為 1，所以面積倍率為 1。`
        );
      },
      () => {
        const k = randInt(2, 5);
        const A = [
          [k, 0],
          [0, k],
        ];
        const length = randInt(2, 8);
        return s331QA(
          `等比例伸縮矩陣 \\(A=${s442Matrix(A)}\\) 作用後，一條長度為 \\(${length}\\) 的線段會變成多長？面積倍率為多少？`,
          `線段長變為 \\(${k * length}\\)，面積倍率為 \\(${k * k}\\)。`,
          `提示：等比例伸縮長度乘 \\(k\\)，面積乘 \\(k^2\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444CompositionPowersSet(count) {
    const builders = [
      () => {
        const P = [randInt(-6, 6), randInt(-6, 6)];
        const afterRotate = [-P[1], P[0]];
        const afterReflect = [afterRotate[0], -afterRotate[1]];
        return s331QA(
          `點 \\(P${s444Vec2(P)}\\) 先繞原點逆時針旋轉 \\(90^\\circ\\)，再對 \\(x\\) 軸鏡射。求最後像點。`,
          `\\(${s444Vec2(afterReflect)}\\)`,
          `提示：複合變換要照順序做；後做的矩陣在左邊。`
        );
      },
      () => {
        const n = randInt(5, 30);
        const mod = n % 4;
        const ans =
          mod === 0
            ? [
                [1, 0],
                [0, 1],
              ]
            : mod === 1
              ? [
                  [0, -1],
                  [1, 0],
                ]
              : mod === 2
                ? [
                    [-1, 0],
                    [0, -1],
                  ]
                : [
                    [0, 1],
                    [-1, 0],
                  ];
        return s331QA(
          `設 \\(R=\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}\\) 為逆時針旋轉 \\(90^\\circ\\) 的矩陣。求 \\(R^{${n}}\\)。`,
          s442MatrixAnswer(ans),
          `提示：旋轉 \\(90^\\circ\\) 每 4 次回到單位矩陣，看指數除以 4 的餘數。`
        );
      },
      () => {
        const A = [
          [0, 1],
          [1, 0],
        ];
        const n = randInt(6, 25);
        const ans =
          n % 2 === 0
            ? [
                [1, 0],
                [0, 1],
              ]
            : A;
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\) 為對 \\(y=x\\) 的鏡射矩陣。求 \\(A^{${n}}\\)。`,
          s442MatrixAnswer(ans),
          `提示：鏡射做兩次回到原圖，所以次方只看奇偶。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444ClassificationSet(count) {
    const builders = [
      () => {
        const choices = [
          [
            '旋轉',
            [
              [0, -1],
              [1, 0],
            ],
          ],
          [
            '對 \\(x\\) 軸鏡射',
            [
              [1, 0],
              [0, -1],
            ],
          ],
          [
            '對 \\(y=x\\) 鏡射',
            [
              [0, 1],
              [1, 0],
            ],
          ],
          [
            '推移',
            [
              [1, 2],
              [0, 1],
            ],
          ],
          [
            '伸縮',
            [
              [2, 0],
              [0, 3],
            ],
          ],
        ];
        const item = s324Pick(choices);
        return s331QA(
          `判斷矩陣 \\(A=${s442Matrix(item[1])}\\) 代表哪一種平面線性變換。`,
          `\\(${item[0]}\\)`,
          `提示：旋轉保長度且 \\(\\det=1\\)；鏡射通常 \\(\\det=-1\\)；推移保面積但不保角度；伸縮看對角倍率。`
        );
      },
      () => {
        const A = [
          [2, 0],
          [0, 3],
        ];
        return s331QA(
          `矩陣 \\(A=${s442Matrix(A)}\\) 是否保持面積不變？若不保持，面積變為幾倍？`,
          `不保持，面積變為 \\(6\\) 倍。`,
          `提示：面積是否不變只看 \\(|\\det(A)|\\) 是否等於 1。`
        );
      },
      () => {
        const A = [
          [1, 2],
          [0, 1],
        ];
        return s331QA(
          `矩陣 \\(A=${s442Matrix(A)}\\) 是不是旋轉矩陣？請說明。`,
          `不是；它是推移矩陣，雖然 \\(\\det(A)=1\\)，但不保持角度。`,
          `提示：旋轉不只保面積，還要保長度與角度。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444LineTransformSet(count) {
    // Image of line ax+by=c under linear transform A=[p,q;r,s]:
    // Inverse substitution: x=(s*X-q*Y)/det, y=(-r*X+p*Y)/det
    // New line: (a*s - b*r)*X + (-a*q + b*p)*Y = c*det(A)
    const builders = [
      () => {
        // Shear A=[1,k;0,1], line ax+by=c
        const k = randInt(1, 4);
        const A = [[1, k], [0, 1]];
        const a = randInt(1, 4);
        const b = randInt(-3, 4) || 1;
        const c = randInt(1, 6);
        // det=1, new coeff: (a*1-b*0)X + (-a*k+b*1)Y = c
        const newA = a;
        const newB = -a * k + b;
        const newC = c;
        const bStr = newB >= 0 ? `+${newB === 1 ? '' : newB}y` : `${newB === -1 ? '-' : newB}y`;
        const oldBStr = b >= 0 ? `+${b === 1 ? '' : b}y` : `${b === -1 ? '-' : b}y`;
        return s331QA(
          `直線 \\(${a}x${oldBStr}=${c}\\) 經矩陣 \\(A=${s442Matrix(A)}\\) 變換後，求新直線方程式。`,
          `\\(${newA}x${bStr}=${newC}\\)`,
          `提示：設新座標 \\((X,Y)=A(x,y)^T\\)，用 \\(A^{-1}\\) 反解 \\((x,y)\\)，代回原直線方程。`
        );
      },
      () => {
        // Scaling A=[s1,0;0,s2], line ax+by=c
        const s1 = randInt(2, 5);
        const s2 = randInt(2, 5);
        const A = [[s1, 0], [0, s2]];
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        const c = randInt(2, 8);
        // det=s1*s2; new: a*s2*X + b*s1*Y = c*s1*s2
        const newA = a * s2;
        const newB = b * s1;
        const newC = c * s1 * s2;
        return s331QA(
          `直線 \\(${a}x+${b}y=${c}\\) 經伸縮矩陣 \\(A=${s442Matrix(A)}\\) 變換後，求新直線方程式。`,
          `\\(${newA}x+${newB}y=${newC}\\)`,
          `提示：伸縮變換 \\(X=${s1}x\\)、\\(Y=${s2}y\\)，故 \\(x=X/${s1}\\)、\\(y=Y/${s2}\\)，代入原直線化簡。`
        );
      },
      () => {
        // Rotation 90°: A=[0,-1;1,0], line ax+by=c
        const a = randInt(1, 4);
        const b = randInt(-4, 5) || 2;
        const c = randInt(1, 6);
        const A = [[0, -1], [1, 0]];
        // det=1; new: (a*0 - b*1)X + (-a*(-1)+b*0)Y = c => -bX + aY = c
        const newA = -b;
        const newB = a;
        const newAStr = newA === 1 ? 'x' : newA === -1 ? '-x' : `${newA}x`;
        const newBStr = newB >= 0 ? `+${newB === 1 ? '' : newB}y` : `${newB === -1 ? '-' : newB}y`;
        const oldBStr = b >= 0 ? `+${b === 1 ? '' : b}y` : `${b === -1 ? '-' : b}y`;
        return s331QA(
          `直線 \\(${a}x${oldBStr}=${c}\\) 經旋轉矩陣 \\(A=${s442Matrix(A)}\\)（逆時針 \\(90^\\circ\\)）變換後，求新直線方程式。`,
          `\\(${newAStr}${newBStr}=${c}\\)`,
          `提示：\\(A\\) 將 \\((x,y)\\) 映射到 \\((-y,x)\\)，故 \\(x=-Y\\)、\\(y=X\\)，代回原直線即得。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444PointMatrixMixedSet(count) {
    return buildS223MixedSet(
      [buildS444PointMappingSet, buildS444MatrixSolvingSet, buildS444RotationReflectionSet],
      count
    );
  }

  function buildS444GeometryEquationMixedSet(count) {
    return buildS223MixedSet(
      [buildS444EquationTransformSet, buildS444ScalingShearSet, buildS444ClassificationSet],
      count
    );
  }

  function buildS444AreaCompositionMixedSet(count) {
    return buildS223MixedSet([buildS444AreaScalingSet, buildS444CompositionPowersSet, buildS444InvariantSet], count);
  }

  function s44LinearK(offset) {
    if (offset === 0) return 'k';
    return offset > 0 ? `k+${offset}` : `k-${Math.abs(offset)}`;
  }

  function s44SignedTerm(value, variable) {
    if (value === 0) return '';
    const absValue = Math.abs(value);
    const body = `${absValue === 1 ? '' : absValue}${variable}`;
    return value > 0 ? `+${body}` : `-${body}`;
  }

  function s44Sqrt2Coord(value) {
    if (value === 0) return '0';
    if (value === 1) return '\\sqrt{2}';
    if (value === -1) return '-\\sqrt{2}';
    return `${value}\\sqrt{2}`;
  }

  function s44NormalizeLine(line) {
    let [a, b, c] = line;
    const g = gcdInt(gcdInt(a, b), c);
    a /= g;
    b /= g;
    c /= g;
    if (a < 0 || (a === 0 && b < 0)) {
      a *= -1;
      b *= -1;
      c *= -1;
    }
    return [a, b, c];
  }

  function buildS441MatrixEntryDoubleSumCleanSet(count) {
    const builders = [
      () => {
        const m = randInt(2, 4);
        const n = randInt(2, 5);
        const alpha = randInt(1, 3);
        const beta = randInt(-3, 4) || 2;
        const gamma = randInt(-4, 5);
        const sumI2 = (m * (m + 1) * (2 * m + 1)) / 6;
        const sumJ = (n * (n + 1)) / 2;
        const total = alpha * n * sumI2 + beta * m * sumJ + gamma * m * n;
        const alphaText = alpha === 1 ? '' : alpha;
        const betaText = s44SignedTerm(beta, 'j');
        const gammaText = gamma === 0 ? '' : gamma > 0 ? `+${gamma}` : `${gamma}`;
        return s331QA(
          `設 \\(m\\times n\\) 矩陣 \\(A=(a_{ij})\\)，其中 \\(m=${m}\\)、\\(n=${n}\\)，且 \\(a_{ij}=${alphaText}i^2${betaText}${gammaText}\\)。求 \\(\\sum_{i=1}^{${m}}\\sum_{j=1}^{${n}}a_{ij}\\)。`,
          `\\(${total}\\)`,
          `提示：把和拆成 \\(${alpha}\\sum_i i^2\\) 出現 ${n} 次、\\(${beta}\\sum_j j\\) 出現 ${m} 次，以及常數項出現 \\(${m}\\cdot ${n}\\) 次。`
        );
      },
      () => {
        const p = randInt(1, 4);
        const q = randInt(-3, 5) || 1;
        const r = randInt(-5, 5);
        const a23 = p * 2 + q * 3 * 3 + r;
        const a32 = p * 3 + q * 2 * 2 + r;
        const total = a23 + a32;
        const qText = s44SignedTerm(q, 'j^2');
        const rText = r === 0 ? '' : r > 0 ? `+${r}` : `${r}`;
        return s331QA(
          `設矩陣 \\(A=(a_{ij})\\) 的元素由 \\(a_{ij}=${p}i${qText}${rText}\\) 決定，求 \\(a_{23}+a_{32}\\)。`,
          `\\(${total}\\)`,
          `提示：\\(a_{23}=${p}\\cdot2+${q}\\cdot3^2${rText}=${a23}\\)，\\(a_{32}=${p}\\cdot3+${q}\\cdot2^2${rText}=${a32}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442CommutatorParameterCleanSet(count) {
    const builders = [
      () => {
        const a = randInt(1, 5);
        const d = a + randInt(1, 4);
        const u = randInt(-3, 4);
        const v = randInt(-4, 5);
        const offset = randInt(-5, 5) || 3;
        const B = [[u, s44LinearK(offset)], [0, v]];
        return s331QA(
          `設 \\(A=${s442Matrix([[a, 0], [0, d]])}\\)、\\(B=${s442Matrix(B)}\\)。若 \\((A+B)^2=A^2+2AB+B^2\\)，求 \\(k\\)。`,
          `\\(k=${-offset}\\)`,
          `提示：矩陣版平方公式成立需 \\(AB=BA\\)。比較右上角得 \\((${a}-${d})(${s44LinearK(offset)})=0\\)，因為 \\(${a}\\ne ${d}\\)，所以 \\(${s44LinearK(offset)}=0\\)。`
        );
      },
      () => {
        const a = randInt(-4, 2);
        const d = a + randInt(2, 6);
        const u = randInt(-3, 4);
        const v = randInt(-4, 5);
        const offset = randInt(-5, 5) || -2;
        const B = [[u, 0], [s44LinearK(offset), v]];
        return s331QA(
          `設 \\(A=${s442Matrix([[a, 0], [0, d]])}\\)、\\(B=${s442Matrix(B)}\\)。若 \\((A+B)^2=A^2+2AB+B^2\\)，求 \\(k\\)。`,
          `\\(k=${-offset}\\)`,
          `提示：展開差異在 \\(BA\\) 與 \\(AB\\)，因此要先令 \\(AB=BA\\)。比較左下角得 \\((${d}-${a})(${s44LinearK(offset)})=0\\)，故 \\(${s44LinearK(offset)}=0\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS442RankOnePowerSumCleanSet(count) {
    const templates = [
      { u: [1, 1], v: [1, 1] },
      { u: [1, 2], v: [1, 2] },
      { u: [2, 1], v: [1, 1] },
    ];
    const builders = [
      () => {
        const { u, v } = s324Pick(templates);
        const A = [[u[0] * v[0], u[0] * v[1]], [u[1] * v[0], u[1] * v[1]]];
        const lambda = v[0] * u[0] + v[1] * u[1];
        const power = randInt(3, 6);
        const coeff = Math.pow(lambda, power - 1);
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)。已知此矩陣可寫成欄向量乘列向量，求 \\(A^{${power}}\\)。`,
          `\\(A^{${power}}=${coeff}A=${s442Matrix(s442Scalar(coeff, A))}\\)`,
          `提示：若 \\(A=uv\\)，則 \\(A^2=u(vu)v=(vu)A\\)。本題 \\(vu=${lambda}\\)，所以 \\(A^n=${lambda}^{n-1}A\\)。`
        );
      },
      () => {
        const { u, v } = s324Pick(templates.slice(0, 2));
        const A = [[u[0] * v[0], u[0] * v[1]], [u[1] * v[0], u[1] * v[1]]];
        const lambda = v[0] * u[0] + v[1] * u[1];
        const last = randInt(3, 5);
        const coeff = Array.from({ length: last }, (_, idx) => Math.pow(lambda, idx)).reduce((sum, value) => sum + value, 0);
        return s331QA(
          `設 \\(A=${s442Matrix(A)}\\)。若 \\(A^2=${lambda}A\\)，求 \\(A+A^2+\\cdots+A^{${last}}\\) 可化為多少倍的 \\(A\\)。`,
          `\\(${coeff}A\\)`,
          `提示：由 \\(A^2=${lambda}A\\) 可得 \\(A^r=${lambda}^{r-1}A\\)，所以係數為 \\(1+${lambda}+\\cdots+${lambda}^{${last - 1}}=${coeff}\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443PowerRecoveryCleanSet(count) {
    const builders = [
      () => {
        const a = randInt(2, 4);
        const b = a + randInt(1, 3);
        const A3 = [[Math.pow(a, 3), 0], [0, Math.pow(b, 3)]];
        const A5 = [[Math.pow(a, 5), 0], [0, Math.pow(b, 5)]];
        return s331QA(
          `設 \\(A\\) 為對角元素皆為正數的對角矩陣，且 \\(A^3=${s442Matrix(A3)}\\)、\\(A^5=${s442Matrix(A5)}\\)。求 \\(A\\) 與 \\(A^2\\)。`,
          `\\(A=${s442Matrix([[a, 0], [0, b]])}\\)，\\(A^2=${s442Matrix([[a * a, 0], [0, b * b]])}\\)`,
          `提示：對角矩陣次方是各對角元素分別次方；也可先用 \\(A^5(A^3)^{-1}=A^2\\)，再取正平方根。`
        );
      },
      () => {
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        const c = randInt(1, 4);
        const A4 = [[Math.pow(a, 4), 0], [0, Math.pow(c, 4)]];
        const A6 = [[Math.pow(a, 6), 0], [0, Math.pow(c, 6)]];
        return s331QA(
          `設 \\(A\\) 為對角元素皆為正數的對角矩陣，且 \\(A^4=${s442Matrix(A4)}\\)、\\(A^6=${s442Matrix(A6)}\\)。求 \\(A^2\\)。`,
          `\\(A^2=${s442Matrix([[a * a, 0], [0, c * c]])}\\)`,
          `提示：\\(A^6(A^4)^{-1}=A^2\\)。本題直接把同位置對角元素相除即可。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS443MatrixCodeDecodeCleanSet(count) {
    const keys = [
      [[1, 1], [1, 2]],
      [[2, 1], [1, 1]],
      [[1, 2], [1, 3]],
    ];
    const builders = [
      () => {
        const K = s324Pick(keys);
        const plain = [randInt(1, 9), randInt(0, 9)];
        const cipher = s444MatVec(K, plain);
        return s331QA(
          `某二位數密碼把原數字向量 \\(P\\) 加密成 \\(C=KP\\)，其中 \\(K=${s442Matrix(K)}\\)。若收到 \\(C=${s442Matrix([[cipher[0]], [cipher[1]]])}\\)，求原來的兩個數字。`,
          `\\(${plain[0]}\\)、\\(${plain[1]}\\)`,
          `提示：因為 \\(K\\) 可逆，所以 \\(P=K^{-1}C\\)。代入計算可還原為 \\(${s442Matrix([[plain[0]], [plain[1]]])}\\)。`
        );
      },
      () => {
        const K = [[1, 1], [2, 3]];
        const word = [randInt(3, 9), randInt(1, 8)];
        const cipher = s444MatVec(K, word);
        return s331QA(
          `以 \\(K=${s442Matrix(K)}\\) 將兩個代號 \\(P=${s442Matrix([['x'], ['y']])}\\) 加密成 \\(C=KP\\)。若密文為 \\(C=${s442Matrix([[cipher[0]], [cipher[1]]])}\\)，求 \\((x,y)\\)。`,
          `\\((x,y)=(${word[0]},${word[1]})\\)`,
          `提示：列方程為 \\(x+y=${cipher[0]}\\)、\\(2x+3y=${cipher[1]}\\)，解得 \\((x,y)=(${word[0]},${word[1]})\\)。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444CoordinateRotationCleanSet(count) {
    const builders = [
      () => {
        const m = randInt(-5, 5) || 2;
        const n = randInt(-4, 4) || -1;
        const oldPoint = [m - n, m + n];
        return s331QA(
          `坐標軸逆時針旋轉 \\(45^\\circ\\) 後，點 \\(P\\) 的新坐標為 \\((${s44Sqrt2Coord(m)},${s44Sqrt2Coord(n)})\\)。求 \\(P\\) 在原坐標軸下的坐標。`,
          `\\(${s444Vec2(oldPoint)}\\)`,
          `提示：軸旋轉 \\(45^\\circ\\) 時，\\(x=\\frac{x'-y'}{\\sqrt2}\\)、\\(y=\\frac{x'+y'}{\\sqrt2}\\)。代入 \\(x'=${s44Sqrt2Coord(m)}\\)、\\(y'=${s44Sqrt2Coord(n)}\\)。`
        );
      },
      () => {
        const x = randInt(-5, 5) || 3;
        const y = randInt(-5, 5) || 1;
        const xPrimeNum = x + y;
        const yPrimeNum = y - x;
        return s331QA(
          `點 \\(P${s444Vec2([x, y])}\\) 在原坐標軸下已知。若坐標軸逆時針旋轉 \\(45^\\circ\\)，求 \\(P\\) 的新坐標。`,
          `\\((\\frac{${xPrimeNum}}{\\sqrt2},\\frac{${yPrimeNum}}{\\sqrt2})\\)`,
          `提示：新坐標為 \\(x'=\\frac{x+y}{\\sqrt2}\\)、\\(y'=\\frac{y-x}{\\sqrt2}\\)，這是坐標軸旋轉，不是把點本身旋轉。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS444LineStretchParameterCleanSet(count) {
    const builders = [
      () => {
        const sx = randInt(2, 5);
        const sy = randInt(2, 5);
        const line = [randInt(1, 4), randInt(-4, 4) || -2, randInt(-6, 6) || 3];
        const imageLine = s44NormalizeLine([line[0] * sy, line[1] * sx, line[2] * sx * sy]);
        return s331QA(
          `線性變換 \\(T(x,y)=(${sx}x,${sy}y)\\)。求直線 \\(${s444LineTex(line)}\\) 經 \\(T\\) 變換後的像直線方程式。`,
          `\\(${s444LineTex(imageLine)}\\)`,
          `提示：令新坐標為 \\((X,Y)=(${sx}x,${sy}y)\\)，則 \\(x=X/${sx}\\)、\\(y=Y/${sy}\\)，代回原方程再整理。`
        );
      },
      () => {
        const t = randInt(1, 4);
        const line = [randInt(1, 5), randInt(-4, 4) || 1, randInt(-5, 5) || -2];
        const imageLine = s44NormalizeLine([line[0], line[1] - t * line[0], line[2]]);
        return s331QA(
          `線性變換 \\(T(x,y)=(x+${t}y,y)\\)。求直線 \\(${s444LineTex(line)}\\) 經 \\(T\\) 變換後的像直線方程式。`,
          `\\(${s444LineTex(imageLine)}\\)`,
          `提示：令新坐標 \\((X,Y)=(x+${t}y,y)\\)，則 \\(x=X-${t}Y\\)、\\(y=Y\\)，代回原直線即可。`
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function s331M(s) {
    return '\\(' + s + '\\)';
  }

  function s331MJ(...parts) {
    return s331M(parts.join(''));
  }

  function s331Ans(short, process) {
    const clean = (value) => String(value).replace(/[。.]$/u, '');
    return '簡答：' + clean(short) + '。過程：' + clean(process) + '。';
  }

  function s331QA(q, short, process) {
    return { q, a: s331Ans(short, process) };
  }

  function s331MakeSet(count, builders) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = builders[i % builders.length]();
      questions.push(item.q);
      answers.push(item.a);
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

    const simpleAnswer = text.match(/簡答[:：]\s*([^。]+)(?:。|$)/u);
    if (simpleAnswer && simpleAnswer[1]) return simpleAnswer[1].trim();

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
      's4-1-1-spatial-relations-three-subtypes': {
        type: 'drill',
        title: '空間關係判斷三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's4-1-1-point-line-plane-relations',
          's4-1-1-plane-determination',
          's4-1-1-polyhedron-edge-relations',
        ],
        generate() {
          return buildS411SpatialRelationsMixedSet(5);
        },
      },
      's4-1-1-distance-three-perpendicular-two-subtypes': {
        type: 'drill',
        title: '三垂線與空間距離二小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-1-1-three-perpendicular-distance', 's4-1-1-projection-distance'],
        generate() {
          return buildS411DistanceMixedSet(5);
        },
      },
      's4-1-1-regular-solid-measure-two-subtypes': {
        type: 'drill',
        title: '正多面體定量二小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-1-1-regular-solid-relations', 's4-1-1-regular-polyhedron-measures'],
        generate() {
          return buildS411RegularSolidMixedSet(5);
        },
      },
      's4-1-1-point-line-plane-relations': {
        type: 'drill',
        title: '空間點線面位置關係判斷',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS411SpatialRelationsSet(5);
        },
      },
      's4-1-1-plane-determination': {
        type: 'drill',
        title: '決定平面的條件判斷',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS411PlaneDeterminationSet(5);
        },
      },
      's4-1-1-polyhedron-edge-relations': {
        type: 'drill',
        title: '立體圖形中的稜線關係',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS411PolyhedronEdgeRelationsSet(5);
        },
      },
      's4-1-1-three-perpendicular-distance': {
        type: 'drill',
        title: '三垂線定理的邊長與距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS411ThreePerpendicularDistanceSet(5);
        },
      },
      's4-1-1-projection-distance': {
        type: 'drill',
        title: '空間投影與距離應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS411ProjectionDistanceSet(5);
        },
      },
      's4-1-1-regular-solid-relations': {
        type: 'drill',
        title: '正多面體的角度與距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS411SolidEdgeRelationsSet(5);
        },
      },
      's4-1-1-regular-polyhedron-measures': {
        type: 'drill',
        title: '正多面體的高度與體積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS411RegularPolyhedronMeasureSet(5);
        },
      },
      's4-1-1-cube-face-center-octahedron-volume-clean': {
        type: 'drill',
        title: '立方體面心正八面體體積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS411CubeFaceCenterOctahedronVolumeCleanSet(5);
        },
      },
      's4-1-2-coordinate-vector-basic-five-subtypes': {
        type: 'drill',
        title: '空間坐標與向量基本五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's4-1-2-point-projection-distance',
          's4-1-2-vector-operation-length',
          's4-1-2-section-centroid',
          's4-1-2-direction-cosines',
          's4-1-2-coordinate-geometry',
        ],
        generate() {
          return buildS412CoordinateBasicMixedSet(5);
        },
      },
      's4-1-2-extrema-projection-three-subtypes': {
        type: 'drill',
        title: '空間距離極值與投影三小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: ['s4-1-2-quadratic-extrema', 's4-1-2-reflection-shortest-path', 's4-1-2-projection-area'],
        generate() {
          return buildS412ExtremaProjectionMixedSet(5);
        },
      },
      's4-1-2-solid-advanced-two-subtypes': {
        type: 'drill',
        title: '立體坐標還原與角平分二小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-1-2-solid-coordinate-restore', 's4-1-2-angle-bisector-vector'],
        generate() {
          return buildS412SolidAdvancedMixedSet(5);
        },
      },
      's4-1-2-point-projection-distance': {
        type: 'drill',
        title: '點坐標的投影、對稱與距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412PointProjectionDistanceSet(5);
        },
      },
      's4-1-2-vector-operation-length': {
        type: 'drill',
        title: '空間向量線性運算與長度',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412VectorOperationLengthSet(5);
        },
      },
      's4-1-2-section-centroid': {
        type: 'drill',
        title: '分點公式與重心坐標',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412SectionCentroidSet(5);
        },
      },
      's4-1-2-direction-cosines': {
        type: 'drill',
        title: '方向角與方向餘弦',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412DirectionCosinesSet(5);
        },
      },
      's4-1-2-coordinate-geometry': {
        type: 'drill',
        title: '坐標化幾何判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412CoordinateGeometrySet(5);
        },
      },
      's4-1-2-quadratic-extrema': {
        type: 'drill',
        title: '平方和與距離極值',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS412QuadraticExtremaSet(5);
        },
      },
      's4-1-2-reflection-shortest-path': {
        type: 'drill',
        title: '空間反射與最短路徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412ReflectionPathSet(5);
        },
      },
      's4-1-2-projection-area': {
        type: 'drill',
        title: '特殊幾何圖形的投影面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412ProjectionAreaSet(5);
        },
      },
      's4-1-2-solid-coordinate-restore': {
        type: 'drill',
        title: '立體圖形的頂點坐標還原',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412SolidCoordinateRestoreSet(5);
        },
      },
      's4-1-2-angle-bisector-vector': {
        type: 'drill',
        title: '空間向量角平分與單位化',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412AngleBisectorVectorSet(5);
        },
      },
      's4-1-2-symmetric-line-equation': {
        type: 'drill',
        title: '空間直線的對稱式方程',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412SymmetricLineEquationSet(5);
        },
      },
      's4-1-2-axis-equidistant-point-clean': {
        type: 'drill',
        title: '坐標軸上等距點',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412AxisEquidistantPointCleanSet(5);
        },
      },
      's4-1-2-centroid-plane-projection-clean': {
        type: 'drill',
        title: '重心投影到坐標平面',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412CentroidPlaneProjectionCleanSet(5);
        },
      },
      's4-1-3-inner-product-angle-four-subtypes': {
        type: 'drill',
        title: '空間內積與夾角四小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's4-1-3-inner-product-angle',
          's4-1-3-perpendicular-parallel',
          's4-1-3-length-combination',
          's4-1-3-triangle-area',
        ],
        generate() {
          return buildS413InnerProductMixedSet(5);
        },
      },
      's4-1-3-projection-plane-three-subtypes': {
        type: 'drill',
        title: '正射影與平面法向量三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-1-3-projection-vector', 's4-1-3-plane-normal-projection', 's4-1-3-angle-bisector'],
        generate() {
          return buildS413ProjectionPlaneMixedSet(5);
        },
      },
      's4-1-3-cauchy-extrema-three-subtypes': {
        type: 'drill',
        title: '柯西極值與面積三小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: ['s4-1-3-cauchy-extrema', 's4-1-3-triangle-area', 's4-1-3-length-combination'],
        generate() {
          return buildS413CauchyExtremaMixedSet(5);
        },
      },
      's4-1-3-inner-product-angle': {
        type: 'drill',
        title: '內積基本運算與夾角計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413InnerProductAngleSet(5);
        },
      },
      's4-1-3-perpendicular-parallel': {
        type: 'drill',
        title: '垂直與平行判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413PerpendicularParallelSet(5);
        },
      },
      's4-1-3-length-combination': {
        type: 'drill',
        title: '向量長度組合與模長極值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413LengthCombinationSet(5);
        },
      },
      's4-1-3-projection-vector': {
        type: 'drill',
        title: '正射影向量與正射影長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413ProjectionVectorSet(5);
        },
      },
      's4-1-3-plane-normal-projection': {
        type: 'drill',
        title: '平面法向量與正射影',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413PlaneNormalProjectionSet(5);
        },
      },
      's4-1-3-angle-bisector': {
        type: 'drill',
        title: '角平分向量與內積應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413AngleBisectorSet(5);
        },
      },
      's4-1-3-cauchy-extrema': {
        type: 'drill',
        title: '柯西不等式與極值應用',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS413CauchyExtremaSet(5);
        },
      },
      's4-1-3-triangle-area': {
        type: 'drill',
        title: '三角形面積與幾何性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413TriangleAreaSet(5);
        },
      },
      's4-1-3-amgm-extrema': {
        type: 'drill',
        title: 'AM-GM與球面距離極值',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS413AMGMExtremaSet(5);
        },
      },
      's4-1-3-angle-bisector-coefficient-clean': {
        type: 'drill',
        title: '角平分向量係數反推',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413AngleBisectorCoefficientCleanSet(5);
        },
      },
      's4-1-3-linear-over-norm-extrema-clean': {
        type: 'drill',
        title: '一次式除以向量長度的最大最小',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413LinearOverNormExtremaCleanSet(5);
        },
      },
      's4-1-3-pairwise-orthogonal-parameter-clean': {
        type: 'drill',
        title: '三向量兩兩垂直參數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413PairwiseOrthogonalParameterCleanSet(5);
        },
      },
      's4-1-4-cross-area-distance-three-subtypes': {
        type: 'composite',
        title: '外積、面積與距離三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-1-4-cross-basic-normal', 's4-1-4-cross-area-distance', 's4-1-4-cross-length-identity'],
        generate() {
          return buildS414CrossAreaMixedSet(5);
        },
      },
      's4-1-4-volume-coplanar-parameter-three-subtypes': {
        type: 'composite',
        title: '體積、共面與參數三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-1-4-triple-volume', 's4-1-4-coplanar-collinear', 's4-1-4-parameter-inverse'],
        generate() {
          return buildS414VolumeCoplanarMixedSet(5);
        },
      },
      's4-1-4-determinant-algebra-four-subtypes': {
        type: 'composite',
        title: '行列式代數與進階四小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's4-1-4-determinant-properties',
          's4-1-4-numeric-determinants',
          's4-1-4-determinant-equations',
          's4-1-4-advanced-polynomial-determinants',
        ],
        generate() {
          return buildS414DeterminantAlgebraMixedSet(5);
        },
      },
      's4-1-4-cross-basic-normal': {
        type: 'drill',
        title: '外積基本與公垂向量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414CrossBasicNormalSet(5);
        },
      },
      's4-1-4-cross-area-distance': {
        type: 'drill',
        title: '外積面積與點線距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414CrossAreaDistanceSet(5);
        },
      },
      's4-1-4-cross-length-identity': {
        type: 'drill',
        title: '外積長度與內積恆等式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414CrossLengthIdentitySet(5);
        },
      },
      's4-1-4-triple-volume': {
        type: 'drill',
        title: '三階行列式與體積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414TripleVolumeSet(5);
        },
      },
      's4-1-4-coplanar-collinear': {
        type: 'drill',
        title: '共面與共線判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414CoplanarCollinearSet(5);
        },
      },
      's4-1-4-parameter-inverse': {
        type: 'drill',
        title: '含參數面積與體積逆算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414ParameterInverseSet(5);
        },
      },
      's4-1-4-determinant-properties': {
        type: 'drill',
        title: '行列式運算性質與體積變換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414DeterminantPropertiesSet(5);
        },
      },
      's4-1-4-numeric-determinants': {
        type: 'drill',
        title: '數值化簡與特殊矩陣',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414NumericDeterminantSet(5);
        },
      },
      's4-1-4-determinant-equations': {
        type: 'drill',
        title: '行列式方程式與多項式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414DeterminantEquationSet(5);
        },
      },
      's4-1-4-advanced-polynomial-determinants': {
        type: 'drill',
        title: '多項式與代數恆等式應用',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS414AdvancedPolynomialSet(5);
        },
      },
      's4-1-1-equidistant-plane-locus-clean': {
        type: 'drill',
        title: '等距點在坐標平面上的軌跡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS411EquidistantPlaneLocusCleanSet(5);
        },
      },
      's4-1-1-moving-point-distance-clean': {
        type: 'drill',
        title: '空間等速動點距離極值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS411MovingPointDistanceCleanSet(5);
        },
      },
      's4-1-2-unit-direction-sum-clean': {
        type: 'drill',
        title: '同方向單位向量與坐標和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412UnitDirectionSumCleanSet(5);
        },
      },
      's4-1-2-parametric-vector-min-clean': {
        type: 'drill',
        title: '參數空間向量長度最小值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412ParametricVectorMinCleanSet(5);
        },
      },
      's4-1-2-line-projection-point-clean': {
        type: 'drill',
        title: '點到空間直線的正射影點',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS412LineProjectionPointCleanSet(5);
        },
      },
      's4-1-3-projection-scalar-clean': {
        type: 'drill',
        title: '帶正負正射影長判讀',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413ProjectionScalarCleanSet(5);
        },
      },
      's4-1-3-sphere-linear-extrema-clean': {
        type: 'drill',
        title: '球面上一次式最大最小值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413SphereLinearExtremaCleanSet(5);
        },
      },
      's4-1-3-plane-distance-minimum-clean': {
        type: 'drill',
        title: '平面限制下的平方距離最小值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS413PlaneDistanceMinimumCleanSet(5);
        },
      },
      's4-1-4-triangle-height-clean': {
        type: 'drill',
        title: '外積求空間三角形的高',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414TriangleHeightCleanSet(5);
        },
      },
      's4-1-4-volume-linear-combination-clean': {
        type: 'drill',
        title: '向量線性組合下的體積倍率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414VolumeLinearCombinationCleanSet(5);
        },
      },
      's4-1-4-vandermonde-parameter-clean': {
        type: 'drill',
        title: '范德蒙行列式參數方程',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414VandermondeParameterCleanSet(5);
        },
      },
      's4-1-4-determinant-operation-clean': {
        type: 'drill',
        title: '三階行列式欄運算性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414DeterminantOperationCleanSet(5);
        },
      },
      's4-1-4-consecutive-row-determinant-clean': {
        type: 'drill',
        title: '連續型三階行列式化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS414ConsecutiveRowDeterminantCleanSet(5);
        },
      },
      's4-2-1-plane-equation-three-subtypes': {
        type: 'composite',
        title: '平面方程與幾何關係三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-2-1-point-normal-plane', 's4-2-1-three-point-intercept-plane', 's4-2-1-plane-relation-angle'],
        generate() {
          return buildS421PlaneEquationMixedSet(5);
        },
      },
      's4-2-1-distance-projection-four-subtypes': {
        type: 'composite',
        title: '距離、投影與垂直平分面四小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's4-2-1-point-plane-distance',
          's4-2-1-parallel-plane-distance',
          's4-2-1-projection-reflection',
          's4-2-1-perpendicular-bisector',
        ],
        generate() {
          return buildS421DistanceProjectionMixedSet(5);
        },
      },
      's4-2-1-plane-application-three-subtypes': {
        type: 'composite',
        title: '平面應用、極值與建模三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-2-1-plane-family-volume', 's4-2-1-reflection-shortest-path', 's4-2-1-point-plane-distance'],
        generate() {
          return buildS421PlaneApplicationMixedSet(5);
        },
      },
      's4-2-1-point-normal-plane': {
        type: 'drill',
        title: '點法式建立平面方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421PointNormalPlaneSet(5);
        },
      },
      's4-2-1-three-point-intercept-plane': {
        type: 'drill',
        title: '三點式與截距式決定平面',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421ThreePointInterceptPlaneSet(5);
        },
      },
      's4-2-1-plane-relation-angle': {
        type: 'drill',
        title: '平面平行、垂直與夾角判別',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421PlaneRelationAngleSet(5);
        },
      },
      's4-2-1-point-plane-distance': {
        type: 'drill',
        title: '點到平面的距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421PointPlaneDistanceSet(5);
        },
      },
      's4-2-1-parallel-plane-distance': {
        type: 'drill',
        title: '兩平行平面的距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421ParallelPlaneDistanceSet(5);
        },
      },
      's4-2-1-projection-reflection': {
        type: 'drill',
        title: '投影點與對稱點',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421ProjectionReflectionSet(5);
        },
      },
      's4-2-1-perpendicular-bisector': {
        type: 'drill',
        title: '垂直平分面與等距離軌跡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421PerpendicularBisectorSet(5);
        },
      },
      's4-2-1-plane-family-volume': {
        type: 'drill',
        title: '截距式、平面族與體積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421PlaneFamilyVolumeSet(5);
        },
      },
      's4-2-1-reflection-shortest-path': {
        type: 'drill',
        title: '反射法與空間最短路徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421ReflectionShortestPathSet(5);
        },
      },
      's4-2-1-two-plane-intersection': {
        type: 'drill',
        title: '兩平面交線方向與方程',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421TwoPlaneIntersectionSet(5);
        },
      },
      's4-2-1-plane-special-condition': {
        type: 'drill',
        title: '特殊條件平面建構（平行向量、垂直直線、含線垂面）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421PlaneSpecialConditionSet(5);
        },
      },
      's4-2-2-coordinate-line-three-subtypes': {
        type: 'composite',
        title: '直線方程、穿透點與參數限制三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-2-2-line-equation-basic', 's4-2-2-pierce-coordinate-plane', 's4-2-2-parameter-constraint'],
        generate() {
          return buildS422CoordinateLineMixedSet(5);
        },
      },
      's4-2-2-relation-distance-four-subtypes': {
        type: 'composite',
        title: '線面關係、投影與線線距離四小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's4-2-2-line-plane-interaction',
          's4-2-2-point-line-projection',
          's4-2-2-parallel-skew-distance',
          's4-2-2-common-perpendicular',
        ],
        generate() {
          return buildS422RelationDistanceMixedSet(5);
        },
      },
      's4-2-2-advanced-line-three-subtypes': {
        type: 'composite',
        title: '動點極值與包含直線平面三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-2-2-moving-point-extrema', 's4-2-2-plane-containing-line', 's4-2-2-line-plane-interaction'],
        generate() {
          return buildS422AdvancedLineMixedSet(5);
        },
      },
      's4-2-2-line-equation-basic': {
        type: 'drill',
        title: '空間直線參數式與對稱式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422LineEquationBasicSet(5);
        },
      },
      's4-2-2-pierce-coordinate-plane': {
        type: 'drill',
        title: '穿透坐標平面與坐標軸',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422PierceCoordinatePlaneSet(5);
        },
      },
      's4-2-2-parameter-constraint': {
        type: 'drill',
        title: '線段、射線與參數限制',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422ParameterConstraintSet(5);
        },
      },
      's4-2-2-line-plane-interaction': {
        type: 'drill',
        title: '直線與平面的相交、平行與夾角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422LinePlaneInteractionSet(5);
        },
      },
      's4-2-2-point-line-projection': {
        type: 'drill',
        title: '點到直線的投影與對稱點',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422PointLineProjectionSet(5);
        },
      },
      's4-2-2-parallel-skew-distance': {
        type: 'drill',
        title: '平行線與歪斜線距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422ParallelSkewDistanceSet(5);
        },
      },
      's4-2-2-common-perpendicular': {
        type: 'drill',
        title: '歪斜線公垂線與最短距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422CommonPerpendicularSet(5);
        },
      },
      's4-2-2-moving-point-extrema': {
        type: 'drill',
        title: '直線上動點的極值問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422MovingPointExtremaSet(5);
        },
      },
      's4-2-2-plane-containing-line': {
        type: 'drill',
        title: '包含直線的平面建構',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422PlaneContainingLineSet(5);
        },
      },
      's4-2-2-two-line-relation-full': {
        type: 'drill',
        title: '兩直線完整關係判斷與求值（平行、相交、歪斜）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422TwoLineRelationFullSet(5);
        },
      },
      's4-2-2-line-perp-plane': {
        type: 'drill',
        title: '直線通過點且垂直平面',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422LinePerpPlaneSet(5);
        },
      },
      's4-2-1-common-line-plane-family-clean': {
        type: 'drill',
        title: '通過兩點的平面族共同交集',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421CommonLinePlaneFamilyCleanSet(5);
        },
      },
      's4-2-1-coplanar-parameter-clean': {
        type: 'drill',
        title: '四點共面與參數求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421CoplanarParameterCleanSet(5);
        },
      },
      's4-2-1-parallel-plane-distance-parameter-clean': {
        type: 'drill',
        title: '平行平面的距離與參數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421ParallelPlaneDistanceParameterCleanSet(5);
        },
      },
      's4-2-1-plane-angle-parameter-clean': {
        type: 'drill',
        title: '平面平行垂直的參數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421PlaneAngleParameterCleanSet(5);
        },
      },
      's4-2-1-plane-system-consistency-clean': {
        type: 'drill',
        title: '三平面方程組共線參數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421PlaneSystemConsistencyCleanSet(5);
        },
      },
      's4-2-1-segment-projection-length-clean': {
        type: 'drill',
        title: '線段在平面上的正射影長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS421SegmentProjectionLengthCleanSet(5);
        },
      },
      's4-2-2-line-relation-classification-clean': {
        type: 'drill',
        title: '兩直線位置關係判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422LineRelationClassificationCleanSet(5);
        },
      },
      's4-2-2-line-plane-hit-time-clean': {
        type: 'drill',
        title: '直線動點到達平面的時間',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422LinePlaneHitTimeCleanSet(5);
        },
      },
      's4-2-2-line-plane-relation-clean': {
        type: 'drill',
        title: '直線與平面關係判斷',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422LinePlaneRelationCleanSet(5);
        },
      },
      's4-2-2-point-line-reflection-clean': {
        type: 'drill',
        title: '點到直線垂足與對稱點',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422PointLineReflectionCleanSet(5);
        },
      },
      's4-2-2-two-plane-line-param-clean': {
        type: 'drill',
        title: '兩平面交線轉參數式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422TwoPlaneLineParamCleanSet(5);
        },
      },
      's4-2-2-coplanar-perpendicular-line-clean': {
        type: 'drill',
        title: '過點作共面垂直直線',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422CoplanarPerpendicularLineCleanSet(5);
        },
      },
      's4-2-2-line-projection-on-plane-clean': {
        type: 'drill',
        title: '直線投影到平面',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS422LineProjectionOnPlaneCleanSet(5);
        },
      },
      's4-3-1-basic-sampling-three-subtypes': {
        type: 'composite',
        title: '條件機率基礎與抽樣三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-3-1-conditional-algebra', 's4-3-1-concrete-conditions', 's4-3-1-drawing-sampling'],
        generate() {
          return buildS431BasicSamplingMixedSet(5);
        },
      },
      's4-3-1-bayes-source-three-subtypes': {
        type: 'composite',
        title: '比例統計、貝氏定理與來源反推三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-3-1-social-table', 's4-3-1-diagnostic-bayes', 's4-3-1-multi-source'],
        generate() {
          return buildS431BayesSourceMixedSet(5);
        },
      },
      's4-3-1-inference-transition-three-subtypes': {
        type: 'composite',
        title: '獨立推論、狀態轉移與分層統計三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-3-1-independent-inference', 's4-3-1-sequence-transition', 's4-3-1-stratified-statistics'],
        generate() {
          return buildS431InferenceTransitionMixedSet(5);
        },
      },
      's4-3-1-conditional-algebra': {
        type: 'drill',
        title: '條件機率的代數運算與性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431ConditionalAlgebraSet(5);
        },
      },
      's4-3-1-concrete-conditions': {
        type: 'drill',
        title: '具體情境中的離散試驗',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431ConcreteConditionSet(5);
        },
      },
      's4-3-1-drawing-sampling': {
        type: 'drill',
        title: '抽球試驗與機率乘法法則',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431DrawingSamplingSet(5);
        },
      },
      's4-3-1-social-table': {
        type: 'drill',
        title: '社會統計比例與 2x2 表格判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431SocialTableSet(5);
        },
      },
      's4-3-1-diagnostic-bayes': {
        type: 'drill',
        title: '產品檢測與疾病篩檢的貝氏定理',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431DiagnosticBayesSet(5);
        },
      },
      's4-3-1-multi-source': {
        type: 'drill',
        title: '多個袋子或工廠的來源反推',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431MultiSourceSet(5);
        },
      },
      's4-3-1-independent-inference': {
        type: 'drill',
        title: '多位成員獨立事件的結果判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431IndependentInferenceSet(5);
        },
      },
      's4-3-1-sequence-transition': {
        type: 'drill',
        title: '轉移與局數後的機率推求',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431SequenceTransitionSet(5);
        },
      },
      's4-3-1-stratified-statistics': {
        type: 'drill',
        title: '分層抽樣與社會統計',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431StratifiedStatsSet(5);
        },
      },
      's4-3-1-complement-conditional': {
        type: 'drill',
        title: '補事件條件機率 P(A|B^c) 與 P(B|A^c)',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431ComplementConditionalSet(5);
        },
      },
      's4-3-1-total-prob-abstract': {
        type: 'drill',
        title: '全機率公式抽象樹形（直接給 P(B|A), P(B|A^c)）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431TotalProbAbstractSet(5);
        },
      },
      's4-3-1-drawer-paradox-clean': {
        type: 'drill',
        title: '抽屜與雙面卡片的條件樣本空間',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431DrawerParadoxCleanSet(5);
        },
      },
      's4-3-1-lost-card-bayes-clean': {
        type: 'drill',
        title: '遺失牌與觀察結果的貝氏反推',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431LostCardBayesCleanSet(5);
        },
      },
      's4-3-1-truth-report-color-clean': {
        type: 'drill',
        title: '證詞可靠度與球色反推',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431TruthReportColorCleanSet(5);
        },
      },
      's4-3-1-signal-channel-bayes-clean': {
        type: 'drill',
        title: '通訊誤碼與原訊號反推',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS431SignalChannelBayesCleanSet(5);
        },
      },
      's4-3-2-independence-trials-three-subtypes': {
        type: 'composite',
        title: '獨立事件代數與重複試驗三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-3-2-independence-algebra', 's4-3-2-repeated-trials', 's4-3-2-ordered-success'],
        generate() {
          return buildS432IndependenceTrialMixedSet(5);
        },
      },
      's4-3-2-tables-systems-three-subtypes': {
        type: 'composite',
        title: '列聯表、多人成功與系統路徑三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-3-2-two-way-table-independence', 's4-3-2-multi-member-success', 's4-3-2-circuit-path'],
        generate() {
          return buildS432TableSystemMixedSet(5);
        },
      },
      's4-3-2-advanced-distribution-three-subtypes': {
        type: 'composite',
        title: '競賽順序、代數性質與分布規律三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-3-2-sequential-competition', 's4-3-2-algebraic-properties', 's4-3-2-distribution-patterns'],
        generate() {
          return buildS432AdvancedDistributionMixedSet(5);
        },
      },
      's4-3-2-independence-algebra': {
        type: 'drill',
        title: '獨立事件的代數判定與求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432IndependenceAlgebraSet(5);
        },
      },
      's4-3-2-repeated-trials': {
        type: 'drill',
        title: '獨立重複試驗與二項機率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432RepeatedTrialsSet(5);
        },
      },
      's4-3-2-ordered-success': {
        type: 'drill',
        title: '有序成功與特定次序機率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432OrderedSuccessSet(5);
        },
      },
      's4-3-2-two-way-table-independence': {
        type: 'drill',
        title: '二維表格的獨立性判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432TwoWayTableIndependenceSet(5);
        },
      },
      's4-3-2-multi-member-success': {
        type: 'drill',
        title: '多位成員的獨立成功率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432MultiMemberSuccessSet(5);
        },
      },
      's4-3-2-circuit-path': {
        type: 'drill',
        title: '開關電路與路徑暢通機率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432CircuitPathSet(5);
        },
      },
      's4-3-2-sequential-competition': {
        type: 'drill',
        title: '輪流競賽與先達標者勝',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432SequentialCompetitionSet(5);
        },
      },
      's4-3-2-algebraic-properties': {
        type: 'drill',
        title: '獨立事件的代數性質應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432AlgebraicPropertiesSet(5);
        },
      },
      's4-3-2-distribution-patterns': {
        type: 'drill',
        title: '機率分布規律與大小比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432DistributionPatternsSet(5);
        },
      },
      's4-3-2-inverse-bayes': {
        type: 'drill',
        title: '逆向 Bayes：已知 P(A|B) 求 P(B|A)',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432InverseBayesSet(5);
        },
      },
      's4-3-2-exam-guessing': {
        type: 'drill',
        title: '考試猜題 Bayes 模型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432ExamGuessingSet(5);
        },
      },
      's4-3-2-conditioned-success-position-clean': {
        type: 'drill',
        title: '已知成功總數下的位置機率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432ConditionedSuccessPositionCleanSet(5);
        },
      },
      's4-3-2-traffic-light-counts-clean': {
        type: 'drill',
        title: '紅綠燈獨立事件與恰遇次數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS432TrafficLightCountsCleanSet(5);
        },
      },
      's4-4-1-basic-cramer-three-subtypes': {
        type: 'composite',
        title: '三元方程求解、克拉瑪與特殊解三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-4-1-gaussian-basic', 's4-4-1-cramer-determinants', 's4-4-1-special-solutions'],
        generate() {
          return buildS441BasicCramerMixedSet(5);
        },
      },
      's4-4-1-parameter-geometry-three-subtypes': {
        type: 'composite',
        title: '參數討論、齊次比例與平面關係三小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: ['s4-4-1-parameter-solutions', 's4-4-1-homogeneous-ratios', 's4-4-1-plane-relations'],
        generate() {
          return buildS441ParameterGeometryMixedSet(5);
        },
      },
      's4-4-1-matrix-model-three-subtypes': {
        type: 'composite',
        title: '矩陣還原、共面線性與建模三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's4-4-1-matrix-back-substitution',
          's4-4-1-coplanar-linear-combination',
          's4-4-1-modeling-applications',
        ],
        generate() {
          return buildS441MatrixModelMixedSet(5);
        },
      },
      's4-4-1-gaussian-basic': {
        type: 'drill',
        title: '高斯消去法與矩陣列運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS441GaussianBasicSet(5);
        },
      },
      's4-4-1-cramer-determinants': {
        type: 'drill',
        title: '克拉瑪公式與三階行列式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS441CramerDeterminantSet(5);
        },
      },
      's4-4-1-special-solutions': {
        type: 'drill',
        title: '無解、唯一解與無限多解判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS441SpecialSolutionsSet(5);
        },
      },
      's4-4-1-parameter-solutions': {
        type: 'drill',
        title: '含參數方程組的解數討論',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS441ParameterSolutionsSet(5);
        },
      },
      's4-4-1-homogeneous-ratios': {
        type: 'drill',
        title: '齊次方程組與非零比例解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS441HomogeneousRatioSet(5);
        },
      },
      's4-4-1-plane-relations': {
        type: 'drill',
        title: '三平面的幾何關係判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS441PlaneRelationsSet(5);
        },
      },
      's4-4-1-matrix-back-substitution': {
        type: 'drill',
        title: '增廣矩陣係數還原與回代',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS441MatrixBackSubstitutionSet(5);
        },
      },
      's4-4-1-coplanar-linear-combination': {
        type: 'drill',
        title: '空間共面與線性組合判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS441CoplanarLinearSet(5);
        },
      },
      's4-4-1-modeling-applications': {
        type: 'drill',
        title: '三元一次方程組生活建模',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS441ModelingSet(5);
        },
      },
      's4-4-1-reciprocal-substitution': {
        type: 'drill',
        title: '倒數代換解三元方程組',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS441ReciprocalSubstitutionSet(5);
        },
      },
      's4-4-1-matrix-entry-double-sum-clean': {
        type: 'drill',
        title: '矩陣元素公式與二重和計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS441MatrixEntryDoubleSumCleanSet(5);
        },
      },
      's4-4-2-equality-algebra-three-subtypes': {
        type: 'composite',
        title: '矩陣相等、代數移項與方程三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-4-2-matrix-equality', 's4-4-2-linear-matrix-algebra', 's4-4-2-matrix-equations'],
        generate() {
          return buildS442EqualityAlgebraMixedSet(5);
        },
      },
      's4-4-2-multiplication-property-three-subtypes': {
        type: 'composite',
        title: '矩陣乘法、運算性質與特殊矩陣三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-4-2-multiplication-dimensions', 's4-4-2-algebraic-properties', 's4-4-2-special-matrices'],
        generate() {
          return buildS442MultiplicationPropertyMixedSet(5);
        },
      },
      's4-4-2-power-polynomial-three-subtypes': {
        type: 'composite',
        title: '矩陣高次方、特徵多項式與對角化三小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: ['s4-4-2-matrix-powers', 's4-4-2-cayley-hamilton', 's4-4-2-diagonal-power'],
        generate() {
          return buildS442PowerPolynomialMixedSet(5);
        },
      },
      's4-4-2-matrix-equality': {
        type: 'drill',
        title: '矩陣相等的變數求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS442MatrixEqualitySet(5);
        },
      },
      's4-4-2-linear-matrix-algebra': {
        type: 'drill',
        title: '係數積與矩陣方程式移項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS442LinearMatrixAlgebraSet(5);
        },
      },
      's4-4-2-matrix-equations': {
        type: 'drill',
        title: '矩陣乘法與未知元素求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS442MatrixEquationSet(5);
        },
      },
      's4-4-2-multiplication-dimensions': {
        type: 'drill',
        title: '矩陣乘法與維度判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS442MultiplicationDimensionSet(5);
        },
      },
      's4-4-2-algebraic-properties': {
        type: 'drill',
        title: '矩陣乘法運算性質驗證',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS442AlgebraicPropertiesSet(5);
        },
      },
      's4-4-2-special-matrices': {
        type: 'drill',
        title: '對角、上三角與特殊矩陣',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS442SpecialMatricesSet(5);
        },
      },
      's4-4-2-matrix-powers': {
        type: 'drill',
        title: '矩陣高次方規律推導',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS442MatrixPowersSet(5);
        },
      },
      's4-4-2-cayley-hamilton': {
        type: 'drill',
        title: '凱萊－哈密頓定理化簡',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS442CayleyHamiltonSet(5);
        },
      },
      's4-4-2-diagonal-power': {
        type: 'drill',
        title: '特徵向量與對角化算高次方',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS442DiagonalPowerSet(5);
        },
      },
      's4-4-2-det-properties': {
        type: 'drill',
        title: '行列式性質：純量倍、乘積與反矩陣',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS442DetPropertiesSet(5);
        },
      },
      's4-4-2-similar-matrix': {
        type: 'drill',
        title: '相似矩陣 BAB⁻¹ 的計算與性質',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS442SimilarMatrixSet(5);
        },
      },
      's4-4-2-elementary-row-operations': {
        type: 'drill',
        title: '基本矩陣與列運算表示',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS442ElementaryRowOperationSet(5);
        },
      },
      's4-4-2-commutator-parameter-clean': {
        type: 'drill',
        title: '矩陣平方公式與可交換參數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS442CommutatorParameterCleanSet(5);
        },
      },
      's4-4-2-rank-one-power-sum-clean': {
        type: 'drill',
        title: '秩一矩陣高次方與等比和',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS442RankOnePowerSumCleanSet(5);
        },
      },
      's4-4-3-inverse-basic-three-subtypes': {
        type: 'composite',
        title: '反矩陣存在性、公式與矩陣方程三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-4-3-inverse-existence', 's4-4-3-inverse-formula', 's4-4-3-inverse-matrix-equations'],
        generate() {
          return buildS443InverseBasicMixedSet(5);
        },
      },
      's4-4-3-inverse-property-three-subtypes': {
        type: 'composite',
        title: '反矩陣性質、高次方與移項應用三小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: ['s4-4-3-inverse-properties', 's4-4-3-inverse-powers', 's4-4-3-inverse-polynomial'],
        generate() {
          return buildS443InversePropertyMixedSet(5);
        },
      },
      's4-4-3-transition-stable-three-subtypes': {
        type: 'composite',
        title: '轉移矩陣、穩定狀態與性質三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-4-3-transition-matrix', 's4-4-3-stable-state', 's4-4-3-transition-properties'],
        generate() {
          return buildS443TransitionMixedSet(5);
        },
      },
      's4-4-3-inverse-existence': {
        type: 'drill',
        title: '反矩陣存在性與參數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS443InverseExistenceSet(5);
        },
      },
      's4-4-3-inverse-formula': {
        type: 'drill',
        title: '二階反矩陣公式計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS443InverseFormulaSet(5);
        },
      },
      's4-4-3-inverse-matrix-equations': {
        type: 'drill',
        title: '利用反矩陣解矩陣方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS443InverseMatrixEquationSet(5);
        },
      },
      's4-4-3-inverse-properties': {
        type: 'drill',
        title: '反矩陣性質與乘法順序',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS443InversePropertiesSet(5);
        },
      },
      's4-4-3-inverse-powers': {
        type: 'drill',
        title: '反矩陣高次方與次方合併',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS443InversePowersSet(5);
        },
      },
      's4-4-3-inverse-polynomial': {
        type: 'drill',
        title: '反矩陣多項式降階表示',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS443InversePolynomialSet(5);
        },
      },
      's4-4-3-transition-matrix': {
        type: 'drill',
        title: '轉移矩陣建模與狀態更新',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS443TransitionMatrixSet(5);
        },
      },
      's4-4-3-stable-state': {
        type: 'drill',
        title: '穩定狀態的求解與判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS443StableStateSet(5);
        },
      },
      's4-4-3-transition-properties': {
        type: 'drill',
        title: '轉移矩陣的欄和與性質判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS443TransitionPropertySet(5);
        },
      },
      's4-4-3-power-recovery-clean': {
        type: 'drill',
        title: '由矩陣高次方反推低次方',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS443PowerRecoveryCleanSet(5);
        },
      },
      's4-4-3-matrix-code-decode-clean': {
        type: 'drill',
        title: '反矩陣應用：矩陣編碼解碼',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS443MatrixCodeDecodeCleanSet(5);
        },
      },
      's4-4-4-point-matrix-three-subtypes': {
        type: 'composite',
        title: '點的映射、矩陣求解與基本變換三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-4-4-point-mapping', 's4-4-4-matrix-solving', 's4-4-4-rotation-reflection'],
        generate() {
          return buildS444PointMatrixMixedSet(5);
        },
      },
      's4-4-4-geometry-equation-three-subtypes': {
        type: 'composite',
        title: '圖形方程、伸縮推移與變換辨識三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s4-4-4-equation-transform', 's4-4-4-scaling-shear', 's4-4-4-classification'],
        generate() {
          return buildS444GeometryEquationMixedSet(5);
        },
      },
      's4-4-4-area-composition-three-subtypes': {
        type: 'composite',
        title: '面積倍率、合成變換與矩陣次方三小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: ['s4-4-4-area-scaling', 's4-4-4-composition-powers', 's4-4-4-invariants'],
        generate() {
          return buildS444AreaCompositionMixedSet(5);
        },
      },
      's4-4-4-point-mapping': {
        type: 'drill',
        title: '點的映射與原像還原',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444PointMappingSet(5);
        },
      },
      's4-4-4-matrix-solving': {
        type: 'drill',
        title: '由像點求變換矩陣',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444MatrixSolvingSet(5);
        },
      },
      's4-4-4-rotation-reflection': {
        type: 'drill',
        title: '旋轉與鏡射的基本矩陣',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444RotationReflectionSet(5);
        },
      },
      's4-4-4-equation-transform': {
        type: 'drill',
        title: '直線圓與曲線的方程變換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444EquationTransformSet(5);
        },
      },
      's4-4-4-scaling-shear': {
        type: 'drill',
        title: '伸縮與推移變換計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444ScalingShearSet(5);
        },
      },
      's4-4-4-classification': {
        type: 'drill',
        title: '特殊變換矩陣辨識',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444ClassificationSet(5);
        },
      },
      's4-4-4-area-scaling': {
        type: 'drill',
        title: '面積倍率與行列式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444AreaScalingSet(5);
        },
      },
      's4-4-4-composition-powers': {
        type: 'drill',
        title: '合成變換與矩陣高次方',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS444CompositionPowersSet(5);
        },
      },
      's4-4-4-invariants': {
        type: 'drill',
        title: '長度面積與內積不變量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444InvariantSet(5);
        },
      },
      's4-4-4-line-transform': {
        type: 'drill',
        title: '直線在線性變換下的像方程',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444LineTransformSet(5);
        },
      },
      's4-4-4-coordinate-rotation-clean': {
        type: 'drill',
        title: '坐標軸旋轉與新舊坐標換算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444CoordinateRotationCleanSet(5);
        },
      },
      's4-4-4-line-stretch-parameter-clean': {
        type: 'drill',
        title: '伸縮推移下的直線像方程',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS444LineStretchParameterCleanSet(5);
        },
      },
  };

  const bundleFingerprint = "s4-bundle-v20260706-summary-v1";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
} catch(e) { window.__s4DebugError = String(e); }
})();
