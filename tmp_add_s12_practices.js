const fs = require('fs');

const path = 'program-db/database/practice-db.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

const commonNote = [
  '依照截圖整理為可重生的無限練習題；截圖可見 4 類，未額外發明第 5 類。',
  '截圖中的「承上題」已改寫成可獨立生成的題型，避免無限練習依賴上一題資料。',
  '只有大方向但缺少明確條件的說法未另外收錄；本批皆附掛在 s1-2-1 直線與半平面相關章節。',
];

const rows = [
  {
    id: 'practice-s1-2-1-three-line-triangle-parameter-advanced',
    title: '三線不能圍成三角形的參數判定進階',
    generatorKey: 's1-2-1-three-line-triangle-parameter-advanced',
    chapterCode: 's1-2-1',
    chapter: '直線方程式與平面幾何',
    domain: '解析幾何',
    difficulty: 'hard',
    questionCount: 5,
    subtypeCount: 5,
    order: 1,
    tags: ['s1-2-1', '直線方程式與平面幾何', '解析幾何', '無限練習', '三線共點', '平行', '三角形面積', '參數'],
    tips: ['三線不能圍成三角形通常來自兩線平行或三線共點；先判斷是哪一種退化情形。'],
    mistakes: ['只檢查斜率平行，忘記三線共點也不能形成三角形。', '用截距求面積時忘記取絕對值。'],
  },
  {
    id: 'practice-s1-2-1-point-line-side-advanced',
    title: '點對直線的相對位置進階',
    generatorKey: 's1-2-1-point-line-side-advanced',
    chapterCode: 's1-2-1',
    chapter: '直線方程式與平面幾何',
    domain: '解析幾何',
    difficulty: 'hard',
    questionCount: 5,
    subtypeCount: 5,
    order: 2,
    tags: ['s1-2-1', '直線方程式與平面幾何', '解析幾何', '無限練習', '點線相對位置', '同側異側', '半平面', '線段相交'],
    tips: ['把點代入直線式 ax+by+c，同號為同側，異號為異側，乘積等於 0 則點在線上。'],
    mistakes: ['忘記線段與直線相交時端點可有一點在線上，所以要用小於等於 0。'],
  },
  {
    id: 'practice-s1-2-1-absolute-inequality-area-advanced',
    title: '絕對值不等式與圖形面積進階',
    generatorKey: 's1-2-1-absolute-inequality-area-advanced',
    chapterCode: 's1-2-1',
    chapter: '直線方程式與平面幾何',
    domain: '解析幾何',
    difficulty: 'hard',
    questionCount: 5,
    subtypeCount: 5,
    order: 3,
    tags: ['s1-2-1', '直線方程式與平面幾何', '解析幾何', '無限練習', '絕對值不等式', '菱形面積', '半平面交集'],
    tips: ['|x|+|y| 型常形成菱形；含多個限制時，可先找頂點再算多邊形面積。'],
    mistakes: ['把菱形對角線當成邊長。', '共同交集題只算其中一個不等式的面積。'],
  },
  {
    id: 'practice-s1-2-1-linear-fractional-extrema-advanced',
    title: '線性分式與區域極值進階',
    generatorKey: 's1-2-1-linear-fractional-extrema-advanced',
    chapterCode: 's1-2-1',
    chapter: '直線方程式與平面幾何',
    domain: '解析幾何',
    difficulty: 'hard',
    questionCount: 5,
    subtypeCount: 5,
    order: 4,
    tags: ['s1-2-1', '直線方程式與平面幾何', '解析幾何', '無限練習', '線性分式', '區域極值', '距離', '值域'],
    tips: ['封閉多邊形上的線性分式極值常先檢查頂點；若區域不封閉，要先判斷是否可能無下界或無上界。'],
    mistakes: ['看到分式就只微分，忘記區域端點或頂點。', '忽略分母正負與區域是否無界。'],
  },
];

db.practices = Array.isArray(db.practices) ? db.practices : [];
db.bindings = Array.isArray(db.bindings) ? db.bindings : [];

for (const row of rows) {
  const record = {
    id: row.id,
    enabled: true,
    mode: 'generator',
    title: row.title,
    generatorKey: row.generatorKey,
    difficulty: row.difficulty,
    questionCount: row.questionCount,
    subtypeCount: row.subtypeCount,
    relatedPracticeIds: [],
    chapterCode: row.chapterCode,
    chapter: row.chapter,
    domain: row.domain,
    prompt: '',
    answer: '',
    tags: row.tags,
    usage: [],
    examples: [],
    tips: row.tips,
    notes: commonNote,
    mistakes: row.mistakes,
  };
  const index = db.practices.findIndex((practice) => practice.id === row.id);
  if (index >= 0) db.practices[index] = record;
  else db.practices.push(record);

  const binding = {
    practiceId: row.id,
    targetType: 'chapter',
    targetId: row.chapterCode,
    enabled: true,
    order: row.order,
  };
  const bindingIndex = db.bindings.findIndex((item) => item.practiceId === row.id && item.targetType === 'chapter' && item.targetId === row.chapterCode);
  if (bindingIndex >= 0) db.bindings[bindingIndex] = binding;
  else db.bindings.push(binding);
}

fs.writeFileSync(path, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
console.log(`upserted ${rows.length} s1-2 advanced practices`);
