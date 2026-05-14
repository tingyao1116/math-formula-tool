from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s1-1-7" / "questions.json"


ANSWER_UPDATES = {
    "q-s1-2-2-0001": "(1) 圓心 $(-5,3)$，半徑 $4$；(2) 圓心 $\\left(\\frac{3}{2},-\\frac{1}{2}\\right)$，半徑 $\\sqrt{5}$",
    "q-s1-2-2-0002": "圓心 $(3,-1)$，半徑 $4$",
    "q-s1-2-2-0003": "(1) $(x+3)^{2}+(y-2)^{2}=36$；(2) $(x-1)^{2}+(y+3)^{2}=25$",
    "q-s1-2-2-0004": "$(x+3)^{2}+(y-2)^{2}=5$",
    "q-s1-2-2-0005": "$(x-2)^{2}+(y-1)^{2}=8$",
    "q-s1-2-2-0006": "(1) 圓心 $(1,3)$，半徑 $3$；(2) 一點 $(3,-1)$；(3) 無圖形",
    "q-s1-2-2-0007": "(1) 圓心 $(7,-4)$，半徑 $12$ 的圓；(2) 一點 $(7,-4)$；(3) 無圖形",
    "q-s1-2-2-0008": "$(B)(C)(D)(E)$",
    "q-s1-2-2-0009": "$(-1,8\\pi)$",
    "q-s1-2-2-0010": "$k<\\frac{89}{4}$；相切時 $k=16$",
    "q-s1-2-2-0011": "$k<4$ 時為圓，圓心 $(-1,2)$，半徑 $\\sqrt{8-2k}$；$k=4$ 時為一點 $(-1,2)$；$k>4$ 時無圖形",
    "q-s1-2-2-0012": "(1) $k>2$ 或 $k<-1$；(2) $k=2$ 或 $k=-1$",
    "q-s1-2-2-0013": "(1) $-1<m<11$；(2) $m=5$，最大半徑 $6$",
    "q-s1-2-2-0014": "$(3)(5)$",
    "q-s1-2-2-0015": "$(D)(E)$",
    "q-s1-2-2-0016": "$(B)(C)$",
    "q-s1-2-2-0017": "$(A)(D)(E)$",
    "q-s1-2-2-0018": "$(2)$",
    "q-s1-2-2-0019": "$x^{2}+y^{2}-4x-12y+15=0$",
    "q-s1-2-2-0020": "$x^{2}+y^{2}-10x-4y+4=0$；面積 $25\\pi$",
    "q-s1-2-2-0021": "$k=1$",
    "q-s1-2-2-0022": "$-18$",
    "q-s1-2-2-0023": "$x^{2}+y^{2}-4x+12y+15=0$",
    "q-s1-2-2-0024": "$(1)(2)(4)(5)$",
    "q-s1-2-2-0025": "$(x-3)^{2}+(y+3)^{2}=10$",
    "q-s1-2-2-0026": "$(x-4)^{2}+(y-1)^{2}=5$",
    "q-s1-2-2-0027": "$(x+1)^{2}+(y-1)^{2}=5$",
    "q-s1-2-2-0028": "$(x-5)^{2}+(y-5)^{2}=50$",
    "q-s1-2-2-0029": "$(x-2)^{2}+(y-2)^{2}=4$ 或 $(x+1)^{2}+(y-1)^{2}=1$",
    "q-s1-2-2-0030": "$(x-1)^{2}+(y-1)^{2}=1$ 或 $(x-5)^{2}+(y-5)^{2}=25$",
    "q-s1-2-2-0031": "$\\left(6-2\\sqrt{5},-6+2\\sqrt{5}\\right)$",
    "q-s1-2-2-0032": "$(x-4)^{2}+(y-1)^{2}=10$ 或 $(x-2)^{2}+(y+1)^{2}=10$",
    "q-s1-2-2-0033": "$(x-3)^{2}+y^{2}=1$",
    "q-s1-2-2-0034": "$x^{2}+y^{2}+x+3y=0$",
    "q-s1-2-2-0035": "$(3,-4)$ 與 $(5,0)$",
    "q-s1-2-2-0036": "$x^{2}+y^{2}+7y+2=0$",
    "q-s1-2-2-0037": "$\\left(x-\\frac{5}{3}\\right)^{2}+\\left(y+\\frac{1}{3}\\right)^{2}=\\frac{4}{9}$",
    "q-s1-2-2-0038": "$1.35$ 公尺",
    "q-s1-2-2-0039": "$2.70$ 公尺",
    "q-s1-2-2-0040": "$8$ 公尺",
    "q-s1-2-2-0041": "$5x^{2}+5y^{2}-134x-58y-158=0$",
    "q-s1-2-2-0042": "$(14,-36,91)$",
    "q-s1-2-2-0043": "圖略；面積 $16\\left(\\frac{5\\pi}{3}+\\sqrt{3}+1\\right)$",
    "q-s1-2-2-0044": "圖形為 $4$ 個半圓及原點；面積 $50\\pi+96$",
    "q-s1-2-2-0045": "$\\pi+2$",
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
