# Lead Desk Backend

This is the backend API for Lead Desk, built with Django and Django REST Framework (DRF).

## Features
- **Secure JWT Authentication:** Implements stateless authentication with short-lived access tokens and database-backed (hashed) refresh tokens. Both tokens are issued strictly as `httpOnly`, `SameSite=Lax` cookies.
- **Role-Based Access Control:** Strict permission classes ensure that Members can only manage their own leads, while Admins have full access.
- **Dockerized & Idempotent:** Automatically runs migrations and seeds default admin and member accounts on startup inside Docker.

## Structure
- `authentication/`: Handles JWT generation, cookie setting, validation, and token rotation.
- `users/`: User model and admin-facing user listing endpoints.
- `leads/`: Models and endpoints for managing sales leads.

## Running Locally

In a typical scenario, this should be run via Docker Compose from the root directory:
```bash
docker compose up --build
```

To run the automated tests inside Docker:
```bash
docker compose exec backend python manage.py test
```
