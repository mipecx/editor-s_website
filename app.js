import { DATA as D } from "./data.js";
import { sfx } from "./audio.js";

/* ---------- утилиты ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, "0");
const tc = (s) => `00:${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;
const cap = (s) => (s === "YOUTUBE" ? "YouTube" : s.charAt(0) + s.slice(1).toLowerCase());
const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const raf = requestAnimationFrame;
const TG = D.telegram;
const S = { p: 0, px: 0, py: 0, pulse: 0, sy: 0 }; /* состояние hero для 3D-сцены */
const I = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arrows: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/></svg>',
};

/* ---------- разметка ---------- */
const sec = (id, cls, inner) => `<section id="${id}" class="${cls}">${inner}</section>`;

function header() {
  return `<a class="logo" href="#hero" aria-label="${D.name}"><span class="mk">${D.logo}</span><span>${D.name}</span></a>
  <nav aria-label="Разделы">${D.nav.map(([id, t]) => `<a href="#${id}">${t}</a>`).join("")}</nav>
  <span class="tcode" id="tcode" aria-hidden="true">00:00:00</span>
  <button class="snd" id="snd" type="button" aria-pressed="false" aria-label="${D.snd.label}" data-tip="${D.snd.tip}"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="sndt">${D.snd.label}</span></button>
  <a class="btn mag" href="${TG}" target="_blank" rel="noopener">${D.headerCta}</a>`;
}

function hero() {
  const h = D.hero;
  const toks = h.raw.split(/\s+/).map((t) => (/^\{.*\}$/.test(t) ? { f: 1, t: t.slice(1, -1) } : { f: 0, t }));
  const words = toks.map((k) => (k.f ? `<span class="w f" aria-hidden="true">${k.t}</span>` : `<span class="w" aria-hidden="true">${k.t}</span> `)).join("");
  const blocks = toks.map((k) => `<i class="b${k.f ? " f" : ""}"></i>`).join("");
  return sec("hero", "d", `<div class="cv" id="cvh" aria-hidden="true"></div><div class="wrap">
    <h1 class="ht" aria-label="${h.title}">${words}</h1>
    <div class="trk" id="trk" role="slider" tabindex="0" aria-label="${h.slider}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div class="bl">${blocks}</div><u class="ph" id="hph"></u>
    </div>
    <p class="hint">${h.hint}</p>
    <div class="hrow"><p class="p">${h.lead}</p><a class="btn big mag" href="${TG}" target="_blank" rel="noopener">${h.cta}</a></div>
  </div>`);
}

function frame(k) {
  const bars = Array.from({ length: 36 }, (_, i) => {
    const gap = k === "raw" && ((i >= 8 && i <= 13) || (i >= 24 && i <= 27));
    return `<i style="height:${gap ? 6 : 22 + ((i * 53) % 61)}%"></i>`;
  }).join("");
  const sub = k === "fin" ? `<p class="sub">Держит <mark>с первой</mark> секунды</p>` : `<p class="sub dim">эээ… ну…</p>`;
  return `<div class="fr ${k}"><div class="wave">${bars}</div><div class="who"><i class="hd"></i><i class="bd"></i></div>${sub}</div>`;
}

function ba() {
  const b = D.ba;
  return sec("ba", "sec l", `<div class="wrap ba">
    <div><h2 class="h2">${b.title}</h2><ul class="pts">${b.points.map((p) => `<li>${p}</li>`).join("")}</ul></div>
    <div class="cmp" id="cmp">${frame("raw")}${frame("fin")}
      <span class="tg a">${cap(b.rawTag)}</span><span class="tg z">${cap(b.finTag)}</span>
      <button class="knob" role="slider" aria-label="${b.title}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><i>${I.arrows}</i></button>
    </div></div>`);
}

function works() {
  const w = D.works, touch = !fine;
  const items = w.items.map((it, i) => `<article class="shot ${it.v ? "v" : "h"}" data-i="${i}" tabindex="0" role="button" aria-label="${cap(it.tag)}: ${it.sub}"><div class="art a${i % 5}"></div>
    <i class="sheen"></i><div class="pl">${I.play}</div><div class="mt"><b>${cap(it.tag)}</b><span>${it.sub}</span></div><i class="pg"></i></article>`).join("");
  return sec("works", "sec d", `<div class="wrap head"><h2 class="h2">${w.title}</h2><p class="note">${touch ? w.noteTouch : w.note}</p></div>
    <div class="reel${fine ? " fine" : ""}" id="reel" tabindex="0" role="region" aria-label="${w.aria}"><div class="rail">${items}</div></div>
    <div class="rt" aria-hidden="true"><i id="rti"></i></div>`);
}

function mq() {
  const one = D.marquee.map((w) => `<span>${w}</span>${I.play}`).join("");
  return `<div class="mq" aria-hidden="true"><div class="mq-in" id="mq">${one}${one}${one}${one}</div></div>`;
}

