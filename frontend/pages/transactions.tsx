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
    try {
      await apiClient.createTransaction({
        portfolio_entry_id: Number(form.portfolio_entry_id),
        type: form.type,
        quantity: parseFloat(form.quantity),
        price: parseFloat(form.price),
        coin: 'AUTO', // игнорируется на бэке, проставится из portfolio.symbol
      });
      setForm({ portfolio_entry_id: '', type: 'buy', quantity: '', price: '' });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания транзакции');
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900">Транзакции</h1>
            <p className="mt-2 text-sm text-gray-700">
              Добавляйте операции покупки/продажи и просматривайте историю
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Форма добавления транзакции */}
        <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Новая транзакция</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Актив</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={form.portfolio_entry_id}
                onChange={(e) => setForm({ ...form, portfolio_entry_id: e.target.value })}
              >
                <option value="">Выберите актив</option>
                {portfolio.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.symbol} (кол-во: {p.amount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Тип</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'buy' | 'sell' })}
              >
                <option value="buy">Покупка</option>
                <option value="sell">Продажа</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Количество</label>
              <input
                type="number"
                step="any"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Цена (USD)</label>
              <input
                type="number"
                step="any"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Добавить
              </button>
            </div>
          </form>
        </div>

        {/* Таблица транзакций */}
        <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 md:rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Дата</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Актив</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Тип</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Кол-во</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Цена</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(t.date).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {t.coin}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {t.type === 'buy' ? 'Покупка' : 'Продажа'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{t.quantity}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${t.price}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">$
                    {(Number(t.quantity) * Number(t.price)).toFixed(2)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-gray-500" colSpan={6}>Пока нет транзакций</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
