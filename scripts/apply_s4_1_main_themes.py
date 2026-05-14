from __future__ import annotations

import json
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
CHAPTER_OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
SOURCE_PDF = ROOT / "exports" / "s4-source" / "s4-readable-paged.pdf"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "fourth-volume-topic-pdfs.json"

TZ = timezone(timedelta(hours=8))
SOURCE_REF = "高二下數A全重點_易讀版分頁版.docx"

TOPIC_PLAN = [
    {
        "chapterCode": "s4-1-1",
        "groupName": "空間概念",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "空間概念",
            "section": "空間概念",
            "domain": "空間幾何",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 1,
        },
        "rootId": "senior-space-concepts-main-s411",
        "paragraphEditable": (
            "1. 這章正式改以兩個主題當主軸：空間概念、三垂線定理。\n"
            "2. 先分清楚點、線、面之間的關係，再去看角度、距離與投影；不要一開始就急著記結論。\n"
            "3. 三垂線定理和空間投影常一起出現，看到線垂直面又有投影時，優先回到這章的第二個主題。\n"
            "4. 章節大綱第三欄先直接取主題整理中的重點，之後再慢慢拆成更細的分支。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的兩個主題頁。整理時先抓空間中點線面的基本關係，再往投影與三垂線定理延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "space-concepts",
                "title": "空間概念",
                "page": 2,
                "mainThemeId": "s4-1-1-main-theme-space-concepts",
                "wrapperId": "s4-1-1-space-concepts-core",
                "summary": "整理空間中的點線面基本公設、位置關係、線垂直面與兩面角。",
                "rows": [
                    ["基本公設", "兩相異點決定一直線；不共線三點決定一平面；若直線上有兩點在某平面內，則整條直線都在該平面內。"],
                    ["決定平面的方式", "不共線三點、一條直線和線外一點、兩相交直線、兩平行直線，都可以唯一決定一個平面。"],
                    ["線面位置關係", "空間中兩直線可能重合、相交、平行、歪斜；直線與平面可能平行、交於一點，或整條落在平面上。"],
                    ["線垂直面", "若直線和一平面交於點 \\(P\\)，而且平面中所有經過 \\(P\\) 的直線都和它垂直，才叫做線垂直面。"],
                    ["兩面角", "兩平面相交時，可在交線上一點作兩條都垂直交線的線段，這兩條線的夾角就是兩面角。"],
                    ["讀題提醒", "線和線、線和面、面和面是三種不同的垂直概念，不要混在一起。"],
                ],
                "branchIds": [
                    "s4-1-1-space-concept-core",
                    "senior-space-concepts-distance-angle-s411",
                    "senior-space-concepts-coplanar-test-s411",
                    "senior-space-line-plane-position-cases-s411",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "three-perpendicular-theorem",
                "title": "三垂線定理",
                "page": 3,
                "mainThemeId": "s4-1-1-main-theme-three-perpendicular-theorem",
                "wrapperId": "s4-1-1-three-perpendicular-theorem-core",
                "summary": "整理三垂線定理的情境、投影轉換與空間最短距離想法。",
                "rows": [
                    ["核心情境", "一條直線垂直某平面後，會把空間中的垂直關係投影到平面上。"],
                    ["基本敘述", "若直線 \\(L\\) 垂直平面 \\(\\Pi\\) 於點 \\(P\\)，平面內有一直線 \\(m\\) 不經過 \\(P\\)，過 \\(P\\) 向 \\(m\\) 作垂線交於 \\(Q\\)，則 \\(L\\) 上任一點 \\(A\\) 到 \\(Q\\) 的連線也會垂直 \\(m\\)。"],
                    ["反向形式", "若從垂直於平面的直線上取一點向平面中的線作垂線，則它在平面上的投影線段也會垂直該線。"],
                    ["幾何意義", "這個定理是在說空間中的垂線和投影到平面後的垂線可以互相轉換。"],
                    ["常見用途", "常用來處理斜線與平面、投影長、以及空間中最短距離的比較。"],
                    ["讀題提醒", "看到線垂直平面和投影同時出現時，優先回頭想三垂線定理。"],
                ],
                "branchIds": [
                    "senior-space-concepts-projection-workflow-s411",
                    "senior-space-three-perpendicular-theorem-s411",
                ],
            },
        ],
    },
    {
        "chapterCode": "s4-1-2",
        "groupName": "空間向量的坐標表示法",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "空間向量的坐標表示法",
            "section": "空間向量的坐標表示法",
            "domain": "空間幾何",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 2,
        },
        "rootId": "senior-space-vector-coordinate-main-s412",
        "paragraphEditable": (
            "1. 這章正式改以三個主題當主軸：空間坐標、空間向量、空間向量的運算。\n"
            "2. 先把三維坐標系和點的位置感建立起來，再往向量長度、方向角與分點運算走，會順很多。\n"
            "3. 看到共面、分點、加權平均時，先判斷它是在考坐標本身，還是已經進到向量運算。\n"
            "4. 方向角與方向餘弦是這章很容易漏掉的主軸，後面主題頁已經獨立整理。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的三個主題頁。整理時先抓空間坐標與點的位置，再往空間向量與分點、線性組合延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "space-coordinate",
                "title": "空間坐標",
                "page": 5,
                "mainThemeId": "s4-1-2-main-theme-space-coordinate",
                "wrapperId": "s4-1-2-space-coordinate-core",
                "summary": "整理空間直角坐標系、八卦限、點的表示與到軸平面的距離。",
                "rows": [
                    ["空間直角坐標系", "在空間中經過原點作三條互相垂直的 \\(x\\)、\\(y\\)、\\(z\\) 軸，就能建立空間直角坐標系。"],
                    ["八卦限與點的位置", "空間中的一點記作 \\(P(a,b,c)\\)，三個數分別表示它在三個坐標方向上的位置；第一卦限滿足 \\(x>0,y>0,z>0\\)。"],
                    ["垂足與投影", "把某一個坐標改成 0，就能得到它在對應坐標平面上的投影點；只保留一個坐標，則是對坐標軸的垂足。"],
                    ["對稱規則", "對某一坐標軸或平面對稱時，只要改變對應坐標的正負號。"],
                    ["到平面或坐標軸的距離", "到 \\(xy\\) 平面的距離是 \\(|z|\\)，到 \\(x\\) 軸的距離是 \\(\\sqrt{y^2+z^2}\\) 這類二維距離。"],
                    ["空間距離", "原點到 \\(P(a,b,c)\\) 的距離是 \\(\\sqrt{a^2+b^2+c^2}\\)；兩點距離則用三個坐標差的平方和開根號。"],
                ],
                "branchIds": [
                    "s4-1-2-space-vector-coordinate-core",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "space-vector",
                "title": "空間向量",
                "page": 6,
                "mainThemeId": "s4-1-2-main-theme-space-vector",
                "wrapperId": "s4-1-2-space-vector-core",
                "summary": "整理空間向量的坐標表示、長度、方向角與方向餘弦。",
                "rows": [
                    ["向量坐標的意思", "把向量平移到原點出發後，終點坐標就是這個向量的坐標表示。"],
                    ["長度與兩點決定向量", "若 \\(\\vec{u}=(a,b,c)\\)，則 \\(|\\vec{u}|=\\sqrt{a^2+b^2+c^2}\\)；兩點決定向量就用三個坐標分別相減。"],
                    ["零向量", "\\((0,0,0)\\) 是零向量，長度為 0，方向不特別指定。"],
                    ["方向角", "向量和三個坐標軸正向的夾角分別叫方向角，常記為 \\(\\alpha,\\beta,\\gamma\\)。"],
                    ["方向餘弦", "若 \\(\\vec{u}=(x_0,y_0,z_0)\\)，則各方向餘弦可用分量除以向量長度求出。"],
                    ["重要恆等式", "方向餘弦滿足 \\(\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1\\)，也可用 \\((r\\cos\\alpha,r\\cos\\beta,r\\cos\\gamma)\\) 寫出向量。"],
                ],
                "branchIds": [
                    "senior-space-vector-direction-cosines-s412",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "space-vector-operations",
                "title": "空間向量的運算",
                "page": 7,
                "mainThemeId": "s4-1-2-main-theme-space-vector-operations",
                "wrapperId": "s4-1-2-space-vector-operations-core",
                "summary": "整理加減數乘、平行、內外分點、線性組合、共面判定與重心。",
                "rows": [
                    ["加減法與係數積", "空間向量的加減法就是三個坐標分量分別相加減；乘上實數時，每個分量都一起乘。"],
                    ["平行判定", "兩個非零向量平行，等價於其中一個是另一個的倍數。"],
                    ["內外分點", "內分用加權平均，外分改成 \\(m-n\\) 型分母，而且要注意點落在線段外。"],
                    ["角平分線與比例", "空間中的角平分或比例題，常先改成分點與向量加權平均。"],
                    ["線性組合與共面", "像 \\(\\alpha\\vec{a}+\\beta\\vec{b}+\\gamma\\vec{c}\\) 這類式子，是之後討論共面與位置表示的重要工具。"],
                    ["重心想法", "若三角形頂點位置向量已知，重心可用三個頂點向量平均得到。"],
                ],
                "branchIds": [
                    "senior-space-vector-midpoint-section-s412",
                    "senior-space-vector-linear-combination-s412",
                    "senior-space-vector-independence-coplanarity-s412",
                    "senior-space-vector-centroid-weighted-average-s412",
                ],
            },
        ],
    },
    {
        "chapterCode": "s4-1-3",
        "groupName": "空間向量的內積",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "空間向量的內積",
            "section": "空間向量的內積",
            "domain": "空間幾何",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 3,
        },
        "rootId": "senior-space-dot-product-main-s413",
        "paragraphEditable": (
            "1. 這章正式改以兩個主題當主軸：向量內積與柯西不等式、正射影與正射影長。\n"
            "2. 這章最重要的是把角度、垂直、長度、投影全部拉回內積來看，不要拆成互不相干的小公式。\n"
            "3. 看題目時先判斷它是在考內積本身、柯西最值，還是正射影與分解，再往下看對應分支。\n"
            "4. 線面角與線線角的統一處理仍放在內積主題底下，不要提早挪到後面平面直線章。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的兩個主題頁。整理時先抓內積與柯西，再往投影、投影長與垂直分解延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "space-dot-product-cauchy",
                "title": "向量內積與柯西不等式",
                "page": 9,
                "mainThemeId": "s4-1-3-main-theme-space-dot-product-cauchy",
                "wrapperId": "s4-1-3-space-dot-product-cauchy-core",
                "summary": "整理空間內積、角度、垂直、基本性質與柯西不等式。",
                "rows": [
                    ["內積定義", "若兩非零向量夾角為 \\(\\theta\\)，則 \\(\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta\\)。"],
                    ["坐標公式", "若 \\(\\vec{a}=(a_1,a_2,a_3)\\)、\\(\\vec{b}=(b_1,b_2,b_3)\\)，則 \\(\\vec{a}\\cdot\\vec{b}=a_1b_1+a_2b_2+a_3b_3\\)。"],
                    ["角度與垂直", "\\(\\cos\\theta=\\dfrac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}||\\vec{b}|}\\)；非零向量內積為 0 時表示互相垂直。"],
                    ["基本性質", "內積可交換、可分配、可提出係數，計算上很像一般乘法。"],
                    ["柯西不等式", "\\(|\\vec{a}\\cdot\\vec{b}|\\le |\\vec{a}||\\vec{b}|\\)，等號成立時代表兩向量平行。"],
                    ["讀題提醒", "看到垂直、夾角、長度、最大最小值同時出現時，通常可以先考慮內積。"],
                ],
                "branchIds": [
                    "s4-1-3-space-dot-product-core",
                    "senior-space-dot-product-line-plane-angle-s413",
                    "senior-space-dot-product-cauchy-s413",
                    "senior-space-dot-product-angle-unification-s413",
                    "senior-space-dot-product-extreme-equality-s413",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "orthogonal-projection-length",
                "title": "正射影與正射影長",
                "page": 10,
                "mainThemeId": "s4-1-3-main-theme-orthogonal-projection-length",
                "wrapperId": "s4-1-3-orthogonal-projection-length-core",
                "summary": "整理正射影、投影長、與夾角、垂直分解的連結。",
                "rows": [
                    ["正射影的意思", "把一個向量沿垂直方向投影到另一個向量所在的直線上。"],
                    ["投影向量公式", "\\(\\operatorname{proj}_{\\vec{b}}\\vec{a}=\\dfrac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|^2}\\vec{b}\\)，前提是 \\(\\vec{b}\\neq\\vec{0}\\)。"],
                    ["正射影長", "投影長度是 \\(\\dfrac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|}\\)；若只談長度常取絕對值。"],
                    ["和夾角的關係", "投影長就是 \\(|\\vec{a}|\\cos\\theta\\)，所以它其實是在量某個方向上的分量。"],
                    ["垂直分解", "任意向量都能拆成沿 \\(\\vec{b}\\) 的部分和垂直 \\(\\vec{b}\\) 的部分。"],
                    ["讀題提醒", "看到投影長、垂足、最短距離或沿某方向的分量時，優先回頭想正射影。"],
                ],
                "branchIds": [
                    "senior-space-dot-product-projection-s413",
                ],
            },
        ],
    },
    {
        "chapterCode": "s4-1-4",
        "groupName": "外積、體積與行列式",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "外積、體積與行列式",
            "section": "外積、體積與行列式",
            "domain": "空間幾何",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 4,
        },
        "rootId": "senior-cross-product-volume-main-s414",
        "paragraphEditable": (
            "1. 這章正式改以三個主題當主軸：外積、面積與體積；三階行列式；三階行列式的應用。\n"
            "2. 這章最重要的是把外積當成方向與面積工具，把三階行列式當成體積與共面的代數版本。\n"
            "3. 看題目時先分清楚它是在考外積方向、三階行列式展開，還是面積體積與共面判斷。\n"
            "4. 外積法求空間距離仍放在這章，不要和上一章的正射影距離做法混在一起。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的三個主題頁。整理時先抓外積，再往三階行列式與其幾何應用延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "cross-product-area-volume",
                "title": "外積、面積與體積",
                "page": 12,
                "mainThemeId": "s4-1-4-main-theme-cross-product-area-volume",
                "wrapperId": "s4-1-4-cross-product-area-volume-core",
                "summary": "整理外積的定義、右手定則、面積、體積與共面判斷。",
                "rows": [
                    ["外積定義", "兩向量 \\(\\vec{a}\\times\\vec{b}\\) 是一個同時垂直於兩者的向量。"],
                    ["大小的幾何意義", "\\(|\\vec{a}\\times\\vec{b}|=|\\vec{a}||\\vec{b}|\\sin\\theta\\)，代表兩向量張成的平行四邊形面積。"],
                    ["方向規則", "外積方向由右手定則決定，所以 \\(\\vec{a}\\times\\vec{b}=-(\\vec{b}\\times\\vec{a})\\)。"],
                    ["平行判定", "兩非零向量平行時，外積會變成零向量。"],
                    ["三角形面積與體積", "三角形面積是 \\(\\dfrac{1}{2}|\\vec{a}\\times\\vec{b}|\\)；平行六面體體積可用 \\(|\\vec{a}\\cdot(\\vec{b}\\times\\vec{c})|\\) 表示。"],
                    ["共面判斷", "若 \\(\\vec{a}\\cdot(\\vec{b}\\times\\vec{c})=0\\)，表示三向量共面。"],
                ],
                "branchIds": [
                    "s4-1-4-cross-volume-determinant-core",
                    "senior-scalar-triple-product-volume-s414",
                    "senior-cross-product-right-hand-rule-s414",
                    "senior-cross-product-line-distance-s414",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "third-order-determinant",
                "title": "三階行列式",
                "page": 13,
                "mainThemeId": "s4-1-4-main-theme-third-order-determinant",
                "wrapperId": "s4-1-4-third-order-determinant-core",
                "summary": "整理三階行列式的展開、換列換號、提因數與線性性質。",
                "rows": [
                    ["三階行列式角色", "它是外積和混合積在計算上的代數表示。"],
                    ["展開方法", "可沿某一列或某一行展開，也可用熟悉的對角線記法輔助計算。"],
                    ["換列換號", "互換兩列或兩行會變號；若兩列或兩行成比例，值就為 0。"],
                    ["提公因數", "某一列或某一行同乘常數，整個行列式就同乘那個常數。"],
                    ["線性性質", "對某一列或某一行做線性組合時，行列式的值會跟著對應變化。"],
                    ["計算提醒", "三階行列式最容易錯在符號順序，展開時一定要顧正負號。"],
                ],
                "branchIds": [
                    "senior-determinant-3x3-expansion-s414",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "third-order-determinant-applications",
                "title": "三階行列式的應用",
                "page": 14,
                "mainThemeId": "s4-1-4-main-theme-third-order-determinant-applications",
                "wrapperId": "s4-1-4-third-order-determinant-applications-core",
                "summary": "整理平面面積、空間體積、共線共面與行列式的幾何判定。",
                "rows": [
                    ["平面三點面積", "二維三角形面積可寫成二階行列式的絕對值再除以 \\(2\\)。"],
                    ["空間體積", "三向量張成的體積可用三階行列式的絕對值表示。"],
                    ["共線與共面判斷", "二維三點共線時面積為 0；三維向量共面時三階行列式為 0。"],
                    ["直線方程式應用", "平面上過兩點的直線方程式，也可用行列式整理成整齊形式。"],
                    ["幾何與代數連結", "行列式不只是計算工具，它常拿來判斷圖形退化、體積是否為零。"],
                    ["讀題提醒", "只要題目同時有坐標、面積、體積、共面或共線，就優先想行列式。"],
                ],
                "branchIds": [
                    "senior-collinear-coplanar-tests-determinant-s414",
                ],
            },
        ],
    },
]


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def formula_topic_template(root: dict, chapter_meta: dict, topic_id: str, title: str, parent_id: str, summary: str, updated_at: str, order_index: int) -> dict:
    chapter_code = root.get("chapterCode", root.get("chapter_code", ""))
    return {
        "id": topic_id,
        "title": title,
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "定位", "values": [rf"\text{{{title}}}"]},
                {"label": "摘要", "values": [rf"\text{{{summary}}}"]},
            ],
        },
        "stage": chapter_meta["stage"],
        "grade": chapter_meta["grade"],
        "term": chapter_meta["term"],
        "chapter": chapter_meta["chapter"],
        "domain": chapter_meta["domain"],
        "difficulty": root.get("difficulty", "基礎"),
        "chapterRole": "主題",
        "parentId": parent_id,
        "tags": [chapter_code, "主題", title],
        "usage": [summary],
        "examples": ["先看這一層主題整理，再往下展開原本的分支內容。"],
        "tips": ["如果題目太雜，先判斷它屬於哪個主題，再決定要往哪組分支看。"],
        "notes": ["這一層是固定主軸，之後章節大綱和主題頁都會先看這裡。"],
        "mistakes": ["不要把章節根節點和主題層當成同一層。"],
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": chapter_meta["gradeLabel"],
        "section": chapter_meta["section"],
        "domainSub": chapter_meta["domainSub"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": order_index,
        "orderIndex": order_index,
        "stageOrder": chapter_meta["stageOrder"],
        "gradeOrder": chapter_meta["gradeOrder"],
        "termOrder": chapter_meta["termOrder"],
        "chapterOrder": chapter_meta["chapterOrder"],
    }


