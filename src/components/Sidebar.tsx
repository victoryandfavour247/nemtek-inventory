"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/Store";
import { can } from "@/lib/inventory";
import Brand from "./Brand";

const ICONS: Record<string, React.ReactNode> = {
  dash: <path d="M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z" />,
  box: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4M12 11v10" /></>,
  pos: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 10h18M7 18v2m10-2v2" /></>,
  sales: <><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></>,
  moves: <><path d="M4 17l6-6 4 4 6-7" /><path d="M20 8V3h-5" /></>,
  team: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0M16 3.5a3 3 0 010 6M21 20a6 6 0 00-5-5.9" /></>,
};

function Item({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
      style={active ? { background: "var(--blue)", color: "#fff" } : { color: "var(--text-soft)" }}>
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
    <aside className="sticky top-0 hidden h-screen w-[230px] shrink-0 flex-col border-r bg-[var(--surface)] p-3 lg:flex" style={{ borderColor: "var(--border)" }}>
      <Link href="/" className="mb-4 px-2 pt-2">
        <Brand size={40} />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        <Item href="/" icon={ICONS.dash} label="Dashboard" active={a("/")} />
        <Item href="/pos" icon={ICONS.pos} label="Point of Sale" active={a("/pos")} />
        <Item href="/inventory" icon={ICONS.box} label="Inventory" active={a("/inventory")} />
        <Item href="/sales" icon={ICONS.sales} label="Sales" active={a("/sales")} />
        <Item href="/movements" icon={ICONS.moves} label="Stock Log" active={a("/movements")} />
        {can.viewReports(role) && <Item href="/reports" icon={ICONS.sales} label="Reports" active={a("/reports")} />}
        {can.manageWorkers(role) && <Item href="/team" icon={ICONS.team} label="Team" active={a("/team")} />}
      </nav>

      <div className="mt-2 rounded-xl p-3 text-xs" style={{ background: "var(--blue-50)", color: "var(--navy)" }}>
        <div className="font-bold">Need stock?</div>
        <div className="mt-0.5 text-[var(--text-soft)]">Check low-stock items on the dashboard and restock in one click.</div>
      </div>
    </aside>
  );
}
