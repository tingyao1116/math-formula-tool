import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OVERVIEW_PATH = ROOT / "program-db" / "database" / "chapter-overview-db.json"
FORMULA_PATH = ROOT / "program-db" / "database" / "formula-db.json"
PRESERVE_CODES = {"j1-1-1", "j1-1-2", "j1-1-3"}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def chapter_items(all_topics, code):
    return [item for item in all_topics if str(item.get("chapterCode", "")).strip() == code]


def structure_for(all_topics, code):
    items = chapter_items(all_topics, code)
    id_set = {str(item.get("id", "")).strip() for item in items}
    by_parent = {}
    for item in items:
        by_parent.setdefault(str(item.get("parentId", "")).strip(), []).append(item)

    roots = [
        item
        for item in items
        if not str(item.get("parentId", "")).strip()
        or str(item.get("parentId", "")).strip() not in id_set
    ]
    root_titles = [str(item.get("title", "")).strip() for item in roots if str(item.get("title", "")).strip()]
    child_titles = []
    for root in roots:
        for child in by_parent.get(str(root.get("id", "")).strip(), []):
            title = str(child.get("title", "")).strip()
            if title:
                child_titles.append(title)
    return root_titles, child_titles


def short_join(items, n=3):
    vals = [str(x).strip() for x in items if str(x).strip()]
    if not vals:
        return ""
    return "、".join(vals[:n])


def label_from_group(group_name, code):
    parts = [p for p in str(group_name or "").split("・") if p]
    return parts[-1] if parts else code


def make_generic(label, roots, children):
    root_a = roots[0] if roots else label
    root_b = roots[1] if len(roots) > 1 else ""
    root_line = short_join(roots, 3) or label
    child_line = short_join(children, 3)
    point1 = f"1. 這章最重要的核心，是先抓住「{label}」到底在處理什麼關係，不要一開始就只背步驟。"
    point2 = (
        f"2. 看到題目時，先判斷它是在考哪一條主線。先分清楚是「{root_a}」"
        + (f"、還是「{root_b}」" if root_b else "")
        + "，再決定要用哪個規則或表示方式去想。"
    )
    point3 = f"3. 這章可以先從 {root_line} 開始學。" + (
        f" 後面像 {child_line} 這些內容，多半都是前面核心觀念的延伸。" if child_line else ""
    )
    point4 = "4. 這章最容易錯的是把不同情況混在一起，所以每一題都先問自己：這題現在到底在考哪一個核心概念？"
    return "\n\n".join([point1, point2, point3, point4])


