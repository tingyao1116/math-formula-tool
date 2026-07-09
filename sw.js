const CACHE_NAME = "math-formula-tool-v371";
const ASSETS = [
  "./",
  "./index.html",
  "./structure-view.html",
  "./formula.html",
  "./chapter.html",
  "./manage.html",
  "./question-bank.html",
  "./practice-bank.html",
  "./practice-mobile.html",
  "./ability-practice.html",
  "./skill-tree-practice.html",
  "./chapter-highlights.html",
  "./quest-practice.html",
  "./practice-playlist-builder.html",
  "./practice-playlist-player.html",
  "./junior-high-bridge.html",
  "./formula/formula-detail.js",
  "./chapter/chapter-detail.js",
  "./manage/manage.js",
  "./question-bank/question-bank.js",
  "./practice-bank/practice-bank.js",
  "./practice-mobile/practice-mobile.js",
  "./ability-practice/ability-indicator-practice.js",
  "./skill-tree-practice/skill-tree-practice.js",
  "./chapter-highlights/chapter-highlights.js",
  "./quest-practice/quest-practice.js",
  "./practice-playlist/practice-playlist-store.js",
  "./practice-playlist/practice-theme-store.js",
  "./practice-playlist/practice-theme-builder.js",
  "./practice-playlist/practice-playlist-builder.js",
  "./practice-playlist/practice-schedule-builder.js",
  "./practice-playlist/practice-playlist-player.js",
  "./practice-playlist/practice-mode-toggle.js",
  "./practice-playlist/practice-schedule-player.js",
  "./styles.css",
  "./formulas.js",
  "./data/chapter-code-config.js",
  "./data/formula-content.js",
  "./data/question-content.js",
  "./data/main-topic-overviews.js",
  "./data/formula-calculators.js",
  "./data/formula-practice.js",
  "./data/formula-practice-assignments.js",
  "./data/practice-generator-bundles.js",
  "./data/practice-generator-loader.js",
  "./data/practice-learning/practice-learning-architecture.js",
  "./data/practice-learning/practice-learning-architecture-v3.js",
  "./data/practice-learning/practice-learning-architecture-v4.js",
  "./data/practice-learning/practice-learning-architecture-v5.js",
  "./data/practice-learning/practice-learning-architecture-v6.js",
  "./data/practice-learning/practice-learning-architecture-v7.js",
  "./data/practice-learning/practice-ability-map.js",
  "./data/practice-learning/practice-quest-campaign.js",
  "./data/practice-learning/practice-skill-tree.js",
  "./data/practice-task-playlists.js",
  "./data/practice-chapter-playlists.js",
  "./data/practice-schedules.js",
  "./data/practice-theme-chains.js",
  "./data/practice-custom-theme-chains.js",
  "./formula-data.js",
  "./formula-core.js",
  "./app.js",
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
