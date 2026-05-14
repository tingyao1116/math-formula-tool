from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s4-1-4/questions.json")


ANSWER_MAP = {
    "q-s4-1-4-0001": "(1)$\\left(\\frac{85}{26},-\\frac{135}{26},\\frac{40}{13}\\right)$；(2)$\\pm\\left(-\\frac{6}{7},-\\frac{2}{7},\\frac{3}{7}\\right)$",
    "q-s4-1-4-0002": "$(2,2,-4)$或$(-2,-2,4)$",
    "q-s4-1-4-0003": "$-\\frac{11}{25}$",
    "q-s4-1-4-0004": "$(7,-5)$",
    "q-s4-1-4-0005": "(1)$\\frac{49}{2}$；(2)$\\frac{7}{\\sqrt{2}}$",
    "q-s4-1-4-0006": "(1)$\\frac{9}{2}$；(2)$3$",
    "q-s4-1-4-0007": "(A)(D)(E)",
    "q-s4-1-4-0008": "(A)(C)(D)(E)",
    "q-s4-1-4-0009": "$\\frac{3\\sqrt{34}}{2}$",
    "q-s4-1-4-0010": "$10$",
    "q-s4-1-4-0011": "$3$",
    "q-s4-1-4-0012": "(1)$\\overset{⃑}{OC}=\\left(\\frac{1}{2},\\frac{\\sqrt{3}}{2},0\\right)$，$\\overset{⃑}{OD}=\\left(\\frac{1}{2},\\frac{\\sqrt{3}}{6},\\frac{\\sqrt{6}}{3}\\right)$，$\\overset{⃑}{OF}=\\left(2,\\frac{2\\sqrt{3}}{3},\\frac{\\sqrt{6}}{3}\\right)$；(2)$\\frac{\\sqrt{2}}{2}$",
    "q-s4-1-4-0013": "$-252096$",
    "q-s4-1-4-0014": "$1260$",
    "q-s4-1-4-0015": "$-2240$",
    "q-s4-1-4-0016": "$224$",
    "q-s4-1-4-0017": "(1)$-6$；(2)$-5$",
    "q-s4-1-4-0018": "(1)$0$；(2)$-1650$",
    "q-s4-1-4-0019": "$-216$",
    "q-s4-1-4-0020": "(B)(D)(E)",
    "q-s4-1-4-0021": "(A)(B)(D)",
    "q-s4-1-4-0022": "(1)(2)(4)(5)",
    "q-s4-1-4-0023": "$50$",
    "q-s4-1-4-0024": "$90$",
    "q-s4-1-4-0025": "(1)見詳解；(2)$x=-8$或$3$或$5$",
    "q-s4-1-4-0026": "見詳解",
    "q-s4-1-4-0027": "見詳解",
    "q-s4-1-4-0028": "見詳解",
    "q-s4-1-4-0029": "$(a-b)(a-c)(b-c)(a+b+c)$",
    "q-s4-1-4-0030": "$4a^2b^2c^2$",
    "q-s4-1-4-0031": "$(a^2+b^2+c^2)(a-b)(b-c)(c-a)(a+b+c)$",
    "q-s4-1-4-0032": "(1)(3)(4)",
    "q-s4-1-4-0033": "(1)(3)",
    "q-s4-1-4-0034": "$x<6$且$x\\ne 0$",
    "q-s4-1-4-0035": "(1)$12$；(2)$42$",
    "q-s4-1-4-0036": "$x=-6$或$0$",
    "q-s4-1-4-0037": "(1)(2)(5)",
    "q-s4-1-4-0038": "$10$",
    "q-s4-1-4-0039": "$-2$",
    "q-s4-1-4-0040": "$-3$或$2$",
    "q-s4-1-4-0041": "$6$",
    "q-s4-1-4-0042": "$6$",
    "q-s4-1-4-0043": "$\\frac{2}{3}$",
    "q-s4-1-4-0044": "(1)$\\frac{3\\sqrt{17}}{2}$；(2)$-\\frac{7}{10}$；(3)$\\frac{1}{2}$或$-\\frac{19}{10}$",
    "q-s4-1-4-0045": "$65$",
    "q-s4-1-4-0046": "$6$",
    "q-s4-1-4-0047": "$40$",
    "q-s4-1-4-0048": "(1)(5)",
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
