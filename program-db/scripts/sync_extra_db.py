import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
DB_DIR = ROOT / "program-db" / "database"

CHAPTER_JS = DATA_DIR / "chapter-code-config.js"

CHAPTER_DB = DB_DIR / "chapter-code-db.json"


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def extract_js_object_text(js_text: str, marker: str):
    idx = js_text.find(marker)
    if idx < 0:
        raise ValueError(f"找不到標記：{marker}")
    rhs = js_text[idx + len(marker):]
    end = rhs.rfind("};")
    if end < 0:
        raise ValueError("找不到物件結尾 '};'")
    body = rhs[: end + 1].strip()
    return body


def build_chapter_db():
    raw = CHAPTER_JS.read_text(encoding="utf-8-sig")
    obj_text = extract_js_object_text(raw, "window.chapterCodeCatalog =")
    catalog = json.loads(obj_text)
    payload = {
        "meta": {
            "schema": "chapter-code-db-v1",
            "source": str(CHAPTER_JS),
            "syncedAt": now_iso(),
            "count": len(catalog),
        },
        "catalog": catalog,
    }
    CHAPTER_DB.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return len(catalog)


def main():
    DB_DIR.mkdir(parents=True, exist_ok=True)
    c1 = build_chapter_db()
    print(f"chapter-code-db: {c1} 筆 -> {CHAPTER_DB}")
    print("managed-structure-db: 已停用（改由 formula-db 直接同步 managed-structure.auto.json）")


if __name__ == "__main__":
    main()
