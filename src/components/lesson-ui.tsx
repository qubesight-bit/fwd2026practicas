import { useState, type ReactNode } from "react";

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

/**
 * Palabra/concepto nuevo: primero la INTENCIÓN, después cómo se escribe.
 * El estudiante no memoriza sintaxis; entiende qué le dice al programa.
 */
export function IntentBlock({
  keyword,
  intention,
  spanish,
  code,
  note,
}: {
  /** Palabra nueva: switch, while, map… */
  keyword: string;
  /** ¿Qué le quiero decir al programa? */
  intention: ReactNode;
  /** Cómo se diría en español / cadena de frases */
  spanish?: ReactNode | string[];
  /** Cómo se escribe (solo después) */
  code: ReactNode | string;
  note?: ReactNode;
}) {
  const phrases = Array.isArray(spanish) ? spanish : null;

  return (
    <div className="my-6 rounded-2xl hair-a overflow-hidden" style={{ background: "oklch(0.16 0.012 55)" }}>
      <div className="px-5 pt-5 pb-3 flex flex-wrap items-baseline gap-3">
        <span className="mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--signal)" }}>
          Palabra nueva
        </span>
        <span className="mono text-2xl" style={{ color: "var(--mint)" }}>{keyword}</span>
      </div>
      <div className="px-5 py-4" style={{ background: "oklch(0.14 0.02 55)" }}>
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--mint)" }}>
          Primero · ¿Qué le quiero decir al programa?
        </div>
        <div className="text-xl md:text-2xl leading-snug italic">{intention}</div>
        {phrases && (
          <ol className="mt-4 space-y-0 list-none text-base">
            {phrases.map((p, i) => (
              <li key={i}>
                <div className="py-1.5">{p}</div>
                {i < phrases.length - 1 && <div className="mono text-sm opacity-40">↓</div>}
              </li>
            ))}
          </ol>
        )}
        {spanish && !phrases && (
          <div className="mt-3 text-base md:text-lg whitespace-pre-line">{spanish}</div>
        )}
      </div>
      <div className="px-5 py-4" style={{ borderTop: "1px solid oklch(0.28 0.02 55)" }}>
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--paper)" }}>
          Después · Cómo se escribe
        </div>
        {typeof code === "string" ? <CodeBlock>{code}</CodeBlock> : code}
      </div>
      {note && (
        <div className="px-5 pb-4 text-sm opacity-80">{note}</div>
      )}
      <div className="px-5 pb-4 mono text-xs opacity-50">
        Aprendes por intención, no por sintaxis
      </div>
    </div>
  );
}

/**
 * Fórmulas: español → calculadora → JavaScript.
 * El código es la misma operación que ya entendiste.
 */
