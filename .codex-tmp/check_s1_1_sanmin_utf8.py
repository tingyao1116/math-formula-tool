from pathlib import Path
import json


NEW_IDS = {
    "practice-s1-1-1-power-remainder-cycle",
    "practice-s1-1-1-divisibility-missing-digit",
    "practice-s1-1-2-quotient-interval-range",
    "practice-s1-1-4-exponential-parameter-relation",
}

KEYS = [
    "power-remainder-cycle",
    "divisibility-missing-digit",
    "quotient-interval-range",
    "exponential-parameter-relation",
    "乘方餘數循環",
    "缺位數整除判斷",
    "區間商的範圍",
    "指數參數關係式",
]

PATHS = [
    "data/practice-generators/s1.js",
    "data/formula-practice-assignments.js",
    "program-db/database/practice-db.json",
    ".codex-tmp/update_s1_1_sanmin_practice_db.py",
    ".codex-tmp/verify_s1_1_sanmin_generators.js",
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
