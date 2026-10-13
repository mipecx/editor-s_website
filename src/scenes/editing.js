/* Сцена 4 — как я монтирую: прокрутка ведёт плейхед по таймлайну, на метках — принципы. */
import { esc } from "../lib/dom.js";
import { timecode } from "../lib/content.js";
import { ScrollTrigger } from "../lib/motion.js";

export const id = "editing";

export function render(D) {
  const P = D.pr, pct = (v) => (v / P.total) * 100;
  return `
<section id="editing" class="scene editing" data-scene>
  <div class="wrap ed-in">
    <div class="ed-head"><h2 class="h2">${esc(P.title)}</h2><p class="lead">${esc(P.lead)}</p></div>
    <div class="ed-points" aria-live="polite">
      ${P.points.map((pt, i) => `<article class="ed-point" data-i="${i}"><span class="mono">${timecode(pt.at)}</span><h3>${esc(pt.h)}</h3><p>${esc(pt.p)}</p></article>`).join("")}
    </div>
    <div class="tl" aria-hidden="true">
      <div class="tl-ruler">${P.points.map((pt) => `<i style="left:${pct(pt.at)}%"></i>`).join("")}</div>
      ${P.tracks.map((t) => `<div class="tl-row k-${t.kind}"><span class="tl-name mono">${esc(t.name)}</span>
        <div class="tl-lane">${t.clips.map((c) => `<span class="clip" style="flex:${c.len}">${esc(c.t)}</span>`).join("")}</div></div>`).join("")}
      <div class="tl-head"><span class="tl-tc mono">00:00</span></div>
    </div>
  </div>
</section>`;
}

export function init(root, { D, motion, sound }) {
  const P = D.pr, points = [...root.querySelectorAll(".ed-point")], tc = root.querySelector(".tl-tc");
  const lanes = [...root.querySelectorAll(".tl-lane")].map((lane, li) => {
    let acc = 0;
    return [...lane.children].map((el, ci) => { const len = P.tracks[li].clips[ci].len, a = acc; acc += len; return { el, a, b: acc }; });
  });
  if (motion.reduced) { root.classList.add("list"); return; }

  let active = -2;
  const setPoint = (k) => {
    if (k === active) return;
    if (k > active) sound.cut();
    active = k;
    points.forEach((p, i) => p.classList.toggle("on", i === k));
    root.classList.toggle("idle", k < 0);
  };
  ScrollTrigger.create({
    trigger: root, start: "top top", end: "+=220%", pin: true, scrub: true,
    onUpdate: ({ progress }) => {
      const t = progress * P.total;
      root.style.setProperty("--ph", progress.toFixed(4));
      tc.textContent = timecode(t);
      lanes.forEach((clips) => clips.forEach((c) => c.el.classList.toggle("live", t >= c.a && t < c.b)));
      let k = -1;
      P.points.forEach((pt, i) => { if (t >= pt.at) k = i; });
      setPoint(k);
    },
  });
  setPoint(-1);
}
