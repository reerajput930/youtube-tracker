import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import MoodPicker from "../components/MoodPicker";
import { moodLabel } from "../lib/moods";
import { downloadJsonBackup } from "../lib/export";
import "../styles/settings.css";

function timeAgo(date) {
  if (!date) return null;
  const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  return `${diffHr} hr ago`;
}

export default function Settings() {
  const {
    settings,
    updateSettings,
    loadSample,
    deleteAllData,
    exportBackup,
    restoreBackup,
    user,
    isSignedIn,
    connectGoogleAccount,
    disconnectGoogleAccount,
    syncNow,
    syncing,
    syncError,
    lastSyncAt,
  } = useAppData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [goalInput, setGoalInput] = useState(settings.monthlyGoal);
  const [connecting, setConnecting] = useState(false);

  async function handleGoalBlur() {
    const n = parseInt(goalInput, 10);
    if (!Number.isNaN(n) && n > 0 && n !== settings.monthlyGoal) {
      await updateSettings({ monthlyGoal: n });
    } else {
      setGoalInput(settings.monthlyGoal);
    }
  }

  async function handleBackup() {
    const data = await exportBackup();
    downloadJsonBackup(data, `upload-tracker-backup-${data.exportedAt.slice(0, 10)}.json`);
  }

  function handleRestoreFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(String(reader.result));
        await restoreBackup(json);
      } catch {
        window.alert("That file doesn't look like a valid backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      await connectGoogleAccount();
    } catch (err) {
      window.alert(err.message || "Sign-in failed. Try again.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Settings</div>
          <h1 className="page-title">Settings</h1>
        </div>
      </div>

      <div className="settings-grid">
        <section className="card settings-card">
          <h2 className="card-title">Account</h2>
          {isSignedIn ? (
            <>
              <p style={{ color: "var(--text-2)" }}>
                Signed in as <strong style={{ color: "var(--text)" }}>{user.email}</strong>.
                Your data is synced to your Google account and available on
                any device you sign into.
              </p>
              <div className="settings-row">
                <button type="button" className="btn btn-secondary" onClick={syncNow} disabled={syncing}>
                  {syncing ? "Syncing…" : "Sync YouTube now"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={disconnectGoogleAccount}>
                  Sign out
                </button>
              </div>
              {lastSyncAt && !syncError && (
                <p style={{ color: "var(--text-2)", fontSize: 13 }}>
                  Last synced {timeAgo(lastSyncAt)}.
                </p>
              )}
              {syncError && (
                <p style={{ color: "var(--danger)", fontSize: 13 }}>{syncError}</p>
              )}
            </>
          ) : (
            <>
              <p style={{ color: "var(--text-2)" }}>
                Sign in with Google to save your data to the cloud and
                automatically pull new uploads from your YouTube channel.
              </p>
              <button type="button" className="btn btn-primary" onClick={handleConnect} disabled={connecting}>
                {connecting ? "Signing in…" : "Sign in with Google"}
              </button>
            </>
          )}
        </section>

        <section className="card settings-card">
          <h2 className="card-title">Monthly goal</h2>
          <p style={{ color: "var(--text-2)" }}>
            How many videos you want to post each month.
          </p>
          <div className="field" style={{ maxWidth: 160 }}>
            <label htmlFor="goal-input">Videos per month</label>
            <input
              id="goal-input"
              type="number"
              min="1"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onBlur={handleGoalBlur}
            />
          </div>
        </section>

        <section className="card settings-card">
          <h2 className="card-title">Mood</h2>
          <p style={{ color: "var(--text-2)" }}>
            Currently <strong>{moodLabel(settings.mood)}</strong>.
          </p>
          <MoodPicker mood={settings.mood} onChange={(mood) => updateSettings({ mood })} />
        </section>

        <section className="card settings-card">
          <h2 className="card-title">Backup</h2>
          <p style={{ color: "var(--text-2)" }}>
            {isSignedIn
              ? "Your data is synced to your account, but a local backup is still a good idea."
              : "Your data is saved on this device only. Download a backup each month so you don't lose it."}
          </p>
          <div className="settings-row">
            <button type="button" className="btn btn-secondary" onClick={handleBackup}>
              Download backup (.json)
            </button>
            <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
              Restore from backup
              <input
                type="file"
                accept="application/json"
                onChange={handleRestoreFile}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </section>

        <section className="card settings-card">
          <h2 className="card-title">Sample data</h2>
          <p style={{ color: "var(--text-2)" }}>
            Fill the app with example videos and collabs so you can see how it
            looks.
          </p>
          <button type="button" className="btn btn-secondary" onClick={loadSample}>
            Load sample data
          </button>
        </section>

        <section className="card settings-card settings-danger-zone">
          <h2 className="card-title">Delete all data</h2>
          <p style={{ color: "var(--text-2)" }}>
            Permanently removes every video, collab, and setting on this
            device. This can't be undone.
          </p>
          {!confirmingDelete ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete all data
            </button>
          ) : (
            <div className="settings-confirm">
              <strong>Are you sure? This deletes everything.</strong>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    await deleteAllData();
                    setConfirmingDelete(false);
                  }}
                >
                  Yes, delete everything
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
