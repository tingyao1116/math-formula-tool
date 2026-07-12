r"""Markdown -> PDF export helpers.

Why this file exists
---------------------
The GUI used to export PDFs by building an HTML page (with MathJax or KaTeX loaded
from a CDN) and then either printing it with headless Edge, or flattening the LaTeX
with crude regexes and drawing it with reportlab. Both paths are unreliable for math:

- The headless-Edge-print path races against MathJax/KaTeX's async rendering, so a
  formula can get printed before it finishes rendering and shows up as raw
  ``\frac{...}`` text in the PDF.
- The reportlab path used a hand-rolled regex flattener (``\frac{a}{b}`` ->
  ``(a)/(b)``, strip ``$``/``\(``/``\)``) that does not handle nested fractions,
  exponents, or anything beyond the simplest patterns.

This module instead builds a plain Markdown document (with real LaTeX math left
intact, using ``$...$`` / ``$$...$$``) and lets `pandoc` + a LaTeX engine (XeLaTeX)
do the actual typesetting. That is the same rendering technology used to typeset
textbooks, so fractions/roots/exponents come out correct, and there is no
render-then-race-to-print step involved.

Font handling: this deliberately sets pandoc's plain ``mainfont`` (fontspec)
instead of ``CJKmainfont``. Setting ``CJKmainfont`` makes pandoc's template load
the ``xeCJK`` package, which in turn needs ``ctexhook.sty`` from the separate
``ctex``/``texlive-lang-chinese`` bundle -- on some installs (including this
project's own test sandbox) that bundle is missing and xeCJK fails outright with
"File 'ctexhook.sty' not found", even though pandoc/xelatex/fontspec are all
otherwise fine. Using ``mainfont`` with a CJK-capable font (via plain fontspec,
no xeCJK) renders Chinese text and math side by side correctly with one fewer
package dependency, so it is more robust across installs, not just a sandbox
workaround.

Requirements on the machine running the GUI
---------------------------------------------
- `pandoc` (already used elsewhere in this project for docx <-> markdown).
- A LaTeX engine that pandoc can call, e.g. XeLaTeX from a MiKTeX or TeX Live
  install. MiKTeX will auto-install any missing LaTeX packages the first time
  they are needed, so a minimal install is enough.

Everything in this module is plain Python (subprocess/pathlib/re only) so it can be
imported and unit-tested without tkinter or reportlab.
"""

from __future__ import annotations

import re
import shutil
import subprocess
from html import unescape
from pathlib import Path
from tempfile import NamedTemporaryFile

ROOT = Path(__file__).resolve().parents[2]

# Common CJK-capable fonts that ship with Windows / common installs, tried in order.
DEFAULT_CJK_FONT_CANDIDATES = [
    "Microsoft JhengHei",
    "微軟正黑體",
    "PMingLiU",
    "新細明體",
    "Noto Sans TC",
    "Noto Serif CJK TC",
    "DFKai-SB",
    "標楷體",
]


def _run(cmd: list[str]) -> tuple[bool, str]:
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=5,
        )
        return proc.returncode == 0, (proc.stdout or "") + (proc.stderr or "")
    except Exception as exc:
        return False, str(exc)


def check_pdf_toolchain() -> dict:
    """Check whether pandoc + a LaTeX engine are available.

    Returns {"ok": bool, "pandoc": path_or_none, "engine": path_or_none, "reason": str}.
    """
    pandoc_path = shutil.which("pandoc")
    if not pandoc_path:
        return {
            "ok": False,
            "pandoc": None,
            "engine": None,
            "reason": (
                "找不到 pandoc。請先安裝 pandoc（https://pandoc.org/installing.html），"
                "安裝後可能需要重新開啟這個程式。"
            ),
        }

    for engine in ("xelatex", "lualatex"):
        engine_path = shutil.which(engine)
        if engine_path:
            return {"ok": True, "pandoc": pandoc_path, "engine": engine, "reason": ""}

    return {
        "ok": False,
        "pandoc": pandoc_path,
        "engine": None,
        "reason": (
            "找不到 xelatex 或 lualatex（LaTeX 排版引擎）。請安裝 MiKTeX"
            "（https://miktex.org/download，Windows 版）或 TeX Live，"
            "安裝時建議選「缺少套件時自動安裝」，這樣第一次排版時才不用手動裝套件。"
            "安裝完成後可能需要重新開啟這個程式或登出再登入，讓系統 PATH 生效。"
        ),
    }


