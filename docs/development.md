# Development Guide

## Prerequisites

- Node.js 20+
- npm 10+
- SQLite (bundled via `better-sqlite3` — no install needed)

## Setup

```bash
# Install dependencies
npm install

# Create the database schema
npx prisma migrate dev

# Seed with demo data (Acme Corp rooms, view events)
npx prisma db seed

# Start the dev server
npm run dev
```

Open http://localhost:3000/dashboard — no login required.

## Available Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with Turbopack hot reload |
| `npm run build` | Production build — use this to verify before pushing |
| `npm run lint` | ESLint — must be clean before committing |
| `npm run start` | Run production build locally |
| `npx prisma studio` | Browse the database in a UI |
| `npx prisma db seed` | Re-seed demo data (destructive — clears existing rows) |
| `npx prisma migrate dev` | Apply schema changes and generate client |

## Project Structure

See [architecture.md](architecture.md) for the full directory map and data flow.

## Making Changes

### Adding a new seller page

1. Create `app/(seller)/your-page/page.tsx`
2. It will automatically be wrapped by the shared nav in `app/(seller)/layout.tsx`
3. Add a link in the nav if needed (`app/(seller)/layout.tsx`)

### Adding a new API route

Routes live in `app/api/`. All routes use `getCurrentUser()` from `lib/current-user.ts` for ownership checks. Pattern:

```ts
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  // user.id is the seller ID for ownership queries
}
```

### Changing the database schema

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe-your-change`
3. Update `prisma/seed.ts` if the seed data references changed models
4. Re-seed: `npx prisma db seed`

### Adding a new asset type

Asset types are: `file`, `link`, `richtext`. To add a new type:

1. Add handling in `app/api/rooms/[id]/sections/[sectionId]/assets/route.ts` (POST handler)
2. Add thumbnail/label/meta logic in `lib/assets.ts`
3. Add a tab in `app/(seller)/rooms/[id]/components/AssetPicker.tsx`
4. The customer portal (`app/(customer)/[slug]/portal-content.tsx`) picks up new types via `lib/assets.ts` automatically

### Swapping local file storage to S3/Vercel Blob

1. Implement the `StorageAdapter` interface from `lib/storage/index.ts`
2. Replace `new LocalStorage()` in the branding and asset API routes
3. Remove the `public/uploads/` directory reference

## Code Conventions

- **Server vs client**: Server components own all DB calls. Client components receive serialized plain objects as props. Never import `prisma` or `lib/db` from a `"use client"` file.
- **Tailwind**: Slate-50 background, white cards (`rounded-2xl border border-slate-200 shadow-sm`), red-500 accent. See [architecture.md](architecture.md) for the design system.
- **Asset utilities**: Use `getThumbGrad`, `getThumbLabel`, `getMetaText` from `lib/assets.ts` — do not duplicate inline.
- **Types**: Prisma types stay server-side. Client-facing types are plain interfaces defined in the component file or passed as props.

## Verify Before Pushing

```bash
npm run build && npm run lint
```

Both must pass clean (zero errors, only the pre-existing `_request` warning in `middleware.ts` is acceptable).
