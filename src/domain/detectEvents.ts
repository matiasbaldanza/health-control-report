import type { EventCandidate, EventDetectionReason, ImportedGlucoseMeasurement } from "./types";

export interface EventDetectionConfig {
  eventGapMinutes: number;
  denseClusterCount: number;
  denseClusterWindowMinutes: number;
  lowThresholdMgDl: number;
  highThresholdMgDl: number;
}

export const defaultEventDetectionConfig: EventDetectionConfig = {
  eventGapMinutes: 120,
  denseClusterCount: 3,
  denseClusterWindowMinutes: 240,
  lowThresholdMgDl: 70,
  highThresholdMgDl: 250,
};

// Skeleton only: implement with explainable, test-covered heuristics before use.
export function detectPossibleEvents(
  _measurements: ImportedGlucoseMeasurement[],
  _config: EventDetectionConfig = defaultEventDetectionConfig,
): EventCandidate[] {
  return [];
}

export function thresholdReasons(
  valueMgDl: number,
  config: EventDetectionConfig = defaultEventDetectionConfig,
): EventDetectionReason[] {
  const reasons: EventDetectionReason[] = [];
  if (valueMgDl < config.lowThresholdMgDl) reasons.push("low_threshold");
  if (valueMgDl > config.highThresholdMgDl) reasons.push("high_threshold");
  return reasons;
}
