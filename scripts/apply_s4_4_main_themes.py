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
        "chapterCode": "s4-4-1",
        "groupName": "線性方程組與矩陣",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "矩陣",
            "section": "線性方程組與矩陣",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 7,
        },
        "rootId": "senior-linear-system-matrix-main-s441",
        "paragraphEditable": (
            "1. 這章正式改以三個主題當主軸：三元一次方程組、利用克拉瑪公式解三元一次方程組、高斯消去法與矩陣的列運算。\n"
            "2. 看到聯立方程組時，先把它想成三個平面的交集，再決定要走幾何理解、克拉瑪公式還是高斯消去。\n"
            "3. 克拉瑪公式適合規則清楚的唯一解題；一旦要判斷自由變數或解的個數，就要回到高斯消去。\n"
            "4. 章節大綱第三欄先直接取主題整理中的重點，後面再慢慢拆成更細的分支。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的三個主題頁。整理時先抓三元一次方程組，再往克拉瑪公式與高斯消去延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "three-variable-linear-system",
                "title": "三元一次方程組",
                "page": 25,
                "mainThemeId": "s4-4-1-main-theme-three-variable-linear-system",
                "wrapperId": "s4-4-1-main-theme-three-variable-linear-system-core",
                "summary": "整理三元一次聯立方程組的幾何意義、解的種類與常見解法。",
                "rows": [
                    ["一般形式", "三元一次聯立方程組由三個一次方程式組成，未知數通常是 \\(x,y,z\\)。"],
                    ["幾何意義", "每一個方程式都代表一個平面，所以解其實就是三個平面的共同交集。"],
                    ["唯一解", "三平面交於一點。"],
                    ["無限多解", "可能三平面交於一直線，或三平面完全重合。"],
                    ["無解", "三平面沒有共同交點，例如其中兩平面平行，或三平面雖兩兩相交但沒有共同交點。"],
                    ["常見解法", "代入消去法、加減消去法、克拉瑪公式、高斯消去法。"],
                ],
                "branchIds": [
                    "s4-4-1-linear-system-matrix-core",
                    "senior-linear-combination-solvability-s441",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "cramers-rule-3x3",
                "title": "利用克拉瑪公式解三元一次方程組",
                "page": 26,
                "mainThemeId": "s4-4-1-main-theme-cramers-rule-3x3",
                "wrapperId": "s4-4-1-main-theme-cramers-rule-3x3-core",
                "summary": "整理克拉瑪公式的前提、寫法、唯一解條件與幾何解讀。",
                "rows": [
                    ["前提", "係數行列式 \\(D\\neq 0\\) 時，方程組才有唯一解。"],
                    ["基本寫法", "把常數列依序代入係數矩陣，可得到 \\(D_x,D_y,D_z\\)。"],
                    ["唯一解公式", "\\(x=\\dfrac{D_x}{D}\\)、\\(y=\\dfrac{D_y}{D}\\)、\\(z=\\dfrac{D_z}{D}\\)。"],
                    ["若 \\(D=0\\)", "不能直接用克拉瑪公式判唯一解，要再看各替換行列式是否也為 0。"],
                    ["幾何解讀", "\\(D\\neq 0\\) 表示三個平面法向量不共面，因此三平面通常交於唯一一點。"],
                    ["讀題提醒", "克拉瑪公式適合計算規則清楚的方程組；若係數太複雜，高斯消去法通常更穩。"],
                ],
                "branchIds": [
                    "senior-cramer-applicability-conditions-s441",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "gaussian-elimination-row-operations",
                "title": "高斯消去法與矩陣的列運算",
                "page": 27,
                "mainThemeId": "s4-4-1-main-theme-gaussian-elimination-row-operations",
                "wrapperId": "s4-4-1-main-theme-gaussian-elimination-row-operations-core",
                "summary": "整理高斯消去、基本列運算、列階梯形、樞紐位置與自由變數。",
                "rows": [
                    ["高斯消去想法", "利用列運算把方程組一步步化簡成比較容易回代的形式。"],
                    ["三種基本列運算", "交換兩列、某一列乘非零常數、某列乘常數後加到另一列。"],
                    ["列階梯形", "把矩陣化成下面零越來越多的形狀，能快速讀出解的結構。"],
                    ["樞紐位置", "每一列最先出現的非零數，會決定主變數和自由變數。"],
                    ["增廣矩陣", "把方程組的係數和常數項寫成矩陣，有助於機械化操作。"],
                    ["讀題提醒", "列運算是在改寫同一組解，不是隨便更動方程組內容。"],
                ],
                "branchIds": [
                    "senior-gaussian-elimination-pivot-s441",
                    "senior-linear-system-rank-interpretation-s441",
                    "senior-linear-system-parametric-solution-s441",
                ],
            },
        ],
    },
    {
        "chapterCode": "s4-4-2",
        "groupName": "矩陣的運算",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "矩陣",
            "section": "矩陣的運算",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 8,
        },
        "rootId": "senior-matrix-operations-main-s442",
        "paragraphEditable": (
            "1. 這章正式改以三個主題當主軸：矩陣的定義、矩陣的加減法與係數積、矩陣的乘法。\n"
            "2. 這章最容易亂的是把加減和乘法規則混在一起，所以一定要先看矩陣的階數，再決定能不能算。\n"
            "3. 矩陣冪次、規律快速計算、初等矩陣都先掛在乘法主題下面，因為它們核心還是乘法結構。\n"
            "4. 反矩陣主題這次不放在這章，而是移到下一章的 `乘法反矩陣`。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的三個主題頁。整理時先抓矩陣定義，再往加減法、係數積與矩陣乘法延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "matrix-definition",
                "title": "矩陣的定義",
                "page": 29,
                "mainThemeId": "s4-4-2-main-theme-matrix-definition",
                "wrapperId": "s4-4-2-main-theme-matrix-definition-core",
                "summary": "整理矩陣階數、元素位置、特殊矩陣、相等條件與轉置。",
                "rows": [
                    ["矩陣的形式", "\\(m\\times n\\) 矩陣表示有 \\(m\\) 列、\\(n\\) 行的矩形陣列。"],
                    ["元素位置", "第 \\(i\\) 列第 \\(j\\) 行的元素記作 \\(a_{ij}\\)。"],
                    ["特殊矩陣", "列數等於行數的是方陣；只有一列的是列矩陣；只有一行的是行矩陣。"],
                    ["矩陣相等條件", "兩矩陣必須同階，而且每一個對應元素都相等。"],
                    ["零矩陣與單位矩陣", "零矩陣全部元素都是 0；單位矩陣對角線是 1，其餘為 0。"],
                    ["轉置矩陣", "把列和行互換得到的矩陣叫轉置矩陣。"],
                ],
                "branchIds": [
                    "s4-4-2-matrix-operations-core",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "matrix-addition-scalar-multiplication",
                "title": "矩陣的加減法與係數積",
                "page": 30,
                "mainThemeId": "s4-4-2-main-theme-matrix-addition-scalar-multiplication",
                "wrapperId": "s4-4-2-main-theme-matrix-addition-scalar-multiplication-core",
                "summary": "整理同階加減、係數積、加法性質與相反矩陣。",
                "rows": [
                    ["同階才能加減", "只有大小完全相同的矩陣，才可以做加減法。"],
                    ["運算規則", "矩陣加減法就是對應位置的元素分別相加減。"],
                    ["係數積", "實數乘矩陣時，就是把矩陣中每個元素都乘上這個數。"],
                    ["加法性質", "滿足交換律、結合律，零矩陣是加法單位元素。"],
                    ["相反矩陣", "\\(-A\\) 表示把 \\(A\\) 每個元素都乘上 \\(-1\\)，所以 \\(A+(-A)=O\\)。"],
                    ["讀題提醒", "矩陣的加減法和乘法條件不同，不要把兩種規則混在一起。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 3,
                "slug": "matrix-multiplication",
                "title": "矩陣的乘法",
                "page": 31,
                "mainThemeId": "s4-4-2-main-theme-matrix-multiplication",
                "wrapperId": "s4-4-2-main-theme-matrix-multiplication-core",
                "summary": "整理矩陣乘法條件、元素算法、乘法性質與矩陣冪次。",
                "rows": [
                    ["可乘條件", "若 \\(A\\) 是 \\(m\\times n\\)、\\(B\\) 是 \\(n\\times p\\)，則 \\(AB\\) 才有意義，結果是 \\(m\\times p\\)。"],
                    ["元素算法", "\\(AB\\) 的第 \\((i,j)\\) 元，是 \\(A\\) 的第 \\(i\\) 列和 \\(B\\) 的第 \\(j\\) 行做內積。"],
                    ["不滿足交換律", "一般來說 \\(AB\\neq BA\\)，甚至其中一個有意義、另一個可能根本沒定義。"],
                    ["結合律與分配律", "\\(A(BC)=(AB)C\\)，且 \\(A(B+C)=AB+AC\\)。"],
                    ["單位矩陣", "\\(AI=IA=A\\)，所以單位矩陣是矩陣乘法的單位元素。"],
                    ["矩陣冪次", "只有方陣才能談 \\(A^2,A^3\\) 這種冪次；做題前先看階數能不能相乘。"],
                ],
                "branchIds": [
                    "senior-matrix-elementary-matrix-s442",
                    "senior-matrix-operation-common-pitfalls-s442",
                    "senior-matrix-power-diagonalization-idea-s442",
                    "senior-matrix-power-pattern-fast-compute-s442",
                ],
            },
        ],
    },
    {
        "chapterCode": "s4-4-3",
        "groupName": "變換矩陣的應用",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "矩陣",
            "section": "變換矩陣的應用",
            "domain": "機率與統計",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 9,
        },
        "rootId": "senior-transformation-matrix-main-s443",
        "paragraphEditable": (
            "1. 這章正式改以兩個主題當主軸：轉移矩陣、乘法反矩陣。\n"
            "2. 轉移矩陣是在描述狀態如何一步一步更新；反矩陣則是在找規則的反向還原。\n"
            "3. 看到多步轉移時，先想到矩陣冪次；看到解方程組或逆運算時，再回到乘法反矩陣。\n"
            "4. 原本那些平面線性變換的舊分支，這次會移到 `s4-4-4`，不再留在這章。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的兩個主題頁。整理時先抓轉移矩陣，再往乘法反矩陣延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "transition-matrix",
                "title": "轉移矩陣",
                "page": 33,
                "mainThemeId": "s4-4-3-main-theme-transition-matrix",
                "wrapperId": "s4-4-3-main-theme-transition-matrix-core",
                "summary": "整理轉移矩陣的基本條件、狀態向量、多步轉移與穩定分布。",
                "rows": [
                    ["用途", "轉移矩陣用來描述狀態之間如何從一步轉到下一步。"],
                    ["基本條件", "矩陣中的每個元素都介於 0 和 1 之間，而且每一欄或每一列的總和會依教材約定等於 1。"],
                    ["狀態向量", "當前各狀態所占比例，可寫成向量，再用矩陣乘法求下一步。"],
                    ["多步轉移", "經過兩步、三步後的狀態，可用 \\(A^2,A^3\\) 來表示。"],
                    ["穩定分布", "若狀態向量乘上轉移矩陣後不再改變，代表進入穩定狀態。"],
                    ["讀題提醒", "做轉移矩陣題時，要先弄清楚狀態向量放在左邊還右邊，再決定乘法順序。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 2,
                "slug": "multiplicative-inverse-matrix",
                "title": "乘法反矩陣",
                "page": 34,
                "mainThemeId": "s4-4-3-main-theme-multiplicative-inverse-matrix",
                "wrapperId": "s4-4-3-main-theme-multiplicative-inverse-matrix-core",
                "summary": "整理反矩陣定義、可逆條件、二階反矩陣公式與解方程組應用。",
                "rows": [
                    ["定義", "若方陣 \\(A\\) 存在另一方陣 \\(B\\) 使得 \\(AB=BA=I\\)，則 \\(B\\) 稱為 \\(A\\) 的反矩陣，記作 \\(A^{-1}\\)。"],
                    ["不是每個方陣都有反矩陣", "若矩陣不可逆，就不存在乘法反矩陣。"],
                    ["二階判斷", "對二階方陣 \\(\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}\\)，當 \\(ad-bc\\neq 0\\) 時才可逆。"],
                    ["二階公式", "\\(A^{-1}=\\dfrac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}\\)。"],
                    ["解方程組應用", "若 \\(AX=B\\) 且 \\(A\\) 可逆，則 \\(X=A^{-1}B\\)。"],
                    ["讀題提醒", "只要分母的行列式為 0，反矩陣公式就不能用。"],
                ],
                "branchIds": [
                    "senior-inverse-matrix-and-determinant-s442",
                ],
            },
        ],
    },
    {
        "chapterCode": "s4-4-4",
        "groupName": "平面上的線性變換與二階方陣",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "矩陣",
            "section": "平面上的線性變換與二階方陣",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 10,
        },
        "rootId": "senior-plane-linear-transform-main-s444",
        "rootTitle": "平面上的線性變換與二階方陣",
        "rootManualOrder": 623,
        "paragraphEditable": (
            "1. 這章正式改以四個主題當主軸：平移、旋轉；鏡射；伸縮；推移。\n"
            "2. 這章的核心是看矩陣如何改變圖形，所以一定要把「保長度、保角度、保面積」這些幾何效果一起看。\n"
            "3. 複合變換、逆變換、常見變換矩陣總表都放回這章，不再留在 `變換矩陣的應用`。\n"
            "4. 看到面積縮放、不變方向、可逆性時，先回頭判斷它比較接近伸縮、推移，還是整體的變換整理。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的四個主題頁。整理時先抓平移與旋轉，再往鏡射、伸縮與推移延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "plane-transform-translation-rotation",
                "title": "平面上的線性變換－平移、旋轉",
                "page": 36,
                "mainThemeId": "s4-4-4-main-theme-plane-transform-translation-rotation",
                "wrapperId": "s4-4-4-main-theme-plane-transform-translation-rotation-core",
                "summary": "整理線性變換形式、平移、旋轉矩陣、逆變換與連續旋轉。",
                "rows": [
                    ["基本形式", "二階方陣可把點 \\((x,y)\\) 變成新點 \\((x',y')\\)，也就是把向量做規則化轉換。"],
                    ["平移", "平移本身不是純二階矩陣乘法，而是先加上一個位移向量。"],
                    ["旋轉矩陣", "繞原點逆時針旋轉 \\(\\theta\\) 的矩陣是 \\(\\begin{bmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{bmatrix}\\)。"],
                    ["旋轉保距離與角度", "旋轉會改變方向，但不改變長度和夾角。"],
                    ["逆變換", "旋轉的逆運算就是旋轉相反角度，矩陣上可看成 \\(R(-\\theta)\\)。"],
                    ["連續旋轉", "先轉 \\(\\theta_1\\) 再轉 \\(\\theta_2\\)，等同於一次轉 \\(\\theta_1+\\theta_2\\)。"],
                ],
                "branchIds": [
                    "s4-4-4-linear-transform-2x2-core",
                    "senior-transformation-compose-and-inverse-s443",
                    "senior-plane-transform-matrix-table-s443",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "plane-transform-reflection",
                "title": "平面上的線性變換－鏡射",
                "page": 37,
                "mainThemeId": "s4-4-4-main-theme-plane-transform-reflection",
                "wrapperId": "s4-4-4-main-theme-plane-transform-reflection-core",
                "summary": "整理對坐標軸、原點、任意過原點直線的鏡射矩陣與性質。",
                "rows": [
                    ["鏡射的意思", "把點對某條直線對稱過去，得到新的位置。"],
                    ["關於坐標軸鏡射", "對 \\(x\\) 軸鏡射會把 \\((x,y)\\) 變成 \\((x,-y)\\)；對 \\(y\\) 軸鏡射則變成 \\((-x,y)\\)。"],
                    ["關於原點鏡射", "相當於同時對兩軸變號，即 \\((x,y)\\mapsto(-x,-y)\\)。"],
                    ["任意過原點直線", "可用角度 \\(\\theta\\) 寫出對應鏡射矩陣。"],
                    ["鏡射特性", "保長度、保角度，但會改變方向性。"],
                    ["讀題提醒", "鏡射和旋轉不同，鏡射做兩次會回到原圖，旋轉則不一定。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 3,
                "slug": "plane-transform-scaling",
                "title": "平面上的線性變換－伸縮",
                "page": 38,
                "mainThemeId": "s4-4-4-main-theme-plane-transform-scaling",
                "wrapperId": "s4-4-4-main-theme-plane-transform-scaling-core",
                "summary": "整理等比與不同比例伸縮、圓變橢圓與面積縮放倍數。",
                "rows": [
                    ["伸縮的意思", "以某一點為中心，把每個點和中心的距離按比例放大或縮小。"],
                    ["等比伸縮", "以原點為中心若伸縮 \\(k\\) 倍，矩陣可寫成 \\(\\begin{bmatrix}k&0\\\\0&k\\end{bmatrix}\\)。"],
                    ["不同比例伸縮", "若 \\(x\\) 方向與 \\(y\\) 方向伸縮倍數不同，圖形會被拉成不同形狀。"],
                    ["圓變橢圓", "若只放大某一方向，原本的圓常會變成橢圓。"],
                    ["面積關係", "二階方陣的行列式絕對值，會反映面積縮放倍數。"],
                    ["讀題提醒", "伸縮中心若不是原點，要先平移到原點看，再做變換。"],
                ],
                "branchIds": [
                    "senior-transformation-eigen-direction-s443",
                    "senior-transformation-area-scaling-s443",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "plane-transform-shear",
                "title": "平面上的線性變換－推移",
                "page": 39,
                "mainThemeId": "s4-4-4-main-theme-plane-transform-shear",
                "wrapperId": "s4-4-4-main-theme-plane-transform-shear-core",
                "summary": "整理推移矩陣、平行四邊形效果、面積不變與可逆性。",
                "rows": [
                    ["推移的意思", "保留某一方向坐標不變，讓另一方向依照它的大小被推斜。"],
                    ["常見矩陣", "沿 \\(x\\) 方向推移 \\(k\\) 倍可寫成 \\(\\begin{bmatrix}1&k\\\\0&1\\end{bmatrix}\\)；沿 \\(y\\) 方向推移則類似。"],
                    ["幾何效果", "長方形會變成平行四邊形，但面積常維持不變。"],
                    ["保留某一軸上的點", "推移時，作為基準的那一方向坐標會保留。"],
                    ["行列式關係", "典型推移矩陣行列式為 1，所以面積不變。"],
                    ["讀題提醒", "推移和旋轉看起來都像斜掉，但推移不保角度、旋轉保角度。"],
                ],
                "branchIds": [
                    "senior-transform-invariants-and-invertibility-s443",
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


def find_topic(topics: list[dict], topic_id: str) -> dict:
    for topic in topics:
        if topic.get("id") == topic_id:
            return topic
    raise KeyError(f"Topic not found: {topic_id}")


def maybe_find_topic(topics: list[dict], topic_id: str) -> dict | None:
    for topic in topics:
        if topic.get("id") == topic_id:
            return topic
    return None


def set_chapter_fields(topic: dict, chapter_code: str) -> None:
    topic["chapter_code"] = chapter_code
    topic["chapterCode"] = chapter_code


def chapter_root_template(chapter_plan: dict, updated_at: str) -> dict:
    meta = chapter_plan["meta"]
    chapter_code = chapter_plan["chapterCode"]
    title = chapter_plan["rootTitle"]
    return {
        "id": chapter_plan["rootId"],
        "title": title,
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "定位", "values": [rf"\text{{{title}}}"]},
                {"label": "摘要", "values": [rf"\text{{{chapter_plan['groupName']}}}"]},
            ],
        },
        "stage": meta["stage"],
        "grade": meta["grade"],
        "term": meta["term"],
        "chapter": meta["chapter"],
        "domain": meta["domain"],
        "difficulty": "基礎",
        "chapterRole": "主角",
        "parentId": "",
        "tags": [chapter_code, title],
        "usage": [chapter_plan["groupName"]],
        "examples": [],
        "tips": ["先看主題，再往下展開原本的分支內容。"],
        "notes": ["這一層是章節穩定主軸。"],
        "mistakes": ["不要把舊核心主題直接當成章節 root。"],
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": meta["gradeLabel"],
        "section": meta["section"],
        "domainSub": meta["domainSub"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": chapter_plan.get("rootManualOrder", 0),
        "orderIndex": None,
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
    }


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
        root = maybe_find_topic(topics, chapter_plan["rootId"])
        if root is None:
            root = chapter_root_template(chapter_plan, updated_at)
            upsert_topic(topics, root)
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