def wrapper_topic_template(root: dict, chapter_meta: dict, wrapper_id: str, title: str, parent_id: str, summary: str, rows: list[list[str]], updated_at: str) -> dict:
    chapter_code = root.get("chapterCode", root.get("chapter_code", ""))
    top_lines = []
    for index, row in enumerate(rows[:3], start=1):
        top_lines.append({"label": f"重點{index}", "values": [row[0]]})
    return {
        "id": wrapper_id,
        "title": title,
        "formula": {"type": "labeled-lines", "lines": top_lines},
        "stage": chapter_meta["stage"],
        "grade": chapter_meta["grade"],
        "term": chapter_meta["term"],
        "chapter": chapter_meta["chapter"],
        "domain": chapter_meta["domain"],
        "difficulty": root.get("difficulty", "基礎"),
        "chapterRole": "主題",
        "parentId": parent_id,
        "contentTypes": ["公式", "定義", "題型", "使用技巧", "注意事項", "常見錯誤"],
        "contentTypesLocked": True,
        "tags": [chapter_code, title, "重點整理"],
        "usage": [summary],
        "examples": [],
        "tips": ["先看主題整理，再往下接既有分支。"],
        "notes": [f"來源：{SOURCE_REF}"],
        "mistakes": ["不要跳過主題整理就直接往下看分支。"],
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": chapter_meta["gradeLabel"],
        "section": chapter_meta["section"],
        "domainSub": chapter_meta["domainSub"],
        "isBranch": True,
        "stageOrder": chapter_meta["stageOrder"],
        "gradeOrder": chapter_meta["gradeOrder"],
        "termOrder": chapter_meta["termOrder"],
        "chapterOrder": chapter_meta["chapterOrder"],
        "manualOrder": 100,
        "orderIndex": 1,
    }


