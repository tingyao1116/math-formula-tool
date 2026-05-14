const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.STRUCTURE_BRIDGE_PORT || 4310);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const LOG_DIR = path.join(ROOT, "logs");
const DB_DIR = path.join(ROOT, "program-db", "database");
const FORMULA_DB_PATH = path.join(DB_DIR, "formula-db.json");
const QUESTION_DB_PATH = path.join(DB_DIR, "question-db.json");
const LEGACY_JS_PATH = path.join(DATA_DIR, "formula-content.js");
const QUESTION_JS_PATH = path.join(DATA_DIR, "question-content.js");
const SNAPSHOT_PATH = path.join(DATA_DIR, "managed-structure.auto.json");
const OPLOG_PATH = path.join(LOG_DIR, "structure-operation-log.auto.json");
const EVENTLOG_PATH = path.join(LOG_DIR, "structure-operation-events.ndjson");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(DB_DIR, { recursive: true });

function sendJson(res, code, body) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(body, null, 2));
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString("utf8");
      if (raw.length > 20 * 1024 * 1024) {
        reject(new Error("payload-too-large"));
      }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function readJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonFile(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function getChapterCode(item) {
  return String(item?.chapterCode || item?.chapter_code || "").trim();
}

function wouldCreateCycle(itemId, parentId, byId) {
  let cursor = String(parentId || "").trim();
  const seen = new Set([itemId]);
  while (cursor) {
    if (seen.has(cursor)) return true;
    seen.add(cursor);
    cursor = String(byId.get(cursor)?.parentId || "").trim();
  }
  return false;
}

function normalizeTopicsForDb(items) {
  const cloned = items.map((item, index) => ({
    ...item,
    id: String(item?.id || `custom-topic-${index + 1}`).trim(),
    parentId: String(item?.parentId || "").trim(),
    chapterCode: getChapterCode(item),
    chapter_code: getChapterCode(item),
    manualOrder: index,
    originalIndex: index,
    relatedChapters: [],
    relatedTopicIds: []
  }));
  const byId = new Map(cloned.map((item) => [item.id, item]));

  cloned.forEach((item) => {
    const parent = item.parentId ? byId.get(item.parentId) : null;
    if (
      !item.id ||
      !parent ||
      getChapterCode(parent) !== getChapterCode(item) ||
      wouldCreateCycle(item.id, item.parentId, byId)
    ) {
      item.parentId = "";
      item.isBranch = false;
      return;
    }
    item.isBranch = true;
  });

  return cloned;
}

function writeLegacyJsFromTopics(topics) {
  const jsText = [
    "// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.",
    "// Source: program-db/database/formula-db.json",
    `window.formulaContentRecords = ${JSON.stringify(topics, null, 2)};`,
    ""
  ].join("\n");
  fs.writeFileSync(LEGACY_JS_PATH, jsText, "utf8");
}

function writeManagedSnapshot(topics, savedAt) {
  writeJsonFile(SNAPSHOT_PATH, {
    schema: "math-formula-structure-state-v1",
    savedAt,
    items: topics
  });
}

function writeQuestionJsFromDb() {
  const payload = readJsonFile(QUESTION_DB_PATH, { questions: [] });
  const questions = Array.isArray(payload?.questions) ? payload.questions : [];
  const jsText = [
    "// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.",
    "// Source: program-db/database/question-db.json",
    `window.questionContentRecords = ${JSON.stringify(questions, null, 2)};`,
    ""
  ].join("\n");
  fs.writeFileSync(QUESTION_JS_PATH, jsText, "utf8");
  return questions.length;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "local-structure-bridge",
      port: PORT,
      snapshotPath: SNAPSHOT_PATH,
      operationLogPath: OPLOG_PATH,
      eventLogPath: EVENTLOG_PATH,
      formulaDbPath: FORMULA_DB_PATH,
      legacyJsPath: LEGACY_JS_PATH,
      questionJsPath: QUESTION_JS_PATH
    });
    return;
  }

  if (req.method === "POST" && req.url === "/save") {
    try {
      const raw = await collectBody(req);
      const payload = raw ? JSON.parse(raw) : {};
      const snapshot = payload?.snapshot || {};
      const operationLog = Array.isArray(snapshot?.operationLog) ? snapshot.operationLog : [];
      const event = {
        at: new Date().toISOString(),
        action: String(payload?.action || ""),
        payload: payload?.payload || {},
        totalItems: Array.isArray(snapshot?.items) ? snapshot.items.length : 0
      };

      fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), "utf8");
      fs.writeFileSync(OPLOG_PATH, JSON.stringify({
        schema: "math-formula-operation-log-v1",
        updatedAt: new Date().toISOString(),
        total: operationLog.length,
        operations: operationLog
      }, null, 2), "utf8");
      fs.appendFileSync(EVENTLOG_PATH, `${JSON.stringify(event)}\n`, "utf8");

      sendJson(res, 200, { ok: true, savedAt: event.at });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: String(error?.message || error) });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/save-db") {
    try {
      const raw = await collectBody(req);
      const requestPayload = raw ? JSON.parse(raw) : {};
      const requestItems = Array.isArray(requestPayload?.items) ? requestPayload.items : null;
      if (!requestItems) {
        sendJson(res, 400, { ok: false, error: "items-must-be-array" });
        return;
      }

      const savedAt = new Date().toISOString();
      const dbPayload = readJsonFile(FORMULA_DB_PATH, { meta: {}, topics: [] });
      const topics = normalizeTopicsForDb(requestItems);
      dbPayload.meta = {
        ...(dbPayload.meta || {}),
        count: topics.length,
        updatedAt: savedAt,
        lastManageSave: {
          at: savedAt,
          source: String(requestPayload?.source || "manage")
        }
      };
      dbPayload.topics = topics;

      writeJsonFile(FORMULA_DB_PATH, dbPayload);
      writeLegacyJsFromTopics(topics);
      writeManagedSnapshot(topics, savedAt);
      const questionCount = writeQuestionJsFromDb();
      fs.appendFileSync(EVENTLOG_PATH, `${JSON.stringify({
        at: savedAt,
        action: "save-db",
        source: String(requestPayload?.source || "manage"),
        totalItems: topics.length
      })}\n`, "utf8");

      sendJson(res, 200, {
        ok: true,
        savedAt,
        count: topics.length,
        paths: {
          formulaDb: FORMULA_DB_PATH,
          legacyJs: LEGACY_JS_PATH,
          managedSnapshot: SNAPSHOT_PATH,
          questionJs: QUESTION_JS_PATH
        },
        rebuild: {
          topics: topics.length,
          questions: questionCount
        }
      });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: String(error?.message || error) });
    }
    return;
  }

  sendJson(res, 404, { ok: false, error: "not-found" });
});

server.listen(PORT, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`[structure-bridge] running at http://127.0.0.1:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`[structure-bridge] snapshot => ${SNAPSHOT_PATH}`);
  // eslint-disable-next-line no-console
  console.log(`[structure-bridge] op log   => ${OPLOG_PATH}`);
});
