# 💰 DILFwallet

Multi-portfolio asset tracker with budget management. Track crypto, stocks, ETFs, and precious metals — all in one place.

**Live:** [dilfwallet.vercel.app](https://dilfwallet.vercel.app) | **API:** [dilfwallet.onrender.com](https://dilfwallet.onrender.com)

---

## ✨ Features

- **Multi-Portfolio** — Separate portfolios for crypto, stocks, ETF, metals
- **Real-Time Prices** — CoinGecko (crypto), Yahoo Finance (stocks/ETF/metals)
- **Budget Tracking** — Income/expense categories, charts, CSV/JSON export
- **Secure Auth** — JWT access + refresh tokens, bcrypt hashing, rate limiting
- **Production Ready** — PostgreSQL, Alembic migrations, structured logging, CI/CD

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js, TypeScript, Recharts |
| **Backend** | FastAPI, SQLAlchemy (async), Pydantic |
| **Database** | PostgreSQL (prod) / SQLite (dev) |
| **Auth** | JWT (access + refresh), bcrypt, slowapi |
| **Deploy** | Vercel (frontend) + Render (backend) |
| **CI** | GitHub Actions |

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd backend
python -m venv .venv
.venv/Scripts/activate     # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
API available at `http://localhost:8000` | Docs at `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at `http://localhost:3000`

### Environment Variables

**Backend** (`backend/.env`):
```env
SECRET_KEY=your-secret-key-here     # Required in production
DATABASE_URL=postgresql+asyncpg://user:pass@host/db  # Optional, defaults to SQLite
REDIS_URL=redis://localhost:6379    # Optional, enables Redis cache
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 📡 API Endpoints

### Auth
| Method | Endpoint | Rate Limit | Description |
|--------|----------|-----------|-------------|
| POST | `/register` | 3/min | Create account |
| POST | `/login` | 5/min | Get access + refresh tokens |
| POST | `/refresh` | 10/min | Exchange refresh → new access token |
| GET | `/me` | — | Current user info |

### Portfolios
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/portfolios` | List all portfolios |
| POST | `/portfolios` | Create portfolio |
| DELETE | `/portfolios/{id}` | Delete portfolio |
| GET | `/portfolios/{id}/summary` | Portfolio with P&L |
| POST | `/portfolios/{id}/entries` | Add asset entry |
| POST | `/portfolios/{id}/transactions` | Record transaction |
| GET | `/portfolios/{id}/export/csv` | Export as CSV |

### Budget
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/budget/categories` | List categories |
| POST | `/budget/categories` | Create category |
| GET | `/budget/transactions` | List transactions |
| POST | `/budget/transactions` | Add transaction |
| GET | `/budget/summary?period=month` | Summary with totals |
| GET | `/budget/chart-data?period=month` | Chart data |
| GET | `/budget/export/csv?period=month` | Export as CSV |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check (DB status) |

## 🧪 Testing

```bash
cd backend
pip install pytest pytest-asyncio httpx
python -m pytest tests/ -v
```

**40 tests** covering auth, portfolios, price service, and health checks.

## 🚢 Deployment

### Render (Backend)
1. Connect GitHub repo
2. **Build:** `cd backend && pip install -r requirements.txt`
3. **Start:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set env vars: `SECRET_KEY`, `DATABASE_URL` (from Render PostgreSQL)

### Vercel (Frontend)
1. Connect GitHub repo, set root to `frontend`
2. Set `NEXT_PUBLIC_API_BASE_URL` to your Render URL

## 📄 License

MIT
