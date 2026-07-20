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
