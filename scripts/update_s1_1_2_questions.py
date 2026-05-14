from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s1-1-2" / "questions.json"


ANSWER_UPDATES = {
    "q-s1-1-2-0001": "選$(1)(3)(5)$",
    "q-s1-1-2-0002": "$a=4$或$0$，$b=-5$，$c=1$",
    "q-s1-1-2-0003": "$15$",
    "q-s1-1-2-0004": "$5$",
    "q-s1-1-2-0005": "$2$",
    "q-s1-1-2-0006": "$2x$",
    "q-s1-1-2-0007": "原始車資為$300$元",
    "q-s1-1-2-0008": "(1) $x=6$或$-6$；(2) $x\\ge 2$或$x\\le -2$；(3) $x>3$或$x<1$；(4) $0\\le x\\le 2$",
    "q-s1-1-2-0009": "$\\frac{2}{3} \\le x < \\frac{5}{3}$或$\\frac{11}{3} < x \\le \\frac{14}{3}$",
    "q-s1-1-2-0010": "$-8<x<-1$或$3<x<10$",
    "q-s1-1-2-0011": "(1) $x>2$或$x<0$；(2) $-3<x<7$；(3) $-5<x<-2$或$0<x<3$；(4) $1<x<\\frac{3}{2}$或$\\frac{5}{2}<x<3$；(5) $-2\\le x\\le 4$",
    "q-s1-1-2-0012": "$-\\frac{5}{2}\\le x\\le \\frac{1}{2}$",
    "q-s1-1-2-0013": "$x=0$或$2$",
    "q-s1-1-2-0014": "$x=-1$或$4$",
    "q-s1-1-2-0015": "$11$",
    "q-s1-1-2-0016": "$x=1$或$-1$",
    "q-s1-1-2-0017": "$x=-2$或$4$",
    "q-s1-1-2-0018": "最小值為$8$",
    "q-s1-1-2-0019": "$\\frac{2}{3} \\le x < \\frac{5}{3}$或$\\frac{11}{3} < x \\le \\frac{14}{3}$",
    "q-s1-1-2-0020": "$x<\\frac{4}{3}$或$x>2$",
    "q-s1-1-2-0021": "$-4\\le x\\le 0$",
    "q-s1-1-2-0022": "$8$",
    "q-s1-1-2-0023": "選$(1)(2)(3)$",
    "q-s1-1-2-0024": "$-1\\le x<0$或$2<x\\le 3$",
    "q-s1-1-2-0025": "$-\\frac{14}{3}\\le x<-\\frac{2}{3}$或$2<x\\le 6$",
    "q-s1-1-2-0026": "(1) $-4<x<-3$或$3<x<8$；(2) $-4<x<-1$或$3<x<6$",
    "q-s1-1-2-0027": "$-1\\le x\\le \\frac{5}{3}$",
    "q-s1-1-2-0028": "14個（選$(3)$）",
    "q-s1-1-2-0029": "選$(1)(2)(3)$",
    "q-s1-1-2-0030": "(1) $-5\\le x-y\\le -1$；(2) $-6\\le xy\\le 3$；(3) $-1\\le \\frac{x}{y}\\le \\frac{1}{2}$；(4) $-5\\le xy-3x-2y+1\\le -1$",
    "q-s1-1-2-0031": "$25$",
    "q-s1-1-2-0032": "(1) $-8\\le 2x-y<5$；(2) $-8\\le xy<12$；(3) $-2<\\frac{x}{y}<3$",
    "q-s1-1-2-0033": "$a=-\\frac{2}{3}$，$b=\\frac{7}{3}$",
    "q-s1-1-2-0034": "$(-1,3)$",
    "q-s1-1-2-0035": "$6$",
    "q-s1-1-2-0036": "$6$",
    "q-s1-1-2-0037": "(1) $9.8\\le x\\le 12$；(2) $2.2$公里",
    "q-s1-1-2-0038": "$-5\\le x\\le 9$",
    "q-s1-1-2-0039": "在$C$、$D$之間，最長$0.4$公里",
    "q-s1-1-2-0040": "$m=1$",
}


