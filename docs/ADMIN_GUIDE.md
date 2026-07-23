# Apt.Bed — Administrator Guide

A step-by-step guide to running the store from the admin dashboard: signing in,
reading the analytics, fulfilling orders, editing the catalogue and prices,
moderating reviews, managing media and site content, and configuring shipping and
tax. No code required.

> **Who this is for:** store administrators. Customers never see any of these
> screens.

---

## 1. Access and roles

- **Two kinds of account.** A **customer** can shop, check out, and manage their own
  orders/reviews. An **administrator** can do everything a customer can **and** reach
  this dashboard.
- **Admins are created in the database only.** There is no public "admin sign-up"
  page. A developer creates an admin (or promotes an existing user) directly in the
  database. Anyone who signs up through the normal website is always a customer and
  can never reach the dashboard — even if they use an email meant for an admin.
- **Admins sign in on their own page.** The admin sign-in page is separate from the
  customer sign-in page. If an admin tries the customer sign-in, they're turned away
  with a note pointing them to the admin page. (And a customer who lands on `/admin`
  is redirected to their own account.)

**Admin dashboard URL:** `https://apartmentloftbed.com/admin` (served on the admin
subdomain). Visiting `/admin` while signed out sends you to the admin sign-in page.

---

## 2. Signing in

1. Go to **`/admin/login`**.
2. Enter your admin **email** and **password**.
3. Click **Sign in** → you land on the **Dashboard**.

- Entering a *customer* account here shows "This account doesn't have admin access."
- If your email isn't verified yet, you'll be asked to verify it first.
- Change your password any time from **Settings** (see §11).

> **Screenshot:** _Admin sign-in page._

---

## 3. The dashboard layout

Every admin screen shares the same frame:

- **Left sidebar** — the menu: Dashboard, Orders, Customers, Products & Pricing,
  Reviews, Assembly Videos, Content, Settings. At the bottom, **View store ↗** opens
  the public site.
- **Top bar** — a greeting on the left; on the right a **🔔 bell** (red count of new
  orders, links to Orders) and **Sign out**.
- **Main area** — the selected section.

On a phone the sidebar collapses to a scrollable menu row under the top bar.

---

## 4. Dashboard (analytics)

Summarizes performance for a **date range you choose**.

### Choosing the time range (top-right)
- **Quick presets:** `7D`, `30D`, `90D`, `1Y`.
- **Custom range:** the **Start date** and **End date** pickers (Start → to → End).

The chart, the revenue total, and the analytical cards all **recalculate** for the
range you pick.

### Five cards above the chart
1. **Today's Revenue** — paid revenue booked today.
2. **This Month's Revenue** — paid revenue this calendar month.
3. **Today's Orders** — orders placed today.
4. **Active Orders** — orders not yet delivered (your open workload).
5. **Best-Selling Product** — top size within the selected range.

### The revenue chart
A line chart across the range. Buckets adapt to the range length — **daily** (short
ranges), **weekly** (a few months), **monthly** (a year+). **Hover** a point to read
that period's revenue. Above the chart: the **range revenue total** and **order
count**.

### Products sold (right of the chart)
Units sold **by size** for the range — Product, Amount, Percent.

### Five cards below the chart (all range-driven)
6. **Avg Order Value** — range revenue ÷ range orders.
7. **Processing Time** — average days from order placed to delivered.
8. **Completed Orders** — orders delivered in the range.
9. **Total Users** — registered accounts.
10. **Returning Rate** — share of customers with 2+ orders in the range.

> **Screenshot:** _Dashboard with the date range and cards._

---

## 5. Orders — fulfilling and updating

**Menu → Orders.** Your fulfillment workspace. Opening it clears the 🔔 "new orders"
badge. Orders are grouped by customer; use **Search** and **Sort** to find one.

Each order shows its number, date, customer, and **line items** (each configured
Apt.Bed) with a **status**.

### The order lifecycle (five stages, in order)
1. **Order Received** — placed and paid.
2. **In Production** — being built to order.
3. **Ready for Freight** — built, inspected, staged for pickup.
4. **Shipped** — on a freight truck.
5. **Delivered** — arrived, ready to assemble.

### Updating status
- You advance the status **per product line** using its dropdown → **Update**.
- With several items, the order's **overall** status is automatically the
  **least-advanced** item — so an order shows "Delivered" only once *every* item is.
- **Every change is visible to the customer immediately** and recorded in the order
  history. This is how customers learn their build is progressing.

### Tips
- Work the list top-down: advance new "Order Received" orders to "In Production" when
  the build starts.
- Only mark **Delivered** once freight is confirmed received — this unlocks the
  customer's ability to review (see §8).

> **Screenshot:** _Orders list with a status being advanced._

---

## 6. Customers

**Menu → Customers.** Every registered account, with search and sort:
- Name, email, phone,
- Number of orders and **total spent** (paid orders only),
- **Delete** — available only when *all* their orders are delivered, so you never
  remove someone mid-fulfillment.

