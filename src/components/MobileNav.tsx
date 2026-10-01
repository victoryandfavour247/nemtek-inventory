"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/Store";
import { can } from "@/lib/inventory";

export default function MobileNav() {
  const path = usePathname();
  const { user } = useStore();
  if (!user) return null;
  const role = user.role;

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/inventory", label: "Products" },
    { href: "/movements", label: "Stock Log" },
    ...(can.managePurchasing(role) ? [{ href: "/purchase-orders", label: "Purchase Orders" }, { href: "/suppliers", label: "Suppliers" }] : []),
    ...(can.viewReports(role) ? [{ href: "/reports", label: "Reports & Valuation" }] : []),
    ...(can.manageWorkers(role) ? [{ href: "/team", label: "Team" }] : []),
  ];

  return (
    <nav className="sticky top-16 z-20 flex gap-1.5 overflow-x-auto border-b bg-[var(--bg-elev)] px-4 py-2 lg:hidden" style={{ borderColor: "var(--border)" }}>
      {links.map((l) => {
        const active = path === l.href;
        return (
          <Link key={l.href} href={l.href} className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={active ? { background: "var(--blue)", color: "#fff" } : { background: "var(--surface-2)", color: "var(--text-soft)" }}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
