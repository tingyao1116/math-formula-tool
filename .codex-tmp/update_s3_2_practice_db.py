import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    ("practice-s3-2-1-power-root-comparison-clean", "s3-2-1", "指數根式大小比較", "s3-2-1-power-root-comparison-clean", "指數函數", ["指數", "根式", "大小比較"]),
    ("practice-s3-2-1-exponential-integer-count-clean", "s3-2-1", "指數不等式的整數解個數", "s3-2-1-exponential-integer-count-clean", "指數函數", ["指數不等式", "對數估算", "整數解"]),
    ("practice-s3-2-1-exponential-graph-parameter-clean", "s3-2-1", "由漸近線與兩點求指數函數", "s3-2-1-exponential-graph-parameter-clean", "指數函數", ["指數圖形", "水平漸近線", "參數"]),
    ("practice-s3-2-2-dominant-log-approx-clean", "s3-2-2", "對數估算：和式的主導項", "s3-2-2-dominant-log-approx-clean", "對數", ["對數估算", "數量級", "主導項"]),
    ("practice-s3-2-2-log-domain-integer-count-clean", "s3-2-2", "對數定義域的整數解個數", "s3-2-2-log-domain-integer-count-clean", "對數", ["對數定義域", "底數限制", "整數解"]),
    ("practice-s3-2-2-chain-change-base-clean", "s3-2-2", "連鎖換底與複合底數", "s3-2-2-chain-change-base-clean", "對數", ["換底公式", "複合底數", "連鎖關係"]),
    ("practice-s3-2-3-log-point-transform-clean", "s3-2-3", "對數圖形上的點變換", "s3-2-3-log-point-transform-clean", "對數函數圖形", ["對數圖形", "點變換", "平移"]),
    ("practice-s3-2-3-log-base-order-clean", "s3-2-3", "由對數大小判斷底數範圍", "s3-2-3-log-base-order-clean", "對數函數圖形", ["對數函數", "單調性", "底數範圍"]),
    ("practice-s3-2-4-growth-threshold-clean", "s3-2-4", "指數成長衰退的門檻時間", "s3-2-4-growth-threshold-clean", "指數與對數應用", ["成長衰退", "門檻時間", "對數求解"]),
    ("practice-s3-2-4-log-scale-ratio-clean", "s3-2-4", "對數尺度的倍率判讀", "s3-2-4-log-scale-ratio-clean", "指數與對數應用", ["對數尺度", "pH", "星等", "芮氏規模"]),
    ("practice-s3-2-4-compound-inference-clean", "s3-2-4", "固定倍率成長的倍期推算", "s3-2-4-compound-inference-clean", "指數與對數應用", ["複利", "固定倍率", "倍期推算"]),
]


BINDINGS = [
    ("practice-s3-2-1-power-root-comparison-clean", "s3-2-1", 4),
    ("practice-s3-2-1-exponential-integer-count-clean", "s3-2-1", 5),
    ("practice-s3-2-1-exponential-graph-parameter-clean", "s3-2-1", 6),
    ("practice-s3-2-2-dominant-log-approx-clean", "s3-2-2", 4),
    ("practice-s3-2-2-log-domain-integer-count-clean", "s3-2-2", 5),
    ("practice-s3-2-2-chain-change-base-clean", "s3-2-2", 6),
    ("practice-s3-2-3-log-point-transform-clean", "s3-2-3", 4),
    ("practice-s3-2-3-log-base-order-clean", "s3-2-3", 5),
    ("practice-s3-2-4-growth-threshold-clean", "s3-2-4", 31),
    ("practice-s3-2-4-log-scale-ratio-clean", "s3-2-4", 32),
    ("practice-s3-2-4-compound-inference-clean", "s3-2-4", 33),
]


def make_practice(row):
    practice_id, chapter_code, title, generator_key, chapter, tags = row
    return {
        "id": practice_id,
        "enabled": True,
        "mode": "generator",
        "title": title,
        "generatorKey": generator_key,
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 0,
        "relatedPracticeIds": [],
        "chapterCode": chapter_code,
        "stage": "高中",
        "grade": "高二",
        "term": "上學期",
        "chapter": chapter,
        "domain": "指數與對數",
        "prompt": "",
        "answer": "",
        "tags": [chapter_code, *tags, "無限練習"],
        "usage": [],
        "examples": [],
        "tips": ["此小類以同一解題模型換參數產生題目，避免只重排固定題目。"],
        "notes": [],
        "mistakes": [],
    }


def main():
    data = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    practices = data.setdefault("practices", [])
    bindings = data.setdefault("bindings", [])

    new_ids = {row[0] for row in NEW_PRACTICES}
    practices[:] = [row for row in practices if row.get("id") not in new_ids]
    practices.extend(make_practice(row) for row in NEW_PRACTICES)

    binding_keys = {(practice_id, "chapter", chapter_code) for practice_id, chapter_code, _ in BINDINGS}
    bindings[:] = [
        row
        for row in bindings
        if (row.get("practiceId"), str(row.get("targetType", "")).lower(), row.get("targetId")) not in binding_keys
    ]
    bindings.extend(
        {
            "practiceId": practice_id,
            "targetType": "chapter",
            "targetId": chapter_code,
            "enabled": True,
            "order": order,
        }
        for practice_id, chapter_code, order in BINDINGS
    )

    meta = data.setdefault("meta", {})
    meta["practiceCount"] = len(practices)
    meta["bindingCount"] = len(bindings)
    meta["totalPractices"] = len(practices)
    meta["totalBindings"] = len(bindings)
    meta["updatedAt"] = datetime.now(timezone.utc).isoformat()

    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"updated practices={len(practices)} bindings={len(bindings)}")


if __name__ == "__main__":
    main()
