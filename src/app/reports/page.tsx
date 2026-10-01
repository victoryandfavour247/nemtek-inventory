"use client";
import { useMemo } from "react";
import { useStore } from "@/store/Store";
import { fmt, can, CATEGORIES, type CategoryKey } from "@/lib/inventory";
import Stat from "@/components/Stat";

export default function Reports() {
  const { sales, items, user } = useStore();
  const role = user!.role;

  const data = useMemo(() => {
    const revenue = sales.reduce((s, x) => s + x.total, 0);
    const profit = sales.reduce((s, x) => s + x.profit, 0);
    const units = sales.reduce((s, x) => s + x.items.reduce((a, b) => a + b.qty, 0), 0);
    const aov = sales.length ? revenue / sales.length : 0;

    const prodMap = new Map<string, { name: string; qty: number; rev: number }>();
    const catMap = new Map<CategoryKey, number>();
    const payMap = new Map<string, number>();
    const itemCat = new Map(items.map((i) => [i.id, i.category]));
    sales.forEach((s) => {
      payMap.set(s.payment, (payMap.get(s.payment) ?? 0) + s.total);
      s.items.forEach((l) => {
        const p = prodMap.get(l.id) ?? { name: l.name, qty: 0, rev: 0 };
        p.qty += l.qty; p.rev += l.price * l.qty; prodMap.set(l.id, p);
        const c = itemCat.get(l.id); if (c) catMap.set(c, (catMap.get(c) ?? 0) + l.price * l.qty);
      });
    });
    const topProducts = [...prodMap.values()].sort((a, b) => b.rev - a.rev).slice(0, 8);
    const byCat = [...catMap.entries()].sort((a, b) => b[1] - a[1]);
    const byPay = [...payMap.entries()].sort((a, b) => b[1] - a[1]);
    return { revenue, profit, units, aov, topProducts, byCat, byPay };
  }, [sales, items]);

  if (!can.viewReports(role)) {
    return <div className="card p-10 text-center"><p className="text-lg font-bold">Reports are restricted</p><p className="mt-1 text-sm text-[var(--text-soft)]">Only owners and managers can view reports.</p></div>;
  }

  const catMax = Math.max(1, ...data.byCat.map((c) => c[1]));
  const payColor: Record<string, string> = { cash: "var(--green)", "mobile-money": "var(--amber)", card: "var(--blue)" };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Lifetime revenue" value={fmt(data.revenue)} color="var(--green)" />
        <Stat label="Lifetime profit" value={fmt(data.profit)} color="var(--purple)" />
        <Stat label="Units sold" value={data.units.toLocaleString()} color="var(--blue)" />
        <Stat label="Avg. order value" value={fmt(Math.round(data.aov))} color="var(--navy)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-bold">Top products by revenue</h2>
          {data.topProducts.length === 0 ? <p className="py-6 text-center text-sm text-[var(--text-soft)]">No sales yet.</p> : (
            <div className="space-y-2.5">
              {data.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ background: "var(--blue-50)", color: "var(--blue)" }}>{i + 1}</span>
                  <span className="line-clamp-1 flex-1 text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-[var(--text-faint)]">{p.qty} sold</span>
                  <span className="w-24 text-right text-sm font-bold">{fmt(p.rev)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-4 font-bold">Revenue by category</h2>
            {data.byCat.length === 0 ? <p className="py-4 text-center text-sm text-[var(--text-soft)]">No data.</p> : (
              <div className="space-y-2.5">
                {data.byCat.slice(0, 6).map(([c, v]) => (
                  <div key={c}>
                    <div className="mb-1 flex justify-between text-xs"><span className="font-medium">{CATEGORIES[c].label}</span><span className="text-[var(--text-faint)]">{fmt(v)}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full" style={{ width: `${(v / catMax) * 100}%`, background: "var(--blue)" }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card p-5">
            <h2 className="mb-3 font-bold">Payment methods</h2>
            {data.byPay.length === 0 ? <p className="py-4 text-center text-sm text-[var(--text-soft)]">No data.</p> : (
              <div className="flex flex-wrap gap-3">
                {data.byPay.map(([p, v]) => (
                  <div key={p} className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)" }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: payColor[p] ?? "var(--text-faint)" }} />
                    <span className="text-sm font-medium capitalize">{p === "mobile-money" ? "Mobile Money" : p}</span>
                    <span className="text-sm font-bold">{fmt(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
