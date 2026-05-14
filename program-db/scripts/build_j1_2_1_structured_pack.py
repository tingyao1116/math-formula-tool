import json
import random
from pathlib import Path

random.seed(20260421 + 3)

ROOT = Path(r"D:\oneDrive\數學公式使用工具雲端版")
FDB = ROOT / "program-db" / "database" / "formula-db.json"
OUT_DIR = ROOT / "program-db" / "imports"
OUT_JSONL = OUT_DIR / "q-j1-2-1-structured-pack.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j1-2-1-structured-pack.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j1-2-1-structured-pack.preview.json"

CHAPTER = "j1-2-1"
SOURCE_REF = "改國一上3  因數與倍數.docx"

BRANCH_HINTS = {
    "質數": ["質數判斷", "合數判斷", "1 的特例"],
    "整除": ["尾數判別", "數位和判別", "混合判別"],
    "質因數": ["分解流程", "指數記法", "驗算"],
    "因數個數": ["次方加一", "因數總和", "快速估算"],
    "應用": ["分組切割", "週期循環", "綜合題"],
}


def load_topics():
    payload = json.loads(FDB.read_text(encoding="utf-8"))
    rows = payload.get("topics", [])
    selected = [r for r in rows if str(r.get("chapterCode", "")).strip() == CHAPTER]
    selected.sort(key=lambda x: (str(x.get("parentId", "")), str(x.get("id", ""))))
    return selected


def pick_branches(title: str):
    for k, v in BRANCH_HINTS.items():
        if k in title:
            return v
    return ["核心觀念", "標準題型", "綜合應用"]


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


def make_topic_pack(topic, t_index):
    tid = str(topic.get("id", "")).strip()
    title = str(topic.get("title", tid)).strip() or tid
    recs = []

    # 2 topic examples
    n = random.randint(24, 120)
    d = random.choice([2, 3, 4, 5, 6, 8, 9, 10])
    recs.append(mk_record(
        f"q-{CHAPTER}-struct-t{t_index:02d}-ex-01",
        f"【主題範例】{title}-01",
        f"主題「{title}」範例：判斷 {n} 是否為 {d} 的倍數。",
        "是" if n % d == 0 else "否",
        "若能整除（餘數 0）即為倍數。",
        [CHAPTER, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))
    a = random.randint(12, 60)
    b = random.randint(2, 12)
    recs.append(mk_record(
        f"q-{CHAPTER}-struct-t{t_index:02d}-ex-02",
        f"【主題範例】{title}-02",
        f"主題「{title}」範例：列出 {a} 與 {b} 的所有公因數。",
        "、".join(str(x) for x in range(1, min(a, b) + 1) if a % x == 0 and b % x == 0),
        "同時整除兩數的整數即公因數。",
        [CHAPTER, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    # 4 classwork
    for i in range(1, 5):
        x = random.randint(20, 200)
        p = random.choice([2, 3, 5, 9, 11])
        recs.append(mk_record(
            f"q-{CHAPTER}-struct-t{t_index:02d}-cw-{i:02d}",
            f"【主題課練】{title}-{i:02d}",
            f"課堂練習：判斷 {x} 是否可被 {p} 整除。",
            "可整除" if x % p == 0 else "不可整除",
            "依整除規則或直接計算餘數判斷。",
            [CHAPTER, f"topic:{tid}", "group:topic-classwork", f"module:{title}"],
            "基礎" if i <= 2 else "進階",
        ))

    # 3 branches * 2 examples
    branches = pick_branches(title)
    for b_idx, b_name in enumerate(branches, start=1):
        for i in range(1, 3):
            n1 = random.randint(30, 180)
            n2 = random.randint(18, 120)
            gcd = __import__('math').gcd(n1, n2)
            lcm = n1 * n2 // gcd
            recs.append(mk_record(
                f"q-{CHAPTER}-struct-t{t_index:02d}-b{b_idx:02d}-ex-{i:02d}",
                f"【分支範例】{title}-{b_name}-{i:02d}",
                f"分支「{b_name}」：求 {n1} 與 {n2} 的最大公因數與最小公倍數。",
                f"gcd={gcd}，lcm={lcm}",
                "先求 gcd，再用 n1×n2=gcd×lcm 驗算。",
                [CHAPTER, f"topic:{tid}", f"branch:{b_name}", "group:branch-example", f"module:{title}"],
                "基礎",
            ))

    return recs, branches


def make_chapter_mixed(start_index=1, count=20):
    recs = []
    for i in range(start_index, start_index + count):
        a = random.randint(30, 180)
        b = random.randint(24, 140)
        g = __import__('math').gcd(a, b)
        recs.append(mk_record(
            f"q-{CHAPTER}-struct-ch-mix-{i:02d}",
            f"【章節綜合】{CHAPTER}-{i:02d}",
            f"綜合題：已知兩數為 {a}, {b}，先求最大公因數，再求最小公倍數。",
            f"gcd={g}，lcm={a*b//g}",
            "公因數公倍數綜合運算。",
            [CHAPTER, "group:chapter-mixed", "module:章節綜合練習"],
            "進階" if i % 3 else "挑戰",
        ))
    return recs


def build_links(records):
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec='seconds')
    links = []
    for r in records:
        qid = r["id"]
        qtitle = r.get("title", "")
        tags = r.get("tags", [])
        topic = ""
        for t in tags:
            if isinstance(t, str) and t.startswith("topic:"):
                topic = t.split(":", 1)[1].strip()
                break
        if topic:
            links.append({
                "id": f"link-{qid}-topic-{topic}",
                "title": f"{qid} -> {topic}",
                "question_id": qid,
                "question_title": qtitle,
                "topic_id": topic,
                "chapter_code": CHAPTER,
                "link_level": "topic",
                "source_type": "manual-structured-pack",
                "source_ref": SOURCE_REF,
                "confidence": 1.0,
                "created_at": now,
                "updated_at": now,
            })
        else:
            links.append({
                "id": f"link-{qid}-chapter-{CHAPTER}",
                "title": f"{qid} -> {CHAPTER}",
                "question_id": qid,
                "question_title": qtitle,
                "topic_id": "",
                "chapter_code": CHAPTER,
                "link_level": "chapter",
                "source_type": "manual-structured-pack",
                "source_ref": SOURCE_REF,
                "confidence": 0.9,
                "created_at": now,
                "updated_at": now,
            })
    return links


def main():
    topics = load_topics()
    records = []
    summary = []

    for idx, t in enumerate(topics, start=1):
        recs, branches = make_topic_pack(t, idx)
        records.extend(recs)
        summary.append({
            "topic_id": t.get("id", ""),
            "topic_title": t.get("title", ""),
            "topic_examples": 2,
            "topic_classwork": 4,
            "branch_examples": 6,
            "branches": branches,
        })

    records.extend(make_chapter_mixed(count=20))
    links = build_links(records)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with OUT_JSONL.open("w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    with OUT_LINKS.open("w", encoding="utf-8") as f:
        for l in links:
            f.write(json.dumps(l, ensure_ascii=False) + "\n")

    preview = {
        "meta": {
            "chapter_code": CHAPTER,
            "source_ref": SOURCE_REF,
            "topic_count": len(topics),
            "question_count": len(records),
            "link_count": len(links),
        },
        "summary_by_topic": summary,
        "questions": records,
    }
    OUT_PREVIEW.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"generated_questions={len(records)}")
    print(f"generated_links={len(links)}")
    print(OUT_JSONL)
    print(OUT_LINKS)
    print(OUT_PREVIEW)


if __name__ == "__main__":
    main()
