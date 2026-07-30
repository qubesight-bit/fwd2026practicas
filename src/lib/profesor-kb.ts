/**
 * Base de conocimiento LOCAL del Profesor.
 * NO usa inteligencia artificial: solo busca y reúne material ya publicado
 * en lecciones, diccionario, quiz y reglas del sitio.
 */

import diccionario from "@/data/diccionario-js.json";
import type { DiccionarioCard } from "@/lib/diccionario-types";
import { questions } from "@/lib/quiz-data";
import { getRules, type RuleTag } from "@/lib/rules";

export type KnowledgeSource = {
  kind: "leccion" | "diccionario" | "quiz" | "regla";
  href: string;
  label: string;
};

export type KnowledgeEntry = {
  id: string;
  topic: string;
  title: string;
  keywords: string[];
  intention: string;
  what: string;
  why: string;
  how: string[];
  solve: string;
  whyThatWay: string;
  analogy?: string;
  code?: string;
  source: KnowledgeSource;
};

const STOP = new Set([
  "que", "qué", "como", "cómo", "cual", "cuál", "cuales", "cuáles", "por", "para",
  "con", "sin", "una", "uno", "unos", "unas", "del", "los", "las", "el", "la",
  "de", "en", "es", "un", "al", "se", "me", "te", "mi", "tu", "su", "y", "o",
  "pero", "si", "sí", "no", "hay", "ser", "esta", "está", "esto", "ese", "esa",
  "the", "a", "an", "of", "to", "is", "are", "was", "were", "be", "been",
  "quiero", "saber", "explica", "explicame", "explícame", "dime", "puedes",
  "puedo", "hacer", "significa", "significa", "diferencia", "entre",
]);

