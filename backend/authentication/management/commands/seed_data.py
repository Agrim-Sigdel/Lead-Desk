"""
Management command to seed the database with initial users and sample leads.

This command is IDEMPOTENT — it checks if data already exists before creating.
Safe to run on every container start.

Usage: python manage.py seed_data
"""

from django.core.management.base import BaseCommand

from authentication.models import User
from leads.models import Lead


class Command(BaseCommand):
    help = "Seed the database with initial users and sample leads."

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # ---------------------------------------------------------------
        # Create users (idempotent)
        # ---------------------------------------------------------------
        admin, admin_created = self._create_user(
            email="admin@leaddesk.test",
            name="Admin User",
            password="Admin@123",
            role="admin",
        )
        member, member_created = self._create_user(
            email="member@leaddesk.test",
            name="Member User",
            password="Member@123",
            role="member",
        )

        # ---------------------------------------------------------------
        # Create sample leads (only if no leads exist)
        # ---------------------------------------------------------------
        if Lead.objects.count() == 0:
            self._create_sample_leads(admin, member)
            self.stdout.write(self.style.SUCCESS("  ✓ Sample leads created"))
        else:
            self.stdout.write("  - Leads already exist, skipping")

        self.stdout.write(self.style.SUCCESS("Seeding complete!"))

    def _create_user(self, email, name, password, role):
        """Create a user if they don't already exist."""
        if User.objects.filter(email=email).exists():
            self.stdout.write(f"  - User {email} already exists, skipping")
            return User.objects.get(email=email), False

        user = User.objects.create_user(
            email=email, name=name, password=password, role=role,
        )
        self.stdout.write(self.style.SUCCESS(f"  ✓ Created {role}: {email}"))
        return user, True

    def _create_sample_leads(self, admin, member):
        """Create 3-5 sample leads for each user."""
        member_leads = [
            {"name": "Alice Johnson", "email": "alice@acme.com", "company": "Acme Corp", "status": "new"},
            {"name": "Bob Williams", "email": "bob@globex.com", "company": "Globex Inc", "website": "https://globex.com", "status": "contacted"},
            {"name": "Carol Davis", "email": "carol@initech.com", "company": "Initech", "status": "qualified"},
        ]
        for lead_data in member_leads:
            Lead.objects.create(owner=member, **lead_data)

        admin_leads = [
            {"name": "David Brown", "email": "david@stark.com", "company": "Stark Industries", "website": "https://stark.com", "status": "new"},
            {"name": "Eve Martinez", "email": "eve@wayne.com", "company": "Wayne Enterprises", "status": "contacted"},
            {"name": "Frank Wilson", "email": "frank@oscorp.com", "company": "Oscorp", "status": "lost"},
            {"name": "Grace Lee", "email": "grace@umbrella.com", "company": "Umbrella Corp", "website": "https://umbrella.com", "status": "qualified"},
        ]
        for lead_data in admin_leads:
            Lead.objects.create(owner=admin, **lead_data)
