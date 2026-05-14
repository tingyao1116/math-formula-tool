from __future__ import annotations

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB_PATH = ROOT / "program-db" / "database" / "formula-db.json"
OVERVIEW_DB_PATH = ROOT / "program-db" / "database" / "chapter-overview-db.json"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def find_topic(topics: list[dict], topic_id: str) -> dict:
    for topic in topics:
        if str(topic.get("id", "")).strip() == topic_id:
            return topic
    raise KeyError(topic_id)


def build_topic(
    *,
    topic_id: str,
    title: str,
    chapter_role: str,
    parent_id: str,
    formula: dict,
    tags: list[str],
    usage: list[str],
    examples: list[str],
    tips: list[str],
    notes: list[str],
    mistakes: list[str],
    content_types: list[str],
    difficulty: str = "基礎",
    chapter: str = "多項式函數",
    domain: str = "代數",
) -> dict:
    timestamp = now_iso()
    return {
        "id": topic_id,
        "title": title,
        "formula": formula,
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": chapter,
        "domain": domain,
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": parent_id,
        "tags": tags,
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes,
        "mistakes": mistakes,
        "contentTypes": content_types,
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": timestamp,
        "chapter_code": "s1-3-1" if chapter == "多項式函數" else "",
    }


def sync_s1_1_1(topics: list[dict]) -> None:
    root = find_topic(topics, "senior-real-number-overview")
    core = find_topic(topics, "s1-1-1-real-number-core")
    rational = find_topic(topics, "senior-rational-number-definition")
    irrational = find_topic(topics, "senior-irrational-number-basics")
    real_line = find_topic(topics, "senior-real-line-interval-notation")
    distance = find_topic(topics, "senior-distance-midpoint-section-formulas")

    root["notes"] = [
        "這章正式主軸改以 Word 筆記的四個主題整理：有理數、無理數、實數與數線、距離與分點公式。",
        "原本的章級核心摘要保留為導覽節點，方便先讀後展開。"
    ]

    rational["chapterRole"] = "主題"
    irrational["chapterRole"] = "主題"
    real_line["chapterRole"] = "主題"
    distance["chapterRole"] = "主題"

    find_topic(topics, "senior-rational-density")["parentId"] = rational["id"]
    find_topic(topics, "senior-rounding-rational-constraints")["parentId"] = rational["id"]
    find_topic(topics, "senior-real-number-interval-compare")["parentId"] = real_line["id"]
    find_topic(topics, "senior-arithmetic-geometric-mean")["parentId"] = real_line["id"]
    find_topic(topics, "senior-square-root-perfect-square")["parentId"] = irrational["id"]

    core["parentId"] = root["id"]
    core["chapterRole"] = "教學補充"
    core["notes"] = [
        "這筆保留為章節導覽節點，主要用來先抓分類、性質與讀題方向。",
        "來源：高一上全重點_易讀版.md（重點整理匯入）"
    ]


def ensure_s1_2_1_coordinate_topic(topics: list[dict]) -> None:
    root = find_topic(topics, "senior-line-equation")
    try:
        topic = find_topic(topics, "senior-coordinate-system-s121")
    except KeyError:
        topic = {
            "id": "senior-coordinate-system-s121",
            "title": "坐標系",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {
                        "label": "兩點距離",
                        "values": [
                            "$PQ=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$"
                        ]
                    },
                    {
                        "label": "中點公式",
                        "values": [
                            "$\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)$"
                        ]
                    }
                ]
            },
            "stage": "高中",
            "grade": "高一",
            "term": "上學期",
            "chapter": "直線方程式",
            "domain": "解析幾何",
            "difficulty": "基礎",
            "chapterRole": "主題",
            "parentId": root["id"],
            "tags": [
                "s1-2-1",
                "坐標系",
                "距離公式",
                "分點公式",
                "高一上"
            ],
            "usage": [
                "先建立點、距離、中點、分點的座標觀念，再往後接斜率與直線方程式。"
            ],
            "examples": [
                "先找兩點距離與中點，再把圖形條件轉回代數式。"
            ],
            "tips": [
                "先看題目是在考位置、距離，還是兩點關係，不要一開始就急著列直線方程式。"
            ],
            "notes": [
                "來源主軸：高一上全重點_易讀版.docx / 單元6 主題1：坐標系"
            ],
            "mistakes": [
                "把橫坐標和縱坐標順序寫反，或把內分外分公式的分母符號用錯。"
            ],
            "contentTypes": [
                "教學核心",
                "重點公式",
                "題型策略",
                "易錯提醒"
            ],
            "contentTypesLocked": True,
            "mathNotationLocked": True,
            "modifiedAt": now_iso(),
            "chapter_code": "s1-2-1",
        }
        topics.append(topic)
    else:
        topic["title"] = "坐標系"
        topic["chapterRole"] = "主題"
        topic["parentId"] = root["id"]


