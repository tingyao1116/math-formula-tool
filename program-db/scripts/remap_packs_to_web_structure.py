import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from sync_extra_bridge import sync_extra_web_from_db
from sync_web_data import sync_question_js_from_db


def expand_ranges(pairs: list[tuple[int, int, str]]) -> dict[int, str]:
    mapping: dict[int, str] = {}
    for start, end, formula_id in pairs:
        for order in range(start, end + 1):
            mapping[order] = formula_id
    return mapping


SOURCE_FORMULA_BY_ORDER = {
    "s1-1-6": expand_ranges(
        [
            (1, 2, "s1-1-6-coordinate-section-distance"),
            (3, 6, "s1-1-6-coordinate-triangle-area-centers"),
            (7, 9, "s1-1-6-slope-judgment"),
            (10, 17, "s1-1-6-slope-collinearity-range"),
            (18, 27, "s1-1-6-line-equation-intercept"),
            (28, 30, "s1-1-6-coordinate-geometry-comprehensive"),
            (31, 43, "s1-1-6-point-line-distance-reflection"),
            (44, 49, "s1-1-6-half-plane-side-test"),
            (50, 58, "s1-1-6-inequality-graph-feasible"),
            (59, 69, "s1-1-6-inequality-lattice-area-parameter"),
        ]
    ),
    "s1-1-7": expand_ranges(
        [
            (1, 2, "s1-1-7-circle-standard-general"),
            (3, 5, "s1-1-7-circle-from-center-radius"),
            (6, 17, "s1-1-7-circle-judgment-parameter"),
            (18, 24, "s1-1-7-three-point-circumcircle"),
            (25, 31, "s1-1-7-center-constraint-tangent"),
            (32, 37, "s1-1-7-circle-locus-transform"),
            (38, 40, "s1-1-7-circle-arch-application"),
            (41, 42, "s1-1-7-apollonius-circle"),
            (43, 45, "s1-1-7-absolute-circle-region"),
        ]
    ),
    "s1-1-8": expand_ranges(
        [
            (1, 8, "s1-1-8-point-circle-position-distance"),
            (9, 11, "s1-1-8-external-point-tangent-chord"),
            (12, 19, "s1-1-8-line-circle-distance-chord"),
            (20, 27, "s1-1-8-line-circle-parameter-range"),
            (28, 35, "s1-1-8-tangent-equation-basic"),
            (36, 41, "s1-1-8-external-point-tangent-advanced"),
            (42, 46, "s1-1-8-semicircle-function-extrema"),
            (47, 49, "s1-1-8-tangent-locus-application"),
            (50, 55, "s1-1-8-circle-pencil-root-axis"),
        ]
    ),
    "s1-1-9": expand_ranges(
        [
            (1, 3, "s1-1-9-polynomial-definition"),
            (4, 6, "s1-1-9-degree-parameter-judgment"),
            (7, 11, "s1-1-9-degree-properties-equality"),
            (12, 19, "s1-1-9-coefficient-sum-substitution"),
            (20, 27, "s1-1-9-division-factorization-basic"),
            (28, 35, "s1-1-9-linear-divisor-remainder"),
            (36, 48, "s1-1-9-synthetic-division-transform"),
            (49, 58, "s1-1-9-remainder-factor-basic"),
            (59, 65, "s1-1-9-high-power-remainder"),
            (66, 68, "s1-1-9-constant-ratio-identity"),
            (69, 71, "s1-1-9-factor-theorem-parameter"),
        ]
    ),
    "s1-1-10": expand_ranges(
        [
            (1, 8, "s1-1-10-linear-slope-equation"),
            (9, 19, "s1-1-10-linear-model-application"),
            (20, 28, "s1-1-10-quadratic-coefficient-graph"),
            (29, 35, "s1-1-10-quadratic-roots-vertex"),
            (36, 42, "s1-1-10-quadratic-inequality-parameter"),
            (43, 55, "s1-1-10-quadratic-extrema-transform"),
            (56, 67, "s1-1-10-quadratic-optimization-model"),
            (68, 74, "s1-1-10-monomial-function-graph"),
            (75, 78, "s1-1-10-polynomial-factor-graphing"),
            (79, 86, "s1-1-10-polynomial-graph-sign-shift"),
        ]
    ),
    "s1-1-11": expand_ranges(
        [
            (1, 4, "s1-1-11-linear-inequality-basic"),
            (5, 8, "s1-1-11-linear-inequality-application"),
            (9, 13, "s1-1-11-quadratic-solution-interval"),
            (14, 21, "s1-1-11-quadratic-parameter-sign"),
            (22, 31, "s1-1-11-quadratic-transform-model"),
            (32, 40, "s1-1-11-higher-degree-sign-chart"),
            (41, 49, "s1-1-11-rational-inequality"),
            (50, 53, "s1-1-11-radical-absolute-inequality"),
            (54, 56, "s1-1-11-parameter-application-inequality"),
        ]
    ),
}


