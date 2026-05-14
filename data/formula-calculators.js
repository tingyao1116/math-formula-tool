(() => {
  function parseNumber(value, label) {
    const num = Number(value);
    if (!Number.isFinite(num)) throw new Error(`${label} 需要是數字。`);
    return num;
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x;
  }

  function fractionLatex(numerator, denominator) {
    if (denominator === 0) throw new Error('分母不能為 0。');
    if (numerator === 0) return '0';
    const sign = denominator < 0 ? -1 : 1;
    let n = numerator * sign;
    let d = Math.abs(denominator);
    const g = gcd(n, d);
    n /= g;
    d /= g;
    if (d === 1) return String(n);
    return String.raw`\frac{${n}}{${d}}`;
  }

  function lineLatexFromPoints(x1, y1, x2, y2) {
    if (x1 === x2 && y1 === y2) throw new Error('兩點不能重合。');
    if (x1 === x2) {
      return String.raw`x=${x1}`;
    }
    const mNum = y2 - y1;
    const mDen = x2 - x1;
    const bNum = y1 * mDen - mNum * x1;
    const slope = fractionLatex(mNum, mDen);
    const intercept = fractionLatex(bNum, mDen);
    const generalA = mNum;
    const generalB = -mDen;
    const generalC = y1 * mDen - mNum * x1;
    return String.raw`m=${slope}\\ y=${slope}x${intercept.startsWith('-') ? intercept : '+' + intercept}\\ ${generalA}x${generalB >= 0 ? '+' : ''}${generalB}y${generalC >= 0 ? '+' : ''}${generalC}=0`;
  }

  function areaFromThreePoints(x1, y1, x2, y2, x3, y3) {
    return Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2;
  }

  window.formulaCalculatorStore = {
    configs: {
      "system-linear-equations": {
        title: "聯立方程式計算器",
        fields: [
          { key: 'a1', label: '第一式 x 係數 a_1', type: 'number' },
          { key: 'b1', label: '第一式 y 係數 b_1', type: 'number' },
          { key: 'c1', label: '第一式常數 c_1', type: 'number' },
          { key: 'a2', label: '第二式 x 係數 a_2', type: 'number' },
          { key: 'b2', label: '第二式 y 係數 b_2', type: 'number' },
          { key: 'c2', label: '第二式常數 c_2', type: 'number' }
        ],
        evaluate(values) {
          const a1 = parseNumber(values.a1, 'a1');
          const b1 = parseNumber(values.b1, 'b1');
          const c1 = parseNumber(values.c1, 'c1');
          const a2 = parseNumber(values.a2, 'a2');
          const b2 = parseNumber(values.b2, 'b2');
          const c2 = parseNumber(values.c2, 'c2');
          const det = a1 * b2 - a2 * b1;
          if (det === 0) {
            return { text: '判別式為 0，可能是矛盾方程式或相依方程式。' };
          }
          const x = fractionLatex(c1 * b2 - c2 * b1, det);
          const y = fractionLatex(a1 * c2 - a2 * c1, det);
          return { latex: String.raw`x=${x},\ y=${y}` };
        }
      },
      "two-point-form": {
        title: "兩點求一直線計算器",
        fields: [
          { key: 'x1', label: '第一點 x_1', type: 'number' },
          { key: 'y1', label: '第一點 y_1', type: 'number' },
          { key: 'x2', label: '第二點 x_2', type: 'number' },
          { key: 'y2', label: '第二點 y_2', type: 'number' }
        ],
        evaluate(values) {
          const x1 = parseNumber(values.x1, 'x1');
          const y1 = parseNumber(values.y1, 'y1');
          const x2 = parseNumber(values.x2, 'x2');
          const y2 = parseNumber(values.y2, 'y2');
          return { latex: lineLatexFromPoints(x1, y1, x2, y2) };
        }
      },
      "coordinate-area-formula-guest": {
        title: "三點求面積計算器",
        fields: [
          { key: 'x1', label: 'A 點 x_1', type: 'number' },
          { key: 'y1', label: 'A 點 y_1', type: 'number' },
          { key: 'x2', label: 'B 點 x_2', type: 'number' },
          { key: 'y2', label: 'B 點 y_2', type: 'number' },
          { key: 'x3', label: 'C 點 x_3', type: 'number' },
          { key: 'y3', label: 'C 點 y_3', type: 'number' }
        ],
        evaluate(values) {
          const x1 = parseNumber(values.x1, 'x1');
          const y1 = parseNumber(values.y1, 'y1');
          const x2 = parseNumber(values.x2, 'x2');
          const y2 = parseNumber(values.y2, 'y2');
          const x3 = parseNumber(values.x3, 'x3');
          const y3 = parseNumber(values.y3, 'y3');
          const area = areaFromThreePoints(x1, y1, x2, y2, x3, y3);
          return { latex: String.raw`\text{面積}=\frac{1}{2}|${x1}(${y2}-${y3})+${x2}(${y3}-${y1})+${x3}(${y1}-${y2})|=${area}` };
        }
      },
    },
    getConfig(id) {
      return this.configs[id] || null;
    }
  };
})();
