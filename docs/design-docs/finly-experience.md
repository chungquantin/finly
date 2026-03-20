# Finly Experience Design

## Context

This document defines the UX and interaction model for the Finly PRD in `docs/product-specs/finly-agentic-investment-team-prd.md`.

## Experience Principles

- Conversational first: user should feel like talking to an advisor team, not filling forms
- Beginner-safe: explain decisions in plain language and disclose uncertainty
- Fast feedback: keep interactions low-latency and visibly progressive
- Rewarded learning: tie education to badges, XP, and progression loops

## Information Architecture

1. Onboarding
2. Team Chat
3. Arena Battle
4. Quest
5. Leaderboard/Profile

## Screen And Interaction Model

### Onboarding

- Capture risk tolerance and basic investment intent
- Keep flow under 2 minutes
- Output a user risk profile used by the agent team

### Team Chat

- Voice-first input with text fallback
- Four agent panes:
  - Portfolio Manager
  - Market Analyst
  - Risk Assessor
  - Researcher
- Show both:
  - synthesized final recommendation
  - per-agent transcript entries

### Arena Battle

- User allocates virtual portfolio
- Opponent archetype card shows strategy profile
- Simulation outputs:
  - portfolio growth bars
  - clash score meter
  - win/loss + badge award

### Quest

- Voice quiz prompts with immediate explanation feedback
- XP gain and unlock events after completion

### Leaderboard/Profile

- Anonymous ranking for mock portfolios
- Progress surfaces:
  - badge tier
  - streak count
  - agent level progression

## Voice UX Requirements

- Primary voice path via Agora SDK
- Visual state indicators:
  - listening
  - processing
  - speaking
  - fallback-to-text
- Latency budgets:
  - voice interaction target under 2 seconds
  - full 4-agent response target under 3 seconds

## Copy Tone

- Friendly, non-judgmental, practical
- Avoid quant jargon by default
- Include clear caveats for uncertainty and risk

## Accessibility Baseline

- Every voice interaction must have text equivalent
- High-contrast visual mode for charts and transcript rows
- Large tap targets and clear reading order on mobile

## Integration Boundaries

- Frontend owns:
  - input capture
  - transcript rendering
  - gamification UI state
- Backend/API owns:
  - orchestration trigger
  - simulation execution
  - profile and progression persistence
- Agent runtime owns:
  - role prompts
  - role outputs
  - synthesis handoff to Portfolio Manager
