import { useEffect, useState, type ReactNode, type MouseEventHandler } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useStats, subscribeToasts, type Toast, levelFor, xpToNext, BADGE_META, sfx } from "@/lib/gamification";

/* ================= Win95 primitives ================= */

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
    <div className={`w95-outset bg-[var(--w95-face)] ${className}`}>
      <div className="w95-titlebar">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w95-tb-btn" title="Minimizar" onClick={() => sfx.click()}>_</button>
          <button className="w95-tb-btn" title="Maximizar" onClick={() => sfx.click()}>▢</button>
          <button className="w95-tb-btn" title="Cerrar" onClick={() => { sfx.click(); onClose?.(); }}>×</button>
        </div>
      </div>
      <div className="p-2">{children}</div>
      {footer && <div className="w95-inset mx-2 mb-2 p-1 text-[11px]">{footer}</div>}
    </div>
  );
}

/* ================= Internet Explorer chrome ================= */

export function IEBrowser({
  title, url, children,
}: { title: string; url: string; children: ReactNode }) {
  const router = useRouter();
  const go = (dir: -1 | 1) => { sfx.click(); if (dir === -1) router.history.back(); else router.history.forward(); };
  const refresh = () => { sfx.click(); router.invalidate(); };
  return (
    <W95Window title={`${title} — Microsoft Internet Explorer`} icon="🌐" footer={<span>Listo · zona: Internet</span>}>
      {/* Menu bar */}
      <div className="flex gap-3 text-[12px] px-1 pb-1">
        {["Archivo","Edición","Ver","Favoritos","Herramientas","Ayuda"].map((m) => (
          <span key={m} className="cursor-default hover:bg-[var(--w95-titlebar)] hover:text-white px-1"><u>{m[0]}</u>{m.slice(1)}</span>
        ))}
      </div>
      {/* Toolbar */}
      <div className="w95-outset p-1 flex items-center gap-1 flex-wrap">
        <W95Button onClick={() => go(-1)} title="Atrás"><span className="mr-1">◀</span>Atrás</W95Button>
        <W95Button onClick={() => go(1)} title="Adelante">Adelante<span className="ml-1">▶</span></W95Button>
        <W95Button onClick={refresh} title="Actualizar">↻ Actualizar</W95Button>
        <Link to="/" className="w95-btn" onClick={() => sfx.click()}>🏠 Inicio</Link>
        <div className="mx-2 h-6 w-px bg-[var(--w95-shadow)]" />
        <span className="text-[12px]">Dirección</span>
        <div className="flex-1 min-w-[180px] w95-inset px-2 py-1 mono text-[12px] bg-white flex items-center gap-1">
          <span>🌐</span>
          <span className="truncate">{url}</span>
        </div>
        <W95Button onClick={refresh}>Ir</W95Button>
      </div>
      {/* Page */}
      <div className="w95-inset bg-white mt-1 p-4 md:p-6 min-h-[60vh] text-black">
        {children}
      </div>
    </W95Window>
  );
}

/* ================= Taskbar + Start ================= */

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function Taskbar() {
  const stats = useStats();
  const clock = useClock();
  const [startOpen, setStartOpen] = useState(false);
  const lvl = levelFor(stats.xp);
  const toNext = xpToNext(stats.xp);
  const pct = 100 - toNext;

  return (
    <>
      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}
      <div className="fixed left-0 right-0 bottom-0 h-[38px] w95-outset flex items-center gap-1 px-1 z-50" style={{ background: "var(--w95-face)" }}>
        <button
          onClick={() => { sfx.click(); setStartOpen((v) => !v); }}
          className={`w95-btn font-bold flex items-center gap-2 h-[30px] ${startOpen ? "w95-btn-active" : ""}`}
        >
          <span className="w95-flag" /> Inicio
        </button>
        <div className="w-px h-6 bg-[var(--w95-shadow)] mx-1" />
        <TaskItem to="/" label="Escritorio" icon="🖥️" />
        <TaskItem to="/lecciones" label="Lecciones" icon="📚" />
        <TaskItem to="/simulador" label="Simulador" icon="🌐" />
        <TaskItem to="/quiz" label="Quiz" icon="🎯" />
        <div className="flex-1" />
        {/* Tray */}
        <div className="w95-inset flex items-center gap-2 px-2 h-[28px] text-[11px]">
          <span title={`Nivel ${lvl} · ${stats.xp} XP · faltan ${toNext} para nivel ${lvl+1}`} className="flex items-center gap-1">
            <span>⭐</span><b>Nv {lvl}</b>
            <span className="w-[52px] h-2 w95-inset bg-white overflow-hidden">
              <span className="block h-full" style={{ width: `${pct}%`, background: "var(--w95-titlebar)" }} />
            </span>
          </span>
          <span title="Monedas">🪙 {stats.coins}</span>
          <span title="Racha actual">🔥 {stats.streak}</span>
          <span className="mono">{clock ? clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}</span>
        </div>
      </div>
    </>
  );
}

function TaskItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <Link to={to} onClick={() => sfx.click()} className="w95-btn h-[30px] flex items-center gap-1 text-[12px] min-w-[110px]">
      <span>{icon}</span><span className="truncate">{label}</span>
    </Link>
  );
}

function StartMenu({ onClose }: { onClose: () => void }) {
  const stats = useStats();
  return (
    <div className="fixed left-1 bottom-[40px] z-[60] w-[300px] w95-outset flex" style={{ background: "var(--w95-face)" }}>
      <div className="w-[28px] bg-[var(--w95-titlebar)] text-white flex items-end justify-center pb-2">
        <div className="rotate-[-90deg] origin-center whitespace-nowrap text-[11px] tracking-widest">Redes<b> 95</b></div>
      </div>
      <div className="flex-1 p-1">
        <MenuLink to="/"           icon="🖥️" title="Escritorio" onClick={onClose} />
        <MenuLink to="/estudiar"   icon="🎓" title="¿Qué estudiar?" onClick={onClose} />
        <MenuLink to="/lecciones"  icon="📚" title="Programas · Lecciones" onClick={onClose} />
        <MenuLink to="/simulador"  icon="🌐" title="Internet · Simulador" onClose={onClose} />
        <MenuLink to="/quiz"       icon="🎯" title="Juegos · Quiz" onClose={onClose} />
        <hr className="my-1 border-t border-[var(--w95-shadow)] border-b border-b-white" />
        <div className="px-3 py-2 text-[11px]">
          <div><b>Jugador</b> · Nv {levelFor(stats.xp)} · {stats.xp} XP</div>
          <div>🪙 {stats.coins}   🏅 {stats.badges.length} medallas</div>
        </div>
      </div>
    </div>
  );
}
function MenuLink({ to, icon, title, onClick, onClose }: { to: string; icon: string; title: string; onClick?: () => void; onClose?: () => void }) {
  return (
    <Link to={to} onClick={() => { sfx.click(); onClick?.(); onClose?.(); }}
          className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--w95-titlebar)] hover:text-white text-[13px]">
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
    <div className="fixed right-3 bottom-[46px] z-[70] flex flex-col gap-2 items-end pointer-events-none">
      {items.map((t) => (
        <div key={t.id} className="w95-outset px-3 py-2 min-w-[220px] max-w-[300px] bg-[var(--w95-face)] text-black text-[12px] shadow-md animate-w95-pop">
          <div className="flex items-center gap-2">
            <span className="text-xl">{t.icon}</span>
            <div className="flex-1">
              <div className="font-bold">{t.title}</div>
              {t.body && <div className="opacity-80">{t.body}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= Badge board (used in start screen) ================= */

export function BadgeBoard() {
  const stats = useStats();
  const owned = new Set(stats.badges);
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(BADGE_META) as (keyof typeof BADGE_META)[]).map((b) => {
        const meta = BADGE_META[b];
        const has = owned.has(b);
        return (
          <div key={b} className={`w95-inset bg-white p-2 text-center ${has ? "" : "opacity-40 grayscale"}`} title={meta.desc}>
            <div className="text-2xl">{meta.icon}</div>
            <div className="text-[10px] mt-1 leading-tight">{meta.label}</div>
          </div>
        );
      })}
    </div>
  );
}
