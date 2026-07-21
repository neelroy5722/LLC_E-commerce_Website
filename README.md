# Victory Martin — Apt.Bed E-commerce Platform

**Victory Martin LLC**'s store for the Apt.Bed — one patented furniture unit
(Bed + Closet + Desk + Chest + Bedside table) sold in configurable sizes,
heights, and finishes.

Status: **Milestone 1 (UI/UX & branding) + Milestone 2 (Backend, Payments &
Admin) complete.** The site is a working transactional business system —
accounts, checkout, orders, and a data-driven admin.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (dark theme) |
| Database | Prisma ORM · SQLite in dev (Postgres/Neon-portable) |
| Auth | NextAuth (Auth.js) — credentials + customer/admin roles |
| Payments | Stripe Checkout (test mode) with a built-in mock fallback |
| Tax | Data-driven US state rates (Stripe Tax-ready) |
| Icons / Fonts | lucide-react · Inter + Fraunces |

## Getting started

```bash
npm install            # also runs `prisma generate`
npm run db:reset       # create + seed the SQLite database
npm run dev            # http://localhost:3000
```

`npm run build` runs `prisma generate && next build`. Other scripts:

```bash
npm run db:push        # sync schema to the database
npm run db:seed        # seed catalogue, content, tax, sample orders
node scripts/generate-product-images.mjs   # regenerate the 27 variant images
```

### Demo logins (from the seed)

- **Customer** — `john.r@email.com` / `password`
- **Admin** — `admin@apartmentloftbed.com` / `admin1234`

## Environment (`.env`)

Everything runs offline out of the box. Optional integrations:

- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — enable **real Stripe Checkout**
  (test mode). Left blank, checkout uses a mock that creates a paid order so the
  flow is demonstrable end-to-end. Toggle `NEXT_PUBLIC_STRIPE_ENABLED`.
- `RESEND_API_KEY` / `RESEND_FROM` — send order-confirmation and password-reset
  emails via [Resend](https://resend.com). Left blank, emails are logged
  to the server console.
- `DATABASE_URL` — SQLite by default; point at Postgres/Neon for production
  (change the `provider` in `prisma/schema.prisma` to `postgresql`).

## Milestone 2 — what's implemented

- **Database & API** — Users, Product/Sizes/Heights/Woods/Variants, Orders,
  Order Items, Payments, **Order status history**, FAQs, Pages, Announcements,
  Videos, Tax rates, Settings. See [prisma/schema.prisma](prisma/schema.prisma).
- **Auth** — register/login, hashed passwords, JWT sessions, `customer` vs
  `admin` roles, route guards ([lib/session.ts](lib/session.ts)).
- **Data-driven catalogue** — the product page, configurator, and price matrix
  read prices/images/availability from the DB, so **admin edits change the
  storefront without code** ([lib/catalog.ts](lib/catalog.ts)).
- **Checkout** — configure → shipping → **live sales tax by state** + flat
  freight placeholder → Stripe (or mock) → order creation + confirmation email
  ([app/api/checkout/route.ts](app/api/checkout/route.ts), [lib/pricing.ts](lib/pricing.ts)).
- **Customer dashboard** — real order history, live status tracking
  (Order Received → In Production → Ready for Freight → Shipped → Delivered),
  editable profile & address.
- **Admin dashboard** — manage prices, wood options, images, availability;
  advance order status (visible to the customer); customers; FAQs &
  announcements; assembly videos; reports (sales, revenue, best-selling size,
  open vs. completed) — all backed by real data.

### Custom-engineering focus areas

- **Configurator** — DB-backed variant table (selection → price + image), admin-editable.
- **Ceiling calculator** — thresholds stored in the DB, tunable without redeploy.
- **Order lifecycle** — status state machine with a `OrderStatusHistory` table, surfaced to admin and customer.
- **Freight** — flat-rate abstraction now; live carrier rates plug in for Milestone 3.

## Roadmap — Milestone 3

Live freight rates, admin/Cloudinary video uploads, production hosting on
`apartmentloftbed.com` (VPS + self-hosted PostgreSQL + live Stripe keys), full QA,
and handover. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
