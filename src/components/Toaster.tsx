"use client";
import { useStore } from "@/store/Store";

export default function Toaster() {
  const { toasts, dismissToast } = useStore();
  const color = (t: string) => (t === "error" ? "var(--red)" : t === "info" ? "var(--navy)" : "var(--green)");
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-2">
      {toasts.map((t) => (
        <div key={t.id} onClick={() => dismissToast(t.id)}
          className="pointer-events-auto pop flex max-w-[92vw] cursor-pointer items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-lg)]"
          style={{ background: color(t.type) }}>
          {t.type === "success" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5"/></svg>}
          {t.type === "error" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M18 6L6 18M6 6l12 12"/></svg>}
          {t.msg}
        </div>
      ))}
    </div>
  );
}
