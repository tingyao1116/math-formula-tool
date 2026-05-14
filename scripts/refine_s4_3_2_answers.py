from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s4-3-2/questions.json")


ANSWER_MAP = {
    "q-s4-3-2-0001": "(1)$\\frac{1}{12}$；(2)$\\frac{1}{6}$",
    "q-s4-3-2-0002": "(A)(D)(E)",
    "q-s4-3-2-0003": "(1)$\\frac{1}{2}$；(2)$\\frac{5}{6}$",
    "q-s4-3-2-0004": "$\\frac{3}{4}$",
    "q-s4-3-2-0005": "(1)(3)(5)",
    "q-s4-3-2-0006": "(1)(3)(5)",
    "q-s4-3-2-0007": "$\\frac{17}{28}$",
    "q-s4-3-2-0008": "(1)$\\frac{23}{24}$；(2)$\\frac{1}{3}$",
    "q-s4-3-2-0009": "(1)$0.04$；(2)$\\frac{2}{13}$",
    "q-s4-3-2-0010": "(A)(D)(E)",
    "q-s4-3-2-0011": "(3)(5)",
    "q-s4-3-2-0012": "(1)$\\frac{3}{5}$；(2)$\\frac{2}{3}$",
    "q-s4-3-2-0013": "(1)$\\frac{2}{3}$；(2)$\\frac{2}{3}$",
    "q-s4-3-2-0014": "(1)$\\frac{9}{10}$；(2)$\\frac{5}{12}$；(3)$\\frac{18}{25}$",
    "q-s4-3-2-0015": "$12$",
    "q-s4-3-2-0016": "$\\frac{18}{125}$",
    "q-s4-3-2-0017": "$P\\left(-\\frac{2}{3},\\frac{7}{3},\\frac{10}{3}\\right)$，最小值$=\\sqrt{141}$",
    "q-s4-3-2-0018": "(1)$\\left(\\frac{3}{2},1,\\frac{3}{2}\\right)$；(2)$\\sqrt{14}$",
    "q-s4-3-2-0019": "$\\frac{5}{29}$",
    "q-s4-3-2-0020": "$\\frac{21}{31}$",
    "q-s4-3-2-0021": "(1)$\\frac{341}{720}$；(2)$\\frac{2}{11}$",
    "q-s4-3-2-0022": "$\\frac{37}{245}$",
    "q-s4-3-2-0023": "$\\frac{47}{108}$",
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
