from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s1-1-5" / "questions.json"


ANSWER_UPDATES = {
    "q-s1-1-5-0001": "(1)① $\\log_{2}12$；② $243$；(2)① $0$；② $1$；③ $6$；④ $\\frac{1}{3}$",
    "q-s1-1-5-0002": "(1)① $\\log_{5}20$；② $a^{3}$；(2)① $25$；② $3$；③ $\\frac{1}{125}$；④ $\\frac{2}{3}$",
    "q-s1-1-5-0003": "(1) $-3$；(2) $\\frac{3}{2}$；(3) $0$；(4) $1$",
    "q-s1-1-5-0004": "(1) $\\frac{1}{9}$；(2) $5$；(3) $\\frac{1}{125}$；(4) $\\sqrt{3}$",
    "q-s1-1-5-0005": "$\\frac{28}{3}$",
    "q-s1-1-5-0006": "$\\frac{13}{2}$（選 $(3)$）",
    "q-s1-1-5-0007": "$1$",
    "q-s1-1-5-0008": "$-2$",
    "q-s1-1-5-0009": "$13$（選 $(2)$）",
    "q-s1-1-5-0010": "$45$",
    "q-s1-1-5-0011": "(1) $0.0036$；(2) $245$；(3) $0.00245$",
    "q-s1-1-5-0012": "$\\alpha\\beta=100$",
    "q-s1-1-5-0013": "$a=8$，$b=\\frac{1}{2}$",
    "q-s1-1-5-0014": "$-\\frac{5}{2}$",
    "q-s1-1-5-0015": "$\\frac{126}{25}$",
    "q-s1-1-5-0016": "$(B)(C)(D)(E)$",
    "q-s1-1-5-0017": "$8$ 倍（選 $(3)$）",
    "q-s1-1-5-0018": "$6.31$ 倍",
    "q-s1-1-5-0019": "約 $758$ 倍",
    "q-s1-1-5-0020": "約 $55$ 分貝（選 $(2)$）",
    "q-s1-1-5-0021": "約 $93$ 分貝",
    "q-s1-1-5-0022": "$(2)(5)$",
    "q-s1-1-5-0023": "$a=1.803$，$P=2.7045\\times 10^{7}$",
    "q-s1-1-5-0024": "至少 $31$ 年",
    "q-s1-1-5-0025": "至少 $51$ 折",
    "q-s1-1-5-0026": "$n=7$",
    "q-s1-1-5-0027": "至少 $4$ 天",
    "q-s1-1-5-0028": "$(3)(5)$",
    "q-s1-1-5-0029": "$(1)(3)(5)$",
    "q-s1-1-5-0030": "$(E)$",
    "q-s1-1-5-0031": "$a=10^{\\frac{5}{3}}$，$k=2$",
    "q-s1-1-5-0032": "$(A)(C)(E)$",
    "q-s1-1-5-0033": "$(2)(3)$",
    "q-s1-1-5-0034": "$10$",
    "q-s1-1-5-0035": "$a=8$",
    "q-s1-1-5-0036": "$39$ 位數",
    "q-s1-1-5-0037": "(1)① $8$；② $6$；(2)① $8$；② $4$；(3) $9$",
    "q-s1-1-5-0038": "小數點後第 $8$ 位開始不為 $0$",
    "q-s1-1-5-0039": "(1) $2^{106}>3^{66}$；(2) $33$ 位數",
    "q-s1-1-5-0040": "$22$ 位數",
    "q-s1-1-5-0041": "$71$",
    "q-s1-1-5-0042": "$25$",
    "q-s1-1-5-0043": "(1) $111000$；(2) $112200$",
    "q-s1-1-5-0044": "$(1)(2)$",
    "q-s1-1-5-0045": "$124800$",
    "q-s1-1-5-0046": "$16$ 年",
    "q-s1-1-5-0047": "$10^{4}$ 倍",
    "q-s1-1-5-0048": "$10^{5}$ 倍",
    "q-s1-1-5-0049": "$100$ 倍",
    "q-s1-1-5-0050": "$2$",
    "q-s1-1-5-0051": "至少 $5$ 年",
    "q-s1-1-5-0052": "(1) 約 $98.44\\%$；(2) 至少 $4$ 天",
}


def main() -> None:
    payload = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = payload.get("questions", [])
    if not isinstance(questions, list):
        raise ValueError("questions must be a list")

    updated_answers = 0
    for row in questions:
        rid = str(row.get("id", "")).strip()
        if rid in ANSWER_UPDATES:
            row["answer_text"] = ANSWER_UPDATES[rid]
            updated_answers += 1

    if updated_answers != len(ANSWER_UPDATES):
        raise ValueError(
            f"expected to update {len(ANSWER_UPDATES)} answers, updated {updated_answers}"
        )

    PACK_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
