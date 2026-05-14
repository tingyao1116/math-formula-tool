#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import importlib
import json
import shutil
import subprocess
from dataclasses import dataclass, asdict
from typing import Dict, List

from text_safety import run_utf8_checked


REQUIRED_PACKAGES = [
    "docx",
    "rapidfuzz",
    "pytesseract",
    "PIL",
    "opencc",
]


REQUIRED_COMMANDS = [
    ("python", ["python", "--version"]),
    ("node", ["node", "--version"]),
    ("pandoc", ["pandoc", "--version"]),
]


TESSERACT_CANDIDATES = [
    "tesseract",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
]


@dataclass
class CheckItem:
    name: str
    ok: bool
    detail: str


def run_command(cmd: List[str]) -> str:
    text = run_utf8_checked(cmd)
    return text.splitlines()[0] if text else "ok"


def find_tesseract() -> str:
    for candidate in TESSERACT_CANDIDATES:
        if shutil.which(candidate):
            return shutil.which(candidate) or candidate
        if "\\" in candidate:
            try:
                with open(candidate, "rb"):
                    return candidate
            except OSError:
                pass
    return ""


def check_commands() -> List[CheckItem]:
    result: List[CheckItem] = []
    for name, cmd in REQUIRED_COMMANDS:
        path = shutil.which(cmd[0])
        if not path:
            result.append(CheckItem(name=name, ok=False, detail="未安裝或不在 PATH"))
            continue
        try:
            version = run_command(cmd)
            result.append(CheckItem(name=name, ok=True, detail=f"{version} ({path})"))
        except Exception as exc:  # pragma: no cover
            result.append(CheckItem(name=name, ok=False, detail=f"執行失敗：{exc}"))

    tess_path = find_tesseract()
    if not tess_path:
        result.append(CheckItem(name="tesseract", ok=False, detail="未安裝"))
        return result

    try:
        version = run_command([tess_path, "--version"])
        langs_output = run_utf8_checked([tess_path, "--list-langs"])
        langs = set()
        for line in (langs_output or "").splitlines():
            line = line.strip()
            if not line or line.startswith("List of available"):
                continue
            langs.add(line)
        missing_langs = [lang for lang in ["chi_tra", "eng", "equ"] if lang not in langs]
        if missing_langs:
            result.append(
                CheckItem(
                    name="tesseract",
                    ok=False,
                    detail=f"{version} ({tess_path})，缺少語言包：{', '.join(missing_langs)}",
                )
            )
        else:
            result.append(CheckItem(name="tesseract", ok=True, detail=f"{version} ({tess_path})"))
    except Exception as exc:  # pragma: no cover
        result.append(CheckItem(name="tesseract", ok=False, detail=f"執行失敗：{exc}"))

    return result


def check_packages() -> List[CheckItem]:
    rows: List[CheckItem] = []
    for pkg in REQUIRED_PACKAGES:
        try:
            module = importlib.import_module(pkg)
            version = getattr(module, "__version__", "unknown")
            rows.append(CheckItem(name=f"py:{pkg}", ok=True, detail=f"version={version}"))
        except Exception:
            rows.append(CheckItem(name=f"py:{pkg}", ok=False, detail="未安裝"))
    return rows


def build_report() -> Dict:
    command_rows = check_commands()
    package_rows = check_packages()
    all_rows = command_rows + package_rows
    ok_count = sum(1 for row in all_rows if row.ok)
    return {
        "ok": ok_count == len(all_rows),
        "summary": {
            "ok": ok_count,
            "total": len(all_rows),
            "failed": len(all_rows) - ok_count,
        },
        "checks": [asdict(row) for row in all_rows],
    }


def main():
    parser = argparse.ArgumentParser(description="檢查 Word 匯入/重點整理流程所需工具")
    parser.add_argument("--json", action="store_true", help="只輸出 JSON")
    args = parser.parse_args()

    report = build_report()
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return

    print("Word 流程工具檢查")
    print(f"整體狀態：{'通過' if report['ok'] else '未通過'}")
    print(f"通過 {report['summary']['ok']} / {report['summary']['total']}")
    for row in report["checks"]:
        status = "OK" if row["ok"] else "缺少"
        print(f"- [{status}] {row['name']}: {row['detail']}")


if __name__ == "__main__":
    main()
