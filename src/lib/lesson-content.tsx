import type { ReactNode } from "react";
import { Section, Callout, CodeBlock, Sig } from "@/components/lesson-ui";
import BoolPlayground from "@/components/BoolPlayground";

export type LessonSlug = "dns" | "operadores" | "fundamentos" | "terminal" | "html" | "frontend";

type Lesson = { title: string; tagline: string; description: string; body: () => ReactNode };

/* ============ 01 · DNS ============ */
const dns: Lesson = {
  title: "DNS y cómo viaja una URL",
  tagline: "El DNS es como la guía telefónica de internet — traduce nombres bonitos en direcciones que las máquinas entienden.",
  description: "Qué es el DNS, comandos ping y nslookup, errores comunes, y cómo se diferencian de los códigos HTTP.",
  body: () => (
    <>
      <Section kicker="1 · La idea" title={<>La guía telefónica de <em>internet.</em></>}>
        <p>
          Cuando escribes <span className="mono">google.com</span>, tu computadora no
          sabe dónde está esa página. Le pregunta al <Sig>DNS</Sig> (Domain Name System),
          que le responde con la <em>dirección IP</em> del servidor, algo como{" "}
          <span className="mono">142.250.185.78</span>.
        </p>
        <Callout label="Imagínalo así">
          Tú buscas <em>“Pizzería de Ana”</em> en la guía telefónica. La guía te da el número.
          El DNS hace lo mismo: tú das un nombre, él te da un número (la IP).
        </Callout>
      </Section>

      <Section kicker="2 · Comandos" title="Dos herramientas para revisar el DNS">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-2xl mb-3" style={{ color: "var(--signal)" }}>nslookup</div>
            <p className="text-sm mb-3">Le pregunta al DNS: <em>¿cuál es la IP de este dominio?</em></p>
            <div className="mono text-xs opacity-70">→ Dirección: 142.250.185.78</div>
          </div>
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-2xl mb-3" style={{ color: "var(--signal)" }}>ping</div>
            <p className="text-sm mb-3">Resuelve el dominio <em>y</em> comprueba si el servidor contesta.</p>
            <div className="mono text-xs opacity-70">→ Respuesta desde 142.250.185.78</div>
          </div>
        </div>
        <Callout tone="ok" label="¿Y si ambos muestran la misma IP?">
          Significa que el DNS está limpio: encontraste la dirección correcta,
          sin datos viejos en caché. Si hay problemas, no son del DNS — son de conexión o del servidor.
        </Callout>
      </Section>

      <Section kicker="3 · Cuando el DNS falla" title={<>Cuando la casa <em>no está</em> en el mapa.</>}>
        <p>El navegador no pudo encontrar la dirección. La petición <em>no llega</em> al servidor.</p>
        <div className="grid gap-2 my-4">
          {["DNS_PROBE_FINISHED_NXDOMAIN", "ERR_NAME_NOT_RESOLVED", "No se puede encontrar la dirección del servidor"].map((e) => (
            <div key={e} className="mono text-sm rounded-xl hair-a px-4 py-3" style={{ background: "oklch(0.18 0.014 55)" }}>
              <span style={{ color: "var(--signal)" }}>× </span>{e}
            </div>
          ))}
        </div>
        <p><strong>Causas comunes:</strong> dominio mal escrito, dominio expirado, servidor DNS caído, o bloqueo/censura en la red.</p>
      </Section>

      <Section kicker="4 · La distinción clave" title={<>Error <em>DNS</em> vs. Error <em>HTTP.</em></>}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.16 0.012 55)" }}>
            <div className="text-3xl mb-3">DNS</div>
            <p className="text-sm mb-3"><strong>No llega ×</strong> — el dominio no se encontró.</p>
            <p className="italic text-sm">"No encontré la dirección de la casa."</p>
            <div className="mono text-xs mt-3 opacity-70">ERR_NAME_NOT_RESOLVED</div>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "var(--signal)", color: "var(--ink)" }}>
            <div className="text-3xl mb-3">HTTP</div>
            <p className="text-sm mb-3"><strong>Sí llega ✓</strong> — pero el servidor devuelve error.</p>
            <p className="italic text-sm">"Llegué a la casa, pero no me dejaron entrar."</p>
            <div className="mono text-xs mt-3 opacity-80">404 · 500 · 403 · 502 · 503</div>
          </div>
        </div>
      </Section>

      <Section kicker="5 · Los códigos" title="Códigos HTTP más comunes">
        <div className="grid md:grid-cols-2 gap-3">
          {[
            ["200", "OK", "Todo bien. La página carga."],
            ["404", "Not Found", "El recurso no existe."],
            ["403", "Forbidden", "No tienes permiso."],
            ["500", "Server Error", "El servidor falló."],
            ["502", "Bad Gateway", "Otro servidor intermedio dio problema."],
            ["503", "Unavailable", "Servidor saturado o en mantenimiento."],
          ].map(([c, n, d]) => (
            <div key={c} className="rounded-xl hair-a p-4 flex items-baseline gap-4" style={{ background: "oklch(0.18 0.014 55)" }}>
              <span className="mono text-3xl" style={{ color: "var(--signal)" }}>{c}</span>
              <div>
                <div className="mono text-xs uppercase tracking-widest opacity-70">{n}</div>
                <div className="text-sm">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="6 · El viaje completo" title={<>De la URL al <em>pixel.</em></>}>
        <ol className="space-y-4">
          {[
            "Escribes www.ejemplo.com en el navegador.",
            "El DNS busca. ¿Existe el dominio? Si no → Error DNS y la navegación se detiene.",
            "Si sí, obtienes la IP y contactas el servidor.",
            "El servidor responde. Si falla → código HTTP (404, 500…). Si funciona → envía HTML, CSS, JS.",
            "El navegador procesa todo y lo dibuja en la pantalla (renderizado).",
          ].map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="mono text-sm shrink-0 w-8 h-8 rounded-full hair-a grid place-items-center" style={{ color: "var(--signal)" }}>{i+1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Section>
    </>
  ),
};

/* ============ 02 · OPERADORES ============ */
const operadores: Lesson = {
  title: "Operadores lógicos y tabla de verdad",
  tagline: "AND, OR y NOT deciden qué pasa en tu programa. Piénsalos como reglas de mamá y papá para comer helado.",
  description: "Tablas de verdad, ejemplos con helado, referencia de operadores y un evaluador interactivo de expresiones booleanas.",
  body: () => (
    <>
      <Section kicker="1 · Los tres" title="Tres símbolos que deciden todo">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-4xl mb-2" style={{ color: "var(--signal)" }}>&amp;&amp;</div>
            <div className="italic text-lg mb-2">AND — "Y"</div>
            <p className="text-sm">Los <strong>dos</strong> lados deben ser verdaderos.</p>
          </div>
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-4xl mb-2" style={{ color: "var(--signal)" }}>||</div>
            <div className="italic text-lg mb-2">OR — "O"</div>
            <p className="text-sm">Al menos <strong>uno</strong> debe ser verdadero.</p>
          </div>
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-4xl mb-2" style={{ color: "var(--signal)" }}>!</div>
            <div className="italic text-lg mb-2">NOT — "NO"</div>
            <p className="text-sm">Invierte el valor: verdadero ↔ falso.</p>
          </div>
        </div>
      </Section>

      <Section kicker="2 · Tabla de verdad" title="Todos los casos posibles">
        <div className="grid md:grid-cols-2 gap-6 mt-2">
          {[
            { op: "&&", note: "Solo verdadero si A y B son verdaderos" , rows: [["F","F","F"],["F","V","F"],["V","F","F"],["V","V","V"]]},
            { op: "||", note: "Solo falso si A y B son falsos",           rows: [["F","F","F"],["F","V","V"],["V","F","V"],["V","V","V"]]},
          ].map((t) => (
            <div key={t.op} className="rounded-2xl hair-a overflow-hidden" style={{ background: "oklch(0.18 0.014 55)" }}>
              <div className="p-5 hair-b">
                <div className="mono text-2xl" style={{ color: "var(--signal)" }}>{t.op}</div>
                <div className="text-sm opacity-70 mt-1">{t.note}</div>
              </div>
              <table className="w-full mono text-sm">
                <thead>
                  <tr className="hair-b opacity-60">
                    <th className="text-left px-5 py-2">A</th>
                    <th className="text-left px-5 py-2">B</th>
                    <th className="text-left px-5 py-2">→</th>
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r, i) => (
                    <tr key={i} className="hair-b last:border-b-0">
                      <td className="px-5 py-2">{r[0] === "V" ? "😊 V" : "😞 F"}</td>
                      <td className="px-5 py-2">{r[1] === "V" ? "😊 V" : "😞 F"}</td>
                      <td className="px-5 py-2" style={{ color: r[2] === "V" ? "var(--mint)" : "var(--signal)" }}>
                        {r[2] === "V" ? "✓ SÍ" : "✗ NO"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="3 · El ejemplo del helado" title={<>🍦 Regla de <em>mamá</em> vs. regla de <em>papá</em></>}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--signal)" }}>Mamá — AND</div>
            <p className="italic mb-4">"Puedes helado SI limpias tu cuarto Y haces tu tarea."</p>
            <p className="text-sm">Solo hay helado cuando <strong>las dos</strong> cosas están hechas. Si te falta una, no hay helado.</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "var(--signal)", color: "var(--ink)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-2">Papá — OR</div>
            <p className="italic mb-4">"Puedes helado SI limpias tu cuarto O haces tu tarea."</p>
            <p className="text-sm">Con <strong>una sola</strong> de las dos, ya te ganaste el helado.</p>
          </div>
        </div>
      </Section>

      <Section kicker="4 · Orden de evaluación" title="¿En qué orden se resuelve?">
        <ol className="space-y-2 list-decimal pl-6">
          <li>Los <strong>paréntesis ( )</strong> primero.</li>
          <li>El <strong>NOT (!)</strong> después.</li>
          <li>Las <strong>comparaciones</strong> (<span className="mono">&gt; &lt; &gt;= &lt;= == !=</span>).</li>
          <li>El <strong>AND (&amp;&amp;)</strong> antes que el <strong>OR (||)</strong>, salvo que los paréntesis manden.</li>
        </ol>
        <Callout label="Ejemplo desglosado">
          <div className="mono text-sm mb-2">4 &gt; 2 &amp;&amp; (2==0 || 0&gt;-1)</div>
          <ul className="text-sm space-y-1">
            <li>• <span className="mono">0 &gt; -1</span> = <span style={{color:"var(--mint)"}}>verdadero</span></li>
            <li>• <span className="mono">falso || verdadero</span> = <span style={{color:"var(--mint)"}}>verdadero</span></li>
            <li>• <span className="mono">4 &gt; 2</span> = <span style={{color:"var(--mint)"}}>verdadero</span></li>
            <li>• <span className="mono">verdadero &amp;&amp; verdadero</span> = <strong style={{color:"var(--mint)"}}>verdadero</strong></li>
          </ul>
        </Callout>
      </Section>

      <Section kicker="5 · Práctica" title="Evalúa tus propias expresiones">
        <p>Escribe cualquier combinación de números y operadores. El resultado se calcula al instante.</p>
        <BoolPlayground />
      </Section>
    </>
  ),
};

/* ============ 03 · FUNDAMENTOS ============ */
const fundamentos: Lesson = {
  title: "Fundamentos de programación",
  tagline: "Programar es darle instrucciones a la computadora paso a paso. Cinco piezas — variables, operadores, condicionales, bucles y funciones — bastan para casi todo.",
  description: "Variables, operadores aritméticos y de comparación, condicionales if/else, bucles for/while y funciones — con ejemplos en JavaScript.",
  body: () => (
    <>
      <Section kicker="1 · Idea base" title={<>Programar es dar <em>instrucciones.</em></>}>
        <p>La computadora hace <strong>exactamente</strong> lo que le dices — ni más, ni menos. Como un robot muy obediente y muy tonto.</p>
        <Callout label="Los 5 pilares">
          Variables · Operadores · Condicionales · Bucles · Funciones. Con estos cinco, ya puedes construir cualquier programa.
        </Callout>
      </Section>

      <Section kicker="2 · Variables" title="📦 Las cajas donde guardas datos">
        <p>Una variable es una caja con etiqueta. Guardas algo adentro y le pones un nombre para poder buscarlo después.</p>
        <CodeBlock>{`let edad = 10;              // número
let nombre = "Ana";         // texto (string)
let tieneMascota = true;    // booleano (verdadero/falso)
let frutas = ["🍎","🍐"];   // lista (array)`}</CodeBlock>
      </Section>

      <Section kicker="3 · Operadores" title="Las herramientas para calcular y comparar">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl hair-a p-5" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-3" style={{ color: "var(--signal)" }}>Aritméticos</div>
            <ul className="mono text-sm space-y-1">
              <li>+ suma</li><li>− resta</li><li>* multiplicación</li><li>/ división</li><li>% módulo (resto)</li>
            </ul>
          </div>
          <div className="rounded-2xl hair-a p-5" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-3" style={{ color: "var(--signal)" }}>Comparación</div>
            <ul className="mono text-sm space-y-1">
              <li>== ¿iguales?</li><li>!= ¿distintos?</li><li>&gt; &lt; mayor/menor</li><li>&gt;= &lt;= o iguales</li>
            </ul>
          </div>
          <div className="rounded-2xl hair-a p-5" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-3" style={{ color: "var(--signal)" }}>Lógicos</div>
            <ul className="mono text-sm space-y-1">
              <li>&amp;&amp; ambos</li><li>|| al menos uno</li><li>! invierte</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section kicker="4 · Condicionales" title="🤔 Tomar decisiones con if / else">
        <p>Si algo se cumple → haz esto. Si no → haz otra cosa.</p>
        <CodeBlock>{`let edad = 10;

if (edad >= 18) {
  console.log("Eres mayor de edad 🧑");
} else if (edad >= 13) {
  console.log("Eres adolescente 🧒");
} else {
  console.log("Eres niño 👶");
}
// → "Eres niño 👶"`}</CodeBlock>
      </Section>

      <Section kicker="5 · Bucles" title="🔄 Repetir acciones sin escribirlas 100 veces">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--signal)" }}>for — sabes cuántas veces</div>
            <CodeBlock>{`for (let i = 1; i <= 5; i++) {
  console.log(i);
}
// 1 2 3 4 5`}</CodeBlock>
          </div>
          <div>
            <div className="mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--signal)" }}>while — hasta que se cumpla</div>
            <CodeBlock>{`let n = 1;
while (n <= 5) {
  console.log(n);
  n++;
}`}</CodeBlock>
          </div>
        </div>
      </Section>

      <Section kicker="6 · Funciones" title="📝 Recetas que puedes reutilizar">
        <p>Escribes una función una vez y la usas todas las veces que quieras.</p>
        <CodeBlock>{`function saludar(nombre) {
  console.log("¡Hola " + nombre + "! 🎉");
}

saludar("Ana");     // ¡Hola Ana! 🎉
saludar("Carlos");  // ¡Hola Carlos! 🎉`}</CodeBlock>
      </Section>

      <Section kicker="7 · Todo junto" title="🎢 Ejemplo: subir a la montaña rusa">
        <CodeBlock>{`let edad = 10;
let altura = 130;
let tieneBoleta = true;

function puedeSubir(edad, altura, boleta) {
  if (edad >= 12 && altura >= 120 && boleta) {
    return "¡Puede subir! 🎢";
  }
  return "No puede subir ❌";
}

console.log(puedeSubir(edad, altura, tieneBoleta));
// → "No puede subir ❌"`}</CodeBlock>
        <Callout tone="ok" label="Fíjate">
          Aquí ves los 5 pilares trabajando juntos: variables, operadores lógicos (&amp;&amp;),
          un condicional (if), y una función que puedes reutilizar.
        </Callout>
      </Section>
    </>
  ),
};

/* ============ 04 · TERMINAL ============ */
const terminal: Lesson = {
  title: "Comandos de la terminal",
  tagline: "Windows, Mac y Linux hablan idiomas parecidos. Estas son las palabras esenciales para moverte por carpetas y archivos.",
  description: "Tabla comparativa de comandos para Windows CMD, PowerShell y Mac/Linux, con atajos de teclado y ejemplos prácticos.",
  body: () => (
    <>
      <Section kicker="1 · Idea base" title="Tres sistemas, casi los mismos comandos">
        <p>
          Cambiar de carpeta, ver qué hay dentro, crear archivos, borrar cosas — todo se hace escribiendo.
          Las palabras cambian un poco entre Windows y Mac/Linux, pero el <em>concepto</em> es el mismo.
        </p>
        <Callout label="Truco mnemotécnico">
          <span className="mono">cd</span> = Change Directory · <span className="mono">ls</span> = List ·{" "}
          <span className="mono">mkdir</span> = Make Directory · <span className="mono">rm</span> = Remove ·{" "}
          <span className="mono">cp</span> = Copy · <span className="mono">mv</span> = Move · <span className="mono">pwd</span> = Print Working Directory.
        </Callout>
      </Section>

      <Section kicker="2 · Tabla esencial" title="Los comandos que usarás todo el tiempo">
        <div className="overflow-x-auto rounded-2xl hair-a" style={{ background: "oklch(0.16 0.012 55)" }}>
          <table className="w-full mono text-sm">
            <thead className="hair-b">
              <tr className="opacity-70">
                <th className="text-left px-4 py-3">Acción</th>
                <th className="text-left px-4 py-3">Windows (CMD)</th>
                <th className="text-left px-4 py-3">PowerShell</th>
                <th className="text-left px-4 py-3">Mac / Linux</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Ver archivos",            "dir",                          "ls",                          "ls"],
                ["Entrar a carpeta",        "cd carpeta",                   "cd carpeta",                  "cd carpeta"],
                ["Subir un nivel",          "cd ..",                        "cd ..",                       "cd .."],
                ["Ruta actual",             "cd",                           "pwd",                         "pwd"],
                ["Crear carpeta",           "mkdir carpeta",                "mkdir carpeta",               "mkdir carpeta"],
                ["Crear archivo",           "type nul > archivo.txt",       "New-Item archivo.txt",        "touch archivo.txt"],
                ["Eliminar archivo",        "del archivo.txt",              "Remove-Item archivo.txt",     "rm archivo.txt"],
                ["Eliminar carpeta+todo",   "rmdir /s carpeta",             "Remove-Item -Recurse carpeta","rm -rf carpeta"],
                ["Copiar",                  "copy origen destino",          "Copy-Item origen destino",    "cp origen destino"],
                ["Mover / renombrar",       "move origen destino",          "Move-Item origen destino",    "mv origen destino"],
                ["Limpiar pantalla",        "cls",                          "clear",                       "clear"],
                ["Ver IP",                  "ipconfig",                     "Get-NetIPAddress",            "ifconfig · ip addr"],
                ["Hacer ping",              "ping google.com",              "ping google.com",             "ping google.com"],
                ["Ayuda",                   "comando /?",                   "Get-Help comando",            "man comando"],
              ].map((r, i) => (
                <tr key={i} className="hair-b last:border-b-0">
                  <td className="px-4 py-2.5 text-[13px]" style={{ fontFamily: "var(--font-sans)", color: "oklch(0.85 0.02 70)" }}>{r[0]}</td>
                  <td className="px-4 py-2.5" style={{ color: "var(--signal)" }}>{r[1]}</td>
                  <td className="px-4 py-2.5">{r[2]}</td>
                  <td className="px-4 py-2.5">{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="3 · Atajos" title="Teclas que ahorran vida">
        <div className="grid md:grid-cols-2 gap-3">
          {[
            ["↑ / ↓", "Ir por el historial de comandos."],
            ["Tab", "Autocompletar nombre de archivo o carpeta."],
            ["Ctrl + C", "Cancelar el comando actual."],
            ["Ctrl + L / cls", "Limpiar la pantalla."],
            ["Ctrl + R", "Buscar comandos en el historial."],
          ].map(([k, d]) => (
            <div key={k} className="rounded-xl hair-a px-5 py-3 flex items-center gap-4" style={{ background: "oklch(0.18 0.014 55)" }}>
              <kbd className="mono text-xs px-2.5 py-1 rounded hair-a">{k}</kbd>
              <span className="text-sm">{d}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="4 · Diferencias" title="Windows vs. Mac/Linux — lo que cambia">
        <ul className="space-y-2">
          <li>• Windows usa <span className="mono">\</span> en las rutas · Mac/Linux usa <span className="mono">/</span></li>
          <li>• Windows <strong>no</strong> distingue mayúsculas · Mac/Linux <strong>sí</strong> distingue (<span className="mono">Foto.jpg</span> ≠ <span className="mono">foto.jpg</span>)</li>
          <li>• Superusuario: en Windows abres CMD "como administrador"; en Mac/Linux antepones <span className="mono">sudo</span></li>
        </ul>
      </Section>
    </>
  ),
};

/* ============ 05 · HTML ============ */
const html: Lesson = {
  title: "HTML — el esqueleto de la web",
  tagline: "HTML no es programación, es un lenguaje de marcado. Le dice al navegador qué es cada pedazo de contenido.",
  description: "Etiquetas, atributos, elementos, listas ul/ol/li, y por qué todo el contenido debe ir dentro de body.",
  body: () => (
    <>
      <Section kicker="1 · Qué es" title={<>HyperText <em>Markup</em> Language</>}>
        <p>
          HTML es el lenguaje que usan <strong>todas</strong> las páginas web para organizar su contenido.
          No es programación — es <em>marcado</em>: le pone etiquetas al contenido para que el navegador sepa qué es cada cosa.
        </p>
        <Callout label="Recuerda">
          Las etiquetas se escriben con las <em>boquitas</em> <span className="mono">&lt; &gt;</span>. Cada bloque
          de la página es una etiqueta con contenido adentro.
        </Callout>
      </Section>

      <Section kicker="2 · Tipos de etiquetas" title="Contenedoras vs. no contenedoras">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--signal)" }}>Contenedoras</div>
            <p className="text-sm mb-3">Pueden tener otras etiquetas y varios tipos de contenido adentro.</p>
            <CodeBlock>{`<div>
  <h1>Título</h1>
  <p>Texto y una <img src="..."></p>
</div>`}</CodeBlock>
          </div>
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--signal)" }}>No contenedoras</div>
            <p className="text-sm mb-3">Solo tienen información. No abrazan otras etiquetas.</p>
            <CodeBlock>{`<img src="foto.jpg" alt="...">
<br>
<hr>`}</CodeBlock>
          </div>
        </div>
      </Section>

      <Section kicker="3 · Anatomía" title="Las partes de un elemento HTML">
        <div className="overflow-x-auto rounded-2xl hair-a" style={{ background: "oklch(0.16 0.012 55)" }}>
          <table className="w-full text-sm">
            <thead className="hair-b opacity-70">
              <tr>
                <th className="text-left px-4 py-3">Parte</th>
                <th className="text-left px-4 py-3 mono">Ejemplo</th>
                <th className="text-left px-4 py-3">Metáfora</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Etiqueta de apertura", "<p>",           "Abres una caja."],
                ["Atributo",             "class=\"texto\"", "Instrucciones pegadas fuera de la caja."],
                ["Contenido",            "Hola mundo",     "El regalo — lo único que el usuario ve."],
                ["Etiqueta de cierre",   "</p>",          "Cierras y sellas la caja (con la /)."],
                ["Elemento completo",    "<p>Hola mundo</p>", "El paquete listo para renderizar."],
              ].map((r, i) => (
                <tr key={i} className="hair-b last:border-b-0">
                  <td className="px-4 py-2.5">{r[0]}</td>
                  <td className="px-4 py-2.5 mono" style={{ color: "var(--signal)" }}>{r[1]}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="4 · Vocabulario" title="Palabras que debes conocer">
        <ul className="space-y-2">
          <li><strong>Elemento:</strong> etiqueta + contenido.</li>
          <li><strong>Atributo:</strong> info extra que va dentro de la etiqueta de apertura.</li>
          <li><strong>Documento HTML:</strong> el archivo completo. Para verse en pantalla lo procesa el <Sig>DOM</Sig> (que conecta el navegador con el archivo).</li>
          <li><strong>Contenido:</strong> texto, imagen o dato que va dentro de la etiqueta.</li>
          <li><strong>Usuario:</strong> la persona que ve la página ya renderizada.</li>
        </ul>
      </Section>

      <Section kicker="5 · Títulos y listas" title="h1 · h2 · h3 · ul · ol · li">
        <p>Los <span className="mono">h1</span> son títulos grandes y bajan en importancia hasta <span className="mono">h6</span>.</p>
        <CodeBlock>{`<h1>Título principal</h1>
<h2>Subtítulo</h2>

<!-- Lista con viñetas -->
<ul>
  <li>papa</li>
  <li>papaya</li>
  <li>uva</li>
</ul>

<!-- Lista numerada -->
<ol>
  <li>Primero</li>
  <li>Segundo</li>
</ol>`}</CodeBlock>
        <Callout label="Regla clave">
          <span className="mono">&lt;li&gt;</span> siempre va dentro de <span className="mono">&lt;ul&gt;</span> o{" "}
          <span className="mono">&lt;ol&gt;</span>. Nunca suelto.
        </Callout>
      </Section>

      <Section kicker="6 · Regla de oro" title={<>Todo va dentro de <span className="mono">&lt;body&gt;</span></>}>
        <p>
          Si pones contenido HTML <em>fuera</em> de <span className="mono">body</span>, el flujo del código se rompe.
          Debajo de <span className="mono">body</span> es donde va la etiqueta <span className="mono">&lt;script&gt;</span> con JavaScript
          para dar interactividad.
        </p>
        <CodeBlock>{`<!DOCTYPE html>
<html>
  <head>
    <title>Mi página</title>
  </head>
  <body>
    <h1>Hola</h1>
    <p>Todo esto SÍ se ve.</p>

    <script src="app.js"></script>
  </body>
</html>`}</CodeBlock>
      </Section>
    </>
  ),
};

/* ============ 06 · FRONTEND ============ */
const frontend: Lesson = {
  title: "Frontend, DOM y renderizado",
  tagline: "La trinidad HTML · CSS · JS trabaja junta. El DOM es el puente que le permite a JavaScript modificar la página en tiempo real.",
  description: "Qué hace cada uno de HTML, CSS y JavaScript. Definición correcta de DOM y frontend, con las precisiones más comunes.",
  body: () => (
    <>
      <Section kicker="1 · La trinidad" title="HTML · CSS · JavaScript">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            ["HTML",       "El esqueleto",  "Estructura y organiza el contenido. Es marcado, no programación."],
            ["CSS",        "La ropa",       "Colores, tipografías, márgenes, diseño visual."],
            ["JavaScript", "El cerebro",    "Lógica, interactividad, animaciones, peticiones de datos."],
          ].map(([k, r, d]) => (
            <div key={k} className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
              <div className="mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--signal)" }}>{k}</div>
              <div className="italic text-lg mb-2">{r}</div>
              <p className="text-sm">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="2 · Renderizado" title="Qué significa que el navegador ‘renderice’">
        <p>
          Renderizar es el proceso <em>físico</em> por el cual el navegador toma tu HTML, tu CSS y tu JS y los dibuja
          pixel a pixel en la pantalla del usuario.
        </p>
      </Section>

      <Section kicker="3 · Precisión importante" title={<>Qué es (y qué NO es) el <em>DOM.</em></>}>
        <Callout tone="warn" label="Ajuste conceptual">
          El DOM <strong>no</strong> es el que estructura el código para hacerlo visible. Eso lo hace el motor de renderizado del navegador.
        </Callout>
        <p>
          El <Sig>DOM</Sig> (Document Object Model) es un <em>traductor</em> o <em>mapa interno</em>. Cuando el navegador lee tu HTML plano,
          lo convierte en un <strong>árbol de objetos</strong> en memoria. Ese árbol es lo que le permite a JavaScript leer,
          modificar, agregar o borrar elementos de la página <em>en tiempo real</em> mientras el usuario interactúa.
        </p>
        <CodeBlock>{`// Gracias al DOM, JS puede tocar la página:
document.querySelector("h1").textContent = "¡Hola!";
document.body.style.background = "black";`}</CodeBlock>
      </Section>

      <Section kicker="4 · Segunda precisión" title={<>Qué es (y qué NO es) el <em>frontend.</em></>}>
        <Callout tone="warn" label="Ajuste conceptual">
          Frontend <strong>no</strong> es solo el código ya terminado, empaquetado y publicado en internet.
        </Callout>
        <p>
          Frontend es <strong>todo lo que ocurre del lado del cliente</strong> — la computadora o celular de la persona
          que navega. Diseño, maquetación y lógica con la que el usuario interactúa directamente. Sigue siendo frontend
          aunque lo estés programando en tu computadora sin haberlo subido a la nube.
        </p>
      </Section>

      <Section kicker="5 · Resumen" title="Cómo todo encaja">
        <ol className="space-y-3">
          <li><strong>1.</strong> El servidor te manda HTML, CSS y JS.</li>
          <li><strong>2.</strong> El navegador convierte el HTML en el <em>árbol DOM</em>.</li>
          <li><strong>3.</strong> Aplica el CSS (colores, tamaños, posiciones).</li>
          <li><strong>4.</strong> Ejecuta el JavaScript, que puede tocar el DOM y cambiar cosas.</li>
          <li><strong>5.</strong> Renderiza todo en pantalla, y sigue reaccionando a lo que hace el usuario.</li>
        </ol>
      </Section>
    </>
  ),
};

export const lessons: Record<LessonSlug, Lesson> = {
  dns, operadores, fundamentos, terminal, html, frontend,
};
