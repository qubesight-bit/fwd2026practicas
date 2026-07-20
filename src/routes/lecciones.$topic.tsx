import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lessons, type LessonSlug } from "@/lib/lesson-content";

export const Route = createFileRoute("/lecciones/$topic")({
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Lección no encontrada" }, { name: "robots", content: "noindex" }] };
    const l = loaderData;
    return {
      meta: [
        { title: `${l.title} — Lecciones` },
        { name: "description", content: l.description },
        { property: "og:title", content: l.title },
        { property: "og:description", content: l.description },
      ],
    };
  },
  loader: ({ params }) => {
    const slug = params.topic as LessonSlug;
    const l = lessons[slug];
    if (!l) throw notFound();
    return { slug, title: l.title, description: l.description };
  },
  component: LessonPage,
  notFoundComponent: () => (
    <main className="max-w-3xl mx-auto px-6 py-24 text-center">
      <div className="kicker mb-4">404</div>
      <h1 className="text-4xl mb-4">Esa lección no existe</h1>
      <Link to="/lecciones" className="mono text-xs uppercase tracking-widest hover:text-[var(--signal)]">← Ver todas las lecciones</Link>
    </main>
  ),
});

function LessonPage() {
  const { slug } = Route.useLoaderData();
  const lesson = lessons[slug];
  const order: LessonSlug[] = ["dns", "operadores", "fundamentos", "terminal", "html", "frontend"];
  const idx = order.indexOf(slug);
  const prev = idx > 0 ? order[idx - 1] : null;
  const next = idx < order.length - 1 ? order[idx + 1] : null;

  return (
    <main>
      <article className="max-w-[1000px] mx-auto px-6 md:px-10 pt-14 md:pt-20">
        <Link to="/lecciones" className="mono text-xs uppercase tracking-widest opacity-60 hover:text-[var(--signal)]">← Todas las lecciones</Link>
        <div className="mt-8 mb-4 kicker">Lección {String(idx + 1).padStart(2, "0")}</div>
        <h1 className="text-5xl md:text-7xl leading-[0.98] mb-6">{lesson.title}</h1>
        <p className="text-xl md:text-2xl max-w-3xl leading-snug" style={{ color: "oklch(0.85 0.02 70)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
          {lesson.tagline}
        </p>

        <div className="mt-8">{lesson.body()}</div>

        {/* Prev / Next */}
        <div className="grid grid-cols-2 gap-4 mt-20 hair-t pt-8">
          {prev ? (
            <Link to="/lecciones/$topic" params={{ topic: prev }} className="rounded-2xl hair-a p-5 group hover:bg-white/[0.04] transition">
              <div className="mono text-[11px] uppercase tracking-widest opacity-60">← Anterior</div>
              <div className="mt-1 italic text-lg">{lessons[prev].title}</div>
            </Link>
          ) : <div />}
          {next ? (
            <Link to="/lecciones/$topic" params={{ topic: next }} className="rounded-2xl hair-a p-5 group hover:bg-white/[0.04] transition text-right">
              <div className="mono text-[11px] uppercase tracking-widest opacity-60">Siguiente →</div>
              <div className="mt-1 italic text-lg">{lessons[next].title}</div>
            </Link>
          ) : <div />}
        </div>
      </article>
    </main>
  );
}
