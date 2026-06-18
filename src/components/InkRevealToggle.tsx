"use client";

import { useState } from "react";
import InkReveal from "@/components/InkReveal";

export default function InkRevealToggle() {
  const [enabled, setEnabled] = useState(false); // default OFF

  return (
    <>
      <button
        type="button"
        onClick={() => setEnabled((v) => !v)}
        className="fixed right-4 top-4 z-[10000] rounded-full border border-[rgba(232,201,122,0.28)] bg-[rgba(20,9,32,0.88)] px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[var(--gold-300)] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:bg-[rgba(232,201,122,0.12)]"
        aria-pressed={enabled}
        aria-label={enabled ? "Tắt Ink Reveal" : "Bật Ink Reveal"}
      >
        {enabled ? "INK: ON" : "INK: OFF"}
      </button>

      {enabled ? (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <InkReveal
            className="pointer-events-auto"
            maskColor={[10, 6, 18]}
            brushSize={150}
            lifetime={800}
          />
        </div>
      ) : null}
    </>
  );
}
