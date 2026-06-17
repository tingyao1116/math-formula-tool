const fs = require('fs');

const dbPath = 'program-db/database/practice-db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const smallPractices = [
  {
    key: 'integer-fraction-multiply-drill',
    title: '整數乘真分數與假分數',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '整數乘分數'],
    usage: ['練習整數乘真分數、假分數的基本算法。'],
    tips: ['整數可以先和分母約分，再相乘。'],
    mistakes: ['把整數只乘到分子，卻忘了原本整體仍是分數。'],
  },
  {
    key: 'integer-mixed-multiply-drill',
    title: '整數乘帶分數',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '整數乘帶分數'],
    usage: ['熟悉帶分數先化成假分數，再與整數相乘。'],
    tips: ['先化成假分數，再做乘法。'],
    mistakes: ['帶分數沒有先化成假分數就直接相乘。'],
  },
  {
    key: 'fraction-fraction-multiply-drill',
    title: '分數乘分數',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '分數乘分數'],
    usage: ['練習分子乘分子、分母乘分母。'],
    tips: ['最後記得約成最簡分數。'],
    mistakes: ['把分子和分母交錯相加，沒有用乘法規則。'],
  },
  {
    key: 'cross-cancel-multiply-drill',
    title: '先約分再相乘',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '交叉約分'],
    usage: ['練習先約分再相乘，降低計算量。'],
    tips: ['看到分子和另一個分母有公因數時，可以先約分。'],
    mistakes: ['把同一個分數裡上下亂約，沒有交叉對應。'],
  },
  {
    key: 'discrete-fraction-amount-drill',
    title: '離散量的分數倍',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '離散量'],
    usage: ['用分數倍處理顆數、頁數、枝數等離散量。'],
    tips: ['先看整體有多少，再乘上分數倍。'],
    mistakes: ['把幾分之幾誤看成除法，沒有理解成幾分之幾倍。'],
  },
  {
    key: 'continuous-fraction-application-drill',
    title: '連續量的分數倍應用',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '連續量應用'],
    usage: ['將分數乘法套進長度、重量、容量與價錢。'],
    tips: ['先判斷基準量是 1 包、1 圈、1 公斤，還是總量。'],
    mistakes: ['題目中的單位沒有一起帶著算。'],
  },
  {
    key: 'fraction-of-fraction-drill',
    title: '分數的分數應用',
    difficulty: 'medium',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '部分的部分'],
    usage: ['理解「部分的部分」要用乘法。'],
    tips: ['看到其中的幾分之幾，通常就是再乘一個分數。'],
    mistakes: ['把「其中的幾分之幾」誤做加法或減法。'],
  },
  {
    key: 'quotient-fraction-drill',
    title: '商寫成分數',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '商的分數表示'],
    usage: ['建立被除數當分子、除數當分母的表示。'],
    tips: ['a ÷ b 可以寫成 a/b。'],
    mistakes: ['把分子分母位置寫反。'],
  },
  {
    key: 'quotient-decimal-drill',
    title: '商寫成有限小數',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '小數商'],
    usage: ['練習可除盡時的商與小數表示。'],
    tips: ['先看除數是否容易把商想成常見小數。'],
    mistakes: ['小數點位置對錯。'],
  },
  {
    key: 'quotient-estimate-drill',
    title: '除不盡的概數處理',
    difficulty: 'medium',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '概數'],
    usage: ['除不盡時，依題意取到指定的小數位。'],
    tips: ['先算到指定位的下一位，再做四捨五入。'],
    mistakes: ['沒有看清楚要取到小數第幾位。'],
  },
  {
    key: 'divide-powers-drill',
    title: '除以 10、100、1000 的規律',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '小數點規律'],
    usage: ['練習小數點向左移的規律。'],
    tips: ['除以 10、100、1000，就是小數點向左移 1、2、3 位。'],
    mistakes: ['把小數點移錯方向。'],
  },
  {
    key: 'product-compare-drill',
    title: '不用計算判斷積大小',
    difficulty: 'medium',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '大小判斷'],
    usage: ['從乘數和 1 的關係，直接判斷積的大小。'],
    tips: ['乘數小於 1，積變小；等於 1，不變；大於 1，積變大。'],
    mistakes: ['沒有先判斷乘數與 1 的關係，就急著算。'],
  },
  {
    key: 'fraction-divide-integer-drill',
    title: '分數除以整數',
    difficulty: 'medium',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '分數除法'],
    usage: ['練習分數除以整數時，把整數乘到分母。'],
    tips: ['分數除以整數，可以看成分母再乘那個整數。'],
    mistakes: ['把整數乘到分子。'],
  },
  {
    key: 'multi-step-application-drill',
    title: '多步驟分數應用',
    difficulty: 'medium',
    subtypeCount: 1,
    tags: ['e5-2-2', '分數的計算', '多步驟應用'],
    usage: ['把剩餘量、平均分與部分長度結合成兩步以上問題。'],
    tips: ['先找是先乘、先減，還是先求剩下再平均分。'],
    mistakes: ['沒有先理清順序，就把全部運算一次混在一起。'],
  },
];

