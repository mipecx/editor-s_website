# v5 «Кинозал за монтажным столом» — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переписать сайт монтажёра как одну «киноисторию», управляемую прокруткой, где каждый эффект понятен и ведёт к Telegram.

**Architecture:** Vite + ES-модули. `src/main.js` собирает страницу из сцен (`src/scenes/*.js`, у каждой `render(data) → string` и `init(root, ctx)`), общие сервисы в `src/lib/`. Анимации — GSAP ScrollTrigger поверх Lenis; Three.js лениво только для хлопушки. Весь контент — `src/data.js`.

**Tech Stack:** vite 8.3.1, gsap 3.15.0, lenis 1.3.26, three 0.186.1, vitest 5.0.2 + jsdom 30.1.1.

**Spec:** `docs/superpowers/specs/2026-10-13-v5-cinema-redesign-design.md`

## Global Constraints

- Править только ветку `v5`; другие ветки не трогать; `git push` — только с согласия владельца.
- Правило смысла: каждый эффект показывает работу монтажёра или ведёт к Telegram; каждый интерактивный элемент подписан видимым текстом.
- Палитра: фон `#0b0a09`, поверхность `#16140f`, текст `#f2ede4`, приглушённый `#9b958a`, акцент `#ff5a36`.
- Шрифты: `Cormorant Garamond` (заголовки), `Golos Text` (текст), `JetBrains Mono` (таймкоды/подписи дорожек).
- Весь сайт тёмный, без светлых секций.
- `prefers-reduced-motion: reduce` → без Lenis, без закреплений, конечные состояния сразу, без зерна.
- Анимации только `transform`/`opacity`/`clip-path`/`filter`; переходы 300–800 мс, без «прыгучих» кривых.
- Касание ≥ 44px; работает на 375px; без горизонтальной прокрутки страницы.
- Three.js не грузится до приближения к финалу; звук не создаёт AudioContext до выбора пользователя.
- `vite.config.js`: оставить `base: "./"` и `cssTarget` из v4.

## Review Focus

1. Работа без `video` в `data.js` → заглушка с подписью «Ролик скоро будет здесь», ни одного `<video>` без `src`. (Task 2: `normalizeWork`; Task 8: тест разметки.)
2. Reduced-motion → весь текст сцен виден сразу, заголовок открытия уже без паразитов. (Task 3: тест `motion.reduced`; Task 6: тест.)
3. Поворот телефона/ресайз посреди закреплённой сцены → `ScrollTrigger.refresh()` после ресайза и после `document.fonts.ready`. (Task 3.)
4. Только клавиатура: фокус на входе стоит на первой кнопке, Esc = «Без звука»; кинозал держит фокус и возвращает его на афишу. (Task 5, Task 8: тесты.)
5. Нет `AudioContext` / автоплей заблокирован → сайт работает молча, без исключений. (Task 4: тест.)

---

### Task 1: Каркас, зависимости, данные

**Files:**
- Delete: `app.js`, `styles.css`, `scenes.js`, `audio.js`, `montage.html`, `data.js` (корневые файлы v4)
- Modify: `package.json`, `index.html`, `.gitignore`
- Create: `src/data.js`, `src/main.js`, `src/lib/dom.js`, `src/styles/base.css`, `vitest.config.js`, `tests/dom.test.js`

**Interfaces:**
- Produces: `DATA` (default-shape объект, см. ниже) из `src/data.js`; `$(sel, root?)`, `$$(sel, root?) → Element[]`, `clamp(v, a=0, b=1)`, `esc(str) → string` (HTML-экранирование) из `src/lib/dom.js`; `SCENES` — массив модулей сцен в `src/main.js` (пока пустой).

