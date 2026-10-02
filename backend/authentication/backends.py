"""
Custom DRF authentication backend that reads JWT from httpOnly cookies.

This replaces DRF's default session/token authentication.
The browser sends the access_token cookie automatically with every request.
"""

import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import User
from .utils import decode_access_token


class CookieJWTAuthentication(BaseAuthentication):
    """
    Authenticate requests by reading the JWT from the 'access_token' cookie.

    The frontend never touches the token directly — the browser sends
    the httpOnly cookie automatically when credentials: 'include' is set.
    """

    def authenticate(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            return None  # No token → anonymous request (let permission classes decide)

        try:
            payload = decode_access_token(token)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Access token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid access token")

        try:
            user = User.objects.get(id=payload["user_id"])
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found")

        return (user, payload)

    def authenticate_header(self, request):
        """
        Required for DRF to return 401 Unauthorized instead of 403 Forbidden
        when a request is unauthenticated. The frontend Axios interceptor
        specifically listens for 401 to trigger token refresh.
        """
        return 'Bearer realm="api"'
