### Plan 0: Original

Awesome—here’s a **Cursor-ready master plan** you can drop into your repo’s `/docs/plan.md` and build against.

---

# Ink Wave Digital — End-to-End Overview

## 1) One-liner Summary

**Scan → Order → Process → (Earn Points) → (Optional Wi-Fi Access)** for cafés/restos, tightly integrated with Ink Wave’s print/branding. Web-first (PWA), cloud-backed, Clerk-secured, multi-tenant.

## 2) Product Overview

* **Customer PWA**: Scan table QR → auto-context (venue/table) → browse menu → add to cart → submit order → receive status updates (push).
* **Merchant Dashboard**: Live order queue (New/Prep/Ready/Served), menu & pricing editor, table manager, basic analytics.
* **Admin (Ink Wave)**: Merchant onboarding, QR batch generator, theme presets, usage metrics.
* **Next Features (tagged)**:

  * 🟢 **Next Feature 1: Centralized Loyalty Points** (unified user account, per-merchant balances).
  * 🟢 **Next Feature 2: Smart Wi-Fi Access** (QR → controller portal login → timed session).

---

# Current Plan (MVP Scope)

## MVP Goals (ship fast, stable, local)

* **Menu & Ordering** for single venue → multi-venue (multi-tenant-ready from day one).
* **Table QR** with signed context (venueId, tableId).
* **Order lifecycle**: New → Preparing → Ready → Served (staff UI).
* **Basic CMS**: Categories, items, options/add-ons, availability toggles.
* **Notifications**: Web push (“Order ready”).
* **Clerk Auth**: Merchants/staff; anonymous customers (device-scoped) with upgrade path to full account.
* **Infra**: AWS ECS + RDS Postgres + S3 + CloudFront + Route53 (reusing your existing patterns).

## Nice-to-haves (if time allows)

* CSV import for menu.
* “Sold out today” fast toggle.
* Lightweight analytics (top items, avg prep time).

---

# Future Plans (Roadmap)

## Phase 2 — Retention & Connectivity

* 🟢 **Centralized Loyalty**: unified user, per-merchant balances, QR earn/redeem flow, points rules per merchant.
* 🟢 **Wi-Fi Integration**: QR → portal token → timed session via Ruijie API/RADIUS (Session-Timeout, Idle-Timeout).

## Phase 3 — Monetization & Scale

* **Payments**: GCash/Maya/PayMongo hosted checkout (order auto-confirm on webhook).
* **Analytics Pro**: repeat visit rate, cohorting, peak hours, upsell insights.
* **Campaigns**: push/SMS/email (“double points”, “happy hour”).

## Phase 4 — Network Effects

* **Marketplace/Discovery**: “Find cafés using Ink Wave Digital.”
* **Cross-Promos**: opt-in community rewards (earn in A, redeem in B).
* **White-label**: chains/hotels sub-brands, custom domains/themes.

---

# Architecture (High Level)

**Frontends**

* `apps/customer-pwa` (Next.js 15, PWA, React 19, TanStack Query)
* `apps/merchant-dashboard` (Next.js 15)
* `apps/admin` (Next.js 15)

**Backend**

* `apps/api` (Node.js, Express/Fastify, Drizzle ORM, Postgres)
* Realtime: WebSocket/SSE for live orders
* Notifications: Web Push (VAPID)

**Shared**

* `packages/ui` (shadcn/tailwind v4)
* `packages/db` (Drizzle schema & migrations)
* `packages/types` (zod + TS types)
* `packages/utils` (jwt, signer, logger)

**Infra**

* AWS: ECS (Fargate), RDS Postgres, S3 (images), CloudFront, Route53, SES (optional), CloudWatch
* CDN for menu images
* Secrets: SSM Parameter Store
* IaC: Terraform (modules: vpc, ecs, rds, s3, cloudfront, route53)

---

# Data Model (Drizzle / Postgres)

Core tables (MVP):

