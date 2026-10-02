"""
JWT utilities and cookie helpers.

Centralizes all token creation, validation, and cookie setting logic.
"""

from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings


# ---------------------------------------------------------------------------
# JWT Access Token
# ---------------------------------------------------------------------------

def create_access_token(user):
    """
    Create a JWT access token containing user ID and role.
    The token is signed with JWT_SECRET and expires after ACCESS_TOKEN_TTL_MINUTES.
    """
    payload = {
        "user_id": user.id,
        "role": user.role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_TTL_MINUTES),
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def decode_access_token(token):
    """
    Decode and validate a JWT access token.
    Returns the payload dict or raises jwt.InvalidTokenError.
    """
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Not an access token")
    return payload


# ---------------------------------------------------------------------------
# Cookie Helpers
# ---------------------------------------------------------------------------

def set_auth_cookies(response, access_token, refresh_token):
    """
    Set httpOnly cookies for both access and refresh tokens.
    - Access token: Path=/ (sent with every API request)
    - Refresh token: Path=/api/auth/ (only sent to auth endpoints)
    """
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
        httponly=True,
        samesite="Lax",
        secure=settings.SECURE_COOKIES,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_TTL_DAYS * 86400,
        httponly=True,
        samesite="Lax",
        secure=settings.SECURE_COOKIES,
        path="/api/auth/",
    )


def clear_auth_cookies(response):
    """Clear both auth cookies by setting them to expire immediately."""
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/api/auth/")
