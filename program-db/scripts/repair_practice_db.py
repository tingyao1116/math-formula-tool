from __future__ import annotations

import json
import pathlib
import re
import subprocess
from datetime import datetime, timezone


ROOT = pathlib.Path(__file__).resolve().parents[2]
PRACTICE_DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"
FORMULA_PRACTICE_PATH = ROOT / "data" / "formula-practice.js"


EXTRA_PRACTICES = [
    {
        "id": "practice-j2-4-1-inequality-language-drill",
        "title": "基本判定與直覺題",
        "generatorKey": "j2-4-1-inequality-language-drill",
        "difficulty": "easy",
        "questionCount": 8,
        "chapterCode": "j2-4-1",
        "chapter": "一元一次不等式",
        "domain": "代數",
        "order": 1,
    },
    {
        "id": "practice-j2-4-1-inequality-integer-drill",
        "title": "正規解不等式（整數型）",
        "generatorKey": "j2-4-1-inequality-integer-drill",
        "difficulty": "easy",
        "questionCount": 6,
        "chapterCode": "j2-4-1",
        "chapter": "一元一次不等式",
        "domain": "代數",
        "order": 2,
    },
    {
        "id": "practice-j2-4-1-inequality-fraction-drill",
        "title": "進階運算題（分數型）",
        "generatorKey": "j2-4-1-inequality-fraction-drill",
        "difficulty": "medium",
        "questionCount": 5,
        "chapterCode": "j2-4-1",
        "chapter": "一元一次不等式",
        "domain": "代數",
        "order": 3,
    },
    {
        "id": "practice-j2-4-1-inequality-decimal-drill",
        "title": "進階運算題（小數型）",
        "generatorKey": "j2-4-1-inequality-decimal-drill",
        "difficulty": "medium",
        "questionCount": 5,
        "chapterCode": "j2-4-1",
        "chapter": "一元一次不等式",
        "domain": "代數",
        "order": 4,
    },
    {
        "id": "practice-j2-4-1-inequality-range-drill",
        "title": "範圍推導",
        "generatorKey": "j2-4-1-inequality-range-drill",
        "difficulty": "medium",
        "questionCount": 6,
        "chapterCode": "j2-4-1",
        "chapter": "一元一次不等式",
        "domain": "代數",
        "order": 5,
    },
    {
        "id": "practice-j2-4-1-inequality-reverse-coeff-drill",
        "title": "由解逆推原不等式中的未知係數",
        "generatorKey": "j2-4-1-inequality-reverse-coeff-drill",
        "difficulty": "hard",
        "questionCount": 6,
        "chapterCode": "j2-4-1",
        "chapter": "一元一次不等式",
        "domain": "代數",
        "order": 6,
    },
    {
        "id": "practice-j2-4-1-inequality-same-solution-drill",
        "title": "綜合應用題（兩不等式解相同）",
        "generatorKey": "j2-4-1-inequality-same-solution-drill",
        "difficulty": "hard",
        "questionCount": 5,
        "chapterCode": "j2-4-1",
        "chapter": "一元一次不等式",
        "domain": "代數",
        "order": 7,
    },
    {
        "id": "practice-j2-4-2-basic-word-drill",
        "title": "基本題型（單層動作）",
        "generatorKey": "j2-4-2-basic-word-drill",
        "difficulty": "easy",
        "questionCount": 6,
        "chapterCode": "j2-4-2",
        "chapter": "一元一次不等式應用問題",
        "domain": "代數",
        "order": 1,
    },
    {
        "id": "practice-j2-4-2-regular-word-drill",
        "title": "正規題型（二層動作）",
        "generatorKey": "j2-4-2-regular-word-drill",
        "difficulty": "medium",
        "questionCount": 6,
        "chapterCode": "j2-4-2",
        "chapter": "一元一次不等式應用問題",
        "domain": "代數",
        "order": 2,
    },
    {
        "id": "practice-j2-4-2-advanced-word-drill",
        "title": "進階題型（三層動作）",
        "generatorKey": "j2-4-2-advanced-word-drill",
        "difficulty": "hard",
        "questionCount": 7,
        "chapterCode": "j2-4-2",
        "chapter": "一元一次不等式應用問題",
        "domain": "代數",
        "order": 3,
    },
]


MANUAL_SUBTYPE_COUNTS = {
    "buildJ232WordJudgmentSet": 15,
    "buildJ241InequalityLanguageSet": 9,
}


