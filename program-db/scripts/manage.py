import argparse
import json
from pathlib import Path
from sync_legacy_bridge import sync_legacy_js_from_db

SCRIPT_DIR = Path(__file__).resolve().parent
DB_PATH = SCRIPT_DIR.parent / "database" / "formula-db.json"
FALLBACK_DB_PATH = Path.cwd() / "program-db" / "database" / "formula-db.json"


def resolve_db_path():
    if DB_PATH.exists():
        return DB_PATH
    return FALLBACK_DB_PATH


def load_db():
    path = resolve_db_path()
    if not path.exists():
        raise FileNotFoundError(f"找不到資料庫：{path}\n請先執行 build-db.py")
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    if "topics" not in payload or not isinstance(payload["topics"], list):
        raise ValueError("資料庫格式錯誤：缺少 topics 陣列")
    return path, payload


def save_db(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def find_index_by_id(topics, topic_id):
    for i, item in enumerate(topics):
        if item.get("id") == topic_id:
            return i
    return -1


def parse_json_file(path):
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"找不到 JSON 檔：{p}")
    return json.loads(p.read_text(encoding="utf-8-sig"))


def cmd_stats(payload):
    topics = payload["topics"]
    stage_counter = {}
    for item in topics:
        key = item.get("stage") or "未分類"
        stage_counter[key] = stage_counter.get(key, 0) + 1
    print(f"資料筆數: {len(topics)}")
    for stage, count in sorted(stage_counter.items(), key=lambda x: x[1], reverse=True):
        print(f"- {stage}: {count}")


def cmd_search(payload, args):
    topics = payload["topics"]
    rows = []
    for item in topics:
        if args.stage and item.get("stage") != args.stage:
            continue
        if args.grade and item.get("grade") != args.grade:
            continue
        if args.chapter and item.get("chapter") != args.chapter:
            continue
        if args.keyword:
            text_blob = " ".join(
                [
                    item.get("id", ""),
                    item.get("title", ""),
                    item.get("chapter", ""),
                    " ".join(item.get("tags", []) or []),
                    " ".join(item.get("usage", []) or []),
                ]
            )
            if args.keyword not in text_blob:
                continue
        rows.append(item)

    rows = sorted(rows, key=lambda x: (x.get("stage", ""), x.get("grade", ""), x.get("chapter", ""), x.get("title", "")))
    rows = rows[: args.limit]
    if not rows:
        print("找不到符合條件的資料")
        return
    for idx, row in enumerate(rows, start=1):
        print(
            f"{idx}. [{row.get('id')}] {row.get('title')} | "
            f"{row.get('stage')}/{row.get('grade')} | {row.get('chapter')} | 難度:{row.get('difficulty')}"
        )


def cmd_get(payload, args):
    topics = payload["topics"]
    idx = find_index_by_id(topics, args.id)
    if idx < 0:
        print(f"找不到 id={args.id}")
        return
    print(json.dumps(topics[idx], ensure_ascii=False, indent=2))


def cmd_add(db_path, payload, args):
    topics = payload["topics"]
    obj = parse_json_file(args.json_file)
    if not isinstance(obj, dict):
        raise ValueError("新增資料必須是 JSON 物件")
    topic_id = obj.get("id")
    if not topic_id:
        raise ValueError("新增資料必須包含 id")
    if not obj.get("title"):
        raise ValueError("新增資料必須包含 title")
    if find_index_by_id(topics, topic_id) >= 0:
        raise ValueError(f"id 已存在：{topic_id}")
    topics.append(obj)
    save_db(db_path, payload)
    sync_legacy_js_from_db(db_path)
    print(f"已新增：{topic_id}")


def cmd_update(db_path, payload, args):
    topics = payload["topics"]
    idx = find_index_by_id(topics, args.id)
    if idx < 0:
        raise ValueError(f"找不到 id={args.id}")
    patch = parse_json_file(args.json_file)
    if not isinstance(patch, dict):
        raise ValueError("更新資料必須是 JSON 物件")
    if "id" in patch and patch["id"] != args.id:
        raise ValueError("更新時不允許改變 id")
    topics[idx] = {**topics[idx], **patch}
    save_db(db_path, payload)
    sync_legacy_js_from_db(db_path)
    print(f"已更新：{args.id}")


def cmd_delete(db_path, payload, args):
    topics = payload["topics"]
    original_count = len(topics)
    delete_set = set(args.ids)
    payload["topics"] = [item for item in topics if item.get("id") not in delete_set]
    deleted = original_count - len(payload["topics"])
    save_db(db_path, payload)
    sync_legacy_js_from_db(db_path)
    print(f"已刪除 {deleted} 筆")


def build_parser():
    parser = argparse.ArgumentParser(description="程式版資料庫管理工具（CRUD）")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("stats", help="顯示資料統計")

    p_search = sub.add_parser("search", help="查詢資料")
    p_search.add_argument("--stage")
    p_search.add_argument("--grade")
    p_search.add_argument("--chapter")
    p_search.add_argument("--keyword")
    p_search.add_argument("--limit", type=int, default=20)

    p_get = sub.add_parser("get", help="依 id 讀取單筆")
    p_get.add_argument("--id", required=True)

    p_add = sub.add_parser("add", help="新增資料")
    p_add.add_argument("--json-file", required=True)

    p_update = sub.add_parser("update", help="更新資料（部分欄位覆蓋）")
    p_update.add_argument("--id", required=True)
    p_update.add_argument("--json-file", required=True)

    p_delete = sub.add_parser("delete", help="刪除資料")
    p_delete.add_argument("--ids", nargs="+", required=True)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    db_path, payload = load_db()

    if args.command == "stats":
        cmd_stats(payload)
    elif args.command == "search":
        cmd_search(payload, args)
    elif args.command == "get":
        cmd_get(payload, args)
    elif args.command == "add":
        cmd_add(db_path, payload, args)
    elif args.command == "update":
        cmd_update(db_path, payload, args)
    elif args.command == "delete":
        cmd_delete(db_path, payload, args)
    else:
        parser.error("不支援的命令")


if __name__ == "__main__":
    main()
