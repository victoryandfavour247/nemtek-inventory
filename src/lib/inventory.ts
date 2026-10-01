/* ==========================================================================
   NEMTEK — Advanced Inventory Management: domain model & seed data
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
  cost: number;         // unit cost (GH₵)
  price: number;        // retail / list value (GH₵)
  stock: number;        // units on hand
  reorderLevel: number; // low-stock threshold
  reorderQty: number;   // suggested reorder quantity
  supplierId: string;
  location: string;     // shelf / bin
  barcode: string;
  image?: string;       // optional uploaded photo (data URL); falls back to catalogue art
}

export type Role = "owner" | "manager" | "staff";

export interface Worker {
  id: string; name: string; email: string; password: string; role: Role; active: boolean;
}

export function hashPw(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

export interface Supplier {
  id: string; name: string; contact: string; phone: string; email: string; leadDays: number;
}

export type MovementType = "receive" | "issue" | "adjust";
export interface Movement {
  id: string; date: string; itemId: string; itemName: string;
  type: MovementType; qty: number; note: string; byName: string;
}

export type POStatus = "draft" | "ordered" | "received";
export interface POLine { itemId: string; qty: number; cost: number; }
export interface PurchaseOrder {
  id: string; supplierId: string; date: string; expected: string;
  status: POStatus; lines: POLine[]; note: string; createdBy: string; receivedDate?: string;
}

/* ----------------------------- seeds ----------------------------- */
export function seedSuppliers(): Supplier[] {
  return [
    { id: "sup-nemtek", name: "NEMTEK Distribution (SA)", contact: "Johan Pretorius", phone: "+27 11 462 8283", email: "sales@nemtek.com", leadDays: 14 },
    { id: "sup-centurion", name: "Centurion Systems (Pty) Ltd", contact: "Thabo Nkosi", phone: "+27 11 699 2400", email: "orders@centsys.co.za", leadDays: 18 },
    { id: "sup-local", name: "Accra Security Wholesale", contact: "Yaw Owusu", phone: "+233 30 222 1100", email: "info@accrasec.gh", leadDays: 3 },
  ];
}

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
      name: p.name, brand: p.brand, category: p.category,
      cost, price: p.price, stock: p.stock,
      reorderLevel: p.price > 3000 ? 3 : p.stock > 100 ? 25 : 6,
      reorderQty: p.price > 3000 ? 5 : p.stock > 100 ? 100 : 20,
      supplierId: p.brand === "NEMTEK" ? "sup-nemtek" : "sup-centurion",
      location: `${aisle(p.category)}-${num}`,
      barcode: "60" + String(10000000 + i * 137).slice(0, 8) + String((i * 7) % 10),
    };
  });
}

export const DEMO_CREDS = [
  { name: "Dennis (Owner)", email: "owner@nemtek.gh", password: "owner123", role: "owner" as Role },
  { name: "Ama Boateng", email: "ama@nemtek.gh", password: "manager123", role: "manager" as Role },
  { name: "Kofi Mensah", email: "kofi@nemtek.gh", password: "staff123", role: "staff" as Role },
];

export function seedWorkers(): Worker[] {
  return DEMO_CREDS.map((d, i) => ({
    id: ["u-owner", "u-mgr", "u-staff"][i],
    name: d.name, email: d.email, password: hashPw(d.password), role: d.role, active: true,
  }));
}

export const ROLE_LABEL: Record<Role, string> = { owner: "Owner", manager: "Manager", staff: "Storekeeper" };

/* role permissions */
export const can = {
  manageWorkers: (r: Role) => r === "owner",
  viewReports: (r: Role) => Boolean(r),                             // reports available to every signed-in user
  editInventory: (r: Role) => Boolean(r),                           // any signed-in user can add/edit products
  deleteInventory: (r: Role) => r === "owner" || r === "manager",   // removing products restricted
  moveStock: (r: Role) => Boolean(r),                               // receive / issue / adjust
  managePurchasing: (r: Role) => Boolean(r),                        // POs & suppliers available to storekeepers too
  viewCost: (r: Role) => Boolean(r),                                // valuation is part of advanced inventory
};

export const fmt = (n: number) =>
  "GH₵ " + Math.round(n).toLocaleString("en-GH");
export const fmt2 = (n: number) =>
  "GH₵ " + n.toLocaleString("en-GH", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });

export const MOVEMENT_META: Record<MovementType, { label: string; pill: string; verb: string }> = {
  receive: { label: "Received", pill: "pill-green", verb: "Stock received" },
  issue: { label: "Issued", pill: "pill-blue", verb: "Stock issued out" },
  adjust: { label: "Adjusted", pill: "pill-amber", verb: "Stock adjusted" },
};
