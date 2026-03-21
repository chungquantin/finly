import type { PortfolioItem } from "@/services/api/types"
import type { StockAccountId } from "@/stores/onboardingStore"

export type MockPortfolioTransaction = {
  id: string
  asset_type: "stock" | "crypto"
  ticker: string
  side: "buy" | "sell"
  quantity: number
  price: number
  executed_at: string
}

export type MockStockAccount = {
  id: StockAccountId
  name: string
  provider: string
  logos: string[]
  holdings: PortfolioItem[]
  transactions: MockPortfolioTransaction[]
}

export const DEFAULT_STOCK_ACCOUNT_ID: StockAccountId = "balanced-index"

const splitQuantity = (quantity: number): [number, number, number] => {
  const first = Math.round(quantity * 0.5 * 100) / 100
  const second = Math.round(quantity * 0.3 * 100) / 100
  const third = Math.round((quantity - first - second) * 100) / 100
  return [first, second, third]
}

const buildTransactionsFromHoldings = (
  holdings: PortfolioItem[],
  accountOffsetDays: number,
): MockPortfolioTransaction[] => {
  const base = new Date()
  const transactions: MockPortfolioTransaction[] = []

  holdings.forEach((holding, index) => {
    const [q1, q2, q3] = splitQuantity(holding.quantity)
    const lots = [q1, q2, q3]
    const multipliers = [0.94, 1.01, 1.05]
    const dayOffsets = [120, 75, 30]

    lots.forEach((lotQuantity, lotIndex) => {
      if (lotQuantity <= 0) return
      const txDate = new Date(base)
      txDate.setDate(base.getDate() - dayOffsets[lotIndex] - accountOffsetDays - index * 2)
      transactions.push({
        id: `${holding.ticker}_${index}_${lotIndex}`,
        asset_type: holding.asset_type,
        ticker: holding.ticker,
        side: "buy",
        quantity: lotQuantity,
        price: Math.round(holding.avg_cost * multipliers[lotIndex] * 100) / 100,
        executed_at: txDate.toISOString(),
      })
    })
  })

  return transactions.sort((left, right) => left.executed_at.localeCompare(right.executed_at))
}

export const getHoldingsFromTransactions = (
  transactions: MockPortfolioTransaction[],
): PortfolioItem[] => {
  const acc = new Map<
    string,
    { quantity: number; costBasis: number; assetType: "stock" | "crypto" }
  >()

  transactions
    .slice()
    .sort((left, right) => left.executed_at.localeCompare(right.executed_at))
    .forEach((transaction) => {
      const ticker = transaction.ticker.toUpperCase()
      const current = acc.get(ticker) ?? {
        quantity: 0,
        costBasis: 0,
        assetType: transaction.asset_type,
      }

      if (transaction.side === "buy") {
        current.quantity += transaction.quantity
        current.costBasis += transaction.quantity * transaction.price
      } else if (current.quantity > 0) {
        const sellQuantity = Math.min(transaction.quantity, current.quantity)
        const avgCost = current.costBasis / current.quantity
        current.quantity -= sellQuantity
        current.costBasis = Math.max(0, current.costBasis - sellQuantity * avgCost)
      }

      acc.set(ticker, current)
    })

  return Array.from(acc.entries())
    .filter(([, value]) => value.quantity > 0)
    .map(([ticker, value]) => ({
      asset_type: value.assetType,
      ticker,
      quantity: Math.round(value.quantity * 100) / 100,
      avg_cost: value.quantity > 0 ? Math.round((value.costBasis / value.quantity) * 100) / 100 : 0,
    }))
}

export const getMockStockAccountHoldings = (account: MockStockAccount) =>
  getHoldingsFromTransactions(account.transactions)

