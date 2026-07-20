// Simple localStorage-backed gamification store with pub/sub + React hook.
import { useEffect, useState } from "react";

export type Badge =
  | "first_step"       // primer XP
  | "dns_master"       // completó lección DNS
  | "logic_wizard"     // completó lección operadores
  | "quiz_perfect"     // 100% en quiz
  | "quiz_streak5"     // 5 aciertos seguidos
  | "explorer"         // usó el simulador
  | "sim_detective"    // 5 predicciones correctas en simulador
  | "scholar"          // todas las lecciones completadas
  | "level_5";

export type Stats = {
  xp: number;
  coins: number;
  streak: number;         // aciertos consecutivos en quiz actual
  bestStreak: number;
  lessonsCompleted: string[];
  quizBest: number;       // score
  quizPlays: number;
  simPredictionsOk: number;
  badges: Badge[];
};

const KEY = "win95_gamestate_v1";
const DEFAULT: Stats = {
  xp: 0, coins: 0, streak: 0, bestStreak: 0,
  lessonsCompleted: [], quizBest: 0, quizPlays: 0,
  simPredictionsOk: 0, badges: [],
};

const listeners = new Set<() => void>();
let state: Stats = load();

function load(): Stats {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch { return { ...DEFAULT }; }
}
function save() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function getStats(): Stats { return state; }
export function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

export function levelFor(xp: number) {
  // 100 xp por nivel, curva ligera
  return Math.floor(xp / 100) + 1;
}
export function xpToNext(xp: number) {
  const lvl = levelFor(xp);
  return lvl * 100 - xp;
}

/* ---- Toast queue for pop-ups ---- */
export type Toast = { id: number; icon: string; title: string; body?: string; tone?: "xp" | "coin" | "badge" | "info" };
let toastId = 1;
const toastListeners = new Set<(t: Toast) => void>();
export function subscribeToasts(fn: (t: Toast) => void) { toastListeners.add(fn); return () => { toastListeners.delete(fn); }; }
export function toast(t: Omit<Toast, "id">) {
  const full = { ...t, id: toastId++ };
  toastListeners.forEach((l) => l(full));
}

/* ---- Sound (tiny WebAudio beeps) ---- */
let ac: AudioContext | null = null;
function beep(freq: number, duration = 0.08, type: OscillatorType = "square", gain = 0.05) {
  if (typeof window === "undefined") return;
  try {
    ac = ac || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + duration);
  } catch { /* ignore */ }
}
export const sfx = {
  xp: () => { beep(880); setTimeout(() => beep(1320), 70); },
  coin: () => { beep(1200, 0.05); setTimeout(() => beep(1600, 0.08), 50); },
  wrong: () => beep(180, 0.18, "sawtooth", 0.06),
  correct: () => { beep(660); setTimeout(() => beep(990, 0.1), 60); },
  badge: () => { beep(600); setTimeout(() => beep(800), 90); setTimeout(() => beep(1200, 0.16), 180); },
  click: () => beep(2000, 0.02, "square", 0.03),
  startup: () => { beep(392); setTimeout(() => beep(523), 100); setTimeout(() => beep(659, 0.2), 200); },
};

