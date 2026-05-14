import argparse
import json
import re
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
PACKS_DIR = ROOT / "program-db" / "imports" / "packs"
QUESTION_DB_PATH = ROOT / "program-db" / "database" / "question-db.json"

LABEL_PATTERN = re.compile(r"【[^】]*自命題[^】]*】")


def sanitize_text(text: str) -> tuple[str, int]:
    matches = LABEL_PATTERN.findall(text)
    if not matches:
        return text, 0

    cleaned = LABEL_PATTERN.sub("", text)
    cleaned = re.sub(r"[ \t]+\n", "\n", cleaned)
    cleaned = re.sub(r"\n[ \t]+", "\n", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    cleaned = re.sub(r"(?m)^[ \t]+", "", cleaned)
    cleaned = re.sub(r"(?m)[ \t]+$", "", cleaned)
    cleaned = cleaned.strip()
    return cleaned, len(matches)


def sanitize_node(node):
    if isinstance(node, str):
        return sanitize_text(node)
    if isinstance(node, list):
        total = 0
        changed = False
        new_items = []
        for item in node:
            new_item, item_count = sanitize_node(item)
            new_items.append(new_item)
            total += item_count
            changed = changed or (new_item != item)
        return (new_items if changed else node), total
    if isinstance(node, dict):
        total = 0
        changed = False
        new_dict = {}
        for key, value in node.items():
            new_value, value_count = sanitize_node(value)
            new_dict[key] = new_value
            total += value_count
            changed = changed or (new_value != value)
        return (new_dict if changed else node), total
    return node, 0


def formal_pack_files() -> list[Path]:
    files: list[Path] = []
    for pack_dir in sorted(PACKS_DIR.iterdir()):
        if not pack_dir.is_dir() or pack_dir.name.startswith("_inspect-"):
            continue
        for name in ("questions.json", "preview.json"):
            path = pack_dir / name
            if path.exists():
                files.append(path)
    return files


def rewrite_json_file(path: Path) -> tuple[bool, int]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    sanitized, count = sanitize_node(payload)
    if count == 0:
        return False, 0
    path.write_text(json.dumps(sanitized, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return True, count


def main():
    parser = argparse.ArgumentParser(description="Remove editorial source labels like 【龍騰自命題】 from formal pack data and question DB.")
    parser.add_argument("--skip-packs", action="store_true", help="Do not rewrite formal pack questions/preview files.")
    parser.add_argument("--skip-question-db", action="store_true", help="Do not rewrite question-db.json.")
    args = parser.parse_args()

    files_changed = 0
    labels_removed = 0

    if not args.skip_packs:
        for path in formal_pack_files():
            changed, count = rewrite_json_file(path)
            if changed:
                files_changed += 1
                labels_removed += count
                print(path.relative_to(ROOT))

    if not args.skip_question_db:
        changed, count = rewrite_json_file(QUESTION_DB_PATH)
        if changed:
            files_changed += 1
            labels_removed += count
            print(QUESTION_DB_PATH.relative_to(ROOT))

    print(f"files_changed={files_changed}")
    print(f"labels_removed={labels_removed}")


if __name__ == "__main__":
    main()
