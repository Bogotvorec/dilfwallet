from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db import get_db
from app.dependencies import get_current_user
from app.models import User, PortfolioEntry, Transaction, TransactionType
from app.schemas import PortfolioCreate, PortfolioRead, PortfolioSummary, TransactionCreate, TransactionRead
from app.price_service import get_price, get_multiple_prices
from typing import List

router = APIRouter()

@router.post("/portfolio", response_model=PortfolioRead)
async def add_entry(entry: PortfolioCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    new_entry = PortfolioEntry(**entry.dict(), user_id=user.id)
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)
    return new_entry

@router.get("/portfolio", response_model=list[PortfolioRead])
async def get_portfolio(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(PortfolioEntry).where(PortfolioEntry.user_id == user.id))
    return result.scalars().all()

@router.delete("/portfolio/{entry_id}")
async def delete_entry(entry_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(PortfolioEntry).where(PortfolioEntry.id == entry_id, PortfolioEntry.user_id == user.id))
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.delete(entry)
    await db.commit()
    return {"message": "Deleted"}

@router.get("/portfolio/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    """Получить сводку портфеля с текущими ценами и P&L"""
    result = await db.execute(select(PortfolioEntry).where(PortfolioEntry.user_id == user.id))
    entries = result.scalars().all()
    
    if not entries:
        return PortfolioSummary(
            items=[],
            total_invested=0.0,
            total_current_value=0.0,
            total_profit_loss=0.0,
            total_profit_loss_percentage=0.0
        )
    
    # Получаем текущие цены для всех монет
    symbols = [entry.symbol for entry in entries]
    prices = await get_multiple_prices(symbols)
    
    items = []
    total_invested = 0.0
    total_current_value = 0.0
    
    for entry in entries:
        current_price = prices.get(entry.symbol)
        invested = entry.amount * entry.purchase_price
        current_value = entry.amount * current_price if current_price else 0.0
        profit_loss = current_value - invested if current_price else None
        profit_loss_pct = (profit_loss / invested * 100) if invested > 0 and profit_loss is not None else None
        
        items.append({
            "symbol": entry.symbol,
            "amount": entry.amount,
            "purchase_price": entry.purchase_price,
            "current_price": current_price,
            "total_value": current_value if current_price else None,
            "profit_loss": profit_loss,
            "profit_loss_percentage": profit_loss_pct
        })
        
        total_invested += invested
        total_current_value += current_value
    
    total_profit_loss = total_current_value - total_invested
    total_profit_loss_pct = (total_profit_loss / total_invested * 100) if total_invested > 0 else 0.0
    
    return PortfolioSummary(
        items=items,
        total_invested=total_invested,
        total_current_value=total_current_value,
        total_profit_loss=total_profit_loss,
        total_profit_loss_percentage=total_profit_loss_pct
    )

@router.post("/transactions", response_model=TransactionRead)
async def create_transaction(
    transaction: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Создать новую транзакцию"""
    # portfolio_entry_id обязателен для привязки к активу пользователя
    if not transaction.portfolio_entry_id:
        raise HTTPException(status_code=400, detail="portfolio_entry_id is required")

    # Проверяем, что portfolio_entry принадлежит текущему пользователю
    pe_result = await db.execute(
        select(PortfolioEntry).where(
            PortfolioEntry.id == transaction.portfolio_entry_id,
            PortfolioEntry.user_id == user.id,
        )
    )
    pe = pe_result.scalars().first()
    if not pe:
        raise HTTPException(status_code=404, detail="Portfolio entry not found")

    # Конвертируем строковый type в Enum
    try:
        tx_type = TransactionType(transaction.type)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid transaction type. Use 'buy' or 'sell'")

    new_transaction = Transaction(
        portfolio_entry_id=pe.id,
        coin=pe.symbol,  # сохраняем согласованность: coin = symbol из портфеля
        quantity=transaction.quantity,
        price=transaction.price,
        type=tx_type,
    )
    db.add(new_transaction)
    await db.commit()
    await db.refresh(new_transaction)
    return new_transaction

@router.get("/transactions", response_model=List[TransactionRead])
async def get_transactions(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Получить все транзакции пользователя"""
    # Получаем все portfolio entries пользователя
    portfolio_result = await db.execute(
        select(PortfolioEntry).where(PortfolioEntry.user_id == user.id)
    )
    portfolio_ids = [entry.id for entry in portfolio_result.scalars().all()]
    
    if not portfolio_ids:
        return []
    
    # Получаем транзакции для этих portfolio entries
    transactions_result = await db.execute(
        select(Transaction).where(Transaction.portfolio_entry_id.in_(portfolio_ids))
        .order_by(Transaction.date.desc())
    )
    return transactions_result.scalars().all()
