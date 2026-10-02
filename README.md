# Lead Desk

Lead Desk is a role-based sales lead management application. It features secure authentication via httpOnly cookies with access and refresh token rotation, ensuring modern security practices. Users can log in as either an administrator (to view all leads and users) or a member (to manage their own leads).

## Tech Stack

- **Backend:** Django with Django REST Framework (DRF). Chosen for its robust ORM, built-in migration system, and secure password hashing.
- **Frontend:** React (TypeScript) built with Vite. Chosen for its fast development server, minimal boilerplate, and great developer experience.
- **Database:** PostgreSQL.
- **Infrastructure:** Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your system.

## How to Run

1. Clone the repository and navigate to the root directory.
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Start the application:
   ```bash
   docker compose up --build
   ```

## URLs & Credentials

Once the containers are running and healthy, the application will be available at:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/

**Seed Accounts:**
- **Admin:** `admin@leaddesk.test` / `Admin@123`
- **Member:** `member@leaddesk.test` / `Member@123`

## Running Tests

To run the automated backend tests inside the Docker container:

```bash
docker compose exec backend python manage.py test
```

## Environment Variables

The `.env` file configures the application. Below are the variables used:

| Variable | Description |
|---|---|
| `POSTGRES_DB` | Name of the PostgreSQL database. |
| `POSTGRES_USER` | PostgreSQL database user. |
| `POSTGRES_PASSWORD` | PostgreSQL database password. |
| `DJANGO_SECRET_KEY` | Secret key used by Django for cryptographic signing. |
| `DEBUG` | Enable/disable Django debug mode (`true`/`false`). |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hostnames for Django. |
| `JWT_SECRET` | Secret key used to sign JWT access tokens. |
| `ACCESS_TOKEN_TTL_MINUTES` | Lifespan of the access token in minutes. |
| `REFRESH_TOKEN_TTL_DAYS` | Lifespan of the refresh token in days. |
| `SECURE_COOKIES` | Set to `true` to require HTTPS for cookies (use `false` for local dev). |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins for cross-origin requests. |

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login/` | Public | Authenticates user and sets httpOnly cookies. |
| POST | `/api/auth/refresh/` | Refresh Cookie | Rotates refresh token and sets new cookies. |
| POST | `/api/auth/logout/` | Logged In | Revokes refresh token and clears cookies. |
| GET | `/api/auth/me/` | Logged In | Returns current authenticated user data. |
| GET | `/api/leads/` | Logged In | Lists leads (all for admins, own for members). |
| POST | `/api/leads/` | Logged In | Creates a new lead owned by the current user. |
| GET | `/api/admin/users/` | Admin Only | Lists all users (passwords excluded). |
| GET | `/api/health/` | Public | Healthcheck endpoint. |

## Explanation

**1. Auth Flow**
When a user logs in, the backend verifies their credentials using bcrypt and generates a JWT access token and a random refresh token. The backend sets both tokens as `httpOnly` cookies (the refresh token's path is restricted to `/api/auth/`) and stores the SHA-256 hash of the refresh token in the database. The frontend receives user data in the response body but never directly handles the tokens. On logout, the refresh token is marked as revoked in the database and the cookies are cleared.

**2. Refresh Handling**
The frontend uses an Axios interceptor to catch `401 Unauthorized` responses. To prevent multiple simultaneous refresh calls when concurrent requests fail, the interceptor checks a shared `isRefreshing` flag and uses a single Promise. All failed requests wait for this single Promise to resolve before retrying with the newly issued access token.

**3. Role-Based Access**
Roles are strictly enforced on the backend. The `CookieJWTAuthentication` backend populates `request.user` via the access token payload. API views use DRF permission classes (like `IsAdmin` or checking `request.user.is_admin`) to authorize actions. On the frontend, route guards (`ProtectedRoute`, `RoleRoute`) check the user's role stored in the `AuthContext` to redirect unauthorized access (e.g., a member trying to access `/admin` is redirected to `/forbidden`).

**4. Docker Setup**
The application uses Docker Compose to orchestrate three services: `db`, `backend`, and `frontend`. The `backend` waits for the database to be healthy (using `pg_isready`), then runs migrations, seeds the database idempotently, and starts Gunicorn. Both the frontend and backend Dockerfiles create a non-root user (`appuser`) and use the `USER` instruction to ensure the processes run with least privilege.

**5. Decisions and Trade-offs**
I chose Django/DRF for the backend because its built-in ORM, migration system, and testing utilities provide a robust foundation out-of-the-box, allowing me to focus on the core security logic. React with Vite was selected for the frontend to create a snappy SPA with straightforward Dockerization. The authentication system uses custom logic rather than a library like SimpleJWT because the requirements (specific cookie flags, path scoping, and DB hashing for revocation) demanded fine-grained control. With more time, I would implement a reverse proxy (like Nginx) to serve both the frontend and backend on the same origin, simplifying CORS and cookie path configuration.

**6. What is not finished**
All core requirements are complete. Additionally, several bonus features were implemented: frontend route guards, admin lead deletion, data tables with pagination/search/filtering, and a GitHub Actions CI workflow. Optional bonuses like Nginx reverse proxying, multi-stage Docker builds, and rate limiting were not implemented to prioritize a fully functional and stable core task. Screenshots are not included in the README.

**7. AI Tools**
Google Antigravity (an advanced agentic AI coding assistant) was used alongside the developer to scaffold the project, write the initial Docker configuration, setup Vite + React, and draft the custom CSS styling. The core architecture, authentication logic, and specific security mechanisms were implemented following the design decisions outlined in this document.
