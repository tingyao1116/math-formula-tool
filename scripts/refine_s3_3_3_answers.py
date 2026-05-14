from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s3-3-3" / "questions.json"

UPDATES = {
    "q-s3-3-3-0001": "(B)(C)(D)",
    "q-s3-3-3-0002": "42",
    "q-s3-3-3-0003": "3",
    "q-s3-3-3-0004": r"$-10\sqrt{6}$",
    "q-s3-3-3-0005": "(B)(E)",
    "q-s3-3-3-0006": r"$a=-5$，$b=2$，$c=-3$，$d=1$",
    "q-s3-3-3-0007": r"$a=-7$",
    "q-s3-3-3-0008": r"$a=5$",
    "q-s3-3-3-0009": r"$\left(\frac{11}{7},\frac{1}{7}\right)$",
    "q-s3-3-3-0010": r"$(a,b)=(1,4)$；$\left(x,y\right)=\left(\frac{5}{3},\frac{1}{3}\right)$",
    "q-s3-3-3-0011": r"$(x,y)=(-1,0)$",
    "q-s3-3-3-0012": r"$(x,y)=(10,5)$",
    "q-s3-3-3-0013": r"$(x,y)=(-3,-3)$",
    "q-s3-3-3-0014": r"$1<a<3$",
    "q-s3-3-3-0015": r"$a=1$或$3$",
    "q-s3-3-3-0016": r"(1)$k=-1$或$7$；(2)$k=7$",
    "q-s3-3-3-0017": r"$k=-1$",
    "q-s3-3-3-0018": r"當$a\ne 1,-2$時，交於$\left(\frac{a-3}{a-1},\frac{a}{a-1}\right)$；當$a=1$時，平行；當$a=-2$時，重合",
    "q-s3-3-3-0019": r"當$a\ne 1,5$時，唯一解為$x=\frac{a-11}{a-5}$，$y=-\frac{a+1}{a-5}$；當$a=1$時，無限多解$(x,y)=(t,3-t)$，$t\in\mathbb{R}$；當$a=5$時，無解",
    "q-s3-3-3-0020": r"當$k\ne 3,-2$時，唯一解為$\left(\frac{4}{k+2},\frac{1}{k+2}\right)$；當$k=3$時，無限多解$(x,y)=(1-t,t)$，$t\in\mathbb{R}$；當$k=-2$時，無解",
    "q-s3-3-3-0021": r"當$k\ne \pm1$時，唯一解為$\left(\frac{k}{k+1},\frac{2k+1}{k+1}\right)$；當$k=1$時，無限多解，兩直線重合；當$k=-1$時，無解，兩直線平行",
    "q-s3-3-3-0022": "A機器需6小時，B機器需12小時",
    "q-s3-3-3-0023": "橋寬20公尺，水流速率每秒1公尺",
    "q-s3-3-3-0024": "甲最初每小時4公里，乙每小時5公里",
}


def main() -> None:
    data = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = data["questions"] if isinstance(data, dict) else data
    seen = set()
    for item in questions:
        qid = item.get("id")
        if qid in UPDATES:
            item["answer_text"] = UPDATES[qid]
            seen.add(qid)
    missing = sorted(set(UPDATES) - seen)
    if missing:
        raise SystemExit(f"Missing questions: {missing}")
    PACK_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
