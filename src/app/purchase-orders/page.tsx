"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/store/Store";
import { fmt, can, type PurchaseOrder, type POLine, type POStatus } from "@/lib/inventory";

const STATUS_META: Record<POStatus, { label: string; pill: string }> = {
  draft: { label: "Draft", pill: "pill-gray" },
  ordered: { label: "Ordered", pill: "pill-amber" },
  received: { label: "Received", pill: "pill-green" },
};

export default function PurchaseOrders() {
  const { orders, suppliers, items, user, createPO, updatePO, receivePO, deletePO } = useStore();
  const [show, setShow] = useState(false);
  const [view, setView] = useState<PurchaseOrder | null>(null);

  if (!can.managePurchasing(user!.role)) {
    return <div className="card p-10 text-center"><p className="text-lg font-bold">Purchasing is restricted</p><p className="mt-1 text-sm text-[var(--text-soft)]">Only owners and managers can manage purchase orders.</p></div>;
  }
  const supName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? "—";
  const poTotal = (o: PurchaseOrder) => o.lines.reduce((s, l) => s + l.cost * l.qty, 0);
  const poUnits = (o: PurchaseOrder) => o.lines.reduce((s, l) => s + l.qty, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-soft)]">{orders.filter((o) => o.status !== "received").length} open · {orders.length} total</p>
        <button onClick={() => setShow(true)} className="btn btn-primary btn-sm">+ New purchase order</button>
      </div>

      {orders.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <span className="text-4xl">📦</span>
          <p className="font-bold">No purchase orders yet</p>
          <p className="text-sm text-[var(--text-soft)]">Create an order to restock from a supplier. Receiving it adds the units to inventory automatically.</p>
          <button onClick={() => setShow(true)} className="btn btn-primary">Create your first PO</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs uppercase text-[var(--text-faint)]" style={{ borderColor: "var(--border)" }}>
                <th className="p-3">PO #</th><th className="p-3">Supplier</th><th className="hidden p-3 sm:table-cell">Created</th><th className="p-3 text-center">Items</th><th className="p-3 text-right">Total</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="table-row border-b" style={{ borderColor: "var(--border)" }}>
                    <td className="p-3"><button onClick={() => setView(o)} className="font-mono text-xs font-bold text-[var(--blue)]">{o.id}</button></td>
                    <td className="p-3">{supName(o.supplierId)}</td>
                    <td className="hidden p-3 sm:table-cell text-[var(--text-soft)]">{new Date(o.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="p-3 text-center">{poUnits(o)}</td>
                    <td className="p-3 text-right font-bold">{fmt(poTotal(o))}</td>
                    <td className="p-3"><span className={`pill ${STATUS_META[o.status].pill}`}>{STATUS_META[o.status].label}</span></td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.status === "draft" && <button onClick={() => updatePO({ ...o, status: "ordered" })} className="btn btn-ghost btn-sm">Place</button>}
                        {o.status !== "received" && <button onClick={() => receivePO(o.id)} className="btn btn-success btn-sm">Receive</button>}
                        {o.status !== "received" && <button onClick={() => { if (confirm(`Delete ${o.id}?`)) deletePO(o.id); }} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--red)] hover:bg-[var(--surface-2)]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>}
                        {o.status === "received" && <button onClick={() => setView(o)} className="btn btn-ghost btn-sm">View</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {show && <CreatePO onClose={() => setShow(false)} onCreate={(po) => { createPO(po); setShow(false); }} />}
      {view && <ViewPO po={view} supName={supName} itemName={(id) => items.find((i) => i.id === id)?.name ?? id} onClose={() => setView(null)} />}
    </div>
  );
}

