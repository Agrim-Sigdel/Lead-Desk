"""
Lead serializers — handles validation and representation.
"""

from rest_framework import serializers

from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    """
    Serializer for Lead model.
    - owner is read-only (set by the backend from request.user)
    - owner_name is included for admin views (shows who owns each lead)
    """

    owner_name = serializers.CharField(source="owner.name", read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "name",
            "email",
            "company",
            "website",
            "status",
            "owner",
            "owner_name",
            "created_at",
        ]
        read_only_fields = ["id", "owner", "created_at"]

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value.strip()

    def validate_email(self, value):
        return value.strip().lower()

    def validate_company(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Company must be at least 2 characters.")
        return value.strip()
