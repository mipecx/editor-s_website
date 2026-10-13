import { test, expect } from "vitest";
import { sound } from "../src/lib/sound.js";

test("без AudioContext звук включается молча и не бросает исключений", () => {
  delete window.AudioContext;
  delete window.webkitAudioContext;
  expect(() => { sound.enable(); sound.cut(); sound.scene(); sound.clap(); sound.hover(); }).not.toThrow();
  expect(sound.on).toBe(true);
  sound.disable();
  expect(sound.on).toBe(false);
});
