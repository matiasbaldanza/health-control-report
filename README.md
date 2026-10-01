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