function pr() {
  const p = D.pr, E = p.editor;
  const clip = (c) => `<div class="clip" data-id="${c.id}" data-t="${c.t}" style="--len:${c.len}" tabindex="0" role="button" aria-label="${c.t}. ${E.aria}"><div class="cl">${c.t}</div></div>`;
  const marks = p.points.map((pt, i) => `<i style="left:${clamp(secs(pt.time) / E.total, 0.02, 0.96) * 100}%"></i>`).join("");
  return sec("pr", "sec l", `<div class="wrap"><h2 class="h2">${p.title}</h2><p class="p" style="margin-top:20px">${p.note}</p>
    <div class="ed" id="ed">
      <div class="ed-top"><b>${p.screen}</b>
        <div class="ctl"><button class="go" id="edplay" type="button">${E.play}</button><button id="edreset" type="button">${E.reset}</button><span class="etc" id="edtc">00:00:00</span></div></div>
      <div class="ed-body"><div class="labs">${E.tracks.map((t) => `<span>${t.name}</span>`).join("")}</div>
        <div class="lanes"><div class="ruler" id="ruler">${marks}</div>
          ${E.tracks.map((t, i) => `<div class="lane" data-li="${i}" data-k="${t.kind}">${t.clips.map(clip).join("")}</div>`).join("")}
          <u class="eph" id="eph"></u></div></div>
      <p class="hint">${E.hint}</p><p class="sr" id="edlive" aria-live="polite"></p>
    </div>
    <div class="pts3">${p.points.map((pt, i) => `<button class="pt" type="button" data-i="${i}"><time>${pt.time}</time><h3>${pt.h}</h3><p>${pt.p}</p></button>`).join("")}</div></div>`);
}
const secs = (t) => t.split(":").reduce((a, v) => a * 60 + +v, 0);

function pause() {
  const lines = D.pause.html.split("<br>").map((l) => ({ m: /^<mark>/.test(l), w: l.replace(/<\/?mark>/g, "").split(/\s+/) }));
  const aria = lines.map((l) => l.w.join(" ")).join(" ");
  return sec("pause", "d", `<div class="pin"><p class="stmt" aria-label="${aria}">${lines.map((l) => `<span class="ln" aria-hidden="true">${l.w.map((w) => `<span class="pw${l.m ? " m" : ""}">${w}</span>`).join(" ")}</span>`).join("")}</p></div>`);
}

