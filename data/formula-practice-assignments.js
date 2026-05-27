// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: program-db/database/practice-db.json
window.formulaPracticeAssignmentStore = {
  "meta": {
    "schema": "practice-db-v1",
    "count": 0,
    "assignmentCount": 0,
    "practiceCount": 242,
    "bindingCount": 213,
    "updatedAt": "2026-05-26T19:52:52.698477+00:00"
  },
  "byId": {},
  "catalog": {}
};
window.practiceLibraryStore = {
  "meta": {
    "schema": "practice-db-v1",
    "count": 0,
    "assignmentCount": 0,
    "practiceCount": 242,
    "bindingCount": 213,
    "updatedAt": "2026-05-26T19:52:52.698477+00:00"
  },
  "byId": {
    "practice-abs-both-sides-advanced-drill": {
      "id": "practice-abs-both-sides-advanced-drill",
      "enabled": true,
      "mode": "generator",
      "title": "進階補充：兩邊都有絕對值",
      "generatorKey": "abs-both-sides-advanced-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "兩邊絕對值",
        "補充",
        "無限練習"
      ],
      "usage": [
        "拆成 $ax+b=cx+d$ 與 $ax+b=-(cx+d)$ 兩式。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-abs-count-basic-drill": {
      "id": "practice-abs-count-basic-drill",
      "enabled": true,
      "mode": "generator",
      "title": "絕對值個數問題",
      "generatorKey": "abs-count-basic-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "絕對值個數",
        "整數個數",
        "正整數",
        "非負整數",
        "無限練習"
      ],
      "usage": [
        "計算滿足 $|x|=a$、$|x|<a$、$|x|\\le a$、$a<|x|<b$ 的整數、正整數或非負整數個數。",
        "先把絕對值條件翻成數線範圍，再依題目指定的整數種類去數。"
      ],
      "examples": [
        "$|x|=3$ 的整數解為 $-3,3$，共有 2 個；$|x|=0$ 只有 $x=0$。",
        "$|x|<4$ 的整數解為 $-3,-2,-1,0,1,2,3$，共有 7 個；正整數只有 $1,2,3$，共有 3 個。",
        "$|x|\\le4$ 的非負整數解為 $0,1,2,3,4$，共有 5 個。",
        "$2<|x|<6$ 可轉成 $-6<x<-2$ 或 $2<x<6$，整數解為 $-5,-4,-3,3,4,5$，共有 6 個。"
      ],
      "tips": [
        "$|x|$ 表示點 $x$ 到 0 的距離，所以右邊的數若是負數通常無解。",
        "遇到 $<$ 與 $\\le$ 時，先在數線上標端點開閉，再開始數。",
        "題目問正整數時不要數 0；題目問非負整數時要把 0 算進去。"
      ],
      "notes": [
        "這一主題先整理判斷流程；反推參數或更複雜的二邊端點開閉可放在下層分支練習。",
        "若題目要求整數解，$|x|=a$ 還要注意 $a$ 是否為整數；例如 $|x|=2.5$ 沒有整數解。"
      ],
      "mistakes": [
        "只算正半邊，漏掉負半邊。",
        "把 $|x|<a$ 在 $a=0$ 時誤算成有 $x=0$。",
        "把正整數和非負整數混在一起，導致 0 多算或少算。"
      ]
    },
    "practice-abs-count-reverse-drill": {
      "id": "practice-abs-count-reverse-drill",
      "enabled": true,
      "mode": "generator",
      "title": "絕對值個數問題反向",
      "generatorKey": "abs-count-reverse-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "絕對值",
        "反推",
        "個數",
        "無限練習"
      ],
      "usage": [
        "由滿足條件的個數，反推 a。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": [
        "把 $<a$ 與 $≤a$ 的個數公式混用。"
      ]
    },
    "practice-abs-count-two-sided-drill": {
      "id": "practice-abs-count-two-sided-drill",
      "enabled": true,
      "mode": "generator",
      "title": "絕對值個數問題二邊範圍",
      "generatorKey": "abs-count-two-sided-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "絕對值",
        "區間",
        "個數",
        "無限練習"
      ],
      "usage": [
        "同時有下界與上界時，分成左右兩段再計數。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": [
        "端點開閉判斷錯，造成多算或少算。"
      ]
    },
    "practice-abs-equation-leading-not-one-drill": {
      "id": "practice-abs-equation-leading-not-one-drill",
      "enabled": true,
      "mode": "generator",
      "title": "絕對值方程式（最高次係數≠1）",
      "generatorKey": "abs-equation-leading-not-one-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "絕對值方程",
        "係數",
        "補充"
      ],
      "usage": [
        "先拆成兩條一次式，再分別解。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-abs-equation-leading-one-drill": {
      "id": "practice-abs-equation-leading-one-drill",
      "enabled": true,
      "mode": "generator",
      "title": "絕對值方程式（最高次係數=1）",
      "generatorKey": "abs-equation-leading-one-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "絕對值方程",
        "補充",
        "無限練習"
      ],
      "usage": [
        "先拆成 $x+a=b$ 或 $x+a=-b$。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-abs-four-terms-calc-drill": {
      "id": "practice-abs-four-terms-calc-drill",
      "enabled": true,
      "mode": "generator",
      "title": "四數含絕對值計算",
      "generatorKey": "abs-four-terms-calc-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "絕對值",
        "四數",
        "無限練習"
      ],
      "usage": [
        "四個數混合加減，且至少含兩個絕對值。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": [
        "去絕對值後忘記帶符號。"
      ]
    },
    "practice-abs-remove-and-calc-drill": {
      "id": "practice-abs-remove-and-calc-drill",
      "enabled": true,
      "mode": "generator",
      "title": "去絕對值計算",
      "generatorKey": "abs-remove-and-calc-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "去絕對值",
        "計算",
        "無限練習"
      ],
      "usage": [
        "先把絕對值拆掉，再做整體加減。"
      ],
      "examples": [],
      "tips": [
        "每個絕對值先獨立判正負。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-abs-two-group-calc-drill": {
      "id": "practice-abs-two-group-calc-drill",
      "enabled": true,
      "mode": "generator",
      "title": "二組絕對值計算",
      "generatorKey": "abs-two-group-calc-drill",
      "difficulty": "easy",
      "questionCount": 3,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "絕對值",
        "二組",
        "無限練習"
      ],
      "usage": [
        "兩組絕對值相加減，先組內計算再去絕對值。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": [
        "先去絕對值再算括號，順序顛倒。"
      ]
    },
    "practice-coordinate-origin-unit-change": {
      "id": "practice-coordinate-origin-unit-change",
      "enabled": true,
      "mode": "generator",
      "title": "改變原點與單位長時坐標變化",
      "generatorKey": "coordinate-origin-unit-change",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "座標變換",
        "新原點",
        "單位長",
        "無限練習"
      ],
      "usage": [
        "同時改原點與單位長時，快速換算新坐標。"
      ],
      "examples": [],
      "tips": [
        "先平移（減新原點），再縮放（除新單位倍數）。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-cubic-divide-linear": {
      "id": "practice-cubic-divide-linear",
      "enabled": true,
      "mode": "generator",
      "title": "三次多項式（四項）÷ 一次多項式",
      "generatorKey": "cubic-divide-linear",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "三次",
        "一次",
        "長除法"
      ],
      "usage": [
        "多項式長除法第一層主練習：三次多項式（四項）÷ 一次多項式。"
      ],
      "examples": [],
      "tips": [
        "每一步都先看最高次項。"
      ],
      "notes": [
        "餘式次數要小於 1。"
      ],
      "mistakes": []
    },
    "practice-cubic-divide-quadratic": {
      "id": "practice-cubic-divide-quadratic",
      "enabled": true,
      "mode": "generator",
      "title": "三次多項式（四項）÷ 二次多項式",
      "generatorKey": "cubic-divide-quadratic",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "三次",
        "二次",
        "長除法"
      ],
      "usage": [
        "多項式長除法第二層主練習：三次多項式（四項）÷ 二次多項式。"
      ],
      "examples": [],
      "tips": [
        "先按降冪排列，缺項補 0 再做。"
      ],
      "notes": [
        "最後一定檢查：被除式=除式×商式+餘式。"
      ],
      "mistakes": []
    },
    "practice-difference-square-variable-drill": {
      "id": "practice-difference-square-variable-drill",
      "enabled": true,
      "mode": "generator",
      "title": "差平方未知數版",
      "generatorKey": "difference-square-variable-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "差平方",
        "未知數版",
        "無限練習"
      ],
      "usage": [
        "專練未知數型差平方。"
      ],
      "examples": [
        "例：$(3x-2)^2=9x^2-12x+4$。"
      ],
      "tips": [
        "一次 5 題，最後一項仍然是正的。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-distance-formula": {
      "id": "practice-distance-formula",
      "enabled": true,
      "mode": "generator",
      "title": "簡易二點距離",
      "generatorKey": "distance-formula",
      "difficulty": "easy",
      "questionCount": 10,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "距離",
        "絕對值",
        "數線"
      ],
      "usage": [
        "求數線上兩點距離時使用。"
      ],
      "examples": [
        "例：3 和 -5 的距離是 $|3-(-5)|=8$。"
      ],
      "tips": [
        "距離一定是非負數，所以最後要用絕對值。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-factor-application-circular-track-drill": {
      "id": "practice-factor-application-circular-track-drill",
      "enabled": true,
      "mode": "generator",
      "title": "環狀跑道同點重合",
      "generatorKey": "factor-application-circular-track-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "最小公倍數",
        "環狀跑道",
        "應用"
      ],
      "usage": [
        "三人同向繞跑道，求同時回到起點的最短時間。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-factor-application-mixed-grouping-drill": {
      "id": "practice-factor-application-mixed-grouping-drill",
      "enabled": true,
      "mode": "generator",
      "title": "男女混合分組",
      "generatorKey": "factor-application-mixed-grouping-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "最大公因數",
        "混合分組",
        "應用"
      ],
      "usage": [
        "男女混合分組，求最多組數與每組男女人數。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-factor-application-separate-grouping-drill": {
      "id": "practice-factor-application-separate-grouping-drill",
      "enabled": true,
      "mode": "generator",
      "title": "男女分別分組",
      "generatorKey": "factor-application-separate-grouping-drill",
      "difficulty": "easy",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "最大公因數",
        "分組",
        "應用"
      ],
      "usage": [
        "男生女生分開分組且每組人數相同，求最少組數與每組人數。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-factor-rectangle-equal-square-drill": {
      "id": "practice-factor-rectangle-equal-square-drill",
      "enabled": true,
      "mode": "generator",
      "title": "長方形裁成相同正方形",
      "generatorKey": "factor-rectangle-equal-square-drill",
      "difficulty": "easy",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "最大公因數",
        "正方形切割",
        "應用"
      ],
      "usage": [
        "同大小正方形要最少塊，先取最大公因數做邊長。"
      ],
      "examples": [],
      "tips": [
        "先找長寬最大公因數 g，正方形邊長就是 g。",
        "塊數 = (長$/g)$×(寬$/g)$。"
      ],
      "notes": [
        "特別解題方法：『最少塊』等價於『每塊邊長盡量大』。",
        "解題思路：先定邊長，再反推塊數。"
      ],
      "mistakes": []
    },
    "practice-factor-rectangle-max-square-mixed-drill": {
      "id": "practice-factor-rectangle-max-square-mixed-drill",
      "enabled": true,
      "mode": "generator",
      "title": "長方形裁成數個最大正方形",
      "generatorKey": "factor-rectangle-max-square-mixed-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "輾轉相除法",
        "最大正方形",
        "應用"
      ],
      "usage": [
        "不要求同大小時，用輾轉相除法累加商數。"
      ],
      "examples": [],
      "tips": [
        "每一步用『大邊 ÷ 小邊』的商代表可切出的正方形數。",
        "把每步商數加總即為最少塊數。"
      ],
      "notes": [
        "特別概念：每次都切最大正方形，會導向輾轉相除法。",
        "解題思路：反覆切方塊直到餘數為 0。"
      ],
      "mistakes": []
    },
    "practice-factor-road-keep-position-drill": {
      "id": "practice-factor-road-keep-position-drill",
      "enabled": true,
      "mode": "generator",
      "title": "不需移動個數",
      "generatorKey": "factor-road-keep-position-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "最小公倍數",
        "不需移動",
        "應用"
      ],
      "usage": [
        "改間距後保留位置，核心是最小公倍數。"
      ],
      "examples": [],
      "tips": [
        "不動的位置間隔 = 舊間距與新間距的最小公倍數。",
        "先算單側保留點數，再判斷是否雙側乘 2。"
      ],
      "notes": [
        "特別概念：同時落在兩個等差點列上的點，週期是最小公倍數。",
        "解題思路：找共同間隔，再算在全長內有幾個點。"
      ],
      "mistakes": []
    },
    "practice-factor-road-planting-double-drill": {
      "id": "practice-factor-road-planting-double-drill",
      "enabled": true,
      "mode": "generator",
      "title": "道路種樹（兩側）",
      "generatorKey": "factor-road-planting-double-drill",
      "difficulty": "easy",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "種樹",
        "兩側",
        "應用"
      ],
      "usage": [
        "兩側題先求一側，再乘 2。"
      ],
      "examples": [],
      "tips": [
        "先把單側算正確，再乘 2，避免把 $+1/-1$ 重複套錯。"
      ],
      "notes": [
        "特別解題方法：把『兩側』視為最後一步倍率處理。",
        "解題思路：單側模型 → 兩側擴張。"
      ],
      "mistakes": []
    },
    "practice-factor-road-planting-single-drill": {
      "id": "practice-factor-road-planting-single-drill",
      "enabled": true,
      "mode": "generator",
      "title": "道路種樹（單側）",
      "generatorKey": "factor-road-planting-single-drill",
      "difficulty": "easy",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "種樹",
        "頭尾規則",
        "應用"
      ],
      "usage": [
        "依頭尾條件調整棵數：+1、-1、或不變。"
      ],
      "examples": [],
      "tips": [
        "先算間隔數 = 道路長 ÷ 間距，再依條件做 $+1 / -1 / 0$。"
      ],
      "notes": [
        "特別概念：環狀種樹沒有頭尾，所以不加不減。",
        "解題思路：先固定『每段』，最後再處理端點。"
      ],
      "mistakes": []
    },
    "practice-identity-value-diff-sqsum-to-product-drill": {
      "id": "practice-identity-value-diff-sqsum-to-product-drill",
      "enabled": true,
      "mode": "generator",
      "title": "由 a-b、a²+b² 求 ab",
      "generatorKey": "identity-value-diff-sqsum-to-product-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "求值",
        "a-b",
        "a²+b²",
        "ab",
        "無限練習"
      ],
      "usage": [
        "已知 $a-b$ 與 $a^2+b^2$，去求 ab。"
      ],
      "examples": [
        "例：$a-b=7$，$a^2+b^2=4$，求 ab。"
      ],
      "tips": [
        "先用 $(a-b)^2=a^2-2ab+b^2$。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-integer-basic-drill": {
      "id": "practice-identity-value-integer-basic-drill",
      "enabled": true,
      "mode": "generator",
      "title": "求值整數版",
      "generatorKey": "identity-value-integer-basic-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "求值",
        "整數",
        "無限練習"
      ],
      "usage": [
        "由整數 a、b 開始，互推 $a+b$、ab、$a^2+b^2$、$a-b$。"
      ],
      "examples": [
        "例：$a+b=-9$，$a^2+b^2=53$，求 ab、$a-b$。"
      ],
      "tips": [
        "一次 5 題，把資訊拼回公式。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-linear-combination-drill": {
      "id": "practice-identity-value-linear-combination-drill",
      "enabled": true,
      "mode": "generator",
      "title": "組合式求值",
      "generatorKey": "identity-value-linear-combination-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "求值",
        "組合式",
        "線性組合",
        "無限練習"
      ],
      "usage": [
        "已知 $a-b$、ab 或其他資訊，去求像 $3a^2+4ab+3b^2$ 這種組合式。"
      ],
      "examples": [
        "例：$a-b=7$，$ab=4$，求 $3a^2+4ab+3b^2$。"
      ],
      "tips": [
        "先想能不能重組成 $a^2+b^2$ 和 ab。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-mixed-advanced-drill": {
      "id": "practice-identity-value-mixed-advanced-drill",
      "enabled": true,
      "mode": "generator",
      "title": "求值進階混合版",
      "generatorKey": "identity-value-mixed-advanced-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "求值",
        "混合",
        "進階",
        "無限練習"
      ],
      "usage": [
        "把整數互推、$a+b$ 與 ab、倒數型、倒數反推型混在同一回合練習。"
      ],
      "examples": [
        "例：$a-b=7$，$a^2+b^2=4$，求 ab。",
        "例：$x^2+1/x^2=3$，求 $x+1/x$、$x-1/x$。"
      ],
      "tips": [
        "一次 5 題，不固定題型；先判斷是哪一種拼法再下手。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-product-sqsum-drill": {
      "id": "practice-identity-value-product-sqsum-drill",
      "enabled": true,
      "mode": "generator",
      "title": "由 ab、a²+b² 求 a+b、a-b",
      "generatorKey": "identity-value-product-sqsum-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "求值",
        "ab",
        "a²+b²",
        "a+b",
        "a-b",
        "無限練習"
      ],
      "usage": [
        "已知 $ab$ 與 $a^2+b^2$，反推出 $a+b$、$a-b$。"
      ],
      "examples": [
        "例：$ab=-35$，$a^2+b^2=74$，求 $a+b$、$a-b$。"
      ],
      "tips": [
        "通常會有正負兩個答案。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-reciprocal-drill": {
      "id": "practice-identity-value-reciprocal-drill",
      "enabled": true,
      "mode": "generator",
      "title": "倒數型求值",
      "generatorKey": "identity-value-reciprocal-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "倒數",
        "求值",
        "無限練習"
      ],
      "usage": [
        "已知 $x+1/x$ 或 $x-1/x$，去求平方和或其他組合。"
      ],
      "examples": [
        "例：$x+1/x=3$，求 $x^2+1/x^2$。"
      ],
      "tips": [
        "一次 5 題，先平方再整理。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-reciprocal-mixed-fraction-drill": {
      "id": "practice-identity-value-reciprocal-mixed-fraction-drill",
      "enabled": true,
      "mode": "generator",
      "title": "倒數混合分式型",
      "generatorKey": "identity-value-reciprocal-mixed-fraction-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "倒數",
        "分式",
        "求值",
        "無限練習"
      ],
      "usage": [
        "利用 $a+b$、ab、$a^2+b^2$ 去求 $1/a+1/b$、$a/b+b/a$ 這類分式。"
      ],
      "examples": [
        "例：求 $1/a+1/b$、求 $a/b+b/a$。"
      ],
      "tips": [
        "先把分式通成 $a+b$、ab、$a^2+b^2$。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-reciprocal-reverse-drill": {
      "id": "practice-identity-value-reciprocal-reverse-drill",
      "enabled": true,
      "mode": "generator",
      "title": "倒數反推型",
      "generatorKey": "identity-value-reciprocal-reverse-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "倒數反推",
        "求值",
        "無限練習"
      ],
      "usage": [
        "已知 $x^2+1/x^2$，反推出 $x+1/x$ 或 $x-1/x$。"
      ],
      "examples": [
        "例：$x^2+1/x^2=3$，求 $x+1/x$、$x-1/x$。"
      ],
      "tips": [
        "一次 5 題，注意最後常有正負兩值。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-square-pair-drill": {
      "id": "practice-identity-value-square-pair-drill",
      "enabled": true,
      "mode": "generator",
      "title": "由 (a+b)²、(a-b)² 求值",
      "generatorKey": "identity-value-square-pair-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "求值",
        "平方組",
        "ab",
        "a²+b²",
        "無限練習"
      ],
      "usage": [
        "已知 $(a+b)^2$ 與 $(a-b)^2$，去求 $a^2+b^2$、$ab$。"
      ],
      "examples": [
        "例：已知 $(a+b)^2=25$，$(a-b)^2=9$，求 $a^2+b^2$、$ab$。"
      ],
      "tips": [
        "一加一減最省力。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-sum-product-drill": {
      "id": "practice-identity-value-sum-product-drill",
      "enabled": true,
      "mode": "generator",
      "title": "由 a+b、ab 開始求值",
      "generatorKey": "identity-value-sum-product-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "求值",
        "a+b",
        "ab",
        "無限練習"
      ],
      "usage": [
        "已知 $a+b$、ab，去求 $a^2+b^2$、$(a-b)^2$ 或 $a-b$。"
      ],
      "examples": [
        "例：$a+b=-5$，$ab=-8$，求 $a^2+b^2$、$(a-b)^2$。"
      ],
      "tips": [
        "一次 5 題，先判斷缺哪一塊。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-pair-mixed-drill": {
      "id": "practice-identity-value-pair-mixed-drill",
      "enabled": true,
      "mode": "generator",
      "title": "求值公式綜合版（三選二）",
      "generatorKey": "identity-value-pair-mixed-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [
        "practice-identity-value-sum-sqsum-to-product-drill",
        "practice-identity-value-diff-sqsum-to-product-drill",
        "practice-identity-value-sum-product-drill",
        "practice-identity-value-product-sqsum-drill",
        "practice-identity-value-square-pair-drill"
      ],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與二次公式的應用",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "求值公式",
        "三選二",
        "a+b",
        "a-b",
        "a²+b²",
        "ab"
      ],
      "usage": [
        "把 $a+b$、$a-b$、$a^2+b^2$、$ab$ 看成四個核心量，已知其中兩個，反推出另外兩個。"
      ],
      "examples": [
        "已知 $a+b=-5$、$ab=-8$，求 $a^2+b^2$ 與 $a-b$。",
        "已知 $a^2+b^2=74$、$ab=-35$，求 $a+b$ 與 $a-b$。"
      ],
      "tips": [
        "常用公式有 $(a+b)^2=a^2+2ab+b^2$、$(a-b)^2=a^2-2ab+b^2$。",
        "若先算出平方值，再回推出 $a+b$ 或 $a-b$，要記得可能有正負兩種。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-pair-advanced-drill": {
      "id": "practice-identity-value-pair-advanced-drill",
      "enabled": true,
      "mode": "generator",
      "title": "求值公式進階版（三選二）",
      "generatorKey": "identity-value-pair-advanced-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與二次公式的應用",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "求值公式",
        "進階",
        "三選二",
        "平方量",
        "a+b",
        "a-b",
        "a²+b²",
        "ab"
      ],
      "usage": [
        "已知四個核心量中的兩個，但不直接回求 a、b，也不直接求 a+b 或 a-b，而是利用恆等式直接求平方量或乘積。"
      ],
      "examples": [
        "已知 $a+b=5$、$ab=11$，求 $a^2+b^2$ 與 $(a-b)^2$。",
        "已知 $a^2+b^2=26$、$ab=11$，求 $(a+b)^2$ 與 $(a-b)^2$。"
      ],
      "tips": [
        "若題目只問平方量，就直接用恆等式整理，不需要回頭求 a+b、a-b 的正負值。",
        "即使 a、b 可能不是整數，甚至需要根號或複數表示，也不影響公式求值。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-identity-value-sum-sqsum-to-product-drill": {
      "id": "practice-identity-value-sum-sqsum-to-product-drill",
      "enabled": true,
      "mode": "generator",
      "title": "由 a+b、a²+b² 求 ab",
      "generatorKey": "identity-value-sum-sqsum-to-product-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "求值",
        "a+b",
        "a^2+b^2",
        "ab",
        "無限練習"
      ],
      "usage": [
        "已知 a+b 與 a²+b²，去求 ab。"
      ],
      "examples": [
        "例：a+b=7，a²+b²=4，求 ab。"
      ],
      "tips": [
        "先把 (a+b)² 展開再移項。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-integer-add-subtract-four-terms-drill": {
      "id": "practice-integer-add-subtract-four-terms-drill",
      "enabled": true,
      "mode": "generator",
      "title": "四正負數加減",
      "generatorKey": "integer-add-subtract-four-terms-drill",
      "difficulty": "easy",
      "questionCount": 10,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "整數",
        "加減",
        "練習"
      ],
      "usage": [
        "用來熟悉正負數混合加減。"
      ],
      "examples": [],
      "tips": [
        "遇到減負數，先轉成加正數。",
        "可以先把正數和負數分組。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-j1-1-2-average-baseline-mixed": {
      "id": "practice-j1-1-2-average-baseline-mixed",
      "enabled": true,
      "mode": "generator",
      "title": "基準值平均與反求未知數",
      "generatorKey": "nearby-average-baseline-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "平均數",
        "基準值",
        "反求 x"
      ],
      "usage": [
        "五個整數都在 60、70、80、90 附近時，可先把平均數想成基準值，再看每個數和基準值差多少。"
      ],
      "examples": [],
      "tips": [
        "若五個數的平均是 70，就把 70 當作基準值；五個差的總和一定是 0。",
        "反求 x 時，先把已知四個數相對基準值的差加總，再補出讓總差為 0 的那一個差。"
      ],
      "notes": [
        "這組題刻意讓數值集中在整十附近，方便練基準值想法，不是要學生硬做五數相加再除以 5。"
      ],
      "mistakes": [
        "把『平均是 80』看成五個數都一定比 80 大。",
        "反求 x 時，只算四個已知數的和，卻忘了平均數代表的是五個數的總和。"
      ]
    },
    "practice-j1-1-3-exponent-law-mixed-rule-drill": {
      "id": "practice-j1-1-3-exponent-law-mixed-rule-drill",
      "enabled": true,
      "mode": "generator",
      "title": "指數律進階混合",
      "generatorKey": "j1-1-3-exponent-law-mixed-rule-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "指數律",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "指數律",
        "綜合",
        "同底數相乘",
        "同底數相除",
        "乘方的乘方"
      ],
      "usage": [
        "把三條基本規則放在同一題裡，包含先乘再乘方、兩邊同時做乘方的乘方、乘除混合等不同結構，練習整理順序。"
      ],
      "examples": [],
      "tips": [
        "先看哪一段要先做乘方的乘方，哪一段要先把同底數相乘整理。",
        "遇到括號時，先把括號內或括號外的規則分清楚，再統一整理指數。"
      ],
      "notes": [
        "這組題對應你要的「三種混合在同一題」版本。"
      ],
      "mistakes": [
        "看到很多次方就亂套規則，沒有先分清楚哪一段是乘方的乘方。",
        "把 $(a^m\\times a^n)^p$ 誤看成 $a^{m+n+p}$，忘記外面的次方要乘進去。"
      ]
    },
    "practice-j1-1-3-exponent-law-single-rule-drill": {
      "id": "practice-j1-1-3-exponent-law-single-rule-drill",
      "enabled": true,
      "mode": "generator",
      "title": "指數律單一法則",
      "generatorKey": "j1-1-3-exponent-law-single-rule-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "指數律",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "指數律",
        "同底數相乘",
        "同底數相除",
        "乘方的乘方"
      ],
      "usage": [
        "每一題只考一條規則，先練熟同底數乘除與乘方的乘方。"
      ],
      "examples": [],
      "tips": [
        "同底數相乘用加法，同底數相除用減法。",
        "乘方的乘方要把指數相乘。"
      ],
      "notes": [
        "這組題故意讓每題只用一條規則，先建立規則感。"
      ],
      "mistakes": [
        "把相乘和相除都寫成指數相加。",
        "把 $(a^m)^n$ 誤寫成 $a^{m+n}$。"
      ]
    },
    "practice-j1-1-3-exponent-mixed-operations-drill": {
      "id": "practice-j1-1-3-exponent-mixed-operations-drill",
      "enabled": true,
      "mode": "generator",
      "title": "零次方、負次方與綜合四則",
      "generatorKey": "j1-1-3-exponent-mixed-operations-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "指數律",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "指數律",
        "零次方",
        "負次方",
        "四則混合"
      ],
      "usage": [
        "練習零次方、負次方與正負號一起出現時的運算優先順序。"
      ],
      "examples": [],
      "tips": [
        "負次方先改成倒數，再決定要不要換成小數。",
        "零次方只要底數不是 0，結果就是 1。"
      ],
      "notes": [
        "這組題會同時考先乘方、再乘除、最後加減。"
      ],
      "mistakes": [
        "把 $a^{-n}$ 看成負數而不是倒數。",
        "把 $(-a)^0$ 和 $0^0$ 混為一談。"
      ]
    },
    "practice-j1-1-3-exponent-word-problem-drill": {
      "id": "practice-j1-1-3-exponent-word-problem-drill",
      "enabled": true,
      "mode": "generator",
      "title": "指數生活應用",
      "generatorKey": "j1-1-3-exponent-word-problem-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "指數律",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "指數律",
        "生活應用",
        "倍數成長"
      ],
      "usage": [
        "把「每隔固定時間變成幾倍」翻成底數與指數。"
      ],
      "examples": [],
      "tips": [
        "先看變化發生幾次，再寫成倍率的次方。"
      ],
      "notes": [
        "這組題先用倍增、倍三與分紙情境，讓學生把指數放回情境理解。"
      ],
      "mistakes": [
        "直接把總時間拿去當指數，忘記先除以每次變化的間隔。"
      ]
    },
    "practice-j1-1-3-sign-brackets-power-drill": {
      "id": "practice-j1-1-3-sign-brackets-power-drill",
      "enabled": true,
      "mode": "generator",
      "title": "正負號、括號與次方判別",
      "generatorKey": "j1-1-3-sign-brackets-power-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "指數律",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "指數律",
        "正負號",
        "括號",
        "奇偶次方"
      ],
      "usage": [
        "先分清楚負號有沒有包含在底數裡，再判斷奇次方或偶次方。"
      ],
      "examples": [],
      "tips": [
        "看到 $-a^n$ 時，要先算 $a^n$，再補最前面的負號。",
        "看到 $(-a)^n$ 時，代表負號跟著底數一起做次方。"
      ],
      "notes": [
        "這組題的目標不是硬算，而是先判斷底數到底是正還是負。"
      ],
      "mistakes": [
        "把 $-2^4$ 和 $(-2)^4$ 當成同一件事。",
        "忘記奇次方保留負號、偶次方變正。"
      ]
    },
    "practice-j1-1-4-scientific-convert-drill": {
      "id": "practice-j1-1-4-scientific-convert-drill",
      "enabled": true,
      "mode": "generator",
      "title": "數值與科學記號的互換",
      "generatorKey": "j1-1-4-scientific-convert-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-4",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "科學記號",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "科學記號",
        "一般數值",
        "小數點移動"
      ],
      "usage": [
        "練習把一般數值寫成科學記號，或把科學記號展開成一般數值。"
      ],
      "examples": [],
      "tips": [
        "科學記號要寫成 $a\\times10^n$，其中 $1\\le a<10$。",
        "小數點向左移幾位，指數就是正幾；向右移幾位，指數就是負幾。"
      ],
      "notes": [
        "這一類是科學記號的基本功，先把位值看清楚，再決定指數。"
      ],
      "mistakes": [
        "把係數寫成 10 或 0.8 這種不符合標準形的數。",
        "小數點移動方向判斷反了，導致指數正負號出錯。"
      ]
    },
    "practice-j1-1-4-scientific-digit-reading-drill": {
      "id": "practice-j1-1-4-scientific-digit-reading-drill",
      "enabled": true,
      "mode": "generator",
      "title": "位數判讀與小數點後的零",
      "generatorKey": "j1-1-4-scientific-digit-reading-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-4",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "科學記號",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "科學記號",
        "位數判讀",
        "小數點"
      ],
      "usage": [
        "練習判讀展開後的總位數，或判斷小數點後第幾位開始出現不為 0 的數字。"
      ],
      "examples": [],
      "tips": [
        "當指數是正整數時，可以從原數的位數去推總位數。",
        "當指數是負整數時，要先判斷小數點後前面會補幾個 0。"
      ],
      "notes": [
        "這一類題目重點不是硬算，而是理解位值和 10 的冪次如何影響位置。"
      ],
      "mistakes": [
        "把有效數字個數和總位數混在一起。",
        "看到負指數時，沒有先數前面補了幾個 0。"
      ]
    },
    "practice-j1-1-4-scientific-compare-drill": {
      "id": "practice-j1-1-4-scientific-compare-drill",
      "enabled": true,
      "mode": "generator",
      "title": "科學記號的大小比較",
      "generatorKey": "j1-1-4-scientific-compare-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-4",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "科學記號",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "科學記號",
        "大小比較",
        "指數"
      ],
      "usage": [
        "訓練先看指數、再看係數的判斷流程。"
      ],
      "examples": [],
      "tips": [
        "若指數不同，通常先比指數大小；若指數相同，再比係數。",
        "正數的科學記號比較大小時，不必先全部展開。"
      ],
      "notes": [
        "這一類很適合培養學生用位值觀念快速判斷，不一定要化成一般數。"
      ],
      "mistakes": [
        "只看係數，不看指數。",
        "指數相同時，忘記還要比較前面的係數。"
      ]
    },
    "practice-j1-1-4-scientific-mul-div-drill": {
      "id": "practice-j1-1-4-scientific-mul-div-drill",
      "enabled": true,
      "mode": "generator",
      "title": "科學記號的乘除運算",
      "generatorKey": "j1-1-4-scientific-mul-div-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-4",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "科學記號",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "科學記號",
        "乘除運算",
        "指數律"
      ],
      "usage": [
        "利用同底數乘除時指數相加減的規則，整理科學記號的乘法與除法。"
      ],
      "examples": [],
      "tips": [
        "先算前面的數，再處理 $10^n$ 的部分。",
        "算完後如果係數不在 $1\\le a<10$，要再調整成標準科學記號。"
      ],
      "notes": [
        "這一類是科學記號和指數律的結合，適合放在基本互換熟練後練習。"
      ],
      "mistakes": [
        "只把指數相加減，卻忘了前面的係數也要乘除。",
        "算完後沒有整理回標準科學記號。"
      ]
    },
    "practice-j1-1-4-scientific-add-sub-drill": {
      "id": "practice-j1-1-4-scientific-add-sub-drill",
      "enabled": true,
      "mode": "generator",
      "title": "科學記號的加減運算",
      "generatorKey": "j1-1-4-scientific-add-sub-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-4",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "科學記號",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "科學記號",
        "加減運算",
        "指數調整"
      ],
      "usage": [
        "練習先把指數調成相同，再進行加減。"
      ],
      "examples": [],
      "tips": [
        "加減時不能直接把指數相加減，必須先化成同次方。",
        "化成同次方後，再把前面的係數做加減。"
      ],
      "notes": [
        "這一類最能檢查學生是否真的理解科學記號，而不是只會背乘除規則。"
      ],
      "mistakes": [
        "把科學記號的加減誤用成乘除的規則。",
        "指數還沒統一就直接把係數相加減。"
      ]
    },
    "practice-j1-1-4-scientific-unit-conversion-drill": {
      "id": "practice-j1-1-4-scientific-unit-conversion-drill",
      "enabled": true,
      "mode": "generator",
      "title": "長度與重量單位的轉換",
      "generatorKey": "j1-1-4-scientific-unit-conversion-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-4",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "科學記號",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "科學記號",
        "單位換算",
        "長度",
        "重量"
      ],
      "usage": [
        "把奈米、微米、公里、公分、毫克、公斤等單位換算結合科學記號表示。"
      ],
      "examples": [],
      "tips": [
        "先把單位倍率想清楚，再決定 10 的次方變化。",
        "換單位時可以先用科學記號處理倍率，最後再整理成標準形。"
      ],
      "notes": [
        "這一類能把抽象的科學記號和生活常見單位連起來。"
      ],
      "mistakes": [
        "單位換大或換小時，指數增減方向弄反。",
        "只換了數字，卻忘了題目要求的目標單位。"
      ]
    },
    "practice-j1-1-4-scientific-normalize-drill": {
      "id": "practice-j1-1-4-scientific-normalize-drill",
      "enabled": true,
      "mode": "generator",
      "title": "不完整科學記號化為標準形",
      "generatorKey": "j1-1-4-scientific-normalize-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-4",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "科學記號",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "科學記號",
        "標準形",
        "係數調整"
      ],
      "usage": [
        "把像 $6005.2\\times10^{-2}$、$0.00403\\times10^5$、$0.00302\\times10^{-7}$ 這類不符合標準形的寫法，整理成標準科學記號。"
      ],
      "examples": [],
      "tips": [
        "先判斷前面的係數應該移動幾位，之後同步修正指數。",
        "只要前面的數不在 $1\\le a<10$，就還不是標準科學記號。"
      ],
      "notes": [
        "這一類很適合補強學生對「標準形」的敏感度，不再只是機械抄寫。"
      ],
      "mistakes": [
        "只把前面的數改到 1 到 10 之間，卻忘記同步調整指數。",
        "看到小於 1 的係數時，不知道應該把小數點右移並讓指數減少。"
      ]
    },
    "practice-j1-common-factor-drill": {
      "id": "practice-j1-common-factor-drill",
      "enabled": true,
      "mode": "generator",
      "title": "提出公因數",
      "generatorKey": "j1-common-factor-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "j1-1",
        "提出公因數",
        "無限練習"
      ],
      "usage": [
        "像 58×$(-24)+58$×324 這類兩項提出公因數。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j1-common-factor-four-terms-drill": {
      "id": "practice-j1-common-factor-four-terms-drill",
      "enabled": true,
      "mode": "generator",
      "title": "4項提出公因數",
      "generatorKey": "j1-common-factor-four-terms-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "j1-1",
        "四項分組",
        "提出公因數",
        "無限練習"
      ],
      "usage": [
        "先兩兩分組提出，再做第二次提出。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j1-distributive-law-drill": {
      "id": "practice-j1-distributive-law-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分配律",
      "generatorKey": "j1-distributive-law-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "j1-1",
        "分配律",
        "無限練習"
      ],
      "usage": [
        "像 102×40、$(-302)$×$(-30)$ 這類快速分配計算。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j1-variable-distributive-eval-drill": {
      "id": "practice-j1-variable-distributive-eval-drill",
      "enabled": true,
      "mode": "generator",
      "title": "利用分配律與未知數求值",
      "generatorKey": "j1-variable-distributive-eval-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "分配律",
        "未知數",
        "快速求值",
        "無限練習"
      ],
      "usage": [
        "已知一組乘積，利用分配律快速換算其他相關式值。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j1-variable-distributive-nearby-drill": {
      "id": "practice-j1-variable-distributive-nearby-drill",
      "enabled": true,
      "mode": "generator",
      "title": "利用未知數的分配律",
      "generatorKey": "j1-variable-distributive-nearby-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "j1-1",
        "未知數設法",
        "近數技巧",
        "無限練習"
      ],
      "usage": [
        "相近兩數乘積差，設一個為 a、另一個用 a 表示；另一對設 b。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-linear-cross-expand-move-solve-drill": {
      "id": "practice-linear-cross-expand-move-solve-drill",
      "enabled": true,
      "mode": "generator",
      "title": "交叉相乘後展開移項求解",
      "generatorKey": "linear-cross-expand-move-solve-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j1-3-1",
        "交叉相乘",
        "分式方程",
        "無限練習"
      ],
      "usage": [
        "兩邊都是分式時，用交叉相乘消分母。"
      ],
      "examples": [],
      "tips": [],
      "notes": [
        "交叉相乘後要完整展開再移項。"
      ],
      "mistakes": []
    },
    "practice-linear-expand-move-solve-drill": {
      "id": "practice-linear-expand-move-solve-drill",
      "enabled": true,
      "mode": "generator",
      "title": "展開移項求解",
      "generatorKey": "linear-expand-move-solve-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j1-3-1",
        "展開",
        "移項",
        "無限練習"
      ],
      "usage": [
        "左右有括號係數，先展開再解。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": [
        "分配律漏乘某一項。"
      ]
    },
    "practice-linear-fraction-parentheses-drill": {
      "id": "practice-linear-fraction-parentheses-drill",
      "enabled": true,
      "mode": "generator",
      "title": "有分數的去括號（一元一次）",
      "generatorKey": "linear-fraction-parentheses-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "分數",
        "去括號",
        "一元一次",
        "無限練習"
      ],
      "usage": [
        "分子是一次式的分式加減，先去括號再合併。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": [
        "分母不同時直接併分子。"
      ]
    },
    "practice-linear-word-expression-drill": {
      "id": "practice-linear-word-expression-drill",
      "enabled": true,
      "mode": "generator",
      "title": "綜合列式文字題",
      "generatorKey": "linear-word-expression-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "文字題",
        "列式",
        "一元一次",
        "無限練習"
      ],
      "usage": [
        "把生活情境或敘述句翻成代數式，重點是先釐清 x 代表什麼，再看要加、減、乘、除哪一部分。"
      ],
      "examples": [],
      "tips": [
        "先找出未知數 x 代表什麼，再決定其餘量要怎麼接在 x 的前後。",
        "看到打折、平均分配、連續數、面積、幣值時，要先想成規則，再寫成式子。"
      ],
      "notes": [
        "這一類先重視列式是否正確，不急著往下求值或解方程式。"
      ],
      "mistakes": [
        "把文字敘述直接照順序抄成算式，沒有先判斷 x 是單價、數量、還是最小的數。",
        "連續偶數或奇數誤寫成 x、x+1、x+2。"
      ]
    },
    "practice-linear-substitution-value-drill": {
      "id": "practice-linear-substitution-value-drill",
      "enabled": true,
      "mode": "generator",
      "title": "綜合代入求值",
      "generatorKey": "linear-substitution-value-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "代入",
        "求值",
        "一元一次",
        "無限練習"
      ],
      "usage": [
        "把已知數值代回代數式，練習先看式子結構，再依運算順序代入計算。"
      ],
      "examples": [],
      "tips": [
        "看到負數、小數、分數時，代入要先加括號，避免符號錯誤。",
        "如果是分式求值，先分清楚分子、分母各自代入後再算。"
      ],
      "notes": [
        "這一組會混合整數、小數、分數，以及二變數、三變數的簡單代入題。"
      ],
      "mistakes": [
        "把 $2x-3$ 代成 $2+(-3)$，忘了先做乘法。",
        "負數代入時沒有加括號，導致號號算錯。"
      ]
    },
    "practice-linear-lcm-multiply-move-solve-drill": {
      "id": "practice-linear-lcm-multiply-move-solve-drill",
      "enabled": true,
      "mode": "generator",
      "title": "同乘公倍數後整理移項求解",
      "generatorKey": "linear-lcm-multiply-move-solve-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j1-3-1",
        "公倍數",
        "去分母",
        "無限練習"
      ],
      "usage": [
        "分母不同的和差型方程，先同乘公倍數。"
      ],
      "examples": [],
      "tips": [],
      "notes": [
        "同乘後每一項都要乘到，正負號要保留。"
      ],
      "mistakes": []
    },
    "practice-linear-same-solution-drill": {
      "id": "practice-linear-same-solution-drill",
      "enabled": true,
      "mode": "generator",
      "title": "解相同題型",
      "generatorKey": "linear-same-solution-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "同解",
        "代回",
        "一元一次",
        "無限練習"
      ],
      "usage": [
        "先由第一個方程式求出 x，再把同一個 x 代回第二個方程式，進一步求出未知字母。"
      ],
      "examples": [],
      "tips": [
        "先把第一式當作普通一元一次方程式處理，求出 x 之後再做第二層。",
        "代回第二式時，記得 n 是未知數，x 是已知值。"
      ],
      "notes": [
        "這一類的重點是分兩步做，不要一開始就把兩式混在一起算。"
      ],
      "mistakes": [
        "第一層還沒先求出 x，就急著把兩個式子同時展開。",
        "代回第二式時，把 nx 誤看成 n+x。"
      ]
    },
    "practice-j1-3-3-purchase-discount-application-drill": {
      "id": "practice-j1-3-3-purchase-discount-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "錢數買賣與折扣問題",
      "generatorKey": "j1-3-3-purchase-discount-application-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "折扣",
        "成本",
        "售價",
        "票價"
      ],
      "usage": [
        "練習把成本、定價、售價、利潤之間的關係翻成方程式，再求出未知量。"
      ],
      "examples": [],
      "tips": [
        "先分清楚哪一個是成本、哪一個是售價，再把折數或獲利幾成換成乘法關係。"
      ],
      "notes": [
        "遇到票價題時，可先設較便宜的那一種票價為未知數。"
      ],
      "mistakes": [
        "把打 8 折誤寫成減 8 成。",
        "把獲利 20% 誤看成售價的 20%。"
      ]
    },
    "practice-j1-3-3-allocation-application-drill": {
      "id": "practice-j1-3-3-allocation-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分配問題（剩餘與不足）",
      "generatorKey": "j1-3-3-allocation-application-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "分配",
        "剩餘",
        "不足",
        "應用題"
      ],
      "usage": [
        "利用「每組幾個」與「總數不變」建立方程式，常見於住宿、分班、分糖果。"
      ],
      "examples": [],
      "tips": [
        "先設房間數、班級數或人數，再把兩種分配方式都寫成總數。"
      ],
      "notes": [
        "看到不足時，可改寫成需要的總數比原有的多多少。"
      ],
      "mistakes": [
        "把不足幾個寫成減在人數上，而不是減在總數關係上。",
        "空出幾間房時，房間總數要先減掉空房。"
      ]
    },
    "practice-j1-3-3-age-application-drill": {
      "id": "practice-j1-3-3-age-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "年齡推算問題",
      "generatorKey": "j1-3-3-age-application-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "年齡",
        "倍數",
        "和差",
        "應用題"
      ],
      "usage": [
        "年齡問題的關鍵在於掌握「年齡差永遠固定」與「兩人年齡同增同減」。"
      ],
      "examples": [],
      "tips": [
        "先設現在年齡，再把過去或未來的年齡用同一個未知數表示。"
      ],
      "notes": [
        "看到幾年後、幾年前時，要兩人的年齡一起加減。"
      ],
      "mistakes": [
        "只改其中一個人的年齡。",
        "把倍數關係誤套到未來或過去的錯誤時間點。"
      ]
    },
    "practice-j1-3-3-speed-application-drill": {
      "id": "practice-j1-3-3-speed-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "行程與速率問題",
      "generatorKey": "j1-3-3-speed-application-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "速率",
        "行程",
        "時間",
        "距離"
      ],
      "usage": [
        "利用 距離 = 速率 × 時間 或 時間 = 距離 ÷ 速率 來建立方程式。"
      ],
      "examples": [],
      "tips": [
        "先分清楚哪一段的距離或時間未知，再把總時間、總距離連起來。"
      ],
      "notes": [
        "同一路線上下山時，單程距離相同。"
      ],
      "mistakes": [
        "把總距離直接除以平均速度，忽略兩段速率不同。",
        "數線題沒有先把位置用式子表示。"
      ]
    },
    "practice-j1-3-3-heads-coins-application-drill": {
      "id": "practice-j1-3-3-heads-coins-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "雞兔同籠與硬幣問題",
      "generatorKey": "j1-3-3-heads-coins-application-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "雞兔同籠",
        "硬幣",
        "個數",
        "總值"
      ],
      "usage": [
        "透過頭數、腳數、硬幣枚數或總值建立方程式，求出各類數量。"
      ],
      "examples": [],
      "tips": [
        "可先設數量較特別的一種為 x，再用總數表示另一種。"
      ],
      "notes": [
        "硬幣題要分清楚「枚數」和「總值」。"
      ],
      "mistakes": [
        "頭數、腳數或幣值條件對應錯誤。",
        "把 10 元硬幣 3 倍誤寫成總值 3 倍。"
      ]
    },
    "practice-linear-move-terms-solve-drill": {
      "id": "practice-linear-move-terms-solve-drill",
      "enabled": true,
      "mode": "generator",
      "title": "移項求解",
      "generatorKey": "linear-move-terms-solve-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j1-3-1",
        "移項",
        "一元一次",
        "無限練習"
      ],
      "usage": [
        "純一次式方程，直接移項整理。"
      ],
      "examples": [],
      "tips": [
        "先把 x 項放同邊，常數放另一邊。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-linear-multiply-parentheses-drill": {
      "id": "practice-linear-multiply-parentheses-drill",
      "enabled": true,
      "mode": "generator",
      "title": "有乘法的去括號（一元一次）",
      "generatorKey": "linear-multiply-parentheses-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "分配律",
        "去括號",
        "一元一次",
        "無限練習"
      ],
      "usage": [
        "有係數乘括號，先分配律再合併同類項。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": [
        "漏乘括號內其中一項。"
      ]
    },
    "practice-linear-remove-parentheses-drill": {
      "id": "practice-linear-remove-parentheses-drill",
      "enabled": true,
      "mode": "generator",
      "title": "去括號（一元一次）",
      "generatorKey": "linear-remove-parentheses-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "去括號",
        "一元一次",
        "無限練習"
      ],
      "usage": [
        "先去括號，再合併同類項。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": [
        "括號前是負號時，只改第一項符號。"
      ]
    },
    "practice-midpoint-distance-combined-drill": {
      "id": "practice-midpoint-distance-combined-drill",
      "enabled": true,
      "mode": "generator",
      "title": "中點與距離問題",
      "generatorKey": "midpoint-distance-combined-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "中點",
        "距離",
        "數線",
        "無限練習"
      ],
      "usage": [
        "同題同時求中點與距離。"
      ],
      "examples": [],
      "tips": [
        "先求中點，再求距離；距離一定非負。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-midpoint-formula": {
      "id": "practice-midpoint-formula",
      "enabled": true,
      "mode": "generator",
      "title": "中點問題",
      "generatorKey": "midpoint-formula",
      "difficulty": "easy",
      "questionCount": 10,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "中點",
        "數線",
        "平均"
      ],
      "usage": [
        "數線上兩點的正中央位置，或兩數取平均時使用。"
      ],
      "examples": [
        "例：2 和 8 的中點是 $\\frac{2+8}{2}=5$。"
      ],
      "tips": [
        "先把兩端點相加，再除以 2。",
        "若答案不是整數，可保留成分數。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-midpoint-plus-distance-drill": {
      "id": "practice-midpoint-plus-distance-drill",
      "enabled": true,
      "mode": "generator",
      "title": "中點加距離綜合問題",
      "generatorKey": "midpoint-plus-distance-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "中點",
        "距離",
        "綜合",
        "無限練習"
      ],
      "usage": [
        "同題先求中點再求距離。"
      ],
      "examples": [],
      "tips": [
        "步驟分開算，較不會符號錯。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-midpoint-reverse-drill": {
      "id": "practice-midpoint-reverse-drill",
      "enabled": true,
      "mode": "generator",
      "title": "中點反向問題",
      "generatorKey": "midpoint-reverse-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "中點",
        "反推",
        "無限練習"
      ],
      "usage": [
        "已知中點與一端點，反推另一端點。"
      ],
      "examples": [],
      "tips": [
        "先寫 $C=2B-A$，再代數值。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-mod11-remainder-drill": {
      "id": "practice-mod11-remainder-drill",
      "enabled": true,
      "mode": "generator",
      "title": "大數除以11餘數",
      "generatorKey": "mod11-remainder-drill",
      "difficulty": "easy",
      "questionCount": 10,
      "subtypeCount": 10,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "11 的倍數",
        "餘數",
        "無限練習"
      ],
      "usage": [
        "練習大數直接求除以 11 的餘數。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-mod11-unknown-multiple-drill": {
      "id": "practice-mod11-unknown-multiple-drill",
      "enabled": true,
      "mode": "generator",
      "title": "反向求一大數除以11整除",
      "generatorKey": "mod11-unknown-multiple-drill",
      "difficulty": "medium",
      "questionCount": 10,
      "subtypeCount": 10,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "11 的倍數",
        "反推",
        "未知數字",
        "無限練習"
      ],
      "usage": [
        "已知要整除 11，反推缺位數字。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-mod11-unknown-remainder-drill": {
      "id": "practice-mod11-unknown-remainder-drill",
      "enabled": true,
      "mode": "generator",
      "title": "反向求一大數除以11餘數",
      "generatorKey": "mod11-unknown-remainder-drill",
      "difficulty": "medium",
      "questionCount": 10,
      "subtypeCount": 10,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "11 的餘數",
        "反推",
        "未知數字",
        "無限練習"
      ],
      "usage": [
        "已知除以 11 的餘數，反推缺位數字。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-mod9-remainder-drill": {
      "id": "practice-mod9-remainder-drill",
      "enabled": true,
      "mode": "generator",
      "title": "大數除以9餘數",
      "generatorKey": "mod9-remainder-drill",
      "difficulty": "easy",
      "questionCount": 10,
      "subtypeCount": 10,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "9 的倍數",
        "餘數",
        "無限練習"
      ],
      "usage": [
        "練習大數直接求除以 9 的餘數。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-mod9-unknown-multiple-drill": {
      "id": "practice-mod9-unknown-multiple-drill",
      "enabled": true,
      "mode": "generator",
      "title": "反向求一大數除以9整除",
      "generatorKey": "mod9-unknown-multiple-drill",
      "difficulty": "medium",
      "questionCount": 10,
      "subtypeCount": 10,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "9 的倍數",
        "反推",
        "未知數字",
        "無限練習"
      ],
      "usage": [
        "已知要整除 9，反推缺位數字。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-mod9-unknown-remainder-drill": {
      "id": "practice-mod9-unknown-remainder-drill",
      "enabled": true,
      "mode": "generator",
      "title": "反向求一大數除以9餘數",
      "generatorKey": "mod9-unknown-remainder-drill",
      "difficulty": "medium",
      "questionCount": 10,
      "subtypeCount": 10,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "因數倍數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "9 的餘數",
        "反推",
        "未知數字",
        "無限練習"
      ],
      "usage": [
        "已知除以 9 的餘數，反推缺位數字。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j1-2-1-gcd-lcm-calculation-drill": {
      "id": "practice-j1-2-1-gcd-lcm-calculation-drill",
      "enabled": true,
      "mode": "generator",
      "title": "最大公因數與最小公倍數",
      "generatorKey": "j1-2-1-gcd-lcm-calculation-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "倍數與因數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "最大公因數",
        "最小公倍數",
        "標準分解式"
      ],
      "usage": [
        "練習兩數、三數，以及已知標準分解式時，如何求最大公因數與最小公倍數。"
      ],
      "examples": [],
      "tips": [
        "最大公因數取共同質因數的較小次方。",
        "最小公倍數取全部質因數的較大次方。"
      ],
      "notes": [
        "這組題會輪流出現兩數、三數與已知標準分解式三種型態。"
      ],
      "mistakes": [
        "把最大公因數和最小公倍數的取法顛倒。",
        "三數題只算前兩數，忘記把第三個數一起比較。"
      ]
    },
    "practice-j1-2-1-gcd-lcm-product-relation-drill": {
      "id": "practice-j1-2-1-gcd-lcm-product-relation-drill",
      "enabled": true,
      "mode": "generator",
      "title": "乘積與公因倍數關係",
      "generatorKey": "j1-2-1-gcd-lcm-product-relation-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "倍數與因數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "最大公因數",
        "最小公倍數",
        "乘積關係"
      ],
      "usage": [
        "利用 $(a,b)\\times[a,b]=a\\times b$ 這個關係，反推另一數、最小公倍數或最大公因數。"
      ],
      "examples": [],
      "tips": [
        "先確認題目給的是乘積、最大公因數，還是最小公倍數。",
        "代入公式後再整理，通常會比較快。"
      ],
      "notes": [
        "這組題比純計算多一步轉換，適合接在 GCD/LCM 基礎題後面。"
      ],
      "mistakes": [
        "知道公式卻不知道哪一個量要相除、哪一個量要相乘。",
        "算出結果後沒有檢查是否和題目條件相符。"
      ]
    },
    "practice-j1-2-1-remainder-shortage-mixed-drill": {
      "id": "practice-j1-2-1-remainder-shortage-mixed-drill",
      "enabled": true,
      "mode": "generator",
      "title": "餘數與不足問題",
      "generatorKey": "j1-2-1-remainder-shortage-mixed-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "倍數與因數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "餘數",
        "不足",
        "最小公倍數",
        "公因數"
      ],
      "usage": [
        "混合練習『不足數相同』、『餘數相同』與『除數推算』三種常見題型。"
      ],
      "examples": [],
      "tips": [
        "不足幾，就是比某個公倍數少幾。",
        "除數推算題常要先改寫成『整除某兩個數』。"
      ],
      "notes": [
        "這組題主要在訓練把文字條件轉成整除與餘數條件。"
      ],
      "mistakes": [
        "把『不足 2』誤看成餘 2。",
        "只找到一個符合的數，沒有回頭檢查題目問的是最大、最小還是全部。"
      ]
    },
    "practice-j1-2-1-hanxin-advanced-drill": {
      "id": "practice-j1-2-1-hanxin-advanced-drill",
      "enabled": true,
      "mode": "generator",
      "title": "韓信點兵進階",
      "generatorKey": "j1-2-1-hanxin-advanced-drill",
      "difficulty": "挑戰",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "倍數與因數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "韓信點兵",
        "餘數",
        "週期"
      ],
      "usage": [
        "同時滿足三個餘數條件，練習找最小解，或在固定範圍（如 600 到 800）內列出所有可能值。"
      ],
      "examples": [],
      "tips": [
        "先找出一個最小解，再利用最小公倍數判斷後續週期。",
        "若題目有限定範圍，就在同一個週期上往後加。"
      ],
      "notes": [
        "這組題是餘數推理的進階版，適合已熟悉基本餘數與不足題型後再做。"
      ],
      "mistakes": [
        "只找到一個答案，就忘了檢查題目是否還要列出區間內其他可能值。",
        "沒有意識到解會以最小公倍數為週期重複出現。"
      ]
    },
    "practice-j1-2-3-fraction-add-sub-brackets-drill": {
      "id": "practice-j1-2-3-fraction-add-sub-brackets-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分數加減混合（去括號）",
      "generatorKey": "j1-2-3-fraction-add-sub-brackets-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "分數的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "分數加減",
        "去括號",
        "符號轉換"
      ],
      "usage": [
        "練習括號前有負號時，如何正確去括號並整理分數加減。"
      ],
      "examples": [],
      "tips": [
        "括號前面是減號，裡面的每一項都要變號。",
        "先去括號，再找公分母會比較穩。"
      ],
      "notes": [
        "這一題型對應截圖第 3 類中的去括號混合運算。"
      ],
      "mistakes": [
        "只把括號第一項變號，後面忘記一起變。",
        "還沒去括號就直接通分，容易算亂。"
      ]
    },
    "practice-j1-2-3-fraction-add-sub-negative-drill": {
      "id": "practice-j1-2-3-fraction-add-sub-negative-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分數加減混合（負號轉換）",
      "generatorKey": "j1-2-3-fraction-add-sub-negative-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "分數的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "分數加減",
        "負負得正",
        "混合運算"
      ],
      "usage": [
        "練習減去負分數、減去負帶分數時的符號轉換。"
      ],
      "examples": [],
      "tips": [
        "看到減去負數，先改寫成加上正數。",
        "符號處理正確後，再做通分與相加減。"
      ],
      "notes": [
        "這題型適合用來加強『減負變加』的穩定度。"
      ],
      "mistakes": [
        "把減去負數仍然當成減號處理。",
        "符號改對了，但後面通分又漏掉正負。"
      ]
    },
    "practice-j1-2-3-fraction-add-sub-absolute-drill": {
      "id": "practice-j1-2-3-fraction-add-sub-absolute-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分數加減混合（絕對值對稱）",
      "generatorKey": "j1-2-3-fraction-add-sub-absolute-drill",
      "difficulty": "挑戰",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "分數的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "分數加減",
        "絕對值",
        "對稱"
      ],
      "usage": [
        "利用兩個絕對值內互為相反數的結構，快速判斷結果。"
      ],
      "examples": [],
      "tips": [
        "先觀察兩個絕對值內部是否互為相反數。",
        "若互為相反數，兩個絕對值就會相等。"
      ],
      "notes": [
        "這題型比單純通分更重視結構觀察。"
      ],
      "mistakes": [
        "看到絕對值就急著通分，沒有先看出對稱關係。",
        "把絕對值內互為相反數誤當成一正一負直接相減。"
      ]
    },
    "practice-j1-2-3-fraction-mul-div-mixed-drill": {
      "id": "practice-j1-2-3-fraction-mul-div-mixed-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分數乘除（帶分數與倒數）",
      "generatorKey": "j1-2-3-fraction-mul-div-mixed-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "分數的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "分數乘除",
        "帶分數",
        "倒數"
      ],
      "usage": [
        "練習帶分數先化成假分數，再把除法改成乘倒數。"
      ],
      "examples": [],
      "tips": [
        "帶分數先化成假分數。",
        "除以分數就是乘以它的倒數。"
      ],
      "notes": [
        "這題型對應截圖第 4 類的帶分數乘除混合。"
      ],
      "mistakes": [
        "帶分數沒有先化成假分數就直接算。",
        "除法改倒數時只倒一個數，忘記整體方向。"
      ]
    },
    "practice-j1-2-3-fraction-distributive-common-factor-drill": {
      "id": "practice-j1-2-3-fraction-distributive-common-factor-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分數乘除（分配律提公因數）",
      "generatorKey": "j1-2-3-fraction-distributive-common-factor-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "分數的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "分配律",
        "提公因數",
        "簡算"
      ],
      "usage": [
        "把相同的乘數提出來，先做括號內的分數加減，再乘回去。"
      ],
      "examples": [],
      "tips": [
        "先看每一項是不是都有共同乘數。",
        "提出後括號內通常會更好算。"
      ],
      "notes": [
        "這題型對應截圖第 4 類中利用分配律簡算。"
      ],
      "mistakes": [
        "看出公因數卻沒有完整提出。",
        "提出公因數後，括號內的正負號寫錯。"
      ]
    },
    "practice-j1-2-3-fraction-distributive-regroup-drill": {
      "id": "practice-j1-2-3-fraction-distributive-regroup-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分數乘除（分配律重組）",
      "generatorKey": "j1-2-3-fraction-distributive-regroup-drill",
      "difficulty": "挑戰",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "分數的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "分配律",
        "重組",
        "整數簡算"
      ],
      "usage": [
        "把四項重新分組，做成兩個相同因數和差的結構，再快速計算。"
      ],
      "examples": [],
      "tips": [
        "先找哪兩項可以合成同一個公因數。",
        "重組時注意前面的負號。"
      ],
      "notes": [
        "這一類重點在結構重組，不是硬算四個乘法。"
      ],
      "mistakes": [
        "只看到乘法，沒有注意到可以分組。",
        "重組時把負號分配錯。"
      ]
    },
    "practice-j1-2-3-telescoping-gap-four-sum-drill": {
      "id": "practice-j1-2-3-telescoping-gap-four-sum-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分項對消（間隔四項和）",
      "generatorKey": "j1-2-3-telescoping-gap-four-sum-drill",
      "difficulty": "挑戰",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "分數的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "分項對消",
        "級數",
        "部分分式"
      ],
      "usage": [
        "把每一項拆成兩個分數的差，利用前後對消求和。"
      ],
      "examples": [],
      "tips": [
        "先找出每一項能不能拆成『前一項減後一項』。",
        "寫出前幾項與後幾項，通常就能看見對消。"
      ],
      "notes": [
        "這組題對應截圖第 5 類第一種和式。"
      ],
      "mistakes": [
        "只會一項一項通分，沒看出對消規律。",
        "拆分後係數少乘或多乘。"
      ]
    },
    "practice-j1-2-3-telescoping-adjacent-sum-drill": {
      "id": "practice-j1-2-3-telescoping-adjacent-sum-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分項對消（相鄰連分式和）",
      "generatorKey": "j1-2-3-telescoping-adjacent-sum-drill",
      "difficulty": "挑戰",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "分數的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "分項對消",
        "相鄰分母",
        "和式"
      ],
      "usage": [
        "利用 $\\frac{2}{k(k+1)}$ 拆項後的對消規律來快速求和。"
      ],
      "examples": [],
      "tips": [
        "先改寫成 $2\\left(\\frac{1}{k}-\\frac{1}{k+1}\\right)$。",
        "對消後通常只剩開頭與結尾。"
      ],
      "notes": [
        "這組題對應截圖第 5 類第二種和式。"
      ],
      "mistakes": [
        "拆項時把係數 2 忘掉。",
        "對消後還把中間項留著一起算。"
      ]
    },
    "practice-j1-2-3-telescoping-product-drill": {
      "id": "practice-j1-2-3-telescoping-product-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分項對消（連乘積）",
      "generatorKey": "j1-2-3-telescoping-product-drill",
      "difficulty": "挑戰",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "分數的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "分項對消",
        "連乘積",
        "規律"
      ],
      "usage": [
        "把每一項改成 $\\frac{k-1}{k}$ 的形式，利用前後約掉的規律求積。"
      ],
      "examples": [],
      "tips": [
        "先把 $1-\\frac{1}{k}$ 改寫成 $\\frac{k-1}{k}$。",
        "觀察分子分母如何一項一項相消。"
      ],
      "notes": [
        "這組題對應截圖第 5 類第三種連乘規律題。"
      ],
      "mistakes": [
        "只看見每一項變小，沒發現有規律約分。",
        "乘到一半就硬算，反而失去對消優勢。"
      ]
    },
    "practice-j1-2-1-prime-factor-notation-drill": {
      "id": "practice-j1-2-1-prime-factor-notation-drill",
      "enabled": true,
      "mode": "generator",
      "title": "標準分解式的寫法",
      "generatorKey": "j1-2-1-prime-factor-notation-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "倍數與因數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "質因數分解",
        "標準分解式",
        "由小到大排列"
      ],
      "usage": [
        "一部分題目是把 30 到 200 之間的整數寫成標準分解式；另一部分題目是把兩個整數相乘後重新做質因數分解，再整理成標準分解式。"
      ],
      "examples": [],
      "tips": [
        "先用 2、3、5、7 這些小質數去試除，會比較快。",
        "標準分解式要把相同的質因數合併成次方，且底數由小到大排列。"
      ],
      "notes": [
        "這一類是後面因數個數、因數總和與排列應用的基礎。"
      ],
      "mistakes": [
        "把合數也當成最後的因數寫進去，沒有繼續分到質數。",
        "沒有把相同質因數合併，或底數順序寫亂。"
      ]
    },
    "practice-j1-2-1-divisor-count-sum-mixed-drill": {
      "id": "practice-j1-2-1-divisor-count-sum-mixed-drill",
      "enabled": true,
      "mode": "generator",
      "title": "正因數個數與總和",
      "generatorKey": "j1-2-1-divisor-count-sum-mixed-drill",
      "difficulty": "進階",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "倍數與因數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "正因數個數",
        "正因數總和",
        "標準分解式"
      ],
      "usage": [
        "每一題都同時問『正因數個數』與『正因數總和』，檢查學生是否能從標準分解式同時往回推兩種結果。"
      ],
      "examples": [],
      "tips": [
        "正因數個數用『指數加 1 再連乘』。",
        "正因數總和用各質因數的等比和相乘。"
      ],
      "notes": [
        "數字刻意控制得比較小，重點是看懂方法，不是做大數運算。"
      ],
      "mistakes": [
        "把個數公式和總和公式混在一起。",
        "知道標準分解式後，只列部分因數，沒有用公式整理。"
      ]
    },
    "practice-j1-2-1-rectangle-factor-pairs-drill": {
      "id": "practice-j1-2-1-rectangle-factor-pairs-drill",
      "enabled": true,
      "mode": "generator",
      "title": "矩形排列問題",
      "generatorKey": "j1-2-1-rectangle-factor-pairs-drill",
      "difficulty": "基礎",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j1-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "倍數與因數",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "因數配對",
        "矩形排列",
        "面積"
      ],
      "usage": [
        "把整數的因數配對連到長方形的長寬組合，讓學生看見因數分解在圖形排列上的應用。"
      ],
      "examples": [],
      "tips": [
        "先找一組長寬，再往中間配對，避免重複。",
        "只要長乘寬等於面積，就是一組可行的整數長寬。"
      ],
      "notes": [
        "這一類很適合和『因數配對』、『長方形面積』一起教。"
      ],
      "mistakes": [
        "把 $(2,12)$ 和 $(12,2)$ 當成兩種不同情況重複計算。",
        "忘記題目要求長與寬都要是整數。"
      ]
    },
    "practice-nonnegative-sum-fixed-multix-drill": {
      "id": "practice-nonnegative-sum-fixed-multix-drill",
      "enabled": true,
      "mode": "generator",
      "title": "非負整數解和固定討論多組解（只求x）",
      "generatorKey": "nonnegative-sum-fixed-multix-drill",
      "difficulty": "hard",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "非負",
        "多組解",
        "只求x",
        "補充"
      ],
      "usage": [
        "固定總和下，列出所有可能 x。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-nonnegative-sum-fixed-one-drill": {
      "id": "practice-nonnegative-sum-fixed-one-drill",
      "enabled": true,
      "mode": "generator",
      "title": "非負整數和固定討論",
      "generatorKey": "nonnegative-sum-fixed-one-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "非負",
        "固定和",
        "補充"
      ],
      "usage": [
        "固定總和下，討論並找出一組整數解。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-nonnegative-sum-zero-drill": {
      "id": "practice-nonnegative-sum-zero-drill",
      "enabled": true,
      "mode": "generator",
      "title": "非負整數和=0",
      "generatorKey": "nonnegative-sum-zero-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "一元一次方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "非負",
        "和為0",
        "補充"
      ],
      "usage": [
        "可直接判定每一項都等於 0。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-opposite-number-equation-drill": {
      "id": "practice-opposite-number-equation-drill",
      "enabled": true,
      "mode": "generator",
      "title": "相反數問題",
      "generatorKey": "opposite-number-equation-drill",
      "difficulty": "easy",
      "questionCount": 10,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "相反數",
        "方程",
        "無限練習"
      ],
      "usage": [
        "由『某式的相反數』反推 x。"
      ],
      "examples": [],
      "tips": [
        "看到相反數先乘上 -1，再解方程。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-radical-add-subtract-like-terms": {
      "id": "practice-radical-add-subtract-like-terms",
      "enabled": true,
      "mode": "generator",
      "title": "根式加減同類項",
      "generatorKey": "radical-add-subtract-like-terms",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-2-2",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "根式的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "加減不可拆",
        "同類項"
      ],
      "usage": [
        "根式加減前先化同類項再合併。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": [
        "把不同根號的項硬合併。"
      ]
    },
    "practice-radical-mul-div-split-rule": {
      "id": "practice-radical-mul-div-split-rule",
      "enabled": true,
      "mode": "generator",
      "title": "根式乘除可拆",
      "generatorKey": "radical-mul-div-split-rule",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-2-2",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "根式的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "乘除可拆"
      ],
      "usage": [
        "根式乘除的基本運算法則。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-rationalize-denominator-binomial-junior": {
      "id": "practice-rationalize-denominator-binomial-junior",
      "enabled": true,
      "mode": "generator",
      "title": "多項有理化分母（平方差）",
      "generatorKey": "rationalize-denominator-binomial-junior",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-2-2",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "根式的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "有理化分母",
        "多項",
        "平方差",
        "共軛"
      ],
      "usage": [
        "分母是兩項時，乘共軛並用平方差消根號。"
      ],
      "examples": [],
      "tips": [
        "先辨認共軛，再檢查是否套到平方差。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-rationalize-denominator-monomial-junior": {
      "id": "practice-rationalize-denominator-monomial-junior",
      "enabled": true,
      "mode": "generator",
      "title": "單項有理化分母",
      "generatorKey": "rationalize-denominator-monomial-junior",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-2-2",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "根式的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "有理化分母",
        "單項"
      ],
      "usage": [
        "分母只有單一根號時使用。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-same-shift-opposite-drill": {
      "id": "practice-same-shift-opposite-drill",
      "enabled": true,
      "mode": "generator",
      "title": "兩數同加或減一數成相反數",
      "generatorKey": "same-shift-opposite-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "相反數",
        "同加同減",
        "無限練習"
      ],
      "usage": [
        "把『成相反數』轉成和為 0 解 x。"
      ],
      "examples": [],
      "tips": [
        "先寫成等式再整理，避免符號錯誤。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-simplest-radical-form-junior": {
      "id": "practice-simplest-radical-form-junior",
      "enabled": true,
      "mode": "generator",
      "title": "最簡根式",
      "generatorKey": "simplest-radical-form-junior",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-2-2",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "根式的運算",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "最簡根式"
      ],
      "usage": [
        "根式運算前的標準整理步驟。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-square-difference-factorization-variable-drill": {
      "id": "practice-square-difference-factorization-variable-drill",
      "enabled": true,
      "mode": "generator",
      "title": "平方差未知數分解",
      "generatorKey": "square-difference-factorization-variable-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "平方差分解",
        "未知數",
        "無限練習"
      ],
      "usage": [
        "專練未知數型平方差分解。"
      ],
      "examples": [
        "例：$25x^2-25=(5x+5)(5x-5)$。"
      ],
      "tips": [
        "一次 5 題，先看是不是兩個平方相減。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-square-difference-variable-drill": {
      "id": "practice-square-difference-variable-drill",
      "enabled": true,
      "mode": "generator",
      "title": "平方差未知數展開",
      "generatorKey": "square-difference-variable-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "平方差",
        "未知數展開",
        "無限練習"
      ],
      "usage": [
        "專練未知數型平方差展開。"
      ],
      "examples": [
        "例：$(2x+2)(2x-2)=4x^2-4$。"
      ],
      "tips": [
        "一次 5 題，先看兩括號是不是共軛。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-square-root-basic-junior": {
      "id": "practice-square-root-basic-junior",
      "enabled": true,
      "mode": "generator",
      "title": "平方根估算與近似（綜合）",
      "generatorKey": "square-root-basic-junior",
      "difficulty": "easy",
      "questionCount": 8,
      "subtypeCount": 6,
      "relatedPracticeIds": [],
      "chapterCode": "j3-2-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "二次方根",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "平方根",
        "估算",
        "近似",
        "整數部分",
        "最簡根式"
      ],
      "usage": [
        "同一練習整合平方根估算、整數部分、區間判斷與根式轉換。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-sum-square-variable-drill": {
      "id": "practice-sum-square-variable-drill",
      "enabled": true,
      "mode": "generator",
      "title": "和平方未知數版",
      "generatorKey": "sum-square-variable-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 0,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "和平方",
        "未知數版",
        "無限練習"
      ],
      "usage": [
        "專練未知數型和平方。"
      ],
      "examples": [
        "例：$(2x+3)^2=4x^2+12x+9$。"
      ],
      "tips": [
        "一次 5 題，重點盯住中間項 $2ab$。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-three-point-quick-distance-drill": {
      "id": "practice-three-point-quick-distance-drill",
      "enabled": true,
      "mode": "generator",
      "title": "三點快速看距離練習",
      "generatorKey": "three-point-quick-distance-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "數線與絕對值",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "三點",
        "距離",
        "數線",
        "無限練習"
      ],
      "usage": [
        "三點座標快速求三段距離。"
      ],
      "examples": [],
      "tips": [
        "三段都用絕對值，不要漏任何一段。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-three-products-add-subtract-drill": {
      "id": "practice-three-products-add-subtract-drill",
      "enabled": true,
      "mode": "generator",
      "title": "三組乘法後加減",
      "generatorKey": "three-products-add-subtract-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "整數",
        "乘法",
        "混合運算"
      ],
      "usage": [
        "熟悉正負數乘法後，再做混合加減。"
      ],
      "examples": [],
      "tips": [
        "每一組先判斷正負，再算乘積。",
        "三組乘積都算完再統一加減比較穩。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-time-baseline-advanced-drill": {
      "id": "practice-time-baseline-advanced-drill",
      "enabled": true,
      "mode": "generator",
      "title": "進階時間基準問題",
      "generatorKey": "time-baseline-advanced-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "時間基準",
        "兩點換算",
        "無限練習"
      ],
      "usage": [
        "給兩個時刻對應值，求第三個時刻。"
      ],
      "examples": [],
      "tips": [
        "先算每小時變化，再代入新時刻。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-time-baseline-basic-drill": {
      "id": "practice-time-baseline-basic-drill",
      "enabled": true,
      "mode": "generator",
      "title": "時間基準問題",
      "generatorKey": "time-baseline-basic-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "時間基準",
        "正負數",
        "無限練習"
      ],
      "usage": [
        "已知某時刻記數，回推其他時刻記數。"
      ],
      "examples": [],
      "tips": [
        "先求每小時變化量，再換到目標時刻。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-weird-symbol-calc": {
      "id": "practice-weird-symbol-calc",
      "enabled": true,
      "mode": "generator",
      "title": "奇怪的符號計算",
      "generatorKey": "weird-symbol-calc",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "自定義運算",
        "符號運算",
        "無限練習"
      ],
      "usage": [
        "先代定義再計算，適合訓練運算順序與符號判讀。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-weird-symbol-calc-three-layer": {
      "id": "practice-weird-symbol-calc-three-layer",
      "enabled": true,
      "mode": "generator",
      "title": "奇怪的符號計算三層版",
      "generatorKey": "weird-symbol-calc-three-layer",
      "difficulty": "hard",
      "questionCount": 3,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j1-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "正負數與數線",
      "domain": "數與量",
      "prompt": "",
      "answer": "",
      "tags": [
        "自定義運算",
        "三層",
        "無限練習"
      ],
      "usage": [
        "三數運算，重點是巢狀順序與中間值不出錯。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-1-1-context-to-equation-drill": {
      "id": "practice-j2-1-1-context-to-equation-drill",
      "enabled": true,
      "mode": "generator",
      "title": "文字敘述轉換為代數式",
      "generatorKey": "j2-1-1-context-to-equation-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "列式",
        "代數式",
        "無限練習"
      ],
      "usage": [
        "練習把生活語句快速翻成含 x、y 的代數式。"
      ],
      "examples": [],
      "tips": [
        "先定義 x、y 各代表什麼，再把總價、原數或固定費逐句翻成式子。"
      ],
      "notes": [
        "重點不是急著求解，而是先把題意翻成正確的代數式。"
      ],
      "mistakes": [
        "把未知數的意義寫反。",
        "漏掉十位數的 10 倍關係。"
      ]
    },
    "practice-j2-1-1-expression-classify-drill": {
      "id": "practice-j2-1-1-expression-classify-drill",
      "enabled": true,
      "mode": "generator",
      "title": "二元一次式與方程式判別",
      "generatorKey": "j2-1-1-expression-classify-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "判別",
        "二元一次式",
        "無限練習"
      ],
      "usage": [
        "分清楚什麼是二元一次式、二元一次方程式，什麼不是。"
      ],
      "examples": [],
      "tips": [
        "先看有沒有等號，再看未知數是不是只有 x、y 且次方都是 1。"
      ],
      "notes": [
        "這組題重點在概念判別，不是計算。"
      ],
      "mistakes": [
        "把 xy、x^2+y 也當成一次式。",
        "只看到兩個字母，就以為一定是二元一次式。"
      ]
    },
    "practice-j2-1-1-expression-simplify-drill": {
      "id": "practice-j2-1-1-expression-simplify-drill",
      "enabled": true,
      "mode": "generator",
      "title": "二元一次式的化簡（合併同類項）",
      "generatorKey": "j2-1-1-expression-simplify-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "化簡",
        "同類項",
        "無限練習"
      ],
      "usage": [
        "練習辨認 x 項、y 項與常數項，做純合併同類項。"
      ],
      "examples": [],
      "tips": [
        "先分別整理 x 項、y 項和常數項，不同字母不能亂合併。"
      ],
      "notes": [
        "這一類不先考去括號，重點是看清楚式子的結構。"
      ],
      "mistakes": [
        "把 x 項與 y 項亂合併。",
        "把常數項忘記一起整理。"
      ]
    },
    "practice-j2-1-1-ordered-pair-check-drill": {
      "id": "practice-j2-1-1-ordered-pair-check-drill",
      "enabled": true,
      "mode": "generator",
      "title": "數對代入與成立判斷",
      "generatorKey": "j2-1-1-ordered-pair-check-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "數對",
        "代入",
        "無限練習"
      ],
      "usage": [
        "練習把數對代回方程式，判斷是否真的成立。"
      ],
      "examples": [],
      "tips": [
        "左右兩邊要各自算完再比較，不要只代一個未知數。"
      ],
      "notes": [
        "這組題很適合強化『一組解要同時滿足整個方程式』的觀念。"
      ],
      "mistakes": [
        "只算左邊或只算右邊就下結論。",
        "代入負數時漏掉括號。"
      ]
    },
    "practice-j2-1-1-parameter-substitution-drill": {
      "id": "practice-j2-1-1-parameter-substitution-drill",
      "enabled": true,
      "mode": "generator",
      "title": "參數題代入求係數",
      "generatorKey": "j2-1-1-parameter-substitution-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "參數",
        "代入",
        "無限練習"
      ],
      "usage": [
        "已知數對是解，反過來代入求參數值。"
      ],
      "examples": [],
      "tips": [
        "先把 x、y 代進去，化成一元一次方程式後再解參數。"
      ],
      "notes": [
        "這組題型要特別注意負號與代入順序。"
      ],
      "mistakes": [
        "代入時遺漏負數括號。",
        "把參數誤當成第二個未知數一起移項。"
      ]
    },
    "practice-j2-1-1-equivalent-transform-drill": {
      "id": "practice-j2-1-1-equivalent-transform-drill",
      "enabled": true,
      "mode": "generator",
      "title": "標準型整理（移項）",
      "generatorKey": "j2-1-1-equivalent-transform-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "等值變形",
        "標準型",
        "無限練習"
      ],
      "usage": [
        "把左右兩邊打亂的方程式移項整理成 Ax+By=C。"
      ],
      "examples": [],
      "tips": [
        "先把 x、y 項移到左邊，再把常數移到右邊。"
      ],
      "notes": [
        "這組題先練習移項整理，為後面聯立方程式的標準型做準備。"
      ],
      "mistakes": [
        "移項時忘記變號。",
        "把 x 項和 y 項移到不同邊，格式變得不一致。"
      ]
    },
    "practice-j2-1-1-integer-constraint-drill": {
      "id": "practice-j2-1-1-integer-constraint-drill",
      "enabled": true,
      "mode": "generator",
      "title": "列出多組整數解",
      "generatorKey": "j2-1-1-integer-constraint-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "整數解",
        "限制條件",
        "無限練習"
      ],
      "usage": [
        "從二元一次方程式中列出所有符合非負整數條件的數對解。"
      ],
      "examples": [],
      "tips": [
        "可先把 y 寫成 x 的式子，再檢查哪些 x 會讓 y 也是非負整數。"
      ],
      "notes": [
        "這組題刻意選用互質係數，讓學生看到不是只有 x+y=常數 那種最簡單的型。"
      ],
      "mistakes": [
        "找到代數解就停止，沒有再檢查整數與非負限制。",
        "把情境限制和純代數解混在一起。"
      ]
    },
    "practice-j2-1-1-evaluate-expression-drill": {
      "id": "practice-j2-1-1-evaluate-expression-drill",
      "enabled": true,
      "mode": "generator",
      "title": "求二元一次式的值",
      "generatorKey": "j2-1-1-evaluate-expression-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "代入求值",
        "二元一次式",
        "無限練習"
      ],
      "usage": [
        "把已知的 x、y 數值代入二元一次式，求出式子的值。"
      ],
      "examples": [],
      "tips": [
        "代入負數時記得加括號，先做乘法再做加減。"
      ],
      "notes": [
        "這是建立二元運算感最基礎的一類。"
      ],
      "mistakes": [
        "把負號漏掉。",
        "代入後沒有先乘再加減。"
      ]
    },
    "practice-j2-1-1-distribute-expand-drill": {
      "id": "practice-j2-1-1-distribute-expand-drill",
      "enabled": true,
      "mode": "generator",
      "title": "去括號與分配律運算",
      "generatorKey": "j2-1-1-distribute-expand-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "去括號",
        "分配律",
        "無限練習"
      ],
      "usage": [
        "練習把括號前的正負號或係數正確分配進去。"
      ],
      "examples": [],
      "tips": [
        "括號前若是負號，括號內每一項都要變號。"
      ],
      "notes": [
        "這一類是化簡前最容易抄錯符號的地方。"
      ],
      "mistakes": [
        "只把括號裡第一項變號。",
        "漏乘括號內某一項。"
      ]
    },
    "practice-j2-1-1-fraction-simplify-drill": {
      "id": "practice-j2-1-1-fraction-simplify-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分數形式的化簡（通分）",
      "generatorKey": "j2-1-1-fraction-simplify-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "分式",
        "通分",
        "無限練習"
      ],
      "usage": [
        "練習把含 x、y 的分式通分後再合併分子。"
      ],
      "examples": [],
      "tips": [
        "先找分母的最小公倍數，再把每個分子的每一項一起放大。"
      ],
      "notes": [
        "這一類最容易在分子變形時漏掉某一項。"
      ],
      "mistakes": [
        "只放大 x 項，忘了 y 項和常數項也要一起乘。",
        "通分後分母沒統一。"
      ]
    },
    "practice-j2-1-1-solve-for-variable-drill": {
      "id": "practice-j2-1-1-solve-for-variable-drill",
      "enabled": true,
      "mode": "generator",
      "title": "整理成 x 表示 y、y 表示 x",
      "generatorKey": "j2-1-1-solve-for-variable-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-1",
        "代入消去",
        "x表示y",
        "無限練習"
      ],
      "usage": [
        "把一般式整理成 x=… 或 y=…，銜接後面的代入消去法。"
      ],
      "examples": [],
      "tips": [
        "先決定要解出哪個未知數，再把另一個未知數留在式子中。"
      ],
      "notes": [
        "這一類是 j2-1-2 代入消去法的重要前置能力。"
      ],
      "mistakes": [
        "移項時忘記變號。",
        "最後忘記把係數除掉。"
      ]
    },
    "practice-j2-1-2-substitution-basic-drill": {
      "id": "practice-j2-1-2-substitution-basic-drill",
      "enabled": true,
      "mode": "generator",
      "title": "代入消去法的基礎練習",
      "generatorKey": "j2-1-2-substitution-basic-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "代入消去法",
        "聯立方程式",
        "無限練習"
      ],
      "usage": [
        "先把一式整理成 x=... 或 y=...，再代回另一式求解。"
      ],
      "examples": [],
      "tips": [
        "代回前先看哪一式比較容易整理，減少分數出現。"
      ],
      "notes": [
        "這一類重點是把代入步驟寫完整，不要只在心中代。"
      ],
      "mistakes": [
        "移項時漏掉負號。",
        "代入後忘記把括號全部乘開。"
      ]
    },
    "practice-j2-1-2-elimination-adjustment-drill": {
      "id": "practice-j2-1-2-elimination-adjustment-drill",
      "enabled": true,
      "mode": "generator",
      "title": "加減消去法的係數調整",
      "generatorKey": "j2-1-2-elimination-adjustment-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "加減消去法",
        "聯立方程式",
        "無限練習"
      ],
      "usage": [
        "練習找最小公倍數調整係數，再利用相加或相減消去未知數。"
      ],
      "examples": [],
      "tips": [
        "先看哪個未知數的係數比較容易配成相同或相反。"
      ],
      "notes": [
        "有些題只需一式擴分，有些題需要兩式都調整。"
      ],
      "mistakes": [
        "只把某一項乘上倍數，忘記整式都要一起乘。",
        "係數相反時還用相減，白白把未知數留下。"
      ]
    },
    "practice-j2-1-2-fraction-decimal-drill": {
      "id": "practice-j2-1-2-fraction-decimal-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分數與小數型的化簡",
      "generatorKey": "j2-1-2-fraction-decimal-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "分數",
        "小數",
        "無限練習"
      ],
      "usage": [
        "先把係數整數化，再用代入或消去法解聯立方程式。"
      ],
      "examples": [],
      "tips": [
        "小數先乘 10、100；分數先乘最小公倍數。"
      ],
      "notes": [
        "這一類不急著硬算，先把式子整理乾淨比較重要。"
      ],
      "mistakes": [
        "只把一項整數化，忘記整個方程式左右都要同乘。",
        "通分後分母消掉了，分子卻沒有完整保留括號。"
      ]
    },
    "practice-j2-1-2-solution-type-drill": {
      "id": "practice-j2-1-2-solution-type-drill",
      "enabled": true,
      "mode": "generator",
      "title": "解的個數判定",
      "generatorKey": "j2-1-2-solution-type-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "解的個數",
        "聯立方程式",
        "無限練習"
      ],
      "usage": [
        "利用係數比快速判斷聯立方程式是恰有一解、無限多解還是無解。"
      ],
      "examples": [],
      "tips": [
        "先比 x 係數、y 係數，再比常數項。"
      ],
      "notes": [
        "這一類不一定要完整解出 x、y，重點是看比例關係。"
      ],
      "mistakes": [
        "只比前兩個比值就下結論，忘了檢查常數比。",
        "把無限多解和無解混在一起。"
      ]
    },
    "practice-j2-1-2-triple-equal-drill": {
      "id": "practice-j2-1-2-triple-equal-drill",
      "enabled": true,
      "mode": "generator",
      "title": "特殊結構運算（A=B=C）",
      "generatorKey": "j2-1-2-triple-equal-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "A=B=C",
        "特殊結構",
        "無限練習"
      ],
      "usage": [
        "把三者相等拆成兩個方程式，再用聯立方程式的觀念解題。"
      ],
      "examples": [],
      "tips": [
        "不必一次看三個式子，先拆成前兩個相等、後兩個相等。"
      ],
      "notes": [
        "這一類適合訓練學生從特殊寫法中看出聯立方程式本質。"
      ],
      "mistakes": [
        "只列出一個等式就停下來。",
        "拆式後常數項移項方向寫錯。"
      ]
    },
    "practice-j2-1-2-symmetric-system-drill": {
      "id": "practice-j2-1-2-symmetric-system-drill",
      "enabled": true,
      "mode": "generator",
      "title": "特殊結構運算（係數對稱）",
      "generatorKey": "j2-1-2-symmetric-system-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "係數對稱",
        "特殊結構",
        "無限練習"
      ],
      "usage": [
        "觀察兩式係數對稱，常可先相減看出 x 與 y 的關係。"
      ],
      "examples": [],
      "tips": [
        "先比較兩式左邊的 x、y 係數是否互換。"
      ],
      "notes": [
        "這一類重點不是硬算，而是看出對稱後先做最省步驟的運算。"
      ],
      "mistakes": [
        "沒看出對稱就直接長篇消去。",
        "相減後得到 x=y 或 x=-y 時，沒有再代回。"
      ]
    },
    "practice-j2-1-2-abs-zero-drill": {
      "id": "practice-j2-1-2-abs-zero-drill",
      "enabled": true,
      "mode": "generator",
      "title": "特殊結構運算（非負性質）",
      "generatorKey": "j2-1-2-abs-zero-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "絕對值",
        "平方",
        "非負性質"
      ],
      "usage": [
        "利用絕對值與平方都不小於 0 的性質，把題目轉成兩個一次方程式。"
      ],
      "examples": [],
      "tips": [
        "看到和等於 0，就要想到每一項都必須各自等於 0。"
      ],
      "notes": [
        "現在題型同時包含絕對值和為 0、平方和為 0、以及絕對值加平方的混合型。"
      ],
      "mistakes": [
        "把 |A|+|B|=0 誤看成 A+B=0。",
        "只把整體看成 0，沒有逐項判斷非負性質。"
      ]
    },
    "practice-j2-1-2-known-solution-coeff-drill": {
      "id": "practice-j2-1-2-known-solution-coeff-drill",
      "enabled": true,
      "mode": "generator",
      "title": "已知解反求係數",
      "generatorKey": "j2-1-2-known-solution-coeff-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "已知解",
        "反求係數",
        "聯立方程式"
      ],
      "usage": [
        "把已知的 x、y 代回方程式，先求出未知係數，再整理目標式。"
      ],
      "examples": [],
      "tips": [
        "先看哪個未知係數可以直接被代入求出，再處理第二個。"
      ],
      "notes": [
        "這類題重點是把已知解當工具，而不是再去解一次 x、y。"
      ],
      "mistakes": [
        "代入時忘記正負號。",
        "求出係數後，忘記回到題目要求的代數式。"
      ]
    },
    "practice-j2-1-2-error-diagnosis-drill": {
      "id": "practice-j2-1-2-error-diagnosis-drill",
      "enabled": true,
      "mode": "generator",
      "title": "看錯題目（邏輯排錯）",
      "generatorKey": "j2-1-2-error-diagnosis-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "看錯題目",
        "排錯",
        "聯立方程式"
      ],
      "usage": [
        "從別人的錯解反推出正確係數，再回頭解原來的聯立方程式。"
      ],
      "examples": [],
      "tips": [
        "誰看錯哪個字母，就先用那個人的錯解去代入另一條沒有看錯的式子。"
      ],
      "notes": [
        "這類題不是直接算，而是先辨認每個錯解還保留了哪些正確資訊。"
      ],
      "mistakes": [
        "把錯解同時代入兩條式子。",
        "求出正確係數後，忘記再解原來的系統。"
      ]
    },
    "practice-j2-1-2-shared-solution-drill": {
      "id": "practice-j2-1-2-shared-solution-drill",
      "enabled": true,
      "mode": "generator",
      "title": "同解問題（兩組方程組共有解）",
      "generatorKey": "j2-1-2-shared-solution-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "同解",
        "兩組方程組",
        "聯立方程式"
      ],
      "usage": [
        "先從不含 a、b 的兩式解出 x、y，再把同一組解代回另一組解出 a、b。"
      ],
      "examples": [],
      "tips": [
        "這類題常常要解兩次聯立：第一次求 x、y，第二次求 a、b。"
      ],
      "notes": [
        "先找出哪兩條式子完全不含參數，通常那就是第一步。"
      ],
      "mistakes": [
        "四條式子一起亂算。",
        "求出 x、y 後沒有再代回參數所在的兩式。"
      ]
    },
    "practice-j2-1-2-third-condition-drill": {
      "id": "practice-j2-1-2-third-condition-drill",
      "enabled": true,
      "mode": "generator",
      "title": "解滿足第三個條件",
      "generatorKey": "j2-1-2-third-condition-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "第三個條件",
        "條件限制",
        "聯立方程式"
      ],
      "usage": [
        "先解原來的二元一次聯立，再利用第三個條件做代入、判斷或反推。"
      ],
      "examples": [],
      "tips": [
        "第三個條件常可改寫成 x=y-2、x=2y、x+y=常數 這類線性關係。"
      ],
      "notes": [
        "表面是二元一次，實際上常常偷偷藏著第三條限制。"
      ],
      "mistakes": [
        "只解前兩式就停住。",
        "把條件翻錯，例如「小 2」與「少 2」方向寫反。"
      ]
    },
    "practice-j2-1-2-special-reverse-drill": {
      "id": "practice-j2-1-2-special-reverse-drill",
      "enabled": true,
      "mode": "generator",
      "title": "特殊解情形的反求",
      "generatorKey": "j2-1-2-special-reverse-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-2",
        "無解",
        "無限多解",
        "反求"
      ],
      "usage": [
        "利用無解與無限多解的比例條件，反推出未知係數或常數。"
      ],
      "examples": [],
      "tips": [
        "先分清楚題目要的是無解還是無限多解，再比較三組比例。"
      ],
      "notes": [
        "無解是前兩組係數比例相同、常數比例不同；無限多解則三組比例都相同。"
      ],
      "mistakes": [
        "只看 x、y 係數，忘記常數項。",
        "把無解與無限多解的條件混在一起。"
      ]
    },
    "practice-j2-1-3-money-ticket-drill": {
      "id": "practice-j2-1-3-money-ticket-drill",
      "enabled": true,
      "mode": "generator",
      "title": "濃度與混合問題",
      "generatorKey": "j2-1-3-money-ticket-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-3",
        "濃度問題",
        "混合問題",
        "重量百分濃度"
      ],
      "usage": [
        "這一組練習建立在「溶質＝溶液×濃度」的觀念上，適合訓練兩種溶液混合時的等量關係。"
      ],
      "examples": [],
      "tips": [
        "先設兩種溶液的重量，再列出「總重量」與「溶質重量」兩條方程式，解聯立方程式最穩定。"
      ],
      "notes": [
        "百分濃度要看成每 100 克溶液中含多少克溶質，列式時要分清楚重量與濃度。"
      ],
      "mistakes": [
        "只列總重量，忘了再列溶質重量關係。",
        "把濃度直接相加平均，沒有考慮兩種溶液的重量不同。"
      ]
    },
    "practice-j2-1-3-heads-coins-score-drill": {
      "id": "practice-j2-1-3-heads-coins-score-drill",
      "enabled": true,
      "mode": "generator",
      "title": "淨重、毛重與容器問題",
      "generatorKey": "j2-1-3-heads-coins-score-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-3",
        "淨重",
        "毛重",
        "容器問題"
      ],
      "usage": [
        "這一組題目把「容器重量」和「內容物重量」分開，適合練習瓶子、杯子與內容物之間的重量關係。"
      ],
      "examples": [],
      "tips": [
        "先設容器重與內容物重，再依題意列出總重與喝掉、倒出後的重量變化，通常就能形成聯立方程式。"
      ],
      "notes": [
        "看到喝掉幾分之幾、倒出幾分之幾時，要先判斷剩下的是幾分之幾，不要直接把喝掉的部分代進去。"
      ],
      "mistakes": [
        "把毛重和淨重混在一起，忘記容器本身也有重量。",
        "看到分數時沒有先弄清楚是喝掉多少，還是剩下多少。"
      ]
    },
    "practice-j2-1-3-digit-placevalue-drill": {
      "id": "practice-j2-1-3-digit-placevalue-drill",
      "enabled": true,
      "mode": "generator",
      "title": "數字位數與交換問題",
      "generatorKey": "j2-1-3-digit-placevalue-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式的應用",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-3",
        "位數",
        "十位個位",
        "數字"
      ],
      "usage": [
        "把十位數字與個位數字分別設成 x、y，再用位值觀念列出原數與新數。"
      ],
      "examples": [],
      "tips": [
        "二位數要寫成 10x+y，數字對調後要改成 10y+x。"
      ],
      "notes": [
        "位值觀念要先穩，列式才不會混亂。"
      ],
      "mistakes": [
        "把二位數寫成 x+y。",
        "交換數字後仍寫成 10x+y。"
      ]
    },
    "practice-j2-1-3-age-chase-drill": {
      "id": "practice-j2-1-3-age-chase-drill",
      "enabled": true,
      "mode": "generator",
      "title": "測驗得分與勝負判定",
      "generatorKey": "j2-1-3-age-chase-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-3",
        "得分問題",
        "勝負判定",
        "應用題"
      ],
      "usage": [
        "這一組題目練習把「總次數」和「總得分」拆成兩條關係式，常見於測驗計分、比賽勝負與獎懲問題。"
      ],
      "examples": [],
      "tips": [
        "先設兩種結果的次數，例如答對與答錯、贏與輸，再列出「總次數」和「總分數」兩式。"
      ],
      "notes": [
        "若題目有平手或空白題，要先看清楚這些情況的得分，再決定是否要先從總次數中扣掉。"
      ],
      "mistakes": [
        "只看總分數，忘了還要列總次數。",
        "把扣分題誤寫成加分，或把平手、空白的分數漏掉。"
      ]
    },
    "practice-j2-1-3-speed-chase-drill": {
      "id": "practice-j2-1-3-speed-chase-drill",
      "enabled": true,
      "mode": "generator",
      "title": "行程速率與追趕問題",
      "generatorKey": "j2-1-3-speed-chase-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式的應用",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-3",
        "速率",
        "追趕",
        "行程"
      ],
      "usage": [
        "利用距離、速率、時間的關係，處理相向、同向追趕與順逆流問題。"
      ],
      "examples": [],
      "tips": [
        "先分清楚哪一個條件對應到相加、哪一個條件對應到相減。"
      ],
      "notes": [
        "可先把單位統一，再列聯立方程式。"
      ],
      "mistakes": [
        "把相向與追趕都寫成相加。",
        "順流逆流忘記是一加一減。"
      ]
    },
    "practice-j2-1-3-allocation-work-drill": {
      "id": "practice-j2-1-3-allocation-work-drill",
      "enabled": true,
      "mode": "generator",
      "title": "分配與工程問題",
      "generatorKey": "j2-1-3-allocation-work-drill",
      "difficulty": "challenge",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次聯立方程式的應用",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-3",
        "分配",
        "工程",
        "合作"
      ],
      "usage": [
        "處理總量不變下的不同分配方式，並練習把工程效率改寫成聯立方程式。"
      ],
      "examples": [],
      "tips": [
        "分配題先抓總量不變；工程題先設工作效率，再回推出單做時間。"
      ],
      "notes": [
        "同一章中這類題目通常最需要先整理條件再列式。"
      ],
      "mistakes": [
        "工程題直接設完成天數，卻忘了效率才是線性。",
        "分配題把多出或不足寫反。"
      ]
    },
    "practice-j2-1-3-tiered-fee-drill": {
      "id": "practice-j2-1-3-tiered-fee-drill",
      "enabled": true,
      "mode": "generator",
      "title": "基本費與超額計費問題",
      "generatorKey": "j2-1-3-tiered-fee-drill",
      "difficulty": "challenge",
      "questionCount": 5,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-3",
        "基本費",
        "超額計費",
        "分段計費"
      ],
      "usage": [
        "這一組題目把基本費、免費額度與超額部分拆開來看，適合練習從兩次不同消費紀錄中建立聯立方程式。"
      ],
      "examples": [],
      "tips": [
        "先找固定不變的量，例如基本費、門檻時間或免費重量，再把超過的部分寫成「差值 × 單價」。"
      ],
      "notes": [
        "題目常會把「未超過某範圍的基本費」和「超過後另收費」放在一起，列式時要先分清楚哪一段是固定、哪一段是變動。"
      ],
      "mistakes": [
        "把超過的部分直接寫成總量，忘記先扣掉門檻值。",
        "只列一條式子，忘了要利用兩次不同紀錄才能解出兩個未知數。"
      ]
    },
    "practice-j1-3-3-work-rate-application-drill": {
      "id": "practice-j1-3-3-work-rate-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "工程與工作效率問題",
      "generatorKey": "j1-3-3-work-rate-application-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "工程",
        "工作效率",
        "工作率",
        "應用題"
      ],
      "usage": [
        "這一組題目著重在「工作總量」與「單位時間完成量」的關係，通常假設總工程量為 1。"
      ],
      "examples": [],
      "tips": [
        "先把每人單獨完成所需時間改寫成工作率，再把合作與單獨完成的部分加總。"
      ],
      "notes": [
        "看到合作幾天、剩下再由誰完成時，要分清楚哪一段是合作，哪一段是單獨完成。"
      ],
      "mistakes": [
        "把完成天數直接相加，沒有先換成工作率。",
        "忘了整個工程量通常設為 1。"
      ]
    },
    "practice-j1-3-3-fraction-remainder-application-drill": {
      "id": "practice-j1-3-3-fraction-remainder-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "剩餘量的分率問題",
      "generatorKey": "j1-3-3-fraction-remainder-application-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "分率",
        "剩餘量",
        "應用題",
        "一元一次方程式"
      ],
      "usage": [
        "這一類題目常出現「用去全部的幾分之幾，再用去剩下的幾分之幾」的敘述，重點是抓準每一步的基準量。"
      ],
      "examples": [],
      "tips": [
        "先決定未知數代表原來的總量，再把每一次剩下多少用乘法表示。"
      ],
      "notes": [
        "分率題最常錯在第二次、第三次的分母是針對剩下的量，不是針對原來的總量。"
      ],
      "mistakes": [
        "把後面的分率也直接乘在原量上。",
        "沒有先看清楚最後剩下的是哪一段的量。"
      ]
    },
    "practice-j1-3-3-score-penalty-application-drill": {
      "id": "practice-j1-3-3-score-penalty-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "得分倒扣問題",
      "generatorKey": "j1-3-3-score-penalty-application-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "得分",
        "倒扣",
        "競賽評分",
        "應用題"
      ],
      "usage": [
        "透過總題數、答對給分與答錯倒扣的規則來建立方程式。"
      ],
      "examples": [],
      "tips": [
        "先設答對或答錯的題數，再用「總題數關係」把另一個數量表示出來。"
      ],
      "notes": [
        "這類題目常用一元一次方程式就能解，不一定要設兩個未知數。"
      ],
      "mistakes": [
        "把倒扣分寫成加分。",
        "忘了未作答是否計分。"
      ]
    },
    "practice-j1-3-3-mixture-application-drill": {
      "id": "practice-j1-3-3-mixture-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "濃度與混合問題",
      "generatorKey": "j1-3-3-mixture-application-drill",
      "difficulty": "medium",
      "questionCount": 3,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "濃度",
        "混合",
        "食鹽水",
        "合金"
      ],
      "usage": [
        "涉及食鹽水、酒精水或合金比例的計算，重點是抓準有效成分與總重量的關係。"
      ],
      "examples": [],
      "tips": [
        "先設未知量，再把濃度換成有效成分的重量或體積來列式。"
      ],
      "notes": [
        "百分濃度不是直接平均，要看兩種溶液的重量或體積。"
      ],
      "mistakes": [
        "把兩種濃度直接取平均。",
        "只看總重量，忘了有效成分的等量關係。"
      ]
    },
    "practice-j1-3-3-tiered-fee-application-drill": {
      "id": "practice-j1-3-3-tiered-fee-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "基本費與超額計費問題",
      "generatorKey": "j1-3-3-tiered-fee-application-drill",
      "difficulty": "challenge",
      "questionCount": 4,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "基本費",
        "超額",
        "線型計費",
        "應用題"
      ],
      "usage": [
        "把基本費、超過門檻後的加收規則拆開，利用兩次消費資料反推出門檻或單價。"
      ],
      "examples": [],
      "tips": [
        "先看哪一段是固定收費，哪一段是超過門檻後才會乘上單價。"
      ],
      "notes": [
        "有些題目是先解兩個未知數，再回頭問其中一個量。"
      ],
      "mistakes": [
        "把未超過門檻的部分也一起乘上加收單價。",
        "超過部分沒有用實際超出的量去表示。"
      ]
    },
    "practice-j1-3-3-clock-angle-application-drill": {
      "id": "practice-j1-3-3-clock-angle-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "時鐘與角度問題",
      "generatorKey": "j1-3-3-clock-angle-application-drill",
      "difficulty": "challenge",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j1-3-3",
      "stage": "國中",
      "grade": "國一",
      "term": "下",
      "chapter": "一元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "時鐘",
        "夾角",
        "時針分針",
        "應用題"
      ],
      "usage": [
        "利用時針與分針的轉動速度差，把時鐘夾角問題轉成一元一次方程式。"
      ],
      "examples": [],
      "tips": [
        "分針每分鐘轉 6 度，時針每分鐘轉 0.5 度，先抓兩針的相對轉速再列式。"
      ],
      "notes": [
        "要先判斷題目是在找較早還是較晚出現的時間，並注意夾角可以從兩側去看。"
      ],
      "mistakes": [
        "把時針也當成每分鐘轉 6 度。",
        "只列出一個夾角情形，忽略同一角度可能有兩個時刻。"
      ]
    },
    "practice-j2-1-3-classical-text-drill": {
      "id": "practice-j2-1-3-classical-text-drill",
      "enabled": true,
      "mode": "generator",
      "title": "古文應用題",
      "generatorKey": "j2-1-3-classical-text-drill",
      "difficulty": "challenge",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-1-3",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "二元一次方程式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-1-3",
        "古文",
        "聯立方程式",
        "應用題"
      ],
      "usage": [
        "把古文敘述翻成現代數學語言後，再用二元一次聯立方程式處理數量關係。"
      ],
      "examples": [],
      "tips": [
        "先看每一種對應的單位量，例如每人分得幾個、每瓶可醉幾人、每隻有幾足幾眼，再列兩條關係式。"
      ],
      "notes": [
        "古文題常把條件濃縮在短句裡，解題時要先把題意完整翻成白話，再決定未知數。"
      ],
      "mistakes": [
        "直接背答案型，不先判斷每個數字代表的是總數、單位量還是效果量。",
        "看到三分之一就漏掉分數係數，沒有先把方程式整體乘開整理。"
      ]
    },
    "practice-j2-2-1-coordinate-mixed-drill": {
      "id": "practice-j2-2-1-coordinate-mixed-drill",
      "enabled": false,
      "mode": "generator",
      "title": "座標概念綜合練習",
      "generatorKey": "j2-2-1-coordinate-mixed-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-1",
        "座標",
        "象限",
        "平移",
        "坐標軸"
      ],
      "usage": [
        "把點的座標、象限判斷、平移規則與坐標軸上的特殊位置放在同一組練習中，適合做整章快速檢查。"
      ],
      "examples": [],
      "tips": [
        "先分清楚：左右移動影響 x 坐標，上下移動影響 y 坐標；到 x 軸、y 軸的距離則看另一個坐標的絕對值。"
      ],
      "notes": [
        "這一組是混合題，重點是快速辨認題目在考距離、象限、平移還是坐標軸上的特殊條件。"
      ],
      "mistakes": [
        "把到 x 軸的距離誤看成 x 坐標的絕對值。",
        "向右、向上、向左、向下移動時，把 x、y 的增減方向寫反。"
      ]
    },
    "practice-j2-2-1-midpoint-drill": {
      "id": "practice-j2-2-1-midpoint-drill",
      "enabled": true,
      "mode": "generator",
      "title": "中點坐標公式",
      "generatorKey": "j2-2-1-midpoint-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-1",
        "中點",
        "直徑",
        "反求座標"
      ],
      "usage": [
        "利用中點公式處理已知兩端求中點、已知中點求端點，以及把圓心當成直徑中點的變化題。"
      ],
      "examples": [],
      "tips": [
        "看到「中點」就先想到兩個坐標分別平均；若要求另一端點，可把中點公式倒推回去。"
      ],
      "notes": [
        "這組會把純公式題和直徑幾何題混在一起，練學生辨認本質都是中點。"
      ],
      "mistakes": [
        "只把 x 坐標平均，忘了 y 坐標也要平均。",
        "已知中點與一端點時，直接把差值當答案，忘了要乘 2 再反推。"
      ]
    },
    "practice-j2-2-1-symmetry-drill": {
      "id": "practice-j2-2-1-symmetry-drill",
      "enabled": true,
      "mode": "generator",
      "title": "坐標平面上的對稱點",
      "generatorKey": "j2-2-1-symmetry-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-1",
        "對稱",
        "x軸",
        "y軸",
        "原點"
      ],
      "usage": [
        "練習關於 x 軸、y 軸與原點對稱時，坐標如何變號。"
      ],
      "examples": [],
      "tips": [
        "先想哪一個坐標不變，再想哪一個坐標變號。"
      ],
      "notes": [
        "這類題不難，但最容易在 x、y 哪個要變號上出錯。"
      ],
      "mistakes": [
        "把關於 x 軸對稱和關於 y 軸對稱的規則記反。",
        "關於原點對稱時只改一個坐標。"
      ]
    },
    "practice-j2-2-1-area-drill": {
      "id": "practice-j2-2-1-area-drill",
      "enabled": true,
      "mode": "generator",
      "title": "幾何圖形的面積計算",
      "generatorKey": "j2-2-1-area-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-1",
        "面積",
        "三角形",
        "矩形",
        "底高"
      ],
      "usage": [
        "把坐標上的圖形轉成底與高，再求三角形或矩形面積。"
      ],
      "examples": [],
      "tips": [
        "看到兩點在同一水平線或垂直線上，可以直接抓到底或高。"
      ],
      "notes": [
        "這組刻意挑和坐標軸平行的情況，讓重點放在讀圖與列式。"
      ],
      "mistakes": [
        "三角形面積忘了除以 2。",
        "已知第三點有參數時，以為面積一定和參數有關。"
      ]
    },
    "practice-j2-2-1-quadrant-reasoning-drill": {
      "id": "practice-j2-2-1-quadrant-reasoning-drill",
      "enabled": true,
      "mode": "generator",
      "title": "含代數參數的象限推理",
      "generatorKey": "j2-2-1-quadrant-reasoning-drill",
      "difficulty": "challenge",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-1",
        "象限",
        "參數",
        "正負判斷"
      ],
      "usage": [
        "根據已知點的象限或乘積、和差的正負，推理新點會落在哪一象限。"
      ],
      "examples": [],
      "tips": [
        "先判斷每個代數量是正還是負，再代回新點的坐標。"
      ],
      "notes": [
        "這類題重點不是算數，而是條件整理與符號推理。"
      ],
      "mistakes": [
        "看到平方還以為符號不一定，忘了平方後一定非負。",
        "只看 ab 的正負，忽略 a+b 的條件。"
      ]
    },
    "practice-j2-2-1-nonnegative-drill": {
      "id": "practice-j2-2-1-nonnegative-drill",
      "enabled": true,
      "mode": "generator",
      "title": "絕對值與平方的非負性質應用",
      "generatorKey": "j2-2-1-nonnegative-drill",
      "difficulty": "challenge",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-1",
        "絕對值",
        "平方",
        "非負性質",
        "坐標"
      ],
      "usage": [
        "把 |A|+|B|=0 或 A^2+B^2=0 的非負性質，轉成坐標與象限題來解。"
      ],
      "examples": [],
      "tips": [
        "和為 0 時，每一項都要是 0，先拆成兩條式子再解。"
      ],
      "notes": [
        "題目看起來像絕對值或平方題，本質上還是在解聯立關係。"
      ],
      "mistakes": [
        "只讓其中一項等於 0，忘了另外一項也必須等於 0。",
        "求出坐標後，距離或象限又判斷錯。"
      ]
    },
    "practice-j2-2-1-axis-distance-drill": {
      "id": "practice-j2-2-1-axis-distance-drill",
      "enabled": true,
      "mode": "generator",
      "title": "點的坐標表示法與坐標軸距離",
      "generatorKey": "j2-2-1-axis-distance-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-1",
        "座標",
        "距離",
        "x軸",
        "y軸"
      ],
      "usage": [
        "練習點的座標基本判讀，以及到 x 軸、y 軸距離和象限符號的對應。"
      ],
      "examples": [],
      "tips": [
        "到 x 軸看 y 的絕對值，到 y 軸看 x 的絕對值。"
      ],
      "notes": [
        "這一類雖然基礎，但要把座標、絕對值與象限判斷連在一起想。"
      ],
      "mistakes": [
        "把到 x 軸距離誤看成 x 的絕對值。",
        "已知在某象限時，忘了根據象限補上正負號。"
      ]
    },
    "practice-j2-2-1-quadrant-basic-drill": {
      "id": "practice-j2-2-1-quadrant-basic-drill",
      "enabled": true,
      "mode": "generator",
      "title": "各象限及其性質符號判別",
      "generatorKey": "j2-2-1-quadrant-basic-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-1",
        "象限",
        "符號",
        "性質"
      ],
      "usage": [
        "練習由坐標正負判斷象限，或由條件反推出乘積與新點的位置。"
      ],
      "examples": [],
      "tips": [
        "先確定 x、y 的正負，再判斷象限；看到平方時要記得結果一定非負。"
      ],
      "notes": [
        "這組把純判斷點位置和簡單代數符號題混在一起，幫助學生建立連結。"
      ],
      "mistakes": [
        "只背象限口訣，遇到代數符號就不會轉。",
        "把坐標軸上的點也硬判到某一象限。"
      ]
    },
    "practice-j2-2-1-translation-basic-drill": {
      "id": "practice-j2-2-1-translation-basic-drill",
      "enabled": true,
      "mode": "generator",
      "title": "坐標平面上的平移移動",
      "generatorKey": "j2-2-1-translation-basic-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-1",
        "平移",
        "坐標變化",
        "右左上下"
      ],
      "usage": [
        "練習在坐標平面上平移時，x、y 坐標分別如何增減。"
      ],
      "examples": [],
      "tips": [
        "右加左減影響 x；上加下減影響 y。"
      ],
      "notes": [
        "這類題看似直觀，但學生很常在反求起點時把方向倒過來。"
      ],
      "mistakes": [
        "向右、向左時改錯 y；向上、向下時改錯 x。",
        "已知終點反求起點時，仍用同方向直接代入。"
      ]
    },
    "practice-j2-2-1-axis-special-drill": {
      "id": "practice-j2-2-1-axis-special-drill",
      "enabled": true,
      "mode": "generator",
      "title": "坐標軸上的點與特殊位置判定",
      "generatorKey": "j2-2-1-axis-special-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-1",
        "x軸",
        "y軸",
        "特殊點",
        "參數"
      ],
      "usage": [
        "辨認哪些點落在坐標軸上，並處理不屬於任何象限或位在坐標軸上的參數題。"
      ],
      "examples": [],
      "tips": [
        "在 x 軸上就看 y=0；在 y 軸上就看 x=0。"
      ],
      "notes": [
        "「不屬於任何象限」通常就是在 x 軸、y 軸或原點上。"
      ],
      "mistakes": [
        "只想到 x 軸或 y 軸其中一種情況。",
        "解出參數後忘了回代求完整坐標。"
      ]
    },
    "practice-j2-2-2-point-line-relation-drill": {
      "id": "practice-j2-2-2-point-line-relation-drill",
      "enabled": true,
      "mode": "generator",
      "title": "含有未知數的點與方程式關係",
      "generatorKey": "j2-2-2-point-line-relation-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-2",
        "點在直線上",
        "代入",
        "未知數"
      ],
      "usage": [
        "利用「點在直線上就代入會成立」的觀念，處理座標中的未知數或方程式中的未知數。"
      ],
      "examples": [],
      "tips": [
        "看到「點在直線上」就先把點坐標直接代入方程式，這是最核心的判準。"
      ],
      "notes": [
        "這類題是後面直線圖形、代入判斷與聯立圖形的基礎。"
      ],
      "mistakes": [
        "把點坐標代錯位置，例如 x、y 互換。",
        "通過原點時忘了直接代入 (0,0)。"
      ]
    },
    "practice-j2-2-2-intercept-area-drill": {
      "id": "practice-j2-2-2-intercept-area-drill",
      "enabled": true,
      "mode": "generator",
      "title": "利用截距找交點與三角形面積",
      "generatorKey": "j2-2-2-intercept-area-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-2",
        "截距",
        "面積",
        "交點"
      ],
      "usage": [
        "先找直線與 x 軸、y 軸的交點，再利用底乘高除以二求三角形面積。"
      ],
      "examples": [],
      "tips": [
        "與 x 軸交點就令 y=0；與 y 軸交點就令 x=0。"
      ],
      "notes": [
        "這組把截距觀念和坐標幾何面積連起來，適合練習圖形轉方程。"
      ],
      "mistakes": [
        "求出截距後忘了是坐標，不是單純數字。",
        "三角形面積忘了除以 2。"
      ]
    },
    "practice-j2-2-2-quadrant-exclusion-drill": {
      "id": "practice-j2-2-2-quadrant-exclusion-drill",
      "enabled": true,
      "mode": "generator",
      "title": "由係數正負判斷不通過之象限",
      "generatorKey": "j2-2-2-quadrant-exclusion-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-2",
        "象限",
        "斜率",
        "截距"
      ],
      "usage": [
        "不靠精確畫圖，而是用斜率方向與截距位置判斷直線不會經過哪個象限。"
      ],
      "examples": [],
      "tips": [
        "先看斜率決定左右升降，再看截距決定整條直線上下平移到哪裡。"
      ],
      "notes": [
        "重點不是硬背結論，而是用圖形移動的直覺判斷。"
      ],
      "mistakes": [
        "只看斜率不看截距。",
        "把「不通過哪個象限」誤看成「通過哪幾個象限」。"
      ]
    },
    "practice-j2-2-2-parallel-perpendicular-drill": {
      "id": "practice-j2-2-2-parallel-perpendicular-drill",
      "enabled": true,
      "mode": "generator",
      "title": "水平線與鉛垂線的判定與方程",
      "generatorKey": "j2-2-2-parallel-perpendicular-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-2",
        "水平線",
        "鉛垂線",
        "平行垂直"
      ],
      "usage": [
        "辨認平行 x 軸、平行 y 軸、垂直 x 軸、垂直 y 軸的特殊直線方程式。"
      ],
      "examples": [],
      "tips": [
        "水平線看 y 固定；鉛垂線看 x 固定。"
      ],
      "notes": [
        "這類題常是後面圖形平移、截距與直線交點計算的起點。"
      ],
      "mistakes": [
        "把平行 y 軸誤寫成 y=常數。",
        "看見兩點 y 相同卻沒有想到是水平線。"
      ]
    },
    "practice-j2-2-2-line-from-points-drill": {
      "id": "practice-j2-2-2-line-from-points-drill",
      "enabled": true,
      "mode": "generator",
      "title": "已知兩點求直線方程式",
      "generatorKey": "j2-2-2-line-from-points-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-2",
        "兩點決定一直線",
        "方程式",
        "型式變換"
      ],
      "usage": [
        "利用兩點代入求出斜截式或一般式，也包含已知兩點反求 ax+by=c 中的係數。"
      ],
      "examples": [],
      "tips": [
        "若題目指定型式，就直接把兩點代入；若沒指定型式，再整理成習慣的一般式。"
      ],
      "notes": [
        "這組特別加入「已知兩點且 ax+by=3」的雙未知係數題，讓聯立觀念更完整。"
      ],
      "mistakes": [
        "只代入一個點就想求完整方程式。",
        "求出係數後忘了把直線方程式完整寫出。"
      ]
    },
    "practice-j2-2-2-only-two-quadrants-drill": {
      "id": "practice-j2-2-2-only-two-quadrants-drill",
      "enabled": true,
      "mode": "generator",
      "title": "進階判斷：只通過兩個象限",
      "generatorKey": "j2-2-2-only-two-quadrants-drill",
      "difficulty": "challenge",
      "questionCount": 5,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-2",
        "只通過兩個象限",
        "過原點",
        "進階判斷"
      ],
      "usage": [
        "由直線只經過兩個象限的特徵，反推出它必須過原點，並結合已知點或參數求方程式。"
      ],
      "examples": [],
      "tips": [
        "一般斜直線若只通過兩個象限，幾乎都代表它通過原點。"
      ],
      "notes": [
        "這組是把象限判斷再往前推一步，變成反推係數與方程式。"
      ],
      "mistakes": [
        "以為只要斜率正就一定只過第一、三象限。",
        "忘了截距不為 0 時通常會多經過第三個象限。"
      ]
    },
    "practice-j2-2-2-point-translation-line-drill": {
      "id": "practice-j2-2-2-point-translation-line-drill",
      "enabled": true,
      "mode": "generator",
      "title": "點的平移與直線的變動",
      "generatorKey": "j2-2-2-point-translation-line-drill",
      "difficulty": "challenge",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-2",
        "平移",
        "直線變動",
        "座標變化"
      ],
      "usage": [
        "從點或直線的平移規律出發，判斷新點是否落在線上，或求平移後新直線的方程式。"
      ],
      "examples": [],
      "tips": [
        "右加左減、上加下減；若要維持還在原直線上，就讓方程式左右兩邊的變化互相抵消。"
      ],
      "notes": [
        "這類題很適合訓練學生把座標變化和方程式變化一起思考。"
      ],
      "mistakes": [
        "向右平移卻把 x 減少。",
        "新點和原點的關係沒有分清楚，就直接代入。"
      ]
    },
    "practice-j2-2-2-two-lines-area-drill": {
      "id": "practice-j2-2-2-two-lines-area-drill",
      "enabled": true,
      "mode": "generator",
      "title": "兩直線交點與坐標軸圍成面積",
      "generatorKey": "j2-2-2-two-lines-area-drill",
      "difficulty": "challenge",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-2-2",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "直角座標平面",
      "domain": "函數與圖形",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-2-2",
        "兩直線",
        "交點",
        "面積"
      ],
      "usage": [
        "先找兩直線交點，再找與坐標軸的截距，用底和高求面積。"
      ],
      "examples": [],
      "tips": [
        "面積題要先把圖形看清楚：哪一段當底，哪一段是高。"
      ],
      "notes": [
        "這類題把聯立、截距和坐標幾何面積整合在一起，是章節的進階綜合題。"
      ],
      "mistakes": [
        "只算出交點，忘了還要找與坐標軸的截距。",
        "把底長或高看錯成坐標差的一半。"
      ]
    },
    "practice-j2-3-1-ratio-simplify-drill": {
      "id": "practice-j2-3-1-ratio-simplify-drill",
      "enabled": true,
      "mode": "generator",
      "title": "比例化簡與比值運算",
      "generatorKey": "j2-3-1-ratio-simplify-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "比例",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-1",
        "比例",
        "化簡",
        "比值"
      ],
      "usage": [
        "把帶分數、小數、負數或不同單位先整理成同類量，再化為最簡整數比或直接求比值。"
      ],
      "examples": [
        "例如男生:女生 = 7:4，若男生比女生多 51 人，就先看相差 3 份，再求 1 份是多少。"
      ],
      "tips": [
        "先分清楚是要化簡成最簡整數比，還是要求比值。",
        "遇到單位不同時，要先統一單位；遇到小數或帶分數時，要先化成分數。"
      ],
      "notes": [
        "這一組重點在先整理再比較，不是看到冒號就立刻相減或相除。"
      ],
      "mistakes": [
        "把比和比值混在一起，該化簡比時卻直接做除法。",
        "沒有先統一單位，或小數、帶分數還沒化成分數就開始算。"
      ]
    },
    "practice-j2-3-1-proportion-solve-drill": {
      "id": "practice-j2-3-1-proportion-solve-drill",
      "enabled": true,
      "mode": "generator",
      "title": "比例式求解未知數",
      "generatorKey": "j2-3-1-proportion-solve-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "比例",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-1",
        "比例",
        "比例式",
        "未知數"
      ],
      "usage": [
        "利用比例式內項積等於外項積，把題目化成一元一次方程式，求出未知數。"
      ],
      "examples": [
        "例如先由 7x = 4y 求出 x:y，再去算 2x:3y；或先由男女比與變化後的新比例求原來總數。"
      ],
      "tips": [
        "先看清楚四個位置的順序，再交叉相乘。",
        "若題目含分數或負號，先把括號與正負整理清楚。"
      ],
      "notes": [
        "這一組的關鍵不是背公式，而是看懂哪兩個是內項、哪兩個是外項。"
      ],
      "mistakes": [
        "把比例式左右位置看錯，交叉相乘後順序顛倒。",
        "整理方程式時漏掉負號或括號，導致最後的 x 錯誤。"
      ]
    },
    "practice-j2-3-1-relation-transform-drill": {
      "id": "practice-j2-3-1-relation-transform-drill",
      "enabled": true,
      "mode": "generator",
      "title": "關係式與比例式互換",
      "generatorKey": "j2-3-1-relation-transform-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "比例",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-1",
        "比例",
        "關係式",
        "互換"
      ],
      "usage": [
        "把等式整理成比例，或把比例轉成關係式後，再追求新的比或比值。"
      ],
      "examples": [
        "例如先走掉部分男生，再走掉部分女生，最後比改變；或先由原濃度算出食鹽量，再反推加水後總重量。"
      ],
      "tips": [
        "先抓出真正的核心比，例如由 ax=by 先整理出 x:y。",
        "若題目是多項式比，通常要先交叉相乘，再整理成 x:y。"
      ],
      "notes": [
        "這一組常常不是直接問 x:y，而是先求出 x:y，再進一步問別的比值或分式。"
      ],
      "mistakes": [
        "把 ax=by 誤寫成 x:y=a:b，而不是 x:y=b:a。",
        "只做到第一步關係式整理，忘了再代回去求題目真正問的比值。"
      ]
    },
    "practice-j2-3-1-k-method-drill": {
      "id": "practice-j2-3-1-k-method-drill",
      "enabled": true,
      "mode": "generator",
      "title": "設比例常數求值",
      "generatorKey": "j2-3-1-k-method-drill",
      "difficulty": "challenge",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "比例",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-1",
        "比例",
        "比例常數",
        "求值"
      ],
      "usage": [
        "已知變數比值後，設 $x=ak, y=bk$ 或設兩個和差都等於某個比例常數，再求其他量。"
      ],
      "examples": [
        "例：已知 $x:y=5:4$ 且 $2x-5y=-10$，求 $x,y$。"
      ],
      "tips": [
        "看到固定比就先設成 $x=ak, y=bk$。",
        "若題目給的是 $(a+b):(a-b)$，就把兩個整體一起設成比例常數。"
      ],
      "notes": [
        "這組會混線性條件、平方比以及多步驟的追問。"
      ],
      "mistakes": [
        "設完 $k$ 之後只代入一個變數。",
        "把求得的 $k$ 忘了代回求真正的 $x,y$。"
      ]
    },
    "practice-j2-3-1-basic-single-step-drill": {
      "id": "practice-j2-3-1-basic-single-step-drill",
      "enabled": true,
      "mode": "generator",
      "title": "基本題型（單層動作）",
      "generatorKey": "j2-3-1-basic-single-step-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "比例",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-1",
        "比例",
        "基本",
        "單層"
      ],
      "usage": [
        "先把題目的比例看成幾份對幾份，再直接求出 1 份代表多少。這一組適合練最基礎的比例應用與化簡。"
      ],
      "examples": [
        "例如男生:女生 = 7:4，若男生比女生多 51 人，就先看相差 3 份，再求 1 份是多少。"
      ],
      "tips": [
        "若題目有總量，先用總份數求 1 份；若題目有差量，先用相差幾份求 1 份。",
        "圓的周長比和半徑比相同，因為公式都同乘 2π。"
      ],
      "notes": [
        "這一組重點是把複雜敘述快速翻成「幾份」的想法，不急著列方程式。"
      ],
      "mistakes": [
        "把總量題誤看成差量題，或把差量題誤看成總量題。",
        "看到比例後沒有先確認單位是否一致。"
      ]
    },
    "practice-j2-3-1-regular-two-step-drill": {
      "id": "practice-j2-3-1-regular-two-step-drill",
      "enabled": true,
      "mode": "generator",
      "title": "正規題型（二層動作）",
      "generatorKey": "j2-3-1-regular-two-step-drill",
      "difficulty": "medium",
      "questionCount": 7,
      "subtypeCount": 11,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "比例",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-1",
        "比例",
        "正規",
        "二層"
      ],
      "usage": [
        "這一組通常先把關係整理成比例，再做第二步求值或求總量。適合練習設 1 份、設 k 或先化比例再回代。"
      ],
      "examples": [
        "例如先由 7x = 4y 求出 x:y，再去算 2x:3y；或先由男女比與變化後的新比例求原來總數。"
      ],
      "tips": [
        "若題目同時給「比例」與「總量」，通常先設成 x = ak、y = bk。",
        "若有調薪、濃度、面積等情境，先確認變的是哪一部分，別急著直接代數字。"
      ],
      "notes": [
        "這一組是從單純比例進一步走到兩層推理，適合當成比例單元的主力題型。"
      ],
      "mistakes": [
        "只算出比例，卻忘了再利用總量或條件求真正答案。",
        "把百分率、面積比、濃度比直接相加減，沒有先看它代表的意義。"
      ]
    },
    "practice-j2-3-1-advanced-three-step-drill": {
      "id": "practice-j2-3-1-advanced-three-step-drill",
      "enabled": true,
      "mode": "generator",
      "title": "進階題型（三層動作）",
      "generatorKey": "j2-3-1-advanced-three-step-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "上學期",
      "chapter": "比例",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-1",
        "比例",
        "進階",
        "三層"
      ],
      "usage": [
        "這一組要連續做兩到三步轉換，通常要先回推前一個狀態，再利用新舊比例關係求原來或最後的數量。"
      ],
      "examples": [
        "例如先走掉部分男生，再走掉部分女生，最後比改變；或先由原濃度算出食鹽量，再反推加水後總重量。"
      ],
      "tips": [
        "遇到連續變化題，先畫出「原來 → 第一次變化後 → 第二次變化後」的流程。",
        "若是濃度稀釋題，先抓住「溶質重量不變」再列式。"
      ],
      "notes": [
        "這一組比前兩組更重視狀態回推與多步驟整理，適合當作挑戰題。"
      ],
      "mistakes": [
        "只看最後比例，忘了中間還有一層狀態。",
        "把加水後的總重量與原來食鹽重量混在一起。"
      ]
    },
    "practice-j2-3-1-concentration-reverse-drill": {
      "id": "practice-j2-3-1-concentration-reverse-drill",
      "enabled": true,
      "mode": "generator",
      "title": "濃度混合與逆推稀釋題",
      "generatorKey": "j2-3-1-concentration-reverse-drill",
      "difficulty": "challenge",
      "questionCount": 6,
      "subtypeCount": 6,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "比例",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-1",
        "比例",
        "濃度",
        "混合",
        "稀釋"
      ],
      "usage": [
        "把比例、百分率與重量關係結合起來，處理混合、加水、加溶質與加權平均這幾類濃度應用題。"
      ],
      "examples": [
        "例如：300 公克、濃度 10% 的食鹽水若要稀釋成 6%，需要再加多少水？"
      ],
      "tips": [
        "先抓住溶質不變或總量改變的是哪一個，再列出新的濃度關係。",
        "遇到班級及格率或混合濃度時，可先把人數或重量設成比例量。"
      ],
      "notes": [
        "這一組不只是在算百分比，而是把比例觀念套到濃度與加權平均情境。"
      ],
      "mistakes": [
        "把濃度直接相加平均，忽略兩部分的重量不同。",
        "加水或加鹽後，只改分子或只改分母，沒有同時更新總重量。"
      ]
    },
    "practice-j2-3-2-basic-direct-inverse-drill": {
      "id": "practice-j2-3-2-basic-direct-inverse-drill",
      "enabled": true,
      "mode": "generator",
      "title": "基礎正反比運算",
      "generatorKey": "j2-3-2-basic-direct-inverse-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 6,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "正比反比",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-2",
        "正比反比",
        "正比",
        "反比",
        "基礎"
      ],
      "usage": [
        "先用正比 $y=kx$ 或反比 $xy=k$ 的基本定義建立關係，再代值求出比值、關係式或另一個量。"
      ],
      "examples": [
        "例如已知 $x$ 與 $y$ 成反比，當 $x=\\frac{14}{3}$ 時 $y=-\\frac{6}{7}$，就能先求出固定常數，再反推新的 $x$ 或 $y$。"
      ],
      "tips": [
        "看到正比先想 $y=kx$；看到反比先想 $xy=k$。",
        "若題目有分數或小數，先整理成分數再代入，計算會比較穩。"
      ],
      "notes": [
        "這一組重點是先抓住比例常數，再做第二步代值，不要只憑感覺直接猜答案。"
      ],
      "mistakes": [
        "把正比和反比的式子寫反。",
        "已知一組數值後沒有先求出常數 $k$，就直接拿新數值去算。"
      ]
    },
    "practice-j2-3-2-linear-combo-proportion-drill": {
      "id": "practice-j2-3-2-linear-combo-proportion-drill",
      "enabled": true,
      "mode": "generator",
      "title": "線性組合式比例",
      "generatorKey": "j2-3-2-linear-combo-proportion-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "正比反比",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-2",
        "正比反比",
        "線性組合",
        "多項式"
      ],
      "usage": [
        "把括號內的整體先看成一個量，先求比例常數或先反推出 $x:y$，再代入新的條件求值。"
      ],
      "examples": [
        "例如 $(3x-2y):(5x+3y)=7:4$，可以先設 $x:y$ 或設 $x=mk,y=nk$，再求新的比例或某一個未知數。"
      ],
      "tips": [
        "先分清楚哪兩個量在成正比、哪兩個量在成反比。",
        "若題目最後要你求另一個比例，通常先設 $x:y=m:n$ 會最穩。"
      ],
      "notes": [
        "這一組不是直接套公式，而是把整體視為一個量後，再做第二步求值或反推。"
      ],
      "mistakes": [
        "看到多項式就急著展開，忘了先把整個括號看成一個量。",
        "成反比時忘記用乘積固定，而誤寫成比值固定。"
      ]
    },
    "practice-j2-3-2-square-proportion-drill": {
      "id": "practice-j2-3-2-square-proportion-drill",
      "enabled": true,
      "mode": "generator",
      "title": "次方型比例",
      "generatorKey": "j2-3-2-square-proportion-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "正比反比",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-2",
        "正比反比",
        "平方",
        "平方根"
      ],
      "usage": [
        "遇到價值、面積、平方這類情境時，先分清楚是和某個量成正比，還是和那個量的平方成正比。"
      ],
      "examples": [
        "例如已知 $y^2$ 與 $3x$ 成正比，就不是直接設 $y=kx$，而是要設 $y^2=k\\cdot 3x$。"
      ],
      "tips": [
        "看到「平方成正比」就把平方一起留在等式裡。",
        "若要求長度或重量，要記得最後可能要從平方值再回到原來的量。"
      ],
      "notes": [
        "這一組的重點不是算快，而是看懂「誰和誰的平方」在成正比或反比。"
      ],
      "mistakes": [
        "把平方成正比誤看成一次正比。",
        "求出平方值後，忘了題目真正要的是原來的量。"
      ]
    },
    "practice-j2-3-2-chained-variation-drill": {
      "id": "practice-j2-3-2-chained-variation-drill",
      "enabled": true,
      "mode": "generator",
      "title": "正反比鏈接",
      "generatorKey": "j2-3-2-chained-variation-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "正比反比",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-2",
        "正比反比",
        "鏈接",
        "多變量"
      ],
      "usage": [
        "處理三個量之間一層接一層的正比或反比關係，通常要先固定中間量的關係，再串接到最後。"
      ],
      "examples": [
        "例如 $x$ 與 $y$ 成正比、$y$ 與 $z$ 成反比，就可以先由一組已知求出 $y$，再用 $yz$ 固定去找新的 $z$。"
      ],
      "tips": [
        "先畫出誰和誰成正比、誰和誰成反比。",
        "若題目有三個量，不一定一次就能看出來，通常要先解前一層再進到下一層。"
      ],
      "notes": [
        "這一組重點是把「中間量」當成橋樑，逐步串起來，而不是一次把三個量混在一起算。"
      ],
      "mistakes": [
        "把兩層關係混成一層，直接硬套。",
        "前一層算出的新值沒有帶進後一層。"
      ]
    },
    "practice-j2-3-2-percent-change-drill": {
      "id": "practice-j2-3-2-percent-change-drill",
      "enabled": true,
      "mode": "generator",
      "title": "變量百分率異動下的比例計算",
      "generatorKey": "j2-3-2-percent-change-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "正比反比",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-2",
        "正比反比",
        "百分率",
        "變動"
      ],
      "usage": [
        "把「增加幾%」或「減少幾%」先換成倍數，再依正比或反比決定另一個量怎麼變。"
      ],
      "examples": [
        "例如若 $y$ 與 $x$ 成反比，$x$ 變成原來的 $\\frac{3}{5}$，就代表 $y$ 要變成原來的倒數倍數 $\\frac{5}{3}$。"
      ],
      "tips": [
        "先把百分率變成倍數，例如增加 25% 就是乘 $\\frac{5}{4}$。",
        "若是反比，另一個量要用倒數倍數思考。"
      ],
      "notes": [
        "這一組看起來像百分率，其實核心還是比例常數不變。"
      ],
      "mistakes": [
        "把增加 20% 誤看成增加 0.2 個單位。",
        "反比時忘了取倒數，直接照正比方式處理。"
      ]
    },
    "practice-j2-3-2-word-judgment-drill": {
      "id": "practice-j2-3-2-word-judgment-drill",
      "enabled": true,
      "mode": "generator",
      "title": "正反比文字判斷",
      "generatorKey": "j2-3-2-word-judgment-drill",
      "difficulty": "easy",
      "questionCount": 10,
      "subtypeCount": 15,
      "relatedPracticeIds": [],
      "chapterCode": "j2-3-2",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "正比反比",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-3-2",
        "正比反比",
        "文字題",
        "判斷"
      ],
      "usage": [
        "從文字敘述判斷兩個量是成正比、成反比，還是都不是，重點是先寫出關係式再判斷。"
      ],
      "examples": [
        "例如若買漫畫書每本 45 元，買了 $x$ 本共付 $y$ 元，就能寫成 $y=45x$，因此是正比。"
      ],
      "tips": [
        "先寫關係式，再看是不是 $y=kx$ 或 $xy=k$。",
        "若有固定加減項，通常就不是正比，也不是反比。"
      ],
      "notes": [
        "這一組不是在算數值，而是在訓練看懂文字後，快速判斷關係式屬於哪一類。"
      ],
      "mistakes": [
        "看到兩個量一起增加就誤判成正比。",
        "沒有先列式，只靠感覺判斷，容易把「都不是」誤看成正比或反比。"
      ]
    },
    "practice-j2-4-1-inequality-language-drill": {
      "id": "practice-j2-4-1-inequality-language-drill",
      "enabled": true,
      "mode": "generator",
      "title": "基本判定與直覺題",
      "generatorKey": "j2-4-1-inequality-language-drill",
      "difficulty": "easy",
      "questionCount": 8,
      "subtypeCount": 9,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-1",
        "一元一次不等式",
        "基本判定與直覺題",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-4-1-inequality-integer-drill": {
      "id": "practice-j2-4-1-inequality-integer-drill",
      "enabled": true,
      "mode": "generator",
      "title": "正規解不等式（整數型）",
      "generatorKey": "j2-4-1-inequality-integer-drill",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-1",
        "一元一次不等式",
        "正規解不等式（整數型）",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-4-1-inequality-fraction-drill": {
      "id": "practice-j2-4-1-inequality-fraction-drill",
      "enabled": true,
      "mode": "generator",
      "title": "進階運算題（分數型）",
      "generatorKey": "j2-4-1-inequality-fraction-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-1",
        "一元一次不等式",
        "進階運算題（分數型）",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-4-1-inequality-decimal-drill": {
      "id": "practice-j2-4-1-inequality-decimal-drill",
      "enabled": true,
      "mode": "generator",
      "title": "進階運算題（小數型）",
      "generatorKey": "j2-4-1-inequality-decimal-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-1",
        "一元一次不等式",
        "進階運算題（小數型）",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-4-1-inequality-range-drill": {
      "id": "practice-j2-4-1-inequality-range-drill",
      "enabled": true,
      "mode": "generator",
      "title": "範圍推導",
      "generatorKey": "j2-4-1-inequality-range-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 6,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-1",
        "一元一次不等式",
        "範圍推導",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-4-1-inequality-reverse-coeff-drill": {
      "id": "practice-j2-4-1-inequality-reverse-coeff-drill",
      "enabled": true,
      "mode": "generator",
      "title": "由解逆推原不等式中的未知係數",
      "generatorKey": "j2-4-1-inequality-reverse-coeff-drill",
      "difficulty": "hard",
      "questionCount": 6,
      "subtypeCount": 5,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-1",
        "一元一次不等式",
        "由解逆推原不等式中的未知係數",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-4-1-inequality-known-solution-range-drill": {
      "id": "practice-j2-4-1-inequality-known-solution-range-drill",
      "enabled": true,
      "mode": "generator",
      "title": "已知解反求參數範圍",
      "generatorKey": "j2-4-1-inequality-known-solution-range-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-1",
        "一元一次不等式",
        "已知解反求參數範圍",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-4-1-inequality-same-solution-drill": {
      "id": "practice-j2-4-1-inequality-same-solution-drill",
      "enabled": true,
      "mode": "generator",
      "title": "綜合應用題（兩不等式解相同）",
      "generatorKey": "j2-4-1-inequality-same-solution-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-1",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-1",
        "一元一次不等式",
        "綜合應用題（兩不等式解相同）",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-4-2-basic-word-drill": {
      "id": "practice-j2-4-2-basic-word-drill",
      "enabled": true,
      "mode": "generator",
      "title": "基本題型（單層動作）",
      "generatorKey": "j2-4-2-basic-word-drill",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 6,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-2",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-2",
        "一元一次不等式應用問題",
        "基本題型（單層動作）",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-4-2-regular-word-drill": {
      "id": "practice-j2-4-2-regular-word-drill",
      "enabled": true,
      "mode": "generator",
      "title": "正規題型（二層動作）",
      "generatorKey": "j2-4-2-regular-word-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 6,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-2",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-2",
        "一元一次不等式應用問題",
        "正規題型（二層動作）",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j2-4-2-advanced-word-drill": {
      "id": "practice-j2-4-2-advanced-word-drill",
      "enabled": true,
      "mode": "generator",
      "title": "進階題型（三層動作）",
      "generatorKey": "j2-4-2-advanced-word-drill",
      "difficulty": "hard",
      "questionCount": 7,
      "subtypeCount": 7,
      "relatedPracticeIds": [],
      "chapterCode": "j2-4-2",
      "stage": "國中",
      "grade": "國一",
      "term": "下學期",
      "chapter": "一元一次不等式應用問題",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j2-4-2",
        "一元一次不等式應用問題",
        "進階題型（三層動作）",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-1-formula-mixed-variable-drill": {
      "id": "practice-j3-1-1-formula-mixed-variable-drill",
      "enabled": true,
      "mode": "generator",
      "title": "乘法公式綜合版（未知數）",
      "generatorKey": "j3-1-1-formula-mixed-variable-drill",
      "difficulty": "medium",
      "questionCount": 4,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "乘法公式",
        "未知數版",
        "綜合版",
        "無限練習"
      ],
      "usage": [
        "一次混合和平方、差平方、平方差展開與平方差分解四種未知數題型。"
      ],
      "examples": [
        "例：和平方、差平方、平方差展開、平方差分解各出一題。"
      ],
      "tips": [
        "先辨認是哪一種乘法公式，再決定要展開還是分解。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-1-formula-mixed-integer-drill": {
      "id": "practice-j3-1-1-formula-mixed-integer-drill",
      "enabled": true,
      "mode": "generator",
      "title": "乘法公式綜合（整數版）",
      "generatorKey": "j3-1-1-formula-mixed-integer-drill",
      "difficulty": "easy",
      "questionCount": 4,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "乘法公式",
        "整數版",
        "無限練習"
      ],
      "usage": [
        "一次混合和平方、差平方、共軛乘法與平方差值。"
      ],
      "examples": [
        "例：$101^2$、$99^2$、$101×99$、$101^2-99^2$。"
      ],
      "tips": [
        "先看成 100附近的數，再判斷要套和平方、差平方或平方差。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-1-formula-mixed-decimal-drill": {
      "id": "practice-j3-1-1-formula-mixed-decimal-drill",
      "enabled": true,
      "mode": "generator",
      "title": "乘法公式綜合（小數版）",
      "generatorKey": "j3-1-1-formula-mixed-decimal-drill",
      "difficulty": "easy",
      "questionCount": 4,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "乘法公式",
        "小數版",
        "無限練習"
      ],
      "usage": [
        "把小數看成 100附近的數，直接利用公式快算。"
      ],
      "examples": [
        "例：$100.4^2$、$99.6^2$、$100.4×99.6$、$100.4^2-99.6^2$。"
      ],
      "tips": [
        "先看出與 100 的差值，再套公式。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-1-formula-mixed-fraction-drill": {
      "id": "practice-j3-1-1-formula-mixed-fraction-drill",
      "enabled": true,
      "mode": "generator",
      "title": "乘法公式綜合（分數版）",
      "generatorKey": "j3-1-1-formula-mixed-fraction-drill",
      "difficulty": "medium",
      "questionCount": 4,
      "subtypeCount": 4,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "乘法公式",
        "分數版",
        "無限練習"
      ],
      "usage": [
        "帶分數也可以視為 100附近的數，利用公式化簡。"
      ],
      "examples": [
        "例：$100\\frac{3}{5}^2$、$99\\frac{2}{5}^2$、$100\\frac{3}{5}\\times99\\frac{2}{5}$、$100\\frac{3}{5}^2-99\\frac{2}{5}^2$。"
      ],
      "tips": [
        "先寫成 100加或減一個分數的形式再套用公式。"
      ],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-polynomial-add-subtract-drill": {
      "id": "practice-j3-1-2-polynomial-add-subtract-drill",
      "enabled": true,
      "mode": "generator",
      "title": "多項式加減運算（樣式與直式）",
      "generatorKey": "j3-1-2-polynomial-add-subtract-drill",
      "difficulty": "easy",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-2",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "加減運算",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-degree-constraint-drill": {
      "id": "practice-j3-1-2-degree-constraint-drill",
      "enabled": true,
      "mode": "generator",
      "title": "根據次數性質反求參數",
      "generatorKey": "j3-1-2-degree-constraint-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-2",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "次數判別",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-polynomial-reverse-application-drill": {
      "id": "practice-j3-1-2-polynomial-reverse-application-drill",
      "enabled": true,
      "mode": "generator",
      "title": "多項式逆推應用",
      "generatorKey": "j3-1-2-polynomial-reverse-application-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-2",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "逆推",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-mul-easy-mixed-drill": {
      "id": "practice-j3-1-2-mul-easy-mixed-drill",
      "enabled": true,
      "mode": "generator",
      "title": "多項式乘法（簡易版）",
      "generatorKey": "j3-1-2-mul-easy-mixed-drill",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 5,
      "relatedPracticeIds": [
        "practice-j3-1-2-mul-mono-mono-drill",
        "practice-j3-1-2-mul-mono-linear-drill",
        "practice-j3-1-2-mul-mono-quadratic-drill"
      ],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "乘法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-mul-mono-mono-drill": {
      "id": "practice-j3-1-2-mul-mono-mono-drill",
      "enabled": true,
      "mode": "generator",
      "title": "單項式 × 單項式",
      "generatorKey": "j3-1-2-mul-mono-mono-drill",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "乘法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-mul-mono-linear-drill": {
      "id": "practice-j3-1-2-mul-mono-linear-drill",
      "enabled": true,
      "mode": "generator",
      "title": "單項式 × 一次多項式",
      "generatorKey": "j3-1-2-mul-mono-linear-drill",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "乘法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-mul-mono-quadratic-drill": {
      "id": "practice-j3-1-2-mul-mono-quadratic-drill",
      "enabled": true,
      "mode": "generator",
      "title": "單項式 × 二次多項式",
      "generatorKey": "j3-1-2-mul-mono-quadratic-drill",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "乘法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-mul-advanced-mixed-drill": {
      "id": "practice-j3-1-2-mul-advanced-mixed-drill",
      "enabled": true,
      "mode": "generator",
      "title": "進階多項式乘法",
      "generatorKey": "j3-1-2-mul-advanced-mixed-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 3,
      "relatedPracticeIds": [
        "practice-j3-1-2-mul-linear-linear-drill",
        "practice-j3-1-2-mul-linear-quadratic-drill",
        "practice-j3-1-2-mul-quadratic-quadratic-drill"
      ],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "乘法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-mul-linear-linear-drill": {
      "id": "practice-j3-1-2-mul-linear-linear-drill",
      "enabled": true,
      "mode": "generator",
      "title": "一次式 × 一次式",
      "generatorKey": "j3-1-2-mul-linear-linear-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "乘法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-mul-linear-quadratic-drill": {
      "id": "practice-j3-1-2-mul-linear-quadratic-drill",
      "enabled": true,
      "mode": "generator",
      "title": "一次式 × 二次式",
      "generatorKey": "j3-1-2-mul-linear-quadratic-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "乘法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-mul-quadratic-quadratic-drill": {
      "id": "practice-j3-1-2-mul-quadratic-quadratic-drill",
      "enabled": true,
      "mode": "generator",
      "title": "二次式 × 二次式",
      "generatorKey": "j3-1-2-mul-quadratic-quadratic-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "乘法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-div-monomial-mixed-drill": {
      "id": "practice-j3-1-2-div-monomial-mixed-drill",
      "enabled": true,
      "mode": "generator",
      "title": "多項式除以單項式",
      "generatorKey": "j3-1-2-div-monomial-mixed-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 3,
      "relatedPracticeIds": [
        "practice-j3-1-2-div-mono-by-mono-drill",
        "practice-j3-1-2-div-binomial-by-mono-drill",
        "practice-j3-1-2-div-trinomial-by-mono-drill"
      ],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "除法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-div-mono-by-mono-drill": {
      "id": "practice-j3-1-2-div-mono-by-mono-drill",
      "enabled": true,
      "mode": "generator",
      "title": "單項式 ÷ 單項式",
      "generatorKey": "j3-1-2-div-mono-by-mono-drill",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "除法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-div-binomial-by-mono-drill": {
      "id": "practice-j3-1-2-div-binomial-by-mono-drill",
      "enabled": true,
      "mode": "generator",
      "title": "二項式 ÷ 單項式",
      "generatorKey": "j3-1-2-div-binomial-by-mono-drill",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "除法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-2-div-trinomial-by-mono-drill": {
      "id": "practice-j3-1-2-div-trinomial-by-mono-drill",
      "enabled": true,
      "mode": "generator",
      "title": "三項式 ÷ 單項式（含餘數）",
      "generatorKey": "j3-1-2-div-trinomial-by-mono-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "除法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-3-polynomial-division-regular-drill": {
      "id": "practice-j3-1-3-polynomial-division-regular-drill",
      "enabled": true,
      "mode": "generator",
      "title": "多項式除法正常版（含分數與餘數）",
      "generatorKey": "j3-1-3-polynomial-division-regular-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 2,
      "relatedPracticeIds": [
        "practice-cubic-divide-linear",
        "practice-cubic-divide-quadratic"
      ],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "除法",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-2-3-triple-expand-drill": {
      "id": "practice-j3-2-3-triple-expand-drill",
      "enabled": true,
      "mode": "generator",
      "title": "畢氏數擴展與倍數",
      "generatorKey": "j3-2-3-triple-expand-drill",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j3-2-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "畢氏定理",
      "domain": "幾何",
      "prompt": "",
      "answer": "",
      "tags": [
        "畢氏數",
        "倍數",
        "根號邊長",
        "無限練習"
      ],
      "usage": [
        "練習畢氏數放大縮小、根號邊長與兩邊求第三邊。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-2-3-hypotenuse-altitude-drill": {
      "id": "practice-j3-2-3-hypotenuse-altitude-drill",
      "enabled": true,
      "mode": "generator",
      "title": "斜邊高與面積性質",
      "generatorKey": "j3-2-3-hypotenuse-altitude-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 2,
      "relatedPracticeIds": [],
      "chapterCode": "j3-2-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "畢氏定理",
      "domain": "幾何",
      "prompt": "",
      "answer": "",
      "tags": [
        "斜邊高",
        "面積",
        "畢氏定理",
        "無限練習"
      ],
      "usage": [
        "練習 h=ab/c 與面積反推斜邊高。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-2-3-coordinate-distance-drill": {
      "id": "practice-j3-2-3-coordinate-distance-drill",
      "enabled": true,
      "mode": "generator",
      "title": "座標平面兩點距離",
      "generatorKey": "j3-2-3-coordinate-distance-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j3-2-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "畢氏定理",
      "domain": "幾何",
      "prompt": "",
      "answer": "",
      "tags": [
        "座標",
        "距離公式",
        "未知座標",
        "無限練習"
      ],
      "usage": [
        "練習兩點距離、到原點距離與未知座標反推。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-2-3-spatial-diagonal-drill": {
      "id": "practice-j3-2-3-spatial-diagonal-drill",
      "enabled": true,
      "mode": "generator",
      "title": "立體圖形空間對角線",
      "generatorKey": "j3-2-3-spatial-diagonal-drill",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j3-2-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "畢氏定理",
      "domain": "幾何",
      "prompt": "",
      "answer": "",
      "tags": [
        "空間對角線",
        "長方體",
        "圓柱最短路徑",
        "無限練習"
      ],
      "usage": [
        "練習平面畢氏擴展到三維與展開圖最短距離。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-1-core-factoring-mixed": {
      "id": "practice-j3-3-1-core-factoring-mixed",
      "enabled": true,
      "mode": "generator",
      "title": "因式分解核心綜合（公因式）",
      "generatorKey": "j3-3-1-core-factoring-mixed",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 3,
      "relatedPracticeIds": [
        "practice-j3-3-1-common-factor-basic",
        "practice-j3-3-1-common-factor-polynomial",
        "practice-j3-3-1-sign-transform-factoring"
      ],
      "chapterCode": "j3-3-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-1",
        "公因式",
        "綜合",
        "無限練習"
      ],
      "usage": [
        "把 1~3 類做成同一組綜合練習。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-1-common-factor-basic": {
      "id": "practice-j3-3-1-common-factor-basic",
      "enabled": true,
      "mode": "generator",
      "title": "基礎單項提取",
      "generatorKey": "j3-3-1-common-factor-basic",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-1",
        "公因式",
        "單項式",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-1-common-factor-polynomial": {
      "id": "practice-j3-3-1-common-factor-polynomial",
      "enabled": true,
      "mode": "generator",
      "title": "多項式式子提取",
      "generatorKey": "j3-3-1-common-factor-polynomial",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-1",
        "公因式",
        "多項式",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-1-sign-transform-factoring": {
      "id": "practice-j3-3-1-sign-transform-factoring",
      "enabled": true,
      "mode": "generator",
      "title": "變號法則應用",
      "generatorKey": "j3-3-1-sign-transform-factoring",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-1",
        "變號",
        "因式分解",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-1-grouping-advanced-mixed": {
      "id": "practice-j3-3-1-grouping-advanced-mixed",
      "enabled": true,
      "mode": "generator",
      "title": "分組分解進階綜合",
      "generatorKey": "j3-3-1-grouping-advanced-mixed",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 2,
      "relatedPracticeIds": [
        "practice-j3-3-1-grouping-factor",
        "practice-j3-3-1-expand-then-group"
      ],
      "chapterCode": "j3-3-1",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-1",
        "分組分解",
        "綜合",
        "無限練習"
      ],
      "usage": [
        "把 4~5 類做成同一組綜合練習。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-1-grouping-factor": {
      "id": "practice-j3-3-1-grouping-factor",
      "enabled": true,
      "mode": "generator",
      "title": "分組分解",
      "generatorKey": "j3-3-1-grouping-factor",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-1",
        "分組分解",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-1-expand-then-group": {
      "id": "practice-j3-3-1-expand-then-group",
      "enabled": true,
      "mode": "generator",
      "title": "先去括號再分組",
      "generatorKey": "j3-3-1-expand-then-group",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-1",
        "先展開",
        "再分組",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-2-formula-mixed": {
      "id": "practice-j3-3-2-formula-mixed",
      "enabled": true,
      "mode": "generator",
      "title": "公式辨識與應用綜合",
      "generatorKey": "j3-3-2-formula-mixed",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 4,
      "relatedPracticeIds": [
        "practice-j3-3-2-diff-squares",
        "practice-j3-3-2-perfect-square",
        "practice-j3-3-2-composite-formula",
        "practice-j3-3-2-substitution-formula"
      ],
      "chapterCode": "j3-3-2",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-2",
        "因式分解",
        "公式",
        "綜合"
      ],
      "usage": [
        "四小類整合成一個大類練習。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-2-diff-squares": {
      "id": "practice-j3-3-2-diff-squares",
      "enabled": true,
      "mode": "generator",
      "title": "平方差公式基礎",
      "generatorKey": "j3-3-2-diff-squares",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-2",
        "平方差",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-2-perfect-square": {
      "id": "practice-j3-3-2-perfect-square",
      "enabled": true,
      "mode": "generator",
      "title": "完全平方公式基礎",
      "generatorKey": "j3-3-2-perfect-square",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-2",
        "完全平方",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-2-composite-formula": {
      "id": "practice-j3-3-2-composite-formula",
      "enabled": true,
      "mode": "generator",
      "title": "複合運算（先提公因式）",
      "generatorKey": "j3-3-2-composite-formula",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-2",
        "先提公因式",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-2-substitution-formula": {
      "id": "practice-j3-3-2-substitution-formula",
      "enabled": true,
      "mode": "generator",
      "title": "多項式換項（括號型）",
      "generatorKey": "j3-3-2-substitution-formula",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-2",
        "換項",
        "代換",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-3-cross-core-mixed": {
      "id": "practice-j3-3-3-cross-core-mixed",
      "enabled": true,
      "mode": "generator",
      "title": "十字交乘核心綜合",
      "generatorKey": "j3-3-3-cross-core-mixed",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 3,
      "relatedPracticeIds": [
        "practice-j3-3-3-cross-coeff-one",
        "practice-j3-3-3-cross-coeff-nonone",
        "practice-j3-3-3-cross-preprocess"
      ],
      "chapterCode": "j3-3-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-3",
        "十字交乘",
        "綜合",
        "無限練習"
      ],
      "usage": [
        "前三小類整合成一大類。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-3-cross-coeff-one": {
      "id": "practice-j3-3-3-cross-coeff-one",
      "enabled": true,
      "mode": "generator",
      "title": "係數為 1 基礎類",
      "generatorKey": "j3-3-3-cross-coeff-one",
      "difficulty": "easy",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-3",
        "十字交乘",
        "係數1",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-3-cross-coeff-nonone": {
      "id": "practice-j3-3-3-cross-coeff-nonone",
      "enabled": true,
      "mode": "generator",
      "title": "係數不為 1 進階類",
      "generatorKey": "j3-3-3-cross-coeff-nonone",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-3",
        "十字交乘",
        "係數非1",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-3-cross-preprocess": {
      "id": "practice-j3-3-3-cross-preprocess",
      "enabled": true,
      "mode": "generator",
      "title": "負號與公因數預處理",
      "generatorKey": "j3-3-3-cross-preprocess",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-3",
        "預處理",
        "公因數",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-3-cross-sub-mixed": {
      "id": "practice-j3-3-3-cross-sub-mixed",
      "enabled": true,
      "mode": "generator",
      "title": "十字交乘換元綜合",
      "generatorKey": "j3-3-3-cross-sub-mixed",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 2,
      "relatedPracticeIds": [
        "practice-j3-3-3-cross-substitution",
        "practice-j3-3-3-cross-structured"
      ],
      "chapterCode": "j3-3-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-3",
        "十字交乘",
        "換元",
        "綜合"
      ],
      "usage": [
        "第二組二小類整合成一大類。"
      ],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-3-cross-substitution": {
      "id": "practice-j3-3-3-cross-substitution",
      "enabled": true,
      "mode": "generator",
      "title": "代換換元十字交乘",
      "generatorKey": "j3-3-3-cross-substitution",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-3",
        "代換",
        "十字交乘",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-3-3-cross-structured": {
      "id": "practice-j3-3-3-cross-structured",
      "enabled": true,
      "mode": "generator",
      "title": "括號型結構十字交乘",
      "generatorKey": "j3-3-3-cross-structured",
      "difficulty": "medium",
      "questionCount": 6,
      "subtypeCount": 1,
      "relatedPracticeIds": [],
      "chapterCode": "",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "因式分解",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "j3-3-3",
        "括號型",
        "十字交乘",
        "子練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-3-reverse-division-drill": {
      "id": "practice-j3-1-3-reverse-division-drill",
      "enabled": true,
      "mode": "generator",
      "title": "反面出題（已知商、餘）",
      "generatorKey": "j3-1-3-reverse-division-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "除法",
        "逆推",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-3-coeff-sum-drill": {
      "id": "practice-j3-1-3-coeff-sum-drill",
      "enabled": true,
      "mode": "generator",
      "title": "係數和與常數項題型",
      "generatorKey": "j3-1-3-coeff-sum-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "係數和",
        "常數項",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-3-remainder-theorem-drill": {
      "id": "practice-j3-1-3-remainder-theorem-drill",
      "enabled": true,
      "mode": "generator",
      "title": "餘式定理應用題型",
      "generatorKey": "j3-1-3-remainder-theorem-drill",
      "difficulty": "medium",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "餘式定理",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    },
    "practice-j3-1-3-factor-theorem-drill": {
      "id": "practice-j3-1-3-factor-theorem-drill",
      "enabled": true,
      "mode": "generator",
      "title": "因式定理與未知係數判定",
      "generatorKey": "j3-1-3-factor-theorem-drill",
      "difficulty": "hard",
      "questionCount": 5,
      "subtypeCount": 3,
      "relatedPracticeIds": [],
      "chapterCode": "j3-1-3",
      "stage": "國中",
      "grade": "國二",
      "term": "上學期",
      "chapter": "乘法公式與多項式",
      "domain": "代數",
      "prompt": "",
      "answer": "",
      "tags": [
        "多項式",
        "因式定理",
        "未知係數",
        "無限練習"
      ],
      "usage": [],
      "examples": [],
      "tips": [],
      "notes": [],
      "mistakes": []
    }
  },
  "bindings": [
    {
      "practiceId": "practice-abs-both-sides-advanced-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-abs-equation-leading-not-one-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-abs-equation-leading-one-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j1-1-2-average-baseline-mixed",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j1-1-3-sign-brackets-power-drill",
      "targetType": "chapter",
      "targetId": "j1-1-3",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j1-1-4-scientific-convert-drill",
      "targetType": "chapter",
      "targetId": "j1-1-4",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j1-2-3-fraction-add-sub-brackets-drill",
      "targetType": "chapter",
      "targetId": "j1-2-3",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j1-3-3-purchase-discount-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j2-1-1-evaluate-expression-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j2-1-2-substitution-basic-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j2-1-3-money-ticket-drill",
      "targetType": "chapter",
      "targetId": "j2-1-3",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j2-2-1-axis-distance-drill",
      "targetType": "chapter",
      "targetId": "j2-2-1",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j2-2-2-point-line-relation-drill",
      "targetType": "chapter",
      "targetId": "j2-2-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j2-3-1-ratio-simplify-drill",
      "targetType": "chapter",
      "targetId": "j2-3-1",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j2-3-2-basic-direct-inverse-drill",
      "targetType": "chapter",
      "targetId": "j2-3-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j2-4-1-inequality-language-drill",
      "targetType": "chapter",
      "targetId": "j2-4-1",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j2-4-2-basic-word-drill",
      "targetType": "chapter",
      "targetId": "j2-4-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j3-1-2-polynomial-add-subtract-drill",
      "targetType": "chapter",
      "targetId": "j3-1-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-midpoint-formula",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-nonnegative-sum-fixed-multix-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-nonnegative-sum-fixed-one-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-nonnegative-sum-zero-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 1
    },
    {
      "practiceId": "practice-j1-1-3-exponent-law-single-rule-drill",
      "targetType": "chapter",
      "targetId": "j1-1-3",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j1-1-4-scientific-digit-reading-drill",
      "targetType": "chapter",
      "targetId": "j1-1-4",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j1-2-3-fraction-add-sub-negative-drill",
      "targetType": "chapter",
      "targetId": "j1-2-3",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j1-3-3-allocation-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j2-1-1-expression-simplify-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j2-1-2-elimination-adjustment-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j2-1-3-heads-coins-score-drill",
      "targetType": "chapter",
      "targetId": "j2-1-3",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j2-2-1-quadrant-basic-drill",
      "targetType": "chapter",
      "targetId": "j2-2-1",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j2-2-2-intercept-area-drill",
      "targetType": "chapter",
      "targetId": "j2-2-2",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j2-3-1-proportion-solve-drill",
      "targetType": "chapter",
      "targetId": "j2-3-1",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j2-3-2-linear-combo-proportion-drill",
      "targetType": "chapter",
      "targetId": "j2-3-2",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j2-4-1-inequality-integer-drill",
      "targetType": "chapter",
      "targetId": "j2-4-1",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j2-4-2-regular-word-drill",
      "targetType": "chapter",
      "targetId": "j2-4-2",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j3-1-2-degree-constraint-drill",
      "targetType": "chapter",
      "targetId": "j3-1-2",
      "enabled": true,
      "order": 2
    },
    {
      "practiceId": "practice-j1-1-3-exponent-law-mixed-rule-drill",
      "targetType": "chapter",
      "targetId": "j1-1-3",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j1-1-4-scientific-compare-drill",
      "targetType": "chapter",
      "targetId": "j1-1-4",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j1-2-3-fraction-add-sub-absolute-drill",
      "targetType": "chapter",
      "targetId": "j1-2-3",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j1-3-3-age-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j2-1-1-distribute-expand-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j2-1-2-fraction-decimal-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j2-1-3-digit-placevalue-drill",
      "targetType": "chapter",
      "targetId": "j2-1-3",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j2-2-1-translation-basic-drill",
      "targetType": "chapter",
      "targetId": "j2-2-1",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j2-2-2-quadrant-exclusion-drill",
      "targetType": "chapter",
      "targetId": "j2-2-2",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j2-3-1-relation-transform-drill",
      "targetType": "chapter",
      "targetId": "j2-3-1",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j2-3-2-square-proportion-drill",
      "targetType": "chapter",
      "targetId": "j2-3-2",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j2-4-1-inequality-fraction-drill",
      "targetType": "chapter",
      "targetId": "j2-4-1",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j2-4-2-advanced-word-drill",
      "targetType": "chapter",
      "targetId": "j2-4-2",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j3-1-1-formula-mixed-integer-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j3-1-2-polynomial-reverse-application-drill",
      "targetType": "chapter",
      "targetId": "j3-1-2",
      "enabled": true,
      "order": 3
    },
    {
      "practiceId": "practice-j1-1-3-exponent-mixed-operations-drill",
      "targetType": "chapter",
      "targetId": "j1-1-3",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j1-1-4-scientific-mul-div-drill",
      "targetType": "chapter",
      "targetId": "j1-1-4",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j1-2-3-fraction-mul-div-mixed-drill",
      "targetType": "chapter",
      "targetId": "j1-2-3",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j1-3-3-speed-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j2-1-1-fraction-simplify-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j2-1-2-solution-type-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j2-1-3-age-chase-drill",
      "targetType": "chapter",
      "targetId": "j2-1-3",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j2-2-1-axis-special-drill",
      "targetType": "chapter",
      "targetId": "j2-2-1",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j2-2-2-parallel-perpendicular-drill",
      "targetType": "chapter",
      "targetId": "j2-2-2",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j2-3-1-k-method-drill",
      "targetType": "chapter",
      "targetId": "j2-3-1",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j2-3-2-chained-variation-drill",
      "targetType": "chapter",
      "targetId": "j2-3-2",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j2-4-1-inequality-decimal-drill",
      "targetType": "chapter",
      "targetId": "j2-4-1",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j3-1-1-formula-mixed-decimal-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j3-1-2-mul-easy-mixed-drill",
      "targetType": "chapter",
      "targetId": "j3-1-3",
      "enabled": true,
      "order": 4
    },
    {
      "practiceId": "practice-j1-1-3-exponent-word-problem-drill",
      "targetType": "chapter",
      "targetId": "j1-1-3",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j1-1-4-scientific-add-sub-drill",
      "targetType": "chapter",
      "targetId": "j1-1-4",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j1-2-3-fraction-distributive-common-factor-drill",
      "targetType": "chapter",
      "targetId": "j1-2-3",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j1-3-3-heads-coins-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j2-1-1-context-to-equation-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j2-1-2-triple-equal-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j2-1-3-speed-chase-drill",
      "targetType": "chapter",
      "targetId": "j2-1-3",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j2-2-1-midpoint-drill",
      "targetType": "chapter",
      "targetId": "j2-2-1",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j2-2-2-line-from-points-drill",
      "targetType": "chapter",
      "targetId": "j2-2-2",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j2-3-1-basic-single-step-drill",
      "targetType": "chapter",
      "targetId": "j2-3-1",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j2-3-2-percent-change-drill",
      "targetType": "chapter",
      "targetId": "j2-3-2",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j2-4-1-inequality-range-drill",
      "targetType": "chapter",
      "targetId": "j2-4-1",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j3-1-1-formula-mixed-fraction-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 5
    },
    {
      "practiceId": "practice-j1-1-4-scientific-unit-conversion-drill",
      "targetType": "chapter",
      "targetId": "j1-1-4",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j1-2-3-fraction-distributive-regroup-drill",
      "targetType": "chapter",
      "targetId": "j1-2-3",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j1-3-3-work-rate-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j2-1-1-ordered-pair-check-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j2-1-2-symmetric-system-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j2-1-3-allocation-work-drill",
      "targetType": "chapter",
      "targetId": "j2-1-3",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j2-2-1-symmetry-drill",
      "targetType": "chapter",
      "targetId": "j2-2-1",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j2-2-2-only-two-quadrants-drill",
      "targetType": "chapter",
      "targetId": "j2-2-2",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j2-3-1-regular-two-step-drill",
      "targetType": "chapter",
      "targetId": "j2-3-1",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j2-3-2-word-judgment-drill",
      "targetType": "chapter",
      "targetId": "j2-3-2",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j2-4-1-inequality-reverse-coeff-drill",
      "targetType": "chapter",
      "targetId": "j2-4-1",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j3-1-1-formula-mixed-variable-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 6
    },
    {
      "practiceId": "practice-j1-1-4-scientific-normalize-drill",
      "targetType": "chapter",
      "targetId": "j1-1-4",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-j1-2-3-telescoping-product-drill",
      "targetType": "chapter",
      "targetId": "j1-2-3",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-j1-3-3-fraction-remainder-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-j2-1-1-integer-constraint-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-j2-1-2-abs-zero-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-j2-1-3-tiered-fee-drill",
      "targetType": "chapter",
      "targetId": "j2-1-3",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-j2-2-1-area-drill",
      "targetType": "chapter",
      "targetId": "j2-2-1",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-j2-2-2-point-translation-line-drill",
      "targetType": "chapter",
      "targetId": "j2-2-2",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-j2-3-1-advanced-three-step-drill",
      "targetType": "chapter",
      "targetId": "j2-3-1",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-j2-4-1-inequality-known-solution-range-drill",
      "targetType": "chapter",
      "targetId": "j2-4-1",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-sum-square-variable-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 7
    },
    {
      "practiceId": "practice-difference-square-variable-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j1-2-3-telescoping-adjacent-sum-drill",
      "targetType": "chapter",
      "targetId": "j1-2-3",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j1-3-3-score-penalty-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j2-1-1-equivalent-transform-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j2-1-2-known-solution-coeff-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j2-1-3-classical-text-drill",
      "targetType": "chapter",
      "targetId": "j2-1-3",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j2-2-1-quadrant-reasoning-drill",
      "targetType": "chapter",
      "targetId": "j2-2-1",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j2-2-2-two-lines-area-drill",
      "targetType": "chapter",
      "targetId": "j2-2-2",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j2-3-1-concentration-reverse-drill",
      "targetType": "chapter",
      "targetId": "j2-3-1",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j2-4-1-inequality-same-solution-drill",
      "targetType": "chapter",
      "targetId": "j2-4-1",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j3-1-2-mul-advanced-mixed-drill",
      "targetType": "chapter",
      "targetId": "j3-1-3",
      "enabled": true,
      "order": 8
    },
    {
      "practiceId": "practice-j1-2-3-telescoping-gap-four-sum-drill",
      "targetType": "chapter",
      "targetId": "j1-2-3",
      "enabled": true,
      "order": 9
    },
    {
      "practiceId": "practice-j1-3-3-mixture-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 9
    },
    {
      "practiceId": "practice-j2-1-1-solve-for-variable-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 9
    },
    {
      "practiceId": "practice-j2-1-2-error-diagnosis-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 9
    },
    {
      "practiceId": "practice-j2-2-1-nonnegative-drill",
      "targetType": "chapter",
      "targetId": "j2-2-1",
      "enabled": true,
      "order": 9
    },
    {
      "practiceId": "practice-square-difference-variable-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 9
    },
    {
      "practiceId": "practice-j1-3-3-tiered-fee-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 10
    },
    {
      "practiceId": "practice-j2-1-1-expression-classify-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 10
    },
    {
      "practiceId": "practice-j2-1-2-shared-solution-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 10
    },
    {
      "practiceId": "practice-square-difference-factorization-variable-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 10
    },
    {
      "practiceId": "practice-j1-3-3-clock-angle-application-drill",
      "targetType": "chapter",
      "targetId": "j1-3-3",
      "enabled": true,
      "order": 11
    },
    {
      "practiceId": "practice-j2-1-1-parameter-substitution-drill",
      "targetType": "chapter",
      "targetId": "j2-1-1",
      "enabled": true,
      "order": 11
    },
    {
      "practiceId": "practice-j2-1-2-third-condition-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 11
    },
    {
      "practiceId": "practice-j2-1-2-special-reverse-drill",
      "targetType": "chapter",
      "targetId": "j2-1-2",
      "enabled": true,
      "order": 12
    },
    {
      "practiceId": "practice-j3-1-2-div-monomial-mixed-drill",
      "targetType": "chapter",
      "targetId": "j3-1-3",
      "enabled": true,
      "order": 12
    },
    {
      "practiceId": "practice-j3-1-3-polynomial-division-regular-drill",
      "targetType": "chapter",
      "targetId": "j3-1-3",
      "enabled": true,
      "order": 16
    },
    {
      "practiceId": "practice-j3-1-3-reverse-division-drill",
      "targetType": "chapter",
      "targetId": "j3-1-3",
      "enabled": true,
      "order": 17
    },
    {
      "practiceId": "practice-j3-1-3-coeff-sum-drill",
      "targetType": "chapter",
      "targetId": "j3-1-3",
      "enabled": true,
      "order": 18
    },
    {
      "practiceId": "practice-j3-1-3-remainder-theorem-drill",
      "targetType": "chapter",
      "targetId": "j3-1-3",
      "enabled": true,
      "order": 19
    },
    {
      "practiceId": "practice-j3-1-3-factor-theorem-drill",
      "targetType": "chapter",
      "targetId": "j3-1-3",
      "enabled": true,
      "order": 20
    },
    {
      "practiceId": "practice-identity-value-pair-mixed-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 23
    },
    {
      "practiceId": "practice-identity-value-pair-advanced-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 24
    },
    {
      "practiceId": "practice-identity-value-integer-basic-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 27
    },
    {
      "practiceId": "practice-identity-value-linear-combination-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 31
    },
    {
      "practiceId": "practice-identity-value-reciprocal-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 32
    },
    {
      "practiceId": "practice-identity-value-reciprocal-reverse-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 33
    },
    {
      "practiceId": "practice-identity-value-reciprocal-mixed-fraction-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 34
    },
    {
      "practiceId": "practice-identity-value-mixed-advanced-drill",
      "targetType": "chapter",
      "targetId": "j3-1-1",
      "enabled": true,
      "order": 35
    },
    {
      "practiceId": "practice-cubic-divide-linear",
      "targetType": "chapter",
      "targetId": "j3-1-3",
      "enabled": true,
      "order": 52
    },
    {
      "practiceId": "practice-cubic-divide-quadratic",
      "targetType": "chapter",
      "targetId": "j3-1-3",
      "enabled": true,
      "order": 53
    },
    {
      "practiceId": "practice-linear-remove-parentheses-drill",
      "targetType": "chapter",
      "targetId": "j1-3-1",
      "enabled": true,
      "order": 55
    },
    {
      "practiceId": "practice-linear-multiply-parentheses-drill",
      "targetType": "chapter",
      "targetId": "j1-3-1",
      "enabled": true,
      "order": 56
    },
    {
      "practiceId": "practice-linear-fraction-parentheses-drill",
      "targetType": "chapter",
      "targetId": "j1-3-1",
      "enabled": true,
      "order": 57
    },
    {
      "practiceId": "practice-linear-move-terms-solve-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 58
    },
    {
      "practiceId": "practice-linear-word-expression-drill",
      "targetType": "chapter",
      "targetId": "j1-3-1",
      "enabled": true,
      "order": 58
    },
    {
      "practiceId": "practice-linear-expand-move-solve-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 59
    },
    {
      "practiceId": "practice-linear-substitution-value-drill",
      "targetType": "chapter",
      "targetId": "j1-3-1",
      "enabled": true,
      "order": 59
    },
    {
      "practiceId": "practice-linear-cross-expand-move-solve-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 60
    },
    {
      "practiceId": "practice-linear-lcm-multiply-move-solve-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 61
    },
    {
      "practiceId": "practice-linear-same-solution-drill",
      "targetType": "chapter",
      "targetId": "j1-3-2",
      "enabled": true,
      "order": 62
    },
    {
      "practiceId": "practice-coordinate-origin-unit-change",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 72
    },
    {
      "practiceId": "practice-abs-four-terms-calc-drill",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 77
    },
    {
      "practiceId": "practice-abs-two-group-calc-drill",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 78
    },
    {
      "practiceId": "practice-abs-remove-and-calc-drill",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 79
    },
    {
      "practiceId": "practice-abs-count-basic-drill",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 80
    },
    {
      "practiceId": "practice-abs-count-two-sided-drill",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 81
    },
    {
      "practiceId": "practice-abs-count-reverse-drill",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 82
    },
    {
      "practiceId": "practice-mod9-remainder-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 91
    },
    {
      "practiceId": "practice-mod9-unknown-multiple-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 92
    },
    {
      "practiceId": "practice-mod9-unknown-remainder-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 95
    },
    {
      "practiceId": "practice-mod11-remainder-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 96
    },
    {
      "practiceId": "practice-mod11-unknown-multiple-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 97
    },
    {
      "practiceId": "practice-mod11-unknown-remainder-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 98
    },
    {
      "practiceId": "practice-j1-2-1-prime-factor-notation-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 99
    },
    {
      "practiceId": "practice-j1-2-1-divisor-count-sum-mixed-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 100
    },
    {
      "practiceId": "practice-j1-2-1-rectangle-factor-pairs-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 101
    },
    {
      "practiceId": "practice-j1-2-1-gcd-lcm-calculation-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 102
    },
    {
      "practiceId": "practice-j1-2-1-gcd-lcm-product-relation-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 103
    },
    {
      "practiceId": "practice-j1-2-1-remainder-shortage-mixed-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 104
    },
    {
      "practiceId": "practice-j1-2-1-hanxin-advanced-drill",
      "targetType": "chapter",
      "targetId": "j1-2-1",
      "enabled": true,
      "order": 105
    },
    {
      "practiceId": "practice-j1-distributive-law-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 160
    },
    {
      "practiceId": "practice-j1-common-factor-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 161
    },
    {
      "practiceId": "practice-j1-common-factor-four-terms-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 162
    },
    {
      "practiceId": "practice-j1-variable-distributive-nearby-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 163
    },
    {
      "practiceId": "practice-j1-variable-distributive-eval-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 164
    },
    {
      "practiceId": "practice-integer-add-subtract-four-terms-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 166
    },
    {
      "practiceId": "practice-three-products-add-subtract-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 168
    },
    {
      "practiceId": "practice-time-baseline-basic-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 174
    },
    {
      "practiceId": "practice-opposite-number-equation-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 175
    },
    {
      "practiceId": "practice-time-baseline-advanced-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 176
    },
    {
      "practiceId": "practice-midpoint-distance-combined-drill",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 177
    },
    {
      "practiceId": "practice-distance-formula",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 178
    },
    {
      "practiceId": "practice-midpoint-reverse-drill",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 179
    },
    {
      "practiceId": "practice-same-shift-opposite-drill",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 180
    },
    {
      "practiceId": "practice-midpoint-plus-distance-drill",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 181
    },
    {
      "practiceId": "practice-three-point-quick-distance-drill",
      "targetType": "chapter",
      "targetId": "j1-1-1",
      "enabled": true,
      "order": 182
    },
    {
      "practiceId": "practice-square-root-basic-junior",
      "targetType": "chapter",
      "targetId": "j3-2-1",
      "enabled": true,
      "order": 187
    },
    {
      "practiceId": "practice-radical-mul-div-split-rule",
      "targetType": "chapter",
      "targetId": "j3-2-2",
      "enabled": true,
      "order": 192
    },
    {
      "practiceId": "practice-radical-add-subtract-like-terms",
      "targetType": "chapter",
      "targetId": "j3-2-2",
      "enabled": true,
      "order": 193
    },
    {
      "practiceId": "practice-simplest-radical-form-junior",
      "targetType": "chapter",
      "targetId": "j3-2-2",
      "enabled": true,
      "order": 194
    },
    {
      "practiceId": "practice-rationalize-denominator-monomial-junior",
      "targetType": "chapter",
      "targetId": "j3-2-2",
      "enabled": true,
      "order": 195
    },
    {
      "practiceId": "practice-rationalize-denominator-binomial-junior",
      "targetType": "chapter",
      "targetId": "j3-2-2",
      "enabled": true,
      "order": 196
    },
    {
      "practiceId": "practice-j3-2-3-triple-expand-drill",
      "targetType": "chapter",
      "targetId": "j3-2-3",
      "enabled": true,
      "order": 197
    },
    {
      "practiceId": "practice-j3-2-3-hypotenuse-altitude-drill",
      "targetType": "chapter",
      "targetId": "j3-2-3",
      "enabled": true,
      "order": 198
    },
    {
      "practiceId": "practice-j3-2-3-coordinate-distance-drill",
      "targetType": "chapter",
      "targetId": "j3-2-3",
      "enabled": true,
      "order": 199
    },
    {
      "practiceId": "practice-j3-2-3-spatial-diagonal-drill",
      "targetType": "chapter",
      "targetId": "j3-2-3",
      "enabled": true,
      "order": 200
    },
    {
      "practiceId": "practice-j3-3-1-core-factoring-mixed",
      "targetType": "chapter",
      "targetId": "j3-3-1",
      "enabled": true,
      "order": 201
    },
    {
      "practiceId": "practice-j3-3-1-grouping-advanced-mixed",
      "targetType": "chapter",
      "targetId": "j3-3-1",
      "enabled": true,
      "order": 202
    },
    {
      "practiceId": "practice-j3-3-2-formula-mixed",
      "targetType": "chapter",
      "targetId": "j3-3-2",
      "enabled": true,
      "order": 203
    },
    {
      "practiceId": "practice-j3-3-3-cross-core-mixed",
      "targetType": "chapter",
      "targetId": "j3-3-3",
      "enabled": true,
      "order": 204
    },
    {
      "practiceId": "practice-j3-3-3-cross-sub-mixed",
      "targetType": "chapter",
      "targetId": "j3-3-3",
      "enabled": true,
      "order": 205
    },
    {
      "practiceId": "practice-weird-symbol-calc",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 672
    },
    {
      "practiceId": "practice-weird-symbol-calc-three-layer",
      "targetType": "chapter",
      "targetId": "j1-1-2",
      "enabled": true,
      "order": 673
    },
    {
      "practiceId": "practice-factor-application-separate-grouping-drill",
      "targetType": "chapter",
      "targetId": "j1-2-2",
      "enabled": true,
      "order": 712
    },
    {
      "practiceId": "practice-factor-application-mixed-grouping-drill",
      "targetType": "chapter",
      "targetId": "j1-2-2",
      "enabled": true,
      "order": 714
    },
    {
      "practiceId": "practice-factor-application-circular-track-drill",
      "targetType": "chapter",
      "targetId": "j1-2-2",
      "enabled": true,
      "order": 716
    },
    {
      "practiceId": "practice-factor-road-planting-single-drill",
      "targetType": "chapter",
      "targetId": "j1-2-2",
      "enabled": true,
      "order": 718
    },
    {
      "practiceId": "practice-factor-road-planting-double-drill",
      "targetType": "chapter",
      "targetId": "j1-2-2",
      "enabled": true,
      "order": 720
    },
    {
      "practiceId": "practice-factor-road-keep-position-drill",
      "targetType": "chapter",
      "targetId": "j1-2-2",
      "enabled": true,
      "order": 722
    },
    {
      "practiceId": "practice-factor-rectangle-equal-square-drill",
      "targetType": "chapter",
      "targetId": "j1-2-2",
      "enabled": true,
      "order": 724
    },
    {
      "practiceId": "practice-factor-rectangle-max-square-mixed-drill",
      "targetType": "chapter",
      "targetId": "j1-2-2",
      "enabled": true,
      "order": 726
    }
  ],
  "byChapter": {
    "j1-3-2": [
      "practice-abs-both-sides-advanced-drill",
      "practice-abs-equation-leading-not-one-drill",
      "practice-abs-equation-leading-one-drill",
      "practice-nonnegative-sum-fixed-multix-drill",
      "practice-nonnegative-sum-fixed-one-drill",
      "practice-nonnegative-sum-zero-drill",
      "practice-linear-move-terms-solve-drill",
      "practice-linear-expand-move-solve-drill",
      "practice-linear-cross-expand-move-solve-drill",
      "practice-linear-lcm-multiply-move-solve-drill",
      "practice-linear-same-solution-drill"
    ],
    "j1-1-2": [
      "practice-j1-1-2-average-baseline-mixed",
      "practice-j1-distributive-law-drill",
      "practice-j1-common-factor-drill",
      "practice-j1-common-factor-four-terms-drill",
      "practice-j1-variable-distributive-nearby-drill",
      "practice-j1-variable-distributive-eval-drill",
      "practice-integer-add-subtract-four-terms-drill",
      "practice-three-products-add-subtract-drill",
      "practice-time-baseline-basic-drill",
      "practice-opposite-number-equation-drill",
      "practice-time-baseline-advanced-drill",
      "practice-same-shift-opposite-drill",
      "practice-weird-symbol-calc",
      "practice-weird-symbol-calc-three-layer"
    ],
    "j1-1-3": [
      "practice-j1-1-3-sign-brackets-power-drill",
      "practice-j1-1-3-exponent-law-single-rule-drill",
      "practice-j1-1-3-exponent-law-mixed-rule-drill",
      "practice-j1-1-3-exponent-mixed-operations-drill",
      "practice-j1-1-3-exponent-word-problem-drill"
    ],
    "j1-1-4": [
      "practice-j1-1-4-scientific-convert-drill",
      "practice-j1-1-4-scientific-digit-reading-drill",
      "practice-j1-1-4-scientific-compare-drill",
      "practice-j1-1-4-scientific-mul-div-drill",
      "practice-j1-1-4-scientific-add-sub-drill",
      "practice-j1-1-4-scientific-unit-conversion-drill",
      "practice-j1-1-4-scientific-normalize-drill"
    ],
    "j1-2-3": [
      "practice-j1-2-3-fraction-add-sub-brackets-drill",
      "practice-j1-2-3-fraction-add-sub-negative-drill",
      "practice-j1-2-3-fraction-add-sub-absolute-drill",
      "practice-j1-2-3-fraction-mul-div-mixed-drill",
      "practice-j1-2-3-fraction-distributive-common-factor-drill",
      "practice-j1-2-3-fraction-distributive-regroup-drill",
      "practice-j1-2-3-telescoping-product-drill",
      "practice-j1-2-3-telescoping-adjacent-sum-drill",
      "practice-j1-2-3-telescoping-gap-four-sum-drill"
    ],
    "j1-3-3": [
      "practice-j1-3-3-purchase-discount-application-drill",
      "practice-j1-3-3-allocation-application-drill",
      "practice-j1-3-3-age-application-drill",
      "practice-j1-3-3-speed-application-drill",
      "practice-j1-3-3-heads-coins-application-drill",
      "practice-j1-3-3-work-rate-application-drill",
      "practice-j1-3-3-fraction-remainder-application-drill",
      "practice-j1-3-3-score-penalty-application-drill",
      "practice-j1-3-3-mixture-application-drill",
      "practice-j1-3-3-tiered-fee-application-drill",
      "practice-j1-3-3-clock-angle-application-drill"
    ],
    "j2-1-1": [
      "practice-j2-1-1-evaluate-expression-drill",
      "practice-j2-1-1-expression-simplify-drill",
      "practice-j2-1-1-distribute-expand-drill",
      "practice-j2-1-1-fraction-simplify-drill",
      "practice-j2-1-1-context-to-equation-drill",
      "practice-j2-1-1-ordered-pair-check-drill",
      "practice-j2-1-1-integer-constraint-drill",
      "practice-j2-1-1-equivalent-transform-drill",
      "practice-j2-1-1-solve-for-variable-drill",
      "practice-j2-1-1-expression-classify-drill",
      "practice-j2-1-1-parameter-substitution-drill"
    ],
    "j2-1-2": [
      "practice-j2-1-2-substitution-basic-drill",
      "practice-j2-1-2-elimination-adjustment-drill",
      "practice-j2-1-2-fraction-decimal-drill",
      "practice-j2-1-2-solution-type-drill",
      "practice-j2-1-2-triple-equal-drill",
      "practice-j2-1-2-symmetric-system-drill",
      "practice-j2-1-2-abs-zero-drill",
      "practice-j2-1-2-known-solution-coeff-drill",
      "practice-j2-1-2-error-diagnosis-drill",
      "practice-j2-1-2-shared-solution-drill",
      "practice-j2-1-2-third-condition-drill",
      "practice-j2-1-2-special-reverse-drill"
    ],
    "j2-1-3": [
      "practice-j2-1-3-money-ticket-drill",
      "practice-j2-1-3-heads-coins-score-drill",
      "practice-j2-1-3-digit-placevalue-drill",
      "practice-j2-1-3-age-chase-drill",
      "practice-j2-1-3-speed-chase-drill",
      "practice-j2-1-3-allocation-work-drill",
      "practice-j2-1-3-tiered-fee-drill",
      "practice-j2-1-3-classical-text-drill"
    ],
    "j2-2-1": [
      "practice-j2-2-1-axis-distance-drill",
      "practice-j2-2-1-quadrant-basic-drill",
      "practice-j2-2-1-translation-basic-drill",
      "practice-j2-2-1-axis-special-drill",
      "practice-j2-2-1-midpoint-drill",
      "practice-j2-2-1-symmetry-drill",
      "practice-j2-2-1-area-drill",
      "practice-j2-2-1-quadrant-reasoning-drill",
      "practice-j2-2-1-nonnegative-drill"
    ],
    "j2-2-2": [
      "practice-j2-2-2-point-line-relation-drill",
      "practice-j2-2-2-intercept-area-drill",
      "practice-j2-2-2-quadrant-exclusion-drill",
      "practice-j2-2-2-parallel-perpendicular-drill",
      "practice-j2-2-2-line-from-points-drill",
      "practice-j2-2-2-only-two-quadrants-drill",
      "practice-j2-2-2-point-translation-line-drill",
      "practice-j2-2-2-two-lines-area-drill"
    ],
    "j2-3-1": [
      "practice-j2-3-1-ratio-simplify-drill",
      "practice-j2-3-1-proportion-solve-drill",
      "practice-j2-3-1-relation-transform-drill",
      "practice-j2-3-1-k-method-drill",
      "practice-j2-3-1-basic-single-step-drill",
      "practice-j2-3-1-regular-two-step-drill",
      "practice-j2-3-1-advanced-three-step-drill",
      "practice-j2-3-1-concentration-reverse-drill"
    ],
    "j2-3-2": [
      "practice-j2-3-2-basic-direct-inverse-drill",
      "practice-j2-3-2-linear-combo-proportion-drill",
      "practice-j2-3-2-square-proportion-drill",
      "practice-j2-3-2-chained-variation-drill",
      "practice-j2-3-2-percent-change-drill",
      "practice-j2-3-2-word-judgment-drill"
    ],
    "j2-4-1": [
      "practice-j2-4-1-inequality-language-drill",
      "practice-j2-4-1-inequality-integer-drill",
      "practice-j2-4-1-inequality-fraction-drill",
      "practice-j2-4-1-inequality-decimal-drill",
      "practice-j2-4-1-inequality-range-drill",
      "practice-j2-4-1-inequality-reverse-coeff-drill",
      "practice-j2-4-1-inequality-known-solution-range-drill",
      "practice-j2-4-1-inequality-same-solution-drill"
    ],
    "j2-4-2": [
      "practice-j2-4-2-basic-word-drill",
      "practice-j2-4-2-regular-word-drill",
      "practice-j2-4-2-advanced-word-drill"
    ],
    "j3-1-2": [
      "practice-j3-1-2-polynomial-add-subtract-drill",
      "practice-j3-1-2-degree-constraint-drill",
      "practice-j3-1-2-polynomial-reverse-application-drill"
    ],
    "j1-1-1": [
      "practice-midpoint-formula",
      "practice-coordinate-origin-unit-change",
      "practice-abs-four-terms-calc-drill",
      "practice-abs-two-group-calc-drill",
      "practice-abs-remove-and-calc-drill",
      "practice-abs-count-basic-drill",
      "practice-abs-count-two-sided-drill",
      "practice-abs-count-reverse-drill",
      "practice-midpoint-distance-combined-drill",
      "practice-distance-formula",
      "practice-midpoint-reverse-drill",
      "practice-midpoint-plus-distance-drill",
      "practice-three-point-quick-distance-drill"
    ],
    "j3-1-1": [
      "practice-j3-1-1-formula-mixed-integer-drill",
      "practice-j3-1-1-formula-mixed-decimal-drill",
      "practice-j3-1-1-formula-mixed-fraction-drill",
      "practice-j3-1-1-formula-mixed-variable-drill",
      "practice-sum-square-variable-drill",
      "practice-difference-square-variable-drill",
      "practice-square-difference-variable-drill",
      "practice-square-difference-factorization-variable-drill",
      "practice-identity-value-pair-mixed-drill",
      "practice-identity-value-pair-advanced-drill",
      "practice-identity-value-integer-basic-drill",
      "practice-identity-value-linear-combination-drill",
      "practice-identity-value-reciprocal-drill",
      "practice-identity-value-reciprocal-reverse-drill",
      "practice-identity-value-reciprocal-mixed-fraction-drill",
      "practice-identity-value-mixed-advanced-drill"
    ],
    "j3-1-3": [
      "practice-j3-1-2-mul-easy-mixed-drill",
      "practice-j3-1-2-mul-advanced-mixed-drill",
      "practice-j3-1-2-div-monomial-mixed-drill",
      "practice-j3-1-3-polynomial-division-regular-drill",
      "practice-j3-1-3-reverse-division-drill",
      "practice-j3-1-3-coeff-sum-drill",
      "practice-j3-1-3-remainder-theorem-drill",
      "practice-j3-1-3-factor-theorem-drill",
      "practice-cubic-divide-linear",
      "practice-cubic-divide-quadratic"
    ],
    "j1-3-1": [
      "practice-linear-remove-parentheses-drill",
      "practice-linear-multiply-parentheses-drill",
      "practice-linear-fraction-parentheses-drill",
      "practice-linear-word-expression-drill",
      "practice-linear-substitution-value-drill"
    ],
    "j1-2-1": [
      "practice-mod9-remainder-drill",
      "practice-mod9-unknown-multiple-drill",
      "practice-mod9-unknown-remainder-drill",
      "practice-mod11-remainder-drill",
      "practice-mod11-unknown-multiple-drill",
      "practice-mod11-unknown-remainder-drill",
      "practice-j1-2-1-prime-factor-notation-drill",
      "practice-j1-2-1-divisor-count-sum-mixed-drill",
      "practice-j1-2-1-rectangle-factor-pairs-drill",
      "practice-j1-2-1-gcd-lcm-calculation-drill",
      "practice-j1-2-1-gcd-lcm-product-relation-drill",
      "practice-j1-2-1-remainder-shortage-mixed-drill",
      "practice-j1-2-1-hanxin-advanced-drill"
    ],
    "j3-2-1": [
      "practice-square-root-basic-junior"
    ],
    "j3-2-2": [
      "practice-radical-mul-div-split-rule",
      "practice-radical-add-subtract-like-terms",
      "practice-simplest-radical-form-junior",
      "practice-rationalize-denominator-monomial-junior",
      "practice-rationalize-denominator-binomial-junior"
    ],
    "j3-2-3": [
      "practice-j3-2-3-triple-expand-drill",
      "practice-j3-2-3-hypotenuse-altitude-drill",
      "practice-j3-2-3-coordinate-distance-drill",
      "practice-j3-2-3-spatial-diagonal-drill"
    ],
    "j3-3-1": [
      "practice-j3-3-1-core-factoring-mixed",
      "practice-j3-3-1-grouping-advanced-mixed"
    ],
    "j3-3-2": [
      "practice-j3-3-2-formula-mixed"
    ],
    "j3-3-3": [
      "practice-j3-3-3-cross-core-mixed",
      "practice-j3-3-3-cross-sub-mixed"
    ],
    "j1-2-2": [
      "practice-factor-application-separate-grouping-drill",
      "practice-factor-application-mixed-grouping-drill",
      "practice-factor-application-circular-track-drill",
      "practice-factor-road-planting-single-drill",
      "practice-factor-road-planting-double-drill",
      "practice-factor-road-keep-position-drill",
      "practice-factor-rectangle-equal-square-drill",
      "practice-factor-rectangle-max-square-mixed-drill"
    ]
  },
  "byTopic": {}
};
