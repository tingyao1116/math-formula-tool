from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKS_DIR = ROOT / "program-db" / "imports" / "packs"

PLACEHOLDERS = {"", "(尚未提供)", "（尚未提供）"}
PROOF_CUES = ("證明", "試證", "求證", "prove")
GRAPH_CUES = ("作圖", "圖示", "畫出", "描點", "圖略")
CONCLUSION_CUES = (
    "故",
    "所以",
    "因此",
    "解得",
    "得",
    "故選",
    "最大值",
    "最小值",
    "範圍為",
    "方程式為",
    "答案為",
)

MANUAL_ANSWERS = {
    "q-s2-3-2-0001": "圖略",
    "q-s3-1-1-0022": r"$\frac{8\pi}{5}$",
    "q-s3-1-2-0026": "3個",
    "q-s3-1-2-0027": "3個",
    "q-s3-1-3-0034": r"$\sqrt{3}$",
    "q-s3-1-3-0058": r"$\frac{1}{16}$",
    "q-s4-1-4-0005": r"(1)$\frac{49}{2}$；(2)$\frac{7}{\sqrt{2}}$",
    "q-s5-10-0013": r"$\frac{32}{3}$",
    "q-s5-11-0026": r"$8\pi$",
    "q-s5-9-0030": "(C)(E)",
    "q-s5-9-0034": r"$a=-\frac{3}{2},\ b=6,\ c=3$",
    "q-s5-9-0071": r"$(a,b,c,d)=(1,3,-24,5)$",
    "q-s5-9-0092": r"(1)$-3<a<1$；(2)$-1<a<1$；(3)$-3<a<-1$；(4)$a>1$或$a<-3$",
    "q-s5-9-0093": r"$a>7$或$a<-20$",
    "q-s5-9-0094": r"$-7<a<0$",
    "q-s5-9-0095": r"$0<a<5$",
    "q-s5-9-0096": r"$-5<a<27$",
    "q-s5-9-0099": r"在$x=-2$處有相對極大值$17$，在$x=\frac{2}{3}$處有相對極小值$-\frac{53}{27}$；反曲點為$\left(-\frac{2}{3},\frac{203}{27}\right)$；遞增區間為$(-\infty,-2)$、$(\frac{2}{3},\infty)$，遞減區間為$(-2,\frac{2}{3})$；$x<-\frac{2}{3}$時凹向下，$x>-\frac{2}{3}$時凹向上。",
    "q-s5-9-0101": r"最大值為$2$，最小值為$-2$；在$x=0$處有相對極小值$0$。",
    "q-s5-9-0102": r"在$x=-\frac{3}{2}$處有相對極小值$-\frac{2187}{16}$；反曲點為$(0,-81)$、$(3,0)$。",
    "q-s5-9-0103": r"在$x=0$處有相對極大值$1$，在$x=\pm1$處有相對極小值$0$；反曲點為$\left(\pm\frac{\sqrt{3}}{3},\frac{4}{9}\right)$。",
    "q-s5-9-0105": r"$a<0,\ b<0,\ c<0,\ d>0,\ b^2-3ac>0$",
}


def normalize_text(text: str) -> str:
    value = str(text or "")
    value = value.replace("\r\n", "\n").replace("\r", "\n")
    value = re.sub(r"\[[圖表][^\]]*\]", "", value)
    value = re.sub(r"<!--.*?-->", "", value, flags=re.S)
    value = re.sub(r"\n{2,}", "\n", value)
    return value.strip()


def compact_text(text: str) -> str:
    value = normalize_text(text)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def split_sentences(text: str) -> list[str]:
    normalized = compact_text(text)
    if not normalized:
        return []
    parts = re.split(r"(?<=[。；!?])\s*|\s{2,}", normalized)
    return [p.strip(" 。；;") for p in parts if p.strip(" 。；;")]


def extract_numbered_prefix(text: str) -> str:
    normalized = compact_text(text)
    if not normalized:
        return ""
    marker = re.search(r"(【解析】|【解】|解[:：]|說明[:：]|因此|所以|故)", normalized)
    if marker and 0 < marker.start() < 220:
        prefix = normalized[: marker.start()].strip(" ：:；;，,")
        if prefix and any(token in prefix for token in ("(1)", "(2)", "①", "②", "③")):
            return prefix
    return ""


def extract_answer(question: str, explanation: str) -> str:
    q = compact_text(question)
    exp = normalize_text(explanation)
    compact_exp = compact_text(explanation)

    if not compact_exp:
        return "見詳解" if any(cue in q for cue in PROOF_CUES) else ""

    if any(cue in q for cue in PROOF_CUES):
        return "見詳解"

    if any(cue in q for cue in GRAPH_CUES) and not re.search(r"\d|x|y|a|b", q):
        return "圖略"

    numbered = extract_numbered_prefix(exp)
    if numbered:
        return numbered

    sentences = split_sentences(exp)
    if not sentences:
        return compact_exp[:180]

    for sentence in reversed(sentences):
        if any(cue in sentence for cue in CONCLUSION_CUES) and len(sentence) <= 220:
            return sentence

    if any(tok in q for tok in ("(1)", "(2)", "(3)", "①", "②", "③")):
        combo = "；".join(sentences[:2]).strip("；")
        if combo and len(combo) <= 220:
            return combo

    last = sentences[-1]
    return last if len(last) <= 220 else compact_exp[:220]


def iter_target_packs() -> list[Path]:
    packs: list[Path] = []
    for pack_dir in sorted(PACKS_DIR.iterdir()):
        if not pack_dir.is_dir() or not pack_dir.name.startswith("s"):
            continue
        questions_path = pack_dir / "questions.json"
        if not questions_path.exists():
            continue
        payload = json.loads(questions_path.read_text(encoding="utf-8"))
        questions = payload.get("questions", [])
        if any(str(row.get("answer_text", "")).strip() in PLACEHOLDERS for row in questions):
            packs.append(pack_dir)
    return packs


def process_pack(pack_dir: Path) -> tuple[int, int, int]:
    path = pack_dir / "questions.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    questions = payload.get("questions", [])
    updated = 0
    blanks_remaining = 0

    for row in questions:
        answer = str(row.get("answer_text", "")).strip()
        if answer not in PLACEHOLDERS:
            continue
        qid = str(row.get("id", ""))
        row["answer_text"] = MANUAL_ANSWERS.get(
            qid,
            extract_answer(
                str(row.get("question_text", "")),
                str(row.get("explanation_text", "")),
            ),
        )
        updated += 1
        if not str(row.get("answer_text", "")).strip():
            blanks_remaining += 1

    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(questions), updated, blanks_remaining


def main() -> None:
    for pack_dir in iter_target_packs():
        total, updated, blanks_remaining = process_pack(pack_dir)
        print(f"{pack_dir.name}: total={total}, updated={updated}, blanks_remaining={blanks_remaining}")


if __name__ == "__main__":
    main()
