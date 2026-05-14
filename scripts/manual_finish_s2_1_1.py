from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-1-1/questions.json")


OVERRIDES: dict[str, dict[str, str]] = {
    "q-s2-1-1-0014": {
        "question_text": "設自然數$m\\ne n$，若一等差數列的第$m$項為$a$，第$n$項為$b$，則第$m+n$項為______。",
        "explanation_text": "【解析】設首項為$a_1$，公差為$d$，則$a_m=a_1+(m-1)d=a$，$a_n=a_1+(n-1)d=b$。兩式相減得$d=\\frac{a-b}{m-n}$。故$a_{m+n}=a_m+nd=a+n\\cdot\\frac{a-b}{m-n}=\\frac{ma-nb}{m-n}$。",
    },
    "q-s2-1-1-0013": {
        "answer_text": "$23$",
    },
    "q-s2-1-1-0009": {
        "explanation_text": "【解析】設此數列前三項為$a-d$，$a$，$a+d$。由題意得$(a-d)+a+(a+d)=21$，故$3a=21$，得$a=7$。又$(a-d)\\times a\\times (a+d)=280$，代入$a=7$得$(7-d)\\times 7\\times (7+d)=280$，即$49-d^2=40$，故$d^2=9$，所以$d=\\pm 3$。若$d=3$，則此數列前幾項為$4,7,10,13,16,\\ldots$；若$d=-3$，則此數列前幾項為$10,7,4,1,-2,\\ldots$，不合題意中各項皆為正數。故此數列第$15$項為$4+(15-1)\\times 3=46$。",
    },
    "q-s2-1-1-0025": {
        "explanation_text": "【證明】設三邊長為$a$，$ar$，$ar^2$，其中$a>0$，$r>0$。由三角形兩邊和大於第三邊，得$a+ar>ar^2$，$a+ar^2>ar$，$ar+ar^2>a$。化簡可得$r^2-r-1<0$，$r^2-r+1>0$，$r^2+r-1>0$。其中$r^2-r+1=(r-\\frac12)^2+\\frac34>0$恆成立；由$r^2-r-1<0$得$\\frac{1-\\sqrt5}{2}<r<\\frac{1+\\sqrt5}{2}$；又由$r^2+r-1>0$且$r>0$，得$r>\\frac{\\sqrt5-1}{2}$。綜合可得$\\frac{\\sqrt5-1}{2}<r<\\frac{\\sqrt5+1}{2}$。",
    },
    "q-s2-1-1-0030": {
        "explanation_text": "【解析】因$a_1,a_2,a_3,a_4$為等差數列，故$a_{n+1}-a_n=d$為常數。於是$\\frac{b_{n+1}}{b_n}=\\frac{2^{a_{n+1}}}{2^{a_n}}=2^{a_{n+1}-a_n}=2^d$，所以$b_1,b_2,b_3,b_4$為等比數列，故$(1)$對。又$a_3=4$且$0<a_1<2$，故$4=a_1+2d$，得$1<d<2$。因此$a_2=4-d$，故$2<a_2<3$；$a_4=4+d$，故$5<a_4<6$。所以$b_1<b_2$，且$4<b_2<8$、$32<b_4<64$，故$(2)(3)(4)$皆對。又$b_2b_4=2^{a_2+a_4}=2^{2a_3}=2^8=256$，故$(5)$也對。所以選$(1)(2)(3)(4)(5)$。",
    },
    "q-s2-1-1-0034": {
        "explanation_text": "【解析】由$a_n+2a_{n-1}=0$可得$a_n=-2a_{n-1}$（$n\\ge2$）。因此此數列是首項為$3$、公比為$-2$的等比數列，故$a_n=a_1r^{n-1}=3(-2)^{n-1}$。",
    },
    "q-s2-1-1-0035": {
        "answer_text": "$(1)$a_4=17$；$(2)$p=1$；$(3)$a_n=2^n+1$",
        "explanation_text": "【解析】$(1)$ 由$a_1=3$及$a_n=2a_{n-1}-1$，可得$a_2=2a_1-1=5$，$a_3=2a_2-1=9$，$a_4=2a_3-1=17$。$(2)$ 若$a_n-p=2(a_{n-1}-p)$，則展開得$a_n=2a_{n-1}-p$。與已知$a_n=2a_{n-1}-1$比較，可得$p=1$。$(3)$ 由$(2)$知$a_n-1=2(a_{n-1}-1)$。令$b_n=a_n-1$，則$b_1=2$，且$b_n=2b_{n-1}$，所以$\\langle b_n\\rangle$是首項為$2$、公比為$2$的等比數列，故$b_n=2^n$，因此$a_n=2^n+1$。",
    },
    "q-s2-1-1-0036": {
        "answer_text": "$a_1=4$；當$n\\ge2$時，$a_n=2n-1$",
        "explanation_text": "【解析】由$S_n=n^2+3$可得$a_1=S_1=1^2+3=4$。當$n\\ge2$時，$a_n=S_n-S_{n-1}=(n^2+3)-[(n-1)^2+3]=2n-1$。",
    },
    "q-s2-1-1-0038": {
        "explanation_text": "【解析】已知$S_n=n^2+6n+k$。$(A)$ $a_1=S_1=1^2+6+k=7+k$，故正確。$(B)$ 當$n\\ge2$時，$a_n=S_n-S_{n-1}=n^2+6n+k-[(n-1)^2+6(n-1)+k]=2n+5$，故$a_6-a_5=17-15=2$，所以錯。$(C)$ 由上式得$a_2=9$，$a_3=11$，而$a_1=7+k$。數列為等差數列需滿足$a_2-a_1=a_3-a_2=2$，故$9-(7+k)=2$，得$k=0$；反之當$k=0$時，$a_1=7$，且對$n\\ge2$有$a_n=2n+5$，公差皆為$2$，故為等差數列。$(D)$ 當$n\\ge3$時，$a_n-a_{n-1}=(2n+5)-[2(n-1)+5]=2$，故正確。$(E)$ $a_{10}=2\\cdot10+5=25$，故正確。所以選$(A)(C)(D)(E)$。",
    },
    "q-s2-1-1-0039": {
        "explanation_text": "【解析】由$a_{n+1}=a_n+(n+1)^3$且$a_1=1$，可依次展開得$a_n=1+2^3+3^3+\\cdots+n^3$。又$1^3+2^3+\\cdots+n^3=\\left(\\frac{n(n+1)}{2}\\right)^2$，故$a_n=\\left(\\frac{n(n+1)}{2}\\right)^2$。",
    },
    "q-s2-1-1-0040": {
        "explanation_text": "【解析】令$b_n=a_n+n+2$，則$b_{n+1}=a_{n+1}+(n+1)+2=2a_n+(n+1)+(n+1)+2=2(a_n+n+2)=2b_n$。又$b_1=a_1+1+2=4$，故$\\langle b_n\\rangle$是首項為$4$、公比為$2$的等比數列，所以$b_n=4\\cdot2^{n-1}=2^{n+1}$。因此$a_n=b_n-n-2=2^{n+1}-n-2$。",
    },
    "q-s2-1-1-0041": {
        "explanation_text": "【解析】由遞迴關係可得$a_n=2+\\left(\\frac13\\right)^1+\\left(\\frac13\\right)^2+\\cdots+\\left(\\frac13\\right)^{n-1}$。後面是首項為$\\frac13$、公比為$\\frac13$的等比級數，因此$a_n=2+\\frac{\\frac13\\left[1-\\left(\\frac13\\right)^{n-1}\\right]}{1-\\frac13}=2+\\frac12\\left[1-\\left(\\frac13\\right)^{n-1}\\right]=\\frac52-\\frac12\\left(\\frac13\\right)^{n-1}$。",
    },
    "q-s2-1-1-0042": {
        "answer_text": "$\\alpha=6$，$a_n=6-5\\left(\\frac12\\right)^{n-1}$",
        "explanation_text": "【解析】由$a_{n+1}-\\alpha=\\frac12(a_n-\\alpha)$展開，得$a_{n+1}=\\frac12a_n+\\frac12\\alpha$。與已知$a_{n+1}=\\frac12a_n+3$比較，可得$\\frac12\\alpha=3$，所以$\\alpha=6$。令$b_n=a_n-6$，則$b_{n+1}=\\frac12b_n$，且$b_1=a_1-6=-5$。因此$\\langle b_n\\rangle$是首項為$-5$、公比為$\\frac12$的等比數列，故$b_n=-5\\left(\\frac12\\right)^{n-1}$。所以$a_n=6-5\\left(\\frac12\\right)^{n-1}$。",
    },
    "q-s2-1-1-0043": {
        "answer_text": "$a_n=2^{n+1}-1$",
        "explanation_text": "【解析】令$b_n=a_n+1$，則$b_{n+1}=a_{n+1}+1=2a_n+2=2(a_n+1)=2b_n$。又$b_1=a_1+1=4$，所以$\\langle b_n\\rangle$是首項為$4$、公比為$2$的等比數列，故$b_n=4\\cdot2^{n-1}=2^{n+1}$。因此$a_n=b_n-1=2^{n+1}-1$。",
    },
    "q-s2-1-1-0047": {
        "answer_text": "$(1)$a_1=2$，$a_2=4$，$a_3=7$，$a_4=11$；$(2)$a_n=a_{n-1}+n$（$n\\ge2$）；$(3)$a_n=\\frac{n(n+1)}{2}+1$",
        "explanation_text": "【解析】$(1)$ 當$n=1,2,3,4$時，如圖可得$a_1=2$，$a_2=4$，$a_3=7$，$a_4=11$。[圖:program-db/assets/question-media/s2-1-1/image21.png] [圖:program-db/assets/question-media/s2-1-1/image22.png] $(2)$ 第$n+1$條直線與前$n$條直線各有一個交點，所以被分成$n+1$小段；每一小段都會使平面多出一個區域，故$a_{n+1}=a_n+(n+1)$。$(3)$ 由$a_1=2$且對$n\\ge2$有$a_n-a_{n-1}=n$，得$a_n=2+2+3+\\cdots+n=1+\\frac{n(n+1)}{2}$，因此$a_n=\\frac{n(n+1)}{2}+1$。",
    },
    "q-s2-1-1-0048": {
        "answer_text": "$(1)$a_1=2$，$a_2=4$，$a_3=8$，$a_4=14$；$(2)$a_n=a_{n-1}+2(n-1)$（$n\\ge2$）；$(3)$a_n=n^2-n+2$",
        "explanation_text": "【解析】$(1)$ 當$n=1,2,3,4$時，如圖可得$a_1=2$，$a_2=4$，$a_3=8$，$a_4=14$。[圖:program-db/assets/question-media/s2-1-1/image24.png] $(2)$ 第$n+1$個圓與前$n$個圓最多有$2n$個交點，因此把第$n+1$個圓分成$2n$段，最多新增$2n$個區域，故$a_{n+1}=a_n+2n$。$(3)$ 由$a_1=2$得$a_n=2+2(1+2+\\cdots+(n-1))=2+n(n-1)=n^2-n+2$。",
    },
    "q-s2-1-1-0049": {
        "answer_text": "$(1)$a_5=32$；$(2)$a_1=8$，$a_n=a_{n-1}+6$（$n\\ge2$），$a_n=6n+2$；$(3)$n$的最大值為$16$",
        "explanation_text": "【解析】由圖可得$a_1=8$，$a_2=14$，$a_3=20$，$a_4=26$，因此$a_5=32$。又每往下一個圖形，固定多出$6$塊正三角形地磚，所以遞迴關係式為$a_1=8$，$a_n=a_{n-1}+6$（$n\\ge2$）。故$a_n=8+(n-1)\\cdot6=6n+2$。若有$100$塊地磚，則$6n+2\\le100$，得$n\\le\\frac{98}{6}=16\\frac13$，所以$n$的最大值為$16$。",
    },
    "q-s2-1-1-0050": {
        "explanation_text": "【解析】比較相鄰兩圖可知，第$n$圖比第$n-1$圖多出$4$個頂點黑點與$3(n-1)$個邊上黑點，所以$a_n-a_{n-1}=4+3(n-1)=3n+1$（$n\\ge2$）。又$a_1=5$，故遞迴關係式為$a_1=5$，$a_n=a_{n-1}+3n+1$（$n\\ge2$）。進而$a_4=a_3+(3\\cdot4+1)=22+13=35$，$a_5=a_4+(3\\cdot5+1)=35+16=51$。",
    },
    "q-s2-1-1-0051": {
        "explanation_text": "【解析】$(1)$ 每作一次變化，每一條邊都被替換成$\\frac43$倍長的折線，因此周長滿足$P_n=3\\left(\\frac43\\right)^{n-1}$，故$P_5=3\\left(\\frac43\\right)^4=\\frac{256}{27}$。$(2)$ 每一次操作都使邊數變成原來的$4$倍，所以$b_1=3$，$b_n=4b_{n-1}$（$n\\ge2$），故$b_n=3\\cdot4^{n-1}$，進而$b_5=3\\cdot4^4=768$。$(3)$ 設第$n$個圖形面積為$c_n$，則每一步新增的總面積為$\\frac{\\sqrt3}{12}\\left(\\frac49\\right)^{n-2}$，故$c_1=\\frac{\\sqrt3}{4}$，且$c_n=c_{n-1}+\\frac{\\sqrt3}{12}\\left(\\frac49\\right)^{n-2}$（$n\\ge2$）。將等比級數求和可得$c_n=\\frac{2\\sqrt3}{5}-\\frac{3\\sqrt3}{20}\\left(\\frac49\\right)^{n-1}$，因此重複無限次後的極限面積為$\\frac{2\\sqrt3}{5}$。",
    },
    "q-s2-1-1-0053": {
        "explanation_text": "【解析】由$a_n+a_{n+1}=0$可得$a_{n+1}=-a_n$。又$a_1=1$，故$a_2=-1$，$a_3=1$，$a_4=-1$，數列正負交替出現，因此一般項為$a_n=(-1)^{n-1}$。",
    },
    "q-s2-1-1-0056": {
        "answer_text": "$(1)$a_2=8$，$a_3=26$；$(2)$a_n=3^n-1$；$(3)$見詳解",
        "explanation_text": "【解析】$(1)$ 由遞迴關係式得$a_2=3a_1+2=8$，$a_3=3a_2+2=26$。$(2)$ 觀察可猜測$a_n=3^n-1$。$(3)$ 用數學歸納法證明：當$n=1$時，$a_1=2=3^1-1$，成立。假設$n=k$時成立，即$a_k=3^k-1$，則$a_{k+1}=3a_k+2=3(3^k-1)+2=3^{k+1}-1$，故$n=k+1$時也成立。由數學歸納法知，對所有正整數$n$，皆有$a_n=3^n-1$。",
    },
    "q-s2-1-1-0059": {
        "answer_text": "$(1)$a_n=2^n-1$；$(2)$見詳解",
        "explanation_text": "【解析】$(1)$ 由$a_1=1$，$a_{n+1}=2a_n+1$，可算得$a_2=3$，$a_3=7$，$a_4=15$，$a_5=31$，猜測$a_n=2^n-1$。$(2)$ 用數學歸納法證明：當$n=1$時，$a_1=1=2^1-1$，成立。假設$n=k$時成立，即$a_k=2^k-1$，則$a_{k+1}=2a_k+1=2(2^k-1)+1=2^{k+1}-1$，故$n=k+1$時也成立。由數學歸納法知，對所有正整數$n$，皆有$a_n=2^n-1$。",
    },
    "q-s2-1-1-0060": {
        "answer_text": "$(1)$a_2=\\frac13$，$a_3=\\frac14$；$(2)$a_n=\\frac{1}{n+1}$；$(3)$見詳解",
        "explanation_text": "【解析】$(1)$ 由遞迴關係式得$a_2=\\frac{2}{3}\\cdot\\frac12=\\frac13$，$a_3=\\frac{3}{4}\\cdot\\frac13=\\frac14$。$(2)$ 觀察可猜測$a_n=\\frac{1}{n+1}$。$(3)$ 用數學歸納法證明：當$n=1$時，$a_1=\\frac12=\\frac{1}{1+1}$，成立。假設$n=k$時成立，即$a_k=\\frac{1}{k+1}$，則$a_{k+1}=\\frac{k+1}{k+2}a_k=\\frac{k+1}{k+2}\\cdot\\frac{1}{k+1}=\\frac{1}{k+2}=\\frac{1}{(k+1)+1}$，故$n=k+1$時也成立。由數學歸納法知，對所有正整數$n$，皆有$a_n=\\frac{1}{n+1}$。",
    },
    "q-s2-1-1-0075": {
        "question_text": "請用若干個「$L$形骨牌」將下列圖形蓋滿（但所用骨牌不得重疊，亦不得出格）。(1) $(a)$[圖:program-db/imports/packs/s2-1-1/assets/media/image40.png] $(b)$[圖:program-db/imports/packs/s2-1-1/assets/media/image41.png] $(c)$[圖:program-db/imports/packs/s2-1-1/assets/media/image42.png] $(d)$[圖:program-db/imports/packs/s2-1-1/assets/media/image43.png] $(e)$[圖:program-db/imports/packs/s2-1-1/assets/media/image44.png] (2) 做完(1)中各圖後，請仔細地想一想：處理這些問題有沒有一定的準則？ (3) 你能否歸納出下列結論：任意每邊$2^n$格的正方格棋盤圖，如果其中缺空一格，那麼便可用若干個「$L$形骨牌」不重疊地將其蓋滿。 (4) 請利用數學歸納法證明(3)的結論。",
        "explanation_text": "【解析】$(1)$ $(a)$需$1$個骨牌；$(b)$、$(c)$、$(d)$各需$5$個骨牌；$(e)$需$21$個骨牌。$(2)$ 應先由缺空一格附近著手，把棋盤分成四個較小的同型問題。$(3)$ 每邊$2^n$格的棋盤缺一格後，剩下$4^n-1$格，因此需要的$L$形骨牌數為$\\frac{4^n-1}{3}=4^{n-1}+4^{n-2}+\\cdots+4+1$。$(4)$ 當$n=1$時，命題顯然成立。[圖:program-db/assets/question-media/s2-1-1/image45.png] 假設$n=k$時命題成立。對邊長$2^{k+1}$的棋盤，先在中心放一個$L$形骨牌，使四個邊長$2^k$的子棋盤各缺一格，則每個子棋盤都可依歸納假設鋪滿，所以整個棋盤也可鋪滿。所用骨牌數為$4\\cdot\\frac{4^k-1}{3}+1=\\frac{4^{k+1}-1}{3}$。[圖:program-db/assets/question-media/s2-1-1/image46.png] 由數學歸納法，原命題成立。",
    },
    "q-s2-1-1-0074": {
        "explanation_text": "【解析】[圖:program-db/assets/question-media/s2-1-1/image39.png] 設從$A$柱搬動$n$個圓盤到$B$柱，需要搬動$a_n$次。我們考慮搬動$n+1$個圓盤：先將$A$柱上方$n$個圓盤全部搬到$B$柱上，需$a_n$次；再將最底下那個圓盤搬到$C$柱上；接著將$B$柱上方$n$個圓盤全部搬回$A$柱上，需$a_n$次；再把最底下那個圓盤從$C$柱搬到$B$柱上；最後再將$A$柱上方$n$個圓盤全部搬到$B$柱上，需$a_n$次。故$a_{n+1}=a_n+1+a_n+1+a_n=3a_n+2$，所以$(p,k)=(3,2)$。",
    },
}


def main() -> None:
    data = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    questions = data["questions"]
    by_id = {q["id"]: q for q in questions}

    for qid, fields in OVERRIDES.items():
        question = by_id[qid]
        for field, value in fields.items():
            question[field] = value

    PACK_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
