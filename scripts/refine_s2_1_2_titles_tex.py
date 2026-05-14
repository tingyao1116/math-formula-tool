from __future__ import annotations

import json
import re
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-1-2/questions.json")
EXTRACTED_DIR = Path(r"program-db/imports/packs/s2-1-2/extracted")

PROTECT_RE = re.compile(r"(\$[^$]*\$|\[圖:[^\]]+\])")
ALLOWED_CHUNK_RE = re.compile(r"[A-Za-z0-9_{}^\\+\-−×÷*/=<>≤≥().,:;\[\]|〈〉〈〉π…∈ℕ√·]+")
FRAGMENTED_MATH_RUN_RE = re.compile(r"((?:\$[^$]*\$|[A-Za-z0-9_{}^\\+\-−×÷*/=<>≤≥().,:;|〈〉〈〉π…∈ℕ√· ]+)+)")

QUESTION_TEXT_OVERRIDES: dict[str, str] = {
    "q-s2-1-2-0001": r"有一個$51$項的等差數列$a_{1},a_{2},a_{3},\dots,a_{51}$，其和為$0$，且$a_{31}=31$，則下列選項中哪些正確？ (1) $a_{1}+a_{51}=0$ (2) $a_{2}+a_{50}<0$ (3) $a_{3}+a_{49}>0$ (4) $a_{1}<0$ (5) $a_{21}=21$。",
    "q-s2-1-2-0003": r"已知一等差數列共有$59$項，滿足公差$d>0$，且$a_{29}+a_{30}+a_{31}=0$，選出正確的選項： (1) $a_{59}>0$ (2) $a_{1}<0$ (3) $a_{30}=0$ (4) $\sum_{k=1}^{58} a_{k}>0$ (5) $a_{18}+a_{19}+a_{20}=0$。",
    "q-s2-1-2-0004": r"設$\langle a_{n} \rangle$是一個有$51$項的等差數列，已知其和$S>0$，且$a_{41}<0$，則下列何者為正數？ (1) $a_{1}+a_{51}$ (2) $a_{11}+a_{41}$ (3) $a_{10}$ (4) $a_{26}$ (5) $d$。",
    "q-s2-1-2-0005": r"設$\langle a_{n} \rangle$為等差數列，第$n$項記為$a_{n}$，公差記為$d$，已知$a_{10}=15$，$a_{40}=5$，下列何者正確？ (1) $a_{1}=18$ (2) $d=-\frac{1}{3}$ (3) 自第$54$項開始為負 (4) 前$n$項總和為最大時，則$n=54$或$55$ (5) 前$n$項總和為$150$時，則$n=9$。",
    "q-s2-1-2-0006": r"已知一等差數列$\langle a_{n} \rangle$之前兩項和為$17$，最後兩項和為$45$，總和$S_{n}$為$403$，求此數列的項數。",
    "q-s2-1-2-0007": r"設兩等差數列，其首$n$項和的比為$(7n+2):(n+3)$，求此兩級數第$5$項的比。",
    "q-s2-1-2-0010": r"設$\langle a_{n} \rangle$為等差數列，第$n$項記為$a_{n}$，公差記為$d$，已知$a_{10}=15$，$a_{40}=5$，下列何者正確？ (1) $a_{1}=18$ (2) $d=-\frac{1}{3}$ (3) 自第$54$項開始為負。 (4) 前$n$項總和為最大時，則$n=54$或$55$ (5) 前$n$項總和為$150$時，則$n=9$。",
    "q-s2-1-2-0019": r"設$\langle a_{n} \rangle=\langle a_{1},a_{2},70,a_{4},a_{5},a_{6},a_{7},a_{8},a_{9},-7,\dots \rangle$為一等差數列，求：(1) 第$30$項為______。 (2) 此等差數列前$n$項總和為$S_{n}$，則$n=$______時，$S_{n}$有最大值；又此時總和的最大值為______。",
    "q-s2-1-2-0020": r"(1) $\langle a_{n} \rangle$為一個等差數列，$a_{10}=23$，$a_{25}=-22$，則$a_{n}=$______。 (2) 接上題，若$S_{n}=a_{1}+a_{2}+a_{3}+\dots+a_{n}$為最大時，$n$之值為______。",
    "q-s2-1-2-0022": r"有二等差數列$\langle a_{n} \rangle=\langle 3,8,13,18,\dots,373 \rangle$，$\langle b_{n} \rangle=\langle 2,9,16,23,\dots,373 \rangle$。由這兩組數列的所有共同項依序排列得另一數列$\langle c_{n} \rangle$共有$k$項，求 (1) $c_{1}$之值。 (2) $c_{1}+c_{2}+\dots+c_{k}$之和。",
    "q-s2-1-2-0023": r"設有兩個等差數列：$\langle a_{n} \rangle=\langle 1,4,7,10,\dots,1000 \rangle$；$\langle b_{n} \rangle=\langle 11,21,\dots,1001 \rangle$，今從$\langle a_{n} \rangle$與$\langle b_{n} \rangle$二數列中取出相同的項形成一個新數列$\langle c_{n} \rangle$，試求此數列的和。",
    "q-s2-1-2-0024": r"$\langle a_{n} \rangle$為一數列，已知$S_{n}=a_{1}+a_{2}+a_{3}+\dots+a_{n}=n^2+3$，$\forall n\in N$，則$a_{n}=$______。",
    "q-s2-1-2-0025": r"設數列$\langle a_{n} \rangle$之前$n$項和$S_{n}=\frac{n}{2n+1}$，則$a_{n}=$______。",
    "q-s2-1-2-0035": r"(1) 設$z$為複數，若$z$的虛部是$1$，$\frac{1}{z}$的實部是$\frac{1}{2}$，則$z=$______。 (2) 承(1)，則等比級數$1+z+z^2+\dots+z^{11}$之和為______。",
    "q-s2-1-2-0038": r"$i=\sqrt{-1}$，求$1+2i+3i^2+4i^3+\dots+100i^{99}$之和為______。",
    "q-s2-1-2-0042": r"一隻螞蟻在坐標平面上由原點出發，如圖所示。牠第一次向右移動$1$單位，到達點$P_{1}(1,0)$，第二次向上移動$\frac{1}{2}$單位，到達點$P_{2}(1,\frac{1}{2})$，而後依照先向右再向上的方式移動，而且每次移動的距離是前一次的一半，如此依序移動到點$P_{3},P_{4},P_{5},\dots$。設正整數$n$，$P_{n}$坐標$(x_{n},y_{n})$，求點$P_{6}$的坐標為______。 [圖:program-db/assets/question-media/s2-1-2/image8.png]",
    "q-s2-1-2-0048": r"圓$C_{1}$內部有四個等圓$C_{2}$彼此外切，且均與圓$C_{1}$內切，圓$C_{2}$內部有四個等圓$C_{3}$彼此外切，且均與圓$C_{2}$內切，依此類推可作出$C_{4},C_{5},C_{6},\dots$，若圓$C_{1}$之半徑為$2$，且圓$C_{k}$之面積為$a_{k}$，則 (1) $C_{2}$的半徑為$2(\sqrt{2}-1)$ (2) $a_{2}=2a_{1}$ (3) $a_{2}=4a_{1}$ (4) $\sum_{k=1}^{\infty} a_{k}=(\sqrt{2}+1)\pi$ (5) $\sum_{k=1}^{\infty} a_{k}=2(\sqrt{2}+1)\pi$。 [圖:program-db/assets/question-media/s2-1-2/image17.png] [圖:program-db/assets/question-media/s2-1-2/image18.png] [圖:program-db/assets/question-media/s2-1-2/image19.png]",
    "q-s2-1-2-0058": r"已知數列$\langle a_{n} \rangle$定義為$a_{1}=3,\ a_{n+1}=a_{n}+2n$（$n$為正整數），求$a_{100}$。",
    "q-s2-1-2-0068": r"由等差級數公式知$1+2+3+\cdots+n=\frac{n(n+1)}{2}$，其中$n$為正整數。",
    "q-s2-1-2-0069": r"試證：$1\cdot 2+3\cdot 4+5\cdot 6+\cdots+(2n-1)(2n)=\frac{n(n+1)(4n-1)}{3}$。",
    "q-s2-1-2-0070": r"證明：對於所有的正整數$n$，$1^2-2^2+3^2-4^2+\cdots+(2n-1)^2-(2n)^2=-n(2n+1)$。",
    "q-s2-1-2-0071": r"試證：$1^2-2^2+3^2-4^2+\cdots+(2n-1)^2-(2n)^2=-n(2n+1)$。",
    "q-s2-1-2-0072": r"試證：對任意正整數$n$，$1^2\times 2^1+2^2\times 2^2+\cdots+n^2\times 2^n=(n^2-2n+3)2^{n+1}-6$。",
    "q-s2-1-2-0073": r"一數列$\langle a_{n} \rangle$的遞迴定義式為$a_{1}=1$，$a_{n+1}=a_{n}+2n+1$，求一般項$a_{n}$。",
}

