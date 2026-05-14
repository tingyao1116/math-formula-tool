#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LEGACY_JS = ROOT / "data" / "formula-content.js"
SOURCE_REF = "改國一上1 數線與正負數.docx"
SOURCE_HIT = "program-db/database/formula-db.json"


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def ensure_list(v):
    if isinstance(v, list):
        return v
    if v is None:
        return []
    return [v]


def build_topics() -> List[Dict]:
    base = {
        "stage": "國中",
        "grade": "國一",
        "term": "上學期",
        "difficulty": "基礎",
        "domain": "數與量",
        "chapterRole": "主題",
        "parentId": "",
        "contentTypes": ["公式", "定義", "題型", "使用技巧", "注意事項", "常見錯誤"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "tags": ["word匯入", "教學核心"],
        "relatedChapters": [],
        "relatedTopicIds": [],
    }
    chapter_111 = {"chapter": "正負數與數線", "chapterCode": "j1-1-1"}
    chapter_112 = {"chapter": "正負數四則與運算律", "chapterCode": "j1-1-2"}

    rows = [
        {
            "id": "j1-1-1-relative-quantity-sign",
            "title": "相對量與正負數",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "核心概念", "values": ["正數：$x>0$，負數：$x<0$，零：$x=0$。"]},
                    {"label": "生活對應", "values": ["高於基準記正、低於基準記負。"]},
                    {"label": "學習提醒", "values": ["$0$ 不是正數也不是負數。"]},
                ],
            },
            "usage": ["用於溫度、海拔、盈虧等有基準點的情境。"],
            "examples": ["零上 $5^\\circ\\mathrm{C}$ 記為 $+5$，零下 $3^\\circ\\mathrm{C}$ 記為 $-3$。"],
            "tips": ["先找基準點，再決定正負號。"],
            "notes": ["此主題對應講義的正負數意義與相對量。"],
            "mistakes": ["把 $0$ 誤判成正數或負數。"],
            **chapter_111,
            **base,
        },
        {
            "id": "j1-1-1-number-system-overview",
            "title": "整數與有理數分類",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "整數", "values": ["$\\mathbb{Z}=\\{\\ldots,-2,-1,0,1,2,\\ldots\\}$"]},
                    {"label": "有理數", "values": ["$\\mathbb{Q}=\\left\\{\\frac{a}{b}\\mid a,b\\in\\mathbb{Z},\\ b\\neq0\\right\\}$"]},
                    {"label": "提醒", "values": ["有限小數與循環小數都屬於有理數。"]},
                ],
            },
            "usage": ["用於判斷數的類型，建立後續運算基礎。"],
            "examples": ["$-4,0,7$ 是整數；$\\frac{1}{3},-2.5$ 是有理數。"],
            "tips": ["能寫成分數就屬於有理數。"],
            "notes": ["依講義中的數的概念整理。"],
            "mistakes": ["把無理數（如 $\\sqrt{2}$）誤判為有理數。"],
            **chapter_111,
            **base,
        },
        {
            "id": "j1-1-1-number-line-elements",
            "title": "數線三要素與座標",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "三要素", "values": ["原點、方向、單位長。"]},
                    {"label": "座標", "values": ["數線上每一點對應一個實數。"]},
                    {"label": "表示法", "values": ["點 $A(a)$ 表示點 $A$ 的座標為 $a$。"]},
                ],
            },
            "usage": ["用於在圖上定位數值、讀取點的位置。"],
            "examples": ["點 $A(-2.5)$ 在原點左側 $2.5$ 單位。"],
            "tips": ["先確認正向，再讀距離。"],
            "notes": ["對應講義中數線作法與座標定義。"],
            "mistakes": ["忽略單位長，導致座標讀錯。"],
            **chapter_111,
            **base,
        },
        {
            "id": "j1-1-1-order-and-interval",
            "title": "數線大小比較與區間",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "大小關係", "values": ["在數線上越右邊的數越大。"]},
                    {"label": "開區間", "values": ["$a<x<b$ 對應區間 $(a,b)$。"]},
                    {"label": "閉區間", "values": ["$a\\le x\\le b$ 對應區間 $[a,b]$。"]},
                ],
            },
            "usage": ["用於不等式解集與範圍表示。"],
            "examples": ["$-2<x\\le3$ 可寫成 $(-2,3]$。"],
            "tips": ["空心點表示不含端點，實心點表示含端點。"],
            "notes": ["延伸講義的數線範圍表示。"],
            "mistakes": ["把 $<$ 和 $\\le$ 的端點畫法混淆。"],
            **chapter_111,
            **base,
        },
        {
            "id": "j1-1-1-opposite-number",
            "title": "相反數與對稱",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "相反數", "values": ["$a$ 的相反數是 $-a$。"]},
                    {"label": "和為零", "values": ["$a+(-a)=0$。"]},
                    {"label": "幾何意義", "values": ["相反數在數線上關於原點對稱。"]},
                ],
            },
            "usage": ["用於加減法轉換與符號判斷。"],
            "examples": ["$5$ 與 $-5$ 互為相反數。"],
            "tips": ["相反數是改變符號，不是取倒數。"],
            "notes": ["對應講義的相反數段落。"],
            "mistakes": ["把相反數與絕對值混為一談。"],
            **chapter_111,
            **base,
        },
        {
            "id": "j1-1-1-absolute-value-definition",
            "title": "絕對值的定義與幾何意義",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "定義", "values": ["$|x|=\\begin{cases}x,&x\\ge0\\\\-x,&x<0\\end{cases}$"]},
                    {"label": "距離觀點", "values": ["$|x|$ 是點 $x$ 到原點的距離。"]},
                    {"label": "性質", "values": ["$|x|\\ge0$，且 $|x|=|-x|$。"]},
                ],
            },
            "usage": ["用於描述距離、誤差、範圍。"],
            "examples": ["$|-7|=7$，$|3|=3$。"],
            "tips": ["絕對值結果不會是負數。"],
            "notes": ["對應講義絕對值章節。"],
            "mistakes": ["把 $|x|$ 直接去符號卻沒分情況。"],
            **chapter_111,
            **base,
        },
        {
            "id": "j1-1-1-distance-midpoint",
            "title": "數線兩點距離與中點",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "距離公式", "values": ["$d(A,B)=|a-b|$"]},
                    {"label": "中點公式", "values": ["$M=\\frac{a+b}{2}$"]},
                    {"label": "對稱關係", "values": ["$|\\overline{AM}|=|\\overline{MB}|$"]},
                ],
            },
            "usage": ["用於區間中點、平均位置、位移分析。"],
            "examples": ["$A(-3),B(11)$ 的中點為 $\\frac{-3+11}{2}=4$。"],
            "tips": ["距離要取絕對值，中點不需取絕對值。"],
            "notes": ["對應講義中點與距離範例。"],
            "mistakes": ["把距離算成 $a-b$ 忘記取絕對值。"],
            **chapter_111,
            **base,
        },
        {
            "id": "j1-1-1-absolute-value-equation",
            "title": "絕對值方程與不等式入門",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "方程", "values": ["$|x-a|=b\\;(b\\ge0)\\Rightarrow x=a\\pm b$"]},
                    {"label": "小於型", "values": ["$|x-a|<b\\Rightarrow a-b<x<a+b$"]},
                    {"label": "大於型", "values": ["$|x-a|>b\\Rightarrow x<a-b\\ \\text{或}\\ x>a+b$"]},
                ],
            },
            "usage": ["用於求距離固定或距離範圍的解。"],
            "examples": ["$|x-1|=3\\Rightarrow x=4$ 或 $x=-2$。"],
            "tips": ["先確認 $b$ 是否為非負。"],
            "notes": ["對應講義絕對值運算與方程。"],
            "mistakes": ["把 $|x-a|=b$ 只解成一個答案。"],
            **chapter_111,
            **base,
        },
        {
            "id": "j1-1-2-integer-addition",
            "title": "正負數加法規則",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "同號相加", "values": ["同號相加，取同號，絕對值相加。"]},
                    {"label": "異號相加", "values": ["異號相加，取絕對值較大者之符號，絕對值相減。"]},
                    {"label": "示例", "values": ["$(-8)+3=-(8-3)=-5$。"]},
                ],
            },
            "usage": ["用於整數加法、位移與溫度變化。"],
            "examples": ["$(+3)+(+5)=+8$，$(-3)+(-5)=-8$。"],
            "tips": ["先判斷同號或異號再運算。"],
            "notes": ["對應講義負數加法範例 1~4。"],
            "mistakes": ["異號相加時把絕對值做相加。"],
            **chapter_112,
            **base,
        },
        {
            "id": "j1-1-2-integer-subtraction",
            "title": "減法轉加法與符號處理",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "核心公式", "values": ["$a-b=a+(-b)$"]},
                    {"label": "連續減法", "values": ["$a-b-c=a+(-b)+(-c)$"]},
                    {"label": "示例", "values": ["$8-(-3)=8+3=11$。"]},
                ],
            },
            "usage": ["用於去括號與混合運算前置整理。"],
            "examples": ["$-8-3=-8+(-3)=-11$。"],
            "tips": ["遇到減號先改寫成加負數。"],
            "notes": ["對應講義負數減法範例 5~7。"],
            "mistakes": ["把 $a-(-b)$ 錯算成 $a-b$。"],
            **chapter_112,
            **base,
        },
        {
            "id": "j1-1-2-multiply-divide-sign",
            "title": "正負數乘除法符號法則",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "乘法符號", "values": ["$(+)(+)=+$，$(-)(-) = +$，$(+)(-) = -$。"]},
                    {"label": "除法符號", "values": ["同號得正，異號得負。"]},
                    {"label": "示例", "values": ["$(-4)\\div2=-2$，$(-4)\\div(-2)=2$。"]},
                ],
            },
            "usage": ["用於整數與分數乘除運算。"],
            "examples": ["$4\\times(-2)=-8$，$(-4)\\times(-2)=8$。"],
            "tips": ["先判符號再算絕對值。"],
            "notes": ["對應講義負數乘除法段落。"],
            "mistakes": ["負負得正記成負。"],
            **chapter_112,
            **base,
        },
        {
            "id": "j1-1-2-signed-fraction-operations",
            "title": "正負分數四則運算",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "加減", "values": ["先通分再運算，符號規則同整數。"]},
                    {"label": "乘法", "values": ["$\\frac{a}{b}\\times\\frac{c}{d}=\\frac{ac}{bd}$"]},
                    {"label": "除法", "values": ["$\\frac{a}{b}\\div\\frac{c}{d}=\\frac{a}{b}\\times\\frac{d}{c}\\;(c\\neq0)$"]},
                ],
            },
            "usage": ["用於分數題與混合數題型。"],
            "examples": ["$\\left(-\\frac{2}{7}\\right)+\\left(-\\frac{1}{3}\\right)=-\\frac{13}{21}$。"],
            "tips": ["最後記得約分到最簡。"],
            "notes": ["對應講義正負分數四則範例。"],
            "mistakes": ["除法忘記乘倒數。"],
            **chapter_112,
            **base,
        },
        {
            "id": "j1-1-2-operation-order",
            "title": "四則混合運算順序",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "順序", "values": ["先括號，後乘除，最後加減。"]},
                    {"label": "同級", "values": ["同級運算由左到右。"]},
                    {"label": "示例", "values": ["$-3+4\\times(-2)=-3-8=-11$。"]},
                ],
            },
            "usage": ["用於多步驟整數與分數運算。"],
            "examples": ["$(-6)\\div3+5=3$。"],
            "tips": ["每一步都先寫清楚，避免跳步。"],
            "notes": ["對應講義綜合練習型題目。"],
            "mistakes": ["先做加減，忽略乘除優先。"],
            **chapter_112,
            **base,
        },
        {
            "id": "j1-1-2-comm-assoc-distrib",
            "title": "交換律、結合律、分配律",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "交換律", "values": ["$a+b=b+a$，$ab=ba$"]},
                    {"label": "結合律", "values": ["$(a+b)+c=a+(b+c)$，$(ab)c=a(bc)$"]},
                    {"label": "分配律", "values": ["$a(b+c)=ab+ac$"]},
                ],
            },
            "usage": ["用於快速計算與化簡。"],
            "examples": ["$25\\times32+25\\times68=25\\times(32+68)=2500$。"],
            "tips": ["先觀察是否有共同因數可提。"],
            "notes": ["對應講義加減運算規律段落。"],
            "mistakes": ["把分配律錯寫成 $a(b+c)=ab+c$。"],
            **chapter_112,
            **base,
        },
        {
            "id": "j1-1-2-remove-parentheses",
            "title": "去括號法則",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "正號括號", "values": ["$+(a+b)=a+b$，$+(a-b)=a-b$"]},
                    {"label": "負號括號", "values": ["$-(a+b)=-a-b$，$-(a-b)=-a+b$"]},
                    {"label": "乘法括號", "values": ["$k(a+b)=ka+kb$"]},
                ],
            },
            "usage": ["用於多項式初步化簡與整數括號運算。"],
            "examples": ["$-(3-7)=-3+7=4$。"],
            "tips": ["負號進括號時每一項都要變號。"],
            "notes": ["對應講義去括號與符號轉換。"],
            "mistakes": ["只改第一項符號，漏改後面項。"],
            **chapter_112,
            **base,
        },
        {
            "id": "j1-1-2-factor-common-factor",
            "title": "提出公因式",
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "基本型", "values": ["$ax+ay=a(x+y)$"]},
                    {"label": "含負號", "values": ["$-ax-ay=-a(x+y)$"]},
                    {"label": "逆分配", "values": ["提公因式是分配律的逆運算。"]},
                ],
            },
            "usage": ["用於計算簡化與代數銜接。"],
            "examples": ["$18x-24=6(3x-4)$。"],
            "tips": ["先找數字公因數，再看字母公因式。"],
            "notes": ["配合講義分配律與運算律做整理。"],
            "mistakes": ["只提出數字，漏提出共同字母。"],
            **chapter_112,
            **base,
        },
    ]

    now = now_iso()
    for r in rows:
        r["modifiedAt"] = now
        r["tags"] = list(dict.fromkeys(ensure_list(r.get("tags")) + [r["chapterCode"]]))
    return rows


