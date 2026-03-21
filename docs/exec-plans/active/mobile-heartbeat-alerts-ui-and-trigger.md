# Execution Plan: HEARTBEAT Alerts UI + Trigger Functionality

## Objective

Implement HEARTBEAT alert functionality end-to-end by adding backend alert endpoints (`alerts`, `trigger`, `custom`) and integrating a mobile UI surface that polls and displays alerts, plus a demo trigger control.

## Why

The HEARTBEAT spec calls for demo-ready reactive alerting. The current codebase defines alert types but does not expose a user-visible alert feed or trigger controls in mobile, which blocks the demo workflow.

## Scope

- In scope:
  - Add backend HEARTBEAT in-memory scenario/queue handling for alert polling and triggering.
  - Add backend endpoints for listing/consuming alerts, triggering built-in scenarios, and creating custom alerts.
  - Add mobile API client methods for HEARTBEAT alerts and trigger actions.
  - Add mobile polling hook and home-tab UI banner/list for alert visibility.
  - Add settings-tab demo trigger controls for built-in and custom scenarios.
- Out of scope:
  - Replacing existing heartbeat rules/results scheduler pipeline.
  - Persisting alert queue state to DB.
  - Authentication/authorization hardening beyond current hackathon-mode patterns.

## Constraints

- Architectural: Mobile must call `apps/backend` only, with backend owning HEARTBEAT transport semantics.
- Reliability: `GET /api/heartbeat/alerts` is consume-on-read, so mobile must accumulate alerts locally.
- Security: Keep the existing no-auth `user_id` query model; do not add provider secrets to mobile.

## Work Plan

1. Discovery
2. Implementation
3. Verification
4. Documentation updates

## Decision Log

- 2026-03-22: Implement alert queues in backend memory to match spec semantics quickly without introducing schema migration risk.
- 2026-03-22: Keep existing heartbeat rules/results API intact and add alert endpoints alongside it for demo parity.

## Progress Log

- 2026-03-22: Started plan.

## Verification

- Commands run:
- Manual checks:
- Remaining risk:
