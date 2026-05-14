from __future__ import annotations

import json
from pathlib import Path

from sync_web_data import sync_question_js_from_db


ROOT = Path(__file__).resolve().parents[2]
QUESTION_DB_PATH = ROOT / "program-db" / "database" / "question-db.json"

UPDATES: dict[str, dict[str, str]] = {
    "q-s1-1-1-0001": {
        "question_text": "設k為正整數，則介於$\\frac{1}{8}$與$\\frac{1}{7}$之間的有理數其形如$\\frac{k}{280}$者共有____________個。",
        "explanation_text": "【解析】由$\\frac{1}{8}<\\frac{k}{280}<\\frac{1}{7}$，得$\\frac{35}{280}<\\frac{k}{280}<\\frac{40}{280}$，k為正整數，故$k=36,37,38,39$共4個。",
    },
    "q-s1-1-1-0002": {
        "question_text": "有一最簡分數，其分子、分母之和為70，將其化為小數並四捨五入後為0.6，則此分數為____________。",
        "explanation_text": "【解析】設此分數為$\\frac{70-x}{x}$，$x\\in N$，$70-x\\in N$且$(x,70-x)=1$。則$0.55\\leq\\frac{70-x}{x}<0.65$，即$\\frac{11}{20}\\leq\\frac{70-x}{x}<\\frac{13}{20}$。因此$11x\\leq20(70-x)$且$20(70-x)<13x$（因$x>0$），所以$\\frac{1400}{33}<x\\leq\\frac{1400}{31}$，得$x=43,44,45$。對應分數為$\\frac{27}{43}$、$\\frac{26}{44}$、$\\frac{25}{45}$，其中後兩者不是最簡分數，故所求為$\\frac{27}{43}$。",
    },
    "q-s1-1-1-0003": {
        "question_text": "有一個最簡分數，其分子與分母之和為20，若將此分數化為小數，並將第三位小數四捨五入得0.54一數，則此分數為____________。",
        "explanation_text": "【解析】設此最簡分數為$\\frac{20-p}{p}$（p為正整數，$1\\leq p<20$，且$(p,20-p)=1$），則$0.535\\leq\\frac{20-p}{p}<0.545$，即$0.535p\\leq20-p<0.545p$。因此左式可得$p\\leq13\\ldots$，右式可得$p>12\\ldots$，故$p=13$，此分數為$\\frac{7}{13}$。",
    },
    "q-s1-1-1-0004": {
        "question_text": "已知a，b為阿拉伯數字且$\\frac{3a4b7}{180}$可化為有限小數，試求$a+b$之值。",
        "explanation_text": "【解析】因$180=2^{2}\\times3^{2}\\times5$，而$\\frac{3a4b7}{180}$為有限小數，所以約分後分母不能含有3，故分子$3a4b7$必須被9整除。因而$3+a+4+b+7=14+a+b$須為9的倍數。又$0\\leq a+b\\leq18$，所以$a+b=4$或13。",
    },
    "q-s1-1-1-0012": {
        "question_text": "設a，b，c為1至9的正整數，若$\\frac{699}{900}<0.a\\overline{bc}<\\frac{700}{900}$，則$(a,b,c)=$____________。",
        "explanation_text": "【解析】$0.a\\overline{bc}=\\frac{(100a+10b+c)-a}{990}$，所以$\\frac{699}{900}<\\frac{(100a+10b+c)-a}{990}<\\frac{700}{900}$。因此$768.9<(100a+10b+c)-a<770$，故$(100a+10b+c)-a=769$，得$a=7$，$b=7$，$c=6$。",
    },
    "q-s1-1-1-0015": {
        "question_text": "下列各敘述何者為真？\n(1) 若a為有理數，b為無理數，則$a-b$為無理數\n(2) 若$a^{3}$、$a^{8}$為有理數，則a為有理數\n(3) 若$a+c\\sqrt{2}=b+d\\sqrt{2}$，則$a=b$，$c=d$\n(4) a、b為有理數，c、d為無理數，若$a+c=b+d$則$a=b$，$c=d$\n(5) 若$a+2b$、$2b+3c$、$3c+a$為有理數，則a、b、c皆為有理數。",
        "explanation_text": "【解析】\n(1) 正確。\n(2) 正確。\n(3) 錯誤。反例：$a=2$，$c=\\sqrt{2}$，$b=4$，$d=0$。\n(4) 錯誤。反例：$a=1$，$c=\\sqrt{2}$，$b=2$，$d=\\sqrt{2}-1$。$a+c=b+d$，a、b為有理數，c、d為無理數，但$a\\ne b$，$c\\ne d$。\n(5) 正確。\n故選(1)(2)(5)。",
    },
    "q-s1-1-1-0016": {
        "question_text": "設a，b為有理數，c，d為無理數，且$a\\ne0$，則下列何者為真？\n(1) $a+c$為無理數 (2) $c+d$為無理數 (3) $ac$為無理數 (4) $cd$為無理數 (5) $\\frac{b}{a}$為有理數。",
        "explanation_text": "【解析】\n(1) ○：例如：$2+\\sqrt{3}$。\n(2) ×：例如：$\\sqrt{2}+(1-\\sqrt{2})=1$為有理數。\n(3) ○：例如：$5\\cdot\\sqrt{3}=5\\sqrt{3}$。\n(4) ×：例如：$(\\sqrt{2}+1)(\\sqrt{2}-1)=2-1=1$為有理數。\n(5) ○：例如：$\\frac{3}{5}$。\n故選(1)(3)(5)。",
    },
}

PACK_PATHS = [
    ROOT / "program-db" / "imports" / "packs" / "s1-1-1" / "questions.json",
]


def update_questions_file(path: Path) -> int:
    payload = json.loads(path.read_text(encoding="utf-8"))
    changed = 0
    for row in payload.get("questions", []):
        qid = row.get("id")
        patch = UPDATES.get(qid)
        if not patch:
            continue
        for field, value in patch.items():
            if row.get(field) != value:
                row[field] = value
                changed += 1
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return changed


def main() -> None:
    total = 0
    for path in PACK_PATHS:
        total += update_questions_file(path)
    total += update_questions_file(QUESTION_DB_PATH)
    synced = sync_question_js_from_db(QUESTION_DB_PATH)
    print(f"field_updates={total}")
    print(f"sync_question_content={synced}")


if __name__ == "__main__":
    main()