PACK_MAPPINGS = [
    {
        "source_code": "s1-1-6",
        "target_code": "s1-2-1",
        "target_title": "直線方程式",
        "record_overrides": {
            51: {
                "question_text": (
                    "解下列各二元一次聯立不等式：\n"
                    "(1) $x＋y－4 \\leq 0$，$2x－y＋2 \\leq 0$。\n"
                    "(2) $x－2y \\geq －4$，$3x－2y \\leq 12$，$x＋y \\geq 2$。"
                )
            },
            52: {
                "question_text": (
                    "圖解下列各二元一次聯立不等式：\n"
                    "(1) $2x－y－4 < 0$，$3x＋y－11 > 0$。\n"
                    "(2) $4x－y－7 \\leq 0$，$3x－4y＋11 \\geq 0$，$x＋3y－5 \\geq 0$。"
                )
            },
            53: {
                "question_text": (
                    "圖示下列各不等式的圖形：\n"
                    "(1) $(x－2y＋2)(x＋2y－4) \\geq 0$。\n"
                    "(2) $－1 \\leq x＋y \\leq 5$，$－4 \\leq x－2y \\leq 2$。"
                )
            },
            54: {
                "question_text": (
                    "(1) 在坐標平面上作出 $|x|+|y|\\le 4$ 與 $|x|+4|y|\\ge 4$ 的公共圖形。\n"
                    "(2) 並求其面積。"
                ),
                "explanation_text": (
                    "【解析】(1)兩圖形均與 $x$ 軸、$y$ 軸成對稱，先作 $x\\ge 0$、$y\\ge 0$ 時的圖形："
                    "$x+y\\le 4$ 與 $x+4y\\ge 4$，得到第一象限中的區域A。"
                    "再利用對稱性可得整個鋪色區域。\n"
                    "(2)面積為 $\\frac{1}{2}\\times 8\\times 8-\\frac{1}{2}\\times 8\\times 2=24$。"
                ),
            },
            55: {
                "question_text": (
                    "如圖可用下列哪一組聯立不等式表示？\n"
                    "(A) $2x＋y－2<0$，$x－y<0$，$2x＋3y＋9<0$\n"
                    "(B) $2x＋y－2<0$，$x－y>0$，$2x＋3y＋9<0$\n"
                    "(C) $2x＋y－2<0$，$x－y<0$，$2x＋3y＋9>0$\n"
                    "(D) $2x＋y－2<0$，$x－y>0$，$2x＋3y＋9>0$"
                ),
                "explanation_text": (
                    "【解析】由圖可知著色區域在直線 $2x＋y－2=0$ 的左側，所以 $2x＋y－2<0$；"
                    "在直線 $x－y=0$ 的右側，所以 $x－y>0$；"
                    "在直線 $2x＋3y＋9=0$ 的右側，所以 $2x＋3y＋9>0$。"
                    "故選(D)。"
                ),
            },
            60: {
                "question_text": (
                    "聯立不等式 $0<x<5$，$0<y<6$，$x+y\\le 7$ 的圖形區域中，共有幾個格子點。\n"
                    "[圖:program-db/imports/packs/s1-1-6/assets/media/image51.jpeg]"
                )
            },
            66: {
                "question_text": (
                    "給三個不等式組，甲：$x+y+1\\ge 0$，$x+y-2\\le 0$；"
                    "乙：$(x+y+1)(x+y-2)\\le 0$；"
                    "丙：$(x-y+2)(x+2y-2)\\ge 0$，與四個圖形。"
                )
            },
        },
        "formula_map": {
            "s1-1-6-coordinate-section-distance": "senior-line-slope-basics",
            "s1-1-6-coordinate-triangle-area-centers": "senior-triangle-five-centers-quick-sheet-s121",
            "s1-1-6-slope-judgment": "senior-line-slope-basics",
            "s1-1-6-slope-collinearity-range": "senior-line-slope-basics",
            "s1-1-6-line-equation-intercept": "senior-line-equation-forms",
            "s1-1-6-coordinate-geometry-comprehensive": "senior-triangle-five-centers-quick-sheet-s121",
            "s1-1-6-point-line-distance-reflection": "senior-line-point-line-distance-projection-s121",
            "s1-1-6-half-plane-side-test": "senior-line-same-opposite-side-product-test-s121",
            "s1-1-6-inequality-graph-feasible": "senior-line-half-plane-sign-test-s121",
            "s1-1-6-inequality-lattice-area-parameter": "senior-line-half-plane-sign-test-s121",
        },
    },
    {
        "source_code": "s1-1-7",
        "target_code": "s1-2-2",
        "target_title": "圓的方程式",
        "formula_map": {
            "s1-1-7-circle-standard-general": "senior-circle-general-to-standard-s122",
            "s1-1-7-circle-from-center-radius": "senior-circle-equation-forms-summary",
            "s1-1-7-circle-judgment-parameter": "senior-circle-shape-discriminant-s122",
            "s1-1-7-three-point-circumcircle": "senior-circle-equation-forms-summary",
            "s1-1-7-center-constraint-tangent": "senior-circle-center-radius-recovery-s122",
            "s1-1-7-circle-locus-transform": "senior-circle-special-locus-apollonius-s122",
            "s1-1-7-circle-arch-application": "senior-circle-semicircle-forms-s122",
            "s1-1-7-apollonius-circle": "senior-circle-special-locus-apollonius-s122",
            "s1-1-7-absolute-circle-region": "senior-circle-inside-outside-semicircle",
        },
    },
    {
        "source_code": "s1-1-8",
        "target_code": "s1-2-3",
        "target_title": "直線與圓的關係",
        "formula_map": {
            "s1-1-8-point-circle-position-distance": "senior-circle-line-relation",
            "s1-1-8-external-point-tangent-chord": "senior-circle-tangent-from-external-point",
            "s1-1-8-line-circle-distance-chord": "senior-circle-line-distance-discriminant-s123",
            "s1-1-8-line-circle-parameter-range": "senior-circle-line-distance-discriminant-s123",
            "s1-1-8-tangent-equation-basic": "senior-circle-tangent-at-point-formula-s123",
            "s1-1-8-external-point-tangent-advanced": "senior-circle-tangent-from-external-point",
            "s1-1-8-semicircle-function-extrema": "senior-circle-line-relation",
            "s1-1-8-tangent-locus-application": "senior-circle-tangent-construction-two-methods-s123",
            "s1-1-8-circle-pencil-root-axis": "senior-circle-family-and-radical-axis-advanced",
        },
    },
    {
        "source_code": "s1-1-9",
        "target_code": "s1-3-1",
        "target_title": "多項式函數",
        "record_overrides": {
            37: {
                "question_text": (
                    "計算 $7^{5}-6\\times 7^{4}-4\\times 7^{3}-26\\times 7$。"
                    "小華使用綜合除法計算 "
                    "$f(x)=ax^{4}+3x^{3}+5x^{2}+bx+6$ 除以 $x+\\frac{1}{2}$，"
                    "得到下列過程：上排依序為 $a,3,5,b,6$；中排依序為 $-1,d,-2,e$；"
                    "下排依序為 $2,c,4,-6,f$，對應的綜合除法值為 $-\\frac{1}{2}$。"
                    "則下列敘述何者正確？"
                    " (1) $a+b>0$"
                    " (2) $c-d+e$ 為偶數"
                    " (3) $f(x)$ 除以 $x+\\frac{1}{2}$ 的餘式為 3"
                    " (4) $f(x)$ 除以 $2x+1$ 的餘式為 9"
                    " (5) $f(x)$ 除以 $2x+1$ 的商式為 $2x^{3}+2x^{2}+4x-6$"
                )
            }
        },
        "formula_map": {
            "s1-1-9-polynomial-definition": "s1-3-1-polynomial-function-core",
            "s1-1-9-degree-parameter-judgment": "s1-3-1-polynomial-function-core",
            "s1-1-9-degree-properties-equality": "s1-3-1-polynomial-function-core",
            "s1-1-9-coefficient-sum-substitution": "s1-3-1-polynomial-function-core",
            "s1-1-9-division-factorization-basic": "s1-3-1-polynomial-function-core",
            "s1-1-9-linear-divisor-remainder": "s1-3-1-polynomial-function-core",
            "s1-1-9-synthetic-division-transform": "s1-3-1-polynomial-function-core",
            "s1-1-9-remainder-factor-basic": "s1-3-1-polynomial-function-core",
            "s1-1-9-high-power-remainder": "s1-3-1-polynomial-function-core",
            "s1-1-9-constant-ratio-identity": "s1-3-1-polynomial-function-core",
            "s1-1-9-factor-theorem-parameter": "s1-3-1-polynomial-function-core",
        },
    },
    {
        "source_code": "s1-1-10",
        "target_code": "s1-3-2",
        "target_title": "簡單多項式函數及其圖形",
        "formula_map": {
            "s1-1-10-linear-slope-equation": "senior-linear-function-graph-meaning",
            "s1-1-10-linear-model-application": "senior-linear-function-graph-meaning",
            "s1-1-10-quadratic-coefficient-graph": "senior-quadratic-function-graph-core",
            "s1-1-10-quadratic-roots-vertex": "senior-quadratic-function-graph-core",
            "s1-1-10-quadratic-inequality-parameter": "senior-quadratic-sign-conditions-s132",
            "s1-1-10-quadratic-extrema-transform": "senior-quadratic-transformations",
            "s1-1-10-quadratic-optimization-model": "senior-quadratic-extremum-three-point-decision-s132",
            "s1-1-10-monomial-function-graph": "senior-polynomial-function-even-odd-end-behavior-s132",
            "s1-1-10-polynomial-factor-graphing": "s1-3-2-polynomial-graph-core",
            "s1-1-10-polynomial-graph-sign-shift": "s1-3-2-polynomial-graph-core",
        },
    },
    {
        "source_code": "s1-1-11",
        "target_code": "s1-3-3",
        "target_title": "多項式不等式",
        "formula_map": {
            "s1-1-11-linear-inequality-basic": "senior-polynomial-inequality-linear-quadratic",
            "s1-1-11-linear-inequality-application": "senior-polynomial-inequality-linear-quadratic",
            "s1-1-11-quadratic-solution-interval": "senior-polynomial-inequality-linear-quadratic",
            "s1-1-11-quadratic-parameter-sign": "senior-polynomial-inequality-quadratic-sign-conditions",
            "s1-1-11-quadratic-transform-model": "senior-polynomial-inequality-linear-quadratic",
            "s1-1-11-higher-degree-sign-chart": "senior-polynomial-inequality-higher-order",
            "s1-1-11-rational-inequality": "senior-rational-inequality-excluded-values-s133",
            "s1-1-11-radical-absolute-inequality": "senior-polynomial-rational-radical-inequality",
            "s1-1-11-parameter-application-inequality": "senior-polynomial-inequality-parameter-cases-s133",
        },
    },
]

