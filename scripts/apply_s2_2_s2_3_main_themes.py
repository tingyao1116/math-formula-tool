from __future__ import annotations

import json
import re
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
CHAPTER_OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"

SOURCE_MD = ROOT / "exports" / "s2-source" / "s2-readable.md"
SOURCE_PDF = ROOT / "exports" / "s2-source" / "s2-readable-paged.pdf"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "second-volume-topic-pdfs.json"

TZ = timezone(timedelta(hours=8))
TITLE_PREFIX_RE = re.compile(r"^主題\s*\d+\s*：\s*")
INLINE_MATH_RE = re.compile(r"\$(.+?)\$")
SECTION_RE = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)

TOPIC_PLAN = [
    {
        "chapterCode": "s2-2-1",
        "rootId": "senior-logic-set-counting-main",
        "topicNumber": 1,
        "slug": "simple-logic",
        "title": "簡單的邏輯概念",
        "page": 21,
        "mainThemeId": "s2-2-1-main-theme-simple-logic",
        "wrapperId": "s2-2-1-simple-logic-core",
        "summary": "先分清命題、真值、否定與條件敘述，再往下接語句判讀與逆否命題。",
        "branchIds": [
            "senior-proposition-truth-table",
            "senior-necessary-sufficient-biconditional",
            "senior-logic-condition-language-s221",
            "senior-logic-equivalence-translation-s221",
            "senior-equivalence-and-negation-rules",
            "senior-logic-contrapositive-quantifiers-s221",
        ],
    },
    {
        "chapterCode": "s2-2-1",
        "rootId": "senior-logic-set-counting-main",
        "topicNumber": 2,
        "slug": "set-basics",
        "title": "集合的基本概念",
        "page": 22,
        "mainThemeId": "s2-2-1-main-theme-set-basics",
        "wrapperId": "s2-2-1-set-basics-core",
        "summary": "先抓元素、子集、交集、聯集與補集，再往下接文氏圖和集合代數整理。",
        "branchIds": [
            "senior-set-operations-and-laws",
            "senior-set-operation-algebra-s221",
        ],
    },
    {
        "chapterCode": "s2-2-1",
        "rootId": "senior-logic-set-counting-main",
        "topicNumber": 3,
        "slug": "counting-principles",
        "title": "計數原理",
        "page": 23,
        "mainThemeId": "s2-2-1-main-theme-counting-principles",
        "wrapperId": "s2-2-1-counting-principles-core",
        "summary": "先分清分情況和分步驟，再往下接補集計數、容斥與樹狀圖整理。",
        "branchIds": [
            "s2-2-1-logic-set-counting-core",
            "senior-basic-counting-principles",
            "senior-counting-principles-tree-merge-s221",
            "senior-counting-complement-principle-s221",
            "senior-inclusion-exclusion-principle",
            "senior-inclusion-exclusion-three-set-s221",
        ],
    },
    {
        "chapterCode": "s2-2-2",
        "rootId": "senior-permutation-combination-main",
        "topicNumber": 1,
        "slug": "add-multiply-principles",
        "title": "加法原理與乘法原理",
        "page": 25,
        "mainThemeId": "s2-2-2-main-theme-add-multiply-principles",
        "wrapperId": "s2-2-2-add-multiply-principles-core",
        "summary": "先分清互斥相加與分步相乘，再往下接排列組合章的整體入口。",
        "branchIds": [
            "s2-2-2-permutation-combination-core",
        ],
    },
    {
        "chapterCode": "s2-2-2",
        "rootId": "senior-permutation-combination-main",
        "topicNumber": 2,
        "slug": "permutation",
        "title": "排列",
        "page": 26,
        "mainThemeId": "s2-2-2-main-theme-permutation",
        "wrapperId": "s2-2-2-permutation-core",
        "summary": "先抓順序會不會影響結果，再往下接階乘、全排列、相鄰與錯排。",
        "branchIds": [
            "senior-factorial-permutation-basics",
            "senior-multiset-permutation",
            "senior-repeated-permutation-mnk",
            "senior-permutation-gap-method-s222",
            "senior-circular-permutation-s222",
            "senior-derangement-inclusion-exclusion",
            "senior-derangement-inclusion-exclusion-form-s222",
        ],
    },
    {
        "chapterCode": "s2-2-2",
        "rootId": "senior-permutation-combination-main",
        "topicNumber": 3,
        "slug": "combination",
        "title": "組合",
        "page": 27,
        "mainThemeId": "s2-2-2-main-theme-combination",
        "wrapperId": "s2-2-2-combination-core",
        "summary": "先抓選哪些物件、不看順序，再往下接重複組合、分組模型與幾何計數。",
        "branchIds": [
            "senior-combination-and-properties",
            "senior-combination-with-repetition-stars-bars-s222",
            "senior-distribution-grouping-models",
            "senior-group-vs-pile-distinction-s222",
            "senior-geometry-counting-template-s222",
            "senior-balls-and-boxes-model-map-s222",
            "senior-bijection-counting-tricks",
        ],
    },
    {
        "chapterCode": "s2-2-3",
        "rootId": "senior-binomial-theorem-main-s223",
        "topicNumber": 1,
        "slug": "binomial-theorem",
        "title": "二項式定理",
        "page": 29,
        "mainThemeId": "s2-2-3-main-theme-binomial-theorem",
        "wrapperId": "s2-2-3-binomial-theorem-wrapper",
        "summary": "先抓一般項、指定項與係數，再往下接中央項、代值求和與組合恆等式。",
        "branchIds": [
            "s2-2-3-binomial-theorem-core",
            "senior-binomial-middle-term-s223",
            "senior-binomial-symmetry-central-coeff-s223",
            "senior-binomial-specific-term-s223",
            "senior-binomial-numeric-substitution-s223",
            "senior-binomial-coefficient-properties-s223",
            "senior-binomial-complex-substitution-cycle-s223",
            "senior-binomial-rising-falling-s223",
            "senior-binomial-term-finding-techniques-s223",
            "senior-binomial-sum-identities-s223",
            "senior-binomial-vandermonde-identity-s223",
        ],
    },
    {
        "chapterCode": "s2-2-4",
        "rootId": "senior-classical-probability-main-s224",
        "topicNumber": 1,
        "slug": "sample-space",
        "title": "樣本空間",
        "page": 31,
        "mainThemeId": "s2-2-4-main-theme-sample-space",
        "wrapperId": "s2-2-4-sample-space-core",
        "summary": "先把所有可能結果列清楚，再往下接等可能模型與機率計數模板。",
        "branchIds": [
            "s2-2-4-classical-probability-core",
            "senior-sample-space-events-s224",
            "senior-equiprobable-counting-s224",
            "senior-probability-counting-template-s224",
        ],
    },
    {
        "chapterCode": "s2-2-4",
        "rootId": "senior-classical-probability-main-s224",
        "topicNumber": 2,
        "slug": "events",
        "title": "事件",
        "page": 32,
        "mainThemeId": "s2-2-4-main-theme-events",
        "wrapperId": "s2-2-4-events-core",
        "summary": "先把文字條件翻成集合語言，再往下接交集、聯集、互斥與補事件。",
        "branchIds": [
            "senior-probability-event-operations-s224",
        ],
    },
    {
        "chapterCode": "s2-2-4",
        "rootId": "senior-classical-probability-main-s224",
        "topicNumber": 3,
        "slug": "probability-properties",
        "title": "機率的性質",
        "page": 33,
        "mainThemeId": "s2-2-4-main-theme-probability-properties",
        "wrapperId": "s2-2-4-probability-properties-core",
        "summary": "先抓古典機率、補事件與加法公式，再往下接拆事件、至少一個與期望值。",
        "branchIds": [
            "senior-probability-properties-addition-s224",
            "senior-probability-complement-multiplication-s224",
            "senior-probability-at-least-one-template-s224",
            "senior-probability-kth-draw-invariance-s224",
            "senior-expected-value-discrete-s224",
            "senior-probability-expected-value-fair-game-s224",
        ],
    },
    {
        "chapterCode": "s2-3-1",
        "rootId": "senior-univariate-data-analysis-main",
        "topicNumber": 1,
        "slug": "central-tendency",
        "title": "數據的集中趨勢",
        "page": 35,
        "mainThemeId": "s2-3-1-main-theme-central-tendency",
        "wrapperId": "s2-3-1-central-tendency-core",
        "summary": "先抓平均數、中位數與眾數，再往下接加權平均、百分位數與圖表判讀。",
        "branchIds": [
            "s2-3-1-one-dimensional-data-core",
            "senior-central-tendency-measures",
            "senior-statistical-charts-overview",
            "senior-percentile-quartile",
        ],
    },
    {
        "chapterCode": "s2-3-1",
        "rootId": "senior-univariate-data-analysis-main",
        "topicNumber": 2,
        "slug": "variance-standard-deviation",
        "title": "變異數與標準差",
        "page": 36,
        "mainThemeId": "s2-3-1-main-theme-variance-standard-deviation",
        "wrapperId": "s2-3-1-variance-standard-deviation-core",
        "summary": "先抓分散程度、變異數與標準差，再往下接分組資料、盒鬚圖與捷算技巧。",
        "branchIds": [
            "senior-dispersion-measures",
            "senior-univariate-grouped-data-mean-var-s231",
            "senior-univariate-boxplot-outlier-rule-s231",
            "senior-univariate-consecutive-integers-std-s231",
        ],
    },
    {
        "chapterCode": "s2-3-1",
        "rootId": "senior-univariate-data-analysis-main",
        "topicNumber": 3,
        "slug": "scaling-shifting-standardization",
        "title": "數據的伸縮、平移與標準化",
        "page": 37,
        "mainThemeId": "s2-3-1-main-theme-scaling-shifting-standardization",
        "wrapperId": "s2-3-1-scaling-shifting-standardization-core",
        "summary": "先抓線性轉換對統計量的影響，再往下接 z 分數與跨量尺比較。",
        "branchIds": [
            "senior-standardization-zscore",
            "senior-univariate-linear-transform-effects-s231",
            "senior-univariate-zscore-comparison-s231",
        ],
    },
    {
        "chapterCode": "s2-3-2",
        "rootId": "senior-bivariate-data-analysis-main",
        "topicNumber": 1,
        "slug": "scatterplot",
        "title": "散布圖",
        "page": 39,
        "mainThemeId": "s2-3-2-main-theme-scatterplot",
        "wrapperId": "s2-3-2-scatterplot-core",
        "summary": "先看方向、集中程度與離群點，再往下接二維資料的圖形判讀。",
        "branchIds": [
            "s2-3-2-two-dimensional-data-core",
            "senior-scatterplot-correlation-patterns",
        ],
    },
    {
        "chapterCode": "s2-3-2",
        "rootId": "senior-bivariate-data-analysis-main",
        "topicNumber": 2,
        "slug": "correlation-coefficient",
        "title": "相關係數",
        "page": 40,
        "mainThemeId": "s2-3-2-main-theme-correlation-coefficient",
        "wrapperId": "s2-3-2-correlation-coefficient-core",
        "summary": "先抓相關方向與強弱，再往下接公式、性質、共變異數與常見誤判。",
        "branchIds": [
            "senior-correlation-coefficient-definitions",
            "senior-correlation-properties-transform",
            "senior-bivariate-covariance-r-s232",
            "senior-bivariate-correlation-raw-sum-shortcut-s232",
            "senior-bivariate-correlation-strength-bands-s232",
            "senior-correlation-cautions-outliers",
        ],
    },
    {
        "chapterCode": "s2-3-2",
        "rootId": "senior-bivariate-data-analysis-main",
        "topicNumber": 3,
        "slug": "least-squares-regression-line",
        "title": "最小平方法與迴歸直線",
        "page": 41,
        "mainThemeId": "s2-3-2-main-theme-least-squares-regression-line",
        "wrapperId": "s2-3-2-least-squares-regression-line-core",
        "summary": "先抓殘差、最小平方法與迴歸直線，再往下接預測、殘差圖與標準化寫法。",
        "branchIds": [
            "senior-regression-line-least-squares",
            "senior-standardized-regression-r",
            "senior-bivariate-regression-prediction-s232",
            "senior-bivariate-residual-interpretation-s232",
        ],
    },
]

