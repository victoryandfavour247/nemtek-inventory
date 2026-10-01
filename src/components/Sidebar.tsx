"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/Store";
import { can } from "@/lib/inventory";
import Brand from "./Brand";

const ICONS: Record<string, React.ReactNode> = {
  dash: <path d="M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z" />,
  box: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4M12 11v10" /></>,
  po: <><path d="M9 2h6a2 2 0 012 2v2H7V4a2 2 0 012-2z" /><rect x="4" y="6" width="16" height="16" rx="2" /><path d="M9 12h6M9 16h6" /></>,
  supplier: <><path d="M3 9l1-5h16l1 5" /><path d="M4 9v11h16V9M9 14h6" /></>,
  moves: <><path d="M4 17l6-6 4 4 6-7" /><path d="M20 8V3h-5" /></>,
  report: <><path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" /><rect x="12" y="7" width="3" height="10" /><rect x="17" y="13" width="3" height="4" /></>,
  team: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0M16 3.5a3 3 0 010 6M21 20a6 6 0 00-5-5.9" /></>,
};

function Item({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
      style={active ? { background: "var(--blue)", color: "#fff", boxShadow: "0 6px 16px rgba(30,82,230,.3)" } : { color: "var(--text-soft)" }}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const path = usePathname();
  const { user } = useStore();
  if (!user) return null;
  const role = user.role;
  const a = (p: string) => path === p;

  return (
    <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col overflow-hidden border-r bg-[var(--surface)] p-3 lg:flex" style={{ borderColor: "var(--border)" }}>
      <Link href="/" className="mb-5 px-2 pt-2"><Brand size={40} /></Link>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Overview</div>
        <nav className="flex flex-col gap-1">
          <Item href="/" icon={ICONS.dash} label="Dashboard" active={a("/")} />
          <Item href="/inventory" icon={ICONS.box} label="Products" active={a("/inventory")} />
          <Item href="/movements" icon={ICONS.moves} label="Stock Log" active={a("/movements")} />
        </nav>

        {can.managePurchasing(role) && <>
          <div className="mt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Operations</div>
          <nav className="flex flex-col gap-1">
            <Item href="/purchase-orders" icon={ICONS.po} label="Purchase Orders" active={a("/purchase-orders")} />
            <Item href="/suppliers" icon={ICONS.supplier} label="Suppliers" active={a("/suppliers")} />
          </nav>
        </>}

        {can.viewReports(role) && <>
          <div className="mt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Insights</div>
          <nav className="flex flex-col gap-1">
            <Item href="/reports" icon={ICONS.report} label="Reports & Valuation" active={a("/reports")} />
          </nav>
        </>}

        {can.manageWorkers(role) && <>
          <div className="mt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Administration</div>
          <nav className="flex flex-col gap-1">
            <Item href="/team" icon={ICONS.team} label="Team" active={a("/team")} />
          </nav>
        </>}
      </div>

      <div className="mt-3 rounded-xl border p-3 text-xs" style={{ background: "var(--blue-50)", borderColor: "#cbd9fb", color: "var(--navy)" }}>
        <div className="flex items-center gap-1.5 font-bold"><span className="h-2 w-2 rounded-full bg-[var(--green)]" />Advanced tools enabled</div>
        <div className="mt-1 leading-4 text-[var(--text-soft)]">Purchasing, suppliers, reports and valuation are ready to use.</div>
      </div>
    </aside>
  );
}