PACK_MAPPING_BY_SOURCE = {mapping["source_code"]: mapping for mapping in PACK_MAPPINGS}

PACK_MAPPING_BY_SOURCE["s1-1-6"].setdefault("record_overrides", {}).update(
    {
        51: {
            "question_text": (
                "解下列各二元一次聯立不等式：\n"
                "(1)\n"
                "$x＋y－4 \\leq 0$\n"
                "$2x－y＋2 \\leq 0$\n"
                "(2)\n"
                "$x－2y \\geq －4$\n"
                "$3x－2y \\leq 12$\n"
                "$x＋y \\geq 2$"
            )
        },
        52: {
            "question_text": (
                "圖解下列各二元一次聯立不等式：\n"
                "(1)\n"
                "$2x－y－4 < 0$\n"
                "$3x＋y－11 > 0$\n"
                "(2)\n"
                "$4x－y－7 \\leq 0$\n"
                "$3x－4y＋11 \\geq 0$\n"
                "$x＋3y－5 \\geq 0$"
            )
        },
        53: {
            "question_text": (
                "圖示下列各不等式的圖形：\n"
                "(1) $(x－2y＋2)(x＋2y－4) \\geq 0$。\n"
                "(2) $－1 \\leq x＋y \\leq 5$，$－4 \\leq x－2y \\leq 2$。"
            )
        },
        54: {
            "question_text": (
                "(1) 在坐標平面上作出 $|x|+|y|\\le 4$ 與 $|x|+4|y|\\ge 4$ 的公共圖形。\n"
                "(2) 並求其面積。"
            ),
            "explanation_text": (
                "【解析】(1)兩圖形均與 $x$ 軸、$y$ 軸成對稱，先作 $x\\ge 0$、$y\\ge 0$ 時的圖形："
                "$x+y\\le 4$ 與 $x+4y\\ge 4$，得到第一象限中的區域A。再利用對稱性可得整個鋪色區域。\n"
                "(2)面積為 $\\frac{1}{2}\\times 8\\times 8-\\frac{1}{2}\\times 8\\times 2=24$。"
            ),
        },
        55: {
            "question_text": (
                "如圖可用下列哪一組聯立不等式表示？\n"
                "(A)\n"
                "$2x＋y－2<0$\n"
                "$x－y<0$\n"
                "$2x＋3y＋9<0$\n"
                "(B)\n"
                "$2x＋y－2<0$\n"
                "$x－y>0$\n"
                "$2x＋3y＋9<0$\n"
                "(C)\n"
                "$2x＋y－2<0$\n"
                "$x－y<0$\n"
                "$2x＋3y＋9>0$\n"
                "(D)\n"
                "$2x＋y－2<0$\n"
                "$x－y>0$\n"
                "$2x＋3y＋9>0$"
            ),
            "explanation_text": (
                "【解析】由圖可知著色區域在直線 $2x＋y－2=0$ 的左側，所以 $2x＋y－2<0$；"
                "在直線 $x－y=0$ 的右側，所以 $x－y>0$；"
                "在直線 $2x＋3y＋9=0$ 的右側，所以 $2x＋3y＋9>0$。"
                "故選(D)。"
            ),
        },
        60: {
            "question_text": (
                "聯立不等式\n"
                "$0<x<5$\n"
                "$0<y<6$\n"
                "$x+y\\le 7$\n"
                "的圖形區域中，共有幾個格子點。\n"
                "[圖:program-db/imports/packs/s1-1-6/assets/media/image51.jpeg]"
            )
        },
        66: {
            "question_text": (
                "給三個不等式組與四個圖形：\n"
                "甲：$x+y+1\\ge 0$，$x+y-2\\le 0$\n"
                "乙：$(x+y+1)(x+y-2)\\le 0$\n"
                "丙：$(x-y+2)(x+2y-2)\\ge 0$"
            )
        },
    }
)

