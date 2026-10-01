"use client";
import { useState } from "react";
import { useStore } from "@/store/Store";
import { can, ROLE_LABEL, hashPw, type Worker, type Role } from "@/lib/inventory";

const blank = (): Worker => ({ id: "u-" + Math.random().toString(36).slice(2, 7), name: "", email: "", password: "", role: "staff", active: true });

export default function Team() {
  const { workers, user, movements, upsertWorker, deleteWorker } = useStore();
  const [edit, setEdit] = useState<Worker | null>(null);

  if (!can.manageWorkers(user!.role)) {
    return <div className="card p-10 text-center"><p className="text-lg font-bold">Team management is owner-only</p><p className="mt-1 text-sm text-[var(--text-soft)]">Ask the owner to add or change staff accounts.</p></div>;
  }

  const activityOf = (name: string) => movements.filter((m) => m.byName === name).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setEdit(blank())} className="btn btn-primary btn-sm">+ Add team member</button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workers.map((w) => {
          const acts = activityOf(w.name);
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
                <span className="text-xs text-[var(--text-faint)]">{acts} stock actions</span>
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
  const isNew = !worker.name;
  const [f, setF] = useState<Worker>(worker);
  const [pw, setPw] = useState("");
  const set = <K extends keyof Worker>(k: K, v: Worker[K]) => setF((p) => ({ ...p, [k]: v }));
  const pwOk = isNew ? pw.length >= 6 : (pw === "" || pw.length >= 6);
  const valid = f.name.trim() && /^\S+@\S+\.\S+$/.test(f.email) && pwOk;
  const save = () => {
    if (!valid) return;
    onSave({ ...f, email: f.email.toLowerCase().trim(), password: pw ? hashPw(pw) : f.password });
  };
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-black">{isNew ? "Add team member" : "Edit team member"}</h2>
        <div className="space-y-3">
          <div><label className="label">Full name</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Kofi Mensah" /></div>
          <div><label className="label">Work email</label><input className="input" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="kofi@nemtek.gh" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">{isNew ? "Password" : "New password"}</label><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={isNew ? "At least 6 characters" : "Leave blank to keep"} /></div>
            <div><label className="label">Role</label><select className="input" value={f.role} onChange={(e) => set("role", e.target.value as Role)}><option value="staff">Storekeeper</option><option value="manager">Manager</option><option value="owner">Owner</option></select></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-[var(--blue)]" /> Account active (can sign in)</label>
        </div>
        <div className="mt-3 rounded-lg p-2.5 text-xs" style={{ background: "var(--blue-50)", color: "var(--navy)" }}>
          <b>Storekeeper:</b> receive/issue/adjust stock. <b>Manager:</b> + products, purchasing &amp; reports. <b>Owner:</b> full access incl. team &amp; costs.
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={save} disabled={!valid} className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}
