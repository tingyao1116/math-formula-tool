from pathlib import Path
path = Path('practice-bank.js')
lines = path.read_text(encoding='utf-8').splitlines()
lines[1231] = '    const itemTitle = String(item?.title || config?.title || item?.id || "未命名題型").trim();'
lines[1232] = '    const fullTitle = titlePrefix ? `${titlePrefix}｜${itemTitle}` : itemTitle;'
path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('fixed title lines')