PACK_MAPPING_BY_SOURCE["s1-1-9"].setdefault("record_overrides", {}).update(
    {
        7: {
            "question_text": (
                "設 $g(x+6)=f(x)$，且\n"
                "$x<1$ 時，$f(x)=|2x-3|$\n"
                "$1\\leq x<9$ 時，$f(x)=x^{2}+x-5$\n"
                "$x\\geq 9$ 時，$f(x)=-2x+1$\n"
                "則 $g(f(2))=$____________。"
            )
        },
        27: {
            "question_text": "設 $f(x)=x^{4}+6x^{3}+6x^{2}+ax+b$，$g(x)=x^{3}+3x^{2}+6x+3$，若以 $x^{2}+2x+3$ 除 $f(x)$ 與 $g(x)$ 的餘式相等，則 $a+b$ 的值為 (1) $-10$ (2) $-11$ (3) $-12$ (4) $-13$。",
            "explanation_text": (
                "【解一】以長除法計算得 $g(x)=(x^{2}+2x+3)(x+1)+x$，"
                "$f(x)=(x^{2}+2x+3)(x^{2}+4x-5)+(a-2)x+(b+15)$，"
                "所以 $a-2=1$，$b+15=0$，故 $a=3$，$b=-15$，$a+b=-12$。\n"
                "[圖:program-db/imports/packs/s1-1-9/assets/media/image10.wmf.png]\n"
                "【解二】$f(x)-g(x)$ 可被 $x^{2}+2x+3$ 整除。"
                "即 $x^{4}+5x^{3}+3x^{2}+(a-6)x+(b-3)$ 可被 $x^{2}+2x+3$ 整除，"
                "得 $a-15=-12$、$b-3=-18$，所以 $a=3$，$b=-15$。故選 (3)。"
            ),
        },
        37: {
            "question_text": (
                "計算 $7^{5}-6\\times 7^{4}-4\\times 7^{3}-26\\times 7$。"
                "小華使用綜合除法計算 "
                "$f(x)=ax^{4}+3x^{3}+5x^{2}+bx+6$ 除以 $x+\\frac{1}{2}$，"
                "得到下列過程：上排依序為 $a,3,5,b,6$；中排依序為 $-1,d,-2,e$；"
                "下排依序為 $2,c,4,-6,f$，對應的綜合除法值為 $-\\frac{1}{2}$。"
                "則下列敘述何者正確？"
                " (1) $a+b>0$"
                " (2) $c-d+e$ 為偶數"
                " (3) $f(x)$ 除以 $x+\\frac{1}{2}$ 的餘式為 3"
                " (4) $f(x)$ 除以 $2x+1$ 的餘式為 9"
                " (5) $f(x)$ 除以 $2x+1$ 的商式為 $2x^{3}+2x^{2}+4x-6$"
            )
        },
    }
)


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def rebuild_preview(records: list[dict], chapter_code: str) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = str(record.get("source_section", "")).strip() or "未分類"
        by_section.setdefault(section, []).append(
            {
                "id": record.get("id", ""),
                "title": record.get("title", ""),
                "question_category": record.get("question_category", ""),
                "difficulty": record.get("difficulty", ""),
                "formula_id": record.get("formula_id", ""),
            }
        )
    return {
        "meta": {
            "chapter_code": chapter_code,
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for record in records if not record.get("formula_id")),
        },
        "by_category": dict(Counter(record.get("question_category", "") for record in records)),
        "by_section": by_section,
    }


