/* Сцена 2 — до / после: прокрутка проходит 4 шага монтажа на одном кадре, потом — ручное сравнение. */
import { esc, clamp } from "../lib/dom.js";
import { stepAt } from "../lib/content.js";
import { ScrollTrigger } from "../lib/motion.js";

export const id = "ba";

/* волна звука: столбики, в «сыром» варианте — с провалами-паузами */
const wave = () => Array.from({ length: 40 }, (_, i) => {
  const gap = (i >= 9 && i <= 14) || (i >= 26 && i <= 29);
  return `<i class="${gap ? "gap" : ""}" style="--h:${24 + ((i * 53) % 62)}%"></i>`;
}).join("");

const frame = (kind, src) => src
  ? `<video class="fr-media" src="${esc(src)}" muted playsinline loop preload="metadata" aria-hidden="true"></video>`
  : `<div class="fr-media fr-draw" aria-hidden="true"><i class="hd"></i><i class="bd"></i></div>`;

const layer = (kind, D) => `
  <div class="layer ${kind}">
    ${frame(kind, kind === "raw" ? D.ba.raw : D.ba.fin)}
    <div class="hook mono">00:00 — 00:03 · крючок</div>
    <p class="sub"><span class="sub-raw">эээ… ну…</span><span class="sub-fin">Держит <mark>с первой</mark> секунды</span></p>
    <div class="wave">${wave()}</div>
  </div>`;

export const render = (D) => `
<section id="ba" class="scene ba" data-scene data-step="-1">
  <div class="wrap ba-grid">
    <div class="ba-text">
      <h2 class="h2">${esc(D.ba.title)}</h2>
      <p class="lead">${esc(D.ba.lead)}</p>
      <ol class="ba-steps">${D.ba.steps.map((s, i) => `<li data-i="${i}"><span class="mono">${String(i + 1).padStart(2, "0")}</span><div><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div></li>`).join("")}</ol>
    </div>
    <div class="ba-stage">
      <div class="ba-screen" style="--x:0%">
        ${layer("live", D)}
        ${layer("raw", D)}
        <span class="tag tag-raw mono">${esc(D.ba.rawTag)}</span><span class="tag tag-fin mono">${esc(D.ba.finTag)}</span>
        <button class="knob" type="button" role="slider" aria-label="${esc(D.ba.compare)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="-1">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/></svg>
        </button>
      </div>
      <p class="hint ba-hint">${esc(D.ba.compare)}</p>
    </div>
  </div>
</section>`;

export function init(root, { motion, sound }) {
  const screen = root.querySelector(".ba-screen"), knob = root.querySelector(".knob"), items = [...root.querySelectorAll(".ba-steps li")];
  const videos = [...root.querySelectorAll("video")];
  let x = 50, compare = false;

  const setStep = (k) => {
    if (String(k) === root.dataset.step) return;
    if (+root.dataset.step < k) sound.cut();
    root.dataset.step = k;
    items.forEach((li, i) => (i === k ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current")));
  };
  const setX = (v) => { x = clamp(v, 0, 100); screen.style.setProperty("--x", x + "%"); knob.setAttribute("aria-valuenow", Math.round(x)); };
  const setCompare = (on) => {
    if (on === compare) return;
    compare = on; root.classList.toggle("compare", on); knob.tabIndex = on ? 0 : -1;
    setX(on ? 50 : 0);
  };

  /* ручное сравнение: тянуть по кадру или стрелками */
  let drag = false;
  const fromPointer = (e) => { const r = screen.getBoundingClientRect(); setX(((e.clientX - r.left) / r.width) * 100); };
  screen.addEventListener("pointerdown", (e) => { if (!compare) return; drag = true; screen.setPointerCapture(e.pointerId); fromPointer(e); });
  screen.addEventListener("pointermove", (e) => drag && fromPointer(e));
  ["pointerup", "pointercancel"].forEach((t) => screen.addEventListener(t, () => (drag = false)));
  knob.addEventListener("keydown", (e) => {
    const d = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
    if (d) { e.preventDefault(); setX(x + d); }
    if (e.key === "Home") setX(0);
    if (e.key === "End") setX(100);
  });

  /* видео играют только пока сцена на экране */
  if (videos.length) new IntersectionObserver(([e]) => videos.forEach((v) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()))).observe(screen);

  if (motion.reduced) { setStep(3); setCompare(true); return; }
  ScrollTrigger.create({
    trigger: root, start: "top top", end: "+=260%", pin: true, scrub: true,
    onUpdate: ({ progress: p }) => {
      setStep(p < 0.08 ? -1 : stepAt((p - 0.08) / 0.8, 4));
      setCompare(p > 0.9);
    },
  });
}
