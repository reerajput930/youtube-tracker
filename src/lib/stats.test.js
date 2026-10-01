import { describe, it, expect } from "vitest";
import {
  goalProgress,
  weeklyStreak,
  dueSoonCollabs,
  unpaidCollabs,
  unpaidTotal,
  totalUploads,
  uploadsThisMonth,
} from "./stats";
import { formatLength, parseLength } from "./format";
import { buildSampleVideos, buildSampleCollabs } from "./sampleData";

const TODAY = new Date("2026-09-30T00:00:00");

describe("goalProgress", () => {
  it("reports remaining videos before the goal", () => {
    expect(goalProgress(7, 8)).toEqual({
      pct: 88,
      remaining: 1,
      hit: false,
      text: "1 more to hit your goal",
    });
  });

  it("reports goal hit at or above the target", () => {
    expect(goalProgress(8, 8).hit).toBe(true);
    expect(goalProgress(8, 8).text).toBe("Goal hit");
    expect(goalProgress(10, 8).pct).toBe(100);
  });
});

describe("weeklyStreak", () => {
  it("matches the sample data: 5 weeks as of 2026-09-30", () => {
    const videos = buildSampleVideos();
    expect(weeklyStreak(videos, TODAY)).toBe(5);
  });

  it("skips an empty current week instead of breaking the streak", () => {
    const videos = [
      { date: "2026-09-21" }, // week of Sep 21-27 has an upload
    ];
    // "today" (Sep 30) falls in a week with no upload yet - should not count as broken
    expect(weeklyStreak(videos, TODAY)).toBe(1);
  });

  it("is 0 when there are no videos", () => {
    expect(weeklyStreak([], TODAY)).toBe(0);
  });
});

describe("uploads and totals", () => {
  it("counts this month's uploads for the sample data", () => {
    const videos = buildSampleVideos();
    expect(uploadsThisMonth(videos, "2026-09")).toBe(7);
  });

  it("splits total uploads into long and short", () => {
    const videos = buildSampleVideos();
    const totals = totalUploads(videos);
    expect(totals).toEqual({ total: 52, long: 31, short: 21 });
  });
});

describe("collabs", () => {
  it("finds collabs due within 7 days", () => {
    const collabs = buildSampleCollabs();
    const dueSoon = dueSoonCollabs(collabs, TODAY);
    expect(dueSoon.map((c) => c.brand)).toEqual(["Northwind Monitors"]);
    expect(dueSoon[0].daysLeft).toBe(3);
  });

  it("finds unpaid (posted) collabs and sums their amount", () => {
    const collabs = buildSampleCollabs();
    const unpaid = unpaidCollabs(collabs);
    expect(unpaid.map((c) => c.brand)).toEqual(["Pixel Forge"]);
    expect(unpaidTotal(collabs)).toBe(250);
  });
});

describe("length formatting", () => {
  it("formats seconds as m:ss", () => {
    expect(formatLength(45)).toBe("0:45");
    expect(formatLength(1100)).toBe("18:20");
  });

  it("formats an hour or more as h:mm:ss", () => {
    expect(formatLength(3723)).toBe("1:02:03");
  });

  it("parses m:ss and h:mm:ss input", () => {
    expect(parseLength("12:30")).toBe(750);
    expect(parseLength("1:02:03")).toBe(3723);
  });

  it("rejects invalid length input", () => {
    expect(parseLength("12:99")).toBeNull();
    expect(parseLength("abc")).toBeNull();
    expect(parseLength("")).toBeNull();
  });
});
