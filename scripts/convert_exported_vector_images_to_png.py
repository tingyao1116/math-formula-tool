#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_EXPORTS = ROOT / "exports"


def convert_one(path: Path, overwrite: bool = False) -> tuple[str, str]:
    out = path.with_name(path.name + ".png")
    if out.exists() and not overwrite:
        return "skipped", str(out)

    with Image.open(path) as image:
        image.load()
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA")
        out.parent.mkdir(parents=True, exist_ok=True)
        image.save(out, "PNG")
    return "converted", str(out)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert exported WMF/EMF images under exports/ into browser-friendly PNG sidecars.")
    parser.add_argument("--root", default=str(DEFAULT_EXPORTS), help="Root folder to scan.")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists():
        raise FileNotFoundError(root)

    converted = skipped = failed = 0
    failures: list[tuple[str, str]] = []
    for path in sorted(root.rglob("*")):
        if path.suffix.lower() not in {".wmf", ".emf"}:
            continue
        try:
            status, _ = convert_one(path, overwrite=args.overwrite)
            if status == "converted":
                converted += 1
            else:
                skipped += 1
        except Exception as exc:
            failed += 1
            failures.append((str(path), f"{type(exc).__name__}: {exc}"))

    print(f"converted={converted}")
    print(f"skipped={skipped}")
    print(f"failed={failed}")
    for path, error in failures[:20]:
        print(f"FAIL {path}: {error}")


if __name__ == "__main__":
    main()
