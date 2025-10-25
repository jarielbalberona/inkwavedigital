### Plan 1
# Render Deployment, NO AWS

Here’s a Cursor-ready plan you can drop into `/docs/plan.md` (tuned for Render deploys, Clerk auth, and your next features: **Loyalty Points** + **Wi-Fi Integration**).

---

# Ink Wave Digital — Render Edition

## 1) Executive Overview

**Scan → Order → Process → (Earn Points) → (Optional Wi-Fi Access)** for cafés and restos.
Web-first (PWA), multi-tenant, Clerk-secured. Deployed with **Render** (no AWS complexity).

---

## 2) Product Summary

* **Customer PWA** (no install): scan table QR → menu → cart → submit → push “Order Ready”.
* **Merchant Dashboard**: live KDS (New/Prep/Ready/Served), menu editor, table manager.
* **Admin (Ink Wave)**: merchant onboarding, QR batch generator, themes/branding.
* **Next Features (tagged)**

  * 🟢 *Next Feature 1:* **Centralized Loyalty Points** (single account, merchant-scoped balances).
  * 🟢 *Next Feature 2:* **Smart Wi-Fi Access** (QR → captive portal token → timed session via Ruijie API/RADIUS).

---

## 3) Current Plan (MVP scope)

* **Table QR** with signed context (venueId, tableId, exp).
* **Menu & Ordering** (multi-tenant schema from day 1).
* **KDS + WebSockets/SSE** for instant updates.
* **Web Push** notifications (READY).
* **Clerk Auth** for merchant/staff; customers anonymous (upgrade later for points).
* **Infra on Render**:

  * Web Services for apps (no Docker required),
  * Managed **Render PostgreSQL**,
  * **Object storage** via **Supabase Storage** (simple SDK + public CDN) or **Cloudflare R2** (either works; choose one),
  * Optional **Render Redis** for sessions/queues (later).

**Nice-to-have (if time):**

* CSV menu import, “Sold out” toggles, basic analytics.

---

## 4) Future Plans (Roadmap)

**Phase 2 — Retention & Connectivity**

* 🟢 **Points:** per-merchant point wallets, earn on orders, redeem at checkout.
* 🟢 **Wi-Fi:** captive portal endpoint + Ruijie API client, Session-Timeout/Idle-Timeout.

**Phase 3 — Monetization & Scale**

* Payments (GCash/Maya/PayMongo hosted checkout), Analytics Pro, Campaigns (push/SMS/email).

**Phase 4 — Network Effects**

* Marketplace/Discovery, opt-in cross-promos, white-label for chains/hotels.

---

## 5) Architecture (Render-friendly)

**Frontends**

* `apps/customer-pwa` — Next.js 15 (App Router), PWA, TanStack Query, Tailwind v4/shadcn.
* `apps/merchant-dashboard` — Next.js 15 (App Router).
* `apps/admin` — Next.js 15 (optional separate app or merge with dashboard under /admin).

**Backend**

* `apps/api` — Fastify/Express + Zod, **Drizzle ORM** → **Render PostgreSQL**.
* Realtime via **WebSocket** (Render supports it out of the box).
* Web Push (VAPID).
* (Later) **cron job** for points expiry → Render **Cron Job**.

**Shared Packages**

* `packages/db` (Drizzle schema + migrations)
* `packages/types` (zod + TS types)
* `packages/ui` (shadcn/tailwind components)
* `packages/utils` (jwt/jws, logger)

**Storage**

* **Supabase Storage** (recommended for simplicity)
  or **Cloudflare R2** (if you prefer S3-style).
  Store menu images; serve via public CDN; use signed URLs for uploads.

---

## 6) Data Model (core)

* `tenants`, `venues`, `tables`
* `menus`, `menu_categories`, `menu_items`, `item_options`, `item_option_values`
* `orders`, `order_items`, `order_events`
* `users` (optional Clerk linkage), `device_tokens` (web push)

**Points (Next Feature 1)**

* `merchant_points(user_id, venue_id, balance, updated_at)`
* `point_transactions(user_id, venue_id, delta, reason, order_id?, created_at)`
* `point_rules(venue_id, earn_per_peso, redeem_rate, expiry_days, min_redeem)`

