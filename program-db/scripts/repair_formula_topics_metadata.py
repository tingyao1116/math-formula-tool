import json
from pathlib import Path

from sync_legacy_bridge import sync_legacy_js_from_db


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
FORMULA_DB_PATH = ROOT / "program-db" / "database" / "formula-db.json"


ABSOLUTE_VALUE_FIXES = {
    "absolute-value-definition-properties-high-school": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "絕對值",
        "section": "絕對值",
        "domain": "代數",
        "usage": ["化簡含絕對值、根號平方、乘除與不等式估計時使用。"],
        "examples": [r"\(\sqrt{(x-2)^2}=|x-2|\)。", r"\(|2x|=2|x|\)。"],
        "tips": [r"\(\sqrt{a^2}\) 一定是 \(|a|\)，不能直接寫成 \(a\)。"],
        "mistakes": [r"把 \(\sqrt{x^2}\) 直接化成 \(x\)。"],
    },
    "absolute-value-distance-view-high-school": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "絕對值",
        "section": "絕對值",
        "domain": "代數",
        "examples": [r"數線上與 2 的距離為 7，可寫 \(|x-2|=7\)。", r"\(-1\le x\le7\) 可寫成 \(|x-3|\le4\)。"],
        "tips": ["先找中心，再找半徑。"],
    },
    "absolute-value-symbolic-simplification-high-school": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "絕對值",
        "section": "絕對值",
        "domain": "代數",
    },
    "absolute-value-function-graph-high-school": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "絕對值",
        "section": "絕對值",
        "domain": "代數",
    },
    "absolute-value-parameter-range-high-school": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "絕對值",
        "section": "絕對值",
        "domain": "代數",
    },
    "absolute-value-equation-inequality-high-school": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "絕對值",
        "section": "絕對值",
        "domain": "代數",
    },
}


S113_FIXES = {
    "senior-multiplication-identities-expansion-s113": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "式的運算",
        "section": "式的運算",
        "chapterRole": "重要配角",
        "domain": "代數",
        "difficulty": "基礎",
        "contentTypes": ["公式", "題型", "使用技巧", "注意事項"],
        "tags": ["s1-1-3", "乘法公式", "展開", "代數"],
        "usage": [r"看到括號乘積、平方或立方時，快速展開並整理係數。"],
        "examples": [r"(2a-3)^2、(a-b+c)^2、(a+3b)^3 都屬於這一型。"],
        "tips": ["先確認是和、差或三項式，再決定中間項符號。"],
        "notes": ["對應 1-3 主題1 開頭的展開題組。"],
        "mistakes": ["漏掉中間項或把負號展開錯。"],
    },
    "senior-rational-expression-operations-s113": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "式的運算",
        "section": "式的運算",
        "chapterRole": "重要配角",
        "domain": "代數",
        "difficulty": "基礎",
        "contentTypes": ["公式", "題型", "使用技巧", "注意事項"],
        "tags": ["s1-1-3", "分式", "化簡", "代數"],
        "usage": ["分式加減乘除、拆項或連鎖消去時使用。"],
        "examples": ["同分母合併、因式分解後約分、望遠鏡式拆項。"],
        "tips": ["先看能否因式分解，再做通分或約分。"],
        "notes": ["對應 1-3 主題1 的分式運算題組。"],
        "mistakes": ["分母不能直接相加，或約分時跨加減號。"],
    },
    "senior-radical-operations-rationalization-s113": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "式的運算",
        "section": "式的運算",
        "chapterRole": "重要配角",
        "domain": "代數",
        "difficulty": "進階",
        "contentTypes": ["公式", "題型", "使用技巧", "注意事項"],
        "tags": ["s1-1-3", "根式", "有理化", "代數"],
        "usage": ["根式加減乘除、巢狀根式整理與分母有理化時使用。"],
        "examples": [r"\sqrt{4-2\sqrt3}、\frac{2}{\sqrt7-\sqrt5} 這類題型。"],
        "tips": ["先找共軛，再看能否變成完全平方。"],
        "notes": ["整合 1-3 主題1 的根式化簡與有理化題。"],
        "mistakes": [r"把 \sqrt{a+b} 誤拆成 \sqrt a+\sqrt b。"],
    },
    "senior-radical-estimation-comparison-s113": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "式的運算",
        "section": "式的運算",
        "chapterRole": "重要配角",
        "domain": "代數",
        "difficulty": "進階",
        "contentTypes": ["公式", "題型", "使用技巧", "注意事項"],
        "tags": ["s1-1-3", "根式", "估值", "大小比較"],
        "usage": ["判斷根式落在哪兩個整數間、比較大小、求整數部分或小數部分。"],
        "examples": [r"\sqrt{73-\sqrt{37}} 的夾值、\sqrt6+\sqrt3 的大小比較。"],
        "tips": ["若直接比較困難，可先平方或找上下界。"],
        "notes": ["對應 1-3 主題1 後段的估值與比較題組。"],
        "mistakes": ["忽略根式皆為正，或平方後忘記比較條件。"],
    },
    "senior-arithmetic-geometric-mean-s113": {
        "stage": "高中",
        "grade": "高一",
        "gradeLabel": "高一上",
        "term": "上學期",
        "chapter": "式的運算",
        "section": "式的運算",
        "chapterRole": "重要配角",
        "domain": "代數",
        "difficulty": "進階",
        "contentTypes": ["公式", "題型", "使用技巧", "注意事項"],
        "tags": ["s1-1-3", "算幾不等式", "最值", "AM-GM"],
        "usage": ["求代數式或幾何面積的最大值、最小值時使用。"],
        "examples": ["a+b 固定求 ab 最大，或周長固定求矩形面積最大。"],
        "tips": ["先把式子整理成兩個非負量的和或積，再判斷等號何時成立。"],
        "notes": ["對應 1-3 主題2 的核心題型。"],
        "mistakes": ["忘記檢查非負條件，或只用到不等式卻沒回頭找等號成立點。"],
    },
    "senior-expression-substitution-evaluation": {
        "tips": ["先圈出題目給的量，再圈出題目要的量，中間用乘法公式當橋。"],
        "notes": ["這類題目的重點常不是算大數，而是把目標式改寫成已知量。"],
        "mistakes": [r"把 \((a+b)^2\) 誤當成 \(a^2+b^2\)，漏掉 \(2ab\)。"],
    },
}


