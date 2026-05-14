#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Tuple


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
CHAPTER_DB = ROOT / "program-db" / "database" / "chapter-code-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"
BACKUP_DIR = ROOT / "backups"


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def safe_text(value) -> str:
    return str(value or "").strip()


def is_chapter_code(value: str) -> bool:
    s = safe_text(value)
    if not s:
        return False
    if re.fullmatch(r"[js]\d(?:-\d+){1,3}", s, flags=re.IGNORECASE):
        return True
    if re.fullmatch(r"b-\d+", s, flags=re.IGNORECASE):
        return True
    return False


def normalize_code(value: str) -> str:
    s = safe_text(value)
    if not s:
        return ""
    if re.fullmatch(r"b-\d+", s, flags=re.IGNORECASE):
        return s.upper()
    return s.lower()


def normalize_lookup_text(value: str) -> str:
    return re.sub(r"\s+", "", safe_text(value).lower())


def extract_code_from_id(value: str) -> str:
    s = safe_text(value)
    if not s:
        return ""
    m = re.search(r"(?:^|[-_])([js]\d(?:-\d+){1,3})(?:[-_]|$)", s, flags=re.IGNORECASE)
    if m:
        return normalize_code(m.group(1))
    return ""


def extract_code_from_tags(tags: List[str]) -> str:
    for tag in tags or []:
        code = normalize_code(safe_text(tag))
        if is_chapter_code(code):
            return code
    return ""


def to_link_id(question_id: str, topic_id: str, chapter_code: str, level: str) -> str:
    target = topic_id if level == "topic" else chapter_code
    raw = f"link-{question_id}-{level}-{target}"
    return re.sub(r"[^A-Za-z0-9_-]+", "-", raw).strip("-").lower()


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def build_chapter_lookup(catalog: Dict) -> Dict[str, str]:
    lookup: Dict[str, str] = {}
    for code, meta in (catalog or {}).items():
        c = normalize_code(code)
        if not c:
            continue
        chapter = normalize_lookup_text(meta.get("chapter", ""))
        section = normalize_lookup_text(meta.get("section", ""))
        if chapter:
            lookup[chapter] = c
        if section:
            lookup[section] = c
    return lookup


def resolve_topic_code(topic: Dict, chapter_lookup: Dict[str, str]) -> str:
    explicit = safe_text(topic.get("chapterCode", ""))
    if is_chapter_code(explicit):
        return normalize_code(explicit)

    inferred = extract_code_from_id(topic.get("id", ""))
    if inferred:
        return inferred

    inferred_from_tags = extract_code_from_tags(topic.get("tags", []))
    if inferred_from_tags:
        return inferred_from_tags

    chapter = safe_text(topic.get("chapter", ""))
    if is_chapter_code(chapter):
        return normalize_code(chapter)

    key = normalize_lookup_text(chapter)
    return chapter_lookup.get(key, "")


def resolve_question_code(question: Dict, chapter_lookup: Dict[str, str]) -> str:
    for field in ("chapter_code", "chapterCode", "chapter"):
        raw = safe_text(question.get(field, ""))
        if is_chapter_code(raw):
            return normalize_code(raw)

    inferred = extract_code_from_id(question.get("id", ""))
    if inferred:
        return inferred

    inferred_from_tags = extract_code_from_tags(question.get("tags", []))
    if inferred_from_tags:
        return inferred_from_tags

    chapter_text = normalize_lookup_text(question.get("chapter", ""))
    if chapter_text and chapter_text in chapter_lookup:
        return chapter_lookup[chapter_text]

    return ""


def parse_topic_tags(tags: List[str]) -> List[str]:
    topic_ids = []
    for tag in (tags or []):
        text = safe_text(tag)
        if not text:
            continue
        lower = text.lower()
        if lower.startswith("topic:"):
            topic_ids.append(text.split(":", 1)[1].strip())
        elif lower.startswith("topic="):
            topic_ids.append(text.split("=", 1)[1].strip())
    # dedupe keep order
    seen: Set[str] = set()
    ordered = []
    for tid in topic_ids:
        if tid and tid not in seen:
            seen.add(tid)
            ordered.append(tid)
    return ordered


def flatten_formula_text(formula_value) -> str:
    if formula_value is None:
        return ""
    if isinstance(formula_value, str):
        return formula_value
    if isinstance(formula_value, (int, float, bool)):
        return str(formula_value)
    if isinstance(formula_value, list):
        return " ".join(flatten_formula_text(item) for item in formula_value)
    if isinstance(formula_value, dict):
        return " ".join(flatten_formula_text(v) for v in formula_value.values())
    return ""


def normalize_match_text(value: str) -> str:
    text = safe_text(value).lower()
    text = re.sub(r"[\s\r\n\t]+", "", text)
    return text


