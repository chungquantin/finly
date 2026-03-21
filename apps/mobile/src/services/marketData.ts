import { useEffect, useMemo, useState } from "react"

import Config from "@/config"
import { api } from "@/services/api"
import type { MarketDataQuote } from "@/services/api/types"
import { loadMarketQuotesCache, saveMarketQuotesCache } from "@/services/portfolioDataCache"

type MarketDataState = {
  quotes: Record<string, MarketDataQuote>
  isLoading: boolean
  hasLiveQuotes: boolean
}

const MARKET_DATA_URL = resolveMarketDataUrl()
const QUOTE_REFRESH_MS = 30000

export async function fetchMarketData(tickers: string[]): Promise<MarketDataQuote[]> {
  if (!MARKET_DATA_URL) {
    return []
  }
  const result = await api.getMarketData(tickers)
  if (result.kind !== "ok") {
    throw new Error(`Market data request failed: ${result.kind}`)
  }
  return result.quotes
}

export function useMarketData(tickers: string[]): MarketDataState {
  const tickerKey = useMemo(
    () =>
      Array.from(
        new Set(tickers.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean)),
      ).join(","),
    [tickers],
  )
  const stableTickers = useMemo(() => (tickerKey ? tickerKey.split(",") : []), [tickerKey])
  const [quotes, setQuotes] = useState<Record<string, MarketDataQuote>>({})
  const [isLoading, setIsLoading] = useState(Boolean(tickerKey && MARKET_DATA_URL))

  useEffect(() => {
    let isActive = true

    if (!tickerKey) {
      setQuotes({})
      setIsLoading(false)
      return
    }

    if (!MARKET_DATA_URL) {
      setQuotes({})
      setIsLoading(false)
      return
    }

    const fetchQuotes = async () => {
      setIsLoading(true)
      try {
        const items = await fetchMarketData(stableTickers)
        if (!isActive) return

        const nextQuotes = items.reduce<Record<string, MarketDataQuote>>((acc, item) => {
          acc[item.ticker] = item
          return acc
        }, {})

        setQuotes(nextQuotes)
        await saveMarketQuotesCache(tickerKey, items)
      } catch {
        if (!isActive) return
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    const hydrateAndFetch = async () => {
      const cached = await loadMarketQuotesCache(tickerKey)
      if (!isActive) return

      if (cached?.quotes.length) {
        const cachedQuotes = cached.quotes.reduce<Record<string, MarketDataQuote>>((acc, item) => {
          acc[item.ticker] = item
          return acc
        }, {})
        setQuotes(cachedQuotes)
        if (cached.isFresh) {
          setIsLoading(false)
        }
      }

      // Skip immediate network fetch when cache is still fresh.
      if (cached?.isFresh) return
      await fetchQuotes()
    }

    void hydrateAndFetch()
    const timer = setInterval(fetchQuotes, QUOTE_REFRESH_MS)

    return () => {
      isActive = false
      clearInterval(timer)
    }
  }, [tickerKey, stableTickers])

  return { quotes, isLoading, hasLiveQuotes: Object.keys(quotes).length > 0 }
}

function resolveMarketDataUrl() {
  const candidates = [Config.MARKET_DATA_URL, Config.API_URL]

  for (const candidate of candidates) {
    if (!candidate) continue
    if (candidate.includes("rss2json.com")) continue
    return candidate.replace(/\/+$/, "")
  }

  return null
}
