# HospitalBooking

Multi-tenant hospital appointment and live queue management platform.

## Product model

A doctor can operate a practice in one of three modes:

- **APPOINTMENT** — patients reserve a time.
- **QUEUE** — patients register and receive a token.
- **HYBRID** — both workflows are available.

Appointment patients join the live queue after check-in. Queue patients receive a token directly.

## Stack

- Backend: Java 21 + Spring Boot
- Database: H2 for development/test, PostgreSQL for production
- Persistence: Spring Data JPA / Hibernate
- Production migrations: Flyway
- Frontend: React + Vite
- API: REST
- Realtime queue: planned WebSocket/SSE module
- Internal architecture: modular monolith first
- Container: Docker + GitHub Container Registry

## Repository layout

```
backend/          Spring Boot application
frontend/         React/Vite application
database/         PostgreSQL schema and database design notes
.github/workflows GitHub Actions CI/CD
```

## Current implementation

### Phase 1 — Schema
- SaaS tenancy
- Hospitals/branches
- Doctors and doctor practices
- Practice-specific services
- Weekly schedules and exceptions
- Dynamic appointment availability model
- Appointments
- Queue counters and tickets
- Payments, notifications and audit foundations

### Phase 2 — Backend
- Spring Boot application
- H2 development profile
- PostgreSQL production profile
- Flyway PostgreSQL baseline
- Appointment booking endpoint
- Appointment overlap protection
- Queue token issuance
- Queue listing endpoint
- Actuator health endpoint
- Docker image workflow

### Phase 3 — Frontend
- Existing Vite/React setup retained
- CareFlow dashboard redesign
- Appointment/queue/admin surfaces
- Responsive layout

## Development

Backend:

```bash
cd backend
mvn spring-boot:run
```

Default profile uses an in-memory H2 database.

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

## API foundation

Health:

`GET /api/v1/status`

Appointments:

`POST /api/v1/appointments`

`GET /api/v1/appointments?practiceId={id}&date={yyyy-MM-dd}`

Queue:

`POST /api/v1/queue/tickets`

`GET /api/v1/queue/tickets?practiceId={id}&date={yyyy-MM-dd}`

The current development API uses `X-Tenant-Id` as a temporary tenant-context header. Before production, this will be replaced by authenticated JWT tenant context; clients must not be allowed to choose arbitrary tenant IDs.

## GitHub Actions

- Backend CI — Maven build/test
- Frontend CI — npm build
- Backend Container — build/publish Docker image to GHCR
- Frontend Pages — prepared for GitHub Pages deployment

GitHub Pages requires the repository Pages setting to be enabled before the Pages deployment workflow can publish.

## Next phases

1. Authentication + RBAC + tenant context
2. Hospital/doctor/practice administration APIs
3. Dynamic availability API
4. Check-in → queue-ticket workflow
5. Queue calling/serving/completion
6. WebSocket/SSE live queue updates
7. Patient booking UI connected to REST APIs
8. Admin scheduling UI
9. Payments and notifications
10. Production deployment and monitoring

## Live deployment

The project is configured for Render using `render.yaml`.

It provisions:
- React frontend as a Render Static Site
- Spring Boot backend as a Docker Web Service
- PostgreSQL database

Render supports Blueprint-based deployment from a repository. Connect the repository in Render and deploy the Blueprint; the two services and database are then managed from the same configuration. Free Render web services and static sites are suitable for testing, while the free Postgres database expires after 30 days, so production data should use a paid database.

[Deploy the full stack on Render](https://render.com/deploy?repo=https://github.com/aashishsharma436/HospitalBooking)

For the first deployment, provide:
- `VITE_API_BASE_URL` = the public backend URL
- `CORS_ALLOWED_ORIGINS` = the public frontend URL

These values are intentionally not committed as secrets.
