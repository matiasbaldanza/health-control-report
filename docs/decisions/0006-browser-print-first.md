# ADR-0006: Use browser print CSS before a PDF library

- Status: Accepted for v1
- Date: 2026-10-01

## Context
The desired output is a simple one-page-per-month A4 report. A dedicated PDF engine adds complexity.

## Decision
Implement reports as HTML with print-specific CSS and use browser Print / Save as PDF first.

## Consequences
Fast implementation and easy preview. If pagination proves unstable, record a new ADR before adding a PDF-generation dependency.