FIELD_UPDATES = {
    "q-s1-1-2-0003": {
        "question_text": (
            "已知$x, y$均為實數，且$-4 \\le x \\le 6$，$-3 \\le y \\le 2$，試求：\n"
            "$|2x + 9| - |x + 8| + |x + y - 10| + \\sqrt{(y + 4)^2}$的值。"
        ),
        "explanation_text": (
            "【解析】∵$-4 \\le x \\le 6$且$-3 \\le y \\le 2$，"
            "∴$2x + 9 > 0$、$x + 8 > 0$、$x + y - 10 < 0$，且$y + 4 > 0$。\n"
            "$$|2x + 9| - |x + 8| + |x + y - 10| + \\sqrt{(y + 4)^2}"
            "=(2x + 9) - (x + 8) - (x + y - 10) + (y + 4)=15$$"
        ),
    },
    "q-s1-1-2-0006": {
        "question_text": (
            "設$0 < x < 1$，試化簡"
            "$\\sqrt{x^{2} + \\frac{1}{x^{2}} + 2} - \\sqrt{x^{2} + \\frac{1}{x^{2}} - 2}$。"
        ),
        "explanation_text": (
            "【解析】∵$0 < x < 1$，∴$\\frac{1}{x} > 1 > x > 0$。\n"
            "$$\\sqrt{x^{2} + \\frac{1}{x^{2}} + 2} - \\sqrt{x^{2} + \\frac{1}{x^{2}} - 2}"
            "=\\sqrt{\\left(x + \\frac{1}{x}\\right)^{2}}-\\sqrt{\\left(x - \\frac{1}{x}\\right)^{2}}"
            "=\\left|x + \\frac{1}{x}\\right|-\\left|x - \\frac{1}{x}\\right|"
            "=\\left(x + \\frac{1}{x}\\right)-\\left(\\frac{1}{x}-x\\right)=2x$$"
        ),
    },
    "q-s1-1-2-0009": {
        "question_text": "解：$3 < |-3x + 8| \\le 6$。",
        "explanation_text": (
            "【解析】由$3 < |-3x + 8| \\le 6$，可先分成$|-3x + 8| > 3$與$|-3x + 8| \\le 6$。\n"
            "由$|-3x + 8| > 3$，得$-3x + 8 > 3$或$-3x + 8 < -3$，"
            "所以$x < \\frac{5}{3}$或$x > \\frac{11}{3}$。\n"
            "由$|-3x + 8| \\le 6$，得$-6 \\le -3x + 8 \\le 6$，"
            "所以$\\frac{2}{3} \\le x \\le \\frac{14}{3}$。\n"
            "[圖:program-db/assets/question-media/s1-1-2/image1.png]\n"
            "取兩者交集，得$\\frac{2}{3} \\le x < \\frac{5}{3}$或$\\frac{11}{3} < x \\le \\frac{14}{3}$。"
        ),
    },
    "q-s1-1-2-0019": {
        "question_text": "求不等式$3 < |-3x + 8| \\le 6$的實數解。",
        "explanation_text": (
            "【解析】由$3 < |-3x + 8| \\le 6$，可先分成$|-3x + 8| > 3$與$|-3x + 8| \\le 6$。\n"
            "由$|-3x + 8| > 3$，得$-3x + 8 > 3$或$-3x + 8 < -3$，"
            "所以$x < \\frac{5}{3}$或$x > \\frac{11}{3}$。\n"
            "由$|-3x + 8| \\le 6$，得$-6 \\le -3x + 8 \\le 6$，"
            "所以$\\frac{2}{3} \\le x \\le \\frac{14}{3}$。\n"
            "[圖:program-db/assets/question-media/s1-1-2/image1.png]\n"
            "取兩者交集，得$\\frac{2}{3} \\le x < \\frac{5}{3}$或$\\frac{11}{3} < x \\le \\frac{14}{3}$。"
        ),
    },
    "q-s1-1-2-0030": {
        "question_text": (
            "設$x, y \\in R$，$\\left|x + \\frac{1}{2}\\right| \\le \\frac{3}{2}$，"
            "$\\left|y - \\frac{5}{2}\\right| \\le \\frac{1}{2}$，求：\n"
            "(1) $x-y$ (2) $xy$ (3) $\\frac{x}{y}$ (4) $xy-3x-2y+1$之範圍。"
        ),
        "explanation_text": (
            "【解析】∵$\\left|x + \\frac{1}{2}\\right| \\le \\frac{3}{2}$且"
            "$\\left|y - \\frac{5}{2}\\right| \\le \\frac{1}{2}$，\n"
            "∴$-\\frac{3}{2} \\le x + \\frac{1}{2} \\le \\frac{3}{2}$且"
            "$-\\frac{1}{2} \\le y - \\frac{5}{2} \\le \\frac{1}{2}$，\n"
            "所以$-2 \\le x \\le 1$且$2 \\le y \\le 3$。\n"
            "(1) $-5 \\le x-y \\le -1$\n"
            "(2) $-6 \\le xy \\le 3$\n"
            "(3) $-1 \\le \\frac{x}{y} \\le \\frac{1}{2}$\n"
            "(4) $xy - 3x - 2y + 1 = (x - 2)(y - 3) - 5$\n"
            "∵$-2 \\le x \\le 1$且$2 \\le y \\le 3$，\n"
            "∴$-4 \\le x - 2 \\le -1$且$-1 \\le y - 3 \\le 0$，\n"
            "所以$0 \\le (x - 2)(y - 3) \\le 4$，\n"
            "故$-5 \\le xy - 3x - 2y + 1 \\le -1$。"
        ),
    },
    "q-s1-1-2-0032": {
        "question_text": (
            "設$x, y \\in R$，$-2 \\le x < 3$，$1 < y \\le 4$，"
            "求(1) $2x-y$的範圍。(2) $xy$的範圍。(3) $\\frac{x}{y}$的範圍。"
        ),
        "explanation_text": (
            "【解析】(1)\n"
            "[圖:program-db/assets/question-media/s1-1-2/image8.png]\n"
            "所以$-8 \\le 2x-y < 5$。\n"
            "(2)(i)\n"
            "[圖:program-db/assets/question-media/s1-1-2/image9.png]\n"
            "或(ii)\n"
            "[圖:program-db/assets/question-media/s1-1-2/image10.png]\n"
            "所以$-8 \\le xy < 12$。\n"
            "(3) $1 < y \\le 4$\n"
            "[圖:program-db/assets/question-media/s1-1-2/image11.png]\n"
            "仿(2)，得$-2 < \\frac{x}{y} < 3$。"
        ),
    },
}


def main() -> None:
    payload = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = payload.get("questions", [])
    if not isinstance(questions, list):
        raise ValueError("questions 欄位不是陣列")

    updated_answers = 0
    updated_fields = 0

    for row in questions:
        rid = str(row.get("id", "")).strip()
        if rid in ANSWER_UPDATES:
            row["answer_text"] = ANSWER_UPDATES[rid]
            updated_answers += 1
        if rid in FIELD_UPDATES:
            row.update(FIELD_UPDATES[rid])
            updated_fields += 1

    if updated_answers != len(ANSWER_UPDATES):
        raise ValueError(f"預期更新 {len(ANSWER_UPDATES)} 題答案，實際更新 {updated_answers} 題")
    if updated_fields != len(FIELD_UPDATES):
        raise ValueError(f"預期更新 {len(FIELD_UPDATES)} 題內容，實際更新 {updated_fields} 題")

    PACK_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
