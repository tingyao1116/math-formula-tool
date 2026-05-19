import json
import re
import subprocess
import sys
import tkinter as tk
from collections import defaultdict
from datetime import datetime
from html import escape
from pathlib import Path
from tempfile import NamedTemporaryFile
from tkinter import filedialog, messagebox, simpledialog, ttk

try:
    from PIL import Image, ImageTk
except Exception:
    Image = None
    ImageTk = None

from question_data_utils import (
    clean_question_body,
    clean_question_title,
    normalize_question_record,
)
from check_text_integrity import FORMULA_DB_PATH, QUESTION_DB_PATH, formal_json_files, scan_json_file
from import_formal_question_packs import import_formal_packs
from practice_db_utils import (
    DB_PATH as PRACTICE_DB_DEFAULT,
    LEGACY_PRACTICE_JS_PATH,
    extract_legacy_practice_catalog,
    load_practice_payload,
    normalize_practice_assignment,
    now_iso as practice_now_iso,
)
from sync_legacy_bridge import sync_legacy_js_from_db
from sync_extra_bridge import sync_extra_web_from_db
from sync_practice_bridge import sync_practice_assignment_js_from_db
from sync_web_data import sync_question_js_from_db

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


def normalize_markdown_escapes(text: str) -> tuple[str, int, int]:
    text, letter_count = LETTER_ESCAPE_RE.subn(lambda match: "\\" + match.group(1), text)
    text, punct_count = PUNCT_ESCAPE_RE.subn(r"\1", text)
    return text, letter_count, punct_count


