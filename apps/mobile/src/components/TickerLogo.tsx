/* eslint-disable no-restricted-imports */
import { useState } from "react"
import { Image, View } from "react-native"

import { Text } from "@/components/Text"

type TickerLogoProps = {
  ticker: string
  logoUri?: string
}

const DARK_BADGE_TICKERS = new Set(["AAPL"])

function shouldUseDarkBadge(ticker: string, logoUri?: string) {
  const normalizedTicker = ticker.trim().toUpperCase()
  if (DARK_BADGE_TICKERS.has(normalizedTicker)) return true

  const normalizedUri = logoUri?.toLowerCase() ?? ""
  return normalizedUri.includes("/aapl.")
}

export function TickerLogo({ ticker, logoUri }: TickerLogoProps) {
  const [hasError, setHasError] = useState(false)
  const useDarkBadge = shouldUseDarkBadge(ticker, logoUri)

  const badgeStyle = {
    shadowColor: "#111111",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  } as const

  if (!logoUri || hasError) {
    return (
      <View
        className={`h-12 w-12 items-center justify-center rounded-full border ${useDarkBadge ? "border-[#1F1F22] bg-[#111111]" : "border-[#F3F4F8] bg-white"}`}
        style={badgeStyle}
      >
        <Text
          className={`text-[15px] ${useDarkBadge ? "text-white" : "text-[#2453FF]"}`}
          weight="semiBold"
        >
          {ticker.slice(0, 2)}
        </Text>
      </View>
    )
  }

  return (
    <View
      className={`h-12 w-12 items-center justify-center rounded-full border ${useDarkBadge ? "border-[#1F1F22] bg-[#111111]" : "border-[#F3F4F8] bg-white"}`}
      style={badgeStyle}
    >
      <Image
        source={{ uri: logoUri }}
        className="h-7 w-7"
        resizeMode="contain"
        onError={() => setHasError(true)}
      />
    </View>
  )
}
