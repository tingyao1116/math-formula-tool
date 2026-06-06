import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"

GEOMETRY_IDS = [
    "practice-j6-2-3-sphere-section-four-subtypes",
    "practice-j6-2-3-cone-surface-four-subtypes",
    "practice-j6-2-3-pyramid-counting-three-subtypes",
]
GEOMETRY_CHILD_IDS = [
    "practice-j6-2-3-sphere-section-radius-distance",
    "practice-j6-2-3-sphere-section-circle-measure",
    "practice-j6-2-3-sphere-section-reverse",
    "practice-j6-2-3-sphere-great-circle",
    "practice-j6-2-3-cone-sector-angle-arc",
    "practice-j6-2-3-cone-pythagorean",
    "practice-j6-2-3-cone-surface-area",
    "practice-j6-2-3-cone-area-ratio",
    "practice-j6-2-3-pyramid-counting",
    "practice-j6-2-3-pyramid-euler",
    "practice-j6-2-3-pyramid-reverse",
]
PROBABILITY_IDS = [
    "practice-j6-3-3-probability-single-mixed",
    "practice-j6-3-3-probability-compound-mixed",
    "practice-j6-3-3-probability-game-mixed",
]
PROBABILITY_CHILD_IDS = [
    "practice-j6-3-3-single-trial-probability",
    "practice-j6-3-3-coin-tree-probability",
    "practice-j6-3-3-dice-sum-product",
    "practice-j6-3-3-number-arrangement-probability",
    "practice-j6-3-3-sampling-with-without-replacement",
    "practice-j6-3-3-two-bag-combination",
    "practice-j6-3-3-algebra-condition-probability",
    "practice-j6-3-3-rock-paper-scissors",
]

data = json.loads(DB_PATH.read_text(encoding="utf-8"))
practices = data.setdefault("practices", [])
bindings = data.setdefault("bindings", [])

geometry_all = set(GEOMETRY_IDS + GEOMETRY_CHILD_IDS)
probability_all = set(PROBABILITY_IDS + PROBABILITY_CHILD_IDS)

for practice in practices:
    practice_id = practice.get("id")
    if practice_id in geometry_all:
        practice["chapterCode"] = "j6-2-3"
        if "tags" in practice:
            practice["tags"] = ["j6-2-3" if tag == "j6-3-3" else tag for tag in practice["tags"]]
    elif practice_id in probability_all:
        practice["chapterCode"] = "j6-3-3"
        practice["chapter"] = "機率的基本計算"
        practice["domain"] = "機率"
        if "tags" in practice:
            practice["tags"] = ["j6-3-3" if tag == "j6-2-3" else tag for tag in practice["tags"]]

bindings[:] = [
    binding
    for binding in bindings
    if not (
        binding.get("practiceId") in set(GEOMETRY_IDS + PROBABILITY_IDS)
        and binding.get("targetType") == "chapter"
        and binding.get("targetId") in {"j6-2-3", "j6-3-3"}
    )
]

for order, practice_id in enumerate(GEOMETRY_IDS, start=1):
    bindings.append(
        {
            "practiceId": practice_id,
            "targetType": "chapter",
            "targetId": "j6-2-3",
            "enabled": True,
            "order": order,
        }
    )

for order, practice_id in enumerate(PROBABILITY_IDS, start=1):
    bindings.append(
        {
            "practiceId": practice_id,
            "targetType": "chapter",
            "targetId": "j6-3-3",
            "enabled": True,
            "order": order,
        }
    )

data["updatedAt"] = datetime.now(timezone.utc).isoformat()
DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

