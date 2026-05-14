import json
import sqlite3
import argparse
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
PROGRAM_DB_DIR = SCRIPT_DIR.parent
JSON_DB_PATH = PROGRAM_DB_DIR / "database" / "formula-db.json"
DEFAULT_SQLITE_DB_PATH = PROGRAM_DB_DIR / "database" / "app.sqlite3"


def as_json(value, default):
    if value is None:
        value = default
    return json.dumps(value, ensure_ascii=False)


def main():
    parser = argparse.ArgumentParser(description="把 formula-db.json 的 topics 匯入 SQLite")
    parser.add_argument("--db-path", default=str(DEFAULT_SQLITE_DB_PATH), help="SQLite 檔案路徑")
    args = parser.parse_args()

    sqlite_db_path = Path(args.db_path).resolve()

    if not JSON_DB_PATH.exists():
        raise FileNotFoundError(f"找不到 JSON 資料庫: {JSON_DB_PATH}")
    if not sqlite_db_path.exists():
        raise FileNotFoundError(f"找不到 SQLite 資料庫: {sqlite_db_path}\n請先執行 init_sqlite_db.py")

    payload = json.loads(JSON_DB_PATH.read_text(encoding="utf-8"))
    topics = payload.get("topics", [])
    if not isinstance(topics, list):
        raise ValueError("formula-db.json 格式錯誤: topics 必須是陣列")

    conn = sqlite3.connect(sqlite_db_path)
    try:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("DELETE FROM topics;")

        rows = []
        for t in topics:
            if not isinstance(t, dict):
                continue
            topic_id = t.get("id")
            title = t.get("title")
            if not topic_id or not title:
                continue
            rows.append(
                (
                    topic_id,
                    title,
                    t.get("stage"),
                    t.get("grade"),
                    t.get("term"),
                    t.get("chapter"),
                    t.get("domain"),
                    t.get("difficulty"),
                    t.get("chapterRole"),
                    t.get("parentId"),
                    as_json(t.get("formula"), {}),
                    as_json(t.get("contentTypes"), []),
                    as_json(t.get("tags"), []),
                    as_json(t.get("usage"), []),
                    as_json(t.get("examples"), []),
                    as_json(t.get("tips"), []),
                    as_json(t.get("notes"), []),
                    as_json(t.get("mistakes"), []),
                    "formula-db.json",
                )
            )

        conn.executemany(
            """
            INSERT INTO topics (
              id, title, stage, grade, term, chapter, domain, difficulty, chapter_role, parent_id,
              formula_json, content_types_json, tags_json, usage_json, examples_json,
              tips_json, notes_json, mistakes_json, source_ref
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            rows,
        )
        conn.commit()
    finally:
        conn.close()

    print(f"已匯入 topics -> SQLite: {len(rows)} 筆")


if __name__ == "__main__":
    main()
