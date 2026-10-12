/* 3D-сцены. Грузятся лениво, после первого экрана. Всё процедурное: ни одной внешней модели. */
import {
  BufferAttribute, DynamicDrawUsage, SphereGeometry, TorusGeometry, CircleGeometry, ShaderMaterial, Color, BackSide,
  Raycaster, Vector2, LineSegments, LineBasicMaterial, AmbientLight as AmbLight,
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry, BoxGeometry, CylinderGeometry,
  MeshBasicMaterial, MeshStandardMaterial, CanvasTexture, SRGBColorSpace, CatmullRomCurve3, Vector3, Matrix4,
  Quaternion, Euler, Fog, Points, BufferGeometry, Float32BufferAttribute, PointsMaterial, AdditiveBlending,
  DoubleSide, DirectionalLight, AmbientLight, PointLight, Sprite, SpriteMaterial,
} from "three";

const mobile = matchMedia("(max-width:860px)").matches;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function makeRenderer(host) {
  const r = new WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: "high-performance" });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  r.setClearColor(0x000000, 0);
  host.appendChild(r.domElement);
  return r;
}
function fit(host, r, cam, cb) {
  const ro = new ResizeObserver(() => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); cb && cb(w / h);
  });
  ro.observe(host);
}
/* рендер только пока сцена на экране */
function whenVisible(host, render) {
  let on = false, id = 0, first = true;
  const t0 = performance.now();
  const tick = (now) => {
    render((now - t0) / 1000);
    if (first) { first = false; host.classList.add("on"); setTimeout(() => host.classList.add("live"), 1600); }
    id = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !on) { on = true; id = requestAnimationFrame(tick); }
    else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(id); }
  }, { rootMargin: "120px" }).observe(host);
}
const tex = (c, aniso = 4) => { const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = aniso; return t; };
const cnv = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };

/* ================= HERO: лента плёнки ================= */
function drawFrame(v) {
  const [c, x] = cnv(512, 360);
  const rr = (a, b, w, h, r) => { x.beginPath(); x.roundRect(a, b, w, h, r); };
  rr(0, 0, 512, 360, 18); x.fillStyle = "#0c0c0c"; x.fill();
  x.fillStyle = "#e4e4e4";
  for (let k = 0; k < 9; k++) { rr(22 + k * 54, 12, 26, 18, 5); x.fill(); rr(22 + k * 54, 330, 26, 18, 5); x.fill(); }
  const px = 30, py = 46, pw = 452, ph = 268, cx = px + pw / 2;
  x.save(); rr(px, py, pw, ph, 6); x.clip();
  const g = x.createLinearGradient(px, py, px + pw, py + ph);
  const person = (col, dy = 0, dx = 0) => {
    x.fillStyle = col; x.beginPath(); x.arc(cx + dx, py + ph * 0.4 + dy, 46, 0, 7); x.fill();
    x.beginPath(); x.ellipse(cx + dx, py + ph + 10, 118, 112, 0, Math.PI, 0); x.fill();
  };
  if (v === 0) { g.addColorStop(0, "#505050"); g.addColorStop(1, "#101010"); x.fillStyle = g; x.fillRect(px, py, pw, ph); person("#e9e9e9"); }
  else if (v === 1) { x.fillStyle = "#121212"; x.fillRect(px, py, pw, ph); x.strokeStyle = "#444"; x.lineWidth = 5; for (let k = 1; k < 7; k++) { x.beginPath(); x.arc(cx, py + ph / 2, k * 34, 0, 7); x.stroke(); } }
  else if (v === 2) { x.fillStyle = "#171717"; x.fillRect(px, py, pw, ph); x.fillStyle = "#2c2c2c"; for (let k = -10; k < 24; k++) { x.beginPath(); x.moveTo(px + k * 40, py + ph); x.lineTo(px + k * 40 + 20, py + ph); x.lineTo(px + k * 40 + 20 + ph, py); x.lineTo(px + k * 40 + ph, py); x.fill(); } }
  else if (v === 3) { x.fillStyle = "#0e0e0e"; x.fillRect(px, py, pw, ph); x.strokeStyle = "#2c2c2c"; x.lineWidth = 2; for (let k = 0; k < 20; k++) { x.beginPath(); x.moveTo(px + k * 30, py); x.lineTo(px + k * 30, py + ph); x.moveTo(px, py + k * 30); x.lineTo(px + pw, py + k * 30); x.stroke(); } x.strokeStyle = "#d0d0d0"; x.lineWidth = 8; x.beginPath(); x.arc(cx, py + ph / 2, 70, 0, 7); x.stroke(); }
  else if (v === 4) { g.addColorStop(0, "#3d5afe"); g.addColorStop(1, "#06081f"); x.fillStyle = g; x.fillRect(px, py, pw, ph); person("#ffffff"); x.fillStyle = "#fff"; x.font = "700 30px 'Unbounded',sans-serif"; x.textAlign = "center"; x.fillText("с первой", cx, py + ph - 30); }
  else { x.fillStyle = "#363636"; x.fillRect(px, py, pw, ph); const r = rng(v); x.fillStyle = "rgba(255,255,255,.08)"; for (let k = 0; k < 500; k++) x.fillRect(px + r() * pw, py + r() * ph, 3, 3); person("#7a7a7a", 10, v === 6 ? 40 : -30); x.fillStyle = "#8a9bff"; x.font = "700 78px 'Unbounded',sans-serif"; x.textAlign = "center"; x.fillText(v === 5 ? "эээ…" : "ну…", cx, py + ph * 0.62); x.fillRect(px + 40, py + ph * 0.5, pw - 80, 6); }
  x.restore();
  x.fillStyle = "rgba(255,255,255,.55)"; x.font = "600 15px sans-serif"; x.textAlign = "left"; x.fillText(`${20 + v * 3}A`, px, py - 14);
  return tex(c);
}
const _fr = [];
const getFrames = () => (_fr.length ? _fr : (_fr.push(...[0, 1, 2, 3, 4, 5, 6].map(drawFrame)), _fr));
function glowTexture() {
  const [c, x] = cnv(256, 256), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(61,90,254,1)"); g.addColorStop(0.4, "rgba(61,90,254,.35)"); g.addColorStop(1, "rgba(61,90,254,0)");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); return tex(c, 1);
}

