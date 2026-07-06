import json
from datetime import datetime, timezone
from pathlib import Path


DB_PATH = Path("program-db/database/practice-db.json")


NEW_ITEMS = [
    {
        "key": "j1-2-1-combined-divisibility-clean",
        "title": "複合整除規則與缺位數字",
        "difficulty": "進階",
        "chapterCode": "j1-2-1",
        "chapter": "倍數與因數",
        "subtypeCount": 4,
        "tags": ["j1-2-1", "整除規則", "缺位數字", "3的倍數", "8的倍數", "11的倍數", "無限練習"],
        "usage": ["用兩種以上整除規則同時限制未知位數字，訓練學生先拆條件再交集。"],
        "tips": ["72 要拆成 8 與 9；33 要拆成 3 與 11；11 的倍數要看奇偶位交錯和差。"],
        "mistakes": ["只套用其中一個整除規則，忘記所有條件都要同時成立。"],
    },
    {
        "key": "j1-2-1-remainder-crt-range-clean",
        "title": "混合餘數與範圍限制",
        "difficulty": "進階",
        "chapterCode": "j1-2-1",
        "chapter": "倍數與因數",
        "subtypeCount": 3,
        "tags": ["j1-2-1", "餘數", "韓信點兵", "範圍限制", "無限練習"],
        "usage": ["把多個餘數條件合併，再用範圍或最小正整數限制篩答案。"],
        "tips": ["可先固定一個條件列數列，再逐一檢查其他餘數條件。"],
        "mistakes": ["找到符合餘數條件的數後，忘記檢查題目指定的範圍。"],
    },
    {
        "key": "j1-2-1-divisor-count-inverse-clean",
        "title": "反向因數個數與因數和",
        "difficulty": "進階",
        "chapterCode": "j1-2-1",
        "chapter": "倍數與因數",
        "subtypeCount": 3,
        "tags": ["j1-2-1", "標準分解式", "正因數個數", "正因數總和", "無限練習"],
        "usage": ["從正因數個數或因數和反推質因數指數，避免只會順向套公式。"],
        "tips": ["因數個數看指數加一相乘；要求最小數時，較大的指數要放在較小質數上。"],
        "mistakes": ["把正因數個數公式誤用成正因數總和公式。"],
    },
    {
        "key": "j1-2-2-gcd-lcm-pair-constraints-clean",
        "title": "最大公因數與最小公倍數限制反推",
        "difficulty": "進階",
        "chapterCode": "j1-2-2",
        "chapter": "最大公因數與最小公倍數",
        "subtypeCount": 3,
        "tags": ["j1-2-2", "最大公因數", "最小公倍數", "乘積關係", "無限練習"],
        "usage": ["利用最大公因數、最小公倍數、乘積或大小限制反推兩數。"],
        "tips": ["設 a=gm、b=gn 後，m 與 n 要互質，這是反推題的關鍵。"],
        "mistakes": ["只用 ab=(a,b)[a,b]，但沒有檢查縮小後兩數是否互質。"],
    },
    {
        "key": "j1-2-2-ratio-lcm-three-numbers-clean",
        "title": "三數比例與最小公倍數",
        "difficulty": "中等",
        "chapterCode": "j1-2-2",
        "chapter": "最大公因數與最小公倍數",
        "subtypeCount": 1,
        "tags": ["j1-2-2", "最小公倍數", "比例", "三數", "無限練習"],
        "usage": ["把三數比例寫成 kt，再用最小公倍數決定 k。"],
        "tips": ["先算比例數本身的最小公倍數，再乘上共同倍數 k。"],
        "mistakes": ["直接把題目給的最小公倍數當成 k，導致三數全部放大錯誤。"],
    },
    {
        "key": "j1-2-2-periodic-lcm-modeling-clean",
        "title": "週期模型與位置保留",
        "difficulty": "中等",
        "chapterCode": "j1-2-2",
        "chapter": "最大公因數與最小公倍數",
        "subtypeCount": 2,
        "tags": ["j1-2-2", "最小公倍數", "週期", "種樹", "無限練習"],
        "usage": ["用最小公倍數處理週期重合、道路種樹改間距與位置不動的問題。"],
        "tips": ["位置不動代表同時是兩個間距的倍數；共同週期用最小公倍數。"],
        "mistakes": ["把道路兩端是否計入看錯，或把不需移動的樹誤當成需要移動。"],
    },
    {
        "key": "j1-2-3-advanced-telescoping-sum-clean",
        "title": "進階分項對消連加",
        "difficulty": "進階",
        "chapterCode": "j1-2-3",
        "chapter": "分數的運算",
        "subtypeCount": 3,
        "tags": ["j1-2-3", "分數", "分項對消", "級數", "無限練習"],
        "usage": ["練習把連加分數拆成相鄰兩項差，觀察中間項消去。"],
        "tips": ["先把一般項拆出來，不要急著通分全部項。"],
        "mistakes": ["只記得結果形式，換成三連乘分母或奇數分母時不會重新拆項。"],
    },
    {
        "key": "j1-2-3-telescoping-product-clean",
        "title": "進階分項對消連乘",
        "difficulty": "進階",
        "chapterCode": "j1-2-3",
        "chapter": "分數的運算",
        "subtypeCount": 1,
        "tags": ["j1-2-3", "分數", "連乘", "分項對消", "無限練習"],
        "usage": ["練習把 1-1/k^2 拆成兩個可約分因子，再做連乘約分。"],
        "tips": ["先將 1-1/k^2 改寫為 (k-1)(k+1)/k^2，再觀察前後約分。"],
        "mistakes": ["把連乘當成連加處理，或忘記第一項與最後一項會留下來。"],
    },
]


