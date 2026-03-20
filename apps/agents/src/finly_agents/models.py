"""Pydantic models for Finly API."""

from __future__ import annotations

from pydantic import BaseModel


class UserProfile(BaseModel):
    user_id: str
    risk_tolerance: str = "moderate"  # conservative/moderate/aggressive
    experience_level: str = "beginner"  # beginner/intermediate/advanced
    portfolio_value: float = 0.0
    preferred_tickers: list[str] = []


class OnboardingRequest(BaseModel):
    user_id: str
    risk_tolerance: str = "moderate"
    experience_level: str = "beginner"
    portfolio_value: float = 0.0


class ChatRequest(BaseModel):
    user_id: str = "anonymous"
    message: str
    ticker: str | None = None
    stream: bool = False


class SpecialistInsight(BaseModel):
    role: str  # market_analyst, researcher, risk_assessor, portfolio_manager
    summary: str


class ChatResponse(BaseModel):
    ticker: str
    decision: str  # BUY/HOLD/SELL
    summary: str  # concise plain-English recommendation
    specialist_insights: list[SpecialistInsight]
    full_report: str  # the complete final_trade_decision text


class HeartbeatAlert(BaseModel):
    alert_id: str
    timestamp: str
    ticker: str
    alert_type: str  # price_drop, earnings_beat, sector_move
    headline: str
    body: str
    attributed_to: str  # which agent persona
    severity: str  # info, warning, critical


class MarketTicker(BaseModel):
    ticker: str
    price: float
    change_pct: float
    currency: str
