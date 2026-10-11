/* 3D-сцены. Грузятся лениво, после первого экрана. Всё процедурное: ни одной внешней модели. */
import {
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
  const textures = [0, 1, 2, 3, 4, 5, 6].map(drawFrame);
  const frames = Array.from({ length: N }, (_, i) => {
    const bad = i % 5 === 2, v = bad ? 5 + (i % 2) : i % 7 === 3 ? 4 : i % 4;
    const m = new MeshBasicMaterial({ map: textures[v], side: DoubleSide, alphaTest: 0.5 });
    const mesh = new Mesh(geo, m); g.add(mesh);
    return { mesh, m, i, f: i / N, bad, blue: v === 4, ox: (rand() - 0.5) * 1.8, oy: (rand() - 0.5) * 1.8, oz: (rand() - 0.5) * 1.8, rx: (rand() - 0.5) * 1.6, ry: (rand() - 0.5) * 1.6, rz: (rand() - 0.5) * 1.2 };
  });
  const glow = new Sprite(new SpriteMaterial({ map: glowTexture(), transparent: true, blending: AdditiveBlending, depthWrite: false, fog: false }));
  glow.scale.set(11, 11, 1); glow.position.z = -2.5; scene.add(glow);
  const pa = new Float32Array((mobile ? 90 : 180) * 3), pr = rng(3);
  for (let i = 0; i < pa.length; i += 3) { pa[i] = (pr() - 0.5) * 18; pa[i + 1] = (pr() - 0.5) * 9; pa[i + 2] = (pr() - 0.5) * 12; }
  const pg = new BufferGeometry(); pg.setAttribute("position", new Float32BufferAttribute(pa, 3));
  const dust = new Points(pg, new PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })); scene.add(dust);

  const P = new Vector3(), T = new Vector3(), U = new Vector3(), Nn = new Vector3(), M = new Matrix4(), Q2 = new Quaternion(), E = new Euler();
  let sx = 0, sy = 0, sp = 0, baseZ = 10, ss = 0;
  fit(host, r, cam, (a) => {
    if (a > 1.25) { g.position.x = 2.1; g.scale.setScalar(1); glow.position.x = 2.1; cam.position.set(0, 0.4, 9.2); }
    else { g.position.x = 0; g.scale.setScalar(1); glow.position.x = 0; cam.position.set(0, 0.4, 10 + (1.25 - a) * 9); }
    baseZ = cam.position.z; cam.lookAt(0, 0, 0);
  });
  whenVisible(host, (t0) => {
    const t = reduce ? 2 : t0;
    sx += (S.px - sx) * 0.06; sy += (S.py - sy) * 0.06; sp += (S.p - sp) * 0.1;
    ss += (S.sy - ss) * 0.12; S.pulse *= 0.9; const pl = S.pulse;
    cam.position.z = baseZ - ss * 4.2; cam.lookAt(0, 0, 0);
    host.style.setProperty("--fade", Math.max(0, 1 - ss * 1.05).toFixed(3));
    for (const f of frames) {
      const u = (((f.i / N + t * 0.018) % 1) + 1) % 1;
      curve.getPointAt(u, P); curve.getTangentAt(u, T);
      U.set(0, 1, 0).addScaledVector(T, -T.y).normalize(); Nn.crossVectors(T, U);
      M.makeBasis(T, U, Nn); f.mesh.quaternion.setFromRotationMatrix(M);
      const c = smooth((sp * 1.15 - f.f) / 0.2), nz = 1 - c;
      P.x += f.ox * nz; P.y += f.oy * nz + Math.sin(t * 2.2 + f.i) * 0.06 * nz; P.z += f.oz * nz;
      E.set(f.rx * nz, f.ry * nz, f.rz * nz + Math.sin(t * 3 + f.i * 1.7) * 0.05 * nz); Q2.setFromEuler(E); f.mesh.quaternion.multiply(Q2);
      const s = f.bad ? Math.max(0.001, 1 - c * 1.1) : 1;
      if (f.bad) P.y -= c * 1.3;
      f.mesh.position.copy(P); f.mesh.scale.setScalar(s);
      f.m.color.setScalar(0.55 + 0.45 * c + (f.blue ? 0.08 * Math.sin(t * 2 + f.i) * c : 0));
    }
    g.rotation.y = Math.sin(t * 0.22) * 0.5 + sx * 0.35;
    g.rotation.x = 0.08 - sy * 0.15; g.rotation.z = Math.sin(t * 0.17) * 0.05; g.position.y = Math.sin(t * 0.5) * 0.1;
    glow.material.opacity = 0.2 + 0.4 * sp + 0.3 * pl; glow.scale.setScalar(11 + pl * 1.5); dust.rotation.y = t * 0.02; dust.position.y = Math.sin(t * 0.3) * 0.2;
    r.render(scene, cam);
  });
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
function drawBoard(L) {
  const [c, x] = cnv(768, 456);
  x.fillStyle = "#0a0a0a"; x.fillRect(0, 0, 768, 456);
  x.strokeStyle = "#f2f2f2"; x.lineWidth = 4; x.strokeRect(18, 18, 732, 420);
  x.beginPath(); x.moveTo(18, 168); x.lineTo(750, 168); x.moveTo(18, 306); x.lineTo(750, 306); x.moveTo(256, 18); x.lineTo(256, 168); x.moveTo(512, 18); x.lineTo(512, 168); x.stroke();
  const cell = (lab, val, px, py, big, col = "#fff") => {
    x.fillStyle = "#8a8a8a"; x.font = "600 24px 'Golos Text',sans-serif"; x.textAlign = "left"; x.fillText(lab.toUpperCase(), px, py);
    x.fillStyle = col; x.font = `700 ${big}px 'Unbounded','Golos Text',sans-serif`; x.fillText(val, px, py + big + 8);
  };
  cell(L.a[0], L.a[1], 40, 56, 62); cell(L.b[0], L.b[1], 276, 56, 62, "#8a9bff"); cell("Камера", "A", 532, 56, 62);
  cell(L.c[0], L.c[1], 40, 214, 56); cell(L.d[0], L.d[1], 40, 352, 46);
  x.fillStyle = "#3d5afe"; x.beginPath(); x.arc(704, 350, 22, 0, 7); x.fill();
  return tex(c);
}

