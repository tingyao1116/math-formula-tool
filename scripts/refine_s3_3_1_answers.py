from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s3-3-1" / "questions.json"

UPDATES = {
    "q-s3-3-1-0001": "10個",
    "q-s3-3-1-0002": "(1)8個；(2)6個",
    "q-s3-3-1-0003": "20個",
    "q-s3-3-1-0004": "(A)(B)(C)(D)(E)",
    "q-s3-3-1-0005": "(B)(C)(E)",
    "q-s3-3-1-0006": "見詳解",
    "q-s3-3-1-0007": r"(1)$\vec{a}+\vec{b}+\vec{c}$；(2)$-\vec{a}+\vec{b}+\vec{c}$；(3)$-\vec{a}-\vec{b}+\vec{c}$；(4)$\vec{a}-\vec{b}+\vec{c}$；(5)$\vec{a}+\vec{b}$",
    "q-s3-3-1-0008": "(1)(3)(5)",
    "q-s3-3-1-0009": r"$(3\sqrt{2},\,3\sqrt{2})$",
    "q-s3-3-1-0010": r"$320^\circ$",
    "q-s3-3-1-0011": r"(1)$\sqrt{7}$；(2)$180^\circ$",
    "q-s3-3-1-0012": r"$B(12,4\sqrt{3})$；$C(10,6\sqrt{3})$；$D(6,6\sqrt{3})$",
    "q-s3-3-1-0013": "(3,-2)",
    "q-s3-3-1-0014": r"$\left(\frac{2}{5},\frac{9}{5}\right)$",
    "q-s3-3-1-0015": r"$\vec{u}=(-5,-8)$，$\vec{v}=(7,11)$",
    "q-s3-3-1-0016": "(2,-3)",
    "q-s3-3-1-0017": r"$\frac{15}{13}$",
    "q-s3-3-1-0018": r"$k=-4$或$7$",
    "q-s3-3-1-0019": r"$(\alpha,\beta)=\left(2,\frac{3}{2}\right)$",
    "q-s3-3-1-0020": r"$-\overset{⃑}{AB}+2\overset{⃑}{BC}$",
    "q-s3-3-1-0021": r"$3\overset{⃑}{AB}-\frac{2}{3}\overset{⃑}{AC}$",
    "q-s3-3-1-0022": "(1,3)",
    "q-s3-3-1-0023": "3",
    "q-s3-3-1-0024": r"$\left(\frac{2}{3},-\frac{1}{6}\right)$",
    "q-s3-3-1-0025": r"$\frac{3}{4}\overset{⃑}{AB}+\frac{1}{2}\overset{⃑}{BC}$",
    "q-s3-3-1-0026": r"$\left(\frac{9}{29},\frac{8}{29}\right)$",
    "q-s3-3-1-0027": r"(1)$\left(\frac{1}{4},\frac{1}{2}\right)$；(2)$3:1$",
    "q-s3-3-1-0028": r"$\left(\frac{3}{5},\frac{1}{5}\right)$",
    "q-s3-3-1-0029": r"(1)$\frac{24}{7}$；(2)$\frac{3}{7}\overset{⃑}{AD}+\frac{4}{7}\overset{⃑}{AE}$",
    "q-s3-3-1-0030": "2：5",
    "q-s3-3-1-0031": r"(1)$25:12$；(2)$\left(\frac{10}{37},\frac{12}{37}\right)$",
    "q-s3-3-1-0032": "(B)(C)(E)",
    "q-s3-3-1-0033": r"$\left(\frac{3}{4},\frac{1}{2}\right)$",
    "q-s3-3-1-0034": r"(1)$\left(-\frac{1}{6},\frac{2}{3}\right)$；(2)$\left(\frac{1}{7},\frac{5}{7}\right)$",
    "q-s3-3-1-0035": r"(1)$x=\frac{3}{4},\,y=1$；(2)$x=-\frac{1}{4},\,y=1$",
    "q-s3-3-1-0036": r"$\left(\frac{5}{11},\frac{9}{11}\right)$",
    "q-s3-3-1-0037": r"$\left(\frac{3}{8},\frac{5}{8}\right)$",
    "q-s3-3-1-0038": r"$x=\frac{8}{11},\,y=\frac{9}{11}$",
    "q-s3-3-1-0039": r"$x=\frac{3}{5},\,y=\frac{2}{5}$",
    "q-s3-3-1-0040": r"$\frac{3\sqrt{6}}{5}$",
    "q-s3-3-1-0041": r"$\frac{\sqrt{130}}{3}$",
    "q-s3-3-1-0042": r"$\frac{3\sqrt{15}}{4}$",
    "q-s3-3-1-0043": r"(1)$\sqrt{7}$；(2)$\sqrt{13}$",
    "q-s3-3-1-0044": r"$\frac{3\sqrt{15}}{2}$",
    "q-s3-3-1-0045": r"$9\sqrt{3}$",
    "q-s3-3-1-0046": "168",
    "q-s3-3-1-0047": r"$\sqrt{17}$",
    "q-s3-3-1-0048": r"$-\frac{8}{9}$",
    "q-s3-3-1-0049": "-16",
    "q-s3-3-1-0050": r"$\frac{2}{3}\overset{⃑}{AB}+\frac{1}{3}\overset{⃑}{BC}$",
    "q-s3-3-1-0051": r"$x=\frac{17}{45},\,y=\frac{7}{30}$",
    "q-s3-3-1-0052": r"$\left(\frac{5}{12},\frac{7}{36}\right)$",
    "q-s3-3-1-0053": r"$\frac{2}{3}\overset{⃑}{AB}+\frac{4}{9}\overset{⃑}{BC}+\overset{⃑}{OA}$",
    "q-s3-3-1-0054": r"$x=\frac{4}{9},\,y=\frac{17}{45},\,z=\frac{8}{45}$",
    "q-s3-3-1-0055": r"$\left(\frac{13}{7},\frac{25}{7}\right)$",
    "q-s3-3-1-0056": r"$\left(-\frac{7}{4},4\right)$或$\left(-\frac{11}{2},7\right)$",
    "q-s3-3-1-0057": r"$\left(\frac{14}{5},\frac{33}{5}\right)$或$(10,21)$",
    "q-s3-3-1-0058": r"$\left(0,\frac{13}{3}\right)$或$(-8,7)$",
    "q-s3-3-1-0059": "(3,2)",
    "q-s3-3-1-0060": r"$A(-1,3)$，$B(5,-9)$，$C(3,7)$",
    "q-s3-3-1-0061": "(5,7)",
    "q-s3-3-1-0062": r"(1)$\left(\frac{2}{3},-5\right)$；(2)$(2,-4)$；(3)$(18,-8)$",
    "q-s3-3-1-0063": r"$\left(\frac{3}{2},-\frac{3}{2}\right)$",
    "q-s3-3-1-0064": "(A)(C)(D)",
    "q-s3-3-1-0065": r"$\begin{cases}x=1+3t\\ y=2+t\end{cases},\ t\in\mathbb{R}$",
    "q-s3-3-1-0066": r"$4x+3y-11=0$",
    "q-s3-3-1-0067": "(1,3)",
    "q-s3-3-1-0068": r"$\left(\frac{5}{3},2\right)$",
    "q-s3-3-1-0069": "最大值11，最小值6",
    "q-s3-3-1-0070": r"$-\frac{54}{5}$",
    "q-s3-3-1-0071": "3",
    "q-s3-3-1-0072": r"$\frac{4}{3}$",
    "q-s3-3-1-0073": r"$(-3,11)$；清晨2時24分進入；清晨4時0分脫離",
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
