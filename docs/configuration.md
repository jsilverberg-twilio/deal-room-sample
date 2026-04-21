# Configuration

## Environment Variables

| Variable | Purpose | Required | Default |
|---|---|---|---|
| `DATABASE_PROVIDER` | `sqlite` or `postgresql` | Yes | — |
| `DATABASE_URL` | DB connection string | Yes | — |
| `NEXTAUTH_SECRET` | Session signing key | Yes (any string in dev) | — |
| `NEXTAUTH_URL` | Canonical app URL | Yes | — |
| `NEXT_PUBLIC_BASE_URL` | Used to build shareable room links | No | `http://localhost:3000` |

Read in code:
- `DATABASE_PROVIDER` + `DATABASE_URL` → [`prisma.config.ts`](../prisma.config.ts)
- `NEXT_PUBLIC_BASE_URL` → [`app/(seller)/rooms/[id]/page.tsx`](../app/(seller)/rooms/[id]/page.tsx)
- `NEXTAUTH_*` → [`lib/auth.ts`](../lib/auth.ts)

## Local Development (.env.local)

```bash
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

The `.env.local` file is gitignored. Never commit real secrets.

## Production (Vercel)

```bash
DATABASE_PROVIDER=postgresql
DATABASE_URL=<vercel-postgres-connection-string>
NEXTAUTH_SECRET=<random-256-bit-string>
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

## Database

**Local**: SQLite via `better-sqlite3`. Database file is `prisma/dev.db` (gitignored).

**Production**: PostgreSQL. Vercel Postgres is the simplest option — it auto-sets `DATABASE_URL` when you connect a database in the Vercel dashboard.

Schema is in [`prisma/schema.prisma`](../prisma/schema.prisma). Run migrations with:

```bash
# Local
npx prisma migrate dev

# Production (run once after first deploy)
DATABASE_PROVIDER=postgresql npx prisma migrate deploy
DATABASE_PROVIDER=postgresql npx prisma db seed
```

## File Storage

Uploaded files (room assets, logos) go to `public/uploads/` locally. This directory is gitignored (except `.gitkeep`).

For production, swap `LocalStorage` in the asset and branding API routes for an S3 or Vercel Blob adapter. See [`lib/storage/index.ts`](../lib/storage/index.ts) for the `StorageAdapter` interface.

## Twilio Docs Search

The docs search feature (`app/api/docs/search/`) uses a local catalog file at [`lib/twilio-docs-catalog.json`](../lib/twilio-docs-catalog.json). No API key or external service required. The catalog is a pre-built index of 4,273 Twilio documentation pages scraped from the Twilio sitemap.

To refresh the catalog, re-scrape the Twilio sitemap and replace the JSON file.

## Auth

Auth is intentionally bypassed for demo use. `lib/current-user.ts` returns the first seller in the database — no session check, no redirect.

In production/GTM Accelerator integration, replace `getCurrentUser()` with a real SSO session lookup. The rest of the app is auth-agnostic.
