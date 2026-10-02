"""
Authentication models — Custom User and RefreshToken.

Using a custom User model from the start is a Django best practice.
Changing it later (after migrations) is extremely painful.
"""

import hashlib
import os
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom manager for User model with email as the unique identifier."""

    def create_user(self, email, name, password=None, role="member"):
        if not email:
            raise ValueError("Users must have an email address")
        user = self.model(
            email=self.normalize_email(email),
            name=name,
            role=role,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        return self.create_user(email, name, password, role="admin")


class User(AbstractBaseUser):
    """
    Custom User model.
    Uses email instead of username, and has a role field for RBAC.
    """

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")
    created_at = models.DateTimeField(auto_now_add=True)

    # AbstractBaseUser provides 'password' field (stored as hash) and
    # set_password() / check_password() methods.

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.name} ({self.email})"

    @property
    def is_admin(self):
        return self.role == "admin"

    @property
    def is_member(self):
        return self.role == "member"


class RefreshToken(models.Model):
    """
    Stores hashed refresh tokens in the database for revocation support.

    We store only the hash (SHA-256) of the token, not the raw value.
    This means even a full database leak won't compromise active sessions.
    """

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="refresh_tokens",
    )
    token_hash = models.CharField(max_length=64, unique=True, db_index=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "refresh_tokens"

    def __str__(self):
        status = "revoked" if self.revoked_at else "active"
        return f"RefreshToken(user={self.user_id}, {status})"

    @property
    def is_valid(self):
        """Token is valid if not revoked and not expired."""
        return self.revoked_at is None and self.expires_at > timezone.now()

    def revoke(self):
        """Mark this token as revoked."""
        self.revoked_at = timezone.now()
        self.save(update_fields=["revoked_at"])

    @staticmethod
    def generate_token():
        """Generate a cryptographically secure random token."""
        return os.urandom(32).hex()

    @staticmethod
    def hash_token(raw_token):
        """
        Hash a raw token using SHA-256.
        This is what we store in the database.
        """
        return hashlib.sha256(raw_token.encode()).hexdigest()