_cached_cjk_font: str | None = None


def resolve_cjk_font(preferred: str | None = None) -> str:
    """Best-effort pick of an installed CJK font name for XeLaTeX's ``mainfont``.

    There is no fully portable way to list installed fonts without extra
    dependencies, so this just returns the first candidate; XeLaTeX will error out
    clearly (mentioning the font name) if it truly cannot find any of them, and the
    caller can then ask the user to pick a font that is actually installed.
    """
    global _cached_cjk_font
    if preferred:
        return preferred
    if _cached_cjk_font:
        return _cached_cjk_font
    _cached_cjk_font = DEFAULT_CJK_FONT_CANDIDATES[0]
    return _cached_cjk_font


def normalize_tex_delimiters(text: str) -> str:
    """Normalize LaTeX math delimiters to the ``$...$`` / ``$$...$$`` pandoc expects.

    Source data mixes ``$...$`` and ``\\(...\\)`` for inline math, and occasionally
    ``\\[...\\]`` for display math. Pandoc's default markdown reader only recognizes
    the dollar-sign forms, so this just does a literal token swap (safe here because
    ``\\(``/``\\)``/``\\[``/``\\]`` are unambiguous LaTeX math delimiters in this
    dataset, not otherwise-meaningful character sequences).
    """
    if not text:
        return ""
    text = text.replace("\\[", "$$").replace("\\]", "$$")
    text = text.replace("\\(", "$").replace("\\)", "$")
    return text


def _strip_stray_html(text: str) -> str:
    """Defensive ``<br>``-to-newline conversion for practice-generator text.

    Practice-generator strings are almost always plain text with LaTeX math
    (``\\(...\\)`` / ``$...$``), but a few helpers (e.g.
    ``deriveSummaryAnswerFromDetail`` in formula-practice.js) defensively handle
    ``<br>`` tags, so this mirrors that: convert ``<br>`` to a real newline.

    This deliberately does NOT do a generic ``<[^>]+>`` tag-strip: math text in
    this dataset routinely contains bare ``<``/``>`` as inequality signs (e.g.
    ``x<1 或 x>2``), and a generic tag-stripping regex would misread the span
    between an unrelated ``<`` and a later ``>`` as an HTML tag and delete
    everything in between, silently corrupting the answer text. No generator in
    this codebase actually emits real HTML tags other than ``<br>``, so there is
    nothing else to strip here.
    """
    if not text:
        return ""
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    return unescape(text)


def resolve_media_src(path_text: str) -> str:
    raw = str(path_text or "").strip()
    if not raw:
        return ""
    if raw.startswith(("http://", "https://", "file:///")):
        return raw
    return str((ROOT / raw).resolve())


def render_rich_line_md(value) -> str:
    """Inline-content renderer: turns ``[圖:path]`` markers into Markdown images and
    normalizes math delimiters, mirroring gui_app.py's ``_render_rich_line`` but
    producing Markdown+LaTeX instead of HTML."""
    text = _strip_stray_html(str(value or "")).strip()
    if not text:
        return ""
    parts = re.split(r"(\[圖:[^\]]+\])", text)
    out = []
    for part in parts:
        if not part:
            continue
        if part.startswith("[圖:") and part.endswith("]"):
            src = resolve_media_src(part[3:-1])
            if src:
                out.append(f"![]({src})")
        else:
            out.append(normalize_tex_delimiters(part))
    return "".join(out)


def render_rich_multiline_md(value, hard_break: bool = True) -> str:
    """Multi-line renderer for free-text fields (usage/notes/explanation/...).

    Each non-blank source line becomes one Markdown line; consecutive lines are
    joined with a LaTeX-safe hard line break (trailing backslash) so they stay in
    the same paragraph/list item instead of pandoc merging them into one run-on
    line or, worse, splitting them into a new paragraph with extra vertical space.
    """
    raw_lines = [ln.strip() for ln in _strip_stray_html(str(value or "")).splitlines()]
    raw_lines = [ln for ln in raw_lines if ln]
    rendered = [render_rich_line_md(ln) for ln in raw_lines]
    rendered = [ln for ln in rendered if ln]
    if not rendered:
        return ""
    if not hard_break:
        return " ".join(rendered)
    return " \\\n".join(rendered)


