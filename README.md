# Vesta IT Equipment Ordering

Internal application for tracking IT equipment requests from creation through
deployment. HR and managers submit requests, IT manages fulfillment status,
and everyone can see live progress on a request-by-request basis.

Built with Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui,
Prisma + SQLite, TanStack Table/Query, React Hook Form + Zod.

---

## 1. Project structure

```
app/
  page.tsx                      Dashboard
  requests/                     Requests list, new/edit forms, detail view
  settings/                     Equipment catalog + role package management (IT only)
  inventory/, reports/          "Coming soon" placeholders (see Future Ready section)
  api/                          Route Handlers (REST-ish JSON API)
    requests/                   list+create, get/patch/delete, status transitions, facets
    catalog/, role-packages/    equipment catalog & new-hire role package CRUD
    session/, users/            simulated identity switcher, user list
    stats/                      dashboard summary + recent activity

components/
  layout/                       App shell, sidebar, mobile nav, page header, theme toggle
  requests/                     Table, filters, form, equipment editor, status control, timeline
  dashboard/, settings/         Page-specific composed views
  ui/                           shadcn/ui primitives (vendored, not a runtime dependency)

lib/
  auth/current-user.ts          Simulated identity + RBAC (getCurrentUser, requireRole)
  services/                     Prisma queries + serialization, one file per resource
  validations/                  Zod schemas shared by client forms and API routes
  types.ts                      Wire-format DTOs returned by the API
  format.ts, constants.ts       Status/progress mapping, offices, default catalog & role packages
  config.ts                     Central runtime config (base path, auth provider, frame-ancestors)

hooks/                          TanStack Query hooks per resource (client-side data layer)

prisma/
  schema.prisma                 Data model (see below)
  seed.ts                       Demo users, catalog, role packages, and 12 sample requests
```

## 2. Database schema

SQLite for local dev/test (zero setup). Switching to Postgres for a shared
deployment is a one-line change: set `provider = "postgresql"` in
`prisma/schema.prisma` and point `DATABASE_URL` at your connection string --
no application code changes needed, since every query goes through Prisma.

| Model | Purpose |
|---|---|
| `User` | Simulated identity (name, email, role: HR/MANAGER/IT, department, office) |
| `EquipmentRequest` | The core request record. `id` is an autoincrement int; the `REQ-000001` display id is derived from it at read time, never stored |
| `RequestEquipmentItem` | Line items on a request's equipment list (freeform name + quantity) |
| `RequestActivity` | Unified audit log (created / status changed / details updated / equipment updated) -- powers the timeline, status history, and request history in one table |
| `EquipmentCatalogItem` | Master inventory list for the existing-employee equipment picker |
| `RolePackage` / `RolePackageItem` | Recommended equipment package per new-hire role |

Both `EquipmentCatalogItem` and `RolePackage` are editable from **Settings**
(IT only) -- the seed data populates them, but they aren't hardcoded.

## 3. Local setup

```bash
npm install
cp .env.example .env        # defaults to SQLite, no changes needed for local dev
npm run db:setup            # runs migrations + seeds demo data
npm run dev
```