- [ ] **Step 1:** `npm i gsap@3.15.0 lenis@1.3.26` и `npm i -D vitest@5.0.2 jsdom@30.1.1`; скрипт `"test": "vitest run"`. `vitest.config.js`: `environment: "jsdom"`.
- [ ] **Step 2: Failing test** `tests/dom.test.js`: `esc('<a href="x">&</a>') === '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;'`; `clamp(5) === 1`, `clamp(-1) === 0`, `clamp(3, 0, 10) === 3`.
- [ ] **Step 3:** Run `npm test` → FAIL (модуль не найден).
- [ ] **Step 4:** Реализовать `src/lib/dom.js`.
- [ ] **Step 5:** `src/data.js`: перенести тексты из v4 `data.js` (name, logo, telegram, hero, ba.points, works.items, pr.points/tracks, formats, proc, reviews, faq, contact.title/cta, footer). Убрать `boot`, `marquee`, `slot`, `snd.tip`, редакторские подсказки про перестановку. Добавить: `entry: { line, withSound: "Смотреть со звуком", noSound: "Без звука" }`, `scenes` — подписи для указателя (`["Вход","Открытие","До / После","Работы","Как я монтирую","Условия","Отзывы","Титры"]`), у каждой работы `video: "", poster: "", ratio: "9:16"|"16:9"`, `ba: { raw: "", fin: "" }` пути к видео, `version: "v5 · версия Claude"`. Подписи дорожек: `Видео`, `Текст`, `Звук`.
- [ ] **Step 6:** `index.html`: `lang="ru"`, мета description/theme-color `#0b0a09`, Google Fonts (Cormorant Garamond 500/600 + italic 500, Golos Text 400/500/600, JetBrains Mono 500), комментарий `<!-- v5: версия Claude (Anthropic) -->`, `<main id="film">`, `<script type="module" src="/src/main.js">`. `noscript`-текст оставить.
- [ ] **Step 7:** `src/styles/base.css`: токены палитры и шрифтов на `:root`, reset, `body` фон, `.wrap` (max-width 1200px, gutter 16px на ≤600px / 32px), `:focus-visible` кольцо цвета акцента, `.sr`, `.btn` (CTA акцентная, `min-height:44px`), `.btn.ghost`, кинозерно `#grain` (opacity .05, скрыто при reduced-motion).
- [ ] **Step 8:** `npm test` → PASS; `npm run build` → без ошибок.
- [ ] **Step 9:** Commit `v5: каркас, зависимости и данные`.

### Task 2: Чистая логика контента

**Files:** Create `src/lib/content.js`, `tests/content.test.js`

**Interfaces:**
- Produces: `parseFillers(raw: string) → {t: string, filler: boolean}[]` (слова в `{}` — паразиты); `timecode(sec: number) → "MM:SS"`; `stepAt(progress: number, n: number) → number` (индекс 0..n-1, равные доли, progress=1 → n-1); `normalizeWork(item) → {tag, sub, video, poster, ratio, hasVideo}` (ratio по умолчанию `"9:16"`, `hasVideo = Boolean(video)`).

- [ ] **Step 1: Failing tests:**
  - `parseFillers("Режу {э-э} ролики")` → `[{t:"Режу",filler:false},{t:"э-э",filler:true},{t:"ролики",filler:false}]`
  - `timecode(0) === "00:00"`, `timecode(91) === "01:31"`
  - `stepAt(0,4)===0`, `stepAt(0.26,4)===1`, `stepAt(1,4)===3`, `stepAt(-1,4)===0`
  - `normalizeWork({tag:"SHORTS",sub:"x"})` → `{ratio:"9:16", hasVideo:false, video:"", poster:""}` и `tag:"Shorts"`; `tag:"YOUTUBE"` → `"YouTube"`
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Реализовать.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `v5: логика контента`.

### Task 3: Движение и указатель сцен

**Files:** Create `src/lib/motion.js`, `src/lib/nav.js`, `src/styles/nav.css`, `tests/motion.test.js`

**Interfaces:**
- Produces: `motion` объект: `motion.reduced: boolean`; `motion.start()` (Lenis + `gsap.ticker`, связка `lenis.on("scroll", ScrollTrigger.update)`; при reduced — без Lenis); `motion.scrollTo(target)`; `motion.stop()/resume()` (для кинозала и входа); `motion.refresh()`. Регистрация `ScrollTrigger` один раз. Ресайз (debounce 200 мс) и `document.fonts.ready` → `ScrollTrigger.refresh()`.
- Produces: `initNav(sections: HTMLElement[], labels: string[])` — справа список кнопок-сцен (десктоп ≥ 900px), сверху полоса прогресса + имя текущей сцены в шапке (телефон); `aria-current="step"` у активной.
- Шапка (часть nav): лого/имя, кнопка «Звук» (`aria-pressed`, видимый текст «Звук вкл»/«Звук выкл»), CTA «Написать в Telegram».

- [ ] **Step 1: Failing test:** при `matchMedia('(prefers-reduced-motion: reduce)')` → `matches:true` (мок) `motion.reduced === true` и `motion.start()` не создаёт Lenis (`motion.lenis === null`).
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Commit `v5: движение и указатель сцен`.

### Task 4: Звук

**Files:** Create `src/lib/sound.js`, `tests/sound.test.js` (переиспользовать синтез из v4 `audio.js`)

