from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s1-1-3" / "questions.json"


ANSWER_UPDATES = {
    "q-s1-1-3-0001": "(1) $4a^{2}-12a+9$；(2) $a^{2}+9b^{2}+4c^{2}-6ab-12bc+4ac$；(3) $1+27x^{3}$",
    "q-s1-1-3-0002": "(1) $16a^{4}-72a^{2}+81$；(2) $a^{4}+a^{2}+1$；(3) $x^{4}-16$",
    "q-s1-1-3-0003": "(1) $9a^{2}+12ab+4b^{2}$；(2) $a^{2}+b^{2}+c^{2}-2ab-2bc+2ac$；(3) $8a^{3}-b^{3}$；(4) $a^{3}+9a^{2}b+27ab^{2}+27b^{3}$",
    "q-s1-1-3-0004": "選$(3)$",
    "q-s1-1-3-0005": "(1) $7$；(2) $18$",
    "q-s1-1-3-0006": "(1) $2\\sqrt{5}$；(2) $18$；(3) $34\\sqrt{5}$",
    "q-s1-1-3-0007": "(1) $(x+y)(x-y)(x^{2}-xy+y^{2})(x^{2}+xy+y^{2})$；(2) $(3x^{2}-x+1)(3x^{2}+x+1)$",
    "q-s1-1-3-0008": "(1) $(x+2)(x^{2}-2x+4)$；(2) $(x-3)(x+3)(x^{2}+9)$；(3) $(a^{2}-a+1)(a^{2}+a+1)$",
    "q-s1-1-3-0009": "(1) $(2a+3b)(4a^{2}-6ab+9b^{2})$；(2) $(x^{2}+2xy+4y^{2})(x^{2}-2xy+4y^{2})$；(3) $(2a^{2}-a+2)(2a^{2}+a+2)$",
    "q-s1-1-3-0010": "(1) $(x^{2}+x+1)(x^{2}-x+1)(x^{4}-x^{2}+1)$；(2) $(xy+x+y-1)(xy-x-y-1)$",
    "q-s1-1-3-0011": "選$(3)$",
    "q-s1-1-3-0012": "$5$",
    "q-s1-1-3-0013": "(1) $4$；(2) $14$",
    "q-s1-1-3-0014": "(1) $2$；(2) $\\frac{5(x-2)}{3(x+5)(x-5)}$",
    "q-s1-1-3-0015": "(1) $\\frac{12x}{(x-3)(x+3)}$；(2) $x^{2}$",
    "q-s1-1-3-0016": "$\\frac{8}{(x^{4}-1)(x^{4}+1)}$",
    "q-s1-1-3-0017": "(1) $\\frac{13}{36}\\sqrt{3}$；(2) $-\\sqrt{6}-3\\sqrt{2}$；(3) $4-\\sqrt{15}$；(4) $20-\\frac{40}{3}\\sqrt{2}$",
    "q-s1-1-3-0018": "$(x,y)=(1,-1)$",
    "q-s1-1-3-0019": "$18$",
    "q-s1-1-3-0020": "(1) $\\frac{13}{36}\\sqrt{3}$；(2) $4-\\sqrt{15}$；(3) $-\\sqrt{7}+3\\sqrt{5}$；(4) $\\frac{113}{154}\\sqrt{77}+\\frac{9}{2}$",
    "q-s1-1-3-0021": "在$3$與$4$之間（選$(4)$）",
    "q-s1-1-3-0022": "$\\sqrt{73-\\sqrt{37}}$介在$8$與$9$之間",
    "q-s1-1-3-0023": "(1) $\\sqrt{3}-1$；(2) $3\\sqrt{2}+1$",
    "q-s1-1-3-0024": "(1) $3+2\\sqrt{2}$；(2) $\\sqrt{3}-\\sqrt{2}$",
    "q-s1-1-3-0025": "$4$",
    "q-s1-1-3-0026": "$-3$",
    "q-s1-1-3-0027": "$2$",
    "q-s1-1-3-0028": "$8$",
    "q-s1-1-3-0029": "$6$",
    "q-s1-1-3-0030": "$b<a<c$",
    "q-s1-1-3-0031": "$c>b>a$",
    "q-s1-1-3-0032": "$1.414$",
    "q-s1-1-3-0033": "$3+\\sqrt{11}$",
    "q-s1-1-3-0034": "$\\frac{-1+\\sqrt{5}}{2}$",
    "q-s1-1-3-0035": "(1) 成立；(2) 最大值為$8$，此時$a=4$，$b=2$；(3) 最小值為$\\frac{12}{5}$，此時$a=\\frac{10}{3}$，$b=\\frac{15}{2}$",
    "q-s1-1-3-0036": "最大值為$\\frac{25}{6}$，此時$a=\\frac{5}{2}$，$b=\\frac{5}{3}$",
    "q-s1-1-3-0037": "最小值為$\\frac{4}{3}$，此時$a=\\frac{3}{2}$，$b=6$",
    "q-s1-1-3-0038": "(1) 最大值為$\\frac{3}{2}$；(2) 最小值為$12$",
    "q-s1-1-3-0039": "(1) 最大值為$8$；(2) $(a,b)=(4,2)$",
    "q-s1-1-3-0040": "(1) 最大值為$625$，此時$a=b=25$；(2) 最大值為$18$，此時$a=6$，$b=3$",
    "q-s1-1-3-0041": "$450$平方公尺",
    "q-s1-1-3-0042": "$289$平方公尺",
    "q-s1-1-3-0043": "(1) $50$平方公尺；(2) $16$平方公尺",
}


FIELD_UPDATES = {
    "q-s1-1-3-0022": {
        "explanation_text": (
            "【解析】因為$6^{2}<37<7^{2}$，所以$6<\\sqrt{37}<7$，"
            "則$73-7<73-\\sqrt{37}<73-6$，即$66<73-\\sqrt{37}<67$。\n"
            "因此$\\sqrt{66}<\\sqrt{73-\\sqrt{37}}<\\sqrt{67}$，又$8<\\sqrt{66}$且$\\sqrt{67}<9$，"
            "所以$8<\\sqrt{73-\\sqrt{37}}<9$，故$\\sqrt{73-\\sqrt{37}}$介在$8$與$9$之間。"
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