def upsert_topic(topics: list[dict], payload: dict) -> None:
    for index, topic in enumerate(topics):
        if topic.get("id") == payload["id"]:
            topics[index] = payload
            return
    topics.append(payload)


def find_topic(topics: list[dict], topic_id: str) -> dict:
    for topic in topics:
        if topic.get("id") == topic_id:
            return topic
    raise KeyError(f"Topic not found: {topic_id}")


def set_chapter_fields(topic: dict, chapter_code: str) -> None:
    topic["chapter_code"] = chapter_code
    topic["chapterCode"] = chapter_code


def reparent_branch(topics: list[dict], topic_id: str, parent_id: str, chapter_code: str) -> None:
    topic = find_topic(topics, topic_id)
    topic["parentId"] = parent_id
    set_chapter_fields(topic, chapter_code)


def normalize_chapter_topics(topics: list[dict], chapter_code: str, chapter_meta: dict) -> None:
    for topic in topics:
        topic_chapter_code = topic.get("chapterCode", topic.get("chapter_code", ""))
        if topic_chapter_code != chapter_code:
            continue
        topic["stage"] = chapter_meta["stage"]
        topic["grade"] = chapter_meta["grade"]
        topic["term"] = chapter_meta["term"]
        topic["gradeLabel"] = chapter_meta["gradeLabel"]
        topic["chapter"] = chapter_meta["chapter"]
        topic["section"] = chapter_meta["section"]
        topic["domain"] = chapter_meta["domain"]
        topic["domainSub"] = chapter_meta["domainSub"]
        topic["stageOrder"] = chapter_meta["stageOrder"]
        topic["gradeOrder"] = chapter_meta["gradeOrder"]
        topic["termOrder"] = chapter_meta["termOrder"]
        topic["chapterOrder"] = chapter_meta["chapterOrder"]
        set_chapter_fields(topic, chapter_code)