function CreatePO({ onClose, onCreate }: { onClose: () => void; onCreate: (po: Omit<PurchaseOrder, "id" | "date" | "createdBy">) => void }) {
  const { suppliers, items } = useStore();
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [expected, setExpected] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<POLine[]>([]);
  const [q, setQ] = useState("");

  const supplierItems = useMemo(() => items.filter((i) => i.supplierId === supplierId), [items, supplierId]);
  const searchResults = useMemo(() => {
    if (!q.trim()) return [];
    const t = q.toLowerCase();
    return supplierItems.filter((i) => !lines.some((l) => l.itemId === i.id))
      .filter((i) => i.name.toLowerCase().includes(t) || i.sku.toLowerCase().includes(t)).slice(0, 8);
  }, [supplierItems, lines, q]);

  const addLine = (itemId: string) => {
    const it = items.find((i) => i.id === itemId)!;
    setLines((l) => [...l, { itemId, qty: it.reorderQty || 10, cost: it.cost }]);
    setQ("");
  };
  const setLine = (itemId: string, patch: Partial<POLine>) => setLines((l) => l.map((x) => x.itemId === itemId ? { ...x, ...patch } : x));
  const removeLine = (itemId: string) => setLines((l) => l.filter((x) => x.itemId !== itemId));

  const autoLow = () => {
    const low = supplierItems.filter((i) => i.stock <= i.reorderLevel && !lines.some((l) => l.itemId === i.id));
    setLines((l) => [...l, ...low.map((i) => ({ itemId: i.id, qty: i.reorderQty || 10, cost: i.cost }))]);
  };

  const total = lines.reduce((s, l) => s + l.cost * l.qty, 0);
  const nameOf = (id: string) => items.find((i) => i.id === id)?.name ?? id;
  const submit = (status: POStatus) => {
    if (lines.length === 0) return;
    onCreate({ supplierId, expected, status, lines, note });
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <div className="card my-8 w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-black">New purchase order</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1"><label className="label">Supplier</label><select className="input" value={supplierId} onChange={(e) => { setSupplierId(e.target.value); setLines([]); }}>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label className="label">Expected date</label><input type="date" className="input" value={expected} onChange={(e) => setExpected(e.target.value)} /></div>
          <div><label className="label">Reference / note</label><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="optional" /></div>
        </div>

        {/* add items */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="label !mb-0">Add products</label>
            <button onClick={autoLow} className="text-xs font-semibold text-[var(--blue)]">+ Auto-fill low stock</button>
          </div>
          <div className="relative">
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this supplier's products to add…" />
            {q.trim() && (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border bg-[var(--surface)] shadow-[var(--shadow-lg)]" style={{ borderColor: "var(--border)" }}>
                {searchResults.length === 0 ? <div className="p-3 text-sm text-[var(--text-faint)]">No matching products for this supplier.</div> :
                  searchResults.map((i) => (
                    <button key={i.id} onClick={() => addLine(i.id)} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--surface-2)]">
                      <span className="line-clamp-1">{i.name}</span><span className="text-xs text-[var(--text-faint)]">stock {i.stock} · {fmt(i.cost)}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* lines */}
        <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs uppercase text-[var(--text-faint)]" style={{ borderColor: "var(--border)" }}><th className="p-2.5">Product</th><th className="p-2.5 w-20 text-center">Qty</th><th className="p-2.5 w-28 text-right">Unit cost</th><th className="p-2.5 w-24 text-right">Line</th><th className="w-8"></th></tr></thead>
            <tbody>
              {lines.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-sm text-[var(--text-faint)]">No items yet — search above or auto-fill low stock.</td></tr> :
                lines.map((l) => (
                  <tr key={l.itemId} className="border-b" style={{ borderColor: "var(--border)" }}>
                    <td className="p-2.5"><span className="line-clamp-1 font-medium">{nameOf(l.itemId)}</span></td>
                    <td className="p-2.5"><input type="number" min={1} className="input !py-1 text-center" value={l.qty} onChange={(e) => setLine(l.itemId, { qty: Number(e.target.value) })} /></td>
                    <td className="p-2.5"><input type="number" min={0} className="input !py-1 text-right" value={l.cost} onChange={(e) => setLine(l.itemId, { cost: Number(e.target.value) })} /></td>
                    <td className="p-2.5 text-right font-semibold">{fmt(l.cost * l.qty)}</td>
                    <td className="p-2.5"><button onClick={() => removeLine(l.itemId)} className="text-[var(--text-faint)] hover:text-[var(--red)]">✕</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-[var(--text-soft)]">{lines.reduce((s, l) => s + l.qty, 0)} units</div>
          <div className="text-lg font-black">Total {fmt(total)}</div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={() => submit("draft")} disabled={lines.length === 0} className="btn btn-outline">Save draft</button>
          <button onClick={() => submit("ordered")} disabled={lines.length === 0} className="btn btn-primary">Place order</button>
        </div>
      </div>
    </div>
  );
}

function ViewPO({ po, supName, itemName, onClose }: { po: PurchaseOrder; supName: (id: string) => string; itemName: (id: string) => string; onClose: () => void }) {
  const total = po.lines.reduce((s, l) => s + l.cost * l.qty, 0);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between"><h2 className="font-black">PO {po.id}</h2><span className={`pill ${STATUS_META[po.status].pill}`}>{STATUS_META[po.status].label}</span></div>
        <div className="text-xs text-[var(--text-faint)]">{supName(po.supplierId)} · created {new Date(po.date).toLocaleDateString("en-GB")}{po.receivedDate ? ` · received ${new Date(po.receivedDate).toLocaleDateString("en-GB")}` : ""}</div>
        <div className="my-3 border-y py-3 text-sm" style={{ borderColor: "var(--border)" }}>
          {po.lines.map((l) => <div key={l.itemId} className="flex justify-between py-0.5"><span className="line-clamp-1 pr-2">{l.qty}× {itemName(l.itemId)}</span><span className="whitespace-nowrap font-semibold">{fmt(l.cost * l.qty)}</span></div>)}
        </div>
        <div className="flex justify-between text-lg font-black"><span>Total</span><span style={{ color: "var(--navy)" }}>{fmt(total)}</span></div>
        {po.note && <p className="mt-2 text-sm text-[var(--text-soft)]">Note: {po.note}</p>}
        <button onClick={onClose} className="btn btn-primary mt-4 w-full">Close</button>
      </div>
    </div>
  );
}
