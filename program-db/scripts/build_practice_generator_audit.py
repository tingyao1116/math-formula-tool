import json
import re
from pathlib import Path

from practice_db_utils import DB_PATH as PRACTICE_DB_PATH


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
FORMULA_DB_PATH = ROOT / "program-db" / "database" / "formula-db.json"
PRACTICE_JS_PATH = ROOT / "data" / "formula-practice.js"
EXPORT_JSON_PATH = ROOT / "exports" / "practice-generator-audit.json"
EXPORT_MD_PATH = ROOT / "exports" / "practice-generator-audit.md"


CONFIG_BLOCK_RE = re.compile(
    r'^\s{6}"(?P<key>[^"]+)":\s*\{\s*\n(?P<body>.*?)(?=^\s{6}\},?\s*$)',
    re.M | re.S,
)
RETURN_CALL_RE = re.compile(r"return\s+(?P<builder>\w+)\((?P<args>[^)]*)\);")


def read_json(path: Path, fallback):
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8-sig"))


def line_number_for_offset(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def parse_practice_configs(text: str) -> list[dict]:
    rows = []
    for match in CONFIG_BLOCK_RE.finditer(text):
        key = match.group("key")
        body = match.group("body")
        title_match = re.search(r'title:\s*"([^"]*)"', body)
        type_match = re.search(r'type:\s*"([^"]*)"', body)
        difficulty_match = re.search(r'difficulty:\s*"([^"]*)"', body)
        count_match = re.search(r"questionCount:\s*(\d+)", body)
        return_match = RETURN_CALL_RE.search(body)
        rows.append(
            {
                "id": key,
                "configLine": line_number_for_offset(text, match.start()),
                "type": type_match.group(1) if type_match else "",
                "title": title_match.group(1) if title_match else "",
                "difficulty": difficulty_match.group(1) if difficulty_match else "",
                "questionCount": int(count_match.group(1)) if count_match else 0,
                "builderName": return_match.group("builder") if return_match else "",
                "builderArgs": return_match.group("args").strip() if return_match else "",
                "rawBody": body.strip(),
            }
        )
    return rows


def build_builder_line_map(text: str, builder_names: set[str]) -> dict[str, int]:
    result = {}
    for name in builder_names:
        if not name:
            continue
        match = re.search(rf"^\s*function\s+{re.escape(name)}\s*\(", text, re.M)
        if match:
            result[name] = line_number_for_offset(text, match.start())
    return result


def recommend_management(builder_name: str, reuse_count: int) -> tuple[str, str]:
    if not builder_name:
        return ("unknown", "找不到 generate() 對應 builder，需人工確認。")
    if reuse_count >= 3:
        return (
            "template-db-first",
            "同一個 builder 被多個主題重複使用，最適合先改成 GUI 可管理的模板型 generator。",
        )
    if reuse_count == 2:
        return (
            "template-db-candidate",
            "builder 已開始共用，適合第二階段資料庫化，降低重複維護。",
        )
    return (
        "keep-js-builder",
        "目前是一題一函數的一對一 builder，先保留在 JS，之後只把 metadata 與掛載改成資料庫較穩。",
    )


def build_markdown(summary: dict, rows: list[dict]) -> str:
    lines = [
        "# Practice Generator Audit",
        "",
        f"- 生成器總數：{summary['totalConfigs']}",
        f"- 直接掛主題：{summary['legacyDirectCount']}",
        f"- 已進 practice-db：{summary['assignmentCount']}",
        f"- GUI 可見：{summary['guiVisibleCount']}",
        "",
        "## 欄位說明",
        "",
        "- `sourceLocation`：原始 config 與 builder 的檔案行號",
        "- `runtimeMode`：目前前端實際採用的模式",
        "- `guiState`：GUI 目前看到的是正式 DB 紀錄，還是 legacy overlay",
        "- `migrationRecommendation`：之後最佳管理方式",
        "",
        "## Inventory",
        "",
        "| id | topicTitle | sourceLocation | runtimeMode | guiState | migrationRecommendation |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for row in rows:
        source_info = row.get("sourceLocation", {})
        source = f"`formula-practice.js:{source_info.get('configLine', 0)}`"
        if source_info.get("builderLine"):
            source += f" / `builder:{source_info.get('builderName', '')}@{source_info.get('builderLine', 0)}`"
        lines.append(
            f"| `{row['id']}` | {row['topicTitle']} | {source} | {row['runtimeMode']} | {row['guiState']} | {row['migrationRecommendation']} |"
        )
    lines.extend(
        [
            "",
            "## Recommended Order",
            "",
            "1. 先把 `practice-db.json` 補齊，讓所有 legacy 直連主題都有正式 assignment。",
            "2. 先資料庫化重複使用的 builder，例如 `buildBinomialQuestions`、`buildPureConjugateQuestions`、`buildPureSquareDifferenceQuestions`、`mod9/mod11` 三組。",
            "3. 單一主題專用 builder 先保留在 JS，只把標題、難度、題數、啟用狀態交給 GUI 管。",
        ]
    )
    return "\n".join(lines) + "\n"


def main():
    practice_text = PRACTICE_JS_PATH.read_text(encoding="utf-8-sig")
    formula_payload = read_json(FORMULA_DB_PATH, {"topics": []})
    practice_payload = read_json(PRACTICE_DB_PATH, {"assignments": []})

    topics = [row for row in formula_payload.get("topics", []) if isinstance(row, dict)]
    topic_lookup = {
        str(row.get("id", "")).strip(): row
        for row in topics
        if str(row.get("id", "")).strip()
    }
    assignment_lookup = {
        str(row.get("id", "")).strip(): row
        for row in practice_payload.get("assignments", [])
        if isinstance(row, dict) and str(row.get("id", "")).strip()
    }

    configs = parse_practice_configs(practice_text)
    builder_line_map = build_builder_line_map(
        practice_text,
        {row.get("builderName", "") for row in configs},
    )

    reuse_count_by_builder = {}
    for row in configs:
        builder = row.get("builderName", "")
        reuse_count_by_builder[builder] = reuse_count_by_builder.get(builder, 0) + 1

    audit_rows = []
    for row in configs:
        topic = topic_lookup.get(row["id"], {})
        assignment = assignment_lookup.get(row["id"])
        legacy_direct = row["id"] in topic_lookup
        gui_visible = bool(legacy_direct or assignment)
        gui_state = "db-record" if assignment else ("legacy-overlay" if legacy_direct else "hidden")
        runtime_mode = "practice-db-assignment" if assignment else ("legacy-direct" if legacy_direct else "unlinked")
        recommendation, reason = recommend_management(
            row.get("builderName", ""),
            reuse_count_by_builder.get(row.get("builderName", ""), 0),
        )

        audit_rows.append(
            {
                "id": row["id"],
                "topicTitle": str(topic.get("title", "") or row.get("title", "") or row["id"]),
                "stage": str(topic.get("stage", "") or ""),
                "grade": str(topic.get("grade", "") or ""),
                "term": str(topic.get("term", "") or ""),
                "chapter": str(topic.get("chapter", "") or ""),
                "contentTypes": [str(x).strip() for x in (topic.get("contentTypes") or []) if str(x).strip()],
                "sourceLocation": {
                    "configFile": str(PRACTICE_JS_PATH.relative_to(ROOT)).replace("\\", "/"),
                    "configLine": row["configLine"],
                    "builderName": row.get("builderName", ""),
                    "builderLine": builder_line_map.get(row.get("builderName", ""), 0),
                },
                "builderArgs": row.get("builderArgs", ""),
                "legacyDirect": legacy_direct,
                "inPracticeDb": bool(assignment),
                "guiVisible": gui_visible,
                "guiState": gui_state,
                "runtimeMode": runtime_mode,
                "migrationRecommendation": recommendation,
                "migrationReason": reason,
            }
        )

    audit_rows.sort(key=lambda row: row["id"])
    summary = {
        "totalConfigs": len(audit_rows),
        "legacyDirectCount": sum(1 for row in audit_rows if row["legacyDirect"]),
        "assignmentCount": sum(1 for row in audit_rows if row["inPracticeDb"]),
        "guiVisibleCount": sum(1 for row in audit_rows if row["guiVisible"]),
    }

    payload = {
        "meta": summary,
        "rows": audit_rows,
    }

    EXPORT_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    EXPORT_JSON_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    EXPORT_MD_PATH.write_text(build_markdown(summary, audit_rows), encoding="utf-8")

    print(f"practice_audit_json={EXPORT_JSON_PATH}")
    print(f"practice_audit_md={EXPORT_MD_PATH}")
    print(f"practice_config_count={summary['totalConfigs']}")
    print(f"practice_db_assignment_count={summary['assignmentCount']}")


if __name__ == "__main__":
    main()
