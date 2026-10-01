export default function Stat({
  label, value, sub, color = "var(--blue)", icon,
}: { label: string; value: string; sub?: string; color?: string; icon?: React.ReactNode }) {
  const currency = value.match(/^(GH₵)\s+(.+)$/);

  return (
    <div className="card relative min-h-[164px] overflow-hidden p-5">
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
      <div className="flex items-start justify-between gap-4">
        <div className="pt-0.5 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--text-faint)]">{label}</div>
        {icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: color + "1a", color }}>{icon}</span>}
      </div>
      <div className="mt-4 flex min-w-0 items-baseline gap-1.5 whitespace-nowrap leading-none" style={{ color: "var(--text)" }}>
        {currency ? (
          <>
            <span className="text-base font-extrabold tracking-tight">{currency[1]}</span>
            <span className="text-[clamp(1.65rem,2.15vw,2.1rem)] font-black tracking-[-0.045em] tabular-nums">{currency[2]}</span>
          </>
        ) : (
          <span className="text-[2.1rem] font-black tracking-[-0.045em] tabular-nums">{value}</span>
        )}
      </div>
      {sub && <div className="mt-2 text-xs leading-5 text-[var(--text-soft)]">{sub}</div>}
    </div>
  );
}