def collapse_to_one_line(value) -> str:
    """Collapse a (possibly multi-line) short-answer string onto a single line.

    Used for 簡答/答案 fields: these are meant to be the final short result, not a
    multi-step derivation, so multiple source lines get joined with '；' instead of
    kept as separate lines (which would otherwise cost extra vertical space)."""
    raw_lines = [ln.strip() for ln in _strip_stray_html(str(value or "")).splitlines() if ln.strip()]
    rendered = [render_rich_line_md(ln) for ln in raw_lines]
    rendered = [ln for ln in rendered if ln]
    return "；".join(rendered)


def extract_simple_answer(value) -> str:
    """Best-effort short-answer extraction from a full 詳解 string.

    Some practice-generator answers embed both parts in one string, e.g.
    ``"簡答：...過程：..."``. This mirrors gui_app.py's old
    ``_simplify_practice_answer_text`` regex (used when ``answer_mode ==
    "simple"`` and no separate ``summaryAnswers`` value is available), but keeps
    LaTeX math intact instead of stripping it.
    """
    text = _strip_stray_html(str(value or ""))
    if not text:
        return ""
    match = re.search(
        r"(?:簡答|答案)[:：]\s*([\s\S]*?)(?=(?:。|；|\n)?\s*(?:過程|解析|詳解|說明)[:：]|$)",
        text,
    )
    if match and match.group(1).strip():
        return collapse_to_one_line(match.group(1))
    parts = re.split(r"(?:。|；|\n)?\s*(?:過程|解析|詳解|說明)[:：]", text, maxsplit=1)
    return collapse_to_one_line(parts[0] or text)


def extract_explanation_only(value) -> str:
    """Companion to ``extract_simple_answer``: returns just the 過程/解析/詳解/
    說明 portion of a full detail-answer string (the part after the 簡答/答案
    label), for use in ``answer_mode == "both"`` so the short answer is not
    awkwardly repeated a second time inside the labelled 詳解 text. Falls back
    to the full text if no such split point is found (some generators write a
    bare result with no 簡答/過程 labels at all)."""
    text = _strip_stray_html(str(value or ""))
    if not text:
        return ""
    parts = re.split(r"(?:。|；|\n)?\s*(?:過程|解析|詳解|說明)[:：]", text, maxsplit=1)
    if len(parts) > 1 and parts[1].strip():
        return render_rich_multiline_md(parts[1], hard_break=False)
    return render_rich_multiline_md(text, hard_break=False)


def build_topic_markdown(item: dict, heading_level: int = 2, heading_prefix: str = "") -> str:
    """Markdown for one topic/formula card: title, badges, formula, and the
    usage/examples/tips/notes/mistakes lists. Mirrors gui_app.py's
    ``_topic_card_html`` / ``_topic_formula_block_html``."""
    lines: list[str] = []
    heading_mark = "#" * max(1, min(6, heading_level))
    title = str(item.get("title", "")).strip() or str(item.get("id", "")).strip() or "（未命名主題）"
    lines.append(f"{heading_mark} {heading_prefix}{title}")
    lines.append("")

    badge_fields = [("學層", "stage"), ("年級", "grade"), ("章節", "chapter"), ("難度", "difficulty"), ("領域", "domain")]
    badges = [str(item.get(key, "")).strip() for _, key in badge_fields if str(item.get(key, "")).strip()]
    meta_line = f"`{item.get('id', '')}`"
    if badges:
        meta_line += "　" + "　|　".join(badges)
    lines.append(meta_line)
    lines.append("")

    formula = item.get("formula", {})
    if isinstance(formula, dict):
        formula_lines = []
        for ln in formula.get("lines", []) or []:
            if not isinstance(ln, dict):
                continue
            label = str(ln.get("label", "")).strip()
            values = ln.get("values", []) or []
            if not values:
                continue
            tex_values = "，".join(_as_tex(str(v)) for v in values)
            formula_lines.append(f"**{label}：** {tex_values}" if label else tex_values)
        if formula_lines:
            lines.append("**公式**")
            lines.extend(formula_lines)
            lines.append("")

    section_specs = [
        ("何時使用", item.get("usage", [])),
        ("使用範例", item.get("examples", [])),
        ("使用技巧", item.get("tips", [])),
        ("補充說明", item.get("notes", [])),
        ("常見錯誤", item.get("mistakes", [])),
    ]
    for label, values in section_specs:
        values = [v for v in (values or []) if str(v).strip()]
        if not values:
            continue
        lines.append(f"**{label}**")
        lines.append("")
        for v in values:
            lines.append(f"- {render_rich_line_md(v)}")
        lines.append("")

    return "\n".join(lines).strip() + "\n"


