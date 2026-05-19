from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
MAIN_TOPIC_OVERVIEW_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
TZ = timezone(timedelta(hours=8))


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


def set_branch_topic(
    topic: dict,
    *,
    title: str,
    parent_id: str,
    role: str,
    formula_lines: list[tuple[str, list[str]]],
    usage: list[str],
    examples: list[str],
    tips: list[str],
    notes: list[str],
    mistakes: list[str],
    tags: list[str],
    manual_order: int,
) -> None:
    topic["title"] = title
    topic["parentId"] = parent_id
    topic["chapterRole"] = role
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
    topic["contentTypes"] = ["定義", "公式", "題型", "使用技巧", "注意事項"]
    topic["contentTypesLocked"] = True
    topic["mathNotationLocked"] = True
    topic["chapter_code"] = "s1-1-1"
    topic["chapterCode"] = "s1-1-1"
    topic["chapter"] = "實數"
    topic["section"] = "實數"
    topic["domain"] = "代數"
    topic["domainSub"] = ""
    topic["stage"] = "高中"
    topic["grade"] = "高一"
    topic["term"] = "上學期"
    topic["gradeLabel"] = "高一上"
    topic["difficulty"] = "基礎"
    topic["relatedChapters"] = []
    topic["relatedTopicIds"] = []
    topic["isBranch"] = True
    topic["manualOrder"] = manual_order
    topic["originalIndex"] = manual_order


def make_branch_topic(
    *,
    topic_id: str,
    title: str,
    parent_id: str,
    role: str,
    formula_lines: list[tuple[str, list[str]]],
    usage: list[str],
    examples: list[str],
    tips: list[str],
    notes: list[str],
    mistakes: list[str],
    tags: list[str],
    manual_order: int,
    modified_at: str,
) -> dict:
    topic = {
        "id": topic_id,
        "modifiedAt": modified_at,
    }
    set_branch_topic(
        topic,
        title=title,
        parent_id=parent_id,
        role=role,
        formula_lines=formula_lines,
        usage=usage,
        examples=examples,
        tips=tips,
        notes=notes,
        mistakes=mistakes,
        tags=tags,
        manual_order=manual_order,
    )
    return topic


def update_table_rows(entry: dict, rows: list[list[str]], updated_at: str) -> None:
    if not entry:
        return
    entry["updatedAt"] = updated_at
    for variant in entry.get("variants", []):
        if variant.get("id") != "editable":
            continue
        for section in variant.get("sections", []):
            if section.get("type") == "table":
                section["headers"] = ["分支", "整理"]
                section["rows"] = rows
                return


