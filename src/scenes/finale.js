/* Сцена 7 — финальные титры: «кто делал ролик», призыв и хлопушка «Мотор!» у кнопки Telegram. */
import { esc } from "../lib/dom.js";
import { gsap } from "../lib/motion.js";

export const id = "finale";

/* плоская хлопушка: запасной вариант без WebGL и картинка до загрузки 3D */
const FLAT = `<svg class="clap-flat" viewBox="0 0 220 170" aria-hidden="true">
  <g class="clap-top"><rect x="10" y="20" width="200" height="30" rx="4" fill="#16140f" stroke="#f2ede4" stroke-width="3"/>
    <path d="M30 20l22 30M70 20l22 30M110 20l22 30M150 20l22 30" stroke="#ff5a36" stroke-width="12"/></g>
  <rect x="10" y="56" width="200" height="104" rx="6" fill="#16140f" stroke="#f2ede4" stroke-width="3"/>
  <path d="M10 92h200M10 126h200M80 56v36M150 56v36" stroke="#2a2620" stroke-width="3"/>
  <circle cx="186" cy="143" r="7" fill="#ff5a36"/></svg>`;

const hasWebGL = () => {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
};

export const render = (D) => `
<section id="finale" class="scene finale" data-scene>
  <div class="wrap fin-in">
    <dl class="credits">${D.finale.credits.map(([r, n]) => `<div class="credit"><dt class="mono">${esc(r)}</dt><dd>${esc(n)}</dd></div>`).join("")}</dl>
    <div class="fin-main">
      <div class="fin-copy">
        <h2 class="h2 fin-t">${esc(D.finale.title)}</h2>
        <a class="btn big fin-cta" href="${esc(D.telegram)}" target="_blank" rel="noopener">${esc(D.finale.cta)}</a>
      </div>
      <div class="clapper" aria-hidden="true">${FLAT}<p class="motor mono">${esc(D.finale.motor)}</p></div>
    </div>
  </div>
</section>`;

export const renderFooter = (D) => `
  <div class="wrap foot-in">
    <b>${esc(D.name)}</b>
    <a href="${esc(D.telegram)}" target="_blank" rel="noopener">Telegram ${esc(D.telegramLabel)}</a>
    <span class="mono">${esc(D.version)}</span>
  </div>`;

export function init(root, { D, motion, sound }) {
  const host = root.querySelector(".clapper"), cta = root.querySelector(".fin-cta");
  let api = null, lastClap = 0;
  const flash = () => { host.classList.remove("hit"); void host.offsetWidth; host.classList.add("hit"); };
  const clap = () => {
    /* наведение и нажатие подряд — один хлопок */
    const now = performance.now(); if (now - lastClap < 600) return; lastClap = now;
    if (api) return api.clap();
    flash(); sound.clap();
  };
  ["pointerenter", "focus", "click"].forEach((ev) => cta.addEventListener(ev, clap));
  host.addEventListener("click", clap);

  if (!motion.reduced) {
    gsap.from(root.querySelectorAll(".credit"), {
      opacity: 0, y: 60, stagger: 0.15, ease: "none",
      scrollTrigger: { trigger: root.querySelector(".credits"), start: "top 90%", end: "bottom 45%", scrub: true },
    });
  }
  if (!hasWebGL()) return;
  /* 3D грузится, только когда финал близко */
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    import("./clapper3d.js").then((m) => {
      api = m.mount(host, { scene: D.name, take: "01", reduced: motion.reduced, onClap: () => { flash(); sound.clap(); } });
      host.classList.add("has3d");
    }).catch(() => {});
  }, { rootMargin: "600px" }).observe(host);
}
