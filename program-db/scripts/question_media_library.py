from __future__ import annotations

import hashlib
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = SCRIPT_DIR.parent.parent
PROGRAM_DB_ROOT = WORKSPACE_ROOT / "program-db"
MEDIA_LIBRARY_ROOT = PROGRAM_DB_ROOT / "assets" / "question-media"


def normalize_slashes(value: str) -> str:
    return str(value or "").strip().replace("\\", "/")


def workspace_relative_text(path: Path) -> str:
    return path.relative_to(WORKSPACE_ROOT).as_posix()


def extract_pack_media_suffix(path_text: str, chapter_code: str) -> str:
    normalized = normalize_slashes(path_text)
    if not normalized:
        return ""

    markers = [
        f"program-db/imports/packs/{chapter_code}/assets/media/",
        f"./program-db/imports/packs/{chapter_code}/assets/media/",
    ]
    lowered = normalized.lower()
    for marker in markers:
        index = lowered.find(marker.lower())
        if index >= 0:
            return normalized[index + len(marker) :]
    return normalized


def legacy_media_suffix(path_text: str, chapter_code: str) -> str:
    suffix = extract_pack_media_suffix(path_text, chapter_code)
    suffix_path = Path(normalize_slashes(suffix))
    parts = [part for part in suffix_path.parts if part not in ("", ".")]
    while parts and parts[0].lower() == "media":
        parts = parts[1:]
    if not parts:
        raise ValueError(f"Cannot canonicalize media path: {path_text}")
    return Path(*parts).as_posix()


def display_filename(name: str) -> str:
    lowered = name.lower()
    if lowered.endswith(".emf.png") or lowered.endswith(".wmf.png"):
        return name.rsplit(".", 2)[0] + ".png"
    if lowered.endswith(".emf") or lowered.endswith(".wmf"):
        return name.rsplit(".", 1)[0] + ".png"
    return name


def canonicalize_media_suffix(path_text: str, chapter_code: str) -> str:
    legacy_suffix = legacy_media_suffix(path_text, chapter_code)
    suffix_path = Path(legacy_suffix)
    parts = list(suffix_path.parts)
    if not parts:
        raise ValueError(f"Cannot canonicalize media path: {path_text}")
    parts[-1] = display_filename(parts[-1])
    return Path(*parts).as_posix()


def canonical_media_path(chapter_code: str, path_text: str) -> Path:
    return MEDIA_LIBRARY_ROOT / chapter_code / canonicalize_media_suffix(path_text, chapter_code)


def canonical_media_ref(chapter_code: str, path_text: str) -> str:
    return workspace_relative_text(canonical_media_path(chapter_code, path_text))


def legacy_canonical_media_ref(chapter_code: str, path_text: str) -> str:
    return f"program-db/assets/question-media/{chapter_code}/{legacy_media_suffix(path_text, chapter_code)}"


def file_sha1(path: Path) -> str:
    digest = hashlib.sha1()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()
