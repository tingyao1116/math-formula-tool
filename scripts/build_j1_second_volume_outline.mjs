import fs from "node:fs";
import path from "node:path";

const root = "C:\\codex資料夾\\數學公式使用工具\\exports\\j1-second-volume-outline";
const outputName = "國一下_易讀版分頁版_主題大綱版";
const pageBreak = [
  "```{=openxml}",
  '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
  "```",
].join("\n");

const units = [
  {
    folder: "改國一下1_二元一次聯立方程式_整理",
    file: "改國一下1_二元一次聯立方程式_易讀版.md",
    number: 1,
    title: "二元一次聯立方程式",
  },
  {
    folder: "改國一下2_二元一次方程式的圖形_整理",
    file: "改國一下2_二元一次方程式的圖形_易讀版.md",
    number: 2,
    title: "二元一次方程式的圖形",
  },
  {
    folder: "改國一下3_比與比例式_整理",
    file: "改國一下3_比與比例式_易讀版.md",
    number: 3,
    title: "比與比例式",
  },
  {
    folder: "改國一下4_函數與其圖形_整理",
    file: "改國一下4_函數與其圖形_易讀版.md",
    number: 4,
    title: "函數與其圖形",
  },
  {
    folder: "改國一下5_一元一次不等式_整理",
    file: "改國一下5_一元一次不等式_易讀版.md",
    number: 5,
    title: "一元一次不等式",
  },
];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

function writeUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function cleanText(text) {
  return text.trim();
}

function normalizeInlineMath(text) {
  return text.replace(/`([^`\n]+)`/g, (_, inner) => `$${inner}$`);
}

function removeQuotePrefix(text) {
  return normalizeInlineMath(
    cleanText(
    text
      .split("\n")
      .map((line) => line.replace(/^\s*>\s?/, ""))
      .join("\n"),
    ),
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSectionBody(text, heading) {
  const input = `${text.trimEnd()}\n### __END__\n`;
  const pattern = new RegExp(
    `^###\\s+${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=^###\\s+)`,
    "m",
  );
  const match = input.match(pattern);
  return match ? normalizeInlineMath(cleanText(match[1])) : "";
}

function extractLevel2Body(text, heading) {
  const input = `${text.trimEnd()}\n## __END__\n`;
  const pattern = new RegExp(
    `^##\\s+${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=^##\\s+)`,
    "m",
  );
  const match = input.match(pattern);
  return match ? normalizeInlineMath(cleanText(match[1])) : "";
}

function normalizeTopicHeading(heading) {
  return heading.replace(/^(主題|重點)\s*\d+\s*[:：]\s*/, "").trim();
}

function parseTopicSections(text) {
  const input = `${text.trimEnd()}\n## __END__\n`;
  const sectionRegex = /^##\s+(.+?)\s*\n([\s\S]*?)(?=^##\s+)/gm;
  const topics = [];
  let match;

  while ((match = sectionRegex.exec(input)) !== null) {
    const rawHeading = match[1].trim();
    if (rawHeading === "__END__" || rawHeading === "章節地圖" || rawHeading === "閱讀提醒") {
      continue;
    }

    const body = match[2];
    const summary = extractSectionBody(body, "先抓一句話");
    const keyPoints = extractSectionBody(body, "重點整理") || normalizeInlineMath(cleanText(body));

    topics.push({
      heading: normalizeTopicHeading(rawHeading),
      summary,
      keyPoints,
    });
  }

  return topics;
}

function getUnitPageParts(text, unitHeading) {
  const result = {
    intro: "",
    map: "",
    reminders: "",
  };

  const unitInput = `${text.trimEnd()}\n## __END__\n`;
  const unitPattern = new RegExp(
    `^#\\s+${escapeRegExp(unitHeading)}\\s*\\n([\\s\\S]*?)(?=^##\\s+)`,
    "m",
  );
  const unitMatch = unitInput.match(unitPattern);
  if (unitMatch) {
    const quoteBlock = (unitMatch[1].match(/^\s*>.*$/gm) || []).join("\n");
    result.intro = removeQuotePrefix(quoteBlock);
    return result;
  }

  const topQuoteMatch = text.match(/^(?:[^\n]*\n){0,2}((?:>\s?.*\n)+)/);
  if (topQuoteMatch) {
    result.intro = removeQuotePrefix(topQuoteMatch[1].trimEnd());
  }

  result.map = extractLevel2Body(text, "章節地圖");
  result.reminders = extractLevel2Body(text, "閱讀提醒");
  return result;
}

function buildUnitMarkdown({ number, title, pageParts, topics }) {
  const lines = [`# 單元${number} ${title}`, ""];

  if (pageParts.intro) {
    lines.push(pageParts.intro, "");
  }

  if (pageParts.map) {
    lines.push("### 章節大綱", "", pageParts.map, "");
  }

  if (pageParts.reminders) {
    lines.push("### 閱讀提醒", "", pageParts.reminders, "");
  }

  for (const topic of topics) {
    lines.push(pageBreak, "", `## ${topic.heading}`, "");
    if (topic.summary) {
      lines.push(topic.summary, "");
    }
    lines.push("### 重點整理", "", topic.keyPoints.trim(), "");
  }

  return `${lines.join("\n").trim()}\n`;
}

const mergedUnits = [];
let unitPages = 0;
let topicPages = 0;

for (const unit of units) {
  const folderPath = path.join(root, unit.folder);
  const sourcePath = path.join(folderPath, unit.file);
  const sourceText = readUtf8(sourcePath);
  const pageParts = getUnitPageParts(sourceText, `單元${unit.number} ${unit.title}`);
  const topics = parseTopicSections(sourceText);
  const unitMarkdown = buildUnitMarkdown({
    number: unit.number,
    title: unit.title,
    pageParts,
    topics,
  });

  const perUnitOutputPath = path.join(
    folderPath,
    `改國一下${unit.number}_${unit.title}_主題大綱版.md`,
  );
  writeUtf8(perUnitOutputPath, unitMarkdown);

  mergedUnits.push(unitMarkdown.trim());
  unitPages += 1;
  topicPages += topics.length;
}

const mergedMarkdown = `${mergedUnits.join(`\n\n${pageBreak}\n\n`).trim()}\n`;
const mergedMarkdownPath = path.join(root, `${outputName}.md`);
writeUtf8(mergedMarkdownPath, mergedMarkdown);

const summary = {
  merged_markdown: mergedMarkdownPath,
  unit_pages: unitPages,
  topic_pages: topicPages,
  total_expected_pages: unitPages + topicPages,
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
