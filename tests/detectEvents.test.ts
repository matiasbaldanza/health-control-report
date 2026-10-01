import { describe, expect, it } from "vitest";
import { detectEvents, isNotice } from "../src/domain/detectEvents";
import type { ImportedGlucoseMeasurement } from "../src/domain/types";

const reading = (
  id: string,
  localDate: string,
  localTime: string,
  valueMgDl: number,
): ImportedGlucoseMeasurement => ({
  id,
  localDate,
  localTime,
  valueMgDl,
  source: "mysugr-csv",
  sourceTags: [],
  provenance: { importId: "test", fileName: "synthetic.csv", rowNumber: 1, raw: {} },
});

const day = "2026-09-11";

describe("notice detection", () => {
  it("flags values below 100 or above 200 without making them events", () => {
    expect(isNotice(reading("low", day, "09:45:00", 98))).toBe(true);
    expect(isNotice(reading("high", day, "14:45:00", 220))).toBe(true);
    expect(isNotice(reading("boundary-low", day, "18:30:00", 100))).toBe(false);
    expect(isNotice(reading("boundary-high", day, "21:40:00", 200))).toBe(false);
  });
});

describe("detectEvents", () => {
  it("does not treat a normal four-measurement day as an event", () => {
    const measurements = [
      reading("a", day, "09:45:00", 120),
      reading("b", day, "14:45:00", 140),
      reading("c", day, "18:30:00", 150),
      reading("d", day, "21:40:00", 160),
    ];

    expect(detectEvents(measurements)).toEqual([]);
  });

  it("flags high and low routine values without creating an event", () => {
    const measurements = [
      reading("a", day, "09:45:00", 98),
      reading("b", day, "14:45:00", 220),
      reading("c", day, "18:30:00", 85),
      reading("d", day, "21:40:00", 240),
    ];

    expect(measurements.filter((measurement) => isNotice(measurement))).toHaveLength(4);
    expect(detectEvents(measurements)).toEqual([]);
  });

  it("detects a high followed by a rapid recheck", () => {
    const events = detectEvents([
      reading("trigger", day, "21:30:00", 280),
      reading("recheck", day, "22:00:00", 240),
    ]);

    expect(events).toHaveLength(1);
    expect(events[0].measurementIds).toEqual(["trigger", "recheck"]);
  });

  it("detects a low followed by a rapid recheck", () => {
    const events = detectEvents([
      reading("trigger", day, "18:30:00", 68),
      reading("recheck", day, "19:00:00", 95),
    ]);

    expect(events).toHaveLength(1);
    expect(events[0].measurementIds).toEqual(["trigger", "recheck"]);
  });

  it("groups a cross-midnight excursion into one event", () => {
    const events = detectEvents([
      reading("a", "2026-09-11", "22:31:00", 486),
      reading("b", "2026-09-11", "22:33:00", 466),
      reading("c", "2026-09-12", "00:29:00", 242),
      reading("d", "2026-09-12", "01:33:00", 153),
      reading("e", "2026-09-12", "02:11:00", 144),
    ]);

    expect(events).toHaveLength(1);
    expect(events[0].measurementIds).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("does not include the next routine measurement after an event", () => {
    const measurements = [
      reading("a", "2026-09-11", "22:31:00", 486),
      reading("b", "2026-09-11", "22:33:00", 466),
      reading("c", "2026-09-12", "00:29:00", 242),
      reading("d", "2026-09-12", "01:33:00", 153),
      reading("e", "2026-09-12", "02:11:00", 144),
      reading("morning", "2026-09-12", "09:45:00", 152),
    ];

    expect(detectEvents(measurements)[0].measurementIds).not.toContain("morning");
  });

  it("does not group abnormal values separated by normal meal cadence", () => {
    const events = detectEvents([
      reading("a", day, "14:39:00", 232),
      reading("b", day, "18:37:00", 152),
      reading("c", day, "21:50:00", 208),
    ]);

    expect(events).toEqual([]);
  });
});
