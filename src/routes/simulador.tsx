import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { W95Button } from "@/components/win95";
import { RulesBox } from "@/components/RulesBox";
import { WhyBox } from "@/components/WhyBox";
import CodeEditor from "@/components/CodeAutocomplete";

import { recordSimPrediction, recordSimUse, useStats, sfx, addXP, addCoins } from "@/lib/gamification";

export const Route = createFileRoute("/simulador")({
  head: () => ({
    meta: [
      { title: "Simulador DNS y HTTP — Redes 95" },
      { name: "description", content: "Simulador con modo desafío: predice si un dominio dará éxito o error, y gana XP." },
    ],
  }),
  component: Simulator,
});

type Scenario = {
  domain: string;
  label: string;
  ip: string | null;
  httpCode: number | null;
  httpText: string;
  narrative: string;
  outcome: "ok" | "http-error" | "dns-error";
};

const SCENARIOS: Scenario[] = [
  { domain: "google.com",             label: "Éxito clásico",     ip: "142.250.185.78", httpCode: 200, httpText: "OK",                    narrative: "Todo funciona. La página carga.",                outcome: "ok" },
  { domain: "example.com",            label: "Éxito clásico",     ip: "93.184.216.34",  httpCode: 200, httpText: "OK",                    narrative: "El dominio existe, el servidor contesta bien.", outcome: "ok" },
  { domain: "cdn.midominio.com",      label: "Recurso creado",    ip: "151.101.1.5",    httpCode: 201, httpText: "Created",               narrative: "El servidor creó un recurso nuevo (ej: subiste un archivo).", outcome: "ok" },
  { domain: "api.midominio.com",      label: "Sin contenido",     ip: "151.101.1.6",    httpCode: 204, httpText: "No Content",            narrative: "OK pero sin cuerpo en la respuesta (típico en DELETE).", outcome: "ok" },
  { domain: "http://midominio.com",   label: "Redirección",       ip: "151.101.1.7",    httpCode: 301, httpText: "Moved Permanently",     narrative: "El servidor te manda a https://midominio.com.",  outcome: "ok" },
  { domain: "cache.midominio.com",    label: "No modificado",     ip: "151.101.1.8",    httpCode: 304, httpText: "Not Modified",          narrative: "Tu navegador usa la versión guardada en caché.", outcome: "ok" },
  { domain: "github.com/no-existe",   label: "Recurso faltante",  ip: "140.82.121.4",   httpCode: 404, httpText: "Not Found",             narrative: "Llegamos al servidor, pero esa ruta no existe.", outcome: "http-error" },
  { domain: "banco.com/panel",        label: "Sin sesión",        ip: "203.0.113.10",   httpCode: 401, httpText: "Unauthorized",          narrative: "Necesitas iniciar sesión para ver esto.",         outcome: "http-error" },
  { domain: "sitio-privado.com",      label: "Acceso denegado",   ip: "203.0.113.42",   httpCode: 403, httpText: "Forbidden",             narrative: "El servidor te ubicó, pero no tienes permiso.",  outcome: "http-error" },
  { domain: "api.demo.com/tea",       label: "Broma HTTP",        ip: "198.51.100.4",   httpCode: 418, httpText: "I'm a teapot",          narrative: "Código de broma: soy una tetera, no hago café.",  outcome: "http-error" },
  { domain: "descarga.grande.com",    label: "Payload gigante",   ip: "198.51.100.5",   httpCode: 413, httpText: "Payload Too Large",     narrative: "El archivo que enviaste supera el límite del servidor.", outcome: "http-error" },
  { domain: "api.limite.com",         label: "Demasiadas requests", ip: "198.51.100.6", httpCode: 429, httpText: "Too Many Requests",     narrative: "Rate limit: pediste demasiado en poco tiempo.",   outcome: "http-error" },
  { domain: "app-caida.com",          label: "Servidor roto",     ip: "198.51.100.7",   httpCode: 500, httpText: "Internal Server Error", narrative: "El servidor existe pero su código falló.",       outcome: "http-error" },
  { domain: "gateway-lenta.com",      label: "Intermediario",     ip: "198.51.100.9",   httpCode: 502, httpText: "Bad Gateway",           narrative: "Un intermediario recibió una respuesta inválida.", outcome: "http-error" },
  { domain: "mantenimiento.com",      label: "En pausa",          ip: "198.51.100.11",  httpCode: 503, httpText: "Service Unavailable",   narrative: "Servidor saturado o en mantenimiento.",          outcome: "http-error" },
  { domain: "servidor-tardon.com",    label: "Tardó demasiado",   ip: "198.51.100.12",  httpCode: 504, httpText: "Gateway Timeout",       narrative: "El gateway se cansó de esperar al servidor real.", outcome: "http-error" },
  { domain: "esto-no-existe-xyz.zzz", label: "DNS falla",         ip: null,             httpCode: null, httpText: "",                     narrative: "El DNS no encontró el dominio.",                 outcome: "dns-error" },
  { domain: "sitio.typosquat",        label: "TLD inválido",      ip: null,             httpCode: null, httpText: "",                     narrative: "Ese dominio de nivel superior no existe.",       outcome: "dns-error" },
];

function pickScenario(input: string): Scenario {
  const norm = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const exact = SCENARIOS.find((s) => s.domain === norm);
  if (exact) return exact;
  if (!norm || norm.length < 3 || !norm.includes(".")) {
    return { ...SCENARIOS[SCENARIOS.length - 1], domain: input || "?" };
  }
  if (/^(xn--|.*\.(zzz|invalid|test|localdomain))/.test(norm)) {
    return { ...SCENARIOS[SCENARIOS.length - 1], domain: norm };
  }
  const h = [...norm].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const ip = `${(h % 223) + 1}.${(h >> 3) % 255}.${(h >> 7) % 255}.${(h >> 11) % 255}`;
  return { domain: norm, label: "Éxito simulado", ip, httpCode: 200, httpText: "OK", narrative: "Dominio válido — DNS resolvió y el servidor respondió.", outcome: "ok" };
}

type Step = "idle" | "dns" | "dns-done" | "http" | "done";
type Prediction = "ok" | "http-error" | "dns-error" | null;

