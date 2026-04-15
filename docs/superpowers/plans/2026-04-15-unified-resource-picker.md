# Unified Resource Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Add Link" and disabled "Twilio Docs" tabs in AssetPicker with a unified "Add Resource" tab that lets sellers search live Twilio documentation or paste any URL.

**Architecture:** A new public Next.js API route proxies search queries to the Twilio docs Algolia index server-side (keeping the Algolia key out of the browser). The AssetPicker gets a new "Add Resource" tab with a source selector tile UI; selecting "Twilio Docs" shows a debounced search + results list; selecting "Any URL" shows a manual form. Both paths save a `link` asset with `sourceType` set appropriately — the assets API route already handles `sourceType`/`sourceRef` persistence.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Prisma 7 + SQLite

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `.env.local` | Modify | Add Algolia credentials |
| `app/api/docs/search/route.ts` | Create | Server-side Algolia proxy |
| `lib/adapters/twilio-docs.ts` | Create | Adapter metadata registration |
| `app/(seller)/rooms/[id]/components/AssetPicker.tsx` | Modify | Unified "Add Resource" tab UI |

> `app/api/rooms/[id]/sections/[sectionId]/assets/route.ts` — already updated to persist `sourceType` and `sourceRef` from FormData. No further changes needed. *(Note: the spec lists this file as needing changes — those changes have already been applied prior to this plan.)*

---

## Task 1: Find Algolia credentials and add to .env.local

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Find the Algolia credentials from docs.twilio.com**

  Open `https://www.twilio.com/docs` in a browser. Open DevTools → Network tab → filter by "algolia" or "search". Trigger a search. Find the request to `*.algolia.net` and note:
  - `x-algolia-application-id` header → `TWILIO_DOCS_ALGOLIA_APP_ID`
  - `x-algolia-api-key` header → `TWILIO_DOCS_ALGOLIA_SEARCH_KEY`

  Alternatively, view page source and search for `algolia` — the app ID and search-only key are embedded in the page JS.

- [ ] **Step 2: Add credentials to .env.local**

  ```
  TWILIO_DOCS_ALGOLIA_APP_ID=<app-id-from-step-1>
  TWILIO_DOCS_ALGOLIA_SEARCH_KEY=<search-key-from-step-1>
  ```

- [ ] **Step 3: Verify env vars load**

  ```bash
  cd digital-asset-rooms
  node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.TWILIO_DOCS_ALGOLIA_APP_ID)"
  ```
  Expected: prints the app ID (not `undefined`).

---

## Task 2: Create the Algolia search proxy route

**Files:**
- Create: `app/api/docs/search/route.ts`

- [ ] **Step 1: Create the route file**

  ```ts
  // app/api/docs/search/route.ts
  import { NextResponse } from "next/server";

  const ALGOLIA_APP_ID = process.env.TWILIO_DOCS_ALGOLIA_APP_ID!;
  const ALGOLIA_SEARCH_KEY = process.env.TWILIO_DOCS_ALGOLIA_SEARCH_KEY!;
  const ALGOLIA_INDEX = "twilio_docs"; // verify index name in step 3

  export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (!q) return NextResponse.json([]);

    const url = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Algolia-Application-Id": ALGOLIA_APP_ID,
        "X-Algolia-API-Key": ALGOLIA_SEARCH_KEY,
      },
      body: JSON.stringify({
        query: q,
        hitsPerPage: 10,
        attributesToRetrieve: ["title", "url", "description", "category"],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Search unavailable" }, { status: 500 });
    }

    const data = await res.json();
    const hits = (data.hits ?? []).map((h: Record<string, string>) => ({
      title: h.title ?? "",
      url: h.url ?? "",
      description: h.description ?? "",
      category: h.category ?? "",
    }));

    return NextResponse.json(hits);
  }
  ```

- [ ] **Step 2: Verify the index name**

  The Algolia index name may differ from `"twilio_docs"`. Check it from the network request observed in Task 1 — the URL path will be `/1/indexes/<index-name>/query`. Update the `ALGOLIA_INDEX` constant if needed.

- [ ] **Step 3: Smoke-test the route**

  Make sure the dev server is running first: `npm run dev` (in a separate terminal if needed).
  ```bash
  curl "http://localhost:3000/api/docs/search?q=sms" | head -c 500
  ```
  Expected: JSON array of results with `title`, `url`, `description`, `category` fields.

  If you get `[]` on a non-empty query, the index name is probably wrong — check Step 2.
  If you get `{ error: "Search unavailable" }`, check your `.env.local` credentials.

- [ ] **Step 4: Commit**

  ```bash
  git add app/api/docs/search/route.ts
  git commit -m "feat: add Twilio docs Algolia search proxy"
  ```