CHAPTER_PARAGRAPHS = {
    "s2-2-1": {
        "editable": (
            "1. 這章正式改成三個主題主軸：簡單的邏輯概念、集合的基本概念、計數原理。\n\n"
            "2. 看到題目時，先分清楚它是在考語句真假、集合運算，還是計數方式，不要把符號、圖與數法混在一起。\n\n"
            "3. 這章建議先把命題與否定看穩，再接集合語言與文氏圖，最後再進到加法乘法、補集與容斥。\n\n"
            "4. 這章最容易錯的是語句翻譯不完整、元素和子集混淆，或計數時不知道現在是在分情況還是分步驟。"
        ),
        "original": "先把命題語言、集合語言和計數語言分清楚，後面的排列組合和機率才不會混掉。",
    },
    "s2-2-2": {
        "editable": (
            "1. 這章正式改成三個主題主軸：加法原理與乘法原理、排列、組合。\n\n"
            "2. 看到題目時，先問自己是在分情況還是分步驟，再判斷順序會不會影響結果。\n\n"
            "3. 這章建議先把加法原理與乘法原理分清楚，再進到排列的限制型題，最後整理組合、重複組合和分組模型。\n\n"
            "4. 這章最容易錯的是把排列當組合、把互斥和分步搞反，或遇到相鄰、不相鄰與重複元素時沒有先分類。"
        ),
        "original": "先把加法原理、乘法原理和順序是否重要分開，後面的排列與組合題才會穩。",
    },
    "s2-2-3": {
        "editable": (
            "1. 這章正式改成一個主題主軸：二項式定理。\n\n"
            "2. 看到題目時，先寫一般項，再判斷它是在找指定項、係數，還是整體求和關係。\n\n"
            "3. 這章真正的核心是把二項展開和組合數接起來，所以中央項、係數和、交錯和與常見恆等式都要一起看。\n\n"
            "4. 這章最容易錯的是次方對錯、指定項索引偏一格，或只看到組合數就誤以為它應該掛到排列組合章。"
        ),
        "original": "先把一般項和係數判讀寫穩，再往下看中央項、代值求和與組合恆等式。",
    },
    "s2-2-4": {
        "editable": (
            "1. 這章正式改成三個主題主軸：樣本空間、事件、機率的性質。\n\n"
            "2. 看到題目時，先把樣本空間和事件定好，再決定是要用補事件、加法公式還是直接計數。\n\n"
            "3. 這章建議先把事件的集合語言看穩，再整理古典機率公式、補事件與至少一個的模板。\n\n"
            "4. 這章最容易錯的是樣本點沒列清楚、事件條件翻錯，或排列組合只算到一半就急著除。"
        ),
        "original": "先把樣本空間和事件定清楚，再往下用古典機率公式處理加法、補事件與期望值。",
    },
    "s2-3-1": {
        "editable": (
            "1. 這章正式改成三個主題主軸：數據的集中趨勢、變異數與標準差、數據的伸縮、平移與標準化。\n\n"
            "2. 看到題目時，先分清楚它是在找代表值、分散程度，還是在比較不同尺度資料。\n\n"
            "3. 這章建議先把平均數、中位數與眾數看穩，再進到變異數標準差，最後再整理線性轉換與 z 分數。\n\n"
            "4. 這章最容易錯的是沒先排序就抓中位數、平均數和加權平均混在一起，或把平移和伸縮對統計量的影響記反。"
        ),
        "original": "先把代表值和分散程度分開，再回頭整理標準化與不同量尺資料的比較。",
    },
    "s2-3-2": {
        "editable": (
            "1. 這章正式改成三個主題主軸：散布圖、相關係數、最小平方法與迴歸直線。\n\n"
            "2. 看到題目時，先看趨勢方向與集中程度，再決定要用相關係數還是迴歸直線去量化。\n\n"
            "3. 這章建議先從散布圖判讀開始，再接相關係數的公式與性質，最後整理最小平方法、殘差與迴歸直線。\n\n"
            "4. 這章最容易錯的是把相關當因果、把離群值忽略掉，或在相關和迴歸之間跳來跳去卻沒有先看散布圖。"
        ),
        "original": "先看散布圖，再看相關係數，最後才用迴歸直線描述趨勢和做估計。",
    },
}


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def clean_title(title: str) -> str:
    return TITLE_PREFIX_RE.sub("", title.strip())


