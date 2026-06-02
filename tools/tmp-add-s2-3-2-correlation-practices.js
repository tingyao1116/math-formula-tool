const fs = require('fs');

const dbPath = 'program-db/database/practice-db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const now = new Date().toISOString();

const base = {
  chapterCode: 's2-3-2',
  chapterCodes: ['s2-3-2'],
  stage: '高中',
  grade: '高二',
  term: '上學期',
  chapter: '數據分析',
  domain: '相關與迴歸',
  difficulty: 'medium',
  questionCount: 5,
  type: 'infinite-practice',
  mode: 'generator',
  source: 'manual-infinite-practice',
  status: 'active',
};

const groups = [
  {
    id: 'practice-s2-3-2-correlation-five-subtypes',
    title: '相關係數與散布圖判讀五小類綜合',
    generatorKey: 's2-3-2-correlation-five-subtypes',
    tags: ['s2-3-2', '相關係數', '散布圖', '線性變換'],
    children: [
      ['practice-s2-3-2-correlation-basic', '相關係數的基本計算', 's2-3-2-correlation-basic', ['相關係數', 'Sxy']],
      ['practice-s2-3-2-scatter-judgment', '散布圖的判讀與性質', 's2-3-2-scatter-judgment', ['散布圖', '零相關']],
      ['practice-s2-3-2-correlation-sensitivity', '特定點對相關係數的敏感度分析', 's2-3-2-correlation-sensitivity', ['離群點', '敏感度']],
      ['practice-s2-3-2-linear-transform-correlation', '線性變換對相關係數與迴歸線的影響', 's2-3-2-linear-transform-correlation', ['線性變換', '相關係數']],
      ['practice-s2-3-2-regression-consistency', '迴歸分析的綜合性質判定', 's2-3-2-regression-consistency', ['迴歸性質', '斜率']],
    ],
  },
  {
    id: 'practice-s2-3-2-regression-five-subtypes',
    title: '迴歸線最小平方法與變換五小類綜合',
    generatorKey: 's2-3-2-regression-five-subtypes',
    tags: ['s2-3-2', '迴歸線', '最小平方法', '預測'],
    children: [
      ['practice-s2-3-2-regression-line', '迴歸直線方程式與預測', 's2-3-2-regression-line', ['迴歸線', '預測']],
      ['practice-s2-3-2-reciprocal-slopes', '雙重迴歸線的斜率關係', 's2-3-2-reciprocal-slopes', ['雙重迴歸', '斜率關係']],
      ['practice-s2-3-2-mean-point', '利用必過平均點性質求值', 's2-3-2-mean-point', ['平均點', '迴歸線']],
      ['practice-s2-3-2-least-squares', '最小平方法定義的代數運算', 's2-3-2-least-squares', ['最小平方法', 'normal equations']],
      ['practice-s2-3-2-transformed-regression', '變數線性變換後的迴歸線預測', 's2-3-2-transformed-regression', ['變數變換', '迴歸預測']],
    ],
  },
];

const byId = new Map(db.practices.map((item, index) => [item.id, { item, index }]));

function upsertPractice(practice) {
  const existing = byId.get(practice.id);
  if (existing) {
    db.practices[existing.index] = { ...existing.item, ...practice, updatedAt: now };
    return;
  }
  db.practices.push({ ...practice, updatedAt: now });
}

groups.forEach((group) => {
  const childIds = group.children.map((child) => child[0]);
  upsertPractice({
    ...base,
    id: group.id,
    title: group.title,
    generatorKey: group.generatorKey,
    tags: group.tags,
    subtypeCount: childIds.length,
    relatedPracticeIds: childIds,
    childPracticeIds: childIds,
  });
  group.children.forEach(([id, title, generatorKey, tags]) => {
    upsertPractice({
      ...base,
      id,
      title,
      generatorKey,
      tags: ['s2-3-2', ...tags],
      subtypeCount: 1,
      relatedPracticeIds: [],
      parentPracticeId: group.id,
    });
  });
});

db.bindings = db.bindings.filter((binding) => (
  binding.targetId !== 's2-3-2'
  || !groups.some((group) => group.id === binding.practiceId)
));

groups.forEach((group, index) => {
  db.bindings.push({
    practiceId: group.id,
    targetType: 'chapter',
    targetId: 's2-3-2',
    order: index + 1,
    updatedAt: now,
  });
});

db.meta = {
  ...db.meta,
  updatedAt: now,
};

fs.writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
console.log(`s2-3-2 practices upserted: ${groups.length} groups, ${groups.reduce((sum, group) => sum + group.children.length, 0)} children`);
