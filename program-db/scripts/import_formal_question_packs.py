import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from sync_web_data import sync_question_js_from_db


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
PACKS_DIR = ROOT / "program-db" / "imports" / "packs"
QUESTION_DB_PATH = ROOT / "program-db" / "database" / "question-db.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def iter_formal_pack_paths(selected_codes: set[str] | None = None) -> list[Path]:
    paths: list[Path] = []
    for pack_dir in sorted(PACKS_DIR.iterdir()):
        if not pack_dir.is_dir() or pack_dir.name.startswith("_"):
            continue
        if selected_codes and pack_dir.name not in selected_codes:
            continue
        questions_path = pack_dir / "questions.json"
        if questions_path.exists():
            paths.append(questions_path)
    return paths


def read_pack_questions(path: Path) -> tuple[str, list[dict]]:
    payload = load_json(path)
    questions = payload.get("questions", [])
    if not isinstance(questions, list):
        raise ValueError(f"{path} 的 questions 欄位不是陣列")
    chapter_codes = {
        str(q.get("chapter_code", "")).strip()
        for q in questions
        if isinstance(q, dict) and str(q.get("chapter_code", "")).strip()
    }
    chapter_code = ""
    if len(chapter_codes) == 1:
        chapter_code = next(iter(chapter_codes))
    else:
        chapter_code = str(payload.get("meta", {}).get("chapter_code", "")).strip()
    if not chapter_code:
        raise ValueError(f"{path} 無法判定 chapter_code")
    return chapter_code, [q for q in questions if isinstance(q, dict)]


def import_formal_packs(
    question_db_path: Path = QUESTION_DB_PATH,
    selected_codes: set[str] | None = None,
) -> dict:
    pack_paths = iter_formal_pack_paths(selected_codes)
    if not pack_paths:
        raise ValueError("找不到可匯入的正式 packs")

    db_payload = {"meta": {}, "questions": []}
    if question_db_path.exists():
        db_payload = load_json(question_db_path)

    existing_questions = db_payload.get("questions", [])
    if not isinstance(existing_questions, list):
        raise ValueError("question-db.json 的 questions 欄位不是陣列")

    imported_questions: list[dict] = []
    imported_pack_names: list[str] = []
    imported_chapter_codes: set[str] = set()
    existing_ids: set[str] = {
        str(row.get("id", "")).strip()
        for row in existing_questions
        if isinstance(row, dict) and str(row.get("id", "")).strip()
    }
    seen_new_ids: set[str] = set()
    skipped_existing_ids: list[str] = []
    duplicate_ids_in_packs: list[str] = []
    questions_seen = 0

    for path in pack_paths:
        chapter_code, questions = read_pack_questions(path)
        imported_pack_names.append(path.parent.name)
        imported_chapter_codes.add(chapter_code)
        for row in questions:
            questions_seen += 1
            rid = str(row.get("id", "")).strip()
            if rid and rid in existing_ids:
                skipped_existing_ids.append(rid)
                continue
            if rid and rid in seen_new_ids:
                duplicate_ids_in_packs.append(rid)
                continue
            if rid:
                seen_new_ids.add(rid)
            imported_questions.append(row)

    final_questions = existing_questions + imported_questions
    db_payload["questions"] = final_questions
    db_payload.setdefault("meta", {})
    db_payload["meta"]["count"] = len(final_questions)
    db_payload["meta"]["updatedAt"] = now_iso()
    db_payload["meta"]["lastFormalPackImport"] = {
        "pack_count": len(imported_pack_names),
        "packs": imported_pack_names,
        "chapter_codes": sorted(imported_chapter_codes),
        "questions_seen": questions_seen,
        "questions_added": len(imported_questions),
        "questions_skipped_existing": len(skipped_existing_ids),
        "questions_skipped_duplicate_in_packs": len(duplicate_ids_in_packs),
        "updatedAt": now_iso(),
    }

    save_json(question_db_path, db_payload)
    synced = sync_question_js_from_db(question_db_path)

    return {
        "pack_count": len(imported_pack_names),
        "packs": imported_pack_names,
        "chapter_codes": sorted(imported_chapter_codes),
        "questions_seen": questions_seen,
        "questions_added": len(imported_questions),
        "questions_imported": len(imported_questions),
        "questions_skipped_existing": len(skipped_existing_ids),
        "questions_skipped_duplicate_in_packs": len(duplicate_ids_in_packs),
        "questions_total": len(final_questions),
        "synced_question_content": synced,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Import every formal chapter questions.json pack into question-db.json."
    )
    parser.add_argument(
        "--chapter-code",
        action="append",
        dest="chapter_codes",
        default=[],
        help="Only import the specified formal pack folder name(s). Repeatable.",
    )
    parser.add_argument(
        "--question-db",
        default=str(QUESTION_DB_PATH),
        help="Path to question-db.json",
    )
    args = parser.parse_args()

    result = import_formal_packs(
        question_db_path=Path(args.question_db).resolve(),
        selected_codes={c.strip() for c in args.chapter_codes if c.strip()} or None,
    )
    for key, value in result.items():
        if isinstance(value, list):
            print(f"{key}=" + ",".join(value))
        else:
            print(f"{key}={value}")


if __name__ == "__main__":
    main()
