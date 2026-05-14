import argparse
import json
from datetime import datetime
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
DB_DIR = SCRIPT_DIR.parent / "database"
QUESTION_DB = DB_DIR / "question-db.json"
LINK_DB = DB_DIR / "topic-question-link-db.json"


def load_json(path: Path, empty_shape: dict):
    if not path.exists():
        return empty_shape.copy()
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def backup_file(path: Path):
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = path.with_name(f"{path.stem}.backup-{stamp}{path.suffix}")
    backup_path.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")
    return backup_path


def main():
    parser = argparse.ArgumentParser(
        description="Delete imported questions/links by source_ref and/or id prefix."
    )
    parser.add_argument(
        "--source-ref",
        default="",
        help="Exact source_ref to match (e.g. 改國一下5 一元一次不等式.docx)",
    )
    parser.add_argument(
        "--id-prefix",
        default="",
        help="Delete questions whose id starts with this prefix",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply changes. Without this flag, script runs as dry-run.",
    )
    args = parser.parse_args()

    source_ref = str(args.source_ref or "").strip()
    id_prefix = str(args.id_prefix or "").strip()
    if not source_ref and not id_prefix:
        raise ValueError("At least one of --source-ref or --id-prefix is required.")

    q_payload = load_json(QUESTION_DB, {"meta": {}, "questions": []})
    l_payload = load_json(LINK_DB, {"meta": {}, "links": []})
    q_rows = q_payload.get("questions", [])
    l_rows = l_payload.get("links", [])

    def match_question(row):
        qid = str(row.get("id", "")).strip()
        src = str(row.get("source_ref", "")).strip()
        src_hit = bool(source_ref and src == source_ref)
        id_hit = bool(id_prefix and qid.startswith(id_prefix))
        return src_hit or id_hit

    remove_questions = [row for row in q_rows if match_question(row)]
    remove_question_ids = {str(row.get("id", "")).strip() for row in remove_questions}

    def match_link(row):
        lsrc = str(row.get("source_ref", "")).strip()
        qid = str(row.get("question_id", "")).strip()
        src_hit = bool(source_ref and lsrc == source_ref)
        qid_hit = qid in remove_question_ids
        id_hit = bool(id_prefix and qid.startswith(id_prefix))
        return src_hit or qid_hit or id_hit

    remove_links = [row for row in l_rows if match_link(row)]

    keep_questions = [row for row in q_rows if not match_question(row)]
    keep_links = [row for row in l_rows if not match_link(row)]

    print("=== Reverse Delete Preview ===")
    print(f"Question DB: {QUESTION_DB}")
    print(f"Link DB    : {LINK_DB}")
    print(f"Filter source_ref: {source_ref or '(none)'}")
    print(f"Filter id_prefix : {id_prefix or '(none)'}")
    print(f"Questions to delete: {len(remove_questions)}")
    print(f"Links to delete    : {len(remove_links)}")
    if remove_questions:
        print("Sample question ids:")
        for row in remove_questions[:10]:
            print(f" - {row.get('id')}")

    if not args.apply:
        print("Dry-run only. Use --apply to write changes.")
        return

    if QUESTION_DB.exists():
        q_backup = backup_file(QUESTION_DB)
        print(f"Question backup: {q_backup}")
    if LINK_DB.exists():
        l_backup = backup_file(LINK_DB)
        print(f"Link backup    : {l_backup}")

    q_payload["questions"] = keep_questions
    q_payload.setdefault("meta", {})
    q_payload["meta"]["count"] = len(keep_questions)
    q_payload["meta"]["updatedAt"] = datetime.now().isoformat(timespec="seconds")
    q_payload["meta"]["lastReverseDelete"] = {
        "source_ref": source_ref,
        "id_prefix": id_prefix,
        "deleted_questions": len(remove_questions),
    }

    l_payload["links"] = keep_links
    l_payload.setdefault("meta", {})
    l_payload["meta"]["count"] = len(keep_links)
    l_payload["meta"]["updatedAt"] = datetime.now().isoformat(timespec="seconds")
    l_payload["meta"]["lastReverseDelete"] = {
        "source_ref": source_ref,
        "id_prefix": id_prefix,
        "deleted_links": len(remove_links),
    }

    save_json(QUESTION_DB, q_payload)
    save_json(LINK_DB, l_payload)

    print("Done.")
    print(f"Remaining questions: {len(keep_questions)}")
    print(f"Remaining links    : {len(keep_links)}")


if __name__ == "__main__":
    main()

