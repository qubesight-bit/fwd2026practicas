import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Redes y Fundamentos — Aprende jugando" },
      { name: "description", content: "Hub de lecciones interactivas sobre DNS, HTTP, HTML, terminal, operadores lógicos y fundamentos de programación. Con simulador y quiz." },
    ],
  }),
  component: Home,
});

const topics = [
  { slug: "dns",         num: "01", title: "DNS y cómo viaja una URL",           desc: "La guía telefónica de internet, explicada con dibujos.", tag: "Redes" },
  { slug: "operadores",  num: "02", title: "Operadores lógicos y tabla de verdad", desc: "AND, OR, NOT — con el ejemplo del helado 🍦.",           tag: "Lógica" },
  { slug: "fundamentos", num: "03", title: "Fundamentos de programación",         desc: "Variables, condicionales, bucles y funciones.",         tag: "Base" },
  { slug: "terminal",    num: "04", title: "Comandos de la terminal",             desc: "Windows, Mac y Linux — lado a lado.",                    tag: "Sistema" },
  { slug: "html",        num: "05", title: "HTML — el esqueleto de la web",       desc: "Etiquetas, atributos y por qué todo va dentro de body.", tag: "Frontend" },
  { slug: "frontend",    num: "06", title: "Frontend, DOM y renderizado",         desc: "La trinidad HTML · CSS · JS y precisiones clave.",       tag: "Frontend" },
];

function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-20">
        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="kicker mb-6">Guía visual · Vol. 01</div>
            <h1 className="text-5xl md:text-8xl leading-[0.95] tracking-tight">
              Aprende <em>redes,</em>{" "}
              <span style={{ color: "var(--signal)" }}>&amp;</span> los fundamentos que ningún curso <em>explica bien.</em>
            </h1>
          </div>
          <div className="md:col-span-4">
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: "oklch(0.85 0.02 70)" }}>
              Seis lecciones cortas, un simulador de DNS y HTTP que puedes tocar, y un
              modo <span style={{ color: "var(--signal)" }}>quiz</span> para verificar
              que de verdad lo entendiste.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/lecciones" className="rounded-full px-6 py-3 mono text-xs uppercase tracking-widest bg-[var(--signal)] text-[var(--ink)] hover:opacity-90 transition">
                Empezar a estudiar →
              </Link>
              <Link to="/quiz" className="rounded-full px-6 py-3 mono text-xs uppercase tracking-widest hair-a hover:bg-white/5 transition">
                Ir al quiz
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured: simulator + quiz */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/simulador" className="group rounded-3xl hair-a p-8 md:p-10 relative overflow-hidden transition hover:-translate-y-1"
                style={{ background: "linear-gradient(135deg, oklch(0.18 0.014 55), oklch(0.22 0.02 45))" }}>
            <div className="kicker mb-6">Interactivo</div>
            <h2 className="text-3xl md:text-5xl mb-4 italic">Simulador DNS &amp; HTTP</h2>
            <p className="text-base md:text-lg mb-8" style={{ color: "oklch(0.85 0.02 70)" }}>
              Escribe un dominio y mira, paso a paso, cómo el navegador consulta el DNS,
              encuentra la IP y recibe (o no) la respuesta del servidor.
            </p>
            <div className="flex items-center gap-3 mono text-xs uppercase tracking-widest group-hover:text-[var(--signal)] transition">
              Probar el simulador
              <span className="inline-block w-8 h-8 rounded-full grid place-items-center hair-a group-hover:bg-[var(--signal)] group-hover:text-[var(--ink)] transition">→</span>
            </div>
          </Link>

          <Link to="/quiz" className="group rounded-3xl p-8 md:p-10 relative overflow-hidden transition hover:-translate-y-1"
                style={{ background: "var(--signal)", color: "var(--ink)" }}>
            <div className="mono text-[11px] uppercase tracking-[0.22em] mb-6">Auto-evaluación</div>
            <h2 className="text-3xl md:text-5xl mb-4 italic">Modo Quiz</h2>
            <p className="text-base md:text-lg mb-8">
              Doce preguntas mezcladas de todos los temas. Sin trampa: verás la
              explicación correcta al terminar.
            </p>
            <div className="flex items-center gap-3 mono text-xs uppercase tracking-widest">
              Iniciar quiz
              <span className="inline-block w-8 h-8 rounded-full grid place-items-center transition group-hover:translate-x-1" style={{ background: "var(--ink)", color: "var(--paper)" }}>→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Lessons grid */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex items-baseline justify-between hair-b pb-4 mb-10">
          <h2 className="text-3xl md:text-4xl italic">Lecciones</h2>
          <span className="mono text-xs uppercase tracking-widest text-muted-foreground">06 temas</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((t) => (
            <Link
              key={t.slug}
              to="/lecciones/$topic"
              params={{ topic: t.slug }}
              className="group rounded-2xl hair-a p-7 flex flex-col justify-between min-h-[220px] transition hover:bg-white/[0.04] hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="mono text-xs uppercase tracking-widest" style={{ color: "var(--signal)" }}>{t.num}</span>
                <span className="mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full hair-a text-muted-foreground">{t.tag}</span>
              </div>
              <div>
                <h3 className="text-2xl md:text-[26px] leading-tight mb-3 italic">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <div className="mono text-xs uppercase tracking-widest mt-6 flex items-center gap-2 opacity-60 group-hover:opacity-100 group-hover:text-[var(--signal)] transition">
                Leer lección <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
