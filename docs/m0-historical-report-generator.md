# M0 — Historical report generator

## Goal
Produce printable monthly glucose-control sheets immediately from a mySugr CSV, before the interactive application is complete.

This is the first vertical slice of the real product, not a separate throwaway project.

## Command

```bash
node scripts/generate-historical-reports.mjs /path/to/mySugr.csv \
  --months 2026-06,2026-07,2026-08 \
  --out reports/june-july-august-2026.html
```

Open the HTML in a browser and use Print → Save as PDF. Print in landscape orientation, 100% scale, with browser headers/footers disabled.

## Current behavior
- Reads the original mySugr CSV without modifying it.
- Selects requested calendar months.
- Infers routine slots from local time:
  - 06:00–11:59: ayunas/desayuno
  - 12:00–16:59: almuerzo
  - 17:00–20:29: merienda
  - 20:30–23:59: cena
  - 00:00–05:59: extra/unclassified
- Preserves every measurement. Measurements close in time are never deduplicated.
- Adds a subtle “valor señalado” indicator to routine values below 100 or above 200 mg/dL.
- Produces one A4-landscape page per month.
- Shows count, mean, min/max, and range counts.
- Flags only abnormal-trigger/recheck sequences with successive gaps of at most 120 minutes for human review.

## Important limitation
Event detection is intentionally heuristic. A detected event is a review aid, not a clinical conclusion. It must not invent treatment, cause, diagnosis, or interpretation.

## M0 acceptance criteria
1. The command runs with Node 22 without requiring npm dependencies.
2. June, July, and August 2026 each render as their own printable page when present in the CSV.
3. Every glucose row in a requested month remains represented either in a routine slot or event/additional measurements.
4. Repeated measurements minutes apart remain separate records.
5. Source tags do not determine routine slots.
6. The generator never edits the source CSV.
7. Generated output contains no clinical treatment recommendations.
8. Routine measurements in separate meal slots do not become events merely because they occur on the same day.
9. A threshold notice without a rapid subsequent recheck remains in its routine slot and is not listed as an event.

## Next iteration
Compare the generated June–August sheets against the source data by hand, identify incorrect routine/event assignments, then move the proven parsing/classification/reporting rules into the typed domain modules used by the interactive app.
