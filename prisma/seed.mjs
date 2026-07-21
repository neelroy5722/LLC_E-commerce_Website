/**
 * Seeds the Apt.Bed database with the catalogue, content, tax rates, settings,
 * an admin user, and a demo customer with sample orders.
 * Run: npm run db:seed   (or npm run db:reset to wipe + reseed)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SIZES = [
  { key: "twin", label: "Twin / Twin Long", dimensions: '38" × 75–80"', sortOrder: 0 },
  { key: "queen", label: "Queen", dimensions: '60" × 80"', sortOrder: 1 },
  { key: "king", label: "King", dimensions: '76" × 80"', sortOrder: 2 },
];
const HEIGHTS = [
  { key: "low", label: "Low", deckHeightFt: 3.5, blurb: "Sits close to the floor — best for lower ceilings.", sortOrder: 0 },
  { key: "medium", label: "Medium", deckHeightFt: 4.5, blurb: "Balanced storage and headroom for most rooms.", sortOrder: 1 },
  { key: "high", label: "High", deckHeightFt: 5.5, blurb: "Maximum storage underneath — needs a taller ceiling.", sortOrder: 2 },
];
const WOODS = [
  { key: "oak", label: "Oak", swatch: "#C9A26B", priceDelta: 0, sortOrder: 0 },
  { key: "maple", label: "Maple", swatch: "#E4C89A", priceDelta: 150, sortOrder: 1 },
  { key: "walnut", label: "Walnut", swatch: "#5C4033", priceDelta: 350, sortOrder: 2 },
];
const BASE_PRICES = {
  twin: { low: 3500, medium: 3700, high: 3900 },
  queen: { low: 4300, medium: 4600, high: 4900 },
  king: { low: 5000, medium: 5300, high: 5600 },
};
const STOCK = {
  twin: { low: 24, medium: 18, high: 12 },
  queen: { low: 16, medium: 20, high: 9 },
  king: { low: 8, medium: 11, high: 6 },
};
const CEILING_RULES = [
  { heightKey: "high", label: "High", minCeilingFt: 9.01, rationale: "Your ceiling comfortably clears the tall deck with room to sit up.", sortOrder: 0 },
  { heightKey: "medium", label: "Medium", minCeilingFt: 8.01, rationale: "A medium deck gives you storage while keeping safe sitting headroom.", sortOrder: 1 },
  { heightKey: "low", label: "Low", minCeilingFt: 0, rationale: "A low deck keeps a safe gap above your head on a shorter ceiling.", sortOrder: 2 },
];
// Representative US state sales-tax rates (%). "*" is the fallback.
const TAX_RATES = [
  { state: "*", ratePercent: 5.0 },
  { state: "CA", ratePercent: 7.25 },
  { state: "TX", ratePercent: 6.25 },
  { state: "NY", ratePercent: 4.0 },
  { state: "FL", ratePercent: 6.0 },
  { state: "WA", ratePercent: 6.5 },
  { state: "SC", ratePercent: 6.0 },
  { state: "IL", ratePercent: 6.25 },
  { state: "PA", ratePercent: 6.0 },
  { state: "OR", ratePercent: 0.0 },
  { state: "MA", ratePercent: 6.25 },
  { state: "GA", ratePercent: 4.0 },
];
const FAQS = [
  { question: "What exactly is the Apt.Bed?", answer: "The Apt.Bed is a modern single piece of furniture that consists of a bed, closet, desk, chest of drawers, bed table, and electrical availability for all your devices. It's engineered to give you a full bedroom suite using just a little more floor space than the mattress." },
  { question: "How do I choose the right height?", answer: "You choose the height of your Apt.Bed by figuring the ceiling height minus your sitting height. When you're sitting, the measurement from the seat to the top of your head is your sitting height. Subtract that from the room height, and you will have about how tall your bed should be. Then pick the bed that meets your needs." },
  { question: "What sizes are available?", answer: "Three sizes — Twin/Twin Long, Queen, and King — each available in Low, Medium, and High deck heights. Wood finish options are Oak, Maple, and Walnut." },
  { question: "Is it made to order?", answer: "Yes. Each Apt.Bed is currently built to order after purchase. As we scale, select configurations will also be available in stock for faster delivery." },
  { question: "How is it shipped?", answer: "Because the Apt.Bed is a large, solid-wood unit, it ships by freight carrier rather than standard parcel. A freight coordinator will contact you to schedule delivery, which is why we ask for a phone number at checkout." },
  { question: "Do I have to assemble it?", answer: "Some assembly is required. Every unit ships with clear instructions, and our website hosts step-by-step assembly videos you can follow at your own pace." },
  { question: "How do I pay?", answer: "Checkout is 100% up front via secure card payment — no deposits or financing to manage. Sales tax is calculated automatically based on your shipping address." },
  { question: "Do you ship internationally?", answer: "Today we ship within the United States only. Worldwide shipping is on our roadmap as we expand freight partnerships." },
];
const VIDEOS = [
  { title: "Unboxing & parts checklist", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sortOrder: 0 },
  { title: "Building the base frame", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sortOrder: 1 },
  { title: "Installing the storage bay", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sortOrder: 2 },
  { title: "Mounting the sleep platform", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sortOrder: 3 },
  { title: "Attaching desk & drawers", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sortOrder: 4 },
  { title: "Safety rails & final checks", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sortOrder: 5 },
];

const STATUSES = ["received", "in_production", "ready_for_freight", "shipped", "delivered"];

async function main() {
  console.log("Seeding…");

  // Wipe (order matters for FKs)
  await prisma.review.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.size.deleteMany();
  await prisma.height.deleteMany();
  await prisma.wood.deleteMany();
  await prisma.ceilingRule.deleteMany();
  await prisma.taxRate.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.page.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.video.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Product
  await prisma.product.create({
    data: {
      slug: "apt-bed",
      name: "Apt.Bed",
      description:
        "One patented furniture unit combining a bed, closet, desk, chest of drawers, and bedside table.",
      patent: "US Patent #11,553,800",
      availability: "made_to_order",
    },
  });

  // Catalogue
  const sizeRecords = {};
  for (const s of SIZES) sizeRecords[s.key] = await prisma.size.create({ data: s });
  const heightRecords = {};
  for (const h of HEIGHTS) heightRecords[h.key] = await prisma.height.create({ data: h });
  for (const w of WOODS) await prisma.wood.create({ data: w });
  for (const sKey of Object.keys(BASE_PRICES)) {
    for (const hKey of Object.keys(BASE_PRICES[sKey])) {
      await prisma.variant.create({
        data: {
          sizeId: sizeRecords[sKey].id,
          heightId: heightRecords[hKey].id,
          basePrice: BASE_PRICES[sKey][hKey],
          stock: STOCK[sKey][hKey],
        },
      });
    }
  }

  for (const r of CEILING_RULES) await prisma.ceilingRule.create({ data: r });
  for (const t of TAX_RATES) await prisma.taxRate.create({ data: t });

  await prisma.setting.createMany({
    data: [
      { key: "freight_flat_cents", value: "45000" }, // $450 placeholder freight
      { key: "tax_mode", value: process.env.TAX_MODE || "table" },
      { key: "store_name", value: "Victory Martin" },
    ],
  });

  for (const f of FAQS) await prisma.faq.create({ data: f });
  await prisma.page.createMany({
    data: [
      { slug: "privacy", title: "Privacy Policy", body: "How we collect and use your information. Final policy language confirmed before launch." },
      { slug: "terms", title: "Terms of Service", body: "The terms that govern purchases from Victory Martin LLC." },
    ],
  });
  await prisma.announcement.create({
    data: { message: "Free freight on King configurations this month.", active: false },
  });
  for (const v of VIDEOS) await prisma.video.create({ data: v });

  // Demo first-screen photos (placeholders referencing existing assets; admin
  // replaces them with real uploads). Several so the hero carousel flows.
  const HERO = [
    "/products/apt-bed-queen-high-oak.svg",
    "/products/apt-bed-king-high-walnut.svg",
    "/products/apt-bed-twin-medium-oak.svg",
    "/products/apt-bed-queen-medium-maple.svg",
  ];
  await prisma.photo.createMany({
    data: HERO.map((url, i) => ({ url, role: "hero", alt: "Apt.Bed first-screen photo", sortOrder: i })),
  });

  // Users
  const adminPass = await bcrypt.hash("admin1234", 10);
  await prisma.user.create({
    data: {
      email: "admin@apartmentloftbed.com",
      passwordHash: adminPass,
      name: "Victory Martin Admin",
      role: "admin",
      emailVerifiedAt: new Date(),
    },
  });

  const custPass = await bcrypt.hash("password", 10);
  const john = await prisma.user.create({
    data: {
      email: "john.r@email.com",
      passwordHash: custPass,
      name: "John Rivera",
      role: "customer",
      emailVerifiedAt: new Date(),
      phone: "(555) 204-1180",
      addressLine1: "418 Maple Street, Apt 3B",
      city: "Austin",
      state: "TX",
      zip: "78701",
    },
  });

  // Sample orders for John (money in cents). TX rate 6.25%, freight $450.
  const freight = 45000;
  // `lines` is an array of { sizeKey, heightKey, woodKey, baseDollars, deltaDollars, quantity }.
  // `createdAt` (optional) back-dates the order so the reports chart has history.
  function buildOrder(num, lines, statusIndex, createdAt) {
    const items = lines.map((l) => {
      const unit = (l.baseDollars + l.deltaDollars) * 100;
      return {
        sizeKey: l.sizeKey,
        heightKey: l.heightKey,
        woodKey: l.woodKey,
        label: `Apt.Bed — ${l.sizeKey} / ${l.heightKey} / ${l.woodKey}`,
        unitPrice: unit,
        quantity: l.quantity ?? 1,
        // Per-product status; defaults to the order's overall status.
        status: l.status ?? STATUSES[statusIndex],
      };
    });
    const subtotal = items.reduce((a, it) => a + it.unitPrice * it.quantity, 0);
    const tax = Math.round(subtotal * 0.0625);
    const total = subtotal + tax + freight;
    const history = STATUSES.slice(0, statusIndex + 1).map((st, i) => ({
      status: st,
      note: i === 0 ? "Order placed and paid." : null,
    }));
    return {
      orderNumber: num,
      userId: john.id,
      email: john.email,
      customerName: john.name,
      phone: john.phone,
      shipLine1: john.addressLine1,
      shipCity: john.city,
      shipState: john.state,
      shipZip: john.zip,
      subtotal,
      tax,
      freight,
      total,
      status: STATUSES[statusIndex],
      paymentStatus: "paid",
      ...(createdAt ? { createdAt } : {}),
      items: { create: items },
      payments: { create: [{ provider: "seed", amount: total, status: "succeeded", reference: "seed-demo" }] },
      history: { create: history },
    };
  }

  // Base prices used for back-dated demo orders (mirror BASE_PRICES/WOODS).
  const BASE = BASE_PRICES;
  const WOOD_DELTA = { oak: 0, maple: 150, walnut: 350 };
  const HEIGHTS_K = ["low", "medium", "high"];
  const SIZES_K = ["twin", "queen", "king"];
  const WOODS_K = ["oak", "maple", "walnut"];
  // Deterministic pseudo-variety without Math.random (keeps seeds reproducible).
  function pick(arr, n) {
    return arr[n % arr.length];
  }

  // Spread ~2–3 paid orders across each of the last 12 months so the reports
  // chart shows product volume + revenue for every month and size.
  const now = new Date();
  let histNum = 2000;
  for (let m = 11; m >= 0; m--) {
    const ordersThisMonth = 2 + (m % 2); // 2 or 3 orders
    // For the current month, never schedule an order past today.
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const maxDay = m === 0 ? now.getDate() : daysInMonth;
    for (let k = 0; k < ordersThisMonth; k++) {
      const day = 1 + ((m * 3 + k * 7) % Math.max(1, maxDay)); // 1..maxDay, never future
      const createdAt = new Date(now.getFullYear(), now.getMonth() - m, day, 9, 0, 0);
      if (createdAt.getTime() > now.getTime()) continue; // hard guard against future dates
      const sizeKey = pick(SIZES_K, m + k);
      const heightKey = pick(HEIGHTS_K, m + k + 1);
      const woodKey = pick(WOODS_K, k);
      const qty = 1 + ((m + k) % 2);
      const lines = [
        {
          sizeKey,
          heightKey,
          woodKey,
          baseDollars: BASE[sizeKey][heightKey],
          deltaDollars: WOOD_DELTA[woodKey],
          quantity: qty,
        },
      ];
      // Occasionally a second configuration in the same order.
      if (k === 1) {
        const s2 = pick(SIZES_K, m + 2);
        const h2 = pick(HEIGHTS_K, m);
        lines.push({
          sizeKey: s2,
          heightKey: h2,
          woodKey: "oak",
          baseDollars: BASE[s2][h2],
          deltaDollars: 0,
          quantity: 1,
        });
      }
      histNum += 1;
      await prisma.order.create({
        data: buildOrder(`VM-${histNum}`, lines, 4, createdAt),
      });
    }
  }

  await prisma.order.create({
    data: buildOrder("VM-1056", [{ sizeKey: "queen", heightKey: "medium", woodKey: "oak", baseDollars: 4600, deltaDollars: 0 }], 1),
  });
  // A multi-item order to demonstrate the cart (two configurations at once).
  await prisma.order.create({
    data: buildOrder(
      "VM-1055",
      [
        // Two products in one order, each at a different stage.
        { sizeKey: "king", heightKey: "high", woodKey: "walnut", baseDollars: 5600, deltaDollars: 350, status: "shipped" },
        { sizeKey: "twin", heightKey: "medium", woodKey: "oak", baseDollars: 3700, deltaDollars: 0, quantity: 2, status: "in_production" },
      ],
      2
    ),
  });
  const deliveredOrder = await prisma.order.create({
    data: buildOrder("VM-1054", [{ sizeKey: "twin", heightKey: "low", woodKey: "maple", baseDollars: 3500, deltaDollars: 150 }], 4),
  });

  // Sample reviews — a mix of approved/featured (shown on About) and pending (for admin moderation).
  await prisma.review.createMany({
    data: [
      {
        userId: john.id,
        orderId: deliveredOrder.id,
        authorName: "John Rivera",
        rating: 5,
        title: "Gave us our floor back",
        body: "We put the King in our guest room and suddenly it's a guest room AND an office. Solid wood, feels like it'll outlast us. Worth every dollar.",
        status: "approved",
        featured: true,
      },
      {
        authorName: "Dana P.",
        rating: 5,
        title: "Perfect for a small apartment",
        body: "I live in a 480 sq ft studio. The Apt.Bed is the only reason I have a real desk and a dresser. Assembly took an afternoon with the videos.",
        status: "approved",
        featured: true,
      },
      {
        authorName: "Marcus T.",
        rating: 4,
        title: "Great unit, plan your ceiling",
        body: "Measure your ceiling first — the height tool nailed it. Docked one star only because freight scheduling took a couple of calls.",
        status: "approved",
        featured: false,
      },
      {
        authorName: "Priya S.",
        rating: 5,
        title: "Dorm game-changer",
        body: "Furnished my daughter's dorm with the Twin. One piece, everything she needs. Pending photos to add later!",
        status: "pending",
        featured: false,
      },
    ],
  });

  console.log("Seed complete ✓");
  console.log("  Admin:    admin@apartmentloftbed.com / admin1234");
  console.log("  Customer: john.r@email.com / password");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
