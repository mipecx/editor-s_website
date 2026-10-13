import { test, expect } from "vitest";
import { parseFillers, timecode, stepAt, normalizeWork } from "../src/lib/content.js";

test("parseFillers отмечает слова в фигурных скобках как паразитов", () => {
  expect(parseFillers("Режу {э-э} ролики")).toEqual([
    { t: "Режу", filler: false },
    { t: "э-э", filler: true },
    { t: "ролики", filler: false },
  ]);
});

test("timecode форматирует секунды как ММ:СС", () => {
  expect(timecode(0)).toBe("00:00");
  expect(timecode(91)).toBe("01:31");
});

test("stepAt делит прогресс на равные доли и не выходит за границы", () => {
  expect(stepAt(0, 4)).toBe(0);
  expect(stepAt(0.26, 4)).toBe(1);
  expect(stepAt(1, 4)).toBe(3);
  expect(stepAt(-1, 4)).toBe(0);
});

test("normalizeWork без видео даёт заглушку и формат 9:16", () => {
  expect(normalizeWork({ tag: "SHORTS", sub: "x" })).toEqual({ tag: "Shorts", sub: "x", video: "", poster: "", ratio: "9:16", hasVideo: false });
});

test("normalizeWork пишет YouTube правильно и видит видео", () => {
  const w = normalizeWork({ tag: "YOUTUBE", sub: "y", ratio: "16:9", video: "a.mp4" });
  expect(w.tag).toBe("YouTube");
  expect(w.ratio).toBe("16:9");
  expect(w.hasVideo).toBe(true);
});
