# ADR-0008: Resolve routine-slot collisions with daily context

- Status: Accepted for M0
- Date: 2026-10-01

## Context
Fixed time windows are explainable but can produce a misleading report when
two ordinary readings land in one slot and the next adjacent slot is empty.
For example, a late Merienda reading followed by an early dinner may otherwise
appear as two Merienda values. Event follow-ups must not be redistributed as
routine readings while solving this problem.

## Decision
Keep the existing local-time windows as first-pass candidates. After event
detection and removal of event follow-ups, resolve daily collisions as derived
classification:

- a unique time-based assignment is `confirmed`;
- when exactly two readings collide, the later reading may move to the next
  adjacent empty slot if it is within 120 minutes of that slot’s start and
  chronology is compatible with the expected daily order; that assignment is
  `inferred`;
- unresolved collisions remain in their time-derived slot as `ambiguous`;
- inferred readings receive a subtle `*` report marker and ambiguous readings a
  `?` marker;
- imported timestamp, value, tags, and provenance are never changed;
- tags provide supporting evidence only. `Fasting` may strengthen fasting
  confidence; generic `Before meal` does not identify a specific meal slot.

Event detection always runs before collision resolution. Event follow-ups are
excluded from the resolver and remain in the event presentation.

## Alternatives considered

- Move the global Merienda/Cena boundary earlier: rejected because one early
  dinner should not change classification for the entire history.
- Use fourth-reading ordinal position: rejected because sparse days and event
  follow-ups make ordinal position unreliable.
- Silently move every later collision to the next slot: rejected because the
  evidence is not always sufficient.
- Leave every collision duplicated without context: rejected because it makes
  the report misleading when an adjacent slot is clearly empty.

## Consequences

The report can express useful daily context without pretending that an inferred
slot is source truth. Some inferred assignments will require human correction,
and unresolved cases remain visible for review. The interactive MVP can persist
manual overrides as derived metadata.

## Evidence / assumptions

See A-008 and `tests/resolveDailySlotCollisions.test.ts`.

## Revisit when

Manually review several months of inferred and ambiguous assignments, or when
patient-specific schedule configuration becomes available.
