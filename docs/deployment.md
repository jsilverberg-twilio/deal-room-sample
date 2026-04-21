# Deployment

## Vercel (Recommended)

Vercel is the simplest deployment path — zero config for Next.js, managed Postgres, and auto-deploys on push.

### First deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Authenticate and link project
vercel login
vercel link

# Create a Postgres database (run once)
vercel storage create

# Pull DB credentials to local .env.local
vercel env pull .env.local

# Run migrations and seed against the production DB
DATABASE_PROVIDER=postgresql npx prisma migrate deploy
DATABASE_PROVIDER=postgresql npx prisma db seed

# Deploy to production
vercel --prod
```

### Subsequent deploys

Every push to `main` auto-deploys once the project is linked. No manual action needed.

### Environment variables to set in Vercel dashboard

| Variable | Value |
|---|---|
| `DATABASE_PROVIDER` | `postgresql` |
| `DATABASE_URL` | Auto-set by Vercel Postgres |
| `NEXTAUTH_SECRET` | Any random string |
| `NEXTAUTH_URL` | Your production URL |
| `NEXT_PUBLIC_BASE_URL` | Your production URL |

## Local Production Build

To verify the production build before pushing:

```bash
npm run build
npm run start
```

## File Storage in Production

Uploaded files currently land in `public/uploads/` which is local to the server process. On Vercel (serverless), this directory is ephemeral — uploads will not persist between deployments.

**For persistent file storage**, replace `LocalStorage` in these two files with an S3 or Vercel Blob adapter:

- `app/api/rooms/[id]/sections/[sectionId]/assets/route.ts`
- `app/api/rooms/[id]/branding/route.ts`

The `StorageAdapter` interface is in `lib/storage/index.ts`.

## GTM Accelerator Integration

This app is a standalone reference implementation intended to eventually roll into the GTM Accelerator platform. Integration points:

1. **Auth**: Replace `lib/current-user.ts` with GTM Accelerator SSO session lookup
2. **Storage**: Implement `StorageAdapter` backed by GTM Accelerator's blob store
3. **Database**: Migrate schema into GTM Accelerator's shared Postgres instance
4. **Community library**: Maps to GTM Accelerator's template catalog — the `CommunityRoom` model and `/api/community` routes are the integration seam
5. **Branding**: The `branding` JSON field on `Room` (`sellerLogoUrl`, `customerLogoUrl`, `primaryColor`, `companyName`) can be pre-populated from GTM Accelerator's account/customer data
