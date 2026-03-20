# Finly — Implementation Tracker

## Completed

- [x] **Phase 1: Vietnamese Mock Data Vendor** — `mock_data.py` with VCB/VNM/FPT/TPB mock OHLCV, fundamentals, news; `interface.py` interception in `route_to_vendor()`
- [x] **Phase 2: Pydantic Models & User Profiles** — `models.py` (UserProfile, ChatRequest, ChatResponse, HeartbeatAlert, MarketTicker); `profiles.py` in-memory store
- [x] **Phase 3: Expanded API Endpoints** — CORS, error handling, `/api/chat`, `/api/chat/voice`, `/api/onboarding`, `/api/market-data`, `/api/user/{id}/profile`, `/api/user/{id}/chat-history`, `/api/heartbeat/alerts`, `/api/heartbeat/trigger`
- [x] **Phase 4: HEARTBEAT Alert System** — `heartbeat.py` with 8 pre-built scenarios, per-user queues, demo seeding on startup
- [x] **Phase 5: Voice TTS** — `voice.py` using httpx + ElevenLabs API, graceful fallback if no key
- [x] **Phase 6: Prompt Tuning** — All 4 analyst prompts: conciseness (3-5 bullets, 200 words) + Vietnamese context (HOSE, VND, SBV)
- [x] **Phase 7: Railway Deployment** — `Dockerfile` + `railway.toml`

## TODO

### Must-Have (for demo)
- [ ] **Smoke test all endpoints locally** — start server, hit `/healthz`, `/api/chat`, `/api/market-data`, `/api/heartbeat/alerts`
- [ ] **Deploy to Railway** — push, verify healthcheck, test `/api/chat` remotely
- [ ] **Test VN mock data path** — confirm `curl POST /api/chat -d '{"message":"Should I buy VCB?"}'` returns mock-sourced ChatResponse
- [ ] **Test US ticker fallback** — confirm AAPL/MSFT still use live yfinance via `/v1/chat/completions`
- [ ] **Validate mobile API contract** — ensure `/api/chat` response shape matches what the mobile team expects (ChatResponse schema)

### Nice-to-Have
- [ ] **Background auto-alerts** — background task that triggers random heartbeat alerts every 60s during demo
- [ ] **WebSocket alerts** — upgrade heartbeat from polling to WebSocket push for real-time mobile UX
- [ ] **Chat history persistence** — replace in-memory dict with SQLite or Redis for persistence across restarts
- [ ] **User profile enrichment** — add `preferred_tickers` to onboarding flow, use in default ticker selection
- [ ] **Streaming `/api/chat`** — add SSE streaming option to the simplified chat endpoint (currently only `/v1/chat/completions` streams)

### Future / Post-Hackathon
- [ ] **Real Vietnamese data vendor** — integrate SSI, VNDirect, or CafeF API for live HOSE data
- [ ] **Multi-language TTS** — Vietnamese voice output via ElevenLabs multilingual model
- [ ] **Auth & rate limiting** — API key auth, per-user rate limits
- [ ] **Portfolio tracking** — persistent portfolio with P&L tracking, linked to heartbeat alerts
- [ ] **Agent memory** — cross-session user preference learning (risk tolerance evolution, ticker affinity)

## Notes

- ElevenLabs API key is optional — voice endpoint gracefully falls back to JSON
- Mock data uses deterministic random seeds (seeded on ticker name) so prices are consistent within a day
- `_extract_specialist_insights()` maps internal LangGraph state keys to user-friendly roles
- HEARTBEAT `get_pending_alerts()` returns-and-clears — alerts are consumed on poll
