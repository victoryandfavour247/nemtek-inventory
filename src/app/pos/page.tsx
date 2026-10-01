"use client";
import { useMemo, useState } from "react";
import { useStore, type POSLine } from "@/store/Store";
import { fmt, CATEGORIES, type CategoryKey, type Sale } from "@/lib/inventory";
import ItemImage from "@/components/ItemImage";

export default function POS() {
  const { items, recordSale } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryKey | "all">("all");
  const [lines, setLines] = useState<POSLine[]>([]);
  const [customer, setCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<Sale["payment"]>("cash");
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const results = useMemo(() => items.filter((i) => {
    if (cat !== "all" && i.category !== cat) return false;
    if (q.trim()) { const t = q.toLowerCase(); return i.name.toLowerCase().includes(t) || i.sku.toLowerCase().includes(t); }
    return true;
  }), [items, q, cat]);

  const add = (id: string) => setLines((l) => {
    const it = items.find((x) => x.id === id)!;
    const ex = l.find((x) => x.id === id);
    if (ex) { if (ex.qty >= it.stock) return l; return l.map((x) => x.id === id ? { ...x, qty: x.qty + 1 } : x); }
    return [...l, { id, qty: 1 }];
  });
  const setQty = (id: string, qty: number) => setLines((l) => qty <= 0 ? l.filter((x) => x.id !== id) : l.map((x) => x.id === id ? { ...x, qty } : x));

  const subtotal = lines.reduce((s, l) => { const it = items.find((i) => i.id === l.id); return s + (it ? it.price * l.qty : 0); }, 0);
  const total = Math.max(0, subtotal - discount);
  const cats = Object.keys(CATEGORIES) as CategoryKey[];

  const checkout = () => {
    const sale = recordSale({ lines, customer, discount, payment });
    if (sale) { setReceipt(sale); setLines([]); setCustomer(""); setDiscount(0); setPayment("cash"); }
  };

  return (
    <div className="grid h-[calc(100vh-7rem)] gap-4 lg:grid-cols-[1fr_380px]">
      {/* catalogue */}
      <div className="flex min-h-0 flex-col">
        <div className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Scan or search by name / SKU…" className="input" style={{ paddingLeft: 36 }} autoFocus />
          </div>
        </div>
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
          <button onClick={() => setCat("all")} className={`btn btn-sm ${cat === "all" ? "btn-primary" : "btn-ghost"}`}>All</button>
          {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`btn btn-sm ${cat === c ? "btn-primary" : "btn-ghost"}`}>{CATEGORIES[c].label}</button>)}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
          {results.map((i) => (
            <button key={i.id} disabled={i.stock === 0} onClick={() => add(i.id)}
              className="card flex flex-col p-2 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[var(--shadow-md)] disabled:opacity-50">
              <ItemImage item={i} className="aspect-square w-full rounded-lg" />
              <div className="mt-1.5 line-clamp-2 text-[12px] font-semibold leading-tight">{i.name}</div>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="text-[13px] font-black text-[var(--navy)]">{fmt(i.price)}</span>
                <span className={`pill ${i.stock === 0 ? "pill-red" : i.stock <= i.reorderLevel ? "pill-amber" : "pill-gray"} !px-1.5 !py-0.5`}>{i.stock}</span>
              </div>
            </button>
          ))}
          {results.length === 0 && <div className="col-span-full py-10 text-center text-sm text-[var(--text-soft)]">No products found.</div>}
        </div>
      </div>

      {/* cart */}
      <div className="card flex min-h-0 flex-col">
        <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-bold">Current sale</h2>
          {lines.length > 0 && <button onClick={() => setLines([])} className="text-xs font-semibold text-[var(--red)]">Clear</button>}
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[var(--text-soft)]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 10h18M7 18v2m10-2v2"/></svg>
              Tap products to add them
            </div>
          ) : lines.map((l) => {
            const it = items.find((i) => i.id === l.id)!;
            return (
              <div key={l.id} className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: "var(--border)" }}>
                <ItemImage item={it} className="h-11 w-11 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1"><div className="line-clamp-1 text-[13px] font-semibold">{it.name}</div><div className="text-xs text-[var(--text-faint)]">{fmt(it.price)}</div></div>
                <div className="flex items-center rounded-lg border" style={{ borderColor: "var(--border)" }}>
                  <button onClick={() => setQty(l.id, l.qty - 1)} className="grid h-7 w-7 place-items-center">−</button>
                  <span className="w-7 text-center text-sm font-bold">{l.qty}</span>
                  <button onClick={() => setQty(l.id, l.qty + 1)} disabled={l.qty >= it.stock} className="grid h-7 w-7 place-items-center disabled:opacity-30">+</button>
                </div>
                <div className="w-16 text-right text-[13px] font-bold">{fmt(it.price * l.qty)}</div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 border-t p-4" style={{ borderColor: "var(--border)" }}>
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name (optional)" className="input" />
          <div className="grid grid-cols-3 gap-1.5">
            {(["cash", "mobile-money", "card"] as const).map((p) => (
              <button key={p} onClick={() => setPayment(p)} className={`btn btn-sm ${payment === p ? "btn-primary" : "btn-ghost"} capitalize`}>{p === "mobile-money" ? "MoMo" : p}</button>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm"><span className="text-[var(--text-soft)]">Subtotal</span><span className="font-semibold">{fmt(subtotal)}</span></div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-soft)]">Discount</span>
            <input type="number" min={0} value={discount || ""} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} placeholder="0" className="input !w-24 !py-1 text-right" />
          </div>
          <div className="flex items-center justify-between border-t pt-2 text-lg" style={{ borderColor: "var(--border)" }}>
            <span className="font-bold">Total</span><span className="font-black text-[var(--navy)]">{fmt(total)}</span>
          </div>
          <button onClick={checkout} disabled={lines.length === 0} className="btn btn-success w-full !py-3 text-base">Complete sale · {fmt(total)}</button>
        </div>
      </div>

      {receipt && <Receipt sale={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function Receipt({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 text-center">
          <div className="pop mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full text-white" style={{ background: "var(--green)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="text-xl font-black">Sale complete</h2>
          <div className="font-mono text-xs text-[var(--text-faint)]">{sale.id}</div>
        </div>
        <div className="my-3 border-y py-3 text-sm" style={{ borderColor: "var(--border)" }}>
          <div className="mb-2 flex justify-between text-xs text-[var(--text-faint)]"><span>{sale.customer}</span><span>{new Date(sale.date).toLocaleString("en-GB")}</span></div>
          {sale.items.map((it) => (
            <div key={it.id} className="flex justify-between py-0.5"><span className="line-clamp-1 pr-2">{it.qty}× {it.name}</span><span className="font-semibold whitespace-nowrap">{fmt(it.price * it.qty)}</span></div>
          ))}
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-[var(--text-soft)]">Subtotal</span><span>{fmt(sale.subtotal)}</span></div>
          {sale.discount > 0 && <div className="flex justify-between"><span className="text-[var(--text-soft)]">Discount</span><span>−{fmt(sale.discount)}</span></div>}
          <div className="flex justify-between text-lg font-black"><span>Total</span><span className="text-[var(--navy)]">{fmt(sale.total)}</span></div>
          <div className="flex justify-between pt-1 text-xs text-[var(--text-faint)]"><span>Paid by {sale.payment === "mobile-money" ? "Mobile Money" : sale.payment}</span><span>Served by {sale.cashierName.split(" ")[0]}</span></div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={() => window.print()} className="btn btn-outline flex-1">Print</button>
          <button onClick={onClose} className="btn btn-primary flex-1">New sale</button>
        </div>
      </div>
    </div>
  );
}
