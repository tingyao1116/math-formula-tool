(() => {
  const abilityStore = window.practiceAbilityMapStore || null;

  function createMission({
    id,
    type,
    stageId,
    title,
    mapLabel,
    summary,
    storyHook,
    rewardText,
    prerequisiteMissionIds = [],
    nextMissionIds = [],
    recommended = false,
  }) {
    return {
      id,
      type,
      stageId,
      title,
      mapLabel,
      summary,
      storyHook,
      rewardText,
      prerequisiteMissionIds,
      nextMissionIds,
      recommended,
    };
  }

  const missions = [
    createMission({
      id: "main-algebra-camp",
      type: "main",
      stageId: "stage-j3-algebra-polynomials",
      title: "主線 1：代數營地",
      mapLabel: "Root Camp",
      summary: "先用整式運算與乘法公式整理代數地形，建立國三複習與高一先修的共同起點。",
      storyHook: "你需要先修好代數營地的符號機關，後面的因式分解與二次方程式大門才會開啟。",
      rewardText: "解鎖乘法公式、整式乘除與代數變形主線。",
      nextMissionIds: ["main-factor-vault", "side-radical-workshop"],
      recommended: true,
    }),
    createMission({
      id: "main-factor-vault",
      type: "main",
      stageId: "stage-j3-factoring",
      title: "主線 2：因式分解密庫",
      mapLabel: "Factor Vault",
      summary: "把乘法公式反過來用，練到能快速辨識提公因式、公式分解與十字交乘。",
      storyHook: "密庫裡的門鎖都不是直接展開，而是要看出可以拆成哪兩個因式。",
      rewardText: "解鎖因式分解核心與二次方程式前置技巧。",
      prerequisiteMissionIds: ["main-algebra-camp"],
      nextMissionIds: ["main-quadratic-gate"],
    }),
    createMission({
      id: "main-quadratic-gate",
      type: "main",
      stageId: "stage-j3-quadratic-equations",
      title: "主線 3：二次方程式之門",
      mapLabel: "Quadratic Gate",
      summary: "整合因式分解、配方法與公式解，能判斷該用哪一種方法最省步驟。",
      storyHook: "大門每次只給你一點線索，你要判斷是因式分解、配方法，還是直接用公式解。",
      rewardText: "解鎖配方法、判別式與公式解練習。",
      prerequisiteMissionIds: ["main-factor-vault"],
      nextMissionIds: ["main-linear-station", "side-modeling-lab"],
    }),
    createMission({
      id: "main-linear-station",
      type: "main",
      stageId: "stage-j4-functions-graphs",
      title: "主線 4：一次函數車站",
      mapLabel: "Linear Station",
      summary: "從函數值、兩點式到截距與圖形，整理一次函數在國三到高一之間最常用的觀念。",
      storyHook: "車站路線圖看起來像很多直線，其實每一條都對應一個規則與圖形判讀。",
      rewardText: "解鎖一次函數圖形、交點與生活應用。",
      prerequisiteMissionIds: ["main-quadratic-gate"],
      nextMissionIds: ["main-parabola-entry"],
    }),
    createMission({
      id: "main-parabola-entry",
      type: "main",
      stageId: "stage-j6-quadratic-entry",
      title: "主線 5：拋物線入口",
      mapLabel: "Parabola Entry",
      summary: "先從 y=ax^2 的開口、對稱軸與圖形特徵進入二次函數世界。",
      storyHook: "這裡不是先背公式，而是要先看懂圖形開口方向、寬窄與點落在什麼位置。",
      rewardText: "解鎖二次函數基本圖形與係數判讀。",
      prerequisiteMissionIds: ["main-linear-station"],
      nextMissionIds: ["main-parabola-lab"],
    }),
    createMission({
      id: "main-parabola-lab",
      type: "main",
      stageId: "stage-j6-quadratic-transform",
      title: "主線 6：二次函數工坊",
      mapLabel: "Quadratic Lab",
      summary: "用頂點式、平移、交點與極值，把二次函數正式接到高一課程節奏。",
      storyHook: "工坊的核心不是算快，而是能在標準式、頂點式與圖形之間切換。",
      rewardText: "完成國三複習與高一先修主線。",
      prerequisiteMissionIds: ["main-parabola-entry"],
      nextMissionIds: ["side-modeling-lab"],
    }),
    createMission({
      id: "side-radical-workshop",
      type: "side",
      stageId: "stage-j3-radicals-geometry",
      title: "支線：平方根補給站",
      mapLabel: "Root Workshop",
      summary: "補強平方根、根式與配方法常用的代數直覺，降低二次方程式卡關率。",
      storyHook: "如果你常在配方法卡住，先回補這一站，很多式子的變形會順很多。",
      rewardText: "補齊配方法與根式運算基礎。",
      prerequisiteMissionIds: ["main-algebra-camp"],
    }),
    createMission({
      id: "side-modeling-lab",
      type: "side",
      stageId: "stage-j6-quadratic-modeling",
      title: "支線：建模試煉室",
      mapLabel: "Modeling Lab",
      summary: "把二次函數接到面積最佳化、極值判斷與文字情境。",
      storyHook: "這間試煉室專門考你能不能把題意轉成式子，不只是看圖判答案。",
      rewardText: "把二次函數從圖形提升到應用題層次。",
      prerequisiteMissionIds: ["main-parabola-lab"],
    }),
  ];

  const meta = {
    id: "junior-review-quest",
    title: "國三複習解謎任務",
    summary: "以國三複習與升高一先修為主，將必要能力整理成主線闖關與支線補給。",
    recommendedMissionId: missions.find((mission) => mission.recommended)?.id || missions[0]?.id || "",
    stageSourceReady: Boolean(abilityStore),
  };

  window.practiceQuestCampaignStore = {
    meta,
    getMissions() {
      return missions.slice();
    },
  };
})();