def update_manifest(manifest: dict, target_code: str, target_title: str, source_code: str) -> dict:
    payload = dict(manifest or {})
    payload["chapter_code"] = target_code
    payload["chapter_title"] = target_title
    payload["web_structure_target"] = {
        "chapter_code": target_code,
        "chapter_title": target_title,
        "remapped_from_pack": source_code,
        "updated_at": datetime.now().astimezone().isoformat(),
    }
    return payload


def remap_tags(tags: list[str], source_code: str, target_code: str) -> list[str]:
    mapped = []
    seen = set()
    for tag in tags or []:
        text = str(tag)
        if text == source_code:
            text = target_code
        if text not in seen:
            seen.add(text)
            mapped.append(text)
    if target_code not in seen:
        mapped.insert(0, target_code)
    return mapped


def remap_records(records: list[dict], mapping: dict) -> list[dict]:
    source_code = mapping["source_code"]
    target_code = mapping["target_code"]
    formula_map = mapping["formula_map"]
    record_overrides = mapping.get("record_overrides", {})
    source_formula_by_order = SOURCE_FORMULA_BY_ORDER.get(source_code, {})
    rows = []
    for index, record in enumerate(sorted(records, key=lambda item: int(item.get("source_order", 0) or 0)), start=1):
        row = dict(record)
        source_order = int(row.get("source_order", 0) or 0)
        if source_order in record_overrides:
            row.update(record_overrides[source_order])
        row["id"] = f"q-{target_code}-{index:04d}"
        row["chapter_code"] = target_code
        current_formula_id = str(row.get("formula_id", "") or "")
        original_formula_id = source_formula_by_order.get(source_order, current_formula_id)
        if current_formula_id in formula_map:
            row["formula_id"] = formula_map[current_formula_id]
        elif original_formula_id in formula_map:
            row["formula_id"] = formula_map[original_formula_id]
        else:
            row["formula_id"] = current_formula_id
        row["tags"] = remap_tags(row.get("tags", []), source_code, target_code)
        rows.append(row)
    return rows


