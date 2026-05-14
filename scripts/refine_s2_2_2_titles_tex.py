from __future__ import annotations

import json
import re
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-2-2/questions.json")

PROTECT_RE = re.compile(r"(\$[^$]*\$|\[圖:[^\]]+\])")
ALLOWED_CHUNK_RE = re.compile(r"[A-Za-z0-9_{}^\\+\-−×÷*/=<>≤≥().,:;\[\]|〈〉〈〉π…∈ℕℝ°]+")


QUESTION_TEXT_OVERRIDES: dict[str, str] = {
    "q-s2-2-2-0003": r"在空間中，$x,y,z$坐標皆為整數且與原點距離為$\sqrt{17}$的點，共有______個。",
    "q-s2-2-2-0009": r"設$\{a_1,a_2,a_3,a_4\}=\{1,2,3,4\}$，則滿足$(1-a_1)(2-a_2)(3-a_3)(4-a_4)\ne 0$的情形有______種。",
    "q-s2-2-2-0010": r"(1) 自$A$至$B$共有______種走法。 (2) 走到之前走過之點即停止，共有______種走法。",
    "q-s2-2-2-0012": r"如圖，(1) 由$A$走到$B$，只能向上或向右的走法有______種。 (2) 由$A$走到$B$，若可重複走，則其走法有______種。",
    "q-s2-2-2-0013": r"$A\to C$走捷徑有______種走法。",
    "q-s2-2-2-0014": r"每一頂點只能走一次且不能走「↗」、「→」、「↖」等三種方向，則下列走法各有多少種？ (1) $A$到$B$走$4$單位長。 (2) $A$到$B$走$5$單位長。 (3) $A$到$B$走$6$單位長。",
    "q-s2-2-2-0015": r"求下列各種走法： (1) $A$到$B$。 (2) 不過$P$。 (3) 不過$Q$。 (4) 不過$P$也不過$Q$。 (5) 必過$P$。",
    "q-s2-2-2-0021": r"用$1$克、$2$克、$4$克、$8$克、$16$克五個砝碼之中的幾個（至少一個），可稱出多少種不同重量？這些可稱得的克數之總和$=\underline{\qquad}$。",
    "q-s2-2-2-0023": r"已知$n$為正整數，且$P_3^{n+1}=10P_2^{n-1}$，求$n=\underline{\qquad}$。",
    "q-s2-2-2-0024": r"已知$n$為正整數，且$P_4^{n+1}-10P_2^{n-1}=4P_3^n$，求$n=\underline{\qquad}$。",
    "q-s2-2-2-0039": r"「$tennessee$」一字中，(1) 各字母重排，有______種排法。 (2) 若同字母須相鄰，有______種排法。",
    "q-s2-2-2-0040": r"將$ACCESS$一字的字母重新排列，若限制$A$一定要排在$E$之前，但$A,E$不一定要相鄰，問連同原字，共可排出______字。",
    "q-s2-2-2-0042": r"將$aabbcc$排成一列，相同字母不相鄰的排法有幾種？",
    "q-s2-2-2-0043": r"$aabbccdd$排成一列，其中$a$與$b$不相鄰之排法有______種。",
    "q-s2-2-2-0044": r"「庭院深深深幾許」等七個字重排，則 (A) 三個「深」字相連的排列數$=120$ (B) 同字不相鄰的排列數$=240$ (C) 首末排「深」字且同字不相鄰的排列數$=96$ (D) 「庭、院」兩字排在「深」之左的排列數$=84$ (E) 「庭、院」兩字排在「深」之左，「幾、許」兩字排在「深」之右的排列數$=40$。",
    "q-s2-2-2-0046": r"將「$pallmall$」一字中，所有字母全取而排列之，依下列條件，求其排列數： (1) 所有$l$均相鄰。 (2) $l$均不相鄰。 (3) 同字母不相鄰。",
    "q-s2-2-2-0047": r"設有同樣大小的旗子六面，其中三面藍色，兩面白色，一面紅色，若將此六面旗子任意排序全升上旗竿，可表示$P$種不同信號；自六面旗子中任取$4$個排序升上旗竿，可表$Q$種不同信號，則下列何者正確？ (A) $P$為二位數 (B) $Q$為二位數 (C) $50\le P\le 100$ (D) $50\le Q\le 100$ (E) $P+Q\ge 150$。",
    "q-s2-2-2-0049": r"從「$tennessee$」的$9$個字母中，任取$4$個字母排列之，則其排法有多少種？",
    "q-s2-2-2-0052": r"多項式$(a+b+c+d)^6$的展開式中，則 (A) $a^6$的係數$=1$ (B) $b^5c$的係數$=6$ (C) $a^2b^2c^2$的係數$=120$ (D) 型如$a^3b^3$的同型項有$6$項 (E) 型如$a^3b^2c$的同型項有$24$項。",
    "q-s2-2-2-0053": r"(2) 經過$C$且不過$D$的走法有______種。",
    "q-s2-2-2-0054": r"(1) 任意走。 (2) 過$C$且過$D$。 (3) 不過$C$且不過$D$。",
    "q-s2-2-2-0055": r"(1) 任意走。 (2) 過$C$且過$D$。 (3) 不過$C$且不過$D$。",
    "q-s2-2-2-0056": r"$P(4,3)$，$R(1,1)$，(1) 由$P$到$Q$且不經過原點的走法有______種。 (2) 由$R(1,1)$到$Q$且不經過第二象限的走法有______種。",
    "q-s2-2-2-0057": r"在坐標平面上，動點$P$自原點出發，依下列規則移動，至點$(4,4)$為止。擲一骰子若出現點數為$n$，當$n$為奇數時，$P$向右移動$n$單位；當$n$為偶數時，$P$向上移動$n$單位，則有多少種不同的移動方法？",
    "q-s2-2-2-0060": r"在圖(一)與圖(二)中，$A,B,C,D,E$等$5$個區域，用$4$種顏色著色，$4$色都用，且相鄰的區域不同色，則圖(一)有______種方法，圖(二)有______種方法。[圖:program-db/imports/packs/s2-2-2/assets/media/image76.png] [圖:program-db/imports/packs/s2-2-2/assets/media/image77.png]",
    "q-s2-2-2-0061": r"將下圖$A,B,C,D$四個區域，用$3$種顏色塗色，且相鄰區域不同色，則有幾種塗法？若三種顏色都用，塗法有幾種？ [圖:program-db/imports/packs/s2-2-2/assets/media/image78.png]",
    "q-s2-2-2-0062": r"如下圖，以紅、黃、綠、藍、黑五色塗$A,B,C,D$四區，顏色可重複使用，每區塗一色或不塗色，相鄰二區不同色，且最多一區不塗色。共有______種不同的塗法。 [圖:program-db/imports/packs/s2-2-2/assets/media/image78.png]",
    "q-s2-2-2-0068": r"用$7$種不同顏料，塗下列圖形，則各有幾種塗法（每塊區域顏色不同）？ (1) (2) [圖:program-db/imports/packs/s2-2-2/assets/media/image82.png] [圖:program-db/imports/packs/s2-2-2/assets/media/image83.png]",
    "q-s2-2-2-0069": r"將$10$種不同顏料塗下列圖形，各有幾種塗法？ [圖:program-db/imports/packs/s2-2-2/assets/media/image86.png] [圖:program-db/imports/packs/s2-2-2/assets/media/image87.png] [圖:program-db/imports/packs/s2-2-2/assets/media/image88.png]",
    "q-s2-2-2-0078": r"若$\{a_1,a_2,a_3,a_4,a_5\}=\{1,2,3,4,5\}$，即$a_1,a_2,a_3,a_4,a_5$為$1,2,3,4,5$之一種排列，求合乎$(a_1-1)(a_2-2)(a_3-4)\ne 0$之此種排列有______種。",
    "q-s2-2-2-0079": r"設$b_1,b_2,b_3,b_4,b_5$為$1,2,3,4,5$的一種排列，求滿足下列各小題條件之排列數： (1) $(1-b_1)(5-b_3)=0$。 (2) $(2-b_2)(3-b_3)\ne 0$。 (3) $(1-b_1)(2-b_2)(3-b_3)(4-b_4)(5-b_5)$為偶數。 (4) $(1+b_1)(2+b_2)(3+b_3)(4+b_4)(5+b_5)$為奇數。 (5) $(1-b_1)(2-b_2)(3-b_3)(4-b_4)(5-b_5)\ne 0$。",
    "q-s2-2-2-0094": r"設$n\in\mathbb{N}$，若$P_3^n=4C_2^{n+1}$，則$n=\underline{\qquad}$。",
    "q-s2-2-2-0095": r"若$C_{m-1}^n:C_m^n:C_{m+1}^n=3:4:5$，則$n=\underline{\qquad}$？$m=\underline{\qquad}$？",
    "q-s2-2-2-0096": r"$n,m\in\mathbb{N}$，若$C_m^{n-1}:C_m^n:C_m^{n+1}=6:9:13$，則$n=\underline{\qquad}$。",
    "q-s2-2-2-0097": r"設$n,m$為兩自然數，如果$C_m^n:C_m^{n+1}:C_m^{n+2}=6:9:13$，則$n=\underline{\qquad}$。",
    "q-s2-2-2-0105": r"同時擲三粒相同骰子，有$H_3^6=56$種不同結果，其中點數和為$9$的情形有______種；若改為擲大小不同的三粒骰子，則其中點數和為$9$的情形有______種。",
    "q-s2-2-2-0106": r"下列哪些選項是正確的？ (1) $3P_2^{17}+P_3^{17}=P_3^{18}$ (2) $C_3^{16}+C_4^{17}=C_4^{18}$ (3) $C_2^2+C_2^3+C_2^4+\cdots+C_2^{18}=C_3^{18}$ (4) $C_0^{10}+C_1^{10}+C_2^{10}+\cdots+C_{10}^{10}=2^{10}$ (5) $C_5^{10}C_0^{10}+C_4^{10}C_1^{10}+C_3^{10}C_2^{10}+C_2^{10}C_3^{10}+C_1^{10}C_4^{10}+C_0^{10}C_5^{10}=C_5^{20}$。",
    "q-s2-2-2-0114": r"考慮正五邊形及其對角線所成的圖形，此圖形中各線段圍成的各種三角形，相似的列為一類，共有$p$類；列為全等者共有$q$類，則$p=\underline{\qquad}$，$q=\underline{\qquad}$，△共有______個。",
    "q-s2-2-2-0122": r"若$A=\{a,b,c,d\}$，$B=\{1,2,3,4,5,6\}$，其中$a,b,c,d$相異，則下列函數各多少個？ (1) $f:A\to B$且$f(a)\le f(b)<f(c)\le f(d)$。 (2) $f:A\to B$且$f(a)\ne 1$，$f(b)\ne 2$，$f(c)\ne 4$，$f(d)\ne 6$。",
    "q-s2-2-2-0127": r"方程式$x+y+z=10$的自然數解有______組。",
    "q-s2-2-2-0128": r"設$x+y+z+u=12$，則此方程式有______組非負整數解，______組正整數解。",
    "q-s2-2-2-0129": r"方程式$x+y+z+w=8$的正整數解有______組，又方程式$x+y+z+2w=8$的正整數解有______組。",
    "q-s2-2-2-0130": r"方程式$x+y+z=10$，滿足下列條件的解各有幾組？ (1) $x,y,z$均為正整數。 (2) $x,y,z$均為正整數且$x=y$。 (3) $x,y,z$均為正整數且$x<y$。",
    "q-s2-2-2-0131": r"滿足不等式$x+y+z+u\le 8$的正整數解有______組。",
    "q-s2-2-2-0132": r"不等式$x+y+z+u\le 9$的正整數解有______組。",
    "q-s2-2-2-0133": r"設$x,y,z,t\in\mathbb{N}$，則$x+y+z+t^2=10$有______組解。",
    "q-s2-2-2-0134": r"設$x,y,z,u$均表非負整數，且$x+y+z+2u^2=13$，則數對$(x,y,z,u)$的解共有幾個？",
    "q-s2-2-2-0135": r"方程式$x+y+z+u=16$中，滿足$x\le 4$，$y\le 4$，$z\le 5$，$u\le 6$之正整數解有______組。",
    "q-s2-2-2-0136": r"滿足$xyz=4000$之所有整數解$(x,y,z)$，共有______組。",
    "q-s2-2-2-0137": r"設$x,y,z,u$均為正整數，下列敘述何者正確？ (1) $x+y+z+u=15$之解有$C_3^{14}$個。 (2) $x+y+z+u\le 15$之解有$H_{10}^5$個。 (3) $x<y<z<u\le 15$之解有$P_4^{15}$個。 (4) $x\le y\le z\le u\le 15$之解有$C_4^{18}$個。 (5) $xyzu=2^6\times 3^2\times 5^4$之解有$H_4^6H_4^2H_4^4$個。",
    "q-s2-2-2-0138": r"若$x+y+z+u=16$，則下列選項何者正確？ (1) 非負整數解有$969$組 (2) 正整數解有$455$組 (3) 正偶數解有$165$組 (4) 正奇數解有$84$組 (5) 滿足$x\ge 3$，$y\ge 2$，$z>2$，$u>1$的正整數解有$84$組。",
    "q-s2-2-2-0147": r"$(x+y+z+t)^{10}$的展開式中，(1) 不同類項有多少項？ (2) $x^4y^3z^3$的同型項有幾項？ (3) $xy^2z^3t^4$的係數為多少？",
}


