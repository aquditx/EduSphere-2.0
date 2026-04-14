# EDDDUSPHERE backend

Microservices behind a single API gateway. The frontend in `client/` only ever talks to the gateway on `:8000`.

## Architecture

```
            ┌─────────────┐
            │   Frontend  │   (client/, Vite, :5173)
            └──────┬──────┘
                   │  http://localhost:8000/api/*
                   ▼
            ┌─────────────┐
            │   Gateway   │   gateway/, Express, :8000
            └─┬───┬───┬───┘
              │   │   │   │
   ┌──────────┘   │   │   └────────────────┐
   │              │   │                    │
┌──▼───┐    ┌─────▼──┐│  ┌─────────────┐  ┌▼──────────────┐
│ auth │    │ courses││  │  teachers   │  │   progress    │
│ :5000│    │ :5002  ││  │   :5003     │  │   :5001       │
│  PG  │    │   PG   ││  │     PG      │  │   MongoDB     │
└──────┘    └────────┘│  └─────────────┘  └───────────────┘
                      │
                      └─ each service owns its own database.
```

| Service | Port | Database | Path on gateway |
|---|---|---|---|
| auth_login | 5000 | `auth_service` (Postgres) | `/api/auth/*` |
| progress-tracker | 5001 | `progress` (MongoDB) | `/api/progress/*` |
| courses-service | 5002 | `courses_service` (Postgres) | `/api/courses/*`, `/api/enrollments/*` |
| teachers-service | 5003 | `teachers_service` (Postgres) | `/api/teachers/*` |
| gateway | 8000 | — | (root) |

**Microservice rule we follow:** each service owns its own database. Cross-service reads happen over HTTP, never via SQL joins. Auth is the only service that can read `user_info` — every other service validates tokens by calling `POST http://localhost:5000/validate`.

## First-time setup

### 1. Install Postgres + MongoDB locally

- **Postgres 14+**: https://www.postgresql.org/download/windows/ (default port `5432`)
- **MongoDB 6+**: https://www.mongodb.com/try/download/community (default port `27017`)

Verify both are running:
```bash
psql -U postgres -c "SELECT version();"
mongosh --eval "db.version()"
```

### 2. Create the three Postgres databases

```bash
psql -U postgres -c "CREATE DATABASE auth_service;"
psql -U postgres -c "CREATE DATABASE courses_service;"
psql -U postgres -c "CREATE DATABASE teachers_service;"
```

### 3. Apply the schemas

```bash
# auth_service tables (user_info, profile, auth_session) — already present in your DB.
# If you need to reapply, paste the auth schema you have into psql.

psql -U postgres -d courses_service  -f backend/courses-service/schema.sql
psql -U postgres -d teachers_service -f backend/teachers-service/schema.sql
```

Verify:
```bash
psql -U postgres -d auth_service     -c "\dt"
psql -U postgres -d courses_service  -c "\dt"
psql -U postgres -d teachers_service -c "\dt"
```

### 4. Create `.env` files for each service

Each service ships with `.env.example` — copy it to `.env` and fill in your Postgres password.

```bash
cp backend/auth_login/.env.example       backend/auth_login/.env       # if it doesn't already exist
cp backend/courses-service/.env.example  backend/courses-service/.env
cp backend/teachers-service/.env.example backend/teachers-service/.env
```

Then edit each `.env` and replace `your_postgres_password` with your real password.

### 5. Install dependencies (one time per service)

```bash
cd backend/auth_login        && npm install
cd ../progress-tracker       && npm install
cd ../courses-service        && npm install
cd ../teachers-service       && npm install
cd ../../gateway             && npm install
cd ../client                 && npm install
```

### 6. Seed the demo data

Before you start the services, seed `auth_service` and `courses_service` with realistic data:

```bash
cd backend/courses-service && npm run seed
```

