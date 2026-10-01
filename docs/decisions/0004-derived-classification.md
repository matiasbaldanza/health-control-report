# ADR-0004: Classification is derived; imported source data is immutable

- Status: Accepted
- Date: 2026-10-01

## Context
Tags are optional/unreliable and future classification logic may improve. Users need to correct inferred meal slots without corrupting source history.

## Decision
Store normalized imports as immutable records. Store routine-slot assignment, event membership, and human corrections separately as derived state.

## Consequences
Algorithms can be changed or re-run while preserving provenance. Storage is slightly more complex than editing rows in place.
