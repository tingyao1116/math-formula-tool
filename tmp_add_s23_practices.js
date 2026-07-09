const fs = require('fs');

const path = 'program-db/database/practice-db.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

const items = [
  {
    id: 'practice-s2-3-1-binary-data-statistics-advanced',
    title: '二元數據（0 與 1）的統計特性',
    generatorKey: 's2-3-1-binary-data-statistics-advanced',
    chapterCode: 's2-3-1',
    chapter: '數據分析',
    domain: '統計量與資料判讀',
    tags: ['s2-3-1', '二元數據', '0-1數據', '平均數', '變異數', '無限練習'],
  },
  {
    id: 'practice-s2-3-1-linear-transform-update-advanced',
    title: '數據線性變換與統計量更新',
    generatorKey: 's2-3-1-linear-transform-update-advanced',
    chapterCode: 's2-3-1',
    chapter: '數據分析',
    domain: '統計量與資料判讀',
    tags: ['s2-3-1', '線性變換', '平均數', '標準差', '變異數', '無限練習'],
  },
  {
    id: 'practice-s2-3-1-data-correction-statistics-advanced',
    title: '資料更正對平均與變異數的影響',
    generatorKey: 's2-3-1-data-correction-statistics-advanced',
    chapterCode: 's2-3-1',
    chapter: '數據分析',
    domain: '統計量與資料判讀',
    tags: ['s2-3-1', '資料更正', '平均數', '變異數', '平方和', '無限練習'],
  },
  {
    id: 'practice-s2-3-2-regression-prediction-advanced',
    title: '迴歸直線與預測',
    generatorKey: 's2-3-2-regression-prediction-advanced',
    chapterCode: 's2-3-2',
    chapter: '數據分析',
    domain: '相關與迴歸',
    tags: ['s2-3-2', '迴歸直線', '相關係數', '預測', '無限練習'],
  },
];

db.practices = db.practices || [];
db.bindings = db.bindings || [];

for (const item of items) {
  const practice = {
    id: item.id,
    enabled: true,
    mode: 'generator',
    title: item.title,
    generatorKey: item.generatorKey,
    difficulty: 'hard',
    questionCount: 5,
    subtypeCount: 1,
    relatedPracticeIds: [],
    chapterCode: item.chapterCode,
    chapter: item.chapter,
    domain: item.domain,
    prompt: '',
    answer: '',
    tags: item.tags,
    usage: [],
    examples: [],
    tips: [],
    notes: [],
    mistakes: [],
    generatorBundle: 's2',
  };

  const practiceIndex = db.practices.findIndex((row) => row.id === item.id);
  if (practiceIndex >= 0) {
    db.practices[practiceIndex] = { ...db.practices[practiceIndex], ...practice };
  } else {
    db.practices.push(practice);
  }

  const existingBindingIndex = db.bindings.findIndex(
    (row) =>
      row.practiceId === item.id &&
      row.targetType === 'chapter' &&
      row.targetId === item.chapterCode,
  );
  if (existingBindingIndex < 0) {
    const maxOrder = Math.max(
      0,
      ...db.bindings
        .filter((row) => row.targetType === 'chapter' && row.targetId === item.chapterCode)
        .map((row) => Number(row.order) || 0),
    );
    db.bindings.push({
      practiceId: item.id,
      targetType: 'chapter',
      targetId: item.chapterCode,
      enabled: true,
      order: maxOrder + 1,
    });
  } else {
    db.bindings[existingBindingIndex] = {
      ...db.bindings[existingBindingIndex],
      enabled: true,
    };
  }
}

fs.writeFileSync(path, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
console.log(`upserted ${items.length} s2-3 practices`);
