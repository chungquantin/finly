# Reliability

Reliability constraints should be encoded before scale makes them expensive.

## Current Requirements

- Repository structure checks must pass in CI
- Core harness docs must remain present and linked
- Non-trivial work should be tracked in execution plans
- Hackathon-critical demo budgets:
  - Voice roundtrip target under 2s
  - End-to-end 4-agent response target under 3s
  - Mock market simulation calculation target under 500ms
- Voice failure must degrade to text flow without blocking the user journey

## Future Requirements

When runtime code exists, define:

- Startup expectations
- Performance budgets
- SLOs and alerting signals
- Failure handling and rollback strategy
- Agent-visible logs, metrics, and traces
