import json
import json
import re
import subprocess
import sys
import tkinter as tk
from collections import defaultdict
from datetime import datetime
from html import escape
from html import unescape
from pathlib import Path
from tempfile import NamedTemporaryFile
from tkinter import filedialog, messagebox, simpledialog, ttk

try:
    from PIL import Image, ImageTk
except Exception:
    Image = None
    ImageTk = None

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer

from question_data_utils import (
    clean_question_body,
    clean_question_title,
    normalize_question_record,
)
from check_text_integrity import FORMULA_DB_PATH, QUESTION_DB_PATH, formal_json_files, scan_json_file
from import_formal_question_packs import import_formal_packs
from convert_word_to_markdown import convert_word_to_markdown
from practice_db_utils import (
    DB_PATH as PRACTICE_DB_DEFAULT,
    LEGACY_PRACTICE_JS_PATH,
    extract_legacy_practice_catalog,
    load_practice_payload,
    normalize_practice_binding,
    normalize_practice_payload,
    normalize_practice_record,
    now_iso as practice_now_iso,
)
from sync_legacy_bridge import sync_legacy_js_from_db
from sync_extra_bridge import sync_extra_web_from_db
from sync_practice_bridge import sync_practice_assignment_js_from_db
from sync_web_data import sync_question_js_from_db
import pdf_markdown_export

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
DB_DIR = SCRIPT_DIR.parent / "database"
TOPIC_DB_DEFAULT = DB_DIR / "formula-db.json"
QUESTION_DB_DEFAULT = DB_DIR / "question-db.json"
CHAPTER_DB_DEFAULT = DB_DIR / "chapter-code-db.json"
OVERVIEW_DB_DEFAULT = DB_DIR / "chapter-overview-db.json"
OVERVIEW_BODY_DB_DEFAULT = DB_DIR / "chapter-overview-body-db.json"
CHAPTER_CLOSING_DB_DEFAULT = DB_DIR / "chapter-closing-db.json"
MAIN_TOPIC_OVERVIEW_DB_DEFAULT = DB_DIR / "main-topic-overview-db.json"
PRACTICE_DB_FALLBACK = Path.cwd() / "program-db" / "database" / "practice-db.json"
TOPIC_DB_FALLBACK = Path.cwd() / "program-db" / "database" / "formula-db.json"
QUESTION_DB_FALLBACK = Path.cwd() / "program-db" / "database" / "question-db.json"
CHAPTER_DB_FALLBACK = Path.cwd() / "program-db" / "database" / "chapter-code-db.json"
OVERVIEW_DB_FALLBACK = Path.cwd() / "program-db" / "database" / "chapter-overview-db.json"
OVERVIEW_BODY_DB_FALLBACK = Path.cwd() / "program-db" / "database" / "chapter-overview-body-db.json"
CHAPTER_CLOSING_DB_FALLBACK = Path.cwd() / "program-db" / "database" / "chapter-closing-db.json"
MAIN_TOPIC_OVERVIEW_DB_FALLBACK = Path.cwd() / "program-db" / "database" / "main-topic-overview-db.json"
FORMULA_DATA_JS_PATH = ROOT / "formula-data.js"
THEME_DB_DEFAULT = DB_DIR / "practice-theme-db.json"
THEME_BRIDGE_JS_DEFAULT = ROOT / "data" / "practice-theme-chains.js"
CUSTOM_THEME_DB_DEFAULT = DB_DIR / "practice-custom-theme-db.json"
CUSTOM_THEME_BRIDGE_JS_DEFAULT = ROOT / "data" / "practice-custom-theme-chains.js"

ALL = "全部"
LETTER_ESCAPE_RE = re.compile(r"\\\\([A-Za-z])")
PUNCT_ESCAPE_RE = re.compile(r"\\([=+><_.-])")


def resolve_db_path(kind: str) -> Path:
    if kind == "topics":
        return TOPIC_DB_DEFAULT if TOPIC_DB_DEFAULT.exists() else TOPIC_DB_FALLBACK
    if kind == "questions":
        return QUESTION_DB_DEFAULT if QUESTION_DB_DEFAULT.exists() else QUESTION_DB_FALLBACK
    if kind == "chapter":
        return CHAPTER_DB_DEFAULT if CHAPTER_DB_DEFAULT.exists() else CHAPTER_DB_FALLBACK
    if kind == "overviews":
        return OVERVIEW_DB_DEFAULT if OVERVIEW_DB_DEFAULT.exists() else OVERVIEW_DB_FALLBACK
    if kind == "overview_bodies":
        return OVERVIEW_BODY_DB_DEFAULT if OVERVIEW_BODY_DB_DEFAULT.exists() else OVERVIEW_BODY_DB_FALLBACK
    if kind == "closings":
        return CHAPTER_CLOSING_DB_DEFAULT if CHAPTER_CLOSING_DB_DEFAULT.exists() else CHAPTER_CLOSING_DB_FALLBACK
    if kind == "main_overviews":
        return MAIN_TOPIC_OVERVIEW_DB_DEFAULT if MAIN_TOPIC_OVERVIEW_DB_DEFAULT.exists() else MAIN_TOPIC_OVERVIEW_DB_FALLBACK
    if kind == "practices":
        return PRACTICE_DB_DEFAULT if PRACTICE_DB_DEFAULT.exists() else PRACTICE_DB_FALLBACK
    return QUESTION_DB_DEFAULT if QUESTION_DB_DEFAULT.exists() else QUESTION_DB_FALLBACK


_CHAPTER_CODE_STAGE_GRADE_CACHE: dict | None = None


def _extract_js_object_literal(js_text: str, marker: str) -> str:
    """Extract a brace-balanced object literal following `marker` inside `js_text`."""
    start = js_text.find(marker)
    if start < 0:
        raise ValueError(f"找不到標記：{marker}")
    brace_start = start + len(marker) - 1
    depth = 0
    end = -1
    for i in range(brace_start, len(js_text)):
        ch = js_text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    if end < 0:
        raise ValueError(f"找不到物件結尾（標記：{marker}）")
    return js_text[brace_start:end + 1]


def _load_chapter_code_stage_grade_map() -> dict:
    """chapterCode -> {stage, grade, term} derived from formula-data.js's chapterCodeMap.

    This mirrors formula-data.js's own chapterCodeMap + inferMetaFromCode logic so the GUI
    shows/filters the same stage/grade as the website, without practice-db.json needing to
    carry its own (easily miskeyed) copies of stage/grade per record.
    """
    global _CHAPTER_CODE_STAGE_GRADE_CACHE
    if _CHAPTER_CODE_STAGE_GRADE_CACHE is not None:
        return _CHAPTER_CODE_STAGE_GRADE_CACHE

    result: dict = {}
    try:
        raw = FORMULA_DATA_JS_PATH.read_text(encoding="utf-8-sig")
        obj_text = _extract_js_object_literal(raw, "const chapterCodeMap = {")
        composite_map = json.loads(obj_text)
        for composite, code in composite_map.items():
            code = str(code or "").strip()
            if not code or code in result:
                continue
            parts = str(composite or "").split("-", 3)
            if len(parts) < 3:
                continue
            stage, grade, term = parts[0], parts[1], parts[2]
            result[code] = {"stage": stage, "grade": grade, "term": term}
    except Exception:
        result = {}

    _CHAPTER_CODE_STAGE_GRADE_CACHE = result
    return result


def infer_stage_grade_term_from_code(code: str) -> dict:
    """Regex fallback mirroring formula-data.js's inferMetaFromCode(), used when a
    chapterCode is not (yet) listed in formula-data.js's chapterCodeMap."""
    key = str(code or "").strip().lower()
    if not key:
        return {"stage": "", "grade": "", "term": ""}
    rules = [
        (r"^e1-", {"stage": "國小", "grade": "小一", "term": ""}),
        (r"^e2-", {"stage": "國小", "grade": "小二", "term": ""}),
        (r"^e3-", {"stage": "國小", "grade": "小三", "term": ""}),
        (r"^e4-", {"stage": "國小", "grade": "小四", "term": "下學期"}),
        (r"^e5-1-", {"stage": "國小", "grade": "小五", "term": "上學期"}),
        (r"^e5-2-", {"stage": "國小", "grade": "小五", "term": "下學期"}),
        (r"^e5-", {"stage": "國小", "grade": "小五", "term": ""}),
        (r"^e6-1-", {"stage": "國小", "grade": "小六", "term": "上學期"}),
        (r"^e6-2-", {"stage": "國小", "grade": "小六", "term": "下學期"}),
        (r"^e6-", {"stage": "國小", "grade": "小六", "term": ""}),
        (r"^j1-", {"stage": "國中", "grade": "國一", "term": "上學期"}),
        (r"^j2-", {"stage": "國中", "grade": "國一", "term": "下學期"}),
        (r"^j3-", {"stage": "國中", "grade": "國二", "term": "上學期"}),
        (r"^j4-", {"stage": "國中", "grade": "國二", "term": "下學期"}),
        (r"^j5-", {"stage": "國中", "grade": "國三", "term": "上學期"}),
        (r"^j6-", {"stage": "國中", "grade": "國三", "term": "下學期"}),
        (r"^s1-", {"stage": "高中", "grade": "高一", "term": "上學期"}),
        (r"^s2-", {"stage": "高中", "grade": "高一", "term": "下學期"}),
        (r"^s3-", {"stage": "高中", "grade": "高二", "term": "上學期"}),
        (r"^s4-", {"stage": "高中", "grade": "高二", "term": "下學期"}),
        (r"^(s5-|b-)", {"stage": "高中", "grade": "高三", "term": ""}),
    ]
    for pattern, meta in rules:
        if re.match(pattern, key):
            return meta
    return {"stage": "", "grade": "", "term": ""}


def resolve_practice_stage_grade_term(record: dict) -> tuple[str, str, str]:
    """Resolve (stage, grade, term) for a practice record.

    Priority: the record's own explicit fields (kept for backward compatibility / manual
    override) -> formula-data.js's chapterCodeMap (single source of truth) -> regex fallback.
    This is what lets practice-db.json drop its own stage/grade columns without breaking the
    GUI's display or grade filter dropdown.
    """
    record = record if isinstance(record, dict) else {}
    stage = str(record.get("stage", "") or "").strip()
    grade = str(record.get("grade", "") or "").strip()
    term = str(record.get("term", "") or "").strip()
    if stage and grade:
        return stage, grade, term

    code = str(record.get("chapterCode", "") or "").strip()
    if not code:
        return stage, grade, term

    meta = _load_chapter_code_stage_grade_map().get(code)
    if not meta:
        meta = infer_stage_grade_term_from_code(code)

    return (
        stage or meta.get("stage", ""),
        grade or meta.get("grade", ""),
        term or meta.get("term", ""),
    )


# Canonical small-to-large ordering for the 學層 (stage) dropdown/sort.
STAGE_ORDER = ["國小", "國中", "高中"]

# Canonical small-to-large ordering for the 年級 (grade) dropdown/sort, matching the
# e1~e6 / j1~j6 / s1~s4 / s5 chapter-code convention: e-codes are one grade per code
# (小一~小六, no term split shown), j/s-codes pair two codes per grade (上/下學期),
# and s5 (高三) has no term split.
GRADE_LABEL_ORDER = [
    "小一", "小二", "小三", "小四", "小五", "小六",
    "國一上", "國一下", "國二上", "國二下", "國三上", "國三下",
    "高一上", "高一下", "高二上", "高二下", "高三",
]


def build_grade_label(stage: str, grade: str, term: str) -> str:
    """Combine (stage, grade, term) into the single label the 年級 dropdown shows,
    e.g. ("國中", "國一", "上學期") -> "國一上". Mirrors the getGradeLabel() convention
    already used on the student-facing pages (practice-bank.js / practice-mobile.js),
    so the GUI and the website group grades the same way."""
    grade = str(grade or "").strip()
    if not grade:
        return ""
    stage = str(stage or "").strip()
    if stage == "國小" or grade == "高三":
        return grade
    term = str(term or "").strip()
    if term.startswith("上"):
        return f"{grade}上"
    if term.startswith("下"):
        return f"{grade}下"
    return grade


def _ordered_sort_key(order: list[str]):
    def key(label):
        text = str(label or "").strip()
        if text in order:
            return (0, order.index(text))
        return (1, text)
    return key


_stage_sort_key = _ordered_sort_key(STAGE_ORDER)
_grade_label_sort_key = _ordered_sort_key(GRADE_LABEL_ORDER)


def normalize_markdown_escapes(text: str) -> tuple[str, int, int]:
    text, letter_count = LETTER_ESCAPE_RE.subn(lambda match: "\\" + match.group(1), text)
    text, punct_count = PUNCT_ESCAPE_RE.subn(r"\1", text)
    return text, letter_count, punct_count


def deduplicate_text_lines(text: str) -> tuple[str, int, int]:
    lines = text.splitlines(keepends=True)
    seen = set()
    kept_lines = []
    removed_count = 0
    for line in lines:
        normalized = line.rstrip("\r\n")
        if normalized in seen:
            removed_count += 1
            continue
        seen.add(normalized)
        kept_lines.append(line)
    return "".join(kept_lines), len(kept_lines), removed_count


