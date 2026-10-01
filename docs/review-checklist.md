# Architecture and assumption review checklist

Use this checklist before merging work that changes import semantics, data identity, classification, event detection, persistence, or reporting.

## 1. Source truth
- Does the change preserve original imported rows and provenance?
- Could the change silently alter timestamp, value, tags, or source note?
- Could two legitimate close-together readings be collapsed?

## 2. Decision alignment
- Which ADRs apply?
- Does the change contradict an accepted ADR?
- If yes, create a superseding ADR before implementing the new direction.

## 3. Assumptions
- Which assumption IDs does this change rely on?
- Has new evidence confirmed or weakened any assumption?
- Can the assumption be tested with a synthetic fixture or a private local export?
- Update `assumptions.md` status/evidence when appropriate.

## 4. Reversibility
- Is new behavior derived/recomputable, or does it mutate canonical data?
- Is a schema migration required?
- Can the prior behavior be restored without losing source measurements?

## 5. Clinical-boundary check
- Does the UI/report describe facts versus make a clinical judgment?
- Are threshold values clearly configuration/detection rules rather than treatment advice?
- Does generated event text avoid inventing cause/intervention?

## 6. Privacy
- Does any fixture contain real patient data?
- Does any new logging/telemetry expose measurements?
- Is any new external service actually necessary?

## 7. Verification
- Add/update unit tests.
- Add/update synthetic importer fixtures.
- Run dedup/conflict tests.
- If print behavior changed, perform A4 print-preview verification.

## Suggested review note in PR/agent handoff

```text
ADRs considered: ADR-xxxx, ADR-yyyy
Assumptions affected: A-xxx
New evidence: ...
Tests added/changed: ...
Open questions: ...
```
