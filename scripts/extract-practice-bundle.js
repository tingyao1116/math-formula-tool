const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "data", "formula-practice.js");
const practiceDbPath = path.join(rootDir, "program-db", "database", "practice-db.json");
const bundleOrder = ["e5", "e6", "j1", "j2", "j3", "j4", "j5", "j6", "s1", "s2", "s3", "s4", "s5"];

function normalizeId(value) {
  return String(value || "").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readPracticeDb() {
  const raw = fs.readFileSync(practiceDbPath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function collectBundleConfigKeys(bundleKey) {
  const db = readPracticeDb();
  const keys = new Set();

  for (const practice of db.practices || []) {
    const chapterCode = normalizeId(practice.chapterCode);
    const generatorKey = normalizeId(practice.generatorKey);
    if (!chapterCode.startsWith(`${bundleKey}-`) || !generatorKey) continue;
    keys.add(generatorKey);
  }

  return keys;
}

function collectFunctionDefinitions(source) {
  const regex = /^  function\s+([A-Za-z0-9_]+)\s*\(/gm;
  const definitions = new Map();

  const matches = Array.from(source.matchAll(regex));
  const storeIndex = source.indexOf("window.formulaPracticeStore = {");
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const name = current[1];
    const start = current.index;
    const end = next ? next.index : storeIndex;
    if (typeof start !== "number" || typeof end !== "number" || end <= start) continue;
    definitions.set(name, {
      name,
      start,
      end,
      source: source.slice(start, end).trimEnd(),
    });
  }

  return definitions;
}

function extractConfigsSection(source) {
  const configsIndex = source.indexOf("    configs: {");
  if (configsIndex === -1) {
    throw new Error("Cannot find formulaPracticeStore.configs block.");
  }
  const getConfigIndex = source.indexOf("\n    getConfig(id) {", configsIndex);
  if (getConfigIndex === -1) {
    throw new Error("Cannot find formulaPracticeStore.getConfig block.");
  }
  return source.slice(configsIndex, getConfigIndex);
}

function collectConfigEntries(source) {
  const configsSection = extractConfigsSection(source);
  const entryRegex = /^      '([^']+)': \{\r?\n[\s\S]*?^      \},\r?\n/gm;
  const entries = [];
  let match = entryRegex.exec(configsSection);
  while (match) {
    entries.push({
      key: match[1],
      source: match[0].trimEnd(),
    });
    match = entryRegex.exec(configsSection);
  }
  return entries;
}

function extractBundleConfigBlock(source, bundleKey) {
  const bundleConfigKeys = collectBundleConfigKeys(bundleKey);
  const allEntries = collectConfigEntries(source);
  const selectedEntries = allEntries
    .filter((entry) => entry.key.startsWith(`${bundleKey}-`) || bundleConfigKeys.has(entry.key))
    .map((entry) => entry.source);

  if (selectedEntries.length === 0) {
    throw new Error(`Cannot find configs for bundle ${bundleKey}.`);
  }
  return {
    configBlock: selectedEntries.join("\n"),
    configKeys: Array.from(bundleConfigKeys),
    configEntryCount: selectedEntries.length,
  };
}

function collectRootFunctionNames(configBlock) {
  const names = new Set();
  const regex = /return\s+([A-Za-z0-9_]+)\s*\(/g;
  let match = regex.exec(configBlock);
  while (match) {
    names.add(match[1]);
    match = regex.exec(configBlock);
  }
  return Array.from(names);
}

function collectDependencyFunctions(allDefinitions, rootNames) {
  const included = new Set();
  const queue = [...rootNames];
  const availableNames = Array.from(allDefinitions.keys());

  while (queue.length > 0) {
    const name = queue.pop();
    if (!name || included.has(name) || !allDefinitions.has(name)) continue;
    included.add(name);

    const body = allDefinitions.get(name).source;
    for (const candidate of availableNames) {
      if (included.has(candidate)) continue;
      const pattern = new RegExp(`\\b${escapeRegExp(candidate)}\\b`);
      if (pattern.test(body)) {
        queue.push(candidate);
      }
    }
  }

  return Array.from(included)
    .map((name) => allDefinitions.get(name))
    .sort((a, b) => a.start - b.start);
}

function buildBundleSource(bundleKey, functionDefinitions, configBlock) {
  const functionBlock = functionDefinitions
    .map((definition) => definition.source.trimEnd())
    .join("\n\n");

  return `(() => {
  const store = window.formulaPracticeStore;
  if (!store || typeof store.registerConfigs !== "function") return;

${functionBlock}

  const nextConfigs = {
${configBlock}
  };

  const bundleFingerprint = "${bundleKey}-bundle-v20260619-v2";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
`;
}

function main() {
  const bundleKey = normalizeId(process.argv[2] || "e5");
  if (!bundleOrder.includes(bundleKey)) {
    throw new Error(`Unsupported bundle: ${bundleKey}`);
  }

  const source = fs.readFileSync(sourcePath, "utf8");
  const allDefinitions = collectFunctionDefinitions(source);
  const { configBlock, configKeys, configEntryCount } = extractBundleConfigBlock(source, bundleKey);
  const rootNames = collectRootFunctionNames(configBlock);
  const dependencyDefinitions = collectDependencyFunctions(allDefinitions, rootNames);

  const bundleSource = buildBundleSource(bundleKey, dependencyDefinitions, configBlock);
  const outputPath = path.join(rootDir, "data", "practice-generators", `${bundleKey}.js`);
  fs.writeFileSync(outputPath, bundleSource, "utf8");

  console.log(JSON.stringify({
    bundleKey,
    outputPath,
    functionCount: dependencyDefinitions.length,
    rootFunctionCount: rootNames.length,
    configEntryCount,
    chapterMappedConfigKeyCount: configKeys.length,
  }, null, 2));
}

main();
