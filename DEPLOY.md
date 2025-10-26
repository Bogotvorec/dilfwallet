# Деплой (бесплатные варианты)

Ниже — проверенная схема без затрат: фронтенд на бесплатном Vercel, бэкенд на Fly.io/Koyeb (free tier), база — на Neon (бесплатный PostgreSQL).

Важно: бесплатные лимиты у провайдеров могут меняться, но на момент подготовки инструкции они доступны для пет‑проектов.

---

## 1) База данных: Neon (free)

1. Создайте аккаунт: https://neon.tech
2. Create Project → выберите Postgres версию по умолчанию.
3. В разделе Connection strings скопируйте стандартную строку в формате `postgres://user:pass@host/db`.
4. В бэкенде используйте переменную окружения `DATABASE_URL` с этой строкой. Наш код автоматически конвертирует её в async‑формат.

Дополнительно:
- Рекомендуется включить connection pooling (pgbouncer) в настройках проекта Neon.

---

## 2) Бэкенд: FastAPI → Fly.io (free) [вариант А]

Под капотом используется Dockerfile (`backend/Dockerfile`).

Шаги:
1. Установите CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Войдите: `fly auth login`
3. В каталоге `backend/` выполните:
   - `fly launch` → следуйте подсказкам, подтвердите использование Dockerfile.
   - Если спросит HTTP порт — укажите 8080 (мы экспортируем `PORT`, по умолчанию 8080).
4. Настройте секреты (переменные окружения):
   - `fly secrets set DATABASE_URL="<строка из Neon>"`
   - `fly secrets set SECRET_KEY="<случайный_длинный_ключ>"`
   - `fly secrets set ALLOWED_ORIGINS="https://<your-frontend>.vercel.app,https://<ваш-домен>"`
5. Задеплойте: `fly deploy`
6. Получите URL приложения (например, `https://<app-name>.fly.dev`).

Проверка:
- `GET /` должен вернуть `{ "message": "DILFwallet backend running!" }`.

Альтернатива: Koyeb (free) — создайте Service из этого репо, укажите путь `backend/`, выберите Dockerfile, задайте PORT=8080 и те же переменные окружения.

---

## 3) Фронтенд: Next.js → Vercel (free)

1. Зайдите в https://vercel.com и подключите свой GitHub‑репозиторий.
2. Выберите проект `frontend/` (Vercel сам определит Next.js).
3. В настройках проекта Vercel задайте переменные окружения:
   - `NEXT_PUBLIC_API_URL=https://<ваш-бэкенд-домен>` (из Fly.io/Koyeb)
4. Запустите деплой. Итоговый домен будет вида `https://<project>.vercel.app`.
5. Если есть свой домен — привяжите его в Vercel (бесплатно для 1 домена).

---

## 4) CORS и переменные окружения

- Бэкенд читает `ALLOWED_ORIGINS` (список доменов через запятую) и добавляет их в CORS.
- Пример: `https://your-frontend.vercel.app,https://your-project.web.app`.
- Для локальной разработки CORS уже разрешает `http://localhost:3000`.

Файлы с примерами:
- `backend/.env.example` — бэкенд (DATABASE_URL, SECRET_KEY, ALLOWED_ORIGINS)
- `frontend/.env.production.example` — фронтенд (NEXT_PUBLIC_API_URL)

---

## 5) Быстрая проверка локально (без деплоя)

- Запустите Postgres через Docker (или локальный), задайте `DATABASE_URL`.
- Бэкенд: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Фронтенд: `npm run dev` в `frontend/` (мы уже настроили `-H 0.0.0.0 -p 3000`).
- Откройте `http://localhost:3000/register`.

---

## 6) Частые вопросы

- Почему не Render? — Когда бесплатные планы меняются, проще опираться на Fly.io/Koyeb + Neon: они как правило дают достаточно для демо/пет‑проектов. Но вы можете использовать любой другой провайдер — сервису всё равно, лишь бы был доступен `DATABASE_URL` и корректно настроен CORS.
- Можно ли на Firebase Hosting? — Да, фронтенд можно на Firebase Hosting (free). Тогда в `ALLOWED_ORIGINS` добавьте домены `*.web.app`/`*.firebaseapp.com` вашего проекта. Для бэкенда всё равно нужен отдельный хостинг (Fly/Koyeb и т.д.).
- Можно ли на Vercel/Netlify только фронт, а бэк оставить в Codespaces? — Теоретически да, но Codespaces — dev‑среда, туннели могут отваливаться. Надёжнее — вынести бэк на хостинг.
