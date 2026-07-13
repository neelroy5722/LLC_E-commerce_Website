# Victory Martin — Apt.Bed E-commerce Platform

Frontend foundation for **Victory Martin LLC**'s Apt.Bed store — one patented
furniture unit (Bed + Closet + Desk + Chest + Bedside table) sold in configurable
sizes, heights, and finishes.

This repository currently covers **Milestone 1 — UI/UX, Branding & Frontend
Foundation**: a complete, responsive, clickable website with the two signature
interactive tools working on the frontend. No real payments or persistence yet.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Fonts | Inter (sans) + Fraunces (display) via `next/font` |

The stack is aligned with the recommended Milestone 2/3 additions (Prisma +
Postgres/Neon, NextAuth, Stripe, Cloudinary) — those plug into the data layer
below without reworking the UI.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

Extra scripts:

```bash
node scripts/generate-product-images.mjs   # regenerate the 12 variant images
node scripts/sanity-check.mjs              # verify pricing + ceiling logic
```

## What's included (Milestone 1)

- **Branding** — eagle-forms-a-“V” logo ([components/brand/Logo.tsx](components/brand/Logo.tsx)),
  Soft Red / White / Blue color system, and typography defined in
  [tailwind.config.ts](tailwind.config.ts).
- **Marketing pages** — Home, Product, About, FAQ, Contact (plus Privacy, Terms,
  Shipping, Assembly), fully responsive and mobile-first.
- **Product Configurator** ([components/product/Configurator.tsx](components/product/Configurator.tsx))
  — Size → Height → Wood, with the preview image swapping and the price updating
  live for every combination.
- **Ceiling-Height Recommendation Tool** ([components/product/CeilingTool.tsx](components/product/CeilingTool.tsx))
  — enter a ceiling height, get a recommended bed height. Thresholds are
  data-driven ([lib/ceiling.ts](lib/ceiling.ts)) so they can be tuned later.
- **Composed product imagery** — 12 variant images generated from one parametric
  base model into `public/products/`.
- **Static shells** — Customer Account (`/account`) and Admin Panel (`/admin`),
  UI only.

## Architecture notes

The custom-engineering focus areas are isolated in `lib/` as the single source of
truth, so Milestone 2 can move them behind a database/API without touching the UI:

- [lib/products.ts](lib/products.ts) — sizes, heights, woods, the price matrix, and
  variant → price/image resolution. Four selectable sizes × three heights yield the
  nine distinct base prices (Twin & Twin Long share a footprint tier).
- [lib/ceiling.ts](lib/ceiling.ts) — data-driven recommendation rules.
- [lib/site.ts](lib/site.ts) — site config, nav, FAQ, order-lifecycle statuses.
- [lib/mock.ts](lib/mock.ts) — placeholder orders/customers for the account & admin
  shells (replaced by real queries in Milestone 2).

### Routing

- `app/(marketing)/` — public site + customer account, wrapped in the site
  header/footer.
- `app/admin/` — admin panel with its own chrome (no marketing header/footer).

## Roadmap

- **Milestone 2** — Database & API, auth, Stripe checkout + tax, customer & admin
  dashboards wired to real data.
- **Milestone 3** — Freight shipping integration, live assembly videos, hosting on
  `victorymartin.com`, and handover.