def _as_tex(text: str) -> str:
    s = str(text).strip()
    if not s:
        return ""
    normalized = normalize_tex_delimiters(s)
    if "$" in normalized:
        return normalized
    return f"${normalized}$"


def build_question_markdown(question: dict, show_answer: bool, index: int | None = None) -> str:
    """Markdown for one question-bank item, mirroring gui_app.py's
    ``_question_item_html`` but with compact 答案/解析 formatting: single line for
    the answer, no blank line between 答案 and 解析."""
    title = str(question.get("title", "")).strip() or str(question.get("id", "")).strip() or "題目"
    prefix = f"{index}. " if index is not None else ""
    difficulty = str(question.get("difficulty", "")).strip()

    lines = [f"**{prefix}{title}**" + (f"　（難度：{difficulty}）" if difficulty else "")]
    q_text = render_rich_multiline_md(question.get("question_text", ""))
    lines.append(q_text or "（題目內容空白）")

    if show_answer:
        answer_text = collapse_to_one_line(question.get("answer_text", "")) or "（未填）"
        explain_text = render_rich_multiline_md(question.get("explanation_text", ""), hard_break=False) or "（未填）"
        # 答案 and 解析 stay on the exact same line (a few spaces between them, no
        # line break at all) so this doesn't cost any extra vertical space.
        lines.append(f"**答案：** {answer_text}　　**解析：** {explain_text}")

    lines.append("")
    return "\n".join(lines)


def build_question_list_markdown(questions: list, show_answer: bool) -> str:
    if not questions:
        return "_此區目前沒有題目。_\n"
    parts = [build_question_markdown(q, show_answer, index=i) for i, q in enumerate(questions, 1)]
    return "\n".join(parts)


def build_practice_set_question_md(question_text, index: int) -> str:
    """One numbered question line for the '匯出所選練習題' flow. Practice-generator
    questions are effectively single statements, but this still goes through
    ``render_rich_line_md`` so ``[圖:...]`` markers and math delimiters are handled
    the same way as everywhere else."""
    return f"{index}. {render_rich_line_md(question_text)}"


def build_practice_set_answer_md(summary_answer, detail_answer, index: int, answer_mode: str = "detail") -> list[str]:
    """Answer-key lines for one question, mirroring gui_app.py's old
    ``_simplify_practice_answer_text``/``_practice_pdf_plain_text`` combo but with
    real LaTeX math and no destructive flattening.

    - ``answer_mode == "simple"``: one compact line (prefers the generator's own
      ``summaryAnswers`` value; falls back to extracting a short answer out of the
      full ``detail_answer`` text).
    - ``answer_mode == "both"``: 簡答 and 詳解 together, labelled and kept on one
      line (no blank line between them, same compact style as the 簡答/解析
      merge used elsewhere in this module).
    - otherwise (detail): the full detail-answer text, hard-broken so any
      embedded 簡答/過程 labels stay in the same block with no blank line between
      them (pandoc/LaTeX would otherwise add paragraph spacing between blank-line
      separated blocks).
    """
    if answer_mode == "simple":
        text = collapse_to_one_line(summary_answer) or extract_simple_answer(detail_answer) or "（未填）"
        return [f"{index}. {text}"]
    if answer_mode == "both":
        simple_text = collapse_to_one_line(summary_answer) or extract_simple_answer(detail_answer) or "（未填）"
        detail_text = extract_explanation_only(detail_answer) or "（未填）"
        return [f"{index}. **簡答：** {simple_text}　　**詳解：** {detail_text}"]
    detail = render_rich_multiline_md(detail_answer) or collapse_to_one_line(summary_answer) or "（未填）"
    return [f"{index}. {detail}"]


