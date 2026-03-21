import "react-native-reanimated"
import "@/utils/gestureHandler"

import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { Slot, SplashScreen } from "expo-router"
import { Platform, View } from "react-native"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import "../global.css"

import { initI18n } from "@/i18n"
import { ThemeProvider } from "@/theme/context"
import { customFontsToLoad } from "@/theme/typography"
import { loadDateFnsLocale } from "@/utils/formatDate"

SplashScreen.preventAutoHideAsync()

if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("@/devtools/ReactotronConfig")
}

export default function Root() {
  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  const loaded = fontsLoaded && isI18nInitialized

  useEffect(() => {
    if (fontError) throw fontError
  }, [fontError])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <KeyboardProvider>
          {Platform.OS === "web" ? (
            <View className="flex-1 items-center justify-center bg-[#E8EDF6] p-4">
              <View className="h-[852px] min-h-[852px] w-[393px] min-w-[393px] overflow-hidden rounded-[36px] border border-[#CFD9EA] bg-white shadow-2xl">
                <Slot />
              </View>
            </View>
          ) : (
            <Slot />
          )}
        </KeyboardProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
