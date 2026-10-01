"use client";
import { useMemo } from "react";
import { useStore } from "@/store/Store";
import { fmt, can, CATEGORIES, type CategoryKey } from "@/lib/inventory";
import Stat from "@/components/Stat";

export default function Reports() {
  const { items, movements, user } = useStore();
  const role = user!.role;

  const d = useMemo(() => {
    const cost = items.reduce((a, i) => a + i.cost * i.stock, 0);
    const retail = items.reduce((a, i) => a + i.price * i.stock, 0);
    const units = items.reduce((a, i) => a + i.stock, 0);
    const low = items.filter((i) => i.stock > 0 && i.stock <= i.reorderLevel).length;
    const out = items.filter((i) => i.stock === 0).length;

    const catMap = new Map<CategoryKey, number>();
    items.forEach((i) => catMap.set(i.category, (catMap.get(i.category) ?? 0) + i.cost * i.stock));
    const byCat = [...catMap.entries()].sort((a, b) => b[1] - a[1]);

    const topValue = [...items].map((i) => ({ i, v: i.price * i.stock })).sort((a, b) => b.v - a.v).slice(0, 8);

    const since = Date.now() - 30 * 864e5;
    const recent = movements.filter((m) => new Date(m.date).getTime() >= since);
    const received = recent.filter((m) => m.type === "receive").reduce((s, m) => s + m.qty, 0);
    const issued = -recent.filter((m) => m.type === "issue").reduce((s, m) => s + m.qty, 0);

    return { cost, retail, units, low, out, byCat, topValue, received, issued, margin: retail - cost };
  }, [items, movements]);

  if (!can.viewReports(role)) {
    return <div className="card p-10 text-center"><p className="text-lg font-bold">Reports are restricted</p><p className="mt-1 text-sm text-[var(--text-soft)]">Only owners and managers can view reports.</p></div>;
  }

  const catMax = Math.max(1, ...d.byCat.map((c) => c[1]));
  const valMax = Math.max(1, ...d.topValue.map((t) => t.v));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Inventory value (cost)" value={fmt(d.cost)} sub={`${d.units.toLocaleString()} units · ${items.length} SKUs`} color="var(--blue)" />
        <Stat label="Retail value" value={fmt(d.retail)} sub={`Potential margin ${fmt(d.margin)}`} color="var(--green)" />
        <Stat label="Received (30d)" value={`+${d.received.toLocaleString()}`} sub="units in" color="var(--purple)" />
        <Stat label="Issued (30d)" value={`−${d.issued.toLocaleString()}`} sub="units out" color="var(--amber)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-bold">Inventory value by category (cost)</h2>
          <div className="space-y-2.5">
            {d.byCat.map(([c, v]) => (
              <div key={c}>
                <div className="mb-1 flex justify-between text-xs"><span className="font-medium">{CATEGORIES[c].label}</span><span className="text-[var(--text-faint)]">{fmt(v)}</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full" style={{ width: `${(v / catMax) * 100}%`, background: "linear-gradient(90deg,var(--blue),var(--navy))" }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-bold">Highest-value stock (retail)</h2>
          <div className="space-y-2.5">
            {d.topValue.map(({ i, v }, idx) => (
              <div key={i.id} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ background: "var(--blue-50)", color: "var(--blue)" }}>{idx + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-medium">{i.name}</div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full" style={{ width: `${(v / valMax) * 100}%`, background: "var(--green)" }} /></div>
                </div>
                <span className="w-24 text-right text-sm font-bold">{fmt(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5 text-center"><div className="text-3xl font-black" style={{ color: "var(--amber)" }}>{d.low}</div><div className="mt-1 text-sm text-[var(--text-soft)]">Items at/below reorder level</div></div>
        <div className="card p-5 text-center"><div className="text-3xl font-black" style={{ color: "var(--red)" }}>{d.out}</div><div className="mt-1 text-sm text-[var(--text-soft)]">Items out of stock</div></div>
        <div className="card p-5 text-center"><div className="text-3xl font-black" style={{ color: "var(--green)" }}>{items.length - d.low - d.out}</div><div className="mt-1 text-sm text-[var(--text-soft)]">Items healthy</div></div>
      </div>
    </div>
  );
}
