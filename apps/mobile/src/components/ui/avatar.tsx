/* eslint-disable no-restricted-imports */
// eslint-disable-next-line no-restricted-imports
import { View, type ViewProps } from "react-native"

import { Text } from "@/components/Text"
import { cn } from "@/lib/utils"

type AvatarProps = ViewProps & {
  className?: string
  label: string
}

export function Avatar({ className, label, ...props }: AvatarProps) {
  return (
    <View
      className={cn(
        "h-9 w-9 items-center justify-center rounded-full border border-white bg-lilac",
        className,
      )}
      {...props}
    >
      <Text className="text-xs text-ink" weight="semiBold">
        {label}
      </Text>
    </View>
  )
}
