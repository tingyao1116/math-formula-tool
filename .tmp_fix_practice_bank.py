from pathlib import Path
path = Path('practice-bank.js')
text = path.read_text(encoding='utf-8')
start = text.index('  function buildExpandedCompositeSectionsForItemV2(item, titlePrefix = "") {')
end = text.index('\n\n  function buildCompactCompositePracticeResultV2(items) {', start)
new_func = '''  function buildExpandedCompositeSectionsForItemV2(item, titlePrefix = "") {
    const config = practiceStore.getConfig?.(item?.id) || null;
    if (!config) return [];

    const itemTitle = String(item?.title || config?.title || item?.id || "未命名題型").trim();
    const fullTitle = titlePrefix ? `${titlePrefix}｜${itemTitle}` : itemTitle;

    if (config.type === "fixed-example") {
      const prompt = String(config.prompt || "").trim();
      const answer = String(config.answer || "").trim();
      if (!prompt && !answer) return [];
      return [{
        title: fullTitle,
        variants: [{ question: prompt, summaryAnswer: answer, answer }],
      }];
    }

    if (typeof config.generate !== "function") return [];

    const variants = collectPracticeVariationsV2(config, item, TOP_COMPOSITE_QUESTIONS_PER_SUBTYPE)
      .slice(0, TOP_COMPOSITE_QUESTIONS_PER_SUBTYPE);
    return variants.length ? [{ title: fullTitle, variants }] : [];
  }'''
text = text[:start] + new_func + text[end:]
first = text.index('  function buildExpandedCompositePracticeResultV2(items) {')
second = text.index('  function buildExpandedCompositePracticeResultV2(items) {', first + 1)
second_end = text.index('\n\n  function buildCompositeSessionKeyV2(position) {', second)
text = text[:first] + text[second:second_end] + text[second_end:]
path.write_text(text, encoding='utf-8')
print('updated practice-bank.js')
