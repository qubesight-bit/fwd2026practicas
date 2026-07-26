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
  {
    q: "¿Qué imprime `console.log(typeof 10);` en JavaScript?",
    choices: ["'Number'", "'number'", "'int'", "10"],
    answer: 1,
    explain: "typeof siempre devuelve el nombre del tipo como string en MINÚSCULAS: 'number', 'string', 'boolean'…",
    topic: "JS",
  },
  {
    q: "`const precio = 100; precio = 120;` ¿Qué pasa?",
    choices: ["precio vale 120", "precio vale 100", "Lanza TypeError: no se puede reasignar const", "Lanza SyntaxError"],
    answer: 2,
    explain: "const pone un candado permanente. Para valores que van a cambiar, usa let.",
    topic: "JS",
  },
  {
    q: "`'3' * 10` en JavaScript da…",
    choices: ["'310' (texto)", "30 (número)", "NaN", "Error"],
    answer: 1,
    explain: "Con * / - JS convierte automáticamente el string a número. Con + concatenaría: '3' + 10 = '310'.",
    topic: "JS",
  },
  {
    q: "En `let frutas = ['manzana','pera','uva']`, ¿qué devuelve `frutas[1]`?",
    choices: ["'manzana'", "'pera'", "'uva'", "undefined"],
    answer: 1,
    explain: "Los índices arrancan en 0: [0]='manzana', [1]='pera', [2]='uva'.",
    topic: "JS",
  },
  {
    q: "¿Cuál es la diferencia entre `.length` y `.push()` en un array?",
    choices: [
      "Ninguna, son sinónimos",
      ".length es propiedad (sin paréntesis) y .push() es método (con paréntesis)",
      ".length modifica y .push() lee",
      "Ambos son métodos",
    ],
    answer: 1,
    explain: ".length es una PROPIEDAD → arr.length. .push() es un MÉTODO → arr.push(x). Los métodos siempre llevan ().",
    topic: "JS",
  },
  {
    q: "En `let libro = { titulo: 'El Principito', paginas: 96 }`, ¿cómo lees el título?",
    choices: ["libro[titulo]", "libro.titulo", "libro->titulo", "libro('titulo')"],
    answer: 1,
    explain: "En objetos se usa notación de punto: objeto.propiedad. Los corchetes con número son para arrays.",
    topic: "JS",
  },
  {
    q: "`let arr = [10, 20, 30]; arr.push(40);` ¿Cuánto vale `arr.length` ahora?",
    choices: ["3", "4", "40", "undefined"],
    answer: 1,
    explain: ".push() añade un elemento al final del array. Empezó con 3, ahora hay 4.",
    topic: "JS",
  },
  {
    q: "¿Qué imprime `console.log('3' - 1);`?",
    choices: ["'2' (texto)", "2 (número)", "'31' (texto)", "NaN"],
    answer: 1,
    explain: "Con el operador - JS convierte el texto '3' a número y resta: 3 - 1 = 2.",
    topic: "JS",
  },
  {
    q: "¿Cuál es la diferencia entre una propiedad y un método?",
    choices: [
      "Ninguna, se escriben igual",
      "La propiedad se escribe sin () y el método con ()",
      "El método se escribe sin () y la propiedad con ()",
      "Solo cambia el color en el editor",
    ],
    answer: 1,
    explain: "Propiedad = dato ya calculado (arr.length). Método = acción que se ejecuta (arr.push()). Los métodos SIEMPRE llevan paréntesis.",
    topic: "JS",
  },
  {
    q: "En Mac/Linux, ¿qué comando muestra la ruta de la carpeta actual?",
    choices: ["cd", "ls", "pwd", "dir"],
    answer: 2,
    explain: "pwd = Print Working Directory. Te dice dónde estás parado dentro del sistema de archivos.",
    topic: "Terminal",
  },
];
