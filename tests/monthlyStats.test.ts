import { describe, expect, it } from "vitest";
import { computeMonthlyStats } from "../src/reports/monthly";
import type { ImportedGlucoseMeasurement } from "../src/domain/types";

const m = (id: string, valueMgDl: number): ImportedGlucoseMeasurement => ({
  id,
  localDate: "2026-01-01",
  localTime: "09:00:00",
  valueMgDl,
  source: "mysugr-csv",
  sourceTags: [],
  provenance: { importId: "test", fileName: "synthetic.csv", rowNumber: 1, raw: {} },
});

describe("computeMonthlyStats", () => {
  it("uses configured report bands", () => {
    const s = computeMonthlyStats([m("a", 69), m("b", 70), m("c", 180), m("d", 181), m("e", 250), m("f", 251)]);
    expect(s.below70).toBe(1);
    expect(s.target70to180).toBe(2);
    expect(s.high181to250).toBe(2);
    expect(s.above250).toBe(1);
  });
});
