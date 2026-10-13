import { test, expect } from "vitest";
import * as finale from "../src/scenes/finale.js";
import { DATA } from "../src/data.js";

const ctx = { D: DATA, motion: { reduced: true }, sound: { clap() {} } };

test("финальная кнопка ведёт в Telegram", () => {
  document.body.innerHTML = finale.render(DATA);
  const a = document.querySelector(".fin-cta");
  expect(a.getAttribute("href")).toBe(DATA.telegram);
});

test("подвал содержит пометку версии", () => {
  expect(finale.renderFooter(DATA)).toContain(DATA.version);
});

test("без WebGL показывается плоская хлопушка", () => {
  document.body.innerHTML = finale.render(DATA);
  finale.init(document.getElementById(finale.id), ctx);
  expect(document.querySelector(".clapper .clap-flat")).not.toBeNull();
});
