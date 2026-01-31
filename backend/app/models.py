from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Enum, Integer, Float, TypeDecorator, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

Base = declarative_base()

# Custom UUID type that works with both PostgreSQL and SQLite
class GUID(TypeDecorator):
    """Platform-independent GUID type."""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if isinstance(value, uuid.UUID):
                return str(value)
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value
        return value


# ========== Enums ==========

class TransactionType(enum.Enum):
    buy = "buy"
    sell = "sell"

class PortfolioType(enum.Enum):
    crypto = "crypto"
    stocks = "stocks"
    etf = "etf"
    metals = "metals"

class BudgetType(enum.Enum):
    income = "income"
    expense = "expense"


# ========== User ==========

class User(Base):
    __tablename__ = "users"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    portfolios = relationship("Portfolio", back_populates="owner", cascade="all, delete-orphan")
    budget_categories = relationship("BudgetCategory", back_populates="owner", cascade="all, delete-orphan")
    budget_transactions = relationship("BudgetTransaction", back_populates="owner", cascade="all, delete-orphan")


# ========== Portfolio System ==========

class Portfolio(Base):
    """User's portfolio (can have multiple)"""
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(Enum(PortfolioType), nullable=False, default=PortfolioType.crypto)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="portfolios")
    entries = relationship("PortfolioEntry", back_populates="portfolio", cascade="all, delete-orphan")


class PortfolioEntry(Base):
    """Asset entry within a portfolio"""
    __tablename__ = "portfolio_entries"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    symbol = Column(String(20), index=True, nullable=False)
    amount = Column(Float, default=0)
    purchase_price = Column(Float, default=0)

    portfolio = relationship("Portfolio", back_populates="entries")
    transactions = relationship("Transaction", back_populates="portfolio_entry", cascade="all, delete-orphan")


class Transaction(Base):
    """Buy/Sell transaction for portfolio entry"""
    __tablename__ = "transactions"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    portfolio_entry_id = Column(Integer, ForeignKey("portfolio_entries.id"), nullable=False)
    symbol = Column(String(20))
    quantity = Column(Numeric)
    price = Column(Numeric)
    type = Column(Enum(TransactionType))
    date = Column(DateTime, default=datetime.utcnow)
    
    portfolio_entry = relationship("PortfolioEntry", back_populates="transactions")


# ========== Budget System ==========

class BudgetCategory(Base):
    """Category for budget (income or expense)"""
    __tablename__ = "budget_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(Enum(BudgetType), nullable=False)
    icon = Column(String(10), default="💰")  # Emoji icon
    
    owner = relationship("User", back_populates="budget_categories")
    transactions = relationship("BudgetTransaction", back_populates="category", cascade="all, delete-orphan")


class BudgetTransaction(Base):
    """Income or expense transaction"""
    __tablename__ = "budget_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("budget_categories.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, default="")
    date = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="budget_transactions")
    category = relationship("BudgetCategory", back_populates="transactions")


# ========== Default Categories ==========

DEFAULT_BUDGET_CATEGORIES = [
    # Income
    {"name": "Зарплата", "type": "income", "icon": "💵"},
    {"name": "Фриланс", "type": "income", "icon": "💻"},
    {"name": "Инвестиции", "type": "income", "icon": "📈"},
    {"name": "Подарки", "type": "income", "icon": "🎁"},
    {"name": "Другой доход", "type": "income", "icon": "💰"},
    # Expenses
    {"name": "Продукты", "type": "expense", "icon": "🛒"},
    {"name": "Транспорт", "type": "expense", "icon": "🚗"},
    {"name": "Развлечения", "type": "expense", "icon": "🎮"},
    {"name": "Рестораны", "type": "expense", "icon": "🍔"},
    {"name": "Здоровье", "type": "expense", "icon": "💊"},
    {"name": "Одежда", "type": "expense", "icon": "👕"},
    {"name": "Онлайн покупки", "type": "expense", "icon": "📦"},
    {"name": "Коммуналка", "type": "expense", "icon": "🏠"},
    {"name": "Подписки", "type": "expense", "icon": "📱"},
    {"name": "Другие расходы", "type": "expense", "icon": "💸"},
]
