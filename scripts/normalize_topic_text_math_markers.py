from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"

BAD_TEXT_REPLACEMENTS = {
    "同���": "同號",
    "\x0crac": "\\frac",
    "\x07ngle": "\\angle",
    "|x-a|ge r": "|x-a|\\ge r",
}

PROTECTED_SEGMENT_RE = re.compile(
    r"(\[圖\s*[：:][^\]]+\]|\$\$[\s\S]+?\$\$|\$[^$\n]+\$)"
)

INLINE_PAREN_RE = re.compile(r"\\\(([\s\S]+?)\\\)")
DISPLAY_BRACKET_RE = re.compile(r"\\\[([\s\S]+?)\\\]")

TOKEN_RE = re.compile(
    r"[A-Za-z0-9\\()[\]{}^_+\-*/=<>≤≥≠|.,:]+(?:\s+[A-Za-z0-9\\()[\]{}^_+\-*/=<>≤≥≠|.,:]+)*"
)

MATH_COMMAND_RE = re.compile(
    r"\\(?:frac|sqrt|times|div|cdot|pi|theta|sin|cos|tan|cot|sec|csc|log|ln|le|ge|ne|"
    r"Rightarrow|Leftrightarrow|rightarrow|leftarrow|overline|vec|angle|triangle|parallel|perp)"
)

HAS_OPERATOR_RE = re.compile(r"[=<>≤≥≠^_+\-*/]|\\(?:frac|sqrt|times|div|cdot|log|ln|le|ge|ne)")
HAS_MATH_ATOM_RE = re.compile(r"[A-Za-z0-9]|\\[A-Za-z]+")
SKIP_TOKEN_RE = re.compile(r"(?:program-db|assets/media|https?://|\.png\b|\.jpg\b|\.jpeg\b|\.gif\b)")


def convert_explicit_delimiters(text: str) -> str:
    text = DISPLAY_BRACKET_RE.sub(lambda m: f"$${m.group(1).strip()}$$", text)
    text = INLINE_PAREN_RE.sub(lambda m: f"${m.group(1).strip()}$", text)
    text = re.sub(r"\\frac([A-Za-z0-9])\{([^{}]+)\}", r"\\frac{\1}{\2}", text)
    text = re.sub(r"\\frac([A-Za-z0-9])([A-Za-z0-9])", r"\\frac{\1}{\2}", text)
    return text


def should_wrap_token(token: str) -> bool:
    stripped = token.strip()
    if not stripped or SKIP_TOKEN_RE.search(stripped):
        return False
    if stripped[-1] in "^_+-*/=<>|.,:\\":
        return False
    if not HAS_MATH_ATOM_RE.search(stripped):
        return False
    if not HAS_OPERATOR_RE.search(stripped) and not MATH_COMMAND_RE.search(stripped):
        return False
    if re.fullmatch(r"[+\-]?\d+(?:\.\d+)?", stripped):
        return False
    return True


def wrap_math_tokens_in_plain(text: str) -> str:
    parts = PROTECTED_SEGMENT_RE.split(text)
    if len(parts) == 1:
        return wrap_math_tokens_in_segment(text)

    rebuilt: list[str] = []
    for index, part in enumerate(parts):
        if index % 2 == 1:
            rebuilt.append(part)
        else:
            rebuilt.append(wrap_math_tokens_in_segment(part))
    return "".join(rebuilt)


def wrap_math_tokens_in_segment(text: str) -> str:
    last_index = 0
    output: list[str] = []

    for match in TOKEN_RE.finditer(text):
        start, end = match.span()
        token = match.group(0)
        output.append(text[last_index:start])
        if should_wrap_token(token):
            output.append(f"${token.strip()}$")
        else:
            output.append(token)
        last_index = end

    output.append(text[last_index:])
    return "".join(output)


def normalize_text(text: str) -> str:
    updated = text
    for source, target in BAD_TEXT_REPLACEMENTS.items():
        updated = updated.replace(source, target)
    updated = convert_explicit_delimiters(updated)
    updated = wrap_math_tokens_in_plain(updated)
    return updated


def normalize_topic(topic: dict[str, Any]) -> tuple[bool, list[str]]:
    changed = False
    changed_fields: list[str] = []

    for field in ["formula", "usage", "examples", "tips", "notes", "mistakes"]:
        value = topic.get(field)

        if isinstance(value, str):
            normalized = normalize_text(value)
            if normalized != value:
                topic[field] = normalized
                changed = True
                changed_fields.append(field)
            continue

        if isinstance(value, list):
            updated_list: list[Any] = []
            field_changed = False
            for entry in value:
                if isinstance(entry, str):
                    normalized = normalize_text(entry)
                    updated_list.append(normalized)
                    if normalized != entry:
                        field_changed = True
                else:
                    updated_list.append(entry)
            if field_changed:
                topic[field] = updated_list
                changed = True
                changed_fields.append(field)

    return changed, changed_fields


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload = json.loads(FORMULA_DB.read_text(encoding="utf-8"))
    topics = payload["topics"]

    changed_topics: list[tuple[str, list[str]]] = []
    for topic in topics:
        changed, fields = normalize_topic(topic)
        if changed:
            changed_topics.append((str(topic.get("id", "")), fields))

    print(f"changed_topics={len(changed_topics)}")
    for topic_id, fields in changed_topics[:40]:
        print(f"{topic_id}\t{','.join(fields)}")

    if args.apply and changed_topics:
        FORMULA_DB.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
