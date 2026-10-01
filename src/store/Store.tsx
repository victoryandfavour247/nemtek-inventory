"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  seedInventory, seedWorkers, seedSuppliers, hashPw,
  type InventoryItem, type Worker, type Supplier, type Movement, type MovementType,
  type PurchaseOrder, type POLine,
} from "@/lib/inventory";

interface Toast { id: number; msg: string; type: "success" | "error" | "info"; }

interface Ctx {
  ready: boolean;
  items: InventoryItem[];
  workers: Worker[];
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  movements: Movement[];
  user: Worker | null;
  toasts: Toast[];
  // auth
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  // inventory master
  upsertItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  // stock movements
  moveStock: (id: string, type: MovementType, qty: number, note: string) => void;
  setStock: (id: string, newStock: number, note: string) => void;
  // suppliers
  upsertSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
  // purchasing
  createPO: (po: Omit<PurchaseOrder, "id" | "date" | "createdBy">) => PurchaseOrder;
  updatePO: (po: PurchaseOrder) => void;
  receivePO: (id: string) => void;
  deletePO: (id: string) => void;
  // workers
  upsertWorker: (w: Worker) => void;
  deleteWorker: (id: string) => void;
  // misc
  toast: (msg: string, type?: Toast["type"]) => void;
  dismissToast: (id: number) => void;
}

const C = createContext<Ctx | null>(null);
const K = { items: "nti.v3.items", workers: "nti.v3.workers", suppliers: "nti.v3.suppliers", orders: "nti.v3.orders", moves: "nti.v3.moves", user: "nti.v3.user" };

