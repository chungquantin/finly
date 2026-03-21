/* eslint-disable no-restricted-imports */
// eslint-disable-next-line no-restricted-imports
import { Text, View, type ViewProps } from "react-native"

import { cn } from "@/lib/utils"
import { typography } from "@/theme/typography"

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
      <Text className="text-xs text-ink" style={{ fontFamily: typography.primary.semiBold }}>
        {label}
      </Text>
    </View>
  )
}