export function FormulaBlock({
  title,
  spanish,
  calculator,
  code,
  symbols,
}: {
  title?: string;
  /** Leer la fórmula en español */
  spanish: ReactNode;
  /** Resolverla como con calculadora (números concretos) */
  calculator: ReactNode;
  /** Traducir a JS */
  code: string;
  /** Justificar símbolos */
  symbols?: Array<{ mark: string; means: string }>;
}) {
  return (
    <div className="my-6 rounded-2xl hair-a overflow-hidden" style={{ background: "oklch(0.16 0.012 55)" }}>
      {title && (
        <div className="px-5 pt-5 mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--signal)" }}>
          {title}
        </div>
      )}
      <div className="px-5 py-4">
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--mint)" }}>
          1 · Leer en español
        </div>
        <div className="text-base md:text-lg">{spanish}</div>
      </div>
      <div className="px-5 py-4" style={{ borderTop: "1px solid oklch(0.28 0.02 55)" }}>
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--mint)" }}>
          2 · Como con una calculadora
        </div>
        <div className="text-base md:text-lg">{calculator}</div>
      </div>
      <div className="px-5 py-4" style={{ borderTop: "1px solid oklch(0.28 0.02 55)" }}>
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--paper)" }}>
          3 · Traducir a JavaScript
        </div>
        <CodeBlock>{code}</CodeBlock>
      </div>
      {symbols && symbols.length > 0 && (
        <div className="px-5 pb-4">
          <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2 opacity-70">Cada símbolo</div>
          <ul className="space-y-1 text-sm">
            {symbols.map((s) => (
              <li key={s.mark}>
                <span className="mono" style={{ color: "var(--signal)" }}>{s.mark}</span>
                {" — "}{s.means}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="px-5 pb-4 mono text-xs opacity-50">
        Misma operación · distinto idioma
      </div>
    </div>
  );
}

/**
 * Forma de trabajar: ¿Qué quiero decirle al programa? (frases ↓) → traducir cada frase.
 * tellProgram es el corazón: obligatorio. El código solo traduce esas frases.
 */
export function SolveBlock({
  ask,
  person,
  tellProgram,
  lines,
  title,
  lang = "JavaScript",
  whySymbols,
}: {
  /** Reformular el enunciado (breve) */
  ask: ReactNode;
  /** Cómo lo haría una persona / fórmula humana */
  person?: ReactNode;
  /** Paso A — cadena de frases (OBLIGATORIO) */
  tellProgram: string[];
  /** Paso B — cada frase → código (mismo orden que tellProgram cuando sea posible) */
  lines: Array<{ es: string; code: string }>;
  title?: string;
  lang?: "JavaScript" | "HTML" | "CSS";
  /** ¿Por qué / de dónde salen los símbolos? */
  whySymbols?: ReactNode;
}) {
  return (
    <div className="my-6 space-y-0 rounded-2xl hair-a overflow-hidden" style={{ background: "oklch(0.16 0.012 55)" }}>
      {title && (
        <div className="px-5 pt-5 pb-1 mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--signal)" }}>
          {title}
        </div>
      )}

      <div className="px-5 py-4">
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "oklch(0.7 0.02 70)" }}>
          El enunciado · ¿Qué me pide?
        </div>
        <div className="text-base md:text-lg">{ask}</div>
      </div>

      {person && (
        <div className="px-5 py-4" style={{ borderTop: "1px solid oklch(0.28 0.02 55)" }}>
          <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "oklch(0.7 0.02 70)" }}>
            Como persona (sin código)
          </div>
          <div className="text-base md:text-lg">{person}</div>
        </div>
      )}

      {whySymbols && (
        <div className="px-5 py-4" style={{ borderTop: "1px solid oklch(0.28 0.02 55)" }}>
          <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--signal)" }}>
            ¿Por qué estos símbolos? ¿De dónde salen?
          </div>
          <div className="text-base md:text-lg space-y-3">{whySymbols}</div>
        </div>
      )}

      {/* PASO A — el corazón */}
      <div
        className="px-5 py-5"
        style={{ borderTop: "1px solid oklch(0.28 0.02 55)", background: "oklch(0.14 0.02 55)" }}
      >
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1" style={{ color: "var(--mint)" }}>
          Paso A · Antes de cualquier línea de código
        </div>
        <h3 className="text-2xl md:text-3xl mb-4 leading-tight" style={{ color: "var(--paper)" }}>
          ¿Qué quiero decirle al programa?
        </h3>
        <ol className="space-y-0 list-none pl-0 text-base md:text-lg">
          {tellProgram.map((s, i) => (
            <li key={i}>
              <div className="py-2">{s}</div>
              {i < tellProgram.length - 1 && (
                <div className="mono text-sm opacity-40 pl-1 select-none">↓</div>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* PASO B — traducción */}
      <div className="px-5 py-5" style={{ borderTop: "1px solid oklch(0.28 0.02 55)" }}>
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1" style={{ color: "var(--paper)" }}>
          Paso B · Ahora sí
        </div>
        <h3 className="text-xl md:text-2xl mb-4 leading-tight">
          Traducir cada frase a {lang}
        </h3>
        <div className="space-y-4">
          {lines.map((row, i) => (
            <div key={i}>
              <div className="text-sm mb-1.5 flex gap-2 items-baseline">
                <span className="mono text-[10px] uppercase tracking-wider shrink-0" style={{ color: "var(--mint)" }}>
                  Frase {i + 1}
                </span>
                <span className="opacity-85">{row.es}</span>
              </div>
              <pre className="rounded-xl hair-a px-4 py-2.5 overflow-x-auto mono text-sm" style={{ background: "oklch(0.11 0.008 55)" }}>
                <code>{row.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-4 pt-2 mono text-xs opacity-60 tracking-wide">
        Pensamientos → frases en español → código. No memorizas: traduces.
      </div>
    </div>
  );
}

/**
 * Traducción en 3 niveles: español → lógica → código.
 * El estudiante no memoriza JS: traduce una idea.
 */
export function TranslateBlock({
  natural,
  pseudo,
  code,
  title,
}: {
  /** Nivel 1: instrucciones en lenguaje natural */
  natural: ReactNode | string[];
  /** Nivel 2: algoritmo / pseudocódigo en español */
  pseudo: ReactNode | string;
  /** Nivel 3: JavaScript (u otro código) */
  code: ReactNode | string;
  title?: string;
}) {
  const naturalList = Array.isArray(natural) ? natural : null;

  return (
    <div className="my-6 space-y-3 rounded-2xl hair-a overflow-hidden" style={{ background: "oklch(0.16 0.012 55)" }}>
      {title && (
        <div className="px-5 pt-5 mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--signal)" }}>
          {title}
        </div>
      )}
      <div className="px-5 pt-4 pb-2">
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--mint)" }}>
          Nivel 1 · Lenguaje natural
        </div>
        {naturalList ? (
          <ol className="space-y-1.5 list-decimal pl-5 text-base md:text-lg">
            {naturalList.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        ) : (
          <div className="text-base md:text-lg whitespace-pre-line">{natural}</div>
        )}
      </div>
      <div className="px-5 py-3" style={{ borderTop: "1px solid oklch(0.28 0.02 55)" }}>
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--mint)" }}>
          Nivel 2 · Pseudocódigo
        </div>
        <pre className="mono text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap opacity-95">
          {typeof pseudo === "string" ? pseudo : null}
        </pre>
        {typeof pseudo !== "string" && <div className="text-base md:text-lg">{pseudo}</div>}
      </div>
      <div className="px-5 pb-5 pt-3" style={{ borderTop: "1px solid oklch(0.28 0.02 55)" }}>
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--paper)" }}>
          Nivel 3 · Código
        </div>
        {typeof code === "string" ? <CodeBlock>{code}</CodeBlock> : code}
      </div>
      <div className="px-5 pb-4 mono text-xs opacity-60 tracking-wide">
        Español → Lógica → Código
      </div>
    </div>
  );
}

/**
 * Bloque pedagógico fijo: Qué → Por qué → Cómo → Ejemplo → Analogía → Código.
 * Usar en cada concepto nuevo para construir modelo mental antes de la sintaxis.
 */
export function LearnBlock({
  what,
  why,
  how,
  example,
  analogy,
  code,
}: {
  what: ReactNode;
  why: ReactNode;
  how?: ReactNode | string[];
  example?: ReactNode;
  analogy?: ReactNode;
  code?: ReactNode;
}) {
  const howSteps = Array.isArray(how) ? how : null;
  const howNode = !Array.isArray(how) ? how : null;

  return (
    <div className="my-6 space-y-4 rounded-2xl hair-a p-5 md:p-7" style={{ background: "oklch(0.16 0.012 55)" }}>
      <div>
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--signal)" }}>Qué es</div>
        <div className="text-base md:text-lg">{what}</div>
      </div>
      <div>
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--signal)" }}>Por qué existe</div>
        <div className="text-base md:text-lg">{why}</div>
      </div>
      {(howSteps || howNode) && (
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--signal)" }}>Cómo funciona (paso a paso)</div>
          {howSteps ? (
            <ol className="space-y-2 list-decimal pl-5 text-base md:text-lg">
              {howSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <div className="text-base md:text-lg">{howNode}</div>
          )}
        </div>
      )}
      {example && (
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--mint)" }}>Ejemplo sencillo</div>
          <div className="text-base md:text-lg">{example}</div>
        </div>
      )}
      {analogy && (
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--mint)" }}>Analogía</div>
          <div className="text-base md:text-lg italic">{analogy}</div>
        </div>
      )}
      {code && (
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--paper)" }}>El código</div>
          {typeof code === "string" ? <CodeBlock>{code}</CodeBlock> : code}
        </div>
      )}
    </div>
  );
}

