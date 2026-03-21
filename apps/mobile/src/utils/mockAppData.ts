export type TeamAgent = {
  id: string
  name: string
  avatar: string
  role: string
  specialty: string
  bio: string
  mandate: string
  status: "active" | "monitoring" | "idle"
  confidence: number
  lastUpdate: string
  location: string
  decisionStyle: string
  timeHorizon: string
  riskBias: string
  coverage: string
  responseCadence: string
  primaryObjective: string
  focusAreas: string[]
  strengths: string[]
  watchlist: string[]
  attributes: { label: string; value: string }[]
}

export type Holding = {
  ticker: string
  name: string
  logoUri?: string
  shares: number
  valueUsd: number
  changePercent: number
  allocationPercent: number
}

const buildTickerIconUrl = (ticker: string) =>
  `https://raw.githubusercontent.com/nvstly/icons/main/ticker_icons/${ticker}.png`

export type BoardMessage = {
  id: string
  author: string
  role: "user" | "portfolio-manager" | "market-analyst" | "risk-assessor" | "researcher"
  avatar: string
  message: string
  time: string
  reaction?: string
}

export const portfolioSnapshot = {
  totalValueUsd: 184230,
  dailyPnlUsd: 2140,
  dailyPnlPercent: 1.17,
  monthlyPnlPercent: 6.8,
  yearlyPnlPercent: 18.4,
  investedUsd: 155000,
  cashUsd: 12400,
}

export const teamAgents: TeamAgent[] = [
  {
    id: "portfolio-manager",
    name: "Avery",
    avatar: "AV",
    role: "Portfolio Manager",
    specialty: "Allocation and execution plan",
    bio: "Avery translates team research into a portfolio plan, balancing conviction, sizing, and timing so the portfolio stays aligned with the user's target risk.",
    mandate:
      "Own allocation decisions, propose rebalances, and turn agent input into a single investable action plan.",
    status: "active",
    confidence: 0.84,
    lastUpdate: "2m ago",
    location: "Allocation Desk",
    decisionStyle: "Decisive, portfolio-first",
    timeHorizon: "2 to 8 weeks",
    riskBias: "Moderate",
    coverage: "Cross-sector equity allocation",
    responseCadence: "Real-time on major market moves",
    primaryObjective: "Compound returns while keeping concentration and cash levels within plan.",
    focusAreas: ["Position sizing", "Capital rotation", "Entry timing", "Cash deployment"],
    strengths: [
      "Synthesizes conflicting agent views into one executable plan",
      "Keeps portfolio weights aligned to target exposure",
      "Adapts quickly when new data changes conviction",
    ],
    watchlist: ["VCB", "FPT", "MWG", "Defensive dividend names"],
    attributes: [
      { label: "Win Rate", value: "71%" },
      { label: "Avg Rebalance", value: "3.2 positions" },
      { label: "Max Conviction", value: "22% position cap" },
      { label: "Cash Target", value: "6% to 12%" },
    ],
  },
  {
    id: "market-analyst",
    name: "Kai",
    avatar: "KA",
    role: "Market Analyst",
    specialty: "Macro and trend detection",
    bio: "Kai tracks market regime, liquidity conditions, and momentum shifts to flag when the environment supports offense, defense, or patient waiting.",
    mandate:
      "Interpret macro signals and market breadth so the board understands when trends are healthy, fading, or reversing.",
    status: "active",
    confidence: 0.79,
    lastUpdate: "4m ago",
    location: "Market Intelligence",
    decisionStyle: "Signal-driven, probabilistic",
    timeHorizon: "1 day to 6 weeks",
    riskBias: "Adaptive",
    coverage: "Macro, rates, breadth, momentum",
    responseCadence: "Every open and key macro print",
    primaryObjective:
      "Detect market regime changes before they materially impact portfolio positioning.",
    focusAreas: ["Breadth", "Rates sensitivity", "Sector leadership", "Momentum decay"],
    strengths: [
      "Identifies early trend fatigue before price fully rolls over",
      "Frames market conditions in plain language for the team",
      "Separates tactical noise from structural direction",
    ],
    watchlist: ["VNINDEX breadth", "Rate expectations", "Banking leadership", "Foreign inflows"],
    attributes: [
      { label: "Signal Confidence", value: "79%" },
      { label: "Macro Windows", value: "5 tracked" },
      { label: "Alert Latency", value: "< 3 min" },
      { label: "Regime State", value: "Late-cycle risk-on" },
    ],
  },
  {
    id: "risk-assessor",
    name: "Noor",
    avatar: "NO",
    role: "Risk Assessor",
    specialty: "Drawdown and volatility guardrails",
    bio: "Noor pressure-tests every proposed move against loss limits, concentration constraints, and volatility shock scenarios before the team acts.",
    mandate:
      "Protect downside by enforcing exposure guardrails, stress assumptions, and escalation rules for fast-changing conditions.",
    status: "monitoring",
    confidence: 0.88,
    lastUpdate: "1m ago",
    location: "Risk Control",
    decisionStyle: "Guardrail-first, disciplined",
    timeHorizon: "Intraday to 1 month",
    riskBias: "Defensive",
    coverage: "Drawdown, volatility, exposure limits",
    responseCadence: "Continuous monitoring",
    primaryObjective: "Keep portfolio losses contained while preserving room for selective upside.",
    focusAreas: ["VaR", "Concentration", "Stop-loss discipline", "Scenario stress"],
    strengths: [
      "Flags hidden correlation risk across seemingly different names",
      "Maintains discipline when conviction runs ahead of evidence",
      "Escalates fast when volatility regimes break",
    ],
    watchlist: [
      "Single-name concentration",
      "Correlation clusters",
      "Event risk calendar",
      "Liquidity gaps",
    ],
    attributes: [
      { label: "Portfolio VaR", value: "4.8%" },
      { label: "Stress Scenarios", value: "12 active" },
      { label: "Loss Trigger", value: "-6% weekly" },
      { label: "Monitoring Mode", value: "Elevated" },
    ],
  },
  {
    id: "researcher",
    name: "Milo",
    avatar: "MI",
    role: "Researcher",
    specialty: "Catalyst and earnings research",
    bio: "Milo hunts for company-specific catalysts, fundamental changes, and earnings narratives that can create asymmetric upside or warn against weak stories.",
    mandate:
      "Supply the board with concise company research, catalyst tracking, and fast reads on earnings-quality signals.",
    status: "idle",
    confidence: 0.74,
    lastUpdate: "8m ago",
    location: "Research Lab",
    decisionStyle: "Thesis-driven, evidence-heavy",
    timeHorizon: "2 weeks to 2 quarters",
    riskBias: "Selective",
    coverage: "Catalysts, earnings, company updates",
    responseCadence: "On filings, news, and earnings",
    primaryObjective:
      "Surface the highest-upside ideas with enough evidence for the board to act confidently.",
    focusAreas: ["Earnings quality", "Catalyst mapping", "Management signals", "Valuation context"],
    strengths: [
      "Turns noisy filings into a short, useful thesis summary",
      "Separates durable catalysts from one-day headlines",
      "Builds clear bull and bear cases for each idea",
    ],
    watchlist: ["Earnings revisions", "Guidance changes", "Insider activity", "Sector catalysts"],
    attributes: [
      { label: "Live Dossiers", value: "18 names" },
      { label: "Catalyst Queue", value: "6 upcoming" },
      { label: "Earnings Hit Rate", value: "68%" },
      { label: "Research Depth", value: "High conviction" },
    ],
  },
]

