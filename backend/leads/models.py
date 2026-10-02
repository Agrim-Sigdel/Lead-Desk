"""
Lead model — represents a sales lead owned by a user.
"""

from django.conf import settings
from django.db import models


class Lead(models.Model):
    """
    A sales lead with status tracking.
    Each lead is owned by a user (member or admin).
    """

    STATUS_CHOICES = [
        ("new", "New"),
        ("contacted", "Contacted"),
        ("qualified", "Qualified"),
        ("lost", "Lost"),
    ]

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    company = models.CharField(max_length=200)
    website = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="new")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leads",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "leads"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.company}) - {self.status}"
