/**
 * Mock data for the static Customer Account and Admin Panel shells (Milestone 1).
 * Milestone 2 replaces this with real database queries; the UI reads from here
 * so swapping the source later is a one-file change.
 */
import type { SizeId, HeightId, WoodId } from "./products";

export interface MockOrder {
  id: string;
  date: string;
  customer: string;
  email: string;
  size: SizeId;
  height: HeightId;
  wood: WoodId;
  total: number;
  /** Index into ORDER_STATUSES. */
  statusIndex: number;
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "VM-1056",
    date: "Jun 24, 2026",
    customer: "John Rivera",
    email: "john.r@email.com",
    size: "queen",
    height: "medium",
    wood: "oak",
    total: 4600,
    statusIndex: 1,
  },
  {
    id: "VM-1055",
    date: "Jun 21, 2026",
    customer: "Amara Osei",
    email: "amara@email.com",
    size: "king",
    height: "high",
    wood: "walnut",
    total: 5950,
    statusIndex: 3,
  },
  {
    id: "VM-1054",
    date: "Jun 18, 2026",
    customer: "Priya Shah",
    email: "priya.s@email.com",
    size: "twin",
    height: "low",
    wood: "maple",
    total: 3650,
    statusIndex: 4,
  },
  {
    id: "VM-1053",
    date: "Jun 15, 2026",
    customer: "Diego Marquez",
    email: "diego.m@email.com",
    size: "twin",
    height: "medium",
    wood: "oak",
    total: 3700,
    statusIndex: 2,
  },
  {
    id: "VM-1052",
    date: "Jun 12, 2026",
    customer: "Sara Lindqvist",
    email: "sara.l@email.com",
    size: "queen",
    height: "high",
    wood: "maple",
    total: 5050,
    statusIndex: 0,
  },
];

/** The signed-in customer's own orders (for the account shell). */
export const CUSTOMER_ORDERS: MockOrder[] = [MOCK_ORDERS[0], MOCK_ORDERS[2]];

export const MOCK_CUSTOMER = {
  name: "John Rivera",
  email: "john.r@email.com",
  phone: "(555) 204-1180",
  address: {
    line1: "418 Maple Street, Apt 3B",
    city: "Austin",
    state: "TX",
    zip: "78701",
  },
};

export const MOCK_CUSTOMERS = [
  { name: "John Rivera", email: "john.r@email.com", orders: 2, spent: 8250 },
  { name: "Amara Osei", email: "amara@email.com", orders: 1, spent: 5950 },
  { name: "Priya Shah", email: "priya.s@email.com", orders: 1, spent: 3650 },
  { name: "Diego Marquez", email: "diego.m@email.com", orders: 3, spent: 12100 },
  { name: "Sara Lindqvist", email: "sara.l@email.com", orders: 1, spent: 5050 },
];

export const ADMIN_STATS = {
  todaySales: 4600,
  monthlyRevenue: 68420,
  openOrders: 3,
  completedOrders: 41,
  bestSize: "Queen",
};
