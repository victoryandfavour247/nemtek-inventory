"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";

export default function BarcodeScanner({
  onDetected, onClose, title = "Scan barcode",
}: { onDetected: (code: string) => void; onClose: () => void; title?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState("");
  const [manual, setManual] = useState("");

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) { setError("Camera not available in this browser."); return; }
        let deviceId: string | undefined;
        try {
          const devices = await BrowserMultiFormatReader.listVideoInputDevices();
          const back = devices.find((d) => /back|rear|environment/i.test(d.label));
          deviceId = (back ?? devices[devices.length - 1])?.deviceId;
        } catch { /* fall through to default camera */ }
        if (cancelled) return;
        controlsRef.current = await reader.decodeFromVideoDevice(deviceId, videoRef.current!, (result) => {
          if (result) { onDetected(result.getText()); controlsRef.current?.stop(); }
        });
      } catch (e) {
        const msg = (e as Error)?.message ?? "";
        setError(/permission|denied|notallowed/i.test(msg) ? "Camera permission was blocked. Allow camera access, or type the code below." : "Could not start the camera. Type the code below instead.");
      }
    })();
    return () => { cancelled = true; try { controlsRef.current?.stop(); } catch {} };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--surface-2)]">✕</button>
        </div>

        <div className="relative aspect-[4/3] w-full bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          {!error && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="h-24 w-56 rounded-xl border-2 border-white/80" style={{ boxShadow: "0 0 0 2000px rgba(0,0,0,.25)" }} />
            </div>
          )}
          {error && <div className="absolute inset-0 grid place-items-center p-5 text-center text-sm text-white">{error}</div>}
        </div>

        <div className="p-4">
          <p className="mb-2 text-xs text-[var(--text-faint)]">{error ? "Enter the barcode manually:" : "Point the camera at a barcode — it fills in automatically."}</p>
          <div className="flex gap-2">
            <input className="input" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Type barcode…" inputMode="numeric"
              onKeyDown={(e) => { if (e.key === "Enter" && manual.trim()) onDetected(manual.trim()); }} />
            <button className="btn btn-primary" disabled={!manual.trim()} onClick={() => onDetected(manual.trim())}>Use</button>
          </div>
        </div>
      </div>
    </div>
  );
}
