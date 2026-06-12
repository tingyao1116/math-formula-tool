
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DB = ROOT / 'program-db' / 'database' / 'practice-db.json'
ASSIGN = ROOT / 'data' / 'formula-practice-assignments.js'

CHAPTER = 'j5-1-2'
STAGE = '國中'
GRADE = '國三'
TERM = '上'
CHAPTER_NAME = '平行線截比例線段'
DOMAIN = '幾何'

practices = [
    ('triangle-parallel-five-subtypes', '三角形平行截線五小類綜合', 'medium', 6, 5,
     ['triangle-parallel-side-ratio','triangle-parallel-segment-length','triangle-parallel-algebra','triangle-parallel-converse','midpoint-segment'],
     ['截線定理', '三角形', '比例式', '中點連線'],
     '先判斷用「邊段比」還是「上段比全段」，常見等式有 AD:DB=AE:EC 與 AD:AB=AE:AC=DE:BC。'),
    ('triangle-parallel-side-ratio', '三角形截線邊段比', 'easy', 5, 1, [], ['三角形', '邊段比', '截線定理'], '平行線切兩邊時，對應的小段比相等；不要把 AD:DB 誤看成 AD:AB。'),
    ('triangle-parallel-segment-length', '三角形截線求線段長', 'easy', 5, 1, [], ['三角形', '底邊比例', '求長度'], '若要算平行截線長，可用 AD/AB=AE/AC=DE/BC，把「小三角形對大三角形」的比例對齊。'),
    ('triangle-parallel-algebra', '三角形截線代數求值', 'medium', 5, 1, [], ['三角形', '代數', '比例式'], '先寫出正確比例式再交叉相乘，未知數若代表長度，最後要取合乎題意的正數解。'),
    ('triangle-parallel-converse', '平行截線逆定理判斷', 'medium', 5, 1, [], ['逆定理', '平行判定'], '比較兩邊被分割的比例是否相等；比例相等才可判定截線與底邊平行。'),
    ('midpoint-segment', '三角形中點連線', 'easy', 5, 1, [], ['中點連線', '中點三角形'], '三角形兩邊中點連線平行第三邊，且長度為第三邊的一半；中點三角形周長也是原三角形的一半。'),
    ('trapezoid-parallel-three-subtypes', '梯形與多平行線三小類綜合', 'medium', 6, 3,
     ['trapezoid-parallel-segment','trapezoid-midline','multi-parallel-intercepts'],
     ['梯形', '多平行線', '截距比例'],
     '梯形內平行線可看成底邊長度的線性變化；多條平行線截兩直線時，對應截距成比例。'),
    ('trapezoid-parallel-segment', '梯形側邊分點截線', 'medium', 5, 1, [], ['梯形', '分點', '截線長'], '若 AE:EB=m:n，則中間截線 EF=(n×AD+m×BC)/(m+n)，係數要對到靠近哪一個底。'),
    ('trapezoid-midline', '梯形中線長度', 'easy', 5, 1, [], ['梯形中線'], '梯形中線等於兩底和的一半，是側邊分點公式在 1:1 時的特例。'),
    ('multi-parallel-intercepts', '多條平行線截比例', 'medium', 5, 1, [], ['多平行線', '截距比例'], 'L1//L2//L3 截兩條直線時，相鄰截距比會保持一致。'),
    ('area-ratio-three-subtypes', '平行線截比例與面積應用', 'medium', 6, 3,
     ['equal-height-area-ratio','similar-triangle-area-ratio','trapezoid-diagonal-area-ratio'],
     ['面積比', '相似', '同高三角形'],
     '面積題先判斷是「等高底邊比」還是「相似邊長平方比」，不要把邊長比直接當成相似面積比。'),
    ('equal-height-area-ratio', '等高三角形面積比', 'easy', 5, 1, [], ['等高', '面積比'], '兩三角形若高相等，面積比等於底邊比。'),
    ('similar-triangle-area-ratio', '相似三角形面積比', 'medium', 5, 1, [], ['相似', '面積平方比'], '相似圖形的面積比等於對應邊長比的平方。'),
    ('trapezoid-diagonal-area-ratio', '梯形對角線面積比', 'medium', 5, 1, [], ['梯形', '對角線', '面積比'], '梯形對角線交點兩側的相似三角形，面積比等於兩底平方比。'),
    ('measurement-two-subtypes', '相似測量與比例尺綜合', 'medium', 6, 2,
     ['shadow-height','scale-measurement'], ['測量', '相似', '比例尺'], '測量應用要先抓出相似三角形，再把人高、影長、實物長、圖上長對應清楚。'),
    ('shadow-height', '影長測高', 'easy', 5, 1, [], ['測量', '影長'], '同一時間陽光仰角相同，物高與影長成正比。'),
    ('scale-measurement', '比例尺長度換算', 'easy', 5, 1, [], ['比例尺', '測量'], '比例尺題先統一單位，再用圖上長:實際長的固定比例解題。'),
]

big_suffixes = [
    'triangle-parallel-five-subtypes',
    'trapezoid-parallel-three-subtypes',
    'area-ratio-three-subtypes',
    'measurement-two-subtypes',
]

data = json.loads(DB.read_text(encoding='utf-8'))
existing = {p['id']: p for p in data['practices']}
for suffix, title, difficulty, qcount, subtype_count, related, tags, tip in practices:
    pid = f'practice-{CHAPTER}-{suffix}'
    entry = {
        'id': pid,
        'enabled': True,
        'mode': 'generator',
        'title': title,
        'generatorKey': f'{CHAPTER}-{suffix}',
        'difficulty': difficulty,
        'questionCount': qcount,
        'subtypeCount': subtype_count,
        'relatedPracticeIds': [f'practice-{CHAPTER}-{r}' for r in related],
        'chapterCode': CHAPTER,
        'stage': STAGE,
        'grade': GRADE,
        'term': TERM,
        'chapter': CHAPTER_NAME,
        'domain': DOMAIN,
        'prompt': '',
        'answer': '',
        'tags': [CHAPTER, CHAPTER_NAME, *tags],
        'usage': [f'練習 {CHAPTER_NAME} 的固定比例、平行判定、面積比與相似測量應用。'],
        'examples': [],
        'tips': [tip],
        'notes': [],
        'mistakes': ['最常見錯誤是把 AD:DB 與 AD:AB 混用；前者是邊段比，後者是小三角形對大三角形的全段比。'],
    }
    if pid in existing:
        existing[pid].update(entry)
    else:
        data['practices'].append(entry)

data['bindings'] = [b for b in data['bindings'] if not (b.get('targetId') == CHAPTER and b.get('practiceId','').startswith(f'practice-{CHAPTER}-'))]
for order, suffix in enumerate(big_suffixes, 1):
    data['bindings'].append({
        'practiceId': f'practice-{CHAPTER}-{suffix}',
        'targetType': 'chapter',
        'targetId': CHAPTER,
        'enabled': True,
        'order': order,
    })

data['updatedAt'] = datetime.now(timezone.utc).isoformat()
DB.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

print('updated practice-db for', CHAPTER, 'with', len(practices), 'practices')
