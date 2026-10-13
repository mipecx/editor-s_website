/* Шапка и указатель сцен: справа список сцен (десктоп), сверху полоса прогресса и имя сцены (телефон). */
import { esc } from "./dom.js";
import { motion, ScrollTrigger } from "./motion.js";

export const renderHeader = (D) => `
  <a class="logo" href="#film"><span class="mk" aria-hidden="true">${esc(D.logo)}</span><span>${esc(D.name)}</span></a>
  <span class="now mono" id="now" aria-hidden="true"></span>
  <button class="snd" id="snd" type="button" aria-pressed="false">
    <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="sndt">${esc(D.sound.off)}</span>
  </button>
  <a class="btn cta-top" href="${esc(D.telegram)}" target="_blank" rel="noopener">${esc(D.headerCta)}</a>
  <i class="prog" id="prog" aria-hidden="true"></i>`;

export function initNav(sections, labels) {
  const aside = document.createElement("nav");
  aside.className = "scenes";
  aside.setAttribute("aria-label", "Сцены");
  aside.innerHTML = `<ol>${labels.map((l, i) => `<li><button type="button" data-i="${i}"><span class="mono">${String(i + 1).padStart(2, "0")}</span><b>${esc(l)}</b></button></li>`).join("")}</ol>`;
  document.body.appendChild(aside);
  const btns = [...aside.querySelectorAll("button")], now = document.getElementById("now"), prog = document.getElementById("prog");

  const setActive = (i) => {
    btns.forEach((b, k) => (k === i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
    now.textContent = labels[i] || "";
  };
  btns.forEach((b) => b.addEventListener("click", () => motion.scrollTo(sections[+b.dataset.i])));
  /* у закреплённой сцены длина — вся обёртка закрепления (pin-spacer), а не один экран */
  const span = (s) => (s.parentElement.classList.contains("pin-spacer") ? s.parentElement : s);
  sections.forEach((s, i) => ScrollTrigger.create({ trigger: span(s), start: "top 55%", end: "bottom 55%", onToggle: (e) => e.isActive && setActive(i) }));
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (e) => prog.style.setProperty("--p", e.progress.toFixed(4)) });
  setActive(0);
}