def sync_s1_2_1(topics: list[dict]) -> None:
    root = find_topic(topics, "senior-line-equation")
    slope = find_topic(topics, "senior-line-slope-basics")
    forms = find_topic(topics, "senior-line-equation-forms")
    inequality = find_topic(topics, "senior-line-linear-inequality-half-plane")
    core = find_topic(topics, "s1-2-1-line-equations-core")

    ensure_s1_2_1_coordinate_topic(topics)

    slope["title"] = "直線斜率"
    slope["chapterRole"] = "主題"
    forms["title"] = "直線方程式"
    forms["chapterRole"] = "主題"
    inequality["title"] = "二元一次不等式"
    inequality["chapterRole"] = "主題"

    find_topic(topics, "senior-line-point-line-distance-projection")["parentId"] = forms["id"]
    find_topic(topics, "senior-line-parallel-perpendicular-bisector")["parentId"] = forms["id"]
    find_topic(topics, "senior-line-two-variable-system-geometry")["parentId"] = forms["id"]
    find_topic(topics, "senior-line-angle-between-lines-s121")["parentId"] = forms["id"]
    find_topic(topics, "senior-line-parametric-form-s121")["parentId"] = forms["id"]
    find_topic(topics, "senior-line-form-conversion-strategy-s121")["parentId"] = forms["id"]
    find_topic(topics, "senior-line-point-line-distance-projection-s121")["parentId"] = forms["id"]
    find_topic(topics, "senior-line-bisector-equations-s121")["parentId"] = forms["id"]
    find_topic(topics, "senior-triangle-five-centers-quick-sheet-s121")["parentId"] = forms["id"]
    find_topic(topics, "senior-line-same-opposite-side-criterion")["parentId"] = inequality["id"]
    find_topic(topics, "senior-line-half-plane-sign-test-s121")["parentId"] = inequality["id"]
    find_topic(topics, "senior-line-same-opposite-side-product-test-s121")["parentId"] = inequality["id"]

    core["parentId"] = root["id"]
    core["chapterRole"] = "教學補充"
    core["notes"] = [
        "這筆保留為章節導覽節點，方便先抓斜率、點斜式與讀題方向。",
        "來源：高一上全重點_易讀版.md（重點整理匯入）"
    ]


