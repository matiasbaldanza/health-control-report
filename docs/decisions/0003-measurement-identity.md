# ADR-0003: Measurement identity uses type + exact timestamp

- Status: Accepted for v1
- Date: 2026-10-01

## Context
Exports can overlap. Recheck measurements may occur minutes apart and must remain distinct. Current CSV does not expose a stable source event ID.

## Decision
Use `measurementType + normalized exact timestamp` as canonical identity for glucose records.

Same identity/same value is a duplicate. Same identity/different value is a conflict. Different timestamps are different records regardless of proximity or value.

## Consequences
This safely preserves dense recheck clusters. It depends on mySugr continuing to export timestamps with sufficient precision.

## Revisit when
A stable source measurement ID becomes available or real exports produce legitimate timestamp collisions.