* `tenants` (id, name, slug, theme)
* `venues` (id, tenant_id, name, address, timezone)
* `tables` (id, venue_id, label, is_active)
* `menus` (id, venue_id, name, is_active)
* `menu_categories` (id, menu_id, name, sort_index)
* `menu_items` (id, category_id, name, desc, price, image_url, is_available)
* `item_options` (id, item_id, name, type[select/multi], required)
* `item_option_values` (id, option_id, label, price_delta)
* `orders` (id, venue_id, table_id, status[NEW|PREP|READY|SERVED|CANCELLED], total, created_at)
* `order_items` (id, order_id, item_id, qty, unit_price, notes, options_json)
* `order_events` (id, order_id, type, at, by_user_id)
* `users` (id, clerk_user_id?, email?, phone?, created_at)
* `device_tokens` (id, user_id?, anon_device_id?, webpush_endpoint, keys_json)

Next Feature 1 (Points):

* `merchant_points` (id, user_id, venue_id, balance, updated_at)
* `point_transactions` (id, user_id, venue_id, delta, reason, order_id?, created_at)
* `point_rules` (venue_id, earn_per_peso, redeem_rate, expiry_days, min_redeem)

Next Feature 2 (Wi-Fi):

* `wifi_tokens` (id, venue_id, table_id?, status, expires_at, used_by_mac?)
* `wifi_sessions` (id, venue_id, mac, started_at, ends_at, source_token_id)

---

# Auth & Identity (Clerk)

**Merchant/Staff**

* Clerk Org or roles: `owner`, `manager`, `staff`.
* Protect dashboard/admin routes with Clerk middleware.
* RBAC map: only `owner/manager` can change menu/prices; `staff` can update order statuses.

**Customers**

* Anonymous by default (device-scoped `anon_device_id` persisted to local storage).
* Optional “Sign in with phone/email” (Clerk) to **persist points across devices**.
* When a customer signs in, **merge** anon cart & device tokens to their `user_id`.

---

# QR Strategy (Security-first)

**Table QR URL**

```
https://m.inkwave.app/{tenantSlug}/{venueSlug}/t/{tableId}?c={JWS}
```

**Signed context (JWS/JWT payload)**

```json
{
  "v": "venue_id",
  "t": "table_id",
  "ts": 1734500000,      // issued at
  "exp": 1734586400,     // 24h expiry
  "n": "nonce"           // prevent replay
}
```

* Validate on server; never trust client table ID.
* Orders require a **fresh server session** bound to that venue/table.

---

# API Surface (MVP)

`POST /api/v1/sessions/qr` → validate JWS, create short-lived session (venue/table).

`GET /api/v1/menu` → return active menu (categories/items/options).

`POST /api/v1/orders`
Payload: `{ items: [...], notes?, deviceId }`
Creates order, emits `order:new`.

`PATCH /api/v1/orders/:id/status` (staff-only)
Payload: `{ status: "PREP" | "READY" | "SERVED" }`
Emits `order:update`.

`POST /api/v1/webpush/subscribe` → store device token.

**Next Feature 1 (Points)**
`POST /api/v1/points/earn` → from order total.
`POST /api/v1/points/redeem` → apply against order.
`GET /api/v1/points` → balances per venue.

**Next Feature 2 (Wi-Fi)**
`POST /api/v1/wifi/token` → create one-time portal token (merchant action or auto).
`GET  /wifi/login?t=...` → captive portal endpoint: validate → call controller API → start session (Session-Timeout) → success page.

---

# Implementation Plan (Sprintable)

## Sprint 0 — Repo & Foundation (1–2 days)

* Monorepo (pnpm workspaces): `apps/{customer-pwa,merchant-dashboard,admin,api}`, `packages/{ui,db,types,utils}`.
* Tailwind v4 + shadcn/ui in PWA/dashboard.
* Clerk set up in dashboard/admin; public PWA anonymous.

## Sprint 1 — Menu & Tables

* Drizzle schema + migrations.
* Admin: create tenants/venues/tables; QR generator page (download PNG/SVG).
* Merchant: menu manager (CRUD), availability toggles.

## Sprint 2 — Ordering Core

