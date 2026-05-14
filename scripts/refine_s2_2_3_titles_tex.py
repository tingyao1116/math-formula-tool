from __future__ import annotations

import json
import re
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-2-3/questions.json")

PROTECT_RE = re.compile(r"(\$[^$]*\$|\[圖:[^\]]+\])")
ALLOWED_CHUNK_RE = re.compile(r"[A-Za-z0-9_{}^\\+\-−×÷*/=<>≤≥().,:;\[\]|〈〉〈〉π…∈ℕℝ°]+")


QUESTION_TEXT_OVERRIDES: dict[str, str] = {
    "q-s2-2-3-0001": r"試求$(3x-2y)^6$的展開式。",
    "q-s2-2-3-0002": r"寫出$(x-3y)^4$的展開式。",
    "q-s2-2-3-0003": r"多項式$(x+y+z+u)^6$展開式中，下列敘述何者正確？ (1) 同類項合併後共有$84$項 (2) 與$x^3yzu$同型項有$4$項 (3) 與$xyz^2u^2$同型項有$6$項 (4) $x^3y^2z$項的係數為$60$ (5) 係數總和為$4096$。",
    "q-s2-2-3-0004": r"選出答案為$C_3^6$的選項： (1) 從$6$人中選出$3$人參加辯論比賽的方法數 (2) 甲乙丙三人從$4$本不同的書中，每人各選一本的方法數 (3) 將$3$枝相同筆全部分給$4$個人的方法數 (4) 在$(a+b)^7$的展開式中，$a^3b^4$的係數 (5) 方程式$x+y+z+t=3$的非負整數解之個數。",
    "q-s2-2-3-0005": r"試求$(1+2x+3x^2+4x^3+5x^4+6x^5+7x^6)^4$展開式中，$x^2$項的係數。",
    "q-s2-2-3-0009": r"將$(2x-\frac{3}{4x})^9$展開，則 (1) $x^3$項係數。 (2) 常數項。",
    "q-s2-2-3-0010": r"求$(x^2+(y+z))^6$展開式中，$x^4y^2z^2$的係數。",
    "q-s2-2-3-0013": r"若$(102)^{10}$之千位數字為$a$，百位數字為$b$，十位數字為$c$，個位數字為$d$，則： (1) $a=3$ (2) $b=1$ (3) $c=2$ (4) $d=4$ (5) $a+b+c+d=10$。",
    "q-s2-2-3-0014": r"將$7^{20}$乘開，(1) 為______位數（已知$\log 7=0.8451$）。 (2) 最右邊之五位數為______。",
    "q-s2-2-3-0016": r"$(1+x^2)+(1+x^2)^2+(1+x^2)^3+\cdots+(1+x^2)^{20}$的展開式中，$x^6$的係數為______。",
    "q-s2-2-3-0017": r"求$(1+x^2)+(1+x^2)^2+(1+x^2)^3+\cdots+(1+x^2)^8$展開式中$x^4$項的係數。",
    "q-s2-2-3-0018": r"試求$(1+x^2)+2(1+x^2)^2+3(1+x^2)^3+\cdots+15(1+x^2)^{15}$展開式中，$x^4$項的係數。",
    "q-s2-2-3-0019": r"$(1+x^2)+2(1+x^2)^2+\cdots+20(1+x^2)^{20}$之$x^2$係數$=$？",
    "q-s2-2-3-0021": r"求$x^{10}+1$除以$(x-1)^2$的餘式。",
    "q-s2-2-3-0022": r"以$(x-1)^2$除$x^{11}-x+2$，其餘式為______。",
    "q-s2-2-3-0023": r"求$x^{100}+1$除以$(x-1)^2$的餘式。",
    "q-s2-2-3-0024": r"求以$(x-1)^3$除$(x^2-2x+2)^{10}$所得的餘式。",
    "q-s2-2-3-0025": r"求$x^{10}$除以$(x-1)^3$的餘式。",
    "q-s2-2-3-0026": r"$(x+y)^n$的展開式中，(1) 第$10$項與第$13$項之係數相等，則$n=$______。 (2) 若有三連續項的係數比為$2:3:4$，則$n=$______。",
    "q-s2-2-3-0027": r"設$(1+x)^n$展開式中，$x^8,x^9,x^{10}$成等差，則$n=$______（$n\ge 10$）。",
    "q-s2-2-3-0029": r"求$(2x-1)^4(x+2)^5$展開式中，$x^7$項的係數為______。",
    "q-s2-2-3-0030": r"求$(2x-1)^4(x+3)^5$展開式中，$x^7$項之係數為______。",
    "q-s2-2-3-0034": r"$n\in\mathbb{N}$且$C_1^n+2C_2^n+3C_3^n+\cdots+nC_n^n=11264$，求$n=\underline{\qquad}$。",
    "q-s2-2-3-0035": r"$C_0^n+\frac{1}{2}C_1^n+\frac{1}{3}C_2^n+\cdots+\frac{1}{n+1}C_n^n=\frac{127}{n+1}$，則自然數$n=\underline{\qquad}$？",
    "q-s2-2-3-0036": r"滿足不等式$1000<C_1^n+C_2^n+C_3^n+\cdots+C_n^n<1200$的自然數$n$之值是多少？",
    "q-s2-2-3-0037": r"已知$\log 2=0.3010$，$\log 3=0.4771$，試求滿足不等式$1-\frac{1}{3}C_1^n+(-\frac{1}{3})^2C_2^n+(-\frac{1}{3})^3C_3^n+\cdots+(-\frac{1}{3})^nC_n^n<\frac{1}{5000}$最小正整數$n$之值為何？",
    "q-s2-2-3-0038": r"若$2000<C_1^n+C_2^n+C_3^n+\cdots+C_n^n<3000$，則正整數$n$之值$=$______。",
    "q-s2-2-3-0041": r"試求：$C_0^{50}-C_2^{50}+C_4^{50}-C_6^{50}+\cdots+C_{48}^{50}-C_{50}^{50}$之值。",
    "q-s2-2-3-0042": r"利用二項式定理，證明：$49^n+16n-1$（$n\in\mathbb{N}$）為$16$的倍數（Hint：$49=7^2=(8-1)^2$）。",
    "q-s2-2-3-0043": r"試證：$\frac{C_1^n}{C_0^n}+\frac{2C_2^n}{C_1^n}+\frac{3C_3^n}{C_2^n}+\cdots+\frac{nC_n^n}{C_{n-1}^n}=\frac{n(n+1)}{2}$（$n$為正整數）。",
    "q-s2-2-3-0044": r"(1) 試證：$C_1^{n-1}+2C_2^{n-1}+3C_3^{n-1}+\cdots+(n-1)C_{n-1}^{n-1}=(n-1)\times 2^{n-2}$（$n\ge 2,\ n\in\mathbb{N}$）。 (2) 試證：$1^2C_1^n+2^2C_2^n+3^2C_3^n+\cdots+n^2C_n^n=n(n+1)2^{n-2}$（$n\ge 2,\ n\in\mathbb{N}$）。",
    "q-s2-2-3-0045": r"設$n$為自然數，證明：$(C_0^n)^2+(C_1^n)^2+\cdots+(C_n^n)^2=\frac{(2n)!}{(n!)^2}$恆成立。",
    "q-s2-2-3-0046": r"設$n$為自然數且$n\ge 2$，試證：$2^n<\frac{(2n)!}{(n!)^2}<2^{2n}$。",
}


