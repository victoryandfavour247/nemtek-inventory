"use client";
import { useStore } from "@/store/Store";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Login from "./Login";

export default function Shell({ children }: { children: React.ReactNode }) {
  const { ready, user } = useStore();

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-[var(--text-soft)]">Loading…</div>;
  }
  if (!user) return <Login />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
