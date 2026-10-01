import { describe, expect, it } from "vitest";
import { inferRoutineSlot } from "../src/domain/classifyRoutineSlot";

describe("inferRoutineSlot", () => {
  it("classifies by local clock time, not reading order", () => {
    expect(inferRoutineSlot("09:30:00")).toBe("fasting");
    expect(inferRoutineSlot("14:45:00")).toBe("lunch");
    expect(inferRoutineSlot("18:30:00")).toBe("afternoon_snack");
    expect(inferRoutineSlot("21:40:00")).toBe("dinner");
  });

  it("leaves overnight readings unclassified", () => {
    expect(inferRoutineSlot("01:30:00")).toBeUndefined();
  });
});
