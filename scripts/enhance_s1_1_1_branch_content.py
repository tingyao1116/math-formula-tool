from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
TZ = timezone(timedelta(hours=8))
CHAPTER_CODE = "s1-1-1"


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


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


def set_branch_content(
    topic: dict,
    *,
    formula_lines: list[tuple[str, list[str]]],
    usage: list[str],
    examples: list[str],
    tips: list[str],
    notes: list[str],
    mistakes: list[str],
    tags: list[str],
    updated_at: str,
) -> None:
    topic["formula"] = {
        "type": "labeled-lines",
        "lines": [{"label": label, "values": values} for label, values in formula_lines],
    }
    topic["usage"] = usage
    topic["examples"] = examples
    topic["tips"] = tips
    topic["notes"] = notes
    topic["mistakes"] = mistakes
    topic["tags"] = merge_unique((topic.get("tags") or []) + tags)
    topic["contentTypes"] = ["重點整理", "觀念說明", "例題講解", "使用技巧", "注意事項", "常見錯誤"]
    topic["contentTypesLocked"] = True
    topic["mathNotationLocked"] = True
    topic["modifiedAt"] = updated_at
    topic["chapter_code"] = CHAPTER_CODE
    topic["chapterCode"] = CHAPTER_CODE
    topic["chapter"] = "實數"
    topic["section"] = "實數"


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    topics = formula_db["topics"]
    by_id = {str(topic.get("id", "")).strip(): topic for topic in topics}

    set_branch_content(
        by_id["senior-rational-density"],
        formula_lines=[
            ("稠密性", [r"\text{任兩個相異有理數之間，必有另一個有理數}"]),
            ("第一步", [r"\frac{a+b}{2}"]),
            ("延伸", [r"\text{同一區間內不只一個，而是有無限多個有理數}"]),
        ],
        usage=[
            "這一支用來建立『有理數在數線上不會一格一格排完』的觀念，學生後面學實數時才不會以為有空隙。",
            "題目只要問兩數之間能不能再找到有理數、能找到幾個、怎麼構造，就回到稠密性的想法。",
        ],
        examples=[
            r"在 \(2\) 與 \(3\) 之間先取平均，可得 \(\frac{2+3}{2}=\frac52\)。",
            r"在 \(0.55\) 與 \(0.65\) 之間除了 \(0.6\) 之外，還可取 \(0.58\)、\(0.601\)、\(\frac{119}{200}\) 等。",
            r"若已知兩個有理數 \(a<b\)，則 \(\frac{a+b}{2}\) 一定仍是有理數，且落在兩者之間。",
        ],
        tips=[
            "最穩的第一步通常是取平均，因為平均一定落在兩端之間，而且計算最簡單。",
            "若老師想讓學生感受『不只一個』，可以在取到平均後，再對左半段或右半段繼續取平均。",
        ],
        notes=[
            "稠密性不是說有理數排得很近而已，而是說任何兩點之間都塞得進新的有理數。",
            "這個分支是後面理解無理數、實數與數線連續感的重要前置觀念。",
        ],
        mistakes=[
            "把小數位數很多的數誤當成『中間沒有別的數』的證據。",
            "以為兩個看起來很接近的小數之間就沒有新的有理數。",
        ],
        tags=["s1-1-1", "有理數", "稠密性", "數線", "分支"],
        updated_at=updated_at,
    )

    set_branch_content(
        by_id["senior-rounding-rational-constraints"],
        formula_lines=[
            ("反推區間", [r"\text{四捨五入後為 }A\Rightarrow A-\frac{u}{2}\le x<A+\frac{u}{2}"]),
            ("單位量", [r"u=\text{保留位數所對應的單位，例如到小數第一位時 }u=0.1"]),
            ("處理流程", [r"\text{先列區間}\rightarrow\text{再加上分數或整數條件}"]),
        ],
        usage=[
            "這一支不是只教四捨五入，而是教學生如何從近似值反推原數的可能範圍。",
            "如果題目同時要求原數是分數、整數或最簡分數，先把近似值轉成區間，再套條件篩選會最穩。",
        ],
        examples=[
            r"若四捨五入到小數第一位後是 \(0.6\)，則原數範圍先寫成 \(0.55\le x<0.65\)。",
            r"若某分數四捨五入到整數後得 \(8\)，可先列 \(7.5\le x<8.5\)，再檢查分數是否符合其他條件。",
            r"若題目說『保留到百分位是 \(3.14\)』，則應先列 \(3.135\le x<3.145\)。",
        ],
        tips=[
            "一定要先看清楚保留到哪一位，因為區間半徑會跟著改變。",
            "教學時可先讓學生用數線畫出區間，再談分數條件，會比直接算更不容易出錯。",
        ],
        notes=[
            "這類題其實是區間觀念和近似值觀念的結合，不是單純背四捨五入規則。",
            "若後面還要搭配最簡分數、分母限制或整數條件，就把它當成『區間內找符合條件的數』來做。",
        ],
        mistakes=[
            "把右端點也算進去，忽略四捨五入常用的是半開區間。",
            r"還沒看清楚保留位數，就直接把誤差寫成 \(0.5\) 或 \(0.05\)。",
        ],
        tags=["s1-1-1", "有理數", "近似值", "估計", "反推", "分支"],
        updated_at=updated_at,
    )

    set_branch_content(
        by_id["s1-1-1-real-number-core"],
        formula_lines=[
            ("集合關係", [r"\mathbb{N}\subset\mathbb{Z}\subset\mathbb{Q}\subset\mathbb{R}"]),
            ("實數分類", [r"\mathbb{R}=\mathbb{Q}\cup\text{無理數}"]),
            ("關鍵性質", [r"\text{三一律、遞移律與稠密性是比大小與數線定位的基礎}"]),
        ],
        usage=[
            "這一支像整章的地圖，要先幫學生看清楚『整數、有理數、無理數、實數』彼此的位置關係。",
            "遇到新題時，先分辨它在考分類、性質還是運算，學生比較不會把不同觀念混在一起。",
        ],
        examples=[
            r"\(\sqrt{2}\) 屬於無理數，也因此屬於實數；\(\frac34\) 屬於有理數，也屬於實數。",
            r"有理數和無理數互不重疊，但合起來剛好構成整個實數系。",
            r"若 \(a<b\) 且 \(b<c\)，則 \(a<c\)，這就是遞移律在比大小上的基本應用。",
        ],
        tips=[
            "教學時可先畫集合包含圖，再畫數線，讓『分類』和『位置』兩個觀念接起來。",
            r"若學生只會背 \(\mathbb{N}\subset\mathbb{Z}\subset\mathbb{Q}\subset\mathbb{R}\)，要再追問每一層多了哪些新元素。",
        ],
        notes=[
            "這一支不是拿來大量算題，而是拿來幫整章觀念定錨。",
            "後面的有理數、無理數、數線與大小比較，實際上都是這張地圖往下展開。",
        ],
        mistakes=[
            "把有理數和無理數看成互相包含，而不是互斥且並成實數。",
            "只背集合符號，不知道每一類數到底長什麼樣子。",
        ],
        tags=["s1-1-1", "實數", "分類", "集合", "基本性質", "分支"],
        updated_at=updated_at,
    )

    set_branch_content(
        by_id["senior-distance-midpoint-section-formulas"],
        formula_lines=[
            ("絕對值與距離", [r"OP=|a|", r"PQ=|a-b|"]),
            ("中點公式", [r"M=\frac{a+b}{2}"]),
            ("分點公式", [r"x=\frac{mb+na}{m+n}\quad(\text{內分})", r"x=\frac{mb-na}{m-n}\quad(\text{外分})"]),
        ],
        usage=[
            "這一支是距離與分點主題的地基，先把數線上的距離、絕對值、中點與分點放在同一張圖裡理解。",
            "很多題目看起來像代數，其實先畫數線就會知道該用距離觀念、中點公式，還是分點公式。",
        ],
        examples=[
            r"若 \(A(2),B(10)\)，則 \(AB=|2-10|=8\)，中點為 \(\frac{2+10}{2}=6\)。",
            r"若 \(A(1),B(11)\)，且 \(AP:PB=2:3\)，則內分點為 \(\frac{2\cdot11+3\cdot1}{2+3}=5\)。",
            r"若題目問某點到兩端點距離相等，就先想到中點，而不是急著列兩個未知數。",
        ],
        tips=[
            "先畫數線位置，再代公式，常常能先看出答案大概應該落在哪一邊。",
            "看到距離題時，要先提醒學生距離永遠是非負量，所以不能把結果寫成帶符號的差。",
        ],
        notes=[
            r"中點其實是分點公式在 \(1:1\) 的特例，教學時可以這樣連起來。",
            "內分點一定落在線段內，外分點一定落在線段外，這個位置感要先建立。",
        ],
        mistakes=[
            r"把距離算成有正負的量，例如直接把 \(a-b\) 當距離而忘了絕對值。",
            "中點公式和分點公式混用，或者比例方向看反。",
        ],
        tags=["s1-1-1", "距離", "中點", "分點", "數線", "分支"],
        updated_at=updated_at,
    )

    set_branch_content(
        by_id["s1-1-1-distance-section-application"],
        formula_lines=[
            ("位置判斷", [r"\text{內分點在線段內，外分點在線段外}"]),
            ("合理區間", [r"\text{若是內分，結果應介於兩端點之間}"]),
            ("應用流程", [r"\text{先判斷題意}\rightarrow\text{代公式}\rightarrow\text{回數線驗位置}"]),
        ],
        usage=[
            "這一支專門處理『算完公式後怎麼判讀』，把分點公式從純計算推進到位置判斷與文字應用。",
            "若題目給的是比例、位置關係或範圍限制，重點不只是代公式，而是判斷結果合不合理。",
        ],
        examples=[
            r"若內分點比例為 \(2:3\)，結果應落在兩端點之間，不可能跑到外側。",
            r"若算出的內分點比兩端點都大，就應立刻回頭檢查比例順序或公式是否代反。",
            r"若題目要找『距離某點較近』的分點位置，也可先用數線判斷大概區域，再做精算。",
        ],
        tips=[
            "算完之後一定回到數線上驗位置，這一步常比計算本身更能抓到錯誤。",
            r"比例若寫成 \(AP:PB=m:n\)，就要很清楚哪個係數乘在哪個端點，避免對調。",
        ],
        notes=[
            "這一支最適合接在基礎公式後面，幫學生從『會算』過渡到『會判讀』。",
            "若題目同時帶入絕對值、區間或不等式，也可以先用數線圖像理解位置再代數化。",
        ],
        mistakes=[
            "只代公式不檢查位置，導致內外分顛倒了還沒發現。",
            "看到比例就直接套式，卻沒有先判斷答案應該落在線段內還是外。",
        ],
        tags=["s1-1-1", "分點", "應用", "位置判斷", "數線", "分支"],
        updated_at=updated_at,
    )

    formula_db["meta"]["updatedAt"] = updated_at
    save_json(FORMULA_DB, formula_db)
    print("Enhanced the weaker s1-1-1 branch content.")


if __name__ == "__main__":
    main()
