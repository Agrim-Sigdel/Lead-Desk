# Lead Desk Frontend

This is the frontend application for Lead Desk, built with React, TypeScript, and Vite.

## Features
- **Role-Based Navigation:** Distinct dashboards for Admin and Member users.
- **Secure Authentication:** No tokens stored in localStorage. All requests are authenticated via `httpOnly` cookies handled seamlessly by the browser.
- **Axios Interceptors:** A robust, single-request refresh flow built into an Axios interceptor to ensure that multiple parallel requests wait for a single silent token refresh.
- **Responsive UI:** Clean, custom styling for data tables, modals, and forms.

## Running Locally

In a typical scenario, this should be run via Docker Compose from the root directory:
```bash
docker compose up --build
```

If you wish to run it independently for development (requires the backend to be running):
```bash
npm install
npm run dev
```