/** Flashcards: toca para voltear pregunta ↔ respuesta */
export function FlashcardDeck({
  cards,
}: {
  cards: Array<{ q: string; a: string }>;
}) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[i];
  if (!card) return null;

  const go = (dir: -1 | 1) => {
    setFlipped(false);
    setI((v) => Math.min(cards.length - 1, Math.max(0, v + dir)));
  };

  return (
    <div className="my-6">
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        className="w-full text-left rounded-2xl hair-a p-6 md:p-8 min-h-[180px] transition-colors"
        style={{ background: flipped ? "oklch(0.22 0.03 145)" : "oklch(0.18 0.014 55)" }}
      >
        <div className="mono text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--signal)" }}>
          {flipped ? "Respuesta · toca para volver" : "Pregunta · toca para revelar"} · {i + 1}/{cards.length}
        </div>
        <div className="text-xl md:text-2xl leading-snug">{flipped ? card.a : card.q}</div>
      </button>
      <div className="flex gap-2 mt-3">
        <button type="button" className="w95-btn" disabled={i === 0} onClick={() => go(-1)}>← Anterior</button>
        <button type="button" className="w95-btn" onClick={() => setFlipped((v) => !v)}>
          {flipped ? "Ocultar" : "Voltear"}
        </button>
        <button type="button" className="w95-btn" disabled={i >= cards.length - 1} onClick={() => go(1)}>Siguiente →</button>
      </div>
    </div>
  );
}

