import * as XLSX from "xlsx";
import {
  last6MonthKeys,
  monthKeyLabel,
  monthlySummaryRow,
  collabProgress,
} from "./stats";
import { formatLength } from "./format";

function monthsForRange(range, monthKey) {
  return range === "last6" ? last6MonthKeys(monthKey) : [monthKey];
}

export function fileNameFor(range, monthKey, ext) {
  const months = monthsForRange(range, monthKey);
  if (months.length === 1) return `upload-tracker-${months[0]}.${ext}`;
  return `upload-tracker-${months[0]}_to_${months[months.length - 1]}.${ext}`;
}

function summaryRows(videos, months, goal) {
  const rows = months.map((m) => monthlySummaryRow(videos, m, goal));
  const total = rows.reduce(
    (acc, r) => ({
      month: "Total",
      goal: acc.goal + r.goal,
      uploads: acc.uploads + r.uploads,
      long: acc.long + r.long,
      short: acc.short + r.short,
      sponsored: acc.sponsored + r.sponsored,
      goalHit: null,
    }),
    { goal: 0, uploads: 0, long: 0, short: 0, sponsored: 0 }
  );
  return [...rows, total].map((r) => ({
    Month: r.month === "Total" ? "Total" : monthKeyLabel(r.month),
    Goal: r.goal,
    Uploads: r.uploads,
    Long: r.long,
    Shorts: r.short,
    Sponsored: r.sponsored,
    "Goal hit": r.goalHit === null ? "" : r.goalHit ? "Yes" : "No",
  }));
}

function collabRows(collabs, months) {
  const monthSet = new Set(months);
  const inRange = collabs.filter((c) => {
    const dates = [c.statusDate, c.dueDate, c.paidDate].filter(Boolean);
    return dates.some((d) => monthSet.has(d.slice(0, 7)));
  });
  return inRange.map((c) => {
    const progress = collabProgress(c);
    const longCount = c.deliverables.filter((d) => d.type === "long").length;
    const shortCount = c.deliverables.filter((d) => d.type === "short").length;
    const parts = [];
    if (longCount) parts.push(`${longCount} long video${longCount > 1 ? "s" : ""}`);
    if (shortCount) parts.push(`${shortCount} Short${shortCount > 1 ? "s" : ""}`);
    return {
      Brand: c.brand,
      Deliverables: parts.join(" + "),
      Done: progress.label,
      "Due date": c.dueDate || "",
      Amount: c.amount == null ? "Rate TBD" : c.amount,
      Status: c.status[0].toUpperCase() + c.status.slice(1),
      "Paid date": c.paidDate || "",
    };
  });
}

export function buildExportData({ videos, collabs, range, monthKey, goal }) {
  const months = monthsForRange(range, monthKey);
  const monthSet = new Set(months);
  const inRangeVideos = videos.filter((v) => monthSet.has(v.date.slice(0, 7)));

  const brandById = Object.fromEntries(collabs.map((c) => [c.id, c.brand]));
  const sorted = [...inRangeVideos].sort((a, b) => b.date.localeCompare(a.date));
  const videosSheet = sorted.map((v) => ({
    Date: v.date,
    Title: v.title,
    Type: v.type === "long" ? "Long" : "Short",
    Length: formatLength(v.lengthSec),
    Platform:
      v.platform === "youtube"
        ? "YouTube"
        : v.platform === "instagram"
        ? "Instagram"
        : "TikTok",
    Collab: v.collabId ? brandById[v.collabId] || "" : "",
    Link: v.url || "",
  }));

  return {
    months,
    videosSheet,
    summarySheet: summaryRows(videos, months, goal),
    collabsSheet: collabRows(collabs, months),
  };
}

export function downloadExcel({ videosSheet, summarySheet, collabsSheet }, fileName, include) {
  const wb = XLSX.utils.book_new();
  if (include.videos) {
    const ws = XLSX.utils.json_to_sheet(videosSheet);
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, ws, "Videos");
  }
  if (include.summary) {
    const ws = XLSX.utils.json_to_sheet(summarySheet);
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
  }
  if (include.collabs) {
    const ws = XLSX.utils.json_to_sheet(collabsSheet);
    XLSX.utils.book_append_sheet(wb, ws, "Collabs");
  }
  XLSX.writeFile(wb, fileName);
}

export function downloadCsv(videosSheet, fileName) {
  const ws = XLSX.utils.json_to_sheet(videosSheet);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJsonBackup(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
