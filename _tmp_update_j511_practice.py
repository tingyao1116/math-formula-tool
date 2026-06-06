import json
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path('program-db/database/practice-db.json')
CHAPTER_CODE = 'j5-1-1'
STAGE = '國中'
GRADE = '國三'
TERM = '上'
CHAPTER = '連比'
DOMAIN = '比例與相似'

PRACTICES = [
    {
        'id': 'practice-j5-1-1-ratio-conversion-five-subtypes',
        'title': '連比合併與格式轉換綜合',
        'generatorKey': 'j5-1-1-ratio-conversion-five-subtypes',
        'difficulty': 'easy',
        'questionCount': 6,
        'subtypeCount': 5,
        'relatedPracticeIds': [
            'practice-j5-1-1-merge-shared-term',
            'practice-j5-1-1-equation-to-ratio',
            'practice-j5-1-1-fraction-form-ratio',
            'practice-j5-1-1-reciprocal-ratio',
            'practice-j5-1-1-fraction-statement-ratio',
        ],
        'tags': ['j5-1-1', '連比', '共同項', '倒數比', '分式等式'],
        'usage': ['適合作為連比第一輪練習：先把不同格式都轉成最簡整數連比。'],
        'tips': ['合併連比先找共同項；乘積等式與倒數比都要先轉成同一個共同倍數。'],
    },
    {
        'id': 'practice-j5-1-1-merge-shared-term',
        'title': '共同項合併成三項連比',
        'generatorKey': 'j5-1-1-merge-shared-term',
        'difficulty': 'easy',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '共同項'],
        'usage': ['練習把 x:y 與 y:z 的共同項調成相同後合併。'],
        'tips': ['共同項要用最小公倍數調齊，最後再約成最簡整數比。'],
    },
    {
        'id': 'practice-j5-1-1-equation-to-ratio',
        'title': '乘積等式轉連比',
        'generatorKey': 'j5-1-1-equation-to-ratio',
        'difficulty': 'easy',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '乘積等式'],
        'usage': ['練習由 ax=by=cz 轉為 x:y:z。'],
        'tips': ['設共同值為 k，三個量分別是 k 除以各自係數。'],
    },
    {
        'id': 'practice-j5-1-1-fraction-form-ratio',
        'title': '分式等式轉連比',
        'generatorKey': 'j5-1-1-fraction-form-ratio',
        'difficulty': 'easy',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '分式等式'],
        'usage': ['練習由 x/a=y/b=z/c 直接轉出連比。'],
        'tips': ['若 x/a=y/b=z/c，設共同值為 r，則 x:y:z=a:b:c。'],
    },
    {
        'id': 'practice-j5-1-1-reciprocal-ratio',
        'title': '倒數連比與最簡整數比',
        'generatorKey': 'j5-1-1-reciprocal-ratio',
        'difficulty': 'medium',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '倒數比'],
        'usage': ['練習連比取倒數後的最簡整數比。'],
        'tips': ['倒數比不是把順序倒過來，而是每一項分別取倒數後再同乘公倍數。'],
    },
    {
        'id': 'practice-j5-1-1-fraction-statement-ratio',
        'title': '文字分數條件轉連比',
        'generatorKey': 'j5-1-1-fraction-statement-ratio',
        'difficulty': 'medium',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '文字題'],
        'usage': ['練習把「幾分之幾相等」翻譯成分式等式。'],
        'tips': ['先翻成 x/a=y/b=z/c，再用參數法讀出連比。'],
    },
    {
        'id': 'practice-j5-1-1-ratio-algebra-three-subtypes',
        'title': '參數法求值與代數比例綜合',
        'generatorKey': 'j5-1-1-ratio-algebra-three-subtypes',
        'difficulty': 'medium',
        'questionCount': 6,
        'subtypeCount': 3,
        'relatedPracticeIds': [
            'practice-j5-1-1-parametric-linear-equation',
            'practice-j5-1-1-ratio-expression-transform',
            'practice-j5-1-1-reverse-value-from-ratio',
        ],
        'tags': ['j5-1-1', '連比', '參數法', '代數式'],
        'usage': ['適合在學生已會化連比後，練習代入 r 倍數求值與化簡。'],
        'tips': ['看到 x:y:z=a:b:c，先設 x=ar、y=br、z=cr，再把題目變成一個未知數。'],
    },
    {
        'id': 'practice-j5-1-1-parametric-linear-equation',
        'title': '連比參數法解一次式',
        'generatorKey': 'j5-1-1-parametric-linear-equation',
        'difficulty': 'medium',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '參數法'],
        'usage': ['練習用 r 倍數代入一次方程式求三個量。'],
        'tips': ['所有量都含同一個 r，代入後只需要解 r。'],
    },
    {
        'id': 'practice-j5-1-1-ratio-expression-transform',
        'title': '連比代數式比例化簡',
        'generatorKey': 'j5-1-1-ratio-expression-transform',
        'difficulty': 'medium',
        'questionCount': 5,
        'subtypeCount': 3,
        'tags': ['j5-1-1', '連比', '代數式比例'],
        'usage': ['練習把 x、y、z 的和、差、平方代入連比。'],
        'tips': ['代入 ar、br、cr 後，比例中的共同 r 或 r² 可一起約掉。'],
    },
    {
        'id': 'practice-j5-1-1-reverse-value-from-ratio',
        'title': '已知總量反求各部分',
        'generatorKey': 'j5-1-1-reverse-value-from-ratio',
        'difficulty': 'easy',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '總量分配'],
        'usage': ['練習由總量與連比反推出各部分數量。'],
        'tips': ['先算每一份是多少，再分別乘各項比數。'],
    },
    {
        'id': 'practice-j5-1-1-geometry-ratio-three-subtypes',
        'title': '三角形與幾何量的連比應用',
        'generatorKey': 'j5-1-1-geometry-ratio-three-subtypes',
        'difficulty': 'medium',
        'questionCount': 6,
        'subtypeCount': 3,
        'relatedPracticeIds': [
            'practice-j5-1-1-triangle-angle-ratio',
            'practice-j5-1-1-triangle-side-height-ratio',
            'practice-j5-1-1-geometry-perimeter-area',
        ],
        'tags': ['j5-1-1', '連比', '三角形', '幾何量'],
        'usage': ['把連比放進角度、邊高反比、周長面積體積等幾何情境。'],
        'tips': ['角度用 180 度分份；同一三角形中，邊長與對應高成反比。'],
    },
    {
        'id': 'practice-j5-1-1-triangle-angle-ratio',
        'title': '三角形內角連比',
        'generatorKey': 'j5-1-1-triangle-angle-ratio',
        'difficulty': 'easy',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '三角形內角'],
        'usage': ['練習三角形內角和搭配連比。'],
        'tips': ['三角形三內角總和固定為 180 度。'],
    },
    {
        'id': 'practice-j5-1-1-triangle-side-height-ratio',
        'title': '三角形邊長與高的反比',
        'generatorKey': 'j5-1-1-triangle-side-height-ratio',
        'difficulty': 'medium',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '邊高反比'],
        'usage': ['練習三角形三邊與對應高的反比關係。'],
        'tips': ['同一個三角形面積相同，底越長，對應高越短。'],
    },
    {
        'id': 'practice-j5-1-1-geometry-perimeter-area',
        'title': '幾何周長面積體積連比',
        'generatorKey': 'j5-1-1-geometry-perimeter-area',
        'difficulty': 'medium',
        'questionCount': 5,
        'subtypeCount': 3,
        'tags': ['j5-1-1', '連比', '周長', '面積', '體積'],
        'usage': ['練習幾何量中的分份、平方比與長方體三量比例。'],
        'tips': ['長度用一倍、面積常用平方倍、體積常用三個方向相乘。'],
    },
    {
        'id': 'practice-j5-1-1-life-ratio-five-subtypes',
        'title': '生活情境中的連比分配與變化',
        'generatorKey': 'j5-1-1-life-ratio-five-subtypes',
        'difficulty': 'medium',
        'questionCount': 6,
        'subtypeCount': 5,
        'relatedPracticeIds': [
            'practice-j5-1-1-money-profit-sharing',
            'practice-j5-1-1-mixture-ratio',
            'practice-j5-1-1-population-ratio-change',
            'practice-j5-1-1-work-rate-speed',
            'practice-j5-1-1-reverse-value-from-ratio',
        ],
        'tags': ['j5-1-1', '連比', '生活應用', '分配', '混合', '反比'],
        'usage': ['適合做連比應用題綜合練習，涵蓋金錢、混合、人數變動與工作效率。'],
        'tips': ['生活題先判斷是正比分配、比例變動，還是時間與效率的反比。'],
    },
    {
        'id': 'practice-j5-1-1-money-profit-sharing',
        'title': '金錢與利潤分配',
        'generatorKey': 'j5-1-1-money-profit-sharing',
        'difficulty': 'easy',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '金錢分配'],
        'usage': ['練習總金額按比例分配。'],
        'tips': ['金額分配的核心仍是先求每一份。'],
    },
    {
        'id': 'practice-j5-1-1-mixture-ratio',
        'title': '混合物與濃度配比',
        'generatorKey': 'j5-1-1-mixture-ratio',
        'difficulty': 'medium',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '混合物'],
        'usage': ['練習由其中一種材料反推總量。'],
        'tips': ['已知某一材料的量，就用該材料對應的份數先求一份。'],
    },
    {
        'id': 'practice-j5-1-1-population-ratio-change',
        'title': '人數比例變動',
        'generatorKey': 'j5-1-1-population-ratio-change',
        'difficulty': 'medium',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '人數變動'],
        'usage': ['練習人數轉入轉出後重新化簡連比。'],
        'tips': ['先把原比例變成具體人數，再做增減，最後再約分。'],
    },
    {
        'id': 'practice-j5-1-1-work-rate-speed',
        'title': '工作效率與速率反比',
        'generatorKey': 'j5-1-1-work-rate-speed',
        'difficulty': 'medium',
        'questionCount': 5,
        'subtypeCount': 1,
        'tags': ['j5-1-1', '連比', '反比', '效率'],
        'usage': ['練習同一工作量下時間與效率的反比。'],
        'tips': ['同一件工作，花的時間越短，效率越高。'],
    },
]

