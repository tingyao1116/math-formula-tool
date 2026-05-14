from __future__ import annotations

import json
from pathlib import Path


PACK_PATH = Path(r"program-db/imports/packs/s2-2-1/questions.json")


OVERRIDES: dict[str, dict[str, str]] = {
    "q-s2-2-1-0001": {
        "title": "範例1：邏輯命題真偽判斷",
    },
    "q-s2-2-1-0002": {
        "title": "範例2：敘述真假判斷",
    },
    "q-s2-2-1-0003": {
        "title": "範例3：正確敘述判斷",
    },
    "q-s2-2-1-0004": {
        "title": "隨堂練習：命題真假與否定",
    },
    "q-s2-2-1-0005": {
        "title": "隨堂練習：不等式與否定敘述",
    },
    "q-s2-2-1-0006": {
        "title": "隨堂練習：實數命題真假判斷",
    },
    "q-s2-2-1-0014": {
        "title": "範例1：集合的表列式與描述法",
    },
    "q-s2-2-1-0023": {
        "title": "隨堂練習：二元一次方程組交集",
        "explanation_text": "【解析】聯立$x+y=3$與$2x+y=5$，兩式相減得$x=2$，代回$x+y=3$得$y=1$。因此$A\\cap B=\\{(2,1)\\}$。",
        "answer_text": "$A\\cap B=\\{(2,1)\\}$",
    },
    "q-s2-2-1-0025": {
        "title": "範例：數對集合相等求參數",
        "explanation_text": "【解析】由$\\begin{cases}3x-y=1\\\\2x+y=4\\end{cases}$解得$(x,y)=(1,2)$，故$A=\\{(1,2)\\}$。又因$A=B$，所以$(1,2)$也必滿足$x-y=a$與$2x-y=b$，因此$a=1-2=-1$，$b=2\\cdot1-2=0$。故只有$(1)$正確。",
    },
    "q-s2-2-1-0034": {
        "title": "範例：由聯集交集反求參數",
        "explanation_text": "【解析】先因式分解$2x^3+5x^2+x-2=(x+2)(x+1)(2x-1)$，故$A=\\{x\\mid -2<x<-1\\text{ 或 }x>\\frac12\\}$。由題意$A\\cup B=\\{x\\mid x>-2\\}$且$A\\cap B=\\{x\\mid \\frac12<x\\le3\\}$，可知$B$必為$\\{x\\mid -1\\le x\\le 3\\}$。因此$x^2+ax+b=(x+1)(x-3)=x^2-2x-3$，故$(a,b)=(-2,-3)$，選$(2)$。",
    },
    "q-s2-2-1-0036": {
        "title": "範例：聯集為全體實數的參數範圍",
        "explanation_text": "【解析】由$x^2-3x+2=(x-1)(x-2)$，得$A=\\{x\\mid x<1\\text{ 或 }x>2\\}$。若要使$A\\cup B=\\mathbb{R}$，則區間$[1,2]$中的每個實數都必須落在$B$中，也就是對所有$x\\in[1,2]$都有$x^2+ax+1>0$。因拋物線開口向上，只需檢查端點即可：$f(1)=a+2>0$與$f(2)=2a+5>0$。兩者合併得$a>-2$，故選$(4)$。",
    },
    "q-s2-2-1-0037": {
        "title": "範例：由解集合反求二次式",
        "explanation_text": "【解析】因$ax^2+bx+c<0$的解集合為$-2<x<5$，故可設$ax^2+bx+c=a(x+2)(x-5)$，且$a>0$。展開得$ax^2+bx+c=ax^2-3ax-10a$，因此$a:b:c=1:(-3):(-10)$。$(2)$ 將$b$改號後，$ax^2-bx+c=ax^2+3ax-10a=a(x+5)(x-2)$。因$a>0$，故其解集合為$x<-5$或$x>2$。$(3)$ $\\frac{cx+2a}{ax+b}=\\frac{-10ax+2a}{ax-3a}=\\frac{-2(5x-1)}{x-3}$。解$\\frac{-2(5x-1)}{x-3}\\ge0$，得$\\frac15\\le x<3$。",
    },
    "q-s2-2-1-0039": {
        "title": "範例17：兩人同時做對的比例",
        "answer_text": "$\\frac{7}{12}$",
        "explanation_text": "【解析】設全部試題占$1$。則甲做錯$\\frac13$，乙做錯$\\frac14$，兩人都做錯$\\frac16$。所以至少有一人做錯的比例為$\\frac13+\\frac14-\\frac16=\\frac{5}{12}$。因此兩人都做對的比例為$1-\\frac{5}{12}=\\frac{7}{12}$。",
    },
    "q-s2-2-1-0064": {
        "title": "範例14：兩位數成績排列計數",
        "explanation_text": "【解析】可用的數字為$\\{0,4,5,6,7,8,9\\}$。$(1)$ 不小於$60$分時，十位數可選$6,7,8,9$共$4$種，個位數可任選$7$種，故共有$4\\times7=28$個。$(2)$ 逐一列出為$3$的倍數的數，可得$45,48,54,57,60,66,69,75,78,84,87,90,96,99$，共$14$個。$(3)$ 由小到大排列時，所有$40$多分共有$7$個，所有$50$多分也有$7$個，因此第$12$個數落在$50$多分中，依序為$54,55,56,57,58,59$，故第$12$個數是$57$。",
    },
    "q-s2-2-1-0070": {
        "title": "隨堂練習：3600 的因數個數",
        "answer_text": "$(1)45$個；$(2)36$個",
        "explanation_text": "【解析】已知$3600=2^4\\times3^2\\times5^2$。$(1)$ 正因數個數為$(4+1)(2+1)(2+1)=45$。$(2)$ 偶因數需至少含一個因數$2$，故$2$的指數可取$1,2,3,4$共$4$種，$3$與$5$的指數各可取$0,1,2$共$3$種，所以偶因數個數為$4\\times3\\times3=36$。",
    },
    "q-s2-2-1-0080": {
        "title": "範例：倍數個數比較",
        "explanation_text": "【解析】$x=\\left\\lfloor\\frac{2100}{3}\\right\\rfloor-\\left\\lfloor\\frac{2100}{6}\\right\\rfloor=700-350=350$。$y=\\left\\lfloor\\frac{2100}{5}\\right\\rfloor-\\left\\lfloor\\frac{2100}{10}\\right\\rfloor-\\left\\lfloor\\frac{2100}{15}\\right\\rfloor+\\left\\lfloor\\frac{2100}{30}\\right\\rfloor=420-210-140+70=140$。$z=\\left\\lfloor\\frac{2100}{7}\\right\\rfloor-\\left\\lfloor\\frac{2100}{14}\\right\\rfloor-\\left\\lfloor\\frac{2100}{21}\\right\\rfloor-\\left\\lfloor\\frac{2100}{35}\\right\\rfloor+\\left\\lfloor\\frac{2100}{42}\\right\\rfloor+\\left\\lfloor\\frac{2100}{70}\\right\\rfloor+\\left\\lfloor\\frac{2100}{105}\\right\\rfloor-\\left\\lfloor\\frac{2100}{210}\\right\\rfloor=300-150-100-60+50+30+20-10=80$。因此$x>y>z$，且$x=350$、$y=140$，故選$(1)(2)(4)$。",
    },
    "q-s2-2-1-0081": {
        "title": "隨堂練習：500 內倍數個數",
        "answer_text": "$(1)166$個；$(2)33$個",
        "explanation_text": "【解析】$(1)$ 不大於$500$的自然數中，$3$的倍數個數為$\\left\\lfloor\\frac{500}{3}\\right\\rfloor=166$。$(2)$ 既是$3$的倍數又是$5$的倍數，等同於$15$的倍數，因此個數為$\\left\\lfloor\\frac{500}{15}\\right\\rfloor=33$。",
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