export function hero(host, S) {
  const r = makeRenderer(host), scene = new Scene(), cam = new PerspectiveCamera(38, 1, 0.1, 60);
  scene.fog = new Fog(0x000000, 9, 20);
  const g = new Group(); scene.add(g);
  const N = mobile ? 15 : 21, rand = rng(7);
  const pts = [];
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push(new Vector3(4.6 * Math.sin(a), 1.5 * Math.sin(2 * a + 0.5), 2.8 * Math.cos(a))); }
  const curve = new CatmullRomCurve3(pts, true, "catmullrom", 0.5);
  const fw = (curve.getLength() / N) * 0.92, geo = new PlaneGeometry(fw, fw * 0.7);
  const textures = getFrames();
  const frames = Array.from({ length: N }, (_, i) => {
    const bad = i % 5 === 2, v = bad ? 5 + (i % 2) : i % 7 === 3 ? 4 : i % 4;
    const m = new MeshBasicMaterial({ map: textures[v], side: DoubleSide, alphaTest: 0.5 });
    const mesh = new Mesh(geo, m); g.add(mesh);
    const f = { mesh, m, i, f: i / N, bad, blue: v === 4, hv: 0, dd: 0, dead: 0, dtm: 0, spin: 0, sa: 0, ox: (rand() - 0.5) * 1.8, oy: (rand() - 0.5) * 1.8, oz: (rand() - 0.5) * 1.8, rx: (rand() - 0.5) * 1.6, ry: (rand() - 0.5) * 1.6, rz: (rand() - 0.5) * 1.2 };
    mesh.userData.ref = f; return f;
  });
  const gt = glowTexture();
  const glow = new Sprite(new SpriteMaterial({ map: gt, transparent: true, blending: AdditiveBlending, depthWrite: false, fog: false }));
  glow.scale.set(11, 11, 1); glow.position.z = -2.5; scene.add(glow);
  /* орбы: кликабельные, ускоряют время */
  const orbs = [0, 1, 2].map((i) => {
    const mesh = new Mesh(new SphereGeometry(0.2, 20, 20), new MeshBasicMaterial({ color: 0x8a9bff, fog: false }));
    const gl = new Sprite(new SpriteMaterial({ map: gt, transparent: true, blending: AdditiveBlending, depthWrite: false, fog: false, opacity: 0.9 }));
    gl.scale.set(2, 2, 1); mesh.add(gl); g.add(mesh);
    const o = { mesh, gl, orb: true, a: i * 2.1, r: 3.4 + i * 0.55, sp: 0.5 + i * 0.17, hv: 0 };
    mesh.userData.ref = o; return o;
  });
  const pa = new Float32Array((mobile ? 90 : 180) * 3), pr = rng(3);
  for (let i = 0; i < pa.length; i += 3) { pa[i] = (pr() - 0.5) * 18; pa[i + 1] = (pr() - 0.5) * 9; pa[i + 2] = (pr() - 0.5) * 12; }
  const pg = new BufferGeometry(); pg.setAttribute("position", new Float32BufferAttribute(pa, 3));
  const dust = new Points(pg, new PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })); scene.add(dust);
  /* вспышка частиц при клике */
  const BN = 90, bpos = new Float32Array(BN * 3), bvel = new Float32Array(BN * 3), blife = new Float32Array(BN);
  for (let i = 0; i < BN; i++) bpos[i * 3 + 2] = -999;
  const battr = new BufferAttribute(bpos, 3); battr.setUsage(DynamicDrawUsage);
  const bg = new BufferGeometry(); bg.setAttribute("position", battr);
  const bp = new Points(bg, new PointsMaterial({ size: 0.13, color: 0x8a9bff, transparent: true, opacity: 0.95, depthWrite: false, blending: AdditiveBlending, fog: false }));
  bp.frustumCulled = false; scene.add(bp);
  let bi = 0, balive = false;
  const W = new Vector3();
  const burst = (obj, n = 26) => {
    obj.getWorldPosition(W); balive = true;
    for (let k = 0; k < n; k++) {
      const i = bi++ % BN, a = Math.random() * 6.283, b = (Math.random() - 0.5) * 3, sp = 1 + Math.random() * 2.8;
      bpos[i * 3] = W.x; bpos[i * 3 + 1] = W.y; bpos[i * 3 + 2] = W.z;
      bvel[i * 3] = Math.cos(a) * sp; bvel[i * 3 + 1] = Math.sin(a) * sp + b * 0.6; bvel[i * 3 + 2] = Math.cos(b) * sp * 0.4; blife[i] = 0.8 + Math.random() * 0.5;
    }
  };
  /* выбор объектов лучом */
  const objs = [...frames.map((f) => f.mesh), ...orbs.map((o) => o.mesh)], ray = new Raycaster(), ndc = new Vector2();
  let hov = null, boost = 0;
  const pick = (cx, cy) => {
    const b = host.getBoundingClientRect();
    ndc.set(((cx - b.left) / b.width) * 2 - 1, -((cy - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(objs, false).find((h) => h.object.scale.x > 0.3);
    return hit ? hit.object.userData.ref : null;
  };
  const act = (o) => {
    burst(o.mesh, o.orb ? 40 : 26);
    if (o.orb) { boost = 1; S.pulse = 1; S.onPick && S.onPick("orb"); }
    else if (o.bad) { o.dead = 1; o.dtm = 4; S.onPick && S.onPick("cut"); }
    else { o.spin = 1; o.sa = 0; S.pulse = Math.min(1, S.pulse + 0.5); S.onPick && S.onPick(o.blue ? "blue" : "frame"); }
  };

  const P = new Vector3(), T = new Vector3(), U = new Vector3(), Nn = new Vector3(), M = new Matrix4(), Q2 = new Quaternion(), Q3 = new Quaternion(), E = new Euler(), AY = new Vector3(0, 1, 0);
  let sx = 0, sy = 0, sp = 0, baseZ = 10, ss = 0, phase = 0, lastT = 0;
  fit(host, r, cam, (a) => {
    const halfH = Math.tan((19 * Math.PI) / 180) * 9.2, visW = 2 * halfH * a, visH = 2 * halfH;
    cam.position.set(0, 0.4, 9.2);
    if (a > 1.25) { const sc = clamp((visH * 0.8) / 5.4, 0.7, 1.2); g.scale.setScalar(sc); g.position.x = visW * 0.16; glow.position.x = g.position.x; }
    else { g.position.x = 0; g.scale.setScalar(1); glow.position.x = 0; cam.position.z = 10 + (1.25 - a) * 9; }
    baseZ = cam.position.z; cam.lookAt(0, 0, 0);
  });
  whenVisible(host, (t0) => {
    const t = reduce ? 2 : t0, dt = clamp(t - lastT, 0, 0.05); lastT = t;
    sx += (S.px - sx) * 0.06; sy += (S.py - sy) * 0.06; sp += (S.p - sp) * 0.1;
    ss += (S.sy - ss) * 0.12; S.pulse *= 0.9; const pl = S.pulse;
    cam.position.z = baseZ - ss * 4.2; cam.lookAt(0, 0, 0);
    host.style.setProperty("--fade", Math.max(0, 1 - ss * 1.05).toFixed(3));
    phase += dt * 0.018 * (1 + boost * 8); boost *= 0.97;
    for (const f of frames) {
      const u = (((f.i / N + phase) % 1) + 1) % 1;
      curve.getPointAt(u, P); curve.getTangentAt(u, T);
      U.set(0, 1, 0).addScaledVector(T, -T.y).normalize(); Nn.crossVectors(T, U);
      M.makeBasis(T, U, Nn); f.mesh.quaternion.setFromRotationMatrix(M);
      const c = smooth((sp * 1.15 - f.f) / 0.2), nz = 1 - c;
      P.x += f.ox * nz; P.y += f.oy * nz + Math.sin(t * 2.2 + f.i) * 0.06 * nz; P.z += f.oz * nz;
      E.set(f.rx * nz, f.ry * nz, f.rz * nz + Math.sin(t * 3 + f.i * 1.7) * 0.05 * nz); Q2.setFromEuler(E); f.mesh.quaternion.multiply(Q2);
      if (f.spin) { f.sa += dt / 0.9; if (f.sa >= 1) { f.spin = 0; f.sa = 0; } else { Q3.setFromAxisAngle(AY, (1 - Math.pow(1 - f.sa, 3)) * Math.PI * 2); f.mesh.quaternion.multiply(Q3); } }
      if (f.dead) { f.dd = Math.min(1, f.dd + dt * 3); f.dtm -= dt; if (f.dtm <= 0) f.dead = 0; } else f.dd = Math.max(0, f.dd - dt * 1.5);
      f.hv += ((f === hov ? 1 : 0) - f.hv) * 0.2;
      const s = (f.bad ? Math.max(0.001, 1 - c * 1.1) : 1) * (1 - f.dd) * (1 + f.hv * 0.12);
      if (f.bad) P.y -= c * 1.3;
      f.mesh.position.copy(P); f.mesh.scale.setScalar(Math.max(0.001, s));
      f.m.color.setScalar(clamp(0.55 + 0.45 * c + f.hv * 0.3 + (f.blue ? 0.08 * Math.sin(t * 2 + f.i) * c : 0), 0, 1.4));
    }
    for (const o of orbs) {
      const a = o.a + t * o.sp * (1 + boost * 4);
      o.mesh.position.set(Math.cos(a) * o.r * 1.15, Math.sin(a * 1.3) * 1.2, Math.sin(a) * o.r * 0.8);
      o.hv += ((o === hov ? 1 : 0) - o.hv) * 0.2;
      o.mesh.scale.setScalar(1 + o.hv * 0.7 + boost * 0.4); o.gl.material.opacity = 0.7 + 0.3 * Math.sin(t * 3 + o.a) + boost * 0.3;
    }
    if (balive) {
      let any = false;
      for (let i = 0; i < BN; i++) if (blife[i] > 0) {
        any = true; blife[i] -= dt; bpos[i * 3] += bvel[i * 3] * dt; bpos[i * 3 + 1] += bvel[i * 3 + 1] * dt; bpos[i * 3 + 2] += bvel[i * 3 + 2] * dt;
        bvel[i * 3] *= 0.96; bvel[i * 3 + 1] *= 0.96; bvel[i * 3 + 2] *= 0.96;
        if (blife[i] <= 0) bpos[i * 3 + 2] = -999;
      }
      battr.needsUpdate = true; balive = any;
    }
    g.rotation.y = Math.sin(t * 0.22) * 0.5 + sx * 0.35;
    g.rotation.x = 0.08 - sy * 0.15; g.rotation.z = Math.sin(t * 0.17) * 0.05; g.position.y = Math.sin(t * 0.5) * 0.1;
    glow.material.opacity = 0.2 + 0.4 * sp + 0.3 * pl; glow.scale.setScalar(11 + pl * 1.5 + boost * 3);
    dust.rotation.y = t * 0.02; dust.position.y = Math.sin(t * 0.3) * 0.2;
    r.render(scene, cam);
  });
  return {
    hover(cx, cy) { hov = pick(cx, cy); return !!hov; },
    click(cx, cy) { const o = pick(cx, cy); if (!o) return false; act(o); return true; },
  };
}

/* ================= КОНТАКТЫ: хлопушка ================= */
function drawStripes(shift) {
  const [c, x] = cnv(1024, 128);
  x.fillStyle = "#0a0a0a"; x.fillRect(0, 0, 1024, 128);
  for (let k = -2; k < 12; k++) {
    x.fillStyle = (k + shift) % 4 === 0 ? "#3d5afe" : "#f2f2f2";
    if ((k + shift) % 2 !== 0 && (k + shift) % 4 !== 0) continue;
    const o = k * 100 + 20; x.beginPath(); x.moveTo(o, 128); x.lineTo(o + 60, 128); x.lineTo(o + 110, 0); x.lineTo(o + 50, 0); x.fill();
  }
  return tex(c);
}
function makeBoard(L) {
  const [c, x] = cnv(768, 456), tx = tex(c);
  const draw = (take) => {
    x.fillStyle = "#0a0a0a"; x.fillRect(0, 0, 768, 456);
    x.strokeStyle = "#f2f2f2"; x.lineWidth = 4; x.strokeRect(18, 18, 732, 420);
    x.beginPath(); x.moveTo(18, 168); x.lineTo(750, 168); x.moveTo(18, 306); x.lineTo(750, 306); x.moveTo(256, 18); x.lineTo(256, 168); x.moveTo(512, 18); x.lineTo(512, 168); x.stroke();
    const cell = (lab, val, px, py, big, col = "#fff") => {
      x.fillStyle = "#8a8a8a"; x.font = "600 24px 'Golos Text',sans-serif"; x.textAlign = "left"; x.fillText(lab.toUpperCase(), px, py);
      x.fillStyle = col; x.font = `700 ${big}px 'Unbounded','Golos Text',sans-serif`; x.fillText(val, px, py + big + 8);
    };
    cell(L.a[0], L.a[1], 40, 56, 62); cell(L.b[0], String(take).padStart(2, "0"), 276, 56, 62, "#8a9bff"); cell("Камера", "A", 532, 56, 62);
    cell(L.c[0], L.c[1], 40, 214, 56); cell(L.d[0], L.d[1], 40, 352, 46);
    x.fillStyle = "#3d5afe"; x.beginPath(); x.arc(704, 350, 22, 0, 7); x.fill();
  };
  draw(1);
  return { tex: tx, redraw(n) { draw(n); tx.needsUpdate = true; } };
}

export function clap(host, L, onClap) {
  const r = makeRenderer(host), scene = new Scene(), cam = new PerspectiveCamera(32, 1, 0.1, 50);
  scene.add(new AmbientLight(0xffffff, 0.5));
  const key = new DirectionalLight(0xffffff, 3); key.position.set(2, 4, 7); scene.add(key);
  const rim = new DirectionalLight(0x3d5afe, 1.5); rim.position.set(-6, 2, -3); scene.add(rim);
  const flash = new PointLight(0x8a9bff, 0, 14, 2); flash.position.set(0, 0.8, 3); scene.add(flash);
  const g = new Group(); scene.add(g);
  const black = new MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.5, metalness: 0.2 });
  const bd = makeBoard(L), face = new MeshStandardMaterial({ map: bd.tex, roughness: 0.6 });
  const sA = new MeshStandardMaterial({ map: drawStripes(0), roughness: 0.5 }), sB = new MeshStandardMaterial({ map: drawStripes(2), roughness: 0.5 });
  const box = (w, h, mats) => new Mesh(new BoxGeometry(w, h, 0.14), mats);
  const board = box(3.2, 1.9, [black, black, black, black, face, black]); board.position.y = -0.2; g.add(board);
  const bar = box(3.2, 0.42, [black, black, black, black, sA, sA]); bar.position.y = 0.96; g.add(bar);
  const pivot = new Group(); pivot.position.set(-1.6, 1.17, 0); g.add(pivot);
  const stick = box(3.2, 0.42, [black, black, black, black, sB, sB]); stick.position.set(1.6, 0.24, 0); pivot.add(stick);
  const hinge = new Mesh(new CylinderGeometry(0.1, 0.1, 0.22, 20), new MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.3, metalness: 0.5 }));
  hinge.rotation.x = Math.PI / 2; hinge.position.set(-1.6, 1.17, 0); g.add(hinge);

  const OPEN = 0.46; let ang = OPEN, vel = 0, fl = 0, hit = true, nx = 0, ny = 0, sx = 0, sy = 0, last = 0;
  let take = 1;
  const doClap = (inc) => { if (inc) { take++; bd.redraw(take); } ang = OPEN + 0.07; vel = -17; hit = false; };
  addEventListener("pointermove", (e) => {
    const b = host.getBoundingClientRect();
    nx = clamp(((e.clientX - b.left) / b.width - 0.5) * 2, -1, 1); ny = clamp(((e.clientY - b.top) / b.height - 0.5) * 2, -1, 1);
  }, { passive: true });
  fit(host, r, cam, (a) => { cam.position.set(0, 0.5, a < 1.1 ? 13 : 10.4); cam.lookAt(0, 0.55, 0); });
  whenVisible(host, (t0) => {
    const t = reduce ? 1 : t0, dt = clamp(t - last, 0, 0.033); last = t;
    vel += ((OPEN - ang) * 70 - vel * 8) * dt; ang += vel * dt;
    if (ang < 0) { ang = 0; vel = Math.abs(vel) * 0.32; if (!hit) { hit = true; fl = 1; onClap && onClap(); } }
    pivot.rotation.z = ang;
    sx += (nx - sx) * 0.07; sy += (ny - sy) * 0.07;
    g.rotation.y = sx * 0.5 + Math.sin(t * 0.5) * 0.12; g.rotation.x = -sy * 0.3 + 0.1; g.rotation.z = Math.sin(t * 0.7) * 0.03;
    g.position.y = Math.sin(t * 1.1) * 0.08; g.position.x = (Math.random() - 0.5) * 0.09 * fl;
    flash.intensity = fl * 160; fl *= 0.88;
    r.render(scene, cam);
  });
  return { clap: doClap };
}

