from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"C:\codex資料夾\數學公式使用工具\program-db\imports\packs\s3-1-4\questions.json")

UPDATES = {
    "q-s3-1-4-0001": r"$a=\frac{1}{2},\ b=5\sqrt{15},\ c=28$",
    "q-s3-1-4-0002": r"$(2,-\frac{\pi}{2},1)$或$(2,\frac{3\pi}{2},1)$",
    "q-s3-1-4-0003": "(2)(4)(5)",
    "q-s3-1-4-0004": "(2)(3)(4)",
    "q-s3-1-4-0005": r"$\alpha+\beta=\frac{2\pi}{3}$，$M+m=\frac{11}{2}$",
    "q-s3-1-4-0006": r"$(x_1,M)=\left(\frac{\pi}{6},2\right)$，$(x_2,m)=(\pi,-\sqrt3)$",
    "q-s3-1-4-0007": "(A)(B)(E)",
    "q-s3-1-4-0008": "(B)(C)(D)",
    "q-s3-1-4-0009": r"$\frac{25}{8}$",
    "q-s3-1-4-0010": r"$\frac{\pi}{6}<x<\frac{2\pi}{3}$或$\frac{4\pi}{3}<x<\frac{11\pi}{6}$",
    "q-s3-1-4-0011": "(1)(4)",
    "q-s3-1-4-0012": "(A)(B)(C)(E)",
    "q-s3-1-4-0013": "(2)(3)(4)(5)",
    "q-s3-1-4-0014": "(1)(2)(4)(5)",
    "q-s3-1-4-0015": "(1)(2)(3)",
    "q-s3-1-4-0016": r"$\left[\frac{11}{3},7\right]$",
    "q-s3-1-4-0017": r"最大值$\frac{3+\sqrt2}{2}$，最小值$1$",
    "q-s3-1-4-0018": r"$\theta=\frac{\pi}{3}$",
    "q-s3-1-4-0019": r"$2$",
    "q-s3-1-4-0020": "(A)(B)(C)(D)(E)",
    "q-s3-1-4-0021": r"$[1,\sqrt2]$；$(x_1,M)=(0,4)$或$\left(\frac{\pi}{2},4\right)$；$\left(x_2,m\right)=\left(\frac{\pi}{4},1+2\sqrt2\right)$",
    "q-s3-1-4-0022": r"最大值$\frac{3+2\sqrt2}{2}$，最小值$0$",
    "q-s3-1-4-0023": r"(1)$2-4\sqrt2$；(2)$2+4\sqrt2$",
    "q-s3-1-4-0024": r"$\sqrt2+1$",
    "q-s3-1-4-0025": r"最大值$\frac{\sqrt2}{2}$，最小值$-\frac{\sqrt2}{2}$",
    "q-s3-1-4-0026": r"最大值$\frac{4+\sqrt7}{3}$，最小值$\frac{4-\sqrt7}{3}$",
    "q-s3-1-4-0027": r"$(M,m)=\left(\frac{\sqrt2-1}{2},-\frac{\sqrt2+1}{2}\right)$",
    "q-s3-1-4-0028": r"(1)最大值$\frac{\sqrt2+1}{2}$，此時$\theta=\frac{3\pi}{8}$；(2)最小值$0$，此時$\theta=0$",
    "q-s3-1-4-0029": r"最大值$\frac{\sqrt2-1}{2}$，最小值$-\frac{1}{2}$",
    "q-s3-1-4-0030": "4",
    "q-s3-1-4-0031": r"$100+100\sqrt5$",
    "q-s3-1-4-0032": r"$x=\frac{\pi}{4}$",
    "q-s3-1-4-0033": "(1)(2)(3)(4)(5)",
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