def to_tex_text(value: str) -> str:
    escaped = value.replace("\\", r"\\").replace("{", r"\{").replace("}", r"\}")
    return rf"\text{{{escaped}}}"


def convert_inline_math(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        return r"\(" + match.group(1).strip() + r"\)"

    return INLINE_MATH_RE.sub(repl, text).replace("**", "").strip()


def parse_markdown_topics(markdown_text: str) -> dict[str, list[list[str]]]:
    matches = list(SECTION_RE.finditer(markdown_text))
    result: dict[str, list[list[str]]] = {}
    for idx, match in enumerate(matches):
        title = clean_title(match.group(1).strip())
        body_start = match.end()
        body_end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown_text)
        body = markdown_text[body_start:body_end]
        rows: list[list[str]] = []
        for raw_line in body.splitlines():
            line = raw_line.strip()
            if not line.startswith("- "):
                continue
            item = line[2:].strip()
            bold_match = re.match(r"\*\*(.+?)\*\*：(.*)", item)
            if bold_match:
                key = bold_match.group(1).strip()
                value = convert_inline_math(bold_match.group(2).strip())
            else:
                parts = item.split("：", 1)
                key = parts[0].strip()
                value = convert_inline_math(parts[1].strip() if len(parts) > 1 else "")
            rows.append([key, value])
        result[title] = rows
    return result


