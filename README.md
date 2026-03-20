# Finly

Finly is an AI agentic investment team product being built for Lotus Hacks 2026 (March 20-22, Vietnam).

The product direction is a voice-first advisory experience for beginner investors, combining:

- A 4-agent investment team
- Real-time conversational UX using Agora Voice
- Arena-style gamification and education pathways
- Mock portfolio simulation for safe learning

## Product Snapshot

- Target users:
  - 18-25 students new to investing
  - 30-40 working professionals new to investing
- Core agent roles:
  - Portfolio Manager
  - Market Analyst
  - Risk Assessor
  - Researcher
- Market focus: Vietnamese stocks (initially VCB, VNM, TPB, FPT)

See the PRD source of truth at `docs/product-specs/finly-agentic-investment-team-prd.md`.

## Repository Purpose

This repository is still organized as an agent-first harness:

- `docs/` stores versioned product, design, reliability, and planning artifacts
- `docs/exec-plans/` stores active and completed execution plans
- `scripts/check_harness_readiness.py` enforces core documentation structure
- `scripts/bootstrap_codebase.py` provides deterministic bootstrap templates

## Current Code Areas

- `apps/mobile/`: mobile client prototype surface
- `apps/agents/`: local Python scaffold for TradingAgents-style multi-agent runtime
- `templates/`: repo-owned bootstrap templates (`web-nextjs`, `mobile-react-native`)

## Workflow

1. Read `AGENTS.md` and `ARCHITECTURE.md`
2. Read relevant docs under `docs/`
3. Create/update an execution plan for non-trivial changes
4. Run `python3 scripts/check_harness_readiness.py` for doc/structure updates
5. Use `python3 scripts/bootstrap_codebase.py --help` when adding template-driven scaffolds
