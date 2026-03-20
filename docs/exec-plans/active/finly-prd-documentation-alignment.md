# Execution Plan: Align Repository Docs To Finly PRD

## Objective

Update repository documentation to reflect the Lotus Hacks 2026 Finly PRD, including product intent, user journey, architecture direction, and hackathon-scoped MVP constraints.

## Why

Current docs still describe an older iOS-first flow and do not encode the latest product shape: voice-first multi-agent advising with Arena gamification for Vietnamese beginner investors.

## Scope

- In scope:
  - Update `README.md` to describe Finly and current hackathon goals
  - Add/refresh product spec content with PRD details
  - Update design docs and indexes to reflect new UX and agent-team model
  - Update reliability/frontend guidance with PRD performance and stack expectations
- Out of scope:
  - Runtime code changes in `apps/mobile` or `apps/agents`
  - Real API integration and production deployment setup

## Constraints

- Architectural: Preserve monorepo clarity and document intended web + backend + agent boundaries.
- Reliability: Encode explicit latency targets from PRD (voice and agent response budgets).
- Security: Keep all secrets and API credentials out of versioned files.

## Work Plan

1. Discovery
2. Implementation
3. Verification
4. Documentation updates

## Decision Log

- 2026-03-19: Keep existing `ai-fund-team-launch-flow.md` as legacy context but mark it superseded by a new Finly PRD doc.

## Progress Log

- 2026-03-19: Started plan.
- 2026-03-19: Rewrote `README.md` around Finly product direction and hackathon context.
- 2026-03-19: Added new product PRD doc at `docs/product-specs/finly-agentic-investment-team-prd.md`.
- 2026-03-19: Updated product/design indexes and marked older iOS-first docs/specs as superseded.
- 2026-03-19: Updated architecture, frontend, reliability, security, and quality posture docs to reflect PRD scope.

## Verification

- Commands run:
  - `python3 scripts/check_harness_readiness.py`
- Manual checks:
  - Confirmed all requested PRD sections are encoded in versioned docs (users, feature set, stack, journey, metrics, next steps).
- Remaining risk:
  - Runtime code and UI still need implementation-level alignment to match the updated docs.
