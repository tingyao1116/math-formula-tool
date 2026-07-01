from pathlib import Path


FILES = [
    Path("data/practice-generators/s4.js"),
    Path("data/practice-generator-bundles.js"),
    Path("data/formula-practice-assignments.js"),
    Path("data/practice-chapter-playlists.js"),
    Path("program-db/database/practice-db.json"),
    Path("sw.js"),
    Path(".codex-tmp/update_s4_3_sanmin_practice_db.py"),
    Path(".codex-tmp/verify_s4_3_sanmin_generators.js"),
]


def main():
    for path in FILES:
        text = path.read_text(encoding="utf-8")
        if "?" * 2 in text or "\ufffd" in text:
            raise SystemExit(f"bad text marker found: {path}")
    print("utf8 ok")


if __name__ == "__main__":
    main()
