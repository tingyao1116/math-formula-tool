import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

from sync_legacy_bridge import sync_legacy_js_from_db
from sync_web_data import sync_question_js_from_db


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
FORMULA_DB_PATH = ROOT / "program-db" / "database" / "formula-db.json"
QUESTION_DB_PATH = ROOT / "program-db" / "database" / "question-db.json"
PACKS_DIR = ROOT / "program-db" / "imports" / "packs"


PATTERNS = [
    ("replacement_char", re.compile("\ufffd")),
    ("triple_question", re.compile(r"\?{3,}")),
    ("cp950_mojibake", re.compile(r"嚙")),
    ("unicode_unknown_run", re.compile(r"���+")),
]


@dataclass
class Finding:
    source: str
    locator: str
    pattern: str
    value: str


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def formal_json_files() -> list[Path]:
    files: list[Path] = []
    for pack_dir in sorted(PACKS_DIR.iterdir()):
        if not pack_dir.is_dir() or pack_dir.name.startswith("_inspect-"):
            continue
        for name in ("questions.json", "preview.json", "manifest.json"):
            path = pack_dir / name
            if path.exists():
                files.append(path)
    return files


def sample_text(value: str, limit: int = 140) -> str:
    text = str(value or "").replace("\n", " ").strip()
    return text[:limit] + ("..." if len(text) > limit else "")


def console_safe(text: str) -> str:
    encoding = sys.stdout.encoding or "utf-8"
    return str(text).encode(encoding, errors="backslashreplace").decode(encoding)


def detect_patterns(value: str) -> list[str]:
    hits: list[str] = []
    for name, pattern in PATTERNS:
        if pattern.search(value):
            hits.append(name)
    return hits


def walk_json(value, source: str, trail: str, findings: list[Finding]) -> None:
    if isinstance(value, str):
        for pattern_name in detect_patterns(value):
            findings.append(Finding(source=source, locator=trail, pattern=pattern_name, value=sample_text(value)))
        return

    if isinstance(value, list):
        for index, item in enumerate(value):
            walk_json(item, source, f"{trail}[{index}]", findings)
        return

    if isinstance(value, dict):
        for key, child in value.items():
            child_trail = f"{trail}.{key}" if trail else key
            walk_json(child, source, child_trail, findings)


def scan_json_file(path: Path) -> list[Finding]:
    payload = read_json(path)
    findings: list[Finding] = []
    walk_json(payload, str(path.relative_to(ROOT)), "", findings)
    return findings


def print_report(findings: list[Finding], limit: int) -> None:
    if not findings:
        print("No suspicious text patterns found.")
        return

    print(f"findings={len(findings)}")
    for finding in findings[:limit]:
        print(console_safe(f"[{finding.pattern}] {finding.source} :: {finding.locator}"))
        print(console_safe(f"  {finding.value}"))
    if len(findings) > limit:
        print(f"... truncated {len(findings) - limit} more findings")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Scan formula/question DB and formal pack JSON files for likely mojibake or corrupted text."
    )
    parser.add_argument(
        "--sync-bridges",
        action="store_true",
        help="Regenerate data/formula-content.js and data/question-content.js after scanning.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=120,
        help="Maximum number of findings to print.",
    )
    args = parser.parse_args()

    all_findings: list[Finding] = []

    for path in [FORMULA_DB_PATH, QUESTION_DB_PATH, *formal_json_files()]:
        all_findings.extend(scan_json_file(path))

    print_report(all_findings, args.limit)

    if args.sync_bridges:
        formula_count = sync_legacy_js_from_db(FORMULA_DB_PATH)
        question_count = sync_question_js_from_db(QUESTION_DB_PATH)
        print(f"sync_formula_content={formula_count}")
        print(f"sync_question_content={question_count}")

    return 1 if all_findings else 0


if __name__ == "__main__":
    raise SystemExit(main())