def make_record(item):
    key = item["key"]
    return {
        "id": f"practice-{key}",
        "enabled": True,
        "mode": "generator",
        "title": item["title"],
        "generatorKey": key,
        "description": item["usage"][0],
        "difficulty": item["difficulty"],
        "questionCount": 5,
        "subtypeCount": item["subtypeCount"],
        "relatedPracticeIds": [],
        "chapterCode": item["chapterCode"],
        "stage": "國中",
        "grade": "七年級",
        "term": "上學期",
        "chapter": item["chapter"],
        "domain": "數與量",
        "prompt": "",
        "answer": "",
        "tags": item["tags"],
        "usage": item["usage"],
        "examples": [],
        "tips": item["tips"] + ["此小類會更換位數字、範圍、質因數指數或級數上限等參數，核心方法固定但題目不是只重排。"],
        "notes": [],
        "mistakes": item["mistakes"],
    }


def main():
    data = json.loads(DB_PATH.read_text(encoding="utf-8"))
    new_ids = {f"practice-{item['key']}" for item in NEW_ITEMS}
    data["practices"] = [p for p in data.get("practices", []) if p.get("id") not in new_ids]
    data["practices"].extend(make_record(item) for item in NEW_ITEMS)

    order_by_chapter = {}
    for binding in data.get("bindings", []):
        if binding.get("targetType") == "chapter":
          order_by_chapter[binding.get("targetId")] = max(order_by_chapter.get(binding.get("targetId"), 0), int(binding.get("order", 0)))

    data["bindings"] = [b for b in data.get("bindings", []) if b.get("practiceId") not in new_ids]
    for item in NEW_ITEMS:
        chapter = item["chapterCode"]
        order_by_chapter[chapter] = order_by_chapter.get(chapter, 0) + 1
        data["bindings"].append({
            "practiceId": f"practice-{item['key']}",
            "targetType": "chapter",
            "targetId": chapter,
            "enabled": True,
            "order": order_by_chapter[chapter],
        })

    meta = data.setdefault("meta", {})
    meta["practiceCount"] = len(data.get("practices", []))
    meta["bindingCount"] = len(data.get("bindings", []))
    meta["totalPractices"] = meta["practiceCount"]
    meta["totalBindings"] = meta["bindingCount"]
    meta["updatedAt"] = datetime.now(timezone.utc).isoformat()

    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"updated {len(NEW_ITEMS)} j1-2 screenshot practices")


if __name__ == "__main__":
    main()
