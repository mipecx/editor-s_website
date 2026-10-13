import { test, expect, vi } from "vitest";

test("при prefers-reduced-motion плавная прокрутка не включается", async () => {
  window.matchMedia = vi.fn((q) => ({ matches: q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {} }));
  const { motion } = await import("../src/lib/motion.js");
  expect(motion.reduced).toBe(true);
  motion.start();
  expect(motion.lenis).toBe(null);
});
