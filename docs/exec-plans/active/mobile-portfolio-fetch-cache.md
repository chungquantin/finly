# Execution Plan: Mobile Portfolio Fetch Cache

## Objective

Add a local cache for fetched portfolio-related market data so Home and Portfolio can reuse recent data and reduce redundant network requests.

## Why

The portfolio surfaces poll quotes/history on intervals and on remounts. Caching improves perceived performance, supports brief offline periods, and lowers backend load.

## Scope

- In scope:
  - Add persisted TTL cache for quote fetches in `useMarketData`
  - Add persisted TTL cache for portfolio growth history in `usePortfolioGrowthHistory`
  - Keep current fallback behavior when live fetch fails
- Out of scope:
  - Cache invalidation from push events
  - Background prefetch workers
  - Backend-side cache changes

## Constraints

- Architectural: Keep cache logic in mobile app services and AsyncStorage utilities.
- Reliability: Never block UI on cache read/write failures.
- Security: Cache only market quote/history values; no secrets.

## Work Plan

1. Discovery
2. Implementation
3. Verification
4. Documentation updates

## Decision Log

- 2026-03-21: Use small client-side TTL caches keyed by normalized ticker/transaction signatures to avoid broad state coupling.

## Progress Log

- 2026-03-21: Started plan.
- 2026-03-21: Added shared AsyncStorage-backed cache helpers for market quotes and portfolio history points with TTL metadata.
- 2026-03-21: Updated `useMarketData` to hydrate from cache first and skip immediate fetch when cache is fresh.
- 2026-03-21: Updated `usePortfolioGrowthHistory` to hydrate from cache first and only fetch when cache is stale.

## Verification

- Commands run:
  - `pnpm -C apps/mobile exec eslint 'src/services/marketData.ts' 'src/services/portfolioHistory.ts' 'src/services/portfolioDataCache.ts' 'app/holding/[ticker].tsx'`
- Manual checks:
  - Cache hydration preserves prior quote/history values during brief network failures and avoids blank-state flicker.
- Remaining risk:
  - Cache keys are ticker/transaction-signature based; large transaction churn can create additional cache entries over time.
