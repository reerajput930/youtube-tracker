import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { randomId } from "../lib/id";
import { todayStr } from "../lib/format";

export default function CollabPanel({ collab, onClose }) {
  const { saveCollab } = useAppData();
  const isEdit = !!collab;

  const [brand, setBrand] = useState(collab?.brand ?? "");
  const [dueDate, setDueDate] = useState(collab?.dueDate ?? "");
  const [amount, setAmount] = useState(collab?.amount ?? "");
  const [paymentNote, setPaymentNote] = useState(collab?.paymentNote ?? "");
  const [notes, setNotes] = useState(collab?.notes ?? "");
  const [deliverables, setDeliverables] = useState(
    collab?.deliverables ?? [
      { id: randomId("d"), type: "long", label: "Long video", dueDate: "", videoId: null },
    ]
  );
  const [error, setError] = useState("");

  function addDeliverable(type) {
    const countOfType = deliverables.filter((d) => d.type === type).length;
    setDeliverables((list) => [
      ...list,
      {
        id: randomId("d"),
        type,
        label: type === "long" ? "Long video" : `Short #${countOfType + 1}`,
        dueDate: "",
        videoId: null,
      },
    ]);
  }

  function removeDeliverable(id) {
    setDeliverables((list) => list.filter((d) => d.id !== id));
  }

  async function handleSave() {
    if (!brand.trim()) {
      setError("Brand is required.");
      return;
    }
    if (deliverables.length === 0) {
      setError("Add at least one deliverable.");
      return;
    }
    const payload = {
      id: collab?.id ?? randomId("c"),
      brand: brand.trim(),
      contactName: collab?.contactName ?? "",
      contactEmail: collab?.contactEmail ?? "",
      status: collab?.status ?? "pitched",
      statusDate: collab?.statusDate ?? todayStr(),
      dueDate: dueDate || null,
      amount: amount === "" ? null : Number(amount),
      currency: collab?.currency ?? "USD",
      paymentNote: paymentNote.trim(),
      paidDate: collab?.paidDate ?? null,
      deliverables: deliverables.map((d) => ({ ...d, dueDate: d.dueDate || dueDate || null })),
      notes: notes.trim(),
    };
    await saveCollab(payload);
    onClose();
  }

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit collab" : "New collab"}>
        <div className="panel-header">
          <h2>{isEdit ? "Edit collab" : "New collab"}</h2>
          <button type="button" className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="panel-body">
          <div className="field">
            <label htmlFor="collab-brand">Brand</label>
            <input
              id="collab-brand"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setError("");
              }}
              placeholder="Brand or client name"
              className={error && !brand.trim() ? "has-error" : ""}
            />
            {error && !brand.trim() && <span className="field-error">{error}</span>}
          </div>

          <div className="field">
            <label>Deliverables</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {deliverables.map((d) => (
                <div key={d.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`chip ${d.type === "long" ? "chip-long" : "chip-short"}`}>
                    {d.type === "long" ? "Long" : "Short"}
                  </span>
                  <span style={{ flex: 1, fontSize: 14 }}>{d.label}</span>
                  <button
                    type="button"
                    className="btn btn-icon btn-ghost"
                    onClick={() => removeDeliverable(d.id)}
                    aria-label={`Remove ${d.label}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => addDeliverable("long")}>
                <Plus size={14} /> Long
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => addDeliverable("short")}>
                <Plus size={14} /> Short
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="collab-due">Due date</label>
            <input
              id="collab-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="collab-amount">Amount (leave blank for Rate TBD)</label>
            <input
              id="collab-amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="400"
            />
          </div>

          <div className="field">
            <label htmlFor="collab-payment-note">Payment note</label>
            <textarea
              id="collab-payment-note"
              rows={2}
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Paid when all videos are posted."
            />
          </div>

          <div className="field">
            <label htmlFor="collab-notes">Notes</label>
            <textarea
              id="collab-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="panel-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save collab
          </button>
        </div>
      </div>
    </>
  );
}