class DualDbGui:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Formula / Question DB 管理介面")
        self.root.geometry("1380x800")

        self.mode = "topics"
        self.topic_payload = {"meta": {}, "topics": []}
        self.question_payload = {"meta": {}, "questions": []}
        self.chapter_payload = {"meta": {}, "catalog": {}}
        self.overview_payload = {"meta": {}, "overviews": {}}
        self.overview_body_payload = {"meta": {}, "bodies": {}}
        self.closing_payload = {"meta": {}, "closings": {}}
        self.main_overview_payload = {"meta": {}, "byId": {}}
        self.practice_payload = {"meta": {}, "assignments": []}
        self.filtered = []
        self._legacy_practice_catalog_cache = None

        self.keyword_var = tk.StringVar()
        self.stage_var = tk.StringVar(value=ALL)
        self.grade_var = tk.StringVar(value=ALL)
        self.chapter_var = tk.StringVar(value=ALL)
        self.difficulty_var = tk.StringVar(value=ALL)
        self.import_delete_var = tk.BooleanVar(value=False)
        self.editor_wrap_var = tk.BooleanVar(value=True)
        self.preview_auto_load_var = tk.BooleanVar(value=True)
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
        self.practice_btn = ttk.Button(filter_bar, text="無限練習", style="Compact.TButton", command=lambda: self.switch_mode("practices"))
        self.practice_btn.pack(side="left", padx=(0, 10))
        self.topic_btn = ttk.Button(filter_bar, text="分支模式", style="Compact.TButton", command=lambda: self.switch_mode("topics"))
        self.topic_btn.pack(side="left", padx=(0, 10))
        self.question_btn = ttk.Button(filter_bar, text="題庫模式", style="Compact.TButton", command=lambda: self.switch_mode("questions"))
        self.question_btn.pack(side="left", padx=(0, 10))
        ttk.Label(filter_bar, text="關鍵字").pack(side="left")
        ttk.Entry(filter_bar, textvariable=self.keyword_var, width=24).pack(side="left", padx=(4, 10))
        ttk.Button(filter_bar, text="查詢", style="Compact.TButton", command=self.search).pack(side="left", padx=(0, 10))

        ttk.Label(filter_detail_bar, text="學層").pack(side="left")
        self.stage_combo = ttk.Combobox(filter_detail_bar, textvariable=self.stage_var, width=10, state="readonly")
        self.stage_combo.pack(side="left", padx=(4, 10))

        ttk.Label(filter_detail_bar, text="年級").pack(side="left")
        self.grade_combo = ttk.Combobox(filter_detail_bar, textvariable=self.grade_var, width=10, state="readonly")
        self.grade_combo.pack(side="left", padx=(4, 10))

        ttk.Label(filter_detail_bar, text="章節").pack(side="left")
        self.chapter_combo = ttk.Combobox(filter_detail_bar, textvariable=self.chapter_var, width=44, state="readonly")
        self.chapter_combo.pack(side="left", padx=(4, 10))

        ttk.Label(filter_detail_bar, text="難度").pack(side="left")
        self.difficulty_combo = ttk.Combobox(filter_detail_bar, textvariable=self.difficulty_var, width=10, state="readonly")
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
        ttk.Button(action_bar, text="匯出主題PDF", style="Compact.TButton", command=self.export_selected_topics_pdf).pack(side="left", padx=4)

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
        if self.mode == "practices":
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
        if self.mode == "practices":
            return "assignments"
        return "catalog"

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
        return resolve_db_path(self.mode)

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
        self._write_db_payload(self.mode, self._current_payload())

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
                    self.practice_payload = {"meta": {"count": 0}, "assignments": []}
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
                self.practice_payload = payload if isinstance(payload.get("assignments", []), list) else {"meta": {}, "assignments": []}
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
        self.practice_btn.state(["!disabled"] if mode != "practices" else ["disabled"])
        mode_label = {
            "topics": "分支",
            "questions": "題庫",
            "chapter": "章節代碼",
            "overviews": "章節前言",
            "overview_bodies": "章節正文",
            "main_overviews": "主題整理",
            "closings": "章節後話",
            "practices": "無限練習",
        }.get(mode, mode)
        self.status_var.set(f"目前模式：{mode_label}")
        self.refresh_filters()
        self.search()

    def _all_rows(self):
        payload = self._current_payload()
        if self.mode in {"topics", "questions"}:
            return payload.get(self._current_key(), [])
        if self.mode == "practices":
            return self._practice_rows()
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

    def _practice_assignment_lookup(self):
        rows = self.practice_payload.get("assignments", []) if isinstance(self.practice_payload, dict) else []
        lookup = {}
        for row in rows if isinstance(rows, list) else []:
            if not isinstance(row, dict):
                continue
            rid = str(row.get("id", "")).strip()
            if rid:
                lookup[rid] = normalize_practice_assignment(row)
        return lookup

    def _practice_rows(self):
        topic_lookup = self._topic_lookup()
        catalog = self._legacy_practice_catalog()
        assignment_lookup = self._practice_assignment_lookup()
        direct_topic_ids = {pid for pid in catalog if pid in topic_lookup}
        all_ids = sorted(direct_topic_ids | set(assignment_lookup), key=lambda value: str(value))
        rows = []
        for rid in all_ids:
            topic_meta = topic_lookup.get(rid, {})
            legacy = catalog.get(rid, {})
            assignment = assignment_lookup.get(rid)
            mode = assignment.get("mode", "") if assignment else ("generator" if legacy else "")
            practice_key = assignment.get("practiceKey", "") if assignment else rid
            row = {
                "id": rid,
                "title": str(topic_meta.get("title", "") or rid),
                "topicTitle": str(topic_meta.get("title", "") or ""),
                "stage": str(topic_meta.get("stage", "") or ""),
                "grade": str(topic_meta.get("grade", "") or ""),
                "term": str(topic_meta.get("term", "") or ""),
                "chapter": str(topic_meta.get("chapter", "") or ""),
                "chapter_code": str(topic_meta.get("chapterCode", "") or topic_meta.get("chapter_code", "") or ""),
                "difficulty": str(
                    assignment.get("difficulty", "") if assignment else (legacy.get("difficulty", "") or topic_meta.get("difficulty", ""))
                ),
                "practice_mode": mode,
                "practiceKey": practice_key,
                "enabled": assignment.get("enabled", True) if assignment else True,
                "questionCount": int(
                    assignment.get("questionCount", 0) if assignment else (legacy.get("questionCount", 0) or 0)
                ),
                "practiceTitle": str(assignment.get("title", "") if assignment else (legacy.get("title", "") or "")),
                "legacyDirect": rid in direct_topic_ids,
                "dbRecord": assignment or None,
                "notes": str(assignment.get("notes", "") if assignment else ""),
            }
            if assignment and mode == "fixed-example":
                row["prompt"] = assignment.get("prompt", "")
                row["answer"] = assignment.get("answer", "")
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
        names = {str(v).strip() for v in tokens.get("names", set()) if str(v).strip()}
        row_chapter = str(row.get("chapter", "")).strip()
        row_code = str(row.get("chapter_code", "") or row.get("chapterCode", "")).strip()
        row_id = str(row.get("id", "")).strip()
        parent_id = str(row.get("parentId", "")).strip()
        if code:
            meta = self._chapter_catalog().get(code, {})
            section = str(meta.get("section", "")).strip() if isinstance(meta, dict) else ""
            chapter_name = str(meta.get("chapter", "")).strip() if isinstance(meta, dict) else ""
            if row_code == code or row_chapter == code:
                return True
            if row_code and self._is_parent_chapter_code(code) and self._code_family(row_code) == self._code_family(code):
                return True
            if row_id.startswith(code) or parent_id.startswith(code):
                return True
            if section and row_chapter == section:
                return True
            if (
                chapter_name
                and row_chapter == chapter_name
                and self._is_parent_chapter_code(code)
            ):
                return True
            return False
        if row_chapter and row_chapter in names:
            return True
        if row_code and row_code in names:
            return True
        return False

    def _chapter_label_sort_key(self, display: str):
        code = self._chapter_code_from_selection(display)
        return (*self._chapter_code_sort_key(code), display)

    def _chapter_code_sort_key(self, code: str):
        lower = str(code or "").strip().lower()
        m = re.match(r"^([js])(\d+)(?:-(\d+))?(?:-(\d+))?(?:-(\d+))?$", lower)
        if m:
            prefix_order = {"j": 0, "s": 1}.get(m.group(1), 9)
            nums = [int(part) if part else -1 for part in m.groups()[1:]]
            return (prefix_order, *nums)
        if lower.startswith("b-"):
            try:
                return (2, int(lower.split("-", 1)[1]), -1, -1, -1)
            except ValueError:
                return (2, 999, -1, -1, -1)
        return (9, 999, 999, 999, 999)

    def _row_sort_key(self, row: dict):
        if self.mode in {"chapter", "overviews", "overview_bodies", "main_overviews", "closings"}:
            code = str(row.get("chapter_code", "") or row.get("chapterCode", "") or row.get("id", "")).strip()
            return (
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
                if row_code or row_chapter:
                    if row_code and row_code not in catalog:
                        add_option(row_code, row_code, [row_code, row_chapter])
                    elif row_chapter and not any(row_chapter in data.get("names", set()) for data in lookup.values()):
                        add_option(row_chapter, "", [row_chapter])

        values.sort(key=self._chapter_label_sort_key)

        self.chapter_filter_lookup = lookup
        return [ALL] + values

    def refresh_filters(self):
        rows = self._all_rows()
        stages = sorted({r.get("stage", "") for r in rows if r.get("stage")})
        grades = sorted({r.get("grade", "") for r in rows if r.get("grade")})
        chapters = self._build_chapter_filter_values(rows)
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
        grades = sorted({r.get("grade", "") for r in rows if r.get("grade") and (not stage or r.get("stage") == stage)})
        self.grade_combo["values"] = [ALL] + grades
        if self.grade_var.get() not in self.grade_combo["values"]:
            self.grade_var.set(ALL)
        self._on_grade_changed()
        self.search()

    def _on_grade_changed(self):
        self.chapter_combo["values"] = self._build_chapter_filter_values()
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
                elif self.mode == "practices":
                    blob_parts += [
                        r.get("topicTitle", ""),
                        r.get("practice_mode", ""),
                        r.get("practiceKey", ""),
                        r.get("practiceTitle", ""),
                        r.get("questionCount", ""),
                        r.get("notes", ""),
                    ]
                else:
                    blob_parts += [r.get("section", ""), r.get("domainMain", ""), r.get("domainSub", "")]
                blob = " ".join(blob_parts).lower()
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
            "practices": "無限練習",
        }.get(self.mode, self.mode)
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
        if self.mode == "practices":
            editor_obj = item.get("dbRecord") or {
                "id": item.get("id", ""),
                "enabled": item.get("enabled", True),
                "mode": item.get("practice_mode", "") or "generator",
                "practiceKey": item.get("practiceKey", ""),
                "title": item.get("practiceTitle", ""),
                "difficulty": item.get("difficulty", ""),
                "questionCount": item.get("questionCount", 0),
                "prompt": item.get("prompt", ""),
                "answer": item.get("answer", ""),
                "notes": item.get("notes", ""),
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
        elif self.mode == "practices":
            obj = {
                "id": "topic-id",
                "enabled": True,
                "mode": "generator",
                "practiceKey": "generator-key",
                "title": "",
                "difficulty": "",
                "questionCount": 0,
                "prompt": "",
                "answer": "",
                "notes": "mode=fixed-example 時填 prompt / answer；mode=generator 時填 practiceKey。"
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

        rid = str(obj.get("id", "")).strip()
        title = str(obj.get("title", "")).strip()
        if not rid or (self.mode != "practices" and not title):
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
        elif self.mode == "practices":
            obj = normalize_practice_assignment(obj)
            if not obj["id"]:
                return messagebox.showerror("缺少必要欄位", "無限練習設定需要 id（主題 id）")
            if obj["mode"] == "generator" and not obj["practiceKey"]:
                return messagebox.showerror("缺少 practiceKey", "generator 模式需要 practiceKey")
            if obj["mode"] == "fixed-example" and not (obj["prompt"] or obj["answer"]):
                return messagebox.showerror("缺少題目內容", "fixed-example 模式至少要有 prompt 或 answer")
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
        elif self.mode == "practices":
            rows = payload.setdefault("assignments", [])
            idx = next((i for i, it in enumerate(rows) if str(it.get("id", "")).strip() == rid), -1)
            action = "已更新" if idx >= 0 else "已新增"
            if idx >= 0:
                rows[idx] = obj
            else:
                rows.append(obj)
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(rows)
            payload["meta"]["updatedAt"] = practice_now_iso()
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
        elif self.mode == "practices":
            rows = payload.get("assignments", [])
            existing_ids = {str(row.get("id", "")).strip() for row in rows if isinstance(row, dict)}
            missing = [rid for rid in ids if rid not in existing_ids]
            if missing:
                messagebox.showinfo(
                    "提醒",
                    "其中有些目前只是 legacy 直接配置，尚未建立 practice-db 覆寫。\n"
                    "若要停用它，請先把該筆存成 enabled=false。",
                )
            payload["assignments"] = [r for r in rows if str(r.get("id", "")).strip() not in id_set]
            payload.setdefault("meta", {})
            payload["meta"]["count"] = len(payload["assignments"])
            payload["meta"]["updatedAt"] = practice_now_iso()
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
        elif self.mode in {"topics", "practices"}:
            topic_item = item
            if self.mode == "practices":
                topic_item = self._topic_lookup().get(str(item.get("id", "")).strip(), {})
            item_json = json.dumps(topic_item or {}, ensure_ascii=False)
            styles_uri = self._asset_uri("styles.css")
            formulas_uri = self._asset_uri("formulas.js")
            formula_content_uri = self._asset_uri("data/formula-content.js")
            question_content_uri = self._asset_uri("data/question-content.js")
            chapter_code_uri = self._asset_uri("data/chapter-code-config.js")
            formula_calculators_uri = self._asset_uri("data/formula-calculators.js")
            practice_assignment_uri = self._asset_uri("data/formula-practice-assignments.js")
            formula_practice_uri = self._asset_uri("data/formula-practice.js")
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
  <script defer src="{formula_data_uri}"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="{formula_core_uri}"></script>
  <script>
    function renderGuiPreview() {{
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

            student_html = self._build_lesson_print_html(pack, show_answer=False)
            teacher_html = self._build_lesson_print_html(pack, show_answer=True)
            student_result = self._print_html_to_pdf(student_html, student_pdf)
            teacher_result = self._print_html_to_pdf(teacher_html, teacher_pdf)

            if student_result["ok"] and teacher_result["ok"]:
                self.status_var.set(f"講義輸出完成：{student_pdf.name}、{teacher_pdf.name}")
                return messagebox.showinfo("完成", f"已輸出：\n{student_pdf}\n{teacher_pdf}")

            fallback_paths = []
            if student_result.get("html"):
                fallback_paths.append(str(student_result["html"]))
            if teacher_result.get("html"):
                fallback_paths.append(str(teacher_result["html"]))
            if fallback_paths:
                self.status_var.set("找不到 Edge，已輸出 HTML 講義。")
                return messagebox.showwarning("未偵測到 Edge", "目前無法直接輸出 PDF，已改輸出 HTML：\n" + "\n".join(fallback_paths))

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

        out_path = filedialog.asksaveasfilename(
            title="匯出分支 PDF",
            defaultextension=".pdf",
            filetypes=[("PDF", "*.pdf")],
            initialfile="selected-topics.pdf",
        )
        if not out_path:
            return

        html = self._build_topics_print_html(picked)
        edge = self._find_edge_exe()
        with NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
            tmp.write(html)
            html_path = Path(tmp.name)

        if not edge:
            html_out = Path(out_path).with_suffix(".html")
            html_out.write_text(html, encoding="utf-8")
            self.status_var.set(f"未找到 Edge，已改輸出 HTML：{html_out}")
            return messagebox.showwarning("找不到 Edge", f"系統找不到 Edge，已輸出 HTML：\n{html_out}\n\n可用瀏覽器開啟後另存為 PDF。")

        try:
            url = html_path.as_uri()
            subprocess.run(
                [
                    edge,
                    "--headless",
                    "--disable-gpu",
                    "--virtual-time-budget=12000",
                    f"--print-to-pdf={out_path}",
                    "--no-pdf-header-footer",
                    "--allow-file-access-from-files",
                    url,
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception as exc:
            return messagebox.showerror("匯出失敗", str(exc))
        finally:
            try:
                html_path.unlink(missing_ok=True)
            except Exception:
                pass

        self.status_var.set(f"PDF 匯出完成：{len(picked)} 筆 -> {out_path}")
        messagebox.showinfo("完成", f"已輸出網頁版樣式 PDF：{len(picked)} 筆主題。")

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
        if self.mode in {"chapter", "overviews", "overview_bodies", "main_overviews", "closings", "practices"}:
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
                "   注意：這一步會直接覆蓋原檔，請先確認檔案是你要修改的版本。"
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

        ttk.Button(button_bar, text="整批匯入正式 packs", style="Compact.TButton", command=run_import_all).pack(side="left")
        ttk.Button(button_bar, text="同步前端橋接檔", style="Compact.TButton", command=run_sync_all).pack(side="left", padx=(8, 0))
        ttk.Button(button_bar, text="檢查資料亂碼", style="Compact.TButton", command=run_integrity_check).pack(side="left", padx=(8, 0))
        ttk.Button(button_bar, text="Markdown 反跳脫清理", style="Compact.TButton", command=run_markdown_unescape).pack(side="left", padx=(8, 0))
        ttk.Button(button_bar, text="講義產生器 v1", style="Compact.TButton", command=self.open_lesson_generator).pack(side="left", padx=(8, 0))
        ttk.Button(button_bar, text="關閉", style="Compact.TButton", command=window.destroy).pack(side="right")

        write_log(
            "這裡會顯示每次工具動作的結果。\n"
            "- 整批匯入正式 packs：formal packs -> question-db.json\n"
            "- 同步前端橋接檔：formula-db / question-db / practice-db -> data/*.js\n"
            "- 檢查資料亂碼：掃描資料庫與正式匯入檔，不直接修改\n"
            "- Markdown 反跳脫清理：清掉指定 .md 檔內多餘的反斜線，直接覆蓋原檔\n"
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


