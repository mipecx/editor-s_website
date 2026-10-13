/* Кинозал: ролик раскрывается из афиши на весь экран. Esc, × или клик по залу — закрыть. */
import { esc } from "./dom.js";

let el = null, scr = null, cap = null, x = null, from = null, env = null, busy = false;

const media = (w, D) => w.hasVideo
  ? `<video src="${esc(w.video)}" ${w.poster ? `poster="${esc(w.poster)}"` : ""} controls autoplay playsinline></video>`
  : `<div class="th-soon"><span class="mono">${esc(w.tag)}</span><p>${esc(D.works.soon)}</p></div>`;

export function setupTheater(ctx) {
  env = ctx;
  el = document.createElement("div");
  el.className = "theater"; el.hidden = true;
  el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", ctx.D.works.title);
  el.innerHTML = `<div class="th-scr"></div><p class="th-cap"></p>
    <button class="th-x" type="button" aria-label="${esc(ctx.D.works.close)}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
  document.body.appendChild(el);
  scr = el.querySelector(".th-scr"); cap = el.querySelector(".th-cap"); x = el.querySelector(".th-x");
  x.addEventListener("click", closeTheater);
  el.addEventListener("click", (e) => { if (e.target === el) closeTheater(); });
  document.addEventListener("keydown", (e) => {
    if (el.hidden) return;
    if (e.key === "Escape") closeTheater();
    if (e.key === "Tab") {
      const f = [...el.querySelectorAll("button, video[controls]")];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
}

const flip = (a, b) => `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})`;

export function openTheater(w, fromEl) {
  if (busy || !el.hidden) return;
  from = fromEl;
  scr.className = "th-scr r" + w.ratio.replace(":", "x");
  scr.innerHTML = media(w, env.D);
  cap.innerHTML = `<b>${esc(w.tag)}</b> ${esc(w.sub)}`;
  el.hidden = false;
  env.motion.stop(); env.sound.scene();
  x.focus({ preventScroll: true });
  if (env.motion.reduced || !scr.animate) return;
  busy = true;
  void el.offsetWidth; el.classList.add("on");
  scr.animate([{ transform: flip(fromEl.getBoundingClientRect(), scr.getBoundingClientRect()), opacity: 0.6 }, { transform: "none", opacity: 1 }],
    { duration: 700, easing: "cubic-bezier(.2,.9,.2,1)" }).finished.finally(() => (busy = false));
}

export function closeTheater() {
  if (el.hidden || busy) return;
  const v = scr.querySelector("video"); v && v.pause();
  const done = () => { el.hidden = true; el.classList.remove("on"); scr.innerHTML = ""; env.motion.resume(); from && from.focus({ preventScroll: true }); busy = false; };
  if (env.motion.reduced || !scr.animate) return done();
  busy = true; el.classList.remove("on");
  scr.animate([{ transform: "none" }, { transform: flip(from.getBoundingClientRect(), scr.getBoundingClientRect()), opacity: 0 }],
    { duration: 450, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" }).finished.finally(done);
}
