import { describe, expect, it } from "vitest";
import { detectEvents } from "../src/domain/detectEvents";
import { resolveDailySlotCollisions } from "../src/domain/resolveDailySlotCollisions";
import type { ImportedGlucoseMeasurement } from "../src/domain/types";

const reading = (
  id: string,
  localDate: string,
  localTime: string,
  valueMgDl: number,
  sourceTags: string[] = [],
): ImportedGlucoseMeasurement => ({
  id,
  localDate,
  localTime,
  valueMgDl,
  source: "mysugr-csv",
  sourceTags,
  provenance: { importId: "test", fileName: "synthetic.csv", rowNumber: 1, raw: {} },
});

describe("resolveDailySlotCollisions", () => {
  it("infers the later adjacent slot when merienda collides and dinner is empty", () => {
    const measurements = [
      reading("breakfast", "2026-09-10", "10:05:00", 130),
      reading("lunch", "2026-09-10", "15:10:00", 155),
      reading("snack", "2026-09-10", "18:20:00", 120),
      reading("early-dinner", "2026-09-10", "19:42:00", 170, ["Before meal"]),
    ];

    const assignments = resolveDailySlotCollisions(measurements);

    expect(assignments.map(({ measurementId, slot, status }) => ({ measurementId, slot, status }))).toEqual([
      { measurementId: "breakfast", slot: "fasting", status: "confirmed" },
      { measurementId: "lunch", slot: "lunch", status: "confirmed" },
      { measurementId: "snack", slot: "afternoon_snack", status: "confirmed" },
      { measurementId: "early-dinner", slot: "dinner", status: "inferred" },
    ]);
  });

  it("does not redistribute rapid low-value follow-ups into routine slots", () => {
    const measurements = [
      reading("trigger", "2026-09-10", "18:20:00", 72),
      reading("followup-a", "2026-09-10", "18:50:00", 94),
      reading("followup-b", "2026-09-10", "19:30:00", 115),
      reading("dinner", "2026-09-10", "21:40:00", 160),
    ];
    const event = detectEvents(measurements)[0];
    const followupIds = new Set(event.measurementIds.slice(1));

    const assignments = resolveDailySlotCollisions(measurements, followupIds);

    expect(assignments).toEqual([
      expect.objectContaining({ measurementId: "trigger", slot: "afternoon_snack", status: "confirmed" }),
      expect.objectContaining({ measurementId: "dinner", slot: "dinner", status: "confirmed" }),
    ]);
    expect(assignments.some(({ measurementId }) => measurementId === "followup-a")).toBe(false);
    expect(assignments.some(({ measurementId }) => measurementId === "followup-b")).toBe(false);
  });

  it("does not let a generic Before meal tag override time-based context", () => {
    const assignments = resolveDailySlotCollisions([
      reading("snack", "2026-09-10", "18:20:00", 120, ["Before meal"]),
    ]);

    expect(assignments[0]).toEqual(expect.objectContaining({ slot: "afternoon_snack", status: "confirmed" }));
  });

  it("leaves a duplicate slot ambiguous when the later reading is far from the next boundary", () => {
    const assignments = resolveDailySlotCollisions([
      reading("snack-a", "2026-09-10", "17:10:00", 120),
      reading("snack-b", "2026-09-10", "18:00:00", 130),
    ]);

    expect(assignments).toEqual([
      expect.objectContaining({ measurementId: "snack-a", slot: "afternoon_snack", status: "ambiguous" }),
      expect.objectContaining({ measurementId: "snack-b", slot: "afternoon_snack", status: "ambiguous" }),
    ]);
  });
});
