import { test, expect } from "vitest";
import { esc, clamp } from "../src/lib/dom.js";

test("esc экранирует HTML-спецсимволы", () => {
  expect(esc('<a href="x">&</a>')).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
});

test("clamp ограничивает значение диапазоном", () => {
  expect(clamp(5)).toBe(1);
  expect(clamp(-1)).toBe(0);
  expect(clamp(3, 0, 10)).toBe(3);
});