What the seed script does:
- **Upserts 7 instructors + 1 test student** into `auth_service.user_info` with bcrypt-hashed passwords. Safe to re-run — it uses `ON CONFLICT (email)` so existing real users are never deleted.
- **Wipes demo course data** in `courses_service` (`reviews`, `enrollments`, `lessons`, `modules`, `courses`) and re-inserts all 50 courses from [client/src/data/mockData.js](../client/src/data/mockData.js) with real instructor user_ids.
- **Assigns real playable MP4 video URLs** to every lesson (Google's CC-licensed sample video pool — works with plain `<video src="...">`).
- **Auto-enrolls the test student** in 3 courses so the student dashboard has something to show on first login.

**Seeded credentials:**

| Email | Password | Role |
|---|---|---|
| `gloria@edusphere.app` | `pass123` | student |
| `aisha@edusphere.app` | `instructor123` | instructor |
| `noah@edusphere.app` | `instructor123` | instructor |
| `mina@edusphere.app` | `instructor123` | instructor |
| `sarah@edusphere.app` | `instructor123` | instructor |
| `lucas@edusphere.app` | `instructor123` | instructor |
| `harper@edusphere.app` | `instructor123` | instructor |
| `marcus@edusphere.app` | `instructor123` | instructor |

Rerun the seed any time — it's idempotent for users and hard-resets the courses tables.

## Running everything

You need **six terminals** for now (or use [concurrently](https://www.npmjs.com/package/concurrently) / Docker Compose later):

```bash
# Terminal 1 — auth service
cd backend/auth_login && npm run dev

# Terminal 2 — courses service
cd backend/courses-service && npm run dev

# Terminal 3 — teachers service
cd backend/teachers-service && npm run dev

# Terminal 4 — progress tracker
cd backend/progress-tracker && npm start

# Terminal 5 — gateway
cd gateway && npm start

# Terminal 6 — frontend
cd client && npm run dev
```

Expected boot order: auth first (other services need it for token validation), then courses/teachers/progress, then gateway, then client.

## Smoke tests

After everything is up, hit the gateway directly:

```bash
# Gateway is alive
curl http://localhost:8000/health

# Register a student
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Gloria","email":"gloria@test.com","password":"pass123","role":"student"}'

# Log in (save the token from the response)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gloria@test.com","password":"pass123"}'

# List courses (public — no token needed)
curl http://localhost:8000/api/courses

# Get one course
curl http://localhost:8000/api/courses/<course-uuid>

# List your enrollments (token required)
curl http://localhost:8000/api/enrollments \
  -H "Authorization: Bearer <paste-token>"

# Apply to become an instructor (token required)
curl -X POST http://localhost:8000/api/teachers/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <paste-token>" \
  -d '{"reason":"I want to teach React"}'
```

If a request fails:

| Symptom | Likely cause |
|---|---|
| `ECONNREFUSED 8000` | gateway not running |
| `ECONNREFUSED 5000/5002/5003` | target microservice not running |
| `password authentication failed for user "postgres"` | wrong `DB_PASSWORD` in `.env` |
| `relation "courses" does not exist` | schema not applied to the right DB |
| `401 Invalid token` | session expired (1-day TTL) — log in again |
| `503` from `/api/progress/*` | MongoDB not running |

## Adding a new microservice

Copy `backend/courses-service/` as a template:

1. New folder `backend/<name>-service/` with `package.json`, `src/server.js`, `src/config/db.js`, `src/middleware/auth.middleware.js`, `src/routes/`, `src/controllers/`, `schema.sql`, `.env.example`.
2. Pick an unused port and database name.
3. Reuse the same `auth.middleware.js` — never query auth's database directly.
4. Add a proxy block in `gateway/server.js`.
5. Document it in this README.

## What still needs wiring

- **Frontend** — [client/src/api/client.js](../client/src/api/client.js) is currently a localStorage mock for courses/enrollments. The auth flow already calls the gateway via [client/src/api/userApi.js](../client/src/api/userApi.js). Once the new services are up, swap the mock for real `fetch` calls to `http://localhost:8000/api/courses` and `/api/enrollments`. The response shapes match the existing hooks.
- **Seed data** — `courses_service` is empty after the schema runs. Either build a small `seed.sql` or write a script that POSTs the 50 mock courses from [client/src/data/mockData.js](../client/src/data/mockData.js) to `/api/courses` once an instructor is logged in.

after running seed.js
PS C:\Users\GloriaRod\OneDrive\Desktop\Full Stack\EDDDUSPHERE\backend\courses-service> npm install

added 85 packages, and audited 86 packages in 7m

24 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS C:\Users\GloriaRod\OneDrive\Desktop\Full Stack\EDDDUSPHERE\backend\courses-service> npm run seed

> courses-service@1.0.0 seed
> node seed.js

◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }
Seeding EDDDUSPHERE demo data...

» Seeding users in auth_service...
  ✓ aisha@edusphere.app (user_id=7) [instructor]
  ✓ noah@edusphere.app (user_id=8) [instructor]
  ✓ mina@edusphere.app (user_id=9) [instructor]
  ✓ sarah@edusphere.app (user_id=10) [instructor]
  ✓ lucas@edusphere.app (user_id=11) [instructor]
  ✓ harper@edusphere.app (user_id=12) [instructor]
  ✓ marcus@edusphere.app (user_id=13) [instructor]
  ✓ gloria@edusphere.app (user_id=14) [student]
» Wiping courses_service demo tables...
  ✓ cleared reviews, enrollments, lessons, modules, courses
» Inserting 50 courses into courses_service...
  ✓ Product Design Masterclass
  ✓ React Performance Lab
  ✓ AI Product Manager Sprint
  ✓ Full Stack Web Development
  ✓ Data Structures & Algorithms
  ✓ Machine Learning Basics
  ✓ DevOps Fundamentals
  ✓ Cybersecurity Essentials
  ✓ Cloud Computing on AWS
  ✓ Mobile App Development
  ✓ System Design
  ✓ Operating Systems Deep Dive
  ✓ Blockchain Basics
  ✓ AI for Beginners
  ✓ Python for Automation
  ✓ Java Masterclass
  ✓ Kubernetes in Practice
  ✓ Digital Marketing
  ✓ Startup Fundamentals
  ✓ Finance for Non-Finance
  ✓ Entrepreneurship
  ✓ Business Analytics
  ✓ Sales Strategies
  ✓ Negotiation Skills
  ✓ Leadership Mastery
  ✓ Branding
  ✓ Figma Masterclass
  ✓ Graphic Design
  ✓ Motion Design
  ✓ Design Systems
  ✓ UX Research
  ✓ Typography
  ✓ Color Theory
  ✓ Productivity Systems
  ✓ Time Management
  ✓ Public Speaking
  ✓ Critical Thinking
  ✓ Emotional Intelligence
  ✓ Habit Building
  ✓ Career Growth
  ✓ Photography
  ✓ Video Editing
  ✓ Music Production
  ✓ Writing Skills
  ✓ Language Learning
  ✓ Excel Advanced
  ✓ Data Visualization
  ✓ Statistics
  ✓ Interview Prep
  ✓ Resume Building
» Inserted 50 courses with 294 lessons total.
» Auto-enrolling test student in sample courses...
  ✓ enrolled in "Product Design Masterclass"
  ✓ enrolled in "React Performance Lab"
  ✓ enrolled in "Full Stack Web Development"

Done. Login credentials:
  student:    gloria@edusphere.app / pass123
  instructor: aisha@edusphere.app / instructor123  (and noah, mina, sarah, lucas, harper, marcus)