function Simulator() {
  const stats = useStats();
  const [input, setInput] = useState("google.com");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [challenge, setChallenge] = useState(false);
  const [prediction, setPrediction] = useState<Prediction>(null);
  const [predictionResult, setPredictionResult] = useState<"win" | "lose" | null>(null);

  useEffect(() => { recordSimUse(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const run = useCallback((domain?: string) => {
    const value = (domain ?? input).trim();
    if (!value) return;
    if (domain) setInput(domain);
    const s = pickScenario(value);
    setScenario(s);
    setStep("dns");
    setPredictionResult(null);
  }, [input]);

  const randomChallenge = () => {
    const pool = SCENARIOS.filter((s) => s.domain !== input);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setChallenge(true);
    setPrediction(null);
    setInput(pick.domain);
    setScenario(pick);
    setStep("idle");
    setPredictionResult(null);
    sfx.click();
  };

  const submitPrediction = (p: Prediction) => {
    if (!p || !scenario) return;
    setPrediction(p);
    run(scenario.domain);
  };

  useEffect(() => {
    if (!scenario) return;
    if (step === "dns") { const t = setTimeout(() => setStep("dns-done"), 1100); return () => clearTimeout(t); }
    if (step === "dns-done") { const t = setTimeout(() => setStep(scenario.ip ? "http" : "done"), 700); return () => clearTimeout(t); }
    if (step === "http") { const t = setTimeout(() => setStep("done"), 1300); return () => clearTimeout(t); }
  }, [step, scenario]);

  // Handle prediction resolution
  useEffect(() => {
    if (step !== "done" || !scenario || !challenge || !prediction || predictionResult !== null) return;
    const ok = prediction === scenario.outcome;
    setPredictionResult(ok ? "win" : "lose");
    recordSimPrediction(ok);
    if (!ok) sfx.wrong();
  }, [step, scenario, challenge, prediction, predictionResult]);

  const dnsOk = scenario && scenario.ip !== null;
  const httpOk = scenario && scenario.httpCode === 200;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-1" style={{ fontFamily: "var(--font-display)", color: "#000080" }}>
        🌐 SIMULADOR DE RED
      </h1>
      <p className="text-[13px] mb-4">
        Escribe un dominio y observa el viaje: DNS → IP → petición → respuesta.
        Activa el <b>modo desafío</b> y predice el resultado para ganar XP.
      </p>

      {/* Address bar */}
      <div className="w95-outset p-1 flex items-center gap-1 flex-wrap mb-2" style={{ background: "var(--w95-face)" }}>
        <span className="text-[12px] px-2">https://</span>
        <div className="flex-1 min-w-[160px] w95-inset bg-white px-2 py-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") run(); }}
            spellCheck={false}
            className="w-full bg-transparent outline-none mono text-[13px]"
            placeholder="google.com"
          />
        </div>
        <W95Button onClick={() => run()}>Ir ▶</W95Button>
      </div>

      {/* Challenge mode */}
      <div className="w95-outset p-2 mb-3 flex items-center gap-2 flex-wrap text-[12px]" style={{ background: "#ffffcc" }}>
        <span>🎮 <b>Modo desafío:</b></span>
        <W95Button onClick={randomChallenge}>🎲 Dame un dominio aleatorio</W95Button>
        {challenge && !prediction && scenario && (
          <>
            <span>Predice el resultado de <span className="mono">{scenario.domain}</span>:</span>
            <W95Button onClick={() => submitPrediction("ok")}>✓ Éxito (200)</W95Button>
            <W95Button onClick={() => submitPrediction("http-error")}>⚠ Error HTTP</W95Button>
            <W95Button onClick={() => submitPrediction("dns-error")}>❌ DNS falla</W95Button>
          </>
        )}
        {predictionResult && (
          <span className="px-2 py-1 text-white" style={{ background: predictionResult === "win" ? "#008000" : "#c00000" }}>
            {predictionResult === "win" ? "🏆 ¡Acertaste! +15 XP" : "😖 Fallaste — sin XP"}
          </span>
        )}
        <span className="ml-auto opacity-80">Aciertos: <b>{stats.simPredictionsOk}</b></span>
      </div>

      {/* Quick scenarios */}
      <div className="mb-4 flex flex-wrap gap-1 items-center">
        <span className="text-[11px] mono opacity-70 pr-1">Escenarios:</span>
        {SCENARIOS.map((s) => (
          <button key={s.domain} onClick={() => { setChallenge(false); setPrediction(null); run(s.domain); }} className="w95-btn text-[11px]" title={s.label}>
            {s.domain}
          </button>
        ))}
      </div>

      {/* Journey */}
      <div className="grid lg:grid-cols-3 gap-3">
        <Node title="🧑 Tú" sub="Navegador" active={step !== "idle"}>
          <div className="mono text-[12px] break-all">{scenario?.domain ?? "—"}</div>
        </Node>

        <Node title="📞 DNS" sub="Domain Name System" active={step === "dns" || step === "dns-done" || step === "http" || step === "done"}>
          {step === "idle" && <span className="text-[12px] opacity-70">Esperando dominio…</span>}
          {step === "dns" && <span className="text-[12px]"><span className="w95-hourglass">⌛</span> Buscando en la guía…</span>}
          {(step === "dns-done" || step === "http" || step === "done") && scenario && (
            scenario.ip ? (
              <>
                <div className="mono text-[10px] uppercase opacity-70">IP encontrada</div>
                <div className="mono text-lg" style={{ color: "#008000" }}>{scenario.ip}</div>
              </>
            ) : (
              <>
                <div className="mono text-[10px] uppercase" style={{ color: "#c00000" }}>Error DNS</div>
                <div className="mono text-[12px]" style={{ color: "#c00000" }}>ERR_NAME_NOT_RESOLVED</div>
              </>
            )
          )}
        </Node>

        <Node title="🖥 Servidor" sub={scenario?.ip ?? "no alcanzado"} active={step === "http" || step === "done"} disabled={scenario ? !scenario.ip : false}>
          {(!scenario || step === "idle" || step === "dns" || (step === "dns-done" && dnsOk)) && (
            <span className="text-[12px] opacity-70">Esperando petición…</span>
          )}
          {step === "http" && <span className="text-[12px]"><span className="w95-hourglass">⌛</span> Procesando…</span>}
          {step === "done" && scenario && scenario.httpCode !== null && (
            <>
              <div className="mono text-[10px] uppercase opacity-70">Respuesta HTTP</div>
              <div className="flex items-baseline gap-2">
                <div className="mono text-2xl" style={{ color: httpOk ? "#008000" : "#c00000" }}>{scenario.httpCode}</div>
                <div className="mono text-[12px]">{scenario.httpText}</div>
              </div>
            </>
          )}
          {step === "done" && scenario && scenario.httpCode === null && (
            <div className="text-[12px] italic opacity-70">La petición nunca llegó aquí.</div>
          )}
        </Node>
      </div>

      {/* Summary */}
      {step === "done" && scenario && (
        <div className="w95-outset p-3 mt-4" style={{ background: !dnsOk ? "#ffcccc" : httpOk ? "#ccffcc" : "#ffe0b3" }}>
          <div className="text-[12px] mono mb-1">
            {!dnsOk ? "❌ El DNS no resolvió" : httpOk ? "✓ Todo correcto" : `⚠ Servidor devolvió ${scenario.httpCode}`}
          </div>
          <p className="text-[13px]">{scenario.narrative}</p>
        </div>
      )}

      {/* Legend */}
      <div className="grid md:grid-cols-2 gap-3 mt-6">
        <div className="w95-inset bg-white p-3 text-[12px]">
          <div className="mono mb-1" style={{ color: "#000080" }}>💡 Recordatorio</div>
          <p><b>Error DNS:</b> la petición <i>nunca sale</i> — no encuentra la IP.<br /><b>Error HTTP:</b> el servidor sí respondió, pero con problema.</p>
        </div>
        <div className="w95-inset bg-white p-3 text-[12px]">
          <div className="mono mb-1" style={{ color: "#000080" }}>📋 Códigos comunes</div>
          <ul className="mono">
            <li><span style={{color:"#008000"}}>200</span> OK</li>
            <li><span style={{color:"#c00000"}}>404</span> no encontrado</li>
            <li><span style={{color:"#c00000"}}>403</span> prohibido</li>
            <li><span style={{color:"#c00000"}}>500</span> error del servidor</li>
            <li><span style={{color:"#c00000"}}>502 / 503</span> gateway / no disponible</li>
          </ul>
        </div>
      </div>

      {/* Exercises */}
      <EjerciciosCodigo />
      <Ejercicios />
    </div>
  );
}

/* ---------- Interactive mini-exercises (HTML / CSS / JS / DOM / Red) ---------- */

type Ex = {
  id: string;
  tag: "HTML" | "CSS" | "JS" | "DOM" | "RED" | "TERMINAL" | "LOGICA";
  q: string;
  options: string[];
  correct: number;
  explain: string;
};

