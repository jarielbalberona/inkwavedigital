Awesome — here’s a **Cursor-ready integration plan** to connect **Ink Wave Digital** with **Loyverse** so customer orders placed via Ink Wave are **auto-created in Loyverse** (no manual re-entry). It’s written as an engineering spec you can drop into `/docs/integrations/loyverse.md`.

---

# Ink Wave × Loyverse Integration — Implementation Plan (No Code)

## 0) Executive Summary

* **Goal:** When a customer submits an order via **Ink Wave**, create a **mirrored sale** in **Loyverse** automatically so the café’s POS, reports, and inventory stay accurate.
* **Mode:** **Optional per merchant** (connect/disconnect). Ink Wave remains fully usable without Loyverse.
* **Scope (Phase 1):** One-way create to Loyverse. No edits/voids sync back. (We’ll reconcile in Phase 2.)

---

## 1) High-Level Design

### 1.1 Objects & Mapping

| Ink Wave Object    | Loyverse Object | Mapping Rule                                                                               |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------ |
| `tenant` / `venue` | Store           | Merchant selects the Loyverse **store_id** during connection.                              |
| `menu_item`        | Item / Variant  | Each item linked via `loyverse_item_id` (and optional `variant_id`).                       |
| `order`            | Receipt / Sale  | For each Ink Wave order, create a Loyverse receipt with line items.                        |
| `user` (customer)  | Customer        | Optional: create/update matching Loyverse customer (by email/phone).                       |
| `payment_status`   | Payment         | Phase 1: “unpaid” / “external” notes; Phase 3: hosted checkout webhook completes the sale. |

> Keep a **link table** (`pos_links`) to store `inkwave_id ↔ loyverse_id` pairs for items, customers, and stores.

### 1.2 Core Flow (Sequence)

1. **Customer** scans → orders on Ink Wave.
2. **Ink Wave API**:

   * Saves `order` (authoritative for kitchen/KDS & loyalty).
   * Enqueues **“Create Loyverse Receipt”** job with payload (venue/store, line items).
3. **Worker** consumes job:

   * Builds the Loyverse payload (store, customer, line items).
   * Calls **Loyverse API** with merchant’s access token.
   * On success: stores `loyverse_receipt_id` on `orders`.
   * On transient error: retries with exponential backoff; on hard error: dead-letter + alert.
4. **Dashboard** shows POS sync status badge per order (e.g., Synced / Pending / Failed).

### 1.3 Out-of-Band Syncs

* **Item Catalog Pull** (optional, manual or scheduled): Pull items/categories from Loyverse to help merchants map/attach items quickly in Ink Wave.
* **Stock Adjust** (Phase 2+): Optional decrement in POS when an order is created online.

---

## 2) Functional Scope

### 2.1 Merchant Connect UX

* **Admin → Integrations → “Connect Loyverse”** (per venue).
* Merchant pastes **access token** (from Loyverse Back Office) or you provide a small OAuth helper if/when available.
* Ink Wave validates token by listing **stores**; merchant selects the target **store_id**.
* Save encrypted token + selected store binding.

### 2.2 Item Linking

* **Manual Linking:** In menu editor, each item can be linked to a Loyverse item (and variant).
* **Auto-Assist:** Provide a “Search in Loyverse” modal (by name/SKU) to pick item.
* Store mapping in `pos_links_items`:

  * `venue_id`, `ink_item_id`, `loy_item_id`, `loy_variant_id?`, `tax_id?`.

### 2.3 Order Export Conditions

* Export only when:

  * Venue is connected to Loyverse.
  * All line items are linked (or use a configured **fallback item** like “Custom Item”).
* If any line item missing mapping, mark order status as **“Needs Mapping”** with a one-click “Resolve” action.

### 2.4 Error Handling & Retries

* Transient errors (5xx, timeouts, rate-limits): **retry** with backoff (e.g., 5 attempts over 15 min).
* Permanent errors (4xx like invalid item): **fail fast**, notify merchant to fix mapping, then requeue.
* Display per-order sync status: **Pending → Synced → Failed (actionable)**.

---

## 3) Data Contracts (Conceptual)

> *Note: Endpoint names/fields vary; verify in Loyverse’s official API docs before finalizing.*

### 3.1 Token & Store

* **Auth:** `Authorization: Bearer {ACCESS_TOKEN}`
* **List Stores:** fetch to present store choices, store `store_id`.

### 3.2 Items & Variants

* **Get Items/Categories:** pull once to prefill mapping UI. Save `loy_item_id`, `variant_id?`, `tax_id?`.

### 3.3 Create Receipt / Sale

* **Create Receipt:** send store, date, line items (`item_id`/`variant_id`, quantity, unit price in smallest currency unit), optional customer, notes/meta (e.g., `ext_ref: order_id`, `channel: "inkwave"`).
* **Response:** store `receipt_id` on `orders.loyverse_receipt_id`.

### 3.4 Customer (Optional)

* **Upsert Customer:** by phone/email to let Loyverse show spend history. Keep mapping in `pos_links_customers`.

---

## 4) Persistence Model (New/Updated Tables)

* `pos_connections`

  * `id`, `venue_id`, `provider` = `'loyverse'`, `access_token_encrypted`, `store_id`, `status`, `connected_at`, `updated_at`.

* `pos_links_items`

  * `id`, `venue_id`, `ink_item_id`, `loy_item_id`, `loy_variant_id?`, `tax_id?`, `last_verified_at`.

