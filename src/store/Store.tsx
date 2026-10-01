"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  seedInventory, seedWorkers, hashPw,
  type InventoryItem, type Worker, type Sale, type SaleLine, type Movement, type Role,
} from "@/lib/inventory";

interface Toast { id: number; msg: string; type: "success" | "error" | "info"; }
interface POSLine { id: string; qty: number; }

interface Ctx {
  ready: boolean;
  items: InventoryItem[];
  workers: Worker[];
  sales: Sale[];
  movements: Movement[];
  user: Worker | null;
  toasts: Toast[];
  // auth
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  // inventory
  upsertItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  restock: (id: string, qty: number, note?: string) => void;
  adjustStock: (id: string, newStock: number, note: string) => void;
  // workers
  upsertWorker: (w: Worker) => void;
  deleteWorker: (id: string) => void;
  // pos
  recordSale: (args: { lines: POSLine[]; customer: string; discount: number; payment: Sale["payment"] }) => Sale | null;
  // misc
  toast: (msg: string, type?: Toast["type"]) => void;
  dismissToast: (id: number) => void;
}

const C = createContext<Ctx | null>(null);
const K = { items: "nti.v2.items", workers: "nti.v2.workers", sales: "nti.v2.sales", moves: "nti.v2.moves", user: "nti.v2.user" };

