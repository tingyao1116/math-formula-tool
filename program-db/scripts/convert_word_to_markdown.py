import argparse
import shutil
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory


def find_executable(name: str) -> str | None:
    found = shutil.which(name)
    if found:
        return found
    if name.lower() != "soffice":
        return None
    candidates = [
        Path(r"C:\Program Files\LibreOffice\program\soffice.exe"),
        Path(r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return None


def run_checked(command: list[str]) -> str:
    proc = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    output = proc.stdout or ""
    if proc.returncode != 0:
        raise RuntimeError("Command failed:\n" + " ".join(command) + "\n\n" + output)
    return output


def convert_doc_to_docx(source: Path, work_dir: Path) -> Path:
    soffice = find_executable("soffice")
    if not soffice:
        raise RuntimeError("找不到 LibreOffice/soffice，舊 .doc 請先用 Word 另存成 .docx 後再轉。")

    run_checked(
        [
            soffice,
            "--headless",
            "--convert-to",
            "docx",
            "--outdir",
            str(work_dir),
            str(source),
        ]
    )
    converted = work_dir / f"{source.stem}.docx"
    if not converted.exists():
        matches = list(work_dir.glob("*.docx"))
        if matches:
            return matches[0]
        raise RuntimeError("LibreOffice 已執行，但找不到轉出的 .docx。")
    return converted


def convert_word_to_markdown(source: Path, output: Path, extract_media: bool = True) -> dict:
    source = source.resolve()
    output = output.resolve()
    if source.suffix.lower() not in {".docx", ".doc"}:
        raise ValueError("來源檔只支援 .docx 或 .doc。")

    pandoc = find_executable("pandoc")
    if not pandoc:
        raise RuntimeError("找不到 pandoc，請先安裝 pandoc 或確認 PATH。")

    output.parent.mkdir(parents=True, exist_ok=True)
    media_dir = output.with_name(f"{output.stem}_media")

    input_docx = source
    converted_from_doc = False
    temp_context = None
    if source.suffix.lower() == ".doc":
        temp_context = TemporaryDirectory(prefix="word-to-md-", dir=output.parent)
        work_dir = Path(temp_context.name)
        input_docx = convert_doc_to_docx(source, work_dir)
        converted_from_doc = True

    try:
        command = [
            pandoc,
            str(input_docx),
            "--from",
            "docx",
            "--to",
            "gfm+tex_math_dollars",
            "--wrap=none",
            "--markdown-headings=atx",
            "-o",
            str(output),
        ]
        if extract_media:
            command.insert(-2, f"--extract-media={media_dir}")

        pandoc_output = run_checked(command)
        if extract_media and output.exists():
            markdown = output.read_text(encoding="utf-8")
            markdown = markdown.replace(str(media_dir), media_dir.name)
            markdown = markdown.replace(str(media_dir).replace("\\", "/"), media_dir.name)
            output.write_text(markdown, encoding="utf-8")
    finally:
        if temp_context is not None:
            temp_context.cleanup()

    return {
        "source": str(source),
        "output": str(output),
        "media_dir": str(media_dir) if extract_media else "",
        "converted_from_doc": converted_from_doc,
        "pandoc_output": pandoc_output.strip(),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Convert Word .docx/.doc files to UTF-8 Markdown with pandoc.")
    parser.add_argument("source", help="Source .docx or .doc file")
    parser.add_argument("-o", "--output", help="Output .md path")
    parser.add_argument("--no-extract-media", action="store_true", help="Do not extract embedded images/media")
    args = parser.parse_args(argv)

    source = Path(args.source)
    if args.output:
        output = Path(args.output)
    else:
        output = source.with_suffix(".md")

    result = convert_word_to_markdown(source, output, extract_media=not args.no_extract_media)
    print("Word 轉 Markdown 完成")
    print(f"來源：{result['source']}")
    print(f"輸出：{result['output']}")
    if result["media_dir"]:
        print(f"媒體資料夾：{result['media_dir']}")
    if result["converted_from_doc"]:
        print("提醒：來源為 .doc，已先透過 LibreOffice 暫轉 .docx。")
    if result["pandoc_output"]:
        print(result["pandoc_output"])
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"轉換失敗：{exc}", file=sys.stderr)
        raise SystemExit(1)