def split_topic_pdfs() -> None:
    reader = PdfReader(str(SOURCE_PDF))
    new_topics = []
    for plan in TOPIC_PLAN:
        writer = PdfWriter()
        writer.add_page(reader.pages[plan["page"] - 1])
        filename = f"{plan['chapterCode']}-topic-{plan['topicNumber']}-{plan['slug']}.pdf"
        output_path = PDF_EXPORT_DIR / filename
        with output_path.open("wb") as f:
            writer.write(f)
        new_topics.append(
            {
                "chapterCode": plan["chapterCode"],
                "topicNumber": plan["topicNumber"],
                "slug": plan["slug"],
                "title": plan["title"],
                "page": plan["page"],
                "file": filename,
            }
        )

    manifest = {"sourcePdf": str(SOURCE_PDF), "count": 0, "topics": []}
    if PDF_MANIFEST.exists():
        manifest = load_json(PDF_MANIFEST)
        if not isinstance(manifest.get("topics"), list):
            manifest["topics"] = []

    handled_codes = {plan["chapterCode"] for plan in TOPIC_PLAN}
    kept = [item for item in manifest.get("topics", []) if item.get("chapterCode") not in handled_codes]
    merged = kept + new_topics
    merged.sort(key=lambda item: (item.get("page") is None, item.get("page") or 0, item.get("file", "")))
    manifest["topics"] = merged
    manifest["count"] = len(merged)
    manifest["sourcePdf"] = str(SOURCE_PDF)
    save_json(PDF_MANIFEST, manifest)