const bigPractices = [
  {
    key: 'multiply-four-subtypes',
    title: '分數乘法四小類綜合',
    difficulty: 'easy',
    subtypeCount: 4,
    related: [
      'practice-e5-2-2-integer-fraction-multiply-drill',
      'practice-e5-2-2-integer-mixed-multiply-drill',
      'practice-e5-2-2-fraction-fraction-multiply-drill',
      'practice-e5-2-2-cross-cancel-multiply-drill',
    ],
    tags: ['e5-2-2', '分數的計算', '乘法綜合'],
    usage: ['統整整數乘分數、整數乘帶分數、分數乘分數與先約分再相乘。'],
    tips: ['先看能不能約分，再決定直接乘還是先化假分數。'],
    mistakes: ['帶分數與真分數的處理方式混在一起。'],
  },
  {
    key: 'amount-three-subtypes',
    title: '分數倍與生活量三小類綜合',
    difficulty: 'easy',
    subtypeCount: 3,
    related: [
      'practice-e5-2-2-discrete-fraction-amount-drill',
      'practice-e5-2-2-continuous-fraction-application-drill',
      'practice-e5-2-2-fraction-of-fraction-drill',
    ],
    tags: ['e5-2-2', '分數的計算', '分數倍應用'],
    usage: ['統整離散量、連續量與部分的部分問題。'],
    tips: ['先找基準量，再看是幾分之幾倍，還是其中的幾分之幾。'],
    mistakes: ['看錯基準量，導致整題倍數方向錯掉。'],
  },
  {
    key: 'quotient-three-subtypes',
    title: '商的表示三小類綜合',
    difficulty: 'easy',
    subtypeCount: 3,
    related: [
      'practice-e5-2-2-quotient-fraction-drill',
      'practice-e5-2-2-quotient-decimal-drill',
      'practice-e5-2-2-quotient-estimate-drill',
    ],
    tags: ['e5-2-2', '分數的計算', '商的表示'],
    usage: ['統整商寫成分數、有限小數與概數。'],
    tips: ['先判斷題目要的是分數、小數，還是概數。'],
    mistakes: ['明明要概數，卻直接寫完整除法結果。'],
  },
  {
    key: 'compare-two-subtypes',
    title: '關係判斷二小類綜合',
    difficulty: 'medium',
    subtypeCount: 2,
    related: [
      'practice-e5-2-2-divide-powers-drill',
      'practice-e5-2-2-product-compare-drill',
    ],
    tags: ['e5-2-2', '分數的計算', '關係判斷'],
    usage: ['練習不靠完整計算，從規律與大小關係直接判斷。'],
    tips: ['看清楚是乘法變化，還是除以 10、100、1000 的小數點規律。'],
    mistakes: ['題目明明在考規律，卻回去硬算。'],
  },
  {
    key: 'division-application-two-subtypes',
    title: '分數除法與應用二小類綜合',
    difficulty: 'medium',
    subtypeCount: 2,
    related: [
      'practice-e5-2-2-fraction-divide-integer-drill',
      'practice-e5-2-2-multi-step-application-drill',
    ],
    tags: ['e5-2-2', '分數的計算', '分數除法應用'],
    usage: ['把分數除法基本算法與多步驟生活應用一起練。'],
    tips: ['先確認是平均分，還是先求剩餘再平均分。'],
    mistakes: ['把除法題直接當乘法題處理。'],
  },
];

function buildPractice(entry) {
  return {
    id: `practice-e5-2-2-${entry.key}`,
    enabled: true,
    mode: 'generator',
    title: entry.title,
    generatorKey: `e5-2-2-${entry.key}`,
    difficulty: entry.difficulty,
    questionCount: 5,
    subtypeCount: entry.subtypeCount,
    relatedPracticeIds: entry.related || [],
    chapterCode: 'e5-2-2',
    stage: '國小',
    grade: '小五',
    term: '下學期',
    chapter: '分數的計算',
    domain: '數與量',
    prompt: '',
    answer: '',
    tags: entry.tags,
    usage: entry.usage,
    examples: [],
    tips: entry.tips,
    notes: [],
    mistakes: entry.mistakes,
  };
}

db.practices = db.practices.filter((practice) => practice.chapterCode !== 'e5-2-2');
db.bindings = db.bindings.filter((binding) => binding.targetId !== 'e5-2-2');

for (const entry of [...smallPractices, ...bigPractices]) {
  db.practices.push(buildPractice(entry));
}

[
  'practice-e5-2-2-multiply-four-subtypes',
  'practice-e5-2-2-amount-three-subtypes',
  'practice-e5-2-2-quotient-three-subtypes',
  'practice-e5-2-2-compare-two-subtypes',
  'practice-e5-2-2-division-application-two-subtypes',
].forEach((practiceId, index) => {
  db.bindings.push({
    practiceId,
    targetType: 'chapter',
    targetId: 'e5-2-2',
    enabled: true,
    order: index + 1,
  });
});

db.meta.practiceCount = db.practices.length;
db.meta.bindingCount = db.bindings.length;
db.meta.updatedAt = new Date().toISOString();

fs.writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
console.log('updated e5-2-2 practices:', db.practices.filter((p) => p.chapterCode === 'e5-2-2').length);
console.log('updated e5-2-2 bindings:', db.bindings.filter((b) => b.targetId === 'e5-2-2').length);