# Math commands that are only valid inside LaTeX math mode. If any of these show
# up in a practice string *outside* a $…$ / \(…\) / \[…\] span, xelatex will fail
# with "! Missing $ inserted." — so we can catch the offending generator before
# even running pandoc, and name it directly instead of surfacing a raw LaTeX error.
_MATH_ONLY_CMD = re.compile(
    r"\\(?:d|t)?frac\b|\\sqrt\b|\\times\b|\\cdot\b|\\div\b|\\leq?\b|\\geq?\b|\\neq\b"
    r"|\\pm\b|\\mp\b|\\overline\b|\\overset\b|\\underset\b|\\vec\b|\\angle\b"
    r"|\\alpha\b|\\beta\b|\\gamma\b|\\theta\b|\\pi\b|\\sum\b|\\int\b|\\Rightarrow\b"
    r"|\\begin\b|\\end\b|\^\{|_\{"
)

# Control / invalid characters that XeLaTeX rejects with "Text line contains an
# invalid character" (shown in the log as ^^H etc.). These are usually stray
# control chars (e.g. a backspace 0x08) that slipped into a generator string or
# imported data. Tab (\x09), newline (\x0a) and carriage return (\x0d) are fine.
_BAD_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f​‎‏‪-‮﻿]")


def _strip_math_spans(text: str) -> str:
    """Remove $$…$$, \\(…\\), \\[…\\] and $…$ spans so what's left is text mode."""
    text = re.sub(r"\$\$.*?\$\$", " ", text, flags=re.S)
    text = re.sub(r"\\\(.*?\\\)", " ", text, flags=re.S)
    text = re.sub(r"\\\[.*?\\\]", " ", text, flags=re.S)
    text = re.sub(r"(?<!\\)\$.*?(?<!\\)\$", " ", text, flags=re.S)
    return text


def _latex_problem_in_text(text: str) -> str | None:
    """Return a human description of the first LaTeX math-mode problem, or None."""
    if not isinstance(text, str) or not text.strip():
        return None
    bad = _BAD_CHARS.search(text)
    if bad:
        return (
            f"含有無效字元（控制字元／隱藏字元 U+{ord(bad.group(0)):04X}），"
            f"LaTeX 排版時會報「invalid character」，需刪除這個字元"
        )
    # Collapse "\\" (a LaTeX line break / escaped backslash) to spaces first, so
    # "\\(" — an array row break followed by a parenthesis, e.g. inside a
    # \begin{array} system of equations — is not mistaken for an inline-math "\("
    # (and "\\$" is not mistaken for an escaped "$").
    probe = text.replace("\\\\", "  ")
    if len(re.findall(r"(?<!\\)\$", probe)) % 2 != 0:
        return "數學符號 $ 沒有成對（奇數個 $），$ 之後的內容會被當成純文字"
    if probe.count(r"\(") != probe.count(r"\)"):
        return "行內數學 \\( 與 \\) 的數量不一致（沒有成對）"
    hit = _MATH_ONLY_CMD.search(_strip_math_spans(probe))
    if hit:
        return f"數學指令「{hit.group(0)}」寫在數學模式（$…$ 或 \\(…\\)）外面"
    return None


def find_latex_problem_in_sets(generated_sets: list) -> dict | None:
    """Scan generated practice sets for the first string that xelatex would reject.

    Returns ``{"title","id","field","index","problem","sample"}`` for the first
    offending string (so the export can name the broken generator), or ``None``.
    """
    for si, practice_set in enumerate(generated_sets or []):
        if not isinstance(practice_set, dict):
            continue
        title = str(practice_set.get("title") or practice_set.get("id") or f"第 {si + 1} 組").strip()
        pid = str(
            practice_set.get("practiceId")
            or practice_set.get("id")
            or practice_set.get("generatorKey")
            or ""
        ).strip()
        for field, label in (("questions", "題目"), ("summaryAnswers", "簡答"), ("answers", "詳解")):
            for qi, value in enumerate(practice_set.get(field) or []):
                problem = _latex_problem_in_text(value)
                if problem:
                    sample = str(value).strip().replace("\n", " ")
                    return {
                        "title": title,
                        "id": pid,
                        "field": label,
                        "index": qi + 1,
                        "problem": problem,
                        "sample": sample[:160],
                    }
    return None