TITLE_OVERRIDES: dict[str, str] = {
    "q-s2-2-3-0001": "範例：二項式定理｜二項展開",
    "q-s2-2-3-0002": "隨堂練習：二項式定理｜二項展開",
    "q-s2-2-3-0003": "範例：二項式定理｜多項式展開判斷",
    "q-s2-2-3-0004": "隨堂練習：二項式定理｜等值選項判斷",
    "q-s2-2-3-0005": "範例：二項式定理｜指定項係數",
    "q-s2-2-3-0010": "範例：二項式定理｜多變數係數",
    "q-s2-2-3-0013": "隨堂練習：二項式定理｜數位判斷",
    "q-s2-2-3-0014": "範例：二項式定理｜位數與末位數",
    "q-s2-2-3-0016": "範例：二項式定理｜和式中的係數",
    "q-s2-2-3-0017": "隨堂練習：二項式定理｜和式係數",
    "q-s2-2-3-0018": "隨堂練習：二項式定理｜加權和式係數",
    "q-s2-2-3-0019": "隨堂練習：二項式定理｜加權和式的$x^2$係數",
    "q-s2-2-3-0021": "範例：餘式定理｜除以$(x-1)^2$",
    "q-s2-2-3-0022": "隨堂練習：餘式定理｜二次餘式",
    "q-s2-2-3-0023": "範例：餘式定理｜高次式餘式",
    "q-s2-2-3-0024": "範例：餘式定理｜三次除式餘式",
    "q-s2-2-3-0025": "隨堂練習：餘式定理｜三次餘式",
    "q-s2-2-3-0026": "範例：二項式定理｜係數關係求$n$",
    "q-s2-2-3-0027": "隨堂練習：二項式定理｜等差係數求$n$",
    "q-s2-2-3-0029": "範例：二項式定理｜乘積式係數",
    "q-s2-2-3-0030": "隨堂練習：二項式定理｜乘積式係數",
    "q-s2-2-3-0034": "範例：二項式定理｜組合和求$n$",
    "q-s2-2-3-0035": "隨堂練習：二項式定理｜分式組合和求$n$",
    "q-s2-2-3-0036": "範例：二項式定理｜組合和範圍",
    "q-s2-2-3-0037": "範例：二項式定理｜對數與二項式估計",
    "q-s2-2-3-0038": "隨堂練習：二項式定理｜組合和不等式",
    "q-s2-2-3-0041": "範例：二項式定理｜交錯組合和",
    "q-s2-2-3-0042": "範例：二項式定理｜整除證明",
    "q-s2-2-3-0043": "範例：二項式定理｜組合分式恆等式",
    "q-s2-2-3-0044": "隨堂練習：二項式定理｜組合恆等式證明",
    "q-s2-2-3-0045": "範例：二項式定理｜平方和恆等式",
    "q-s2-2-3-0046": "隨堂練習：二項式定理｜中央二項式估計",
}


