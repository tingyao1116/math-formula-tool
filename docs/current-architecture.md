# Current Architecture

This document describes the runtime data boundaries of the project so future fixes do not mix content, calculators, practice generators, and display wiring together.

## Data Layers

1. `data/formula-content.js`
- Stores topic content only.
- Examples: title, formula, usage, examples, tips, notes, mistakes.
- This layer answers: "What is this topic?"

2. `data/formula-calculators.js`
- Stores calculator configs only.
- Connected by topic `id`.
- This layer answers: "How should this topic calculate?"

3. `program-db/database/practice-db.json`
- Stores practice assignments and overrides. This is the source of truth a human edits (directly or via the Python GUI).
- Connected by topic `id`.
- This layer answers: "Should this topic show practice, and which generator should it use?"

4. `data/formula-practice-assignments.js`
- Auto-generated bridge file. Do not hand-edit it.
- Generated from `program-db/database/practice-db.json` by `python .\program-db\scripts\sync_practice_bridge.py`.
- Defines `window.formulaPracticeAssignmentStore` and `window.practiceLibraryStore`, keyed by topic `id`.
- This layer answers: "What does the front end actually see for this topic's practice assignment?"

5. `data/formula-practice.js`
- Controller / wrapper layer, not a plain data store.
- Defines `window.formulaPracticeStore`, which merges an assignment/practice record (from layer 4) with a registered generator config (from layer 6) and returns the final config a page can render.
- It still holds a small pool of legacy configs (`configs`) and shared runtime helpers (question-count handling, shuffling, summary-answer derivation), but it does not contain the actual drill-generating logic for most topics anymore.
- Kept as-is intentionally: renaming or removing it breaks the generation pipeline, because every generator bundle calls into `window.formulaPracticeStore`.

6. `data/practice-generators/*.js` (e.g. `e4.js`, `e5.js`, `e6.js`, `j1.js`–`j6.js`, `s1.js`–`s5.js`)
- Stores the actual practice generator functions and configs, split by chapter/stage prefix.
- Each file is a self-contained script that calls `window.formulaPracticeStore.registerConfigs(...)` (directly, or via `data/practice-generators/shared-legacy-bundle.js` + `data/practice-generator-bootstrap.js` for the legacy-staged chapters) to register its `generate()` functions.
- Loaded on demand by `data/practice-generator-loader.js`, using the manifest in `data/practice-generator-bundles.js` (which maps a `chapterPrefixes` list to a bundle's script `src` and `deps`).
- This layer answers: "How should this practice generate drills?"
- `data/formula-practice.js` still cannot be deleted or renamed even though generators live here now: it is the shared registration target and merge layer every generator bundle depends on.

7. `formula-data.js`
- Stores curriculum order, chapter codes, parent-child wiring, display labels, and merge logic.
- This layer answers: "Where does this topic belong and how is it connected?"

## Render Flow

The pages work in this order:

1. Load topic content from `data/formula-content.js`
2. Use `formula-data.js` to add curriculum metadata, sorting, labels, and parent relationships
3. Render cards in `formula-core.js`
4. If the same `id` exists in `data/formula-calculators.js`, show calculator UI
5. Resolve practice assignment from `data/formula-practice-assignments.js` (`formulaPracticeAssignmentStore` / `practiceLibraryStore`)
6. `data/practice-generator-loader.js` loads the matching bundle from `data/practice-generator-bundles.js` (by chapter code prefix) so the real generator in `data/practice-generators/*.js` registers itself into `window.formulaPracticeStore`
7. `window.formulaPracticeStore.getConfig(id)` (in `data/formula-practice.js`) merges the assignment with the registered generator config; if a config comes back, show practice UI

## Common Confusion Points

### Only content was added

If only `data/formula-content.js` changes, the topic may still be missing:

- correct parent branch
- correct display label
- correct curriculum placement

So new topics usually also require `formula-data.js` changes.

### "Infinite practice" was listed but does not render

Practice does not render just because `contentTypes` contains `Infinite practice`.

It renders only when all of these are true:

- `program-db/database/practice-db.json` has an enabled practice assignment for the topic (reflected into `data/formula-practice-assignments.js` after a bridge sync)
- The matching bundle in `data/practice-generator-bundles.js` actually loads and registers a generator for that `generatorKey`/topic `id` — either from `data/practice-generators/*.js`, or from a legacy config still sitting in `data/formula-practice.js`'s `configs` pool
- `window.formulaPracticeStore.getConfig(id)` in `data/formula-practice.js` can successfully merge the two into a config

If the bridge was not re-synced after editing `practice-db.json`, or the chapter's generator bundle never loaded (wrong `chapterPrefixes`, script error, etc.), practice will silently not render even though the topic data looks correct.

### Calculator or drill logic was put into content data

That should be avoided.

Topic content should stay readable.
Interactive behavior should stay in the calculator or practice stores.

## Edit Rules

- Edit topic content in `data/formula-content.js`
- Edit curriculum or parent wiring in `formula-data.js`
- Edit calculators in `data/formula-calculators.js`
- Edit practice assignments in `program-db/database/practice-db.json`
- Edit drill generators in `data/practice-generators/*.js` (pick the file matching the chapter prefix, e.g. `j3.js` for `j3-...` topics)
- Do not edit `data/formula-practice-assignments.js` by hand — it is overwritten by the sync script
- Do not rename or remove `data/formula-practice.js` — it is the controller/wrapper every generator bundle registers into, not legacy dead weight
- Regenerate the practice bridge with `python .\program-db\scripts\sync_practice_bridge.py`

## Single Source Workflow

To avoid "fix one place, break another place":

1. Use `data/formula-content.js` as the content source.
2. Use `formula-data.js` only for chapter mapping, parent wiring, and display ordering.
3. Never write the same structural decision in multiple ad-hoc exports.
4. After every structural edit, run:

```powershell
node .\scripts\build-data-health-report.mjs
```

Then check:

- `exports/data-health-check.html`
- `exports/data-health-check.json`

If these checks are not clean, do not continue adding new data.

## Question DB Normalization

`program-db/database/question-db.json` is still the formal question database, but it is fed by multiple import paths and old edits.

The main risk is usually not "Python cannot parse the file". The real risks are:

- structural drift between records
- historical empty fields or duplicated values
- different tools handling BOM, escaping, or line endings differently
- fragile downstream sync when exporting to bridge files or SQLite later

Use this workflow before large edits or migrations:

```powershell
python .\program-db\scripts\normalize_question_db.py --dry-run
python .\program-db\scripts\normalize_question_db.py
```

The write mode now creates a backup automatically before saving normalized output.

## About `formulas.js`

- It is a legacy compatibility entry point.
- It currently only contains `window.baseFormulas = []`.
- New built-in content should not be added there.
