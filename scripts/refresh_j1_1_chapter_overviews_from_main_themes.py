from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CHAPTER_OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"

TZ = timezone(timedelta(hours=8))


CHAPTERS = {
    "j1-1-1": {
        "groupName": "國中・國一上・數線與絕對值",
        "paragraph": (
            "1. 這章正式改以三個主題當主軸：正負數與數的分類、數線相反數與中點、絕對值與距離。\n"
            "2. 這章最重要的是先把數放回數線上理解，再去看相反數、中點與絕對值，不要把分類題和距離題混在一起。\n"
            "3. 看到題目時，先判斷它是在考數的分類、數線位置，還是在考絕對值與距離，方向會清楚很多。\n"
            "4. 這章的下一層提醒先直接取主題整理重點，之後若要再細拆分支，再從這些重點往下長。"
        ),
        "topics": [
            "j1-1-1-main-theme-positive-negative-classification",
            "j1-1-1-main-theme-number-line-opposite-midpoint",
            "j1-1-1-main-theme-absolute-value-distance",
        ],
    },
    "j1-1-2": {
        "groupName": "國中・國一上・正負數的加減乘除",
        "paragraph": (
            "1. 這章正式先以一個主題當主軸：正負數的四則運算。\n"
            "2. 這章最重要的是把加減乘除、去括號、分配律和數線距離一起看成整數運算的同一條主線，不要拆成很多假主題。\n"
            "3. 看到題目時，先判斷它是在考加減、乘除、括號整理，還是在考距離與中點，再往對應分支看。\n"
            "4. 章節大綱第三欄先用主題重點整理，不直接拼舊分支名。"
        ),
        "topics": [
            "j1-1-2-main-theme-signed-arithmetic",
        ],
    },
    "j1-1-3": {
        "groupName": "國中・國一上・指數律",
        "paragraph": (
            "1. 這章正式改以五個主題當主軸：乘方與指數的意思、指數律基本規則、正負號奇偶次方與括號判別、分數底數與混合指數運算、指數比大小。\n"
            "2. 這章最重要的是先看底數、指數和括號的位置，再決定要用哪一條指數律，不要看到次方就直接套公式。\n"
            "3. 看到題目時，先判斷它是在考次方意義、規則化簡、正負號判別，還是在考比大小與綜合應用。\n"
            "4. 這章的下一層提醒全部改回主題重點，不再用舊原文摘要。"
        ),
        "topics": [
            "j1-1-3-main-theme-meaning-of-powers",
            "j1-1-3-main-theme-basic-exponent-laws",
            "j1-1-3-main-theme-sign-parity-brackets",
            "j1-1-3-main-theme-fraction-bases-and-mixed-exponents",
            "j1-1-3-main-theme-comparing-exponential-expressions",
        ],
    },
    "j1-1-4": {
        "groupName": "國中・國一上・科學記號",
        "paragraph": (
            "1. 這章正式改以兩個主題當主軸：科學記號與常見單位、科學記號的運算。\n"
            "2. 這章最重要的是先把一般數和科學記號之間的轉換穩住，再處理乘除與加減，不要把單位換算和運算混成同一步。\n"
            "3. 看到題目時，先判斷它是在考記號格式、常見單位，還是在考乘除或加減運算，做法會簡單很多。\n"
            "4. 這章大綱第三欄也改回主題重點整理，跟主題頁保持一致。"
        ),
        "topics": [
            "j1-1-4-main-theme-scientific-notation-and-units",
            "j1-1-4-main-theme-scientific-notation-operations",
        ],
    },
}


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def summary_from_rows(rows: list[list[str]], limit: int = 4) -> str:
    labels = [row[0] for row in rows[:limit] if row and row[0]]
    if not labels:
        return "待補主題重點"
    suffix = "等重點" if len(rows) > limit else "重點"
    return "、".join(labels) + suffix


def main() -> None:
    updated_at = now_iso()
    chapter_db = load_json(CHAPTER_OVERVIEW_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    by_id = main_topic_db.get("byId", {})

    for chapter_code, config in CHAPTERS.items():
        rows = []
        for topic_id in config["topics"]:
            entry = by_id[topic_id]
            table = entry["variants"][0]["sections"][0]
            summary = summary_from_rows(table["rows"])
            rows.append([entry["title"], "主題", summary])

        old = chapter_db.setdefault("overviews", {}).get(chapter_code, {})
        old_variants = old.get("variants", [])
        preserved = [variant for variant in old_variants if variant.get("id") != "editable"]

        editable = {
            "id": "editable",
            "label": "可修改版",
            "sections": [
                {
                    "type": "paragraph",
                    "text": config["paragraph"],
                },
                {
                    "type": "table",
                    "headers": ["主題", "角色", "下一層 / 提醒"],
                    "rows": rows,
                },
            ],
        }

        chapter_db["overviews"][chapter_code] = {
            "groupName": config["groupName"],
            "title": "章節重點大綱",
            "updatedAt": updated_at,
            "variants": [editable, *preserved],
        }

    chapter_db.setdefault("meta", {})["updatedAt"] = updated_at
    chapter_db["meta"]["count"] = len(chapter_db.get("overviews", {}))
    save_json(CHAPTER_OVERVIEW_DB, chapter_db)
    print("Refreshed j1-1-1 ~ j1-1-4 chapter overviews from main themes.")


if __name__ == "__main__":
    main()
