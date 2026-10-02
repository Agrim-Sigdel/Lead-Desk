"""
Authentication views — Login, Refresh, Logout, Me.

All auth state is managed via httpOnly cookies.
Tokens are NEVER returned in the response body.
"""

from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import RefreshToken, User
from .serializers import LoginSerializer
from .utils import clear_auth_cookies, create_access_token, set_auth_cookies


class LoginView(APIView):
    """
    POST /api/auth/login

    Validates email + password, creates JWT access token and refresh token,
    sets both as httpOnly cookies. Returns user info (never tokens).
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Verify password using Django's built-in check (bcrypt)
        if not user.check_password(password):
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Create tokens
        access_token = create_access_token(user)
        raw_refresh_token = RefreshToken.generate_token()

        # Store only the hash of the refresh token in the database
        RefreshToken.objects.create(
            user=user,
            token_hash=RefreshToken.hash_token(raw_refresh_token),
            expires_at=timezone.now() + timedelta(days=7),
        )

        # Build response — user info only, tokens go in cookies
        response = Response(
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )

        set_auth_cookies(response, access_token, raw_refresh_token)
        return response


class RefreshView(APIView):
    """
    POST /api/auth/refresh

    Validates the refresh token from the cookie, rotates it
    (issues new access + refresh, revokes the old one).

    If a revoked token is sent again, it's rejected (replay detection).
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        raw_token = request.COOKIES.get("refresh_token")
        if not raw_token:
            return Response(
                {"error": "Refresh token not provided"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token_hash = RefreshToken.hash_token(raw_token)

        try:
            stored_token = RefreshToken.objects.select_related("user").get(
                token_hash=token_hash
            )
        except RefreshToken.DoesNotExist:
            return Response(
                {"error": "Invalid refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Check if token has been revoked (replay detection)
        if stored_token.revoked_at is not None:
            return Response(
                {"error": "Refresh token has been revoked"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Check if token has expired
        if stored_token.expires_at < timezone.now():
            return Response(
                {"error": "Refresh token has expired"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Revoke the old refresh token (rotation)
        stored_token.revoke()

        # Issue new tokens
        user = stored_token.user
        new_access_token = create_access_token(user)
        new_raw_refresh = RefreshToken.generate_token()

        RefreshToken.objects.create(
            user=user,
            token_hash=RefreshToken.hash_token(new_raw_refresh),
            expires_at=timezone.now() + timedelta(days=7),
        )

        response = Response(
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )

        set_auth_cookies(response, new_access_token, new_raw_refresh)
        return response


class LogoutView(APIView):
    """
    POST /api/auth/logout

    Revokes the refresh token on the server and clears both cookies.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_token = request.COOKIES.get("refresh_token")
        if raw_token:
            token_hash = RefreshToken.hash_token(raw_token)
            try:
                stored_token = RefreshToken.objects.get(token_hash=token_hash)
                stored_token.revoke()
            except RefreshToken.DoesNotExist:
                pass  # Token already gone — still clear cookies

        response = Response(
            {"message": "Logged out successfully"},
            status=status.HTTP_200_OK,
        )
        clear_auth_cookies(response)
        return response


class MeView(APIView):
    """
    GET /api/auth/me

    Returns the currently authenticated user's info.
    Used by the frontend to restore sessions on page reload.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )
