import { Platform } from "react-native"

export const customFontsToLoad = {}

const fonts = {
  systemSans: {
    // Use the native system sans family so iOS renders with San Francisco.
    light: Platform.select({ ios: "System", android: "sans-serif-light" })!,
    normal: Platform.select({ ios: "System", android: "sans-serif" })!,
    medium: Platform.select({ ios: "System", android: "sans-serif-medium" })!,
    semiBold: Platform.select({ ios: "System", android: "sans-serif-medium" })!,
    bold: Platform.select({ ios: "System", android: "sans-serif" })!,
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.systemSans,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: fonts.helveticaNeue, android: fonts.sansSerif }),
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
}
