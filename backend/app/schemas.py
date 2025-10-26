from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from decimal import Decimal



class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    symbol: str
    amount: float
    purchase_price: float

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioRead(PortfolioBase):
    id: int

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    coin: str
    quantity: Decimal
    price: Decimal
    type: str  # "buy" или "sell"

class TransactionCreate(TransactionBase):
    portfolio_entry_id: Optional[int] = None

class TransactionRead(TransactionBase):
    id: UUID
    date: datetime
    portfolio_entry_id: Optional[int] = None

    class Config:
        from_attributes = True

class PortfolioItemSummary(BaseModel):
    symbol: str
    amount: float
    purchase_price: float
    current_price: Optional[float] = None
    total_value: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_percentage: Optional[float] = None

class PortfolioSummary(BaseModel):
    items: List[PortfolioItemSummary]
    total_invested: float
    total_current_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float