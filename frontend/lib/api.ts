import axios, { AxiosInstance } from 'axios';

// Определяем backend URL в зависимости от окружения
const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('-3000.app.github.dev')) {
      return window.location.origin.replace('-3000.app.github.dev', '-8000.app.github.dev');
    }
  }

  return 'http://localhost:8000';
};

const API_BASE_URL = getBackendUrl();
console.log('🔧 API Base URL:', API_BASE_URL);

// ========== Types ==========

export interface Portfolio {
  id: number;
  name: string;
  type: 'crypto' | 'stocks' | 'etf' | 'metals';
  created_at: string;
}

export interface PortfolioEntry {
  id: number;
  portfolio_id: number;
  symbol: string;
  amount: number;
  purchase_price: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
  date: string;
  portfolio_entry_id?: number;
}

export interface TransactionWithPL extends Transaction {
  current_price: number | null;
  invested: number;
  current_value: number | null;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
}

export interface PortfolioItemSummary {
  symbol: string;
  amount: number;
  avg_purchase_price: number;
  current_price: number | null;
  total_value: number | null;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
  transactions: TransactionWithPL[];
}

export interface PortfolioSummary {
  portfolio: Portfolio;
  items: PortfolioItemSummary[];
  total_invested: number;
  total_current_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
}

export interface BudgetCategory {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
}

export interface BudgetTransaction {
  id: number;
  category_id: number;
  amount: number;
  description: string;
  date: string;
  category?: BudgetCategory;
}

export interface BudgetSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  transactions: BudgetTransaction[];
  categories: BudgetCategory[];
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error('Network error - backend may not be running on', API_BASE_URL);
          error.message = 'Не удается подключиться к серверу.';
        }
        return Promise.reject(error);
      }
    );
  }

  // ========== Auth ==========

  async register(email: string, password: string) {
    const response = await this.client.post('/register', { email, password });
    return response.data;
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await this.client.post('/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/me');
    return response.data;
  }

  // ========== Portfolios ==========

  async getPortfolios(): Promise<Portfolio[]> {
    const response = await this.client.get('/portfolios');
    return response.data;
  }

  async createPortfolio(name: string, type: string): Promise<Portfolio> {
    const response = await this.client.post('/portfolios', { name, type });
    return response.data;
  }

  async deletePortfolio(id: number) {
    const response = await this.client.delete(`/portfolios/${id}`);
    return response.data;
  }

  async getPortfolioSummary(portfolioId: number): Promise<PortfolioSummary> {
    const response = await this.client.get(`/portfolios/${portfolioId}/summary`);
    return response.data;
  }

  // ========== Portfolio Entries ==========

  async getPortfolioEntries(portfolioId: number): Promise<PortfolioEntry[]> {
    const response = await this.client.get(`/portfolios/${portfolioId}/entries`);
    return response.data;
  }

  async addPortfolioEntry(portfolioId: number, data: {
    symbol: string;
    amount: number;
    purchase_price: number;
  }): Promise<PortfolioEntry> {
    const response = await this.client.post(`/portfolios/${portfolioId}/entries`, data);
    return response.data;
  }

  async deletePortfolioEntry(portfolioId: number, entryId: number) {
    const response = await this.client.delete(`/portfolios/${portfolioId}/entries/${entryId}`);
    return response.data;
  }

  // ========== Transactions ==========

  async getPortfolioTransactions(portfolioId: number): Promise<Transaction[]> {
    const response = await this.client.get(`/portfolios/${portfolioId}/transactions`);
    return response.data;
  }

  async createTransaction(portfolioId: number, data: {
    symbol: string;
    quantity: number;
    price: number;
    type: 'buy' | 'sell';
    portfolio_entry_id: number;
  }): Promise<Transaction> {
    const response = await this.client.post(`/portfolios/${portfolioId}/transactions`, data);
    return response.data;
  }

  // ========== Budget ==========

  async getBudgetCategories(): Promise<BudgetCategory[]> {
    const response = await this.client.get('/budget/categories');
    return response.data;
  }

  async createBudgetCategory(data: {
    name: string;
    type: 'income' | 'expense';
    icon: string;
  }): Promise<BudgetCategory> {
    const response = await this.client.post('/budget/categories', data);
    return response.data;
  }

  async deleteBudgetCategory(id: number) {
    const response = await this.client.delete(`/budget/categories/${id}`);
    return response.data;
  }

  async getBudgetTransactions(params?: {
    limit?: number;
    offset?: number;
    category_id?: number;
    type?: 'income' | 'expense';
  }): Promise<BudgetTransaction[]> {
    const response = await this.client.get('/budget/transactions', { params });
    return response.data;
  }

  async createBudgetTransaction(data: {
    category_id: number;
    amount: number;
    description?: string;
    date?: string;
  }): Promise<BudgetTransaction> {
    const response = await this.client.post('/budget/transactions', data);
    return response.data;
  }

  async deleteBudgetTransaction(id: number) {
    const response = await this.client.delete(`/budget/transactions/${id}`);
    return response.data;
  }

  async getBudgetSummary(period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<BudgetSummary> {
    const response = await this.client.get('/budget/summary', { params: { period } });
    return response.data;
  }
}

export const apiClient = new ApiClient();

// ========== CoinGecko Market Data ==========

export type CoinGeckoMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
};

export async function fetchTopMarkets(perPage: number = 10): Promise<CoinGeckoMarket[]> {
  const url = 'https://api.coingecko.com/api/v3/coins/markets';
  const params = {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: String(perPage),
    page: '1',
    price_change_percentage: '24h',
    sparkline: 'false',
  };

  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${url}?${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load markets');
  return (await res.json()) as CoinGeckoMarket[];
}