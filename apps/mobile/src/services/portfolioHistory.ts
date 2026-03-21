import { useEffect, useMemo, useState } from "react"

import Config from "@/config"
import { api } from "@/services/api"

type PortfolioTransaction = {
  ticker: string
  side: "buy" | "sell"
  quantity: number
  price: number
  executedAt: string
}

export type PortfolioGrowthPoint = {
  date: string
  value: number
}

export type PortfolioGrowthHistoryState = {
  points: PortfolioGrowthPoint[]
  isLoading: boolean
  hasLiveHistory: boolean
  monthlyChangePercent: number
  todayChangeUsd: number
}

const HISTORY_REFRESH_MS = 60000

export function usePortfolioGrowthHistory(
  transactions: PortfolioTransaction[],
): PortfolioGrowthHistoryState {
  const [points, setPoints] = useState<PortfolioGrowthPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const stableTransactions = useMemo(
    () => [...transactions].sort((left, right) => left.executedAt.localeCompare(right.executedAt)),
    [transactions],
  )
  const tickers = useMemo(
    () =>
      Array.from(
        new Set(stableTransactions.map((transaction) => transaction.ticker.toUpperCase())),
      ),
    [stableTransactions],
  )
  const transactionKey = useMemo(
    () =>
      stableTransactions
        .map(
          (transaction) =>
            `${transaction.executedAt}:${transaction.ticker}:${transaction.side}:${transaction.quantity}:${transaction.price}`,
        )
        .join("|"),
    [stableTransactions],
  )

  useEffect(() => {
    let isActive = true

    if (!transactionKey || !tickers.length || !resolveHistoryEnabled()) {
      setPoints([])
      return
    }

    const load = async () => {
      setIsLoading(true)
      try {
        const result = await api.getMarketDataHistoryBatch(tickers, "1mo", "1d")
        if (!isActive) return
        if (result.kind !== "ok") {
          setPoints([])
          return
        }

        const next = buildPortfolioHistoryPoints(stableTransactions, result.history.results)
        setPoints(next)
      } catch {
        if (!isActive) return
        setPoints([])
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    load()
    const timer = setInterval(load, HISTORY_REFRESH_MS)

    return () => {
      isActive = false
      clearInterval(timer)
    }
  }, [stableTransactions, tickers, transactionKey])

  const monthlyChangePercent = useMemo(() => {
    if (points.length < 2) return 0
    const first = points[0].value
    const last = points[points.length - 1].value
    if (!first) return 0
    return ((last - first) / first) * 100
  }, [points])
  const todayChangeUsd = useMemo(() => {
    if (points.length < 2) return 0
    return points[points.length - 1].value - points[points.length - 2].value
  }, [points])

  return {
    points,
    isLoading,
    hasLiveHistory: points.length > 1,
    monthlyChangePercent,
    todayChangeUsd,
  }
}

function resolveHistoryEnabled() {
  const candidates = [Config.MARKET_DATA_URL, Config.API_URL]
  return candidates.some((candidate) => Boolean(candidate && !candidate.includes("rss2json.com")))
}

function buildPortfolioHistoryPoints(
  transactions: PortfolioTransaction[],
  historyByTicker: Record<
    string,
    {
      data: { date: string; close: number }[]
      error?: string
    }
  >,
): PortfolioGrowthPoint[] {
  const dateSet = new Set<string>()
  const byTickerSeries = new Map<string, { date: string; close: number }[]>()

  Object.entries(historyByTicker).forEach(([ticker, payload]) => {
    if (!payload || payload.error || !Array.isArray(payload.data)) return
    const series = payload.data
      .map((point) => ({
        date: point.date,
        close: point.close,
      }))
      .filter((point) => Number.isFinite(point.close))
      .sort((left, right) => left.date.localeCompare(right.date))

    if (!series.length) return
    byTickerSeries.set(ticker.toUpperCase(), series)
    series.forEach((point) => dateSet.add(point.date))
  })

  const dates = Array.from(dateSet).sort((left, right) => left.localeCompare(right))
  if (!dates.length) return []

  const quantityByTicker = new Map<string, number>()
  const txByDate = new Map<string, PortfolioTransaction[]>()
  const firstDate = dates[0]
  transactions.forEach((transaction) => {
    const date = transaction.executedAt.slice(0, 10)
    if (date < firstDate) {
      const ticker = transaction.ticker.toUpperCase()
      const currentQty = quantityByTicker.get(ticker) ?? 0
      const quantityDelta =
        transaction.side === "sell" ? -transaction.quantity : transaction.quantity
      quantityByTicker.set(ticker, Math.max(0, currentQty + quantityDelta))
      return
    }
    const existing = txByDate.get(date) ?? []
    existing.push(transaction)
    txByDate.set(date, existing)
  })

  const points: PortfolioGrowthPoint[] = []
  dates.forEach((date) => {
    const dayTransactions = txByDate.get(date) ?? []
    dayTransactions.forEach((transaction) => {
      const ticker = transaction.ticker.toUpperCase()
      const currentQty = quantityByTicker.get(ticker) ?? 0
      const quantityDelta =
        transaction.side === "sell" ? -transaction.quantity : transaction.quantity
      quantityByTicker.set(ticker, Math.max(0, currentQty + quantityDelta))
    })

    let total = 0
    quantityByTicker.forEach((quantity, ticker) => {
      const series = byTickerSeries.get(ticker)
      if (!series || quantity <= 0) return
      const close = closeAtOrBefore(series, date)
      if (close === null) return
      total += quantity * close
    })

    points.push({
      date,
      value: Math.round(total * 100) / 100,
    })
  })

  return points.filter((point) => point.value > 0)
}

function closeAtOrBefore(
  series: { date: string; close: number }[],
  targetDate: string,
): number | null {
  let latest: number | null = null
  for (const point of series) {
    if (point.date > targetDate) break
    latest = point.close
  }
  return latest
}
