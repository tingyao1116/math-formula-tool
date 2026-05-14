from __future__ import annotations

import json
from pathlib import Path

from sync_web_data import sync_question_js_from_db


ROOT = Path(__file__).resolve().parents[2]
PACK_PATH = ROOT / "program-db" / "imports" / "packs" / "s1-1-1" / "questions.json"
DB_PATH = ROOT / "program-db" / "database" / "question-db.json"

UPDATES = {
    "q-s1-1-1-0002": {
        "explanation_text": "\u3010\u89e3\u6790\u3011\u8a2d\u6b64\u5206\u6578\u70ba$\\frac{70-x}{x}$\uff0c$x\\in N$\uff0c$70-x\\in N$\u4e14$(x,70-x)=1$\u3002\n$0.55\\leq\\frac{70-x}{x}<0.65$\n\u21d2 $\\frac{11}{20}\\leq\\frac{70-x}{x}<\\frac{13}{20}$\n\u21d2 $11x\\leq20(70-x)$\u4e14$20(70-x)<13x$\uff08\u56e0$x>0$\uff09\n\u21d2 $\\frac{1400}{33}<x\\leq\\frac{1400}{31}$\uff0c\u5f97$x=43,44,45$\n\u5c0d\u61c9\u5206\u6578\u70ba$\\frac{27}{43}$\u3001$\\frac{26}{44}$\u3001$\\frac{25}{45}$\uff0c\u5176\u4e2d\u5f8c\u5169\u8005\u4e0d\u662f\u6700\u7c21\u5206\u6578\uff0c\u6545\u6240\u6c42\u70ba$\\frac{27}{43}$\u3002"
    },
    "q-s1-1-1-0003": {
        "explanation_text": "\u3010\u89e3\u6790\u3011\u8a2d\u6b64\u6700\u7c21\u5206\u6578\u70ba$\\frac{20-p}{p}$\uff08p\u70ba\u6b63\u6574\u6578\uff0c$1\\leq p<20$\uff0c\u4e14$(p,20-p)=1$\uff09\u3002\n$0.535\\leq\\frac{20-p}{p}<0.545$\n\u21d2 $0.535p\\leq20-p<0.545p$\n\u21d2 \u5de6\u5f0f\u53ef\u5f97$p\\leq13\\ldots$\uff0c\u53f3\u5f0f\u53ef\u5f97$p>12\\ldots$\n\u2234 $p=13$\uff0c\u6b64\u5206\u6578\u70ba$\\frac{7}{13}$\u3002"
    },
    "q-s1-1-1-0004": {
        "explanation_text": "\u3010\u89e3\u6790\u3011\u56e0$180=2^{2}\\times3^{2}\\times5$\uff0c\u800c$\\frac{3a4b7}{180}$\u70ba\u6709\u9650\u5c0f\u6578\uff0c\n\u6240\u4ee5\u7d04\u5206\u5f8c\u5206\u6bcd\u4e0d\u80fd\u542b\u67093\uff0c\u6545\u5206\u5b50$3a4b7$\u5fc5\u9808\u88ab9\u6574\u9664\u3002\n\u56e0\u800c$3+a+4+b+7=14+a+b$\u9808\u70ba9\u7684\u500d\u6578\u3002\n\u53c8$0\\leq a+b\\leq18$\uff0c\u6240\u4ee5$a+b=4$\u621613\u3002"
    },
}


def update_file(path: Path) -> int:
    payload = json.loads(path.read_text(encoding="utf-8"))
    changed = 0
    for row in payload["questions"]:
        patch = UPDATES.get(row["id"])
        if not patch:
            continue
        for key, value in patch.items():
            if row.get(key) != value:
                row[key] = value
                changed += 1
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return changed


def main() -> None:
    pack_changed = update_file(PACK_PATH)
    db_changed = update_file(DB_PATH)
    synced = sync_question_js_from_db(DB_PATH)
    print(f"pack_changed={pack_changed}")
    print(f"db_changed={db_changed}")
    print(f"sync_question_content={synced}")


if __name__ == "__main__":
    main()
