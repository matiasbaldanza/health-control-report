import type { EventCandidate, EventDetectionReason, ImportedGlucoseMeasurement } from "./types";

export interface EventDetectionConfig {
  noticeLowThreshold: number;
  noticeHighThreshold: number;
  eventFollowupWindowMinutes: number;
}

export const noticeLowThreshold = 100;
export const noticeHighThreshold = 200;
export const eventFollowupWindowMinutes = 120;

export const defaultEventDetectionConfig: EventDetectionConfig = {
  noticeLowThreshold,
  noticeHighThreshold,
  eventFollowupWindowMinutes,
};

export function isNotice(
  reading: Pick<ImportedGlucoseMeasurement, "valueMgDl">,
  config: EventDetectionConfig = defaultEventDetectionConfig,
): boolean {
  return reading.valueMgDl < config.noticeLowThreshold || reading.valueMgDl > config.noticeHighThreshold;
}

export function noticeReasons(
  reading: Pick<ImportedGlucoseMeasurement, "valueMgDl">,
  config: EventDetectionConfig = defaultEventDetectionConfig,
): EventDetectionReason[] {
  const reasons: EventDetectionReason[] = [];
  if (reading.valueMgDl < config.noticeLowThreshold) reasons.push("low_threshold");
  if (reading.valueMgDl > config.noticeHighThreshold) reasons.push("high_threshold");
  return reasons;
}

function localTimestamp(measurement: ImportedGlucoseMeasurement): number {
  const [year, month, day] = measurement.localDate.split("-").map(Number);
  const [hour, minute, second = 0] = measurement.localTime.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute, second);
}

function minutesBetween(previous: ImportedGlucoseMeasurement, next: ImportedGlucoseMeasurement): number {
  return (localTimestamp(next) - localTimestamp(previous)) / 60_000;
}

export function detectPossibleEvents(
  measurements: ImportedGlucoseMeasurement[],
  config: EventDetectionConfig = defaultEventDetectionConfig,
): EventCandidate[] {
  const sorted = [...measurements].sort((a, b) => localTimestamp(a) - localTimestamp(b));
  const includedMeasurementIds = new Set<string>();
  const candidates: EventCandidate[] = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const trigger = sorted[index];
    if (includedMeasurementIds.has(trigger.id) || !isNotice(trigger, config)) continue;

    const firstFollowup = sorted[index + 1];
    if (!firstFollowup || minutesBetween(trigger, firstFollowup) > config.eventFollowupWindowMinutes) continue;

    const members = [trigger];
    let previous = trigger;
    for (let memberIndex = index + 1; memberIndex < sorted.length; memberIndex += 1) {
      const measurement = sorted[memberIndex];
      if (minutesBetween(previous, measurement) > config.eventFollowupWindowMinutes) break;
      members.push(measurement);
      previous = measurement;
    }

    if (members.length < 2) continue;

    const reasons = [...noticeReasons(trigger, config), "rapid_recheck" as const];
    candidates.push({
      id: `E${candidates.length + 1}`,
      measurementIds: members.map((measurement) => measurement.id),
      startAt: trigger.measuredAtInstant ?? `${trigger.localDate}T${trigger.localTime}`,
      endAt: members.at(-1)!.measuredAtInstant ?? `${members.at(-1)!.localDate}T${members.at(-1)!.localTime}`,
      reasons,
      status: "pending",
    });
    members.forEach((measurement) => includedMeasurementIds.add(measurement.id));
  }

  return candidates;
}

export const detectEvents = detectPossibleEvents;

export function thresholdReasons(
  valueMgDl: number,
  config: EventDetectionConfig = defaultEventDetectionConfig,
): EventDetectionReason[] {
  return noticeReasons({ valueMgDl }, config);
}
