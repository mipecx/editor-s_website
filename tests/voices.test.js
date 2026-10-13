import { test, expect } from "vitest";
import * as voices from "../src/scenes/voices.js";
import * as services from "../src/scenes/services.js";
import { DATA } from "../src/data.js";

test("вопросов столько же, сколько в данных, и это <details>", () => {
  document.body.innerHTML = voices.render(DATA);
  expect(document.querySelectorAll("details").length).toBe(DATA.faq.items.length);
});

test("временный отзыв помечен видимой меткой", () => {
  document.body.innerHTML = voices.render(DATA);
  const card = document.querySelector(".review");
  expect(card.textContent).toContain(DATA.reviews.draftLabel);
});

test("настоящий отзыв без метки", () => {
  const D = { ...DATA, reviews: { ...DATA.reviews, items: [{ text: "Огонь", name: "Аня", url: "#", link: "канал" }] } };
  document.body.innerHTML = voices.render(D);
  expect(document.querySelector(".review").textContent).not.toContain(DATA.reviews.draftLabel);
});

test("условия: три формата и четыре шага", () => {
  document.body.innerHTML = services.render(DATA);
  expect(document.querySelectorAll(".fmt").length).toBe(3);
  expect(document.querySelectorAll(".step").length).toBe(4);
});
