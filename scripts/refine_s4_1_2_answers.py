from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s4-1-2" / "questions.json"

UPDATES = {
    "q-s4-1-2-0001": "(A)(B)(C)(D)(E)",
    "q-s4-1-2-0002": "(A)(C)(E)",
    "q-s4-1-2-0003": "(A)(B)(C)(E)",
    "q-s4-1-2-0004": "(5)",
    "q-s4-1-2-0005": "(4)",
    "q-s4-1-2-0006": r"$(2,\sqrt{79},\sqrt{21})$",
    "q-s4-1-2-0007": r"$(3,4,6)$",
    "q-s4-1-2-0008": "(2)(3)(5)",
    "q-s4-1-2-0009": "17",
    "q-s4-1-2-0010": r"$\frac{103}{2}$",
    "q-s4-1-2-0011": r"$(4,0,0)$",
    "q-s4-1-2-0012": r"$(1,0,3)$或$(4,0,0)$",
    "q-s4-1-2-0013": r"(1)$\sqrt{41}$；(2)$\sqrt{35}$",
    "q-s4-1-2-0014": r"$(1,1,\sqrt{2})$或$(1,1,-\sqrt{2})$",
    "q-s4-1-2-0015": "(4)(5)",
    "q-s4-1-2-0016": r"$(1,0,3)$或$(4,0,0)$",
    "q-s4-1-2-0017": r"(1)$D\left(\frac{1}{2},\frac{\sqrt{3}}{2},0\right)$；(2)$A\left(\frac{1}{2},\frac{\sqrt{3}}{6},\frac{\sqrt{6}}{3}\right)$；(3)$H\left(\frac{1}{2},\frac{\sqrt{3}}{6},0\right)$",
    "q-s4-1-2-0018": r"$D=(1,4,-3)$；$\triangle BCD$為等腰三角形",
    "q-s4-1-2-0019": r"(1)正三角形；(2)$\frac{21\sqrt{3}}{2}$；(3)$\frac{21}{2}$；(4)$\frac{\sqrt{6}}{3}$",
    "q-s4-1-2-0020": "(1)(2)(3)(4)(5)",
    "q-s4-1-2-0021": r"$5\sqrt{13}$",
    "q-s4-1-2-0022": r"$6+2\sqrt{14}$",
    "q-s4-1-2-0023": "(B)(C)(E)",
    "q-s4-1-2-0024": "(A)(B)(C)(D)",
    "q-s4-1-2-0025": "(B)(C)(E)",
    "q-s4-1-2-0026": r"$\left(\frac{\pi}{4},\frac{2\pi}{3},\frac{\pi}{3}\right)$",
    "q-s4-1-2-0027": r"$(6,0,-5)$",
    "q-s4-1-2-0028": r"$\left(7-\frac{9}{\sqrt{2}},\frac{3}{2},-\frac{1}{2}\right)$",
    "q-s4-1-2-0029": r"$x=\frac{5}{13},\,y=\frac{3}{13},\,z=\frac{5}{13}$",
    "q-s4-1-2-0030": r"$\frac{\pi}{2}$",
    "q-s4-1-2-0031": r"(1)$2$；(2)$3$",
    "q-s4-1-2-0032": r"$(-1,-2,9)$",
    "q-s4-1-2-0033": r"$D\left(\frac{21}{4},\frac{15}{4},\frac{19}{4}\right)$；$E(9,0,1)$",
    "q-s4-1-2-0034": r"$(10,\frac{7}{2},-7)$",
    "q-s4-1-2-0035": r"(1)$G\left(\frac{11}{3},\frac{2}{3},3\right)$；(2)$P\left(\frac{32}{7},\frac{13}{7},3\right)$；(3)$\frac{1}{2}$",
    "q-s4-1-2-0036": r"(1)$P\left(\frac{1}{2},-\frac{9}{4},\frac{5}{2}\right)$；(2)$P=(6,5,-7)$或$(0,-7,11)$",
    "q-s4-1-2-0037": "(1)(3)(5)",
    "q-s4-1-2-0038": r"(1)$(-21,12,-47)$；(2)$3\sqrt{29}$",
    "q-s4-1-2-0039": r"$p=3,\ q=1,\ r=3$",
    "q-s4-1-2-0040": r"$x=\frac{3}{13},\,y=\frac{5}{13},\,z=\frac{5}{13}$",
    "q-s4-1-2-0041": r"$\frac{7}{3}$",
    "q-s4-1-2-0042": "2",
    "q-s4-1-2-0043": r"$\sqrt{\frac{14}{5}}$",
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
