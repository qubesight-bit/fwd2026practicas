export type DiccionarioCategoria =
  | "Variables"
  | "Condicionales"
  | "Bucles"
  | "Funciones"
  | "Arrays"
  | "Objetos"
  | "DOM"
  | "Eventos";

export type DiccionarioCard = {
  id: string;
  categoria: DiccionarioCategoria;
  nombre: string;
  keywords?: string[];
  queQuieroDecir: string;
  traduccion: string;
  analogia: string;
  codigo: string;
  explicacion: string;
  errorComun: string;
  miniEjemplo: string;
  pregunta: string;
  respuesta: string;
};

export const CATEGORIAS: DiccionarioCategoria[] = [
  "Variables",
  "Condicionales",
  "Bucles",
  "Funciones",
  "Arrays",
  "Objetos",
  "DOM",
  "Eventos",
];

export const CATEGORIA_META: Record<
  DiccionarioCategoria,
  { emoji: string; color: string }
> = {
  Variables: { emoji: "📦", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  Condicionales: { emoji: "🔀", color: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  Bucles: { emoji: "🔁", color: "bg-amber-500/15 text-amber-800 dark:text-amber-300" },
  Funciones: { emoji: "⚙", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  Arrays: { emoji: "📚", color: "bg-orange-500/15 text-orange-800 dark:text-orange-300" },
  Objetos: { emoji: "🧩", color: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  DOM: { emoji: "🌐", color: "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300" },
  Eventos: { emoji: "🎯", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
};
