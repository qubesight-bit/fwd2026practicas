import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ScaledSlide } from "@/components/ScaledSlide";
import slides from "@/lib/slides-data";

export const Route = createFileRoute("/")({
  component: Deck,
});

function Deck() {
  const [i, setI] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const total = slides.length;

  const go = useCallback((n: number) => setI((c) => Math.max(0, Math.min(total - 1, n ?? c))), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(i + 1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(i - 1); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
      else if (e.key.toLowerCase() === "g") setShowGrid((v) => !v);
      else if (e.key === "f" || e.key === "F5") {
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
      else if (e.key === "Escape") setShowGrid(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go, total]);

  useEffect(() => {
    document.title = `${i + 1}/${total} — ${slides[i].title}`;
  }, [i, total]);

  const slide = slides[i];

  return (
    <main className="fixed inset-0 bg-background text-foreground overflow-hidden">
      {/* Slide canvas */}
      <div className="absolute inset-0">
        <ScaledSlide key={slide.id}>{slide.render()}</ScaledSlide>
      </div>

      {/* Click zones for tap navigation */}
      <button
        aria-label="Previous slide"
        onClick={() => go(i - 1)}
        className="absolute left-0 top-0 h-full w-1/4 z-10 cursor-w-resize opacity-0"
      />
      <button
        aria-label="Next slide"
        onClick={() => go(i + 1)}
        className="absolute right-0 top-0 h-full w-1/4 z-10 cursor-e-resize opacity-0"
      />

      {/* Bottom pill: nav + progress */}
      <div className="absolute left-1/2 bottom-6 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full px-2 py-2 hair backdrop-blur-md"
           style={{ background: "oklch(0.14 0.012 55 / 0.7)" }}>
        <button
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="rounded-full px-4 py-2 slide-mono text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-white/5 transition"
        >
          ←
        </button>
        <div className="flex items-center gap-1 px-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => go(idx)}
              aria-label={`Slide ${idx + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: idx === i ? 28 : 8,
                background: idx === i ? "var(--signal)" : "oklch(1 0 0 / 0.25)",
              }}
            />
          ))}
        </div>
        <span className="slide-mono text-xs px-3" style={{ letterSpacing: "0.15em", color: "oklch(0.72 0.02 70)" }}>
          {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          onClick={() => go(i + 1)}
          disabled={i === total - 1}
          className="rounded-full px-4 py-2 slide-mono text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-white/5 transition"
        >
          →
        </button>
        <div className="w-px h-6 mx-1" style={{ background: "var(--hair)" }} />
        <button
          onClick={() => setShowGrid(true)}
          className="rounded-full px-4 py-2 slide-mono text-xs uppercase tracking-widest hover:bg-white/5 transition"
          title="Overview (G)"
        >
          Vista
        </button>
      </div>

      {/* Top-left brand */}
      <div className="absolute top-6 left-8 z-20 slide-mono text-xs" style={{ letterSpacing: "0.2em", color: "oklch(0.6 0.02 70)" }}>
        REDES · FRONTEND · <span style={{ color: "var(--signal)" }}>GUÍA VISUAL</span>
      </div>

      {/* Top-right hint */}
      <div className="absolute top-6 right-8 z-20 slide-mono text-[10px]" style={{ letterSpacing: "0.2em", color: "oklch(0.55 0.02 70)" }}>
        ← / → NAVEGAR · G VISTA · F PANTALLA COMPLETA
      </div>

      {/* Grid overview */}
      {showGrid && (
        <div className="absolute inset-0 z-30 backdrop-blur-xl overflow-auto" style={{ background: "oklch(0.14 0.012 55 / 0.92)" }}>
          <div className="max-w-[1600px] mx-auto p-16">
            <div className="flex items-baseline justify-between mb-12 hair-b pb-6">
              <h2 className="slide-title" style={{ fontSize: 56, fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                Todas las diapositivas
              </h2>
              <button onClick={() => setShowGrid(false)} className="slide-mono text-xs uppercase tracking-widest hover:text-white/80">
                Cerrar ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => { go(idx); setShowGrid(false); }}
                  className="group text-left"
                >
                  <div className="relative aspect-video overflow-hidden rounded-2xl hair transition-all group-hover:scale-[1.02]"
                       style={{ outline: idx === i ? "2px solid var(--signal)" : "none", outlineOffset: 4 }}>
                    <ScaledSlide>{s.render()}</ScaledSlide>
                  </div>
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="slide-mono text-xs" style={{ letterSpacing: "0.15em", color: "var(--signal)" }}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                      {s.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
