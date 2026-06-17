const fs = require('fs');

const dbPath = 'program-db/database/practice-db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.practices = db.practices.filter(
  (item) => item.chapterCode !== 'e5-2-5'
);

db.bindings = db.bindings.filter(
  (item) => !(item.targetType === 'chapter' && item.targetId === 'e5-2-5')
);

const base = {
  enabled: true,
  mode: 'generator',
  questionCount: 5,
  stage: '國小',
  grade: '小五',
  term: '下學期',
  chapter: '大數與折線圖',
  domain: '數與量',
  prompt: '',
  answer: '',
  examples: [],
  notes: [],
};

const practices = [
  {
    id: 'practice-e5-2-5-chinese-convert-drill',
    title: '大數與中文讀法互換',
    generatorKey: 'e5-2-5-chinese-convert-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '大數讀寫'],
    usage: ['適合練習阿拉伯數字與中文讀法之間的互換，掌握萬、億、兆的四位一組結構。'],
    tips: ['先從右往左每四位分成一組，再依序配上萬、億、兆。'],
    mistakes: ['常見錯誤是漏掉中間的零，或把家族單位的位置對錯。'],
  },
  {
    id: 'practice-e5-2-5-place-digit-drill',
    title: '位值與位名辨識',
    generatorKey: 'e5-2-5-place-digit-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '位值'],
    usage: ['用來確認學生能正確找出特定位名上的數字。'],
    tips: ['從個位開始往左數，個、十、百、千，再進到萬、億、兆。'],
    mistakes: ['容易把萬位、十萬位、百萬位混在一起。'],
  },
  {
    id: 'practice-e5-2-5-unit-compose-drill',
    title: '大數合成與單位組成',
    generatorKey: 'e5-2-5-unit-compose-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '單位合成'],
    usage: ['練習把兆、億、萬、個合起來，形成完整的大數。'],
    tips: ['先把每個單位都換成個，再一起相加。'],
    mistakes: ['常見錯誤是忽略進位關係，例如 10 個一千萬其實是 1 億。'],
  },
  {
    id: 'practice-e5-2-5-expanded-notation-drill',
    title: '數的十進位表示法',
    generatorKey: 'e5-2-5-expanded-notation-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '十進位表示'],
    usage: ['練習把大數拆成位值乘個數，或把拆開式重新合成。'],
    tips: ['每一位都可以看成「該位數字 × 該位位值」。'],
    mistakes: ['學生容易漏寫 0 的位值，或把位值寫錯。'],
  },
  {
    id: 'practice-e5-2-5-place-ratio-drill',
    title: '位值間的倍數關係',
    generatorKey: 'e5-2-5-place-ratio-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '倍數關係'],
    usage: ['用來建立十進位下左邊位值是右邊位值 10 倍的觀念。'],
    tips: ['位值每往左一位就放大 10 倍。'],
    mistakes: ['常把位數差 2 位、4 位時的倍數算錯。'],
  },
  {
    id: 'practice-e5-2-5-large-compare-drill',
    title: '大數大小比較與排序',
    generatorKey: 'e5-2-5-large-compare-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '大小比較'],
    usage: ['先比位數，再比最高位，適合做大數比較與排序。'],
    tips: ['位數多的大；若位數相同，就從最高位開始比。'],
    mistakes: ['逗號分組會干擾視覺，學生容易只看中間一段就下結論。'],
  },
  {
    id: 'practice-e5-2-5-trailing-zero-operation-drill',
    title: '末位有 0 的乘除運算',
    generatorKey: 'e5-2-5-trailing-zero-operation-drill',
    difficulty: 'medium',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '末位0運算'],
    usage: ['把末位很多個 0 的乘除轉成簡單算式，再補或約掉 0。'],
    tips: ['先算前面的非 0 數字，再處理 0 的個數。'],
    mistakes: ['容易補錯 0 的個數，或除法時沒有同時去掉兩邊相同的 0。'],
  },
  {
    id: 'practice-e5-2-5-line-single-read-drill',
    title: '折線圖單線讀值',
    generatorKey: 'e5-2-5-line-single-read-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '折線圖讀值'],
    usage: ['練習從單一折線圖讀最高點、最低點、特定時刻與差值。'],
    tips: ['先確認橫軸代表什麼，再讀出對應的縱軸數值。'],
    mistakes: ['常把月份或星期對錯欄，或把單位漏掉。'],
  },
  {
    id: 'practice-e5-2-5-line-double-compare-drill',
    title: '折線圖雙線比較',
    generatorKey: 'e5-2-5-line-double-compare-drill',
    difficulty: 'medium',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '雙線比較'],
    usage: ['在同一張雙線折線圖中比較哪條線較高、差距最大或總量較多。'],
    tips: ['同一個月份只比同一個位置上的兩個數值。'],
    mistakes: ['學生容易把不同月份的數值拿來交叉比較。'],
  },
  {
    id: 'practice-e5-2-5-line-trend-drill',
    title: '折線圖趨勢判讀',
    generatorKey: 'e5-2-5-line-trend-drill',
    difficulty: 'medium',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '趨勢判讀'],
    usage: ['用來看上升、下降、持平與哪一段增加最多。'],
    tips: ['比較相鄰兩點的高低，就能判斷該段趨勢。'],
    mistakes: ['只看單一點高低，沒有看前後變化。'],
  },
  {
    id: 'practice-e5-2-5-line-structure-drill',
    title: '折線圖結構與刻度理解',
    generatorKey: 'e5-2-5-line-structure-drill',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '圖表結構'],
    usage: ['確認學生理解橫軸、縱軸、刻度與省略符號的意義。'],
    tips: ['先看標題、橫軸、縱軸、單位與每小格代表的量。'],
    mistakes: ['常忽略縱軸每小格的實際單位，導致整張圖讀錯。'],
  },
  {
    id: 'practice-e5-2-5-line-condition-drill',
    title: '依條件查找折線圖資訊',
    generatorKey: 'e5-2-5-line-condition-drill',
    difficulty: 'medium',
    subtypeCount: 1,
    relatedPracticeIds: [],
    tags: ['e5-2-5', '大數與折線圖', '條件查找'],
    usage: ['用來找出大於、等於、至少或至多某個值的月份或時段。'],
    tips: ['把每個月份都依條件檢查一次，不要憑感覺跳讀。'],
    mistakes: ['容易把「大於」和「大於等於」混淆。'],
  },
  {
    id: 'practice-e5-2-5-read-place-three-subtypes',
    title: '大數讀寫與位值三小類綜合',
    generatorKey: 'e5-2-5-read-place-three-subtypes',
    difficulty: 'easy',
    subtypeCount: 3,
    relatedPracticeIds: [
      'practice-e5-2-5-chinese-convert-drill',
      'practice-e5-2-5-place-digit-drill',
      'practice-e5-2-5-unit-compose-drill'
    ],
    tags: ['e5-2-5', '大數與折線圖', '大數基礎綜合'],
    usage: ['把大數讀法、位值與單位組成放在同一大類練習。'],
    tips: ['先分家族，再定位值，最後合成整個數。'],
    mistakes: ['常在家族單位和位名切換時出錯。'],
  },
  {
    id: 'practice-e5-2-5-structure-three-subtypes',
    title: '十進位與倍數三小類綜合',
    generatorKey: 'e5-2-5-structure-three-subtypes',
    difficulty: 'easy',
    subtypeCount: 3,
    relatedPracticeIds: [
      'practice-e5-2-5-expanded-notation-drill',
      'practice-e5-2-5-place-ratio-drill',
      'practice-e5-2-5-trailing-zero-operation-drill'
    ],
    tags: ['e5-2-5', '大數與折線圖', '十進位結構綜合'],
    usage: ['集中練習十進位拆解、位值倍數與 0 的運算。'],
    tips: ['看到 10 倍、100 倍先回到位值移動來想。'],
    mistakes: ['容易把位值關係和算式運算分開看，導致推理斷掉。'],
  },
  {
    id: 'practice-e5-2-5-compare-one-subtype',
    title: '大數大小比較與排序',
    generatorKey: 'e5-2-5-compare-one-subtype',
    difficulty: 'easy',
    subtypeCount: 1,
    relatedPracticeIds: [
      'practice-e5-2-5-large-compare-drill'
    ],
    tags: ['e5-2-5', '大數與折線圖', '比較'],
    usage: ['單獨拉出大數比較，方便集中刷題。'],
    tips: ['永遠先比位數，再比最高位。'],
    mistakes: ['不要被逗號或中文單位分心。'],
  },
  {
    id: 'practice-e5-2-5-line-read-compare-two-subtypes',
    title: '折線圖讀值與比較二小類綜合',
    generatorKey: 'e5-2-5-line-read-compare-two-subtypes',
    difficulty: 'medium',
    subtypeCount: 2,
    relatedPracticeIds: [
      'practice-e5-2-5-line-single-read-drill',
      'practice-e5-2-5-line-double-compare-drill'
    ],
    tags: ['e5-2-5', '大數與折線圖', '折線圖綜合'],
    usage: ['先會單線讀值，再練雙線比較。'],
    tips: ['比較前先確認是不是同一時間點。'],
    mistakes: ['常把兩條線不同位置的點拿來比較。'],
  },
  {
    id: 'practice-e5-2-5-line-trend-structure-two-subtypes',
    title: '折線圖趨勢與結構三小類綜合',
    generatorKey: 'e5-2-5-line-trend-structure-two-subtypes',
    difficulty: 'medium',
    subtypeCount: 3,
    relatedPracticeIds: [
      'practice-e5-2-5-line-trend-drill',
      'practice-e5-2-5-line-structure-drill',
      'practice-e5-2-5-line-condition-drill'
    ],
    tags: ['e5-2-5', '大數與折線圖', '折線圖判讀'],
    usage: ['把趨勢判讀、圖表結構與條件查找放在同一大類。'],
    tips: ['先看刻度，再讀趨勢，最後才做條件篩選。'],
    mistakes: ['忽略縱軸單位或省略符號時，整題都會判錯。'],
  },
].map((item) => ({
  ...base,
  ...item,
  chapterCode: 'e5-2-5',
}));

db.practices.push(...practices);

db.bindings.push(
  {
    practiceId: 'practice-e5-2-5-read-place-three-subtypes',
    targetType: 'chapter',
    targetId: 'e5-2-5',
    enabled: true,
    order: 1,
  },
  {
    practiceId: 'practice-e5-2-5-structure-three-subtypes',
    targetType: 'chapter',
    targetId: 'e5-2-5',
    enabled: true,
    order: 2,
  },
  {
    practiceId: 'practice-e5-2-5-compare-one-subtype',
    targetType: 'chapter',
    targetId: 'e5-2-5',
    enabled: true,
    order: 3,
  },
  {
    practiceId: 'practice-e5-2-5-line-read-compare-two-subtypes',
    targetType: 'chapter',
    targetId: 'e5-2-5',
    enabled: true,
    order: 4,
  },
  {
    practiceId: 'practice-e5-2-5-line-trend-structure-two-subtypes',
    targetType: 'chapter',
    targetId: 'e5-2-5',
    enabled: true,
    order: 5,
  }
);

db.meta.practiceCount = db.practices.length;
db.meta.bindingCount = db.bindings.length;
db.meta.updatedAt = new Date().toISOString();

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n');
console.log(`Updated e5-2-5 practices: ${practices.length}`);
