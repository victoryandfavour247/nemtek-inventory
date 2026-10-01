"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/store/Store";
import { fmt, CATEGORIES, can, type CategoryKey } from "@/lib/inventory";
import Stat from "@/components/Stat";
import ItemImage from "@/components/ItemImage";

function isToday(iso: string) {
  const d = new Date(iso); const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export default function Dashboard() {
  const { items, sales, user } = useStore();

  const stats = useMemo(() => {
    const retail = items.reduce((s, i) => s + i.price * i.stock, 0);
    const costVal = items.reduce((s, i) => s + i.cost * i.stock, 0);
    const units = items.reduce((s, i) => s + i.stock, 0);
    const low = items.filter((i) => i.stock <= i.reorderLevel);
    const out = items.filter((i) => i.stock === 0);
    const today = sales.filter((s) => isToday(s.date));
    const todayRev = today.reduce((s, x) => s + x.total, 0);
    const todayProfit = today.reduce((s, x) => s + x.profit, 0);
    return { retail, costVal, units, low, out, today, todayRev, todayProfit };
  }, [items, sales]);

  const week = useMemo(() => {
    const days: { label: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const total = sales.filter((s) => { const t = new Date(s.date); return t >= d && t < next; }).reduce((a, b) => a + b.total, 0);
      days.push({ label: d.toLocaleDateString("en-GB", { weekday: "short" }), total });
    }
    return days;
  }, [sales]);
  const weekMax = Math.max(1, ...week.map((d) => d.total));

  const byCategory = useMemo(() => {
    const m = new Map<CategoryKey, number>();
    items.forEach((i) => m.set(i.category, (m.get(i.category) ?? 0) + i.stock));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [items]);

  const showCost = user ? can.viewCost(user.role) : false;

  return (
    <div className="reveal space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Today's revenue" value={fmt(stats.todayRev)} sub={`${stats.today.length} sales today`} color="var(--green)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} />
        {showCost && <Stat label="Today's profit" value={fmt(stats.todayProfit)} sub="After cost of goods" color="var(--purple)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18M7 14l4-4 3 3 5-6"/></svg>} />}
        <Stat label="Stock value (retail)" value={fmt(stats.retail)} sub={`${stats.units.toLocaleString()} units on hand`} color="var(--blue)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/></svg>} />
        <Stat label="Low stock" value={String(stats.low.length)} sub={`${stats.out.length} out of stock`} color="var(--red)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Sales — last 7 days</h2>
            <span className="text-sm text-[var(--text-soft)]">Total {fmt(week.reduce((a, b) => a + b.total, 0))}</span>
          </div>
          <div className="flex h-48 items-end gap-3">
            {week.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-lg transition-all" style={{ height: `${(d.total / weekMax) * 100}%`, minHeight: d.total > 0 ? 6 : 2, background: d.total > 0 ? "linear-gradient(180deg,var(--blue),var(--navy))" : "var(--surface-2)" }} title={fmt(d.total)} />
                </div>
                <span className="text-[11px] text-[var(--text-faint)]">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-bold">Stock by category</h2>
          <div className="space-y-3">
            {byCategory.map(([c, n]) => {
              const max = byCategory[0][1];
              return (
                <div key={c}>
                  <div className="mb-1 flex justify-between text-xs"><span className="font-medium">{CATEGORIES[c].label}</span><span className="text-[var(--text-faint)]">{n}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full" style={{ width: `${(n / max) * 100}%`, background: "var(--blue)" }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">⚠ Needs restocking</h2>
            <Link href="/inventory" className="text-sm font-semibold text-[var(--blue)]">Manage →</Link>
          </div>
          {stats.low.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--text-soft)]">Everything is well stocked 🎉</p>
          ) : (
            <div className="space-y-2">
              {stats.low.slice(0, 6).map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <ItemImage item={i} className="h-10 w-10 shrink-0 rounded-lg border" />
                  <div className="min-w-0 flex-1"><div className="line-clamp-1 text-sm font-semibold">{i.name}</div><div className="text-xs text-[var(--text-faint)]">{i.sku}</div></div>
                  <span className={`pill ${i.stock === 0 ? "pill-red" : "pill-amber"}`}>{i.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Recent sales</h2>
            <Link href="/sales" className="text-sm font-semibold text-[var(--blue)]">All sales →</Link>
          </div>
          {sales.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--text-soft)]">No sales yet. <Link href="/pos" className="font-semibold text-[var(--blue)]">Make the first sale →</Link></p>
          ) : (
            <div className="space-y-2">
              {sales.slice(0, 6).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div><div className="font-semibold">{s.customer}</div><div className="text-xs text-[var(--text-faint)]">{s.items.length} items · {s.cashierName.split(" ")[0]} · {new Date(s.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div></div>
                  <span className="font-bold">{fmt(s.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
