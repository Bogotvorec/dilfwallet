from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import List



class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

    class Config:
        orm_mode = True

class PortfolioBase(BaseModel):
    symbol: str
    amount: float
    purchase_price: float

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioRead(PortfolioBase):
    id: int

    class Config:
        orm_mode = True