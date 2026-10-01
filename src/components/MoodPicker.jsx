import { MOODS } from "../lib/moods";

export default function MoodPicker({ mood, onChange }) {
  return (
    <div className="mood-grid" role="group" aria-label="Mood">
      {MOODS.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`mood-dot${mood === m.id ? " selected" : ""}`}
          onClick={() => onChange(m.id)}
          aria-pressed={mood === m.id}
          aria-label={m.label}
          title={m.label}
        >
          <span className="mood-dot-swatch" style={{ background: m.hex }} />
        </button>
      ))}
    </div>
  );
}
