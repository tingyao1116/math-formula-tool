from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s4-4-4/questions.json")


ANSWER_MAP = {
    "q-s4-4-4-0001": "$\\begin{bmatrix}9&7\\\\7&6\\end{bmatrix}$",
    "q-s4-4-4-0002": "$\\begin{bmatrix}\\frac{1}{3}&\\frac{5}{3}\\\\0&1\\end{bmatrix}$",
    "q-s4-4-4-0003": "$\\begin{bmatrix}-2&-7\\\\-13&-20\\end{bmatrix}$",
    "q-s4-4-4-0004": "$\\sqrt{82}$",
    "q-s4-4-4-0005": "$P'(5,11)$；$P_0(11,-3)$",
    "q-s4-4-4-0006": "(1)$\\begin{bmatrix}3&5\\\\4&6\\end{bmatrix}$；(2)$\\begin{bmatrix}-1&3\\\\2&-4\\end{bmatrix}$",
    "q-s4-4-4-0007": "$c=-1$，$d=-8$",
    "q-s4-4-4-0008": "$a=0$，$b=0$",
    "q-s4-4-4-0009": "$a=2$，$b=-3$",
    "q-s4-4-4-0010": "$x-4y+28=0$",
    "q-s4-4-4-0011": "$a=2$，$b=0$",
    "q-s4-4-4-0012": "$(a,b)=(-3,2)$",
    "q-s4-4-4-0013": "$a=3$，$b=4$",
    "q-s4-4-4-0014": "(1)$y=5$；(2)$53x^2-46xy+10y^2=25$",
    "q-s4-4-4-0015": "$x=4$",
    "q-s4-4-4-0016": "$a=1$，$b=-4$",
    "q-s4-4-4-0017": "$x^2-y^2=1$",
    "q-s4-4-4-0018": "$3x-7y+15=0$",
    "q-s4-4-4-0019": "$(1)(3)$",
    "q-s4-4-4-0020": "$\\begin{bmatrix}0&-32\\\\32&0\\end{bmatrix}$",
    "q-s4-4-4-0021": "(1)$12$；(2)$\\begin{bmatrix}\\frac{\\sqrt3}{2}&\\frac12\\\\-\\frac12&\\frac{\\sqrt3}{2}\\end{bmatrix}$",
    "q-s4-4-4-0022": "$0$，$\\frac{\\pi}{6}$，$\\frac{\\pi}{3}$，$\\frac{\\pi}{2}$",
    "q-s4-4-4-0023": "(5)",
    "q-s4-4-4-0024": "(1)$4$；(2)$\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}$",
    "q-s4-4-4-0025": "$(1)(3)(5)$",
    "q-s4-4-4-0026": "(1)$Q(4,4)$；(2)$R(2\\sqrt3-2,2+2\\sqrt3)$",
    "q-s4-4-4-0027": "(1)$B(2-\\sqrt3,1+2\\sqrt3)$；(2)$C(-4,8)$",
    "q-s4-4-4-0028": "(1)$B(2-\\sqrt3,1+2\\sqrt3)$；(2)$C(-4,8)$",
    "q-s4-4-4-0029": "$B\\left(-\\frac{\\sqrt2}{2},\\frac{7\\sqrt2}{2}\\right)$；$H\\left(\\frac{7\\sqrt2}{2},\\frac{\\sqrt2}{2}\\right)$",
    "q-s4-4-4-0030": "$x+2y=0$",
    "q-s4-4-4-0031": "$(1+\\sqrt3)x+(\\sqrt3-1)y=0$",
    "q-s4-4-4-0032": "$x+\\sqrt3y=4$",
    "q-s4-4-4-0033": "$(x-\\sqrt3)^2+(y+1)^2=4$",
    "q-s4-4-4-0034": "$\\left(\\frac{8}{5},\\frac{19}{5}\\right)$",
    "q-s4-4-4-0035": "(2)",
    "q-s4-4-4-0036": "(4)",
    "q-s4-4-4-0037": "$55^\\circ$",
    "q-s4-4-4-0038": "(1)(2)(3)(4)",
    "q-s4-4-4-0039": "(1)$B(5,3)$；(2)$A'(-1,4)$",
    "q-s4-4-4-0040": "$x'=\\frac{24}{25}x+\\frac{7}{25}y$，$y'=-\\frac{7}{25}x+\\frac{24}{25}y$",
    "q-s4-4-4-0041": "(1)$(3+\\sqrt3)x+(1-3\\sqrt3)y+5=0$；(2)$(1-3\\sqrt3)x+(3+\\sqrt3)y+5=0$",
    "q-s4-4-4-0042": "(1)$(-3+5\\sqrt3)x-(3\\sqrt3+5)y+8=0$；(2)$29x-3y-20=0$",
    "q-s4-4-4-0043": "$(x-2)^2+y^2=9$",
    "q-s4-4-4-0044": "(1)$A^2=I$，$A^3=A$，$A^4=I$；(2)$50(A+I)=50\\begin{bmatrix}1+\\cos\\theta&\\sin\\theta\\\\\\sin\\theta&1-\\cos\\theta\\end{bmatrix}$",
    "q-s4-4-4-0045": "(1)$A(0,5)$；(2)$x^2+(y-5)^2=9$",
    "q-s4-4-4-0046": "(1)$y^2=4x$；(2)$y^2=-4x$；(3)$x^2=4y$",
    "q-s4-4-4-0047": "$x-2=(y+1)^2$",
    "q-s4-4-4-0048": "$A\\left(3,\\frac{3}{2}\\right)$；$B(-6,2)$",
    "q-s4-4-4-0049": "(1)$P'(6,2)$；(2)$Q(3,3)$",
    "q-s4-4-4-0050": "(1)$x+3y=9$；(2)$\\frac{x^2}{36}+\\frac{y^2}{16}=1$",
    "q-s4-4-4-0051": "$x^2+y^2=225$",
    "q-s4-4-4-0052": "(1)$\\frac{x^2}{4}+y^2=1$；(2)$2\\pi$",
    "q-s4-4-4-0053": "$y^2=36x$",
    "q-s4-4-4-0054": "$(3,0)$",
    "q-s4-4-4-0055": "$4x-5y-5=0$",
    "q-s4-4-4-0056": "$2$",
    "q-s4-4-4-0057": "(1)$(5,1)$；(2)$2x-3y=5$；(3)$x^2-4xy+5y^2=1$",
    "q-s4-4-4-0058": "(1)$x+y=4$；(2)$x^2-4xy+5y^2=16$",
    "q-s4-4-4-0059": "$x^2+4xy+5y^2=25$",
    "q-s4-4-4-0060": "(2)",
    "q-s4-4-4-0061": "(1)$(-5\\sqrt2,\\sqrt2)$；(2)$(3,2)$；(3)$(2+3\\sqrt3,3-2\\sqrt3)$；(4)$(6,22)$",
    "q-s4-4-4-0062": "(1)$(-5,1)$；(2)$\\left(-\\frac{\\sqrt2}{2},\\frac{7\\sqrt2}{2}\\right)$；(3)$\\left(-\\frac{24}{5},\\frac{7}{5}\\right)$；(4)$(-8,6)$；(5)$\\left(-4,\\frac{13}{3}\\right)$",
    "q-s4-4-4-0063": "$(1)(3)(4)(5)$",
    "q-s4-4-4-0064": "$(2)(3)(4)(5)$",
    "q-s4-4-4-0065": "(1)$(4\\sqrt3-3)x-(3\\sqrt3+4)y-10=0$；(2)$24x-7y+25=0$；(3)$5x+11y+35=0$",
    "q-s4-4-4-0066": "$(1)(2)(3)(4)$",
    "q-s4-4-4-0067": "(1)C；(2)B；(3)E；(4)G；(5)J",
    "q-s4-4-4-0068": "$A^{-1}=\\begin{bmatrix}\\cos\\theta&\\sin\\theta\\\\-\\sin\\theta&\\cos\\theta\\end{bmatrix}$；$B^{-1}=\\begin{bmatrix}\\cos\\theta&\\sin\\theta\\\\\\sin\\theta&-\\cos\\theta\\end{bmatrix}$",
    "q-s4-4-4-0069": "轉換矩陣$\\begin{bmatrix}2&-1\\\\1&1\\end{bmatrix}$；秘密基地座標$\\left(\\frac{7}{3},-\\frac{1}{3}\\right)$",
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