def load_head_practice_db() -> dict:
    text = subprocess.check_output(
        ["git", "show", "HEAD:program-db/database/practice-db.json"],
        cwd=str(ROOT),
        text=True,
        encoding="utf-8",
    )
    return json.loads(text)


def extract_configs_and_builders() -> tuple[dict[str, str], dict[str, str]]:
    text = FORMULA_PRACTICE_PATH.read_text(encoding="utf-8")

    config_to_builder: dict[str, str] = {}
    config_pattern = re.compile(
        r'"([^"]+)"\s*:\s*\{.*?generate\(\)\s*\{\s*return\s+([A-Za-z0-9_]+)\(',
        re.S,
    )
    for config_key, builder_name in config_pattern.findall(text):
        config_to_builder[config_key] = builder_name

    builders: dict[str, str] = {}
    fn_pattern = re.compile(r"function\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{", re.M)
    matches = list(fn_pattern.finditer(text))
    for index, match in enumerate(matches):
        name = match.group(1)
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        builders[name] = text[start:end]

    return config_to_builder, builders


def count_shuffled_variants(body: str) -> int | None:
    match = re.search(r"variants\s*=\s*shuffle\(\[([^\]]+)\]\)", body, re.S)
    if not match:
        return None
    values = [part.strip() for part in match.group(1).split(",") if part.strip()]
    return len(values) or None


def infer_subtype_count(builder_name: str, body: str, question_count: int) -> int:
    if builder_name in MANUAL_SUBTYPE_COUNTS:
        return MANUAL_SUBTYPE_COUNTS[builder_name]

    shuffled_count = count_shuffled_variants(body)
    if shuffled_count:
        return shuffled_count

    mod_matches = [int(value) for value in re.findall(r"i\s*%\s*(\d+)", body)]
    if mod_matches:
        return max(mod_matches)

    return max(1, int(question_count or 1))


def build_extra_practices() -> tuple[list[dict], list[dict]]:
    config_to_builder, builders = extract_configs_and_builders()
    practices = []
    bindings = []

    for entry in EXTRA_PRACTICES:
        builder_name = config_to_builder.get(entry["generatorKey"], "")
        body = builders.get(builder_name, "")
        practices.append(
            {
                "id": entry["id"],
                "enabled": True,
                "mode": "generator",
                "title": entry["title"],
                "generatorKey": entry["generatorKey"],
                "difficulty": entry["difficulty"],
                "questionCount": entry["questionCount"],
                "subtypeCount": infer_subtype_count(builder_name, body, entry["questionCount"]),
                "chapterCode": entry["chapterCode"],
                "stage": "國中",
                "grade": "國二",
                "term": "下學期",
                "chapter": entry["chapter"],
                "domain": entry["domain"],
                "prompt": "",
                "answer": "",
                "tags": [entry["chapterCode"], entry["chapter"], entry["title"], "無限練習"],
                "usage": [],
                "examples": [],
                "tips": [],
                "notes": [],
                "mistakes": [],
            }
        )
        bindings.append(
            {
                "practiceId": entry["id"],
                "targetType": "chapter",
                "targetId": entry["chapterCode"],
                "enabled": True,
                "order": entry["order"],
            }
        )

    return practices, bindings


def apply_subtype_counts(data: dict) -> None:
    config_to_builder, builders = extract_configs_and_builders()
    for row in data.get("practices", []):
        chapter_code = str(row.get("chapterCode") or "")
        if not (chapter_code.startswith("j1-") or chapter_code.startswith("j2-")):
            continue
        builder_name = config_to_builder.get(str(row.get("generatorKey") or ""), "")
        body = builders.get(builder_name, "")
        row["subtypeCount"] = infer_subtype_count(
            builder_name,
            body,
            int(row.get("questionCount") or 1),
        )


def main() -> None:
    data = load_head_practice_db()
    extra_practices, extra_bindings = build_extra_practices()
    extra_ids = {row["id"] for row in extra_practices}

    data["practices"] = [row for row in data.get("practices", []) if row.get("id") not in extra_ids] + extra_practices
    data["bindings"] = [row for row in data.get("bindings", []) if row.get("practiceId") not in extra_ids] + extra_bindings

    apply_subtype_counts(data)

    data["meta"] = {
        "schema": "practice-db-v1",
        "count": 0,
        "assignmentCount": len(data.get("assignments", [])),
        "practiceCount": len(data.get("practices", [])),
        "bindingCount": len(data.get("bindings", [])),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }

    PRACTICE_DB_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Repaired practice-db.json with {len(data['practices'])} practices and {len(data['bindings'])} bindings.")


if __name__ == "__main__":
    main()
