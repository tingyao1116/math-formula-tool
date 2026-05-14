import argparse
import json
from collections import Counter
from pathlib import Path

from sync_web_data import sync_question_js_from_db


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
PACKS_DIR = ROOT / "program-db" / "imports" / "packs"
QUESTION_DB_PATH = ROOT / "program-db" / "database" / "question-db.json"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def iter_formal_pack_dirs():
    for pack_dir in sorted(PACKS_DIR.iterdir()):
        if not pack_dir.is_dir() or pack_dir.name.startswith("_inspect-"):
            continue
        if (pack_dir / "questions.json").exists():
            yield pack_dir


def update_pack(pack_dir: Path, target_ids: set[str], category: str) -> tuple[int, bool]:
    questions_path = pack_dir / "questions.json"
    payload = read_json(questions_path)
    questions = payload.get("questions", [])

    changed = 0
    for question in questions:
        if question.get("id") in target_ids and question.get("question_category") != category:
            question["question_category"] = category
            changed += 1

    preview_changed = False
    if changed:
        write_json(questions_path, payload)

        preview_path = pack_dir / "preview.json"
        if preview_path.exists():
            preview = read_json(preview_path)
            category_by_id = {
                question.get("id"): question.get("question_category", "")
                for question in questions
            }
            preview_count = 0
            for rows in preview.get("by_section", {}).values():
                for row in rows:
                    qid = row.get("id")
                    if qid in category_by_id and row.get("question_category") != category_by_id[qid]:
                        row["question_category"] = category_by_id[qid]
                        preview_count += 1
            if preview.get("by_section"):
                preview["by_category"] = dict(
                    Counter(
                        row.get("question_category", "")
                        for rows in preview["by_section"].values()
                        for row in rows
                    )
                )
            if preview_count:
                write_json(preview_path, preview)
                preview_changed = True

    return changed, preview_changed


def update_question_db(target_ids: set[str], category: str) -> int:
    payload = read_json(QUESTION_DB_PATH)
    changed = 0
    for question in payload.get("questions", []):
        if question.get("id") in target_ids and question.get("question_category") != category:
            question["question_category"] = category
            changed += 1
    if changed:
        write_json(QUESTION_DB_PATH, payload)
    return changed


def main():
    parser = argparse.ArgumentParser(
        description="Batch-update question_category in formal packs and question-db."
    )
    parser.add_argument("--category", required=True, help="Target question_category value.")
    parser.add_argument("--id", dest="ids", action="append", required=True, help="Question id to update. Repeatable.")
    parser.add_argument(
        "--skip-sync-web-data",
        action="store_true",
        help="Do not regenerate data/question-content.js from question-db.json.",
    )
    args = parser.parse_args()

    target_ids = {value.strip() for value in args.ids if value and value.strip()}
    if not target_ids:
        raise SystemExit("No valid question ids provided.")

    total_pack_changes = 0
    preview_files_changed = 0
    matched_ids_in_packs: set[str] = set()

    for pack_dir in iter_formal_pack_dirs():
        questions_path = pack_dir / "questions.json"
        payload = read_json(questions_path)
        ids_in_pack = {question.get("id") for question in payload.get("questions", [])}
        overlap = target_ids & ids_in_pack
        if not overlap:
            continue

        pack_changed, preview_changed = update_pack(pack_dir, target_ids, args.category)
        if pack_changed:
            total_pack_changes += pack_changed
            matched_ids_in_packs.update(overlap)
            print(f"{pack_dir.relative_to(ROOT)} => {pack_changed}")
        if preview_changed:
            preview_files_changed += 1

    question_db_changes = update_question_db(target_ids, args.category)

    missing_in_packs = sorted(target_ids - matched_ids_in_packs)
    if missing_in_packs:
        print("missing_in_packs=" + ",".join(missing_in_packs))

    if question_db_changes and not args.skip_sync_web_data:
        synced_count = sync_question_js_from_db()
        print(f"synced_question_content={synced_count}")

    print(f"target_ids={len(target_ids)}")
    print(f"pack_question_updates={total_pack_changes}")
    print(f"preview_files_changed={preview_files_changed}")
    print(f"question_db_updates={question_db_changes}")


if __name__ == "__main__":
    main()
