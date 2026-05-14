import json
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

DEFAULT_DB_PATH = PROJECT_ROOT / "program-db" / "database" / "formula-db.json"
LEGACY_JS_PATH = PROJECT_ROOT / "data" / "formula-content.js"


def sync_legacy_js_from_db(db_path: Path | None = None) -> int:
    source = Path(db_path).resolve() if db_path else DEFAULT_DB_PATH
    if not source.exists():
        raise FileNotFoundError(f"找不到資料庫檔案：{source}")

    payload = json.loads(source.read_text(encoding="utf-8"))
    topics = payload.get("topics", [])
    if not isinstance(topics, list):
        raise ValueError("資料庫格式錯誤：topics 必須是陣列")

    js_text = (
        "// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n"
        "// Source: program-db/database/formula-db.json\n"
        f"window.formulaContentRecords = {json.dumps(topics, ensure_ascii=False, indent=2)};\n"
    )
    LEGACY_JS_PATH.write_text(js_text, encoding="utf-8")
    return len(topics)
