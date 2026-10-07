import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  /* не переводить @media (max-width: …) в новый синтаксис (width<=…) —
     старые браузеры на телефонах его не понимают и мобильные стили отваливаются */
  build: { cssTarget: ["chrome80", "safari13", "firefox78"] },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});
