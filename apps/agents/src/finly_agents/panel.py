"""Panel discussion — each agent responds individually to user follow-up questions.

After a report is generated, the user can "chat with the team". Each of the 4 agents
(Market Analyst, Fundamentals Analyst, News Analyst, Sentiment Analyst) responds to
the user's question from their own perspective, referencing their section of the report.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os

import httpx

from finly_agents.context import build_user_context
from finly_agents.database import (
    append_conversation,
    get_conversation_history,
    get_latest_report,
    get_memories,
    get_user,
)

logger = logging.getLogger("finly_agents.panel")

AGENT_PERSONAS = {
    "market_analyst": {
        "name": "Market Analyst",
        "report_key": "market_report",
        "system_prompt": """\
You are Finly's Market Analyst. You specialise in technical analysis, price action, \
market trends, and trading signals. You use indicators like RSI, MACD, Bollinger Bands, \
moving averages, and volume analysis to form your views.

Your section of the latest report:
{agent_report}

Full team report summary:
{report_summary}

{user_context}

Answer the user's question from your technical/market perspective. Be concise (2-4 sentences). \
If the user's question challenges your analysis, acknowledge their point and explain your reasoning. \
If the user wants to change their risk profile, acknowledge it and note the change.""",
    },
    "fundamentals_analyst": {
        "name": "Fundamentals Analyst",
        "report_key": "fundamentals_report",
        "system_prompt": """\
You are Finly's Fundamentals Analyst. You specialise in financial statements, valuation metrics \
(P/E, P/B, ROE), earnings quality, balance sheet strength, and company fundamentals.

Your section of the latest report:
{agent_report}

Full team report summary:
{report_summary}

{user_context}

Answer the user's question from a fundamentals perspective. Be concise (2-4 sentences). \
Reference specific metrics when relevant.""",
    },
    "news_analyst": {
        "name": "News Analyst",
        "report_key": "news_report",
        "system_prompt": """\
You are Finly's News & Macro Analyst. You track breaking news, macro events, regulatory changes, \
insider transactions, and geopolitical developments that impact markets.

Your section of the latest report:
{agent_report}

Full team report summary:
{report_summary}

{user_context}

Answer the user's question from a news/macro perspective. Be concise (2-4 sentences). \
Reference specific recent events when relevant.""",
    },
    "sentiment_analyst": {
        "name": "Sentiment Analyst",
        "report_key": "sentiment_report",
        "system_prompt": """\
You are Finly's Sentiment Analyst. You analyse social media sentiment, retail investor behaviour, \
institutional flows, and market psychology.

Your section of the latest report:
{agent_report}

Full team report summary:
{report_summary}

{user_context}

Answer the user's question from a sentiment/behavioural perspective. Be concise (2-4 sentences). \
Reference crowd sentiment and investor behaviour patterns.""",
    },
}


async def _call_agent(
    agent_key: str,
    persona: dict,
    user_question: str,
    report: dict,
    user_context: str,
    conversation_history: list[dict],
) -> dict:
    """Call a single agent in the panel."""
    agent_report = report.get("agent_reasoning", {}).get(persona["report_key"], "No data available.")
    report_summary = report.get("summary", "No report generated yet.")

    system_prompt = persona["system_prompt"].format(
        agent_report=agent_report,
        report_summary=report_summary,
        user_context=user_context,
    )

    messages = [{"role": "system", "content": system_prompt}]

    # Add recent panel conversation history (last 6 messages)
    for msg in conversation_history[-6:]:
        if msg.get("agent_role") == agent_key or msg.get("role") == "user":
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": user_question})

    api_key = os.getenv("OPENROUTER_API_KEY", "")
    model = os.getenv("FINLY_PANEL_MODEL", os.getenv("FINLY_AGENT_MODEL", "openai/gpt-4.1-mini"))
    base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 300,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            response_text = data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.warning(f"Panel agent {agent_key} failed: {e}")
        response_text = f"I'm having trouble responding right now. Please try again."

    return {
        "agent_role": agent_key,
        "agent_name": persona["name"],
        "response": response_text,
    }


async def run_panel_discussion(
    user_id: str,
    message: str,
    report_id: str | None = None,
) -> dict:
    """Run a panel discussion — all 4 agents respond to the user's question in parallel.

    Returns dict with: user_id, question, agent_responses[], memory_updates[]
    """
    # Get the report to reference
    report = get_latest_report(user_id)
    if not report:
        return {
            "user_id": user_id,
            "question": message,
            "agent_responses": [
                {
                    "agent_role": "system",
                    "agent_name": "Finly",
                    "response": "No report has been generated yet. Please generate a report first.",
                }
            ],
            "memory_updates": [],
        }

    user_context = build_user_context(user_id)
    conversation_history = get_conversation_history(user_id, conv_type="panel", limit=20)

    # Record user message
    append_conversation(user_id, "panel", "user", message)

    # Run all 4 agents in parallel
    tasks = []
    for agent_key, persona in AGENT_PERSONAS.items():
        tasks.append(
            _call_agent(agent_key, persona, message, report, user_context, conversation_history)
        )

    agent_responses = await asyncio.gather(*tasks)

    # Record each agent's response
    for resp in agent_responses:
        append_conversation(
            user_id, "panel", "assistant", resp["response"], agent_role=resp["agent_role"]
        )

    # Extract memories from the interaction (fire and forget)
    memory_updates = []
    try:
        from finly_agents.memory import extract_and_store_memories

        combined_response = "\n".join(
            f"[{r['agent_name']}]: {r['response']}" for r in agent_responses
        )
        memory_updates = await extract_and_store_memories(user_id, message, combined_response)
    except Exception as e:
        logger.warning(f"Memory extraction in panel failed: {e}")

    return {
        "user_id": user_id,
        "question": message,
        "agent_responses": agent_responses,
        "memory_updates": memory_updates,
    }
