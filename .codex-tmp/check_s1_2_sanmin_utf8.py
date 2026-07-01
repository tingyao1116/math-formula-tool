from pathlib import Path
import json


NEW_IDS = {
    "practice-s1-2-1-line-form-facts",
    "practice-s1-2-1-linear-fractional-region-extrema",
    "practice-s1-2-2-two-circle-common-tangents",
    "practice-s1-2-3-circle-line-distance-point-count",
}

KEYS = [
    "line-form-facts",
    "linear-fractional-region-extrema",
    "two-circle-common-tangents",
    "circle-line-distance-point-count",
    "直線斜率與截距",
    "線性分式在區域上的極值",
    "兩圓公切線數判斷",
    "圓上到直線定距的點數",
]

PATHS = [
    "data/practice-generators/s1.js",
    "data/formula-practice-assignments.js",
    "program-db/database/practice-db.json",
    ".codex-tmp/update_s1_2_sanmin_practice_db.py",
    ".codex-tmp/verify_s1_2_sanmin_generators.js",
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
