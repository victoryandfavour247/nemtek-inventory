"use client";
import { useState } from "react";
import { useStore } from "@/store/Store";
import { ROLE_LABEL } from "@/lib/inventory";

export default function Login() {
  const { login, workers } = useStore();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, pin);
    if (!res.ok) setErr(res.error ?? "Login failed");
  };
  const quick = (em: string, p: string) => { setEmail(em); setPin(p); setErr(""); };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* brand side */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex" style={{ background: "linear-gradient(140deg,#0b2a6b,#1e52e6)" }}>
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full"><defs><pattern id="m" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect x="0" y="8" width="15" height="4" rx="2" fill="#9fc0ff"/></pattern></defs><rect width="100%" height="100%" fill="url(#m)"/></svg>
        </div>
        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-xl font-black">N</span>
          <div><div className="text-xl font-black leading-none">NEMTEK</div><div className="text-[11px] uppercase tracking-[0.25em] text-white/70">Inventory · POS</div></div>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-black leading-tight">Run your store<br/>like clockwork.</h1>
          <p className="mt-4 max-w-sm text-white/80">Track stock in real time, ring up customer sales, manage your team and see exactly how the business is doing — all in one place.</p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            {["Live stock levels & low-stock alerts", "Fast in-store point of sale", "Sales, profit & performance reports", "Owner, manager & cashier roles"].map((f) => (
              <li key={f} className="flex items-center gap-2"><span className="text-[var(--volt,#c7f23a)]">✓</span>{f}</li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-white/60">© {new Date().getFullYear()} NEMTEK Store Ghana · Internal system</div>
      </div>

      {/* form side */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-black">Staff sign in</h2>
          <p className="mt-1 text-sm text-[var(--text-soft)]">Enter your work email and 4-digit PIN.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><label className="label">Work email</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@nemtek.gh" /></div>
            <div><label className="label">PIN</label><input className="input tracking-[0.4em]" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" /></div>
            {err && <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "#fde6ea", color: "var(--red)" }}>{err}</div>}
            <button className="btn btn-primary w-full">Sign in</button>
          </form>

          <div className="mt-6 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
            <div className="mb-2 text-xs font-semibold text-[var(--text-faint)]">DEMO ACCOUNTS — tap to fill</div>
            <div className="space-y-1.5">
              {workers.map((w) => (
                <button key={w.id} onClick={() => quick(w.email, w.pin)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--surface-2)]">
                  <span><b>{w.name}</b> <span className="text-[var(--text-faint)]">· {w.email}</span></span>
                  <span className="pill pill-blue">{ROLE_LABEL[w.role]} · {w.pin}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
