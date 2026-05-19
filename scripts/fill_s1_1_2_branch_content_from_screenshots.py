from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
TZ = timezone(timedelta(hours=8))
CHAPTER_CODE = "s1-1-2"


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
    topic["contentTypes"] = ["重點整理", "觀念說明", "例題講解", "常見錯誤", "題型整理", "延伸補充"]
    topic["contentTypesLocked"] = True
    topic["mathNotationLocked"] = True
    topic["modifiedAt"] = updated_at
    topic["chapter"] = "絕對值"
    topic["section"] = "絕對值"
    topic["chapter_code"] = CHAPTER_CODE
    topic["chapterCode"] = CHAPTER_CODE


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    topics = formula_db["topics"]
    by_id = {str(topic.get("id", "")).strip(): topic for topic in topics}

    set_branch_content(
        by_id["absolute-value-definition-properties-high-school"],
        formula_lines=[
            ("定義", [r"|a|=\begin{cases}a,&a\ge 0\\-a,&a<0\end{cases}"]),
            ("距離意義", [r"|a|\text{ 表示數線上 }a\text{ 到原點的距離}"]),
            ("基本性質", [r"|a|\ge 0,\quad |a|^2=a^2,\quad \sqrt{a^2}=|a|"]),
            ("乘除性質", [r"|ab|=|a||b|,\quad \left|\frac{a}{b}\right|=\frac{|a|}{|b|}\ (b\ne 0)"]),
            ("三角不等式", [r"||a|-|b||\le |a\pm b|\le |a|+|b|"]),
        ],
        usage=[
            "這一支先建立絕對值就是距離的核心直覺，再把常用性質整理成可直接帶入題目的工具箱。",
            "教學時建議先用數線解釋，再回到代數定義，學生比較不會只剩下背公式。",
        ],
        examples=[
            r"判斷 \(\sqrt{x^2}\) 是否可直接寫成 \(x\)。正確寫法應是 \(\sqrt{x^2}=|x|\)。",
            r"利用 \(||a|-|b||\le |a-b|\) 或 \(|a+b|\le |a|+|b|\) 判斷絕對值式的範圍。",
            r"延伸到複數時，\(|a+bi|\) 也能視為平面上點 \((a,b)\) 到原點的距離。",
        ],
        tips=[
            r"看到 \(\sqrt{a^2}\) 時先停一下，提醒自己這不是 \(a\)，而是 \(|a|\)。",
            "若學生分不清各種性質，先只抓非負性與距離意義，再慢慢補乘除與三角不等式。",
        ],
        notes=[
            r"\(|a+b|=|a|+|b|\) 並不總是成立，只有同號或其中一個數為 0 時才可能等號成立。",
            "這個分支是後面方程、不等式、圖形與最值題的共同基礎。",
        ],
        mistakes=[
            r"把 \(\sqrt{x^2}\) 直接寫成 \(x\)。",
            r"誤以為 \(|a+b|=|a|+|b|\) 永遠成立。",
        ],
        tags=["s1-1-2", "絕對值", "定義", "基本性質", "三角不等式"],
        updated_at=updated_at,
    )

    set_branch_content(
        by_id["absolute-value-distance-view-high-school"],
        formula_lines=[
            ("兩點距離", [r"d(A,B)=|a-b|"]),
            ("中點觀點", [r"|x-a|=|x-b|\Rightarrow x=\frac{a+b}{2}"]),
            ("區間內部", [r"a<x<b\Rightarrow \left|x-\frac{a+b}{2}\right|<\frac{b-a}{2}"]),
            ("區間外部", [r"x<a\text{ 或 }x>b\Rightarrow \left|x-\frac{a+b}{2}\right|>\frac{b-a}{2}"]),
        ],
        usage=[
            "把絕對值不等式翻成數線上的距離問題，是這一章最重要的轉換能力之一。",
            "遇到解集、區間、中心與半徑時，優先用數線模型思考，再轉回代數式會更穩。",
        ],
        examples=[
            r"把 \(1\le x\le 5\) 改寫成絕對值不等式，可寫成 \(|x-3|\le 2\)。",
            r"若 \(|x-a|<4\) 的解集是 \(-1<x<7\)，則中心是 3、半徑是 4，可回推 \(a=3\)。",
        ],
        tips=[
            "先找區間的中點，再找左右到端點的距離，很多題目會瞬間變簡單。",
            r"看到 \(|x-a|<r\) 就想成『離 \(a\) 的距離小於 \(r\)』，看到 \(|x-a|>r\) 就想成『在外面』。",
        ],
        notes=[
            "這個分支和分點、中點、區間判斷有很強的連動性，之後做參數題也會一直回來用。",
            "若題目給的是閉區間，對應通常會是小於等於；若是開區間，則通常對應小於。",
        ],
        mistakes=[
            r"把 \(|x-a|\ge r\) 誤寫成一段區間，而不是兩側外部。",
            "只會代數移項，不先看中心與半徑，導致反向題很容易算亂。",
        ],
        tags=["s1-1-2", "絕對值", "距離", "數線", "區間轉換"],
        updated_at=updated_at,
    )

    set_branch_content(
        by_id["absolute-value-symbolic-simplification-high-school"],
        formula_lines=[
            ("去絕對值法則", [r"|f(x)|=\begin{cases}f(x),&f(x)\ge 0\\-f(x),&f(x)<0\end{cases}"]),
            ("根號平方型", [r"\sqrt{(f(x))^2}=|f(x)|"]),
            ("分段化簡", [r"\text{先找使內部為 }0\text{ 的分界點，再分區間討論}"]),
        ],
        usage=[
            "這一支的核心不是『直接拆』，而是先判斷絕對值內部在什麼條件下是正或負。",
            "遇到多個絕對值時，通常要先找所有折點，再分段化簡。",
        ],
        examples=[
            r"化簡 \(\sqrt{x^2-2x+1}+\sqrt{x^2+4x+4}\) 時，要先改寫成 \(|x-1|+|x+2|\)。",
            r"在 \(-3<x<2\) 內化簡含有 \(|x+3|,|x|,|x-2|\) 的式子，要先看每一項在該區間的正負。",
        ],
        tips=[
            "不要一看到絕對值就急著拆，先找『裡面什麼時候等於 0』才是關鍵。",
            r"把 \(\sqrt{(f(x))^2}\) 直接看成 \(|f(x)|\)，再決定是否需要去絕對值，流程會更穩。",
        ],
        notes=[
            "這個分支是後面多重絕對值不等式與折線圖形題的前置能力。",
            "若題目已給定變數範圍，常可直接利用範圍判斷正負，省掉部分分段。",
        ],
        mistakes=[
            r"把 \(|A|\) 不分情況直接改成 \(A\)。",
            r"把 \(\sqrt{(x-3)^2}\) 寫成 \(x-3\)，漏掉絕對值。",
        ],
        tags=["s1-1-2", "絕對值", "化簡", "分段討論", "根號"],
        updated_at=updated_at,
    )

    set_branch_content(
        by_id["absolute-value-equation-inequality-high-school"],
        formula_lines=[
            ("基本方程", [r"|x|=k\iff x=\pm k"]),
            ("基本不等式", [r"|x|\le k\iff -k\le x\le k", r"|x|\ge k\iff x\le -k\text{ 或 }x\ge k"]),
            ("等絕對值", [r"|A|=|B|\iff A=B\text{ 或 }A=-B"]),
            ("多重絕對值", [r"\text{先找折點，再分段討論或配合圖形理解}"]),
        ],
        usage=[
            "這一支要讓學生熟悉標準型，並知道什麼時候用分段、什麼時候可以平方。",
            "若式子裡有兩個以上不同底的絕對值，幾乎都要先找折點位置。",
        ],
        examples=[
            r"解 \(|ax+b|=cx+d\) 時，除了列出情況，也要檢查每個解是否符合原本分段條件。",
            r"解 \(|x-1|+|x+3|\le 5\) 時，可先在數線標出 \(-3\) 與 \(1\)，再分三段討論。",
            r"若題目問整數解個數，最後要記得把連續區間再轉回整數點檢查。",
        ],
        tips=[
            "小於等於通常對應中間一段；大於等於通常對應兩側外部，這個圖像感要很熟。",
            "平方前要先確認兩邊非負，否則很容易引入假解。",
        ],
        notes=[
            "多重絕對值題常和折線圖、距離和最值題互相連動，策略不必切得太死。",
            "若題目給的是參數型方程或不等式，可先回到標準型再處理。",
        ],
        mistakes=[
            r"把 \(|A|<b\) 或 \(|A|\le b\) 的解錯寫成兩側外部。",
            "分段討論後沒有回頭檢查分段條件，導致留下不合法的解。",
        ],
        tags=["s1-1-2", "絕對值", "方程式", "不等式", "分段討論"],
        updated_at=updated_at,
    )

    set_branch_content(
        by_id["absolute-value-function-graph-high-school"],
        formula_lines=[
            ("基本圖形", [r"y=|x-a|\text{ 的圖形是以 }x=a\text{ 為折點的 }V\text{ 字圖形}"]),
            ("距離總和最小值", [r"|x-a|+|x-b|\text{ 的最小值為 }|a-b|"]),
            ("中位數原理", [r"\sum_{i=1}^{n}|x-a_i|\text{ 的最小值發生在中位數位置}"]),
            ("有解判別", [r"|x-a|+|x-b|=k,\ k<|a-b|\Rightarrow \text{無解}"]),
        ],
        usage=[
            "這一支把代數式轉成折線圖形與距離總和，幫助學生理解最值題為什麼成立。",
            "教學上很適合搭配數線、圖像與生活情境，例如選點使總距離最短。",
        ],
        examples=[
            r"畫出 \(y=|x-a|+|x-b|\) 的圖形，並指出折點與最小值區段。",
            r"求 \(|x-a_1|+|x-a_2|+\cdots+|x-a_n|\) 的最小值時，可先排序後找中位數位置。",
            r"若 \(|x-a|+|x-b|=k\) 有解，必須滿足 \(k\ge |a-b|\)。",
        ],
        tips=[
            "先找每個絕對值裡面等於 0 的位置，圖形的折點通常就從那裡出現。",
            "看到距離總和的最小值，就要聯想到『在一條線上選位置，讓總路程最短』。",
        ],
        notes=[
            "這個分支和數線上的距離觀點是同一件事的圖像版本，只是表現方式不同。",
            "奇數個點時最小值落在中位數，偶數個點時則落在中間兩點之間的整段。",
        ],
        mistakes=[
            "只會硬算，不畫圖也不看折點，容易看不出最值在哪裡發生。",
            "把有解條件和最小值條件混在一起，忽略了距離總和不可能小於兩端點距離。",
        ],
        tags=["s1-1-2", "絕對值", "函數圖形", "最值", "中位數原理"],
        updated_at=updated_at,
    )

    set_branch_content(
        by_id["absolute-value-parameter-range-high-school"],
        formula_lines=[
            ("標準型", [r"|ax+b|\le c\text{ 的解集可視為中心與半徑的條件}"]),
            ("反推觀念", [r"\text{已知解區間，先找中點與半寬，再回推參數}"]),
            ("同解問題", [r"\text{若兩式同解，先整理成同一種標準型再比較係數}"]),
        ],
        usage=[
            "這一支是整章綜合壓軸，重點不是計算量，而是能不能從解集倒推模型。",
            "遇到參數題時，先問自己：中心在哪裡、半徑多少、方向有沒有改變。",
        ],
        examples=[
            r"若 \(|ax+1|\le b\) 的解為 \(-2\le x\le 5\)，可先從區間中點與半寬回推 \((a,b)\)。",
            r"若兩個絕對值不等式同解，先把它們都整理成 \(|x-h|\le r\) 或 \(|x-h|\ge r\) 再比較。",
            r"若 \(|x-1|+|x-3|\le k\) 無實數解，可由最小值反推 \(k\) 的範圍。",
        ],
        tips=[
            "反向題常比正向題簡單，因為區間一給出來，中點和半徑就很清楚了。",
            "若參數出現在絕對值外，也要留意乘上負數時不等號方向是否改變。",
        ],
        notes=[
            "這個分支會同時用到距離觀點、標準型不等式與最值判別，所以很適合當總複習。",
            "老師上課時可以把它當成整章總結，檢查學生是否真的理解前五個分支。",
        ],
        mistakes=[
            "只會盲目展開參數，不先從解集的幾何意義下手。",
            "同解問題只比表面形式，沒有先整理成相同標準型。",
        ],
        tags=["s1-1-2", "絕對值", "參數", "反向問題", "同解"],
        updated_at=updated_at,
    )

    formula_db["meta"]["updatedAt"] = updated_at
    save_json(FORMULA_DB, formula_db)
    print("Filled s1-1-2 branch content from the screenshot-based teaching outline.")


if __name__ == "__main__":
    main()
