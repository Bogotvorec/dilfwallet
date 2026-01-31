from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from decimal import Decimal


# ========== User Schemas ==========

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


# ========== Portfolio Schemas ==========

class PortfolioCreate(BaseModel):
    name: str
    type: str = "crypto"  # crypto, stocks, etf, metals

class PortfolioRead(BaseModel):
    id: int
    name: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True


# ========== Portfolio Entry Schemas ==========

class PortfolioEntryBase(BaseModel):
    symbol: str
    amount: float
    purchase_price: float

class PortfolioEntryCreate(PortfolioEntryBase):
    pass

class PortfolioEntryRead(PortfolioEntryBase):
    id: int
    portfolio_id: int

    class Config:
        from_attributes = True


# ========== Transaction Schemas ==========

class TransactionBase(BaseModel):
    symbol: str
    quantity: Decimal
    price: Decimal
    type: str  # "buy" or "sell"

class TransactionCreate(TransactionBase):
    portfolio_entry_id: Optional[int] = None

class TransactionRead(TransactionBase):
    id: UUID
    date: datetime
    portfolio_entry_id: Optional[int] = None

    class Config:
        from_attributes = True


# ========== Portfolio Summary Schemas ==========

class TransactionWithPL(BaseModel):
    id: UUID
    date: datetime
    type: str
    quantity: float
    price: float
    current_price: Optional[float] = None
    invested: float
    current_value: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_percentage: Optional[float] = None
    
    class Config:
        from_attributes = True

class PortfolioItemSummary(BaseModel):
    symbol: str
    amount: float
    avg_purchase_price: float
    current_price: Optional[float] = None
    total_value: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_percentage: Optional[float] = None
    transactions: List[TransactionWithPL] = []

class PortfolioSummary(BaseModel):
    portfolio: PortfolioRead
    items: List[PortfolioItemSummary]
    total_invested: float
    total_current_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float


# ========== Budget Schemas ==========

class BudgetCategoryCreate(BaseModel):
    name: str
    type: str  # "income" or "expense"
    icon: str = "💰"

class BudgetCategoryRead(BaseModel):
    id: int
    name: str
    type: str
    icon: str

    class Config:
        from_attributes = True

class BudgetTransactionCreate(BaseModel):
    category_id: int
    amount: float
    description: str = ""
    date: Optional[datetime] = None

class BudgetTransactionRead(BaseModel):
    id: int
    category_id: int
    amount: float
    description: str
    date: datetime
    category: Optional[BudgetCategoryRead] = None

    class Config:
        from_attributes = True

class BudgetSummary(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    transactions: List[BudgetTransactionRead]
    categories: List[BudgetCategoryRead]


# ========== Chart Data Schemas ==========

class CategoryChartData(BaseModel):
    category: str
    total: float
    icon: str

class DailyTotals(BaseModel):
    date: str
    income: float
    expense: float
    balance: float

class BudgetChartData(BaseModel):
    expense_by_category: List[CategoryChartData]
    income_by_category: List[CategoryChartData]
    daily_totals: List[DailyTotals]
    total_income: float
    total_expense: float