import { test, expect, beforeEach } from "vitest";
import * as entry from "../src/scenes/entry.js";
import { sound } from "../src/lib/sound.js";
import { DATA } from "../src/data.js";

const motion = { reduced: true, stop() {}, resume() {} };
const mount = () => {
  document.body.innerHTML = entry.render(DATA);
  return document.getElementById(entry.id);
};
beforeEach(() => { localStorage.clear(); delete window.AudioContext; });

test("при входе фокус стоит на кнопке «Смотреть со звуком»", () => {
  const root = mount();
  entry.init(root, { D: DATA, motion, sound, syncSound() {} });
  expect(document.activeElement.textContent).toBe(DATA.entry.withSound);
});

test("Esc выбирает «Без звука» и закрывает экран", async () => {
  const root = mount();
  const done = entry.init(root, { D: DATA, motion, sound, syncSound() {} });
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  await done;
  expect(sound.on).toBe(false);
  expect(root.hidden).toBe(true);
});

test("при повторном визите фокус на прошлом выборе", () => {
  localStorage.setItem("v5-sound", "0");
  const root = mount();
  entry.init(root, { D: DATA, motion, sound, syncSound() {} });
  expect(document.activeElement.textContent).toBe(DATA.entry.noSound);
});
