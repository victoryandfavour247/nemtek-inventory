import Image from "next/image";

export default function Brand({
  size = 40,
  light = false,
  showText = true,
}: { size?: number; light?: boolean; showText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span className="relative shrink-0 overflow-hidden rounded-xl bg-white" style={{ width: size, height: size, boxShadow: light ? "0 0 0 1px rgba(255,255,255,.3)" : "var(--shadow-sm)" }}>
        <Image src="/brand/logo.png" alt="NEMTEK" fill sizes={`${size}px`} className="object-contain p-0.5" />
      </span>
      {showText && (
        <span className="leading-none">
          <span className="block text-[15px] font-black" style={{ color: light ? "#fff" : "var(--text)" }}>NEMTEK</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: light ? "rgba(255,255,255,.7)" : "var(--text-faint)" }}>Inventory</span>
        </span>
      )}
    </span>
  );
}
