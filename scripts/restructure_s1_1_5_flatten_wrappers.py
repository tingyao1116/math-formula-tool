from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DB_DIR = ROOT / "program-db" / "database"


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def update_formula_db(updated_at: str) -> None:
    path = DB_DIR / "formula-db.json"
    payload = read_json(path)
    topics = payload.get("topics", [])

    remove_ids = {
        "s1-1-5-logarithm-core",
        "s1-1-5-scientific-notation-core",
    }
    reparent_map = {
        "s1-1-5-log-definition-evaluation": "s1-1-5-main-theme-common-log",
        "s1-1-5-log-power-swap-computation": "s1-1-5-main-theme-common-log",
        "s1-1-5-log-scale-models": "s1-1-5-main-theme-common-log",
        "s1-1-5-log-growth-models": "s1-1-5-main-theme-common-log",
        "s1-1-5-scientific-notation-basics": "s1-1-5-main-theme-scientific-notation",
        "s1-1-5-digit-leading-estimation": "s1-1-5-main-theme-scientific-notation",
    }

    title_map = {
        "s1-1-5-log-definition-evaluation": "對數定義、存在條件與值計算",
        "s1-1-5-log-power-swap-computation": "指對數互換與求值",
        "s1-1-5-log-scale-models": "對數尺度模型",
        "s1-1-5-log-growth-models": "成長衰減與複利模型",
        "s1-1-5-scientific-notation-basics": "科學記號與首尾數",
        "s1-1-5-digit-leading-estimation": "位數與首位數估計",
    }

    new_topics = []
    for row in topics:
        code = str(row.get("chapterCode", "")).strip()
        if code != "s1-1-5":
            new_topics.append(row)
            continue
        row_id = str(row.get("id", "")).strip()
        if row_id in remove_ids:
            continue
        if row_id == "s1-1-5-unit-logarithm":
            row["title"] = "單元 5 對數"
            row["section"] = "對數"
        if row_id in {"s1-1-5-main-theme-common-log", "s1-1-5-main-theme-scientific-notation"}:
            row["section"] = "對數"
        if row_id in reparent_map:
            row["parentId"] = reparent_map[row_id]
            row["section"] = "對數"
            row["title"] = title_map[row_id]
        row["chapter"] = "數與式"
        row["chapter_code"] = "s1-1-5"
        row["chapterCode"] = "s1-1-5"
        row["gradeLabel"] = row.get("gradeLabel") or "高一上"
        row["modifiedAt"] = updated_at
        row.pop("children", None)
        new_topics.append(row)

    payload["topics"] = new_topics
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(new_topics)
    payload["meta"]["updatedAt"] = updated_at
    write_json(path, payload)


def update_chapter_code_db(updated_at: str) -> None:
    path = DB_DIR / "chapter-code-db.json"
    payload = read_json(path)
    entry = payload.setdefault("catalog", {}).setdefault("s1-1-5", {})
    entry["chapter"] = "數與式"
    entry["section"] = "對數"
    entry["domainMain"] = "代數"
    entry["domainSub"] = ""
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    write_json(path, payload)


def update_chapter_overview_db(updated_at: str) -> None:
    path = DB_DIR / "chapter-overview-db.json"
    payload = read_json(path)
    payload.setdefault("overviews", {})["s1-1-5"] = {
        "groupName": "高中・高一上・對數",
        "title": "章節重點大綱",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "這一章先以兩個主題整理：常用對數與科學記號。常用對數這邊先處理定義、限制、求值與模型；科學記號這邊則整理首尾數、位數與首位數估計。這次先把重複的同名包裝層拿掉，讓主題下面直接接分支。 ",
                    },
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": [
                            ["常用對數", "主題", "對數定義、存在條件與值計算、指對數互換與求值、對數尺度模型、成長衰減與複利模型"],
                            ["科學記號", "主題", "科學記號與首尾數、位數與首位數估計"],
                        ],
                    },
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "本章原稿目前先對應兩個主題：常用對數與科學記號；分支整理以現有正式資料為準，不再保留同名中介層。 ",
                    },
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": [
                            ["常用對數", "主題", "對數定義、存在條件與值計算、指對數互換與求值、對數尺度模型、成長衰減與複利模型"],
                            ["科學記號", "主題", "科學記號與首尾數、位數與首位數估計"],
                        ],
                    },
                ],
            },
        ],
    }
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    payload["meta"]["count"] = len(payload["overviews"])
    write_json(path, payload)


