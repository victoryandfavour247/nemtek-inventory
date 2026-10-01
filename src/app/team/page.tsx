"use client";
import { useState } from "react";
import { useStore } from "@/store/Store";
import { can, ROLE_LABEL, type Worker, type Role } from "@/lib/inventory";

const blank = (): Worker => ({ id: "u-" + Math.random().toString(36).slice(2, 7), name: "", email: "", pin: "", role: "cashier", active: true });

export default function Team() {
  const { workers, user, upsertWorker, deleteWorker, sales } = useStore();
  const [edit, setEdit] = useState<Worker | null>(null);

  if (!can.manageWorkers(user!.role)) {
    return <div className="card p-10 text-center"><p className="text-lg font-bold">Team management is owner-only</p><p className="mt-1 text-sm text-[var(--text-soft)]">Ask the owner to add or change staff accounts.</p></div>;
  }

  const salesByUser = (id: string) => sales.filter((s) => s.cashierId === id);

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setEdit(blank())} className="btn btn-primary btn-sm">+ Add team member</button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workers.map((w) => {
          const s = salesByUser(w.id);
          const rev = s.reduce((a, b) => a + b.total, 0);
          return (
            <div key={w.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full text-lg font-black text-white" style={{ background: "linear-gradient(135deg,var(--blue),var(--navy))" }}>{w.name.charAt(0) || "?"}</span>
                  <div><div className="font-bold">{w.name}</div><div className="text-xs text-[var(--text-faint)]">{w.email}</div></div>
                </div>
                <span className={`pill ${w.active ? "pill-green" : "pill-gray"}`}>{w.active ? "Active" : "Disabled"}</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="pill pill-blue">{ROLE_LABEL[w.role]}</span>
                <span className="text-xs text-[var(--text-faint)]">{s.length} sales · {rev.toLocaleString()} GH₵</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setEdit(w)} className="btn btn-ghost btn-sm flex-1">Edit</button>
                {w.id !== user!.id && <button onClick={() => { if (confirm(`Remove ${w.name}?`)) deleteWorker(w.id); }} className="btn btn-sm flex-1" style={{ background: "#fde6ea", color: "var(--red)" }}>Remove</button>}
              </div>
            </div>
          );
        })}
      </div>

      {edit && <WorkerModal worker={edit} onClose={() => setEdit(null)} onSave={(w) => { upsertWorker(w); setEdit(null); }} />}
    </div>
  );
}

function WorkerModal({ worker, onClose, onSave }: { worker: Worker; onClose: () => void; onSave: (w: Worker) => void }) {
  const [f, setF] = useState<Worker>(worker);
  const set = <K extends keyof Worker>(k: K, v: Worker[K]) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim() && /^\S+@\S+\.\S+$/.test(f.email) && /^\d{4}$/.test(f.pin);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-black">{worker.name ? "Edit team member" : "Add team member"}</h2>
        <div className="space-y-3">
          <div><label className="label">Full name</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Kofi Mensah" /></div>
          <div><label className="label">Work email</label><input className="input" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="kofi@nemtek.gh" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">4-digit PIN</label><input className="input tracking-[0.3em]" inputMode="numeric" maxLength={4} value={f.pin} onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))} placeholder="0000" /></div>
            <div><label className="label">Role</label><select className="input" value={f.role} onChange={(e) => set("role", e.target.value as Role)}><option value="cashier">Cashier</option><option value="manager">Manager</option><option value="owner">Owner</option></select></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-[var(--blue)]" /> Account active (can sign in)</label>
        </div>
        <div className="mt-3 rounded-lg p-2.5 text-xs" style={{ background: "var(--blue-50)", color: "var(--navy)" }}>
          <b>Cashier:</b> sell only. <b>Manager:</b> + inventory & reports. <b>Owner:</b> full access incl. team & cost prices.
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={() => valid && onSave(f)} disabled={!valid} className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}
