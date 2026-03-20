from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import time
import uuid
from datetime import date
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, ConfigDict, Field

from tradingagents.default_config import DEFAULT_CONFIG
from tradingagents.graph.trading_graph import TradingAgentsGraph

from finly_agents.models import (
    ChatRequest,
    ChatResponse,
    HeartbeatAlert,
    MarketTicker,
    OnboardingRequest,
    SpecialistInsight,
    UserProfile,
)
from finly_agents.profiles import (
    append_chat,
    create_or_update_profile,
    get_chat_history,
    get_profile,
)
from finly_agents.heartbeat import (
    get_pending_alerts,
    seed_demo_alerts,
    trigger_alert,
)

load_dotenv()

logger = logging.getLogger("finly_agents")

DEFAULT_ANALYSTS = ["market", "social", "news", "fundamentals"]
TICKER_PATTERN = re.compile(r"\b\$?([A-Z]{2,6})\b")
DATE_PATTERN = re.compile(r"\b(\d{4}-\d{2}-\d{2})\b")


# ---------------------------------------------------------------------------
# Existing OpenAI-compatible models
# ---------------------------------------------------------------------------

class Message(BaseModel):
    role: str
    content: Any


class ChatCompletionsRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    model: str = Field(default="finly-agents-v1")
    messages: list[Message]
    stream: bool = False
    ticker: str | None = None
    trade_date: str | None = None
    selected_analysts: list[str] | None = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _flatten_content(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                text = item.get("text")
                if isinstance(text, str):
                    parts.append(text)
            elif isinstance(item, str):
                parts.append(item)
        return "\n".join(parts)
    return str(content)


def _extract_last_user_text(messages: list[Message]) -> str:
    for message in reversed(messages):
        if message.role == "user":
            return _flatten_content(message.content)
    return _flatten_content(messages[-1].content) if messages else ""


def _extract_ticker(text: str) -> str | None:
    for match in TICKER_PATTERN.finditer(text):
        value = match.group(1)
        if value not in {"BUY", "SELL", "HOLD", "USD", "VND", "JSON", "POST", "GET"}:
            return value
    return None


def _extract_trade_date(text: str) -> str | None:
    match = DATE_PATTERN.search(text)
    return match.group(1) if match else None


def _build_graph(model_name: str, selected_analysts: list[str]) -> TradingAgentsGraph:
    config = DEFAULT_CONFIG.copy()
    config["deep_think_llm"] = model_name
    config["quick_think_llm"] = model_name
    config["max_debate_rounds"] = int(os.getenv("FINLY_MAX_DEBATE_ROUNDS", "1"))
    config["max_risk_discuss_rounds"] = int(os.getenv("FINLY_MAX_RISK_ROUNDS", "1"))
    config["data_vendors"] = {
        "core_stock_apis": os.getenv("FINLY_VENDOR_CORE_STOCK", "yfinance"),
        "technical_indicators": os.getenv("FINLY_VENDOR_TECHNICAL", "yfinance"),
        "fundamental_data": os.getenv("FINLY_VENDOR_FUNDAMENTAL", "yfinance"),
        "news_data": os.getenv("FINLY_VENDOR_NEWS", "yfinance"),
    }
    return TradingAgentsGraph(debug=False, config=config, selected_analysts=selected_analysts)


def _run_finly_agents(request: ChatCompletionsRequest) -> dict[str, Any]:
    if not request.messages:
        raise HTTPException(status_code=400, detail="messages is required")

    prompt_text = _extract_last_user_text(request.messages)
    ticker = (request.ticker or _extract_ticker(prompt_text) or os.getenv("FINLY_DEFAULT_TICKER") or "FPT").upper()
    trade_date = request.trade_date or _extract_trade_date(prompt_text) or date.today().isoformat()

    selected_analysts = request.selected_analysts or DEFAULT_ANALYSTS
    model_name = os.getenv("FINLY_AGENT_MODEL", "openai/gpt-4.1-mini")

    graph = _build_graph(model_name=model_name, selected_analysts=selected_analysts)
    final_state, decision = graph.propagate(ticker, trade_date)

    final_report = final_state.get("final_trade_decision", "")
    content = (
        f"Ticker: {ticker}\n"
        f"Trade date: {trade_date}\n"
        f"Decision: {str(decision).strip()}\n\n"
        f"Final report:\n{final_report}"
    ).strip()

    return {
        "ticker": ticker,
        "trade_date": trade_date,
        "decision": str(decision).strip(),
        "content": content,
        "final_state": final_state,
    }


def _truncate_sentences(text: str, max_sentences: int = 3) -> str:
    """Return first N sentences from text."""
    if not text:
        return ""
    sentences = re.split(r'(?<=[.!?])\s+', str(text))
    return " ".join(sentences[:max_sentences])


def _extract_specialist_insights(final_state: dict) -> list[SpecialistInsight]:
    """Map internal state fields to user-friendly specialist insights."""
    mappings = [
        ("market_report", "market_analyst"),
        ("fundamentals_report", "portfolio_manager"),
        ("news_report", "researcher"),
        ("sentiment_report", "sentiment_analyst"),
    ]
    insights = []
    for key, role in mappings:
        text = final_state.get(key, "")
        if text:
            insights.append(SpecialistInsight(
                role=role,
                summary=_truncate_sentences(text, 3),
            ))

    # Extract risk section from final_trade_decision
    ftd = final_state.get("final_trade_decision", "")
    if ftd:
        # Try to find risk-related content
        risk_text = ""
        for line in ftd.split("\n"):
            if any(kw in line.lower() for kw in ("risk", "downside", "stop-loss", "caution")):
                risk_text = line.strip()
                break
        if risk_text:
            insights.append(SpecialistInsight(role="risk_assessor", summary=risk_text))

    return insights


def _split_chunks(text: str, chunk_size: int = 120) -> list[str]:
    return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)] or [""]


