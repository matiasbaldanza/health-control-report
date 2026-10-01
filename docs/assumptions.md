# Assumption register

Assumptions are hypotheses, not decisions. Update status as evidence appears.

| ID | Assumption | Status | Evidence / rationale | How to test or falsify |
|---|---|---|---|---|
| A-001 | mySugr CSV will continue to include exact date, time, glucose value, and timezone. | Open | Observed in current export. | Import exports from later app versions/devices. |
| A-002 | Exact timestamp is sufficient as the primary identity within glucose measurements when no stable source ID exists. | Tentatively accepted | Current history has no same-timestamp legitimate readings; seconds are exported. | Look for collisions across larger exports and device sync behavior. |
| A-003 | Four routine slots are better inferred from clock time than tags or ordinal position. | Accepted for v1 | Tags are optional/unreliable; rotating one-reading days break ordinal logic. | Compare inferred slots against manually known schedule over several months. |
| A-004 | Seed time windows are stable enough to produce useful initial classifications. | Open | Historical times appear clustered. | Measure ambiguity/error rate; adjust or add adaptive anchors. |
| A-005 | A conservative abnormal-trigger plus 120-minute successive-gap heuristic can surface useful recheck events without excessive false positives. | Open | M0 regression fixtures cover normal cadence, notices without events, rapid rechecks, and a cross-midnight excursion; historical precision/recall is still unverified. | Review candidate precision/recall against several months manually. |
| A-008 | Daily chronology can resolve some adjacent-slot collisions within a 120-minute boundary window without changing imported data or global time windows. | Open | Synthetic collision coverage infers a later empty adjacent slot and leaves event follow-ups excluded; historical precision and user review are still needed. | Compare inferred assignments against manually reviewed meal-slot records across several months. |
| A-006 | Browser print CSS is sufficient for reliable A4 reports. | Open | Expected to be adequate for simple tabular output. | Test Chrome/Chromium print-to-PDF and physical A4. |
| A-007 | Local-only IndexedDB is acceptable for v1 persistence. | Accepted for v1 | Single-user, privacy-sensitive workflow. | Revisit if multi-device sync or shared clinical workflow becomes necessary. |

## Updating this file
- `Open`: unverified hypothesis.
- `Tentatively accepted`: enough evidence to build against, but keep easy to reverse.
- `Accepted for v1`: deliberate scope choice, not necessarily permanent.
- `Rejected`: evidence disproved it; link the ADR or issue that changed direction.
