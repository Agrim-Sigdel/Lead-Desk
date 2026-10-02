"""
Authentication URL configuration.
All routes are under /api/auth/ (prefixed in lead_desk/urls.py).
"""

from django.urls import path

from .views import LoginView, LogoutView, MeView, RefreshView

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
]
