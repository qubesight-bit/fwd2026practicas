import { useEffect, useMemo, useRef, useState } from "react";

/** Sugerencias tipo Visual Basic / IntelliSense por tema. */
export type Snippet = {
  /** Texto que se muestra en la lista */
  label: string;
  /** Texto que se inserta ($0 = donde queda el cursor) */
  insert: string;
  /** Explicación corta */
  info: string;
  kind: "etiqueta" | "propiedad" | "palabra" | "método" | "comando" | "operador";
};

const HTML_SNIPPETS: Snippet[] = [
  { label: "<h1>", insert: "<h1>$0</h1>", info: "Título más importante", kind: "etiqueta" },
  { label: "<h2>", insert: "<h2>$0</h2>", info: "Subtítulo", kind: "etiqueta" },
  { label: "<p>", insert: "<p>$0</p>", info: "Párrafo de texto", kind: "etiqueta" },
  { label: "<a>", insert: '<a href="$0">texto</a>', info: "Enlace (href = destino)", kind: "etiqueta" },
  { label: "<img>", insert: '<img src="$0" alt="descripción">', info: "Imagen (siempre con alt)", kind: "etiqueta" },
  { label: "<ul>", insert: "<ul>\n  <li>$0</li>\n</ul>", info: "Lista con viñetas", kind: "etiqueta" },
  { label: "<ol>", insert: "<ol>\n  <li>$0</li>\n</ol>", info: "Lista numerada", kind: "etiqueta" },
  { label: "<li>", insert: "<li>$0</li>", info: "Ítem de una lista", kind: "etiqueta" },
  { label: "<div>", insert: "<div>$0</div>", info: "Caja genérica", kind: "etiqueta" },
  { label: "<span>", insert: "<span>$0</span>", info: "Trozo de texto en línea", kind: "etiqueta" },
  { label: "<button>", insert: "<button>$0</button>", info: "Botón clicable", kind: "etiqueta" },
  { label: "<input>", insert: '<input type="text" placeholder="$0">', info: "Campo para escribir", kind: "etiqueta" },
  { label: "<body>", insert: "<body>\n  $0\n</body>", info: "Todo lo visible va aquí", kind: "etiqueta" },
  { label: "<head>", insert: "<head>\n  $0\n</head>", info: "Info de la página (no visible)", kind: "etiqueta" },
  { label: "<title>", insert: "<title>$0</title>", info: "Texto de la pestaña", kind: "etiqueta" },
  { label: "<br>", insert: "<br>", info: "Salto de línea (etiqueta vacía)", kind: "etiqueta" },
  { label: "href=", insert: 'href="$0"', info: "Atributo destino del enlace", kind: "propiedad" },
  { label: "src=", insert: 'src="$0"', info: "Atributo origen de la imagen", kind: "propiedad" },
  { label: "alt=", insert: 'alt="$0"', info: "Descripción de la imagen", kind: "propiedad" },
  { label: "class=", insert: 'class="$0"', info: "Grupo para estilos", kind: "propiedad" },
  { label: "id=", insert: 'id="$0"', info: "Nombre único del elemento", kind: "propiedad" },
];

const CSS_SNIPPETS: Snippet[] = [
  { label: "color", insert: "color: $0;", info: "Color del TEXTO", kind: "propiedad" },
  { label: "background-color", insert: "background-color: $0;", info: "Color del fondo", kind: "propiedad" },
  { label: "font-size", insert: "font-size: $0px;", info: "Tamaño de letra", kind: "propiedad" },
  { label: "font-weight", insert: "font-weight: bold;", info: "Grosor de la letra", kind: "propiedad" },
  { label: "text-align", insert: "text-align: center;", info: "Alinear el texto", kind: "propiedad" },
  { label: "margin", insert: "margin: $0px;", info: "Espacio FUERA de la caja", kind: "propiedad" },
  { label: "padding", insert: "padding: $0px;", info: "Espacio DENTRO de la caja", kind: "propiedad" },
  { label: "border", insert: "border: 1px solid $0;", info: "Borde de la caja", kind: "propiedad" },
  { label: "display", insert: "display: flex;", info: "Cómo se acomoda la caja", kind: "propiedad" },
  { label: "justify-content", insert: "justify-content: center;", info: "Centrar en el eje principal", kind: "propiedad" },
  { label: "align-items", insert: "align-items: center;", info: "Centrar en el eje cruzado", kind: "propiedad" },
  { label: ".clase", insert: ".$0 {\n  \n}", info: "Selector de clase (grupo)", kind: "operador" },
  { label: "#id", insert: "#$0 {\n  \n}", info: "Selector de id (uno solo)", kind: "operador" },
];

