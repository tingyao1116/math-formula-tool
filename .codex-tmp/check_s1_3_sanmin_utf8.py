from pathlib import Path
import json


NEW_IDS = {
    "practice-s1-3-1-factor-check-special-polynomial",
    "practice-s1-3-1-nearby-roots-value",
    "practice-s1-3-2-cubic-center-form-evaluation",
    "practice-s1-3-3-same-solution-transform",
}

KEYS = [
    "factor-check-special-polynomial",
    "nearby-roots-value",
    "cubic-center-form-evaluation",
    "same-solution-transform",
    "特殊多項式的因式判定",
    "已知相鄰根的函數值互推",
    "三次函數中心式代值與估算",
    "不等式同解轉換與陷阱判定",
]

PATHS = [
    "data/practice-generators/s1.js",
    "data/formula-practice-assignments.js",
    "program-db/database/practice-db.json",
    ".codex-tmp/update_s1_3_sanmin_practice_db.py",
    ".codex-tmp/verify_s1_3_sanmin_generators.js",
]


def check_text(label, text):
    has_bad = "??" in text or "\ufffd" in text
    print(label, "bad_qq", "??" in text, "replacement", "\ufffd" in text)
    return has_bad


def main():
    bad = False
    db = json.loads(Path("program-db/database/practice-db.json").read_text(encoding="utf-8-sig"))
    items = [item for item in db["practices"] if item["id"] in NEW_IDS]
    bad |= check_text("new_practice_items", json.dumps(items, ensure_ascii=False))
    for item in items:
        print(item["id"], item["title"], item["chapterCode"])

    for path_text in PATHS:
        path = Path(path_text)
        text = path.read_text(encoding="utf-8-sig")
        lines = [line for line in text.splitlines() if any(key in line for key in KEYS)]
        bad |= check_text(f"{path_text} matched_lines={len(lines)}", "\n".join(lines))

    raise SystemExit(1 if bad else 0)


if __name__ == "__main__":
    main()
