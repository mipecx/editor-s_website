/* Сцена 5 — что беру и как работаем. Спокойно: появление по прокрутке и линия шагов. */
import { esc } from "../lib/dom.js";
import { gsap, ScrollTrigger } from "../lib/motion.js";

export const id = "services";

const ICONS = {
  vertical: '<rect x="34" y="6" width="44" height="100" rx="8"/><path d="M50 46v20l18-10z" fill="currentColor" stroke="none"/>',
  horizontal: '<rect x="6" y="28" width="100" height="56" rx="8"/><path d="M48 44v24l22-12z" fill="currentColor" stroke="none"/>',
  calendar: '<rect x="10" y="18" width="92" height="84" rx="8"/><path d="M10 42h92M34 8v20M78 8v20"/><path d="M30 62h12M50 62h12M70 62h12M30 80h12M50 80h12" stroke-width="5"/>',
};

export const render = (D) => `
<section id="services" class="scene services" data-scene>
  <div class="wrap">
    <h2 class="h2">${esc(D.formats.title)}</h2>
    <div class="fmts">${D.formats.items.map((f) => `<article class="fmt rv">
      <svg viewBox="0 0 112 112" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">${ICONS[f.icon] || ""}</svg>
      <h3>${esc(f.h)}</h3><p>${esc(f.p)}</p></article>`).join("")}</div>
    <p class="outro rv">${esc(D.formats.outro)}</p>

    <h2 class="h2 proc-t">${esc(D.proc.title)}</h2>
    <ol class="steps"><i class="steps-line" aria-hidden="true"></i>${D.proc.steps.map((s, i) => `<li class="step rv">
      <span class="step-n mono">Шаг ${i + 1}</span><div><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div></li>`).join("")}</ol>
  </div>
</section>`;

export function init(root, { motion }) {
  if (motion.reduced) return;
  const rv = root.querySelectorAll(".rv");
  gsap.set(rv, { opacity: 0, y: 28 });
  ScrollTrigger.batch(rv, { start: "top 86%", once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }) });
  const steps = root.querySelector(".steps");
  gsap.fromTo(root.querySelector(".steps-line"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: steps, start: "top 70%", end: "bottom 60%", scrub: true } });
}
