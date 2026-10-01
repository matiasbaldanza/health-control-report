# ADR-0002: CSV as canonical mySugr import

- Status: Accepted
- Date: 2026-10-01

## Context
mySugr can export PDF, Excel, and CSV. The PDF is useful for human validation but CSV preserves row-level measurements in a machine-readable form.

## Decision
Use CSV as the canonical ingestion format. Use mySugr PDF reports only as validation/reference material.

## Consequences
- importer can be deterministic and testable
- overlapping exports are easy to merge
- report UI does not depend on PDF parsing
