from pathlib import Path
import json


NEW_IDS = {
    "practice-s2-1-1-arithmetic-common-terms",
    "practice-s2-1-1-geometric-product-symmetry",
    "practice-s2-1-1-arithmetic-geometric-bridge",
    "practice-s2-1-1-prefix-product-terms",
    "practice-s2-1-2-arithmetic-end-block-count",
    "practice-s2-1-3-periodic-remainder-sequence",
}

KEYS = [
    "arithmetic-common-terms",
    "geometric-product-symmetry",
    "arithmetic-geometric-bridge",
    "prefix-product-terms",
    "arithmetic-end-block-count",
    "periodic-remainder-sequence",
    "兩等差數列的共同項",
    "等比數列的對稱乘積",
    "等差等比混合條件反推",
    "前綴乘積反求數列項",
    "等差級數前後端項和反推",
    "週期餘數與整除循環",
]

PATHS = [
    "data/practice-generators/s2.js",
    "data/formula-practice-assignments.js",
    "program-db/database/practice-db.json",
    ".codex-tmp/update_s2_1_sanmin_practice_db.py",
    ".codex-tmp/verify_s2_1_sanmin_generators.js",
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
