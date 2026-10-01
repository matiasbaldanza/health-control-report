# Routine slot classification

## Goal
Assign plausible routine readings to four daily slots without depending on unreliable mySugr tags or measurement order.

## Initial slots
Spanish labels:
- Ayunas / antes del desayuno
- Antes del almuerzo
- Antes de la merienda
- Antes de la cena

## Core rule
Use local clock time as the first-pass candidate, not “first/second/third/fourth
reading of day”. Then resolve same-day slot collisions using daily context.

This is necessary because:
- some days contain only 1–3 routine measurements;
- a strip-saving regime may rotate a single daily measurement among the four slots;
- event rechecks may produce extra measurements between routine slots.

## Configurable anchors
Start with editable anchors/windows. Initial defaults are implementation defaults, not medical rules.

Example seed configuration:

```text
fasting          anchor 09:30, eligible 06:00–11:59
lunch            anchor 14:30, eligible 12:00–16:59
afternoon_snack  anchor 18:30, eligible 17:00–20:29
dinner           anchor 21:30, eligible 20:30–23:59
```

Overnight readings default to unclassified unless they are grouped into an event or manually assigned.

## Adaptive option
After enough historical routine data exists, calculate robust patient-specific anchors (median local time per slot) using confirmed routine classifications. Do not let event follow-up readings train the anchors.

This adaptive behavior is post-MVP unless the first implementation remains simple and well-tested.

## Classification pipeline

Run the stages in this order:

1. detect abnormal-value notices;
2. detect recheck/event sequences;
3. remove event follow-ups from routine-slot assignment;
4. assign remaining readings by local time;
5. resolve daily slot collisions using chronology and adjacent empty slots;
6. apply manual overrides without changing imported data.

The resolver uses three derived assignment states:

- `confirmed`: time and context support the slot directly;
- `inferred`: daily context supports an adjacent slot, but the assignment is
  still a heuristic;
- `ambiguous`: the available evidence is insufficient to choose safely.

When two non-event readings collide in one slot, the resolver may move the
later reading to the next adjacent slot only when that slot is empty, the later
reading is within the configured 120-minute contextual boundary window, and
the chronology is compatible with the expected breakfast → lunch → merienda →
dinner sequence. The report marks that reading with `*` and explains it as
“horario inferido por contexto diario”. Unresolved collisions remain in their
time-derived slot with a `?` review marker rather than being silently rewritten.

## Multiple candidates in one slot/day
Do not discard data.

If event detection explains the extras, exclude event follow-ups before
collision resolution. Never redistribute an event follow-up into another meal
slot.

Otherwise use the contextual resolver above. Never silently choose by
highest/lowest glucose value.

## Tags
Tags may contribute weak supporting evidence but cannot override time or daily
context automatically. `Fasting` is strong evidence for the fasting slot;
generic `Before meal` does not distinguish lunch, merienda, and dinner.

## Manual override
A manual override changes only derived classification. It never changes imported timestamp, glucose value, source tags, or raw row.
