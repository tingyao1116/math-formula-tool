import json
import random
from pathlib import Path

random.seed(20260421 + 6)

ROOT = Path(r"D:\oneDrive\數學公式使用工具雲端版")
FDB = ROOT / "program-db" / "database" / "formula-db.json"
OUT_DIR = ROOT / "program-db" / "imports"
OUT_JSONL = OUT_DIR / "q-j2-2-1-2-structured-pack.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j2-2-1-2-structured-pack.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j2-2-1-2-structured-pack.preview.json"

SOURCE_REF = "改國一下2  二元一次方程式的圖形.docx"
CHAPTERS = ["j2-2-1", "j2-2-2"]

BRANCH_HINTS = {
    "象限": ["符號判讀", "點位判別", "反推象限"],
    "距離": ["軸距離", "兩點距離", "絕對值表示"],
    "中點": ["中點公式", "反求端點", "檢核"],
    "平移": ["平移向量", "座標變化", "應用題"],
    "參數": ["參數範圍", "條件限制", "反推"],
    "截距": ["x截距", "y截距", "作圖"],
    "特殊直線": ["x=a", "y=b", "平行軸"],
    "圖解": ["交點判讀", "聯立解", "無解判斷"],
    "兩直線": ["平行", "重合", "相交"],
    "交點": ["代入求交", "參數求值", "驗證"],
    "檢核": ["代回方程", "圖形一致", "合理性"],
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

    x = random.randint(-8, 8)
    y = random.randint(-8, 8)
    recs.append(mk_record(
        f"q-{chapter}-struct-t{t_index:02d}-ex-01",
        f"【主題範例】{title}-01",
        f"主題「{title}」範例：點 A({x},{y}) 位於哪一象限（或軸上）？",
        ("第一象限" if x>0 and y>0 else "第二象限" if x<0 and y>0 else "第三象限" if x<0 and y<0 else "第四象限" if x>0 and y<0 else "座標軸上"),
        "依 x、y 正負號判斷所在位置。",
        chapter,
        [chapter, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    a = random.randint(1, 6)
    b = random.randint(-6, 6)
    c = random.randint(1, 6)
    d = random.randint(-6, 6)
    recs.append(mk_record(
        f"q-{chapter}-struct-t{t_index:02d}-ex-02",
        f"【主題範例】{title}-02",
        f"主題「{title}」範例：求兩點 A({a},{b}), B({c},{d}) 的中點座標。",
        f"(({(a+c)/2},{(b+d)/2}))",
        "中點公式 M=((x1+x2)/2,(y1+y2)/2)。",
        chapter,
        [chapter, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    for i in range(1, 5):
        m = random.randint(-4, 4)
        if m == 0:
            m = 1
        k = random.randint(-8, 8)
        x0 = random.randint(-5, 5)
        y = m * x0 + k
        recs.append(mk_record(
            f"q-{chapter}-struct-t{t_index:02d}-cw-{i:02d}",
            f"【主題課練】{title}-{i:02d}",
            f"課堂練習：已知直線 y={m}x{k:+d}，當 x={x0} 時 y=?",
            str(y),
            "代入 x 計算對應 y 值。",
            chapter,
            [chapter, f"topic:{tid}", "group:topic-classwork", f"module:{title}"],
            "基礎" if i <= 2 else "進階",
        ))

    branches = pick_branches(title)
    for b_idx, b_name in enumerate(branches, start=1):
        for i in range(1, 3):
            p = random.randint(-5, 5)
            q = random.randint(-5, 5)
            r = random.randint(-5, 5)
            s = random.randint(-5, 5)
            recs.append(mk_record(
                f"q-{chapter}-struct-t{t_index:02d}-b{b_idx:02d}-ex-{i:02d}",
                f"【分支範例】{title}-{b_name}-{i:02d}",
                f"分支「{b_name}」：點 A({p},{q}) 平移向量 ({r},{s}) 後座標為何？",
                f"({p+r},{q+s})",
                "平移後新座標 = (x+Δx, y+Δy)。",
                chapter,
                [chapter, f"topic:{tid}", f"branch:{b_name}", "group:branch-example", f"module:{title}"],
                "基礎",
            ))

    return recs, branches


def make_chapter_mixed(chapter, start_index=1, count=20):
    recs = []
    for i in range(start_index, start_index + count):
        a1 = random.randint(-5, 5)
        if a1 == 0:
            a1 = 1
        b1 = random.randint(-9, 9)
        a2 = random.randint(-5, 5)
        if a2 == 0:
            a2 = -1
        b2 = random.randint(-9, 9)
        x = random.randint(-4, 4)
        y1 = a1 * x + b1
        y2 = a2 * x + b2
        recs.append(mk_record(
            f"q-{chapter}-struct-ch-mix-{i:02d}",
            f"【章節綜合】{chapter}-{i:02d}",
            f"綜合題：比較 y={a1}x{b1:+d} 與 y={a2}x{b2:+d} 在 x={x} 時的大小。",
            f"y1={y1}, y2={y2}",
            "代入相同 x 後比較函數值。",
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
