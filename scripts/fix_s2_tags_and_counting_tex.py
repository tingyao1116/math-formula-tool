import json
from pathlib import Path


DB_PATH = Path("program-db/database/question-db.json")


def infer_marker(row: dict) -> str:
    category = row.get("question_category", "")
    if category == "基本":
        return "範例"
    if category == "重要":
        return "隨堂練習"
    if category == "綜合":
        return "綜合"
    return "題目"


def restore_tags(rows: list[dict], chapter_code: str) -> None:
    for row in rows:
        if row.get("chapter_code") != chapter_code:
            continue
        section = row.get("source_section") or "未分類"
        row["tags"] = [
            chapter_code,
            f"section:{section}",
            f"marker:{infer_marker(row)}",
        ]


def apply_record_updates(by_id: dict[str, dict]) -> None:
    by_id["q-s2-2-1-0074"].update(
        {
            "title": "隨堂練習：計數原理｜20根火柴棒圍三角形",
            "question_text": "每次用$20$根相同火柴棒圍成一個三角形，共可圍成______個不全等的三角形。",
            "answer_text": "$8$個",
            "explanation_text": "【解析】設三角形的三邊長為$x,y,z$，且$x\\ge y\\ge z$，$x,y,z\\in\\mathbb{N}$，則\n"
            "$$\\left\\{\\begin{array}{l}\n"
            "x+y+z=20\\\\\n"
            "y+z>x\\\\\n"
            "x\\ge y\\ge z\n"
            "\\end{array}\\right.$$"
            "\n[圖:program-db/assets/question-media/s2-2-1/image71.png]\n"
            "由①得 $20=x+y+z>x+x=2x$，故 $x<10$。\n"
            "由①③得 $20=x+y+z\\le x+x+x=3x$，故 $\\dfrac{20}{3}\\le x$。\n"
            "又$x\\in\\mathbb{N}$，所以 $7\\le x<10$，即 $x=7,8,9$。\n"
            "當$x=7$時，$y+z=13$，得 $(y,z)=(7,6)$；\n"
            "當$x=8$時，$y+z=12$，得 $(y,z)=(8,4),(7,5),(6,6)$；\n"
            "當$x=9$時，$y+z=11$，得 $(y,z)=(9,2),(8,3),(7,4),(6,5)$。\n"
            "∴ 不全等的三角形共有 $1+3+4=8$ 種。",
        }
    )
    by_id["q-s2-2-2-0002"].update(
        {
            "title": "範例2：加法原理與乘法原理｜20根火柴棒圍三角形",
            "question_text": "每次用$20$根相同火柴棒圍成一個三角形，共可圍成______個不全等的三角形。",
            "answer_text": "$8$個",
            "explanation_text": "【解析】設三角形的三邊長為$x,y,z$，且$x\\ge y\\ge z$，$x,y,z\\in\\mathbb{N}$，則\n"
            "$$\\left\\{\\begin{array}{l}\n"
            "x+y+z=20\\\\\n"
            "y+z>x\\\\\n"
            "x\\ge y\\ge z\n"
            "\\end{array}\\right.$$"
            "\n[圖:program-db/assets/question-media/s2-2-2/image2.png]\n"
            "由①得 $20=x+y+z>x+x=2x$，故 $x<10$。\n"
            "由①③得 $20=x+y+z\\le x+x+x=3x$，故 $\\dfrac{20}{3}\\le x$。\n"
            "又$x\\in\\mathbb{N}$，所以 $7\\le x<10$，即 $x=7,8,9$。\n"
            "當$x=7$時，$y+z=13$，得 $(y,z)=(7,6)$；\n"
            "當$x=8$時，$y+z=12$，得 $(y,z)=(8,4),(7,5),(6,6)$；\n"
            "當$x=9$時，$y+z=11$，得 $(y,z)=(9,2),(8,3),(7,4),(6,5)$。\n"
            "∴ 不全等的三角形共有 $1+3+4=8$ 種。",
        }
    )
    by_id["q-s2-2-2-0009"].update(
        {
            "question_text": "設$\\{a_1,a_2,a_3,a_4\\}=\\{1,2,3,4\\}$，則滿足$(1-a_1)(2-a_2)(3-a_3)(4-a_4)\\ne 0$的情形有______種。",
            "explanation_text": "【解析】如下樹狀圖：\n[圖:program-db/assets/question-media/s2-2-2/image6.png]\n共有 $9$ 種。",
        }
    )
    by_id["q-s2-2-2-0023"].update(
        {
            "title": "範例1：排列｜排列條件求整數解",
            "question_text": "已知$n$為正整數，且$P_3^{n+1}=10P_2^{n-1}$，求$n=\\underline{\\qquad}$。",
            "answer_text": "$n=4$或$5$",
            "explanation_text": "【解析】$P_3^{n+1}=10P_2^{n-1}$\n"
            "$$\\Rightarrow (n+1)n(n-1)=10(n-1)(n-2).$$\n"
            "因 $n-1\\ge 2$，可約去 $n-1$，得\n"
            "$$ (n+1)n=10(n-2). $$\n"
            "移項得\n"
            "$$ n^2-9n+20=0\\Rightarrow (n-5)(n-4)=0. $$\n"
            "故 $n=4$ 或 $5$。",
        }
    )
    by_id["q-s2-2-2-0050"].update(
        {
            "title": "範例9：排列｜12階樓梯走法",
            "question_text": "樓梯有$12$階，一人上樓，一步一階或一步二階，走法有______種。",
            "answer_text": "$233$種",
            "explanation_text": "【解析】設一步一階有$x$次，一步二階有$y$次，則 $x+2y=12$，其中$x,y$為非負整數。\n"
            "故有下列情形：\n"
            "$(1)$ $x=0,y=6$；$(2)$ $x=2,y=5$；$(3)$ $x=4,y=4$；$(4)$ $x=6,y=3$；\n"
            "$(5)$ $x=8,y=2$；$(6)$ $x=10,y=1$；$(7)$ $x=12,y=0$。\n"
            "因此走法共有\n"
            "$$\\frac{6!}{0!6!}+\\frac{7!}{2!5!}+\\frac{8!}{4!4!}+\\frac{9!}{6!3!}+\\frac{10!}{8!2!}+\\frac{11!}{10!1!}+\\frac{12!}{12!0!}=233$$\n"
            "種。",
        }
    )


def main() -> None:
    data = json.loads(DB_PATH.read_text(encoding="utf-8"))
    rows = data["questions"]
    restore_tags(rows, "s2-1-1")
    restore_tags(rows, "s2-1-2")
    by_id = {row["id"]: row for row in rows}
    apply_record_updates(by_id)
    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
