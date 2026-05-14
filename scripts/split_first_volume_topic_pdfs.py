from __future__ import annotations

import json
from pathlib import Path
import re

import fitz


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PDF = Path(
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\高中數學哈特利重點版\高一上全重點_易讀版分頁版.pdf"
)
OUTPUT_DIR = ROOT / "exports" / "main-theme-overviews"
MANIFEST_PATH = OUTPUT_DIR / "first-volume-topic-pdfs.json"

TITLE_PREFIX_PATTERN = re.compile(r"^(?:主要主題|主題)\s*\d+\s*[：:]\s*")


TOPIC_SPECS = [
    {"chapterCode": "s1-1-1", "topicNumber": 1, "slug": "rational", "title": "主題1：有理數的定義與性質", "page": 2},
    {"chapterCode": "s1-1-1", "topicNumber": 2, "slug": "irrational", "title": "主題2：無理數", "page": 3},
    {"chapterCode": "s1-1-1", "topicNumber": 3, "slug": "real-line", "title": "主題3：實數與數線", "page": 4},
    {"chapterCode": "s1-1-1", "topicNumber": 4, "slug": "distance", "title": "主題4：距離與分點公式", "page": 5},
    {"chapterCode": "s1-1-2", "topicNumber": 1, "slug": "absolute-value", "title": "主題1：絕對值", "page": 7},
    {"chapterCode": "s1-1-3", "topicNumber": 1, "slug": "formula-fraction-radical", "title": "主題1：乘法公式、分式與根式的運算", "page": 9},
    {"chapterCode": "s1-1-3", "topicNumber": 2, "slug": "am-gm-inequality", "title": "主題2：算幾不等式", "page": 10},
    {"chapterCode": "s1-1-4", "topicNumber": 1, "slug": "exponent-laws", "title": "主題1：指數律", "page": 12},
    {"chapterCode": "s1-1-5", "topicNumber": 1, "slug": "common-logarithm", "title": "主題1：常用對數", "page": 14},
    {"chapterCode": "s1-1-5", "topicNumber": 2, "slug": "scientific-notation", "title": "主題2：科學記號", "page": 15},
    {"chapterCode": "s1-2-1", "topicNumber": 1, "slug": "coordinate-system", "title": "主題1：坐標系", "page": 17},
    {"chapterCode": "s1-2-1", "topicNumber": 2, "slug": "slope", "title": "主題2：直線斜率", "page": 18},
    {"chapterCode": "s1-2-1", "topicNumber": 3, "slug": "line-equation", "title": "主題3：直線方程式", "page": 19},
    {"chapterCode": "s1-2-1", "topicNumber": 4, "slug": "linear-inequality-two-vars", "title": "主題4：二元一次不等式", "page": 20},
    {"chapterCode": "s1-2-2", "topicNumber": 1, "slug": "circle-equation", "title": "主題1：圓的方程式", "page": 22},
    {"chapterCode": "s1-2-3", "topicNumber": 1, "slug": "circle-point-relation", "title": "主題1：圓與點之關係", "page": 24},
    {"chapterCode": "s1-2-3", "topicNumber": 2, "slug": "circle-line-relation", "title": "主題2：圓與直線的關係", "page": 25},
    {"chapterCode": "s1-2-3", "topicNumber": 3, "slug": "circle-tangent", "title": "主題3：圓之切線", "page": 26},
    {"chapterCode": "s1-2-3", "topicNumber": 4, "slug": "circle-family", "title": "主題4：圓系", "page": 27},
    {"chapterCode": "s1-3-1", "topicNumber": 1, "slug": "polynomial-basics", "title": "主題1：多項式基本概念", "page": 29},
    {"chapterCode": "s1-3-1", "topicNumber": 2, "slug": "polynomial-arithmetic", "title": "主題2：多項式四則運算", "page": 30},
    {"chapterCode": "s1-3-1", "topicNumber": 3, "slug": "remainder-factor-theorems", "title": "主題3：餘式定理與因式定理", "page": 31},
    {"chapterCode": "s1-3-2", "topicNumber": 1, "slug": "linear-function", "title": "主題1：線型函數", "page": 33},
    {"chapterCode": "s1-3-2", "topicNumber": 2, "slug": "quadratic-function", "title": "主題2：二次函數", "page": 34},
    {"chapterCode": "s1-3-2", "topicNumber": 3, "slug": "monomial-function", "title": "主題3：單項函數", "page": 35},
    {"chapterCode": "s1-3-2", "topicNumber": 4, "slug": "polynomial-function-graph", "title": "主題4：多項式函數的圖形", "page": 36},
    {"chapterCode": "s1-3-3", "topicNumber": 1, "slug": "linear-inequality-solving", "title": "主題1：一元一次不等式的解法", "page": 38},
    {"chapterCode": "s1-3-3", "topicNumber": 2, "slug": "quadratic-inequality-solving", "title": "主題2：二次不等式的解法", "page": 39},
    {"chapterCode": "s1-3-3", "topicNumber": 3, "slug": "higher-order-inequality-solving", "title": "主題3：高次不等式的解法", "page": 40},
]


def export_single_page_pdf(source_doc: fitz.Document, page_number: int, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_doc = fitz.open()
    output_doc.insert_pdf(source_doc, from_page=page_number - 1, to_page=page_number - 1)
    output_doc.save(output_path)
    output_doc.close()


def normalize_topic_title(title: str) -> str:
    return TITLE_PREFIX_PATTERN.sub("", str(title or "")).strip()


def main() -> None:
    source_doc = fitz.open(SOURCE_PDF)
    manifest = []

    for spec in TOPIC_SPECS:
        file_name = f"{spec['chapterCode']}-topic-{spec['topicNumber']}-{spec['slug']}.pdf"
        output_path = OUTPUT_DIR / file_name
        export_single_page_pdf(source_doc, spec["page"], output_path)
        manifest.append(
            {
                "chapterCode": spec["chapterCode"],
                "topicNumber": spec["topicNumber"],
                "slug": spec["slug"],
                "title": normalize_topic_title(spec["title"]),
                "page": spec["page"],
                "file": file_name,
            }
        )

    source_doc.close()
    MANIFEST_PATH.write_text(
        json.dumps(
            {
                "sourcePdf": str(SOURCE_PDF),
                "count": len(manifest),
                "topics": manifest,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
