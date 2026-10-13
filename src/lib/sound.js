/* Звук зала: всё синтезируется WebAudio, без файлов.
   AudioContext создаётся только после выбора пользователя. Нет WebAudio — сайт просто молчит. */
const KEY = "v5-sound";
let ctx = null, master = null, noise = null, room = null, on = false;
const last = {};
const rate = (k, ms) => { const n = performance.now(); if (n - (last[k] || 0) < ms) return false; last[k] = n; return true; };

function boot() {
  if (ctx) return ctx.state === "suspended" ? ctx.resume().catch(() => {}) : null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try { ctx = new AC(); } catch (e) { ctx = null; return; }
  const comp = ctx.createDynamicsCompressor();
  master = ctx.createGain(); master.gain.value = 0;
  master.connect(comp); comp.connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  roomTone();
  document.addEventListener("visibilitychange", () => fade(document.hidden || !on ? 0 : 0.8, 0.3));
}
const ready = () => on && ctx && ctx.state === "running";
const fade = (v, sec = 0.6) => { if (master) master.gain.setTargetAtTime(v, ctx.currentTime, sec / 3); };

/* фон: низкий гул проектора и тихое «дрожание» шторки */
function roomTone() {
  const g = ctx.createGain(); g.gain.value = 0.035; g.connect(master);
  [55, 110].forEach((f, i) => { const o = ctx.createOscillator(); o.frequency.value = f; const og = ctx.createGain(); og.gain.value = i ? 0.25 : 0.5; o.connect(og); og.connect(g); o.start(); });
  const s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), ng = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
  s.buffer = noise; s.loop = true; lp.type = "bandpass"; lp.frequency.value = 900; lp.Q.value = 0.8; ng.gain.value = 0.35;
  lfo.frequency.value = 24; lg.gain.value = 0.15; lfo.connect(lg); lg.connect(ng.gain);
  s.connect(lp); lp.connect(ng); ng.connect(g); s.start(); lfo.start();
  room = g;
}

function tone(type, f0, f1, dur, vol, pan = 0, delay = 0) {
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out(pan)); o.start(t); o.stop(t + dur + 0.03);
}
function burst(type, freq, q, dur, vol, pan = 0, delay = 0) {
  const t = ctx.currentTime + delay, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(out(pan)); s.start(t, Math.random()); s.stop(t + dur + 0.03);
}
const out = (pan) => {
  if (!ctx.createStereoPanner) return master;
  const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(master); return p;
};

export const sound = {
  get on() { return on; },
  saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
  enable() {
    on = true; boot(); fade(0.8);
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
  },
  disable() {
    on = false; fade(0, 0.4);
    try { localStorage.setItem(KEY, "0"); } catch (e) {}
  },
  /* мягкий щелчок склейки */
  cut(pan = 0) { if (!ready() || !rate("cut", 40)) return; burst("highpass", 4200, 0.7, 0.04, 0.25, pan); tone("sine", 1800, 700, 0.035, 0.05, pan); },
  /* смена сцены: глухой «шорх» плёнки */
  scene() { if (!ready() || !rate("scene", 400)) return; burst("lowpass", 600, 0.6, 0.22, 0.18); tone("sine", 140, 60, 0.18, 0.12); },
  hover() { if (!ready() || !rate("hover", 90)) return; tone("sine", 1250, 1250, 0.04, 0.02); },
  clap() { if (!ready()) return; burst("bandpass", 1900, 0.8, 0.07, 0.8); tone("sine", 150, 55, 0.14, 0.5); burst("lowpass", 700, 0.5, 0.25, 0.2, 0, 0.01); },
};
