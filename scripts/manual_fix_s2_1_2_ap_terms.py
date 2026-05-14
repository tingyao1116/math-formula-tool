from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-1-2/questions.json")


OVERRIDES: dict[str, dict[str, str]] = {
    "q-s2-1-2-0001": {
        "title": "範例1：51 項等差數列判斷",
        "explanation_text": "【南港高中期中考】 【解析】設公差為$d$。由$a_1+a_2+\\cdots+a_{51}=0$，可得$(a_1+a_{51})+(a_2+a_{50})+\\cdots+(a_{25}+a_{27})+a_{26}=0$，即$25\\cdot 2a_{26}+a_{26}=0$，所以$51a_{26}=0$，故$a_{26}=0$。又$a_{26}=a_1+25d=0$，$a_{31}=a_1+30d=31$，聯立解得$d=\\frac{31}{5}$，$a_1=-155$。因此$a_1+a_{51}=a_2+a_{50}=a_3+a_{49}=2a_{26}=0$，且$a_{21}=a_1+20d=-155+20\\cdot\\frac{31}{5}=-31$。故正確選項為$(1)(4)$。",
    },
    "q-s2-1-2-0004": {
        "title": "範例3：51 項等差數列正數判斷",
        "explanation_text": "【解析】前$51$項和為$S=\\frac{51(a_1+a_{51})}{2}>0$，故$a_1+a_{51}>0$。又$a_{11}+a_{41}=a_1+a_{51}>0$。已知$a_{41}<0$，因此$a_{11}>0$，可知公差$d<0$，所以$a_{10}>a_{11}>0$。另外$a_{26}=a_1+25d=\\frac{a_1+a_{51}}{2}>0$。故為正數者是$(1)(2)(3)(4)$。",
    },
    "q-s2-1-2-0016": {
        "title": "隨堂練習：51 項等差數列判斷",
        "question_text": "有一個$51$項的等差數列$a_{1},a_{2},a_{3},\\ldots,a_{51}$，其和為$0$，且$a_{31}=31$，則下列選項中哪些正確？ $(1)$ $a_{1}+a_{51}=0$ $(2)$ $a_{2}+a_{50}<0$ $(3)$ $a_{3}+a_{49}>0$ $(4)$ $a_{1}<0$ $(5)$ $a_{21}=21$。",
        "explanation_text": "【南港高中期中考】 【解析】設公差為$d$。由$a_1+a_2+\\cdots+a_{51}=0$，可得$(a_1+a_{51})+(a_2+a_{50})+\\cdots+(a_{25}+a_{27})+a_{26}=0$，即$25\\cdot 2a_{26}+a_{26}=0$，所以$51a_{26}=0$，故$a_{26}=0$。又$a_{26}=a_1+25d=0$，$a_{31}=a_1+30d=31$，聯立解得$d=\\frac{31}{5}$，$a_1=-155$。因此$a_1+a_{51}=a_2+a_{50}=a_3+a_{49}=2a_{26}=0$，且$a_{21}=a_1+20d=-155+20\\cdot\\frac{31}{5}=-31$。故正確選項為$(1)(4)$。",
    },
}


def main() -> None:
    data = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = data["questions"]
    by_id = {q["id"]: q for q in questions}

    for qid, fields in OVERRIDES.items():
        question = by_id[qid]
        for field, value in fields.items():
            question[field] = value

    PACK_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
