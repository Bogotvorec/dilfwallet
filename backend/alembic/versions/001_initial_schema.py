"""initial schema

Revision ID: 001
Revises: 
Create Date: 2026-02-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # Portfolios
    op.create_table(
        'portfolios',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('type', sa.Enum('crypto', 'stocks', 'etf', 'metals', name='portfoliotype'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_portfolios_id', 'portfolios', ['id'])

    # Portfolio Entries
    op.create_table(
        'portfolio_entries',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('portfolio_id', sa.Integer(), sa.ForeignKey('portfolios.id'), nullable=False),
        sa.Column('symbol', sa.String(20), nullable=False, index=True),
        sa.Column('amount', sa.Numeric(precision=18, scale=8), server_default='0'),
        sa.Column('purchase_price', sa.Numeric(precision=18, scale=8), server_default='0'),
    )
    op.create_index('ix_portfolio_entries_id', 'portfolio_entries', ['id'])

    # Transactions
    op.create_table(
        'transactions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('portfolio_entry_id', sa.Integer(), sa.ForeignKey('portfolio_entries.id'), nullable=False),
        sa.Column('symbol', sa.String(20), nullable=True),
        sa.Column('quantity', sa.Numeric(), nullable=True),
        sa.Column('price', sa.Numeric(), nullable=True),
        sa.Column('type', sa.Enum('buy', 'sell', name='transactiontype'), nullable=True),
        sa.Column('date', sa.DateTime(), nullable=True),
    )

    # Budget Categories
    op.create_table(
        'budget_categories',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('type', sa.Enum('income', 'expense', name='budgettype'), nullable=False),
        sa.Column('icon', sa.String(10), server_default='💰'),
    )
    op.create_index('ix_budget_categories_id', 'budget_categories', ['id'])

    # Budget Transactions
    op.create_table(
        'budget_transactions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('budget_categories.id'), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('description', sa.Text(), server_default=''),
        sa.Column('date', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_budget_transactions_id', 'budget_transactions', ['id'])


def downgrade() -> None:
    op.drop_table('budget_transactions')
    op.drop_table('budget_categories')
    op.drop_table('transactions')
    op.drop_table('portfolio_entries')
    op.drop_table('portfolios')
    op.drop_table('users')
