import json
from pathlib import Path

from practice_db_utils import (
    DB_PATH,
    TARGET_ASSIGNMENT_JS_PATH,
    extract_legacy_practice_catalog,
    load_practice_payload,
)


def sync_practice_assignment_js_from_db(
    practice_db_path: Path = DB_PATH,
    target_js_path: Path = TARGET_ASSIGNMENT_JS_PATH,
) -> int:
    payload = load_practice_payload(practice_db_path)
    assignments = payload.get("assignments", [])
    by_id = {
        row["id"]: row
        for row in assignments
        if isinstance(row, dict) and str(row.get("id", "")).strip()
    }
    catalog = extract_legacy_practice_catalog()
    store = {
        "meta": payload.get("meta", {}),
        "byId": by_id,
        "catalog": catalog,
    }
    text = (
        "// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n"
        "// Source: program-db/database/practice-db.json\n"
        f"window.formulaPracticeAssignmentStore = {json.dumps(store, ensure_ascii=False, indent=2)};\n"
    )
    target_js_path.write_text(text, encoding="utf-8")
    return len(by_id)


def main():
    count = sync_practice_assignment_js_from_db()
    print(f"practice_assignments => {count} => {TARGET_ASSIGNMENT_JS_PATH}")


if __name__ == "__main__":
    main()