MAIN_BINDINGS = [
    'practice-j5-1-1-ratio-conversion-five-subtypes',
    'practice-j5-1-1-ratio-algebra-three-subtypes',
    'practice-j5-1-1-geometry-ratio-three-subtypes',
    'practice-j5-1-1-life-ratio-five-subtypes',
]

payload = json.loads(DB_PATH.read_text(encoding='utf-8'))
existing = {row['id']: row for row in payload.get('practices', []) if isinstance(row, dict) and row.get('id')}

for record in PRACTICES:
    full = {
        'id': record['id'],
        'enabled': True,
        'mode': 'generator',
        'title': record['title'],
        'generatorKey': record['generatorKey'],
        'difficulty': record['difficulty'],
        'questionCount': record['questionCount'],
        'subtypeCount': record.get('subtypeCount', 0),
        'relatedPracticeIds': record.get('relatedPracticeIds', []),
        'chapterCode': CHAPTER_CODE,
        'stage': STAGE,
        'grade': GRADE,
        'term': TERM,
        'chapter': CHAPTER,
        'domain': DOMAIN,
        'prompt': '',
        'answer': '',
        'tags': record.get('tags', []),
        'usage': record.get('usage', []),
        'examples': [],
        'tips': record.get('tips', []),
        'notes': [],
        'mistakes': [],
    }
    existing[full['id']] = full

old_order = [row['id'] for row in payload.get('practices', []) if isinstance(row, dict) and row.get('id') and row['id'] not in {r['id'] for r in PRACTICES}]
payload['practices'] = [existing[i] for i in old_order] + [existing[r['id']] for r in PRACTICES]

bindings = [b for b in payload.get('bindings', []) if not (isinstance(b, dict) and b.get('targetType') == 'chapter' and b.get('targetId') == CHAPTER_CODE and b.get('practiceId') in MAIN_BINDINGS)]
for order, practice_id in enumerate(MAIN_BINDINGS, start=1):
    bindings.append({'practiceId': practice_id, 'targetType': 'chapter', 'targetId': CHAPTER_CODE, 'enabled': True, 'order': order})
payload['bindings'] = bindings
payload.setdefault('meta', {})['practiceCount'] = len(payload['practices'])
payload.setdefault('meta', {})['bindingCount'] = len(payload['bindings'])
payload['updatedAt'] = datetime.now(timezone.utc).isoformat()
DB_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"updated {len(PRACTICES)} practices and {len(MAIN_BINDINGS)} chapter bindings for {CHAPTER_CODE}")