**Wi-Fi (Next Feature 2)**

* `wifi_tokens(venue_id, table_id?, status, expires_at, used_by_mac?)`
* `wifi_sessions(venue_id, mac, started_at, ends_at, source_token_id)`

---

## 7) Auth (Clerk)

**Dashboard/Admin/Staff**

* Clerk roles: `owner`, `manager`, `staff`.
* Protect routes with `@clerk/nextjs` middleware; map Clerk user → `users` table.

**Customer PWA**

* Anonymous by default (persist `anon_device_id`).
* Offer “Sign in with phone/email (Clerk)” to sync **points across devices**.
* On sign-in: **merge** anon device → `user_id`.

---

## 8) QR Strategy (secure)

QR URL example:

```
https://m.inkwave.app/{tenant}/{venue}/t/{tableId}?c={JWS}
```

JWS payload:

```json
{ "v":"venue_id","t":"table_id","ts":1734500000,"exp":1734586400,"n":"nonce" }
```

Validate on server before creating an order session.

---

## 9) API Surface (MVP)

```
POST /api/v1/sessions/qr           // validate JWS, create session (venue/table)
GET  /api/v1/menu                   // fetch active menu
POST /api/v1/orders                 // create order
PATCH /api/v1/orders/:id/status     // staff: PREP|READY|SERVED
POST /api/v1/webpush/subscribe      // store device’s push endpoint
```

**Points (stub for Phase 2)**

```
GET  /api/v1/points                 // balances per venue
POST /api/v1/points/earn            // apply on order success
POST /api/v1/points/redeem          // deduct at checkout
```

**Wi-Fi (stub for Phase 2)**

```
POST /api/v1/wifi/token             // create one-time portal token
GET  /wifi/login?t=...              // captive portal: validate → Ruijie API → start timed session
```

---

## 10) Implementation Plan (sprintable)

**Sprint 0 — Monorepo & Foundations**

* `pnpm` workspaces: `apps/{customer-pwa,merchant-dashboard,admin,api}` + `packages/{db,ui,types,utils}`
* Tailwind v4 + shadcn setup; PWA manifest + service worker boilerplate.
* Clerk wired to dashboard/admin; PWA public (no auth).

**Sprint 1 — Menu & Tables**

* Drizzle schema/migrations.
* Admin: tenant/venue/table CRUD, **QR generator** (PNG/SVG download).
* Dashboard: menu CRUD, availability toggles.

**Sprint 2 — Ordering Core**

* PWA: scan → menu → cart → submit.
* API: validate JWS, create order; **WebSocket** feed.
* Dashboard KDS: live list + status changes + sound on `order:new`.

**Sprint 3 — Notifications & Polish**

* Web Push subscribe; notify on `READY`.
* Perf: image CDN, optimistic submits, virtualization.
* Basic analytics: daily orders, top items.

**Sprint 4 — Stubs Ready**

* Points schema + endpoints (flagged off in UI).
* Wi-Fi captive endpoint + Ruijie client (mock).

---

## 11) Render Infra Map

You can use a **`render.yaml` Blueprint** to spin this up in one go.

```yaml
# render.yaml
services:
  - type: web
    name: inkwave-customer-pwa
    env: node
    rootDir: apps/customer-pwa
    buildCommand: pnpm install --frozen-lockfile && pnpm build
    startCommand: pnpm start
    autoDeploy: true
    envVars:
      - key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        sync: false
      - key: NEXT_PUBLIC_API_BASE_URL
        value: https://inkwave-api.onrender.com
      - key: NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
        sync: false

  - type: web
    name: inkwave-merchant-dashboard
    env: node
    rootDir: apps/merchant-dashboard
    buildCommand: pnpm install --frozen-lockfile && pnpm build
    startCommand: pnpm start
    autoDeploy: true
    envVars:
      - key: CLERK_SECRET_KEY
        sync: false
      - key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        sync: false
      - key: NEXT_PUBLIC_API_BASE_URL
        value: https://inkwave-api.onrender.com

  - type: web
    name: inkwave-admin
    env: node
    rootDir: apps/admin
    buildCommand: pnpm install --frozen-lockfile && pnpm build
    startCommand: pnpm start
    autoDeploy: true
    envVars:
      - key: CLERK_SECRET_KEY
        sync: false
      - key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        sync: false
      - key: NEXT_PUBLIC_API_BASE_URL
        value: https://inkwave-api.onrender.com

  - type: web
    name: inkwave-api
    env: node
    rootDir: apps/api
    buildCommand: pnpm install --frozen-lockfile && pnpm build
    startCommand: pnpm start
    autoDeploy: true
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: inkwave-postgres
          property: connectionString
      - key: JWT_SECRET
        sync: false
      - key: WEB_PUSH_PUBLIC_VAPID_KEY
        sync: false
      - key: WEB_PUSH_PRIVATE_VAPID_KEY
        sync: false
      - key: STORAGE_BUCKET
        sync: false
      - key: STORAGE_PUBLIC_URL
        sync: false
      - key: STORAGE_SERVICE_ROLE_KEY
        sync: false
      - key: CLERK_WEBHOOK_SECRET
        sync: false

databases:
  - name: inkwave-postgres
    plan: starter
```

