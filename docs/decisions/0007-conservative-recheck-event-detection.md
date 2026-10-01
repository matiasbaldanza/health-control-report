# ADR-0007: Separate threshold notices from conservative recheck events

- Status: Accepted for M0
- Date: 2026-10-01

## Context
The initial M0 detector grouped broad same-day or dense windows and could
classify ordinary meal-slot measurements as one event. A threshold crossing
and a deliberate follow-up sequence are different reporting concepts.

## Decision
Use separate derived functions for `isNotice(reading)` and
`detectEvents(readings)`.

For M0:

- flag a notice when glucose is `< 100` or `> 200` mg/dL;
- require a notice trigger plus a subsequent measurement within 120 minutes
  to create a candidate event;
- extend the candidate only while successive measurements remain within 120
  minutes;
- allow candidates to cross midnight;
- keep routine measurements in their four time slots, including noticed values;
- prefer false negatives over false positives.

Notice thresholds are reporting/review thresholds, not medical interpretation.
Event candidates remain pending derived data and require human confirmation
under ADR-0005.

## Alternatives considered

- Broad same-day windows: rejected because normal 3–6 hour meal cadence creates
  false positives.
- Single-point threshold events: rejected because a notice alone is not evidence
  of a recheck sequence.
- A dense-cluster requirement of three or more readings: rejected for M0 because
  the minimum accepted recheck sequence contains a trigger and one follow-up.

## Consequences

The report can show neutral value indicators without moving readings out of
routine cells. Genuine rapid sequences are compactly listed as event
candidates, including across midnight. Some real events with a delayed first
recheck may be missed and require manual review.

## Evidence / assumptions

See A-005 and the synthetic regression tests in
`tests/detectEvents.test.ts`.

## Revisit when

Review several months of manually confirmed data and revise the heuristic only
with a new ADR or a superseding decision.
