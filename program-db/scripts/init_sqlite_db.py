import sqlite3
import argparse
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
PROGRAM_DB_DIR = SCRIPT_DIR.parent
SCHEMA_PATH = PROGRAM_DB_DIR / "sqlite" / "schema.sql"
DEFAULT_DB_PATH = PROGRAM_DB_DIR / "database" / "app.sqlite3"


def main():
    parser = argparse.ArgumentParser(description="初始化 SQLite 資料庫")
    parser.add_argument("--db-path", default=str(DEFAULT_DB_PATH), help="SQLite 檔案路徑")
    args = parser.parse_args()

    db_path = Path(args.db_path).resolve()

    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"找不到 schema.sql: {SCHEMA_PATH}")

    db_path.parent.mkdir(parents=True, exist_ok=True)
    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")

    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()

    print(f"已初始化 SQLite 資料庫: {db_path}")


if __name__ == "__main__":
    main()
