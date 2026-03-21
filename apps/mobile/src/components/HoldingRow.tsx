/* eslint-disable no-restricted-imports */
import { useState } from "react"
import { Pressable, Text, View } from "react-native"

import { TickerLogo } from "@/components/TickerLogo"

type HoldingRowProps = {
  name: string
  logoUri?: string
  ticker: string
  shares?: number
  value: string
  allocationPercent: number
  changePercent: number
  onPress: () => void
  onViewBoard?: () => void
  borderColor?: string
}

export function HoldingRow({
  name,
  logoUri,
  ticker,
  shares,
  value,
  allocationPercent,
  changePercent,
  onPress,
  onViewBoard,
  borderColor = "#EEF2F7",
}: HoldingRowProps) {
  const [isViewBoardHovered, setIsViewBoardHovered] = useState(false)
  const [isViewBoardPressed, setIsViewBoardPressed] = useState(false)
  const sharesLabel =
    typeof shares === "number"
      ? Number.isInteger(shares)
        ? shares.toString()
        : shares.toFixed(2).replace(/\.?0+$/, "")
      : "--"

  return (
    <Pressable
      className="flex-row items-center justify-between border-b py-4 last:border-b-0"
      style={({ hovered }) => [{ borderColor }, hovered ? $hoverOutline : null]}
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <TickerLogo ticker={ticker} logoUri={logoUri} />
        <View className="ml-3">
          <Text className="font-sans text-[18px] font-semibold text-[#0F1728]">{name}</Text>
          <Text className="font-sans text-[15px] text-[#7A8699]">{ticker}</Text>
          <Text className="font-sans text-[13px] text-[#7A8699]">
            {sharesLabel} shares . {allocationPercent.toFixed(1)}% of portfolio
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="font-sans text-[18px] font-semibold text-[#0F1728]">{value}</Text>
        <Text
          className={`font-sans text-[15px] ${changePercent >= 0 ? "text-[#22B45A]" : "text-[#F04438]"}`}
        >
          {changePercent >= 0 ? "+" : ""}
          {changePercent}%
        </Text>
        <Pressable
          className="mt-1 rounded-full px-2 py-1"
          style={isViewBoardHovered || isViewBoardPressed ? $viewBoardActive : $viewBoardIdle}
          onHoverIn={() => setIsViewBoardHovered(true)}
          onHoverOut={() => setIsViewBoardHovered(false)}
          onPressIn={() => setIsViewBoardPressed(true)}
          onPressOut={() => setIsViewBoardPressed(false)}
          onPress={(event) => {
            event.stopPropagation()
            ;(onViewBoard ?? onPress)()
          }}
        >
          <Text
            className="font-sans text-[13px] font-semibold text-white"
            style={{ textDecorationLine: isViewBoardHovered || isViewBoardPressed ? "underline" : "none" }}
          >
            View board
          </Text>
        </Pressable>
      </View>
    </Pressable>
  )
}

const $hoverOutline = {
  borderWidth: 1,
  borderColor: "#000000",
  borderRadius: 14,
}

const $viewBoardIdle = {
  backgroundColor: "#bdc8e6",
}

const $viewBoardActive = {
  backgroundColor: "#000000",
}
