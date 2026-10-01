"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/store/Store";
import { fmt, CATEGORIES, can, type InventoryItem, type CategoryKey, type Brand } from "@/lib/inventory";
import ItemImage from "@/components/ItemImage";

const blank = (): InventoryItem => ({
  id: "new-" + Math.random().toString(36).slice(2, 7),
  sku: "", name: "", brand: "NEMTEK", category: "accessories",
  cost: 0, price: 0, stock: 0, reorderLevel: 5, supplier: "", location: "",
});

export default function Inventory() {
  const { items, user, upsertItem, deleteItem, restock, adjustStock } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryKey | "all">("all");
  const [brand, setBrand] = useState<Brand | "all">("all");
  const [onlyLow, setOnlyLow] = useState(false);
  const [edit, setEdit] = useState<InventoryItem | null>(null);
  const [restockFor, setRestockFor] = useState<InventoryItem | null>(null);

  const role = user!.role;
  const mayEdit = can.editInventory(role);
  const mayDelete = can.deleteInventory(role);
  const showCost = can.viewCost(role);

  const rows = useMemo(() => items.filter((i) => {
    if (cat !== "all" && i.category !== cat) return false;
    if (brand !== "all" && i.brand !== brand) return false;
    if (onlyLow && i.stock > i.reorderLevel) return false;
    if (q.trim()) { const t = q.toLowerCase(); return i.name.toLowerCase().includes(t) || i.sku.toLowerCase().includes(t); }
    return true;
  }), [items, q, cat, brand, onlyLow]);

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU…" className="input" style={{ paddingLeft: 36 }} />
        </div>
        <select value={brand} onChange={(e) => setBrand(e.target.value as Brand | "all")} className="input" style={{ width: "auto" }}>
          <option value="all">All brands</option><option value="NEMTEK">NEMTEK</option><option value="CENTURION">CENTURION</option>
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value as CategoryKey | "all")} className="input" style={{ width: "auto" }}>
          <option value="all">All categories</option>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((c) => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}
        </select>
        <button onClick={() => setOnlyLow((v) => !v)} className={`btn btn-sm ${onlyLow ? "btn-primary" : "btn-ghost"}`}>Low stock</button>
        {mayEdit && <button onClick={() => setEdit(blank())} className="btn btn-primary btn-sm ml-auto">+ Add product</button>}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-[var(--text-faint)]" style={{ borderColor: "var(--border)" }}>
                <th className="p-3">Product</th><th className="p-3">SKU</th><th className="hidden p-3 md:table-cell">Category</th>
                {showCost && <th className="p-3 text-right">Cost</th>}
                <th className="p-3 text-right">Price</th><th className="p-3 text-center">Stock</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => {
                const low = i.stock <= i.reorderLevel;
                return (
                  <tr key={i.id} className="table-row border-b" style={{ borderColor: "var(--border)" }}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <ItemImage item={i} className="h-11 w-11 shrink-0 rounded-lg border" />
                        <div><div className="line-clamp-1 font-semibold">{i.name}</div><div className="text-xs text-[var(--text-faint)]">{i.brand} · {i.location}</div></div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs text-[var(--text-soft)]">{i.sku}</td>
                    <td className="hidden p-3 md:table-cell">{CATEGORIES[i.category].label}</td>
                    {showCost && <td className="p-3 text-right text-[var(--text-soft)]">{fmt(i.cost)}</td>}
                    <td className="p-3 text-right font-bold">{fmt(i.price)}</td>
                    <td className="p-3 text-center"><span className={`pill ${i.stock === 0 ? "pill-red" : low ? "pill-amber" : "pill-green"}`}>{i.stock}{low && i.stock > 0 ? " ⚠" : ""}</span></td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        {mayEdit && <button onClick={() => setRestockFor(i)} className="btn btn-ghost btn-sm" title="Restock">+ Stock</button>}
                        {mayEdit && <button onClick={() => setEdit(i)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--surface-2)]" title="Edit"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>}
                        {mayDelete && <button onClick={() => { if (confirm(`Remove ${i.name}?`)) deleteItem(i.id); }} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--red)] hover:bg-[var(--surface-2)]" title="Delete"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="p-10 text-center text-sm text-[var(--text-soft)]">No products match.</div>}
        <div className="flex items-center justify-between border-t p-3 text-xs text-[var(--text-faint)]" style={{ borderColor: "var(--border)" }}>
          <span>{rows.length} of {items.length} products</span>
          <span>Total retail value: <b className="text-[var(--text)]">{fmt(rows.reduce((s, i) => s + i.price * i.stock, 0))}</b></span>
        </div>
      </div>

      {edit && <EditModal item={edit} onClose={() => setEdit(null)} onSave={(it) => { upsertItem(it); setEdit(null); }} />}
      {restockFor && <RestockModal item={restockFor} onClose={() => setRestockFor(null)}
        onRestock={(qty) => { restock(restockFor.id, qty); setRestockFor(null); }}
        onAdjust={(v, note) => { adjustStock(restockFor.id, v, note); setRestockFor(null); }} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

function EditModal({ item, onClose, onSave }: { item: InventoryItem; onClose: () => void; onSave: (i: InventoryItem) => void }) {
  const [f, setF] = useState<InventoryItem>(item);
  const set = <K extends keyof InventoryItem>(k: K, v: InventoryItem[K]) => setF((p) => ({ ...p, [k]: v }));
  const isNew = item.id.startsWith("new-");
  const save = () => { if (!f.name.trim()) return; onSave({ ...f, sku: f.sku || `SKU-${Math.random().toString(36).slice(2, 7).toUpperCase()}` }); };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <div className="card my-8 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-black">{isNew ? "Add product" : "Edit product"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="Product name"><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Merlin 4 Energizer" /></Field></div>
          <Field label="Brand"><select className="input" value={f.brand} onChange={(e) => set("brand", e.target.value as Brand)}><option>NEMTEK</option><option>CENTURION</option></select></Field>
          <Field label="Category"><select className="input" value={f.category} onChange={(e) => set("category", e.target.value as CategoryKey)}>{(Object.keys(CATEGORIES) as CategoryKey[]).map((c) => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}</select></Field>
          <Field label="SKU"><input className="input" value={f.sku} onChange={(e) => set("sku", e.target.value)} placeholder="auto" /></Field>
          <Field label="Shelf / location"><input className="input" value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="A1-001" /></Field>
          <Field label="Cost price (GH₵)"><input type="number" min={0} className="input" value={f.cost || ""} onChange={(e) => set("cost", Number(e.target.value))} /></Field>
          <Field label="Selling price (GH₵)"><input type="number" min={0} className="input" value={f.price || ""} onChange={(e) => set("price", Number(e.target.value))} /></Field>
          <Field label="Stock on hand"><input type="number" min={0} className="input" value={f.stock || ""} onChange={(e) => set("stock", Number(e.target.value))} disabled={!isNew} /></Field>
          <Field label="Reorder level"><input type="number" min={0} className="input" value={f.reorderLevel || ""} onChange={(e) => set("reorderLevel", Number(e.target.value))} /></Field>
          <div className="col-span-2"><Field label="Supplier"><input className="input" value={f.supplier} onChange={(e) => set("supplier", e.target.value)} /></Field></div>
        </div>
        {!isNew && <p className="mt-2 text-xs text-[var(--text-faint)]">Use “+ Stock” on the list to change stock levels (keeps an audit trail).</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={save} className="btn btn-primary">Save product</button>
        </div>
      </div>
    </div>
  );
}

function RestockModal({ item, onClose, onRestock, onAdjust }: { item: InventoryItem; onClose: () => void; onRestock: (qty: number) => void; onAdjust: (v: number, note: string) => void }) {
  const [qty, setQty] = useState(10);
  const [newStock, setNewStock] = useState(item.stock);
  const [mode, setMode] = useState<"add" | "set">("add");
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-black">Update stock</h2>
        <p className="mb-4 text-sm text-[var(--text-soft)]">{item.name} — currently <b>{item.stock}</b> on hand.</p>
        <div className="mb-4 flex rounded-xl p-1" style={{ background: "var(--surface-2)" }}>
          {(["add", "set"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className="flex-1 rounded-lg py-2 text-sm font-bold" style={mode === m ? { background: "var(--surface)", boxShadow: "var(--shadow-sm)" } : { color: "var(--text-faint)" }}>{m === "add" ? "Receive stock" : "Set / correct"}</button>)}
        </div>
        {mode === "add" ? (
          <>
            <label className="label">Quantity received</label>
            <input type="number" min={1} className="input" value={qty || ""} onChange={(e) => setQty(Number(e.target.value))} />
            <div className="mt-2 text-sm text-[var(--text-soft)]">New total: <b>{item.stock + (qty || 0)}</b></div>
            <div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="btn btn-ghost">Cancel</button><button onClick={() => onRestock(qty)} className="btn btn-success">Add {qty || 0} units</button></div>
          </>
        ) : (
          <>
            <label className="label">Set stock to</label>
            <input type="number" min={0} className="input" value={newStock} onChange={(e) => setNewStock(Number(e.target.value))} />
            <div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="btn btn-ghost">Cancel</button><button onClick={() => onAdjust(newStock, "Manual correction")} className="btn btn-primary">Save</button></div>
          </>
        )}
      </div>
    </div>
  );
}
