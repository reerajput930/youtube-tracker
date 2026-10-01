import { format, parseISO, differenceInCalendarDays } from "date-fns";

// ---------- Length ----------

export function formatLength(totalSeconds) {
  if (totalSeconds == null || Number.isNaN(totalSeconds)) return "";
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

// Accepts "12:30" or "1:02:03". Returns seconds, or null if invalid/empty.
export function parseLength(input) {
  if (input == null) return null;
  const trimmed = String(input).trim();
  if (trimmed === "") return null;
  const parts = trimmed.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  if (!parts.every((p) => /^\d{1,2}$/.test(p))) return null;
  const nums = parts.map((p) => parseInt(p, 10));
  if (nums.length === 2) {
    const [m, s] = nums;
    if (s > 59) return null;
    return m * 60 + s;
  }
  const [h, m, s] = nums;
  if (m > 59 || s > 59) return null;
  return h * 3600 + m * 60 + s;
}

// ---------- Dates ----------

export function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDateShort(dateStr) {
  // "2026-09-28" -> "Sep 28"
  return format(parseISO(dateStr), "MMM d");
}

export function formatDateLong(dateStr) {
  return format(parseISO(dateStr), "MMMM d, yyyy");
}

export function daysAgoLabel(dateStr) {
  const diff = differenceInCalendarDays(new Date(), parseISO(dateStr));
  if (diff <= 0) return "today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

export function daysUntilLabel(dateStr) {
  const diff = differenceInCalendarDays(parseISO(dateStr), new Date());
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "1 day left";
  return `${diff} days left`;
}

export function formatMoney(amount, currency = "USD") {
  if (amount == null) return "Rate TBD";
  const symbol = currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${amount.toLocaleString()}`;
}
