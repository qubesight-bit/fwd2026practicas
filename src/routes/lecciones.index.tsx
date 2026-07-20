import { createFileRoute, Link } from "@tanstack/react-router";
import { useStats } from "@/lib/gamification";

export const Route = createFileRoute("/lecciones/")({
  head: () => ({
    meta: [
      { title: "Lecciones — Redes 95" },
      { name: "description", content: "Índice de lecciones: DNS, operadores lógicos, fundamentos de programación, terminal, HTML y frontend." },
    ],
  }),
  component: Index,
});

const topics = [
  { slug: "dns",         num: "01", title: "DNS y cómo viaja una URL",           desc: "La guía telefónica de internet. Comandos, errores y flujo completo.", icon: "📞" },
  { slug: "operadores",  num: "02", title: "Operadores lógicos y tabla de verdad", desc: "AND, OR, NOT — tablas, ejemplos y un evaluador interactivo.", icon: "🍦" },
  { slug: "fundamentos", num: "03", title: "Fundamentos de programación",         desc: "Variables, operadores, condicionales, bucles y funciones.", icon: "📝" },
  { slug: "terminal",    num: "04", title: "Comandos de la terminal",             desc: "Comparativa Windows · Mac · Linux, tabla navegable.", icon: "💻" },
  { slug: "html",        num: "05", title: "HTML — el esqueleto de la web",       desc: "Etiquetas, atributos, listas y por qué todo va dentro de body.", icon: "📄" },
  { slug: "frontend",    num: "06", title: "Frontend, DOM y renderizado",         desc: "HTML + CSS + JS, qué es el DOM y qué NO es frontend.", icon: "🎨" },
];

function Index() {
  const stats = useStats();
  const done = new Set(stats.lessonsCompleted);
  const pct = Math.round((done.size / topics.length) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
          📚 LECCIONES
        </h1>
        <div className="text-[12px]">Completadas: <b>{done.size}/{topics.length}</b> ({pct}%)</div>
      </div>
      <div className="w95-inset h-3 bg-white mb-6">
        <div className="h-full" style={{ width: `${pct}%`, background: "#000080" }} />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {topics.map((t) => {
          const isDone = done.has(t.slug);
          return (
            <Link
              key={t.slug}
              to="/lecciones/$topic"
              params={{ topic: t.slug }}
              className="w95-outset p-3 flex items-start gap-3 hover:brightness-105 no-underline text-black"
              style={{ background: "var(--w95-face)" }}
            >
              <div className="text-4xl">{t.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="mono text-[12px]">Nº {t.num}</span>
                  {isDone && <span className="text-[10px] px-1 bg-[#008000] text-white">✓ COMPLETADA</span>}
                </div>
                <div className="text-lg leading-tight" style={{ fontFamily: "var(--font-display)" }}>{t.title}</div>
                <div className="text-[12px] mt-1">{t.desc}</div>
              </div>
              <div className="text-2xl">▶</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
