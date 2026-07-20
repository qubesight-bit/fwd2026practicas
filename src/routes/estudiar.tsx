import { createFileRoute, Link } from "@tanstack/react-router";
import { useStats } from "@/lib/gamification";

export const Route = createFileRoute("/estudiar")({
  head: () => ({
    meta: [
      { title: "¿Qué quieres hacer? — Redes 95" },
      { name: "description", content: "Elige un tema (DNS, HTTP, HTML, CSS, JS, DOM, Terminal, Lógica) y decide si repasar la lección, practicar en el simulador o hacer un quiz." },
    ],
  }),
  component: Estudiar,
});

type Action = {
  kind: "lesson" | "sim" | "sim-ej" | "quiz";
  label: string;
  icon: string;
  /** For "lesson": lecciones slug. For "sim-ej": tag filter. Ignored otherwise. */
  target?: string;
};

type Topic = {
  slug: string;
  title: string;
  desc: string;
  icon: string;
  actions: Action[];
};

const TOPICS: Topic[] = [
  {
    slug: "dns",
    title: "DNS · Nombres → IP",
    desc: "La guía telefónica de internet. Cómo se traduce google.com a una IP.",
    icon: "📞",
    actions: [
      { kind: "lesson", label: "Repasar lección", icon: "📖", target: "dns" },
      { kind: "sim",    label: "Simular resolución", icon: "🌐" },
      { kind: "sim-ej", label: "Ejercicios de RED", icon: "🧠", target: "RED" },
      { kind: "quiz",   label: "Hacer quiz general", icon: "🎯" },
    ],
  },
  {
    slug: "http",
    title: "HTTP · Códigos y respuestas",
    desc: "200, 301, 404, 500… qué significa cada código y cuándo aparece.",
    icon: "📨",
    actions: [
      { kind: "sim",    label: "Simular petición HTTP", icon: "🌐" },
      { kind: "sim-ej", label: "Ejercicios de RED", icon: "🧠", target: "RED" },
      { kind: "quiz",   label: "Hacer quiz general", icon: "🎯" },
    ],
  },
  {
    slug: "html",
    title: "HTML · Esqueleto de la web",
    desc: "Etiquetas, atributos, listas, imágenes, enlaces.",
    icon: "📄",
    actions: [
      { kind: "lesson", label: "Repasar lección", icon: "📖", target: "html" },
      { kind: "sim-ej", label: "Ejercicios de HTML", icon: "🧠", target: "HTML" },
      { kind: "quiz",   label: "Hacer quiz general", icon: "🎯" },
    ],
  },
  {
    slug: "css",
    title: "CSS · Estilos y diseño",
    desc: "Colores, selectores, flexbox, padding vs margin.",
    icon: "🎨",
    actions: [
      { kind: "lesson", label: "Ver Frontend (incluye CSS)", icon: "📖", target: "frontend" },
      { kind: "sim-ej", label: "Ejercicios de CSS", icon: "🧠", target: "CSS" },
    ],
  },
  {
    slug: "js",
    title: "JavaScript · Lógica de la web",
    desc: "Variables, condicionales, bucles, funciones, operadores.",
    icon: "⚙️",
    actions: [
      { kind: "lesson", label: "Fundamentos de programación", icon: "📖", target: "fundamentos" },
      { kind: "sim-ej", label: "Ejercicios de JS", icon: "🧠", target: "JS" },
    ],
  },
  {
    slug: "dom",
    title: "DOM · El árbol de la página",
    desc: "Cómo JS ve y modifica el HTML: querySelector, textContent…",
    icon: "🌳",
    actions: [
      { kind: "lesson", label: "Frontend & DOM", icon: "📖", target: "frontend" },
      { kind: "sim-ej", label: "Ejercicios de DOM", icon: "🧠", target: "DOM" },
    ],
  },
  {
    slug: "terminal",
    title: "Terminal · Comandos",
    desc: "cd, ls, ping, nslookup — Windows, Mac y Linux.",
    icon: "💻",
    actions: [
      { kind: "lesson", label: "Repasar comandos", icon: "📖", target: "terminal" },
      { kind: "sim-ej", label: "Ejercicios de TERMINAL", icon: "🧠", target: "TERMINAL" },
    ],
  },
  {
    slug: "logica",
    title: "Lógica · AND, OR, NOT",
    desc: "Tablas de verdad y ejemplos de la vida real.",
    icon: "🍦",
    actions: [
      { kind: "lesson", label: "Operadores lógicos", icon: "📖", target: "operadores" },
      { kind: "sim-ej", label: "Ejercicios de LÓGICA", icon: "🧠", target: "LOGICA" },
    ],
  },
  {
    slug: "fundamentos",
    title: "Fundamentos de programación",
    desc: "Variables, condicionales, bucles y funciones.",
    icon: "📝",
    actions: [
      { kind: "lesson", label: "Repasar lección", icon: "📖", target: "fundamentos" },
      { kind: "sim-ej", label: "Ejercicios de JS", icon: "🧠", target: "JS" },
    ],
  },
];

