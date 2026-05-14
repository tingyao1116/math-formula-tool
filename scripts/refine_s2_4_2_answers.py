import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-4-2/questions.json")

UPDATES = {
    "q-s2-4-2-0001": r"$\frac{9\sqrt3}{2}$",
    "q-s2-4-2-0002": "9",
    "q-s2-4-2-0003": r"$4\sqrt3$",
    "q-s2-4-2-0004": r"$3\sqrt3$",
    "q-s2-4-2-0005": r"(1)$4\sqrt6$；(2)$\frac{\sqrt6}{2}$",
    "q-s2-4-2-0006": "(2)",
    "q-s2-4-2-0007": "2",
    "q-s2-4-2-0008": "24",
    "q-s2-4-2-0009": r"$\sqrt3-1$",
    "q-s2-4-2-0010": r"$2\sqrt2:2\sqrt3:(\sqrt6+\sqrt2)$",
    "q-s2-4-2-0011": "2：4：3",
    "q-s2-4-2-0012": "5：3：7",
    "q-s2-4-2-0013": "2：3：4",
    "q-s2-4-2-0014": "(1)",
    "q-s2-4-2-0015": r"(1)$3\sqrt2$；(2)$3(\sqrt3+1)$；(3)$3\sqrt2$",
    "q-s2-4-2-0016": r"(1)$\sqrt6$；(2)$\sqrt3+1$；(3)$\sqrt2$",
    "q-s2-4-2-0017": "∠B=75°或105°，∠C=60°或30°",
    "q-s2-4-2-0018": "∠C=60°，∠A=45°，BC=2",
    "q-s2-4-2-0019": r"$\overline{AB}=\sqrt6$，$R=\sqrt2$",
    "q-s2-4-2-0020": r"(1)$\sqrt3+1$；(2)$\sqrt6$",
    "q-s2-4-2-0021": "(A)(C)(D)",
    "q-s2-4-2-0022": "(D)(E)",
    "q-s2-4-2-0023": "(D)(E)",
    "q-s2-4-2-0024": "(C)(E)",
    "q-s2-4-2-0025": "(A)(B)(D)(E)",
    "q-s2-4-2-0026": r"(1)$2\sqrt2$；(2)$\frac{2\pi}{3}$",
    "q-s2-4-2-0027": "(1)(5)",
    "q-s2-4-2-0028": "(B)(C)(D)",
    "q-s2-4-2-0029": "(3)",
    "q-s2-4-2-0030": "(1)(2)(5)",
    "q-s2-4-2-0031": "(2)(3)(4)(5)",
    "q-s2-4-2-0032": "7",
    "q-s2-4-2-0033": "120°",
    "q-s2-4-2-0034": r"(1)$\sqrt6$；(2)45°；(3)105°",
    "q-s2-4-2-0035": "6",
    "q-s2-4-2-0036": "(A)(C)(E)",
    "q-s2-4-2-0037": "(B)(D)(E)",
    "q-s2-4-2-0038": "(C)(D)",
    "q-s2-4-2-0039": r"$\overline{BC}=\sqrt2$，∠C=45°",
    "q-s2-4-2-0040": r"$2+\sqrt13$",
    "q-s2-4-2-0041": r"$\cos A=\frac78$，$\overline{BC}=\frac{16\sqrt15}{15}$，$R=\frac{64}{15}$",
    "q-s2-4-2-0042": "(A)(C)(E)",
    "q-s2-4-2-0043": r"$\cos A=\frac15$，面積$=18\sqrt6$",
    "q-s2-4-2-0044": r"$\overline{AC}=\sqrt{\frac{55}{7}}$，面積$=2\sqrt6$",
    "q-s2-4-2-0045": r"$\overline{AD}=10$，$\overline{AC}=2\sqrt19$，面積$=21\sqrt3$",
    "q-s2-4-2-0046": r"(1)$\overline{BC}=7$；(2)$R=\frac{7\sqrt3}{3}$；(3)$r=\frac{2\sqrt3}{3}$；(4)$\triangle ABD=\frac{13\sqrt3}{2}$",
    "q-s2-4-2-0047": r"$\overline{BD}=7$",
    "q-s2-4-2-0048": r"$\overline{AD}=3$",
    "q-s2-4-2-0049": "見詳解",
    "q-s2-4-2-0050": "等腰三角形",
    "q-s2-4-2-0051": "(1)等腰三角形；(2)等腰三角形",
    "q-s2-4-2-0052": "(1)等腰三角形或直角三角形；(2)直角三角形",
    "q-s2-4-2-0053": "見詳解",
    "q-s2-4-2-0054": r"$\overline{AD}=6$",
    "q-s2-4-2-0055": r"(1)$\overline{AD}\times\overline{AE}=78$；(2)$\overline{DE}$最小值為$2\sqrt3$",
    "q-s2-4-2-0056": r"(1)$\sin A:\sin B:\sin C=3:5:7$；(2)$\cos A=\frac{13}{14}$；(3)$15\sqrt3$",
    "q-s2-4-2-0057": r"(1)$3\sqrt15$；(2)$\sin A=\frac{\sqrt15}{4}$；(3)$\sqrt10$",
    "q-s2-4-2-0058": r"(1)$15\sqrt7$；(2)$\frac{16\sqrt7}{7}$；(3)$\sqrt46$",
    "q-s2-4-2-0059": "(A)(C)(E)",
    "q-s2-4-2-0060": r"(1)$\overline{AM}=\frac{\sqrt79}{2}$；(2)$\overline{AH}=\frac{3\sqrt7}{2}$；(3)$\overline{AD}=3\sqrt2$",
    "q-s2-4-2-0061": r"$\overline{AD}=\frac{15}{8}$",
    "q-s2-4-2-0062": r"(1)$6\sqrt3$；(2)$\overline{AD}=\frac{12\sqrt3}{5}$；(3)$\overline{BC}=2\sqrt7$；(4)$\sin B=\frac{\sqrt21}{7}$；(5)$\overline{BD}=\frac{6\sqrt7}{5}$",
    "q-s2-4-2-0063": r"(1)$\frac{2\sqrt6}{3}$；(2)$2\sqrt70$",
    "q-s2-4-2-0064": r"(1)$\overline{AD}=\frac{6\sqrt3}{5}$；(2)$\overline{AE}=6$",
    "q-s2-4-2-0065": r"$\overline{EG}=14$，$\triangle AEG$面積$=12\sqrt5$",
    "q-s2-4-2-0066": "(2)(3)(4)(5)",
    "q-s2-4-2-0067": r"$\frac{16\sqrt15}{5}$",
    "q-s2-4-2-0068": "(1)(2)(4)(6)",
    "q-s2-4-2-0069": r"$9\sqrt15$",
    "q-s2-4-2-0070": "(1)(5)",
    "q-s2-4-2-0071": r"(1)$\overline{AD}=5$；(2)$R=\frac{35\sqrt6}{24}$；(3)$\triangle DEF=\frac{48\sqrt6}{35}$",
    "q-s2-4-2-0072": r"$4\sqrt14$",
}


def main() -> None:
    obj = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = obj["questions"]
    seen = set()
    for question in questions:
        qid = question["id"]
        if qid in UPDATES:
            question["answer_text"] = UPDATES[qid]
            seen.add(qid)
    missing = sorted(set(UPDATES) - seen)
    if missing:
        raise SystemExit(f"Missing questions: {missing}")
    PACK_PATH.write_text(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
