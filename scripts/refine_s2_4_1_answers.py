import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-4-1/questions.json")

UPDATES = {
    "q-s2-4-1-0001": "(α,β) = (200°,-160°)",
    "q-s2-4-1-0002": "(A)(B)(D)",
    "q-s2-4-1-0003": "13個",
    "q-s2-4-1-0004": "8個",
    "q-s2-4-1-0005": "120°或160°",
    "q-s2-4-1-0006": r"$\overline{AB}=26$，$\overline{BC}=24$，$\sin A=\frac{12}{13}$，$\tan A=\frac{12}{5}$",
    "q-s2-4-1-0007": "(1)(4)",
    "q-s2-4-1-0008": r"(1)$\sin A=\frac{24}{25}$；(2)$\overline{BC}=26$",
    "q-s2-4-1-0009": r"(1)$\overline{CD}=12$；(2)$\overline{AD}=16$；(3)$\overline{AB}=25$；(4)$\overline{BD}=9$；(5)$\overline{BC}=15$",
    "q-s2-4-1-0010": "(3)",
    "q-s2-4-1-0011": "(A)(B)(C)(D)",
    "q-s2-4-1-0012": r"$\sin A=\frac{\sqrt{5}}{\sqrt{14}}$，$\cos A=\frac{3}{\sqrt{14}}$",
    "q-s2-4-1-0013": r"$\tan\alpha=\frac{1}{3}$",
    "q-s2-4-1-0014": r"$(\tan\angle APB)(\tan\angle CPD)=\frac{1}{10}$",
    "q-s2-4-1-0015": r"$\tan\alpha\cdot\tan\beta=\frac{1}{5}$",
    "q-s2-4-1-0016": r"(1)$\tan\alpha=\frac{1}{3}$；(2)$\angle CHE=45^\circ-\alpha$",
    "q-s2-4-1-0017": r"$-3-2\sqrt{2}$",
    "q-s2-4-1-0018": "2",
    "q-s2-4-1-0019": "12",
    "q-s2-4-1-0020": r"(1)$\theta=15^\circ$；(2)$\sin\theta=\frac{\sqrt6-\sqrt2}{4}$，$\cos\theta=\frac{\sqrt6+\sqrt2}{4}$，$\tan\theta=2-\sqrt3$",
    "q-s2-4-1-0021": r"(1)$\sin22.5^\circ=\frac{\sqrt{2-\sqrt2}}{2}$；(2)$\cos22.5^\circ=\frac{\sqrt{2+\sqrt2}}{2}$；(3)$\tan22.5^\circ=\sqrt2-1$",
    "q-s2-4-1-0022": r"(1)$\overline{BC}=\frac{\sqrt5-1}{2}$；(2)$\sin18^\circ=\frac{\sqrt5-1}{4}$",
    "q-s2-4-1-0023": "(1)(3)(4)",
    "q-s2-4-1-0024": "(4)",
    "q-s2-4-1-0025": "(2)(4)(5)",
    "q-s2-4-1-0026": "(1)(4)",
    "q-s2-4-1-0027": r"$\sin\theta=\frac{5}{13}$，$\cos\theta=-\frac{12}{13}$，$\tan\theta=-\frac{5}{12}$",
    "q-s2-4-1-0028": r"$y=-10$，$\sin\theta=-\frac{2\sqrt5}{5}$，$\cos\theta=-\frac{\sqrt5}{5}$",
    "q-s2-4-1-0029": r"$\pm\frac{1}{5}$",
    "q-s2-4-1-0030": "第三象限角",
    "q-s2-4-1-0031": "第二、四象限角",
    "q-s2-4-1-0032": "151",
    "q-s2-4-1-0033": "1",
    "q-s2-4-1-0034": "(A)(B)(D)(E)",
    "q-s2-4-1-0035": "(C)(D)",
    "q-s2-4-1-0036": "(A)(B)(C)(D)",
    "q-s2-4-1-0037": "(A)(B)(C)(D)",
    "q-s2-4-1-0038": r"$-\frac{\sqrt{1-k^2}}{k}$",
    "q-s2-4-1-0039": r"$\frac{k}{\sqrt{1-k^2}}$",
    "q-s2-4-1-0040": "(B)(C)",
    "q-s2-4-1-0041": r"(1)$2-\sqrt3$；(2)$\frac{1}{2}$；(3)$\frac{\sqrt3}{2}$；(4)$-1$；(5)$\sqrt2$",
    "q-s2-4-1-0042": r"$-\frac{\sqrt2}{2}$，$-\frac{\sqrt3}{2}$，$0$",
    "q-s2-4-1-0043": r"$\sqrt3-\frac{1}{4}$",
    "q-s2-4-1-0044": r"(1)$\frac{1}{4}$；(2)$-3$",
    "q-s2-4-1-0045": "1",
    "q-s2-4-1-0046": r"(1)$-\frac{5}{4}$；(2)$1$",
    "q-s2-4-1-0047": "(1)1；(2)1",
    "q-s2-4-1-0048": "3",
    "q-s2-4-1-0049": r"$6+4\sqrt3$",
    "q-s2-4-1-0050": r"$-\frac{\sqrt2}{4}$",
    "q-s2-4-1-0051": r"$-\frac{\sqrt3}{2}$",
    "q-s2-4-1-0052": "c > 1 > d > e > b > a",
    "q-s2-4-1-0053": r"$2\sin\theta$",
    "q-s2-4-1-0054": r"(1)$-\frac{2\sqrt6}{7}$；(2)$\overline{DG}=\sqrt{33}$",
    "q-s2-4-1-0055": r"(1)$A=(2,-2\sqrt3)$；(2)$B=(0,-2)$",
    "q-s2-4-1-0056": r"(1)$P=(-2\sqrt2,-2\sqrt2)$；(2)$Q=(0,3)$",
    "q-s2-4-1-0057": r"(1)$A=[5,180^\circ]$；(2)$B=[3\sqrt2,225^\circ]$",
    "q-s2-4-1-0058": r"(1)$P=[4,270^\circ]$；(2)$Q=[2\sqrt2,120^\circ]$",
    "q-s2-4-1-0059": "(B)(C)",
    "q-s2-4-1-0060": r"(1)$\overline{PQ}=\sqrt{25+12\sqrt3}$；(2)3",
    "q-s2-4-1-0061": r"(1)$\overline{AB}=7$；(2)$\frac{15\sqrt3}{4}$",
    "q-s2-4-1-0062": "13公里",
    "q-s2-4-1-0063": "(5)",
    "q-s2-4-1-0064": "見詳解",
    "q-s2-4-1-0065": "見詳解",
    "q-s2-4-1-0066": "見詳解",
    "q-s2-4-1-0067": "見詳解",
    "q-s2-4-1-0068": "(2)(3)(4)(5)",
    "q-s2-4-1-0069": r"$\sqrt3$",
    "q-s2-4-1-0070": r"$\tan\theta=2$或$-1$",
    "q-s2-4-1-0071": r"$\tan\theta=\frac{3}{4}$或$\frac{1}{2}$",
    "q-s2-4-1-0072": r"$\tan\theta=\frac{1}{2}$或$1$",
    "q-s2-4-1-0073": "(1)1；(2)1",
    "q-s2-4-1-0074": r"$\sqrt5+1$",
    "q-s2-4-1-0075": "1",
    "q-s2-4-1-0076": r"$\sqrt5+1$",
    "q-s2-4-1-0077": r"(1)$\frac{12}{25}$；(2)$\frac{37}{125}$；(3)$\frac{7}{5}$",
    "q-s2-4-1-0078": r"(1)$\frac{\sqrt5}{2}$；(2)$\frac{7\sqrt5}{16}$；(3)$\pm\frac{\sqrt3}{2}$",
    "q-s2-4-1-0079": r"(1)$\frac{7}{5}$；(2)$\pm\frac{1}{5}$",
    "q-s2-4-1-0080": r"(1)1；(2)1；(3)$\frac{\sqrt5-1}{2}$",
    "q-s2-4-1-0081": r"$\frac{24}{25}$",
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
