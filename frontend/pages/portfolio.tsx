import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';

interface TransactionWithPL {
  id: string;
  date: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  current_price: number | null;
  invested: number;
  current_value: number | null;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
}

interface PortfolioItem {
  symbol: string;
  amount: number;
  avg_purchase_price: number;
  current_price?: number;
  total_value?: number;
  profit_loss?: number;
  profit_loss_percentage?: number;
  transactions: TransactionWithPL[];
}

interface PortfolioSummary {
  items: PortfolioItem[];
  total_invested: number;
  total_current_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
}

export default function PortfolioPage() {
  const { user, loading: authLoading } = useAuth();

  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSymbols, setExpandedSymbols] = useState<Set<string>>(new Set());

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      loadPortfolio();
    }
  }, [user, authLoading]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPortfolioSummary();
      setSummary(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to load portfolio:', err);
      setError(err.message || 'Не удалось загрузить портфолио');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.addPortfolioEntry({
        symbol: symbol.trim().toUpperCase(),
        amount: parseFloat(amount),
        purchase_price: parseFloat(purchasePrice),
      });
      setSymbol('');
      setAmount('');
      setPurchasePrice('');
      setShowAddForm(false);
      await loadPortfolio();
    } catch (err: any) {
      console.error('Failed to add asset:', err);
      setError(err.response?.data?.detail || err.message || 'Не удалось добавить актив');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (sym: string) => {
    setExpandedSymbols(prev => {
      const next = new Set(prev);
      if (next.has(sym)) {
        next.delete(sym);
      } else {
        next.add(sym);
      }
      return next;
    });
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
              📊 Портфолио
            </h1>
            <p style={{ color: 'var(--foreground-muted)' }} className="mt-1">
              Управляйте своими криптоактивами
            </p>
          </div>
          <button
            className={showAddForm ? 'btn-danger' : 'btn-primary'}
            onClick={() => setShowAddForm((v) => !v)}
          >
            {showAddForm ? '✕ Закрыть' : '+ Добавить актив'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message mb-6 animate-fadeIn">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loader"></div>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="stat-card">
                  <div style={{ color: 'var(--foreground-muted)' }} className="text-sm mb-1">
                    💵 Инвестировано
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(summary.total_invested)}
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ color: 'var(--foreground-muted)' }} className="text-sm mb-1">
                    💰 Текущая стоимость
                  </div>
                  <div className="text-2xl font-bold" style={{
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {formatCurrency(summary.total_current_value)}
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ color: 'var(--foreground-muted)' }} className="text-sm mb-1">
                    📈 Прибыль/Убыток
                  </div>
                  <div className={`text-2xl font-bold ${summary.total_profit_loss >= 0 ? 'profit' : 'loss'}`}>
                    {summary.total_profit_loss >= 0 ? '+' : ''}{formatCurrency(summary.total_profit_loss)}
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ color: 'var(--foreground-muted)' }} className="text-sm mb-1">
                    📊 Доходность
                  </div>
                  <div className={`text-2xl font-bold ${summary.total_profit_loss_percentage >= 0 ? 'profit' : 'loss'}`}>
                    {formatPercent(summary.total_profit_loss_percentage)}
                  </div>
                </div>
              </div>
            )}

            {/* Add asset form */}
            {showAddForm && (
              <div className="card p-6 mb-8 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  ➕ Добавить новый актив
                </h3>
                <form onSubmit={handleAddAsset} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                      Тикер
                    </label>
                    <input
                      className="input-dark"
                      placeholder="BTC, ETH, SOL..."
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                      Количество
                    </label>
                    <input
                      className="input-dark"
                      placeholder="0.5"
                      type="number"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                      Цена покупки (USD)
                    </label>
                    <input
                      className="input-dark"
                      placeholder="50000"
                      type="number"
                      step="any"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-success w-full"
                    >
                      {submitting ? '⏳ Добавление...' : '✓ Добавить'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Assets table with expandable rows */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-dark">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>Тикер</th>
                      <th>Количество</th>
                      <th>Средняя цена</th>
                      <th>Текущая цена</th>
                      <th>Стоимость</th>
                      <th>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.items?.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8" style={{ color: 'var(--foreground-muted)' }}>
                          📭 Портфолио пустое. Добавьте свой первый актив!
                        </td>
                      </tr>
                    )}
                    {summary?.items?.map((item) => {
                      const isExpanded = expandedSymbols.has(item.symbol);
                      const hasTx = item.transactions && item.transactions.length > 0;

                      return (
                        <>
                          {/* Main row */}
                          <tr
                            key={item.symbol}
                            onClick={() => hasTx && toggleExpand(item.symbol)}
                            style={{ cursor: hasTx ? 'pointer' : 'default' }}
                            className={hasTx ? 'hover:bg-opacity-80' : ''}
                          >
                            <td className="text-center">
                              {hasTx && (
                                <span className="text-lg" style={{ color: 'var(--accent-primary)' }}>
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                              )}
                            </td>
                            <td>
                              <span className="crypto-symbol text-lg">{item.symbol}</span>
                              {hasTx && (
                                <span className="ml-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                  ({item.transactions.length} сделок)
                                </span>
                              )}
                            </td>
                            <td style={{ color: 'var(--foreground)' }}>
                              {item.amount.toLocaleString('en-US', { maximumFractionDigits: 8 })}
                            </td>
                            <td style={{ color: 'var(--foreground-muted)' }}>
                              {formatCurrency(item.avg_purchase_price)}
                            </td>
                            <td style={{ color: 'var(--foreground)' }}>
                              {formatCurrency(item.current_price)}
                            </td>
                            <td style={{
                              color: 'var(--foreground)',
                              fontWeight: 600
                            }}>
                              {formatCurrency(item.total_value)}
                            </td>
                            <td>
                              <div className={`font-semibold ${(item.profit_loss || 0) >= 0 ? 'profit' : 'loss'}`}>
                                {item.profit_loss !== undefined && item.profit_loss !== null
                                  ? `${item.profit_loss >= 0 ? '+' : ''}${formatCurrency(item.profit_loss)}`
                                  : '-'
                                }
                              </div>
                              <div className={`text-sm ${(item.profit_loss_percentage || 0) >= 0 ? 'profit' : 'loss'}`}>
                                {formatPercent(item.profit_loss_percentage)}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded transaction rows */}
                          {isExpanded && item.transactions.map((tx) => (
                            <tr
                              key={tx.id}
                              style={{
                                background: 'rgba(99, 102, 241, 0.05)',
                                borderLeft: '3px solid var(--accent-primary)'
                              }}
                            >
                              <td></td>
                              <td colSpan={1}>
                                <span className={tx.type === 'buy' ? 'tag-buy' : 'tag-sell'}>
                                  {tx.type === 'buy' ? '🟢 BUY' : '🔴 SELL'}
                                </span>
                                <span className="ml-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                  {formatDate(tx.date)}
                                </span>
                              </td>
                              <td style={{ color: 'var(--foreground-muted)' }}>
                                {tx.quantity.toLocaleString('en-US', { maximumFractionDigits: 8 })}
                              </td>
                              <td style={{ color: 'var(--foreground-muted)' }}>
                                {formatCurrency(tx.price)}
                              </td>
                              <td style={{ color: 'var(--foreground-muted)' }}>
                                {formatCurrency(tx.current_price)}
                              </td>
                              <td style={{ color: 'var(--foreground-muted)' }}>
                                {tx.type === 'buy' ? formatCurrency(tx.current_value) : formatCurrency(tx.invested)}
                              </td>
                              <td>
                                {tx.type === 'buy' && tx.profit_loss !== null ? (
                                  <>
                                    <div className={`font-semibold ${tx.profit_loss >= 0 ? 'profit' : 'loss'}`}>
                                      {tx.profit_loss >= 0 ? '+' : ''}{formatCurrency(tx.profit_loss)}
                                    </div>
                                    <div className={`text-sm ${(tx.profit_loss_percentage || 0) >= 0 ? 'profit' : 'loss'}`}>
                                      {formatPercent(tx.profit_loss_percentage)}
                                    </div>
                                  </>
                                ) : (
                                  <span style={{ color: 'var(--foreground-muted)' }}>—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