const EXERCISES: Ex[] = [
  { id: "html-1", tag: "HTML", q: "¿Cuál etiqueta crea el título más importante de una página?", options: ["<h6>", "<title>", "<h1>", "<head>"], correct: 2, explain: "1) ¿Qué me pide? El título principal visible.\n2) ¿Persona? El texto más grande e importante.\n3) Algoritmo: usar título nivel 1.\n4) Traducir: <h1> (no <title>, que es solo la pestaña)." },
  { id: "html-2", tag: "HTML", q: "¿Qué etiqueta se usa para un enlace a otra página?", options: ["<link>", "<a href='...'>", "<button>", "<url>"], correct: 1, explain: "1) ¿Qué me pide? Un enlace clicable.\n2) ¿Persona? Cartel + dirección detrás.\n3) Algoritmo: enlace + destino (href) + texto.\n4) Traducir: <a href='…'> (<link> no es clicable)." },
  { id: "html-3", tag: "HTML", q: "Para mostrar una imagen usamos…", options: ["<image src>", "<picture path>", "<img src='foto.jpg' alt='...'>", "<src img>"], correct: 2, explain: "1) ¿Qué me pide? Mostrar una imagen.\n2) ¿Persona? Foto + etiqueta por si falta.\n3) Algoritmo: img + src + alt.\n4) Traducir: <img src='foto.jpg' alt='…'>" },
  { id: "html-4", tag: "HTML", q: "¿Cuál etiqueta representa una lista con orden (1, 2, 3)?", options: ["<ul>", "<ol>", "<list>", "<dl>"], correct: 1, explain: "1) ¿Qué me pide? Lista numerada.\n2) ¿Persona? 1. 2. 3.\n3) Algoritmo: lista ordenada + ítems.\n4) Traducir: <ol> (ul = viñetas)." },
  { id: "html-5", tag: "HTML", q: "El bloque genérico sin significado semántico es…", options: ["<section>", "<div>", "<article>", "<main>"], correct: 1, explain: "1) ¿Qué me pide? Caja neutra sin significado.\n2) ¿Persona? Agrupar sin decir «esto es un artículo».\n3) Algoritmo: contenedor genérico.\n4) Traducir: <div>." },

  { id: "css-1", tag: "CSS", q: "Para pintar el texto de rojo escribes…", options: ["font-color: red;", "text: red;", "color: red;", "background: red;"], correct: 2, explain: "1) ¿Qué me pide? Letras rojas (no el fondo).\n2) ¿Persona? Marcador rojo en el texto.\n3) Algoritmo: propiedad color = red.\n4) Traducir: color: red;" },
  { id: "css-2", tag: "CSS", q: "¿Qué selector aplica estilos a la clase 'btn'?", options: ["#btn", ".btn", "btn", "*btn"], correct: 1, explain: "1) ¿Qué me pide? Seleccionar la clase btn.\n2) ¿Persona? Buscar el grupo etiquetado btn.\n3) Algoritmo: selector de clase = punto.\n4) Traducir: .btn (# es id)." },
  { id: "css-3", tag: "CSS", q: "Para centrar horizontalmente un contenedor con flex…", options: ["align-items: center", "justify-content: center", "text-align: center", "margin: center"], correct: 1, explain: "1) ¿Qué me pide? Centrar en el eje principal (horizontal).\n2) ¿Persona? Empujar al centro izquierda-derecha.\n3) Algoritmo: justify-content en el eje principal.\n4) Traducir: justify-content: center" },
  { id: "css-4", tag: "CSS", q: "El espacio dentro de la caja (entre borde y contenido) es…", options: ["margin", "padding", "border", "gap"], correct: 1, explain: "1) ¿Qué me pide? Espacio DENTRO de la caja.\n2) ¿Persona? Aire entre el regalo y el borde del envoltorio.\n3) Algoritmo: espacio interior = padding.\n4) Traducir: padding (margin = fuera)." },

  { id: "js-1", tag: "JS", q: "Se declara una variable que no cambia con…", options: ["var", "let", "const", "def"], correct: 2, explain: "1) ¿Qué me pide? Una caja que no se reasigne.\n2) ¿Persona? Frasco sellado.\n3) Algoritmo: declarar con candado.\n4) Traducir: const (let sí cambia)." },
  { id: "js-2", tag: "JS", q: "¿Cuál operador es 'Y lógico'?", options: ["||", "&&", "!", "=="], correct: 1, explain: "1) ¿Qué me pide? El Y (ambos deben cumplirse).\n2) ¿Persona? Helado solo si limpias Y haces tarea.\n3) Algoritmo: AND = ambos true.\n4) Traducir: &&" },
  { id: "js-3", tag: "JS", q: "Un bucle que repite mientras se cumple una condición es…", options: ["for-in", "while", "if", "switch"], correct: 1, explain: "1) ¿Qué me pide? Repetir mientras…\n2) ¿Persona? Seguir mientras la condición sea sí.\n3) Algoritmo: mientras condición → hacer.\n4) Traducir: while (if solo decide una vez)." },
  { id: "js-4", tag: "JS", q: "La tabla de verdad de (true && false) da…", options: ["true", "false", "error", "null"], correct: 1, explain: "1) ¿Qué me pide? Resultado de true Y false.\n2) ¿Persona? Si falta una condición, no.\n3) Algoritmo: AND exige ambos true.\n4) Traducir: true && false → false" },
  { id: "js-5", tag: "JS", q: "!(true || false) es…", options: ["true", "false"], correct: 1, explain: "1) ¿Qué me pide? Negar (true O false).\n2) ¿Persona? Primero OR, luego lo contrario.\n3) Algoritmo: true||false → true; !true → false.\n4) Traducir: !(true || false) → false" },

  { id: "dom-1", tag: "DOM", q: "El DOM es…", options: ["Un lenguaje de programación", "Un árbol con todas las etiquetas HTML de la página", "Una base de datos", "Un servidor web"], correct: 1, explain: "1) ¿Qué me pide? Qué es el DOM.\n2) Intención: mapa vivo del HTML para que JS lo toque.\n3) Traducir: árbol de objetos en memoria (no es quien dibuja)." },
  { id: "dom-2", tag: "DOM", q: "Para cambiar el texto de un elemento usas…", options: ["element.color", "element.textContent", "element.href", "element.type"], correct: 1, explain: "1) ¿Qué le digo? Cambiar el texto del cartel.\n2) Cosa: elemento. Característica: texto.\n3) Traducir: elemento.textContent (el punto = «de»)." },
  { id: "dom-3", tag: "DOM", q: "document.querySelector('.card') devuelve…", options: ["Todos los .card", "El primer elemento con clase card", "Solo los ID", "Null siempre"], correct: 1, explain: "1) Intención: documento, buscá el primer .card.\n2) querySelector = el primero; querySelectorAll = todos." },
  { id: "dom-4", tag: "DOM", q: "¿Qué significa auto.color?", options: ["El auto que pertenece al color", "El color que pertenece al auto", "Crear un auto nuevo", "Borrar el color"], correct: 1, explain: "1) El punto = «de» / «su».\n2) Antes: auto (la cosa). Después: color (lo que le pertenece).\n3) «El color del auto»." },
  { id: "dom-5", tag: "DOM", q: "Si getElementById no encuentra el id, ¿qué devuelve?", options: ["undefined", "false", "null", "\"\""], correct: 2, explain: "1) Intención: buscar por id.\n2) Si no existe → null (no hay elemento).\n3) Por eso a veces la consola muestra null." },
  { id: "dom-7", tag: "DOM", q: "En caja.classList.add('activo'), ¿add es…?", options: ["Una propiedad (característica)", "Un método (acción) — lleva ()", "El id de la caja", "Un error"], correct: 1, explain: "1) Propiedad = qué tiene (sin ()).\n2) Método = qué hace (con ()).\n3) add() = acción «agregar» → método." },

  { id: "red-1", tag: "RED", q: "El DNS traduce…", options: ["HTML a CSS", "Nombre de dominio a dirección IP", "IP a MAC", "URL a HTTPS"], correct: 1, explain: "Qué es: nombre bonito → IP. Analogía: guía telefónica. Tú das google.com; el DNS te da el número." },
  { id: "red-2", tag: "RED", q: "El código 404 significa…", options: ["Sin permiso", "Servidor caído", "Recurso no encontrado", "Todo OK"], correct: 2, explain: "Qué es: 404 = esa URL no existe en el servidor. Importante: sí llegaste (es HTTP, no DNS). Analogía: la casa existe, pero esa habitación no." },
  { id: "red-3", tag: "RED", q: "El código 500 dice que…", options: ["El navegador falló", "El servidor tuvo un error interno", "No hay internet", "El DNS falló"], correct: 1, explain: "5xx = se rompió adentro del servidor. 4xx = problema del cliente. No es DNS: hubo respuesta." },
  { id: "red-4", tag: "RED", q: "Un ERR_NAME_NOT_RESOLVED es…", options: ["Error HTTP 500", "Error DNS: no encontró la IP", "Error CSS", "Error 404"], correct: 1, explain: "Sin IP no hay a dónde ir: falla antes de salir. Analogía: la dirección no está en el mapa — nunca tocaste el timbre." },
  { id: "red-5", tag: "RED", q: "El código 301 significa…", options: ["Prohibido", "Redirección permanente", "No hay contenido", "Servidor lento"], correct: 1, explain: "Qué es: 301 = «esta página se mudó para siempre». Por qué: para que enlaces viejos sigan funcionando y apunten al sitio nuevo." },
  { id: "red-6", tag: "RED", q: "429 aparece cuando…", options: ["Envías demasiadas peticiones", "El servidor está caído", "No tienes cuenta", "La URL está mal"], correct: 0, explain: "Qué es: Too Many Requests. Por qué existe: frenar spam de peticiones (rate limit). Analogía: el guardia te para por llamar al timbre mil veces." },

  { id: "term-1", tag: "TERMINAL", q: "Para ver la IP de un dominio usas…", options: ["ping", "nslookup", "cd", "ls"], correct: 1, explain: "nslookup = preguntar el número al DNS. ping = además llamar a ver si contestan. Analogía: buscar el teléfono vs marcar." },
  { id: "term-2", tag: "TERMINAL", q: "Para cambiar de carpeta en la terminal usas…", options: ["mv", "cd", "ls", "rm"], correct: 1, explain: "cd = Change Directory (entrar a otra carpeta). ls/dir = mirar qué hay. Analogía: cambiar de habitación vs mirar el contenido del cajón." },
  { id: "term-3", tag: "TERMINAL", q: "Para probar si un servidor responde envías…", options: ["ping google.com", "css google.com", "dns google.com", "html google.com"], correct: 0, explain: "Qué hace ping: manda señales y mide si hay eco. Por qué: saber si el host está vivo, no solo si el DNS resolvió." },

  { id: "log-1", tag: "LOGICA", q: "(true || false) && !false =", options: ["true", "false"], correct: 0, explain: "Paso a paso: true||false → true. !false → true. true&&true → true. Primero OR, luego NOT, luego AND." },
  { id: "log-2", tag: "LOGICA", q: "Si NO tengo hambre Y tengo dinero, ¿compro helado?", options: ["Sí", "No"], correct: 1, explain: "Regla AND: hace falta hambre Y dinero. Sin hambre → no compro, aunque haya dinero. Como la regla de mamá con el helado." },
];

