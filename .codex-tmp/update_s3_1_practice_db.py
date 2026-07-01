import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    {
        "id": "practice-s3-1-1-sector-cone-parameterized",
        "chapterCode": "s3-1-1",
        "title": "扇形展開成圓錐：半徑、高與體積",
        "generatorKey": "s3-1-1-sector-cone-parameterized",
        "difficulty": "medium",
        "tags": ["s3-1-1", "弧度與扇形", "圓錐側面展開", "體積"],
        "tips": ["扇形弧長等於圓錐底圓周長，扇形半徑就是圓錐母線。"],
    },
    {
        "id": "practice-s3-1-2-tangent-addition-equation-parameterized",
        "chapterCode": "s3-1-2",
        "title": "正切和差角：方程與反解",
        "generatorKey": "s3-1-2-tangent-addition-equation-parameterized",
        "difficulty": "medium",
        "tags": ["s3-1-2", "和差角公式", "正切", "反解"],
        "tips": ["看見分式形式時，先判斷它是否就是 tan(A-B) 或 tan(A+B)。"],
    },
    {
        "id": "practice-s3-1-2-cos-arithmetic-progression-parameterized",
        "chapterCode": "s3-1-2",
        "title": "餘弦等差數列條件",
        "generatorKey": "s3-1-2-cos-arithmetic-progression-parameterized",
        "difficulty": "medium",
        "tags": ["s3-1-2", "和差化積", "等差數列", "解的個數"],
        "tips": ["三數成等差時，中項的兩倍等於首項加末項。"],
    },
    {
        "id": "practice-s3-1-3-linear-sincos-graph-facts-parameterized",
        "chapterCode": "s3-1-3",
        "title": "a sin kx + b cos kx 圖形基本量",
        "generatorKey": "s3-1-3-linear-sincos-graph-facts-parameterized",
        "difficulty": "medium",
        "tags": ["s3-1-3", "三角函數圖形", "振幅", "週期", "極值"],
        "tips": ["a sin kx + b cos kx 的振幅是 sqrt(a^2+b^2)，週期看 k。"],
    },
    {
        "id": "practice-s3-1-3-peak-valley-function-parameterized",
        "chapterCode": "s3-1-3",
        "title": "由相鄰最高點與最低點求函數",
        "generatorKey": "s3-1-3-peak-valley-function-parameterized",
        "difficulty": "medium",
        "tags": ["s3-1-3", "三角函數圖形", "最高點", "最低點", "函數模型"],
        "tips": ["最高點到相鄰最低點是半個週期，兩個 y 值的平均是中線。"],
    },
    {
        "id": "practice-s3-1-4-linear-combo-inequality-parameterized",
        "chapterCode": "s3-1-4",
        "title": "合成後解三角不等式",
        "generatorKey": "s3-1-4-linear-combo-inequality-parameterized",
        "difficulty": "medium",
        "tags": ["s3-1-4", "三角函數合成", "不等式", "區間解"],
        "tips": ["先把 a sin x + b cos x 合成單一三角函數，再回到指定範圍取解。"],
    },
    {
        "id": "practice-s3-1-4-combo-max-point-tangent-parameterized",
        "chapterCode": "s3-1-4",
        "title": "合成函數最大點的正切值",
        "generatorKey": "s3-1-4-combo-max-point-tangent-parameterized",
        "difficulty": "medium",
        "tags": ["s3-1-4", "三角函數合成", "最大值", "導數條件"],
        "tips": ["最大點可用合成角判斷，也可用 f'(x)=0 求 tan x。"],
    },
]


BINDINGS = [
    ("practice-s3-1-1-sector-cone-parameterized", "s3-1-1", 4),
    ("practice-s3-1-2-tangent-addition-equation-parameterized", "s3-1-2", 5),
    ("practice-s3-1-2-cos-arithmetic-progression-parameterized", "s3-1-2", 6),
    ("practice-s3-1-3-linear-sincos-graph-facts-parameterized", "s3-1-3", 4),
    ("practice-s3-1-3-peak-valley-function-parameterized", "s3-1-3", 5),
    ("practice-s3-1-4-linear-combo-inequality-parameterized", "s3-1-4", 3),
    ("practice-s3-1-4-combo-max-point-tangent-parameterized", "s3-1-4", 4),
]


def practice_record(row):
    return {
        "id": row["id"],
        "enabled": True,
        "mode": "generator",
        "title": row["title"],
        "generatorKey": row["generatorKey"],
        "difficulty": row["difficulty"],
        "questionCount": 5,
        "subtypeCount": 0,
        "relatedPracticeIds": [],
        "chapterCode": row["chapterCode"],
        "stage": "高中",
        "grade": "高二",
        "term": "上學期",
        "chapter": "三角函數",
        "domain": "三角函數",
        "prompt": "",
        "answer": "",
        "tags": row["tags"],
        "usage": [],
        "examples": [],
        "tips": row["tips"],
        "notes": [],
        "mistakes": [],
    }


def main():
    data = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    practices = data.setdefault("practices", [])
    bindings = data.setdefault("bindings", [])

    new_ids = {row["id"] for row in NEW_PRACTICES}
    practices[:] = [row for row in practices if row.get("id") not in new_ids]
    practices.extend(practice_record(row) for row in NEW_PRACTICES)

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
