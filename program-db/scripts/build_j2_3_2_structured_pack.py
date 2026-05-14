import json
import random
from pathlib import Path

random.seed(20260421 + 8)

ROOT = Path(r"D:\oneDrive\數學公式使用工具雲端版")
FDB = ROOT / "program-db" / "database" / "formula-db.json"
OUT_DIR = ROOT / "program-db" / "imports"
OUT_JSONL = OUT_DIR / "q-j2-3-2-structured-pack.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j2-3-2-structured-pack.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j2-3-2-structured-pack.preview.json"

CHAPTER = "j2-3-2"
SOURCE_REF = "改國一下4  函數與其圖形.docx"

BRANCH_HINTS = {
    "正比例": ["比例常數", "代數式", "表格對應"],
    "正比圖形": ["過原點", "斜率判讀", "點代入"],
    "反比例": ["乘積定值", "代數式", "表格對應"],
    "反比圖形": ["雙曲線象限", "遞減判讀", "點代入"],
    "應用": ["工程效率", "速度時間", "濃度配比"],
    "綜合判斷": ["正反比辨識", "條件檢核", "誤差排除"],
    "核心": ["函數觀念", "變量關係", "圖形連結"],
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

    k = random.randint(1, 9)
    x = random.randint(1, 12)
    recs.append(mk_record(
        f"q-{CHAPTER}-struct-t{t_index:02d}-ex-01",
        f"【主題範例】{title}-01",
        f"主題「{title}」範例：若 y={k}x，當 x={x} 時 y=?",
        str(k * x),
        "正比例 y=kx，直接代入。",
        [CHAPTER, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    p = random.randint(6, 40)
    q = random.randint(2, 10)
    recs.append(mk_record(
        f"q-{CHAPTER}-struct-t{t_index:02d}-ex-02",
        f"【主題範例】{title}-02",
        f"主題「{title}」範例：若 x 與 y 成反比且 xy={p}，當 x={q} 時 y=?",
        str(p / q),
        "反比例滿足 xy=定值。",
        [CHAPTER, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    for i in range(1, 5):
        a = random.randint(1, 8)
        b = random.randint(1, 8)
        c = random.randint(1, 12)
        recs.append(mk_record(
            f"q-{CHAPTER}-struct-t{t_index:02d}-cw-{i:02d}",
            f"【主題課練】{title}-{i:02d}",
            f"課堂練習：判斷下列是否成正比：x={a},{b} 時，y={a*c},{b*c}。",
            "是",
            "若 y/x 比值固定，則為正比。",
            [CHAPTER, f"topic:{tid}", "group:topic-classwork", f"module:{title}"],
            "基礎" if i <= 2 else "進階",
        ))

    branches = pick_branches(title)
    for b_idx, b_name in enumerate(branches, start=1):
        for i in range(1, 3):
            r = random.randint(2, 9)
            s = random.randint(2, 9)
            t = random.randint(2, 9)
            recs.append(mk_record(
                f"q-{CHAPTER}-struct-t{t_index:02d}-b{b_idx:02d}-ex-{i:02d}",
                f"【分支範例】{title}-{b_name}-{i:02d}",
                f"分支「{b_name}」：若 x:y={r}:{s}，當 x={r*t} 時 y=?",
                str(s * t),
                "比值保持不變，按同倍數縮放。",
                [CHAPTER, f"topic:{tid}", f"branch:{b_name}", "group:branch-example", f"module:{title}"],
                "基礎",
            ))

    return recs, branches


def make_chapter_mixed(start_index=1, count=20):
    recs = []
    for i in range(start_index, start_index + count):
        mode = "direct" if i % 2 else "inverse"
        if mode == "direct":
            k = random.randint(1, 9)
            x = random.randint(1, 15)
            recs.append(mk_record(
                f"q-{CHAPTER}-struct-ch-mix-{i:02d}",
                f"【章節綜合】{CHAPTER}-{i:02d}",
                f"綜合題：y 與 x 成正比，且 y={k}x。當 x={x}，求 y。",
                str(k * x),
                "套用 y=kx。",
                [CHAPTER, "group:chapter-mixed", "module:章節綜合練習"],
                "進階",
            ))
        else:
            c = random.randint(12, 90)
            x = random.randint(2, 10)
            recs.append(mk_record(
                f"q-{CHAPTER}-struct-ch-mix-{i:02d}",
                f"【章節綜合】{CHAPTER}-{i:02d}",
                f"綜合題：y 與 x 成反比，且 xy={c}。當 x={x}，求 y。",
                str(c / x),
                "套用 xy=定值。",
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
