import { createFileRoute, Link } from "@tanstack/react-router";
import { W95Window, BadgeBoard, W95Button } from "@/components/win95";
import { useStats, levelFor, xpToNext, resetAll, sfx } from "@/lib/gamification";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Redes 95 — Escritorio" },
      { name: "description", content: "Escritorio Windows 95 para aprender redes, HTTP, HTML, lógica y terminal. Con XP, monedas y medallas." },
    ],
  }),
  component: Desktop,
});

const icons = [
  { to: "/estudiar",   glyph: "🎓", label: "¿Qué\nestudiar?" },
  { to: "/lecciones",  glyph: "📚", label: "Lecciones" },
  { to: "/diccionario", glyph: "📖", label: "Diccionario\nJS" },
  { to: "/simulador",  glyph: "🌐", label: "Simulador\nde red" },
  { to: "/quiz",       glyph: "🎯", label: "Quiz.exe" },
  { to: "/lecciones/dns",         glyph: "📞", label: "DNS.hlp" },
  { to: "/lecciones/operadores",  glyph: "🍦", label: "Lógica.txt" },
  { to: "/lecciones/fundamentos", glyph: "📝", label: "Base.doc" },
  { to: "/lecciones/terminal",    glyph: "💻", label: "MS-DOS" },
  { to: "/lecciones/html",        glyph: "📄", label: "HTML.htm" },
  { to: "/lecciones/frontend",    glyph: "🎨", label: "Frontend" },
  { to: "/lecciones/dom",         glyph: "🌳", label: "DOM.punto" },
  { to: "/lecciones/contexto",    glyph: "🧠", label: "Contexto\n+ Deploy" },
];

function Desktop() {
  const stats = useStats();
  const lvl = levelFor(stats.xp);
  const toNext = xpToNext(stats.xp);
  const pct = 100 - toNext;

  return (
    <div className="min-h-[calc(100vh-140px)] grid lg:grid-cols-[minmax(0,320px)_1fr] gap-6 py-2">
      {/* Icon column */}
      <div className="grid grid-cols-3 gap-2 content-start">
        {icons.map((i) => (
          <Link key={i.to} to={i.to} onClick={() => sfx.click()} className="w95-icon" tabIndex={0}>
            <span className="glyph">{i.glyph}</span>
            <span className="lbl whitespace-pre-line">{i.label}</span>
          </Link>
        ))}
      </div>

      {/* Welcome window */}
      <div className="grid gap-3 content-start">
        <W95Window title="Bienvenido — Redes 95" icon="👋">
          <div className="p-2">
            <h1 className="text-3xl md:text-5xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
              REDES <span style={{ color: "#000080" }}>95</span>
            </h1>
            <p className="text-[13px] mb-3">
              Bienvenido, jugador. Este es un mini sistema operativo para aprender
              <b> redes, HTTP, HTML, lógica</b> y <b>terminal</b>. Cada acción te da <b>XP</b>,
              monedas 🪙 y medallas 🏅. Explora los íconos del escritorio o abre una app desde el <b>Dock</b> de abajo.
            </p>
            <div className="w95-inset bg-white p-3 mb-3 text-[12px]">
              <div className="mb-2 flex items-center justify-between">
                <b>Perfil del jugador</b>
                <span className="mono">Nivel {lvl}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-16 text-[11px]">XP</span>
                <div className="flex-1 w95-inset bg-white h-3 overflow-hidden">
                  <div className="h-full" style={{ width: `${pct}%`, background: "#000080" }} />
                </div>
                <span className="mono w-24 text-right">{stats.xp} / {lvl * 100}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                <div className="w95-outset py-1">🪙 <b>{stats.coins}</b><div className="text-[10px]">Monedas</div></div>
                <div className="w95-outset py-1">🔥 <b>{stats.bestStreak}</b><div className="text-[10px]">Mejor racha</div></div>
                <div className="w95-outset py-1">🎯 <b>{stats.quizBest}</b><div className="text-[10px]">Mejor quiz</div></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/estudiar" className="w95-btn">🎓 ¿Qué estudiar hoy?</Link>
              <Link to="/lecciones" className="w95-btn">📚 Todas las lecciones</Link>
              <Link to="/diccionario" className="w95-btn">📖 Diccionario JS</Link>
              <Link to="/simulador" className="w95-btn">🌐 Simulador</Link>
              <Link to="/quiz" className="w95-btn">🎯 Quiz</Link>
              <W95Button onClick={() => { if (confirm("¿Reiniciar progreso? Perderás XP y medallas.")) resetAll(); }}>
                🗑️ Reiniciar progreso
              </W95Button>
            </div>
          </div>
        </W95Window>

        <W95Window title="Medallas — Trofeos" icon="🏅">
          <div className="p-2">
            <p className="text-[12px] mb-2">Consigue medallas completando lecciones, ganando rachas en el quiz y prediciendo escenarios en el simulador.</p>
            <BadgeBoard />
          </div>
        </W95Window>

        <W95Window title="Consejo del día" icon="💡">
          <div className="p-3 text-[13px]">
            <span className="w95-blink">▮</span> Truco: en el <b>Quiz</b>, mantener una racha de 5 aciertos te da la medalla <b>🔥 Racha x5</b>.
          </div>
        </W95Window>
      </div>
    </div>
  );
}
