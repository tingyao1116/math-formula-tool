#!/usr/bin/env node
const fs = require("fs");

const DB_PATH = "program-db/database/formula-db.json";
const now = "2026-04-18T00:55:00+08:00";

const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
const topics = Array.isArray(db.topics) ? db.topics : [];

function upsertTopic(topic) {
  const idx = topics.findIndex((t) => String(t.id || "").trim() === topic.id);
  if (idx >= 0) {
    topics[idx] = { ...topics[idx], ...topic };
    return "updated";
  }
  topics.push(topic);
  return "added";
}

function baseTopic(overrides) {
  return {
    stage: "高中",
    grade: "高一",
    term: "上學期",
    chapter: "實數",
    chapterCode: "s1-1-1",
    domain: "數與量",
    difficulty: "基礎",
    chapterRole: "主題",
    parentId: "senior-real-number-overview",
    contentTypes: ["公式", "定義", "題型", "使用技巧", "注意事項", "常見錯誤"],
    contentTypesLocked: true,
    mathNotationLocked: true,
    relatedChapters: ["s1-1-1"],
    relatedTopicIds: [],
    modifiedAt: now,
    ...overrides,
  };
}

const summary = { added: 0, updated: 0 };

[
  baseTopic({
    id: "senior-rational-number-definition",
    title: "有理數的定義與性質",
    formula: {
      type: "labeled-lines",
      lines: [
        { label: "定義", values: ["x=\\frac{p}{q},\\ p,q\\in\\mathbb{Z},\\ q\\ne0"] },
        { label: "分類", values: ["\\mathbb{Q}=\\{\\text{整數、有限小數、循環小數}\\}"] },
        { label: "判斷分數相等", values: ["\\frac{a}{b}=\\frac{c}{d}\\Leftrightarrow ad=bc\\ (b,d\\ne0)"] },
      ],
    },
    tags: ["s1-1-1", "有理數", "實數", "重點整理"],
    usage: [
      "先判斷題目中的數能不能寫成分數，這是最穩的入口。",
      "需要比較、分類或證明「是不是有理數」時直接使用。",
    ],
    examples: [
      "整數、有限小數、循環小數都屬於有理數，例如 \\(-3,\\ 0.125,\\ 0.\\overline{3}\\)。",
      "若 \\(\\frac{2}{3}=\\frac{x}{9}\\)，可用交叉相乘得 \\((2)(9)=(3)x\\)。",
    ],
    tips: [
      "先分類再運算：先看是整數、分數還是小數，再決定要不要化分數。",
      "分母不能為 0，這是最常被忽略的基本限制。",
    ],
    notes: [
      "純循環小數可直接化分數：\\(0.\\overline{abc}=\\frac{abc}{999}\\)。",
      "混合循環小數可用「整段減不循環段」再除以對應的 9 與 0。",
    ],
    mistakes: [
      "把所有小數都當作無理數。",
      "沒有先約分就下結論，導致判斷失誤。",
    ],
  }),
  baseTopic({
    id: "senior-irrational-number-basics",
    title: "無理數",
    formula: {
      type: "labeled-lines",
      lines: [
        { label: "定義", values: ["\\text{無法寫成 }\\frac{p}{q}\\text{ 的實數}"] },
        { label: "常見判斷", values: ["\\sqrt{n}\\text{ 若 }n\\text{ 非完全平方數，通常是無理數}"] },
        { label: "係數比較法", values: ["a+b\\sqrt{e}=c+d\\sqrt{e}\\Rightarrow a=c,\\ b=d\\ (\\sqrt{e}\\text{ 為無理數})"] },
      ],
    },
    tags: ["s1-1-1", "無理數", "反證法", "重點整理"],
    usage: [
      "題目問「是否為無理數」時，先檢查能否寫成分數。",
      "遇到含 \\(\\sqrt{e}\\) 的等式，可優先考慮係數比較。",
    ],
    examples: [
      "\\(\\sqrt{5},\\ \\sqrt[3]{3},\\ \\pi\\) 是常見無理數。",
      "\\(\\sqrt{144}=12\\) 是有理數，不是無理數。",
    ],
    tips: [
      "無理數四則運算不一定還是無理數，要看算完的結果。",
      "證明題常見路線：先假設是有理數，推導矛盾再否定。",
    ],
    notes: [
      "有理數加非零無理數一定是無理數。",
      "兩個無理數相乘可能是有理數，例如 \\((\\sqrt{5})(\\sqrt{5})=5\\)。",
    ],
    mistakes: [
      "把所有根號數都當成無理數。",
      "看到無理數加減乘除就直接判定仍為無理數。",
    ],
  }),
  baseTopic({
    id: "senior-real-line-interval-notation",
    title: "實數與數線",
    formula: {
      type: "labeled-lines",
      lines: [
        { label: "數線三要素", values: ["\\text{原點、正方向、單位長}"] },
        { label: "大小比較", values: ["a<b\\Leftrightarrow a\\text{ 在 }b\\text{ 左邊}"] },
        { label: "絕對值", values: ["|a|=d(a,0)"] },
        { label: "區間記號", values: ["(a,b),\\ [a,b],\\ [a,b),\\ (a,b]"] },
      ],
    },
    tags: ["s1-1-1", "實數", "數線", "區間", "重點整理"],
    usage: [
      "題目出現不等式範圍時，先轉成數線與區間，判斷會更快。",
      "看到「距離」關鍵字時，優先改寫成絕對值。",
    ],
    examples: [
      "\\(-2<x\\le 3\\) 對應區間 \\((-2,3]\\)。",
      "\\(|x-4|<2\\) 可轉為 \\((2,6)\\)。",
    ],
    tips: [
      "先畫點再判斷是否含端點，括號就不容易寫錯。",
      "比較大小時，不要只看絕對值，要看數在線上的左右位置。",
    ],
    notes: [
      "實數可分為有理數與無理數，兩者都能對應到數線上的點。",
      "任兩個不同實數之間，還能找到其他實數（稠密性）。",
    ],
    mistakes: [
      "把 \\(<\\) 與 \\(\\le\\) 的端點畫法混淆。",
      "誤以為絕對值有正負。",
    ],
  }),
  baseTopic({
    id: "senior-distance-midpoint-section-formulas",
    title: "距離與分點公式",
    formula: {
      type: "labeled-lines",
      lines: [
        { label: "原點到點 a 的距離", values: ["OP=|a|"] },
        { label: "兩點距離", values: ["PQ=|a-b|"] },
        { label: "中點公式", values: ["M=\\frac{a+b}{2}"] },
        { label: "內分點", values: ["x=\\frac{mb+na}{m+n}\\quad(AP:PB=m:n)"] },
        { label: "外分點", values: ["x=\\frac{mb-na}{m-n}\\quad(AP:PB=m:n)"] },
      ],
    },
    tags: ["s1-1-1", "距離", "中點", "內分", "外分", "重點整理"],
    usage: [
      "題目要求數線兩點距離、中點座標、按比例分點時直接套用。",
      "文字題先判斷是內分還是外分，再選公式。",
    ],
    examples: [
      "若 \\(A(2),B(10)\\)，則 \\(AB=|2-10|=8\\)，中點為 \\(6\\)。",
      "若 \\(AP:PB=2:3\\) 且 \\(A(1),B(11)\\)，內分點 \\(x=\\frac{2\\cdot11+3\\cdot1}{2+3}=5\\)。",
    ],
    tips: [
      "速記：內分用加、外分用減。",
      "算完後回到數線檢查位置是否合理。",
    ],
    notes: [
      "比例 \\(m:n\\) 指的是「對面乘過來」的權重。",
      "外分常見於點在兩端外側的題型。",
    ],
    mistakes: [
      "把內分外分公式混用。",
      "只代公式不檢查結果位置，導致符號錯誤。",
    ],
    chapterRole: "分支主題",
    parentId: "senior-real-number-overview",
    relatedTopicIds: ["senior-real-line-interval-notation"],
  }),
].forEach((topic) => {
  const action = upsertTopic(topic);
  summary[action] += 1;
});

