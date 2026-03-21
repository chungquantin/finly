/* eslint-disable no-restricted-imports */
import { Pressable, Text, View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"

import { AiryScreenShell } from "../components/AiryScreenShell"
import { cn } from "../lib/utils"
import { useOnboardingStore } from "../stores/onboardingStore"

const portfolioOptions = [
  {
    key: "crypto",
    title: "Crypto Portfolio",
    subtitle: "Connect wallet to import on-chain assets",
    icon: "CR",
    iconBg: "bg-lemon",
  },
  {
    key: "stock",
    title: "Stock Portfolio",
    subtitle: "Import positions by screenshot, manual, or CSV",
    icon: "ST",
    iconBg: "bg-sky",
  },
] as const

export function OnboardingPortfolioTypeScreen() {
  const router = useRouter()

  const portfolioType = useOnboardingStore((state) => state.portfolioType)
  const setPortfolioType = useOnboardingStore((state) => state.setPortfolioType)

  const goNext = () => {
    if (!portfolioType) return

    if (portfolioType === "crypto") {
      router.push("/onboarding/step-3/crypto")
      return
    }

    router.push("/onboarding/step-3/stock")
  }

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
          <Text className="text-[17px] font-semibold text-ink">Portfolio Type</Text>
          <View className="w-11" />
        </View>

        <View className="mt-6">
          <View className="flex-row items-end justify-between">
            <Text className="text-[13px] font-semibold tracking-[1.4px] text-muted">
              STEP 2 OF 4
            </Text>
            <Text className="text-[13px] font-semibold tracking-[1px] text-muted">50%</Text>
          </View>
          <View className="mt-3 h-1.5 w-full rounded-full bg-[#E9EBF2]">
            <View className="h-1.5 w-2/4 rounded-full bg-[#1F2937]" />
          </View>
        </View>

        <View className="mt-8 items-center">
          <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-[#F5F6FA]">
            <Text className="text-[22px] font-semibold text-[#374151]">PT</Text>
          </View>
          <Text className="mt-6 text-center text-[28px] font-semibold leading-[33px] text-ink">
            What are you onboarding?
          </Text>
          <Text className="mt-2 text-center text-[15px] leading-5 text-muted">
            Select a portfolio type to continue setup.
          </Text>
        </View>

        <View className="mt-8 gap-4">
          {portfolioOptions.map((option) => {
            const selected = portfolioType === option.key

            return (
              <Pressable
                key={option.key}
                onPress={() => setPortfolioType(option.key)}
                className={cn(
                  "rounded-[20px] border bg-card px-4 py-4",
                  selected ? "border-[#111827] bg-[#F8F9FC]" : "border-[#ECEEF4]",
                )}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center">
                    <View
                      className={cn(
                        "h-12 w-12 items-center justify-center rounded-full",
                        option.iconBg,
                      )}
                    >
                      <Text className="text-[16px] font-semibold text-[#1F2937]">
                        {option.icon}
                      </Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-[16px] font-semibold leading-5 text-ink"
                      >
                        {option.title}
                      </Text>
                      <Text numberOfLines={2} className="text-[13px] leading-5 text-muted">
                        {option.subtitle}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={cn(
                      "ml-3 h-5 w-5 shrink-0 rounded-full border",
                      selected ? "border-[#111827] bg-[#111827]" : "border-border bg-card",
                    )}
                  />
                </View>
              </Pressable>
            )
          })}
        </View>

        <View className="mt-8">
          <Pressable
            className={cn(
              "h-16 items-center justify-center rounded-full",
              portfolioType ? "bg-[#34C759]" : "bg-[#E7EAF3]",
            )}
            onPress={goNext}
            accessibilityRole="button"
          >
            <Text
              className={cn(
                "text-[17px] font-semibold",
                portfolioType ? "text-white" : "text-muted",
              )}
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
