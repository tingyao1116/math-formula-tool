import argparse
import json
import re
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


def split_pipe(value):
    text = (value or "").strip()
    if not text:
        return []
    return [x.strip() for x in text.split("|") if x.strip()]


def parse_txt_records(text):
    blocks = re.split(r"\n\s*===\s*\n", text.strip(), flags=re.MULTILINE)
    records = []
    for block in blocks:
        lines = [ln.rstrip() for ln in block.splitlines() if ln.strip() and not ln.strip().startswith("#")]
        if not lines:
            continue
        data = {}
        for ln in lines:
            if ":" not in ln:
                continue
            k, v = ln.split(":", 1)
            data[k.strip()] = v.strip()

        record = {
            "id": data.get("id", ""),
            "title": data.get("title", ""),
            "stage": data.get("stage", ""),
            "grade": data.get("grade", ""),
            "term": data.get("term", ""),
            "chapter": data.get("chapter", ""),
            "domain": data.get("domain", ""),
            "difficulty": data.get("difficulty", ""),
            "chapterRole": data.get("chapterRole", ""),
            "parentId": data.get("parentId", ""),
            "formula": {
                "type": data.get("formulaType", "text"),
                "lines": [
                    {
                        "label": data.get("formulaLabel", "公式"),
                        "values": split_pipe(data.get("formula", "")),
                    }
                ],
            },
            "contentTypes": split_pipe(data.get("contentTypes", "")),
            "tags": split_pipe(data.get("tags", "")),
            "usage": split_pipe(data.get("usage", "")),
            "examples": split_pipe(data.get("examples", "")),
            "tips": split_pipe(data.get("tips", "")),
            "notes": split_pipe(data.get("notes", "")),
            "mistakes": split_pipe(data.get("mistakes", "")),
        }
        records.append(record)
    return records


def parse_jsonl_records(text):
    records = []
    for i, ln in enumerate(text.splitlines(), start=1):
        line = ln.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"JSONL 第 {i} 行格式錯誤: {exc}") from exc
        if not isinstance(obj, dict):
            raise ValueError(f"JSONL 第 {i} 行必須是 JSON 物件")
        records.append(obj)
    return records


def normalize_record(item):
    if not isinstance(item, dict):
        raise ValueError("每筆資料必須是 JSON 物件")
    if not item.get("id"):
        raise ValueError("每筆資料必須有 id")
    if not item.get("title"):
        raise ValueError(f"id={item.get('id')} 缺少 title")
    if "formula" not in item or not isinstance(item["formula"], dict):
        item["formula"] = {"type": "text", "lines": []}
    for k in ["contentTypes", "tags", "usage", "examples", "tips", "notes", "mistakes"]:
        if k not in item or item[k] is None:
            item[k] = []
    return item


def main():
    parser = argparse.ArgumentParser(description="批次匯入資料到 formula-db.json")
    parser.add_argument("--file", required=True, help="匯入檔案路徑")
    parser.add_argument("--format", choices=["txt", "jsonl"], required=True, help="匯入檔格式")
    parser.add_argument("--mode", choices=["insert", "upsert"], default="upsert", help="insert=只新增, upsert=同 id 覆蓋更新")
    args = parser.parse_args()

    src = Path(args.file)
    if not src.exists():
        raise FileNotFoundError(f"找不到匯入檔：{src}")
    text = src.read_text(encoding="utf-8-sig")

    if args.format == "txt":
        raw_records = parse_txt_records(text)
    else:
        raw_records = parse_jsonl_records(text)

    records = [normalize_record(r) for r in raw_records]

    db_path, payload = load_db()
    topics = payload["topics"]
    index = {item.get("id"): i for i, item in enumerate(topics)}

    added = 0
    updated = 0
    skipped = 0

    for record in records:
        rid = record["id"]
        if rid in index:
            if args.mode == "insert":
                skipped += 1
                continue
            topics[index[rid]] = record
            updated += 1
        else:
            topics.append(record)
            index[rid] = len(topics) - 1
            added += 1

    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(topics)
    save_db(db_path, payload)
    sync_legacy_js_from_db(db_path)

    print(f"匯入完成: 新增 {added} 筆, 更新 {updated} 筆, 略過 {skipped} 筆")
    print(f"目前總筆數: {len(topics)}")


if __name__ == "__main__":
    main()
