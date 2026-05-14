import fs from "node:fs";
import path from "node:path";

const root = "C:\\codex資料夾\\數學公式使用工具\\exports\\j3-second-volume-outline";
const outputName = "國三下_易讀版分頁版_主題大綱版";
const pageBreak = [
  "```{=openxml}",
  '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
  "```",
].join("\n");

const units = [
  {
    folder: "改國三下1_二次函數與其圖形_整理",
    file: "改國三下1_二次函數與其圖形_易讀版.md",
    number: 1,
    title: "二次函數與其圖形",
    output: "改國三下1_二次函數與其圖形_主題大綱版.md",
  },
  {
    folder: "改國三下2_統計一_整理",
    file: "改國三下2_統計一_易讀版.md",
    number: 2,
    title: "統計一",
    output: "改國三下2_統計一_主題大綱版.md",
  },
  {
    folder: "改國三下3_統計二_整理",
    file: "改國三下3_統計二_易讀版.md",
    number: 3,
    title: "統計二",
    output: "改國三下3_統計二_主題大綱版.md",
  },
  {
    folder: "改國三下4_統計三_整理",
    file: "改國三下4_統計三_易讀版.md",
    number: 4,
    title: "統計三",
    output: "改國三下4_統計三_主題大綱版.md",
  },
  {
    folder: "改國三下5_統計四_整理",
    file: "改國三下5_統計四_易讀版.md",
    number: 5,
    title: "統計四",
    output: "改國三下5_統計四_主題大綱版.md",
  },
  {
    folder: "改國三下6_機率_整理",
    file: "改國三下6_機率_易讀版.md",
    number: 6,
    title: "機率",
    output: "改國三下6_機率_主題大綱版.md",
  },
];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

function writeUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function cleanText(text) {
  return text.trim().replace(/\n{3,}/g, "\n\n");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripTrailingPunctuation(text) {
  return text.replace(/[：:，。、；,.!?]+$/u, "").trim();
}

function normalizeInlineFormatting(text) {
  return text.replace(/`([^`\n]+)`/g, (_, inner) => {
    const value = inner.trim();
    if (!value) {
      return "";
    }
    if (/[\u4e00-\u9fff]/u.test(value) && !/[A-Za-z0-9]/.test(value)) {
      return value;
    }
    return `$${value.replace(/°/g, "^\\circ")}$`;
  });
}

function normalizeBlock(text) {
  return cleanText(normalizeInlineFormatting(text));
}

function extractSectionBody(text, heading, level = 3) {
  const marker = `${"#".repeat(level)} __END__`;
  const input = `${text.trimEnd()}\n${marker}\n`;
  const pattern = new RegExp(
    `^${"#".repeat(level)}\\s+${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=^${"#".repeat(level)}\\s+)`,
    "m",
  );
  const match = input.match(pattern);
  return match ? normalizeBlock(match[1]) : "";
}

function extractPreface(text) {
  const match = text.match(/^#\s+.+?\n([\s\S]*?)(?=^##\s+)/m);
  return match ? normalizeBlock(match[1]) : "";
}

function extractReadingWay(text) {
  return extractSectionBody(text, "閱讀方式", 2);
}

function normalizeTopicHeading(heading) {
  return normalizeInlineFormatting(
    heading
      .replace(/^\d+\.\s*/u, "")
      .replace(/^主題\s*\d+\s*[:：]?\s*/u, "")
      .replace(/^重點\s*\d+\s*[:：]?\s*/u, "")
      .trim(),
  );
}

function splitBlocks(text) {
  return text
    .split(/\n\s*\n/u)
    .map((block) => block.trim())
    .filter(Boolean);
}

function normalizeBullet(content) {
  if (!content) {
    return "";
  }

  const raw = normalizeInlineFormatting(content.trim());
  if (!raw) {
    return "";
  }

  const keepBold = raw.match(/^\*\*(.+?)\*\*\s*[：:]\s*(.+)$/u);
  if (keepBold) {
    return `- **${stripTrailingPunctuation(keepBold[1])}**：${keepBold[2].trim()}`;
  }

  const colonMatch = raw.match(/^(.{1,22}?)[：:]\s*(.+)$/u);
  if (colonMatch) {
    return `- **${stripTrailingPunctuation(colonMatch[1])}**：${colonMatch[2].trim()}`;
  }

  const numbered = raw.match(/^\d+\.\s*(.+)$/u);
  if (numbered) {
    return `- **重點**：${numbered[1].trim()}`;
  }

  return `- **重點**：${raw}`;
}

function formatKeyPoints(text) {
  const lines = [];

  for (const block of splitBlocks(text)) {
    for (const line of block.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      const bullet = trimmed.match(/^[-*]\s+(.+)$/u);
      lines.push(normalizeBullet(bullet ? bullet[1] : trimmed));
    }
  }

  return lines.filter(Boolean).join("\n");
}

function extractLearningGoal(topicBody) {
  const match = topicBody.match(/^>\s*(.+)$/m);
  return match ? normalizeInlineFormatting(match[1].trim()) : "";
}

function extractKeyPoints(topicBody) {
  return (
    extractSectionBody(topicBody, "公式、性質與判斷") ||
    extractSectionBody(topicBody, "重點整理") ||
    extractSectionBody(topicBody, "先抓住核心") ||
    normalizeBlock(topicBody)
  );
}

function parseTopics(text) {
  const input = `${text.trimEnd()}\n## __END__\n`;
  const regex = /^##\s+(.+?)\s*\n([\s\S]*?)(?=^##\s+)/gmu;
  const topics = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    const rawHeading = match[1].trim();
    if (rawHeading === "__END__" || rawHeading === "閱讀方式") {
      continue;
    }

    const body = match[2].trim();
    topics.push({
      heading: normalizeTopicHeading(rawHeading),
      goal: extractLearningGoal(body),
      keyPoints: formatKeyPoints(extractKeyPoints(body)),
    });
  }

  return topics;
}