def build_main_topic_entry(topic_id: str, title: str, rows: list[list[str]], pdf_file: str, updated_at: str) -> dict:
    return {
        "id": topic_id,
        "title": title,
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "table",
                        "headers": ["重點", "整理"],
                        "rows": rows,
                    }
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "pdf-page",
                        "src": f"exports/main-theme-overviews/{pdf_file}",
                        "note": title,
                    }
                ],
            },
        ],
    }


def write_pdf_page(reader: PdfReader, page_number: int, destination: Path) -> None:
    writer = PdfWriter()
    writer.add_page(reader.pages[page_number - 1])
    with destination.open("wb") as handle:
        writer.write(handle)


def reminder_from_rows(rows: list[list[str]]) -> str:
    heads = [row[0] for row in rows[:4]]
    if not heads:
        return ""
    if len(heads) == 1:
        return heads[0]
    return "、".join(heads) + " 等重點"


def ensure_chapter_variant(entry: dict, variant_id: str, label: str, paragraph: str) -> dict:
    variants = entry.setdefault("variants", [])
    for variant in variants:
        if variant.get("id") == variant_id:
            break
    else:
        variant = {"id": variant_id, "label": label, "sections": []}
        variants.append(variant)

    variant["sections"] = [
        {"type": "paragraph", "text": paragraph},
        {"type": "table", "headers": ["主題", "角色", "下一層 / 提醒"], "rows": []},
    ]
    return variant