function Ejercicios() {
  const [filter, setFilter] = useState<"ALL" | Ex["tag"]>("ALL");
  const [answered, setAnswered] = useState<Record<string, number>>({});
  const [rewarded, setRewarded] = useState<Record<string, true>>({});
  const [openExplain, setOpenExplain] = useState<Record<string, boolean>>({});

  // Read ?ej=<TAG> from the URL on mount and scroll into view.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ej = (params.get("ej") || "").toUpperCase();
    const allowed: Ex["tag"][] = ["HTML", "CSS", "JS", "DOM", "RED", "TERMINAL", "LOGICA"];
    if ((allowed as string[]).indexOf(ej) !== -1) {
      setFilter(ej as Ex["tag"]);
      setTimeout(() => {
        document.getElementById("ejercicios")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } else if (window.location.hash === "#ejercicios") {
      setTimeout(() => {
        document.getElementById("ejercicios")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, []);


  const list = filter === "ALL" ? EXERCISES : EXERCISES.filter((e) => e.tag === filter);
  const total = list.length;
  const correctCount = list.filter((e) => answered[e.id] === e.correct).length;

  const tags: Array<"ALL" | Ex["tag"]> = ["ALL", "HTML", "CSS", "JS", "DOM", "RED", "TERMINAL", "LOGICA"];
  const tagColor: Record<Ex["tag"], string> = {
    HTML: "#e34c26", CSS: "#264de4", JS: "#b8860b", DOM: "#008080",
    RED: "#000080", TERMINAL: "#000000", LOGICA: "#800080",
  };

  const answer = (ex: Ex, idx: number) => {
    if (answered[ex.id] !== undefined) return;
    setAnswered((a) => ({ ...a, [ex.id]: idx }));
    const ok = idx === ex.correct;
    if (ok) {
      sfx.correct();
      if (!rewarded[ex.id]) {
        addXP(10, `Ejercicio ${ex.tag}`);
        addCoins(1);
        setRewarded((r) => ({ ...r, [ex.id]: true }));
      }
    } else {
      sfx.wrong();
    }
  };

  return (
    <div id="ejercicios" className="mt-8 scroll-mt-4">
      <div className="w95-titlebar mb-0">
        <span>📚 Ejercicios interactivos — HTML · CSS · JS · DOM · Red · Terminal · Lógica</span>
        <span className="text-[11px]">{correctCount}/{total}</span>
      </div>
      <div className="w95-outset p-3">
        <div className="flex flex-wrap gap-1 mb-3 items-center">
          <span className="text-[12px] mr-1">Filtrar:</span>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`w95-btn text-[12px] ${filter === t ? "w95-btn-active" : ""}`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto text-[12px] opacity-80">Cada acierto = +10 XP · +1 🪙 (una vez)</span>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {list.map((ex) => {
            const chosen = answered[ex.id];
            const done = chosen !== undefined;
            const isCorrect = chosen === ex.correct;
            return (
              <div key={ex.id} className="w95-inset bg-white p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold text-white px-1.5 py-0.5"
                    style={{ background: tagColor[ex.tag] }}
                  >
                    {ex.tag}
                  </span>
                  <span className="text-[13px] font-bold flex-1">{ex.q}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {ex.options.map((opt, i) => {
                    const isChosen = chosen === i;
                    const isRight = ex.correct === i;
                    const bg =
                      !done ? undefined :
                      isRight ? "#ccffcc" :
                      isChosen ? "#ffcccc" : undefined;
                    return (
                      <button
                        key={i}
                        onClick={() => answer(ex, i)}
                        disabled={done}
                        className="w95-btn justify-start text-[12px] text-left"
                        style={{ background: bg }}
                      >
                        <span className="mono mr-2">{String.fromCharCode(65 + i)}.</span>
                        <span className="flex-1">{opt}</span>
                        {done && isRight && <span>✓</span>}
                        {done && isChosen && !isRight && <span>✗</span>}
                      </button>
                    );
                  })}
                </div>
                {done && (
                  <div
                    className="mt-2 p-2 text-[12px]"
                    style={{ background: isCorrect ? "#e6ffe6" : "#fff2e0", border: "1px solid #808080" }}
                  >
                    <b>{isCorrect ? "¡Correcto!" : "Casi…"}</b>
                    <div className="mt-1 whitespace-pre-line">{ex.explain}</div>
                  </div>
                )}
                {done && !isCorrect && (
                  <WhyBox
                    tag={ex.tag}
                    correctText={`${String.fromCharCode(65 + ex.correct)}. ${ex.options[ex.correct]}`}
                    correctExplain={ex.explain}
                    wrongText={`${String.fromCharCode(65 + (chosen as number))}. ${ex.options[chosen as number]}`}
                    wrongReasons={[
                      "no coincide con la afirmación correcta del enunciado",
                      "rompe alguna de las reglas del tema listadas abajo",
                    ]}
                  />
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  <W95Button
                    onClick={() =>
                      setOpenExplain((m) => ({ ...m, [ex.id]: !m[ex.id] }))
                    }
                  >
                    {openExplain[ex.id] ? "Ocultar explicación" : "🧠 Explicación"}
                  </W95Button>
                </div>
                {openExplain[ex.id] && (
                  <div className="mt-2 p-2 text-[12px]" style={{ background: "#eef4ff", border: "1px solid #808080" }}>
                    <div className="font-bold mb-2">🧠 Explicación de la pregunta y la respuesta</div>
                    <div className="mb-2">
                      <div className="mono text-[10px] uppercase opacity-70 mb-0.5">La pregunta pide</div>
                      <div className="font-medium">{ex.q}</div>
                    </div>
                    <div className="mb-2">
                      <div className="mono text-[10px] uppercase opacity-70 mb-0.5">Cómo pensarlo</div>
                      <div className="whitespace-pre-line">{ex.explain}</div>
                    </div>
                    <div>
                      <div className="mono text-[10px] uppercase opacity-70 mb-0.5">Respuesta correcta</div>
                      <div className="font-medium">
                        {String.fromCharCode(65 + ex.correct)}. {ex.options[ex.correct]}
                      </div>
                    </div>
                  </div>
                )}
                <RulesBox tag={ex.tag} defaultOpen={done && !isCorrect} compact />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Node({ title, sub, children, active, disabled }: { title: string; sub: string; children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return (
    <div className={`w95-outset p-3 ${disabled ? "opacity-50" : ""}`} style={{ background: active ? "#e8e8ff" : "var(--w95-face)" }}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-base font-bold">{title}</div>
        <div className="mono text-[10px] uppercase opacity-70">{sub}</div>
      </div>
      <div className="w95-inset bg-white p-2 min-h-[60px]">{children}</div>
    </div>
  );
}

/* ---------- Code-writing exercises ---------- */

type CodeEx = {
  id: string;
  tag: "HTML" | "CSS" | "JS" | "TERMINAL" | "DOM";
  q: string;
  hint?: string;
  placeholder: string;
  starter?: string;
  accept: RegExp[][];
  explain: string;
  preview?: "html";
};

const CODE_EXERCISES: CodeEx[] = [
  {
    id: "c-html-1", tag: "HTML",
    q: "Escribe un título principal que diga: Hola mundo",
    hint: "Usa la etiqueta <h1>…</h1>",
    placeholder: "<h1>Hola mundo</h1>",
    accept: [[/^<h1>\s*hola\s+mundo\s*<\/h1>$/i]],
    explain: "1) ¿Qué me pide? Un título principal visible con el texto Hola mundo.\n2) ¿Persona? Pondría el texto más grande e importante de la página.\n3) Algoritmo: abrir título principal → escribir Hola mundo → cerrar.\n4) Traducir: <h1>Hola mundo</h1>",
    preview: "html",
  },
  {
    id: "c-html-2", tag: "HTML",
    q: "Crea un enlace a https://google.com con el texto: Buscar",
    hint: "Etiqueta <a> con atributo href",
    placeholder: '<a href="https://google.com">Buscar</a>',
    accept: [[/<a\s+href=["']https:\/\/google\.com["']\s*>\s*buscar\s*<\/a>/i]],
    explain: "1) ¿Qué me pide? Un enlace clicable que diga Buscar y vaya a Google.\n2) ¿Persona? Un cartel «Buscar» con la dirección detrás.\n3) Algoritmo: crear enlace → indicar destino → poner texto visible → cerrar.\n4) Traducir: <a href=\"https://google.com\">Buscar</a>",
    preview: "html",
  },
  {
    id: "c-html-3", tag: "HTML",
    q: "Muestra una imagen 'gato.jpg' con texto alternativo: Un gato",
    hint: "Etiqueta <img> con src y alt",
    placeholder: '<img src="gato.jpg" alt="Un gato">',
    accept: [
      [/<img\s+[^>]*src=["']gato\.jpg["'][^>]*alt=["']un\s+gato["'][^>]*\/?>/i],
      [/<img\s+[^>]*alt=["']un\s+gato["'][^>]*src=["']gato\.jpg["'][^>]*\/?>/i],
    ],
    explain: "1) ¿Qué me pide? Mostrar gato.jpg y, si no carga, que diga Un gato.\n2) ¿Persona? Colgar la foto y escribir una etiqueta debajo por si falta.\n3) Algoritmo: imagen → archivo (src) → descripción (alt).\n4) Traducir: <img src=\"gato.jpg\" alt=\"Un gato\">",
    preview: "html",
  },
  {
    id: "c-html-4", tag: "HTML",
    q: "Escribe una lista ordenada con dos elementos: Uno y Dos",
    hint: "<ol> con dos <li> dentro",
    placeholder: "<ol><li>Uno</li><li>Dos</li></ol>",
    accept: [[/<ol>\s*<li>\s*uno\s*<\/li>\s*<li>\s*dos\s*<\/li>\s*<\/ol>/i]],
    explain: "1) ¿Qué me pide? Lista numerada con Uno y Dos.\n2) ¿Persona? Escribiría 1. Uno  2. Dos.\n3) Algoritmo: abrir lista ordenada → ítem Uno → ítem Dos → cerrar lista.\n4) Traducir: <ol><li>Uno</li><li>Dos</li></ol>",
    preview: "html",
  },
  {
    id: "c-css-1", tag: "CSS",
    q: "Pinta el texto de rojo (solo la regla CSS)",
    placeholder: "color: red;",
    accept: [[/^color\s*:\s*red\s*;?\s*$/i]],
    explain: "1) ¿Qué me pide? Que las letras se vean rojas.\n2) ¿Persona? Cogería un marcador rojo y pintaría el texto (no el fondo).\n3) Algoritmo: elegir propiedad de color de texto → valor red.\n4) Traducir: color: red;",
  },
  {
    id: "c-css-2", tag: "CSS",
    q: "Selecciona la clase 'btn' y pon el fondo azul",
    hint: ".clase { propiedad: valor; }",
    placeholder: ".btn { background: blue; }",
    accept: [[/^\.btn\s*\{\s*background(-color)?\s*:\s*blue\s*;?\s*\}$/i]],
    explain: "1) ¿Qué me pide? Todos los .btn con fondo azul.\n2) ¿Persona? Buscar el grupo etiquetado btn y pintarles el fondo.\n3) Algoritmo: seleccionar clase btn → dentro, fondo = azul.\n4) Traducir: .btn { background: blue; }",
  },
  {
    id: "c-css-3", tag: "CSS",
    q: "Centra con flex (escribe las 3 propiedades)",
    hint: "display, justify-content, align-items",
    placeholder: "display: flex;\njustify-content: center;\nalign-items: center;",
    accept: [[/display\s*:\s*flex\s*;/i, /justify-content\s*:\s*center\s*;/i, /align-items\s*:\s*center\s*;/i]],
    explain: "1) ¿Qué me pide? Centrar el contenido con flex.\n2) ¿Persona? Activar modo fila y empujar al centro en horizontal y vertical.\n3) Algoritmo: activar flex → centrar eje X → centrar eje Y.\n4) Traducir: display: flex;  justify-content: center;  align-items: center;",
  },
  {
    id: "c-js-1", tag: "JS",
    q: "Declara una constante 'nombre' con el valor 'Ada'",
    placeholder: "const nombre = 'Ada';",
    accept: [[/^const\s+nombre\s*=\s*['"`]ada['"`]\s*;?\s*$/i]],
    explain: "1) ¿Qué me pide? Guardar el texto Ada en una caja llamada nombre que no se reasigne.\n2) ¿Persona? Etiquetar un frasco sellado «nombre» con Ada adentro.\n3) Algoritmo: crear constante nombre → valor texto Ada.\n4) Traducir: const nombre = 'Ada';",
  },
  {
    id: "c-js-2", tag: "JS",
    q: "Muestra en consola el texto: Hola",
    placeholder: "console.log('Hola');",
    accept: [[/^console\.log\(\s*['"`]hola['"`]\s*\)\s*;?\s*$/i]],
    explain: "1) ¿Qué me pide? Imprimir Hola en la consola.\n2) ¿Persona? Decirle al ayudante: «muéstrame la palabra Hola».\n3) Algoritmo: ejecutar la acción mostrar → con el texto Hola.\n4) Traducir: console.log('Hola');",
  },
  {
    id: "c-js-3", tag: "JS",
    q: "Escribe un if que compruebe si 'edad' es mayor o igual a 18",
    hint: "if (condición) { ... }",
    placeholder: "if (edad >= 18) { console.log('adulto'); }",
    accept: [[/if\s*\(\s*edad\s*>=\s*18\s*\)\s*\{[^}]*\}/i]],
    explain: "1) ¿Qué me pide? Solo actuar si edad ≥ 18.\n2) ¿Persona? Mirar la edad; si llega a 18, hacer algo.\n3) Algoritmo: si edad >= 18 → mostrar adulto.\n4) Traducir: if (edad >= 18) { console.log('adulto'); }",
  },
  {
    id: "c-js-4", tag: "JS",
    q: "Un bucle for de 0 a 4 que imprima i",
    placeholder: "for (let i = 0; i < 5; i++) { console.log(i); }",
    accept: [[/for\s*\(\s*let\s+i\s*=\s*0\s*;\s*i\s*<\s*5\s*;\s*i\+\+\s*\)\s*\{[^}]*console\.log\(\s*i\s*\)[^}]*\}/i]],
    explain: "1) ¿Qué me pide? Mostrar 0,1,2,3,4.\n2) ¿Persona? Empezar en 0, decir el número, subir 1, repetir hasta antes de 5.\n3) Algoritmo: i=0; mientras i<5; mostrar i; i++.\n4) Traducir: for (let i = 0; i < 5; i++) { console.log(i); }",
  },
  {
    id: "c-js-5", tag: "JS",
    q: "Define saludar(nombre) que retorne 'Hola ' + nombre",
    placeholder: "function saludar(nombre) { return 'Hola ' + nombre; }",
    accept: [
      [/function\s+saludar\s*\(\s*nombre\s*\)\s*\{\s*return\s+['"`]hola\s+['"`]\s*\+\s*nombre\s*;?\s*\}/i],
      [/const\s+saludar\s*=\s*\(?\s*nombre\s*\)?\s*=>\s*['"`]hola\s+['"`]\s*\+\s*nombre/i],
    ],
    explain: "1) ¿Qué me pide? Una receta que, con un nombre, devuelva «Hola » + ese nombre.\n2) ¿Persona? Plantilla: Hola ___ ; rellenar el hueco.\n3) Algoritmo: función saludar(nombre) → devolver «Hola » + nombre.\n4) Traducir: function saludar(nombre) { return 'Hola ' + nombre; }",
  },
  {
    id: "c-term-1", tag: "TERMINAL",
    q: "Pregunta al DNS por la IP de google.com",
    placeholder: "nslookup google.com",
    accept: [[/^nslookup\s+google\.com\s*$/i]],
    explain: "Qué hace: pregunta al DNS el número (IP) de ese nombre. Analogía: buscar el teléfono en la guía, sin marcar todavía.",
  },
  {
    id: "c-term-2", tag: "TERMINAL",
    q: "Envía pings a google.com",
    placeholder: "ping google.com",
    accept: [[/^ping\s+(-c\s*\d+\s+)?google\.com\s*$/i]],
    explain: "Qué hace: resuelve y además «llama» a ver si contesta. Por qué: comprobar si el host está vivo, no solo si existe el nombre.",
  },
  {
    id: "c-term-3", tag: "TERMINAL",
    q: "Muestra el contenido de la carpeta actual (Linux/Mac)",
    placeholder: "ls",
    accept: [[/^ls(\s+-\w+)?\s*$/i]],
    explain: "ls = list (listar). Por qué: ver qué hay en el cajón actual. En Windows CMD el hermano es dir.",
  },
  {
    id: "c-term-4", tag: "TERMINAL",
    q: "Cambia a la carpeta 'proyectos'",
    placeholder: "cd proyectos",
    accept: [[/^cd\s+proyectos\/?\s*$/i]],
    explain: "cd = Change Directory: entrar a otra carpeta. cd .. = subir un nivel (como subir un piso en el edificio de carpetas).",
  },

  /* ===== JS · typeof, concatenación, const/let, arrays, objetos ===== */
  {
    id: "c-js-typeof-1", tag: "JS",
    q: "🐛 BUG: `let esNumero = typeof cantidad === 'Number';` siempre da false. Corrige la línea (cantidad = 10, esperado true).",
    hint: "typeof SIEMPRE devuelve el nombre del tipo en minúsculas.",
    placeholder: "let esNumero = typeof cantidad === 'number';",
    starter: "let esNumero = typeof cantidad === 'Number';",
    accept: [[/let\s+esNumero\s*=\s*typeof\s+cantidad\s*===\s*['"`]number['"`]\s*;?/i]],
    explain: "1) ¿Qué me pide? Que esNumero sea true cuando cantidad es un número.\n2) ¿Persona? Preguntar el tipo y comparar con la etiqueta correcta en minúsculas.\n3) Algoritmo: tipo = typeof cantidad; ¿tipo === 'number'?\n4) Traducir: let esNumero = typeof cantidad === 'number';",
  },
  {
    id: "c-js-typeof-2", tag: "JS",
    q: "Comprueba con typeof si la variable 'texto' es un string (guárdalo en esTexto).",
    hint: "typeof devuelve 'string', 'number', 'boolean', 'undefined'…",
    placeholder: "let esTexto = typeof texto === 'string';",
    accept: [[/let\s+esTexto\s*=\s*typeof\s+texto\s*===\s*['"`]string['"`]\s*;?/i]],
    explain: "1) ¿Qué me pide? Saber si texto es string y guardarlo en esTexto.\n2) ¿Persona? Preguntar categoría → ¿es texto? → sí/no.\n3) Algoritmo: comparar typeof texto con 'string' → guardar resultado.\n4) Traducir: let esTexto = typeof texto === 'string';",
  },
  {
    id: "c-js-concat-1", tag: "JS",
    q: "Une nombre y apellido con un espacio en medio y guárdalo en nombreCompleto.",
    hint: "Usa + para concatenar: nombre + ' ' + apellido",
    placeholder: "let nombreCompleto = nombre + ' ' + apellido;",
    accept: [[/let\s+nombreCompleto\s*=\s*nombre\s*\+\s*['"`]\s['"`]\s*\+\s*apellido\s*;?/i]],
    explain: "1) ¿Qué me pide? Pegar nombre + espacio + apellido en nombreCompleto.\n2) ¿Persona? Escribir Diego, dejar un espacio, escribir Torres.\n3) Algoritmo: unir nombre + ' ' + apellido → guardar.\n4) Traducir: let nombreCompleto = nombre + ' ' + apellido;",
  },
  {
    id: "c-js-concat-2", tag: "JS",
    q: "Añade nombreCompleto al final de la variable mensaje usando +=.",
    hint: "mensaje += algo → mensaje = mensaje + algo",
    placeholder: "mensaje += nombreCompleto;",
    accept: [[/^\s*mensaje\s*\+=\s*nombreCompleto\s*;?\s*$/i]],
    explain: "1) ¿Qué me pide? Pegar nombreCompleto al final de mensaje.\n2) ¿Persona? Tomar el texto que ya había y añadir más al final.\n3) Algoritmo: mensaje = mensaje + nombreCompleto (atajo +=).\n4) Traducir: mensaje += nombreCompleto;",
  },
  {
    id: "c-js-concat-3", tag: "JS",
    q: "🐛 BUG: precioUnitario es '3' (string) y cantidad es 10. `total = precioUnitario * cantidad` da '310'. Convierte precioUnitario a número.",
    hint: "Number(precioUnitario) convierte '3' en 3.",
    placeholder: "let total = Number(precioUnitario) * cantidad;",
    accept: [
      [/let\s+total\s*=\s*Number\s*\(\s*precioUnitario\s*\)\s*\*\s*cantidad\s*;?/i],
      [/let\s+total\s*=\s*parseInt\s*\(\s*precioUnitario\s*\)\s*\*\s*cantidad\s*;?/i],
      [/let\s+total\s*=\s*\+\s*precioUnitario\s*\*\s*cantidad\s*;?/i],
    ],
    explain: "1) ¿Qué me pide? Multiplicar bien: el '3' es texto y hay que volverlo número.\n2) ¿Persona? Borrar las comillas mentales: 3 × 10 = 30.\n3) Algoritmo: convertir precioUnitario a número → multiplicar por cantidad.\n4) Traducir: let total = Number(precioUnitario) * cantidad;",
  },
  {
    id: "c-js-constlet-1", tag: "JS",
    q: "🐛 BUG: `const precio = 100;` y luego `precio = 120;` lanza TypeError. Declara precio para que SÍ se pueda reasignar.",
    hint: "const no permite reasignar. Usa let.",
    placeholder: "let precio = 100;",
    starter: "const precio = 100;",
    accept: [[/^\s*let\s+precio\s*=\s*100\s*;?\s*$/i]],
    explain: "1) ¿Qué me pide? Que precio pueda cambiar después (100 → 120).\n2) ¿Persona? Usar un vaso normal, no un frasco sellado.\n3) Algoritmo: declarar precio con let (no const) = 100.\n4) Traducir: let precio = 100;",
  },
  {
    id: "c-js-array-1", tag: "JS",
    q: "Crea el array 'tareas' con 4 textos: Lavar platos, Sacar la basura, Limpiar el baño, Barrer.",
    hint: "Usa corchetes [ ] y comas entre elementos.",
    placeholder: "let tareas = ['Lavar platos', 'Sacar la basura', 'Limpiar el baño', 'Barrer'];",
    accept: [[/let\s+tareas\s*=\s*\[\s*['"`]lavar\s+platos['"`]\s*,\s*['"`]sacar\s+la\s+basura['"`]\s*,\s*['"`]limpiar\s+el\s+baño['"`]\s*,\s*['"`]barrer['"`]\s*\]\s*;?/i]],
    explain: "1) ¿Qué me pide? Una lista de 4 tareas con esos textos.\n2) ¿Persona? Escribiría una lista del súper con 4 renglones.\n3) Algoritmo: crear lista tareas = [texto1, texto2, texto3, texto4].\n4) Traducir: let tareas = ['Lavar platos', 'Sacar la basura', 'Limpiar el baño', 'Barrer'];",
  },
  {
    id: "c-js-array-2", tag: "JS",
    q: "Del array `let frutas = ['manzana','pera','uva'];` saca 'pera' y guárdalo en segunda.",
    hint: "El primer elemento es el índice 0, el segundo es el 1.",
    placeholder: "let segunda = frutas[1];",
    accept: [[/^\s*let\s+segunda\s*=\s*frutas\s*\[\s*1\s*\]\s*;?\s*$/i]],
    explain: "1) ¿Qué me pide? Guardar la pera (2.º casillero) en segunda.\n2) ¿Persona? Contar: 1.º manzana (0), 2.º pera (1).\n3) Algoritmo: segunda = frutas en posición 1.\n4) Traducir: let segunda = frutas[1];",
  },
  {
    id: "c-js-length-1", tag: "JS",
    q: "Guarda en 'cuantas' cuántos elementos tiene el array tareas.",
    hint: ".length es una PROPIEDAD (sin paréntesis).",
    placeholder: "let cuantas = tareas.length;",
    accept: [[/^\s*let\s+cuantas\s*=\s*tareas\.length\s*;?\s*$/i]],
    explain: "1) ¿Qué me pide? Contar cuántas tareas hay y guardar el número.\n2) ¿Persona? Mirar el cartel «hay N» (no hacer una acción).\n3) Algoritmo: cuantas = dato length de tareas (sin ()).\n4) Traducir: let cuantas = tareas.length;",
  },
  {
    id: "c-js-push-1", tag: "JS",
    q: "Agrega 'Trapear' al final del array tareas.",
    hint: ".push() es un método → lleva paréntesis.",
    placeholder: "tareas.push('Trapear');",
    accept: [[/^\s*tareas\.push\s*\(\s*['"`]trapear['"`]\s*\)\s*;?\s*$/i]],
    explain: "1) ¿Qué me pide? Meter Trapear al final de la lista.\n2) ¿Persona? Añadir un renglón nuevo al final de la lista.\n3) Algoritmo: ejecutar acción push con 'Trapear'.\n4) Traducir: tareas.push('Trapear');",
  },
  {
    id: "c-js-obj-1", tag: "JS",
    q: "Crea un objeto 'libro' con titulo: 'Cien años de soledad' y autor: 'García Márquez'.",
    hint: "Usa llaves { } y clave: valor separados por coma.",
    placeholder: "let libro = { titulo: 'Cien años de soledad', autor: 'García Márquez' };",
    accept: [[/let\s+libro\s*=\s*\{\s*titulo\s*:\s*['"`]cien\s+años\s+de\s+soledad['"`]\s*,\s*autor\s*:\s*['"`]garcía\s+márquez['"`]\s*\}\s*;?/i]],
    explain: "1) ¿Qué me pide? Una ficha libro con título y autor.\n2) ¿Persona? Llenar una ficha de biblioteca con dos etiquetas.\n3) Algoritmo: crear ficha { titulo: …, autor: … }.\n4) Traducir: let libro = { titulo: 'Cien años de soledad', autor: 'García Márquez' };",
  },
  {
    id: "c-js-obj-2", tag: "JS",
    q: "Del objeto libro, saca el título con notación de punto y guárdalo en 't'.",
    hint: "objeto.propiedad",
    placeholder: "let t = libro.titulo;",
    accept: [[/^\s*let\s+t\s*=\s*libro\.titulo\s*;?\s*$/i]],
    explain: "1) ¿Qué me pide? Leer el título de la ficha libro y guardarlo en t.\n2) ¿Persona? Buscar la etiqueta «titulo» en la ficha.\n3) Algoritmo: t = libro.titulo.\n4) Traducir: let t = libro.titulo;",
  },
  {
    id: "c-js-obj-3", tag: "JS",
    q: "Agrega el objeto libro al final del array 'biblioteca' (que ya existe).",
    hint: ".push() también acepta objetos.",
    placeholder: "biblioteca.push(libro);",
    accept: [[/^\s*biblioteca\.push\s*\(\s*libro\s*\)\s*;?\s*$/i]],
    explain: "1) ¿Qué me pide? Meter la ficha libro al final de la lista biblioteca.\n2) ¿Persona? Poner esa ficha al final del estante/lista.\n3) Algoritmo: push libro en biblioteca.\n4) Traducir: biblioteca.push(libro);",
  },

  /* ===== DOM · punto, textContent, getElementById ===== */
  {
    id: "c-dom-1", tag: "DOM",
    q: "Busca el elemento con id 'titulo' y guárdalo en una variable llamada titulo.",
    hint: "document.getElementById('…')",
    placeholder: 'let titulo = document.getElementById("titulo");',
    accept: [[/let\s+titulo\s*=\s*document\.getElementById\s*\(\s*['"`]titulo['"`]\s*\)\s*;?/i]],
    explain: "1) ¿Qué le digo? Documento, buscá el id titulo y guardalo.\n2) Cosa: document. Herramienta: getElementById.\n3) Traducir: let titulo = document.getElementById(\"titulo\");",
  },
  {
    id: "c-dom-2", tag: "DOM",
    q: "El elemento ya está en la variable mensaje. Cambia su texto a Adiós.",
    hint: "mensaje.textContent = …",
    placeholder: 'mensaje.textContent = "Adiós";',
    accept: [[/^\s*mensaje\.textContent\s*=\s*['"`]adiós['"`]\s*;?\s*$/i]],
    explain: "1) ¿Qué le digo? Al mensaje, cambiale el texto a Adiós.\n2) Cosa: mensaje. Característica: textContent.\n3) mensaje.textContent = \"Adiós\";",
  },
  {
    id: "c-dom-3", tag: "DOM",
    q: "Al elemento caja, agregale la clase activo.",
    hint: "classList.add",
    placeholder: 'caja.classList.add("activo");',
    accept: [[/^\s*caja\.classList\.add\s*\(\s*['"`]activo['"`]\s*\)\s*;?\s*$/i]],
    explain: "1) ¿Qué le digo? Pegale la calcomanía activo.\n2) classList = lista de clases. add = agregar.\n3) caja.classList.add(\"activo\");",
  },
  {
    id: "c-dom-4", tag: "DOM",
    q: "Cambia el color del texto del elemento titulo a red (rojo).",
    hint: "titulo.style.color",
    placeholder: 'titulo.style.color = "red";',
    accept: [[/^\s*titulo\.style\.color\s*=\s*['"`]red['"`]\s*;?\s*$/i]],
    explain: "1) ¿Qué le digo? Al título, en sus estilos, el color = rojo.\n2) Cadena: titulo → style → color.\n3) titulo.style.color = \"red\";",
  },
];

function EjerciciosCodigo() {
  const tags: Array<"ALL" | CodeEx["tag"]> = ["ALL", "HTML", "CSS", "JS", "DOM", "TERMINAL"];
  const [filter, setFilter] = useState<"ALL" | CodeEx["tag"]>("ALL");
  const [rewarded, setRewarded] = useState<Record<string, true>>({});
  const list = filter === "ALL" ? CODE_EXERCISES : CODE_EXERCISES.filter((e) => e.tag === filter);

  const tagColor: Record<CodeEx["tag"], string> = {
    HTML: "#e34c26", CSS: "#264de4", JS: "#b8860b", DOM: "#008080", TERMINAL: "#000000",
  };

  return (
    <div id="ejercicios-codigo" className="mt-8 scroll-mt-4">
      <div className="w95-titlebar mb-0">
        <span>⌨️ Ejercicios de código — escribe tú la respuesta</span>
        <span className="text-[11px]">{Object.keys(rewarded).length} resueltos</span>
      </div>
      <div className="w95-outset p-3">
        <div className="flex flex-wrap gap-1 mb-3 items-center">
          <span className="text-[12px] mr-1">Filtrar:</span>
          {tags.map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`w95-btn text-[12px] ${filter === t ? "w95-btn-active" : ""}`}>{t}</button>
          ))}
          <span className="ml-auto text-[12px] opacity-80">Cada acierto = +15 XP · +2 🪙 (una vez)</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {list.map((ex) => (
            <CodeCard
              key={ex.id}
              ex={ex}
              tagColor={tagColor[ex.tag]}
              rewarded={!!rewarded[ex.id]}
              onSolve={() => {
                if (rewarded[ex.id]) return;
                addXP(15, `Código ${ex.tag}`);
                addCoins(2);
                setRewarded((r) => ({ ...r, [ex.id]: true }));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function normalizeCode(s: string) { return s.replace(/\s+/g, " ").trim(); }

/** Genera pistas específicas comparando la respuesta del alumno con la solución esperada. */
function diagnose(user: string, ex: CodeEx): string[] {
  const tips: string[] = [];
  const u = user.trim();
  const sol = (ex.placeholder || "").trim();
  if (!u) return ["Escribe algo antes de comprobar."];

  const isJS = ex.tag === "JS";
  const isCSS = ex.tag === "CSS";
  const isHTML = ex.tag === "HTML";
  const isTerm = ex.tag === "TERMINAL";

  if (isJS || isCSS) {
    const oneLine = !u.includes("\n") && !u.trim().endsWith("}") && !u.trim().endsWith("{");
    if (oneLine && !u.trim().endsWith(";")) tips.push("Falta el punto y coma ; al final de la instrucción.");
  }
  const singles = (u.match(/'/g) || []).length;
  const doubles = (u.match(/"/g) || []).length;
  const backs = (u.match(/`/g) || []).length;
  if (singles % 2 !== 0) tips.push("Tienes una comilla simple ' sin cerrar. Los textos se abren y cierran con la MISMA comilla.");
  if (doubles % 2 !== 0) tips.push("Tienes una comilla doble \" sin cerrar.");
  if (backs % 2 !== 0) tips.push("Tienes una comilla invertida ` sin cerrar.");

  const pairs: Array<[string, string, string]> = [["(", ")", "paréntesis"], ["{", "}", "llaves"], ["[", "]", "corchetes"]];
  for (const [a, b, name] of pairs) {
    const na = (u.match(new RegExp("\\" + a, "g")) || []).length;
    const nb = (u.match(new RegExp("\\" + b, "g")) || []).length;
    if (na !== nb) tips.push(`Los ${name} no están equilibrados: ${na} de "${a}" y ${nb} de "${b}".`);
  }

  if (isJS) {
    if (/^\s*let\s+/.test(sol) && /^\s*const\s+/.test(u)) tips.push("Estás usando const, pero el valor va a cambiar → usa let.");
    if (/^\s*const\s+/.test(sol) && /^\s*let\s+/.test(u)) tips.push("Aquí el valor no cambia → mejor const en lugar de let.");
    if (/typeof/.test(u) && /['"`](Number|String|Boolean|Undefined|Object)['"`]/.test(u))
      tips.push("typeof devuelve el tipo en MINÚSCULAS: 'number', 'string', 'boolean'…");
    if (/\.length\s*\(/.test(u)) tips.push(".length es una PROPIEDAD, no un método: escríbelo SIN paréntesis.");
    if (/\.push(?!\s*\()/.test(u)) tips.push(".push es un MÉTODO: necesita paréntesis, por ejemplo .push('algo').");
    if (/\bvar\s+/.test(u)) tips.push("No uses var. Usa let (si cambia) o const (si no cambia).");
    if (/\[\s*1\s*\]/.test(u) && /\[\s*0\s*\]/.test(sol)) tips.push("Recuerda: los arrays empiezan en el índice 0, no en 1.");
    if (/\[\s*2\s*\]/.test(u) && /\[\s*1\s*\]/.test(sol)) tips.push("El SEGUNDO elemento está en el índice 1 (se cuenta desde 0).");
    if (/=\s*['"`]\d+['"`]/.test(u) && /=\s*\d+\s*;?/.test(sol))
      tips.push("Estás poniendo el número entre comillas: eso lo convierte en TEXTO. Los números van sin comillas.");
  }

  if (isCSS) {
    if (!/\{[\s\S]*\}/.test(u)) tips.push("Las reglas CSS van dentro de llaves { … }.");
    if (/\{[^:}]*\}/.test(u)) tips.push("Entre la propiedad y el valor van DOS PUNTOS: propiedad: valor;");
  }

  if (isHTML) {
    const opens = (u.match(/<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?>/g) || []).map((t) => t.replace(/[<>\/\s].*/g, "").toLowerCase()).filter(Boolean);
    const closes = (u.match(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g) || []).map((t) => t.replace(/[<>\/]/g, "").toLowerCase());
    const voids = new Set(["img", "br", "hr", "input", "meta", "link"]);
    for (const tag of opens) {
      if (voids.has(tag)) continue;
      const oc = opens.filter((x) => x === tag).length;
      const cc = closes.filter((x) => x === tag).length;
      if (oc > cc) { tips.push(`La etiqueta <${tag}> está abierta pero no cerrada con </${tag}>.`); break; }
    }
    if (/<img\b(?![^>]*\balt=)/i.test(u)) tips.push("Las imágenes deben llevar el atributo alt=\"…\" por accesibilidad.");
    if (/<a\b(?![^>]*\bhref=)/i.test(u)) tips.push("El enlace <a> necesita el atributo href=\"…\".");
    if (/=[^"'\s>][^\s>]*/.test(u)) tips.push("Los valores de los atributos van entre comillas: href=\"…\", src=\"…\".");
  }

  if (isTerm) {
    if (u.trim().endsWith(";")) tips.push("La terminal NO usa punto y coma al final del comando.");
  }

  const tokenize = (s: string) => s.match(/[A-Za-z_$][\w$]*|\d+|[()[\]{};=]/g) || [];
  const solTokens = tokenize(sol);
  const userTokens = tokenize(u);
  const seen = new Set(userTokens.map((t) => t.toLowerCase()));
  const missing: string[] = [];
  for (const t of solTokens) {
    if (t.length < 2 && !/[{}();=]/.test(t)) continue;
    if (!seen.has(t.toLowerCase()) && !missing.includes(t)) missing.push(t);
  }
  if (missing.length && missing.length <= 4) {
    tips.push(`Te faltan piezas de la solución: ${missing.slice(0, 4).map((m) => `\`${m}\``).join(", ")}.`);
  }

  if (tips.length === 0) tips.push("La estructura no coincide con lo que se pide. Revisa el orden y los símbolos (=, +, comillas, paréntesis).");
  return tips.slice(0, 5);
}

function CodeCard({ ex, tagColor, rewarded, onSolve }: { ex: CodeEx; tagColor: string; rewarded: boolean; onSolve: () => void }) {
  const [value, setValue] = useState(ex.starter ?? "");
  const [status, setStatus] = useState<"idle" | "ok" | "bad">("idle");
  const [showHint, setShowHint] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const check = () => {
    const norm = normalizeCode(value);
    if (!norm) { setStatus("bad"); setTips(["Escribe algo antes de comprobar."]); sfx.wrong(); return; }
    const ok = ex.accept.some((group) => group.every((rx) => rx.test(norm)));
    setStatus(ok ? "ok" : "bad");
    if (ok) { sfx.correct(); onSolve(); setTips([]); }
    else { sfx.wrong(); setTips(diagnose(value, ex)); setAttempts((n) => n + 1); }
  };

  const rows = Math.max(2, (ex.placeholder.match(/\n/g)?.length ?? 0) + 1);

  return (
    <div className="w95-inset bg-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold text-white px-1.5 py-0.5" style={{ background: tagColor }}>{ex.tag}</span>
        <span className="text-[13px] font-bold flex-1">{ex.q}</span>
        {rewarded && <span title="Ya premiado">🏆</span>}
      </div>
      <RulesBox tag={ex.tag} defaultOpen={status === "bad"} compact />
      <CodeEditor
        tag={ex.tag}
        value={value}
        onChange={(v) => { setValue(v); if (status !== "idle") { setStatus("idle"); setTips([]); } }}
        rows={rows}
        placeholder={ex.placeholder}
        className="w-full w95-inset bg-white p-2 mono text-[12px] outline-none resize-y"
        style={{ minHeight: 56 }}
      />

      <div className="flex flex-wrap items-center gap-1 mt-2">
        <W95Button onClick={check}>▶ Comprobar</W95Button>
        <W95Button onClick={() => { setValue(ex.placeholder); setStatus("idle"); setTips([]); }}>Ver ejemplo</W95Button>
        {ex.hint && <W95Button onClick={() => setShowHint((v) => !v)}>{showHint ? "Ocultar pista" : "💡 Pista"}</W95Button>}
        <W95Button onClick={() => setShowExplain((v) => !v)}>
          {showExplain ? "Ocultar explicación" : "🧠 Explicación"}
        </W95Button>
        {attempts >= 2 && !revealed && status !== "ok" && (
          <W95Button onClick={() => setRevealed(true)}>👀 Ver solución</W95Button>
        )}
        <W95Button onClick={() => { setValue(""); setStatus("idle"); setTips([]); }}>Limpiar</W95Button>
        {status === "ok" && <span className="ml-2 px-2 py-1 text-white text-[12px]" style={{ background: "#008000" }}>✓ Correcto</span>}
        {status === "bad" && <span className="ml-2 px-2 py-1 text-white text-[12px]" style={{ background: "#c00000" }}>✗ Intenta otra vez</span>}
      </div>
      {showHint && ex.hint && (
        <div className="mt-2 p-2 text-[12px]" style={{ background: "#ffffcc", border: "1px solid #808080" }}>💡 {ex.hint}</div>
      )}
      {showExplain && (
        <div className="mt-2 p-2 text-[12px]" style={{ background: "#eef4ff", border: "1px solid #808080" }}>
          <div className="font-bold mb-2">🧠 Explicación de la pregunta y la respuesta</div>
          <div className="mb-2">
            <div className="mono text-[10px] uppercase opacity-70 mb-0.5">La pregunta pide</div>
            <div className="font-medium">{ex.q}</div>
          </div>
          <div className="mb-2">
            <div className="mono text-[10px] uppercase opacity-70 mb-0.5">Cómo pensarlo (paso a paso)</div>
            <div className="whitespace-pre-line opacity-95">{ex.explain}</div>
          </div>
          <div>
            <div className="mono text-[10px] uppercase opacity-70 mb-0.5">Respuesta correcta</div>
            <pre className="w95-inset bg-white p-2 mono text-[11px] whitespace-pre-wrap break-words">{ex.placeholder}</pre>
          </div>
          <RulesBox tag={ex.tag} defaultOpen compact />
        </div>
      )}
      {status === "bad" && tips.length > 0 && (
        <div className="mt-2 p-2 text-[12px]" style={{ background: "#ffe6e6", border: "1px solid #808080" }}>
          <div className="font-bold mb-1">🔎 Qué revisar en tu respuesta:</div>
          <ul className="list-disc pl-5 space-y-0.5">
            {tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <div className="mt-2 grid md:grid-cols-2 gap-2">
            <div>
              <div className="mono text-[10px] uppercase opacity-70">Tu respuesta</div>
              <pre className="w95-inset bg-white p-1 mono text-[11px] whitespace-pre-wrap break-words">{value || "(vacío)"}</pre>
            </div>
            <div>
              <div className="mono text-[10px] uppercase opacity-70">Solución esperada</div>
              <pre className="w95-inset bg-white p-1 mono text-[11px] whitespace-pre-wrap break-words">
                {revealed ? ex.placeholder : ex.placeholder.replace(/[A-Za-z0-9áéíóúñÁÉÍÓÚÑ]/g, "•")}
              </pre>
              {!revealed && <div className="text-[10px] opacity-70 mt-1">Falla 2 veces para desbloquear la solución completa.</div>}
            </div>
          </div>
        </div>
      )}
      {status === "bad" && (
        <WhyBox
          tag={ex.tag}
          correctText={revealed ? ex.placeholder : undefined}
          correctExplain={ex.explain}
          wrongText={value || "(vacío)"}
          wrongReasons={tips}
        />
      )}
      {status === "ok" && (
        <div className="mt-2 p-2 text-[12px]" style={{ background: "#e6ffe6", border: "1px solid #808080" }}>
          <b>¡Bien!</b> <span className="whitespace-pre-line">{ex.explain}</span>
        </div>
      )}
      {ex.preview === "html" && value.trim() && (
        <div className="mt-2">
          <div className="mono text-[10px] uppercase opacity-70 mb-1">Vista previa</div>
          <div className="w95-inset bg-white p-2 text-black text-[13px]" dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      )}
    </div>
  );
}