def build_questions() -> List[Dict]:
    source = SOURCE_REF
    rows = [
        {
            "id": "q-j1-1-1-word01-basic-01",
            "title": "正負數判讀（基礎01）",
            "question_text": "判斷下列數的性質：$-8,\\ 0,\\ +3.5$。",
            "answer_text": "$-8$ 為負數，$0$ 為零，$+3.5$ 為正數。",
            "explanation_text": "依定義：正數大於 $0$，負數小於 $0$，$0$ 不屬於正負數。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "正負數", "topic:j1-1-1-relative-quantity-sign"],
        },
        {
            "id": "q-j1-1-1-word01-basic-02",
            "title": "數線大小比較（基礎02）",
            "question_text": "比較大小：$-4\\ \\square\\ 0\\ \\square\\ 3$（填入 $<$ 或 $>$）。",
            "answer_text": "$-4<0<3$。",
            "explanation_text": "數線上越右邊的數越大，因此 $-4$ 在最左，$3$ 在最右。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "數線", "topic:j1-1-1-order-and-interval"],
        },
        {
            "id": "q-j1-1-1-word01-basic-03",
            "title": "相反數（基礎03）",
            "question_text": "$\\frac{1}{3}$ 的相反數為何？",
            "answer_text": "$-\\frac{1}{3}$。",
            "explanation_text": "相反數是加起來等於 $0$ 的數，所以 $\\frac{1}{3}$ 的相反數是 $-\\frac{1}{3}$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "相反數", "topic:j1-1-1-opposite-number"],
        },
        {
            "id": "q-j1-1-1-word01-basic-04",
            "title": "絕對值計算（基礎04）",
            "question_text": "計算：$|-7|$ 與 $|4|$。",
            "answer_text": "$|-7|=7$，$|4|=4$。",
            "explanation_text": "絕對值表示到原點的距離，距離一定為非負。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "絕對值", "topic:j1-1-1-absolute-value-definition"],
        },
        {
            "id": "q-j1-1-1-word01-basic-05",
            "title": "兩點距離（基礎05）",
            "question_text": "數線上 $A(-3)$、$B(5)$，求 $AB$ 的距離。",
            "answer_text": "$8$。",
            "explanation_text": "$AB=|(-3)-5|=|-8|=8$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "距離", "topic:j1-1-1-distance-midpoint"],
        },
        {
            "id": "q-j1-1-1-word01-basic-06",
            "title": "中點座標（基礎06）",
            "question_text": "數線上 $A(2)$、$B(12)$，求中點座標。",
            "answer_text": "$7$。",
            "explanation_text": "中點公式：$M=\\frac{2+12}{2}=7$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "中點", "topic:j1-1-1-distance-midpoint"],
        },
        {
            "id": "q-j1-1-1-word01-medium-01",
            "title": "絕對值方程（中等01）",
            "question_text": "解方程：$|x-3|=5$。",
            "answer_text": "$x=8$ 或 $x=-2$。",
            "explanation_text": "$|x-3|=5\\Rightarrow x-3=5$ 或 $x-3=-5$，得 $x=8,-2$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "中等",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "絕對值方程", "topic:j1-1-1-absolute-value-equation"],
        },
        {
            "id": "q-j1-1-1-word01-medium-02",
            "title": "區間表示（中等02）",
            "question_text": "將不等式 $-2\\le x<4$ 寫成區間表示法。",
            "answer_text": "$[-2,4)$。",
            "explanation_text": "左端點包含用中括號，右端點不含用小括號。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "中等",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "區間", "topic:j1-1-1-order-and-interval"],
        },
        {
            "id": "q-j1-1-1-word01-medium-03",
            "title": "絕對值與整數個數（中等03）",
            "question_text": "絕對值小於 $5$ 的整數共有幾個？",
            "answer_text": "$9$ 個。",
            "explanation_text": "整數為 $-4,-3,-2,-1,0,1,2,3,4$，共 $9$ 個。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "中等",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "絕對值", "topic:j1-1-1-absolute-value-definition"],
        },
        {
            "id": "q-j1-1-1-word01-medium-04",
            "title": "改變原點（中等04）",
            "question_text": "原數線上 $A(2),B(8),C(10)$，若改以 $C$ 為新原點，單位長不變，則 $A$ 的新座標為何？",
            "answer_text": "$-8$。",
            "explanation_text": "新座標 = 舊座標減去新原點舊座標，故 $2-10=-8$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "中等",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "數線", "topic:j1-1-1-number-line-elements"],
        },
        {
            "id": "q-j1-1-1-word01-advanced-01",
            "title": "距離反求座標（進階01）",
            "question_text": "已知 $|a-6|=3$，求 $a$。",
            "answer_text": "$a=3$ 或 $a=9$。",
            "explanation_text": "$|a-6|=3$ 代表 $a$ 與 $6$ 的距離為 $3$，故在左右兩側：$6\\pm3$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "進階",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "反求", "topic:j1-1-1-absolute-value-equation"],
        },
        {
            "id": "q-j1-1-1-word01-advanced-02",
            "title": "混合數排序（進階02）",
            "question_text": "比較大小並由小到大排列：$-\\frac{3}{4},\\ -0.6,\\ \\frac{1}{3},\\ -1$。",
            "answer_text": "$-1< -\\frac{3}{4}< -0.6< \\frac{1}{3}$。",
            "explanation_text": "$-\\frac{3}{4}=-0.75$，因此四數排序如上。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-1",
            "difficulty": "進階",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-1", "數線比較", "topic:j1-1-1-order-and-interval"],
        },
        {
            "id": "q-j1-1-2-word01-basic-01",
            "title": "整數加法（基礎01）",
            "question_text": "計算：$(+3)+(+5)$ 與 $(-3)+(-5)$。",
            "answer_text": "$8$ 與 $-8$。",
            "explanation_text": "同號相加，絕對值相加並取原符號。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "加法", "topic:j1-1-2-integer-addition"],
        },
        {
            "id": "q-j1-1-2-word01-basic-02",
            "title": "整數減法（基礎02）",
            "question_text": "計算：$8-(-3)$ 與 $-8-3$。",
            "answer_text": "$11$ 與 $-11$。",
            "explanation_text": "$8-(-3)=8+3$；$-8-3=-8+(-3)$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "減法", "topic:j1-1-2-integer-subtraction"],
        },
        {
            "id": "q-j1-1-2-word01-basic-03",
            "title": "乘除符號（基礎03）",
            "question_text": "計算：$(-4)\\times2$、$(-4)\\div(-2)$。",
            "answer_text": "$-8$、$2$。",
            "explanation_text": "異號乘除得負，同號乘除得正。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "乘除法", "topic:j1-1-2-multiply-divide-sign"],
        },
        {
            "id": "q-j1-1-2-word01-basic-04",
            "title": "分數加法（基礎04）",
            "question_text": "計算：$\\left(-\\frac{2}{7}\\right)+\\left(-\\frac{1}{3}\\right)$。",
            "answer_text": "$-\\frac{13}{21}$。",
            "explanation_text": "通分為 $-\\frac{6}{21}-\\frac{7}{21}=-\\frac{13}{21}$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "分數", "topic:j1-1-2-signed-fraction-operations"],
        },
        {
            "id": "q-j1-1-2-word01-basic-05",
            "title": "分數乘法（基礎05）",
            "question_text": "計算：$\\left(-\\frac{5}{8}\\right)\\times\\left(-\\frac{4}{15}\\right)$。",
            "answer_text": "$\\frac{1}{6}$。",
            "explanation_text": "負負得正，約分後得 $\\frac{20}{120}=\\frac{1}{6}$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "分數乘法", "topic:j1-1-2-signed-fraction-operations"],
        },
        {
            "id": "q-j1-1-2-word01-basic-06",
            "title": "運算順序（基礎06）",
            "question_text": "計算：$-3+4\\times(-2)$。",
            "answer_text": "$-11$。",
            "explanation_text": "先算乘法 $4\\times(-2)=-8$，再算加法 $-3+(-8)=-11$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "基礎",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "運算順序", "topic:j1-1-2-operation-order"],
        },
        {
            "id": "q-j1-1-2-word01-medium-01",
            "title": "去括號（中等01）",
            "question_text": "化簡：$-\\,(3-7)+2$。",
            "answer_text": "$6$。",
            "explanation_text": "$-(3-7)=-3+7=4$，所以 $4+2=6$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "中等",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "去括號", "topic:j1-1-2-remove-parentheses"],
        },
        {
            "id": "q-j1-1-2-word01-medium-02",
            "title": "分配律速算（中等02）",
            "question_text": "利用分配律計算：$7\\times(-13)+7\\times13$。",
            "answer_text": "$0$。",
            "explanation_text": "$7[(-13)+13]=7\\times0=0$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "中等",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "分配律", "topic:j1-1-2-comm-assoc-distrib"],
        },
        {
            "id": "q-j1-1-2-word01-medium-03",
            "title": "提出公因式（中等03）",
            "question_text": "將 $18x-24$ 提出最大公因式。",
            "answer_text": "$6(3x-4)$。",
            "explanation_text": "$18x$ 與 $24$ 的最大公因數是 $6$，提出後得 $6(3x-4)$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "中等",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "公因式", "topic:j1-1-2-factor-common-factor"],
        },
        {
            "id": "q-j1-1-2-word01-medium-04",
            "title": "分數除法（中等04）",
            "question_text": "計算：$\\frac{4}{9}\\div\\left(-\\frac{2}{15}\\right)$。",
            "answer_text": "$-\\frac{10}{3}$。",
            "explanation_text": "$\\frac{4}{9}\\times\\left(-\\frac{15}{2}\\right)=-\\frac{60}{18}=-\\frac{10}{3}$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "中等",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "分數除法", "topic:j1-1-2-signed-fraction-operations"],
        },
        {
            "id": "q-j1-1-2-word01-advanced-01",
            "title": "運算律綜合（進階01）",
            "question_text": "利用運算律計算：$(-25)\\times32+(-25)\\times68$。",
            "answer_text": "$-2500$。",
            "explanation_text": "提出公因式：$(-25)(32+68)=(-25)\\times100=-2500$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "進階",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "運算律", "topic:j1-1-2-comm-assoc-distrib"],
        },
        {
            "id": "q-j1-1-2-word01-advanced-02",
            "title": "混合四則（進階02）",
            "question_text": "計算：$\\left(-\\frac{3}{4}\\right)-\\left(\\frac{1}{2}-\\frac{5}{8}\\right)+\\left(-\\frac{1}{3}\\right)$。",
            "answer_text": "$-\\frac{23}{24}$。",
            "explanation_text": "先算括號：$\\frac{1}{2}-\\frac{5}{8}=-\\frac{1}{8}$，原式變成 $-\\frac{3}{4}+\\frac{1}{8}-\\frac{1}{3}$，通分 $24$ 得 $-\\frac{18}{24}+\\frac{3}{24}-\\frac{8}{24}=-\\frac{23}{24}$。",
            "stage": "國中",
            "grade": "國一",
            "chapter": "j1-1-2",
            "difficulty": "進階",
            "source_type": "word_import",
            "source_ref": source,
            "tags": ["j1-1-2", "綜合運算", "topic:j1-1-2-operation-order"],
        },
    ]
    return rows