def update_chapter_overview(chapter_overview_db: dict, chapter_plan: dict, updated_at: str) -> None:
    rows = []
    for topic_plan in chapter_plan["topics"]:
        rows.append([topic_plan["title"], "主題", reminder_from_rows(topic_plan["rows"])])

    overviews = chapter_overview_db.setdefault("overviews", {})
    entry = overviews.setdefault(
        chapter_plan["chapterCode"],
        {
            "groupName": chapter_plan["groupName"],
            "title": "章節重點大綱",
            "variants": [],
        },
    )
    entry["groupName"] = chapter_plan["groupName"]
    entry["title"] = "章節重點大綱"
    entry["updatedAt"] = updated_at

    editable = ensure_chapter_variant(entry, "editable", "可修改版", chapter_plan["paragraphEditable"])
    original = ensure_chapter_variant(entry, "original", "原稿版", chapter_plan["paragraphOriginal"])

    for variant in [editable, original]:
        variant["sections"][1]["rows"] = deepcopy(rows)


def merge_manifest(existing_topics: list[dict], new_topics: list[dict], chapter_codes: set[str]) -> list[dict]:
    merged = [topic for topic in existing_topics if topic.get("chapterCode") not in chapter_codes]
    merged.extend(new_topics)
    return sorted(merged, key=lambda item: (item.get("chapterCode", ""), int(item.get("topicNumber", 0))))


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    chapter_overview_db = load_json(CHAPTER_OVERVIEW_DB)
    topics = formula_db.get("topics", [])
    main_topic_by_id = main_topic_db.setdefault("byId", {})
    ensure_dir(PDF_EXPORT_DIR)
    reader = PdfReader(str(SOURCE_PDF))

    existing_manifest = {"topics": []}
    if PDF_MANIFEST.exists():
        existing_manifest = load_json(PDF_MANIFEST)

    new_manifest_topics: list[dict] = []
    chapter_codes = {plan["chapterCode"] for plan in TOPIC_PLAN}

    for chapter_plan in TOPIC_PLAN:
        chapter_code = chapter_plan["chapterCode"]
        root = find_topic(topics, chapter_plan["rootId"])
        chapter_meta = chapter_plan["meta"]

        for topic_plan in chapter_plan["topics"]:
            topic_number = topic_plan["topicNumber"]
            pdf_file = f"{chapter_code}-topic-{topic_number}-{topic_plan['slug']}.pdf"
            pdf_path = PDF_EXPORT_DIR / pdf_file
            write_pdf_page(reader, topic_plan["page"], pdf_path)

            main_theme_payload = formula_topic_template(
                root,
                chapter_meta,
                topic_plan["mainThemeId"],
                topic_plan["title"],
                chapter_plan["rootId"],
                topic_plan["summary"],
                updated_at,
                topic_number,
            )
            wrapper_payload = wrapper_topic_template(
                root,
                chapter_meta,
                topic_plan["wrapperId"],
                topic_plan["title"],
                topic_plan["mainThemeId"],
                topic_plan["summary"],
                topic_plan["rows"],
                updated_at,
            )
            upsert_topic(topics, main_theme_payload)
            upsert_topic(topics, wrapper_payload)

            for branch_id in topic_plan["branchIds"]:
                reparent_branch(topics, branch_id, topic_plan["wrapperId"], chapter_code)

            main_topic_by_id[topic_plan["mainThemeId"]] = build_main_topic_entry(
                topic_plan["mainThemeId"],
                topic_plan["title"],
                topic_plan["rows"],
                pdf_file,
                updated_at,
            )

            new_manifest_topics.append(
                {
                    "chapterCode": chapter_code,
                    "topicNumber": topic_number,
                    "slug": topic_plan["slug"],
                    "title": topic_plan["title"],
                    "page": topic_plan["page"],
                    "file": pdf_file,
                }
            )

        normalize_chapter_topics(topics, chapter_code, chapter_meta)
        update_chapter_overview(chapter_overview_db, chapter_plan, updated_at)

    formula_db.setdefault("meta", {})
    formula_db["meta"]["count"] = len(topics)
    formula_db["meta"]["updatedAt"] = updated_at
    main_topic_db.setdefault("meta", {})
    main_topic_db["meta"]["count"] = len(main_topic_by_id)
    main_topic_db["meta"]["updatedAt"] = updated_at
    chapter_overview_db.setdefault("meta", {})
    chapter_overview_db["meta"]["count"] = len(chapter_overview_db.get("overviews", {}))
    chapter_overview_db["meta"]["updatedAt"] = updated_at

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(CHAPTER_OVERVIEW_DB, chapter_overview_db)

    merged_topics = merge_manifest(existing_manifest.get("topics", []), new_manifest_topics, chapter_codes)
    PDF_MANIFEST.write_text(
        json.dumps(
            {
                "sourcePdf": str(SOURCE_PDF.resolve()),
                "count": len(merged_topics),
                "topics": merged_topics,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print("Updated chapters:", ", ".join(plan["chapterCode"] for plan in TOPIC_PLAN))
    print("Generated PDFs:", len(new_manifest_topics))


if __name__ == "__main__":
    main()
