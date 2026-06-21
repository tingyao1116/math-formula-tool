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
  const chapters = architecture.getSkillTreeChapters?.() || [];

  window.practiceSkillTreeStore = {
    meta: {
      ...clone(architecture.meta || {}),
      schema: "practice-skill-tree-v2",
      version: "2026-06-21-skill-tree-v2",
      notes: [
        "技能樹保留自由選擇性，適合學生自行補強或老師指派練習。",
        "章節順序保留，但節點主體改成技能。",
      ],
    },
    getMasteryStages() {
      return clone(architecture.getMasteryStages?.() || []);
    },
    getMistakeTags() {
      return clone(architecture.getMistakeTags?.() || []);
    },
    getChapterTree() {
      return clone(chapters);
    },
    getSkillNodes() {
      return clone(skills);
    },
    getSkillNodeById(id) {
      return clone(skills.find((entry) => entry.id === id) || null);
    },
  };
})();
