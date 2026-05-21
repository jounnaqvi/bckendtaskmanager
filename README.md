# TaskFlow API

A production-ready, scalable full-stack task management platform built with Node.js, Express, MongoDB, and Next.js.

---

## Architecture Overview

```
taskflow/
├── backend/                    # Node.js + Express REST API
│   ├── config/                 # DB connection
│   ├── controllers/            # Business logic
│   ├── middleware/             # Auth, validation, error handling
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions (with Swagger JSDoc)
│   ├── validators/             # express-validator rules
│   ├── utils/                  # Logger, API response helpers
│   ├── docs/                   # Swagger config
│   └── server.js               # App entry point
│
├── app/                        # Next.js App Router pages
│   ├── login/
│   ├── register/
│   └── dashboard/
├── components/                 # Reusable React components
├── services/                   # API client (fetch wrapper)
├── hooks/                      # useAuth, useTasks
└── README.md
```

---

## Tech Stack

| Layer       | Technology                                 |
|-------------|---------------------------------------------|
| Backend     | Node.js 20, Express 4, Mongoose 8           |
| Database    | MongoDB 7                                   |
| Auth        | JWT (jsonwebtoken), bcryptjs                |
| Validation  | express-validator                           |
| Security    | Helmet, CORS, express-rate-limit, mongo-sanitize |
| Logging     | Winston                                     |
| API Docs    | Swagger (swagger-jsdoc + swagger-ui-express) |
| Frontend    | Next.js 13 (App Router), Tailwind CSS       |
| Cache       | Redis (placeholder, ready to integrate)     |
---

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install

```bash
# Install frontend deps
npm install

# Install backend deps
cd backend && npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secret

# Frontend
cp .env.example .env.local
# Edit .env.local with your API URL
```

### 3. Run Development

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

Frontend: http://localhost:3000  
Backend API: http://localhost:5000  
Swagger Docs: http://localhost:5000/api-docs  

---

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Description                      | Default         |
|-----------------------|----------------------------------|-----------------|
| `PORT`                | Server port                      | `5000`          |
| `NODE_ENV`            | Environment                      | `development`   |
| `MONGODB_URI`         | MongoDB connection string        | required        |
| `JWT_SECRET`          | JWT signing secret               | required        |
| `JWT_EXPIRES_IN`      | JWT expiry duration              | `7d`            |
| `RATE_LIMIT_WINDOW_MS`| Rate limit window (ms)           | `900000` (15m)  |
| `RATE_LIMIT_MAX`      | Max requests per window          | `100`           |
| `FRONTEND_URL`        | Allowed CORS origin              | `*`             |
| `REDIS_URL`           | Redis URL (optional)             | —               |

### Frontend (`.env.local`)

| Variable               | Description          |
|------------------------|----------------------|
| `NEXT_PUBLIC_API_URL`  | Backend API base URL |

---

## API Reference

### Authentication

| Method | Endpoint                  | Auth Required | Description       |
|--------|---------------------------|:-------------:|-------------------|
| POST   | `/api/v1/auth/register`   | No            | Register new user |
| POST   | `/api/v1/auth/login`      | No            | Login             |
| GET    | `/api/v1/auth/profile`    | Yes           | Get own profile   |

### Tasks

| Method | Endpoint              | Auth Required | Description               |
|--------|-----------------------|:-------------:|---------------------------|
| POST   | `/api/v1/tasks`       | Yes           | Create task               |
| GET    | `/api/v1/tasks`       | Yes           | List tasks (paginated)    |
| GET    | `/api/v1/tasks/:id`   | Yes           | Get single task           |
| PUT    | `/api/v1/tasks/:id`   | Yes           | Update task               |
| DELETE | `/api/v1/tasks/:id`   | Yes           | Delete task               |

#### Query Parameters (GET /api/v1/tasks)

| Param      | Type   | Description                           |
|------------|--------|---------------------------------------|
| `page`     | int    | Page number (default: 1)             |
| `limit`    | int    | Results per page (default: 10)       |
| `status`   | string | Filter: pending, in-progress, completed |
| `priority` | string | Filter: low, medium, high            |
| `search`   | string | Full-text search on title/description |

#### Example Request

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'

# Create task (with token)
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Fix bug #42","priority":"high","status":"in-progress"}'
```

---

## Role-Based Access Control

| Action                 | User | Admin |
|------------------------|:----:|:-----:|
| Create task            | Own  | Any   |
| Read tasks             | Own  | All   |
| Update task            | Own  | Any   |
| Delete task            | Own  | Any   |

---

## Scalability Design

1. **API Versioning** — All routes prefixed with `/api/v1/` for backward-compatible upgrades.
2. **Pagination** — All list endpoints are paginated; never unbounded queries.
3. **Indexes** — MongoDB indexes on `createdBy + status` and text search on `title + description`.
4. **Rate Limiting** — Per-IP rate limiting on all `/api` routes.
5. **Redis Ready** — Caching layer placeholder for session/response caching.
6. **Stateless Auth** — JWT tokens; horizontally scalable with no server-side session storage.
7. **Winston Logging** — Structured logs to files for aggregation (ELK, Datadog, etc.).
8. **Error Middleware** — Centralized error handling with environment-aware stack traces.
9. **Mongoose Connection Pooling** — Default pool handles concurrent load.

---

## Security Checklist

- [x] Passwords hashed with bcryptjs (cost factor 12)
- [x] JWT with configurable expiry
- [x] Helmet sets secure HTTP headers
- [x] CORS restricted to `FRONTEND_URL`
- [x] Rate limiting (100 req / 15 min per IP)
- [x] MongoDB injection prevention via `express-mongo-sanitize`
- [x] Input validation on every endpoint via `express-validator`
- [x] Body size limit (10kb) to prevent payload attacks
- [x] RLS-equivalent: users query scoped by `createdBy: req.user._id`
