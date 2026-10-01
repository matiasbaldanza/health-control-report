# Project state

Last updated: 2026-10-01

## Current milestone
M0 — repository/decision baseline complete; ready to begin M1 import and persistence.

## What is decided
- local-first browser app
- mySugr CSV is canonical import
- exact timestamp identifies glucose measurements when no stable source ID exists
- imported source data is immutable; classifications are derived
- event detection is heuristic and must be human-confirmed
- browser print CSS is the first PDF/print strategy

## What is intentionally still open
- exact production dependency versions and lockfile
- final default slot windows/anchors
- event detector thresholds beyond seed values
- whether report preview blocks printing on unresolved ambiguity or merely warns
- whether adaptive patient-specific anchors belong in MVP or post-MVP
- physical A4 orientation after print testing

## Current risks
1. mySugr export date/time formatting may vary by locale/app version.
2. timestamp-only identity may need revision if future exports produce collisions.
3. event heuristics may generate false positives until tested on several months.
4. one-page monthly print may require layout compromises when event notes are long.

## Next concrete task
Implement M1: mySugr CSV parsing, normalization, import summary, IndexedDB persistence, and dedup/conflict tests.


## Immediate implementation priority

M0 historical report generator is now the current vertical slice. Validate June–August printable output before expanding the interactive application. See `docs/m0-historical-report-generator.md`.
