import { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { collabProgress } from "../lib/stats";
import { formatDateShort, formatMoney } from "../lib/format";

const STATUSES = ["pitched", "agreed", "filming", "posted", "paid"];
const STATUS_LABEL = {
  pitched: "Pitched",
  agreed: "Agreed",
  filming: "Filming",
  posted: "Posted",
  paid: "Paid",
};

export default function CollabDetail({
  collab,
  videos,
  linkedVideoIds,
  onSetStatus,
  onLinkVideo,
  onMarkPaid,
  onEdit,
  onDelete,
}) {
  const [pickerFor, setPickerFor] = useState(null);
  const progress = collabProgress(collab);
  const currentIndex = STATUSES.indexOf(collab.status);

  const availableVideos = videos
    .filter((v) => !linkedVideoIds.has(v.id))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="card">
      <div className="collab-detail-header">
        <div>
          <h2 className="card-title">{collab.brand}</h2>
          {collab.contactName || collab.contactEmail ? (
            <p style={{ color: "var(--text-2)", fontSize: 13 }}>
              Contact: {collab.contactName || "—"} · {collab.contactEmail || "—"}
            </p>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-icon btn-ghost" onClick={onEdit} aria-label="Edit collab">
            <Pencil size={16} />
          </button>
          <button type="button" className="btn btn-icon btn-ghost" onClick={onDelete} aria-label="Delete collab">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="status-steps">
        {STATUSES.map((s, i) => (
          <button
            key={s}
            type="button"
            className={`status-step${i < currentIndex ? " done" : ""}${s === collab.status ? " current" : ""}`}
            onClick={() => onSetStatus(s)}
          >
            {i < currentIndex && <Check size={14} />}
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="collab-detail">
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>What you owe them</h3>
          <div className="deliverables-list">
            {collab.deliverables.map((d) => {
              const linkedVideo = d.videoId ? videos.find((v) => v.id === d.videoId) : null;
              return (
                <div key={d.id} className="deliverable-row">
                  <div className={`deliverable-check${d.videoId ? " done" : ""}`}>
                    {d.videoId && <Check size={14} />}
                  </div>
                  <div className="deliverable-body">
                    <strong>{d.label}</strong>
                    <span>
                      {d.dueDate ? `Due ${formatDateShort(d.dueDate)}` : "No due date"}
                      {linkedVideo ? ` · posted ${formatDateShort(linkedVideo.date)}` : " · not linked yet"}
                    </span>
                  </div>
                  {linkedVideo ? (
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>{linkedVideo.title}</span>
                  ) : pickerFor === d.id ? (
                    <div className="deliverable-picker">
                      <select
                        autoFocus
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            onLinkVideo(d.id, e.target.value);
                            setPickerFor(null);
                          }
                        }}
                      >
                        <option value="" disabled>
                          Choose a video…
                        </option>
                        {availableVideos.map((v) => (
                          <option key={v.id} value={v.id}>
                            {formatDateShort(v.date)} · {v.title}
                          </option>
                        ))}
                      </select>
                      <button type="button" className="btn btn-ghost" onClick={() => setPickerFor(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="btn btn-secondary" onClick={() => setPickerFor(d.id)}>
                      Link a video
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {progress.allDone && collab.status === "filming" && (
            <div className="panel-note-ok" style={{ marginTop: 16 }}>
              All videos posted. Move to Posted?{" "}
              <button
                type="button"
                className="btn btn-primary"
                style={{ height: 32, marginLeft: 8 }}
                onClick={() => onSetStatus("posted")}
              >
                Move
              </button>
            </div>
          )}
        </div>

        <div className="card payment-box" style={{ background: "var(--sidebar)" }}>
          <span className="stat-card-label">Payment</span>
          <span className="payment-amount">{formatMoney(collab.amount, collab.currency)}</span>
          {collab.paymentNote && (
            <p style={{ fontSize: 13, color: "var(--text-2)" }}>{collab.paymentNote}</p>
          )}
          <div className="payment-row">
            <span>Status</span>
            <span>
              {collab.status === "paid"
                ? `Paid ${collab.paidDate ? formatDateShort(collab.paidDate) : ""}`
                : "Not paid yet"}
            </span>
          </div>
          {collab.status !== "paid" && (
            <button type="button" className="btn btn-primary" onClick={onMarkPaid}>
              Mark as paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