const overviewIndex = topics.findIndex((t) => t.id === "senior-real-number-overview");
if (overviewIndex >= 0) {
  topics[overviewIndex] = {
    ...topics[overviewIndex],
    title: "單元 1 實數",
    chapterCode: "s1-1-1",
    formula: {
      type: "labeled-lines",
      lines: [
        { label: "章節代號", values: ["\\text{s1-1-1}"] },
        { label: "核心主軸", values: ["\\text{有理數、無理數、實數與數線、距離與分點}"] },
        { label: "學習目標", values: ["\\text{先判斷數的性質，再選公式，最後檢查結果合理性}"] },
      ],
    },
    usage: ["這一單元適合用「白話重點整理」先建立觀念，再進入題型練習。"],
    examples: ["解題順序建議：判斷類型 \\rightarrow 選公式 \\rightarrow 回代檢查。"],
    tips: ["看到新題目先問自己：這題要我判斷性質、比較大小，還是套距離分點公式？"],
    notes: ["本次內容已依「重點式白話」重寫，降低抽象敘述比例。"],
    mistakes: ["只背公式但不先判斷題型，通常會在第一步就選錯工具。"],
    modifiedAt: now,
    contentTypes: ["公式", "定義", "題型", "使用技巧", "注意事項", "常見錯誤"],
    contentTypesLocked: true,
    mathNotationLocked: true,
    tags: ["s1-1-1", "實數", "重點整理", "白話版"],
  };
  summary.updated += 1;
}

for (const t of topics) {
  const tags = Array.isArray(t.tags) ? t.tags : [];
  if (tags.includes("s1-1-1")) {
    t.chapterCode = "s1-1-1";
    t.modifiedAt = t.modifiedAt || now;
  }
}

db.topics = topics;
if (!db.meta || typeof db.meta !== "object") db.meta = {};
db.meta.count = topics.length;
db.meta.updatedAt = now;
db.meta.lastImportSource = "s1-1-1 白話重點整理（依圖片重寫）";

fs.writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary));
