# Documentation index

This directory is the source of truth for product behavior, architecture, assumptions, and decision history.

## Read in this order
1. [`spec.md`](spec.md) — product behavior and acceptance criteria.
2. [`architecture.md`](architecture.md) — system boundaries and data flow.
3. [`data-model.md`](data-model.md) — canonical and derived records.
4. [`classification.md`](classification.md) — four-slot inference rules.
5. [`events.md`](events.md) — possible-event detection and confirmation.
6. [`reporting.md`](reporting.md) — monthly print/PDF output.
7. [`validation.md`](validation.md) — tests and verification strategy.
8. [`assumptions.md`](assumptions.md) — explicit assumptions and how to test them.
9. [`project-state.md`](project-state.md) — current milestone, open questions, and risks.
10. [`review-checklist.md`](review-checklist.md) — guardrails for architectural/assumption review.
11. [`roadmap.md`](roadmap.md) — milestones and non-goals.
12. [`decisions/README.md`](decisions/README.md) — architectural decision record index.

## Change discipline
- Specs describe current intended behavior.
- ADRs preserve why important choices were made.
- Assumptions are hypotheses; each should state how it can be disproved.
- Roadmap tracks sequencing, not architectural truth.

- [`m0-historical-report-generator.md`](m0-historical-report-generator.md) — immediate CSV-to-print vertical slice.