def exponent_children() -> list[dict]:
    common = {
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "指數",
        "domain": "代數",
        "chapterRole": "分支題型",
        "parentId": "s1-1-4-exponent-rules",
        "contentTypes": ["定義", "公式", "使用技巧", "注意事項"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": "2026-05-05T12:00:00+08:00",
        "chapter_code": "s1-1-4",
        "gradeLabel": "高一上",
        "chapterCode": "s1-1-4",
        "section": "指數",
        "domainSub": "",
        "isBranch": True,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "stageOrder": 2,
        "gradeOrder": 4,
        "termOrder": 1,
        "chapterOrder": 4,
    }
    return [
        {
            **common,
            "id": "s1-1-4-exponent-operations",
            "title": "整數與有理指數運算",
            "difficulty": "基礎",
            "tags": ["s1-1-4", "指數律", "負指數", "分數指數"],
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "負指數", "values": [r"$a^{-n}=\frac{1}{a^n}$"]},
                    {"label": "分數指數", "values": [r"$a^{m/n}=\sqrt[n]{a^m}$"]},
                    {"label": "指數律", "values": [r"$a^m a^n=a^{m+n},\ (a^m)^n=a^{mn}$"]},
                ],
            },
            "usage": ["化簡同底數冪次、負指數與分數指數時使用。"],
            "examples": ["化簡負指數、分數指數與同底數乘冪。"],
            "tips": ["先確認底數限制，再套用負指數與分數指數定義。"],
            "notes": ["對應 1-4 主題1 前段的基本指數律題組。"],
            "mistakes": ["把負指數當成負數，或忽略底數不能為 0。"],
            "originalIndex": 1222,
            "manualOrder": 1222,
        },
        {
            **common,
            "id": "s1-1-4-exponent-domain",
            "title": "分數指數定義與限制",
            "difficulty": "基礎",
            "tags": ["s1-1-4", "定義域", "根式", "分數指數"],
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "平方根", "values": [r"$a^{1/2}=\sqrt a\ (a\ge 0)$"]},
                    {"label": "定義域", "values": [r"$a^{m/n}$ 需先確認根式有意義"]},
                    {"label": "絕對值", "values": [r"$\sqrt{a^2}=|a|$"]},
                ],
            },
            "usage": ["判斷分數指數與根式何時有定義時使用。"],
            "examples": ["判斷偶次根、奇次根與分數指數的可行範圍。"],
            "tips": ["偶次根先看非負條件，奇次根再看整體結構。"],
            "notes": ["對應 1-4 主題1 中段的定義域題組。"],
            "mistakes": [r"把 $\sqrt{a^2}$ 直接寫成 $a$，忽略絕對值。"],
            "originalIndex": 1223,
            "manualOrder": 1223,
        },
        {
            **common,
            "id": "s1-1-4-decimal-exponents",
            "title": "小數指數近似與估值",
            "difficulty": "進階",
            "tags": ["s1-1-4", "小數指數", "估值", "近似"],
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "拆指數", "values": [r"$a^{p+q}=a^p a^q$"]},
                    {"label": "負指數", "values": [r"$a^{-r}=\frac{1}{a^r}$"]},
                    {"label": "估值", "values": [r"\text{利用鄰近整數次方與單調性估計大小}"]},
                ],
            },
            "usage": ["估計小數指數的大小或比較相近冪值時使用。"],
            "examples": [r"比較 $2^{0.6}$、$2^{0.03}$、$2^{1.54}$ 與 $2^{-0.37}$。"],
            "tips": ["先用整數次方夾住，再做細部比較。"],
            "notes": ["對應 1-4 主題1 後段的小數指數題。"],
            "mistakes": ["忽略底數大於 1 時函數遞增，估值方向會判錯。"],
            "originalIndex": 1224,
            "manualOrder": 1224,
        },
        {
            **common,
            "id": "s1-1-4-exponent-substitution",
            "title": "指數代換與對稱式求值",
            "difficulty": "進階",
            "tags": ["s1-1-4", "代換", "對稱式", "求值"],
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "設元", "values": [r"$t=a^x+a^{-x}$"]},
                    {"label": "互逆", "values": [r"$a^x\cdot a^{-x}=1$"]},
                    {"label": "展開", "values": [r"$(u+v)^2=u^2+2uv+v^2,\ (u+v)^3=u^3+3u^2v+3uv^2+v^3$"]},
                ],
            },
            "usage": [r"遇到 $a^x$ 與 $a^{-x}$ 同時出現時，先代換可降低次數。"],
            "examples": [r"由 $a^{3x}+a^{-3x}$ 反求 $a^x+a^{-x}$，或由 $x^{1/2}+x^{-1/2}$ 求值。"],
            "tips": ["代換後務必用乘積等於 1 的條件回代。"],
            "notes": ["對應 1-4 主題2 的核心求值題型。"],
            "mistakes": [r"忘記利用 $a^x a^{-x}=1$ 消掉中間項。"],
            "originalIndex": 1225,
            "manualOrder": 1225,
        },
        {
            **common,
            "id": "s1-1-4-base-conversion",
            "title": "底數轉換與冪次表示",
            "difficulty": "進階",
            "tags": ["s1-1-4", "底數轉換", "冪次", "表示法"],
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "反求底數", "values": [r"$A^x=B\Rightarrow A=B^{1/x}$"]},
                    {"label": "同底化", "values": [r"\text{把兩邊改寫成相同底數再比較指數}"]},
                    {"label": "位值", "values": [r"$(a_ka_{k-1}\cdots a_0)_2=\sum a_i2^i$"]},
                ],
            },
            "usage": ["處理同值不同底數、進位位值與特殊冪次表示時使用。"],
            "examples": [r"由 $3388^x=(33.88)^y$ 比較指數關係。"],
            "tips": ["優先同底化，再決定要比較冪次還是對數。"],
            "notes": ["對應 1-4 主題2 的底數轉換題。"],
            "mistakes": ["底數不同時直接比較指數，或忽略進位位值展開。"],
            "originalIndex": 1226,
            "manualOrder": 1226,
        },
        {
            **common,
            "id": "s1-1-4-exponential-modeling",
            "title": "指數成長衰減應用",
            "difficulty": "基礎",
            "tags": ["s1-1-4", "成長", "衰減", "模型"],
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "成長", "values": [r"$N(t)=N_0\cdot a^t$"]},
                    {"label": "衰減", "values": [r"$m(t)=m_0\left(\frac{1}{2}\right)^{t/T}$"]},
                    {"label": "反比", "values": [r"$E=kd^{-2}$"]},
                ],
            },
            "usage": ["處理倍增、半衰期與強度模型題時使用。"],
            "examples": ["細菌倍增、放射衰變與光照強度題型。"],
            "tips": ["先辨認是固定倍數成長、固定比例衰減，還是反平方模型。"],
            "notes": ["對應 1-4 主題3 的應用題。"],
            "mistakes": ["把成長率、倍數與時間單位混在一起。"],
            "originalIndex": 1227,
            "manualOrder": 1227,
        },
    ]


