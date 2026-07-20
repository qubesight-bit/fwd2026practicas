import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { questions as ALL, type Question } from "@/lib/quiz-data";
import { W95Button } from "@/components/win95";
import { addXP, addCoins, bumpStreak, recordQuizResult, resetStreak, useStats, sfx } from "@/lib/gamification";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz — Redes 95" },
      { name: "description", content: "Quiz gamificado con XP, monedas y rachas. Preguntas de DNS, HTTP, operadores lógicos, terminal y HTML." },
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
  const stats = useStats();
  const [state, setState] = useState<State>("intro");
  const [deck, setDeck] = useState<Question[]>([]);
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [comboMultiplier, setCombo] = useState(1);

  const start = () => {
    setDeck(shuffle(ALL));
    setPicks([]);
    setI(0);
    setLocked(false);
    setTimeLeft(20);
    setCombo(1);
    resetStreak();
    setState("playing");
  };

  const q = deck[i];
  const pickedIdx = picks[i];

  // Timer
  useEffect(() => {
    if (state !== "playing" || locked) return;
    if (timeLeft <= 0) { pick(-1); return; }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, locked, state]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (n: number) => {
    if (locked) return;
    setLocked(true);
    const next = [...picks];
    next[i] = n;
    setPicks(next);
    const ok = n === q.answer;
    bumpStreak(ok);
    if (ok) {
      sfx.correct();
      const timeBonus = Math.max(0, Math.floor(timeLeft / 4));   // hasta +5
      const gain = 10 * comboMultiplier + timeBonus;
      addXP(gain, `Correcta · combo x${comboMultiplier}${timeBonus ? " · +tiempo" : ""}`);
      addCoins(1 + Math.floor(comboMultiplier / 2));
      setCombo((c) => Math.min(5, c + 1));
    } else {
      sfx.wrong();
      setCombo(1);
    }
  };

  const nextQ = () => {
    if (i < deck.length - 1) {
      setI(i + 1);
      setLocked(picks[i + 1] !== undefined);
      setTimeLeft(20);
    } else {
      const score = picks.reduce((acc, p, idx) => acc + (p === deck[idx]?.answer ? 1 : 0), 0);
      recordQuizResult(score, deck.length);
      setState("results");
    }
  };

  const score = useMemo(() => picks.reduce((acc, p, idx) => acc + (p === deck[idx]?.answer ? 1 : 0), 0), [picks, deck]);

  if (state === "intro") {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl mb-2" style={{ fontFamily: "var(--font-display)", color: "#000080" }}>
          🎯 QUIZ.EXE
        </h1>
        <p className="text-[13px] mb-4">
          {ALL.length} preguntas mezcladas. Contesta rápido para ganar más XP.
          Encadena aciertos para <b>multiplicar</b> tu combo (hasta <b>x5</b>).
        </p>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <Rule title="⏱ 20 seg/pregunta" desc="Bonus de XP si respondes rápido." />
          <Rule title="🔥 Combo x5" desc="Cada acierto seguido multiplica los puntos." />
          <Rule title="🏅 Medallas" desc="Racha de 5 y quiz perfecto desbloquean logros." />
        </div>

        <div className="w95-inset bg-white p-3 mb-4 text-[12px]">
          <b>Estadísticas:</b> Mejor puntaje <b>{stats.quizBest}</b> · Partidas jugadas <b>{stats.quizPlays}</b> · Mejor racha <b>{stats.bestStreak}</b>
        </div>

        <div className="flex gap-2 flex-wrap">
          <W95Button onClick={start}>▶ Comenzar quiz</W95Button>
          <Link to="/lecciones" className="w95-btn">📚 Repasar lecciones</Link>
        </div>
      </div>
    );
  }

  if (state === "results") {
    const pct = Math.round((score / deck.length) * 100);
    const mood = pct >= 80 ? "¡Excelente!" : pct >= 60 ? "Bien hecho" : pct >= 40 ? "Puedes mejorar" : "A repasar";
    return (
      <div>
        <h1 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: "var(--font-display)", color: "#000080" }}>
          {mood}
        </h1>
        <div className="flex items-baseline gap-3 mb-4">
          <div className="text-5xl mono font-bold" style={{ color: "#000080" }}>{score}</div>
          <div className="text-lg mono">/ {deck.length} · {pct}%</div>
        </div>

        <div className="w95-inset bg-white p-3 mb-4 text-[12px] grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>⭐ +{score * 10} XP ganados</div>
          <div>🪙 +{score} monedas</div>
          <div>🔥 Mejor racha: {stats.bestStreak}</div>
          <div>🎯 Mejor histórico: {stats.quizBest}</div>
        </div>

        <div className="grid gap-2">
          {deck.map((qq, idx) => {
            const ok = picks[idx] === qq.answer;
            return (
              <div key={idx} className="w95-inset bg-white p-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <span className={"w-5 h-5 grid place-items-center text-white text-[11px] shrink-0"} style={{ background: ok ? "#008000" : "#c00000" }}>
                    {ok ? "✓" : "✗"}
                  </span>
                  <div className="flex-1">
                    <div className="mono text-[10px] opacity-70">{qq.topic}</div>
                    <div className="font-bold">{qq.q}</div>
                    <div><i>Correcta:</i> {qq.choices[qq.answer]}</div>
                    <div className="mt-1 opacity-80">{qq.explain}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <W95Button onClick={start}>🔁 Jugar de nuevo</W95Button>
          <Link to="/lecciones" className="w95-btn">📚 Repasar</Link>
          <Link to="/" className="w95-btn">🏠 Escritorio</Link>
        </div>
      </div>
    );
  }

  // playing
  const timerPct = (timeLeft / 20) * 100;
  return (
    <div>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="mono text-[12px]">
          Pregunta <b>{i + 1}</b>/{deck.length} · <span style={{ color: "#000080" }}>{q.topic}</span>
        </div>
        <div className="flex-1 min-w-[150px] w95-inset bg-white h-3 overflow-hidden">
          <div className="h-full" style={{ width: `${(i / deck.length) * 100}%`, background: "#000080" }} />
        </div>
        <div className="mono text-[12px]">✓ {score}</div>
        <div className="mono text-[12px]" title="Combo">🔥 x{comboMultiplier}</div>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[12px]">⏱</span>
        <div className="flex-1 w95-inset bg-white h-2 overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${timerPct}%`, background: timeLeft < 5 ? "#c00000" : "#008000" }} />
        </div>
        <span className="mono text-[12px] w-8 text-right">{timeLeft}s</span>
      </div>

      <div className="w95-outset p-3 mb-3" style={{ background: "var(--w95-face)" }}>
        <h2 className="text-lg md:text-2xl" style={{ fontFamily: "var(--font-display)" }}>{q.q}</h2>
      </div>

      <div className="grid gap-2">
        {q.choices.map((c, idx) => {
          const isPicked = pickedIdx === idx;
          const isCorrect = idx === q.answer;
          const showState = locked;
          let bg = "#ffffff";
          if (showState && isCorrect) bg = "#c6f0c6";
          else if (showState && isPicked && !isCorrect) bg = "#f6c6c6";
          return (
            <button
              key={idx}
              onClick={() => pick(idx)}
              disabled={locked}
              className="w95-outset text-left p-2 flex items-center gap-3 disabled:cursor-default"
              style={{ background: bg }}
            >
              <span className="w-6 h-6 grid place-items-center w95-inset bg-white mono text-[12px] shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 text-[13px]">{c}</span>
              {showState && isCorrect && <span style={{ color: "#008000" }}>✓</span>}
              {showState && isPicked && !isCorrect && <span style={{ color: "#c00000" }}>✗</span>}
            </button>
          );
        })}
      </div>

      {locked && (
        <div className="w95-inset bg-white p-3 mt-3 text-[12px]">
          <div className="mono mb-1" style={{ color: "#000080" }}>💡 EXPLICACIÓN</div>
          <p>{q.explain}</p>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <W95Button onClick={nextQ} disabled={!locked}>
          {i < deck.length - 1 ? "Siguiente ▶" : "Ver resultado ▶"}
        </W95Button>
      </div>
    </div>
  );
}

function Rule({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="w95-inset bg-white p-2 text-[12px]">
      <div className="font-bold">{title}</div>
      <div>{desc}</div>
    </div>
  );
}
