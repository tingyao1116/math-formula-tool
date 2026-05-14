from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s4-1-3/questions.json")


ANSWER_MAP = {
    "q-s4-1-3-0001": "$(38,15,3)$",
    "q-s4-1-3-0002": "$90^\\circ$",
    "q-s4-1-3-0003": "$\\sqrt{14}$",
    "q-s4-1-3-0004": "$\\frac{\\pi}{3}$或$\\frac{2\\pi}{3}$",
    "q-s4-1-3-0005": "(1)$\\frac{1}{3}$；(2)$\\frac{\\sqrt{6}}{3}$",
    "q-s4-1-3-0006": "(1)$\\frac{4}{9}$；(2)$1$",
    "q-s4-1-3-0007": "(1)$-3$；(2)$-\\frac{1}{2}$；(3)$-\\frac{3}{2}$",
    "q-s4-1-3-0008": "(1)(3)(5)",
    "q-s4-1-3-0009": "(1)$3$；(2)$\\frac{\\sqrt{5}}{5}$；(3)$3$",
    "q-s4-1-3-0010": "$\\lambda=-2$",
    "q-s4-1-3-0011": "$54$",
    "q-s4-1-3-0012": "(1)$\\frac{11}{15}$；(2)$\\sqrt{26}$；(3)$\\left(\\frac{21}{4},\\frac{15}{4},\\frac{19}{4}\\right)$",
    "q-s4-1-3-0013": "(1)$1$；(2)$\\pm\\left(\\frac{1}{\\sqrt{3}},-\\frac{1}{\\sqrt{3}},\\frac{1}{\\sqrt{3}}\\right)$；(3)$\\frac{\\sqrt{3}}{2}$；(4)$1$",
    "q-s4-1-3-0014": "(1)$-3$；(2)$\\frac{15}{2}$；(3)$5$",
    "q-s4-1-3-0015": "(1)$6$；(2)$2\\sqrt{29}$；(3)$4$",
    "q-s4-1-3-0016": "$\\sqrt{70}$",
    "q-s4-1-3-0017": "$4\\sqrt{5}$",
    "q-s4-1-3-0018": "(4)",
    "q-s4-1-3-0019": "(5)",
    "q-s4-1-3-0020": "$15$",
    "q-s4-1-3-0021": "$9$",
    "q-s4-1-3-0022": "最大值$7$，最小值$-3$",
    "q-s4-1-3-0023": "$9$",
    "q-s4-1-3-0024": "最大值$28$；此時$\\overset{⃑}{b}=(2,4,6)$",
    "q-s4-1-3-0025": "最小值$-27$；此時$\\overset{⃑}{b}=(-6,-3,6)$",
    "q-s4-1-3-0026": "(1)$\\sqrt{14}$；(2)$-\\sqrt{14}$",
    "q-s4-1-3-0027": "(1)$\\frac{1800}{169}$；(2)$\\left(\\frac{150}{169},\\frac{360}{169}\\right)$",
    "q-s4-1-3-0028": "(1)$(0,4,-4)$；(2)$4\\sqrt{2}$；(3)$(4,0,2)$",
    "q-s4-1-3-0029": "(1)$\\left(\\frac{32}{9},-\\frac{16}{9},\\frac{32}{9}\\right)$；(2)$\\frac{16}{3}$",
    "q-s4-1-3-0030": "(1)$\\left(\\frac{1}{2},0,\\frac{1}{2}\\right)$；(2)$\\left(\\frac{3}{2},2,\\frac{7}{2}\\right)$",
    "q-s4-1-3-0031": "(1)$\\sqrt{2}$；(2)$\\left(-\\frac{1}{2},\\frac{1}{2},-1\\right)$",
    "q-s4-1-3-0032": "(1)(4)",
    "q-s4-1-3-0033": "(1)$11$；(2)$\\frac{11}{2}$",
    "q-s4-1-3-0034": "(1)$9$；(2)$\\sqrt{42}$；(3)$\\left(\\frac{1}{3},-\\frac{2}{3},-1\\right)$",
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
