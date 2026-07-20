import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lecciones/")({
  head: () => ({
    meta: [
      { title: "Lecciones — Redes y Fundamentos" },
      { name: "description", content: "Índice de lecciones: DNS, operadores lógicos, fundamentos de programación, terminal, HTML y frontend." },
    ],
  }),
  component: Index,
});

const topics = [
  { slug: "dns",         num: "01", title: "DNS y cómo viaja una URL",           desc: "La guía telefónica de internet. Comandos, errores y flujo completo." },
  { slug: "operadores",  num: "02", title: "Operadores lógicos y tabla de verdad", desc: "AND, OR, NOT — tablas, ejemplos y un evaluador interactivo." },
  { slug: "fundamentos", num: "03", title: "Fundamentos de programación",         desc: "Variables, operadores, condicionales, bucles y funciones." },
  { slug: "terminal",    num: "04", title: "Comandos de la terminal",             desc: "Comparativa Windows · Mac · Linux, tabla navegable." },
  { slug: "html",        num: "05", title: "HTML — el esqueleto de la web",       desc: "Etiquetas, atributos, listas y por qué todo va dentro de body." },
  { slug: "frontend",    num: "06", title: "Frontend, DOM y renderizado",         desc: "HTML + CSS + JS, qué es el DOM y qué NO es frontend." },
];

function Index() {
  return (
    <main className="max-w-[1400px] mx-auto px-6 md:px-10 pt-14 md:pt-20">
      <div className="kicker mb-6">Índice</div>
      <h1 className="text-5xl md:text-7xl mb-4">Lecciones.</h1>
      <p className="text-lg max-w-2xl mb-12" style={{ color: "oklch(0.85 0.02 70)" }}>
        Cada tema en su propia página, con ejemplos, tablas y ejercicios que puedes tocar.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {topics.map((t) => (
          <Link
            key={t.slug}
            to="/lecciones/$topic"
            params={{ topic: t.slug }}
            className="group rounded-2xl hair-a p-8 flex items-start gap-6 transition hover:bg-white/[0.04] hover:-translate-y-0.5"
          >
            <span className="mono text-3xl italic" style={{ color: "var(--signal)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
              {t.num}
            </span>
            <div className="flex-1">
              <h2 className="text-2xl mb-2 italic">{t.title}</h2>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </div>
            <span className="mono text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100 group-hover:text-[var(--signal)] transition mt-2">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
