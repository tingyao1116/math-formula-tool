from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s4-4-3/questions.json")


ANSWER_MAP = {
    "q-s4-4-3-0001": "(1)(3)",
    "q-s4-4-3-0002": "(1)約$109.5$萬人；(2)$2:3$",
    "q-s4-4-3-0003": "(1)(3)(4)",
    "q-s4-4-3-0004": "$40\\%$",
    "q-s4-4-3-0005": "(1)(3)",
    "q-s4-4-3-0006": "$60$位",
    "q-s4-4-3-0007": "(1)$66.5\\%$；(2)$\\frac{2}{3}$",
    "q-s4-4-3-0008": "甲報$57.5\\%$，乙報$42.5\\%$",
    "q-s4-4-3-0009": "(3)(4)",
    "q-s4-4-3-0010": "(1)(2)(5)",
    "q-s4-4-3-0011": "$\\frac{1}{10}$",
    "q-s4-4-3-0012": "(1)$\\frac{1}{12}$；(2)$\\frac{1}{9}$",
    "q-s4-4-3-0013": "(1)$\\begin{bmatrix}\\frac{2}{3}&\\frac{1}{3}&0\\\\\\frac{1}{3}&\\frac{1}{2}&\\frac{2}{3}\\\\0&\\frac{1}{6}&\\frac{1}{3}\\end{bmatrix}$；(2)$\\frac{1}{2}$；(3)$\\frac{4}{9}$",
    "q-s4-4-3-0014": "(1)$\\frac{1}{12}$；(2)$\\frac{1}{10}$",
    "q-s4-4-3-0015": "(1)$\\begin{bmatrix}0&\\frac{1}{4}&0\\\\1&\\frac{1}{2}&1\\\\0&\\frac{1}{4}&0\\end{bmatrix}$；(2)$\\frac{11}{16}$",
    "q-s4-4-3-0016": "(1)$35\\%$；(2)約$24.1\\%$",
    "q-s4-4-3-0017": "(1)(2)(3)(4)(5)",
    "q-s4-4-3-0018": "(1)$\\begin{bmatrix}0.8&0.2&0.1\\\\0.1&0.7&0.3\\\\0.1&0.1&0.6\\end{bmatrix}$；(2)$\\frac{7}{20}$",
    "q-s4-4-3-0019": "(1)$\\begin{bmatrix}0.8&0.3&0.2\\\\0.1&0.5&0.2\\\\0.1&0.2&0.6\\end{bmatrix}$；(2)$\\frac{9}{20}$",
    "q-s4-4-3-0020": "(1)$34.1\\%$；(2)$\\frac{13}{19}$",
    "q-s4-4-3-0021": "(1)(3)(4)(5)",
    "q-s4-4-3-0022": "(1)七月三日：甲$\\frac{1}{4}$，乙$\\frac{33}{100}$，丙$\\frac{21}{50}$；(2)七月四日：甲$\\frac{26}{125}$，乙$\\frac{63}{200}$，丙$\\frac{477}{1000}$；(3)甲$\\frac{2}{11}$，乙$\\frac{3}{11}$，丙$\\frac{6}{11}$",
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
