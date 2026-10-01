# Validation strategy

## Levels
### Unit tests
Pure domain tests for:
- timestamp parsing
- identity construction
- dedup/conflict behavior
- slot classification
- event grouping
- statistics

### Importer tests
Use synthetic mySugr CSV fixtures matching the observed column schema. Do not commit real patient data.

### Golden report tests
Use synthetic monthly data to verify the report view model and, where practical, snapshot print HTML.

### Manual print checks
For each release affecting reporting:
- print preview on A4
- save PDF
- verify one-page monthly layout under typical data volume
- test a month with no events
- test a month with one short event
- test a month that requires an event-detail page

## Critical dedup tests
1. Import same fixture twice -> stored count unchanged on second import.
2. Import overlapping fixture -> only unseen timestamps inserted.
3. Same exact timestamp/value -> duplicate.
4. Same exact timestamp/different value -> conflict.
5. Two readings two minutes apart -> two distinct records.

## Critical classification tests
1. Only a morning reading exists -> fasting slot by time.
2. Only a midday reading exists -> lunch slot by time, even though it is first reading of day.
3. Overnight reading -> unclassified/event candidate, not automatically dinner.
4. Extra same-window readings -> ambiguity/event logic; never discard.

## Critical event tests
Use synthetic sequences modeled on recheck patterns but with non-identifying dates/values.

Example fixture:

```text
22:20  420
22:24  405
00:20  235
01:15  160
02:05  145
10:00  150
```

Expected:
- first five can form one possible event spanning midnight;
- 10:00 is a later routine fasting candidate, not automatically part of the event;
- all six readings remain distinct;
- event requires user confirmation.

The M0 regression suite also covers:
- four routine readings in one day -> no event;
- high/low notices in routine slots -> visual flags, no event;
- high and low triggers with rapid rechecks -> one candidate each;
- cross-midnight grouping -> one candidate;
- the next routine morning reading -> excluded from the candidate;
- abnormal values separated by normal meal cadence -> no event.

## Private-data verification
When validating against a user's real export, keep it outside version control. Record only aggregate expected results in a local ignored file if needed.
