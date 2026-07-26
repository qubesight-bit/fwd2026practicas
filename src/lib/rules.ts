// Reglas / recordatorios por tema. Se muestran en cada ejercicio y pregunta
// del quiz para que el estudiante interiorice la sintaxis obligatoria.

export type RuleTag =
  | "HTML" | "CSS" | "JS" | "DOM" | "TERMINAL" | "LOGICA" | "RED" | "DNS" | "HTTP" | "FRONTEND";

const COMMON_JS: string[] = [
  "Los textos (strings) SIEMPRE van entre comillas: 'Ada', \"Ada\" o `Ada`.",
  "Los números NO llevan comillas: 10 es número, '10' es texto.",
  "Cada instrucción termina con punto y coma ; al final.",
  "JavaScript distingue mayúsculas: Nombre ≠ nombre ≠ NOMBRE.",
  "Usa const si el valor NO cambia, let si SÍ cambia. Nunca var.",
  "Los métodos llevan paréntesis (): arr.push(x). Las propiedades no: arr.length.",
  "Los arrays empiezan en el índice 0, no en 1.",
];

const COMMON_HTML: string[] = [
  "Toda etiqueta se abre y se cierra: <p>…</p>. Excepto las vacías: <img>, <br>.",
  "Los atributos van entre comillas: href=\"…\", src=\"…\", alt=\"…\".",
  "Las imágenes SIEMPRE llevan alt=\"…\" (accesibilidad).",
  "Todo lo visible va dentro de <body>, nunca fuera.",
  "HTML no distingue mayúsculas, pero se escribe en minúsculas por convención.",
];

const COMMON_CSS: string[] = [
  "Cada regla termina con punto y coma ; dentro de las llaves { }.",
  "Selector de clase con punto: .btn { … }. Selector de id con almohadilla: #main { … }.",
  "propiedad: valor; (dos puntos entre propiedad y valor).",
  "Los colores pueden ser nombre (red), hex (#ff0000) o rgb().",
];

const COMMON_TERMINAL: string[] = [
  "Los comandos y opciones distinguen mayúsculas: ls ≠ LS.",
  "Separa comando y argumentos con UN espacio: cd proyectos.",
  "Las opciones empiezan con guion: -r, -f, --help.",
  "No pongas punto y coma al final: la terminal no lo necesita.",
];

const COMMON_LOGICA: string[] = [
  "AND (&&): solo true si AMBOS son true.",
  "OR (||): true si AL MENOS UNO es true.",
  "NOT (!): invierte el valor. !true = false.",
  "Prioridad: primero !, luego &&, después ||. Usa paréntesis para forzar el orden.",
];

const COMMON_RED: string[] = [
  "DNS traduce nombres (google.com) a IPs (142.250.185.78).",
  "Errores DNS: la petición NI SIQUIERA sale de tu máquina.",
  "Errores HTTP: el servidor sí respondió, pero con problema (4xx cliente, 5xx servidor).",
];

const RULES: Record<RuleTag, string[]> = {
  JS: COMMON_JS,
  HTML: COMMON_HTML,
  CSS: COMMON_CSS,
  DOM: [
    ...COMMON_JS.slice(0, 4),
    "document.querySelector('…') devuelve el PRIMER elemento; querySelectorAll devuelve TODOS.",
    "Para cambiar texto usa .textContent; para HTML usa .innerHTML (con cuidado).",
  ],
  TERMINAL: COMMON_TERMINAL,
  LOGICA: COMMON_LOGICA,
  RED: COMMON_RED,
  DNS: COMMON_RED,
  HTTP: [
    "2xx = éxito · 3xx = redirección · 4xx = error del cliente · 5xx = error del servidor.",
    "200 OK · 301 movido · 401 sin login · 403 prohibido · 404 no existe · 500 servidor roto.",
    "Un código HTTP significa que el servidor SÍ respondió (no confundir con error DNS).",
  ],
  FRONTEND: [
    "HTML = estructura · CSS = estilo · JS = comportamiento.",
    "El DOM es el árbol de objetos que JS usa para leer y modificar la página.",
    "El motor de renderizado dibuja; el DOM solo describe.",
  ],
};

export function getRules(tag: string): string[] {
  const key = (tag || "").toUpperCase() as RuleTag;
  return RULES[key] ?? [];
}
