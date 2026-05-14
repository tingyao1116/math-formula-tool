from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]

IDS = [
    "q-s1-1-1-0001",
    "q-s1-1-1-0002",
    "q-s1-1-1-0003",
    "q-s1-1-1-0004",
    "q-s1-1-1-0012",
    "q-s1-1-1-0015",
    "q-s1-1-1-0016",
    "q-s1-1-1-0024",
    "q-s1-1-1-0025",
    "q-s1-1-1-0038",
    "q-s1-1-1-0041",
    "q-s1-1-1-0045",
    "q-s1-1-2-0040",
    "q-s1-1-3-0005",
    "q-s1-1-3-0017",
    "q-s1-1-3-0036",
    "q-s1-1-3-0038",
    "q-s1-1-3-0039",
    "q-s1-1-4-0007",
    "q-s1-1-4-0013",
]

PACK_PATHS = {
    "s1-1-1": ROOT / "program-db" / "imports" / "packs" / "s1-1-1" / "questions.json",
    "s1-1-2": ROOT / "program-db" / "imports" / "packs" / "s1-1-2" / "questions.json",
    "s1-1-3": ROOT / "program-db" / "imports" / "packs" / "s1-1-3" / "questions.json",
    "s1-1-4": ROOT / "program-db" / "imports" / "packs" / "s1-1-4" / "questions.json",
}


def load_map(path: Path) -> dict[str, dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    return {row["id"]: row for row in payload["questions"]}


def main() -> None:
    db_map = load_map(ROOT / "program-db" / "database" / "question-db.json")
    for chapter_code, path in PACK_PATHS.items():
        pack_map = load_map(path)
        for qid in [value for value in IDS if value.startswith(f"q-{chapter_code}")]:
            pack_row = pack_map[qid]
            db_row = db_map[qid]
            record = {
                "id": qid,
                "pack_question_text": pack_row.get("question_text", ""),
                "pack_explanation_text": pack_row.get("explanation_text", ""),
                "db_question_text": db_row.get("question_text", ""),
                "db_explanation_text": db_row.get("explanation_text", ""),
            }
            print(json.dumps(record, ensure_ascii=True))


if __name__ == "__main__":
    main()
