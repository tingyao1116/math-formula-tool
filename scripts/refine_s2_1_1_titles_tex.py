from __future__ import annotations

import json
import re
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-1-1/questions.json")

PROTECT_RE = re.compile(r"(\$[^$]*\$|\[圖:[^\]]+\])")
ALLOWED_CHUNK_RE = re.compile(r"[A-Za-z0-9_{}^\\+\-−×÷*/=<>≤≥().,:;\[\]|〈〉〈〉π…∈ℕ√·]+")
FRAGMENTED_MATH_RUN_RE = re.compile(r"((?:\$[^$]*\$|[A-Za-z0-9_{}^\\+\-−×÷*/=<>≤≥().,:;|〈〉〈〉π…∈ℕ√· ]+)+)")


QUESTION_TEXT_OVERRIDES: dict[str, str] = {
    "q-s2-1-1-0003": r"依下列各數列$\langle a_{n} \rangle$之規則，求下列各數列之一般式。(1) $5,8,11,14,17,\ldots$。(2) $\frac{1}{4},\frac{1}{2},1,2,4,\ldots$。(3) $1,-1,1,-1,1,-1,\ldots$。(4) $2,-2,2,-2,2,\ldots$。",
    "q-s2-1-1-0004": r"數列$\langle a_{n} \rangle$，滿足$a_{1}=2$，$a_{n+1}=\frac{1}{1-a_{n}}$，則$a_{1000}$的值為 (1) 2 (2) $-1$ (3) $\frac{1}{2}$ (4) 0。",
    "q-s2-1-1-0007": r"已知等差數列$\langle a_{n} \rangle$中$a_{2}=30$，$a_{6}=14$，求$a_{22}$及一般項$a_{n}$。",
    "q-s2-1-1-0011": r"在$-13$和$20$兩數之間插入$k$個數，使這$k+2$個數成等差數列。若$a_{4}=-4$，求$k$之值。",
    "q-s2-1-1-0015": r"有一等差數列$\langle a_{n} \rangle$，已知$a_{m}=n^2$，$a_{n}=m^2$，且$m\ne n$，則$a_{m+n}=$______。",
    "q-s2-1-1-0020": r"已知$\langle a_{n} \rangle$是一等比數列，且前$9$項的乘積是$512$，試問$a_{3}$與$a_{7}$的乘積為 (1) $\sqrt{2}$ (2) $2$ (3) $4$ (4) $8$。",
    "q-s2-1-1-0022": r"設$a,b,c\in N$，$1<a<b<c<9$，且$\langle 0.\overline{a},0.0\overline{b},0.00\overline{c},\dots \rangle$成等比數列，則 (1) $(a,b,c)=$______。 (2) 該數列之第四項為______。（寫成循環小數）",
    "q-s2-1-1-0025": r"三角形三邊長成$G.P.$，公比$r$，試證：$\frac{\sqrt{5}-1}{2}<r<\frac{\sqrt{5}+1}{2}$。",
    "q-s2-1-1-0030": r"假設實數$a_{1},a_{2},a_{3},a_{4}$是一個等差數列，且滿足$0<a_{1}<2$及$a_{3}=4$。若定義$b_{n}=2^{a_{n}}$，則以下哪些選項是對的？ (1) $b_{1},b_{2},b_{3},b_{4}$是一個等比數列 (2) $b_{1}<b_{2}$ (3) $b_{2}>4$ (4) $b_{4}>32$ (5) $b_{2}\times b_{4}=256$。",
    "q-s2-1-1-0033": r"設數列$\langle a_{n} \rangle$滿足$a_{1}=1$，且$a_{n}=\frac{4-a_{n-1}}{3-a_{n-1}}$（$n\ge 2$），求$a_{2}$、$a_{3}$，並推測$a_{n}$（以$n$表示）。",
    "q-s2-1-1-0034": r"數列$\langle a_{n} \rangle$的遞迴關係式為$a_{1}=3,\ a_{n}+2a_{n-1}=0$（$n$為正整數且$n\ge 2$），求一般項$a_{n}$。",
    "q-s2-1-1-0035": r"數列$\langle a_{n} \rangle$的遞迴關係式為$a_{1}=3,\ a_{n}=2a_{n-1}-1$（$n$為正整數且$n\ge 2$），求 (1) $a_{4}$。 (2) 若$a_{n}=2a_{n-1}-1$可化成$a_{n}-p=2(a_{n-1}-p)$，則$p$的值為何？ (3) 一般項$a_{n}$。",
    "q-s2-1-1-0036": r"$\langle a_{n} \rangle$為一數列，已知$S_{n}=a_{1}+a_{2}+a_{3}+\cdots+a_{n}=n^2+3$，$\forall n\in N$，則$a_{n}=$______。",
    "q-s2-1-1-0037": r"設數列$\langle a_{n} \rangle$之前$n$項和$S_{n}=\frac{n}{2n+1}$，則$a_{n}=$______。",
    "q-s2-1-1-0038": r"有一數列$\langle a_{n} \rangle$的前$n$項（從第$1$項到第$n$項）和為$n^2+6n+k$，其中$k$是常數（即$k$之值固定，不隨$n$變化）。則下列敘述何者正確？ $(A)\ a_{1}=7+k$ $(B)\ a_{6}-a_{5}=-2$ $(C)$數列$\langle a_{n} \rangle$為等差數列的充要條件是$k=0$ $(D)\ a_{n}-a_{n-1}=2$，其中$n=3,4,5,\dots$ $(E)\ a_{10}=25$",
    "q-s2-1-1-0039": r"設數列$\langle a_{n} \rangle$滿足下列條件$a_{1}=1$，$a_{n+1}=a_{n}+(n+1)^3$，求此數列的一般項$a_{n}$，則$a_{n}=$______。",
    "q-s2-1-1-0040": r"設數列$\langle a_{n} \rangle$滿足$a_{1}=1,\ a_{n+1}=2a_{n}+(n+1)$（$n\ge 1$），求一般項$a_{n}$。",
    "q-s2-1-1-0041": r"一數列$\langle a_{n} \rangle$的遞迴定義式為：$a_{1}=2$，$a_{n+1}=a_{n}+(\frac{1}{3})^n$，$n\in N$，試求這個數列的一般項$a_{n}$（以$n$的式子表示）。",
    "q-s2-1-1-0042": r"設$a_{1}=1$，對任意正整數$n$，$a_{n+1}=\frac{1}{2}a_{n}+3$恆成立，我們可將它化成$a_{n+1}-\alpha=\frac{1}{2}(a_{n}-\alpha)$的等比形式，則$\alpha=$______，從而再求出$a_{n}=$______。",
    "q-s2-1-1-0043": r"一數列$\langle a_{n} \rangle$，已知$a_{1}=3$，$a_{n+1}=2a_{n}+1$，$n\in N$，則$a_{n}=$______。",
    "q-s2-1-1-0044": r"設數列$\langle a_{n} \rangle$中滿足$a_{1}=2$且$a_{n+1}=2-\frac{1}{a_{n}}$，$n$為正整數，由此可推得下列何者為真？ (1) $a_{2}=\frac{3}{2}$ (2) $a_{3}=\frac{4}{3}$ (3) $a_{4}=\frac{5}{4}$ (4) $a_{100}=1\frac{1}{100}$ (5) $a_{n}=\frac{n+1}{n}$。",
    "q-s2-1-1-0045": r"已知數列$a_{n+1}=a_{n}+2n$，$n\in\mathbb{N}$且$a_{1}=3$，則下列何者正確？ (1) $a_{2}=4$ (2) $a_{3}=9$ (3) $a_{4}=15$ (4) $a_{n}=3+n(n+1)$ (5) $a_{n}=3+n(n-1)$。",
    "q-s2-1-1-0050": r"據說畢達哥拉斯研究過這樣的問題：下圖中的黑點分別落在正五邊形的頂點或邊上，第$1$圖有$5$個黑點，第$2$圖共有$12$個黑點，第$3$圖則有$22$個黑點。設$a_{n}$為第$n$圖中黑點的總數，即$a_{1}=5$，$a_{2}=12$，$a_{3}=22$。 [圖:program-db/assets/question-media/s2-1-1/image27.png] [圖:program-db/assets/question-media/s2-1-1/image28.png] [圖:program-db/assets/question-media/s2-1-1/image29.png] (1) 寫出數列$\langle a_{n} \rangle$的遞迴關係式。 (2) 求$a_{5}$。",
    "q-s2-1-1-0052": r"一數列$\langle a_{n} \rangle$定義如下：$a_{1}=1$，$a_{n+1}=a_{1}+\cdots+a_{n}$，$n$為正整數，試寫出一般項$a_{n}$（以$n$的式子表示），並驗證你的答案。",
    "q-s2-1-1-0053": r"設一數列$\langle a_{n} \rangle$的首項$a_{1}=1$且滿足關係式$a_{n}+a_{n+1}=0$，$n$為正整數，試求此數列的一般項$a_{n}$。",
    "q-s2-1-1-0054": r"設數列$\langle a_{n} \rangle$的遞迴關係式為$a_{1}=1,\ a_{n}=a_{n-1}+(2n-1)$（$n\ge 2$）。 (1) 寫出$a_{2}$、$a_{3}$。 (2) 猜測一般項$a_{n}$。 (3) 使用數學歸納法證明：你的猜測是正確的。",
    "q-s2-1-1-0055": r"設數列$\langle a_{n} \rangle$中，$a_{1}=1$，$a_{n+1}=a_{n}+(3n+1)$。 (1) 請推測$a_{n}$的值（以$n$表示）。 (2) 試用數學歸納法證明(1)之結果。",
    "q-s2-1-1-0056": r"設數列$\langle a_{n} \rangle$的遞迴關係式為$a_{1}=2,\ a_{n}=3a_{n-1}+2$（$n\ge 2$）。 (1) 寫出$a_{2}$、$a_{3}$。 (2) 猜測一般項$a_{n}$。 (3) 使用數學歸納法證明你的猜測是正確的。",
    "q-s2-1-1-0060": r"設數列$\langle a_{n} \rangle$的遞迴關係式為$a_{1}=\frac{1}{2},\ a_{n}=\frac{n}{n+1}a_{n-1}$（$n$為自然數，$n\ge 2$）。 (1) 寫出$a_{2}$、$a_{3}$。 (2) 猜測一般項$a_{n}$。 (3) 使用數學歸納法驗證你的猜測。",
    "q-s2-1-1-0061": r"數列$\langle a_{n} \rangle$中，$a_{1}=0,\ a_{n+1}=\frac{1+a_{n}}{5-4a_{n}}$，$n\ge 1$。 (1) 寫出$a_{2}$、$a_{3}$、$a_{4}$、$a_{5}$。 (2) 歸納$a_{n}$與$n$的關係式。 (3) 證明(2)中所歸納的關係式正確。",
    "q-s2-1-1-0062": r"已知一數列的遞迴定義式為$a_{1}=3,\ a_{n+1}-a_{n}=4n+3$（$n\in N$）。 (1) 試求此數列的一般項$a_{n}$。 (2) 利用數學歸納法證明第(1)題的結果。",
    "q-s2-1-1-0063": r"已知一數列$\langle a_{n} \rangle$定義為$a_{1}=1,\ a_{n+1}=\frac{3a_{n}-1}{4a_{n}-1}$，$n=1,2,3,\dots$。 (1) 求$a_{2}$、$a_{3}$、$a_{4}$。 (2) 觀察(1)的規則性，並推測第$n$項$a_{n}$（以$n$表示）。 (3) 證明在(2)中所推測的結果。",
    "q-s2-1-1-0064": r"設$n$是正整數，$a_{n}=5^n+2-4n-9$，$a_{n}$恆為正整數$P$的倍數，則 (1) 請推測此正整數$P$的最大值。 (2) 以數學歸納法證明：$a_{n}$恆為你找的這個最大自然數$P$的倍數。",
    "q-s2-1-1-0065": r"對任一正整數$n$，$4^{2n+1}+3^{n+2}$恆為某一質數$p$的倍數，(1) 試推測此質數$p$。 (2) 請用數學歸納法證明你的推測是正確的。",
    "q-s2-1-1-0067": r"設$n$為正整數，(1) 試判斷$4^{2n+1}+3^{n+2}$恆為哪一正質數的倍數？ (2) 並以數學歸納法證明你的推測。",
    "q-s2-1-1-0068": r"$n\in N$，證明：$3\times 5^{2n+1}+2^{3n+1}$是$17$的倍數。",
    "q-s2-1-1-0069": r"試利用數學歸納法證明：$1^3+2^3+3^3+\cdots+n^3=\frac{n^{2}(n+1)^{2}}{4}$，$n\in N$。",
    "q-s2-1-1-0072": r"$n\in N$，試以數學歸納法證明：$1+\frac{1}{\sqrt{2}}+\frac{1}{\sqrt{3}}+\cdots+\frac{1}{\sqrt{n}}\le 2\sqrt{n}-1$。",
    "q-s2-1-1-0074": r"如下圖，$A$柱中有$n$個大小不同的圓盤由大而小往上堆疊，若要從$A$柱全部搬移至$B$柱，每次只能搬動一圓盤，且每次都必須先經中間柱（不可由$A$直接放入$B$），且大盤不可放在小盤之上。設共要搬動$a_{n}$次，若$a_{n+1}=pa_{n}+k$，求數對$(p,k)=$______。 [圖:program-db/imports/packs/s2-1-1/assets/media/image39.png]",
}

