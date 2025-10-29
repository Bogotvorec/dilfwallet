import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, CreditCard, Receipt, Wallet, TrendingUp, Vault, FileText, Gift, Settings, HelpCircle, ChevronDown, Plus, Send, FileDown, Filter, ArrowUpDown, MoreHorizontal, Calendar, ArrowUp, ArrowDown, Coins } from 'lucide-react';
import { fetchTopMarkets, type CoinGeckoMarket } from '@/lib/api';

const SequenceDashboard = () => {
  const [proMode, setProMode] = useState(true);
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');

  const cashFlowData = [
    { date: '18 Oct', income: 4200, expense: -2800 },
    { date: '20 Oct', income: 5500, expense: -3200 },
    { date: '22 Oct', income: 4800, expense: -4500 },
    { date: '25 Oct', income: 3900, expense: -2100 },
    { date: '27 Oct', income: 4100, expense: -2600 },
    { date: '29 Oct', income: 6500, expense: -3100 },
    { date: '31 Oct', income: 7200, expense: -2900 },
    { date: '2 Nov', income: 6800, expense: -4100 },
    { date: '5 Nov', income: 5900, expense: -2700 },
    { date: '7 Nov', income: 5200, expense: -3400 },
    { date: '9 Nov', income: 8100, expense: -2500 },
    { date: '12 Nov', income: 7500, expense: -3800 },
  ];

  const recentActivity = [
    { name: 'Theo Lawrence', amount: '€ 500,00', usd: '120 USD', date: 'Oct 18, 2024', status: 'Success', method: 'Credit Card', last4: '3560', type: 'add' as const },
    { name: 'Amy March', amount: '- € 250,00', usd: '80 USD', date: 'May 24, 2024', status: 'Pending', method: 'Bank Transfer', last4: '2285', type: 'subtract' as const },
    { name: 'Sarah Chen', amount: '€ 1.200,00', usd: '340 USD', date: 'Nov 15, 2024', status: 'Success', method: 'Credit Card', last4: '4521', type: 'add' as const },
    { name: 'Mike Johnson', amount: '- € 89,50', usd: '25 USD', date: 'Nov 14, 2024', status: 'Success', method: 'Debit Card', last4: '7812', type: 'subtract' as const },
  ];

  const maxValue = Math.max(...cashFlowData.flatMap(d => [Math.abs(d.income), Math.abs(d.expense)]));

  const [markets, setMarkets] = useState<CoinGeckoMarket[] | null>(null);
  const [marketsError, setMarketsError] = useState<string | null>(null);
  useEffect(() => {
    fetchTopMarkets(10)
      .then(setMarkets)
      .catch((e) => setMarketsError(e.message || 'Failed to load markets'));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-white rounded-sm"></div>
                <div className="bg-white rounded-sm"></div>
                <div className="bg-white rounded-sm"></div>
                <div className="bg-white rounded-sm"></div>
              </div>
            </div>
            <span className="text-xl font-semibold text-gray-900">DILF Wallet</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">General</div>
            <nav className="space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-50 text-teal-700 font-medium">
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link href="/crypto" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                <Coins className="w-5 h-5" />
                Crypto
              </Link>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                <Send className="w-5 h-5" />
                Payment
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                <Receipt className="w-5 h-5" />
                Transaction
              </a>
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  Cards
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
            </nav>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Support</div>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                <TrendingUp className="w-5 h-5" />
                Capital
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                <Vault className="w-5 h-5" />
                Vaults
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                <FileText className="w-5 h-5" />
                Reports
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                <Gift className="w-5 h-5" />
                Earn
                <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">€ 150</span>
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
            <Settings className="w-5 h-5" />
            Settings
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
            <HelpCircle className="w-5 h-5" />
            Help
          </a>
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center">⚡</div>
              Pro Mode
            </div>
            <button 
              onClick={() => setProMode(!proMode)}
              className={`relative w-11 h-6 rounded-full transition ${proMode ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${proMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
              YA
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">Young Alaska</div>
              <div className="text-xs text-gray-500">alaskayng@gmail.com</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
              <kbd className="absolute right-3 top-2 px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-500">⌘ + F</kbd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <Calendar className="w-4 h-4" />
              18 Oct 2024 - 18 Nov 2024
            </button>
            <button className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Last 30 days</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">🔄</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">📊</button>
          </div>
        </div>

        <div className="p-8">
          {/* Total Balance Card */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-teal-100 mb-2">Total Balance</div>
                <div className="text-5xl font-bold mb-2">€ 320.845,20</div>
                <div className="flex items-center gap-2 text-teal-100">
                  <span className="text-lg font-semibold text-emerald-300">15,8%</span>
                  <ArrowUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium flex items-center gap-2 transition">
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                <button className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 rounded-xl font-medium flex items-center gap-2 transition">
                  <Send className="w-4 h-4" />
                  Send
                </button>
                <button className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 rounded-xl font-medium flex items-center gap-2 transition">
                  <FileDown className="w-4 h-4" />
                  Request
                </button>
                <button className="p-2.5 bg-teal-700 hover:bg-teal-800 rounded-xl transition">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-8">
            {/* Cash Flow Chart */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Cash Flow</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('weekly')}
                    className={`px-3 py-1.5 text-sm rounded-lg ${viewMode === 'weekly' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Weekly
                  </button>
                  <button 
                    onClick={() => setViewMode('daily')}
                    className={`px-3 py-1.5 text-sm rounded-lg ${viewMode === 'daily' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Daily
                  </button>
                  <button className="p-1.5 hover:bg-gray-50 rounded-lg">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="relative h-64">
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
                  <span>€ 6.5K</span>
                  <span>€ 0</span>
                  <span>€ 3K</span>
                </div>
                <div className="ml-12 h-full flex items-end justify-between gap-1">
                  {cashFlowData.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center gap-0.5">
                        <div 
                          className="w-full bg-teal-600 rounded-t"
                          style={{ height: `${(item.income / maxValue) * 120}px` }}
                        ></div>
                        <div className="w-px h-8 border-l-2 border-dashed border-gray-300"></div>
                        <div 
                          className="w-full bg-emerald-400 rounded-b"
                          style={{ height: `${(Math.abs(item.expense) / maxValue) * 120}px` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="ml-12 mt-2 flex justify-between text-xs text-gray-400">
                  <span>18 Oct</span>
                  <span>25 Oct</span>
                  <span>2 Nov</span>
                  <span>9 Nov</span>
                </div>
              </div>
            </div>

            {/* Income & Expense Cards */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <ArrowDown className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Income</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">€ 12.378,20</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">45,0%</span>
                  <ArrowUp className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <ArrowUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Expense</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">€ 5.788,21</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-red-600">12,5%</span>
                  <ArrowDown className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Business account</div>
                  <div className="text-xs text-gray-400">Last 30 days</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">€ 8.672,20</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-600">16,0%</span>
                <ArrowUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xs text-gray-400 mt-2">vs. 7.120,14 Last Period</div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Total Saving</div>
                  <div className="text-xs text-gray-400">Last 30 days</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">€ 3.765,35</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-red-600">8,2%</span>
                <ArrowDown className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-xs text-gray-400 mt-2">vs. 4.116,50 Last Period</div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Tax Reserve</div>
                  <div className="text-xs text-gray-400">Last 30 days</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">€ 14.376,16</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-600">35,2%</span>
                <ArrowUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xs text-gray-400 mt-2">vs. 10.236,46 Last Period</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-teal-600">📊</div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                    <ArrowUpDown className="w-4 h-4" />
                    Sort
                  </button>
                  <button className="p-1.5 hover:bg-gray-50 rounded-lg">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-1">
                  <div className="grid grid-cols-4 gap-4 pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>TYPE</div>
                    <div>AMOUNT</div>
                    <div>STATUS</div>
                    <div>METHOD</div>
                  </div>
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-4 py-4 border-t border-gray-100 hover:bg-gray-50 rounded-lg px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${activity.type === 'add' ? 'bg-emerald-100' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
                          {activity.type === 'add' ? <Plus className="w-5 h-5 text-emerald-600" /> : <ArrowUp className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{activity.name}</div>
                          <div className="text-xs text-gray-400">Add • {activity.date}</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{activity.amount}</div>
                        <div className="text-xs text-gray-400">{activity.usd}</div>
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${activity.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {activity.status}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{activity.method}</div>
                        <div className="text-xs text-gray-400">•••• {activity.last4}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Coins (live) */}
            <div className="bg-white rounded-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Top Coins</h3>
                </div>
              </div>
              <div className="p-6">
                {!markets && !marketsError && (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
                {marketsError && (
                  <div className="text-sm text-red-600">{marketsError}</div>
                )}
                {markets && (
                  <div className="space-y-3">
                    {markets.map((m) => (
                      <div key={m.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.image} alt={m.symbol} className="w-6 h-6 rounded-full" />
                          <div className="truncate">
                            <div className="text-sm font-medium text-gray-900 truncate">{m.name}</div>
                            <div className="text-xs text-gray-500 uppercase">{m.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">${m.current_price.toLocaleString()}</div>
                          <div className={`text-xs font-medium ${m.price_change_percentage_24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {m.price_change_percentage_24h >= 0 ? '+' : ''}{m.price_change_percentage_24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceDashboard;


