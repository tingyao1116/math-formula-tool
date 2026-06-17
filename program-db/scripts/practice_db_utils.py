import json
import re
from datetime import datetime, timezone
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"
LEGACY_PRACTICE_JS_PATH = ROOT / "data" / "formula-practice.js"
TARGET_ASSIGNMENT_JS_PATH = ROOT / "data" / "formula-practice-assignments.js"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_json(path: Path, fallback):
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def normalize_practice_title(value: str) -> str:
    text = str(value or "").strip()
    if not text:
        return ""
    return re.sub(r"\s*[\uFF08(]\s*\d+\s*\u984c\s*[\uFF09)]\s*$", "", text).strip()


def normalize_practice_assignment(record: dict) -> dict:
    row = dict(record or {})
    return {
        "id": str(row.get("id", "")).strip(),
        "enabled": bool(row.get("enabled", True)),
        "mode": str(row.get("mode", "")).strip() or "generator",
        "practiceKey": str(row.get("practiceKey", "")).strip(),
        "title": normalize_practice_title(row.get("title", "")),
        "difficulty": str(row.get("difficulty", "")).strip(),
        "questionCount": int(row.get("questionCount", 0) or 0),
        "prompt": str(row.get("prompt", "")).strip(),
        "answer": str(row.get("answer", "")).strip(),
        "notes": str(row.get("notes", "")).strip(),
    }


def normalize_text_list(values) -> list[str]:
    if not isinstance(values, list):
        return []
    normalized = []
    for value in values:
        text = str(value or "").strip()
        if text:
            normalized.append(text)
    return normalized


def normalize_id_list(values) -> list[str]:
    if not isinstance(values, list):
        return []
    normalized = []
    seen = set()
    for value in values:
        text = str(value or "").strip()
        if not text or text in seen:
            continue
        seen.add(text)
        normalized.append(text)
    return normalized


def normalize_practice_record(record: dict) -> dict:
    row = dict(record or {})
    generator_key = str(row.get("generatorKey", "")).strip() or str(row.get("practiceKey", "")).strip()
    generator_bundle = str(row.get("generatorBundle", "") or row.get("bundleKey", "")).strip()
    mode = str(row.get("mode", "")).strip() or ("fixed-example" if not generator_key else "generator")
    normalized = {
        "id": str(row.get("id", "")).strip(),
        "enabled": bool(row.get("enabled", True)),
        "mode": mode,
        "title": normalize_practice_title(row.get("title", "")),
        "generatorKey": generator_key,
        "difficulty": str(row.get("difficulty", "")).strip(),
        "questionCount": int(row.get("questionCount", 0) or 0),
        "subtypeCount": int(row.get("subtypeCount", 0) or 0),
        "relatedPracticeIds": normalize_id_list(row.get("relatedPracticeIds", [])),
        "chapterCode": str(row.get("chapterCode", "") or row.get("chapter_code", "")).strip(),
        "stage": str(row.get("stage", "")).strip(),
        "grade": str(row.get("grade", "")).strip(),
        "term": str(row.get("term", "")).strip(),
        "chapter": str(row.get("chapter", "")).strip(),
        "domain": str(row.get("domain", "")).strip(),
        "prompt": str(row.get("prompt", "")).strip(),
        "answer": str(row.get("answer", "")).strip(),
        "tags": normalize_text_list(row.get("tags", [])),
        "usage": normalize_text_list(row.get("usage", [])),
        "examples": normalize_text_list(row.get("examples", [])),
        "tips": normalize_text_list(row.get("tips", [])),
        "notes": normalize_text_list(row.get("notes", [])),
        "mistakes": normalize_text_list(row.get("mistakes", [])),
    }
    if generator_bundle:
        normalized["generatorBundle"] = generator_bundle
    return normalized


