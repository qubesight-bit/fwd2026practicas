import type { ReactNode } from "react";

export type Slide = {
  id: string;
  title: string;
  render: () => ReactNode;
};

/* ---------- Reusable primitives ---------- */

function Frame({ kicker, page, children }: { kicker: string; page: string; children: ReactNode }) {
  return (
    <div className="slide-content grain">
      <div className="absolute inset-0 flex flex-col px-32 py-24">
        <header className="flex items-center justify-between hair-b pb-8">
          <span className="slide-kicker">{kicker}</span>
          <span className="slide-page">{page}</span>
        </header>
        <div className="flex-1 flex flex-col pt-16">{children}</div>
        <footer className="flex items-center justify-between hair-t pt-6 slide-footer" style={{ color: "oklch(0.6 0.02 70)" }}>
          <span>Guía de estudio · Redes &amp; Frontend</span>
          <span>Jul 2026</span>
        </footer>
      </div>
    </div>
  );
}

function Signal({ children }: { children: ReactNode }) {
  return <span style={{ color: "var(--signal)" }}>{children}</span>;
}

/* ---------- Slides ---------- */

const slides: Slide[] = [
  {
    id: "cover",
    title: "Portada",
    render: () => (
      <div className="slide-content grain">
        <div className="absolute inset-0 flex flex-col justify-between px-32 py-24">
          <div className="flex items-center justify-between">
            <span className="slide-kicker">Vol. 01 · Guía visual</span>
            <span className="slide-page">01 / 08</span>
          </div>
          <div className="max-w-[1500px]">
            <div className="slide-body-lg mb-10" style={{ color: "oklch(0.75 0.02 70)" }}>
              Un recorrido íntimo por lo que ocurre entre <em style={{ fontFamily: "var(--font-display)" }}>escribir una URL</em> y <em style={{ fontFamily: "var(--font-display)" }}>ver una página</em>.
            </div>
            <h1 className="slide-title-lg">
              Redes, DNS<br />
              <span style={{ color: "var(--signal)" }}>&amp;</span> los fundamentos<br />
              del <em>frontend.</em>
            </h1>
          </div>
          <div className="flex items-end justify-between hair-t pt-8">
            <div className="slide-caption max-w-[600px]">
              Ocho diapositivas. DNS, comandos, HTTP, DOM y la trinidad HTML · CSS · JS —
              explicados como se merecen: sin ruido, sin humo.
            </div>
            <div className="slide-mono text-right" style={{ fontSize: 22, letterSpacing: "0.18em" }}>
              ← / → PARA NAVEGAR
            </div>
          </div>
        </div>
      </div>
    ),
  },

  {
    id: "dns",
    title: "¿Qué es el DNS?",
    render: () => (
      <Frame kicker="01 · Fundamento" page="02 / 08">
        <div className="grid grid-cols-12 gap-16 flex-1">
          <div className="col-span-5 flex flex-col justify-center">
            <h2 className="slide-title mb-10">
              La guía telefónica<br />de <em>internet.</em>
            </h2>
            <p className="slide-body-lg" style={{ maxWidth: 620 }}>
              <Signal>DNS</Signal> — <span className="slide-mono" style={{ fontSize: 32 }}>Domain Name System</span> — traduce nombres humanos en direcciones que las máquinas entienden.
            </p>
            <p className="slide-caption mt-8" style={{ maxWidth: 620 }}>
              Sin él, tendrías que memorizar una fila de números para abrir cada sitio.
            </p>
          </div>
          <div className="col-span-7 flex flex-col justify-center gap-8">
            <div className="hair rounded-3xl p-10" style={{ background: "oklch(0.18 0.014 55)" }}>
              <div className="slide-kicker mb-4">Tú escribes</div>
              <div className="slide-title-lg" style={{ fontSize: 96, fontStyle: "normal", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
                google<span style={{ color: "var(--signal)" }}>.com</span>
              </div>
            </div>
            <div className="flex items-center gap-6 pl-10">
              <div className="slide-mono" style={{ fontSize: 40, color: "var(--signal)" }}>↓</div>
              <div className="slide-caption">El resolver DNS busca en su directorio…</div>
            </div>
            <div className="hair rounded-3xl p-10" style={{ background: "oklch(0.22 0.014 55)" }}>
              <div className="slide-kicker mb-4" style={{ color: "oklch(0.72 0.02 70)" }}>El DNS responde</div>
              <div className="slide-title" style={{ fontSize: 84, fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" }}>
                142.250.185.78
              </div>
            </div>
          </div>
        </div>
      </Frame>
    ),
  },

  {
    id: "commands",
    title: "Comandos: nslookup y ping",
    render: () => (
      <Frame kicker="02 · Diagnóstico" page="03 / 08">
        <div className="mb-14">
          <h2 className="slide-title">Dos comandos, <em>una verdad.</em></h2>
          <p className="slide-body mt-6" style={{ color: "oklch(0.72 0.02 70)", maxWidth: 1100 }}>
            Cuando <span className="slide-mono">nslookup</span> y <span className="slide-mono">ping</span> devuelven la <Signal>misma IP</Signal>, tu DNS está limpio y sin caché corrupta.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 flex-1">
          <div className="hair rounded-3xl p-12 flex flex-col" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="flex items-center justify-between mb-8">
              <span className="slide-kicker">Comando</span>
              <span className="slide-badge hair rounded-full px-5 py-2" style={{ color: "var(--signal)" }}>consulta</span>
            </div>
            <div className="slide-title mb-8" style={{ fontFamily: "var(--font-mono)", fontSize: 72 }}>
              nslookup
            </div>
            <p className="slide-body mb-10">
              Le pregunta al DNS directamente: <em>¿cuál es la IP de este dominio?</em>
            </p>
            <div className="mt-auto hair-t pt-6 slide-mono" style={{ fontSize: 24, color: "var(--signal)" }}>
              → Dirección: 142.250.185.78
            </div>
          </div>
          <div className="hair rounded-3xl p-12 flex flex-col" style={{ background: "oklch(0.18 0.014 55)" }}>
            <div className="flex items-center justify-between mb-8">
              <span className="slide-kicker">Comando</span>
              <span className="slide-badge hair rounded-full px-5 py-2" style={{ color: "var(--signal)" }}>ida y vuelta</span>
            </div>
            <div className="slide-title mb-8" style={{ fontFamily: "var(--font-mono)", fontSize: 72 }}>
              ping
            </div>
            <p className="slide-body mb-10">
              Resuelve el dominio y comprueba si el servidor <em>responde activamente.</em>
            </p>
            <div className="mt-auto hair-t pt-6 slide-mono" style={{ fontSize: 24, color: "var(--signal)" }}>
              → Respuesta desde 142.250.185.78
            </div>
          </div>
        </div>
      </Frame>
    ),
  },

  {
    id: "dns-fails",
    title: "Cuando el DNS no resuelve",
    render: () => (
      <Frame kicker="03 · Fallo de resolución" page="04 / 08">
        <div className="grid grid-cols-12 gap-16 flex-1">
          <div className="col-span-6 flex flex-col justify-center">
            <h2 className="slide-title mb-10">
              Cuando la casa<br /><em>no está en el mapa.</em>
            </h2>
            <p className="slide-body-lg" style={{ maxWidth: 640 }}>
              El navegador no encontró la dirección en la guía. La petición nunca sale de tu red.
            </p>
          </div>
          <div className="col-span-6 flex flex-col justify-center gap-6">
            <div className="slide-kicker mb-2">Errores que verás</div>
            {[
              "DNS_PROBE_FINISHED_NXDOMAIN",
              "ERR_NAME_NOT_RESOLVED",
              "No se puede encontrar la dirección del servidor",
            ].map((err) => (
              <div key={err} className="hair rounded-2xl px-8 py-6 slide-mono" style={{ fontSize: 26, background: "oklch(0.18 0.014 55)" }}>
                <span style={{ color: "var(--signal)" }}>× </span>{err}
              </div>
            ))}
            <div className="slide-kicker mt-8 mb-2">Causas comunes</div>
            <ul className="slide-body space-y-3" style={{ color: "oklch(0.85 0.02 70)" }}>
              <li>— Faltas de ortografía en el dominio.</li>
              <li>— Dominio inexistente o expirado.</li>
              <li>— Servidor DNS caído o mal configurado.</li>
              <li>— Bloqueo o censura en la red local.</li>
            </ul>
          </div>
        </div>
      </Frame>
    ),
  },

  {
    id: "dns-vs-http",
    title: "DNS vs HTTP",
    render: () => (
      <Frame kicker="04 · La distinción clave" page="05 / 08">
        <h2 className="slide-title mb-12">Error <em>DNS</em> vs. Error <em>HTTP.</em></h2>
        <div className="grid grid-cols-2 gap-10 flex-1">
          <div className="hair rounded-3xl p-12 flex flex-col" style={{ background: "oklch(0.16 0.014 55)" }}>
            <div className="flex items-baseline justify-between mb-8">
              <span className="slide-title" style={{ fontSize: 72 }}>DNS</span>
              <span className="slide-badge hair rounded-full px-5 py-2" style={{ color: "var(--signal)" }}>no llega ×</span>
            </div>
            <p className="slide-body-lg mb-10">No se encontró el dominio en el mapa.</p>
            <div className="space-y-5 mt-auto">
              <div className="slide-caption">Ejemplos clásicos</div>
              <div className="slide-mono" style={{ fontSize: 24 }}>ERR_NAME_NOT_RESOLVED</div>
              <p className="slide-body italic" style={{ fontFamily: "var(--font-display)", color: "oklch(0.82 0.02 70)" }}>
                “No encontré la dirección de la casa.”
              </p>
            </div>
          </div>
          <div className="rounded-3xl p-12 flex flex-col" style={{ background: "var(--signal)", color: "var(--ink)" }}>
            <div className="flex items-baseline justify-between mb-8">
              <span className="slide-title" style={{ fontSize: 72, color: "var(--ink)" }}>HTTP</span>
              <span className="slide-badge rounded-full px-5 py-2" style={{ background: "var(--ink)", color: "var(--paper)" }}>sí llega ✓</span>
            </div>
            <p className="slide-body-lg mb-10" style={{ color: "var(--ink)" }}>
              Se localizó el dominio, pero el servidor devolvió un error.
            </p>
            <div className="space-y-5 mt-auto">
              <div className="slide-caption" style={{ color: "oklch(0.25 0.02 55)" }}>Ejemplos clásicos</div>
              <div className="slide-mono" style={{ fontSize: 24, color: "var(--ink)" }}>404 · 500 · 403 · 502 · 503</div>
              <p className="slide-body italic" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                “Llegué a la casa, pero no me dejaron entrar.”
              </p>
            </div>
          </div>
        </div>
      </Frame>
    ),
  },

  {
    id: "http-codes",
    title: "Códigos HTTP",
    render: () => {
      const codes = [
        { code: "200", name: "OK", desc: "Éxito total. La página carga correctamente." },
        { code: "404", name: "Not Found", desc: "El servidor responde, pero el recurso no existe." },
        { code: "403", name: "Forbidden", desc: "Sin permisos ni credenciales para acceder." },
        { code: "500", name: "Server Error", desc: "El código o la base de datos fallaron del lado del servidor." },
        { code: "502", name: "Bad Gateway", desc: "Un intermediario recibió respuesta inválida de otro servidor." },
        { code: "503", name: "Unavailable", desc: "Servidor saturado o en mantenimiento temporal." },
      ];
      return (
        <Frame kicker="05 · Códigos de estado" page="06 / 08">
          <h2 className="slide-title mb-12">Los <em>seis</em> que debes reconocer.</h2>
          <div className="grid grid-cols-3 gap-6 flex-1">
            {codes.map((c) => (
              <div key={c.code} className="hair rounded-2xl p-8 flex flex-col" style={{ background: "oklch(0.18 0.014 55)" }}>
                <div className="flex items-baseline gap-4 mb-4">
                  <div className="slide-mono" style={{ fontSize: 72, color: "var(--signal)", letterSpacing: "-0.02em" }}>
                    {c.code}
                  </div>
                  <div className="slide-kicker" style={{ color: "oklch(0.85 0.02 70)" }}>{c.name}</div>
                </div>
                <p className="slide-body" style={{ fontSize: 24, lineHeight: 1.4 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </Frame>
      );
    },
  },

  {
    id: "flow",
    title: "Flujo de una petición",
    render: () => {
      const steps = [
        { n: "01", t: "Escribes la URL", d: "El usuario digita el dominio en el navegador." },
        { n: "02", t: "Consulta DNS", d: "Si el dominio no existe → Error DNS. Si sí → obtiene la IP." },
        { n: "03", t: "Respuesta del servidor", d: "Si falla → Código HTTP (404, 500…). Si responde → envía HTML, CSS y JS." },
        { n: "04", t: "Renderizado", d: "El navegador procesa los archivos y dibuja la interfaz en pantalla." },
      ];
      return (
        <Frame kicker="06 · El viaje completo" page="07 / 08">
          <h2 className="slide-title mb-14">De la barra de direcciones al <em>pixel.</em></h2>
          <div className="flex-1 grid grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <span className="slide-mono" style={{ fontSize: 22, color: "var(--signal)" }}>{s.n}</span>
                  <span className="flex-1 hair-b" />
                  {i < steps.length - 1 && <span style={{ color: "var(--signal)", fontSize: 22 }}>→</span>}
                </div>
                <h3 className="slide-body-lg mb-6" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 44 }}>
                  {s.t}
                </h3>
                <p className="slide-body" style={{ fontSize: 24, color: "oklch(0.78 0.02 70)" }}>{s.d}</p>
              </div>
            ))}
          </div>
        </Frame>
      );
    },
  },

  {
    id: "trinity",
    title: "Trinidad + DOM + Frontend",
    render: () => (
      <Frame kicker="07 · La trinidad + precisiones" page="08 / 08">
        <div className="grid grid-cols-12 gap-12 flex-1">
          <div className="col-span-7 flex flex-col">
            <h2 className="slide-title mb-10">HTML · CSS · <em>JavaScript.</em></h2>
            <div className="space-y-6">
              {[
                { k: "HTML", role: "El esqueleto", d: "Organiza y estructura el contenido — no es programación, es marcado." },
                { k: "CSS", role: "La ropa", d: "Colores, tipografías, márgenes, distribución. La estética del esqueleto." },
                { k: "JavaScript", role: "El cerebro", d: "Lógica, interactividad, animaciones y peticiones de datos en vivo." },
                { k: "Render", role: "El acto físico", d: "El navegador interpreta HTML + CSS + JS y lo dibuja pixel a pixel." },
              ].map((row) => (
                <div key={row.k} className="grid grid-cols-12 gap-6 hair-b pb-5 items-baseline">
                  <div className="col-span-3 slide-mono" style={{ fontSize: 28, color: "var(--signal)" }}>{row.k}</div>
                  <div className="col-span-3 slide-body italic" style={{ fontFamily: "var(--font-display)", fontSize: 30 }}>{row.role}</div>
                  <div className="col-span-6 slide-body" style={{ fontSize: 24, color: "oklch(0.82 0.02 70)" }}>{row.d}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-5 flex flex-col gap-6">
            <div className="hair rounded-3xl p-10 flex-1" style={{ background: "oklch(0.18 0.014 55)" }}>
              <div className="slide-kicker mb-4">Precisión · DOM</div>
              <h3 className="slide-body-lg mb-4" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40 }}>
                Un mapa vivo, no un dibujante.
              </h3>
              <p className="slide-body" style={{ fontSize: 24 }}>
                El <Signal>DOM</Signal> es la traducción del HTML a un <em>árbol de objetos</em> en memoria.
                Permite que JavaScript lea, modifique y borre elementos <em>en tiempo real.</em>
              </p>
            </div>
            <div className="rounded-3xl p-10 flex-1" style={{ background: "var(--signal)", color: "var(--ink)" }}>
              <div className="slide-kicker mb-4" style={{ color: "var(--ink)" }}>Precisión · Frontend</div>
              <h3 className="slide-body-lg mb-4" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, color: "var(--ink)" }}>
                Es del lado del cliente.
              </h3>
              <p className="slide-body" style={{ fontSize: 24, color: "var(--ink)" }}>
                Frontend no significa <em>publicado.</em> Es todo lo que ocurre en la máquina del usuario —
                incluso mientras lo pruebas en local sin haberlo subido a la nube.
              </p>
            </div>
          </div>
        </div>
      </Frame>
    ),
  },
];

export default slides;