TITLE_OVERRIDES: dict[str, str] = {
    "q-s2-2-2-0009": "範例：加法原理與乘法原理｜錯排條件計數",
    "q-s2-2-2-0010": "隨堂練習：加法原理與乘法原理｜路徑走法",
    "q-s2-2-2-0012": "範例：加法原理與乘法原理｜方格路徑計數",
    "q-s2-2-2-0013": "範例：加法原理與乘法原理｜捷徑走法",
    "q-s2-2-2-0014": "範例：加法原理與乘法原理｜限制方向路徑",
    "q-s2-2-2-0015": "範例：加法原理與乘法原理｜經點與避點路徑",
    "q-s2-2-2-0039": "範例：排列｜$tennessee$排列",
    "q-s2-2-2-0040": "範例：排列｜$ACCESS$字母排列",
    "q-s2-2-2-0042": "範例：排列｜同字母不相鄰",
    "q-s2-2-2-0043": "隨堂練習：排列｜$a,b$不相鄰排列",
    "q-s2-2-2-0046": "隨堂練習：排列｜$pallmall$排列",
    "q-s2-2-2-0047": "範例：排列｜旗號排列與選取",
    "q-s2-2-2-0049": "範例：排列｜$tennessee$取字排列",
    "q-s2-2-2-0052": "範例：排列｜多項式展開係數",
    "q-s2-2-2-0078": "範例：排列｜指定位置錯排",
    "q-s2-2-2-0079": "範例：排列｜排列條件計數",
    "q-s2-2-2-0094": "範例：組合｜排列組合方程",
    "q-s2-2-2-0095": "範例：組合｜二項係數比例",
    "q-s2-2-2-0096": "隨堂練習：組合｜連續二項係數比例",
    "q-s2-2-2-0097": "隨堂練習：組合｜二項係數三項比例",
    "q-s2-2-2-0105": "範例：組合｜骰子點數和",
    "q-s2-2-2-0106": "範例：組合｜排列組合恆等式",
    "q-s2-2-2-0114": "範例：組合｜五邊形三角形分類",
    "q-s2-2-2-0122": "範例：組合｜函數個數",
    "q-s2-2-2-0127": "範例：組合｜自然數解個數",
    "q-s2-2-2-0128": "隨堂練習：組合｜非負與正整數解",
    "q-s2-2-2-0129": "隨堂練習：組合｜線性方程正整數解",
    "q-s2-2-2-0130": "隨堂練習：組合｜方程式限制解",
    "q-s2-2-2-0131": "範例：組合｜不等式正整數解",
    "q-s2-2-2-0132": "隨堂練習：組合｜不等式解個數",
    "q-s2-2-2-0133": "範例：組合｜含平方項的自然數解",
    "q-s2-2-2-0134": "隨堂練習：組合｜非負整數四元解",
    "q-s2-2-2-0135": "範例：組合｜有上界的正整數解",
    "q-s2-2-2-0136": "範例：組合｜整數三元乘積解",
    "q-s2-2-2-0137": "隨堂練習：組合｜多種組合判斷",
    "q-s2-2-2-0138": "隨堂練習：組合｜四元和的解判斷",
    "q-s2-2-2-0147": "範例：組合｜多項式展開項數與係數",
    "q-s2-2-2-0056": "範例：排列｜坐標路徑限制",
    "q-s2-2-2-0057": "範例：排列｜骰子決定路徑",
    "q-s2-2-2-0060": "範例：組合｜平面著色方法",
    "q-s2-2-2-0061": "範例：組合｜區域塗色",
    "q-s2-2-2-0062": "隨堂練習：組合｜含留白的區域塗色",
    "q-s2-2-2-0068": "範例：組合｜多區域異色塗法",
    "q-s2-2-2-0069": "隨堂練習：組合｜圖形塗色方法",
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
    text = text.replace("，", "，").replace("；", "；")
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