Open http://localhost:3000. The sidebar's **Acting as** switcher lets you
try the app as different roles (HR, Manager, IT) without a real login --
see [Authentication](#6-authentication-today-vs-future) below.

Other useful scripts:

```bash
npm run db:studio           # Prisma Studio -- browse/edit the DB visually
npm run db:reset            # wipe and re-seed the database
npm run lint                # ESLint (includes React Compiler checks)
npx tsc --noEmit             # type-check
```

## 4. Test environment (before pushing to SharePoint)

To validate a change end-to-end before deploying:

1. `npm run db:reset` to get a known-clean dataset.
2. `npm run dev` and click through the golden paths:
   - Create a new-hire request (role dropdown auto-populates equipment) and an
     existing-employee request (equipment picker).
   - As IT, advance a request through all four statuses and confirm the
     progress bar animates and the dashboard counts update.
   - Edit and delete a request; confirm the activity timeline records both.
   - Check `/requests` sorting, filtering, search, and pagination.
   - Switch "Acting as" to HR/Manager and confirm Settings and status/delete
     controls are hidden (both in the UI and if you hit the API routes
     directly -- RBAC is enforced server-side, not just in the UI).
3. Run a production-mode smoke test, since that's the actual deployment
   target: `npm run build && npm run start`, then repeat a couple of the
   checks above against `localhost:3000`.
4. `npm run lint` and `npx tsc --noEmit` should both be clean.

There's no seam requiring SharePoint itself for local testing -- the app
runs standalone. See the next section for the actual embedding step.

## 5. Build & deploy

```bash
npm run build   # produces a standard Next.js Node server build
npm run start   # runs it (defaults to port 3000; set PORT to override)
```

This needs a Node.js host (not a static file host), because the app has a
real backend (API routes + Prisma/SQLite-or-Postgres) -- a pure static
export isn't viable here without losing that functionality. Deploy it like
any other Next.js app: an internal VM/App Service with a process manager
(pm2/systemd), a container (`Dockerfile` not included but a standard
`node:20-slim` + `npm ci && npm run build && npm run start` image works),
or a platform like Azure App Service / Vercel if your org allows it.

For a production database, switch to Postgres (see [Database schema](#2-database-schema))
rather than shipping SQLite to a shared environment.

### Embedding in SharePoint

The recommended pattern is **iframe embedding via SharePoint's Embed web
part**, not a full SPFx web part -- SPFx is significant extra engineering
for a full CRUD app like this and buys little here, since the app is
already a self-contained page.

1. Deploy the app to an internal HTTPS URL (e.g. `https://intranet.example.com/it-equipment`).
2. Set `ALLOWED_FRAME_ANCESTORS` to your SharePoint tenant domain (e.g.
   `https://contoso.sharepoint.com`) -- this makes `next.config.ts` send a
   `Content-Security-Policy: frame-ancestors` header permitting the embed.
   Without it, the app refuses to render inside any iframe (safe default).
3. On the SharePoint page, add an **Embed** web part pointing at that URL.
4. If the app is hosted under a subpath behind a reverse proxy, set
   `APP_BASE_PATH` and `NEXT_PUBLIC_APP_BASE_PATH` to that subpath (see
   `.env.example`) so Next.js's routing and asset URLs line up.

## 6. Authentication: today vs. future

There's no real login yet. The sidebar's "Acting as" switcher sets a cookie
naming a `User` row; every API route resolves the current user through
`lib/auth/current-user.ts` and enforces role checks there (`requireRole`) --
not just in the UI. This matters for the upgrade path: adding real
Microsoft Entra ID (Azure AD) sign-in later means swapping this module's
implementation for one backed by **NextAuth's Azure AD provider** (matching
`User` rows by email), while every call site that reads `getCurrentUser()`
or calls `requireRole()` stays unchanged. `lib/config.ts`'s `authProvider`
flag (`"simulated"` today) exists for exactly this switch-over.

## 7. Future improvements

Roadmap items intentionally out of scope for this build (also shown as
placeholders in the Inventory/Reports pages):

- **Microsoft Entra ID / SharePoint SSO** -- see above.
- **Email / Microsoft Teams notifications** on status changes and new
  requests (e.g. via Graph API or a webhook).
- **Inventory & asset tracking** -- real stock counts per office, tied to
  the existing `EquipmentCatalogItem` model.
- **Purchase orders & receiving workflow.**
- **Barcode scanning** for receiving and equipment check-out.
- **Reporting dashboards & Excel export** of any filtered request view.
- **A visible audit-log UI** -- the data already exists in `RequestActivity`;
  it just needs a dedicated searchable view (currently only surfaced per-request).
- **Fine-grained role-based permissions** beyond the current HR/Manager/IT
  three-way split (e.g. per-office or per-department scoping).
- **Automated tests** -- none are included; the app was verified by hand
  through the golden paths in [Test environment](#4-test-environment-before-pushing-to-sharepoint).
  A real CI setup would add Playwright for the flows above and Vitest for
  `lib/services` and `lib/validations`.