function formats() {
  const f = D.formats;
  const g = [
    `<svg class="gl" viewBox="0 0 112 112" fill="none" stroke="currentColor" stroke-width="3"><rect x="32" y="6" width="48" height="100" rx="8"/><rect class="fl" x="38" y="92" width="36" height="6" rx="3" fill="#3d5afe" stroke="none"/></svg>`,
    `<svg class="gl" viewBox="0 0 112 112" fill="none" stroke="currentColor" stroke-width="3"><rect x="4" y="26" width="104" height="60" rx="6"/><path d="M48 44v24l22-12z" fill="currentColor" stroke="none"/><rect class="fl" x="10" y="78" width="92" height="5" rx="2.5" fill="#3d5afe" stroke="none"/></svg>`,
    `<svg class="gl" viewBox="0 0 112 112" stroke="currentColor" stroke-width="3" fill="none">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${14 + (i % 4) * 28}" cy="${i < 4 ? 38 : 76}" r="9" fill="#fff"/>`).join("")}</svg>`,
  ];
  return sec("formats", "sec l", `<div class="wrap"><h2 class="h2">${f.title}</h2><div class="fm">
    ${f.items.map((it, i) => `<div class="row"><h3>${it.h}</h3><p>${it.p}</p>${g[i % 3]}</div>`).join("")}
    <p class="outro">${f.outro}</p></div></div>`);
}

function proc() {
  const p = D.proc;
  return sec("proc", "sec d", `<div class="wrap"><h2 class="h2">${p.title}</h2><div class="steps" id="steps"><i class="fillbar"></i>
    ${p.steps.map((s) => `<div class="stp"><div class="n">${s.n.replace(/\D/g, "")}</div><div><h3>${s.h}</h3><p>${s.p}</p></div></div>`).join("")}</div></div>`);
}

function reviews() {
  const r = D.reviews;
  return sec("rev", "sec l", `<div class="wrap"><h2 class="h2">${r.title}</h2>
    <p class="quote" id="rq" aria-live="polite"></p><p class="by" id="rb"></p>
    <div class="avs">${r.items.map((it, i) => `<button class="av" type="button" data-i="${i}" aria-label="${it.name}" aria-pressed="false">${it.av}</button>`).join("")}</div></div>`);
}

function faq() {
  const f = D.faq;
  return sec("faq", "sec d", `<div class="wrap fq"><h2 class="h2">${f.title}</h2><div>
    ${f.items.map((it, i) => `<div class="qa"><h3><button type="button" id="q${i}" aria-expanded="false" aria-controls="a${i}"><span>${it.q}</span><i class="px"></i></button></h3>
      <div class="ans" id="a${i}" role="region" aria-labelledby="q${i}"><div><p>${it.a}</p></div></div></div>`).join("")}</div></div>`);
}

function contact() {
  const c = D.contact, L = c.labels;
  return sec("contact", "sec l", `<div class="wrap cwrap"><div class="clap" id="clap" aria-hidden="true"></div><h2 class="hcta">${c.title}</h2>
    <div class="cta"><a class="btn big mag" href="${TG}" target="_blank" rel="noopener">${c.cta}</a></div>
    <form id="cf"><label>${L.a}<input name="a" required /></label><label>${L.b}<input name="b" required /></label><label>${L.c}<textarea name="c" rows="2"></textarea></label>
      <div><button class="btn k" type="submit">${c.submit}</button></div><p id="fok" role="status" hidden>${c.ok}</p></form></div>`);
}

$("#top").innerHTML = header();
$("#main").innerHTML = [hero(), ba(), works(), mq(), pr(), pause(), formats(), proc(), reviews(), faq(), contact()].join("");
$("#foot").innerHTML = `<b>${D.footer.name}</b><span>${D.footer.mono}</span>`;

/* ---------- hero: заголовок как таймлайн ---------- */
function initHero() {
  const h1 = $(".ht"), ws = $$(".w", h1), bs = $$(".b"), trk = $("#trk"), ph = $("#hph"), hero = $("#hero");
  const n = ws.length;
  let p = 0, tp = 0, loop = 0, w = 0, touched = false, ca = 0, caLoop = 0;
  const caStep = () => { ca *= 0.88; if (ca < 0.02) { ca = 0; h1.style.setProperty("--ca", 0); caLoop = 0; return; } h1.style.setProperty("--ca", ca.toFixed(3)); caLoop = raf(caStep); };
  const kick = (v) => { if (reduce) return; ca = Math.max(ca, v); if (!caLoop) caLoop = raf(caStep); };
  const measure = () => (w = trk.clientWidth);
  new ResizeObserver(measure).observe(trk);
  measure();
  const apply = () => {
    ws.forEach((el, i) => {
      const cut = (i + 0.5) / n <= p;
      if (el._c !== cut) {
        const first = el._c === undefined;
        el._c = cut; el.classList.toggle("cut", cut); bs[i].classList.toggle("cut", cut);
        if (!first) { kick(0.9); const pan = (i / n - 0.5) * 1.4; el.classList.contains("f") ? sfx.cut(pan) : sfx.tick(1700 + i * 45, pan, 0.05); }
      }
    });
    ph.style.transform = `translateX(${p * w}px)`;
    trk.setAttribute("aria-valuenow", Math.round(p * 100));
    S.p = p;
  };
  const step = () => { p += (tp - p) * 0.16; if (Math.abs(tp - p) < 0.0008) p = tp; apply(); loop = p === tp ? 0 : raf(step); };
  const go = (v) => { tp = clamp(v); if (!loop) loop = raf(step); };
  const take = () => { touched = true; };
  const fromX = (e) => { const r = hero.getBoundingClientRect(); go((e.clientX - r.left - r.width * 0.05) / (r.width * 0.9)); };
  const mv = (e) => {
    const r = hero.getBoundingClientRect();
    S.px = ((e.clientX - r.left) / r.width - 0.5) * 2; S.py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    hero.style.setProperty("--mx", S.px.toFixed(3)); hero.style.setProperty("--my", S.py.toFixed(3));
  };
  hero.addEventListener("pointermove", (e) => { take(); fromX(e); mv(e); });
  hero.addEventListener("pointerdown", (e) => { take(); fromX(e); });
  trk.addEventListener("keydown", (e) => {
    const k = { ArrowRight: 0.08, ArrowLeft: -0.08 }[e.key];
    if (k) { e.preventDefault(); take(); go(tp + k); } else if (e.key === "Home") go(0); else if (e.key === "End") go(1);
  });
  const ready = () => {
    ws.filter((x) => x.classList.contains("f")).forEach((f) => f.style.setProperty("--fw", (f.scrollWidth / parseFloat(getComputedStyle(f).fontSize) + 0.05).toFixed(2)));
    measure();
    if (reduce) { p = tp = 1; apply(); document.body.classList.add("in"); return; }
    setTimeout(() => {
      const t0 = performance.now(), ease = (k) => 1 - Math.pow(1 - k, 3);
      (function sweep(now) {
        if (touched) return;
        const k = clamp((now - t0) / 2800); p = tp = ease(k); apply();
        if (k < 1) raf(sweep);
      })(t0);
      setTimeout(() => document.body.classList.add("in"), 900);
    }, 500);
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(ready);
  apply();
}

/* ---------- до / после ---------- */
function initBA() {
  const el = $("#cmp"), kn = $(".knob", el);
  let cur = 0.5, drag = false, touched = false;
  const set = (v) => { cur = clamp(v, 0.04, 0.96); el.style.setProperty("--p", cur * 100 + "%"); kn.setAttribute("aria-valuenow", Math.round(cur * 100)); };
  const from = (e) => { const r = el.getBoundingClientRect(), v = (e.clientX - r.left) / r.width; sfx.swoosh(Math.min(1, Math.abs(v - cur) * 14)); set(v); };
  el.addEventListener("pointerdown", (e) => { touched = drag = true; el.setPointerCapture(e.pointerId); from(e); });
  el.addEventListener("pointermove", (e) => drag && from(e));
  ["pointerup", "pointercancel"].forEach((t) => el.addEventListener(t, () => (drag = false)));
  kn.addEventListener("keydown", (e) => {
    const k = { ArrowRight: 0.05, ArrowLeft: -0.05 }[e.key];
    if (k) { e.preventDefault(); touched = true; set(cur + k); }
  });
  if (reduce) return;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const t0 = performance.now();
    (function s(now) {
      const k = (now - t0) / 1700;
      if (touched) return;
      if (k >= 1) return set(0.5);
      set(0.5 + 0.26 * Math.sin(k * Math.PI * 2) * (1 - k)); raf(s);
    })(t0);
  }, { threshold: 0.6 });
  io.observe(el);
}

/* ---------- работы: лента с инерцией и курсором ---------- */
function initWorks() {
  const reel = $("#reel"), thumb = $("#rti"), cur = $("#cur"), labels = D.works.cur;
  const upd = () => {
    const sw = reel.scrollWidth, cw = reel.clientWidth;
    thumb.style.width = (cw / sw) * 100 + "%";
    thumb.style.left = (reel.scrollLeft / sw) * 100 + "%";
  };
  reel.addEventListener("scroll", upd, { passive: true });
  addEventListener("resize", upd); upd();
  /* 3D-карусель: кадры разворачиваются к центру */
  const shots = $$(".shot", reel);
  let lb = false;
  const lay = () => {
    lb = false;
    const rr = reel.getBoundingClientRect(), c = rr.left + rr.width / 2;
    shots.forEach((s) => {
      const r = s.getBoundingClientRect(), d = clamp(((r.left + r.width / 2) - c) / (rr.width / 2), -1.4, 1.4), a = Math.abs(d);
      s.style.setProperty("--cy", (-d * 16).toFixed(2) + "deg");
      s.style.setProperty("--tz", (-a * 70).toFixed(1) + "px");
      s.style.setProperty("--sc", (1 - a * 0.06).toFixed(3));
    });
  };
  const ql = () => { if (!lb) { lb = true; raf(lay); } };
  reel.addEventListener("scroll", ql, { passive: true });
  addEventListener("resize", ql); ql();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(ql);
  if (fine && !reduce) shots.forEach((s) => {
    s.addEventListener("pointermove", (e) => {
      const r = s.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      s.style.setProperty("--py", (nx * 16).toFixed(2) + "deg"); s.style.setProperty("--px", (-ny * 12).toFixed(2) + "deg");
      s.style.setProperty("--mx", ((nx + 0.5) * 100).toFixed(1) + "%"); s.style.setProperty("--my", ((ny + 0.5) * 100).toFixed(1) + "%");
    });
    s.addEventListener("pointerleave", () => { s.style.setProperty("--py", "0deg"); s.style.setProperty("--px", "0deg"); });
  });
  reel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") reel.scrollBy({ left: 320, behavior: "smooth" });
    if (e.key === "ArrowLeft") reel.scrollBy({ left: -320, behavior: "smooth" });
  });
  if (!fine) return;
  let down = false, sx = 0, sl = 0, v = 0, lx = 0, m = 0;
  reel.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true; reel._dragged = false; sx = lx = e.clientX; sl = reel.scrollLeft; v = 0; cancelAnimationFrame(m);
    const rl = $(".rail", reel); rl.style.transition = "none";
    reel.setPointerCapture(e.pointerId);
  });
  reel.addEventListener("pointermove", (e) => {
    if (!down) return;
    const want = sl - (e.clientX - sx), mx = reel.scrollWidth - reel.clientWidth, cl = clamp(want, 0, mx);
    reel.scrollLeft = cl; v = lx - e.clientX; lx = e.clientX;
    if (Math.abs(e.clientX - sx) > 5) reel._dragged = true;
    $(".rail", reel).style.transform = `translate3d(${((want - cl) * -0.35).toFixed(1)}px,0,0)`;
  });
  const up = () => {
    if (!down) return; down = false;
    const rl = $(".rail", reel); rl.style.transition = "transform .7s cubic-bezier(.34,1.56,.64,1)"; rl.style.transform = "";
    (function inertia() { reel.scrollLeft += v; v *= 0.94; if (Math.abs(v) > 0.4) m = raf(inertia); })();
  };
  reel.addEventListener("pointerup", up); reel.addEventListener("pointercancel", up);
  /* курсор */
  let x = 0, y = 0, cx = -200, cy = -200, s = 0, ts = 0, on = false, label = "";
  const move = () => {
    cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; s += (ts - s) * 0.18;
    cur.style.transform = `translate3d(${cx}px,${cy}px,0) scale(${s})`;
    cur.style.opacity = s > 0.02 ? 1 : 0;
    if (on || Math.abs(ts - s) > 0.01) raf(move); else cur.style.opacity = 0;
  };
  reel.addEventListener("pointerenter", () => { on = true; ts = 1; raf(move); });
  reel.addEventListener("pointerleave", () => { on = false; ts = 0; });
  reel.addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    const l = e.target.closest(".shot") ? labels[1] : labels[0];
    if (l !== label) { label = l; cur.textContent = l; }
  });
}

/* ---------- таймлайн-редактор ---------- */
function initEditor() {
  const E = D.pr.editor, ed = $("#ed"), lanes = $$(".lane", ed), lanesEl = $(".lanes", ed), ph = $("#eph"), tcEl = $("#edtc"), live = $("#edlive"), ruler = $("#ruler");
  const len = {}; E.tracks.forEach((t) => t.clips.forEach((c) => (len[c.id] = c.len)));
  const orig = E.tracks.map((t) => t.clips.map((c) => c.id));
  const st = orig.map((a) => a.slice());
  let p = 0, playing = false, t0 = 0, loop = 0, w = 0;
  const measure = () => (w = lanesEl.clientWidth);
  new ResizeObserver(measure).observe(lanesEl); measure();
  const hl = () => lanes.forEach((lane, li) => {
    let acc = 0;
    st[li].forEach((id) => {
      const el = $(`[data-id="${id}"]`, lane), on = p * 100 >= acc && p * 100 < acc + len[id];
      acc += len[id];
      if (el._on !== on) { el._on = on; el.classList.toggle("on", on); if (on && playing) sfx.tick(1700 + li * 350, (li - 1) * 0.6, 0.06); }
    });
  });
  const setP = (v) => { p = clamp(v, 0, 0.999); ph.style.transform = `translate3d(${p * w}px,0,34px)`; tcEl.textContent = tc(p * E.total); hl(); };
  const tick = (now) => { setP(((now - t0) / (E.loop * 1000)) % 1); loop = raf(tick); };
  const btn = $("#edplay");
  btn.addEventListener("click", () => {
    playing = !playing;
    btn.textContent = playing ? E.pause : E.play;
    if (playing) { t0 = performance.now() - p * E.loop * 1000; loop = raf(tick); } else cancelAnimationFrame(loop);
  });
  const seek = (e) => { const r = lanesEl.getBoundingClientRect(); setP((e.clientX - r.left) / r.width); if (playing) t0 = performance.now() - p * E.loop * 1000; };
  let seeking = false;
  ruler.addEventListener("pointerdown", (e) => { seeking = true; ruler.setPointerCapture(e.pointerId); seek(e); });
  ruler.addEventListener("pointermove", (e) => seeking && seek(e));
  ruler.addEventListener("pointerup", () => (seeking = false));
  $$(".pt").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.i;
    $$(".pt").forEach((x) => x.classList.toggle("on", x === b));
    setP(clamp(secs(D.pr.points[i].time) / E.total, 0, 0.96));
    if (playing) t0 = performance.now() - p * E.loop * 1000;
  }));
  /* перестановка клипов с плавным перелётом (FLIP) */
  const reorder = (li, ids, dragEl) => {
    const lane = lanes[li], els = ids.map((id) => $(`[data-id="${id}"]`, lane));
    const first = new Map(els.map((e) => [e, e.getBoundingClientRect()]));
    if (dragEl) { dragEl.style.transform = ""; dragEl.classList.remove("drag"); }
    els.forEach((e) => lane.append(e));
    els.forEach((e) => {
      const a = first.get(e), b = e.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
      if (dx || dy) e.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], { duration: reduce ? 1 : 560, easing: "cubic-bezier(.34,1.45,.64,1)" });
    });
    st[li] = ids; hl();
  };
  const swap = (li, a, b) => { const ids = st[li].slice(), i = ids.indexOf(a.dataset.id), j = ids.indexOf(b.dataset.id); [ids[i], ids[j]] = [ids[j], ids[i]]; live.textContent = `${E.swapped} ${a.dataset.t} и ${b.dataset.t}`; return ids; };
  let dg = null;
  ed.addEventListener("pointerdown", (e) => {
    const c = e.target.closest(".clip");
    if (!c || e.button > 0) return;
    dg = { c, lane: c.parentElement, x: e.clientX, y: e.clientY, over: null, moved: false };
    c.setPointerCapture(e.pointerId);
  });
  ed.addEventListener("pointermove", (e) => {
    if (!dg) return;
    const dx = e.clientX - dg.x, dy = e.clientY - dg.y;
    if (!dg.moved && Math.hypot(dx, dy) < 4) return;
    if (!dg.moved) sfx.tick(1400, 0, 0.1);
    dg.moved = true; dg.c.classList.add("drag"); dg.c.style.transform = `translate3d(${dx}px,${dy}px,70px)`;
    const lr = dg.lane.getBoundingClientRect();
    let over = null;
    if (e.clientY > lr.top - 24 && e.clientY < lr.bottom + 24) {
      for (const o of $$(".clip", dg.lane)) {
        if (o === dg.c) continue;
        const r = o.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right) { over = o; break; }
      }
    }
    if (over !== dg.over) { dg.over && dg.over.classList.remove("over"); over && over.classList.add("over"); dg.over = over; }
  });
  const end = () => {
    if (!dg) return;
    const { c, lane, over, moved } = dg; dg = null;
    if (!moved) return;
    over && over.classList.remove("over");
    if (over) { reorder(+lane.dataset.li, swap(+lane.dataset.li, c, over), c); sfx.thud(); }
    else {
      const a = c.getBoundingClientRect(); c.style.transform = ""; c.classList.remove("drag");
      const b = c.getBoundingClientRect();
      c.animate([{ transform: `translate(${a.left - b.left}px,${a.top - b.top}px)` }, { transform: "none" }], { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  };
  ed.addEventListener("pointerup", end); ed.addEventListener("pointercancel", end);
  const body = $(".ed-body", ed);
  if (fine && !reduce) {
    ed.addEventListener("pointermove", (e) => {
      if (dg) return;
      const r = ed.getBoundingClientRect();
      body.style.setProperty("--ey", (((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(2) + "deg");
      body.style.setProperty("--ex", (-((e.clientY - r.top) / r.height - 0.5) * 6).toFixed(2) + "deg");
    });
    ed.addEventListener("pointerleave", () => { body.style.setProperty("--ey", "0deg"); body.style.setProperty("--ex", "0deg"); });
  }
  ed.addEventListener("keydown", (e) => {
    const c = e.target.closest(".clip");
    if (!c || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const li = +c.parentElement.dataset.li, ids = st[li], i = ids.indexOf(c.dataset.id), j = i + (e.key === "ArrowRight" ? 1 : -1);
    if (j < 0 || j >= ids.length) return;
    reorder(li, swap(li, c, $(`[data-id="${ids[j]}"]`, c.parentElement)), null); sfx.thud();
    c.focus();
  });
  $("#edreset").addEventListener("click", () => orig.forEach((ids, li) => reorder(li, ids.slice(), null)));
  addEventListener("keydown", (e) => {
    if (e.code !== "Space" || /^(BUTTON|INPUT|TEXTAREA|A)$/.test((document.activeElement || {}).tagName || "")) return;
    const r = ed.getBoundingClientRect();
    if (r.bottom < 80 || r.top > innerHeight - 80) return;
    e.preventDefault(); btn.click();
  });
  setP(0);
}

/* ---------- отзывы и вопросы ---------- */
function initReviews() {
  const R = D.reviews.items, q = $("#rq"), b = $("#rb"), bs = $$(".av");
  const show = (i) => {
    bs.forEach((x, k) => x.setAttribute("aria-pressed", k === i));
    q.classList.add("sw"); b.style.opacity = 0;
    setTimeout(() => {
      q.textContent = R[i].text;
      b.innerHTML = `${R[i].name}<a href="${R[i].url}">${R[i].link}</a>`;
      q.classList.remove("sw"); b.style.opacity = 1;
    }, q.textContent && !reduce ? 200 : 0);
  };
  bs.forEach((x, i) => x.addEventListener("click", () => { sfx.pop(true); show(i); }));
  show(0);
}
function initFaq() {
  $$(".qa").forEach((qa) => {
    const btn = $("button", qa);
    btn.addEventListener("click", () => {
      const open = !qa.classList.contains("open"); sfx.pop(open);
      $$(".qa.open").forEach((o) => { o.classList.remove("open"); $("button", o).setAttribute("aria-expanded", "false"); });
      if (open) { qa.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
    });
  });
}
function initForm() {
  $("#cf").addEventListener("submit", (e) => { e.preventDefault(); sfx.chime(); $("#fok").hidden = false; e.target.reset(); });
}

/* ---------- глобальное: скролл, шапка, магнитные кнопки ---------- */
function initGlobal() {
  const bar = $("#bar"), tcode = $("#tcode"), top = $("#top"), total = D.pr.editor.total;
  const pw = $$(".pw"), stmt = $(".stmt"), pauseEl = $("#pause"), steps = $("#steps"), stp = $$(".stp");
  let lastT = "", busy = false;
  const frame = () => {
    busy = false;
    const max = document.documentElement.scrollHeight - innerHeight, s = max > 0 ? clamp(scrollY / max) : 0;
    bar.style.setProperty("--s", s);
    S.sy = clamp(scrollY / innerHeight);
    const t = tc(Math.round(s * total));
    if (t !== lastT) { lastT = t; tcode.textContent = t; }
    const pr = pauseEl.getBoundingClientRect(), pp = clamp(-pr.top / (pr.height - innerHeight));
    const lit = Math.ceil(pp * pw.length * 1.25);
    pw.forEach((el, i) => { const on = i < lit; if (el._o !== on) { el._o = on; el.classList.toggle("on", on); } });
    const sr = steps.getBoundingClientRect();
    steps.style.setProperty("--pp", clamp((innerHeight * 0.6 - sr.top) / sr.height));
    stp.forEach((el) => {
      const top = sr.top + el.offsetTop; /* без учёта transform, чтобы не дрожало */
      const on = top < innerHeight * 0.6;
      if (on && !el.classList.contains("on")) sfx.tick(1200 + stp.indexOf(el) * 160, 0, 0.05);
      el.classList.toggle("on", on);
      el.style.setProperty("--t", clamp((innerHeight * 0.92 - top) / (innerHeight * 0.4)).toFixed(3));
    });
    stmt.style.setProperty("--pp", pp.toFixed(3));
  };
  const onScroll = () => { if (!busy) { busy = true; raf(frame); } };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  frame();
  /* цвет шапки по секции под ней */
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (top.dataset.th = e.target.classList.contains("l") ? "l" : "d")), { rootMargin: "0px 0px -94% 0px" });
  $$("main > section").forEach((s) => io.observe(s));
  /* магнитные кнопки */
  if (fine && !reduce) $$(".mag").forEach((el) => {
    el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`; });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });
}

