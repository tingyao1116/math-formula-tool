import argparse
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DB_PATH = SCRIPT_DIR.parent / "database" / "formula-db.json"
FALLBACK_DB_PATH = Path.cwd() / "program-db" / "database" / "formula-db.json"


def load_db():
    path = DB_PATH if DB_PATH.exists() else FALLBACK_DB_PATH
    if not path.exists():
        raise FileNotFoundError(f"找不到資料庫：{DB_PATH}\n請先執行 build-db.py")
    return json.loads(path.read_text(encoding="utf-8"))


def run_stats(topics):
    total = len(topics)
    stage_counter = {}
    for item in topics:
        key = item.get("stage") or "未分類"
        stage_counter[key] = stage_counter.get(key, 0) + 1
    stages = sorted(stage_counter.items(), key=lambda x: x[1], reverse=True)
    print(f"資料筆數: {total}")
    print("各學層筆數:")
    for stage, count in stages:
        print(f"- {stage}: {count}")


def run_query(topics, stage, grade, chapter, keyword, limit):
    rows = []
    for item in topics:
        if stage and item.get("stage") != stage:
            continue
        if grade and item.get("grade") != grade:
            continue
        if chapter and item.get("chapter") != chapter:
            continue
        if keyword:
            text_blob = " ".join(
                [
                    item.get("title", ""),
                    item.get("chapter", ""),
                    " ".join(item.get("tags", []) or []),
                    " ".join(item.get("usage", []) or []),
                ]
            )
            if keyword not in text_blob:
                continue
        rows.append(item)

    rows = sorted(rows, key=lambda x: (x.get("stage", ""), x.get("grade", ""), x.get("chapter", ""), x.get("title", "")))
    rows = rows[:limit]

    if not rows:
        print("找不到符合條件的資料")
        return

    for idx, row in enumerate(rows, start=1):
        rid = row.get("id")
        title = row.get("title")
        s = row.get("stage")
        g = row.get("grade")
        c = row.get("chapter")
        diff = row.get("difficulty")
        print(f"{idx}. [{rid}] {title} | {s}/{g} | {c} | 難度:{diff}")


def main():
    parser = argparse.ArgumentParser(description="查詢數學公式 SQLite 資料庫")
    parser.add_argument("--stage", help="學層，例如：國中")
    parser.add_argument("--grade", help="年級，例如：國一")
    parser.add_argument("--chapter", help="章節名稱")
    parser.add_argument("--keyword", help="關鍵字")
    parser.add_argument("--limit", type=int, default=20, help="回傳筆數上限，預設 20")
    parser.add_argument("--stats", action="store_true", help="顯示資料庫統計")
    args = parser.parse_args()

    db = load_db()
    topics = db.get("topics", [])

    if args.stats:
        run_stats(topics)
    else:
        run_query(topics, args.stage, args.grade, args.chapter, args.keyword, args.limit)


if __name__ == "__main__":
    main()
