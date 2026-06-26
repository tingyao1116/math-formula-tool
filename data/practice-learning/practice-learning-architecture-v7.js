(() => {
  const base = window.practiceLearningArchitectureStore || null;
  if (!base) {
    console.warn("practice learning architecture v6 not loaded");
    return;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeSkill({
    id,
    chapterCode,
    title,
    shortLabel,
    summary,
    practiceIds,
    prerequisiteSkillIds = [],
    nextSkillIds = [],
    mainAbilityId,
    stageId,
    focusTags = [],
    fillBlankSuitable = true,
  }) {
    return {
      id,
      chapterCode,
      title,
      shortLabel: shortLabel || title,
      summary,
      practiceIds,
      prerequisiteSkillIds,
      nextSkillIds,
      answerMode: "fill-blank",
      fillBlankSuitable,
      mainAbilityId,
      stageId,
      teacherAssignable: true,
      focusTags,
    };
  }

  const baseSkills = base.getSkills?.() || [];
  const baseChapters = base.getSkillTreeChapters?.() || [];
  const baseTracks = base.getAbilityTracks?.() || [];
  const baseStages = base.getAbilityStages?.() || [];
  const baseMasteryStages = base.getMasteryStages?.() || [];
  const baseMistakeTags = base.getMistakeTags?.() || [];

  const j6Skills = [
    makeSkill({
      id: "quadratic-graph-basics",
      chapterCode: "j6-1-1",
      title: "二次函數圖形辨識與係數感",
      shortLabel: "圖形辨識",
      summary: "先建立 y=ax^2 的開口方向、寬窄、對稱軸與象限位置感，讓學生看到式子就能先猜圖形特徵。",
      practiceIds: [
        "practice-j6-1-1-parabola-ax2-four-subtypes",
        "practice-j6-1-1-opening-vertex-axis",
        "practice-j6-1-1-opening-width-order",
        "practice-j6-1-1-find-coefficient-from-point",
      ],
      prerequisiteSkillIds: ["advanced-synthesis-euler-centers"],
      nextSkillIds: ["quadratic-application-intuition", "quadratic-translation-vertex"],
      mainAbilityId: "j6-quadratic-functions",
      stageId: "stage-j6-quadratic-entry",
      focusTags: ["二次函數", "圖形特徵", "係數判讀", "數形連結"],
    }),
    makeSkill({
      id: "quadratic-application-intuition",
      chapterCode: "j6-1-1",
      title: "拋物線情境與幾何感",
      shortLabel: "拋物線應用",
      summary: "把二次函數從純代數延伸到方格點、弦長、面積與生活情境，讓學生知道二次函數不是只會畫圖。",
      practiceIds: [
        "practice-j6-1-1-parabola-applications-five-subtypes",
        "practice-j6-1-1-line-parabola-grid-points",
        "practice-j6-1-1-horizontal-chord-length",
      ],
      prerequisiteSkillIds: ["quadratic-graph-basics"],
      nextSkillIds: ["quadratic-translation-vertex", "quadratic-optimization-modeling"],
      mainAbilityId: "j6-quadratic-functions",
      stageId: "stage-j6-quadratic-entry",
      focusTags: ["拋物線", "方格點", "幾何應用", "情境建模"],
    }),
    makeSkill({
      id: "quadratic-translation-vertex",
      chapterCode: "j6-1-2",
      title: "頂點式、平移與對稱軸",
      shortLabel: "頂點與平移",
      summary: "掌握 y=a(x-h)^2+k 的閱讀方式，並且把平移規則和圖形位置、點座標變化連在一起。",
      practiceIds: [
        "practice-j6-1-2-translation-graph-five-subtypes",
        "practice-j6-1-2-vertex-form-extrema-three-subtypes",
        "practice-j6-1-2-point-after-translation",
      ],
      prerequisiteSkillIds: ["quadratic-graph-basics"],
      nextSkillIds: ["quadratic-intersections-extrema", "quadratic-optimization-modeling"],
      mainAbilityId: "j6-quadratic-functions",
      stageId: "stage-j6-quadratic-transform",
      focusTags: ["頂點式", "平移", "對稱軸", "配方法"],
    }),
    makeSkill({
      id: "quadratic-intersections-extrema",
      chapterCode: "j6-1-2",
      title: "交點、判別與極值判讀",
      shortLabel: "交點與極值",
      summary: "把頂點位置、與 x 軸交點個數、最大最小值放在同一條線上理解，避免學生只會機械代公式。",
      practiceIds: [
        "practice-j6-1-2-x-axis-intersection-three-subtypes",
        "practice-j6-1-2-discriminant-count",
        "practice-j6-1-2-vertex-position-intersection",
      ],
      prerequisiteSkillIds: ["quadratic-translation-vertex"],
      nextSkillIds: ["quadratic-optimization-modeling"],
      mainAbilityId: "j6-quadratic-functions",
      stageId: "stage-j6-quadratic-transform",
      focusTags: ["交點", "判別式", "最大值", "最小值"],
    }),
    makeSkill({
      id: "quadratic-optimization-modeling",
      chapterCode: "j6-1-3",
      title: "二次函數最值建模",
      shortLabel: "最值建模",
      summary: "從代數最值、幾何最值到票價利潤和產量問題，訓練學生把條件整理成函數再判讀極值。",
      practiceIds: [
        "practice-j6-1-3-algebra-extrema-three-subtypes",
        "practice-j6-1-3-geometry-modeling-four-subtypes",
        "practice-j6-1-3-business-production-three-subtypes",
      ],
      prerequisiteSkillIds: ["quadratic-application-intuition", "quadratic-intersections-extrema"],
      nextSkillIds: ["spatial-logic-relations"],
      mainAbilityId: "j6-quadratic-functions",
      stageId: "stage-j6-quadratic-modeling",
      focusTags: ["最值", "建模", "生活應用", "幾何最值"],
    }),

    makeSkill({
      id: "spatial-logic-relations",
      chapterCode: "j6-2-1",
      title: "空間線面關係判讀",
      shortLabel: "線面關係",
      summary: "先建立立體中的平行、垂直、歪斜與線面垂直判讀，這是後面距離與展開圖的語言基礎。",
      practiceIds: [
        "practice-j6-2-1-spatial-logic-two-subtypes",
        "practice-j6-2-1-parallel-perpendicular-relations",
        "practice-j6-2-1-line-plane-perpendicular-logic",
      ],
      prerequisiteSkillIds: ["quadratic-optimization-modeling"],
      nextSkillIds: ["spatial-distance-volume", "polyhedron-euler-entry"],
      mainAbilityId: "j6-solid-geometry",
      stageId: "stage-j6-solid-foundation",
      focusTags: ["立體幾何", "線面關係", "平行", "垂直"],
    }),
    makeSkill({
      id: "spatial-distance-volume",
      chapterCode: "j6-2-1",
      title: "空間距離與體積比例",
      shortLabel: "空間距離",
      summary: "把空間對角線、線面距離、三垂線和相似放縮後的體積比例整合成一條量感主線。",
      practiceIds: [
        "practice-j6-2-1-spatial-distance-four-subtypes",
        "practice-j6-2-1-solid-volume-ratio-three-subtypes",
        "practice-j6-2-1-cuboid-space-diagonal",
        "practice-j6-2-1-three-perpendicular-distance",
      ],
      prerequisiteSkillIds: ["spatial-logic-relations"],
      nextSkillIds: ["solid-surface-volume-modeling", "surface-shortest-path"],
      mainAbilityId: "j6-solid-geometry",
      stageId: "stage-j6-solid-foundation",
      focusTags: ["空間距離", "對角線", "體積比", "三垂線"],
    }),
    makeSkill({
      id: "polyhedron-euler-entry",
      chapterCode: "j6-2-2",
      title: "多面體計數與尤拉公式",
      shortLabel: "多面體計數",
      summary: "從柱體、角錐的頂點面數邊數規律出發，再接到 V+F-E=2，建立立體結構感。",
      practiceIds: [
        "practice-j6-2-2-prism-euler-two-subtypes",
        "practice-j6-2-2-prism-counting",
        "practice-j6-2-2-euler-formula",
        "practice-j6-2-3-pyramid-counting-three-subtypes",
      ],
      prerequisiteSkillIds: ["spatial-logic-relations"],
      nextSkillIds: ["solid-surface-volume-modeling", "cone-pyramid-sphere"],
      mainAbilityId: "j6-solid-geometry",
      stageId: "stage-j6-solid-structure",
      focusTags: ["多面體", "尤拉公式", "柱體", "角錐"],
    }),
    makeSkill({
      id: "solid-surface-volume-modeling",
      chapterCode: "j6-2-2",
      title: "立體表面積、體積與容器模型",
      shortLabel: "表面積體積",
      summary: "把柱體、圓柱、複合體、空心模型與排水量問題放在一起，訓練公式選用與單位管理。",
      practiceIds: [
        "practice-j6-2-2-basic-surface-volume-three-subtypes",
        "practice-j6-2-2-composite-scaling-three-subtypes",
        "practice-j6-2-2-container-water-two-subtypes",
      ],
      prerequisiteSkillIds: ["spatial-distance-volume", "polyhedron-euler-entry"],
      nextSkillIds: ["surface-shortest-path", "cone-pyramid-sphere"],
      mainAbilityId: "j6-solid-geometry",
      stageId: "stage-j6-solid-structure",
      focusTags: ["表面積", "體積", "容器", "複合立體"],
    }),
    makeSkill({
      id: "surface-shortest-path",
      chapterCode: "j6-2-2",
      title: "展開圖與表面最短路徑",
      shortLabel: "最短路徑",
      summary: "訓練把立體表面展開成平面後再用直線或畢氏定理解題，這是學生最容易卡住的轉換題型。",
      practiceIds: [
        "practice-j6-2-2-surface-shortest-path-two-subtypes",
        "practice-j6-2-2-cuboid-surface-shortest-path",
        "practice-j6-2-2-cylinder-surface-shortest-path",
      ],
      prerequisiteSkillIds: ["solid-surface-volume-modeling"],
      nextSkillIds: ["cone-pyramid-sphere"],
      mainAbilityId: "j6-solid-geometry",
      stageId: "stage-j6-solid-application",
      focusTags: ["展開圖", "最短路徑", "長方體", "圓柱"],
    }),
    makeSkill({
      id: "cone-pyramid-sphere",
      chapterCode: "j6-2-3",
      title: "圓錐、角錐與球體綜合",
      shortLabel: "圓錐球體",
      summary: "整合圓錐側面展開、角錐計數與球面截圓，形成第六冊立體幾何的進階終點。",
      practiceIds: [
        "practice-j6-2-3-cone-surface-four-subtypes",
        "practice-j6-2-3-pyramid-counting-three-subtypes",
        "practice-j6-2-3-sphere-section-four-subtypes",
      ],
      prerequisiteSkillIds: ["polyhedron-euler-entry", "surface-shortest-path"],
      nextSkillIds: ["data-distribution-graphs"],
      mainAbilityId: "j6-solid-geometry",
      stageId: "stage-j6-solid-application",
      focusTags: ["圓錐", "角錐", "球體", "截面"],
    }),

    makeSkill({
      id: "data-distribution-graphs",
      chapterCode: "j6-3-1",
      title: "次數分配表與圓形圖判讀",
      shortLabel: "統計圖表",
      summary: "先從資料整理、組距、次數、相對次數與圓形圖百分比入手，建立統計的閱讀和製表能力。",
      practiceIds: [
        "practice-j6-3-1-frequency-distribution-six-subtypes",
        "practice-j6-3-1-pie-chart-five-subtypes",
        "practice-j6-3-1-data-sorting-count",
      ],
      prerequisiteSkillIds: ["cone-pyramid-sphere"],
      nextSkillIds: ["central-tendency-quartiles", "probability-experiments-strategy"],
      mainAbilityId: "j6-statistics-probability",
      stageId: "stage-j6-data-foundation",
      focusTags: ["統計", "次數分配", "圓形圖", "相對次數"],
    }),
    makeSkill({
      id: "central-tendency-quartiles",
      chapterCode: "j6-3-2",
      title: "平均數、中位數、四分位數與盒狀圖",
      shortLabel: "集中與分散",
      summary: "把平均數、中位數、眾數、四分位數、百分等級和盒狀圖放在同一層，適合做資料解讀與修正題。",
      practiceIds: [
        "practice-j6-3-2-central-tendency-six-subtypes",
        "practice-j6-3-2-quartile-boxplot-six-subtypes",
        "practice-j6-3-2-data-correction-effect",
      ],
      prerequisiteSkillIds: ["data-distribution-graphs"],
      nextSkillIds: ["probability-experiments-strategy"],
      mainAbilityId: "j6-statistics-probability",
      stageId: "stage-j6-data-analysis",
      focusTags: ["平均數", "中位數", "四分位數", "盒狀圖", "百分等級"],
    }),
    makeSkill({
      id: "probability-experiments-strategy",
      chapterCode: "j6-3-3",
      title: "機率實驗、樹狀圖與策略判斷",
      shortLabel: "機率策略",
      summary: "從單一步驟機率、擲骰擲幣、遊戲勝率到放回不放回，訓練學生列舉、分類與比較機率大小。",
      practiceIds: [
        "practice-j6-3-3-probability-single-mixed",
        "practice-j6-3-3-probability-compound-mixed",
        "practice-j6-3-3-probability-game-mixed",
      ],
      prerequisiteSkillIds: ["data-distribution-graphs", "central-tendency-quartiles"],
      nextSkillIds: [],
      mainAbilityId: "j6-statistics-probability",
      stageId: "stage-j6-data-analysis",
      focusTags: ["機率", "樹狀圖", "列舉", "遊戲策略"],
    }),
  ];

  const j6Chapters = [
    { id: "j6-1-1", chapterCode: "j6-1-1", title: "第六冊 1-1 二次函數圖形初步", skillIds: ["quadratic-graph-basics", "quadratic-application-intuition"] },
    { id: "j6-1-2", chapterCode: "j6-1-2", title: "第六冊 1-2 頂點式、平移與交點", skillIds: ["quadratic-translation-vertex", "quadratic-intersections-extrema"] },
    { id: "j6-1-3", chapterCode: "j6-1-3", title: "第六冊 1-3 二次函數最值與建模", skillIds: ["quadratic-optimization-modeling"] },
    { id: "j6-2-1", chapterCode: "j6-2-1", title: "第六冊 2-1 空間關係與距離", skillIds: ["spatial-logic-relations", "spatial-distance-volume"] },
    { id: "j6-2-2", chapterCode: "j6-2-2", title: "第六冊 2-2 多面體、表面積與展開圖", skillIds: ["polyhedron-euler-entry", "solid-surface-volume-modeling", "surface-shortest-path"] },
    { id: "j6-2-3", chapterCode: "j6-2-3", title: "第六冊 2-3 圓錐、角錐與球體", skillIds: ["cone-pyramid-sphere"] },
    { id: "j6-3-1", chapterCode: "j6-3-1", title: "第六冊 3-1 次數分配與圓形圖", skillIds: ["data-distribution-graphs"] },
    { id: "j6-3-2", chapterCode: "j6-3-2", title: "第六冊 3-2 集中趨勢與盒狀圖", skillIds: ["central-tendency-quartiles"] },
    { id: "j6-3-3", chapterCode: "j6-3-3", title: "第六冊 3-3 機率與策略判斷", skillIds: ["probability-experiments-strategy"] },
  ];

  const j6Stages = [
    {
      id: "stage-j6-quadratic-entry",
      trackId: "junior-math-main-track",
      order: 27,
      title: "第二十七階段：二次函數圖形入門",
      shortLabel: "二次函數入門",
      summary: "先建立 y=ax^2 的圖形辨識與情境直覺，讓學生從圖形語言進入第六冊。",
      entrySkillId: "quadratic-graph-basics",
      skillIds: ["quadratic-graph-basics", "quadratic-application-intuition"],
      unlockAfterStageIds: ["stage-j5-proof-centers"],
      nextStageId: "stage-j6-quadratic-transform",
      teacherNote: "這一段重點不是算快，而是先看懂開口、寬窄、對稱軸與情境對應。",
    },
    {
      id: "stage-j6-quadratic-transform",
      trackId: "junior-math-main-track",
      order: 28,
      title: "第二十八階段：頂點、平移與交點",
      shortLabel: "頂點與交點",
      summary: "把頂點式、配方法、圖形平移與交點判讀接起來，形成二次函數的核心計算骨架。",
      entrySkillId: "quadratic-translation-vertex",
      skillIds: ["quadratic-translation-vertex", "quadratic-intersections-extrema"],
      unlockAfterStageIds: ["stage-j6-quadratic-entry"],
      nextStageId: "stage-j6-quadratic-modeling",
      teacherNote: "學生最常錯在平移方向與頂點座標符號，這一段很適合反覆短練。",
    },
    {
      id: "stage-j6-quadratic-modeling",
      trackId: "junior-math-main-track",
      order: 29,
      title: "第二十九階段：二次函數最值建模",
      shortLabel: "最值建模",
      summary: "把極值從純代數推進到幾何和生活情境，讓學生練習列式、配方與結論判讀。",
      entrySkillId: "quadratic-optimization-modeling",
      skillIds: ["quadratic-optimization-modeling"],
      unlockAfterStageIds: ["stage-j6-quadratic-transform"],
      nextStageId: "stage-j6-solid-foundation",
      teacherNote: "這裡很像補習班常見的應用題主線，適合做題組式練習。",
    },
    {
      id: "stage-j6-solid-foundation",
      trackId: "junior-math-main-track",
      order: 30,
      title: "第三十階段：立體圖形基礎判讀",
      shortLabel: "立體基礎",
      summary: "先把線面關係、空間距離與體積比例建立起來，避免學生一看到立體就只剩想像。",
      entrySkillId: "spatial-logic-relations",
      skillIds: ["spatial-logic-relations", "spatial-distance-volume"],
      unlockAfterStageIds: ["stage-j6-quadratic-modeling"],
      nextStageId: "stage-j6-solid-structure",
      teacherNote: "這一段上課很需要配圖，但練習頁先用填充題穩住判讀與公式量感。",
    },
    {
      id: "stage-j6-solid-structure",
      trackId: "junior-math-main-track",
      order: 31,
      title: "第三十一階段：多面體與表面積體積",
      shortLabel: "立體計量",
      summary: "把多面體計數、尤拉公式、表面積與體積整合起來，形成立體計量的主幹。",
      entrySkillId: "polyhedron-euler-entry",
      skillIds: ["polyhedron-euler-entry", "solid-surface-volume-modeling"],
      unlockAfterStageIds: ["stage-j6-solid-foundation"],
      nextStageId: "stage-j6-solid-application",
      teacherNote: "空心模型、容器排水與比例放縮都很適合加入老師指定熟練線。",
    },
    {
      id: "stage-j6-solid-application",
      trackId: "junior-math-main-track",
      order: 32,
      title: "第三十二階段：展開圖與立體綜合",
      shortLabel: "立體綜合",
      summary: "把表面最短路徑、圓錐展開、球面截圓與角錐結構收束成第六冊立體幾何的頂點。",
      entrySkillId: "surface-shortest-path",
      skillIds: ["surface-shortest-path", "cone-pyramid-sphere"],
      unlockAfterStageIds: ["stage-j6-solid-structure"],
      nextStageId: "stage-j6-data-foundation",
      teacherNote: "最短路徑題非常吃轉圖能力，建議在技能樹做多次短回合練習。",
    },
    {
      id: "stage-j6-data-foundation",
      trackId: "junior-math-main-track",
      order: 33,
      title: "第三十三階段：統計圖表與資料整理",
      shortLabel: "統計基礎",
      summary: "從次數分配、圓形圖與資料整理出發，建立讀表、轉表與比較資料的能力。",
      entrySkillId: "data-distribution-graphs",
      skillIds: ["data-distribution-graphs"],
      unlockAfterStageIds: ["stage-j6-solid-application"],
      nextStageId: "stage-j6-data-analysis",
      teacherNote: "這段可以當能力指標頁的入口，讓學生先從最容易上手的統計整理開始。",
    },
    {
      id: "stage-j6-data-analysis",
      trackId: "junior-math-main-track",
      order: 34,
      title: "第三十四階段：統計判讀與機率策略",
      shortLabel: "統計與機率",
      summary: "把平均數、中位數、四分位數、盒狀圖與機率列舉整合，形成第六冊資料主線的完整終點。",
      entrySkillId: "central-tendency-quartiles",
      skillIds: ["central-tendency-quartiles", "probability-experiments-strategy"],
      unlockAfterStageIds: ["stage-j6-data-foundation"],
      nextStageId: "",
      teacherNote: "很適合加入錯誤修正、資料加減常數、放回不放回這些辨別型練習。",
    },
  ];

  const mergedSkills = [...baseSkills, ...j6Skills];
  const mergedChapters = [...baseChapters, ...j6Chapters];
  const mergedStages = [...baseStages, ...j6Stages];
  const mergedTracks = baseTracks.map((track) =>
    track.id !== "junior-math-main-track"
      ? track
      : {
          ...track,
          stageIds: [...(Array.isArray(track.stageIds) ? track.stageIds : []), ...j6Stages.map((stage) => stage.id)],
        },
  );

  window.practiceLearningArchitectureStore = {
    meta: {
      ...clone(base.meta || {}),
      schema: "practice-learning-architecture-v7",
      version: "2026-06-21-book6-expanded-v1",
      notes: [
        ...(Array.isArray(base.meta?.notes) ? base.meta.notes : []),
        "第六冊擴充加入二次函數、立體圖形、統計與機率三條能力主線。",
        "第六冊技能樹特別補強頂點式平移、表面最短路徑、盒狀圖與機率策略等高頻題型。",
      ],
    },
    getMasteryStages() {
      return clone(baseMasteryStages);
    },
    getMistakeTags() {
      return clone(baseMistakeTags);
    },
    getSkills() {
      return clone(mergedSkills);
    },
    getSkillById(id) {
      return clone(mergedSkills.find((entry) => entry.id === id) || null);
    },
    getSkillTreeChapters() {
      return clone(mergedChapters);
    },
    getAbilityTracks() {
      return clone(mergedTracks);
    },
    getAbilityStages() {
      return clone(mergedStages);
    },
    getAbilityStageById(id) {
      return clone(mergedStages.find((entry) => entry.id === id) || null);
    },
  };
})();