const JS_SNIPPETS: Snippet[] = [
  { label: "const", insert: "const $0 = ;", info: "Caja con candado (no se reasigna)", kind: "palabra" },
  { label: "let", insert: "let $0 = ;", info: "Caja que sí puede cambiar", kind: "palabra" },
  { label: "typeof", insert: "typeof $0", info: "Pregunta el tipo: 'number', 'string'…", kind: "palabra" },
  { label: "console.log", insert: "console.log($0);", info: "Mostrar algo en la consola", kind: "método" },
  { label: "if", insert: "if ($0) {\n  \n}", info: "Decidir según una condición", kind: "palabra" },
  { label: "else", insert: "else {\n  $0\n}", info: "Si no se cumple lo anterior", kind: "palabra" },
  { label: "for", insert: "for (let i = 0; i < $0; i++) {\n  \n}", info: "Repetir una cantidad de veces", kind: "palabra" },
  { label: "while", insert: "while ($0) {\n  \n}", info: "Repetir mientras se cumpla", kind: "palabra" },
  { label: "function", insert: "function $0() {\n  \n}", info: "Receta reutilizable", kind: "palabra" },
  { label: "return", insert: "return $0;", info: "Devolver un resultado", kind: "palabra" },
  { label: ".push()", insert: ".push($0);", info: "Método: agregar al final del array", kind: "método" },
  { label: ".length", insert: ".length", info: "Propiedad: cuántos hay (sin paréntesis)", kind: "propiedad" },
  { label: "Number()", insert: "Number($0)", info: "Convertir texto a número", kind: "método" },
  { label: "String()", insert: "String($0)", info: "Convertir número a texto", kind: "método" },
  { label: "&&", insert: "&& ", info: "Y lógico: ambos deben ser true", kind: "operador" },
  { label: "||", insert: "|| ", info: "O lógico: basta con uno", kind: "operador" },
  { label: "!", insert: "!", info: "NO lógico: invierte", kind: "operador" },
  { label: "===", insert: "=== ", info: "Comparar igualdad estricta", kind: "operador" },
];

const DOM_SNIPPETS: Snippet[] = [
  { label: "document.getElementById", insert: 'document.getElementById("$0")', info: "Buscar por id (null si no existe)", kind: "método" },
  { label: "document.querySelector", insert: 'document.querySelector("$0")', info: "El PRIMERO que coincide", kind: "método" },
  { label: "document.querySelectorAll", insert: 'document.querySelectorAll("$0")', info: "TODOS los que coinciden", kind: "método" },
  { label: ".textContent", insert: '.textContent = "$0";', info: "Propiedad: leer/cambiar el texto", kind: "propiedad" },
  { label: ".classList.add", insert: '.classList.add("$0");', info: "Método: agregar una clase", kind: "método" },
  { label: ".classList.remove", insert: '.classList.remove("$0");', info: "Método: quitar una clase", kind: "método" },
  { label: ".style.color", insert: '.style.color = "$0";', info: "Cambiar un estilo desde JS", kind: "propiedad" },
  { label: ".value", insert: ".value", info: "Propiedad: lo escrito en un input", kind: "propiedad" },
  { label: "addEventListener", insert: '.addEventListener("click", () => {\n  $0\n});', info: "Escuchar un evento", kind: "método" },
  ...JS_SNIPPETS,
];

const TERMINAL_SNIPPETS: Snippet[] = [
  { label: "nslookup", insert: "nslookup $0", info: "Preguntar la IP de un dominio al DNS", kind: "comando" },
  { label: "ping", insert: "ping $0", info: "Ver si el servidor responde", kind: "comando" },
  { label: "cd", insert: "cd $0", info: "Entrar a una carpeta", kind: "comando" },
  { label: "ls", insert: "ls", info: "Listar archivos (Mac/Linux)", kind: "comando" },
  { label: "dir", insert: "dir", info: "Listar archivos (Windows)", kind: "comando" },
  { label: "pwd", insert: "pwd", info: "¿En qué carpeta estoy?", kind: "comando" },
  { label: "mkdir", insert: "mkdir $0", info: "Crear una carpeta", kind: "comando" },
  { label: "rm", insert: "rm $0", info: "Borrar un archivo", kind: "comando" },
  { label: "mv", insert: "mv origen destino", info: "Mover o renombrar", kind: "comando" },
  { label: "cp", insert: "cp origen destino", info: "Copiar", kind: "comando" },
  { label: "ipconfig", insert: "ipconfig /flushdns", info: "Limpiar caché DNS (Windows)", kind: "comando" },
];

const LOGICA_SNIPPETS: Snippet[] = [
  { label: "&&", insert: "&& ", info: "AND: los dos deben ser true", kind: "operador" },
  { label: "||", insert: "|| ", info: "OR: basta con uno true", kind: "operador" },
  { label: "!", insert: "!", info: "NOT: invierte el valor", kind: "operador" },
  { label: "true", insert: "true", info: "Verdadero", kind: "palabra" },
  { label: "false", insert: "false", info: "Falso", kind: "palabra" },
  { label: "==", insert: "== ", info: "¿Son iguales?", kind: "operador" },
  { label: "!=", insert: "!= ", info: "¿Son distintos?", kind: "operador" },
  { label: ">=", insert: ">= ", info: "Mayor o igual", kind: "operador" },
  { label: "<=", insert: "<= ", info: "Menor o igual", kind: "operador" },
];

