const avatarGlyphs = ["🦊", "🐼", "🦉", "🐯", "🦁", "🐬", "🦄", "🐻", "🦋", "🐙"] as const

const avatarPalettes = [
  { background: "#EEF3FF", accent: "#2453FF", ring: "#DCE5FF" },
  { background: "#FFF4EA", accent: "#D96B2B", ring: "#FFE4D0" },
  { background: "#ECFFF5", accent: "#169B62", ring: "#CEF5E0" },
  { background: "#FFF0F6", accent: "#C2437D", ring: "#FFD8E8" },
  { background: "#F3F0FF", accent: "#6A4CE0", ring: "#E0D8FF" },
  { background: "#EEFDFC", accent: "#178A8A", ring: "#D2F6F4" },
] as const

const hashString = (value: string) =>
  value.split("").reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7)

export const getRandomAgentAvatar = (seed: string) => {
  const hash = hashString(seed)
  return {
    glyph: avatarGlyphs[hash % avatarGlyphs.length],
    palette: avatarPalettes[hash % avatarPalettes.length],
  }
}
