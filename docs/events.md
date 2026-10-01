# Possible event detection

## Purpose
Surface measurement clusters that may represent a glucose excursion followed by rechecks. Detection is a review aid, not a diagnosis or treatment rule.

## Principles
- Every measurement remains a distinct source record.
- Detection must be explainable: store reasons that caused the candidate to be flagged.
- A candidate is not a confirmed event until a user confirms it.
- The app may summarize numeric progression; it must not invent causes, interventions, or clinical conclusions.

## M0 heuristics
Keep these values explicit and configurable in the domain layer and historical report generator:

```text
noticeLowThreshold = 100 mg/dL
noticeHighThreshold = 200 mg/dL
eventFollowupWindowMinutes = 120
```

`isNotice(reading)` is independent from `detectEvents(readings)`:

- a notice is a routine measurement below 100 or above 200 mg/dL;
- a notice receives a neutral visual indicator such as “valor señalado”;
- a notice by itself is never an event.

An event candidate requires an abnormal trigger and at least one subsequent
measurement within 120 minutes. The detector then includes successive
measurements while each gap remains at most 120 minutes. This allows a
recheck sequence to cross midnight while excluding ordinary 3–6 hour meal-slot
measurements. Prefer false negatives over false positives.

## Candidate grouping
The detector sorts by local timestamp, starts only from an ungrouped notice,
and stops at the first gap greater than the follow-up window. Event membership
is derived and does not alter imported measurements or their routine-slot
classification source data.

## User actions
For each candidate:
- Confirmar
- Ignorar
- Editar rango/miembros
- Agregar nota

Optional fields:
- label/category chosen by the user
- recorded intervention text
- contextual notes

## Printed narrative
Generate factual text from measurements, for example:

```text
E1 · 11–12/09: 486 mg/dL a las 22:31; control posterior: 466 (22:33),
242 (00:29), 153 (01:33) y 144 (02:11). Próxima medición habitual: ...
```

The exact wording should be editable and should never assert an unrecorded treatment or cause.
