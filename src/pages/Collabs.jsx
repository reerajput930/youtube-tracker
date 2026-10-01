import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { saveVideo } from "../lib/storage";
import CollabPanel from "../components/CollabPanel";
import CollabDetail from "../components/CollabDetail";
import {
  activeCollabs,
  unpaidTotal,
  earnedThisYear,
  collabProgress,
  collabDaysLeft,
} from "../lib/stats";
import { formatDateShort, formatMoney, todayStr } from "../lib/format";
import "../styles/collabs.css";

const STATUSES = ["pitched", "agreed", "filming", "posted", "paid"];
const STATUS_LABEL = {
  pitched: "Pitched",
  agreed: "Agreed",
  filming: "Filming",
  posted: "Posted",
  paid: "Paid",
};

function deliverablesSummary(collab) {
  const longCount = collab.deliverables.filter((d) => d.type === "long").length;
  const shortCount = collab.deliverables.filter((d) => d.type === "short").length;
  const parts = [];
  if (longCount) parts.push(`${longCount} long video${longCount > 1 ? "s" : ""}`);
  if (shortCount) parts.push(`${shortCount} Short${shortCount > 1 ? "s" : ""}`);
  return parts.join(" + ");
}

function cardDateLabel(collab) {
  if (collab.status === "pitched") return `Sent ${formatDateShort(collab.statusDate)}`;
  if (collab.status === "agreed" || collab.status === "filming")
    return collab.dueDate ? `Due ${formatDateShort(collab.dueDate)}` : "No due date";
  if (collab.status === "posted") return `Posted ${formatDateShort(collab.statusDate)}`;
  if (collab.status === "paid") return `Paid ${formatDateShort(collab.paidDate)}`;
  return "";
}

export default function Collabs() {
  const { videos, collabs, saveCollab, removeCollab, loadSample } = useAppData();
  const [selectedId, setSelectedId] = useState(null);
  const [panelState, setPanelState] = useState(null); // null | {mode:'new'} | {mode:'edit', collab}

  const selected = collabs.find((c) => c.id === selectedId) || null;

  const linkedVideoIds = useMemo(() => {
    const set = new Set();
    collabs.forEach((c) => c.deliverables.forEach((d) => d.videoId && set.add(d.videoId)));
    return set;
  }, [collabs]);

  const active = activeCollabs(collabs);
  const unpaidSum = unpaidTotal(collabs);
  const earned = earnedThisYear(collabs);

  async function handleSetStatus(status) {
    if (!selected) return;
    await saveCollab({
      ...selected,
      status,
      statusDate: todayStr(),
      paidDate: status === "paid" ? selected.paidDate || todayStr() : selected.paidDate,
    });
  }

  async function handleMarkPaid() {
    if (!selected) return;
    await saveCollab({ ...selected, status: "paid", paidDate: todayStr() });
  }

  async function handleLinkVideo(deliverableId, videoId) {
    if (!selected) return;
    const deliverables = selected.deliverables.map((d) =>
      d.id === deliverableId ? { ...d, videoId } : d
    );
    const video = videos.find((v) => v.id === videoId);
    if (video) await saveVideo({ ...video, collabId: selected.id });
    await saveCollab({ ...selected, deliverables });
  }

  async function handleDelete() {
    if (!selected) return;
    if (window.confirm(`Delete the collab with ${selected.brand}? This can't be undone.`)) {
      await removeCollab(selected.id);
      setSelectedId(null);
    }
  }

  const isEmpty = collabs.length === 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Collabs</div>
          <h1 className="page-title">Brand deals and clients</h1>
        </div>
        <div className="page-header-actions" style={{ alignItems: "center" }}>
          <div className="collabs-summary">
            <span>
              <strong>{active.length}</strong> active
            </span>
            <span>
              <strong>{formatMoney(unpaidSum)}</strong> unpaid
            </span>
            <span>
              <strong>{formatMoney(earned)}</strong> earned this year
            </span>
          </div>
          {isEmpty && (
            <button type="button" className="btn btn-secondary" onClick={loadSample}>
              Load sample data
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={() => setPanelState({ mode: "new" })}>
            <Plus size={16} /> New collab
          </button>
        </div>
      </div>

      <div className="collab-board">
        {STATUSES.map((status) => {
          const items = collabs.filter((c) => c.status === status);
          return (
            <div key={status} className="collab-column">
              <div className="collab-column-header">
                <span className={`status-dot ${status}`} />
                {STATUS_LABEL[status]}
                <span className="collab-column-count">{items.length}</span>
              </div>
              {items.map((c) => {
                const daysLeft = collabDaysLeft(c);
                const showWarn =
                  (status === "agreed" || status === "filming") && daysLeft != null && daysLeft <= 7;
                const progress = collabProgress(c);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`collab-card${selectedId === c.id ? " selected" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <strong>{c.brand}</strong>
                    <span className="collab-card-meta">{deliverablesSummary(c)}</span>
                    {c.deliverables.length > 1 && (
                      <span className="collab-card-meta">{progress.label}</span>
                    )}
                    <div className="collab-card-footer">
                      <span className="collab-card-meta">{cardDateLabel(c)}</span>
                      <span className="collab-card-amount">{formatMoney(c.amount, c.currency)}</span>
                    </div>
                    {showWarn && (
                      <span className={`chip ${daysLeft < 0 ? "chip-danger" : "chip-warn"}`}>
                        {daysLeft < 0 ? "Overdue" : `${daysLeft} days left`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {selected && (
        <CollabDetail
          collab={selected}
          videos={videos}
          linkedVideoIds={linkedVideoIds}
          onSetStatus={handleSetStatus}
          onLinkVideo={handleLinkVideo}
          onMarkPaid={handleMarkPaid}
          onEdit={() => setPanelState({ mode: "edit", collab: selected })}
          onDelete={handleDelete}
        />
      )}

      {panelState && (
        <CollabPanel
          collab={panelState.mode === "edit" ? panelState.collab : null}
          onClose={() => setPanelState(null)}
        />
      )}
    </div>
  );
}
