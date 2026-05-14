import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s3-1-2/questions.json")

UPDATES = {
    "q-s3-1-2-0001": r"(1)由$y=\sin x$向上平移$1$單位；(2)由$y=\sin x$向右平移$\frac{\pi}{6}$；(3)振幅$2$，週期$6\pi$；(4)由$y=\sin 2x$向左平移$\frac{\pi}{6}$，週期$\pi$",
    "q-s3-1-2-0002": r"(1)$\frac{\pi}{2}$；(2)$\pi$；(3)$\frac{2\pi}{3}$；(4)$2\pi$",
    "q-s3-1-2-0003": r"(1)週期$2\pi$，最大值$2$，最小值$-2$；(2)週期$4\pi$，最大值$1$，最小值$-1$",
    "q-s3-1-2-0004": r"(1)$2\pi$；(2)$2\pi$；(3)$\frac{2\pi}{3}$；(4)$\pi$；(5)$\frac{\pi}{2}$",
    "q-s3-1-2-0005": "(E)",
    "q-s3-1-2-0006": "(B)(C)(E)",
    "q-s3-1-2-0007": "(A)(B)(C)(E)",
    "q-s3-1-2-0008": "(B)(C)(E)",
    "q-s3-1-2-0009": "(B)(C)(D)",
    "q-s3-1-2-0010": r"(1)$\frac{2\pi}{3}$；(2)$2\pi$；(3)$2\pi$；(4)$6\pi$",
    "q-s3-1-2-0011": "(1)(3)(4)",
    "q-s3-1-2-0012": "(2)(3)(5)",
    "q-s3-1-2-0013": "(B)(C)(E)",
    "q-s3-1-2-0014": r"(1)$2$；(2)$\pi$",
    "q-s3-1-2-0015": r"$y=6\sin\left(6x+\frac{\pi}{6}\right)$",
    "q-s3-1-2-0016": "(A)",
    "q-s3-1-2-0017": "(1)(2)(3)(5)",
    "q-s3-1-2-0018": "(1)(3)(5)",
    "q-s3-1-2-0019": r"$\frac{g}{\pi^2}$",
    "q-s3-1-2-0020": r"(1)$10\sqrt3$；(2)$\frac{1}{50}$秒",
    "q-s3-1-2-0021": "3個",
    "q-s3-1-2-0022": "7個",
    "q-s3-1-2-0023": "3個",
    "q-s3-1-2-0024": "6個",
    "q-s3-1-2-0025": r"(1)見詳解；(2)3個",
    "q-s3-1-2-0026": "3個",
    "q-s3-1-2-0027": "3個",
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
