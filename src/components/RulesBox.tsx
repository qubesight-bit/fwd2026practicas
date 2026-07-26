import { useState } from "react";
import { getRules } from "@/lib/rules";

/**
 * Pequeño panel plegable "📏 Reglas" que muestra los recordatorios de sintaxis
 * asociados al tema (HTML, CSS, JS, TERMINAL, …). Se usa en cada ejercicio del
 * simulador y en cada pregunta del quiz.
 */
export function RulesBox({
  tag,
  defaultOpen = false,
  compact = false,
}: {
  tag: string;
  defaultOpen?: boolean;
  compact?: boolean;
}) {
  const rules = getRules(tag);
  const [open, setOpen] = useState(defaultOpen);
  if (rules.length === 0) return null;

  return (
    <div
      className={compact ? "mt-2" : "mt-2"}
      style={{ background: "#fffbe0", border: "1px solid #808080" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2 py-1 text-[12px]"
        style={{ background: "#ffe89c", borderBottom: open ? "1px solid #808080" : "none" }}
      >
        <span>
          <b>📏 Reglas de {tag.toUpperCase()}</b>
          <span className="opacity-70"> — recuérdalas siempre</span>
        </span>
        <span className="mono">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className={`p-2 pl-6 text-[12px] leading-snug list-disc ${compact ? "space-y-0.5" : "space-y-1"}`}>
          {rules.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
