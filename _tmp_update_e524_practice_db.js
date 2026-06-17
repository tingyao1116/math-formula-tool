const fs = require('fs');

const dbPath = 'program-db/database/practice-db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.practices = db.practices.filter(
  (item) => item.chapterCode !== 'e5-2-4'
);

db.bindings = db.bindings.filter(
  (item) => !(item.targetType === 'chapter' && item.targetId === 'e5-2-4')
);

const base = {
  enabled: true,
  mode: 'generator',
  questionCount: 5,
  stage: '國小',
  grade: '小五',
  term: '下學期',
  chapter: '小數的乘法',
  domain: '數與量',
  prompt: '',
  answer: '',
  examples: [],
  notes: [],
};

const practices = [
  {
    id: 'practice-e5-2-4-decimal-integer-direct-drill',
    title: '小數乘整數直式計算',
    generatorKey: 'e5-2-4-decimal-integer-direct-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-4', '小數的乘法', '直式計算'],
    usage: ['先把小數當成整數乘，再依原本小數位數把小數點點回去。'],
    tips: ['可以先算整數部分，再看乘數與被乘數一共有幾位小數。'],
    mistakes: ['忘記最後要補回小數點，或小數位數數錯。'],
  },
  {
    id: 'practice-e5-2-4-decimal-decimal-direct-drill',
    title: '小數乘小數直式計算',
    generatorKey: 'e5-2-4-decimal-decimal-direct-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-4', '小數的乘法', '小數乘小數'],
    usage: ['練習小數乘小數的基本直式算法。'],
    tips: ['先不看小數點做整數乘法，最後再依總小數位數標回去。'],
    mistakes: ['只看其中一個因數的小數位數，沒有把兩邊一起算。'],
  },
  {
    id: 'practice-e5-2-4-shift-right-drill',
    title: '乘 10、100、1000 的位移',
    generatorKey: 'e5-2-4-shift-right-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-4', '小數的乘法', '位值移動'],
    usage: ['練習乘上 10、100、1000 時的小數點右移。'],
    tips: ['乘幾個 10，小數點就向右移幾位。'],
    mistakes: ['把 1000 誤看成只移 2 位。'],
  },
  {
    id: 'practice-e5-2-4-shift-left-drill',
    title: '乘 0.1、0.01、0.001 的位移',
    generatorKey: 'e5-2-4-shift-left-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-4', '小數的乘法', '位值移動'],
    usage: ['練習乘上 0.1、0.01、0.001 時的小數點左移。'],
    tips: ['乘 0.1 就是縮小成原來的十分之一。'],
    mistakes: ['方向看反，把小數點向右移。'],
  },
  {
    id: 'practice-e5-2-4-infer-from-integer-drill',
    title: '由整數算式推小數乘法',
    generatorKey: 'e5-2-4-infer-from-integer-drill',
    difficulty: 'medium',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-4', '小數的乘法', '推理'],
    usage: ['利用已知整數乘法，反推小數乘法的答案。'],
    tips: ['先看每個數各自縮小幾倍，積就跟著縮小幾倍。'],
    mistakes: ['只調整其中一個數，忘記另一個數也變了。'],
  },
  {
    id: 'practice-e5-2-4-compare-product-drill',
    title: '不計算判斷積與被乘數大小',
    generatorKey: 'e5-2-4-compare-product-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-4', '小數的乘法', '大小比較'],
    usage: ['觀察乘數與 1 的關係，不計算也能判斷積的大小。'],
    tips: ['乘數大於 1，積變大；小於 1，積變小；等於 1，積不變。'],
    mistakes: ['把比較對象看成乘數，而不是看積和被乘數。'],
  },
  {
    id: 'practice-e5-2-4-decimal-place-count-drill',
    title: '積的小數位數判斷',
    generatorKey: 'e5-2-4-decimal-place-count-drill',
    difficulty: 'medium',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-4', '小數的乘法', '位值概念'],
    usage: ['練習不必全算完，也能判斷積會有幾位小數。'],
    tips: ['把兩個因數的小數位數相加，就是積的小數位數。'],
    mistakes: ['把相乘錯看成相減，或少算末尾的 0。'],
  },
  {
    id: 'practice-e5-2-4-order-compare-drill',
    title: '多個數值的大小排序',
    generatorKey: 'e5-2-4-order-compare-drill',
    difficulty: 'medium',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-4', '小數的乘法', '排序比較'],
    usage: ['多個算式共用同一個被乘數時，利用乘數大小快速排序。'],
    tips: ['被乘數相同時，只比較乘數大小就能判斷積的大小。'],
    mistakes: ['每一題都重算，反而更容易算錯。'],
  },
  {
    id: 'practice-e5-2-4-application-drill',
    title: '生活情境中的小數乘法',
    generatorKey: 'e5-2-4-application-drill',
    difficulty: 'medium',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-4', '小數的乘法', '應用題'],
    usage: ['把小數乘法放進單價、面積、重量、容量等情境。'],
    tips: ['先看題目是在求總價、總重、總面積還是總容量。'],
    mistakes: ['單位沒跟著答案一起寫，或把乘法誤做成加法。'],
  },
  {
    id: 'practice-e5-2-4-direct-two-subtypes',
    title: '直式計算二小類綜合',
    generatorKey: 'e5-2-4-direct-two-subtypes',
    difficulty: 'easy',
    subtypeCount: 2,
    relatedPracticeIds: [
      'practice-e5-2-4-decimal-integer-direct-drill',
      'practice-e5-2-4-decimal-decimal-direct-drill',
    ],
    tags: ['e5-2-4', '小數的乘法', '直式綜合'],
    usage: ['統整小數乘整數與小數乘小數的直式計算。'],
    tips: ['先整數乘，再點小數點。'],
    mistakes: ['把兩種直式的點位規則混在一起。'],
  },
  {
    id: 'practice-e5-2-4-shift-two-subtypes',
    title: '位值移動二小類綜合',
    generatorKey: 'e5-2-4-shift-two-subtypes',
    difficulty: 'easy',
    subtypeCount: 2,
    relatedPracticeIds: [
      'practice-e5-2-4-shift-right-drill',
      'practice-e5-2-4-shift-left-drill',
    ],
    tags: ['e5-2-4', '小數的乘法', '位值綜合'],
    usage: ['統整乘 10 的倍數與乘 0.1 的倍數。'],
    tips: ['先判斷答案會變大還是變小，再決定方向。'],
    mistakes: ['沒有先看乘數和 1 的關係。'],
  },
  {
    id: 'practice-e5-2-4-infer-two-subtypes',
    title: '由整數推小數二小類綜合',
    generatorKey: 'e5-2-4-infer-two-subtypes',
    difficulty: 'medium',
    subtypeCount: 2,
    relatedPracticeIds: [
      'practice-e5-2-4-infer-from-integer-drill',
      'practice-e5-2-4-decimal-place-count-drill',
    ],
    tags: ['e5-2-4', '小數的乘法', '推理綜合'],
    usage: ['統整已知整數乘法反推答案，和位值判斷。'],
    tips: ['先想整體縮小幾倍，再看答案要補幾位小數。'],
    mistakes: ['只會背規則，不會連到已知整數算式。'],
  },
  {
    id: 'practice-e5-2-4-judge-three-subtypes',
    title: '積大小與位值三小類綜合',
    generatorKey: 'e5-2-4-judge-three-subtypes',
    difficulty: 'medium',
    subtypeCount: 3,
    relatedPracticeIds: [
      'practice-e5-2-4-compare-product-drill',
      'practice-e5-2-4-decimal-place-count-drill',
      'practice-e5-2-4-order-compare-drill',
    ],
    tags: ['e5-2-4', '小數的乘法', '判斷綜合'],
    usage: ['統整積的大小、位數與排序判斷。'],
    tips: ['很多題根本不用算到最後，先看 1 與倍數關係。'],
    mistakes: ['把可以心算判斷的題目硬算，反而出錯。'],
  },
  {
    id: 'practice-e5-2-4-application-one-subtype',
    title: '生活情境中的小數乘法',
    generatorKey: 'e5-2-4-application-one-subtype',
    difficulty: 'medium',
    subtypeCount: 1,
    relatedPracticeIds: [
      'practice-e5-2-4-application-drill',
    ],
    tags: ['e5-2-4', '小數的乘法', '應用綜合'],
    usage: ['集中練習單價、重量、容量、面積的生活應用。'],
    tips: ['先抓出每 1 單位多少，再乘數量。'],
    mistakes: ['題目看見小數就急著算，沒有先判斷關係。'],
  },
].map((item) => ({
  ...base,
  ...item,
  chapterCode: 'e5-2-4',
}));

