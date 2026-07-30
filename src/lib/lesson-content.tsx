import type { ReactNode } from "react";
import { Section, Callout, CodeBlock, Sig, LearnBlock, TranslateBlock, SolveBlock, IntentBlock, FormulaBlock } from "@/components/lesson-ui";
import BoolPlayground from "@/components/BoolPlayground";
import { contexto } from "@/lib/lessons/contexto";

export type LessonSlug =
  | "dns"
  | "operadores"
  | "fundamentos"
  | "js"
  | "terminal"
  | "html"
  | "frontend"
  | "dom"
  | "contexto";

type Lesson = { title: string; tagline: string; description: string; body: () => ReactNode };

/* ============ 01 · DNS ============ */
const dns: Lesson = {
  title: "DNS y cómo viaja una URL",
  tagline: "El DNS es como la guía telefónica de internet — traduce nombres bonitos en direcciones que las máquinas entienden.",
  description: "Qué es el DNS, comandos ping y nslookup, errores comunes, y cómo se diferencian de los códigos HTTP.",
  body: () => (
    <>
      <Section kicker="1 · La idea" title={<>La guía telefónica de <em>internet.</em></>}>
        <LearnBlock
          what={<>El <Sig>DNS</Sig> (Domain Name System) es el sistema que traduce un nombre bonito como <span className="mono">google.com</span> a una dirección IP que las máquinas sí entienden, como <span className="mono">142.250.185.78</span>.</>}
          why="Tu computadora no sabe dónde está una página solo con el nombre. Necesita un número (la IP) para llegar. El DNS existe para que tú memorices nombres fáciles y las máquinas usen números."
          how={[
            "Escribes un dominio en el navegador.",
            "Tu computadora pregunta al DNS: «¿cuál es la IP de este nombre?»",
            "El DNS responde con la IP.",
            "Con esa IP, el navegador contacta al servidor.",
          ]}
          example={<>Escribes <span className="mono">google.com</span> → el DNS te da algo como <span className="mono">142.250.185.78</span>.</>}
          analogy="Es como la guía telefónica: buscas «Pizzería de Ana» y te dan el número. Tú das el nombre; el DNS te da el número (la IP)."
        />
      </Section>

      <Section kicker="2 · Comandos" title="Dos herramientas para revisar el DNS">
        <LearnBlock
          what={<>Dos comandos para «preguntarle» al DNS: <span className="mono">nslookup</span> y <span className="mono">ping</span>.</>}
          why="Cuando una web no carga, necesitas saber si el problema es «no encontré la dirección» (DNS) o «sí llegué pero el servidor falló» (HTTP). Estos comandos te ayudan a mirar eso."
          how={[
            "nslookup solo pregunta: ¿cuál es la IP de este dominio?",
            "ping resuelve el dominio Y además comprueba si el servidor contesta.",
            "Si ambos dan la misma IP, el DNS está limpio (sin datos viejos raros).",
          ]}
          example={<>Escribes <span className="mono">nslookup google.com</span> y ves la IP. Luego <span className="mono">ping google.com</span> y ves si responde.</>}
          analogy="nslookup es preguntar el número de teléfono. ping es llamar para ver si alguien contesta."
          code={`nslookup google.com
ping google.com`}
        />
        <Callout tone="ok" label="¿Y si ambos muestran la misma IP?">
          Significa que el DNS está limpio: encontraste la dirección correcta,
          sin datos viejos en caché. Si hay problemas, no son del DNS — son de conexión o del servidor.
        </Callout>
      </Section>

      <Section kicker="3 · Cuando el DNS falla" title={<>Cuando la casa <em>no está</em> en el mapa.</>}>
        <LearnBlock
          what="Un error DNS significa que el navegador no encontró la dirección. La petición ni siquiera sale hacia el servidor."
          why="Si no sabes dónde está la casa, no puedes tocar la puerta. Distinguir un error DNS de un error HTTP te ahorra horas buscando el problema en el lugar equivocado."
          how={[
            "Escribes el dominio.",
            "El DNS busca y no encuentra nada útil.",
            "El navegador se detiene y muestra un error de nombre no resuelto.",
            "Nadie llegó al servidor: no hay código 404 ni 500 todavía.",
          ]}
          example={<>Mensajes típicos: <span className="mono">ERR_NAME_NOT_RESOLVED</span>, <span className="mono">DNS_PROBE_FINISHED_NXDOMAIN</span>.</>}
          analogy="Quieres ir a una fiesta, pero la dirección no existe en el mapa. No fallaste al tocar el timbre: nunca llegaste a la casa."
        />
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
        <LearnBlock
          what="DNS = no encontré la dirección. HTTP = sí llegué al servidor, pero él respondió con un problema (o con éxito)."
          why="Son dos momentos distintos del viaje. Si los mezclas, intentas «arreglar el servidor» cuando en realidad ni siquiera encontraste la IP."
          how={[
            "Primero el DNS: ¿existe este nombre? Si no → error DNS y se acabó.",
            "Si sí, tienes la IP y contactas al servidor.",
            "El servidor responde con un código HTTP: 200 bien, 404 no existe, 500 se rompió, etc.",
          ]}
          example={<>«No se puede encontrar el servidor» ≈ DNS. «404 Not Found» ≈ HTTP (sí hubo respuesta).</>}
          analogy={'DNS: «No encontré la dirección de la casa.» HTTP: «Llegué a la casa, pero no me dejaron entrar / la habitación no existe.»'}
        />
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
        <LearnBlock
          what={<>Los operadores lógicos <span className="mono">&&</span> (AND), <span className="mono">||</span> (OR) y <span className="mono">!</span> (NOT) combinan o invierten verdaderos y falsos.</>}
          why="Los programas toman decisiones: «¿puedo entrar?», «¿hay helado?», «¿está logueado Y tiene permiso?». Sin estas reglas, no podrías unir condiciones."
          how={[
            "AND (&&): mira los dos lados. Solo dice sí si AMBOS son verdaderos.",
            "OR (||): mira los dos lados. Dice sí si AL MENOS UNO es verdadero.",
            "NOT (!): invierte. Si era verdadero, pasa a falso (y al revés).",
          ]}
          example={<>Limpiaste = verdadero, tarea = falso → <span className="mono">limpiaste && tarea</span> = falso. Con <span className="mono">||</span> sería verdadero.</>}
          analogy="Mamá (AND): helado solo si limpias Y haces tarea. Papá (OR): helado si limpias O haces tarea. NOT es como decir «lo contrario»."
        />
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
  tagline: "Aprendes por intención, no por sintaxis. ¿Qué le quiero decir al programa? → luego cómo se escribe.",
  description: "Intención primero; fórmulas español → calculadora → JS; frases ↓ → traducir. Variables, if, bucles, funciones, clasificarIMC.",
  body: () => (
    <>
      <Section kicker="1 · Tu forma de aprender" title={<>Por <em>intención</em>, no por sintaxis</>}>
        <LearnBlock
          what="Tú no memorizas cómo se escribe una palabra. Primero entiendes qué le quieres decir al programa; la sintaxis solo escribe esa idea."
          why="Si empiezas por switch o while como símbolos, se siente mágico. Si empiezas por la intención («voy a revisar este número para decidir la respuesta»), el código es solo traducción."
          how={[
            "Aparece una palabra nueva → pregunta: ¿Qué le quiero decir al programa?",
            "Escribe las frases en español (↓).",
            "Solo después: cómo se escribe en JavaScript.",
            "Si hay fórmula: léela en español → hazla con calculadora → tradúcela a JS.",
          ]}
          example={'Otros ven switch (numeroMes) y memorizan. Tú piensas: «Voy a revisar el número que recibí para saber qué respuesta debo dar.»'}
          analogy="Como pedir un favor: primero sabes qué quieres (intención); después eliges las palabras exactas (sintaxis)."
        />
        <IntentBlock
          keyword="switch"
          intention={<>«Voy a revisar el número que recibí para saber qué respuesta debo dar.»</>}
          spanish={[
            "Recibí un número de mes.",
            "Voy a mirar ese número.",
            "Según qué número sea, daré una respuesta distinta.",
          ]}
          code={`switch (numeroMes) {
  case 1:
    return "Enero";
  case 2:
    return "Febrero";
  default:
    return "Mes inválido";
}`}
          note="La palabra switch no se memoriza: es la forma de escribir «revisa este valor y elige la respuesta»."
        />
        <Callout label="Regla de oro para todo JavaScript">
          Cada palabra nueva (switch, while, map, filter, addEventListener…) → primero{" "}
          <strong>¿Qué le quiero decir al programa?</strong> → después cómo se escribe.
        </Callout>
      </Section>

      <Section kicker="2 · Fórmulas" title={<>Español → calculadora → <em>código</em></>}>
        <p>
          Cuando aparece una fórmula, el código no es un misterio: es la misma operación
          que ya resolviste como persona.
        </p>
        <FormulaBlock
          title="IMC"
          spanish={
            <>
              El IMC es el <strong>peso dividido entre la altura al cuadrado</strong>.
              Altura al cuadrado = altura × altura.
            </>
          }
          calculator={
            <>
              <p className="mb-3">Ejemplo: peso = 70 kg, altura = 1.75 m</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>En la calculadora: 1.75 × 1.75 = 3.0625</li>
                <li>Luego: 70 ÷ 3.0625 ≈ 22.86</li>
              </ol>
              <p className="mt-3 italic opacity-80">Ya entendiste la operación. Ahora solo la escribes en JS.</p>
            </>
          }
          code={`let imc = peso / (altura * altura);
// misma cuenta: peso ÷ (altura × altura)`}
          symbols={[
            { mark: "/", means: "dividido entre" },
            { mark: "*", means: "multiplicado por" },
            { mark: "( )", means: "primero multiplica altura × altura; después divide" },
          ]}
        />
      </Section>

      <Section kicker="3 · Variables" title="📦 Las cajas donde guardas datos">
        <IntentBlock
          keyword="let / const"
          intention={<>«Quiero guardar un valor con un nombre para usarlo después.»</>}
          spanish={[
            "Crear una caja llamada edad.",
            "Guardar el número 10 adentro.",
            "Más tarde, cuando diga edad, traer ese 10.",
          ]}
          code={`let edad = 10;              // número (puede cambiar)
const nombre = "Ana";       // texto (candado: no reasignar)
let tieneMascota = true;    // verdadero/falso
let frutas = ["🍎","🍐"];   // lista`}
          note="let = vaso que puedes rellenar. const = frasco sellado."
        />
      </Section>

      <Section kicker="4 · Operadores" title="Las herramientas para calcular y comparar">
        <LearnBlock
          what="Los operadores son símbolos que calculan (+ − * /) o comparan (== &gt; &lt;) o combinan lógica (&& || !)."
          why="Necesitas preguntar cosas como «¿edad es mayor o igual a 18?» o «suma el precio y el impuesto». Sin operadores, solo podrías guardar datos, no trabajar con ellos."
          how={[
            "Aritméticos: suman, restan, multiplican, dividen, o sacan el resto (%).",
            "Comparación: responden verdadero o falso (¿iguales? ¿mayor?).",
            "Lógicos: unen o invierten verdaderos/falsos (AND, OR, NOT).",
          ]}
          example={<>Si <span className="mono">edad = 10</span>, entonces <span className="mono">edad &gt;= 18</span> es falso. <span className="mono">5 + 3</span> es 8.</>}
          analogy="Son las herramientas de la cocina: el cuchillo corta, la báscula compara pesos. Cada símbolo hace un trabajo concreto."
        />
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

      <Section kicker="5 · Condicionales" title="🤔 Tomar decisiones con if / else">
        <IntentBlock
          keyword="if / else"
          intention={<>«Si esto se cumple, haz A; si no, haz B.»</>}
          spanish={[
            "Miro la edad.",
            "Si es mayor o igual a 18 → mayor de edad.",
            "Si no, pero es mayor o igual a 13 → adolescente.",
            "Si no → niño.",
          ]}
          code={`let edad = 10;

if (edad >= 18) {
  console.log("Eres mayor de edad 🧑");
} else if (edad >= 13) {
  console.log("Eres adolescente 🧒");
} else {
  console.log("Eres niño 👶");
}`}
          note="if no se memoriza: es la forma de escribir «si… entonces…»."
        />
        <TranslateBlock
          title="Traducir: clasificar por edad"
          natural={[
            "Guardar la edad (por ejemplo 10).",
            "Si la edad es mayor o igual a 18, decir «Eres mayor de edad».",
            "Si no, pero es mayor o igual a 13, decir «Eres adolescente».",
            "En cualquier otro caso, decir «Eres niño».",
          ]}
          pseudo={`crear variable edad = 10

si edad >= 18
    mostrar "Eres mayor de edad"
si no, si edad >= 13
    mostrar "Eres adolescente"
si no
    mostrar "Eres niño"`}
          code={`let edad = 10;

if (edad >= 18) {
  console.log("Eres mayor de edad 🧑");
} else if (edad >= 13) {
  console.log("Eres adolescente 🧒");
} else {
  console.log("Eres niño 👶");
}
// → "Eres niño 👶"`}
        />
      </Section>

      <Section kicker="6 · Bucles" title="🔄 Repetir acciones sin escribirlas 100 veces">
        <IntentBlock
          keyword="for / while"
          intention={<>«Repite esto mientras la condición se cumpla» / «Hazlo N veces con un contador.»</>}
          spanish={[
            "Empiezo un contador en 1.",
            "Mientras sea menor o igual a 5, muestro el número.",
            "Le sumo 1 al contador (subo un piso).",
            "Cuando pase de 5, paro.",
          ]}
          code={`for (let i = 1; i <= 5; i++) {
  console.log(i);
}
// i = contador · i++ = súbele 1`}
          note="while / for = «sigue haciendo…». i++ = súbele 1 al contador (no es magia)."
        />
        <TranslateBlock
          title="Traducir: contar del 1 al 5"
          natural={[
            "Empezar un contador en 1.",
            "Mientras el contador sea menor o igual a 5, mostrar el contador.",
            "Después de mostrarlo, sumarle 1 al contador.",
            "Cuando el contador pase de 5, parar.",
          ]}
          pseudo={`crear contador i = 1

mientras i <= 5
    mostrar i
    i = i + 1   (o: i++)`}
          code={`for (let i = 1; i <= 5; i++) {
  console.log(i);
}
// 1 2 3 4 5

let n = 1;
while (n <= 5) {
  console.log(n);
  n++;
}`}
        />
      </Section>

      <Section kicker="7 · Funciones" title="📝 Recetas que puedes reutilizar">
        <IntentBlock
          keyword="function"
          intention={<>«Guarda este proceso con un nombre para usarlo cuando yo diga ese nombre.»</>}
          spanish={[
            "Crear una receta llamada saludar.",
            "Recibe un nombre.",
            "Muestra ¡Hola + ese nombre!",
            "Usarla con Ana y con Carlos.",
          ]}
          code={`function saludar(nombre) {
  console.log("¡Hola " + nombre + "! 🎉");
}

saludar("Ana");
saludar("Carlos");`}
          note="Los ( ) al llamar significan: «ejecuta la receta ahora, con estos ingredientes»."
        />
        <TranslateBlock
          title="Traducir: saludar a alguien"
          natural={[
            "Crear una función llamada saludar.",
            "Va a recibir un nombre.",
            "Mostrar «¡Hola» + ese nombre + «!».",
            "Usarla con «Ana» y luego con «Carlos».",
          ]}
          pseudo={`función saludar
    recibe: nombre
    mostrar "¡Hola " + nombre + "!"

saludar("Ana")
saludar("Carlos")`}
          code={`function saludar(nombre) {
  console.log("¡Hola " + nombre + "! 🎉");
}

saludar("Ana");     // ¡Hola Ana! 🎉
saludar("Carlos");  // ¡Hola Carlos! 🎉`}
        />
      </Section>

      <Section kicker="8 · Todo junto" title="🎢 Ejemplo: subir a la montaña rusa">
        <LearnBlock
          what="Aquí ves los 5 pilares trabajando juntos en un solo proceso."
          why="En la vida real casi nunca usas una sola pieza: guardas datos, comparas, decides y reutilizas con una función."
          how={[
            "Variables guardan edad, altura y boleta.",
            "La función puedeSubir recibe esos tres datos.",
            "El if combina tres condiciones con AND (&&): las tres deben cumplirse.",
            "Si alguna falla → «No puede subir».",
          ]}
          example={<>edad 10, altura 130, boleta true → falla porque edad &lt; 12 → «No puede subir».</>}
          analogy="La fila de la montaña rusa: debes tener edad mínima Y altura mínima Y boleta. Si te falta una, no subes (regla AND)."
        />
        <TranslateBlock
          title="Traducir: ¿puede subir?"
          natural={[
            "Guardar edad, altura y si tiene boleta.",
            "Crear una función que reciba esos tres datos.",
            "Si edad ≥ 12 Y altura ≥ 120 Y tiene boleta → devolver «Puede subir».",
            "Si no → devolver «No puede subir».",
          ]}
          pseudo={`crear edad, altura, tieneBoleta

función puedeSubir
    recibe: edad, altura, boleta
    si edad >= 12 Y altura >= 120 Y boleta
        devolver "¡Puede subir!"
    si no
        devolver "No puede subir"`}
          code={`let edad = 10;
let altura = 130;
let tieneBoleta = true;

function puedeSubir(edad, altura, boleta) {
  if (edad >= 12 && altura >= 120 && boleta) {
    return "¡Puede subir! 🎢";
  }
  return "No puede subir ❌";
}

console.log(puedeSubir(edad, altura, tieneBoleta));
// → "No puede subir ❌"`}
        />
      </Section>

      <Section kicker="9 · El método completo" title={<>¿Qué quiero decirle al programa?</>}>
        <p>
          Intención primero. Fórmula: español → calculadora → JS.
          Luego las frases ↓ y traducir cada una.
        </p>
        <SolveBlock
          title="Ejercicio modelo: clasificarIMC"
          lang="JavaScript"
          ask="Una función que, con peso y altura, calcule el IMC y diga si es bajo peso, normal, sobrepeso u obesidad."
          person={
            <>
              Primero como personas (matemática humana), no como código:
              <div className="my-4 mono text-center text-xl leading-relaxed" style={{ color: "var(--signal)" }}>
                IMC = peso ÷ altura²
              </div>
              Si mides 1.75 m, altura² = 1.75 × 1.75. Luego divides el peso entre ese resultado y comparas con 18.5, 25 y 30.
            </>
          }
          whySymbols={
            <>
              <p>
                <strong>No es</strong> <span className="mono">peso / (peso * altura)</span>.
                <strong> Sí es</strong> <span className="mono">peso / (altura * altura)</span>.
              </p>
              <p>Porque esa es la fórmula matemática del IMC. Cada símbolo:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="mono">/</span> = «dividido entre»</li>
                <li><span className="mono">altura * altura</span> = altura² (altura al cuadrado)</li>
                <li><span className="mono">( )</span> = «haz primero la multiplicación, luego divide»</li>
              </ul>
              <p className="italic opacity-90">
                En español: «El IMC es el peso dividido entre la altura multiplicada por la altura.»
              </p>
            </>
          }
          tellProgram={[
            "Crear una función.",
            "Recibir un peso.",
            "Recibir una altura.",
            "Calcular el IMC.",
            "Si el IMC es menor que 18.5",
            'Devolver "Bajo peso".',
            "Si no…",
            "Si el IMC es menor que 25…",
            'Devolver "Peso normal".',
            "Si no…",
            "Si el IMC es menor que 30…",
            'Devolver "Sobrepeso".',
            "Si no…",
            'Devolver "Obesidad".',
          ]}
          lines={[
            { es: "Crear una función. Recibir peso y altura.", code: "function clasificarIMC(peso, altura) {" },
            { es: "Calcular el IMC (peso ÷ altura × altura).", code: "  let imc = peso / (altura * altura);" },
            { es: 'Si el IMC es menor que 18.5 → devolver "Bajo peso".', code: '  if (imc < 18.5) {\n    return "Bajo peso";' },
            { es: 'Si no, si es menor que 25 → "Peso normal".', code: '  } else if (imc < 25) {\n    return "Peso normal";' },
            { es: 'Si no, si es menor que 30 → "Sobrepeso".', code: '  } else if (imc < 30) {\n    return "Sobrepeso";' },
            { es: 'Si no → "Obesidad". Cerrar la función.', code: '  } else {\n    return "Obesidad";\n  }\n}' },
          ]}
        />
        <Callout tone="warn" label="Error típico: if (imc < 18.5); {">
          <p className="mb-3">¿Qué le estás diciendo al programa?</p>
          <p className="mb-3">
            Quieres: «Si el IMC es menor que 18.5 <strong>entonces</strong> devolver Bajo peso.»
            El bloque <span className="mono">{"{ }"}</span> forma parte del if.
          </p>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <div>
              <div className="mono text-xs mb-1 opacity-70">Mal — el ; corta el if</div>
              <CodeBlock>{`if (imc < 18.5); {
  return "Bajo peso";
}`}</CodeBlock>
              <p className="text-sm mt-2">El <span className="mono">;</span> dice: «el if terminó aquí».</p>
            </div>
            <div>
              <div className="mono text-xs mb-1 opacity-70">Bien — el bloque es del if</div>
              <CodeBlock>{`if (imc < 18.5) {
  return "Bajo peso";
}`}</CodeBlock>
              <p className="text-sm mt-2">Sin <span className="mono">;</span> entre el <span className="mono">)</span> y el <span className="mono">{"{"}</span>.</p>
            </div>
          </div>
        </Callout>
        <Callout tone="ok" label="Tu forma de trabajar">
          Paso A: ¿Qué quiero decirle al programa? (frases con ↓).
          Paso B: Traducir cada frase a JavaScript.
          Con el tiempo el Paso A saldrá casi solo; el código será solo la traducción.
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
        <LearnBlock
          what="La terminal es una ventana donde das órdenes a la computadora escribiendo, en vez de hacer clic."
          why="Muchas tareas (entrar a carpetas, crear proyectos, ver errores) son más rápidas y claras por texto. Además, en programación casi todo el flujo profesional pasa por aquí."
          how={[
            "Escribes un comando (la acción).",
            "A veces le das un argumento (sobre qué archivo o carpeta).",
            "Pulsas Enter y la máquina ejecuta ese paso.",
            "El concepto es el mismo en Windows/Mac/Linux; cambian un poco las palabras.",
          ]}
          example={<>Quieres ver qué hay en la carpeta: en Mac/Linux <span className="mono">ls</span>, en CMD <span className="mono">dir</span>.</>}
          analogy="Es como pedirle cosas a un ayudante por mensajes de texto: «lista lo que hay», «entra a esta carpeta», «borra este archivo»."
        />
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
        <LearnBlock
          what="HTML es el lenguaje de marcado de todas las páginas web: pone etiquetas al contenido para decir qué es cada cosa."
          why="El navegador necesita saber: «esto es un título», «esto es un párrafo», «esto es una imagen». Sin etiquetas, solo vería texto plano sin estructura."
          how={[
            "Abres una etiqueta con <…>.",
            "Pones el contenido (texto, imagen, etc.).",
            "Cierras con </…> (salvo etiquetas vacías como img).",
            "El navegador lee esas marcas y arma la página.",
          ]}
          example={<>&lt;p&gt;Hola mundo&lt;/p&gt; = «esto es un párrafo que dice Hola mundo».</>}
          analogy="Como etiquetar cajas en una mudanza: «cocina», «ropa», «libros». El contenido es el regalo; la etiqueta dice qué es."
        />
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
        <LearnBlock
          what={<>Todo lo que el usuario debe ver va dentro de <span className="mono">&lt;body&gt;</span>.</>}
          why="El navegador espera el contenido visible ahí. Si lo pones fuera, el flujo se rompe y la página se comporta mal."
          how={[
            "head = metadatos (título de pestaña, enlaces a CSS…), casi no se «ve».",
            "body = lo visible: títulos, párrafos, imágenes, botones.",
            "Los scripts de interacción suelen ir al final del body.",
          ]}
          example="Abres la página y ves el h1 y el p porque están dentro de body."
          analogy="body es el escenario del teatro: ahí ocurre lo que el público mira. head es el backstage (preparativos)."
          code={`<!DOCTYPE html>
<html>
  <head>
    <title>Mi página</title>
  </head>
  <body>
    <h1>Hola</h1>
    <p>Todo esto SÍ se ve.</p>

    <script src="app.js"></script>
  </body>
</html>`}
        />
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
        <LearnBlock
          what="Frontend es lo que corre en el dispositivo del usuario: estructura (HTML), estilo (CSS) y comportamiento (JavaScript)."
          why="Separar roles evita mezclar todo. HTML organiza, CSS viste, JS decide e interactúa. Así entiendes dónde tocar cuando algo falla."
          how={[
            "HTML arma el esqueleto (qué hay).",
            "CSS pone la ropa (cómo se ve).",
            "JavaScript es el cerebro (qué pasa al hacer clic, al escribir, etc.).",
          ]}
          example="Un botón: HTML lo crea, CSS lo colorea, JS dice qué hacer al pulsarlo."
          analogy="Casa: HTML = paredes y habitaciones, CSS = pintura y muebles, JS = luces, timbre e interruptores."
        />
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
        <LearnBlock
          what="Renderizar es el proceso de dibujar en pantalla lo que describe el HTML, el CSS y el JS."
          why="Tú escribes texto y reglas; el usuario necesita píxeles. El renderizado es el puente entre «archivo» y «lo que se ve»."
          how={[
            "El navegador lee HTML, CSS y JS.",
            "Calcula layout (dónde va cada cosa).",
            "Pinta píxeles en la pantalla.",
            "Si JS cambia algo, puede volver a pintar.",
          ]}
          example="Cambias el color de fondo con CSS → el navegador repinta la página con ese color."
          analogy="Como un arquitecto (planos) y un pintor (obra terminada): el renderizado es el pintor que hace visible el plano."
        />
      </Section>

      <Section kicker="3 · Precisión importante" title={<>Qué es (y qué NO es) el <em>DOM.</em></>}>
        <Callout tone="warn" label="Ajuste conceptual">
          El DOM <strong>no</strong> es el que estructura el código para hacerlo visible. Eso lo hace el motor de renderizado del navegador.
        </Callout>
        <LearnBlock
          what={<>El <Sig>DOM</Sig> es un árbol de objetos en memoria: la traducción del HTML a algo que JavaScript puede tocar.</>}
          why="JS no lee el archivo HTML como texto plano para cambiar la página. Necesita un mapa vivo de elementos. Ese mapa es el DOM."
          how={[
            "El navegador lee el HTML.",
            "Lo convierte en un árbol de objetos (padre → hijos).",
            "JS usa ese árbol para leer o cambiar texto, estilos, etc.",
            "El motor de renderizado dibuja el resultado.",
          ]}
          example={<><span className="mono">document.querySelector("h1").textContent = "¡Hola!"</span> cambia el título porque el h1 existe en el DOM.</>}
          analogy="El HTML es la lista del supermercado en papel. El DOM es esa misma lista pasada a una app en el celular: ahora puedes tachar, añadir y reordenar en vivo."
          code={`// Gracias al DOM, JS puede tocar la página:
document.querySelector("h1").textContent = "¡Hola!";
document.body.style.background = "black";`}
        />
      </Section>

      <Section kicker="4 · Segunda precisión" title={<>Qué es (y qué NO es) el <em>frontend.</em></>}>
        <Callout tone="warn" label="Ajuste conceptual">
          Frontend <strong>no</strong> es solo el código ya terminado, empaquetado y publicado en internet.
        </Callout>
        <LearnBlock
          what="Frontend es todo lo que ocurre del lado del cliente: la computadora o celular de quien navega."
          why="Si crees que «solo es frontend cuando está en la nube», no entiendes dónde corre el código que el usuario toca. Corre en su dispositivo, aunque aún lo estés escribiendo en local."
          how={[
            "Diseñas y programas HTML/CSS/JS.",
            "Eso se ejecuta en el navegador del usuario.",
            "Aunque no lo hayas subido a internet, sigue siendo frontend.",
          ]}
          example="Abres index.html en tu PC y haces clic en un botón: eso ya es frontend."
          analogy="El escenario de un teatro es frontend aunque el ensayo sea en tu casa: lo importante es que es lo que el público (usuario) ve e interactúa."
        />
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

/* ============ 07 · JS (typeof, const/let, coerción, arrays, objetos) ============ */
const js: Lesson = {
  title: "JavaScript en detalle — tipos, variables, arrays y objetos",
  tagline: "Los bugs más famosos de JS no son magia: son reglas. Aquí las ves con lupa: typeof, const vs let, '3' + 10, índices desde 0, .length vs .push(), y objetos con notación de punto.",
  description: "typeof, diferencia entre const y let, coerción de tipos con + / - / *, arrays (índice desde 0, .length, .push()) y objetos con notación de punto.",
  body: () => (
    <>
      <Section kicker="1 · typeof" title="Comparar el tipo de un valor">
        <LearnBlock
          what={<><span className="mono">typeof</span> te dice qué tipo de dato tienes: número, texto, booleano, etc.</>}
          why="A veces un valor «parece» número pero es texto ('10'). Si no sabes el tipo, los operadores hacen cosas raras. typeof existe para preguntar: ¿qué es esto?"
          how={[
            "Escribes typeof delante del valor.",
            "JS responde con un texto en minúsculas: 'number', 'string', 'boolean'…",
            "Importante: 'Number' con mayúscula NO es la respuesta correcta.",
          ]}
          example={<>typeof 10 → "number". typeof "hola" → "string".</>}
          analogy="Es como preguntarle a una caja del supermercado: «¿qué categoría eres?» — lácteos, fruta, limpieza. typeof te da la categoría del dato."
          code={`console.log(typeof 10);        // "number"
console.log(typeof "hola");    // "string"
console.log(typeof true);      // "boolean"
console.log(typeof [1,2]);     // "object"  (los arrays son objetos)
console.log(typeof undefined); // "undefined"`}
        />
        <Callout tone="warn" label="Bug clásico 🐛">
          <span className="mono">typeof 10 === 'Number'</span> es <b>falso</b>. JavaScript distingue mayúsculas:
          la respuesta correcta es <span className="mono">'number'</span> con minúscula.
        </Callout>
      </Section>

      <Section kicker="2 · const vs let" title="El candado de const">
        <LearnBlock
          what={<><span className="mono">let</span> permite cambiar el valor de la caja. <span className="mono">const</span> pone un candado: no puedes reasignar.</>}
          why="A veces un valor NO debe cambiar (precio fijo, ID). const evita que lo pises por accidente. let existe para contadores y cosas que sí cambian."
          how={[
            "Con const: guardas el valor una vez.",
            "Si intentas precio = 120, JS lanza TypeError.",
            "Con let: puedes hacer stock = 4 sin problema.",
            "Regla práctica: empieza con const; cambia a let solo cuando necesites reasignar.",
          ]}
          example="const precio = 100; luego precio = 120 → error. let stock = 5; stock = 4 → ok."
          analogy="const es un frasco sellado: puedes mirar adentro, pero no cambiar el contenido. let es un vaso normal: lo rellenas cuando quieras."
          code={`const precio = 100;
precio = 120;  // ❌ TypeError

let stock = 5;
stock = 4;     // ✅ OK`}
        />
      </Section>

      <Section kicker="3 · Coerción de tipos" title={<>Por qué <span className="mono">'3' + 10 = '310'</span></>}>
        <LearnBlock
          what="Coerción es cuando JS convierte solo un tipo a otro para poder operar (texto ↔ número)."
          why="Existe para «intentar ayudar», pero a veces te confunde. Entenderla evita bugs como '3' + 10 = '310'."
          how={[
            "Con +: si un lado es texto, pega (concatena) en vez de sumar.",
            "Con - * /: intenta convertir a número y calcula.",
            "Si quieres sumar de verdad, convierte tú: Number('3') + 10.",
          ]}
          example={"'3' + 10 → '310' (pegó). '3' - 10 → -7 (restó)."}
          analogy="Es como mezclar manzanas y carteles: con + a veces pega el cartel «3» junto al «10». Con − entiende que quieres hacer cuentas."
          code={`'3' + 10   // "310"   (concatena)
'3' - 10   // -7      (resta numérica)
'3' * 10   // 30      (multiplica)
Number('3') + 10  // 13   (conversión explícita)`}
        />
        <Callout tone="warn" label="Cómo evitarlo">
          Convierte tú mismo con <span className="mono">Number(x)</span> o <span className="mono">parseInt(x)</span> antes de sumar.
        </Callout>
      </Section>

      <Section kicker="4 · Arrays" title="🍎 Listas ordenadas — el índice arranca en 0">
        <LearnBlock
          what="Un array es una lista ordenada de casilleros. El primer casillero es el 0, no el 1."
          why="Necesitas guardar varios valores juntos (frutas, notas, usuarios) y saber en qué posición está cada uno."
          how={[
            "Creas la lista: ['manzana', 'pera', 'uva'].",
            "frutas[0] es el primero, frutas[1] el segundo…",
            ".length (sin paréntesis) cuenta cuántos hay: es una propiedad, un dato.",
            ".push('kiwi') (con paréntesis) añade al final: es un método, una acción.",
          ]}
          example="En una lista de 3, frutas[3] es undefined: no hay cuarto casillero."
          analogy="Fila de casilleros del cole: el primero se numera 0. .length es el cartel «hay 3». .push() es la acción de meter otra cosa al final."
        />
        <TranslateBlock
          title="Traducir: lista de frutas"
          natural={[
            "Crear una lista llamada frutas con manzana, pera y uva.",
            "Leer el primer casillero (posición 0), el segundo (1) y el tercero (2).",
            "Preguntar cuántos hay (sin hacer una acción: solo leer el dato).",
            "Añadir kiwi al final (eso sí es una acción).",
          ]}
          pseudo={`crear lista frutas = ["manzana", "pera", "uva"]

leer frutas[0]   → "manzana"
leer frutas[1]   → "pera"
leer cuantos = frutas.length   → 3

añadir al final: frutas.push("kiwi")
ahora length = 4`}
          code={`let frutas = ["manzana", "pera", "uva"];

frutas[0];   // "manzana"
frutas[1];   // "pera"
frutas.length;   // 3  ← dato (sin ())
frutas.push("kiwi");  // acción (con ())
// ahora length = 4`}
        />
        <Callout label="Diferencia clave">
          <b>Propiedad</b> = dato que ya está calculado (sin <span className="mono">()</span>). <br />
          <b>Método</b> = acción que la variable puede <em>hacer</em> (siempre con <span className="mono">()</span>).
        </Callout>
      </Section>

      <Section kicker="5 · Objetos" title="📇 Fichas con etiquetas — notación de punto">
        <LearnBlock
          what="Un objeto guarda datos con nombre (etiqueta), no con número como el array."
          why="Una persona o un libro tienen campos con sentido: titulo, autor, paginas. Los nombres ayudan más que [0], [1], [2]."
          how={[
            "Escribes { clave: valor, … }.",
            "Lees con punto: libro.titulo.",
            "Puedes cambiar: libro.leido = false.",
            "Array = casilleros numerados. Objeto = fichas etiquetadas.",
          ]}
          example={<>libro.titulo → "El Principito". libro.paginas → 96.</>}
          analogy="Una ficha de biblioteca: no buscas «casillero 2», buscas la etiqueta «título» o «autor»."
        />
        <TranslateBlock
          title="Traducir: ficha de un libro"
          natural={[
            "Crear una ficha llamada libro.",
            "Guardar título, autor, páginas y si ya lo leí.",
            "Leer el título y las páginas.",
            "Cambiar «leído» a falso.",
          ]}
          pseudo={`crear ficha libro
    titulo = "El Principito"
    autor = "Saint-Exupéry"
    paginas = 96
    leido = verdadero

leer libro.titulo
leer libro.paginas
cambiar libro.leido = falso`}
          code={`let libro = {
  titulo: "El Principito",
  autor:  "Saint-Exupéry",
  paginas: 96,
  leido:   true
};

libro.titulo;   // "El Principito"
libro.paginas;  // 96
libro.leido = false;`}
        />
        <Callout tone="ok" label="Array vs. Objeto">
          Array = casilleros <em>numerados</em> (<span className="mono">frutas[0]</span>). <br />
          Objeto = fichas <em>etiquetadas</em> (<span className="mono">libro.titulo</span>).
        </Callout>
      </Section>

      <Section kicker="6 · Resumen express" title="Los bugs más comunes en una tabla">
        <div className="overflow-x-auto rounded-2xl hair-a" style={{ background: "oklch(0.16 0.012 55)" }}>
          <table className="w-full text-sm">
            <thead className="hair-b opacity-70">
              <tr>
                <th className="text-left px-4 py-3">Escribiste</th>
                <th className="text-left px-4 py-3">JS ve</th>
                <th className="text-left px-4 py-3">Arreglo</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["typeof 10 === 'Number'", "false",           "usa 'number' en minúscula"],
                ["const x = 1; x = 2;",     "TypeError",       "cambia const → let"],
                ["'3' + 10",                "'310'",           "Number('3') + 10 → 13"],
                ["frutas[3] en lista de 3", "undefined",       "recuerda: el índice empieza en 0"],
                ["arr.length()",            "TypeError",       "es propiedad: arr.length (sin paréntesis)"],
                ["arr.push",                "no hace nada",    "es método: arr.push('kiwi')"],
              ].map((r, i) => (
                <tr key={i} className="hair-b last:border-b-0">
                  <td className="px-4 py-2.5 mono" style={{ color: "var(--signal)" }}>{r[0]}</td>
                  <td className="px-4 py-2.5 mono">{r[1]}</td>
                  <td className="px-4 py-2.5">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  ),
};

/* ============ 08 · DOM — el punto, textContent, getElementById ============ */
const dom: Lesson = {
  title: "DOM — el punto, textContent y buscar elementos",
  tagline: "No memorizas textContent: aprendes a leer el punto (.). Cosa + característica. Intención primero.",
  description: "Cómo leer elemento.textContent, document.getElementById, style y classList — por intención, no por sintaxis. Fases del ejercicio y cartilla «qué escribir después del punto».",
  body: () => (
    <>
      <Section kicker="1 · La traba" title={<>No es textContent: es el <em>punto.</em></>}>
        <LearnBlock
          what={<>Cuando ves <span className="mono">elemento.textContent</span> o algo raro como <span className="mono">lorem.ipsumDolorSitAmet</span>, no lo leas como una sola palabra. Sepáralo por el punto.</>}
          why="Lo que frena no es memorizar nombres: es no saber leer «cosa . característica». Cuando entiendes el punto, sabes qué pedirle al programa."
          how={[
            "Mira qué hay ANTES del punto (la cosa).",
            "Mira qué hay DESPUÉS (la característica o herramienta).",
            "Lee en español: «el texto DE ese elemento», «el color DEL auto».",
            "Pregunta: ¿qué le quiero decir al programa? → luego traduce.",
          ]}
          example={<>elemento.textContent = «del elemento, quiero su contenido de texto».</>}
          analogy="Como una ficha: persona.nombre = el nombre de la persona. El punto es «de» / «su»."
        />
      </Section>

      <Section kicker="2 · El punto" title={<>. = «de» / «su» / «pertenece a»</>}>
        <IntentBlock
          keyword="."
          intention={<>«Quiero acceder a una característica o herramienta que pertenece a algo.»</>}
          spanish={[
            "Tengo una cosa (persona, auto, elemento).",
            "Quiero algo que le pertenece (nombre, color, texto).",
            "Lo escribo: cosa.característica",
          ]}
          code={`persona.nombre     // el nombre de la persona
auto.color         // el color del auto
usuario.correo     // el correo del usuario
titulo.textContent // el texto del título`}
          note={<>lorem.ipsumDolorSitAmet también se lee «ipsumDolorSitAmet de lorem» — pero esos nombres no significan nada especiales: alguien los inventó. persona.nombre sí tiene sentido.</>}
        />
        <Callout label="Comprueba">
          <span className="mono">auto.color</span> significa…{" "}
          <strong>B. El color que pertenece al auto</strong> (no «el auto del color»).
        </Callout>
      </Section>

      <Section kicker="3 · textContent" title="El texto del cartel">
        <IntentBlock
          keyword="textContent"
          intention={<>«Quiero leer o cambiar el texto que está dentro de este elemento HTML.»</>}
          spanish={[
            "Encontré un cartel (el elemento).",
            "Quiero el texto escrito en ese cartel.",
            "O: quiero borrar ese texto y poner otro.",
          ]}
          code={`// HTML: <p id="mensaje">Hola mundo</p>

let mensaje = document.getElementById("mensaje");
console.log(mensaje.textContent);  // "Hola mundo"
mensaje.textContent = "Adiós";     // ahora dice Adiós`}
          note={
            <>
              <span className="mono">mensaje</span> = el elemento completo (la caja).{" "}
              <span className="mono">mensaje.textContent</span> = solo el texto adentro.
            </>
          }
        />
        <Callout tone="ok" label="¿Por qué la consola muestra «Hola mundo»?">
          <ol className="list-decimal pl-5 space-y-1">
            <li>JS busca el elemento con <span className="mono">id=&quot;mensaje&quot;</span>.</li>
            <li>Lo encuentra: <span className="mono">&lt;p id=&quot;mensaje&quot;&gt;Hola mundo&lt;/p&gt;</span>.</li>
            <li><span className="mono">textContent</span> lee el texto dentro del &lt;p&gt;.</li>
            <li><span className="mono">console.log()</span> lo muestra en la consola.</li>
          </ol>
        </Callout>
      </Section>

      <Section kicker="4 · getElementById" title="Documento, buscá este id">
        <IntentBlock
          keyword="document.getElementById"
          intention={<>«Documento, buscá el elemento cuyo identificador es …»</>}
          spanish={[
            "document = el documento HTML completo.",
            "getElementById = la herramienta para buscar por id.",
            '("titulo") = el id que quiero encontrar.',
          ]}
          code={`document.getElementById("titulo")
// Documento, buscá el elemento cuyo id es "titulo"

let titulo = document.getElementById("titulo");
// Guardar el resultado en una caja llamada titulo`}
          note="Si el id no existe, getElementById() devuelve null. Por eso a veces la consola muestra null."
        />
        <Callout label="Ideas clave">
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="mono">getElementById()</span> busca un elemento por su id.</li>
            <li><span className="mono">textContent</span> lee o cambia el texto de ese elemento.</li>
            <li>Si el id no existe → <span className="mono">null</span>.</li>
          </ul>
        </Callout>
      </Section>

      <Section kicker="5 · Ejemplo guiado" title={<>Cambiar el texto de un <em>título</em></>}>
        <p className="mono text-sm opacity-70 mb-2">HTML de partida:</p>
        <CodeBlock>{`<h1 id="titulo">Bienvenido</h1>`}</CodeBlock>
        <SolveBlock
          title="Cambiar «Bienvenido» por «Hola»"
          lang="JavaScript"
          ask="Buscar el título y cambiar lo que dice."
          person="Buscaría el cartel llamado titulo. Borraría su texto. Escribiría un texto nuevo."
          tellProgram={[
            "Buscar el elemento cuyo identificador es titulo.",
            "Guardarlo en una caja llamada titulo.",
            "Acceder al texto de ese elemento.",
            'Cambiarlo por "Hola".',
          ]}
          lines={[
            { es: "Buscar por id.", code: 'document.getElementById("titulo")' },
            { es: "Guardar el resultado.", code: 'let titulo = document.getElementById("titulo");' },
            { es: "Acceder a su texto.", code: "titulo.textContent" },
            { es: 'Cambiar el texto a "Hola".', code: 'titulo.textContent = "Hola";' },
          ]}
        />
        <p className="italic opacity-80">
          La frase completa: «El texto del título ahora será igual a Hola.»
        </p>
      </Section>

      <Section kicker="6 · Ejercicio 2" title="Texto, color y clase — por fases">
        <SolveBlock
          title="mensaje + caja"
          lang="JavaScript"
          ask={
            <>
              Buscar <span className="mono">mensaje</span>, cambiar «Hola» por «Adiós».
              Buscar <span className="mono">caja</span>, fondo amarillo, agregar clase <span className="mono">activo</span>.
            </>
          }
          person={
            <>
              Tenés una caja con etiqueta «Hola». Buscás esa caja, borrás Hola y escribís Adiós.
              Luego buscás otra caja, la pintás de amarillo y le pegás la calcomanía «activo».
              Eso es exactamente lo que JS hará con el HTML.
            </>
          }
          tellProgram={[
            "Buscar el elemento cuyo id es mensaje.",
            "Cambiar su texto a Adiós.",
            "Buscar el elemento con id caja.",
            "Cambiar el color de fondo a amarillo.",
            "Agregarle la clase activo.",
          ]}
          lines={[
            { es: "Buscar mensaje y guardar.", code: 'let mensaje = document.getElementById("mensaje");' },
            { es: "Cambiar su texto.", code: 'mensaje.textContent = "Adiós";' },
            { es: "Buscar caja.", code: 'let caja = document.getElementById("caja");' },
            { es: "Pintar el fondo de amarillo.", code: 'caja.style.backgroundColor = "yellow";' },
            { es: "Agregar la clase activo.", code: 'caja.classList.add("activo");' },
          ]}
        />
        <Callout label="Antes de completar espacios — comprueba">
          Cuando el programa encuentra el elemento <span className="mono">mensaje</span>, ¿qué quiere hacer con él?
          <strong> Cambiar su texto</strong> (no el color ni eliminarlo). El enunciado dice: cambiar «Hola» por «Adiós».
        </Callout>
      </Section>


      <Section kicker="7 · ¿Qué escribir después del punto?" title="No te lo inventás">
        <Callout label="La pregunta de todos los principiantes">
          No se trata de memorizar que existen <span className="mono">textContent</span>,{" "}
          <span className="mono">style</span> o <span className="mono">classList</span>.
          La pregunta real es: <strong>¿Cómo sé qué escribir después del punto (.)?</strong>
        </Callout>
        <LearnBlock
          what="No te lo inventás. Cada tipo de «cosa» en JavaScript ya trae sus propias herramientas y características."
          why="Cuando hacés let titulo = document.getElementById('titulo'), titulo guarda un elemento HTML. Ese elemento ya viene con botones incorporados — vos no los creaste."
          how={[
            "Empezás en español: «Quiero cambiar el texto.»",
            "Preguntás: ¿qué herramienta sirve para el texto? → textContent",
            "«Quiero cambiar el color.» → estilos → style → color → elemento.style.color",
            "«Quiero la etiqueta activo.» → clases → classList → add → elemento.classList.add('activo')",
          ]}
          example="Cadena de ideas: tengo un elemento → quiero sus estilos → dentro, el color. No salió de la nada."
          analogy="Comprás una TV. El control tiene Encender, Volumen, Canal. No inventás el botón «hacerPalomitas»: ese botón no existe. Con un elemento HTML pasa igual."
        />
        <div className="overflow-x-auto rounded-2xl hair-a my-6" style={{ background: "oklch(0.16 0.012 55)" }}>
          <table className="w-full text-sm">
            <thead className="hair-b opacity-70">
              <tr>
                <th className="text-left px-4 py-3">Si quiero…</th>
                <th className="text-left px-4 py-3">Uso</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Leer o cambiar el texto", "elemento.textContent"],
                ["Meter HTML adentro", "elemento.innerHTML"],
                ["Cambiar estilos", "elemento.style"],
                ["Color del texto", "elemento.style.color"],
                ["Fondo", "elemento.style.backgroundColor"],
                ["Agregar / quitar clases", "elemento.classList"],
                ["Agregar una clase", 'elemento.classList.add("activo")'],
                ["Valor de un <input>", "elemento.value"],
                ["Buscar por id", 'document.getElementById("…")'],
              ].map(([a, b]) => (
                <tr key={b} className="hair-b last:border-b-0">
                  <td className="px-4 py-2.5">{a}</td>
                  <td className="px-4 py-2.5 mono" style={{ color: "var(--signal)" }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm opacity-80 mb-4">
          Al principio no las sabés todas — igual que un celular nuevo. Se aprenden poco a poco.
          El navegador ya las definió; vos elegís según la intención.
        </p>
        <Callout tone="warn" label="Error común">
          Pensar que cualquier palabra funciona después del punto.{" "}
          <span className="mono">elemento.pizza</span> no tiene sentido:
          un elemento HTML no tiene una propiedad llamada pizza.
        </Callout>
        <Callout tone="ok" label="Cartilla">
          <ol className="list-decimal pl-5 space-y-2">
            <li>¿Qué quiero decirle al programa?</li>
            <li>¿Cuál es la cosa? (documento, párrafo…)</li>
            <li>¿Qué quiero hacer con esa cosa?</li>
            <li>¿Qué herramienta ya existe para eso?</li>
            <li>Traducir: <span className="mono">cosa.herramienta</span></li>
          </ol>
        </Callout>
        <Callout label="Práctica en español (antes del código)">
          Si pensás: «Quiero cambiar el color de un párrafo.»
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>La cosa: el párrafo (el elemento).</li>
            <li>Qué modificar: su color (estilos → color).</li>
            <li>Después traducís: <span className="mono">parrafo.style.color = &quot;…&quot;;</span></li>
          </ol>
        </Callout>
      </Section>

      <Section kicker="8 · Cadenas de ideas" title="Siempre el mismo patrón">
        <p className="mb-4">Primero pensás en la cosa. Después en qué querés hacer con esa cosa.</p>
        <div className="space-y-4">
          {[
            ["document.getElementById(...)", "Cosa: document. Acción: buscar un elemento por id."],
            ["titulo.textContent", "Cosa: titulo. Característica: su texto."],
            ["titulo.style.color", "Cosa: titulo → estilos → color."],
            ['titulo.classList.add("activo")', "Cosa: titulo → lista de clases → agregar. En español: «Al elemento, en su lista de clases, agregale activo.»"],
          ].map(([code, meaning]) => (
            <div key={code} className="rounded-2xl hair-a p-5" style={{ background: "oklch(0.18 0.014 55)" }}>
              <div className="mono text-sm mb-2" style={{ color: "var(--signal)" }}>{code}</div>
              <div className="text-sm">{meaning}</div>
            </div>
          ))}
        </div>
        <Callout label="Analogía de la caja">
          Un elemento es una caja con compartimentos:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><span className="mono">.textContent</span> — el texto</li>
            <li><span className="mono">.style</span> — los estilos</li>
            <li><span className="mono">.classList</span> — la lista de clases (calcomanías)</li>
          </ul>
        </Callout>
      </Section>

      <Section kicker="9 · ¿Cómo se llama lo del punto?" title={<>Propiedad vs <em>método</em></>}>
        <p>
          Lo que está <strong>después del punto</strong> no se llama todo igual.
          Puede ser una <strong>propiedad</strong> o un <strong>método</strong>.
        </p>
        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--signal)" }}>Propiedad</div>
            <p className="italic mb-3">«Quiero saber algo de esta cosa» / qué tiene o cómo es.</p>
            <ul className="text-sm space-y-1 mb-3">
              <li>el color del auto</li>
              <li>el nombre de una persona</li>
              <li>el texto de un elemento</li>
            </ul>
            <CodeBlock>{`auto.color
persona.nombre
elemento.textContent`}</CodeBlock>
            <p className="text-sm mt-2">Se lee: «el texto <strong>del</strong> elemento». Suele ir <strong>sin</strong> ().</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "var(--signal)", color: "var(--ink)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-2">Método</div>
            <p className="italic mb-3">«Quiero pedirle a esta cosa que <strong>haga</strong> algo» / qué puede hacer.</p>
            <ul className="text-sm space-y-1 mb-3">
              <li>agregar una clase</li>
              <li>buscar por id</li>
              <li>caminar, llamar, encender…</li>
            </ul>
            <CodeBlock>{`classList.add("activo")
getElementById("titulo")
persona.caminar()`}</CodeBlock>
            <p className="text-sm mt-2">Los métodos llevan <strong>paréntesis ( )</strong>: add(), remove(), toggle()…</p>
          </div>
        </div>
        <IntentBlock
          keyword="propiedad · método"
          intention={<>«Quiero acceder a una característica O pedirle una acción.»</>}
          spanish={[
            "Una persona tiene características: nombre, edad, altura.",
            "También puede hacer acciones: caminar, hablar, correr.",
            "Propiedad = qué tiene. Método = qué puede hacer.",
          ]}
          code={`persona.nombre      // propiedad: el nombre de la persona
persona.caminar();  // método: pedirle que camine

elemento.textContent           // propiedad: el texto
elemento.classList.add("activo"); // método: agregar clase`}
          note="Teléfono: propiedades = color, batería, volumen. Acciones = encender, apagar, llamar."
        />
        <Callout tone="warn" label="Error común">
          Pensar que todo lo del punto se llama igual. Si describe una característica →{" "}
          <strong>propiedad</strong>. Si realiza una acción → <strong>método</strong>.
        </Callout>
        <Callout tone="ok" label="Comprueba">
          En <span className="mono">caja.classList.add(&quot;activo&quot;)</span>, ¿add() es una característica o una acción?
          <br />
          <strong>Una acción</strong> (método): «agregar». Por eso lleva <span className="mono">()</span>.
          <br />
          <span className="mono">textContent</span> sería la característica (propiedad): el texto.
        </Callout>
        <SolveBlock
          title="Mini: acceder al texto"
          lang="JavaScript"
          ask="Quiero acceder al texto de un elemento."
          person="Dame el texto del elemento."
          tellProgram={[
            "Tengo un elemento.",
            "Quiero su texto (característica, no una acción).",
            "Usar la propiedad textContent.",
          ]}
          lines={[
            { es: "El texto del elemento.", code: "elemento.textContent" },
          ]}
        />
      </Section>
    </>
  ),
};

export const lessons: Record<LessonSlug, Lesson> = {
  dns, operadores, fundamentos, js, terminal, html, frontend, dom, contexto,
};
