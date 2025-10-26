# 💰 DILFwallet - Крипто-портфолио трекер# 💰 DILFwallet - Крипто-портфолио трекер



Веб и мобильное приложение для отслеживания криптовалютного портфеля с реальными ценами, аналитикой P&L и историей транзакций.Веб и мобильное приложение для отслеживания криптовалютного портфеля с реальными ценами, аналитикой P&L и историей транзакций.



## 🚀 Быстрый старт## 🚀 Быстрый старт



### 1. Запуск PostgreSQL### Backend + Frontend запуск



```bash1. Запустите PostgreSQL:

docker-compose up -d```bash

```docker-compose up -d

```

### 2. Запуск Backend (FastAPI)

2. Запустите backend (в отдельном терминале):

```bash```bash

cd backendcd backend

python -m venv .venv && source .venv/bin/activate

# Создание виртуального окружения (если еще не создано)pip install -r requirements.txt

python -m venv ../.venvpython -m app.init_db

source ../.venv/bin/activate  # Linux/Macuvicorn app.main:app --reload --host 0.0.0.0 --port 8000

```

# Установка зависимостей

pip install -r requirements.txt3. Запустите frontend (в отдельном терминале):

```bash

# Создание таблиц в БДcd frontend

python -m app.init_dbnpm install

npm run dev

# Запуск сервера```

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

```4. Откройте http://localhost:3000 в браузере



Backend доступен: **http://localhost:8000**  ## 📚 Подробная документация

API документация: **http://localhost:8000/docs**

См. полную документацию в файле для инструкций по установке, настройке и использованию.

### 3. Запуск Frontend (Next.js)

## 🎯 Основное

Откройте новый терминал:

- ✅ Backend API (FastAPI) на http://localhost:8000

```bash- ✅ Веб-приложение (Next.js) на http://localhost:3000

cd frontend- ✅ PostgreSQL в Docker

- ✅ Реальные цены криптовалют (CoinGecko API)

# Установка зависимостей- ✅ JWT аутентификация

npm install

# Запуск dev-сервера
npm run dev
```

Веб-приложение: **http://localhost:3000**

## 🎯 Возможности

### ✅ Реализовано

- Регистрация и аутентификация (JWT)
- Добавление криптовалют в портфолио
- Получение цен в реальном времени (CoinGecko API)
- Расчет P&L (прибыль/убыток)
- Адаптивный веб-интерфейс
- REST API

### 🚧 В планах

- История транзакций
- Графики и аналитика
- Мобильное приложение (Expo)
- Push-уведомления

## 📚 API Endpoints

- `POST /register` - Регистрация
- `POST /login` - Вход (получение JWT токена)
- `GET /me` - Информация о пользователе
- `GET /portfolio` - Список активов
- `POST /portfolio` - Добавить актив
- `GET /portfolio/summary` - Сводка с P&L
- `GET /transactions` - История транзакций
- `POST /transactions` - Создать транзакцию

## 🔧 Переменные окружения

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dilfwallet
SECRET_KEY=dev-secret-key-change-in-production-12345678
COINGECKO_API_KEY=
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🗄️ Структура БД

- **users** - пользователи
- **portfolio** - активы портфеля
- **transactions** - история транзакций

## 📦 Стек технологий

- **Backend**: FastAPI, PostgreSQL, SQLAlchemy (async), JWT
- **Frontend**: Next.js 15, TypeScript, TailwindCSS, Axios
- **Mobile**: React Native, Expo (в разработке)
- **DevOps**: Docker, Docker Compose

## 👨‍💻 Разработка

```bash
# Backend тесты
cd backend && pytest

# Frontend тесты
cd frontend && npm test

# Проверка кода
cd backend && flake8
cd frontend && npm run lint
```

## 📄 Лицензия

MIT License - см. файл LICENSE

## 🙏 Благодарности

- [CoinGecko API](https://www.coingecko.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)

---

**Сделано с ❤️ для трекинга крипты**