> **Screenshot:** _Customers table._

---

## 7. Products & Pricing

**Menu → Products & Pricing.** The catalogue and price editor. The Apt.Bed is sold as
**Sizes** (Twin, Queen, King, …) × **Heights**, with **Wood finishes** that can add an
upcharge. Availability is set **automatically from stock**: units on hand show as
**In stock**, otherwise **Made to order**.

You can:

- **Sizes & heights** — rename sizes, edit their dimensions, rename heights, **delete**
  a size, or **Add size** (a new size auto-creates a price for every height so it's
  immediately orderable, and generates preview images).
- **Prices & stock** — set the **base price** (whole USD) and **units on hand** per
  size × height.
- **Wood finishes** — rename, set the **upcharge**, toggle **active**, **delete**, or
  **Add finish** (previews auto-generate). The finish-name field is wide enough for
  full descriptive names.
- **Product images** — for every size × height × wood combination, **Upload** a real
  photo to replace the generated preview, or **Reset** to the default.

Every save shows **"Saving… / Saved ✓"**, and changes appear on the storefront right
away — no redeploy.

**To change a price:** find the size/height row → type the new base price → it saves.

> **Screenshot:** _Products & Pricing: sizes, prices/stock, finishes, images._

---

## 8. Reviews — moderation

**Menu → Reviews.** Customer reviews are **not** public until you approve them. The
page splits into **Pending** (awaiting you) and **Published**.

For each review:
- **Approve** — publishes it on the public **About** page.
- **Reject** — hides it.
- **Delete** — removes it.

There's a **sort** control (status/date/rating/author) and a **Compose email** button
(top-right) to message a customer directly.

> **Who can review?** Only customers whose order is **Delivered**. Keeping order
> statuses current (see §5) is what unlocks reviews.

> **Screenshot:** _Reviews page with Pending and Published._

---

## 9. Assembly Videos (Videos & Photos)

**Menu → Assembly Videos.** Two things live here:

- **Assembly videos** — **Upload** a video file (or add an embed URL) with a title;
  shown on the public assembly/instructions page. **Delete** removes one.
- **First-screen photos** — upload one or several images; they run as the rotating
  **homepage hero carousel**.

Uploads go to the media CDN (Cloudinary) automatically in production.

> **Screenshot:** _Videos & Photos with the upload areas._

---

## 10. Content management

**Menu → Content.** Edit site copy without a developer:

- **Site announcement** — the banner shown across the site. Type the message and
  **Save**; clear it to hide the banner.
- **FAQs** — **Add** a question/answer pair, edit existing ones, or **Delete** them.
  These feed the public FAQ page.

> **Screenshot:** _Content management: announcement + FAQ editor._

---

## 11. Settings

**Menu → Settings.** Store configuration:

- **Admin password** — change your own password (its own form/button at the top).
- **Freight & tax mode:**
  - **Flat freight (USD)** — the flat shipping charge added at checkout (current value
    shown beneath the field).
  - **Sales-tax mode** — **Table** (built-in US state rates, offline) or **Stripe Tax**
    (requires Stripe keys). Tax is computed at checkout from the shipping address.
- **State tax rates** — add or delete per-state rates for "Table" mode (the `*`
  default can't be removed).
- **Ceiling-height thresholds** — tune the "will it fit my room?" height
  recommendation logic, with no redeploy.

> **Screenshot:** _Settings: freight, tax mode, tax rates._

---

## 12. Everyday tasks — quick reference

| I want to… | Go to | Do this |
|---|---|---|
| See how sales are doing | Dashboard | Pick a date range; read cards + chart |
| Start building a new order | Orders | Advance it to **In Production** |
| Tell a customer it shipped | Orders | Advance the item(s) to **Shipped** |
| Close out an order | Orders | Mark every item **Delivered** |
| Change a price | Products & Pricing | Edit the base price (auto-saves) |
| Add a wood finish | Products & Pricing | **Add finish** (name + upcharge) |
| Swap a product photo | Products & Pricing | **Upload** on that combination |
| Publish a customer review | Reviews | **Approve** it |
| Put a banner on the site | Content | Type the **announcement** → **Save** |
| Add an FAQ | Content | **Add** a question/answer → **Save** |
| Change shipping cost | Settings | Edit **Flat freight** |
| Change my password | Settings | Use the admin password form |

---

## 13. Good habits

- **Keep order statuses current** — it informs customers and unlocks reviews.
- **Moderate reviews promptly** — approved reviews build trust on the About page.
- **Use the date range** on the dashboard to compare periods.
- **Sign out** on shared computers.
- **Order-confirmation emails** send automatically once payment is confirmed — no
  action needed from you.

---

*Screenshots referenced above can be dropped in beside each section. To regenerate
them from a running site, sign in and capture each admin screen at ~1360px wide.*
