# Reporting specification

## Goal
Produce a compact Spanish report optimized for printing and clinician review, not a replica of mySugr's own weekly PDF.

## Pagination
Default: one A4 page per calendar month.

Prefer landscape if it improves legibility of five columns plus value/time pairs. Validate on A4 paper and browser PDF output.

## Main table
Recommended structure: weekly blocks, mirroring the user's existing handwritten form because it scans well and leaves room for annotations.

Columns:
- Día
- Ayunas / antes desayuno
- Antes almuerzo
- Antes merienda
- Antes cena

Cell format:

```text
135 · 09:55
```

Event marker:

```text
486 · 22:31  E1
```

## Missing data
Blank cell = no routine measurement recorded for that slot. Do not print “missed”.

## Ambiguous/unreviewed data
Do not silently print an uncertain assignment as authoritative. Use a small review warning in preview; printing may either include a subtle marker or block final export until ambiguity is acknowledged. Decide during MVP usability testing.

## Summary area
Compact monthly statistics:
- Lecturas
- Promedio
- Mínimo
- Máximo
- <70
- 70–180
- 181–250
- >250

Optional by-slot summary if space allows.

## Events area
When short, render confirmed events at the bottom of the monthly page.

If details overflow, keep the monthly page unchanged and add `Detalle de eventos — <mes>` as an optional second page.

## Medication and contextual metadata
Show the regimen version effective for the report period in a compact footer/section.

Do not duplicate full medication history on every page when a short current-period summary is sufficient.

## Print implementation
Use semantic HTML and dedicated print CSS first. Avoid PDF-generation libraries unless browser printing fails acceptance criteria.

Acceptance:
- no clipped rows
- no split weekly block across pages when avoidable
- readable at 100% A4 print scale
- stable Chrome/Chromium output
- hides all interactive UI controls in print mode
