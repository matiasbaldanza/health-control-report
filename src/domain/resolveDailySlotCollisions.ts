import { defaultSlotWindows, inferRoutineSlot, type SlotWindow } from "./classifyRoutineSlot";
import type {
  ClassificationStatus,
  ImportedGlucoseMeasurement,
  RoutineSlot,
  SlotAlternative,
} from "./types";

export interface RoutineSlotAssignment {
  measurementId: string;
  slot?: RoutineSlot;
  status: ClassificationStatus;
  confidence: number;
  alternatives?: SlotAlternative[];
}

const orderedSlots: RoutineSlot[] = ["fasting", "lunch", "afternoon_snack", "dinner"];
export const contextualAdjacentSlotWindowMinutes = 120;

function toMinutes(localTime: string): number {
  const [hour, minute] = localTime.split(":").map(Number);
  return hour * 60 + minute;
}

function timeEvidence(measurement: ImportedGlucoseMeasurement, slot: RoutineSlot, windows: SlotWindow[]): number {
  const minute = toMinutes(measurement.localTime);
  const window = windows.find((candidate) => candidate.slot === slot);
  if (!window) return 0.5;
  const distance = Math.abs(minute - window.anchorMinute);
  const range = Math.max(window.anchorMinute - window.startMinute, window.endMinute - window.anchorMinute);
  const fastingTag = measurement.sourceTags.some((tag) => tag.trim().toLowerCase() === "fasting");
  if (fastingTag && slot === "fasting") return 0.99;
  if (fastingTag && slot !== "fasting") return 0.45;
  return Math.max(0.7, 0.95 - (distance / range) * 0.2);
}

function nextSlot(slot: RoutineSlot): RoutineSlot | undefined {
  const index = orderedSlots.indexOf(slot);
  return index >= 0 ? orderedSlots[index + 1] : undefined;
}

function isNearNextSlotBoundary(measurement: ImportedGlucoseMeasurement, slot: RoutineSlot, windows: SlotWindow[]): boolean {
  const following = nextSlot(slot);
  const followingWindow = windows.find((candidate) => candidate.slot === following);
  if (!followingWindow) return false;
  return followingWindow.startMinute - toMinutes(measurement.localTime) <= contextualAdjacentSlotWindowMinutes;
}

function assignment(
  measurement: ImportedGlucoseMeasurement,
  slot: RoutineSlot | undefined,
  status: ClassificationStatus,
  confidence: number,
  alternatives?: SlotAlternative[],
): RoutineSlotAssignment {
  return { measurementId: measurement.id, slot, status, confidence, alternatives };
}

function resolveDay(
  measurements: ImportedGlucoseMeasurement[],
  excludedMeasurementIds: Set<string>,
  windows: SlotWindow[],
): RoutineSlotAssignment[] {
  const candidates = measurements
    .filter((measurement) => !excludedMeasurementIds.has(measurement.id))
    .map((measurement) => ({
      measurement,
      slot: inferRoutineSlot(measurement.localTime, windows),
    }));
  const bySlot = new Map<RoutineSlot, typeof candidates>();
  candidates.forEach((candidate) => {
    if (!candidate.slot) return;
    const entries = bySlot.get(candidate.slot) ?? [];
    entries.push(candidate);
    bySlot.set(candidate.slot, entries);
  });
  const assignments = new Map<string, RoutineSlotAssignment>();

  candidates.forEach(({ measurement, slot }) => {
    if (!slot) assignments.set(measurement.id, assignment(measurement, undefined, "ambiguous", 0.3));
  });

  bySlot.forEach((entries, slot) => {
    entries.sort((a, b) => a.measurement.localTime.localeCompare(b.measurement.localTime));
    if (entries.length === 1) {
      const candidate = entries[0];
      assignments.set(
        candidate.measurement.id,
        assignment(candidate.measurement, slot, "confirmed", timeEvidence(candidate.measurement, slot, windows)),
      );
      return;
    }

    const followingSlot = nextSlot(slot);
    const followingSlotIsEmpty = followingSlot !== undefined && !bySlot.has(followingSlot);
    const first = entries[0];
    const last = entries.at(-1)!;
    if (entries.length === 2 && followingSlot && followingSlotIsEmpty && first.measurement.localTime < last.measurement.localTime && isNearNextSlotBoundary(last.measurement, slot, windows)) {
      assignments.set(
        first.measurement.id,
        assignment(first.measurement, slot, "confirmed", timeEvidence(first.measurement, slot, windows)),
      );
      assignments.set(
        last.measurement.id,
        assignment(last.measurement, followingSlot, "inferred", 0.65, [
          { slot, confidence: 0.45 },
        ]),
      );
      return;
    }

    entries.forEach(({ measurement }) => {
      assignments.set(
        measurement.id,
        assignment(measurement, slot, "ambiguous", 0.5, [
          { slot, confidence: 0.5 },
          ...(followingSlot ? [{ slot: followingSlot, confidence: 0.35 }] : []),
        ]),
      );
    });
  });

  return measurements
    .filter((measurement) => !excludedMeasurementIds.has(measurement.id))
    .map((measurement) => assignments.get(measurement.id)!)
    .filter(Boolean);
}

export function resolveDailySlotCollisions(
  measurements: ImportedGlucoseMeasurement[],
  excludedMeasurementIds: Set<string> = new Set(),
  windows: SlotWindow[] = defaultSlotWindows,
): RoutineSlotAssignment[] {
  const byDate = new Map<string, ImportedGlucoseMeasurement[]>();
  measurements.forEach((measurement) => {
    const entries = byDate.get(measurement.localDate) ?? [];
    entries.push(measurement);
    byDate.set(measurement.localDate, entries);
  });

  return [...byDate.entries()]
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .flatMap(([, dayMeasurements]) => resolveDay(dayMeasurements, excludedMeasurementIds, windows));
}
