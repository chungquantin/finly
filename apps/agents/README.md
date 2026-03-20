# apps/agents

Local Python scaffold for agent-team execution, initialized from:

- Upstream repository: `https://github.com/TauricResearch/TradingAgents`
- Source package path: `tradingagents/`
- Snapshot commit: `f362a160c309a680cac460aa9de217ec63e434e6`

## Included Teams

- `analysts`
- `researchers`
- `trader`
- `risk_mgmt`
- `managers`
- `utils`

## Local Setup

```bash
cd apps/agents
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env
```

## Smoke Checks

```bash
cd apps/agents
python3 -m py_compile main.py $(find src -name '*.py')
python3 -m cli.main
```

Set at least one LLM API key and `ALPHA_VANTAGE_API_KEY` in `.env` before running live workflows.
