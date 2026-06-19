(() => {
  const loading = new Map();
  const scriptLoading = new Map();

  function normalizeId(value) {
    return String(value || "").trim();
  }

  function isScriptLoadedBySrc(src) {
    return Array.from(document.querySelectorAll("script"))
      .some((node) => normalizeId(node.src).includes(normalizeId(src)) && node.dataset.loaded === "true");
  }

  function isBundleLoaded(bundleKey) {
    const key = normalizeId(bundleKey);
    if (!key) return false;
    return Array.from(document.querySelectorAll("script[data-practice-generator-bundle]"))
      .some((node) => node.dataset.practiceGeneratorBundle === key && node.dataset.loaded === "true");
  }

  function loadExternalScript(src, datasetKey, datasetValue) {
    const normalizedSrc = normalizeId(src);
    if (!normalizedSrc) return Promise.resolve(false);
    if (scriptLoading.has(normalizedSrc)) return scriptLoading.get(normalizedSrc);

    const promise = new Promise((resolve, reject) => {
      const existing = Array.from(document.querySelectorAll("script"))
        .find((node) => node.getAttribute(`data-${datasetKey}`) === datasetValue);
      if (existing?.dataset.loaded === "true") {
        resolve(true);
        return;
      }

      const script = existing || document.createElement("script");
      script.src = normalizedSrc;
      script.defer = true;
      script.dataset[datasetKey] = datasetValue;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve(true);
      }, { once: true });
      script.addEventListener("error", () => {
        scriptLoading.delete(normalizedSrc);
        reject(new Error(`Unable to load practice generator dependency: ${normalizedSrc}`));
      }, { once: true });
      if (!existing) document.head.appendChild(script);
    });

    scriptLoading.set(normalizedSrc, promise);
    return promise;
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
    const deps = Array.isArray(bundle?.deps) ? bundle.deps.map(normalizeId).filter(Boolean) : [];
    if (!src) return Promise.resolve(false);
    if (loading.has(key)) return loading.get(key);

    const promise = (async () => {
      for (const depSrc of deps) {
        if (!depSrc || isScriptLoadedBySrc(depSrc)) continue;
        await loadExternalScript(depSrc, "practiceGeneratorDependency", depSrc);
      }
      await loadExternalScript(src, "practiceGeneratorBundle", key);
      return true;
    })().catch((error) => {
      loading.delete(key);
      throw error;
    });
    loading.set(key, promise);
    return promise;
  }

  async function ensureForPractice(itemOrId) {
    const id = normalizeId(typeof itemOrId === "string" ? itemOrId : itemOrId?.id);
    const bundleKey = inferBundleKey(itemOrId);
    if (bundleKey && !isBundleLoaded(bundleKey)) {
      await loadBundle(bundleKey);
    }
    if (id && window.formulaPracticeStore?.getConfig?.(id)) return true;
    if (!bundleKey) return false;
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
    isBundleLoaded,
  };
})();