function initMarquee() {
  const el = $("#mq"), per = D.marquee.length * 2;
  let x = 0, last = scrollY, vel = 0, sk = 0, half = 0, id = 0;
  const measure = () => (half = el.children[per].offsetLeft - el.children[0].offsetLeft);
  measure(); addEventListener("resize", measure);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(measure);
  if (reduce) return;
  const tick = () => {
    const dy = scrollY - last; last = scrollY; vel += (dy - vel) * 0.1;
    x -= 1.2 + vel * 0.55; if (x <= -half) x += half; if (x > 0) x -= half;
    sk += (clamp(vel * 0.3, -10, 10) - sk) * 0.15;
    el.style.transform = `translate3d(${x}px,0,0) skewX(${(-sk).toFixed(2)}deg)`;
    id = raf(tick);
  };
  new IntersectionObserver(([e]) => { if (e.isIntersecting) { last = scrollY; id = raf(tick); } else cancelAnimationFrame(id); }).observe(el.parentElement);
}

/* WebGL-сцены: грузятся лениво и только если WebGL доступен */
function init3D() {
  try { const c = document.createElement("canvas"); if (!(c.getContext("webgl2") || c.getContext("webgl"))) return; } catch (e) { return; }
  const go = () => import("./scenes.js").then((m) => {
    m.hero($("#cvh"), S);
    const host = $("#clap"), cta = $(".cta .btn");
    const k = m.clap(host, { a: ["Сцена", "01"], b: ["Дубль", "01"], c: ["Монтаж", D.name], d: ["Ролик", "Ваш"] }, () => {
      sfx.clap(); host.classList.remove("hit"); void host.offsetWidth; host.classList.add("hit");
    });
    ["pointerenter", "click"].forEach((ev) => cta.addEventListener(ev, () => k.clap()));
    host.addEventListener("click", () => k.clap());
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); setTimeout(() => k.clap(), 350); } }, { threshold: 0.5 }).observe(host);
  }).catch(() => {});
  const run = () => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 300));
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(run);
}