def build_practice_sets_markdown(
    generated_sets: list,
    title: str,
    export_order: str = "separate",
    answer_mode: str = "detail",
    gap_mm: float = 0,
) -> str:
    """Markdown for the '匯出所選練習題' flow (worksheet + answer key), mirroring
    gui_app.py's old ``_build_practice_markdown_from_sets`` but with real LaTeX
    math instead of the destructive plain-text flattener.

    ``generated_sets`` is the ``sets`` list produced by the existing Node/vm
    practice-generator runner (each item has ``title``/``intro``/``questions``/
    ``summaryAnswers``/``answers``, all index-aligned) -- that generation step is
    unchanged, only the Markdown built from its output is new.

    ``gap_mm`` is the blank working space left under each 題目 (for students to
    write their work), given directly in millimeters and emitted as a raw
    ``\\vspace{Xmm}`` LaTeX block -- this renders reliably regardless of how
    pandoc happens to lay out the surrounding numbered list, unlike stacking
    blank "&nbsp;" markdown lines (which pandoc/LaTeX may collapse or space out
    inconsistently). 答案 (the answer key) never gets this spacing.
    """
    gap_mm = max(0.0, min(80.0, float(gap_mm or 0)))
    lines = [f"# {title}", ""]

    def push_questions(practice_set: dict):
        for idx, q in enumerate(practice_set.get("questions", []) or [], 1):
            lines.append(build_practice_set_question_md(q, idx))
            if gap_mm > 0:
                lines.append(f"`\\vspace{{{gap_mm}mm}}`{{=latex}}")
                lines.append("")

    def push_answers(practice_set: dict):
        summaries = practice_set.get("summaryAnswers", []) or []
        details = practice_set.get("answers", []) or []
        count = max(len(summaries), len(details))
        for idx in range(count):
            summary = summaries[idx] if idx < len(summaries) else ""
            detail = details[idx] if idx < len(details) else ""
            lines.extend(build_practice_set_answer_md(summary, detail, idx + 1, answer_mode))

    if export_order == "interleaved":
        for practice_set in generated_sets:
            lines.extend([f"## {practice_set.get('title', '未命名題型')}", ""])
            intro = practice_set.get("intro")
            if intro:
                lines.extend([render_rich_line_md(intro), ""])
            lines.extend(["### 題目", ""])
            push_questions(practice_set)
            lines.extend(["", "### 答案", ""])
            push_answers(practice_set)
            lines.append("")
        return "\n".join(lines).strip() + "\n"

    lines.extend(["## 題目", ""])
    for practice_set in generated_sets:
        lines.append(f"### {practice_set.get('title', '未命名題型')}")
        intro = practice_set.get("intro")
        if intro:
            lines.extend([render_rich_line_md(intro), ""])
        push_questions(practice_set)
        lines.append("")

    lines.extend(["## 答案", ""])
    for practice_set in generated_sets:
        lines.append(f"### {practice_set.get('title', '未命名題型')}")
        push_answers(practice_set)
        lines.append("")

    return "\n".join(lines).strip() + "\n"


PAGE_BREAK = "`\\newpage`{=latex}\n"


def build_topics_markdown(items: list) -> str:
    """Markdown for the '匯出所選主題' flow: one page (via LaTeX \\newpage) per topic."""
    sections = [build_topic_markdown(item, heading_level=1) for item in items]
    return (f"\n\n{PAGE_BREAK}\n\n").join(sections)


def build_lesson_markdown(pack: dict, show_answer: bool) -> str:
    """Markdown for the '講義產生器' (lesson generator) flow, mirroring
    gui_app.py's ``_build_lesson_print_html``."""
    chapter_meta = pack.get("chapter_meta", {}) or {}
    chapter_name = chapter_meta.get("chapter") or chapter_meta.get("section") or "未命名章節"
    mode_label = "教師版（含答案與詳解）" if show_answer else "學生版（不含答案）"

    parts = [
        f"# {chapter_name}",
        "",
        f"章節代號：{pack.get('chapter_code', '')}　|　{mode_label}　|　產生時間：{pack.get('generated_at', '')}",
        f"主題數：{len(pack.get('topics', []))}　|　章節題目總數：{len(pack.get('chapter_questions', []))}",
        "",
        PAGE_BREAK,
    ]

    for idx, topic_pack in enumerate(pack.get("topics", []), start=1):
        topic = topic_pack.get("topic", {})
        parts.append(build_topic_markdown(topic, heading_level=2, heading_prefix=f"主題 {idx}："))
        parts.append("**上課範例**\n")
        parts.append(build_question_list_markdown(topic_pack.get("examples", []), show_answer))
        parts.append("**學生練習**\n")
        parts.append(build_question_list_markdown(topic_pack.get("practices", []), show_answer))
        parts.append(PAGE_BREAK)

    parts.append("## 章節綜合練習")
    parts.append("")
    parts.append(f"章節代號：{pack.get('chapter_code', '')}")
    parts.append("")
    parts.append(build_question_list_markdown(pack.get("mixed_questions", []), show_answer))

    return "\n".join(parts).strip() + "\n"


