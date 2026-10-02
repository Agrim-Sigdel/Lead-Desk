"""
User serializer — for admin user list endpoint.
Never exposes password hashes.
"""

from rest_framework import serializers

from authentication.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "created_at"]
