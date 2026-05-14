import json
import random
from pathlib import Path

random.seed(114514)

ROOT = Path(r"D:\oneDrive\數學公式使用工具雲端版")
FDB = ROOT / "program-db" / "database" / "formula-db.json"
OUT_DIR = ROOT / "program-db" / "imports"
OUT_JSONL = OUT_DIR / "q-j1-1-1-structured-pack.questions.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j1-1-1-structured-pack.preview.json"

CHAPTER = "j1-1-1"
SOURCE_REF = "改國一上1 數線與正負數.docx"

BRANCHES = {
    "comparison-reversal-rules": ["同向比較", "反向比較", "移項比較"],
    "j1-1-1-relative-quantity-sign": ["方向與正負", "基準量轉換", "生活情境記號"],
    "j1-1-1-number-system-overview": ["整數判別", "有理數判別", "數集分類"],
    "j1-1-1-number-line-elements": ["原點與方向", "單位長", "坐標讀值"],
    "j1-1-1-order-and-interval": ["大小比較", "區間表示", "數線範圍"],
    "j1-1-1-opposite-number": ["相反數", "對稱點", "和為零"],
    "j1-1-1-absolute-value-definition": ["絕對值幾何", "距離意義", "絕對值比較"],
    "j1-1-1-distance-midpoint": ["兩點距離", "中點公式", "反求座標"],
    "j1-1-1-absolute-value-equation": ["單層方程", "雙解判斷", "整數解個數"],
}


def load_topics():
    payload = json.loads(FDB.read_text(encoding="utf-8"))
    rows = payload.get("topics", [])
    topic_rows = [
        r for r in rows
        if str(r.get("chapterCode", "")).strip() == CHAPTER and not str(r.get("parentId", "")).strip()
    ]
    topic_rows.sort(key=lambda x: str(x.get("id", "")))
    return topic_rows


def mk_record(qid, title, q, a, e, tags, difficulty="基礎"):
    return {
        "id": qid,
        "title": title,
        "question_text": q,
        "answer_text": a,
        "explanation_text": e,
        "stage": "國中",
        "grade": "國一",
        "chapter": CHAPTER,
        "chapter_code": CHAPTER,
        "difficulty": difficulty,
        "source_type": "word_structured_generated",
        "source_ref": SOURCE_REF,
        "tags": tags,
    }


def make_topic_examples(topic_id, topic_title, t_idx):
    recs = []
    a = random.randint(-8, 8)
    b = random.randint(-8, 8)
    c = random.randint(-8, 8)
    recs.append(mk_record(
        f"q-{CHAPTER}-struct-t{t_idx:02d}-ex-01",
        f"【主題範例】{topic_title}-01",
        f"主題「{topic_title}」範例：已知 a={a}, b={b}，請寫出 a+b 與 a-b。",
        f"a+b={a+b}，a-b={a-b}",
        "代入定義直接計算。",
        [CHAPTER, f"topic:{topic_id}", "group:topic-example", f"module:{topic_title}"],
        "基礎",
    ))
    x1 = random.randint(-12, 12)
    x2 = random.randint(-12, 12)
    recs.append(mk_record(
        f"q-{CHAPTER}-struct-t{t_idx:02d}-ex-02",
        f"【主題範例】{topic_title}-02",
        f"主題「{topic_title}」範例：數線上兩點座標為 {x1} 與 {x2}，求兩點距離。",
        f"距離={abs(x1-x2)}",
        "數線兩點距離為兩座標差的絕對值。",
        [CHAPTER, f"topic:{topic_id}", "group:topic-example", f"module:{topic_title}"],
        "基礎",
    ))
    return recs


def make_topic_practice(topic_id, topic_title, t_idx):
    recs = []
    for i in range(1, 5):
        p = random.randint(-15, 15)
        q = random.randint(-15, 15)
        recs.append(mk_record(
            f"q-{CHAPTER}-struct-t{t_idx:02d}-cw-{i:02d}",
            f"【主題課練】{topic_title}-{i:02d}",
            f"課堂練習：比較 {p} 與 {q} 的大小，並在數線上判斷誰較靠右。",
            f"{'%d>%d'%(p,q) if p>q else ('%d<%d'%(p,q) if p<q else '%d=%d'%(p,q))}",
            "數線越右邊數值越大。",
            [CHAPTER, f"topic:{topic_id}", "group:topic-classwork", f"module:{topic_title}"],
            "基礎" if i <= 2 else "進階",
        ))
    return recs


def make_branch_examples(topic_id, topic_title, t_idx):
    recs = []
    branches = BRANCHES.get(topic_id, ["核心一", "核心二", "核心三"])
    for b_idx, b_name in enumerate(branches, start=1):
        for i in range(1, 3):
            m = random.randint(-9, 9)
            n = random.randint(-9, 9)
            recs.append(mk_record(
                f"q-{CHAPTER}-struct-t{t_idx:02d}-b{b_idx:02d}-ex-{i:02d}",
                f"【分支範例】{topic_title}-{b_name}-{i:02d}",
                f"分支「{b_name}」範例：若 m={m}, n={n}，求 |m-n| 與 m+n。",
                f"|m-n|={abs(m-n)}，m+n={m+n}",
                "先算差再取絕對值，和直接相加。",
                [CHAPTER, f"topic:{topic_id}", f"branch:{b_name}", "group:branch-example", f"module:{topic_title}"],
                "基礎",
            ))
    return recs


def make_chapter_mix(start_index=1, count=24):
    recs = []
    for i in range(start_index, start_index + count):
        a = random.randint(-20, 20)
        b = random.randint(-20, 20)
        c = random.randint(1, 10)
        recs.append(mk_record(
            f"q-{CHAPTER}-struct-ch-mix-{i:02d}",
            f"【章節綜合】{CHAPTER}-{i:02d}",
            f"綜合計算：已知 a={a}, b={b}，先算 |a-b|，再計算 |a-b|+{c}。",
            str(abs(a-b)+c),
            "先求兩數距離，再加上常數。",
            [CHAPTER, "group:chapter-mixed", "module:章節綜合練習"],
            "進階" if i % 3 else "挑戰",
        ))
    return recs


def main():
    topics = load_topics()
    records = []
    summary = []

    for idx, t in enumerate(topics, start=1):
        tid = str(t.get("id", "")).strip()
        title = str(t.get("title", tid)).strip() or tid
        a = make_topic_examples(tid, title, idx)
        b = make_topic_practice(tid, title, idx)
        c = make_branch_examples(tid, title, idx)
        records.extend(a + b + c)
        summary.append({
            "topic_id": tid,
            "topic_title": title,
            "topic_examples": len(a),
            "topic_classwork": len(b),
            "branch_examples": len(c),
            "branches": BRANCHES.get(tid, ["核心一", "核心二", "核心三"]),
        })

    chapter_mix = make_chapter_mix(count=24)
    records.extend(chapter_mix)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with OUT_JSONL.open("w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    preview = {
        "meta": {
            "chapter_code": CHAPTER,
            "source_ref": SOURCE_REF,
            "count": len(records),
            "topic_count": len(topics),
            "naming": {
                "topic_example": "【主題範例】...",
                "topic_classwork": "【主題課練】...",
                "branch_example": "【分支範例】...",
                "chapter_mixed": "【章節綜合】...",
            }
        },
        "summary_by_topic": summary,
        "questions": records,
    }
    OUT_PREVIEW.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"generated={len(records)}")
    print(OUT_JSONL)
    print(OUT_PREVIEW)


if __name__ == "__main__":
    main()
