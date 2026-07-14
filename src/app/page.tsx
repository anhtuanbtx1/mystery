"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import CosmicBackground from "@/components/CosmicBackground";

export default function HomePage() {
  const [started, setStarted] = useState(false);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--bg-dark)]">
      {/* Ported Multi-layer Background */}
      <CosmicBackground />

      {!started ? (
        <Hero onBegin={() => setStarted(true)} />
      ) : (
        <section className="relative z-10 min-h-screen flex items-center justify-center px-6 text-center">
          <div className="max-w-2xl rounded-[28px] border border-[#e8c97a]/20 bg-[rgba(20,9,32,0.82)] p-10 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--gold-400)] mb-4">Next.js Full-stack</p>
            <h2 className="font-display text-4xl text-[var(--gold-300)] text-glow mb-4">Khung FE + BE đã sẵn sàng</h2>
            <p className="text-[var(--parchment-300)] leading-8">
              Dự án đã được migrate sang Next.js với đầy đủ hiệu ứng Cinematic Background từ bản gốc.
              Bây giờ bạn có thể trải nghiệm cảm giác huyền ảo như bản HTML cũ trên nền tảng Next.js hiện đại.
            </p>
            <button 
              onClick={() => setStarted(false)}
              className="mt-8 px-8 py-2 rounded-full border border-[#e8c97a]/30 text-[var(--gold-400)] hover:bg-[#e8c97a]/10 transition-colors"
            >
              Quay lại Hero
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