/* ---- Mutators ---- */
export function addXP(amount: number, reason?: string) {
  if (amount <= 0) return;
  const prevLevel = levelFor(state.xp);
  state = { ...state, xp: state.xp + amount };
  save();
  toast({ icon: "⭐", title: `+${amount} XP`, body: reason, tone: "xp" });
  sfx.xp();
  if (state.xp > 0 && state.badges.indexOf("first_step") === -1) awardBadge("first_step", "Primer paso");
  const newLevel = levelFor(state.xp);
  if (newLevel > prevLevel) {
    toast({ icon: "🎉", title: `¡Nivel ${newLevel}!`, body: "Sigue así.", tone: "badge" });
    sfx.badge();
    if (newLevel >= 5) awardBadge("level_5", "Nivel 5 alcanzado");
  }
}
export function addCoins(amount: number, reason?: string) {
  if (amount <= 0) return;
  state = { ...state, coins: state.coins + amount };
  save();
  toast({ icon: "🪙", title: `+${amount} monedas`, body: reason, tone: "coin" });
  sfx.coin();
}
export function bumpStreak(ok: boolean) {
  if (ok) {
    const s = state.streak + 1;
    state = { ...state, streak: s, bestStreak: Math.max(state.bestStreak, s) };
    if (s === 5) awardBadge("quiz_streak5", "5 aciertos seguidos");
  } else {
    state = { ...state, streak: 0 };
  }
  save();
}
export function resetStreak() { state = { ...state, streak: 0 }; save(); }

export function markLessonComplete(slug: string) {
  if (state.lessonsCompleted.indexOf(slug) !== -1) return;
  state = { ...state, lessonsCompleted: [...state.lessonsCompleted, slug] };
  save();
  addXP(30, `Lección "${slug}" completada`);
  addCoins(5, "Recompensa de lección");
  if (slug === "dns") awardBadge("dns_master", "Maestro del DNS");
  if (slug === "operadores") awardBadge("logic_wizard", "Mago de la lógica");
  if (state.lessonsCompleted.length >= 6) awardBadge("scholar", "Erudito — todas las lecciones");
}

export function recordQuizResult(score: number, total: number) {
  state = { ...state, quizPlays: state.quizPlays + 1, quizBest: Math.max(state.quizBest, score) };
  save();
  addXP(score * 10, `Quiz: ${score}/${total}`);
  addCoins(score, "Monedas por respuestas correctas");
  if (score === total && total > 0) awardBadge("quiz_perfect", "Quiz perfecto");
}

export function recordSimUse() {
  toast({ icon: "🌐", title: "Simulador activado", tone: "info" });
  if (state.badges.indexOf("explorer") === -1) awardBadge("explorer", "Explorador de la red");
}
export function recordSimPrediction(ok: boolean) {
  if (!ok) return;
  state = { ...state, simPredictionsOk: state.simPredictionsOk + 1 };
  save();
  addXP(15, "Predicción correcta");
  addCoins(2);
  if (state.simPredictionsOk >= 5) awardBadge("sim_detective", "Detective de la red");
}

export function awardBadge(b: Badge, label: string) {
  if (state.badges.indexOf(b) !== -1) return;
  state = { ...state, badges: [...state.badges, b] };
  save();
  toast({ icon: "🏅", title: "¡Medalla!", body: label, tone: "badge" });
  sfx.badge();
}

export function resetAll() {
  state = { ...DEFAULT };
  save();
}

export const BADGE_META: Record<Badge, { icon: string; label: string; desc: string }> = {
  first_step:      { icon: "🌱", label: "Primer paso",       desc: "Ganaste tu primer XP." },
  dns_master:      { icon: "📞", label: "Maestro del DNS",   desc: "Completaste la lección de DNS." },
  logic_wizard:    { icon: "🧙", label: "Mago de la lógica", desc: "Dominaste operadores lógicos." },
  quiz_perfect:    { icon: "💯", label: "Quiz perfecto",     desc: "100% en el quiz." },
  quiz_streak5:    { icon: "🔥", label: "Racha x5",           desc: "5 aciertos seguidos." },
  explorer:        { icon: "🌐", label: "Explorador",        desc: "Usaste el simulador." },
  sim_detective:   { icon: "🕵️", label: "Detective de red",  desc: "5 predicciones correctas." },
  scholar:         { icon: "🎓", label: "Erudito",           desc: "Todas las lecciones completadas." },
  level_5:         { icon: "⭐", label: "Nivel 5",            desc: "Alcanzaste el nivel 5." },
};

/* ---- React hook ---- */
export function useStats(): Stats {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
  return state;
}
