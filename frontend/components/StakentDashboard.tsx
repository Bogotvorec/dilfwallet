import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Coins, Server, Calculator, Database, Zap, TrendingUp, Settings, Bell, Search, ExternalLink, Copy, RefreshCw, BarChart3, Info, ChevronDown, ArrowUpRight, Plus } from 'lucide-react';

type SparklineProps = { data: number[]; positive: boolean };
const Sparkline = ({ data, positive }: SparklineProps) => (
  <svg width="140" height="60" className="inline-block">
    <defs>
      <linearGradient id={`gradient-${positive}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={positive ? '#8b5cf6' : '#ef4444'} stopOpacity="0.3" />
        <stop offset="100%" stopColor={positive ? '#8b5cf6' : '#ef4444'} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d={`M 0 ${60 - (data[0] / Math.max(...data)) * 50} ${data.map((v, i) => `L ${(i / (data.length - 1)) * 140} ${60 - (v / Math.max(...data)) * 50}`).join(' ')} L 140 60 L 0 60 Z`}
      fill={`url(#gradient-${positive})`}
    />
    <polyline
      fill="none"
      stroke={positive ? '#8b5cf6' : '#ef4444'}
      strokeWidth="2"
      points={data.map((v, i) => `${(i / (data.length - 1)) * 140},${60 - (v / Math.max(...data)) * 50}`).join(' ')}
    />
  </svg>
);

const StakentDashboard = () => {

  const topAssets = [
    {
      name: 'Ethereum (ETH)',
      icon: '⟠',
      type: 'Proof of Stake',
      reward: '13.62%',
      change: '+6.26%',
      chartData: [20, 25, 22, 30, 35, 32, 40, 45, 42, 48],
      color: 'from-purple-500 to-purple-600',
      trend: '+$2,956'
    },
    {
      name: 'BNB Chain',
      icon: '◆',
      type: 'Proof of Stake',
      reward: '12.72%',
      change: '+6.67%',
      chartData: [15, 18, 25, 22, 28, 35, 38, 42, 45, 50],
      color: 'from-yellow-500 to-orange-500',
      trend: '+$2,009'
    },
    {
      name: 'Polygon (Matic)',
      icon: '⬡',
      type: 'Proof of Stake',
      reward: '6.29%',
      change: '-1.89%',
      chartData: [45, 48, 42, 40, 35, 32, 30, 28, 25, 22],
      color: 'from-purple-600 to-pink-600',
      trend: '-$0,987',
      negative: true
    }
  ];

  const activeStakings = [
    { name: 'Asset Ethereum', symbol: 'ETH', amount: '$7,699.00', icon: '⟠', color: 'bg-purple-500' },
    { name: 'Asset Avalanche', symbol: 'AVAX', amount: '$1,340.00', icon: '🔺', color: 'bg-red-500' },
    { name: 'Asset Polygon (Matic)', symbol: 'MATIC', amount: '$540.00', icon: '⬡', color: 'bg-purple-600' },
    { name: 'Asset Solana', symbol: 'SOL', amount: '$980.00', icon: '◎', color: 'bg-gray-600' }
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/50 border-r border-slate-800/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <div className="text-xl">⚡</div>
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1">
                DILF Wallet <span className="text-xs text-purple-400">®</span>
              </div>
              <div className="text-xs text-slate-400">Top Staking Assets</div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <nav className="space-y-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50 text-white border border-slate-700/50">
              <LayoutDashboard className="w-5 h-5" />
              Finance
            </Link>
            <Link href="/crypto" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30">
              <Coins className="w-5 h-5" />
              Crypto
            </Link>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30">
              <Server className="w-5 h-5" />
              Staking Providers
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30">
              <Calculator className="w-5 h-5" />
              Staking Calculator
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30">
              <Database className="w-5 h-5" />
              Data API
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
            
            <div className="pt-4">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30">
                <Zap className="w-5 h-5" />
                Liquid Staking
                <span className="ml-auto px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">Beta</span>
              </a>
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30 mt-1">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5" />
                  Active Staking
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded">6</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <div className="mt-2 space-y-1 pl-3">
                {activeStakings.map((stake, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 cursor-pointer">
                    <div className={`${stake.color} w-6 h-6 rounded-full flex items-center justify-center text-sm`}>
                      {stake.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500">{stake.name}</div>
                      <div className="text-xs font-semibold text-slate-300">{stake.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/50">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-medium transition">
            <Zap className="w-5 h-5" />
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold">Activate Super</div>
              <div className="text-xs text-purple-200">Unlock all features on Stakent</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://via.placeholder.com/32" alt="User" className="w-8 h-8 rounded-lg" />
              <div className="pr-3">
                <div className="text-sm font-semibold text-white">Ryan Crawford</div>
                <div className="text-xs text-slate-400">Investor #2962</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium flex items-center gap-2 transition">
              <Plus className="w-4 h-4" />
              Deposit
            </button>
            <button className="p-2.5 hover:bg-slate-800/50 rounded-xl transition">
              <Bell className="w-5 h-5 text-slate-400" />
            </button>
            <button className="px-4 py-2.5 hover:bg-slate-800/50 rounded-xl font-medium text-slate-300 flex items-center gap-2 transition">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="p-2.5 hover:bg-slate-800/50 rounded-xl transition">
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </button>
            <button className="px-4 py-2.5 hover:bg-slate-800/50 rounded-xl font-medium text-slate-300 flex items-center gap-2 transition">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Tabs */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-slate-800/30 rounded-xl p-1">
              <button className="px-5 py-2 bg-slate-700/50 text-white rounded-lg font-medium text-sm">Staking</button>
              <button className="px-5 py-2 text-slate-400 hover:text-white rounded-lg font-medium text-sm">Stablecoin</button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Info className="w-4 h-4" />
              Recommended coins for 24 hours
              <span className="px-2 py-1 bg-slate-800/50 rounded text-slate-300">3 Assets</span>
            </div>
          </div>

          {/* Page Title */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Top Staking Assets</h1>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm font-medium flex items-center gap-2">
                <span>24H</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm font-medium flex items-center gap-2">
                <span>Proof of Stake</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm font-medium flex items-center gap-2">
                <span>Desc</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Top Assets Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {topAssets.map((asset, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition backdrop-blur-xl">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${asset.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {asset.icon}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">{asset.type}</div>
                      <div className="font-semibold text-white">{asset.name}</div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-800/50 rounded-lg transition">
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-slate-400 mb-1">Reward Rate</div>
                  <div className="flex items-end gap-3">
                    <div className="text-3xl font-bold">{asset.reward}</div>
                    <div className={`flex items-center gap-1 text-sm font-semibold mb-1 ${asset.negative ? 'text-red-500' : 'text-green-500'}`}>
                      <TrendingUp className={`w-4 h-4 ${asset.negative ? 'rotate-180' : ''}`} />
                      {asset.change}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Sparkline data={asset.chartData} positive={!asset.negative} />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${asset.negative ? 'text-red-400' : 'text-purple-400'}`}>
                    {asset.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Active Staking Details */}
            <div className="col-span-2 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Your active stakings</h2>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-800/50 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="p-2 hover:bg-slate-800/50 rounded-lg">
                      <Info className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="p-2 hover:bg-slate-800/50 rounded-lg">
                      <RefreshCw className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="p-2 hover:bg-slate-800/50 rounded-lg">
                      <Settings className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800/30 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-slate-400">Last Update – 45 minutes ago</div>
                      <Info className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-slate-700/50 rounded-lg">
                        <Copy className="w-4 h-4 text-slate-400" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-700/50 rounded-lg">
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </button>
                      <button className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm font-medium">
                        View Profile
                        <ExternalLink className="w-3 h-3 inline ml-1" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-2xl font-bold">Stake Avalance (AVAX)</h3>
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">🔺</div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm text-slate-400 mb-2">Current Reward Balance, AVAX</div>
                    <div className="flex items-end gap-4">
                      <div className="text-5xl font-bold">31.39686</div>
                      <div className="flex gap-2 mb-2">
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-sm">Upgrade</button>
                        <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-medium text-sm">Unstake</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-slate-400">Momentum</div>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-xs text-slate-500 mb-2">Growth dynamics</div>
                    <div className="mb-2">
                      <div className="text-xs text-slate-500 mb-1">Staked Tokens Trend</div>
                      <span className="px-2 py-1 bg-slate-700/50 rounded text-xs">24H</span>
                    </div>
                    <div className="text-3xl font-bold">-0.82%</div>
                  </div>

                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-slate-400">General</div>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-xs text-slate-500 mb-2">Overview</div>
                    <div className="mb-2">
                      <div className="text-xs text-slate-500 mb-1">Price</div>
                      <span className="px-2 py-1 bg-slate-700/50 rounded text-xs">24H</span>
                    </div>
                    <div className="text-3xl font-bold">$41.99</div>
                    <div className="text-xs text-red-500 mt-1">-1.09% ↓</div>
                  </div>

                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-slate-400">Risk</div>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-xs text-slate-500 mb-2">Risk assessment</div>
                    <div className="mb-2">
                      <div className="text-xs text-slate-500 mb-1">Staking Ratio</div>
                      <span className="px-2 py-1 bg-slate-700/50 rounded text-xs">24H</span>
                    </div>
                    <div className="text-3xl font-bold">60.6%</div>
                  </div>

                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-slate-400">Reward</div>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-xs text-slate-500 mb-4">Expected profit</div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Reward Rate</div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold">2.23%</div>
                          <div className="text-xs text-slate-500">24H Ago</div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold">1.46%</div>
                          <div className="text-xs text-slate-500">48H Ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-semibold mb-4">Investment Period</h3>
                <div className="text-sm text-slate-400 mb-4">(Contribution Period Months)</div>
                <div className="flex items-center gap-4">
                  <button className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-medium text-sm">4 Month</button>
                  <button className="px-6 py-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/50 rounded-lg font-medium text-sm">6 Month</button>
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <div className="h-px flex-1 bg-slate-700"></div>
                    <button className="w-8 h-8 bg-slate-700/50 hover:bg-slate-700 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </button>
                    <div className="h-px flex-1 bg-slate-700"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 border border-purple-800/30 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">⚡</div>
                    <span className="font-bold">DILF Wallet <span className="text-xs text-purple-400">®</span></span>
                  </div>
                  <button className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium">New</button>
                </div>

                <h3 className="text-2xl font-bold mb-2">Liquid Staking Portfolio</h3>
                <p className="text-sm text-slate-400 mb-6">
                  An all-in-one portfolio that helps you make smarter investments into <span className="text-purple-400">Ethereum Liquid Staking</span>
                </p>

                <div className="space-y-3">
                  <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium flex items-center justify-center gap-2">
                    Connect with Wallet 👛
                  </button>
                  <button className="w-full py-3 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/30 rounded-xl font-medium flex items-center justify-center gap-2">
                    Enter a Wallet Address 🔒
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total Staked</span>
                    <span className="text-lg font-bold">$10,559.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total Rewards</span>
                    <span className="text-lg font-bold text-green-500">$1,234.56</span>
                  </div>
                  <div className="flex justify_between items-center">
                    <span className="text-sm text-slate-400">APY Average</span>
                    <span className="text-lg font-bold">10.87%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakentDashboard;


