/* Сцена 1 — открытие: заголовок «как прислали», прокрутка вырезает слова-паразиты. */
import { esc } from "../lib/dom.js";
import { parseFillers } from "../lib/content.js";
import { ScrollTrigger } from "../lib/motion.js";

export const id = "opening";

export function render(D) {
  const words = parseFillers(D.hero.raw);
  const clean = words.filter((w) => !w.filler).map((w) => w.t).join(" ");
  const h1 = words.map((w) => (w.filler ? `<s class="filler"><span>${esc(w.t)}&nbsp;</span></s>` : `${esc(w.t)} `)).join("");
  return `
<section id="opening" class="scene opening" data-scene>
  <div class="op-glow" aria-hidden="true"></div>
  <div class="wrap op-in">
    <h1 class="op-t" aria-label="${esc(clean)}"><span aria-hidden="true">${h1}</span></h1>
    <p class="hint op-hint">${esc(D.hero.hint)}</p>
    <div class="op-after">
      <p class="lead">${esc(D.hero.lead)}</p>
      <a class="btn big" href="${esc(D.telegram)}" target="_blank" rel="noopener">${esc(D.hero.cta)}</a>
    </div>
  </div>
</section>`;
}

export function init(root, { motion, sound }) {
  const fillers = [...root.querySelectorAll(".filler")], after = root.querySelector(".op-after"), n = fillers.length;
  if (motion.reduced) {
    fillers.forEach((f) => f.classList.add("gone"));
    after.classList.add("in");
    root.classList.add("done");
    return;
  }
  /* паразит i вырезается на своей доле прокрутки; перед этим ~0.07 он «помечен» */
  const at = (i) => 0.12 + (i / n) * 0.62;
  const st = ScrollTrigger.create({
    trigger: root, start: "top top", end: "+=130%", pin: true, scrub: true,
    onUpdate: ({ progress: p }) => {
      root.style.setProperty("--p", p.toFixed(3));
      fillers.forEach((f, i) => {
        const gone = p >= at(i), mark = p >= at(i) - 0.07;
        if (gone !== f.classList.contains("gone")) { f.classList.toggle("gone", gone); if (gone) sound.cut((i / n - 0.5) * 1.2); }
        f.classList.toggle("mark", mark);
      });
      after.classList.toggle("in", p > 0.8);
      root.classList.toggle("done", p > 0.8);
    },
  });
  /* Tab на ещё невидимую кнопку — докручиваем сцену до конца, чтобы она проявилась */
  after.addEventListener("focusin", () => { if (!after.classList.contains("in")) motion.scrollTo(st.end); });
}
