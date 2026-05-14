import json
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROGRAM_DB_DIR = SCRIPT_DIR.parent

INPUT_JSON = PROGRAM_DB_DIR / "exports" / "formula-content.records.json"
DB_DIR = PROGRAM_DB_DIR / "database"
DB_PATH = DB_DIR / "formula-db.json"


def main():
    if not INPUT_JSON.exists():
        raise FileNotFoundError(f"找不到匯出檔：{INPUT_JSON}")

    payload = json.loads(INPUT_JSON.read_text(encoding="utf-8"))
    records = payload.get("records", [])
    if not isinstance(records, list):
        raise ValueError("records 格式錯誤，應為陣列")

    DB_DIR.mkdir(parents=True, exist_ok=True)

    db_payload = {
        "meta": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "source": payload.get("source", "data/formula-content.js"),
            "count": len(records),
            "schema": "formula-program-db-v1",
        },
        "topics": records,
    }

    DB_PATH.write_text(json.dumps(db_payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"已建立資料庫：{DB_PATH}")
    print(f"共匯入 {len(records)} 筆")


if __name__ == "__main__":
    main()