def upsert_by_id(items: List[Dict], new_rows: List[Dict]) -> Tuple[int, int, int]:
    index = {str(it.get("id", "")).strip(): pos for pos, it in enumerate(items)}
    added = 0
    updated = 0
    skipped = 0
    for row in new_rows:
        rid = str(row.get("id", "")).strip()
        if not rid:
            skipped += 1
            continue
        if rid in index:
            current = items[index[rid]]
            if current == row:
                skipped += 1
            else:
                items[index[rid]] = row
                updated += 1
        else:
            items.append(row)
            index[rid] = len(items) - 1
            added += 1
    return added, updated, skipped


def validate_required_topic(row: Dict) -> List[str]:
    required = ["id", "title", "formula", "stage", "grade", "chapter", "difficulty", "tags", "usage", "examples", "tips", "notes", "mistakes"]
    miss = []
    for k in required:
        v = row.get(k)
        if v is None:
            miss.append(k)
        elif isinstance(v, str) and not v.strip():
            miss.append(k)
        elif isinstance(v, list) and len(v) == 0:
            miss.append(k)
    return miss


def validate_required_question(row: Dict) -> List[str]:
    required = ["id", "title", "question_text", "answer_text", "explanation_text", "stage", "grade", "chapter", "difficulty", "source_type", "source_ref", "tags"]
    miss = []
    for k in required:
        v = row.get(k)
        if v is None:
            miss.append(k)
        elif isinstance(v, str) and not v.strip():
            miss.append(k)
        elif isinstance(v, list) and len(v) == 0:
            miss.append(k)
    return miss


