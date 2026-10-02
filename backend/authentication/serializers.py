"""
Authentication serializers — validates login input.
"""

from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    """Validates email and password for the login endpoint."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
