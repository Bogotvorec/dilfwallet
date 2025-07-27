from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db import get_db
from app.dependencies import get_current_user
from app.models import User, PortfolioEntry
from app.schemas import PortfolioCreate, PortfolioRead

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