def validate_unique_ids(rows: List[Dict]) -> Tuple[bool, List[str]]:
    seen = {}
    dups = []
    for i, row in enumerate(rows):
        rid = str(row.get("id", "")).strip()
        if not rid:
            dups.append(f"empty@{i}")
            continue
        if rid in seen:
            dups.append(rid)
        else:
            seen[rid] = i
    return (len(dups) == 0), dups


def main():
    t_payload = json.loads(FORMULA_DB.read_text(encoding="utf-8"))
    q_payload = json.loads(QUESTION_DB.read_text(encoding="utf-8"))
    topics = ensure_list(t_payload.get("topics"))
    questions = ensure_list(q_payload.get("questions"))

    topic_rows = build_topics()
    question_rows = build_questions()

    topic_added, topic_updated, topic_skipped = upsert_by_id(topics, topic_rows)
    question_added, question_updated, question_skipped = upsert_by_id(questions, question_rows)

    t_payload["topics"] = topics
    t_payload.setdefault("meta", {})
    t_payload["meta"]["count"] = len(topics)
    t_payload["meta"]["updatedAt"] = now_iso()
    t_payload["meta"]["lastImportSource"] = SOURCE_REF

    q_payload["questions"] = questions
    q_payload.setdefault("meta", {})
    q_payload["meta"]["count"] = len(questions)
    q_payload["meta"]["updatedAt"] = now_iso()
    q_payload["meta"]["lastImportSource"] = SOURCE_REF

    FORMULA_DB.write_text(json.dumps(t_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    QUESTION_DB.write_text(json.dumps(q_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    sync_err = ""
    try:
        import sys

        sys.path.insert(0, str(ROOT / "program-db" / "scripts"))
        from sync_legacy_bridge import sync_legacy_js_from_db

        sync_legacy_js_from_db(FORMULA_DB)
    except Exception as ex:  # noqa
        sync_err = str(ex)

    topic_id_ok, topic_dups = validate_unique_ids(topics)
    question_id_ok, question_dups = validate_unique_ids(questions)
    topic_required_issues = []
    for row in topic_rows:
        misses = validate_required_topic(row)
        if misses:
            topic_required_issues.append((row.get("id"), misses))
    question_required_issues = []
    for row in question_rows:
        misses = validate_required_question(row)
        if misses:
            question_required_issues.append((row.get("id"), misses))

    # UTF-8 decode & replacement char check
    utf8_ok = True
    replacement_hits = 0
    for path in [FORMULA_DB, QUESTION_DB, LEGACY_JS]:
        txt = path.read_text(encoding="utf-8")
        replacement_hits += txt.count("\uFFFD")
    if replacement_hits > 0:
        utf8_ok = False

    summary = {
        "source_hit": SOURCE_HIT,
        "topic_added": topic_added,
        "topic_updated": topic_updated,
        "topic_skipped": topic_skipped,
        "question_added": question_added,
        "question_updated": question_updated,
        "question_skipped": question_skipped,
        "errors": len(topic_required_issues) + len(question_required_issues) + (0 if topic_id_ok else 1) + (0 if question_id_ok else 1) + (0 if sync_err == "" else 1),
        "validation": {
            "topic_id_unique": topic_id_ok,
            "question_id_unique": question_id_ok,
            "topic_duplicate_ids": topic_dups[:20],
            "question_duplicate_ids": question_dups[:20],
            "topic_required_missing": topic_required_issues,
            "question_required_missing": question_required_issues,
            "json_parse_ok": True,
            "utf8_decode_ok": True,
            "utf8_replacement_char_absent": utf8_ok,
            "replacement_char_hits": replacement_hits,
            "sync_legacy_js_ok": sync_err == "",
            "sync_legacy_js_error": sync_err,
        },
        "sample_topics": [
            {"id": r["id"], "title": r["title"], "chapter": r["chapterCode"]} for r in topic_rows[:3]
        ],
        "sample_questions": [
            {"id": r["id"], "title": r["title"], "chapter": r["chapter"]} for r in question_rows[:3]
        ],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
