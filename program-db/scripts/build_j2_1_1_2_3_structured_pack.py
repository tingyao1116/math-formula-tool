import json
import random
from pathlib import Path

random.seed(20260421 + 5)

ROOT = Path(r"D:\oneDrive\數學公式使用工具雲端版")
FDB = ROOT / "program-db" / "database" / "formula-db.json"
OUT_DIR = ROOT / "program-db" / "imports"
OUT_JSONL = OUT_DIR / "q-j2-1-1-2-3-structured-pack.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j2-1-1-2-3-structured-pack.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j2-1-1-2-3-structured-pack.preview.json"

SOURCE_REF = "改國一下1  二元一次聯立方程式.docx"
CHAPTERS = ["j2-1-1", "j2-1-2", "j2-1-3"]

BRANCH_HINTS = {
    "數對": ["代入驗證", "座標意義", "成立條件"],
    "情境": ["未知數設定", "條件翻譯", "方程建立"],
    "化簡": ["同類項整理", "移項整理", "標準型"],
    "代入": ["單式代入", "連續代入", "驗算"],
    "消去": ["同加減", "倍數消元", "回代"],
    "解法選擇": ["觀察係數", "效率比較", "錯誤避雷"],
    "分數": ["同乘公倍數", "整係數化", "回代驗算"],
    "型態": ["唯一解", "無解", "無限多解"],
    "高斯": ["列增廣矩陣", "行運算", "讀解"],
    "價格": ["單價數量", "總價關係", "結果檢核"],
    "雞兔": ["頭腳關係", "整數限制", "代回檢查"],
    "年齡": ["時間軸", "差與和", "驗算"],
    "數字": ["位值拆解", "條件轉式", "解答檢查"],
    "速率": ["路程公式", "相遇追及", "單位一致"],
    "檢核": ["代回原題", "情境合理", "單位檢查"],
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

    # topic examples x2
    x = random.randint(-8, 8)
    y = random.randint(-8, 8)
    recs.append(mk_record(
        f"q-{chapter}-struct-t{t_index:02d}-ex-01",
        f"【主題範例】{title}-01",
        f"主題「{title}」範例：已知 x={x}, y={y}，計算 2x-3y。",
        str(2 * x - 3 * y),
        "直接代入並計算。",
        chapter,
        [chapter, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    a = random.randint(1, 6)
    b = random.randint(1, 6)
    c = random.randint(4, 30)
    d = random.randint(1, 6)
    e = random.randint(1, 6)
    f = random.randint(4, 30)
    recs.append(mk_record(
        f"q-{chapter}-struct-t{t_index:02d}-ex-02",
        f"【主題範例】{title}-02",
        f"主題「{title}」範例：解聯立方程 {a}x+{b}y={c}, {d}x+{e}y={f}。",
        "請以代入或消去求解", 
        "先選擇容易消去的未知數，再回代求另一個未知數。",
        chapter,
        [chapter, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    # classwork x4
    for i in range(1, 5):
        p = random.randint(1, 9)
        q = random.randint(1, 9)
        r = random.randint(5, 40)
        recs.append(mk_record(
            f"q-{chapter}-struct-t{t_index:02d}-cw-{i:02d}",
            f"【主題課練】{title}-{i:02d}",
            f"課堂練習：若 x+y={p} 且 x-y={q}，求 x,y。",
            f"x={(p+q)/2}, y={(p-q)/2}",
            "兩式相加與相減可快速解。",
            chapter,
            [chapter, f"topic:{tid}", "group:topic-classwork", f"module:{title}"],
            "基礎" if i <= 2 else "進階",
        ))

    # branch examples: 3 branches * 2
    branches = pick_branches(title)
    for b_idx, b_name in enumerate(branches, start=1):
        for i in range(1, 3):
            m = random.randint(1, 7)
            n = random.randint(1, 7)
            k = random.randint(1, 7)
            t = random.randint(1, 7)
            u = random.randint(5, 50)
            v = random.randint(5, 50)
            recs.append(mk_record(
                f"q-{chapter}-struct-t{t_index:02d}-b{b_idx:02d}-ex-{i:02d}",
                f"【分支範例】{title}-{b_name}-{i:02d}",
                f"分支「{b_name}」：解聯立 {m}x+{n}y={u}, {k}x-{t}y={v}。",
                "請完整列式與回代", 
                "可用加減消去法，最後代回驗算。",
                chapter,
                [chapter, f"topic:{tid}", f"branch:{b_name}", "group:branch-example", f"module:{title}"],
                "基礎",
            ))

    return recs, branches


def make_chapter_mixed(chapter, start_index=1, count=20):
    recs = []
    for i in range(start_index, start_index + count):
        a = random.randint(1, 8)
        b = random.randint(1, 8)
        c = random.randint(1, 8)
        d = random.randint(1, 8)
        x0 = random.randint(-5, 10)
        y0 = random.randint(-5, 10)
        u = a * x0 + b * y0
        v = c * x0 + d * y0
        recs.append(mk_record(
            f"q-{chapter}-struct-ch-mix-{i:02d}",
            f"【章節綜合】{chapter}-{i:02d}",
            f"綜合題：解 {a}x+{b}y={u}, {c}x+{d}y={v}。",
            f"x={x0}, y={y0}",
            "可用代入法或消去法，並代回雙式檢查。",
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
