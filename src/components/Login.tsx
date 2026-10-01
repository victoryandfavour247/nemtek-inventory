"use client";
import { useState } from "react";
import { useStore } from "@/store/Store";
import { DEMO_CREDS, ROLE_LABEL } from "@/lib/inventory";
import Brand from "./Brand";

export default function Login() {
  const { login, signUp } = useStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErr(""); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") {
      const r = login(form.email, form.password);
      if (!r.ok) setErr(r.error ?? "Sign in failed");
    } else {
      if (form.password !== form.confirm) { setErr("Passwords do not match."); return; }
      const r = signUp(form.name, form.email, form.password);
      if (!r.ok) setErr(r.error ?? "Sign up failed");
    }
  };
  const quick = (email: string, password: string) => { setMode("signin"); setForm({ name: "", email, password, confirm: "" }); setErr(""); };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* brand side */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex" style={{ background: "linear-gradient(140deg,#0b2a6b,#1e52e6)" }}>
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full"><defs><pattern id="m" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect x="0" y="8" width="15" height="4" rx="2" fill="#9fc0ff"/></pattern></defs><rect width="100%" height="100%" fill="url(#m)"/></svg>
        </div>
        <div className="relative"><Brand size={46} light /></div>
        <div className="relative">
          <h1 className="text-4xl font-black leading-tight">Run your store<br/>like clockwork.</h1>
          <p className="mt-4 max-w-sm text-white/80">Track stock in real time, ring up customer sales, manage your team and see exactly how the business is doing — all in one place.</p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            {["Live stock levels & low-stock alerts", "Fast in-store point of sale", "Sales, profit & performance reports", "Owner, manager & cashier roles"].map((f) => (
              <li key={f} className="flex items-center gap-2"><span style={{ color: "#c7f23a" }}>✓</span>{f}</li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-white/60">© {new Date().getFullYear()} NEMTEK Store Ghana · Internal system</div>
      </div>

      {/* form side */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden"><Brand size={44} /></div>

          {/* tabs */}
          <div className="mb-6 flex rounded-xl p-1" style={{ background: "var(--surface-2)" }}>
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }} className="flex-1 rounded-lg py-2.5 text-sm font-bold transition"
                style={mode === m ? { background: "var(--surface)", boxShadow: "var(--shadow-sm)", color: "var(--navy)" } : { color: "var(--text-faint)" }}>
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-black">{mode === "signin" ? "Staff sign in" : "Create your account"}</h2>
          <p className="mt-1 text-sm text-[var(--text-soft)]">{mode === "signin" ? "Enter your work email and password." : "New team members start as cashiers. The owner can upgrade your role."}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div><label className="label">Full name</label><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Kofi Mensah" /></div>
            )}
            <div><label className="label">Work email</label><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@nemtek.gh" /></div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-12" type={show ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"} />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-[var(--text-faint)] hover:bg-[var(--surface-2)]">{show ? "Hide" : "Show"}</button>
              </div>
            </div>
            {mode === "signup" && (
              <div><label className="label">Confirm password</label><input className="input" type={show ? "text" : "password"} value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="Re-enter password" /></div>
            )}

            {err && <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "#fde6ea", color: "var(--red)" }}>{err}</div>}

            <button className="btn btn-primary w-full !py-3">{mode === "signin" ? "Sign in" : "Create account"}</button>
          </form>

          {mode === "signin" && (
            <div className="mt-6 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
              <div className="mb-2 text-xs font-semibold text-[var(--text-faint)]">DEMO ACCOUNTS — tap to fill</div>
              <div className="space-y-1.5">
                {DEMO_CREDS.map((d) => (
                  <button key={d.email} onClick={() => quick(d.email, d.password)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--surface-2)]">
                    <span><b>{d.name}</b></span>
                    <span className="pill pill-blue">{ROLE_LABEL[d.role]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
