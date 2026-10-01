"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/store/Store";
import { MOVEMENT_META, type MovementType } from "@/lib/inventory";

export default function Movements() {
  const { movements } = useStore();
  const [filter, setFilter] = useState<MovementType | "all">("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => movements.filter((m) =>
    (filter === "all" || m.type === filter) && (!q.trim() || m.itemName.toLowerCase().includes(q.toLowerCase()))
  ), [movements, filter, q]);

  const totals = useMemo(() => ({
    received: movements.filter((m) => m.type === "receive").reduce((s, m) => s + m.qty, 0),
    issued: -movements.filter((m) => m.type === "issue").reduce((s, m) => s + m.qty, 0),
    adjusted: movements.filter((m) => m.type === "adjust").length,
  }), [movements]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4"><div className="text-xs font-semibold text-[var(--text-faint)]">Total received</div><div className="mt-1 text-2xl font-black" style={{ color: "var(--green)" }}>+{totals.received.toLocaleString()}</div></div>
        <div className="card p-4"><div className="text-xs font-semibold text-[var(--text-faint)]">Total issued</div><div className="mt-1 text-2xl font-black" style={{ color: "var(--blue)" }}>−{totals.issued.toLocaleString()}</div></div>
        <div className="card p-4"><div className="text-xs font-semibold text-[var(--text-faint)]">Adjustments</div><div className="mt-1 text-2xl font-black" style={{ color: "var(--amber)" }}>{totals.adjusted}</div></div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {(["all", "receive", "issue", "adjust"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}>{f === "all" ? "All" : MOVEMENT_META[f as MovementType].label}</button>
          ))}
        </div>
        <div className="relative ml-auto min-w-[200px]">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product…" className="input" style={{ paddingLeft: 36 }} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs uppercase text-[var(--text-faint)]" style={{ borderColor: "var(--border)" }}>
              <th className="p-3">When</th><th className="p-3">Product</th><th className="p-3">Type</th><th className="p-3 text-center">Change</th><th className="hidden p-3 sm:table-cell">Note</th><th className="hidden p-3 md:table-cell">By</th>
            </tr></thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="table-row border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="p-3 text-[var(--text-soft)]">{new Date(m.date).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="p-3 font-semibold">{m.itemName}</td>
                  <td className="p-3"><span className={`pill ${MOVEMENT_META[m.type].pill}`}>{MOVEMENT_META[m.type].label}</span></td>
                  <td className="p-3 text-center font-bold" style={{ color: m.qty >= 0 ? "var(--green)" : "var(--red)" }}>{m.qty > 0 ? `+${m.qty}` : m.qty}</td>
                  <td className="hidden p-3 sm:table-cell text-[var(--text-soft)]">{m.note}</td>
                  <td className="hidden p-3 md:table-cell text-[var(--text-faint)]">{m.byName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="p-10 text-center text-sm text-[var(--text-soft)]">No stock movements yet. Receiving, issuing and adjustments will appear here.</div>}
      </div>
    </div>
  );
}
