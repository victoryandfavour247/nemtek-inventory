/* ==========================================================================
   NEMTEK Inventory — domain model & seed data
   Built on the shared product catalogue (products.ts).
   ========================================================================== */
import { PRODUCTS, CATEGORIES, type Brand, type CategoryKey } from "./products";

export type { Brand, CategoryKey };
export { CATEGORIES };

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  brand: Brand;
  category: CategoryKey;
  cost: number;        // what the company pays
  price: number;       // selling price (GH₵)
  stock: number;       // units on hand
  reorderLevel: number; // low-stock threshold
  supplier: string;
  location: string;    // shelf/bin
}

export type Role = "owner" | "manager" | "cashier";

export interface Worker {
  id: string;
  name: string;
  email: string;
  password: string;   // stored hashed (see hashPw)
  role: Role;
  active: boolean;
}

/* lightweight non-crypto hash — demo only, so we never store a raw password */
export function hashPw(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

export interface SaleLine {
  id: string;
  name: string;
  price: number;
  qty: number;
}
export interface Sale {
  id: string;
  date: string;
  cashierId: string;
  cashierName: string;
  customer: string;
  items: SaleLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: "cash" | "mobile-money" | "card";
  profit: number;
}

export type MovementType = "restock" | "sale" | "adjust";
export interface Movement {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  qty: number;       // +in / -out
  note: string;
  byName: string;
}

/* ----------------------------- seeds ----------------------------- */
const supplierFor = (brand: Brand) =>
  brand === "NEMTEK" ? "NEMTEK Distribution (SA)" : "Centurion Systems (Pty) Ltd";

const aisle = (c: CategoryKey) => {
  const map: Record<CategoryKey, string> = {
    energizers: "A1", keypads: "A2", "wire-cable": "B1", "gate-motors": "C1",
    "access-control": "C2", boards: "C3", remotes: "D1", power: "D2",
    "lighting-alarm": "E1", "gate-contacts": "E2", signage: "F1", accessories: "F2",
  };
  return map[c] ?? "G1";
};

export function seedInventory(): InventoryItem[] {
  return PRODUCTS.map((p, i) => {
    const cost = Math.round((p.price * (p.price > 1000 ? 0.74 : 0.6)) / 5) * 5;
    const num = String(i + 1).padStart(3, "0");
    const prefix = p.brand === "NEMTEK" ? "NT" : "CT";
    return {
      id: p.id,
      sku: `${prefix}-${p.category.slice(0, 3).toUpperCase()}-${num}`,
      name: p.name,
      brand: p.brand,
      category: p.category,
      cost,
      price: p.price,
      stock: p.stock,
      reorderLevel: p.price > 3000 ? 3 : p.stock > 100 ? 25 : 6,
      supplier: supplierFor(p.brand),
      location: `${aisle(p.category)}-${num}`,
    };
  });
}

/* demo credentials (plaintext) — shown on the login screen for convenience */
export const DEMO_CREDS = [
  { name: "Dennis (Owner)", email: "owner@nemtek.gh", password: "owner123", role: "owner" as Role },
  { name: "Ama Boateng", email: "ama@nemtek.gh", password: "manager123", role: "manager" as Role },
  { name: "Kofi Mensah", email: "kofi@nemtek.gh", password: "cashier123", role: "cashier" as Role },
];

export function seedWorkers(): Worker[] {
  return DEMO_CREDS.map((d, i) => ({
    id: ["u-owner", "u-mgr", "u-cash"][i],
    name: d.name, email: d.email, password: hashPw(d.password), role: d.role, active: true,
  }));
}

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner", manager: "Manager", cashier: "Cashier",
};

/* role permissions */
export const can = {
  manageWorkers: (r: Role) => r === "owner",
  viewReports: (r: Role) => r === "owner" || r === "manager",
  editInventory: (r: Role) => r === "owner" || r === "manager",
  deleteInventory: (r: Role) => r === "owner",
  sell: (_r: Role) => true,
  viewCost: (r: Role) => r === "owner" || r === "manager",
};

export const fmt = (n: number) =>
  "GH₵ " + n.toLocaleString("en-GH", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