HIGH_SCHOOL_FIXES = {
    "senior-vector-dot-product-main-s332": {
        "formula.lines.2.label": "垂直",
    },
    "senior-logarithmic-function-applications-s323": {
        "formula.lines.0.label": "感官尺度",
        "contentTypes.2": "使用技巧",
    },
    "senior-polynomial-factor-theorem": {
        "chapterRole": "分支題型",
        "contentTypes.0": "定義",
    },
    "senior-polynomial-definition-and-terminology": {
        "contentTypes.0": "定義",
    },
    "senior-polynomial-add-mul-degree-rules": {
        "examples.0": "直式乘法與橫式展開可相互驗算。",
    },
    "senior-polynomial-interpolation-basics-s131": {
        "examples.0": "已知 f(1),f(2),f(3) 求二次式。",
    },
    "s3-1-1-radian-arc-core": {
        "formula.lines.1.label": "扇形面積",
        "formula.lines.2.label": "角度轉弧度",
    },
    "s5-10-definite-integral-definition": {
        "contentTypes.0": "教學核心",
        "contentTypes.1": "公式重點",
    },
    "s5-4-nth-roots": {
        "notes.1": "來源：高三數全重點_易讀版.md（重點整理匯入）",
        "mistakes.0": "只列主值，漏掉其他根。",
    },
    "s5-4-fundamental-theorem": {
        "formula.lines.0.values.0": "$n$ 次多項式在複數域有 $n$ 個根（重根計次）",
    },
    "s2-x-integrated-checklist": {
        "notes.1": "來源：高一下全重點_易讀版.md（重點整理匯入）",
        "contentTypes.0": "教學核心",
    },
    "senior-circle-line-construction-by-slope": {
        "tips.0": "若只得到一條，常是重根相切情形。",
    },
    "senior-logarithmic-function-compound-transform-s323": {
        "tips.0": "真數條件決定圖形可畫範圍。",
    },
    "senior-percentile-quartile": {
        "tips.0": "先確認使用哪一種百分位定義與插值規則。",
    },
    "senior-plane-vector-triangle-centers-s331": {
        "examples.0": "已知三頂點座標，求重心與內心。",
        "tips.0": "內心要用對邊長做權重，不是直接平均。",
    },
    "senior-polynomial-function-even-odd-end-behavior-s132": {
        "tips.0": "先看次數奇偶，再看首項係數正負。",
    },
    "senior-radical-comparison-methods": {
        "examples.0": "比較 \\(3\\sqrt2\\) 與 \\(2\\sqrt5\\)，可平方後比 \\(18\\) 與 \\(20\\)。",
    },
    "senior-rational-expression-operations-s113": {
        "formula.lines.2.values.0": "\\text{先因式分解，再通分或約分}",
    },
    "senior-radical-operations-rationalization-s113": {
        "formula.lines.2.values.0": "\\sqrt{mn}=\\sqrt m\\sqrt n\\text{（在 }m,n\\ge0\\text{ 時）}",
    },
    "senior-radical-estimation-comparison-s113": {
        "formula.lines.2.values.0": "\\text{利用小數估值、夾擠或平方比較判斷大小}",
    },
    "senior-arithmetic-geometric-mean-s113": {
        "formula.lines.2.values.0": "\\text{固定和求積最大，或固定積求和最小}",
    },
}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def set_path_value(node, dotted_path: str, value) -> bool:
    parts = dotted_path.split(".")
    current = node
    for part in parts[:-1]:
        if part.isdigit():
            current = current[int(part)]
        else:
            current = current[part]
    last = parts[-1]
    if last.isdigit():
        index = int(last)
        if current[index] != value:
            current[index] = value
            return True
        return False
    if current.get(last) != value:
        current[last] = value
        return True
    return False


def main():
    payload = read_json(FORMULA_DB_PATH)
    topics = payload.get("topics", [])
    by_id = {topic.get("id"): topic for topic in topics}

    changed = 0
    all_fixes = {**ABSOLUTE_VALUE_FIXES, **S113_FIXES}

    for topic_id, updates in all_fixes.items():
        topic = by_id.get(topic_id)
        if not topic:
            continue
        for key, value in updates.items():
            if topic.get(key) != value:
                topic[key] = value
                changed += 1

    overview = by_id.get("s1-1-4-exponent-rules")
    if overview and overview.get("children") != exponent_children():
        overview["children"] = exponent_children()
        changed += 1

    for topic_id, updates in HIGH_SCHOOL_FIXES.items():
        topic = by_id.get(topic_id)
        if not topic:
            continue
        for key, value in updates.items():
            if set_path_value(topic, key, value):
                changed += 1

    write_json(FORMULA_DB_PATH, payload)
    synced_count = sync_legacy_js_from_db(FORMULA_DB_PATH)
    print(f"topics_updated={len(all_fixes)}")
    print(f"field_updates={changed}")
    print(f"synced_formula_content={synced_count}")


if __name__ == "__main__":
    main()
