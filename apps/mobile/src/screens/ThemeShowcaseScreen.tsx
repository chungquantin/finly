/* eslint-disable no-restricted-imports */
import { Pressable, Text, TextInput, View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { AiryScreenShell } from "@/components/AiryScreenShell"
import { IosHeader } from "@/components/IosHeader"
import { cn } from "@/lib/utils"
import { useOnboardingStore } from "@/stores/onboardingStore"

const riskLevels = ["beginner", "intermediate", "expert"] as const

const horizons = [
  { key: "short", title: "Short term", subtitle: "1-3 years" },
  { key: "medium", title: "Medium term", subtitle: "3-7 years" },
  { key: "long", title: "Long term", subtitle: "7+ years" },
] as const

const knowledgeLevels = [
  { key: "novice", label: "Novice" },
  { key: "savvy", label: "Savvy" },
  { key: "pro", label: "Pro" },
] as const

export function ThemeShowcaseScreen() {
  const router = useRouter()

  const name = useOnboardingStore((state) => state.name)
  const selectedRisk = useOnboardingStore((state) => state.riskExpertise)
  const selectedHorizon = useOnboardingStore((state) => state.investmentHorizon)
  const selectedKnowledge = useOnboardingStore((state) => state.financialKnowledge)

  const setName = useOnboardingStore((state) => state.setName)
  const setRiskExpertise = useOnboardingStore((state) => state.setRiskExpertise)
  const setInvestmentHorizon = useOnboardingStore((state) => state.setInvestmentHorizon)
  const setFinancialKnowledge = useOnboardingStore((state) => state.setFinancialKnowledge)
  const setPortfolioType = useOnboardingStore((state) => state.setPortfolioType)
  const setWalletAddress = useOnboardingStore((state) => state.setWalletAddress)
  const setStockImportMethod = useOnboardingStore((state) => state.setStockImportMethod)
  const setOnboardingCompleted = useOnboardingStore((state) => state.setOnboardingCompleted)

  const continueToStep2 = () => {
    setOnboardingCompleted(false)
    router.push("/onboarding/step-2")
  }

  const skipToStep4 = () => {
    setPortfolioType("stock")
    setWalletAddress("")
    setStockImportMethod("manual")
    setOnboardingCompleted(false)
    router.push("/onboarding/step-4")
  }

  return (
    <AiryScreenShell variant="soft" contentContainerStyle={$contentContainer}>
      <View className="mt-2 rounded-[36px] border border-[#F1F2F6] bg-white px-4 pb-6 pt-5">
        <IosHeader
          title="Add wallet"
          titleClassName="text-[24px] leading-[28px]"
          leftLabel="‹"
          rightLabel="?"
          onLeftPress={() => router.back()}
          onRightPress={() => {}}
        />

        <View className="mt-3 rounded-[30px] bg-[#F8FAFF] px-5 py-5">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-[13px] font-semibold tracking-[1.4px] text-[#8E8E93]">
                STEP 1 OF 4
              </Text>
              <Text className="mt-3 text-[31px] font-semibold leading-[36px] text-[#111111]">
                Build your investor profile
              </Text>
              <Text className="mt-2 text-[16px] leading-6 text-[#6B7280]">
                Match your dashboard experience to your goals, comfort level, and investing style.
              </Text>
            </View>

            <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-white">
              <Ionicons name="sparkles-outline" size={28} color="#2453FF" />
            </View>
          </View>

          <View className="mt-4 h-1.5 w-full rounded-full bg-[#E9EBF2]">
            <View className="h-1.5 w-1/4 rounded-full bg-[#2453FF]" />
          </View>
        </View>

        <SectionCard className="mt-4">
          <Text className="text-[13px] font-semibold tracking-[1.2px] text-[#8E8E93]">NAME</Text>
          <Text className="mt-2 text-[22px] font-semibold text-[#111111]">
            What should we call you?
          </Text>
          <TextInput
            className="mt-4 rounded-[22px] border border-[#E7EAF2] bg-[#F8F9FC] px-4 py-4 text-[17px] text-[#111111]"
            placeholder="Enter your name"
            placeholderTextColor="#A1A1AA"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </SectionCard>

        <SectionCard className="mt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[13px] font-semibold tracking-[1.2px] text-[#8E8E93]">
                RISK PROFILE
              </Text>
              <Text className="mt-2 text-[22px] font-semibold text-[#111111]">Risk expertise</Text>
            </View>
            <View className="rounded-full bg-[#F3F5FA] px-3 py-2">
              <Text className="text-[13px] text-[#6B7280]">Personalized</Text>
            </View>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {riskLevels.map((item) => (
              <Chip
                key={item}
                label={capitalize(item)}
                selected={selectedRisk === item}
                onPress={() => setRiskExpertise(item)}
              />
            ))}
          </View>
        </SectionCard>

        <SectionCard className="mt-4">
          <Text className="text-[13px] font-semibold tracking-[1.2px] text-[#8E8E93]">
            TIMEFRAME
          </Text>
          <Text className="mt-2 text-[22px] font-semibold text-[#111111]">Investment horizon</Text>

          <View className="mt-4">
            {horizons.map((item) => {
              const selected = selectedHorizon === item.key

              return (
                <Pressable
                  key={item.key}
                  className="flex-row items-center justify-between border-b border-[#ECEEF4] py-4 last:border-b-0"
                  onPress={() => setInvestmentHorizon(item.key)}
                >
                  <View>
                    <Text className="text-[18px] font-semibold text-[#111111]">{item.title}</Text>
                    <Text className="mt-1 text-[15px] text-[#8E8E93]">{item.subtitle}</Text>
                  </View>

                  <View
                    className={cn(
                      "h-7 w-7 items-center justify-center rounded-full border",
                      selected ? "border-[#2453FF] bg-[#EEF2FF]" : "border-[#D6DBE6] bg-white",
                    )}
                  >
                    {selected ? <View className="h-3.5 w-3.5 rounded-full bg-[#2453FF]" /> : null}
                  </View>
                </Pressable>
              )
            })}
          </View>
        </SectionCard>

        <SectionCard className="mt-4">
          <Text className="text-[13px] font-semibold tracking-[1.2px] text-[#8E8E93]">
            EXPERIENCE
          </Text>
          <Text className="mt-2 text-[22px] font-semibold text-[#111111]">Financial knowledge</Text>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {knowledgeLevels.map((item) => (
              <Chip
                key={item.key}
                label={item.label}
                selected={selectedKnowledge === item.key}
                onPress={() => setFinancialKnowledge(item.key)}
              />
            ))}
          </View>
        </SectionCard>

        <Pressable
          className="mt-5 h-16 items-center justify-center rounded-[26px] bg-[#34C759]"
          onPress={continueToStep2}
        >
          <Text className="text-[18px] font-semibold text-white">Continue</Text>
        </Pressable>

        <Pressable className="items-center py-4" onPress={skipToStep4}>
          <Text className="text-[15px] font-medium text-[#8E8E93]">Skip for now</Text>
        </Pressable>
      </View>
    </AiryScreenShell>
  )
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn("rounded-[30px] border border-[#F1F2F6] bg-white p-5", className)}>
      {children}
    </View>
  )
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      className={cn("rounded-full px-4 py-2.5", selected ? "bg-[#2453FF]" : "bg-[#F3F5FA]")}
      onPress={onPress}
    >
      <Text className={cn("text-[15px] font-medium", selected ? "text-white" : "text-[#6B7280]")}>
        {label}
      </Text>
    </Pressable>
  )
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const $contentContainer: ViewStyle = {
  paddingTop: 10,
  paddingBottom: 24,
}
