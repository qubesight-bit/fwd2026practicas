import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  Moon,
  Search,
  Star,
  Sun,
  X,
} from "lucide-react";
import rawCards from "@/data/diccionario-js.json";
import type { DiccionarioCard, DiccionarioCategoria } from "@/lib/diccionario-types";
import { CATEGORIAS, CATEGORIA_META } from "@/lib/diccionario-types";
import { useDiccionarioProgress } from "@/lib/diccionario-progress";
import { DictionaryCard } from "@/components/diccionario/DictionaryCard";
import { cn } from "@/lib/utils";

const CARDS = rawCards as DiccionarioCard[];

type SearchParams = {
  card?: string;
};

export const Route = createFileRoute("/diccionario")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    card: typeof search.card === "string" ? search.card : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Diccionario JavaScript — Lenguaje humano" },
      {
        name: "description",
        content:
          "Traduce JavaScript a español sencillo: variables, if, bucles, funciones, arrays, objetos, DOM y eventos. Para principiantes absolutos.",
      },
    ],
  }),
  component: DiccionarioPage,
});

type ExtraFilter = "todas" | "aprendidas" | "favoritos";

function DiccionarioPage() {
  const { card: cardParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/diccionario" });
  const progress = useDiccionarioProgress();

  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<DiccionarioCategoria | "Todas">("Todas");
  const [extra, setExtra] = useState<ExtraFilter>("todas");
  const [openId, setOpenId] = useState<string | null>(cardParam ?? null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("diccionario-theme");
    if (saved === "dark") setDark(true);
    else if (saved === "light") setDark(false);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("diccionario-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (cardParam) {
      setOpenId(cardParam);
      requestAnimationFrame(() => {
        document.getElementById(`card-${cardParam}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [cardParam]);

  const learnedCount = progress.learned.length;
  const total = CARDS.length;
  const pct = total === 0 ? 0 : Math.round((learnedCount / total) * 100);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CARDS.filter((c) => {
      if (categoria !== "Todas" && c.categoria !== categoria) return false;
      if (extra === "aprendidas" && !progress.learned.includes(c.id)) return false;
      if (extra === "favoritos" && !progress.favorites.includes(c.id)) return false;
      if (!q) return true;
      const haystack = [
        c.nombre,
        c.categoria,
        c.queQuieroDecir,
        c.traduccion,
        c.analogia,
        c.explicacion,
        c.errorComun,
        ...(c.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, categoria, extra, progress.learned, progress.favorites]);

  const setOpen = (id: string | null) => {
    setOpenId(id);
    void navigate({
      search: (prev) => ({ ...prev, card: id ?? undefined }),
      replace: true,
    });
  };

  const toggleOpen = (id: string) => {
    setOpen(openId === id ? null : id);
  };

  return (
    <div className={cn(dark && "dark")}>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        {/* Soft atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 opacity-80"
          style={{
            background: dark
              ? "radial-gradient(1200px 600px at 10% -10%, rgba(56,189,248,0.12), transparent), radial-gradient(900px 500px at 90% 0%, rgba(52,211,153,0.08), transparent)"
              : "radial-gradient(1200px 600px at 10% -10%, rgba(14,165,233,0.12), transparent), radial-gradient(900px 500px at 90% 0%, rgba(16,185,129,0.08), transparent)",
          }}
        />

        <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 md:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  to="/"
                  className="mb-2 inline-flex text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  ← Volver al escritorio
                </Link>
                <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight md:text-2xl">
                  <BookOpen className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                  Diccionario JavaScript
                </h1>
                <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
                  JavaScript traducido a lenguaje humano. Para principiantes que piensan en intención, no en jerga.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDark((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                aria-label={dark ? "Modo claro" : "Modo oscuro"}
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {dark ? "Claro" : "Oscuro"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Stat label="Conceptos" value={String(total)} />
              <Stat label="Aprendidos" value={String(learnedCount)} />
              <Stat label="Completado" value={`${pct}%`} highlight={pct > 0} />
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, analogía, explicación, categoría…"
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-10 pr-10 text-sm shadow-sm outline-none ring-sky-500/30 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterChip active={categoria === "Todas"} onClick={() => setCategoria("Todas")}>
                Todas
              </FilterChip>
              {CATEGORIAS.map((cat) => (
                <FilterChip
                  key={cat}
                  active={categoria === cat}
                  onClick={() => setCategoria(cat)}
                >
                  {CATEGORIA_META[cat].emoji} {cat}
                </FilterChip>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterChip active={extra === "todas"} onClick={() => setExtra("todas")} muted>
                Ver todas
              </FilterChip>
              <FilterChip active={extra === "aprendidas"} onClick={() => setExtra("aprendidas")} muted>
                ✓ Aprendidas
              </FilterChip>
              <FilterChip active={extra === "favoritos"} onClick={() => setExtra("favoritos")} muted>
                <Star className="mr-1 inline h-3.5 w-3.5" /> Favoritos
              </FilterChip>
            </div>
          </div>

          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {filtered.length} concepto{filtered.length === 1 ? "" : "s"}
            {query ? ` para “${query}”` : ""}
          </p>

          <div className="flex flex-col gap-3">
            {filtered.map((card) => (
              <DictionaryCard
                key={card.id}
                card={card}
                open={openId === card.id}
                onToggle={() => toggleOpen(card.id)}
                learned={progress.isLearned(card.id)}
                favorite={progress.isFavorite(card.id)}
                onToggleLearned={() => progress.toggleLearned(card.id)}
                onToggleFavorite={() => progress.toggleFavorite(card.id)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-700">
                <p className="text-zinc-500 dark:text-zinc-400">
                  No hay cartillas con ese filtro. Probá otra búsqueda o categoría.
                </p>
              </div>
            )}
          </div>

          <p className="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-600">
            Agregá más cartillas en <code className="font-mono">src/data/diccionario-js.json</code>
          </p>
        </main>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/90 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-lg font-semibold tabular-nums md:text-xl",
          highlight && "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  muted,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? muted
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-sky-600 text-white shadow-sm"
          : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
      )}
    >
      {children}
    </button>
  );
}