class DualDbGui:
    PRACTICE_MODES = {"practice_records"}

    def _maximize_window(self, window):
        try:
            window.state("zoomed")
            return
        except tk.TclError:
            pass
        try:
            window.attributes("-zoomed", True)
        except tk.TclError:
            pass

    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Formula / Question DB 管理介面")
        self.root.geometry("1380x800")
        self.root.after(0, lambda: self._maximize_window(self.root))

        self.mode = "topics"
        self.topic_payload = {"meta": {}, "topics": []}
        self.question_payload = {"meta": {}, "questions": []}
        self.chapter_payload = {"meta": {}, "catalog": {}}
        self.overview_payload = {"meta": {}, "overviews": {}}
        self.overview_body_payload = {"meta": {}, "bodies": {}}
        self.closing_payload = {"meta": {}, "closings": {}}
        self.main_overview_payload = {"meta": {}, "byId": {}}
        self.practice_payload = {"meta": {}, "assignments": [], "practices": [], "bindings": []}
        self.filtered = []
        self._legacy_practice_catalog_cache = None

        self.keyword_var = tk.StringVar()
        self.stage_var = tk.StringVar(value=ALL)
        self.grade_var = tk.StringVar(value=ALL)
        self.chapter_var = tk.StringVar(value=ALL)
        self.difficulty_var = tk.StringVar(value=ALL)
        self.practice_unbound_only_var = tk.BooleanVar(value=False)
        self.import_delete_var = tk.BooleanVar(value=False)
        self.editor_wrap_var = tk.BooleanVar(value=True)
        self.preview_auto_load_var = tk.BooleanVar(value=False)
        self.status_var = tk.StringVar(value="準備中")
        self.preview_status_var = tk.StringVar(value="預覽尚未建立")
        self.chapter_filter_lookup = {}
        self.preview_photo = None
        self.preview_image_item = None
        self.preview_text_item = None
        self.preview_after_id = None
        self.right_split = None
        self.last_selected_id = ""

        self._build_ui()
        self.load_all()
        self.switch_mode("topics")

    def _is_practice_mode(self, mode: str | None = None):
        current = mode if mode is not None else self.mode
        return current in self.PRACTICE_MODES

    def _practice_mode_label(self, mode: str | None = None):
        current = mode if mode is not None else self.mode
        return {
            "practice_records": "練習本體",
        }.get(current, "無限練習")

    def _build_ui(self):
        style = ttk.Style()
        style.configure("Compact.TButton", padding=(5, 2))

        top = ttk.Frame(self.root, padding=8)
        top.pack(fill="x")
        filter_bar = ttk.Frame(top)
        filter_bar.pack(fill="x")
        filter_detail_bar = ttk.Frame(top)
        filter_detail_bar.pack(fill="x", pady=(6, 0))
        action_bar = ttk.Frame(top)
        action_bar.pack(fill="x", pady=(6, 0))

        self.chapter_btn = ttk.Button(filter_bar, text="章節代碼", style="Compact.TButton", command=lambda: self.switch_mode("chapter"))
        self.chapter_btn.pack(side="left", padx=(0, 4))
        self.overview_btn = ttk.Button(filter_bar, text="章節前言", style="Compact.TButton", command=lambda: self.switch_mode("overviews"))
        self.overview_btn.pack(side="left", padx=(0, 4))
        self.overview_body_btn = ttk.Button(filter_bar, text="章節正文", style="Compact.TButton", command=lambda: self.switch_mode("overview_bodies"))
        self.overview_body_btn.pack(side="left", padx=(0, 10))
        self.closing_btn = ttk.Button(filter_bar, text="章節後話", style="Compact.TButton", command=lambda: self.switch_mode("closings"))
        self.closing_btn.pack(side="left", padx=(0, 10))
        self.main_overview_btn = ttk.Button(filter_bar, text="主題整理", style="Compact.TButton", command=lambda: self.switch_mode("main_overviews"))
        self.main_overview_btn.pack(side="left", padx=(0, 10))
        self.practice_record_btn = ttk.Button(filter_bar, text="練習本體", style="Compact.TButton", command=lambda: self.switch_mode("practice_records"))
        self.practice_record_btn.pack(side="left", padx=(0, 4))
        self.topic_btn = ttk.Button(filter_bar, text="分支模式", style="Compact.TButton", command=lambda: self.switch_mode("topics"))
        self.topic_btn.pack(side="left", padx=(0, 10))
        self.question_btn = ttk.Button(filter_bar, text="題庫模式", style="Compact.TButton", command=lambda: self.switch_mode("questions"))
        self.question_btn.pack(side="left", padx=(0, 10))
        ttk.Label(filter_bar, text="關鍵字").pack(side="left")
        ttk.Entry(filter_bar, textvariable=self.keyword_var, width=24).pack(side="left", padx=(4, 10))
        ttk.Button(filter_bar, text="查詢", style="Compact.TButton", command=self.search).pack(side="left", padx=(0, 10))

        ttk.Label(filter_detail_bar, text="學層").pack(side="left")
        self.stage_combo = ttk.Combobox(filter_detail_bar, textvariable=self.stage_var, width=20, state="readonly")
        self.stage_combo.pack(side="left", padx=(4, 10))

        ttk.Label(filter_detail_bar, text="年級").pack(side="left")
        self.grade_combo = ttk.Combobox(filter_detail_bar, textvariable=self.grade_var, width=20, state="readonly")
        self.grade_combo.pack(side="left", padx=(4, 10))

        ttk.Label(filter_detail_bar, text="章節").pack(side="left")
        self.chapter_combo = ttk.Combobox(filter_detail_bar, textvariable=self.chapter_var, width=88, state="readonly")
        self.chapter_combo.pack(side="left", padx=(4, 10))

        ttk.Label(filter_detail_bar, text="難度").pack(side="left")
        self.difficulty_combo = ttk.Combobox(filter_detail_bar, textvariable=self.difficulty_var, width=20, state="readonly")
        self.difficulty_combo.pack(side="left", padx=(4, 0))

        ttk.Button(action_bar, text="新增範本", style="Compact.TButton", command=self.new_template).pack(side="left", padx=(0, 4))
        ttk.Button(action_bar, text="重載(讀檔)", style="Compact.TButton", command=self.load_all).pack(side="left", padx=4)
        ttk.Button(action_bar, text="批次匯入", style="Compact.TButton", command=self.batch_import).pack(side="left", padx=4)
        ttk.Checkbutton(action_bar, text="匯入時刪除", variable=self.import_delete_var).pack(side="left", padx=(2, 8))
        ttk.Checkbutton(action_bar, text="編輯器自動換行", variable=self.editor_wrap_var, command=self._apply_editor_wrap).pack(side="left", padx=(2, 8))
        ttk.Checkbutton(action_bar, text="換題自動預覽", variable=self.preview_auto_load_var).pack(side="left", padx=(2, 8))
        ttk.Button(action_bar, text="更新預覽", style="Compact.TButton", command=self.refresh_gui_preview).pack(side="left", padx=4)
        ttk.Button(action_bar, text="儲存（新增/更新）", style="Compact.TButton", command=self.save_item).pack(side="left", padx=4)
        ttk.Button(action_bar, text="刪除選取", style="Compact.TButton", command=self.delete_selected).pack(side="left", padx=4)
        ttk.Button(action_bar, text="匯出PDF", style="Compact.TButton", command=self.export_selected_pdf).pack(side="left", padx=4)
        ttk.Button(action_bar, text="主題串PDF", style="Compact.TButton", command=self.open_theme_chain_export_dialog).pack(side="left", padx=4)
        ttk.Button(action_bar, text="自訂主題串", style="Compact.TButton", command=self.open_custom_theme_dialog).pack(side="left", padx=4)

        ttk.Button(action_bar, text="題目指派", style="Compact.TButton", command=self.open_question_assignment_dialog).pack(side="left", padx=4)
        ttk.Button(action_bar, text="改分類/難度", style="Compact.TButton", command=self.open_question_meta_edit_dialog).pack(side="left", padx=4)
        ttk.Button(action_bar, text="工具箱", style="Compact.TButton", command=self.open_ops_toolbox).pack(side="right")

        self.right_split = ttk.Panedwindow(self.root, orient=tk.VERTICAL)
        self.right_split.pack(fill="both", expand=True, padx=8, pady=(0, 8))
        top_frame = ttk.Frame(self.right_split)
        preview_frame = ttk.Frame(self.right_split)
        self.right_split.add(top_frame, weight=3)
        self.right_split.add(preview_frame, weight=2)

        main = ttk.Panedwindow(top_frame, orient=tk.HORIZONTAL)
        main.pack(fill="both", expand=True)
        left = ttk.Frame(main)
        right = ttk.Frame(main)
        main.add(left, weight=1)
        main.add(right, weight=2)

        self.tree = ttk.Treeview(
            left,
            columns=("id", "title", "stage", "grade", "chapter", "difficulty"),
            show="headings",
            selectmode="extended",
            height=24,
        )
        for c, w in [("id", 230), ("title", 220), ("stage", 70), ("grade", 70), ("chapter", 170), ("difficulty", 80)]:
            self.tree.heading(c, text=c)
            self.tree.column(c, width=w, anchor="w")
        self.tree.pack(fill="both", expand=True, side="left")
        self.tree.bind("<<TreeviewSelect>>", self.on_select)

        ys = ttk.Scrollbar(left, orient="vertical", command=self.tree.yview)
        ys.pack(side="right", fill="y")
        self.tree.configure(yscrollcommand=ys.set)

        editor_header = ttk.Frame(right)
        editor_header.pack(fill="x")
        ttk.Label(editor_header, text="JSON 編輯器", padding=(0, 0, 0, 4)).pack(side="left", anchor="w")
        ttk.Button(editor_header, text="預覽大", style="Compact.TButton", command=lambda: self._set_preview_pane_ratio(0.38)).pack(side="right", padx=(4, 0))
        ttk.Button(editor_header, text="平均", style="Compact.TButton", command=lambda: self._set_preview_pane_ratio(0.50)).pack(side="right", padx=(4, 0))
        ttk.Button(editor_header, text="編輯大", style="Compact.TButton", command=lambda: self._set_preview_pane_ratio(0.68)).pack(side="right", padx=(4, 0))
        ttk.Label(editor_header, textvariable=self.preview_status_var, foreground="#666").pack(side="right", anchor="e")

        editor_frame = ttk.Frame(right)
        editor_frame.pack(fill="both", expand=True)

        self.editor = tk.Text(editor_frame, wrap="word", font=("Consolas", 11))
        self.editor.pack(fill="both", expand=True, side="left")
        eys = ttk.Scrollbar(editor_frame, orient="vertical", command=self.editor.yview)
        eys.pack(side="right", fill="y")
        self.editor.configure(yscrollcommand=eys.set)

        ttk.Label(preview_frame, text="GUI 預覽（含 TeX 效果）", padding=(0, 4, 0, 4)).pack(anchor="w")
        preview_body = ttk.Frame(preview_frame)
        preview_body.pack(fill="both", expand=True)
        self.preview_canvas = tk.Canvas(preview_body, background="#f7f4ee", highlightthickness=1, highlightbackground="#ddd7ca")
        self.preview_canvas.pack(fill="both", expand=True, side="left")
        pys = ttk.Scrollbar(preview_body, orient="vertical", command=self.preview_canvas.yview)
        pys.pack(side="right", fill="y")
        pxs = ttk.Scrollbar(preview_frame, orient="horizontal", command=self.preview_canvas.xview)
        pxs.pack(fill="x", side="bottom")
        self.preview_canvas.configure(yscrollcommand=pys.set, xscrollcommand=pxs.set)
        self.preview_text_item = self.preview_canvas.create_text(
            16, 16, anchor="nw", text="選取一筆資料後，這裡會顯示 GUI 預覽。", fill="#555", width=1100
        )
        self._apply_editor_wrap()
        self.root.after(150, lambda: self._set_preview_pane_ratio(0.38))

        status = ttk.Label(self.root, textvariable=self.status_var, relief="sunken", anchor="w", padding=6)
        status.pack(fill="x", side="bottom")

        self.stage_combo.bind("<<ComboboxSelected>>", lambda _e: self._on_stage_changed())
        self.grade_combo.bind("<<ComboboxSelected>>", lambda _e: self._on_grade_changed())
        self.chapter_combo.bind("<<ComboboxSelected>>", lambda _e: self.search())
        self.difficulty_combo.bind("<<ComboboxSelected>>", lambda _e: self.search())

    # ----- data helpers -----
    def _current_payload(self):
        if self.mode == "topics":
            return self.topic_payload
        if self.mode == "questions":
            return self.question_payload
        if self.mode == "overviews":
            return self.overview_payload
        if self.mode == "overview_bodies":
            return self.overview_body_payload
        if self.mode == "main_overviews":
            return self.main_overview_payload
        if self.mode == "closings":
            return self.closing_payload
        if self._is_practice_mode():
            return self.practice_payload
        return self.chapter_payload

    def _current_key(self):
        if self.mode == "topics":
            return "topics"
        if self.mode == "questions":
            return "questions"
        if self.mode == "overviews":
            return "overviews"
        if self.mode == "overview_bodies":
            return "bodies"
        if self.mode == "main_overviews":
            return "byId"
        if self.mode == "closings":
            return "closings"
        if self._is_practice_mode():
            return "practices"
        return "catalog"

    def _current_db_kind(self):
        if self._is_practice_mode():
            return "practices"
        return self.mode

    def _set_preview_pane_ratio(self, top_ratio: float):
        if not self.right_split:
            return
        try:
            total = self.right_split.winfo_height()
            if total <= 1:
                self.root.after(120, lambda: self._set_preview_pane_ratio(top_ratio))
                return
            top_ratio = max(0.20, min(0.80, float(top_ratio)))
            self.right_split.sashpos(0, int(total * top_ratio))
        except Exception:
            pass

    def _current_db_path(self):
        return resolve_db_path(self._current_db_kind())

    def _write_db_payload(self, kind: str, payload: dict):
        path = resolve_db_path(kind)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        if kind == "topics":
            sync_legacy_js_from_db(path)
        elif kind == "questions":
            sync_question_js_from_db(path)
        elif kind == "chapter":
            sync_extra_web_from_db()
        elif kind in {"overviews", "overview_bodies", "main_overviews", "closings"}:
            sync_extra_web_from_db()
        elif kind == "practices":
            sync_practice_assignment_js_from_db(path)

    def _write_current_db(self):
        self._write_db_payload(self._current_db_kind(), self._current_payload())

    def load_all(self):
        for kind in ["topics", "questions", "chapter", "overviews", "overview_bodies", "main_overviews", "closings", "practices"]:
            path = resolve_db_path(kind)
            if not path.exists():
                if kind == "topics":
                    self.topic_payload = {"meta": {"count": 0}, "topics": []}
                elif kind == "questions":
                    self.question_payload = {"meta": {"count": 0}, "questions": []}
                elif kind == "overviews":
                    self.overview_payload = {"meta": {"count": 0}, "overviews": {}}
                elif kind == "overview_bodies":
                    self.overview_body_payload = {"meta": {"count": 0}, "bodies": {}}
                elif kind == "main_overviews":
                    self.main_overview_payload = {"meta": {"count": 0}, "byId": {}}
                elif kind == "closings":
                    self.closing_payload = {"meta": {"count": 0}, "closings": {}}
                elif kind == "practices":
                    self.practice_payload = {"meta": {"count": 0}, "assignments": [], "practices": [], "bindings": []}
                else:
                    self.chapter_payload = {"meta": {"count": 0}, "catalog": {}}
                continue
            if kind == "practices":
                payload = load_practice_payload(path)
            else:
                payload = json.loads(path.read_text(encoding="utf-8-sig"))
            if kind == "topics":
                self.topic_payload = payload if isinstance(payload.get("topics", []), list) else {"meta": {}, "topics": []}
            elif kind == "questions":
                self.question_payload = payload if isinstance(payload.get("questions", []), list) else {"meta": {}, "questions": []}
            elif kind == "overviews":
                self.overview_payload = payload if isinstance(payload.get("overviews", {}), dict) else {"meta": {}, "overviews": {}}
            elif kind == "overview_bodies":
                self.overview_body_payload = payload if isinstance(payload.get("bodies", {}), dict) else {"meta": {}, "bodies": {}}
            elif kind == "main_overviews":
                self.main_overview_payload = payload if isinstance(payload.get("byId", {}), dict) else {"meta": {}, "byId": {}}
            elif kind == "closings":
                self.closing_payload = payload if isinstance(payload.get("closings", {}), dict) else {"meta": {}, "closings": {}}
            elif kind == "practices":
                self.practice_payload = (
                    payload
                    if isinstance(payload.get("assignments", []), list)
                    else {"meta": {}, "assignments": [], "practices": [], "bindings": []}
                )
            else:
                self.chapter_payload = payload if isinstance(payload.get("catalog", {}), dict) else {"meta": {}, "catalog": {}}

        self.refresh_filters()
        self.search()

    # ----- mode / filter -----
    def switch_mode(self, mode: str):
        self.mode = mode
        if mode in {"chapter", "overviews", "overview_bodies", "main_overviews", "closings"}:
            self.keyword_var.set("")
            self.stage_var.set(ALL)
            self.grade_var.set(ALL)
            self.chapter_var.set(ALL)
            self.difficulty_var.set(ALL)
        self.topic_btn.state(["!disabled"] if mode != "topics" else ["disabled"])
        self.question_btn.state(["!disabled"] if mode != "questions" else ["disabled"])
        self.chapter_btn.state(["!disabled"] if mode != "chapter" else ["disabled"])
        self.overview_btn.state(["!disabled"] if mode != "overviews" else ["disabled"])
        self.overview_body_btn.state(["!disabled"] if mode != "overview_bodies" else ["disabled"])
        self.main_overview_btn.state(["!disabled"] if mode != "main_overviews" else ["disabled"])
        self.closing_btn.state(["!disabled"] if mode != "closings" else ["disabled"])
        self.practice_record_btn.state(["!disabled"] if mode != "practice_records" else ["disabled"])
        mode_label = {
            "topics": "分支",
            "questions": "題庫",
            "chapter": "章節代碼",
            "overviews": "章節前言",
            "overview_bodies": "章節正文",
            "main_overviews": "主題整理",
            "closings": "章節後話",
            "practice_records": "練習本體",
        }.get(mode, mode)
        if self._is_practice_mode(mode):
            counts = self._practice_inventory_counts()
            self.status_var.set(
                f"目前模式：{mode_label}｜practice {counts['practice_count']} 筆"
            )
        else:
            self.status_var.set(f"目前模式：{mode_label}")
        self.refresh_filters()
        self.search()

    def _all_rows(self):
        payload = self._current_payload()
        if self.mode in {"topics", "questions"}:
            return payload.get(self._current_key(), [])
        if self.mode == "practice_records":
            return [row for row in self._practice_rows() if str(row.get("kind", "")).strip() == "practice"]
        if self.mode == "chapter":
            rows = []
            for code, v in payload.get("catalog", {}).items():
                row = {"id": code}
                if isinstance(v, dict):
                    row.update(v)
                row.setdefault("title", row.get("section") or row.get("chapter") or code)
                row.setdefault("chapter", row.get("chapter", ""))
                rows.append(row)
            return rows
        if self.mode == "overviews":
            rows = []
            for code, overview in payload.get("overviews", {}).items():
                row = {"id": code}
                if isinstance(overview, dict):
                    row.update(overview)
                meta = self._chapter_catalog().get(code, {})
                if isinstance(meta, dict):
                    row.setdefault("chapter", row.get("chapter") or meta.get("section") or meta.get("chapter") or code)
                    row.setdefault("section", meta.get("section", ""))
                    row.setdefault("domainMain", meta.get("domainMain", ""))
                    row.setdefault("domainSub", meta.get("domainSub", ""))
                row.setdefault("title", row.get("title") or "章節重點大綱")
                rows.append(row)
            return rows
        if self.mode == "overview_bodies":
            rows = []
            for code, body in payload.get("bodies", {}).items():
                row = {"id": code}
                if isinstance(body, dict):
                    row.update(body)
                meta = self._chapter_catalog().get(code, {})
                if isinstance(meta, dict):
                    row.setdefault("chapter", row.get("chapter") or meta.get("section") or meta.get("chapter") or code)
                    row.setdefault("section", meta.get("section", ""))
                    row.setdefault("domainMain", meta.get("domainMain", ""))
                    row.setdefault("domainSub", meta.get("domainSub", ""))
                row.setdefault("title", row.get("title") or "章節正文")
                rows.append(row)
            return rows
        if self.mode == "main_overviews":
            rows = []
            topic_lookup = self._topic_lookup()
            for topic_id, overview in payload.get("byId", {}).items():
                row = {"id": topic_id}
                if isinstance(overview, dict):
                    row.update(overview)
                topic_meta = topic_lookup.get(topic_id, {})
                if isinstance(topic_meta, dict):
                    row.setdefault("stage", topic_meta.get("stage", ""))
                    row.setdefault("grade", topic_meta.get("grade", ""))
                    row.setdefault("term", topic_meta.get("term", ""))
                    row.setdefault("chapter", topic_meta.get("chapter", ""))
                    row.setdefault("chapter_code", topic_meta.get("chapterCode") or topic_meta.get("chapter_code") or "")
                    row.setdefault("difficulty", topic_meta.get("difficulty", ""))
                    row.setdefault("domain", topic_meta.get("domain", ""))
                row.setdefault("title", row.get("title") or (topic_meta.get("title") if isinstance(topic_meta, dict) else "") or "主題整理")
                rows.append(row)
            return rows
        if self.mode == "closings":
            rows = []
            for code, closing in payload.get("closings", {}).items():
                row = {"id": code}
                if isinstance(closing, dict):
                    row.update(closing)
                meta = self._chapter_catalog().get(code, {})
                if isinstance(meta, dict):
                    row.setdefault("chapter", row.get("chapter") or meta.get("section") or meta.get("chapter") or code)
                    row.setdefault("section", meta.get("section", ""))
                    row.setdefault("domainMain", meta.get("domainMain", ""))
                    row.setdefault("domainSub", meta.get("domainSub", ""))
                row.setdefault("title", row.get("title") or "章節後話")
                rows.append(row)
            return rows
        return []

    def _chapter_catalog(self):
        catalog = self.chapter_payload.get("catalog", {}) if isinstance(self.chapter_payload, dict) else {}
        return catalog if isinstance(catalog, dict) else {}

    def _topic_lookup(self):
        topics = self.topic_payload.get("topics", []) if isinstance(self.topic_payload, dict) else []
        return {
            str(item.get("id", "")).strip(): item
            for item in topics
            if isinstance(item, dict) and str(item.get("id", "")).strip()
        }

    def _legacy_practice_catalog(self):
        if self._legacy_practice_catalog_cache is None:
            try:
                self._legacy_practice_catalog_cache = extract_legacy_practice_catalog(LEGACY_PRACTICE_JS_PATH)
            except Exception:
                self._legacy_practice_catalog_cache = {}
        return self._legacy_practice_catalog_cache

    def _practice_record_lookup(self):
        rows = self.practice_payload.get("practices", []) if isinstance(self.practice_payload, dict) else []
        lookup = {}
        for row in rows if isinstance(rows, list) else []:
            if not isinstance(row, dict):
                continue
            rid = str(row.get("id", "")).strip()
            if rid:
                lookup[rid] = normalize_practice_record(row)
        return lookup

    def _practice_bindings(self):
        rows = self.practice_payload.get("bindings", []) if isinstance(self.practice_payload, dict) else []
        normalized = []
        for row in rows if isinstance(rows, list) else []:
            if not isinstance(row, dict):
                continue
            binding = normalize_practice_binding(row)
            if binding["practiceId"] and binding["targetType"] and binding["targetId"]:
                normalized.append(binding)
        return normalized

    def _practice_binding_row_id(self, binding: dict):
        return (
            f"binding:{binding.get('practiceId', '')}:"
            f"{binding.get('targetType', '')}:{binding.get('targetId', '')}"
        )

    def _normalize_practice_payload_state(self):
        self.practice_payload = normalize_practice_payload(self.practice_payload)
        return self.practice_payload

    def _practice_inventory_counts(self):
        topic_lookup = self._topic_lookup()
        catalog = self._legacy_practice_catalog()
        legacy_direct_ids = {pid for pid in catalog if pid in topic_lookup}
        practice_ids = {
            str(row.get("id", "")).strip()
            for row in self.practice_payload.get("practices", [])
            if isinstance(row, dict)
        }
        bound_practice_ids = {
            str(row.get("practiceId", "")).strip()
            for row in self.practice_payload.get("bindings", [])
            if isinstance(row, dict)
            and bool(row.get("enabled", True))
            and str(row.get("targetType", "")).strip().lower() == "chapter"
            and str(row.get("practiceId", "")).strip()
        }
        migrated_legacy_count = sum(
            1 for topic_id in legacy_direct_ids
            if f"practice-{topic_id}" in practice_ids
        )
        return {
            "legacy_direct": len(legacy_direct_ids),
            "practice_count": len(self.practice_payload.get("practices", []) if isinstance(self.practice_payload, dict) else []),
            "binding_count": len(self.practice_payload.get("bindings", []) if isinstance(self.practice_payload, dict) else []),
            "legacy_migrated_to_library": migrated_legacy_count,
            "bound_practice_count": len(bound_practice_ids),
            "unbound_practice_count": len(practice_ids - bound_practice_ids),
        }

    def _build_practice_preview_item(self, source: dict):
        if not isinstance(source, dict):
            return {}
        chapter_code = str(source.get("chapterCode", "") or source.get("chapter_code", "")).strip()
        chapter_meta = self._chapter_catalog().get(chapter_code, {})
        chapter_title = (
            str(source.get("chapter", "")).strip()
            or (str(chapter_meta.get("section", "")).strip() if isinstance(chapter_meta, dict) else "")
            or chapter_code
        )
        resolved_stage, resolved_grade, resolved_term = resolve_practice_stage_grade_term(source)
        resolved_grade_label = build_grade_label(resolved_stage, resolved_grade, resolved_term)
        return {
            "id": str(source.get("id", "")).strip(),
            "title": str(source.get("title", "")).strip() or "無限練習",
            "stage": resolved_stage,
            "grade": resolved_grade_label,
            "term": resolved_term,
            "gradeLabel": resolved_grade_label,
            "chapter": chapter_title,
            "chapterCode": chapter_code,
            "domain": str(source.get("domain", "")).strip() or "無限練習",
            "difficulty": str(source.get("difficulty", "")).strip(),
            "contentTypes": ["無限練習"],
            "tags": list(source.get("tags", []) or []),
            "usage": list(source.get("usage", []) or []),
            "examples": list(source.get("examples", []) or []),
            "tips": list(source.get("tips", []) or []),
            "notes": list(source.get("notes", []) or []),
            "mistakes": list(source.get("mistakes", []) or []),
        }

    def _practice_rows(self):
        # 章節綁定（bindings）已移除：practice 直接以 chapterCode 歸屬章節，
        # 不再顯示掛載狀態，也不再輸出 binding 列。
        practice_lookup = self._practice_record_lookup()
        rows = []

        for rid, practice in practice_lookup.items():
            base_chapter = str(practice.get("chapter", "") or self._chapter_label(practice.get("chapterCode", "")))
            binding_count = 0
            binding_summary = ""
            display_title = str(practice.get("title", "") or rid)
            row_stage, row_grade, row_term = resolve_practice_stage_grade_term(practice)
            row = {
                "id": rid,
                "kind": "practice",
                "title": display_title,
                "topicTitle": "",
                "stage": row_stage,
                "grade": build_grade_label(row_stage, row_grade, row_term),
                "chapter": base_chapter,
                "chapter_code": str(practice.get("chapterCode", "") or ""),
                "difficulty": str(practice.get("difficulty", "") or ""),
                "practice_mode": str(practice.get("mode", "") or "generator"),
                "practiceKey": str(practice.get("generatorKey", "") or ""),
                "enabled": practice.get("enabled", True),
                "questionCount": int(practice.get("questionCount", 0) or 0),
                "practiceTitle": str(practice.get("title", "") or ""),
                "bindingTarget": binding_summary,
                "targetType": "",
                "targetId": "",
                "bindingCount": binding_count,
                "bindingSummary": binding_summary,
                "isUnbound": False,
                "dbRecord": {"kind": "practice", **practice},
                "notes": "；".join(practice.get("notes", []) or []),
                "previewItem": self._build_practice_preview_item(practice),
            }
            if practice.get("mode") == "fixed-example":
                row["prompt"] = practice.get("prompt", "")
                row["answer"] = practice.get("answer", "")
            rows.append(row)

        return rows

    def _chapter_label(self, code: str, meta: dict | None = None):
        code = str(code or "").strip()
        meta = meta if isinstance(meta, dict) else self._chapter_catalog().get(code, {})
        name = ""
        if isinstance(meta, dict):
            name = str(meta.get("section") or meta.get("chapter") or "").strip()
        return f"{code} {name}".strip() if code else name

    def _chapter_filter_tokens(self, display: str):
        if display == ALL:
            return {"display": ALL, "code": "", "names": set()}
        return self.chapter_filter_lookup.get(display, {"display": display, "code": "", "names": {display}})

    def _is_parent_chapter_code(self, code: str):
        text = str(code or "").strip().lower()
        if not text:
            return False
        if text.startswith("b-"):
            return False
        parts = text.split("-")
        return len(parts) <= 2 and bool(re.match(r"^[js]\d$", parts[0] or ""))

    def _code_family(self, code: str):
        text = str(code or "").strip()
        if not text:
            return ""
        lower = text.lower()
        if lower.startswith("b-"):
            return lower
        parts = lower.split("-")
        if len(parts) < 2:
            return lower
        return f"{parts[0]}-{parts[1]}"

    def _chapter_matches(self, row: dict, chapter_filter: str):
        tokens = self._chapter_filter_tokens(chapter_filter)
        code = str(tokens.get("code", "")).strip()
        row_code = str(row.get("chapter_code", "") or row.get("chapterCode", "")).strip()
        if code:
            if row_code == code:
                return True
            if row_code and self._is_parent_chapter_code(code) and self._code_family(row_code) == self._code_family(code):
                return True
            return False
        return False

    def _chapter_label_sort_key(self, display: str):
        code = self._chapter_code_from_selection(display)
        return (*self._chapter_code_sort_key(code), display)

    def _chapter_code_sort_key(self, code: str):
        # Stage order must go from small to large: 國小(e) -> 國中(j) -> 高中(s) -> 數B(b).
        lower = str(code or "").strip().lower()
        m = re.match(r"^([ejs])(\d+)(?:-(\d+))?(?:-(\d+))?(?:-(\d+))?$", lower)
        if m:
            prefix_order = {"e": 0, "j": 1, "s": 2}.get(m.group(1), 9)
            nums = [int(part) if part else -1 for part in m.groups()[1:]]
            return (prefix_order, *nums)
        if lower.startswith("b-"):
            try:
                return (3, int(lower.split("-", 1)[1]), -1, -1, -1)
            except ValueError:
                return (3, 999, -1, -1, -1)
        return (9, 999, 999, 999, 999)

    def _search_text(self, *parts):
        tokens: list[str] = []

        def _append_part(value):
            if value is None:
                return
            if isinstance(value, (list, tuple, set)):
                for item in value:
                    _append_part(item)
                return
            if isinstance(value, dict):
                tokens.append(json.dumps(value, ensure_ascii=False))
                return
            tokens.append(str(value))

        for part in parts:
            _append_part(part)
        return " ".join(token for token in tokens if token).lower()

    def _row_sort_key(self, row: dict):
        if self.mode in {"chapter", "overviews", "overview_bodies", "main_overviews", "closings"}:
            code = str(row.get("chapter_code", "") or row.get("chapterCode", "") or row.get("id", "")).strip()
            return (
                *self._chapter_code_sort_key(code),
                str(row.get("title", "")),
                str(row.get("id", "")),
            )
        if self._is_practice_mode():
            code = str(row.get("chapter_code", "") or row.get("chapterCode", "")).strip()
            return (
                str(row.get("kind", "")),
                *self._chapter_code_sort_key(code),
                str(row.get("title", "")),
                str(row.get("id", "")),
            )
        if self.mode == "questions":
            code = str(row.get("chapter_code", "") or row.get("chapterCode", "")).strip()
            source_order = row.get("source_order", "")
            try:
                source_rank = int(source_order)
            except (TypeError, ValueError):
                source_rank = 10**9
            return (
                *self._chapter_code_sort_key(code),
                source_rank,
                str(row.get("id", "")),
                str(row.get("title", "")),
            )
        return (
            str(row.get("stage", "")),
            str(row.get("grade", "")),
            str(row.get("chapter", "")),
            str(row.get("title", "")),
            str(row.get("id", "")),
        )

    def _build_chapter_filter_values(self, rows=None):
        catalog = self._chapter_catalog()
        lookup = {}
        values = []
        seen = set()

        def add_option(display, code="", names=None):
            display = str(display or "").strip()
            if not display or display in seen:
                return
            seen.add(display)
            values.append(display)
            lookup[display] = {
                "display": display,
                "code": str(code or "").strip(),
                "names": {str(v).strip() for v in (names or []) if str(v).strip()},
            }

        # For the 無限練習 screens (practice records / bindings / legacy), only offer
        # chapters that actually have a matching row here. Listing every chapter in the
        # whole curriculum catalog (regardless of whether it has any practice content)
        # made the dropdown huge and full of choices that return zero results when picked.
        restrict_to_rows = self.mode == "practice_records"

        if not restrict_to_rows:
            for code, meta in catalog.items():
                if not isinstance(meta, dict):
                    meta = {}
                add_option(
                    self._chapter_label(code, meta),
                    code,
                    [code, meta.get("chapter", ""), meta.get("section", "")],
                )

        if rows:
            for row in rows:
                row_chapter = str(row.get("chapter", "")).strip()
                row_code = str(row.get("chapter_code", "") or row.get("chapterCode", "")).strip()
                if not row_code and not row_chapter:
                    continue
                if row_code and row_code in catalog:
                    meta = catalog.get(row_code) or {}
                    if not isinstance(meta, dict):
                        meta = {}
                    add_option(
                        self._chapter_label(row_code, meta),
                        row_code,
                        [row_code, row_chapter, meta.get("chapter", ""), meta.get("section", "")],
                    )
                elif row_code:
                    add_option(row_code, row_code, [row_code, row_chapter])
                elif row_chapter and not any(row_chapter in data.get("names", set()) for data in lookup.values()):
                    add_option(row_chapter, "", [row_chapter])

        values.sort(key=self._chapter_label_sort_key)

        self.chapter_filter_lookup = lookup
        return [ALL] + values

    def _stage_grade_filtered_rows(self, rows=None):
        """Rows narrowed by the currently selected 學層/年級, used to decide which
        chapters are worth offering in the chapter dropdown."""
        rows = self._all_rows() if rows is None else rows
        stage = "" if self.stage_var.get() == ALL else self.stage_var.get().strip()
        grade = "" if self.grade_var.get() == ALL else self.grade_var.get().strip()
        if not stage and not grade:
            return rows
        return [
            r for r in rows
            if (not stage or r.get("stage") == stage) and (not grade or r.get("grade") == grade)
        ]

    def refresh_filters(self):
        rows = self._all_rows()
        stages = sorted({r.get("stage", "") for r in rows if r.get("stage")}, key=_stage_sort_key)
        grades = sorted({r.get("grade", "") for r in rows if r.get("grade")}, key=_grade_label_sort_key)
        chapters = self._build_chapter_filter_values(self._stage_grade_filtered_rows(rows))
        diffs = sorted({r.get("difficulty", "") for r in rows if r.get("difficulty")})

        self.stage_combo["values"] = [ALL] + stages
        self.grade_combo["values"] = [ALL] + grades
        self.chapter_combo["values"] = chapters
        self.difficulty_combo["values"] = [ALL] + diffs

        for var, combo in [
            (self.stage_var, self.stage_combo),
            (self.grade_var, self.grade_combo),
            (self.chapter_var, self.chapter_combo),
            (self.difficulty_var, self.difficulty_combo),
        ]:
            if var.get() not in combo["values"]:
                var.set(ALL)

    def _on_stage_changed(self):
        rows = self._all_rows()
        stage = self.stage_var.get()
        if stage == ALL:
            stage = ""
        grades = sorted(
            {r.get("grade", "") for r in rows if r.get("grade") and (not stage or r.get("stage") == stage)},
            key=_grade_label_sort_key,
        )
        self.grade_combo["values"] = [ALL] + grades
        if self.grade_var.get() not in self.grade_combo["values"]:
            self.grade_var.set(ALL)
        self._on_grade_changed()
        self.search()

    def _on_grade_changed(self):
        self.chapter_combo["values"] = self._build_chapter_filter_values(self._stage_grade_filtered_rows())
        if self.chapter_var.get() not in self.chapter_combo["values"]:
            self.chapter_var.set(ALL)
        self.search()

    # ----- list / editor -----
    def search(self, preserve_selected_id: str | None = None):
        rows = self._all_rows()
        q = self.keyword_var.get().strip().lower()
        stage = "" if self.stage_var.get() == ALL else self.stage_var.get().strip()
        grade = "" if self.grade_var.get() == ALL else self.grade_var.get().strip()
        chapter = "" if self.chapter_var.get() == ALL else self.chapter_var.get().strip()
        diff = "" if self.difficulty_var.get() == ALL else self.difficulty_var.get().strip()
        unbound_only = bool(self.practice_unbound_only_var.get()) if self.mode == "practice_records" else False

        self.filtered = []
        for r in rows:
            if stage and r.get("stage") != stage:
                continue
            if grade and r.get("grade") != grade:
                continue
            if chapter and not self._chapter_matches(r, chapter):
                continue
            if diff and r.get("difficulty") != diff:
                continue
            if unbound_only and not bool(r.get("isUnbound", False)):
                continue
            if q:
                blob_parts = [r.get("id", ""), r.get("title", ""), r.get("chapter", "")]
                if self.mode == "topics":
                    blob_parts += r.get("tags", []) or []
                    blob_parts += r.get("usage", []) or []
                elif self.mode == "questions":
                    blob_parts += [
                        r.get("question_text", ""),
                        r.get("answer_text", ""),
                        r.get("explanation_text", ""),
                        r.get("chapter_code", ""),
                        r.get("formula_id", ""),
                        r.get("question_category", ""),
                        r.get("source_type", ""),
                        r.get("source_ref", ""),
                        r.get("target_level", ""),
                        r.get("target_id", ""),
                        r.get("target_title", ""),
                    ]
                    blob_parts += r.get("tags", []) or []
                elif self.mode == "overviews":
                    blob_parts += [
                        r.get("groupName", ""),
                        r.get("updatedAt", ""),
                        json.dumps(r.get("variants", []), ensure_ascii=False),
                    ]
                elif self.mode == "overview_bodies":
                    blob_parts += [
                        r.get("groupName", ""),
                        r.get("updatedAt", ""),
                        json.dumps(r.get("variants", []), ensure_ascii=False),
                    ]
                elif self.mode == "main_overviews":
                    blob_parts += [
                        r.get("updatedAt", ""),
                        r.get("chapter_code", ""),
                        r.get("domain", ""),
                        json.dumps(r.get("variants", []), ensure_ascii=False),
                    ]
                elif self.mode == "closings":
                    blob_parts += [
                        r.get("groupName", ""),
                        r.get("updatedAt", ""),
                        json.dumps(r.get("variants", []), ensure_ascii=False),
                    ]
                elif self._is_practice_mode():
                    blob_parts += [
                        r.get("kind", ""),
                        r.get("topicTitle", ""),
                        r.get("practice_mode", ""),
                        r.get("practiceKey", ""),
                        r.get("practiceTitle", ""),
                        r.get("bindingTarget", ""),
                        r.get("bindingSummary", ""),
                        r.get("targetType", ""),
                        r.get("targetId", ""),
                        r.get("questionCount", ""),
                        r.get("notes", ""),
                    ]
                else:
                    blob_parts += [r.get("section", ""), r.get("domainMain", ""), r.get("domainSub", "")]
                blob = self._search_text(blob_parts)
                if q not in blob:
                    continue
            self.filtered.append(r)

        self.filtered.sort(key=self._row_sort_key)
        target_id = preserve_selected_id if preserve_selected_id is not None else self.last_selected_id
        self.refresh_tree(preserve_selected_id=target_id)
        label = {
            "topics": "分支",
            "questions": "題庫",
            "chapter": "章節代碼",
            "overviews": "章節前言",
            "overview_bodies": "章節正文",
            "main_overviews": "主題整理",
            "closings": "章節後話",
            "practice_records": "練習本體",
        }.get(self.mode, self.mode)
        if self._is_practice_mode():
            counts = self._practice_inventory_counts()
            self.status_var.set(
                f"{label} 查詢結果：{len(self.filtered)} 筆｜practice {counts['practice_count']} 筆"
            )
        else:
            self.status_var.set(f"{label} 查詢結果：{len(self.filtered)} 筆")

    def refresh_tree(self, preserve_selected_id: str | None = None):
        for iid in self.tree.get_children():
            self.tree.delete(iid)
        restore_iid = None
        for idx, item in enumerate(self.filtered):
            title = item.get("title", "")
            if self.mode == "questions":
                title = clean_question_title(title)
            self.tree.insert("", "end", iid=str(idx), values=(
                item.get("id", ""),
                title,
                item.get("stage", ""),
                item.get("grade", ""),
                item.get("chapter", ""),
                item.get("difficulty", ""),
            ))
            if preserve_selected_id and str(item.get("id", "")).strip() == str(preserve_selected_id).strip():
                restore_iid = str(idx)
        if restore_iid is not None:
            self.tree.selection_set(restore_iid)
            self.tree.focus(restore_iid)
            self.tree.see(restore_iid)

    def on_select(self, _event=None):
        selected = self.tree.selection()
        if not selected:
            return
        idx = int(selected[0])
        item = self.filtered[idx]
        self.last_selected_id = str(item.get("id", "")).strip()
        self.editor.delete("1.0", "end")
        editor_obj = item
        if self._is_practice_mode():
            editor_obj = item.get("dbRecord") or {
                "kind": "practice",
                "id": item.get("id", ""),
                "enabled": item.get("enabled", True),
                "mode": item.get("practice_mode", "") or "generator",
                "generatorKey": item.get("practiceKey", ""),
                "title": item.get("practiceTitle", ""),
                "difficulty": item.get("difficulty", ""),
                "questionCount": item.get("questionCount", 0),
                "chapterCode": item.get("chapter_code", ""),
                "chapter": item.get("chapter", ""),
                "prompt": item.get("prompt", ""),
                "answer": item.get("answer", ""),
                "tags": [],
                "usage": [],
                "examples": [],
                "tips": [],
                "notes": [],
                "mistakes": [],
            }
        self.editor.insert("1.0", json.dumps(editor_obj, ensure_ascii=False, indent=2))
        self.status_var.set(f"已選取：{item.get('id')}")
        if self.preview_auto_load_var.get():
            self._schedule_preview_refresh(10)

    # ----- actions -----
    def new_template(self):
        if self.mode == "topics":
            obj = {
                "id": "new-topic-id", "title": "新主題", "stage": "", "grade": "", "term": "", "chapter": "", "domain": "",
                "difficulty": "", "chapterRole": "", "parentId": "", "formula": {"type": "text", "lines": []},
                "contentTypes": [], "tags": [], "usage": [], "examples": [], "tips": [], "notes": [], "mistakes": []
            }
        elif self.mode == "questions":
            obj = {
                "id": "new-question-id", "title": "新題目", "question_text": "", "answer_text": "", "explanation_text": "",
                "stage": "", "grade": "", "chapter": "", "chapter_code": "", "formula_id": "", "question_category": "",
                "difficulty": "", "source_type": "manual", "source_ref": "",
                "tags": []
            }
        elif self.mode == "practice_records":
            obj = {
                "kind": "practice",
                "id": "practice-new-id",
                "enabled": True,
                "mode": "generator",
                "title": "新無限練習",
                "generatorKey": "generator-key",
                "difficulty": "",
                "questionCount": 5,
                "chapterCode": "",
                "stage": "",
                "grade": "",
                "term": "",
                "chapter": "",
                "domain": "",
                "prompt": "",
                "answer": "",
                "tags": [],
                "usage": [],
                "examples": [],
                "tips": [],
                "notes": [],
                "mistakes": [],
                "_help": [
                    "kind 填 practice。",
                    "practice：管理可重複使用的無限練習本體。"
                ]
            }
        elif self.mode == "chapter":
            obj = {
                "id": "new-code",
                "title": "新章節",
                "chapter": "新章節",
                "section": "新小節",
                "domainMain": "",
                "domainSub": "",
            }
        elif self.mode == "overviews":
            obj = {
                "id": "s4-4-2",
                "title": "章節重點大綱",
                "groupName": "高中・高二下・矩陣的運算",
                "updatedAt": datetime.now().isoformat(timespec="seconds"),
                "variants": [
                    {
                        "id": "editable",
                        "label": "可修改版",
                        "sections": [
                            {
                                "type": "paragraph",
                                "text": "先寫這個章節最重要的幾句話。"
                            },
                            {
                                "type": "table",
                                "headers": ["主題", "核心觀念", "提醒"],
                                "rows": [
                                    ["主題 1", "先整理章節主線", "之後再補完整內容"]
                                ]
                            }
                        ]
                    }
                ]
            }
        elif self.mode == "overview_bodies":
            obj = {
                "id": "s4-4-2",
                "title": "章節正文",
                "groupName": "高中・高二下・矩陣的運算",
                "updatedAt": datetime.now().isoformat(timespec="seconds"),
                "appendGeneratedOutline": True,
                "variants": [
                    {
                        "id": "editable",
                        "label": "可修改版",
                        "sections": [
                            {
                                "type": "bullet-list",
                                "title": "重點歸納",
                                "items": [
                                    {
                                        "label": "重點 1",
                                        "text": "先整理這一節可直接上課的正文內容。"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "id": "original",
                        "label": "原稿版",
                        "sections": [
                            {
                                "type": "image",
                                "src": "data/chapter-overview-originals/example.png",
                                "caption": "先放原稿截圖"
                            },
                            {
                                "type": "pdf-page",
                                "src": "data/chapter-overview-originals/example.pdf",
                                "note": "如有 PDF 也可一起放"
                            }
                        ]
                    }
                ]
            }
        elif self.mode == "main_overviews":
            obj = {
                "id": "s1-1-1-main-theme-new",
                "title": "新主題整理",
                "updatedAt": datetime.now().isoformat(timespec="seconds"),
                "variants": [
                    {
                        "id": "editable",
                        "label": "可修改版",
                        "sections": [
                            {
                                "type": "table",
                                "headers": ["重點", "整理"],
                                "rows": [
                                    ["重點 1", "先整理這個主題最重要的觀念。"]
                                ]
                            }
                        ]
                    },
                    {
                        "id": "original",
                        "label": "原稿版",
                        "sections": [
                            {
                                "type": "pdf-page",
                                "src": "data/main-theme-overviews/example.pdf",
                                "note": "先放這個主題的原稿 PDF"
                            }
                        ]
                    }
                ]
            }
        elif self.mode == "closings":
            obj = {
                "id": "s4-4-2",
                "title": "章節後話",
                "groupName": "高中・高二下・矩陣的運算",
                "updatedAt": datetime.now().isoformat(timespec="seconds"),
                "variants": [
                    {
                        "id": "editable",
                        "label": "可修改版",
                        "sections": [
                            {
                                "type": "paragraph",
                                "text": "先寫這個章節最後想留下來的幾句話。"
                            }
                        ]
                    }
                ]
            }
        else:
            obj = {
                "id": "new-code",
                "title": "???",
                "chapter": "???",
                "section": "???",
                "domainMain": "",
                "domainSub": "",
            }
        self.editor.delete("1.0", "end")
        self.editor.insert("1.0", json.dumps(obj, ensure_ascii=False, indent=2))

    def save_item(self):
        text = self.editor.get("1.0", "end").strip()
        if not text:
            return messagebox.showwarning("提醒", "請先貼上或編輯 JSON")
        try:
            obj = json.loads(text)
        except json.JSONDecodeError as exc:
            return messagebox.showerror("JSON 錯誤", str(exc))
        if not isinstance(obj, dict):
            return messagebox.showerror("格式錯誤", "內容必須是 JSON 物件")

        kind = str(obj.get("kind", "")).strip().lower() if self._is_practice_mode() else ""
        rid = str(obj.get("id", "")).strip()
        if self._is_practice_mode() and kind == "binding":
            rid = self._practice_binding_row_id(obj)
        title = str(obj.get("title", "")).strip()
        if not rid or (not self._is_practice_mode() and not title):
            return messagebox.showerror("缺少必要欄位", "內容需要同時有 id 和 title")

        if self.mode == "topics":
            obj.setdefault("formula", {"type": "text", "lines": []})
            for k in ["contentTypes", "tags", "usage", "examples", "tips", "notes", "mistakes"]:
                obj.setdefault(k, [])
        elif self.mode == "questions":
            obj, _ = normalize_question_record(obj)
            for k in ["tags"]:
                obj.setdefault(k, [])
            obj.setdefault("chapter_code", "")
            obj.setdefault("formula_id", "")
            obj.setdefault("question_category", "")
            obj.setdefault("target_level", "")
            obj.setdefault("target_id", "")
            obj.setdefault("target_title", "")
        elif self._is_practice_mode():
            kind = str(obj.get("kind", "")).strip().lower() or "practice"
            if kind == "practice":
                obj = normalize_practice_record(obj)
                obj["kind"] = "practice"
                if not obj["id"] or not obj["title"]:
                    return messagebox.showerror("缺少必要欄位", "practice 需要 id 和 title")
                if obj["mode"] == "generator" and not obj["generatorKey"]:
                    return messagebox.showerror("缺少 generatorKey", "generator 模式需要 generatorKey")
                if obj["mode"] == "fixed-example" and not (obj["prompt"] or obj["answer"]):
                    return messagebox.showerror("缺少題目內容", "fixed-example 模式至少要有 prompt 或 answer")
            elif kind == "binding":
                obj = normalize_practice_binding(obj)
                obj["kind"] = "binding"
                if not obj["practiceId"] or not obj["targetType"] or not obj["targetId"]:
                    return messagebox.showerror("缺少必要欄位", "binding 需要 practiceId、targetType、targetId")
                if obj["targetType"] != "chapter":
                    return messagebox.showerror("targetType 錯誤", "binding 的 targetType 目前只能是 chapter")
            else:
                return messagebox.showerror("kind 錯誤", "practice 模式目前只支援 practice、binding")
        elif self.mode == "overviews":
            obj.setdefault("groupName", "")
            obj.setdefault("updatedAt", datetime.now().isoformat(timespec="seconds"))
            obj.setdefault("variants", [])
        elif self.mode == "overview_bodies":
            obj.setdefault("groupName", "")
            obj.setdefault("updatedAt", datetime.now().isoformat(timespec="seconds"))
            obj.setdefault("appendGeneratedOutline", True)
            obj.setdefault("variants", [])
        elif self.mode == "main_overviews":
            obj.setdefault("updatedAt", datetime.now().isoformat(timespec="seconds"))
            obj.setdefault("variants", [])
        elif self.mode == "closings":
            obj.setdefault("groupName", "")
            obj.setdefault("updatedAt", datetime.now().isoformat(timespec="seconds"))
            obj.setdefault("variants", [])

        payload = self._current_payload()
        action = "已更新"
        if self.mode == "chapter":
            catalog = payload.setdefault("catalog", {})
            if rid not in catalog:
                action = "已新增"
            chapter_item = dict(obj)
            chapter_item.pop("id", None)
            chapter_item["section"] = chapter_item.get("section", "") or title
            chapter_item["chapter"] = chapter_item.get("chapter", "") or title
            chapter_item.pop("title", None)
            catalog[rid] = chapter_item
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(catalog)
        elif self.mode == "overviews":
            overview_map = payload.setdefault("overviews", {})
            if rid not in overview_map:
                action = "已新增"
            overview_item = dict(obj)
            overview_item.pop("id", None)
            if not isinstance(overview_item.get("variants", []), list):
                overview_item["variants"] = []
            overview_item["updatedAt"] = overview_item.get("updatedAt", "") or datetime.now().isoformat(timespec="seconds")
            overview_map[rid] = overview_item
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(overview_map)
        elif self.mode == "overview_bodies":
            body_map = payload.setdefault("bodies", {})
            if rid not in body_map:
                action = "已新增"
            body_item = dict(obj)
            body_item.pop("id", None)
            if not isinstance(body_item.get("variants", []), list):
                body_item["variants"] = []
            body_item["appendGeneratedOutline"] = bool(body_item.get("appendGeneratedOutline"))
            body_item["updatedAt"] = body_item.get("updatedAt", "") or datetime.now().isoformat(timespec="seconds")
            body_map[rid] = body_item
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(body_map)
        elif self.mode == "main_overviews":
            overview_map = payload.setdefault("byId", {})
            if rid not in overview_map:
                action = "已新增"
            overview_item = dict(obj)
            overview_item.pop("id", None)
            if not isinstance(overview_item.get("variants", []), list):
                overview_item["variants"] = []
            overview_item["updatedAt"] = overview_item.get("updatedAt", "") or datetime.now().isoformat(timespec="seconds")
            overview_map[rid] = overview_item
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(overview_map)
        elif self.mode == "closings":
            closing_map = payload.setdefault("closings", {})
            if rid not in closing_map:
                action = "已新增"
            closing_item = dict(obj)
            closing_item.pop("id", None)
            if not isinstance(closing_item.get("variants", []), list):
                closing_item["variants"] = []
            closing_item["updatedAt"] = closing_item.get("updatedAt", "") or datetime.now().isoformat(timespec="seconds")
            closing_map[rid] = closing_item
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(closing_map)
        elif self._is_practice_mode():
            kind = obj.get("kind", "practice")
            if kind == "practice":
                rows = payload.setdefault("practices", [])
                record_id = str(obj.get("id", "")).strip()
                idx = next((i for i, it in enumerate(rows) if str(it.get("id", "")).strip() == record_id), -1)
                action = "已更新" if idx >= 0 else "已新增"
                stored = dict(obj)
                stored.pop("kind", None)
                if idx >= 0:
                    rows[idx] = stored
                else:
                    rows.append(stored)
                rid = record_id
            elif kind == "binding":
                rows = payload.setdefault("bindings", [])
                binding_id = self._practice_binding_row_id(obj)
                idx = next(
                    (
                        i for i, it in enumerate(rows)
                        if self._practice_binding_row_id(normalize_practice_binding(it)) == binding_id
                    ),
                    -1,
                )
                action = "已更新" if idx >= 0 else "已新增"
                stored = dict(obj)
                stored.pop("kind", None)
                if idx >= 0:
                    rows[idx] = stored
                else:
                    rows.append(stored)
                rid = binding_id
            payload.setdefault("meta", {})
            payload["meta"]["updatedAt"] = practice_now_iso()
            self._normalize_practice_payload_state()
        else:
            key = self._current_key()
            rows = payload.setdefault(key, [])
            idx = next((i for i, it in enumerate(rows) if it.get("id") == rid), -1)
            action = "已更新" if idx >= 0 else "已新增"
            if idx >= 0:
                rows[idx] = obj
            else:
                rows.append(obj)
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(rows)

        self._write_current_db()
        self.refresh_filters()
        self.last_selected_id = rid
        self.search(preserve_selected_id=rid)
        self.status_var.set(f"{action}：{rid}")
        messagebox.showinfo("完成", f"{action} {rid}")
    def delete_selected(self):
        selected = self.tree.selection()
        if not selected:
            return messagebox.showwarning("提醒", "請先選一筆")
        picked = []
        for s in selected:
            try:
                idx = int(s)
            except ValueError:
                continue
            if 0 <= idx < len(self.filtered):
                picked.append(self.filtered[idx])
        ids = [it.get("id") for it in picked if it.get("id")]
        if not ids:
            return messagebox.showwarning("提醒", "請先選一筆")
        if len(ids) == 1:
            prompt = f"確定刪除 {ids[0]} 嗎？"
        else:
            prompt = f"確定刪除這 {len(ids)} 筆資料嗎？"
        if not messagebox.askyesno("確認", prompt):
            return

        payload = self._current_payload()
        id_set = set(ids)
        if self.mode == "chapter":
            catalog = payload.get("catalog", {})
            for rid in list(id_set):
                catalog.pop(rid, None)
            payload["catalog"] = catalog
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(catalog)
        elif self.mode == "overviews":
            overview_map = payload.get("overviews", {})
            for rid in list(id_set):
                overview_map.pop(rid, None)
            payload["overviews"] = overview_map
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(overview_map)
        elif self.mode == "overview_bodies":
            body_map = payload.get("bodies", {})
            for rid in list(id_set):
                body_map.pop(rid, None)
            payload["bodies"] = body_map
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(body_map)
        elif self.mode == "main_overviews":
            overview_map = payload.get("byId", {})
            for rid in list(id_set):
                overview_map.pop(rid, None)
            payload["byId"] = overview_map
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(overview_map)
        elif self.mode == "closings":
            closing_map = payload.get("closings", {})
            for rid in list(id_set):
                closing_map.pop(rid, None)
            payload["closings"] = closing_map
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(closing_map)
        elif self._is_practice_mode():
            practice_rows = payload.get("practices", [])
            binding_rows = payload.get("bindings", [])
            deleted_practice_ids = {
                str(item.get("dbRecord", {}).get("id", "")).strip()
                for item in picked
                if str(item.get("kind", "")).strip() == "practice"
            }
            payload["practices"] = [
                r for r in practice_rows
                if str(r.get("id", "")).strip() not in id_set
            ]
            payload["bindings"] = [
                r for r in binding_rows
                if (
                    self._practice_binding_row_id(normalize_practice_binding(r)) not in id_set
                    and str(r.get("practiceId", "")).strip() not in deleted_practice_ids
                )
            ]
            payload.setdefault("meta", {})
            payload["meta"]["updatedAt"] = practice_now_iso()
            self._normalize_practice_payload_state()
        else:
            key = self._current_key()
            rows = payload.get(key, [])
            payload[key] = [r for r in rows if r.get("id") not in id_set]
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(payload[key])
        self._write_current_db()
        self.refresh_filters()
        self.search()
        self.editor.delete("1.0", "end")
        self.status_var.set(f"已刪除：{len(ids)} 筆")
        messagebox.showinfo("完成", f"已刪除 {len(ids)} 筆資料")

    def _find_edge_exe(self):
        candidates = [
            Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
            Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
        ]
        for p in candidates:
            if p.exists():
                return str(p)
        return None

    def _topic_section_html(self, label: str, values):
        if not values:
            return ""
        lis = "".join(f"<li>{self._render_maybe_math(v)}</li>" for v in values)
        return f"""
        <section class="block">
          <h3>{escape(label)}</h3>
          <ul>{lis}</ul>
        </section>
        """

    def _looks_like_math(self, text: str):
        s = str(text)
        math_markers = [
            "$", "\\", "=", "+", "-", "*", "/", "^", "_", "(", ")", "<", ">", "≤", "≥", "≠", "√", "π", "θ",
            "sin", "cos", "tan", "log", "ln", "frac", "sum", "int",
        ]
        if any(m in s for m in math_markers):
            return True
        # Has both digits and latin letters -> often algebraic expression
        has_digit = any(ch.isdigit() for ch in s)
        has_alpha = any(("a" <= ch.lower() <= "z") for ch in s)
        return has_digit and has_alpha

    def _as_tex(self, text: str):
        s = str(text).strip()
        if not s:
            return ""
        # Already TeX-delimited
        if "$" in s or "\\(" in s or "\\[" in s:
            return s
        # Wrap formula-like plain text as inline math
        return f"\\({s}\\)"

    def _render_maybe_math(self, value):
        s = str(value).strip()
        if not s:
            return ""
        return escape(s)

    def _resolve_media_src(self, path_text: str):
        raw = str(path_text or "").strip()
        if not raw:
            return ""
        if raw.startswith(("http://", "https://", "file:///")):
            return raw
        return (ROOT / raw).resolve().as_uri()

    def _asset_uri(self, rel_path: str):
        return (ROOT / rel_path).resolve().as_uri()

    def _render_rich_line(self, value):
        text = str(value or "").strip()
        if not text:
            return ""
        parts = re.split(r"(\[圖:[^\]]+\])", text)
        html_parts = []
        for part in parts:
            if not part:
                continue
            if part.startswith("[圖:") and part.endswith("]"):
                src = self._resolve_media_src(part[3:-1])
                html_parts.append(f"<img class='inline-media' src='{escape(src)}' alt='question-media' />" if src else escape(part))
            else:
                html_parts.append(self._render_maybe_math(part))
        return "".join(html_parts)

    def _topic_card_html(self, item: dict):
        badges = []
        for key in ["stage", "grade", "chapter", "difficulty", "domain"]:
            v = item.get(key)
            if v:
                badges.append(f"<span class='badge'>{escape(str(v))}</span>")
        badges_html = "".join(badges)

        formula_html = ""
        formula = item.get("formula", {})
        if isinstance(formula, dict):
            rows = []
            for ln in formula.get("lines", []) or []:
                if isinstance(ln, dict):
                    label = ln.get("label", "")
                    values = ln.get("values", []) or []
                    if values:
                        tex_values = " | ".join(self._as_tex(str(v)) for v in values)
                        rows.append(
                            f"<tr><th>{escape(str(label))}</th><td class='math'>{tex_values}</td></tr>"
                        )
            if rows:
                formula_html = f"<section class='block'><h3>公式</h3><table>{''.join(rows)}</table></section>"

        return f"""
        <article class="page">
          <header>
            <h1>{escape(str(item.get("title", "")))}</h1>
            <div class="id">ID: {escape(str(item.get("id", "")))}</div>
            <div class="badges">{badges_html}</div>
          </header>
          {formula_html}
          {self._topic_section_html("何時使用", item.get("usage", []))}
          {self._topic_section_html("使用範例", item.get("examples", []))}
          {self._topic_section_html("使用技巧", item.get("tips", []))}
          {self._topic_section_html("補充說明", item.get("notes", []))}
          {self._topic_section_html("常見錯誤", item.get("mistakes", []))}
        </article>
        """

    def _build_topics_print_html(self, items):
        pages = "\n".join(self._topic_card_html(it) for it in items)
        return f"""<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <title>Selected Topics</title>
  <script>
    window.MathJax = {{
      tex: {{ inlineMath: [['$','$'], ['\\\\(','\\\\)']], displayMath: [['$$','$$'], ['\\\\[','\\\\]']] }},
      svg: {{ fontCache: 'none' }}
    }};
  </script>
  <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
  <style>
    @page {{ size: A4; margin: 12mm; }}
    body {{ font-family: "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif; margin: 0; color: #2b2b2b; background: #f4efe5; }}
    .page {{ page-break-after: always; background: #fffdf8; border: 1px solid #e2d9c6; border-radius: 10px; padding: 16px 18px; min-height: 260mm; box-sizing: border-box; }}
    .page:last-child {{ page-break-after: auto; }}
    h1 {{ margin: 0 0 6px; font-size: 24px; }}
    .id {{ color: #6f6658; font-size: 12px; margin-bottom: 8px; }}
    .badges {{ margin-bottom: 8px; }}
    .badge {{ display: inline-block; margin: 0 6px 6px 0; padding: 4px 10px; border-radius: 999px; background: #efe7d8; color: #7b5f3b; font-size: 12px; }}
    .block {{ margin-top: 12px; }}
    .block h3 {{ margin: 0 0 6px; font-size: 15px; color: #5a4326; }}
    ul {{ margin: 0; padding-left: 20px; }}
    li {{ margin: 3px 0; line-height: 1.45; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid #e7dece; padding: 7px; vertical-align: top; font-size: 13px; }}
    th {{ width: 30%; background: #f8f3e8; text-align: left; }}
    .math {{ font-family: "Times New Roman","Cambria Math","Noto Serif TC",serif; }}
  </style>
</head>
<body>{pages}</body>
</html>
"""

    def _safe_filename(self, text: str):
        raw = str(text or "").strip()
        if not raw:
            return "未命名"
        return re.sub(r'[\\/:*?"<>|]+', "-", raw)

    def _print_html_to_pdf(self, html: str, out_path: Path):
        edge = self._find_edge_exe()
        out_path = Path(out_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        with NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
            tmp.write(html)
            html_path = Path(tmp.name)

        if not edge:
            html_out = out_path.with_suffix(".html")
            html_out.write_text(html, encoding="utf-8")
            try:
                html_path.unlink(missing_ok=True)
            except Exception:
                pass
            return {"ok": False, "pdf": None, "html": html_out, "reason": "edge-not-found"}

        try:
            url = html_path.as_uri()
            subprocess.run(
                [
                    edge,
                    "--headless",
                    "--disable-gpu",
                    "--virtual-time-budget=15000",
                    f"--print-to-pdf={str(out_path)}",
                    "--no-pdf-header-footer",
                    "--allow-file-access-from-files",
                    url,
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return {"ok": True, "pdf": out_path, "html": None, "reason": ""}
        except Exception as exc:
            return {"ok": False, "pdf": None, "html": None, "reason": str(exc)}
        finally:
            try:
                html_path.unlink(missing_ok=True)
            except Exception:
                pass

    def _render_practice_html_to_markdown(self, html: str):
        edge = self._find_edge_exe()
        if not edge:
            return {"ok": False, "markdown": "", "reason": "edge-not-found"}
        with NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
            tmp.write(html)
            html_path = Path(tmp.name)
        try:
            url = html_path.as_uri()
            proc = subprocess.run(
                [
                    edge,
                    "--headless",
                    "--disable-gpu",
                    "--virtual-time-budget=20000",
                    "--allow-file-access-from-files",
                    "--dump-dom",
                    url,
                ],
                check=True,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
            dom = proc.stdout or ""
            match = re.search(r'<pre id="practice-md-export"[^>]*>(.*?)</pre>', dom, re.S)
            if not match:
                return {"ok": False, "markdown": "", "reason": "md-pre-not-found"}
            markdown = unescape(match.group(1)).replace("\r\n", "\n").strip() + "\n"
            return {"ok": True, "markdown": markdown, "reason": ""}
        except Exception as exc:
            return {"ok": False, "markdown": "", "reason": str(exc)}
        finally:
            try:
                html_path.unlink(missing_ok=True)
            except Exception:
                pass

    def _practice_pdf_font_name(self) -> str:
        cached = getattr(self, "_cached_practice_pdf_font_name", "")
        if cached:
            return cached

        candidates = [
            ("GuiPracticePdfKai", Path(r"C:\Windows\Fonts\kaiu.ttf")),
            ("GuiPracticePdfJhengHei", Path(r"C:\Windows\Fonts\msjh.ttc")),
            ("GuiPracticePdfNoto", Path(r"C:\Windows\Fonts\NotoSansTC-VF.ttf")),
        ]
        for font_name, font_path in candidates:
            try:
                pdfmetrics.registerFont(TTFont(font_name, str(font_path)))
                self._cached_practice_pdf_font_name = font_name
                return font_name
            except Exception:
                continue

        self._cached_practice_pdf_font_name = "Helvetica"
        return "Helvetica"

    def _practice_pdf_plain_text(self, value):
        text = str(value or "")
        text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
        text = re.sub(r"<[^>]+>", "", text)
        text = unescape(text)
        text = text.replace("\r\n", "\n")
        text = text.replace(r"\(", "").replace(r"\)", "")
        text = text.replace(r"\[", "").replace(r"\]", "")
        text = text.replace("$", "")
        text = text.replace(r"\times", "×")
        text = text.replace(r"\div", "÷")
        text = text.replace(r"\cdot", "·")
        text = text.replace(r"\le", "≤")
        text = text.replace(r"\ge", "≥")
        text = text.replace(r"\neq", "≠")
        text = text.replace(r"\pm", "±")
        text = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"(\1)/(\2)", text)
        text = re.sub(r"\\sqrt\{([^{}]+)\}", r"√(\1)", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    def _simplify_practice_answer_text(self, value: str, answer_mode: str = "detail"):
        text = self._practice_pdf_plain_text(value)
        if answer_mode != "simple" or not text:
            return text
        match = re.search(
            r"(?:簡答|答案)[:：]\s*([\s\S]*?)(?=(?:。|；|\n)?\s*(?:過程|解析|詳解|說明)[:：]|$)",
            text,
        )
        if match and match.group(1).strip():
            return match.group(1).strip()
        parts = re.split(r"(?:。|；|\n)?\s*(?:過程|解析|詳解|說明)[:：]", text, maxsplit=1)
        return (parts[0] or text).strip()

    def _build_practice_markdown_from_sets(
        self,
        generated_sets: list[dict],
        title: str,
        export_order: str = "separate",
        answer_mode: str = "detail",
        markdown_gap_lines: int = 0,
    ) -> str:
        gap_lines = max(0, min(5, int(markdown_gap_lines or 0)))
        lines = [f"# {title}", ""]

        def push_items(values: list[str], simplify: bool = False):
            for idx, raw in enumerate(values or [], 1):
                text = (
                    self._simplify_practice_answer_text(raw, answer_mode)
                    if simplify
                    else self._practice_pdf_plain_text(raw)
                )
                lines.append(f"{idx}. {text}")
                for _ in range(gap_lines if not simplify else 0):
                    lines.append("&nbsp;")

        if export_order == "interleaved":
            for practice_set in generated_sets:
                lines.extend([f"## {practice_set.get('title', '未命名題型')}", ""])
                if practice_set.get("intro"):
                    lines.extend([self._practice_pdf_plain_text(practice_set.get("intro", "")), ""])
                lines.extend(["### 題目", ""])
                push_items(practice_set.get("questions", []), simplify=False)
                lines.extend(["", "### 答案", ""])
                push_items(practice_set.get("answers", []), simplify=True)
                lines.append("")
            return "\n".join(lines).strip() + "\n"

        lines.extend(["## 題目", ""])
        for practice_set in generated_sets:
            lines.append(f"### {practice_set.get('title', '未命名題型')}")
            if practice_set.get("intro"):
                lines.extend([self._practice_pdf_plain_text(practice_set.get("intro", "")), ""])
            push_items(practice_set.get("questions", []), simplify=False)
            lines.append("")

        lines.extend(["## 答案", ""])
        for practice_set in generated_sets:
            lines.append(f"### {practice_set.get('title', '未命名題型')}")
            push_items(practice_set.get("answers", []), simplify=True)
            lines.append("")

        return "\n".join(lines).strip() + "\n"

    def _generate_practice_export_sets(self, records: list[dict], counts: dict[str, int], seed: str):
        payload = []
        for record in records:
            rid = str(record.get("id", "")).strip()
            if not rid:
                continue
            payload.append(
                {
                    "practiceId": rid,
                    "count": int(counts.get(rid, int(record.get("questionCount", 0) or 5))),
                    "title": str(record.get("title", "")).strip(),
                }
            )
        if not payload:
            return {"ok": False, "reason": "沒有可輸出的無限練習。", "sets": []}

        payload_json = json.dumps(payload, ensure_ascii=False)
        seed_json = json.dumps(seed or "practice-pdf", ensure_ascii=False)
        node_script = f"""
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = process.cwd();
const ctx = {{
  console, Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp,
  parseInt, parseFloat, isNaN, Infinity, NaN, Set, Map, WeakMap, WeakSet, URL,
  structuredClone: global.structuredClone,
}};
ctx.window = ctx;
ctx.global = ctx;
ctx.globalThis = ctx;
ctx.self = ctx;
ctx.navigator = {{ userAgent: 'gui-practice-pdf-export' }};
ctx.document = {{}};
vm.createContext(ctx);

function load(relPath) {{
  const full = path.join(root, relPath);
  const code = fs.readFileSync(full, 'utf8');
  vm.runInContext(code, ctx, {{ filename: relPath }});
}}

const items = {payload_json};
const seedText = {seed_json};

function normalizeText(value) {{
  return String(value == null ? '' : value).trim();
}}

function makeSeededRandom(seedSource) {{
  var seed = String(seedSource || 'practice-pdf');
  var h = 2166136261 >>> 0;
  for (var i = 0; i < seed.length; i += 1) {{
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }}
  return function() {{
    h = (h + 0x6D2B79F5) >>> 0;
    var t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }};
}}

function withSeed(seedSource, callback) {{
  const originalRandom = Math.random;
  Math.random = makeSeededRandom(seedSource);
  try {{
    return callback();
  }} finally {{
    Math.random = originalRandom;
  }}
}}

function extractGeneratedRows(generated) {{
  const questions = Array.isArray(generated?.questions) ? generated.questions : [];
  const summaryAnswers = Array.isArray(generated?.summaryAnswers) ? generated.summaryAnswers : [];
  const answers = Array.isArray(generated?.answers) ? generated.answers : [];
  return questions
    .map((question, rowIndex) => ({{
      question: normalizeText(question),
      summaryAnswer: normalizeText(summaryAnswers[rowIndex] || answers[rowIndex] || ''),
      answer: normalizeText(answers[rowIndex] || ''),
    }}))
    .filter((row) => row.question);
}}

function collectGeneratedRows(config, practiceRecord, count, seedPrefix) {{
  const targetCount = Math.max(1, Number(count || 5) || 5);
  const rows = [];
  let intro = '';
  const attemptLimit = Math.max(targetCount, targetCount * 3);
  for (let attempt = 0; attempt < attemptLimit && rows.length < targetCount; attempt += 1) {{
    const generated = withSeed(seedPrefix + '|' + attempt, () => config.generate.call(config, practiceRecord) || {{}}) || {{}};
    if (!intro) intro = normalizeText(generated.intro);
    const generatedRows = extractGeneratedRows(generated);
    for (const row of generatedRows) {{
      if (rows.length >= targetCount) break;
      rows.push(row);
    }}
  }}
  return {{
    intro,
    questions: rows.map((row) => row.question),
    summaryAnswers: rows.map((row) => row.summaryAnswer),
    answers: rows.map((row) => row.answer),
  }};
}}

load('data/formula-practice-assignments.js');
load('data/formula-practice.js');
load('data/practice-generators/shared-legacy-bundle.js');
load('data/practice-generator-bootstrap.js');
load('data/practice-generator-bundles.js');
for (const file of fs.readdirSync(path.join(root, 'data', 'practice-generators'))) {{
  if (!file.endsWith('.js')) continue;
  if (file === 'shared-legacy-bundle.js') continue;
  load(path.join('data', 'practice-generators', file));
}}

const generatedSets = items.map((entry, index) => {{
  const id = normalizeText(entry.practiceId);
  const practiceRecord = ctx.practiceLibraryStore?.byId?.[id] || ctx.formulaPracticeAssignmentStore?.byId?.[id] || null;
  if (!practiceRecord) {{
    return {{
      practiceId: id,
      title: normalizeText(entry.title) || id || '未命名題型',
      intro: '',
      questions: ['這一題尚未設定練習內容。'],
      summaryAnswers: ['這一題尚未設定簡答。'],
      answers: ['這一題尚未設定答案。'],
    }};
  }}
  const count = Math.max(1, Number(entry.count || practiceRecord.questionCount || 5) || 5);
  practiceRecord.questionCount = count;
  const config = ctx.formulaPracticeStore?.getConfig?.(id) || null;
  if (!config) {{
    return {{
      practiceId: id,
      title: normalizeText(entry.title) || normalizeText(practiceRecord.title) || id,
      intro: '',
      questions: ['這一題尚未設定練習內容。'],
      summaryAnswers: ['這一題尚未設定簡答。'],
      answers: ['這一題尚未設定答案。'],
    }};
  }}
  if (config.type === 'fixed-example') {{
    const prompt = normalizeText(config.prompt) || '尚未設定題目';
    const answer = normalizeText(config.answer) || '尚未設定答案';
    return {{
      practiceId: id,
      title: normalizeText(config.title) || normalizeText(entry.title) || normalizeText(practiceRecord.title) || id,
      intro: '',
      questions: [prompt],
      summaryAnswers: [answer],
      answers: [answer],
    }};
  }}
  let generated = {{}};
  if (typeof config.generate === 'function') {{
    generated = collectGeneratedRows(config, practiceRecord, count, seedText + '|' + index + '|' + id);
  }}
  const questions = Array.isArray(generated.questions) ? generated.questions.map((value) => normalizeText(value)).filter(Boolean) : [];
  const summaryAnswers = Array.isArray(generated.summaryAnswers) ? generated.summaryAnswers.map((value) => normalizeText(value)) : [];
  const answers = Array.isArray(generated.answers) ? generated.answers.map((value) => normalizeText(value)) : [];
  return {{
    practiceId: id,
    title: normalizeText(config.title) || normalizeText(entry.title) || normalizeText(practiceRecord.title) || id,
    intro: normalizeText(generated.intro),
    questions,
    summaryAnswers,
    answers,
  }};
}});

process.stdout.write(JSON.stringify({{ ok: true, sets: generatedSets }}, null, 2));
"""

        with NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tmp:
            tmp.write(node_script)
            script_path = Path(tmp.name)
        try:
            proc = subprocess.run(
                ["node", str(script_path)],
                cwd=str(ROOT),
                check=True,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
            data = json.loads((proc.stdout or "").replace("\ufeff", ""))
            return {"ok": True, "reason": "", "sets": data.get("sets", [])}
        except Exception as exc:
            return {"ok": False, "reason": str(exc), "sets": []}
        finally:
            try:
                script_path.unlink(missing_ok=True)
            except Exception:
                pass

    def _generate_practice_export_markdown(
        self,
        records: list[dict],
        counts: dict[str, int],
        combined_title: str,
        export_order: str,
        answer_mode: str,
        question_gap_mm: float,
        export_seed: str,
    ):
        generated_result = self._generate_practice_export_sets(records, counts, export_seed)
        if not generated_result.get("ok"):
            return {
                "ok": False,
                "reason": f"無限練習生成失敗：{generated_result.get('reason', '未知錯誤')}",
                "markdown": "",
            }

        generated_sets = generated_result.get("sets", [])
        latex_problem = pdf_markdown_export.find_latex_problem_in_sets(generated_sets)
        if latex_problem:
            gen_label = latex_problem["title"]
            if latex_problem["id"]:
                gen_label += f"（{latex_problem['id']}）"
            return {
                "ok": False,
                "reason": (
                    f"生成器「{gen_label}」的{latex_problem['field']}第 {latex_problem['index']} 題"
                    f"有 LaTeX 問題，無法排版：\n{latex_problem['problem']}\n\n"
                    f"出問題的內容：\n{latex_problem['sample']}"
                ),
                "markdown": "",
            }

        title = str(combined_title or "無限練習題目與答案").strip() or "無限練習題目與答案"
        markdown_text = pdf_markdown_export.build_practice_sets_markdown(
            generated_sets,
            title,
            export_order=export_order,
            answer_mode=answer_mode,
            gap_mm=question_gap_mm,
        )
        return {"ok": True, "reason": "", "markdown": markdown_text}

    def _export_practice_sets_to_pdf(
        self,
        generated_sets: list[dict],
        out_path: Path,
        title: str,
        export_order: str = "separate",
        answer_mode: str = "detail",
        question_spacing_px: int = 18,
    ):
        out_path = Path(out_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        font_name = self._practice_pdf_font_name()
        spacing_pt = max(2, min(40, int(question_spacing_px or 18)))
        content_width = A4[0] - (28 * mm)

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "PracticePdfTitle",
            parent=styles["Heading1"],
            fontName=font_name,
            fontSize=20,
            leading=24,
            textColor=HexColor("#3d2a1a"),
            spaceAfter=5 * mm,
            alignment=TA_LEFT,
            wordWrap="CJK",
        )
        note_style = ParagraphStyle(
            "PracticePdfNote",
            parent=styles["BodyText"],
            fontName=font_name,
            fontSize=10.5,
            leading=15,
            textColor=HexColor("#6f6658"),
            spaceAfter=4 * mm,
            wordWrap="CJK",
        )
        section_style = ParagraphStyle(
            "PracticePdfSection",
            parent=styles["Heading2"],
            fontName=font_name,
            fontSize=16,
            leading=20,
            textColor=HexColor("#5a4326"),
            spaceBefore=3 * mm,
            spaceAfter=2 * mm,
            wordWrap="CJK",
        )
        set_title_style = ParagraphStyle(
            "PracticePdfSetTitle",
            parent=styles["Heading3"],
            fontName=font_name,
            fontSize=13,
            leading=16,
            textColor=HexColor("#2b2b2b"),
            spaceBefore=2 * mm,
            spaceAfter=1.5 * mm,
            wordWrap="CJK",
        )
        body_style = ParagraphStyle(
            "PracticePdfBody",
            parent=styles["BodyText"],
            fontName=font_name,
            fontSize=11.5,
            leading=18,
            textColor=HexColor("#2b2b2b"),
            spaceAfter=0,
            wordWrap="CJK",
        )

        def wrap_pdf_text(text: str, style: ParagraphStyle, max_width: float = content_width) -> str:
            wrapped_lines = []
            for raw_line in str(text or "").splitlines() or [""]:
                line = ""
                for char in raw_line:
                    trial = line + char
                    if line and pdfmetrics.stringWidth(trial, style.fontName, style.fontSize) > max_width:
                        wrapped_lines.append(line.rstrip())
                        line = "" if char.isspace() else char
                    else:
                        line = trial
                wrapped_lines.append(line.rstrip())
            return "\n".join(wrapped_lines)

        def paragraph_text(text: str, style: ParagraphStyle):
            text = str(text or "").replace("\u2212", "-")
            return escape(wrap_pdf_text(text, style)).replace("\n", "<br/>")

        def inline_answer_text(value: str):
            return " ".join(str(value or "").split()).replace("\u2212", "-")

        def append_set(story: list, practice_set: dict, show_answer: bool):
            story.append(Paragraph(paragraph_text(practice_set.get("title", "未命名題型"), set_title_style), set_title_style))
            if practice_set.get("intro") and not show_answer:
                story.append(Paragraph(paragraph_text(self._practice_pdf_plain_text(practice_set.get("intro", "")), note_style), note_style))
            values = practice_set.get("answers", []) if show_answer else practice_set.get("questions", [])
            if show_answer:
                values = [self._simplify_practice_answer_text(value, answer_mode) for value in values]
            else:
                values = [self._practice_pdf_plain_text(value) for value in values]
            values = [value for value in values if str(value or "").strip()]
            if not values:
                values = ["目前沒有內容。"]
            group = []
            if show_answer and answer_mode == "simple":
                line = "　　".join(
                    f"<b>{idx}.</b> {escape(inline_answer_text(value))}"
                    for idx, value in enumerate(values, 1)
                    if inline_answer_text(value)
                )
                group.append(Paragraph(line or paragraph_text("目前沒有內容。", body_style), body_style))
                group.append(Spacer(1, spacing_pt))
            else:
                for idx, value in enumerate(values, 1):
                    group.append(Paragraph(f"<b>{idx}.</b> {paragraph_text(value, body_style)}", body_style))
                    group.append(Spacer(1, spacing_pt))
            story.append(KeepTogether(group))
            story.append(Spacer(1, 4))

        story = [
            Paragraph(paragraph_text(title, title_style), title_style),
            Paragraph(
                paragraph_text("依所選無限練習自動生成；本 PDF 只生成一次資料，答案對應前方同一批題目。", note_style),
                note_style,
            ),
        ]

        if export_order == "interleaved":
            for practice_set in generated_sets:
                story.append(Paragraph(paragraph_text("題目", section_style), section_style))
                append_set(story, practice_set, show_answer=False)
                story.append(Paragraph(paragraph_text("答案", section_style), section_style))
                append_set(story, practice_set, show_answer=True)
                story.append(Spacer(1, 8))
        else:
            story.append(Paragraph(paragraph_text("題目", section_style), section_style))
            for practice_set in generated_sets:
                append_set(story, practice_set, show_answer=False)
            story.append(PageBreak())
            story.append(Paragraph(paragraph_text("答案", section_style), section_style))
            for practice_set in generated_sets:
                append_set(story, practice_set, show_answer=True)

        doc = SimpleDocTemplate(
            str(out_path),
            pagesize=A4,
            leftMargin=14 * mm,
            rightMargin=14 * mm,
            topMargin=12 * mm,
            bottomMargin=12 * mm,
        )
        doc.build(story)
        return {"ok": True, "reason": "", "pdf": out_path}

    def _difficulty_rank(self, value: str):
        text = str(value or "").strip()
        mapping = {
            "易": 0,
            "基礎": 0,
            "中": 1,
            "中等": 1,
            "難": 2,
            "進階": 2,
            "挑戰": 3,
            "高階": 3,
            "課外": 4,
        }
        return mapping.get(text, 9)

    def _chapter_code_options(self):
        catalog = self.chapter_payload.get("catalog", {})
        if not isinstance(catalog, dict):
            return []
        return [self._chapter_label(code, catalog.get(code, {})) for code in sorted(catalog.keys())]

    def _chapter_code_from_selection(self, value: str):
        text = str(value or "").strip()
        if not text:
            return ""
        catalog = self._chapter_catalog()
        if text in catalog:
            return text
        head = text.split(maxsplit=1)[0]
        return head if head in catalog else text

    def _topic_formula_block_html(self, item: dict):
        formula = item.get("formula", {})
        if not isinstance(formula, dict):
            return ""
        rows = []
        for ln in formula.get("lines", []) or []:
            if not isinstance(ln, dict):
                continue
            label = ln.get("label", "")
            values = ln.get("values", []) or []
            if not values:
                continue
            tex_values = " | ".join(self._as_tex(str(v)) for v in values)
            rows.append(f"<tr><th>{escape(str(label))}</th><td class='math'>{tex_values}</td></tr>")
        if not rows:
            return ""
        return f"<section class='block'><h3>核心公式</h3><table>{''.join(rows)}</table></section>"

    def _render_rich_multiline(self, value):
        raw_lines = str(value or "").splitlines()
        if not raw_lines:
            return ""
        html_parts = []
        for line in raw_lines:
            stripped = line.strip()
            if stripped:
                html_parts.append(self._render_rich_line(stripped))
            else:
                html_parts.append("<br>")
        return "<br>".join(html_parts)

    def _question_item_html(self, question: dict, show_answer: bool, preserve_editor_breaks: bool = False):
        q_source = question.get("question_text", "")
        a_source = question.get("answer_text", "")
        e_source = question.get("explanation_text", "")
        if not preserve_editor_breaks:
            q_source = clean_question_body(q_source)
            a_source = clean_question_body(a_source)
            e_source = clean_question_body(e_source)
        q_text = self._render_rich_multiline(q_source)
        answer_text = self._render_rich_multiline(a_source)
        explain_text = self._render_rich_multiline(e_source)
        title = escape(str(question.get("title") or question.get("id") or "題目"))
        title = escape(str(clean_question_title(question.get("title", "")) or question.get("id") or "憿"))
        diff = escape(str(question.get("difficulty", "")))
        meta = f"<span class='badge'>難度：{diff or '未標記'}</span>"
        answer_html = ""
        if show_answer:
            answer_html = f"""
            <div class="qa-answer">
              <p><strong>答案：</strong>{answer_text or '（未填）'}</p>
              <p><strong>解析：</strong>{explain_text or '（未填）'}</p>
            </div>
            """
        return f"""
        <li class="question-item">
          <p class="question-title">{title}</p>
          <div class="badges">{meta}</div>
          <p class="question-text">{q_text or '（題目內容空白）'}</p>
          {answer_html}
        </li>
        """

    def _question_list_html(self, questions, show_answer: bool):
        if not questions:
            return "<p class='muted'>此區目前沒有題目。</p>"
        items = "".join(self._question_item_html(q, show_answer=show_answer) for q in questions)
        return f"<ol class='question-list'>{items}</ol>"

    def _pick_preview_variant(self, variants, preferred_id: str = "editable"):
        variant_list = variants if isinstance(variants, list) else []
        for variant in variant_list:
            if isinstance(variant, dict) and str(variant.get("id", "")).strip() == preferred_id:
                return variant
        return variant_list[0] if variant_list else None

    def _pick_preview_sections(self, variants, active_variant, predicate):
        active_sections = [
            section for section in (active_variant.get("sections", []) if isinstance(active_variant, dict) else [])
            if predicate(section)
        ]
        if active_sections:
            return active_sections
        for variant in variants if isinstance(variants, list) else []:
            if not isinstance(variant, dict):
                continue
            sections = [section for section in (variant.get("sections", []) or []) if predicate(section)]
            if sections:
                return sections
        return []

    def _render_preview_overview_section(self, section: dict, default_pdf_note: str):
        if not isinstance(section, dict):
            return ""
        section_type = str(section.get("type", "")).strip()
        if section_type == "paragraph":
            return f"<div class='chapter-overview__paragraph'>{self._render_rich_multiline(section.get('text', ''))}</div>"
        if section_type == "bullet-list":
            title = str(section.get("title", "")).strip()
            items = section.get("items", []) if isinstance(section.get("items", []), list) else []
            rendered_items = []
            for item in items:
                if isinstance(item, str):
                    rendered_items.append(f"<li class='chapter-overview__bullet-item'>{self._render_rich_multiline(item)}</li>")
                    continue
                if not isinstance(item, dict):
                    continue
                label = str(item.get("label", "")).strip()
                text = str(item.get("text", "")).strip()
                rendered_items.append(
                    f"""
                    <li class="chapter-overview__bullet-item">
                      {f"<p class='chapter-overview__bullet-label'>{self._render_rich_multiline(label)}</p>" if label else ""}
                      {f"<div class='chapter-overview__bullet-text'>{self._render_rich_multiline(text)}</div>" if text else ""}
                    </li>
                    """
                )
            return f"""
            <section class="chapter-overview__bullet-list">
              {f"<h4 class='chapter-overview__bullet-title'>{escape(title)}</h4>" if title else ""}
              <ul class="chapter-overview__bullet-items">
                {''.join(rendered_items)}
              </ul>
            </section>
            """
        if section_type == "table":
            headers = section.get("headers", []) if isinstance(section.get("headers", []), list) else []
            rows = section.get("rows", []) if isinstance(section.get("rows", []), list) else []
            return f"""
            <div class="chapter-overview__table-wrap">
              <table class="chapter-overview__table">
                <thead><tr>{''.join(f'<th>{escape(str(header))}</th>' for header in headers)}</tr></thead>
                <tbody>
                  {''.join(
                      '<tr>' + ''.join(f'<td>{self._render_rich_multiline(cell)}</td>' for cell in (row if isinstance(row, list) else [])) + '</tr>'
                      for row in rows
                  )}
                </tbody>
              </table>
            </div>
            """
        if section_type == "pdf-page":
            pdf_src = self._resolve_media_src(section.get("src", ""))
            if not pdf_src:
                return ""
            note = str(section.get("note", "")).strip() or default_pdf_note
            return f"""
            <div class="chapter-overview__pdf-wrap">
              <iframe loading="lazy" class="chapter-overview__pdf" title="{escape(note)}" src="{escape(pdf_src)}"></iframe>
              <div class="chapter-overview__pdf-actions">
                <p class="detail-note">{escape(note)}</p>
                <a class="ghost-link" href="{escape(pdf_src)}" target="_blank" rel="noopener noreferrer">在 Edge 另開</a>
              </div>
            </div>
            """
        if section_type == "image":
            image_src = self._resolve_media_src(section.get("src", ""))
            if not image_src:
                return ""
            caption = str(section.get("caption", "")).strip() or default_pdf_note
            return f"""
            <figure class="chapter-overview__image-wrap">
              <img class="chapter-overview__image" src="{escape(image_src)}" alt="{escape(caption)}" />
            </figure>
            """
        return ""

    def _render_preview_overview_segment(self, label: str, sections, empty_text: str):
        safe_sections = [section for section in (sections or []) if isinstance(section, dict)]
        return f"""
        <section class="chapter-overview__segment">
          <div class="chapter-overview__segment-header">
            <div><p class="summary-label">{escape(label)}</p></div>
          </div>
          <div class="chapter-overview__segment-body">
            {''.join(self._render_preview_overview_section(section, label) for section in safe_sections) if safe_sections else f"<p class='empty-state chapter-overview__empty'>{escape(empty_text)}</p>"}
          </div>
        </section>
        """

    def _render_preview_variant_tabs(self, variants, active_variant):
        variant_list = variants if isinstance(variants, list) else []
        if not variant_list:
            return ""
        active_id = str(active_variant.get("id", "")).strip() if isinstance(active_variant, dict) else ""
        return f"""
        <div class="chapter-overview__variant-tabs">
          {''.join(
              f"<button type='button' class='ghost-button {'is-active' if str(variant.get('id', '')).strip() == active_id else ''}'>{escape(str(variant.get('label', '')).strip() or str(variant.get('id', '')).strip() or '版本')}</button>"
              for variant in variant_list if isinstance(variant, dict)
          )}
        </div>
        """

    def _build_overview_preview_panel_html(self, item: dict):
        variants = item.get("variants", []) if isinstance(item.get("variants", []), list) else []
        active_variant = self._pick_preview_variant(variants, preferred_id="editable") or {"sections": []}
        key_sections = self._pick_preview_sections(variants, active_variant, lambda section: isinstance(section, dict) and section.get("type") == "paragraph")
        outline_sections = self._pick_preview_sections(variants, active_variant, lambda section: isinstance(section, dict) and section.get("type") and section.get("type") != "paragraph")
        return f"""
        <section class="panel chapter-overview-panel">
          <div class="chapter-overview__header">
            <div>
              <p class="summary-label">章節前言</p>
              <h3>章節大綱與最重要幾句話</h3>
            </div>
          </div>
          {self._render_preview_variant_tabs(variants, active_variant)}
          <div class="chapter-overview__body">
            {self._render_preview_overview_segment("最重要的幾句話", key_sections, "這個章節的前言還沒整理。")}
            {self._render_preview_overview_segment("章節大綱", outline_sections, "這個章節的大綱還沒整理。")}
          </div>
        </section>
        """

    def _build_main_topic_preview_panel_html(self, item: dict):
        variants = item.get("variants", []) if isinstance(item.get("variants", []), list) else []
        active_variant = self._pick_preview_variant(variants, preferred_id="editable") or {"sections": []}
        sections = self._pick_preview_sections(variants, active_variant, lambda section: isinstance(section, dict) and section.get("type"))
        title = str(item.get("title", "")).strip() or "主題整理"
        return f"""
        <section class="panel chapter-overview-panel">
          <div class="chapter-overview__header">
            <div>
              <p class="summary-label">主題整理</p>
              <h3>{escape(title)}</h3>
            </div>
          </div>
          {self._render_preview_variant_tabs(variants, active_variant)}
          <div class="chapter-overview__body">
            {''.join(self._render_preview_overview_section(section, title) for section in sections) if sections else "<p class='empty-state chapter-overview__empty'>這個主題還沒有整理內容。</p>"}
          </div>
        </section>
        """

    def _build_generated_outline_sections_from_code(self, chapter_code: str):
        chapter_code = str(chapter_code or "").strip()
        if not chapter_code:
            return []
        topic_lookup = self._topic_lookup()
        topics = [
            topic for topic in topic_lookup.values()
            if isinstance(topic, dict)
            and str(topic.get("chapterCode") or topic.get("chapter_code") or "").strip() == chapter_code
            and not str(topic.get("parentId", "")).strip()
        ]
        topics.sort(key=lambda item: self._row_sort_key(item))
        if not topics:
            return []
        rows = []
        for topic in topics:
            topic_id = str(topic.get("id", "")).strip()
            children = [
                child for child in topic_lookup.values()
                if isinstance(child, dict) and str(child.get("parentId", "")).strip() == topic_id
            ]
            child_titles = [str(child.get("title", "")).strip() for child in children if str(child.get("title", "")).strip()]
            rows.append([
                str(topic.get("title", "")).strip() or topic_id,
                str(topic.get("chapterRole", "")).strip() or ("主題" if child_titles else "主題入口"),
                "、".join(child_titles) if child_titles else "先從這個主題開始",
            ])
        return [{
            "type": "table",
            "headers": ["主題", "角色", "下一層 / 提醒"],
            "rows": rows,
        }]

    def _build_overview_body_preview_panel_html(self, item: dict):
        variants = item.get("variants", []) if isinstance(item.get("variants", []), list) else []
        active_variant = self._pick_preview_variant(variants, preferred_id="editable") or {"sections": []}
        sections = self._pick_preview_sections(variants, active_variant, lambda section: isinstance(section, dict) and section.get("type"))
        chapter_code = str(item.get("id", "")).strip()
        generated_sections = self._build_generated_outline_sections_from_code(chapter_code) if item.get("appendGeneratedOutline") else []
        return f"""
        <section class="panel chapter-overview-panel">
          <div class="chapter-overview__header">
            <div>
              <p class="summary-label">章節正文</p>
              <h3>{escape(str(item.get("title", "")).strip() or "章節正文")}</h3>
            </div>
          </div>
          {self._render_preview_variant_tabs(variants, active_variant)}
          <div class="chapter-overview__body">
            {self._render_preview_overview_segment(str(active_variant.get("label", "")).strip() or "章節正文", sections, "這個章節的正文還沒整理。")}
            {self._render_preview_overview_segment("自動生成章節大綱", generated_sections, "這個章節目前還沒有可生成的大綱。") if item.get("appendGeneratedOutline") else ""}
          </div>
        </section>
        """

    def _build_closing_preview_panel_html(self, item: dict):
        variants = item.get("variants", []) if isinstance(item.get("variants", []), list) else []
        active_variant = self._pick_preview_variant(variants, preferred_id="editable") or {"sections": []}
        sections = self._pick_preview_sections(variants, active_variant, lambda section: isinstance(section, dict) and section.get("type"))
        return f"""
        <section class="panel chapter-overview-panel chapter-overview-panel--closing">
          <div class="chapter-overview__body">
            {self._render_preview_overview_segment("最重要的幾句話", sections, "這個章節的後話還沒整理。")}
          </div>
        </section>
        """

    def _build_chapter_lesson_pack(self, chapter_code: str):
        chapter_code = str(chapter_code or "").strip()
        catalog = self.chapter_payload.get("catalog", {}) if isinstance(self.chapter_payload, dict) else {}
        chapter_meta = catalog.get(chapter_code, {}) if isinstance(catalog, dict) else {}

        topics = self.topic_payload.get("topics", []) if isinstance(self.topic_payload, dict) else []
        questions = self.question_payload.get("questions", []) if isinstance(self.question_payload, dict) else []

        topic_by_id = {
            str(t.get("id", "")).strip(): t
            for t in topics
            if isinstance(t, dict) and str(t.get("id", "")).strip()
        }
        chapter_questions_all = [
            q for q in questions
            if isinstance(q, dict) and str(q.get("chapter_code", "")).strip() == chapter_code
        ]

        chapter_level_categories = {"綜合", "段考", "歷屆", "模考"}
        topic_question_ids = defaultdict(list)
        chapter_questions = []
        topic_order = []

        for question in chapter_questions_all:
            question_id = str(question.get("id", "")).strip()
            formula_id = str(question.get("formula_id", "") or question.get("formulaId", "")).strip()
            category = str(question.get("question_category", "")).strip()
            if formula_id and formula_id in topic_by_id and category not in chapter_level_categories:
                if formula_id not in topic_order:
                    topic_order.append(formula_id)
                topic_question_ids[formula_id].append(question_id)
            else:
                chapter_questions.append(question)

        topic_packs = []
        used_for_mixed = set()

        for topic_id in topic_order:
            topic = topic_by_id.get(topic_id)
            if not topic:
                continue
            qids = topic_question_ids.get(topic_id, [])
            topic_questions = [
                q for q in chapter_questions_all
                if str(q.get("id", "")).strip() in qids
            ]
            topic_questions.sort(key=lambda q: (self._difficulty_rank(q.get("difficulty", "")), str(q.get("id", ""))))

            examples = [q for q in topic_questions if str(q.get("question_category", "")).strip() == "基本"]
            practices = [q for q in topic_questions if str(q.get("question_category", "")).strip() == "重要"]
            if not examples and topic_questions:
                examples = topic_questions[:2]
            if not practices and len(topic_questions) > len(examples):
                practices = topic_questions[len(examples):len(examples) + 6]

            for q in examples + practices:
                qid = str(q.get("id", "")).strip()
                if qid:
                    used_for_mixed.add(qid)
            topic_packs.append(
                {
                    "topic": topic,
                    "examples": examples[:4],
                    "practices": practices[:8],
                    "all_questions": topic_questions,
                }
            )

        chapter_questions.sort(key=lambda q: (self._difficulty_rank(q.get("difficulty", "")), str(q.get("id", ""))))
        mixed_questions = [q for q in chapter_questions if str(q.get("id", "")).strip() not in used_for_mixed][:12]
        if not mixed_questions:
            mixed_questions = chapter_questions[:12]

        return {
            "chapter_code": chapter_code,
            "chapter_meta": chapter_meta if isinstance(chapter_meta, dict) else {},
            "topics": topic_packs,
            "chapter_questions": chapter_questions,
            "mixed_questions": mixed_questions,
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        }

    def _lesson_preview_text(self, pack: dict):
        chapter_meta = pack.get("chapter_meta", {})
        chapter_name = chapter_meta.get("chapter") or chapter_meta.get("section") or "未命名章節"
        lines = [
            f"章節代號：{pack.get('chapter_code', '')}",
            f"章節名稱：{chapter_name}",
            f"主題數：{len(pack.get('topics', []))}",
            f"章節題目總數：{len(pack.get('chapter_questions', []))}",
            f"章節綜合練習數：{len(pack.get('mixed_questions', []))}",
            "",
            "主題與題目分布：",
        ]
        for idx, topic_pack in enumerate(pack.get("topics", []), start=1):
            topic = topic_pack.get("topic", {})
            title = str(topic.get("title", "")).strip() or str(topic.get("id", ""))
            lines.append(
                f"{idx}. {title}｜範例 {len(topic_pack.get('examples', []))} 題｜學生練習 {len(topic_pack.get('practices', []))} 題｜總題數 {len(topic_pack.get('all_questions', []))}"
            )
        if not pack.get("topics"):
            lines.append("（此章節目前沒有掛到主題或分支的題目）")
        return "\n".join(lines)

    def _build_lesson_print_html(self, pack: dict, show_answer: bool):
        chapter_meta = pack.get("chapter_meta", {})
        chapter_name = chapter_meta.get("chapter") or chapter_meta.get("section") or "未命名章節"
        mode_label = "教師版（含答案與詳解）" if show_answer else "學生版（不含答案）"

        topic_sections = []
        for idx, topic_pack in enumerate(pack.get("topics", []), start=1):
            topic = topic_pack.get("topic", {})
            badges = []
            for key in ["stage", "grade", "chapter", "difficulty", "domain"]:
                value = topic.get(key)
                if value:
                    badges.append(f"<span class='badge'>{escape(str(value))}</span>")
            badges_html = "".join(badges)
            topic_sections.append(
                f"""
                <article class="page">
                  <header>
                    <h2>主題 {idx}：{escape(str(topic.get("title", "")))}</h2>
                    <div class="id">ID: {escape(str(topic.get("id", "")))}</div>
                    <div class="badges">{badges_html}</div>
                  </header>
                  {self._topic_formula_block_html(topic)}
                  {self._topic_section_html("上課重點", topic.get("usage", []))}
                  {self._topic_section_html("解題提醒", topic.get("tips", []))}
                  <section class="block">
                    <h3>上課範例</h3>
                    {self._question_list_html(topic_pack.get("examples", []), show_answer=show_answer)}
                  </section>
                  <section class="block">
                    <h3>學生練習</h3>
                    {self._question_list_html(topic_pack.get("practices", []), show_answer=show_answer)}
                  </section>
                </article>
                """
            )

        chapter_practice = f"""
        <article class="page">
          <header>
            <h2>章節綜合練習</h2>
            <div class="id">章節代號：{escape(str(pack.get("chapter_code", "")))}</div>
          </header>
          {self._question_list_html(pack.get("mixed_questions", []), show_answer=show_answer)}
        </article>
        """

        pages = "\n".join(topic_sections + [chapter_practice])
        return f"""<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <title>{escape(str(pack.get('chapter_code', '')))} 講義</title>
  <script>
    window.MathJax = {{
      tex: {{ inlineMath: [['$','$'], ['\\\\(','\\\\)']], displayMath: [['$$','$$'], ['\\\\[','\\\\]']] }},
      svg: {{ fontCache: 'none' }}
    }};
  </script>
  <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
  <style>
    @page {{ size: A4; margin: 12mm; }}
    body {{ font-family: "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif; margin: 0; color: #2b2b2b; background: #f4efe5; }}
    .page {{ page-break-after: always; background: #fffdf8; border: 1px solid #e2d9c6; border-radius: 10px; padding: 16px 18px; min-height: 260mm; box-sizing: border-box; }}
    .page:last-child {{ page-break-after: auto; }}
    h1, h2 {{ margin: 0 0 6px; }}
    h1 {{ font-size: 26px; }}
    h2 {{ font-size: 22px; }}
    .id {{ color: #6f6658; font-size: 12px; margin-bottom: 8px; }}
    .subtitle {{ margin: 8px 0 12px; color: #5a4326; }}
    .badges {{ margin-bottom: 8px; }}
    .badge {{ display: inline-block; margin: 0 6px 6px 0; padding: 4px 10px; border-radius: 999px; background: #efe7d8; color: #7b5f3b; font-size: 12px; }}
    .block {{ margin-top: 12px; }}
    .block h3 {{ margin: 0 0 6px; font-size: 15px; color: #5a4326; }}
    ul {{ margin: 0; padding-left: 20px; }}
    li {{ margin: 3px 0; line-height: 1.45; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid #e7dece; padding: 7px; vertical-align: top; font-size: 13px; }}
    th {{ width: 30%; background: #f8f3e8; text-align: left; }}
    .math {{ font-family: "Times New Roman","Cambria Math","Noto Serif TC",serif; }}
    .question-list {{ margin: 0; padding-left: 22px; }}
    .question-item {{ margin-bottom: 10px; }}
    .question-title {{ margin: 0 0 3px; font-weight: 700; }}
    .question-text {{ margin: 0; line-height: 1.5; }}
    .qa-answer {{ margin-top: 6px; padding: 8px 10px; border-left: 3px solid #b07f3f; background: #fbf6ec; }}
    .qa-answer p {{ margin: 2px 0; }}
    .muted {{ color: #8a816f; font-size: 13px; }}
    .cover {{ display: flex; flex-direction: column; justify-content: center; }}
  </style>
</head>
<body>
  <article class="page cover">
    <h1>{escape(str(chapter_name))}</h1>
    <p class="subtitle">章節代號：{escape(str(pack.get("chapter_code", "")))}</p>
    <p class="subtitle">{escape(mode_label)}</p>
    <p class="subtitle">產生時間：{escape(str(pack.get("generated_at", "")))}</p>
    <p>主題數：{len(pack.get("topics", []))}｜章節題目總數：{len(pack.get("chapter_questions", []))}</p>
  </article>
  {pages}
</body>
</html>
"""

    def _build_gui_preview_html(self, item: dict):
        if self.mode == "questions":
            item_json = json.dumps(item, ensure_ascii=False)
            styles_uri = self._asset_uri("styles.css")
            qb_uri = self._asset_uri("question-bank.js")
            return f"""<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <title>GUI Preview</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="{ROOT.resolve().as_uri()}/" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
  <link rel="stylesheet" href="{styles_uri}" />
  <style>
    body {{ margin: 0; background: #f4efe5; }}
    .preview-wrap {{ padding: 18px; }}
  </style>
</head>
<body>
  <div class="preview-wrap">
    <div id="preview-root"></div>
  </div>
  <script>
    window.__guiPreviewQuestion = {item_json};
  </script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="{qb_uri}"></script>
  <script>
    function renderGuiPreview() {{
      var root = document.getElementById('preview-root');
      if (!root) return;
      if (!window.questionBankPreview || typeof window.questionBankPreview.renderQuestionCardHtml !== 'function') {{
        setTimeout(renderGuiPreview, 80);
        return;
      }}
      root.innerHTML = window.questionBankPreview.renderQuestionCardHtml(window.__guiPreviewQuestion || {{}}, {{
        showAllAnswers: true,
        showAnswerButtons: false,
        showDetails: true,
        showIndex: false
      }});
    }}
    window.addEventListener('load', renderGuiPreview);
  </script>
</body>
</html>
"""
        elif self.mode == "topics" or self._is_practice_mode():
            topic_item = item
            if self._is_practice_mode():
                topic_item = item.get("previewItem") or self._topic_lookup().get(str(item.get("id", "")).strip(), {})
            item_json = json.dumps(topic_item or {}, ensure_ascii=False)
            styles_uri = self._asset_uri("styles.css")
            formulas_uri = self._asset_uri("formulas.js")
            formula_content_uri = self._asset_uri("data/formula-content.js")
            question_content_uri = self._asset_uri("data/question-content.js")
            chapter_code_uri = self._asset_uri("data/chapter-code-config.js")
            formula_calculators_uri = self._asset_uri("data/formula-calculators.js")
            practice_assignment_uri = self._asset_uri("data/formula-practice-assignments.js")
            formula_practice_uri = self._asset_uri("data/formula-practice.js")
            practice_generator_bootstrap_uri = self._asset_uri("data/practice-generator-bootstrap.js")
            practice_generator_bundles_uri = self._asset_uri("data/practice-generator-bundles.js")
            practice_generator_loader_uri = self._asset_uri("data/practice-generator-loader.js")
            formula_data_uri = self._asset_uri("formula-data.js")
            formula_core_uri = self._asset_uri("formula-core.js")
            return f"""<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <title>GUI Preview</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="{ROOT.resolve().as_uri()}/" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
  <link rel="stylesheet" href="{styles_uri}" />
  <style>
    body {{ margin: 0; background: #f4efe5; }}
    .preview-wrap {{ padding: 18px; }}
  </style>
</head>
<body>
  <div class="preview-wrap">
    <div id="preview-root"></div>
  </div>
  <script>
    window.__guiPreviewTopic = {item_json};
  </script>
  <script defer src="{formulas_uri}"></script>
  <script defer src="{formula_content_uri}"></script>
  <script defer src="{question_content_uri}"></script>
  <script defer src="{chapter_code_uri}"></script>
  <script defer src="{formula_calculators_uri}"></script>
  <script defer src="{practice_assignment_uri}"></script>
  <script defer src="{formula_practice_uri}"></script>
  <script defer src="{practice_generator_bootstrap_uri}"></script>
  <script defer src="{practice_generator_bundles_uri}"></script>
  <script defer src="{practice_generator_loader_uri}"></script>
  <script defer src="{formula_data_uri}"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="{formula_core_uri}"></script>
  <script>
    async function renderGuiPreview() {{
      var root = document.getElementById('preview-root');
      if (!root) return;
      if (!window.formulaToolkit || typeof window.formulaToolkit.renderCard !== 'function') {{
        setTimeout(renderGuiPreview, 80);
        return;
      }}
      if (!window.__guiPreviewTopic || !window.__guiPreviewTopic.id) {{
        root.innerHTML = '<div class="formula-card"><p>這筆無限練習設定目前還沒有對應主題可預覽。</p></div>';
        return;
      }}
      if (window.practiceGeneratorLoader && typeof window.practiceGeneratorLoader.ensureForPractice === 'function') {{
        try {{
          await window.practiceGeneratorLoader.ensureForPractice(window.__guiPreviewTopic);
        }} catch (_error) {{
          // Keep preview rendering best-effort; formulaToolkit will still show fallback content.
        }}
      }}
      root.innerHTML = window.formulaToolkit.renderCard(window.__guiPreviewTopic || {{}}, {{
        showShareLink: false
      }});
      if (typeof window.formulaToolkit.bindInteractiveEvents === 'function') {{
        window.formulaToolkit.bindInteractiveEvents(root);
      }}
    }}
    window.addEventListener('load', renderGuiPreview);
  </script>
</body>
</html>
"""
        elif self.mode in {"overviews", "overview_bodies", "main_overviews", "closings"}:
            styles_uri = self._asset_uri("styles.css")
            if self.mode == "overviews":
                body = self._build_overview_preview_panel_html(item)
            elif self.mode == "overview_bodies":
                body = self._build_overview_body_preview_panel_html(item)
            elif self.mode == "main_overviews":
                body = self._build_main_topic_preview_panel_html(item)
            else:
                body = self._build_closing_preview_panel_html(item)
            return f"""<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <title>GUI Preview</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="{ROOT.resolve().as_uri()}/" />
  <script>
    window.MathJax = {{
      tex: {{ inlineMath: [['$','$'], ['\\\\(','\\\\)']], displayMath: [['$$','$$'], ['\\\\[','\\\\]']] }},
      svg: {{ fontCache: 'none' }}
    }};
  </script>
  <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
  <link rel="stylesheet" href="{styles_uri}" />
  <style>
    body {{ margin: 0; background: #f4efe5; }}
    .preview-wrap {{ padding: 18px; }}
  </style>
</head>
<body>
  <div class="preview-wrap">{body}</div>
</body>
</html>
"""
        else:
            body = f"<pre>{escape(json.dumps(item, ensure_ascii=False, indent=2))}</pre>"
        return f"""<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <title>GUI Preview</title>
  <script>
    window.MathJax = {{
      tex: {{ inlineMath: [['$','$'], ['\\\\(','\\\\)']], displayMath: [['$$','$$'], ['\\\\[','\\\\]']] }},
      svg: {{ fontCache: 'none' }}
    }};
  </script>
  <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
  <style>
    body {{ font-family: "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif; margin: 0; color: #2b2b2b; background: #f4efe5; }}
    .wrap {{ padding: 18px; }}
    .question-list {{ margin: 0; padding-left: 20px; }}
    .question-item {{ background: #fffdf8; border: 1px solid #e2d9c6; border-radius: 12px; padding: 16px; margin: 0 0 16px 0; }}
    .question-title {{ margin: 0 0 6px; font-size: 22px; font-weight: 700; }}
    .question-text, .qa-answer p {{ line-height: 1.7; font-size: 16px; }}
    .badge {{ display: inline-block; margin: 0 6px 6px 0; padding: 4px 10px; border-radius: 999px; background: #efe7d8; color: #7b5f3b; font-size: 12px; }}
    .math {{ font-family: "Times New Roman","Cambria Math","Noto Serif TC",serif; }}
    .block {{ margin-top: 12px; }}
    .block h3 {{ margin: 0 0 6px; font-size: 15px; color: #5a4326; }}
    ul {{ margin: 0; padding-left: 20px; }}
    li {{ margin: 3px 0; line-height: 1.45; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid #e7dece; padding: 7px; vertical-align: top; font-size: 13px; }}
    th {{ width: 30%; background: #f8f3e8; text-align: left; }}
    .inline-media {{ display: block; max-width: 100%; height: auto; margin: 8px 0; }}
    pre {{ white-space: pre-wrap; word-break: break-word; font-family: Consolas, monospace; background: #fffdf8; border: 1px solid #e2d9c6; border-radius: 10px; padding: 16px; }}
  </style>
</head>
<body><div class="wrap">{body}</div></body>
</html>
"""

    def _render_html_to_png(self, html: str, out_path: Path):
        edge = self._find_edge_exe()
        out_path = Path(out_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
            tmp.write(html)
            html_path = Path(tmp.name)
        if not edge:
            try:
                html_path.unlink(missing_ok=True)
            except Exception:
                pass
            return {"ok": False, "png": None, "reason": "edge-not-found"}
        try:
            subprocess.run(
                [
                    edge,
                    "--headless",
                    "--disable-gpu",
                    "--hide-scrollbars",
                    "--allow-file-access-from-files",
                    "--virtual-time-budget=5000",
                    "--window-size=1200,2200",
                    f"--screenshot={str(out_path)}",
                    html_path.as_uri(),
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return {"ok": True, "png": out_path, "reason": ""}
        except Exception as exc:
            return {"ok": False, "png": None, "reason": str(exc)}
        finally:
            try:
                html_path.unlink(missing_ok=True)
            except Exception:
                pass

    def _show_preview_message(self, text: str):
        self.preview_canvas.delete("all")
        self.preview_text_item = self.preview_canvas.create_text(
            16, 16, anchor="nw", text=text, fill="#555", width=max(self.preview_canvas.winfo_width() - 32, 500)
        )
        self.preview_canvas.configure(scrollregion=self.preview_canvas.bbox("all") or (0, 0, 800, 600))
        self.preview_photo = None

    def _display_preview_image(self, png_path: Path):
        if Image is not None and ImageTk is not None:
            img = Image.open(png_path)
            max_w = max(self.preview_canvas.winfo_width() - 24, 720)
            if img.width > max_w:
                ratio = max_w / img.width
                img = img.resize((int(img.width * ratio), int(img.height * ratio)))
            self.preview_photo = ImageTk.PhotoImage(img)
        else:
            self.preview_photo = tk.PhotoImage(file=str(png_path))
        self.preview_canvas.delete("all")
        self.preview_image_item = self.preview_canvas.create_image(12, 12, anchor="nw", image=self.preview_photo)
        self.preview_canvas.configure(scrollregion=self.preview_canvas.bbox("all") or (0, 0, 800, 600))

    def _current_editor_object(self):
        text = self.editor.get("1.0", "end").strip()
        if not text:
            return None, "編輯器目前沒有內容。"
        try:
            obj = json.loads(text)
        except json.JSONDecodeError as exc:
            return None, f"JSON 格式錯誤，暫時無法預覽：{exc}"
        if not isinstance(obj, dict):
            return None, "目前只支援預覽單一 JSON 物件。"
        return obj, ""

    def refresh_gui_preview(self):
        obj, error = self._current_editor_object()
        if error:
            self.preview_status_var.set("預覽不可用")
            self._show_preview_message(error)
            return
        html = self._build_gui_preview_html(obj)
        tmp_png = Path.cwd() / "exports" / "_gui-preview.png"
        result = self._render_html_to_png(html, tmp_png)
        if not result.get("ok"):
            self.preview_status_var.set("預覽失敗")
            reason = result.get("reason") or "unknown"
            self._show_preview_message(f"目前無法產生 GUI TeX 預覽。\n原因：{reason}")
            return
        self._display_preview_image(tmp_png)
        self.preview_status_var.set("預覽已更新")

    def _schedule_preview_refresh(self, delay_ms=500):
        if self.preview_after_id:
            try:
                self.root.after_cancel(self.preview_after_id)
            except Exception:
                pass
        self.preview_after_id = self.root.after(delay_ms, self.refresh_gui_preview)

    def _apply_editor_wrap(self):
        if getattr(self, "editor", None) is None:
            return
        self.editor.configure(wrap="word" if self.editor_wrap_var.get() else "none")

    def open_lesson_generator(self):
        chapter_codes = self._chapter_code_options()
        if not chapter_codes:
            return messagebox.showwarning("提示", "目前沒有章節代號可用，請先檢查 chapter-code-db.json")

        window = tk.Toplevel(self.root)
        window.title("講義產生器 v1")
        window.geometry("980x700")
        window.transient(self.root)
        window.grab_set()

        top = ttk.Frame(window, padding=10)
        top.pack(fill="x")
        ttk.Label(top, text="章節代號").pack(side="left")
        chapter_var = tk.StringVar(value=chapter_codes[0])
        code_combo = ttk.Combobox(top, textvariable=chapter_var, width=34, state="readonly")
        code_combo["values"] = chapter_codes
        code_combo.pack(side="left", padx=(6, 10))
        summary_var = tk.StringVar(value="請先選章節代號後按「更新預覽」。")
        ttk.Label(top, textvariable=summary_var).pack(side="left", padx=(0, 8))

        preview = tk.Text(window, wrap="word", font=("Consolas", 11))
        preview.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        button_row = ttk.Frame(window, padding=(10, 0, 10, 10))
        button_row.pack(fill="x")

        def refresh_preview(*_args):
            code = self._chapter_code_from_selection(chapter_var.get())
            pack = self._build_chapter_lesson_pack(code)
            window.lesson_pack = pack
            summary_var.set(
                f"主題 {len(pack.get('topics', []))} 個｜章節題目 {len(pack.get('chapter_questions', []))} 題｜綜合練習 {len(pack.get('mixed_questions', []))} 題"
            )
            preview.config(state="normal")
            preview.delete("1.0", "end")
            preview.insert("1.0", self._lesson_preview_text(pack))
            preview.config(state="disabled")

        def export_both_pdf():
            pack = getattr(window, "lesson_pack", None)
            if not pack:
                refresh_preview()
                pack = getattr(window, "lesson_pack", None)
            if not pack or not pack.get("topics"):
                return messagebox.showwarning("提示", "此章節目前沒有掛到主題或分支的題目。")

            toolchain = pdf_markdown_export.check_pdf_toolchain()
            if not toolchain["ok"]:
                return messagebox.showerror("找不到排版工具", toolchain["reason"])

            out_dir = filedialog.askdirectory(title="選擇講義輸出資料夾")
            if not out_dir:
                return
            out_dir = Path(out_dir)
            chapter_meta = pack.get("chapter_meta", {})
            chapter_name = chapter_meta.get("section") or chapter_meta.get("chapter") or pack.get("chapter_code", "chapter")
            safe_name = self._safe_filename(str(chapter_name))
            base = f"{pack.get('chapter_code', 'chapter')}_{safe_name}_講義"
            student_pdf = out_dir / f"{base}_學生版.pdf"
            teacher_pdf = out_dir / f"{base}_教師版.pdf"

            student_md = pdf_markdown_export.build_lesson_markdown(pack, show_answer=False)
            teacher_md = pdf_markdown_export.build_lesson_markdown(pack, show_answer=True)
            student_result = pdf_markdown_export.convert_markdown_to_pdf(student_md, student_pdf, title=f"{chapter_name}（學生版）")
            teacher_result = pdf_markdown_export.convert_markdown_to_pdf(teacher_md, teacher_pdf, title=f"{chapter_name}（教師版）")

            if student_result["ok"] and teacher_result["ok"]:
                self.status_var.set(f"講義輸出完成：{student_pdf.name}、{teacher_pdf.name}")
                return messagebox.showinfo("完成", f"已輸出：\n{student_pdf}\n{teacher_pdf}")

            errors = [x.get("reason", "") for x in [student_result, teacher_result] if not x.get("ok")]
            return messagebox.showerror("輸出失敗", "\n".join([e for e in errors if e]) or "未知錯誤")

        ttk.Button(button_row, text="更新預覽", style="Compact.TButton", command=refresh_preview).pack(side="left")
        ttk.Button(button_row, text="輸出學生版+教師版 PDF", style="Compact.TButton", command=export_both_pdf).pack(side="left", padx=(8, 0))
        ttk.Button(button_row, text="關閉", style="Compact.TButton", command=window.destroy).pack(side="right")

        code_combo.bind("<<ComboboxSelected>>", refresh_preview)
        refresh_preview()

    def export_selected_topics_pdf(self):
        if self.mode != "topics":
            return messagebox.showwarning("提醒", "請先切換到分支模式。")
        selected = self.tree.selection()
        if not selected:
            return messagebox.showwarning("提醒", "請先選取至少一個分支。")

        picked = []
        for s in selected:
            try:
                idx = int(s)
            except ValueError:
                continue
            if 0 <= idx < len(self.filtered):
                picked.append(self.filtered[idx])
        if not picked:
            return messagebox.showwarning("提醒", "目前選取項目無法匯出。")

        toolchain = pdf_markdown_export.check_pdf_toolchain()
        if not toolchain["ok"]:
            return messagebox.showerror("找不到排版工具", toolchain["reason"])

        out_path = filedialog.asksaveasfilename(
            title="匯出分支 PDF",
            defaultextension=".pdf",
            filetypes=[("PDF", "*.pdf")],
            initialfile="selected-topics.pdf",
        )
        if not out_path:
            return

        markdown_text = pdf_markdown_export.build_topics_markdown(picked)
        result = pdf_markdown_export.convert_markdown_to_pdf(markdown_text, Path(out_path), title="Selected Topics")
        if not result["ok"]:
            return messagebox.showerror("匯出失敗", result.get("reason", "") or "未知錯誤")

        self.status_var.set(f"PDF 匯出完成：{len(picked)} 筆 -> {out_path}")
        messagebox.showinfo("完成", f"已輸出 PDF：{len(picked)} 筆主題。")

    def export_selected_pdf(self):
        if self.mode == "topics":
            return self.export_selected_topics_pdf()
        if self.mode != "practice_records":
            return messagebox.showwarning("提醒", "請先切換到『練習本體』模式，再選取要匯出的無限練習。")
        return self.export_selected_practices_pdf()

    def _selected_practice_records_for_pdf(self):
        return self._selected_practice_record_rows()

    def _open_practice_pdf_count_dialog(self, records: list[dict]):
        result = {"options": None}
        dialog = tk.Toplevel(self.root)
        dialog.title("設定無限練習匯出")
        dialog.transient(self.root)
        dialog.grab_set()
        dialog.geometry("780x650")
        dialog.minsize(700, 540)
        dialog.resizable(True, True)

        mode_var = tk.StringVar(value="same")
        export_order_var = tk.StringVar(value="interleaved")
        answer_mode_var = tk.StringVar(value="both")
        question_gap_mm_var = tk.StringVar(value="10")
        same_count_var = tk.StringVar(value="20")
        entry_vars: dict[str, tk.StringVar] = {}

        header = ttk.Frame(dialog, padding=12)
        header.pack(fill="x")
        ttk.Label(
            header,
            text="請選擇每個無限練習要出幾題，並設定題目與答案的輸出順序。",
        ).pack(anchor="w")

        mode_box = ttk.LabelFrame(dialog, text="題數模式", padding=12)
        mode_box.pack(fill="x", padx=12, pady=(0, 8))
        ttk.Radiobutton(mode_box, text="全部固定同一個數字", variable=mode_var, value="same").pack(anchor="w")
        same_row = ttk.Frame(mode_box)
        same_row.pack(fill="x", pady=(4, 10))
        ttk.Label(same_row, text="固定題數").pack(side="left")
        same_entry = ttk.Entry(same_row, textvariable=same_count_var, width=8)
        same_entry.pack(side="left", padx=(8, 0))
        ttk.Radiobutton(mode_box, text="每一個無限練習各自指定題數", variable=mode_var, value="custom").pack(anchor="w")

        order_box = ttk.LabelFrame(dialog, text="輸出順序", padding=12)
        order_box.pack(fill="x", padx=12, pady=(0, 8))
        ttk.Radiobutton(
            order_box,
            text="全部題目在前，全部答案在後",
            variable=export_order_var,
            value="separate",
        ).pack(anchor="w")
        ttk.Radiobutton(
            order_box,
            text="一類題目 + 一類答案，再下一類題目 + 答案",
            variable=export_order_var,
            value="interleaved",
        ).pack(anchor="w", pady=(4, 0))

        answer_box = ttk.LabelFrame(dialog, text="答案內容", padding=12)
        answer_box.pack(fill="x", padx=12, pady=(0, 8))
        ttk.Radiobutton(answer_box, text="簡答", variable=answer_mode_var, value="simple").pack(anchor="w")
        ttk.Radiobutton(answer_box, text="詳解", variable=answer_mode_var, value="detail").pack(anchor="w", pady=(4, 0))
        ttk.Radiobutton(answer_box, text="簡答＋詳解都要", variable=answer_mode_var, value="both").pack(anchor="w", pady=(4, 0))

        layout_box = ttk.LabelFrame(dialog, text="版面間距", padding=12)
        layout_box.pack(fill="x", padx=12, pady=(0, 8))
        spacing_row = ttk.Frame(layout_box)
        spacing_row.pack(fill="x")
        ttk.Label(spacing_row, text="每題下方留白高度").pack(side="left")
        ttk.Entry(spacing_row, textvariable=question_gap_mm_var, width=8).pack(side="left", padx=(8, 4))
        ttk.Label(spacing_row, text="mm（可填 0～80；0 代表不留白，答案卷不受影響）").pack(side="left")

        button_bar = ttk.Frame(dialog, padding=(12, 0, 12, 12))
        button_bar.pack(side="bottom", fill="x")

        list_box = ttk.LabelFrame(dialog, text="已選取的練習", padding=12)
        list_box.pack(fill="both", expand=True, padx=12, pady=(0, 8))

        canvas = tk.Canvas(list_box, highlightthickness=0)
        scroll = ttk.Scrollbar(list_box, orient="vertical", command=canvas.yview)
        inner = ttk.Frame(canvas)
        inner.bind("<Configure>", lambda _e: canvas.configure(scrollregion=canvas.bbox("all")))
        window_id = canvas.create_window((0, 0), window=inner, anchor="nw")
        canvas.bind("<Configure>", lambda e: canvas.itemconfigure(window_id, width=e.width))
        canvas.configure(yscrollcommand=scroll.set)
        canvas.pack(side="left", fill="both", expand=True)
        scroll.pack(side="right", fill="y")

        for idx, record in enumerate(records, start=1):
            rid = str(record.get("id", "")).strip()
            title = str(record.get("title", "")).strip() or rid
            default_count = int(record.get("questionCount", 0) or 5)
            row = ttk.Frame(inner)
            row.pack(fill="x", pady=3)
            ttk.Label(row, text=f"{idx}. {title}", width=52).pack(side="left", anchor="w")
            var = tk.StringVar(value=str(default_count))
            entry_vars[rid] = var
            ttk.Entry(row, textvariable=var, width=8).pack(side="left", padx=(8, 0))

        def toggle_state(*_args):
            state = "normal" if mode_var.get() == "same" else "disabled"
            same_entry.configure(state=state)
            custom_state = "disabled" if mode_var.get() == "same" else "normal"
            for child in inner.winfo_children():
                for widget in child.winfo_children():
                    if isinstance(widget, ttk.Entry):
                        widget.configure(state=custom_state)

        mode_var.trace_add("write", toggle_state)
        toggle_state()

        def apply_counts():
            try:
                if mode_var.get() == "same":
                    count = int(str(same_count_var.get()).strip() or "0")
                    if count <= 0:
                        raise ValueError
                    counts = {
                        str(record.get("id", "")).strip(): count
                        for record in records
                    }
                else:
                    counts = {}
                    for record in records:
                        rid = str(record.get("id", "")).strip()
                        count = int(str(entry_vars[rid].get()).strip() or "0")
                        if count <= 0:
                            raise ValueError
                        counts[rid] = count
            except ValueError:
                return messagebox.showerror("題數錯誤", "題數請填正整數。", parent=dialog)
            try:
                question_gap_mm = float(str(question_gap_mm_var.get()).strip() or "0")
                if question_gap_mm < 0 or question_gap_mm > 80:
                    raise ValueError
            except ValueError:
                return messagebox.showerror("間距錯誤", "每題下方留白高度請填 0～80 的數字（mm）。", parent=dialog)
            result["options"] = {
                "counts": counts,
                "export_order": export_order_var.get() if export_order_var.get() in {"separate", "interleaved"} else "separate",
                "answer_mode": answer_mode_var.get() if answer_mode_var.get() in {"simple", "detail", "both"} else "detail",
                "question_gap_mm": question_gap_mm,
            }
            dialog.destroy()

        ttk.Button(button_bar, text="取消", command=dialog.destroy).pack(side="right", padx=(8, 0))
        ttk.Button(button_bar, text="確認匯出", style="Compact.TButton", command=apply_counts).pack(side="right")
        dialog.bind("<Return>", lambda _event: apply_counts())
        dialog.bind("<Escape>", lambda _event: dialog.destroy())
        same_entry.focus_set()

        dialog.wait_window()
        return result["options"]

    def _open_practice_export_format_dialog(self):
        result = {"format": None}
        dialog = tk.Toplevel(self.root)
        dialog.title("選擇匯出格式")
        dialog.transient(self.root)
        dialog.grab_set()
        dialog.geometry("420x180")
        dialog.resizable(False, False)

        body = ttk.Frame(dialog, padding=14)
        body.pack(fill="both", expand=True)
        ttk.Label(body, text="請選擇要匯出的格式：").pack(anchor="w", pady=(0, 10))

        button_row = ttk.Frame(body)
        button_row.pack(fill="x")

        def choose(fmt: str):
            result["format"] = fmt
            dialog.destroy()

        ttk.Button(button_row, text="只匯出 PDF", command=lambda: choose("pdf")).pack(side="left")
        ttk.Button(button_row, text="只匯出 MD", command=lambda: choose("md")).pack(side="left", padx=(8, 0))
        ttk.Button(button_row, text="PDF + MD", style="Compact.TButton", command=lambda: choose("both")).pack(side="left", padx=(8, 0))
        ttk.Button(body, text="取消", command=dialog.destroy).pack(anchor="e", pady=(12, 0))

        dialog.bind("<Escape>", lambda _event: dialog.destroy())
        dialog.wait_window()
        return result["format"]

    def _open_practice_batch_pdf_options_dialog(
        self,
        chain_count: int,
        subject_label: str = "自訂主題串",
        scope_options: dict | None = None,
    ):
        result = {"options": None}
        dialog = tk.Toplevel(self.root)
        subject_label = str(subject_label or "主題串").strip() or "主題串"
        dialog.title(f"批次匯出{subject_label}")
        dialog.transient(self.root)
        dialog.grab_set()
        dialog.geometry("640x640" if scope_options else "580x500")
        dialog.minsize(620 if scope_options else 560, 600 if scope_options else 460)
        dialog.resizable(True, True)

        count_var = tk.StringVar(value="10")
        export_format_var = tk.StringVar(value="pdf")
        export_order_var = tk.StringVar(value="interleaved")
        answer_mode_var = tk.StringVar(value="both")
        question_gap_mm_var = tk.StringVar(value="10")
        scope_mode_var = tk.StringVar(value="all")
        scope_target_var = tk.StringVar(value="")

        body = ttk.Frame(dialog, padding=14)
        body.pack(fill="both", expand=True)
        ttk.Label(
            body,
            text=f"將匯出 {max(0, int(chain_count or 0))} 份{subject_label}；每一串會依所選格式輸出。",
        ).pack(anchor="w", pady=(0, 10))

        scope_rows = scope_options if isinstance(scope_options, dict) else {}
        semester_rows = list(scope_rows.get("semesters") or [])
        chapter_rows = list(scope_rows.get("chapters") or [])
        semester_by_label = {str(row.get("label", "")).strip(): row for row in semester_rows}
        chapter_by_label = {str(row.get("label", "")).strip(): row for row in chapter_rows}
        if scope_rows:
            scope_box = ttk.LabelFrame(body, text="匯出範圍", padding=10)
            scope_box.pack(fill="x", pady=(0, 10))
            scope_top = ttk.Frame(scope_box)
            scope_top.pack(fill="x")
            ttk.Radiobutton(scope_top, text="全部", variable=scope_mode_var, value="all").pack(side="left")
            ttk.Radiobutton(scope_top, text="一個學期", variable=scope_mode_var, value="semester").pack(side="left", padx=(14, 0))
            ttk.Radiobutton(scope_top, text="一整章", variable=scope_mode_var, value="chapter").pack(side="left", padx=(14, 0))

            scope_pick_row = ttk.Frame(scope_box)
            scope_pick_row.pack(fill="x", pady=(8, 0))
            scope_pick_label = ttk.Label(scope_pick_row, text="選擇")
            scope_pick_label.pack(side="left")
            scope_target_combo = ttk.Combobox(scope_pick_row, textvariable=scope_target_var, state="readonly", width=48)
            scope_target_combo.pack(side="left", fill="x", expand=True, padx=(8, 0))

            def refresh_scope_targets(*_args):
                mode = scope_mode_var.get()
                if mode == "semester":
                    values = [str(row.get("label", "")).strip() for row in semester_rows if str(row.get("label", "")).strip()]
                    scope_target_combo.configure(state="readonly")
                    scope_pick_label.configure(text="學期")
                elif mode == "chapter":
                    values = [str(row.get("label", "")).strip() for row in chapter_rows if str(row.get("label", "")).strip()]
                    scope_target_combo.configure(state="readonly")
                    scope_pick_label.configure(text="章")
                else:
                    values = []
                    scope_target_combo.configure(state="disabled")
                    scope_pick_label.configure(text="選擇")
                scope_target_combo["values"] = values
                scope_target_var.set(values[0] if values else "")

            scope_mode_var.trace_add("write", refresh_scope_targets)
            refresh_scope_targets()

        format_box = ttk.LabelFrame(body, text="輸出格式", padding=10)
        format_box.pack(fill="x", pady=(0, 10))
        ttk.Radiobutton(format_box, text="只匯出 PDF", variable=export_format_var, value="pdf").pack(side="left")
        ttk.Radiobutton(format_box, text="只匯出 MD", variable=export_format_var, value="md").pack(side="left", padx=(14, 0))
        ttk.Radiobutton(format_box, text="PDF + MD", variable=export_format_var, value="both").pack(side="left", padx=(14, 0))

        count_row = ttk.Frame(body)
        count_row.pack(fill="x", pady=(0, 10))
        ttk.Label(count_row, text="每個題型題數").pack(side="left")
        ttk.Entry(count_row, textvariable=count_var, width=8).pack(side="left", padx=(8, 4))
        ttk.Label(count_row, text="題").pack(side="left")

        order_box = ttk.LabelFrame(body, text="輸出順序", padding=10)
        order_box.pack(fill="x", pady=(0, 10))
        ttk.Radiobutton(
            order_box,
            text="全部題目在前，全部答案在後",
            variable=export_order_var,
            value="separate",
        ).pack(anchor="w")
        ttk.Radiobutton(
            order_box,
            text="一類題目 + 一類答案，再下一類題目 + 答案",
            variable=export_order_var,
            value="interleaved",
        ).pack(anchor="w", pady=(4, 0))

        answer_box = ttk.LabelFrame(body, text="答案內容", padding=10)
        answer_box.pack(fill="x", pady=(0, 10))
        ttk.Radiobutton(answer_box, text="簡答", variable=answer_mode_var, value="simple").pack(side="left")
        ttk.Radiobutton(answer_box, text="詳解", variable=answer_mode_var, value="detail").pack(side="left", padx=(14, 0))
        ttk.Radiobutton(answer_box, text="簡答＋詳解都要", variable=answer_mode_var, value="both").pack(side="left", padx=(14, 0))

        gap_row = ttk.Frame(body)
        gap_row.pack(fill="x")
        ttk.Label(gap_row, text="每題下方留白").pack(side="left")
        ttk.Entry(gap_row, textvariable=question_gap_mm_var, width=8).pack(side="left", padx=(8, 4))
        ttk.Label(gap_row, text="mm（0～80）").pack(side="left")

        buttons = ttk.Frame(body)
        buttons.pack(fill="x", pady=(16, 0))

        def apply_options():
            try:
                question_count = int(str(count_var.get()).strip() or "0")
                if question_count <= 0:
                    raise ValueError
            except ValueError:
                return messagebox.showerror("題數錯誤", "每個題型題數請填正整數。", parent=dialog)
            try:
                question_gap_mm = float(str(question_gap_mm_var.get()).strip() or "0")
                if question_gap_mm < 0 or question_gap_mm > 80:
                    raise ValueError
            except ValueError:
                return messagebox.showerror("間距錯誤", "每題下方留白請填 0～80 的數字（mm）。", parent=dialog)
            scope_mode = scope_mode_var.get() if scope_rows else "all"
            scope_key = ""
            scope_label = ""
            if scope_mode == "semester":
                picked = semester_by_label.get(scope_target_var.get())
                if not picked:
                    return messagebox.showerror("範圍錯誤", "請選擇要匯出的學期。", parent=dialog)
                scope_key = str(picked.get("key", "")).strip()
                scope_label = str(picked.get("label", "")).strip()
            elif scope_mode == "chapter":
                picked = chapter_by_label.get(scope_target_var.get())
                if not picked:
                    return messagebox.showerror("範圍錯誤", "請選擇要匯出的整章。", parent=dialog)
                scope_key = str(picked.get("key", "")).strip()
                scope_label = str(picked.get("label", "")).strip()
            result["options"] = {
                "question_count": question_count,
                "export_format": export_format_var.get() if export_format_var.get() in {"pdf", "md", "both"} else "pdf",
                "export_order": export_order_var.get() if export_order_var.get() in {"separate", "interleaved"} else "interleaved",
                "answer_mode": answer_mode_var.get() if answer_mode_var.get() in {"simple", "detail", "both"} else "both",
                "question_gap_mm": question_gap_mm,
                "scope_mode": scope_mode,
                "scope_key": scope_key,
                "scope_label": scope_label,
            }
            dialog.destroy()

        ttk.Button(buttons, text="取消", command=dialog.destroy).pack(side="right", padx=(8, 0))
        ttk.Button(buttons, text="開始批次匯出", style="Compact.TButton", command=apply_options).pack(side="right")
        dialog.bind("<Return>", lambda _event: apply_options())
        dialog.bind("<Escape>", lambda _event: dialog.destroy())
        dialog.wait_window()
        return result["options"]

    def _build_practice_pdf_html(
        self,
        records: list[dict],
        counts: dict[str, int],
        show_answer: bool,
        seed: str = "",
        combined: bool = False,
        export_order: str = "separate",
        answer_mode: str = "detail",
        question_spacing_px: int = 18,
        markdown_gap_lines: int = 0,
    ):
        styles_uri = self._asset_uri("styles.css")
        formulas_uri = self._asset_uri("formulas.js")
        formula_content_uri = self._asset_uri("data/formula-content.js")
        question_content_uri = self._asset_uri("data/question-content.js")
        chapter_code_uri = self._asset_uri("data/chapter-code-config.js")
        formula_calculators_uri = self._asset_uri("data/formula-calculators.js")
        practice_assignment_uri = self._asset_uri("data/formula-practice-assignments.js")
        formula_practice_uri = self._asset_uri("data/formula-practice.js")
        practice_generator_bootstrap_uri = self._asset_uri("data/practice-generator-bootstrap.js")
        practice_generator_bundles_uri = self._asset_uri("data/practice-generator-bundles.js")
        practice_generator_loader_uri = self._asset_uri("data/practice-generator-loader.js")
        formula_data_uri = self._asset_uri("formula-data.js")
        formula_core_uri = self._asset_uri("formula-core.js")

        export_items = []
        for record in records:
            rid = str(record.get("id", "")).strip()
            preview = self._build_practice_preview_item(record)
            preview["id"] = rid
            export_items.append(
                {
                    "practiceId": rid,
                    "count": int(counts.get(rid, int(record.get("questionCount", 0) or 5))),
                    "item": preview,
                }
            )
        payload_json = json.dumps(export_items, ensure_ascii=False)
        seed_json = json.dumps(seed or "practice-pdf", ensure_ascii=False)
        title = "無限練習題目與答案" if combined else ("無限練習答案卷" if show_answer else "無限練習題目卷")
        show_answer_js = "true" if show_answer else "false"
        mode_js = json.dumps("combined" if combined else ("answer" if show_answer else "question"), ensure_ascii=False)
        export_order_js = json.dumps(export_order if export_order in {"separate", "interleaved"} else "separate", ensure_ascii=False)
        answer_mode_js = json.dumps(answer_mode if answer_mode in {"simple", "detail"} else "detail", ensure_ascii=False)
        try:
            question_spacing_px = max(0, min(80, int(question_spacing_px)))
        except (TypeError, ValueError):
            question_spacing_px = 18
        try:
            markdown_gap_lines = max(0, min(5, int(markdown_gap_lines)))
        except (TypeError, ValueError):
            markdown_gap_lines = 0
        markdown_gap_lines_js = json.dumps(markdown_gap_lines, ensure_ascii=False)
        return f"""<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <title>{escape(title)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="{ROOT.resolve().as_uri()}/" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
  <link rel="stylesheet" href="{styles_uri}" />
  <style>
    @page {{ size: A4; margin: 10mm; }}
    body {{ margin: 0; background: #f4efe5; color: #2b2b2b; }}
    .sheet-wrap {{ padding: 14px; }}
    .sheet-head {{ margin-bottom: 14px; padding: 10px 14px; border-radius: 10px; background: #fffdf8; border: 1px solid #e2d9c6; }}
    .sheet-head h1 {{ margin: 0 0 6px; font-size: 24px; }}
    .sheet-head p {{ margin: 0; color: #6f6658; font-size: 13px; }}
    .practice-list {{ display: flex; flex-direction: column; gap: 18px; }}
    .practice-pdf-part {{ display: flex; flex-direction: column; gap: 18px; }}
    .practice-pdf-part + .practice-pdf-part {{ margin-top: 22px; }}
    .practice-pdf-part.answer-part {{ break-before: page; page-break-before: always; }}
    .practice-pdf-part-title {{ margin: 0 0 2px; padding: 10px 14px; border-radius: 10px; background: #efe4d2; font-size: 20px; }}
    .practice-pdf-set {{ break-inside: avoid; page-break-inside: avoid; padding-bottom: 18px; }}
    .practice-pdf-set + .practice-pdf-set {{ margin-top: 22px; }}
    .practice-pdf-card {{ padding: 18px 18px; border-radius: 12px; background: #fffdf8; border: 1px solid #e2d9c6; break-inside: avoid; page-break-inside: avoid; }}
    .practice-pdf-card h2 {{ margin: 0 0 8px; font-size: 18px; }}
    .practice-pdf-card h3 {{ margin: 12px 0 8px; font-size: 16px; }}
    .practice-pdf-card ol {{ margin: 12px 0 0; padding-left: 1.8em; }}
    .practice-pdf-card li {{ margin: 0 0 {question_spacing_px}px; line-height: 2.0; }}
    .practice-intro {{ margin: 0 0 8px; color: #6f6658; }}
    .card-actions, .interactive-actions {{ display: none !important; }}
  </style>
</head>
<body>
  <div class="sheet-wrap">
    <div class="sheet-head">
      <h1>{escape(title)}</h1>
      <p>依所選無限練習自動生成；本 PDF 只生成一次資料，答案對應前方同一批題目。</p>
    </div>
    <div id="sheet-root" class="practice-list"></div>
    <pre id="practice-md-export" style="display:none;"></pre>
  </div>
  <script>
    window.__practicePdfItems = {payload_json};
    window.__practicePdfShowAnswer = {show_answer_js};
    window.__practicePdfSeed = {seed_json};
    window.__practicePdfMode = {mode_js};
    window.__practicePdfExportOrder = {export_order_js};
    window.__practicePdfAnswerMode = {answer_mode_js};
    window.__practicePdfMarkdownGapLines = {markdown_gap_lines_js};
  </script>
  <script defer src="{formulas_uri}"></script>
  <script defer src="{formula_content_uri}"></script>
  <script defer src="{question_content_uri}"></script>
  <script defer src="{chapter_code_uri}"></script>
  <script defer src="{formula_calculators_uri}"></script>
  <script defer src="{practice_assignment_uri}"></script>
  <script defer src="{formula_practice_uri}"></script>
  <script defer src="{practice_generator_bootstrap_uri}"></script>
  <script defer src="{practice_generator_bundles_uri}"></script>
  <script defer src="{practice_generator_loader_uri}"></script>
  <script defer src="{formula_data_uri}"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="{formula_core_uri}"></script>
  <script>
    function applyPracticeCountOverrides(items) {{
      var store = window.practiceLibraryStore;
      if (!store || !store.byId) return;
      (items || []).forEach(function(entry) {{
        var id = entry.practiceId;
        var nextCount = Number(entry.count || 0);
        if (!id || !store.byId[id] || !nextCount) return;
        store.byId[id].questionCount = nextCount;
      }});
    }}

    function makePracticePdfRandom(seedText) {{
      var seed = String(seedText || 'practice-pdf');
      var h = 2166136261 >>> 0;
      for (var i = 0; i < seed.length; i += 1) {{
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }}
      return function() {{
        h = (h + 0x6D2B79F5) >>> 0;
        var t = h;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }};
    }}

    function withPracticePdfRandom(seedText, callback) {{
      var originalRandom = Math.random;
      Math.random = makePracticePdfRandom(seedText);
      try {{
        return callback();
      }} finally {{
        Math.random = originalRandom;
      }}
    }}

    function escapePracticePdfHtml(value) {{
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }}

    function renderPracticePdfLine(value) {{
      var text = String(value == null ? '' : value);
      if (window.formulaToolkit && typeof window.formulaToolkit.renderRichTextLine === 'function') {{
        return window.formulaToolkit.renderRichTextLine(text);
      }}
      return escapePracticePdfHtml(text);
    }}

    function simplifyPracticeAnswer(value) {{
      var text = String(value == null ? '' : value).trim();
      if (!text || window.__practicePdfAnswerMode !== 'simple') return text;
      var answerMatch = text.match(/(?:簡答|答案)[:：]\\s*([\\s\\S]*?)(?=(?:。|；|\\n)?\\s*(?:過程|解析|詳解|說明)[:：]|$)/);
      if (answerMatch && answerMatch[1] && answerMatch[1].trim()) {{
        return answerMatch[1].trim();
      }}
      var parts = text.split(/(?:。|；|\\n)?\\s*(?:過程|解析|詳解|說明)[:：]/);
      return (parts[0] || text).trim();
    }}

    function getPracticeAnswerLines(set) {{
      return (set.answers || []).map(simplifyPracticeAnswer);
    }}

    function getPracticePdfConfig(entry) {{
      var id = entry && (entry.practiceId || (entry.item && entry.item.id));
      if (!id || !window.formulaPracticeStore || typeof window.formulaPracticeStore.getConfig !== 'function') return null;
      return window.formulaPracticeStore.getConfig(id);
    }}

    function generatePracticePdfSets(items) {{
      return (items || []).map(function(entry, index) {{
        var item = entry.item || {{ id: entry.practiceId }};
        var config = getPracticePdfConfig(entry) || {{}};
        var id = entry.practiceId || item.id || String(index);
        var title = config.title || item.title || id || '無限練習';
        if (config.type === 'fixed-example') {{
          return {{
            practiceId: id,
            title: title,
            intro: '',
            questions: [config.prompt || '尚未設定題目'],
            answers: [config.answer || '尚未設定答案']
          }};
        }}
        var generated = {{}};
        if (typeof config.generate === 'function') {{
          generated = withPracticePdfRandom(window.__practicePdfSeed + '|' + index + '|' + id, function() {{
            return config.generate(item) || {{}};
          }}) || {{}};
        }}
        return {{
          practiceId: id,
          title: title,
          intro: typeof generated.intro === 'string' ? generated.intro : '',
          questions: Array.isArray(generated.questions) ? generated.questions : [],
          answers: Array.isArray(generated.answers) ? generated.answers : []
        }};
      }});
    }}

    function renderPracticePdfCard(set, showAnswer) {{
      var list = showAnswer ? getPracticeAnswerLines(set) : set.questions;
      var emptyText = showAnswer ? '目前沒有答案。' : '目前沒有產生題目。';
      var body = list.length
        ? '<ol>' + list.map(function(line) {{ return '<li>' + renderPracticePdfLine(line) + '</li>'; }}).join('') + '</ol>'
        : '<p>' + emptyText + '</p>';
      var intro = set.intro && !showAnswer ? '<p class="practice-intro">' + renderPracticePdfLine(set.intro) + '</p>' : '';
      return '<section class="practice-pdf-card" data-practice-id="' + escapePracticePdfHtml(set.practiceId) + '">' +
        '<h2>' + escapePracticePdfHtml(set.title) + '</h2>' +
        intro +
        body +
        '</section>';
    }}

    function cleanPracticeMarkdownText(value) {{
      return String(value == null ? '' : value).replace(/\\r\\n/g, '\\n').replace(/\\n{{3,}}/g, '\\n\\n').trim();
    }}

    function pushPracticeMarkdownItems(lines, values, gapOverride) {{
      var gapLines = gapOverride == null
        ? Math.max(0, Math.min(5, Number(window.__practicePdfMarkdownGapLines || 0)))
        : Math.max(0, Math.min(5, Number(gapOverride || 0)));
      (values || []).forEach(function(value, idx) {{
        lines.push((idx + 1) + '. ' + cleanPracticeMarkdownText(value));
        for (var gap = 0; gap < gapLines; gap += 1) {{
          lines.push('&nbsp;');
        }}
      }});
    }}

    function buildPracticeMarkdown(generatedSets) {{
      var lines = [];
      lines.push('# ' + {json.dumps(title, ensure_ascii=False)});
      lines.push('');
      if (window.__practicePdfExportOrder === 'interleaved') {{
        generatedSets.forEach(function(set) {{
          lines.push('## ' + set.title);
          lines.push('');
          lines.push('### 題目');
          lines.push('');
          if (set.intro) {{
            lines.push(cleanPracticeMarkdownText(set.intro));
            lines.push('');
          }}
          pushPracticeMarkdownItems(lines, set.questions);
          lines.push('');
          lines.push('### 答案');
          lines.push('');
          pushPracticeMarkdownItems(lines, getPracticeAnswerLines(set), 0);
          lines.push('');
        }});
        return lines.join('\\n').trim() + '\\n';
      }}
      lines.push('## 題目');
      lines.push('');
      generatedSets.forEach(function(set) {{
        lines.push('### ' + set.title);
        if (set.intro) {{
          lines.push(cleanPracticeMarkdownText(set.intro));
          lines.push('');
        }}
        pushPracticeMarkdownItems(lines, set.questions);
        lines.push('');
      }});
      lines.push('## 答案');
      lines.push('');
      generatedSets.forEach(function(set) {{
        lines.push('### ' + set.title);
        pushPracticeMarkdownItems(lines, getPracticeAnswerLines(set), 0);
        lines.push('');
      }});
      return lines.join('\\n').trim() + '\\n';
    }}

    async function renderPracticePdf() {{
      var root = document.getElementById('sheet-root');
      if (!root) return;
      if (!window.formulaToolkit || typeof window.formulaToolkit.renderRichTextLine !== 'function') {{
        setTimeout(renderPracticePdf, 80);
        return;
      }}
      var items = Array.isArray(window.__practicePdfItems) ? window.__practicePdfItems : [];
      if (window.practiceGeneratorLoader && typeof window.practiceGeneratorLoader.ensureForPractices === 'function') {{
        try {{
          await window.practiceGeneratorLoader.ensureForPractices(
            items.map(function(entry) {{
              return entry && entry.item ? entry.item : {{ id: entry && entry.practiceId ? entry.practiceId : '' }};
            }})
          );
        }} catch (_error) {{
          // Keep export rendering best-effort so fixed-example items can still render.
        }}
      }}
      applyPracticeCountOverrides(items);
      var generatedSets = generatePracticePdfSets(items);
      window.__practicePdfGeneratedSets = generatedSets;
      var mdNode = document.getElementById('practice-md-export');
      if (mdNode) mdNode.textContent = buildPracticeMarkdown(generatedSets);
      if (window.__practicePdfMode === 'combined') {{
        if (window.__practicePdfExportOrder === 'interleaved') {{
          root.innerHTML = generatedSets.map(function(set, idx) {{
            return '<section class="practice-pdf-set">' +
              '<h2 class="practice-pdf-part-title">題型 ' + (idx + 1) + '：' + escapePracticePdfHtml(set.title) + '</h2>' +
              renderPracticePdfCard(set, false) +
              renderPracticePdfCard(set, true) +
              '</section>';
          }}).join('');
          return;
        }}
        root.innerHTML =
          '<section class="practice-pdf-part question-part"><h2 class="practice-pdf-part-title">題目</h2>' +
          generatedSets.map(function(set) {{ return renderPracticePdfCard(set, false); }}).join('') +
          '</section>' +
          '<section class="practice-pdf-part answer-part"><h2 class="practice-pdf-part-title">答案</h2>' +
          generatedSets.map(function(set) {{ return renderPracticePdfCard(set, true); }}).join('') +
          '</section>';
        return;
      }}
      root.innerHTML = generatedSets.map(function(set) {{
        return renderPracticePdfCard(set, Boolean(window.__practicePdfShowAnswer));
      }}).join('');
    }}
    window.addEventListener('load', renderPracticePdf);
  </script>
</body>
</html>
"""

    def export_selected_practices_pdf(self):
        records = self._selected_practice_records_for_pdf()
        if not records:
            return messagebox.showwarning("提醒", "請先在『練習本體』模式選取至少一筆無限練習。")
        default_base_name = (
            self._safe_filename(str(records[0].get("title", "")).strip() or "practice")
            if len(records) == 1
            else f"selected-practices-{len(records)}"
        )
        return self._run_practice_records_export(records, default_base_name, "無限練習題目與答案")

    def _run_practice_records_export(self, records: list[dict], default_base_name: str, combined_title: str):
        """共用的無限練習匯出流程：題數設定 → 格式選擇 → 生成 → PDF/MD 輸出。

        `export_selected_practices_pdf`（練習本體多選）與主題串匯出都走這裡。
        """
        export_options = self._open_practice_pdf_count_dialog(records)
        if not export_options:
            return
        counts = export_options.get("counts", {})
        export_order = export_options.get("export_order", "separate")
        answer_mode = export_options.get("answer_mode", "detail")
        question_gap_mm = export_options.get("question_gap_mm", 0)

        export_format = self._open_practice_export_format_dialog()
        if not export_format:
            return

        if export_format in {"pdf", "both"}:
            toolchain = pdf_markdown_export.check_pdf_toolchain()
            if not toolchain["ok"]:
                return messagebox.showerror("找不到排版工具", toolchain["reason"])

        out_dir = filedialog.askdirectory(title="選擇無限練習 PDF 輸出資料夾")
        if not out_dir:
            return
        out_dir = Path(out_dir)

        date_prefix = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = self._safe_filename(f"{date_prefix}_{default_base_name}")

        combined_pdf = out_dir / f"{base_name}_題目與答案.pdf"
        combined_md = out_dir / f"{base_name}_題目與答案.md"
        export_seed = "practice-pdf|" + datetime.now().isoformat(timespec="microseconds")
        combined_title = str(combined_title or "無限練習題目與答案").strip() or "無限練習題目與答案"
        markdown_result = self._generate_practice_export_markdown(
            records,
            counts,
            combined_title,
            export_order,
            answer_mode,
            question_gap_mm,
            export_seed,
        )
        if not markdown_result.get("ok"):
            return messagebox.showerror("輸出失敗", markdown_result.get("reason", "") or "未知錯誤")
        markdown_text = markdown_result.get("markdown", "")

        if export_format == "md":
            combined_md.write_text(markdown_text, encoding="utf-8")
            self.status_var.set(f"無限練習 MD 匯出完成：{combined_md.name}")
            return messagebox.showinfo("完成", f"已輸出：\n{combined_md}")

        combined_result = pdf_markdown_export.convert_markdown_to_pdf(markdown_text, combined_pdf, title=combined_title)
        if not combined_result.get("ok"):
            return messagebox.showerror("輸出失敗", combined_result.get("reason", "") or "未知錯誤")

        if export_format == "pdf":
            self.status_var.set(f"無限練習 PDF 匯出完成：{combined_pdf.name}")
            return messagebox.showinfo("完成", f"已輸出：\n{combined_pdf}")

        try:
            combined_md.write_text(markdown_text, encoding="utf-8")
            self.status_var.set(f"無限練習匯出完成：{combined_pdf.name}、{combined_md.name}")
            return messagebox.showinfo("完成", f"已輸出：\n{combined_pdf}\n{combined_md}")
        except Exception as exc:
            self.status_var.set(f"無限練習 PDF 匯出完成：{combined_pdf.name}（MD 失敗）")
            return messagebox.showwarning("部分完成", f"已輸出 PDF：\n{combined_pdf}\n\n但 Markdown 匯出失敗：\n{exc}")

    # ── 主題串（program-db/database/practice-theme-db.json）────────────────────

    def _theme_db_load(self):
        try:
            payload = json.loads(THEME_DB_DEFAULT.read_text(encoding="utf-8-sig"))
        except Exception:
            return {"meta": {}, "themeChains": []}
        chains = payload.get("themeChains")
        payload["themeChains"] = [c for c in chains if isinstance(c, dict)] if isinstance(chains, list) else []
        return payload

    def _theme_db_save(self, payload: dict):
        chains = payload.get("themeChains", [])
        stamp = practice_now_iso()
        meta = payload.get("meta") or {}
        practice_id_count = sum(len(c.get("practiceIds", []) or []) for c in chains)
        meta.update(
            {
                "schema": "practice-theme-db-v1",
                "source": "program-db/database/practice-db.json",
                "chainCount": len(chains),
                "practiceIdCount": practice_id_count,
                "updatedAt": stamp,
            }
        )
        payload["meta"] = meta
        THEME_DB_DEFAULT.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        # 同步網頁 bridge（data/practice-theme-chains.js）
        banner = (
            "// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n"
            "// Source: program-db/database/practice-theme-db.json\n"
            f"// 主題串數：{len(chains)}、題型總數：{practice_id_count}\n"
            f"// 最後更新：{stamp}\n"
        )
        THEME_BRIDGE_JS_DEFAULT.write_text(
            banner
            + "window.practiceThemeChainData = "
            + json.dumps(chains, ensure_ascii=False, indent=2)
            + ";\n",
            encoding="utf-8",
        )

    def open_theme_chain_export_dialog(self):
        payload = self._theme_db_load()
        chains = payload.get("themeChains", [])
        if not chains:
            return messagebox.showwarning(
                "提醒",
                "找不到主題串資料庫（program-db/database/practice-theme-db.json）。\n"
                "請先在專案根目錄執行：\n"
                "node scripts/build-practice-theme-chains.mjs --seed",
            )

        practice_by_id = {
            str(row.get("id", "")).strip(): row
            for row in self.practice_payload.get("practices", [])
            if isinstance(row, dict) and str(row.get("id", "")).strip()
        }

        dialog = tk.Toplevel(self.root)
        dialog.title("主題串匯出 PDF")
        dialog.transient(self.root)
        dialog.grab_set()
        dialog.geometry("860x640")
        dialog.minsize(760, 520)

        state = {"chain": None, "ids": [], "new_ids": set(), "units": [], "rows": []}

        top = ttk.Frame(dialog, padding=12)
        top.pack(fill="x")
        ttk.Label(top, text="選擇主題串（每個小章節一串）。內容即時讀練習本體：新題型自動附加在最後（標〔新〕），儲存後才併入排序。").pack(anchor="w")

        pick_row = ttk.Frame(dialog, padding=(12, 4))
        pick_row.pack(fill="x")
        keyword_var = tk.StringVar(value="")
        ttk.Label(pick_row, text="篩選").pack(side="left")
        keyword_entry = ttk.Entry(pick_row, textvariable=keyword_var, width=16)
        keyword_entry.pack(side="left", padx=(6, 10))
        chain_var = tk.StringVar(value="")
        chain_combo = ttk.Combobox(pick_row, textvariable=chain_var, state="readonly", width=52)
        chain_combo.pack(side="left", fill="x", expand=True)
        visible_chains = {"rows": list(chains)}

        info_var = tk.StringVar(value="")
        ttk.Label(dialog, textvariable=info_var, padding=(12, 2)).pack(anchor="w")
        rel_var = tk.StringVar(value="點選題型可查看大類/小類關係。")
        ttk.Label(dialog, textvariable=rel_var, padding=(12, 0), wraplength=800, justify="left").pack(anchor="w")

        children_by_parent, parents_by_child = self._practice_relation_maps()

        list_frame = ttk.Frame(dialog, padding=(12, 4))
        list_frame.pack(fill="both", expand=True)
        order_list = tk.Listbox(list_frame, activestyle="dotbox")
        order_scroll = ttk.Scrollbar(list_frame, orient="vertical", command=order_list.yview)
        order_list.configure(yscrollcommand=order_scroll.set)
        order_list.pack(side="left", fill="both", expand=True)
        order_scroll.pack(side="left", fill="y")

        # ── 資料夾式呈現：大類＝資料夾、小類＝檔案，一個檔案只屬一個資料夾 ──
        def build_units():
            ids = state["ids"]
            id_set = set(ids)
            units = []
            used = set()
            for pid in ids:
                if pid in used:
                    continue
                kids = [k for k in (children_by_parent.get(pid) or []) if k in id_set]
                if kids:
                    units.append({"id": pid, "children": kids})
                    used.add(pid)
                    used.update(kids)
                    continue
                owners = [o for o in (parents_by_child.get(pid) or []) if o in id_set]
                if owners:
                    continue  # 由所屬資料夾帶入
                units.append({"id": pid, "children": []})
                used.add(pid)
            state["units"] = units

        def flatten_units():
            flat = []
            for unit in state["units"]:
                flat.append(unit["id"])
                flat.extend(unit["children"])
            return flat

        def records_for_chain(chain: dict, ordered_ids: list[str] | None = None):
            ids = list(ordered_ids or [])
            if not ids:
                chapter_code = str(chain.get("chapterCode", "")).strip()
                ids = self._chapter_practice_ids_in_theme_order(chapter_code, practice_by_id)
            if not ids:
                ids = [str(pid).strip() for pid in chain.get("practiceIds", []) if str(pid).strip()]
            records = []
            for pid in ids:
                row = practice_by_id.get(pid)
                if row:
                    records.append(row)
                else:
                    records.append({"id": pid, "title": pid, "questionCount": chain.get("questionCount", 5)})
            return records

        def row_practice_id(row_index):
            if not (0 <= row_index < len(state["rows"])):
                return ""
            u_index, c_index = state["rows"][row_index]
            unit = state["units"][u_index]
            return unit["id"] if c_index is None else unit["children"][c_index]

        def on_order_select(_event=None):
            selection = order_list.curselection()
            if not selection:
                return
            pid = row_practice_id(selection[0])
            if pid:
                rel_var.set(self._practice_relation_text(pid, children_by_parent, parents_by_child, practice_by_id))

        order_list.bind("<<ListboxSelect>>", on_order_select)

        def display_chains(*_args):
            keyword = keyword_var.get().strip().lower()
            rows = [
                c
                for c in chains
                if not keyword
                or keyword in f"{c.get('id', '')} {c.get('title', '')} {c.get('chapterCode', '')}".lower()
            ]
            visible_chains["rows"] = rows
            chain_combo["values"] = [str(c.get("title") or c.get("id") or "") for c in rows]

        def practice_label(pid, prefix):
            row = practice_by_id.get(pid) or {}
            title = str(row.get("title", "")).strip() or pid
            difficulty = str(row.get("difficulty", "")).strip() or "-"
            new_marker = "〔新〕" if pid in state["new_ids"] else ""
            return f"{prefix}[{difficulty}] {new_marker}{title}"

        def refresh_order_list():
            order_list.delete(0, tk.END)
            state["rows"] = []
            for u_index, unit in enumerate(state["units"]):
                pid = unit["id"]
                if unit["children"]:
                    head = practice_label(pid, f"{u_index + 1:>3}. 📂 ")
                    order_list.insert(tk.END, f"{head}（含 {len(unit['children'])} 小類）")
                else:
                    order_list.insert(tk.END, practice_label(pid, f"{u_index + 1:>3}. "))
                state["rows"].append((u_index, None))
                for c_index, kid in enumerate(unit["children"]):
                    order_list.insert(tk.END, practice_label(kid, "         └ "))
                    state["rows"].append((u_index, c_index))
            chain = state["chain"] or {}
            folder_count = sum(1 for unit in state["units"] if unit["children"])
            text = (
                f"{chain.get('title', '')}：{len(state['units'])} 個項目"
                f"（{folder_count} 個資料夾）／展開共 {len(flatten_units())} 題型"
            )
            if state["new_ids"]:
                text += f"（{len(state['new_ids'])} 個新題型尚未入排序，按「儲存順序」併入）"
            info_var.set(text)

        def on_pick(_event=None):
            rows = visible_chains["rows"]
            idx = chain_combo.current()
            if not (0 <= idx < len(rows)):
                return
            state["chain"] = rows[idx]
            stored = [str(pid).strip() for pid in rows[idx].get("practiceIds", []) if str(pid).strip()]
            # 即時合併練習本體：排序只是一層設定，資料以 practice-db 為準
            merged = self._chapter_practice_ids_in_theme_order(rows[idx].get("chapterCode", ""), practice_by_id)
            if merged:
                state["ids"] = merged
                state["new_ids"] = set(merged) - set(stored)
            else:
                state["ids"] = stored
                state["new_ids"] = set()
            build_units()
            refresh_order_list()

        chain_combo.bind("<<ComboboxSelected>>", on_pick)
        keyword_var.trace_add("write", display_chains)

        def move_selected(direction):
            selection = order_list.curselection()
            if not selection or not (0 <= selection[0] < len(state["rows"])):
                return
            u_index, _c_index = state["rows"][selection[0]]
            target = u_index + direction
            if not (0 <= target < len(state["units"])):
                return
            units = state["units"]
            units[u_index], units[target] = units[target], units[u_index]
            refresh_order_list()
            for row_index, (ui, ci) in enumerate(state["rows"]):
                if ui == target and ci is None:
                    order_list.selection_set(row_index)
                    order_list.see(row_index)
                    break

        def sort_by_difficulty():
            rank = {"easy": 0, "medium": 1, "hard": 2}

            def unit_rank(unit):
                row = practice_by_id.get(unit["id"]) or {}
                return rank.get(str(row.get("difficulty", "")).strip().lower(), 3)

            decorated = [(unit_rank(unit), index, unit) for index, unit in enumerate(state["units"])]
            state["units"] = [unit for _, _, unit in sorted(decorated, key=lambda entry: (entry[0], entry[1]))]
            refresh_order_list()

        def save_order():
            chain = state["chain"]
            if not chain:
                return messagebox.showwarning("提醒", "請先選擇主題串。", parent=dialog)
            state["ids"] = flatten_units()
            chain["practiceIds"] = list(state["ids"])
            chain["updatedAt"] = practice_now_iso()
            try:
                self._theme_db_save(payload)
            except Exception as exc:
                return messagebox.showerror("儲存失敗", str(exc), parent=dialog)
            state["new_ids"] = set()
            refresh_order_list()
            self.status_var.set(f"主題串已儲存：{chain.get('title', '')}（已同步網頁資料檔）")
            messagebox.showinfo(
                "完成",
                "已寫入 practice-theme-db.json，並同步 data/practice-theme-chains.js。",
                parent=dialog,
            )

        def export_pdf():
            chain = state["chain"]
            if not chain:
                return messagebox.showwarning("提醒", "請先選擇主題串。", parent=dialog)
            records = records_for_chain(chain, flatten_units())
            if not records:
                return messagebox.showwarning("提醒", "這個主題串沒有任何題型。", parent=dialog)
            title = str(chain.get("title", "")).strip() or "主題串"
            dialog.grab_release()
            try:
                self._run_practice_records_export(records, self._safe_filename(title), f"{title} 題目與答案")
            finally:
                try:
                    dialog.grab_set()
                except Exception:
                    pass

        def export_all_chapter_pdfs():
            export_chains = [
                chain for chain in chains
                if isinstance(chain, dict)
                and chain.get("enabled", True) is not False
                and (str(chain.get("chapterCode", "")).strip() or str(chain.get("id", "")).strip())
            ]
            if not export_chains:
                return messagebox.showwarning("提醒", "目前沒有可匯出的章節主題串。", parent=dialog)

            def chain_chapter_code(chain: dict) -> str:
                return str(chain.get("chapterCode", "") or "").strip()

            def semester_label_for_code(code: str) -> str:
                code = str(code or "").strip()
                meta = _load_chapter_code_stage_grade_map().get(code) or infer_stage_grade_term_from_code(code)
                grade = str(meta.get("grade", "") or "").strip()
                term = str(meta.get("term", "") or "").strip()
                if grade and term.startswith("上"):
                    return f"{grade}上"
                if grade and term.startswith("下"):
                    return f"{grade}下"
                if grade:
                    return grade
                return code.split("-", 1)[0] if code else "未分類"

            def chapter_group_key(code: str) -> str:
                parts = str(code or "").strip().split("-")
                if len(parts) >= 2:
                    return f"{parts[0]}-{parts[1]}"
                return str(code or "").strip() or "未分類"

            semester_map: dict[str, list[dict]] = {}
            chapter_map: dict[str, list[dict]] = {}
            for chain in export_chains:
                code = chain_chapter_code(chain)
                semester_map.setdefault(semester_label_for_code(code), []).append(chain)
                chapter_map.setdefault(chapter_group_key(code), []).append(chain)

            semester_rows = [
                {
                    "key": label,
                    "label": f"{label}（{len(rows)} 小節）",
                    "match_label": label,
                    "sort": self._chapter_code_sort_key(chain_chapter_code(rows[0]) if rows else ""),
                }
                for label, rows in semester_map.items()
            ]
            semester_rows.sort(key=lambda row: (row["sort"], row["label"]))
            chapter_rows = [
                {
                    "key": key,
                    "label": f"{key}（{len(rows)} 小節）",
                    "match_label": key,
                    "sort": self._chapter_code_sort_key(key),
                }
                for key, rows in chapter_map.items()
            ]
            chapter_rows.sort(key=lambda row: (row["sort"], row["label"]))

            options = self._open_practice_batch_pdf_options_dialog(
                len(export_chains),
                subject_label="章節主題串",
                scope_options={"semesters": semester_rows, "chapters": chapter_rows},
            )
            if not options:
                return

            scope_mode = options.get("scope_mode", "all")
            scope_key = str(options.get("scope_key", "") or "").strip()
            scope_label = str(options.get("scope_label", "") or "").strip()
            if scope_mode == "semester":
                export_chains = [chain for chain in export_chains if semester_label_for_code(chain_chapter_code(chain)) == scope_key]
            elif scope_mode == "chapter":
                export_chains = [chain for chain in export_chains if chapter_group_key(chain_chapter_code(chain)) == scope_key]
            if not export_chains:
                return messagebox.showwarning("提醒", "這個範圍目前沒有可匯出的章節主題串。", parent=dialog)

            export_format = options.get("export_format", "pdf")
            if export_format in {"pdf", "both"}:
                toolchain = pdf_markdown_export.check_pdf_toolchain()
                if not toolchain["ok"]:
                    return messagebox.showerror("找不到排版工具", toolchain["reason"], parent=dialog)

            out_dir = filedialog.askdirectory(title="選擇全部章節主題串輸出資料夾", parent=dialog)
            if not out_dir:
                return
            out_dir = Path(out_dir)

            format_label = {"pdf": "PDF", "md": "MD", "both": "PDF + MD"}.get(export_format, "PDF")

            if not messagebox.askyesno(
                "確認批次匯出",
                f"即將依章節輸出 {len(export_chains)} 份{format_label}到：\n{out_dir}\n\n"
                f"範圍：{scope_label or '全部'}\n"
                "每個小章節會獨立輸出，確定開始？",
                parent=dialog,
            ):
                return

            question_count = int(options.get("question_count", 10) or 10)
            export_order = options.get("export_order", "interleaved")
            answer_mode = options.get("answer_mode", "both")
            question_gap_mm = float(options.get("question_gap_mm", 10) or 0)
            date_prefix = datetime.now().strftime("%Y%m%d_%H%M%S")
            written = []
            completed = 0
            failures = []

            dialog.grab_release()
            try:
                for index, chain in enumerate(export_chains, start=1):
                    title = str(chain.get("title", "")).strip() or str(chain.get("chapterCode", "")).strip() or str(chain.get("id", "")).strip() or f"章節主題串{index}"
                    records = records_for_chain(chain)
                    if not records:
                        failures.append(f"{title}：沒有可匯出的題型")
                        continue

                    counts = {
                        str(record.get("id", "")).strip(): question_count
                        for record in records
                        if str(record.get("id", "")).strip()
                    }
                    combined_title = f"{title} 題目與答案"
                    seed = f"theme-chain-batch-pdf|{date_prefix}|{index}|{chain.get('id', '') or chain.get('chapterCode', '')}"
                    markdown_result = self._generate_practice_export_markdown(
                        records,
                        counts,
                        combined_title,
                        export_order,
                        answer_mode,
                        question_gap_mm,
                        seed,
                    )
                    if not markdown_result.get("ok"):
                        failures.append(f"{title}：{markdown_result.get('reason', '未知錯誤')}")
                        continue

                    base_name = self._safe_filename(f"{date_prefix}_{index:03d}_{title}")
                    pdf_path = out_dir / f"{base_name}_題目與答案.pdf"
                    md_path = out_dir / f"{base_name}_題目與答案.md"
                    markdown_text = markdown_result.get("markdown", "")
                    if export_format in {"md", "both"}:
                        try:
                            md_path.write_text(markdown_text, encoding="utf-8")
                            written.append(md_path)
                        except Exception as exc:
                            failures.append(f"{title}：MD 寫入失敗：{exc}")
                            continue

                    if export_format in {"pdf", "both"}:
                        pdf_result = pdf_markdown_export.convert_markdown_to_pdf(
                            markdown_text,
                            pdf_path,
                            title=combined_title,
                        )
                        if not pdf_result.get("ok"):
                            failures.append(f"{title}：{pdf_result.get('reason', '') or 'PDF 轉換失敗'}")
                            continue
                        written.append(pdf_path)

                    completed += 1
                    info_var.set(f"批次匯出中：{index}/{len(export_chains)}，已完成 {completed} 份。")
                    self.status_var.set(info_var.get())
                    dialog.update_idletasks()
            finally:
                try:
                    dialog.grab_set()
                except Exception:
                    pass

            if failures:
                preview = "\n".join(failures[:12])
                more = "" if len(failures) <= 12 else f"\n...另有 {len(failures) - 12} 筆失敗"
                self.status_var.set(f"章節主題串批次匯出部分完成：成功 {completed} 份，失敗 {len(failures)} 份。")
                info_var.set(self.status_var.get())
                return messagebox.showwarning(
                    "部分完成",
                    f"已完成 {completed} 份{format_label}，輸出到：\n{out_dir}\n\n失敗 {len(failures)} 份：\n{preview}{more}",
                    parent=dialog,
                )

            self.status_var.set(f"章節主題串批次{format_label}匯出完成：{completed} 份。")
            info_var.set(self.status_var.get())
            return messagebox.showinfo("完成", f"已完成 {completed} 份{format_label}，輸出到：\n{out_dir}", parent=dialog)

        button_bar = ttk.Frame(dialog, padding=12)
        button_bar.pack(fill="x")
        ttk.Button(button_bar, text="上移", style="Compact.TButton", command=lambda: move_selected(-1)).pack(side="left")
        ttk.Button(button_bar, text="下移", style="Compact.TButton", command=lambda: move_selected(1)).pack(side="left", padx=(6, 0))
        ttk.Button(button_bar, text="依難度排序(易→難)", style="Compact.TButton", command=sort_by_difficulty).pack(side="left", padx=(12, 0))
        ttk.Button(button_bar, text="儲存順序", style="Compact.TButton", command=save_order).pack(side="left", padx=(12, 0))
        ttk.Button(button_bar, text="關閉", style="Compact.TButton", command=dialog.destroy).pack(side="right")
        ttk.Button(button_bar, text="匯出 PDF/MD", style="Compact.TButton", command=export_pdf).pack(side="right", padx=(0, 8))
        ttk.Button(button_bar, text="匯出全部章節PDF", style="Compact.TButton", command=export_all_chapter_pdfs).pack(side="right", padx=(0, 8))

        display_chains()
        if visible_chains["rows"]:
            chain_combo.current(0)
            on_pick()
        keyword_entry.focus_set()
        dialog.wait_window()

    # ── 自訂主題串（program-db/database/practice-custom-theme-db.json）─────────
    # 內容項目可混放：{"type": "practice", "id": 題型id}（小類）
    #                {"type": "chapter", "id": chapterCode}（大類，匯出時展開整章）

    def _custom_theme_db_load(self):
        try:
            payload = json.loads(CUSTOM_THEME_DB_DEFAULT.read_text(encoding="utf-8-sig"))
        except Exception:
            return {"meta": {}, "themeChains": []}
        chains = payload.get("themeChains")
        payload["themeChains"] = [c for c in chains if isinstance(c, dict)] if isinstance(chains, list) else []
        return payload

    def _custom_theme_db_save(self, payload: dict):
        chains = payload.get("themeChains", [])
        stamp = practice_now_iso()
        meta = payload.get("meta") or {}
        meta.update(
            {
                "schema": "practice-custom-theme-db-v1",
                "chainCount": len(chains),
                "updatedAt": stamp,
            }
        )
        payload["meta"] = meta
        CUSTOM_THEME_DB_DEFAULT.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        self._sync_custom_theme_bridge(chains, stamp)

    def _sync_custom_theme_bridge(self, chains: list, stamp: str):
        """同步網頁 bridge（data/practice-custom-theme-chains.js）。

        單向：GUI 為主，網頁只讀取播放。除了原始 items，也附上展開後的
        practiceIds（整章項目照章節主題串順序展開），讓網頁不用自己展開。
        """
        bridge_chains = []
        for chain in chains:
            if not isinstance(chain, dict):
                continue
            expanded = []
            seen = set()
            for item in chain.get("items", []) or []:
                if not isinstance(item, dict):
                    continue
                kind = str(item.get("type", "practice"))
                item_id = str(item.get("id", "")).strip()
                if not item_id:
                    continue
                pids = (
                    self._chapter_practice_ids_in_theme_order(item_id, {})
                    if kind == "chapter"
                    else [item_id]
                )
                for pid in pids:
                    if pid not in seen:
                        seen.add(pid)
                        expanded.append(pid)
            bridge_chains.append(
                {
                    "id": str(chain.get("id", "")).strip(),
                    "title": str(chain.get("title", "")).strip(),
                    "description": str(chain.get("description", "")).strip(),
                    "category": str(chain.get("category", "自訂")).strip() or "自訂",
                    "grade": str(chain.get("grade", "全部年級")).strip() or "全部年級",
                    "items": chain.get("items", []) or [],
                    "practiceIds": expanded,
                    "questionCount": int(chain.get("questionCount", 5) or 5),
                    "enabled": chain.get("enabled", True),
                    "updatedAt": str(chain.get("updatedAt", stamp)),
                }
            )
        banner = (
            "// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n"
            "// Source: program-db/database/practice-custom-theme-db.json（GUI 自訂主題串）\n"
            f"// 主題串數：{len(bridge_chains)}\n"
            f"// 最後更新：{stamp}\n"
        )
        CUSTOM_THEME_BRIDGE_JS_DEFAULT.write_text(
            banner
            + "window.practiceCustomThemeChainData = "
            + json.dumps(bridge_chains, ensure_ascii=False, indent=2)
            + ";\n",
            encoding="utf-8",
        )

    def _practice_relation_maps(self):
        """大類/小類關係（唯讀呈現用）。

        大類 = relatedPracticeIds 非空的題型（由小類合併生成）；
        小類 = 被某個大類引用的題型。回傳 (children_by_parent, parents_by_child)。
        """
        children_by_parent = {}
        parents_by_child = {}
        for row in self.practice_payload.get("practices", []):
            if not isinstance(row, dict):
                continue
            pid = str(row.get("id", "")).strip()
            kids = [str(k).strip() for k in (row.get("relatedPracticeIds") or []) if str(k).strip()]
            if not pid or not kids:
                continue
            children_by_parent[pid] = kids
            for kid in kids:
                parents_by_child.setdefault(kid, []).append(pid)
        return children_by_parent, parents_by_child

    def _practice_relation_marker(self, pid, children_by_parent, parents_by_child):
        kids = children_by_parent.get(pid)
        if kids:
            return f"【大{len(kids)}】"
        if pid in parents_by_child:
            return "【小】"
        return ""

    def _practice_relation_text(self, pid, children_by_parent, parents_by_child, practice_by_id):
        def title_of(x):
            return str((practice_by_id.get(x) or {}).get("title", "")).strip() or x
        kids = children_by_parent.get(pid) or []
        parents = parents_by_child.get(pid) or []
        if kids:
            return "大類，由小類合併生成：" + "、".join(title_of(k) for k in kids)
        if parents:
            return "小類，屬於大類：" + "、".join(title_of(k) for k in parents)
        return "獨立題型（無大小類關係）"

    def _live_chapter_practice_ids(self, chapter_code: str):
        """練習本體（practice-db）目前這一章實際存在的題型 id，照母資料順序。"""
        chapter_code = str(chapter_code or "").strip()
        return [
            str(row.get("id", "")).strip()
            for row in self.practice_payload.get("practices", [])
            if isinstance(row, dict)
            and row.get("enabled", True)
            and str(row.get("chapterCode", "")).strip() == chapter_code
            and str(row.get("id", "")).strip()
        ]

    def _chapter_practice_ids_in_theme_order(self, chapter_code: str, practice_by_id: dict):
        """整章的題型順序：資料本體永遠即時讀 practice-db，主題串只提供排序。

        合併規則：主題串排序中仍存在的題型照排序在前；practice-db 新增（尚未入排序）
        的題型自動附加在該章最後；已刪除/停用的題型自動消失。
        """
        chapter_code = str(chapter_code or "").strip()
        live = self._live_chapter_practice_ids(chapter_code)
        stored = []
        theme_payload = self._theme_db_load()
        for chain in theme_payload.get("themeChains", []):
            if str(chain.get("chapterCode", "")).strip() == chapter_code:
                stored = [str(pid).strip() for pid in chain.get("practiceIds", []) if str(pid).strip()]
                break
        live_set = set(live)
        ordered = [pid for pid in stored if pid in live_set]
        ordered_set = set(ordered)
        return ordered + [pid for pid in live if pid not in ordered_set]

    def open_custom_theme_dialog(self):
        payload = self._custom_theme_db_load()
        chains = payload.get("themeChains", [])

        practice_by_id = {
            str(row.get("id", "")).strip(): row
            for row in self.practice_payload.get("practices", [])
            if isinstance(row, dict) and str(row.get("id", "")).strip()
        }

        def chapter_sort_key(code):
            match = re.match(r"^([a-z]+)(\d+)-(\d+)-(\d+)$", str(code or ""))
            if not match:
                return (str(code or ""), 0, 0, 0)
            return (match.group(1), int(match.group(2)), int(match.group(3)), int(match.group(4)))

        chapter_codes = sorted(
            {
                str(row.get("chapterCode", "")).strip()
                for row in self.practice_payload.get("practices", [])
                if isinstance(row, dict) and row.get("enabled", True) and str(row.get("chapterCode", "")).strip()
            },
            key=chapter_sort_key,
        )
        chapter_labels_by_code = {code: self._chapter_label(code) for code in chapter_codes}

        def source_category_for_code(code):
            text = str(code or "").strip().lower()
            match = re.match(r"^([a-z]+)(\d+)-", text)
            if not match:
                return "其他"
            prefix, raw_number = match.group(1), int(match.group(2))
            if prefix == "e":
                return {4: "小四", 5: "小五", 6: "小六"}.get(raw_number, "國小")
            if prefix == "j":
                if raw_number in {1, 2}:
                    return "國一"
                if raw_number in {3, 4}:
                    return "國二"
                if raw_number in {5, 6}:
                    return "國三"
                return "國中複習"
            if prefix == "s":
                if raw_number in {1, 2}:
                    return "高一"
                if raw_number in {3, 4}:
                    return "高二"
                if raw_number in {5, 6}:
                    return "高三"
                return "高中複習"
            return "其他"

        def source_category_matches(filter_value, code):
            category = source_category_for_code(code)
            text = str(code or "").strip().lower()
            if filter_value in {"", "全部分類"}:
                return True
            if filter_value == "國小":
                return text.startswith("e")
            if filter_value == "國中複習":
                return text.startswith("j")
            if filter_value == "高中複習":
                return text.startswith("s")
            return category == filter_value

        source_category_options = ["全部分類", "國小", "國中複習", "高中複習"]
        for category in ["小四", "小五", "小六", "國一", "國二", "國三", "高一", "高二", "高三", "其他"]:
            if any(source_category_for_code(code) == category for code in chapter_codes):
                source_category_options.append(category)

        dialog = tk.Toplevel(self.root)
        dialog.title("自訂主題串")
        dialog.transient(self.root)
        dialog.grab_set()
        dialog.geometry("1080x680")
        dialog.minsize(920, 500)
        dialog.columnconfigure(0, weight=1)
        dialog.rowconfigure(0, weight=0)
        dialog.rowconfigure(1, weight=1, minsize=0)
        dialog.rowconfigure(2, weight=0)
        dialog.after(0, lambda: self._maximize_window(dialog))

        state = {"chain": None, "items": [], "chapter_practice_ids": []}
        status_var = tk.StringVar(value="選擇或新增一個自訂主題串。")

        # ── 上排：主題串選擇與管理 ──
        top = ttk.Frame(dialog, padding=12)
        top.grid(row=0, column=0, sticky="ew")
        top.columnconfigure(0, weight=1)
        top_controls = ttk.Frame(top)
        top_controls.grid(row=0, column=0, sticky="ew")
        top_actions = ttk.Frame(top)
        top_actions.grid(row=1, column=0, sticky="w", pady=(8, 0))

        BASE_CATEGORY_OPTIONS = ["自訂", "中等練習", "複習必做", "章節重點"]
        GRADE_OPTIONS = [
            "全部年級", "國中複習", "高中複習", "國中章節重點", "高中章節重點",
            "小五", "小六", "國一", "國二", "國三", "高一", "高二", "高三", "其他",
        ]
        chain_filter_category_var = tk.StringVar(value="全部分類")
        chain_filter_grade_var = tk.StringVar(value="全部年級")
        category_var = tk.StringVar(value="自訂")
        grade_var = tk.StringVar(value="全部年級")

        ttk.Label(top_controls, text="篩分類").pack(side="left")
        chain_filter_category_combo = ttk.Combobox(
            top_controls,
            textvariable=chain_filter_category_var,
            state="readonly",
            width=12,
        )
        chain_filter_category_combo.pack(side="left", padx=(6, 8))
        ttk.Label(top_controls, text="篩年級").pack(side="left")
        chain_filter_grade_combo = ttk.Combobox(
            top_controls,
            textvariable=chain_filter_grade_var,
            state="readonly",
            width=12,
        )
        chain_filter_grade_combo.pack(side="left", padx=(6, 10))
        ttk.Label(top_controls, text="自訂主題串").pack(side="left")
        chain_combo = ttk.Combobox(top_controls, state="readonly", width=32)
        chain_combo.pack(side="left", padx=(6, 12))
        title_var = tk.StringVar(value="")
        ttk.Label(top_controls, text="名稱").pack(side="left")
        title_entry = ttk.Entry(top_controls, textvariable=title_var, width=22)
        title_entry.pack(side="left", padx=(6, 8))
        ttk.Label(top_controls, text="分類").pack(side="left")
        category_entry = ttk.Entry(top_controls, textvariable=category_var, width=12)
        category_entry.pack(side="left", padx=(6, 8))
        ttk.Label(top_controls, text="年級").pack(side="left")
        grade_entry = ttk.Entry(top_controls, textvariable=grade_var, width=12)
        grade_entry.pack(side="left", padx=(6, 8))

        def category_options():
            seen = set()
            values = []
            for value in BASE_CATEGORY_OPTIONS + [
                str(c.get("category", "")).strip()
                for c in chains
                if isinstance(c, dict) and str(c.get("category", "")).strip()
            ]:
                if value and value not in seen:
                    seen.add(value)
                    values.append(value)
            return values

        def grade_options():
            seen = set()
            values = []
            for value in GRADE_OPTIONS + [
                str(c.get("grade", "")).strip()
                for c in chains
                if isinstance(c, dict) and str(c.get("grade", "")).strip()
            ]:
                if value and value not in seen:
                    seen.add(value)
                    values.append(value)
            return values

        def refresh_category_options():
            chain_filter_category_combo["values"] = ["全部分類"] + category_options()
            chain_filter_grade_combo["values"] = grade_options()

        refresh_category_options()
        filtered_chain_indexes = []

        def chain_matches_filter(chain):
            category_filter = chain_filter_category_var.get().strip()
            grade_filter = chain_filter_grade_var.get().strip()
            category = str(chain.get("category", "自訂")).strip() or "自訂"
            grade = str(chain.get("grade", "全部年級")).strip() or "全部年級"
            category_ok = category_filter in {"", "全部分類"} or category == category_filter
            grade_ok = grade_filter in {"", "全部年級"} or grade == grade_filter or grade == "全部年級"
            return category_ok and grade_ok

        def set_chain_filters_to_show(chain):
            category = str(chain.get("category", "自訂")).strip() or "自訂"
            grade = str(chain.get("grade", "全部年級")).strip() or "全部年級"
            chain_filter_category_var.set(category if category in category_options() else "全部分類")
            chain_filter_grade_var.set(grade if grade in grade_options() else "全部年級")

        def refresh_chain_combo(select_index=None):
            nonlocal filtered_chain_indexes
            refresh_category_options()
            filtered_chain_indexes = [
                index for index, chain in enumerate(chains) if chain_matches_filter(chain)
            ]
            chain_combo["values"] = [
                f"【{str(c.get('category', '自訂')) or '自訂'}】{str(c.get('title') or c.get('id') or '')}"
                for c in (chains[index] for index in filtered_chain_indexes)
            ]
            if select_index is not None and select_index in filtered_chain_indexes:
                chain_combo.current(filtered_chain_indexes.index(select_index))
            elif filtered_chain_indexes:
                chain_combo.current(0)
            else:
                chain_combo.set("")

        children_by_parent, parents_by_child = self._practice_relation_maps()

        def item_label(item, index):
            kind = str(item.get("type", "practice"))
            item_id = str(item.get("id", "")).strip()
            if kind == "chapter":
                count = len(self._chapter_practice_ids_in_theme_order(item_id, practice_by_id))
                return f"{index + 1:>3}. 【整章】{self._chapter_label(item_id)}（{count} 題型）"
            row = practice_by_id.get(item_id) or {}
            title = str(row.get("title", "")).strip() or item_id
            difficulty = str(row.get("difficulty", "")).strip() or "-"
            code = str(row.get("chapterCode", "")).strip()
            relation_marker = self._practice_relation_marker(item_id, children_by_parent, parents_by_child)
            return f"{index + 1:>3}. [{difficulty}] {relation_marker}{title}（{code}）"

        def refresh_items():
            items_list.delete(0, tk.END)
            for index, item in enumerate(state["items"]):
                items_list.insert(tk.END, item_label(item, index))
            chain = state["chain"] or {}
            expanded = sum(
                len(self._chapter_practice_ids_in_theme_order(item.get("id", ""), practice_by_id))
                if item.get("type") == "chapter"
                else 1
                for item in state["items"]
            )
            status_var.set(
                f"{chain.get('title', '')}：{len(state['items'])} 個項目，展開後約 {expanded} 個題型。"
            )

        def on_pick_chain(_event=None):
            idx = chain_combo.current()
            if not (0 <= idx < len(filtered_chain_indexes)):
                return
            chain_index = filtered_chain_indexes[idx]
            state["chain"] = chains[chain_index]
            state["items"] = [
                dict(item)
                for item in (chains[chain_index].get("items") or [])
                if isinstance(item, dict) and str(item.get("id", "")).strip()
            ]
            title_var.set(str(chains[chain_index].get("title", "")))
            category_var.set(str(chains[chain_index].get("category", "自訂")) or "自訂")
            grade_var.set(str(chains[chain_index].get("grade", "全部年級")) or "全部年級")
            refresh_items()

        chain_combo.bind("<<ComboboxSelected>>", on_pick_chain)

        def on_chain_filter_changed(_event=None):
            refresh_chain_combo()
            if filtered_chain_indexes:
                on_pick_chain()
                return
            state["chain"] = None
            state["items"] = []
            title_var.set("")
            category_var.set("自訂")
            grade_var.set("全部年級")
            refresh_items_empty()

        chain_filter_category_combo.bind("<<ComboboxSelected>>", on_chain_filter_changed)
        chain_filter_grade_combo.bind("<<ComboboxSelected>>", on_chain_filter_changed)

        def add_chain():
            title = title_var.get().strip() or f"自訂主題串 {len(chains) + 1}"
            chain = {
                "id": f"custom-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "title": title,
                "description": "",
                "category": category_var.get().strip() or "自訂",
                "grade": grade_var.get().strip() or "全部年級",
                "items": [],
                "questionCount": 5,
                "enabled": True,
                "updatedAt": practice_now_iso(),
            }
            chains.append(chain)
            set_chain_filters_to_show(chain)
            refresh_chain_combo(len(chains) - 1)
            on_pick_chain()

        def rename_chain():
            chain = state["chain"]
            if not chain:
                return messagebox.showwarning("提醒", "請先選擇主題串。", parent=dialog)
            title = title_var.get().strip()
            if not title:
                return messagebox.showwarning("提醒", "名稱不可空白。", parent=dialog)
            chain["title"] = title
            refresh_chain_combo(chains.index(chain))
            refresh_items()

        def delete_chain():
            chain = state["chain"]
            if not chain:
                return messagebox.showwarning("提醒", "請先選擇主題串。", parent=dialog)
            if not messagebox.askyesno("確認", f"確定刪除「{chain.get('title', '')}」？", parent=dialog):
                return
            chains.remove(chain)
            state["chain"] = None
            state["items"] = []
            title_var.set("")
            refresh_chain_combo(0 if chains else None)
            if chains:
                on_pick_chain()
            else:
                chain_combo.set("")
                refresh_items_empty()

        def refresh_items_empty():
            items_list.delete(0, tk.END)
            status_var.set("目前沒有自訂主題串，輸入名稱後按「新增」。")

        ttk.Button(top_actions, text="新增", style="Compact.TButton", command=add_chain).pack(side="left")
        ttk.Button(top_actions, text="改名", style="Compact.TButton", command=rename_chain).pack(side="left", padx=(6, 0))
        ttk.Button(top_actions, text="刪除", style="Compact.TButton", command=delete_chain).pack(side="left", padx=(6, 0))

        # ── 中間：左邊選來源、右邊主題串內容 ──
        body = ttk.Frame(dialog, padding=(12, 4))
        body.grid(row=1, column=0, sticky="nsew")
        body.grid_propagate(False)
        body.columnconfigure(0, weight=1)
        body.columnconfigure(1, weight=1)
        body.rowconfigure(0, weight=0)
        body.rowconfigure(1, weight=1)

        left_box = ttk.LabelFrame(body, text="從章節加入（直接列出該章的分類）", padding=8)
        left_box.grid(row=0, column=0, rowspan=2, sticky="nsew", padx=(0, 8))
        left_box.grid_propagate(False)
        left_box.columnconfigure(0, weight=1)
        left_box.rowconfigure(1, weight=1)

        source_category_var = tk.StringVar(value="全部分類")
        source_filter_frame = ttk.Frame(left_box)
        source_filter_frame.grid(row=0, column=0, columnspan=2, sticky="ew", pady=(0, 6))
        source_filter_frame.columnconfigure(3, weight=1)
        ttk.Label(source_filter_frame, text="分類").grid(row=0, column=0, sticky="w")
        source_category_combo = ttk.Combobox(
            source_filter_frame,
            textvariable=source_category_var,
            state="readonly",
            values=source_category_options,
            width=12,
        )
        source_category_combo.grid(row=0, column=1, sticky="w", padx=(6, 12))
        ttk.Label(source_filter_frame, text="章節").grid(row=0, column=2, sticky="w")
        chapter_combo = ttk.Combobox(source_filter_frame, state="readonly", width=40)
        chapter_combo.grid(row=0, column=3, sticky="ew", padx=(6, 0))
        source_list = tk.Listbox(left_box, selectmode="extended", activestyle="dotbox")
        source_scroll = ttk.Scrollbar(left_box, orient="vertical", command=source_list.yview)
        source_list.configure(yscrollcommand=source_scroll.set)
        source_list.grid(row=1, column=0, sticky="nsew")
        source_scroll.grid(row=1, column=1, sticky="ns")

        filtered_chapter_codes = []

        def refresh_chapter_combo():
            nonlocal filtered_chapter_codes
            selected_code = ""
            idx = chapter_combo.current()
            if 0 <= idx < len(filtered_chapter_codes):
                selected_code = filtered_chapter_codes[idx]
            filter_value = source_category_var.get().strip() or "全部分類"
            filtered_chapter_codes = [
                code for code in chapter_codes if source_category_matches(filter_value, code)
            ]
            chapter_combo["values"] = [chapter_labels_by_code[code] for code in filtered_chapter_codes]
            if not filtered_chapter_codes:
                chapter_combo.set("")
                source_list.delete(0, tk.END)
                state["chapter_practice_ids"] = []
                return
            if selected_code in filtered_chapter_codes:
                chapter_combo.current(filtered_chapter_codes.index(selected_code))
            else:
                chapter_combo.current(0)
            on_pick_chapter()

        def on_pick_chapter(_event=None):
            idx = chapter_combo.current()
            source_list.delete(0, tk.END)
            state["chapter_practice_ids"] = []
            if not (0 <= idx < len(filtered_chapter_codes)):
                return
            ids = self._chapter_practice_ids_in_theme_order(filtered_chapter_codes[idx], practice_by_id)
            state["chapter_practice_ids"] = ids
            for pid in ids:
                row = practice_by_id.get(pid) or {}
                difficulty = str(row.get("difficulty", "")).strip() or "-"
                title = str(row.get("title", "")).strip() or pid
                relation_marker = self._practice_relation_marker(pid, children_by_parent, parents_by_child)
                source_list.insert(tk.END, f"[{difficulty}] {relation_marker}{title}")

        chapter_combo.bind("<<ComboboxSelected>>", on_pick_chapter)
        source_category_combo.bind("<<ComboboxSelected>>", lambda _event=None: refresh_chapter_combo())

        # 點選題型時，用底部狀態列顯示大類/小類關係（唯讀）
        def show_relation_for(pid):
            if pid:
                status_var.set(self._practice_relation_text(pid, children_by_parent, parents_by_child, practice_by_id))

        def on_source_select(_event=None):
            selection = source_list.curselection()
            if len(selection) == 1 and 0 <= selection[0] < len(state["chapter_practice_ids"]):
                show_relation_for(state["chapter_practice_ids"][selection[0]])

        source_list.bind("<<ListboxSelect>>", on_source_select)

        def require_chain():
            if not state["chain"]:
                messagebox.showwarning("提醒", "請先選擇或新增一個自訂主題串。", parent=dialog)
                return False
            return True

        def add_selected_practices():
            if not require_chain():
                return
            picked = [state["chapter_practice_ids"][i] for i in source_list.curselection()]
            if not picked:
                return messagebox.showwarning("提醒", "請先在左邊列表選取要加入的小類。", parent=dialog)
            existing = {
                (item.get("type", "practice"), str(item.get("id", "")).strip())
                for item in state["items"]
            }
            added = 0
            for pid in picked:
                key = ("practice", pid)
                if key in existing:
                    continue
                state["items"].append({"type": "practice", "id": pid})
                existing.add(key)
                added += 1
            refresh_items()
            status_var.set(f"已加入 {added} 個小類（重複的自動略過）。")

        def add_whole_chapter():
            if not require_chain():
                return
            idx = chapter_combo.current()
            if not (0 <= idx < len(filtered_chapter_codes)):
                return messagebox.showwarning("提醒", "請先選擇章節。", parent=dialog)
            code = filtered_chapter_codes[idx]
            key = ("chapter", code)
            if any((item.get("type", "practice"), str(item.get("id", "")).strip()) == key for item in state["items"]):
                return messagebox.showwarning("提醒", "這一章已經加入過了。", parent=dialog)
            state["items"].append({"type": "chapter", "id": code})
            refresh_items()

        left_buttons = ttk.Frame(left_box)
        left_buttons.grid(row=2, column=0, columnspan=2, sticky="ew", pady=(6, 0))
        ttk.Button(left_buttons, text="加入選取小類 →", style="Compact.TButton", command=add_selected_practices).pack(side="left")
        ttk.Button(left_buttons, text="加入整章（大類）→", style="Compact.TButton", command=add_whole_chapter).pack(side="left", padx=(8, 0))

        right_box = ttk.LabelFrame(body, text="主題串內容（匯出時整章會展開）", padding=8)
        right_box.grid(row=0, column=1, rowspan=2, sticky="nsew")
        right_box.grid_propagate(False)
        right_box.columnconfigure(0, weight=1)
        right_box.rowconfigure(0, weight=1)

        items_list = tk.Listbox(right_box, activestyle="dotbox")
        items_scroll = ttk.Scrollbar(right_box, orient="vertical", command=items_list.yview)
        items_list.configure(yscrollcommand=items_scroll.set)
        items_list.grid(row=0, column=0, sticky="nsew")
        items_scroll.grid(row=0, column=1, sticky="ns")

        def on_items_select(_event=None):
            selection = items_list.curselection()
            if not selection or not (0 <= selection[0] < len(state["items"])):
                return
            item = state["items"][selection[0]]
            if str(item.get("type", "practice")) != "chapter":
                show_relation_for(str(item.get("id", "")).strip())

        items_list.bind("<<ListboxSelect>>", on_items_select)

        def move_item(direction):
            selection = items_list.curselection()
            if not selection:
                return
            index = selection[0]
            target = index + direction
            if not (0 <= target < len(state["items"])):
                return
            state["items"][index], state["items"][target] = state["items"][target], state["items"][index]
            refresh_items()
            items_list.selection_set(target)
            items_list.see(target)

        def remove_item():
            selection = items_list.curselection()
            if not selection:
                return
            state["items"].pop(selection[0])
            refresh_items()

        def sort_items_by_difficulty():
            rank = {"easy": 0, "medium": 1, "hard": 2}

            def item_rank(item):
                if item.get("type") == "chapter":
                    return 3
                row = practice_by_id.get(str(item.get("id", "")).strip()) or {}
                return rank.get(str(row.get("difficulty", "")).strip().lower(), 3)

            decorated = [(item_rank(item), index, item) for index, item in enumerate(state["items"])]
            state["items"] = [item for _, _, item in sorted(decorated, key=lambda entry: (entry[0], entry[1]))]
            refresh_items()

        right_buttons = ttk.Frame(right_box)
        right_buttons.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(6, 0))
        ttk.Button(right_buttons, text="上移", style="Compact.TButton", command=lambda: move_item(-1)).pack(side="left")
        ttk.Button(right_buttons, text="下移", style="Compact.TButton", command=lambda: move_item(1)).pack(side="left", padx=(6, 0))
        ttk.Button(right_buttons, text="移除", style="Compact.TButton", command=remove_item).pack(side="left", padx=(6, 0))
        ttk.Button(right_buttons, text="依難度排序(易→難)", style="Compact.TButton", command=sort_items_by_difficulty).pack(side="left", padx=(12, 0))

        # ── 底部：儲存與匯出 ──
        def save_all():
            chain = state["chain"]
            if chain:
                chain["items"] = [dict(item) for item in state["items"]]
                chain["category"] = category_var.get().strip() or "自訂"
                chain["grade"] = grade_var.get().strip() or "全部年級"
                chain["updatedAt"] = practice_now_iso()
            try:
                self._custom_theme_db_save(payload)
            except Exception as exc:
                messagebox.showerror("儲存失敗", str(exc), parent=dialog)
                return False
            if chain:
                set_chain_filters_to_show(chain)
                refresh_chain_combo(chains.index(chain))
            self.status_var.set("自訂主題串已儲存（practice-custom-theme-db.json）。")
            status_var.set("已儲存到 practice-custom-theme-db.json。")
            return True

        def records_for_items(items):
            records = []
            seen = set()
            for item in items or []:
                kind = str(item.get("type", "practice"))
                item_id = str(item.get("id", "")).strip()
                pids = (
                    self._chapter_practice_ids_in_theme_order(item_id, practice_by_id)
                    if kind == "chapter"
                    else [item_id]
                )
                for pid in pids:
                    if pid in seen:
                        continue
                    seen.add(pid)
                    row = practice_by_id.get(pid)
                    if row:
                        records.append(row)
                    else:
                        records.append({"id": pid, "title": pid, "questionCount": 5})
            return records

        def expand_records():
            return records_for_items(state["items"])

        def export_pdf():
            chain = state["chain"]
            if not chain:
                return messagebox.showwarning("提醒", "請先選擇主題串。", parent=dialog)
            records = expand_records()
            if not records:
                return messagebox.showwarning("提醒", "這個主題串沒有任何內容。", parent=dialog)
            title = str(chain.get("title", "")).strip() or "自訂主題串"
            dialog.grab_release()
            try:
                self._run_practice_records_export(records, self._safe_filename(title), f"{title} 題目與答案")
            finally:
                try:
                    dialog.grab_set()
                except Exception:
                    pass

        def export_all_pdfs():
            if save_all() is False:
                return
            export_chains = [
                chain for chain in chains
                if isinstance(chain, dict)
                and chain.get("enabled", True) is not False
                and str(chain.get("id", "")).strip()
            ]
            if not export_chains:
                return messagebox.showwarning("提醒", "目前沒有可匯出的自訂主題串。", parent=dialog)

            options = self._open_practice_batch_pdf_options_dialog(len(export_chains))
            if not options:
                return

            export_format = options.get("export_format", "pdf")
            if export_format in {"pdf", "both"}:
                toolchain = pdf_markdown_export.check_pdf_toolchain()
                if not toolchain["ok"]:
                    return messagebox.showerror("找不到排版工具", toolchain["reason"], parent=dialog)

            out_dir = filedialog.askdirectory(title="選擇全部自訂主題串輸出資料夾", parent=dialog)
            if not out_dir:
                return
            out_dir = Path(out_dir)
            format_label = {"pdf": "PDF", "md": "MD", "both": "PDF + MD"}.get(export_format, "PDF")

            if not messagebox.askyesno(
                "確認批次匯出",
                f"即將輸出 {len(export_chains)} 份{format_label}到：\n{out_dir}\n\n這可能需要一段時間，確定開始？",
                parent=dialog,
            ):
                return

            question_count = int(options.get("question_count", 10) or 10)
            export_order = options.get("export_order", "interleaved")
            answer_mode = options.get("answer_mode", "both")
            question_gap_mm = float(options.get("question_gap_mm", 10) or 0)
            date_prefix = datetime.now().strftime("%Y%m%d_%H%M%S")
            written = []
            completed = 0
            failures = []

            dialog.grab_release()
            try:
                for index, chain in enumerate(export_chains, start=1):
                    title = str(chain.get("title", "")).strip() or str(chain.get("id", "")).strip() or f"自訂主題串{index}"
                    records = records_for_items(chain.get("items", []) or [])
                    if not records:
                        failures.append(f"{title}：沒有可匯出的題型")
                        continue

                    counts = {
                        str(record.get("id", "")).strip(): question_count
                        for record in records
                        if str(record.get("id", "")).strip()
                    }
                    combined_title = f"{title} 題目與答案"
                    seed = f"practice-batch-pdf|{date_prefix}|{index}|{chain.get('id', '')}"
                    markdown_result = self._generate_practice_export_markdown(
                        records,
                        counts,
                        combined_title,
                        export_order,
                        answer_mode,
                        question_gap_mm,
                        seed,
                    )
                    if not markdown_result.get("ok"):
                        failures.append(f"{title}：{markdown_result.get('reason', '未知錯誤')}")
                        continue

                    base_name = self._safe_filename(f"{date_prefix}_{index:03d}_{title}")
                    pdf_path = out_dir / f"{base_name}_題目與答案.pdf"
                    md_path = out_dir / f"{base_name}_題目與答案.md"
                    markdown_text = markdown_result.get("markdown", "")
                    if export_format in {"md", "both"}:
                        try:
                            md_path.write_text(markdown_text, encoding="utf-8")
                            written.append(md_path)
                        except Exception as exc:
                            failures.append(f"{title}：MD 寫入失敗：{exc}")
                            continue

                    if export_format in {"pdf", "both"}:
                        pdf_result = pdf_markdown_export.convert_markdown_to_pdf(
                            markdown_text,
                            pdf_path,
                            title=combined_title,
                        )
                        if not pdf_result.get("ok"):
                            failures.append(f"{title}：{pdf_result.get('reason', '') or 'PDF 轉換失敗'}")
                            continue
                        written.append(pdf_path)

                    completed += 1
                    status_var.set(f"批次匯出中：{index}/{len(export_chains)}，已完成 {completed} 份。")
                    self.status_var.set(status_var.get())
                    dialog.update_idletasks()
            finally:
                try:
                    dialog.grab_set()
                except Exception:
                    pass

            if failures:
                preview = "\n".join(failures[:12])
                more = "" if len(failures) <= 12 else f"\n...另有 {len(failures) - 12} 筆失敗"
                self.status_var.set(f"自訂主題串批次匯出部分完成：成功 {completed} 份，失敗 {len(failures)} 份。")
                status_var.set(self.status_var.get())
                return messagebox.showwarning(
                    "部分完成",
                    f"已完成 {completed} 份{format_label}，輸出到：\n{out_dir}\n\n失敗 {len(failures)} 份：\n{preview}{more}",
                    parent=dialog,
                )

            self.status_var.set(f"自訂主題串批次{format_label}匯出完成：{completed} 份。")
            status_var.set(self.status_var.get())
            return messagebox.showinfo("完成", f"已完成 {completed} 份{format_label}，輸出到：\n{out_dir}", parent=dialog)

        bottom = ttk.Frame(dialog, padding=12)
        bottom.grid(row=2, column=0, sticky="ew")
        bottom.columnconfigure(0, weight=1)
        ttk.Label(bottom, textvariable=status_var).grid(row=0, column=0, sticky="w")

        def add_dialog_action_buttons(parent):
            ttk.Button(parent, text="儲存", style="Compact.TButton", command=save_all).pack(side="left", padx=(12, 0))
            ttk.Button(parent, text="匯出 PDF/MD", style="Compact.TButton", command=export_pdf).pack(side="left", padx=(8, 0))
            ttk.Button(parent, text="匯出全部 PDF", style="Compact.TButton", command=export_all_pdfs).pack(side="left", padx=(8, 0))

        add_dialog_action_buttons(top_actions)

        refresh_chain_combo(0 if chains else None)
        if chains:
            on_pick_chain()
        else:
            refresh_items_empty()
        refresh_chapter_combo()
        dialog.wait_window()

    def _split_pipe(self, value: str):
        text = (value or "").strip()
        if not text:
            return []
        return [x.strip() for x in text.split("|") if x.strip()]

    def _parse_txt_topic_records(self, text: str):
        blocks = [b.strip() for b in text.replace("\r\n", "\n").split("\n===\n") if b.strip()]
        records = []
        for block in blocks:
            data = {}
            for raw in block.splitlines():
                line = raw.strip()
                if not line or line.startswith("#") or ":" not in line:
                    continue
                k, v = line.split(":", 1)
                data[k.strip()] = v.strip()
            rec = {
                "id": data.get("id", ""), "title": data.get("title", ""), "stage": data.get("stage", ""), "grade": data.get("grade", ""),
                "term": data.get("term", ""), "chapter": data.get("chapter", ""), "domain": data.get("domain", ""), "difficulty": data.get("difficulty", ""),
                "chapterRole": data.get("chapterRole", ""), "parentId": data.get("parentId", ""),
                "formula": {"type": data.get("formulaType", "text"), "lines": [{"label": data.get("formulaLabel", "公式"), "values": self._split_pipe(data.get("formula", ""))}]},
                "contentTypes": self._split_pipe(data.get("contentTypes", "")), "tags": self._split_pipe(data.get("tags", "")),
                "usage": self._split_pipe(data.get("usage", "")), "examples": self._split_pipe(data.get("examples", "")),
                "tips": self._split_pipe(data.get("tips", "")), "notes": self._split_pipe(data.get("notes", "")), "mistakes": self._split_pipe(data.get("mistakes", "")),
            }
            if rec["id"] and rec["title"]:
                records.append(rec)
        return records

    def _parse_txt_question_records(self, text: str):
        blocks = [b.strip() for b in text.replace("\r\n", "\n").split("\n===\n") if b.strip()]
        records = []
        for block in blocks:
            data = {}
            for raw in block.splitlines():
                line = raw.strip()
                if not line or line.startswith("#") or ":" not in line:
                    continue
                k, v = line.split(":", 1)
                data[k.strip()] = v.strip()
            rec = {
                "id": data.get("id", ""), "title": data.get("title", ""), "question_text": data.get("question_text", ""),
                "answer_text": data.get("answer_text", ""), "explanation_text": data.get("explanation_text", ""),
                "stage": data.get("stage", ""), "grade": data.get("grade", ""), "chapter": data.get("chapter", ""),
                "chapter_code": data.get("chapter_code", ""), "formula_id": data.get("formula_id", ""),
                "question_category": data.get("question_category", ""),
                "difficulty": data.get("difficulty", ""), "source_type": data.get("source_type", "manual"), "source_ref": data.get("source_ref", ""),
                "tags": self._split_pipe(data.get("tags", "")),
            }
            if rec["id"] and rec["title"]:
                records.append(rec)
        return records

    def _parse_jsonl_records(self, text: str):
        rows = []
        for raw in text.splitlines():
            line = raw.strip()
            if not line:
                continue
            obj = json.loads(line)
            if isinstance(obj, dict):
                rows.append(obj)
        return rows

    def _parse_json_records(self, text: str):
        payload = json.loads(text)
        if isinstance(payload, list):
            return [row for row in payload if isinstance(row, dict)]
        if not isinstance(payload, dict):
            raise ValueError("JSON 匯入檔格式不正確，頂層必須是物件或陣列。")

        if self.mode == "topics":
            rows = payload.get("topics")
            if isinstance(rows, list):
                return [row for row in rows if isinstance(row, dict)]

        if self.mode == "questions":
            rows = payload.get("questions")
            if isinstance(rows, list):
                return [row for row in rows if isinstance(row, dict)]

        key = self._current_key()
        rows = payload.get(key)
        if isinstance(rows, list):
            return [row for row in rows if isinstance(row, dict)]

        raise ValueError("JSON 匯入檔裡找不到可匯入的資料列。")

    def _parse_import_file(self, src: Path):
        text = src.read_text(encoding="utf-8-sig")
        suffix = src.suffix.lower()
        if suffix == ".jsonl":
            return self._parse_jsonl_records(text)
        if suffix == ".json":
            return self._parse_json_records(text)
        if self.mode == "topics":
            return self._parse_txt_topic_records(text)
        if self.mode == "questions":
            return self._parse_txt_question_records(text)
        raise ValueError("目前只有分支與題庫模式支援批次匯入。")

    def _validate_import_records_for_mode(self, records, src: Path):
        if not records:
            raise ValueError("匯入檔沒有可用資料。")

        sample = records[:20]
        link_like = [
            r for r in sample
            if str(r.get("id", "")).startswith("link-") or (r.get("question_id") and r.get("link_level"))
        ]
        question_like = [
            r for r in sample
            if str(r.get("question_text", "")).strip() or str(r.get("answer_text", "")).strip()
        ]

        if self.mode == "questions" and link_like and not question_like:
            raise ValueError(
                "這份檔案看起來是舊版題目關聯檔（links JSONL），不是題目檔。\n\n"
                "目前系統已改成直接使用 question-db 裡的 formula_id / question_category。\n"
                "請改匯入 .questions.jsonl 或新的章節 questions.json。"
            )

    def _delete_import_records(self, records, src: Path):
        key = self._current_key()
        payload = self._current_payload()
        rows = payload.setdefault(key, [])

        ids = []
        seen = set()
        for rec in records:
            rid = str(rec.get("id", "")).strip()
            if rid and rid not in seen:
                ids.append(rid)
                seen.add(rid)
        if not ids:
            return messagebox.showwarning("提醒", "匯入檔中沒有可刪除的 id。")

        id_set = set(ids)
        keep_rows = [r for r in rows if str(r.get("id", "")).strip() not in id_set]
        deleted = len(rows) - len(keep_rows)

        if deleted == 0:
            return messagebox.showinfo("沒有符合資料", "目前資料庫中沒有找到這份匯入檔對應的 id。")

        label = {"topics": "主題", "questions": "題庫"}.get(self.mode, "資料")
        sample = "\n".join(f"- {rid}" for rid in ids[:10])
        prompt = (
            f"將依照匯入檔反向刪除資料。\n\n"
            f"匯入檔：{src.name}\n"
            f"檔內 id：{len(ids)} 筆\n"
            f"會刪除{label}：{deleted} 筆\n\n"
            f"前幾個 id：\n{sample}\n\n"
            "確定要刪除嗎？"
        )
        if not messagebox.askyesno("確認反向刪除", prompt):
            return

        payload[key] = keep_rows
        payload.setdefault("meta", {})
        payload["meta"]["count"] = len(keep_rows)
        payload["meta"]["updatedAt"] = datetime.now().isoformat(timespec="seconds")
        payload["meta"]["lastReverseImportDelete"] = {
            "source_file": str(src),
            "mode": self.mode,
            "ids_in_file": len(ids),
            "deleted": deleted,
            "deleted_links": 0,
        }

        self._write_current_db()
        self.refresh_filters()
        self.search()
        self.editor.delete("1.0", "end")
        self.status_var.set(f"反向刪除完成：{label} {deleted} 筆")
        messagebox.showinfo("完成", f"已刪除{label} {deleted} 筆")

    def _build_question_import_id_state(self, rows: list[dict]) -> tuple[set[str], dict[str, int], dict[str, int]]:
        existing_ids: set[str] = set()
        next_seq_by_chapter: dict[str, int] = defaultdict(int)
        duplicate_suffix_by_id: dict[str, int] = defaultdict(int)

        for row in rows:
            row_id = str(row.get("id", "")).strip()
            if not row_id:
                continue
            existing_ids.add(row_id)

            chapter_code = str(row.get("chapter_code", "")).strip()
            if chapter_code and row_id.startswith(f"q-{chapter_code}-"):
                suffix = row_id[len(f"q-{chapter_code}-") :]
                if suffix.isdigit():
                    next_seq_by_chapter[chapter_code] = max(next_seq_by_chapter[chapter_code], int(suffix))

            match = re.match(r"^(.*)__append__(\d+)$", row_id)
            if match:
                base_id = match.group(1)
                duplicate_suffix_by_id[base_id] = max(duplicate_suffix_by_id[base_id], int(match.group(2)))

        return existing_ids, next_seq_by_chapter, duplicate_suffix_by_id

    def _allocate_appended_question_id(
        self,
        row: dict,
        existing_ids: set[str],
        next_seq_by_chapter: dict[str, int],
        duplicate_suffix_by_id: dict[str, int],
    ) -> str:
        base_id = str(row.get("id", "")).strip()
        chapter_code = str(row.get("chapter_code", "")).strip()

        if chapter_code:
            while True:
                next_seq_by_chapter[chapter_code] += 1
                candidate = f"q-{chapter_code}-{next_seq_by_chapter[chapter_code]:04d}"
                if candidate not in existing_ids:
                    return candidate

        duplicate_suffix_by_id[base_id] += 1
        while True:
            candidate = f"{base_id}__append__{duplicate_suffix_by_id[base_id]:02d}"
            if candidate not in existing_ids:
                return candidate
            duplicate_suffix_by_id[base_id] += 1

    def batch_import(self):
        if self.mode in {"chapter", "overviews", "overview_bodies", "main_overviews", "closings"} or self._is_practice_mode():
            return messagebox.showwarning("提醒", "此模式暫不支援批次匯入，請用 JSON 編輯器逐筆處理。")
        path = filedialog.askopenfilename(title="選擇批次匯入檔", filetypes=[("Import files", "*.txt *.jsonl *.json"), ("All files", "*.*")])
        if not path:
            return
        src = Path(path)
        try:
            records = self._parse_import_file(src)
            self._validate_import_records_for_mode(records, src)
        except Exception as exc:
            return messagebox.showerror("匯入檔錯誤", str(exc))

        if self.import_delete_var.get():
            return self._delete_import_records(records, src)

        default_mode = "append" if self.mode == "questions" else "upsert"
        mode_prompt = (
            "請輸入模式：append / upsert / insert\n"
            "append = 一律新增；若 id 重複就自動改新 id\n"
            "upsert = 同 id 覆蓋\n"
            "insert = 同 id 略過"
            if self.mode == "questions"
            else "請輸入模式：upsert 或 insert"
        )
        mode = simpledialog.askstring("匯入模式", mode_prompt, initialvalue=default_mode)
        if not mode:
            return
        mode = mode.strip().lower()
        allowed_modes = {"upsert", "insert", "append"} if self.mode == "questions" else {"upsert", "insert"}
        if mode not in allowed_modes:
            options_text = "append、upsert 或 insert" if self.mode == "questions" else "upsert 或 insert"
            return messagebox.showerror("錯誤", f"模式只能是 {options_text}")

        payload = self._current_payload()
        key = self._current_key()
        rows = payload.setdefault(key, [])
        idx_map = {r.get("id"): i for i, r in enumerate(rows)}
        added = updated = skipped = renumbered = 0
        existing_ids: set[str] = set()
        next_seq_by_chapter: dict[str, int] = {}
        duplicate_suffix_by_id: dict[str, int] = {}
        if self.mode == "questions":
            existing_ids, next_seq_by_chapter, duplicate_suffix_by_id = self._build_question_import_id_state(rows)

        for rec in records:
            rid = str(rec.get("id", "")).strip()
            title = str(rec.get("title", "")).strip()
            if not rid or not title:
                continue
            if self.mode == "topics":
                rec.setdefault("formula", {"type": "text", "lines": []})
                for k in ["contentTypes", "tags", "usage", "examples", "tips", "notes", "mistakes"]:
                    rec.setdefault(k, [])
            elif self.mode == "questions":
                rec, _ = normalize_question_record(rec)
                rec.setdefault("tags", [])
                rec.setdefault("chapter_code", "")
                rec.setdefault("formula_id", "")
                rec.setdefault("question_category", "")
                rec.setdefault("target_level", "")
                rec.setdefault("target_id", "")
                rec.setdefault("target_title", "")

            if self.mode == "questions" and mode == "append":
                if rid in existing_ids:
                    rec["id"] = self._allocate_appended_question_id(rec, existing_ids, next_seq_by_chapter, duplicate_suffix_by_id)
                    renumbered += 1
                rows.append(rec)
                existing_ids.add(str(rec.get("id", "")).strip())
                idx_map[rec.get("id")] = len(rows) - 1
                added += 1
                continue

            if rid in idx_map:
                if mode == "insert":
                    skipped += 1
                else:
                    rows[idx_map[rid]] = rec
                    updated += 1
            else:
                rows.append(rec)
                idx_map[rid] = len(rows) - 1
                added += 1

        payload.setdefault("meta", {})
        payload["meta"]["count"] = len(rows)
        payload["meta"]["updatedAt"] = datetime.now().isoformat(timespec="seconds")
        self._write_current_db()
        self.refresh_filters()
        self.search()
        summary_lines = [f"新增 {added} 筆", f"更新 {updated} 筆", f"略過 {skipped} 筆"]
        if self.mode == "questions":
            summary_lines.append(f"自動改新 id {renumbered} 筆")
        summary = "\n".join(summary_lines)
        self.status_var.set(f"批次匯入完成：{summary.replace(chr(10), '｜')}")
        messagebox.showinfo("完成", summary)

    def _sync_all_bridges(self) -> dict:
        topic_count = sync_legacy_js_from_db(resolve_db_path("topics"))
        question_count = sync_question_js_from_db(resolve_db_path("questions"))
        sync_extra_web_from_db()
        practice_count = sync_practice_assignment_js_from_db(resolve_db_path("practices"))
        return {
            "topic_count": topic_count,
            "question_count": question_count,
            "practice_count": practice_count,
        }

    def _integrity_summary(self) -> tuple[list, str]:
        findings = []
        for path in [FORMULA_DB_PATH, QUESTION_DB_PATH, *formal_json_files()]:
            findings.extend(scan_json_file(path))

        by_source: dict[str, int] = defaultdict(int)
        for finding in findings:
            by_source[finding.source] += 1

        lines = [f"共找到 {len(findings)} 個可疑欄位。"]
        for source, count in sorted(by_source.items(), key=lambda item: (-item[1], item[0]))[:20]:
            lines.append(f"- {source}: {count}")
        if len(by_source) > 20:
            lines.append(f"... 其餘 {len(by_source) - 20} 個來源略")
        return findings, "\n".join(lines)

    def open_ops_toolbox(self):
        window = tk.Toplevel(self.root)
        window.title("資料工具箱")
        window.geometry("980x640")

        frame = ttk.Frame(window, padding=12)
        frame.pack(fill="both", expand=True)

        ttk.Label(
            frame,
            text="把常用的整批匯入、同步、檢查集中在這裡。之後要加新動作，也可以繼續擴在同一頁。",
            wraplength=920,
            justify="left",
        ).pack(anchor="w")

        desc = tk.Text(frame, height=10, wrap="word", font=("Microsoft JhengHei UI", 10))
        desc.pack(fill="x", pady=(10, 10))
        desc.insert(
            "1.0",
            (
                "功能說明\n"
                "1. 整批匯入正式 packs\n"
                "   來源：program-db/imports/packs/ 底下所有正式章節資料夾（不含 _inspect-*）。\n"
                "   會讀取：每章的 questions.json。\n"
                "   會更新：program-db/database/question-db.json。\n"
                "   用途：把你已完成的正式匯入檔整批寫進題庫資料庫，適合在大量修完 pack 後重建題庫。\n"
                "   注意：這一步是『pack -> 題庫資料庫』，所以如果 GUI 裡有手改但還沒同步回 pack，先不要按。\n\n"
                "2. 同步前端橋接檔\n"
                "   來源：program-db/database/formula-db.json、program-db/database/question-db.json、program-db/database/practice-db.json。\n"
                "   會更新：data/formula-content.js、data/question-content.js、data/formula-practice-assignments.js，以及章節額外橋接資料。\n"
                "   用途：讓網頁顯示吃到目前資料庫的最新內容。\n"
                "   注意：這一步不會改題目內容，只是把目前資料庫重新輸出成前端可讀格式。\n\n"
                "3. 檢查資料亂碼\n"
                "   會掃描：formula-db.json、question-db.json、以及所有正式 pack 的 questions.json / preview.json / manifest.json。\n"
                "   會檢查：可疑亂碼、替代字元、歷史壞字模式。\n"
                "   用途：在整批匯入或同步前先確認資料是不是乾淨。\n"
                "   注意：這一步預設只檢查，不會修改資料。\n\n"
                "4. Markdown 反跳脫清理\n"
                "   會處理：指定 .md 檔中的 \\\\A~\\\\Z、\\\\a~\\\\z 改成 \\A~\\Z、\\a~\\z，並把 \\=、\\+、\\-、\\>、\\<、\\_、\\. 的反斜線拿掉。\n"
                "   用途：清掉從其他來源貼進 Markdown 後，多出來的跳脫符號。\n"
                "   注意：這一步會直接覆蓋原檔，請先確認檔案是你要修改的版本。\n\n"
                "5. Word 轉 Markdown\n"
                "   會處理：指定 .docx 檔直接用 pandoc 轉成 UTF-8 Markdown；若選 .doc，會先嘗試用 LibreOffice 暫轉 .docx。\n"
                "   用途：把 Word 題卷或詳解轉成較適合無限練習整理的 .md 文字來源。\n"
                "   注意：.doc 需要本機有 LibreOffice/soffice；若沒有，請先用 Word 另存成 .docx。\n\n"
                "6. TXT 行去重\n"
                "   會處理：指定一個或多個文字檔，把後面重複出現的整行刪掉，只保留第一次出現的位置。\n"
                "   用途：整理題目清單、講義素材、暫存匯出結果時，快速去掉中間重複內容。\n"
                "   注意：比對方式是『整行文字完全相同』才算重複；預設會另存新檔，不直接覆蓋原檔。"
            ),
        )
        desc.configure(state="disabled")

        button_bar = ttk.Frame(frame)
        button_bar.pack(fill="x", pady=(12, 10))

        log = tk.Text(frame, wrap="word", font=("Consolas", 10))
        log.pack(fill="both", expand=True)

        def write_log(text: str, replace: bool = False):
            if replace:
                log.delete("1.0", "end")
            log.insert("end", text.rstrip() + "\n")
            log.see("end")

        def run_import_all():
            if not messagebox.askyesno(
                "確認",
                "將把所有正式 packs 匯入題庫資料庫 question-db.json，並同步 question-content.js。\n\n"
                "此功能現在只會新增新題號；若題目已存在，將直接跳過，不會修改也不會刪除既有題目。\n\n"
                "確定要執行嗎？",
                parent=window,
            ):
                return
            try:
                result = import_formal_packs()
                self.load_all()
                pack_list = ", ".join(result.get("packs", []))
                write_log(
                    (
                        "整批匯入完成\n"
                        f"- 正式 pack：{result.get('pack_count')}\n"
                        f"- 掃描題數：{result.get('questions_seen')}\n"
                        f"- 新增題數：{result.get('questions_added')}\n"
                        f"- 已存在而跳過：{result.get('questions_skipped_existing')}\n"
                        f"- pack 內重複而跳過：{result.get('questions_skipped_duplicate_in_packs')}\n"
                        f"- 題庫總數：{result.get('questions_total')}\n"
                        f"- packs：{pack_list}"
                    ),
                    replace=True,
                )
                self.status_var.set(
                    f"整批匯入完成：新增 {result.get('questions_added')} 題，跳過 {result.get('questions_skipped_existing')} 題"
                )
            except Exception as exc:
                messagebox.showerror("錯誤", str(exc), parent=window)

        def run_sync_all():
            try:
                result = self._sync_all_bridges()
                self.load_all()
                write_log(
                    (
                        "同步完成\n"
                        f"- 主題數：{result['topic_count']}\n"
                        f"- 題目數：{result['question_count']}\n"
                        f"- 無限練習指派：{result['practice_count']}\n"
                        "- 已更新 formula-content.js / question-content.js / formula-practice-assignments.js / 額外橋接資料"
                    ),
                    replace=True,
                )
                self.status_var.set("前端橋接檔同步完成")
            except Exception as exc:
                messagebox.showerror("錯誤", str(exc), parent=window)

        def run_integrity_check():
            try:
                findings, summary = self._integrity_summary()
                write_log(summary, replace=True)
                if findings:
                    write_log("\n前幾筆：")
                    for finding in findings[:20]:
                        write_log(f"[{finding.pattern}] {finding.source} :: {finding.locator}")
                self.status_var.set(f"完整性檢查完成：{len(findings)} 筆可疑欄位")
            except Exception as exc:
                messagebox.showerror("錯誤", str(exc), parent=window)

        def run_markdown_unescape():
            path = filedialog.askopenfilename(
                title="選擇要清理的 Markdown 檔",
                filetypes=[("Markdown files", "*.md"), ("All files", "*.*")],
                parent=window,
            )
            if not path:
                return

            md_path = Path(path)
            try:
                original = md_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                messagebox.showerror("編碼錯誤", f"目前只支援 UTF-8 文字檔：\n{md_path}", parent=window)
                return
            except Exception as exc:
                messagebox.showerror("讀檔失敗", str(exc), parent=window)
                return

            normalized, letter_count, punct_count = normalize_markdown_escapes(original)
            if normalized == original:
                write_log(
                    (
                        "Markdown 反跳脫清理完成\n"
                        f"- 檔案：{md_path}\n"
                        "- 沒有偵測到需要替換的內容"
                    ),
                    replace=True,
                )
                self.status_var.set("Markdown 清理完成：沒有需要替換的內容")
                messagebox.showinfo("完成", f"沒有需要替換的內容：\n{md_path}", parent=window)
                return

            try:
                md_path.write_text(normalized, encoding="utf-8")
            except Exception as exc:
                messagebox.showerror("寫檔失敗", str(exc), parent=window)
                return

            total = letter_count + punct_count
            write_log(
                (
                    "Markdown 反跳脫清理完成\n"
                    f"- 檔案：{md_path}\n"
                    f"- 英文字母類替換：{letter_count}\n"
                    f"- 符號類替換：{punct_count}\n"
                    f"- 總替換數：{total}\n"
                    "- 已直接覆蓋原檔"
                ),
                replace=True,
            )
            self.status_var.set(f"Markdown 清理完成：共替換 {total} 處")
            messagebox.showinfo(
                "完成",
                f"已清理並覆蓋原檔：\n{md_path}\n\n英文字母類：{letter_count}\n符號類：{punct_count}\n總替換數：{total}",
                parent=window,
            )

        def run_word_to_markdown():
            path = filedialog.askopenfilename(
                title="選擇 Word 檔",
                filetypes=[("Word files", "*.docx *.doc"), ("DOCX files", "*.docx"), ("DOC files", "*.doc"), ("All files", "*.*")],
                parent=window,
            )
            if not path:
                return

            source_path = Path(path)
            if source_path.suffix.lower() not in {".docx", ".doc"}:
                messagebox.showerror("格式錯誤", "請選擇 .docx 或 .doc 檔。", parent=window)
                return

            default_name = f"{source_path.stem}.md"
            save_path = filedialog.asksaveasfilename(
                title="選擇 Markdown 輸出位置",
                defaultextension=".md",
                initialdir=str(source_path.parent),
                initialfile=default_name,
                filetypes=[("Markdown files", "*.md"), ("All files", "*.*")],
                parent=window,
            )
            if not save_path:
                write_log(
                    (
                        "Word 轉 Markdown 已取消\n"
                        f"- 來源檔案：{source_path}\n"
                        "- 未選擇輸出位置"
                    ),
                    replace=True,
                )
                self.status_var.set("Word 轉 Markdown 已取消")
                return

            extract_media = messagebox.askyesno(
                "抽出圖片與媒體？",
                "是否要同時抽出 Word 內嵌圖片/媒體？\n\n"
                "建議選「是」：題卷中的圖形、截圖或無法轉成 TeX 的公式會保留下來。\n"
                "輸出位置會是 Markdown 同名的 _media 資料夾。",
                parent=window,
            )

            try:
                result = convert_word_to_markdown(source_path, Path(save_path), extract_media=extract_media)
            except Exception as exc:
                messagebox.showerror("轉換失敗", str(exc), parent=window)
                write_log(
                    (
                        "Word 轉 Markdown 失敗\n"
                        f"- 來源檔案：{source_path}\n"
                        f"- 錯誤：{exc}"
                    ),
                    replace=True,
                )
                self.status_var.set("Word 轉 Markdown 失敗")
                return

            lines = [
                "Word 轉 Markdown 完成",
                f"- 來源檔案：{result['source']}",
                f"- 輸出檔案：{result['output']}",
                "- 編碼：UTF-8",
            ]
            if result.get("media_dir"):
                lines.append(f"- 媒體資料夾：{result['media_dir']}")
            if result.get("converted_from_doc"):
                lines.append("- 來源為 .doc，已先透過 LibreOffice 暫轉 .docx")
            if result.get("pandoc_output"):
                lines.append("")
                lines.append(result["pandoc_output"])
            write_log("\n".join(lines), replace=True)
            self.status_var.set("Word 轉 Markdown 完成")
            messagebox.showinfo("完成", "\n".join(lines[:5]), parent=window)

        def run_txt_deduplicate():
            paths = filedialog.askopenfilenames(
                title="選擇要去重的文字檔",
                filetypes=[("All files", "*.*"), ("Text files", "*.txt")],
                parent=window,
            )
            if not paths:
                return

            selected_paths = [Path(path) for path in paths]

            def read_utf8_text(txt_path: Path):
                for encoding in ("utf-8-sig", "utf-8"):
                    try:
                        return txt_path.read_text(encoding=encoding), encoding
                    except UnicodeDecodeError:
                        continue
                raise UnicodeDecodeError("utf-8", b"", 0, 1, "目前只支援 UTF-8 文字檔")

            def default_dedup_path(txt_path: Path) -> Path:
                suffix = txt_path.suffix or ".txt"
                candidate = txt_path.with_name(f"{txt_path.stem}-dedup{suffix}")
                index = 2
                while candidate.exists():
                    candidate = txt_path.with_name(f"{txt_path.stem}-dedup-{index}{suffix}")
                    index += 1
                return candidate

            def build_dedup_result(txt_path: Path):
                original, read_encoding = read_utf8_text(txt_path)
                deduplicated, kept_count, removed_count = deduplicate_text_lines(original)
                total_lines = len(original.splitlines())
                retention_rate = (kept_count / total_lines) if total_lines else 0.0
                retention_label = f"{kept_count}/{total_lines} ({retention_rate:.1%})"
                return {
                    "path": txt_path,
                    "original": original,
                    "deduplicated": deduplicated,
                    "encoding": read_encoding,
                    "total_lines": total_lines,
                    "kept_count": kept_count,
                    "removed_count": removed_count,
                    "retention_label": retention_label,
                }

            results = []
            for txt_path in selected_paths:
                try:
                    results.append(build_dedup_result(txt_path))
                except UnicodeDecodeError:
                    messagebox.showerror("編碼錯誤", f"目前只支援 UTF-8 文字檔：\n{txt_path}", parent=window)
                    return
                except Exception as exc:
                    messagebox.showerror("讀檔失敗", f"{txt_path}\n\n{exc}", parent=window)
                    return

            if len(results) == 1:
                result = results[0]
                txt_path = result["path"]
                if result["removed_count"] == 0:
                    write_log(
                        (
                            "TXT 行去重完成\n"
                            f"- 檔案：{txt_path}\n"
                            f"- 原始行數：{result['total_lines']}\n"
                            f"- 留存率：{result['retention_label']}\n"
                            "- 沒有偵測到重複行"
                        ),
                        replace=True,
                    )
                    self.status_var.set(f"TXT 去重完成：沒有重複行，留存率 {result['retention_label']}")
                    messagebox.showinfo(
                        "完成",
                        f"沒有偵測到重複行：\n{txt_path}\n\n留存率：{result['retention_label']}",
                        parent=window,
                    )
                    return

                default_name = f"{txt_path.stem}-dedup{txt_path.suffix or '.txt'}"
                save_path = filedialog.asksaveasfilename(
                    title="另存去重結果",
                    defaultextension=txt_path.suffix or ".txt",
                    initialdir=str(txt_path.parent),
                    initialfile=default_name,
                    filetypes=[("All files", "*.*"), ("Text files", "*.txt")],
                    parent=window,
                )
                if not save_path:
                    write_log(
                        (
                            "TXT 行去重已取消輸出\n"
                            f"- 檔案：{txt_path}\n"
                            f"- 原始行數：{result['total_lines']}\n"
                            f"- 保留行數：{result['kept_count']}\n"
                            f"- 留存率：{result['retention_label']}\n"
                            f"- 刪除重複行：{result['removed_count']}"
                        ),
                        replace=True,
                    )
                    self.status_var.set(f"TXT 去重已完成但取消存檔：留存率 {result['retention_label']}")
                    return

                out_path = Path(save_path)
                try:
                    out_path.write_text(result["deduplicated"], encoding=result["encoding"] or "utf-8")
                except Exception as exc:
                    messagebox.showerror("寫檔失敗", str(exc), parent=window)
                    return

                write_log(
                    (
                        "TXT 行去重完成\n"
                        f"- 來源檔案：{txt_path}\n"
                        f"- 輸出檔案：{out_path}\n"
                        f"- 原始行數：{result['total_lines']}\n"
                        f"- 保留行數：{result['kept_count']}\n"
                        f"- 留存率：{result['retention_label']}\n"
                        f"- 刪除重複行：{result['removed_count']}\n"
                        "- 規則：保留第一次出現，移除後續完全相同的整行"
                    ),
                    replace=True,
                )
                self.status_var.set(f"TXT 去重完成：刪除 {result['removed_count']} 行，留存率 {result['retention_label']}")
                messagebox.showinfo(
                    "完成",
                    (
                        f"TXT 去重完成：\n{txt_path}\n\n"
                        f"原始行數：{result['total_lines']}\n"
                        f"保留行數：{result['kept_count']}\n"
                        f"留存率：{result['retention_label']}\n"
                        f"刪除重複行：{result['removed_count']}\n\n"
                        f"已輸出到：\n{out_path}"
                    ),
                    parent=window,
                )
                return

            written = []
            unchanged = []
            for result in results:
                if result["removed_count"] == 0:
                    unchanged.append(result)
                    continue
                out_path = default_dedup_path(result["path"])
                try:
                    out_path.write_text(result["deduplicated"], encoding=result["encoding"] or "utf-8")
                except Exception as exc:
                    messagebox.showerror("寫檔失敗", f"{out_path}\n\n{exc}", parent=window)
                    return
                result["out_path"] = out_path
                written.append(result)

            total_removed = sum(result["removed_count"] for result in results)
            lines = [
                "TXT 批次行去重完成",
                f"- 選取檔案：{len(results)}",
                f"- 輸出檔案：{len(written)}",
                f"- 無重複檔案：{len(unchanged)}",
                f"- 刪除重複行總數：{total_removed}",
                "- 規則：保留第一次出現，移除後續完全相同的整行",
            ]
            if written:
                lines.append("")
                lines.append("已輸出：")
                for result in written:
                    lines.append(
                        f"- {result['path']} -> {result['out_path']}；刪除 {result['removed_count']} 行，留存率 {result['retention_label']}"
                    )
            if unchanged:
                lines.append("")
                lines.append("沒有偵測到重複行：")
                for result in unchanged:
                    lines.append(f"- {result['path']}；留存率 {result['retention_label']}")

            write_log("\n".join(lines), replace=True)
            self.status_var.set(f"TXT 批次去重完成：{len(written)} 個輸出檔，刪除 {total_removed} 行")
            messagebox.showinfo(
                "完成",
                f"TXT 批次去重完成。\n\n選取檔案：{len(results)}\n輸出檔案：{len(written)}\n無重複檔案：{len(unchanged)}\n刪除重複行總數：{total_removed}",
                parent=window,
            )

        ttk.Button(button_bar, text="整批匯入正式 packs", style="Compact.TButton", command=run_import_all).pack(side="left")
        ttk.Button(button_bar, text="同步前端橋接檔", style="Compact.TButton", command=run_sync_all).pack(side="left", padx=(8, 0))
        ttk.Button(button_bar, text="檢查資料亂碼", style="Compact.TButton", command=run_integrity_check).pack(side="left", padx=(8, 0))
        ttk.Button(button_bar, text="Markdown 反跳脫清理", style="Compact.TButton", command=run_markdown_unescape).pack(side="left", padx=(8, 0))
        ttk.Button(button_bar, text="Word轉MD", style="Compact.TButton", command=run_word_to_markdown).pack(side="left", padx=(8, 0))
        ttk.Button(button_bar, text="TXT 行去重", style="Compact.TButton", command=run_txt_deduplicate).pack(side="left", padx=(8, 0))
        ttk.Button(button_bar, text="講義產生器 v1", style="Compact.TButton", command=self.open_lesson_generator).pack(side="left", padx=(8, 0))
        ttk.Button(button_bar, text="關閉", style="Compact.TButton", command=window.destroy).pack(side="right")

        write_log(
            "這裡會顯示每次工具動作的結果。\n"
            "- 整批匯入正式 packs：formal packs -> question-db.json\n"
            "- 同步前端橋接檔：formula-db / question-db / practice-db -> data/*.js\n"
            "- 檢查資料亂碼：掃描資料庫與正式匯入檔，不直接修改\n"
            "- Markdown 反跳脫清理：清掉指定 .md 檔內多餘的反斜線，直接覆蓋原檔\n"
            "- Word轉MD：將 .docx/.doc 轉成 UTF-8 Markdown，必要時抽出圖片媒體\n"
            "- TXT 行去重：可複選檔案，保留第一次出現，刪掉後面重複整行，預設另存新檔\n"
            "- 講義產生器 v1：開啟章節講義預覽與輸出工具",
            replace=True,
        )

    def _selected_question_rows(self):
        if self.mode != "questions":
            return []
        selected = self.tree.selection()
        if not selected:
            return []
        question_by_id = {
            str(row.get("id", "")).strip(): row
            for row in self.question_payload.get("questions", [])
            if isinstance(row, dict) and str(row.get("id", "")).strip()
        }
        rows = []
        seen = set()
        for item_id in selected:
            try:
                idx = int(item_id)
            except ValueError:
                continue
            if not (0 <= idx < len(self.filtered)):
                continue
            qid = str(self.filtered[idx].get("id", "")).strip()
            if not qid or qid in seen or qid not in question_by_id:
                continue
            seen.add(qid)
            rows.append(question_by_id[qid])
        return rows

    def _selected_practice_record_rows(self):
        if self.mode != "practice_records":
            return []
        selected = self.tree.selection()
        if not selected:
            return []
        practice_by_id = {
            str(row.get("id", "")).strip(): row
            for row in self.practice_payload.get("practices", [])
            if isinstance(row, dict) and str(row.get("id", "")).strip()
        }
        rows = []
        seen = set()
        for item_id in selected:
            try:
                idx = int(item_id)
            except ValueError:
                continue
            if not (0 <= idx < len(self.filtered)):
                continue
            pid = str(self.filtered[idx].get("id", "")).strip()
            if not pid or pid in seen or pid not in practice_by_id:
                continue
            seen.add(pid)
            rows.append(practice_by_id[pid])
        return rows

    def _question_category_options(self):
        existing = sorted(
            {
                str(row.get("question_category", "")).strip()
                for row in self.question_payload.get("questions", [])
                if isinstance(row, dict) and str(row.get("question_category", "")).strip()
            }
        )
        ordered = ["基本", "重要", "綜合", "段考", "歷屆", "模考", "備用"]
        extras = [value for value in existing if value not in ordered]
        return ordered + extras

    def _question_difficulty_options(self):
        existing = sorted(
            {
                str(row.get("difficulty", "")).strip()
                for row in self.question_payload.get("questions", [])
                if isinstance(row, dict) and str(row.get("difficulty", "")).strip()
            }
        )
        ordered = ["易", "中", "難", "進階", "挑戰"]
        extras = [value for value in existing if value not in ordered]
        return ordered + extras

    def _formula_item_by_id(self):
        return {
            str(item.get("id", "")).strip(): item
            for item in self.topic_payload.get("topics", [])
            if isinstance(item, dict) and str(item.get("id", "")).strip()
        }

    def _build_assignment_target_options(self, chapter_code: str, target_level: str):
        chapter_code = str(chapter_code or "").strip()
        topic_by_id = self._formula_item_by_id()
        options = []
        for item in self.topic_payload.get("topics", []):
            if not isinstance(item, dict):
                continue
            item_id = str(item.get("id", "")).strip()
            item_code = str(item.get("chapterCode") or item.get("chapter_code") or "").strip()
            parent_id = str(item.get("parentId", "")).strip()
            if not item_id or item_code != chapter_code:
                continue
            if target_level == "topic" and parent_id:
                continue
            if target_level == "branch" and not parent_id:
                continue
            parent_title = ""
            if parent_id:
                parent = topic_by_id.get(parent_id, {})
                parent_title = str(parent.get("title", "") or parent_id).strip()
            title = str(item.get("title", "") or item_id).strip()
            role = str(item.get("chapterRole", "")).strip()
            label_parts = [title]
            if parent_title:
                label_parts.append(f" / {parent_title}")
            if role:
                label_parts.append(f" [{role}]")
            label_parts.append(f" <{item_id}>")
            options.append(
                {
                    "id": item_id,
                    "title": title,
                    "chapter_code": item_code,
                    "parent_id": parent_id,
                    "label": "".join(label_parts),
                }
            )
        options.sort(key=lambda row: (row.get("title", ""), row.get("id", "")))
        return options

    def _resolve_question_assignment(self, question: dict):
        chapter_code = str(
            question.get("chapter_code")
            or question.get("chapterCode")
            or question.get("chapter")
            or ""
        ).strip()
        formula_id = str(question.get("formula_id", "") or question.get("formulaId", "")).strip()
        target_level = str(question.get("target_level", "")).strip()
        target_id = str(question.get("target_id", "")).strip()
        topic_by_id = self._formula_item_by_id()
        if formula_id:
            target = topic_by_id.get(formula_id, {})
            level = "branch" if str(target.get("parentId", "")).strip() else "topic"
            return chapter_code, level, formula_id
        if target_level in {"topic", "branch"} and target_id:
            return chapter_code, target_level, target_id
        if target_level == "chapter" and target_id:
            return chapter_code or target_id, "chapter", target_id

        if chapter_code:
            return chapter_code, "chapter", chapter_code
        return "", "chapter", ""

    def _normalize_question_tags_for_target(self, tags, target_level: str, target_id: str):
        cleaned = []
        seen = set()
        for tag in tags or []:
            text = str(tag or "").strip()
            if not text:
                continue
            lower = text.lower()
            if lower.startswith("topic:") or lower.startswith("topic=") or lower.startswith("branch-topic:"):
                continue
            if text in seen:
                continue
            seen.add(text)
            cleaned.append(text)

        if target_level == "topic" and target_id:
            cleaned.append(f"topic:{target_id}")
        elif target_level == "branch" and target_id:
            cleaned.append(f"branch-topic:{target_id}")
        return cleaned

    def _make_manual_question_link(self, question: dict, chapter_code: str, target_level: str, target_id: str, target_title: str):
        question_id = str(question.get("id", "")).strip()
        title = str(target_title or target_id or chapter_code).strip()
        link_level = "chapter" if target_level == "chapter" else "topic"
        target_token = target_id if link_level == "topic" else chapter_code
        link_id = re.sub(r"[^A-Za-z0-9_-]+", "-", f"link-{question_id}-manual-{link_level}-{target_token}").strip("-").lower()
        now = datetime.now().isoformat(timespec="seconds")
        return {
            "id": link_id,
            "title": f"{question_id} -> {title}",
            "question_id": question_id,
            "question_title": str(clean_question_title(question.get("title", "")) or question_id),
            "topic_id": target_id if link_level == "topic" else "",
            "chapter_code": chapter_code,
            "link_level": link_level,
            "source_type": "manual",
            "source_ref": "gui-assignment",
            "confidence": 1.0,
            "created_at": now,
            "updated_at": now,
        }

    def open_question_assignment_dialog(self):
        if self.mode != "questions":
            return messagebox.showwarning("提醒", "請先切到題庫模式再做題目指派。")

        selected_rows = self._selected_question_rows()
        if not selected_rows:
            return messagebox.showwarning("提醒", "請先在左邊選至少一題。")

        chapter_options = self._chapter_code_options()
        if not chapter_options:
            return messagebox.showwarning("提醒", "目前沒有可用的章節代號。")

        first_code, first_level, first_target_id = self._resolve_question_assignment(selected_rows[0])
        first_chapter_display = next(
            (item for item in chapter_options if self._chapter_code_from_selection(item) == first_code),
            chapter_options[0],
        )

        dialog = tk.Toplevel(self.root)
        dialog.title("題目指派")
        dialog.transient(self.root)
        dialog.grab_set()
        dialog.geometry("760x420")

        frame = ttk.Frame(dialog, padding=12)
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text=f"已選 {len(selected_rows)} 題").grid(row=0, column=0, columnspan=2, sticky="w")

        chapter_var = tk.StringVar(value=first_chapter_display)
        level_labels = {"chapter": "章節", "topic": "主題", "branch": "分支"}
        level_lookup = {value: key for key, value in level_labels.items()}
        level_var = tk.StringVar(value=level_labels.get(first_level, "章節"))
        target_var = tk.StringVar()
        preview_text = "\n".join(
            f"- {clean_question_title(row.get('title', '')) or row.get('id', '')}"
            for row in selected_rows[:8]
        )
        if len(selected_rows) > 8:
            preview_text += f"\n... 另外還有 {len(selected_rows) - 8} 題"

        ttk.Label(frame, text="章節").grid(row=1, column=0, sticky="w", pady=(10, 4))
        chapter_combo = ttk.Combobox(frame, textvariable=chapter_var, values=chapter_options, state="readonly", width=48)
        chapter_combo.grid(row=1, column=1, sticky="ew", pady=(10, 4))

        ttk.Label(frame, text="掛載層級").grid(row=2, column=0, sticky="w", pady=4)
        level_combo = ttk.Combobox(
            frame,
            textvariable=level_var,
            values=[level_labels["chapter"], level_labels["topic"], level_labels["branch"]],
            state="readonly",
            width=16,
        )
        level_combo.grid(row=2, column=1, sticky="w", pady=4)

        ttk.Label(frame, text="目標").grid(row=3, column=0, sticky="w", pady=4)
        target_combo = ttk.Combobox(frame, textvariable=target_var, state="readonly", width=64)
        target_combo.grid(row=3, column=1, sticky="ew", pady=4)

        ttk.Label(frame, text="目前選取").grid(row=4, column=0, sticky="nw", pady=(12, 4))
        preview = tk.Text(frame, height=10, wrap="word")
        preview.grid(row=4, column=1, sticky="nsew", pady=(12, 4))
        preview.insert("1.0", preview_text)
        preview.configure(state="disabled")

        status_var = tk.StringVar(value="")
        ttk.Label(frame, textvariable=status_var).grid(row=5, column=0, columnspan=2, sticky="w", pady=(4, 0))

        frame.columnconfigure(1, weight=1)
        frame.rowconfigure(4, weight=1)

        target_lookup = {}

        def refresh_targets(*_args):
            chapter_code = self._chapter_code_from_selection(chapter_var.get())
            level_key = level_lookup.get(level_var.get(), "chapter")
            current_value = target_var.get()
            values = []
            target_lookup.clear()

            if level_key == "chapter":
                label = self._chapter_label(chapter_code)
                if label:
                    values = [label]
                    target_lookup[label] = {
                        "id": chapter_code,
                        "title": label,
                        "chapter_code": chapter_code,
                    }
            else:
                options = self._build_assignment_target_options(chapter_code, level_key)
                values = [option["label"] for option in options]
                for option in options:
                    target_lookup[option["label"]] = option

            target_combo["values"] = values
            if level_key != "chapter" and first_target_id:
                matched = next(
                    (label for label, option in target_lookup.items() if option.get("id") == first_target_id),
                    "",
                )
            else:
                matched = ""
            target_var.set(current_value if current_value in values else (matched or (values[0] if values else "")))
            status_var.set(f"章節 {chapter_code} 可選 {len(values)} 個目標")

        def apply_assignment():
            chapter_code = self._chapter_code_from_selection(chapter_var.get())
            level_key = level_lookup.get(level_var.get(), "chapter")
            selected_target = target_lookup.get(target_var.get())
            if not chapter_code:
                return messagebox.showerror("錯誤", "請先選章節。")
            if level_key != "chapter" and not selected_target:
                return messagebox.showerror("錯誤", "請先選主題或分支。")

            question_ids = {str(row.get("id", "")).strip() for row in selected_rows if str(row.get("id", "")).strip()}
            question_rows = self.question_payload.setdefault("questions", [])
            question_index = {
                str(row.get("id", "")).strip(): idx
                for idx, row in enumerate(question_rows)
                if isinstance(row, dict) and str(row.get("id", "")).strip()
            }

            chapter_title = self._chapter_label(chapter_code)
            target_id = chapter_code if level_key == "chapter" else str(selected_target.get("id", "")).strip()
            target_title = chapter_title if level_key == "chapter" else str(selected_target.get("title", "")).strip()

            for question in selected_rows:
                question_id = str(question.get("id", "")).strip()
                if question_id not in question_index:
                    continue
                row = dict(question_rows[question_index[question_id]])
                row, _ = normalize_question_record(row)
                row["chapter_code"] = chapter_code
                row["chapter"] = chapter_code
                row["target_level"] = level_key
                row["target_id"] = target_id
                row["target_title"] = target_title
                row["formula_id"] = "" if level_key == "chapter" else target_id
                if not str(row.get("question_category", "")).strip():
                    row["question_category"] = "綜合" if level_key == "chapter" else "重要"
                row["tags"] = self._normalize_question_tags_for_target(row.get("tags", []), level_key, target_id)
                question_rows[question_index[question_id]] = row

            self.question_payload.setdefault("meta", {})
            self.question_payload["meta"]["count"] = len(question_rows)
            self.question_payload["meta"]["updatedAt"] = datetime.now().isoformat(timespec="seconds")
            self.question_payload["meta"]["lastAssignmentEdit"] = {
                "updated_questions": len(question_ids),
                "target_level": level_key,
                "target_id": target_id,
            }

            self._write_db_payload("questions", self.question_payload)
            self.refresh_filters()
            self.search()
            self.status_var.set(f"題目指派完成：{len(question_ids)} 題 -> {target_title}")
            dialog.destroy()
            messagebox.showinfo("完成", f"已更新 {len(question_ids)} 題，目標：{target_title}")

        button_bar = ttk.Frame(frame)
        button_bar.grid(row=6, column=0, columnspan=2, sticky="e", pady=(12, 0))
        ttk.Button(button_bar, text="取消", command=dialog.destroy).pack(side="right", padx=(6, 0))
        ttk.Button(button_bar, text="套用", command=apply_assignment).pack(side="right")

        chapter_combo.bind("<<ComboboxSelected>>", refresh_targets)
        level_combo.bind("<<ComboboxSelected>>", refresh_targets)
        refresh_targets()

    def open_question_meta_edit_dialog(self):
        if self.mode != "questions":
            return messagebox.showwarning("提醒", "請先切到題庫模式再修改題目分類或難度。")

        selected_rows = self._selected_question_rows()
        if not selected_rows:
            return messagebox.showwarning("提醒", "請先在左邊選至少一題。")

        dialog = tk.Toplevel(self.root)
        dialog.title("批次修改題目分類 / 難度")
        dialog.transient(self.root)
        dialog.grab_set()
        dialog.geometry("760x430")

        frame = ttk.Frame(dialog, padding=12)
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text=f"已選 {len(selected_rows)} 題").grid(row=0, column=0, columnspan=2, sticky="w")

        no_change = "（不修改）"
        category_options = [no_change] + self._question_category_options()
        difficulty_options = [no_change] + self._question_difficulty_options()

        current_categories = sorted(
            {str(row.get("question_category", "")).strip() or "（空白）" for row in selected_rows}
        )
        current_difficulties = sorted(
            {str(row.get("difficulty", "")).strip() or "（空白）" for row in selected_rows}
        )

        category_var = tk.StringVar(value=no_change)
        difficulty_var = tk.StringVar(value=no_change)
        preview_text = "\n".join(
            f"- {clean_question_title(row.get('title', '')) or row.get('id', '')}"
            for row in selected_rows[:8]
        )
        if len(selected_rows) > 8:
            preview_text += f"\n... 另外還有 {len(selected_rows) - 8} 題"

        ttk.Label(frame, text="目前分類").grid(row=1, column=0, sticky="nw", pady=(10, 4))
        ttk.Label(frame, text="、".join(current_categories), wraplength=500, justify="left").grid(
            row=1, column=1, sticky="w", pady=(10, 4)
        )

        ttk.Label(frame, text="目前難度").grid(row=2, column=0, sticky="nw", pady=4)
        ttk.Label(frame, text="、".join(current_difficulties), wraplength=500, justify="left").grid(
            row=2, column=1, sticky="w", pady=4
        )

        ttk.Label(frame, text="新分類").grid(row=3, column=0, sticky="w", pady=(10, 4))
        category_combo = ttk.Combobox(frame, textvariable=category_var, values=category_options, state="readonly", width=24)
        category_combo.grid(row=3, column=1, sticky="w", pady=(10, 4))

        ttk.Label(frame, text="新難度").grid(row=4, column=0, sticky="w", pady=4)
        difficulty_combo = ttk.Combobox(frame, textvariable=difficulty_var, values=difficulty_options, state="readonly", width=24)
        difficulty_combo.grid(row=4, column=1, sticky="w", pady=4)

        ttk.Label(frame, text="目前選取").grid(row=5, column=0, sticky="nw", pady=(12, 4))
        preview = tk.Text(frame, height=10, wrap="word")
        preview.grid(row=5, column=1, sticky="nsew", pady=(12, 4))
        preview.insert("1.0", preview_text)
        preview.configure(state="disabled")

        status_var = tk.StringVar(value="可只改分類、只改難度，或兩者一起改。")
        ttk.Label(frame, textvariable=status_var).grid(row=6, column=0, columnspan=2, sticky="w", pady=(4, 0))

        frame.columnconfigure(1, weight=1)
        frame.rowconfigure(5, weight=1)

        def apply_meta_edit():
            new_category = category_var.get().strip()
            new_difficulty = difficulty_var.get().strip()
            if new_category == no_change:
                new_category = ""
            if new_difficulty == no_change:
                new_difficulty = ""
            if not new_category and not new_difficulty:
                return messagebox.showwarning("提醒", "請至少選一個要修改的欄位。", parent=dialog)

            question_ids = {str(row.get("id", "")).strip() for row in selected_rows if str(row.get("id", "")).strip()}
            question_rows = self.question_payload.setdefault("questions", [])
            question_index = {
                str(row.get("id", "")).strip(): idx
                for idx, row in enumerate(question_rows)
                if isinstance(row, dict) and str(row.get("id", "")).strip()
            }

            updated = 0
            for question in selected_rows:
                question_id = str(question.get("id", "")).strip()
                if question_id not in question_index:
                    continue
                row = dict(question_rows[question_index[question_id]])
                row, _ = normalize_question_record(row)
                changed = False
                if new_category and str(row.get("question_category", "")).strip() != new_category:
                    row["question_category"] = new_category
                    changed = True
                if new_difficulty and str(row.get("difficulty", "")).strip() != new_difficulty:
                    row["difficulty"] = new_difficulty
                    changed = True
                if changed:
                    question_rows[question_index[question_id]] = row
                    updated += 1

            self.question_payload.setdefault("meta", {})
            self.question_payload["meta"]["count"] = len(question_rows)
            self.question_payload["meta"]["updatedAt"] = datetime.now().isoformat(timespec="seconds")
            self.question_payload["meta"]["lastQuestionMetaEdit"] = {
                "updated_questions": updated,
                "question_category": new_category,
                "difficulty": new_difficulty,
            }

            self._write_db_payload("questions", self.question_payload)
            self.refresh_filters()
            self.search()
            self.status_var.set(f"批次修改完成：{updated} 題")
            dialog.destroy()
            messagebox.showinfo(
                "完成",
                f"已更新 {updated} 題\n"
                f"分類：{new_category or '不修改'}\n"
                f"難度：{new_difficulty or '不修改'}",
            )

        button_bar = ttk.Frame(frame)
        button_bar.grid(row=7, column=0, columnspan=2, sticky="e", pady=(12, 0))
        ttk.Button(button_bar, text="取消", command=dialog.destroy).pack(side="right", padx=(6, 0))
        ttk.Button(button_bar, text="套用", command=apply_meta_edit).pack(side="right")

def main():
    root = tk.Tk()
    app = DualDbGui(root)
    root.mainloop()


if __name__ == "__main__":
    main()
