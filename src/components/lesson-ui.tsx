import type { ReactNode } from "react";

/* ---------- Shared primitives used across lessons ---------- */

export function Kicker({ children }: { children: ReactNode }) {
  return <div className="kicker mb-4">{children}</div>;
}

export function Section({ id, kicker, title, children }: { id?: string; kicker?: string; title: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="py-16 md:py-24 hair-b last:border-b-0">
      {kicker && <Kicker>{kicker}</Kicker>}
      <h2 className="text-4xl md:text-6xl mb-8 max-w-4xl leading-[1.05]">{title}</h2>
      <div className="max-w-4xl text-[17px] md:text-lg leading-relaxed space-y-5" style={{ color: "oklch(0.9 0.02 70)" }}>
        {children}
      </div>
    </section>
  );
}

export function Callout({ tone = "neutral", label, children }: { tone?: "neutral" | "warn" | "ok"; label?: string; children: ReactNode }) {
  const color = tone === "warn" ? "var(--signal)" : tone === "ok" ? "var(--mint)" : "var(--paper)";
  return (
    <div className="rounded-2xl hair-a p-6 md:p-8 my-6" style={{ background: "oklch(0.18 0.014 55)" }}>
      {label && <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color }}>{label}</div>}
      <div className="text-base md:text-lg">{children}</div>
    </div>
  );
}

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="rounded-2xl hair-a p-5 md:p-6 my-4 overflow-x-auto mono text-sm md:text-[15px] leading-relaxed" style={{ background: "oklch(0.11 0.008 55)" }}>
      <code>{children}</code>
    </pre>
  );
}

export function Sig({ children }: { children: ReactNode }) {
  return <span style={{ color: "var(--signal)" }}>{children}</span>;
}
