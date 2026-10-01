import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { randomId } from "../lib/id";
import { formatLength, parseLength, todayStr } from "../lib/format";
import { monthKeyLabel, monthKeyOf, uploadsThisMonth } from "../lib/stats";

const PLATFORMS = [
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
];

export default function VideoPanel({ video, onClose }) {
  const { videos, collabs, settings, saveVideo, removeVideo } = useAppData();
  const isEdit = !!video;

  const [title, setTitle] = useState(video?.title ?? "");
  const [date, setDate] = useState(video?.date ?? todayStr());
  const [lengthInput, setLengthInput] = useState(
    video ? formatLength(video.lengthSec) : ""
  );
  const [type, setType] = useState(video?.type ?? "long");
  const [platform, setPlatform] = useState(video?.platform ?? "youtube");
  const [collabId, setCollabId] = useState(video?.collabId ?? "");
  const [url, setUrl] = useState(video?.url ?? "");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const goalNote = useMemo(() => {
    if (!date) return null;
    const monthKey = monthKeyOf(date);
    const existingInMonth = uploadsThisMonth(
      videos.filter((v) => v.id !== video?.id),
      monthKey
    );
    const hypothetical = existingInMonth + 1;
    if (hypothetical === settings.monthlyGoal) {
      return `This makes ${hypothetical} of ${settings.monthlyGoal}. ${monthKeyLabel(
        monthKey
      ).split(" ")[0]} goal hit.`;
    }
    return null;
  }, [date, videos, video?.id, settings.monthlyGoal]);

  function clearError(field) {
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  }

  function validate() {
    const next = {};
    if (!title.trim()) next.title = "Title is required.";
    if (!date) {
      next.date = "Date is required.";
    } else if (date > todayStr()) {
      next.date = "Date can't be in the future.";
    }
    if (lengthInput.trim() && parseLength(lengthInput) == null) {
      next.length = "Enter a valid length, like 12:30.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const lengthSec = parseLength(lengthInput);
    const payload = {
      id: video?.id ?? randomId("v"),
      title: title.trim(),
      date,
      type,
      lengthSec: lengthSec ?? 0,
      platform,
      collabId: collabId || null,
      url: url.trim(),
      source: video?.source ?? "manual",
      youtubeId: video?.youtubeId ?? null,
      createdAt: video?.createdAt ?? new Date().toISOString(),
    };
    await saveVideo(payload);
    setSaving(false);
    onClose();
  }

  async function handleDelete() {
    if (!video) return;
    setSaving(true);
    await removeVideo(video.id);
    setSaving(false);
    onClose();
  }

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit video" : "Add video"}>
        <div className="panel-header">
          <h2>{isEdit ? "Edit video" : "Add video"}</h2>
          <button type="button" className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="panel-body">
          <div className="field">
            <label htmlFor="video-title">Title</label>
            <input
              id="video-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError("title");
              }}
              placeholder="What's the video called?"
              className={errors.title ? "has-error" : ""}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="video-date">Upload date</label>
              <input
                id="video-date"
                type="date"
                value={date}
                max={todayStr()}
                onChange={(e) => {
                  setDate(e.target.value);
                  clearError("date");
                }}
                className={errors.date ? "has-error" : ""}
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="video-length">Length</label>
              <input
                id="video-length"
                value={lengthInput}
                onChange={(e) => {
                  setLengthInput(e.target.value);
                  clearError("length");
                }}
                placeholder="12:30"
                className={errors.length ? "has-error" : ""}
              />
              {errors.length && <span className="field-error">{errors.length}</span>}
            </div>
          </div>

          <div className="field">
            <label>Type</label>
            <div className="toggle-row">
              <button
                type="button"
                className={`toggle-btn${type === "long" ? " selected" : ""}`}
                onClick={() => setType("long")}
              >
                Long
              </button>
              <button
                type="button"
                className={`toggle-btn${type === "short" ? " selected" : ""}`}
                onClick={() => setType("short")}
              >
                Short
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="video-platform">Platform</label>
            <select
              id="video-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="video-collab">Collab</label>
            <select
              id="video-collab"
              value={collabId}
              onChange={(e) => setCollabId(e.target.value)}
            >
              <option value="">None</option>
              {collabs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brand}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="video-url">Video link (optional)</label>
            <input
              id="video-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v="
            />
          </div>

          {goalNote && <div className="panel-note-ok">{goalNote}</div>}
        </div>

        <div className="panel-footer">
          {isEdit && (
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
              Delete
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            Save video
          </button>
        </div>
      </div>
    </>
  );
}
