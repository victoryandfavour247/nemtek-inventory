"use client";
import { useState } from "react";
import { useStore } from "@/store/Store";
import { can, type Supplier } from "@/lib/inventory";

const blank = (): Supplier => ({ id: "sup-" + Math.random().toString(36).slice(2, 7), name: "", contact: "", phone: "", email: "", leadDays: 7 });

export default function Suppliers() {
  const { suppliers, items, orders, user, upsertSupplier, deleteSupplier } = useStore();
  const [edit, setEdit] = useState<Supplier | null>(null);

  if (!can.managePurchasing(user!.role)) {
    return <div className="card p-10 text-center"><p className="text-lg font-bold">Suppliers are restricted</p><p className="mt-1 text-sm text-[var(--text-soft)]">Only owners and managers can manage suppliers.</p></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setEdit(blank())} className="btn btn-primary btn-sm">+ Add supplier</button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => {
          const sku = items.filter((i) => i.supplierId === s.id).length;
          const pos = orders.filter((o) => o.supplierId === s.id).length;
          return (
            <div key={s.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(135deg,var(--blue),var(--navy))" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l1-5h16l1 5M4 9v11h16V9"/></svg>
                  </span>
                  <div><div className="font-bold leading-tight">{s.name}</div><div className="text-xs text-[var(--text-faint)]">{s.contact || "—"}</div></div>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm text-[var(--text-soft)]">
                <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.5-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></svg>{s.phone || "—"}</div>
                <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>{s.email || "—"}</div>
                <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>{s.leadDays} day lead time</div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="pill pill-blue">{sku} products</span><span className="pill pill-gray">{pos} orders</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setEdit(s)} className="btn btn-ghost btn-sm flex-1">Edit</button>
                <button onClick={() => { if (sku > 0) { alert("Reassign this supplier's products before removing it."); return; } if (confirm(`Remove ${s.name}?`)) deleteSupplier(s.id); }} className="btn btn-sm flex-1" style={{ background: "#fde6ea", color: "var(--red)" }}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      {edit && <SupplierModal supplier={edit} onClose={() => setEdit(null)} onSave={(s) => { upsertSupplier(s); setEdit(null); }} />}
    </div>
  );
}

function SupplierModal({ supplier, onClose, onSave }: { supplier: Supplier; onClose: () => void; onSave: (s: Supplier) => void }) {
  const [f, setF] = useState<Supplier>(supplier);
  const set = <K extends keyof Supplier>(k: K, v: Supplier[K]) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim().length > 1;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-black">{supplier.name ? "Edit supplier" : "Add supplier"}</h2>
        <div className="space-y-3">
          <div><label className="label">Company name</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Accra Security Wholesale" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Contact person</label><input className="input" value={f.contact} onChange={(e) => set("contact", e.target.value)} /></div>
            <div><label className="label">Lead time (days)</label><input type="number" min={0} className="input" value={f.leadDays || ""} onChange={(e) => set("leadDays", Number(e.target.value))} /></div>
            <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><label className="label">Email</label><input className="input" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={() => valid && onSave(f)} disabled={!valid} className="btn btn-primary">Save supplier</button>
        </div>
      </div>
    </div>
  );
}
