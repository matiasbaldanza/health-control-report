# Roadmap

## M0 — Repository and decision baseline
- [x] Documentation structure
- [x] Initial ADRs
- [x] Domain skeleton
- [ ] Install and lock dependencies
- [ ] CI for typecheck/tests

## M1 — Import and persistence
- [ ] Parse mySugr CSV
- [ ] Normalize date/time/timezone
- [ ] Compute canonical identity
- [ ] IndexedDB schema
- [ ] Duplicate/conflict import summary
- [ ] Measurement browser

Exit criteria: same/overlapping exports can be imported repeatedly without duplicated measurements.

## M2 — Routine classification
- [ ] Configurable four-slot schedule
- [ ] Time-based inference
- [ ] Ambiguity handling
- [ ] Manual slot override

Exit criteria: sparse/rotating measurement days classify by time rather than order.

## M3 — Event review
- [ ] Candidate detector
- [ ] Explainable reasons
- [ ] Confirm / ignore / edit membership
- [ ] Event notes
- [ ] Cross-midnight events

Exit criteria: dense high/low recheck patterns can be reviewed without losing individual measurements.

## M4 — Monthly report
- [ ] Weekly-block monthly table
- [ ] Value + time in each routine cell
- [ ] Event markers
- [ ] Monthly statistics
- [ ] Regimen metadata
- [ ] A4 print CSS
- [ ] Optional event-detail page

Exit criteria: selected month prints legibly on one A4 page under typical data volume.

## M5 — Hardening
- [ ] Backup/export of local app state
- [ ] Import migration/versioning
- [ ] Better adaptive slot anchors if justified by evidence
- [ ] Accessibility pass

## Later / explicitly out of MVP
- Omron Connect importer
- blood-pressure reports
- multi-user accounts
- cloud sync
- automatic clinical recommendations
- independent HbA1c estimation unless separately specified and validated