def update_chapter_overview_body_db(updated_at: str) -> None:
    path = DB_DIR / "chapter-overview-body-db.json"
    payload = read_json(path)
    payload.setdefault("bodies", {})["s1-1-5"] = {
        "groupName": "高中・高一上・對數",
        "title": "章節正文",
        "updatedAt": updated_at,
        "appendGeneratedOutline": False,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "bullet-list",
                        "title": "重點歸納",
                        "items": [
                            {
                                "label": "常用對數",
                                "text": "先抓住定義：當 \\(a>0, a\\neq 1, b>0\\) 時，\\(a^x=b\\iff x=\\log_a b\\)。以 10 為底的對數記作 \\(\\log x\\)，接著整理乘除轉加減、次方提到前面，以及成長模型、尺度模型等常見應用。 ",
                            },
                            {
                                "label": "科學記號",
                                "text": "把正數寫成 \\(a\\times 10^n\\) 後，可用首數與尾數去處理位數、首位數估計與大數小數的判讀。這一塊重點是位值與估算，不是只會移小數點。 ",
                            },
                        ],
                    },
                    {
                        "type": "bullet-list",
                        "title": "常見題型",
                        "items": [
                            {"label": "對數求值", "text": "判斷真數條件後，再做對數律化簡、指對數互換與條件求值。"},
                            {"label": "科學記號判讀", "text": "由科學記號回推位數、首位數，或利用近似對數估計大數的量級。"},
                            {"label": "模型應用", "text": "把對數放回地震規模、複利成長、尺度模型等情境中做判讀。"},
                        ],
                    },
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "image",
                        "src": "data/chapter-overview-originals/s1-1-5-original.png",
                        "caption": "1-5 對數原稿截圖",
                    }
                ],
            },
        ],
    }
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    payload["meta"]["count"] = len(payload["bodies"])
    write_json(path, payload)


def update_chapter_closing_db(updated_at: str) -> None:
    path = DB_DIR / "chapter-closing-db.json"
    payload = read_json(path)
    payload.setdefault("closings", {})["s1-1-5"] = {
        "groupName": "高中・高一上・對數",
        "title": "章節後話",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "這一章最重要的不是把符號和格式背熟，而是看懂對數在做什麼轉換。常用對數把乘除與次方整理成較好處理的形式，科學記號則把非常大的數與非常小的數重新放回可讀的位值結構裡。先分清楚你是在做對數運算，還是在做位數與首位數判讀，整章就會清楚很多。 ",
                    }
                ],
            }
        ],
    }
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    payload["meta"]["count"] = len(payload["closings"])
    write_json(path, payload)


def update_main_topic_overview_db(updated_at: str) -> None:
    path = DB_DIR / "main-topic-overview-db.json"
    payload = read_json(path)
    by_id = payload.setdefault("byId", {})
    by_id["s1-1-5-main-theme-common-log"] = {
        "id": "s1-1-5-main-theme-common-log",
        "title": "常用對數",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "table",
                        "headers": ["分支", "學習重點"],
                        "rows": [
                            ["對數定義、存在條件與值計算", "先把對數的定義、真數限制與基本求值看穩。"],
                            ["指對數互換與求值", "利用指數與對數的互逆關係做化簡與條件求值。"],
                            ["對數尺度模型", "把地震、分貝、pH 等情境拉回對數尺度理解。"],
                            ["成長衰減與複利模型", "把對數放回成長、衰減與複利題中做反推與判讀。"],
                        ],
                    }
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "pdf-page",
                        "src": "data/main-theme-overviews/s1-1-5-topic-1-common-logarithm.pdf",
                        "note": "常用對數",
                    }
                ],
            },
        ],
    }
    by_id["s1-1-5-main-theme-scientific-notation"] = {
        "id": "s1-1-5-main-theme-scientific-notation",
        "title": "科學記號",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "table",
                        "headers": ["分支", "學習重點"],
                        "rows": [
                            ["科學記號與首尾數", "把數寫成科學記號後，連到首數、尾數與位值判讀。"],
                            ["位數與首位數估計", "利用尾數範圍與近似對數估計位數與首位數。"],
                        ],
                    }
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "pdf-page",
                        "src": "data/main-theme-overviews/s1-1-5-topic-2-scientific-notation.pdf",
                        "note": "科學記號",
                    }
                ],
            },
        ],
    }
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    payload["meta"]["count"] = len(by_id)
    write_json(path, payload)


def main() -> None:
    updated_at = now_iso()
    update_formula_db(updated_at)
    update_chapter_code_db(updated_at)
    update_chapter_overview_db(updated_at)
    update_chapter_overview_body_db(updated_at)
    update_chapter_closing_db(updated_at)
    update_main_topic_overview_db(updated_at)
    print("s1-1-5 flattened to two themes without duplicate wrappers")


if __name__ == "__main__":
    main()

