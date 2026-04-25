# SmartSeason Field Monitoring System
live deployment:  http://3.250.213.224:5173/admin/dashboard

## 1. Overview

SmartSeason is a field monitoring system for agricultural operations that need clear visibility into crop progress, field ownership, and intervention needs. The platform supports two roles:

- `admin`: manages fields, assignments, users, and system-wide reporting
- `field_agent`: manages updates for assigned fields and monitors field health in the field

The system is designed to help teams answer a few critical questions quickly:

- Which fields are active right now?
- Which fields are falling behind and need attention?
- Which agent owns each field?
- What is the latest stage and update history for every field?

## 2. Tech Stack

### Backend

- `Node.js + Express`
  Chosen for a fast, familiar API layer with simple middleware composition and good ecosystem support for JWT auth, validation, and PostgreSQL integration.
- `PostgreSQL`
  Chosen for strong relational modeling, constraints, indexing support, and reliable query performance for dashboard and history-based workloads.
- `Knex`
  Chosen as a lightweight query builder and migration tool that avoids raw SQL while keeping database logic explicit and testable.
- `bcryptjs`
  Used for secure password hashing with configurable work factor.
- `jsonwebtoken`
  Used for stateless authentication with a 7-day token lifetime.
- `express-validator`
  Used for request validation and standardized 422 responses.
- `cors` + `dotenv`
  Used for frontend-backend communication and environment management.

### Frontend

- `React 18 + Vite`
  Chosen for fast development feedback, clean component architecture, and modern SPA support.
- `React Router v6`
  Used for role-based routing and protected application sections.
- `Axios`
  Used for API communication, auth header injection, and centralized 401 handling.
- `Context API`
  Chosen over Redux to keep auth and app state simple for the current product scope.
- `TailwindCSS`
  Used for rapid, consistent, responsive UI development.
- `Recharts`
  Used for dashboard data visualization.
- `React Hook Form + Zod`
  Used for ergonomic forms with schema-based client-side validation.

### DevOps

- `Docker Compose`
  Used to run the full stack locally with a single command.
- `Postgres 15 Alpine`
  Used as a compact, production-relevant relational database image.

## 3. Architecture

The application is structured as a small monorepo with a clear frontend/backend separation:

- `/backend`
  Contains the Express API, middleware, controllers, services, routes, database migrations, and seeds.
- `/frontend`
  Contains the React client, route layouts, API layer, hooks, pages, and reusable UI components.

### Separation of Concerns

- `routes`
  Declare endpoints and attach middleware.
- `controllers`
  Orchestrate request/response flow only.
- `services`
  Hold business logic such as computed field status.
- `middleware`
  Handle authentication, authorization, and request validation.
- `db/migrations + db/seeds`
  Manage schema and reproducible demo data.

### Data Model

The system uses four core tables:

- `users`
- `fields`
- `field_updates`
- `field_assignments`

`field_assignments` stores assignment history so reassignments are auditable. Current field status is not stored in the database; it is computed on read using the latest field snapshot plus the latest update timestamp.

## 4. Field Status Logic

Field status is computed dynamically in the backend service layer and injected into every field response. It is never persisted to the database.

### Rules in Plain English

1. A field is `Completed` when its current stage is `Harvested`.
2. A field is `At Risk` when either:
   - it has had no update in the last 7 days, or
   - it has been in `Growing` stage for more than 60 days since `planting_date`
3. A field is `Active` when:
   - its current stage is `Planted` or `Growing`, and
   - `planting_date` is on or before today
4. If a field qualifies as both `Active` and `At Risk`, `At Risk` wins.

### Evaluation Order

| Step | Condition | Result |
|---|---|---|
| 1 | `current_stage = Harvested` | `Completed` |
| 2 | No update in last 7 days | `At Risk` |
| 3 | `current_stage = Growing` and more than 60 days since planting | `At Risk` |
| 4 | `current_stage IN (Planted, Growing)` and `planting_date <= today` | `Active` |
| 5 | Anything else | `Pending` |

### Notes

- `At Risk` takes priority over `Active`.
- For fields with no updates yet, staleness is measured from `planting_date`.
- The computed status helper signature is:

```js
computeStatus(field, lastUpdateDate)
```

## 5. Setup (Local Dev)

### Prerequisites

- `Node.js 20+`
- `npm 10+`
- `PostgreSQL 15+`

### 1. Clone and enter the project

```bash
git clone <your-repo-url> smartseason
cd smartseason
```

### 2. Create the database

```bash
createdb smartseason
```

If your PostgreSQL setup requires a different user, password, host, or port, update the backend environment file accordingly.

