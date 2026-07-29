import { useEffect, useState, type ReactNode, type MouseEventHandler } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useStats, subscribeToasts, type Toast, levelFor, xpToNext, BADGE_META, sfx } from "@/lib/gamification";

/* ================= Primitives (macOS / Firefox OS look) ================= */

export function W95Button({
  children, onClick, active, disabled, className = "", type = "button",
  title,
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  title?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      title={title}
      onClick={(e) => { if (!disabled) { sfx.click(); onClick?.(e); } }}
      className={`w95-btn ${active ? "w95-btn-active" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function W95Panel({ inset, children, className = "", style }: { inset?: boolean; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`${inset ? "w95-inset" : "w95-outset"} ${className}`} style={style}>
      {children}
    </div>
  );
}

export function W95Window({
  title, icon, children, className = "", onClose, footer,
}: {
  title: string; icon?: string; children: ReactNode; className?: string;
  onClose?: () => void; footer?: ReactNode;
}) {
  return (
    <div className={`w95-outset overflow-hidden ${className}`}>
      <div className="w95-titlebar">
        <div className="flex items-center gap-2">
          <button className="w95-tb-btn" title="Cerrar" onClick={() => { sfx.click(); onClose?.(); }}>x</button>
          <button className="w95-tb-btn" title="Minimizar" onClick={() => sfx.click()}>-</button>
          <button className="w95-tb-btn" title="Pantalla completa" onClick={() => sfx.click()}>+</button>
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="truncate">{title}</span>
        </div>
        <div className="w-[58px]" />
      </div>
      <div className="p-3 md:p-4">{children}</div>
      {footer && <div className="mx-3 mb-3 px-3 py-1.5 text-[11px] rounded-lg bg-[color:var(--muted)] text-[color:var(--muted-foreground)]">{footer}</div>}
    </div>
  );
}

/* ================= Browser chrome (Firefox on macOS) ================= */

export function IEBrowser({
  title, url, children,
}: { title: string; url: string; children: ReactNode }) {
  const router = useRouter();
  const go = (dir: -1 | 1) => { sfx.click(); if (dir === -1) router.history.back(); else router.history.forward(); };
  const refresh = () => { sfx.click(); router.invalidate(); };
  return (
    <W95Window title={title} icon="🦊" footer={<span>Listo · conexión segura</span>}>
      {/* Tab strip */}
      <div className="flex items-end gap-1 mb-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-white border border-b-0 border-[color:var(--border)] text-[12px] font-semibold max-w-[280px]">
          <span className="w95-flag" />
          <span className="truncate">{title}</span>
        </div>
        <div className="flex-1 border-b border-[color:var(--border)] h-[1px]" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <W95Button onClick={() => go(-1)} title="Atrás" className="!px-3">←</W95Button>
        <W95Button onClick={() => go(1)} title="Adelante" className="!px-3">→</W95Button>
        <W95Button onClick={refresh} title="Actualizar" className="!px-3">↻</W95Button>
        <Link to="/" className="w95-btn !px-3" title="Inicio" onClick={() => sfx.click()}>⌂</Link>
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 h-[34px] rounded-full bg-[color:var(--muted)] border border-[color:var(--border)] mono text-[12px]">
          <span className="text-[color:var(--mint)]">🔒</span>
          <span className="truncate text-[color:var(--muted-foreground)]">{url}</span>
        </div>
        <W95Button onClick={refresh}>Ir</W95Button>
      </div>

      {/* Page */}
      <div className="w95-inset p-4 md:p-6 min-h-[60vh]">
        {children}
      </div>
    </W95Window>
  );
}

/* ================= Menubar + Dock ================= */

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const DOCK = [
  { to: "/",           label: "Escritorio", icon: "🏠" },
  { to: "/estudiar",   label: "¿Qué estudiar?", icon: "🎓" },
  { to: "/lecciones",  label: "Lecciones", icon: "📚" },
  { to: "/simulador",  label: "Simulador", icon: "🌐" },
  { to: "/quiz",       label: "Quiz", icon: "🎯" },
];

export function Taskbar() {
  const stats = useStats();
  const clock = useClock();
  const [menuOpen, setMenuOpen] = useState(false);
  const lvl = levelFor(stats.xp);
  const toNext = xpToNext(stats.xp);
  const pct = 100 - toNext;

  return (
    <>
      {/* macOS menu bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[30px] z-50 flex items-center gap-4 px-3 text-[12px] font-medium text-white"
        style={{ background: "rgba(16,22,42,.45)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
      >
        <button className="flex items-center gap-2 font-semibold" onClick={() => { sfx.click(); setMenuOpen((v) => !v); }}>
          <span className="w95-flag" /> Redes OS
        </button>
        <span className="hidden sm:inline opacity-80">Archivo</span>
        <span className="hidden sm:inline opacity-80">Edición</span>
        <span className="hidden sm:inline opacity-80">Ver</span>
        <span className="hidden md:inline opacity-80">Ayuda</span>
        <div className="flex-1" />
        <span className="flex items-center gap-1.5" title={`Nivel ${lvl} · ${stats.xp} XP · faltan ${toNext} para nivel ${lvl + 1}`}>
          <span>⭐</span><b>Nv {lvl}</b>
          <span className="w-[46px] h-[5px] rounded-full bg-white/25 overflow-hidden">
            <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#ffbd2e,#ff7a18)" }} />
          </span>
        </span>
        <span title="Monedas">🪙 {stats.coins}</span>
        <span title="Racha actual">🔥 {stats.streak}</span>
        <span className="mono opacity-90">{clock ? clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}</span>
      </div>

      {menuOpen && <AppleMenu onClose={() => setMenuOpen(false)} />}

      {/* macOS dock */}
      <div className="fixed left-0 right-0 bottom-3 z-50 flex justify-center pointer-events-none px-2">
        <div className="mac-dock pointer-events-auto">
          {DOCK.map((d) => (
            <Link key={d.to} to={d.to} onClick={() => sfx.click()} className="dock-item" aria-label={d.label}>
              <span>{d.icon}</span>
              <span className="dock-tip">{d.label}</span>
            </Link>
          ))}
          <div className="w-px self-stretch my-1 bg-[color:var(--stroke)]" />
          <div className="dock-item" title={`${stats.badges.length} medallas`}>
            <span>🏅</span>
            <span className="dock-tip">{stats.badges.length} medallas</span>
          </div>
        </div>
      </div>
    </>
  );
}

function AppleMenu({ onClose }: { onClose: () => void }) {
  const stats = useStats();
  return (
    <>
      <div className="fixed inset-0 z-[55]" onClick={onClose} />
      <div className="fixed left-2 top-[34px] z-[60] w-[280px] w95-outset p-1.5 animate-w95-pop">
        <MenuLink to="/"          icon="🏠" title="Escritorio" onClose={onClose} />
        <MenuLink to="/estudiar"  icon="🎓" title="¿Qué estudiar?" onClose={onClose} />
        <MenuLink to="/lecciones" icon="📚" title="Lecciones" onClose={onClose} />
        <MenuLink to="/simulador" icon="🌐" title="Simulador" onClose={onClose} />
        <MenuLink to="/quiz"      icon="🎯" title="Quiz" onClose={onClose} />
        <hr className="my-1.5 border-0 border-t border-[color:var(--stroke)]" />
        <div className="px-3 py-2 text-[12px] text-[color:var(--muted-foreground)]">
          <div><b className="text-[color:var(--foreground)]">Jugador</b> · Nv {levelFor(stats.xp)} · {stats.xp} XP</div>
          <div>🪙 {stats.coins} · 🏅 {stats.badges.length} medallas</div>
        </div>
      </div>
    </>
  );
}

function MenuLink({ to, icon, title, onClick, onClose }: { to: string; icon: string; title: string; onClick?: () => void; onClose?: () => void }) {
  return (
    <Link to={to} onClick={() => { sfx.click(); onClick?.(); onClose?.(); }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-[color:var(--signal-soft)] hover:no-underline text-[color:var(--foreground)]">
      <span className="text-lg">{icon}</span> {title}
    </Link>
  );
}

/* ================= Toast layer ================= */

export function ToastLayer() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => subscribeToasts((t) => {
    setItems((prev) => [...prev, t]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3200);
  }), []);
  return (
    <div className="fixed right-3 top-[38px] z-[70] flex flex-col gap-2 items-end pointer-events-none">
      {items.map((t) => (
        <div key={t.id} className="w95-outset px-3 py-2.5 min-w-[230px] max-w-[320px] text-[12.5px] animate-w95-pop">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{t.icon}</span>
            <div className="flex-1">
              <div className="font-bold">{t.title}</div>
              {t.body && <div className="text-[color:var(--muted-foreground)]">{t.body}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= Badge board ================= */

export function BadgeBoard() {
  const stats = useStats();
  const owned = new Set(stats.badges);
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(BADGE_META) as (keyof typeof BADGE_META)[]).map((b) => {
        const meta = BADGE_META[b];
        const has = owned.has(b);
        return (
          <div key={b}
               className={`rounded-xl p-3 text-center border transition ${has ? "border-[color:var(--border)] bg-white shadow-[var(--shadow-soft)]" : "border-dashed border-[color:var(--border)] bg-[color:var(--muted)] opacity-55 grayscale"}`}
               title={meta.desc}>
            <div className="text-2xl">{meta.icon}</div>
            <div className="text-[10.5px] mt-1 leading-tight font-medium">{meta.label}</div>
          </div>
        );
      })}
    </div>
  );
}
