# QA Checklist — Apt.Bed

Run before go-live and after any significant change. Test on desktop + mobile,
and in Chrome, Safari, and Firefox.

## Responsive / cross-browser
- [ ] Home, Product, About, FAQ, Contact, Brand, Assembly render with no
      horizontal scroll on 375px, 768px, 1280px widths.
- [ ] Header nav + mobile menu + cart badge work in all browsers.

## Auth & gating
- [ ] Register with password confirm; mismatched/short passwords are rejected.
- [ ] Login signs in with **one click** and redirects (admin → `/admin`, customer → intended page).
- [ ] Password show/hide eye toggles work.
- [ ] Signed-out visit to `/product`, `/cart`, `/checkout`, `/account`, `/admin`
      → redirected to `/login`.
- [ ] A customer cannot reach `/admin` (redirected to `/account`).

## Configurator & tools
- [ ] Every size × height × wood shows the correct price and preview image.
- [ ] Ceiling-height tool returns a sensible height for any input.
- [ ] Add to cart / Buy now; cart quantity, remove, and totals are correct.

## Checkout, payments, tax, freight
- [ ] Cart of **multiple products** prices correctly (subtotal + tax + freight).
- [ ] Sales tax matches the shipping state; a 0%-tax state (e.g. OR) shows no tax line.
- [ ] Flat freight is included in the total.
- [ ] Stripe test card `4242 4242 4242 4242` completes → success page → order is **paid**.
- [ ] Confirmation email is received (Resend) with the itemized order.
- [ ] Order appears in the **customer** dashboard and the **admin** dashboard.

## Order lifecycle
- [ ] Admin advances a single product's status; the **customer sees it** (step tracker).
- [ ] Multi-product order shows each product's status independently.
- [ ] Overall order status follows the least-advanced product.

## Admin (no-code management)
- [ ] Change a price / stock / availability → reflected on the storefront.
- [ ] Add a size and a wood finish → previews auto-generate; new combos orderable.
- [ ] Upload a product image / homepage photo / assembly video → displays on the site.
- [ ] Add/edit/delete FAQ, announcement, tax rate, ceiling threshold.
- [ ] Customer submits a review → admin approves + features → shows on About.
- [ ] Reports 12-month chart renders; clicking a month shows the weekly breakdown.

## Security basics
- [ ] All `/api/admin/*` routes and admin server actions reject non-admins.
- [ ] Order totals are recomputed server-side (a tampered client price is ignored).
- [ ] `/api/health` returns `db: up` and the expected integration flags.
- [ ] Secrets are only in env vars (never committed); `NEXTAUTH_SECRET` is strong.
- [ ] HTTPS is enforced on the live domain.

## Media persistence (production)
- [ ] With `CLOUDINARY_URL` set, an uploaded image survives a redeploy/restart.
