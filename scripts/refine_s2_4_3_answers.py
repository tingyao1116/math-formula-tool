import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-4-3/questions.json")

UPDATES = {
    "q-s2-4-3-0001": r"$a=-3$，$b=5$",
    "q-s2-4-3-0002": r"$\frac{bc\sin\alpha}{a+b+c\cos\alpha}$",
    "q-s2-4-3-0003": "會觸及水雷",
    "q-s2-4-3-0004": r"$5\sqrt3$",
    "q-s2-4-3-0005": r"$\frac{20\sqrt3}{3}$",
    "q-s2-4-3-0006": r"$40+\frac{40\sqrt3}{3}$",
    "q-s2-4-3-0007": "見詳解",
    "q-s2-4-3-0008": r"$250(2+\sqrt3)$",
    "q-s2-4-3-0009": "見詳解",
    "q-s2-4-3-0010": r"$50(3+\sqrt3)$",
    "q-s2-4-3-0011": r"$\frac{5(3+\sqrt3)}{3}$",
    "q-s2-4-3-0012": r"$(16,15)$",
    "q-s2-4-3-0013": "見詳解",
    "q-s2-4-3-0014": r"(1)$200$；(2)$5\sqrt3$",
    "q-s2-4-3-0015": r"$150\sqrt3$",
    "q-s2-4-3-0016": r"(1)$100\sqrt{30}$；(2)$300\sqrt{10}$",
    "q-s2-4-3-0017": r"$150(\sqrt6-\sqrt2)$",
    "q-s2-4-3-0018": r"$50\sqrt6$",
    "q-s2-4-3-0019": r"$300\sqrt6$",
    "q-s2-4-3-0020": r"$300$",
    "q-s2-4-3-0021": r"$50$",
    "q-s2-4-3-0022": r"$\frac{a}{\sqrt{\cot^2\alpha+\cot^2\beta}}$",
    "q-s2-4-3-0023": r"$500\sqrt2$",
    "q-s2-4-3-0024": r"$50\sqrt6$",
    "q-s2-4-3-0025": r"$125$",
    "q-s2-4-3-0026": r"$200(2-\sqrt3)$",
    "q-s2-4-3-0027": r"$100(2+\sqrt3)$",
    "q-s2-4-3-0028": r"$100\sqrt2$",
    "q-s2-4-3-0029": r"$50\sqrt2$",
    "q-s2-4-3-0030": r"$200(\sqrt3+1)$",
    "q-s2-4-3-0031": r"每小時$6(\sqrt3+1)$公里",
    "q-s2-4-3-0032": r"$60(3-\sqrt3)$",
    "q-s2-4-3-0033": r"$10$",
    "q-s2-4-3-0034": r"$\frac{10\sqrt{21}}{7}$",
    "q-s2-4-3-0035": r"$\sqrt{21}$",
    "q-s2-4-3-0036": "下午5時進入暴風圈，下午7時脫離",
    "q-s2-4-3-0037": "8小時後進入暴風圈，滯留4小時",
    "q-s2-4-3-0038": r"$100\sqrt7$",
    "q-s2-4-3-0039": r"$100$",
    "q-s2-4-3-0040": r"$1000$",
    "q-s2-4-3-0041": r"$300$",
    "q-s2-4-3-0042": r"$300\sqrt2$",
    "q-s2-4-3-0043": r"$200\sqrt6$",
    "q-s2-4-3-0044": r"$200\sqrt{15}$",
    "q-s2-4-3-0045": r"(1)$150\sqrt6$；(2)$100\sqrt{15}$",
    "q-s2-4-3-0046": r"(1)$250$；(2)$250(2-\sqrt3)$",
    "q-s2-4-3-0047": r"(1)$20(\sqrt3-1)$；(2)$20\sqrt{5-2\sqrt3}$",
    "q-s2-4-3-0048": r"$15\sqrt{4-\sqrt3}$",
    "q-s2-4-3-0049": r"約$301.4$",
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
