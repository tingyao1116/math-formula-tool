from __future__ import annotations

import json
import re
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-2-1/questions.json")

PROTECT_RE = re.compile(r"(\$[^$]*\$|\[圖:[^\]]+\])")
ALLOWED_CHUNK_RE = re.compile(r"[A-Za-z0-9_{}^\\+\-−×÷*/=<>≤≥().,:;\[\]|〈〉〈〉π…∈ℕℝ°|]+")


QUESTION_TEXT_OVERRIDES: dict[str, str] = {
    "q-s2-2-1-0001": r"下列各敘述，何者是正確的？ (1) 四邊形$ABCD$中，若$\overline{AB}//\overline{CD}$，則此四邊形為一平行四邊形。 (2) 一直線與一圓至少會有一個交點。 (3) 若$\triangle ABC$為等腰三角形，則$\overline{AB}=\overline{AC}$。 (4) 若$\triangle ABC$為正三角形，則$\angle A=60^\circ$。 (5) $x^2-2x-3=0 \Rightarrow x=3$。",
    "q-s2-2-1-0002": r"試判斷下列敘述哪些是對的敘述？ (1) $3\le 3$ (2) $28$為$7$的倍數且$49$為$7$的倍數 (3) $1<\sqrt{2}\le \sqrt{3}$ (4) $9$是質數或$91$是質數 (5) $0<x<1$的否定敘述為$x>1$或$x<0$。",
    "q-s2-2-1-0003": r"下列選項中，哪些是對的敘述？ (1) $|a|=a$或$|a|=-a$ (2) $a>b$且$a<b$ (3) 平行四邊形的兩雙對邊分別等長 (4) 直角三角形中斜邊中點，必為其外接圓的圓心 (5) $\sqrt{a}$為有理數或$\sqrt{a}$為無理數。",
    "q-s2-2-1-0004": r"選出對的敘述： (1) 三角形的兩邊之和大於第三邊 (2) $2$是質數或$4$是質數 (3) $2$是質數且$4$是質數 (4) $x=1$或$y=2$的否定敘述為$x\ne 1$或$y\ne 2$ (5) $x=1$且$y=2$的否定敘述為$x\ne 1$且$y\ne 2$。",
    "q-s2-2-1-0005": r"選出對的敘述： (1) $5\ge 5$ (2) $\sqrt{4}=-2$或$\sqrt{4}=2$ (3) $\sqrt{4}=-2$且$\sqrt{4}=2$ (4) $x=1$的否定敘述為$x\ne 1$ (5) $0<x<2$的否定敘述為$x\le 0$或$x\ge 2$。",
    "q-s2-2-1-0006": r"設$a,b,c$表三個實數，下列各敘述何者是正確的？ (1) 若$a^2+b^2+c^2=0$，則$a=b=c$ (2) 若$abc=0$，則$a=b=c=0$ (3) 若$a^2+b^2+c^2=ab+bc+ca$，則$a=b=c$ (4) 若$a>b>c$，則$a^2>b^2>c^2$ (5) 若$a^3>b^3>c^3$，則$a>b>c$。",
    "q-s2-2-1-0007": r"下列選項中，哪些是對的敘述？ (1) $2+4=5$ (2) 三角形的兩邊和大於第三邊 (3) $2+4=5$或$7+3=10$ (4) $\sqrt{9}=3$且$\sqrt{9}=-3$ (5) $x=3$的否定敘述是$x\ne 3$。",
    "q-s2-2-1-0008": r"寫出下列敘述的否定敘述： (1) $x=1$或$y=3$。 (2) $(x-1)(x-2)=0$。 (3) $-1\le x\le 4$。 (4) 全校每個班至少都有一個學生感冒。",
    "q-s2-2-1-0010": r"設$x$是實數，則下列敘述何者是正確的？ (A) $x^2=9$的否定敘述為$x\ne 3$且$x\ne -3$ (B) $|x|=-x$的否定敘述為$x>0$ (C) $|x|\ge 1$的否定敘述為$|x|<1$ (D) $0<x<1$的否定敘述為$x\le 0$或$x\ge 1$ (E) 「$\exists x\in \mathbb{R}$使$f(x)=3$」的否定敘述為「$\forall x\in \mathbb{R}, f(x)\ne 3$」。",
    "q-s2-2-1-0012": r"甲說：「對任意整數$a,b,c$，若$a^2+b^2=c^2$，則$a,b,c$三者中最多有一個奇數」；乙說：「對任意整數$a,b,c$，若$a^2+b^2=c^2$，則$a,b,c$三者中最少有一個是偶數」。請判斷甲、乙二人推論是否正確；若正確請加以證明，若不正確請舉一個例子加以說明。",
    "q-s2-2-1-0013": r"已知命題「若$2x+3y=7$，則$3x-y\ne 5$」是錯的，求數對$(x,y)=\underline{\qquad\qquad}$。",
    "q-s2-2-1-0014": r"把下列各集合用表列式（列舉法）表示： (1) $A=\{x\mid x\text{為}6\text{的正因數}\}$ (2) $B=\{x\mid x\text{為}30\text{以內}8\text{的倍數}\}$。",
    "q-s2-2-1-0015": r"請用列舉法表示下列各集合： (1) $A=\{x\mid x\text{為正整數且}x\le 4\}$。 (2) $B=\{x\mid x\ge 1\text{且}x\le 1\}$。 (3) $C=\{x\mid x^3+1=0\text{且}x\text{為實數}\}$。 (4) $D=\{x\mid x^2-5x-6=0\text{且}x^2-9=0\}$。 (5) $E=\{x\mid x\text{為整數且}|x|\le 2\}$。",
    "q-s2-2-1-0016": r"設$A=\{1,2,3,4\}$，則$A$的子集合共有 (1)$8$ (2)$13$ (3)$14$ (4)$15$ (5)$16$ 個。",
    "q-s2-2-1-0017": r"請寫出集合$A=\{1,2,3,4\}$的所有部分集合。",
    "q-s2-2-1-0018": r"設$A=\{1,2,3,4,5\}$，$B=\{2,4,6,8,9\}$，求 (1)$A\cap B$ (2)$A\cup B$ (3)$A-B$ (4)$B-A$。",
    "q-s2-2-1-0019": r"$A=\{x,y,z\}$，$B=\{x+1,2,3\}$，則滿足$A\subset B$的數對$(x,y,z)$有多少組？",
    "q-s2-2-1-0020": r"下列何者為真？ (1) 若二集合$A=\{x\mid x+1=1\}$，$B=\{x\mid x+1=x\}$，則$A=B$。 (2) 若二集合$A=\{6n+1\mid n\text{為整數}\}$，$B=\{3n+1\mid n\text{為整數}\}$，則$A\subset B$。 (3) 若二集合$A,B$滿足$A-B=\varnothing$，則$A=B$。 (4) 若三集合$A,B,C$滿足$A\subset(B\cup C)$，則$A\subset B$或$A\subset C$。",
    "q-s2-2-1-0021": r"設$A=\{x\mid x\text{為實數，}|x|\le 2\}$，$B=\{x\mid x\text{為實數，}x^2=1\}$，$C=\{x\mid -x^2+x+6\ge 0\}$，$D=\{x\mid x\text{為實數，}x^4+x^2-2=0\}$，$E=\{x\mid x\text{為實數，}|x|<5\}$，則下列何者為真？ (1)$A\subset B\subset C\subset D\subset E$ (2)$A\subset B=D\subset E\subset C$ (3)$B=D\subset A\subset C\subset E$ (4)$B=D\subset C\subset A\subset E$ (5)$C=D\subset B\subset A\subset E$。",
    "q-s2-2-1-0022": r"設$A=\{x\mid x^2-x-6\le 0,\ x\text{為整數}\}$，$B=\{x\mid x^2-3x-4\le 0,\ x\text{為整數}\}$，則$n(A\cap B)=$ (1)$0$ (2)$2$ (3)$4$ (4)$5$ (5)無限多。",
    "q-s2-2-1-0023": r"設$A=\{(x,y)\mid x+y=3\}$，$B=\{(x,y)\mid 2x+y=5\}$，求$A\cap B$。",
    "q-s2-2-1-0024": r"設$x,y$為實數，$A=\{x^2-3,\ x^2+x+3,\ 3x^3-6x^2-3x+4\}$，$B=\{y,\ y^2-1,\ y^2+1\}$，若$A\cap B=\{-2\}$，則下列何者正確？ (1)$x$為偶數 (2)$x$為奇數 (3)$x$為合成數 (4)$x=1$ (5)$x=2$。",
    "q-s2-2-1-0025": r"$A=\{(x,y)\mid 3x-y=1,\ 2x+y=4\}$，$B=\{(x,y)\mid x-y=a,\ 2x-y=b\}$，若$A=B$，下列何者為真？ (1)$a=-1$ (2)$b=1$ (3)$a+b$為偶數 (4)$a+b>0$ (5)$a-b>0$。",
    "q-s2-2-1-0026": r"設$A=\{x-1,\ y-2\}$，$B=\{2y+1,\ 3-x\}$，若$A=B$，則$2x+y$值可為 (1)$9$ (2)$1$ (3)$-9$ (4)$-1$ (5)$0$。",
    "q-s2-2-1-0027": r"若$A=\{(t,\ t-5)\mid t\in\mathbb{R}\}$，$B=\{(t+1,\ 2t-1)\mid t\in\mathbb{R}\}$，試求$A\cap B$。",
    "q-s2-2-1-0028": r"設$S=\{x\mid -5\le x\le 4\}$，$T=\{x\mid -2\le x\le 5\}$，求 (1)$S\cap T$ (2)$S\cup T$ (3)$S-T$ (4)$T-S$。",
    "q-s2-2-1-0029": r"設$A=\{x\mid -1<x<1\}$，$B=\{x\mid 0\le x\le 3\}$，$U=\mathbb{R}$，求 (1)$B'$。 (2)$A\cup B$。 (3)$B-A$。 (4)$A'\cap B'$。",
    "q-s2-2-1-0030": r"設$A=\{x\mid x^2-ax-4=0\}$，$B=\{x\mid x^2+ax+b=0\}$，若$A\cap B=\{-1\}$，則數對$(a,b)=\underline{\qquad\qquad}$。",
    "q-s2-2-1-0031": r"設$A=\{x-1,\ y-2\}$，$B=\{2y+1,\ 3-x\}$，若$A=B$，則$2x+y$值可為 (1)$9$ (2)$1$ (3)$-9$ (4)$-1$ (5)$0$。",
    "q-s2-2-1-0032": r"設$A=\{2,4,a^3-2a^2-a+7\}$，$B=\{-4,a+3,a^2-2a+2,a^3+a^2+3a+7\}$，若$A\cap B=\{2,5\}$且$n(A\cup B)=x$，則下列何者為真？ (1)$a=2$ (2)$a=-2$ (3)$x=0$ (4)$x=5$ (5)$x=3$。",
    "q-s2-2-1-0033": r"設$A=\{-4,a+2,a^2-2a+2,a^3+a^2+3a+7\}$，$B=\{2,4,a^3-2a^2-a+7\}$，且$B-A=\{5\}$，求$a=\underline{\qquad}$。",
    "q-s2-2-1-0034": r"設$A=\{x\mid 2x^3+5x^2+x-2>0\}$，$B=\{x\mid x^2+ax+b\le 0\}$，若$A\cup B=\{x\mid x>-2\}$，$A\cap B=\{x\mid \frac{1}{2}<x\le 3\}$，則$(a,b)=$ (1)$(-1,-2)$ (2)$(-2,-3)$ (3)$(2,-3)$ (4)$(-2,3)$ (5)$(2,3)$。",
    "q-s2-2-1-0035": r"設$x^2-2x-3>0$之解集合為$A$，$x^2+x-2\le 0$之解集合為$B$，求$A\cap B$及$A\cup B$。",
    "q-s2-2-1-0036": r"設$A=\{x\mid x^2-3x+2>0\}$，$B=\{x\mid x^2+ax+1>0\}$，若$A\cup B=\mathbb{R}$，試求實數$a$的範圍為何？ (1)$a>1$ (2)$a>0$ (3)$a>2$ (4)$a>-2$ (5)$a>3$。",
    "q-s2-2-1-0037": r"$a,b,c\in\mathbb{R}$，$a\ne 0$，若$ax^2+bx+c<0$之解集合為$\{x\mid x\in\mathbb{R},\ -2<x<5\}$，試求： (1)$a:b:c$。 (2)$ax^2-bx+c>0$的解集合。 (3)$\frac{cx+2a}{ax+b}\ge 0$的解集合。",
    "q-s2-2-1-0038": r"宇集$U=\{x\mid 0<x<10\text{且}x\text{為正整數}\}$，若$A=\{1,3,5,7,9\}$，$B=\{2,3,5,7\}$，求$A\cap B$、$A\cup B$、$A^c$、$B^c$。",
    "q-s2-2-1-0039": r"有甲、乙兩人參加同一考試，甲做錯全部試題的$\frac{1}{3}$，乙做錯全部試題的$\frac{1}{4}$，兩人都做錯的題目占全部試題的$\frac{1}{6}$，求兩人都做對的題目占全部試題的幾分之幾。",
    "q-s2-2-1-0040": r"全班$40$位同學解二題數學問題，結果解出第一題者有$30$人，解出第二題者有$23$人，二題都未解出者有$5$人，求二題都解出者有幾人。",
    "q-s2-2-1-0070": r"已知$3600=2^4\times 3^2\times 5^2$，(1) 求$3600$的正因數個數。 (2) 求$3600$的偶因數個數。",
    "q-s2-2-1-0076": r"用$1$克、$2$克、$4$克、$8$克、$16$克五個砝碼中的幾個（至少一個），可稱出多少種不同重量？這些可稱得的克數之總和$=\underline{\qquad}$。",
    "q-s2-2-1-0078": r"某次考試，班上$50$人中，數學不及格者為$30$人，英文不及格者為$23$人，而二科均及格者$12$人，設二科均不及格之人數$x$，數學及格且英文不及格之人數$y$，則 (1)$x=15$ (2)$y=8$ (3)$x>y$ (4)$x=12$ (5)$y<10$。",
    "q-s2-2-1-0080": r"從$1$到$2100$自然數中，$3$的倍數但不為$2$的倍數有$x$個，$5$的倍數但不為$2,3$的倍數有$y$個，$7$的倍數但不為$2,3,5$的倍數有$z$個，則下列何者為真？ (1)$x>y>z$ (2)$x=350$ (3)$x=240$ (4)$y=140$ (5)$z=40$。",
    "q-s2-2-1-0081": r"設$A\in \mathbb{N}$且$1\le A\le 500$，則下列何者正確？ (1) 不大於$500$的自然數中，$3$的倍數有______個。 (2) 不大於$500$的自然數中，既是$3$的倍數又是$5$的倍數有______個。",
}