ANSWER_TEXT_OVERRIDES: dict[str, str] = {}

EXPLANATION_TEXT_OVERRIDES: dict[str, str] = {}


def load_markers(expected_count: int) -> list[str]:
    md_path = next(EXTRACTED_DIR.glob("*.md"))
    markers: list[str] = []
    for line in md_path.read_text(encoding="utf-8").splitlines():
        text = line.strip()
        if "範例" not in text and "隨堂練習" not in text:
            continue
        if "<strong>" in text and "</strong>" in text:
            start = text.index("<strong>") + len("<strong>")
            end = text.index("</strong>", start)
            markers.append(text[start:end])
        elif "**" in text:
            parts = text.split("**")
            if len(parts) >= 3:
                markers.append(parts[1])
    if len(markers) > expected_count:
        markers = markers[:expected_count]
    if len(markers) != expected_count:
        raise RuntimeError(f"Marker count mismatch: {len(markers)} != {expected_count}")
    return markers


def normalize_existing_math(token: str) -> str:
    inner = token[1:-1].strip()
    inner = inner.replace("〈", r"\langle ").replace("〉", r" \rangle")
    inner = inner.replace("〈", r"\langle ").replace("〉", r" \rangle")
    inner = re.sub(r"\s+", " ", inner).strip()
    inner = re.sub(
        r"^\\langle\s*\$?(.*?)\$?\s*\\rangle$",
        lambda m: r"\langle " + m.group(1).strip() + r" \rangle",
        inner,
    )
    return f"${inner}$"


