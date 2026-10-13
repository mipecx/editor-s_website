/* Сцена 3 — работы: лента афиш едет вбок от вертикальной прокрутки; нажатие открывает кинозал. */
import { esc } from "../lib/dom.js";
import { normalizeWork } from "../lib/content.js";
import { gsap } from "../lib/motion.js";
import { setupTheater, openTheater } from "../lib/theater.js";

export const id = "works";

const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';

const poster = (w, i, D) => `
  <button class="poster r${w.ratio.replace(":", "x")} a${i % 5}" type="button" data-i="${i}" aria-label="Смотреть: ${esc(w.tag)}, ${esc(w.sub)}">
    ${w.poster ? `<img src="${esc(w.poster)}" alt="" loading="lazy" />` : `<span class="soon">${esc(D.works.soon)}</span>`}
    <span class="pl">${PLAY}</span>
    <span class="meta"><b>${esc(w.tag)}</b><span>${esc(w.sub)}</span></span>
  </button>`;

export const render = (D) => `
<section id="works" class="scene works" data-scene>
  <div class="wrap works-head"><h2 class="h2">${esc(D.works.title)}</h2><p class="hint">${esc(D.works.hint)}</p></div>
  <div class="reel"><div class="track">${D.works.items.map((it, i) => poster(normalizeWork(it), i, D)).join("")}</div></div>
</section>`;

export function init(root, ctx) {
  const items = ctx.D.works.items.map(normalizeWork), track = root.querySelector(".track");
  setupTheater(ctx);
  track.addEventListener("click", (e) => { const b = e.target.closest(".poster"); if (b) openTheater(items[+b.dataset.i], b); });
  if (ctx.motion.reduced) return root.classList.add("static");
  const dist = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
  const tween = gsap.to(track, {
    x: () => -dist(), ease: "none",
    scrollTrigger: { trigger: root, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true },
  });
  /* Tab по афишам: докручиваем страницу так, чтобы афиша в фокусе была на экране */
  track.addEventListener("focusin", (e) => {
    const b = e.target.closest(".poster"), st = tween.scrollTrigger;
    if (!b || !st || !dist()) return;
    const k = Math.min(1, Math.max(0, (b.offsetLeft - innerWidth * 0.3) / dist()));
    ctx.motion.scrollTo(st.start + k * (st.end - st.start));
  });
}
