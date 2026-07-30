import { useState, type ReactNode } from "react";
import {
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  Lightbulb,
  Link2,
  MessageCircle,
  Star,
  TriangleAlert,
  FlaskConical,
  HelpCircle,
} from "lucide-react";
import type { DiccionarioCard } from "@/lib/diccionario-types";
import { CATEGORIA_META } from "@/lib/diccionario-types";
import { JsCode } from "@/components/diccionario/JsCode";
import { cn } from "@/lib/utils";

type Props = {
  card: DiccionarioCard;
  open: boolean;
  onToggle: () => void;
  learned: boolean;
  favorite: boolean;
  onToggleLearned: () => void;
  onToggleFavorite: () => void;
};

export function DictionaryCard({
  card,
  open,
  onToggle,
  learned,
  favorite,
  onToggleLearned,
  onToggleFavorite,
}: Props) {
  const meta = CATEGORIA_META[card.categoria];
  const [showAnswer, setShowAnswer] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/diccionario?card=${encodeURIComponent(card.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copiá este enlace:", url);
    }
  };

  return (
    <article
      id={`card-${card.id}`}
      className={cn(
        "rounded-2xl border bg-white/90 shadow-sm transition-all duration-300 dark:bg-zinc-900/80",
        open
          ? "border-zinc-300 shadow-md dark:border-zinc-600"
          : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-600",
        learned && "ring-1 ring-emerald-400/40",
      )}
    >
      <div className="flex items-start gap-2 p-4 md:p-5">
        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
          aria-expanded={open}
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", meta.color)}>
              {meta.emoji} {card.categoria}
            </span>
            {learned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                <Check className="h-3 w-3" /> Aprendida
              </span>
            )}
          </div>
          <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-xl">
            <BookOpen className="h-4 w-4 shrink-0 text-zinc-400" />
            <span className="font-mono">{card.nombre}</span>
          </h3>
          {!open && (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
              {card.queQuieroDecir}
            </p>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            title="Favorito"
            onClick={onToggleFavorite}
            className={cn(
              "rounded-lg p-2 transition-colors",
              favorite
                ? "text-amber-500"
                : "text-zinc-400 hover:bg-zinc-100 hover:text-amber-500 dark:hover:bg-zinc-800",
            )}
          >
            <Star className={cn("h-4 w-4", favorite && "fill-current")} />
          </button>
          <button
            type="button"
            title="Compartir enlace"
            onClick={share}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Link2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={open ? "Contraer" : "Expandir"}
          >
            <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", open && "rotate-180")} />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-5 border-t border-zinc-100 px-4 pb-5 pt-4 dark:border-zinc-800 md:px-5">
            <Section icon={<Brain className="h-4 w-4" />} title="¿Qué quiero decirle al programa?">
              <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                {card.queQuieroDecir}
              </p>
            </Section>

            <Section icon={<MessageCircle className="h-4 w-4" />} title="Traducción">
              <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                {card.traduccion}
              </pre>
            </Section>

            <Section icon={<Lightbulb className="h-4 w-4" />} title="Analogía">
              <p className="text-[15px] leading-relaxed text-zinc-700 italic dark:text-zinc-300">
                {card.analogia}
              </p>
            </Section>

            <Section icon={<span className="text-xs font-bold">JS</span>} title="JavaScript">
              <JsCode code={card.codigo} />
            </Section>

            <Section icon={<BookOpen className="h-4 w-4" />} title="¿Qué hace?">
              <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                {card.explicacion}
              </p>
            </Section>

            <Section icon={<TriangleAlert className="h-4 w-4 text-amber-500" />} title="Error común">
              <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-[15px] leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                {card.errorComun}
              </p>
            </Section>

            <Section icon={<FlaskConical className="h-4 w-4" />} title="Mini ejemplo">
              <JsCode code={card.miniEjemplo} />
            </Section>

            <Section icon={<HelpCircle className="h-4 w-4" />} title="Pregunta para comprobar">
              <p className="mb-3 text-[15px] font-medium text-zinc-800 dark:text-zinc-200">
                {card.pregunta}
              </p>
              <button
                type="button"
                onClick={() => setShowAnswer((v) => !v)}
                className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                {showAnswer ? "Ocultar respuesta" : "Ver respuesta"}
              </button>
              {showAnswer && (
                <p className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[15px] text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
                  {card.respuesta}
                </p>
              )}
            </Section>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={onToggleLearned}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  learned
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
                )}
              >
                <Check className="h-4 w-4" />
                {learned ? "Marcada como aprendida" : "Marcar como aprendida"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        {icon}
        {title}
      </div>
      {children}
    </section>
  );
}
