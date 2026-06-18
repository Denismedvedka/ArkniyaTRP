# Блаженная Аркнийская Империя

Текстовая RPG с ИИ-Мастером (Claude). React + Vite. Разворачивается как статический сайт на GitHub Pages.

## Как запустить локально

```bash
npm install
npm run dev
```

Открой адрес, который покажет Vite (обычно http://localhost:5173).

## Как выложить на GitHub Pages

### Способ 1 — автодеплой через GitHub Actions (рекомендуется)

1. Создай репозиторий на GitHub. **Назови его `arkniya-ttrpg`** (или любым именем — но тогда поменяй `base` в `vite.config.js` на `"/твоё-имя-репозитория/"`).
2. Залей в него этот проект:
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/ТВОЙ_ЛОГИН/arkniya-ttrpg.git
   git push -u origin main
   ```
3. На GitHub зайди в **Settings → Pages**. В разделе **Build and deployment** выбери источник **GitHub Actions**.
4. Каждый `git push` в ветку `main` автоматически пересобирает и публикует сайт.
5. Адрес сайта: `https://ТВОЙ_ЛОГИН.github.io/arkniya-ttrpg/`

### Способ 2 — вручную через gh-pages

```bash
npm install
npm run build
npm run deploy
```

Потом в **Settings → Pages** выбери ветку `gh-pages`.

## API-ключ

Игра обращается к Claude напрямую из браузера. Чтобы она работала:

1. Получи ключ на https://console.anthropic.com (раздел API Keys).
2. На сайте нажми кнопку **⚿** внизу справа и вставь ключ (начинается с `sk-ant-`).
3. Ключ хранится только в твоём браузере (localStorage), на сервер никуда не уходит — только напрямую в Anthropic.

**Важно:** каждый игрок вводит свой ключ сам. Не вписывай свой ключ в код и не коммить его в публичный репозиторий — его украдут.

## Консоль создателя

Кнопка **⚙** внизу справа, пароль — `Дионис`. Даёт slash-команды (`/help`) и свободные директивы ГМ-миру.
