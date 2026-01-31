from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db import get_db
from app.dependencies import get_current_user
from app.models import (
    User, Portfolio, PortfolioEntry, Transaction, 
    TransactionType, PortfolioType
)
from app.schemas import (
    PortfolioCreate, PortfolioRead, PortfolioEntryCreate, PortfolioEntryRead,
    PortfolioSummary, PortfolioItemSummary, TransactionCreate, TransactionRead, 
    TransactionWithPL
)
from app.price_service import get_multiple_prices_by_type
from typing import List, Dict
from collections import defaultdict

router = APIRouter()


# ========== Portfolio CRUD ==========

@router.get("/portfolios", response_model=List[PortfolioRead])
async def get_portfolios(
    db: AsyncSession = Depends(get_db), 
    user: User = Depends(get_current_user)
):
    """Get all user's portfolios"""
    result = await db.execute(
        select(Portfolio).where(Portfolio.user_id == user.id).order_by(Portfolio.created_at)
    )
    portfolios = result.scalars().all()
    
    # Return list with type as string
    return [
        PortfolioRead(
            id=p.id, 
            name=p.name, 
            type=p.type.value,
            created_at=p.created_at
        ) for p in portfolios
    ]


@router.post("/portfolios", response_model=PortfolioRead)
async def create_portfolio(
    data: PortfolioCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create new portfolio"""
    try:
        ptype = PortfolioType(data.type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid portfolio type: {data.type}")
    
    portfolio = Portfolio(
        user_id=user.id,
        name=data.name,
        type=ptype
    )
    db.add(portfolio)
    await db.commit()
    await db.refresh(portfolio)
    
    return PortfolioRead(
        id=portfolio.id,
        name=portfolio.name,
        type=portfolio.type.value,
        created_at=portfolio.created_at
    )


@router.delete("/portfolios/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete portfolio and all its entries"""
    result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user.id
        )
    )
    portfolio = result.scalars().first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    await db.delete(portfolio)
    await db.commit()
    return {"message": "Portfolio deleted"}


# ========== Portfolio Entries ==========

@router.post("/portfolios/{portfolio_id}/entries", response_model=PortfolioEntryRead)
async def add_entry(
    portfolio_id: int,
    entry: PortfolioEntryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Add asset to portfolio"""
    # Verify portfolio belongs to user
    pf_result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user.id
        )
    )
    portfolio = pf_result.scalars().first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check if entry with same symbol exists
    existing = await db.execute(
        select(PortfolioEntry).where(
            PortfolioEntry.portfolio_id == portfolio_id,
            PortfolioEntry.symbol == entry.symbol.upper()
        )
    )
    existing_entry = existing.scalars().first()
    
    if existing_entry:
        # Update existing entry with weighted average price
        total_cost = existing_entry.amount * existing_entry.purchase_price + entry.amount * entry.purchase_price
        new_amount = existing_entry.amount + entry.amount
        existing_entry.purchase_price = total_cost / new_amount if new_amount > 0 else entry.purchase_price
        existing_entry.amount = new_amount
        
        # Create transaction
        tx = Transaction(
            portfolio_entry_id=existing_entry.id,
            symbol=entry.symbol.upper(),
            quantity=entry.amount,
            price=entry.purchase_price,
            type=TransactionType.buy
        )
        db.add(tx)
        await db.commit()
        await db.refresh(existing_entry)
        return existing_entry
    else:
        # Create new entry
        new_entry = PortfolioEntry(
            portfolio_id=portfolio_id,
            symbol=entry.symbol.upper(),
            amount=entry.amount,
            purchase_price=entry.purchase_price
        )
        db.add(new_entry)
        await db.commit()
        await db.refresh(new_entry)
        
        # Create initial transaction
        tx = Transaction(
            portfolio_entry_id=new_entry.id,
            symbol=entry.symbol.upper(),
            quantity=entry.amount,
            price=entry.purchase_price,
            type=TransactionType.buy
        )
        db.add(tx)
        await db.commit()
        
        return new_entry


@router.get("/portfolios/{portfolio_id}/entries", response_model=List[PortfolioEntryRead])
async def get_entries(
    portfolio_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get all entries in portfolio"""
    # Verify portfolio belongs to user
    pf_result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user.id
        )
    )
    if not pf_result.scalars().first():
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    result = await db.execute(
        select(PortfolioEntry).where(PortfolioEntry.portfolio_id == portfolio_id)
    )
    return result.scalars().all()


