import { ReactNode } from "react"
import { ScrollView, ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"

type AiryScreenShellProps = {
  children: ReactNode
  variant?: "soft" | "indigo"
  contentContainerStyle?: ViewStyle
}

export function AiryScreenShell({
  children,
  variant = "soft",
  contentContainerStyle,
}: AiryScreenShellProps) {
  const gradientColors =
    variant === "indigo" ? (["#F6F8FF", "#FFFFFF"] as const) : (["#FAFBFF", "#FFFFFF"] as const)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute left-0 right-0 top-0 h-[180px]"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={[$content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

const $content: ViewStyle = {
  paddingBottom: 28,
  paddingHorizontal: 16,
}
