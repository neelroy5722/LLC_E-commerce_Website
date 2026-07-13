/** Global site configuration and content used across pages. */

export const SITE = {
  name: "Victory Martin",
  legalName: "Victory Martin LLC",
  product: "Apt.Bed",
  domain: "victorymartin.com",
  tagline: "Five pieces of furniture in one unit. Zero wasted space.",
  patent: "U.S. Patent #11,553,800",
  email: "apt.bed@victorymartin.com",
  phone: "330-383-0712",
  origin: "Built in South Carolina, USA",
  originShort: "South Carolina, USA",
  material: "USA sourced hardwoods",
  fulfillment: "Built in South Carolina · Freight delivered",
  address: "Victory Martin LLC, United States",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/product", label: "Find Your Bed" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** The five pieces combined into a single Apt.Bed unit. */
export const INCLUDED_PIECES = [
  { name: "Bed", desc: "A full-size sleep platform sized to your mattress." },
  { name: "Closet", desc: "Plenty of storage for clothes and shoes." },
  { name: "Desk", desc: "A work surface that tucks away when not in use." },
  { name: "Chest of Drawers", desc: "Large drawers, the width of the bed." },
  { name: "Bed Table", desc: "A tabletop at the head of the bed, right within reach." },
];

export const AUDIENCES = [
  "Homeowners",
  "Apartments",
  "Small homes",
  "Universities",
  "Dormitories",
];

/** Order lifecycle, shared by the customer and (future) admin views. */
export const ORDER_STATUSES = [
  { id: "received", label: "Order Received", desc: "We've got your order and payment." },
  { id: "in-production", label: "In Production", desc: "Your Apt.Bed is being built." },
  { id: "ready-for-freight", label: "Ready for Freight", desc: "Built, inspected, and staged for pickup." },
  { id: "shipped", label: "Shipped", desc: "On a freight truck headed your way." },
  { id: "delivered", label: "Delivered", desc: "Delivered and ready to assemble." },
] as const;

export const FAQS = [
  {
    q: "What exactly is the Apt.Bed?",
    a: "The Apt.Bed is a modern single piece of furniture that consists of a bed, closet, desk, chest of drawers, bed table, and electrical availability for all your devices. It's engineered to give you a full bedroom suite using just a little more floor space than the mattress.",
  },
  {
    q: "How do I choose the right height?",
    a: "You choose the height of your Apt.Bed by figuring the ceiling height minus your sitting height. When you're sitting, the measurement from the seat to the top of your head is your sitting height. Subtract that from the room height, and you will have about how tall your bed should be. Then pick the bed that meets your needs.",
  },
  {
    q: "What sizes are available?",
    a: "There are three sizes: Twin/Twin Long, Queen, and King. With each of these are the height options — Low, Medium, and High.",
  },
  {
    q: "How is it shipped?",
    a: "Because the Apt.Bed is a large, freight-sized unit, it ships by freight carrier rather than standard parcel. A freight coordinator will contact you to schedule delivery, which is why we ask for a phone number at checkout.",
  },
  {
    q: "Do I have to assemble it?",
    a: "Yes. Every unit ships with clear instructions, and our website has step-by-step videos.",
  },
  {
    q: "How do I pay?",
    a: "Your payment is expected at the time of sale via a secure payment site. Taxes, if applicable, and shipping costs will be calculated then.",
  },
  {
    q: "Do you ship internationally?",
    a: "We are shipping within the United States at this time. Our intentions are to become global.",
  },
];
