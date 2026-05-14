from __future__ import annotations

import argparse
import json
from pathlib import Path

from question_media_library import (
    MEDIA_LIBRARY_ROOT,
    WORKSPACE_ROOT,
    canonical_media_ref,
    canonicalize_media_suffix,
    file_sha1,
    legacy_canonical_media_ref,
)
from sync_web_data import sync_question_js_from_db


TEXT_FILE_SUFFIXES = {".json", ".md", ".txt"}


def list_formal_pack_codes() -> list[str]:
    packs_root = WORKSPACE_ROOT / "program-db" / "imports" / "packs"
    codes: list[str] = []
    for pack_dir in sorted(packs_root.iterdir()):
        if not pack_dir.is_dir():
            continue
        if pack_dir.name.startswith("_inspect-"):
            continue
        if not (pack_dir / "questions.json").exists():
            continue
        codes.append(pack_dir.name)
    return codes


def copy_pack_media(pack_dir: Path, chapter_code: str) -> tuple[int, int]:
    source_root = pack_dir / "assets" / "media"
    target_root = MEDIA_LIBRARY_ROOT / chapter_code
    if not source_root.exists():
        return 0, 0

    preferred_sources: dict[Path, Path] = {}
    for source_path in sorted(p for p in source_root.rglob("*") if p.is_file()):
        relative_suffix = canonicalize_media_suffix(str(source_path.relative_to(WORKSPACE_ROOT)), chapter_code)
        target_path = target_root / relative_suffix
        current = preferred_sources.get(target_path)
        if current is None:
            preferred_sources[target_path] = source_path
            continue
        current_name = current.name.lower()
        candidate_name = source_path.name.lower()
        current_is_display = current_name.endswith(".png")
        candidate_is_display = candidate_name.endswith(".png")
        if candidate_is_display and not current_is_display:
            preferred_sources[target_path] = source_path

    copied = 0
    skipped_same = 0
    for target_path, source_path in sorted(preferred_sources.items()):
        target_path.parent.mkdir(parents=True, exist_ok=True)
        if target_path.exists() and file_sha1(target_path) == file_sha1(source_path):
            skipped_same += 1
            continue
        target_path.write_bytes(source_path.read_bytes())
        copied += 1
    return copied, skipped_same


def build_replacement_map(pack_dir: Path, chapter_code: str) -> dict[str, str]:
    source_root = pack_dir / "assets" / "media"
    mapping: dict[str, str] = {}
    if not source_root.exists():
        return mapping

    for source_path in sorted(p for p in source_root.rglob("*") if p.is_file()):
        rel_from_workspace = source_path.relative_to(WORKSPACE_ROOT)
        rel_posix = rel_from_workspace.as_posix()
        rel_windows = str(rel_from_workspace)
        new_ref = canonical_media_ref(chapter_code, rel_posix)
        old_library_ref = legacy_canonical_media_ref(chapter_code, rel_posix)

        variants = {
            rel_posix,
            rel_windows,
            f"./{rel_posix}",
            f".\\{rel_windows}",
            str(source_path),
            source_path.as_posix(),
            old_library_ref,
            old_library_ref.replace("/", "\\"),
        }
        for old in variants:
            mapping[old] = new_ref
    return mapping


def rewrite_text(text: str, replacement_map: dict[str, str]) -> tuple[str, int]:
    updated = str(text or "")
    replacements = 0
    for old, new in sorted(replacement_map.items(), key=lambda item: len(item[0]), reverse=True):
        count = updated.count(old)
        if count:
            updated = updated.replace(old, new)
            replacements += count
    return updated, replacements


