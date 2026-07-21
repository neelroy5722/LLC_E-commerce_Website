# Victory Martin LLC — Apt.Bed E-commerce Platform
## Project Milestones

**Product:** Apt.Bed — one patented, configurable furniture unit (Bed + Closet + Desk + Chest + Bedside table). US Patent #11,553,800.
**Variants:** 3 sizes (Twin/Twin Long, Queen, King) × 3 heights = 9 variations; wood finishes added later.
**Domain:** apartmentloftbed.com

---

## Milestone 1 — UI/UX, Branding & Frontend Foundation (40%)

**Goal:** A complete, responsive, clickable website with all customer-facing screens and the two signature interactive tools working on the frontend — no real payments or persistence yet.

### Deliverables
- **Branding kit:** Logo (Landing Eagle whose wings form the letter **V**), color system (Soft Red / White / Blue), typography, and a basic style guide.
- **Marketing pages:** Home, Product, About, FAQ, Contact (responsive, mobile-first).
- **Product Configurator:** Size (Twin / Twin Long / Queen / King) → Height (Low / Med / High) → Wood (placeholder options), with the product image swapping based on selection and live price display for all 9 variants.
- **Ceiling-Height Recommendation Tool:** User enters ceiling height → tool recommends a bed height (e.g. ≤8 ft → Low, ≤9 ft → Medium, else High). Logic must be data-driven so thresholds are editable later.
- **Product imagery:** Rendered/composed images for the 9 variations from the single base model.
- **Static shells** for Customer Account and Admin Panel (UI only, no backend).

### Acceptance Criteria
- All pages responsive on mobile/tablet/desktop.
- Configurator produces the correct price + image for every combination.
- Recommendation tool returns a sensible height for any input.

---

## Milestone 2 — Backend, Payments & Admin System (40%)

**Goal:** Turn the static site into a working transactional business system.

### Deliverables
- **Database & API:** Users, Products, Product Variants, Orders, Order Items, Payments, Content (FAQ/pages), Videos.
- **Authentication:** Customer register / login; separate admin role.
- **Checkout & Stripe:** Full 100% payment (no deposit), order creation on success, email confirmation.
- **Sales tax:** Calculated at checkout based on shipping address.
- **Customer dashboard:** Order history, order status/tracking (Order Received → In Production → Ready for Freight → Shipped → Delivered), profile & address.
- **Admin dashboard:**
  - Manage products, prices, wood options, images, availability (Made-to-Order ↔ In Stock).
  - Manage orders and advance status; manage customers.
  - Manage FAQ / pages / announcements; upload assembly videos.
  - Basic reports (sales, revenue, best-selling size, pending vs. completed).

### Acceptance Criteria
- A real test order flows end-to-end (configure → pay via Stripe test mode → order appears in both customer and admin dashboards).
- Admin can change a price/image without code.
- Order status changes are visible to the customer.

> **Note:** Customers pay 100% at checkout in this milestone, but freight integration lands in Milestone 3. So checkout here must include a **placeholder/flat freight charge** in the total, which the real integration in M3 replaces.

---

## Milestone 3 — Shipping, Deployment & Handover (20%)

**Goal:** Go live on the client's domain and hand over a maintainable system.

### Deliverables
- **Freight shipping:** Integration point built with a fixed/flat freight price initially; architected to plug in live freight rates once the carrier is finalized.
- **Assembly video section:** Live and admin-uploadable.
- **Hosting & domain:** Production hosting setup and migration of **apartmentloftbed.com** (current host is unavailable), SSL, environment config for Stripe live keys.
- **QA:** Full testing pass — cross-browser, mobile, checkout, tax, order lifecycle, security basics.
- **Handover:** Source code, documentation, admin training session, and credentials transfer.

### Acceptance Criteria
- Site is live on apartmentloftbed.com with a real Stripe payment path.
- Client can independently place a test order, manage it in admin, and upload a video after a short training session.

---

## Recommended Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (React, App Router) — full-stack, one codebase |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL on **Neon** (serverless, DB branching) |
| ORM | Prisma (pooled connection string + `directUrl` for migrations) |
| Auth | NextAuth (Auth.js) — customer + admin roles |
| Payments | Stripe (Checkout + webhooks) |
| Tax | Stripe Tax |
| Media | Cloudinary |
| Hosting | **Railway** (Next.js app; custom domain + SSL) |

### Custom-engineering focus areas (stack-independent)
1. **Product configurator** — data-driven variant table (selections → price + image), editable by admin.
2. **Ceiling-height calculator** — thresholds stored in DB, tunable without redeploy.
3. **Order lifecycle** — state machine with status-history table, surfaced to admin and customer.
4. **Freight shipping** — abstraction now (flat rate), live carrier rates later.
