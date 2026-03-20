# Product Requirements Document: Lazy Investor

## Status

Draft (Hackathon MVP)

## Event Context

- Event: Lotus Hacks 2026
- Dates: March 20-22, 2026
- Location: Vietnam

## Executive Summary

Lazy Investor is a conversational, voice-powered investment advisory app with a 4-agent AI team:

- Portfolio Manager
- Market Analyst
- Risk Assessor
- Researcher

The product goal is to make Vietnamese stock investing approachable for non-experts by replacing quant-heavy UX with natural conversation, guided education, and gamified portfolio simulation.

## Target Users

- Primary segment 1: 18-25 year-old students new to investing
- Primary segment 2: 30-40 working professionals new to investing

## Problem Statement

- Barrier: Existing investing experiences are often too technical or too dry for beginners.
- Pain point: Users cannot ask simple questions such as "Should I invest in VNM?" and get clear, friendly, actionable guidance.
- Opportunity: Agentic AI teams can mimic a human advisory panel, while gamification improves engagement and retention.

## Product Pillars

1. Voice-first investment guidance
2. Multi-agent collaborative reasoning
3. Gamified learning and repeat engagement
4. Vietnam-market relevance for local users

## Core Features

### 1) Agent Team (4 Specialists)

- Portfolio Manager: asset allocation and diversification recommendations
- Market Analyst: trend and market context analysis
- Risk Assessor: risk profile calibration and downside scenario framing
- Researcher: deeper comparisons and sector/company narratives

Interaction model:

- User asks via voice
- Agents produce role-specific outputs
- App presents a synthesized team response with transparent per-agent transcript

### 2) Voice Interface (Agora SDK)

- Input: user voice query routed to backend
- Output: low-latency text + synthesized voice responses
- Target latency:
  - Voice roundtrip under 2 seconds where feasible
  - Full 4-agent response within 3 seconds target for demo flow
- Fallback: text chat path when voice quality fails

### 3) Investor Personality Arena (Gamification)

Game loop:

1. User allocates virtual capital into a battle portfolio
2. User battles an AI investor archetype
3. Mock simulation runs over short historical or synthetic window
4. User earns badge tier and unlocks related education quest

MVP archetypes:

- Cautious Saver
- Balanced Builder
- Bold Tech Gambler

### 4) Education Pathways

- Voice quests with quiz prompts and instant explanations
- XP, streaks, and badge progression
- Agent leveling feedback (for narrative progression)
- Personalized quest sequencing based on risk profile

## AI Integration Requirements

### Agent Orchestration

- Role-specific prompts per agent
- Session memory stores:
  - Risk profile
  - Portfolio state
  - Conversation history
- Portfolio Manager is primary router and response synthesizer

### Mock Market Engine

- Initial symbols: VCB, VNM, TPB, FPT
- Data mode: mock historical set or lightweight API proxy
- Simulation budget: core calculations should complete in under 500ms for demo interactions

### Voice Processing

- Agora SDK for STT/TTS path
- Text fallback required for reliability

## MVP Scope (36-Hour Hackathon)

Must-have:

- One end-to-end voice query path with 4-agent response
- Arena battle versus Cautious Saver with mock short-window simulation
- At least 3 voice quests with XP rewards
- Simple top-10 leaderboard based on mock portfolios

Nice-to-have:

- Agent leveling UI (1-5 stars)
- Second archetype battle
- Real market API integration
- Streak counter animations
- Mobile-responsive web UI polish

Out of scope:

- Real-money trading
- Advanced quant optimization
- Multilingual production support

## Reference Tech Stack (Hackathon)

- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- Voice: Agora Web SDK
- LLM: OpenAI/Claude APIs with role prompts
- Storage: local JSON / lightweight local store for MVP
- Market data: mock data first, optional lightweight proxy

## User Journey (Demo Path)

1. Onboarding captures risk profile
2. First team chat analyzes a VN stock question
3. Arena battle runs with virtual allocation
4. User unlocks and completes first voice quest
5. User receives XP, badge, and leaderboard placement

## Success Metrics (Hackathon Demo)

- Technical:
  - Voice latency under 2 seconds target
  - 4-agent response completes within 3 seconds target
  - Zero crash during full judge demo
- UX:
  - Complete onboarding -> chat -> battle -> quest flow in under 10 minutes
- Relevance:
  - Vietnamese stock context and beginner-friendly language resonate with judges/users

## Judge Appeal Hypothesis

1. Distinct feature combo: voice + multi-agent + gamification
2. Clear path from beginner onboarding to repeat engagement
3. Local market framing with practical investor education value
4. Feasible 36-hour implementation scope using managed APIs

## Next Steps (Post Hackathon)

- Integrate real market data provider
- Expand archetype library
- Add social and team-based experiences
- Ship iOS/Android clients
- Introduce real-time alerts and advisor partnerships

## Safety And Compliance Note

This MVP is educational and simulation-first. It does not execute real trades and should not be presented as regulated financial advice.