def ensure_main_theme_topic(topics_by_id: dict[str, dict], root_topic: dict, plan: dict, updated_at: str) -> None:
    existing = topics_by_id.get(plan["mainThemeId"], {})
    topic = deepcopy(existing)
    topic.update(
        {
            "id": plan["mainThemeId"],
            "title": plan["title"],
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "定位", "values": [to_tex_text(plan["title"])]},
                    {"label": "摘要", "values": [to_tex_text(plan["summary"])]},
                ],
            },
            "stage": root_topic.get("stage", "高中"),
            "grade": root_topic.get("grade", "高一"),
            "term": root_topic.get("term", "下學期"),
            "chapter": root_topic.get("chapter", root_topic.get("title", "")),
            "domain": root_topic.get("domain", root_topic.get("domainMain", "數學")),
            "difficulty": root_topic.get("difficulty", "基礎"),
            "chapterRole": "主題",
            "parentId": plan["rootId"],
            "tags": [plan["chapterCode"], "主題", plan["title"]],
            "usage": [plan["summary"]],
            "examples": ["先看這一層主題整理，再往下展開原本的分支內容。"],
            "tips": ["如果題目太雜，先判斷它屬於哪個主題，再決定往哪組分支看。"],
            "notes": ["這一層是固定主軸，之後章節大綱和主題頁都會先看這裡。"],
            "mistakes": ["不要把章節根節點和主題層當成同一層。"],
            "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
            "contentTypesLocked": True,
            "mathNotationLocked": True,
            "modifiedAt": updated_at,
            "chapter_code": plan["chapterCode"],
            "chapterCode": plan["chapterCode"],
            "gradeLabel": "高一下",
            "manualOrder": plan["topicNumber"],
            "orderIndex": plan["topicNumber"],
        }
    )
    topics_by_id[plan["mainThemeId"]] = topic


