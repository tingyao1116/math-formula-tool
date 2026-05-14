from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s2-1-1" / "questions.json"

UPDATES = {
    "q-s2-1-1-0003": r"(1)$a_n=3n+2$；(2)$a_n=2^{n-3}$；(3)$a_n=(-1)^{n-1}$；(4)$a_n=2(-1)^{n-1}$",
    "q-s2-1-1-0004": "(1)",
    "q-s2-1-1-0005": r"(1)$5050$；(2)$(m,n)=(14,9)$",
    "q-s2-1-1-0006": r"(1)第$517$項；(2)第$101$項為$(5,10)$",
    "q-s2-1-1-0007": r"$a_{22}=-50$，$a_n=38-4n$",
    "q-s2-1-1-0008": "(2)(4)(5)",
    "q-s2-1-1-0009": r"$46$",
    "q-s2-1-1-0010": "(3)(5)",
    "q-s2-1-1-0011": r"$k=10$",
    "q-s2-1-1-0012": "星期四",
    "q-s2-1-1-0014": r"$a_{m+n}=\frac{ma-nb}{m-n}$",
    "q-s2-1-1-0015": r"$-mn$",
    "q-s2-1-1-0017": r"(1)$a=24,\ r=\frac12$；(2)$a_5=\frac32$；(3)是第$10$項",
    "q-s2-1-1-0018": r"$-\frac{64}{15}$",
    "q-s2-1-1-0019": "(3)(4)(5)",
    "q-s2-1-1-0020": "4",
    "q-s2-1-1-0021": r"$(a,b,c)=(10,25,40)$",
    "q-s2-1-1-0022": r"(1)$(a,b,c)=(2,4,8)$；(2)第四項為$0.001\overline{7}$",
    "q-s2-1-1-0024": r"$36$",
    "q-s2-1-1-0025": "見詳解",
    "q-s2-1-1-0026": "2",
    "q-s2-1-1-0030": "(1)(2)(3)(4)(5)",
    "q-s2-1-1-0031": r"$(\frac34)^5=\frac{243}{1024}\approx23.73\%$",
    "q-s2-1-1-0032": r"$\frac{175\sqrt{3}}{1024}$",
    "q-s2-1-1-0033": r"$a_2=\frac32$，$a_3=\frac53$，$a_n=2-\frac1n$",
    "q-s2-1-1-0034": r"$a_n=3(-2)^{n-1}$",
    "q-s2-1-1-0037": r"$a_n=\frac{1}{(2n-1)(2n+1)}$",
    "q-s2-1-1-0038": "(A)(C)(D)(E)",
    "q-s2-1-1-0039": r"$a_n=\left(\frac{n(n+1)}{2}\right)^2$",
    "q-s2-1-1-0040": r"$a_n=2^{n+1}-n-2$",
    "q-s2-1-1-0041": r"$a_n=\frac52-\frac12\left(\frac13\right)^{n-1}$",
    "q-s2-1-1-0045": "(2)(3)(5)",
    "q-s2-1-1-0046": r"(1)$a_1=1$，$a_n=a_{n-1}+n\ (n\ge2)$；(2)$a_7=28$",
    "q-s2-1-1-0047": r"(1)$a_1=2,\ a_2=4,\ a_3=7,\ a_4=11$；(2)$a_n=a_{n-1}+n\ (n\ge2)$；(3)$a_n=\frac{n(n+1)}{2}+1$",
    "q-s2-1-1-0048": r"(1)$a_1=2,\ a_2=4,\ a_3=8,\ a_4=14$；(2)$a_n=a_{n-1}+2(n-1)\ (n\ge2)$；(3)$a_n=n^2-n+2$",
    "q-s2-1-1-0050": r"(1)$a_n=a_{n-1}+3n+1\ (n\ge2)$；(2)$a_5=51$",
    "q-s2-1-1-0051": r"(1)$P_5=\frac{256}{27}$，$P_n=3\left(\frac43\right)^{n-1}$；(2)$b_5=768$，$b_1=3,\ b_n=4b_{n-1}\ (n\ge2)$，$b_n=3\cdot4^{n-1}$；(3)$c_1=\frac{\sqrt3}{4}$，$c_n=c_{n-1}+\frac{\sqrt3}{12}\left(\frac49\right)^{n-2}\ (n\ge2)$，$c_n=\frac{2\sqrt3}{5}-\frac{3\sqrt3}{20}\left(\frac49\right)^{n-1}$，極限面積為$\frac{2\sqrt3}{5}$",
    "q-s2-1-1-0053": r"$a_n=(-1)^{n-1}$",
    "q-s2-1-1-0066": "見詳解",
    "q-s2-1-1-0071": "見詳解",
    "q-s2-1-1-0074": r"$(p,k)=(3,2)$",
}


def main() -> None:
    payload = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    rows = payload.get("questions", [])
    changed = 0
    for row in rows:
        qid = row.get("id")
        if qid in UPDATES:
            row["answer_text"] = UPDATES[qid]
            changed += 1
    PACK_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"updated={changed}")


if __name__ == "__main__":
    main()
