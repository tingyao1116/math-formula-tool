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


def make_theme(updated_at: str) -> dict:
    return {
        "id": "s1-1-4-main-theme-exponent",
        "title": "指數",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "數與式",
        "domain": "代數",
        "difficulty": "基礎",
        "chapterRole": "主題",
        "parentId": "",
        "tags": ["s1-1-4", "指數", "高一上", "教學核心"],
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {
                    "label": "主軸",
                    "values": [
                        "\\text{先懂指數的定義，再熟指數律，接著處理方程式、不等式與生活應用。}"
                    ],
                }
            ],
        },
        "usage": [
            "這章的學習順序要從定義出發，再連到運算、比較、解題與模型。",
            "看到題目時，先判斷它是在考定義、指數律、方程式不等式，還是應用情境。 ",
        ],
        "examples": [
            "例如 $2^{-3}$、$8^{\\frac{2}{3}}$、$4^x=2^{x+3}$、複利與半衰期題，都屬於這章的核心題型。"
        ],
        "tips": [
            "若底數介於 0 和 1 之間，做大小比較或解不等式時要特別注意方向。",
            "若題目出現根式、分數指數、負指數，可先回到定義再決定怎麼化簡。 ",
        ],
        "notes": [
            "本章正式整理成一個主題、五個分支，不再在主題下疊同名包裝層。 "
        ],
        "mistakes": [
            "只背規則而不先判斷底數限制，最容易在負底數、零次方與分數指數處出錯。 "
        ],
        "contentTypes": ["教學核心", "題型策略", "易錯提醒"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "chapter_code": "s1-1-4",
        "gradeLabel": "高一上",
        "chapterCode": "s1-1-4",
        "section": "指數",
        "domainSub": "",
        "isBranch": False,
        "relatedChapters": [],
        "relatedTopicIds": [],
    }


