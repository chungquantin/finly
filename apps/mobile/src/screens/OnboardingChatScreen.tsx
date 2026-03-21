/* eslint-disable no-restricted-imports */
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native"
import { useRouter } from "expo-router"
import { MotiView } from "moti"

import { FINLY_DEFAULT_USER_ID } from "@/services/agentUser"
import { api } from "@/services/api"
import type { VoiceOnboardingResponse } from "@/services/api/types"
import { useOnboardingStore } from "@/stores/onboardingStore"
import type { RiskExpertise, InvestmentHorizon, FinancialKnowledge } from "@/stores/onboardingStore"
import { DEFAULT_STOCK_ACCOUNT_ID } from "@/utils/mockStockAccounts"

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  text: string
}

const riskMap: Record<string, RiskExpertise> = {
  beginner: "beginner",
  intermediate: "intermediate",
  expert: "expert",
}

const horizonMap: Record<string, InvestmentHorizon> = {
  short: "short",
  medium: "medium",
  long: "long",
}

const knowledgeMap: Record<string, FinancialKnowledge> = {
  novice: "novice",
  savvy: "savvy",
  pro: "pro",
}

export function OnboardingChatScreen() {
  const router = useRouter()
  const flatListRef = useRef<FlatList>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isBusy, setIsBusy] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  const setName = useOnboardingStore((s) => s.setName)
  const setRiskExpertise = useOnboardingStore((s) => s.setRiskExpertise)
  const setInvestmentHorizon = useOnboardingStore((s) => s.setInvestmentHorizon)
  const setFinancialKnowledge = useOnboardingStore((s) => s.setFinancialKnowledge)
  const setPortfolioType = useOnboardingStore((s) => s.setPortfolioType)
  const setStockAccountId = useOnboardingStore((s) => s.setStockAccountId)
  const setWalletAddress = useOnboardingStore((s) => s.setWalletAddress)

  const addMessage = useCallback((role: "assistant" | "user", text: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text }])
  }, [])

  const handleResponse = useCallback(
    (data: VoiceOnboardingResponse) => {
      addMessage("assistant", data.message)

      if (data.is_complete && data.profile) {
        setIsComplete(true)
        const p = data.profile

        if (p.name) setName(p.name)
        if (p.risk && riskMap[p.risk]) setRiskExpertise(riskMap[p.risk])
        if (p.horizon && horizonMap[p.horizon]) setInvestmentHorizon(horizonMap[p.horizon])
        if (p.knowledge && knowledgeMap[p.knowledge])
          setFinancialKnowledge(knowledgeMap[p.knowledge])

        // Set defaults for portfolio
        setPortfolioType("stock")
        setWalletAddress("")
        setStockAccountId(DEFAULT_STOCK_ACCOUNT_ID)

        // Navigate to step-4 (portfolio review) after a short delay
        setTimeout(() => {
          router.push("/onboarding/step-4")
        }, 2000)
      }
    },
    [
      addMessage,
      router,
      setName,
      setRiskExpertise,
      setInvestmentHorizon,
      setFinancialKnowledge,
      setPortfolioType,
      setWalletAddress,
      setStockAccountId,
    ],
  )

  // Fetch initial greeting on mount
  useEffect(() => {
    let mounted = true

    async function fetchGreeting() {
      setIsBusy(true)
      try {
        // Reset any previous conversation
        await api.voiceOnboardingReset(FINLY_DEFAULT_USER_ID)

        const result = await api.voiceOnboardingGreeting(FINLY_DEFAULT_USER_ID)
        if (mounted && result.kind === "ok") {
          handleResponse(result.data)
        }
      } catch (e) {
        if (__DEV__) console.warn("Onboarding greeting error:", e)
        if (mounted) {
          addMessage(
            "assistant",
            "Hey there! I'm Finly, your AI investment advisor. What's your name?",
          )
        }
      } finally {
        if (mounted) setIsBusy(false)
      }
    }

    fetchGreeting()
    return () => {
      mounted = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages.length])

  const handleTextSend = useCallback(async () => {
    const msg = textInput.trim()
    if (!msg || isBusy || isComplete) return

    setTextInput("")
    addMessage("user", msg)
    setIsBusy(true)

    try {
      const result = await api.voiceOnboardingMessage(FINLY_DEFAULT_USER_ID, msg)
      if (result.kind === "ok") {
        handleResponse(result.data)
      } else {
        addMessage("assistant", "Something went wrong. Could you try again?")
      }
    } catch (e) {
      if (__DEV__) console.warn("Onboarding text error:", e)
      addMessage("assistant", "Something went wrong. Could you try again?")
    } finally {
      setIsBusy(false)
    }
  }, [textInput, isBusy, isComplete, addMessage, handleResponse])

  const handleSkip = useCallback(() => {
    // Use defaults and skip to portfolio review
    setPortfolioType("stock")
    setWalletAddress("")
    setStockAccountId(DEFAULT_STOCK_ACCOUNT_ID)
    router.push("/onboarding/step-4")
  }, [router, setPortfolioType, setWalletAddress, setStockAccountId])

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user"

    return (
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 250 }}
      >
        <View className={`mb-3 flex-row ${isUser ? "justify-end" : "justify-start"}`}>
          {!isUser && (
            <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-[#2453FF]">
              <Text className="text-[14px] font-bold text-white">F</Text>
            </View>
          )}
          <View
            className={`max-w-[80%] rounded-[20px] px-4 py-3 ${
              isUser ? "bg-[#2453FF]" : "bg-[#F3F5FA]"
            }`}
          >
            <Text
              className={`text-[16px] leading-[22px] ${
                isUser ? "text-white" : "text-[#111111]"
              }`}
            >
              {item.text}
            </Text>
          </View>
        </View>
      </MotiView>
    )
  }, [])

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="border-b border-[#F1F2F6] bg-white px-4 pb-4 pt-14">
        <Text className="text-center text-[13px] font-semibold tracking-[1.2px] text-[#8E8E93]">
          STEP 1 OF 3
        </Text>
        <Text className="mt-1 text-center text-[22px] font-semibold text-[#111111]">
          Let's get to know you
        </Text>
        <Text className="mt-1 text-center text-[14px] text-[#6B7280]">
          Chat with Finly to set up your investor profile
        </Text>
      </View>

      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={$chatContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Completion banner */}
      {isComplete && (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <View className="mx-4 mb-2 rounded-[16px] bg-[#E8FAE8] px-4 py-3">
            <Text className="text-center text-[15px] font-semibold text-[#16A34A]">
              Profile captured! Setting up your portfolio...
            </Text>
          </View>
        </MotiView>
      )}

      {/* Input area */}
      {!isComplete && (
        <View className="border-t border-[#F1F2F6] bg-white px-4 pb-10 pt-3">
          <View className="flex-row items-center">
            <TextInput
              className="mr-3 flex-1 rounded-[20px] border border-[#E7EAF2] bg-[#F8F9FC] px-4 py-3 text-[16px] text-[#111111]"
              placeholder="Type your response..."
              placeholderTextColor="#A1A1AA"
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={handleTextSend}
              editable={!isBusy}
              returnKeyType="send"
            />
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full bg-[#2453FF]"
              onPress={handleTextSend}
              disabled={isBusy || !textInput.trim()}
            >
              {isBusy ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-[18px] font-bold text-white">{'>'}</Text>
              )}
            </Pressable>
          </View>

          {/* Skip link */}
          <Pressable className="mt-3 items-center" onPress={handleSkip}>
            <Text className="text-[13px] text-[#8E8E93]">Skip for now</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

const $chatContent: ViewStyle = {
  paddingHorizontal: 16,
  paddingTop: 20,
  paddingBottom: 12,
}
