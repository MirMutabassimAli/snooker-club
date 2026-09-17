import { describe, expect, it } from "vitest";
import { calculateSessionCharge, formatDuration, getTableSummary } from "@/lib/club-domain";

describe("club domain", () => {
  it("formats a running duration as an always-stable timer", () => {
    expect(formatDuration(0)).toBe("00:00:00");
    expect(formatDuration(3723)).toBe("01:02:03");
  });

  it("calculates fixed snooker rates and rounded e-game units", () => {
    expect(calculateSessionCharge({ kind: "snooker", rate: 500, durationSeconds: 3600 })).toBe(500);
    expect(calculateSessionCharge({ kind: "egame", rate: 1000, unitMinutes: 30, durationSeconds: 35 * 60 })).toBe(2000);
  });

  it("summarizes all table states", () => {
    expect(getTableSummary([
      { status: "available" },
      { status: "available" },
      { status: "occupied" },
      { status: "maintenance" }
    ])).toEqual({ available: 2, occupied: 1, maintenance: 1 });
  });
});