function read<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) as T : fb; } catch { return fb; }
}
function write(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const uid = (p: string) => p + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();

export function Store({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [user, setUser] = useState<Worker | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setItems(read(K.items, seedInventory()));
    setWorkers(read(K.workers, seedWorkers()));
    setSuppliers(read(K.suppliers, seedSuppliers()));
    setOrders(read(K.orders, []));
    setMovements(read(K.moves, []));
    setUser(read<Worker | null>(K.user, null));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) write(K.items, items); }, [items, ready]);
  useEffect(() => { if (ready) write(K.workers, workers); }, [workers, ready]);
  useEffect(() => { if (ready) write(K.suppliers, suppliers); }, [suppliers, ready]);
  useEffect(() => { if (ready) write(K.orders, orders); }, [orders, ready]);
  useEffect(() => { if (ready) write(K.moves, movements); }, [movements, ready]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((msg: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => dismissToast(id), 2600);
  }, [dismissToast]);

  /* ---- auth ---- */
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
    const w: Worker = { id: uid("u"), name: name.trim(), email: key, password: hashPw(password), role: "staff", active: true };
    setWorkers((prev) => [...prev, w]); setUser(w); write(K.user, w);
    toast(`Account created — welcome, ${w.name.split(" ")[0]}!`);
    return { ok: true };
  }, [workers, toast]);

  const logout = useCallback(() => { setUser(null); write(K.user, null); }, []);

  /* ---- movements ---- */
  const addMovement = useCallback((m: Omit<Movement, "id" | "date" | "byName">) => {
    setMovements((prev) => [{ ...m, id: uid("MV"), date: new Date().toISOString(), byName: user?.name ?? "System" }, ...prev]);
  }, [user]);

  const moveStock = useCallback((id: string, type: MovementType, qty: number, note: string) => {
    if (qty <= 0) { toast("Enter a quantity greater than zero", "error"); return; }
    const it = items.find((i) => i.id === id); if (!it) return;
    if (type === "issue" && qty > it.stock) { toast("Not enough stock to issue", "error"); return; }
    const delta = type === "issue" ? -qty : qty;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i));
    addMovement({ itemId: id, itemName: it.name, type, qty: delta, note });
    toast(type === "receive" ? `+${qty} received` : type === "issue" ? `${qty} issued out` : "Stock updated");
  }, [items, addMovement, toast]);

  const setStock = useCallback((id: string, newStock: number, note: string) => {
    const it = items.find((i) => i.id === id); if (!it) return;
    const diff = Math.max(0, newStock) - it.stock;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stock: Math.max(0, newStock) } : i));
    addMovement({ itemId: id, itemName: it.name, type: "adjust", qty: diff, note: note || "Stock count correction" });
    toast("Stock adjusted");
  }, [items, addMovement, toast]);

  /* ---- master ---- */
  const upsertItem = useCallback((item: InventoryItem) => {
    setItems((prev) => prev.some((i) => i.id === item.id) ? prev.map((i) => i.id === item.id ? item : i) : [{ ...item }, ...prev]);
    toast("Product saved");
  }, [toast]);
  const deleteItem = useCallback((id: string) => { setItems((prev) => prev.filter((i) => i.id !== id)); toast("Product removed", "info"); }, [toast]);

  /* ---- suppliers ---- */
  const upsertSupplier = useCallback((s: Supplier) => {
    setSuppliers((prev) => prev.some((x) => x.id === s.id) ? prev.map((x) => x.id === s.id ? s : x) : [...prev, s]);
    toast("Supplier saved");
  }, [toast]);
  const deleteSupplier = useCallback((id: string) => { setSuppliers((prev) => prev.filter((x) => x.id !== id)); toast("Supplier removed", "info"); }, [toast]);

  /* ---- purchasing ---- */
  const createPO = useCallback((po: Omit<PurchaseOrder, "id" | "date" | "createdBy">) => {
    const order: PurchaseOrder = { ...po, id: uid("PO"), date: new Date().toISOString(), createdBy: user?.name ?? "System" };
    setOrders((prev) => [order, ...prev]);
    toast(`Purchase order ${order.id} created`);
    return order;
  }, [user, toast]);
  const updatePO = useCallback((po: PurchaseOrder) => { setOrders((prev) => prev.map((o) => o.id === po.id ? po : o)); }, []);
  const deletePO = useCallback((id: string) => { setOrders((prev) => prev.filter((o) => o.id !== id)); toast("Purchase order deleted", "info"); }, [toast]);

  const receivePO = useCallback((id: string) => {
    const po = orders.find((o) => o.id === id); if (!po || po.status === "received") return;
    setItems((prev) => prev.map((i) => {
      const line = po.lines.find((l) => l.itemId === i.id);
      return line ? { ...i, stock: i.stock + line.qty, cost: line.cost || i.cost } : i;
    }));
    const now = new Date().toISOString();
    setMovements((prev) => [
      ...po.lines.map((l) => {
        const it = items.find((i) => i.id === l.itemId);
        return { id: uid("MV"), date: now, itemId: l.itemId, itemName: it?.name ?? l.itemId, type: "receive" as const, qty: l.qty, note: `PO ${po.id}`, byName: user?.name ?? "System" };
      }),
      ...prev,
    ]);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "received", receivedDate: now } : o));
    toast(`Received ${po.lines.reduce((s, l) => s + l.qty, 0)} units from PO ${po.id}`);
  }, [orders, items, user, toast]);

  /* ---- workers ---- */
  const upsertWorker = useCallback((w: Worker) => {
    setWorkers((prev) => prev.some((x) => x.id === w.id) ? prev.map((x) => x.id === w.id ? w : x) : [...prev, w]);
    toast("Team member saved");
  }, [toast]);
  const deleteWorker = useCallback((id: string) => { setWorkers((prev) => prev.filter((x) => x.id !== id)); toast("Team member removed", "info"); }, [toast]);

  const value: Ctx = useMemo(() => ({
    ready, items, workers, suppliers, orders, movements, user, toasts,
    login, signUp, logout, upsertItem, deleteItem, moveStock, setStock,
    upsertSupplier, deleteSupplier, createPO, updatePO, receivePO, deletePO,
    upsertWorker, deleteWorker, toast, dismissToast,
  }), [ready, items, workers, suppliers, orders, movements, user, toasts, login, signUp, logout, upsertItem, deleteItem, moveStock, setStock, upsertSupplier, deleteSupplier, createPO, updatePO, receivePO, deletePO, upsertWorker, deleteWorker, toast, dismissToast]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useStore() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useStore must be used within Store");
  return ctx;
}

export type { POLine };
