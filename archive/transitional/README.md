# Transitional Inventory

This folder tracks files that look transitional, temporary, or superseded by the current page-folder layout.

Page layout changes completed in this pass:

- root-level `*.html` files are the real page entry points again
- same-name folders now hold page-specific assets such as dedicated JavaScript files
- folder-level `index.html` files were demoted to placeholder notes because delete operations were denied in this workspace session

Transitional or cleanup-candidate files still sitting at the repo root:

- `formula-detail.js`
- `chapter-detail.js`
- `manage.js`
- `question-bank.js`
- `practice-bank.js`
- `practice-mobile.js`
- `ability-practice.js`
- `ability-indicator-practice.js`
- `skill-tree-practice.js`
- `chapter-highlights.js`
- `quest-practice.js`
- `_tmp_fix_j5_distribution.py`
- `_tmp_fix_j623_j633_bindings.py`
- `_tmp_move_j623_probability_to_j633.py`
- `_tmp_update_e521_practice_db.js`
- `_tmp_update_e522_practice_db.js`
- `_tmp_update_e523_practice_db.js`
- `_tmp_update_e524_practice_db.js`
- `_tmp_update_e525_practice_db.js`
- `_tmp_update_e526_practice_db.js`
- `_tmp_update_e527_practice_db.js`
- `_tmp_update_j511_practice.py`
- `_tmp_update_j512_practice.py`
- `_tmp_update_j513_practice.py`
- `_tmp_update_j514_practice.py`
- `_tmp_update_j521_practice.py`
- `_tmp_update_j522_practice.py`
- `_tmp_update_j523_practice.py`
- `_tmp_update_j531_practice.py`
- `_tmp_update_j532_practice.py`
- `_tmp_update_j533_practice.py`
- `_tmp_update_j611_practice.py`
- `_tmp_update_j612_practice.py`
- `_tmp_update_j613_practice.py`
- `_tmp_update_j621_practice.py`
- `_tmp_update_j622_practice.py`
- `_tmp_update_j623_practice.py`
- `_tmp_update_j623_probability_practice.py`
- `_tmp_update_j631_practice.py`
- `_tmp_update_j632_practice.py`
- `.tmp_fix_practice_bank.py`
- `.tmp_fix_titles.py`
- `elementary-infinite-practice-handoff.md`
- `infinite-practice-handoff-2026-06-03.md`
- `infinite-practice-small-category-maintenance.md`
- `tmp-edge-test/`

Why they were not moved automatically:

- The current workspace allowed file copies and in-place rewrites, but rename/delete style operations against these existing files returned `Access is denied`.
- Because of that, this pass prioritized a safe page-structure cleanup first and recorded the remaining transitional inventory here for a later manual or unlocked cleanup pass.
