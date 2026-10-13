/* v5 — сборка «фильма»: сцены по порядку, затем их оживление. */
import "./styles/base.css";
import "./styles/nav.css";
import { DATA as D } from "./data.js";
import { $, $$ } from "./lib/dom.js";
import { motion } from "./lib/motion.js";
import { renderHeader, initNav } from "./lib/nav.js";
import { sound } from "./lib/sound.js";

/* у каждой сцены: id, render(D) → html, init(root, ctx) */
const SCENES = [];

$("#top").innerHTML = renderHeader(D);
$("#film").innerHTML = SCENES.map((s) => s.render(D)).join("");
const grain = document.createElement("div");
grain.id = "grain"; grain.setAttribute("aria-hidden", "true");
document.body.appendChild(grain);

/* кнопка звука в шапке */
const snd = $("#snd");
const syncSound = () => { snd.setAttribute("aria-pressed", String(sound.on)); $(".sndt", snd).textContent = sound.on ? D.sound.on : D.sound.off; };
snd.addEventListener("click", () => { sound.on ? sound.disable() : sound.enable(); syncSound(); });

const ctx = { D, motion, sound, syncSound };
motion.start();
SCENES.forEach((s) => s.init(document.getElementById(s.id), ctx));
const named = $$("#film > section[data-scene]");
if (named.length) initNav(named, D.scenes);
