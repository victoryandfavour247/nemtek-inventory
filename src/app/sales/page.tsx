"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/store/Store";
import { fmt, can, type Sale } from "@/lib/inventory";
import Stat from "@/components/Stat";

export default function Sales() {
  const { sales, user } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Sale | null>(null);
  const showProfit = can.viewCost(user!.role);

  const rows = useMemo(() => sales.filter((s) => {
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return s.id.toLowerCase().includes(t) || s.customer.toLowerCase().includes(t) || s.cashierName.toLowerCase().includes(t);
  }), [sales, q]);

  const totals = useMemo(() => ({
    revenue: rows.reduce((s, x) => s + x.total, 0),
    profit: rows.reduce((s, x) => s + x.profit, 0),
    count: rows.length,
  }), [rows]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Total revenue" value={fmt(totals.revenue)} color="var(--green)" />
        <Stat label="Transactions" value={String(totals.count)} color="var(--blue)" />
        {showProfit && <Stat label="Total profit" value={fmt(totals.profit)} color="var(--purple)" />}
      </div>

      <div className="relative max-w-sm">
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search receipt #, customer, cashier…" className="input" style={{ paddingLeft: 36 }} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs uppercase text-[var(--text-faint)]" style={{ borderColor: "var(--border)" }}>
              <th className="p-3">Receipt</th><th className="p-3">Customer</th><th className="hidden p-3 sm:table-cell">Cashier</th><th className="hidden p-3 md:table-cell">When</th><th className="p-3 text-center">Items</th><th className="p-3">Pay</th><th className="p-3 text-right">Total</th>
            </tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} onClick={() => setOpen(s)} className="table-row cursor-pointer border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="p-3 font-mono text-xs font-semibold">{s.id}</td>
                  <td className="p-3">{s.customer}</td>
                  <td className="hidden p-3 sm:table-cell text-[var(--text-soft)]">{s.cashierName}</td>
                  <td className="hidden p-3 md:table-cell text-[var(--text-soft)]">{new Date(s.date).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="p-3 text-center">{s.items.reduce((a, b) => a + b.qty, 0)}</td>
                  <td className="p-3"><span className="pill pill-gray capitalize">{s.payment === "mobile-money" ? "MoMo" : s.payment}</span></td>
                  <td className="p-3 text-right font-bold">{fmt(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="p-10 text-center text-sm text-[var(--text-soft)]">No sales found.</div>}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={() => setOpen(null)}>
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-black">Receipt {open.id}</h2><button onClick={() => setOpen(null)} className="text-[var(--text-faint)]">✕</button></div>
            <div className="text-xs text-[var(--text-faint)]">{open.customer} · {new Date(open.date).toLocaleString("en-GB")} · {open.cashierName}</div>
            <div className="my-3 border-y py-3 text-sm" style={{ borderColor: "var(--border)" }}>
              {open.items.map((it) => <div key={it.id} className="flex justify-between py-0.5"><span className="line-clamp-1 pr-2">{it.qty}× {it.name}</span><span className="whitespace-nowrap font-semibold">{fmt(it.price * it.qty)}</span></div>)}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-soft)]">Subtotal</span><span>{fmt(open.subtotal)}</span></div>
              {open.discount > 0 && <div className="flex justify-between"><span className="text-[var(--text-soft)]">Discount</span><span>−{fmt(open.discount)}</span></div>}
              <div className="flex justify-between text-lg font-black"><span>Total</span><span className="text-[var(--navy)]">{fmt(open.total)}</span></div>
              {showProfit && <div className="flex justify-between text-xs text-[var(--text-faint)]"><span>Profit</span><span>{fmt(open.profit)}</span></div>}
            </div>
            <button onClick={() => window.print()} className="btn btn-outline mt-4 w-full">Print receipt</button>
          </div>
        </div>
      )}
    </div>
  );
}
