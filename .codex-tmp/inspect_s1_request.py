from pathlib import Path
import json
import re
import sys


sys.stdout.reconfigure(encoding="utf-8", errors="replace")


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (
    Path.home()
    / "Desktop"
    / "\u570b\u5c0f\u6578\u8cc7\u6574\u7406"
    / "S1-1\u4e0b\u6578\u8207\u5f0f\u4e2d\u7b49\u96e3\u5ea6\u984c\u76ee\u5377(\u8a73\u89e3)_231102034302.md"
)


def question_spans(text):
    starts = list(re.finditer(r"(?m)^\s*(\d+)\.", text))
    return [
        (
            m.group(1),
            text[m.start() : starts[i + 1].start() if i + 1 < len(starts) else len(text)],
        )
        for i, m in enumerate(starts)
    ]


def print_source_stats():
    text = SOURCE.read_text(encoding="utf-8-sig")
    spans = question_spans(text)
    print("SOURCE", SOURCE)
    print("exists", SOURCE.exists(), "chars", len(text), "questions", len(spans))
    print("answers", text.count("\u7b54\u6848"), "solutions", text.count("\u89e3\u6790"))
    keys = [
        "log",
        "\\log",
        "\\sqrt",
        "sqrt",
        "\\frac",
        "frac",
        "<sup>",
        "^",
        "|",
        "\\left|",
        "10^",
        "2^",
        "\u5c0d\u6578",
        "\u5e38\u7528\u5c0d\u6578",
        "\u79d1\u5b78\u8a18\u865f",
        "\u9996\u6578",
        "\u6307\u6578",
        "\u65b9\u7a0b",
        "\u4e0d\u7b49\u5f0f",
        "\u7d55\u5c0d\u503c",
        "\u56e0\u5f0f",
        "\u5c55\u958b",
        "\u6700\u5927",
        "\u6700\u5c0f",
        "\u6bd4\u8f03",
        "\u5927\u5c0f",
        "\u7d30\u83cc",
        "\u4eba\u53e3",
    ]
    for key in keys:
        hits = [n for n, s in spans if key in s]
        if hits:
            print("KEY", key.encode("unicode_escape").decode("ascii"), len(hits), hits[:20])
    print("SAMPLES")
    for n, s in spans[:40]:
        head = " ".join(s.split())[:220]
        print(n, head)


def print_current_s1():
    js_lines = (ROOT / "data/practice-generators/s1.js").read_text(encoding="utf-8-sig").splitlines()
    for a, b in [(1, 220), (1760, 2070), (2320, 2485), (7740, 8110)]:
        print("RANGE", a, b)
        for i in range(a - 1, min(b, len(js_lines))):
            print(f"{i + 1}: {js_lines[i]}")
    db = json.loads((ROOT / "program-db/database/practice-db.json").read_text(encoding="utf-8-sig"))
    print("PRACTICES")
    practices = [p for p in db["practices"] if p.get("id", "").startswith("practice-s1-1-")]
    for p in practices:
        print(p["id"], "|", p.get("title"), "|", p.get("generatorKey"), "|", p.get("chapterCode"))
    print("BINDINGS")
    targets = {f"s1-1-{i}" for i in range(1, 6)}
    for b in db["practiceBindings"]:
        if b.get("targetId") in targets:
            print(b.get("targetId"), b.get("practiceId"), b.get("order"), b.get("source"))


if __name__ == "__main__":
    print_source_stats()
    print_current_s1()
