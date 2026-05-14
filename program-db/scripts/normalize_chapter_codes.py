import argparse
import json
import re
import shutil
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DB_DIR = ROOT / "program-db" / "database"
FORMULA_DB = DB_DIR / "formula-db.json"
QUESTION_DB = DB_DIR / "question-db.json"
LINK_DB = DB_DIR / "topic-question-link-db.json"
CHAPTER_DB = DB_DIR / "chapter-code-db.json"


def load_json(path: Path, empty: dict):
    if not path.exists():
        return empty.copy()
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def backup_file(path: Path):
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out = path.with_name(f"{path.stem}.backup-normalize-chapters-{stamp}{path.suffix}")
    shutil.copy2(path, out)
    return out


def now_iso():
    return datetime.now().isoformat(timespec="seconds")


def normalize_text(value):
    return str(value or "").lower().replace(" ", "").replace("　", "").strip()


def normalize_code(value):
    text = str(value or "").strip()
    if not text:
        return ""
    if re.fullmatch(r"b-\d+", text, flags=re.I):
        return text.upper()
    return text.lower()


def is_chapter_code(value, catalog):
    return normalize_code(value) in catalog


def code_from_id(value, catalog):
    text = str(value or "").strip()
    if not text:
        return ""
    best = ""
    for code in catalog:
        if text == code or text.startswith(f"{code}-"):
            if len(code) > len(best):
                best = code
    return best


def build_lookup(catalog):
    lookup = defaultdict(set)
    manual_aliases = {
        "正負數加減乘除": "j1-1-2",
        "絕對值": "j1-1-1",
        "因數倍數": "j1-2-1",
        "一元一次方程式": "j1-3-2",
        "二元一次聯立方程式": "j2-1-2",
        "比例": "j2-3-1",
        "一元一次不等式": "j2-4-1",
        "座標概念": "j2-2-1",
        "多項式": "j3-1-2",
        "多項式乘除法": "j3-1-3",
        "因式分解": "j3-3-1",
        "一元二次方程式": "j3-4-1",
        "線型函數": "j4-2",
        "國一補充": "j1-x",
        "排列組合": "s2-2-2",
        "圓與直線的關係": "s1-2-3",
        "對數": "s1-1-5",
        "平面方程式": "s4-2-1",
        "空間直線方程式": "s4-2-2",
        "二元一次不等式與圓錐曲線": "B-2",
        "比例線段": "j5-1-2",
        "相似三角形": "j5-1-3",
        "圓與角": "j5-2-2",
        "統計（一）": "j6-3-1",
        "統計一": "j6-3-1",
        "統計（二）": "j6-3-2",
        "統計二": "j6-3-2",
        "機率": "j6-3-3",
    }

    for code, meta in catalog.items():
        if not isinstance(meta, dict):
            continue
        for raw in [code, meta.get("section", ""), meta.get("chapter", "")]:
            key = normalize_text(raw)
            if key:
                lookup[key].add(code)

    for raw, code in manual_aliases.items():
        if code in catalog:
            lookup[normalize_text(raw)] = {code}

    return lookup


def single_lookup(value, lookup):
    key = normalize_text(value)
    if not key:
        return ""
    codes = lookup.get(key, set())
    return next(iter(codes)) if len(codes) == 1 else ""


def topic_ids_from_tags(tags):
    ids = []
    for tag in tags if isinstance(tags, list) else []:
        text = str(tag or "").strip()
        lower = text.lower()
        if lower.startswith("topic:") or lower.startswith("topic="):
            ids.append(text.split(":", 1)[-1].split("=", 1)[-1].strip())
    return [item for item in ids if item]


def infer_topic_code(row, catalog, lookup):
    for field in ["chapter_code", "chapterCode", "chapter"]:
        value = row.get(field, "")
        if is_chapter_code(value, catalog):
            return normalize_code(value), field

    for field in ["id", "parentId"]:
        code = code_from_id(row.get(field, ""), catalog)
        if code:
            return code, field

    code = single_lookup(row.get("chapter", ""), lookup)
    if code:
        return code, "chapter-name"

    return "", ""


def infer_question_code(row, catalog, lookup, topic_code_by_id, link_codes_by_question):
    for field in ["chapter_code", "chapterCode", "chapter"]:
        value = row.get(field, "")
        if is_chapter_code(value, catalog):
            return normalize_code(value), field

    code = code_from_id(row.get("id", ""), catalog)
    if code:
        return code, "id"

    code = single_lookup(row.get("chapter", ""), lookup)
    if code:
        return code, "chapter-name"

    linked = link_codes_by_question.get(str(row.get("id", "")).strip(), set())
    if len(linked) == 1:
        return next(iter(linked)), "link"

    tag_codes = {
        topic_code_by_id[topic_id]
        for topic_id in topic_ids_from_tags(row.get("tags", []))
        if topic_id in topic_code_by_id
    }
    if len(tag_codes) == 1:
        return next(iter(tag_codes)), "topic-tag"

    return "", ""


def apply_code(row, code):
    changed = False
    old_chapter = str(row.get("chapter", "")).strip()
    old_code = str(row.get("chapter_code", "")).strip()
    if old_chapter != code:
        row["chapter"] = code
        changed = True
    if old_code != code:
        row["chapter_code"] = code
        changed = True
    if "chapterCode" in row:
        row.pop("chapterCode", None)
        changed = True
    return changed


