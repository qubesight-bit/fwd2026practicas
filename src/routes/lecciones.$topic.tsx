import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lessons, type LessonSlug } from "@/lib/lesson-content";
import { markLessonComplete, useStats, addXP } from "@/lib/gamification";
import { W95Button } from "@/components/win95";

export const Route = createFileRoute("/lecciones/$topic")({
  head: (ctx) => {
    const l = ctx.loaderData as { slug: LessonSlug; title: string; description: string } | undefined;
    if (!l) return { meta: [{ title: "Lección no encontrada" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${l.title} — Lección` },
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
    <div className="text-center py-16">
      <div className="text-5xl mb-4">📄❌</div>
      <h1 className="text-2xl mb-2">Esa lección no existe</h1>
      <Link to="/lecciones" className="w95-btn inline-flex">← Volver a Lecciones</Link>
    </div>
  ),
});

function LessonPage() {
  const { slug } = Route.useLoaderData() as { slug: LessonSlug };
  const lesson = lessons[slug];
  const order: LessonSlug[] = ["dns", "operadores", "fundamentos", "js", "terminal", "html", "frontend", "dom"];
  const idx = order.indexOf(slug);
  const prev = idx > 0 ? order[idx - 1] : null;
  const next = idx < order.length - 1 ? order[idx + 1] : null;

  const stats = useStats();
  const isDone = stats.lessonsCompleted.indexOf(slug) !== -1;

  return (
    <article>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <Link to="/lecciones" className="w95-btn inline-flex">← Todas las lecciones</Link>
        <div className="text-[12px]">Lección {String(idx + 1).padStart(2, "0")} de {order.length}</div>
      </div>

      <div className="w95-outset p-3 mb-4" style={{ background: "var(--w95-face)" }}>
        <h1 className="text-2xl md:text-4xl leading-tight" style={{ fontFamily: "var(--font-display)", color: "#000080" }}>
          {lesson.title}
        </h1>
        <p className="text-[13px] italic mt-2">{lesson.tagline}</p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {isDone ? (
            <span className="w95-btn cursor-default" style={{ background: "#008000", color: "#fff" }}>✓ Completada</span>
          ) : (
            <W95Button onClick={() => markLessonComplete(slug)}>✓ Marcar como completada (+30 XP)</W95Button>
          )}
          <W95Button onClick={() => addXP(5, "Repaso rápido")}>📖 Marqué que la releí (+5 XP)</W95Button>
        </div>
      </div>

      <div>{lesson.body()}</div>

      <div className="grid grid-cols-2 gap-3 mt-8 pt-4 border-t border-[var(--w95-shadow)]">
        {prev ? (
          <Link to="/lecciones/$topic" params={{ topic: prev }} className="w95-outset p-3 no-underline text-black">
            <div className="text-[11px] mono">◀ Anterior</div>
            <div className="text-sm">{lessons[prev].title}</div>
          </Link>
        ) : <div />}
        {next ? (
          <Link to="/lecciones/$topic" params={{ topic: next }} className="w95-outset p-3 no-underline text-black text-right">
            <div className="text-[11px] mono">Siguiente ▶</div>
            <div className="text-sm">{lessons[next].title}</div>
          </Link>
        ) : <div />}
      </div>
    </article>
  );
}
