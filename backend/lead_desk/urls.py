from django.urls import include, path

from .views import HealthCheckView

urlpatterns = [
    path("api/health/", HealthCheckView.as_view(), name="health-check"),

    path("api/auth/", include("authentication.urls")),

    path("api/", include("leads.urls")),

    path("api/admin/", include("users.urls")),
]
