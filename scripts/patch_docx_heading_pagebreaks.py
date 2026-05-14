from __future__ import annotations

import copy
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W_NS}
ET.register_namespace("w", W_NS)


def make_page_break_before():
    return ET.Element(f"{{{W_NS}}}pageBreakBefore")


def is_break_only_paragraph(paragraph: ET.Element) -> bool:
    p_pr = paragraph.find("w:pPr", NS)
    children = [child for child in paragraph if child is not p_pr]
    if len(children) != 1:
        return False
    run = children[0]
    if run.tag != f"{{{W_NS}}}r":
        return False
    run_children = list(run)
    if len(run_children) != 1:
        return False
    br = run_children[0]
    return br.tag == f"{{{W_NS}}}br" and br.attrib.get(f"{{{W_NS}}}type") == "page"


def ensure_page_break_before(p_pr: ET.Element) -> None:
    existing = p_pr.find("w:pageBreakBefore", NS)
    if existing is None:
        p_pr.append(make_page_break_before())


def patch_document_xml(xml_bytes: bytes) -> bytes:
    root = ET.fromstring(xml_bytes)
    body = root.find("w:body", NS)
    if body is None:
        raise RuntimeError("word/document.xml is missing w:body")

    body_children = list(body)
    kept_children = []
    heading1_seen = 0

    for child in body_children:
        if child.tag != f"{{{W_NS}}}p":
            kept_children.append(copy.deepcopy(child))
            continue

        if is_break_only_paragraph(child):
            continue

        para = copy.deepcopy(child)
        p_pr = para.find("w:pPr", NS)
        if p_pr is None:
            p_pr = ET.Element(f"{{{W_NS}}}pPr")
            para.insert(0, p_pr)

        p_style = p_pr.find("w:pStyle", NS)
        style_val = p_style.attrib.get(f"{{{W_NS}}}val") if p_style is not None else None

        if style_val == "Heading1":
            heading1_seen += 1
            if heading1_seen > 1:
                ensure_page_break_before(p_pr)
        elif style_val == "Heading2":
            ensure_page_break_before(p_pr)

        kept_children.append(para)

    body.clear()
    for child in kept_children:
        body.append(child)

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: patch_docx_heading_pagebreaks.py <input.docx> <output.docx>", file=sys.stderr)
        return 2

    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    dst.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(src, "r") as zin, zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "word/document.xml":
                data = patch_document_xml(data)
            zout.writestr(item, data)

    print(str(dst))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
