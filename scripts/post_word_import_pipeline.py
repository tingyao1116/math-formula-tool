#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, List

from text_safety import run_utf8_checked


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"


def run(cmd: List[str]) -> str:
    return run_utf8_checked(cmd, cwd=ROOT)


def load_json(path: Path) -> Dict:
    return json.loads(path.read_text(encoding="utf-8"))


def unique_ok(rows: List[Dict], key: str) -> Dict:
    seen = set()
    dup = []
    empty = 0
    for row in rows:
        rid = str(row.get(key, "")).strip()
        if not rid:
            empty += 1
            continue
        if rid in seen:
            dup.append(rid)
        seen.add(rid)
    return {
        "empty": empty,
        "duplicates": sorted(set(dup)),
        "ok": empty == 0 and not dup,
    }


def main():
    link_build_output = run([sys.executable, str(ROOT / "scripts" / "build_topic_question_links.py")])
    sync_output = run([sys.executable, str(ROOT / "program-db" / "scripts" / "sync_web_data.py")])

    topics_payload = load_json(FORMULA_DB)
    questions_payload = load_json(QUESTION_DB)
    links_payload = load_json(LINK_DB)

    topics = topics_payload.get("topics", []) if isinstance(topics_payload, dict) else []
    questions = questions_payload.get("questions", []) if isinstance(questions_payload, dict) else []
    links = links_payload.get("links", []) if isinstance(links_payload, dict) else []

    topic_id_result = unique_ok(topics, "id")
    question_id_result = unique_ok(questions, "id")
    link_id_result = unique_ok(links, "id")

    summary = {
        "source_hit": "program-db/database/formula-db.json",
        "counts": {
            "topics": len(topics),
            "questions": len(questions),
            "links": len(links),
        },
        "validation": {
            "topic_id_unique": topic_id_result["ok"],
            "question_id_unique": question_id_result["ok"],
            "link_id_unique": link_id_result["ok"],
            "topic_id_duplicate_count": len(topic_id_result["duplicates"]),
            "question_id_duplicate_count": len(question_id_result["duplicates"]),
            "link_id_duplicate_count": len(link_id_result["duplicates"]),
            "topic_id_empty": topic_id_result["empty"],
            "question_id_empty": question_id_result["empty"],
            "link_id_empty": link_id_result["empty"],
        },
        "link_build_output": link_build_output,
        "sync_output": sync_output,
        "sample_links": links[:3],
    }

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
