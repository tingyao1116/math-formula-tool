#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import shutil
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_DIR = ROOT / "program-db" / "database"
QUESTION_DB = DB_DIR / "question-db.json"
LINK_DB = DB_DIR / "topic-question-link-db.json"


def load_json(path: Path, fallback_key: str) -> dict:
    if not path.exists():
        return {"meta": {"count": 0}, fallback_key: []}
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def is_link_like_question(row: dict) -> bool:
    rid = str(row.get("id", "")).strip()
    return (
        rid.startswith("link-")
        or (
            bool(row.get("question_id"))
            and bool(row.get("link_level"))
            and not str(row.get("question_text", "")).strip()
        )
    )


def normalize_link(row: dict) -> dict:
    now = datetime.now().astimezone().isoformat(timespec="seconds")
    link = dict(row)
    link.setdefault("topic_id", "")
    link.setdefault("chapter_code", "")
    link.setdefault("link_level", "topic" if link.get("topic_id") else "chapter")
    link.setdefault("source_type", "manual-docx-structured-pack")
    link.setdefault("source_ref", "")
    link.setdefault("confidence", 1.0 if link.get("topic_id") else 0.9)
    link.setdefault("created_at", now)
    link.setdefault("updated_at", now)
    link.pop("question_text", None)
    link.pop("answer_text", None)
    link.pop("explanation_text", None)
    link.pop("question_role", None)
    link.pop("target_level", None)
    link.pop("target_id", None)
    link.pop("target_title", None)
    return link


def backup(path: Path, stamp: str) -> Path:
    out = path.with_suffix(path.suffix + f".backup-repair-link-as-question-{stamp}")
    shutil.copy2(path, out)
    return out


def main() -> None:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    q_payload = load_json(QUESTION_DB, "questions")
    l_payload = load_json(LINK_DB, "links")

    questions = q_payload.get("questions", [])
    links = l_payload.get("links", [])
    if not isinstance(questions, list) or not isinstance(links, list):
        raise ValueError("DB shape is not supported")

    misplaced = [row for row in questions if is_link_like_question(row)]
    if not misplaced:
        print("No link-like records found in question-db.json.")
        return

    q_backup = backup(QUESTION_DB, stamp)
    l_backup = backup(LINK_DB, stamp)

    existing_link_index = {str(row.get("id", "")): i for i, row in enumerate(links)}
    moved = updated = created = 0
    for row in misplaced:
        link = normalize_link(row)
        lid = str(link.get("id", "")).strip()
        if not lid:
            continue
        if lid in existing_link_index:
            links[existing_link_index[lid]] = link
            updated += 1
        else:
            existing_link_index[lid] = len(links)
            links.append(link)
            created += 1
        moved += 1

    questions = [row for row in questions if not is_link_like_question(row)]

    q_payload["questions"] = questions
    q_payload.setdefault("meta", {})
    q_payload["meta"].update(
        {
            "count": len(questions),
            "updatedAt": datetime.now().isoformat(timespec="seconds"),
            "lastRepair": {
                "name": "repair_links_imported_as_questions",
                "moved_links": moved,
                "backup": str(q_backup),
            },
        }
    )

    l_payload["links"] = links
    l_payload.setdefault("meta", {})
    l_payload["meta"].update(
        {
            "count": len(links),
            "updatedAt": datetime.now().isoformat(timespec="seconds"),
            "lastRepair": {
                "name": "repair_links_imported_as_questions",
                "created_links": created,
                "updated_links": updated,
                "backup": str(l_backup),
            },
        }
    )

    save_json(QUESTION_DB, q_payload)
    save_json(LINK_DB, l_payload)
    print(
        json.dumps(
            {
                "moved_from_question_db": moved,
                "links_created": created,
                "links_updated": updated,
                "question_db_count": len(questions),
                "link_db_count": len(links),
                "question_db_backup": str(q_backup),
                "link_db_backup": str(l_backup),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
