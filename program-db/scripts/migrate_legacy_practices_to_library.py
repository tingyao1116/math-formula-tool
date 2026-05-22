import json
from pathlib import Path

from practice_db_utils import (
    DB_PATH,
    ROOT,
    extract_legacy_practice_catalog,
    load_practice_payload,
    normalize_practice_binding,
    normalize_practice_payload,
    normalize_practice_record,
    now_iso,
    save_json,
)
from sync_practice_bridge import sync_practice_assignment_js_from_db


FORMULA_DB_PATH = ROOT / "program-db" / "database" / "formula-db.json"


def build_practice_id(topic_id: str) -> str:
    return f"practice-{topic_id}"


def load_topics() -> dict[str, dict]:
    payload = json.loads(FORMULA_DB_PATH.read_text(encoding="utf-8-sig"))
    rows = payload.get("topics", []) if isinstance(payload, dict) else []
    return {
        str(row.get("id", "")).strip(): row
        for row in rows
        if isinstance(row, dict) and str(row.get("id", "")).strip()
    }


def migrate_legacy_practices_to_library(db_path: Path = DB_PATH) -> dict:
    payload = load_practice_payload(db_path)
    topics = load_topics()
    legacy_catalog = extract_legacy_practice_catalog()

    practices = payload.setdefault("practices", [])
    bindings = payload.setdefault("bindings", [])

    existing_practice_ids = {
        str(row.get("id", "")).strip()
        for row in practices
        if isinstance(row, dict)
    }
    existing_binding_keys = {
        (
            str(row.get("practiceId", "")).strip(),
            str(row.get("targetType", "")).strip().lower(),
            str(row.get("targetId", "")).strip(),
        )
        for row in bindings
        if isinstance(row, dict)
    }

    created_practices = 0
    created_bindings = 0
    migrated_topic_ids = []

    for topic_id, legacy in sorted(legacy_catalog.items()):
        topic = topics.get(topic_id)
        if not topic:
            continue

        practice_id = build_practice_id(topic_id)
        chapter_code = str(topic.get("chapterCode", "") or topic.get("chapter_code", "")).strip()
        practice_record = normalize_practice_record({
            "id": practice_id,
            "enabled": True,
            "mode": "generator",
            "title": legacy.get("title", "") or topic.get("title", "") or topic_id,
            "generatorKey": topic_id,
            "difficulty": legacy.get("difficulty", "") or topic.get("difficulty", ""),
            "questionCount": legacy.get("questionCount", 0) or 0,
            "chapterCode": chapter_code,
            "stage": topic.get("stage", ""),
            "grade": topic.get("grade", ""),
            "term": topic.get("term", ""),
            "chapter": topic.get("chapter", ""),
            "domain": topic.get("domain", ""),
            "tags": topic.get("tags", []),
            "usage": topic.get("usage", []),
            "examples": topic.get("examples", []),
            "tips": topic.get("tips", []),
            "notes": topic.get("notes", []),
            "mistakes": topic.get("mistakes", []),
        })
        if practice_id not in existing_practice_ids:
            practices.append(practice_record)
            existing_practice_ids.add(practice_id)
            created_practices += 1

        topic_binding = normalize_practice_binding({
            "practiceId": practice_id,
            "targetType": "topic",
            "targetId": topic_id,
            "enabled": True,
            "order": int(topic.get("manualOrder", 0) or topic.get("originalIndex", 0) or 0),
        })
        topic_binding_key = (
            topic_binding["practiceId"],
            topic_binding["targetType"],
            topic_binding["targetId"],
        )
        if topic_binding_key not in existing_binding_keys:
            bindings.append(topic_binding)
            existing_binding_keys.add(topic_binding_key)
            created_bindings += 1

        if chapter_code:
            chapter_binding = normalize_practice_binding({
                "practiceId": practice_id,
                "targetType": "chapter",
                "targetId": chapter_code,
                "enabled": True,
                "order": int(topic.get("manualOrder", 0) or topic.get("originalIndex", 0) or 0),
            })
            chapter_binding_key = (
                chapter_binding["practiceId"],
                chapter_binding["targetType"],
                chapter_binding["targetId"],
            )
            if chapter_binding_key not in existing_binding_keys:
                bindings.append(chapter_binding)
                existing_binding_keys.add(chapter_binding_key)
                created_bindings += 1

        migrated_topic_ids.append(topic_id)

    payload["meta"]["updatedAt"] = now_iso()
    normalized = normalize_practice_payload(payload)
    save_json(db_path, normalized)
    sync_practice_assignment_js_from_db(db_path)

    return {
        "legacy_direct_count": len(migrated_topic_ids),
        "created_practices": created_practices,
        "created_bindings": created_bindings,
        "practice_count": len(normalized.get("practices", [])),
        "binding_count": len(normalized.get("bindings", [])),
        "assignment_count": len(normalized.get("assignments", [])),
    }


def main():
    result = migrate_legacy_practices_to_library()
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
