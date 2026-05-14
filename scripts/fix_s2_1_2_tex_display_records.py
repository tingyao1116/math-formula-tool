import json
from pathlib import Path


DB_PATH = Path("program-db/database/question-db.json")


UPDATES = {
    "q-s2-1-2-0047": {
        "question_text": "且圓$S_1$與圓$S_2$外切，圓$S_2$與圓$S_3$外切，依此類推繼續作圓。 "
        "已知$\\angle AOB=60^\\circ$，且圓$S_1$的面積為$64\\pi$平方公分。 "
        "$(1)$求圓$S_2$的面積。 $(2)$試證$S_1$，$S_2$，$S_3$，$\\cdots$之面積所成數列是一等比數列。 "
        "$(3)$求前$6$個圓$S_1$，$S_2$，$\\cdots$，$S_6$的面積和。",
        "answer_text": "$(1)\\dfrac{64\\pi}{9}$；$(2)$為公比$\\dfrac{1}{9}$的等比數列；$(3)72\\pi\\left(1-\\dfrac{1}{9^6}\\right)$",
        "explanation_text": "【解析】已知圓$S_1$面積為$64\\pi$，所以半徑$r_1=8$。\n"
        "$(1)$ 設圓$S_2$半徑為$r_2$。由圖中的$30^\\circ$幾何關係可得$3r_2=r_1$，因此$r_2=\\dfrac{8}{3}$，"
        "故$S_2$面積為$\\pi\\left(\\dfrac{8}{3}\\right)^2=\\dfrac{64\\pi}{9}$。\n"
        "$(2)$ 同理可得$r_1,r_2,r_3,\\ldots$為公比$\\dfrac{1}{3}$的等比數列，所以面積$S_1,S_2,S_3,\\ldots$形成公比$\\dfrac{1}{9}$的等比數列。\n"
        "$(3)$ 前$6$個圓的面積和為$64\\pi\\cdot\\dfrac{1-\\left(\\dfrac{1}{9}\\right)^6}{1-\\dfrac{1}{9}}=72\\pi\\left(1-\\dfrac{1}{9^6}\\right)$。",
    },
    "q-s2-1-2-0048": {
        "question_text": "圓$C_{1}$內部有四個等圓$C_{2}$彼此外切，且均與圓$C_{1}$內切，圓$C_{2}$內部有四個等圓$C_{3}$彼此外切，且均與圓$C_{2}$內切，"
        "依此類推可作出$C_{4},C_{5},C_{6},\\dots$，若圓$C_{1}$之半徑為$2$，且圓$C_{k}$之面積為$a_{k}$，則 "
        "$(1)$ $C_{2}$的半徑為$2(\\sqrt{2}-1)$ "
        "$(2)$ $a_{2}=2a_{1}$ "
        "$(3)$ $a_{2}=4a_{1}$ "
        "$(4)$ $\\sum_{k=1}^{\\infty} a_{k}=(\\sqrt{2}+1)\\pi$ "
        "$(5)$ $\\sum_{k=1}^{\\infty} a_{k}=2(\\sqrt{2}+1)\\pi$。 "
        "[圖:program-db/assets/question-media/s2-1-2/image17.png] "
        "[圖:program-db/assets/question-media/s2-1-2/image18.png] "
        "[圖:program-db/assets/question-media/s2-1-2/image19.png]",
        "answer_text": "$(1)(5)$",
        "explanation_text": "【解析】圖中$EF=EA+AC+CF$ "
        "[圖:program-db/assets/question-media/s2-1-2/image20.png]\n"
        "故$4=\\sqrt{2}(2r_{2})+2r_{2}$，得$r_{2}=2(\\sqrt{2}-1)$。\n"
        "又$\\dfrac{a_{2}}{a_{1}}=\\left(\\dfrac{r_{2}}{r_{1}}\\right)^2=\\left(\\dfrac{2(\\sqrt{2}-1)}{2}\\right)^2=3-2\\sqrt{2}$，\n"
        "故$\\sum_{k=1}^{\\infty} a_{k}=\\dfrac{2^2\\pi}{1-(3-2\\sqrt{2})}=2(\\sqrt{2}+1)\\pi$。\n"
        "故選$(1)(5)$。",
    },
    "q-s2-1-2-0055": {
        "explanation_text": "【解析】\n"
        "$(1)$ ∵$a_{n+1}=a_n+(3n+1)$且$a_1=1$，\n"
        "∴$a_2=a_1+(3\\times 1+1)=1+4=5$，$a_3=a_2+(3\\times 2+1)=5+7=12$，"
        "$a_4=a_3+(3\\times 3+1)=12+10=22$，$a_5=a_4+(3\\times 4+1)=22+13=35$。\n"
        "$(2)$ 由遞迴式依次相減可得\n"
        "$$\\begin{aligned}\n"
        "a_2-a_1&=3\\times 1+1,\\\\\n"
        "a_3-a_2&=3\\times 2+1,\\\\\n"
        "&\\vdots\\\\\n"
        "a_n-a_{n-1}&=3(n-1)+1.\n"
        "\\end{aligned}$$\n"
        "以上各式相加，得\n"
        "$$a_n-a_1=3(1+2+\\cdots +(n-1))+(n-1).$$\n"
        "因$a_1=1$，故\n"
        "$$a_n=1+3\\cdot\\frac{(n-1)n}{2}+(n-1)=\\frac{3n^2-n}{2}.$$\n"
        "$(3)$ $a_{30}=\\dfrac{3\\times 30^2-30}{2}=1335$。",
    },
    "q-s2-1-2-0056": {
        "explanation_text": "【屏東女中期中考】 【解析】$a_1=1$，$a_{n+1}=a_n+(n+1)^2$。\n"
        "$(1)$ $a_2=1+2^2=5$，$a_3=5+3^2=14$。\n"
        "$(2)$ 由遞迴式可得\n"
        "$$\\begin{aligned}\n"
        "a_2-a_1&=2^2,\\\\\n"
        "a_3-a_2&=3^2,\\\\\n"
        "&\\vdots\\\\\n"
        "a_n-a_{n-1}&=n^2.\n"
        "\\end{aligned}$$\n"
        "以上各式相加，得\n"
        "$$a_n-a_1=2^2+3^2+\\cdots+n^2.$$\n"
        "因$a_1=1$，故\n"
        "$$a_n=1+2^2+3^2+\\cdots+n^2=\\frac{n(n+1)(2n+1)}{6}.$$\n",
    },
    "q-s2-1-2-0057": {
        "explanation_text": "【宜蘭高中期中考】 【解析】$a_1=1$，$2a_{n+1}=a_n+2$，故$a_{n+1}=\\dfrac{1}{2}a_n+1$。\n"
        "設$a_{n+1}-\\alpha=\\dfrac{1}{2}(a_n-\\alpha)$，則$\\alpha=2$。\n"
        "因此\n"
        "$$a_{n+1}-2=\\frac{1}{2}(a_n-2).$$\n"
        "依次可得\n"
        "$$\\begin{aligned}\n"
        "a_2-2&=\\frac{1}{2}(a_1-2),\\\\\n"
        "a_3-2&=\\frac{1}{2}(a_2-2),\\\\\n"
        "&\\vdots\\\\\n"
        "a_n-2&=\\frac{1}{2}(a_{n-1}-2).\n"
        "\\end{aligned}$$\n"
        "故$a_n-2=\\left(\\dfrac{1}{2}\\right)^{n-1}(a_1-2)=\\left(\\dfrac{1}{2}\\right)^{n-1}(-1)$，\n"
        "∴$a_n=2-\\left(\\dfrac{1}{2}\\right)^{n-1}$。",
    },
    "q-s2-1-2-0059": {
        "question_text": "已知數列$\\langle a_n \\rangle$，若$\\sum_{k=1}^{n} a_k=n^2+3n+1$則$a_n=\\underline{\\qquad}$。",
        "answer_text": "當$n=1$時，$a_n=5$；當$n\\ge 2$時，$a_n=2n+2$",
        "explanation_text": "【解析】由題意知$S_n=\\sum_{k=1}^n a_k=n^2+3n+1$。\n"
        "先得$a_1=S_1=5$。\n"
        "當$n\\ge 2$時，\n"
        "$$a_n=S_n-S_{n-1}=(n^2+3n+1)-\\left[(n-1)^2+3(n-1)+1\\right]=2n+2.$$\n"
        "因此\n"
        "$$a_n=\\begin{cases}\n"
        "5, & n=1,\\\\\n"
        "2n+2, & n\\ge 2.\n"
        "\\end{cases}$$",
    },
}


def main() -> None:
    data = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    questions = data["questions"]
    by_id = {row["id"]: row for row in questions}
    for qid, fields in UPDATES.items():
        if qid not in by_id:
            raise SystemExit(f"Missing id: {qid}")
        by_id[qid].update(fields)
    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8-sig")


if __name__ == "__main__":
    main()
