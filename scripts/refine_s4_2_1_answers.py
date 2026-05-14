from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s4-2-1/questions.json")


ANSWER_MAP = {
    "q-s4-2-1-0001": "$x+5y+3z-7=0$",
    "q-s4-2-1-0002": "(1)$4x-5y+3z-5=0$；(2)$2$",
    "q-s4-2-1-0003": "$4x-7y-6z+21=0$",
    "q-s4-2-1-0004": "(1)$5$；(2)$\\left(\\frac{3}{5},\\frac{4}{5},0\\right)$；(3)$5\\sqrt{2}$；(4)$4x-3y+5z-5=0$；(5)$\\frac{20}{3}$",
    "q-s4-2-1-0005": "$y+z-4=0$",
    "q-s4-2-1-0006": "$5x-y-3z-1=0$",
    "q-s4-2-1-0007": "$x-4y-3z+4=0$",
    "q-s4-2-1-0008": "(1)$\\left(\\frac{1}{3},\\frac{7}{3},-\\frac{1}{3}\\right)$；(2)$1$；(3)$(22,-11,44)$；(4)$\\frac{11\\sqrt{21}}{2}$；(5)$2x-12y-4z+39=0$；(6)$2x-y+4z+3=0$",
    "q-s4-2-1-0009": "(1)$\\frac{\\sqrt{101}}{3}$；(2)$\\frac{10}{3}$",
    "q-s4-2-1-0010": "$9$",
    "q-s4-2-1-0011": "(1)$(4,-2,4)$；(2)$\\frac{7}{2}$；(3)$2x+3y+6z-26=0$；(4)$\\frac{13}{3}$",
    "q-s4-2-1-0012": "$x+y-3z-6=0$",
    "q-s4-2-1-0013": "$2x+y+2z=\\pm 6$",
    "q-s4-2-1-0014": "$\\frac{x}{6}+\\frac{y}{9}+\\frac{z}{3}=1$",
    "q-s4-2-1-0015": "$2x+3y+4z-4=0$",
    "q-s4-2-1-0016": "(1)$\\frac{x}{3}+\\frac{y}{6}+\\frac{z}{9}=1$；(2)$27$",
    "q-s4-2-1-0017": "$14x-3y+6z+1=0$",
    "q-s4-2-1-0018": "(1)$5x+y-3z+2=0$；(2)$5x+y-3z+2=0$",
    "q-s4-2-1-0019": "$60^\\circ$或$120^\\circ$",
    "q-s4-2-1-0020": "$\\frac{\\sqrt{2}}{2}$",
    "q-s4-2-1-0021": "$\\frac{\\pi}{4}$",
    "q-s4-2-1-0022": "$60^\\circ$",
    "q-s4-2-1-0023": "$\\frac{3\\sqrt{2}}{2}$，$60^\\circ$",
    "q-s4-2-1-0024": "$x\\pm\\sqrt{6}y+3z=1$",
    "q-s4-2-1-0025": "$\\frac{1}{\\sqrt{2}}$",
    "q-s4-2-1-0026": "$2x+y+2z-3=0$或$2x+y-2z+1=0$",
    "q-s4-2-1-0027": "$6$",
    "q-s4-2-1-0028": "$3$",
    "q-s4-2-1-0029": "$3x+6y-2z=-13$或$3x+6y-2z=15$",
    "q-s4-2-1-0030": "$\\frac{3\\sqrt{21}}{7}$",
    "q-s4-2-1-0031": "$\\frac{10}{7}$",
    "q-s4-2-1-0032": "(1)$3x-2y+6z-4=0$；(2)$-2$",
    "q-s4-2-1-0033": "(1)$\\frac{4\\sqrt{2}}{3}$；(2)$\\sqrt{97}$；(3)$\\frac{18}{11}$；(4)$x+z=1$",
    "q-s4-2-1-0034": "(1)$\\frac{\\sqrt{114}}{3}$；(2)$\\left(\\frac{4}{3},\\frac{1}{6},\\frac{1}{6}\\right)$",
}


def main() -> None:
    data = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = data["questions"] if isinstance(data, dict) else data

    for question in questions:
        qid = question["id"]
        if qid in ANSWER_MAP:
            question["answer_text"] = ANSWER_MAP[qid]

    PACK_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
