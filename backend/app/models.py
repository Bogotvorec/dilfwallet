from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Enum, Integer, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

Base = declarative_base()

class TransactionType(enum.Enum):
    buy = "buy"
    sell = "sell"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    portfolio = relationship("PortfolioEntry", back_populates="owner")

class PortfolioEntry(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    symbol = Column(String, index=True)
    amount = Column(Float)
    purchase_price = Column(Float)

    owner = relationship("User", back_populates="portfolio")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolio.id"))  # fixed name
    coin = Column(String)
    quantity = Column(Numeric)
    price = Column(Numeric)
    type = Column(Enum(TransactionType))
    date = Column(DateTime, default=datetime.utcnow)
