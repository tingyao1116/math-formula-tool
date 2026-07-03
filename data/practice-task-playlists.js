// Curated task playlists layered on top of data/practice-playlists.js.
// 任務型清單只放「要練哪些題型」，日程安排請放在 data/practice-schedules.js。
// 複習必做（review-*）已遷移到 program-db/database/practice-custom-theme-db.json，由 GUI 管理。
(() => {
  const taskPlaylists = [
  {
    "id": "task-signed-numbers-foundation",
    "title": "正負數與數線基礎練習",
    "description": "相反數、大小比較、同側異側、整數加減與括號符號。",
    "grade": "國一",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-opposite-basic-concept-drill",
      "practice-j1-1-1-opposite-four-subtypes",
      "practice-j1-1-1-opposite-sum-difference-drill",
      "practice-opposite-compare-drill",
      "practice-opposite-side-of-origin-drill",
      "practice-integer-add-subtract-brackets-drill",
      "practice-integer-canceling-brackets-drill",
      "practice-j1-1-2-opposite-three-subtypes"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-brackets-distributive-factor",
    "title": "去括號、分配律與提出公因數練習",
    "description": "去括號、分配律、提出公因數放在同一條線練，建立展開與提出互逆的感覺。",
    "grade": "國一",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-linear-remove-parentheses-drill",
      "practice-linear-multiply-parentheses-drill",
      "practice-j1-distributive-law-drill",
      "practice-j1-common-factor-drill",
      "practice-j1-common-factor-four-terms-drill",
      "practice-j1-common-factor-four-terms-signed-drill",
      "practice-j1-common-factor-then-distributive-drill",
      "practice-j1-1-2-distributive-factor-nine-subtypes"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-absolute-value-core",
    "title": "絕對值問題練習",
    "description": "絕對值基本意義、去絕對值、整數個數、距離與最大最小值。",
    "grade": "國一",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-j1-1-1-absolute-value-core-nine-subtypes",
      "practice-abs-remove-and-calc-drill",
      "practice-abs-variable-basic-drill",
      "practice-absolute-value-candidates-drill",
      "practice-j1-1-1-absolute-extremum-four-subtypes",
      "practice-abs-count-basic-drill",
      "practice-abs-count-two-sided-drill",
      "practice-abs-count-reverse-drill",
      "practice-j1-1-2-absolute-mixed-four-subtypes"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-exponent-laws",
    "title": "指數律練習",
    "description": "同底數乘除、乘方的乘方、負指數、指數比較與進階指數方程。",
    "grade": "國一",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-j1-1-3-sign-brackets-power-drill",
      "practice-j1-1-3-exponent-law-three-subtypes",
      "practice-j1-1-3-same-base-four-subtypes",
      "practice-j1-1-3-power-of-power-four-subtypes",
      "practice-j1-1-3-negative-exponent-five-subtypes",
      "practice-j1-1-3-power-compare-five-subtypes",
      "practice-s3-2-1-exponent-laws-equations-five-subtypes"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-scientific-notation",
    "title": "科學記號練習",
    "description": "大數小數轉換、位數判讀、大小比較、乘除、加減與生活情境。",
    "grade": "國一",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-j1-1-4-scientific-convert-drill",
      "practice-j1-1-4-scientific-digit-reading-drill",
      "practice-j1-1-4-scientific-compare-drill",
      "practice-j1-1-4-scientific-mul-div-drill",
      "practice-j1-1-4-scientific-add-sub-drill",
      "practice-j1-1-4-scientific-unit-conversion-drill",
      "practice-j1-1-4-scientific-normalize-drill",
      "practice-j1-1-4-scientific-context-drill"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-linear-symbol-add-sub",
    "title": "未知數符號加減練習",
    "description": "文字轉代數、代入求值、去括號、合併同類項與一次式整理。",
    "grade": "國一",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-linear-word-expression-drill",
      "practice-linear-substitution-value-drill",
      "practice-linear-remove-parentheses-drill",
      "practice-linear-multiply-parentheses-drill",
      "practice-linear-fraction-parentheses-drill",
      "practice-j2-1-1-expression-simplify-drill",
      "practice-j2-1-1-distribute-expand-drill",
      "practice-j2-1-1-fraction-simplify-drill"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-word-problem-modeling",
    "title": "應用問題列式練習",
    "description": "年齡、速率、分配、購物折扣、工作率、整數與平均等常見應用題。",
    "grade": "國一",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-j1-3-3-age-application-drill",
      "practice-j1-3-3-speed-application-drill",
      "practice-j1-3-3-allocation-application-drill",
      "practice-j1-3-3-purchase-discount-application-drill",
      "practice-j1-3-3-heads-coins-application-drill",
      "practice-j1-3-3-work-rate-application-drill",
      "practice-j1-3-3-score-penalty-application-drill",
      "practice-j1-3-3-consecutive-integer-application-drill",
      "practice-j1-3-3-average-count-application-drill",
      "practice-j1-3-3-total-price-application-drill"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-radical-simplification",
    "title": "根式化簡練習",
    "description": "平方根定義、比較、最簡根式、根式乘除與同類根式加減。",
    "grade": "國二",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-square-root-basic-junior",
      "practice-j3-2-1-exact-square-root-drill",
      "practice-j3-2-1-square-root-compare-drill",
      "practice-j3-2-1-sqrt-definition-relation",
      "practice-j3-2-1-sqrt-reverse-square",
      "practice-radical-mul-div-split-rule",
      "practice-radical-add-subtract-like-terms",
      "practice-simplest-radical-form-junior",
      "practice-j3-2-2-radical-formula-drill",
      "practice-j3-2-2-radical-mixed-simplify-drill"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-pythagorean-theorem",
    "title": "畢氏數與畢氏定理練習",
    "description": "畢氏定理邊長計算、生活情境、梯形與畢氏數分類。",
    "grade": "國二",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-j3-2-3-pythagorean-context-drill",
      "practice-j3-2-3-trapezoid-pythag",
      "practice-j4-3-4-pythagorean-classification",
      "practice-distance-formula"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-factorization-core",
    "title": "因式分解練習",
    "description": "提出公因式、公式法、平方差、立方公式、反推參數與因式定理。",
    "grade": "國二",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-j3-3-1-core-factoring-mixed",
      "practice-j3-3-1-binomial-common-factor",
      "practice-j3-3-2-formula-mixed",
      "practice-j3-3-2-cube-formula",
      "practice-square-difference-factorization-variable-drill",
      "practice-j3-3-3-factor-parameter-reverse",
      "practice-j3-1-3-factor-theorem-drill"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-quadratic-equation",
    "title": "一元二次方程式練習",
    "description": "因式分解解方程、平方根法、公式解、根與係數關係、已知根反推與應用題。",
    "grade": "國二",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-j3-4-1-factor-formula-solve",
      "practice-j3-4-1-root-property-reverse",
      "practice-j3-4-1-shared-root",
      "practice-j3-4-2-square-root-solve",
      "practice-j3-4-2-formula-direct-solve",
      "practice-j3-4-2-roots-core-mixed",
      "practice-j3-4-2-roots-applied-mixed",
      "practice-j3-4-2-known-root-parameter",
      "practice-j3-4-2-abs-double-zero",
      "practice-j3-4-3-number-property-word",
      "practice-j3-4-3-geometry-area-word",
      "practice-j3-4-3-business-sales-word"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  },
  {
    "id": "task-sequence-series",
    "title": "數列與級數練習",
    "description": "等差數列、級數公式、分組和、奇偶和、應用題，並銜接高中數列級數。",
    "grade": "國三",
    "playlistType": "任務型",
    "practiceIds": [
      "practice-j4-1-2-geometric-word-applications",
      "practice-j4-1-3-series-mixed",
      "practice-j4-1-3-series-formula-core",
      "practice-j4-1-3-word-applications",
      "practice-j4-1-3-series-block-sum-relation",
      "practice-j4-1-3-series-odd-even-sum",
      "practice-s2-1-1-sequence-core-five-subtypes",
      "practice-s2-1-1-geometric-coordinate-sequences",
      "practice-s2-1-2-series-sum-seven-subtypes",
      "practice-s2-1-2-geometric-series-five-subtypes"
    ],
    "questionCount": 5,
    "shufflePractices": false,
    "enabled": true,
    "updatedAt": "2026-06-29T00:00:00.000Z",
    "scheduleConfig": null
  }
];

  const replaceIds = new Set(taskPlaylists.map((playlist) => playlist.id));
  replaceIds.add("playlist-測試用");

  const existing = Array.isArray(window.practicePlaylistData) ? window.practicePlaylistData : [];
  window.practicePlaylistData = [
    ...existing.filter((playlist) => !replaceIds.has(String(playlist?.id || ""))),
    ...taskPlaylists
  ];
})();
