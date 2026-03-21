const TICKER_LOGO_OVERRIDES: Record<string, string[]> = {
  V: ["https://logo.clearbit.com/visa.com"],
  UNH: ["https://logo.clearbit.com/unitedhealthgroup.com"],
}

export const getTickerLogoUris = (ticker: string) => {
  const normalizedTicker = ticker.trim().toUpperCase()
  const defaultUris = [
    `https://cdn.jsdelivr.net/gh/nvstly/icons@main/ticker_icons/${normalizedTicker}.png`,
    `https://raw.githubusercontent.com/nvstly/icons/main/ticker_icons/${normalizedTicker}.png`,
  ]

  const overrideUris = TICKER_LOGO_OVERRIDES[normalizedTicker] ?? []
  const uniqueUris = new Set<string>([...overrideUris, ...defaultUris])
  return Array.from(uniqueUris)
}

export const getTickerLogoUri = (ticker: string) => getTickerLogoUris(ticker)[0] ?? ""
