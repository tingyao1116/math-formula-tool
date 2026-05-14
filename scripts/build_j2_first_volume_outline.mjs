import fs from "node:fs";
import path from "node:path";

const root = "C:\\codex資料夾\\數學公式使用工具\\exports\\j2-first-volume-outline";
const outputName = "國二上_易讀版分頁版_主題大綱版";
const pageBreak = [
  "```{=openxml}",
  '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
  "```",
].join("\n");

const units = [
  {
    folder: "改國二上1_乘法公式與多項式_整理",
    file: "改國二上1_乘法公式與多項式_易讀版.md",
    number: 1,
    title: "乘法公式與多項式",
  },
  {
    folder: "改國二上2_平方根與立方根_整理",
    file: "改國二上2_平方根與立方根_易讀版.md",
    number: 2,
    title: "平方根與立方根",
  },
  {
    folder: "改國二上3_因式分解_整理",
    file: "改國二上3_因式分解_易讀版.md",
    number: 3,
    title: "因式分解",
  },
  {
    folder: "改國二上4_一元二次方程式_整理",
    file: "改國二上4_一元二次方程式_易讀版.md",
    number: 4,
    title: "一元二次方程式",
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
    const label = content
      .slice(0, colonIndex)
      .trim()
      .replace(/[，。；：、]+$/, "");
    const body = content.slice(colonIndex + 1).trim();
    if (label && body) {
      return `- **${label}**：${body}`;
    }
  }

  const keywordMatch = content.match(
    /^(.{2,16}?)(可以|就是|表示|常寫成|通常記為|稱為|叫做|等於|用來|重視|要看|要先|是)(.+)$/,
  );
  if (keywordMatch) {
    const [, label, keyword, rest] = keywordMatch;
    return `- **${label.trim().replace(/[，。；：、]+$/, "")}**：${keyword}${rest.trim()}`;
  }

  const commaIndex = content.indexOf("，");
  if (commaIndex >= 2 && commaIndex <= 18) {
    const label = content
      .slice(0, commaIndex)
      .trim()
      .replace(/[，。；：、]+$/, "");
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

function extractPreface(text) {
  const titleMatch = text.match(/^#\s+.+?\n([\s\S]*?)(?=^##\s+)/m);
  return titleMatch ? titleMatch[1].trim() : "";
}

function buildGeneratedMap(topics) {
  return topics.map((topic) => `- ${topic.heading}`).join("\n");
}

function getUnitPageParts(text, topics) {
  const rawPreface = extractPreface(text);
  const preface = rawPreface.startsWith(">") ? removeQuotePrefix(rawPreface) : normalizeBlock(rawPreface);
  const sourceMap =
    extractLevel2Body(text, "本章學習地圖") ||
    extractLevel2Body(text, "章節地圖");

  return {
    intro: preface,
    map: sourceMap || buildGeneratedMap(topics),
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

  const perUnitOutputPath = path.join(
    folderPath,
    `改國二上${unit.number}_${unit.title}_主題大綱版.md`,
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
