from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKS_DIR = ROOT / "program-db" / "imports" / "packs"
QUESTION_DB_PATH = ROOT / "program-db" / "database" / "question-db.json"
CHECK_FIELDS = ("title", "question_text", "answer_text", "explanation_text")


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def get_pack_questions(chapter_code: str) -> list[dict]:
    pack_path = PACKS_DIR / chapter_code / "questions.json"
    payload = load_json(pack_path)
    questions = payload.get("questions", [])
    if not isinstance(questions, list):
        raise ValueError(f"{pack_path} 的 questions 不是陣列")
    return [q for q in questions if isinstance(q, dict)]


def get_db_questions(chapter_code: str) -> list[dict]:
    payload = load_json(QUESTION_DB_PATH)
    questions = payload.get("questions", [])
    if not isinstance(questions, list):
        raise ValueError("question-db.json 的 questions 不是陣列")
    return [
        q for q in questions
        if isinstance(q, dict) and str(q.get("chapter_code", "")).strip() == chapter_code
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="Check drift between a chapter pack and question-db.")
    parser.add_argument("--chapter-code", required=True, help="Chapter code, e.g. s2-1-1")
    args = parser.parse_args()

    chapter_code = args.chapter_code.strip()
    pack_questions = get_pack_questions(chapter_code)
    db_questions = get_db_questions(chapter_code)

    pack_by_id = {str(q.get("id", "")).strip(): q for q in pack_questions}
    db_by_id = {str(q.get("id", "")).strip(): q for q in db_questions}

    pack_ids = set(pack_by_id)
    db_ids = set(db_by_id)

    missing_in_db = sorted(pack_ids - db_ids)
    missing_in_pack = sorted(db_ids - pack_ids)

    field_mismatches: list[tuple[str, str]] = []
    for qid in sorted(pack_ids & db_ids):
        pq = pack_by_id[qid]
        dq = db_by_id[qid]
        for field in CHECK_FIELDS:
            if str(pq.get(field, "")) != str(dq.get(field, "")):
                field_mismatches.append((qid, field))

    print(f"chapter_code={chapter_code}")
    print(f"pack_count={len(pack_questions)}")
    print(f"db_count={len(db_questions)}")
    print(f"missing_in_db={len(missing_in_db)}")
    print(f"missing_in_pack={len(missing_in_pack)}")
    print(f"field_mismatches={len(field_mismatches)}")

    if missing_in_db:
        print("missing_in_db_ids=" + ",".join(missing_in_db))
    if missing_in_pack:
        print("missing_in_pack_ids=" + ",".join(missing_in_pack))
    if field_mismatches:
        print("mismatch_details=" + ",".join(f"{qid}:{field}" for qid, field in field_mismatches))


if __name__ == "__main__":
    main()