@router.delete("/portfolios/{portfolio_id}/entries/{entry_id}")
async def delete_entry(
    portfolio_id: int,
    entry_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete entry from portfolio"""
    # Verify portfolio belongs to user
    pf_result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user.id
        )
    )
    if not pf_result.scalars().first():
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    result = await db.execute(
        select(PortfolioEntry).where(
            PortfolioEntry.id == entry_id,
            PortfolioEntry.portfolio_id == portfolio_id
        )
    )
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    await db.delete(entry)
    await db.commit()
    return {"message": "Entry deleted"}


# ========== Portfolio Summary ==========

@router.get("/portfolios/{portfolio_id}/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    portfolio_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get portfolio summary with current prices and P&L"""
    # Get portfolio
    pf_result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user.id
        )
    )
    portfolio = pf_result.scalars().first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Get entries
    entries_result = await db.execute(
        select(PortfolioEntry).where(PortfolioEntry.portfolio_id == portfolio_id)
    )
    entries = entries_result.scalars().all()
    
    if not entries:
        return PortfolioSummary(
            portfolio=PortfolioRead(
                id=portfolio.id,
                name=portfolio.name,
                type=portfolio.type.value,
                created_at=portfolio.created_at
            ),
            items=[],
            total_invested=0.0,
            total_current_value=0.0,
            total_profit_loss=0.0,
            total_profit_loss_percentage=0.0
        )
    
    # Get transactions
    entry_ids = [e.id for e in entries]
    tx_result = await db.execute(
        select(Transaction)
        .where(Transaction.portfolio_entry_id.in_(entry_ids))
        .order_by(Transaction.date.desc())
    )
    all_transactions = tx_result.scalars().all()
    
    tx_by_entry: Dict[int, list] = defaultdict(list)
    for tx in all_transactions:
        tx_by_entry[tx.portfolio_entry_id].append(tx)
    
    # Get current prices for all portfolio types
    symbols = list(set([e.symbol for e in entries]))
    prices = await get_multiple_prices_by_type(symbols, portfolio.type.value)
    
    items = []
    total_invested = 0.0
    total_current_value = 0.0
    
    for entry in entries:
        current_price = prices.get(entry.symbol)
        invested = entry.amount * entry.purchase_price
        current_value = entry.amount * current_price if current_price else invested
        profit_loss = current_value - invested if current_price else None
        profit_loss_pct = (profit_loss / invested * 100) if invested > 0 and profit_loss is not None else None
        
        # Build transaction list
        tx_list = []
        for tx in tx_by_entry.get(entry.id, []):
            tx_qty = float(tx.quantity)
            tx_price = float(tx.price)
            tx_invested = tx_qty * tx_price
            
            if tx.type == TransactionType.buy and current_price:
                tx_current_value = tx_qty * current_price
                tx_pl = tx_current_value - tx_invested
                tx_pl_pct = (tx_pl / tx_invested * 100) if tx_invested > 0 else 0
            else:
                tx_current_value = None
                tx_pl = None
                tx_pl_pct = None
            
            tx_list.append(TransactionWithPL(
                id=tx.id,
                date=tx.date,
                type=tx.type.value,
                quantity=tx_qty,
                price=tx_price,
                current_price=current_price,
                invested=tx_invested,
                current_value=tx_current_value,
                profit_loss=tx_pl,
                profit_loss_percentage=tx_pl_pct
            ))
        
        items.append(PortfolioItemSummary(
            symbol=entry.symbol,
            amount=entry.amount,
            avg_purchase_price=entry.purchase_price,
            current_price=current_price,
            total_value=current_value if current_price else None,
            profit_loss=profit_loss,
            profit_loss_percentage=profit_loss_pct,
            transactions=tx_list
        ))
        
        total_invested += invested
        total_current_value += current_value
    
    total_profit_loss = total_current_value - total_invested
    total_profit_loss_pct = (total_profit_loss / total_invested * 100) if total_invested > 0 else 0.0
    
    return PortfolioSummary(
        portfolio=PortfolioRead(
            id=portfolio.id,
            name=portfolio.name,
            type=portfolio.type.value,
            created_at=portfolio.created_at
        ),
        items=items,
        total_invested=total_invested,
        total_current_value=total_current_value,
        total_profit_loss=total_profit_loss,
        total_profit_loss_percentage=total_profit_loss_pct
    )


