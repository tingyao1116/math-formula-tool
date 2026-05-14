from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s1-1-11" / "questions.json"


ANSWER_UPDATES = {
    "q-s1-3-3-0001": "$x<-2$",
    "q-s1-3-3-0002": "$x>-5$",
    "q-s1-3-3-0003": "$-3<x\\le 4$",
    "q-s1-3-3-0004": "$x>\\frac{3}{2}$",
    "q-s1-3-3-0005": "$a=\\frac{1}{3}$",
    "q-s1-3-3-0006": "$57\\le W_{0}\\le 70$",
    "q-s1-3-3-0007": "$v\\ge 30$ 公尺/秒",
    "q-s1-3-3-0008": "$r\\le 50$",
    "q-s1-3-3-0009": "$(1)(2)(3)(4)(5)$",
    "q-s1-3-3-0010": "$-\\frac{1}{3}<x<1$",
    "q-s1-3-3-0011": "$x<-4$ 或 $x>-2$",
    "q-s1-3-3-0012": "$x<-2$ 或 $x>1$",
    "q-s1-3-3-0013": "$(2)$",
    "q-s1-3-3-0014": "$(1)(3)(4)$",
    "q-s1-3-3-0015": "$(A)(D)$",
    "q-s1-3-3-0016": "$a\\ge 2$",
    "q-s1-3-3-0017": "$2-2\\sqrt{2}\\le a\\le 2+2\\sqrt{2}$",
    "q-s1-3-3-0018": "$0<a<-2+2\\sqrt{2}$",
    "q-s1-3-3-0019": "$(4)(5)$",
    "q-s1-3-3-0020": "$(2)(3)(4)(5)$",
    "q-s1-3-3-0021": "$-2<a<\\frac{5}{3}$",
    "q-s1-3-3-0022": "$-7$",
    "q-s1-3-3-0023": "$x>2$ 或 $x<-\\frac{3}{2}$",
    "q-s1-3-3-0024": "$x<-\\frac{5}{2}$ 或 $x>1$",
    "q-s1-3-3-0025": "(1) $2-2\\sqrt{3}<a<2+2\\sqrt{3}$；(2) $-2\\le a<2+2\\sqrt{3}$",
    "q-s1-3-3-0026": "$x=0,1,4,5$",
    "q-s1-3-3-0027": "$1<m<3$",
    "q-s1-3-3-0028": "$1<x<3$",
    "q-s1-3-3-0029": "$2<x<8$",
    "q-s1-3-3-0030": "$2\\le x\\le 6$",
    "q-s1-3-3-0031": "$2<x<3$",
    "q-s1-3-3-0032": "(1) $1<x<3$ 或 $x>5$；(2) $x<1$ 或 $3<x<5$",
    "q-s1-3-3-0033": "$x<-2$ 或 $1<x<2$ 或 $x>2$",
    "q-s1-3-3-0034": "(1) $x\\le 1$ 或 $x=3$ 或 $x\\ge 5$；(2) $1<x<3$ 或 $3<x<5$",
    "q-s1-3-3-0035": "$-3<x<5$，且 $x\\ne 2$",
    "q-s1-3-3-0036": "$-2<x<\\frac{1-\\sqrt{5}}{2}$ 或 $\\frac{1+\\sqrt{5}}{2}<x<3$",
    "q-s1-3-3-0037": "$-2<x<3$",
    "q-s1-3-3-0038": "$-2\\le x\\le -1$ 或 $x\\ge \\frac{1}{2}$",
    "q-s1-3-3-0039": "$-2<a<3$",
    "q-s1-3-3-0040": "$-7<x<0$",
    "q-s1-3-3-0041": "(1) $x<-1$ 或 $0<x<1$；(2) $-3\\le x<2$",
    "q-s1-3-3-0042": "$(1)(3)(4)$",
    "q-s1-3-3-0043": "$x=2$ 或 $3$",
    "q-s1-3-3-0044": "$1<k<3$",
    "q-s1-3-3-0045": "$-1\\le x<1$ 或 $x\\ge 2$",
    "q-s1-3-3-0046": "$1<x<2$",
    "q-s1-3-3-0047": "$-4<x<-3$，或 $-\\frac{5}{2}\\le x<-2$，或 $x>-1$",
    "q-s1-3-3-0048": "$-7<a<17$",
    "q-s1-3-3-0049": "$\\frac{1}{5}<x<2$ 或 $x>3$",
    "q-s1-3-3-0050": "(1) $1\\le x<5$；(2) $x>5$；(3) $4<x\\le 7$",
    "q-s1-3-3-0051": "$x=-1$ 或 $1\\le x\\le 5$",
    "q-s1-3-3-0052": "$-5<x<1$，或 $x>5$",
    "q-s1-3-3-0053": "$-2<x<1$，或 $2<x<5$",
    "q-s1-3-3-0054": "$(a,b)=(5,5)$",
    "q-s1-3-3-0055": "(1) $v=73.5$ 公尺/秒；(2) $5$ 秒",
    "q-s1-3-3-0056": "$8$ 分鐘",
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
