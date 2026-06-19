const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "data", "formula-practice.js");
const practiceDbPath = path.join(rootDir, "program-db", "database", "practice-db.json");
const outputPath = path.join(rootDir, "data", "formula-practice.compare.js");
const bundleOrder = ["e5", "e6", "j1", "j2", "j3", "j4", "j5", "j6", "s1", "s2", "s3", "s4", "s5"];

function normalizeBundleList(rawArgs) {
  const normalized = rawArgs
    .flatMap((value) => String(value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  return normalized.length > 0 ? normalized : ["e5", "e6"];
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
    const chapterCode = String(practice.chapterCode || "").trim();
    const generatorKey = String(practice.generatorKey || "").trim();
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
      source: source.slice(start, end),
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
  return {
    start: configsIndex,
    end: getConfigIndex,
    source: source.slice(configsIndex, getConfigIndex),
  };
}

function collectConfigEntries(source) {
  const configsSection = extractConfigsSection(source);
  const entryRegex = /^      '([^']+)': \{\r?\n[\s\S]*?^      \},\r?\n/gm;
  const entries = [];
  let match = entryRegex.exec(configsSection.source);
  while (match) {
    entries.push({
      key: match[1],
      start: configsSection.start + match.index,
      end: configsSection.start + match.index + match[0].length,
      source: match[0],
    });
    match = entryRegex.exec(configsSection.source);
  }
  return entries;
}

function collectRootFunctionNames(configEntries) {
  const names = new Set();
  const regex = /return\s+([A-Za-z0-9_]+)\s*\(/g;
  for (const entry of configEntries) {
    let match = regex.exec(entry.source);
    while (match) {
      names.add(match[1]);
      match = regex.exec(entry.source);
    }
    regex.lastIndex = 0;
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

  return Array.from(included).map((name) => allDefinitions.get(name));
}

function collectBundleNamedFunctions(allDefinitions, bundleKey) {
  const upperKey = bundleKey.toUpperCase();
  const ranges = [];
  for (const definition of allDefinitions.values()) {
    if (
      definition.name.startsWith(`build${upperKey}`) ||
      definition.name.startsWith(`${bundleKey}`)
    ) {
      ranges.push(definition);
    }
  }
  return ranges;
}

function mergeRanges(ranges) {
  const sorted = ranges
    .filter((range) => range && Number.isInteger(range.start) && Number.isInteger(range.end) && range.end > range.start)
    .sort((a, b) => a.start - b.start);
  const merged = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push({ ...range });
      continue;
    }
    last.end = Math.max(last.end, range.end);
    last.bundleKeys = Array.from(new Set([...(last.bundleKeys || []), ...(range.bundleKeys || [])]));
    last.kind = `${last.kind}+${range.kind}`;
  }
  return merged;
}

function buildComment(range) {
  const bundles = (range.bundleKeys || []).join(", ");
  if ((range.kind || "").includes("function")) {
    return `  // [compare-only] moved ${bundles} generator functions to data/practice-generators/${bundles.split(", ")[0]}.js\n\n`;
  }
  if ((range.kind || "").includes("config")) {
    return `      // [compare-only] moved ${bundles} configs to data/practice-generators/${bundles.split(", ")[0]}.js\n`;
  }
  return "";
}

function removeRanges(source, ranges) {
  let cursor = 0;
  let nextSource = "";
  for (const range of mergeRanges(ranges)) {
    nextSource += source.slice(cursor, range.start);
    nextSource += buildComment(range);
    cursor = range.end;
  }
  nextSource += source.slice(cursor);
  return nextSource;
}

function main() {
  const bundleKeys = normalizeBundleList(process.argv.slice(2));
  for (const bundleKey of bundleKeys) {
    if (!bundleOrder.includes(bundleKey)) {
      throw new Error(`Unsupported bundle: ${bundleKey}`);
    }
  }

  const source = fs.readFileSync(sourcePath, "utf8");
  const allDefinitions = collectFunctionDefinitions(source);
  const allConfigEntries = collectConfigEntries(source);
  const ranges = [];
  const summary = [];

  for (const bundleKey of bundleKeys) {
    const bundleConfigKeys = collectBundleConfigKeys(bundleKey);
    const configEntries = allConfigEntries.filter(
      (entry) => entry.key.startsWith(`${bundleKey}-`) || bundleConfigKeys.has(entry.key),
    );
    const rootNames = collectRootFunctionNames(configEntries);
    const dependencyDefinitions = collectDependencyFunctions(allDefinitions, rootNames);
    const namedDefinitions = collectBundleNamedFunctions(allDefinitions, bundleKey);
    const removedDefinitions = mergeRanges(
      [...dependencyDefinitions, ...namedDefinitions].map((definition) => ({
        start: definition.start,
        end: definition.end,
      })),
    );

    for (const entry of configEntries) {
      ranges.push({
        kind: "config",
        start: entry.start,
        end: entry.end,
        bundleKeys: [bundleKey],
      });
    }

    for (const definition of removedDefinitions) {
      ranges.push({
        kind: "function",
        start: definition.start,
        end: definition.end,
        bundleKeys: [bundleKey],
      });
    }

    summary.push({
      bundleKey,
      configCount: configEntries.length,
      functionCount: removedDefinitions.length,
      chapterMappedConfigKeyCount: bundleConfigKeys.size,
    });
  }

  const compareSource = removeRanges(source, ranges);
  const header =
    `// compare-only snapshot generated by scripts/build-formula-practice-compare.js\n` +
    `// removed bundles: ${bundleKeys.join(", ")}\n` +
    `// source kept intact at data/formula-practice.js\n\n`;
  fs.writeFileSync(outputPath, header + compareSource, "utf8");

  console.log(JSON.stringify({
    outputPath,
    removedBundles: bundleKeys,
    summary,
  }, null, 2));
}

main();
