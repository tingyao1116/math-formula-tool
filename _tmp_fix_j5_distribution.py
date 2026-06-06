import copy
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB = ROOT / "program-db" / "database"
NOW = "2026-06-04"


def read(name):
    return json.loads((DB / name).read_text(encoding="utf-8-sig"))


def write(name, data):
    (DB / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


SECTIONS = {
    "j5-1-1": "連比",
    "j5-1-2": "比例線段",
    "j5-1-3": "縮放與相似",
    "j5-1-4": "相似三角形與其應用",
}

GROUPS = {code: f"國中・國三上・{title}" for code, title in SECTIONS.items()}

INTRO = {
    "j5-1-1": "1. 這一章先把兩個量的比延伸到三個以上的量，重點是看懂「同一個倍數」如何同時控制多個數量。\n\n2. 看到連比題時，先確認比的順序，再用共同倍數表示各量；若題目給部分和、差或總量，就用方程式找倍數。\n\n3. 學會連比後，後面的比例線段與相似形會更好銜接，因為它們都在處理對應量的固定倍數關係。",
    "j5-1-2": "1. 這一章把比例放進幾何圖形中，核心是找出對應線段，並判斷何時能由平行線得到比例。\n\n2. 看到圖形題時，先找平行線、中點或對應邊，再決定使用平行線截比例線段、三角形中點連線或比例反推平行。\n\n3. 不要只背比例式，真正重要的是線段順序與對應關係。",
    "j5-1-3": "1. 這一章先建立縮放與相似的語言：圖形可以變大或變小，但角度不變、對應邊保持固定比例。\n\n2. 判斷相似時，先確認對應點與對應邊，再使用角相等或邊成比例的條件。\n\n3. 這章是從比例線段走向相似三角形應用的橋。",
    "j5-1-4": "1. 這一章集中在相似三角形的判別與應用，重點是從圖形中找出對應三角形，再把邊長、周長、面積或高度轉成比例。\n\n2. 題目常把相似藏在平行線、直角三角形、影子、鏡面反射或間接測量中；先找相等角，再寫出正確的對應邊。\n\n3. 舊的「相似三角形應用」已併入本章，不再另開一章。",
}

TOPICS = {
    "j5-1-1": [
        ("連比的意義", "三個以上的量用同一個比序比較，順序不能交換。"),
        ("共同倍數表示法", "若 A:B:C=a:b:c，可設 A=ak, B=bk, C=ck。"),
        ("最簡整數連比", "把分數比、小數比或多組比例化成互質整數連比。"),
    ],
    "j5-1-2": [
        ("比例線段的基本語言", "分清同類量、對應線段與比例式順序。"),
        ("平行線截比例線段性質", "平行線會在三角形或多條截線上造成對應線段成比例。"),
        ("用比例線段求未知長度", "由比例式建立方程式，求線段或分點位置。"),
    ],
    "j5-1-3": [
        ("圖形的縮放", "縮放後角度不變，對應邊依倍率同步變化。"),
        ("相似形的意義", "對應角相等且對應邊成比例，圖形才相似。"),
        ("相似多邊形與對應邊", "先確認對應頂點順序，再比較邊長、周長與面積。"),
    ],
    "j5-1-4": [
        ("相似三角形判別", "AA、SSS、SAS 是判斷兩三角形相似的主線。"),
        ("相似三角形線段與面積比", "對應高、中線、角平分線、周長比等於相似比，面積比為相似比平方。"),
        ("直角三角形與測量應用", "斜邊高母子相似、影子、鏡面反射與間接測量。"),
    ],
}

CLOSING = {
    "j5-1-1": "1. 連比不是新的公式，而是把「同一個倍數」同時套到三個以上的量。\n\n2. 解題時先確認順序，再設共同倍數 \\(k\\)。只要順序抓對，總和、差、部分和都能化成一元一次方程式。\n\n3. 最容易錯的是把比的數字直接當答案，或把三項順序看反。",
    "j5-1-2": "1. 比例線段的核心是「對應」：哪一段對哪一段，先看清楚再寫比例式。\n\n2. 平行線、中點與比例反性質是本章的三條主線。看到圖形題不要急著算，先標出平行、對應與未知量。",
    "j5-1-3": "1. 縮放與相似要先抓住：角度不變、邊長按同一倍率變化。\n\n2. 題目如果只給邊或只給角，要先判斷是否足以推出相似，再進入計算。",
    "j5-1-4": "1. 相似三角形應用的關鍵，是先證明或判斷相似，再把對應邊、周長、面積或高度放進正確比例。\n\n2. 舊的相似三角形應用已併入本章，不另保留一個重複章節。",
}


def make_overview(code):
    return {
        "groupName": GROUPS[code],
        "title": "章節重點大綱",
        "updatedAt": NOW,
        "variants": [
            {
                "sections": [
                    {"type": "paragraph", "heading": "章節前言", "text": INTRO[code]},
                    {
                        "type": "table",
                        "heading": "主題導覽",
                        "headers": ["主題", "學習重點"],
                        "rows": [[topic, note] for topic, note in TOPICS[code]],
                    },
                ]
            }
        ],
    }


def relabel_body(entry, code):
    entry = copy.deepcopy(entry)
    entry["groupName"] = GROUPS[code]
    entry["updatedAt"] = NOW
    for variant in entry.get("variants", []):
        for section in variant.get("sections", []):
            if section.get("type") == "image":
                section["src"] = f"data/chapter-overview-originals/{code}-original.png"
                section["caption"] = f"{SECTIONS[code]}原稿截圖"
    return entry


def make_chain_body():
    return {
        "groupName": GROUPS["j5-1-1"],
        "title": "章節正文",
        "updatedAt": NOW,
        "variants": [
            {
                "sections": [
                    {
                        "type": "bullet-list",
                        "heading": "核心概念",
                        "items": [
                            {"label": "連比的意義", "text": "連比用來同時比較三個以上的量，例如 \\(a:b:c=2:3:5\\)，表示三個量可同時寫成 \\(2k,3k,5k\\)。"},
                            {"label": "順序不能交換", "text": "\\(A:B:C\\) 的順序對應到題目中的三個量，換順序就代表不同的量，比例式會改變。"},
                            {"label": "共同倍數表示法", "text": "若已知 \\(A:B:C=m:n:p\\)，通常設 \\(A=mk, B=nk, C=pk\\)，再用總和、差或題目條件求 \\(k\\)。"},
                            {"label": "化成最簡整數連比", "text": "遇到分數或小數的比，先同乘最小公倍數或適當倍數，再約成互質整數。"},
                        ],
                    },
                    {
                        "type": "bullet-list",
                        "heading": "常見題型",
                        "items": [
                            {"label": "已知總量求各量", "text": "先設三個量為連比各項乘上同一個 \\(k\\)，再由總和求出每一個量。"},
                            {"label": "已知差或部分和", "text": "把差或部分和轉成 \\((m-n)k\\) 或 \\((m+n)k\\)，再求倍數 \\(k\\)。"},
                            {"label": "多組比例合併", "text": "例如 \\(A:B=2:3\\)、\\(B:C=4:5\\)，先把共同項 \\(B\\) 調成相同，再合併成 \\(A:B:C\\)。"},
                            {"label": "最簡連比判斷", "text": "最後要檢查三項是否仍有共同因數，並確認題目要求的是比例還是實際數量。"},
                        ],
                    },
                ]
            }
        ],
    }


def formula_record(id_, title, chapter, section, parent, formula_text, explanation, notes=None):
    return {
        "id": id_,
        "title": title,
        "formula": {"type": "labeled-lines", "lines": [{"label": "觀念", "values": [formula_text]}]},
        "explanation": explanation,
        "category": "國中・國三上",
        "section": section,
        "parentId": parent,
        "tags": [chapter, section, title],
        "related": [],
        "examples": [],
        "notes": notes or explanation,
        "chapter_code": chapter,
        "grade": "國中",
        "book": "國三上",
        "chapter": "比例與相似",
        "chapterCode": chapter,
    }


chapter = read("chapter-code-db.json")
for code, section in SECTIONS.items():
    chapter["catalog"][code]["chapter"] = "比例與相似"
    chapter["catalog"][code]["section"] = section
chapter["meta"]["updatedAt"] = NOW
write("chapter-code-db.json", chapter)

overview = read("chapter-overview-db.json")
for code in SECTIONS:
    overview["overviews"][code] = make_overview(code)
overview["meta"]["updatedAt"] = NOW
write("chapter-overview-db.json", overview)

body = read("chapter-overview-body-db.json")
bodies = body["bodies"]
source_12 = copy.deepcopy(bodies.get("j5-1-2"))
source_13 = copy.deepcopy(bodies.get("j5-1-3"))
bodies["j5-1-1"] = make_chain_body()
if source_12 and "?" not in source_12.get("groupName", ""):
    bodies["j5-1-3"] = relabel_body(source_12, "j5-1-3")
if source_13 and "?" not in source_13.get("groupName", ""):
    bodies["j5-1-4"] = relabel_body(source_13, "j5-1-4")
if "j5-1-2" in bodies:
    bodies["j5-1-2"]["groupName"] = GROUPS["j5-1-2"]
    bodies["j5-1-2"]["updatedAt"] = NOW
    for variant in bodies["j5-1-2"].get("variants", []):
        for section in variant.get("sections", []):
            if section.get("type") == "image":
                section["src"] = "data/chapter-overview-originals/j5-1-2-original.png"
                section["caption"] = "比例線段原稿截圖"
body["meta"]["updatedAt"] = NOW
write("chapter-overview-body-db.json", body)

closing = read("chapter-closing-db.json")
for code in SECTIONS:
    closing["closings"][code] = {
        "groupName": GROUPS[code],
        "title": "章節後話",
        "updatedAt": NOW,
        "variants": [{"sections": [{"type": "paragraph", "heading": "收束提醒", "text": CLOSING[code]}]}],
    }
closing["meta"]["updatedAt"] = NOW
write("chapter-closing-db.json", closing)

formula = read("formula-db.json")
topics = formula["topics"]
ids = {topic.get("id") for topic in topics}

for topic in topics:
    topic_id = topic.get("id")
    if topic_id == "j5-1-2-ratio-language":
        topic["chapter_code"] = "j5-1-2"
        topic["chapterCode"] = "j5-1-2"
        topic["section"] = "比例線段"
        topic["parentId"] = "j5-1-2-main-core-ratio-language"
        topic["tags"] = ["j5-1-2", "比例線段", "比例線段的基本語言"]
    if topic_id == "j5-1-1-main-theme-ratio-language":
        topic["title"] = "連比的意義與共同倍數"
        topic["section"] = "連比"
        topic["parentId"] = "j5-1-1-main-root-ratio-chain"
        topic["tags"] = ["j5-1-1", "連比", "共同倍數"]
        topic["explanation"] = ["連比用同一個倍數描述三個以上的量。", "若 A:B:C=a:b:c，可設 A=ak, B=bk, C=ck。"]
        topic["notes"] = ["先確認量的順序，再設共同倍數。"]
    if topic_id == "j5-1-1-main-core-ratio-language":
        topic["title"] = "用共同倍數解連比"
        topic["section"] = "連比"
        topic["parentId"] = "j5-1-1-main-theme-ratio-language"
        topic["tags"] = ["j5-1-1", "連比", "共同倍數"]
        topic["explanation"] = ["把連比各項同乘同一個 k，再由總和、差或部分和求 k。"]
        topic["notes"] = ["常見錯誤：把比的數字直接當答案，忘了求實際量。"]
    if topic_id == "j5-1-2-main-root-parallel-intercept":
        topic["title"] = "比例線段"
        topic["section"] = "比例線段"
        topic["tags"] = ["j5-1-2", "比例線段"]
        topic["notes"] = ["先看比例線段這章的主題主線，再往下展開平行線與未知長度分支。", "這層是 j5-1-2 的正式章節主軸。"]
        if isinstance(topic.get("formula"), dict):
            for line in topic["formula"].get("lines", []):
                if line.get("label") in {"主題", "大類", "觀念"}:
                    line["values"] = ["\\text{比例線段}"]
    if topic.get("chapterCode") == "j5-1-2":
        topic["section"] = "比例線段"
        topic.setdefault("tags", [])
        if "j5-1-2" not in topic["tags"]:
            topic["tags"].append("j5-1-2")
        if "比例線段" not in topic["tags"]:
            topic["tags"].append("比例線段")
    if topic.get("chapterCode") == "j5-1-4":
        topic["section"] = "相似三角形與其應用"
        topic.setdefault("tags", [])
        if "j5-1-4" not in topic["tags"]:
            topic["tags"].append("j5-1-4")
        if "相似三角形與其應用" not in topic["tags"]:
            topic["tags"].append("相似三角形與其應用")

new_records = [
    ("j5-1-1-chain-ratio-meaning", "連比的基本語言", "j5-1-1", "連比", "j5-1-1-main-core-ratio-language", "\\text{若 }A:B:C=a:b:c\\text{，則 }A=ak,B=bk,C=ck", ["連比描述三個以上量的倍數關係。"]),
    ("j5-1-1-chain-ratio-sum", "已知總量或差求各量", "j5-1-1", "連比", "j5-1-1-main-core-ratio-language", "A:B:C=a:b:c,\\ A+B+C=(a+b+c)k", ["總量、部分和、差都先化成 k 的方程式。"]),
    ("j5-1-1-chain-ratio-merge", "多組比例合併成連比", "j5-1-1", "連比", "j5-1-1-main-core-ratio-language", "A:B=m:n,\\ B:C=p:q\\Rightarrow\\text{先統一 }B", ["共同項先調成相同，再合併三項連比。"]),
    ("j5-1-1-chain-ratio-simplify", "分數與小數連比化簡", "j5-1-1", "連比", "j5-1-1-main-core-ratio-language", "\\text{同乘公倍數，再約成互質整數連比}", ["分數比先清分母，小數比先放大成整數。"]),
    ("j5-1-2-main-theme-ratio-language", "比例線段的基本語言", "j5-1-2", "比例線段", "j5-1-2-main-root-parallel-intercept", "\\text{同類量才能比，對應順序要一致。}", ["比例線段先看對應，再寫比例式。"]),
    ("j5-1-2-main-core-ratio-language", "比例線段的基本語言", "j5-1-2", "比例線段", "j5-1-2-main-theme-ratio-language", "a:b=c:d", ["比例線段是四個線段長度形成的比例關係。"]),
    ("j5-1-4-main-root-similarity-applications", "相似三角形與其應用", "j5-1-4", "相似三角形與其應用", "", "\\text{先證明相似，再用對應邊與面積比解題。}", ["集中相似三角形判別、直角三角形母子相似與生活測量應用。"]),
    ("j5-1-4-main-theme-similarity-applications", "相似三角形的線段與面積應用", "j5-1-4", "相似三角形與其應用", "j5-1-4-main-root-similarity-applications", "\\frac{\\text{面積比}}{}=(\\text{相似比})^2", ["對應高、周長、中線、角平分線比等於相似比；面積比等於相似比平方。"]),
    ("j5-1-4-main-core-similarity-applications", "相似三角形的線段與面積應用", "j5-1-4", "相似三角形與其應用", "j5-1-4-main-theme-similarity-applications", "\\text{找相等角}\\to\\text{判斷相似}\\to\\text{寫對應比例}", ["應用題先找相似，再計算。"]),
]

for values in new_records:
    record = formula_record(*values)
    if values[0] in ids:
        for index, topic in enumerate(topics):
            if topic.get("id") == values[0]:
                topics[index] = record
                break
    else:
        topics.append(record)
        ids.add(values[0])

formula["meta"]["updatedAt"] = NOW
formula["meta"]["count"] = len(topics)
write("formula-db.json", formula)

# Final cleanup for entries that may have been touched by a non-UTF-8 shell run.
body = read("chapter-overview-body-db.json")
body["bodies"]["j5-1-3"] = {
    "groupName": GROUPS["j5-1-3"],
    "title": "章節正文",
    "updatedAt": NOW,
    "variants": [
        {
            "sections": [
                {
                    "type": "bullet-list",
                    "heading": "核心概念",
                    "items": [
                        {"label": "圖形的縮放", "text": "縮放會讓圖形大小改變，但形狀保持一致；對應角不變，對應邊依同一倍率改變。"},
                        {"label": "相似形定義", "text": "兩個圖形若對應角相等且對應邊成比例，則稱為相似形。"},
                        {"label": "坐標平面縮放", "text": "若以原點為中心縮放 \\(k\\) 倍，點 \\(P(x,y)\\) 會變成 \\(P'(kx,ky)\\)。"},
                        {"label": "對應順序", "text": "相似題一定要先確認頂點順序，例如 \\(\\triangle ABC\\sim\\triangle DEF\\) 代表 \\(A\\leftrightarrow D\\)、\\(B\\leftrightarrow E\\)、\\(C\\leftrightarrow F\\)。"},
                    ],
                },
                {
                    "type": "bullet-list",
                    "heading": "常見題型",
                    "items": [
                        {"label": "判斷是否相似", "text": "檢查角是否相等、邊是否依同一比例縮放。"},
                        {"label": "倍率與邊長計算", "text": "先求縮放倍率，再用倍率求未知邊長或周長。"},
                        {"label": "周長與面積比較", "text": "周長比等於相似比，面積比等於相似比的平方。"},
                    ],
                },
            ]
        }
    ],
}
body["bodies"]["j5-1-4"] = {
    "groupName": GROUPS["j5-1-4"],
    "title": "章節正文",
    "updatedAt": NOW,
    "variants": [
        {
            "sections": [
                {
                    "type": "bullet-list",
                    "heading": "核心概念",
                    "items": [
                        {"label": "相似三角形判別", "text": "常用 AA、SSS、SAS 判斷兩三角形相似；先找相等角或對應邊比例，再進入計算。"},
                        {"label": "線段比與周長比", "text": "相似三角形的對應高、中線、角平分線與周長比，都等於相似比。"},
                        {"label": "面積比", "text": "相似三角形的面積比等於相似比的平方，不能直接拿邊長比當面積比。"},
                        {"label": "直角三角形母子相似", "text": "直角三角形作斜邊上的高後，原三角形與兩個小三角形互相相似，可推出常見乘積關係。"},
                    ],
                },
                {
                    "type": "bullet-list",
                    "heading": "常見題型",
                    "items": [
                        {"label": "相似證明", "text": "在蝴蝶形、疊合圖形或平行線圖形中，先找角相等，再寫出相似順序。"},
                        {"label": "生活測量", "text": "用影子、鏡面反射或標尺建立相似三角形，求無法直接測量的高度或距離。"},
                        {"label": "直角三角形求值", "text": "利用斜邊高分割出的三個相似三角形，求邊長、投影段或高。"},
                        {"label": "面積與邊長轉換", "text": "已知面積比時先開平方得到相似比，再求周長或對應線段。"},
                    ],
                },
            ]
        }
    ],
}
body["meta"]["updatedAt"] = NOW
write("chapter-overview-body-db.json", body)

formula = read("formula-db.json")
for topic in formula["topics"]:
    if topic.get("chapterCode") in SECTIONS:
        for key in ("tags", "notes", "related", "contentTypes"):
            if isinstance(topic.get(key), list):
                topic[key] = [item for item in topic[key] if not (isinstance(item, str) and "?" in item)]
        for key in ("section", "title"):
            if isinstance(topic.get(key), str) and "?" in topic[key]:
                topic[key] = SECTIONS.get(topic.get("chapterCode"), topic[key])
formula["meta"]["updatedAt"] = NOW
write("formula-db.json", formula)

print("j5-1 distribution repaired with UTF-8 text")