type ExamItem =
  | { kind: "mc"; q: string; choices: string[]; answer: number; explain: string }
  | { kind: "tf"; q: string; answer: boolean; explain: string };

/** Mini examen interactivo dentro de una lección */
export function MiniExam({ items }: { items: ExamItem[] }) {
  const [picks, setPicks] = useState<(number | boolean | null)[]>(() => items.map(() => null));
  const [revealed, setRevealed] = useState(false);

  const score = items.reduce((acc, item, idx) => {
    const pick = picks[idx];
    if (pick === null) return acc;
    if (item.kind === "mc") return acc + (pick === item.answer ? 1 : 0);
    return acc + (pick === item.answer ? 1 : 0);
  }, 0);

  return (
    <div className="my-6 space-y-5">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-2xl hair-a p-5" style={{ background: "oklch(0.18 0.014 55)" }}>
          <div className="mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--signal)" }}>
            Pregunta {idx + 1}
          </div>
          <p className="mb-3 text-base md:text-lg font-medium">{item.q}</p>
          {item.kind === "mc" ? (
            <div className="space-y-2">
              {item.choices.map((c, ci) => {
                const selected = picks[idx] === ci;
                const isCorrect = revealed && ci === item.answer;
                const isWrong = revealed && selected && ci !== item.answer;
                return (
                  <button
                    key={ci}
                    type="button"
                    disabled={revealed}
                    onClick={() =>
                      setPicks((prev) => {
                        const next = [...prev];
                        next[idx] = ci;
                        return next;
                      })
                    }
                    className="w-full text-left rounded-xl px-3 py-2 text-sm border transition-colors"
                    style={{
                      borderColor: isCorrect ? "var(--mint)" : isWrong ? "var(--signal)" : selected ? "var(--signal)" : "oklch(0.3 0.02 55)",
                      background: isCorrect ? "oklch(0.22 0.04 145)" : isWrong ? "oklch(0.22 0.05 30)" : selected ? "oklch(0.2 0.02 55)" : "transparent",
                    }}
                  >
                    {String.fromCharCode(65 + ci)}) {c}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-2">
              {[true, false].map((val) => {
                const selected = picks[idx] === val;
                const isCorrect = revealed && val === item.answer;
                const isWrong = revealed && selected && val !== item.answer;
                return (
                  <button
                    key={String(val)}
                    type="button"
                    disabled={revealed}
                    onClick={() =>
                      setPicks((prev) => {
                        const next = [...prev];
                        next[idx] = val;
                        return next;
                      })
                    }
                    className="rounded-xl px-4 py-2 text-sm border"
                    style={{
                      borderColor: isCorrect ? "var(--mint)" : isWrong ? "var(--signal)" : selected ? "var(--signal)" : "oklch(0.3 0.02 55)",
                      background: isCorrect ? "oklch(0.22 0.04 145)" : isWrong ? "oklch(0.22 0.05 30)" : selected ? "oklch(0.2 0.02 55)" : "transparent",
                    }}
                  >
                    {val ? "Verdadero" : "Falso"}
                  </button>
                );
              })}
            </div>
          )}
          {revealed && (
            <p className="mt-3 text-sm opacity-90">
              <strong>Por qué:</strong> {item.explain}
            </p>
          )}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="w95-btn"
          onClick={() => setRevealed(true)}
          disabled={revealed || picks.some((p) => p === null)}
        >
          Corregir examen
        </button>
        {revealed && (
          <span className="text-sm">
            Resultado: <strong>{score}/{items.length}</strong>
          </span>
        )}
        {revealed && (
          <button
            type="button"
            className="w95-btn"
            onClick={() => {
              setPicks(items.map(() => null));
              setRevealed(false);
            }}
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
