(() => {
  const base = window.practiceLearningArchitectureStore || null;
  if (!base) {
    console.warn("practice learning architecture v4 not loaded");
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

  const j4Skills = [
    makeSkill({
      id: "ap-core-foundation",
      chapterCode: "j4-1-1",
      title: "等差數列通項與公差",
      shortLabel: "等差基礎",
      summary: "先穩住公差 d、通項公式與兩項反求，讓等差數列不是只會代公式，而是看得出規律。",
      practiceIds: [
        "practice-j4-1-1-ap-core-mixed",
        "practice-j4-1-1-ap-common-term",
      ],
      prerequisiteSkillIds: ["j3-stats-central-distribution"],
      nextSkillIds: ["ap-middle-insert-modeling", "ap-series-sum-reverse"],
      mainAbilityId: "j4-sequences",
      stageId: "stage-j4-sequences",
      focusTags: ["第四冊", "等差數列", "通項公式", "公差"],
    }),
    makeSkill({
      id: "ap-middle-insert-modeling",
      chapterCode: "j4-1-1",
      title: "等差中項與插入應用",
      shortLabel: "等差中項",
      summary: "把 2b=a+c、插入等差中項與多項反求整理成可反覆使用的技巧。",
      practiceIds: [
        "practice-j4-1-1-ap-middle-term",
        "practice-j4-1-1-ap-insert",
        "practice-j4-1-1-ap-two-terms",
        "practice-j4-1-1-ap-find-an",
        "practice-j4-1-1-ap-find-n",
      ],
      prerequisiteSkillIds: ["ap-core-foundation"],
      nextSkillIds: ["ap-series-sum-reverse", "gp-core-patterns"],
      mainAbilityId: "j4-sequences",
      stageId: "stage-j4-sequences",
      focusTags: ["第四冊", "等差中項", "插項", "反求"],
    }),
    makeSkill({
      id: "ap-series-sum-reverse",
      chapterCode: "j4-1-3",
      title: "等差級數求和與反推",
      shortLabel: "等差級數",
      summary: "從梯形求和公式、Sn 關係到最大最小與倍數總和，建立級數建模感。",
      practiceIds: [
        "practice-j4-1-3-series-mixed",
        "practice-j4-1-3-series-formula-core",
        "practice-j4-1-3-range-multiple-sum",
        "practice-j4-1-3-max-min-sum",
        "practice-j4-1-3-sn-relation",
        "practice-j4-1-3-word-applications",
        "practice-j4-1-1-ap-range-multiple-count",
      ],
      prerequisiteSkillIds: ["ap-core-foundation", "ap-middle-insert-modeling"],
      nextSkillIds: ["gp-core-patterns", "function-definition-operations"],
      mainAbilityId: "j4-sequences",
      stageId: "stage-j4-sequences",
      focusTags: ["第四冊", "等差級數", "Sn", "反推", "應用題"],
    }),
    makeSkill({
      id: "gp-core-patterns",
      chapterCode: "j4-1-2",
      title: "等比數列規律與建模",
      shortLabel: "等比數列",
      summary: "從公比、首項、一般項到等比中項與生活模型，建立指數成長的直覺。",
      practiceIds: [
        "practice-j4-1-2-geometric-mixed",
        "practice-j4-1-2-geometric-nth-term",
        "practice-j4-1-2-geometric-find-ratio-first",
        "practice-j4-1-2-geometric-mean-unknown",
        "practice-j4-1-2-geometric-term-index",
        "practice-j4-1-2-geometric-word-applications",
      ],
      prerequisiteSkillIds: ["ap-middle-insert-modeling"],
      nextSkillIds: ["function-definition-operations"],
      mainAbilityId: "j4-sequences",
      stageId: "stage-j4-sequences",
      focusTags: ["第四冊", "等比數列", "公比", "成長模型"],
    }),

    makeSkill({
      id: "function-definition-operations",
      chapterCode: "j4-2-1",
      title: "函數定義、代入與流程逆運算",
      shortLabel: "函數定義",
      summary: "先理解一對一、多對一與函數值，再練習流程型與反推型題目。",
      practiceIds: [
        "practice-j4-2-1-function-mixed",
        "practice-j4-2-1-function-relation-judge",
        "practice-j4-2-1-function-value-basic",
        "practice-j4-2-1-function-reverse-solve",
        "practice-j4-2-1-function-flow-composite",
        "practice-j4-2-1-function-word-model",
      ],
      prerequisiteSkillIds: ["ap-series-sum-reverse", "gp-core-patterns"],
      nextSkillIds: ["linear-function-graphing", "linear-life-modeling"],
      mainAbilityId: "j4-functions-graphs",
      stageId: "stage-j4-functions-graphs",
      focusTags: ["第四冊", "函數", "代入", "逆運算"],
    }),
    makeSkill({
      id: "linear-function-graphing",
      chapterCode: "j4-2-2",
      title: "一次函數圖形與截距判讀",
      shortLabel: "一次函數",
      summary: "從兩點求式、截距座標、平行交點到圖形與座標軸圍成的面積，建立圖形分析能力。",
      practiceIds: [
        "practice-j4-2-2-linear-function-mixed",
        "practice-j4-2-2-linear-equation-two-points",
        "practice-j4-2-2-intercept-position",
        "practice-j4-2-2-axis-area",
        "practice-j4-2-2-line-intersection-parallel",
      ],
      prerequisiteSkillIds: ["function-definition-operations"],
      nextSkillIds: ["linear-life-modeling", "polygon-angle-logic"],
      mainAbilityId: "j4-functions-graphs",
      stageId: "stage-j4-functions-graphs",
      focusTags: ["第四冊", "一次函數", "截距", "交點", "面積"],
    }),
    makeSkill({
      id: "linear-life-modeling",
      chapterCode: "j4-2-2",
      title: "線性模型生活應用",
      shortLabel: "線性應用",
      summary: "把溫標轉換、費率、海拔與溫度變化等情境寫成線性規則。",
      practiceIds: [
        "practice-j4-2-1-function-word-model",
        "practice-j4-2-2-linear-equation-two-points",
        "practice-j4-2-2-intercept-position",
      ],
      prerequisiteSkillIds: ["function-definition-operations", "linear-function-graphing"],
      nextSkillIds: ["polygon-angle-logic"],
      mainAbilityId: "j4-functions-graphs",
      stageId: "stage-j4-functions-graphs",
      focusTags: ["第四冊", "函數模型", "生活情境", "線性關係"],
    }),

    makeSkill({
      id: "polygon-angle-logic",
      chapterCode: "j4-3-1",
      title: "多邊形內外角與角度規律",
      shortLabel: "多邊形角",
      summary: "從三角形、四邊形到 n 邊形的內角和、外角和與特殊模型角度推理。",
      practiceIds: [
        "practice-j4-3-1-polygon-angle-mixed",
        "practice-j4-3-1-complementary-supplementary-angles",
      ],
      prerequisiteSkillIds: ["function-definition-operations"],
      nextSkillIds: ["construction-bisection-count", "triangle-congruence-inequality"],
      mainAbilityId: "j4-triangle-geometry",
      stageId: "stage-j4-triangle-geometry",
      focusTags: ["第四冊", "多邊形", "內角和", "外角和"],
    }),
    makeSkill({
      id: "construction-bisection-count",
      chapterCode: "j4-3-2",
      title: "尺規作圖與平分次數規律",
      shortLabel: "尺規作圖",
      summary: "把等分、平分線、中垂線與作圖次數規律做成操作型能力入口。",
      practiceIds: [
        "practice-j4-3-2-construction-bisection-count",
      ],
      prerequisiteSkillIds: ["polygon-angle-logic"],
      nextSkillIds: ["triangle-congruence-inequality", "parallel-angle-structures"],
      mainAbilityId: "j4-triangle-geometry",
      stageId: "stage-j4-triangle-geometry",
      focusTags: ["第四冊", "尺規作圖", "平分", "作圖次數"],
    }),
    makeSkill({
      id: "triangle-congruence-inequality",
      chapterCode: "j4-3-3",
      title: "全等判定與邊角關係",
      shortLabel: "全等與邊角",
      summary: "第四冊原生題型不足的部分，先用現有的相容題型補上全等對應、邊角關係與三角形成立條件。",
      practiceIds: [
        "practice-e4-1-6-congruent-correspondence-mixed",
        "practice-e5-1-5-triangle-side-three-subtypes",
        "practice-j5-3-2-congruence-five-subtypes",
      ],
      prerequisiteSkillIds: ["polygon-angle-logic", "construction-bisection-count"],
      nextSkillIds: ["parallel-angle-structures", "quadrilateral-properties-family"],
      mainAbilityId: "j4-triangle-geometry",
      stageId: "stage-j4-triangle-geometry",
      focusTags: ["第四冊延伸", "全等", "邊角關係", "跨章支援"],
    }),

    makeSkill({
      id: "parallel-angle-structures",
      chapterCode: "j4-4-1",
      title: "平行線與截角模型",
      shortLabel: "平行線角度",
      summary: "把同位角、內錯角、同側內角與 M 字型、Z 字型的折線角整理成熟悉模型。",
      practiceIds: [
        "practice-j4-4-1-parallel-perpendicular-angles",
      ],
      prerequisiteSkillIds: ["polygon-angle-logic"],
      nextSkillIds: ["quadrilateral-properties-family", "parallel-segments-midline"],
      mainAbilityId: "j4-parallel-quadrilaterals",
      stageId: "stage-j4-parallel-quadrilaterals",
      focusTags: ["第四冊", "平行線", "同位角", "內錯角", "模型角"],
    }),
    makeSkill({
      id: "quadrilateral-properties-family",
      chapterCode: "j4-4-2",
      title: "平行四邊形與特殊四邊形性質",
      shortLabel: "四邊形性質",
      summary: "從平行四邊形的邊角對角線性質，延伸到矩形、菱形、正方形、梯形的判定與分類。",
      practiceIds: [
        "practice-j4-4-2-quadrilateral-property-codes",
        "practice-e4-2-2-quadrilateral-overview-mixed",
        "practice-e5-1-9-parallelogram-four-subtypes",
      ],
      prerequisiteSkillIds: ["parallel-angle-structures", "triangle-congruence-inequality"],
      nextSkillIds: ["parallel-segments-midline", "geometry-integration-modeling"],
      mainAbilityId: "j4-parallel-quadrilaterals",
      stageId: "stage-j4-parallel-quadrilaterals",
      focusTags: ["第四冊", "平行四邊形", "特殊四邊形", "對角線"],
    }),
    makeSkill({
      id: "parallel-segments-midline",
      chapterCode: "j4-4-3",
      title: "平行截比與梯形中線",
      shortLabel: "梯形中線",
      summary: "整理平行分割、梯形中線與比例關係，並補上三角形平行線段的相容延伸。",
      practiceIds: [
        "practice-j4-4-3-trapezoid-midline-basic",
        "practice-j4-4-3-parallel-division",
        "practice-e5-1-9-trapezoid-four-subtypes",
        "practice-j5-1-2-triangle-parallel-five-subtypes",
      ],
      prerequisiteSkillIds: ["parallel-angle-structures", "quadrilateral-properties-family"],
      nextSkillIds: ["geometry-integration-modeling"],
      mainAbilityId: "j4-parallel-quadrilaterals",
      stageId: "stage-j4-parallel-quadrilaterals",
      focusTags: ["第四冊", "梯形中線", "平行分割", "比例", "跨章支援"],
    }),
    makeSkill({
      id: "geometry-integration-modeling",
      chapterCode: "j4-4-3",
      title: "幾何整合與生活建模",
      shortLabel: "幾何整合",
      summary: "把角度、平行、四邊形與比例整合成較完整的圖形判斷與生活題建模能力。",
      practiceIds: [
        "practice-j4-4-2-quadrilateral-property-codes",
        "practice-j4-4-3-trapezoid-midline-basic",
        "practice-j4-2-2-axis-area",
        "practice-j4-2-1-function-word-model",
      ],
      prerequisiteSkillIds: ["quadrilateral-properties-family", "parallel-segments-midline"],
      mainAbilityId: "j4-parallel-quadrilaterals",
      stageId: "stage-j4-parallel-quadrilaterals",
      focusTags: ["第四冊", "幾何整合", "建模", "生活應用"],
    }),
  ];

  const j4Chapters = [
    { id: "j4-1-1", chapterCode: "j4-1-1", title: "第四冊 1-1 等差數列", skillIds: ["ap-core-foundation", "ap-middle-insert-modeling"] },
    { id: "j4-1-2", chapterCode: "j4-1-2", title: "第四冊 1-2 等比數列", skillIds: ["gp-core-patterns"] },
    { id: "j4-1-3", chapterCode: "j4-1-3", title: "第四冊 1-3 級數求和", skillIds: ["ap-series-sum-reverse"] },
    { id: "j4-2-1", chapterCode: "j4-2-1", title: "第四冊 2-1 函數定義", skillIds: ["function-definition-operations"] },
    { id: "j4-2-2", chapterCode: "j4-2-2", title: "第四冊 2-2 一次函數與圖形", skillIds: ["linear-function-graphing", "linear-life-modeling"] },
    { id: "j4-3-1", chapterCode: "j4-3-1", title: "第四冊 3-1 多邊形角度", skillIds: ["polygon-angle-logic"] },
    { id: "j4-3-2", chapterCode: "j4-3-2", title: "第四冊 3-2 尺規作圖", skillIds: ["construction-bisection-count"] },
    { id: "j4-3-3", chapterCode: "j4-3-3", title: "第四冊 3-3 全等與邊角關係", skillIds: ["triangle-congruence-inequality"] },
    { id: "j4-4-1", chapterCode: "j4-4-1", title: "第四冊 4-1 平行線與截角", skillIds: ["parallel-angle-structures"] },
    { id: "j4-4-2", chapterCode: "j4-4-2", title: "第四冊 4-2 平行四邊形與特殊四邊形", skillIds: ["quadrilateral-properties-family"] },
    { id: "j4-4-3", chapterCode: "j4-4-3", title: "第四冊 4-3 梯形中線與平行分割", skillIds: ["parallel-segments-midline", "geometry-integration-modeling"] },
  ];

  const j4Stages = [
    {
      id: "stage-j4-sequences",
      trackId: "junior-math-main-track",
      order: 19,
      title: "第十九階段：數列與級數",
      shortLabel: "第十九階段",
      summary: "把等差數列、等差級數與等比數列整理成一條規律主線，培養公式代入與反推能力。",
      entrySkillId: "ap-core-foundation",
      skillIds: [
        "ap-core-foundation",
        "ap-middle-insert-modeling",
        "ap-series-sum-reverse",
        "gp-core-patterns",
      ],
      unlockAfterStageIds: ["stage-j3-data-analysis"],
      nextStageId: "stage-j4-functions-graphs",
      teacherNote: "這一層最重要的是規律辨識與反推，不只是把公式背熟而已。",
    },
    {
      id: "stage-j4-functions-graphs",
      trackId: "junior-math-main-track",
      order: 20,
      title: "第二十階段：函數與圖形",
      shortLabel: "第二十階段",
      summary: "從函數定義、代入與反推，一路接到一次函數圖形、截距判讀與生活模型。",
      entrySkillId: "function-definition-operations",
      skillIds: [
        "function-definition-operations",
        "linear-function-graphing",
        "linear-life-modeling",
      ],
      unlockAfterStageIds: ["stage-j4-sequences"],
      nextStageId: "stage-j4-triangle-geometry",
      teacherNote: "學生若函數值與流程逆算不穩，後面圖形與模型題常會一起失守。",
    },
    {
      id: "stage-j4-triangle-geometry",
      trackId: "junior-math-main-track",
      order: 21,
      title: "第二十一階段：三角形與作圖基礎",
      shortLabel: "第二十一階段",
      summary: "從多邊形角度規律進入尺規作圖，再補上全等判定與邊角關係的幾何邏輯。",
      entrySkillId: "polygon-angle-logic",
      skillIds: [
        "polygon-angle-logic",
        "construction-bisection-count",
        "triangle-congruence-inequality",
      ],
      unlockAfterStageIds: ["stage-j4-functions-graphs"],
      nextStageId: "stage-j4-parallel-quadrilaterals",
      teacherNote: "這一層建議多用圖形標記與對應關係，不要只讓學生背 SSS、SAS 名稱。",
    },
    {
      id: "stage-j4-parallel-quadrilaterals",
      trackId: "junior-math-main-track",
      order: 22,
      title: "第二十二階段：平行與四邊形整合",
      shortLabel: "第二十二階段",
      summary: "整合同位角、內錯角、平行四邊形、梯形中線與平行分割，把第四冊幾何主線收束。",
      entrySkillId: "parallel-angle-structures",
      skillIds: [
        "parallel-angle-structures",
        "quadrilateral-properties-family",
        "parallel-segments-midline",
        "geometry-integration-modeling",
      ],
      unlockAfterStageIds: ["stage-j4-triangle-geometry"],
      nextStageId: "",
      teacherNote: "第四冊後段很適合加入生活建模題，像費率、分割、複利樣式或圖形配置都能接進來。",
    },
  ];

  const mergedSkills = [...baseSkills, ...j4Skills];
  const mergedChapters = [...baseChapters, ...j4Chapters];
  const mergedStages = [...baseStages, ...j4Stages];
  const mergedTracks = baseTracks.map((track) =>
    track.id !== "junior-math-main-track"
      ? track
      : {
          ...track,
          stageIds: [...(Array.isArray(track.stageIds) ? track.stageIds : []), ...j4Stages.map((stage) => stage.id)],
        },
  );

  window.practiceLearningArchitectureStore = {
    meta: {
      ...clone(base.meta || {}),
      schema: "practice-learning-architecture-v5",
      version: "2026-06-21-book4-expanded-v1",
      notes: [
        ...(Array.isArray(base.meta?.notes) ? base.meta.notes : []),
        "第四冊新增數列級數、函數圖形、三角形基礎與平行四邊形幾何能力層。",
        "第四冊部分幾何技能使用跨章相容題型補齊，以維持技能樹完整與可練性。",
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