### 3. Configure backend environment

```bash
cp backend/.env.example backend/.env
```

Set:

```env
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/smartseason
JWT_SECRET=change_me_in_production
NODE_ENV=development
```

### 4. Configure frontend environment

```bash
cp frontend/.env.example frontend/.env
```

Set:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 5. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 6. Run database migrations and seed demo data

```bash
cd backend
npm run migrate
npm run seed
cd ..
```

### 7. Start the backend

```bash
cd backend
npm run dev
```

### 8. Start the frontend in a second terminal

```bash
cd frontend
npm run dev
```

### 9. Open the app

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## 6. Setup (Docker)

Run the full application stack with one command from the project root:

```bash
docker compose up --build
```

Expected services:

- `db` on PostgreSQL 15
- `backend` on port `5000`
- `frontend` on port `5173`

## 7. Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@smartseason.com` | `Admin1234!` |
| Field Agent | `agent1@smartseason.com` | `Agent1234!` |
| Field Agent | `agent2@smartseason.com` | `Agent1234!` |

## 8. API Reference

Base path: `/api`

### Auth

- `POST /api/auth/login`
  Auth: public
  Returns JWT token and authenticated user info.
- `POST /api/auth/me`
  Auth: authenticated user
  Returns the current user from the provided token.

### Users

- `GET /api/users`
  Auth: admin
  Returns users, primarily for agent selection and admin user management.

### Fields

- `GET /api/fields`
  Auth: admin or field agent
  Admin sees all fields. Agents see assigned fields only.
- `POST /api/fields`
  Auth: admin
  Creates a field.
- `GET /api/fields/:id`
  Auth: admin or assigned field agent
  Returns field detail including computed status.
- `PATCH /api/fields/:id`
  Auth: admin
  Updates editable field metadata.
- `DELETE /api/fields/:id`
  Auth: admin
  Deletes a field.
- `POST /api/fields/:id/assign`
  Auth: admin
  Assigns or reassigns a field to a field agent.

### Field Updates

- `POST /api/fields/:id/updates`
  Auth: admin or assigned field agent
  Adds a field update and synchronizes `current_stage`.
- `GET /api/fields/:id/updates`
  Auth: admin or assigned field agent
  Returns paginated update history in newest-first order.

### Dashboard

- `GET /api/dashboard`
  Auth: admin or field agent
  Returns dashboard metrics scoped to the requesting user.

### Standard Error Shape

```json
{
  "error": true,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR"
}
```

Validation failures return `422` with field-level details. Authentication failures return `401`. Authorization failures return `403`.

## 9. Design Decisions & Trade-offs

### Why computed status is not stored

Status is derived from stage and recency rules that may change over time. Computing it at read time avoids stale persisted values and keeps the source of truth small.

Trade-off:

- reads do a bit more work
- logic stays centralized and correct

### Why assignment history is modeled separately

Using a dedicated `field_assignments` table preserves reassignment history and makes auditability straightforward.

Trade-off:

- queries are slightly more complex
- reporting and ownership history become much cleaner

### Why Context API instead of Redux

The app needs auth/session state and some fetched data, but not highly complex global state coordination. Context keeps the frontend lighter for this scope.

Trade-off:

- simpler setup today
- may need re-evaluation if the app grows significantly

### Why Knex instead of an ORM

Knex provides migration support and readable query composition without hiding SQL concepts behind a heavier abstraction.

Trade-off:

- more manual mapping than a full ORM
- tighter control over schema, queries, and indexes

## 10. Assumptions Made

- Email addresses are normalized to lowercase before authentication and user creation.
- Only users with role `field_agent` can be assigned to fields.
- Only one active assignment exists per field at any moment.
- A field may exist before assignment, so `assigned_agent` can be `null`.
- `Ready` is a valid stage but does not automatically imply `Completed`.
- If a field has no updates, staleness is measured from `planting_date`.
- Admin users can view and update all fields.
- Field agents can only access fields that are actively assigned to them.
- Field deletion is a hard delete for this implementation.
- The initial build favors clarity and maintainability over premature optimization.

## Proposed Monorepo Structure

```text
/smartseason
  /backend
    /config
    /controllers
    /middleware
    /routes
    /services
    /db
      /migrations
      /seeds
    /utils
    app.js
    server.js
    package.json
    .env.example
    knexfile.js
    Dockerfile
  /frontend
    /src
      /api
      /components
      /context
      /hooks
      /layouts
      /pages
        /auth
        /admin
        /agent
      /utils
      App.jsx
      main.jsx
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
    .env.example
    Dockerfile
  README.md
  docker-compose.yml
```
