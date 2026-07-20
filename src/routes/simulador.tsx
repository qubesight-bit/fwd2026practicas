import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

export const Route = createFileRoute("/simulador")({
  head: () => ({
    meta: [
      { title: "Simulador DNS y HTTP — paso a paso" },
      { name: "description", content: "Escribe un dominio y observa cómo el navegador consulta al DNS, encuentra la IP y recibe la respuesta HTTP. Con escenarios de éxito y error." },
    ],
  }),
  component: Simulator,
});

type Scenario = {
  domain: string;
  label: string;
  ip: string | null;         // null → NXDOMAIN
  httpCode: number | null;   // null → nunca llega
  httpText: string;
  narrative: string;
};

const SCENARIOS: Scenario[] = [
  { domain: "google.com",              label: "Éxito clásico",     ip: "142.250.185.78", httpCode: 200, httpText: "OK",                    narrative: "Todo funciona. La página carga." },
  { domain: "example.com",             label: "Éxito clásico",     ip: "93.184.216.34",  httpCode: 200, httpText: "OK",                    narrative: "El dominio existe, el servidor contesta bien." },
  { domain: "github.com/no-existe",    label: "Recurso faltante",  ip: "140.82.121.4",   httpCode: 404, httpText: "Not Found",             narrative: "Llegamos al servidor, pero esa ruta no existe." },
  { domain: "sitio-privado.com",       label: "Acceso denegado",   ip: "203.0.113.42",   httpCode: 403, httpText: "Forbidden",             narrative: "El servidor te ubicó, pero no tienes permiso." },
  { domain: "app-caida.com",           label: "Servidor roto",     ip: "198.51.100.7",   httpCode: 500, httpText: "Internal Server Error", narrative: "El servidor existe pero su código falló." },
  { domain: "gateway-lenta.com",       label: "Intermediario",     ip: "198.51.100.9",   httpCode: 502, httpText: "Bad Gateway",           narrative: "Un intermediario recibió una respuesta inválida." },
  { domain: "mantenimiento.com",       label: "En pausa",          ip: "198.51.100.11",  httpCode: 503, httpText: "Service Unavailable",   narrative: "Servidor saturado o en mantenimiento." },
  { domain: "esto-no-existe-xyz.zzz",  label: "DNS falla",         ip: null,             httpCode: null, httpText: "",                     narrative: "El DNS no encontró el dominio. La petición nunca sale." },
];

function pickScenario(input: string): Scenario {
  const norm = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const exact = SCENARIOS.find((s) => s.domain === norm);
  if (exact) return exact;
  // heuristic for unknown domains
  if (!norm || norm.length < 3 || !norm.includes(".")) {
    return { ...SCENARIOS[SCENARIOS.length - 1], domain: input || "?" };
  }
  if (/^(xn--|.*\.(zzz|invalid|test|localdomain))/.test(norm)) {
    return { ...SCENARIOS[SCENARIOS.length - 1], domain: norm };
  }
  // fake success for anything reasonable
  const h = [...norm].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const ip = `${(h % 223) + 1}.${(h >> 3) % 255}.${(h >> 7) % 255}.${(h >> 11) % 255}`;
  return { domain: norm, label: "Éxito simulado", ip, httpCode: 200, httpText: "OK", narrative: "Dominio válido — DNS resolvió y el servidor respondió." };
}

type Step = "idle" | "dns" | "dns-done" | "http" | "done";

