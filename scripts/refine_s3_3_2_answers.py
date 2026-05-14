from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s3-3-2" / "questions.json"

UPDATES = {
    "q-s3-3-2-0001": "-19",
    "q-s3-3-2-0002": r"(1)$t=\frac{1}{2}$；(2)$t=\frac{7}{2}$或$-2$",
    "q-s3-3-2-0003": r"(1)$t=\frac{8}{3}$；(2)$t=-\frac{5}{2}$時最小值為$\frac{\sqrt{2}}{2}$",
    "q-s3-3-2-0004": r"$\frac{8\sqrt{5}}{5}$",
    "q-s3-3-2-0005": r"$t=3$時，最小值$\sqrt{2}$",
    "q-s3-3-2-0006": r"$k=-6$或$-1$",
    "q-s3-3-2-0007": r"$-\frac{2}{5}$",
    "q-s3-3-2-0008": r"$\vec{a}=(0,-8)$或$(-4\sqrt{3},4)$",
    "q-s3-3-2-0009": r"$\frac{11}{2}$",
    "q-s3-3-2-0010": "-30",
    "q-s3-3-2-0011": r"$-\frac{5}{2}$",
    "q-s3-3-2-0012": r"(1)$\sqrt{37}$；(2)$-6$；(3)$22$",
    "q-s3-3-2-0013": r"(1)$\vec{AB}\cdot\vec{AC}=12$；(2)見詳解",
    "q-s3-3-2-0014": r"$\left(\frac{3}{7},\frac{16}{35}\right)$",
    "q-s3-3-2-0015": r"(1)見詳解；(2)$x=\frac{1}{9},\,y=\frac{2}{3}$",
    "q-s3-3-2-0016": r"$\left(\frac{5}{9},\frac{1}{6}\right)$",
    "q-s3-3-2-0017": "(A)(B)",
    "q-s3-3-2-0018": r"(1)$6$；(2)$\left(\frac{1}{3},\frac{1}{3}\right)$；(3)$\frac{11}{18}$；(4)$\left(\frac{19}{144},\frac{5}{24}\right)$；(5)$\left(\frac{125}{288},\frac{19}{48}\right)$",
    "q-s3-3-2-0019": r"(1)$19$；(2)$x=\frac{95}{144},\,y=\frac{19}{144}$；(3)$x=\frac{49}{288},\,y=\frac{125}{288}$",
    "q-s3-3-2-0020": r"(1)$x=\frac{1}{7},\,y=\frac{27}{35}$；(2)$x=\frac{3}{7},\,y=\frac{4}{35}$",
    "q-s3-3-2-0021": "(A)(B)(C)(D)(E)",
    "q-s3-3-2-0022": r"$3x-2y+7=0$",
    "q-s3-3-2-0023": r"(1)$2$；(2)$45^\circ$或$135^\circ$；(3)$\frac{27}{5}$",
    "q-s3-3-2-0024": r"$45^\circ$或$135^\circ$",
    "q-s3-3-2-0025": r"$7x-4y+4=0$及$4x+7y-7=0$",
    "q-s3-3-2-0026": r"(1)$(2,2)$；(2)$x-y=0$及$x+y-4=0$",
    "q-s3-3-2-0027": r"$7x-7y+5=0$",
    "q-s3-3-2-0028": r"$9x+7y=0$",
    "q-s3-3-2-0029": r"$x+2y+1=0$",
    "q-s3-3-2-0030": r"$x-5y=0$或$5x+y=0$",
    "q-s3-3-2-0031": r"$3x+y=6$或$x-3y=-8$",
    "q-s3-3-2-0032": r"$x=3$或$x-\sqrt{3}y=3-\sqrt{3}$",
    "q-s3-3-2-0033": "(3,4)",
    "q-s3-3-2-0034": r"銳角平分線：$7x+7y=5$；$I=\left(2,-\frac{9}{7}\right)$",
    "q-s3-3-2-0035": r"(1)$x+y+6=0$及$x-y+4=0$；(2)$I=(1,5)$",
    "q-s3-3-2-0036": r"$\left(\frac{3}{2},\frac{9}{2}\right)$",
    "q-s3-3-2-0037": r"$\left(\frac{4}{5},\frac{2}{5}\right)$",
    "q-s3-3-2-0038": "(2,6)",
    "q-s3-3-2-0039": r"$\left(-\frac{33}{13},\frac{22}{13}\right)$",
    "q-s3-3-2-0040": "3",
    "q-s3-3-2-0041": "1：2",
    "q-s3-3-2-0042": "5或3",
    "q-s3-3-2-0043": "2",
    "q-s3-3-2-0044": r"(1)$\frac{\sqrt{2}}{2}$；(2)$\frac{5}{2}$",
    "q-s3-3-2-0045": r"$\frac{5}{2\sqrt{13}}$",
    "q-s3-3-2-0046": r"$4x-3y+12=0$或$4x-3y-8=0$",
    "q-s3-3-2-0047": r"$\left(\frac{11}{5},\frac{7}{5},\frac{1}{\sqrt{5}}\right)$",
    "q-s3-3-2-0048": r"$\left(\frac{1}{5},\frac{7}{5}\right)$",
    "q-s3-3-2-0049": "10",
    "q-s3-3-2-0050": r"$P(0,4)$",
    "q-s3-3-2-0051": "22",
    "q-s3-3-2-0052": "18",
    "q-s3-3-2-0053": r"(1)$10$；(2)$(6,8)$；(3)$(4,12)$；(4)$\frac{25}{2}$",
    "q-s3-3-2-0054": r"(1)$5$；(2)$10$；(3)$(-11,1)$；(4)$15$；(5)$2$；(6)$\left(-\frac{8}{5},\frac{6}{5}\right)$；(7)$6$",
    "q-s3-3-2-0055": "3",
    "q-s3-3-2-0056": r"$3+2\sqrt{2}$",
    "q-s3-3-2-0057": "18",
    "q-s3-3-2-0058": r"(1)$50$；(2)$10$",
    "q-s3-3-2-0059": r"$\frac{4}{5}$",
    "q-s3-3-2-0060": r"$\frac{4}{5}$",
    "q-s3-3-2-0061": "最大值8，最小值-12",
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