---

## Task 3: Create the Twilio Docs adapter

**Files:**
- Create: `lib/adapters/twilio-docs.ts`

- [ ] **Step 1: Create the adapter file**

  ```ts
  // lib/adapters/twilio-docs.ts
  import { AssetAdapter } from "./types";

  export const twilioDocsAdapter: AssetAdapter = {
    sourceType: "twilio-docs",
    displayName: "Twilio Docs",
    enabled: true,
  };
  ```

  > **Note:** This file is informational metadata only — it is not imported or consumed at runtime yet. It establishes the `sourceType` identifier and will be wired into an adapter registry in a future task.

- [ ] **Step 2: Verify TypeScript is happy**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add lib/adapters/twilio-docs.ts
  git commit -m "feat: register twilio-docs asset adapter"
  ```

---

## Task 4: Update AssetPicker with unified "Add Resource" tab

**Files:**
- Modify: `app/(seller)/rooms/[id]/components/AssetPicker.tsx`

This is the largest task. Replace the current "Add Link" + "Twilio Docs (disabled)" tabs with a single "Add Resource" tab containing a source-selector-first UI.

### 4a — Update tab type and tab bar

- [ ] **Step 1: Update the Tab type and tabs array**

  Replace:
  ```ts
  type Tab = "file" | "link" | "note" | "twilio" | "demo";
  ```
  With:
  ```ts
  type Tab = "file" | "resource" | "note" | "demo";
  type ResourceSource = "url" | "twilio-docs";
  ```

  Replace the `tabs` array:
  ```ts
  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: "file", label: "Upload File" },
    { id: "resource", label: "Add Resource" },
    { id: "note", label: "Write Note" },
    { id: "demo", label: "Live Demo", disabled: true },
  ];
  ```

- [ ] **Step 2: Remove dead state from the old "Add Link" tab**

  Delete these three state declarations (they are replaced by the resource tab state below):
  ```ts
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  ```

- [ ] **Step 3: Add new state for the resource tab**

  After existing state declarations, add:
  ```ts
  // Resource tab state
  const [resourceSource, setResourceSource] = useState<ResourceSource>("url");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");

  // Twilio docs search state
  const [docsQuery, setDocsQuery] = useState("");
  const [docsResults, setDocsResults] = useState<{ title: string; url: string; description: string; category: string }[]>([]);
  const [docsSelected, setDocsSelected] = useState<{ title: string; url: string; description: string; objectID?: string } | null>(null);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const docsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  ```

- [ ] **Step 4: Add the search handler**

  After the `handleDrop` callback, add:
  ```ts
  const handleDocsSearch = useCallback((q: string) => {
    setDocsQuery(q);
    setDocsError(null);
    if (docsDebounceRef.current) clearTimeout(docsDebounceRef.current);
    if (!q.trim()) {
      setDocsResults([]);
      return;
    }
    docsDebounceRef.current = setTimeout(async () => {
      setDocsLoading(true);
      try {
        const res = await fetch(`/api/docs/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error("Search unavailable");
        setDocsResults(await res.json());
      } catch {
        setDocsError("Search unavailable — try again");
        setDocsResults([]);
      } finally {
        setDocsLoading(false);
      }
    }, 300);
  }, []);
  ```

### 4b — Update handleSubmit for the resource tab

- [ ] **Step 5: Add the resource tab branch to handleSubmit**

  Inside `handleSubmit`, after the `tab === "note"` branch, add:
  ```ts
  } else if (tab === "resource") {
    if (resourceSource === "url") {
      if (!resourceUrl.trim()) throw new Error("Please enter a URL.");
      if (!resourceTitle.trim()) throw new Error("Please enter a title.");
      fd.append("type", "link");
      fd.append("sourceType", "manual");
      fd.append("title", resourceTitle.trim());
      fd.append("description", resourceDescription.trim());
      fd.append("url", resourceUrl.trim());
    } else {
      if (!docsSelected) throw new Error("Please select a document.");
      fd.append("type", "link");
      fd.append("sourceType", "twilio-docs");
      fd.append("title", docsSelected.title);
      fd.append("description", docsSelected.description ?? "");
      fd.append("url", docsSelected.url);
      if (docsSelected.objectID) fd.append("sourceRef", docsSelected.objectID);
    }
  }
  ```

### 4c — Render the resource tab UI

- [ ] **Step 6: Add the resource tab JSX**

  After the `{tab === "note" && ...}` block and before the `{(tab === "twilio" || tab === "demo") && ...}` block, add:

  ```tsx
  {tab === "resource" && (
    <div className="space-y-4">
      {/* Source selector */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Source</p>
        <div className="grid grid-cols-2 gap-2">
          {(["url", "twilio-docs"] as ResourceSource[]).map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => { setResourceSource(src); setDocsSelected(null); }}
              className={`rounded-lg border px-4 py-3 text-left transition
                ${resourceSource === src
                  ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                  : "border-zinc-200 bg-zinc-100 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50"
                }`}
            >
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {src === "url" ? "🔗 Any URL" : "📄 Twilio Docs"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {src === "url" ? "Paste a link" : "Browse library"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Any URL form */}
      {resourceSource === "url" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              required
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              placeholder="e.g. Pricing Page"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={resourceDescription}
              onChange={(e) => setResourceDescription(e.target.value)}
              placeholder="What will the customer find here?"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
            />
          </div>
        </div>
      )}

      {/* Twilio Docs search */}
      {resourceSource === "twilio-docs" && (
        <div className="space-y-2">
          <input
            type="text"
            value={docsQuery}
            onChange={(e) => handleDocsSearch(e.target.value)}
            placeholder="Search Twilio docs…"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />

          {/* States: empty, loading, error, results */}
          {!docsQuery.trim() && (
            <p className="text-xs text-gray-500 px-1">Start typing to search…</p>
          )}
          {docsLoading && (
            <p className="text-xs text-gray-500 px-1">Searching…</p>
          )}
          {docsError && (
            <p className="text-xs text-red-400 px-1">{docsError}</p>
          )}
          {!docsLoading && !docsError && docsResults.length > 0 && (
            <div className="flex flex-col gap-1 max-h-52 overflow-y-auto rounded-lg border border-gray-700">
              {docsResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDocsSelected(r)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition
                    ${docsSelected?.url === r.url
                      ? "bg-zinc-700 border-l-2 border-zinc-300"
                      : "hover:bg-gray-800"
                    }`}
                >
                  <p className="font-medium text-white truncate">{r.title}</p>
                  <p className="text-xs text-gray-500 truncate">{r.url}</p>
                </button>
              ))}
            </div>
          )}
          {!docsLoading && !docsError && docsQuery.trim() && docsResults.length === 0 && (
            <p className="text-xs text-gray-500 px-1">No results found.</p>
          )}

          {/* Selected confirmation */}
          {docsSelected && (
            <div className="rounded-lg border border-zinc-600 bg-zinc-800/60 px-3 py-2">
              <p className="text-xs text-zinc-400 mb-0.5">Selected</p>
              <p className="text-sm font-medium text-white">{docsSelected.title}</p>
              <p className="text-xs text-zinc-500 truncate">{docsSelected.url}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )}
  ```

- [ ] **Step 7: Remove the old "Add Link" JSX block**

  Find and delete the entire `{tab === "link" && (...)}` block (roughly lines 269–311 in the original file). After the refactor `"link"` is no longer a valid Tab value — this block is dead code.

- [ ] **Step 8: Remove the old "twilio" disabled tab fallback**

  Find and remove:
  ```tsx
  {(tab === "twilio" || tab === "demo") && (
  ```
  Replace with:
  ```tsx
  {tab === "demo" && (
  ```

- [ ] **Step 9: Update the Save button visibility in the footer**

  Find:
  ```tsx
  {tab !== "twilio" && tab !== "demo" && (
  ```
  Replace with:
  ```tsx
  {tab !== "demo" && !(tab === "resource" && resourceSource === "twilio-docs" && !docsSelected) && (
  ```

### 4d — Verify and commit

- [ ] **Step 10: TypeScript check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 11: Manual smoke test**

  - Open http://localhost:3000, navigate to any room → click "Add Asset" in a section
  - Verify tab bar shows: Upload File | Add Resource | Write Note | Live Demo (Soon)
  - Click "Add Resource" → verify two source tiles appear
  - Select "Any URL" → fill in URL + title → Save Asset → verify asset appears in section
  - Click "Add Asset" again → "Add Resource" → "Twilio Docs" → type "sms" → verify results load
  - Click a result → verify "Selected" confirmation appears and Save button appears
  - Save → verify asset appears in section with correct title

- [ ] **Step 12: Commit**

  ```bash
  git add app/(seller)/rooms/[id]/components/AssetPicker.tsx
  git commit -m "feat: unified resource picker with Twilio docs search"
  ```

---

## Task 5: Final cleanup and push

- [ ] **Step 1: Full build check**

  ```bash
  npm run build 2>&1 | tail -20
  ```
  Expected: `✓ Compiled successfully` with no errors.

- [ ] **Step 2: Push**

  ```bash
  git push origin main
  ```