> Notes
> • `pnpm start` for Next.js can be `pnpm start` (production) or `pnpm run render-start` if you use `next start -p $PORT`.
> • Use **Render Cron Jobs** for points expiry: run a tiny script daily hitting `/internal/points/expire`.

---

## 12) Domains / SSL / Networking

* Map `m.inkwave.app` → **customer PWA**, `dash.inkwave.app` → **dashboard**, `admin.inkwave.app` → **admin**, `api.inkwave.app` → **API** (Render manages SSL).
* WebSockets work without extra config on Render.
* CORS on API: allow the three frontends.

---

## 13) Storage Choice

**Option A (simplest): Supabase Storage**

* Public bucket for menu images.
* Signed uploads from dashboard.
* Env: `STORAGE_PUBLIC_URL`, `STORAGE_SERVICE_ROLE_KEY`.

**Option B: Cloudflare R2**

* S3-compatible; sign PUT URLs in API.
* Serve through public domain/CF CDN.

---

## 14) Env Vars (quick checklist)

```
DATABASE_URL=render-managed-postgres
JWT_SECRET=superlongrandom
WEB_PUSH_PUBLIC_VAPID_KEY=...
WEB_PUSH_PRIVATE_VAPID_KEY=...
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx (optional)
STORAGE_BUCKET=inkwave-media
STORAGE_PUBLIC_URL=...
STORAGE_SERVICE_ROLE_KEY=...
```

---

## 15) Dev & DX (Cursor-friendly)

* Local: `docker compose up db` (optional) → `pnpm dev` per app.
* Drizzle: `pnpm drizzle:generate && pnpm drizzle:migrate`.
* Seed scripts for demo venue/menu.
* Feature flags for **Points**/**Wi-Fi** UI so you can ship stubs.

---

## 16) Security & Reliability

* Signed QR (JWS) to prevent table spoofing/replay.
* Zod validate all inputs; rate-limit order submit.
* Clerk RBAC for staff vs managers.
* Web Push keys via VAPID; store endpoints in `device_tokens`.
* Postgres automated backups (Render); add weekly export if needed.

---

## 17) Acceptance Criteria (MVP)

* Scan QR → table recognized → can order → shows in KDS → status updates → READY push works.
* Menu editor updates reflect instantly; item availability toggles.
* Multi-tenant: merchants can’t see other tenants’ data.
* Admin can generate QR batches for tables.

---

## 18) Native App? (Later)

* Customer stays PWA (good enough).
* If needed, **staff app** with **Expo/React Native** (for Bluetooth printers). Until then, use a cheap Android tablet/monitor on the KDS web app.

---

### TL;DR Build Order on Render

1. Deploy **Postgres** → run **Drizzle migrations**.
2. Deploy **API** (Fastify) with env vars.
3. Deploy **Customer PWA** + **Dashboard** (set `NEXT_PUBLIC_API_BASE_URL`).
4. Wire **Clerk** to dashboard/admin; leave PWA anonymous.
5. Ship MVP → then light up **Points** and **Wi-Fi** stubs in Phase 2.

If you want, I can output a **starter repo structure + minimal code stubs** next so you can push straight to Render and iterate in Cursor.
