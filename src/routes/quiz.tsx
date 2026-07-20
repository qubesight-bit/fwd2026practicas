import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { questions as ALL, type Question } from "@/lib/quiz-data";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz — Redes y Fundamentos" },
      { name: "description", content: "Doce preguntas mezcladas sobre DNS, HTTP, operadores lógicos, terminal y HTML. Con explicación al terminar." },
    ],
  }),
  component: Quiz,
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type State = "intro" | "playing" | "results";

function Quiz() {
  const [state, setState] = useState<State>("intro");
  const [deck, setDeck] = useState<Question[]>([]);
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);

  const start = () => {
    setDeck(shuffle(ALL));
    setPicks([]);
    setI(0);
    setLocked(false);
    setState("playing");
  };

  const q = deck[i];
  const pickedIdx = picks[i];

  const pick = (n: number) => {
    if (locked) return;
    setLocked(true);
    const next = [...picks];
    next[i] = n;
    setPicks(next);
  };

  const nextQ = () => {
    if (i < deck.length - 1) {
      setI(i + 1);
      setLocked(picks[i + 1] !== undefined);
    } else {
      setState("results");
    }
  };

  const score = useMemo(() => picks.reduce((acc, p, idx) => acc + (p === deck[idx]?.answer ? 1 : 0), 0), [picks, deck]);

  if (state === "intro") {
    return (
      <main className="max-w-[900px] mx-auto px-6 md:px-10 pt-16 md:pt-24">
        <div className="kicker mb-6">Auto-evaluación</div>
        <h1 className="text-5xl md:text-7xl mb-6">Modo <em>quiz.</em></h1>
        <p className="text-lg md:text-xl mb-10 max-w-2xl" style={{ color: "oklch(0.85 0.02 70)" }}>
          {ALL.length} preguntas mezcladas sobre DNS, HTTP, operadores lógicos, terminal y HTML.
          Verás la respuesta correcta y una explicación en cada pregunta.
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={start} className="mono text-xs uppercase tracking-widest px-6 py-3 rounded-full bg-[var(--signal)] text-[var(--ink)] hover:opacity-90 transition">
            Comenzar quiz →
          </button>
          <Link to="/lecciones" className="mono text-xs uppercase tracking-widest px-6 py-3 rounded-full hair-a hover:bg-white/5 transition">
            Repasar lecciones primero
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-4">
          {[
            ["Sin trampa", "Ves la explicación después de cada respuesta."],
            ["Sin presión", "No hay tiempo. Piensa con calma."],
            ["Repite libre", "Puedes reiniciar y volver a intentar."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.16 0.012 55)" }}>
              <div className="italic text-lg mb-2">{t}</div>
              <div className="text-sm text-muted-foreground">{d}</div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (state === "results") {
    const pct = Math.round((score / deck.length) * 100);
    const mood = pct >= 80 ? "¡Excelente!" : pct >= 60 ? "Bien hecho" : pct >= 40 ? "Puedes mejorar" : "Toca repasar";
    return (
      <main className="max-w-[1000px] mx-auto px-6 md:px-10 pt-16 md:pt-24">
        <div className="kicker mb-6">Resultado</div>
        <h1 className="text-5xl md:text-7xl mb-4">{mood}.</h1>
        <div className="flex items-baseline gap-4 mb-10">
          <div className="text-7xl md:text-9xl mono" style={{ color: "var(--signal)" }}>{score}</div>
          <div className="text-2xl opacity-70 mono">/ {deck.length} · {pct}%</div>
        </div>

        <div className="grid gap-3">
          {deck.map((qq, idx) => {
            const ok = picks[idx] === qq.answer;
            return (
              <div key={idx} className="rounded-2xl hair-a p-5" style={{ background: "oklch(0.16 0.012 55)" }}>
                <div className="flex items-start gap-4">
                  <div className={"mono text-xs w-8 h-8 rounded-full grid place-items-center shrink-0"} style={{ background: ok ? "var(--mint)" : "var(--signal)", color: "var(--ink)" }}>
                    {ok ? "✓" : "✗"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm mono opacity-60 mb-1">{qq.topic}</div>
                    <div className="mb-2">{qq.q}</div>
                    <div className="text-sm opacity-80"><em>Correcta:</em> {qq.choices[qq.answer]}</div>
                    <div className="text-sm mt-2" style={{ color: "oklch(0.8 0.02 70)" }}>{qq.explain}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-10">
          <button onClick={start} className="mono text-xs uppercase tracking-widest px-6 py-3 rounded-full bg-[var(--signal)] text-[var(--ink)] hover:opacity-90 transition">
            Volver a intentar
          </button>
          <Link to="/lecciones" className="mono text-xs uppercase tracking-widest px-6 py-3 rounded-full hair-a hover:bg-white/5 transition">
            Repasar lecciones
          </Link>
        </div>
      </main>
    );
  }

  // playing
  return (
    <main className="max-w-[900px] mx-auto px-6 md:px-10 pt-14">
      <div className="flex items-center justify-between mb-6">
        <div className="mono text-xs uppercase tracking-widest opacity-70">
          Pregunta {i + 1} / {deck.length} · <span style={{ color: "var(--signal)" }}>{q.topic}</span>
        </div>
        <div className="flex-1 mx-6 h-1 rounded-full overflow-hidden" style={{ background: "oklch(0.22 0.014 55)" }}>
          <div className="h-full transition-all" style={{ width: `${((i) / deck.length) * 100}%`, background: "var(--signal)" }} />
        </div>
        <div className="mono text-xs opacity-70">✓ {score}</div>
      </div>

      <h2 className="text-3xl md:text-5xl italic mb-8 leading-tight">{q.q}</h2>

      <div className="grid gap-3">
        {q.choices.map((c, idx) => {
          const isPicked = pickedIdx === idx;
          const isCorrect = idx === q.answer;
          const showState = locked;
          let bg = "oklch(0.16 0.012 55)";
          let border = "var(--hair)";
          if (showState && isCorrect) { bg = "oklch(0.24 0.09 165)"; border = "var(--mint)"; }
          else if (showState && isPicked && !isCorrect) { bg = "oklch(0.24 0.09 45)"; border = "var(--signal)"; }
          return (
            <button
              key={idx}
              onClick={() => pick(idx)}
              disabled={locked}
              className="text-left rounded-2xl px-6 py-5 transition flex items-center gap-4 disabled:cursor-default hover:bg-white/[0.04]"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <div className="mono text-xs w-7 h-7 rounded-full grid place-items-center hair-a shrink-0">
                {String.fromCharCode(65 + idx)}
              </div>
              <div className="flex-1">{c}</div>
              {showState && isCorrect && <span className="mono text-xs" style={{color:"var(--mint)"}}>✓</span>}
              {showState && isPicked && !isCorrect && <span className="mono text-xs" style={{color:"var(--signal)"}}>✗</span>}
            </button>
          );
        })}
      </div>

      {locked && (
        <div className="mt-6 rounded-2xl hair-a p-5" style={{ background: "oklch(0.18 0.014 55)" }}>
          <div className="mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--signal)" }}>Explicación</div>
          <p className="text-[15px]">{q.explain}</p>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={nextQ}
          disabled={!locked}
          className="mono text-xs uppercase tracking-widest px-6 py-3 rounded-full bg-[var(--signal)] text-[var(--ink)] hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {i < deck.length - 1 ? "Siguiente →" : "Ver resultado →"}
        </button>
      </div>
    </main>
  );
}
