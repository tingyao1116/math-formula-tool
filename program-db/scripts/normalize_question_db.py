import argparse
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from question_data_utils import normalize_question_records, save_json
from sync_web_data import sync_question_js_from_db


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
DEFAULT_DB_PATH = ROOT / "program-db" / "database" / "question-db.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def main():
    parser = argparse.ArgumentParser(description="Normalize question titles, text, and embedded image paths.")
    parser.add_argument("--db-path", default=str(DEFAULT_DB_PATH), help="Path to question-db.json")
    parser.add_argument("--dry-run", action="store_true", help="Only report how many questions would change.")
    parser.add_argument("--skip-backup", action="store_true", help="Skip writing a timestamped backup copy before save.")
    args = parser.parse_args()

    db_path = Path(args.db_path).resolve()
    payload = json.loads(db_path.read_text(encoding="utf-8-sig"))
    questions = payload.get("questions", [])
    normalized, changed = normalize_question_records(questions)

    print(f"normalized_questions={changed}")
    print(f"question_db={db_path}")
    if args.dry_run:
        return

    backup_path = None
    if not args.skip_backup:
        backup_path = db_path.with_name(f"{db_path.stem}.backup-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}{db_path.suffix}")
        shutil.copy2(db_path, backup_path)

    payload["questions"] = normalized
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(normalized)
    payload["meta"]["updatedAt"] = now_iso()
    payload["meta"]["lastNormalizeQuestionText"] = {
        "updated_questions": changed,
        "updatedAt": now_iso(),
    }

    save_json(db_path, payload)
    sync_error = None
    try:
        sync_question_js_from_db(db_path)
    except PermissionError as exc:
        sync_error = str(exc)
    if backup_path:
        print(f"backup_path={backup_path}")
    if sync_error:
        print(f"question_js_sync_warning={sync_error}")


if __name__ == "__main__":
    main()