function initSound() {
  const b = $("#snd"), sync = () => { b.setAttribute("aria-pressed", String(sfx.on)); document.documentElement.classList.toggle("snd-on", sfx.on); };
  sync();
  b.addEventListener("click", async () => { await sfx.toggle(); sync(); });
  addEventListener("pointerdown", () => sfx.unlock(), { passive: true });
  sfx.onHit = () => { S.pulse = Math.min(1, S.pulse + 0.7); };
  try {
    if (!localStorage.getItem("sndtip")) setTimeout(() => { b.classList.add("tip"); setTimeout(() => b.classList.remove("tip"), 5200); localStorage.setItem("sndtip", "1"); }, 3800);
  } catch (e) {}
}

/* тактильность: волна от нажатия, звук нажатия и наведения */
function initTactile() {
  const rip = ".btn,.av,.pt,.qa button,.ctl button", all = rip + ",.snd";
  document.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(all);
    if (!el) return;
    sfx.press();
    if (!el.matches(rip)) return;
    const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = document.createElement("span");
    s.className = "rip"; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    el.appendChild(s); s.addEventListener("animationend", () => s.remove());
  });
  if (fine) document.addEventListener("pointerover", (e) => {
    const el = e.target.closest(all + ",.shot");
    if (el && !el.contains(e.relatedTarget)) sfx.hover(el.dataset.i ? +el.dataset.i : 0);
  });
}

