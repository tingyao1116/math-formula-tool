PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  stage TEXT,
  grade TEXT,
  term TEXT,
  chapter TEXT,
  domain TEXT,
  difficulty TEXT,
  chapter_role TEXT,
  parent_id TEXT,
  formula_json TEXT NOT NULL DEFAULT '{}',
  content_types_json TEXT NOT NULL DEFAULT '[]',
  tags_json TEXT NOT NULL DEFAULT '[]',
  usage_json TEXT NOT NULL DEFAULT '[]',
  examples_json TEXT NOT NULL DEFAULT '[]',
  tips_json TEXT NOT NULL DEFAULT '[]',
  notes_json TEXT NOT NULL DEFAULT '[]',
  mistakes_json TEXT NOT NULL DEFAULT '[]',
  source_ref TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  explanation_text TEXT,
  stage TEXT,
  grade TEXT,
  chapter TEXT,
  difficulty TEXT,
  question_type TEXT,
  source_type TEXT,
  source_ref TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS question_images (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  image_path TEXT NOT NULL,
  image_role TEXT NOT NULL DEFAULT 'question',
  sort_order INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS topic_questions (
  topic_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  relation_type TEXT NOT NULL DEFAULT 'practice',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (topic_id, question_id),
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS source_documents (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  title TEXT,
  imported_at TEXT NOT NULL DEFAULT (datetime('now')),
  metadata_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_topics_stage_grade ON topics(stage, grade);
CREATE INDEX IF NOT EXISTS idx_topics_chapter ON topics(chapter);
CREATE INDEX IF NOT EXISTS idx_questions_stage_grade ON questions(stage, grade);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);
CREATE INDEX IF NOT EXISTS idx_question_images_question_id ON question_images(question_id);
CREATE INDEX IF NOT EXISTS idx_topic_questions_question_id ON topic_questions(question_id);
