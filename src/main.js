/* v5 — сборка «фильма»: сцены по порядку, затем их оживление. */
import "./styles/base.css";
import "./styles/nav.css";
import "./styles/entry.css";
import "./styles/opening.css";
import "./styles/beforeAfter.css";
import "./styles/works.css";
import "./styles/editing.css";
import "./styles/services.css";
import "./styles/voices.css";
import "./styles/finale.css";
import { DATA as D } from "./data.js";
import { $, $$ } from "./lib/dom.js";
import { motion } from "./lib/motion.js";
import { renderHeader, initNav } from "./lib/nav.js";
import { sound } from "./lib/sound.js";
import * as entry from "./scenes/entry.js";
import * as opening from "./scenes/opening.js";
import * as beforeAfter from "./scenes/beforeAfter.js";
import * as works from "./scenes/works.js";
import * as editing from "./scenes/editing.js";
import * as services from "./scenes/services.js";
import * as voices from "./scenes/voices.js";
import * as finale from "./scenes/finale.js";

/* у каждой сцены: id, render(D) → html, init(root, ctx) */
const SCENES = [opening, beforeAfter, works, editing, services, voices, finale];

$("#top").innerHTML = renderHeader(D);
$("#film").innerHTML = SCENES.map((s) => s.render(D)).join("");
$("#foot").innerHTML = finale.renderFooter(D);
const grain = document.createElement("div");
grain.id = "grain"; grain.setAttribute("aria-hidden", "true");
document.body.appendChild(grain);

/* кнопка звука в шапке */
const snd = $("#snd");
const syncSound = () => { snd.setAttribute("aria-pressed", String(sound.on)); $(".sndt", snd).textContent = sound.on ? D.sound.on : D.sound.off; };
snd.addEventListener("click", () => { sound.on ? sound.disable() : sound.enable(); syncSound(); });

const ctx = { D, motion, sound, syncSound };
document.body.insertAdjacentHTML("afterbegin", entry.render(D));
motion.start();
entry.init($("#entry"), ctx);
SCENES.forEach((s) => s.init(document.getElementById(s.id), ctx));
const named = $$("#film section[data-scene]");
if (named.length) initNav(named, D.scenes);
