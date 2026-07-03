(function () {
  const STORAGE_KEY = "math-formula-tool-managed-data-v2";
  const DATA_REVISION = "2026-04-23-abs-count-layout-v4";
  const USE_MANAGED_OVERLAY_BY_DEFAULT = true;
  const chapterCodeCatalog = window.chapterCodeCatalog || {};
  const chapterNameAliases = {
    "圓方程式": "圓的方程式",
    "一元二次方程式": "一元二次方程式"
  };
  const DB_TOPICS_JSON_URL = "program-db/database/formula-db.json";
  const LEGACY_TOPICS_JS_URL = "data/formula-content.js";
  const DB_QUESTIONS_JSON_URL = "program-db/database/question-db.json";

  function tryLoadLegacyTopicsSync() {
    if (Array.isArray(window.formulaContentRecords) && window.formulaContentRecords.length) {
      window.__formulaDbTopicsLoaded = false;
      window.__formulaDbTopicsSource = LEGACY_TOPICS_JS_URL;
      window.__formulaDbTopicsCount = window.formulaContentRecords.length;
      return true;
    }
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", LEGACY_TOPICS_JS_URL, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
        (0, eval)(`${xhr.responseText}\n//# sourceURL=${LEGACY_TOPICS_JS_URL}`);
        if (Array.isArray(window.formulaContentRecords) && window.formulaContentRecords.length) {
          window.__formulaDbTopicsLoaded = false;
          window.__formulaDbTopicsSource = LEGACY_TOPICS_JS_URL;
          window.__formulaDbTopicsCount = window.formulaContentRecords.length;
          return true;
        }
      }
    } catch (_) {
      // ignore legacy fallback errors
    }
    return false;
  }

  function tryLoadDbTopicsSync() {
    if (window.__formulaDbTopicsLoaded) return;
    let loaded = false;
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", DB_TOPICS_JSON_URL, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
        const payload = JSON.parse(xhr.responseText);
        if (Array.isArray(payload?.topics) && payload.topics.length) {
          window.formulaContentRecords = payload.topics;
          window.__formulaDbMeta = payload.meta && typeof payload.meta === "object" ? payload.meta : {};
          window.__formulaDbTopicsLoaded = true;
          window.__formulaDbTopicsSource = DB_TOPICS_JSON_URL;
          window.__formulaDbTopicsCount = payload.topics.length;
          loaded = true;
        }
      }
    } catch (_) {
      // fallback to legacy data/formula-content.js
    }
    if (!loaded && !tryLoadLegacyTopicsSync()) {
      window.__formulaDbTopicsLoaded = false;
      window.__formulaDbTopicsSource = "";
      window.__formulaDbTopicsCount = 0;
    }
  }

  tryLoadDbTopicsSync();

  function tryLoadQuestionDbSync() {
    if (Array.isArray(window.questionContentRecords) && window.questionContentRecords.length) {
      window.__questionDbLoaded = false;
      window.__questionDbSource = "data/question-content.js";
      window.__questionDbCount = window.questionContentRecords.length;
      return;
    }
    if (window.__questionDbLoaded) return;
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", DB_QUESTIONS_JSON_URL, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
        const payload = JSON.parse(xhr.responseText);
        if (Array.isArray(payload?.questions)) {
          window.questionContentRecords = payload.questions;
          window.__questionDbLoaded = true;
          window.__questionDbSource = DB_QUESTIONS_JSON_URL;
          window.__questionDbCount = payload.questions.length;
        }
      }
    } catch (_) {
      // keep empty when question db is unavailable
    }
  }

  tryLoadQuestionDbSync();

  function isUsableCatalogText(value) {
    const text = String(value || "").trim();
    if (!text) return false;
    if (text.includes("?")) return false;
    return /[\u4e00-\u9fff]/.test(text);
  }

  const stageOrderMap = { 國小: 0, 國中: 1, 高中: 2, 其他: 9 };
  const gradeOrderMap = {
    低年級: 0,
    中年級: 0,
    小五: 0,
    小六: 0,
    國小: 0,
    國一: 1,
    國二: 2,
    國三: 3,
    高一: 4,
    高二: 5,
    高三: 6,
    其他: 7
  };
  const termOrderMap = { 上學期: 1, 下學期: 2, "": 9 };
  const gradeOptions = ["國小", "國一上", "國一下", "國二上", "國二下", "國三上", "國三下", "高一上", "高一下", "高二上", "高二下", "高三", "其他"];
  const chapterCodeMap = {
    "國小-小四-下學期-一億以內的數": "e4-1-1",
    "國小-小四-下學期-整數的乘法": "e4-1-2",
    "國小-小四-下學期-角度": "e4-1-3",
    "國小-小四-下學期-整數的除法": "e4-1-4",
    "國小-小四-下學期-公里": "e4-1-5",
    "國小-小四-下學期-三角形": "e4-1-6",
    "國小-小四-下學期-小數": "e4-1-7",
    "國小-小四-下學期-整數四則計算": "e4-1-8",
    "國小-小四-下學期-分數": "e4-1-9",
    "國小-小四-下學期-多位數的乘與除": "e4-2-1",
    "國小-小四-下學期-四邊形": "e4-2-2",
    "國小-小四-下學期-概數": "e4-2-3",
    "國小-小四-下學期-數量規律": "e4-2-4",
    "國小-小四-下學期-小數乘法": "e4-2-5",
    "國小-小四-下學期-周長與面積": "e4-2-6",
    "國小-小四-下學期-等值分數": "e4-2-7",
    "國小-小四-下學期-簡化計算": "e4-2-8",
    "國小-小四-下學期-時間的計算": "e4-2-9",
    "國小-小四-下學期-立方公分": "e4-2-10",
    "國小-小五-上學期-多位小數與加減": "e5-1-1",
    "國小-小五-上學期-因數與公因數": "e5-1-2",
    "國小-小五-上學期-倍數與公倍數": "e5-1-3",
    "國小-小五-上學期-擴分、約分與通分": "e5-1-4",
    "國小-小五-上學期-多邊形與扇形": "e5-1-5",
    "國小-小五-上學期-異分母分數的加減": "e5-1-6",
    "國小-小五-上學期-線對稱圖形": "e5-1-7",
    "國小-小五-上學期-整數四則運算": "e5-1-8",
    "國小-小五-上學期-面積": "e5-1-9",
    "國小-小五-上學期-柱體、錐體和球": "e5-1-10",
    "國小-小五-下學期-體積": "e5-2-1",
    "國小-小五-下學期-分數的計算": "e5-2-2",
    "國小-小五-下學期-容積": "e5-2-3",
    "國小-小五-下學期-小數的乘法": "e5-2-4",
    "國小-小五-下學期-大數與折線圖": "e5-2-5",
    "國小-小五-下學期-整數、小數除以整數": "e5-2-6",
    "國小-小五-下學期-表面積": "e5-2-7",
    "國小-小五-下學期-比率與百分率": "e5-2-8",
    "國小-小五-下學期-時間的乘除": "e5-2-9",
    "國小-小五-下學期-生活中的大單位": "e5-2-10",
    "國小-小六-上學期-最大公因數與最小公倍數": "e6-1-1",
    "國小-小六-上學期-分數除法": "e6-1-2",
    "國小-小六-上學期-數量關係": "e6-1-3",
    "國小-小六-上學期-小數除法": "e6-1-4",
    "國小-小六-上學期-比與比值": "e6-1-5",
    "國小-小六-上學期-圓周長與扇形周長": "e6-1-6",
    "國小-小六-上學期-圓面積與扇形面積": "e6-1-7",
    "國小-小六-上學期-認識速率": "e6-1-8",
    "國小-小六-上學期-放大圖、縮圖與比例尺": "e6-1-9",
    "國小-小六-下學期-分數與小數的四則運算": "e6-2-1",
    "國小-小六-下學期-速率與應用": "e6-2-2",
    "國小-小六-下學期-柱體體積與表面積": "e6-2-3",
    "國小-小六-下學期-基準量與比較量": "e6-2-4",
    "國小-小六-下學期-怎麼解題": "e6-2-5",
    "國小-小六-下學期-圓形圖": "e6-2-6",

    "國中-國一-上學期-正負數加減乘除": "j1-1-1",
    "國中-國一-上學期-絕對值": "j1-1-2",
    "國中-國一-上學期-指數律": "j1-1-3",
    "國中-國一-上學期-科學記號": "j1-1-4",
    "國中-國一-上學期-一元一次方程式": "j1-3-1",
    "國中-國一-上學期-應用問題": "j1-3-2",
    "國中-國一-上學期-國一補充": "j1-x",

    "國中-國一-上學期-因數倍數": "j1-2-1",
    "國中-國一-上學期-公因數公倍數": "j1-2-2",
    "國中-國一-上學期-分數的加減乘除": "j1-2-3",
    "國中-國一-下學期-二元一次聯立方程式": "j2-1",
    "國中-國一-下學期-座標概念": "j2-2",
    "國中-國一-下學期-比例": "j2-3-1",
    "國中-國一-下學期-正比反比": "j2-3-2",
    "國中-國一-下學期-一元一次不等式": "j2-4",
    "國中-國一-下學期-國一補充": "j2-x",

    "國中-國二-上學期-乘法公式": "j3-1-1",
    "國中-國二-上學期-多項式": "j3-1-2",
    "國中-國二-上學期-多項式乘除法": "j3-1-3",
    "國中-國二-上學期-二次方根": "j3-2-1",
    "國中-國二-上學期-根式的運算": "j3-2-2",
    "國中-國二-上學期-畢氏定理": "j3-2-3",
    "國中-國二-上學期-因式分解": "j3-3",
    "國中-國二-上學期-一元二次方程式": "j3-4",

    "國中-國二-下學期-等差數列": "j4-1-1",
    "國中-國二-下學期-等比數列": "j4-1-2",
    "國中-國二-下學期-等差級數": "j4-1-3",
    "國中-國二-下學期-認識函數": "j4-2-1",
    "國中-國二-下學期-線型函數的圖形": "j4-2-2",
    "國中-國二-下學期-三角形與多邊形": "j4-3-1",
    "國中-國二-下學期-尺規作圖": "j4-3-2",
    "國中-國二-下學期-三角形全等": "j4-3-3",
    "國中-國二-下學期-三角形邊角關係": "j4-3-4",
    "國中-國二-下學期-平行": "j4-4-1",
    "國中-國二-下學期-平行四邊形": "j4-4-2",
    "國中-國二-下學期-梯形及其他四邊形關係": "j4-4-3",
    "國中-國二-上學期-國二補充": "j3-x",
    "國中-國二-下學期-國二補充": "j4-x",

    "國中-國三-上學期-連比": "j5-1-1",
    "國中-國三-上學期-平行線截比例線段": "j5-1-2",
    "國中-國三-上學期-縮放與相似": "j5-1-3",
    "國中-國三-上學期-相似三角形應用": "j5-1-4",
    "國中-國三-上學期-基本圓與長度關係": "j5-2-1",
    "國中-國三-上學期-圓的角度關係": "j5-2-2",
    "國中-國三-上學期-代數證明": "j5-3-1",
    "國中-國三-上學期-幾何證明": "j5-3-2",
    "國中-國三-上學期-三心": "j5-3-3",
    "國中-國三-上學期-國三補充": "j5-x",

    "國中-國三-下學期-二次函數圖形": "j6-1-1",
    "國中-國三-下學期-二次函數應用問題": "j6-1-2",
    "國中-國三-下學期-立體圖形": "j6-2",
    "國中-國三-下學期-統計圖表": "j6-3-1",
    "國中-國三-下學期-機率": "j6-3-2",
    "國中-國三-下學期-國三補充": "j6-x",

    "高中-高一-上學期-實數": "s1-1-1",
    "高中-高一-上學期-絕對值": "s1-1-2",
    "高中-高一-上學期-式的運算": "s1-1-3",
    "高中-高一-上學期-指數": "s1-1-4",
    "高中-高一-上學期-對數": "s1-1-5",
    "高中-高一-上學期-直線方程式": "s1-2-1",
    "高中-高一-上學期-圓的方程式": "s1-2-2",
    "高中-高一-上學期-圓與直線的關係": "s1-2-3",
    "高中-高一-上學期-多項式函數": "s1-3-1",
    "高中-高一-上學期-簡單多項式函數及其圖形": "s1-3-2",
    "高中-高一-上學期-多項式不等式": "s1-3-3",

    "高中-高一-上學期-高一補充": "s1-x",
    "高中-高一-下學期-數列與遞迴": "s2-1-1",
    "高中-高一-下學期-級數": "s2-1-2",
    "高中-高一-下學期-高一補充": "s2-x",
    "高中-高一-下學期-邏輯、集合與計數原理": "s2-2-1",
    "高中-高一-下學期-排列組合": "s2-2-2",
    "高中-高一-下學期-二項式定理": "s2-2-3",
    "高中-高一-下學期-古典機率": "s2-2-4",
    "高中-高一-下學期-一維數據分析": "s2-3-1",
    "高中-高一-下學期-二維數據分析": "s2-3-2",
    "高中-高一-下學期-三角比定義與關係": "s2-4-1",
    "高中-高一-下學期-正弦定理與餘弦定理": "s2-4-2",

    "高中-高二-上學期-指數函數": "s3-2-1",
    "高中-高二-上學期-對數": "s3-2-2",
    "高中-高二-上學期-對數函數": "s3-2-3",
    "高中-高二-上學期-弧度、弧長": "s3-1-1",
    "高中-高二-上學期-三角函數的圖形": "s3-1-2",
    "高中-高二-上學期-和差角公式": "s3-1-3",
    "高中-高二-上學期-正餘弦函數的疊合": "s3-1-4",
    "高中-高二-上學期-平面向量": "s3-3-1",
    "高中-高二-上學期-平面向量的內積": "s3-3-2",
    "高中-高二-上學期-面積與二階行列式": "s3-3-3",
    "高中-高二-上學期-高二補充": "s3-x",
    "高中-高二-上學期-指數與對數的應用": "s3-2-4",

    "高中-高二-下學期-空間概念": "s4-1-1",
    "高中-高二-下學期-空間向量的坐標表示法": "s4-1-2",
    "高中-高二-下學期-空間向量的內積": "s4-1-3",
    "高中-高二-下學期-外積、體積與行列式": "s4-1-4",
    "高中-高二-下學期-高二補充": "s4-x",
    "高中-高二-下學期-線性方程組與矩陣": "s4-4-1",
    "高中-高二-下學期-矩陣的運算": "s4-4-2",
    "高中-高二-下學期-變換矩陣的應用": "s4-4-3",
    "高中-高二-下學期-平面上的線性變換與二階方陣": "s4-4-4",
    "高中-高二-下學期-平面方程式": "s4-2-1",
    "高中-高二-下學期-空間直線方程式": "s4-2-2",
    "高中-高二-下學期-條件機率與貝氏定理": "s4-3-1",
    "高中-高二-下學期-獨立事件": "s4-3-2",

    "高中-高三--二次曲線": "s5-1",
    "高中-高三--隨機變數": "s5-2",
    "高中-高三--二項分布與幾何分布": "s5-3",
    "高中-高三--複數的幾何意涵": "s5-4",
    "高中-高三--數列及其極限": "s5-5",
    "高中-高三--函數的概念": "s5-6",
    "高中-高三--函數的極限": "s5-7",
    "高中-高三--微分": "s5-8",
    "高中-高三--函數性質的判定": "s5-9",
    "高中-高三--積分的意義": "s5-10",
    "高中-高三--積分的應用": "s5-11",
    "高中-高三--透視圖": "B-1",
    "高中-高三--圓錐曲線": "B-2",
    "高中-高三--地球經緯度": "B-3",
    "高中-高三--高三補充": "s5-x"
  };
  const chapterMetaByCode = Object.fromEntries(
    Object.entries(chapterCodeMap).map(([composite, code]) => {
      const [stage, grade, term, ...chapterParts] = composite.split("-");
      return [code, { stage, grade, term, chapter: chapterParts.join("-") }];
    })
  );
  const practiceChapterMetaByCode = (() => {
    const rows = Object.values(window.practiceLibraryStore?.byId || {});
    const byCode = {};
    rows.forEach((row) => {
      const code = String(row?.chapterCode || "").trim();
      if (!code || byCode[code]) return;
      const stage = String(row?.stage || "").trim();
      const grade = String(row?.grade || "").trim();
      const term = String(row?.term || "").trim();
      const chapter = String(row?.chapter || "").trim();
      if (!stage && !grade && !term && !chapter) return;
      byCode[code] = { stage, grade, term, chapter };
    });
    return byCode;
  })();
  const mergedChapterMetaByCode = {
    ...practiceChapterMetaByCode,
    ...chapterMetaByCode,
  };
  const chapterCodeAliases = {
    "j2-1": "j2-1-1",
    "j2-2": "j2-2-1",
    "j2-4": "j2-4-1",
    "j3-3": "j3-3-1",
    "j3-4": "j3-4-1"
  };

  function getCodeCatalogEntry(code) {
    const key = String(code || "").trim();
    if (!key) return null;
    return chapterCodeCatalog[key] || null;
  }

  function inferMetaFromCode(code) {
    const key = String(code || "").trim();
    if (!key) return { stage: "其他", grade: "其他", term: "", chapter: key };
    if (/^e4-/.test(key)) return { stage: "國小", grade: "小四", term: "下學期", chapter: key };
    if (/^e5-1-/.test(key)) return { stage: "國小", grade: "小五", term: "上學期", chapter: key };
    if (/^e5-2-/.test(key)) return { stage: "國小", grade: "小五", term: "下學期", chapter: key };
    if (/^e5-/.test(key)) return { stage: "國小", grade: "小五", term: "", chapter: key };
    if (/^e6-1-/.test(key)) return { stage: "國小", grade: "小六", term: "上學期", chapter: key };
    if (/^e6-2-/.test(key)) return { stage: "國小", grade: "小六", term: "下學期", chapter: key };
    if (/^e6-/.test(key)) return { stage: "國小", grade: "小六", term: "", chapter: key };
    if (/^j1-/.test(key)) return { stage: "國中", grade: "國一", term: "上學期", chapter: key };
    if (/^j2-/.test(key)) return { stage: "國中", grade: "國一", term: "下學期", chapter: key };
    if (/^j3-/.test(key)) return { stage: "國中", grade: "國二", term: "上學期", chapter: key };
    if (/^j4-/.test(key)) return { stage: "國中", grade: "國二", term: "下學期", chapter: key };
    if (/^j5-/.test(key)) return { stage: "國中", grade: "國三", term: "上學期", chapter: key };
    if (/^j6-/.test(key)) return { stage: "國中", grade: "國三", term: "下學期", chapter: key };
    if (/^s1-/.test(key)) return { stage: "高中", grade: "高一", term: "上學期", chapter: key };
    if (/^s2-/.test(key)) return { stage: "高中", grade: "高一", term: "下學期", chapter: key };
    if (/^s3-/.test(key)) return { stage: "高中", grade: "高二", term: "上學期", chapter: key };
    if (/^s4-/.test(key)) return { stage: "高中", grade: "高二", term: "下學期", chapter: key };
    if (/^s5-/.test(key) || /^B-/.test(key)) return { stage: "高中", grade: "高三", term: "", chapter: key };
    return { stage: "其他", grade: "其他", term: "", chapter: key };
  }

  function normalizeChapterName(chapter) {
    const name = String(chapter || "").trim();
    return chapterNameAliases[name] || name;
  }

  const chapterSequence = {
    "國中-國一-上學期": ["正負數加減乘除", "絕對值", "指數律", "科學記號", "因數倍數", "公因數公倍數", "分數的加減乘除", "一元一次方程式", "應用問題", "國一補充"],
    "國中-國一-下學期": ["二元一次聯立方程式", "座標概念", "比例", "正比反比", "一元一次不等式", "國一補充"],
    "國中-國二-上學期": ["乘法公式", "多項式", "多項式乘除法", "二次方根", "根式的運算", "畢氏定理", "因式分解", "一元二次方程式", "國二補充"],
    "國中-國二-下學期": ["等差數列", "等比數列", "等差級數", "線型函數", "三角形與多邊形", "尺規作圖", "三角形全等", "三角形邊角關係", "平行", "平行四邊形", "梯形及其他四邊形關係", "國二補充"],
    "國中-國三-上學期": ["連比", "平行線截比例線段", "縮放與相似", "相似三角形應用", "基本圓與長度關係", "圓的角度關係", "代數證明", "幾何證明", "三心", "國三補充"],
    "國中-國三-下學期": ["二次函數圖形", "二次函數應用問題", "立體圖形", "統計圖表", "機率", "國三補充"],
    "高中-高一-上學期": ["實數", "絕對值", "式的運算", "指數", "對數", "直線方程式", "圓的方程式", "圓與直線的關係", "多項式函數", "簡單多項式函數及其圖形", "多項式不等式", "高一補充"],
    "高中-高一-下學期": ["數列與遞迴", "級數", "邏輯、集合與計數原理", "排列組合", "二項式定理", "古典機率", "三角比定義與關係", "正弦定理與餘弦定理", "一維數據分析", "二維數據分析", "高一補充"],
    "高中-高二-上學期": ["弧度、弧長", "三角函數的圖形", "和差角公式", "正餘弦函數的疊合", "指數函數", "對數", "對數函數", "指數與對數的應用", "平面向量", "平面向量的內積", "面積與二階行列式", "高二補充"],
    "高中-高二-下學期": ["空間概念", "空間向量的坐標表示法", "空間向量的內積", "外積、體積與行列式", "平面方程式", "空間直線方程式", "線性方程組與矩陣", "矩陣的運算", "變換矩陣的應用", "平面上的線性變換與二階方陣", "條件機率與貝氏定理", "獨立事件", "高二補充"],
    "高中-高三-上學期": [],
    "高中-高三-下學期": [],
    "高中-高三-": ["二次曲線", "隨機變數", "二項分布與幾何分布", "複數的幾何意涵", "數列及其極限", "函數的概念", "函數的極限", "微分", "函數性質的判定", "積分的意義", "積分的應用", "透視圖", "圓錐曲線", "地球經緯度", "高三補充"]
  };

  const topicParentOverrides = {
    "distributive-law-multiplication-formula": "multiplication-identities-junior",
    "sum-square-identity": "multiplication-identities-junior",
    "difference-square-identity": "multiplication-identities-junior",
    "square-difference-identity": "multiplication-identities-junior",
    "sum-square-drill-branches": "sum-square-identity",
    "sum-square-number-drill": "sum-square-drill-branches",
    "sum-square-decimal-drill": "sum-square-drill-branches",
    "sum-square-fraction-drill": "sum-square-drill-branches",
    "sum-square-variable-drill": "sum-square-drill-branches",
    "difference-square-drill-branches": "difference-square-identity",
    "difference-square-number-drill": "difference-square-drill-branches",
    "difference-square-decimal-drill": "difference-square-drill-branches",
    "difference-square-fraction-drill": "difference-square-drill-branches",
    "difference-square-variable-drill": "difference-square-drill-branches",
    "square-difference-drill-branches": "square-difference-identity",
    "square-difference-number-drill": "square-difference-drill-branches",
    "square-difference-decimal-drill": "square-difference-drill-branches",
    "square-difference-fraction-drill": "square-difference-drill-branches",
    "square-difference-variable-drill": "square-difference-drill-branches",
    "square-difference-number-value-drill": "square-difference-drill-branches",
    "square-difference-decimal-value-drill": "square-difference-drill-branches",
    "square-difference-fraction-value-drill": "square-difference-drill-branches",
    "square-difference-factorization-variable-drill": "square-difference-drill-branches",
    "identity-value-sum-sqsum-to-product-drill": "identity-value-evaluation",
    "identity-value-diff-sqsum-to-product-drill": "identity-value-evaluation",
    "identity-value-integer-basic-drill": "identity-value-evaluation",
    "identity-value-sum-product-drill": "identity-value-evaluation",
    "identity-value-product-sqsum-drill": "identity-value-evaluation",
    "identity-value-square-pair-drill": "identity-value-evaluation",
    "identity-value-linear-combination-drill": "identity-value-evaluation",
    "identity-value-reciprocal-drill": "identity-value-evaluation",
    "identity-value-reciprocal-reverse-drill": "identity-value-evaluation",
    "identity-value-reciprocal-mixed-fraction-drill": "identity-value-evaluation",
    "identity-value-mixed-advanced-drill": "identity-value-evaluation",
    "identity-value-evaluation": "multiplication-identities-junior",
    "three-sum-square-guest": "multiplication-identities-junior",
    "cube-identities-guest": "multiplication-identities-junior",
    "polynomial-terminology-junior": "polynomial-add-subtract-junior",
    "constant-vs-zero-degree-polynomial": "polynomial-add-subtract-junior",
    "zero-polynomial-definition": "polynomial-add-subtract-junior",
    "like-terms-combine-junior": "polynomial-add-subtract-junior",
    "polynomial-subtraction-sign-distribution": "polynomial-add-subtract-junior",
    "polynomial-add-subtract-vertical-alignment": "polynomial-add-subtract-junior",
    "polynomial-example-3a2b-4b2c": "polynomial-add-subtract-junior",
    "polynomial-mul-div-junior": "polynomial-operation-junior",
    "quadratic-times-quadratic-main": "polynomial-operation-junior",
    "distributive-like-terms-mul": "polynomial-operation-junior",
    "monomial-divide-monomial": "polynomial-operation-junior",
    "polynomial-divide-monomial": "polynomial-operation-junior",
    "cubic-divide-linear": "polynomial-operation-junior",
    "cubic-divide-quadratic": "polynomial-operation-junior",
    "square-root-basic-junior": "square-root-junior",
    "perfect-square-and-square-root": "square-root-junior",
    "principal-square-root-and-symbol": "square-root-junior",
    "square-root-estimation": "square-root-junior",
    "long-division-square-root-guest": "square-root-junior",
    "radical-operations-junior": "radical-operation-junior",
    "radical-mul-div-split-rule": "radical-operation-junior",
    "radical-add-subtract-like-terms": "radical-operation-junior",
    "simplest-radical-form-junior": "radical-operation-junior",
    "rationalize-denominator-monomial-junior": "radical-operation-junior",
    "rationalize-denominator-binomial-junior": "radical-operation-junior",
    "pythagorean-triples-345": "pythagorean",
    "pythagorean-scaling-similarity": "pythagorean",
    "special-right-triangles-45-30": "pythagorean",
    "right-triangle-altitude-to-hypotenuse": "pythagorean",
    "spatial-pythagorean-guest": "pythagorean",
    "bee-fly-ant-crawl-pythagorean": "pythagorean",
    "factor-common-basic-examples": "factorization-common-factor-junior",
    "factor-change-sign-first": "factorization-common-factor-junior",
    "factor-grouping-common-factor": "factorization-common-factor-junior",
    "factor-six-terms-common-factor": "factorization-common-factor-junior",
    "factor-remove-parentheses-regroup": "factorization-common-factor-junior",
    "factor-repeated-common-factor": "factorization-common-factor-junior",
    "factor-identity-difference-of-squares": "factorization-identities-junior",
    "factor-group-then-difference-of-squares": "factorization-identities-junior",
    "factor-perfect-square-trinomial": "factorization-identities-junior",
    "factor-group-then-perfect-square": "factorization-identities-junior",
    "factor-perfect-square-find-coefficient": "factorization-identities-junior",
    "cross-warmup-leading-one": "factorization-cross-method-junior",
    "cross-simplify-first": "factorization-cross-method-junior",
    "cross-change-sign-first": "factorization-cross-method-junior",
    "cross-two-symbols": "factorization-cross-method-junior",
    "cross-leading-not-one": "factorization-cross-method-junior",
    "linear-remove-parentheses-drill": "linear-equation",
    "linear-multiply-parentheses-drill": "linear-equation",
    "linear-fraction-parentheses-drill": "linear-equation",
    "linear-move-terms-solve-drill": "linear-equation",
    "linear-expand-move-solve-drill": "linear-equation",
    "linear-cross-expand-move-solve-drill": "linear-equation",
    "linear-lcm-multiply-move-solve-drill": "linear-equation",
    "j1-distributive-law-drill": "distributive-vs-factor",
    "j1-common-factor-drill": "distributive-vs-factor",
    "j1-common-factor-four-terms-drill": "distributive-vs-factor",
    "j1-variable-distributive-nearby-drill": "distributive-vs-factor",
    "j1-variable-distributive-eval-drill": "distributive-vs-factor",
    "weird-symbol-calc": "integer-add-subtract-four-terms-drill",
    "weird-symbol-calc-three-layer": "integer-add-subtract-four-terms-drill",
    "j1-1-1-number-line-elements": "",
    "j1-1-1-relative-quantity-sign": "j1-1-1-number-line-elements",
    "j1-1-1-opposite-number": "j1-1-1-number-line-elements",
    "j1-1-1-number-system-overview": "j1-1-1-number-line-elements",
    "j1-1-1-order-and-interval": "j1-1-1-number-line-elements",
    "coordinate-origin-unit-change": "j1-1-1-number-line-elements",
    "absolute-value-removal": "",
    "j1-1-1-absolute-value-equation": "absolute-value-removal",
    "absolute-value-high-school": "",
    "absolute-value-definition-properties-high-school": "absolute-value-high-school",
    "absolute-value-distance-view-high-school": "absolute-value-high-school",
    "absolute-value-equation-inequality-high-school": "absolute-value-high-school",
    "absolute-value-symbolic-simplification-high-school": "absolute-value-high-school",
    "absolute-value-function-graph-high-school": "absolute-value-high-school",
    "absolute-value-parameter-range-high-school": "absolute-value-high-school",
    "abs-count-basic-drill": "absolute-value-high-school",
    "abs-count-two-sided-drill": "abs-count-basic-drill",
    "abs-count-reverse-drill": "abs-count-basic-drill",
    "j1-1-1-absolute-value-definition": "absolute-value-high-school",
    "j1-1-1-distance-midpoint": "absolute-value-high-school",
    "midpoint-formula": "number-line-topic",
    "midpoint-distance-combined-drill": "",
    "distance-formula": "midpoint-distance-combined-drill",
    "midpoint-reverse-drill": "midpoint-distance-combined-drill",
    "midpoint-plus-distance-drill": "midpoint-distance-combined-drill",
    "three-point-quick-distance-drill": "midpoint-distance-combined-drill",
    "time-baseline-basic-drill": "integer-add-subtract-four-terms-drill",
    "time-baseline-advanced-drill": "integer-add-subtract-four-terms-drill",
    "opposite-number-equation-drill": "integer-add-subtract-four-terms-drill",
    "same-shift-opposite-drill": "integer-add-subtract-four-terms-drill",
    "abs-equation-leading-one-drill": "linear-equation",
    "abs-equation-leading-not-one-drill": "linear-equation",
    "nonnegative-sum-zero-drill": "linear-equation",
    "nonnegative-sum-fixed-one-drill": "linear-equation",
    "nonnegative-sum-fixed-multix-drill": "linear-equation",
    "abs-both-sides-advanced-drill": "linear-equation",
    "abs-four-terms-calc-drill": "absolute-value-removal",
    "abs-two-group-calc-drill": "absolute-value-removal",
    "abs-remove-and-calc-drill": "absolute-value-removal",
    "mod9-remainder-drill": "",
    "mod9-unknown-multiple-drill": "",
    "mod9-unknown-remainder-drill": "",
    "mod11-remainder-drill": "",
    "mod11-unknown-multiple-drill": "",
    "mod11-unknown-remainder-drill": "",
    "factor-application-separate-grouping-drill": "",
    "factor-application-mixed-grouping-drill": "",
    "factor-application-circular-track-drill": "",
    "factor-road-planting-single-drill": "",
    "factor-road-planting-double-drill": "",
    "factor-road-keep-position-drill": "",
    "factor-rectangle-equal-square-drill": "",
    "factor-rectangle-max-square-mixed-drill": "",
    "proportion-scale-expand": "ratio-proportion",
    "proportion-cross-product": "ratio-proportion",
    "proportion-constant-r": "ratio-proportion",
    "proportion-distribution": "ratio-proportion",
    "cost-list-sale-price": "ratio-proportion",
    "discount-price-difference": "ratio-proportion",
    "distance-time-speed-basic": "ratio-proportion",
    "concentration-solution-basic": "ratio-proportion",
    "direct-proportion-basic": "direct-inverse-proportion",
    "inverse-proportion-graph": "direct-inverse-proportion",
      "point-to-axis-distance": "coordinate-plane-basic",
      "quadrant-sign-basic": "coordinate-plane-basic",
      "linear-system-inconsistent": "system-linear-equations",
      "linear-system-dependent": "system-linear-equations",
      "slope-form": "coordinate-line-basic",
      "point-slope-form": "line-form-guests",
      "two-point-form": "line-form-guests",
    "quadratic-zero-product-principle": "quadratic-factor-solving-junior",
    "quadratic-double-root-perfect-square": "quadratic-factor-solving-junior",
    "quadratic-cross-method-solving": "quadratic-factor-solving-junior",
    "quadratic-expand-then-solve": "quadratic-factor-solving-junior",
    "quadratic-substitute-same-term-ab": "quadratic-factor-solving-junior",
    "quadratic-restore-from-roots": "quadratic-factor-solving-junior",
    "quadratic-solve-ratio": "quadratic-factor-solving-junior",
    "quadratic-square-root-method": "quadratic-completing-square-formula-junior",
    "quadratic-complete-square-leading-one": "quadratic-completing-square-formula-junior",
    "quadratic-complete-perfect-square": "quadratic-completing-square-formula-junior",
    "quadratic-completing-square-full": "quadratic-completing-square-formula-junior",
    "quadratic-completing-square-vertex-form": "quadratic-completing-square-formula-junior",
    "quadratic-irrational-roots-restore-equation": "quadratic-completing-square-formula-junior",
    "quadratic-applications-junior": "quadratic-completing-square-formula-junior",
    "quadratic-formula-discriminant-junior": "quadratic-completing-square-formula-junior",
    "quadratic-vieta-root-relations-junior": "quadratic-completing-square-formula-junior",
    "quadratic-application-buy-sell": "quadratic-application-problems-junior",
    "quadratic-application-area": "quadratic-application-problems-junior",
    "quadratic-application-consecutive-numbers": "quadratic-application-problems-junior",
    "quadratic-application-geometric-length": "quadratic-application-problems-junior",
    "quadratic-application-change-rate": "quadratic-application-problems-junior",
    "arithmetic-sequence-identify-common-difference": "arithmetic-sequence-junior",
    "arithmetic-sequence-first-terms": "arithmetic-sequence-junior",
    "arithmetic-sequence-nth-term": "arithmetic-sequence-junior",
    "arithmetic-sequence-find-first-or-index": "arithmetic-sequence-junior",
    "arithmetic-sequence-index-positive-negative": "arithmetic-sequence-junior",
    "arithmetic-mean-basic": "arithmetic-sequence-junior",
    "arithmetic-sequence-properties": "arithmetic-sequence-junior",
    "arithmetic-sequence-applications": "arithmetic-sequence-junior",
    "arithmetic-three-numbers": "arithmetic-sequence-junior",
    "arithmetic-common-terms": "arithmetic-sequence-junior",
    "geometric-sequence-identify-ratio": "geometric-sequence-junior",
    "geometric-sequence-first-terms": "geometric-sequence-junior",
    "geometric-sequence-nth-term": "geometric-sequence-junior",
    "geometric-sequence-find-first-ratio-index": "geometric-sequence-junior",
    "geometric-mean-basic": "geometric-sequence-junior",
    "geometric-three-numbers": "geometric-sequence-junior",
    "geometric-sequence-applications": "geometric-sequence-junior",
    "arithmetic-series-basic-sum": "arithmetic-series-junior",
    "arithmetic-series-find-term-count-first": "arithmetic-series-junior",
    "arithmetic-series-applications": "arithmetic-series-junior",
    "arithmetic-series-residue-multiples": "arithmetic-series-junior",
    "arithmetic-series-partial-sum-difference": "arithmetic-series-junior",
    "arithmetic-series-insert-middle-sum": "arithmetic-series-junior",
    "arithmetic-series-square-difference": "arithmetic-series-junior",
  };

  const structureParentOverrides =   {
      "divisibility-rules": "",
      "number-line-topic": "",
      "j1-1-1-number-line-elements": "",
      "j1-1-1-relative-quantity-sign": "j1-1-1-number-line-elements",
      "j1-1-1-opposite-number": "j1-1-1-number-line-elements",
      "j1-1-1-number-system-overview": "j1-1-1-number-line-elements",
      "j1-1-1-order-and-interval": "j1-1-1-number-line-elements",
      "coordinate-origin-unit-change": "j1-1-1-number-line-elements",
      "absolute-value-removal": "",
      "j1-1-1-absolute-value-equation": "absolute-value-removal",
      "absolute-value-high-school": "",
      "abs-count-basic-drill": "absolute-value-high-school",
      "abs-count-two-sided-drill": "abs-count-basic-drill",
      "abs-count-reverse-drill": "abs-count-basic-drill",
      "j1-1-1-absolute-value-definition": "absolute-value-high-school",
      "j1-1-1-distance-midpoint": "absolute-value-high-school",
      "abs-equation-leading-one-drill": "linear-equation",
      "abs-equation-leading-not-one-drill": "linear-equation",
      "nonnegative-sum-zero-drill": "linear-equation",
      "nonnegative-sum-fixed-one-drill": "linear-equation",
      "nonnegative-sum-fixed-multix-drill": "linear-equation",
      "abs-both-sides-advanced-drill": "linear-equation",
      "abs-four-terms-calc-drill": "absolute-value-removal",
      "abs-two-group-calc-drill": "absolute-value-removal",
      "abs-remove-and-calc-drill": "absolute-value-removal",
      "mod9-remainder-drill": "",
      "mod9-unknown-multiple-drill": "",
      "mod9-unknown-remainder-drill": "",
      "mod11-remainder-drill": "",
      "mod11-unknown-multiple-drill": "",
      "mod11-unknown-remainder-drill": "",
      "factor-application-separate-grouping-drill": "",
      "factor-application-mixed-grouping-drill": "",
      "factor-application-circular-track-drill": "",
      "factor-road-planting-single-drill": "",
      "factor-road-planting-double-drill": "",
      "factor-road-keep-position-drill": "",
      "factor-rectangle-equal-square-drill": "",
      "factor-rectangle-max-square-mixed-drill": "",
      "ratio-proportion": "",
      "proportion-scale-expand": "ratio-proportion",
      "proportion-cross-product": "ratio-proportion",
      "proportion-constant-r": "ratio-proportion",
      "proportion-distribution": "ratio-proportion",
      "cost-list-sale-price": "ratio-proportion",
      "discount-price-difference": "ratio-proportion",
      "distance-time-speed-basic": "ratio-proportion",
      "concentration-solution-basic": "ratio-proportion",
      "linear-inequality-basic": "",
      "inequality-language-basic": "linear-inequality-basic",
      "coordinate-translation-scaling": "",
      "coordinate-plane-basic": "",
      "point-to-axis-distance": "coordinate-plane-basic",
      "quadrant-sign-basic": "coordinate-plane-basic",
      "coordinate-area-formula-guest": "",
      "coordinate-line-basic": "",
      "count-nonnegative-up-to-7": "",
      "system-linear-equations": "",
      "linear-system-inconsistent": "system-linear-equations",
      "linear-system-dependent": "system-linear-equations",
      "linear-inequality-region": "",
      "slope-form": "coordinate-line-basic",
      "slope-intercept": "coordinate-line-basic",
      "axis-parallel-lines": "coordinate-line-basic",
      "line-form-guests": "coordinate-line-basic",
      "direct-inverse-proportion": "",
      "direct-proportion-basic": "direct-inverse-proportion",
      "pythagorean": "",
      "pythagorean-converse": "",
      "factorization-diff-square": "",
      "perfect-square": "",
      "coordinate-shift-unit-conversion": "",
      "divisor-count-sum-formula": "",
      "integer-add-subtract-four-terms-drill": "",
      "three-products-add-subtract-drill": "",
      "remove-parentheses-add-subtract": "",
      "remove-parentheses-multiply-divide": "",
      "distributive-vs-factor": "",
      "j1-distributive-law-drill": "integer-add-subtract-four-terms-drill",
      "j1-common-factor-drill": "integer-add-subtract-four-terms-drill",
      "j1-common-factor-four-terms-drill": "distributive-vs-factor",
      "j1-variable-distributive-nearby-drill": "distributive-vs-factor",
      "j1-variable-distributive-eval-drill": "distributive-vs-factor",
      "weird-symbol-calc": "distributive-vs-factor",
      "weird-symbol-calc-three-layer": "distributive-vs-factor",
      "time-baseline-basic-drill": "number-line-topic",
      "time-baseline-advanced-drill": "number-line-topic",
      "opposite-number-equation-drill": "number-line-topic",
      "midpoint-distance-combined-drill": "",
      "distance-formula": "midpoint-distance-combined-drill",
      "same-shift-opposite-drill": "",
      "midpoint-reverse-drill": "midpoint-distance-combined-drill",
      "midpoint-plus-distance-drill": "midpoint-distance-combined-drill",
      "three-point-quick-distance-drill": "midpoint-distance-combined-drill",
      "comparison-reversal-rules": "",
      "partial-fraction-telescoping-basic": "",
      "inverse-proportion-graph": "direct-inverse-proportion",
      "square-root-junior": "",
      "square-root-basic-junior": "square-root-junior",
      "perfect-square-and-square-root": "square-root-junior",
      "principal-square-root-and-symbol": "square-root-junior",
      "square-root-estimation": "square-root-junior",
      "long-division-square-root-guest": "square-root-junior",
      "radical-operation-junior": "",
      "radical-operations-junior": "radical-operation-junior",
      "radical-mul-div-split-rule": "radical-operation-junior",
      "radical-add-subtract-like-terms": "radical-operation-junior",
      "simplest-radical-form-junior": "radical-operation-junior",
      "rationalize-denominator-monomial-junior": "radical-operation-junior",
      "rationalize-denominator-binomial-junior": "radical-operation-junior",
      "point-slope-form": "line-form-guests",
      "two-point-form": "",
      "distance-formula": "number-line-topic",
      "midpoint-formula": "",
      "substitution-elimination": "system-linear-equations",
      "addition-subtraction-elimination": "system-linear-equations",
      "symmetric-system": "system-linear-equations",
      "nonnegative-system": "system-linear-equations",
      "abc-equal-system": "system-linear-equations",
      "variable-substitution-system": "system-linear-equations",
      "express-number-with-variable": "system-linear-equations",
      "two-variables-to-one": "system-linear-equations",
      "positive-integer-solution-discussion": "system-linear-equations",
      "pythagorean-triples-345": "pythagorean",
      "pythagorean-scaling-similarity": "pythagorean",
      "special-right-triangles-45-30": "pythagorean",
      "right-triangle-altitude-to-hypotenuse": "pythagorean",
      "spatial-pythagorean-guest": "pythagorean",
      "bee-fly-ant-crawl-pythagorean": "pythagorean",
      "factorization-common-factor-junior": "",
      "factor-common-basic-examples": "factorization-common-factor-junior",
      "factor-change-sign-first": "factorization-common-factor-junior",
      "factor-grouping-common-factor": "factorization-common-factor-junior",
      "factor-six-terms-common-factor": "factorization-common-factor-junior",
      "factor-remove-parentheses-regroup": "factorization-common-factor-junior",
      "factor-repeated-common-factor": "factorization-common-factor-junior",
      "factorization-identities-junior": "",
      "factor-identity-difference-of-squares": "factorization-identities-junior",
      "factor-group-then-difference-of-squares": "factorization-identities-junior",
      "factor-perfect-square-trinomial": "factorization-identities-junior",
      "factor-group-then-perfect-square": "factorization-identities-junior",
      "factor-perfect-square-find-coefficient": "factorization-identities-junior",
      "factorization-cross-method-junior": "",
      "cross-warmup-leading-one": "factorization-cross-method-junior",
      "cross-simplify-first": "factorization-cross-method-junior",
      "cross-change-sign-first": "factorization-cross-method-junior",
      "cross-two-symbols": "factorization-cross-method-junior",
      "cross-leading-not-one": "factorization-cross-method-junior",
      "quadratic-factor-solving-junior": "",
      "quadratic-zero-product-principle": "quadratic-factor-solving-junior",
      "quadratic-double-root-perfect-square": "quadratic-factor-solving-junior",
      "quadratic-cross-method-solving": "quadratic-factor-solving-junior",
      "quadratic-expand-then-solve": "quadratic-factor-solving-junior",
      "quadratic-substitute-same-term-ab": "quadratic-factor-solving-junior",
      "quadratic-restore-from-roots": "quadratic-factor-solving-junior",
      "quadratic-solve-ratio": "quadratic-factor-solving-junior",
      "quadratic-completing-square-formula-junior": "",
      "quadratic-square-root-method": "quadratic-completing-square-formula-junior",
      "quadratic-complete-square-leading-one": "quadratic-completing-square-formula-junior",
      "quadratic-complete-perfect-square": "quadratic-completing-square-formula-junior",
      "quadratic-completing-square-full": "quadratic-completing-square-formula-junior",
      "quadratic-completing-square-vertex-form": "quadratic-completing-square-formula-junior",
      "quadratic-irrational-roots-restore-equation": "quadratic-completing-square-formula-junior",
      "quadratic-applications-junior": "quadratic-completing-square-formula-junior",
      "quadratic-formula-discriminant-junior": "quadratic-completing-square-formula-junior",
      "quadratic-vieta-root-relations-junior": "quadratic-completing-square-formula-junior",
      "quadratic-application-problems-junior": "",
      "quadratic-application-buy-sell": "quadratic-application-problems-junior",
      "quadratic-application-area": "quadratic-application-problems-junior",
      "quadratic-application-consecutive-numbers": "quadratic-application-problems-junior",
      "quadratic-application-geometric-length": "quadratic-application-problems-junior",
      "quadratic-application-change-rate": "quadratic-application-problems-junior",
      "arithmetic-sequence-junior": "",
      "arithmetic-sequence-identify-common-difference": "arithmetic-sequence-junior",
      "arithmetic-sequence-first-terms": "arithmetic-sequence-junior",
      "arithmetic-sequence-nth-term": "arithmetic-sequence-junior",
      "arithmetic-sequence-find-first-or-index": "arithmetic-sequence-junior",
      "arithmetic-sequence-index-positive-negative": "arithmetic-sequence-junior",
      "arithmetic-mean-basic": "arithmetic-sequence-junior",
      "arithmetic-sequence-properties": "arithmetic-sequence-junior",
      "arithmetic-sequence-applications": "arithmetic-sequence-junior",
      "arithmetic-three-numbers": "arithmetic-sequence-junior",
      "arithmetic-common-terms": "arithmetic-sequence-junior",
      "geometric-sequence-junior": "",
      "geometric-sequence-identify-ratio": "geometric-sequence-junior",
      "geometric-sequence-first-terms": "geometric-sequence-junior",
      "geometric-sequence-nth-term": "geometric-sequence-junior",
      "geometric-sequence-find-first-ratio-index": "geometric-sequence-junior",
      "geometric-mean-basic": "geometric-sequence-junior",
      "geometric-three-numbers": "geometric-sequence-junior",
      "geometric-sequence-applications": "geometric-sequence-junior",
      "arithmetic-series-junior": "",
      "arithmetic-series-basic-sum": "arithmetic-series-junior",
      "arithmetic-series-find-term-count-first": "arithmetic-series-junior",
      "arithmetic-series-applications": "arithmetic-series-junior",
      "arithmetic-series-residue-multiples": "arithmetic-series-junior",
      "arithmetic-series-partial-sum-difference": "arithmetic-series-junior",
      "arithmetic-series-insert-middle-sum": "arithmetic-series-junior",
      "arithmetic-series-square-difference": "arithmetic-series-junior"
  };

  const structureOrderOverrides =   {
      "divisibility-rules": 63,
      "number-line-topic": 64,
      "j1-1-1-number-line-elements": 65,
      "j1-1-1-relative-quantity-sign": 66,
      "j1-1-1-opposite-number": 67,
      "j1-1-1-number-system-overview": 68,
      "j1-1-1-order-and-interval": 69,
      "coordinate-origin-unit-change": 70,
      "absolute-value-removal": 71,
      "j1-1-1-absolute-value-equation": 72,
      "absolute-value-high-school": 73,
      "abs-count-basic-drill": 80,
      "abs-count-two-sided-drill": 81,
      "abs-count-reverse-drill": 82,
      "j1-1-1-absolute-value-definition": 83,
      "j1-1-1-distance-midpoint": 84,
      "abs-equation-leading-one-drill": 69,
      "abs-equation-leading-not-one-drill": 70,
      "nonnegative-sum-zero-drill": 71,
      "nonnegative-sum-fixed-one-drill": 72,
      "nonnegative-sum-fixed-multix-drill": 73,
      "abs-both-sides-advanced-drill": 74,
      "abs-four-terms-calc-drill": 75,
      "abs-two-group-calc-drill": 76,
      "abs-remove-and-calc-drill": 77,
      "mod9-remainder-drill": 78,
      "mod9-unknown-multiple-drill": 79,
      "mod9-unknown-remainder-drill": 80,
      "mod11-remainder-drill": 81,
      "mod11-unknown-multiple-drill": 82,
      "mod11-unknown-remainder-drill": 83,
      "factor-application-separate-grouping-drill": 84,
      "factor-application-mixed-grouping-drill": 85,
      "factor-application-circular-track-drill": 86,
      "factor-road-planting-single-drill": 87,
      "factor-road-planting-double-drill": 88,
      "factor-road-keep-position-drill": 89,
      "factor-rectangle-equal-square-drill": 90,
      "factor-rectangle-max-square-mixed-drill": 91,
      "ratio-proportion": 92,
      "proportion-scale-expand": 93,
      "proportion-cross-product": 94,
      "proportion-constant-r": 95,
      "proportion-distribution": 96,
      "cost-list-sale-price": 97,
      "discount-price-difference": 98,
      "distance-time-speed-basic": 99,
      "concentration-solution-basic": 100,
      "linear-inequality-basic": 101,
      "inequality-language-basic": 102,
      "coordinate-translation-scaling": 103,
      "coordinate-plane-basic": 104,
      "point-to-axis-distance": 105,
      "quadrant-sign-basic": 106,
      "coordinate-area-formula-guest": 107,
      "coordinate-line-basic": 108,
      "count-nonnegative-up-to-7": 109,
      "system-linear-equations": 110,
      "linear-system-inconsistent": 111,
      "linear-system-dependent": 112,
      "linear-inequality-region": 113,
      "slope-form": 114,
      "slope-intercept": 115,
      "axis-parallel-lines": 116,
      "line-form-guests": 117,
      "direct-inverse-proportion": 118,
      "direct-proportion-basic": 119,
      "pythagorean": 120,
      "pythagorean-converse": 121,
      "factorization-diff-square": 122,
      "perfect-square": 123,
      "coordinate-shift-unit-conversion": 124,
      "divisor-count-sum-formula": 125,
      "integer-add-subtract-four-terms-drill": 126,
      "three-products-add-subtract-drill": 127,
      "remove-parentheses-add-subtract": 128,
      "remove-parentheses-multiply-divide": 129,
      "distributive-vs-factor": 130,
      "j1-distributive-law-drill": 131,
      "j1-common-factor-drill": 132,
      "j1-common-factor-four-terms-drill": 133,
      "j1-variable-distributive-nearby-drill": 134,
      "j1-variable-distributive-eval-drill": 135,
      "weird-symbol-calc": 136,
      "weird-symbol-calc-three-layer": 137,
      "time-baseline-basic-drill": 138,
      "time-baseline-advanced-drill": 139,
      "opposite-number-equation-drill": 140,
      "midpoint-distance-combined-drill": 182,
      "same-shift-opposite-drill": 142,
      "distance-formula": 183,
      "midpoint-reverse-drill": 185,
      "midpoint-plus-distance-drill": 186,
      "three-point-quick-distance-drill": 187,
      "comparison-reversal-rules": 147,
      "partial-fraction-telescoping-basic": 148,
      "inverse-proportion-graph": 149,
      "square-root-junior": 150,
      "square-root-basic-junior": 151,
      "perfect-square-and-square-root": 152,
      "principal-square-root-and-symbol": 153,
      "square-root-estimation": 154,
      "long-division-square-root-guest": 155,
      "radical-operation-junior": 156,
      "radical-operations-junior": 157,
      "radical-mul-div-split-rule": 158,
      "radical-add-subtract-like-terms": 159,
      "simplest-radical-form-junior": 160,
      "rationalize-denominator-monomial-junior": 161,
      "rationalize-denominator-binomial-junior": 162,
      "point-slope-form": 163,
      "two-point-form": 164,
      "midpoint-formula": 166,
      "substitution-elimination": 167,
      "addition-subtraction-elimination": 168,
      "symmetric-system": 169,
      "nonnegative-system": 170,
      "abc-equal-system": 171,
      "variable-substitution-system": 172,
      "express-number-with-variable": 173,
      "two-variables-to-one": 174,
      "positive-integer-solution-discussion": 175,
      "pythagorean-triples-345": 176,
      "pythagorean-scaling-similarity": 177,
      "special-right-triangles-45-30": 178,
      "right-triangle-altitude-to-hypotenuse": 179,
      "spatial-pythagorean-guest": 180,
      "bee-fly-ant-crawl-pythagorean": 181,
      "factorization-common-factor-junior": 182,
      "factor-common-basic-examples": 183,
      "factor-change-sign-first": 184,
      "factor-grouping-common-factor": 185,
      "factor-six-terms-common-factor": 186,
      "factor-remove-parentheses-regroup": 187,
      "factor-repeated-common-factor": 188,
      "factorization-identities-junior": 189,
      "factor-identity-difference-of-squares": 190,
      "factor-group-then-difference-of-squares": 191,
      "factor-perfect-square-trinomial": 192,
      "factor-group-then-perfect-square": 193,
      "factor-perfect-square-find-coefficient": 194,
      "factorization-cross-method-junior": 195,
      "cross-warmup-leading-one": 196,
      "cross-simplify-first": 197,
      "cross-change-sign-first": 198,
      "cross-two-symbols": 199,
      "cross-leading-not-one": 200,
      "quadratic-factor-solving-junior": 201,
      "quadratic-zero-product-principle": 202,
      "quadratic-double-root-perfect-square": 203,
      "quadratic-cross-method-solving": 204,
      "quadratic-expand-then-solve": 205,
      "quadratic-substitute-same-term-ab": 206,
      "quadratic-restore-from-roots": 207,
      "quadratic-solve-ratio": 208,
      "quadratic-completing-square-formula-junior": 209,
      "quadratic-square-root-method": 210,
      "quadratic-complete-square-leading-one": 211,
      "quadratic-complete-perfect-square": 212,
      "quadratic-completing-square-full": 213,
      "quadratic-completing-square-vertex-form": 214,
      "quadratic-irrational-roots-restore-equation": 215,
      "quadratic-applications-junior": 216,
      "quadratic-formula-discriminant-junior": 217,
      "quadratic-vieta-root-relations-junior": 218,
      "quadratic-application-problems-junior": 219,
      "quadratic-application-buy-sell": 220,
      "quadratic-application-area": 221,
      "quadratic-application-consecutive-numbers": 222,
      "quadratic-application-geometric-length": 223,
      "quadratic-application-change-rate": 224,
      "arithmetic-sequence-junior": 225,
      "arithmetic-sequence-identify-common-difference": 226,
      "arithmetic-sequence-first-terms": 227,
      "arithmetic-sequence-nth-term": 228,
      "arithmetic-sequence-find-first-or-index": 229,
      "arithmetic-sequence-index-positive-negative": 230,
      "arithmetic-mean-basic": 231,
      "arithmetic-sequence-properties": 232,
      "arithmetic-sequence-applications": 233,
      "arithmetic-three-numbers": 234,
      "arithmetic-common-terms": 235,
      "geometric-sequence-junior": 236,
      "geometric-sequence-identify-ratio": 237,
      "geometric-sequence-first-terms": 238,
      "geometric-sequence-nth-term": 239,
      "geometric-sequence-find-first-ratio-index": 240,
      "geometric-mean-basic": 241,
      "geometric-three-numbers": 242,
      "geometric-sequence-applications": 243,
      "arithmetic-series-junior": 244,
      "arithmetic-series-basic-sum": 245,
      "arithmetic-series-find-term-count-first": 246,
      "arithmetic-series-applications": 247,
      "arithmetic-series-residue-multiples": 248,
      "arithmetic-series-partial-sum-difference": 249,
      "arithmetic-series-insert-middle-sum": 250,
      "arithmetic-series-square-difference": 251
  };

  const chapterCodeAssignmentOverrides =   {
      "polynomial-terminology-junior": "j3-1-2",
      "constant-vs-zero-degree-polynomial": "j3-1-2",
      "zero-polynomial-definition": "j3-1-2",
      "like-terms-combine-junior": "j3-1-2",
      "polynomial-subtraction-sign-distribution": "j3-1-2",
      "polynomial-add-subtract-vertical-alignment": "j3-1-2",
      "polynomial-example-3a2b-4b2c": "j3-1-2",
      "polynomial-mul-div-junior": "j3-1-3",
      "quadratic-times-quadratic-main": "j3-1-3",
      "distributive-like-terms-mul": "j3-1-3",
      "monomial-divide-monomial": "j3-1-3",
      "polynomial-divide-monomial": "j3-1-3",
      "cubic-divide-linear": "j3-1-3",
      "cubic-divide-quadratic": "j3-1-3",
      "linear-remove-parentheses-drill": "j1-3-1",
      "linear-multiply-parentheses-drill": "j1-3-1",
      "linear-fraction-parentheses-drill": "j1-3-1",
      "linear-move-terms-solve-drill": "j1-3-1",
      "linear-expand-move-solve-drill": "j1-3-1",
      "linear-cross-expand-move-solve-drill": "j1-3-1",
      "linear-lcm-multiply-move-solve-drill": "j1-3-1",
      "divisibility-rules": "j1-2-1",
      "absolute-value-removal": "j1-1-1",
      "abs-count-basic-drill": "j1-1-1",
      "abs-count-two-sided-drill": "j1-1-1",
      "abs-count-reverse-drill": "j1-1-1",
      "abs-equation-leading-one-drill": "j1-3-1",
      "abs-equation-leading-not-one-drill": "j1-3-1",
      "nonnegative-sum-zero-drill": "j1-3-1",
      "nonnegative-sum-fixed-one-drill": "j1-3-1",
      "nonnegative-sum-fixed-multix-drill": "j1-3-1",
      "abs-both-sides-advanced-drill": "j1-3-1",
      "abs-four-terms-calc-drill": "j1-1-2",
      "abs-two-group-calc-drill": "j1-1-2",
      "abs-remove-and-calc-drill": "j1-1-2",
      "mod9-remainder-drill": "j1-2-2",
      "mod9-unknown-multiple-drill": "j1-2-2",
      "mod9-unknown-remainder-drill": "j1-2-2",
      "mod11-remainder-drill": "j1-2-2",
      "mod11-unknown-multiple-drill": "j1-2-2",
      "mod11-unknown-remainder-drill": "j1-2-2",
      "factor-application-separate-grouping-drill": "j1-2-2",
      "factor-application-mixed-grouping-drill": "j1-2-2",
      "factor-application-circular-track-drill": "j1-2-2",
      "factor-road-planting-single-drill": "j1-2-2",
      "factor-road-planting-double-drill": "j1-2-2",
      "factor-road-keep-position-drill": "j1-2-2",
      "factor-rectangle-equal-square-drill": "j1-2-2",
      "factor-rectangle-max-square-mixed-drill": "j1-2-2",
      "proportion-scale-expand": "j2-3-1",
      "proportion-cross-product": "j2-3-1",
      "proportion-constant-r": "j2-3-1",
      "proportion-distribution": "j2-3-1",
      "cost-list-sale-price": "j2-3-1",
      "discount-price-difference": "j2-3-1",
      "distance-time-speed-basic": "j2-3-1",
      "concentration-solution-basic": "j2-3-1",
      "inequality-language-basic": "j2-4-1",
      "linear-system-inconsistent": "j2-1-1",
      "linear-system-dependent": "j2-1-1",
      "factor-common-basic-examples": "j3-3-1",
      "factor-change-sign-first": "j3-3-1",
      "factor-grouping-common-factor": "j3-3-1",
      "factor-six-terms-common-factor": "j3-3-1",
      "factor-remove-parentheses-regroup": "j3-3-1",
      "factor-repeated-common-factor": "j3-3-1",
      "factor-identity-difference-of-squares": "j3-3-1",
      "factor-group-then-difference-of-squares": "j3-3-1",
      "factor-perfect-square-trinomial": "j3-3-1",
      "factor-group-then-perfect-square": "j3-3-1",
      "factor-perfect-square-find-coefficient": "j3-3-1",
      "cross-warmup-leading-one": "j3-3-1",
      "cross-simplify-first": "j3-3-1",
      "cross-change-sign-first": "j3-3-1",
      "cross-two-symbols": "j3-3-1",
      "cross-leading-not-one": "j3-3-1",
      "j1-distributive-law-drill": "j1-1-1",
      "j1-common-factor-drill": "j1-1-1",
      "j1-common-factor-four-terms-drill": "j1-1-2",
      "j1-variable-distributive-nearby-drill": "j1-1-2",
      "j1-variable-distributive-eval-drill": "j1-1-2",
      "weird-symbol-calc": "j1-1-2",
      "weird-symbol-calc-three-layer": "j1-1-2",
      "time-baseline-basic-drill": "j1-1-2",
      "time-baseline-advanced-drill": "j1-1-2",
      "opposite-number-equation-drill": "j1-1-2",
      "midpoint-distance-combined-drill": "j1-1-1",
      "midpoint-reverse-drill": "j1-1-1",
      "midpoint-plus-distance-drill": "j1-1-1",
      "three-point-quick-distance-drill": "j1-1-1",
      "coordinate-origin-unit-change": "j1-1-1",
      "distance-formula": "j1-1-1"
  };

  const curriculumOverrides = {
    "multiplication-identities-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "distributive-law-multiplication-formula": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "sum-square-identity": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "difference-square-identity": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "square-difference-identity": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "sum-square-drill-branches": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "sum-square-number-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "sum-square-decimal-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "sum-square-fraction-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "sum-square-variable-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "difference-square-drill-branches": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "difference-square-number-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "difference-square-decimal-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "difference-square-fraction-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "difference-square-variable-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "square-difference-drill-branches": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "square-difference-number-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "square-difference-decimal-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "square-difference-fraction-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "square-difference-variable-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "square-difference-number-value-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "square-difference-decimal-value-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "square-difference-fraction-value-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "square-difference-factorization-variable-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-sum-sqsum-to-product-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-diff-sqsum-to-product-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-integer-basic-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-sum-product-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-product-sqsum-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-square-pair-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-linear-combination-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-reciprocal-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-reciprocal-reverse-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-reciprocal-mixed-fraction-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-mixed-advanced-drill": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "identity-value-evaluation": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "three-sum-square-guest": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "cube-identities-guest": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "polynomial-add-subtract-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式", domain: "代數" },
    "polynomial-terminology-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式", domain: "代數" },
    "constant-vs-zero-degree-polynomial": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式", domain: "代數" },
    "zero-polynomial-definition": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式", domain: "代數" },
    "like-terms-combine-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式", domain: "代數" },
    "polynomial-subtraction-sign-distribution": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式", domain: "代數" },
    "polynomial-add-subtract-vertical-alignment": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式", domain: "代數" },
    "polynomial-example-3a2b-4b2c": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式", domain: "代數" },
    "polynomial-operation-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式乘除法", domain: "代數" },
    "polynomial-mul-div-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式乘除法", domain: "代數" },
    "quadratic-times-quadratic-main": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式乘除法", domain: "代數" },
    "distributive-like-terms-mul": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式乘除法", domain: "代數" },
    "monomial-divide-monomial": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式乘除法", domain: "代數" },
    "polynomial-divide-monomial": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式乘除法", domain: "代數" },
    "cubic-divide-linear": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式乘除法", domain: "代數" },
    "cubic-divide-quadratic": { stage: "國中", grade: "國二", term: "上學期", chapter: "多項式乘除法", domain: "代數" },
    "linear-equation": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "linear-remove-parentheses-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "linear-multiply-parentheses-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "linear-fraction-parentheses-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "linear-move-terms-solve-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "linear-expand-move-solve-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "linear-cross-expand-move-solve-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "linear-lcm-multiply-move-solve-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "divisibility-rules": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "number-line-topic": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "j1-1-1-number-line-elements": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "j1-1-1-relative-quantity-sign": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "j1-1-1-opposite-number": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "j1-1-1-number-system-overview": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "j1-1-1-order-and-interval": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "coordinate-origin-unit-change": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "absolute-value-removal": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "j1-1-1-absolute-value-equation": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "absolute-value-high-school": { stage: "高中", grade: "高一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "absolute-value-definition-properties-high-school": { stage: "高中", grade: "高一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "absolute-value-distance-view-high-school": { stage: "高中", grade: "高一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "absolute-value-equation-inequality-high-school": { stage: "高中", grade: "高一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "absolute-value-symbolic-simplification-high-school": { stage: "高中", grade: "高一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "absolute-value-function-graph-high-school": { stage: "高中", grade: "高一", term: "上學期", chapter: "絕對值", domain: "函數圖形" },
    "absolute-value-parameter-range-high-school": { stage: "高中", grade: "高一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "abs-count-basic-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "abs-count-two-sided-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "abs-count-reverse-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "j1-1-1-absolute-value-definition": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "j1-1-1-distance-midpoint": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "abs-equation-leading-one-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "abs-equation-leading-not-one-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "nonnegative-sum-zero-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "nonnegative-sum-fixed-one-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "nonnegative-sum-fixed-multix-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "abs-both-sides-advanced-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "一元一次方程式", domain: "代數" },
    "abs-four-terms-calc-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "abs-two-group-calc-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "abs-remove-and-calc-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "代數" },
    "mod9-remainder-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "mod9-unknown-multiple-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "mod9-unknown-remainder-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "mod11-remainder-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "mod11-unknown-multiple-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "mod11-unknown-remainder-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "factor-application-separate-grouping-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "factor-application-mixed-grouping-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "factor-application-circular-track-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "factor-road-planting-single-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "factor-road-planting-double-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "factor-road-keep-position-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "factor-rectangle-equal-square-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "factor-rectangle-max-square-mixed-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "因數倍數", domain: "數與量" },
    "ratio-proportion": { stage: "國中", grade: "國一", term: "下學期", chapter: "比例", domain: "代數" },
    "proportion-scale-expand": { stage: "國中", grade: "國一", term: "下學期", chapter: "比例", domain: "代數" },
    "proportion-cross-product": { stage: "國中", grade: "國一", term: "下學期", chapter: "比例", domain: "代數" },
    "proportion-constant-r": { stage: "國中", grade: "國一", term: "下學期", chapter: "比例", domain: "代數" },
    "proportion-distribution": { stage: "國中", grade: "國一", term: "下學期", chapter: "比例", domain: "代數" },
    "cost-list-sale-price": { stage: "國中", grade: "國一", term: "下學期", chapter: "比例", domain: "數與量" },
    "discount-price-difference": { stage: "國中", grade: "國一", term: "下學期", chapter: "比例", domain: "數與量" },
    "distance-time-speed-basic": { stage: "國中", grade: "國一", term: "下學期", chapter: "比例", domain: "數與量" },
    "concentration-solution-basic": { stage: "國中", grade: "國一", term: "下學期", chapter: "比例", domain: "數與量" },
    "linear-inequality-basic": { stage: "國中", grade: "國一", term: "下學期", chapter: "一元一次不等式", domain: "代數" },
    "inequality-language-basic": { stage: "國中", grade: "國一", term: "下學期", chapter: "一元一次不等式", domain: "代數" },
    "coordinate-translation-scaling": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "coordinate-plane-basic": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "point-to-axis-distance": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "quadrant-sign-basic": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "coordinate-area-formula-guest": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "coordinate-line-basic": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "count-nonnegative-up-to-7": { stage: "國中", grade: "國一", term: "上學期", chapter: "國一補充", domain: "數與量" },
    "system-linear-equations": { stage: "國中", grade: "國一", term: "下學期", chapter: "二元一次聯立方程式", domain: "代數" },
    "linear-system-inconsistent": { stage: "國中", grade: "國一", term: "下學期", chapter: "二元一次聯立方程式", domain: "代數" },
    "linear-system-dependent": { stage: "國中", grade: "國一", term: "下學期", chapter: "二元一次聯立方程式", domain: "代數" },
    "linear-inequality-region": { stage: "國中", grade: "國一", term: "下學期", chapter: "一元一次不等式", domain: "代數" },
    "slope-form": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "slope-intercept": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "axis-parallel-lines": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "line-form-guests": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "direct-inverse-proportion": { stage: "國中", grade: "國一", term: "下學期", chapter: "正比反比", domain: "函數與圖形" },
    "direct-proportion-basic": { stage: "國中", grade: "國一", term: "下學期", chapter: "正比反比", domain: "函數與圖形" },
    "pythagorean": { stage: "國中", grade: "國二", term: "上學期", chapter: "畢氏定理", domain: "幾何" },
    "pythagorean-converse": { stage: "國中", grade: "國二", term: "上學期", chapter: "畢氏定理", domain: "幾何" },
    "pythagorean-triples-345": { stage: "國中", grade: "國二", term: "上學期", chapter: "畢氏定理", domain: "幾何" },
    "pythagorean-scaling-similarity": { stage: "國中", grade: "國二", term: "上學期", chapter: "畢氏定理", domain: "幾何" },
    "special-right-triangles-45-30": { stage: "國中", grade: "國二", term: "上學期", chapter: "畢氏定理", domain: "幾何" },
    "right-triangle-altitude-to-hypotenuse": { stage: "國中", grade: "國二", term: "上學期", chapter: "畢氏定理", domain: "幾何" },
    "spatial-pythagorean-guest": { stage: "國中", grade: "國二", term: "上學期", chapter: "畢氏定理", domain: "幾何" },
    "bee-fly-ant-crawl-pythagorean": { stage: "國中", grade: "國二", term: "上學期", chapter: "畢氏定理", domain: "幾何" },
    "factorization-common-factor-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-common-basic-examples": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-change-sign-first": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-grouping-common-factor": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-six-terms-common-factor": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-remove-parentheses-regroup": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-repeated-common-factor": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factorization-identities-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-identity-difference-of-squares": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-group-then-difference-of-squares": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-perfect-square-trinomial": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-group-then-perfect-square": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factor-perfect-square-find-coefficient": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factorization-cross-method-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "cross-warmup-leading-one": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "cross-simplify-first": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "cross-change-sign-first": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "cross-two-symbols": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "cross-leading-not-one": { stage: "國中", grade: "國二", term: "上學期", chapter: "因式分解", domain: "代數" },
    "factorization-diff-square": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "perfect-square": { stage: "國中", grade: "國二", term: "上學期", chapter: "乘法公式", domain: "代數" },
    "coordinate-shift-unit-conversion": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "divisor-count-sum-formula": { stage: "國中", grade: "國一", term: "上學期", chapter: "國一補充", domain: "數與量" },
    "integer-add-subtract-four-terms-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "three-products-add-subtract-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "remove-parentheses-add-subtract": { stage: "國中", grade: "國一", term: "上學期", chapter: "國一補充", domain: "代數" },
    "remove-parentheses-multiply-divide": { stage: "國中", grade: "國一", term: "上學期", chapter: "國一補充", domain: "代數" },
    "distributive-vs-factor": { stage: "國中", grade: "國一", term: "上學期", chapter: "國一補充", domain: "代數" },
    "j1-distributive-law-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "代數" },
    "j1-common-factor-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "代數" },
    "j1-common-factor-four-terms-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "代數" },
    "j1-variable-distributive-nearby-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "代數" },
    "j1-variable-distributive-eval-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "代數" },
    "weird-symbol-calc": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "代數" },
    "weird-symbol-calc-three-layer": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "代數" },
    "time-baseline-basic-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "time-baseline-advanced-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "opposite-number-equation-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "midpoint-distance-combined-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "distance-formula": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "same-shift-opposite-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "midpoint-reverse-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "midpoint-plus-distance-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "three-point-quick-distance-drill": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "comparison-reversal-rules": { stage: "國中", grade: "國一", term: "上學期", chapter: "正負數加減乘除", domain: "數與量" },
    "partial-fraction-telescoping-basic": { stage: "國中", grade: "國一", term: "上學期", chapter: "國一補充", domain: "數與量" },
    "inverse-proportion-graph": { stage: "國中", grade: "國一", term: "下學期", chapter: "正比反比", domain: "函數與圖形" },

    "square-root-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "二次方根", domain: "代數" },
    "square-root-basic-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "二次方根", domain: "代數" },
    "perfect-square-and-square-root": { stage: "國中", grade: "國二", term: "上學期", chapter: "二次方根", domain: "代數" },
    "principal-square-root-and-symbol": { stage: "國中", grade: "國二", term: "上學期", chapter: "二次方根", domain: "代數" },
    "square-root-estimation": { stage: "國中", grade: "國二", term: "上學期", chapter: "二次方根", domain: "代數" },
    "long-division-square-root-guest": { stage: "國中", grade: "國二", term: "上學期", chapter: "二次方根", domain: "代數" },
    "radical-operation-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "根式的運算", domain: "代數" },
    "radical-operations-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "根式的運算", domain: "代數" },
    "radical-mul-div-split-rule": { stage: "國中", grade: "國二", term: "上學期", chapter: "根式的運算", domain: "代數" },
    "radical-add-subtract-like-terms": { stage: "國中", grade: "國二", term: "上學期", chapter: "根式的運算", domain: "代數" },
    "simplest-radical-form-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "根式的運算", domain: "代數" },
    "rationalize-denominator-monomial-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "根式的運算", domain: "代數" },
    "rationalize-denominator-binomial-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "根式的運算", domain: "代數" },
    "point-slope-form": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "two-point-form": { stage: "國中", grade: "國一", term: "下學期", chapter: "座標概念", domain: "函數與圖形" },
    "midpoint-formula": { stage: "國中", grade: "國一", term: "上學期", chapter: "絕對值", domain: "數與量" },
    "quadratic-factor-solving-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-zero-product-principle": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-double-root-perfect-square": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-cross-method-solving": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-expand-then-solve": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-substitute-same-term-ab": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-restore-from-roots": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-solve-ratio": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-completing-square-formula-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-square-root-method": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-complete-square-leading-one": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-complete-perfect-square": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-completing-square-full": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-completing-square-vertex-form": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-irrational-roots-restore-equation": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-applications-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-formula-discriminant-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-vieta-root-relations-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-application-problems-junior": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-application-buy-sell": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-application-area": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-application-consecutive-numbers": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-application-geometric-length": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "quadratic-application-change-rate": { stage: "國中", grade: "國二", term: "上學期", chapter: "一元二次方程式", domain: "代數" },
    "arithmetic-sequence-junior": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "arithmetic-sequence-identify-common-difference": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "arithmetic-sequence-first-terms": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "arithmetic-sequence-nth-term": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "arithmetic-sequence-find-first-or-index": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "arithmetic-sequence-index-positive-negative": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "arithmetic-mean-basic": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "arithmetic-sequence-properties": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "arithmetic-sequence-applications": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "arithmetic-three-numbers": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "arithmetic-common-terms": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差數列", domain: "數與量" },
    "geometric-sequence-junior": { stage: "國中", grade: "國二", term: "下學期", chapter: "等比數列", domain: "數與量" },
    "geometric-sequence-identify-ratio": { stage: "國中", grade: "國二", term: "下學期", chapter: "等比數列", domain: "數與量" },
    "geometric-sequence-first-terms": { stage: "國中", grade: "國二", term: "下學期", chapter: "等比數列", domain: "數與量" },
    "geometric-sequence-nth-term": { stage: "國中", grade: "國二", term: "下學期", chapter: "等比數列", domain: "數與量" },
    "geometric-sequence-find-first-ratio-index": { stage: "國中", grade: "國二", term: "下學期", chapter: "等比數列", domain: "數與量" },
    "geometric-mean-basic": { stage: "國中", grade: "國二", term: "下學期", chapter: "等比數列", domain: "數與量" },
    "geometric-three-numbers": { stage: "國中", grade: "國二", term: "下學期", chapter: "等比數列", domain: "數與量" },
    "geometric-sequence-applications": { stage: "國中", grade: "國二", term: "下學期", chapter: "等比數列", domain: "數與量" },
    "arithmetic-series-junior": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差級數", domain: "數與量" },
    "arithmetic-series-basic-sum": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差級數", domain: "數與量" },
    "arithmetic-series-find-term-count-first": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差級數", domain: "數與量" },
    "arithmetic-series-applications": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差級數", domain: "數與量" },
    "arithmetic-series-residue-multiples": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差級數", domain: "數與量" },
    "arithmetic-series-partial-sum-difference": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差級數", domain: "數與量" },
    "arithmetic-series-insert-middle-sum": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差級數", domain: "數與量" },
    "arithmetic-series-square-difference": { stage: "國中", grade: "國二", term: "下學期", chapter: "等差級數", domain: "數與量" },



  };

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  const fallbackTitleMap = {
    "linear-equation": "一元一次方程式",
    "linear-remove-parentheses-drill": "去括號（一元一次）",
    "linear-multiply-parentheses-drill": "有乘法的去括號（一元一次）",
    "linear-fraction-parentheses-drill": "有分數的去括號（一元一次）",
    "linear-move-terms-solve-drill": "移項求解",
    "linear-expand-move-solve-drill": "展開移項求解",
    "linear-cross-expand-move-solve-drill": "交叉相乘後展開移項求解",
    "linear-lcm-multiply-move-solve-drill": "同乘公倍數後整理移項求解",
    "divisibility-rules": "3、9、11 倍數判斷法",
    "absolute-value-removal": "去絕對值公式與使用",
    "absolute-value-high-school": "s1-1-2 絕對值",
    "absolute-value-definition-properties-high-school": "絕對值的定義與性質",
    "absolute-value-distance-view-high-school": "距離觀點與反向表達",
    "absolute-value-equation-inequality-high-school": "絕對值方程式與不等式",
    "absolute-value-symbolic-simplification-high-school": "絕對值的符號化簡",
    "absolute-value-function-graph-high-school": "絕對值函數圖形與最值",
    "absolute-value-parameter-range-high-school": "參數與反向問題",
    "count-nonnegative-up-to-7": "小於或等於某數的非負整數個數",
    "abs-count-basic-drill": "絕對值個數問題",
    "abs-count-two-sided-drill": "絕對值個數問題二邊範圍",
    "abs-count-reverse-drill": "絕對值個數問題反向",
    "abs-equation-leading-one-drill": "絕對值方程式最高次係數=1",
    "abs-equation-leading-not-one-drill": "絕對值方程式最高次係數≠1",
    "nonnegative-sum-zero-drill": "非負整數和=0",
    "nonnegative-sum-fixed-one-drill": "非負整數和固定討論",
    "nonnegative-sum-fixed-multix-drill": "非負整數解和固定討論多組解(只求x)",
    "abs-both-sides-advanced-drill": "進階補充兩邊都有絕對值",
    "abs-four-terms-calc-drill": "四數含絕對值計算",
    "abs-two-group-calc-drill": "二組絕對值計算",
    "abs-remove-and-calc-drill": "去絕對值計算",
    "mod9-remainder-drill": "求大數除以9的餘數",
    "mod9-unknown-multiple-drill": "反向求大數除以9整除（未知位數）",
    "mod9-unknown-remainder-drill": "反向求大數除以9餘數（未知位數）",
    "mod11-remainder-drill": "求大數除以11的餘數",
    "mod11-unknown-multiple-drill": "反向求大數除以11整除（未知位數）",
    "mod11-unknown-remainder-drill": "反向求大數除以11餘數（未知位數）",
    "factor-application-separate-grouping-drill": "男女分別分組",
    "factor-application-mixed-grouping-drill": "男女混合分組",
    "factor-application-circular-track-drill": "跑環狀跑道",
    "factor-road-planting-single-drill": "道路種樹（單側）",
    "factor-road-planting-double-drill": "道路種樹（兩側）",
    "factor-road-keep-position-drill": "不需移動個數",
    "factor-rectangle-equal-square-drill": "長方形裁成大小相同正方形最少幾塊",
    "factor-rectangle-max-square-mixed-drill": "長方形裁成數個最大正方形最少幾塊",
    "ratio-proportion": "比例",
    "proportion-scale-expand": "放大縮小與約分擴分",
    "proportion-cross-product": "內內 = 外外",
    "proportion-constant-r": "比例常數 r",
    "proportion-distribution": "比例分配",
    "cost-list-sale-price": "成本、定價、售價",
    "discount-price-difference": "打折與價差列式",
    "distance-time-speed-basic": "距離、時間、速度",
    "concentration-solution-basic": "濃度、溶質、溶液、溶劑",
    "linear-inequality-basic": "一元一次不等式",
    "inequality-language-basic": "不等式中文轉數學式",
    "multiplication-identities-junior": "乘法公式",
    "distributive-law-multiplication-formula": "先做分配律",
    "sum-square-identity": "和平方",
    "difference-square-identity": "差平方",
    "square-difference-identity": "平方差",
    "sum-square-drill-branches": "和平方分支練習",
    "sum-square-number-drill": "和平方數字版",
    "sum-square-decimal-drill": "和平方小數版",
    "sum-square-fraction-drill": "和平方分數版",
    "sum-square-variable-drill": "和平方未知數版",
    "difference-square-drill-branches": "差平方分支練習",
    "difference-square-number-drill": "差平方數字版",
    "difference-square-decimal-drill": "差平方小數版",
    "difference-square-fraction-drill": "差平方分數版",
    "difference-square-variable-drill": "差平方未知數版",
    "square-difference-drill-branches": "平方差分支練習",
    "square-difference-number-drill": "整數共軛乘法",
    "square-difference-decimal-drill": "小數共軛乘法",
    "square-difference-fraction-drill": "分數共軛乘法",
    "square-difference-variable-drill": "平方差未知數展開",
    "square-difference-number-value-drill": "整數平方差",
    "square-difference-decimal-value-drill": "小數平方差",
    "square-difference-fraction-value-drill": "分數平方差",
    "square-difference-factorization-variable-drill": "平方差未知數分解",
    "identity-value-sum-sqsum-to-product-drill": "由 a+b、a^2+b^2 求 ab",
    "identity-value-diff-sqsum-to-product-drill": "由 a-b、a^2+b^2 求 ab",
    "identity-value-integer-basic-drill": "求值整數版",
    "identity-value-sum-product-drill": "由 a+b、ab 開始求值",
    "identity-value-product-sqsum-drill": "由 ab、a^2+b^2 求 a+b、a-b",
    "identity-value-square-pair-drill": "由 (a+b)^2、(a-b)^2 求值",
    "identity-value-linear-combination-drill": "組合式求值",
    "identity-value-reciprocal-drill": "倒數型求值",
    "identity-value-reciprocal-reverse-drill": "倒數反推型",
    "identity-value-reciprocal-mixed-fraction-drill": "倒數混合分式型",
    "identity-value-mixed-advanced-drill": "求值進階混合版",
    "identity-value-evaluation": "利用乘法公式求值",
    "three-sum-square-guest": "三數和的平方",
    "cube-identities-guest": "和立方、差立方、立方和、立方差",
    "polynomial-add-subtract-junior": "多項式加減",
    "polynomial-terminology-junior": "多項式名詞整理",
    "constant-vs-zero-degree-polynomial": "常數多項式與零次多項式",
    "zero-polynomial-definition": "零多項式（易錯）",
    "like-terms-combine-junior": "同類項合併",
    "polynomial-subtraction-sign-distribution": "減法去括號與變號",
    "polynomial-add-subtract-vertical-alignment": "多項式加減直式對齊",
    "polynomial-example-3a2b-4b2c": "例題：(3A+2B)-(4B+2C)",
    "polynomial-operation-junior": "多項式乘除法",
    "polynomial-mul-div-junior": "多項式乘除法總覽",
    "quadratic-times-quadratic-main": "二次 × 二次（主角）",
    "distributive-like-terms-mul": "分配律展開後合併同類項",
    "monomial-divide-monomial": "單項式 ÷ 單項式",
    "polynomial-divide-monomial": "多項式 ÷ 單項式",
    "cubic-divide-linear": "三次 ÷ 一次",
    "cubic-divide-quadratic": "三次 ÷ 二次",
    "square-root-junior": "二次方根",
    "square-root-basic-junior": "平方根基本概念",
    "perfect-square-and-square-root": "平方數與平方根",
    "principal-square-root-and-symbol": "主平方根與根號符號",
    "square-root-estimation": "平方根估值",
    "long-division-square-root-guest": "直式開根號（客串）",
    "radical-operation-junior": "根式的運算",
    "radical-operations-junior": "根式運算總覽",
    "radical-mul-div-split-rule": "乘除可拆",
    "radical-add-subtract-like-terms": "加減不可拆（同類項合併）",
    "simplest-radical-form-junior": "最簡根式",
    "rationalize-denominator-monomial-junior": "單項有理化分母",
    "rationalize-denominator-binomial-junior": "多項有理化分母（平方差）",
    "coordinate-plane-basic": "直角坐標",
    "point-to-axis-distance": "點到坐標軸的距離",
    "quadrant-sign-basic": "四象限判斷",
    "coordinate-area-formula-guest": "座標求面積公式",
    "coordinate-line-basic": "直角坐標上的直線方程式",
    "slope-form": "直線斜率公式",
    "slope-intercept": "一次函數斜截式",
    "axis-parallel-lines": "垂直 x 軸與平行 x 軸的直線",
    "line-form-guests": "其他直線表示法",
    "direct-inverse-proportion": "正比反比",
    "direct-proportion-basic": "正比",
    "inverse-proportion-graph": "反比",
    "system-linear-equations": "二元一次聯立方程式",
    "system-substitution-elimination": "代入消去法",
    "system-add-subtract-elimination": "加減消去法",
    "system-symmetric-type": "對稱型",
    "system-nonnegative-type": "非負整數型",
    "system-a-b-c-equal-type": "A=B=C 型",
    "system-variable-substitution": "變數變換法",
    "system-variable-sense": "用未知數表示一個數字的感覺",
    "system-two-to-one-variable": "二個未知數換成一個未知數",
    "system-positive-integer-discussion": "正整數解的討論",
    "linear-system-inconsistent": "二元一次聯立方程式矛盾方程式",
    "linear-system-dependent": "二元一次聯立方程式相依方程式",
    "pythagorean": "畢氏定理",
    "pythagorean-converse": "畢氏定理逆定理",
    "pythagorean-triples-345": "畢氏數 3:4:5",
    "pythagorean-scaling-similarity": "畢氏定理中的放大縮小",
    "special-right-triangles-45-30": "特殊直角三角形 45-45-90 與 30-60-90",
    "right-triangle-altitude-to-hypotenuse": "直角三角形斜邊上的高",
    "spatial-pythagorean-guest": "空間中的畢氏定理",
    "bee-fly-ant-crawl-pythagorean": "蜜蜂飛與螞蟻爬",
    "factorization-common-factor-junior": "j3-3-1 提公因式",
    "factor-common-basic-examples": "提公因式範例",
    "factor-change-sign-first": "先變號再提公因式",
    "factor-grouping-common-factor": "分組提公因式",
    "factor-six-terms-common-factor": "六項提公因式",
    "factor-remove-parentheses-regroup": "去括號重新組合",
    "factor-repeated-common-factor": "連續提公因式",
    "factorization-identities-junior": "j3-3-2 利用乘法公式因式分解",
    "factor-identity-difference-of-squares": "平方差",
    "factor-group-then-difference-of-squares": "分組提公因式後再平方差",
    "factor-perfect-square-trinomial": "和差平方",
    "factor-group-then-perfect-square": "分組提公因式後再和差平方",
    "factor-perfect-square-find-coefficient": "完全平方求係數",
    "factorization-cross-method-junior": "j3-3-3 利用十字交乘因式分解",
    "cross-warmup-leading-one": "暖身：二次項係數為 1 的十字交乘",
    "cross-simplify-first": "先整理再十字交乘",
    "cross-change-sign-first": "先變號再十字交乘",
    "cross-two-symbols": "含兩種文字符號的十字交乘",
    "cross-leading-not-one": "二次項係數不為 1 的十字交乘",
    "quadratic-factor-solving-junior": "j3-4-1 因式分解解一元二次方程式",
    "quadratic-zero-product-principle": "基本原理：AB = 0",
    "quadratic-double-root-perfect-square": "重根 vs 完全平方",
    "quadratic-cross-method-solving": "十字交乘解一元二次方程式",
    "quadratic-expand-then-solve": "展開再整理",
    "quadratic-substitute-same-term-ab": "先令相同項為 A、B",
    "quadratic-restore-from-roots": "兩根還原",
    "quadratic-solve-ratio": "解方程式求比值",
    "quadratic-completing-square-formula-junior": "j3-4-2 配方法與公式解",
    "quadratic-square-root-method": "利用平方根解一元二次方程式",
    "quadratic-complete-square-leading-one": "完全平方式（二次項係數為 1）",
    "quadratic-complete-perfect-square": "配成完全平方",
    "quadratic-completing-square-full": "完整的配方法",
    "quadratic-completing-square-vertex-form": "配方法的另一種型態（國三二次函數使用）",
    "quadratic-irrational-roots-restore-equation": "無理根求原方程式（還原法）",
    "quadratic-applications-junior": "一元二次方程式應用",
    "quadratic-formula-discriminant-junior": "一元二次方程式的公式解與判別式",
    "quadratic-vieta-root-relations-junior": "根與係數的關係，兩根和、兩根積、兩根差",
    "quadratic-application-problems-junior": "j3-4-3 一元二次方程式應用問題",
    "quadratic-application-buy-sell": "買賣問題",
    "quadratic-application-area": "面積問題",
    "quadratic-application-consecutive-numbers": "連續數問題",
    "quadratic-application-geometric-length": "幾何邊長問題",
    "quadratic-application-change-rate": "動態增減問題",
    "divisor-count-sum-formula": "因數個數與因數總和公式",
    "comparison-reversal-rules": "比大小三反向",
    "partial-fraction-telescoping-basic": "分式拆項對消",
    "coordinate-shift-unit-conversion": "換原點與單位長的坐標換算",
    "integer-add-subtract-four-terms-drill": "四個正負數的加減綜合練習",
    "three-products-add-subtract-drill": "乘積後再相加減的綜合練習",
    "remove-parentheses-add-subtract": "加減法的去括號法則",
    "remove-parentheses-multiply-divide": "乘除法的去括號法則",
    "distributive-vs-factor": "分配律與提出公因數",
    "j1-distributive-law-drill": "分配律",
    "j1-common-factor-drill": "提出公因數",
    "j1-common-factor-four-terms-drill": "4項提出公因數",
    "j1-variable-distributive-nearby-drill": "利用未知數的分配律",
    "j1-variable-distributive-eval-drill": "利用分配律與未知數求值",
    "weird-symbol-calc": "奇怪的符號計算",
    "weird-symbol-calc-three-layer": "奇怪的符號計算三層版",
    "number-line-topic": "數線",
    "time-baseline-basic-drill": "時間基準問題",
    "time-baseline-advanced-drill": "進階時間基準問題（不同基準）",
    "opposite-number-equation-drill": "相反數問題",
    "midpoint-distance-combined-drill": "中點與距離問題",
    "same-shift-opposite-drill": "兩數同加或減一數成相反數",
    "midpoint-reverse-drill": "中點反向問題",
    "midpoint-plus-distance-drill": "中點加距離綜合問題",
    "three-point-quick-distance-drill": "三點快速看距離練習",
    "coordinate-origin-unit-change": "改變原點與單位長時坐標變化",
    "arithmetic-sequence-junior": "j4-1-1 等差數列",
    "arithmetic-sequence-identify-common-difference": "判別等差數列與公差",
    "arithmetic-sequence-first-terms": "寫出等差數列的前幾項",
    "arithmetic-sequence-nth-term": "等差數列的第 n 項",
    "arithmetic-sequence-find-first-or-index": "求首項、項數與末項",
    "arithmetic-sequence-index-positive-negative": "第幾項開始為正或負",
    "arithmetic-mean-basic": "等差中項",
    "arithmetic-sequence-properties": "等差數列的特性",
    "arithmetic-sequence-applications": "等差數列的應用",
    "arithmetic-three-numbers": "三數成等差數列",
    "arithmetic-common-terms": "共同項",
    "geometric-sequence-junior": "j4-1-2 等比數列",
    "geometric-sequence-identify-ratio": "判別等比數列與公比",
    "geometric-sequence-first-terms": "寫出等比數列的前幾項",
    "geometric-sequence-nth-term": "等比數列的第 n 項",
    "geometric-sequence-find-first-ratio-index": "求首項、公比與項數",
    "geometric-mean-basic": "等比中項",
    "geometric-three-numbers": "三數成等比數列",
    "geometric-sequence-applications": "等比數列的應用",
    "arithmetic-series-junior": "j4-1-3 等差級數",
    "arithmetic-series-basic-sum": "等差級數和公式",
    "arithmetic-series-find-term-count-first": "先求項數再求等差級數",
    "arithmetic-series-applications": "等差級數應用",
    "arithmetic-series-residue-multiples": "餘數與倍數的等差級數",
    "arithmetic-series-partial-sum-difference": "由前 n 項和反推單項",
    "arithmetic-series-insert-middle-sum": "等差中間項的和",
    "arithmetic-series-square-difference": "平方差 vs 等差級數",
  };

  function humanizeFallbackId(id) {
    const text = String(id || "").trim();
    if (!text) return "未命名主題";
    return text
      .split("-")
      .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : "")
      .join(" ");
  }

  function inferFallbackTitle(id, chapter) {
    return fallbackTitleMap[id] || chapter || humanizeFallbackId(id);
  }

  function buildFallbackBaseFormulas() {
    const ids = new Set([
      ...Object.keys(curriculumOverrides),
      ...Object.keys(topicParentOverrides),
      ...Object.values(topicParentOverrides)
    ]);

    return Array.from(ids)
      .map((id) => String(id || "").trim())
      .filter(Boolean)
      .map((id) => {
      const own = curriculumOverrides[id] || null;
      const child = Object.entries(topicParentOverrides)
        .find(([, parentId]) => parentId === id)?.[0];
      const childCurriculum = child ? curriculumOverrides[child] || null : null;
      const source = own || childCurriculum || {};
      const stage = source.stage || "國中";
      const grade = source.grade || "國一";
      const term = source.term || "";
      const chapter = source.chapter || "未分類章節";
      const domain = source.domain || "未分類領域";

      return {
        id,
        title: inferFallbackTitle(id, own ? chapter : ""),
        formula: "尚未整理",
        stage,
        grade,
        term,
        chapter,
        domain,
        chapterRole: "",
        parentId: Object.prototype.hasOwnProperty.call(structureParentOverrides, id) ? structureParentOverrides[id] : (topicParentOverrides[id] || ""),
        relatedChapters: [],
        relatedTopicIds: [],
        difficulty: "基礎",
        contentTypes: ["公式"],
        tags: [],
        usage: [],
        examples: [],
        tips: [],
        notes: [],
        mistakes: []
      };
    });
  }

  function getBaseFormulas() {
    const separated = Array.isArray(window.formulaContentRecords) ? window.formulaContentRecords : [];
    const base = Array.isArray(window.baseFormulas) ? window.baseFormulas : [];

    if (!separated.length) {
      return base.length ? deepClone(base) : deepClone(buildFallbackBaseFormulas());
    }

    const foundation = base.length ? deepClone(base) : [];

    const foundationById = new Map(foundation.map((item) => [item.id, item]));
    const separatedIds = new Set();
    const mergedInDbOrder = separated.map((item, index) => {
      const id = String(item?.id || "").trim();
      if (id) separatedIds.add(id);
      const existing = foundationById.get(id);
      return {
        ...(existing || {}),
        ...deepClone(item),
        manualOrder: Number.isFinite(Number(item?.manualOrder)) ? Number(item.manualOrder) : index,
        originalIndex: Number.isFinite(Number(item?.originalIndex)) ? Number(item.originalIndex) : index
      };
    });

    const missingFoundation = foundation
      .filter((item) => !separatedIds.has(String(item.id || "").trim()))
      .map((item, offset) => ({
        ...item,
        manualOrder: mergedInDbOrder.length + offset,
        originalIndex: mergedInDbOrder.length + offset
      }));

    return mergedInDbOrder.concat(missingFoundation);
  }

  function normalizeTermText(term) {
    const text = String(term || "").trim();
    if (!text) return "";
    if (text === "上" || text === "上學期") return "上學期";
    if (text === "下" || text === "下學期") return "下學期";
    return text;
  }

  function extractGradeAndTerm(rawGrade) {
    const text = String(rawGrade || "").trim();
    if (!text) return { grade: "", term: "" };
    if (text.endsWith("上學期")) return { grade: text.replace(/上學期$/, "").trim(), term: "上學期" };
    if (text.endsWith("下學期")) return { grade: text.replace(/下學期$/, "").trim(), term: "下學期" };
    if (text.endsWith("上")) return { grade: text.slice(0, -1).trim(), term: "上學期" };
    if (text.endsWith("下")) return { grade: text.slice(0, -1).trim(), term: "下學期" };
    return { grade: text, term: "" };
  }

  function buildGradeLabel(grade, term) {
    if (!grade) return "";
    if (grade === "高三") return "高三";
    if (!term) return grade;
    return `${grade}${term === "上學期" ? "上" : term === "下學期" ? "下" : term}`;
  }

  function normalizeContentTypes(rawTypes) {
    if (Array.isArray(rawTypes)) {
      return rawTypes.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof rawTypes === "string") {
      return rawTypes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  function normalizeDifficulty(rawDifficulty) {
    const text = String(rawDifficulty || "").trim();
    if (text === "進階") return "進階";
    if (text === "課外" || text === "挑戰") return "課外";
    return "基礎";
  }

  function isStructuredFormula(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    if (value.type === "labeled-lines") return Array.isArray(value.lines);
    return false;
  }

  function normalizeMathNotation(text) {
    if (isStructuredFormula(text)) return deepClone(text);
    return String(text || "")
      .replace(/!=/g, "≠")
      .replace(/>=/g, "?")
      .replace(/<=/g, "?")
      .replace(/=>/g, "?")
      .replace(/_ *\(([^()]+)\)/g, "_{$1}")
      .replace(/\b([A-Za-z])([12])\b/g, "$1_$2")
      .replace(/\b([A-Za-z])n\b/g, "$1_n")
      .replace(/\b([A-Za-z])k\b/g, "$1_k")
      .replace(/\b([A-Za-z])m\b/g, "$1_m")
      .replace(/\b([A-Za-z])r\b/g, "$1_r");
  }

  function normalizeTextList(items) {
    return (Array.isArray(items) ? items : []).map((item) => normalizeMathNotation(item));
  }

  function looksLikeLatex(value) {
    if (isStructuredFormula(value)) return false;
    const text = String(value || "");
    return /\\[A-Za-z]+/.test(text) || /[_^]\{/.test(text) || /\\[()[\]]/.test(text);
  }

  function containsMathSubOrSup(value) {
    if (isStructuredFormula(value)) return false;
    const text = String(value || "");
    return /[A-Za-z]_[A-Za-z0-9{]/.test(text) || /[A-Za-z]\^[A-Za-z0-9{(]/.test(text);
  }

  function normalizeMathContent(value, locked) {
    if (isStructuredFormula(value)) return deepClone(value);
    return locked || looksLikeLatex(value) ? String(value || "") : normalizeMathNotation(value || "");
  }

  function normalizeMathTextList(items, locked) {
    return locked
      ? (Array.isArray(items) ? items : []).map((item) => String(item || ""))
      : (Array.isArray(items) ? items : []).map((item) => (looksLikeLatex(item) ? String(item || "") : normalizeMathNotation(item)));
  }

  function inferContentTypes(item) {
    const explicitTypes = normalizeContentTypes(item.contentTypes);
    if (item.contentTypesLocked && explicitTypes.length) return explicitTypes;

    const types = new Set();
    const formula = item.formula;
    const usage = Array.isArray(item.usage) ? item.usage : [];
    const examples = Array.isArray(item.examples) ? item.examples : [];
    const tips = Array.isArray(item.tips) ? item.tips : [];
    const notes = Array.isArray(item.notes) ? item.notes : [];
    const mistakes = Array.isArray(item.mistakes) ? item.mistakes : [];

    if ((typeof formula === "string" && formula.trim()) || isStructuredFormula(formula)) types.add("公式");
    if (usage.length) types.add("定義");
    if (examples.length) types.add("題型");
    if (tips.length) types.add("使用技巧");
    if (notes.length) types.add("注意事項");
    if (mistakes.length) types.add("常見錯誤");
    types.add("無限練習");

    return Array.from(types);
  }

  function getChapterOrder(stage, grade, term, chapter) {
    const key = `${stage}-${grade}-${term}`;
    const chapters = chapterSequence[key] || [];
    const index = chapters.indexOf(chapter);
    return index === -1 ? 999 : index + 1;
  }

  function getChapterCode(stage, grade, term, chapter) {
    const normalizedChapter = normalizeChapterName(chapter);
    const raw = chapterCodeMap[`${stage}-${grade}-${term}-${normalizedChapter}`] || "";
    return chapterCodeAliases[raw] || raw;
  }

  function formatChapterLabel(stage, grade, term, chapter) {
    const code = getChapterCode(stage, grade, term, chapter);
    if (!code) return chapter;
    const catalog = getCodeCatalogEntry(code);
    const label = isUsableCatalogText(catalog?.section) ? catalog.section : chapter;
    return `${code} ${label}`;
  }

  function getChapterOptions() {
    const fromCatalog = Object.entries(chapterCodeCatalog)
      .map(([code, catalog]) => {
        const explicitMeta = mergedChapterMetaByCode[code] || {};
        const inferredMeta = inferMetaFromCode(code);
        const meta = {
          stage: String(explicitMeta.stage || inferredMeta.stage || "").trim(),
          grade: String(explicitMeta.grade || inferredMeta.grade || "").trim(),
          term: String(explicitMeta.term || inferredMeta.term || "").trim(),
          chapter: String(explicitMeta.chapter || inferredMeta.chapter || "").trim()
        };
        const section = isUsableCatalogText(catalog?.section) ? catalog.section : "";
        const chapter = isUsableCatalogText(catalog?.chapter) ? catalog.chapter : section || meta.chapter || "";
        return {
          code,
          stage: meta.stage,
          grade: meta.grade,
          term: meta.term,
          chapter,
          section: section || chapter,
          domainMain: catalog?.domainMain || "",
          domainSub: catalog?.domainSub || "",
          label: `${code} ${section || chapter || code}`
        };
      })
      .sort((a, b) => {
        return (
          ((stageOrderMap[a.stage] || 99) - (stageOrderMap[b.stage] || 99)) ||
          ((gradeOrderMap[a.grade] || 99) - (gradeOrderMap[b.grade] || 99)) ||
          ((termOrderMap[a.term] || 99) - (termOrderMap[b.term] || 99)) ||
          (getChapterOrder(a.stage, a.grade, a.term, a.chapter) - getChapterOrder(b.stage, b.grade, b.term, b.chapter)) ||
          String(a.label).localeCompare(String(b.label), "zh-Hant")
        );
      });

    return fromCatalog;
  }

  function inferTerm(stage, grade, chapter) {
    const upperKey = `${stage}-${grade}-上學期`;
    const lowerKey = `${stage}-${grade}-下學期`;
    const unsplitKey = `${stage}-${grade}-`;
    if ((chapterSequence[upperKey] || []).includes(chapter)) return "上學期";
    if ((chapterSequence[lowerKey] || []).includes(chapter)) return "下學期";
    if ((chapterSequence[unsplitKey] || []).includes(chapter)) return "";
    return "";
  }

  function compareCurriculumItems(a, b) {
    return (
      (a.stageOrder - b.stageOrder) ||
      (a.gradeOrder - b.gradeOrder) ||
      (a.termOrder - b.termOrder) ||
      (a.chapterOrder - b.chapterOrder) ||
      (a.originalIndex - b.originalIndex) ||
      String(a.title).localeCompare(String(b.title), "zh-Hant")
    );
  }

  function getCodeFamily(code) {
    const raw = String(code || "").trim().toLowerCase();
    if (!raw) return "";
    const parts = raw.split("-");
    if (!parts.length) return raw;
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]}-${parts[1]}`;
    return `${parts[0]}-${parts[1]}`;
  }

  function isSameChapterFamily(codeA, codeB) {
    const fa = getCodeFamily(codeA);
    const fb = getCodeFamily(codeB);
    if (!fa || !fb) return true;
    return fa === fb;
  }

  function normalizeItems(items) {
    const normalized = items.map((rawItem, index) => {
      const canonical = curriculumOverrides[rawItem.id] || {};
      const merged = { ...canonical, ...rawItem };
      if (
        merged.id === "divisibility-rules" &&
        String(merged.parentId || "").trim() === "integer-add-subtract-four-terms-drill"
      ) {
        // Legacy bad linkage caused j1-2 chapter content to disappear from its own chapter view.
        merged.parentId = "";
      }
      const parsed = extractGradeAndTerm(String(merged.grade || "國一"));
      const requestedChapterCode = String(
        merged.chapterCode || merged.chapter_code || chapterCodeAssignmentOverrides[merged.id] || ""
      ).trim();
      const chapterMeta = requestedChapterCode ? mergedChapterMetaByCode[requestedChapterCode] || null : null;
      const chapterCatalogEntry = requestedChapterCode ? getCodeCatalogEntry(requestedChapterCode) : null;
      const stage = String(chapterMeta?.stage || merged.stage || "國中");
      const grade = chapterMeta?.grade || parsed.grade || String(merged.grade || "國一");
      const chapter = String(chapterMeta?.chapter || normalizeChapterName(merged.chapter) || "未分類章節");
      const explicitTerm = normalizeTermText(merged.term);
      const term = chapterMeta?.term || explicitTerm || parsed.term || inferTerm(stage, grade, chapter);
      const hasExplicitParentId = Object.prototype.hasOwnProperty.call(merged, "parentId");
      // User-managed edits must win over built-in default wiring.
      // Only fall back to override maps when the item does not carry an explicit parentId.
      const resolvedParentId = hasExplicitParentId
        ? merged.parentId
        : (
          Object.prototype.hasOwnProperty.call(structureParentOverrides, merged.id)
            ? structureParentOverrides[merged.id]
            : (topicParentOverrides[merged.id] || "")
        );
      const parentId = String(resolvedParentId || "").trim();
      const relatedChapters = Array.isArray(merged.relatedChapters) ? merged.relatedChapters.map((item) => String(item).trim()).filter(Boolean) : [];
      const relatedTopicIds = Array.isArray(merged.relatedTopicIds) ? merged.relatedTopicIds.map((item) => String(item).trim()).filter(Boolean) : [];
      const mathNotationLocked = Boolean(merged.mathNotationLocked);
      const modifiedAt = merged.modifiedAt
        ? String(merged.modifiedAt)
        : "2026-04-08T18:00:00+08:00";
      const stageOrder = stageOrderMap[stage] || 99;
      const gradeOrder = gradeOrderMap[grade] || 99;
      const termOrder = termOrderMap[term] || 99;
      const chapterOrder = getChapterOrder(stage, grade, term, chapter);
      const chapterCode = requestedChapterCode || getChapterCode(stage, grade, term, chapter);
      const resolvedCatalogEntry = getCodeCatalogEntry(chapterCode);
      const resolvedChapter = String(
        (isUsableCatalogText(resolvedCatalogEntry?.section) ? resolvedCatalogEntry.section : "") ||
        chapter
      );
      const resolvedDomain = String(
        (isUsableCatalogText(resolvedCatalogEntry?.domainMain) ? resolvedCatalogEntry.domainMain : "") ||
        merged.domain ||
        "未分類領域"
      );

      return {
        ...merged,
        id: String(merged.id || `custom-item-${index + 1}`),
        title: String(merged.title || "").trim() || "未命名重點",
        formula: normalizeMathContent(merged.formula || "尚未填寫公式", mathNotationLocked),
        stage,
        grade,
        term,
          gradeLabel: buildGradeLabel(grade, term),
        chapter: resolvedChapter,
        chapterCode,
          section: String(
            (isUsableCatalogText(resolvedCatalogEntry?.section) ? resolvedCatalogEntry.section : "") ||
            (isUsableCatalogText(chapterCatalogEntry?.section) ? chapterCatalogEntry.section : "") ||
            merged.section ||
            resolvedChapter ||
            ""
          ),
          domain: resolvedDomain,
          domainSub: String(
            (isUsableCatalogText(resolvedCatalogEntry?.domainSub) ? resolvedCatalogEntry.domainSub : "") ||
            merged.domainSub ||
            ""
          ),
          parentId,
          isBranch: Boolean(parentId),
        relatedChapters,
        relatedTopicIds,
        mathNotationLocked,
        modifiedAt,
        difficulty: normalizeDifficulty(merged.difficulty),
        contentTypes: inferContentTypes(merged),
        contentTypesLocked: Boolean(merged.contentTypesLocked),
        tags: Array.isArray(merged.tags) ? merged.tags : [],
        usage: normalizeMathTextList(merged.usage, mathNotationLocked),
        examples: normalizeMathTextList(merged.examples, mathNotationLocked),
        tips: normalizeMathTextList(merged.tips, mathNotationLocked),
        notes: normalizeMathTextList(merged.notes, mathNotationLocked),
        mistakes: normalizeMathTextList(merged.mistakes, mathNotationLocked),
        manualOrder: Number.isFinite(Number(merged.manualOrder))
          ? Number(merged.manualOrder)
          : (Number.isFinite(Number(merged.originalIndex)) ? Number(merged.originalIndex) : index),
        originalIndex: Number.isFinite(Number(merged.manualOrder))
          ? Number(merged.manualOrder)
          : (
            Number.isFinite(Number(merged.originalIndex))
              ? Number(merged.originalIndex)
              : (
                Number.isFinite(Number(structureOrderOverrides[merged.id]))
                  ? Number(structureOrderOverrides[merged.id])
                  : index
              )
          ),
        stageOrder,
        gradeOrder,
        termOrder,
        chapterOrder
      };
    });

    // Flatten hierarchy to at most 3 levels: topic -> branch -> sub-branch.
    // If an item is deeper than sub-branch, reattach it under the nearest branch layer.
    const initialById = new Map(normalized.map((item) => [item.id, item]));
    function getAncestorChain(item) {
      const visited = new Set();
      const chain = [];
      let cursor = item;
      while (cursor && cursor.parentId && !visited.has(cursor.id)) {
        visited.add(cursor.id);
        const parent = initialById.get(cursor.parentId);
        if (!parent) break;
        chain.push(parent);
        cursor = parent;
      }
      chain.reverse();
      return chain;
    }

    normalized.forEach((item) => {
      if (!item.parentId) return;
      const chain = getAncestorChain(item);
      const depth = chain.length;
      if (depth <= 2) return;
      const nearestBranch = chain[1];
      const topTopic = chain[0];
      if (nearestBranch?.id) {
        item.parentId = nearestBranch.id;
      } else if (topTopic?.id) {
        item.parentId = topTopic.id;
      }
    });

    const byId = new Map(normalized.map((item) => [item.id, item]));
    normalized.forEach((item) => {
      if (!item.parentId) return;
      const parent = byId.get(item.parentId);
      if (!parent) return;
      // Safety: prevent accidental cross-chapter-family parent linkage,
      // which can make chapter content appear to "disappear".
      if (!isSameChapterFamily(item.chapterCode, parent.chapterCode)) {
        item.parentId = "";
        item.isBranch = false;
        return;
      }
      item.stage = parent.stage;
      item.grade = parent.grade;
      item.term = parent.term;
      item.gradeLabel = parent.gradeLabel || buildGradeLabel(parent.grade, parent.term);
      item.chapter = parent.chapter;
      item.chapterCode = String(item.chapterCode || getChapterCode(item.stage, item.grade, item.term, item.chapter) || "");
      item.stageOrder = stageOrderMap[item.stage] || 99;
      item.gradeOrder = gradeOrderMap[item.grade] || 99;
      item.termOrder = termOrderMap[item.term] || 99;
      item.chapterOrder = getChapterOrder(item.stage, item.grade, item.term, item.chapter);
    });

    return normalized;
  }

  function dedupeItemsById(items) {
    const map = new Map();
    (Array.isArray(items) ? items : []).forEach((item) => {
      const id = String(item?.id || "").trim();
      if (!id) return;
      // keep last record so latest user action wins
      map.set(id, item);
    });
    return Array.from(map.values());
  }

  function loadManagedItems() {
    try {
      const parsed = loadManagedPayload();
      if (!parsed) return null;
      if (parsed.dataRevision !== DATA_REVISION) return null;
      if (isManagedPayloadStaleAgainstDb(parsed)) return null;
      const managedItemsRaw = Array.isArray(parsed.items) ? parsed.items : [];
      const managedItems = dedupeItemsById(managedItemsRaw);
      const managedMap = new Map(managedItems.map((item) => [String(item.id), item]));
      const deletedIds = new Set(
        Array.isArray(parsed.deletedIds)
          ? parsed.deletedIds.map((id) => String(id || "").trim()).filter(Boolean)
          : []
      );
      const baseItems = getBaseFormulas();
      const contentKeys = [
        "title",
        "formula",
        "usage",
        "examples",
        "tips",
        "notes",
        "mistakes",
        "tags",
        "contentTypes",
        "contentTypesLocked",
        "calculator",
        "diagram",
        "conceptRole",
        "extendsFrom",
        "reappearsIn"
      ];
      const structuralKeys = [
        "stage",
        "grade",
        "term",
        "chapter",
        "domain",
        "chapterRole",
        "parentId",
        "relatedChapters",
        "relatedTopicIds",
        "difficulty",
        "contentTypes",
        "contentTypesLocked"
      ];

      const mergedItems = [
          ...managedItems.map((item) => {
            const baseMatch = baseItems.find((baseItem) => String(baseItem.id) === String(item.id));
            if (!baseMatch) return item;

            const managedModified = item?.modifiedAt ? Date.parse(item.modifiedAt) || 0 : 0;
            const baseModified = baseMatch?.modifiedAt ? Date.parse(baseMatch.modifiedAt) || 0 : 0;
            const shouldPreferBaseContent = baseModified > managedModified;
            const shouldPreferBaseMath =
              (isStructuredFormula(baseMatch.formula) && !isStructuredFormula(item.formula)) ||
              (isStructuredFormula(baseMatch.formula) && String(item.formula || "") === "[object Object]") ||
              (looksLikeLatex(baseMatch.formula) && !looksLikeLatex(item.formula)) ||
              (containsMathSubOrSup(baseMatch.formula) && !containsMathSubOrSup(item.formula));

            if (!shouldPreferBaseContent && !shouldPreferBaseMath) {
              return { ...baseMatch, ...item };
            }

            const merged = { ...baseMatch, ...item };
            contentKeys.forEach((key) => {
            if (key in baseMatch) merged[key] = deepClone(baseMatch[key]);
          });
          merged.modifiedAt = baseMatch.modifiedAt || item.modifiedAt || "";
          return merged;
        }),
        ...baseItems.filter((baseItem) => {
          const id = String(baseItem.id);
          return !managedMap.has(id) && !deletedIds.has(id);
        })
      ];
      const normalized = normalizeItems(dedupeItemsById(mergedItems));

      // Self-heal malformed managed payload (duplicate ids) once detected.
      if (managedItems.length !== managedItemsRaw.length) {
        const fixedPayload = {
          version: Number(parsed.version) > 0 ? Number(parsed.version) : 1,
          dataRevision: DATA_REVISION,
          savedAt: String(parsed.savedAt || new Date().toISOString()),
          deletedIds: Array.from(deletedIds),
          items: dedupeItemsById(normalized)
        };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fixedPayload));
        } catch (_) {}
      }

      return normalized;
    } catch (error) {
      return null;
    }
  }

  function loadManagedPayload() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.items) || !parsed.items.length) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function isManagedPayloadStaleAgainstDb(payload) {
    if (!payload || typeof payload !== "object") return false;
    const managedSavedAt = Date.parse(String(payload.savedAt || ""));
    const dbUpdatedAt = Date.parse(String(window.__formulaDbMeta?.updatedAt || ""));
    if (!Number.isFinite(managedSavedAt) || !Number.isFinite(dbUpdatedAt)) return false;
    return dbUpdatedAt > managedSavedAt;
  }

  function getManagedStateInfo() {
    const payload = loadManagedPayload();
    if (!payload) {
      return {
        hasManagedData: false,
        version: 0,
        savedAt: "",
        itemCount: 0,
        dataRevision: DATA_REVISION,
        source: "base"
      };
    }
    if (payload.dataRevision !== DATA_REVISION) {
      return {
        hasManagedData: false,
        version: 0,
        savedAt: "",
        itemCount: 0,
        dataRevision: DATA_REVISION,
        source: "base"
      };
    }
    if (isManagedPayloadStaleAgainstDb(payload)) {
      return {
        hasManagedData: false,
        version: 0,
        savedAt: "",
        itemCount: 0,
        dataRevision: DATA_REVISION,
        source: "base"
      };
    }
    return {
      hasManagedData: true,
      version: Number(payload.version) > 0 ? Number(payload.version) : 1,
      savedAt: String(payload.savedAt || ""),
      itemCount: Array.isArray(payload.items) ? payload.items.length : 0,
      deletedCount: Array.isArray(payload.deletedIds) ? payload.deletedIds.length : 0,
      dataRevision: DATA_REVISION,
      source: "managed"
    };
  }

  function saveManagedItems(items) {
    const currentInfo = getManagedStateInfo();
    const orderedItems = (Array.isArray(items) ? items : []).map((item, index) => ({
      ...item,
      manualOrder: index,
      originalIndex: index
    }));
    const normalizedItems = dedupeItemsById(normalizeItems(orderedItems)).map((item, index) => ({
      ...item,
      manualOrder: index,
      originalIndex: index
    }));
    const currentIds = new Set(normalizedItems.map((item) => String(item.id)));
    const deletedIds = getBaseFormulas()
      .map((item) => String(item.id))
      .filter((id) => !currentIds.has(id));
    const payload = {
      version: currentInfo.version + 1,
      dataRevision: DATA_REVISION,
      savedAt: new Date().toISOString(),
      deletedIds,
      items: normalizedItems
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.formulas = payload.items;
    refreshQuestionLinkIndexes();
    return payload.items;
  }

  function clearManagedItems() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.formulas = normalizeItems(getBaseFormulas());
    refreshQuestionLinkIndexes();
    return window.formulas;
  }

  function exportManagedItems() {
    const info = getManagedStateInfo();
    const payload = loadManagedPayload();
    return {
      version: info.version,
      savedAt: info.savedAt || new Date().toISOString(),
      deletedIds: Array.isArray(payload?.deletedIds) ? payload.deletedIds.slice() : [],
      items: loadManagedItems() || normalizeItems(getBaseFormulas())
    };
  }

  const managedItems = USE_MANAGED_OVERLAY_BY_DEFAULT ? loadManagedItems() : null;
  window.formulas = managedItems || normalizeItems(getBaseFormulas());

  const dataSourceInfo = {
    source: window.__formulaDbTopicsLoaded ? "db-json" : "legacy-js",
    label: window.__formulaDbTopicsLoaded ? "DB JSON" : "Legacy JS",
    path: window.__formulaDbTopicsLoaded ? DB_TOPICS_JSON_URL : (window.__formulaDbTopicsSource || LEGACY_TOPICS_JS_URL),
    dbCount: Number(window.__formulaDbTopicsCount) || 0,
    questionSource: window.__questionDbSource || (window.__questionDbLoaded ? DB_QUESTIONS_JSON_URL : ""),
    questionCount: Number(window.__questionDbCount) || 0
  };

  function normalizeLookupText(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "").trim();
  }

  function isChapterCodeLike(value) {
    const s = String(value || "").trim();
    if (!s) return false;
    if (/^[js]\d(?:-\d+){1,3}$/i.test(s)) return true;
    if (/^b-\d+$/i.test(s)) return true;
    return false;
  }

  function normalizeChapterCodeText(value) {
    const s = String(value || "").trim();
    if (!s) return "";
    if (/^b-\d+$/i.test(s)) return s.toUpperCase();
    return s.toLowerCase();
  }

  function buildChapterLookupByText() {
    const map = new Map();
    Object.entries(chapterCodeCatalog || {}).forEach(([code, meta]) => {
      const normalizedCode = normalizeChapterCodeText(code);
      if (!normalizedCode) return;
      const chapter = normalizeLookupText(meta?.chapter || "");
      const section = normalizeLookupText(meta?.section || "");
      if (chapter) map.set(chapter, normalizedCode);
      if (section) map.set(section, normalizedCode);
    });
    return map;
  }

  const chapterLookupByText = buildChapterLookupByText();

  function resolveQuestionChapterCode(question) {
    const direct = [
      question?.chapter_code,
      question?.chapterCode,
      question?.chapter
    ].map((item) => String(item || "").trim()).find((code) => isChapterCodeLike(code));
    if (direct) return normalizeChapterCodeText(direct);

    const chapterText = normalizeLookupText(question?.chapter || "");
    if (chapterText && chapterLookupByText.has(chapterText)) {
      return chapterLookupByText.get(chapterText) || "";
    }

    const stage = String(question?.stage || "").trim();
    const chapter = String(question?.chapter || "").trim();
    let grade = String(question?.grade || "").trim();
    let term = "";
    if (grade.endsWith("上")) {
      grade = grade.slice(0, -1);
      term = "上學期";
    } else if (grade.endsWith("下")) {
      grade = grade.slice(0, -1);
      term = "下學期";
    }
    if (stage && grade && chapter) {
      const inferred = getChapterCode(stage, grade, term, chapter);
      if (inferred) return normalizeChapterCodeText(inferred);
    }
    return "";
  }

  function normalizeQuestionDifficulty(rawDifficulty) {
    const text = String(rawDifficulty || "").trim();
    if (["易", "中", "難", "超難"].includes(text)) return text;
    if (text === "基礎") return "易";
    if (text === "進階") return "中";
    if (text === "課外" || text === "挑戰") return "難";
    return "易";
  }

  function normalizeQuestionCategory(rawCategory) {
    const text = String(rawCategory || "").trim();
    if (["基本", "重要", "綜合", "段考", "歷屆", "模考", "備用"].includes(text)) return text;
    return "";
  }

  function normalizeQuestionRecords(records) {
    return (Array.isArray(records) ? records : [])
      .map((row, index) => {
        const id = String(row?.id || "").trim();
        if (!id) return null;
        const chapterCode = resolveQuestionChapterCode(row);
        return {
          id,
          title: String(row?.title || "").trim() || `題目 ${index + 1}`,
          question_text: String(row?.question_text || "").trim(),
          answer_text: String(row?.answer_text || "").trim(),
          explanation_text: String(row?.explanation_text || "").trim(),
          stage: String(row?.stage || "").trim(),
          grade: String(row?.grade || "").trim(),
          chapter: String(row?.chapter || "").trim(),
          chapter_code: chapterCode,
          formula_id: String(row?.formula_id || row?.formulaId || "").trim(),
          question_category: normalizeQuestionCategory(row?.question_category || row?.questionCategory || ""),
          target_level: String(row?.target_level || row?.targetLevel || "").trim().toLowerCase(),
          target_id: String(row?.target_id || row?.targetId || "").trim(),
          target_title: String(row?.target_title || row?.targetTitle || "").trim(),
          difficulty: normalizeQuestionDifficulty(row?.difficulty || ""),
          source_type: String(row?.source_type || "").trim(),
          source_ref: String(row?.source_ref || "").trim(),
          tags: Array.isArray(row?.tags) ? row.tags.map((tag) => String(tag || "").trim()).filter(Boolean) : []
        };
      })
      .filter(Boolean);
  }

  function parseTopicIdsFromTags(tags) {
    const result = [];
    const seen = new Set();
    (Array.isArray(tags) ? tags : []).forEach((tag) => {
      const text = String(tag || "").trim();
      if (!text) return;
      const lower = text.toLowerCase();
      let value = "";
      if (lower.startsWith("branch-topic:")) value = text.slice(text.indexOf(":") + 1).trim();
      if (lower.startsWith("topic:")) value = text.slice(text.indexOf(":") + 1).trim();
      if (!value && lower.startsWith("topic=")) value = text.slice(text.indexOf("=") + 1).trim();
      if (!value || seen.has(value)) return;
      seen.add(value);
      result.push(value);
    });
    return result;
  }

  const CHAPTER_LEVEL_QUESTION_CATEGORIES = new Set(["綜合", "段考", "歷屆", "模考"]);
  const DEFAULT_HIDDEN_QUESTION_CATEGORIES = new Set(["備用"]);

  function resolveQuestionTopicId(question, topicIdSet) {
    const directCandidates = [
      question?.formula_id,
      question?.formulaId,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    const targetLevel = String(question?.target_level || question?.targetLevel || "").trim().toLowerCase();
    const targetId = String(question?.target_id || question?.targetId || "").trim();
    if ((targetLevel === "topic" || targetLevel === "branch") && targetId) {
      directCandidates.push(targetId);
    }

    const directMatch = directCandidates.find((value) => topicIdSet.has(value));
    if (directMatch) return directMatch;

    const topicIds = parseTopicIdsFromTags(question?.tags).filter((topicId) => topicIdSet.has(topicId));
    return topicIds[0] || "";
  }

  function buildQuestionLinkIndexes(formulaItems, questionItems) {
    const byId = new Map((questionItems || []).map((item) => [item.id, item]));
    const topicIndex = new Map();
    const chapterIndex = new Map();
    const topicIdSet = new Set((formulaItems || []).map((item) => String(item?.id || "").trim()).filter(Boolean));

    function pushToMap(map, key, value) {
      if (!key || !value) return;
      const list = map.get(key) || [];
      if (!list.includes(value)) {
        list.push(value);
        map.set(key, list);
      }
    }

    (questionItems || []).forEach((question) => {
      const qid = String(question?.id || "").trim();
      if (!qid) return;
      const code = normalizeChapterCodeText(question?.chapter_code || "");
      const category = normalizeQuestionCategory(question?.question_category || question?.questionCategory || "");

      if (CHAPTER_LEVEL_QUESTION_CATEGORIES.has(category)) {
        if (code) pushToMap(chapterIndex, code, qid);
        return;
      }

      const topicId = resolveQuestionTopicId(question, topicIdSet);
      if (topicId) {
        pushToMap(topicIndex, topicId, qid);
        return;
      }

      if (code) {
        pushToMap(chapterIndex, code, qid);
      }
    });

    return { byId, topicIndex, chapterIndex };
  }

  const normalizedQuestionRecords = normalizeQuestionRecords(window.questionContentRecords || []);
  let questionLinkIndexes = buildQuestionLinkIndexes(window.formulas || [], normalizedQuestionRecords);

  function refreshQuestionLinkIndexes() {
    questionLinkIndexes = buildQuestionLinkIndexes(window.formulas || [], normalizedQuestionRecords);
    return questionLinkIndexes;
  }

  function collectDescendantTopicIds(rootTopicId) {
    const rootId = String(rootTopicId || "").trim();
    if (!rootId) return [];
    const items = Array.isArray(window.formulas) ? window.formulas : [];
    if (!items.length) return [];

    const childrenByParent = new Map();
    items.forEach((item) => {
      const parentId = String(item?.parentId || "").trim();
      const itemId = String(item?.id || "").trim();
      if (!parentId || !itemId) return;
      const list = childrenByParent.get(parentId) || [];
      list.push(itemId);
      childrenByParent.set(parentId, list);
    });

    const result = [];
    const queue = [...(childrenByParent.get(rootId) || [])];
    const seen = new Set();
    while (queue.length) {
      const id = queue.shift();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      result.push(id);
      const children = childrenByParent.get(id) || [];
      children.forEach((childId) => {
        if (!seen.has(childId)) queue.push(childId);
      });
    }
    return result;
  }

  function getLinkedQuestionsForTopic(topicId, chapterCode, options = {}) {
    if (!questionLinkIndexes) refreshQuestionLinkIndexes();
    const indexes = questionLinkIndexes || { byId: new Map(), topicIndex: new Map(), chapterIndex: new Map() };
    const limit = Number(options?.limit) > 0 ? Number(options.limit) : 8;
    const offset = Number(options?.offset) >= 0 ? Number(options.offset) : 0;
    const includeDescendants = options?.includeDescendants === true;
    const fallbackToChapter = options?.fallbackToChapter === true;
    const requestedCategories = Array.isArray(options?.questionCategories)
      ? options.questionCategories
      : (options?.questionCategory ? [options.questionCategory] : []);
    const normalizedRequestedCategories = requestedCategories
      .map((value) => normalizeQuestionCategory(value))
      .filter(Boolean);
    const includeBackup = options?.includeBackup === true || normalizedRequestedCategories.includes("備用");
    const id = String(topicId || "").trim();
    const code = normalizeChapterCodeText(chapterCode || "");

    const topicQuestionIds = id ? (indexes.topicIndex.get(id) || []) : [];
    const descendantQuestionIds = [];
    if (includeDescendants && id) {
      const descendantTopicIds = collectDescendantTopicIds(id);
      descendantTopicIds.forEach((topicItemId) => {
        const rows = indexes.topicIndex.get(topicItemId) || [];
        rows.forEach((qid) => descendantQuestionIds.push(qid));
      });
    }

    let mode = id ? "topic" : "chapter";
    let chosenIds = [];
    if (topicQuestionIds.length) {
      mode = includeDescendants && descendantQuestionIds.length ? "topic+descendants" : "topic";
      chosenIds = includeDescendants ? topicQuestionIds.concat(descendantQuestionIds) : topicQuestionIds;
    } else if (includeDescendants && descendantQuestionIds.length) {
      mode = "topic-descendants";
      chosenIds = descendantQuestionIds;
    } else if (!id || fallbackToChapter) {
      mode = "chapter";
      chosenIds = code ? (indexes.chapterIndex.get(code) || []) : [];
    }
    const uniqueIds = [];
    const seen = new Set();
    chosenIds.forEach((qid) => {
      if (!qid || seen.has(qid)) return;
      seen.add(qid);
      uniqueIds.push(qid);
    });

    const visibleIds = uniqueIds.filter((qid) => {
        const row = indexes.byId.get(qid);
        if (!row) return false;
        const category = normalizeQuestionCategory(row.question_category);
        if (!includeBackup && DEFAULT_HIDDEN_QUESTION_CATEGORIES.has(category)) return false;
        return true;
      });

    const filteredIds = normalizedRequestedCategories.length
      ? visibleIds.filter((qid) => {
          const row = indexes.byId.get(qid);
          return row && normalizedRequestedCategories.includes(normalizeQuestionCategory(row.question_category));
        })
      : visibleIds;

    const pagedIds = filteredIds.slice(offset, offset + limit);
    const questions = pagedIds
      .map((qid) => indexes.byId.get(qid))
      .filter(Boolean)
      .map((row) => ({ ...row }));

    return {
      mode,
      total: filteredIds.length,
      questions,
      offset,
      limit,
      source: "question-db-direct"
    };
  }

  try {
    console.info(`[formula-data] data source = ${dataSourceInfo.label} (${dataSourceInfo.path})`);
  } catch (_) {}

  window.formulaDataStore = {
    STORAGE_KEY,
    getBaseFormulas,
    getManagedFormulas: () => loadManagedItems(),
    getManagedStateInfo,
    getCurrentFormulas: () => deepClone(window.formulas || []),
    saveManagedItems,
    clearManagedItems,
    exportManagedItems,
      normalizeItems,
      buildGradeLabel,
      compareCurriculumItems,
      getGradeOptions: () => gradeOptions.slice(),
      getChapterOptions,
      getChapterCode,
      formatChapterLabel,
      getLinkedQuestionsForTopic,
      refreshQuestionLinkIndexes,
      getQuestionRecords: () => deepClone(normalizedQuestionRecords),
      getTopicParentOverrides: () => ({ ...topicParentOverrides }),
      getFormulaDbMeta: () => ({ ...(window.__formulaDbMeta || {}) }),
      getDataSourceInfo: () => ({ ...dataSourceInfo })
    };
  })();

