import { getRules } from "@/lib/rules";

/**
 * Panel "🧠 Por qué" que se muestra tras una respuesta incorrecta.
 * Explica por qué la solución correcta funciona (usando la explicación del
 * ejercicio) y por qué la respuesta del alumno no pasa (usando pistas
 * específicas + las reglas del tema).
 */
export function WhyBox({
  tag,
  correctText,
  correctExplain,
  wrongText,
  wrongReasons,
  maxRules = 3,
}: {
  tag: string;
  correctText?: string;
  correctExplain: string;
  wrongText?: string;
  wrongReasons?: string[];
  maxRules?: number;
}) {
  const rules = getRules(tag).slice(0, maxRules);

  return (
    <div
      className="mt-2 p-2 text-[12px]"
      style={{ background: "#eef4ff", border: "1px solid #808080" }}
    >
      <div className="font-bold mb-1">🧠 Por qué</div>

      <div className="mb-1">
        <span
          className="mono text-[10px] px-1 text-white"
          style={{ background: "#008000" }}
        >
          ✓ CORRECTA
        </span>{" "}
        {correctText && <b>{correctText}</b>}
        <div className="opacity-90 mt-0.5 whitespace-pre-line">Funciona porque: {correctExplain}</div>
      </div>

      {(wrongText || (wrongReasons && wrongReasons.length > 0)) && (
        <div className="mb-1">
          <span
            className="mono text-[10px] px-1 text-white"
            style={{ background: "#c00000" }}
          >
            ✗ TU RESPUESTA
          </span>{" "}
          {wrongText && <b>{wrongText}</b>}
          {wrongReasons && wrongReasons.length > 0 && (
            <ul className="list-disc pl-5 mt-0.5">
              {wrongReasons.slice(0, 4).map((r, i) => (
                <li key={i}>No pasa porque: {r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {rules.length > 0 && (
        <div className="mt-1 pt-1" style={{ borderTop: "1px dashed #808080" }}>
          <div className="mono text-[10px] opacity-70 mb-0.5">
            📏 REGLAS DE {tag.toUpperCase()} QUE APLICAN AQUÍ
          </div>
          <ul className="list-disc pl-5">
            {rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
