from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.db import get_db
from app.dependencies import get_current_user
from app.models import User, BudgetCategory, BudgetTransaction, BudgetType, DEFAULT_BUDGET_CATEGORIES
from app.schemas import (
    BudgetCategoryCreate, BudgetCategoryRead,
    BudgetTransactionCreate, BudgetTransactionRead,
    BudgetSummary, BudgetChartData, CategoryChartData, DailyTotals
)
from typing import List, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import csv
import io
import json

router = APIRouter(prefix="/budget", tags=["Budget"])


# ========== Categories ==========

@router.get("/categories", response_model=List[BudgetCategoryRead])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get all budget categories for user"""
    result = await db.execute(
        select(BudgetCategory).where(BudgetCategory.user_id == user.id)
    )
    categories = result.scalars().all()
    
    # If no categories, create default ones
    if not categories:
        for cat_data in DEFAULT_BUDGET_CATEGORIES:
            cat = BudgetCategory(
                user_id=user.id,
                name=cat_data["name"],
                type=BudgetType(cat_data["type"]),
                icon=cat_data["icon"]
            )
            db.add(cat)
        await db.commit()
        
        # Fetch again
        result = await db.execute(
            select(BudgetCategory).where(BudgetCategory.user_id == user.id)
        )
        categories = result.scalars().all()
    
    return [
        BudgetCategoryRead(
            id=c.id,
            name=c.name,
            type=c.type.value,
            icon=c.icon
        ) for c in categories
    ]


@router.post("/categories", response_model=BudgetCategoryRead)
async def create_category(
    data: BudgetCategoryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create new budget category"""
    try:
        cat_type = BudgetType(data.type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid category type. Use 'income' or 'expense'")
    
    category = BudgetCategory(
        user_id=user.id,
        name=data.name,
        type=cat_type,
        icon=data.icon
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return BudgetCategoryRead(
        id=category.id,
        name=category.name,
        type=category.type.value,
        icon=category.icon
    )


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete budget category"""
    result = await db.execute(
        select(BudgetCategory).where(
            BudgetCategory.id == category_id,
            BudgetCategory.user_id == user.id
        )
    )
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    await db.delete(category)
    await db.commit()
    return {"message": "Category deleted"}


# ========== Transactions ==========

@router.get("/transactions", response_model=List[BudgetTransactionRead])
async def get_transactions(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    category_id: Optional[int] = None,
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get budget transactions with optional filters"""
    query = select(BudgetTransaction).where(BudgetTransaction.user_id == user.id)
    
    if category_id:
        query = query.where(BudgetTransaction.category_id == category_id)
    
    if type:
        # Filter by category type
        query = query.join(BudgetCategory).where(BudgetCategory.type == BudgetType(type))
    
    query = query.options(selectinload(BudgetTransaction.category))
    query = query.order_by(BudgetTransaction.date.desc())
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return [
        BudgetTransactionRead(
            id=t.id,
            category_id=t.category_id,
            amount=t.amount,
            description=t.description,
            date=t.date,
            category=BudgetCategoryRead(
                id=t.category.id,
                name=t.category.name,
                type=t.category.type.value,
                icon=t.category.icon
            ) if t.category else None
        ) for t in transactions
    ]


@router.post("/transactions", response_model=BudgetTransactionRead)
async def create_transaction(
    data: BudgetTransactionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create new budget transaction (income or expense)"""
    # Verify category belongs to user
    cat_result = await db.execute(
        select(BudgetCategory).where(
            BudgetCategory.id == data.category_id,
            BudgetCategory.user_id == user.id
        )
    )
    category = cat_result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    transaction = BudgetTransaction(
        user_id=user.id,
        category_id=data.category_id,
        amount=data.amount,
        description=data.description or "",
        date=data.date or datetime.utcnow()
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    
    return BudgetTransactionRead(
        id=transaction.id,
        category_id=transaction.category_id,
        amount=transaction.amount,
        description=transaction.description,
        date=transaction.date,
        category=BudgetCategoryRead(
            id=category.id,
            name=category.name,
            type=category.type.value,
            icon=category.icon
        )
    )


@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete budget transaction"""
    result = await db.execute(
        select(BudgetTransaction).where(
            BudgetTransaction.id == transaction_id,
            BudgetTransaction.user_id == user.id
        )
    )
    transaction = result.scalars().first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    await db.delete(transaction)
    await db.commit()
    return {"message": "Transaction deleted"}


# ========== Summary ==========

@router.get("/summary", response_model=BudgetSummary)
async def get_summary(
    period: str = Query("month", regex="^(week|month|year|all)$"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get budget summary for period"""
    # Calculate date range
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = None
    
    # Get categories
    cat_result = await db.execute(
        select(BudgetCategory).where(BudgetCategory.user_id == user.id)
    )
    categories = cat_result.scalars().all()
    
    # Build transactions query
    tx_query = select(BudgetTransaction).where(BudgetTransaction.user_id == user.id)
    if start_date:
        tx_query = tx_query.where(BudgetTransaction.date >= start_date)
    tx_query = tx_query.options(selectinload(BudgetTransaction.category))
    tx_query = tx_query.order_by(BudgetTransaction.date.desc())
    
    tx_result = await db.execute(tx_query)
    transactions = tx_result.scalars().all()
    
    # Calculate totals
    total_income = 0.0
    total_expense = 0.0
    
    for tx in transactions:
        if tx.category and tx.category.type == BudgetType.income:
            total_income += tx.amount
        elif tx.category and tx.category.type == BudgetType.expense:
            total_expense += tx.amount
    
    return BudgetSummary(
        total_income=total_income,
        total_expense=total_expense,
        balance=total_income - total_expense,
        transactions=[
            BudgetTransactionRead(
                id=t.id,
                category_id=t.category_id,
                amount=t.amount,
                description=t.description,
                date=t.date,
                category=BudgetCategoryRead(
                    id=t.category.id,
                    name=t.category.name,
                    type=t.category.type.value,
                    icon=t.category.icon
                ) if t.category else None
            ) for t in transactions[:50]  # Limit to 50 in summary
        ],
        categories=[
            BudgetCategoryRead(
                id=c.id,
                name=c.name,
                type=c.type.value,
                icon=c.icon
            ) for c in categories
        ]
    )


# ========== Chart Data ==========

@router.get("/chart-data", response_model=BudgetChartData)
async def get_chart_data(
    period: str = Query("month", pattern="^(week|month|year|all)$"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get aggregated data for budget charts"""
    # Calculate date range
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = None
    
    # Get transactions with categories
    tx_query = select(BudgetTransaction).where(BudgetTransaction.user_id == user.id)
    if start_date:
        tx_query = tx_query.where(BudgetTransaction.date >= start_date)
    tx_query = tx_query.options(selectinload(BudgetTransaction.category))
    tx_query = tx_query.order_by(BudgetTransaction.date.asc())
    
    result = await db.execute(tx_query)
    transactions = result.scalars().all()
    
    # Aggregate by category
    expense_by_cat = defaultdict(lambda: {"total": 0.0, "icon": "💰"})
    income_by_cat = defaultdict(lambda: {"total": 0.0, "icon": "💰"})
    
    # Aggregate by day
    daily_data = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    
    total_income = 0.0
    total_expense = 0.0
    
    for tx in transactions:
        if not tx.category:
            continue
            
        date_key = tx.date.strftime("%Y-%m-%d")
        
        if tx.category.type == BudgetType.income:
            income_by_cat[tx.category.name]["total"] += tx.amount
            income_by_cat[tx.category.name]["icon"] = tx.category.icon
            daily_data[date_key]["income"] += tx.amount
            total_income += tx.amount
        else:
            expense_by_cat[tx.category.name]["total"] += tx.amount
            expense_by_cat[tx.category.name]["icon"] = tx.category.icon
            daily_data[date_key]["expense"] += tx.amount
            total_expense += tx.amount
    
    # Build daily totals with running balance
    sorted_dates = sorted(daily_data.keys())
    running_balance = 0.0
    daily_totals = []
    
    for date in sorted_dates:
        data = daily_data[date]
        running_balance += data["income"] - data["expense"]
        daily_totals.append(DailyTotals(
            date=date,
            income=data["income"],
            expense=data["expense"],
            balance=running_balance
        ))
    
    return BudgetChartData(
        expense_by_category=[
            CategoryChartData(category=name, total=data["total"], icon=data["icon"])
            for name, data in sorted(expense_by_cat.items(), key=lambda x: -x[1]["total"])
        ],
        income_by_category=[
            CategoryChartData(category=name, total=data["total"], icon=data["icon"])
            for name, data in sorted(income_by_cat.items(), key=lambda x: -x[1]["total"])
        ],
        daily_totals=daily_totals,
        total_income=total_income,
        total_expense=total_expense
    )


# ========== Export ==========

@router.get("/export/csv")
async def export_budget_csv(
    period: str = Query("month", pattern="^(week|month|year|all)$"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Export budget transactions as CSV file"""
    # Calculate date range
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = None
    
    # Get transactions
    tx_query = select(BudgetTransaction).where(BudgetTransaction.user_id == user.id)
    if start_date:
        tx_query = tx_query.where(BudgetTransaction.date >= start_date)
    tx_query = tx_query.options(selectinload(BudgetTransaction.category))
    tx_query = tx_query.order_by(BudgetTransaction.date.desc())
    
    result = await db.execute(tx_query)
    transactions = result.scalars().all()
    
    # Build CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Category", "Type", "Amount", "Description"])
    
    for tx in transactions:
        writer.writerow([
            tx.date.strftime("%Y-%m-%d %H:%M"),
            tx.category.name if tx.category else "Unknown",
            tx.category.type.value if tx.category else "unknown",
            tx.amount,
            tx.description
        ])
    
    output.seek(0)
    
    filename = f"budget_export_{period}_{now.strftime('%Y%m%d')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/json")
async def export_budget_json(
    period: str = Query("month", pattern="^(week|month|year|all)$"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Export budget transactions as JSON file"""
    # Calculate date range
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = None
    
    # Get transactions
    tx_query = select(BudgetTransaction).where(BudgetTransaction.user_id == user.id)
    if start_date:
        tx_query = tx_query.where(BudgetTransaction.date >= start_date)
    tx_query = tx_query.options(selectinload(BudgetTransaction.category))
    tx_query = tx_query.order_by(BudgetTransaction.date.desc())
    
    result = await db.execute(tx_query)
    transactions = result.scalars().all()
    
    # Build JSON
    data = {
        "export_date": now.isoformat(),
        "period": period,
        "transactions": [
            {
                "id": tx.id,
                "date": tx.date.isoformat(),
                "category": tx.category.name if tx.category else None,
                "type": tx.category.type.value if tx.category else None,
                "icon": tx.category.icon if tx.category else None,
                "amount": tx.amount,
                "description": tx.description
            }
            for tx in transactions
        ]
    }
    
    output = io.StringIO()
    json.dump(data, output, indent=2, ensure_ascii=False)
    output.seek(0)
    
    filename = f"budget_export_{period}_{now.strftime('%Y%m%d')}.json"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
