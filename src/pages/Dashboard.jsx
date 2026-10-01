import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Clock,
  Pin,
  Paperclip,
  Flame,
  Square,
} from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import Calendar from "../components/Calendar";
import {
  monthKeyLabel,
  monthKeyOf,
  shiftMonthKey,
  uploadsThisMonth,
  goalProgress,
  totalUploads,
  weeklyStreak,
  last8WeeksStrip,
  activeCollabs,
  dueSoonCollabs,
  unpaidCollabs,
  calendarDayMap,
  lastUpload,
  monthByType,
  videosInMonth,
} from "../lib/stats";
import { todayStr, daysUntilLabel, formatMoney, formatDateShort } from "../lib/format";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { videos, collabs, settings, loadSample } = useAppData();
  const { openAddVideo } = useOutletContext();
  const [monthKey, setMonthKey] = useState(monthKeyOf(todayStr()));

  const uploads = uploadsThisMonth(videos, monthKey);
  const goal = goalProgress(uploads, settings.monthlyGoal);
  const totals = totalUploads(videos);
  const streak = weeklyStreak(videos);
  const strip = last8WeeksStrip(videos);
  const active = activeCollabs(collabs);
  const dueSoon = dueSoonCollabs(collabs);
  const unpaid = unpaidCollabs(collabs);
  const dayMap = calendarDayMap(videos, monthKey);
  const last = lastUpload(videos);
  const byType = monthByType(videos, monthKey);

  const filmSlots = useMemo(() => {
    const sorted = videosInMonth(videos, monthKey)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
    const length = Math.max(settings.monthlyGoal, sorted.length);
    const firstEmptyIndex = sorted.length < length ? sorted.length : -1;
    return Array.from({ length }, (_, i) => {
      const v = sorted[i];
      if (v) return { day: Number(v.date.slice(8, 10)), type: v.type };
      if (i === firstEmptyIndex) return { placeholder: true };
      return null;
    });
  }, [videos, monthKey, settings.monthlyGoal]);

  const attentionItems = useMemo(() => {
    const dueItems = dueSoon.map((c) => ({
      key: `due-${c.id}`,
      variant: "sticky",
      title: c.brand,
      detail: `1 ${c.deliverables.length === 1 ? (c.deliverables[0].type === "long" ? "Long" : "Short") : "deliverable"} · due ${formatDateShort(c.dueDate)}`,
      chipLabel: c.daysLeft < 0 ? "Overdue" : daysUntilLabel(c.dueDate),
      chipVariant: c.daysLeft < 0 ? "danger" : "warn",
    }));
    const unpaidItems = unpaid.map((c) => ({
      key: `unpaid-${c.id}`,
      variant: "pinned",
      title: c.brand,
      detail: `${formatMoney(c.amount, c.currency)} · posted ${formatDateShort(c.statusDate)}`,
      chipLabel: "Unpaid",
      chipVariant: "danger",
    }));
    return [...dueItems, ...unpaidItems];
  }, [dueSoon, unpaid]);

  const nextToFilm = useMemo(() => {
    const items = [];
    active.forEach((c) => {
      c.deliverables
        .filter((d) => !d.videoId)
        .forEach((d) => items.push({ key: `${c.id}-${d.id}`, label: `${c.brand} ${d.label}` }));
    });
    return items;
  }, [active]);

  const isEmpty = videos.length === 0 && collabs.length === 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Dashboard</div>
          <div className="month-switcher">
            <h1 className="page-title">{monthKeyLabel(monthKey)}</h1>
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={() => setMonthKey(shiftMonthKey(monthKey, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={() => setMonthKey(shiftMonthKey(monthKey, 1))}
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="page-header-actions">
          {isEmpty && (
            <button type="button" className="btn btn-secondary" onClick={loadSample}>
              Load sample data
            </button>
          )}
          <Link to="/export" className="btn btn-secondary">
            <Download size={16} /> Export
          </Link>
          <button type="button" className="btn btn-primary" onClick={openAddVideo}>
            <Plus size={16} /> Add video
          </button>
        </div>
      </div>

      <div className="stat-cards">
        <div className="card stat-card stat-card-goal">
          <span className="stat-card-label">uploads this month</span>
          <span className="stat-card-value">
            {uploads}<span className="stat-card-value-sep">/</span>
            {settings.monthlyGoal}
          </span>
          <div className="film-strip">
            {filmSlots.map((slot, i) =>
              slot?.placeholder ? (
                <div key="placeholder" className="film-cell film-cell-empty">
                  ?
                </div>
              ) : slot ? (
                <div key={i} className={`film-cell film-cell-${slot.type}`}>
                  {slot.day}
                </div>
              ) : (
                <div key={i} className="film-cell film-cell-blank" />
              )
            )}
          </div>
          <span className="stat-card-sub">{goal.text}</span>
        </div>

        <div className="card stat-card stat-card-ticket">
          <span className="ticket-no">No.{String(totals.total).padStart(3, "0")}</span>
          <span className="stat-card-label">all-time</span>
          <span className="stat-card-value">{totals.total}</span>
          <span className="stat-card-sub">
            {totals.long} long &middot; {totals.short} shorts
          </span>
        </div>

        <div className="card stat-card">
          <span className="stat-card-label">weekly streak</span>
          <span className="stat-card-value">
            <Flame size={30} color="var(--accent)" fill="var(--accent)" /> {streak}
          </span>
          <div className="streak-strip">
            {strip.map((w) => (
              <div key={w.weekStart} className={`streak-dot${w.filled ? " filled" : ""}`} />
            ))}
          </div>
          <span className="stat-card-sub">{streak} week streak</span>
        </div>

        <div className="card stat-card">
          <Paperclip size={18} className="stat-card-clip" />
          <span className="stat-card-label">collabs</span>
          <span className="stat-card-value">
            {active.length} <small>active</small>
          </span>
          <div className="stat-card-chips">
            {dueSoon.length > 0 && <span className="chip chip-warn">{dueSoon.length} due soon</span>}
            {unpaid.length > 0 && <span className="chip chip-neutral">{unpaid.length} unpaid</span>}
            {dueSoon.length === 0 && unpaid.length === 0 && (
              <span className="chip chip-ok">All caught up</span>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <Calendar monthKey={monthKey} dayMap={dayMap} />
        </div>

        <div className="dashboard-side">
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 className="card-title">Needs attention</h2>
              <Link to="/collabs" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                Open collabs
              </Link>
            </div>
            {attentionItems.length === 0 ? (
              <p style={{ color: "var(--text-2)", fontSize: 14 }}>Nothing needs attention right now.</p>
            ) : (
              <div className="attention-list">
                {attentionItems.map((item) =>
                  item.variant === "sticky" ? (
                    <div key={item.key} className="attention-sticky sticky-note">
                      <span className={`chip chip-${item.chipVariant} attention-sticky-chip`}>
                        {item.chipLabel}
                      </span>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>
                  ) : (
                    <div key={item.key} className="attention-pinned">
                      <Pin size={14} className="attention-pin" />
                      <div className="attention-item-body">
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                      </div>
                      <span className={`chip chip-${item.chipVariant}`}>{item.chipLabel}</span>
                    </div>
                  )
                )}
              </div>
            )}

            {nextToFilm.length > 0 && (
              <div className="next-to-film">
                <span className="next-to-film-label">next to film</span>
                {nextToFilm.map((item) => (
                  <div key={item.key} className="checklist-row">
                    <Square size={16} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="type-tallies">
              <TallyRow label="long" count={byType.long} variant="long" />
              <TallyRow label="shorts" count={byType.short} variant="short" />
              <TallyRow label="sponsored" count={byType.sponsored} variant="sponsored" />
            </div>
            {last && (
              <div className="last-upload-note">
                <Clock size={14} /> Last upload {formatDateShort(last.date)} · {last.label}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TallyRow({ label, count, variant }) {
  const marks = Math.min(count, 10);
  return (
    <div className="tally-row">
      <span className="tally-label">{label}</span>
      <div className="tally-marks">
        {Array.from({ length: marks }, (_, i) => (
          <span key={i} className={`tally-mark tally-mark-${variant}`} />
        ))}
      </div>
      <span className="tally-count">{count}</span>
    </div>
  );
}
