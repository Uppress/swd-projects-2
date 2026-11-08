# Fieldnotes Project Tracker

A compact project and task tracker backed by Neon Postgres.

## Features

- Project overview with task totals and completion progress.
- Project detail pages with a Kanban board for To do, Doing, and Done.
- Optimistic task moves and confirmed task deletion.
- Task filters by priority and title search, applied in SQL.
- Workspace statistics for totals, status, priority, project completion, and overdue tasks.
- Zod-validated project and task forms with server-side mutations.

## Stack

- Next.js 15 App Router and React Server Components
- TypeScript and Tailwind CSS
- Neon Postgres via `@neondatabase/serverless`
- Zod for server-side form validation

## Architecture

Read paths are Server Components that call typed functions in `src/lib/queries.ts`. Those functions use the server-only Neon client in `src/lib/db.ts`; values are supplied through Neon tagged SQL templates as parameters.

Writes go through Server Actions in `src/app/actions.ts`. Each action validates its `FormData` with Zod, executes a parameterized statement, and revalidates the affected routes. Task status changes and deletions include both task ID and project ID in their SQL predicates.

## Setup

1. Install Node.js 18.18 or newer.
2. Create a Neon project and database. In the Neon SQL Editor, run `schema.sql` to create the tables and optional sample records.
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to the connection string from Neon. Keep the connection string private.
4. Install packages and start the development server:

   ```sh
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000`. The workspace dashboard is at `/stats`.

Run checks with `npm run lint`, `npm run typecheck`, and `npm run build`.

## Schema

`projects` stores a name, description, color, and creation timestamp. `tasks` belongs to a project through `project_id`, which cascades on project deletion. Tasks have a constrained status (`todo`, `doing`, or `done`), priority (`low`, `medium`, or `high`), optional due date, and creation timestamp. The `tasks_project_idx` index supports project-scoped task reads.