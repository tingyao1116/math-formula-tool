import json
import random
from pathlib import Path

random.seed(20260421 + 4)

ROOT = Path(r"D:\oneDrive\數學公式使用工具雲端版")
FDB = ROOT / "program-db" / "database" / "formula-db.json"
OUT_DIR = ROOT / "program-db" / "imports"
OUT_JSONL = OUT_DIR / "q-j1-3-1-2-structured-pack.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j1-3-1-2-structured-pack.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j1-3-1-2-structured-pack.preview.json"

SOURCE_REF = "改國一上4 一元一次方程式.docx"
CHAPTERS = ["j1-3-1", "j1-3-2"]

BRANCH_HINTS = {
    "列式": ["題意轉換", "未知數設定", "式子整理"],
    "代入": ["代入計算", "符號判讀", "結果解釋"],
    "連續": ["差值關係", "奇偶條件", "整數限制"],
    "移項": ["同加同減", "同乘同除", "符號變號"],
    "去括號": ["分配律", "同類項", "步驟整理"],
    "分數": ["同乘公倍數", "去分母", "還原驗算"],
    "解的型態": ["唯一解", "無解", "無限多解"],
    "驗算": ["代回原式", "合理性檢查", "單位檢查"],
}


def load_topics():
    payload = json.loads(FDB.read_text(encoding="utf-8"))
    rows = payload.get("topics", [])
    selected = [r for r in rows if str(r.get("chapterCode", "")).strip() in CHAPTERS]
    selected.sort(key=lambda x: (str(x.get("chapterCode", "")), str(x.get("parentId", "")), str(x.get("id", ""))))
    return selected


def pick_branches(title: str):
    for k, v in BRANCH_HINTS.items():
        if k in title:
            return v
    return ["核心觀念", "標準題型", "綜合應用"]


def mk_record(qid, title, q, a, e, chapter, tags, difficulty="基礎"):
    return {
        "id": qid,
        "title": title,
        "question_text": q,
        "answer_text": a,
        "explanation_text": e,
        "stage": "國中",
        "grade": "國一",
        "chapter": chapter,
        "chapter_code": chapter,
        "difficulty": difficulty,
        "source_type": "word_structured_generated",
        "source_ref": SOURCE_REF,
        "tags": tags,
    }


def make_topic_pack(topic, t_index):
    tid = str(topic.get("id", "")).strip()
    chapter = str(topic.get("chapterCode", "")).strip()
    title = str(topic.get("title", tid)).strip() or tid

    recs = []

    # 2 topic examples
    a = random.randint(-12, 12)
    b = random.randint(-12, 12)
    recs.append(mk_record(
        f"q-{chapter}-struct-t{t_index:02d}-ex-01",
        f"【主題範例】{title}-01",
        f"主題「{title}」範例：已知 x={a}，計算 3x+{b}。",
        str(3 * a + b),
        "先代入 x，再依序乘法與加法。",
        chapter,
        [chapter, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))
    p = random.randint(1, 9)
    q = random.randint(1, 9)
    r = random.randint(1, 15)
    recs.append(mk_record(
        f"q-{chapter}-struct-t{t_index:02d}-ex-02",
        f"【主題範例】{title}-02",
        f"主題「{title}」範例：解方程式 {p}x+{q}={r}。",
        f"x={(r-q)/p}",
        "移項後再同除係數。",
        chapter,
        [chapter, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    # 4 classwork
    for i in range(1, 5):
        m = random.randint(1, 7)
        n = random.randint(-10, 10)
        x = random.randint(-6, 6)
        recs.append(mk_record(
            f"q-{chapter}-struct-t{t_index:02d}-cw-{i:02d}",
            f"【主題課練】{title}-{i:02d}",
            f"課堂練習：若 x={x}，求 {m}x{n:+d} 的值。",
            str(m * x + n),
            "代入後先乘後加減。",
            chapter,
            [chapter, f"topic:{tid}", "group:topic-classwork", f"module:{title}"],
            "基礎" if i <= 2 else "進階",
        ))

    # 3 branches × 2 examples
    branches = pick_branches(title)
    for b_idx, b_name in enumerate(branches, start=1):
        for i in range(1, 3):
            a1 = random.randint(1, 8)
            b1 = random.randint(-12, 12)
            c1 = random.randint(-12, 20)
            x = (c1 - b1) / a1
            recs.append(mk_record(
                f"q-{chapter}-struct-t{t_index:02d}-b{b_idx:02d}-ex-{i:02d}",
                f"【分支範例】{title}-{b_name}-{i:02d}",
                f"分支「{b_name}」：解 {a1}x{b1:+d}={c1}。",
                f"x={x}",
                "同加減、同乘除保持等式平衡。",
                chapter,
                [chapter, f"topic:{tid}", f"branch:{b_name}", "group:branch-example", f"module:{title}"],
                "基礎",
            ))

    return recs, branches


def make_chapter_mixed(chapter, start_index=1, count=20):
    recs = []
    for i in range(start_index, start_index + count):
        a = random.randint(1, 9)
        b = random.randint(-10, 15)
        c = random.randint(-10, 15)
        d = random.randint(-10, 15)
        # a(x+b)=c+d
        rhs = c + d
        x = rhs / a - b
        recs.append(mk_record(
            f"q-{chapter}-struct-ch-mix-{i:02d}",
            f"【章節綜合】{chapter}-{i:02d}",
            f"綜合題：解方程式 {a}(x{b:+d})={c}+({d})。",
            f"x={x}",
            "先合併右式，再去括號或同除係數。",
            chapter,
            [chapter, "group:chapter-mixed", "module:章節綜合練習"],
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
        chapter = r.get("chapter_code", "")
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
                "chapter_code": chapter,
                "link_level": "topic",
                "source_type": "manual-structured-pack",
                "source_ref": SOURCE_REF,
                "confidence": 1.0,
                "created_at": now,
                "updated_at": now,
            })
        else:
            links.append({
                "id": f"link-{qid}-chapter-{chapter}",
                "title": f"{qid} -> {chapter}",
                "question_id": qid,
                "question_title": qtitle,
                "topic_id": "",
                "chapter_code": chapter,
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

    chapter_buckets = {c: [] for c in CHAPTERS}
    for t in topics:
        chapter_buckets[str(t.get("chapterCode", "")).strip()].append(t)

    for chapter in CHAPTERS:
        for idx, t in enumerate(chapter_buckets.get(chapter, []), start=1):
            recs, branches = make_topic_pack(t, idx)
            records.extend(recs)
            summary.append({
                "chapter_code": chapter,
                "topic_id": t.get("id", ""),
                "topic_title": t.get("title", ""),
                "topic_examples": 2,
                "topic_classwork": 4,
                "branch_examples": 6,
                "branches": branches,
            })
        records.extend(make_chapter_mixed(chapter, count=20))

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
            "source_ref": SOURCE_REF,
            "chapters": CHAPTERS,
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
