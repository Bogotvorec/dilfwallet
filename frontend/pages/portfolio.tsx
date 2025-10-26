import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';

interface PortfolioItem {
  id: number;
  symbol: string;
  amount: number;
  purchase_price: number;
  current_price?: number;
  value?: number;
  profit_loss?: number;
  profit_loss_percent?: number;
}

interface PortfolioSummary {
  total_value: number;
  total_invested: number;
  total_profit_loss: number;
  total_profit_loss_percent: number;
  items: PortfolioItem[];
}

export default function PortfolioPage() {
  const { user, loading: authLoading } = useAuth();

  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">Портфолио</h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div>Загрузка...</div>
        ) : (
          <>
            {/* Summary cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded bg-white shadow">
                  <div className="text-sm text-gray-500">Инвестировано</div>
                  <div className="text-xl font-semibold">${summary.total_invested.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded bg-white shadow">
                  <div className="text-sm text-gray-500">Текущая стоимость</div>
                  <div className="text-xl font-semibold">${summary.total_value.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded bg-white shadow">
                  <div className="text-sm text-gray-500">Прибыль/Убыток</div>
                  <div className={`text-xl font-semibold ${summary.total_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${summary.total_profit_loss.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 rounded bg-white shadow">
                  <div className="text-sm text-gray-500">Доходность</div>
                  <div className={`text-xl font-semibold ${summary.total_profit_loss_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.total_profit_loss_percent.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}

            {/* Add asset form toggle */}
            <div className="mb-4">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setShowAddForm((v) => !v)}
              >
                {showAddForm ? 'Скрыть форму' : 'Добавить актив'}
              </button>
            </div>

            {/* Add asset form */}
            {showAddForm && (
              <form onSubmit={handleAddAsset} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded shadow">
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Символ (например, BTC)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  required
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Количество"
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Цена покупки"
                  type="number"
                  step="any"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
                >
                  {submitting ? 'Добавление...' : 'Добавить'}
                </button>
              </form>
            )}

            {/* Items table */}
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тикер</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Количество</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена покупки</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Текущая цена</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Стоимость</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary?.items?.map((item) => {
                    const plClass = (item.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600';
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-2 font-medium">{item.symbol}</td>
                        <td className="px-4 py-2">{item.amount}</td>
                        <td className="px-4 py-2">${item.purchase_price.toFixed(2)}</td>
                        <td className="px-4 py-2">{item.current_price ? `$${item.current_price.toFixed(2)}` : '-'}</td>
                        <td className="px-4 py-2">{item.value ? `$${item.value.toFixed(2)}` : '-'}</td>
                        <td className={`px-4 py-2 ${plClass}`}>
                          {item.profit_loss !== undefined ? `$${item.profit_loss.toFixed(2)}` : '-'}
                          {item.profit_loss_percent !== undefined ? ` (${item.profit_loss_percent.toFixed(2)}%)` : ''}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {/* Кнопки действий при необходимости */}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