/* курсор, прожекторный луч, плёночное зерно */
function initFX() {
  const mk = (id) => { const e = document.createElement("div"); e.id = id; e.setAttribute("aria-hidden", "true"); document.body.appendChild(e); return e; };
  if (!reduce && innerWidth > 860) {
    const g = mk("grain"), c = document.createElement("canvas"); c.width = c.height = 160;
    const x = c.getContext("2d"), im = x.createImageData(160, 160);
    for (let i = 0; i < im.data.length; i += 4) { im.data[i] = im.data[i + 1] = im.data[i + 2] = Math.random() * 255; im.data[i + 3] = Math.random() * 230; }
    x.putImageData(im, 0, 0); g.style.backgroundImage = `url(${c.toDataURL()})`;
  }
  if (!fine) return;
  const beam = mk("beam"), ring = mk("ring"), dot = mk("dot"), root = document.documentElement;
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, bx = x, by = y, sc = 1, ts = 1, run = false;
  const loop = () => {
    rx += (x - rx) * 0.2; ry += (y - ry) * 0.2; bx += (x - bx) * 0.08; by += (y - by) * 0.08; sc += (ts - sc) * 0.2;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${sc.toFixed(3)})`;
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    beam.style.transform = `translate3d(${bx}px,${by}px,0)`;
    if (Math.abs(x - rx) + Math.abs(y - ry) + Math.abs(x - bx) + Math.abs(ts - sc) > 0.3) raf(loop); else run = false;
  };
  const go = () => { if (!run) { run = true; raf(loop); } };
  root.classList.add("cc");
  addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    ts = e.target.closest("a,button,.btn,[role=button],[role=slider],.clip,.cmp,.trk") ? 1.8 : 1;
    root.classList.toggle("cur-reel", !!e.target.closest(".reel"));
    root.classList.toggle("cur-text", !!e.target.closest("input,textarea"));
    go();
  }, { passive: true });
  addEventListener("pointerdown", () => { ts = 0.8; go(); });
  addEventListener("pointerup", () => { ts = 1.8; go(); });
}

/* заголовки: слова выпрыгивают с пружиной */
function initKinetic() {
  const hs = $$(".h2,.hcta");
  hs.forEach((h) => {
    const t = h.textContent.trim(); h.setAttribute("aria-label", t);
    h.innerHTML = t.split(/\s+/).map((w, i) => `<span class="kw" aria-hidden="true"><span class="kwi" style="--i:${i}">${w}</span></span>`).join(" ");
  });
  if (reduce) return hs.forEach((h) => h.classList.add("kv"));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("kv"); io.unobserve(e.target); } }), { threshold: 0.3 });
  hs.forEach((h) => io.observe(h));
}

/* кинозал: клик по кадру */
function initTheater() {
  const items = D.works.items, reel = $("#reel");
  const th = document.createElement("div");
  th.className = "th"; th.hidden = true; th.setAttribute("role", "dialog"); th.setAttribute("aria-modal", "true"); th.setAttribute("aria-label", D.works.title);
  th.innerHTML = `<i class="bar t"></i><i class="bar b"></i><div class="scr"><div class="art"></div><div class="ui"><div class="trk2"><i></i></div><span class="tt">00:00</span></div></div>
    <div class="cap"><b></b><span></span></div><button class="x" type="button" aria-label="${D.works.close}">${I.close}</button><p class="note2">${D.works.theater}</p>`;
  document.body.appendChild(th);
  const scr = $(".scr", th), art = $(".art", scr), x = $(".x", th), tt = $(".tt", th);
  let from = null, timer = 0, busy = false;
  const xf = (a, b) => `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})`;
  const open = (card) => {
    if (busy) return; busy = true; from = card;
    const i = +card.dataset.i, it = items[i];
    scr.className = "scr " + (it.v ? "v" : "h"); art.className = "art a" + (i % 5);
    $(".cap b", th).textContent = cap(it.tag); $(".cap span", th).textContent = it.sub;
    th.hidden = false; document.body.style.overflow = "hidden"; document.documentElement.classList.add("theater"); void th.offsetWidth; th.classList.add("on");
    const a = card.getBoundingClientRect(), b = scr.getBoundingClientRect();
    scr.animate([{ transform: xf(a, b), borderRadius: "4px" }, { transform: "none", borderRadius: "10px" }], { duration: reduce ? 1 : 700, easing: "cubic-bezier(.2,.9,.2,1)" });
    sfx.projector();
    let s = 0; tt.textContent = "00:00"; timer = setInterval(() => { s++; tt.textContent = `00:${pad(s % 60)}`; }, 1000);
    x.focus({ preventScroll: true }); setTimeout(() => (busy = false), 300);
  };
  const close = () => {
    if (th.hidden || busy) return; busy = true; clearInterval(timer); th.classList.remove("on"); sfx.pop(false);
    const a = from.getBoundingClientRect(), b = scr.getBoundingClientRect();
    const an = scr.animate([{ transform: "none" }, { transform: xf(a, b) }], { duration: reduce ? 1 : 480, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" });
    setTimeout(() => { th.hidden = true; document.body.style.overflow = ""; document.documentElement.classList.remove("theater"); an.cancel(); from.focus({ preventScroll: true }); busy = false; }, reduce ? 1 : 520);
  };
  reel.addEventListener("click", (e) => {
    /* при захвате указателя click приходит на ленту, поэтому ищем кадр по координатам */
    const el = e.target.closest(".shot") ? e.target : document.elementFromPoint(e.clientX, e.clientY);
    const c = el && el.closest(".shot");
    if (c && !reel._dragged) open(c);
  });
  reel.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("shot")) { e.preventDefault(); open(e.target); } });
  th.addEventListener("click", (e) => { if (!e.target.closest(".scr,.x")) close(); });
  x.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (th.hidden) return; if (e.key === "Escape") close(); if (e.key === "Tab") { e.preventDefault(); x.focus(); } });
}

initHero(); initBA(); initWorks(); initEditor(); initReviews(); initFaq(); initForm(); initMarquee(); initGlobal(); initSound(); initTactile(); initTheater(); initFX(); initKinetic(); init3D();
