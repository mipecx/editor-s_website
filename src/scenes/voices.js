/* Сцена 6 — отзывы и частые вопросы. */
import { esc } from "../lib/dom.js";
import { gsap, ScrollTrigger } from "../lib/motion.js";

export const id = "voices";

const by = (r) => (r.url && r.url !== "#"
  ? ` · <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.link)}</a>`
  : ` · ${esc(r.link)}`);

export const render = (D) => `
<section id="voices" class="scene voices" data-scene>
  <div class="wrap">
    <h2 class="h2">${esc(D.reviews.title)}</h2>
    <div class="reviews">${D.reviews.items.map((r) => `<figure class="review rv">
      ${r.draft ? `<span class="draft mono">${esc(D.reviews.draftLabel)}</span>` : ""}
      <blockquote>«${esc(r.text)}»</blockquote>
      <figcaption><b>${esc(r.name)}</b>${by(r)}</figcaption>
    </figure>`).join("")}</div>

    <div class="faq">
      <h2 class="h2">${esc(D.faq.title)}</h2>
      <div class="qa-list">${D.faq.items.map((f) => `<details class="qa"><summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary><div class="qa-a"><p>${esc(f.a)}</p></div></details>`).join("")}</div>
    </div>
  </div>
</section>`;

export function init(root, { motion, sound }) {
  root.querySelectorAll("details").forEach((d) => d.addEventListener("toggle", () => d.open && sound.cut()));
  if (motion.reduced) return;
  const rv = root.querySelectorAll(".rv");
  gsap.set(rv, { opacity: 0, y: 28 });
  ScrollTrigger.batch(rv, { start: "top 88%", once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12 }) });
}
