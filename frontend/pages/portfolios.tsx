import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { apiClient, Portfolio } from '@/lib/api';

const PORTFOLIO_TYPES = [
    { value: 'crypto', label: '₿ Крипто', icon: '🪙', color: '#f59e0b' },
    { value: 'stocks', label: '📈 Акции', icon: '📊', color: '#10b981' },
    { value: 'etf', label: '📦 ETF', icon: '📦', color: '#6366f1' },
    { value: 'metals', label: '🥇 Металлы', icon: '🪙', color: '#8b5cf6' },
];

export default function PortfoliosPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create form
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('crypto');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            loadPortfolios();
        }
    }, [user, authLoading]);

    const loadPortfolios = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getPortfolios();
            setPortfolios(data);
            setError('');
        } catch (err: any) {
            console.error('Failed to load portfolios:', err);
            setError(err.message || 'Не удалось загрузить портфели');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        try {
            await apiClient.createPortfolio(name.trim(), type);
            setName('');
            setType('crypto');
            setShowForm(false);
            await loadPortfolios();
        } catch (err: any) {
            console.error('Failed to create portfolio:', err);
            setError(err.response?.data?.detail || err.message || 'Ошибка создания');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number, portfolioName: string) => {
        if (!confirm(`Удалить портфель "${portfolioName}"? Все активы будут удалены!`)) return;

        try {
            await apiClient.deletePortfolio(id);
            await loadPortfolios();
        } catch (err: any) {
            console.error('Failed to delete:', err);
            setError(err.message || 'Ошибка удаления');
        }
    };

    const getTypeInfo = (typeValue: string) => {
        return PORTFOLIO_TYPES.find(t => t.value === typeValue) || PORTFOLIO_TYPES[0];
    };

    return (
        <Layout>
            <div className="animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                            💼 Портфели
                        </h1>
                        <p style={{ color: 'var(--foreground-muted)' }} className="mt-1">
                            Управляйте несколькими портфелями разных типов
                        </p>
                    </div>
                    <button
                        className={showForm ? 'btn-danger' : 'btn-primary'}
                        onClick={() => setShowForm(v => !v)}
                    >
                        {showForm ? '✕ Закрыть' : '+ Новый портфель'}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="error-message mb-6 animate-fadeIn">
                        ⚠️ {error}
                    </div>
                )}

                {/* Create form */}
                {showForm && (
                    <div className="card p-6 mb-8 animate-fadeIn">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                            ➕ Создать новый портфель
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                                    Название
                                </label>
                                <input
                                    className="input-dark"
                                    placeholder="Мой крипто портфель"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                                    Тип активов
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {PORTFOLIO_TYPES.map((t) => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => setType(t.value)}
                                            className="p-4 rounded-xl border transition-all"
                                            style={{
                                                background: type === t.value
                                                    ? `${t.color}20`
                                                    : 'var(--background-secondary)',
                                                borderColor: type === t.value
                                                    ? t.color
                                                    : 'rgba(255,255,255,0.1)',
                                                color: type === t.value
                                                    ? t.color
                                                    : 'var(--foreground-muted)',
                                            }}
                                        >
                                            <div className="text-2xl mb-1">{t.icon}</div>
                                            <div className="text-sm font-medium">{t.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !name.trim()}
                                className="btn-success w-full"
                            >
                                {submitting ? '⏳ Создание...' : '✓ Создать портфель'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <>
                        {/* Empty state */}
                        {portfolios.length === 0 && (
                            <div className="card p-12 text-center">
                                <div className="text-6xl mb-4">💼</div>
                                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                                    Нет портфелей
                                </h2>
                                <p style={{ color: 'var(--foreground-muted)' }} className="mb-6">
                                    Создайте свой первый портфель для отслеживания активов
                                </p>
                                <button className="btn-primary" onClick={() => setShowForm(true)}>
                                    + Создать портфель
                                </button>
                            </div>
                        )}

                        {/* Portfolios grid */}
                        {portfolios.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {portfolios.map((portfolio) => {
                                    const typeInfo = getTypeInfo(portfolio.type);
                                    return (
                                        <div
                                            key={portfolio.id}
                                            className="card p-6 cursor-pointer hover:scale-[1.02] transition-transform"
                                            onClick={() => router.push(`/portfolio/${portfolio.id}`)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                    style={{ background: `${typeInfo.color}20` }}
                                                >
                                                    {typeInfo.icon}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(portfolio.id, portfolio.name);
                                                    }}
                                                    className="text-sm px-3 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                                                    style={{ color: 'var(--accent-danger)' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>

                                            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                                                {portfolio.name}
                                            </h3>

                                            <div
                                                className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    background: `${typeInfo.color}20`,
                                                    color: typeInfo.color
                                                }}
                                            >
                                                {typeInfo.label}
                                            </div>

                                            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                                    Создан: {new Date(portfolio.created_at).toLocaleDateString('ru-RU')}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}
