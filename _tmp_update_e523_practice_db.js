const fs = require('fs');

const dbPath = 'program-db/database/practice-db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const smallPractices = [
  {
    key: 'basic-unit-convert-drill',
    title: '容積與容量基本換算',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-3', '容積', '單位換算'],
    usage: ['建立 1 毫升 = 1 立方公分，以及 1 公升 = 1000 毫升的基本量感。'],
    tips: ['先把題目中的單位統一，再判斷要乘 1000 還是除以 1000。'],
    mistakes: ['把毫升、公升、立方公分之間的 1000 倍關係弄反。'],
  },
  {
    key: 'large-unit-convert-drill',
    title: '大型單位與水度換算',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-3', '容積', '大型單位'],
    usage: ['練習立方公尺、公升、公秉與度水之間的換算。'],
    tips: ['1 立方公尺 = 1000 公升，1 度水 = 1 立方公尺。'],
    mistakes: ['把立方公尺誤當成立方公分處理。'],
  },
  {
    key: 'inner-dimension-capacity-drill',
    title: '直接由內部尺寸求容積',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-3', '容積', '內部尺寸'],
    usage: ['由容器內部的長、寬、高直接求容積或容量。'],
    tips: ['容積就是容器裡面空間的大小，所以要用內部尺寸。'],
    mistakes: ['把外部尺寸拿來直接算容積。'],
  },
  {
    key: 'thickness-capacity-drill',
    title: '考厚度的容器容積',
    difficulty: 'medium',
    subtypeCount: 1,
    tags: ['e5-2-3', '容積', '厚度'],
    usage: ['由外部尺寸扣掉厚度後，再求內部容積。'],
    tips: ['有蓋容器的高要扣 2 個厚度，無蓋容器的高只扣底部 1 個厚度。'],
    mistakes: ['有蓋、無蓋的高都用同一種扣法。'],
  },
  {
    key: 'capacity-compare-drill',
    title: '容積與容量大小比較',
    difficulty: 'easy',
    subtypeCount: 1,
    tags: ['e5-2-3', '容積', '大小比較'],
    usage: ['把不同單位換成同單位後比較容積大小。'],
    tips: ['比較前先全部換成毫升或立方公分最穩。'],
    mistakes: ['不同單位直接比數字大小。'],
  },
  {
    key: 'fill-water-level-drill',
    title: '倒入水量求水深',
    difficulty: 'medium',
    subtypeCount: 1,
    tags: ['e5-2-3', '容積', '水深'],
    usage: ['利用容積 ÷ 底面積 = 水深，反推倒入水後的高度。'],
    tips: ['毫升先看成等量的立方公分，再除以底面積。'],
    mistakes: ['把底面積只看成長或只看成寬。'],
  },
  {
    key: 'displacement-volume-drill',
    title: '排水法求物體體積',
    difficulty: 'medium',
    subtypeCount: 1,
    tags: ['e5-2-3', '容積', '排水法'],
    usage: ['用水位變化的體積求沉入水中的物體體積。'],
    tips: ['排開的水量就是物體體積。'],
    mistakes: ['看到水位上升，卻沒有乘上底面積。'],
  },
  {
    key: 'overflow-volume-drill',
    title: '溢水量與物體體積',
    difficulty: 'medium',
    subtypeCount: 1,
    tags: ['e5-2-3', '容積', '溢水'],
    usage: ['利用滿水容器溢出的水量反推物體體積。'],
    tips: ['完全沉入後，溢出的水量和物體體積相等。'],
    mistakes: ['沒有先確認物體是否完全沉入。'],
  },
  {
    key: 'large-application-drill',
    title: '大型容積生活應用',
    difficulty: 'medium',
    subtypeCount: 1,
    tags: ['e5-2-3', '容積', '生活應用'],
    usage: ['把游泳池、水塔、水費等情境轉成容積計算。'],
    tips: ['先判斷題目最後要的是立方公尺、公升，還是度水。'],
    mistakes: ['算出立方公尺後忘記再換成題目要求的單位。'],
  },
];