def make_branch(
    branch_id: str,
    title: str,
    formula_lines: list[dict],
    usage: list[str],
    examples: list[str],
    tips: list[str],
    notes: list[str],
    mistakes: list[str],
    updated_at: str,
    difficulty: str = "基礎",
) -> dict:
    return {
        "id": branch_id,
        "title": title,
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "數與式",
        "domain": "代數",
        "difficulty": difficulty,
        "chapterRole": "分支",
        "parentId": "s1-1-4-main-theme-exponent",
        "tags": ["s1-1-4", "指數", title, "高一上"],
        "formula": {"type": "labeled-lines", "lines": formula_lines},
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes,
        "mistakes": mistakes,
        "contentTypes": ["重點整理", "觀念說明", "例題講解", "易錯提醒"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "chapter_code": "s1-1-4",
        "gradeLabel": "高一上",
        "chapterCode": "s1-1-4",
        "section": "指數",
        "domainSub": "",
        "isBranch": True,
        "relatedChapters": [],
        "relatedTopicIds": [],
    }


def build_branches(updated_at: str) -> list[dict]:
    return [
        make_branch(
            "s1-1-4-exponent-definition-extension",
            "指數的定義與擴充",
            [
                {"label": "整數指數", "values": ["$a^n$ 表示 $n$ 個 $a$ 連乘，且 $a^0=1\\ (a\\neq 0)$、$a^{-n}=\\frac{1}{a^n}$。"]},
                {"label": "有理數指數", "values": ["$a^{\\frac{1}{n}}=\\sqrt[n]{a}$，$a^{\\frac{m}{n}}=\\sqrt[n]{a^m}=(\\sqrt[n]{a})^m$。"]},
                {"label": "實數指數", "values": ["\\text{當 }a>0\\text{ 時，}a^r\\text{ 可擴充到任意實數 }r\\text{。}"]},
                {"label": "底數限制", "values": ["\\text{討論分數指數或無理數指數時，通常要求底數 }a>0\\text{。}"]},
            ],
            [
                "先建立正整數、零、負整數指數的意義，再把根式統一寫成分數指數。",
                "判斷某個指數式是否在實數範圍內有意義時，要先看底數與根號的限制。",
            ],
            [
                "計算 $(32)^{\\frac{2}{5}}=4$、$(8)^{-\\frac{2}{3}}=\\frac{1}{4}$。",
                "把 $\\sqrt[3]{x\\sqrt{x}}$ 改寫成 $x^{\\frac{1}{2}}$。",
                "判斷 $(-8)^{\\frac{1}{3}}$、$0^{-2}$ 在實數系中的意義。 ",
            ],
            [
                "負指數不是變負數，而是變倒數。",
                "分數指數和根式互換時，要先分清楚是偶次根還是奇次根。 ",
            ],
            [
                "這一支對應截圖 1-4.1，內容主軸就是定義、擴充與底數限制。",
                "學生若能把這支看懂，後面的指數律和方程式才不容易機械代公式。 ",
            ],
            [
                "把 $0^0$ 或 $0$ 的負次方當成有意義。",
                "把 $\\sqrt{a^2}$ 直接寫成 $a$，忘記其實應是 $|a|$。 ",
            ],
            updated_at,
        ),
        make_branch(
            "s1-1-4-exponent-laws",
            "指數律",
            [
                {"label": "同底數相乘相除", "values": ["$a^r\\cdot a^s=a^{r+s}$，$\\frac{a^r}{a^s}=a^{r-s}$。"]},
                {"label": "次方的次方", "values": ["$(a^r)^s=a^{rs}$。"]},
                {"label": "乘積與分式的次方", "values": ["$(ab)^r=a^r\\cdot b^r$，$\\left(\\frac{a}{b}\\right)^r=\\frac{a^r}{b^r}$。"]},
                {"label": "次數移項", "values": ["\\text{若 }a^m=b^n\\text{，則 }a=b^{\\frac{n}{m}}\\text{。}"]},
            ],
            [
                "這支專門整理指數律本身，重點是知道每一條規則在什麼條件下能用。",
                "遇到複雜式子時，先看能不能同底化或把高次方拆回基本指數律。 ",
            ],
            [
                "化簡 $a^{3x}\\cdot a^{-x}$、$\\frac{(ab)^3}{a^2b}$ 這類題。",
                "已知 $a^x+a^{-x}=k$，進一步求 $a^{2x}+a^{-2x}$ 或 $a^{3x}+a^{-3x}$。",
                "已知 $a^{2x}$ 的值，再配合乘法公式做條件求值。 ",
            ],
            [
                "看到同底數時優先考慮外乘內加、外除內減。",
                "若式子同時出現 $a^x$ 與 $a^{-x}$，不要忘了它們的乘積等於 1。 ",
            ],
            [
                "這支對應截圖 1-4.2，主軸是指數律本身與條件求值。",
                "和前一支不同，這裡重點不是定義，而是規則之間如何互相配合。 ",
            ],
            [
                "把 $(a^r)^s=a^{rs}$ 不分情況直接亂用到底數為負的情形。",
                "底數不同卻直接比較指數，忘了先同底化或換成同指數。 ",
            ],
            updated_at,
        ),
        make_branch(
            "s1-1-4-exponential-equations-inequalities",
            "指數方程式與不等式",
            [
                {"label": "同底數法", "values": ["\\text{若 }a^x=a^y\\text{ 且 }a>0,\\ a\\neq 1\\text{，則 }x=y\\text{。}"]},
                {"label": "代換法", "values": ["\\text{若同時出現 }a^x\\text{ 與 }a^{2x}\\text{，可令 }t=a^x\\ (t>0)\\text{。}"]},
                {"label": "單調性", "values": ["a>1\\text{ 時遞增，}0<a<1\\text{ 時遞減。}"]},
                {"label": "比較策略", "values": ["\\text{先化成同底數或同指數，再判斷不等號方向。}"]},
            ],
            [
                "這支把解方程式、解不等式與大小比較放在同一條主線上，核心都是指數函數的單調性。",
                "代換時不只要會解二次式，還要記得回頭檢查代換變數必須大於 0。 ",
            ],
            [
                "解 $4^x-3\\cdot 2^{x+1}+8=0$ 這類可令 $t=2^x$ 的題。",
                "比較 $\\sqrt{2}$、\\(\\sqrt[3]{3}\\)、\\(\\sqrt[10]{10}\\) 的大小。",
                "解 $(0.7)^{x^2}>(0.49)^x$，注意底數介於 0 和 1 時不等號方向會反。 ",
            ],
            [
                "看到不同底數時，先找能否改寫成同底數，例如 $4^x=(2^2)^x=2^{2x}$。",
                "若代換後得到一正一負兩根，負根常常要捨去，因為 $a^x>0$。 ",
            ],
            [
                "這支對應截圖 1-4.3，重點不是只會解方程式，而是能把比較和不等式一起看成單調性問題。",
                "學生若會把底數分成大於 1 與介於 0、1 之間兩類，判斷會穩很多。 ",
            ],
            [
                "底數在 0 和 1 之間時，去掉底數後忘記把不等號反向。",
                "代換出 $t$ 後只顧著解二次式，忘記 $t=a^x$ 必須滿足 $t>0$。 ",
            ],
            updated_at,
            difficulty="進階",
        ),
        make_branch(
            "s1-1-4-exponent-applications",
            "指數的應用",
            [
                {"label": "單利與複利", "values": ["$S=P(1+rt)$，$S=P(1+r)^t$。"]},
                {"label": "生長模型", "values": ["\\text{數量以固定倍率成長時，可寫成 }N(t)=N_0\\cdot a^t\\text{。}"]},
                {"label": "半衰期", "values": ["$M(t)=M_0\\left(\\frac{1}{2}\\right)^{\\frac{t}{h}}$。"]},
            ],
            [
                "這支把指數放回情境中，重點是能看懂題目的語言到底在描述成長、衰退、單利還是複利。",
                "只要關係是每一期乘上固定倍率，就幾乎都能回到指數模型。 ",
            ],
            [
                "比較年複利和月複利的差別，判斷哪個本利和較大。",
                "已知半衰期，求若干時間後的殘量，或反求降到某濃度需要多久。",
                "根據人口或細菌分裂的倍率，估算一段時間後的數量。 ",
            ],
            [
                "先把題目的倍率、期數、起始量對應清楚，再代公式。",
                "看到『利滾利』就想到複利，看到『每期都按原本金算』才是單利。 ",
            ],
            [
                "這支對應截圖 1-4.4，教學上最重要的是把情境語言翻成模型。",
                "若學生只會背公式，不會辨認成長倍率與期數，應用題就會卡住。 ",
            ],
            [
                "把單利公式和複利公式混用，或把年利率直接當成每月利率。",
                "半衰期題只看到『減少』就用線性想法，忘了它其實是固定倍數衰退。 ",
            ],
            updated_at,
        ),
        make_branch(
            "s1-1-4-common-mistakes",
            "易錯提醒",
            [
                {"label": "負底數陷阱", "values": ["$(a^r)^s=a^{rs}\\text{ 並不是所有負底數情況都能直接用。}"]},
                {"label": "零的次方", "values": ["$0^0$ \\text{ 與 }0^{-n}\\text{ 都無意義。}"]},
                {"label": "不等式變號", "values": ["0<a<1\\text{ 時，}a^x>a^y\\iff x<y\\text{。}"]},
                {"label": "絕對值", "values": ["\\sqrt{a^2}=|a|\\text{，不是一定等於 }a\\text{。}"]},
            ],
            [
                "這支不是新公式，而是把整章最常跌倒的地方集中整理，方便上課前後快速複查。",
                "如果學生一直在同類題型出錯，先回來檢查這支通常最有效。 ",
            ],
            [
                "檢查 $((-3)^2)^{\\frac{1}{2}}$ 為什麼不能直接把指數相乘。",
                "判斷 $0^{-2}$、$\\sqrt{a^2}$、$(0.8)^x>(0.8)^y$ 這些式子該怎麼正確處理。 ",
            ],
            [
                "把每一個提醒都和一題代表題一起綁住，學生比較不會只記口號。",
                "若某題同時牽涉分數指數與不等式，優先檢查底數限制與方向判斷。 ",
            ],
            [
                "這支對應你給的易錯提醒截圖，後續若要再補課堂口訣，也最適合放在這裡。",
                "教學上可以把它當成考前總複習清單使用。 ",
            ],
            [
                "把『去掉底數』和『套指數律』當成不用看條件的機械步驟。",
                "明明題目在考定義域或絕對值，卻只顧著往下算。 ",
            ],
            updated_at,
        ),
    ]


def update_formula_db(updated_at: str) -> None:
    path = DB_DIR / "formula-db.json"
    payload = read_json(path)
    old_topics = payload.get("topics", [])
    new_topics = [row for row in old_topics if str(row.get("chapterCode", "")).strip() != "s1-1-4"]
    new_topics.extend([make_theme(updated_at), *build_branches(updated_at)])
    payload["topics"] = new_topics
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(new_topics)
    payload["meta"]["updatedAt"] = updated_at
    write_json(path, payload)


def update_question_db(updated_at: str) -> None:
    path = DB_DIR / "question-db.json"
    payload = read_json(path)
    mapping = {
        "s1-1-4-exponent-operations": "s1-1-4-exponent-definition-extension",
        "s1-1-4-exponent-domain": "s1-1-4-exponent-definition-extension",
        "s1-1-4-decimal-exponents": "s1-1-4-exponent-definition-extension",
        "s1-1-4-exponent-substitution": "s1-1-4-exponent-laws",
        "s1-1-4-base-conversion": "s1-1-4-exponential-equations-inequalities",
        "s1-1-4-exponential-modeling": "s1-1-4-exponent-applications",
    }
    for row in payload.get("questions", []):
        code = str(row.get("chapterCode") or row.get("chapter_code") or "").strip()
        if code != "s1-1-4":
            continue
        formula_id = str(row.get("formula_id", "") or "")
        if formula_id in mapping:
            row["formula_id"] = mapping[formula_id]
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    write_json(path, payload)


def update_chapter_code_db(updated_at: str) -> None:
    path = DB_DIR / "chapter-code-db.json"
    payload = read_json(path)
    catalog = payload.setdefault("catalog", {})
    entry = catalog.setdefault("s1-1-4", {})
    entry["chapter"] = "數與式"
    entry["section"] = "指數"
    entry["domainMain"] = "代數"
    entry.setdefault("domainSub", "")
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    write_json(path, payload)


def update_chapter_overview_db(updated_at: str) -> None:
    path = DB_DIR / "chapter-overview-db.json"
    payload = read_json(path)
    overviews = payload.setdefault("overviews", {})
    overviews["s1-1-4"] = {
        "groupName": "高中・高一上・指數",
        "title": "章節重點大綱",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "這一章正式整理成一個主題、五個分支：先從指數的定義與擴充出發，再進到指數律、指數方程式與不等式、指數的應用，最後用易錯提醒收尾。學習時先分清楚題目是在考定義、運算、比較與求解，還是情境模型，不要把所有指數題混成同一種算法。 ",
                    },
                    {
                        "type": "table",
                        "headers": ["主題", "層級", "說明"],
                        "rows": [
                            [
                                "指數",
                                "主題",
                                "本章採一個主題、五個分支的資料結構，直接把截圖中的 1-4.1、1-4.2、1-4.3、1-4.4 與易錯提醒整理成第一層分支。 ",
                            ]
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
                        "text": "本章原稿目前也依照五個分支整理：指數的定義與擴充、指數律、指數方程式與不等式、指數的應用、易錯提醒。 ",
                    },
                    {
                        "type": "table",
                        "headers": ["主題", "層級", "說明"],
                        "rows": [
                            [
                                "指數",
                                "主題",
                                "本章採一個主題、五個分支的資料結構，不再在主題下重複疊同名包裝層。 ",
                            ]
                        ],
                    },
                ],
            },
        ],
    }
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    payload["meta"]["count"] = len(overviews)
    write_json(path, payload)


