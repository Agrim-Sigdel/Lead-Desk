"""
Users views — admin-only endpoint.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.models import User

from .permissions import IsAdmin
from .serializers import UserSerializer


class UserListView(APIView):
    """
    GET /api/admin/users/

    Returns all users. Admin only — a member gets 403.
    Never includes password hashes in the response.
    """

    permission_classes = [IsAdmin]

    def get(self, request):
        users = User.objects.all().order_by("-created_at")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
