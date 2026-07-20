import { useState } from "react";

/** Evaluates a small subset of boolean expressions safely.
 * Supported: numbers, + - * / %, comparisons (== != > < >= <=), && || !, parens.
 * NO identifiers, NO function calls. If parsing fails, returns { error }.
 */
function safeEval(expr: string): { value?: boolean | number; error?: string } {
  const cleaned = expr.trim();
  if (!cleaned) return { error: "Escribe una expresión." };
  if (!/^[\d\s+\-*/%()<>=!&|.]+$/.test(cleaned)) return { error: "Solo números, comparadores y && || !" };
  try {
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict"; return (${cleaned});`)();
    if (typeof v !== "boolean" && typeof v !== "number") return { error: "Resultado inesperado" };
    return { value: v };
  } catch {
    return { error: "Expresión no válida" };
  }
}

const PRESETS = [
  "(10>5) && (4<4)",
  "(7 >= 7) || (2 < 0)",
  "!(7>=2)",
  "(5 == 5)",
  "(5 > 2) && !(2==4)",
  "4>2 && (2==0 || 0>-1)",
  "(2*5) == 10",
  "100 <= (111-1)",
];

export default function BoolPlayground() {
  const [expr, setExpr] = useState("(5 > 2) && !(2==4)");
  const res = safeEval(expr);

  return (
    <div className="rounded-3xl hair-a p-6 md:p-8 my-8" style={{ background: "oklch(0.16 0.012 55)" }}>
      <div className="kicker mb-3">Evaluador en vivo</div>
      <h3 className="text-2xl italic mb-4">Prueba tú mismo</h3>
      <p className="text-sm mb-6" style={{ color: "oklch(0.82 0.02 70)" }}>
        Escribe una expresión con <span className="mono">&gt; &lt; &gt;= &lt;= == !=</span> y{" "}
        <span className="mono">&amp;&amp; || !</span>. Verás si el resultado es <em>verdadero</em> o <em>falso</em>.
      </p>

      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          className="flex-1 rounded-xl px-4 py-3 mono text-base hair-a focus:outline-none focus:ring-2 focus:ring-[var(--signal)]"
          style={{ background: "oklch(0.11 0.008 55)" }}
          placeholder="(5 > 2) && !(2==4)"
          spellCheck={false}
        />
        <div className="rounded-xl px-6 py-3 min-w-[180px] flex items-center justify-center mono text-lg"
             style={{
               background: res.error ? "oklch(0.22 0.014 55)" : (res.value ? "var(--mint)" : "var(--signal)"),
               color: res.error ? "var(--paper)" : "var(--ink)",
             }}>
          {res.error ? <span className="text-sm opacity-80">{res.error}</span> :
           res.value ? "✓ verdadero" : "✗ falso"}
        </div>
      </div>

      <div className="mt-6">
        <div className="mono text-[11px] uppercase tracking-widest opacity-60 mb-2">Ejemplos — haz clic para probar</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setExpr(p)}
              className="mono text-xs px-3 py-1.5 rounded-full hair-a hover:bg-[var(--signal)] hover:text-[var(--ink)] transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
