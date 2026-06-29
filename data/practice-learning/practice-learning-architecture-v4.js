(() => {
  const base = window.practiceLearningArchitectureStore || null;
  if (!base) {
    console.warn("practice learning architecture v3 not loaded");
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

  const j3Skills = [
    makeSkill({
      id: "formula-identities-core",
      chapterCode: "j3-1-1",
      title: "乘法公式數值與代數直覺",
      shortLabel: "乘法公式",
      summary: "從平方差、完全平方到公式化簡，建立看到結構就能反應的速度與敏感度。",
      practiceIds: [
        "practice-j3-1-1-formula-mixed-integer-drill",
        "practice-j3-1-1-formula-mixed-decimal-drill",
        "practice-j3-1-1-formula-mixed-fraction-drill",
        "practice-j3-1-1-formula-mixed-variable-drill",
        "practice-square-difference-variable-drill",
        "practice-square-difference-factorization-variable-drill",
      ],
      prerequisiteSkillIds: ["stats-distribution-judgment"],
      nextSkillIds: ["polynomial-structure-basics", "polynomial-mul-div-core"],
      mainAbilityId: "j3-algebra-polynomials",
      stageId: "stage-j3-algebra-polynomials",
      focusTags: ["第三冊", "乘法公式", "快速心算", "代數變形"],
    }),
    makeSkill({
      id: "polynomial-structure-basics",
      chapterCode: "j3-1-2",
      title: "多項式基本辨識與整理",
      shortLabel: "多項式辨識",
      summary: "分清楚項、係數、次數與升降冪，先把多項式的語言和格式穩住。",
      practiceIds: [
        "practice-j3-1-2-degree-constraint-drill",
        "practice-j3-1-2-polynomial-add-subtract-drill",
        "practice-j3-1-2-polynomial-reverse-application-drill",
      ],
      prerequisiteSkillIds: ["formula-identities-core"],
      nextSkillIds: ["polynomial-mul-div-core", "polynomial-division-theorems"],
      mainAbilityId: "j3-algebra-polynomials",
      stageId: "stage-j3-algebra-polynomials",
      focusTags: ["第三冊", "多項式", "項次", "整理"],
    }),
    makeSkill({
      id: "polynomial-mul-div-core",
      chapterCode: "j3-1-3",
      title: "多項式乘除與分配律延伸",
      shortLabel: "多項式乘除",
      summary: "把分配律從單項式推到多項式，熟悉乘法展開、單項式除法與逆向還原。",
      practiceIds: [
        "practice-j3-1-2-mul-easy-mixed-drill",
        "practice-j3-1-2-mul-advanced-mixed-drill",
        "practice-j3-1-2-div-monomial-mixed-drill",
      ],
      prerequisiteSkillIds: ["formula-identities-core", "polynomial-structure-basics"],
      nextSkillIds: ["polynomial-division-theorems", "factoring-common-grouping"],
      mainAbilityId: "j3-algebra-polynomials",
      stageId: "stage-j3-algebra-polynomials",
      focusTags: ["第三冊", "多項式", "乘法", "除法", "分配律"],
    }),
    makeSkill({
      id: "polynomial-division-theorems",
      chapterCode: "j3-1-3",
      title: "除法原理、餘式與因式定理",
      shortLabel: "除法原理",
      summary: "從 A=B×Q+R 的還原觀念延伸到餘式定理、因式定理與係數和判讀。",
      practiceIds: [
        "practice-j3-1-3-polynomial-division-regular-drill",
        "practice-j3-1-3-reverse-division-drill",
        "practice-j3-1-3-coeff-sum-drill",
        "practice-j3-1-3-remainder-theorem-drill",
        "practice-j3-1-3-factor-theorem-drill",
      ],
      prerequisiteSkillIds: ["polynomial-structure-basics", "polynomial-mul-div-core"],
      nextSkillIds: ["factoring-common-grouping", "factoring-quadratic-cross"],
      mainAbilityId: "j3-algebra-polynomials",
      stageId: "stage-j3-algebra-polynomials",
      focusTags: ["第三冊", "餘式定理", "因式定理", "逆運算"],
    }),

    makeSkill({
      id: "square-root-sense",
      chapterCode: "j3-2-1",
      title: "平方根定義與估值",
      shortLabel: "平方根",
      summary: "從完全平方數、平方根意義到介於哪兩個整數之間，建立根號的大小感。",
      practiceIds: ["practice-square-root-basic-junior"],
      prerequisiteSkillIds: ["formula-identities-core"],
      nextSkillIds: ["radical-operations-rationalize", "pythagorean-distance-applications"],
      mainAbilityId: "j3-radicals-geometry",
      stageId: "stage-j3-radicals-geometry",
      focusTags: ["第三冊", "平方根", "估值", "完全平方數"],
    }),
    makeSkill({
      id: "radical-operations-rationalize",
      chapterCode: "j3-2-2",
      title: "根式運算與分母有理化",
      shortLabel: "根式運算",
      summary: "整理最簡根式、同類根式加減、乘除拆根與分母有理化，讓根式真正可操作。",
      practiceIds: [
        "practice-radical-add-subtract-like-terms",
        "practice-radical-mul-div-split-rule",
        "practice-simplest-radical-form-junior",
        "practice-rationalize-denominator-monomial-junior",
        "practice-rationalize-denominator-binomial-junior",
      ],
      prerequisiteSkillIds: ["square-root-sense"],
      nextSkillIds: ["pythagorean-distance-applications", "quadratic-completing-formula"],
      mainAbilityId: "j3-radicals-geometry",
      stageId: "stage-j3-radicals-geometry",
      focusTags: ["第三冊", "根式", "最簡根式", "分母有理化"],
    }),
    makeSkill({
      id: "pythagorean-distance-applications",
      chapterCode: "j3-2-3",
      title: "畢氏定理與距離應用",
      shortLabel: "畢氏定理",
      summary: "把畢氏定理接到斜邊上的高、坐標兩點距離與空間對角線，形成幾何主線。",
      practiceIds: [
        "practice-j3-2-3-triple-expand-drill",
        "practice-j3-2-3-hypotenuse-altitude-drill",
        "practice-j3-2-3-coordinate-distance-drill",
        "practice-j3-2-3-spatial-diagonal-drill",
      ],
      prerequisiteSkillIds: ["square-root-sense", "radical-operations-rationalize"],
      nextSkillIds: ["factoring-common-grouping", "quadratic-word-modeling"],
      mainAbilityId: "j3-radicals-geometry",
      stageId: "stage-j3-radicals-geometry",
      focusTags: ["第三冊", "畢氏定理", "距離公式", "幾何應用"],
    }),

    makeSkill({
      id: "factoring-common-grouping",
      chapterCode: "j3-3-1",
      title: "提公因式、變號與分組",
      shortLabel: "提公因式",
      summary: "先把最基本的提取、變號與分組法練熟，為後面解方程的拆解能力打底。",
      practiceIds: [
        "practice-j3-3-1-core-factoring-mixed",
        "practice-j3-3-1-grouping-advanced-mixed",
      ],
      prerequisiteSkillIds: ["polynomial-mul-div-core"],
      nextSkillIds: ["factoring-formula-patterns", "factoring-quadratic-cross"],
      mainAbilityId: "j3-factoring",
      stageId: "stage-j3-factoring",
      focusTags: ["第三冊", "因式分解", "提公因式", "分組"],
    }),
    makeSkill({
      id: "factoring-formula-patterns",
      chapterCode: "j3-3-2",
      title: "乘法公式型因式分解",
      shortLabel: "公式分解",
      summary: "從平方差、完全平方與代換型結構反推乘積形式，訓練辨識樣式的速度。",
      practiceIds: ["practice-j3-3-2-formula-mixed"],
      prerequisiteSkillIds: ["formula-identities-core", "factoring-common-grouping"],
      nextSkillIds: ["factoring-quadratic-cross", "quadratic-factor-root"],
      mainAbilityId: "j3-factoring",
      stageId: "stage-j3-factoring",
      focusTags: ["第三冊", "因式分解", "平方差", "完全平方"],
    }),
    makeSkill({
      id: "factoring-quadratic-cross",
      chapterCode: "j3-3-3",
      title: "十字交乘與二次式分解",
      shortLabel: "十字交乘",
      summary: "整理首項係數為 1 與不為 1 的情況，也加入代換與前處理，接上二次方程。",
      practiceIds: [
        "practice-j3-3-3-cross-core-mixed",
        "practice-j3-3-3-cross-sub-mixed",
      ],
      prerequisiteSkillIds: ["factoring-common-grouping", "factoring-formula-patterns"],
      nextSkillIds: ["quadratic-factor-root", "quadratic-completing-formula"],
      mainAbilityId: "j3-factoring",
      stageId: "stage-j3-factoring",
      focusTags: ["第三冊", "十字交乘", "二次三項式", "前處理"],
    }),

    makeSkill({
      id: "quadratic-factor-root",
      chapterCode: "j3-4-1",
      title: "因式分解法與零積觀念",
      shortLabel: "因式解二次",
      summary: "把因式分解接到零積觀念，並練習標準式整理、漏根防錯與反向判讀。",
      practiceIds: [
        "practice-j3-4-1-factor-formula-solve",
        "practice-j3-4-1-cross-solve",
        "practice-j3-4-1-standard-transform-solve",
        "practice-j3-4-1-root-property-reverse",
      ],
      prerequisiteSkillIds: ["factoring-formula-patterns", "factoring-quadratic-cross"],
      nextSkillIds: ["quadratic-completing-formula", "quadratic-word-modeling"],
      mainAbilityId: "j3-quadratic-equations",
      stageId: "stage-j3-quadratic-equations",
      focusTags: ["第三冊", "一元二次方程式", "零積", "因式分解法"],
    }),
    makeSkill({
      id: "quadratic-completing-formula",
      chapterCode: "j3-4-2",
      title: "配方法、公式解與判別式",
      shortLabel: "配方公式解",
      summary: "從補半平方到公式解與判別式判根，整理一元二次方程式的完整標準工具。",
      practiceIds: [
        "practice-j3-4-2-square-root-solve",
        "practice-j3-4-2-complete-square-term",
        "practice-j3-4-2-completing-square-solve",
        "practice-j3-4-2-discriminant-judge",
        "practice-j3-4-2-formula-direct-solve",
        "practice-j3-4-2-reverse-from-square",
      ],
      prerequisiteSkillIds: ["quadratic-factor-root", "radical-operations-rationalize"],
      nextSkillIds: ["quadratic-roots-relations", "quadratic-word-modeling"],
      mainAbilityId: "j3-quadratic-equations",
      stageId: "stage-j3-quadratic-equations",
      focusTags: ["第三冊", "配方法", "公式解", "判別式"],
    }),
    makeSkill({
      id: "quadratic-roots-relations",
      chapterCode: "j3-4-2",
      title: "根與係數關係",
      shortLabel: "韋達關係",
      summary: "把兩根和、兩根積、反推方程與特殊條件整理成更高階的判斷練習。",
      practiceIds: [
        "practice-j3-4-2-roots-core-mixed",
        "practice-j3-4-2-roots-applied-mixed",
      ],
      prerequisiteSkillIds: ["quadratic-completing-formula"],
      nextSkillIds: ["quadratic-word-modeling"],
      mainAbilityId: "j3-quadratic-equations",
      stageId: "stage-j3-quadratic-equations",
      focusTags: ["第三冊", "兩根和", "兩根積", "韋達定理"],
    }),
    makeSkill({
      id: "quadratic-word-modeling",
      chapterCode: "j3-4-3",
      title: "一元二次應用題建模",
      shortLabel: "二次應用題",
      summary: "把連續整數、幾何面積、營業利潤等題型轉成二次方程，並檢查解的合理性。",
      practiceIds: [
        "practice-j3-4-3-number-property-word",
        "practice-j3-4-3-geometry-area-word",
        "practice-j3-4-3-business-sales-word",
      ],
      prerequisiteSkillIds: ["quadratic-factor-root", "quadratic-completing-formula"],
      nextSkillIds: ["j3-stats-frequency-visual", "j3-stats-central-distribution"],
      mainAbilityId: "j3-quadratic-equations",
      stageId: "stage-j3-quadratic-equations",
      focusTags: ["第三冊", "應用題", "建模", "驗算"],
    }),

    makeSkill({
      id: "j3-stats-frequency-visual",
      chapterCode: "j6-3-1",
      title: "次數分配表與圖表轉換",
      shortLabel: "統計表圖",
      summary: "把次數分配、累積次數、相對次數與圓餅圖判讀整合成第三冊的資料分析輔線。",
      practiceIds: [
        "practice-j6-3-1-frequency-distribution-eight-subtypes",
        "practice-j6-3-1-pie-chart-five-subtypes",
      ],
      prerequisiteSkillIds: ["quadratic-word-modeling"],
      nextSkillIds: ["j3-stats-central-distribution"],
      mainAbilityId: "j3-data-analysis",
      stageId: "stage-j3-data-analysis",
      focusTags: ["第三冊", "統計", "次數分配", "圖表"],
    }),
    makeSkill({
      id: "j3-stats-central-distribution",
      chapterCode: "j6-3-2",
      title: "集中趨勢與分布判斷",
      shortLabel: "統計分析",
      summary: "整理平均數、中位數、眾數、資料修正與盒狀圖判讀，補足第三冊資料閱讀能力。",
      practiceIds: [
        "practice-j6-3-2-central-tendency-six-subtypes",
        "practice-j6-3-2-quartile-boxplot-seven-subtypes",
      ],
      prerequisiteSkillIds: ["j3-stats-frequency-visual"],
      mainAbilityId: "j3-data-analysis",
      stageId: "stage-j3-data-analysis",
      focusTags: ["第三冊", "統計", "集中趨勢", "盒狀圖"],
    }),
  ];

  const j3Chapters = [
    { id: "j3-1-1", chapterCode: "j3-1-1", title: "第三冊 1-1 乘法公式", skillIds: ["formula-identities-core"] },
    { id: "j3-1-2", chapterCode: "j3-1-2", title: "第三冊 1-2 多項式基本概念", skillIds: ["polynomial-structure-basics"] },
    { id: "j3-1-3", chapterCode: "j3-1-3", title: "第三冊 1-3 多項式乘除與除法原理", skillIds: ["polynomial-mul-div-core", "polynomial-division-theorems"] },
    { id: "j3-2-1", chapterCode: "j3-2-1", title: "第三冊 2-1 平方根", skillIds: ["square-root-sense"] },
    { id: "j3-2-2", chapterCode: "j3-2-2", title: "第三冊 2-2 根式運算", skillIds: ["radical-operations-rationalize"] },
    { id: "j3-2-3", chapterCode: "j3-2-3", title: "第三冊 2-3 畢氏定理與距離", skillIds: ["pythagorean-distance-applications"] },
    { id: "j3-3-1", chapterCode: "j3-3-1", title: "第三冊 3-1 提公因式與分組", skillIds: ["factoring-common-grouping"] },
    { id: "j3-3-2", chapterCode: "j3-3-2", title: "第三冊 3-2 公式型因式分解", skillIds: ["factoring-formula-patterns"] },
    { id: "j3-3-3", chapterCode: "j3-3-3", title: "第三冊 3-3 十字交乘", skillIds: ["factoring-quadratic-cross"] },
    { id: "j3-4-1", chapterCode: "j3-4-1", title: "第三冊 4-1 因式法解一元二次", skillIds: ["quadratic-factor-root"] },
    { id: "j3-4-2", chapterCode: "j3-4-2", title: "第三冊 4-2 配方法、公式解與根的關係", skillIds: ["quadratic-completing-formula", "quadratic-roots-relations"] },
    { id: "j3-4-3", chapterCode: "j3-4-3", title: "第三冊 4-3 一元二次應用題", skillIds: ["quadratic-word-modeling"] },
    { id: "j3-data-extension", chapterCode: "j3-data-extension", title: "第三冊延伸 統計資料處理", skillIds: ["j3-stats-frequency-visual", "j3-stats-central-distribution"] },
  ];

  const j3Stages = [
    {
      id: "stage-j3-algebra-polynomials",
      trackId: "junior-math-main-track",
      order: 14,
      title: "第十四階段：乘法公式與多項式",
      shortLabel: "第十四階段",
      summary: "第三冊代數主線的起點。先把乘法公式、多項式整理、多項式乘除與除法原理做成一條完整反應鏈。",
      entrySkillId: "formula-identities-core",
      skillIds: [
        "formula-identities-core",
        "polynomial-structure-basics",
        "polynomial-mul-div-core",
        "polynomial-division-theorems",
      ],
      unlockAfterStageIds: ["stage-j2-data-analysis"],
      nextStageId: "stage-j3-radicals-geometry",
      teacherNote: "這一層是第三冊代數主幹，速度與準確度會直接影響後面的因式分解與一元二次方程式。",
    },
    {
      id: "stage-j3-radicals-geometry",
      trackId: "junior-math-main-track",
      order: 15,
      title: "第十五階段：平方根、根式與畢氏定理",
      shortLabel: "第十五階段",
      summary: "把數域擴張到無理數，並把根式運算與畢氏定理連到幾何與距離應用。",
      entrySkillId: "square-root-sense",
      skillIds: [
        "square-root-sense",
        "radical-operations-rationalize",
        "pythagorean-distance-applications",
      ],
      unlockAfterStageIds: ["stage-j3-algebra-polynomials"],
      nextStageId: "stage-j3-factoring",
      teacherNote: "根式這一層雖然看起來偏幾何，但其實會回頭影響配方法與公式解的接受度。",
    },
    {
      id: "stage-j3-factoring",
      trackId: "junior-math-main-track",
      order: 16,
      title: "第十六階段：因式分解主線",
      shortLabel: "第十六階段",
      summary: "從提公因式、分組到公式型與十字交乘，建立解一元二次前最關鍵的拆解能力。",
      entrySkillId: "factoring-common-grouping",
      skillIds: [
        "factoring-common-grouping",
        "factoring-formula-patterns",
        "factoring-quadratic-cross",
      ],
      unlockAfterStageIds: ["stage-j3-algebra-polynomials"],
      nextStageId: "stage-j3-quadratic-equations",
      teacherNote: "如果學生十字交乘一直卡住，通常要回頭檢查乘法公式與多項式乘法是否真的熟。",
    },
    {
      id: "stage-j3-quadratic-equations",
      trackId: "junior-math-main-track",
      order: 17,
      title: "第十七階段：一元二次方程式",
      shortLabel: "第十七階段",
      summary: "整合因式法、配方法、公式解、判別式與根係數關係，再帶回應用題建模。",
      entrySkillId: "quadratic-factor-root",
      skillIds: [
        "quadratic-factor-root",
        "quadratic-completing-formula",
        "quadratic-roots-relations",
        "quadratic-word-modeling",
      ],
      unlockAfterStageIds: ["stage-j3-factoring", "stage-j3-radicals-geometry"],
      nextStageId: "stage-j3-data-analysis",
      teacherNote: "這一層最容易出現『公式會背但不會選方法』，所以建議保留多種入口並強化判題。",
    },
    {
      id: "stage-j3-data-analysis",
      trackId: "junior-math-main-track",
      order: 18,
      title: "第十八階段：統計資料處理",
      shortLabel: "第十八階段",
      summary: "把次數分配表、圖表轉換、集中趨勢與分布判讀做成第三冊的資料分析輔線。",
      entrySkillId: "j3-stats-frequency-visual",
      skillIds: ["j3-stats-frequency-visual", "j3-stats-central-distribution"],
      unlockAfterStageIds: ["stage-j3-quadratic-equations"],
      nextStageId: "",
      teacherNote: "這一段可當學期末整理，也很適合老師用來做非代數型的補充與統整。",
    },
  ];

  const mergedSkills = [...baseSkills, ...j3Skills];
  const mergedChapters = [...baseChapters, ...j3Chapters];
  const mergedStages = [...baseStages, ...j3Stages];
  const mergedTracks = baseTracks.map((track) =>
    track.id !== "junior-math-main-track"
      ? track
      : {
          ...track,
          stageIds: [...(Array.isArray(track.stageIds) ? track.stageIds : []), ...j3Stages.map((stage) => stage.id)],
        },
  );

  window.practiceLearningArchitectureStore = {
    meta: {
      ...clone(base.meta || {}),
      schema: "practice-learning-architecture-v4",
      version: "2026-06-21-book3-expanded-v1",
      notes: [
        ...(Array.isArray(base.meta?.notes) ? base.meta.notes : []),
        "第三冊新增乘法公式、多項式、根式、因式分解、一元二次方程式與統計資料處理能力層。",
        "第三冊整理成代數主線、幾何根式主線與資料分析輔線，較符合實際教學節奏。",
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
