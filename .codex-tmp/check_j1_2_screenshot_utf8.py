import json
from pathlib import Path


FILES = [
    Path("data/practice-generators/j1.js"),
    Path("data/practice-generator-bundles.js"),
    Path("data/formula-practice-assignments.js"),
    Path("data/practice-chapter-playlists.js"),
    Path("program-db/database/practice-db.json"),
    Path("sw.js"),
]

KEYS = [
    "j1-2-1-combined-divisibility-clean",
    "j1-2-1-remainder-crt-range-clean",
    "j1-2-1-divisor-count-inverse-clean",
    "j1-2-2-gcd-lcm-pair-constraints-clean",
    "j1-2-2-ratio-lcm-three-numbers-clean",
    "j1-2-2-periodic-lcm-modeling-clean",
    "j1-2-3-advanced-telescoping-sum-clean",
    "j1-2-3-telescoping-product-clean",
]


for path in FILES:
    text = path.read_text(encoding="utf-8")
    if "\ufffd" in text:
        raise SystemExit(f"replacement character found in {path}")
    if "說明文字補成??" in text:
        raise SystemExit(f"known bad placeholder found in {path}")

db = json.loads(Path("program-db/database/practice-db.json").read_text(encoding="utf-8"))
records = {p["generatorKey"]: p for p in db["practices"] if p.get("generatorKey") in KEYS}
missing = [key for key in KEYS if key not in records]
if missing:
    raise SystemExit(f"missing DB records: {missing}")

for key, record in records.items():
    joined = json.dumps(record, ensure_ascii=False)
    if "??" in joined or "\ufffd" in joined:
        raise SystemExit(f"bad characters in {key}")
    if not any("\u4e00" <= ch <= "\u9fff" for ch in joined):
        raise SystemExit(f"no CJK text in {key}")
    if "無限練習" not in joined:
        raise SystemExit(f"missing infinite-practice tag in {key}")

print(f"utf8/check passed for {len(KEYS)} j1-2 screenshot practices")
