/* Звук: всё синтезируется WebAudio, ни одного аудиофайла. Включается кнопкой, выбор запоминается. */
const KEY = "snd";
let ctx = null, master = null, noise = null, on = false, sw = null, swT = 0;
const last = {};
const rate = (k, ms) => { const n = performance.now(); if (n - (last[k] || 0) < ms) return false; last[k] = n; return true; };
try { on = localStorage.getItem(KEY) === "1"; } catch (e) {}

function boot() {
  if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  master = ctx.createGain(); master.gain.value = 0.7;
  master.connect(comp); comp.connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}
const ok = () => on && ctx && ctx.state === "running";
const out = (pan = 0) => {
  if (!ctx.createStereoPanner) return master;
  const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(master); return p;
};
function tone(type, f0, f1, dur, vol, pan = 0, delay = 0) {
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out(pan)); o.start(t); o.stop(t + dur + 0.03);
}
function burst(type, freq, q, dur, vol, pan = 0, delay = 0) {
  const t = ctx.currentTime + delay, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(out(pan)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
}

export const sfx = {
  get on() { return on; },
  onHit: null,
  async toggle() {
    on = !on;
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {}
    if (on) { boot(); if (ctx) await ctx.resume(); if (ok()) sfx.chime(); }
    return on;
  },
  unlock() { if (on) boot(); },
  _hit() { sfx.onHit && sfx.onHit(); },
  cut(pan = 0) { if (!ok() || !rate("cut", 30)) return; burst("highpass", 5000, 0.7, 0.05, 0.45, pan); tone("square", 2400, 900, 0.03, 0.07, pan); sfx._hit(); },
  tick(f = 2200, pan = 0, vol = 0.07) { if (!ok() || !rate("tick", 25)) return; tone("triangle", f, f * 0.8, 0.03, vol, pan); },
  press() { if (!ok() || !rate("press", 40)) return; tone("sine", 320, 160, 0.06, 0.16); burst("highpass", 3000, 0.7, 0.02, 0.1); },
  hover(i = 0) { if (!ok() || !rate("hover", 70)) return; const f = 1100 + (i % 5) * 120; tone("sine", f, f, 0.04, 0.03); },
  thud() { if (!ok()) return; tone("sine", 130, 45, 0.16, 0.5); burst("lowpass", 400, 0.7, 0.06, 0.3); sfx._hit(); },
  clap() { if (!ok()) return; burst("bandpass", 1900, 0.8, 0.07, 0.9); tone("sine", 150, 55, 0.14, 0.6); burst("lowpass", 700, 0.5, 0.25, 0.25, 0, 0.01); sfx._hit(); },
  pop(up = true) { if (!ok() || !rate("pop", 60)) return; tone("sine", up ? 420 : 720, up ? 760 : 380, 0.07, 0.12); },
  chime() { if (!ok()) return; tone("sine", 880, 880, 0.5, 0.1); tone("sine", 1320, 1320, 0.6, 0.08, 0, 0.08); tone("sine", 1760, 1760, 0.7, 0.05, 0, 0.16); },
  projector() {
    if (!ok()) return;
    for (let i = 0; i < 14; i++) burst("bandpass", 1200 + Math.random() * 400, 2, 0.03, 0.25 * (1 - i / 16), 0, i * 0.042);
    burst("lowpass", 300, 0.5, 0.7, 0.18); sfx._hit();
  },
  swoosh(v) {
    if (!ok()) return;
    if (!sw) {
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noise; s.loop = true; f.type = "bandpass"; f.Q.value = 1.2; g.gain.value = 0;
      s.connect(f); f.connect(g); g.connect(master); s.start(); sw = { f, g };
    }
    const t = ctx.currentTime;
    sw.f.frequency.setTargetAtTime(300 + v * 3200, t, 0.05);
    sw.g.gain.setTargetAtTime(Math.min(0.2, v * 0.35), t, 0.04);
    clearTimeout(swT); swT = setTimeout(() => sw.g.gain.setTargetAtTime(0, ctx.currentTime, 0.08), 120);
  },
};