def _sse_data(payload: dict[str, Any]) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Finly Agents API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    seed_demo_alerts()
    logger.info("Finly Agents API started — demo alerts seeded")


# ---------------------------------------------------------------------------
# Health & models (existing)
# ---------------------------------------------------------------------------

@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/v1/models")
def list_models() -> dict[str, Any]:
    now = int(time.time())
    return {
        "object": "list",
        "data": [
            {
                "id": "finly-agents-v1",
                "object": "model",
                "created": now,
                "owned_by": "finly",
            }
        ],
    }


# ---------------------------------------------------------------------------
# OpenAI-compatible chat completions (existing)
# ---------------------------------------------------------------------------

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionsRequest):
    created = int(time.time())
    completion_id = f"chatcmpl-{uuid.uuid4().hex}"

    try:
        result = await asyncio.to_thread(_run_finly_agents, request)
    except Exception as e:
        logger.exception("Agent pipeline failed")
        return JSONResponse(
            status_code=200,
            content={
                "id": completion_id,
                "object": "chat.completion",
                "created": created,
                "model": request.model,
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": f"I encountered an error analyzing this request. Please try again. Error: {e}",
                        },
                        "finish_reason": "stop",
                    }
                ],
            },
        )

    assistant_text = result["content"]

    if not request.stream:
        return JSONResponse(
            {
                "id": completion_id,
                "object": "chat.completion",
                "created": created,
                "model": request.model,
                "choices": [
                    {
                        "index": 0,
                        "message": {"role": "assistant", "content": assistant_text},
                        "finish_reason": "stop",
                    }
                ],
            }
        )

    async def event_stream():
        yield _sse_data(
            {
                "id": completion_id,
                "object": "chat.completion.chunk",
                "created": created,
                "model": request.model,
                "choices": [{"index": 0, "delta": {"role": "assistant"}, "finish_reason": None}],
            }
        )

        for part in _split_chunks(assistant_text):
            yield _sse_data(
                {
                    "id": completion_id,
                    "object": "chat.completion.chunk",
                    "created": created,
                    "model": request.model,
                    "choices": [{"index": 0, "delta": {"content": part}, "finish_reason": None}],
                }
            )

        yield _sse_data(
            {
                "id": completion_id,
                "object": "chat.completion.chunk",
                "created": created,
                "model": request.model,
                "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
            }
        )
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ---------------------------------------------------------------------------
# Onboarding & user profiles
# ---------------------------------------------------------------------------

@app.post("/api/onboarding")
async def onboarding(req: OnboardingRequest) -> UserProfile:
    return create_or_update_profile(req)


@app.get("/api/user/{user_id}/profile")
async def user_profile(user_id: str):
    profile = get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile


@app.get("/api/user/{user_id}/chat-history")
async def user_chat_history(user_id: str, limit: int = Query(default=20, le=100)):
    return get_chat_history(user_id, limit=limit)


# ---------------------------------------------------------------------------
# Simplified chat endpoint
# ---------------------------------------------------------------------------

