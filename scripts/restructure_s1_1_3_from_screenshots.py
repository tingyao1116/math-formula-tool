from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
CHAPTER_OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
CHAPTER_CLOSING_DB = ROOT / "program-db" / "database" / "chapter-closing-db.json"
MAIN_TOPIC_OVERVIEW_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
TZ = timezone(timedelta(hours=8))

CHAPTER_CODE = "s1-1-3"
ROOT_ID = "senior-expression-operations"
THEME1_ID = "s1-1-3-main-theme-formula-radical"
THEME2_ID = "s1-1-3-main-theme-am-gm"
THEME3_ID = "s1-1-3-main-theme-advanced-transform"


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def merge_unique(items: list[str]) -> list[str]:
    seen: set[str] = set()
    merged: list[str] = []
    for item in items:
        text = str(item or "").strip()
        if not text or text in seen:
            continue
        seen.add(text)
        merged.append(text)
    return merged


def topic_template(*, topic_id: str, title: str, parent_id: str, role: str, concept_role: str = "分支") -> dict:
    return {
        "id": topic_id,
        "title": title,
        "formula": {"type": "labeled-lines", "lines": []},
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "式的運算",
        "section": "式的運算",
        "domain": "代數",
        "difficulty": "基礎",
        "chapterRole": role,
        "conceptRole": concept_role,
        "parentId": parent_id,
        "tags": [CHAPTER_CODE, title],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
        "contentTypes": ["重點整理", "觀念說明", "例題講解", "使用技巧", "注意事項", "常見錯誤"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "chapter_code": CHAPTER_CODE,
        "chapterCode": CHAPTER_CODE,
        "gradeLabel": "高一上",
        "relatedChapters": [],
        "relatedTopicIds": [],
        "isBranch": True,
    }


def set_common_fields(topic: dict, *, parent_id: str, role: str, concept_role: str, updated_at: str) -> None:
    topic["parentId"] = parent_id
    topic["chapterRole"] = role
    topic["conceptRole"] = concept_role
    topic["chapter"] = "式的運算"
    topic["section"] = "式的運算"
    topic["chapter_code"] = CHAPTER_CODE
    topic["chapterCode"] = CHAPTER_CODE
    topic["stage"] = "高中"
    topic["grade"] = "高一"
    topic["term"] = "上學期"
    topic["gradeLabel"] = "高一上"
    topic["domain"] = "代數"
    topic["modifiedAt"] = updated_at
    topic["contentTypesLocked"] = True
    topic["mathNotationLocked"] = True


def set_content(
    topic: dict,
    *,
    title: str,
    formula_lines: list[tuple[str, list[str]]],
    usage: list[str],
    examples: list[str],
    tips: list[str],
    notes: list[str],
    mistakes: list[str],
    tags: list[str],
) -> None:
    topic["title"] = title
    topic["formula"] = {
        "type": "labeled-lines",
        "lines": [{"label": label, "values": values} for label, values in formula_lines],
    }
    topic["usage"] = usage
    topic["examples"] = examples
    topic["tips"] = tips
    topic["notes"] = notes
    topic["mistakes"] = mistakes
    topic["tags"] = merge_unique(tags)
    topic["contentTypes"] = ["重點整理", "觀念說明", "例題講解", "使用技巧", "注意事項", "常見錯誤"]


def ensure_topic(topics_by_id: dict[str, dict], topics: list[dict], *, topic_id: str, title: str, parent_id: str, role: str, concept_role: str) -> dict:
    topic = topics_by_id.get(topic_id)
    if topic is None:
        topic = topic_template(topic_id=topic_id, title=title, parent_id=parent_id, role=role, concept_role=concept_role)
        topics.append(topic)
        topics_by_id[topic_id] = topic
    return topic


def update_main_topic_entry(data: dict, *, topic_id: str, title: str, rows: list[list[str]], updated_at: str, original_note: str) -> None:
    entry = data["byId"].get(topic_id)
    if entry is None:
        entry = {
            "id": topic_id,
            "title": title,
            "updatedAt": updated_at,
            "variants": [
                {
                    "id": "editable",
                    "label": "可修改版",
                    "sections": [{"type": "table", "headers": ["分支", "整理"], "rows": rows}],
                },
                {
                    "id": "original",
                    "label": "原稿版",
                    "sections": [{"type": "paragraph", "text": original_note}],
                },
            ],
        }
        data["byId"][topic_id] = entry
        return

    entry["title"] = title
    entry["updatedAt"] = updated_at
    editable = next((variant for variant in entry.get("variants", []) if variant.get("id") == "editable"), None)
    if editable is None:
        entry.setdefault("variants", []).append(
            {"id": "editable", "label": "可修改版", "sections": [{"type": "table", "headers": ["分支", "整理"], "rows": rows}]}
        )
    else:
        table = next((section for section in editable.get("sections", []) if section.get("type") == "table"), None)
        if table is None:
            editable.setdefault("sections", []).append({"type": "table", "headers": ["分支", "整理"], "rows": rows})
        else:
            table["headers"] = ["分支", "整理"]
            table["rows"] = rows

    original = next((variant for variant in entry.get("variants", []) if variant.get("id") == "original"), None)
    if original is None:
        entry.setdefault("variants", []).append({"id": "original", "label": "原稿版", "sections": [{"type": "paragraph", "text": original_note}]})
    else:
        paragraph = next((section for section in original.get("sections", []) if section.get("type") == "paragraph"), None)
        if paragraph is None:
            original.setdefault("sections", []).append({"type": "paragraph", "text": original_note})
        else:
            paragraph["text"] = original_note


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    question_db = load_json(QUESTION_DB)
    chapter_overview_db = load_json(CHAPTER_OVERVIEW_DB)
    chapter_closing_db = load_json(CHAPTER_CLOSING_DB)
    main_topic_overview_db = load_json(MAIN_TOPIC_OVERVIEW_DB)

    topics = formula_db["topics"]
    topics_by_id = {str(topic.get("id", "")).strip(): topic for topic in topics}

    root = topics_by_id[ROOT_ID]
    root["title"] = "單元 3 式的運算"
    set_common_fields(root, parent_id="", role="主角", concept_role="章節", updated_at=updated_at)
    root["formula"] = {
        "type": "labeled-lines",
        "lines": [
            {"label": "章節定位", "values": [r"\text{把公式、根式、不等式與進階變形整理成可操作的工具鏈}"]},
            {"label": "學習順序", "values": [r"\text{基礎公式}\rightarrow\text{根式與求值}\rightarrow\text{AGM 最值}\rightarrow\text{高階變形}"]},
        ],
    }
    root["usage"] = ["先分清題目是在考公式展開、根式整理、最值判斷，還是高階變形。"]
    root["examples"] = ["這一章不只背公式，更重點是會判斷哪一種題型要用哪一類工具。"]
    root["tips"] = ["若式子很亂，先觀察結構：是不是平方差、立方和差、共軛，或可配成固定和積。"]
    root["notes"] = ["本章整理成三個主題，主題下只保留第一層分支，不再額外留同名包裝層。"]
    root["mistakes"] = ["不要只看題目表面形式，沒先判斷結構就直接硬算。"]
    root["tags"] = merge_unique([CHAPTER_CODE, "式的運算", "章節總覽"])
    root["contentTypes"] = ["重點整理", "觀念說明", "使用技巧", "注意事項", "常見錯誤"]

    theme1 = topics_by_id[THEME1_ID]
    set_common_fields(theme1, parent_id=ROOT_ID, role="主題", concept_role="主題", updated_at=updated_at)
    set_content(
        theme1,
        title="乘法公式、分式與根式的運算",
        formula_lines=[
            ("主軸", [r"\text{先辨認公式結構，再決定是展開、求值、分式化簡還是根式整理}"]),
            ("關鍵提醒", [r"\text{很多分式題其實先靠因式分解；很多根式題其實先靠乘法公式}"]),
        ],
        usage=["主題 1 先處理最常見的代數運算工具，讓後面的倒數型、對稱式與根式估值有基礎可接。"],
        examples=["看到題目先判斷它比較像公式題、分式題、根式題，還是混合型求值題。"],
        tips=["分式常常要先因式分解；根式常常要先化成可套公式的形狀。"],
        notes=["這一層只保留主題定位，真正教學內容往下拆成五個分支。"],
        mistakes=["把分式、根式與乘法公式當成完全分開的章節，反而看不出它們會互相支援。"],
        tags=[CHAPTER_CODE, "主題", "乘法公式", "分式", "根式"],
    )

    theme2 = topics_by_id[THEME2_ID]
    set_common_fields(theme2, parent_id=ROOT_ID, role="主題", concept_role="主題", updated_at=updated_at)
    set_content(
        theme2,
        title="算幾不等式（AGM）",
        formula_lines=[
            ("主軸", [r"\frac{a+b}{2}\ge \sqrt{ab}\quad(a,b\ge 0)"]),
            ("提醒", [r"\text{先檢查非負，再看是固定和求積，還是固定積求和}"]),
        ],
        usage=["主題 2 把算幾不等式拆成定義、等號、最大面積與最小值四個入口，比原本整包『最值』更容易教。"],
        examples=["有些題目不是原式就能套 AGM，而是要先配成兩項、看出固定和或固定積。"],
        tips=["如果條件裡已經出現和固定、積固定、長方形面積，通常就是 AGM 的訊號。"],
        notes=["這裡不再保留『算幾不等式 → 算幾不等式』那層重複包裝。"],
        mistakes=["只背公式，不檢查變數是否非負，或沒注意等號何時成立。"],
        tags=[CHAPTER_CODE, "主題", "算幾不等式", "AGM"],
    )

    theme3 = ensure_topic(
        topics_by_id,
        topics,
        topic_id=THEME3_ID,
        title="進階變形、因式分解與高階有理化",
        parent_id=ROOT_ID,
        role="主題",
        concept_role="主題",
    )
    set_common_fields(theme3, parent_id=ROOT_ID, role="主題", concept_role="主題", updated_at=updated_at)
    set_content(
        theme3,
        title="進階變形、因式分解與高階有理化",
        formula_lines=[
            ("主軸", [r"\text{把較高階的公式、三次根式有理化與進階因式分解收成同一條進階路線}"]),
            ("提醒", [r"\text{主題 3 以截圖決定分支，以 MD 校正三次根式有理化公式}"]),
        ],
        usage=["主題 3 用來承接主題 1 沒有展開處理的進階內容，避免高階公式和基礎運算混成一團。"],
        examples=["如果題目出現三項立方式、四次式補項或三次根式分母，就通常落在這條主題。"],
        tips=["先辨認是『高階公式』、『高階有理化』還是『特殊因式分解』，才不會選錯工具。"],
        notes=["依你的要求，主題 3 只保留第一層分支，不再把巴斯卡、雙十字等內容拆成次分支。"],
        mistakes=["把三次根式有理化誤當成二次根式共軛處理，或直接照錯誤符號硬背。"],
        tags=[CHAPTER_CODE, "主題", "高階變形", "因式分解", "有理化"],
    )

    branch_specs = [
        {
            "id": "senior-multiplication-identities-expansion-s113",
            "title": "基礎乘法公式",
            "parent": THEME1_ID,
            "formula_lines": [
                ("完全平方", [r"(a\pm b)^2=a^2\pm 2ab+b^2"]),
                ("平方差", [r"(a+b)(a-b)=a^2-b^2"]),
                ("三項平方", [r"(a+b+c)^2=a^2+b^2+c^2+2(ab+bc+ca)"]),
                ("和立方與差立方", [r"(a\pm b)^3=a^3\pm 3a^2b+3ab^2\pm b^3"]),
                ("立方和與立方差", [r"a^3\pm b^3=(a\pm b)(a^2\mp ab+b^2)"]),
            ],
            "usage": [
                "這一支是整章最基本的工具，先把公式看熟，後面對稱式、倒數型、補項分解才不會一直卡住。",
                "雖然主題名稱含有分式，但很多分式題的第一步仍然是靠這些公式與因式分解來整理結構。",
            ],
            "examples": [
                r"展開 \((x-2)^2\) 時，要直接看成完全平方公式，而不是逐項慢慢乘。",
                r"看到 \(x^2-9\) 時，要立刻想到平方差，可分解成 \((x-3)(x+3)\)。",
                r"若要處理 \(a^3+b^3\)，先辨認成和立方，再配上對應的二次因式。",
            ],
            "tips": [
                "教學時可把五個公式分成『平方類』與『立方類』，學生比較容易整理記憶。",
                "若題目很長，先觀察有沒有重複平方、對稱項或兩數和差的影子。",
            ],
            "notes": [
                "這一支同時承接原本的乘法公式展開、立方和差與部分分式前置技巧。",
                "有些分式化簡雖然題型不叫『乘法公式』，但實際第一步常是先做平方差或立方和差分解。",
            ],
            "mistakes": [
                "把 \((a+b)^2\) 寫成 \(a^2+b^2\)，漏掉中間項。",
                "看到立方和差時，只記得一次因式，忘了後面的二次因式。",
            ],
            "tags": [CHAPTER_CODE, "乘法公式", "平方差", "立方和差", "分支"],
        },
        {
            "id": "senior-radical-operations-rationalization-s113",
            "title": "根式的運算性質",
            "parent": THEME1_ID,
            "formula_lines": [
                ("基本運算", [r"a,b\ge 0\Rightarrow \sqrt a\sqrt b=\sqrt{ab},\ \frac{\sqrt a}{\sqrt b}=\sqrt{\frac{a}{b}}"]),
                ("雙重根號", [r"a\ge b>0\Rightarrow \sqrt{(a+b)\pm 2\sqrt{ab}}=\sqrt a\pm \sqrt b"]),
                ("提醒", [r"\text{內層根號前的係數必須是 }2\text{，才能直接套用}"]),
            ],
            "usage": [
                "這一支整理根式的基本乘除規則與雙重根號化簡，是後面根式求值與估值題的共同前置。",
                "遇到看起來很複雜的根式時，先判斷它是基本根式運算，還是其實可配成雙重根號公式。",
            ],
            "examples": [
                r"\(\sqrt{12}=2\sqrt3\)，而 \(\sqrt a\cdot \sqrt b\) 只有在 \(a,b\ge 0\) 時才能直接合併成 \(\sqrt{ab}\)。",
                r"\(\sqrt{3+2\sqrt2}=\sqrt2+1\)，因為它符合 \(\sqrt{a+b+2\sqrt{ab}}\) 的形狀。",
                r"\(\frac{1}{\sqrt5+\sqrt3}\) 這類式子，通常還要接著做分母有理化。",
            ],
            "tips": [
                "先看內層根號前面的係數是不是 2，再決定能不能直接套雙重根號公式。",
                "如果根式題同時出現加減與分式，常常要先化簡成較乾淨的根式，再做有理化或求值。",
            ],
            "notes": [
                "這一支保留截圖中的『根式運算性質』定位，不再拆成更細的次分支。",
                "原本的根式運算與分母有理化題目會先掛在這支，之後若要再細分，也應在內容內整理，不再長次分支。",
            ],
            "mistakes": [
                r"把 \(\sqrt{a+b}\) 誤拆成 \(\sqrt a+\sqrt b\)。",
                "雙重根號一看到外型像就直接套，卻沒檢查中間係數是不是 2。",
            ],
            "tags": [CHAPTER_CODE, "根式", "雙重根號", "有理化", "分支"],
        },
        {
            "id": "senior-expression-substitution-evaluation",
            "title": "對稱式求值",
            "parent": THEME1_ID,
            "formula_lines": [
                ("平方互推", [r"a^2+b^2=(a+b)^2-2ab"]),
                ("立方互推", [r"a^3+b^3=(a+b)^3-3ab(a+b)"]),
                ("高次思路", [r"\text{先由 }a+b,ab\text{ 建立低次量，再逐步推高次量}"]),
            ],
            "usage": [
                "題目若只給 \(a+b\) 和 \(ab\)，卻要你求 \(a^2+b^2\)、\(a^3+b^3\) 甚至更高次和，這一支就是主戰場。",
                "這種題型重點不在硬展開，而在看出怎麼把目標式改寫成已知量。",
            ],
            "examples": [
                r"若已知 \(a+b=5,ab=6\)，則 \(a^2+b^2=5^2-2\cdot 6=13\)。",
                r"同樣條件下，\(a^3+b^3=(a+b)^3-3ab(a+b)=125-90=35\)。",
                r"若題目再往上推到 \(a^5+b^5\)，通常要先建立遞推，而不是一次性暴力展開。",
            ],
            "tips": [
                "先問自己：目標式能不能寫成 \((a+b)\) 和 \(ab\) 的組合？這是最核心的轉換。",
                "如果式子是對稱的，就先試著用『和』與『積』來整理，而不是分別求 \(a,b\)。",
            ],
            "notes": [
                "這一支吸收原本的代換整理與部分對稱式思維，讓主題 1 的重要題型更清楚。",
                "雖然三變數對稱式屬進階內容，但兩變數對稱式求值先放在這裡比較符合截圖架構。",
            ],
            "mistakes": [
                "一看到高次求值就急著展開，算式越做越長。",
                "知道 \(a+b\) 和 \(ab\) 後，還硬要先求出 \(a,b\) 才往下算。",
            ],
            "tags": [CHAPTER_CODE, "對稱式", "求值", "代換", "分支"],
        },
        {
            "id": "senior-reciprocal-power-identities",
            "title": "倒數型變換",
            "parent": THEME1_ID,
            "formula_lines": [
                ("起點", [r"x^2-kx+1=0\Rightarrow x+\frac{1}{x}=k"]),
                ("平方", [r"\left(x+\frac{1}{x}\right)^2=x^2+2+\frac{1}{x^2}"]),
                ("立方", [r"\left(x+\frac{1}{x}\right)^3=x^3+3x+\frac{3}{x}+\frac{1}{x^3}"]),
            ],
            "usage": [
                "當題目給的方程式長成 \(x^2-kx+1=0\) 或與之等價時，先同除以 \(x\) 往往能把高次求值題降維。",
                "這種題目最重要的是建立 \(x+\frac1x\) 這個核心量，再從它推回平方和、立方和。",
            ],
            "examples": [
                r"若 \(x^2-5x+1=0\)，則同除以 \(x\) 可得 \(x+\frac1x=5\)。",
                r"接著 \(x^2+\frac1{x^2}=5^2-2=23\)。",
                r"再往上有 \(x^3+\frac1{x^3}=5^3-3\cdot 5=110\)。",
            ],
            "tips": [
                "只要常數項是 1，就要對這類變換保持敏感。",
                "先把低次量算穩，再往高次推，會比一口氣展開安全很多。",
            ],
            "notes": [
                "這一支是截圖主題 1 的重要題型之一，所以保留成獨立分支。",
                "與對稱式求值很像，但倒數型更強調先除以 \(x\) 建立新量。",
            ],
            "mistakes": [
                "看到 \(x^2-kx+1=0\) 卻沒有先想到同除以 \(x\)。",
                "算出 \(x+\frac1x\) 後，忘了平方公式中的中間項 2。",
            ],
            "tags": [CHAPTER_CODE, "倒數型", "求值", "高次和", "分支"],
        },
        {
            "id": "senior-radical-estimation-comparison-s113",
            "title": "根式整數與小數運算",
            "parent": THEME1_ID,
            "formula_lines": [
                ("整數部分", [r"k=\lfloor x\rfloor"]),
                ("小數部分", [r"b=x-k,\quad 0\le b<1"]),
                ("流程", [r"\text{先化簡或估值，再拆整數部分與小數部分}"]),
            ],
            "usage": [
                "這一支處理化簡根式後的整數部分與小數部分，是截圖主題 1 特別點出的重要題型。",
                "很多題目表面像根式化簡，真正要問的卻是整數部分、小數部分或它們的代數關係。",
            ],
            "examples": [
                r"若 \(x=\sqrt{11}\)，則 \(3<\sqrt{11}<4\)，所以整數部分是 \(3\)，小數部分是 \(\sqrt{11}-3\)。",
                r"若 \(x=\sqrt{21+\sqrt{80}}\)，常要先化簡根式，再談它的整數與小數部分。",
                r"若題目還要求 \(a+b-\frac{4}{b}\) 這類式子，就先把 \(a,b\) 表示清楚再代入。",
            ],
            "tips": [
                "先估值或先化簡，別一開始就急著談小數部分。",
                "若根式可化成 \(m+\sqrt n\) 的形式，整數部分通常會更容易判斷。",
            ],
            "notes": [
                "原本的根式估值、大小比較與部分整數小數題，在這裡收成截圖要求的單一分支。",
                "之後若還要比較根式大小，建議在內容中作為延伸技巧補充，不再另外長分支。",
            ],
            "mistakes": [
                "還沒先判斷數值範圍，就直接猜整數部分。",
                "把小數部分寫錯成『小於 1 的那一塊』但沒有用 \(x-k\) 精確表示。",
            ],
            "tags": [CHAPTER_CODE, "根式", "整數部分", "小數部分", "分支"],
        },
        {
            "id": "s1-1-3-am-gm-core",
            "title": "定義",
            "parent": THEME2_ID,
            "formula_lines": [
                ("基本式", [r"\frac{a+b}{2}\ge \sqrt{ab}\quad(a,b\ge 0)"]),
                ("名稱", [r"\frac{a+b}{2}\text{ 稱為算術平均數，}\sqrt{ab}\text{ 稱為幾何平均數}"]),
            ],
            "usage": [
                "這一支先把 AGM 的式子、適用條件與名稱講清楚，避免學生後面只會背不會判斷能不能用。",
                "教學時要反覆提醒：算幾不等式通常先檢查各項是否非負。",
            ],
            "examples": [
                r"若 \(a=4,b=9\)，則 \(\frac{a+b}{2}=6.5\)，而 \(\sqrt{ab}=6\)，確實滿足 AGM。",
                r"看到 \(x+\frac{1}{x}\ (x>0)\) 時，也常能往 AGM 的方向整理。",
            ],
            "tips": [
                "只要看到和與積同時出現，就要先想一想 AGM 能不能接上。",
                "若條件不是直接非負，可先整理變數範圍或換元後再判斷。",
            ],
            "notes": [
                "這支對應截圖主題 2 的第一個分支，專門處理基本定義與適用條件。",
                "後面最大面積與最小值其實都建立在這個基本式之上。",
            ],
            "mistakes": [
                "沒檢查變數是否非負，就直接套用 AGM。",
                "只記得不等式方向，卻不知道左右兩邊分別代表什麼平均。",
            ],
            "tags": [CHAPTER_CODE, "算幾不等式", "定義", "AGM", "分支"],
        },
        {
            "id": "senior-arithmetic-geometric-mean-s113",
            "title": "等號成立條件",
            "parent": THEME2_ID,
            "formula_lines": [
                ("等號成立", [r"\frac{a+b}{2}=\sqrt{ab}\iff a=b\quad(a,b\ge 0)"]),
                ("固定和", [r"\text{若 }a+b\text{ 固定，則 }ab\text{ 在 }a=b\text{ 時最大}"]),
                ("固定積", [r"\text{若 }ab\text{ 固定，則 }a+b\text{ 在 }a=b\text{ 時最小}"]),
            ],
            "usage": [
                "這一支專門整理『什麼時候等號會成立』，因為最值題最後幾乎都靠這一步收尾。",
                "很多題目真正要學生找到的，不只是最大或最小值，而是讓等號成立時的變數配置。",
            ],
            "examples": [
                r"若 \(a+b=8\)，則當 \(a=b=4\) 時，積 \(ab\) 最大。",
                r"若 \(ab=25\)，則當 \(a=b=5\) 時，和 \(a+b\) 最小。",
                r"若條件是 \(2a+3b=10\)，通常要先配成兩項相等的形狀，再談等號。",
            ],
            "tips": [
                "最值題做完數值後，一定再追問自己：等號是在什麼條件下成立？",
                "若係數不同，先配權重或換元，再使用『相等時取等號』的想法。",
            ],
            "notes": [
                "這一支吸收原本『算幾不等式與最值』中屬於固定和、固定積的一般型題目。",
                "它是主題 2 的核心轉折，從公式走向最值結論。",
            ],
            "mistakes": [
                "只求出最值，卻忘了寫出哪一組變數會達到等號。",
                "把『固定和積最大』和『固定積和最小』兩種情況背反了。",
            ],
            "tags": [CHAPTER_CODE, "算幾不等式", "等號成立", "最值", "分支"],
        },
        {
            "id": "s1-1-3-agm-max-area",
            "title": "最大面積問題",
            "parent": THEME2_ID,
            "formula_lines": [
                ("核心想法", [r"\text{固定周長或固定邊長關係時，常把面積配成兩數乘積後套 AGM}"]),
                ("典型模型", [r"\text{若 }x+y\text{ 固定，則 }xy\text{ 在 }x=y\text{ 時最大}"]),
            ],
            "usage": [
                "這一支專門承接圍籬、菜圃、內接矩形這些幾何應用題，把 AGM 從純代數推到圖形情境。",
                "先把面積寫成兩個正數的乘積，再看能不能把它們的和變成固定量，是最穩的流程。",
            ],
            "examples": [
                "固定總長度圍成矩形時，通常面積最大會發生在兩邊相等，也就是長方形退成正方形的情況。",
                "若有一邊靠河不必圍，則要先正確列出邊長關係，再判斷哪兩項要拿來套 AGM。",
            ],
            "tips": [
                "文字題先畫圖，別一開始就急著套公式。",
                "先確認哪些量固定，再把面積改寫成『兩數乘積』的形式。",
            ],
            "notes": [
                "這一支對應截圖中的幾何應用題型，所以特別獨立出來，方便老師帶情境題。",
                "原本算幾不等式題庫中的面積題，會改掛到這個分支底下。",
            ],
            "mistakes": [
                "邊長關係列錯，導致套 AGM 的兩個量根本不是固定和。",
                "沒先檢查變數是否為正，就直接把幾何量拿去套不等式。",
            ],
            "tags": [CHAPTER_CODE, "算幾不等式", "最大面積", "幾何應用", "分支"],
        },
        {
            "id": "s1-1-3-agm-min-value",
            "title": "最小值求法",
            "parent": THEME2_ID,
            "formula_lines": [
                ("典型形式", [r"f(x)=ax+\frac{b}{x}\quad(x>0)"]),
                ("基本結果", [r"ax+\frac{b}{x}\ge 2\sqrt{ab}\quad(x>0)"]),
                ("取等條件", [r"ax=\frac{b}{x}\Rightarrow x=\sqrt{\frac{b}{a}}"]),
            ],
            "usage": [
                "這一支用來處理代數最小值題，特別是 \(ax+\frac{b}{x}\) 這類經典形式。",
                "只要題目能整理成『正數加倒數型』或『兩正項和』，就值得先考慮 AGM。",
            ],
            "examples": [
                r"求 \(f(x)=2x+\frac{8}{x}\ (x>0)\) 的最小值，可直接由 AGM 得到最小值是 \(8\)。",
                r"若條件是 \(ab=9\)，求 \(\frac1a+\frac4b\) 的最小值，也可先改寫成兩正項後再套 AGM。",
            ],
            "tips": [
                "先把式子整理成兩個正項，再觀察它是不是『固定積求和』的型態。",
                "最小值算出來後，別忘了把等號成立時的 \(x\) 或變數條件一併寫出來。",
            ],
            "notes": [
                "這支對應截圖中的代數最小值題型，和最大面積題分開後，學生更容易抓到題型差異。",
                "若題目不是直接 \(ax+\frac{b}{x}\)，也常可先換元或抽公因數後再套用。",
            ],
            "mistakes": [
                "原式還沒整理成兩個正項，就硬套 AGM。",
                "求出下界後，沒有回頭檢查原條件下是否真的可以取到等號。",
            ],
            "tags": [CHAPTER_CODE, "算幾不等式", "最小值", "倒數型", "分支"],
        },
        {
            "id": "s1-1-3-advanced-special-identities",
            "title": "特殊高階乘法公式",
            "parent": THEME3_ID,
            "formula_lines": [
                ("三項立方", [r"a^3+b^3+c^3-3abc=(a+b+c)(a^2+b^2+c^2-ab-bc-ca)"]),
                ("推論", [r"a+b+c=0\Rightarrow a^3+b^3+c^3=3abc"]),
                ("四次方公式", [r"a^4+a^2b^2+b^4=(a^2+ab+b^2)(a^2-ab+b^2)"]),
            ],
            "usage": [
                "這一支把主題 3 最常用的高階公式集中起來，避免和主題 1 的基礎公式混在一起。",
                "若題目出現三個變數的立方和，或四次式長得很對稱，就先來這一支找公式。",
            ],
            "examples": [
                r"若已知 \(a+b+c=0\)，則 \(a^3+b^3+c^3\) 可直接改成 \(3abc\)。",
                r"像 \(x^4+x^2+1\) 或 \(a^4+a^2b^2+b^4\) 這類式子，常靠高階公式拆出漂亮因式。",
            ],
            "tips": [
                "看到三個變數時，不要只想二項公式，先檢查是不是 \(a^3+b^3+c^3-3abc\) 的結構。",
                "若四次式看起來對稱，常可用補項或看成兩個二次式相乘。",
            ],
            "notes": [
                "這一支對應截圖主題 3 的第一個分支，內容比主題 1 的基礎公式更進階。",
                "原本散在三項公式、高次式因式分解的內容，會集中掛到這裡或下一支因式分解樣式。 ",
            ],
            "mistakes": [
                "把三項立方公式誤背成只有兩項的和立方、差立方。",
                "看到四次式就急著硬拆，沒有先檢查是否符合固定公式。",
            ],
            "tags": [CHAPTER_CODE, "高階公式", "三項立方", "四次方公式", "分支"],
        },
        {
            "id": "s1-1-3-advanced-cuberoot-rationalization",
            "title": "高階根式有理化（三次根式）",
            "parent": THEME3_ID,
            "formula_lines": [
                ("和的有理化因子", [r"(\sqrt[3]{a})^2-\sqrt[3]{ab}+(\sqrt[3]{b})^2"]),
                ("和的公式", [r"(\sqrt[3]{a}+\sqrt[3]{b})(\sqrt[3]{a^2}-\sqrt[3]{ab}+\sqrt[3]{b^2})=a+b"]),
                ("差的有理化因子", [r"(\sqrt[3]{a})^2+\sqrt[3]{ab}+(\sqrt[3]{b})^2"]),
                ("差的公式", [r"(\sqrt[3]{a}-\sqrt[3]{b})(\sqrt[3]{a^2}+\sqrt[3]{ab}+\sqrt[3]{b^2})=a-b"]),
            ],
            "usage": [
                "這一支專門處理分母含三次方根的有理化，內容以 MD 的正確公式為準，不照截圖裡錯掉的符號搬。",
                "它和二次根式的共軛有理化不同，核心是利用立方和、立方差公式把分母湊成 \(a\pm b\)。",
            ],
            "examples": [
                r"若分母是 \(\sqrt[3]{3}-1\)，就要把 \(a=3,b=1\) 代進『差的有理化因子』。",
                r"若分母是 \(\sqrt[3]{a}+\sqrt[3]{b}\)，不能再用二次根式那種『改負號』的共軛想法處理。",
            ],
            "tips": [
                "先分清楚分母是和還是差，因為對應的有理化因子中間號號不同。",
                "教學時建議先從 \(x^3\pm y^3\) 的因式分解回推，學生比較知道為什麼那個因子長這樣。",
            ],
            "notes": [
                "這支是你特別提醒要校正的部分，所以後面若再改內容，應以 MD 的這組公式作為 source of truth。",
                "它屬於主題 3 的進階技巧，不應再混回主題 1 的一般根式運算。",
            ],
            "mistakes": [
                "把三次根式有理化誤當成二次根式共軛，直接改成 \(\sqrt[3]{a}-\sqrt[3]{b}\)。",
                "分母是和卻用了差的有理化因子，或反過來用錯中間符號。",
            ],
            "tags": [CHAPTER_CODE, "三次根式", "有理化", "立方和差", "分支"],
        },
        {
            "id": "s1-1-3-advanced-factorization-patterns",
            "title": "進階因式分解樣式",
            "parent": THEME3_ID,
            "formula_lines": [
                ("補項分解", [r"x^4+4=(x^2-2x+2)(x^2+2x+2)", r"x^4+x^2+1=(x^2+x+1)(x^2-x+1)"]),
                ("雙十字交乘", [r"\text{處理 }ax^2+bxy+cy^2+dx+ey+f\text{ 類六項式}"]),
                ("巴斯卡展開", [r"(a+b)^n\text{ 的係數可由巴斯卡三角形觀察}"]),
            ],
            "usage": [
                "這一支把主題 3 中和『進階因式分解』最有關的技巧收在一起，包括補項、雙十字與巴斯卡展開觀察。",
                "雖然截圖裡這些原本寫在同一段重點底下，但你要求只留第一層分支，所以這裡把它們併成一支。 ",
            ],
            "examples": [
                r"分解 \(x^4+4\) 時，不是直接硬拆，而是先補項把它看成平方差。",
                r"分解 \(x^4+x^2+1\) 時，可試著湊成 \((x^2+x+1)(x^2-x+1)\)。",
                r"若題目要你快速寫出 \((x+2)^4\) 的展開式，就可用巴斯卡三角形抓係數 \(1,4,6,4,1\)。",
            ],
            "tips": [
                "高次式因式分解最怕一開始就亂猜，先看有沒有補項、換元或對稱結構。",
                "巴斯卡三角形不只拿來背係數，更重要的是幫你快速看出二項展開的結構。 ",
            ],
            "notes": [
                "原本的高次式因式分解、補項分解、巴斯卡三角形與雙十字內容，這次都收在這一支，不再往下長次分支。",
                "如果之後想補更多例題，建議在這一支內部分段，而不是重新長出樹層。 ",
            ],
            "mistakes": [
                "看到高次式就直接試整數因式，沒有先看是不是可補成公式。",
                "把巴斯卡三角形當成死背表格，不知道它對應的是二項展開係數。",
            ],
            "tags": [CHAPTER_CODE, "因式分解", "補項", "巴斯卡", "雙十字", "分支"],
        },
        {
            "id": "s1-1-3-advanced-polynomial-approximation",
            "title": "多項式近似值（泰勒展開式）",
            "parent": THEME3_ID,
            "formula_lines": [
                ("基本型", [r"f(x)=a_n(x-c)^n+\cdots +a_1(x-c)+a_0"]),
                ("操作工具", [r"\text{利用連續綜合除法，把 }f(x)\text{ 改寫成以 }(x-c)\text{ 為底的形式}"]),
                ("常見用途", [r"\text{估 }f(c.001)\text{ 或接近 }c\text{ 的函數值}"]),
            ],
            "usage": [
                "這一支是主題 3 最抽象的部分，重點不在大規模展開，而在把多項式改寫成適合近似代入的樣子。",
                "若題目要你估 \(f(c.001)\) 這種貼近某點的值，就可以從這個分支切入。",
            ],
            "examples": [
                r"若把 \(f(x)\) 寫成以 \((x-c)\) 為底的形式，代 \(x=c.001\) 時，就能快速看出主要貢獻來自哪些項。",
                r"連續綜合除法在這裡不是只為了除法本身，而是為了整理近似值的展開型態。",
            ],
            "tips": [
                "教學時先把它講成『換底改寫』，學生通常會比直接聽到『泰勒』更容易吸收。",
                "真正代值前，先看哪幾項會因為 \((x-c)\) 很小而幾乎可以忽略。",
            ],
            "notes": [
                "這支內容比前面其他分支更偏進階，建議放在主題 3 的最後收尾。",
                "截圖與 MD 都把它放在主題 3，所以這次直接保留成獨立分支，不再拆次分支。 ",
            ],
            "mistakes": [
                "把『改寫成 \((x-c)\) 為底』誤會成一般多項式展開，沒抓到近似值的目的。",
                "沒先判斷 \((x-c)\) 很小，就把每一項都當成同樣重要。 ",
            ],
            "tags": [CHAPTER_CODE, "泰勒展開式", "近似值", "綜合除法", "分支"],
        },
    ]

    ordered_ids = [ROOT_ID, THEME1_ID]
    remove_ids = {
        "s1-1-3-algebraic-operations",
        "senior-binomial-formulas-pascal",
        "senior-cube-sum-difference-factorization",
        "senior-three-variable-identities",
        "senior-completing-square-factorization",
        "senior-rational-expression-operations-s113",
        "senior-radical-expression-identities",
        "senior-integer-bounds-from-expansion",
        "senior-high-degree-factorization-patterns",
        "senior-symmetric-polynomial-abc",
        "senior-formula-selection-flow",
    }

    for spec in branch_specs:
        branch = ensure_topic(
            topics_by_id,
            topics,
            topic_id=spec["id"],
            title=spec["title"],
            parent_id=spec["parent"],
            role="分支題型",
            concept_role="分支",
        )
        set_common_fields(branch, parent_id=spec["parent"], role="分支題型", concept_role="分支", updated_at=updated_at)
        set_content(
            branch,
            title=spec["title"],
            formula_lines=spec["formula_lines"],
            usage=spec["usage"],
            examples=spec["examples"],
            tips=spec["tips"],
            notes=spec["notes"],
            mistakes=spec["mistakes"],
            tags=spec["tags"],
        )
        ordered_ids.append(spec["id"])
        if spec["parent"] == THEME2_ID and THEME2_ID not in ordered_ids:
            ordered_ids.insert(ordered_ids.index(spec["id"]), THEME2_ID)
        if spec["parent"] == THEME3_ID and THEME3_ID not in ordered_ids:
            ordered_ids.insert(ordered_ids.index(spec["id"]), THEME3_ID)

    # Rebuild order root -> theme1 -> branches -> theme2 -> branches -> theme3 -> branches.
    ordered_ids = [
        ROOT_ID,
        THEME1_ID,
        "senior-multiplication-identities-expansion-s113",
        "senior-radical-operations-rationalization-s113",
        "senior-expression-substitution-evaluation",
        "senior-reciprocal-power-identities",
        "senior-radical-estimation-comparison-s113",
        THEME2_ID,
        "s1-1-3-am-gm-core",
        "senior-arithmetic-geometric-mean-s113",
        "s1-1-3-agm-max-area",
        "s1-1-3-agm-min-value",
        THEME3_ID,
        "s1-1-3-advanced-special-identities",
        "s1-1-3-advanced-cuberoot-rationalization",
        "s1-1-3-advanced-factorization-patterns",
        "s1-1-3-advanced-polynomial-approximation",
    ]

    keep_set = set(ordered_ids)
    remaining = [topic for topic in formula_db["topics"] if str(topic.get("id", "")).strip() not in keep_set | remove_ids]
    chapter_existing_indexes = [
        index
        for index, topic in enumerate(formula_db["topics"])
        if str(topic.get("chapterCode", "")).strip() == CHAPTER_CODE
    ]
    insert_at = chapter_existing_indexes[0] if chapter_existing_indexes else len(remaining)
    chapter_block = [topics_by_id[topic_id] for topic_id in ordered_ids]
    formula_db["topics"] = remaining[:insert_at] + chapter_block + remaining[insert_at:]
    formula_db["meta"]["updatedAt"] = updated_at

    for index, topic_id in enumerate(ordered_ids, start=1):
        topics_by_id[topic_id]["manualOrder"] = index
        topics_by_id[topic_id]["originalIndex"] = index

    question_remap = {
        "senior-cube-sum-difference-factorization": "senior-multiplication-identities-expansion-s113",
        "senior-rational-expression-operations-s113": "senior-multiplication-identities-expansion-s113",
        "senior-high-degree-factorization-patterns": "s1-1-3-advanced-factorization-patterns",
        "senior-binomial-formulas-pascal": "s1-1-3-advanced-factorization-patterns",
        "senior-completing-square-factorization": "s1-1-3-advanced-factorization-patterns",
        "senior-three-variable-identities": "s1-1-3-advanced-special-identities",
        "senior-symmetric-polynomial-abc": "s1-1-3-advanced-special-identities",
        "senior-radical-expression-identities": "senior-radical-operations-rationalization-s113",
        "senior-integer-bounds-from-expansion": "senior-radical-estimation-comparison-s113",
        "s1-1-3-algebraic-operations": "senior-multiplication-identities-expansion-s113",
        "senior-formula-selection-flow": "senior-multiplication-identities-expansion-s113",
    }

    for question in question_db.get("questions", []):
        chapter_code = str(question.get("chapterCode") or question.get("chapter_code") or "").strip()
        if chapter_code != CHAPTER_CODE:
            continue
        qid = str(question.get("id", "")).strip()
        formula_id = str(question.get("formula_id", "")).strip()
        if qid == "q-s1-1-3-0035":
            question["formula_id"] = "s1-1-3-am-gm-core"
        elif qid in {"q-s1-1-3-0036", "q-s1-1-3-0038", "q-s1-1-3-0039", "q-s1-1-3-0040"}:
            question["formula_id"] = "senior-arithmetic-geometric-mean-s113"
        elif qid == "q-s1-1-3-0037":
            question["formula_id"] = "s1-1-3-agm-min-value"
        elif qid in {"q-s1-1-3-0041", "q-s1-1-3-0042", "q-s1-1-3-0043"}:
            question["formula_id"] = "s1-1-3-agm-max-area"
        elif formula_id in question_remap:
            question["formula_id"] = question_remap[formula_id]

    overview = chapter_overview_db["overviews"][CHAPTER_CODE]
    overview["updatedAt"] = updated_at
    for variant in overview.get("variants", []):
        for section in variant.get("sections", []):
            if section.get("type") == "paragraph":
                if variant.get("id") == "editable":
                    section["text"] = (
                        "這章整理成三個主題：主題 1 聚焦在基礎乘法公式、根式運算與幾個常見求值題型；"
                        "主題 2 把算幾不等式拆成定義、等號條件、最大面積與最小值；"
                        "主題 3 則收進高階公式、三次根式有理化、進階因式分解與多項式近似值。"
                    )
                else:
                    section["text"] = "原稿重點可分成三條主題線：基礎運算、算幾不等式、進階變形與高階有理化。"
            elif section.get("type") == "table":
                section["headers"] = ["主題", "層級", "說明"]
                section["rows"] = [
                    ["乘法公式、分式與根式的運算", "主題", "只保留五個第一層分支，不再保留同名包裝層。"],
                    ["算幾不等式（AGM）", "主題", "拆成定義、等號、最大面積與最小值四個分支。"],
                    ["進階變形、因式分解與高階有理化", "主題", "新增主題 3，集中承接高階公式與三次根式有理化。"],
                ]

    closing = chapter_closing_db["closings"][CHAPTER_CODE]
    closing["updatedAt"] = updated_at
    for variant in closing.get("variants", []):
        for section in variant.get("sections", []):
            if section.get("type") == "paragraph":
                section["text"] = (
                    "學完這章後，學生應能先看出式子的結構，再決定要用乘法公式、根式整理、AGM 或進階因式分解。"
                    "如果題目長得很複雜，通常不是要硬算，而是要先判斷它屬於哪一個主題、哪一個分支。"
                    "主題 3 的三次根式有理化要特別注意，它不能再用二次根式的共軛方法處理。"
                )

    update_main_topic_entry(
        main_topic_overview_db,
        topic_id=THEME1_ID,
        title="乘法公式、分式與根式的運算",
        rows=[
            ["基礎乘法公式", "把平方、立方與和差立方公式整理成一套基本工具。"],
            ["根式的運算性質", "處理根式乘除、雙重根號與分母有理化前置觀念。"],
            ["對稱式求值", "利用和與積推回平方和、立方和等對稱式。"],
            ["倒數型變換", "由 \(x+\frac1x\) 往上推高次和。"],
            ["根式整數與小數運算", "先化簡與估值，再處理整數部分與小數部分。"],
        ],
        updated_at=updated_at,
        original_note="主題 1 依截圖整理為五個第一層分支，原本較細節的舊節點已收進分支內容。",
    )
    update_main_topic_entry(
        main_topic_overview_db,
        topic_id=THEME2_ID,
        title="算幾不等式（AGM）",
        rows=[
            ["定義", "先確認非負條件，再理解算術平均與幾何平均的關係。"],
            ["等號成立條件", "知道 \(a=b\) 時取等號，並連到固定和積的最值結論。"],
            ["最大面積問題", "把幾何情境改寫成兩正數乘積，再套 AGM。"],
            ["最小值求法", "處理 \(ax+\frac{b}{x}\) 等經典最小值型。"],
        ],
        updated_at=updated_at,
        original_note="主題 2 依截圖整理成四個分支，不再保留『算幾不等式』的中介包裝層。",
    )
    update_main_topic_entry(
        main_topic_overview_db,
        topic_id=THEME3_ID,
        title="進階變形、因式分解與高階有理化",
        rows=[
            ["特殊高階乘法公式", "整理三項立方公式與四次式公式。"],
            ["高階根式有理化（三次根式）", "依 MD 校正三次根式有理化因子與公式。"],
            ["進階因式分解樣式", "把補項、雙十字與巴斯卡展開收進同一分支。"],
            ["多項式近似值（泰勒展開式）", "用連續綜合除法改寫成以 \((x-c)\) 為底的型式。"],
        ],
        updated_at=updated_at,
        original_note="主題 3 依截圖新增，三次根式有理化公式內容以 MD 版本為準。",
    )
    main_topic_overview_db["meta"]["updatedAt"] = updated_at

    save_json(FORMULA_DB, formula_db)
    save_json(QUESTION_DB, question_db)
    save_json(CHAPTER_OVERVIEW_DB, chapter_overview_db)
    save_json(CHAPTER_CLOSING_DB, chapter_closing_db)
    save_json(MAIN_TOPIC_OVERVIEW_DB, main_topic_overview_db)
    print("Restructured s1-1-3 into three themes with branch-only layout.")


if __name__ == "__main__":
    main()