def main() -> None:
    updated_at = now_iso()

    formula_db = load_json(FORMULA_DB)
    question_db = load_json(QUESTION_DB)
    main_topic_db = load_json(MAIN_TOPIC_OVERVIEW_DB)

    topics = formula_db.get("topics", [])
    topics_by_id = {str(topic.get("id", "")).strip(): topic for topic in topics}

    # Rational theme: keep only branch layer.
    set_branch_topic(
        topics_by_id["senior-rational-number-definition"],
        title="有理數的定義與結構",
        parent_id="s1-1-1-main-theme-rational",
        role="分支重點",
        formula_lines=[
            ("定義", [r"x=\frac{p}{q},\ p,q\in\mathbb{Z},\ q\ne0"]),
            ("集合", [r"\mathbb{Q}=\{\text{整數、有限小數、循環小數}\}"]),
            ("封閉性", [r"\text{有理數對加減乘與除以非零有理數封閉}"]),
        ],
        usage=[
            "先判斷一個數能不能寫成兩整數比，再決定後面要做分類還是運算。",
            "這個分支適合當有理數主題的第一個入口，先把定義和結構穩住。",
        ],
        examples=[
            r"整數、有限小數、循環小數都屬於有理數，例如 $-3,\ 0.125,\ 0.\overline{3}$。",
            r"若 $\frac{2}{3}=\frac{x}{9}$，可用交叉相乘得到 $18=3x$。",
        ],
        tips=[
            "看到分數、小數混在一起時，先回到「能否寫成分數」這件事。",
            "定義中的分母不能為 0，這是最基本但最常漏掉的條件。",
        ],
        notes=[
            "這裡只保留主分支，不再往下拆同名包裝層。",
            "截圖中的「有理數的定義與結構」與原本核心內容整併在這一筆。",
        ],
        mistakes=[
            "把整數排除在有理數之外。",
            "只看外觀判斷，不先回到分數定義。",
        ],
        tags=["s1-1-1", "有理數", "分支", "有理數的定義與結構"],
        manual_order=273,
    )
    topics_by_id["senior-rational-number-definition"]["modifiedAt"] = updated_at

    set_branch_topic(
        topics_by_id["senior-decimal-type-rational"],
        title="十進位表示法",
        parent_id="s1-1-1-main-theme-rational",
        role="分支重點",
        formula_lines=[
            ("有限小數條件", [r"\frac{p}{q}\text{ 最簡後若 }q=2^m5^n\text{，即可化有限小數}"]),
            ("純循環", [r"0.\overline{abc}=\frac{abc}{999}"]),
            ("混循環", [r"0.a\overline{bc}=\frac{abc-a}{990}"]),
        ],
        usage=[
            "把有限小數、循環小數與最簡分數的條件收在同一個分支內看。",
            "看到十進位表示法時，先判斷是要分類、判分母，還是把循環小數化分數。",
        ],
        examples=[
            r"$0.6$ 是有限小數，$0.314314314\cdots$ 是循環小數。",
            r"$\frac{7}{40}$ 因分母 $40=2^3\cdot5$，所以可化成有限小數。",
        ],
        tips=[
            "一定要先約成最簡分數，再看分母是否只含 2 和 5。",
            "循環小數先分清是純循環還是混循環，分母的 9 和 0 才不會放錯。",
        ],
        notes=[
            "依照截圖，這裡把「有限小數與循環小數」與「循環小數化分數」合併成同一個分支。",
            "原本更細的兩個子分支已收進本分支內容，不再另外展開。",
        ],
        mistakes=[
            "未約分就判斷是否為有限小數。",
            "把很長的小數直接誤判為無理數，沒有先檢查是否循環。",
        ],
        tags=["s1-1-1", "有理數", "十進位表示法", "分支"],
        manual_order=274,
    )
    topics_by_id["senior-decimal-type-rational"]["modifiedAt"] = updated_at

    set_branch_topic(
        topics_by_id["senior-rational-density"],
        title="有理數的稠密性",
        parent_id="s1-1-1-main-theme-rational",
        role="分支重點",
        formula_lines=[
            ("稠密性", [r"\text{任兩個相異有理數之間，必有另一個有理數}"]),
            ("常用找法", [r"\frac{a+b}{2}"]),
            ("延伸", [r"\text{同一區間內可找到無限多個有理數}"]),
        ],
        usage=[
            "題目問兩個數之間還有沒有別的有理數時，這一支就是主解法。",
            "可搭配數線圖像幫學生建立『中間永遠還有數』的直覺。",
        ],
        examples=[
            r"$0.55$ 與 $0.65$ 之間可取 $0.6$，也能再取 $0.58$、$0.601$。",
        ],
        tips=[
            "最穩的第一步通常是取平均。",
        ],
        notes=[
            "這一支對後面的實數稠密性、數線觀念都有幫助。",
        ],
        mistakes=[
            "以為兩個相鄰小數之間沒有別的數。",
        ],
        tags=["s1-1-1", "有理數", "稠密性", "分支"],
        manual_order=277,
    )
    topics_by_id["senior-rational-density"]["modifiedAt"] = updated_at

    set_branch_topic(
        topics_by_id["senior-rounding-rational-constraints"],
        title="近似值與估計",
        parent_id="s1-1-1-main-theme-rational",
        role="分支重點",
        formula_lines=[
            ("反推區間", [r"\text{四捨五入後為 }A\Rightarrow A-0.5u\le x<A+0.5u"]),
            ("分數模型", [r"x=\frac{p}{q}"]),
            ("流程", [r"\text{先列區間}\rightarrow\text{再反推整數條件}"]),
        ],
        usage=[
            "處理小數四捨五入後，反推原本分數或範圍的題型。",
            "很適合當估值、區間與不等式的綜合應用。",
        ],
        examples=[
            r"若四捨五入到小數第一位為 $0.6$，可先列 $0.55\le x<0.65$。",
        ],
        tips=[
            "先確認四捨五入到哪一位，區間半徑才不會設錯。",
        ],
        notes=[
            "截圖裡的『近似值與估計』就用這個分支承接，不再另拆反推型小枝。",
        ],
        mistakes=[
            "把右端點也算進去，忽略四捨五入常見的半開區間。",
        ],
        tags=["s1-1-1", "有理數", "近似值", "估計", "分支"],
        manual_order=278,
    )
    topics_by_id["senior-rounding-rational-constraints"]["modifiedAt"] = updated_at

    # Irrational theme.
    set_branch_topic(
        topics_by_id["senior-irrational-number-basics"],
        title="無理數的判定與證明",
        parent_id="s1-1-1-main-theme-irrational",
        role="分支重點",
        formula_lines=[
            ("定義", [r"\text{無法寫成 }\frac{p}{q}\text{ 的實數}"]),
            ("反證法", [r"\sqrt{2}=\frac{p}{q}\Rightarrow p,q\text{ 同為偶數，產生矛盾}"]),
            ("係數比較", [r"a+b\sqrt{k}=c+d\sqrt{k}\Rightarrow a=c,\ b=d"]),
        ],
        usage=[
            "先判斷一個根式能不能化成有理數，再決定要不要進入證明。",
            "反證法與係數比較法都放在這一支，不再拆成更小證明分支。",
        ],
        examples=[
            r"$\sqrt{144}=12$ 是有理數，$\sqrt{5}$ 才是無理數。",
            r"證明 $\sqrt{2}$ 不是有理數時，先假設它能寫成最簡分數。",
        ],
        tips=[
            "看到『是否為無理數』，先查完全平方，再考慮能否化成分數。",
            r"含 $\sqrt{k}$ 的等式若左右都是有理數加同一個無理數倍數，可優先做係數比較。",
        ],
        notes=[
            "截圖中的『反證法應用』與『無理數相等性質』都整併到這個分支內。",
        ],
        mistakes=[
            "把所有根號數都當成無理數。",
            "反證法只證到一半，沒有把矛盾講完整。",
        ],
        tags=["s1-1-1", "無理數", "判定", "證明", "分支"],
        manual_order=279,
    )
    topics_by_id["senior-irrational-number-basics"]["modifiedAt"] = updated_at

    set_branch_topic(
        topics_by_id["senior-irrational-operations"],
        title="根式的化簡技巧",
        parent_id="s1-1-1-main-theme-irrational",
        role="分支重點",
        formula_lines=[
            ("基本運算", [r"a\sqrt{m}+b\sqrt{m}=(a+b)\sqrt{m}", r"\sqrt{12}=2\sqrt{3}"]),
            ("分母有理化", [r"\frac{1}{\sqrt{a}}=\frac{\sqrt{a}}{a}\quad(a>0)"]),
            ("雙重根號", [r"\sqrt{a+b\pm2\sqrt{ab}}=\left|\sqrt{a}\pm\sqrt{b}\right|"]),
        ],
        usage=[
            "把根式的四則運算、同類根式合併、分母有理化與雙重根號化簡集中在同一支。",
            "學生做題前若先把根式整理乾淨，後面比大小與求值會穩很多。",
        ],
        examples=[
            r"$3\sqrt{8}=6\sqrt{2}$。",
            r"$\sqrt{11-6\sqrt{2}}=\sqrt{9} - \sqrt{2}=3-\sqrt{2}$ 可由雙重根號公式切入。",
        ],
        tips=[
            "先拆完全平方數，再判斷能不能合併成同類根式。",
            r"雙重根號通常先觀察中間項是否像 $\pm2\sqrt{ab}$。",
        ],
        notes=[
            "依照截圖，這裡把『基本運算』和『雙重根號化簡』收在同一個分支內。",
        ],
        mistakes=[
            r"把 $\sqrt{a}+\sqrt{b}$ 誤寫成 $\sqrt{a+b}$。",
            "雙重根號只看外型，沒有先檢查平方展開是否真的對得回去。",
        ],
        tags=["s1-1-1", "根式", "化簡", "雙重根號", "分支"],
        manual_order=283,
    )
    topics_by_id["senior-irrational-operations"]["modifiedAt"] = updated_at

    set_branch_topic(
        topics_by_id["senior-square-root-perfect-square"],
        title="根式的數值分析",
        parent_id="s1-1-1-main-theme-irrational",
        role="分支重點",
        formula_lines=[
            ("平方根定位", [r"a^2<N<(a+1)^2\Rightarrow a<\sqrt{N}<a+1"]),
            ("整數與小數部分", [r"\sqrt{N}=a+b\Rightarrow a\in\mathbb{Z},\ 0\le b<1"]),
            ("估值流程", [r"\text{先夾值，再拆整數部分與小數部分}"]),
        ],
        usage=[
            "處理根式的整數部分、小數部分與數值範圍判斷。",
            "這一支把平方根基礎與根式估值題型合在一起，不再往下拆更細。",
        ],
        examples=[
            r"若 $3<\sqrt{11}<4$，則整數部分是 $3$，小數部分是 $\sqrt{11}-3$。",
            r"像 $\sqrt{11-6\sqrt{2}}$ 這類題，也常要先化簡再談整數部分與小數部分。",
        ],
        tips=[
            "先用平方夾住根式，再談整數部分，通常最穩。",
            r"看到 $\sqrt{a^2}$ 時記得是 $|a|$，別把正負號看丟。",
        ],
        notes=[
            "截圖中的『整數與純小數部分』就收在這個分支內。",
        ],
        mistakes=[
            r"把 $\sqrt{a^2}$ 直接寫成 $a$。",
            "還沒先估範圍，就硬算整數部分與小數部分。",
        ],
        tags=["s1-1-1", "根式", "數值分析", "整數部分", "分支"],
        manual_order=282,
    )
    topics_by_id["senior-square-root-perfect-square"]["modifiedAt"] = updated_at

    # Real-line theme.
    set_branch_topic(
        topics_by_id["s1-1-1-real-number-core"],
        title="實數的分類與性質",
        parent_id="s1-1-1-main-theme-real-line",
        role="分支重點",
        formula_lines=[
            ("集合關係", [r"\mathbb{N}\subset\mathbb{Z}\subset\mathbb{Q}\subset\mathbb{R}"]),
            ("分類", [r"\mathbb{R}=\mathbb{Q}\cup\text{無理數}"]),
            ("基本性質", [r"\text{三一律與遞移律是比大小的基礎}"]),
        ],
        usage=[
            "先把實數系的大地圖建立起來，後面的有理數、無理數、數線才不會分散。",
        ],
        examples=[
            r"有理數與無理數共同構成實數。",
        ],
        tips=[
            "先問這題在考分類、性質，還是在考運算。",
        ],
        notes=[
            "這筆現在改成正式分支，不再只是導覽補充。",
        ],
        mistakes=[
            "把有理數與無理數當成互相包含。",
        ],
        tags=["s1-1-1", "實數", "分類", "性質", "分支"],
        manual_order=280,
    )
    topics_by_id["s1-1-1-real-number-core"]["modifiedAt"] = updated_at

    set_branch_topic(
        topics_by_id["senior-real-number-interval-compare"],
        title="數值大小比較",
        parent_id="s1-1-1-main-theme-real-line",
        role="分支重點",
        formula_lines=[
            ("根式比較", [r"a,b\ge0\Rightarrow a<b\Leftrightarrow a^2<b^2"]),
            ("夾值", [r"a^2<N<b^2\Rightarrow a<\sqrt{N}<b"]),
            ("算幾不等式", [r"\frac{a+b}{2}\ge\sqrt{ab}\quad(a,b\ge0)"]),
        ],
        usage=[
            "把根式比較、夾值估計與算幾不等式集中在同一支，比較符合截圖結構。",
            "遇到根式、分式與小數混在一起比大小時，這支就是主要工作區。",
        ],
        examples=[
            r"比較 $3\sqrt{2}$ 與 $2\sqrt{5}$，可平方比較 $18$ 與 $20$。",
            r"若 $a,b\ge0$，則 $\frac{a+b}{2}\ge\sqrt{ab}$，可拿來做最大積或最小和。",
        ],
        tips=[
            "只有在兩邊都非負時，平方比較才安全。",
            "算幾不等式使用前先檢查變數是否非負。",
        ],
        notes=[
            "截圖中的『根式比較法』與『算幾不等式』都整併在這個分支內。",
        ],
        mistakes=[
            "忘記先確認非負就直接平方或套 AM-GM。",
        ],
        tags=["s1-1-1", "實數", "大小比較", "AM-GM", "分支"],
        manual_order=281,
    )
    topics_by_id["senior-real-number-interval-compare"]["modifiedAt"] = updated_at

    set_branch_topic(
        topics_by_id["senior-real-line-interval-notation"],
        title="數線上的尺規作圖",
        parent_id="s1-1-1-main-theme-real-line",
        role="分支重點",
        formula_lines=[
            ("有理點作圖", [r"\text{利用平行線截比例線段作出 }\frac{p}{q}"]),
            ("根號數作圖", [r"\text{利用畢氏定理或比例中項作出 }\sqrt{n}"]),
            ("目標", [r"\text{把抽象數值轉成數線上的點}"]),
        ],
        usage=[
            "這一支專門承接截圖中的尺規作圖，不再和區間、不等式混在同一層。",
            "很適合老師上課時搭配圖形講解『數也可以被作出來』的觀念。",
        ],
        examples=[
            r"可利用比例線段在數線上標出 $\frac{3}{5}$。",
            r"可用直角三角形或比例中項作出 $\sqrt{2}$、$\sqrt{3}$、$\sqrt{n}$。",
        ],
        tips=[
            "先分清是要作有理點還是根號點，作圖工具與想法不同。",
        ],
        notes=[
            "這裡以截圖為主，只保留尺規作圖這條主分支。",
        ],
        mistakes=[
            "把作圖步驟和代數估值混成同一題型，失去重點。",
        ],
        tags=["s1-1-1", "實數", "數線", "尺規作圖", "分支"],
        manual_order=286,
    )
    topics_by_id["senior-real-line-interval-notation"]["modifiedAt"] = updated_at

    # Distance theme.
    set_branch_topic(
        topics_by_id["senior-distance-midpoint-section-formulas"],
        title="數線幾何基礎",
        parent_id="s1-1-1-main-theme-distance",
        role="分支重點",
        formula_lines=[
            ("距離與絕對值", [r"OP=|a|", r"PQ=|a-b|"]),
            ("中點", [r"M=\frac{a+b}{2}"]),
            ("分點公式", [r"x=\frac{mb+na}{m+n}\quad(\text{內分})"]),
        ],
        usage=[
            "把距離、絕對值、中點與基本分點公式先放在同一支，作為後續應用的地基。",
        ],
        examples=[
            r"若 $A(2),B(10)$，則 $AB=|2-10|=8$，中點為 $6$。",
        ],
        tips=[
            "先畫出數線位置，再決定要用距離觀念還是分點公式。",
        ],
        notes=[
            "依照截圖，這一支承接『距離與絕對值』及『分點公式與中點』。",
        ],
        mistakes=[
            "把距離算成有正負的量。",
            "中點與內分點公式混用。",
        ],
        tags=["s1-1-1", "距離", "分點", "中點", "分支"],
        manual_order=288,
    )
    topics_by_id["senior-distance-midpoint-section-formulas"]["modifiedAt"] = updated_at

    distance_application_id = "s1-1-1-distance-section-application"
    if distance_application_id in topics_by_id:
        distance_application = topics_by_id[distance_application_id]
        distance_application["modifiedAt"] = updated_at
        set_branch_topic(
            distance_application,
            title="分點公式的應用",
            parent_id="s1-1-1-main-theme-distance",
            role="分支重點",
            formula_lines=[
                ("位置判斷", [r"\text{內分點在線段內，外分點在線段外}"]),
                ("夾值", [r"\text{先看比例，再檢查結果是否落在合理區間}"]),
                ("應用思路", [r"\text{公式代入}\rightarrow\text{數線驗算}"]),
            ],
            usage=[
                "利用分點公式判定數值在數線上的相對位置與夾值範圍。",
                "適合接續基礎公式後，進入應用判讀與文字題。",
            ],
            examples=[
                r"若內分點比例為 $2:3$，結果應落在兩端點之間，不可能跑到外側。",
            ],
            tips=[
                "算完分點後一定回到數線上驗位置，這比死背公式更重要。",
            ],
            notes=[
                "這是依照截圖新增的第二個正式分支。",
            ],
            mistakes=[
                "只代公式不檢查位置，導致內外分判斷顛倒。",
            ],
            tags=["s1-1-1", "分點", "應用", "分支"],
            manual_order=289,
        )
    else:
        distance_application = make_branch_topic(
            topic_id=distance_application_id,
            title="分點公式的應用",
            parent_id="s1-1-1-main-theme-distance",
            role="分支重點",
            formula_lines=[
                ("位置判斷", [r"\text{內分點在線段內，外分點在線段外}"]),
                ("夾值", [r"\text{先看比例，再檢查結果是否落在合理區間}"]),
                ("應用思路", [r"\text{公式代入}\rightarrow\text{數線驗算}"]),
            ],
            usage=[
                "利用分點公式判定數值在數線上的相對位置與夾值範圍。",
                "適合接續基礎公式後，進入應用判讀與文字題。",
            ],
            examples=[
                r"若內分點比例為 $2:3$，結果應落在兩端點之間，不可能跑到外側。",
            ],
            tips=[
                "算完分點後一定回到數線上驗位置，這比死背公式更重要。",
            ],
            notes=[
                "這是依照截圖新增的第二個正式分支。",
            ],
            mistakes=[
                "只代公式不檢查位置，導致內外分判斷顛倒。",
            ],
            tags=["s1-1-1", "分點", "應用", "分支"],
            manual_order=289,
            modified_at=updated_at,
        )
        topics.append(distance_application)
        topics_by_id[distance_application_id] = distance_application

    # Update question mapping so deleted fine-grained ids still resolve to the new branch layer.
    question_formula_remap = {
        "senior-repeating-decimal-to-fraction": "senior-decimal-type-rational",
        "senior-terminating-decimal-denominator-test": "senior-decimal-type-rational",
        "senior-proof-irrational-square-root-two": "senior-irrational-number-basics",
        "senior-radical-simplification-real": "senior-irrational-operations",
        "senior-radical-comparison-methods": "senior-real-number-interval-compare",
    }
    for question in question_db.get("questions", []):
        formula_id = str(question.get("formula_id", "")).strip()
        if formula_id in question_formula_remap:
            question["formula_id"] = question_formula_remap[formula_id]

    # Remove the old fine-grained branches that the screenshot no longer wants as separate nodes.
    remove_ids = {
        "senior-repeating-decimal-to-fraction",
        "senior-terminating-decimal-denominator-test",
        "senior-proof-irrational-square-root-two",
        "senior-radical-simplification-real",
        "senior-radical-comparison-methods",
        "senior-arithmetic-geometric-mean",
    }
    formula_db["topics"] = [
        topic for topic in topics if str(topic.get("id", "")).strip() not in remove_ids
    ]
    formula_db.setdefault("meta", {})
    formula_db["meta"]["count"] = len(formula_db["topics"])
    formula_db["meta"]["updatedAt"] = updated_at
    formula_db["meta"]["lastImportSource"] = "s1-1-1 structure flattened from screenshot"

    question_db.setdefault("meta", {})
    question_db["meta"]["count"] = len(question_db.get("questions", []))
    question_db["meta"]["updatedAt"] = updated_at

    main_topic_by_id = main_topic_db.get("byId", {})
    update_table_rows(
        main_topic_by_id.get("s1-1-1-main-theme-rational"),
        [
            ["有理數的定義與結構", "從整數比、分類與封閉性切入，先建立有理數的核心概念。"],
            ["十進位表示法", "把有限小數、循環小數、分母判斷與循環小數化分數收在同一支。"],
            ["有理數的稠密性", "理解兩個有理數之間一定還有別的有理數，並會用平均數找中間值。"],
            ["近似值與估計", "利用四捨五入區間反推原分數或參數範圍。"],
        ],
        updated_at,
    )
    update_table_rows(
        main_topic_by_id.get("s1-1-1-main-theme-irrational"),
        [
            ["無理數的判定與證明", "整合反證法與無理數相等性質，先建立判定與證明路線。"],
            ["根式的化簡技巧", "把同類根式、分母有理化與雙重根號化簡集中處理。"],
            ["根式的數值分析", "處理平方根估值、整數部分與小數部分這類根式求值題。"],
        ],
        updated_at,
    )
    update_table_rows(
        main_topic_by_id.get("s1-1-1-main-theme-real-line"),
        [
            ["實數的分類與性質", "用集合觀念整理實數、有理數、無理數與基本性質。"],
            ["數值大小比較", "整合根式比較、夾值估計與算幾不等式的極值想法。"],
            ["數線上的尺規作圖", "把有理點作圖與根號數作圖整理成單一分支。"],
        ],
        updated_at,
    )
    update_table_rows(
        main_topic_by_id.get("s1-1-1-main-theme-distance"),
        [
            ["數線幾何基礎", "從距離、絕對值、中點與基本分點公式建立數線幾何基礎。"],
            ["分點公式的應用", "用公式結構判斷數值在數線上的相對位置與夾值範圍。"],
        ],
        updated_at,
    )
    main_topic_db.setdefault("meta", {})
    main_topic_db["meta"]["updatedAt"] = updated_at

    save_json(FORMULA_DB, formula_db)
    save_json(QUESTION_DB, question_db)
    save_json(MAIN_TOPIC_OVERVIEW_DB, main_topic_db)

    print("Updated s1-1-1 branch structure from screenshot.")


if __name__ == "__main__":
    main()
