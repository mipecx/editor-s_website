/* v5 — сборка «фильма»: сцены по порядку, затем их оживление. */
import "./styles/base.css";
import { DATA as D } from "./data.js";
import { $ } from "./lib/dom.js";

/* у каждой сцены: render(D) → html и init(root, ctx) */
const SCENES = [];

$("#film").innerHTML = SCENES.map((s) => s.render(D)).join("");
const grain = document.createElement("div");
grain.id = "grain"; grain.setAttribute("aria-hidden", "true");
document.body.appendChild(grain);