def rewrite_pack_files(pack_dir: Path, chapter_code: str, replacement_map: dict[str, str]) -> tuple[int, list[str]]:
    changed_files: list[str] = []
    total_replacements = 0

    for path in sorted(pack_dir.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in TEXT_FILE_SUFFIXES:
            continue
        original = path.read_text(encoding="utf-8")
        updated, replacements = rewrite_text(original, replacement_map)
        if replacements:
            path.write_text(updated, encoding="utf-8")
            total_replacements += replacements
            changed_files.append(str(path.relative_to(WORKSPACE_ROOT)))

    manifest_path = pack_dir / "manifest.json"
    if manifest_path.exists():
        payload = json.loads(manifest_path.read_text(encoding="utf-8"))
        payload["asset_roots"] = [
            {
                "path": f"program-db/assets/question-media/{chapter_code}",
                "role": "canonical_question_media",
            }
        ]
        manifest_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        if str(manifest_path.relative_to(WORKSPACE_ROOT)) not in changed_files:
            changed_files.append(str(manifest_path.relative_to(WORKSPACE_ROOT)))

    return total_replacements, changed_files


def rewrite_question_db(chapter_codes: list[str], replacement_map: dict[str, str], db_path: Path) -> tuple[int, int]:
    payload = json.loads(db_path.read_text(encoding="utf-8"))
    rows = payload.get("questions", [])
    updated_rows = 0
    total_replacements = 0

    for row in rows:
        row_changed = False
        for field in ("title", "question_text", "answer_text", "explanation_text"):
            original = row.get(field, "")
            updated, replacements = rewrite_text(original, replacement_map)
            if replacements:
                row[field] = updated
                total_replacements += replacements
                row_changed = True
        if row_changed:
            updated_rows += 1

    payload.setdefault("meta", {})
    payload["meta"]["mediaLibraryMigrated"] = sorted(set(chapter_codes))
    db_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return updated_rows, total_replacements


def cleanup_obsolete_vector_files(chapter_codes: list[str]) -> int:
    deleted = 0
    for chapter_code in chapter_codes:
        target_root = MEDIA_LIBRARY_ROOT / chapter_code
        if not target_root.exists():
            continue
        for path in sorted(target_root.rglob("*")):
            if not path.is_file():
                continue
            lowered = path.name.lower()
            if lowered.endswith(".emf") or lowered.endswith(".wmf") or lowered.endswith(".emf.png") or lowered.endswith(".wmf.png"):
                path.unlink()
                deleted += 1
    return deleted


def main() -> None:
    parser = argparse.ArgumentParser(description="Move pack media into the canonical question-media library and rewrite paths.")
    parser.add_argument("--chapter-code", action="append", help="Chapter code to migrate, e.g. s1-1-1")
    parser.add_argument("--all-formal-packs", action="store_true", help="Migrate every formal pack under program-db/imports/packs")
    parser.add_argument("--update-question-db", action="store_true", help="Rewrite current question-db.json for these chapter codes too")
    args = parser.parse_args()

    chapter_codes = list(args.chapter_code or [])
    if args.all_formal_packs:
        chapter_codes.extend(list_formal_pack_codes())
    chapter_codes = sorted(dict.fromkeys(chapter_codes))
    if not chapter_codes:
        raise ValueError("No chapter codes selected for migration.")
    overall_replacement_map: dict[str, str] = {}
    total_copied = 0
    total_skipped_same = 0
    total_pack_replacements = 0
    changed_files: list[str] = []

    for chapter_code in chapter_codes:
        pack_dir = WORKSPACE_ROOT / "program-db" / "imports" / "packs" / chapter_code
        if not pack_dir.exists():
            raise FileNotFoundError(f"Pack not found: {pack_dir}")

        copied, skipped_same = copy_pack_media(pack_dir, chapter_code)
        replacement_map = build_replacement_map(pack_dir, chapter_code)
        replacements, files = rewrite_pack_files(pack_dir, chapter_code, replacement_map)

        overall_replacement_map.update(replacement_map)
        total_copied += copied
        total_skipped_same += skipped_same
        total_pack_replacements += replacements
        changed_files.extend(files)

    updated_rows = 0
    db_replacements = 0
    if args.update_question_db and overall_replacement_map:
        db_path = WORKSPACE_ROOT / "program-db" / "database" / "question-db.json"
        updated_rows, db_replacements = rewrite_question_db(chapter_codes, overall_replacement_map, db_path)
        sync_question_js_from_db(db_path)

    deleted_obsolete = cleanup_obsolete_vector_files(chapter_codes)

    print(f"chapters={len(chapter_codes)}")
    print(f"media_copied={total_copied}")
    print(f"media_skipped_same={total_skipped_same}")
    print(f"pack_replacements={total_pack_replacements}")
    print(f"db_rows_updated={updated_rows}")
    print(f"db_replacements={db_replacements}")
    print(f"obsolete_vector_files_deleted={deleted_obsolete}")
    for item in sorted(set(changed_files)):
        print(item)


if __name__ == "__main__":
    main()
