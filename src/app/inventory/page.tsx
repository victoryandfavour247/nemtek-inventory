"use client";
import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/store/Store";
import { fmt, CATEGORIES, can, type InventoryItem, type CategoryKey, type Brand, type MovementType } from "@/lib/inventory";
import ItemImage from "@/components/ItemImage";
import BarcodeScanner from "@/components/BarcodeScanner";

type StockFilter = "all" | "low" | "out" | "in";

/* read a file, downscale to <=600px and return a compact JPEG data URL */
function fileToDataUrl(file: File, max = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const blank = (supplierId: string, id = "new-" + Math.random().toString(36).slice(2, 7)): InventoryItem => ({
  id, sku: "", name: "", brand: "NEMTEK", category: "accessories",
  cost: 0, price: 0, stock: 0, reorderLevel: 5, reorderQty: 20, supplierId, location: "", barcode: "",
});

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="card p-6 text-sm text-[var(--text-soft)]">Loading products…</div>}>
      <Products />
    </Suspense>
  );
}

function Products() {
  const { items, suppliers, user, upsertItem, deleteItem, moveStock, setStock } = useStore();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryKey | "all">("all");
  const [brand, setBrand] = useState<Brand | "all">("all");
  const [stockF, setStockF] = useState<StockFilter>(() => {
    const filter = searchParams.get("filter");
    return filter === "low" || filter === "out" ? filter : "all";
  });
  const [sort, setSort] = useState("name");
  const [edit, setEdit] = useState<InventoryItem | null>(null);
  const [stockFor, setStockFor] = useState<InventoryItem | null>(null);
  const [scanFind, setScanFind] = useState(false);

  const addRequested = searchParams.get("action") === "add";
  const requestedDraft = addRequested ? blank(suppliers[0]?.id ?? "", "new-header") : null;
  const activeEdit = edit ?? requestedDraft;

  const clearAddRequest = () => {
    if (!addRequested) return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete("action");
    const query = next.toString();
    window.history.replaceState(null, "", query ? `/inventory?${query}` : "/inventory");
  };

  const closeEditor = () => {
    setEdit(null);
    clearAddRequest();
  };

  const role = user!.role;
  const mayEdit = can.editInventory(role);
  const mayDelete = can.deleteInventory(role);
  const showCost = can.viewCost(role);
  const supName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? "—";

  const rows = useMemo(() => {
    let r = items.filter((i) => {
      if (cat !== "all" && i.category !== cat) return false;
      if (brand !== "all" && i.brand !== brand) return false;
      if (stockF === "low" && !(i.stock > 0 && i.stock <= i.reorderLevel)) return false;
      if (stockF === "out" && i.stock !== 0) return false;
      if (stockF === "in" && i.stock <= i.reorderLevel) return false;
      if (q.trim()) { const t = q.toLowerCase(); return i.name.toLowerCase().includes(t) || i.sku.toLowerCase().includes(t) || i.barcode.includes(t); }
      return true;
    });
    r = [...r].sort((a, b) =>
      sort === "stock" ? a.stock - b.stock :
      sort === "value" ? b.price * b.stock - a.price * a.stock :
      sort === "price" ? b.price - a.price : a.name.localeCompare(b.name));
    return r;
  }, [items, q, cat, brand, stockF, sort]);

  const exportCsv = () => {
    const head = ["SKU", "Name", "Brand", "Category", "Cost", "Price", "Stock", "Reorder", "Location", "Supplier"];
    const lines = rows.map((i) => [i.sku, `"${i.name}"`, i.brand, CATEGORIES[i.category].label, i.cost, i.price, i.stock, i.reorderLevel, i.location, `"${supName(i.supplierId)}"`].join(","));
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "nemtek-inventory.csv"; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, SKU or barcode…" className="input" style={{ paddingLeft: 36 }} />
        </div>
        <select value={brand} onChange={(e) => setBrand(e.target.value as Brand | "all")} className="input" style={{ width: "auto" }}>
          <option value="all">All brands</option><option value="NEMTEK">NEMTEK</option><option value="CENTURION">CENTURION</option>
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value as CategoryKey | "all")} className="input" style={{ width: "auto" }}>
          <option value="all">All categories</option>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((c) => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input" style={{ width: "auto" }}>
          <option value="name">Sort: Name</option><option value="stock">Lowest stock</option><option value="value">Highest value</option><option value="price">Highest price</option>
        </select>
        <button onClick={() => setScanFind(true)} className="btn btn-outline btn-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M6 8v8M10 8v8M14 8v8M18 8v8"/></svg>
          Scan
        </button>
        <button onClick={exportCsv} className="btn btn-outline btn-sm">Export CSV</button>
        {mayEdit && <button onClick={() => setEdit(blank(suppliers[0]?.id ?? ""))} className="btn btn-primary btn-sm">+ Add product</button>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {([["all", "All"], ["low", "Low stock"], ["out", "Out of stock"], ["in", "Healthy"]] as [StockFilter, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setStockF(k)} className={`btn btn-sm ${stockF === k ? "btn-primary" : "btn-ghost"}`}>{l}</button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-[var(--text-faint)]" style={{ borderColor: "var(--border)" }}>
                <th className="p-3">Product</th><th className="hidden p-3 lg:table-cell">SKU · Location</th><th className="hidden p-3 md:table-cell">Supplier</th>
                {showCost && <th className="p-3 text-right">Cost</th>}
                <th className="p-3 text-right">Price</th><th className="p-3 text-center">On hand</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => {
                const low = i.stock > 0 && i.stock <= i.reorderLevel;
                return (
                  <tr key={i.id} className="table-row border-b" style={{ borderColor: "var(--border)" }}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <ItemImage item={i} className="h-11 w-11 shrink-0 rounded-lg border" />
                        <div><div className="line-clamp-1 font-semibold">{i.name}</div><div className="text-xs text-[var(--text-faint)]">{i.brand} · {CATEGORIES[i.category].label}</div></div>
                      </div>
                    </td>
                    <td className="hidden p-3 lg:table-cell"><div className="font-mono text-xs text-[var(--text-soft)]">{i.sku}</div><div className="text-xs text-[var(--text-faint)]">{i.location}</div></td>
                    <td className="hidden p-3 md:table-cell text-[var(--text-soft)]"><span className="line-clamp-1">{supName(i.supplierId)}</span></td>
                    {showCost && <td className="p-3 text-right text-[var(--text-soft)]">{fmt(i.cost)}</td>}
                    <td className="p-3 text-right font-bold">{fmt(i.price)}</td>
                    <td className="p-3 text-center"><span className={`pill ${i.stock === 0 ? "pill-red" : low ? "pill-amber" : "pill-green"}`}>{i.stock}{low ? " ⚠" : ""}</span></td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setStockFor(i)} className="btn btn-ghost btn-sm">Stock</button>
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3 text-xs text-[var(--text-faint)]" style={{ borderColor: "var(--border)" }}>
          <span>{rows.length} of {items.length} products · {rows.reduce((s, i) => s + i.stock, 0).toLocaleString()} units</span>
          <span>Retail value: <b className="text-[var(--text)]">{fmt(rows.reduce((s, i) => s + i.price * i.stock, 0))}</b>{showCost && <> · Cost: <b className="text-[var(--text)]">{fmt(rows.reduce((s, i) => s + i.cost * i.stock, 0))}</b></>}</span>
        </div>
      </div>

      {activeEdit && <EditModal key={activeEdit.id} item={activeEdit} onClose={closeEditor} onSave={(it) => { upsertItem(it); closeEditor(); }} />}
      {stockFor && <StockModal item={stockFor} onClose={() => setStockFor(null)}
        onMove={(type, qty, note) => { moveStock(stockFor.id, type, qty, note); setStockFor(null); }}
        onSet={(v, note) => { setStock(stockFor.id, v, note); setStockFor(null); }} />}
      {scanFind && <BarcodeScanner title="Scan to find product" onClose={() => setScanFind(false)} onDetected={(code) => {
        setScanFind(false);
        const found = items.find((i) => i.barcode && i.barcode === code);
        if (found) { setStockFor(found); }
        else if (mayEdit) { const b = blank(suppliers[0]?.id ?? ""); setEdit({ ...b, barcode: code }); }
        else { setQ(code); }
      }} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

function EditModal({ item, onClose, onSave }: { item: InventoryItem; onClose: () => void; onSave: (i: InventoryItem) => void }) {
  const { suppliers, toast } = useStore();
  const [f, setF] = useState<InventoryItem>(item);
  const [scan, setScan] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof InventoryItem>(k: K, v: InventoryItem[K]) => setF((p) => ({ ...p, [k]: v }));
  const isNew = item.id.startsWith("new-");
  const save = () => {
    if (!f.name.trim()) {
      toast("Enter a product name", "error");
      return;
    }
    onSave({
      ...f,
      id: isNew ? `item-${crypto.randomUUID()}` : f.id,
      name: f.name.trim(),
      sku: f.sku.trim() || `SKU-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    });
  };

  const onPickFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "error"); return; }
    setUploading(true);
    try { set("image", await fileToDataUrl(file)); } catch { toast("Could not read that image", "error"); }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <div className="card my-8 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-black">{isNew ? "Add product" : "Edit product"}</h2>

        {/* photo */}
        <div className="mb-4 flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-white" style={{ borderColor: "var(--border)" }}>
            {f.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={f.image} alt="preview" className="h-full w-full object-contain p-1" />
              : <ItemImage item={f} className="h-full w-full" />}
          </div>
          <div>
            <div className="text-sm font-semibold">Product photo</div>
            <div className="mb-2 text-xs text-[var(--text-faint)]">JPG or PNG — shown on lists &amp; cards.</div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0])} />
            <div className="flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline btn-sm">{uploading ? "Loading…" : f.image ? "Change photo" : "Upload photo"}</button>
              {f.image && <button type="button" onClick={() => set("image", undefined)} className="btn btn-sm" style={{ background: "#fde6ea", color: "var(--red)" }}>Remove</button>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="Product name"><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Merlin 4 Energizer" required autoFocus /></Field></div>
          <Field label="Brand"><select className="input" value={f.brand} onChange={(e) => set("brand", e.target.value as Brand)}><option>NEMTEK</option><option>CENTURION</option></select></Field>
          <Field label="Category"><select className="input" value={f.category} onChange={(e) => set("category", e.target.value as CategoryKey)}>{(Object.keys(CATEGORIES) as CategoryKey[]).map((c) => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}</select></Field>
          <Field label="SKU"><input className="input" value={f.sku} onChange={(e) => set("sku", e.target.value)} placeholder="auto" /></Field>
          <div><label className="label">Barcode</label>
            <div className="flex gap-2">
              <input className="input" value={f.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="EAN/UPC" />
              <button type="button" onClick={() => setScan(true)} className="btn btn-outline shrink-0" title="Scan barcode">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M6 8v8M10 8v8M14 8v8M18 8v8"/></svg>
              </button>
            </div>
          </div>
          <Field label="Cost price (GH₵)"><input type="number" min={0} className="input" value={f.cost || ""} onChange={(e) => set("cost", Number(e.target.value))} /></Field>
          <Field label="Selling price (GH₵)"><input type="number" min={0} className="input" value={f.price || ""} onChange={(e) => set("price", Number(e.target.value))} /></Field>
          <Field label="Reorder level"><input type="number" min={0} className="input" value={f.reorderLevel || ""} onChange={(e) => set("reorderLevel", Number(e.target.value))} /></Field>
          <Field label="Reorder qty"><input type="number" min={0} className="input" value={f.reorderQty || ""} onChange={(e) => set("reorderQty", Number(e.target.value))} /></Field>
          <Field label="Shelf / location"><input className="input" value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="A1-001" /></Field>
          <Field label="Supplier"><select className="input" value={f.supplierId} onChange={(e) => set("supplierId", e.target.value)}>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          {isNew && <Field label="Opening stock"><input type="number" min={0} className="input" value={f.stock || ""} onChange={(e) => set("stock", Number(e.target.value))} /></Field>}
        </div>
        {!isNew && <p className="mt-2 text-xs text-[var(--text-faint)]">Use the <b>Stock</b> button on the list to receive, issue or adjust units (keeps an audit trail).</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={save} className="btn btn-primary">Save product</button>
        </div>
      </div>
      {scan && <BarcodeScanner title="Scan product barcode" onClose={() => setScan(false)} onDetected={(code) => { set("barcode", code); setScan(false); toast("Barcode captured"); }} />}
    </div>
  );
}

function StockModal({ item, onClose, onMove, onSet }: { item: InventoryItem; onClose: () => void; onMove: (t: MovementType, qty: number, note: string) => void; onSet: (v: number, note: string) => void }) {
  const [tab, setTab] = useState<"receive" | "issue" | "set">("receive");
  const [qty, setQty] = useState(item.reorderQty || 10);
  const [count, setCount] = useState(item.stock);
  const [note, setNote] = useState("");
  const projected = tab === "receive" ? item.stock + (qty || 0) : tab === "issue" ? item.stock - (qty || 0) : count;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-black">Manage stock</h2>
        <p className="mb-4 text-sm text-[var(--text-soft)]">{item.name} — <b>{item.stock}</b> on hand</p>
        <div className="mb-4 grid grid-cols-3 rounded-xl p-1" style={{ background: "var(--surface-2)" }}>
          {([["receive", "Receive"], ["issue", "Issue"], ["set", "Adjust"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="rounded-lg py-2 text-sm font-bold transition" style={tab === k ? { background: "var(--surface)", boxShadow: "var(--shadow-sm)", color: "var(--navy)" } : { color: "var(--text-faint)" }}>{l}</button>
          ))}
        </div>
        {tab === "set" ? (
          <><label className="label">New counted quantity</label><input type="number" min={0} className="input" value={count} onChange={(e) => setCount(Number(e.target.value))} /></>
        ) : (
          <><label className="label">{tab === "receive" ? "Quantity received" : "Quantity issued out"}</label><input type="number" min={1} className="input" value={qty || ""} onChange={(e) => setQty(Number(e.target.value))} /></>
        )}
        <div className="mt-3"><label className="label">Note (optional)</label><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={tab === "receive" ? "e.g. PO / supplier delivery" : tab === "issue" ? "e.g. sold / installed / damaged" : "e.g. stock-take correction"} /></div>
        <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--blue-50)", color: "var(--navy)" }}>New on-hand: <b>{Math.max(0, projected)}</b></div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          {tab === "set"
            ? <button onClick={() => onSet(count, note)} className="btn btn-primary">Save count</button>
            : <button onClick={() => onMove(tab, qty, note)} className={`btn ${tab === "receive" ? "btn-success" : "btn-primary"}`}>{tab === "receive" ? `Receive ${qty || 0}` : `Issue ${qty || 0}`}</button>}
        </div>
      </div>
    </div>
  );
}