def update_chapter_overview_body_db(updated_at: str) -> None:
    path = DB_DIR / "chapter-overview-body-db.json"
    payload = read_json(path)
    bodies = payload.setdefault("bodies", {})
    bodies["s1-1-4"] = {
        "groupName": "高中・高一上・指數",
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
                        "title": "學習主線",
                        "items": [
                            {"label": "指數的定義與擴充", "text": "先建立正整數、零、負整數指數的意義，再把根式與分數指數統一起來，最後補上實數指數與底數限制。"},
                            {"label": "指數律", "text": "把同底數相乘相除、次方的次方、乘積與分式的次方放在同一條主線上，練習化簡與條件求值。 "},
                            {"label": "指數方程式與不等式", "text": "用同底數法、代換法與單調性處理解方程式、解不等式與大小比較。"},
                            {"label": "指數的應用", "text": "把複利、生長模型與半衰期都看成固定倍率變化的指數模型。"},
                            {"label": "易錯提醒", "text": "集中複查負底數陷阱、零的次方、絕對值與不等式變號等最常錯的地方。"},
                        ],
                    },
                    {
                        "type": "bullet-list",
                        "title": "代表題型",
                        "items": [
                            {"label": "基本求值", "text": "例如 $(32)^{\\frac{2}{5}}$、$(8)^{-\\frac{2}{3}}$ 與根式轉指數。"},
                            {"label": "條件求值", "text": "已知 $a^x+a^{-x}$ 或 $a^{2x}$ 的值，配合指數律與乘法公式往上推。"},
                            {"label": "解方程式與不等式", "text": "例如 $4^x-3\\cdot 2^{x+1}+8=0$ 或底數介於 0、1 之間的不等式。"},
                            {"label": "情境模型", "text": "複利、人口成長、藥物殘量與半衰期都是本章最典型的應用題。"},
                        ],
                    },
                    {
                        "type": "bullet-list",
                        "title": "教學提醒",
                        "items": [
                            {"label": "先判斷再運算", "text": "每一題先判斷底數限制、單調性與代換範圍，再開始化簡或求解。"},
                            {"label": "根式與指數互通", "text": "把根式寫回分數指數，常常能看出真正該用的是定義還是指數律。"},
                        ],
                    },
                ],
            }
        ],
    }
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    payload["meta"]["count"] = len(bodies)
    write_json(path, payload)


