import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { apiClient, BudgetSummary, BudgetCategory, BudgetTransaction } from '@/lib/api';

export default function BudgetPage() {
    const { user, loading: authLoading } = useAuth();

    const [summary, setSummary] = useState<BudgetSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');

    // Add transaction form
    const [showForm, setShowForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    useEffect(() => {
        if (!authLoading && user) {
            loadSummary();
        }
    }, [user, authLoading, period]);

    const loadSummary = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getBudgetSummary(period);
            setSummary(data);
            setError('');
        } catch (err: any) {
            console.error('Failed to load budget:', err);
            setError(err.message || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory || !amount) return;

        setSubmitting(true);
        try {
            await apiClient.createBudgetTransaction({
                category_id: selectedCategory,
                amount: parseFloat(amount),
                description: description.trim(),
            });
            setAmount('');
            setDescription('');
            setSelectedCategory(null);
            setShowForm(false);
            await loadSummary();
        } catch (err: any) {
            console.error('Failed to add transaction:', err);
            setError(err.response?.data?.detail || 'Ошибка добавления');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить запись?')) return;
        try {
            await apiClient.deleteBudgetTransaction(id);
            await loadSummary();
        } catch (err: any) {
            setError('Ошибка удаления');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'short',
        });
    };

    const incomeCategories = summary?.categories.filter(c => c.type === 'income') || [];
    const expenseCategories = summary?.categories.filter(c => c.type === 'expense') || [];

    const filteredTransactions = summary?.transactions.filter(t => {
        if (filterType === 'all') return true;
        return t.category?.type === filterType;
    }) || [];

    return (
        <Layout>
            <div className="animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                            💰 Бюджет
                        </h1>
                        <p style={{ color: 'var(--foreground-muted)' }} className="mt-1">
                            Учёт доходов и расходов
                        </p>
                    </div>
                    <button
                        className={showForm ? 'btn-danger' : 'btn-primary'}
                        onClick={() => setShowForm(v => !v)}
                    >
                        {showForm ? '✕ Закрыть' : '+ Добавить запись'}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="error-message mb-6">⚠️ {error}</div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="loader"></div>
                    </div>
                ) : summary ? (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="stat-card">
                                <div style={{ color: 'var(--foreground-muted)' }} className="text-sm mb-1">
                                    📈 Доходы
                                </div>
                                <div className="text-2xl font-bold profit">
                                    +{formatCurrency(summary.total_income)}
                                </div>
                            </div>

                            <div className="stat-card">
                                <div style={{ color: 'var(--foreground-muted)' }} className="text-sm mb-1">
                                    📉 Расходы
                                </div>
                                <div className="text-2xl font-bold loss">
                                    -{formatCurrency(summary.total_expense)}
                                </div>
                            </div>

                            <div className="stat-card">
                                <div style={{ color: 'var(--foreground-muted)' }} className="text-sm mb-1">
                                    💵 Баланс
                                </div>
                                <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'profit' : 'loss'}`}>
                                    {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance)}
                                </div>
                            </div>
                        </div>

                        {/* Period selector */}
                        <div className="flex gap-2 mb-6">
                            {(['week', 'month', 'year', 'all'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                    style={{
                                        background: period === p ? 'var(--accent-primary)' : 'var(--background-secondary)',
                                        color: period === p ? 'white' : 'var(--foreground-muted)',
                                    }}
                                >
                                    {p === 'week' && '📅 Неделя'}
                                    {p === 'month' && '📆 Месяц'}
                                    {p === 'year' && '🗓️ Год'}
                                    {p === 'all' && '♾️ Все'}
                                </button>
                            ))}
                        </div>

                        {/* Add transaction form */}
                        {showForm && (
                            <div className="card p-6 mb-8 animate-fadeIn">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                                    ➕ Добавить запись
                                </h3>
                                <form onSubmit={handleAddTransaction} className="space-y-4">
                                    {/* Category selection */}
                                    <div>
                                        <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                                            Категория
                                        </label>

                                        <div className="mb-2 text-sm font-medium" style={{ color: 'var(--accent-success)' }}>
                                            Доходы:
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {incomeCategories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className="px-3 py-2 rounded-lg text-sm transition-all"
                                                    style={{
                                                        background: selectedCategory === cat.id
                                                            ? 'rgba(16, 185, 129, 0.3)'
                                                            : 'var(--background-secondary)',
                                                        border: selectedCategory === cat.id
                                                            ? '2px solid var(--accent-success)'
                                                            : '1px solid rgba(255,255,255,0.1)',
                                                        color: 'var(--foreground)',
                                                    }}
                                                >
                                                    {cat.icon} {cat.name}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mb-2 text-sm font-medium" style={{ color: 'var(--accent-danger)' }}>
                                            Расходы:
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {expenseCategories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className="px-3 py-2 rounded-lg text-sm transition-all"
                                                    style={{
                                                        background: selectedCategory === cat.id
                                                            ? 'rgba(239, 68, 68, 0.3)'
                                                            : 'var(--background-secondary)',
                                                        border: selectedCategory === cat.id
                                                            ? '2px solid var(--accent-danger)'
                                                            : '1px solid rgba(255,255,255,0.1)',
                                                        color: 'var(--foreground)',
                                                    }}
                                                >
                                                    {cat.icon} {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                                                Сумма (₽)
                                            </label>
                                            <input
                                                className="input-dark"
                                                placeholder="1000"
                                                type="number"
                                                step="any"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                                                Описание
                                            </label>
                                            <input
                                                className="input-dark"
                                                placeholder="Покупка в магазине..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || !selectedCategory || !amount}
                                        className="btn-success w-full"
                                    >
                                        {submitting ? '⏳ Добавление...' : '✓ Добавить'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Filter */}
                        <div className="flex gap-2 mb-4">
                            {(['all', 'income', 'expense'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilterType(f)}
                                    className="px-3 py-1 rounded-lg text-sm transition-all"
                                    style={{
                                        background: filterType === f ? 'var(--background-card)' : 'transparent',
                                        color: filterType === f ? 'var(--foreground)' : 'var(--foreground-muted)',
                                    }}
                                >
                                    {f === 'all' && 'Все'}
                                    {f === 'income' && '📈 Доходы'}
                                    {f === 'expense' && '📉 Расходы'}
                                </button>
                            ))}
                        </div>

                        {/* Transactions list */}
                        <div className="card overflow-hidden">
                            {filteredTransactions.length === 0 ? (
                                <div className="p-12 text-center" style={{ color: 'var(--foreground-muted)' }}>
                                    📭 Нет записей за выбранный период
                                </div>
                            ) : (
                                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    {filteredTransactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                                    style={{
                                                        background: tx.category?.type === 'income'
                                                            ? 'rgba(16, 185, 129, 0.2)'
                                                            : 'rgba(239, 68, 68, 0.2)'
                                                    }}
                                                >
                                                    {tx.category?.icon || '💰'}
                                                </div>
                                                <div>
                                                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                                                        {tx.category?.name || 'Без категории'}
                                                    </div>
                                                    {tx.description && (
                                                        <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                                            {tx.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className={`font-semibold ${tx.category?.type === 'income' ? 'profit' : 'loss'}`}>
                                                        {tx.category?.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                    </div>
                                                    <div className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                                        {formatDate(tx.date)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(tx.id)}
                                                    className="text-sm px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
                                                    style={{ color: 'var(--accent-danger)' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </Layout>
    );
}