def clean_math_chunk(chunk: str) -> str:
    chunk = chunk.strip()
    chunk = chunk.replace("〈", r"\langle ").replace("〉", r" \rangle")
    chunk = chunk.replace("〈", r"\langle ").replace("〉", r" \rangle")
    chunk = chunk.replace("×", r" \times ").replace("÷", r" \div ")
    chunk = chunk.replace("⋅", r"\cdot ").replace("·", r"\cdot ")
    chunk = re.sub(r"\s+", " ", chunk).strip()
    return chunk


def should_wrap_math(raw: str) -> bool:
    if not raw:
        return False
    if raw in {"N", "Q.E.D."}:
        return True
    if re.fullmatch(r"\(?\d+\)?", raw):
        return False
    return bool(
        re.search(r"[A-Za-z\\πℕ√]", raw)
        or any(op in raw for op in ("^", "_", "×", "÷", "≤", "≥", "∈", "=", "<", ">", "(", ")", "[", "]"))
    )


def wrap_plain_math(text: str) -> str:
    out: list[str] = []
    pos = 0
    for match in ALLOWED_CHUNK_RE.finditer(text):
        out.append(text[pos:match.start()])
        chunk = match.group(0)
        raw = chunk.strip()
        if should_wrap_math(raw):
            out.append(f"${clean_math_chunk(raw)}$")
        else:
            out.append(chunk)
        pos = match.end()
    out.append(text[pos:])
    return "".join(out)


def collapse_fragmented_math_runs(text: str) -> str:
    placeholders: dict[str, str] = {}

    def stash_image(match: re.Match[str]) -> str:
        key = f"__IMG_{len(placeholders)}__"
        placeholders[key] = match.group(0)
        return key

    source = re.sub(r"\[圖:[^\]]+\]", stash_image, text)

    def repl(match: re.Match[str]) -> str:
        raw = match.group(1)
        if raw.count("$") < 2:
            return raw
        if not re.search(r"[A-Za-z\\πℕ√_^=<>≤≥+\-−×÷*/]", raw):
            return raw
        inner = raw.replace("$", "")
        inner = clean_math_chunk(inner)
        inner = re.sub(r"\s*([=+\-*/<>≤≥])\s*", r"\1", inner)
        inner = re.sub(r"\(\s+", "(", inner)
        inner = re.sub(r"\s+\)", ")", inner)
        inner = inner.replace("−", "-")
        return f"${inner}$"

    collapsed = FRAGMENTED_MATH_RUN_RE.sub(repl, source)
    for key, value in placeholders.items():
        collapsed = collapsed.replace(key, value)
    return collapsed


