/* Движение: плавная прокрутка (Lenis) + анимации по прокрутке (GSAP ScrollTrigger).
   При prefers-reduced-motion (или ?reduced в адресе) — обычная прокрутка и конечные состояния. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const wantsReduced = () => {
  try { if (new URLSearchParams(location.search).has("reduced")) return true; } catch (e) {}
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const root = () => document.documentElement;

export const motion = {
  reduced: wantsReduced(),
  lenis: null,
  start() {
    let t = 0;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 200); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    if (this.reduced) return;
    const lenis = (this.lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  },
  scrollTo(target) {
    if (this.lenis) this.lenis.scrollTo(target, { duration: 1.6 });
    else (typeof target === "number" ? scrollTo(0, target) : target.scrollIntoView());
  },
  /* блокировка прокрутки — для входа в зал и кинозала */
  stop() { root().classList.add("locked"); this.lenis && this.lenis.stop(); },
  resume() { root().classList.remove("locked"); this.lenis && this.lenis.start(); },
  refresh() { ScrollTrigger.refresh(); },
};

export { gsap, ScrollTrigger };
