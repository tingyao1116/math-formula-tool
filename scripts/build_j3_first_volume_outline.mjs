import fs from "node:fs";
import path from "node:path";

const root = "C:\\codex資料夾\\數學公式使用工具\\exports\\j3-first-volume-outline";
const outputName = "國三上_易讀版分頁版_主題大綱版";
const pageBreak = [
  "```{=openxml}",
  '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
  "```",
].join("\n");

const units = [
  { folder: "改國三上1_比例線段_整理", file: "改國三上1_比例線段_易讀版.md", number: 1, title: "比例線段" },
  { folder: "改國三上2_相似三角形_整理", file: "改國三上2_相似三角形_易讀版.md", number: 2, title: "相似三角形" },
  { folder: "改國三上3_點直線與圓的關係_整理", file: "改國三上3_點直線與圓的關係_易讀版.md", number: 3, title: "點、直線與圓的關係" },
  { folder: "改國三上4_兩圓的位置關係與公切圓_整理", file: "改國三上4_兩圓的位置關係與公切圓_易讀版.md", number: 4, title: "兩圓的位置關係與公切圓" },
  { folder: "改國三上5_圓與角_整理", file: "改國三上5_圓與角_易讀版.md", number: 5, title: "圓與角" },
  { folder: "改國三上6_幾何推理_整理", file: "改國三上6_幾何推理_易讀版.md", number: 6, title: "幾何推理" },
  { folder: "改國三上7_綜合證題法_整理", file: "改國三上7_綜合證題法_易讀版.md", number: 7, title: "綜合證題法" },
  { folder: "改國三上8_三角形的外心_整理", file: "改國三上8_三角形的外心_易讀版.md", number: 8, title: "三角形的外心" },
  { folder: "改國三上9_三角形的內心_整理", file: "改國三上9_三角形的內心_易讀版.md", number: 9, title: "三角形的內心" },
  { folder: "改國三上10_三角形的重心_整理", file: "改國三上10_三角形的重心_易讀版.md", number: 10, title: "三角形的重心" },
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeInlineFormatting(text) {
  return text.replace(/`([^`\n]+)`/g, (_, inner) => {
    let value = inner.trim();
    let trailing = "";
    const trailingMatch = value.match(/^(.*?)([，。；：、]+)$/);
    if (trailingMatch) {
      value = trailingMatch[1].trim();
      trailing = trailingMatch[2];
    }
    if (/[\u4e00-\u9fff]/.test(value)) {
      return `${value}${trailing}`;
    }
    if (/[A-Za-z0-9\\=+\-*/<>()[\]{}_^:,.|]/.test(value)) {
      value = value.replace(/°/g, "^\\circ");
      return `$${value}$${trailing}`;
    }
    return `${value}${trailing}`;
  });
}

function normalizeBlock(text) {
  return normalizeInlineFormatting(cleanText(text));
}

function removeQuotePrefix(text) {
  return normalizeBlock(
    text
      .split("\n")
      .map((line) => line.replace(/^\s*>\s?/, ""))
      .join("\n"),
  );
}

function extractSectionBody(text, heading) {
  const input = `${text.trimEnd()}\n### __END__\n`;
  const pattern = new RegExp(
    `^###\\s+${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=^###\\s+)`,
    "m",
  );
  const match = input.match(pattern);
  return match ? normalizeBlock(match[1]) : "";
}

function extractLevel2Body(text, heading) {
  const input = `${text.trimEnd()}\n## __END__\n`;
  const pattern = new RegExp(
    `^##\\s+${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=^##\\s+)`,
    "m",
  );
  const match = input.match(pattern);
  return match ? normalizeBlock(match[1]) : "";
}

