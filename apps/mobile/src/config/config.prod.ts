/**
 * These are configuration settings for the production environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://finly-backend.up.railway.app/"
const marketDataUrl = process.env.EXPO_PUBLIC_MARKET_DATA_URL || apiUrl
const agentServerUrl =
  process.env.EXPO_PUBLIC_AGENT_SERVER_URL || "https://finly-agents.up.railway.app/"

export default {
  API_URL: apiUrl,
  MARKET_DATA_URL: marketDataUrl,
  AGENT_SERVER_URL: agentServerUrl,
}
