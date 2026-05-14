import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s3-1-1/questions.json")

UPDATES = {
    "q-s3-1-1-0001": r"(1)①$225^\circ$；②$105^\circ$；③$-390^\circ$；④約$229.2^\circ$；(2)①$\frac{3\pi}{4}$；②$\frac{5\pi}{6}$；③$-\frac{7\pi}{6}$；④$\frac{7\pi}{18}$",
    "q-s3-1-1-0002": "(4)",
    "q-s3-1-1-0003": "(2)",
    "q-s3-1-1-0004": "(3)(5)",
    "q-s3-1-1-0005": "(1)(3)(4)",
    "q-s3-1-1-0006": "(3)",
    "q-s3-1-1-0007": r"(1)$130^\circ$；(2)$\frac{13\pi}{18}$",
    "q-s3-1-1-0008": r"(1)$70^\circ$；(2)$\frac{200\pi}{3}$",
    "q-s3-1-1-0009": r"(1)$48\pi$；(2)$\frac{25\pi}{16}$",
    "q-s3-1-1-0010": r"$\frac{16\pi}{3}+8\sqrt3$",
    "q-s3-1-1-0011": r"$4\pi+6\sqrt3$",
    "q-s3-1-1-0012": r"(1)$12$；(2)$\frac{\pi}{4}$",
    "q-s3-1-1-0013": r"半徑$\frac{3}{2}$，圓心角$2$",
    "q-s3-1-1-0014": r"最小周長$40$，半徑$10$",
    "q-s3-1-1-0015": r"(1)$10$；(2)$100$；(3)$2$",
    "q-s3-1-1-0016": "見詳解",
    "q-s3-1-1-0017": r"(1)$8\sqrt2$；(2)$2$",
    "q-s3-1-1-0018": r"最大面積$\frac{k^2}{16}$，半徑$\frac{k}{4}$",
    "q-s3-1-1-0019": r"$\alpha=2$，$r_0=\sqrt{k}$，$l=4\sqrt{k}$",
    "q-s3-1-1-0020": r"約$363$",
    "q-s3-1-1-0021": r"$\frac{6\pi}{5}$",
    "q-s3-1-1-0022": r"$\frac{8\pi}{5}$",
    "q-s3-1-1-0023": r"$\frac{8\pi}{5}$",
    "q-s3-1-1-0024": r"$5\sqrt7$",
    "q-s3-1-1-0025": r"(1)$2$；(2)$(\sqrt3+1)\sqrt{2-\sqrt2}$",
    "q-s3-1-1-0026": r"(1)$27\pi$；(2)$36\pi$；(3)$18\sqrt2\pi$",
    "q-s3-1-1-0027": r"$16\pi$",
    "q-s3-1-1-0028": r"(1)$3$；(2)$4\pi$；(3)$6\pi$",
    "q-s3-1-1-0029": r"$\frac{(4-\pi)a^2}{2}$",
    "q-s3-1-1-0030": r"$\frac{25\sqrt3}{4}-\frac{\pi}{6}$",
    "q-s3-1-1-0031": r"$\frac{(\pi-2)a^2}{4}$",
    "q-s3-1-1-0032": r"(1)$12\pi-9\sqrt3$；(2)$9\sqrt3-3\pi$",
    "q-s3-1-1-0033": r"$\frac{5\pi}{4}-3$",
    "q-s3-1-1-0034": r"(1)$\frac{\pi}{2}-1$；(2)$\frac{\pi}{3}-\frac{\sqrt3}{4}$",
    "q-s3-1-1-0035": r"$4-\sqrt3-\frac{2\pi}{3}$",
    "q-s3-1-1-0036": r"$\frac{(\pi-6+3\sqrt3)a^2}{12}$",
    "q-s3-1-1-0037": "-6",
    "q-s3-1-1-0038": r"(1)$\left(1-\sqrt3+\frac{\pi}{3}\right)a^2$；(2)$(\sqrt3-1)a$",
    "q-s3-1-1-0039": r"(1)約$6302.5$公里；(2)$\frac{2\pi}{45}$",
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
