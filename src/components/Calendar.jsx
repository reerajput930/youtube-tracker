import { Sparkle } from "lucide-react";
import { todayStr } from "../lib/format";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildCells(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const totalCells = firstWeekday + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  for (let i = 0; i < trailing; i++) cells.push(null);
  return cells;
}

export default function Calendar({ monthKey, dayMap }) {
  const cells = buildCells(monthKey);
  const today = todayStr();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="card-title">Upload log</h2>
        <div style={{ display: "flex", gap: 16, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-2)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "var(--accent)", display: "inline-block" }} />
            long
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "var(--short)", display: "inline-block" }} />
            short
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkle size={12} color="var(--sponsor)" />
            sponsored
          </span>
        </div>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, i) => {
          if (day == null) return <div key={i} className="calendar-cell calendar-cell-blank" />;
          const date = `${monthKey}-${String(day).padStart(2, "0")}`;
          const info = dayMap[date];
          const isToday = date === today;
          const classes = ["calendar-cell"];
          if (isToday) classes.push("calendar-cell-today");

          return (
            <div key={date} className={classes.join(" ")}>
              {info ? (
                <span className={`calendar-day-dot ${info.type}`}>
                  {day}
                  {info.count > 1 ? `+${info.count - 1}` : ""}
                </span>
              ) : (
                <span className="calendar-cell-day">{day}</span>
              )}
              {info?.sponsored && <Sparkle size={13} className="calendar-cell-sponsor-badge" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
