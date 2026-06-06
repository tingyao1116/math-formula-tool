import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"

OLD_PREFIX = "j6-2-3"
NEW_PREFIX = "j6-3-3"
CHAPTER_TITLE = "機率的基本計算"

KEY_SUFFIXES = [
    "probability-single-mixed",
    "single-trial-probability",
    "coin-tree-probability",
    "dice-sum-product",
    "number-arrangement-probability",
    "probability-compound-mixed",
    "sampling-with-without-replacement",
    "two-bag-combination",
    "algebra-condition-probability",
    "probability-game-mixed",
    "rock-paper-scissors",
]

KEY_MAP = {
    f"{OLD_PREFIX}-{suffix}": f"{NEW_PREFIX}-{suffix}"
    for suffix in KEY_SUFFIXES
}
PRACTICE_ID_MAP = {
    f"practice-{old_key}": f"practice-{new_key}"
    for old_key, new_key in KEY_MAP.items()
}


def replace_known_value(value):
    if isinstance(value, str):
        if value in KEY_MAP:
            return KEY_MAP[value]
        if value in PRACTICE_ID_MAP:
            return PRACTICE_ID_MAP[value]
        if value == OLD_PREFIX:
            return NEW_PREFIX
        return value
    if isinstance(value, list):
        return [replace_known_value(item) for item in value]
    if isinstance(value, dict):
        return {key: replace_known_value(item) for key, item in value.items()}
    return value


data = json.loads(DB_PATH.read_text(encoding="utf-8"))
practices = data.setdefault("practices", [])
bindings = data.setdefault("bindings", [])

for practice in practices:
    if practice.get("id") in PRACTICE_ID_MAP:
        old_id = practice["id"]
        new_id = PRACTICE_ID_MAP[old_id]
        practice["id"] = new_id
        practice["generatorKey"] = KEY_MAP.get(practice.get("generatorKey"), practice.get("generatorKey"))
        practice["chapterCode"] = NEW_PREFIX
        practice["chapter"] = CHAPTER_TITLE
        practice["domain"] = "機率"
        practice["relatedPracticeIds"] = [
            PRACTICE_ID_MAP.get(related_id, related_id)
            for related_id in practice.get("relatedPracticeIds", [])
        ]
        practice["tags"] = [
            NEW_PREFIX if tag == OLD_PREFIX else tag
            for tag in practice.get("tags", [])
        ]

for binding in bindings:
    if binding.get("practiceId") in PRACTICE_ID_MAP:
        binding["practiceId"] = PRACTICE_ID_MAP[binding["practiceId"]]
        binding["targetId"] = NEW_PREFIX
        binding["order"] = {
            f"practice-{NEW_PREFIX}-probability-single-mixed": 1,
            f"practice-{NEW_PREFIX}-probability-compound-mixed": 2,
            f"practice-{NEW_PREFIX}-probability-game-mixed": 3,
        }.get(binding["practiceId"], binding.get("order", 999))

data = replace_known_value(data)
data["updatedAt"] = datetime.now(timezone.utc).isoformat()
DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

