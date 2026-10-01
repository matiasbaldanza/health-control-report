# AGENTS.md

Read `docs/README.md` and `docs/project-state.md` before making architectural or behavioral changes.

Rules:
- Keep source imports immutable; derived classifications may change.
- Do not commit real patient exports or other identifiable health data.
- Record architectural changes as ADRs in `docs/decisions/`; supersede old ADRs rather than rewriting history.
- Update `docs/roadmap.md` when scope or milestone status changes.
- Update `docs/assumptions.md` when an assumption is added, tested, confirmed, or rejected.
- Use `docs/review-checklist.md` for changes to import, identity, classification, events, persistence, or reporting.
- Prefer the smallest implementation that satisfies the current milestone and acceptance tests.
