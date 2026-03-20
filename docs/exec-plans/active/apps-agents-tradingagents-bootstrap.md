# Execution Plan: Bootstrap apps/agents From TradingAgents Team Modules

## Objective

Initialize a new `apps/agents` Python app that brings in the TradingAgents team module structure so this repo has a concrete agent-team runtime scaffold.

## Why

The mobile flow and product docs already reference specialized AI fund agents, but the repository currently lacks a local `apps/agents` implementation scaffold.

## Scope

- In scope:
  - Create `apps/agents` with Python packaging metadata and setup docs
  - Vendor the upstream `tradingagents` package modules needed for agent teams
  - Add local run/verify commands and env template for API keys
  - Update architecture/readme references for the new app
- Out of scope:
  - Production backend API integration with `apps/mobile`
  - Broker execution, persistent storage, or deployment infra
  - Refactoring upstream TradingAgents internals

## Constraints

- Architectural: Keep monorepo legibility and make `apps/agents` inspectable as a standalone app.
- Reliability: Include a deterministic local smoke check (`python -m py_compile`) for scaffold verification.
- Security: Do not commit secret keys; only include `.env.example` placeholders.

## Work Plan

1. Discovery
2. Implementation
3. Verification
4. Documentation updates

## Decision Log

- 2026-03-19: Vendor upstream TradingAgents package code into `apps/agents/src/tradingagents` to avoid adding a network-coupled runtime dependency for scaffold initialization.

## Progress Log

- 2026-03-19: Started plan.
- 2026-03-19: Added `apps/agents` Python scaffold with vendored `tradingagents` and `cli` modules.
- 2026-03-19: Added `apps/agents` packaging metadata (`pyproject.toml`), setup docs, and env template wiring.
- 2026-03-19: Updated root `README.md` and `ARCHITECTURE.md` to reflect `apps/agents`.

## Verification

- Commands run:
  - `python3 -m py_compile apps/agents/main.py $(find apps/agents/src -name '*.py')`
  - `python3 scripts/check_harness_readiness.py`
- Manual checks:
  - Confirmed upstream TradingAgents team module layout is present under `apps/agents/src/tradingagents/agents/`.
- Remaining risk:
  - Runtime execution still depends on valid API keys and external provider availability.
