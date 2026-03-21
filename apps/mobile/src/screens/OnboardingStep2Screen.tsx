/* eslint-disable no-restricted-imports */
import { Pressable, Text, View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"

import { AiryScreenShell } from "../components/AiryScreenShell"
import { cn } from "../lib/utils"
import { useOnboardingStore } from "../stores/onboardingStore"

const importOptions = [
  {
    key: "screenshot",
    icon: "SC",
    title: "Upload Screenshot",
    subtitle: "AI-powered sync from app images",
    iconBg: "bg-sky",
  },
  {
    key: "manual",
    icon: "MN",
    title: "Manual Entry",
    subtitle: "Type in your assets manually",
    iconBg: "bg-lemon",
  },
  {
    key: "csv",
    icon: "CV",
    title: "Attach CSV",
    subtitle: "Import from spreadsheet",
    iconBg: "bg-mint",
  },
] as const

export function OnboardingStep2Screen() {
  const router = useRouter()

  const stockImportMethod = useOnboardingStore((state) => state.stockImportMethod)
  const setStockImportMethod = useOnboardingStore((state) => state.setStockImportMethod)

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
          <Text className="text-[17px] font-semibold text-ink">Import Portfolio</Text>
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
            <Text className="text-[22px] font-semibold text-[#374151]">IP</Text>
          </View>
          <Text className="mt-6 text-center text-[28px] font-semibold leading-[33px] text-ink">
            How would you like to import?
          </Text>
          <Text className="mt-2 text-center text-[15px] leading-5 text-muted">
            Choose the most convenient way to sync your assets.
          </Text>
        </View>

        <View className="mt-8 gap-4">
          {importOptions.map((option) => {
            const selected = stockImportMethod === option.key

            return (
              <Pressable
                key={option.key}
                onPress={() => setStockImportMethod(option.key)}
                className={cn(
                  "rounded-[20px] border bg-card px-4 py-4",
                  selected ? "border-[#111827] bg-[#F8F9FC]" : "border-[#ECEEF4]",
                )}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
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
                    <View className="ml-3">
                      <Text className="text-[16px] font-semibold leading-5 text-ink">
                        {option.title}
                      </Text>
                      <Text className="text-[13px] leading-5 text-muted">{option.subtitle}</Text>
                    </View>
                  </View>

                  <Text className="text-[18px] text-muted">&gt;</Text>
                </View>
              </Pressable>
            )
          })}
        </View>

        <View className="mt-8">
          <Pressable
            className={cn(
              "h-16 items-center justify-center rounded-full",
              stockImportMethod ? "bg-[#34C759]" : "bg-[#E7EAF3]",
            )}
            disabled={!stockImportMethod}
            onPress={() => router.push("/onboarding/step-4")}
            accessibilityRole="button"
          >
            <Text
              className={cn(
                "text-[17px] font-semibold",
                stockImportMethod ? "text-white" : "text-muted",
              )}
            >
              Continue &gt;
            </Text>
          </Pressable>
          <Text className="mt-4 text-center text-[12px] text-muted">
            Select one option to continue
          </Text>
        </View>
      </View>
    </AiryScreenShell>
  )
}

const $contentContainer: ViewStyle = {
  paddingTop: 10,
  paddingBottom: 24,
}