* `pos_links_customers` (optional, Phase 1.5)

  * `id`, `venue_id`, `ink_user_id`, `loy_customer_id`, `last_synced_at`.

* **Order fields (augment)**

  * `loyverse_receipt_id?`, `pos_sync_status` (`'pending'|'synced'|'failed'|'needs_mapping'`), `pos_sync_error?`.

* **Jobs**

  * `queue_jobs` (if DB-based): `id`, `type`, `payload_json`, `attempts`, `state`, `scheduled_at`, `last_error`.

---

## 5) Security & Compliance

* **Token storage:** Encrypt at rest; restrict decryption to server-side worker only.
* **Least privilege:** Only store-level scope (if Loyverse supports scoping).
* **Logging:** Never log full tokens. Redact sensitive fields.
* **Rate limiting:** Respect vendor limits; centralize throttling per merchant token.
* **PII:** If syncing customers, ensure you have merchant consent and display privacy policy updates.

---

## 6) Failure Modes & Recovery

| Scenario              | Behavior                                  | Recovery                     |
| --------------------- | ----------------------------------------- | ---------------------------- |
| Network/timeouts      | Retry with backoff                        | Auto                         |
| 401/403 invalid token | Mark connection “auth_failed”             | Merchant re-connects         |
| 404 item not found    | Mark order “needs_mapping”                | Merchant maps → requeue      |
| Rate limit            | Backoff + queue                           | Auto                         |
| Duplicate order       | Idempotency key (use Ink Wave `order_id`) | API should reject duplicates |

---

## 7) Observability

* **Metrics:** success rate, avg latency, error types, retries per merchant.
* **Dashboards:** per-venue integration health status, last sync time.
* **Alerts:** spikes in failures; token expirations.

---

## 8) Testing Strategy

* **Sandbox Merchant:** Connect to a test Loyverse account with a staging store.
* **Fixtures:** Sample items, variants, taxes, and a fallback item.
* **E2E Scenarios:**

  * All items mapped → order auto-syncs.
  * One unmapped item → “needs mapping” then requeue succeeds.
  * Token revoked → auth_failed → reconnect flow.
  * Rate-limit storm → backoff works, no drops.
* **Contract Tests:** Validate request/response shape against live/sandbox API.

---

## 9) Rollout Plan

1. **Behind Feature Flag** per venue: `posIntegration.loyverse = enabled`.
2. Onboard **1–2 pilot cafés** already on Loyverse.
3. Observe sync fidelity for a week (quietly).
4. Document **“How to Connect Loyverse”** (with screenshots).
5. Gradually invite more merchants.

---

## 10) Operational Playbooks

* **Rotating/Revoking Tokens:** Merchant clicks “Disconnect” (soft delete token) → stop jobs → mark as disconnected.
* **Bulk Remap:** If item SKUs changed, provide a CSV `ink_item_id, loy_item_id` import tool.
* **Support Quick-Win:** Add a **fallback item** “QR Online Order” (single Loyverse item) to catch unmapped sales while the café sets up proper mappings.

---

## 11) Non-Goals (Phase 1)

* Editing or voiding Loyverse receipts when Ink Wave order changes (we’ll log warnings).
* Real-time stock sync back to Ink Wave (Phase 2).
* Two-way loyalty sync (Ink Wave loyalty stays Ink Wave for now).

---

## 12) Dependencies & Config

* **Render (Prod):** No special infra — API service + background worker (either a second Render service pointing to the same codebase with `WORKER=1`, or use a queue library that can run within the API if traffic is low initially).
* **Local Dev:** Docker Compose with Postgres. Use a test Loyverse token.
* **Env Vars (examples):**

  * `LOYVERSE_API_BASE_URL`
  * `ENCRYPTION_KEY` (KMS if/when you move infra)
  * `QUEUE_DRIVER` (`db` now; `redis` later)
  * `FEATURE_LOYVERSE=1`

---

## 13) Acceptance Criteria (Phase 1)

* ✅ Merchant can **connect** a venue to Loyverse (token + store selection).
* ✅ Merchant can **map** each Ink Wave item to a Loyverse item/variant (or choose a fallback item).
* ✅ New orders created in Ink Wave are **mirrored in Loyverse** within **< 10 seconds** under normal conditions.
* ✅ POS sync status visible per order (Pending/Synced/Failed/Needs Mapping).
* ✅ Safe retry logic; **no duplicates** thanks to idempotency keys.
* ✅ Comprehensive logs and metrics; support can diagnose failures.

---

## 14) Future Enhancements (Phase 2+)

* **Two-way stock sync:** decrement in Loyverse on Ink Wave order; pull stock into the menu (gray out sold-out).
* **Receipt updates:** If order canceled in Ink Wave, attempt to void receipt (if API supports).
* **Payments & Reconciliation:** When paid online, mark sale as paid in Loyverse with payment type “Online”.
* **Customer sync:** Upsert customer and attach receipt, enabling spend analytics in Loyverse.
* **Multi-POS strategy:** Abstract with `pos_provider` so Square/Shopify POS can be added later.

---

### TL;DR

* Treat Ink Wave as the **experience & loyalty source of truth**.
* Treat Loyverse as the **cash register & reporting source of truth**.
* Build a **robust, optional, one-way bridge** that mirrors orders reliably, surfaces actionable errors, and never blocks the café’s operation.

If you want, I can now turn this into a **set of Jira tickets** (or a Markdown backlog) with effort estimates so you can sprint it in Cursor with clear deliverables.