def ensure_wrapper_topic(
    topics_by_id: dict[str, dict],
    root_topic: dict,
    plan: dict,
    rows: list[list[str]],
    updated_at: str,
) -> None:
    existing = topics_by_id.get(plan["wrapperId"], {})
    topic = deepcopy(existing)
    top_rows = rows[:3]
    lines = [{"label": f"重點{idx}", "values": [row[0]]} for idx, row in enumerate(top_rows, start=1)]
    if not lines:
        lines = [{"label": "整理", "values": [to_tex_text(plan["summary"])]}]
    topic.update(
        {
            "id": plan["wrapperId"],
            "title": plan["title"],
            "formula": {"type": "labeled-lines", "lines": lines},
            "stage": root_topic.get("stage", "高中"),
            "grade": root_topic.get("grade", "高一"),
            "term": root_topic.get("term", "下學期"),
            "chapter": root_topic.get("chapter", root_topic.get("title", "")),
            "domain": root_topic.get("domain", root_topic.get("domainMain", "數學")),
            "difficulty": root_topic.get("difficulty", "基礎"),
            "chapterRole": "主題",
            "parentId": plan["mainThemeId"],
            "contentTypes": ["公式", "定義", "題型", "使用技巧", "注意事項", "常見錯誤"],
            "contentTypesLocked": True,
            "tags": [plan["chapterCode"], plan["title"], "重點整理"],
            "usage": [plan["summary"]],
            "examples": [],
            "tips": ["先看主題整理，再往下接既有分支。"],
            "notes": ["來源：高一下全重點_易讀版分頁版.docx（主題整理匯入）"],
            "mistakes": ["不要跳過主題整理就直接往下看分支。"],
            "mathNotationLocked": True,
            "modifiedAt": updated_at,
            "relatedChapters": [],
            "relatedTopicIds": [],
            "chapter_code": plan["chapterCode"],
            "gradeLabel": "高一下",
            "chapterCode": plan["chapterCode"],
            "section": root_topic.get("chapter", root_topic.get("title", "")),
            "domainSub": root_topic.get("domainSub", ""),
            "isBranch": True,
            "stageOrder": root_topic.get("stageOrder", 2),
            "gradeOrder": root_topic.get("gradeOrder", 4),
            "termOrder": root_topic.get("termOrder", 2),
            "chapterOrder": root_topic.get("chapterOrder", 1),
            "manualOrder": plan["topicNumber"] * 100,
            "orderIndex": 1,
        }
    )
    topics_by_id[plan["wrapperId"]] = topic


