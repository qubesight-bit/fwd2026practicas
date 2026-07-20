import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="kicker mb-4">Error 404</div>
        <h1 className="text-6xl mb-4">Página no encontrada</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Esta ruta no existe en la guía. Como cuando el DNS no encuentra un dominio.
        </p>
        <Link to="/" className="inline-flex rounded-full px-5 py-2 mono text-xs uppercase tracking-widest hair-a hover:bg-accent hover:text-accent-foreground transition">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="kicker mb-4">Algo se rompió</div>
        <h1 className="text-4xl mb-4">Esta página no cargó</h1>
        <div className="flex gap-2 justify-center">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full px-5 py-2 mono text-xs uppercase tracking-widest bg-accent text-accent-foreground">Reintentar</button>
          <a href="/" className="rounded-full px-5 py-2 mono text-xs uppercase tracking-widest hair-a">Inicio</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Redes y Fundamentos — Estudia jugando" },
      { name: "description", content: "Aprende DNS, HTTP, HTML, operadores lógicos, terminal y fundamentos de programación con lecciones ilustradas, un simulador interactivo y modo quiz." },
      { property: "og:title", content: "Redes y Fundamentos — Estudia jugando" },
      { property: "og:description", content: "Lecciones + simulador DNS/HTTP + quiz para dominar los conceptos base de la web." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="grain min-h-screen">
        <SiteNav />
        <Outlet />
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: "oklch(0.14 0.012 55 / 0.75)", borderBottom: "1px solid var(--hair)" }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-3">
          <span className="mono text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--signal)" }}>REDES</span>
          <span className="text-2xl italic" style={{ fontFamily: "var(--font-display)" }}>&amp; fundamentos</span>
        </Link>
        <nav className="flex items-center gap-1 md:gap-2 mono text-[11px] uppercase tracking-widest">
          {[
            { to: "/", label: "Inicio" },
            { to: "/lecciones", label: "Lecciones" },
            { to: "/simulador", label: "Simulador" },
            { to: "/quiz", label: "Quiz" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 rounded-full hover:bg-white/5 transition"
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "px-3 py-2 rounded-full bg-white/10 text-[var(--signal)]" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="hair-t mt-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 flex flex-wrap items-baseline justify-between gap-6 mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <span>Guía visual · para estudiar sin sufrir</span>
        <span>Hecho con cariño · 2026</span>
      </div>
    </footer>
  );
}
