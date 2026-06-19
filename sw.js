const CACHE_NAME = "math-formula-tool-v219";
const ASSETS = [
  "./",
  "./index.html",
  "./structure-view.html",
  "./formula.html",
  "./manage.html",
  "./practice-bank.html",
  "./practice-mobile.html",
  "./styles.css",
  "./formulas.js",
  "./data/chapter-code-config.js",
  "./data/formula-content.js",
  "./data/question-content.js",
  "./data/main-topic-overviews.js",
  "./data/formula-calculators.js",
  "./data/formula-practice.js",
  "./data/practice-generator-bootstrap.js",
  "./data/formula-practice-assignments.js",
  "./data/practice-generator-bundles.js",
  "./data/practice-generator-loader.js",
  "./data/practice-generators/shared-legacy-bundle.js",
  "./data/practice-generators/e4.js",
  "./data/practice-generators/e5.js",
  "./data/practice-generators/e6.js",
  "./data/practice-generators/j1.js",
  "./data/practice-generators/j2.js",
  "./data/practice-generators/j3.js",
  "./data/practice-generators/j4.js",
  "./data/practice-generators/j5.js",
  "./data/practice-generators/j6.js",
  "./data/practice-generators/s1.js",
  "./data/practice-generators/s2.js",
  "./data/practice-generators/s3.js",
  "./data/practice-generators/s4.js",
  "./data/practice-generators/s5.js",
  "./formula-data.js",
  "./formula-core.js",
  "./app.js",
  "./formula-detail.js",
  "./manage.js",
  "./practice-bank.js",
  "./practice-mobile.js",
  "./chapter-overviews.js",
  "./drawing-layer.js",
  "./pwa.js",
  "./manifest.webmanifest"
];

function isLiveDataRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\\/g, "/");
  return (
    path.includes("/program-db/database/") ||
    path.endsWith("/data/formula-content.js") ||
    path.endsWith("/data/question-content.js") ||
    path.endsWith("/data/managed-structure.auto.json")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => Promise.resolve())
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (isLiveDataRequest(event.request)) {
    event.respondWith(fetch(new Request(event.request, { cache: "no-store" })));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
