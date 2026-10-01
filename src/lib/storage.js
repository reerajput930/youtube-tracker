// The ONLY place that reads/writes app data.
// Every function returns a Promise so pages never change when Firestore
// replaces localStorage in v2.

const KEYS = {
  videos: "ut.videos",
  collabs: "ut.collabs",
  settings: "ut.settings",
  version: "ut.version",
};

const DEFAULT_SETTINGS = {
  monthlyGoal: 8,
  mood: "fired-up",
  channelName: "Coding with Ree",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureVersion() {
  if (localStorage.getItem(KEYS.version) == null) {
    write(KEYS.version, 1);
  }
}

export function listVideos() {
  ensureVersion();
  return Promise.resolve(read(KEYS.videos, []));
}

export function saveVideo(video) {
  ensureVersion();
  const videos = read(KEYS.videos, []);
  const idx = videos.findIndex((v) => v.id === video.id);
  if (idx === -1) {
    videos.push(video);
  } else {
    videos[idx] = video;
  }
  write(KEYS.videos, videos);
  return Promise.resolve(video);
}

export function deleteVideo(id) {
  const videos = read(KEYS.videos, []);
  const next = videos.filter((v) => v.id !== id);
  write(KEYS.videos, next);
  // unlink this video from any collab deliverable that pointed to it
  const collabs = read(KEYS.collabs, []);
  let changed = false;
  const nextCollabs = collabs.map((c) => {
    const deliverables = c.deliverables.map((d) => {
      if (d.videoId === id) {
        changed = true;
        return { ...d, videoId: null };
      }
      return d;
    });
    return { ...c, deliverables };
  });
  if (changed) write(KEYS.collabs, nextCollabs);
  return Promise.resolve();
}

export function listCollabs() {
  ensureVersion();
  return Promise.resolve(read(KEYS.collabs, []));
}

export function saveCollab(collab) {
  ensureVersion();
  const collabs = read(KEYS.collabs, []);
  const idx = collabs.findIndex((c) => c.id === collab.id);
  if (idx === -1) {
    collabs.push(collab);
  } else {
    collabs[idx] = collab;
  }
  write(KEYS.collabs, collabs);
  return Promise.resolve(collab);
}

export function deleteCollab(id) {
  const collabs = read(KEYS.collabs, []);
  const next = collabs.filter((c) => c.id !== id);
  write(KEYS.collabs, next);
  // clear collabId from any video that referenced this collab
  const videos = read(KEYS.videos, []);
  const nextVideos = videos.map((v) =>
    v.collabId === id ? { ...v, collabId: null } : v
  );
  write(KEYS.videos, nextVideos);
  return Promise.resolve();
}

export function getSettings() {
  ensureVersion();
  return Promise.resolve({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) });
}

export function saveSettings(settings) {
  ensureVersion();
  const current = read(KEYS.settings, DEFAULT_SETTINGS);
  const next = { ...current, ...settings };
  write(KEYS.settings, next);
  return Promise.resolve(next);
}

export function exportAll() {
  ensureVersion();
  return Promise.resolve({
    version: 1,
    exportedAt: new Date().toISOString(),
    videos: read(KEYS.videos, []),
    collabs: read(KEYS.collabs, []),
    settings: read(KEYS.settings, DEFAULT_SETTINGS),
  });
}

export function importAll(json) {
  if (json.videos) write(KEYS.videos, json.videos);
  if (json.collabs) write(KEYS.collabs, json.collabs);
  if (json.settings) write(KEYS.settings, json.settings);
  ensureVersion();
  return Promise.resolve();
}

export function clearAll() {
  localStorage.removeItem(KEYS.videos);
  localStorage.removeItem(KEYS.collabs);
  localStorage.removeItem(KEYS.settings);
  ensureVersion();
  return Promise.resolve();
}

export function hasAnyData() {
  const videos = read(KEYS.videos, []);
  const collabs = read(KEYS.collabs, []);
  return Promise.resolve(videos.length > 0 || collabs.length > 0);
}
