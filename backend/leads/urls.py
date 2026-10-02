"""
Leads URL configuration.
Routes are under /api/ (prefixed in lead_desk/urls.py).
"""

from django.urls import path

from .views import LeadListCreateView, LeadDetailView

urlpatterns = [
    path("leads/", LeadListCreateView.as_view(), name="lead-list-create"),
    path("leads/<int:pk>/", LeadDetailView.as_view(), name="lead-detail"),
]