export const holdings: Holding[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA",
    logoUri: buildTickerIconUrl("NVDA"),
    shares: 120,
    valueUsd: 46200,
    changePercent: 2.4,
    allocationPercent: 25.1,
  },
  {
    ticker: "TSLA",
    name: "Tesla",
    logoUri: buildTickerIconUrl("TSLA"),
    shares: 95,
    valueUsd: 31800,
    changePercent: 1.1,
    allocationPercent: 17.3,
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    logoUri: buildTickerIconUrl("MSFT"),
    shares: 84,
    valueUsd: 29650,
    changePercent: 0.8,
    allocationPercent: 16.1,
  },
  {
    ticker: "AAPL",
    name: "Apple",
    logoUri: buildTickerIconUrl("AAPL"),
    shares: 136,
    valueUsd: 22140,
    changePercent: -0.3,
    allocationPercent: 12.0,
  },
]

export const boardMessages: BoardMessage[] = [
  {
    id: "1",
    author: "You",
    role: "user",
    avatar: "YU",
    message: "Are we still rotating out of banks if CPI stays hot next week?",
    time: "09:12",
  },
  {
    id: "2",
    author: "Avery",
    role: "portfolio-manager",
    avatar: "AV",
    message: "Yes. I would trim TPB by 3% first and build cash before adding any new risk.",
    time: "09:13",
    reaction: "📌",
  },
  {
    id: "3",
    author: "Kai",
    role: "market-analyst",
    avatar: "KA",
    message:
      "Momentum is still constructive, but breadth is thinning. We should rotate gradually, not all at once.",
    time: "09:13",
  },
  {
    id: "4",
    author: "You",
    role: "user",
    avatar: "YU",
    message: "Who feels strongest about utilities if we need a safer add?",
    time: "09:14",
  },
  {
    id: "5",
    author: "Noor",
    role: "risk-assessor",
    avatar: "NO",
    message:
      "I am good with utilities if we keep new adds under 4% and protect the cash buffer above 10%.",
    time: "09:15",
    reaction: "🛡️",
  },
  {
    id: "6",
    author: "You",
    role: "user",
    avatar: "YU",
    message: "What about FPT if tech leadership keeps holding into earnings?",
    time: "09:16",
  },
  {
    id: "7",
    author: "Milo",
    role: "researcher",
    avatar: "MI",
    message:
      "Still constructive. I found two catalysts and can drop a short note before lunch for the board.",
    time: "09:17",
    reaction: "🔥",
  },
]
