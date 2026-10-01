# Glucose Control Report

Local-first web app for importing mySugr CSV exports, deduplicating blood-glucose measurements, classifying routine measurements into four daily slots, detecting possible monitoring events, and producing a compact Spanish monthly A4 report.

## Status
Skeleton repository / specification-first MVP.

## Intended stack
- Vite
- React
- TypeScript
- IndexedDB via Dexie
- Papa Parse
- Vitest
- Browser print CSS (`@media print`) for PDF/printing

## Quick start (after dependencies are installed)

```bash
npm install
npm run dev
npm test
```

## Documentation
Start with [`docs/README.md`](docs/README.md).

## Privacy
Do not commit real mySugr or Omron exports. Keep patient data local to the browser or in ignored local fixture directories.


## Historical reports (M0)

With Node 22 installed, no npm install is required for the historical generator:

```bash
node scripts/generate-historical-reports.mjs /path/to/mySugr.csv --months 2026-06,2026-07,2026-08 --out reports/june-july-august-2026.html --week-gap-mm 1.5
```

Open the generated HTML in a browser and print/save it as PDF in portrait orientation. See `docs/m0-historical-report-generator.md`.

### Current June–September 2026 report

```bash
node scripts/generate-historical-reports.mjs \
  private-data/mySugr_Export_2026-10-01-08-50.csv \
  --months 2026-06,2026-07,2026-08,2026-09 \
  --out reports/june-july-august-september-2026.html \
  --week-gap-mm 4
```