def sync_s1_3_1(topics: list[dict]) -> None:
    timestamp = now_iso()
    root_id = "senior-polynomial-function-overview-s131"
    root = None
    for topic in topics:
        if str(topic.get("id", "")).strip() == root_id:
            root = topic
            break
    if root is None:
        root = {
            "id": root_id,
            "title": "多項式函數",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {
                        "label": "主線",
                        "values": [
                            "$\\text{基本概念}\\rightarrow\\text{四則運算}\\rightarrow\\text{餘式/因式定理}$"
                        ]
                    }
                ]
            },
            "stage": "高中",
            "grade": "高一",
            "term": "上學期",
            "chapter": "多項式函數",
            "domain": "代數",
            "difficulty": "基礎",
            "chapterRole": "主角",
            "parentId": "",
            "tags": [
                "s1-3-1",
                "多項式函數",
                "重點整理",
                "白話版"
            ],
            "usage": [
                "先建立次數、係數、四則運算與定理之間的主線，再往後接圖形與方程。"
            ],
            "examples": [
                "看到題目先分清楚是在考多項式的結構、運算，還是餘式與因式判斷。"
            ],
            "tips": [
                "這章先不要急著畫圖，先把多項式的次數、係數和定理關係看懂。"
            ],
            "notes": [
                "來源主軸：高一上全重點_易讀版.docx / 單元9"
            ],
            "mistakes": [
                "把多項式、方程式、函數三者混成同一件事，導致列式和代值都容易失焦。"
            ],
            "contentTypes": [
                "教學核心",
                "重點公式",
                "題型策略",
                "易錯提醒"
            ],
            "contentTypesLocked": True,
            "mathNotationLocked": True,
            "modifiedAt": timestamp,
            "chapter_code": "s1-3-1",
        }
        topics.append(root)

    def ensure_topic(topic_id: str, payload: dict) -> dict:
        for topic in topics:
            if str(topic.get("id", "")).strip() == topic_id:
                topic.update(deepcopy(payload))
                topic["id"] = topic_id
                return topic
        payload = deepcopy(payload)
        payload["id"] = topic_id
        topics.append(payload)
        return payload

    ensure_topic(
        "senior-polynomial-basic-concepts-s131",
        {
            "title": "多項式基本概念",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {
                        "label": "標準型",
                        "values": [
                            "$p(x)=a_nx^n+a_{n-1}x^{n-1}+\\cdots+a_1x+a_0$"
                        ]
                    },
                    {
                        "label": "次數",
                        "values": [
                            "$\\deg p(x)=n$"
                        ]
                    }
                ]
            },
            "stage": "高中",
            "grade": "高一",
            "term": "上學期",
            "chapter": "多項式函數",
            "domain": "代數",
            "difficulty": "基礎",
            "chapterRole": "主題",
            "parentId": root_id,
            "tags": [
                "s1-3-1",
                "多項式",
                "次數",
                "係數",
                "高一上"
            ],
            "usage": [
                "先辨認一個式子是不是多項式，再判斷次數、係數、常數項與首項係數。"
            ],
            "examples": [
                "$f(0)$ 可直接抓常數項，$f(1)$ 可直接抓係數和。"
            ],
            "tips": [
                "先看變數是不是只出現在非負整數次方，再決定能不能當成多項式。"
            ],
            "notes": [
                "來源主軸：高一上全重點_易讀版.docx / 單元9 主題1：多項式基本概念"
            ],
            "mistakes": [
                "把分母有 x、根號有 x，或絕對值含 x 的式子誤當成多項式。"
            ],
            "contentTypes": [
                "教學核心",
                "重點公式",
                "題型策略",
                "易錯提醒"
            ],
            "contentTypesLocked": True,
            "mathNotationLocked": True,
            "modifiedAt": timestamp,
            "chapter_code": "s1-3-1",
        },
    )

    ensure_topic(
        "senior-polynomial-arithmetic-s131",
        {
            "title": "多項式四則運算",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {
                        "label": "次數規則",
                        "values": [
                            "$\\deg(fg)=\\deg f+\\deg g$"
                        ]
                    },
                    {
                        "label": "除法原理",
                        "values": [
                            "$f(x)=g(x)Q(x)+r(x)$"
                        ]
                    }
                ]
            },
            "stage": "高中",
            "grade": "高一",
            "term": "上學期",
            "chapter": "多項式函數",
            "domain": "代數",
            "difficulty": "基礎",
            "chapterRole": "主題",
            "parentId": root_id,
            "tags": [
                "s1-3-1",
                "多項式",
                "加減乘除",
                "綜合除法",
                "高一上"
            ],
            "usage": [
                "整理多項式的加減乘除、長除法與綜合除法。"
            ],
            "examples": [
                "缺項時先補 0，再做長除法或綜合除法，比較不容易錯位。"
            ],
            "tips": [
                "做運算前先降冪排列，尤其是除法。"
            ],
            "notes": [
                "來源主軸：高一上全重點_易讀版.docx / 單元9 主題2：多項式四則運算"
            ],
            "mistakes": [
                "少補缺項 0，或把加減運算中不同次項硬湊在一起。"
            ],
            "contentTypes": [
                "教學核心",
                "重點公式",
                "題型策略",
                "易錯提醒"
            ],
            "contentTypesLocked": True,
            "mathNotationLocked": True,
            "modifiedAt": timestamp,
            "chapter_code": "s1-3-1",
        },
    )

    core = find_topic(topics, "s1-3-1-polynomial-function-core")
    core["title"] = "餘式定理與因式定理"
    core["chapterRole"] = "主題"
    core["parentId"] = root_id
    core["usage"] = [
        "快速判斷根與因式，並把除法問題改寫成代值問題。"
    ]
    core["examples"] = [
        "若 $f(2)=0$，則 $(x-2)$ 是因式；若除以 $(x-2)$，餘式就是 $f(2)$。"
    ]
    core["tips"] = [
        "遇到餘數問題先想代值，遇到因式問題先想根是否讓函數值變成 0。"
    ]
    core["notes"] = [
        "來源主軸：高一上全重點_易讀版.docx / 單元9 主題3：餘式定理與因式定理",
        "原本的章級核心改成正式主題，掛到多項式函數主軸底下。"
    ]
    core["mistakes"] = [
        "把除式 $ax-b$ 直接誤代成 $f(a)$，沒有先轉成對應根 $\\frac{b}{a}$。"
    ]


