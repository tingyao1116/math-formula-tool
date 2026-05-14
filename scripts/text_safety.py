from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path
from typing import Any, Mapping, Sequence


UTF8 = "utf-8"
REPLACEMENT_CHAR = "\ufffd"


def utf8_env(extra: Mapping[str, str] | None = None) -> dict[str, str]:
    env = dict(os.environ)
    env.setdefault("PYTHONUTF8", "1")
    env.setdefault("PYTHONIOENCODING", UTF8)
    if extra:
        env.update(extra)
    return env


def read_utf8_text(path: Path) -> str:
    return path.read_text(encoding=UTF8)


def write_utf8_text(path: Path, text: str) -> None:
    path.write_text(text, encoding=UTF8)


def load_json_utf8(path: Path) -> Any:
    return json.loads(read_utf8_text(path))


def save_json_utf8(path: Path, payload: Any) -> None:
    write_utf8_text(path, json.dumps(payload, ensure_ascii=False, indent=2) + "\n")


def file_has_replacement_char(path: Path) -> bool:
    return REPLACEMENT_CHAR in read_utf8_text(path)


def assert_no_replacement_char_in_text(text: str, label: str) -> None:
    if REPLACEMENT_CHAR in text:
        raise RuntimeError(
            f"{label} contains U+FFFD replacement characters; stop instead of writing corrupted text."
        )


def assert_no_replacement_char_in_file(path: Path) -> None:
    assert_no_replacement_char_in_text(read_utf8_text(path), str(path))


def _decode_utf8_strict(data: bytes, label: str) -> str:
    try:
        return data.decode(UTF8)
    except UnicodeDecodeError as exc:
        raise RuntimeError(f"{label} is not valid UTF-8; stop instead of replacing undecodable bytes.") from exc


def run_utf8_command(
    cmd: Sequence[str],
    *,
    cwd: Path | None = None,
    check: bool = False,
    extra_env: Mapping[str, str] | None = None,
) -> tuple[int, str]:
    proc = subprocess.run(
        list(cmd),
        cwd=str(cwd) if cwd else None,
        capture_output=True,
        text=False,
        env=utf8_env(extra_env),
        check=False,
    )
    stdout = _decode_utf8_strict(proc.stdout or b"", f"{cmd[0]} stdout")
    stderr = _decode_utf8_strict(proc.stderr or b"", f"{cmd[0]} stderr")
    combined = stdout + (("\n" + stderr) if stderr else "")
    assert_no_replacement_char_in_text(combined, "command output")
    output = combined.strip()
    if check and proc.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{output}")
    return proc.returncode, output


def run_utf8_checked(
    cmd: Sequence[str],
    *,
    cwd: Path | None = None,
    extra_env: Mapping[str, str] | None = None,
) -> str:
    _, output = run_utf8_command(cmd, cwd=cwd, check=True, extra_env=extra_env)
    return output