db.practices.push(...practices);

db.bindings.push(
  {
    practiceId: 'practice-e5-2-4-direct-two-subtypes',
    targetType: 'chapter',
    targetId: 'e5-2-4',
    enabled: true,
    order: 1,
  },
  {
    practiceId: 'practice-e5-2-4-shift-two-subtypes',
    targetType: 'chapter',
    targetId: 'e5-2-4',
    enabled: true,
    order: 2,
  },
  {
    practiceId: 'practice-e5-2-4-infer-two-subtypes',
    targetType: 'chapter',
    targetId: 'e5-2-4',
    enabled: true,
    order: 3,
  },
  {
    practiceId: 'practice-e5-2-4-judge-three-subtypes',
    targetType: 'chapter',
    targetId: 'e5-2-4',
    enabled: true,
    order: 4,
  },
  {
    practiceId: 'practice-e5-2-4-application-one-subtype',
    targetType: 'chapter',
    targetId: 'e5-2-4',
    enabled: true,
    order: 5,
  }
);

db.meta.practiceCount = db.practices.length;
db.meta.bindingCount = db.bindings.length;
db.meta.updatedAt = new Date().toISOString();

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');

console.log(`updated e5-2-4 practices: ${practices.length}`);
console.log('updated e5-2-4 bindings: 5');
