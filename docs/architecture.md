# Architecture

## Shape
A single-browser, local-first application. No server is required for v1.

```text
CSV file
  -> mySugr importer
  -> normalized immutable measurement record
  -> dedup/conflict check
  -> IndexedDB
  -> derived slot classification
  -> possible-event detector
  -> human review state
  -> monthly report view model
  -> HTML/CSS print
```

## Boundaries
### Importers
Responsible only for parsing source formats and producing normalized records plus provenance. They do not decide clinical meaning.

### Domain
Pure functions/types for:
- canonical identities
- time-slot classification
- event-candidate detection
- statistics
- report view models

Keep domain logic testable without React or IndexedDB.

### Storage
Persistence and migrations. Raw normalized records are immutable except for conflict-resolution operations explicitly recorded as overrides.

### UI
Import review, measurement browser, classification correction, event review, settings, report preview.

### Reports
Transform domain state into print-specific view models. Print CSS owns pagination.

## Local dates and timezones
Use the source local date/time plus exported timezone. Also derive a normalized instant when possible.

Never classify meal slots using UTC time. Slot classification always uses patient-local clock time from the source record.

## Derived state
Slot assignment and event membership are derived/user-reviewed data, not source truth. Store them separately so algorithms can evolve without mutating imports.

## Future Omron support
Do not implement in v1, but keep importer and measurement domains source-agnostic enough to add blood-pressure records later.

Potential future shape:

```text
importers/mysugr -> GlucoseMeasurement
importers/omron  -> BloodPressureMeasurement
```

Do not prematurely merge report semantics for glucose and blood pressure.
