export type Question = {
  q: string;
  choices: string[];
  answer: number;
  explain: string;
  topic: string;
};

export const questions: Question[] = [
  {
    q: "¿Qué significa la sigla DNS?",
    choices: ["Dynamic Network System", "Domain Name System", "Data Network Service", "Digital Name Server"],
    answer: 1,
    explain: "DNS = Domain Name System. Traduce nombres de dominio en direcciones IP.",
    topic: "DNS",
  },
  {
    q: "Escribes un dominio que no existe. ¿Qué tipo de error verás?",
    choices: ["Error HTTP 404", "Error DNS (ERR_NAME_NOT_RESOLVED)", "Error 500", "Error 403"],
    answer: 1,
    explain: "Si el dominio no existe, el DNS falla — la petición ni siquiera llega al servidor. Los errores HTTP requieren que el servidor haya respondido.",
    topic: "DNS",
  },
  {
    q: "¿Qué código HTTP significa 'todo bien, éxito'?",
    choices: ["100", "200", "301", "204"],
    answer: 1,
    explain: "200 OK indica éxito completo. La página cargó correctamente.",
    topic: "HTTP",
  },
  {
    q: "El servidor responde con 500. ¿Qué significa?",
    choices: ["El recurso no existe", "No tienes permisos", "Error interno del servidor", "El servidor está saturado"],
    answer: 2,
    explain: "500 = Internal Server Error. El código o la base de datos del servidor falló.",
    topic: "HTTP",
  },
  {
    q: "¿Cuál es el resultado de: (5 > 2) && !(2 == 4)?",
    choices: ["falso", "verdadero", "error", "5"],
    answer: 1,
    explain: "5 > 2 = verdadero. (2 == 4) = falso, y !(falso) = verdadero. verdadero && verdadero = verdadero.",
    topic: "Operadores",
  },
  {
    q: "El operador || (OR) devuelve verdadero cuando…",
    choices: ["ambos lados son verdaderos", "al menos uno es verdadero", "ambos son falsos", "el primero es falso"],
    answer: 1,
    explain: "OR solo es falso si ambos lados son falsos. Con un solo lado verdadero, ya devuelve verdadero.",
    topic: "Operadores",
  },
  {
    q: "En la analogía del helado, si mamá dice 'helado SI limpias Y haces tarea', ¿cuándo hay helado?",
    choices: ["Cuando limpias solamente", "Cuando haces tarea solamente", "Solo cuando haces ambas cosas", "Cuando no haces nada"],
    answer: 2,
    explain: "AND (&&) requiere que las dos condiciones se cumplan. Si te falta una, no hay helado.",
    topic: "Operadores",
  },
  {
    q: "¿Qué comando en Mac/Linux lista los archivos de una carpeta?",
    choices: ["dir", "ls", "list", "show"],
    answer: 1,
    explain: "En Mac/Linux se usa 'ls' (list). En Windows CMD es 'dir'.",
    topic: "Terminal",
  },
  {
    q: "Quieres eliminar una carpeta con todo su contenido en Linux. ¿Qué comando usas?",
    choices: ["rmdir carpeta", "rm carpeta", "rm -rf carpeta", "del /s carpeta"],
    answer: 2,
    explain: "'rm -rf carpeta' elimina la carpeta y todo lo que hay adentro recursivamente. Cuidado: no hay papelera.",
    topic: "Terminal",
  },
  {
    q: "¿Qué es HTML?",
    choices: ["Un lenguaje de programación", "Un lenguaje de marcado", "Un framework de JavaScript", "Una hoja de estilos"],
    answer: 1,
    explain: "HTML = HyperText Markup Language. Es un lenguaje de MARCADO — le pone etiquetas al contenido, no ejecuta lógica.",
    topic: "HTML",
  },
  {
    q: "¿Dónde debe ir todo el contenido visible de una página HTML?",
    choices: ["Dentro de <head>", "Dentro de <body>", "Dentro de <script>", "En cualquier parte"],
    answer: 1,
    explain: "Todo el contenido visible va dentro de <body>. Si lo pones fuera, el flujo del código se rompe.",
    topic: "HTML",
  },
  {
    q: "¿Cuál es la afirmación correcta sobre el DOM?",
    choices: [
      "Es el que dibuja la página en pantalla",
      "Es un árbol de objetos en memoria que permite a JS modificar la página",
      "Es un lenguaje de estilos",
      "Es un tipo de servidor web",
    ],
    answer: 1,
    explain: "El DOM (Document Object Model) es la traducción del HTML a un árbol de objetos. Permite que JavaScript lea y modifique la página en tiempo real. El que dibuja en pantalla es el motor de renderizado.",
    topic: "Frontend",
  },
];
