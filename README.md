# Equipment Reservation

A small web application that lets a team book shared equipment (cameras, projectors, laptops, ...) and prevents overlapping reservations of the same item.

This project is developed in collaboration with the **Odin** project by [Mercor](https://mercor.com).

## Tech stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | [Next.js](https://nextjs.org) 16 (App Router) |
| UI         | React 19                                      |
| ORM        | [Prisma](https://www.prisma.io) 7 (`@prisma/adapter-pg`) |
| Database   | PostgreSQL 16                                 |
| Validation | [Zod](https://zod.dev)                        |
| Tests      | [Vitest](https://vitest.dev)                  |

## Getting started

### Prerequisites

- Node.js 22+
- PostgreSQL 16, either local or through Docker (`docker compose`)

### Setup

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Start PostgreSQL (skip if you already run it locally)
docker compose up -d

# 4. Apply migrations and load sample equipment
npm run db:deploy
npm run db:seed

# 5. Start the development server
npm run dev
```

The app is available at <http://localhost:3000>.

### Running the tests

Integration tests run against a dedicated database defined by `TEST_DATABASE_URL`. Migrations are applied to it automatically and tables are truncated between tests.

```bash
# Create the test database once (Docker setup)
docker compose exec db createdb -U postgres equipment_reservation_test

npm test
```

## Available scripts

| Script              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Start the development server                             |
| `npm run build`     | Build for production                                     |
| `npm run start`     | Start the production server                              |
| `npm run lint`      | Run ESLint                                               |
| `npm run typecheck` | Generate route types and run the TypeScript compiler     |
| `npm test`          | Run unit and integration tests                           |
| `npm run db:migrate`| Create and apply a new migration (development)           |
| `npm run db:deploy` | Apply pending migrations                                 |
| `npm run db:seed`   | Load sample equipment                                    |
| `npm run archive`   | Package a milestone as a project archive (see below)     |

## API

All payloads are JSON. Dates use ISO 8601. A reservation covers the half-open interval `[startsAt, endsAt)`, so back-to-back bookings (one ends at 10:00, the next starts at 10:00) are allowed.

### Overlap prevention

Two reservations of the same equipment can never overlap. This is enforced in two layers:

1. **Service check**: before inserting, `createReservation` looks for an existing reservation of the same equipment that starts before the new one ends and ends after it starts, and returns `409` with the conflicting booking.
2. **Database constraint**: a PostgreSQL exclusion constraint (`Reservation_no_overlap`, using `btree_gist`) guarantees the rule even when two requests arrive at the same time.

| Method | Endpoint                               | Description                         |
| ------ | -------------------------------------- | ----------------------------------- |
| GET    | `/api/equipment`                       | List equipment                      |
| POST   | `/api/equipment`                       | Create equipment                    |
| GET    | `/api/reservations[?equipmentId=<id>]` | List reservations, optionally for one item |
| POST   | `/api/reservations`                    | Create a reservation                |

Example:

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "content-type: application/json" \
  -d '{"equipmentId":"<id>","reservedBy":"Alice","startsAt":"2026-11-02T09:00:00Z","endsAt":"2026-11-02T11:00:00Z"}'
```

| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| 201    | Created                                     |
| 400    | Validation failed (`details` lists fields)  |
| 404    | Referenced equipment does not exist         |
| 409    | Conflict: the equipment is already reserved during that time (`details.conflictingReservation`), or the equipment name is taken |

## Project structure

```
prisma/
  schema.prisma         Data model (Equipment, Reservation)
  migrations/           SQL migrations
  seed.ts               Sample data
src/
  app/                  Next.js pages and API route handlers
  lib/
    prisma.ts           Prisma client
    validation/         Zod request schemas
    services/           Business logic used by the route handlers
tests/
  unit/                 Pure validation tests
  integration/          API tests against PostgreSQL
scripts/
  archive-milestone.sh  Milestone packaging
```

## Milestones and deliverables

Each milestone is delivered as **one project archive** containing the change and its tests. Archives are built from git, so they contain only tracked files (no `node_modules`, `.env` or build output):

```bash
npm run archive -- milestone-1            # from the current commit
npm run archive -- milestone-1 v0.1.0     # from a tag or commit
```

The archive is written to `archives/equipment-reservation-<name>.zip`.

| Milestone | Scope                                                                                  | Status      |
| --------- | -------------------------------------------------------------------------------------- | ----------- |
| 1         | Project foundation: Next.js, Prisma schema, PostgreSQL, equipment and reservation API, tests, CI | Done        |
| 2         | Overlap prevention: reject conflicting reservations in the service and at the database level (exclusion constraint) | Planned     |
| 3         | Booking UI: create reservations and see conflicts from the interface                   | Planned     |
