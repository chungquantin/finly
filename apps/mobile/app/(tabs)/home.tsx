/* eslint-disable no-restricted-imports */
import { useMemo } from "react"
import { Pressable, ScrollView, View } from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

import { Text } from "@/components/Text"
import { TickerLogo } from "@/components/TickerLogo"
import { useMarketData } from "@/services/marketData"
import { useOnboardingStore } from "@/stores/onboardingStore"
import { getRandomAgentAvatar } from "@/utils/agentAvatars"
import { boardMessages, holdings, portfolioSnapshot, teamAgents } from "@/utils/mockAppData"

const avatarEmojis = ["😀", "😎", "🥳", "🦄", "🌈", "🚀", "🧠", "🐼", "🍀", "🎯"] as const

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)

export default function HomeTab() {
  const router = useRouter()
  const investorName = useOnboardingStore((state) => state.name).trim() || "finlyinvestor"
  const avatarEmoji = useMemo(
    () => avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)],
    [],
  )
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
  const latestAgentMessages = useMemo(() => {
    return boardMessages.reduce<Record<string, string>>((acc, message) => {
      if (message.role !== "user" && !acc[message.author]) {
        acc[message.author] = message.message
      }
      return acc
    }, {})
  }, [])
  const totalValueUsd = useMemo(
    () => enrichedHoldings.reduce((sum, holding) => sum + holding.valueUsd, 0),
    [enrichedHoldings],
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={$scrollContent}>
        <View className="overflow-hidden rounded-[36px] border border-[#F1F2F6] bg-white">
          <View className="rounded-[36px] px-5 pb-6 pt-4">
            <View className="items-center">
              <View className="h-24 w-24 items-center justify-center rounded-full border-[6px] border-[#8EFF60] bg-[#2453FF]">
                <Text className="text-[40px]">{avatarEmoji}</Text>
              </View>
              <Text className="mt-5 text-[31px] font-semibold text-[#111111]">
                {investorName.toLowerCase()}.finly
              </Text>
              <Text className="mt-1 text-[16px] text-[#8E8E93]">
                Rainbow-style investing, guided by your AI board
              </Text>
            </View>

            <View className="mt-8 flex-row items-end justify-between border-b border-[#EEF1F7] pb-4">
              <View>
                <Text className="text-[18px] font-semibold text-[#111111]">Tokens</Text>
                <Text className="mt-1 text-[15px] text-[#8E8E93]">
                  {enrichedHoldings.length} holdings
                </Text>
              </View>
              <Text className="text-[29px] font-semibold text-[#111111]">
                {money(totalValueUsd || portfolioSnapshot.totalValueUsd)}
              </Text>
            </View>

            <View className="mt-1">
              {enrichedHoldings.map((holding) => (
                <HoldingRow
                  key={holding.ticker}
                  name={holding.name}
                  logoUri={holding.logoUri}
                  ticker={holding.ticker}
                  value={money(holding.valueUsd)}
                  changePercent={holding.changePercent}
                />
              ))}
            </View>

            <View className="mt-5 rounded-[28px] bg-[#F8FAFF] p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[20px] font-semibold text-[#111111]">Your Team</Text>
                <Text className="text-[14px] text-[#8E8E93]">Live coverage</Text>
              </View>

              <View className="mt-4 flex-row flex-wrap justify-between">
                {teamAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    recentMessage={latestAgentMessages[agent.name] ?? "Monitoring the market now."}
                    onPress={() => router.push(`/agent/${agent.id}`)}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function AgentCard({
  agent,
  recentMessage,
  onPress,
}: {
  agent: (typeof teamAgents)[number]
  recentMessage: string
  onPress: () => void
}) {
  const avatar = getRandomAgentAvatar(agent.id)

  return (
    <Pressable className="mb-3 w-[48.5%] rounded-[24px] bg-white px-4 py-4" onPress={onPress}>
      <View className="flex-row items-start justify-between">
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: avatar.palette.background }}
        >
          <Text className="text-[20px]">{avatar.glyph}</Text>
        </View>
        <View className="flex-row items-center rounded-full bg-[#F4F7FC] px-2.5 py-1">
          <View className={`mr-1.5 h-2 w-2 rounded-full ${statusDotClassName(agent.status)}`} />
          <Text className="text-[11px] capitalize text-[#5F6B7A]" weight="medium">
            {agent.status}
          </Text>
        </View>
      </View>

      <Text className="mt-3 text-[18px] text-[#111111]" weight="semiBold">
        {agent.name}
      </Text>
      <Text className="mt-1 text-[14px] leading-5 text-[#8E8E93]">{agent.role}</Text>

      <View className="mt-3 rounded-[18px] rounded-tl-[6px] bg-[#F5F7FB] px-3 py-3">
        <Text className="text-[13px] leading-5 text-[#445065]" numberOfLines={4}>
          {recentMessage}
        </Text>
      </View>

      <Text className="mt-3 text-[13px] text-[#6B7280]">{agent.lastUpdate}</Text>
    </Pressable>
  )
}

function statusDotClassName(status: (typeof teamAgents)[number]["status"]) {
  switch (status) {
    case "active":
      return "bg-[#2AB95A]"
    case "monitoring":
      return "bg-[#F59E0B]"
    default:
      return "bg-[#9CA3AF]"
  }
}

function HoldingRow({
  name,
  logoUri,
  ticker,
  value,
  changePercent,
}: {
  name: string
  logoUri?: string
  ticker: string
  value: string
  changePercent: number
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#F0F2F7] py-4 last:border-b-0">
      <View className="flex-row items-center">
        <TickerLogo ticker={ticker} logoUri={logoUri} />
        <View className="ml-3">
          <Text className="text-[18px] font-semibold text-[#111111]">{name}</Text>
          <Text className="text-[15px] text-[#8E8E93]">{ticker}</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-[18px] font-semibold text-[#111111]">{value}</Text>
        <Text className={`text-[15px] ${changePercent >= 0 ? "text-[#2AB95A]" : "text-[#F04438]"}`}>
          {changePercent >= 0 ? "+" : ""}
          {changePercent}%
        </Text>
      </View>
    </View>
  )
}

const $scrollContent = {
  paddingBottom: 120,
  paddingHorizontal: 14,
  paddingTop: 10,
}
