"""
Users URL configuration.
Routes are under /api/admin/ (prefixed in lead_desk/urls.py).
"""

from django.urls import path

from .views import UserListView

urlpatterns = [
    path("users/", UserListView.as_view(), name="admin-user-list"),
]