def rewrite_review_file(path: Path, source_code: str, target_code: str, target_title: str):
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    text = text.replace(source_code, target_code)
    text = re.sub(r"^# .+$", f"# {target_code} Review Needed", text, count=1, flags=re.M)
    if "Current extraction status" in text and "web structure target" not in text:
        text = text.replace(
            "## Current extraction status",
            "## Current extraction status\n\n- Remapped to current web chapter: "
            f"`{target_code}` / {target_title}",
            1,
        )
    path.write_text(text, encoding="utf-8")


def remap_pack(base_dir: Path, mapping: dict) -> list[dict]:
    source_code = mapping["source_code"]
    target_code = mapping["target_code"]
    target_title = mapping["target_title"]
    pack_dir = base_dir / "program-db" / "imports" / "packs" / source_code
    questions_path = pack_dir / "questions.json"
    preview_path = pack_dir / "preview.json"
    manifest_path = pack_dir / "manifest.json"
    review_path = pack_dir / "review-needed.md"

    questions_payload = read_json(questions_path)
    remapped_rows = remap_records(questions_payload.get("questions", []), mapping)
    questions_payload["meta"]["chapter_code"] = target_code
    questions_payload["summary"]["count"] = len(remapped_rows)
    questions_payload["summary"]["categories"] = dict(Counter(row.get("question_category", "") for row in remapped_rows))
    questions_payload["summary"]["sections"] = dict(Counter(row.get("source_section", "") for row in remapped_rows))
    questions_payload["questions"] = remapped_rows
    write_json(questions_path, questions_payload)

    write_json(preview_path, rebuild_preview(remapped_rows, target_code))
    write_json(manifest_path, update_manifest(read_json(manifest_path), target_code, target_title, source_code))
    rewrite_review_file(review_path, source_code, target_code, target_title)
    return remapped_rows


