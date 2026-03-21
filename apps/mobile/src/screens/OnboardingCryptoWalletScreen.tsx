/* eslint-disable no-restricted-imports */
import { useMemo } from "react"
import { Pressable, Text, TextInput, View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"

import { AiryScreenShell } from "../components/AiryScreenShell"
import { cn } from "../lib/utils"
import { useOnboardingStore } from "../stores/onboardingStore"

const WALLET_MIN_LENGTH = 8

export function OnboardingCryptoWalletScreen() {
  const router = useRouter()

  const walletAddress = useOnboardingStore((state) => state.walletAddress)
  const setWalletAddress = useOnboardingStore((state) => state.setWalletAddress)

  const trimmedAddress = walletAddress.trim()
  const hasError = trimmedAddress.length > 0 && trimmedAddress.length < WALLET_MIN_LENGTH

  const helperText = useMemo(() => {
    if (trimmedAddress.length === 0) return "Paste or type your wallet address"
    if (hasError) return `Wallet address must be at least ${WALLET_MIN_LENGTH} characters`
    return "Wallet address looks good"
  }, [trimmedAddress, hasError])

  const canContinue = trimmedAddress.length >= WALLET_MIN_LENGTH

  return (
    <AiryScreenShell variant="soft" contentContainerStyle={$contentContainer}>
      <View className="mt-2 rounded-[28px] bg-card px-5 pb-6 pt-5">
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F7]"
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text className="text-[22px] font-semibold text-muted">&lt;</Text>
          </Pressable>
          <Text className="text-[17px] font-semibold text-ink">Crypto Wallet</Text>
          <View className="w-11" />
        </View>

        <View className="mt-6">
          <View className="flex-row items-end justify-between">
            <Text className="text-[13px] font-semibold tracking-[1.4px] text-muted">
              STEP 3 OF 4
            </Text>
            <Text className="text-[13px] font-semibold tracking-[1px] text-muted">75%</Text>
          </View>
          <View className="mt-3 h-1.5 w-full rounded-full bg-[#E9EBF2]">
            <View className="h-1.5 w-3/4 rounded-full bg-[#111827]" />
          </View>
        </View>

        <View className="mt-8 items-center">
          <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-[#F5F6FA]">
            <Text className="text-[22px] font-semibold text-[#374151]">CW</Text>
          </View>
          <Text className="mt-6 text-center text-[28px] font-semibold leading-[33px] text-ink">
            Connect your wallet
          </Text>
          <Text className="mt-2 text-center text-[15px] leading-5 text-muted">
            We use your address to build your crypto portfolio view.
          </Text>
        </View>

        <View className="mt-8">
          <Text className="text-[13px] font-semibold tracking-[1.5px] text-muted">
            WALLET ADDRESS
          </Text>
          <TextInput
            value={walletAddress}
            onChangeText={setWalletAddress}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="0x... or your wallet address"
            placeholderTextColor="#9CA3AF"
            className={cn(
              "mt-3 rounded-[20px] border bg-card px-4 py-4 text-[15px] text-ink",
              hasError ? "border-[#EF4444]" : "border-border",
            )}
          />
          <Text className={cn("mt-2 text-[13px]", hasError ? "text-[#DC2626]" : "text-muted")}>
            {helperText}
          </Text>
        </View>

        <View className="mt-8">
          <Pressable
            className={cn(
              "h-16 items-center justify-center rounded-full",
              canContinue ? "bg-[#34C759]" : "bg-[#E7EAF3]",
            )}
            disabled={!canContinue}
            onPress={() => router.push("/onboarding/step-4")}
            accessibilityRole="button"
          >
            <Text
              className={cn("text-[17px] font-semibold", canContinue ? "text-white" : "text-muted")}
            >
              Continue &gt;
            </Text>
          </Pressable>
        </View>
      </View>
    </AiryScreenShell>
  )
}

const $contentContainer: ViewStyle = {
  paddingTop: 10,
  paddingBottom: 24,
}