def normalize_existing_math(token: str) -> str:
    inner = token[1:-1].strip()
    inner = inner.replace("〈", r"\langle ").replace("〉", r" \rangle")
    inner = inner.replace("〈", r"\langle ").replace("〉", r" \rangle")
    inner = inner.replace("ℕ", r"\mathbb{N}")
    inner = inner.replace("ℝ", r"\mathbb{R}")
    inner = inner.replace("°", r"^\circ")
    inner = re.sub(r"\s+", " ", inner).strip()
    return f"${inner}$"


def clean_math_chunk(chunk: str) -> str:
    chunk = chunk.strip()
    chunk = chunk.replace("〈", r"\langle ").replace("〉", r" \rangle")
    chunk = chunk.replace("〈", r"\langle ").replace("〉", r" \rangle")
    chunk = chunk.replace("×", r" \times ").replace("÷", r" \div ")
    chunk = chunk.replace("ℕ", r"\mathbb{N}")
    chunk = chunk.replace("ℝ", r"\mathbb{R}")
    chunk = chunk.replace("°", r"^\circ")
    chunk = re.sub(r"\s+", " ", chunk).strip()
    return chunk


def should_wrap_math(raw: str) -> bool:
    if not raw:
        return False
    if re.fullmatch(r"\(?\d+\)?", raw):
        return False
    if len(raw) == 1 and raw.isdigit():
        return False
    return bool(
        re.search(r"[A-Za-z\\πℕℝ]", raw)
        or any(op in raw for op in ("^", "_", "×", "÷", "≤", "≥", "∈", "=", "|", "<", ">", "→"))
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


def normalize_question_text(text: str) -> str:
    text = text.replace("\r", " ").replace("\n", " ")
    text = re.sub(r"\s+", " ", text).strip()
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
    text = re.sub(r"\$\s+", "$", text)
    text = re.sub(r"\s+\$", "$", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def section_short(source_section: str) -> str:
    if "：" in source_section:
        return source_section.split("：", 1)[1].strip()
    return source_section.strip()


def strip_images(text: str) -> str:
    return re.sub(r"\[圖:[^\]]+\]", "", text)


def shorten_title_body(text: str) -> str:
    text = strip_images(text)
    text = re.sub(r"\s+", " ", text).strip()
    for delimiter in ("？", "。", "(1)", "（1）", "："):
        if delimiter in text:
            head = text.split(delimiter, 1)[0].strip()
            if head:
                text = head
                break
    if len(text) > 18:
        return text[:18].rstrip("，。；： ")
    return text.rstrip("，。；： ")


def marker_prefix(question: dict) -> str:
    for tag in question.get("tags", []):
        if isinstance(tag, str) and tag.startswith("marker:"):
            return tag.split(":", 1)[1].strip().replace("範例 ", "範例")
    title = str(question.get("title", ""))
    return "隨堂練習" if title.startswith("隨堂練習") else "範例"


def main() -> None:
    payload = json.loads(PACK_PATH.read_text(encoding="utf-8-sig"))
    questions = payload["questions"] if isinstance(payload, dict) else payload

    for question in questions:
        qid = question["id"]
        question_text = normalize_question_text(str(question.get("question_text", "")))
        question_text = QUESTION_TEXT_OVERRIDES.get(qid, question_text)
        question["question_text"] = question_text

        if qid in TITLE_OVERRIDES:
            question["title"] = TITLE_OVERRIDES[qid]
        else:
            prefix = marker_prefix(question)
            section = section_short(str(question.get("source_section", "")))
            body = shorten_title_body(question_text)
            question["title"] = f"{prefix}：{section}｜{body}"

    PACK_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
