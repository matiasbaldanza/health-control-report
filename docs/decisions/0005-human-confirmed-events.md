# ADR-0005: Event detection is heuristic and human-confirmed

- Status: Accepted
- Date: 2026-10-01

## Context
Dense measurement clusters can indicate rechecks after abnormal glucose but timestamps/values alone cannot establish cause, treatment, or clinical significance.

## Decision
The app may flag `possible events` using explainable heuristics. A user must confirm, ignore, or edit them before they become report events.

## Consequences
The application assists review without pretending to make clinical determinations. Event-review UI is required in MVP.
