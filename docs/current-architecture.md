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
- Stores practice assignments and overrides.
- Connected by topic `id`.
- This layer answers: "Should this topic show practice, and which generator should it use?"

4. `data/formula-practice.js`
- Stores practice generator configs only.
- Usually keyed by generator id or legacy topic id.
- This layer answers: "How should this practice generate drills?"

5. `formula-data.js`
- Stores curriculum order, chapter codes, parent-child wiring, display labels, and merge logic.
- This layer answers: "Where does this topic belong and how is it connected?"

## Render Flow

The pages work in this order:

1. Load topic content from `data/formula-content.js`
2. Use `formula-data.js` to add curriculum metadata, sorting, labels, and parent relationships
3. Render cards in `formula-core.js`
4. If the same `id` exists in `data/formula-calculators.js`, show calculator UI
5. Resolve practice assignment from `data/formula-practice-assignments.js`
6. If that assignment points to a generator in `data/formula-practice.js`, or if a legacy config exists by the same topic id, show practice UI

## Common Confusion Points

### Only content was added

If only `data/formula-content.js` changes, the topic may still be missing:

- correct parent branch
- correct display label
- correct curriculum placement

So new topics usually also require `formula-data.js` changes.

### "Infinite practice" was listed but does not render

Practice does not render just because `contentTypes` contains `Infinite practice`.

It renders only when one of these is true:

- `program-db/database/practice-db.json` enables a practice assignment for the topic
- `data/formula-practice.js` still contains a legacy config with the same topic `id`

### Calculator or drill logic was put into content data

That should be avoided.

Topic content should stay readable.
Interactive behavior should stay in the calculator or practice stores.

## Edit Rules

- Edit topic content in `data/formula-content.js`
- Edit curriculum or parent wiring in `formula-data.js`
- Edit calculators in `data/formula-calculators.js`
- Edit practice assignments in `program-db/database/practice-db.json`
- Edit drill generators in `data/formula-practice.js`
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
