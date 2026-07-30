// Reglas / recordatorios por tema. Se muestran en cada ejercicio y pregunta
// del quiz. Están redactadas para construir modelo mental (qué / por qué),
// no solo memorizar sintaxis.

export type RuleTag =
  | "HTML" | "CSS" | "JS" | "DOM" | "TERMINAL" | "LOGICA" | "RED" | "DNS" | "HTTP" | "FRONTEND";

const COMMON_JS: string[] = [
  "Qué es un string: texto. Por qué lleva comillas: para que JS sepa que no es un nombre de variable. Usa 'Ada', \"Ada\" o `Ada`.",
  "Los números NO llevan comillas: 10 es cantidad; '10' es texto. Mezclarlos con + puede pegar en vez de sumar.",
  "Cada instrucción es un paso. El ; marca el final del paso (como un punto al final de la frase).",
  "JS distingue mayúsculas: Nombre ≠ nombre. typeof responde en minúsculas: 'number', no 'Number'.",
  "const = candado (no reasignas). let = caja que sí puedes cambiar. Empieza con const; pasa a let solo si hace falta.",
  "Propiedad = dato (arr.length, sin ()). Método = acción (arr.push(x), con ()). Los () significan «ejecuta».",
  "En un array el primer casillero es 0, no 1. frutas[0] es el primero de la lista.",
];

const COMMON_HTML: string[] = [
  "Etiqueta = marca qué es el contenido. Se abre y se cierra: <p>…</p>. Vacías (solo info): <img>, <br>.",
  "Atributos = instrucciones pegadas en la apertura. Van entre comillas: href=\"…\", src=\"…\", alt=\"…\".",
  "alt en imágenes: describe la foto. Por qué: accesibilidad y si la imagen no carga.",
  "body = escenario visible. Todo lo que el usuario ve va dentro de <body>, nunca fuera.",
  "HTML no distingue mayúsculas, pero se escribe en minúsculas por costumbre clara.",
];

const COMMON_CSS: string[] = [
  "Cada declaración es un paso de estilo: termina con ; dentro de las llaves { }.",
  "Clase = grupo (.btn). id = uno solo (#main). El punto y la # dicen «cómo buscar el elemento».",
  "Forma: propiedad: valor; — los dos puntos separan el «qué cambiar» del «a qué».",
  "Colores: nombre (red), hex (#ff0000) o rgb(). Distintas formas, misma idea: pintar.",
];

const COMMON_TERMINAL: string[] = [
  "La terminal distingue mayúsculas: ls ≠ LS. Es literal con lo que escribes.",
  "Comando + espacio + argumento: cd proyectos = «entra a la carpeta proyectos».",
  "Opciones empiezan con guion (-r, -f): son modificadores de la acción.",
  "No hace falta ; al final: aquí cada línea ya es un paso completo.",
];

const COMMON_LOGICA: string[] = [
  "AND (&&): solo true si AMBOS son true. Regla estricta (mamá y el helado).",
  "OR (||): true si AL MENOS UNO es true. Con una alternativa basta (papá y el helado).",
  "NOT (!): invierte. !true = false. Es «lo contrario».",
  "Orden: primero !, luego &&, después ||. Los paréntesis ( ) mandan el orden a mano.",
];

const COMMON_RED: string[] = [
  "DNS: traduce nombre bonito → IP. Por qué: tú memoricas google.com; la máquina necesita el número.",
  "Error DNS: ni saliste de casa — no hay dirección en el mapa.",
  "Error HTTP: sí llegaste al servidor; él respondió con problema (4xx tú, 5xx él).",
];

const RULES: Record<RuleTag, string[]> = {
  JS: COMMON_JS,
  HTML: COMMON_HTML,
  CSS: COMMON_CSS,
  DOM: [
    ...COMMON_JS.slice(0, 4),
    "El punto (.) se lee «de» / «su»: elemento.textContent = el texto DE ese elemento.",
    "Después del punto: PROPIEDAD = qué tiene (sin ()); MÉTODO = qué hace (con ()).",
    "No inventés lo que va después del punto: textContent, style, classList, value ya existen.",
    "getElementById('…') busca por id. Si no existe → null.",
    "textContent = leer/cambiar texto. style = estilos. classList.add('…') = agregar clase.",
    "querySelector('…') = el PRIMERO. querySelectorAll = TODOS.",
    "Evento = señal de que algo ocurrió (click, input, submit…). addEventListener conecta elemento + función.",
    "Preferí addEventListener en el JS; evitá onclick en el HTML.",
    "event.target = quién disparó. event.preventDefault() = cancelar el comportamiento por defecto (ej. recargar en submit).",
    "createElement crea un nodo; appendChild lo agrega a un padre visible.",
  ],
  TERMINAL: COMMON_TERMINAL,
  LOGICA: COMMON_LOGICA,
  RED: COMMON_RED,
  DNS: COMMON_RED,
  HTTP: [
    "Familias: 2xx éxito · 3xx redirección · 4xx error tuyo · 5xx error del servidor.",
    "200 OK · 301 movido · 401 sin login · 403 prohibido · 404 no existe · 500 servidor roto.",
    "Un código HTTP significa que el servidor SÍ respondió. No lo confundas con error DNS.",
  ],
  FRONTEND: [
    "HTML = estructura · CSS = estilo · JS = comportamiento. Tres roles, un mismo escenario.",
    "DOM = árbol en memoria para que JS toque la página. El que dibuja es el motor de renderizado.",
    "Frontend = lo que corre en el dispositivo del usuario (aunque aún no esté en internet).",
  ],
};

export function getRules(tag: string): string[] {
  const key = (tag || "").toUpperCase() as RuleTag;
  return RULES[key] ?? [];
}
