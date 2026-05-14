import json
import random
from pathlib import Path

random.seed(20260421 + 9)

ROOT = Path(r"D:\oneDrive\數學公式使用工具雲端版")
FDB = ROOT / "program-db" / "database" / "formula-db.json"
OUT_DIR = ROOT / "program-db" / "imports"
OUT_JSONL = OUT_DIR / "q-j2-4-1-structured-pack.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j2-4-1-structured-pack.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j2-4-1-structured-pack.preview.json"

CHAPTER = "j2-4-1"
SOURCE_REF = "改國一下5 一元一次不等式.docx"

BRANCHES = ["移項與同除", "數線區間表示", "情境應用"]


def load_topics():
    payload = json.loads(FDB.read_text(encoding="utf-8"))
    rows = payload.get("topics", [])
    selected = [r for r in rows if str(r.get("chapterCode", "")).strip() == CHAPTER]
    selected.sort(key=lambda x: str(x.get("id", "")))
    return selected


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

    a = random.randint(2, 7)
    b = random.randint(-12, 8)
    c = random.randint(-8, 20)
    bound = (c - b) / a
    recs.append(mk_record(
        f"q-{CHAPTER}-struct-t{t_index:02d}-ex-01",
        f"【主題範例】{title}-01",
        f"主題「{title}」範例：解不等式 {a}x{b:+d} > {c}。",
        f"x > {bound}",
        "移項後同除正數，方向不變。",
        [CHAPTER, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    a2 = random.randint(-7, -2)
    b2 = random.randint(-10, 10)
    c2 = random.randint(-8, 20)
    bound2 = (c2 - b2) / a2
    recs.append(mk_record(
        f"q-{CHAPTER}-struct-t{t_index:02d}-ex-02",
        f"【主題範例】{title}-02",
        f"主題「{title}」範例：解不等式 {a2}x{b2:+d} ≤ {c2}。",
        f"x ≥ {bound2}",
        "同除負數時，不等號方向需反轉。",
        [CHAPTER, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    for i in range(1, 5):
        m = random.randint(2, 9)
        n = random.randint(-10, 10)
        k = random.randint(-10, 18)
        rhs = (k - n) / m
        recs.append(mk_record(
            f"q-{CHAPTER}-struct-t{t_index:02d}-cw-{i:02d}",
            f"【主題課練】{title}-{i:02d}",
            f"課堂練習：解 {m}x{n:+d} ≥ {k}。",
            f"x ≥ {rhs}",
            "線性不等式逐步移項求解。",
            [CHAPTER, f"topic:{tid}", "group:topic-classwork", f"module:{title}"],
            "基礎" if i <= 2 else "進階",
        ))

    for b_idx, b_name in enumerate(BRANCHES, start=1):
        for i in range(1, 3):
            p = random.randint(1, 8)
            q = random.randint(-9, 9)
            r = random.randint(-9, 18)
            bound = (r - q) / p
            recs.append(mk_record(
                f"q-{CHAPTER}-struct-t{t_index:02d}-b{b_idx:02d}-ex-{i:02d}",
                f"【分支範例】{title}-{b_name}-{i:02d}",
                f"分支「{b_name}」：解 {p}x{q:+d} < {r}，並用區間表示。",
                f"x < {bound}",
                "先代數求界線，再用數線或區間表示。",
                [CHAPTER, f"topic:{tid}", f"branch:{b_name}", "group:branch-example", f"module:{title}"],
                "基礎",
            ))

    return recs


def make_chapter_mixed(start_index=1, count=20):
    recs = []
    for i in range(start_index, start_index + count):
        sign = random.choice([">", "<", "≥", "≤"])
        a = random.randint(-9, 9)
        while a == 0:
            a = random.randint(-9, 9)
        b = random.randint(-12, 12)
        c = random.randint(-12, 20)
        pivot = (c - b) / a
        if a > 0:
            ans = f"x {sign} {pivot}"
        else:
            flip = {">":"<","<":">","≥":"≤","≤":"≥"}
            ans = f"x {flip[sign]} {pivot}"
        recs.append(mk_record(
            f"q-{CHAPTER}-struct-ch-mix-{i:02d}",
            f"【章節綜合】{CHAPTER}-{i:02d}",
            f"綜合題：解不等式 {a}x{b:+d} {sign} {c}。",
            ans,
            "注意同除負數時方向反轉。",
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
        recs = make_topic_pack(t, idx)
        records.extend(recs)
        summary.append({
            "topic_id": t.get("id", ""),
            "topic_title": t.get("title", ""),
            "topic_examples": 2,
            "topic_classwork": 4,
            "branch_examples": 6,
            "branches": BRANCHES,
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
