# Data model

## ImportedGlucoseMeasurement
Immutable normalized record derived from one source row.

```ts
interface ImportedGlucoseMeasurement {
  id: string;                  // canonical identity
  measuredAtInstant?: string;  // ISO-8601 UTC when parseable
  localDate: string;           // YYYY-MM-DD
  localTime: string;           // HH:mm:ss
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
```

## ClassificationOverride
```ts
type RoutineSlot = "fasting" | "lunch" | "afternoon_snack" | "dinner";

type MeasurementRole = "routine" | "event_followup" | "unclassified";
type ClassificationStatus = "confirmed" | "inferred" | "ambiguous";

interface MeasurementClassification {
  measurementId: string;
  role: MeasurementRole;
  slot?: RoutineSlot;
  assignmentSource: "time-inferred" | "manual";
  status: ClassificationStatus;
  confidence?: number; // heuristic ranking, not clinical confidence
  alternatives?: Array<{ slot: RoutineSlot; confidence: number }>;
  updatedAt: string;
}
```

## EventCandidate / ConfirmedEvent
```ts
interface EventCandidate {
  id: string;
  measurementIds: string[];
  startAt: string;
  endAt: string;
  reasons: EventDetectionReason[];
  status: "pending" | "confirmed" | "ignored";
}

interface ConfirmedEvent extends EventCandidate {
  status: "confirmed";
  label?: string;
  note?: string;
}
```

## PatientMetadata
```ts
interface PatientMetadata {
  displayName?: string;
  slotConfiguration: SlotConfiguration;
}
```

## RegimenVersion
```ts
interface RegimenVersion {
  id: string;
  effectiveFrom: string;
  effectiveTo?: string;
  text: string;
}
```

## Imports
An import batch records source filename, hash when available, imported timestamp, total rows, inserted rows, duplicate rows, and conflicts.

File hash is useful for UX (“this exact file was imported before”) but is not the measurement deduplication key because different exports may overlap.
