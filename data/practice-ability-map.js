(() => {
  const architecture = window.practiceLearningArchitectureStore || null;
  if (!architecture) {
    console.warn("practice learning architecture not loaded");
    return;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  const skills = architecture.getSkills?.() || [];
  const stages = architecture.getAbilityStages?.() || [];
  const tracks = architecture.getAbilityTracks?.() || [];

  window.practiceAbilityMapStore = {
    meta: {
      ...clone(architecture.meta || {}),
      schema: "practice-ability-map-v2",
      version: "2026-06-21-ability-indicator-v2",
      notes: [
        "能力指標頁以階段入口為主，不要求學生先看完整棵樹。",
        "每個階段有一個主要入口技能，必要時再展開本階段全部內容。",
      ],
    },
    getMasteryStages() {
      return clone(architecture.getMasteryStages?.() || []);
    },
    getMistakeTags() {
      return clone(architecture.getMistakeTags?.() || []);
    },
    getSkills() {
      return clone(skills);
    },
    getAbilityTracks() {
      return clone(tracks);
    },
    getAbilityStages() {
      return clone(stages);
    },
    getAbilityStageById(id) {
      return clone(stages.find((entry) => entry.id === id) || null);
    },
    getSkillById(id) {
      return clone(skills.find((entry) => entry.id === id) || null);
    },
  };
})();