def sync_question_db(base_dir: Path, all_rows: list[dict], remove_codes: list[str]):
    db_path = base_dir / "program-db" / "database" / "question-db.json"
    payload = read_json(db_path)
    existing = [
        row
        for row in payload.get("questions", [])
        if str(row.get("chapter_code")) not in set(remove_codes)
    ]
    payload["questions"] = existing + all_rows
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(payload["questions"])
    payload["meta"]["updatedAt"] = datetime.now().astimezone().isoformat()
    payload["meta"]["lastRemapToWebStructure"] = {
        "chapters": sorted(set(row["chapter_code"] for row in all_rows)),
        "updatedAt": datetime.now().astimezone().isoformat(),
    }
    write_json(db_path, payload)
    sync_question_js_from_db(db_path)
    sync_extra_web_from_db()


def main():
    parser = argparse.ArgumentParser(description="Remap packs s1-1-6 ~ s1-1-11 to current web chapter structure.")
    parser.add_argument("--base-dir", default=".")
    parser.add_argument("--sync-db", action="store_true")
    args = parser.parse_args()

    base_dir = Path(args.base_dir).resolve()
    all_rows: list[dict] = []
    remove_codes: list[str] = []

    for mapping in PACK_MAPPINGS:
        rows = remap_pack(base_dir, mapping)
        all_rows.extend(rows)
        remove_codes.extend([mapping["source_code"], mapping["target_code"]])
        print(
            f"{mapping['source_code']} -> {mapping['target_code']}: "
            f"{len(rows)} questions, {len(set(row.get('formula_id', '') for row in rows))} topic ids"
        )

    if args.sync_db:
        sync_question_db(base_dir, all_rows, remove_codes)
        print("question-db and web sync updated")


if __name__ == "__main__":
    main()
