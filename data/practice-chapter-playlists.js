// Chapter-focused playlists were migrated to program-db/database/practice-custom-theme-db.json.
// This compatibility file intentionally leaves window.practicePlaylistData unchanged.
(() => {
  window.practicePlaylistData = Array.isArray(window.practicePlaylistData) ? window.practicePlaylistData : [];
})();
