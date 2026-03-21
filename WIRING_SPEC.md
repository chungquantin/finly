# Finly Mobile ↔ Backend Wiring Spec

This spec documents every gap between the mobile app and the backend API, with exact file paths, line numbers, API contracts, and implementation instructions. It is designed so that any developer or coding agent can pick up a work item and implement it without further context.

**User ID convention**: All API calls use `"user_mvp_1"` as the hardcoded user ID for the hackathon demo.

**API client**: `apps/mobile/src/services/api/index.ts` — singleton `api` instance. All methods already exist (onboarding, chat, intake, generateReport, panelChat, importPortfolio, getPortfolio, getProfile). Types are in `apps/mobile/src/services/api/types.ts`.

**Base URL**: `apps/mobile/src/config/config.dev.ts` — currently `http://192.168.37.85:8000`. Update to deployed Railway URL in `config.prod.ts` after deploy.

---

## Table of Contents

1. [WS-1: Voice Onboarding (Conversational Intake)](#ws-1-voice-onboarding)
2. [WS-2: Board Thread → Panel Chat](#ws-2-board-thread--panel-chat)
3. [WS-3: New Thread Creation (Report Generation)](#ws-3-new-thread-creation)
4. [WS-4: Heartbeat Alerts UI + Custom Scenarios](#ws-4-heartbeat-alerts)
5. [WS-5: Voice Playback on Agent Responses](#ws-5-voice-playback)
6. [WS-6: Portfolio from Backend](#ws-6-portfolio-from-backend)
7. [WS-7: Home Screen Live Agent Data](#ws-7-home-screen-live-agent-data)
8. [WS-8: Live Stock Charts](#ws-8-live-stock-charts)

---

## WS-1: Voice Onboarding

**Goal**: Replace the current form-based onboarding (steps 1-4) with a real-time voice conversation where the user talks to a voice agent who extracts their risk profile, goals, and investment preferences through natural conversation.

### Current State

- Onboarding is a 4-step form flow:
  - `apps/mobile/app/onboarding/step-1.tsx` → `ThemeShowcaseScreen` (name, risk, horizon, knowledge chips)
  - `apps/mobile/app/onboarding/step-2.tsx` → `OnboardingPortfolioTypeScreen` (crypto/stock)
  - `apps/mobile/app/onboarding/step-3/` → wallet or stock import
  - `apps/mobile/app/onboarding/step-4.tsx` → `OnboardingCompleteScreen` (calls `api.onboarding()` + `api.importPortfolio()`)
- Screen implementations live in `apps/mobile/src/screens/`
- `OnboardingCompleteScreen` is the only step that calls the backend

### Backend API Available

**Intake endpoint** (conversational goal extraction):
```
POST /api/intake
Request:  { user_id: string, message: string }
Response: {
  user_id: string,
  message: string,         // agent's reply text
  is_complete: boolean,    // true when goals extracted
  follow_up_count: number, // max 2 follow-ups
  goals_brief: string | null,
  audio_b64: string | null // base64 MP3 if ElevenLabs configured
}
```

**Onboarding endpoint** (creates user profile):
```
POST /api/onboarding
Request:  { user_id: string, risk_score: number, horizon: "short"|"medium"|"long", knowledge: number }
Response: { profile: UserProfile, welcome_message: string, audio_b64: string | null }
```

**Intake reset**:
```
POST /api/intake/reset?user_id=user_mvp_1
```

### Implementation Plan

#### Option A: Voice Chat Screen (Recommended for Demo)

Replace onboarding with a single voice conversation screen:

**New file**: `apps/mobile/src/screens/VoiceOnboardingScreen.tsx`

**UX flow**:
1. User lands on a voice chat screen with a mic button and text input fallback
2. User taps mic → record audio → send as text via speech-to-text (or type)
3. App calls `POST /api/intake` with the user's message
4. Backend responds with agent text + `audio_b64`
5. App plays the audio via `playBase64Audio()` from `src/utils/playAudio.ts`
6. Conversation continues until `is_complete === true` (max 2 follow-ups)
7. When complete, app calls `POST /api/onboarding` with extracted profile data
8. App calls `POST /api/portfolio/import` with `mode: "mock"`
9. Navigate to home tab

**Speech-to-text options** (pick one):
- `expo-speech-recognition` — wraps native iOS speech recognition, works on-device
- `@react-native-voice/voice` — community package, good iOS support
- Manual: record audio with `expo-av`, send to a transcription API (Deepgram, Whisper)

**State to track**:
```typescript
type VoiceOnboardingState = {
  messages: { role: "user" | "agent", text: string, audio_b64?: string }[]
  isListening: boolean
  isProcessing: boolean
  isComplete: boolean
}
```

**Mapping intake results to onboarding profile**:
The intake `goals_brief` is free text. After intake completes, you need to either:
- Use the form chips as a fallback step ("Confirm your profile") after the conversation
- Or parse the goals_brief on the backend to auto-derive risk_score/horizon/knowledge

**Recommended for demo**: Keep it simple. After voice conversation completes, show a brief confirmation screen with the profile chips pre-filled, then call `api.onboarding()`.

#### Files to Modify

| File | Change |
|------|--------|
| `apps/mobile/src/screens/VoiceOnboardingScreen.tsx` | **Create** — voice chat UI with mic button, message list, auto-play TTS |
| `apps/mobile/app/onboarding/step-1.tsx` | Change to render `VoiceOnboardingScreen` instead of `ThemeShowcaseScreen` |
| `apps/mobile/src/stores/onboardingStore.ts` | No changes needed — still stores the final profile values |
| `apps/mobile/src/services/api/index.ts` | No changes — `api.intake()` already exists (line 111) |
| `apps/mobile/src/utils/playAudio.ts` | No changes — `playBase64Audio()` already works |

#### Key Code References

- API client intake method: `apps/mobile/src/services/api/index.ts:111-121`
- API client onboarding method: `apps/mobile/src/services/api/index.ts:49-61`
- Audio playback utility: `apps/mobile/src/utils/playAudio.ts:17-44`
- Onboarding store: `apps/mobile/src/stores/onboardingStore.ts`
- Backend intake handler: `apps/agents/src/finly_agents/server.py` — search for `POST /api/intake`
- Backend intake logic: `apps/agents/src/finly_agents/intake.py` — MAX_FOLLOW_UPS = 2

---

## WS-2: Board Thread → Panel Chat

**Goal**: Wire the thread detail chat so that when the user sends a message, it calls the backend panel chat API and displays real agent responses.

### Current State

- Board tab (`apps/mobile/app/(tabs)/board.tsx`): Shows `boardThreads` from `mockAppData.ts` — 4 hardcoded threads (NVDA, TSLA, MSFT, AAPL)
- Thread detail (`apps/mobile/app/thread/[id].tsx`):
  - Displays mock messages from the thread
  - Text input works but `handleSend()` (line 61) only appends to local `messages` state
  - No API calls — user messages go nowhere
  - No agent response generation

### Backend API Available

**Panel chat** (talk to the agent board about an existing report):
```
POST /api/report/chat
Request:  { user_id: string, message: string, report_id?: string }
Response: {
  user_id: string,
  question: string,
  agent_responses: [
    { agent_role: string, agent_name: string, response: string },
    ...  // 4 agents: Analyst, Researcher, Trader, Advisor
  ],
  memory_updates: string[]
}
```

**Requirement**: A report must exist before panel chat works. The backend checks `get_latest_report(user_id)` and returns "No report has been generated yet" if none exists.

### Implementation Plan

**File to modify**: `apps/mobile/app/thread/[id].tsx`

**Changes to `handleSend()`** (currently line 61-76):

```typescript
const handleSend = async () => {
  const nextMessage = draft.trim()
  if (!nextMessage) return

  // 1. Append user message immediately (optimistic)
  setMessages((current) => [
    ...current,
    {
      id: String(current.length + 1),
      author: "You",
      role: "user",
      avatar: "YU",
      message: nextMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  setDraft("")
  setIsLoading(true)

  // 2. Call panel chat API
  const result = await api.panelChat({
    user_id: "user_mvp_1",
    message: nextMessage,
  })

  if (result.kind === "ok") {
    // 3. Append each agent response as a separate message
    const agentMessages = result.data.agent_responses.map((resp, i) => ({
      id: String(messages.length + 2 + i),
      author: resp.agent_name,
      role: mapAgentRole(resp.agent_role), // map "analyst" -> "market-analyst" etc.
      avatar: resp.agent_name.slice(0, 2).toUpperCase(),
      message: resp.response,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }))
    setMessages((current) => [...current, ...agentMessages])
  } else {
    // 4. Show error state (optional: toast or inline error message)
  }

  setIsLoading(false)
}
```

**Agent role mapping** (backend returns simplified roles):
```typescript
function mapAgentRole(role: string): BoardMessage["role"] {
  const map: Record<string, BoardMessage["role"]> = {
    analyst: "market-analyst",
    researcher: "researcher",
    trader: "portfolio-manager",
    advisor: "portfolio-manager",
  }
  return map[role] ?? "researcher"
}
```

**Add imports**:
```typescript
import { api } from "@/services/api"
```

**Add loading state**: Show a typing indicator or spinner while waiting for agent responses (panel chat takes up to 60s).

#### Files to Modify

| File | Change |
|------|--------|
| `apps/mobile/app/thread/[id].tsx` | Wire `handleSend` to `api.panelChat()`, add loading state, map agent responses to BoardMessage format |

#### Dependency

This will only return real agent responses if a report has been generated first (see WS-3). Without a report, the backend returns a canned "generate a report first" message from all 4 agents.

---

## WS-3: New Thread Creation (Report Generation)

**Goal**: Allow the user to create a new board thread by asking a question about a ticker, which triggers the full agent pipeline and creates a report.

### Current State

- Board tab shows 4 hardcoded threads from `boardThreads` in `mockAppData.ts`
- No way to create a new thread
- No report generation from the mobile app (the `DashboardScreen` has it but is not in the navigation)

### Backend API Available

**Report generation** (runs full multi-agent pipeline):
```
POST /api/report/generate
Request:  { user_id: string, ticker?: string, portfolio?: Record[] }
Response: {
  report_id: string,
  user_id: string,
  ticker: string,
  decision: string,          // "BUY" | "HOLD" | "SELL"
  summary: string,
  full_report: string,
  agent_reasoning: Record,
  specialist_insights: [
    { role: string, summary: string, full_analysis: string },
    ...
  ],
  additional_tickers: [{ ticker: string, reason: string }, ...],
  intake_brief: string
}
```

**Timeout**: 120 seconds — the agent pipeline is slow (30-60s typical).

### Implementation Plan

**Option A: "New Thread" button on Board tab**

Add a floating action button or header button on the Board tab that opens a modal/sheet:

1. User taps "+" or "New Thread"
2. Modal shows a text input: "What would you like the board to analyze?"
3. User types: "Should I buy VCB?" or "Analyze FPT for me"
4. App calls `POST /api/report/generate` with `{ user_id: "user_mvp_1", message }`
   - Note: the backend auto-extracts the ticker from the message, or uses `FINLY_DEFAULT_TICKER` (FPT)
5. Show a full-screen loading state (this takes 30-60s) — important for demo UX
6. On success, create a new `BoardThread` object from the report response and prepend to the thread list
7. Navigate to the new thread detail view

**Mapping ReportResponse → BoardThread**:
```typescript
function reportToThread(report: ReportResponse): BoardThread {
  return {
    id: report.report_id,
    title: `${report.ticker} ${report.decision.toLowerCase()} analysis`,
    ticker: report.ticker,
    decision: mapDecision(report.decision), // "BUY" -> "Buy", "SELL" -> "Sell", "HOLD" -> "Position"
    intake: report.intake_brief || report.summary,
    summary: report.summary,
    updatedAt: "Just now",
    unreadCount: report.specialist_insights.length,
    participantAgentIds: ["portfolio-manager", "market-analyst", "risk-assessor", "researcher"],
    messages: report.specialist_insights.map((insight, i) => ({
      id: String(i + 1),
      author: roleToAgentName(insight.role),
      role: roleToAgentRole(insight.role),
      avatar: roleToAgentName(insight.role).slice(0, 2).toUpperCase(),
      message: insight.summary,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })),
  }
}
```

**State management**: The thread list should combine mock threads + any real threads from reports. Options:
- Simple: `useState` in Board tab, prepend new threads
- Better: Zustand store (`boardStore.ts`) that holds threads and persists across tab switches

#### Files to Modify

| File | Change |
|------|--------|
| `apps/mobile/app/(tabs)/board.tsx` | Add "New Thread" button, loading state, call `api.generateReport()`, prepend result to thread list |
| `apps/mobile/src/stores/boardStore.ts` | **Create** (optional) — Zustand store for threads if you want persistence across tab switches |
| `apps/mobile/src/services/api/index.ts` | No changes — `api.generateReport()` already exists (line 137) |

---

## WS-4: Heartbeat Alerts

**Goal**: Add heartbeat alert UI to the mobile app with a demo trigger button, and support custom scenarios on the backend (e.g., "Strait of Hormuz closed").

### Current State

**Mobile**: `HeartbeatAlert` type is defined in `types.ts:168-177` but completely unused. No UI, no polling, no trigger button.

**Backend**:
- `GET /api/heartbeat/alerts?user_id=broadcast` — returns and clears pending alerts
- `POST /api/heartbeat/trigger?scenario=fpt_earnings_beat&user_id=broadcast` — triggers one of 8 pre-built scenarios
- Only 8 hardcoded scenarios in `heartbeat.py:14-78` — cannot create custom events like "Strait of Hormuz closed"

### Implementation Plan

#### Part A: Backend — Add Custom Scenario Support

**File**: `apps/agents/src/finly_agents/heartbeat.py`

Add a function to register ad-hoc scenarios:

```python
def trigger_custom_alert(
    ticker: str,
    headline: str,
    body: str,
    severity: str = "warning",
    attributed_to: str = "Market Analyst",
    user_id: str = "broadcast",
) -> HeartbeatAlert:
    """Create an ad-hoc alert not tied to a pre-built scenario."""
    alert = HeartbeatAlert(
        alert_id=uuid.uuid4().hex[:12],
        timestamp=datetime.now().isoformat(),
        ticker=ticker,
        alert_type="custom",
        headline=headline,
        body=body,
        attributed_to=attributed_to,
        severity=severity,
    )
    _alert_queues.setdefault(user_id, []).append(alert)
    if user_id != "broadcast":
        _alert_queues.setdefault("broadcast", []).append(alert)
    return alert
```

**File**: `apps/agents/src/finly_agents/server.py`

Add a new endpoint after the existing heartbeat endpoints (~line 846):

```python
class CustomAlertRequest(BaseModel):
    ticker: str = "HOSE"
    headline: str
    body: str
    severity: str = "warning"
    attributed_to: str = "Market Analyst"

@app.post("/api/heartbeat/custom")
async def heartbeat_custom(req: CustomAlertRequest, user_id: str = Query(default="broadcast")):
    from finly_agents.heartbeat import trigger_custom_alert
    alert = trigger_custom_alert(
        ticker=req.ticker,
        headline=req.headline,
        body=req.body,
        severity=req.severity,
        attributed_to=req.attributed_to,
        user_id=user_id,
    )
    return alert.model_dump()
```

**Pre-built demo scenarios to add to SCENARIOS dict** (for the demo trigger button):

```python
"hormuz_closure": {
    "ticker": "HOSE",
    "alert_type": "geopolitical",
    "headline": "Strait of Hormuz closed — oil prices spike 12%",
    "body": "Breaking: Iran has closed the Strait of Hormuz to commercial shipping. Crude oil surged 12% in Asian trading. The Risk Assessor flags elevated exposure for portfolios with energy-sensitive names. Review your holdings for supply chain risk.",
    "attributed_to": "Risk Assessor",
    "severity": "critical",
},
"rsi_threshold": {
    "ticker": "VCB",
    "alert_type": "technical",
    "headline": "VCB RSI crosses above 70 — overbought signal",
    "body": "VCB's 14-day RSI has crossed 70, entering overbought territory. Historically this has preceded 3-5% pullbacks within 2 weeks. The Market Analyst recommends tightening stop-losses or trimming on further strength.",
    "attributed_to": "Market Analyst",
    "severity": "warning",
},
```

#### Part B: Mobile — Alert Display + Trigger Button

**API client addition** (`apps/mobile/src/services/api/index.ts`):

```typescript
async getHeartbeatAlerts(
  userId: string = "broadcast",
): Promise<{ kind: "ok"; alerts: HeartbeatAlert[] } | GeneralApiProblem> {
  const response: ApiResponse<HeartbeatAlert[]> = await this.apisauce.get(
    `/api/heartbeat/alerts?user_id=${userId}`,
  )
  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }
  return { kind: "ok", alerts: response.data ?? [] }
}

async triggerHeartbeat(
  scenario: string,
  userId: string = "broadcast",
): Promise<{ kind: "ok"; alert: HeartbeatAlert } | GeneralApiProblem> {
  const response: ApiResponse<HeartbeatAlert> = await this.apisauce.post(
    `/api/heartbeat/trigger?scenario=${scenario}&user_id=${userId}`,
  )
  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }
  return { kind: "ok", alert: response.data! }
}
```

**Heartbeat UI options** (pick one):

**Option 1: Alert banner on Home tab** (recommended for demo)
- Add a dismissable alert card at the top of the Home tab scroll view
- Poll `GET /api/heartbeat/alerts` every 10 seconds
- Show severity-colored banner: critical = red, warning = amber, info = blue
- Display: headline, body, attributed_to agent name + avatar

**Option 2: Dedicated alerts tab**
- Replace Settings tab with an Alerts tab
- Full list of alerts with timestamps

**Demo trigger button**:
- Add a hidden dev button (long-press on the "Your Team" header, or a button in Settings)
- Shows a picker with scenario options: `hormuz_closure`, `rsi_threshold`, `fpt_earnings_beat`, etc.
- Calls `api.triggerHeartbeat(scenario)`
- The next poll cycle picks up the alert and displays it

**Polling hook** (`apps/mobile/src/services/useHeartbeatAlerts.ts`):

```typescript
export function useHeartbeatAlerts(intervalMs = 10000) {
  const [alerts, setAlerts] = useState<HeartbeatAlert[]>([])

  useEffect(() => {
    let active = true
    const poll = async () => {
      const result = await api.getHeartbeatAlerts("user_mvp_1")
      if (active && result.kind === "ok" && result.alerts.length > 0) {
        setAlerts((prev) => [...result.alerts, ...prev])
      }
    }
    const timer = setInterval(poll, intervalMs)
    poll() // initial fetch
    return () => { active = false; clearInterval(timer) }
  }, [intervalMs])

  return { alerts, clearAlerts: () => setAlerts([]) }
}
```

**Note**: `GET /api/heartbeat/alerts` returns and clears — alerts are consumed on poll. The mobile app should accumulate them locally.

#### Files to Modify

| File | Change |
|------|--------|
| `apps/agents/src/finly_agents/heartbeat.py` | Add `trigger_custom_alert()`, add `hormuz_closure` and `rsi_threshold` to SCENARIOS |
| `apps/agents/src/finly_agents/server.py` | Add `POST /api/heartbeat/custom` endpoint |
| `apps/mobile/src/services/api/index.ts` | Add `getHeartbeatAlerts()` and `triggerHeartbeat()` methods |
| `apps/mobile/src/services/api/types.ts` | No changes — `HeartbeatAlert` already defined |
| `apps/mobile/src/services/useHeartbeatAlerts.ts` | **Create** — polling hook |
| `apps/mobile/app/(tabs)/home.tsx` | Add alert banner component at top of scroll view, use `useHeartbeatAlerts()` |
| `apps/mobile/app/(tabs)/settings.tsx` | Add demo trigger button (or long-press on home screen) |

---

## WS-5: Voice Playback on Agent Responses

**Goal**: Play ElevenLabs TTS audio when agent responses arrive in chat.

### Current State

- `playBase64Audio()` exists in `apps/mobile/src/utils/playAudio.ts` and works
- Backend `/api/intake` returns `audio_b64` in responses
- Backend `/api/chat/voice` returns audio as streaming response with metadata headers
- Backend `/api/report/chat` (panel chat) does NOT return audio — text only

### Implementation Plan

**For intake/onboarding voice** (WS-1): Already handled — `IntakeResponse.audio_b64` exists.

**For panel chat voice**: Two options:

**Option A (Simple)**: After receiving panel chat text responses, make a separate TTS call:
- Add a new backend endpoint or use the existing voice.py to generate audio for a text string
- Or call ElevenLabs directly from the mobile app (simpler but requires API key in mobile)

**Option B (Recommended for demo)**: Add `audio_b64` to `PanelChatResponse`:
- Modify `apps/agents/src/finly_agents/server.py` in `report_chat()` endpoint
- After getting agent responses, pick the "advisor" response (synthesis) and run `text_to_speech()` on it
- Return the audio alongside the text responses

**Backend change** (server.py, in `report_chat` handler):
```python
# After collecting agent_responses, add TTS for the advisor's response
advisor_text = next(
    (r["response"] for r in agent_responses if r["agent_role"] == "advisor"),
    None
)
audio_b64 = None
if advisor_text:
    from finly_agents.voice import text_to_speech
    import base64
    audio_bytes = text_to_speech(advisor_text)
    if audio_bytes:
        audio_b64 = base64.b64encode(audio_bytes).decode()
```

**Mobile change**: After receiving panel chat response, auto-play the advisor's audio:
```typescript
if (result.data.audio_b64) {
  playBase64Audio(result.data.audio_b64)
}
```

#### Files to Modify

| File | Change |
|------|--------|
| `apps/agents/src/finly_agents/server.py` | Add `audio_b64` to panel chat response |
| `apps/agents/src/finly_agents/models.py` | Add `audio_b64: str | None = None` to `PanelChatResponse` |
| `apps/mobile/src/services/api/types.ts` | Add `audio_b64?: string \| null` to `PanelChatResponse` |
| `apps/mobile/app/thread/[id].tsx` | Call `playBase64Audio()` after receiving panel response |

---

## WS-6: Portfolio from Backend

**Goal**: Display the user's actual portfolio from the backend instead of hardcoded NVDA/TSLA/MSFT/AAPL.

### Current State

- Home (`home.tsx:22`) and Portfolio (`portfolio.tsx`) import `holdings` from `mockAppData.ts` — always 4 US stocks
- `OnboardingCompleteScreen` calls `api.importPortfolio({ user_id, mode: "mock" })` which creates a backend portfolio
- Mock portfolio profiles are in `apps/agents/src/finly_agents/portfolio.py` — conservative (VCB/VNM), moderate (VCB/FPT/VNM), aggressive (FPT/TPB/VCB)
- API client has `api.getPortfolio(userId)` (line 94) but it's never called from a screen

### Implementation Plan

**For hackathon demo**: Keep mock holdings for now but fetch portfolio from backend to replace them. The backend mock portfolio uses VN tickers (VCB, FPT, VNM, TPB) which aligns with the demo narrative.

**Hook** (`apps/mobile/src/services/usePortfolio.ts`):

```typescript
export function usePortfolio(userId: string) {
  const [items, setItems] = useState<PortfolioResponse["items"]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.getPortfolio(userId).then((result) => {
      if (result.kind === "ok") setItems(result.portfolio.items)
      setIsLoading(false)
    })
  }, [userId])

  return { items, isLoading }
}
```

**Map backend portfolio items to Holding type**:
```typescript
function portfolioItemToHolding(item: Record<string, unknown>): Holding {
  return {
    ticker: String(item.ticker),
    name: String(item.ticker), // backend doesn't store company name
    shares: Number(item.quantity),
    valueUsd: Number(item.quantity) * Number(item.avg_cost),
    changePercent: 0, // filled by useMarketData
    allocationPercent: 0, // calculated from total
  }
}
```

**Decision for demo**: This is lower priority. The mock holdings work fine visually. Only wire this if you want the VN tickers to show on the home screen.

#### Files to Modify

| File | Change |
|------|--------|
| `apps/mobile/src/services/usePortfolio.ts` | **Create** — hook to fetch portfolio |
| `apps/mobile/app/(tabs)/home.tsx` | Replace `holdings` import with `usePortfolio()` hook |
| `apps/mobile/app/(tabs)/portfolio.tsx` | Same |

---

## WS-7: Home Screen Live Agent Data

**Goal**: Show real agent activity on the home screen instead of mock messages.

### Current State

- `home.tsx:22` imports `boardMessages` from `mockAppData.ts`
- `latestAgentMessages` (line 64-71) extracts the most recent message per agent from mock data
- Agent cards show these static messages

### Implementation Plan

**For hackathon demo**: This is lowest priority. The mock messages look good. Only wire if there's time.

**If wiring**: After a report is generated (WS-3), store the specialist insights and use those as the "latest messages" per agent:

```typescript
// After report generation succeeds:
const agentMessages = report.specialist_insights.reduce((acc, insight) => {
  acc[roleToAgentName(insight.role)] = insight.summary
  return acc
}, {} as Record<string, string>)
// Store in a Zustand store or context, read from Home tab
```

#### Files to Modify

| File | Change |
|------|--------|
| `apps/mobile/app/(tabs)/home.tsx` | Replace `boardMessages` usage with data from report store |
| `apps/mobile/src/stores/boardStore.ts` | Store latest agent messages from reports |

---

## WS-8: Live Stock Charts

**Goal**: Show interactive price charts for each holding, using real historical data from yfinance (US tickers) and mock OHLCV for VN tickers.

### Current State

- **Backend**: yfinance is already a dependency (`pyproject.toml`). `y_finance.py` has `get_YFin_data_online()` that fetches OHLCV history. `mock_data.py` has `_generate_ohlcv()` that generates 30-day mock data for VN tickers.
- **Current `/api/market-data`** (server.py:801): Only returns a single current price + change_pct per ticker. No historical data.
- **Mobile**: `PortfolioGrowthChart` on home.tsx uses hardcoded `PORTFOLIO_GROWTH_POINTS` (line 28) — 12 static numbers rendered as View-based line segments. No chart library installed.

### Backend: New Endpoint

**File**: `apps/agents/src/finly_agents/server.py`

Add after the existing `/api/market-data` endpoint (~line 827):

```python
@app.get("/api/market-data/history")
async def market_data_history(
    ticker: str = Query(...),
    period: str = Query(default="1mo"),  # 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y
    interval: str = Query(default="1d"),  # 1m, 5m, 15m, 1h, 1d, 1wk
):
    """Return OHLCV history for a ticker. Uses yfinance for US stocks, mock for VN."""
    import yfinance as yf
    from finly_agents.mock_data import is_vn_ticker, _generate_ohlcv, _clean

    clean_ticker = _clean(ticker)

    if is_vn_ticker(clean_ticker):
        # Map period to days
        period_days = {"1d": 1, "5d": 5, "1mo": 30, "3mo": 90, "6mo": 180, "1y": 365, "5y": 1825}
        days = period_days.get(period, 30)
        rows = _generate_ohlcv(clean_ticker, days=days)
        return {
            "ticker": clean_ticker,
            "currency": "VND",
            "period": period,
            "interval": interval,
            "data": rows,  # [{date, open, high, low, close, volume}, ...]
        }
    else:
        # Real yfinance data for US tickers
        try:
            yf_ticker = yf.Ticker(clean_ticker)
            hist = yf_ticker.history(period=period, interval=interval)

            if hist.empty:
                raise HTTPException(status_code=404, detail=f"No data for {clean_ticker}")

            if hist.index.tz is not None:
                hist.index = hist.index.tz_localize(None)

            data = []
            for idx, row in hist.iterrows():
                data.append({
                    "date": idx.strftime("%Y-%m-%d") if interval in ("1d", "1wk") else idx.isoformat(),
                    "open": round(row["Open"], 2),
                    "high": round(row["High"], 2),
                    "low": round(row["Low"], 2),
                    "close": round(row["Close"], 2),
                    "volume": int(row["Volume"]),
                })

            return {
                "ticker": clean_ticker,
                "currency": "USD",
                "period": period,
                "interval": interval,
                "data": data,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
```

**Response shape**:
```json
{
  "ticker": "NVDA",
  "currency": "USD",
  "period": "1mo",
  "interval": "1d",
  "data": [
    { "date": "2026-02-21", "open": 380.5, "high": 390.2, "low": 378.1, "close": 388.9, "volume": 42000000 },
    { "date": "2026-02-22", "open": 389.0, "high": 395.0, "low": 385.3, "close": 392.1, "volume": 38000000 },
    ...
  ]
}
```

**Note on `_generate_ohlcv`**: The existing function in `mock_data.py:32-56` returns dicts with keys `date`, `open`, `high`, `low`, `close`, `volume` — already the right shape. Just make sure the function is importable (add to `__init__.py` or import directly).

### Backend: Fix mock_data _generate_ohlcv Return

Check that `_generate_ohlcv` returns `date` as a string (ISO format). Currently it uses `datetime` objects — may need:

```python
# In _generate_ohlcv, ensure date is stringified:
rows.append({
    "date": cur.strftime("%Y-%m-%d"),
    "open": o, "high": h, "low": l, "close": c, "volume": vol,
})
```

### Mobile: Chart Library

**Recommended**: `react-native-wagmi-charts` — lightweight, Expo-compatible, designed for financial data. No native module linking needed.

```bash
cd apps/mobile && pnpm add react-native-wagmi-charts react-native-reanimated react-native-gesture-handler
```

`react-native-reanimated` and `react-native-gesture-handler` are likely already installed (check `package.json`).

**Alternative**: `victory-native` — more full-featured but heavier. Or `react-native-svg` + manual path drawing (no extra dep, but more work).

### Mobile: API Client Addition

**File**: `apps/mobile/src/services/api/types.ts`

```typescript
// Add after HeartbeatAlert interface

export interface OHLCVPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketHistoryResponse {
  ticker: string
  currency: string
  period: string
  interval: string
  data: OHLCVPoint[]
}
```

**File**: `apps/mobile/src/services/api/index.ts`

```typescript
async getMarketHistory(
  ticker: string,
  period: string = "1mo",
  interval: string = "1d",
): Promise<{ kind: "ok"; history: MarketHistoryResponse } | GeneralApiProblem> {
  const response: ApiResponse<MarketHistoryResponse> = await this.apisauce.get(
    `/api/market-data/history`,
    { ticker, period, interval },
  )
  if (!response.ok) {
    const problem = getGeneralApiProblem(response)
    if (problem) return problem
  }
  return { kind: "ok", history: response.data! }
}
```

### Mobile: Chart Hook

**File**: `apps/mobile/src/services/useStockChart.ts` (create)

```typescript
import { useEffect, useState } from "react"
import { api } from "@/services/api"
import type { OHLCVPoint } from "@/services/api/types"

export function useStockChart(ticker: string, period = "1mo", interval = "1d") {
  const [data, setData] = useState<OHLCVPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    setIsLoading(true)

    api.getMarketHistory(ticker, period, interval).then((result) => {
      if (!active) return
      if (result.kind === "ok") setData(result.history.data)
      setIsLoading(false)
    })

    return () => { active = false }
  }, [ticker, period, interval])

  return { data, isLoading }
}
```

### Mobile: Where to Show Charts

**Option A: Holding detail screen** (recommended — already has per-ticker context)

**File**: `apps/mobile/app/holding/[ticker].tsx`

Add a chart card between the header and the "BOARD INTAKE" section:

```tsx
import { useStockChart } from "@/services/useStockChart"
import { LineChart } from "react-native-wagmi-charts"  // or your chosen library

// Inside HoldingDetailRoute:
const { data: chartData, isLoading: chartLoading } = useStockChart(ticker!, "1mo")

// Render:
<View className="mt-5 rounded-[24px] bg-[#F7F9FC] p-4">
  <View className="flex-row items-center justify-between mb-3">
    <Text className="font-sans text-[17px] font-semibold text-[#0F1728]">
      Price · 1M
    </Text>
    <View className="flex-row gap-2">
      {["1d", "1mo", "3mo", "1y"].map((p) => (
        <Pressable key={p} onPress={() => setPeriod(p)}>
          <Text className={`font-sans text-[13px] ${period === p ? "text-[#2453FF] font-semibold" : "text-[#7A8699]"}`}>
            {p.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>

  {chartLoading ? (
    <View className="h-[160px] items-center justify-center">
      <ActivityIndicator color="#2453FF" />
    </View>
  ) : (
    <LineChart.Provider data={chartData.map(d => ({ timestamp: new Date(d.date).getTime(), value: d.close }))}>
      <LineChart height={160}>
        <LineChart.Path color="#2453FF" width={2} />
        <LineChart.CursorCrosshair color="#2453FF" />
      </LineChart>
      <LineChart.PriceText style={{ fontSize: 14, color: "#0F1728" }} />
      <LineChart.DatetimeText style={{ fontSize: 12, color: "#7A8699" }} />
    </LineChart.Provider>
  )}
</View>
```

**Option B: Also replace the static `PortfolioGrowthChart` on home**

Replace `PORTFOLIO_GROWTH_POINTS` (home.tsx:28) with real aggregate portfolio data. Fetch chart data for all held tickers, weight by shares, compute portfolio value per day. More complex — do only if time allows.

### Period Selector UX

Allow switching between time ranges: **1D**, **1W**, **1M**, **3M**, **1Y**

Map to yfinance parameters:

| Button | `period` | `interval` | Notes |
|--------|----------|------------|-------|
| 1D | `1d` | `5m` | Intraday, 5-min candles |
| 1W | `5d` | `15m` | 5 days of 15-min candles |
| 1M | `1mo` | `1d` | Daily close (default) |
| 3M | `3mo` | `1d` | Daily close |
| 1Y | `1y` | `1wk` | Weekly close |

### VN Ticker Caveat

yfinance does NOT support Vietnamese tickers natively. The mock data generator (`_generate_ohlcv`) handles VN tickers with deterministic random data. This is fine for the demo — the chart will show realistic-looking price action. For post-hackathon, integrate SSI or VNDirect API for real HOSE data.

### Files to Modify

| File | Change |
|------|--------|
| `apps/agents/src/finly_agents/server.py` | Add `GET /api/market-data/history` endpoint |
| `apps/agents/src/finly_agents/mock_data.py` | Ensure `_generate_ohlcv` returns string dates; make it importable |
| `apps/mobile/src/services/api/types.ts` | Add `OHLCVPoint` and `MarketHistoryResponse` types |
| `apps/mobile/src/services/api/index.ts` | Add `getMarketHistory()` method |
| `apps/mobile/src/services/useStockChart.ts` | **Create** — hook to fetch chart data |
| `apps/mobile/app/holding/[ticker].tsx` | Add chart card with period selector |
| `apps/mobile/package.json` | Add `react-native-wagmi-charts` (or chosen chart lib) |

---

## Priority Order for Demo

| Priority | Work Item | Effort | Demo Impact |
|----------|-----------|--------|-------------|
| **P0** | WS-2: Wire thread chat → panel API | Small (1 file) | Core demo flow — agents respond to user questions |
| **P0** | WS-3: New thread (report generation) | Medium (1-2 files) | Core demo flow — user triggers agent analysis |
| **P0** | WS-4: Heartbeat alerts + trigger | Medium (4-5 files) | Demo moment — "Hormuz closes" → alerts appear |
| **P1** | WS-1: Voice onboarding | Large (new screen + STT) | Impressive but complex — voice conversation |
| **P1** | WS-5: Voice playback | Small (3-4 files) | Polish — agents speak their responses |
| **P1** | WS-8: Live stock charts | Medium (3-4 files) | Visual wow — real price charts on holdings |
| **P2** | WS-6: Portfolio from backend | Small (2-3 files) | Nice-to-have — VN tickers on home screen |
| **P2** | WS-7: Live agent data on home | Small (1-2 files) | Nice-to-have — dynamic agent messages |

---

## Shared Constants

```typescript
// User ID for all API calls during hackathon demo
const USER_ID = "user_mvp_1"

// Agent role mapping (backend → mobile)
const AGENT_ROLE_MAP = {
  analyst: "market-analyst",
  researcher: "researcher",
  trader: "portfolio-manager",
  advisor: "portfolio-manager",
} as const

// Agent name mapping (backend → mobile)
const AGENT_NAME_MAP = {
  analyst: "Kai",
  researcher: "Milo",
  trader: "Avery",
  advisor: "Avery",
} as const

// Decision mapping (backend → mobile)
const DECISION_MAP = {
  BUY: "Buy",
  SELL: "Sell",
  HOLD: "Position",
} as const
```
