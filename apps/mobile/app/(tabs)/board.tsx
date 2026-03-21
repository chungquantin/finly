import { useMemo, useState } from "react"
/* eslint-disable no-restricted-imports */
import { Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

import { TickerLogo } from "@/components/TickerLogo"
import { getRandomAgentAvatar } from "@/utils/agentAvatars"
import { boardThreads, holdings } from "@/utils/mockAppData"

const BLUE = "#2453FF"
const BORDER = "#EEF2F7"

const decisionColors = {
  Buy: { background: "#E9F7EF", text: "#1F8A4C" },
  Sell: { background: "#FFF1F1", text: "#D64545" },
  Position: { background: "#EEF3FF", text: BLUE },
} as const

export default function BoardTab() {
  const router = useRouter()
  const [threads, setThreads] = useState(boardThreads)
  const [searchQuery, setSearchQuery] = useState("")
  const [draft, setDraft] = useState("")

  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return threads

    return threads.filter((thread) =>
      [thread.title, thread.ticker, thread.intake, thread.summary]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
  }, [searchQuery, threads])

  const handleCreateThread = () => {
    const nextMessage = draft.trim()
    if (!nextMessage) return

    const matchedHolding = holdings.find((holding) => {
      const normalized = nextMessage.toLowerCase()
      return (
        normalized.includes(holding.ticker.toLowerCase()) ||
        normalized.includes(holding.name.toLowerCase())
      )
    })

    const nextThread = {
      id: `custom-${Date.now()}`,
      title: nextMessage.length > 36 ? `${nextMessage.slice(0, 36)}...` : nextMessage,
      ticker: matchedHolding?.ticker ?? "BOARD",
      decision: "Position" as const,
      intake: "New user-led board question",
      summary: nextMessage,
      updatedAt: "now",
      unreadCount: 0,
      participantAgentIds: ["portfolio-manager", "market-analyst", "risk-assessor"],
      messages: [
        {
          id: "1",
          author: "You",
          role: "user" as const,
          avatar: "YU",
          message: nextMessage,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }

    setThreads((current) => [nextThread, ...current])
    setDraft("")
    router.push({
      pathname: "/thread/[id]",
      params: {
        id: nextThread.id,
        title: nextThread.title,
        ticker: nextThread.ticker,
        intake: nextThread.intake,
        message: nextMessage,
      },
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FBFCFF]">
      <ScrollView className="flex-1" contentContainerStyle={$content}>
        <View className="px-4 pb-4 pt-2">
          <View
            className="flex-row items-center justify-between rounded-[28px] border bg-white px-3 py-3"
            style={{ borderColor: BORDER }}
          >
            <View className="flex-1">
              <Text className="font-sans text-[20px] font-semibold tracking-[-0.3px] text-[#0F1728]">
                Board Threads
              </Text>
              <Text className="font-sans text-[14px] text-[#7A8699]">
                Open a conversation with the agent board
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4">
          <View className="rounded-[30px] border border-[#EEF2F7] bg-white p-4">
            <Text className="font-sans text-[13px] font-semibold tracking-[1.2px] text-[#7A8699]">
              NEW THREAD
            </Text>
            <View className="mt-3 flex-row items-center">
              <View className="flex-1 rounded-full bg-[#F3F6FC] px-4 py-2.5">
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  onSubmitEditing={handleCreateThread}
                  placeholder="Ask the board about a stock or position"
                  placeholderTextColor="#94A0B3"
                  className="font-sans text-[16px] text-[#0F1728]"
                  returnKeyType="send"
                />
              </View>
              <Pressable
                className="ml-2 h-11 w-11 items-center justify-center rounded-full"
                style={draft.trim() ? $sendButtonActive : $sendButtonDisabled}
                onPress={handleCreateThread}
                disabled={!draft.trim()}
              >
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <View className="mt-4 rounded-[28px] border border-[#EEF2F7] bg-white px-4 py-3">
            <View className="flex-row items-center rounded-full bg-[#F4F7FF] px-4 py-2.5">
              <Ionicons name="search" size={18} color="#7A8699" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search board conversations"
                placeholderTextColor="#94A0B3"
                className="ml-3 flex-1 font-sans text-[15px] text-[#0F1728]"
              />
            </View>
          </View>

          <View className="mt-4 gap-3">
            {filteredThreads.map((thread) => (
              <Pressable
                key={thread.id}
                className="rounded-[28px] border bg-white p-4"
                style={{ borderColor: BORDER }}
                onPress={() => router.push(`/thread/${thread.id}`)}
              >
                <View className="mb-3 flex-row items-center">
                  <TickerLogo
                    ticker={thread.ticker}
                    logoUri={holdings.find((holding) => holding.ticker === thread.ticker)?.logoUri}
                  />
                  <Text className="ml-3 font-sans text-[16px] font-semibold text-[#0F1728]">
                    {thread.ticker}
                  </Text>
                </View>

                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <View
                      className="rounded-full px-3 py-1.5 self-start"
                      style={{
                        backgroundColor: decisionColors[thread.decision].background,
                      }}
                    >
                      <Text
                        className="font-sans text-[12px] font-semibold"
                        style={{ color: decisionColors[thread.decision].text }}
                      >
                        {thread.decision}
                      </Text>
                    </View>

                    <Text className="mt-3 font-sans text-[21px] font-semibold text-[#0F1728]">
                      {thread.title}
                    </Text>
                    <Text className="mt-1 font-sans text-[15px] text-[#607089]">
                      Intake: {thread.intake}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="font-sans text-[13px] text-[#7A8699]">{thread.updatedAt}</Text>
                    {thread.unreadCount > 0 ? (
                      <View className="mt-2 rounded-full bg-[#2453FF] px-2.5 py-1">
                        <Text className="font-sans text-[12px] font-semibold text-white">
                          {thread.unreadCount} new
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <Text className="mt-3 font-sans text-[15px] leading-6 text-[#425168]">
                  {thread.summary}
                </Text>

                <View className="mt-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    {thread.participantAgentIds.map((agentId, index) => {
                      const avatar = getRandomAgentAvatar(agentId)

                      return (
                        <View
                          key={agentId}
                          className={`h-8 w-8 items-center justify-center rounded-full border-2 border-white ${
                            index === 0 ? "" : "-ml-2"
                          }`}
                          style={{ backgroundColor: avatar.palette.background }}
                        >
                          <Text className="font-sans text-[15px]">{avatar.glyph}</Text>
                        </View>
                      )
                    })}
                  </View>

                  <Text className="font-sans text-[13px] text-[#7A8699]">
                    {thread.messages.length} updates
                  </Text>
                </View>
              </Pressable>
            ))}
            {filteredThreads.length === 0 ? (
              <View className="rounded-[28px] border border-[#EEF2F7] bg-white p-5">
                <Text className="font-sans text-[18px] font-semibold text-[#0F1728]">
                  No matching conversations
                </Text>
                <Text className="mt-2 font-sans text-[15px] leading-6 text-[#7A8699]">
                  Try another ticker, decision keyword, or start a new thread above.
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const $content = {
  paddingBottom: 120,
}

const $sendButtonActive = {
  backgroundColor: BLUE,
}

const $sendButtonDisabled = {
  backgroundColor: "#BFD0FF",
}
