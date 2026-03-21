/* eslint-disable no-restricted-imports */
import { Pressable, Text, View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"

import { AiryScreenShell } from "../components/AiryScreenShell"
import { useOnboardingStore } from "../stores/onboardingStore"
import { buildMockPortfolio } from "../utils/mockPortfolio"

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)

export function OnboardingCompleteScreen() {
  const router = useRouter()

  const riskExpertise = useOnboardingStore((state) => state.riskExpertise)
  const investmentHorizon = useOnboardingStore((state) => state.investmentHorizon)
  const financialKnowledge = useOnboardingStore((state) => state.financialKnowledge)
  const portfolioType = useOnboardingStore((state) => state.portfolioType)
  const walletAddress = useOnboardingStore((state) => state.walletAddress)
  const stockImportMethod = useOnboardingStore((state) => state.stockImportMethod)

  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding)

  const portfolio = buildMockPortfolio({
    riskExpertise,
    investmentHorizon,
    financialKnowledge,
    portfolioType,
    walletAddress,
    stockImportMethod,
  })

  const finish = () => {
    completeOnboarding()
    router.replace("/home")
  }

  return (
    <AiryScreenShell variant="soft" contentContainerStyle={$contentContainer}>
      <View className="mt-2 rounded-[28px] bg-card px-5 pb-6 pt-5">
        <View className="items-center">
          <Text className="text-[13px] font-semibold tracking-[2px] text-muted">STEP 4 OF 4</Text>
          <View className="mt-4 h-1.5 w-full rounded-full bg-[#E9EBF2]">
            <View className="h-1.5 w-full rounded-full bg-[#111827]" />
          </View>
        </View>

        <View className="mt-8 items-center">
          <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-[#EDFBEF]">
            <Text className="text-[22px] font-semibold text-[#16A34A]">OK</Text>
          </View>
          <Text className="mt-6 text-center text-[28px] font-semibold leading-[33px] text-ink">
            Profile complete
          </Text>
          <Text className="mt-2 text-center text-[15px] leading-5 text-muted">
            Your portfolio is ready. Here is your starter view.
          </Text>
        </View>

        <View className="mt-8 rounded-[20px] border border-[#ECEEF4] bg-[#FAFBFF] p-4">
          <Text className="text-[13px] font-semibold tracking-[1.5px] text-muted">
            TOTAL BALANCE
          </Text>
          <Text className="mt-2 text-[28px] font-semibold leading-[32px] text-ink">
            {money(portfolio.totalBalance)}
          </Text>
          <Text className="mt-1 text-[15px] font-semibold text-[#16A34A]">
            +{portfolio.todayGainPct}% today
          </Text>
        </View>

        <View className="mt-4 rounded-[20px] border border-[#ECEEF4] bg-card p-4">
          <Text className="text-[13px] font-semibold tracking-[1.5px] text-muted">
            PROFILE SUMMARY
          </Text>
          <Row label="Risk" value={riskExpertise} />
          <Row label="Investment taste" value={investmentHorizon} />
          <Row label="Knowledge" value={financialKnowledge} />
          <Row label="Portfolio type" value={portfolioType ?? "stock"} />
          <Row label="Onboarding source" value={portfolio.sourceLabel} />
        </View>

        <View className="mt-8">
          <Pressable
            className="h-16 items-center justify-center rounded-full bg-[#34C759]"
            onPress={finish}
            accessibilityRole="button"
          >
            <Text className="text-[17px] font-semibold text-white">Go to Home</Text>
          </Pressable>
        </View>
      </View>
    </AiryScreenShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="mt-3 flex-row items-center justify-between border-b border-border pb-3">
      <Text className="text-[13px] text-muted">{label}</Text>
      <Text className="text-[13px] font-semibold capitalize text-ink">{value}</Text>
    </View>
  )
}

const $contentContainer: ViewStyle = {
  paddingTop: 10,
  paddingBottom: 24,
}
