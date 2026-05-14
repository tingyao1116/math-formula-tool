import json
import random
from pathlib import Path

random.seed(20260421 + 7)

ROOT = Path(r"D:\oneDrive\數學公式使用工具雲端版")
FDB = ROOT / "program-db" / "database" / "formula-db.json"
OUT_DIR = ROOT / "program-db" / "imports"
OUT_JSONL = OUT_DIR / "q-j2-3-1-structured-pack.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j2-3-1-structured-pack.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j2-3-1-structured-pack.preview.json"

CHAPTER = "j2-3-1"
SOURCE_REF = "改國一下3  比與比例式.docx"

BRANCH_HINTS = {
    "濃度": ["濃度定義", "濃度換算", "混合濃度"],
    "成本": ["成本定價", "折扣售價", "利潤率"],
    "打折": ["折數換算", "價差比較", "反推原價"],
    "距離": ["速率關係", "單位換算", "比例應用"],
    "比值": ["比值計算", "同倍縮放", "比值比較"],
    "化簡": ["最大公因數", "整數化", "最簡比"],
    "相等": ["交叉相乘", "約分判斷", "等比變形"],
    "比例式": ["內外項性質", "求未知數", "驗算"],
    "分配": ["總份數法", "分配量", "反推份數"],
    "連比": ["連比轉換", "中介量", "連比例"],
    "最簡整數連比": ["最小公倍數", "整數化", "檢核"],
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

    a = random.randint(2, 18)
    b = random.randint(2, 18)
    g = __import__('math').gcd(a, b)
    recs.append(mk_record(
        f"q-{CHAPTER}-struct-t{t_index:02d}-ex-01",
        f"【主題範例】{title}-01",
        f"主題「{title}」範例：將 {a}:{b} 化成最簡整數比。",
        f"{a//g}:{b//g}",
        "同除以最大公因數得到最簡比。",
        [CHAPTER, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    x = random.randint(2, 9)
    y = random.randint(2, 9)
    z = random.randint(2, 9)
    recs.append(mk_record(
        f"q-{CHAPTER}-struct-t{t_index:02d}-ex-02",
        f"【主題範例】{title}-02",
        f"主題「{title}」範例：已知 x:y={x}:{y} 且 y:z={y}:{z}，寫出 x:y:z。",
        f"{x}:{y}:{z}",
        "把中間項對齊後可直接組成連比。",
        [CHAPTER, f"topic:{tid}", "group:topic-example", f"module:{title}"],
        "基礎",
    ))

    for i in range(1, 5):
        p = random.randint(2, 12)
        q = random.randint(2, 12)
        k = random.randint(2, 10)
        recs.append(mk_record(
            f"q-{CHAPTER}-struct-t{t_index:02d}-cw-{i:02d}",
            f"【主題課練】{title}-{i:02d}",
            f"課堂練習：若甲乙比為 {p}:{q}，總數為 {(p+q)*k}，求甲與乙各多少。",
            f"甲={p*k}, 乙={q*k}",
            "先求每份，再按比還原。",
            [CHAPTER, f"topic:{tid}", "group:topic-classwork", f"module:{title}"],
            "基礎" if i <= 2 else "進階",
        ))

    branches = pick_branches(title)
    for b_idx, b_name in enumerate(branches, start=1):
        for i in range(1, 3):
            a1 = random.randint(2, 15)
            b1 = random.randint(2, 15)
            c1 = random.randint(2, 15)
            recs.append(mk_record(
                f"q-{CHAPTER}-struct-t{t_index:02d}-b{b_idx:02d}-ex-{i:02d}",
                f"【分支範例】{title}-{b_name}-{i:02d}",
                f"分支「{b_name}」：比較 {a1}:{b1} 與 {a1*c1}:{b1*c1} 是否相等。",
                "相等",
                "比的前後項同乘同數，比值不變。",
                [CHAPTER, f"topic:{tid}", f"branch:{b_name}", "group:branch-example", f"module:{title}"],
                "基礎",
            ))

    return recs, branches


def make_chapter_mixed(start_index=1, count=20):
    recs = []
    for i in range(start_index, start_index + count):
        a = random.randint(2, 12)
        b = random.randint(2, 12)
        total = random.randint(5, 20) * (a + b)
        x = total * a // (a + b)
        y = total * b // (a + b)
        recs.append(mk_record(
            f"q-{CHAPTER}-struct-ch-mix-{i:02d}",
            f"【章節綜合】{CHAPTER}-{i:02d}",
            f"綜合題：某兩數比為 {a}:{b}，和為 {total}，求兩數。",
            f"{x}, {y}",
            "用總份數法：每份=總和/(a+b)。",
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
