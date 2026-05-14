from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s4-4-2/questions.json")


ANSWER_MAP = {
    "q-s4-4-2-0001": "(1)$A=\\begin{bmatrix}1&3&3\\\\-2&1&3\\\\-2&-2&1\\end{bmatrix}$；(2)$6$",
    "q-s4-4-2-0002": "$2^{99}$",
    "q-s4-4-2-0003": "(1)$a_{1j}=\\frac{j(j+1)}{2}$；(2)$a_{i1}=\\frac{i(i-1)}{2}+1$；(3)$a_{10,j}=\\frac{j^2+19j+72}{2}$；(4)$25$在$(4,4)$，$75$在$(4,9)$",
    "q-s4-4-2-0004": "$x=1$，$y=2$，$u=3$，$v=4$",
    "q-s4-4-2-0005": "$x=4$，$y=-2$，$a=-3$，$b=1$",
    "q-s4-4-2-0006": "(1)",
    "q-s4-4-2-0007": "(1)",
    "q-s4-4-2-0008": "$-3$",
    "q-s4-4-2-0009": "(1)$\\begin{bmatrix}-2&4&5\\\\6&10&3\\end{bmatrix}$；(2)$\\begin{bmatrix}5&-1\\\\-9&-1\\\\0&-8\\end{bmatrix}$",
    "q-s4-4-2-0010": "$\\begin{bmatrix}2&4&-9\\\\-3&-4&-6\\\\-6&-3&6\\end{bmatrix}$",
    "q-s4-4-2-0011": "(3)",
    "q-s4-4-2-0012": "(2)(3)",
    "q-s4-4-2-0013": "$\\begin{bmatrix}-2&1&4\\\\-7&-4&-1\\\\-12&-9&-6\\end{bmatrix}$",
    "q-s4-4-2-0014": "$X=\\begin{bmatrix}7&-3&0\\\\0&-11&-4\\end{bmatrix}$",
    "q-s4-4-2-0015": "$X=\\begin{bmatrix}10&14\\\\18&22\\end{bmatrix}$，$Y=\\begin{bmatrix}7&10\\\\13&16\\end{bmatrix}$",
    "q-s4-4-2-0016": "$\\begin{bmatrix}-\\frac{16}{9}&-\\frac{2}{9}\\\\\\frac{17}{9}&-\\frac{11}{9}\\end{bmatrix}$",
    "q-s4-4-2-0017": "$X=\\begin{bmatrix}1&-2\\\\-1&1\\end{bmatrix}$，$Y=\\begin{bmatrix}0&4\\\\1&2\\end{bmatrix}$",
    "q-s4-4-2-0018": "$A=\\begin{bmatrix}3&-3&4\\\\4&-5&6\\end{bmatrix}$，$B=\\begin{bmatrix}-1&3&-3\\\\-3&3&-1\\end{bmatrix}$",
    "q-s4-4-2-0019": "$X=\\begin{bmatrix}1&-1&-3\\\\6&11&6\\end{bmatrix}$，$Y=\\begin{bmatrix}0&3&3\\\\-2&-5&-1\\end{bmatrix}$",
    "q-s4-4-2-0020": "(1)$\\begin{bmatrix}0&1&-2\\\\-5&4&-3\\\\13&-12&11\\end{bmatrix}$；(2)$\\begin{bmatrix}7&-16&25\\\\-18&27&-36\\\\23&-32&41\\end{bmatrix}$",
    "q-s4-4-2-0021": "(2)(5)",
    "q-s4-4-2-0022": "(E)",
    "q-s4-4-2-0023": "(1)$\\begin{bmatrix}1\\\\-9\\end{bmatrix}$；(2)$\\begin{bmatrix}-12&23\\end{bmatrix}$",
    "q-s4-4-2-0024": "$AB=\\begin{bmatrix}20&7\\\\8&5\\end{bmatrix}$，$A(B+C)=\\begin{bmatrix}27&19\\\\9&13\\end{bmatrix}$",
    "q-s4-4-2-0025": "$\\frac{2\\pi}{3}$",
    "q-s4-4-2-0026": "$0$，$\\frac{\\pi}{6}$，$\\frac{\\pi}{3}$，$\\frac{\\pi}{2}$",
    "q-s4-4-2-0027": "$24$",
    "q-s4-4-2-0028": "(1)$2$；(2)$A^{77}=\\begin{bmatrix}-2&-3\\\\1&1\\end{bmatrix}$",
    "q-s4-4-2-0029": "(1)$\\begin{bmatrix}\\frac{\\sqrt3}{2}&-\\frac12\\\\\\frac12&\\frac{\\sqrt3}{2}\\end{bmatrix}$；(2)$\\begin{bmatrix}-16&-16\\\\16&-16\\end{bmatrix}$",
    "q-s4-4-2-0030": "$\\frac{2\\pi}{3}$",
    "q-s4-4-2-0031": "$\\frac{2\\pi}{5}$或$\\frac{4\\pi}{5}$",
    "q-s4-4-2-0032": "$\\begin{bmatrix}12&27&30\\\\16&29&31\\end{bmatrix}$",
    "q-s4-4-2-0033": "(1)$\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}$；(2)$\\begin{bmatrix}-3&-4\\\\-6&-8\\end{bmatrix}$",
    "q-s4-4-2-0034": "(1)見詳解；(2)$\\begin{bmatrix}91&3\\\\4&92\\end{bmatrix}$",
    "q-s4-4-2-0035": "(5)",
    "q-s4-4-2-0036": "(1)(2)(3)",
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
