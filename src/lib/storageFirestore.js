// Firestore-backed storage, same function shape as lib/storage.js.
// Bound to one signed-in user's uid via createFirestoreStorage(uid).

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_SETTINGS = {
  monthlyGoal: 8,
  mood: "fired-up",
  channelName: "Coding with Ree",
};

export function createFirestoreStorage(uid) {
  const videosCol = collection(db, "users", uid, "videos");
  const collabsCol = collection(db, "users", uid, "collabs");
  const settingsRef = doc(db, "users", uid, "meta", "settings");

  function listVideos() {
    return getDocs(videosCol).then((snap) => snap.docs.map((d) => d.data()));
  }

  function saveVideo(video) {
    return setDoc(doc(videosCol, video.id), video).then(() => video);
  }

  async function deleteVideo(id) {
    await deleteDoc(doc(videosCol, id));
    const collabsSnap = await getDocs(collabsCol);
    const batch = writeBatch(db);
    let changed = false;
    collabsSnap.docs.forEach((d) => {
      const collab = d.data();
      const deliverables = collab.deliverables.map((del) =>
        del.videoId === id ? { ...del, videoId: null } : del
      );
      if (deliverables.some((del, i) => del.videoId !== collab.deliverables[i].videoId)) {
        changed = true;
        batch.set(doc(collabsCol, d.id), { ...collab, deliverables });
      }
    });
    if (changed) await batch.commit();
  }

  function listCollabs() {
    return getDocs(collabsCol).then((snap) => snap.docs.map((d) => d.data()));
  }

  function saveCollab(collab) {
    return setDoc(doc(collabsCol, collab.id), collab).then(() => collab);
  }

  async function deleteCollab(id) {
    await deleteDoc(doc(collabsCol, id));
    const videosSnap = await getDocs(videosCol);
    const batch = writeBatch(db);
    let changed = false;
    videosSnap.docs.forEach((d) => {
      const video = d.data();
      if (video.collabId === id) {
        changed = true;
        batch.set(doc(videosCol, d.id), { ...video, collabId: null });
      }
    });
    if (changed) await batch.commit();
  }

  async function getSettings() {
    const snap = await getDoc(settingsRef);
    return { ...DEFAULT_SETTINGS, ...(snap.exists() ? snap.data() : {}) };
  }

  async function saveSettings(patch) {
    const current = await getSettings();
    const next = { ...current, ...patch };
    await setDoc(settingsRef, next);
    return next;
  }

  async function exportAll() {
    const [videos, collabs, settings] = await Promise.all([
      listVideos(),
      listCollabs(),
      getSettings(),
    ]);
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      videos,
      collabs,
      settings,
    };
  }

  async function importAll(json) {
    const videos = json.videos || [];
    const collabs = json.collabs || [];
    // Firestore batches cap at 500 writes; chunk defensively for large imports.
    const chunks = [];
    const all = [
      ...videos.map((v) => ({ ref: doc(videosCol, v.id), data: v })),
      ...collabs.map((c) => ({ ref: doc(collabsCol, c.id), data: c })),
    ];
    for (let i = 0; i < all.length; i += 450) chunks.push(all.slice(i, i + 450));
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach(({ ref, data }) => batch.set(ref, data));
      await batch.commit();
    }
    if (json.settings) await setDoc(settingsRef, json.settings);
  }

  async function clearAll() {
    const [videosSnap, collabsSnap] = await Promise.all([
      getDocs(videosCol),
      getDocs(collabsCol),
    ]);
    const batch = writeBatch(db);
    videosSnap.docs.forEach((d) => batch.delete(d.ref));
    collabsSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(settingsRef);
    await batch.commit();
  }

  async function hasAnyData() {
    const [videosSnap, collabsSnap] = await Promise.all([
      getDocs(videosCol),
      getDocs(collabsCol),
    ]);
    return videosSnap.size > 0 || collabsSnap.size > 0;
  }

  return {
    listVideos,
    saveVideo,
    deleteVideo,
    listCollabs,
    saveCollab,
    deleteCollab,
    getSettings,
    saveSettings,
    exportAll,
    importAll,
    clearAll,
    hasAnyData,
  };
}
