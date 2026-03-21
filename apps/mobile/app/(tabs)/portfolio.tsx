/* eslint-disable no-restricted-imports */
import { useMemo, useState } from "react"
import { Pressable, ScrollView, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { IosHeader } from "@/components/IosHeader"
import { Text } from "@/components/Text"
import { TickerLogo } from "@/components/TickerLogo"
import { useMarketData } from "@/services/marketData"
import { holdings, portfolioSnapshot } from "@/utils/mockAppData"

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)

const sortLabels = {
  value: "Value",
  alphabet: "Alphabet",
  holdings: "Holdings",
} as const

type HoldingsSort = keyof typeof sortLabels

export default function PortfolioTab() {
  const [sortBy, setSortBy] = useState<HoldingsSort>("value")
  const { quotes } = useMarketData(holdings.map((holding) => holding.ticker))
  const enrichedHoldings = useMemo(
    () =>
      holdings.map((holding) => {
        const liveQuote = quotes[holding.ticker]
        return {
          ...holding,
          valueUsd: liveQuote ? liveQuote.price * holding.shares : holding.valueUsd,
          changePercent: liveQuote?.change_pct ?? holding.changePercent,
        }
      }),
    [quotes],
  )
  const totalValueUsd = useMemo(
    () => enrichedHoldings.reduce((sum, holding) => sum + holding.valueUsd, 0),
    [enrichedHoldings],
  )
  const previousValueUsd = useMemo(
    () =>
      enrichedHoldings.reduce((sum, holding) => {
        if (holding.changePercent <= -100) return sum + holding.valueUsd
        return sum + holding.valueUsd / (1 + holding.changePercent / 100)
      }, 0),
    [enrichedHoldings],
  )
  const dailyChangePct = useMemo(() => {
    if (!previousValueUsd) return portfolioSnapshot.dailyPnlPercent
    return ((totalValueUsd - previousValueUsd) / previousValueUsd) * 100
  }, [previousValueUsd, totalValueUsd])
  const sortedHoldings = useMemo(() => {
    const nextHoldings = [...enrichedHoldings]

    switch (sortBy) {
      case "alphabet":
        return nextHoldings.sort((left, right) => left.ticker.localeCompare(right.ticker))
      case "holdings":
        return nextHoldings.sort((left, right) => right.shares - left.shares)
      case "value":
      default:
        return nextHoldings.sort((left, right) => right.valueUsd - left.valueUsd)
    }
  }, [enrichedHoldings, sortBy])

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={$scrollContent}>
        <IosHeader title="Portfolio" titleClassName="text-[24px] leading-[28px]" />

        <View className="px-4">
          <View className="rounded-[30px] border border-[#F1F2F6] bg-white p-5">
            <Text className="text-[13px] font-semibold tracking-[1.2px] text-[#8E8E93]">
              TOTAL VALUE
            </Text>
            <Text className="mt-2 text-[34px] font-semibold leading-[40px] text-[#111111]">
              {money(totalValueUsd || portfolioSnapshot.totalValueUsd)}
            </Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-[17px] font-semibold text-[#34C759]">
                {dailyChangePct >= 0 ? "+" : ""}
                {dailyChangePct.toFixed(2)}% today
              </Text>
              <Text className="text-[15px] text-[#8E8E93]">
                Invested {money(portfolioSnapshot.investedUsd)}
              </Text>
            </View>

            <View className="mt-5 flex-row gap-2">
              <Tag label={`${enrichedHoldings.length} holdings`} />
              <Tag label={`${money(portfolioSnapshot.cashUsd)} cash`} />
              <Tag label="Live quotes" />
            </View>
          </View>

          <View className="mt-4 rounded-[30px] border border-[#F1F2F6] bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-[24px] font-semibold text-[#111111]">Holdings</Text>
              <Text className="text-[14px] text-[#8E8E93]">
                Sorted by {sortLabels[sortBy].toLowerCase()}
              </Text>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              {(Object.entries(sortLabels) as [HoldingsSort, string][]).map(([key, label]) => {
                const isActive = key === sortBy

                return (
                  <Pressable
                    key={key}
                    className={`rounded-full border px-4 py-2 ${
                      isActive ? "border-[#111111] bg-[#111111]" : "border-[#E6E9F2] bg-[#F8F9FC]"
                    }`}
                    onPress={() => setSortBy(key)}
                  >
                    <Text
                      className={`text-[13px] ${isActive ? "text-white" : "text-[#6B7280]"}`}
                      weight="medium"
                    >
                      {label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            {sortedHoldings.map((holding) => (
              <View key={holding.ticker} className="border-b border-[#ECEEF4] py-4 last:border-b-0">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <TickerLogo ticker={holding.ticker} logoUri={holding.logoUri} />
                    <View className="ml-3">
                      <Text className="text-[20px] font-semibold text-[#111111]">
                        {holding.ticker}
                      </Text>
                      <Text className="text-[15px] text-[#8E8E93]">{holding.name}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-[20px] font-semibold text-[#111111]">
                      {money(holding.valueUsd)}
                    </Text>
                    <Text
                      className={`text-[15px] ${holding.changePercent >= 0 ? "text-[#34C759]" : "text-[#EF4444]"}`}
                    >
                      {holding.changePercent >= 0 ? "+" : ""}
                      {holding.changePercent}%
                    </Text>
                  </View>
                </View>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-[13px] text-[#8E8E93]">{holding.shares} shares</Text>
                  <Text className="text-[13px] text-[#8E8E93]">
                    Allocation {holding.allocationPercent}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Tag({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-[#F3F5FA] px-3 py-2">
      <Text className="text-[13px] text-[#6B7280]" weight="medium">
        {label}
      </Text>
    </View>
  )
}

const $scrollContent = {
  paddingBottom: 120,
}
