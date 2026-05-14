from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s1-1-6" / "questions.json"


ANSWER_UPDATES = {
    "q-s1-2-1-0001": "$(9,11)$",
    "q-s1-2-1-0002": "$(4,4)$ 或 $(28,16)$",
    "q-s1-2-1-0003": "$(B)(D)(E)$",
    "q-s1-2-1-0004": "$\\left(\\frac{4}{3},2\\right)$",
    "q-s1-2-1-0005": "$10$",
    "q-s1-2-1-0006": "$18$",
    "q-s1-2-1-0007": "$(B)(D)(E)$",
    "q-s1-2-1-0008": "$(B)(C)(D)(E)$",
    "q-s1-2-1-0009": "(1) $L_{3}$；(2) $L_{4}$",
    "q-s1-2-1-0010": "$m\\le -\\frac{5}{2}$ 或 $m\\ge \\frac{2}{3}$",
    "q-s1-2-1-0011": "$-\\frac{3}{2}<m<\\frac{3}{2}$",
    "q-s1-2-1-0012": "$k=-\\frac{1}{2},-2,2$",
    "q-s1-2-1-0013": "(1) $4$；(2) $\\frac{21}{2}$",
    "q-s1-2-1-0014": "(1) $2$；(2) $3$；(3) $2,3$；(4) $-10$",
    "q-s1-2-1-0015": "$16$",
    "q-s1-2-1-0016": "$(C)(E)$",
    "q-s1-2-1-0017": "$(D)(E)$",
    "q-s1-2-1-0018": "$6x+5y=30$ 或 $6x+5y=-30$",
    "q-s1-2-1-0019": "直線：$-\\frac{x}{6}+\\frac{y}{8}=1$；最小面積 $24$",
    "q-s1-2-1-0020": "$x-y+4=0$",
    "q-s1-2-1-0021": "$(3,-5)$",
    "q-s1-2-1-0022": "$3x+2y-12=0$",
    "q-s1-2-1-0023": "$x+y=1$、$x-y=5$、$2x+3y=0$",
    "q-s1-2-1-0024": "$(D)(E)$",
    "q-s1-2-1-0025": "$(A)(B)(D)(E)$",
    "q-s1-2-1-0026": "$a=-\\frac{1}{2}$ 或 $a=-\\frac{13}{9}$",
    "q-s1-2-1-0027": "(1) $(3,8)$；(2) $1$；(3) $-1,\\frac{11}{5}$",
    "q-s1-2-1-0028": "$(7,-2)$",
    "q-s1-2-1-0029": "(1) $G\\left(\\frac{16}{3},-\\frac{5}{3}\\right)$；(2) $H(6,1)$；(3) $(5,-3)$；(4) 共線",
    "q-s1-2-1-0030": "$\\left(\\frac{12}{5},\\frac{3}{5}\\right)$",
    "q-s1-2-1-0031": "$1:2$",
    "q-s1-2-1-0032": "$k=3$ 或 $k=5$",
    "q-s1-2-1-0033": "$2$",
    "q-s1-2-1-0034": "(1) $\\frac{\\sqrt{2}}{2}$；(2) $\\frac{5}{2}$",
    "q-s1-2-1-0035": "$\\frac{5}{2\\sqrt{13}}$",
    "q-s1-2-1-0036": "$4x-3y+12=0$ 或 $4x-3y-8=0$",
    "q-s1-2-1-0037": "$\\left(\\frac{11}{5},\\frac{7}{5},\\frac{1}{\\sqrt{5}}\\right)$",
    "q-s1-2-1-0038": "$\\left(\\frac{1}{5},\\frac{7}{5}\\right)$",
    "q-s1-2-1-0039": "$10$",
    "q-s1-2-1-0040": "$(0,4)$",
    "q-s1-2-1-0041": "$22$",
    "q-s1-2-1-0042": "(1) $(3,-2)$；(2) $x-2y-7=0$；(3) $(-3,-5)$",
    "q-s1-2-1-0043": "(1) $\\left(\\frac{11}{5},\\frac{18}{5}\\right)$；(2) $\\left(\\frac{5}{3},\\frac{10}{3}\\right)$",
    "q-s1-2-1-0044": "$k<-5$ 或 $k>3$",
    "q-s1-2-1-0045": "$-2<k<-1$",
    "q-s1-2-1-0046": "$(A)(C)(D)$",
    "q-s1-2-1-0047": "$1\\le k\\le 4$",
    "q-s1-2-1-0048": "$m\\ge 1$ 或 $m\\le -1$",
    "q-s1-2-1-0049": "$m\\le -\\frac{3}{2}$ 或 $m\\ge \\frac{4}{3}$",
    "q-s1-2-1-0050": "(1) $y\\le -\\frac{2}{3}x+4$；(2) $y<\\frac{5}{3}x-5$；(3) $y\\ge -2$",
    "q-s1-2-1-0051": "(1) $2x+2\\le y\\le 4-x$；(2) $y\\le \\frac{x}{2}+2$，$y\\ge \\frac{3}{2}x-6$，且 $y\\ge 2-x$",
    "q-s1-2-1-0052": "(1) $y>2x-4$ 且 $y>11-3x$；(2) $y\\ge 4x-7$，$y\\le \\frac{3x+11}{4}$，且 $y\\ge \\frac{5-x}{3}$",
    "q-s1-2-1-0053": "(1) $\\{x-2y+2\\ge 0,\\ x+2y-4\\ge 0\\}\\cup\\{x-2y+2\\le 0,\\ x+2y-4\\le 0\\}$；(2) $-1\\le x+y\\le 5$，$-4\\le x-2y\\le 2$",
    "q-s1-2-1-0054": "(1) 圖略；(2) $24$",
    "q-s1-2-1-0055": "$(D)$",
    "q-s1-2-1-0056": "$-2<t<\\frac{5}{3}$",
    "q-s1-2-1-0057": "(1) $y\\le 3$，$3x+y\\ge 0$，$x-y-2\\le 0$；(2) $\\frac{9}{5}\\le k\\le 3$",
    "q-s1-2-1-0058": "$(2)$",
    "q-s1-2-1-0059": "$26$",
    "q-s1-2-1-0060": "$17$",
    "q-s1-2-1-0061": "圖略；面積 $18$",
    "q-s1-2-1-0062": "$(2a+b-1)(4a+b-4)\\le 0$",
    "q-s1-2-1-0063": "$(2)(3)(4)$",
    "q-s1-2-1-0064": "$x-y\\le 0$，$3x+5y\\le 24$，$5x+3y\\ge 8$",
    "q-s1-2-1-0065": "$(A)(C)(E)$",
    "q-s1-2-1-0066": "甲：$B$；乙：$B$；丙：$D$",
    "q-s1-2-1-0067": "$(B)(C)(E)$",
    "q-s1-2-1-0068": "圖略；面積 $\\frac{16}{5}$",
    "q-s1-2-1-0069": "圖略；面積 $\\frac{85}{2}$",
}


def main() -> None:
    payload = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = payload.get("questions", [])
    if not isinstance(questions, list):
        raise ValueError("questions must be a list")

    updated_answers = 0
    for row in questions:
        rid = str(row.get("id", "")).strip()
        if rid in ANSWER_UPDATES:
            row["answer_text"] = ANSWER_UPDATES[rid]
            updated_answers += 1

    if updated_answers != len(ANSWER_UPDATES):
        raise ValueError(
            f"expected to update {len(ANSWER_UPDATES)} answers, updated {updated_answers}"
        )

    PACK_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