function normalizeTopicHeading(heading) {
  return normalizeInlineFormatting(
    heading
      .replace(/^(主題|重點)\s*\d+\s*[:：]\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .trim(),
  );
}

function formatBulletWithLabel(line) {
  const bulletMatch = line.match(/^-\s+(.*)$/);
  if (!bulletMatch) {
    return line;
  }

  const content = bulletMatch[1].trim();
  if (!content) {
    return line;
  }

  if (/^\*\*.+?\*\*[:：]/.test(content)) {
    return `- ${content}`;
  }

  const boldLeadMatch = content.match(/^\*\*(.+?)\*\*\s*(.+)$/);
  if (boldLeadMatch) {
    const label = boldLeadMatch[1].trim().replace(/[，。；：、]+$/, "");
    const body = boldLeadMatch[2].trim();
    if (label && body) {
      return `- **${label}**：${body}`;
    }
  }

  const colonIndex = content.search(/[:：]/);
  if (colonIndex >= 0) {
    const label = content.slice(0, colonIndex).trim().replace(/[，。；：、]+$/, "");
    const body = content.slice(colonIndex + 1).trim();
    if (label && body) {
      return `- **${label}**：${body}`;
    }
  }

  const keywordMatch = content.match(
    /^(.{2,16}?)(可以|就是|表示|常寫成|通常記為|稱為|叫做|等於|用來|重視|要看|要先|是|代表)(.+)$/,
  );
  if (keywordMatch) {
    const [, label, keyword, rest] = keywordMatch;
    return `- **${label.trim().replace(/[，。；：、]+$/, "")}**：${keyword}${rest.trim()}`;
  }

  const commaIndex = content.indexOf("，");
  if (commaIndex >= 2 && commaIndex <= 18) {
    const label = content.slice(0, commaIndex).trim().replace(/[，。；：、]+$/, "");
    const body = content.slice(commaIndex + 1).trim();
    if (label && body) {
      return `- **${label}**：${body}`;
    }
  }

  return `- **重點**：${content}`;
}

function formatKeyPoints(text) {
  return text
    .split("\n")
    .map((line) => formatBulletWithLabel(line))
    .join("\n");
}

function parseTopicSections(text) {
  const input = `${text.trimEnd()}\n## __END__\n`;
  const sectionRegex = /^##\s+(.+?)\s*\n([\s\S]*?)(?=^##\s+)/gm;
  const topics = [];
  let match;

  while ((match = sectionRegex.exec(input)) !== null) {
    const rawHeading = match[1].trim();
    if (
      rawHeading === "__END__" ||
      rawHeading === "本章學習地圖" ||
      rawHeading === "章節地圖" ||
      rawHeading === "閱讀提醒" ||
      rawHeading === "閱讀方式"
    ) {
      continue;
    }

    const body = match[2];
    const keyPoints =
      extractSectionBody(body, "重點整理") ||
      extractSectionBody(body, "公式、性質與判斷") ||
      extractSectionBody(body, "公式與判斷") ||
      normalizeBlock(body);

    topics.push({
      heading: normalizeTopicHeading(rawHeading),
      keyPoints: formatKeyPoints(keyPoints),
    });
  }

  return topics;
}

function extractPrefaceParts(text) {
  const titleMatch = text.match(/^#\s+.+?\n([\s\S]*?)(?=^##\s+)/m);
  const preface = titleMatch ? titleMatch[1].trim() : "";
  const parts = { intro: [], reminders: [] };

  if (!preface) {
    return parts;
  }

  const blocks = preface
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const normalized = block.startsWith(">") ? removeQuotePrefix(block) : normalizeBlock(block);
    if (!normalized) {
      continue;
    }
    if (normalized.startsWith("閱讀方式：")) {
      parts.reminders.push(normalized);
    } else {
      parts.intro.push(normalized);
    }
  }

  return parts;
}

function buildGeneratedMap(topics) {
  return topics.map((topic) => `- ${topic.heading}`).join("\n");
}

function getUnitPageParts(text, topics) {
  const preface = extractPrefaceParts(text);
  const sourceMap =
    extractLevel2Body(text, "本章學習地圖") ||
    extractLevel2Body(text, "章節地圖");
  const sourceReminders =
    extractLevel2Body(text, "閱讀提醒") ||
    extractLevel2Body(text, "閱讀方式");

  const reminders = [...preface.reminders];
  if (sourceReminders) {
    reminders.push(sourceReminders);
  }

  return {
    intro: preface.intro.join("\n\n"),
    map: sourceMap || buildGeneratedMap(topics),
    reminders: reminders.join("\n\n"),
  };
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
    lines.push(pageBreak, "", `## ${topic.heading}`, "", "### 重點整理", "", topic.keyPoints, "");
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
  const topics = parseTopicSections(sourceText);
  const pageParts = getUnitPageParts(sourceText, topics);
  const unitMarkdown = buildUnitMarkdown({
    number: unit.number,
    title: unit.title,
    pageParts,
    topics,
  });

  const perUnitOutputPath = path.join(folderPath, `改國三上${unit.number}_${unit.title}_主題大綱版.md`);
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
