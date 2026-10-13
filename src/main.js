/* v5 — сборка «фильма»: сцены по порядку, затем их оживление. */
import "./styles/base.css";
import "./styles/nav.css";
import { DATA as D } from "./data.js";
import { $, $$ } from "./lib/dom.js";
import { motion } from "./lib/motion.js";
import { renderHeader, initNav } from "./lib/nav.js";

/* у каждой сцены: id, render(D) → html, init(root, ctx) */
const SCENES = [];

$("#top").innerHTML = renderHeader(D);
$("#film").innerHTML = SCENES.map((s) => s.render(D)).join("");
const grain = document.createElement("div");
grain.id = "grain"; grain.setAttribute("aria-hidden", "true");
document.body.appendChild(grain);

const ctx = { D, motion };
motion.start();
SCENES.forEach((s) => s.init(document.getElementById(s.id), ctx));
const named = $$("#film > section[data-scene]");
if (named.length) initNav(named, D.scenes);
