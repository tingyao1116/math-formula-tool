from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"C:\codex資料夾\數學公式使用工具\program-db\imports\packs\s3-2-2\questions.json")

UPDATES = {
    "q-s3-2-2-0001": "(A)(E)",
    "q-s3-2-2-0002": "(A)(B)(C)(D)",
    "q-s3-2-2-0003": "(B)(D)",
    "q-s3-2-2-0004": "(2)(3)",
    "q-s3-2-2-0005": "(3)(5)",
    "q-s3-2-2-0006": "(1)(2)(3)(4)(5)",
    "q-s3-2-2-0007": r"(1)$-3$; (2)$\frac{3}{2}$; (3)$0$; (4)$1$",
    "q-s3-2-2-0008": r"(1)$5$; (2)$\frac{4}{3}$; (3)$-\frac{2}{3}$; (4)$-1$; (5)$-\frac{1}{2}$",
    "q-s3-2-2-0009": r"(1)$\frac{1}{9}$; (2)$5$; (3)$\frac{1}{125}$; (4)$\sqrt{3}$",
    "q-s3-2-2-0010": r"(1)$1$; (2)$2$; (3)$0$",
    "q-s3-2-2-0011": r"$\frac{49}{12}$",
    "q-s3-2-2-0012": r"$-\frac{1}{2}$",
    "q-s3-2-2-0013": r"$\frac{127}{2}$",
    "q-s3-2-2-0014": r"(1)$2$; (2)$5$; (3)$-\frac{25}{8}$; (4)$3$; (5)$\frac{1}{2}$; (6)$1$; (7)$5$",
    "q-s3-2-2-0015": r"(1)$2$; (2)$2$; (3)$\frac{25}{2}$; (4)$-1$; (5)$3$; (6)$-\frac{1}{4}$",
    "q-s3-2-2-0016": r"(1)$\frac{3a+b}{a+b}$; (2)$\frac{3b^2+2a^2}{6ab}$; (3)$\frac{2}{b-2a}$",
    "q-s3-2-2-0017": r"(1)$\frac{1}{xy}$; (2)$\frac{2x+xy}{2+xy}$",
    "q-s3-2-2-0018": r"$\frac{3+ab-2a}{1+a+ab}$",
    "q-s3-2-2-0019": r"$\frac{1+a+ab}{2+ab}$",
    "q-s3-2-2-0020": r"$\frac{3+ab}{1+a+ab}$",
    "q-s3-2-2-0021": r"$\log_{3}2=\frac{2a}{1-a}$",
    "q-s3-2-2-0022": r"$\log 7=\frac{b-2a}{3}$",
    "q-s3-2-2-0023": r"$\log 2=\frac{2a-b+2}{7}$",
    "q-s3-2-2-0024": "(2)",
    "q-s3-2-2-0025": "(3)",
    "q-s3-2-2-0026": "(2)",
    "q-s3-2-2-0027": "6.31倍",
}


def main() -> None:
    data = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = data["questions"] if isinstance(data, dict) else data
    for item in questions:
        qid = item.get("id")
        if qid in UPDATES:
            item["answer_text"] = UPDATES[qid]
    PACK_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