def apply_formula_updates(markdown_topics: dict[str, list[list[str]]], updated_at: str) -> None:
    payload = load_json(FORMULA_DB)
    topics = payload.get("topics", [])
    topics_by_id = {topic["id"]: topic for topic in topics}
    handled_branch_ids = set()

    for plan in TOPIC_PLAN:
        root_topic = topics_by_id[plan["rootId"]]
        rows = markdown_topics[plan["title"]]
        ensure_main_theme_topic(topics_by_id, root_topic, plan, updated_at)
        ensure_wrapper_topic(topics_by_id, root_topic, plan, rows, updated_at)
        for order, branch_id in enumerate(plan["branchIds"], start=2):
            branch = topics_by_id[branch_id]
            branch["parentId"] = plan["wrapperId"]
            branch["chapterCode"] = plan["chapterCode"]
            branch["chapter_code"] = plan["chapterCode"]
            branch["modifiedAt"] = updated_at
            branch["orderIndex"] = order
            handled_branch_ids.add(branch_id)

    payload["topics"] = list(topics_by_id.values())
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    save_json(FORMULA_DB, payload)


def upsert_main_topic_overview(payload: dict, plan: dict, rows: list[list[str]], filename: str, updated_at: str) -> None:
    by_id = payload.setdefault("byId", {})
    by_id[plan["mainThemeId"]] = {
        "id": plan["mainThemeId"],
        "title": plan["title"],
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [{"type": "table", "headers": ["重點", "整理"], "rows": rows}],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "pdf-page",
                        "src": f"data/main-theme-overviews/{filename}",
                        "note": plan["title"],
                    }
                ],
            },
        ],
    }


def apply_main_topic_overviews(markdown_topics: dict[str, list[list[str]]], updated_at: str) -> None:
    payload = load_json(MAIN_TOPIC_DB)
    for plan in TOPIC_PLAN:
        filename = f"{plan['chapterCode']}-topic-{plan['topicNumber']}-{plan['slug']}.pdf"
        upsert_main_topic_overview(payload, plan, markdown_topics[plan["title"]], filename, updated_at)
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(payload.get("byId", {}))
    payload["meta"]["updatedAt"] = updated_at
    payload["meta"]["source"] = "data/main-theme-overviews"
    save_json(MAIN_TOPIC_DB, payload)


def update_chapter_overview_paragraphs(updated_at: str) -> None:
    payload = load_json(CHAPTER_OVERVIEW_DB)
    overviews = payload.setdefault("overviews", {})
    for chapter_code, paragraphs in CHAPTER_PARAGRAPHS.items():
        entry = overviews.setdefault(
            chapter_code,
            {"groupName": "章節重點大綱", "title": "章節重點大綱", "variants": []},
        )
        entry["updatedAt"] = updated_at
        variants = entry.setdefault("variants", [])
        for variant_id, label in [("editable", "可修改版"), ("original", "原稿版")]:
            variant = next((v for v in variants if v.get("id") == variant_id), None)
            if variant is None:
                variant = {"id": variant_id, "label": label, "sections": []}
                variants.append(variant)
            sections = variant.setdefault("sections", [])
            paragraph = next((s for s in sections if s.get("type") == "paragraph"), None)
            if paragraph is None:
                sections.insert(0, {"type": "paragraph", "text": paragraphs[variant_id]})
            else:
                paragraph["text"] = paragraphs[variant_id]
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    save_json(CHAPTER_OVERVIEW_DB, payload)


def main() -> None:
    markdown_text = SOURCE_MD.read_text(encoding="utf-8")
    markdown_topics = parse_markdown_topics(markdown_text)
    missing = [plan["title"] for plan in TOPIC_PLAN if plan["title"] not in markdown_topics]
    if missing:
        raise SystemExit(f"Missing topic sections in markdown: {missing}")

    PDF_EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    split_topic_pdfs()
    updated_at = now_iso()
    apply_formula_updates(markdown_topics, updated_at)
    apply_main_topic_overviews(markdown_topics, updated_at)
    update_chapter_overview_paragraphs(updated_at)
    print("Updated s2-2 and s2-3 main themes, overviews, and original PDFs.")


if __name__ == "__main__":
    main()