* PWA: scan-landing → menu → cart → submit.
* API: validate QR JWS, create order, WebSocket live feed to dashboard KDS.
* Merchant KDS: order list, status changes, sound alert on `order:new`.

## Sprint 3 — Notifications & Polish

* Web Push: subscribe on PWA; notify on `READY`.
* Perf: image CDN, category virtualization, optimistic UI.
* Basic analytics (count/orders by day).

## Sprint 4 — Next Features (stubs ready)

* Points: create schema & endpoints; wire `earn` on order success (flag off in UI until ready).
* Wi-Fi: captive endpoint stub, Ruijie client module (mock until API keys ready).

---

# Tech Choices (concrete)

* **Frontend**: Next.js 15 (App Router), React 19, TanStack Query, shadcn/ui, Tailwind v4, PWA (manifest + SW).
* **Backend**: Fastify or Express + Zod validation, Drizzle ORM, WebSocket (ws), JWT/JWS (jose), Web Push (VAPID).
* **Auth**: Clerk (dashboard/admin/staff); optional customer login for points.
* **DB**: Postgres (RDS).
* **Storage**: S3 for images (signed upload from dashboard).
* **CDN**: CloudFront on S3 public assets.
* **Logs/Metrics**: CloudWatch + pino logger; future: OpenTelemetry.

---

# Environment & Secrets (example)

`.env` (local)

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/inkwave
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
JWT_SECRET=superlongrandom
WEB_PUSH_PUBLIC_VAPID_KEY=...
WEB_PUSH_PRIVATE_VAPID_KEY=...
S3_BUCKET=inkwave-media-dev
S3_REGION=ap-southeast-1
```

---

# Sample Drizzle Snippet (TS)

```ts
// packages/db/schema.ts
import { pgTable, uuid, text, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";

export const venues = pgTable("venues", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Asia/Manila"),
});

export const tables = pgTable("tables", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id").notNull(),
  label: text("label").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id").notNull(),
  tableId: uuid("table_id").notNull(),
  status: text("status").notNull().default("NEW"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow()
});
```

---

# Clerk Integration (quick steps)

**Dashboard/Admin apps**

1. `npm i @clerk/nextjs`
2. Wrap root layout with `<ClerkProvider>`.
3. Protect routes with `auth()` / `<SignedIn>`.
4. Map Clerk user → `users` table (webhook on `user.created`; store `clerk_user_id`, role).

**Customer PWA**

* Start anonymous; show “Sign in to keep points across devices” using Clerk’s prebuilt components later.
* On sign-in, merge anon device → user account.

---

# Security & Reliability

* **Signed QR (JWS)**: prevents spoofed table/venue.
* **Row-Level Access**: middleware ensures staff can only touch their venue’s orders.
* **Input validation**: zod on all API routes.
* **Rate limiting**: simple token-bucket per IP for order submit & portal.
* **Background Sync**: queue order submit if offline; replay when back online.
* **Backups**: RDS automated + daily snapshot; S3 versioning.

---

# DevOps (Cursor-friendly)

* **Local**: `docker compose up` (Postgres + MinIO optional).
* **CI/CD**: GitHub Actions → build docker images → push ECR → deploy ECS.
* **Migrations**: `drizzle-kit generate && drizzle-kit migrate`.
* **Preview environments**: (optional) per PR with separate ECS task & ephemeral DB.

---

# Pricing (starter sketch)

* **Starter** ₱999 setup + ₱499/mo (Digital Menu)
* **Standard** ₱3,999 setup + ₱799/mo (Menu + Ordering)
* **Pro** ₱8,999 setup + ₱999/mo (adds hardware kit)
* Add-ons: points (₱299/mo), analytics pro (₱299/mo), Wi-Fi (₱299/mo)

---

## TL;DR build order

1. **MVP**: PWA ordering + KDS + Clerk-secured dashboard.
2. **Next**: **Points** + **Wi-Fi** (scaffold now, flip on later).
3. **Then**: Payments, Analytics, Campaigns, Marketplace.

If you want, I can turn this into a **repo scaffold (folders, base code, and a seed DB)** next so you can open it in Cursor and start implementing immediately.
