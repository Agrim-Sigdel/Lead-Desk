"""
Custom permission classes for role-based access control.
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only allows access to users with the 'admin' role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )
