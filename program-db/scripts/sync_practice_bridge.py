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
    practices = payload.get("practices", [])
    bindings = sorted(
        payload.get("bindings", []),
        key=lambda row: (
            int(row.get("order", 0) or 0) if isinstance(row, dict) else 0,
            str(row.get("practiceId", "") if isinstance(row, dict) else ""),
            str(row.get("targetId", "") if isinstance(row, dict) else ""),
        ),
    )
    by_id = {
        row["id"]: row
        for row in assignments
        if isinstance(row, dict) and str(row.get("id", "")).strip()
    }
    practice_by_id = {
        row["id"]: row
        for row in practices
        if isinstance(row, dict) and str(row.get("id", "")).strip()
    }
    by_chapter = {}
    by_topic = {}
    for binding in bindings:
        if not isinstance(binding, dict) or binding.get("enabled") is False:
            continue
        practice_id = str(binding.get("practiceId", "")).strip()
        target_type = str(binding.get("targetType", "")).strip().lower()
        target_id = str(binding.get("targetId", "")).strip()
        if not practice_id or not target_id:
            continue
        if target_type == "chapter":
            by_chapter.setdefault(target_id, []).append(practice_id)
        elif target_type == "topic":
            by_topic.setdefault(target_id, []).append(practice_id)
    catalog = extract_legacy_practice_catalog()
    store = {
        "meta": payload.get("meta", {}),
        "byId": by_id,
        "catalog": catalog,
    }
    library_store = {
        "meta": payload.get("meta", {}),
        "byId": practice_by_id,
        "bindings": bindings,
        "byChapter": by_chapter,
        "byTopic": by_topic,
    }
    text = (
        "// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n"
        "// Source: program-db/database/practice-db.json\n"
        f"window.formulaPracticeAssignmentStore = {json.dumps(store, ensure_ascii=False, indent=2)};\n"
        f"window.practiceLibraryStore = {json.dumps(library_store, ensure_ascii=False, indent=2)};\n"
    )
    target_js_path.write_text(text, encoding="utf-8")
    return len(by_id) + len(practice_by_id)


def main():
    count = sync_practice_assignment_js_from_db()
    print(f"practice_assignments => {count} => {TARGET_ASSIGNMENT_JS_PATH}")


if __name__ == "__main__":
    main()
