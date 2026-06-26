(() => {
  const base = window.practiceLearningArchitectureStore || null;
  if (!base) {
    console.warn("practice learning architecture v5 not loaded");
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

  const j5Skills = [
    makeSkill({
      id: "ratio-proof-bridge",
      chapterCode: "j5-1-1",
      title: "比例式轉換與生活分配",
      shortLabel: "比例先備",
      summary: "先把比例式轉換、乘積分式互換、生活分配與變動比例做熟，作為第五冊所有幾何證明的先備語言。",
      practiceIds: [
        "practice-j5-1-1-ratio-conversion-five-subtypes",
        "practice-j5-1-1-ratio-algebra-three-subtypes",
        "practice-j5-1-1-life-ratio-five-subtypes",
      ],
      prerequisiteSkillIds: ["geometry-integration-modeling"],
      nextSkillIds: ["parallel-proportional-segments", "circle-line-position-chord"],
      mainAbilityId: "j5-proof-roots",
      stageId: "stage-j5-proof-roots",
      focusTags: ["第五冊", "先備", "比例式", "生活分配"],
    }),
    makeSkill({
      id: "triangle-congruence-proof-bridge",
      chapterCode: "j5-3-2",
      title: "全等、平行與證明格式先備",
      shortLabel: "證明先備",
      summary: "把全等、平行線性質與已知求證證明格式重新整理，避免第五冊一開始就卡在證明語言。",
      practiceIds: [
        "practice-j5-3-2-congruence-five-subtypes",
      ],
      prerequisiteSkillIds: ["triangle-congruence-inequality", "parallel-angle-structures"],
      nextSkillIds: ["parallel-proportional-segments", "proof-and-parity"],
      mainAbilityId: "j5-proof-roots",
      stageId: "stage-j5-proof-roots",
      focusTags: ["第五冊", "先備", "全等", "證明格式"],
    }),

    makeSkill({
      id: "parallel-proportional-segments",
      chapterCode: "j5-1-2",
      title: "平行線截比例線段",
      shortLabel: "比例線段",
      summary: "整理三角形、梯形與多組平行線中的比例線段性質與逆定理，是相似形的入口。",
      practiceIds: [
        "practice-j5-1-2-parallel-core-five-subtypes",
        "practice-j5-1-2-triangle-parallel-five-subtypes",
        "practice-j5-1-2-trapezoid-parallel-three-subtypes",
      ],
      prerequisiteSkillIds: ["ratio-proof-bridge", "triangle-congruence-proof-bridge"],
      nextSkillIds: ["similarity-criteria-scaling", "similarity-area-measurement"],
      mainAbilityId: "j5-similarity",
      stageId: "stage-j5-similarity",
      focusTags: ["第五冊", "相似形", "比例線段", "平行截線"],
    }),
    makeSkill({
      id: "similarity-criteria-scaling",
      chapterCode: "j5-1-3",
      title: "相似判別與縮放對應",
      shortLabel: "相似判別",
      summary: "從 AA、SAS、SSS 到對應元素、縮放比例與圖形母子相似，建立相似三角形核心觀念。",
      practiceIds: [
        "practice-j5-1-3-similarity-criteria-five-subtypes",
        "practice-j5-1-3-scaling-five-subtypes",
      ],
      prerequisiteSkillIds: ["parallel-proportional-segments"],
      nextSkillIds: ["similarity-area-measurement", "advanced-similarity-special"],
      mainAbilityId: "j5-similarity",
      stageId: "stage-j5-similarity",
      focusTags: ["第五冊", "相似判別", "縮放", "對應邊角"],
    }),
    makeSkill({
      id: "similarity-area-measurement",
      chapterCode: "j5-1-3",
      title: "相似比、面積比與測量",
      shortLabel: "相似應用",
      summary: "把對應邊長比、面積平方比、影子、鏡長、針孔與河寬等實測題型整合起來。",
      practiceIds: [
        "practice-j5-1-3-ratio-area-four-subtypes",
        "practice-j5-1-3-measurement-four-subtypes",
      ],
      prerequisiteSkillIds: ["similarity-criteria-scaling"],
      nextSkillIds: ["advanced-similarity-special", "circle-line-position-chord"],
      mainAbilityId: "j5-similarity",
      stageId: "stage-j5-similarity",
      focusTags: ["第五冊", "相似比", "面積比", "實測"],
    }),
    makeSkill({
      id: "advanced-similarity-special",
      chapterCode: "j5-1-4",
      title: "子母相似與直角三角形相似",
      shortLabel: "特殊相似",
      summary: "把子母相似、直角三角形斜邊高、投影與比值面積整理成進階相似能力。",
      practiceIds: [
        "practice-j5-1-4-measurement-five-subtypes",
        "practice-j5-1-4-ratio-area-four-subtypes",
        "practice-j5-1-4-right-midpoint-four-subtypes",
        "practice-j5-1-4-trig-basic-four-subtypes",
        "practice-j5-1-4-trig-application-four-subtypes",
        "practice-j5-1-3-right-altitude-three-subtypes",
        "practice-j5-1-3-butterfly-three-subtypes",
      ],
      prerequisiteSkillIds: ["similarity-criteria-scaling", "similarity-area-measurement"],
      nextSkillIds: ["circle-line-position-chord", "advanced-synthesis-euler-centers"],
      mainAbilityId: "j5-similarity",
      stageId: "stage-j5-similarity",
      focusTags: ["第五冊", "子母相似", "斜邊高", "進階綜合"],
    }),

    makeSkill({
      id: "circle-line-position-chord",
      chapterCode: "j5-2-1",
      title: "點、直線與圓的位置關係",
      shortLabel: "圓的基本位置",
      summary: "整理相切、相交、不相交與弦心距關係，建立從線段距離看圓的第一層直覺。",
      practiceIds: [
        "practice-j5-2-1-point-line-circle-three-subtypes",
        "practice-j5-2-1-chord-distance-four-subtypes",
        "practice-j5-2-1-two-circle-tangent-four-subtypes",
        "practice-j5-2-1-tangent-polygon-three-subtypes",
        "practice-j5-2-1-coordinate-circle-five-subtypes",
      ],
      prerequisiteSkillIds: ["ratio-proof-bridge"],
      nextSkillIds: ["circle-angles-arcs-sectors", "power-of-point-composite"],
      mainAbilityId: "j5-circle-properties",
      stageId: "stage-j5-circle-properties",
      focusTags: ["第五冊", "圓", "位置關係", "弦心距"],
    }),
    makeSkill({
      id: "circle-angles-arcs-sectors",
      chapterCode: "j5-2-2",
      title: "圓周角、弧度關係與圓內外角",
      shortLabel: "圓角與弧",
      summary: "把圓心角、圓周角、扇形、圓內角、圓外角與圓內接四邊形整理成一個角度體系。",
      practiceIds: [
        "practice-j5-2-2-central-arc-sector-four-subtypes",
        "practice-j5-2-2-inscribed-angle-five-subtypes",
        "practice-j5-2-2-cyclic-quadrilateral-four-subtypes",
        "practice-j5-2-2-interior-exterior-angle-five-subtypes",
        "practice-j5-2-2-arc-distribution-five-subtypes",
      ],
      prerequisiteSkillIds: ["circle-line-position-chord"],
      nextSkillIds: ["power-of-point-composite", "advanced-synthesis-euler-centers"],
      mainAbilityId: "j5-circle-properties",
      stageId: "stage-j5-circle-properties",
      focusTags: ["第五冊", "圓周角", "圓心角", "圓內外角", "內接四邊形"],
    }),
    makeSkill({
      id: "power-of-point-composite",
      chapterCode: "j5-2-3",
      title: "圓冪與弦切割線",
      shortLabel: "圓冪",
      summary: "從基本圓冪到半徑、弦長、切線與代數混合題，建立圓中乘積關係的熟練度。",
      practiceIds: [
        "practice-j5-2-3-power-basic-four-subtypes",
        "practice-j5-2-3-algebra-five-subtypes",
        "practice-j5-2-3-radius-power-five-subtypes",
        "practice-j5-2-3-chord-distance-four-subtypes",
        "practice-j5-2-3-ratio-composite-five-subtypes",
      ],
      prerequisiteSkillIds: ["circle-line-position-chord", "circle-angles-arcs-sectors"],
      nextSkillIds: ["proof-and-parity", "advanced-synthesis-euler-centers"],
      mainAbilityId: "j5-circle-properties",
      stageId: "stage-j5-circle-properties",
      focusTags: ["第五冊", "圓冪", "切割線", "弦", "代數幾何"],
    }),

    makeSkill({
      id: "proof-and-parity",
      chapterCode: "j5-3-1",
      title: "推理證明與奇偶整除",
      shortLabel: "推理證明",
      summary: "把已知、求證、證明三段格式，和奇偶、整除、餘數、不等式型代數證明整理成證明入口。",
      practiceIds: [
        "practice-j5-3-1-parity-five-subtypes",
        "practice-j5-3-1-divisibility-five-subtypes",
        "practice-j5-3-1-remainder-five-subtypes",
        "practice-j5-3-1-consecutive-five-subtypes",
        "practice-j5-3-1-inequality-eight-subtypes",
      ],
      prerequisiteSkillIds: ["triangle-congruence-proof-bridge", "ratio-proof-bridge"],
      nextSkillIds: ["triangle-centers-proof", "advanced-synthesis-euler-centers"],
      mainAbilityId: "j5-proof-centers",
      stageId: "stage-j5-proof-centers",
      focusTags: ["第五冊", "推理證明", "奇偶", "整除", "餘數"],
    }),
    makeSkill({
      id: "triangle-centers-proof",
      chapterCode: "j5-3-2",
      title: "外心、內心、重心的性質與面積",
      shortLabel: "三心基礎",
      summary: "從中垂線、角平分線、中線交點出發，整理三心的位置、距離比與面積分割。",
      practiceIds: [
        "practice-j5-3-2-centers-five-subtypes",
        "practice-j5-3-2-centroid-area-five-subtypes",
      ],
      prerequisiteSkillIds: ["proof-and-parity", "triangle-congruence-proof-bridge"],
      nextSkillIds: ["triangle-centers-advanced-coordinate", "advanced-synthesis-euler-centers"],
      mainAbilityId: "j5-proof-centers",
      stageId: "stage-j5-proof-centers",
      focusTags: ["第五冊", "外心", "內心", "重心", "面積分割"],
    }),
    makeSkill({
      id: "triangle-centers-advanced-coordinate",
      chapterCode: "j5-3-3",
      title: "三心進階、座標與特殊三角形",
      shortLabel: "三心進階",
      summary: "把外心、內心、重心帶進座標、正三角形、直角三角形與特殊距離關係。",
      practiceIds: [
        "practice-j5-3-3-circumcenter-five-subtypes",
        "practice-j5-3-3-incenter-six-subtypes",
        "practice-j5-3-3-centroid-six-subtypes",
        "practice-j5-3-3-coordinate-five-subtypes",
        "practice-j5-3-3-special-five-subtypes",
      ],
      prerequisiteSkillIds: ["triangle-centers-proof"],
      nextSkillIds: ["advanced-synthesis-euler-centers"],
      mainAbilityId: "j5-proof-centers",
      stageId: "stage-j5-proof-centers",
      focusTags: ["第五冊", "三心", "座標", "尤拉線", "特殊三角形"],
    }),
    makeSkill({
      id: "advanced-synthesis-euler-centers",
      chapterCode: "j5-3-3",
      title: "尤拉線與綜合幾何應用",
      shortLabel: "技能巔峰",
      summary: "整合相似形、圓與三心，處理尤拉線、綜合座標、特殊三角形距離與複合圖形周長面積。",
      practiceIds: [
        "practice-j5-3-3-coordinate-five-subtypes",
        "practice-j5-3-3-special-five-subtypes",
        "practice-j5-2-2-cyclic-quadrilateral-four-subtypes",
        "practice-j5-2-3-ratio-composite-five-subtypes",
        "practice-j5-1-4-trig-application-four-subtypes",
      ],
      prerequisiteSkillIds: [
        "advanced-similarity-special",
        "circle-angles-arcs-sectors",
        "power-of-point-composite",
        "triangle-centers-advanced-coordinate",
      ],
      mainAbilityId: "j5-proof-centers",
      stageId: "stage-j5-proof-centers",
      focusTags: ["第五冊", "尤拉線", "綜合題", "座標幾何", "技能巔峰"],
    }),
  ];

  const j5Chapters = [
    { id: "j5-proof-roots", chapterCode: "j5-proof-roots", title: "第五冊先備 比例與證明根基", skillIds: ["ratio-proof-bridge", "triangle-congruence-proof-bridge"] },
    { id: "j5-1-2", chapterCode: "j5-1-2", title: "第五冊 1-1 比例線段", skillIds: ["parallel-proportional-segments"] },
    { id: "j5-1-3", chapterCode: "j5-1-3", title: "第五冊 1-2 相似形與測量", skillIds: ["similarity-criteria-scaling", "similarity-area-measurement"] },
    { id: "j5-1-4", chapterCode: "j5-1-4", title: "第五冊 1-3 特殊相似與直角應用", skillIds: ["advanced-similarity-special"] },
    { id: "j5-2-1", chapterCode: "j5-2-1", title: "第五冊 2-1 點線圓位置關係", skillIds: ["circle-line-position-chord"] },
    { id: "j5-2-2", chapterCode: "j5-2-2", title: "第五冊 2-2 圓周角與弧", skillIds: ["circle-angles-arcs-sectors"] },
    { id: "j5-2-3", chapterCode: "j5-2-3", title: "第五冊 2-3 圓冪與切割線", skillIds: ["power-of-point-composite"] },
    { id: "j5-3-1", chapterCode: "j5-3-1", title: "第五冊 3-1 推理證明基礎", skillIds: ["proof-and-parity"] },
    { id: "j5-3-2", chapterCode: "j5-3-2", title: "第五冊 3-2 三心性質與證明", skillIds: ["triangle-centers-proof"] },
    { id: "j5-3-3", chapterCode: "j5-3-3", title: "第五冊 3-3 三心進階與綜合", skillIds: ["triangle-centers-advanced-coordinate", "advanced-synthesis-euler-centers"] },
  ];

  const j5Stages = [
    {
      id: "stage-j5-proof-roots",
      trackId: "junior-math-main-track",
      order: 23,
      title: "第二十三階段：第五冊先備根基",
      shortLabel: "第二十三階段",
      summary: "先把比例轉換、分配、全等、平行與證明格式整理好，讓後續相似形與三心證明能順利展開。",
      entrySkillId: "ratio-proof-bridge",
      skillIds: ["ratio-proof-bridge", "triangle-congruence-proof-bridge"],
      unlockAfterStageIds: ["stage-j4-parallel-quadrilaterals"],
      nextStageId: "stage-j5-similarity",
      teacherNote: "這一段雖然像暖身，但其實是第五冊後面所有證明題的語言基礎。",
    },
    {
      id: "stage-j5-similarity",
      trackId: "junior-math-main-track",
      order: 24,
      title: "第二十四階段：相似形主線",
      shortLabel: "第二十四階段",
      summary: "從比例線段、相似判別到面積比、測量與子母相似，把第五冊第一大分枝完整接起來。",
      entrySkillId: "parallel-proportional-segments",
      skillIds: [
        "parallel-proportional-segments",
        "similarity-criteria-scaling",
        "similarity-area-measurement",
        "advanced-similarity-special",
      ],
      unlockAfterStageIds: ["stage-j5-proof-roots"],
      nextStageId: "stage-j5-circle-properties",
      teacherNote: "這一層不只是在算比例，更重要的是看出哪兩個圖形其實在偷偷相似。",
    },
    {
      id: "stage-j5-circle-properties",
      trackId: "junior-math-main-track",
      order: 25,
      title: "第二十五階段：圓的性質主線",
      shortLabel: "第二十五階段",
      summary: "整理點線圓位置、弦心距、圓周角、內外角與圓冪，建立完整的圓幾何規律網。",
      entrySkillId: "circle-line-position-chord",
      skillIds: [
        "circle-line-position-chord",
        "circle-angles-arcs-sectors",
        "power-of-point-composite",
      ],
      unlockAfterStageIds: ["stage-j5-similarity"],
      nextStageId: "stage-j5-proof-centers",
      teacherNote: "學生常把角度關係和乘積關係混在一起，這一段要刻意分層練習再做綜合。",
    },
    {
      id: "stage-j5-proof-centers",
      trackId: "junior-math-main-track",
      order: 26,
      title: "第二十六階段：推理證明與三心",
      shortLabel: "第二十六階段",
      summary: "從代數證明、幾何證明一路接到外心、內心、重心、尤拉線與綜合座標應用。",
      entrySkillId: "proof-and-parity",
      skillIds: [
        "proof-and-parity",
        "triangle-centers-proof",
        "triangle-centers-advanced-coordinate",
        "advanced-synthesis-euler-centers",
      ],
      unlockAfterStageIds: ["stage-j5-circle-properties"],
      nextStageId: "",
      teacherNote: "第五冊真正的難點不是單一公式，而是要在多條幾何性質中找到可以串起證明的關鍵線索。",
    },
  ];

  const mergedSkills = [...baseSkills, ...j5Skills];
  const mergedChapters = [...baseChapters, ...j5Chapters];
  const mergedStages = [...baseStages, ...j5Stages];
  const mergedTracks = baseTracks.map((track) =>
    track.id !== "junior-math-main-track"
      ? track
      : {
          ...track,
          stageIds: [...(Array.isArray(track.stageIds) ? track.stageIds : []), ...j5Stages.map((stage) => stage.id)],
        },
  );

  window.practiceLearningArchitectureStore = {
    meta: {
      ...clone(base.meta || {}),
      schema: "practice-learning-architecture-v6",
      version: "2026-06-21-book5-expanded-v1",
      notes: [
        ...(Array.isArray(base.meta?.notes) ? base.meta.notes : []),
        "第五冊新增相似形、圓的性質、推理證明與三心能力層，並補上先備根基階段。",
        "第五冊整理成先備根基、相似形主線、圓主線與三心證明巔峰，較符合實際教學與補習班節奏。",
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