function Simulator() {
  const [input, setInput] = useState("google.com");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [step, setStep] = useState<Step>("idle");

  const run = useCallback((domain?: string) => {
    const value = (domain ?? input).trim();
    if (!value) return;
    if (domain) setInput(domain);
    const s = pickScenario(value);
    setScenario(s);
    setStep("dns");
  }, [input]);

  useEffect(() => {
    if (!scenario) return;
    if (step === "dns") {
      const t = setTimeout(() => setStep("dns-done"), 1100);
      return () => clearTimeout(t);
    }
    if (step === "dns-done") {
      const t = setTimeout(() => setStep(scenario.ip ? "http" : "done"), 700);
      return () => clearTimeout(t);
    }
    if (step === "http") {
      const t = setTimeout(() => setStep("done"), 1300);
      return () => clearTimeout(t);
    }
  }, [step, scenario]);

  const dnsOk = scenario && scenario.ip !== null;
  const httpOk = scenario && scenario.httpCode === 200;

  return (
    <main className="max-w-[1200px] mx-auto px-6 md:px-10 pt-14 md:pt-20">
      <div className="kicker mb-6">Interactivo</div>
      <h1 className="text-5xl md:text-7xl mb-4">Simulador <em>DNS &amp; HTTP.</em></h1>
      <p className="text-lg max-w-3xl mb-10" style={{ color: "oklch(0.85 0.02 70)" }}>
        Escribe un dominio y observa el viaje: consulta al DNS, obtención de IP, petición al servidor y respuesta.
        Prueba los escenarios de abajo para ver todos los tipos de error.
      </p>

      {/* Address bar */}
      <div className="rounded-2xl hair-a p-4 md:p-5 flex items-center gap-3" style={{ background: "oklch(0.16 0.012 55)" }}>
        <div className="mono text-sm opacity-60 pl-2 shrink-0">https://</div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") run(); }}
          spellCheck={false}
          className="flex-1 bg-transparent outline-none mono text-lg"
          placeholder="google.com"
        />
        <button
          onClick={() => run()}
          className="mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-full bg-[var(--signal)] text-[var(--ink)] hover:opacity-90 transition shrink-0"
        >
          Ir →
        </button>
      </div>

      {/* Scenarios */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="mono text-[11px] uppercase tracking-widest opacity-60 self-center pr-2">Escenarios:</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.domain}
            onClick={() => run(s.domain)}
            className="mono text-xs px-3 py-1.5 rounded-full hair-a hover:bg-white/5 transition"
            title={s.label}
          >
            {s.domain}
          </button>
        ))}
      </div>

      {/* Journey */}
      <div className="mt-10 grid lg:grid-cols-3 gap-5">
        {/* Node: browser */}
        <Node title="Tú" sub="Navegador" active={step !== "idle"}>
          <div className="mono text-sm break-all">{scenario?.domain ?? "—"}</div>
        </Node>

        {/* Node: DNS */}
        <Node title="DNS" sub="Sistema de nombres" active={step === "dns" || step === "dns-done" || step === "http" || step === "done"}>
          {step === "idle" && <div className="text-sm opacity-60">Esperando dominio…</div>}
          {step === "dns" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full dot-pulse" style={{ background: "var(--signal)" }} />
              Buscando en la guía…
            </div>
          )}
          {(step === "dns-done" || step === "http" || step === "done") && scenario && (
            <>
              {scenario.ip ? (
                <>
                  <div className="mono text-xs uppercase tracking-widest opacity-60 mb-1">IP encontrada</div>
                  <div className="mono text-xl" style={{ color: "var(--mint)" }}>{scenario.ip}</div>
                </>
              ) : (
                <>
                  <div className="mono text-xs uppercase tracking-widest mb-1" style={{ color: "var(--signal)" }}>Error DNS</div>
                  <div className="mono text-sm" style={{ color: "var(--signal)" }}>ERR_NAME_NOT_RESOLVED</div>
                </>
              )}
            </>
          )}
        </Node>

        {/* Node: server */}
        <Node title="Servidor" sub={scenario?.ip ?? "no alcanzado"} active={step === "http" || step === "done"} disabled={scenario ? !scenario.ip : false}>
          {(!scenario || step === "idle" || step === "dns" || (step === "dns-done" && dnsOk)) && (
            <div className="text-sm opacity-60">Esperando petición…</div>
          )}
          {step === "http" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full dot-pulse" style={{ background: "var(--signal)" }} />
              Procesando…
            </div>
          )}
          {step === "done" && scenario && scenario.httpCode !== null && (
            <>
              <div className="mono text-xs uppercase tracking-widest opacity-60 mb-1">Respuesta HTTP</div>
              <div className="flex items-baseline gap-2">
                <div className="mono text-3xl" style={{ color: httpOk ? "var(--mint)" : "var(--signal)" }}>{scenario.httpCode}</div>
                <div className="mono text-sm opacity-80">{scenario.httpText}</div>
              </div>
            </>
          )}
          {step === "done" && scenario && scenario.httpCode === null && (
            <div className="text-sm opacity-70 italic">La petición nunca llegó aquí.</div>
          )}
        </Node>
      </div>

      {/* Result summary */}
      {step === "done" && scenario && (
        <div className="mt-8 rounded-3xl p-6 md:p-8 hair-a" style={{ background: !dnsOk ? "oklch(0.22 0.08 45)" : httpOk ? "oklch(0.22 0.08 165)" : "oklch(0.22 0.08 45)" }}>
          <div className="mono text-xs uppercase tracking-widest mb-3 opacity-80">
            {!dnsOk ? "❌ El DNS no resolvió" : httpOk ? "✓ Todo correcto" : `⚠️ Servidor devolvió ${scenario.httpCode}`}
          </div>
          <p className="text-lg md:text-xl italic max-w-3xl" style={{ fontFamily: "var(--font-display)" }}>
            {scenario.narrative}
          </p>
          <div className="mt-4 text-sm opacity-90">
            {!dnsOk && "Ejemplos: dominio mal escrito, dominio expirado, DNS caído. La petición nunca sale de tu red."}
            {dnsOk && httpOk && "El DNS te dio la IP correcta, contactaste al servidor y respondió con 200 OK. El navegador ya puede renderizar."}
            {dnsOk && !httpOk && "El DNS funcionó — la IP se resolvió. El problema está del lado del servidor o de sus permisos."}
          </div>
        </div>
      )}

      {/* Legend */}
      <section className="mt-16 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.16 0.012 55)" }}>
          <div className="mono text-xs uppercase tracking-widest mb-3" style={{ color: "var(--signal)" }}>Recordatorio</div>
          <p className="text-sm">
            <strong>Error DNS:</strong> el dominio no se encontró — la petición <em>nunca llega</em> al servidor.<br />
            <strong>Error HTTP:</strong> el servidor <em>sí</em> respondió, pero con problema (404, 500, 403…).
          </p>
        </div>
        <div className="rounded-2xl hair-a p-6" style={{ background: "oklch(0.16 0.012 55)" }}>
          <div className="mono text-xs uppercase tracking-widest mb-3" style={{ color: "var(--signal)" }}>Códigos comunes</div>
          <ul className="text-sm mono space-y-1">
            <li><span style={{color:"var(--mint)"}}>200</span> OK · éxito</li>
            <li><span style={{color:"var(--signal)"}}>404</span> no encontrado</li>
            <li><span style={{color:"var(--signal)"}}>403</span> prohibido</li>
            <li><span style={{color:"var(--signal)"}}>500</span> error del servidor</li>
            <li><span style={{color:"var(--signal)"}}>502 / 503</span> gateway / no disponible</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function Node({ title, sub, children, active, disabled }: { title: string; sub: string; children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return (
    <div
      className="rounded-3xl p-6 md:p-7 transition-all"
      style={{
        background: active ? "oklch(0.2 0.02 55)" : "oklch(0.16 0.012 55)",
        borderColor: active ? "var(--signal)" : "var(--hair)",
        borderWidth: 1,
        borderStyle: "solid",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div className="flex items-baseline justify-between mb-4">
        <div className="text-2xl italic">{title}</div>
        <div className="mono text-[10px] uppercase tracking-widest opacity-60">{sub}</div>
      </div>
      <div className="min-h-[72px]">{children}</div>
    </div>
  );
}
