import {
  parseISO,
  startOfWeek,
  endOfWeek,
  subWeeks,
  differenceInCalendarDays,
  format,
} from "date-fns";
import { daysAgoLabel } from "./format";

const WEEK_OPTS = { weekStartsOn: 1 }; // Monday

export function monthKeyOf(dateStr) {
  return dateStr.slice(0, 7);
}

export function monthKeyLabel(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return format(new Date(y, m - 1, 1), "MMMM yyyy");
}

export function shiftMonthKey(monthKey, delta) {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return format(d, "yyyy-MM");
}

export function videosInMonth(videos, monthKey) {
  return videos.filter((v) => monthKeyOf(v.date) === monthKey);
}

export function uploadsThisMonth(videos, monthKey) {
  return videosInMonth(videos, monthKey).length;
}

export function goalProgress(uploads, goal) {
  const pct = goal > 0 ? Math.min(100, Math.round((uploads / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - uploads);
  const hit = uploads >= goal;
  const text = hit ? "Goal hit" : `${remaining} more to hit your goal`;
  return { pct, remaining, hit, text };
}

export function totalUploads(videos) {
  const long = videos.filter((v) => v.type === "long").length;
  const short = videos.filter((v) => v.type === "short").length;
  return { total: videos.length, long, short };
}

export function isSponsored(video) {
  return !!video.collabId;
}

function weekBounds(date) {
  return {
    start: startOfWeek(date, WEEK_OPTS),
    end: endOfWeek(date, WEEK_OPTS),
  };
}

function weekHasUpload(videos, weekStart, weekEnd) {
  return videos.some((v) => {
    const d = parseISO(v.date);
    return d >= weekStart && d <= weekEnd;
  });
}

export function weeklyStreak(videos, today = new Date()) {
  let cursor = startOfWeek(today, WEEK_OPTS);
  const { start: curStart, end: curEnd } = weekBounds(today);
  if (!weekHasUpload(videos, curStart, curEnd)) {
    cursor = subWeeks(cursor, 1);
  }
  let streak = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const start = cursor;
    const end = endOfWeek(cursor, WEEK_OPTS);
    if (!weekHasUpload(videos, start, end)) break;
    streak++;
    cursor = subWeeks(cursor, 1);
  }
  return streak;
}

export function last8WeeksStrip(videos, today = new Date()) {
  const current = startOfWeek(today, WEEK_OPTS);
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const start = subWeeks(current, i);
    const end = endOfWeek(start, WEEK_OPTS);
    weeks.push({
      weekStart: format(start, "yyyy-MM-dd"),
      filled: weekHasUpload(videos, start, end),
    });
  }
  return weeks;
}

export function activeCollabs(collabs) {
  return collabs.filter((c) => c.status === "agreed" || c.status === "filming");
}

export function collabDaysLeft(collab, today = new Date()) {
  if (!collab.dueDate) return null;
  return differenceInCalendarDays(parseISO(collab.dueDate), today);
}

export function dueSoonCollabs(collabs, today = new Date()) {
  return activeCollabs(collabs)
    .filter((c) => c.dueDate != null)
    .map((c) => ({ ...c, daysLeft: collabDaysLeft(c, today) }))
    .filter((c) => c.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function unpaidCollabs(collabs) {
  return collabs.filter((c) => c.status === "posted");
}

export function unpaidTotal(collabs) {
  return unpaidCollabs(collabs).reduce((sum, c) => sum + (c.amount || 0), 0);
}

export function earnedThisYear(collabs, year = new Date().getFullYear()) {
  return collabs
    .filter((c) => c.paidDate && parseISO(c.paidDate).getFullYear() === year)
    .reduce((sum, c) => sum + (c.amount || 0), 0);
}

export function collabProgress(collab) {
  const done = collab.deliverables.filter((d) => d.videoId).length;
  const total = collab.deliverables.length;
  return {
    done,
    total,
    label: `${done} of ${total} done`,
    allDone: total > 0 && done === total,
  };
}

// Map of date -> { type: 'long'|'short', count, sponsored }
export function calendarDayMap(videos, monthKey) {
  const byDate = {};
  videosInMonth(videos, monthKey).forEach((v) => {
    if (!byDate[v.date]) byDate[v.date] = [];
    byDate[v.date].push(v);
  });
  const result = {};
  Object.entries(byDate).forEach(([date, dayVideos]) => {
    const hasLong = dayVideos.some((v) => v.type === "long");
    result[date] = {
      type: hasLong ? "long" : "short",
      count: dayVideos.length,
      sponsored: dayVideos.some(isSponsored),
    };
  });
  return result;
}

export function lastUpload(videos) {
  if (videos.length === 0) return null;
  const sorted = [...videos].sort((a, b) => b.date.localeCompare(a.date));
  const newest = sorted[0];
  return { date: newest.date, label: daysAgoLabel(newest.date) };
}

export function monthByType(videos, monthKey) {
  const inMonth = videosInMonth(videos, monthKey);
  return {
    long: inMonth.filter((v) => v.type === "long").length,
    short: inMonth.filter((v) => v.type === "short").length,
    sponsored: inMonth.filter(isSponsored).length,
  };
}

export function last6MonthKeys(endMonthKey) {
  const keys = [];
  for (let i = 5; i >= 0; i--) {
    keys.push(shiftMonthKey(endMonthKey, -i));
  }
  return keys;
}

export function monthlySummaryRow(videos, monthKey, goal) {
  const { long, short, sponsored } = monthByType(videos, monthKey);
  const uploads = long + short;
  return {
    month: monthKey,
    goal,
    uploads,
    long,
    short,
    sponsored,
    goalHit: uploads >= goal,
  };
}
