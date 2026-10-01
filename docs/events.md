# Possible event detection

## Purpose
Surface measurement clusters that may represent a glucose excursion followed by rechecks. Detection is a review aid, not a diagnosis or treatment rule.

## Principles
- Every measurement remains a distinct source record.
- Detection must be explainable: store reasons that caused the candidate to be flagged.
- A candidate is not a confirmed event until a user confirms it.
- The app may summarize numeric progression; it must not invent causes, interventions, or clinical conclusions.

## Seed heuristics
Keep thresholds configurable.

Candidate signals may include:
1. `dense_cluster`: >= 3 measurements within 4 hours.
2. `rapid_recheck`: another measurement within 120 minutes of the prior one.
3. `low_threshold`: reading below a configured review threshold (seed: 70 mg/dL; optionally a separate attention threshold such as 80 if the care plan calls for it).
4. `high_threshold`: reading above a configured review threshold (seed: 250 mg/dL).
5. `overnight_followup`: one or more readings during the overnight period following an abnormal late-evening reading.
6. `large_excursion`: substantial change over a short interval; exact threshold remains an explicit assumption until validated.

Do not create one event from a single threshold crossing if there is no recheck pattern unless the user wants single-point events. For MVP, single abnormal points may be highlighted separately while clusters drive event candidates.

## Candidate grouping
Suggested approach:
- sort by exact timestamp;
- connect measurements whose gap is <= configurable `eventGapMinutes` (seed: 120);
- create a candidate when the connected sequence also satisfies at least one event signal and has >= 2 readings;
- allow extending across midnight;
- stop the event after a long gap; a following routine morning reading can be shown as “next routine measurement” without necessarily being part of the event.

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
