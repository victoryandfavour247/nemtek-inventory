export default function Stat({
  label, value, sub, color = "var(--blue)", icon,
}: { label: string; value: string; sub?: string; color?: string; icon?: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[12.5px] font-semibold text-[var(--text-faint)]">{label}</div>
          <div className="mt-1 text-2xl font-black" style={{ color: "var(--text)" }}>{value}</div>
          {sub && <div className="mt-0.5 text-xs text-[var(--text-soft)]">{sub}</div>}
        </div>
        {icon && <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: color + "1a", color }}>{icon}</span>}
      </div>
    </div>
  );
}
