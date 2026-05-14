from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "chapter-detail.js"


def replace_once(text: str, old: str, new: str) -> str:
    if old not in text:
        raise ValueError(f"pattern not found: {old[:80]!r}")
    return text.replace(old, new, 1)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")

    if 'overviewVariantId' not in text:
        text = replace_once(
            text,
            'const closingByCode = closingStore.byCode || buildOverviewByCode(closingStore.groups || {});\n',
            'const closingByCode = closingStore.byCode || buildOverviewByCode(closingStore.groups || {});\n'
            'const state = {\n'
            '  overviewVariantId: "",\n'
            '};\n',
        )

    if 'function pickOverviewSections(' not in text:
        text = replace_once(
            text,
            'function renderOverviewBlock(entry, fallbackText) {\n',
            'function pickOverviewSections(variants, activeVariant, predicate) {\n'
            '  const activeSections = Array.isArray(activeVariant?.sections) ? activeVariant.sections.filter(predicate) : [];\n'
            '  if (activeSections.length) return activeSections;\n'
            '  for (const variant of Array.isArray(variants) ? variants : []) {\n'
            '    const sections = Array.isArray(variant?.sections) ? variant.sections.filter(predicate) : [];\n'
            '    if (sections.length) return sections;\n'
            '  }\n'
            '  return [];\n'
            '}\n\n'
            'function renderOverviewBlock(entry, fallbackText) {\n',
        )

    old_variant_block = (
        '  const variants = Array.isArray(entry?.variants) ? entry.variants : [];\n'
        '  const sections = Array.isArray(variants[0]?.sections) ? variants[0].sections : [];\n'
        '  const keySections = sections.filter((section) => section?.type === "paragraph");\n'
        '  const outlineSections = sections.filter((section) => section?.type && section.type !== "paragraph");\n'
    )
    new_variant_block = (
        '  const variants = Array.isArray(entry?.variants) ? entry.variants : [];\n'
        '  const chosenVariantId = state.overviewVariantId || variants[0]?.id || "";\n'
        '  const activeVariant = variants.find((variant) => variant.id === chosenVariantId) || variants[0] || { sections: [] };\n'
        '  const keySections = pickOverviewSections(variants, activeVariant, (section) => section?.type === "paragraph");\n'
        '  const outlineSections = pickOverviewSections(variants, activeVariant, (section) => section?.type && section.type !== "paragraph");\n'
    )
    if old_variant_block in text:
        text = text.replace(old_variant_block, new_variant_block, 1)

    if 'data-overview-variant=' not in text:
        text = replace_once(
            text,
            '        </div>\n'
            '      </div>\n'
            '      <div class="chapter-overview__body">\n',
            '        </div>\n'
            '        ${variants.length\n'
            '          ? `<div class="chapter-overview__variant-tabs">\n'
            '              ${variants.map((variant) => `<button type="button" class="ghost-button ${variant.id === activeVariant.id ? "is-active" : ""}" data-overview-variant="${escapeHtml(variant.id)}">${escapeHtml(variant.label)}</button>`).join("")}\n'
            '            </div>`\n'
            '          : ""}\n'
            '      </div>\n'
            '      <div class="chapter-overview__body">\n',
        )

    if 'function bindOverviewTabs()' not in text:
        text = replace_once(
            text,
            'function init() {\n'
            '  bindCopyLink();\n',
            'function bindOverviewTabs() {\n'
            '  elements.container?.addEventListener("click", (event) => {\n'
            '    const button = event.target.closest("[data-overview-variant]");\n'
            '    if (!button) return;\n'
            '    const variantId = String(button.dataset.overviewVariant || "").trim();\n'
            '    if (!variantId || variantId === state.overviewVariantId) return;\n'
            '    state.overviewVariantId = variantId;\n'
            '    init();\n'
            '  });\n'
            '}\n\n'
            'function init() {\n'
            '  if (!init._bound) {\n'
            '    bindCopyLink();\n'
            '    bindOverviewTabs();\n'
            '    init._bound = true;\n'
            '  }\n',
        )

    TARGET.write_text(text, encoding="utf-8")
    print("Patched chapter-detail.js overview variant tabs.")


if __name__ == "__main__":
    main()
