"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/store/Store";
import { ROLE_LABEL } from "@/lib/inventory";
import Brand from "./Brand";

const TITLES: Record<string, string> = {
  "/": "Dashboard", "/inventory": "Products", "/movements": "Stock Log",
  "/purchase-orders": "Purchase Orders", "/suppliers": "Suppliers", "/reports": "Reports", "/team": "Team",
};

export default function Topbar() {
  const { user, logout, items } = useStore();
  const path = usePathname();
  const router = useRouter();
  if (!user) return null;
  const low = items.filter((i) => i.stock <= i.reorderLevel).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-[var(--bg-elev)] px-4 lg:px-6" style={{ borderColor: "var(--border)" }}>
      <span className="lg:hidden"><Brand size={34} showText={false} /></span>
      <h1 className="text-lg font-black">{TITLES[path] ?? "NEMTEK"}</h1>

      <div className="ml-auto flex items-center gap-2">
        <Link href="/inventory" className="btn btn-primary btn-sm hidden sm:inline-flex">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
          Add product
        </Link>
        <Link href="/inventory" className="relative grid h-10 w-10 place-items-center rounded-xl hover:bg-[var(--surface-2)]" title={`${low} low-stock items`}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>
          {low > 0 && <span className="absolute -right-0.5 -top-0.5 grid place-items-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: "var(--red)", height: 17, minWidth: 17 }}>{low}</span>}
        </Link>
        <div className="flex items-center gap-2 rounded-xl border px-2 py-1.5" style={{ borderColor: "var(--border)" }}>
          <span className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,var(--blue),var(--navy))" }}>{user.name.charAt(0)}</span>
          <div className="hidden leading-tight sm:block">
            <div className="text-[13px] font-bold">{user.name.split(" ")[0]}</div>
            <div className="text-[10px] text-[var(--text-faint)]">{ROLE_LABEL[user.role]}</div>
          </div>
          <button onClick={() => { logout(); router.push("/"); }} className="ml-1 grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--surface-2)]" title="Sign out">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
