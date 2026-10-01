# ADR-0001: Local-first browser app

- Status: Accepted
- Date: 2026-10-01

## Context
The application handles identifiable health measurements for a single-user workflow and initially needs import, review, persistence, and printing rather than collaboration.

## Decision
Build v1 as a browser-only application with IndexedDB persistence and no backend.

## Consequences
Positive:
- minimal deployment/operations
- health data need not leave the device
- fast iteration

Trade-offs:
- no automatic multi-device sync
- browser storage needs explicit backup/export later
- migrations must be handled carefully

## Revisit when
Multi-device use, clinician sharing, or reliable cross-device backup becomes a real requirement.
