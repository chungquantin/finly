# Execution Plan: Mobile Holding Remove Board Intake + yFinance Ticker Profile

## Objective

Remove the Board Intake panel from the holding detail screen and replace it with live ticker general information sourced from backend yFinance data.

## Why

The current Board Intake block is static and not useful for ticker detail. Users need real, current ticker context (company/sector/market cap/summary) from yFinance.

## Scope

- In scope:
  - Add backend API response model for ticker general profile data
  - Add backend endpoint that fetches ticker profile from yFinance
  - Add mobile API types/client method for the new endpoint
  - Update holding detail UI to remove Board Intake card and render ticker overview from API
- Out of scope:
  - Board thread intake flow changes
  - Watchlist route redesign
  - Non-holding screens

## Constraints

- Architectural:
  - Keep data-fetch logic in backend API layer and consume via existing mobile API service
- Reliability:
  - Profile fetch must fail gracefully without breaking holding screen render
- Security:
  - No secrets in mobile; only backend talks to yFinance

## Work Plan

1. Discovery
2. Implementation
3. Verification
4. Documentation updates

## Decision Log

- 2026-03-22: Add dedicated `/api/market-data/profile` endpoint and keep `/api/market-data` unchanged to avoid regressions in existing quote polling.

## Progress Log

- 2026-03-22: Started plan.
- 2026-03-22: Added backend profile model + yFinance profile endpoint.
- 2026-03-22: Updated mobile API types/client and replaced holding Board Intake card with yFinance ticker overview UI.

## Verification

- Commands run:
  - `python3 -m py_compile apps/backend/src/finly_backend/models.py apps/backend/src/finly_backend/server.py`
  - `pnpm -C apps/mobile exec tsc --noEmit` (fails due pre-existing TypeScript issues outside this change set)
- Manual checks:
  - Confirmed `BOARD INTAKE` section removed from holding detail screen source.
  - Confirmed new `getMarketTickerProfile` client call and `/api/market-data/profile` backend endpoint are wired.
- Remaining risk:
  - yFinance metadata completeness varies by ticker/exchange; some fields may return null.
