(() => {
  const loading = new Map();

  function normalizeId(value) {
    return String(value || "").trim();
  }

  function getPracticeRecord(itemOrId) {
    const id = normalizeId(typeof itemOrId === "string" ? itemOrId : itemOrId?.id);
    if (!id) return null;
    return window.practiceLibraryStore?.byId?.[id] || window.formulaPracticeAssignmentStore?.byId?.[id] || null;
  }

  function inferBundleKey(itemOrId) {
    const record = getPracticeRecord(itemOrId);
    const explicit = normalizeId(record?.generatorBundle || record?.bundleKey);
    if (explicit) return explicit;

    const chapterCode = normalizeId(record?.chapterCode || itemOrId?.chapterCode);
    const bundles = window.practiceGeneratorBundles || {};
    return Object.entries(bundles).find(([, bundle]) => {
      const prefixes = Array.isArray(bundle?.chapterPrefixes) ? bundle.chapterPrefixes : [];
      return prefixes.some((prefix) => chapterCode.startsWith(String(prefix || "")));
    })?.[0] || "";
  }

  function loadBundle(bundleKey) {
    const key = normalizeId(bundleKey);
    if (!key) return Promise.resolve(false);
    const bundle = window.practiceGeneratorBundles?.[key] || null;
    const src = normalizeId(bundle?.src || bundle);
    if (!src) return Promise.resolve(false);
    if (loading.has(key)) return loading.get(key);

    const promise = new Promise((resolve, reject) => {
      const existing = Array.from(document.querySelectorAll("script[data-practice-generator-bundle]"))
        .find((node) => node.dataset.practiceGeneratorBundle === key);
      if (existing?.dataset.loaded === "true") {
        resolve(true);
        return;
      }
      const script = existing || document.createElement("script");
      script.src = src;
      script.defer = true;
      script.dataset.practiceGeneratorBundle = key;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve(true);
      }, { once: true });
      script.addEventListener("error", () => {
        loading.delete(key);
        reject(new Error(`Unable to load practice generator bundle: ${key}`));
      }, { once: true });
      if (!existing) document.head.appendChild(script);
    });
    loading.set(key, promise);
    return promise;
  }

  async function ensureForPractice(itemOrId) {
    const id = normalizeId(typeof itemOrId === "string" ? itemOrId : itemOrId?.id);
    if (id && window.formulaPracticeStore?.getConfig?.(id)) return true;
    const bundleKey = inferBundleKey(itemOrId);
    if (!bundleKey) return false;
    await loadBundle(bundleKey);
    return !id || Boolean(window.formulaPracticeStore?.getConfig?.(id));
  }

  async function ensureForPractices(items) {
    const bundleKeys = new Set(
      (Array.isArray(items) ? items : [])
        .map(inferBundleKey)
        .filter(Boolean),
    );
    await Promise.all(Array.from(bundleKeys, loadBundle));
    return true;
  }

  window.practiceGeneratorLoader = {
    ensureForPractice,
    ensureForPractices,
    loadBundle,
  };
})();