function buildUnitPage(number, title, intro, topics, reminders) {
  const lines = [`# 單元${number} ${title}`, ""];

  if (intro) {
    lines.push(intro, "");
  }

  lines.push("### 章節大綱", "");
  for (const topic of topics) {
    lines.push(`- ${topic.heading}`);
  }
  lines.push("");

  if (reminders) {
    lines.push("### 閱讀提醒", "", reminders, "");
  }

  return lines.join("\n").trim();
}

function buildTopicPage(topic) {
  const lines = [`## ${topic.heading}`, ""];

  if (topic.goal) {
    lines.push(`> ${topic.goal}`, "");
  }

  lines.push("### 重點整理", "", topic.keyPoints || "- **重點**：待補整理。", "");
  return lines.join("\n").trim();
}

function buildUnitMarkdown(unit, sourceText) {
  const intro = extractPreface(sourceText);
  const reminders = extractReadingWay(sourceText);
  const topics = parseTopics(sourceText);

  const pages = [buildUnitPage(unit.number, unit.title, intro, topics, reminders)];
  for (const topic of topics) {
    pages.push(buildTopicPage(topic));
  }

  return {
    markdown: pages.join(`\n\n${pageBreak}\n\n`),
    topicCount: topics.length,
  };
}

const mergedParts = [];
let topicPages = 0;

for (const unit of units) {
  const sourcePath = path.join(root, unit.folder, unit.file);
  const sourceText = readUtf8(sourcePath);
  const { markdown, topicCount } = buildUnitMarkdown(unit, sourceText);
  const outputPath = path.join(root, unit.folder, unit.output);
  writeUtf8(outputPath, `${markdown}\n`);
  mergedParts.push(markdown);
  topicPages += topicCount;
}

const mergedMarkdown = `${mergedParts.join(`\n\n${pageBreak}\n\n`)}\n`;
const mergedPath = path.join(root, `${outputName}.md`);
writeUtf8(mergedPath, mergedMarkdown);

const summary = {
  merged_markdown: mergedPath,
  unit_pages: units.length,
  topic_pages: topicPages,
  total_expected_pages: units.length + topicPages,
};

console.log(JSON.stringify(summary, null, 2));
