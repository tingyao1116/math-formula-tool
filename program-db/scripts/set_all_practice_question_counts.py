import argparse

from practice_db_utils import DB_PATH, load_practice_payload, now_iso, save_json
from sync_practice_bridge import sync_practice_assignment_js_from_db


def set_all_question_counts(count: int, practice_db_path=DB_PATH) -> tuple[int, int]:
    payload = load_practice_payload(practice_db_path)
    assignments = payload.get("assignments", [])
    practices = payload.get("practices", [])

    for row in assignments:
        if isinstance(row, dict):
            row["questionCount"] = count

    for row in practices:
        if isinstance(row, dict):
            row["questionCount"] = count

    meta = payload.get("meta", {})
    if isinstance(meta, dict):
        meta["updatedAt"] = now_iso()
        payload["meta"] = meta

    save_json(practice_db_path, payload)
    synced = sync_practice_assignment_js_from_db(practice_db_path)
    return len(practices), synced


def main():
    parser = argparse.ArgumentParser(description="Set all practice questionCount values to one number.")
    parser.add_argument("--count", type=int, default=5, help="Question count to apply to all practices.")
    args = parser.parse_args()

    count = max(1, int(args.count or 5))
    practice_count, synced = set_all_question_counts(count)
    print(f"updated_practices={practice_count}")
    print(f"question_count={count}")
    print(f"synced_assignments={synced}")
    print(f"db_path={DB_PATH}")


if __name__ == "__main__":
    main()