def convert_markdown_to_pdf(
    markdown_text: str,
    out_path: Path,
    title: str = "",
    cjk_font: str | None = None,
    margin: str = "20mm",
) -> dict:
    """Convert a Markdown string to a PDF via ``pandoc --pdf-engine=xelatex``.

    Returns {"ok": bool, "pdf": Path|None, "reason": str, "log": str}.
    """
    toolchain = check_pdf_toolchain()
    if not toolchain["ok"]:
        return {"ok": False, "pdf": None, "reason": toolchain["reason"], "log": ""}

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    font = resolve_cjk_font(cjk_font)

    with NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as tmp:
        if title:
            tmp.write(
                f"---\ntitle: \"{title}\"\n"
                "header-includes:\n"
                "  - \\XeTeXlinebreaklocale \"zh\"\n"
                "  - \\XeTeXlinebreakskip=0pt plus 1pt\n"
                "  - \\sloppy\n"
                "  - \\emergencystretch=3em\n"
                "---\n\n"
            )
        tmp.write(markdown_text)
        md_path = Path(tmp.name)

    cmd = [
        toolchain["pandoc"],
        str(md_path),
        "-o", str(out_path),
        f"--pdf-engine={toolchain['engine']}",
        "-V", f"mainfont={font}",
        "-V", f"geometry:margin={margin}",
        "-V", "fontsize=11pt",
        "-V", "linkcolor=blue",
        "--resource-path", str(ROOT),
        "--standalone",
    ]

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=180,
        )
        log = (proc.stdout or "") + (proc.stderr or "")
        if proc.returncode != 0 or not out_path.exists():
            reason = "pandoc/xelatex 轉換失敗。"
            if "mainfont" in log or "font" in log.lower():
                reason += f" 可能是找不到字型「{font}」，請確認電腦上有安裝這個中文字型，或改用其他字型。"
            else:
                # Surface the FIRST LaTeX error (lines starting with "!") plus the
                # source location xelatex points at ("l.<N> ..."), so a bad data
                # entry (e.g. a stray \frac/\times typed outside math mode in a
                # practice-generator string) can be tracked down directly.
                # The first error is the root cause; later ones are usually cascades
                # triggered by it, so reporting the last error was often misleading.
                log_lines = log.splitlines()
                err_idx = next(
                    (i for i, ln in enumerate(log_lines) if ln.strip().startswith("!")),
                    None,
                )
                if err_idx is not None:
                    reason += f" 第一個 LaTeX 錯誤：{log_lines[err_idx].strip()}"
                    # xelatex prints the offending line as "l.<N> <text-before-error>"
                    # and the remainder of that line on the next line; show both with
                    # a marker so the exact spot is obvious.
                    for j in range(err_idx + 1, min(err_idx + 15, len(log_lines))):
                        m = re.match(r"^l\.(\d+)\s?(.*)$", log_lines[j].rstrip())
                        if m:
                            before = m.group(2).strip()
                            after = log_lines[j + 1].strip() if j + 1 < len(log_lines) else ""
                            spot = (before + " ⟨✗這裡⟩ " + after).strip()
                            reason += f" 出錯位置（排版第 {m.group(1)} 行）：{spot[:140]}"
                            break
            return {"ok": False, "pdf": None, "reason": reason, "log": log[-4000:]}
        return {"ok": True, "pdf": out_path, "reason": "", "log": log[-4000:]}
    except subprocess.TimeoutExpired:
        return {"ok": False, "pdf": None, "reason": "排版超過時間限制（180 秒），內容可能過多，請減少匯出範圍。", "log": ""}
    except Exception as exc:
        return {"ok": False, "pdf": None, "reason": str(exc), "log": ""}
    finally:
        try:
            md_path.unlink(missing_ok=True)
        except Exception:
            pass
