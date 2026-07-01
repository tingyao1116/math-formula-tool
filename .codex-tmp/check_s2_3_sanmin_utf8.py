from pathlib import Path


FILES = [
    Path("data/practice-generators/s2.js"),
    Path("data/practice-generator-bundles.js"),
    Path("data/formula-practice-assignments.js"),
    Path("data/practice-chapter-playlists.js"),
    Path("program-db/database/practice-db.json"),
    Path("sw.js"),
    Path(".codex-tmp/update_s2_3_sanmin_practice_db.py"),
    Path(".codex-tmp/verify_s2_3_sanmin_generators.js"),
]


def main():
    for path in FILES:
        text = path.read_text(encoding="utf-8")
        if "??" in text or "\ufffd" in text:
            raise SystemExit(f"bad text marker found: {path}")
    print("utf8 ok")


if __name__ == "__main__":
    main()
