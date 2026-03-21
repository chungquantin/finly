# Execution Plan: Portfolio Transactions And Historical Growth

## Objective

Move portfolio modeling from static holdings toward transaction-driven state, add API support for historical price retrieval across portfolio tickers, and power the mobile portfolio growth chart from real historical valuation over time.

## Why

The current chart and portfolio model are mostly synthetic. A transaction-first model is required to represent holdings at specific timestamps and to compute realistic portfolio growth.

## Scope

- In scope:
  - Introduce transaction primitives in mobile mock portfolio account data
  - Derive current holdings from transactions instead of relying on static holdings values
  - Expand backend market-data history API to support multi-ticker historical fetch for portfolio valuation
  - Update mobile home portfolio growth chart to render from transaction-aware historical valuation
- Out of scope:
  - Brokerage sync integrations
  - Tax-lot accounting correctness for all edge cases
  - Real-time streaming updates

## Constraints

- Architectural: Keep market data sourced via backend API; mobile should not call yfinance directly.
- Reliability: Maintain fallback rendering when history endpoints are unavailable.
- Security: Keep all data-vendor access server-side.

## Work Plan

1. Discovery
2. Implementation
3. Verification
4. Documentation updates

## Decision Log

- 2026-03-21: Use weighted-average cost from transactions as the practical holding derivation model for this iteration.
- 2026-03-21: Add `/api/market-data/history/batch` to avoid N-per-ticker round-trips from mobile when valuing transaction-based portfolio history.

## Progress Log

- 2026-03-21: Started plan.
- 2026-03-21: Added backend market-data history helpers and a batch history endpoint for multi-ticker historical OHLCV retrieval.
- 2026-03-21: Added transaction primitives to mock stock accounts and switched selected portfolio derivation from static holdings to transaction aggregation.
- 2026-03-21: Updated onboarding stock account screens to compute totals from transaction-derived holdings.
- 2026-03-21: Added mobile portfolio growth history hook that combines transaction timeline + backend historical prices and wired Home chart to it with fallback behavior.

## Verification

- Commands run:
  - `python3 -m py_compile apps/backend/src/finly_backend/server.py`
  - `pnpm -C apps/mobile exec eslint 'src/services/api/index.ts' 'src/services/api/types.ts' 'src/services/portfolioHistory.ts' 'src/utils/mockStockAccounts.ts' 'src/utils/mockPortfolio.ts' 'src/utils/selectedPortfolio.ts' 'src/screens/OnboardingStep2Screen.tsx' 'src/screens/OnboardingCompleteScreen.tsx' 'app/(tabs)/home.tsx'`
- Manual checks:
  - Confirmed chart component now supports live history values and fallback curve when live history is unavailable.
- Remaining risk:
  - Full `tsc --noEmit` remains affected by pre-existing repository TypeScript errors outside this change set.
