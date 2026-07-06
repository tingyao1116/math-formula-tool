import json
import sys
from pathlib import Path


sys.path.insert(0, str(Path("program-db/scripts")))
from practice_db_utils import extract_legacy_practice_catalog, load_practice_payload  # noqa: E402


DB_PATH = Path("program-db/database/practice-db.json")
LEGACY_PRACTICE_JS_PATH = Path("data/formula-practice.js")
TARGET_ASSIGNMENT_JS_PATH = Path("data/formula-practice-assignments.js")


def main():
    payload = load_practice_payload(DB_PATH)
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

    catalog = extract_legacy_practice_catalog(LEGACY_PRACTICE_JS_PATH)
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
    TARGET_ASSIGNMENT_JS_PATH.write_text(text, encoding="utf-8")
    print(f"practice_assignments => {len(by_id) + len(practice_by_id)} => {TARGET_ASSIGNMENT_JS_PATH}")


if __name__ == "__main__":
    main()
