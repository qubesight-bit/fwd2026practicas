import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { W95Button } from "@/components/win95";
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
  { id: "html-1", tag: "HTML", q: "¿Cuál etiqueta crea el título más importante de una página?", options: ["<h6>", "<title>", "<h1>", "<head>"], correct: 2, explain: "<h1> es el encabezado principal visible. <title> es lo que aparece en la pestaña." },
  { id: "html-2", tag: "HTML", q: "¿Qué etiqueta se usa para un enlace a otra página?", options: ["<link>", "<a href='...'>", "<button>", "<url>"], correct: 1, explain: "<a href='https://...'> crea un hipervínculo. <link> sirve para conectar CSS o iconos." },
  { id: "html-3", tag: "HTML", q: "Para mostrar una imagen usamos…", options: ["<image src>", "<picture path>", "<img src='foto.jpg' alt='...'>", "<src img>"], correct: 2, explain: "La etiqueta es <img> y siempre debería llevar el atributo alt para accesibilidad." },
  { id: "html-4", tag: "HTML", q: "¿Cuál etiqueta representa una lista con orden (1, 2, 3)?", options: ["<ul>", "<ol>", "<list>", "<dl>"], correct: 1, explain: "<ol> = ordered list (numerada). <ul> = unordered list (viñetas)." },
  { id: "html-5", tag: "HTML", q: "El bloque genérico sin significado semántico es…", options: ["<section>", "<div>", "<article>", "<main>"], correct: 1, explain: "<div> es un contenedor neutro. Los otros describen el tipo de contenido." },

  { id: "css-1", tag: "CSS", q: "Para pintar el texto de rojo escribes…", options: ["font-color: red;", "text: red;", "color: red;", "background: red;"], correct: 2, explain: "La propiedad se llama color. background pinta el fondo." },
  { id: "css-2", tag: "CSS", q: "¿Qué selector aplica estilos a la clase 'btn'?", options: ["#btn", ".btn", "btn", "*btn"], correct: 1, explain: "El punto (.) selecciona clases. El # selecciona IDs." },
  { id: "css-3", tag: "CSS", q: "Para centrar horizontalmente un contenedor con flex…", options: ["align-items: center", "justify-content: center", "text-align: center", "margin: center"], correct: 1, explain: "justify-content controla el eje principal (horizontal por defecto). align-items el eje cruzado." },
  { id: "css-4", tag: "CSS", q: "El espacio dentro de la caja (entre borde y contenido) es…", options: ["margin", "padding", "border", "gap"], correct: 1, explain: "padding = espacio interior. margin = espacio exterior." },

  { id: "js-1", tag: "JS", q: "Se declara una variable que no cambia con…", options: ["var", "let", "const", "def"], correct: 2, explain: "const = constante. let = variable que puede cambiar. var es antiguo." },
  { id: "js-2", tag: "JS", q: "¿Cuál operador es 'Y lógico'?", options: ["||", "&&", "!", "=="], correct: 1, explain: "&& = AND (los dos verdaderos). || = OR. ! = NOT." },
  { id: "js-3", tag: "JS", q: "Un bucle que repite mientras se cumple una condición es…", options: ["for-in", "while", "if", "switch"], correct: 1, explain: "while(condición) { ... } repite hasta que la condición sea falsa." },
  { id: "js-4", tag: "JS", q: "La tabla de verdad de (true && false) da…", options: ["true", "false", "error", "null"], correct: 1, explain: "AND requiere que AMBOS sean true. Si uno es false, el resultado es false." },
  { id: "js-5", tag: "JS", q: "!(true || false) es…", options: ["true", "false"], correct: 1, explain: "true || false = true. Luego !true = false." },

  { id: "dom-1", tag: "DOM", q: "El DOM es…", options: ["Un lenguaje de programación", "Un árbol con todas las etiquetas HTML de la página", "Una base de datos", "Un servidor web"], correct: 1, explain: "El DOM (Document Object Model) es la representación en árbol del HTML que JavaScript puede leer y modificar." },
  { id: "dom-2", tag: "DOM", q: "Para cambiar el texto de un elemento usas…", options: ["element.color", "element.textContent", "element.href", "element.type"], correct: 1, explain: "textContent reemplaza el texto interior del nodo." },
  { id: "dom-3", tag: "DOM", q: "document.querySelector('.card') devuelve…", options: ["Todos los .card", "El primer elemento con clase card", "Solo los ID", "Null siempre"], correct: 1, explain: "querySelector devuelve el primero que coincide. querySelectorAll devuelve todos." },

  { id: "red-1", tag: "RED", q: "El DNS traduce…", options: ["HTML a CSS", "Nombre de dominio a dirección IP", "IP a MAC", "URL a HTTPS"], correct: 1, explain: "DNS = guía telefónica: convierte 'google.com' en una IP como 142.250.185.78." },
  { id: "red-2", tag: "RED", q: "El código 404 significa…", options: ["Sin permiso", "Servidor caído", "Recurso no encontrado", "Todo OK"], correct: 2, explain: "404 = la URL específica no existe en ese servidor." },
  { id: "red-3", tag: "RED", q: "El código 500 dice que…", options: ["El navegador falló", "El servidor tuvo un error interno", "No hay internet", "El DNS falló"], correct: 1, explain: "5xx = culpa del servidor. 4xx = culpa (o error) del cliente." },
  { id: "red-4", tag: "RED", q: "Un ERR_NAME_NOT_RESOLVED es…", options: ["Error HTTP 500", "Error DNS: no encontró la IP", "Error CSS", "Error 404"], correct: 1, explain: "Sin IP no hay a dónde enviar la petición: falla antes de salir a internet." },
  { id: "red-5", tag: "RED", q: "El código 301 significa…", options: ["Prohibido", "Redirección permanente", "No hay contenido", "Servidor lento"], correct: 1, explain: "301 = la página se movió para siempre a otra URL." },
  { id: "red-6", tag: "RED", q: "429 aparece cuando…", options: ["Envías demasiadas peticiones", "El servidor está caído", "No tienes cuenta", "La URL está mal"], correct: 0, explain: "429 Too Many Requests = te frenaron por spam de peticiones (rate limit)." },

  { id: "term-1", tag: "TERMINAL", q: "Para ver la IP de un dominio usas…", options: ["ping", "nslookup", "cd", "ls"], correct: 1, explain: "nslookup pregunta al DNS. ping mide si el host responde." },
  { id: "term-2", tag: "TERMINAL", q: "Para cambiar de carpeta en la terminal usas…", options: ["mv", "cd", "ls", "rm"], correct: 1, explain: "cd = change directory. ls (o dir en Windows) muestra el contenido." },
  { id: "term-3", tag: "TERMINAL", q: "Para probar si un servidor responde envías…", options: ["ping google.com", "css google.com", "dns google.com", "html google.com"], correct: 0, explain: "ping envía pequeños paquetes ICMP y mide el tiempo de ida y vuelta." },

  { id: "log-1", tag: "LOGICA", q: "(true || false) && !false =", options: ["true", "false"], correct: 0, explain: "true||false=true; !false=true; true&&true = true." },
  { id: "log-2", tag: "LOGICA", q: "Si NO tengo hambre Y tengo dinero, ¿compro helado?", options: ["Sí", "No"], correct: 1, explain: "Regla: compro si tengo hambre Y dinero. Sin hambre, no compro aunque haya dinero." },
];

