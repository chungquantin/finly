import type { MarketDataQuote } from "@/services/api/types"
import { load, save } from "@/utils/storage"

import type { PortfolioGrowthPoint } from "./portfolioHistory"

const MARKET_QUOTES_CACHE_PREFIX = "finly:market-quotes:v1:"
const PORTFOLIO_HISTORY_CACHE_PREFIX = "finly:portfolio-history:v1:"

export const MARKET_QUOTES_CACHE_TTL_MS = 45_000
export const PORTFOLIO_HISTORY_CACHE_TTL_MS = 90_000

type CachedPayload<T> = {
  cachedAt: number
  data: T
}

export async function loadMarketQuotesCache(
  tickerKey: string,
): Promise<{ quotes: MarketDataQuote[]; isFresh: boolean; cachedAt: number } | null> {
  const payload = await loadCached<MarketDataQuote[]>(`${MARKET_QUOTES_CACHE_PREFIX}${tickerKey}`)
  if (!payload) return null
  return {
    quotes: payload.data,
    isFresh: Date.now() - payload.cachedAt <= MARKET_QUOTES_CACHE_TTL_MS,
    cachedAt: payload.cachedAt,
  }
}

export async function saveMarketQuotesCache(
  tickerKey: string,
  quotes: MarketDataQuote[],
): Promise<void> {
  await saveCached(`${MARKET_QUOTES_CACHE_PREFIX}${tickerKey}`, quotes)
}

export async function loadPortfolioHistoryCache(
  signature: string,
): Promise<{ points: PortfolioGrowthPoint[]; isFresh: boolean } | null> {
  const payload = await loadCached<PortfolioGrowthPoint[]>(
    `${PORTFOLIO_HISTORY_CACHE_PREFIX}${signature}`,
  )
  if (!payload) return null
  return {
    points: payload.data,
    isFresh: Date.now() - payload.cachedAt <= PORTFOLIO_HISTORY_CACHE_TTL_MS,
  }
}

export async function savePortfolioHistoryCache(
  signature: string,
  points: PortfolioGrowthPoint[],
): Promise<void> {
  await saveCached(`${PORTFOLIO_HISTORY_CACHE_PREFIX}${signature}`, points)
}

function stableHash(value: string): string {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return String(Math.abs(hash))
}

export function portfolioHistoryCacheSignature(key: string): string {
  return stableHash(key)
}

async function loadCached<T>(key: string): Promise<CachedPayload<T> | null> {
  const payload = await load<CachedPayload<T>>(key)
  if (!payload || typeof payload.cachedAt !== "number") return null
  return payload
}

async function saveCached<T>(key: string, data: T): Promise<void> {
  await save(key, {
    cachedAt: Date.now(),
    data,
  } satisfies CachedPayload<T>)
}