export const MOCK_STOCK_ACCOUNTS: MockStockAccount[] = [
  {
    id: "growth-tech",
    name: "Account A",
    provider: "Robinhood",
    logos: ["NVDA", "AAPL", "MSFT", "AMZN"],
    holdings: [
      { asset_type: "stock", ticker: "NVDA", quantity: 12, avg_cost: 742.4 },
      { asset_type: "stock", ticker: "AAPL", quantity: 18, avg_cost: 173.2 },
      { asset_type: "stock", ticker: "MSFT", quantity: 8, avg_cost: 392.8 },
      { asset_type: "stock", ticker: "AMZN", quantity: 10, avg_cost: 156.1 },
    ],
    transactions: buildTransactionsFromHoldings(
      [
        { asset_type: "stock", ticker: "NVDA", quantity: 12, avg_cost: 742.4 },
        { asset_type: "stock", ticker: "AAPL", quantity: 18, avg_cost: 173.2 },
        { asset_type: "stock", ticker: "MSFT", quantity: 8, avg_cost: 392.8 },
        { asset_type: "stock", ticker: "AMZN", quantity: 10, avg_cost: 156.1 },
      ],
      0,
    ),
  },
  {
    id: "dividend-core",
    name: "Account B",
    provider: "Fidelity",
    logos: ["JNJ", "PG", "KO", "PEP"],
    holdings: [
      { asset_type: "stock", ticker: "JNJ", quantity: 22, avg_cost: 151.7 },
      { asset_type: "stock", ticker: "PG", quantity: 17, avg_cost: 145.3 },
      { asset_type: "stock", ticker: "KO", quantity: 40, avg_cost: 61.2 },
      { asset_type: "stock", ticker: "PEP", quantity: 12, avg_cost: 171.5 },
      { asset_type: "stock", ticker: "XOM", quantity: 15, avg_cost: 109.4 },
      { asset_type: "stock", ticker: "CVX", quantity: 11, avg_cost: 154.8 },
      { asset_type: "stock", ticker: "MCD", quantity: 8, avg_cost: 287.1 },
      { asset_type: "stock", ticker: "WMT", quantity: 20, avg_cost: 63.9 },
      { asset_type: "stock", ticker: "HD", quantity: 7, avg_cost: 348.6 },
      { asset_type: "stock", ticker: "ABBV", quantity: 14, avg_cost: 168.2 },
    ],
    transactions: buildTransactionsFromHoldings(
      [
        { asset_type: "stock", ticker: "JNJ", quantity: 22, avg_cost: 151.7 },
        { asset_type: "stock", ticker: "PG", quantity: 17, avg_cost: 145.3 },
        { asset_type: "stock", ticker: "KO", quantity: 40, avg_cost: 61.2 },
        { asset_type: "stock", ticker: "PEP", quantity: 12, avg_cost: 171.5 },
        { asset_type: "stock", ticker: "XOM", quantity: 15, avg_cost: 109.4 },
        { asset_type: "stock", ticker: "CVX", quantity: 11, avg_cost: 154.8 },
        { asset_type: "stock", ticker: "MCD", quantity: 8, avg_cost: 287.1 },
        { asset_type: "stock", ticker: "WMT", quantity: 20, avg_cost: 63.9 },
        { asset_type: "stock", ticker: "HD", quantity: 7, avg_cost: 348.6 },
        { asset_type: "stock", ticker: "ABBV", quantity: 14, avg_cost: 168.2 },
      ],
      4,
    ),
  },
  {
    id: "balanced-index",
    name: "Account C",
    provider: "Charles Schwab",
    logos: ["AAPL", "MSFT", "GOOGL", "META"],
    holdings: [
      { asset_type: "stock", ticker: "AAPL", quantity: 20, avg_cost: 173.2 },
      { asset_type: "stock", ticker: "MSFT", quantity: 9, avg_cost: 392.8 },
      { asset_type: "stock", ticker: "AMZN", quantity: 14, avg_cost: 156.1 },
      { asset_type: "stock", ticker: "GOOGL", quantity: 16, avg_cost: 146.3 },
      { asset_type: "stock", ticker: "META", quantity: 7, avg_cost: 488.4 },
      { asset_type: "stock", ticker: "JPM", quantity: 12, avg_cost: 188.2 },
      { asset_type: "stock", ticker: "UNH", quantity: 5, avg_cost: 512.5 },
      { asset_type: "stock", ticker: "XOM", quantity: 13, avg_cost: 109.4 },
      { asset_type: "stock", ticker: "V", quantity: 11, avg_cost: 272.7 },
      { asset_type: "stock", ticker: "JNJ", quantity: 12, avg_cost: 151.7 },
      { asset_type: "stock", ticker: "PG", quantity: 14, avg_cost: 145.3 },
      { asset_type: "stock", ticker: "HD", quantity: 8, avg_cost: 348.6 },
    ],
    transactions: buildTransactionsFromHoldings(
      [
        { asset_type: "stock", ticker: "AAPL", quantity: 20, avg_cost: 173.2 },
        { asset_type: "stock", ticker: "MSFT", quantity: 9, avg_cost: 392.8 },
        { asset_type: "stock", ticker: "AMZN", quantity: 14, avg_cost: 156.1 },
        { asset_type: "stock", ticker: "GOOGL", quantity: 16, avg_cost: 146.3 },
        { asset_type: "stock", ticker: "META", quantity: 7, avg_cost: 488.4 },
        { asset_type: "stock", ticker: "JPM", quantity: 12, avg_cost: 188.2 },
        { asset_type: "stock", ticker: "UNH", quantity: 5, avg_cost: 512.5 },
        { asset_type: "stock", ticker: "XOM", quantity: 13, avg_cost: 109.4 },
        { asset_type: "stock", ticker: "V", quantity: 11, avg_cost: 272.7 },
        { asset_type: "stock", ticker: "JNJ", quantity: 12, avg_cost: 151.7 },
        { asset_type: "stock", ticker: "PG", quantity: 14, avg_cost: 145.3 },
        { asset_type: "stock", ticker: "HD", quantity: 8, avg_cost: 348.6 },
      ],
      8,
    ),
  },
]

export const getMockStockAccountById = (
  id: StockAccountId | null | undefined,
): MockStockAccount | null => {
  if (!id) return null
  return MOCK_STOCK_ACCOUNTS.find((account) => account.id === id) ?? null
}
