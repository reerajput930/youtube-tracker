import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as localBackend from "../lib/storage";
import { createFirestoreStorage } from "../lib/storageFirestore";
import { syncYoutubeUploads, YoutubeAuthError } from "../lib/youtubeSync";
import { loadSampleDataset } from "../lib/sampleData";
import { auth } from "../lib/firebase";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

const DEFAULT_SETTINGS = {
  monthlyGoal: 8,
  mood: "fired-up",
  channelName: "Coding with Ree",
};

export function AppDataProvider({ children }) {
  const { user, authLoading, signInWithGoogle, signOut: authSignOut } = useAuth();

  const [videos, setVideos] = useState([]);
  const [collabs, setCollabs] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  // While signed in, every read/write goes to this user's Firestore data
  // instead of localStorage - same function names either way.
  const backend = useMemo(
    () => (user ? createFirestoreStorage(user.uid) : localBackend),
    [user]
  );

  const refreshAll = useCallback(async () => {
    const [v, c, s] = await Promise.all([
      backend.listVideos(),
      backend.listCollabs(),
      backend.getSettings(),
    ]);
    setVideos(v);
    setCollabs(c);
    setSettings(s);
  }, [backend]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    refreshAll().finally(() => setLoading(false));
  }, [refreshAll, authLoading]);

  useEffect(() => {
    document.documentElement.setAttribute("data-mood", settings.mood);
  }, [settings.mood]);

  const saveVideo = useCallback(
    async (video) => {
      await backend.saveVideo(video);
      await refreshAll();
    },
    [backend, refreshAll]
  );

  const removeVideo = useCallback(
    async (id) => {
      await backend.deleteVideo(id);
      await refreshAll();
    },
    [backend, refreshAll]
  );

  const saveCollab = useCallback(
    async (collab) => {
      await backend.saveCollab(collab);
      await refreshAll();
    },
    [backend, refreshAll]
  );

  const removeCollab = useCallback(
    async (id) => {
      await backend.deleteCollab(id);
      await refreshAll();
    },
    [backend, refreshAll]
  );

  const updateSettings = useCallback(
    async (patch) => {
      await backend.saveSettings(patch);
      await refreshAll();
    },
    [backend, refreshAll]
  );

  const loadSample = useCallback(async () => {
    const data = loadSampleDataset();
    await backend.importAll(data);
    await refreshAll();
  }, [backend, refreshAll]);

  const deleteAllData = useCallback(async () => {
    await backend.clearAll();
    await refreshAll();
  }, [backend, refreshAll]);

  const exportBackup = useCallback(() => backend.exportAll(), [backend]);

  const restoreBackup = useCallback(
    async (json) => {
      await backend.importAll(json);
      await refreshAll();
    },
    [backend, refreshAll]
  );

  // Pulls new uploads (or, on the very first run, the whole channel history)
  // into whichever backend is currently active.
  const runYoutubeSync = useCallback(
    async (accessToken, targetBackend = backend) => {
      if (!accessToken) return 0;
      setSyncing(true);
      setSyncError(null);
      try {
        const currentVideos = await targetBackend.listVideos();
        const existingIds = currentVideos.filter((v) => v.youtubeId).map((v) => v.youtubeId);
        const newVideos = await syncYoutubeUploads(accessToken, existingIds);
        for (const video of newVideos) {
          await targetBackend.saveVideo(video);
        }
        setLastSyncAt(new Date());
        return newVideos.length;
      } catch (err) {
        setSyncError(
          err instanceof YoutubeAuthError
            ? err.message
            : err.message || "YouTube sync failed."
        );
        throw err;
      } finally {
        setSyncing(false);
        await refreshAll();
      }
    },
    [backend, refreshAll]
  );

  // The full "Sign in with Google" flow: sign in, offer to upload this
  // device's local data to the new account, then pull YouTube history.
  const connectGoogleAccount = useCallback(async () => {
    const hadLocalData = await localBackend.hasAnyData();
    const accessToken = await signInWithGoogle();
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const cloudBackend = createFirestoreStorage(uid);

    if (hadLocalData) {
      const shouldUpload = window.confirm(
        "Upload the videos on this device to your account?"
      );
      if (shouldUpload) {
        const localData = await localBackend.exportAll();
        await cloudBackend.importAll(localData);
      }
    }

    if (accessToken) {
      try {
        await runYoutubeSync(accessToken, cloudBackend);
      } catch {
        // surfaced via syncError; sign-in itself still succeeded
      }
    }

    await refreshAll();
  }, [signInWithGoogle, runYoutubeSync, refreshAll]);

  const syncNow = useCallback(async () => {
    const accessToken = await signInWithGoogle();
    if (!accessToken) return;
    await runYoutubeSync(accessToken);
  }, [signInWithGoogle, runYoutubeSync]);

  const disconnectGoogleAccount = useCallback(async () => {
    await authSignOut();
  }, [authSignOut]);

  const value = useMemo(
    () => ({
      videos,
      collabs,
      settings,
      loading,
      saveVideo,
      removeVideo,
      saveCollab,
      removeCollab,
      updateSettings,
      loadSample,
      deleteAllData,
      exportBackup,
      restoreBackup,
      refreshAll,
      // v2: account + sync
      user,
      authLoading,
      isSignedIn: !!user,
      connectGoogleAccount,
      disconnectGoogleAccount,
      syncNow,
      syncing,
      syncError,
      lastSyncAt,
    }),
    [
      videos,
      collabs,
      settings,
      loading,
      saveVideo,
      removeVideo,
      saveCollab,
      removeCollab,
      updateSettings,
      loadSample,
      deleteAllData,
      exportBackup,
      restoreBackup,
      refreshAll,
      user,
      authLoading,
      connectGoogleAccount,
      disconnectGoogleAccount,
      syncNow,
      syncing,
      syncError,
      lastSyncAt,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