**Interfaces:**
- Produces: `sound.enable()`, `sound.disable()`, `sound.on: boolean`, `sound.cut(pan?)`, `sound.scene()`, `sound.clap()`, `sound.hover()`; фоновый «тон зала» — низкий гул (две синусоиды ~55/110 Гц + отфильтрованный шум, громкость ≤ 0.04), fade 600 мс. `localStorage["v5-sound"] = "1"|"0"`. `visibilitychange` скрыто → master gain 0.

- [ ] **Step 1: Failing test:** без `window.AudioContext` вызовы `sound.enable(); sound.cut(); sound.clap()` не бросают, `sound.on` после `enable()` = true.
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Commit `v5: звук зала`.

### Task 5: Сцена 0 — вход в зал

**Files:** Create `src/scenes/entry.js`, `src/styles/entry.css`, `tests/entry.test.js`

**Interfaces:**
- Consumes: `motion.stop/resume`, `sound.enable/disable`.
- Produces: `render(D) → string` (оверлей `role="dialog" aria-modal="true" aria-labelledby`), `init(root, ctx) → Promise<void>` — резолвится после выбора.

Поведение: при открытии `motion.stop()`, фокус на «Смотреть со звуком»; если ранее выбор сохранён — выделена прошлая кнопка и фокус на ней. Esc = «Без звука». После выбора: свет «гаснет» (оверлей уходит в прозрачность 800 мс, появляется свечение экрана), `motion.resume()`. Reduced-motion: без анимации.

- [ ] **Step 1: Failing tests:** после `init` `document.activeElement` — кнопка со звуком; `keydown Escape` → промис резолвится, `sound.on === false`, оверлей `hidden`.
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Commit `v5: вход в зал`.

### Task 6: Сцена 1 — открытие

**Files:** Create `src/scenes/opening.js`, `src/styles/opening.css`, `tests/opening.test.js`

**Interfaces:** Consumes `parseFillers`, `motion`, `sound.cut`. Produces `render(D)`, `init(root, ctx)`.

Поведение: секция закреплена на ~120% высоты экрана; `h1` содержит слова, паразиты — `<s class="filler">`, `aria-label` у `h1` = чистый заголовок. Подпись «Листайте — уберу лишнее» над первым экраном. По прогрессу паразиты по очереди: акцентный цвет + зачёркивание → `max-width` до 0 и прозрачность (схлопывание), `sound.cut()` при каждом. В конце — лид и CTA.

- [ ] **Step 1: Failing test:** при `motion.reduced=true` после `init` все `.filler` имеют класс `gone`, лид и CTA видимы; `h1.getAttribute("aria-label")` равен заголовку без паразитов.
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Commit `v5: сцена открытия`.

### Task 7: Сцена 2 — до / после

**Files:** Create `src/scenes/beforeAfter.js`, `src/styles/beforeAfter.css`, `tests/beforeAfter.test.js`

**Interfaces:** Consumes `stepAt`, `motion`, `sound.cut`. Produces `render(D)`, `init(root, ctx)`.

Поведение: экран 9:16 (заглушка-кадр: силуэт, волна из 40 столбиков с двумя провалами, субтитр). Закрепление на 4 шага; `stepAt` выбирает активный пункт списка (`aria-current`). Шаг 1 — провалы волны смыкаются; 2 — появляются субтитры, акцентное слово; 3 — `filter: grayscale(1) → 0`, свечение холодное → тёплое; 4 — подпись «Первые 3 секунды» и кадр-крючок. После последнего шага появляется шторка с ручкой (`role="slider"`, ←/→ шаг 5%) и подписью «Потяните, чтобы сравнить». Если `D.ba.raw && D.ba.fin` — два `<video muted playsinline loop>` вместо заглушек, синхронное воспроизведение.

- [ ] **Step 1: Failing tests:** ручка `role="slider"` с `aria-valuenow="50"`; `ArrowRight` → `55`; без `D.ba.raw` в секции нет `<video>`.
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Commit `v5: до и после`.

### Task 8: Сцена 3 — работы и кинозал

**Files:** Create `src/scenes/works.js`, `src/lib/theater.js`, `src/styles/works.css`, `tests/works.test.js`

**Interfaces:**
- Consumes: `normalizeWork`, `motion.stop/resume`, `sound.scene`.
- Produces: `openTheater(work, fromEl)`, `closeTheater()` из `theater.js`; сцена `render(D)`, `init(root, ctx)`.

