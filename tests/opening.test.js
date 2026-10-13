import { test, expect } from "vitest";
import * as opening from "../src/scenes/opening.js";
import { DATA } from "../src/data.js";

const mount = () => { document.body.innerHTML = opening.render(DATA); return document.getElementById(opening.id); };
const ctx = { D: DATA, motion: { reduced: true }, sound: { cut() {} } };

test("заголовок для скринридера — без слов-паразитов", () => {
  const root = mount();
  expect(root.querySelector("h1").getAttribute("aria-label")).toBe("Я ИМЯ. Режу ролики так, чтобы их досматривали.");
});

test("при reduced-motion паразиты сразу вырезаны, лид и кнопка видны", () => {
  const root = mount();
  opening.init(root, ctx);
  const fillers = root.querySelectorAll(".filler");
  expect(fillers.length).toBe(4);
  fillers.forEach((f) => expect(f.classList.contains("gone")).toBe(true));
  expect(root.querySelector(".op-after").classList.contains("in")).toBe(true);
});
