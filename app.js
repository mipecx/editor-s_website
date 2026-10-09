import { DATA } from "./data.js";

(function () {
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)],
    cl = (v, a, b) => Math.max(a, Math.min(b, v)),
    /* «телефон»: тот же запрос, что в styles.css (≤820px, а также телефон в горизонтальном положении) */
    WMQ = matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse) and (max-height: 500px)");

  /* Контент и вёрстка секций берутся из глобального DATA (см. data.js). */
  /* Рендер разметки из DATA (секции в index пустые). */
  function render() {
    const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const tg = DATA.telegram;
    document.title = DATA.name + " — монтаж роликов";

    $("header").innerHTML = '<a class="logo" href="#hero" aria-label="' + e(DATA.name) + ', наверх"><i>' + e(DATA.logo) + "</i><span>" + e(DATA.name) + '</span></a><a class="hl" href="' + tg + '">' + e(DATA.headerCta) + "</a>";

    $("#hero").innerHTML =
      "<div><h1>" +
      e(DATA.hero.title).replace(e(DATA.name) + ".", '<span class="hy">' + e(DATA.name) + ".</span>") +
      '</h1><p class="lead">' +
      e(DATA.hero.lead) +
      '</p><a class="btn" href="' +
      tg +
      '">' +
      e(DATA.hero.cta) +
      "</a></div>" +
      '<div class="slotw"><div class="slot" id="slot" data-s="0" tabindex="0" role="button" aria-label="Листать вступление: кадр, ритм, история"><div class="pic"></div>' +
      '<div class="lab mono"><span>' +
      e(DATA.slot.label) +
      '</span><span>▶</span></div><div class="mid">' +
      e(DATA.slot.hint) +
      "</div>" +
      '<div class="segs">' +
      "<b></b>".repeat(6) +
      '</div></div><div class="ctl"><span id="cnt" class="mono">1 / 3</span><button class="ghost" id="skip">' +
      e(DATA.slot.skip) +
      '</button></div><div id="cap"></div></div><div></div>';

    $("#ba").innerHTML =
      '<div class="cmp" id="cmp"><div class="ly raw">' +
      DATA.ba.raw +
      '</div><div class="ly fin">' +
      DATA.ba.fin +
      "</div>" +
      '<span class="tag mono" style="left: 12px">' +
      e(DATA.ba.rawTag) +
      '</span><span class="tag mono" style="right: 12px">' +
      e(DATA.ba.finTag) +
      "</span>" +
      '<div class="ln"></div><input type="range" min="0" max="100" value="50" aria-label="Сравнить: сырой и готовый" /></div>' +
      '<div class="pn"><h2 style="font-size: clamp(32px, 4vw, 56px)">' +
      e(DATA.ba.title).replace(/([^.]*\.)/, '<span class="hy">$1</span>') +
      "</h2><ul>" +
      DATA.ba.points.map((p) => "<li>" + e(p) + "</li>").join("") +
      "</ul></div>";

    $("#works").innerHTML =
      '<div class="pn" style="align-self: flex-start"><h2>' +
      e(DATA.works.title) +
      '</h2><p class="mono" style="margin: 12px 0 0"><span class="wn-d">' +
      e(DATA.works.note) +
      '</span><span class="wn-t">' +
      e(DATA.works.noteTouch || DATA.works.note) +
      "</span></p></div>" +
      '<div class="pn" id="wcap" style="align-self: flex-start">' +
      e(DATA.works.hint) +
      "</div>" +
      '<div class="wl" id="wl" tabindex="0" role="region" aria-label="' +
      e(DATA.works.aria || DATA.works.title) +
      '">' +
      DATA.works.items.map((w) => '<div class="' + (w.v ? "v" : "h") + '"><b>' + e(w.tag) + "</b>" + e(w.sub) + "</div>").join("") +
      '</div><div class="wk-ui" id="wkui" aria-hidden="true"><span class="mono" id="wkc"></span><div class="wk-tl"><i></i><b></b></div><span class="mono wk-sw">' +
      e(DATA.works.hintSwipe || "") +
      '</span></div><div class="wk-mq" aria-hidden="true"><span>' +
      (e(DATA.works.marquee || "РАБОТЫ · WORKS") + " · ").repeat(4) +
      "</span></div>";

    const ED = DATA.pr.editor,
      fmt = (sec) => {
        sec = Math.floor(sec);
        const z = (n) => String(n).padStart(2, "0");
        return z(Math.floor(sec / 3600)) + ":" + z(Math.floor((sec % 3600) / 60)) + ":" + z(sec % 60);
      };
    $("#pr").innerHTML =
      '<div class="pn intro"><h2>' +
      e(DATA.pr.title).replace("монтаж", '<span class="hy">монтаж</span>') +
      '</h2><p class="mono" style="margin: 14px 0 0">' +
      e(DATA.pr.note) +
      '</p></div><div class="stk" id="stk"><div class="sticky">' +
      '<div class="ed" id="ed" role="group" aria-label="' +
      e(DATA.pr.screen) +
      '">' +
      '<div class="ed-top mono"><span class="ed-dots"><i></i><i></i><i></i></span><span>' +
      e(DATA.pr.screen) +
      '</span><span id="edtc">' +
      fmt(0) +
      "</span></div>" +
      '<div class="ed-pv" id="edpv" data-i="0"><span class="ed-a mono" id="eda"></span><b id="edv"></b><span class="ed-s" id="edt"></span></div>' +
      '<div class="ed-bar"><button type="button" class="ed-b" id="edplay">' +
      e(ED.play) +
      '</button><button type="button" class="ed-b" id="edreset" disabled>' +
      e(ED.reset) +
      "</button></div>" +
      '<div class="ed-ruler" id="edru"><span></span><div class="ed-ticks">' +
      [0, 1, 2, 3, 4].map((i) => '<span style="left:' + i * 20 + '%">' + fmt((i * ED.total) / 5).slice(3) + "</span>").join("") +
      '</div></div><div class="ed-rows" id="edrows">' +
      ED.tracks.map((t) => '<div class="ed-row"><span class="ed-l mono">' + e(t.name) + '</span><div class="ed-lane"></div></div>').join("") +
      '<i class="ed-ph"></i></div><p class="mono ed-hint">' +
      e(ED.hint) +
      '</p><div class="ed-live" id="edlive" role="status" aria-live="polite"></div></div>' +
      '<div class="ppcol">' +
      DATA.pr.points.map((p, i) => '<div class="pp' + (i ? "" : " on") + '"><div class="pn"><span class="mono">' + e(p.time) + '</span><h3><span class="hy">' + e(p.h) + "</span></h3><p>" + e(p.p) + "</p></div></div>").join("") +
      '<a class="hl cut03-hl" href="' +
      tg +
      '">' +
      e(DATA.headerCta) +
      "</a>" +
      "</div></div></div>";

    $("#pause").innerHTML = "<p>" + DATA.pause.html + "</p>";

    $("#formats").innerHTML =
      "<h2>" +
      e(DATA.formats.title) +
      '</h2><div class="fm" id="fm">' +
      DATA.formats.items
        .map((c) => {
          const o = c.obj === "ph3" ? '<div class="ph3"><b></b><b></b><b></b></div>' : '<div class="' + c.obj + '"></div>';
          return '<div class="fc"><div class="obj">' + o + "</div><h3>" + e(c.h) + "</h3><p>" + e(c.p) + "</p></div>";
        })
        .join("") +
      '</div><p class="pers">' +
      e(DATA.formats.outro).replace("Беру и личные проекты", '<span class="hy">Беру и личные проекты</span>') +
      "</p>";

    $("#proc").innerHTML = "<h2>" + e(DATA.proc.title).replace("работаем", '<span class="hy dim">работаем</span>') + '</h2><div class="pl" id="pl">' + DATA.proc.steps.map((s) => '<div class="st"><span class="mono">' + e(s.n) + "</span><h3>" + e(s.h) + "</h3><p>" + e(s.p) + "</p></div>").join("") + "</div>";

    $("#rev").innerHTML = "<h2>" + e(DATA.reviews.title) + '</h2><div class="rv">' + DATA.reviews.items.map((q) => '<div class="q"><div class="av">' + e(q.av) + "</div><div><p>" + e(q.text) + '</p><span class="mono">' + e(q.name) + ' · <a href="' + q.url + '">' + e(q.link) + "</a></span></div></div>").join("") + "</div>";

    $("#faq").innerHTML = '<h2 style="margin-bottom: 6vh">' + e(DATA.faq.title) + "</h2>" + DATA.faq.items.map((f) => "<details><summary>" + e(f.q) + "</summary><p>" + e(f.a) + "</p></details>").join("");

    $("#contact").innerHTML =
      "<h2>" +
      e(DATA.contact.title).replace("Напишите.", '<span class="hy">Напишите.</span>') +
      '</h2><a class="btn big" href="' +
      tg +
      '">' +
      e(DATA.contact.cta) +
      "</a>" +
      '<form id="f"><label for="a">' +
      e(DATA.contact.labels.a) +
      '</label><input id="a" required /> <label for="b">' +
      e(DATA.contact.labels.b) +
      '</label><input id="b" required /> <label for="c">' +
      e(DATA.contact.labels.c) +
      '</label><textarea id="c" rows="3"></textarea> <button class="btn" type="submit">' +
      e(DATA.contact.submit) +
      '</button><div id="ok" role="status"></div></form>';

    $("footer").innerHTML = '<p class="nm">' + e(DATA.footer.name) + '<span class="dot"></span></p><p class="mono">' + e(DATA.footer.mono) + "</p>";

    [
      ["ba", DATA.ba.cut],
      ["works", DATA.works.cut],
      ["pr", DATA.pr.cut],
      ["pause", DATA.pause.cut],
      ["formats", DATA.formats.cut],
      ["proc", DATA.proc.cut],
      ["rev", DATA.reviews.cut],
      ["faq", DATA.faq.cut],
      ["contact", DATA.contact.cut],
    ].forEach(([id, cut]) => {
      const el = document.getElementById(id);
      if (el) el.dataset.cut = cut;
    });
  }
  render();

  let mx = 0,
    my = 0;
  /* hero slot */
  const slot = $("#slot"),
    skipBtn = $("#skip"),
    S = DATA.slot.frames;
  let st = 0,
    first = true;
  function setS(n) {
    st = (n + 3) % 3;
    slot.dataset.s = st;
    $("#cnt").textContent = st + 1 + " / 3";
    /* «Пропустить вступление» активна, пока не дошли до последнего (3-го) слайда */
    if (skipBtn) skipBtn.disabled = st === 2;
    const cap = $("#cap");
    const html = "<b>" + S[st][0] + ".</b> " + S[st][1];
    if (first) {
      first = false;
      cap.innerHTML = html;
      return;
    }
    /* размер блока #cap фиксирован — текст меняется без сдвига вёрстки */
    cap.classList.add("swap");
    clearTimeout(cap._t);
    cap._t = setTimeout(() => {
      cap.innerHTML = html;
      cap.classList.remove("swap");
    }, 160);
  }
  setS(0);
  slot.addEventListener("click", () => setS(st + 1));
  let tx = 0;
  slot.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  slot.addEventListener("touchend", (e) => {
    const d = e.changedTouches[0].clientX - tx;
    if (Math.abs(d) > 40) {
      setS(st + (d < 0 ? 1 : -1));
      e.preventDefault();
    }
  });
  addEventListener("keydown", (e) => {
    if (scrollY < innerHeight * 0.7) {
      if (e.key === "ArrowRight") setS(st + 1);
      if (e.key === "ArrowLeft") setS(st - 1);
    }
  });
  if (skipBtn) skipBtn.addEventListener("click", () => setS(2));
  slot.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setS(st + 1);
    }
  });
  /* before/after */
  (function initCompare() {
    const cmp = $("#cmp"),
      cin = cmp.querySelector("input");
    let cur = 50,
      to = 50,
      raf = 0,
      last = 0,
      sx = 0,
      sy = 0,
      st = 0,
      lock = "",
      held = false;
    const paint = () => {
        cmp.style.setProperty("--p", cur.toFixed(2) + "%");
        cin.value = Math.round(cur);
      },
      tick = (now) => {
        /* линия догоняет цель плавно, а не прыгает; скорость не зависит от частоты кадров */
        const dt = last ? Math.min(64, now - last) : 16;
        last = now;
        cur += (to - cur) * (1 - Math.exp(-dt / 55));
        if (Math.abs(to - cur) < 0.05) {
          cur = to;
          raf = last = 0;
        } else raf = requestAnimationFrame(tick);
        paint();
      },
      go = (v, now) => {
        to = cl(v, 0, 100);
        if (now || rm) {
          cur = to;
          paint();
        } else if (!raf) raf = requestAnimationFrame(tick);
      },
      pct = (ev) => {
        const r = cmp.getBoundingClientRect();
        return ((ev.clientX - r.left) / r.width) * 100;
      },
      rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* мышь: достаточно навести, линия едет за курсором. Палец и стилус: тянем, не отпуская */
    cmp.addEventListener("pointermove", (ev) => {
      if (ev.pointerType === "mouse") return go(pct(ev));
      if (!held) return;
      /* направление жеста определяем по первым пикселям: горизонталь тянет линию, вертикаль отдаём странице */
      if (!lock) {
        const dx = Math.abs(ev.clientX - sx),
          dy = Math.abs(ev.clientY - sy);
        if (dx < 8 && dy < 8) return;
        lock = dx > dy ? "x" : "y";
      }
      if (lock === "x") go(pct(ev));
    });
    cmp.addEventListener("pointerenter", (ev) => {
      if (ev.pointerType === "mouse") go(pct(ev));
    });
    cmp.addEventListener("pointerdown", (ev) => {
      if (ev.pointerType === "mouse") return go(pct(ev));
      /* палец: линию не трогаем, пока не ясно, что жест горизонтальный (вертикальный забирает прокрутка страницы) */
      held = true;
      lock = "";
      sx = ev.clientX;
      sy = ev.clientY;
      st = performance.now();
      try {
        cmp.setPointerCapture(ev.pointerId);
      } catch (e) {}
    });
    const up = (ev) => {
      if (held && ev && ev.type === "pointerup" && Math.abs(ev.clientX - sx) < 6 && Math.abs(ev.clientY - sy) < 6 && performance.now() - st < 400) go(pct(ev)); /* тап: линия прыгает в точку касания */
      held = false;
    };
    cmp.addEventListener("pointerup", up);
    cmp.addEventListener("pointercancel", up);
    cmp.addEventListener("lostpointercapture", up);
    /* клавиатура: поле остаётся в фокусе, стрелки двигают линию */
    cin.addEventListener("input", () => go(+cin.value, true));
  })();
  /* form */
  $("#f").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#ok").textContent = DATA.contact.ok;
  });
  let wkRush = () => {};
  /* CUT 02, телефон: лента работ листается пальцем вбок (нативный scroll-snap), под ней счётчик и мини-таймлайн */
  (function initWorksStrip() {
    const wl = $("#wl"),
      ui = $("#wkui"),
      cnt = $("#wkc"),
      tl = ui && ui.querySelector(".wk-tl");
    if (!wl || !cnt || !tl) return;
    const pad = (n) => String(n).padStart(2, "0");
    let raf = 0;
    function upd() {
      raf = 0;
      const items = [...wl.children],
        max = wl.scrollWidth - wl.clientWidth,
        mid = wl.scrollLeft + wl.clientWidth / 2;
      let bi = 0,
        bd = Infinity;
      items.forEach((el, i) => {
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (d < bd) {
          bd = d;
          bi = i;
        }
      });
      cnt.textContent = pad(bi + 1) + " / " + pad(items.length);
      tl.style.setProperty("--r", max > 0 ? cl(wl.scrollLeft / max, 0, 1).toFixed(4) : "0");
    }
    wl.addEventListener(
      "scroll",
      () => {
        if (wl.scrollLeft > 8 && !wl.classList.contains("rush")) ui.classList.add("moved");
        if (!raf) raf = requestAnimationFrame(upd);
      },
      { passive: true },
    );
    addEventListener("resize", upd);
    addEventListener("load", upd);
    upd();
    /* вход: лента мчится с конца в начало и тормозит на первом кадре, как при перемотке плёнки */
    let rushRaf = 0;
    wkRush = function () {
      cancelAnimationFrame(rushRaf);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const max = wl.scrollWidth - wl.clientWidth;
      if (max <= 0) return;
      wl.classList.add("rush");
      wl.scrollLeft = max;
      const t0 = performance.now() + 500,
        D = 1900,
        stop = () => {
          cancelAnimationFrame(rushRaf);
          wl.classList.remove("rush");
        };
      wl.addEventListener("touchstart", stop, { passive: true, once: true });
      try {
        navigator.vibrate && navigator.vibrate([10, 50, 10]);
      } catch (e) {}
      (function step(now) {
        const k = cl((now - t0) / D, 0, 1),
          e = 1 - Math.pow(1 - k, 4);
        wl.scrollLeft = max * (1 - e);
        if (k < 1) rushRaf = requestAnimationFrame(step);
        else wl.classList.remove("rush");
      })(performance.now());
    };
  })();
  /* CUT 03: интерактивный монитор. Клипы таймлайна перетаскиваются и меняются местами (внутри своей дорожки) */
  (function initEditor() {
    const root = $("#ed");
    if (!root) return;
    const ED = DATA.pr.editor,
      rm = matchMedia("(prefers-reduced-motion: reduce)").matches,
      lanes = $$("#ed .ed-lane"),
      rows = $("#edrows"),
      pv = $("#edpv"),
      live = $("#edlive"),
      btnPlay = $("#edplay"),
      btnReset = $("#edreset"),
      byId = {},
      els = {},
      initial = ED.tracks.map((t) => t.clips.map((c) => c.id));
    let order = initial.map((a) => a.slice()),
      p = 0,
      playing = !rm,
      vis = false,
      scrub = false,
      drag = null;
    const vi = ED.tracks.findIndex((t) => t.kind === "v"),
      ti_ = ED.tracks.findIndex((t) => t.kind === "t"),
      ai = ED.tracks.findIndex((t) => t.kind === "a"),
      fmt = (sec) => {
        sec = Math.floor(sec);
        const z = (n) => String(n).padStart(2, "0");
        return z(Math.floor(sec / 3600)) + ":" + z(Math.floor((sec % 3600) / 60)) + ":" + z(sec % 60);
      };

    /* клипы создаются один раз, потом только переставляются в DOM */
    ED.tracks.forEach((t) =>
      t.clips.forEach((c) => {
        byId[c.id] = c;
        const b = document.createElement("button"),
          s = document.createElement("span");
        b.type = "button";
        b.className = "ed-c";
        b.dataset.k = t.kind;
        b.dataset.id = c.id;
        b.style.setProperty("--l", c.len);
        b.setAttribute("aria-label", c.t + ". " + ED.aria);
        s.textContent = c.t;
        b.appendChild(s);
        els[c.id] = b;
      }),
    );
    const place = (ti) => lanes[ti].append(...order[ti].map((id) => els[id]));
    order.forEach((_, i) => place(i));

    /* какой клип сейчас под бегунком */
    const at = (ti) => {
      let s = 0;
      const arr = order[ti];
      for (const id of arr) {
        s += byId[id].len;
        if (p * 100 < s) return id;
      }
      return arr[arr.length - 1];
    };
    let lastKey = "";
    function update() {
      rows.style.setProperty("--p", p);
      $("#edtc").textContent = fmt(p * ED.total);
      const ids = ED.tracks.map((_, i) => at(i)),
        key = ids.join();
      if (key === lastKey) return;
      lastKey = key;
      for (const id in els) els[id].classList.toggle("now", ids.includes(id));
      if (vi > -1) {
        $("#edv").textContent = byId[ids[vi]].t;
        pv.dataset.i = order[vi].indexOf(ids[vi]) % 4;
      }
      if (ti_ > -1) $("#edt").textContent = byId[ids[ti_]].t;
      if (ai > -1) $("#eda").textContent = "♪ " + byId[ids[ai]].t;
    }

    /* плавная перестановка (FLIP): клипы «доезжают» на новые места */
    function flip(mutate) {
      const first = {};
      for (const id in els) first[id] = els[id].getBoundingClientRect();
      mutate();
      if (rm) return;
      for (const id in els) {
        const l = els[id].getBoundingClientRect(),
          dx = first[id].left - l.left,
          dy = first[id].top - l.top;
        if (dx || dy) {
          els[id].style.transition = "none";
          els[id].style.transform = "translate(" + dx + "px," + dy + "px)";
        }
      }
      void root.offsetWidth;
      for (const id in els) {
        const el = els[id];
        if (!el.style.transform) continue;
        el.style.transition = "transform .28s cubic-bezier(.2,.8,.2,1)";
        el.style.transform = "";
      }
    }
    function swap(a, b) {
      const ti = lanes.indexOf(a.parentElement),
        arr = order[ti],
        i = arr.indexOf(a.dataset.id),
        j = arr.indexOf(b.dataset.id);
      [arr[i], arr[j]] = [arr[j], arr[i]];
      place(ti);
      lastKey = "";
      update();
      btnReset.disabled = JSON.stringify(order) === JSON.stringify(initial);
      live.textContent = ED.swapped + " " + byId[a.dataset.id].t + " ↔ " + byId[b.dataset.id].t;
    }

    /* перетаскивание мышью и пальцем */
    function onMove(ev) {
      if (!drag) return;
      const dx = ev.clientX - drag.x,
        dy = ev.clientY - drag.y,
        el = drag.el;
      if (!drag.on) {
        if (Math.hypot(dx, dy) < 5) return;
        drag.on = true;
        el.classList.add("drag");
        el.style.transition = "none";
        root.classList.add("dragging");
      }
      el.style.transform = "translate(" + dx + "px," + dy + "px)";
      let tg = null;
      for (const o of el.parentElement.children) {
        if (o === el) continue;
        const r = o.getBoundingClientRect();
        if (ev.clientX >= r.left - 2 && ev.clientX <= r.right + 2) {
          tg = o;
          break;
        }
      }
      if (tg !== drag.tg) {
        if (drag.tg) drag.tg.classList.remove("tg");
        if (tg) tg.classList.add("tg");
        drag.tg = tg;
      }
    }
    function onUp() {
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      if (!drag) return;
      const { el, tg, on } = drag;
      drag = null;
      if (!on) return;
      root.classList.remove("dragging");
      if (tg) tg.classList.remove("tg");
      flip(() => {
        el.style.transform = "";
        el.classList.remove("drag");
        if (tg) swap(el, tg);
      });
    }
    root.addEventListener("pointerdown", (ev) => {
      const el = ev.target.closest(".ed-c");
      if (!el || ev.button > 0) return;
      drag = { el, x: ev.clientX, y: ev.clientY, on: false, tg: null };
      addEventListener("pointermove", onMove);
      addEventListener("pointerup", onUp);
      addEventListener("pointercancel", onUp);
    });
    /* клавиатура: ← → меняют клип с соседом */
    root.addEventListener("keydown", (ev) => {
      const el = ev.target.closest(".ed-c");
      if (!el || (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight")) return;
      const nb = ev.key === "ArrowLeft" ? el.previousElementSibling : el.nextElementSibling;
      ev.preventDefault();
      if (!nb) return;
      flip(() => swap(el, nb));
      el.focus({ preventScroll: true });
    });

    /* бегунок: автоплей, пауза, перемотка по линейке */
    const setPlay = (v) => {
      playing = v;
      btnPlay.textContent = v ? ED.pause : ED.play;
    };
    setPlay(playing);
    btnPlay.addEventListener("click", () => setPlay(!playing));
    btnReset.addEventListener("click", () => {
      flip(() => {
        order = initial.map((a) => a.slice());
        order.forEach((_, i) => place(i));
        lastKey = "";
        update();
      });
      btnReset.disabled = true;
    });
    const seek = (ev) => {
      const r = lanes[0].getBoundingClientRect();
      p = cl((ev.clientX - r.left) / r.width, 0, 0.999);
      update();
    };
    const ru = $("#edru");
    ru.addEventListener("pointerdown", (ev) => {
      scrub = true;
      ru.setPointerCapture(ev.pointerId);
      seek(ev);
    });
    ru.addEventListener("pointermove", (ev) => scrub && seek(ev));
    ru.addEventListener("pointerup", () => (scrub = false));
    ru.addEventListener("pointercancel", () => (scrub = false));
    new IntersectionObserver((es) => (vis = es[0].isIntersecting)).observe(root);
    let lt = performance.now();
    (function tick(now) {
      requestAnimationFrame(tick);
      const dt = Math.min(now - lt, 100);
      lt = now;
      if (vis && playing && !scrub && !drag) {
        p = (p + dt / 1000 / ED.loop) % 1;
        update();
      }
    })(lt);
    update();
  })();
  /* process line, formats tilt */
  const pl = $("#pl"),
    fm = $$(".obj>div"),
    stk = $("#stk"),
    pps = $$("#pr .pp");
  function prog() {
    const r = stk.getBoundingClientRect(),
      d = r.height - innerHeight;
    if (d <= 0) return;
    const i = Math.min(2, Math.floor(cl(-r.top / d, 0, 0.999) * 3));
    pps.forEach((e, k) => e.classList.toggle("on", k === i));
  }
  document.addEventListener("pointermove", (e) => {
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
    fm.forEach((o) => (o.style.transform = "rotateY(" + mx * 28 + "deg) rotateX(" + -my * 14 + "deg)"));
  });
  /* timeline bar + cut flash */
  const tc = $("#tc"),
    fill = $(".fill"),
    phd = $(".ph"),
    trk = $("#bar .tr"),
    fl = $("#fl"),
    rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* CUT 02: «вау»-вход. wOn/wT0 читает и 3D-сцена, а DOM-эффекты (шторки, вспышка, заголовок) живут здесь */
  const wk = $("#works"),
    lb = document.createElement("div");
  lb.id = "lb";
  lb.setAttribute("aria-hidden", "true");
  lb.innerHTML = "<i></i><i></i>";
  document.body.appendChild(lb);
  const wTitle = wk.querySelector(":scope > .pn:first-child"),
    wCap = wk.querySelector("#wcap");
  let wOn = false,
    wT0 = 0;
  const WDUR = 2000; /* длительность вступления, мс */
  function wCheck() {
    const b = wk.getBoundingClientRect();
    wk.style.setProperty("--mq", Math.round((innerHeight - b.top) * 0.9));
    if (!wOn && b.top < innerHeight * 0.7 && b.bottom > innerHeight * 0.1) {
      wOn = true;
      wT0 = performance.now();
      wk.classList.add("in");
      if (!rm && scrollY > 50) {
        fl.className = "wow";
        lb.classList.remove("on");
        void fl.offsetWidth;
        fl.classList.add("on");
        if (!WMQ.matches) lb.classList.add("on"); /* шторки только на десктопе */
      }
      if (WMQ.matches) wkRush();
    } else if (wOn && (b.top > innerHeight || b.bottom < 0)) {
      /* секция целиком ушла с экрана: при следующем заходе вход сыграет заново */
      wOn = false;
      wk.classList.remove("in");
    }
  }
  function ticks() {
    $$(".tk").forEach((t) => t.remove());
    const H = document.documentElement.scrollHeight - innerHeight;
    $$("section[data-cut]").forEach((s) => {
      const t = document.createElement("i");
      t.className = "tk";
      t.style.left = (s.offsetTop / H) * 100 + "%";
      trk.appendChild(t);
    });
  }
  function onScroll() {
    const H = document.documentElement.scrollHeight - innerHeight,
      p = cl(scrollY / H, 0, 1),
      s = p * 180,
      f = (n) => String(Math.floor(n)).padStart(2, "0");
    tc.textContent = f(s / 60) + ":" + f(s % 60) + ":" + f((s % 1) * 30);
    fill.style.width = phd.style.left = p * 100 + "%";
    prog();
    wCheck();
    /* CUT 02: когда верхний блок «Работы» заезжает на нижнюю подпись, подпись плавно исчезает */
    if (wCap && wTitle) {
      const a = wTitle.getBoundingClientRect(),
        c = wCap.getBoundingClientRect();
      wCap.classList.toggle("under", a.bottom > c.top + 4 && a.top < c.bottom);
    }
    const r = pl.getBoundingClientRect();
    pl.style.setProperty("--f", cl((innerHeight * 0.515 - r.top) / r.height, 0, 1));
  }
  addEventListener("scroll", onScroll, { passive: true });
  if (!rm && window.IntersectionObserver) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting && scrollY > 50 && (e.target.id !== "works" || WMQ.matches)) {
            fl.className = "";
            fl.classList.toggle("hard", e.target.id === "pause");
            void fl.offsetWidth;
            fl.classList.add("on");
          }
        }),
      { rootMargin: "0px 0px -90% 0px" },
    );
    $$("section[data-cut]").forEach((s) => io.observe(s));
  }
  /* док кнопки Telegram: обычно в шапке; в CUT03 плавно «докидывается» под блоки точек (--dock 0…1) */
  const prSec = $("#pr"),
    pauseSec = $("#pause");
  const dockUpdate = () => {
    if (!prSec) return;
    const top = prSec.getBoundingClientRect().top,
      enter = cl((-top - innerHeight * 0.2) / (innerHeight * 0.35), 0, 1);
    let exit = 1;
    if (pauseSec) exit = cl(pauseSec.getBoundingClientRect().top / (innerHeight * 0.5), 0, 1);
    const d = Math.min(enter, exit),
      gone = cl((innerHeight * 0.4 - top) / (innerHeight * 0.4), 0, 1),
      hg = Math.min(gone, exit);
    document.body.style.setProperty("--dock", d.toFixed(3));
    document.body.style.setProperty("--hlgone", hg.toFixed(3));
    document.body.classList.toggle("in-cut03", d > 0.5);
  };
  dockUpdate();
  addEventListener("scroll", dockUpdate, { passive: true });
  addEventListener("resize", dockUpdate);
  /* Магнит к верху секций.
     Принципы: срабатывает только когда прокрутка «осела» (нет колеса/пальца/инерции),
     тянет в сторону движения, едет своей плавной кривой, а любое действие пользователя
     (колесо, касание, клавиша) мгновенно его отменяет. SNAP — зона притяжения (доля экрана). */
  const snapSecs = $$("main > section"),
    SNAP = 0.22;
  let anim = 0,
    snapT = 0,
    touching = false,
    lastY = scrollY,
    dir = 0;
  const ease3 = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  function cancelAnim() {
    if (anim) {
      cancelAnimationFrame(anim);
      anim = 0;
    }
  }
  /* общий плавный скролл: и для магнита, и для якорных ссылок */
  function glideTo(top, ms) {
    cancelAnim();
    const y0 = scrollY,
      dist = top - y0;
    if (rm || Math.abs(dist) < 2) return scrollTo(0, top);
    const dur = ms || cl(260 + Math.abs(dist) * 0.5, 320, 760),
      t0 = performance.now();
    (function step(now) {
      const k = cl((now - t0) / dur, 0, 1);
      scrollTo(0, y0 + dist * ease3(k));
      anim = k < 1 ? requestAnimationFrame(step) : 0;
    })(t0);
  }
  function snapTo() {
    if (anim || touching || rm || snapSecs.length < 2) return;
    const y = scrollY,
      lim = innerHeight * SNAP,
      max = document.documentElement.scrollHeight - innerHeight;
    let best = null,
      bd = Infinity;
    snapSecs.forEach((s) => {
      const t = Math.min(s.getBoundingClientRect().top + y, max),
        d = t - y;
      /* секция «впереди по ходу движения» притягивает сильнее, чем позади */
      const w = dir && d * dir < 0 ? 1.6 : 1,
        sd = Math.abs(d) * w;
      if (sd < bd) ((bd = sd), (best = t));
    });
    if (best != null && Math.abs(best - y) > 2 && bd < lim) glideTo(best);
  }
  function queueSnap() {
    clearTimeout(snapT);
    snapT = setTimeout(snapTo, 160);
  }
  addEventListener(
    "scroll",
    () => {
      const y = scrollY;
      if (Math.abs(y - lastY) > 0.5) dir = y > lastY ? 1 : -1;
      lastY = y;
      if (!anim) queueSnap(); /* свой же скролл магнит не перезапускает */
    },
    { passive: true },
  );
  /* пользователь взял управление: магнит сразу отпускает */
  const grab = () => {
    cancelAnim();
    clearTimeout(snapT);
  };
  addEventListener("wheel", grab, { passive: true });
  addEventListener("keydown", grab);
  addEventListener("mousedown", grab);
  addEventListener(
    "touchstart",
    () => {
      touching = true;
      grab();
    },
    { passive: true },
  );
  addEventListener("touchend", () => ((touching = false), queueSnap()), { passive: true });
  addEventListener("touchcancel", () => (touching = false), { passive: true });
  /* якорные ссылки (логотип и т.п.) едут тем же плавным ходом, а не браузерным smooth */
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const el = document.getElementById(a.getAttribute("href").slice(1));
    if (!el) return;
    e.preventDefault();
    glideTo(el.getBoundingClientRect().top + scrollY);
  });
  addEventListener("resize", () => {
    ticks();
    onScroll();
  });
  addEventListener("load", () => {
    ticks();
    onScroll();
  });
  ticks();
  onScroll();
  /* WebGL */
  let gl = false;
  try {
    const c = document.createElement("canvas");
    gl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) {}
  if (!gl || rm || !window.THREE) {
    document.documentElement.classList.add("static");
    return;
  }
  try {
    init3D();
  } catch (e) {
    document.documentElement.classList.add("static");
  }
  function init3D() {
    const T = THREE,
      Y = 0xffd60a,
      G = 0x1b1a17,
      C = 0xf3eee4,
      D = 9,
      K = 0.012;
    const r = new T.WebGLRenderer({ canvas: $("#gl"), antialias: true, alpha: true, powerPreference: "high-performance" });
    r.setClearColor(0, 0);
    r.autoClear = false;
    r.outputEncoding = T.sRGBEncoding;
    $("#gl").addEventListener("webglcontextlost", () => document.documentElement.classList.add("static"));
    const PR = WMQ.matches ? [Math.min(devicePixelRatio || 1, 1.5), 1.25, 1] : [Math.min(devicePixelRatio || 1, 2), 1.5, 1],
      LV = 0;
    let lv = 0;
    r.setPixelRatio(PR[0]);
    const sc = new T.Scene(),
      cam = new T.PerspectiveCamera(40, 1, 0.1, 400);
    sc.add(cam);
    sc.fog = new T.Fog(0x171613, 12, 38);
    sc.add(new T.HemisphereLight(0xfff4e0, 0x1a1812, 0.7));
    const p1 = new T.PointLight(0xfff0d0, 0.9, 50);
    p1.position.set(2, 3, 2);
    cam.add(p1);
    const p2 = new T.PointLight(Y, 0.8, 40);
    p2.position.set(-3, -2, -4);
    cam.add(p2);
    const mS = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.45, metalness: 0.15 }, o || {}));
    const mY = mS(Y, { emissive: Y, emissiveIntensity: 0.4 }),
      mG = mS(0x2c2a25),
      mC = mS(0xb4ae9f),
      mD = mS(G),
      mB = mS(0xf3eee4, { emissive: 0xf3eee4, emissiveIntensity: 0.15 });
    function tex(w, h, fn) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      fn(c.getContext("2d"), w, h);
      const t = new T.CanvasTexture(c);
      t.encoding = T.sRGBEncoding;
      t.anisotropy = 4;
      return t;
    }
    const tones = [
      ["#3a3630", "#1b1a17"],
      ["#6b5a3a", "#2a2418"],
      ["#5a5448", "#201e1a"],
    ];
    function ph(v, tag, sub, i) {
      const tn = tones[i % 3];
      return tex(v ? 360 : 640, v ? 640 : 360, (x, w, h) => {
        const g = x.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, tn[0]);
        g.addColorStop(1, tn[1]);
        x.fillStyle = g;
        x.fillRect(0, 0, w, h);
        x.fillStyle = "rgba(255,255,255,.07)";
        for (let i = 0; i < h; i += 26) x.fillRect(0, i, w, 2);
        x.fillStyle = "#ffd60a";
        x.fillRect(20, 20, 12, 12);
        x.fillStyle = "#fff";
        x.font = "bold 24px monospace";
        x.fillText(tag, 42, 31);
        x.font = "20px monospace";
        x.fillStyle = "#e8e2d4";
        x.fillText(sub, 20, h - 24);
        x.fillStyle = "rgba(255,255,255,.9)";
        x.beginPath();
        x.moveTo(w / 2 - 18, h / 2 - 26);
        x.lineTo(w / 2 + 26, h / 2);
        x.lineTo(w / 2 - 18, h / 2 + 26);
        x.fill();
      });
    }
    function frame(v, w, tag, sub, i) {
      const h = v ? (w * 16) / 9 : (w * 9) / 16,
        g = new T.Group();
      const b = new T.Mesh(new T.BoxGeometry(w + 0.05, h + 0.05, 0.05), mB);
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: ph(v, tag, sub, i) }));
      m.position.z = 0.03;
      const pb = new T.Mesh(new T.PlaneGeometry(w * 0.9, 0.06), new T.MeshBasicMaterial({ color: Y }));
      pb.position.set(0, -h / 2 + 0.14, 0.04);
      pb.visible = false;
      g.add(b, m, pb);
      g.userData = { m, pb, w, h, e: 0, hit: false };
      m.userData.g = g;
      return g;
    }
    const gH = new T.Group(),
      gB = new T.Group(),
      gW = new T.Group(),
      gT = new T.Group(),
      mon = new T.Group();
    sc.add(gH, gB, gW, gT);
    cam.add(mon); /* монитор — дочерний камере: не «уплывает» при движении мыши */
    /* hero scraps */
    const scr = [],
      sm = [mY, mC, mG, mS(0x6b5a3a)];
    for (let i = 0; i < 16; i++) {
      const v = Math.random() < 0.6,
        w = 0.5 + Math.random() * 0.5,
        m = new T.Mesh(new T.BoxGeometry(v ? w : w * 1.7, v ? w * 1.7 : w, 0.03), sm[i % 4]);
      const sd = i % 2 ? 1 : -1;
      m.userData = { bx: sd * (2.8 + Math.random() * 3.4), by: (Math.random() - 0.5) * 6, bz: 1.5 - Math.random() * 5, s: 0.2 + Math.random() * 0.4, i };
      m.rotation.set(Math.random(), Math.random(), Math.random());
      gH.add(m);
      scr.push(m);
    }
    /* before/after ghosts */
    function own(g) {
      const b = g.children[0];
      b.material = b.material.clone();
      [g.children[0], g.children[1]].forEach((o) => (o.material.transparent = true));
    }
    const fade = (g, o) => {
        g.children[0].material.opacity = o;
        g.children[1].material.opacity = o;
        g.visible = o > 0.01;
      },
      sm3 = (x) => x * x * (3 - 2 * x),
      backOut = (x) => {
        const c1 = 1.4;
        return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
      };
    const ga = frame(true, 2.3, "СЫРОЙ", "кадр до", 0),
      gb = frame(true, 2.3, "ГОТОВЫЙ", "кадр после", 1);
    own(ga);
    own(gb);
    gB.add(ga, gb);
    /* works strip */
    const R = 9,
      piv = new T.Group();
    gW.add(piv);
    const bt = tex(512, 256, (x, w, h) => {
      x.fillStyle = "#14130f";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#3a362e";
      for (let i = 0; i < 8; i++) {
        x.fillRect(i * 64 + 22, 14, 22, 22);
        x.fillRect(i * 64 + 22, h - 36, 22, 22);
      }
    });
    bt.wrapS = T.RepeatWrapping;
    bt.repeat.set(57, 1); /* кольцо замкнуто: у ленты нет концов, сколько ни крути */
    const band = new T.Mesh(new T.CylinderGeometry(R + 0.06, R + 0.06, 4.6, 160, 1, true, 0, Math.PI * 2), new T.MeshBasicMaterial({ map: bt, side: T.DoubleSide }));
    piv.add(band);
    const WS = 0.43,
      WG = 0.22;
    const WK = DATA.works.items.map((w) => [w.v, w.tag, w.sub]);
    const fr = [];
    let ws = WK.map((k) => (k[0] ? 1.6 : 3.4) * WS),
      tot = ws.reduce((a, b) => a + b + WG, 0),
      cur = -tot / 2;
    WK.forEach((k, i) => {
      const f = frame(!!k[0], ws[i], k[1], k[2], i);
      f.userData.phi = (cur + ws[i] / 2) / R;
      f.userData.tag = k[1] + " · " + k[2];
      f.userData.w = ws[i];
      cur += ws[i] + WG;
      own(f);
      piv.add(f);
      fr.push(f);
    });
    band.material.transparent = true;
    band.scale.y = 0.04;
    /* кромки плёнки: загораются, когда лента «раскрывается» */
    const edgeMat = new T.MeshBasicMaterial({ color: Y, transparent: true, opacity: 0, side: T.DoubleSide, fog: false });
    const edges = [1, -1].map((s) => {
      const m = new T.Mesh(new T.CylinderGeometry(R + 0.07, R + 0.07, 0.05, 160, 1, true, 0, Math.PI * 2), edgeMat);
      m.userData.s = s;
      piv.add(m);
      return m;
    });
    /* «утечка света» за кадрами и пыль в луче проектора. Группа едет за камерой, как и лента */
    const lg = new T.Group();
    gW.add(lg);
    const glow = new T.Mesh(
      new T.PlaneGeometry(30, 12),
      new T.MeshBasicMaterial({
        map: tex(256, 256, (x, w, h) => {
          const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
          g.addColorStop(0, "rgba(255,230,130,1)");
          g.addColorStop(0.35, "rgba(255,214,10,.45)");
          g.addColorStop(1, "rgba(255,214,10,0)");
          x.fillStyle = g;
          x.fillRect(0, 0, w, h);
        }),
        transparent: true,
        opacity: 0,
        blending: T.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    );
    glow.position.z = -(R - 0.2);
    const dN = 260,
      dp = new Float32Array(dN * 3);
    for (let i = 0; i < dN; i++) {
      dp[i * 3] = (Math.random() - 0.5) * 16;
      dp[i * 3 + 1] = (Math.random() - 0.5) * 5;
      dp[i * 3 + 2] = -Math.random() * 9.5;
    }
    const dg = new T.BufferGeometry();
    dg.setAttribute("position", new T.BufferAttribute(dp, 3));
    const dust = new T.Points(dg, new T.PointsMaterial({ color: 0xffe27a, size: 0.07, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
    lg.add(glow, dust);
    /* timeline tunnel */
    const bricks = [],
      STRETCH = 0.076; /* до 2% от высоты тоннеля: верхние тянутся вниз, нижние вверх */
    [-1.9, 1.9].forEach((y) =>
      [-4.2, -2.6, -1, 0.6, 2.2, 3.8].forEach((x, li) => {
        const lane = new T.Mesh(new T.BoxGeometry(0.8, 0.05, 1), mD);
        lane.position.set(x, y, 0);
        gT.add(lane);
        for (let k = 0, z = -0.5; z < 0.5 && k < 30; k++) {
          const l = 0.025 + Math.random() * 0.07,
            m = Math.random(),
            mt = m < 0.35 ? mY : m < 0.65 ? mC : mG,
            dir = y > 0 ? -1 : 1;
          const b = new T.Mesh(new T.BoxGeometry(0.7, 0.34, l * 0.92), mt);
          b.position.set(x, y + dir * 0.2, z + l / 2);
          b.userData.o = k % 2;
          b.userData.dir = dir;
          b.userData.by = y + dir * 0.2;
          b.userData.ph = Math.random() * Math.PI * 2;
          b.userData.sp = 0.6 + Math.random() * 1.2;
          gT.add(b);
          bricks.push(b);
          z += l + 0.01 + Math.random() * 0.03;
        }
      }),
    );
    /* monitor: корпус рисуем поверх тоннеля, чтобы кирпичи не проступали на рамке */
    const shMat = mD.clone();
    shMat.depthTest = false;
    const sh = new T.Mesh(new T.BoxGeometry(3.8, 2.4, 0.14), shMat);
    sh.renderOrder = 10;
    const scrn = new T.Mesh(
      new T.PlaneGeometry(3.6, 2.2),
      new T.MeshBasicMaterial({
        map: tex(640, 360, (x, w, h) => {
          x.fillStyle = "#1b1a17";
          x.fillRect(0, 0, w, h);
          x.fillStyle = "#ffd60a";
          x.fillRect(20, 20, 12, 12);
          x.fillStyle = "#fff";
          x.font = "bold 22px monospace";
          x.fillText("запись экрана монтажа", 44, 32);
          for (let i = 0; i < 5; i++) {
            let z = 20;
            while (z < w - 80) {
              const l = 30 + Math.random() * 110;
              x.fillStyle = ["#ffd60a", "#f3eee4", "#6b665a"][(Math.random() * 3) | 0];
              x.fillRect(z, 80 + i * 46, l, 32);
              z += l + 8;
            }
          }
          x.fillStyle = "#ffd60a";
          x.fillRect(330, 60, 3, 260);
        }),
      }),
    );
    scrn.position.z = 0.08;
    scrn.visible = false; /* экран не рисуем — контент даёт DOM-редактор, монитор только корпус */
    mon.add(sh, scrn);
    /* layout */
    let asp = 1,
      tops = {};
    const E = { hero: $("#hero"), ba: $("#ba"), works: $("#works"), pr: $("#pr") };
    const rect = (e) => {
      const b = e.getBoundingClientRect();
      return { t: b.top + scrollY, h: b.height };
    };
    const zOf = (e) => {
      const q = rect(e);
      return -(q.t + q.h / 2) * K;
    };
    let Lz = 60,
      baX = 4,
      wB = 1,
      szW = 0,
      szH = 0;
    function layout() {
      /* размеры берём у самого canvas (CSS 100%), а не innerWidth/innerHeight:
         в Safari они расходятся (тулбар/скроллбар) и scissor уезжает */
      const cw = r.domElement.clientWidth || innerWidth,
        ch = r.domElement.clientHeight || innerHeight;
      asp = cw / ch;
      cam.aspect = asp;
      cam.updateProjectionMatrix();
      /* на телефоне resize летит при каждом сворачивании адресной строки: буфер пересоздаём только если размер реально другой */
      if (cw !== szW || ch !== szH) {
        szW = cw;
        szH = ch;
        r.setSize(cw, ch, false);
      }
      gH.position.z = zOf(E.hero);
      gB.position.z = zOf(E.ba);
      gW.position.z = zOf(E.works);
      const q = rect(E.pr);
      Lz = q.h * K * 1.15;
      gT.position.z = -(q.t + q.h / 2) * K;
      gT.scale.z = Lz;
      const xs = cl(asp / 1.5, 0.4, 1);
      scr.forEach((m) => {
        m.userData.xs = xs;
        m.scale.setScalar(asp < 1 ? 0.7 : 1);
      });
      const vis = Math.tan((20 * Math.PI) / 180) * D * asp;
      baX = Math.min(vis * 0.78, 4.8);
      ga.rotation.y = 0.3;
      gb.rotation.y = -0.3;
      wB = asp < 1 ? 0.62 : 1;
    }
    layout();
    addEventListener("resize", layout);
    addEventListener("load", layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    new ResizeObserver(layout).observe(document.body);
    /* pointer, gyro, raycast */
    const ray = new T.Raycaster(),
      mv = new T.Vector2(9, 9);
    addEventListener("pointermove", (e) => {
      mv.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    });
    addEventListener("pointerdown", (e) => {
      mv.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      if (e.pointerType === "touch" && typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().catch(() => {});
    });
    addEventListener("deviceorientation", (e) => {
      if (e.gamma != null) {
        mx = cl(e.gamma / 30, -1, 1);
        my = cl((e.beta - 45) / 30, -1, 1);
      }
    });
    const wc = $("#wcap");
    let lastH = null,
      pry = 0;
    /* adaptive quality */
    let a = 0,
      n = 0,
      bad = 0,
      last = performance.now(),
      camz = 0;
    function degrade() {
      lv++;
      if (lv < PR.length) r.setPixelRatio(Math.min(PR[lv], PR[0]));
      else {
        bricks.forEach((b) => {
          if (b.userData.o) b.visible = false;
        });
        scr.forEach((m, i) => {
          if (i % 2) m.visible = false;
        });
      }
    }
    const ease = (c, t, f) => c + (t - c) * f;
    function loop(now) {
      requestAnimationFrame(loop);
      const dt = Math.min(now - last, 100);
      last = now;
      a += dt;
      if (++n === 90) {
        const av = a / n;
        bad = av > 26 ? bad + 1 : 0;
        if (bad >= 2 && lv < PR.length) {
          degrade();
          bad = 0;
        }
        a = n = 0;
      }
      /* реальные размеры canvas (совпадают с CSS 100%), а не innerWidth/innerHeight — иначе в Safari scissor уезжает */
      const cw = r.domElement.clientWidth || innerWidth,
        ch = r.domElement.clientHeight || innerHeight;
      const tz = -(scrollY + ch / 2) * K + D;
      /* камеру по вертикали ведём без инерции — иначе 3D-блок отстаёт от скролла и у разграничителя секции виден разрыв */
      camz = tz;
      cam.position.set(mx * 0.5, -my * 0.3, camz);
      cam.lookAt(mx * 0.3, -my * 0.2, camz - D);
      const t = now / 1000;
      gH.rotation.y = ease(gH.rotation.y, mx * 0.2, 0.08);
      gH.rotation.x = ease(gH.rotation.x, my * 0.1, 0.08);
      scr.forEach((m) => {
        const u = m.userData;
        m.position.set(u.bx * (u.xs || 1), u.by + Math.sin(t * u.s + u.i) * 0.35, u.bz);
        m.rotation.x += 0.002 * u.s;
        m.rotation.y += 0.003 * u.s;
      });
      const qb = rect(E.ba),
        pbb = cl((scrollY + ch / 2 - qb.t) / qb.h, 0, 1),
        sp = 0.5 + 0.5 * Math.sin(pbb * Math.PI),
        go = sm3(cl(pbb / 0.3, 0, 1)) * (1 - sm3(cl((pbb - 0.7) / 0.3, 0, 1)));
      fade(ga, go);
      fade(gb, go);
      ga.position.set(-baX * sp, Math.sin(t * 0.6) * 0.1, -1.5 - (1 - sp) * 2);
      gb.position.set(baX * sp, Math.cos(t * 0.6) * 0.1, -1.5 - (1 - sp) * 2);
      /* works: вход по времени. wp 0→1 за WDUR после триггера wCheck */
      const q = rect(E.works),
        wp = wOn ? cl((now - wT0) / WDUR, 0, 1) : 0,
        eo = 1 - Math.pow(1 - wp, 3),
        burst = wOn ? Math.pow(1 - wp, 2.2) : 0,
        bo = cl(wp * 6, 0, 1);
      const wMob = WMQ.matches; /* на телефоне «Работы» — обычная DOM-лента, 3D-лента не рисуется */
      gW.visible = wOn && !wMob;
      gW.scale.setScalar(wB);
      /* лента раскрывается по вертикали, кромки загораются */
      band.material.opacity = bo;
      band.scale.y = 0.04 + 0.96 * sm3(cl(wp / 0.45, 0, 1));
      edgeMat.opacity = bo;
      edges.forEach((m) => (m.position.y = m.userData.s * 2.3 * band.scale.y));
      /* вспышка света и пылевой взрыв */
      glow.material.opacity = wOn ? 0.12 + 0.75 * burst : 0;
      glow.scale.setScalar(1 + burst * 1.6);
      dust.material.opacity = wOn ? cl(wp * 3, 0, 1) * 0.8 : 0;
      dust.scale.setScalar(1 + (1 - eo) * 2.2);
      dust.rotation.y = Math.sin(t * 0.15) * 0.12;
      dust.position.y = Math.sin(t * 0.4) * 0.1;
      lg.position.z = (camz - gW.position.z) / wB;
      const thv = Math.atan(Math.tan((20 * Math.PI) / 180) * asp) * 0.9,
        phs = tot / 2 / R,
        lim = Math.max(0, phs - thv),
        pp = cl((scrollY - q.t) / Math.max(1, q.h - ch), 0, 1);
      pry = ease(pry, (pp - 0.5) * 2 * lim, 0.1);
      piv.rotation.y = pry + 6.9 * Math.pow(1 - wp, 4); /* лента влетает с раскруткой (больше оборота) и тормозит на месте */
      piv.position.z = (camz - gW.position.z) / wB;
      ray.setFromCamera(mv, cam);
      const hits = wp > 0.85 && !wMob ? ray.intersectObjects(fr.map((f) => f.userData.m)) : [];
      let hf = hits.length ? hits[0].object.userData.g : null;
      if (hf !== lastH) {
        lastH = hf;
        wc.innerHTML = hf ? "<span>" + hf.userData.tag + "</span>" : matchMedia("(hover:none)").matches ? DATA.works.hintTouch : DATA.works.hint;
      }
      fr.forEach((g, i) => {
        const u = g.userData,
          e = (u.hit = g === hf) ? 1 : 0;
        u.e = ease(u.e, e, 0.12);
        /* кадры «раздаются» из центра веером, со сдвигом по очереди, и чуть перелетают на место */
        const li = wOn ? cl((wp - 0.06 - i * 0.065) / 0.42, 0, 1) : 0,
          kk = backOut(li),
          rr = R - 3.6 + 3.15 * kk - 1.5 * u.e,
          ph = u.phi * kk;
        fade(g, cl(li * 5, 0, 1));
        g.position.set(rr * Math.sin(ph), 0, -rr * Math.cos(ph));
        g.rotation.set((1 - kk) * 0.4, -ph, (1 - kk) * (i % 2 ? 0.8 : -0.8));
        g.scale.setScalar((0.35 + 0.65 * kk) * (1 + 0.3 * u.e));
        u.pb.visible = u.e > 0.3;
        u.pb.scale.x = 0.05 + ((t * 0.25) % 1) * 0.95;
        u.pb.position.x = -u.w * 0.45 + (u.w * 0.9 * u.pb.scale.x) / 2;
      });
      /* кирпичи тоннеля «дышат»: верхние тянутся вниз, нижние вверх, каждый в своём темпе */
      bricks.forEach((b) => {
        const u = b.userData,
          ext = STRETCH * (0.5 + 0.5 * Math.sin(t * u.sp + u.ph));
        b.scale.y = (0.34 + ext) / 0.34;
        b.position.y = u.by + u.dir * (ext / 2);
      });
      mon.visible = false; /* 3D-монитор убран — рамку рисует CSS у .ed */
      /* каждая 3D-сцена рисуется только внутри своей секции: за жёлтой полоской «склейки» чужого пространства не видно */
      const all = [gH, gB, gW, gT, mon],
        regs = [
          [E.hero, gH],
          [E.ba, gB],
          [E.works, gW],
          [E.pr, [gT, mon]],
        ],
        v0 = all.map((o) => o.visible);
      r.setScissorTest(false);
      r.clear();
      r.setScissorTest(true);
      const cb = r.domElement.getBoundingClientRect();
      regs.forEach(([el, gs]) => {
        const b = el.getBoundingClientRect(),
          t = Math.max(0, b.top - cb.top),
          bt = Math.min(ch, b.bottom - cb.top);
        if (bt <= t) return;
        const own = [].concat(gs);
        all.forEach((o, i) => (o.visible = own.includes(o) && v0[i]));
        r.setScissor(0, ch - bt, cw, bt - t);
        r.clearDepth();
        const kick = el === E.works && wOn ? Math.pow(1 - wp, 2.1) : 0;
        cam.fov = 40 + 50 * kick; /* широкий угол → быстрый «наезд» на нормальный */
        cam.updateProjectionMatrix();
        cam.rotateZ(kick * 0.26); /* голландский угол, который выпрямляется */
        r.render(sc, cam);
        cam.rotateZ(-kick * 0.26);
      });
      if (cam.fov !== 40) {
        cam.fov = 40;
        cam.updateProjectionMatrix();
      }
      all.forEach((o, i) => (o.visible = v0[i]));
      r.setScissorTest(false);
    }
    requestAnimationFrame(loop);
  }
})();