Поведение: горизонтальная лента афиш, движется вертикальной прокруткой (pin + `x` трансляция). Подпись «Нажмите на ролик, чтобы смотреть». Афиша — `<button>` с тегом и описанием; без видео — заглушка с текстом «Ролик скоро будет здесь». Кинозал: `role="dialog"`, затемнение, раскрытие из позиции афиши (FLIP), видео со звуком (если есть), × и Esc закрывают, Tab зациклен внутри, фокус возвращается на афишу. Reduced-motion: лента — обычная сетка без закрепления.

- [ ] **Step 1: Failing tests:** работа без `video` → в разметке нет `<video>`, есть текст «Ролик скоро будет здесь»; `openTheater` → фокус на кнопке закрытия; `Escape` → диалог `hidden`, фокус на исходной афише.
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Commit `v5: работы и кинозал`.

### Task 9: Сцена 4 — как я монтирую

**Files:** Create `src/scenes/editing.js`, `src/styles/editing.css`, `tests/editing.test.js`

**Interfaces:** Consumes `timecode`, `stepAt`, `motion`. Produces `render(D)`, `init(root, ctx)`.

Поведение: таймлайн из трёх дорожек `Видео / Текст / Звук` (клипы шириной по `len`), только просмотр. Закрепление; плейхед едет по прогрессу, таймкод `MM:SS` рядом. Три метки из `D.pr.points`; когда плейхед проходит метку — крупный принцип (`h3`) и пояснение сменяются (crossfade). Клип под плейхедом подсвечен.

- [ ] **Step 1: Failing test:** при reduced все три принципа в DOM видимы списком; в разметке нет `draggable` и нет кнопок «Играть/Как было».
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Commit `v5: как я монтирую`.

### Task 10: Сцены 5–6 — условия, отзывы, вопросы

**Files:** Create `src/scenes/services.js`, `src/scenes/voices.js`, `src/styles/services.css`, `src/styles/voices.css`, `tests/voices.test.js`

**Interfaces:** Produces `render(D)`, `init(root, ctx)` для обеих.

Поведение: форматы — 3 карточки с SVG-пиктограммами (кадр 9:16, кадр 16:9, календарь), появление по прокрутке. Шаги — 4 пункта, вертикальная линия заполняется по `scrub`. Отзывы — карточки с пометкой «временный отзыв» пока текст — заглушка (поле `draft: true` в данных). Вопросы — `<details>/<summary>` с плавным раскрытием.

- [ ] **Step 1: Failing test:** число `<details>` = `D.faq.items.length`; у отзыва с `draft:true` есть видимая метка «временный отзыв».
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Commit `v5: условия, отзывы, вопросы`.

### Task 11: Сцена 7 — титры и хлопушка

**Files:** Create `src/scenes/finale.js`, `src/scenes/clapper3d.js` (перенос `clap` из v4 `scenes.js`, палитра v5), `src/styles/finale.css`

**Interfaces:** Consumes `sound.clap`, `motion`. Produces `render(D)`, `init(root, ctx)`; `clapper3d.mount(host, labels) → {clap()}`.

Поведение: «титры» прокручиваются вверх (Монтаж — ИМЯ, Звук — ИМЯ, Цвет — ИМЯ), затем крупно «Напишите в Telegram» и CTA. Хлопушка грузится `import()` при `rootMargin: 600px`; наведение/фокус/нажатие на CTA → хлопок (`sound.clap()`), подпись под хлопушкой «Мотор!». Без WebGL — статичная SVG-хлопушка. Подвал: имя, Telegram, `D.version`.

- [ ] **Step 1:** Реализовать; `npm run build` → проверить, что `three` в отдельном чанке (в `dist/assets` есть отдельный файл, в главном чанке нет `WebGLRenderer`).
- [ ] **Step 2:** Commit `v5: финальные титры и хлопушка`.

### Task 12: Сборка, проверка, доступность

**Files:** Modify по результатам.

- [ ] **Step 1:** `npm test` → все PASS; `npm run build` → без ошибок и предупреждений о размере кроме three-чанка.
- [ ] **Step 2:** Браузер 1440×900: пройти все сцены, скриншоты, консоль без ошибок.
- [ ] **Step 3:** Браузер 375×812: нет горизонтальной прокрутки (`document.documentElement.scrollWidth <= innerWidth`), все сцены читаются.
- [ ] **Step 4:** Reduced-motion: все тексты видны, нет закреплений.
- [ ] **Step 5:** Клавиатура: Tab проходит вход → шапка → сцены → кинозал → CTA; видимый фокус везде.
- [ ] **Step 6:** Аудит доступности (контраст AA для `#9b958a` на `#0b0a09` и т. п.), исправить найденное.
- [ ] **Step 7:** Commit `v5: проверка и правки`.
