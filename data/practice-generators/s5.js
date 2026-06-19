(() => {
  const helper = window.practiceLegacyBundleHelper;
  if (!helper?.registerStagedBundle) {
    console.warn("practiceLegacyBundleHelper is required before loading s5 practice generators");
    return;
  }
  helper.registerStagedBundle("s5", ["s5-"]);
})();
