import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const sourcePath = path.join(projectRoot, "data", "formula-content.js");
const outputDir = path.join(projectRoot, "program-db", "exports");
const outputPath = path.join(outputDir, "formula-content.records.json");

const sourceCode = fs.readFileSync(sourcePath, "utf8");
const sandbox = {
  window: {},
  String,
  console: { log: () => {}, warn: () => {}, error: () => {} }
};

vm.createContext(sandbox);
vm.runInContext(sourceCode, sandbox, { filename: sourcePath });

const records = sandbox.window.formulaContentRecords;
if (!Array.isArray(records)) {
  throw new Error("無法從 data/formula-content.js 取得 window.formulaContentRecords");
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      source: "data/formula-content.js",
      count: records.length,
      records
    },
    null,
    2
  ),
  "utf8"
);

console.log(`已匯出 ${records.length} 筆到 ${outputPath}`);