def make_intro(label, roots, children):
    text = " ".join([label] + roots + children)
    root_line = short_join(roots, 3) or label

    if "科學記號" in text:
        return "\n\n".join(
            [
                "1. 這章最重要的核心，不是只把數字寫成固定格式，而是要會在一般記法、科學記號和位值之間自由轉換。",
                "2. 看到題目時，最先做的事是先看前面的數字有沒有落在 1 到 10 之間，再決定小數點要往哪裡移，10 的次方要配幾次。",
                "3. 這章先把科學記號的基本寫法看懂，再練大數、小數的改寫、比較大小和四則運算。很多題目看起來不同，其實都在考小數點移動和位值判斷。",
                "4. 這章最容易錯的是小數點方向看反、次方正負號寫錯，或改寫後前面的數字不在 1 到 10 之間。",
            ]
        )

    if "方程" in text and "聯立" in text:
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是用兩個條件一起鎖定同一個答案，所以重點不是只會算，而是看懂每個方程式各自代表什麼。",
                "2. 看到題目時，先判斷這題比較適合代入消去還是加減消去。若某個未知數係數已經接近，就先想消去；若某一式已經很容易解出其中一個未知數，就先代入。",
                f"3. 這章可以先從 {root_line} 開始，再慢慢接到應用題。真正要練熟的是把條件翻成兩個方程式，然後穩定地解出交會的答案。",
                "4. 這章最容易錯的是消去時符號一起錯、代入時少括號，或只求出一個未知數就停下來。",
            ]
        )

    if "不等式" in text:
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是不等式在比較大小範圍，不只是求一個單獨的數。",
                "2. 看到題目時，先把它當成等式的整理方式去想；但只要遇到乘或除以負數，就立刻提醒自己不等號要反向。",
                f"3. 這章可以先從 {root_line} 開始學，再接到範圍表示和應用題。真正要熟的是整理過程和答案區間的意思。",
                "4. 這章最容易錯的是忘記不等號反向，或算出答案後沒有回到範圍去理解。",
            ]
        )

    if "方程" in text:
        return "\n\n".join(
            [
                "1. 這章最重要的核心，不是把未知數移來移去，而是要維持等式兩邊的平衡。",
                "2. 看到題目時，先想哪一些可以先合併、去括號或去分母，再把未知數集中到一邊、常數集中到另一邊。",
                f"3. 這章可以先從 {root_line} 開始，再慢慢接到文字題或應用題。真正要學會的是把條件整理成方程式，再穩定解出未知數。",
                "4. 這章最容易錯的是移項漏變號、去分母少乘、去括號少分配，或求完後沒有檢查答案合不合理。",
            ]
        )

    if any(k in text for k in ["比例", "比與比值", "比值", "正比", "反比", "百分"]):
        return "\n\n".join(
            [
                f"1. 這章最重要的核心，是把「{label}」看成數量之間的倍數關係，不要只看相差多少。",
                "2. 看到題目時，先確認比較的是哪兩個量、單位有沒有一致，再決定要用比值、比例式，還是正比反比去想。",
                f"3. 這章可以先從 {root_line} 開始學。後面不管是百分率、縮放、濃度還是速率，只要抓住對應量和倍數關係，題目就不會散掉。",
                "4. 這章最容易錯的是對應量抓錯、單位沒先統一，或把加減關係誤看成倍數關係。",
            ]
        )

    if any(k in text for k in ["實數", "有理數", "無理數", "近似值", "絕對誤差", "有效數字"]):
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是先分清楚各種數的分類和性質，知道每一個數放在數線上各代表什麼意思。",
                "2. 看到題目時，先判斷它是在考數的分類、近似表示，還是大小與性質的判讀，不要一開始就急著算。",
                f"3. 這章可以先從 {root_line} 開始學。前面若把有理數、無理數和近似值的概念分清楚，後面的比較、估算和表示都會穩很多。",
                "4. 這章最容易錯的是把分類混在一起，或把近似值直接當成精確值使用。",
            ]
        )

    if any(k in text for k in ["座標", "直線", "函數", "斜率", "圖形與方程式", "一次函數"]):
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是把數、點、圖形和方程式看成同一件事的不同表示方式。",
                "2. 看到題目時，先搞清楚 x 和 y 分別代表什麼，再看它是在考點的位置、圖形的變化，還是方程式之間的關係。",
                f"3. 這章可以先從 {root_line} 開始學。後面不管是畫圖、讀圖、找斜率還是寫方程式，本質上都在做表示方式的轉換。",
                "4. 這章最容易錯的是象限方向看反、坐標順序寫反，或只會代公式卻不知道圖形在表達什麼。",
            ]
        )

    if "矩陣" in text:
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是先把矩陣看成有列有行的資料排列，再去談它能做哪些運算。",
                "2. 看到題目時，先確認矩陣的大小，再判斷現在是加減、純量倍，還是乘法。很多題目一開始只要先看尺寸，就知道能不能算。",
                f"3. 這章可以先從 {root_line} 開始學。矩陣乘法和一般數的乘法很不一樣，真正要穩的是列乘行的意思，不是只記口訣。",
                "4. 這章最容易錯的是矩陣大小看錯、把乘法當成可交換，或不知道什麼情況下根本不能相加相乘。",
            ]
        )

    if any(k in text for k in ["三角形", "全等", "相似", "角度", "內角", "外角", "圓周角", "圓心角", "角平分線", "平行", "垂直", "幾何", "尺規"]) and "三角比" not in text:
        return "\n\n".join(
            [
                "1. 這章最重要的核心，不是只記圖形性質，而是要看懂哪些條件會推出哪些結論。",
                "2. 看到題目時，先把圖上的已知條件標清楚，再判斷是在考角的關係、邊的關係，還是圖形之間的對應。",
                f"3. 這章可以先從 {root_line} 開始學。圖形題常常不是新規則很多，而是要把已知條件一層一層接起來。",
                "4. 這章最容易錯的是用眼睛覺得像就當成真的、對應點抓錯，或漏掉題目已經給你的隱藏條件。",
            ]
        )

    if "圓" in text:
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是先分清楚圓心、半徑、弦、切線、圓周角這些角色各自在控制什麼關係。",
                "2. 看到題目時，先找圓心和半徑，再看它是在考弧、角、弦，還是切線的性質。很多規則只要角色分清楚，就不容易混。",
                f"3. 這章可以先從 {root_line} 開始學，再慢慢接到綜合圖形。真正的關鍵是把同圓裡的角度和長度關係接起來。",
                "4. 這章最容易錯的是把圓心角和圓周角混在一起，或不知道切線一定和半徑垂直。",
            ]
        )

    if any(k in text for k in ["乘法公式", "因式分解", "多項式", "整式"]):
        if "乘法公式" in text:
            return "\n\n".join(
                [
                    "1. 這章最重要的核心，不是背公式，而是看到式子的結構就能認出它屬於哪一型。",
                    "2. 看到題目時，先看它像不像平方公式、和差公式，或能不能反過來從結果認出原本的結構。",
                    f"3. 這章可以先從 {root_line} 開始學。後面不管是展開、心算、化簡，還是反過來做因式分解，本質都在認結構。",
                    "4. 這章最容易錯的是中間項符號看錯、平方漏掉，或公式明明不合型還硬套。",
                ]
            )
        if "因式分解" in text:
            return "\n\n".join(
                [
                    "1. 這章最重要的核心，是把原本乘開的東西倒過來看，找出式子可以拆成哪幾個因式相乘。",
                    "2. 看到題目時，第一步先看能不能提出公因式；公因式處理完，再看有沒有公式型或分組的機會。",
                    f"3. 這章可以先從 {root_line} 開始學。因式分解其實很吃順序感，先公因式、再公式、最後才看能不能再拆。",
                    "4. 這章最容易錯的是公因式沒提乾淨、負號沒先提出來，或公式型看得太快導致拆錯。",
                ]
            )
        if "加減" in text:
            return "\n\n".join(
                [
                    "1. 這章最重要的核心，是先分清楚哪些項才能合併，整式的加減本質上還是在整理同類項。",
                    "2. 看到題目時，先去括號、看清楚每一項的符號，再把同類項排在一起處理。",
                    f"3. 這章可以先從 {root_line} 開始學，再練較長的整理式。真正的重點不是算快，而是每一項都不能掉。",
                    "4. 這章最容易錯的是去括號漏變號、把不同次數或不同字母的項硬合併。",
                ]
            )
        if "乘除" in text:
            return "\n\n".join(
                [
                    "1. 這章最重要的核心，是把分配律和項的排列看穩，知道每一項都要確實乘到、除到。",
                    "2. 看到題目時，先看它是在考展開、直式乘法，還是除法，再決定要一項一項分配還是照位值排直式。",
                    f"3. 這章可以先從 {root_line} 開始學。前面若分配律和整式觀念穩，後面的直式和長除法就不會只是硬背格式。",
                    "4. 這章最容易錯的是漏乘某一項、項次排錯，或把整式除法當成單純數字除法。",
                ]
            )

    if any(k in text for k in ["平方根", "二次方根", "根式"]):
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是先搞清楚平方和開根號互相對應的關係，不要把根號只當成一個新符號。",
                "2. 看到題目時，先判斷它是在考平方根的意義、根式化簡，還是根式運算。若能先拆出完全平方因數，很多題目就會簡單很多。",
                f"3. 這章可以先從 {root_line} 開始學，再慢慢接到根式運算和應用。真正要穩的是每一步都知道為什麼可以開、為什麼可以合併。",
                "4. 這章最容易錯的是把正平方根和平方根混在一起，或看到根號就亂加亂減。",
            ]
        )

    if any(k in text for k in ["機率", "統計", "平均", "中位數", "眾數", "盒狀圖", "標準差"]):
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是把資料或事件的意義看懂，不要只剩下套公式。",
                "2. 看到題目時，先確認它是在考資料整理、圖表判讀，還是機率計算。若是機率題，就先把所有可能情況列清楚；若是統計題，就先看每個數值在描述什麼。",
                f"3. 這章可以先從 {root_line} 開始學。後面的題目看起來很多樣，但本質上都在考你能不能把資料和結果對起來。",
                "4. 這章最容易錯的是條件沒看完就開始算，或把平均、機率、圖表結論直接憑感覺判斷。",
            ]
        )

    if any(k in text for k in ["數列", "級數"]):
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是先看出規律，再決定是要找第 n 項，還是要求前 n 項的和。",
                "2. 看到題目時，先判斷它比較像等差、等比，還是遞推規律；接著再看題目要你找的是單一一項，還是整段累加。",
                f"3. 這章可以先從 {root_line} 開始學。規律一旦看對，後面的公式其實是在幫你把同一件事寫得更快。",
                "4. 這章最容易錯的是項數和位置混掉、首項公差公比看錯，或把第 n 項公式和求和公式混在一起。",
            ]
        )

    if any(k in text for k in ["三角比", "sin", "cos", "tan"]):
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是把角和邊的關係固定下來，知道三角比是在描述哪兩條邊的比值。",
                "2. 看到題目時，先找出直角、目標角，然後把對邊、鄰邊、斜邊標清楚，再決定要用哪一個比值。",
                f"3. 這章可以先從 {root_line} 開始學。只要角和邊的角色不亂，後面的應用題其實都是在做同一種轉換。",
                "4. 這章最容易錯的是邊的位置跟著角改變卻沒有一起改，或把不同三角比公式混用。",
            ]
        )

    if "向量" in text:
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是把向量看成同時有大小和方向的量，而不是新的符號遊戲。",
                "2. 看到題目時，先判斷它是在考幾何方向、分量表示，還是內積外積這類運算，再決定要用圖像還是坐標去想。",
                f"3. 這章可以先從 {root_line} 開始學。很多看起來抽象的運算，其實都是在描述方向、長度和投影。",
                "4. 這章最容易錯的是把純量和向量混在一起，或只算大小卻忘了方向。",
            ]
        )

    if any(k in text for k in ["對數", "指數函數", "對數函數"]):
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是看懂指數和對數其實是在描述同一個關係，只是寫法不同。",
                "2. 看到題目時，先想能不能先換成同底、同形式，再決定要比較大小、化簡，還是解方程。",
                f"3. 這章可以先從 {root_line} 開始學。真正關鍵是指數形式和對數形式之間能自由轉換，後面的運算才會順。",
                "4. 這章最容易錯的是底數條件忘記檢查，或轉換形式時把位置放錯。",
            ]
        )

    if any(k in text for k in ["微分", "導數", "極限", "積分"]):
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是先知道這個工具在描述什麼變化，不是只背計算公式。",
                "2. 看到題目時，先判斷它要你看的是趨近、瞬時變化，還是累積量，再決定該用極限、微分或積分的觀念。",
                f"3. 這章可以先從 {root_line} 開始學。公式很重要，但更重要的是每一個符號背後在描述什麼幾何或變化意義。",
                "4. 這章最容易錯的是只記公式卻不知道何時用，或條件一變就整個失去判斷方向。",
            ]
        )

    if any(k in text for k in ["排列", "組合"]):
        return "\n\n".join(
            [
                "1. 這章最重要的核心，是先分清楚這題有沒有在意順序。順序有差就是排列，順序沒差才是組合。",
                "2. 看到題目時，先問自己元素能不能重複、順序有沒有差，再決定要直接列乘，還是用排列組合公式。",
                f"3. 這章可以先從 {root_line} 開始學。很多題目難的不是公式本身，而是前面分類判斷做錯。",
                "4. 這章最容易錯的是把排列組合互換，或條件還沒拆清楚就急著套公式。",
            ]
        )

    return make_generic(label, roots, children)


def main():
    overview_db = load_json(OVERVIEW_PATH)
    formula_db = load_json(FORMULA_PATH)
    overviews = overview_db["overviews"]
    topics = formula_db.get("topics", [])
    changed = []

    for code, entry in overviews.items():
        variants = entry.get("variants") or []
        if not variants:
            continue
        sections = variants[0].get("sections") or []
        paragraph = next((section for section in sections if section.get("type") == "paragraph"), None)
        if paragraph is None:
            continue
        if code in PRESERVE_CODES and str(paragraph.get("text", "")).strip().startswith("1."):
            continue
        label = label_from_group(entry.get("groupName"), code)
        roots, children = structure_for(topics, code)
        paragraph["text"] = make_intro(label, roots, children)
        entry["updatedAt"] = datetime.now().isoformat(timespec="seconds")
        changed.append(code)

    OVERVIEW_PATH.write_text(json.dumps(overview_db, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"changed {len(changed)}")


if __name__ == "__main__":
    main()
