"""
Lead views — list and create leads.

- Members see only their own leads.
- Admins see all leads with owner info.
- On create, owner is always set to request.user (backend enforced).
"""

from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Lead
from .serializers import LeadSerializer


class LeadPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class LeadListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/leads/ — List leads with pagination, search, and filtering
    POST /api/leads/ — Create a lead (owner = current user)
    """
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LeadPagination

    def get_queryset(self):
        # Base query depends on role
        if self.request.user.is_admin:
            queryset = Lead.objects.select_related("owner").all()
        else:
            queryset = Lead.objects.filter(owner=self.request.user)
            
        # Bonus: Search filter (name or email)
        search_query = self.request.query_params.get("search")
        if search_query:
            queryset = queryset.filter(name__icontains=search_query) | queryset.filter(email__icontains=search_query)
            
        # Bonus: Status filter
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PATCH, DELETE /api/leads/<id>/ — Admin only operations
    """
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    queryset = Lead.objects.all()

    def check_permissions(self, request):
        super().check_permissions(request)
        if not request.user.is_admin:
            raise PermissionDenied("Only admins can update or delete leads.")
