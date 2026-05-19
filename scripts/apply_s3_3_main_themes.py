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
SOURCE_PDF = ROOT / "exports" / "s3-source" / "s3-readable-paged.pdf"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "third-volume-topic-pdfs.json"

TZ = timezone(timedelta(hours=8))
SOURCE_REF = "高二上數A全重點_易讀版分頁版.docx"

TOPIC_PLAN = [
    {
        "chapterCode": "s3-3-1",
        "groupName": "平面向量",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "上學期",
            "gradeLabel": "高二上",
            "chapter": "平面向量",
            "section": "平面向量",
            "domain": "向量",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 1,
            "chapterOrder": 8,
        },
        "rootId": "senior-plane-vector-main-s331",
        "paragraphEditable": (
            "1. 這章正式改以 Word 的五個主題當主軸：有向線段與向量、坐標向量、線性組合與分點公式、向量與三角形重心內心、直線參數式。\n"
            "2. 看題目時，先判斷它是在考向量本身、坐標分量、分點重心，還是直線參數式，不要一開始就急著套公式。\n"
            "3. 這章最常和坐標、三角形幾何一起混考，尤其分點、重心與線段參數範圍要先分清楚。\n"
            "4. 主頁的下一層提醒先直接取這些主題中的重點，之後再慢慢拆成更細的分支。"
        ),
        "paragraphOriginal": (
            "這章的原稿版直接對應分頁 PDF 的五個主題頁。整理時先抓向量定義與坐標表示，再往分點、重心內心與直線參數式延伸。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "directed-segment-vector",
                "title": "有向線段與向量",
                "page": 23,
                "mainThemeId": "s3-3-1-main-theme-directed-segment-vector",
                "wrapperId": "s3-3-1-directed-segment-vector-core",
                "summary": "整理向量的意思、等向量、加減法、分解、數乘與平行判定。",
                "rows": [
                    ["有向線段與向量", "有向線段同時包含起點、終點、方向與長度；向量只保留大小和方向，不看放在平面上的位置。"],
                    ["零向量與等向量", "起點和終點重合的向量記作 \\(\\vec{0}\\)；只要大小相等、方向相同，就視為同一個向量。"],
                    ["向量加減法", "向量加法可用三角形法則或平行四邊形法則；\\(\\vec{a}-\\vec{b}=\\vec{a}+(-\\vec{b})\\)。"],
                    ["向量分解", "\\(\\overrightarrow{AB}=\\overrightarrow{AQ}+\\overrightarrow{QB}=\\overrightarrow{QB}-\\overrightarrow{QA}\\)，其中 \\(Q\\) 可取任意點。"],
                    ["數乘與方向", "\\(k\\vec{a}\\) 會改變長度；\\(k>0\\) 方向相同，\\(k<0\\) 方向相反，\\(k=0\\) 變成 \\(\\vec{0}\\)。"],
                    ["平行判定", "非零向量滿足 \\(\\vec{a}//\\vec{b}\\iff \\vec{a}=k\\vec{b}\\)；解題時不要把位置和方向混在一起。"],
                ],
                "branchIds": [
                    "s3-3-1-plane-vector-core",
                    "senior-plane-vector-operations-s331",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "coordinate-vector",
                "title": "坐標向量",
                "page": 24,
                "mainThemeId": "s3-3-1-main-theme-coordinate-vector",
                "wrapperId": "s3-3-1-coordinate-vector-core",
                "summary": "整理坐標向量的表示、長度、方向角、單位向量與坐標判平行。",
                "rows": [
                    ["坐標向量的定義", "把向量平移到原點，若終點是 \\((a,b)\\)，就把它記成 \\((a,b)\\)。"],
                    ["長度公式", "若 \\(\\vec{u}=(a,b)\\)，則 \\(|\\vec{u}|=\\sqrt{a^2+b^2}\\)。"],
                    ["兩點決定向量", "若 \\(A(x_1,y_1)\\)、\\(B(x_2,y_2)\\)，則 \\(\\overrightarrow{AB}=(x_2-x_1,\\,y_2-y_1)\\)。"],
                    ["方向角表示", "若向量長度是 \\(|\\vec{u}|\\)、方向角是 \\(\\theta\\)，則 \\(\\vec{u}=(|\\vec{u}|\\cos\\theta,\\,|\\vec{u}|\\sin\\theta)\\)。"],
                    ["坐標下的運算", "\\((a_1,a_2)+(b_1,b_2)=(a_1+b_1,\\,a_2+b_2)\\)，且 \\(k(a_1,a_2)=(ka_1,\\,ka_2)\\)。"],
                    ["單位向量與平行", "同方向單位向量是 \\(\\dfrac{\\vec{u}}{|\\vec{u}|}\\)；坐標判平行可用 \\((a_1,a_2)//(b_1,b_2)\\iff a_1b_2=a_2b_1\\)。"],
                ],
                "branchIds": [
                    "senior-plane-vector-coordinate-representation-s331",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "linear-combination-division",
                "title": "線性組合與分點公式",
                "page": 25,
                "mainThemeId": "s3-3-1-main-theme-linear-combination-division",
                "wrapperId": "s3-3-1-linear-combination-division-core",
                "summary": "整理線性組合、共線判定、內外分點、中點與 Menelaus 等工具。",
                "rows": [
                    ["線性組合", "若 \\(\\vec{a},\\vec{b}\\) 不平行，平面上任一向量都能唯一寫成 \\(s\\vec{a}+t\\vec{b}\\)。"],
                    ["共線判定", "三點共線可改寫成 \\(\\overrightarrow{AB}=k\\overrightarrow{AC}\\)，或存在 \\(\\alpha+\\beta=1\\) 使線段向量成線性組合。"],
                    ["內分點公式", "若 \\(P\\) 內分 \\(AB\\) 且 \\(AP:PB=m:n\\)，則 \\(P\\left(\\dfrac{mx_2+nx_1}{m+n},\\dfrac{my_2+ny_1}{m+n}\\right)\\)。"],
                    ["外分點與中點", "外分點改成 \\(m-n\\) 型分母；中點公式是 \\(\\left(\\dfrac{x_1+x_2}{2},\\dfrac{y_1+y_2}{2}\\right)\\)。"],
                    ["中點線與 Menelaus", "三角形兩邊中點連線會平行第三邊；Menelaus 定理常拿來處理共線與比值題。"],
                    ["讀題提醒", "分點題最常和坐標、向量長度一起考，先分清楚是內分還是外分，再決定要用向量型還是坐標型。"],
                ],
                "branchIds": [
                    "senior-plane-vector-linear-combination-s331",
                    "senior-plane-vector-basis-generation-s331",
                    "senior-plane-vector-locus-constraints-s331",
                    "senior-plane-vector-ceva-menelaus-s331",
                    "senior-plane-vector-area-by-components-s331",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "centroid-incenter",
                "title": "向量與三角形重心、內心",
                "page": 26,
                "mainThemeId": "s3-3-1-main-theme-centroid-incenter",
                "wrapperId": "s3-3-1-centroid-incenter-core",
                "summary": "整理重心、內心的向量與坐標公式，還有加權平均與面積比觀念。",
                "rows": [
                    ["重心公式", "若 \\(G\\) 是重心，則 \\(\\overrightarrow{OG}=\\dfrac{\\overrightarrow{OA}+\\overrightarrow{OB}+\\overrightarrow{OC}}{3}\\)。"],
                    ["重心坐標", "若 \\(A(x_1,y_1),B(x_2,y_2),C(x_3,y_3)\\)，則 \\(G\\left(\\dfrac{x_1+x_2+x_3}{3},\\dfrac{y_1+y_2+y_3}{3}\\right)\\)。"],
                    ["重心平衡式", "\\(\\overrightarrow{GA}+\\overrightarrow{GB}+\\overrightarrow{GC}=\\vec{0}\\)，把重心看成平均最不容易亂。"],
                    ["內心公式", "若 \\(a=|BC|,\\,b=|CA|,\\,c=|AB|\\)，則 \\(\\overrightarrow{OI}=\\dfrac{a\\overrightarrow{OA}+b\\overrightarrow{OB}+c\\overrightarrow{OC}}{a+b+c}\\)。"],
                    ["內心坐標", "內心是邊長加權平均：\\(I\\left(\\dfrac{ax_1+bx_2+cx_3}{a+b+c},\\dfrac{ay_1+by_2+cy_3}{a+b+c}\\right)\\)。"],
                    ["面積比與外心提醒", "重心偏平均、內心偏邊長權重；之後若牽涉外心或面積比，再往下看相應分支。"],
                ],
                "branchIds": [
                    "senior-plane-vector-triangle-centers-s331",
                    "senior-plane-vector-area-ratio-barycentric-s331",
                ],
            },
            {
                "topicNumber": 5,
                "slug": "line-parametric-form",
                "title": "直線參數式",
                "page": 27,
                "mainThemeId": "s3-3-1-main-theme-line-parametric-form",
                "wrapperId": "s3-3-1-line-parametric-form-core",
                "summary": "整理直線、線段、射線的參數式與方向向量、法向量之間的關係。",
                "rows": [
                    ["直線參數式的核心", "用一個起點加上一個方向向量，描述直線上的所有點。"],
                    ["過點與方向向量", "若過 \\(P(x_0,y_0)\\) 且方向向量為 \\((a,b)\\)，則可寫成 \\(x=x_0+at,\\ y=y_0+bt\\)，其中 \\(t\\in\\mathbb{R}\\)。"],
                    ["由兩點寫參數式", "通過 \\(A(x_1,y_1),B(x_2,y_2)\\) 時，可用方向向量 \\((x_2-x_1,\\,y_2-y_1)\\)。"],
                    ["線段與射線範圍", "若只要線段 \\(AB\\)，則 \\(0\\le t\\le 1\\)；若只要射線 \\(\\overrightarrow{AB}\\)，則 \\(t\\ge 0\\)。"],
                    ["斜率與方向向量", "方向向量若是 \\((a,b)\\)，則斜率可看成 \\(\\dfrac{b}{a}\\)（前提是 \\(a\\neq 0\\)）。"],
                    ["法向量對應", "一般式 \\(ax+by+c=0\\) 的法向量是 \\((a,b)\\)；參數式很適合處理交點、內分與軌跡題。"],
                ],
                "branchIds": [
                    "senior-plane-vector-line-param-form-s331",
                ],
            },
        ],
    },
    {
        "chapterCode": "s3-3-2",
        "groupName": "平面向量的內積",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "上學期",
            "gradeLabel": "高二上",
            "chapter": "平面向量的內積",
            "section": "平面向量的內積",
            "domain": "向量",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 1,
            "chapterOrder": 9,
        },
        "rootId": "senior-vector-dot-product-main-s332",
        "paragraphEditable": (
            "1. 這章正式改以六個主題當主軸：向量的內積、三角形外心與垂心、兩直線的夾角、正射影、點到直線的距離、柯西不等式。\n"
            "2. 這章最重要的是把角度、長度、垂直與距離通通拉回內積來看，不要分成很多互不相干的小公式。\n"
            "3. 看題目時先判斷它是在考夾角、投影、等距，還是不等式，再往下看對應分支。\n"
            "4. 這章原本有些距離分支掛錯到行列式章，這次已經改回內積章底下。"
        ),
        "paragraphOriginal": (
            "這章的原稿版直接對應分頁 PDF 的六個主題頁。整理時先把內積定義和坐標公式抓穩，再往夾角、投影、距離與柯西不等式延伸。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "vector-dot-product",
                "title": "向量的內積",
                "page": 29,
                "mainThemeId": "s3-3-2-main-theme-vector-dot-product",
                "wrapperId": "s3-3-2-vector-dot-product-core",
                "summary": "整理內積定義、坐標公式、夾角、垂直與基本判定。",
                "rows": [
                    ["內積定義", "若 \\(\\vec{a},\\vec{b}\\) 夾角為 \\(\\theta\\)，則 \\(\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta\\)。"],
                    ["坐標公式", "若 \\(\\vec{a}=(a_1,a_2)\\)、\\(\\vec{b}=(b_1,b_2)\\)，則 \\(\\vec{a}\\cdot\\vec{b}=a_1b_1+a_2b_2\\)。"],
                    ["夾角公式", "\\(\\cos\\theta=\\dfrac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}||\\vec{b}|}\\)，內積最常用來求角度。"],
                    ["垂直判定", "\\(\\vec{a}\\perp\\vec{b}\\iff \\vec{a}\\cdot\\vec{b}=0\\)。"],
                    ["平行提醒", "平行在坐標上仍多半看比例或外積型條件，不要把 \\(\\vec{a}\\cdot\\vec{b}=0\\) 和平行混在一起。"],
                    ["讀題提醒", "看到角度或垂直，先想內積；看到很多坐標，先把它改成坐標內積再算。"],
                ],
                "branchIds": [
                    "s3-3-2-dot-product-core",
                    "senior-vector-dot-product-angle-s332",
                    "senior-vector-dot-product-parallel-criterion-s332",
                    "senior-vector-dot-product-applications-s332",
                    "senior-vector-dot-product-work-model-s332",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "circumcenter-orthocenter",
                "title": "三角形外心與垂心",
                "page": 30,
                "mainThemeId": "s3-3-2-main-theme-circumcenter-orthocenter",
                "wrapperId": "s3-3-2-circumcenter-orthocenter-core",
                "summary": "整理外心的等距條件、垂心的垂直條件，並把它們改寫成內積方程式。",
                "rows": [
                    ["外心意義", "三邊中垂線交點是外心，核心條件是到三個頂點距離相等。"],
                    ["外心向量條件", "可用 \\(\\overrightarrow{AB}\\cdot\\overrightarrow{AO}=\\dfrac{|AB|^2}{2}\\) 這類等式，把等距條件改成內積方程式。"],
                    ["垂心意義", "三條高的交點是垂心；若 \\(AD\\) 是高，則 \\(\\overrightarrow{AD}\\cdot\\overrightarrow{BC}=0\\)。"],
                    ["向量解法想法", "外心重點是等距，垂心重點是垂直；都可以轉成內積等式再聯立求點。"],
                    ["邊長與內積連結", "\\(\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=\\dfrac{b^2+c^2-a^2}{2}\\) 這類式子在外心、垂心題都很常用。"],
                    ["讀題提醒", "先分清楚題目要的是外心還是垂心，再決定是抓等距還是抓垂直。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 3,
                "slug": "angle-between-lines",
                "title": "兩直線的夾角",
                "page": 31,
                "mainThemeId": "s3-3-2-main-theme-angle-between-lines",
                "wrapperId": "s3-3-2-angle-between-lines-core",
                "summary": "整理法向量、方向向量、夾角公式與角平分線公式。",
                "rows": [
                    ["法向量觀念", "直線 \\(ax+by+c=0\\) 的法向量是 \\((a,b)\\)，方向向量可取 \\((b,-a)\\)。"],
                    ["夾角只取小角", "若其中一個角是 \\(\\theta\\)，另一個就是 \\(\\pi-\\theta\\)；題目通常取較小的那個。"],
                    ["用法向量求夾角", "若法向量是 \\((a_1,b_1)\\)、\\((a_2,b_2)\\)，則 \\(\\cos\\theta=\\pm\\dfrac{a_1a_2+b_1b_2}{\\sqrt{a_1^2+b_1^2}\\sqrt{a_2^2+b_2^2}}\\)。"],
                    ["用斜率求夾角", "若斜率為 \\(m_1,m_2\\)，則 \\(\\tan\\theta=\\pm\\dfrac{m_1-m_2}{1+m_1m_2}\\)。"],
                    ["角平分線公式", "角平分線可寫成 \\(\\dfrac{a_1x+b_1y+c_1}{\\sqrt{a_1^2+b_1^2}}=\\pm\\dfrac{a_2x+b_2y+c_2}{\\sqrt{a_2^2+b_2^2}}\\)。"],
                    ["讀題提醒", "題目給一般式時常用法向量；題目直接給斜率時，用正切公式通常更快。"],
                ],
                "branchIds": [
                    "senior-vector-dot-product-angle-between-lines-s332",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "orthogonal-projection",
                "title": "正射影",
                "page": 32,
                "mainThemeId": "s3-3-2-main-theme-orthogonal-projection",
                "wrapperId": "s3-3-2-orthogonal-projection-core",
                "summary": "整理向量正射影、分量、投影長與正負號判斷。",
                "rows": [
                    ["正射影公式", "\\(\\operatorname{proj}_{\\vec{b}}\\vec{a}=\\left(\\dfrac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|^2}\\right)\\vec{b}\\)，前提是 \\(\\vec{b}\\neq\\vec{0}\\)。"],
                    ["純量分量", "\\(\\vec{a}\\) 在 \\(\\vec{b}\\) 方向上的分量是 \\(\\dfrac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|}\\)。"],
                    ["投影長度", "正射影的長度是 \\(\\dfrac{|\\vec{a}\\cdot\\vec{b}|}{|\\vec{b}|}\\)，只看絕對值。"],
                    ["正負號意義", "分量有方向性，所以可能是正或負；若題目問長度，就要改看絕對值。"],
                    ["正交分解", "很多投影題會順便把向量拆成沿著某方向與垂直某方向兩部分。"],
                    ["讀題提醒", "看到沿某方向的分量、投影量或投影長，就先想內積和投影公式。"],
                ],
                "branchIds": [
                    "senior-vector-projection-s332",
                    "senior-vector-dot-product-orthogonal-decomposition-s332",
                    "senior-vector-dot-product-signed-projection-s332",
                ],
            },
            {
                "topicNumber": 5,
                "slug": "point-line-distance",
                "title": "點到直線的距離",
                "page": 33,
                "mainThemeId": "s3-3-2-main-theme-point-line-distance",
                "wrapperId": "s3-3-2-point-line-distance-core",
                "summary": "整理點到直線距離、平行線距離與向量面積公式的連結。",
                "rows": [
                    ["點到直線距離", "點 \\(P(x_0,y_0)\\) 到直線 \\(ax+by+c=0\\) 的距離是 \\(\\dfrac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}\\)。"],
                    ["平行線距離", "若兩平行線為 \\(ax+by+c_1=0\\)、\\(ax+by+c_2=0\\)，則距離是 \\(\\dfrac{|c_1-c_2|}{\\sqrt{a^2+b^2}}\\)。"],
                    ["角平分線連結", "角平分線本質上就是到兩直線距離相等的點。"],
                    ["向量面積公式", "若 \\(\\overrightarrow{AB}=(x_1,y_1)\\)、\\(\\overrightarrow{AC}=(x_2,y_2)\\)，則 \\(\\triangle ABC\\) 面積是 \\(\\dfrac{|x_1y_2-x_2y_1|}{2}\\)。"],
                    ["平行四邊形面積", "若相鄰邊向量是 \\((a,b)\\)、\\((c,d)\\)，則面積是 \\(|ad-bc|\\)。"],
                    ["讀題提醒", "很多距離題表面像幾何，其實直接代距離公式最穩；看到面積與距離一起出現時，也可以反推高。"],
                ],
                "branchIds": [
                    "senior-vector-dot-product-distance-formula-s332",
                    "senior-point-line-distance-s333",
                ],
            },
            {
                "topicNumber": 6,
                "slug": "cauchy-inequality",
                "title": "柯西不等式",
                "page": 34,
                "mainThemeId": "s3-3-2-main-theme-cauchy-inequality",
                "wrapperId": "s3-3-2-cauchy-inequality-core",
                "summary": "整理向量版柯西不等式、等號條件與常見的最值題判斷。",
                "rows": [
                    ["向量版柯西不等式", "對任意向量 \\(\\vec{a},\\vec{b}\\)，都有 \\(|\\vec{a}\\cdot\\vec{b}|\\le |\\vec{a}||\\vec{b}|\\)。"],
                    ["等號條件", "當且僅當 \\(\\vec{a}//\\vec{b}\\) 時，等號成立。"],
                    ["坐標版寫法", "\\((a_1^2+a_2^2)(b_1^2+b_2^2)\\ge (a_1b_1+a_2b_2)^2\\)。"],
                    ["幾何意義", "內積的大小不會超過兩向量長度乘積，所以最值題常能直接套柯西。"],
                    ["常見用途", "用來求最大值最小值、證明不等式、判斷何時取等號。"],
                    ["讀題提醒", "看到平方和乘平方和，還有內積平方同時出現時，幾乎都要先想到柯西不等式。"],
                ],
                "branchIds": [
                    "senior-vector-dot-product-inequalities-s332",
                ],
            },
        ],
    },
    {
        "chapterCode": "s3-3-3",
        "groupName": "面積與二階行列式",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "上學期",
            "gradeLabel": "高二上",
            "chapter": "面積與二階行列式",
            "section": "面積與二階行列式",
            "domain": "向量",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 1,
            "chapterOrder": 10,
        },
        "rootId": "senior-area-determinant-main-s333",
        "paragraphEditable": (
            "1. 這章正式改以三個主題當主軸：二階行列式、克拉瑪公式、二階行列式的應用。\n"
            "2. 這章最重要的是把行列式看成有向面積的代數版本，這樣面積、共線與聯立方程的判斷會連在一起。\n"
            "3. 看題目時先判斷它是在考性質速算、方程組判別，還是面積與共線，再往下接對應分支。\n"
            "4. 這章雖然和距離、內積有連動，但點到直線距離的主題已經放回上一章處理。"
        ),
        "paragraphOriginal": (
            "這章的原稿版直接對應分頁 PDF 的三個主題頁。整理時先抓二階行列式性質，再往克拉瑪公式與面積共線應用延伸。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "second-order-determinant",
                "title": "二階行列式",
                "page": 36,
                "mainThemeId": "s3-3-3-main-theme-second-order-determinant",
                "wrapperId": "s3-3-3-second-order-determinant-core",
                "summary": "整理二階行列式的定義、換列換號、倍數與線性拆解。",
                "rows": [
                    ["二階行列式定義", "\\(\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}=ad-bc\\)。"],
                    ["轉置不改值", "把行和列互換，行列式值不變。"],
                    ["交換變號", "交換兩行或兩列，行列式值會變號，這是最重要的符號規則。"],
                    ["倍數規則", "某一行或列乘上 \\(k\\)，行列式值也乘上 \\(k\\)；兩行或兩列都乘上 \\(k\\) 時，值乘上 \\(k^2\\)。"],
                    ["加倍數不變", "把某一行或列的倍數加到另一行或列，行列式值不變。"],
                    ["線性拆解", "某一行或列若是兩部分相加，行列式也可拆成兩個行列式相加；速算時最常用交換變號和加倍數不變。"],
                ],
                "branchIds": [
                    "s3-3-3-area-determinant-core",
                    "senior-determinant-properties-s333",
                    "senior-determinant-oriented-area-sign-s333",
                    "senior-determinant-linearity-fast-expand-s333",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "cramer-rule",
                "title": "克拉瑪公式",
                "page": 37,
                "mainThemeId": "s3-3-3-main-theme-cramer-rule",
                "wrapperId": "s3-3-3-cramer-rule-core",
                "summary": "整理主行列式、代入行列式、唯一解無解無限多解與幾何判別。",
                "rows": [
                    ["適用對象", "二元一次方程組 \\(a_1x+b_1y=c_1\\)、\\(a_2x+b_2y=c_2\\)。"],
                    ["主行列式", "\\(\\Delta=\\begin{vmatrix} a_1 & b_1 \\\\ a_2 & b_2 \\end{vmatrix}\\)，再定義 \\(\\Delta_x\\)、\\(\\Delta_y\\) 分別代掉 \\(x\\)、\\(y\\) 的那一欄。"],
                    ["唯一解條件", "若 \\(\\Delta\\neq 0\\)，則 \\(x=\\dfrac{\\Delta_x}{\\Delta}\\)、\\(y=\\dfrac{\\Delta_y}{\\Delta}\\)。"],
                    ["無解條件", "若 \\(\\Delta=0\\)，但 \\(\\Delta_x\\neq 0\\) 或 \\(\\Delta_y\\neq 0\\)，則無解。"],
                    ["無限多解條件", "若 \\(\\Delta=\\Delta_x=\\Delta_y=0\\)，則有無限多組解。"],
                    ["幾何意義", "\\(\\Delta\\neq 0\\) 代表兩直線相交；\\(\\Delta=0\\) 再看其他行列式，可判斷是平行還是重合。"],
                ],
                "branchIds": [
                    "senior-cramers-rule-2x2-s333",
                    "senior-determinant-linear-system-geometry-s333",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "determinant-applications",
                "title": "二階行列式的應用",
                "page": 38,
                "mainThemeId": "s3-3-3-main-theme-determinant-applications",
                "wrapperId": "s3-3-3-determinant-applications-core",
                "summary": "整理原點三角形面積、向量面積、共線判定與幾何意義。",
                "rows": [
                    ["原點三角形面積", "若 \\(A(a_1,a_2)\\)、\\(B(b_1,b_2)\\)，則 \\(\\triangle OAB\\) 面積是 \\(\\dfrac{1}{2}|a_1b_2-a_2b_1|\\)。"],
                    ["向量張成面積", "若 \\(\\vec{a}=(a_1,a_2)\\)、\\(\\vec{b}=(b_1,b_2)\\)，則它們張成的三角形面積也是 \\(\\dfrac{1}{2}|a_1b_2-a_2b_1|\\)。"],
                    ["和內積公式連結", "同一個面積也可寫成 \\(\\dfrac{1}{2}\\sqrt{|\\vec{a}|^2|\\vec{b}|^2-(\\vec{a}\\cdot\\vec{b})^2}\\)。"],
                    ["共線判定", "若三點共線，則對應的二階行列式等於 0。"],
                    ["幾何意義", "行列式量到的是平行四邊形的有向面積，所以絕對值常和面積直接相連。"],
                    ["讀題提醒", "只要題目同時出現坐標、面積、共線或參數，幾乎都可以先想行列式。"],
                ],
                "branchIds": [
                    "senior-parallelogram-triangle-area-s333",
                    "senior-determinant-geometric-meaning-s333",
                    "senior-determinant-collinearity-s333",
                    "senior-determinant-area-parameter-problems-s333",
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


def formula_topic_template(
    root: dict,
    chapter_meta: dict,
    topic_id: str,
    title: str,
    parent_id: str,
    summary: str,
    updated_at: str,
    order_index: int,
) -> dict:
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


def wrapper_topic_template(
    root: dict,
    chapter_meta: dict,
    wrapper_id: str,
    title: str,
    parent_id: str,
    summary: str,
    rows: list[list[str]],
    updated_at: str,
) -> dict:
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
                        "src": f"data/main-theme-overviews/{pdf_file}",
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

