# Admin Guide — Apt.Bed

Everything the store can be run with, no code required. Sign in at
`/login` with an **admin** account; you land on the **Admin dashboard**.

Default seeded admin (change the password after first login):
`admin@victorymartin.com` / `admin1234`

---

## Dashboard (`/admin`)
Today's sales, monthly revenue, open vs. completed orders, best-selling size,
and a **Recent products** feed showing each product's live status.

## Orders (`/admin/orders`)
- Orders are **grouped by customer**; use **Search** and **Sort**.
- Every product in an order has **its own status**. Advance a product with its
  dropdown → **Update**. The customer sees the change immediately.
- Lifecycle: Order Received → In Production → Ready for Freight → Shipped → Delivered.
- The order's overall status follows the least-advanced product automatically.

## Products (`/admin/products`)
- **Product lines** — add/edit/delete product lines (name, patent, availability). At least one must remain.
- **Sizes & heights** — rename, edit dimensions, delete a size, or **Add size**
  (a new size auto-creates prices for every height and auto-generates preview
  images).
- **Prices & stock** — base price (USD) and units on hand per size × height.
- **Wood finishes** — rename, set upcharge, toggle active, delete, or **Add finish**
  (previews auto-generate).
- **Product images** — every size × height × wood combination; **Upload** a real
  photo to replace the generated preview, or **Reset** to the default.
- Every save shows **"Saving… / Saved ✓"**.

## Customers (`/admin/customers`)
Search, sort, view phone/orders/spend. A customer can be **deleted only when all
their orders are delivered**.

## Reviews (`/admin/reviews`)
Approve / reject / delete customer reviews, and **Feature** approved reviews to
show them on the About page. Sort by status/date/rating/author.

## Videos & Photos (`/admin/videos`)
- **First-screen photos** — upload one or several; they play as the flowing
  homepage hero carousel.
- **Assembly videos** — upload video files (shown on the Assembly page) or add
  embed URLs.
- Uploads go to Cloudinary in production automatically.

## Content (`/admin/content`)
Manage FAQ entries and the site announcement banner.

## Reports (`/admin/reports`)
12-month revenue-by-size chart — **click a month** to drill into its weekly
breakdown — plus a units & revenue table.

## Settings (`/admin/settings`)
- **Flat freight** charge and **tax mode**.
- **State tax rates** — edit, add, or delete (the `*` default can't be removed).
- **Ceiling-height thresholds** — tune the recommendation tool without a redeploy.

## My Account (`/admin` → My Account)
Your own profile, address, and password (same screens a customer sees).

---

### Tips
- All catalogue changes (prices, finishes, sizes, images, availability) appear on
  the storefront right away.
- Order-confirmation emails send automatically once payment is confirmed.
- The site requires login to configure/cart/checkout; marketing pages are public.
