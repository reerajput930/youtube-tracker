import { NavLink } from "react-router-dom";
import { LayoutGrid, PlayCircle, Users, Download, Play } from "lucide-react";
import MoodPicker from "./MoodPicker";
import { moodLabel } from "../lib/moods";
import { useAppData } from "../context/AppDataContext";
import { monthKeyOf, uploadsThisMonth, goalProgress } from "../lib/stats";
import { todayStr } from "../lib/format";

const LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/videos", label: "Videos", icon: PlayCircle },
  { to: "/collabs", label: "Collabs", icon: Users },
  { to: "/export", label: "Export", icon: Download },
];

export default function Sidebar() {
  const { settings, updateSettings, isSignedIn, user, videos } = useAppData();

  const monthKey = monthKeyOf(todayStr());
  const uploads = uploadsThisMonth(videos, monthKey);
  const goal = goalProgress(uploads, settings.monthlyGoal);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <Play size={16} fill="currentColor" />
        </div>
        <div className="sidebar-logo-text">
          <h1>Upload tracker</h1>
          <span>{settings.channelName}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-mood">
        <div className="sidebar-mood-header">
          <span>mood sticker</span>
          <strong>{moodLabel(settings.mood)}</strong>
        </div>
        <MoodPicker
          mood={settings.mood}
          onChange={(mood) => updateSettings({ mood })}
        />
      </div>

      <div className="sidebar-sticky-wrap">
        <div className="sticky-note">
          <strong>{goal.hit ? "Shipped it! 🎉" : "Ship it!"}</strong>
          {goal.hit
            ? `${uploads} of ${settings.monthlyGoal} goal hit this month.`
            : `${goal.remaining} more video${goal.remaining === 1 ? "" : "s"} to hit your goal`}
        </div>

        <NavLink to="/settings" className="sidebar-note">
          {isSignedIn ? (
            <>
              <strong>Synced as {user.email}</strong>
              YouTube uploads sync automatically.
            </>
          ) : (
            <>
              <strong>Saved on this device</strong>
              Settings &amp; backup →
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
