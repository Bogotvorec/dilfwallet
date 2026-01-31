import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/router';

interface PortfolioEntry {
  id: number;
  symbol: string;
  amount: number;
  purchase_price: number;
}

interface Transaction {
  id: string;
  portfolio_entry_id: number;
  coin: string;
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
  date: string;
}

export default function TransactionsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    portfolio_entry_id: '',
    type: 'buy' as 'buy' | 'sell',
    quantity: '',
    price: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pf, tx] = await Promise.all([
        apiClient.getPortfolio(),
        apiClient.getTransactions(),
      ]);
      setPortfolio(pf);
      setTransactions(tx);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await apiClient.createTransaction({
        portfolio_entry_id: Number(form.portfolio_entry_id),
        type: form.type,
        quantity: parseFloat(form.quantity),
        price: parseFloat(form.price),
        coin: 'AUTO',
      });
      setForm({ portfolio_entry_id: '', type: 'buy', quantity: '', price: '' });
      setSuccess(`Транзакция ${form.type === 'buy' ? 'покупки' : 'продажи'} успешно создана!`);
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания транзакции');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="loader"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            💱 Транзакции
          </h1>
          <p style={{ color: 'var(--foreground-muted)' }} className="mt-1">
            Покупайте и продавайте криптовалюты
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="error-message mb-6 animate-fadeIn">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="success-message mb-6 animate-fadeIn">
            ✅ {success}
          </div>
        )}

        {/* Transaction form */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            ➕ Новая транзакция
          </h3>

          {portfolio.length === 0 ? (
            <div className="text-center py-6" style={{ color: 'var(--foreground-muted)' }}>
              📭 Сначала добавьте актив в <a href="/portfolio" className="text-blue-400 hover:underline">портфолио</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Актив
                </label>
                <select
                  required
                  className="select-dark"
                  value={form.portfolio_entry_id}
                  onChange={(e) => setForm({ ...form, portfolio_entry_id: e.target.value })}
                >
                  <option value="">Выберите актив</option>
                  {portfolio.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.symbol} ({p.amount.toLocaleString('en-US', { maximumFractionDigits: 8 })})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Тип операции
                </label>
                <select
                  className="select-dark"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'buy' | 'sell' })}
                >
                  <option value="buy">🟢 Покупка</option>
                  <option value="sell">🔴 Продажа</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Количество
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  className="input-dark"
                  placeholder="0.5"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Цена (USD)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  className="input-dark"
                  placeholder="50000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className={form.type === 'buy' ? 'btn-success w-full' : 'btn-danger w-full'}
                >
                  {form.type === 'buy' ? '🟢 Купить' : '🔴 Продать'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Transactions history */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              📋 История транзакций
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Актив</th>
                  <th>Тип</th>
                  <th>Количество</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8" style={{ color: 'var(--foreground-muted)' }}>
                      📭 История транзакций пуста
                    </td>
                  </tr>
                )}
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--foreground-muted)' }}>
                      {formatDate(t.date)}
                    </td>
                    <td>
                      <span className="crypto-symbol">{t.coin}</span>
                    </td>
                    <td>
                      <span className={t.type === 'buy' ? 'tag-buy' : 'tag-sell'}>
                        {t.type === 'buy' ? '🟢 Покупка' : '🔴 Продажа'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--foreground)' }}>
                      {Number(t.quantity).toLocaleString('en-US', { maximumFractionDigits: 8 })}
                    </td>
                    <td style={{ color: 'var(--foreground-muted)' }}>
                      {formatCurrency(Number(t.price))}
                    </td>
                    <td style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                      {formatCurrency(Number(t.quantity) * Number(t.price))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
