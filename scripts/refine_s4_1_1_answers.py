from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s4-1-1" / "questions.json"

UPDATES = {
    "q-s4-1-1-0001": "(A)(D)",
    "q-s4-1-1-0002": "(A)(B)(C)(D)",
    "q-s4-1-1-0003": "(A)(C)(D)",
    "q-s4-1-1-0004": "(A)(B)(C)",
    "q-s4-1-1-0005": "(B)(E)",
    "q-s4-1-1-0006": "(2)(5)",
    "q-s4-1-1-0007": "(2)(4)(5)",
    "q-s4-1-1-0008": "(2)(3)(4)",
    "q-s4-1-1-0009": "(1)(2)(3)(4)",
    "q-s4-1-1-0010": "(2)(3)",
    "q-s4-1-1-0011": "(1)(2)(3)(4)",
    "q-s4-1-1-0012": "(1)(2)(4)",
    "q-s4-1-1-0013": "(2)(3)(4)",
    "q-s4-1-1-0014": r"$\frac{\sqrt{2}}{2}$",
    "q-s4-1-1-0015": r"(1)$\frac{8}{3}$；(2)$0$",
    "q-s4-1-1-0016": r"$\frac{1}{2}$",
    "q-s4-1-1-0017": "(1)(3)",
    "q-s4-1-1-0018": r"(1)$\frac{\sqrt{6}}{3}a$；(2)$\frac{\sqrt{2}}{12}a^3$；(3)$\frac{\sqrt{6}}{12}a$；(4)$\frac{\sqrt{6}}{4}a$；(5)$\frac{1}{3}$；(6)$\frac{\sqrt{2}}{2}a$",
    "q-s4-1-1-0019": r"(1)$\frac{12}{5}$；(2)$\frac{\sqrt{769}}{5}$；(3)$\frac{\sqrt{769}}{2}$；(4)$10$；(5)$\frac{60\sqrt{769}}{769}$",
    "q-s4-1-1-0020": r"每邊長$=\sqrt{2}a$；對角線長$=2a$；體積$=\frac{4}{3}a^3$",
    "q-s4-1-1-0021": "(1)(3)(5)",
    "q-s4-1-1-0022": r"(1)$\frac{\sqrt{6}}{3}$；(2)$2\sqrt{2}$；(3)$\frac{\sqrt{2}}{2}$",
    "q-s4-1-1-0023": "(1)(2)(3)(5)",
    "q-s4-1-1-0024": r"(1)$25$；(2)$\frac{7}{20}$",
    "q-s4-1-1-0025": "12",
    "q-s4-1-1-0026": "13",
    "q-s4-1-1-0027": "3",
    "q-s4-1-1-0028": r"$\frac{\sqrt{3}}{2}$",
    "q-s4-1-1-0029": r"$\frac{\sqrt{6}}{3}$",
    "q-s4-1-1-0030": "(1)見詳解；(2)25",
    "q-s4-1-1-0031": r"$\sqrt{2}$",
    "q-s4-1-1-0032": r"$\sqrt{109}$",
    "q-s4-1-1-0033": "(2)(3)(4)(5)",
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
