import json
from pathlib import Path

from sync_legacy_bridge import sync_legacy_js_from_db
from sync_practice_bridge import sync_practice_assignment_js_from_db


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent

DB_PATH = ROOT / "program-db" / "database" / "formula-db.json"
QUESTION_DB_PATH = ROOT / "program-db" / "database" / "question-db.json"

TARGET_FORMULA_CONTENT_JS = ROOT / "data" / "formula-content.js"
TARGET_QUESTION_CONTENT_JS = ROOT / "data" / "question-content.js"


def sync_question_js_from_db(question_db_path: Path = QUESTION_DB_PATH) -> int:
    payload = json.loads(Path(question_db_path).read_text(encoding="utf-8"))
    questions = payload.get("questions", [])
    text = (
        "// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n"
        "// Source: program-db/database/question-db.json\n"
        f"window.questionContentRecords = {json.dumps(questions, ensure_ascii=False, indent=2)};\n"
    )
    TARGET_QUESTION_CONTENT_JS.write_text(text, encoding="utf-8")
    return len(questions)


def main():
    topic_count = sync_legacy_js_from_db(DB_PATH)
    question_count = sync_question_js_from_db()
    practice_count = sync_practice_assignment_js_from_db()
    print(f"topics => {topic_count} => {TARGET_FORMULA_CONTENT_JS}")
    print(f"questions => {question_count} => {TARGET_QUESTION_CONTENT_JS}")
    print(f"practice assignments => {practice_count}")


if __name__ == "__main__":
    main()