def normalize_rich_text(text: str) -> str:
    text = text.replace("\r", " ").replace("\n", " ")
    text = re.sub(
        r"(?<!\$)([〈〈]\s*[^〉〉]+\s*[〉〉])(?!\$)",
        lambda m: f"${clean_math_chunk(m.group(1))}$",
        text,
    )

    parts: list[str] = []
    pos = 0
    for match in PROTECT_RE.finditer(text):
        plain = text[pos:match.start()]
        if plain:
            parts.append(wrap_plain_math(plain))
        token = match.group(1)
        parts.append(normalize_existing_math(token) if token.startswith("$") else token)
        pos = match.end()
    tail = text[pos:]
    if tail:
        parts.append(wrap_plain_math(tail))

    text = "".join(parts)
    text = collapse_fragmented_math_runs(text)
    text = re.sub(r"\$\s+", "$", text)
    text = re.sub(r"\s+\$", "$", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def strip_images(text: str) -> str:
    return re.sub(r"\[圖:[^\]]+\]", "", text)


def simplify_math_for_title(match: re.Match[str]) -> str:
    inner = match.group(0)[1:-1].strip()
    compact = inner.replace(" ", "")
    if re.fullmatch(r"[\d.]+", compact):
        return compact
    if compact in {"d", "r", "z", "x", "y", "a", "b"}:
        return compact
    if compact in {"S", "S_n", "S_{n}"}:
        return "前n項和"
    if compact in {"a_n", "a_{n}"}:
        return "第n項"
    if compact in {"a_1", "a_{1}"}:
        return "首項"
    if r"\langle" in inner and r"\rangle" in inner:
        return "數列"
    if compact.startswith("P_{") or compact.startswith("P_"):
        return "點"
    if compact.startswith("C_{") or compact.startswith("C_"):
        return "圓"
    if compact.startswith("T_{") or compact.startswith("T_"):
        return "圖形"
    return ""


def shorten_title_body(text: str) -> str:
    text = strip_images(text)
    text = text.replace("\r", " ").replace("\n", " ")
    text = re.sub(r"\$[^$]*\$", simplify_math_for_title, text)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"[，,]{2,}", "，", text)
    text = text.replace("， ，", "，")
    text = text.replace("： ：", "：")
    text = re.sub(r"^[（(]\d+[）)]\s*", "", text).strip()
    text = re.sub(r"^\d+\.", "", text).strip()
    for delimiter in ("：", "﹕", "。", "？"):
        if delimiter in text:
            head = text.split(delimiter, 1)[0].strip()
            if head:
                text = head
                break
    for delimiter in ("(1)", "（1）"):
        if delimiter in text:
            head = text.split(delimiter, 1)[0].rstrip("：﹕: ")
            if head:
                text = head
                break
    text = text.rstrip("，。；：, ")
    if len(text) > 26:
        return text[:26].rstrip("，。；： ")
    return text.rstrip("，。；： ")


def main() -> None:
    data = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = data["questions"] if isinstance(data, dict) else data
    markers = load_markers(len(questions))

    for index, question in enumerate(questions):
        qid = question["id"]
        question_text = normalize_rich_text(str(question.get("question_text", "")))
        question_text = QUESTION_TEXT_OVERRIDES.get(question["id"], question_text)
        question["question_text"] = question_text
        marker = markers[index]
        title_body = shorten_title_body(question_text)
        question["title"] = f"{marker}：{title_body}"
        answer_text = normalize_rich_text(str(question.get("answer_text", "")))
        explanation_text = normalize_rich_text(str(question.get("explanation_text", "")))
        question["answer_text"] = ANSWER_TEXT_OVERRIDES.get(qid, answer_text)
        question["explanation_text"] = EXPLANATION_TEXT_OVERRIDES.get(qid, explanation_text)

    PACK_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
