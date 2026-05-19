from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
JS_PATH = ROOT / "data" / "main-topic-overviews.js"
UPDATED_AT = "2026-05-08T17:45:00+08:00"


THEME_SPECS = [
    {
        "topicId": "s1-3-1-main-theme-basic",
        "title": "多項式基本概念",
        "pdf_file": "s1-3-1-topic-1-polynomial-basics.pdf",
        "editable_rows": [
            ["什麼叫多項式", "先分清楚係數、變數指數必須是非負整數，才算多項式。"],
            ["項、係數、次數", "看到式子先拆項，再找各項係數與最高次。"],
            ["同類項整理", "只有變數部分完全相同，才可以合併成同類項。"],
            ["多項式列式", "題目給條件時，先決定未知數，再用多項式語言把條件寫清楚。"],
            ["讀題提醒", "不要把分母有變數、根號有變數或負指數的式子誤當多項式。"],
        ],
    },
    {
        "topicId": "s1-3-1-main-theme-arithmetic",
        "title": "多項式四則運算",
        "pdf_file": "s1-3-1-topic-2-polynomial-arithmetic.pdf",
        "editable_rows": [
            ["加減先對齊同類項", "多項式加減最穩的做法是先缺項補 0，再逐項整理。"],
            ["乘法看分配律", "單項乘多項、多項乘多項都先抓分配律，再整理同類項。"],
            ["次數關係", "相乘時次數通常相加；加減時最高次可能被消掉，要重新判斷。"],
            ["除法原理", "看到除法先確認是整除還是有餘式，再決定要不要用綜合除法。"],
            ["讀題提醒", "缺項沒補 0、抄錯符號、整理後忘了重新看次數，是最常見的錯。"],
        ],
    },
    {
        "topicId": "s1-3-1-main-theme-remainder",
        "title": "餘式定理與因式定理",
        "pdf_file": "s1-3-1-topic-3-remainder-factor-theorems.pdf",
        "editable_rows": [
            ["餘式定理", "被 \\((x-a)\\) 除的餘式就是 \\(f(a)\\)。"],
            ["因式定理", "若 \\(f(a)=0\\)，就代表 \\((x-a)\\) 是因式。"],
            ["綜合除法", "一次除式很適合配合綜合除法快速驗證根與餘式。"],
            ["係數和與代值", "把 \\(x=1\\)、\\(x=-1\\) 代入，可以快速抓係數和與奇偶次和。"],
            ["讀題提醒", "不要把方程式的根、除式的形式、餘式值三件事混在一起。"],
        ],
    },
    {
        "topicId": "s1-3-2-main-theme-linear-function",
        "title": "線型函數",
        "pdf_file": "s1-3-2-topic-1-linear-function.pdf",
        "editable_rows": [
            ["函數先看對應", "先分清楚每個 \\(x\\) 是否只對應一個 \\(y\\)，再談是不是函數。"],
            ["定義域與值域", "先看題目限制，再決定 \\(x\\) 能取哪些值、\\(y\\) 會落在哪裡。"],
            ["線型函數圖形", "圖形是直線時，要先抓斜率和截距。"],
            ["斜率與增減", "斜率正負會直接影響圖形往右是上升還是下降。"],
            ["垂直線測試", "看到圖形題時，先用垂直線測試確認它是不是函數。"],
        ],
    },
    {
        "topicId": "s1-3-2-main-theme-quadratic-function",
        "title": "二次函數",
        "pdf_file": "s1-3-2-topic-2-quadratic-function.pdf",
        "editable_rows": [
            ["開口方向", "先看二次項係數正負，決定拋物線向上還是向下。"],
            ["頂點與對稱軸", "二次函數圖形最重要的是頂點位置和對稱軸。"],
            ["平移與伸縮", "同一條拋物線改寫不同形式，其實是在描述平移和伸縮。"],
            ["極值判讀", "有範圍時要同時比較頂點和端點，不要只看頂點。"],
            ["恆正恆負", "判斷整體正負時，要同時看開口方向和與 \\(x\\) 軸交點。"],
        ],
    },
    {
        "topicId": "s1-3-2-main-theme-monomial-function",
        "title": "單項函數",
        "pdf_file": "s1-3-2-topic-3-monomial-function.pdf",
        "editable_rows": [
            ["奇次與偶次", "先看次數奇偶，再判斷圖形左右兩端的走向。"],
            ["三次函數圖形", "三次函數常見的是左右反向延伸，並會有中心平移的變化。"],
            ["端行為", "看高次函數時，先抓最大次項，端行為就會先定下來。"],
            ["中心標準形", "三次函數遇到平移時，可以先找中心，再看對稱關係。"],
            ["讀題提醒", "不要只代幾個點就下結論，先抓奇偶性和最高次項。"],
        ],
    },
    {
        "topicId": "s1-3-2-main-theme-polynomial-function-graph",
        "title": "多項式函數圖形",
        "pdf_file": "s1-3-2-topic-4-polynomial-function-graph.pdf",
        "editable_rows": [
            ["先抓最高次項", "最高次項通常先決定兩端走向，再往下看局部形狀。"],
            ["端行為與局部變化", "先分清楚大範圍趨勢和局部附近長相，不要混成一件事。"],
            ["參數型圖形判讀", "看到參數時，先想圖形是平移、伸縮，還是交點改變。"],
            ["多個條件一起看", "圖形判讀要同時結合交點、對稱、端行為與增減。"],
            ["讀題提醒", "不要只憑單一點或單一係數就判完整圖形。"],
        ],
    },
    {
        "topicId": "s1-3-3-main-theme-linear-inequality-solving",
        "title": "一元一次不等式的解法",
        "pdf_file": "s1-3-3-topic-1-linear-inequality-solving.pdf",
        "editable_rows": [
            ["移項整理", "先把未知數整理到同一邊，再把常數整理到另一邊。"],
            ["負數反向", "乘或除以負數時，不等號方向一定要反過來。"],
            ["區間表示", "算完不要停在代數式，要回頭寫成範圍或區間。"],
            ["邊界點判斷", "看到 \\(<\\)、\\(>\\)、\\(\\le\\)、\\(\\ge\\) 時，要先分清楚邊界有沒有包含。"],
            ["讀題提醒", "最容易錯的是方向反了，或最後沒有把答案寫回範圍。"],
        ],
    },
    {
        "topicId": "s1-3-3-main-theme-quadratic-inequality-solving",
        "title": "二次不等式的解法",
        "pdf_file": "s1-3-3-topic-2-quadratic-inequality-solving.pdf",
        "editable_rows": [
            ["先找根", "二次不等式通常先找零點，再用數線切區間。"],
            ["開口決定正負", "開口向上或向下，會直接影響哪一段大於 0、哪一段小於 0。"],
            ["數線判號", "把根標在數線上，再逐段判號，比硬背結論穩很多。"],
            ["恆正恆負條件", "如果題目問整體大於 0 或小於 0，要看判別式和開口一起判。"],
            ["讀題提醒", "不要只會背兩根之間、兩根之外，要先看開口方向。"],
        ],
    },
    {
        "topicId": "s1-3-3-main-theme-higher-order-inequality-solving",
        "title": "高次不等式的解法",
        "pdf_file": "s1-3-3-topic-3-higher-order-inequality-solving.pdf",
        "editable_rows": [
            ["先做因式分解", "高次不等式先拆成一次因式或二次因式，後面才好判號。"],
            ["數線判號表", "把每個臨界點標在數線上，再逐段判正負。"],
            ["重根奇偶", "重根次數是奇數還是偶數，會影響圖形穿過或彈回。"],
            ["分式與根式補充", "遇到分母或根號時，要另外處理禁值和定義域。"],
            ["參數分類", "有參數時，先分情況，再做每一段的判號。"],
        ],
    },
]


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def upsert_theme_entry(by_id: dict, spec: dict) -> None:
    by_id[spec["topicId"]] = {
        "id": spec["topicId"],
        "title": spec["title"],
        "updatedAt": UPDATED_AT,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "table",
                        "headers": ["重點", "整理"],
                        "rows": spec["editable_rows"],
                    }
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "pdf-page",
                        "src": f"data/main-theme-overviews/{spec['pdf_file']}",
                        "note": spec["title"],
                    }
                ],
            },
        ],
    }


def main() -> None:
    payload = load_json(DB_PATH)
    by_id = payload.setdefault("byId", {})
    for spec in THEME_SPECS:
        upsert_theme_entry(by_id, spec)
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(by_id)
    payload["meta"]["updatedAt"] = UPDATED_AT
    payload["meta"]["source"] = "data/main-theme-overviews/first-volume-topic-pdfs.json"
    save_json(DB_PATH, payload)
    JS_PATH.write_text(
        "window.mainTopicOverviewStore = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print("Extended s1-3-1 ~ s1-3-3 main-topic overviews.")


if __name__ == "__main__":
    main()

