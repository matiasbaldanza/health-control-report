export type RoutineSlot = "fasting" | "lunch" | "afternoon_snack" | "dinner";
export type MeasurementRole = "routine" | "event_followup" | "unclassified";
export type ClassificationStatus = "confirmed" | "inferred" | "ambiguous";

export interface SlotAlternative {
  slot: RoutineSlot;
  confidence: number;
}

export interface ImportedGlucoseMeasurement {
  id: string;
  measuredAtInstant?: string;
  localDate: string;
  localTime: string;
  timezone?: string;
  valueMgDl: number;
  source: "mysugr-csv";
  sourceTags: string[];
  sourceNote?: string;
  provenance: {
    importId: string;
    fileName: string;
    rowNumber: number;
    raw: Record<string, string>;
  };
}

export interface MeasurementClassification {
  measurementId: string;
  role: MeasurementRole;
  slot?: RoutineSlot;
  assignmentSource: "time-inferred" | "manual";
  status: ClassificationStatus;
  confidence?: number;
  alternatives?: SlotAlternative[];
  updatedAt: string;
}

export type EventDetectionReason =
  | "dense_cluster"
  | "rapid_recheck"
  | "low_threshold"
  | "high_threshold"
  | "overnight_followup"
  | "large_excursion";

export interface EventCandidate {
  id: string;
  measurementIds: string[];
  startAt: string;
  endAt: string;
  reasons: EventDetectionReason[];
  status: "pending" | "confirmed" | "ignored";
  note?: string;
}