const RED_SNIPPETS: Snippet[] = [
  ...TERMINAL_SNIPPETS,
  { label: "https://", insert: "https://$0", info: "Protocolo seguro", kind: "palabra" },
  { label: "200", insert: "200", info: "OK: todo salió bien", kind: "palabra" },
  { label: "301", insert: "301", info: "Movido permanentemente", kind: "palabra" },
  { label: "404", insert: "404", info: "No encontrado (error tuyo, 4xx)", kind: "palabra" },
  { label: "500", insert: "500", info: "Error del servidor (5xx)", kind: "palabra" },
];

const BY_TAG: Record<string, Snippet[]> = {
  HTML: HTML_SNIPPETS,
  CSS: CSS_SNIPPETS,
  JS: JS_SNIPPETS,
  DOM: DOM_SNIPPETS,
  TERMINAL: TERMINAL_SNIPPETS,
  LOGICA: LOGICA_SNIPPETS,
  RED: RED_SNIPPETS,
  DNS: RED_SNIPPETS,
  HTTP: RED_SNIPPETS,
};

export function getSnippets(tag: string): Snippet[] {
  return BY_TAG[(tag || "").toUpperCase()] ?? [];
}

const KIND_ICON: Record<Snippet["kind"], string> = {
  etiqueta: "🏷️",
  propiedad: "🔧",
  palabra: "🔑",
  método: "⚡",
  comando: "💻",
  operador: "➗",
};

/** Devuelve el "token" que se está escribiendo justo antes del cursor. */
function currentToken(text: string, caret: number) {
  const before = text.slice(0, caret);
  const m = before.match(/[<.#/A-Za-z0-9_!&|=>-]+$/);
  const token = m ? m[0] : "";
  return { token, start: caret - token.length };
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  tag: string;
  rows?: number;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
};

/** Textarea con autocompletado estilo Visual Basic (IntelliSense). */
export default function CodeEditor({ value, onChange, tag, rows = 3, placeholder, className, style }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [start, setStart] = useState(0);
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);

  const all = useMemo(() => getSnippets(tag), [tag]);

  const matches = useMemo(() => {
    const t = token.toLowerCase();
    if (!t && manual) return all.slice(0, 12);
    if (t.length < 1) return [];
    const norm = (s: string) => s.toLowerCase().replace(/[<>./#()]/g, "");
    const q = norm(t);
    if (!q) return all.filter((s) => s.label.startsWith(t)).slice(0, 12);
    return all
      .filter((s) => norm(s.label).startsWith(q) || s.label.toLowerCase().startsWith(t))
      .slice(0, 12);
  }, [token, all, manual]);

  useEffect(() => { setActive(0); }, [token]);
  useEffect(() => { if (matches.length === 0) setOpen(false); }, [matches.length]);

  const refresh = (manualOpen = false) => {
    const el = ref.current;
    if (!el) return;
    const { token: t, start: s } = currentToken(el.value, el.selectionStart ?? 0);
    setToken(t);
    setStart(s);
    setManual(manualOpen);
    setOpen(true);
  };

  const insert = (sn: Snippet) => {
    const el = ref.current;
    const caret = el?.selectionStart ?? value.length;
    const from = manual && !token ? caret : start;
    const text = sn.insert.replace("$0", "");
    const next = value.slice(0, from) + text + value.slice(caret);
    onChange(next);
    setOpen(false);
    setManual(false);
    const cursorAt = sn.insert.indexOf("$0");
    const pos = from + (cursorAt >= 0 ? cursorAt : text.length);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === " ") {
      e.preventDefault();
      refresh(true);
      return;
    }
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % matches.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i - 1 + matches.length) % matches.length); }
    else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insert(matches[active]); }
    else if (e.key === "Escape") { setOpen(false); setManual(false); }
  };

  const showList = open && matches.length > 0;

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        rows={rows}
        spellCheck={false}
        placeholder={placeholder}
        className={className}
        style={style}
        onChange={(e) => { onChange(e.target.value); requestAnimationFrame(() => refresh(false)); }}
        onKeyDown={onKeyDown}
        onClick={() => { setOpen(false); setManual(false); }}
        onBlur={() => setTimeout(() => { setOpen(false); setManual(false); }, 150)}
      />
      <div className="text-[10px] opacity-60 mt-0.5">
        Escribe el inicio (por ej. <b>&lt;h</b> o <b>con</b>) y aparecerá la lista. Ctrl+Espacio muestra todo · ↑↓ mover · Enter/Tab insertar
      </div>
      {showList && (
        <ul
          className="absolute z-40 left-2 top-full -mt-1 max-h-56 overflow-auto w95-outset"
          style={{ background: "var(--w95-face, #fff)", minWidth: 260, boxShadow: "2px 2px 6px rgba(0,0,0,.35)" }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {matches.map((s, i) => (
            <li
              key={s.label + i}
              onMouseEnter={() => setActive(i)}
              onClick={() => insert(s)}
              className="flex items-center gap-2 px-2 py-1 cursor-pointer text-[12px]"
              style={{
                background: i === active ? "#000080" : "transparent",
                color: i === active ? "#fff" : "inherit",
              }}
            >
              <span>{KIND_ICON[s.kind]}</span>
              <span className="mono font-bold">{s.label}</span>
              <span className="opacity-75 truncate">{s.info}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
