"""In-memory user profile and chat history store."""

from __future__ import annotations

from finly_agents.models import OnboardingRequest, UserProfile

_profiles: dict[str, UserProfile] = {}
_chat_history: dict[str, list[dict]] = {}


def create_or_update_profile(req: OnboardingRequest) -> UserProfile:
    profile = UserProfile(
        user_id=req.user_id,
        risk_tolerance=req.risk_tolerance,
        experience_level=req.experience_level,
        portfolio_value=req.portfolio_value,
    )
    _profiles[req.user_id] = profile
    return profile


def get_profile(user_id: str) -> UserProfile | None:
    return _profiles.get(user_id)


def append_chat(user_id: str, role: str, content: str) -> None:
    _chat_history.setdefault(user_id, []).append({"role": role, "content": content})


def get_chat_history(user_id: str, limit: int = 20) -> list[dict]:
    history = _chat_history.get(user_id, [])
    return history[-limit:]