def normalize_practice_binding(record: dict) -> dict:
    row = dict(record or {})
    return {
        "practiceId": str(row.get("practiceId", "")).strip(),
        "targetType": str(row.get("targetType", "")).strip().lower(),
        "targetId": str(row.get("targetId", "")).strip(),
        "enabled": bool(row.get("enabled", True)),
        "order": int(row.get("order", 0) or 0),
    }


def normalize_practice_payload(payload: dict | None) -> dict:
    source = payload if isinstance(payload, dict) else {}
    rows = source.get("assignments", [])
    assignments = []
    seen = set()
    for row in rows if isinstance(rows, list) else []:
        if not isinstance(row, dict):
            continue
        normalized = normalize_practice_assignment(row)
        rid = normalized["id"]
        if not rid or rid in seen:
            continue
        seen.add(rid)
        assignments.append(normalized)
    practices = []
    seen_practices = set()
    for row in source.get("practices", []) if isinstance(source.get("practices", []), list) else []:
        if not isinstance(row, dict):
            continue
        normalized = normalize_practice_record(row)
        rid = normalized["id"]
        if not rid or rid in seen_practices:
            continue
        seen_practices.add(rid)
        practices.append(normalized)
    bindings = []
    seen_bindings = set()
    for row in source.get("bindings", []) if isinstance(source.get("bindings", []), list) else []:
        if not isinstance(row, dict):
            continue
        normalized = normalize_practice_binding(row)
        binding_key = (
            normalized["practiceId"],
            normalized["targetType"],
            normalized["targetId"],
        )
        if (
            not normalized["practiceId"]
            or not normalized["targetType"]
            or not normalized["targetId"]
            or binding_key in seen_bindings
        ):
            continue
        seen_bindings.add(binding_key)
        bindings.append(normalized)
    meta = source.get("meta", {}) if isinstance(source.get("meta", {}), dict) else {}
    meta = {
        **meta,
        "count": len(assignments),
        "assignmentCount": len(assignments),
        "practiceCount": len(practices),
        "bindingCount": len(bindings),
    }
    return {
        "meta": meta,
        "assignments": assignments,
        "practices": practices,
        "bindings": bindings,
    }


def load_practice_payload(path: Path = DB_PATH) -> dict:
    return normalize_practice_payload(
        load_json(path, {"meta": {"count": 0}, "assignments": [], "practices": [], "bindings": []})
    )


def _extract_config_blocks(text: str) -> dict[str, str]:
    blocks = {}
    pattern = re.compile(r'^\s{6}"(?P<key>[^"]+)":\s*\{\s*\n(?P<body>.*?)(?=^\s{6}\},?\s*$)', re.M | re.S)
    for match in pattern.finditer(text):
        blocks[match.group("key")] = match.group("body")
    return blocks


def extract_legacy_practice_catalog(practice_js_path: Path = LEGACY_PRACTICE_JS_PATH) -> dict[str, dict]:
    text = practice_js_path.read_text(encoding="utf-8-sig")
    catalog = {}
    for key, body in _extract_config_blocks(text).items():
        title_match = re.search(r'title:\s*"([^"]*)"', body)
        type_match = re.search(r'type:\s*"([^"]*)"', body)
        difficulty_match = re.search(r'difficulty:\s*"([^"]*)"', body)
        count_match = re.search(r'questionCount:\s*(\d+)', body)
        prompt_match = re.search(r'prompt:\s*"([^"]*)"', body)
        answer_match = re.search(r'answer:\s*"([^"]*)"', body)
        catalog[key] = {
            "id": key,
            "type": type_match.group(1) if type_match else "",
            "title": normalize_practice_title(title_match.group(1) if title_match else ""),
            "difficulty": difficulty_match.group(1) if difficulty_match else "",
            "questionCount": int(count_match.group(1)) if count_match else 0,
            "prompt": prompt_match.group(1) if prompt_match else "",
            "answer": answer_match.group(1) if answer_match else "",
            "source": "legacy-js",
        }
    return catalog
