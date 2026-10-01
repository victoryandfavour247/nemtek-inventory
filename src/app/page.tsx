"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/store/Store";
import { fmt, CATEGORIES, can, MOVEMENT_META, type CategoryKey } from "@/lib/inventory";
import Stat from "@/components/Stat";
import ItemImage from "@/components/ItemImage";

export default function Dashboard() {
  const { items, movements, orders, user } = useStore();
  const showCost = user ? can.viewCost(user.role) : false;
  const purchasing = user ? can.managePurchasing(user.role) : false;

  const s = useMemo(() => {
    const costVal = items.reduce((a, i) => a + i.cost * i.stock, 0);
    const retailVal = items.reduce((a, i) => a + i.price * i.stock, 0);
    const units = items.reduce((a, i) => a + i.stock, 0);
    const low = items.filter((i) => i.stock > 0 && i.stock <= i.reorderLevel);
    const out = items.filter((i) => i.stock === 0);
    const pendingPO = orders.filter((o) => o.status !== "received").length;
    return { costVal, retailVal, units, low, out, pendingPO, margin: retailVal - costVal };
  }, [items, orders]);

  const byCategory = useMemo(() => {
    const m = new Map<CategoryKey, number>();
    items.forEach((i) => m.set(i.category, (m.get(i.category) ?? 0) + (showCost ? i.cost : i.price) * i.stock));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [items, showCost]);
  const catMax = Math.max(1, ...byCategory.map((c) => c[1]));

  const reorder = [...s.low, ...s.out].sort((a, b) => a.stock - b.stock).slice(0, 6);

  return (
    <div className="reveal space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {showCost ? (
          <Stat label="Inventory value (cost)" value={fmt(s.costVal)} sub={`${s.units.toLocaleString()} units · ${items.length} SKUs`} color="var(--blue)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/></svg>} />
        ) : (
          <Stat label="Products in stock" value={items.length.toString()} sub={`${s.units.toLocaleString()} units on hand`} color="var(--blue)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/></svg>} />
        )}
        <Stat label="Retail value" value={fmt(s.retailVal)} sub={showCost ? `Potential margin ${fmt(s.margin)}` : `${items.length} SKUs`} color="var(--green)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} />
        <Stat label="Low stock" value={String(s.low.length)} sub="At or below reorder level" color="var(--amber)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>} />
        <Stat label="Out of stock" value={String(s.out.length)} sub={purchasing ? `${s.pendingPO} open purchase orders` : "Items at zero"} color="var(--red)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.9 4.9l14.2 14.2M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* value by category */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">{showCost ? "Stock value by category (cost)" : "Stock by category (retail)"}</h2>
            <Link href="/reports" className="text-sm font-semibold text-[var(--blue)]">Reports →</Link>
          </div>
          <div className="space-y-3">
            {byCategory.map(([c, v]) => (
              <div key={c}>
                <div className="mb-1 flex justify-between text-xs"><span className="font-medium">{CATEGORIES[c].label}</span><span className="text-[var(--text-faint)]">{fmt(v)}</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full" style={{ width: `${(v / catMax) * 100}%`, background: "linear-gradient(90deg,var(--blue),var(--navy))" }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* recent movements */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Recent activity</h2>
            <Link href="/movements" className="text-sm font-semibold text-[var(--blue)]">All →</Link>
          </div>
          {movements.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-soft)]">No stock movements yet.</p>
          ) : (
            <div className="space-y-2.5">
              {movements.slice(0, 7).map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <span className={`pill ${MOVEMENT_META[m.type].pill} !px-2`}>{m.qty > 0 ? "+" : ""}{m.qty}</span>
                  <span className="line-clamp-1 flex-1">{m.itemName}</span>
                  <span className="text-[11px] text-[var(--text-faint)]">{new Date(m.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* reorder */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">⚠ Reorder suggestions</h2>
          <Link href="/inventory?filter=low" className="text-sm font-semibold text-[var(--blue)]">Manage stock →</Link>
        </div>
        {reorder.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-soft)]">Everything is above its reorder level 🎉</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reorder.map((i) => (
              <div key={i.id} className="flex items-center gap-3 rounded-xl border p-2.5" style={{ borderColor: "var(--border)" }}>
                <ItemImage item={i} className="h-12 w-12 shrink-0 rounded-lg border" />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-semibold">{i.name}</div>
                  <div className="text-xs text-[var(--text-faint)]">Reorder {i.reorderQty} · level {i.reorderLevel}</div>
                </div>
                <span className={`pill ${i.stock === 0 ? "pill-red" : "pill-amber"}`}>{i.stock} left</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
