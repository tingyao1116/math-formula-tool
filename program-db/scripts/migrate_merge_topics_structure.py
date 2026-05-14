import json
from datetime import datetime, timezone
from pathlib import Path
import shutil
import sys


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
DB_DIR = ROOT / "program-db" / "database"
DATA_DIR = ROOT / "data"

FORMULA_DB = DB_DIR / "formula-db.json"
MANAGED_DB = DB_DIR / "managed-structure-db.json"

BACKUP_DIR = DB_DIR / "migration-backups"


def now_tag():
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def ensure_topic_shape(topic: dict):
    t = dict(topic)
    t.setdefault("formula", {"type": "text", "lines": []})
    for k in ["contentTypes", "tags", "usage", "examples", "tips", "notes", "mistakes"]:
        t.setdefault(k, [])
    t.setdefault("stage", "")
    t.setdefault("grade", "")
    t.setdefault("term", "")
    t.setdefault("chapter", "")
    t.setdefault("domain", "")
    t.setdefault("difficulty", "")
    t.setdefault("chapterRole", "")
    t.setdefault("parentId", "")
    return t


def backup_file(path: Path, tag: str):
    if not path.exists():
        return None
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    dst = BACKUP_DIR / f"{path.stem}.{tag}{path.suffix}"
    shutil.copy2(path, dst)
    return dst


def main():
    if not FORMULA_DB.exists():
        raise FileNotFoundError(f"找不到主題資料庫：{FORMULA_DB}")

    tag = now_tag()
    backup_formula = backup_file(FORMULA_DB, tag)
    backup_managed = backup_file(MANAGED_DB, tag)

    payload = json.loads(FORMULA_DB.read_text(encoding="utf-8-sig"))
    topics = payload.get("topics", [])
    topics = [ensure_topic_shape(x) for x in topics if isinstance(x, dict)]
    payload["topics"] = topics
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(topics)
    payload["meta"]["schema"] = "formula-program-db-v2-single-source"
    payload["meta"]["migratedAt"] = datetime.now(timezone.utc).isoformat()
    payload["meta"]["migrationNote"] = "Merged topic/structure into single-source formula-db."
    FORMULA_DB.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    # Archive legacy managed db (if present)
    archived_managed = None
    if MANAGED_DB.exists():
        archived_managed = MANAGED_DB.with_name(f"managed-structure-db.legacy-{tag}.json")
        try:
            shutil.move(str(MANAGED_DB), str(archived_managed))
        except PermissionError:
            # File may be locked by running GUI/process; keep original file but preserve a copy.
            shutil.copy2(str(MANAGED_DB), str(archived_managed))

    # Sync all web-facing files from single source
    sys.path.append(str(SCRIPT_DIR))
    from sync_legacy_bridge import sync_legacy_js_from_db
    from sync_extra_bridge import sync_extra_web_from_db

    legacy_count = sync_legacy_js_from_db(FORMULA_DB)
    overview_count, chapter_count, closing_count, managed_count, practice_count = sync_extra_web_from_db()

    print("migration=done")
    print(f"formula_count={len(topics)}")
    print(f"sync_formula_content={legacy_count}")
    print(f"sync_chapter_overview={overview_count}")
    print(f"sync_chapter_code={chapter_count}")
    print(f"sync_chapter_closing={closing_count}")
    print(f"sync_managed_structure={managed_count}")
    print(f"sync_practice_assignments={practice_count}")
    if backup_formula:
        print(f"backup_formula={backup_formula}")
    if backup_managed:
        print(f"backup_managed={backup_managed}")
    if archived_managed:
        print(f"archived_managed_db={archived_managed}")


if __name__ == "__main__":
    main()
