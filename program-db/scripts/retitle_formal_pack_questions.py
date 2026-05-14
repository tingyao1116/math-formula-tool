import json
import re
from collections import Counter
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
PACKS_DIR = ROOT / "program-db" / "imports" / "packs"
FORMULA_DB_PATH = ROOT / "program-db" / "database" / "formula-db.json"

RAW_TITLE_START_RE = re.compile(
    r"^(設|已知|求|若|下列|其中|如圖|在坐標|連線|根據|評估|某|一座|將|把|函數|圖示|空間中|平面上)"
)
MATHY_TITLE_RE = re.compile(r"[=<>≤≥√^_$\\]|[A-Za-z]\s*\(")
SECTION_PREFIX_RE = re.compile(r"^主題\s*\d+\s*[:：]\s*")


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def iter_formal_pack_dirs():
    for pack_dir in sorted(PACKS_DIR.iterdir()):
        if not pack_dir.is_dir() or pack_dir.name.startswith("_inspect-"):
            continue
        if (pack_dir / "questions.json").exists():
            yield pack_dir


def load_formula_titles() -> dict[str, str]:
    payload = read_json(FORMULA_DB_PATH)
    titles: dict[str, str] = {}
    for topic in payload.get("topics", []):
        topic_id = str(topic.get("id", "")).strip()
        title = str(topic.get("title", "")).strip()
        if topic_id and title:
            titles[topic_id] = title
    return titles


def extract_marker(record: dict) -> str:
    for tag in record.get("tags", []) or []:
        text = str(tag)
        if text.startswith("marker:"):
            return text.split(":", 1)[1].strip()
    title = str(record.get("title", "")).strip()
    match = re.match(r"^(範例\s*\d+|範例\d+|隨堂練習)\s*[:：]?", title)
    return match.group(1).replace(" ", "") if match else ""


def normalized_marker(marker: str) -> str:
    text = str(marker or "").strip().replace(" ", "")
    return "隨堂練習" if text.startswith("隨堂練習") else text


def section_label(section: str) -> str:
    text = SECTION_PREFIX_RE.sub("", str(section or "").strip())
    return re.sub(r"\s+", "", text)


def looks_like_raw_title(title: str) -> bool:
    text = str(title or "").strip()
    if not text:
        return True
    if "Traceback" in text or "\n" in text:
        return True

    candidate = text
    if "：" in text:
        prefix, rest = text.split("：", 1)
        if prefix.strip().startswith(("範例", "隨堂練習")):
            candidate = rest.strip()

    if len(candidate) > 22:
        return True
    if MATHY_TITLE_RE.search(candidate):
        return True
    if RAW_TITLE_START_RE.match(candidate):
        return True
    return False


def build_title(record: dict, formula_titles: dict[str, str]) -> str:
    marker = normalized_marker(extract_marker(record))
    formula_id = str(record.get("formula_id", "")).strip()
    formula_title = formula_titles.get(formula_id, "").strip()
    if not formula_title:
        formula_title = section_label(record.get("source_section", ""))

    if formula_title:
        return f"{marker}：{formula_title}" if marker else formula_title
    return record.get("title", "")


def update_pack(pack_dir: Path, formula_titles: dict[str, str]) -> tuple[int, bool]:
    questions_path = pack_dir / "questions.json"
    payload = read_json(questions_path)
    questions = payload.get("questions", [])
    changed = 0

    title_by_id: dict[str, str] = {}
    for question in questions:
        current = str(question.get("title", ""))
        if looks_like_raw_title(current):
            new_title = build_title(question, formula_titles)
            if new_title and new_title != current:
                question["title"] = new_title
                changed += 1
        title_by_id[str(question.get("id", ""))] = str(question.get("title", ""))

    preview_changed = False
    if changed:
        write_json(questions_path, payload)

        preview_path = pack_dir / "preview.json"
        if preview_path.exists():
            preview = read_json(preview_path)
            preview_updates = 0
            for rows in preview.get("by_section", {}).values():
                for row in rows:
                    qid = str(row.get("id", ""))
                    expected = title_by_id.get(qid)
                    if expected and row.get("title") != expected:
                        row["title"] = expected
                        preview_updates += 1
            if preview.get("by_section"):
                preview["by_category"] = dict(
                    Counter(
                        row.get("question_category", "")
                        for rows in preview["by_section"].values()
                        for row in rows
                    )
                )
            if preview_updates:
                write_json(preview_path, preview)
                preview_changed = True

    return changed, preview_changed


def main():
    formula_titles = load_formula_titles()
    pack_changes = 0
    preview_files_changed = 0
    packs_changed = 0

    for pack_dir in iter_formal_pack_dirs():
        question_changes, preview_changed = update_pack(pack_dir, formula_titles)
        if question_changes:
            packs_changed += 1
            pack_changes += question_changes
            print(f"{pack_dir.relative_to(ROOT)} => {question_changes}")
        if preview_changed:
            preview_files_changed += 1

    print(f"packs_changed={packs_changed}")
    print(f"question_title_updates={pack_changes}")
    print(f"preview_files_changed={preview_files_changed}")


if __name__ == "__main__":
    main()