export function clap(host, L, onClap) {
  const r = makeRenderer(host), scene = new Scene(), cam = new PerspectiveCamera(32, 1, 0.1, 50);
  scene.add(new AmbientLight(0xffffff, 0.5));
  const key = new DirectionalLight(0xffffff, 3); key.position.set(2, 4, 7); scene.add(key);
  const rim = new DirectionalLight(0x3d5afe, 1.5); rim.position.set(-6, 2, -3); scene.add(rim);
  const flash = new PointLight(0x8a9bff, 0, 14, 2); flash.position.set(0, 0.8, 3); scene.add(flash);
  const g = new Group(); scene.add(g);
  const black = new MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.5, metalness: 0.2 });
  const face = new MeshStandardMaterial({ map: drawBoard(L), roughness: 0.6 });
  const sA = new MeshStandardMaterial({ map: drawStripes(0), roughness: 0.5 }), sB = new MeshStandardMaterial({ map: drawStripes(2), roughness: 0.5 });
  const box = (w, h, mats) => new Mesh(new BoxGeometry(w, h, 0.14), mats);
  const board = box(3.2, 1.9, [black, black, black, black, face, black]); board.position.y = -0.2; g.add(board);
  const bar = box(3.2, 0.42, [black, black, black, black, sA, sA]); bar.position.y = 0.96; g.add(bar);
  const pivot = new Group(); pivot.position.set(-1.6, 1.17, 0); g.add(pivot);
  const stick = box(3.2, 0.42, [black, black, black, black, sB, sB]); stick.position.set(1.6, 0.24, 0); pivot.add(stick);
  const hinge = new Mesh(new CylinderGeometry(0.1, 0.1, 0.22, 20), new MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.3, metalness: 0.5 }));
  hinge.rotation.x = Math.PI / 2; hinge.position.set(-1.6, 1.17, 0); g.add(hinge);

  const OPEN = 0.46; let ang = OPEN, vel = 0, fl = 0, hit = true, nx = 0, ny = 0, sx = 0, sy = 0, last = 0;
  const doClap = () => { ang = OPEN + 0.07; vel = -17; hit = false; };
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
