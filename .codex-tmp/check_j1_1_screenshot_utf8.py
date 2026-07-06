from pathlib import Path


FILES = [
    Path("data/practice-generators/j1.js"),
    Path("data/practice-generator-bundles.js"),
    Path("data/formula-practice-assignments.js"),
    Path("data/practice-chapter-playlists.js"),
    Path("program-db/database/practice-db.json"),
    Path("sw.js"),
    Path(".codex-tmp/update_j1_1_screenshot_practice_db.py"),
    Path(".codex-tmp/verify_j1_1_screenshot_generators.js"),
]


def main():
    bad_marker = "?" * 2
    for path in FILES:
        text = path.read_text(encoding="utf-8")
        if bad_marker in text or "\ufffd" in text:
            raise SystemExit(f"bad text marker found: {path}")
    print("utf8 ok")


if __name__ == "__main__":
    main()
