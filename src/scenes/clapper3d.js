/* 3D-хлопушка (перенесена из v4, палитра v5). Грузится лениво, только при подходе к финалу. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, BoxGeometry, CylinderGeometry,
  MeshStandardMaterial, CanvasTexture, SRGBColorSpace, DirectionalLight, AmbientLight, PointLight,
} from "three";

const ACCENT = "#ff5a36", INK = "#0b0a09", PAPER = "#f2ede4";
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const tex = (c) => { const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t; };
const cnv = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };

function stripes(shift) {
  const [c, x] = cnv(1024, 128);
  x.fillStyle = INK; x.fillRect(0, 0, 1024, 128);
  for (let k = -2; k < 12; k++) {
    if ((k + shift) % 2 !== 0) continue;
    x.fillStyle = (k + shift) % 4 === 0 ? ACCENT : PAPER;
    const o = k * 100 + 20; x.beginPath(); x.moveTo(o, 128); x.lineTo(o + 60, 128); x.lineTo(o + 110, 0); x.lineTo(o + 50, 0); x.fill();
  }
  return tex(c);
}

function board(L) {
  const [c, x] = cnv(768, 456), t = tex(c);
  const draw = (take) => {
    x.fillStyle = INK; x.fillRect(0, 0, 768, 456);
    x.strokeStyle = PAPER; x.lineWidth = 4; x.strokeRect(18, 18, 732, 420);
    x.beginPath(); x.moveTo(18, 168); x.lineTo(750, 168); x.moveTo(18, 306); x.lineTo(750, 306); x.moveTo(256, 18); x.lineTo(256, 168); x.moveTo(512, 18); x.lineTo(512, 168); x.stroke();
    const cell = (lab, val, px, py, big, col = PAPER) => {
      x.fillStyle = "#9b958a"; x.font = "500 24px 'JetBrains Mono',monospace"; x.textAlign = "left"; x.fillText(lab.toUpperCase(), px, py);
      x.fillStyle = col; x.font = `500 ${big}px 'Cormorant Garamond',serif`; x.fillText(val, px, py + big + 6);
    };
    cell("Сцена", "Финал", 40, 56, 66); cell("Дубль", String(take).padStart(2, "0"), 276, 56, 66, ACCENT); cell("Камера", "A", 532, 56, 66);
    cell("Монтаж", L.scene, 40, 214, 60); cell("Ролик", "Ваш", 40, 352, 50);
    x.fillStyle = ACCENT; x.beginPath(); x.arc(704, 350, 22, 0, 7); x.fill();
  };
  draw(1);
  return { tex: t, redraw(n) { draw(n); t.needsUpdate = true; } };
}

export function mount(host, L) {
  const small = matchMedia("(max-width:900px)").matches;
  const r = new WebGLRenderer({ antialias: !small, alpha: true, powerPreference: "high-performance" });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  r.setClearColor(0x000000, 0);
  host.appendChild(r.domElement);
  const scene = new Scene(), cam = new PerspectiveCamera(32, 1, 0.1, 50);
  scene.add(new AmbientLight(0xffffff, 0.45));
  const key = new DirectionalLight(0xfff1e6, 3); key.position.set(2, 4, 7); scene.add(key);
  const rim = new DirectionalLight(0xff5a36, 1.6); rim.position.set(-6, 2, -3); scene.add(rim);
  const flash = new PointLight(0xffb08f, 0, 14, 2); flash.position.set(0, 0.8, 3); scene.add(flash);

  const g = new Group(); scene.add(g);
  const black = new MeshStandardMaterial({ color: 0x0f0e0c, roughness: 0.5, metalness: 0.2 });
  const bd = board(L), face = new MeshStandardMaterial({ map: bd.tex, roughness: 0.6 });
  const sA = new MeshStandardMaterial({ map: stripes(0), roughness: 0.5 }), sB = new MeshStandardMaterial({ map: stripes(2), roughness: 0.5 });
  const box = (w, h, mats) => new Mesh(new BoxGeometry(w, h, 0.14), mats);
  const body = box(3.2, 1.9, [black, black, black, black, face, black]); body.position.y = -0.2; g.add(body);
  const bar = box(3.2, 0.42, [black, black, black, black, sA, sA]); bar.position.y = 0.96; g.add(bar);
  const pivot = new Group(); pivot.position.set(-1.6, 1.17, 0); g.add(pivot);
  const stick = box(3.2, 0.42, [black, black, black, black, sB, sB]); stick.position.set(1.6, 0.24, 0); pivot.add(stick);
  const hinge = new Mesh(new CylinderGeometry(0.1, 0.1, 0.22, 20), new MeshStandardMaterial({ color: 0xf2ede4, roughness: 0.3, metalness: 0.5 }));
  hinge.rotation.x = Math.PI / 2; hinge.position.set(-1.6, 1.17, 0); g.add(hinge);

  const OPEN = 0.46;
  let ang = OPEN, vel = 0, fl = 0, hit = true, nx = 0, ny = 0, sx = 0, sy = 0, last = 0, take = 1;
  const clap = () => { take++; bd.redraw(take); ang = OPEN + 0.07; vel = -17; hit = false; };
  addEventListener("pointermove", (e) => {
    const b = host.getBoundingClientRect();
    nx = clamp(((e.clientX - b.left) / b.width - 0.5) * 2, -1, 1); ny = clamp(((e.clientY - b.top) / b.height - 0.5) * 2, -1, 1);
  }, { passive: true });

  new ResizeObserver(() => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    cam.position.set(0, 0.4, w / h < 1.1 ? 9.6 : 7.4); cam.lookAt(0, 0.4, 0);
  }).observe(host);

  /* рендер только пока хлопушка на экране */
  let on = false, id = 0;
  const t0 = performance.now();
  const tick = (now) => {
    const t = L.reduced ? 1 : (now - t0) / 1000, dt = clamp(t - last, 0, 0.033); last = t;
    vel += ((OPEN - ang) * 70 - vel * 8) * dt; ang += vel * dt;
    if (ang < 0) { ang = 0; vel = Math.abs(vel) * 0.32; if (!hit) { hit = true; fl = 1; L.onClap && L.onClap(); } }
    pivot.rotation.z = ang;
    sx += (nx - sx) * 0.07; sy += (ny - sy) * 0.07;
    g.rotation.y = sx * 0.45 + Math.sin(t * 0.5) * 0.1; g.rotation.x = -sy * 0.25 + 0.1; g.rotation.z = Math.sin(t * 0.7) * 0.03;
    g.position.y = Math.sin(t * 1.1) * 0.06;
    flash.intensity = fl * 140; fl *= 0.88;
    r.render(scene, cam);
    id = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !on) { on = true; id = requestAnimationFrame(tick); }
    else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(id); }
  }, { rootMargin: "120px" }).observe(host);

  return { clap };
}
