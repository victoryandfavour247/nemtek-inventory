"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/store/Store";
import type { MovementType } from "@/lib/inventory";

const META: Record<MovementType, { label: string; pill: string }> = {
  restock: { label: "Restock", pill: "pill-green" },
  sale: { label: "Sale", pill: "pill-blue" },
  adjust: { label: "Adjustment", pill: "pill-amber" },
};

export default function Movements() {
  const { movements } = useStore();
  const [filter, setFilter] = useState<MovementType | "all">("all");
  const rows = useMemo(() => movements.filter((m) => filter === "all" || m.type === filter), [movements, filter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {(["all", "restock", "sale", "adjust"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"} capitalize`}>{f === "all" ? "All movements" : META[f as MovementType].label}</button>
        ))}
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
                  <td className="p-3"><span className={`pill ${META[m.type].pill}`}>{META[m.type].label}</span></td>
                  <td className="p-3 text-center font-bold" style={{ color: m.qty >= 0 ? "var(--green)" : "var(--red)" }}>{m.qty > 0 ? `+${m.qty}` : m.qty}</td>
                  <td className="hidden p-3 sm:table-cell text-[var(--text-soft)]">{m.note}</td>
                  <td className="hidden p-3 md:table-cell text-[var(--text-faint)]">{m.byName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="p-10 text-center text-sm text-[var(--text-soft)]">No stock movements yet. Sales and restocks will appear here.</div>}
      </div>
    </div>
  );
}
