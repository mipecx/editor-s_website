import { test, expect } from "vitest";
import * as ba from "../src/scenes/beforeAfter.js";
import { DATA } from "../src/data.js";

const ctx = { D: DATA, motion: { reduced: true }, sound: { cut() {} } };
const mount = (D = DATA) => { document.body.innerHTML = ba.render(D); return document.getElementById(ba.id); };

test("ручка сравнения — слайдер на 50%, стрелка вправо сдвигает на 5%", () => {
  const root = mount();
  ba.init(root, ctx);
  const knob = root.querySelector('[role="slider"]');
  expect(knob.getAttribute("aria-valuenow")).toBe("50");
  knob.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  expect(knob.getAttribute("aria-valuenow")).toBe("55");
});

test("без путей к видео в сцене нет ни одного <video>", () => {
  const root = mount();
  expect(root.querySelectorAll("video").length).toBe(0);
});

test("с путями к видео — два видео без звука", () => {
  const root = mount({ ...DATA, ba: { ...DATA.ba, raw: "raw.mp4", fin: "fin.mp4" } });
  const v = root.querySelectorAll("video");
  expect(v.length).toBe(2);
  v.forEach((x) => expect(x.muted || x.hasAttribute("muted")).toBe(true));
});

test("при reduced-motion все шаги сразу применены", () => {
  const root = mount();
  ba.init(root, ctx);
  expect(root.dataset.step).toBe("3");
});
