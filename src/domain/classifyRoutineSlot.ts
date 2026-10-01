import type { RoutineSlot } from "./types";

export interface SlotWindow {
  slot: RoutineSlot;
  startMinute: number;
  endMinute: number;
  anchorMinute: number;
}

export const defaultSlotWindows: SlotWindow[] = [
  { slot: "fasting", startMinute: 6 * 60, endMinute: 11 * 60 + 59, anchorMinute: 9 * 60 + 30 },
  { slot: "lunch", startMinute: 12 * 60, endMinute: 16 * 60 + 59, anchorMinute: 14 * 60 + 30 },
  { slot: "afternoon_snack", startMinute: 17 * 60, endMinute: 20 * 60 + 29, anchorMinute: 18 * 60 + 30 },
  { slot: "dinner", startMinute: 20 * 60 + 30, endMinute: 23 * 60 + 59, anchorMinute: 21 * 60 + 30 },
];

function toMinutes(localTime: string): number {
  const [h, m] = localTime.split(":").map(Number);
  return h * 60 + m;
}

export function inferRoutineSlot(
  localTime: string,
  windows: SlotWindow[] = defaultSlotWindows,
): RoutineSlot | undefined {
  const minute = toMinutes(localTime);
  return windows.find((w) => minute >= w.startMinute && minute <= w.endMinute)?.slot;
}
