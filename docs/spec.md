# Product specification

## Purpose
Generate a printable, one-page-per-month glucose control sheet from mySugr CSV exports without manually transcribing measurements.

The app must preserve imported measurements, avoid duplicate records across overlapping exports, infer the patient's usual four daily monitoring slots from time of day, flag clusters that may represent a glucose excursion/recheck event, and allow a human to confirm or edit the interpretation before printing.

The first version is Spanish-first and local-first.

## Primary workflow
1. User imports one or more mySugr CSV files.
2. Importer parses and normalizes glucose measurements.
3. App deduplicates overlapping exports.
4. App assigns routine measurements to one of four expected daily slots when plausible:
   - Ayunas / antes del desayuno
   - Antes del almuerzo
   - Antes de la merienda
   - Antes de la cena
5. App detects possible event clusters and marks them for review.
6. User confirms/ignores/edits event grouping and may add notes.
7. User selects one or more calendar months.
8. App renders one A4 page per month and prints/saves to PDF via the browser.

## Source behavior
mySugr tags are optional and unreliable for slot assignment. Preserve them as source metadata, but do not use them as the authoritative source for breakfast/lunch/merienda/dinner classification.

The currently observed mySugr CSV contains these columns:

```text
Date
Time
Tags
Blood Sugar Measurement (mg/dL)
Insulin Injection Units (Pen)
Basal Injection Units
Insulin Injection Units (pump)
Insulin (Meal)
Insulin (Correction)
Temporary Basal Percentage
Temporary Basal Duration (Minutes)
Meal Carbohydrates (Grams, Factor 1)
Meal Descriptions
Activity Duration (Minutes)
Activity Intensity (1: Cosy, 2: Ordinary, 3: Demanding)
Activity Description
Steps
Note
Location
Blood pressure
Body weight (kg)
HbA1c (Percent)
Ketones
Food type
Medication
Timezone
Latitude
Longitude
```

Only a subset is required for v1: Date, Time, Tags, Blood Sugar Measurement, Note, Timezone. Preserve raw rows so future versions can use additional columns.

## Deduplication
Canonical identity for a glucose measurement:

```text
glucose + normalized exact timestamp
```

Rules:
- Same identity and same glucose value: duplicate; ignore on re-import.
- Same identity but different glucose value: conflict; never silently overwrite or duplicate. Require review.
- Different timestamp: different measurement, even if seconds or minutes apart and even if the value is identical.
- If a future source exposes a stable event/measurement ID, prefer that ID while retaining the timestamp rule as a compatibility check.

## Four-slot model
The normal prescribed pattern is four routine measurements per day, but actual days may contain 0–4 routine measurements. A temporary strip-saving regime may result in only one routine measurement on a given day, rotating among slots across days.

Therefore:
- Never infer a slot from ordinal position such as “first measurement of the day”.
- Infer primarily from local clock time and patient-specific slot anchors/windows.
- Missing cells mean “no recorded routine measurement for this slot”; they do not automatically mean non-compliance.
- User can override a derived slot without modifying the original source row.

## Possible events
Some days contain multiple rechecks over a few hours following an unusually low or high value. These readings are legitimate distinct measurements and should not be forced into the four routine slots.

The app must detect possible events heuristically, then require human confirmation.

A confirmed event has:
- start/end timestamps
- member measurement IDs
- trigger/reason category if known (optional)
- free-text note
- confirmation state
- link to any routine measurement from which the event began, when applicable

The software may describe numeric progression but must not invent treatment, cause, diagnosis, or clinical interpretation.

## Monthly report
One A4 page per calendar month by default.

Main table columns:
- Día
- Ayunas / antes desayuno
- Antes almuerzo
- Antes merienda
- Antes cena

Each populated cell shows glucose value and local time.

If a routine measurement participates in or initiates a confirmed event, show a compact event marker such as `E1`.

Event follow-up readings do not occupy routine slot cells. They appear in a compact “Eventos del mes” section when space permits. If event detail would make the month overflow one page, generate a separate optional “Detalle de eventos” page while keeping the main monthly page stable.

## Monthly metrics
Display mechanically computed statistics only:
- number of glucose readings
- average
- minimum
- maximum
- count < 70 mg/dL
- count 70–180 mg/dL
- count 181–250 mg/dL
- count > 250 mg/dL

Optional compact per-slot metrics:
- count
- average
- minimum
- maximum

Do not label control as good/bad, safe/unsafe, compliant/non-compliant, or otherwise make clinical judgments.

## Estimated HbA1c
Not required for v1. The observed CSV does not reliably provide an estimated HbA1c value even when mySugr's PDF report displays one. If added later, distinguish laboratory HbA1c from any calculated estimate and document the formula and limitations.

## Patient/report metadata
Editable separately from imported measurements:
- patient display name
- medication/regimen text
- effective dates for regimen changes
- last/next control dates
- laboratory HbA1c, if manually entered
- general report notes

Medication metadata must be versioned/effective-dated so a past monthly report can display the regimen applicable to that month.

## Privacy and persistence
- No backend in v1.
- Data stored locally in IndexedDB.
- No telemetry containing health data.
- Provide a future-safe path for explicit local backup/export.
- Never commit real patient CSV/PDF exports to the repository.

## Language
UI and printed report: Spanish.
Source code/types/tests: English is acceptable and preferred for consistency.

## MVP acceptance criteria
- Re-importing an overlapping CSV does not duplicate measurements.
- Measurements seconds/minutes apart remain distinct.
- Slot inference works when only one of four daily routine measurements exists.
- User can manually correct slot assignment.
- Possible recheck clusters are flagged, not automatically declared as medical events.
- User can confirm/ignore/edit a possible event and add a note.
- Confirmed event follow-ups stay out of the four routine cells.
- Selected month prints as one A4 page under ordinary data volume.
- Raw source data remains unchanged after classification edits.