def extract_tokens(value: str) -> Set[str]:
    text = normalize_match_text(value)
    if not text:
        return set()

    tokens: Set[str] = set()
    for segment in re.findall(r"[\u4e00-\u9fff]+|[a-z0-9_]+", text):
        if not segment:
            continue
        if re.fullmatch(r"[a-z0-9_]+", segment):
            if len(segment) >= 2:
                tokens.add(segment)
            continue

        # Chinese: keep phrase and add bi-grams to reduce accidental mismatch.
        if len(segment) >= 2:
            tokens.add(segment)
            for i in range(len(segment) - 1):
                tokens.add(segment[i : i + 2])
        else:
            tokens.add(segment)
    return tokens


def topic_source_text(topic: Dict) -> str:
    parts = [
        safe_text(topic.get("title", "")),
        safe_text(topic.get("chapter", "")),
        flatten_formula_text(topic.get("formula")),
        " ".join(safe_text(x) for x in (topic.get("tags") or []) if safe_text(x)),
        " ".join(safe_text(x) for x in (topic.get("usage") or []) if safe_text(x)),
        " ".join(safe_text(x) for x in (topic.get("examples") or []) if safe_text(x)),
        " ".join(safe_text(x) for x in (topic.get("tips") or []) if safe_text(x)),
        " ".join(safe_text(x) for x in (topic.get("notes") or []) if safe_text(x)),
    ]
    return " ".join(p for p in parts if p)


def question_source_text(question: Dict) -> str:
    parts = [
        safe_text(question.get("title", "")),
        safe_text(question.get("question_text", "")),
        safe_text(question.get("explanation_text", "")),
        safe_text(question.get("answer_text", "")),
        safe_text(question.get("chapter", "")),
        " ".join(safe_text(x) for x in (question.get("tags") or []) if safe_text(x)),
    ]
    return " ".join(p for p in parts if p)


def score_topic_match(question_tokens: Set[str], topic_tokens: Set[str]) -> float:
    if not question_tokens or not topic_tokens:
        return 0.0
    overlap = question_tokens & topic_tokens
    if not overlap:
        return 0.0
    # Balanced overlap score: avoids assigning by one accidental token.
    return len(overlap) / max(3.0, (0.6 * len(question_tokens) + 0.4 * len(topic_tokens)))


def make_link(
    question: Dict,
    question_id: str,
    question_title: str,
    chapter_code: str,
    level: str,
    topic_id: str = "",
    source_type: str = "auto",
    source_ref: str = "",
    confidence: float = 0.7,
) -> Dict:
    title = f"{question_id} -> {topic_id if level == 'topic' else chapter_code}"
    now = now_iso()
    return {
        "id": to_link_id(question_id, topic_id, chapter_code, level),
        "title": title,
        "question_id": question_id,
        "question_title": question_title,
        "topic_id": topic_id if level == "topic" else "",
        "chapter_code": chapter_code,
        "link_level": level,
        "source_type": source_type,
        "source_ref": source_ref or safe_text(question.get("source_ref", "")),
        "confidence": float(confidence),
        "created_at": now,
        "updated_at": now,
    }


def keep_manual_links(existing_links: List[Dict]) -> List[Dict]:
    kept = []
    for row in existing_links or []:
        if safe_text(row.get("source_type", "")).lower() == "manual":
            kept.append(row)
    return kept


def backup_if_exists(path: Path) -> Path | None:
    if not path.exists():
        return None
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"{path.stem}.backup-{ts}{path.suffix}"
    backup_path.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")
    return backup_path


