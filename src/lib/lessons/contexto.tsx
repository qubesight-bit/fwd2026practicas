import type { ReactNode } from "react";
import {
  Section,
  Callout,
  CodeBlock,
  Sig,
  LearnBlock,
  IntentBlock,
  FlashcardDeck,
  MiniExam,
} from "@/components/lesson-ui";

type Lesson = { title: string; tagline: string; description: string; body: () => ReactNode };

export const contexto: Lesson = {
  title: "Ingeniería de Contexto y Deploy",
  tagline:
    "La IA no responde según lo que tú sabes, sino según lo que le proporcionas. Y cuando tu app sale al mundo, hay que desplegarla con cuidado.",
  description:
    "Cómo preparar buen contexto para una IA (tarea, rol, datos, historial, herramientas, formato), RAG, errores comunes, y cómo llevar una app a producción: entornos, estrategias, hosting, .env y HTTPS.",
  body: () => (
    <>
      {/* 1 · Resumen */}
      <Section kicker="1 · Resumen ejecutivo" title={<>Dos áreas, <em>una idea.</em></>}>
        <LearnBlock
          what={
            <>
              Esta guía cubre <strong>dos cosas</strong>: (1) cómo darle información correcta a una IA
              (<Sig>Ingeniería de Contexto</Sig>) y (2) cómo poner una app de IA en producción de forma segura (
              <Sig>Deploy</Sig>).
            </>
          }
          why="Si solo aprendés a «hablarle» al modelo pero no a publicarlo, te quedás a medias. Si publicás sin cuidar el contexto y los secretos, la app falla o se vuelve insegura."
          how={[
            "Primero: preparar el entorno de información que recibe el modelo.",
            "Después: entender cómo esa app vive en servidores reales (DEV → PROD).",
            "Siempre: relevancia > cantidad, y secretos fuera del código.",
          ]}
          example={
            <>
              Idea clave: <em>«La IA no responde según lo que tú sabes, sino según lo que le proporcionas.»</em>
            </>
          }
          analogy="Es como contratar a alguien: no hace magia con lo que vos tenés en la cabeza. Trabaja con lo que le entregaste en la carpeta."
        />
        <Callout tone="ok" label="Regla de oro">
          <strong>Basura entra → basura sale.</strong> Un modelo excelente con contexto malo da respuestas malas.
        </Callout>
      </Section>

      {/* 2 · Explicación sencilla */}
      <Section kicker="2 · Desde cero" title={<>Como si contratara a una <em>persona.</em></>}>
        <LearnBlock
          what="Si solo decís «hazlo», nadie sabe qué hacer. Si explicás qué, para quién, con qué datos y cómo querés el resultado, el trabajo sale mucho mejor."
          why="Con una IA pasa exactamente lo mismo. No «adivina» tu intención completa: usa el paquete de información que le diste."
          how={[
            "Definís la tarea con claridad.",
            "Le das el rol (cómo debe actuar).",
            "Le pasás documentos / datos útiles.",
            "Recordás el historial si importa.",
            "Le permitís herramientas si hace falta.",
            "Pedís un formato concreto de salida.",
          ]}
          analogy="Contratar a alguien: «Hazlo» vs «Sos profesor de principiantes, usá este PDF, respondé en lista corta, sin jerga»."
        />
        <IntentBlock
          keyword="Ingeniería de Contexto"
          intention="«Quiero prepararle a la IA todo lo que necesita antes de pedirle el trabajo.»"
          spanish={[
            "No es solo escribir una frase bonita.",
            "Es armar el entorno: instrucciones + datos + memoria + herramientas + formato.",
          ]}
          code="contexto = tarea + rol + conocimiento + historial + herramientas + formato"
          note="El prompt es solo una pieza. El contexto es el tablero completo."
        />
      </Section>

      {/* 3 · Prompt vs Context */}
      <Section kicker="3 · Comparación" title={<>Prompt Engineering vs <em>Context Engineering</em></>}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--signal)" }}>
              Prompt Engineering
            </div>
            <p className="mb-3">Escribir una <strong>buena instrucción</strong>.</p>
            <p className="italic text-sm mb-3">«Resume este documento.»</p>
            <p className="text-sm opacity-80">Solo existe una instrucción puntual.</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "var(--signal)", color: "var(--ink)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-2">Context Engineering</div>
            <p className="mb-3">Preparar <strong>todo el entorno</strong>.</p>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>quién eres</li>
              <li>quién es el usuario</li>
              <li>documentos</li>
              <li>historial</li>
              <li>herramientas</li>
              <li>formato</li>
            </ul>
            <p className="text-sm mt-3">Aquí el prompt es solo una parte pequeña.</p>
          </div>
        </div>
        <Callout label="Analogía">
          Prompt = la frase que le decís al camarero. Contexto = el menú, la cocina, tus alergias, el ticket anterior y cómo querés el plato.
        </Callout>
      </Section>

      {/* 4 · Ventana de contexto */}
      <Section kicker="4 · Memoria limitada" title={<>La ventana de <em>contexto.</em></>}>
        <LearnBlock
          what="Los modelos tienen memoria limitada: no pueden leer información infinita. Todo lo que les pasás compite por el mismo espacio."
          why="Si metés demasiado (o cosas irrelevantes), lo importante se diluye o ni entra. Demasiada información también perjudica."
          how={[
            "Hay un límite de tokens (pedazos de texto).",
            "Instrucciones, docs, chat e historial ocupan ese límite.",
            "Si no cabe, algo se corta o se pierde calidad.",
            "Por eso: relevancia primero, cantidad después.",
          ]}
          analogy="Una mochila chica: si metés 300 páginas, no entra lo útil. Mejor 3 páginas justas."
        />
        <Callout tone="warn" label="Importante">
          Más contexto <strong>no</strong> siempre es mejor. Mejor contexto <strong>relevante</strong> sí.
        </Callout>
      </Section>

      {/* 5 · Seis componentes */}
      <Section kicker="5 · Los 6 componentes" title={<>Qué lleva un <em>buen</em> contexto</>}>
        <p className="mb-4">Cuando le pedís algo a una IA, pensá en estos seis bloques:</p>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            ["1 · Tarea", "¿Qué debe hacer?", "Resume el documento."],
            ["2 · Rol", "¿Quién debe ser?", "Actúa como profesor de principiantes."],
            ["3 · Conocimiento", "¿Con qué información trabaja?", "Manuales, PDF, base de datos, RAG…"],
            ["4 · Historial", "¿Qué pasó antes?", "Preguntas y respuestas anteriores."],
            ["5 · Herramientas", "¿Qué puede usar?", "APIs, buscadores, funciones, bases de datos."],
            ["6 · Formato", "¿Cómo debe responder?", "JSON, tabla, lista, Markdown…"],
          ].map(([t, q, ex]) => (
            <div key={t} className="rounded-xl hair-a p-4" style={{ background: "oklch(0.18 0.014 55)" }}>
              <div className="mono text-xs uppercase tracking-widest mb-1" style={{ color: "var(--signal)" }}>
                {t}
              </div>
              <div className="font-medium mb-1">{q}</div>
              <div className="text-sm italic opacity-80">{ex}</div>
            </div>
          ))}
        </div>
        <Callout tone="ok" label="Mini checklist mental">
          Antes de enviar: ¿tarea clara? ¿rol? ¿datos necesarios? ¿historial útil? ¿herramientas? ¿formato pedido?
        </Callout>
      </Section>

      {/* 6 · RAG */}
      <Section kicker="6 · RAG" title={<>Lee primero, <em>después</em> responde</>}>
        <IntentBlock
          keyword="RAG"
          intention="«Antes de inventar, buscá el documento correcto, metelo en el contexto y respondé con eso.»"
          spanish={[
            "Retrieval = recuperar / buscar.",
            "Augmented = aumentado / enriquecido.",
            "Generation = generar la respuesta.",
          ]}
          code="pregunta → buscar docs → agregar al contexto → responder"
          note="No inventa el reglamento: lo lee y después habla."
        />
        <LearnBlock
          what={
            <>
              <Sig>RAG</Sig> (Retrieval-Augmented Generation) = recuperar información relevante y añadirla al contexto
              antes de que el modelo responda.
            </>
          }
          why="El modelo no conoce el reglamento interno de tu empresa. Si no se lo das, inventa o dice que no sabe. RAG le trae las páginas útiles."
          how={[
            "El usuario pregunta.",
            "El sistema busca en tus documentos.",
            "Encuentra el trozo más relevante.",
            "Lo agrega al contexto.",
            "El modelo responde usando esa información.",
          ]}
          example="«¿Cuál es el reglamento interno?» → busca el PDF → mete la página correcta → responde con citas reales."
          analogy="No es un alumno que memorizó todo el colegio. Es un alumno al que le pasás el libro abierto en la página justa."
        />
        <div className="rounded-2xl hair-a p-5 my-4 mono text-sm space-y-1" style={{ background: "oklch(0.14 0.01 55)" }}>
          <div>Usuario</div>
          <div style={{ color: "var(--signal)" }}>↓</div>
          <div>Busca el documento</div>
          <div style={{ color: "var(--signal)" }}>↓</div>
          <div>Encuentra la página correcta</div>
          <div style={{ color: "var(--signal)" }}>↓</div>
          <div>La agrega al contexto</div>
          <div style={{ color: "var(--signal)" }}>↓</div>
          <div>Ahora responde usando esa información</div>
        </div>
      </Section>

      {/* 7 · Buenas prácticas */}
      <Section kicker="7 · Buenas prácticas" title={<>Cómo <em>ayudar</em> al modelo</>}>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ["Ser específico", "«Resume en máximo 150 palabras» > «hazlo mejor»"],
            ["Estructurar", "Usa secciones, viñetas, títulos claros"],
            ["Usar ejemplos", "Mostrá cómo se ve una buena respuesta"],
            ["Eliminar ruido", "Sacá lo que no aporta a la tarea"],
            ["Importante al inicio", "Lo crítico primero (compite por atención)"],
            ["Medir resultados", "Probá y compará: ¿mejoró o no?"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl hair-a p-4" style={{ background: "oklch(0.18 0.014 55)" }}>
              <div className="font-medium" style={{ color: "var(--mint)" }}>
                ✅ {t}
              </div>
              <div className="text-sm mt-1 opacity-90">{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* 8 · Errores */}
      <Section kicker="8 · Errores comunes" title={<>Qué <em>no</em> hacer</>}>
        <div className="space-y-3">
          {[
            ["Sobrecargar contexto", "Meter 300 páginas. Mejor: solo las 3 necesarias."],
            ["Ser ambiguo", "«Hazlo mejor.» → «Resume en máximo 150 palabras, tono formal.»"],
            ["Información contradictoria", "No digas «formal» y después «tono juvenil» a la vez."],
            ["Contexto viejo", "Datos obsoletos → respuestas obsoletas."],
            ["Sin estructura", "Pared de texto: difícil de seguir para el modelo."],
            ["Sin formato", "Si no pedís formato, el modelo adivina (y rara vez como vos querés)."],
            ["Superar el límite", "Si no cabe, parte desaparece."],
            ["Compartir secretos", "Nunca API keys, contraseñas ni tokens en el contexto ni en el repo."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl hair-a px-4 py-3" style={{ background: "oklch(0.18 0.014 55)" }}>
              <strong style={{ color: "var(--signal)" }}>⚠ {t}</strong>
              <div className="text-sm mt-1">{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* 9 · Deploy */}
      <Section kicker="9 · Deploy" title={<>Poner la app en el <em>mundo.</em></>}>
        <IntentBlock
          keyword="Deploy"
          intention="«Quiero que mi aplicación deje de vivir solo en mi PC y la pueda usar cualquiera.»"
          spanish={["Antes: solo en tu computadora.", "Después: disponible para usuarios reales."]}
          code="local → servidor → usuarios"
          note="Deploy = despliegue. No es «terminar el código»: es publicarlo bien."
        />
        <LearnBlock
          what="Deploy significa poner tu aplicación disponible para los usuarios."
          why="En tu máquina podés romper cosas sin consecuencias. En producción, los errores cuestan dinero, confianza y tiempo."
          analogy="Cocinar en tu cocina vs abrir un restaurante: mismas recetas, pero ahora hay clientes, higiene y turno de noche."
        />
      </Section>

      {/* 10 · Entornos */}
      <Section kicker="10 · Entornos" title={<>DEV → TEST → STAGE → <em>PROD</em></>}>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            ["DEV", "Desarrollo", "Trabajás vos. Rompés cosas. Probás ideas."],
            ["TEST", "Pruebas", "Se verifica que todo funcione (automatizado o manual)."],
            ["STAGE", "Preproducción", "Copia casi exacta de producción. Ensayo general."],
            ["PROD", "Producción", "Lo usan los clientes. Aquí los errores duelen."],
          ].map(([code, name, desc]) => (
            <div key={code} className="rounded-xl hair-a p-4 flex gap-3" style={{ background: "oklch(0.18 0.014 55)" }}>
              <div className="mono text-2xl" style={{ color: "var(--signal)" }}>
                {code}
              </div>
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-sm opacity-90">{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <Callout label="Flujo mental">
          DEV → TEST → STAGE → PROD. No saltes directo de «me funciona a mí» a «todos los clientes».
        </Callout>
      </Section>

      {/* 11 · Estrategias */}
      <Section kicker="11 · Estrategias" title={<>Cómo actualizar <em>sin</em> romper todo</>}>
        <div className="space-y-4">
          {[
            [
              "Recreate",
              "Apagás → instalás → encendés.",
              "Hay tiempo sin servicio (downtime).",
              "Como cerrar el local un día para reformarlo.",
            ],
            [
              "Rolling",
              "Actualizás poco a poco, máquina a máquina.",
              "Nunca cae todo a la vez.",
              "Como pintar un edificio piso por piso.",
            ],
            [
              "Blue-Green",
              "Dos copias: la vieja (azul) y la nueva (verde). Cambiás el tráfico.",
              "Si falla, volvés atrás al instante.",
              "Como tener dos escenarios y cambiar el reflector.",
            ],
            [
              "Canary",
              "Solo unos pocos usuarios prueban la nueva versión.",
              "Si va bien, se abre a todos.",
              "Como probar el plato nuevo con 5 mesas antes del menú completo.",
            ],
          ].map(([name, how, risk, analogy]) => (
            <div key={name} className="rounded-2xl hair-a p-5" style={{ background: "oklch(0.18 0.014 55)" }}>
              <div className="mono text-lg mb-2" style={{ color: "var(--mint)" }}>
                {name}
              </div>
              <p className="text-sm mb-1">
                <strong>Cómo:</strong> {how}
              </p>
              <p className="text-sm mb-1">
                <strong>Detalle:</strong> {risk}
              </p>
              <p className="text-sm italic opacity-80">{analogy}</p>
            </div>
          ))}
        </div>
        <Callout tone="ok" label="Examen rápido mental">
          ¿Volver atrás rápido? → <strong>Blue-Green</strong>. ¿Probar con pocos usuarios? → <strong>Canary</strong>.
        </Callout>
      </Section>

      {/* 12 · Hosting */}
      <Section kicker="12 · Hosting" title={<>Dónde <em>vive</em> tu app</>}>
        <LearnBlock
          what="Hosting es el lugar donde corre tu aplicación: la «casa» en internet."
          why="Sin hosting, solo existe en tu PC. Con hosting, tiene dirección y está disponible 24/7 (idealmente)."
          how={[
            "Elegís un proveedor (AWS, Azure, Google Cloud, Render, Railway, Vercel, Cloudflare…).",
            "O un servidor propio.",
            "Subís la app, configurás dominio y seguridad.",
          ]}
          analogy="Hosting = alquilar un local en la calle principal. Tu código es el negocio; el local es el servidor."
        />
      </Section>

      {/* 13 · .env */}
      <Section kicker="13 · Secretos" title={<>Variables de <em>entorno</em></>}>
        <IntentBlock
          keyword=".env"
          intention="«Quiero guardar las claves fuera del código, para que no se filtren en GitHub.»"
          spanish={[
            "Mal: API_KEY = \"123...\" dentro del archivo del proyecto.",
            "Bien: leer la clave desde una variable de entorno.",
          ]}
          code={`# .env (NO lo subas a Git)
API_KEY=tu_clave_secreta

# En el código solo pedís el nombre:
process.env.API_KEY`}
          note="El archivo .env vive en el servidor / tu máquina. El código solo sabe el nombre de la variable."
        />
        <Callout tone="warn" label="Nunca">
          No pongas API Keys, contraseñas ni tokens en el código, en prompts públicos ni en repositorios.
        </Callout>
      </Section>

      {/* 14 · SSL */}
      <Section kicker="14 · Candado" title={<>HTTP vs <em>HTTPS</em></>}>
        <LearnBlock
          what={
            <>
              <Sig>SSL/TLS</Sig> es el «candado» del navegador. <strong>HTTP</strong> no cifra. <strong>HTTPS</strong> sí
              cifra la comunicación.
            </>
          }
          why="Sin cifrado, alguien en el medio puede mirar o robar datos (contraseñas, tokens, formularios)."
          how={[
            "El navegador y el servidor acuerdan una conexión segura (TLS).",
            "Los datos viajan cifrados.",
            "Ves el candado / https:// en la barra.",
          ]}
          analogy="HTTP = carta abierta. HTTPS = carta en sobre cerrado con llave."
        />
        <CodeBlock>{`HTTP   →  no cifra  →  peligroso para datos sensibles
HTTPS  →  sí cifra   →  el candado del navegador`}</CodeBlock>
      </Section>

      {/* 15 · Apuntes */}
      <Section kicker="15 · Apuntes" title={<>Hoja de <em>estudio</em> rápida</>}>
        <div className="rounded-2xl hair-a p-6 space-y-4 text-sm md:text-base" style={{ background: "oklch(0.16 0.012 55)" }}>
          <div>
            <strong>Regla de oro:</strong> basura entra → basura sale.
          </div>
          <div>
            <strong>Contexto:</strong> todo lo que recibe el modelo.
          </div>
          <div>
            <strong>Componentes:</strong> tarea · rol · datos · memoria · herramientas · formato
          </div>
          <div>
            <strong>Buenas prácticas:</strong> específico · poco ruido · ejemplos · estructura
          </div>
          <div>
            <strong>Errores:</strong> demasiado contexto · contradicciones · datos viejos · secretos
          </div>
          <div>
            <strong>Deploy:</strong> DEV → TEST → STAGE → PROD
          </div>
          <div>
            <strong>Estrategias:</strong> Recreate · Rolling · Blue-Green · Canary
          </div>
          <div>
            <strong>Seguridad:</strong> .env · SSL · HTTPS
          </div>
        </div>
      </Section>

      {/* 16 · Flashcards */}
      <Section kicker="16 · Flashcards" title={<>Memorizá <em>volteando</em></>}>
        <p className="mb-2">Tocá la tarjeta para ver la respuesta. Usá Anterior / Siguiente para recorrerlas.</p>
        <FlashcardDeck
          cards={[
            {
              q: "¿Qué es la Ingeniería de Contexto?",
              a: "Diseñar y organizar toda la información que recibe el modelo.",
            },
            { q: "¿Qué es un prompt?", a: "Una instrucción puntual." },
            {
              q: "¿Qué es RAG?",
              a: "Recuperar información relevante y añadirla al contexto antes de responder.",
            },
            { q: "¿Qué significa DEV?", a: "Entorno de desarrollo." },
            { q: "¿Qué significa PROD?", a: "Producción (usuarios reales)." },
            { q: "¿Qué hace HTTPS?", a: "Cifra la comunicación." },
            { q: "¿Para qué sirve un archivo .env?", a: "Guardar secretos fuera del código." },
            { q: "¿Qué estrategia permite volver atrás rápidamente?", a: "Blue-Green." },
            {
              q: "¿Qué estrategia libera cambios a pocos usuarios primero?",
              a: "Canary.",
            },
            {
              q: "¿Qué es más importante: cantidad o relevancia del contexto?",
              a: "La relevancia.",
            },
          ]}
        />
      </Section>

      {/* 17 · Examen */}
      <Section kicker="17 · Examen" title={<>Preguntas tipo <em>examen</em></>}>
        <p className="mb-4">Respondé todas y después tocá «Corregir examen».</p>
        <MiniExam
          items={[
            {
              kind: "mc",
              q: "¿Cuál es el objetivo principal de la Ingeniería de Contexto?",
              choices: [
                "Crear modelos nuevos",
                "Diseñar el contexto que recibe el modelo",
                "Programar APIs",
                "Entrenar redes neuronales",
              ],
              answer: 1,
              explain: "No inventás el modelo: preparás la información con la que trabaja.",
            },
            {
              kind: "mc",
              q: "¿Cuál NO forma parte del contexto?",
              choices: ["Rol", "Historial", "Herramientas", "Tarjeta gráfica"],
              answer: 3,
              explain: "La GPU es hardware. El contexto es información: rol, historial, herramientas, etc.",
            },
            {
              kind: "mc",
              q: "¿Qué hace RAG?",
              choices: [
                "Entrena el modelo",
                "Recupera información relevante antes de responder",
                "Comprime imágenes",
                "Elimina prompts",
              ],
              answer: 1,
              explain: "Busca → agrega al contexto → genera. No reentrena el modelo.",
            },
            {
              kind: "tf",
              q: "La calidad del contexto influye en la calidad de la respuesta.",
              answer: true,
              explain: "Basura entra → basura sale. El contexto es el combustible.",
            },
            {
              kind: "tf",
              q: "Más contexto siempre es mejor.",
              answer: false,
              explain: "Importa la relevancia. Demasiado ruido distrae o no cabe en la ventana.",
            },
            {
              kind: "tf",
              q: "HTTPS cifra la información.",
              answer: true,
              explain: "HTTPS usa TLS para cifrar el tráfico.",
            },
            {
              kind: "tf",
              q: "Las API Keys deben ir en GitHub.",
              answer: false,
              explain: "Nunca. Van en variables de entorno / secretos del hosting.",
            },
          ]}
        />

        <Callout label="Preguntas de desarrollo (para escribir / explicar en voz alta)">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Explicá la diferencia entre Prompt Engineering e Ingeniería de Contexto.</li>
            <li>Explicá el flujo de RAG.</li>
            <li>Describí los cuatro entornos de despliegue.</li>
            <li>¿Por qué las variables de entorno mejoran la seguridad?</li>
            <li>Compará Blue-Green y Canary.</li>
          </ol>
        </Callout>
      </Section>

      {/* 18 · Mejoras del doc */}
      <Section kicker="18 · Mejoras" title={<>Cómo <em>ampliar</em> el estudio</>}>
        <p>El material está claro. Para profundizar, podrías:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Armar un ejemplo completo: pregunta → RAG → respuesta.</li>
          <li>Dibujar cómo compiten los tokens en la ventana de contexto.</li>
          <li>Practicar cargar <span className="mono">process.env</span> en JS y variables en Python.</li>
          <li>Comparar la misma pregunta con contexto malo vs bueno.</li>
          <li>Medir calidad: ¿la respuesta cita la fuente? ¿respeta el formato?</li>
        </ul>
      </Section>

      {/* 19 · Presentación */}
      <Section kicker="19 · Presentación" title={<>Esquema para <em>exponer</em></>}>
        <ol className="list-decimal pl-5 space-y-2">
          <li>¿Qué es la Ingeniería de Contexto?</li>
          <li>Prompt Engineering vs Context Engineering</li>
          <li>La ventana de contexto</li>
          <li>Los seis componentes</li>
          <li>RAG y cómo funciona</li>
          <li>Buenas prácticas</li>
          <li>Errores comunes</li>
          <li>¿Qué es el Deploy?</li>
          <li>Entornos: DEV, TEST, STAGE, PROD</li>
          <li>Estrategias de despliegue</li>
          <li>Hosting</li>
          <li>Variables de entorno y seguridad</li>
          <li>SSL/TLS y HTTPS</li>
          <li>Conclusiones y recomendaciones</li>
        </ol>
      </Section>

      {/* 20 · Idea clave */}
      <Section kicker="20 · Idea clave" title={<>Lo que <em>no</em> debés olvidar</>}>
        <Callout tone="ok" label="Enseñanza principal">
          La calidad de un sistema de IA depende mucho más de la <strong>calidad del contexto</strong> que del modelo
          en sí. Un buen contexto es <strong>relevante, estructurado, actualizado y seguro</strong>. Y cuando pasa a
          producción, se despliega con buenas prácticas de infraestructura y protección de datos.
        </Callout>
      </Section>
    </>
  ),
};