function read<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) as T : fb; } catch { return fb; }
}
function write(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const uid = (p: string) => p + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
const TAX_RATE = 0; // set e.g. 0.15 for VAT

export function Store({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [user, setUser] = useState<Worker | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setItems(read(K.items, seedInventory()));
    setWorkers(read(K.workers, seedWorkers()));
    setSales(read(K.sales, []));
    setMovements(read(K.moves, []));
    setUser(read<Worker | null>(K.user, null));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) write(K.items, items); }, [items, ready]);
  useEffect(() => { if (ready) write(K.workers, workers); }, [workers, ready]);
  useEffect(() => { if (ready) write(K.sales, sales); }, [sales, ready]);
  useEffect(() => { if (ready) write(K.moves, movements); }, [movements, ready]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((msg: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => dismissToast(id), 2600);
  }, [dismissToast]);

  const login = useCallback((email: string, password: string) => {
    const w = workers.find((x) => x.email.toLowerCase() === email.toLowerCase().trim());
    if (!w) return { ok: false, error: "No account found with that email." };
    if (!w.active) return { ok: false, error: "This account has been disabled. Contact the owner." };
    if (w.password !== hashPw(password)) return { ok: false, error: "Incorrect password." };
    setUser(w); write(K.user, w); toast(`Welcome, ${w.name.split(" ")[0]}!`);
    return { ok: true };
  }, [workers, toast]);

  const signUp = useCallback((name: string, email: string, password: string) => {
    const key = email.toLowerCase().trim();
    if (!name.trim()) return { ok: false, error: "Enter your full name." };
    if (!/^\S+@\S+\.\S+$/.test(key)) return { ok: false, error: "Enter a valid email." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    if (workers.some((x) => x.email.toLowerCase() === key)) return { ok: false, error: "An account with this email already exists." };
    const w: Worker = { id: "u-" + Math.random().toString(36).slice(2, 8), name: name.trim(), email: key, password: hashPw(password), role: "cashier", active: true };
    setWorkers((prev) => [...prev, w]);
    setUser(w); write(K.user, w);
    toast(`Account created — welcome, ${w.name.split(" ")[0]}!`);
    return { ok: true };
  }, [workers, toast]);

  const logout = useCallback(() => { setUser(null); write(K.user, null); }, []);

  const addMovement = useCallback((m: Omit<Movement, "id" | "date" | "byName">) => {
    setMovements((prev) => [{ ...m, id: uid("MV"), date: new Date().toISOString(), byName: user?.name ?? "System" }, ...prev]);
  }, [user]);

  const upsertItem = useCallback((item: InventoryItem) => {
    setItems((prev) => prev.some((i) => i.id === item.id) ? prev.map((i) => i.id === item.id ? item : i) : [item, ...prev]);
    toast("Product saved");
  }, [toast]);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast("Product removed", "info");
  }, [toast]);

  const restock = useCallback((id: string, qty: number, note = "Stock received") => {
    if (qty <= 0) return;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stock: i.stock + qty } : i));
    const it = items.find((i) => i.id === id);
    if (it) addMovement({ itemId: id, itemName: it.name, type: "restock", qty, note });
    toast(`+${qty} added to stock`);
  }, [items, addMovement, toast]);

  const adjustStock = useCallback((id: string, newStock: number, note: string) => {
    const it = items.find((i) => i.id === id); if (!it) return;
    const diff = newStock - it.stock;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stock: Math.max(0, newStock) } : i));
    addMovement({ itemId: id, itemName: it.name, type: "adjust", qty: diff, note });
    toast("Stock adjusted");
  }, [items, addMovement, toast]);

  const upsertWorker = useCallback((w: Worker) => {
    setWorkers((prev) => prev.some((x) => x.id === w.id) ? prev.map((x) => x.id === w.id ? w : x) : [...prev, w]);
    toast("Team member saved");
  }, [toast]);
  const deleteWorker = useCallback((id: string) => {
    setWorkers((prev) => prev.filter((x) => x.id !== id)); toast("Team member removed", "info");
  }, [toast]);

  const recordSale = useCallback(({ lines, customer, discount, payment }: { lines: POSLine[]; customer: string; discount: number; payment: Sale["payment"] }) => {
    if (!user) { toast("Sign in first", "error"); return null; }
    if (lines.length === 0) { toast("Cart is empty", "error"); return null; }
    // validate stock
    for (const l of lines) {
      const it = items.find((i) => i.id === l.id);
      if (!it || it.stock < l.qty) { toast(`Not enough stock for ${it?.name ?? "item"}`, "error"); return null; }
    }
    const saleLines: SaleLine[] = lines.map((l) => {
      const it = items.find((i) => i.id === l.id)!;
      return { id: it.id, name: it.name, price: it.price, qty: l.qty };
    });
    const subtotal = saleLines.reduce((s, l) => s + l.price * l.qty, 0);
    const taxed = Math.max(0, subtotal - discount);
    const tax = Math.round(taxed * TAX_RATE);
    const total = taxed + tax;
    const cost = lines.reduce((s, l) => { const it = items.find((i) => i.id === l.id)!; return s + it.cost * l.qty; }, 0);
    const profit = taxed - cost;

    const sale: Sale = {
      id: uid("SALE"), date: new Date().toISOString(), cashierId: user.id, cashierName: user.name,
      customer: customer.trim() || "Walk-in customer", items: saleLines, subtotal, discount, tax, total, payment, profit,
    };
    setSales((prev) => [sale, ...prev]);
    // decrement stock + movements
    setItems((prev) => prev.map((i) => {
      const l = lines.find((x) => x.id === i.id);
      return l ? { ...i, stock: i.stock - l.qty } : i;
    }));
    setMovements((prev) => [
      ...saleLines.map((l) => ({ id: uid("MV"), date: sale.date, itemId: l.id, itemName: l.name, type: "sale" as const, qty: -l.qty, note: `Sale ${sale.id}`, byName: user.name })),
      ...prev,
    ]);
    toast(`Sale complete · ${sale.id}`);
    return sale;
  }, [user, items, toast]);

  const value: Ctx = useMemo(() => ({
    ready, items, workers, sales, movements, user, toasts,
    login, signUp, logout, upsertItem, deleteItem, restock, adjustStock,
    upsertWorker, deleteWorker, recordSale, toast, dismissToast,
  }), [ready, items, workers, sales, movements, user, toasts, login, signUp, logout, upsertItem, deleteItem, restock, adjustStock, upsertWorker, deleteWorker, recordSale, toast, dismissToast]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useStore() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useStore must be used within Store");
  return ctx;
}

export type { POSLine, Role };
