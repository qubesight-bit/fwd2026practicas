import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Taskbar, ToastLayer, IEBrowser, W95Button } from "@/components/win95";

function NotFoundComponent() {
  return (
    <ChromeWrap>
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📄❌</div>
        <h1 className="text-3xl mb-2">No se pudo mostrar la página</h1>
        <p className="mb-6">Esta ruta no existe. (Como cuando el DNS no encuentra un dominio.)</p>
        <Link to="/" className="w95-btn inline-flex">🏠 Volver al escritorio</Link>
      </div>
    </ChromeWrap>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <ChromeWrap>
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-5xl mb-4">💥</div>
        <h1 className="text-2xl mb-2">Se produjo un error</h1>
        <p className="mb-6 text-[12px]">Un programa no responde. Presiona reintentar.</p>
        <div className="flex gap-2 justify-center">
          <W95Button onClick={() => { router.invalidate(); reset(); }}>Reintentar</W95Button>
          <a href="/" className="w95-btn">Inicio</a>
        </div>
      </div>
    </ChromeWrap>
  );
}

/** Wrapper used by error/not-found routes to give the same IE chrome. */
function ChromeWrap({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen p-2 md:p-4 pb-[52px]" style={{ background: "var(--w95-desktop)" }}>
      <IEBrowser title="Error" url="about:blank">{children}</IEBrowser>
      <Taskbar />
      <ToastLayer />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Redes 95 — Estudia jugando en Internet Explorer" },
      { name: "description", content: "Aprende DNS, HTTP, HTML, lógica y terminal en un simulador con estética Windows 95 e Internet Explorer, con XP, monedas y medallas." },
      { property: "og:title", content: "Redes 95 — Estudia jugando" },
      { property: "og:description", content: "Lecciones, simulador DNS/HTTP y quiz gamificado, todo dentro de una PC de los 90s." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDesktop = pathname === "/";
  const title =
    pathname === "/" ? "Escritorio" :
    pathname.startsWith("/quiz") ? "Quiz — Juegos" :
    pathname.startsWith("/simulador") ? "Simulador de red" :
    pathname.startsWith("/lecciones/") ? "Lección" :
    pathname.startsWith("/lecciones") ? "Lecciones" :
    "Redes 95";
  const url = `C:\\Redes95${pathname === "/" ? "\\Escritorio" : pathname.replaceAll("/", "\\")}`;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="grain min-h-screen p-2 md:p-4 pb-[52px]" style={{ background: "var(--w95-desktop)" }}>
        {isDesktop ? (
          <Outlet />
        ) : (
          <IEBrowser title={title} url={url}>
            <Outlet />
          </IEBrowser>
        )}
        <Taskbar />
        <ToastLayer />
      </div>
    </QueryClientProvider>
  );
}
