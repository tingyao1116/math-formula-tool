import json
from pathlib import Path


DB_PATH = Path("program-db/database/question-db.json")


UPDATES = {
    "q-s2-3-2-0003": {
        "answer_text": "(A)",
        "explanation_text": "(A)低度正相關，(B)中度正相關，(C)高度正相關，(D)(E)為中度負相關，故選(A)。",
    },
    "q-s2-3-2-0016": {
        "answer_text": "$a=2$，$b=3$",
        "explanation_text": "$\\mu_x=\\frac{1+a+b+2}{4}=2$，故 $a+b=5$ ……①\n"
        "$\\mu_y=\\frac{3+5+4+4}{4}=4$，且\n"
        "$$0.5=\\frac{(1-2)(3-4)+(a-2)\\times 1+0+0}{\\sqrt{1+(a-2)^2+(b-2)^2}\\times \\sqrt{2}}$$\n"
        "故\n"
        "$$\\frac{1}{4}=\\frac{(a-1)^2}{2\\left[(a-2)^2+(b-2)^2+1\\right]}$$\n"
        "即 $2(a-1)^2=(a-2)^2+(b-2)^2+1$ ……②\n"
        "由①知 $b-2=3-a$，代入②得 $2(a-1)^2=(a-2)^2+(3-a)^2+1$，故 $a=2$，$b=3$。",
    },
    "q-s2-3-1-0013": {
        "explanation_text": "(1)算術平均數 =$\\frac{\\sum_{k = 1}^{100}{k \\cdot k}}{\\sum_{k = 1}^{100}k}$="
        "$\\frac{\\frac{100 \\times 101 \\times 201}{6}}{\\frac{100 \\times 101}{2}}$= 67。\n"
        "(2) $G=\\sqrt[5050]{1 \\times 2 \\times 2 \\times 3 \\times 3 \\times 3 \\times 4 \\times \\ldots \\times 100 \\times \\ldots \\times 100}$\n"
        "$\\Rightarrow \\log G=\\frac{1}{5050}(\\log 1+2\\log 2+3\\log 3+\\cdots+100\\log 100)$，"
        "故 $G=10^{\\frac{1}{5050}(\\log 1+2\\log 2+3\\log 3+\\cdots+100\\log 100)}$。\n"
        "(3)(4) $1+2+3+\\cdots+70=2485<\\frac{5050}{2}<1+2+3+\\cdots+71=2556$，\n"
        "∴中位數為 $71$。\n"
        "(5)眾數 = $100$。\n"
        "故選(4)(5)。",
    },
    "q-s2-3-1-0029": {
        "explanation_text": "(1)○，$\\mu_x=\\frac{162+163+164+164+165+165+165}{7}=164$。\n"
        "(2)×，中位數為 $164$。\n"
        "(3)○，$\\sigma=\\sqrt{\\frac{2^2+1^2+1^2\\cdot 3}{7}}=\\sqrt{\\frac{8}{7}}$。\n"
        "(4)×，抽到 $3$ 人身高中位數為 $164$，表示至少有一個 $164$，\n"
        "∴ $\\frac{C_2^2\\cdot C_1^5+C_1^2\\cdot C_1^2\\cdot C_1^3}{C_3^7}=\\frac{17}{35}$。\n"
        "(5)○，$3$ 人身高平均為 $164$，可能為 $(162,165,165)$ 或 $(163,164,165)$，\n"
        "∴ $\\frac{C_1^1\\cdot C_2^3+C_1^1\\cdot C_1^2\\cdot C_1^3}{C_3^7}=\\frac{9}{35}$。\n"
        "故選(1)(3)(5)。",
    },
    "q-s2-2-2-0015": {
        "explanation_text": "【解析】\n"
        "(1) $3\\times 4\\times 4\\times 5=240$\n"
        "(2) [圖:program-db/assets/question-media/s2-2-2/image26.png] 拆掉過 $P$ 的路\n"
        "$$\\left.\\begin{array}{l}\n"
        "\\text{走上：}3\\times 1\\times 5=15\\\\\n"
        "\\text{走下：}3\\times 2\\times 3\\times 5=90\n"
        "\\end{array}\\right\\}$$\n"
        "共 $105$ 種\n"
        "(3) [圖:program-db/assets/question-media/s2-2-2/image27.png]\n"
        "$$\\left.\\begin{array}{l}\n"
        "\\text{走上：}3\\times 4\\times 2\\times 2=48\\\\\n"
        "\\text{走下：}3\\times 4\\times 1\\times 2=24\n"
        "\\end{array}\\right\\}$$\n"
        "共 $48+24=72$ 種\n"
        "(4) [圖:program-db/assets/question-media/s2-2-2/image28.png]\n"
        "$$\\left.\\begin{array}{l}\n"
        "\\text{走上：}3\\times 1\\times 1\\times 2=6\\\\\n"
        "\\text{走中：}3\\times 1\\times 2\\times 2=12\\\\\n"
        "\\text{走下：}3\\times 1\\times 2\\times 2=12\n"
        "\\end{array}\\right\\}$$\n"
        "共 $6+12+12=30$ 種\n"
        "(5) 全 $-$ (不過 $P$) $=240-105=135$ 種",
    },
}


def main() -> None:
    data = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    questions = data["questions"]
    by_id = {row["id"]: row for row in questions}
    missing = [qid for qid in UPDATES if qid not in by_id]
    if missing:
        raise SystemExit(f"Missing ids: {missing}")
    for qid, fields in UPDATES.items():
        row = by_id[qid]
        row.update(fields)
    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8-sig")


if __name__ == "__main__":
    main()
