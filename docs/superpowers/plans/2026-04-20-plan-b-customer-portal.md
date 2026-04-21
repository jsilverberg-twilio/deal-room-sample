# UI Redesign Plan B — Customer Portal + Asset Reorder API

**Goal:** Rewrite the customer-facing portal with horizontal tab nav, rich asset cards, and seller contact strip. Add PATCH asset reorder endpoint.

**Architecture:** Two tasks. (1) Add PATCH handler to existing asset route. (2) Rewrite customer portal — server component `page.tsx` fetches data and passes to new `"use client"` component `portal-content.tsx` that owns tab state.

**Tech Stack:** Next.js 16.2.3, React 19, Tailwind v4, Prisma. `tracker.tsx` unchanged.

---

## File Map

| File | Change |
|---|---|
| `app/api/rooms/[id]/sections/[sectionId]/assets/[assetId]/route.ts` | Add PATCH handler for asset reorder |
| `app/(customer)/[slug]/page.tsx` | Thin server component — fetch data, render `<PortalContent>` |
| `app/(customer)/[slug]/portal-content.tsx` | **New** `"use client"` — tab state, full portal UI |

---

## Task 1: PATCH asset reorder endpoint

- [ ] Add PATCH to `app/api/rooms/[id]/sections/[sectionId]/assets/[assetId]/route.ts`
- [ ] Verify: `npm run build`
- [ ] Commit: `feat: add PATCH handler for asset reorder`

## Task 2: Customer portal rewrite

- [ ] Create `portal-content.tsx` with tab state and full redesigned UI
- [ ] Rewrite `page.tsx` as thin server component
- [ ] Verify: `npm run build && npm run lint`
- [ ] Commit: `feat: rewrite customer portal — horizontal tabs, rich asset cards, seller strip`