/* ================= ЗАСТАВКА: гиперпрыжок, планета, портал ================= */
function planetTexture() {
  const [c, x] = cnv(1024, 512), r = rng(5);
  const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "#0a1030"); g.addColorStop(0.5, "#1c2f8f"); g.addColorStop(1, "#070a24");
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 260; i++) {
    const px = r() * 1024, py = r() * 512, rad = 20 + r() * 90, gr = x.createRadialGradient(px, py, 0, px, py, rad);
    gr.addColorStop(0, `rgba(${r() < 0.5 ? "138,155,255" : "255,255,255"},${0.05 + r() * 0.12})`); gr.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = gr; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
  x.globalAlpha = 0.12;
  for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? "#3d5afe" : "#000"; x.fillRect(0, i * 37 + r() * 10, 1024, 10 + r() * 20); }
  x.globalAlpha = 0.85; x.fillStyle = "#dfe6ff";
  for (let i = 0; i < 520; i++) x.fillRect(r() * 1024, 90 + r() * 330, 1.6, 1.6);
  return tex(c, 4);
}

export function boot(canvas, API) {
  const r = new WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance" });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2)); r.setClearColor(0x02030a, 1);
  const scene = new Scene(), cam = new PerspectiveCamera(62, 1, 0.1, 700);
  const size = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
  size(); addEventListener("resize", size);
  const ez = (x) => 1 - Math.pow(1 - clamp(x), 3);

  /* звёзды-штрихи: при гиперпрыжке вытягиваются к центру */
  const NS = mobile ? 900 : 2000, rnd = rng(11), sd = new Float32Array(NS * 3), pos = new Float32Array(NS * 6), col = new Float32Array(NS * 6);
  const place = (i, far) => { sd[i * 3] = (rnd() - 0.5) * 240; sd[i * 3 + 1] = (rnd() - 0.5) * 150; sd[i * 3 + 2] = far ? -400 - rnd() * 20 : 20 - rnd() * 420; };
  for (let i = 0; i < NS; i++) {
    place(i, false);
    const b = 0.45 + rnd() * 0.55, blue = rnd() < 0.35, c = blue ? [0.45 * b, 0.6 * b, b] : [b, b, b];
    for (let k = 0; k < 3; k++) { col[i * 6 + k] = c[k]; col[i * 6 + 3 + k] = c[k] * 0.12; }
  }
  const pattr = new BufferAttribute(pos, 3); pattr.setUsage(DynamicDrawUsage);
  const lg = new BufferGeometry(); lg.setAttribute("position", pattr); lg.setAttribute("color", new BufferAttribute(col, 3));
  const stars = new LineSegments(lg, new LineBasicMaterial({ vertexColors: true, transparent: true, blending: AdditiveBlending, depthWrite: false }));
  stars.frustumCulled = false; scene.add(stars);
  const upd = (dt, speed) => {
    const len = Math.max(0.12, speed * 0.04);
    for (let i = 0; i < NS; i++) {
      let z = sd[i * 3 + 2] + speed * dt;
      if (z > 20) { place(i, true); z = sd[i * 3 + 2]; } else sd[i * 3 + 2] = z;
      const x = sd[i * 3], y = sd[i * 3 + 1], o = i * 6;
      pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; pos[o + 3] = x; pos[o + 4] = y; pos[o + 5] = z - len;
    }
    pattr.needsUpdate = true;
  };

  /* туманности */
  const gtx = glowTexture(), neb = [[0x3d5afe, -90, 30, -330, 330], [0x1a2a9c, 110, -40, -380, 380], [0x8a9bff, -20, -70, -360, 260], [0x2a3fd0, 60, 70, -350, 300]].map(([c, x, y, z, sc]) => {
    const sp = new Sprite(new SpriteMaterial({ map: gtx, color: c, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false }));
    sp.position.set(x, y, z); sp.scale.set(sc, sc, 1); scene.add(sp); return sp;
  });

  /* планета с атмосферой и кольцом из кадров плёнки */
  scene.add(new AmbLight(0xffffff, 0.35));
  const sun = new DirectionalLight(0xffffff, 3.2); sun.position.set(12, 6, 8); scene.add(sun);
  const rimL = new DirectionalLight(0x3d5afe, 2.4); rimL.position.set(-10, -4, -6); scene.add(rimL);
  const planet = new Group(); scene.add(planet);
  planet.add(new Mesh(new SphereGeometry(4, 56, 56), new MeshStandardMaterial({ map: planetTexture(), roughness: 0.9, metalness: 0 })));
  planet.add(new Mesh(new SphereGeometry(4.55, 48, 48), new ShaderMaterial({
    transparent: true, blending: AdditiveBlending, side: BackSide, depthWrite: false, uniforms: { c: { value: new Color(0x3d5afe) } },
    vertexShader: "varying vec3 n; void main(){ n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "varying vec3 n; uniform vec3 c; void main(){ float i = pow(0.74 - dot(n, vec3(0.0, 0.0, 1.0)), 3.0); gl_FragColor = vec4(c, 1.0) * i * 1.7; }",
  })));
  const ring = new Group(); ring.rotation.set(0.55, 0, -0.3); planet.add(ring);
  const FR = getFrames(), nf = mobile ? 14 : 22, fgeo = new PlaneGeometry(2.2, 1.5);
  const rf = Array.from({ length: nf }, (_, i) => {
    const m = new Mesh(fgeo, new MeshBasicMaterial({ map: FR[[0, 1, 2, 3, 4][i % 5]], side: DoubleSide, alphaTest: 0.5 }));
    ring.add(m); return { m, a: (i / nf) * Math.PI * 2 };
  });

  /* портал */
  const portal = new Group(); scene.add(portal);
  const t1 = new Mesh(new TorusGeometry(5, 0.28, 20, 90), new MeshBasicMaterial({ color: 0x8a9bff })), t2 = new Mesh(new TorusGeometry(3.4, 0.18, 16, 80), new MeshBasicMaterial({ color: 0x3d5afe }));
  const voidM = new Mesh(new CircleGeometry(4.7, 48), new MeshBasicMaterial({ color: 0x0a1458, transparent: true, opacity: 0.85 }));
  const pg2 = new Sprite(new SpriteMaterial({ map: gtx, transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false, fog: false }));
  pg2.scale.set(46, 46, 1); portal.add(voidM, t1, t2, pg2); portal.visible = false;

  const fwd = new Vector3(0, 0, -100), look = new Vector3(), tgt = new Vector3();
  let alive = true, last = performance.now(), t = 0, d = 0, sp = 330, id = 0;
  const loop = (now) => {
    if (!alive) return;
    const raw = Math.min((now - last) / 1000, 0.5), dt = clamp(raw, 0, 0.05); last = now; t += dt;
    const p = API.p;
    const want = (p < 0.38 ? 330 : p < 0.55 ? 330 - ((p - 0.38) / 0.17) * 316 : 14) + d * d * 900;
    sp += (want - sp) * Math.min(1, dt * 4); upd(dt, sp);
    neb.forEach((n, i) => { n.material.opacity = (0.12 + 0.4 * smooth(p / 0.6)) * (1 - d * 0.8); n.position.x += Math.sin(t * 0.2 + i) * dt * 2; });

    const k = ez(p / 0.55);
    planet.position.set(-7.5 - (1 - k) * 10 - smooth((p - 0.55) / 0.45) * 3.5 - d * 40, 1.2, -20 - (1 - k) * 260 + smooth((p - 0.55) / 0.45) * 6);
    planet.rotation.y += dt * 0.06;
    const rk = ez((p - 0.45) / 0.2); ring.scale.setScalar(rk * (1 + Math.sin(rk * 3.14) * 0.08));
    rf.forEach((f) => {
      const a = f.a + t * 0.32;
      f.m.position.set(Math.cos(a) * 7.4, 0, Math.sin(a) * 7.4); f.m.rotation.y = Math.PI / 2 - a;
    });

    portal.visible = p > 0.55;
    portal.position.set(15, -1.5, -300 + smooth((p - 0.6) / 0.3) * 230);
    portal.rotation.z += dt * 0.8; t2.rotation.z -= dt * 1.6;
    portal.scale.setScalar(0.9 + smooth((p - 0.6) / 0.3) * 1.5 + d * 0.5);

    if (API.diving) d = Math.min(1, d + raw / (API.fast ? 0.5 : 1.2));
    API.glow = smooth((d - 0.5) / 0.5);
    if (d >= 1) API.finished = true;
    const e = ez(d);
    cam.position.set(Math.sin(t * 0.3) * 0.4, Math.cos(t * 0.25) * 0.25, 0);
    if (d > 0) { tgt.copy(portal.position); tgt.z += 8; cam.position.lerp(tgt, e); }
    look.lerpVectors(fwd, portal.position, d > 0 ? 1 : smooth((p - 0.8) / 0.2) * 0.8); cam.lookAt(look);
    cam.fov = 62 + e * 45; cam.updateProjectionMatrix();
    r.render(scene, cam); id = requestAnimationFrame(loop);
  };
  id = requestAnimationFrame(loop);
  return { dispose() { alive = false; cancelAnimationFrame(id); removeEventListener("resize", size); r.dispose(); r.forceContextLoss && r.forceContextLoss(); } };
}