function ActionLink({ action }: { action: Action }) {
  const base = "w95-btn text-[12px] justify-start";
  if (action.kind === "lesson" && action.target) {
    return (
      <Link to="/lecciones/$topic" params={{ topic: action.target }} className={base}>
        <span className="mr-1">{action.icon}</span> {action.label}
      </Link>
    );
  }
  if (action.kind === "sim") {
    return <Link to="/simulador" className={base}><span className="mr-1">{action.icon}</span> {action.label}</Link>;
  }
  if (action.kind === "sim-ej") {
    return (
      <a href={`/simulador?ej=${action.target}#ejercicios`} className={base}>
        <span className="mr-1">{action.icon}</span> {action.label}
      </a>
    );
  }
  return <Link to="/quiz" className={base}><span className="mr-1">{action.icon}</span> {action.label}</Link>;
}

function Estudiar() {
  const stats = useStats();
  const done = new Set(stats.lessonsCompleted);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl md:text-4xl mb-1" style={{ fontFamily: "var(--font-display)", color: "#000080" }}>
          🎓 ¿Qué quieres hacer hoy?
        </h1>
        <p className="text-[13px]">
          Elige un <b>tema</b> y luego decide si prefieres <b>repasar la lección</b>,
          <b> practicar en el simulador</b>, hacer <b>ejercicios rápidos</b> o un <b>quiz</b>.
        </p>
      </div>

      {/* Quick launch */}
      <div className="w95-outset p-2 mb-4 flex flex-wrap gap-2 items-center" style={{ background: "#ffffcc" }}>
        <span className="text-[12px] font-bold">Acceso rápido:</span>
        <Link to="/lecciones"  className="w95-btn text-[12px]">📚 Todas las lecciones</Link>
        <Link to="/simulador"  className="w95-btn text-[12px]">🌐 Simulador completo</Link>
        <a href="/simulador#ejercicios" className="w95-btn text-[12px]">🧠 Todos los ejercicios</a>
        <Link to="/quiz"       className="w95-btn text-[12px]">🎯 Quiz general</Link>
      </div>

      {/* Topic grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {TOPICS.map((t) => {
          const lessonSlug = t.actions.find((a) => a.kind === "lesson")?.target;
          const isDone = lessonSlug ? done.has(lessonSlug) : false;
          return (
            <div key={t.slug} className="w95-outset p-3 flex flex-col" style={{ background: "var(--w95-face)" }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="text-3xl">{t.icon}</div>
                <div className="flex-1">
                  <div className="text-base font-bold leading-tight">{t.title}</div>
                  <div className="text-[12px] opacity-90">{t.desc}</div>
                </div>
                {isDone && <span className="text-[10px] px-1 bg-[#008000] text-white h-4">✓</span>}
              </div>
              <div className="w95-inset bg-white p-2 flex flex-col gap-1">
                {t.actions.map((a, i) => <ActionLink key={i} action={a} />)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="w95-inset bg-white p-3 mt-6 text-[12px]">
        <b>💡 Tip:</b> los botones de <span className="mono">Ejercicios</span> te llevan al
        simulador ya <b>filtrado</b> por el tema que elegiste, y cada acierto suma <b>+10 XP</b> y <b>+1 🪙</b>.
      </div>
    </div>
  );
}