function stripAccents(s: string) {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

export function normalizeText(s: string) {
  return stripAccents(s.toLowerCase())
    .replace(/[^\p{L}\p{N}\s.+#<>/=_-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(s: string): string[] {
  return normalizeText(s)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Conceptos clave de las lecciones (mismo contenido pedagógico del sitio). */
const TEMAS_LECCION: KnowledgeEntry[] = [
  {
    id: "lec-dns",
    topic: "DNS",
    title: "Qué es el DNS",
    keywords: ["dns", "dominio", "ip", "guia", "telefonica", "nslookup", "nombre"],
    intention: "Quiero entender cómo un nombre como google.com se convierte en una dirección que las máquinas entienden.",
    what: "El DNS (Domain Name System) traduce un nombre bonito (google.com) a una IP (ej. 142.250.185.78).",
    why: "Tú memoricas nombres fáciles; las máquinas necesitan números para llegar al servidor.",
    how: [
      "Escribís un dominio en el navegador.",
      "La computadora pregunta al DNS: ¿cuál es la IP?",
      "El DNS responde con la IP.",
      "Con esa IP el navegador contacta al servidor.",
    ],
    solve: "Probá en terminal: nslookup google.com (solo pregunta la IP) o ping google.com (resuelve y además «llama»).",
    whyThatWay: "Así separás «encontrar la dirección» (DNS) de «el servidor respondió» (HTTP).",
    analogy: "Guía telefónica: das el nombre, recibís el número.",
    source: { kind: "leccion", href: "/lecciones/dns", label: "Lección DNS" },
  },
  {
    id: "lec-dns-vs-http",
    topic: "DNS",
    title: "Error DNS vs error HTTP",
    keywords: ["dns", "http", "404", "err_name", "nxdomain", "diferencia"],
    intention: "Quiero saber si el problema es que no encontré la dirección o que sí llegué pero el servidor falló.",
    what: "Error DNS = no se encontró la IP (la petición ni sale). Error HTTP = sí hubo respuesta del servidor (200, 404, 500…).",
    why: "Si los mezclás, intentás arreglar el servidor cuando en realidad ni encontraste la casa.",
    how: [
      "Primero: ¿el DNS resolvió el nombre?",
      "Si no → error DNS (ERR_NAME_NOT_RESOLVED, etc.).",
      "Si sí → contactás al servidor y mirás el código HTTP.",
    ],
    solve: "Si ves ERR_NAME_NOT_RESOLVED: revisá el dominio. Si ves 404: el servidor existe pero esa ruta no.",
    whyThatWay: "DNS es el mapa; HTTP es lo que pasa cuando ya tocaste el timbre.",
    analogy: "DNS: la dirección no está en el mapa. HTTP: llegaste, pero no te dejaron entrar / no existe esa habitación.",
    source: { kind: "leccion", href: "/lecciones/dns", label: "Lección DNS" },
  },
  {
    id: "lec-http-codes",
    topic: "HTTP",
    title: "Códigos HTTP comunes",
    keywords: ["http", "200", "301", "404", "500", "403", "502", "503", "codigo"],
    intention: "Quiero interpretar qué significa la respuesta del servidor.",
    what: "Los códigos HTTP son números que el servidor manda: 2xx bien, 3xx redirección, 4xx error tuyo, 5xx error del servidor.",
    why: "Te dicen en qué momento falló (o si todo salió bien) después de haber llegado.",
    how: [
      "200 = OK",
      "301 = mudanza permanente",
      "403 = prohibido",
      "404 = no existe ese recurso",
      "500 = el servidor se rompió por dentro",
      "502/503 = gateway / no disponible",
    ],
    solve: "Leé el número: 4xx → revisá URL/permisos; 5xx → problema del servidor; 2xx → éxito.",
    whyThatWay: "Familias de códigos agrupan causas parecidas para diagnosticar más rápido.",
    source: { kind: "leccion", href: "/lecciones/dns", label: "Lección DNS / HTTP" },
  },
  {
    id: "lec-and-or-not",
    topic: "LOGICA",
    title: "AND, OR y NOT",
    keywords: ["and", "or", "not", "&&", "||", "!", "logica", "helado", "verdad"],
    intention: "Quiero decidir con reglas: ambos, al menos uno, o lo contrario.",
    what: "&& (AND) exige ambos true. || (OR) basta con uno. ! (NOT) invierte.",
    why: "Así el programa elige caminos según condiciones claras, como reglas de la vida real.",
    how: [
      "AND: helado solo si limpiás Y hacés la tarea (mamá).",
      "OR: helado si limpiás O hacés la tarea (papá).",
      "NOT: lo contrario de lo que era.",
      "Orden: primero !, luego &&, después || (o usá paréntesis).",
    ],
    solve: "Escribí la condición en español → traducir a && / || / ! → probar con true/false.",
    whyThatWay: "El operador refleja la intención: «ambos», «alguno» o «al revés».",
    analogy: "Reglas del helado en casa.",
    code: "(true || false) && !false  →  true",
    source: { kind: "leccion", href: "/lecciones/operadores", label: "Lección operadores" },
  },
  {
    id: "lec-let-const",
    topic: "JS",
    title: "let vs const",
    keywords: ["let", "const", "variable", "reasignar", "candado", "caja"],
    intention: "Quiero una caja con nombre: a veces cambiar el valor, a veces no.",
    what: "let crea una caja que podés reasignar. const crea una caja sellada (no reasignás).",
    why: "const protege valores que no deben cambiar; let sirve para contadores y cosas que sí cambian.",
    how: [
      "Si el valor puede cambiar → let.",
      "Si no debe reasignarse → const.",
      "Empezá con const; pasá a let solo si hace falta.",
    ],
    solve: "const nombre = \"Ada\";  // bien\nlet puntos = 0; puntos = puntos + 1;  // bien\nconst x = 1; x = 2;  // error",
    whyThatWay: "Elegís según la intención: «¿puedo reemplazar lo de adentro?»",
    analogy: "let = vaso; const = frasco sellado.",
    code: "let edad = 10;\nconst PI = 3.14;",
    source: { kind: "leccion", href: "/lecciones/fundamentos", label: "Lección fundamentos" },
  },
  {
    id: "lec-if",
    topic: "JS",
    title: "if / else",
    keywords: ["if", "else", "condicion", "si", "entonces"],
    intention: "Si ocurre esto, hacé aquello; si no, hacé lo otro.",
    what: "if mira una condición; si es verdadera entra al bloque { }. else es el plan B.",
    why: "Para que el programa decida, no haga siempre lo mismo.",
    how: [
      "Escribí la condición entre paréntesis.",
      "Poné lo que ocurre si es verdad dentro de { }.",
      "Opcional: else { … } si no se cumplió.",
    ],
    solve: "if (edad >= 18) { console.log(\"Adulto\"); } else { console.log(\"Menor\"); }",
    whyThatWay: "La condición es la pregunta; las llaves son «qué hacer» según la respuesta.",
    analogy: "Semáforo: si está verde, avanzás.",
    code: "if (edad >= 18) {\n  console.log(\"Mayor de edad\");\n}",
    source: { kind: "leccion", href: "/lecciones/fundamentos", label: "Lección fundamentos" },
  },
  {
    id: "lec-for-while",
    topic: "JS",
    title: "Bucles for y while",
    keywords: ["for", "while", "bucle", "repetir", "loop"],
    intention: "Quiero repetir algo varias veces o mientras se cumpla una condición.",
    what: "for suele repetir un número conocido de veces. while repite mientras la condición sea verdadera.",
    why: "Evita copiar el mismo código una y otra vez.",
    how: [
      "for: inicio; condición; avance → cuerpo.",
      "while: mientras condición → cuerpo (cuidado de no crear bucle infinito).",
    ],
    solve: "for (let i = 0; i < 5; i++) { console.log(i); }",
    whyThatWay: "Elegís for cuando sabés el conteo; while cuando depende de «seguir mientras…».",
    analogy: "for = profesor revisando exámenes uno por uno; while = seguir mientras quede tarea.",
    code: "for (let i = 0; i < 5; i++) { console.log(i); }",
    source: { kind: "leccion", href: "/lecciones/fundamentos", label: "Lección fundamentos" },
  },
  {
    id: "lec-function-return",
    topic: "JS",
    title: "function y return",
    keywords: ["function", "funcion", "return", "devolver", "parametro"],
    intention: "Quiero un botón/receta reutilizable que haga un trabajo y a veces entregue una respuesta.",
    what: "function define una receta. return entrega el resultado y sale de la función.",
    why: "Para no repetir lógica y para poder reutilizar el mismo proceso con distintos datos.",
    how: [
      "Nombrá la función.",
      "Poné parámetros si necesita datos de entrada.",
      "Escribí los pasos adentro.",
      "Usá return cuando querés devolver una respuesta.",
    ],
    solve: "function saludar(nombre) { return \"Hola \" + nombre; }",
    whyThatWay: "La función es la receta; return es «aquí está lo que pediste».",
    analogy: "function = botón de acción; return = entregar la respuesta.",
    code: "function saludar(nombre) {\n  return \"Hola \" + nombre;\n}",
    source: { kind: "leccion", href: "/lecciones/js", label: "Lección JavaScript" },
  },
  {
    id: "lec-typeof-coercion",
    topic: "JS",
    title: "typeof y coerción ('3'+10)",
    keywords: ["typeof", "number", "string", "concatenar", "coercion", "3+10"],
    intention: "Quiero saber el tipo de un valor y entender por qué a veces pega textos en vez de sumar.",
    what: "typeof pregunta el tipo (en minúsculas: 'number', 'string'…). Con + si hay texto, JS suele pegar; con * o - suele convertir a número.",
    why: "Mezclar texto y número sin querer es un error clásico de principiantes.",
    how: [
      "typeof 10 → 'number' (no 'Number').",
      "'3' + 10 → '310' (pega).",
      "'3' * 10 → 30 (convierte y multiplica).",
      "Number('3') si querés sumar de verdad.",
    ],
    solve: "let esNumero = typeof cantidad === 'number';",
    whyThatWay: "Primero preguntás el tipo; después elegís el operador según la intención (pegar vs calcular).",
    analogy: "typeof = leer la etiqueta del producto.",
    code: "typeof 10; // 'number'\n'3' + 10; // '310'",
    source: { kind: "leccion", href: "/lecciones/js", label: "Lección JavaScript" },
  },
  {
    id: "lec-array",
    topic: "JS",
    title: "Arrays: índice, length y push",
    keywords: ["array", "lista", "length", "push", "indice", "index", "0"],
    intention: "Quiero una lista ordenada, contar cuántos hay y agregar al final.",
    what: "Un array es una lista. El primer casillero es 0. .length cuenta. .push() agrega al final.",
    why: "Para guardar varios valores relacionados sin mil variables sueltas.",
    how: [
      "Crear: let frutas = ['manzana','pera'];",
      "Leer el primero: frutas[0]",
      "Contar: frutas.length (propiedad, sin ()).",
      "Agregar: frutas.push('uva') (método, con ()).",
    ],
    solve: "let arr = [10, 20, 30]; arr.push(40); // length pasa a 4",
    whyThatWay: "Índice 0 porque las posiciones empiezan en cero en JS. () en push porque es una acción.",
    analogy: "Lista del supermercado / taquillas numeradas desde 0.",
    code: "let frutas = [\"manzana\", \"pera\"];\nfrutas.push(\"uva\");",
    source: { kind: "leccion", href: "/lecciones/js", label: "Lección JavaScript" },
  },
  {
    id: "lec-objeto",
    topic: "JS",
    title: "Objetos y el punto",
    keywords: ["objeto", "punto", "propiedad", "ficha", "libro.titulo"],
    intention: "Quiero una ficha con etiquetas (nombre, edad…) y leer un dato con el punto.",
    what: "Un objeto guarda pares etiqueta:valor. libro.titulo se lee «el título del libro».",
    why: "Cuando los datos tienen nombres (no solo posición), el objeto encaja mejor que el array.",
    how: [
      "Crear: let libro = { titulo: 'El Principito', paginas: 96 };",
      "Leer: libro.titulo",
      "El punto = «de» / «su».",
    ],
    solve: "console.log(libro.titulo);",
    whyThatWay: "Usás nombres claros para cada dato, como una ficha de biblioteca.",
    analogy: "Ficha de una persona / libro.",
    code: "let libro = { titulo: \"El Principito\", paginas: 96 };",
    source: { kind: "leccion", href: "/lecciones/js", label: "Lección JavaScript" },
  },
  {
    id: "lec-dom-punto",
    topic: "DOM",
    title: "DOM, el punto, propiedad vs método",
    keywords: ["dom", "punto", "textcontent", "getelementbyid", "style", "classlist", "propiedad", "metodo"],
    intention: "Quiero tocar un elemento de la página: su texto, su color o agregar una clase.",
    what: "El DOM es el árbol de la página en memoria. El punto (.) se lee «de». Propiedad = qué tiene (sin ()). Método = qué hace (con ()).",
    why: "Así JavaScript puede cambiar la página en vivo sin reinventar botones: usás herramientas que ya existen.",
    how: [
      "Buscar: document.getElementById('titulo')",
      "Texto: elemento.textContent",
      "Color: elemento.style.color = 'red'",
      "Clase: elemento.classList.add('activo')",
    ],
    solve: "1) ¿Qué quiero decirle? 2) ¿Cuál es la cosa? 3) ¿Qué herramienta ya existe? 4) cosa.herramienta",
    whyThatWay: "No inventás .pizza: cada cosa trae herramientas definidas (textContent, style, classList…).",
    analogy: "Control remoto de la TV: no inventás botones nuevos.",
    code: "titulo.textContent = \"Hola\";\ntitulo.style.color = \"red\";\ntitulo.classList.add(\"activo\");",
    source: { kind: "leccion", href: "/lecciones/dom", label: "Lección DOM" },
  },
  {
    id: "lec-html-body",
    topic: "HTML",
    title: "HTML: etiquetas y body",
    keywords: ["html", "etiqueta", "h1", "a", "img", "body", "ol", "ul"],
    intention: "Quiero marcar qué es cada contenido y que se vea en la página.",
    what: "HTML etiqueta el contenido. Lo visible va en <body>. <h1> título principal, <a href> enlace, <img src alt> imagen, <ol>/<ul> listas.",
    why: "El navegador necesita saber qué es cada bloque para mostrarlo y para accesibilidad.",
    how: [
      "Abrir y cerrar etiquetas: <p>…</p>",
      "Atributos entre comillas: href=\"…\", src=\"…\", alt=\"…\"",
      "Todo lo visible dentro de body.",
    ],
    solve: "<h1>Hola mundo</h1>\n<a href=\"https://google.com\">Buscar</a>",
    whyThatWay: "Primero la intención («quiero un enlace»), después la etiqueta correcta.",
    analogy: "Etiquetas de mudanza en las cajas.",
    code: "<h1>Hola mundo</h1>",
    source: { kind: "leccion", href: "/lecciones/html", label: "Lección HTML" },
  },
  {
    id: "lec-css",
    topic: "CSS",
    title: "CSS: color, clases y flex",
    keywords: ["css", "color", "background", "flex", "padding", "margin", ".btn", "clase"],
    intention: "Quiero cambiar cómo se ve algo: color, fondo, centrado, espacios.",
    what: "CSS pinta y ordena. color = texto; background = fondo; .clase selecciona un grupo; padding dentro, margin fuera.",
    why: "Separá estructura (HTML) de apariencia (CSS) para mantener orden.",
    how: [
      "Declaración: propiedad: valor;",
      "Clase: .btn { … }",
      "Centrar con flex: display:flex; justify-content:center; align-items:center;",
    ],
    solve: ".btn { background: blue; }\ncolor: red;",
    whyThatWay: "Elegís la propiedad según la intención: ¿texto o fondo? ¿dentro o fuera de la caja?",
    analogy: "Pintura y disposición de los muebles, no el esqueleto de la casa.",
    code: "color: red;\n.btn { background: blue; }",
    source: { kind: "leccion", href: "/lecciones/frontend", label: "Lección Frontend" },
  },
  {
    id: "lec-terminal",
    topic: "TERMINAL",
    title: "Comandos de terminal",
    keywords: ["terminal", "cd", "ls", "pwd", "ping", "nslookup", "dir", "rm"],
    intention: "Quiero moverme por carpetas, listar archivos o preguntar por un dominio.",
    what: "cd cambia de carpeta; ls/dir lista; pwd muestra dónde estás; nslookup pregunta IP; ping prueba si responde.",
    why: "La terminal habla directo con el sistema: rápido para navegar y diagnosticar red.",
    how: [
      "Orientarte: pwd (o cd sin args en algunos sistemas).",
      "Mirar: ls (Mac/Linux) o dir (Windows CMD).",
      "Entrar: cd proyectos",
      "DNS: nslookup google.com · Vivir: ping google.com",
    ],
    solve: "cd proyectos\nls\nnslookup google.com",
    whyThatWay: "Un comando = una intención. No uses ; al final como en JS.",
    analogy: "Cambiar de habitación (cd) vs mirar el cajón (ls).",
    code: "cd proyectos\nls\npwd",
    source: { kind: "leccion", href: "/lecciones/terminal", label: "Lección terminal" },
  },
  {
    id: "lec-contexto",
    topic: "CONTEXTO",
    title: "Ingeniería de Contexto (sin IA inventada: el concepto del curso)",
    keywords: ["contexto", "prompt", "rag", "ventana", "tokens", "basura"],
    intention: "Quiero prepararle a un modelo toda la información útil antes de pedirle trabajo.",
    what: "Ingeniería de Contexto = diseñar tarea, rol, conocimiento, historial, herramientas y formato. El prompt es solo una parte.",
    why: "La calidad de la respuesta depende mucho del contexto relevante (basura entra → basura sale).",
    how: [
      "Definí la tarea.",
      "Asigná un rol claro.",
      "Pasá solo datos relevantes (RAG: buscar → agregar → responder).",
      "Pedí formato concreto.",
      "Evitá contradicciones y secretos.",
    ],
    solve: "Checklist: ¿tarea? ¿rol? ¿datos? ¿historial? ¿herramientas? ¿formato?",
    whyThatWay: "Todo compite por una ventana de contexto limitada: relevancia > cantidad.",
    analogy: "Contratar a alguien: no basta decir «hazlo»; hay que darle la carpeta completa y clara.",
    source: { kind: "leccion", href: "/lecciones/contexto", label: "Lección Contexto y Deploy" },
  },
  {
    id: "lec-deploy",
    topic: "DEPLOY",
    title: "Deploy, entornos y seguridad",
    keywords: ["deploy", "prod", "dev", "stage", "test", "env", "https", "ssl", "canary", "blue", "green"],
    intention: "Quiero publicar la app con cuidado: entornos, actualización segura y secretos fuera del código.",
    what: "Deploy = poner la app disponible. Entornos: DEV → TEST → STAGE → PROD. .env guarda secretos. HTTPS cifra.",
    why: "En PROD los errores cuestan. Las claves en el código se filtran. HTTP sin cifrar es inseguro.",
    how: [
      "Desarrollá en DEV, probá en TEST, ensayá en STAGE, publicá en PROD.",
      "Estrategias: Recreate, Rolling, Blue-Green (vuelta atrás rápida), Canary (pocos usuarios primero).",
      "Secretos en variables de entorno, no en GitHub.",
      "Usá HTTPS (candado).",
    ],
    solve: "API_KEY en .env → process.env.API_KEY en el código. Nunca pegues la clave en el repo.",
    whyThatWay: "Separás entornos para no romper producción; Blue-Green/Canary reducen riesgo al actualizar.",
    analogy: "Cocinar en casa vs abrir restaurante; carta abierta (HTTP) vs sobre cerrado (HTTPS).",
    code: "# .env\nAPI_KEY=secreto\n\nprocess.env.API_KEY",
    source: { kind: "leccion", href: "/lecciones/contexto", label: "Lección Contexto y Deploy" },
  },
  {
    id: "lec-metodo-estudio",
    topic: "METODO",
    title: "Método de estudio del sitio (intención → código)",
    keywords: ["intencion", "metodo", "aprender", "traducir", "español", "profesor"],
    intention: "Quiero aprender sin memorizar sintaxis a ciegas.",
    what: "En este sitio se aprende por intención: primero qué le querés decir al programa; después cómo se escribe.",
    why: "Así el código es la misma idea que ya entendiste, no símbolos raros sueltos.",
    how: [
      "¿Qué me pide?",
      "¿Cómo lo haría una persona?",
      "Algoritmo en español (pasos).",
      "Traducir a código.",
      "Justificar cada símbolo.",
    ],
    solve: "Ante un error: preguntá «¿qué estoy intentando decirle?» — a menudo el ; o las () dijeron otra cosa.",
    whyThatWay: "La sintaxis sirve a la intención, no al revés.",
    analogy: "Contratar a alguien: primero el encargo claro, después las palabras exactas.",
    source: { kind: "leccion", href: "/estudiar", label: "¿Qué estudiar?" },
  },
];

function fromDictionary(): KnowledgeEntry[] {
  const cards = diccionario as DiccionarioCard[];
  return cards.map((c) => ({
    id: `dic-${c.id}`,
    topic: c.categoria,
    title: c.nombre,
    keywords: [c.nombre, c.categoria, c.id, ...(c.keywords ?? [])].map((k) => normalizeText(k)),
    intention: c.queQuieroDecir,
    what: c.explicacion,
    why: `Porque necesitás expresar esta idea en JavaScript: ${c.traduccion.replace(/\n/g, " ")}`,
    how: [
      c.traduccion,
      `Analogía: ${c.analogia}`,
      `Error común a evitar: ${c.errorComun}`,
    ],
    solve: c.miniEjemplo || c.codigo,
    whyThatWay: c.respuesta ? `Comprobación: ${c.pregunta} → ${c.respuesta}` : c.explicacion,
    analogy: c.analogia,
    code: c.codigo,
    source: {
      kind: "diccionario",
      href: `/diccionario?card=${encodeURIComponent(c.id)}`,
      label: `Diccionario · ${c.nombre}`,
    },
  }));
}

function fromQuiz(): KnowledgeEntry[] {
  return questions.map((q, i) => ({
    id: `quiz-${i}`,
    topic: q.topic,
    title: q.q,
    keywords: tokenize(`${q.q} ${q.topic} ${q.choices.join(" ")} ${q.explain}`),
    intention: `Resolver esta pregunta: ${q.q}`,
    what: q.explain,
    why: "Está en el quiz del sitio para comprobar que entendiste el tema.",
    how: [
      `Opciones: ${q.choices.map((c, idx) => `${String.fromCharCode(65 + idx)}) ${c}`).join(" · ")}`,
      `Respuesta correcta: ${q.choices[q.answer]}`,
    ],
    solve: q.choices[q.answer],
    whyThatWay: q.explain,
    source: { kind: "quiz", href: "/quiz", label: `Quiz · ${q.topic}` },
  }));
}

function fromRules(): KnowledgeEntry[] {
  const tags: RuleTag[] = ["HTML", "CSS", "JS", "DOM", "TERMINAL", "LOGICA", "RED", "DNS", "HTTP", "FRONTEND"];
  const out: KnowledgeEntry[] = [];
  for (const tag of tags) {
    getRules(tag).forEach((rule, i) => {
      out.push({
        id: `rule-${tag}-${i}`,
        topic: tag,
        title: `Regla ${tag}: ${rule.slice(0, 60)}${rule.length > 60 ? "…" : ""}`,
        keywords: tokenize(`${tag} ${rule}`),
        intention: `Recordar una regla de ${tag}.`,
        what: rule,
        why: `Es una regla del material del sitio para el tema ${tag}.`,
        how: [rule],
        solve: rule,
        whyThatWay: "Estas reglas construyen el modelo mental (qué / por qué), no solo memorizar.",
        source: { kind: "regla", href: "/simulador#ejercicios", label: `Reglas · ${tag}` },
      });
    });
  }
  return out;
}

let CACHE: KnowledgeEntry[] | null = null;

export function getKnowledgeBase(): KnowledgeEntry[] {
  if (!CACHE) {
    CACHE = [...TEMAS_LECCION, ...fromDictionary(), ...fromQuiz(), ...fromRules()];
  }
  return CACHE;
}

function scoreEntry(tokens: string[], queryNorm: string, entry: KnowledgeEntry): number {
  const hay = normalizeText(
    [
      entry.title,
      entry.topic,
      entry.intention,
      entry.what,
      entry.why,
      entry.solve,
      entry.whyThatWay,
      entry.analogy ?? "",
      entry.code ?? "",
      entry.keywords.join(" "),
      entry.how.join(" "),
    ].join(" "),
  );

  let score = 0;
  if (queryNorm && hay.includes(queryNorm)) score += 40;

  for (const kw of entry.keywords) {
    const k = normalizeText(kw);
    if (!k) continue;
    if (queryNorm.includes(k) || tokens.includes(k)) score += 14;
    if (hay.includes(k) && tokens.some((t) => k.includes(t) || t.includes(k))) score += 4;
  }

  for (const t of tokens) {
    if (normalizeText(entry.title).includes(t)) score += 12;
    if (normalizeText(entry.topic) === t || normalizeText(entry.topic).includes(t)) score += 8;
    if (hay.includes(t)) score += 3;
  }

  // Prefer richer lesson/dictionary over tiny rule fragments when tied-ish
  if (entry.source.kind === "leccion") score += 2;
  if (entry.source.kind === "diccionario") score += 2;

  return score;
}

export type TeacherAnswer = {
  question: string;
  found: boolean;
  best: KnowledgeEntry | null;
  related: KnowledgeEntry[];
  /** Texto listo para mostrar como profesor */
  sections: {
    intention: string;
    what: string;
    why: string;
    how: string[];
    solve: string;
    whyThatWay: string;
    analogy?: string;
    code?: string;
  } | null;
  suggestions: string[];
  messageIfEmpty: string;
};

const SUGGESTIONS = [
  "¿Qué es el DNS?",
  "Diferencia entre let y const",
  "¿Qué significa el punto en el DOM?",
  "¿Cómo funciona if?",
  "¿Qué es RAG / contexto?",
  "¿Para qué sirve .env?",
  "Error DNS vs HTTP",
  "¿Qué es un array y length?",
  "propiedad vs método",
  "códigos HTTP 404 y 500",
];

export function askTeacher(rawQuestion: string): TeacherAnswer {
  const question = rawQuestion.trim();
  const queryNorm = normalizeText(question);
  const tokens = tokenize(question);

  if (!question || tokens.length === 0) {
    return {
      question,
      found: false,
      best: null,
      related: [],
      sections: null,
      suggestions: SUGGESTIONS,
      messageIfEmpty:
        "Escribí una pregunta con palabras del material (ej. DNS, let, DOM, HTTPS, array…). No uso inteligencia artificial: solo busco en lo que ya está en la página.",
    };
  }

  const scored = getKnowledgeBase()
    .map((entry) => ({ entry, score: scoreEntry(tokens, queryNorm, entry) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.score >= 8 ? scored[0].entry : null;
  const related = scored
    .slice(1, 4)
    .filter((x) => x.score >= 6)
    .map((x) => x.entry)
    .filter((e) => e.id !== best?.id);

  if (!best) {
    return {
      question,
      found: false,
      best: null,
      related: scored.slice(0, 3).map((x) => x.entry),
      sections: null,
      suggestions: SUGGESTIONS,
      messageIfEmpty:
        "No encontré esa pregunta en el material de esta página. Probá con otras palabras o mirá las sugerencias. (Esto no inventa respuestas: solo usa lecciones, diccionario, quiz y reglas del sitio.)",
    };
  }

  return {
    question,
    found: true,
    best,
    related,
    sections: {
      intention: best.intention,
      what: best.what,
      why: best.why,
      how: best.how,
      solve: best.solve,
      whyThatWay: best.whyThatWay,
      analogy: best.analogy,
      code: best.code,
    },
    suggestions: SUGGESTIONS,
    messageIfEmpty: "",
  };
}

export function getTeacherSuggestions() {
  return SUGGESTIONS;
}