@app.post("/api/chat")
async def api_chat(req: ChatRequest):
    """Simplified chat — returns structured ChatResponse with specialist insights."""
    # Record user message
    append_chat(req.user_id, "user", req.message)

    ticker = req.ticker or _extract_ticker(req.message) or os.getenv("FINLY_DEFAULT_TICKER", "FPT")
    ticker = ticker.upper()

    # Build an internal ChatCompletionsRequest
    internal_req = ChatCompletionsRequest(
        messages=[Message(role="user", content=req.message)],
        ticker=ticker,
    )

    try:
        result = await asyncio.to_thread(_run_finly_agents, internal_req)
    except Exception as e:
        logger.exception("Agent pipeline failed in /api/chat")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
        )

    final_state = result.get("final_state", {})
    insights = _extract_specialist_insights(final_state)

    response = ChatResponse(
        ticker=result["ticker"],
        decision=result["decision"],
        summary=_truncate_sentences(result.get("content", ""), 5),
        specialist_insights=insights,
        full_report=final_state.get("final_trade_decision", result.get("content", "")),
    )

    # Record assistant reply
    append_chat(req.user_id, "assistant", response.summary)

    return response


# ---------------------------------------------------------------------------
# Voice chat endpoint
# ---------------------------------------------------------------------------

@app.post("/api/chat/voice")
async def api_chat_voice(req: ChatRequest):
    """Chat + ElevenLabs TTS audio response. Falls back to JSON if TTS unavailable."""
    append_chat(req.user_id, "user", req.message)

    ticker = req.ticker or _extract_ticker(req.message) or os.getenv("FINLY_DEFAULT_TICKER", "FPT")
    ticker = ticker.upper()

    internal_req = ChatCompletionsRequest(
        messages=[Message(role="user", content=req.message)],
        ticker=ticker,
    )

    try:
        result = await asyncio.to_thread(_run_finly_agents, internal_req)
    except Exception as e:
        logger.exception("Agent pipeline failed in /api/chat/voice")
        return JSONResponse(status_code=500, content={"error": str(e)})

    final_state = result.get("final_state", {})
    insights = _extract_specialist_insights(final_state)
    summary = _truncate_sentences(result.get("content", ""), 5)

    append_chat(req.user_id, "assistant", summary)

    # Try TTS
    from finly_agents.voice import text_to_speech

    audio_bytes = await text_to_speech(summary)
    if audio_bytes:
        return StreamingResponse(
            iter([audio_bytes]),
            media_type="audio/mpeg",
            headers={"X-Finly-Ticker": result["ticker"], "X-Finly-Decision": result["decision"]},
        )

    # Fallback to JSON
    return ChatResponse(
        ticker=result["ticker"],
        decision=result["decision"],
        summary=summary,
        specialist_insights=insights,
        full_report=final_state.get("final_trade_decision", result.get("content", "")),
    )


# ---------------------------------------------------------------------------
# Market data
# ---------------------------------------------------------------------------

@app.get("/api/market-data")
async def market_data(tickers: str = Query(default="VCB,FPT,VNM,TPB")):
    """Return current mock prices for Vietnamese tickers."""
    from finly_agents.mock_data import VN_TICKERS, _BASE_PRICES, _clean, is_vn_ticker

    import random

    results: list[dict] = []
    for raw_ticker in tickers.split(","):
        raw_ticker = raw_ticker.strip().upper()
        clean = _clean(raw_ticker)
        if clean in _BASE_PRICES:
            base = _BASE_PRICES[clean]
            random.seed(hash(clean + date.today().isoformat()) % 2**31)
            change_pct = round(random.uniform(-3.0, 4.0), 2)
            price = round(base * (1 + change_pct / 100))
            results.append(
                MarketTicker(
                    ticker=clean,
                    price=price,
                    change_pct=change_pct,
                    currency="VND",
                ).model_dump()
            )
        else:
            results.append(
                MarketTicker(
                    ticker=raw_ticker,
                    price=0.0,
                    change_pct=0.0,
                    currency="USD",
                ).model_dump()
            )
    return results


# ---------------------------------------------------------------------------
# Heartbeat alerts
# ---------------------------------------------------------------------------

@app.get("/api/heartbeat/alerts")
async def heartbeat_alerts(user_id: str = Query(default="broadcast")):
    """Poll and clear pending alerts for a user."""
    alerts = get_pending_alerts(user_id)
    return [a.model_dump() for a in alerts]


@app.post("/api/heartbeat/trigger")
async def heartbeat_trigger(scenario: str = Query(...), user_id: str = Query(default="broadcast")):
    """Admin: inject an alert scenario."""
    try:
        alert = trigger_alert(scenario, user_id)
        return alert.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

def run() -> None:
    import uvicorn

    host = os.getenv("FINLY_AGENTS_HOST", "0.0.0.0")
    port = int(os.getenv("FINLY_AGENTS_PORT", "8000"))
    uvicorn.run("finly_agents.server:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    run()
