import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { W95Button } from "@/components/win95";
import { askTeacher, getTeacherSuggestions, type TeacherAnswer } from "@/lib/profesor-kb";
import { sfx } from "@/lib/gamification";

export const Route = createFileRoute("/profesor")({
  head: () => ({
    meta: [
      { title: "Profesor local — Redes 95" },
      {
        name: "description",
        content:
          "Preguntá lo que quieras. Te explica por qué, cómo y cómo resolver — solo con el material de la página, sin inteligencia artificial.",
      },
    ],
  }),
  component: ProfesorPage,
});

function ProfesorPage() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState<TeacherAnswer | null>(null);
  const suggestions = useMemo(() => getTeacherSuggestions(), []);

  const ask = (q?: string) => {
    const text = (q ?? input).trim();
    if (!text) return;
    setInput(text);
    const result = askTeacher(text);
    setAnswer(result);
    sfx.click();
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl md:text-4xl mb-1" style={{ fontFamily: "var(--font-display)", color: "#000080" }}>
          👨‍🏫 Profesor local
        </h1>
        <p className="text-[13px] max-w-3xl">
          Escribí <b>cualquier pregunta</b> sobre lo que hay en este sitio. Te respondo como profesor:
          <b> qué querés decir</b>, <b>por qué</b>, <b>cómo</b>, <b>cómo resolver</b> y <b>por qué así</b>.
        </p>
        <div
          className="mt-2 p-2 text-[12px] inline-block"
          style={{ background: "#ffffcc", border: "1px solid #808080" }}
        >
          ⚠ <b>Sin inteligencia artificial.</b> Solo busco en lecciones, diccionario JS, quiz y reglas
          ya publicadas aquí. Si no está en el material, te lo digo.
        </div>
      </div>

      <div className="w95-outset p-3 mb-4" style={{ background: "var(--w95-face)" }}>
        <label className="text-[12px] font-bold block mb-1" htmlFor="profesor-q">
          Tu pregunta
        </label>
        <textarea
          id="profesor-q"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask();
            }
          }}
          rows={3}
          placeholder="Ej: ¿Por qué typeof usa 'number' en minúsculas? ¿Qué es Blue-Green? ¿Cómo leo el texto de un elemento?"
          className="w-full w95-inset bg-white p-2 text-[13px] outline-none resize-y"
        />
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          <W95Button onClick={() => ask()}>📚 Explicar</W95Button>
          <W95Button
            onClick={() => {
              setInput("");
              setAnswer(null);
            }}
          >
            Limpiar
          </W95Button>
          <span className="text-[11px] opacity-70">Enter para preguntar · Shift+Enter nueva línea</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[12px] font-bold mb-1">Sugerencias (tocá una)</div>
        <div className="flex flex-wrap gap-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="w95-btn text-[11px]"
              onClick={() => ask(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {answer && (
        <div className="w95-outset p-0 overflow-hidden">
          <div className="w95-titlebar">
            <span>{answer.found ? "📖 Respuesta del material" : "📭 Sin coincidencia fuerte"}</span>
          </div>
          <div className="p-3 bg-white">
            <div className="text-[12px] mb-3 opacity-80">
              Preguntaste: <b>{answer.question}</b>
            </div>

            {!answer.found && (
              <div className="p-2 mb-3 text-[13px]" style={{ background: "#fff2e0", border: "1px solid #808080" }}>
                {answer.messageIfEmpty}
              </div>
            )}

            {answer.found && answer.sections && answer.best && (
              <div className="space-y-3 text-[13px]">
                <Block label="🧠 ¿Qué querés decirle / entender?">{answer.sections.intention}</Block>
                <Block label="📘 ¿Qué es?">{answer.sections.what}</Block>
                <Block label="💡 ¿Por qué existe / por qué importa?">{answer.sections.why}</Block>
                <div className="p-2" style={{ background: "#eef4ff", border: "1px solid #808080" }}>
                  <div className="font-bold mb-1">🛠 ¿Cómo funciona? (paso a paso)</div>
                  <ol className="list-decimal pl-5 space-y-1">
                    {answer.sections.how.map((step, i) => (
                      <li key={i} className="whitespace-pre-line">{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="p-2" style={{ background: "#e6ffe6", border: "1px solid #808080" }}>
                  <div className="font-bold mb-1">✅ Cómo resolverlo / ejemplo</div>
                  <pre className="mono text-[12px] whitespace-pre-wrap break-words">{answer.sections.solve}</pre>
                </div>
                <Block label="🎯 ¿Por qué así (y no de otra forma)?">{answer.sections.whyThatWay}</Block>
                {answer.sections.analogy && (
                  <Block label="🖼 Analogía">{answer.sections.analogy}</Block>
                )}
                {answer.sections.code && (
                  <div className="p-2" style={{ background: "#111", color: "#eee", border: "1px solid #808080" }}>
                    <div className="font-bold mb-1 text-[11px] uppercase opacity-80">Código del material</div>
                    <pre className="mono text-[12px] whitespace-pre-wrap">{answer.sections.code}</pre>
                  </div>
                )}
                <div className="text-[12px] pt-1">
                  Fuente:{" "}
                  <a href={answer.best.source.href} className="underline font-bold">
                    {answer.best.source.label}
                  </a>
                  <span className="opacity-70"> · tema {answer.best.topic}</span>
                </div>
              </div>
            )}

            {answer.related.length > 0 && (
              <div className="mt-4 pt-3" style={{ borderTop: "1px solid #808080" }}>
                <div className="font-bold text-[12px] mb-2">También relacionado en el sitio</div>
                <ul className="space-y-1 text-[12px]">
                  {answer.related.map((r) => (
                    <li key={r.id}>
                      <a href={r.source.href} className="underline">
                        {r.title}
                      </a>
                      <span className="opacity-70"> — {r.source.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w95-inset bg-white p-3 mt-6 text-[12px]">
        <b>Cómo funciona (sin IA):</b> tu pregunta se compara con el índice local (lecciones clave,
        cartillas del diccionario, preguntas del quiz y reglas). Se elige lo más parecido y se arma
        la explicación con ese texto. Si no hay coincidencia suficiente, no inventa.
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: string }) {
  return (
    <div className="p-2" style={{ background: "#f7f7f7", border: "1px solid #808080" }}>
      <div className="font-bold mb-1">{label}</div>
      <div className="whitespace-pre-line">{children}</div>
    </div>
  );
}