TITLE_OVERRIDES: dict[str, str] = {
    "q-s2-2-1-0007": "隨堂練習：簡單的邏輯概念｜命題真偽判斷",
    "q-s2-2-1-0012": "隨堂練習：簡單的邏輯概念｜勾股數奇偶性推論",
    "q-s2-2-1-0013": "隨堂練習：簡單的邏輯概念｜錯命題反例數對",
    "q-s2-2-1-0015": "隨堂練習：集合的基本概念｜集合列舉法",
    "q-s2-2-1-0016": "範例：集合的基本概念｜子集合個數",
    "q-s2-2-1-0017": "範例：集合的基本概念｜所有部分集合",
    "q-s2-2-1-0018": "範例：集合的基本概念｜交集聯集與差集",
    "q-s2-2-1-0019": "範例：集合的基本概念｜子集合數對個數",
    "q-s2-2-1-0020": "範例：集合的基本概念｜集合關係判斷",
    "q-s2-2-1-0021": "範例：集合的基本概念｜集合包含關係",
    "q-s2-2-1-0022": "範例：集合的基本概念｜整數解集合交集",
    "q-s2-2-1-0024": "隨堂練習：集合的基本概念｜交集元素反推",
    "q-s2-2-1-0025": "範例：集合的基本概念｜數對集合相等",
    "q-s2-2-1-0026": "隨堂練習：集合的基本概念｜兩集合相等判斷",
    "q-s2-2-1-0027": "範例：集合的基本概念｜數對集合交集",
    "q-s2-2-1-0028": "範例：集合的基本概念｜區間集合運算",
    "q-s2-2-1-0029": "隨堂練習：集合的基本概念｜補集與聯集",
    "q-s2-2-1-0030": "範例：集合的基本概念｜交集反求參數",
    "q-s2-2-1-0031": "隨堂練習：集合的基本概念｜兩集合相等判斷",
    "q-s2-2-1-0032": "範例：集合的基本概念｜交集與聯集元素個數",
    "q-s2-2-1-0033": "隨堂練習：集合的基本概念｜差集反求參數",
    "q-s2-2-1-0034": "範例：集合的基本概念｜聯集交集反求二次式",
    "q-s2-2-1-0036": "範例：集合的基本概念｜聯集為實數參數範圍",
    "q-s2-2-1-0037": "範例：集合的基本概念｜二次不等式解集合",
    "q-s2-2-1-0076": "隨堂練習：計數原理｜砝碼稱重種類與總和",
    "q-s2-2-1-0078": "隨堂練習：計數原理｜及格與不及格人數",
    "q-s2-2-1-0080": "範例：計數原理｜倍數個數比較",
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
    return bool(re.search(r"[A-Za-z\\πℕℝ]", raw) or any(op in raw for op in ("^", "_", "×", "÷", "≤", "≥", "∈", "=", "|")))


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
    for delimiter in ("？", "。", "(1)", "（1）"):
        if delimiter in text:
            head = text.split(delimiter, 1)[0].strip()
            if head:
                text = head
                break
    if len(text) > 16:
        return text[:16].rstrip("，。；： ")
    return text.rstrip("，。；： ")


def infer_prefix(current_title: str) -> str:
    return "隨堂練習" if current_title.startswith("隨堂練習") else "例題"


def marker_prefix(question: dict) -> str:
    for tag in question.get("tags", []):
        if isinstance(tag, str) and tag.startswith("marker:"):
            return tag.split(":", 1)[1].strip()
    return infer_prefix(str(question.get("title", "")))


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
