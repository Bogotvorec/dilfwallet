import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';import { useState } from "react";

import Layout from '@/components/Layout';

import { useAuth } from '@/lib/auth';import Layout from '@/components/Layout';import axios from "axios";

import { apiClient } from '@/lib/api';

import { useAuth } from '@/lib/auth';

interface PortfolioItem {

  id: number;import { apiClient } from '@/lib/api';export default function PortfolioPage() {

  symbol: string;

  amount: number;import { useRouter } from 'next/router';  const [symbol, setSymbol] = useState("");

  purchase_price: number;

  current_price?: number;  const [amount, setAmount] = useState("");

  value?: number;

  profit_loss?: number;interface PortfolioItem {  const [price, setPrice] = useState("");

  profit_loss_percent?: number;

}  symbol: string;  const [message, setMessage] = useState("");



interface PortfolioSummary {  amount: number;  const [token, setToken] = useState("");

  total_value: number;

  total_invested: number;  purchase_price: number;

  total_profit_loss: number;

  total_profit_loss_percent: number;  current_price?: number;  const handleAdd = async () => {

  items: PortfolioItem[];

}  total_value?: number;    try {



export default function PortfolioPage() {  profit_loss?: number;      const res = await axios.post(

  const { user, loading: authLoading } = useAuth();

  const [summary, setSummary] = useState<PortfolioSummary | null>(null);  profit_loss_percentage?: number;        "http://localhost:8000/portfolio", // или твой backend URL

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');}        {

  

  // Form state          symbol,

  const [showAddForm, setShowAddForm] = useState(false);

  const [symbol, setSymbol] = useState('');interface PortfolioSummary {          amount: parseFloat(amount),

  const [amount, setAmount] = useState('');

  const [purchasePrice, setPurchasePrice] = useState('');  items: PortfolioItem[];          purchase_price: parseFloat(price),

  const [submitting, setSubmitting] = useState(false);

  total_invested: number;        },

  useEffect(() => {

    if (!authLoading && user) {  total_current_value: number;        {

      loadPortfolio();

    }  total_profit_loss: number;          headers: {

  }, [user, authLoading]);

  total_profit_loss_percentage: number;            Authorization: `Bearer ${eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMDMwMDE0Zi05NmNhLTQ3ZDUtOGUxYS01MmJlOWUzZTU1ZjgiLCJleHAiOjE3NTM2OTYxNjR9.V-pPXqRuwE5Nwj-Xh0EDqlbavJCEhukyIYEQqjeGGWs}`,

  const loadPortfolio = async () => {

    try {}          },

      setLoading(true);

      const data = await apiClient.getPortfolioSummary();        }

      setSummary(data);

      setError('');export default function PortfolioPage() {      );

    } catch (err: any) {

      console.error('Failed to load portfolio:', err);  const { isAuthenticated, loading: authLoading } = useAuth();      setMessage("Добавлено успешно!");

      setError(err.message || 'Не удалось загрузить портфолио');

    } finally {  const router = useRouter();    } catch (err: any) {

      setLoading(false);

    }  const [summary, setSummary] = useState<PortfolioSummary | null>(null);      setMessage("Ошибка: " + err.response?.data?.detail || "Неизвестно");

  };

  const [loading, setLoading] = useState(true);    }

  const handleAddAsset = async (e: React.FormEvent) => {

    e.preventDefault();  const [error, setError] = useState('');  };

    setSubmitting(true);

    setError('');  const [showAddForm, setShowAddForm] = useState(false);



    try {  const [formData, setFormData] = useState({  return (

      await apiClient.addPortfolioEntry({

        symbol: symbol.toUpperCase(),    symbol: '',    <div style={{ maxWidth: 400, margin: "40px auto" }}>

        amount: parseFloat(amount),

        purchase_price: parseFloat(purchasePrice),    amount: '',      <h2>Добавить крипто-актив</h2>

      });

    purchase_price: '',

      // Reset form

      setSymbol('');  });      <input

      setAmount('');

      setPurchasePrice('');        type="text"

      setShowAddForm(false);

  useEffect(() => {        placeholder="JWT Token"

      // Reload portfolio

      await loadPortfolio();    if (!authLoading && !isAuthenticated) {        value={token}

    } catch (err: any) {

      setError(err.response?.data?.detail || err.message || 'Ошибка при добавлении актива');      router.push('/login');        onChange={(e) => setToken(e.target.value)}

    } finally {

      setSubmitting(false);    }        style={{ width: "100%", marginBottom: 8 }}

    }

  };  }, [authLoading, isAuthenticated, router]);      />



  const handleDelete = async (id: number) => {

    if (!confirm('Вы уверены, что хотите удалить этот актив?')) {

      return;  useEffect(() => {      <input

    }

    if (isAuthenticated) {        type="text"

    try {

      await apiClient.deletePortfolioEntry(id);      loadPortfolio();        placeholder="Symbol (например BTC)"

      await loadPortfolio();

    } catch (err: any) {    }        value={symbol}

      setError(err.response?.data?.detail || err.message || 'Ошибка при удалении актива');

    }  }, [isAuthenticated]);        onChange={(e) => setSymbol(e.target.value)}

  };

        style={{ width: "100%", marginBottom: 8 }}

  if (authLoading || loading) {

    return (  const loadPortfolio = async () => {      />

      <Layout>

        <div className="flex justify-center items-center min-h-screen">    try {      <input

          <div className="text-xl">Загрузка...</div>

        </div>      setLoading(true);        type="number"

      </Layout>

    );      const data = await apiClient.getPortfolioSummary();        placeholder="Amount"

  }

      setSummary(data);        value={amount}

  return (

    <Layout>    } catch (err: any) {        onChange={(e) => setAmount(e.target.value)}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="md:flex md:items-center md:justify-between mb-8">      setError(err.response?.data?.detail || 'Ошибка загрузки портфолио');        style={{ width: "100%", marginBottom: 8 }}

          <div className="flex-1 min-w-0">

            <h1 className="text-3xl font-bold text-gray-900">Мой портфолио</h1>    } finally {      />

          </div>

          <div className="mt-4 flex md:mt-0 md:ml-4">      setLoading(false);      <input

            <button

              onClick={() => setShowAddForm(!showAddForm)}    }        type="number"

              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"

            >  };        placeholder="Price"

              {showAddForm ? 'Отмена' : '+ Добавить актив'}

            </button>        value={price}

          </div>

        </div>  const handleAddEntry = async (e: React.FormEvent) => {        onChange={(e) => setPrice(e.target.value)}



        {error && (    e.preventDefault();        style={{ width: "100%", marginBottom: 8 }}

          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">

            {error}    try {      />

          </div>

        )}      await apiClient.addPortfolioEntry({      <button onClick={handleAdd}>Добавить</button>



        {/* Add Asset Form */}        symbol: formData.symbol.toUpperCase(),      <p>{message}</p>

        {showAddForm && (

          <div className="mb-8 bg-white shadow rounded-lg p-6">        amount: parseFloat(formData.amount),    </div>

            <h2 className="text-xl font-semibold mb-4">Добавить новый актив</h2>

            <form onSubmit={handleAddAsset} className="space-y-4">        purchase_price: parseFloat(formData.purchase_price),  );

              <div>

                <label className="block text-sm font-medium text-gray-700">      });}

                  Символ (например, BTC, ETH)

                </label>      setFormData({ symbol: '', amount: '', purchase_price: '' });

                <input      setShowAddForm(false);

                  type="text"      loadPortfolio();

                  value={symbol}    } catch (err: any) {

                  onChange={(e) => setSymbol(e.target.value)}      setError(err.response?.data?.detail || 'Ошибка добавления актива');

                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"    }

                  required  };

                />

              </div>  if (authLoading || loading) {

    return (

              <div>      <Layout>

                <label className="block text-sm font-medium text-gray-700">        <div className="flex justify-center items-center h-64">

                  Количество          <div className="text-xl text-gray-600">Загрузка...</div>

                </label>        </div>

                <input      </Layout>

                  type="number"    );

                  step="any"  }

                  value={amount}

                  onChange={(e) => setAmount(e.target.value)}  return (

                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"    <Layout>

                  required      <div className="px-4 sm:px-6 lg:px-8 py-8">

                />        <div className="sm:flex sm:items-center">

              </div>          <div className="sm:flex-auto">

            <h1 className="text-3xl font-semibold text-gray-900">Мой портфель</h1>

              <div>            <p className="mt-2 text-sm text-gray-700">Обзор вашего криптовалютного портфеля</p>

                <label className="block text-sm font-medium text-gray-700">          </div>

                  Цена покупки (USD)          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">

                </label>            <button

                <input              onClick={() => setShowAddForm(!showAddForm)}

                  type="number"              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

                  step="any"            >

                  value={purchasePrice}              {showAddForm ? 'Отмена' : '+ Добавить актив'}

                  onChange={(e) => setPurchasePrice(e.target.value)}            </button>

                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"          </div>

                  required        </div>

                />

              </div>        {error && (

          <div className="mt-4 rounded-md bg-red-50 p-4">

              <button            <p className="text-sm text-red-800">{error}</p>

                type="submit"          </div>

                disabled={submitting}        )}

                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"

              >        {showAddForm && (

                {submitting ? 'Добавление...' : 'Добавить'}          <div className="mt-6 bg-white shadow sm:rounded-lg p-6">

              </button>            <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить новый актив</h3>

            </form>            <form onSubmit={handleAddEntry} className="space-y-4">

          </div>              <div>

        )}                <label className="block text-sm font-medium text-gray-700">

                  Символ (например, BTC, ETH)

        {/* Summary Cards */}                </label>

        {summary && (                <input

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">                  type="text"

            <div className="bg-white overflow-hidden shadow rounded-lg">                  required

              <div className="p-5">                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"

                <div className="flex items-center">                  value={formData.symbol}

                  <div className="flex-1">                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}

                    <div className="text-sm font-medium text-gray-500 truncate">                />

                      Общая стоимость              </div>

                    </div>              <div>

                    <div className="mt-1 text-2xl font-semibold text-gray-900">                <label className="block text-sm font-medium text-gray-700">Количество</label>

                      ${summary.total_value.toFixed(2)}                <input

                    </div>                  type="number"

                  </div>                  step="any"

                </div>                  required

              </div>                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"

            </div>                  value={formData.amount}

                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}

            <div className="bg-white overflow-hidden shadow rounded-lg">                />

              <div className="p-5">              </div>

                <div className="flex items-center">              <div>

                  <div className="flex-1">                <label className="block text-sm font-medium text-gray-700">Цена покупки (USD)</label>

                    <div className="text-sm font-medium text-gray-500 truncate">                <input

                      Вложено                  type="number"

                    </div>                  step="any"

                    <div className="mt-1 text-2xl font-semibold text-gray-900">                  required

                      ${summary.total_invested.toFixed(2)}                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"

                    </div>                  value={formData.purchase_price}

                  </div>                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}

                </div>                />

              </div>              </div>

            </div>              <button

                type="submit"

            <div className="bg-white overflow-hidden shadow rounded-lg">                className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

              <div className="p-5">              >

                <div className="flex items-center">                Добавить

                  <div className="flex-1">              </button>

                    <div className="text-sm font-medium text-gray-500 truncate">            </form>

                      Прибыль/Убыток          </div>

                    </div>        )}

                    <div className={`mt-1 text-2xl font-semibold ${

                      summary.total_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'        {summary && (

                    }`}>          <>

                      ${summary.total_profit_loss.toFixed(2)}            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    </div>              <div className="bg-white overflow-hidden shadow rounded-lg">

                  </div>                <div className="p-5">

                </div>                  <dt className="text-sm font-medium text-gray-500 truncate">Всего инвестировано</dt>

              </div>                  <dd className="mt-1 text-2xl font-semibold text-gray-900">${summary.total_invested.toFixed(2)}</dd>

            </div>                </div>

              </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">              <div className="bg-white overflow-hidden shadow rounded-lg">

              <div className="p-5">                <div className="p-5">

                <div className="flex items-center">                  <dt className="text-sm font-medium text-gray-500 truncate">Текущая стоимость</dt>

                  <div className="flex-1">                  <dd className="mt-1 text-2xl font-semibold text-gray-900">${summary.total_current_value.toFixed(2)}</dd>

                    <div className="text-sm font-medium text-gray-500 truncate">                </div>

                      Процент              </div>

                    </div>              <div className="bg-white overflow-hidden shadow rounded-lg">

                    <div className={`mt-1 text-2xl font-semibold ${                <div className="p-5">

                      summary.total_profit_loss_percent >= 0 ? 'text-green-600' : 'text-red-600'                  <dt className="text-sm font-medium text-gray-500 truncate">P&L</dt>

                    }`}>                  <dd className={`mt-1 text-2xl font-semibold ${summary.total_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>

                      {summary.total_profit_loss_percent >= 0 ? '+' : ''}                    ${summary.total_profit_loss.toFixed(2)}

                      {summary.total_profit_loss_percent.toFixed(2)}%                  </dd>

                    </div>                </div>

                  </div>              </div>

                </div>              <div className="bg-white overflow-hidden shadow rounded-lg">

              </div>                <div className="p-5">

            </div>                  <dt className="text-sm font-medium text-gray-500 truncate">P&L %</dt>

          </div>                  <dd className={`mt-1 text-2xl font-semibold ${summary.total_profit_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>

        )}                    {summary.total_profit_loss_percentage.toFixed(2)}%

                  </dd>

        {/* Portfolio Table */}                </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">              </div>

          <div className="px-4 py-5 sm:px-6">            </div>

            <h2 className="text-lg font-medium text-gray-900">Активы</h2>

          </div>            <div className="mt-8 shadow ring-1 ring-black ring-opacity-5 md:rounded-lg overflow-hidden">

          <div className="border-t border-gray-200">              <table className="min-w-full divide-y divide-gray-300">

            {summary && summary.items.length > 0 ? (                <thead className="bg-gray-50">

              <table className="min-w-full divide-y divide-gray-200">                  <tr>

                <thead className="bg-gray-50">                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Актив</th>

                  <tr>                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Количество</th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Цена покупки</th>

                      Символ                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Текущая цена</th>

                    </th>                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Стоимость</th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">P&L</th>

                      Количество                  </tr>

                    </th>                </thead>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                <tbody className="divide-y divide-gray-200 bg-white">

                      Цена покупки                  {summary.items.map((item, idx) => (

                    </th>                    <tr key={idx}>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{item.symbol}</td>

                      Текущая цена                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.amount.toFixed(4)}</td>

                    </th>                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${item.purchase_price.toFixed(2)}</td>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.current_price ? `$${item.current_price.toFixed(2)}` : 'N/A'}</td>

                      Стоимость                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.total_value ? `$${item.total_value.toFixed(2)}` : 'N/A'}</td>

                    </th>                      <td className="whitespace-nowrap px-3 py-4 text-sm">

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                        {item.profit_loss !== undefined && item.profit_loss !== null ? (

                      P/L                          <span className={item.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}>

                    </th>                            ${item.profit_loss.toFixed(2)} ({item.profit_loss_percentage?.toFixed(2)}%)

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                          </span>

                      Действия                        ) : ('N/A')}

                    </th>                      </td>

                  </tr>                    </tr>

                </thead>                  ))}

                <tbody className="bg-white divide-y divide-gray-200">                </tbody>

                  {summary.items.map((item) => (              </table>

                    <tr key={item.id}>            </div>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">          </>

                        {item.symbol}        )}

                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">        {summary && summary.items.length === 0 && (

                        {item.amount}          <div className="mt-8 text-center py-12 bg-white shadow rounded-lg">

                      </td>            <p className="text-gray-500">У вас пока нет активов в портфеле. Нажмите &quot;Добавить актив&quot; чтобы начать.</p>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">          </div>

                        ${item.purchase_price.toFixed(2)}        )}

                      </td>      </div>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">    </Layout>

                        ${item.current_price?.toFixed(2) || 'N/A'}  );

                      </td>}

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${item.value?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={item.profit_loss && item.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.profit_loss !== undefined && item.profit_loss >= 0 ? '+' : ''}
                          ${item.profit_loss?.toFixed(2) || 'N/A'} 
                          ({item.profit_loss_percent !== undefined && item.profit_loss_percent >= 0 ? '+' : ''}
                          {item.profit_loss_percent?.toFixed(2) || 'N/A'}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <p>У вас пока нет активов в портфолио.</p>
                <p className="mt-2">Нажмите "Добавить актив" чтобы начать.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