# ========== Transactions ==========

@router.post("/portfolios/{portfolio_id}/transactions", response_model=TransactionRead)
async def create_transaction(
    portfolio_id: int,
    transaction: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create BUY/SELL transaction"""
    # Verify portfolio belongs to user
    pf_result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user.id
        )
    )
    if not pf_result.scalars().first():
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if not transaction.portfolio_entry_id:
        raise HTTPException(status_code=400, detail="portfolio_entry_id is required")
    
    # Get entry
    pe_result = await db.execute(
        select(PortfolioEntry).where(
            PortfolioEntry.id == transaction.portfolio_entry_id,
            PortfolioEntry.portfolio_id == portfolio_id
        )
    )
    pe = pe_result.scalars().first()
    if not pe:
        raise HTTPException(status_code=404, detail="Portfolio entry not found")
    
    try:
        tx_type = TransactionType(transaction.type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transaction type")
    
    quantity = float(transaction.quantity)
    price = float(transaction.price)
    
    if tx_type == TransactionType.sell:
        if pe.amount < quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient balance. Available: {pe.amount}, requested: {quantity}"
            )
        pe.amount -= quantity
    else:
        total_cost = pe.amount * pe.purchase_price + quantity * price
        new_amount = pe.amount + quantity
        pe.purchase_price = total_cost / new_amount if new_amount > 0 else price
        pe.amount = new_amount
    
    new_tx = Transaction(
        portfolio_entry_id=pe.id,
        symbol=pe.symbol,
        quantity=transaction.quantity,
        price=transaction.price,
        type=tx_type
    )
    db.add(new_tx)
    await db.commit()
    await db.refresh(new_tx)
    
    return TransactionRead(
        id=new_tx.id,
        symbol=new_tx.symbol,
        quantity=new_tx.quantity,
        price=new_tx.price,
        type=new_tx.type.value,
        date=new_tx.date,
        portfolio_entry_id=new_tx.portfolio_entry_id
    )


@router.get("/portfolios/{portfolio_id}/transactions", response_model=List[TransactionRead])
async def get_transactions(
    portfolio_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get all transactions for portfolio"""
    # Verify portfolio belongs to user
    pf_result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user.id
        )
    )
    if not pf_result.scalars().first():
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Get entry IDs
    entries_result = await db.execute(
        select(PortfolioEntry.id).where(PortfolioEntry.portfolio_id == portfolio_id)
    )
    entry_ids = [e for e in entries_result.scalars().all()]
    
    if not entry_ids:
        return []
    
    result = await db.execute(
        select(Transaction)
        .where(Transaction.portfolio_entry_id.in_(entry_ids))
        .order_by(Transaction.date.desc())
    )
    transactions = result.scalars().all()
    
    return [
        TransactionRead(
            id=tx.id,
            symbol=tx.symbol,
            quantity=tx.quantity,
            price=tx.price,
            type=tx.type.value,
            date=tx.date,
            portfolio_entry_id=tx.portfolio_entry_id
        ) for tx in transactions
    ]
