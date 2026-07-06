(() => {
  const SCHOOL_YEAR_ID = "2026-2027";

  const periodDefinitions = [
    {
      id: "summer",
      title: "暑假",
      startDate: "2026-07-01",
      endDate: "2026-08-31",
      kind: "break",
      note: "適合補前置能力、做國一上銜接與診斷。"
    },
    {
      id: "term1-exam1",
      title: "上一段",
      startDate: "2026-09-01",
      endDate: "2026-10-15",
      kind: "exam-period",
      note: "國一上第一段考範圍。"
    },
    {
      id: "term1-exam2",
      title: "上二段",
      startDate: "2026-10-16",
      endDate: "2026-11-30",
      kind: "exam-period",
      note: "原需求寫 11 月 31 日，資料中修正為 11 月 30 日。"
    },
    {
      id: "term1-exam3",
      title: "上三段",
      startDate: "2026-12-01",
      endDate: "2027-01-15",
      kind: "exam-period",
      note: "國一上第三段考與期末整理。"
    },
    {
      id: "winter",
      title: "寒假",
      startDate: "2027-01-16",
      endDate: "2027-02-15",
      kind: "break",
      note: "適合補國一上弱點，銜接國一下。"
    },
    {
      id: "term2-exam1",
      title: "下一段",
      startDate: "2027-02-16",
      endDate: "2027-03-31",
      kind: "exam-period",
      note: "國一下第一段考範圍。"
    },
    {
      id: "term2-exam2",
      title: "下二段",
      startDate: "2027-04-01",
      endDate: "2027-05-15",
      kind: "exam-period",
      note: "國一下第二段考範圍。"
    },
    {
      id: "term2-exam3",
      title: "下三段",
      startDate: "2027-05-16",
      endDate: "2027-06-30",
      kind: "exam-period",
      note: "原需求寫 6 月 31 日，資料中修正為 6 月 30 日。"
    }
  ];

  const j1BridgeEightWeekPlan = {
    id: "schedule-j1-bridge-8-week-2026",
    title: "國一上銜接八週安排",
    grade: "國一",
    schoolYearId: SCHOOL_YEAR_ID,
    ownerType: "schedule",
    purpose: "暑假銜接與國一上第一輪建模",
    defaultQuestionCount: 5,
    phaseRule: {
      firstHalf: "infinite-practice",
      secondHalf: "question-bank",
      note: "前四週用無限練習建立熟練度，後四週保留同章範圍並切換成題庫練習。"
    },
    weeks: [
      {
        week: 1,
        periodId: "summer",
        dateRange: { startDate: "2026-07-01", endDate: "2026-07-07" },
        mode: "infinite-practice",
        title: "正負數、相反數與數線",
        chapterCodes: ["j1-1-1"],
        practiceIds: [
          "practice-opposite-basic-concept-drill",
          "practice-j1-1-1-opposite-four-subtypes",
          "practice-j1-1-1-opposite-sum-difference-drill",
          "practice-opposite-compare-drill",
          "practice-opposite-side-of-origin-drill"
        ],
        teachingFocus: ["會把情境量轉成正負號", "會在數線上看方向與距離", "避免把相反數誤當倒數"]
      },
      {
        week: 2,
        periodId: "summer",
        dateRange: { startDate: "2026-07-08", endDate: "2026-07-14" },
        mode: "infinite-practice",
        title: "絕對值、距離與中點",
        chapterCodes: ["j1-1-1"],
        practiceIds: [
          "practice-abs-two-group-calc-drill",
          "practice-abs-remove-and-calc-drill",
          "practice-abs-count-basic-drill",
          "practice-midpoint-formula",
          "practice-number-line-midpoint-distance-reverse-mixed-drill"
        ],
        teachingFocus: ["絕對值先想距離再計算", "中點與距離分開判斷", "注意距離永遠非負"]
      },
      {
        week: 3,
        periodId: "summer",
        dateRange: { startDate: "2026-07-15", endDate: "2026-07-21" },
        mode: "infinite-practice",
        title: "整數加減、括號與分配律",
        chapterCodes: ["j1-1-2"],
        practiceIds: [
          "practice-integer-add-subtract-brackets-drill",
          "practice-integer-canceling-brackets-drill",
          "practice-j1-1-2-bracket-order-five-subtypes",
          "practice-j1-distributive-law-drill",
          "practice-j1-1-2-distributive-factor-nine-subtypes"
        ],
        teachingFocus: ["先處理括號再處理符號", "同號相加、異號相減要回到數線理解", "分配律不要漏乘後項"]
      },
      {
        week: 4,
        periodId: "summer",
        dateRange: { startDate: "2026-07-22", endDate: "2026-07-28" },
        mode: "infinite-practice",
        title: "乘除、指數與科學記號",
        chapterCodes: ["j1-1-2", "j1-1-3", "j1-1-4"],
        practiceIds: [
          "practice-j1-1-2-substitution-five-subtypes",
          "practice-j1-1-2-pattern-five-subtypes",
          "practice-j1-1-3-exponent-law-three-subtypes",
          "practice-j1-1-4-scientific-convert-drill"
        ],
        teachingFocus: ["負數乘方先看括號", "指數律先分清底數是否相同", "科學記號注意小數點移動方向"]
      },
      {
        week: 5,
        periodId: "summer",
        dateRange: { startDate: "2026-07-29", endDate: "2026-08-04" },
        mode: "question-bank",
        title: "因數倍數與質因數分解題庫",
        chapterCodes: ["j1-2-1"],
        practiceIds: [
          "practice-j1-2-1-divisibility-digit-fill-drill",
          "practice-j1-2-1-prime-factor-notation-drill",
          "practice-j1-2-1-divisor-count-sum-mixed-drill"
        ],
        questionBankFilters: { chapterCodes: ["j1-2-1"], difficulty: ["easy", "medium"] },
        teachingFocus: ["3、9、11 倍數判斷要形成反射", "標準分解式要寫完整", "質數、質因數、因數不要混用"]
      },
      {
        week: 6,
        periodId: "summer",
        dateRange: { startDate: "2026-08-05", endDate: "2026-08-11" },
        mode: "question-bank",
        title: "最大公因數、最小公倍數與分數銜接",
        chapterCodes: ["j1-2-2", "j1-2-3"],
        practiceIds: [
          "practice-j1-2-2-gcd-grouping-application",
          "practice-j1-2-2-lcm-periodic-application",
          "practice-j1-2-3-fraction-add-sub-brackets-drill",
          "practice-j1-2-3-fraction-mul-div-mixed-drill"
        ],
        questionBankFilters: { chapterCodes: ["j1-2-2", "j1-2-3"], difficulty: ["easy", "medium"] },
        teachingFocus: ["GCD 用在分組或同時整除", "LCM 用在同時發生或共同倍數", "分數加減先通分，乘除先約分"]
      },
      {
        week: 7,
        periodId: "summer",
        dateRange: { startDate: "2026-08-12", endDate: "2026-08-18" },
        mode: "question-bank",
        title: "代數式、等式與一元一次方程式",
        chapterCodes: ["j1-3-1", "j1-3-2"],
        practiceIds: [
          "practice-linear-word-expression-drill",
          "practice-linear-remove-parentheses-drill",
          "practice-linear-move-terms-solve-drill",
          "practice-linear-expand-move-solve-drill"
        ],
        questionBankFilters: { chapterCodes: ["j1-3-1", "j1-3-2"], difficulty: ["easy", "medium"] },
        teachingFocus: ["文字轉代數要先找未知數", "移項其實是等式兩邊同做運算", "去括號與合併同類項不要跳步"]
      },
      {
        week: 8,
        periodId: "summer",
        dateRange: { startDate: "2026-08-19", endDate: "2026-08-25" },
        mode: "question-bank",
        title: "應用題列式與暑假總複習",
        chapterCodes: ["j1-1-1", "j1-2-1", "j1-3-3"],
        practiceIds: [
          "practice-j1-3-3-age-application-drill",
          "practice-j1-3-3-speed-application-drill",
          "practice-j1-3-3-allocation-application-drill",
          "practice-j1-3-3-purchase-discount-application-drill"
        ],
        questionBankFilters: { chapterCodes: ["j1-1-1", "j1-2-1", "j1-3-3"], difficulty: ["medium"] },
        teachingFocus: ["應用題先設、列、解、答", "答案要回代檢查是否符合情境", "把暑假錯題回收成開學前清單"]
      }
    ],
    buffer: {
      dateRange: { startDate: "2026-08-26", endDate: "2026-08-31" },
      title: "開學前緩衝週",
      mode: "diagnostic-review",
      note: "保留給補弱、錯題重練與開學診斷。"
    }
  };

  const j1DownPeriodPlan = {
    id: "schedule-j1-down-2027-term2",
    title: "國一下段考日程安排",
    grade: "國一",
    schoolYearId: SCHOOL_YEAR_ID,
    ownerType: "schedule",
    purpose: "依照國一下三次段考安排無限練習與題庫練習",
    defaultQuestionCount: 5,
    periodPlans: [
      {
        periodId: "winter",
        scopeTitle: "寒假銜接：國一上弱點回補與二元一次預備",
        firstHalf: {
          mode: "infinite-practice",
          title: "等式、代數式、應用題列式回補",
          chapterCodes: ["j1-3-1", "j1-3-2", "j1-3-3"],
          practiceIds: [
            "practice-linear-word-expression-drill",
            "practice-linear-move-terms-solve-drill",
            "practice-j1-3-3-age-application-drill"
          ]
        },
        secondHalf: {
          mode: "question-bank",
          title: "開學診斷與錯題整理",
          chapterCodes: ["j1-3-1", "j1-3-2", "j1-3-3"],
          questionBankFilters: { chapterCodes: ["j1-3-1", "j1-3-2", "j1-3-3"], difficulty: ["easy", "medium"] }
        }
      },
      {
        periodId: "term2-exam1",
        scopeTitle: "下一段：二元一次式、聯立方程式與坐標入門",
        firstHalf: {
          mode: "infinite-practice",
          title: "二元一次的表示、代入消去與坐標定位",
          chapterCodes: ["j2-1-1", "j2-1-2", "j2-2-1"],
          practiceIds: [
            "practice-j2-1-1-expression-simplify-drill",
            "practice-j2-1-1-context-to-equation-drill",
            "practice-j2-1-2-substitution-basic-drill",
            "practice-j2-1-2-elimination-adjustment-drill",
            "practice-j2-2-1-axis-distance-drill",
            "practice-j2-2-1-quadrant-basic-drill"
          ]
        },
        secondHalf: {
          mode: "question-bank",
          title: "聯立方程式與坐標題庫整理",
          chapterCodes: ["j2-1-1", "j2-1-2", "j2-1-3", "j2-2-1"],
          questionBankFilters: { chapterCodes: ["j2-1-1", "j2-1-2", "j2-1-3", "j2-2-1"], difficulty: ["easy", "medium"] }
        }
      },
      {
        periodId: "term2-exam2",
        scopeTitle: "下二段：直線、比例、正比反比與不等式入門",
        firstHalf: {
          mode: "infinite-practice",
          title: "直線圖形、比例式、正反比判斷",
          chapterCodes: ["j2-2-2", "j2-3-1", "j2-3-2", "j2-4-1"],
          practiceIds: [
            "practice-j2-2-2-point-line-relation-drill",
            "practice-j2-2-2-line-from-points-drill",
            "practice-j2-3-1-ratio-simplify-drill",
            "practice-j2-3-1-proportion-solve-drill",
            "practice-j2-3-2-basic-direct-inverse-drill",
            "practice-j2-4-1-inequality-language-drill"
          ]
        },
        secondHalf: {
          mode: "question-bank",
          title: "比例與不等式題庫整理",
          chapterCodes: ["j2-2-2", "j2-3-1", "j2-3-2", "j2-4-1"],
          questionBankFilters: { chapterCodes: ["j2-2-2", "j2-3-1", "j2-3-2", "j2-4-1"], difficulty: ["easy", "medium"] }
        }
      },
      {
        periodId: "term2-exam3",
        scopeTitle: "下三段：不等式應用、統計與國一下總複習",
        firstHalf: {
          mode: "infinite-practice",
          title: "不等式應用與資料判讀",
          chapterCodes: ["j2-4-1", "j2-4-2", "j2-5-1", "j2-5-2"],
          practiceIds: [
            "practice-j2-4-1-inequality-integer-drill",
            "practice-j2-4-1-inequality-fraction-drill",
            "practice-j2-4-2-basic-word-drill",
            "practice-j2-5-1-frequency-relative-cumulative-drill",
            "practice-j2-5-1-pie-chart-conversion-drill",
            "practice-j2-5-2-mean-basic-drill"
          ]
        },
        secondHalf: {
          mode: "question-bank",
          title: "國一下段考總整理與錯題回收",
          chapterCodes: ["j2-1-1", "j2-1-2", "j2-2-1", "j2-3-1", "j2-3-2", "j2-4-1", "j2-4-2", "j2-5-1", "j2-5-2"],
          questionBankFilters: {
            chapterCodes: ["j2-1-1", "j2-1-2", "j2-2-1", "j2-3-1", "j2-3-2", "j2-4-1", "j2-4-2", "j2-5-1", "j2-5-2"],
            difficulty: ["medium"]
          }
        }
      }
    ]
  };

  const scheduleData = {
    meta: {
      version: "2026-06-28-v1",
      schoolYearId: SCHOOL_YEAR_ID,
      description: "日程型練習資料。任務型清單仍放在 practice-playlists.js，這裡只放日期、段考時段、週次與前後半段練習安排。"
    },
    periods: periodDefinitions,
    schedules: [j1BridgeEightWeekPlan, j1DownPeriodPlan]
  };

  window.practiceScheduleData = scheduleData;
  window.practiceScheduleStore = {
    getMeta() {
      return { ...scheduleData.meta };
    },
    getPeriods() {
      return scheduleData.periods.map((period) => ({ ...period }));
    },
    getSchedules() {
      return scheduleData.schedules.map((schedule) => ({ ...schedule }));
    },
    getScheduleById(id) {
      return scheduleData.schedules.find((schedule) => schedule.id === id) || null;
    },
    getPeriodById(id) {
      return scheduleData.periods.find((period) => period.id === id) || null;
    }
  };
})();
