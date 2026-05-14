from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s1-1-4" / "questions.json"


ANSWER_UPDATES = {
    "q-s1-1-4-0001": "(1) $\\frac{1}{625}$；(2) $\\frac{1}{81}$；(3) $512$；(4) $1$",
    "q-s1-1-4-0002": "(1) $48$；(2) $\\frac{1}{4}$",
    "q-s1-1-4-0003": "(1) $1$；(2) $\\frac{1}{5}$",
    "q-s1-1-4-0004": "$3$",
    "q-s1-1-4-0005": "$k=-\\frac{31}{20}$",
    "q-s1-1-4-0006": "$ab$",
    "q-s1-1-4-0007": "(1) $a^{3}$；(2) $a$",
    "q-s1-1-4-0008": "選$(C)(D)$",
    "q-s1-1-4-0009": "選$(A)(E)$",
    "q-s1-1-4-0010": "選$(A)(B)(E)$",
    "q-s1-1-4-0011": "選$(1)(2)(4)$",
    "q-s1-1-4-0012": "(1) $3.095672$；(2) $0.773918$",
    "q-s1-1-4-0013": "$2.91$",
    "q-s1-1-4-0014": "(1) $\\sqrt{5}$；(2) $\\frac{5\\sqrt{5}}{8}$；(3) $\\frac{85}{2}$",
    "q-s1-1-4-0015": "(1) $7$；(2) $\\frac{1}{3}$",
    "q-s1-1-4-0016": "$3$",
    "q-s1-1-4-0017": "(1) $3$；(2) $\\frac{3\\pm\\sqrt{5}}{2}$",
    "q-s1-1-4-0018": "(1) $\\sqrt{2}+1$；(2) $5$",
    "q-s1-1-4-0019": "$3+\\sqrt{2}$",
    "q-s1-1-4-0020": "(1) $3$；(2) $\\frac{3\\pm\\sqrt{5}}{2}$",
    "q-s1-1-4-0021": "$17$",
    "q-s1-1-4-0022": "(1) $\\frac{97}{8}-\\frac{45}{4}\\sqrt{2}$；(2) $-\\frac{17}{4}$",
    "q-s1-1-4-0023": "$\\frac{2}{3}$",
    "q-s1-1-4-0024": "$\\frac{1}{6}$",
    "q-s1-1-4-0025": "$1$",
    "q-s1-1-4-0026": "$4$",
    "q-s1-1-4-0027": "$\\frac{8}{3}$",
    "q-s1-1-4-0028": "$63$（選$(2)$）",
    "q-s1-1-4-0029": "(1) $4$；(2) $5$日",
    "q-s1-1-4-0030": "(1) $16$倍；(2) $30$小時前",
    "q-s1-1-4-0031": "(1) $20k^{6}$平方公尺；(2) $640$平方公尺",
    "q-s1-1-4-0032": "$13$",
    "q-s1-1-4-0033": "(1) $500$；(2) 調整為$\\frac{a}{10}$公尺",
    "q-s1-1-4-0034": "$22.572$，最接近選$(4)$",
    "q-s1-1-4-0035": "(1) $50r^{12}$億人；(2) 約$72$億人",
    "q-s1-1-4-0036": "$\\sqrt{27}\\approx 5.2$，選$(3)$",
    "q-s1-1-4-0037": "$25$公絲",
    "q-s1-1-4-0038": "$3$年",
}


FIELD_UPDATES = {
    "q-s1-1-4-0022": {
        "explanation_text": (
            "【解析】(1)"
            "$f\\left(\\frac{3}{2}\\right)"
            "=\\left(4^{\\frac{3}{2}}+4^{-\\frac{3}{2}}\\right)-5\\left(2^{\\frac{3}{2}}+2^{-\\frac{3}{2}}\\right)+4"
            "=\\left(8+\\frac{1}{8}\\right)-5\\left(2\\sqrt{2}+\\frac{\\sqrt{2}}{4}\\right)+4"
            "=\\frac{97}{8}-\\frac{45}{4}\\sqrt{2}$。\n"
            "(2)令$t=2^{x}+2^{-x}$，則$t^{2}=4^{x}+4^{-x}+2$，所以$4^{x}+4^{-x}=t^{2}-2$。\n"
            "故$ f(x)=t^{2}-2-5t+4=\\left(t-\\frac{5}{2}\\right)^{2}-\\frac{17}{4}$。\n"
            "又$\\frac{2^{x}+2^{-x}}{2}\\ge \\sqrt{2^{x}\\cdot 2^{-x}}=1$，所以$t\\ge 2$。\n"
            "當$t=\\frac{5}{2}$時，$f(x)$有最小值$-\\frac{17}{4}$。"
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
