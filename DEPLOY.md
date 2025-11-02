# 🚀 Деплой DILF Wallet на хостинг

## ⚠️ ВАЖНО: Render.com требует привязку карты

Если не хотите привязывать карту, используйте **Railway.app** (см. [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md))

---

## Архитектура

- **Frontend (Next.js)**: Vercel (бесплатно, лучший для Next.js)
- **Backend (FastAPI)**: Render.com (бесплатный тариф, но требует карту)
- **База данных**: PostgreSQL на Render.com (бесплатно)

---

## 📋 Шаг 1: Деплой Backend на Render.com

### 1.1 Создайте аккаунт на Render.com
- Перейдите на https://render.com
- Зарегистрируйтесь через GitHub

### 1.2 Подключите репозиторий
1. В Dashboard Render нажмите **"New +"** → **"Blueprint"**
2. Подключите ваш GitHub репозиторий `dilfwallet`
3. Render автоматически найдёт `render.yaml` и развернёт всё

### 1.3 Или создайте вручную:

#### А) Создайте PostgreSQL Database:
1. **New +** → **PostgreSQL**
2. Name: `dilfwallet-db`
3. Plan: **Free**
4. Нажмите **Create Database**

#### Б) Создайте Web Service:
1. **New +** → **Web Service**
2. Подключите GitHub репозиторий
3. Настройки:
   - **Name**: `dilfwallet-backend`
   - **Environment**: **Python 3**
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   
4. **Environment Variables**:
   ```
   DATABASE_URL = <скопируйте из вашей PostgreSQL базы>
   SECRET_KEY = <сгенерируйте случайный ключ, например через: openssl rand -hex 32>
   ALLOWED_ORIGINS = https://your-domain.com,https://your-app.vercel.app
   ```

5. Нажмите **Create Web Service**

### 1.4 Инициализируйте базу данных
После деплоя backend:
1. Откройте ваш backend URL (например: `https://dilfwallet-backend.onrender.com`)
2. В Render Dashboard найдите ваш сервис → **Shell**
3. Выполните:
   ```bash
   python -c "from app.init_db import init_models; import asyncio; asyncio.run(init_models())"
   ```

---

## 📋 Шаг 2: Деплой Frontend на Vercel

### 2.1 Создайте аккаунт на Vercel
- Перейдите на https://vercel.com
- Зарегистрируйтесь через GitHub

### 2.2 Подключите репозиторий
1. В Dashboard нажмите **"Add New..."** → **"Project"**
2. Выберите репозиторий `dilfwallet`
3. Настройки:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `.next`

### 2.3 Environment Variables
Добавьте переменные окружения:
```
NEXT_PUBLIC_API_BASE_URL = https://your-backend.onrender.com
```

Нажмите **Deploy**

---

## 📋 Шаг 3: Подключение домена

### 3.1 Подключите домен к Vercel (Frontend)
1. В проекте Vercel: **Settings** → **Domains**
2. Добавьте ваш домен (например: `dilfwallet.com`)
3. Следуйте инструкциям для настройки DNS

### 3.2 Подключите домен к Render (Backend)
1. В Render Dashboard: ваш Web Service → **Settings** → **Custom Domain**
2. Добавьте поддомен (например: `api.dilfwallet.com`)
3. Обновите CORS в `backend/app/main.py`:
   ```python
   ALLOWED_ORIGINS = https://dilfwallet.com,https://api.dilfwallet.com
   ```

### 3.3 Обновите переменные окружения
- В Vercel: `NEXT_PUBLIC_API_BASE_URL = https://api.dilfwallet.com`
- В Render: `ALLOWED_ORIGINS = https://dilfwallet.com`

---

## ✅ Проверка

1. **Backend**: Откройте `https://api.dilfwallet.com` → должно быть `{"message": "DILFwallet backend running!"}`
2. **Frontend**: Откройте `https://dilfwallet.com` → должен загрузиться интерфейс
3. **Регистрация**: Попробуйте зарегистрироваться через фронт

---

## 🔧 Локальная разработка

Для локальной разработки используйте SQLite (не требует PostgreSQL):

```bash
cd backend
# Не устанавливайте DATABASE_URL - будет использован SQLite
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

База данных создастся автоматически как `backend/dilfwallet.db`

---

## 📝 Примечания

- **Render.com Free tier**: сервисы "засыпают" после 15 минут бездействия. Первый запрос может занять 30-60 секунд.
- **Vercel**: бесплатный тариф отлично подходит для Next.js
- **PostgreSQL на Render**: бесплатно, но ограничен до 90 дней (можно продлить)

---

## 🆘 Проблемы?

1. **Backend не запускается**: Проверьте логи в Render Dashboard
2. **CORS ошибки**: Убедитесь что `ALLOWED_ORIGINS` содержит ваш фронтенд домен
3. **База данных не работает**: Проверьте `DATABASE_URL` и инициализацию таблиц
