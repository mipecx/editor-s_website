/* В jsdom нет matchMedia, а GSAP ScrollTrigger требует его при регистрации. */
if (!window.matchMedia) {
  window.matchMedia = (q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
}
