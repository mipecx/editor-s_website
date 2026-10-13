/* Сцена 0 — вход в зал: выбор «со звуком / без звука», потом гаснет свет. */
import { esc } from "../lib/dom.js";

export const id = "entry";

export const render = (D) => `
<div id="entry" class="entry" role="dialog" aria-modal="true" aria-labelledby="entry-t" aria-describedby="entry-d">
  <div class="entry-screen" aria-hidden="true"></div>
  <div class="entry-in">
    <p class="mono">Сеанс начинается</p>
    <h1 id="entry-t" class="entry-t">${esc(D.name)}</h1>
    <p id="entry-d" class="entry-d">${esc(D.entry.line)}</p>
    <div class="entry-btns">
      <button type="button" class="btn big" data-s="1">${esc(D.entry.withSound)}</button>
      <button type="button" class="btn big ghost" data-s="0">${esc(D.entry.noSound)}</button>
    </div>
    <p class="entry-note">${esc(D.entry.note)}</p>
  </div>
</div>`;

export function init(root, { motion, sound, syncSound }) {
  const [yes, no] = root.querySelectorAll("button");
  motion.stop();
  const prev = sound.saved() === "0" ? no : yes;
  if (sound.saved() !== null) prev.classList.add("prev");
  prev.focus();

  return new Promise((resolve) => {
    const choose = (withSound) => {
      document.removeEventListener("keydown", onKey);
      withSound ? sound.enable() : sound.disable();
      syncSound();
      const finish = () => { root.hidden = true; motion.resume(); resolve(); };
      document.documentElement.classList.add("lights-down");
      if (motion.reduced) return finish();
      root.classList.add("out");
      setTimeout(finish, 1100);
    };
    const onKey = (e) => {
      if (e.key === "Escape") choose(false);
      /* фокус не уходит из диалога */
      if (e.key === "Tab") { e.preventDefault(); (document.activeElement === yes ? no : yes).focus(); }
    };
    document.addEventListener("keydown", onKey);
    yes.addEventListener("click", () => choose(true));
    no.addEventListener("click", () => choose(false));
  });
}
