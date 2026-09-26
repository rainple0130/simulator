# Simulator

Next.js app backed by SQLite via [`@libsql/client`](https://github.com/tursodatabase/libsql-client-ts):
a local SQLite file in development, a [Turso](https://turso.tech) database on Vercel.

Sample accounts (created automatically on first run when the database is empty):

| Role    | Username                 | Password     |
| ------- | ------------------------ | ------------ |
| Teacher | `teacher`                | `teacher123` |
| Student | `student1` … `student3`  | `student123` |

## Environment variables

| Variable             | Local dev                              | Vercel                         |
| -------------------- | -------------------------------------- | ------------------------------ |
| `TURSO_DATABASE_URL` | Optional — unset uses `data/simulator.db` | Required (set by integration) |
| `TURSO_AUTH_TOKEN`   | Only with a remote `TURSO_DATABASE_URL` | Required (set by integration) |

If `TURSO_DATABASE_URL` is unset the app writes to `data/simulator.db`, which only works locally —
Vercel's filesystem is read-only, so a deploy without these variables cannot log in.

## Local development

```sh
npm install
npm run dev          # http://localhost:3000 — creates and seeds data/simulator.db on first request
```

Optional:

```sh
npm run seed         # create + seed the database without starting the app
npm run seed:force   # wipe everything and reseed
```

To develop against your Turso database instead of the local file, copy `.env.example` to
`.env.local` and fill in both variables (the Vercel CLI can pull them: `vercel env pull .env.local`).
`npm run seed` does not read `.env.local`, so pass them inline for that:

```sh
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npm run seed
```

## Deploying to Vercel

1. In the Vercel project: **Storage → Create / Connect Database → Turso**, create a database
   and connect it to this project for the Production (and Preview, if wanted) environments.
2. Check **Settings → Environment Variables** shows `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
   If the integration named them differently, add these two names with the same values.
3. Redeploy (environment variable changes only apply to new deployments).
4. Seed: the tables and sample accounts are created on the first request to the empty database.
   To do it up front instead, run `npm run seed` locally with the Turso variables (see above).

No build-time configuration is needed beyond those two variables.