def reorder_topics(formula_db: dict) -> None:
    topics = formula_db.get("topics", [])
    id_to_topic = {str(topic.get("id", "")).strip(): topic for topic in topics}

    prioritized_ids = [
        "senior-real-number-overview",
        "s1-1-1-real-number-core",
        "senior-rational-number-definition",
        "senior-decimal-type-rational",
        "senior-repeating-decimal-to-fraction",
        "senior-terminating-decimal-denominator-test",
        "senior-rational-density",
        "senior-rounding-rational-constraints",
        "senior-irrational-number-basics",
        "senior-square-root-perfect-square",
        "senior-irrational-operations",
        "senior-proof-irrational-square-root-two",
        "senior-radical-simplification-real",
        "senior-real-line-interval-notation",
        "senior-real-number-interval-compare",
        "senior-radical-comparison-methods",
        "senior-arithmetic-geometric-mean",
        "senior-distance-midpoint-section-formulas",
        "senior-line-equation",
        "s1-2-1-line-equations-core",
        "senior-coordinate-system-s121",
        "senior-line-slope-basics",
        "senior-line-equation-forms",
        "senior-line-point-line-distance-projection",
        "senior-line-point-line-distance-projection-s121",
        "senior-line-parallel-perpendicular-bisector",
        "senior-line-two-variable-system-geometry",
        "senior-line-angle-between-lines-s121",
        "senior-line-parametric-form-s121",
        "senior-line-form-conversion-strategy-s121",
        "senior-line-bisector-equations-s121",
        "senior-line-linear-inequality-half-plane",
        "senior-line-same-opposite-side-criterion",
        "senior-line-half-plane-sign-test-s121",
        "senior-line-same-opposite-side-product-test-s121",
        "senior-line-triangle-centers-guest",
        "senior-line-centroid",
        "senior-line-incenter-circumcenter-orthocenter",
        "senior-line-excenter",
        "senior-triangle-five-centers-quick-sheet-s121",
        "senior-polynomial-function-overview-s131",
        "senior-polynomial-basic-concepts-s131",
        "senior-polynomial-arithmetic-s131",
        "s1-3-1-polynomial-function-core",
    ]

    prioritized = [id_to_topic[topic_id] for topic_id in prioritized_ids if topic_id in id_to_topic]
    prioritized_set = {topic["id"] for topic in prioritized}
    remainder = [topic for topic in topics if str(topic.get("id", "")).strip() not in prioritized_set]
    formula_db["topics"] = remainder + prioritized


def build_overview_entry(
    group_name: str,
    editable_text: str,
    editable_rows: list[list[str]],
    original_intro: str,
    original_rows: list[list[str]],
) -> dict:
    return {
        "groupName": group_name,
        "title": "章節重點大綱",
        "updatedAt": now_iso(),
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": editable_text,
                    },
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": editable_rows,
                    },
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": original_intro,
                    },
                    {
                        "type": "table",
                        "headers": ["Word 主題", "定位", "內容焦點"],
                        "rows": original_rows,
                    },
                ],
            },
        ],
    }


