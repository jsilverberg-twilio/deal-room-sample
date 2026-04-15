# Deal Room

A web app for Twilio sellers to build, share, and reuse customer-facing digital asset rooms.

Sellers assemble curated rooms from a menu-driven interface, share via unique links with co-branding, track customer engagement, and contribute winning rooms to a community library.

## Features

- **Room Builder** — Create rooms with sections, upload files, add links, write notes
- **Twilio Docs Search** — Search and add pages directly from the Twilio documentation library
- **Co-Branded Customer Portal** — Shareable link with seller + customer logos, accent colors
- **Engagement Analytics** — Track views, downloads, clicks per visitor
- **Community Library** — Share winning rooms, browse by tags, clone as templates

## Quick Start

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — no login required.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite (local) / PostgreSQL (production via Vercel Postgres)
- **Auth:** None — access is controlled externally via Twilio SSO
- **Storage:** Local filesystem (swappable to Vercel Blob / S3)
- **Styling:** Tailwind CSS v4

## Project Structure

```
app/
  (seller)/              Seller-facing pages (dashboard, room builder, community)
  (customer)/
    [slug]/              Public customer portal
  api/
    docs/search/         Twilio docs search (local catalog, no API key needed)
    rooms/               Room CRUD
    community/           Community library
lib/
  adapters/              Asset source adapters (manual, twilio-docs)
  twilio-docs-catalog.json  4,273-entry Twilio docs index (scraped from sitemap)
  current-user.ts        Demo user shim (returns first seeded seller)
prisma/
  schema.prisma          Database schema
  seed.ts                Sample data
docs/
  superpowers/
    specs/               Design specs
    plans/               Implementation plans
```

## Environment Variables

```bash
# Local dev (.env.local)
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=any-random-string

# Production (Vercel)
DATABASE_PROVIDER=postgresql
DATABASE_URL=<vercel-postgres-url>        # auto-set by Vercel when you connect a DB
NEXTAUTH_SECRET=<random-string>
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel link
vercel storage create        # create a Postgres database
vercel env pull .env.local   # pull DB credentials locally

DATABASE_PROVIDER=postgresql npx prisma migrate deploy
DATABASE_PROVIDER=postgresql npx prisma db seed

vercel --prod
```

After initial setup, every `git push` to `main` auto-deploys.