function Ejercicios() {
  const [filter, setFilter] = useState<"ALL" | Ex["tag"]>("ALL");
  const [answered, setAnswered] = useState<Record<string, number>>({});
  const [rewarded, setRewarded] = useState<Record<string, true>>({});

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
                    <b>{isCorrect ? "¡Correcto!" : "Casi…"}</b> {ex.explain}
                  </div>
                )}
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
  tag: "HTML" | "CSS" | "JS" | "TERMINAL";
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
    explain: "<h1> es el título más importante de la página.",
    preview: "html",
  },
  {
    id: "c-html-2", tag: "HTML",
    q: "Crea un enlace a https://google.com con el texto: Buscar",
    hint: "Etiqueta <a> con atributo href",
    placeholder: '<a href="https://google.com">Buscar</a>',
    accept: [[/<a\s+href=["']https:\/\/google\.com["']\s*>\s*buscar\s*<\/a>/i]],
    explain: "<a href='URL'>texto</a> crea un hipervínculo.",
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
    explain: "El atributo alt describe la imagen para lectores y accesibilidad.",
    preview: "html",
  },
  {
    id: "c-html-4", tag: "HTML",
    q: "Escribe una lista ordenada con dos elementos: Uno y Dos",
    hint: "<ol> con dos <li> dentro",
    placeholder: "<ol><li>Uno</li><li>Dos</li></ol>",
    accept: [[/<ol>\s*<li>\s*uno\s*<\/li>\s*<li>\s*dos\s*<\/li>\s*<\/ol>/i]],
    explain: "<ol> = lista numerada. Cada punto va en <li>.",
    preview: "html",
  },
  {
    id: "c-css-1", tag: "CSS",
    q: "Pinta el texto de rojo (solo la regla CSS)",
    placeholder: "color: red;",
    accept: [[/^color\s*:\s*red\s*;?\s*$/i]],
    explain: "La propiedad se llama color, no font-color.",
  },
  {
    id: "c-css-2", tag: "CSS",
    q: "Selecciona la clase 'btn' y pon el fondo azul",
    hint: ".clase { propiedad: valor; }",
    placeholder: ".btn { background: blue; }",
    accept: [[/^\.btn\s*\{\s*background(-color)?\s*:\s*blue\s*;?\s*\}$/i]],
    explain: "El punto (.) selecciona clases. background pinta el fondo.",
  },
  {
    id: "c-css-3", tag: "CSS",
    q: "Centra con flex (escribe las 3 propiedades)",
    hint: "display, justify-content, align-items",
    placeholder: "display: flex;\njustify-content: center;\nalign-items: center;",
    accept: [[/display\s*:\s*flex\s*;/i, /justify-content\s*:\s*center\s*;/i, /align-items\s*:\s*center\s*;/i]],
    explain: "flex + justify-content (eje X) + align-items (eje Y) = centrado perfecto.",
  },
  {
    id: "c-js-1", tag: "JS",
    q: "Declara una constante 'nombre' con el valor 'Ada'",
    placeholder: "const nombre = 'Ada';",
    accept: [[/^const\s+nombre\s*=\s*['"`]ada['"`]\s*;?\s*$/i]],
    explain: "const = valor que no cambia. Cadenas entre comillas.",
  },
  {
    id: "c-js-2", tag: "JS",
    q: "Muestra en consola el texto: Hola",
    placeholder: "console.log('Hola');",
    accept: [[/^console\.log\(\s*['"`]hola['"`]\s*\)\s*;?\s*$/i]],
    explain: "console.log() imprime en la consola del navegador.",
  },
  {
    id: "c-js-3", tag: "JS",
    q: "Escribe un if que compruebe si 'edad' es mayor o igual a 18",
    hint: "if (condición) { ... }",
    placeholder: "if (edad >= 18) { console.log('adulto'); }",
    accept: [[/if\s*\(\s*edad\s*>=\s*18\s*\)\s*\{[^}]*\}/i]],
    explain: ">= significa mayor o igual. La condición va entre paréntesis.",
  },
  {
    id: "c-js-4", tag: "JS",
    q: "Un bucle for de 0 a 4 que imprima i",
    placeholder: "for (let i = 0; i < 5; i++) { console.log(i); }",
    accept: [[/for\s*\(\s*let\s+i\s*=\s*0\s*;\s*i\s*<\s*5\s*;\s*i\+\+\s*\)\s*\{[^}]*console\.log\(\s*i\s*\)[^}]*\}/i]],
    explain: "for (inicio; condición; paso). i++ suma 1 cada vuelta.",
  },
  {
    id: "c-js-5", tag: "JS",
    q: "Define saludar(nombre) que retorne 'Hola ' + nombre",
    placeholder: "function saludar(nombre) { return 'Hola ' + nombre; }",
    accept: [
      [/function\s+saludar\s*\(\s*nombre\s*\)\s*\{\s*return\s+['"`]hola\s+['"`]\s*\+\s*nombre\s*;?\s*\}/i],
      [/const\s+saludar\s*=\s*\(?\s*nombre\s*\)?\s*=>\s*['"`]hola\s+['"`]\s*\+\s*nombre/i],
    ],
    explain: "function nombre(param) { return … } o una arrow: (n) => 'Hola ' + n.",
  },
  {
    id: "c-term-1", tag: "TERMINAL",
    q: "Pregunta al DNS por la IP de google.com",
    placeholder: "nslookup google.com",
    accept: [[/^nslookup\s+google\.com\s*$/i]],
    explain: "nslookup consulta el DNS y muestra la(s) IP(s) del dominio.",
  },
  {
    id: "c-term-2", tag: "TERMINAL",
    q: "Envía pings a google.com",
    placeholder: "ping google.com",
    accept: [[/^ping\s+(-c\s*\d+\s+)?google\.com\s*$/i]],
    explain: "ping envía paquetes ICMP y mide el tiempo de respuesta.",
  },
  {
    id: "c-term-3", tag: "TERMINAL",
    q: "Muestra el contenido de la carpeta actual (Linux/Mac)",
    placeholder: "ls",
    accept: [[/^ls(\s+-\w+)?\s*$/i]],
    explain: "ls lista archivos. En Windows CMD sería 'dir'.",
  },
  {
    id: "c-term-4", tag: "TERMINAL",
    q: "Cambia a la carpeta 'proyectos'",
    placeholder: "cd proyectos",
    accept: [[/^cd\s+proyectos\/?\s*$/i]],
    explain: "cd = change directory. Con cd .. subes un nivel.",
  },
];

function EjerciciosCodigo() {
  const tags: Array<"ALL" | CodeEx["tag"]> = ["ALL", "HTML", "CSS", "JS", "TERMINAL"];
  const [filter, setFilter] = useState<"ALL" | CodeEx["tag"]>("ALL");
  const [rewarded, setRewarded] = useState<Record<string, true>>({});
  const list = filter === "ALL" ? CODE_EXERCISES : CODE_EXERCISES.filter((e) => e.tag === filter);

  const tagColor: Record<CodeEx["tag"], string> = {
    HTML: "#e34c26", CSS: "#264de4", JS: "#b8860b", TERMINAL: "#000000",
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

function CodeCard({ ex, tagColor, rewarded, onSolve }: { ex: CodeEx; tagColor: string; rewarded: boolean; onSolve: () => void }) {
  const [value, setValue] = useState(ex.starter ?? "");
  const [status, setStatus] = useState<"idle" | "ok" | "bad">("idle");
  const [showHint, setShowHint] = useState(false);

  const check = () => {
    const norm = normalizeCode(value);
    if (!norm) { setStatus("bad"); sfx.wrong(); return; }
    const ok = ex.accept.some((group) => group.every((rx) => rx.test(norm)));
    setStatus(ok ? "ok" : "bad");
    if (ok) { sfx.correct(); onSolve(); } else { sfx.wrong(); }
  };

  const rows = Math.max(2, (ex.placeholder.match(/\n/g)?.length ?? 0) + 1);

  return (
    <div className="w95-inset bg-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold text-white px-1.5 py-0.5" style={{ background: tagColor }}>{ex.tag}</span>
        <span className="text-[13px] font-bold flex-1">{ex.q}</span>
        {rewarded && <span title="Ya premiado">🏆</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); if (status !== "idle") setStatus("idle"); }}
        spellCheck={false}
        rows={rows}
        placeholder={ex.placeholder}
        className="w-full w95-inset bg-white p-2 mono text-[12px] outline-none resize-y"
        style={{ minHeight: 56 }}
      />
      <div className="flex flex-wrap items-center gap-1 mt-2">
        <W95Button onClick={check}>▶ Comprobar</W95Button>
        <W95Button onClick={() => { setValue(ex.placeholder); setStatus("idle"); }}>Ver ejemplo</W95Button>
        {ex.hint && <W95Button onClick={() => setShowHint((v) => !v)}>{showHint ? "Ocultar pista" : "💡 Pista"}</W95Button>}
        <W95Button onClick={() => { setValue(""); setStatus("idle"); }}>Limpiar</W95Button>
        {status === "ok" && <span className="ml-2 px-2 py-1 text-white text-[12px]" style={{ background: "#008000" }}>✓ Correcto</span>}
        {status === "bad" && <span className="ml-2 px-2 py-1 text-white text-[12px]" style={{ background: "#c00000" }}>✗ Intenta otra vez</span>}
      </div>
      {showHint && ex.hint && (
        <div className="mt-2 p-2 text-[12px]" style={{ background: "#ffffcc", border: "1px solid #808080" }}>💡 {ex.hint}</div>
      )}
      {status === "ok" && (
        <div className="mt-2 p-2 text-[12px]" style={{ background: "#e6ffe6", border: "1px solid #808080" }}>
          <b>¡Bien!</b> {ex.explain}
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