ANSWER_TEXT_OVERRIDES: dict[str, str] = {
    "q-s2-1-1-0003": r"(1)$a_{n}=3n+2$；(2)$a_{n}=2^{n-3}$；(3)$a_{n}=(-1)^{n-1}$；(4)$a_{n}=2(-1)^{n-1}$",
    "q-s2-1-1-0004": r"(1)",
    "q-s2-1-1-0020": r"$4$",
    "q-s2-1-1-0023": r"當$r=\frac{1}{2}$時，$a=24$，三數為$24,12,6$；當$r=2$時，$a=6$，三數為$6,12,24$",
    "q-s2-1-1-0024": r"$36$",
}

EXPLANATION_TEXT_OVERRIDES: dict[str, str] = {
    "q-s2-1-1-0003": "【解析】(1) 表首項為$5$，公差為$3$之等差數列，$a_{n}=a_{1}+(n-1)d=5+(n-1)\\cdot 3=3n+2$。\n(2) 表首項為$\\frac{1}{4}$，公比為$2$之等比數列，$a_{n}=a_{1}\\cdot r^{n-1}=\\frac{1}{4}\\cdot 2^{n-1}=2^{n-3}$。\n(3) $a_{n}=(-1)^{n-1}$。\n(4) $a_{n}=2(-1)^{n-1}$。",
    "q-s2-1-1-0004": "【解析】$a_{1}=2$，$a_{2}=-1$，$a_{3}=\\frac{1}{2}$，$a_{4}=2$，$a_{5}=-1$，$a_{6}=\\frac{1}{2}$，$\\ldots$，由循環性知每$3$個一循環，$1000\\div 3=333\\cdots 1$，故$a_{1000}=2$。\n故選(1)。",
    "q-s2-1-1-0007": "【解析】因為$a_{6}=a_{2}+4d$，所以$14=30+4d$，解得$d=-4$；又由$a_{2}=a_{1}+d$，得$a_{1}=a_{2}-d=30-(-4)=34$。\n由一般項$a_{n}=a_{1}+(n-1)d$，得$a_{n}=34+(n-1)(-4)=38-4n$，再將$n=22$代入，得$a_{22}=38-4\\cdot 22=-50$。",
    "q-s2-1-1-0020": "【解析】設首項為$a$，公比為$r$，則$a_{n}=ar^{n-1}$。因前$9$項的乘積為$a^9r^{36}=512$，故$ar^4=2$，所以$a_{3}a_{7}=(ar^2)(ar^6)=(ar^4)^2=4$。",
    "q-s2-1-1-0023": "【教冊題】【解析】設三數為$a$，$ar$，$ar^2$，則$a+ar+ar^2=42$，且$a^2+a^2r^2+a^2r^4=756$。即$a(1+r+r^2)=42$，$a^2(1+r^2+r^4)=756$。兩式相除得$a(1-r+r^2)=18$，故$\\frac{1+r+r^2}{1-r+r^2}=\\frac{7}{3}$。整理得$3+3r+3r^2=7-7r+7r^2$，可得$2r^2-5r+2=0$，所以$r=2$或$\\frac{1}{2}$。當$r=2$時，$a=6$，三數為$6,12,24$；當$r=\\frac{1}{2}$時，$a=24$，三數為$24,12,6$。",
    "q-s2-1-1-0024": "【解析】設三正整數成等比數列為$a$，$ar$，$ar^2$，則$a+ar+ar^2=52$，且$\\frac{1}{a}+\\frac{1}{ar}+\\frac{1}{ar^2}=\\frac{13}{36}$。因此$a(1+r+r^2)=52$，且$\\frac{1+r+r^2}{ar^2}=\\frac{13}{36}$。兩式相乘得$\\frac{(1+r+r^2)^2}{r^2}=52\\cdot\\frac{13}{36}$，故$\\frac{1+r+r^2}{r}=\\frac{13}{3}$。整理得$3r^2-10r+3=0$，所以$r=3$或$\\frac{1}{3}$。代入得$a=4$或$36$，三數為$4,12,36$或$36,12,4$，故最大者為$36$。",
}


