import { test, expect } from "vitest";
import * as editing from "../src/scenes/editing.js";
import { DATA } from "../src/data.js";

const mount = () => { document.body.innerHTML = editing.render(DATA); return document.getElementById(editing.id); };

test("таймлайн только для просмотра: нет перетаскивания и кнопок плеера", () => {
  const root = mount();
  expect(root.querySelectorAll("[draggable]").length).toBe(0);
  expect(root.querySelectorAll("button").length).toBe(0);
});

test("дорожки подписаны понятными словами", () => {
  const root = mount();
  const labels = [...root.querySelectorAll(".tl-name")].map((e) => e.textContent);
  expect(labels).toEqual(["Видео", "Текст", "Звук"]);
});

test("при reduced-motion все три принципа видны списком", () => {
  const root = mount();
  editing.init(root, { D: DATA, motion: { reduced: true }, sound: { cut() {} } });
  expect(root.classList.contains("list")).toBe(true);
  expect(root.querySelectorAll(".ed-point").length).toBe(3);
});