def sync_overviews(overview_db: dict) -> None:
    overview_db["overviews"]["s1-1-1"] = build_overview_entry(
        "高中・高一上・實數",
        "1. 這章正式改以 Word 的四個主題當主軸：有理數、無理數、實數與數線、距離與分點公式。\n\n2. 看到題目時，先分清楚它是在考分類、表示、大小比較，還是距離與分點，不要一開始就急著算。\n\n3. 這章建議先讀 單元 1 實數 的整體架構，再依序進到四個主題；原本的「實數分類與基本性質」改成導覽節點，幫你先抓讀題方向。\n\n4. 這章最容易錯的是把有理數、無理數、近似值與精確值混在一起，或把根式、數線與距離觀念分開學。",
        [
            ["單元 1 實數", "主角", "先看整章主線，再展開四個主題"],
            ["有理數的定義與性質", "主題", "有限小數與循環小數\n循環小數化分數\n有限小數的分母判斷\n有理數的稠密性\n四捨五入反推分數"],
            ["無理數", "主題", "無理數四則與封閉性陷阱\n平方根與完全平方數\n根號 2 為無理數的反證法\n根式化簡與同類根式"],
            ["實數與數線", "主題", "實數大小比較與夾值\n根式大小比較方法\n算術平均與幾何平均"],
            ["距離與分點公式", "主題", "中點、內分、外分都收在這裡"],
            ["實數分類與基本性質", "教學補充", "保留為導覽節點，先抓讀題方向"],
        ],
        "先把「數的分類」和「數線觀念」建立好，後面絕對值、根式、坐標都會更順。",
        [
            ["有理數的定義與性質", "正式主題", "有理數定義、有限/循環小數、最簡分數與有限小數判斷"],
            ["無理數", "正式主題", "無理數判斷、封閉性陷阱、反證法"],
            ["實數與數線", "正式主題", "實數分類、數線、大小關係、算幾不等式"],
            ["距離與分點公式", "正式主題", "距離、中點、內分、外分"],
        ],
    )

    overview_db["overviews"]["s1-2-1"] = build_overview_entry(
        "高中・高一上・直線方程式",
        "1. 這章正式改以 Word 的四個主題當主軸：坐標系、直線斜率、直線方程式、二元一次不等式。\n\n2. 看到題目時，先分清楚它是在考位置與距離、斜率、方程式表示法，還是半平面判斷；這樣選公式會穩很多。\n\n3. 這章建議先從 直線方程式 這個章級主軸進來，再依序展開四個 Word 主題；原本的「直線方程式與斜率」改成導覽節點。\n\n4. 這章最容易錯的是把斜率分母寫反、距離公式代號漏絕對值，或把不等式邊界線與塗色側看反。",
        [
            ["直線方程式", "主角", "整章主軸，往下分成四個 Word 主題"],
            ["坐標系", "主題", "點、距離、中點、內分、外分先在這裡建立"],
            ["直線斜率", "主題", "先把斜率定義與幾何意義抓穩"],
            ["直線方程式", "主題", "多種表示法\n點到直線距離\n平行垂直\n角平分線\n參數式\n五心速查"],
            ["二元一次不等式", "主題", "半平面判別\n同側異側\n測試點法"],
            ["直線方程式與斜率", "教學補充", "保留為導覽節點，先讀再展開"],
        ],
        "坐標幾何最重要的是把圖形和代數式連起來看。公式很多，但都圍繞著距離、斜率、位置關係。",
        [
            ["坐標系", "正式主題", "點、投影、距離、中點、分點、重心與面積"],
            ["直線斜率", "正式主題", "斜率定義、平行垂直、讀圖方向"],
            ["直線方程式", "正式主題", "點斜式、一般式、截距式、距離與對稱"],
            ["二元一次不等式", "正式主題", "邊界線、半平面、測試點與同側異側"],
        ],
    )

    overview_db["overviews"]["s1-3-1"] = build_overview_entry(
        "高中・高一上・多項式函數",
        "1. 這章正式改以 Word 的三個主題當主軸：多項式基本概念、多項式四則運算、餘式定理與因式定理。\n\n2. 看到題目時，先分清楚它是在考結構辨認、四則運算，還是餘式與因式，不要把多項式、方程式、函數三件事混成同一題型。\n\n3. 這章現在補上一個章級主角「多項式函數」，方便先抓主線，再往下展開三個正式主題。\n\n4. 這章最容易錯的是缺項沒補 0、把非多項式誤當多項式，或遇到一次除式時沒有正確把根和餘式對起來。",
        [
            ["多項式函數", "主角", "先抓次數、係數、運算與定理三條主線"],
            ["多項式基本概念", "主題", "多項式定義\n次數\n係數\n常數項\n首項係數"],
            ["多項式四則運算", "主題", "加減乘除\n長除法\n綜合除法\n次數規則"],
            ["餘式定理與因式定理", "主題", "代值抓餘式\n因式與根的對應\n一次除式延伸"],
        ],
        "多項式的核心是「次數」與「係數」。先把這兩件事看懂，後面的餘式、因式、圖形才會連得起來。",
        [
            ["多項式基本概念", "正式主題", "標準型、次數、係數、常數項與多項式判斷"],
            ["多項式四則運算", "正式主題", "加減乘除、長除法、綜合除法與次數規則"],
            ["餘式定理與因式定理", "正式主題", "餘式、根、因式三者的對應"],
        ],
    )

    overview_db.setdefault("meta", {})
    overview_db["meta"]["updatedAt"] = now_iso()


def main() -> None:
    formula_db = load_json(FORMULA_DB_PATH)
    overview_db = load_json(OVERVIEW_DB_PATH)

    topics = formula_db.get("topics", [])
    sync_s1_1_1(topics)
    sync_s1_2_1(topics)
    sync_s1_3_1(topics)
    reorder_topics(formula_db)
    formula_db.setdefault("meta", {})
    formula_db["meta"]["updatedAt"] = now_iso()

    sync_overviews(overview_db)

    save_json(FORMULA_DB_PATH, formula_db)
    save_json(OVERVIEW_DB_PATH, overview_db)
    print("Updated s1-1-1, s1-2-1, s1-3-1 in formula-db and chapter-overview-db.")


if __name__ == "__main__":
    main()