def update_chapter_closing_db(updated_at: str) -> None:
    path = DB_DIR / "chapter-closing-db.json"
    payload = read_json(path)
    closings = payload.setdefault("closings", {})
    closings["s1-1-4"] = {
        "groupName": "高中・高一上・指數",
        "title": "章節後話",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "這一章最重要的不是把指數律背熟而已，而是知道每一條規則背後在處理什麼關係。先把定義站穩，指數律才不會變成亂套公式；再把單調性看懂，方程式、不等式與大小比較就會串成同一條線。最後把複利、成長與半衰期放回生活情境，學生才會真的感受到指數不是只存在於計算題裡。 ",
                    }
                ],
            }
        ],
    }
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    payload["meta"]["count"] = len(closings)
    write_json(path, payload)


def update_main_topic_overview_db(updated_at: str) -> None:
    path = DB_DIR / "main-topic-overview-db.json"
    payload = read_json(path)
    by_id = payload.setdefault("byId", {})
    for old_id in [key for key in list(by_id) if key.startswith("s1-1-4-")]:
        del by_id[old_id]
    by_id["s1-1-4-main-theme-exponent"] = {
        "id": "s1-1-4-main-theme-exponent",
        "title": "指數",
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
                            ["指數的定義與擴充", "先建立整數、有理數與實數指數的意義，再掌握底數限制與定義判定。"],
                            ["指數律", "整理同底數相乘相除、次方的次方、乘積與分式的次方，並連到條件求值。"],
                            ["指數方程式與不等式", "用同底數法、代換法與單調性處理解方程式、解不等式與大小比較。"],
                            ["指數的應用", "把單利、複利、生長衰退與半衰期都看成固定倍率變化的模型。"],
                            ["易錯提醒", "集中複查負底數陷阱、零的次方、變數代換範圍與不等式變號。"],
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
                        "src": "data/main-theme-overviews/s1-1-4-topic-1-exponent.pdf",
                        "note": "指數",
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
    update_question_db(updated_at)
    update_chapter_code_db(updated_at)
    update_chapter_overview_db(updated_at)
    update_chapter_overview_body_db(updated_at)
    update_chapter_closing_db(updated_at)
    update_main_topic_overview_db(updated_at)
    print("s1-1-4 restructured to one theme with five branches")


if __name__ == "__main__":
    main()

