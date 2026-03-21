/* eslint-disable no-restricted-imports */
import { Pressable, View } from "react-native"

import { Text } from "@/components/Text"

type IosHeaderProps = {
  title: string
  leftLabel?: string
  rightLabel?: string
  onLeftPress?: () => void
  onRightPress?: () => void
  titleClassName?: string
}

export function IosHeader({
  title,
  leftLabel,
  rightLabel,
  onLeftPress,
  onRightPress,
  titleClassName,
}: IosHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
      {onLeftPress ? (
        <Pressable
          className="h-10 min-w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 px-2"
          onPress={onLeftPress}
        >
          <Text className="text-[18px] text-[#8E8E93]">{leftLabel ?? " "}</Text>
        </Pressable>
      ) : (
        <View className="h-10 min-w-10 px-2" />
      )}

      <Text
        className={`text-[30px] font-semibold leading-[34px] text-[#111111] ${titleClassName ?? ""}`}
        weight="semiBold"
      >
        {title}
      </Text>

      {onRightPress ? (
        <Pressable
          className="h-10 min-w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 px-2"
          onPress={onRightPress}
        >
          <Text className="text-[15px] text-[#8E8E93]" weight="semiBold">
            {rightLabel ?? " "}
          </Text>
        </Pressable>
      ) : (
        <View className="h-10 min-w-10 px-2" />
      )}
    </View>
  )
}