def summarize_unresolved(rows, label):
    counter = Counter(str(row.get("chapter", "")).strip() or "(blank)" for row in rows)
    print(f"{label} unresolved: {len(rows)}")
    for chapter, count in counter.most_common(20):
        print(f"  {count:>4}  {chapter}")


def main():
    parser = argparse.ArgumentParser(description="Normalize topic/question chapter fields to chapter-code-db codes.")
    parser.add_argument("--apply", action="store_true", help="Write changes. Default is dry-run.")
    args = parser.parse_args()

    chapter_payload = load_json(CHAPTER_DB, {"catalog": {}})
    catalog = {normalize_code(code): meta for code, meta in chapter_payload.get("catalog", {}).items()}
    lookup = build_lookup(catalog)

    formula_payload = load_json(FORMULA_DB, {"meta": {}, "topics": []})
    question_payload = load_json(QUESTION_DB, {"meta": {}, "questions": []})
    link_payload = load_json(LINK_DB, {"meta": {}, "links": []})
    topics = formula_payload.get("topics", [])
    questions = question_payload.get("questions", [])
    links = link_payload.get("links", [])

    topic_changes = []
    unresolved_topics = []
    topic_code_by_id = {}
    topic_reason_counter = Counter()

    for row in topics:
        code, reason = infer_topic_code(row, catalog, lookup)
        tid = str(row.get("id", "")).strip()
        if code:
            if tid:
                topic_code_by_id[tid] = code
            topic_reason_counter[reason] += 1
            if str(row.get("chapter", "")).strip() != code or str(row.get("chapter_code", "")).strip() != code:
                topic_changes.append((row, code, reason))
        else:
            unresolved_topics.append(row)

    link_codes_by_question = defaultdict(set)
    for link in links:
        qid = str(link.get("question_id", "")).strip()
        code = normalize_code(link.get("chapter_code", ""))
        if qid and code in catalog:
            link_codes_by_question[qid].add(code)

    question_changes = []
    unresolved_questions = []
    question_reason_counter = Counter()
    for row in questions:
        code, reason = infer_question_code(row, catalog, lookup, topic_code_by_id, link_codes_by_question)
        if code:
            question_reason_counter[reason] += 1
            if str(row.get("chapter", "")).strip() != code or str(row.get("chapter_code", "")).strip() != code:
                question_changes.append((row, code, reason))
        else:
            unresolved_questions.append(row)

    print("=== Chapter Code Normalize Preview ===")
    print(f"Topics total    : {len(topics)}")
    print(f"Topics changes  : {len(topic_changes)}")
    print(f"Topic reasons   : {dict(topic_reason_counter)}")
    summarize_unresolved(unresolved_topics, "Topics")
    print()
    print(f"Questions total  : {len(questions)}")
    print(f"Question changes : {len(question_changes)}")
    print(f"Question reasons : {dict(question_reason_counter)}")
    summarize_unresolved(unresolved_questions, "Questions")

    print()
    print("Sample topic changes:")
    for row, code, reason in topic_changes[:12]:
        print(f"  {row.get('id')}  {row.get('chapter')} / {row.get('chapter_code', '')} -> {code} ({reason})")
    print("Sample question changes:")
    for row, code, reason in question_changes[:12]:
        print(f"  {row.get('id')}  {row.get('chapter')} / {row.get('chapter_code', '')} -> {code} ({reason})")

    if not args.apply:
        print()
        print("Dry-run only. Re-run with --apply to write changes.")
        return

    backups = []
    for path in [FORMULA_DB, QUESTION_DB]:
        if path.exists():
            backups.append(str(backup_file(path)))

    for row, code, _reason in topic_changes:
        apply_code(row, code)
    for row, code, _reason in question_changes:
        apply_code(row, code)

    stamp = now_iso()
    formula_payload.setdefault("meta", {})
    formula_payload["meta"]["count"] = len(topics)
    formula_payload["meta"]["updatedAt"] = stamp
    formula_payload["meta"]["lastChapterCodeNormalize"] = {
        "updated_topics": len(topic_changes),
        "unresolved_topics": len(unresolved_topics),
    }

    question_payload.setdefault("meta", {})
    question_payload["meta"]["count"] = len(questions)
    question_payload["meta"]["updatedAt"] = stamp
    question_payload["meta"]["lastChapterCodeNormalize"] = {
        "updated_questions": len(question_changes),
        "unresolved_questions": len(unresolved_questions),
    }

    save_json(FORMULA_DB, formula_payload)
    save_json(QUESTION_DB, question_payload)

    try:
        from sync_legacy_bridge import sync_legacy_js_from_db
        from sync_extra_bridge import sync_managed_json_from_topics_db

        sync_legacy_js_from_db(FORMULA_DB)
        sync_managed_json_from_topics_db(FORMULA_DB)
    except Exception as exc:
        print(f"Warning: web sync failed: {exc}")

    print()
    print("Applied.")
    print("Backups:")
    for path in backups:
        print(f"  {path}")


if __name__ == "__main__":
    main()