TITLE_OVERRIDES: dict[str, str] = {
    "q-s2-1-1-0001": "範例1：數列前五項",
    "q-s2-1-1-0002": "隨堂練習：數列前五項",
    "q-s2-1-1-0003": "範例2：依規則求一般式",
    "q-s2-1-1-0004": "範例3：遞迴數列求項值",
    "q-s2-1-1-0005": "範例4：括號分組定位",
    "q-s2-1-1-0006": "隨堂練習：數對序列定位",
    "q-s2-1-1-0007": "範例5：等差數列求一般項",
    "q-s2-1-1-0008": "隨堂練習：等差數列正負判斷",
    "q-s2-1-1-0009": "範例6：等差數列求第15項",
    "q-s2-1-1-0010": "範例7：插入等差中項",
    "q-s2-1-1-0011": "隨堂練習：插入等差中項求$k$",
    "q-s2-1-1-0012": "範例8：月曆日期和",
    "q-s2-1-1-0013": "隨堂練習：星期三日期和",
    "q-s2-1-1-0014": "範例9：等差數列第$m+n$項",
    "q-s2-1-1-0015": "隨堂練習：等差數列混合條件",
    "q-s2-1-1-0016": "隨堂練習：循環小數等差數列",
    "q-s2-1-1-0017": "範例10：等比數列基本量",
    "q-s2-1-1-0018": "隨堂練習：等比數列求第4項",
    "q-s2-1-1-0019": "範例11：等比數列判斷",
    "q-s2-1-1-0020": "隨堂練習：等比數列乘積條件",
    "q-s2-1-1-0021": "範例12：等比與等差混合",
    "q-s2-1-1-0022": "隨堂練習：循環小數等比數列",
    "q-s2-1-1-0023": "範例13：等比三數求值",
    "q-s2-1-1-0024": "隨堂練習：三正整數成等比",
    "q-s2-1-1-0025": "範例14：三角形邊長等比",
    "q-s2-1-1-0026": "範例15：等比與等差平均",
    "q-s2-1-1-0027": "範例16：插入兩數求$a,b$",
    "q-s2-1-1-0028": "隨堂練習：四數混合條件",
    "q-s2-1-1-0029": "隨堂練習：等差與等比性質",
    "q-s2-1-1-0030": "隨堂練習：指數化等比判斷",
    "q-s2-1-1-0031": "範例17：反覆稀釋問題",
    "q-s2-1-1-0032": "隨堂練習：倒三角形面積和",
    "q-s2-1-1-0033": "範例1：分式遞迴推測",
    "q-s2-1-1-0034": "範例2：線性遞迴求一般項",
    "q-s2-1-1-0035": "隨堂練習：線性遞迴與平移",
    "q-s2-1-1-0036": "範例3：由$S_n$求$a_n$",
    "q-s2-1-1-0037": "隨堂練習：由$S_n$求$a_n$",
    "q-s2-1-1-0038": "隨堂練習：前$n$項和判斷",
    "q-s2-1-1-0039": "範例4：立方增量遞迴",
    "q-s2-1-1-0040": "範例5：一階線性遞迴",
    "q-s2-1-1-0041": "範例6：等比增量遞迴",
    "q-s2-1-1-0042": "範例7：化為等比形式",
    "q-s2-1-1-0043": "隨堂練習：線性遞迴求$a_n$",
    "q-s2-1-1-0044": "範例8：分式遞迴判斷",
    "q-s2-1-1-0045": "隨堂練習：遞迴數列判斷",
    "q-s2-1-1-0046": "範例9：整數排列遞迴",
    "q-s2-1-1-0047": "範例10：直線分割區域數",
    "q-s2-1-1-0048": "隨堂練習：圓分割區域數",
    "q-s2-1-1-0049": "範例11：三角形地磚規律",
    "q-s2-1-1-0050": "隨堂練習：正五邊形黑點數",
    "q-s2-1-1-0051": "隨堂練習：雪花曲線周長面積",
    "q-s2-1-1-0052": "範例1：累加型遞迴",
    "q-s2-1-1-0053": "範例2：交錯數列一般項",
    "q-s2-1-1-0054": "範例3：奇數和數列歸納",
    "q-s2-1-1-0055": "隨堂練習：等差增量數列歸納",
    "q-s2-1-1-0056": "範例4：線性遞迴數列歸納",
    "q-s2-1-1-0057": "範例5：分式遞迴數列歸納",
    "q-s2-1-1-0058": "隨堂練習：分式遞迴數列歸納",
    "q-s2-1-1-0059": "範例6：線性遞迴數列歸納",
    "q-s2-1-1-0060": "隨堂練習：乘積型遞迴歸納",
    "q-s2-1-1-0061": "隨堂練習：分式遞迴猜測與證明",
    "q-s2-1-1-0062": "範例7：差分型遞迴歸納",
    "q-s2-1-1-0063": "隨堂練習：分式遞迴一般項",
    "q-s2-1-1-0064": "範例8：倍數性質歸納",
    "q-s2-1-1-0065": "隨堂練習：整除質數推測",
    "q-s2-1-1-0066": "隨堂練習：81整除證明",
    "q-s2-1-1-0067": "隨堂練習：整除質數推測",
    "q-s2-1-1-0068": "隨堂練習：17整除證明",
    "q-s2-1-1-0069": "範例9：立方和公式證明",
    "q-s2-1-1-0070": "隨堂練習：乘積和公式證明",
    "q-s2-1-1-0071": "範例10：調和和式下界",
    "q-s2-1-1-0072": "隨堂練習：根式和上界",
    "q-s2-1-1-0073": "隨堂練習：證明$3^n>n^3$",
    "q-s2-1-1-0074": "範例11：限制版河內塔",
    "q-s2-1-1-0075": "隨堂練習：$L$形骨牌鋪板",
}


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


def normalize_rich_text(text: str) -> str:
    text = text.replace("\r", " ").replace("\n", " ")
    text = text.replace("$\\langle $a_{n}$ \\rangle$", "$\\langle a_{n} \\rangle$")
    text = text.replace("$\\langle $a_n$ \\rangle$", "$\\langle a_n \\rangle$")
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


def main() -> None:
    data = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = data["questions"] if isinstance(data, dict) else data

    for question in questions:
        qid = question["id"]
        question_text = normalize_rich_text(str(question.get("question_text", "")))
        question_text = QUESTION_TEXT_OVERRIDES.get(qid, question_text)
        question["question_text"] = question_text
        question["title"] = TITLE_OVERRIDES.get(qid, str(question.get("title", "")).strip())
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
