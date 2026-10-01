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
Use local clock time, not “first/second/third/fourth reading of day”.

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

## Multiple candidates in one slot/day
Do not discard data.

If two or more readings fall in the same slot window:
1. If an event candidate explains the extras, keep the selected routine reading in the slot and classify the others as follow-ups after confirmation.
2. Otherwise mark the slot/day ambiguous for review.
3. Never silently choose by highest/lowest value.

## Tags
Tags may be shown as context. A `Fasting`, `Before meal`, or `After meal` tag can raise/lower heuristic confidence but cannot override time automatically in v1.

## Manual override
A manual override changes only derived classification. It never changes imported timestamp, glucose value, source tags, or raw row.
