(() => {
  function normalizeText(value) {
    return String(value || "").trim();
  }

  function getStore() {
    return window.formulaPracticeStore || null;
  }

  function getPracticeLibraryRecords() {
    return Object.values(window.practiceLibraryStore?.byId || {});
  }

  function collectConfigKeysByPrefixes(store, prefixes) {
    if (!store?.configs) return [];
    const normalizedPrefixes = Array.isArray(prefixes)
      ? prefixes.map((prefix) => normalizeText(prefix)).filter(Boolean)
      : [];
    if (!normalizedPrefixes.length) return [];
    return Object.keys(store.configs).filter((key) =>
      normalizedPrefixes.some((prefix) => normalizeText(key).startsWith(prefix))
    );
  }

  function matchesAnyPrefix(chapterCode, prefixes) {
    const code = normalizeText(chapterCode);
    return Array.isArray(prefixes) && prefixes.some((prefix) => code.startsWith(normalizeText(prefix)));
  }

  function getGeneratorKeyFromRecord(record) {
    return (
      normalizeText(record?.generatorKey) ||
      normalizeText(record?.practiceKey) ||
      normalizeText(record?.id)
    );
  }

  function getConfigPool() {
    if (!window.practiceLegacyBundleConfigPool || typeof window.practiceLegacyBundleConfigPool !== "object") {
      window.practiceLegacyBundleConfigPool = {};
    }
    return window.practiceLegacyBundleConfigPool;
  }

  function collectLegacyConfigsByPrefixes(prefixes, fallbackBundleKey = "") {
    const store = getStore();
    if (!store?.configs) {
      console.warn("formulaPracticeStore.registerConfigs is required before loading legacy practice generator bundles");
      return {};
    }

    const nextConfigs = {};
    const pool = getConfigPool();
    const normalizedBundleKey = normalizeText(fallbackBundleKey);

    getPracticeLibraryRecords().forEach((record) => {
      if (!matchesAnyPrefix(record?.chapterCode, prefixes)) return;
      const generatorKey = getGeneratorKeyFromRecord(record);
      if (!generatorKey) return;
      const recordBundleKey = normalizeText(record?.generatorBundle || record?.bundleKey) || normalizedBundleKey;
      const legacyConfig = store.configs[generatorKey] || pool?.[recordBundleKey]?.[generatorKey] || null;
      if (!legacyConfig) return;
      nextConfigs[generatorKey] = legacyConfig;
      if (recordBundleKey) {
        pool[recordBundleKey] = pool[recordBundleKey] || {};
        pool[recordBundleKey][generatorKey] = legacyConfig;
      }
    });

    collectConfigKeysByPrefixes(store, prefixes).forEach((generatorKey) => {
      if (nextConfigs[generatorKey]) return;
      const recordBundleKey = normalizedBundleKey;
      const legacyConfig = store.configs[generatorKey] || pool?.[recordBundleKey]?.[generatorKey] || null;
      if (!legacyConfig) return;
      nextConfigs[generatorKey] = legacyConfig;
      if (recordBundleKey) {
        pool[recordBundleKey] = pool[recordBundleKey] || {};
        pool[recordBundleKey][generatorKey] = legacyConfig;
      }
    });

    return nextConfigs;
  }

  function stageLegacyConfigsByPrefixes(bundleKey, prefixes) {
    const store = getStore();
    if (!store?.configs) return [];
    const normalizedBundleKey = normalizeText(bundleKey);
    const nextConfigs = collectLegacyConfigsByPrefixes(prefixes, normalizedBundleKey);
    Object.keys(nextConfigs).forEach((generatorKey) => {
      delete store.configs[generatorKey];
    });
    return Object.keys(nextConfigs);
  }

  function registerStagedBundle(bundleKey, prefixes) {
    const store = getStore();
    if (!store?.configs || typeof store.registerConfigs !== "function") {
      console.warn("formulaPracticeStore.registerConfigs is required before loading legacy practice generator bundles");
      return [];
    }
    const normalizedBundleKey = normalizeText(bundleKey);
    const pool = getConfigPool();
    const staged = collectLegacyConfigsByPrefixes(prefixes, normalizedBundleKey);
    const pooled = normalizedBundleKey && pool[normalizedBundleKey] ? pool[normalizedBundleKey] : {};
    const nextConfigs = { ...pooled, ...staged };
    store.registerConfigs(nextConfigs);
    return Object.keys(nextConfigs);
  }

  window.practiceLegacyBundleHelper = {
    stageLegacyConfigsByPrefixes,
    registerStagedBundle,
  };
})();
