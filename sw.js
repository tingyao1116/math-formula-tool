const CACHE_NAME = "math-formula-tool-v199";
const ASSETS = [
  "./",
  "./index.html",
  "./structure-view.html",
  "./formula.html",
  "./manage.html",
  "./styles.css",
  "./formulas.js",
  "./data/chapter-code-config.js",
  "./data/formula-content.js",
  "./data/question-content.js",
  "./data/main-topic-overviews.js",
  "./data/formula-calculators.js",
  "./data/formula-practice.js",
  "./formula-data.js",
  "./formula-core.js",
  "./app.js",
  "./formula-detail.js",
  "./manage.js",
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
