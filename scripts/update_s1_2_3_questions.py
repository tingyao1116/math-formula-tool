from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s1-1-8" / "questions.json"


ANSWER_UPDATES = {
    "q-s1-2-3-0001": "$\\left(3\\sqrt{2},5\\sqrt{2}\\right)$",
    "q-s1-2-3-0002": "$(A)(C)$",
    "q-s1-2-3-0003": "$(A)(D)(E)$",
    "q-s1-2-3-0004": "(1) 最小值 $3$，$P\\left(\\frac{23}{5},\\frac{14}{5}\\right)$；(2) 最大值 $7$，$P\\left(\\frac{7}{5},\\frac{26}{5}\\right)$",
    "q-s1-2-3-0005": "(1) $1$；(2) $11$",
    "q-s1-2-3-0006": "$(A)(D)(E)$",
    "q-s1-2-3-0007": "$\\frac{\\sqrt{110}}{2}$",
    "q-s1-2-3-0008": "(1) $2\\sqrt{11}$；(2) $x^{2}+y^{2}-4x-3y-7=0$",
    "q-s1-2-3-0009": "$(A)(B)(C)(D)$",
    "q-s1-2-3-0010": "$(5)$",
    "q-s1-2-3-0011": "切線段長為 $\\sqrt{x_{0}^{2}+y_{0}^{2}+ax_{0}+by_{0}+c}$",
    "q-s1-2-3-0012": "最大值 $11$，此時 $P=(-1,-7)$",
    "q-s1-2-3-0013": "$k=2$ 或 $k=-38$",
    "q-s1-2-3-0014": "$3-5\\sqrt{5}<k<3+5\\sqrt{5}$",
    "q-s1-2-3-0015": "$-12<k<5$",
    "q-s1-2-3-0016": "$(2)$",
    "q-s1-2-3-0017": "$(1)$",
    "q-s1-2-3-0018": "$(1)(2)(4)(5)$",
    "q-s1-2-3-0019": "$k=2$ 或 $k=-38$",
    "q-s1-2-3-0020": "$1<k<5$",
    "q-s1-2-3-0021": "$-\\frac{1311}{25}<k<25$",
    "q-s1-2-3-0022": "$-\\frac{39}{2}<k<5$",
    "q-s1-2-3-0023": "$3$",
    "q-s1-2-3-0024": "(1) 最大值 $7$，最小值 $3$；(2) $P\\left(\\frac{7}{5},-\\frac{4}{5}\\right)$",
    "q-s1-2-3-0025": "最大值 $11$，此時 $P=(-1,-7)$",
    "q-s1-2-3-0026": "相交於兩點：$k>0$ 或 $k<-\\frac{4}{3}$；相切：$k=0$ 或 $k=-\\frac{4}{3}$；相離：$-\\frac{4}{3}<k<0$",
    "q-s1-2-3-0027": "$320$ 公尺",
    "q-s1-2-3-0028": "$x-2y=0$ 或 $x-2y+10=0$",
    "q-s1-2-3-0029": "$2x-y-13+6\\sqrt{5}=0$ 或 $2x-y-13-6\\sqrt{5}=0$",
    "q-s1-2-3-0030": "切線方程式為 $(x_{0}-h)(x-h)+(y_{0}-k)(y-k)=r^{2}$",
    "q-s1-2-3-0031": "切線方程式為 $x_{0}x+y_{0}y+\\frac{d}{2}(x+x_{0})+\\frac{e}{2}(y+y_{0})+f=0$",
    "q-s1-2-3-0032": "$7x-y=17$",
    "q-s1-2-3-0033": "$2x+y-5=0$",
    "q-s1-2-3-0034": "$\\frac{7}{3}$",
    "q-s1-2-3-0035": "(1) $c=14$；(2) $(d,e)=(-4,2)$",
    "q-s1-2-3-0036": "$3x+4y-7=0$ 或 $x=1$",
    "q-s1-2-3-0037": "$5x+12y-16=0$ 或 $x=-4$",
    "q-s1-2-3-0038": "(1) $y=3$ 或 $12x-5y-33=0$；(2) $x^{2}+y^{2}-5x-4y+7=0$；(3) $9$",
    "q-s1-2-3-0039": "$(2)(3)$",
    "q-s1-2-3-0040": "$(1)(4)(5)$",
    "q-s1-2-3-0041": "$\\frac{14}{3}$",
    "q-s1-2-3-0042": "$(B)(C)(D)$",
    "q-s1-2-3-0043": "$1\\le k<\\sqrt{2}$",
    "q-s1-2-3-0044": "$(2)(3)(4)(5)$",
    "q-s1-2-3-0045": "(1) 最大值 $5$；(2) 最小值 $-\\frac{\\sqrt{3}}{3}$",
    "q-s1-2-3-0046": "最大值 $25$；最小值 $17-4\\sqrt{13}$",
    "q-s1-2-3-0047": "$3x-4y+3=0$ 或 $4x+3y+4=0$（但不含點 $(-1,0)$）",
    "q-s1-2-3-0048": "$2x-y=9$",
    "q-s1-2-3-0049": "$40$ 公尺",
    "q-s1-2-3-0050": "$x^{2}+y^{2}-4x-5=0$",
    "q-s1-2-3-0051": "$x^{2}+y^{2}+2x-4y+1=0$ 或 $x^{2}+y^{2}+6x-6y+9=0$",
    "q-s1-2-3-0052": "$x^{2}+y^{2}+6x-6y+9=0$ 或 $x^{2}+y^{2}+14x-10y+25=0$",
    "q-s1-2-3-0053": "$(x-1)^{2}+(y-1)^{2}=9$",
    "q-s1-2-3-0054": "$x^{2}+y^{2}-x-6=0$",
    "q-s1-2-3-0055": "(1) 圓心 $(1,-3)$；(2) $x+3y+3=0$",
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
