from __future__ import annotations

import importlib.util
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
PACKS_DIR = ROOT / "program-db" / "imports" / "packs"

SUMMARY_SCRIPT_PATHS = [
    ROOT / "scripts" / "import_s1_prefix_from_readable_md.py",
    ROOT / "scripts" / "import_s2_prefix_from_readable_md.py",
    ROOT / "scripts" / "import_s3_prefix_from_readable_md.py",
    ROOT / "scripts" / "import_s4_prefix_from_readable_md.py",
    ROOT / "scripts" / "import_s5_prefix_from_readable_md.py",
]

SENIOR_PACK_RE = re.compile(r"^s(?:[1-5](?:-\d+){1,2}|5-\d+)$")


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def load_module(path: Path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"無法載入模組：{path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def normalize_topic(row: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(row)
    normalized.pop("modifiedAt", None)
    return normalized


@dataclass
class CompareResult:
    total: int = 0
    same: int = 0
    different: int = 0
    missing: int = 0


def compare_records(
    generated_rows: list[dict[str, Any]],
    current_map: dict[str, dict[str, Any]],
    *,
    normalizer=lambda x: x,
) -> tuple[CompareResult, list[str], list[str]]:
    result = CompareResult(total=len(generated_rows))
    different_ids: list[str] = []
    missing_ids: list[str] = []

    for row in generated_rows:
        rid = str(row.get("id", "")).strip()
        current = current_map.get(rid)
        if current is None:
            result.missing += 1
            missing_ids.append(rid)
            continue
        if normalizer(current) == normalizer(row):
            result.same += 1
        else:
            result.different += 1
            different_ids.append(rid)
    return result, different_ids, missing_ids


def build_summary_generated_records() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    all_topics: list[dict[str, Any]] = []
    all_questions: list[dict[str, Any]] = []

    for script_path in SUMMARY_SCRIPT_PATHS:
        module = load_module(script_path)
        if hasattr(module, "build_chapter_names"):
            chapter_names = module.build_chapter_names()
            topics = module.build_topics(chapter_names)
            questions = module.build_questions(chapter_names)
        else:
            topics = module.build_topics()
            questions = module.build_questions()
        all_topics.extend(topics)
        all_questions.extend(questions)

    return all_topics, all_questions


def iter_senior_pack_paths() -> list[Path]:
    paths: list[Path] = []
    for pack_dir in sorted(PACKS_DIR.iterdir()):
        if not pack_dir.is_dir():
            continue
        if not SENIOR_PACK_RE.match(pack_dir.name):
            continue
        questions_path = pack_dir / "questions.json"
        if questions_path.exists():
            paths.append(questions_path)
    return paths


def load_pack_questions() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in iter_senior_pack_paths():
        payload = json.loads(path.read_text(encoding="utf-8-sig"))
        questions = payload.get("questions", [])
        if isinstance(questions, list):
            rows.extend(q for q in questions if isinstance(q, dict))
    return rows


def main() -> None:
    formula_payload = load_json(FORMULA_DB)
    question_payload = load_json(QUESTION_DB)

    current_topics = formula_payload.get("topics", [])
    current_questions = question_payload.get("questions", [])
    topic_map = {
        str(row.get("id", "")).strip(): row
        for row in current_topics
        if isinstance(row, dict) and str(row.get("id", "")).strip()
    }
    question_map = {
        str(row.get("id", "")).strip(): row
        for row in current_questions
        if isinstance(row, dict) and str(row.get("id", "")).strip()
    }

    generated_topics, generated_summary_questions = build_summary_generated_records()
    generated_pack_questions = load_pack_questions()

    topic_result, topic_different, topic_missing = compare_records(
        generated_topics,
        topic_map,
        normalizer=normalize_topic,
    )
    summary_question_result, summary_question_different, summary_question_missing = compare_records(
        generated_summary_questions,
        question_map,
    )
    pack_question_result, pack_question_different, pack_question_missing = compare_records(
        generated_pack_questions,
        question_map,
    )

    report = {
        "summary_topics": {
            "total": topic_result.total,
            "same": topic_result.same,
            "different": topic_result.different,
            "missing": topic_result.missing,
            "different_ids_sample": topic_different[:20],
            "missing_ids_sample": topic_missing[:20],
        },
        "summary_questions": {
            "total": summary_question_result.total,
            "same": summary_question_result.same,
            "different": summary_question_result.different,
            "missing": summary_question_result.missing,
            "different_ids_sample": summary_question_different[:20],
            "missing_ids_sample": summary_question_missing[:20],
        },
        "formal_pack_questions": {
            "total": pack_question_result.total,
            "same": pack_question_result.same,
            "different": pack_question_result.different,
            "missing": pack_question_result.missing,
            "different_ids_sample": pack_question_different[:20],
            "missing_ids_sample": pack_question_missing[:20],
            "packs": [path.parent.name for path in iter_senior_pack_paths()],
        },
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