const bigPractices = [
  {
    key: 'convert-two-subtypes',
    title: '單位換算二小類綜合',
    difficulty: 'easy',
    subtypeCount: 2,
    related: [
      'practice-e5-2-3-basic-unit-convert-drill',
      'practice-e5-2-3-large-unit-convert-drill',
    ],
    tags: ['e5-2-3', '容積', '換算綜合'],
    usage: ['統整基本容量單位與大型用水單位換算。'],
    tips: ['先辨認是小單位換算，還是大型用水單位換算。'],
    mistakes: ['小單位和大單位的 1000 倍關係混用。'],
  },
  {
    key: 'container-two-subtypes',
    title: '容器容積二小類綜合',
    difficulty: 'easy',
    subtypeCount: 2,
    related: [
      'practice-e5-2-3-inner-dimension-capacity-drill',
      'practice-e5-2-3-thickness-capacity-drill',
    ],
    tags: ['e5-2-3', '容積', '容器容積'],
    usage: ['統整直接用內部尺寸求容積，以及由外部尺寸扣厚度。'],
    tips: ['先分辨題目給的是內部尺寸還是外部尺寸。'],
    mistakes: ['明明是外部尺寸，卻沒有先扣厚度。'],
  },
  {
    key: 'water-two-subtypes',
    title: '倒水與排水二小類綜合',
    difficulty: 'medium',
    subtypeCount: 2,
    related: [
      'practice-e5-2-3-fill-water-level-drill',
      'practice-e5-2-3-displacement-volume-drill',
    ],
    tags: ['e5-2-3', '容積', '水位變化'],
    usage: ['把倒水求水深與排水求物體體積一起練習。'],
    tips: ['關鍵都是先找底面積，再配合高度變化。'],
    mistakes: ['看到水位變化卻沒想到用底面積乘高度。'],
  },
  {
    key: 'overflow-compare-two-subtypes',
    title: '溢水與大小比較二小類綜合',
    difficulty: 'medium',
    subtypeCount: 2,
    related: [
      'practice-e5-2-3-overflow-volume-drill',
      'practice-e5-2-3-capacity-compare-drill',
    ],
    tags: ['e5-2-3', '容積', '比較與溢水'],
    usage: ['統整滿水容器溢水與不同單位的容積比較。'],
    tips: ['要比較時先統一單位；要溢水時先抓住溢出量 = 體積。'],
    mistakes: ['把比較題與溢水題的核心規則混在一起。'],
  },
  {
    key: 'large-one-subtype',
    title: '大型容積生活應用',
    difficulty: 'medium',
    subtypeCount: 1,
    related: [
      'practice-e5-2-3-large-application-drill',
    ],
    tags: ['e5-2-3', '容積', '大型情境'],
    usage: ['集中練習游泳池、水塔與用水度數的生活應用。'],
    tips: ['大型情境多半要在立方公尺、公升、度水之間切換。'],
    mistakes: ['只算到體積，沒有轉成題目最後要的單位。'],
  },
];

function buildPractice(entry) {
  return {
    id: `practice-e5-2-3-${entry.key}`,
    enabled: true,
    mode: 'generator',
    title: entry.title,
    generatorKey: `e5-2-3-${entry.key}`,
    difficulty: entry.difficulty,
    questionCount: 5,
    subtypeCount: entry.subtypeCount,
    relatedPracticeIds: entry.related || [],
    chapterCode: 'e5-2-3',
    stage: '國小',
    grade: '小五',
    term: '下學期',
    chapter: '容積',
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

db.practices = db.practices.filter((practice) => practice.chapterCode !== 'e5-2-3');
db.bindings = db.bindings.filter((binding) => binding.targetId !== 'e5-2-3');

for (const entry of [...smallPractices, ...bigPractices]) {
  db.practices.push(buildPractice(entry));
}

[
  'practice-e5-2-3-convert-two-subtypes',
  'practice-e5-2-3-container-two-subtypes',
  'practice-e5-2-3-water-two-subtypes',
  'practice-e5-2-3-overflow-compare-two-subtypes',
  'practice-e5-2-3-large-one-subtype',
].forEach((practiceId, index) => {
  db.bindings.push({
    practiceId,
    targetType: 'chapter',
    targetId: 'e5-2-3',
    enabled: true,
    order: index + 1,
  });
});

db.meta.practiceCount = db.practices.length;
db.meta.bindingCount = db.bindings.length;
db.meta.updatedAt = new Date().toISOString();

fs.writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
console.log('updated e5-2-3 practices:', db.practices.filter((p) => p.chapterCode === 'e5-2-3').length);
console.log('updated e5-2-3 bindings:', db.bindings.filter((b) => b.targetId === 'e5-2-3').length);