def main():
    topics_payload = load_json(FORMULA_DB)
    questions_payload = load_json(QUESTION_DB)
    chapter_payload = load_json(CHAPTER_DB)
    existing_links_payload = load_json(LINK_DB) if LINK_DB.exists() else {"links": []}

    topics = topics_payload.get("topics", []) if isinstance(topics_payload, dict) else []
    questions = questions_payload.get("questions", []) if isinstance(questions_payload, dict) else []
    chapter_catalog = chapter_payload.get("catalog", {}) if isinstance(chapter_payload, dict) else {}

    chapter_lookup = build_chapter_lookup(chapter_catalog)
    topic_ids: Set[str] = set()
    topic_code_by_id: Dict[str, str] = {}
    topics_by_code: Dict[str, List[Dict]] = {}
    topic_token_by_id: Dict[str, Set[str]] = {}
    for topic in topics:
        tid = safe_text(topic.get("id", ""))
        if not tid:
            continue
        topic_ids.add(tid)
        code = resolve_topic_code(topic, chapter_lookup)
        topic_code_by_id[tid] = code
        topic_token_by_id[tid] = extract_tokens(topic_source_text(topic))
        if code:
            topics_by_code.setdefault(code, []).append(topic)

    links: List[Dict] = []
    manual_links = keep_manual_links(existing_links_payload.get("links", []))
    links.extend(manual_links)

    seen_keys: Set[Tuple[str, str, str, str]] = set()
    for row in links:
        seen_keys.add(
            (
                safe_text(row.get("question_id", "")),
                safe_text(row.get("topic_id", "")),
                normalize_code(row.get("chapter_code", "")),
                safe_text(row.get("link_level", "")),
            )
        )

    added_topic_links = 0
    added_topic_links_by_match = 0
    added_chapter_links = 0
    skipped_no_question_id = 0
    skipped_no_target = 0
    skipped_low_confidence = 0

    for q in questions:
        qid = safe_text(q.get("id", ""))
        if not qid:
            skipped_no_question_id += 1
            continue
        qtitle = safe_text(q.get("title", "")) or qid
        qcode = resolve_question_code(q, chapter_lookup)
        tag_topics = [tid for tid in parse_topic_tags(q.get("tags", [])) if tid in topic_ids]
        matched_by_similarity = False

        if tag_topics:
            for tid in tag_topics:
                code = topic_code_by_id.get(tid) or qcode
                key = (qid, tid, normalize_code(code), "topic")
                if key in seen_keys:
                    continue
                seen_keys.add(key)
                links.append(
                    make_link(
                        question=q,
                        question_id=qid,
                        question_title=qtitle,
                        chapter_code=normalize_code(code),
                        level="topic",
                        topic_id=tid,
                        source_type="auto-tag",
                        confidence=1.0,
                    )
                )
                added_topic_links += 1
        elif qcode and topics_by_code.get(qcode):
            q_tokens = extract_tokens(question_source_text(q))
            best_topic = None
            best_score = 0.0
            best_overlap = 0
            for topic in topics_by_code.get(qcode, []):
                tid = safe_text(topic.get("id", ""))
                if not tid:
                    continue
                t_tokens = topic_token_by_id.get(tid) or set()
                overlap_count = len(q_tokens & t_tokens)
                score = score_topic_match(q_tokens, t_tokens)
                if score > best_score or (score == best_score and overlap_count > best_overlap):
                    best_score = score
                    best_overlap = overlap_count
                    best_topic = topic

            # Guardrail: need enough overlap to avoid random attachment.
            if best_topic and best_overlap >= 2 and best_score >= 0.08:
                tid = safe_text(best_topic.get("id", ""))
                code = topic_code_by_id.get(tid) or qcode
                key = (qid, tid, normalize_code(code), "topic")
                if key not in seen_keys:
                    seen_keys.add(key)
                    links.append(
                        make_link(
                            question=q,
                            question_id=qid,
                            question_title=qtitle,
                            chapter_code=normalize_code(code),
                            level="topic",
                            topic_id=tid,
                            source_type="auto-keyword",
                            confidence=min(0.95, max(0.72, round(best_score, 3))),
                        )
                    )
                    added_topic_links += 1
                    added_topic_links_by_match += 1
                    matched_by_similarity = True
            else:
                skipped_low_confidence += 1

        if (not tag_topics) and (not matched_by_similarity) and qcode:
            code = normalize_code(qcode)
            key = (qid, "", code, "chapter")
            if key in seen_keys:
                continue
            seen_keys.add(key)
            links.append(
                make_link(
                    question=q,
                    question_id=qid,
                    question_title=qtitle,
                    chapter_code=code,
                    level="chapter",
                    source_type="auto-chapter",
                    confidence=0.72,
                )
            )
            added_chapter_links += 1
        else:
            skipped_no_target += 1

    links.sort(
        key=lambda x: (
            safe_text(x.get("chapter_code", "")),
            safe_text(x.get("topic_id", "")),
            safe_text(x.get("question_id", "")),
            safe_text(x.get("id", "")),
        )
    )

    backup_path = backup_if_exists(LINK_DB)

    payload = {
        "meta": {
            "schema": "topic-question-link-db-v1",
            "count": len(links),
            "generatedAt": now_iso(),
            "source": {
                "topics": str(FORMULA_DB.relative_to(ROOT)).replace("\\", "/"),
                "questions": str(QUESTION_DB.relative_to(ROOT)).replace("\\", "/"),
                "chapterCatalog": str(CHAPTER_DB.relative_to(ROOT)).replace("\\", "/"),
            },
            "preservedManualLinks": len(manual_links),
            "backupPath": str(backup_path).replace("\\", "/") if backup_path else "",
        },
        "links": links,
    }
    LINK_DB.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    summary = {
        "source_hit": "program-db/database/formula-db.json",
        "links_total": len(links),
        "manual_preserved": len(manual_links),
        "links_added_topic": added_topic_links,
        "links_added_topic_by_keyword": added_topic_links_by_match,
        "links_added_chapter": added_chapter_links,
        "skipped_no_question_id": skipped_no_question_id,
        "skipped_no_target": skipped_no_target,
        "skipped_low_confidence": skipped_low_confidence,
        "backup_created": str(backup_path) if backup_path else "",
        "output": str(LINK_DB),
        "sample": links[:3],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
