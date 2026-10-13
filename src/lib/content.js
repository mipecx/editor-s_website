/* Чистая логика контента: без DOM, покрыта тестами. */
import { clamp } from "./dom.js";

/* "Режу {э-э} ролики" → слова, паразиты помечены filler: true */
export const parseFillers = (raw) =>
  raw.trim().split(/\s+/).map((w) => (/^\{.*\}$/.test(w) ? { t: w.slice(1, -1), filler: true } : { t: w, filler: false }));

const pad = (n) => String(n).padStart(2, "0");
export const timecode = (sec) => `${pad(Math.floor(sec / 60))}:${pad(Math.floor(sec % 60))}`;

/* прогресс 0..1 → номер шага 0..n-1 */
export const stepAt = (progress, n) => Math.min(n - 1, Math.floor(clamp(progress) * n));

const TAGS = { YOUTUBE: "YouTube", TIKTOK: "TikTok" };
const tagName = (t = "") => TAGS[t] || t.charAt(0) + t.slice(1).toLowerCase();

export const normalizeWork = (it) => ({
  tag: tagName(it.tag),
  sub: it.sub || "",
  video: it.video || "",
  poster: it.poster || "",
  ratio: it.ratio === "16:9" ? "16:9" : "9:16",
  hasVideo: Boolean(it.video),
});
