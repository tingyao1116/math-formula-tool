from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKS_DIR = ROOT / "program-db" / "imports" / "packs"

TARGETS = {
    "s2-1-1": "s2-1-1",
    "s2-1-2": "s2-1-2",
    "s2-2-1": "s2-2-1",
    "s2-2-2": "s2-2-2",
    "s2-2-3": "s2-2-3",
    "s2-2-4": "s2-2-4",
}


def strip_tags(text: str) -> str:
    value = str(text or "")
    value = value.replace("\r\n", "\n").replace("\r", "\n")
    value = value.replace("【解析】", "").replace("【解】", "")
    value = re.sub(r"\[圖:[^\]]+\]", "", value)
    value = re.sub(r"<!--.*?-->", "", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def extract_answer(question: str, explanation: str) -> str:
    q = str(question or "").strip()
    exp_raw = str(explanation or "")
    exp = strip_tags(exp_raw)

    if not exp:
        if any(k in q for k in ["證明", "描繪", "作圖", "繪出", "圖示"]):
            return "見詳解"
        return "見詳解"

    if any(k in q for k in ["證明", "請證", "利用數學歸納法", "以面積觀點證明"]):
        return "見詳解"

    if any(k in q for k in ["描繪", "作圖", "繪出", "圖示"]) and not any(
        k in q for k in ["面積", "最大值", "最小值", "解為", "範圍"]
    ):
        return "圖略"

    # If the explanation starts with numbered results before the derivation, keep that prefix.
    if re.match(r"^[\(（①⑴1]", exp):
        marker = re.search(r"(?:∵|因為|由題意|由|設|令|依題意|先設|首先)", exp)
        if marker and 0 < marker.start() < 220:
            prefix = exp[: marker.start()].strip(" ，；;。")
            if prefix:
                return prefix

    sentences = [s.strip(" ；;。") for s in exp.split("。") if s.strip()]
    if not sentences:
        return exp[:180]

    # Prefer an explicit concluding sentence.
    cues = ["故選", "故", "所以", "因此", "解得", "得", "即可", "即", "範圍為", "最大值", "最小值", "方程式為"]
    for s in reversed(sentences):
        if any(c in s for c in cues) and len(s) <= 180:
            return s

    # For multi-part questions, keep the first 1-2 concise sentences if they are short enough.
    if any(tok in q for tok in ["(1)", "（1）", "①", "(2)", "（2）"]):
        combo = "；".join(sentences[:2])
        if combo and len(combo) <= 220:
            return combo

    # Fallback to the last sentence or the first 180 chars.
    last = sentences[-1]
    return last if len(last) <= 180 else exp[:180]


def process_pack(pack_name: str) -> tuple[int, int]:
    path = PACKS_DIR / pack_name / "questions.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    questions = payload.get("questions", [])
    if not isinstance(questions, list):
        raise ValueError(f"{path} questions is not a list")

    updated = 0
    blanks = 0
    for row in questions:
        answer = str(row.get("answer_text", "")).strip()
        if answer and answer != "(尚未提供)":
            continue
        row["answer_text"] = extract_answer(
            str(row.get("question_text", "")),
            str(row.get("explanation_text", "")),
        )
        updated += 1
        if not str(row.get("answer_text", "")).strip():
            blanks += 1

    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return updated, blanks


def main() -> None:
    for pack_name in TARGETS:
        updated, blanks = process_pack(pack_name)
        print(f"{pack_name}: updated={updated}, blanks_remaining={blanks}")


if __name__ == "__main__":
    main()
