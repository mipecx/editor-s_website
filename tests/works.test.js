import { test, expect } from "vitest";
import * as works from "../src/scenes/works.js";
import { setupTheater, openTheater } from "../src/lib/theater.js";
import { normalizeWork } from "../src/lib/content.js";
import { DATA } from "../src/data.js";

const ctx = { D: DATA, motion: { reduced: true, stop() {}, resume() {} }, sound: { scene() {} } };

test("работа без видео — заглушка с подписью и без <video>", () => {
  document.body.innerHTML = works.render(DATA);
  const root = document.getElementById(works.id);
  expect(root.querySelectorAll("video").length).toBe(0);
  expect(root.textContent).toContain("Ролик скоро будет здесь");
});

test("кинозал: фокус на «Закрыть», Esc закрывает и возвращает фокус на афишу", () => {
  document.body.innerHTML = works.render(DATA);
  setupTheater(ctx);
  const poster = document.querySelector(".poster");
  poster.focus();
  openTheater(normalizeWork(DATA.works.items[0]), poster);
  const dlg = document.querySelector(".theater");
  expect(dlg.hidden).toBe(false);
  expect(document.activeElement.getAttribute("aria-label")).toBe(DATA.works.close);
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  expect(dlg.hidden).toBe(true);
  expect(document.activeElement).toBe(poster);
});
